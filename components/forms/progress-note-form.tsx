'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, FileText, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GeneratedDocumentCard } from '@/components/documents/generated-document-card'
import { progressNoteSchema, ProgressNoteFormValues } from '@/lib/validations'
import { toast } from '@/hooks/use-toast'

const DRAFT_KEY = 'progress-note-draft'
const SESSION_KEY = 'progress-note-session'

interface SessionData {
  formValues: ProgressNoteFormValues
  generatedContent: string
  isSaved: boolean
  savedDocId: string | null
}

export function ProgressNoteForm() {
  const [generatedContent, setGeneratedContent] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [savedDocId, setSavedDocId] = useState<string | null>(null)
  const [currentValues, setCurrentValues] = useState<ProgressNoteFormValues | null>(null)
  const [hasDraft, setHasDraft] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    watch,
  } = useForm<ProgressNoteFormValues>({
    resolver: zodResolver(progressNoteSchema),
    defaultValues: {
      shiftDate: new Date().toISOString().split('T')[0],
    },
  })

  // On mount: restore full session first (generated output + form),
  // then fall back to draft (raw notes only) if no session exists
  useEffect(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY)
      if (session) {
        const parsed = JSON.parse(session) as SessionData
        setValue('participantName', parsed.formValues.participantName)
        setValue('shiftDate', parsed.formValues.shiftDate)
        setValue('rawNotes', parsed.formValues.rawNotes)
        setCurrentValues(parsed.formValues)
        setGeneratedContent(parsed.generatedContent)
        setIsSaved(parsed.isSaved)
        setSavedDocId(parsed.savedDocId)
        return // session restored — skip draft restore
      }

      const draft = localStorage.getItem(DRAFT_KEY)
      if (draft) {
        const parsed = JSON.parse(draft) as Partial<ProgressNoteFormValues>
        if (parsed.participantName) setValue('participantName', parsed.participantName)
        if (parsed.shiftDate) setValue('shiftDate', parsed.shiftDate)
        if (parsed.rawNotes) setValue('rawNotes', parsed.rawNotes)
        if (parsed.rawNotes || parsed.participantName) setHasDraft(true)
      }
    } catch {
      // ignore malformed data
    }
  }, [setValue])

  // Save raw notes draft on every keystroke
  const watchedValues = watch()
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(watchedValues))
    } catch {
      // ignore storage errors
    }
  }, [watchedValues])

  // Save full session whenever generated content or save state changes
  useEffect(() => {
    if (!generatedContent || !currentValues) return
    try {
      const session: SessionData = {
        formValues: currentValues,
        generatedContent,
        isSaved,
        savedDocId,
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } catch {
      // ignore storage errors
    }
  }, [generatedContent, currentValues, isSaved, savedDocId])

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY)
    setHasDraft(false)
  }

  const clearSession = () => {
    localStorage.removeItem(SESSION_KEY)
  }

  const handleContentChange = (newContent: string) => {
    setGeneratedContent(newContent)
    if (isSaved) setIsSaved(false)
  }

  const saveToDatabase = async (
    data: ProgressNoteFormValues,
    output: string,
    existingId?: string | null
  ): Promise<string> => {
    if (existingId) {
      const response = await fetch(`/api/documents/${existingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generatedOutput: output }),
      })
      const result = await response.json()
      if (response.ok && result.success) return existingId
      throw new Error(result.error || 'Failed to update document')
    }

    const response = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'progress-note',
        participantName: data.participantName,
        date: data.shiftDate,
        rawInput: data.rawNotes,
        generatedOutput: output,
      }),
    })
    const result = await response.json()
    if (response.ok && result.success) return result.data._id as string
    throw new Error(result.error || 'Failed to save document')
  }

  const generateNote = async (data: ProgressNoteFormValues) => {
    setIsGenerating(true)
    setGeneratedContent(null)
    setIsSaved(false)
    setCurrentValues(data)
    clearSession()

    try {
      const response = await fetch('/api/generate/progress-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to generate progress note')

      setGeneratedContent(result.data.generatedOutput)
      toast({
        title: 'Progress note generated',
        description: 'Review the note and click Save when ready.',
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!generatedContent || !currentValues) return
    setIsSaving(true)
    try {
      const docId = await saveToDatabase(currentValues, generatedContent, savedDocId)
      setSavedDocId(docId)
      setIsSaved(true)
      clearDraft()
      clearSession()
      toast({
        title: 'Document saved',
        description: 'Progress note saved to your history.',
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRegenerate = () => {
    const values = getValues()
    generateNote(values)
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <CardTitle>Progress Note Generator</CardTitle>
              <CardDescription>
                Convert your rough shift notes into a professional NDIS-style progress note.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {hasDraft && !generatedContent && (
            <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5 mb-5">
              <p className="text-xs text-primary">Your previous draft has been restored.</p>
              <button
                onClick={clearDraft}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                Clear draft
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit(generateNote)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="participantName">
                  Participant Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="participantName"
                  placeholder="e.g. John Smith"
                  {...register('participantName')}
                  className={errors.participantName ? 'border-destructive' : ''}
                />
                {errors.participantName && (
                  <p className="text-xs text-destructive">{errors.participantName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="shiftDate">
                  Shift Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="shiftDate"
                  type="date"
                  {...register('shiftDate')}
                  className={errors.shiftDate ? 'border-destructive' : ''}
                />
                {errors.shiftDate && (
                  <p className="text-xs text-destructive">{errors.shiftDate.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rawNotes">
                Raw Notes <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Write your shift notes as you normally would. Include activities, meals, behaviours,
                appointments, and any observations. The AI will convert these into professional documentation.
              </p>
              <Textarea
                id="rawNotes"
                placeholder="e.g. Arrived 7am. John was awake. Had brekky - toast and eggs. Got dressed with prompting. Went to Woolworths for groceries. Had lunch at home - soup. Watched TV in the afternoon. Dinner was pasta - ate well. Went to bed 9pm. No issues during shift."
                rows={8}
                {...register('rawNotes')}
                className={`min-h-[200px] ${errors.rawNotes ? 'border-destructive' : ''}`}
              />
              {errors.rawNotes && (
                <p className="text-xs text-destructive">{errors.rawNotes.message}</p>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isGenerating}>
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating Note...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate Progress Note</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {isGenerating && (
        <Card className="border-border/50">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <div>
                <p className="font-medium">Generating your progress note...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Our AI is reviewing and expanding your notes into professional documentation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {generatedContent && !isGenerating && currentValues && (
        <GeneratedDocumentCard
          type="progress-note"
          participantName={currentValues.participantName}
          date={currentValues.shiftDate}
          content={generatedContent}
          isSaved={isSaved}
          onSave={isSaved ? undefined : handleSave}
          onRegenerate={handleRegenerate}
          onContentChange={handleContentChange}
          isSaving={isSaving}
        />
      )}
    </div>
  )
}
