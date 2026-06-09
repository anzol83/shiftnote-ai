'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, AlertTriangle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GeneratedDocumentCard } from '@/components/documents/generated-document-card'
import { incidentReportSchema, IncidentReportFormValues } from '@/lib/validations'
import { toast } from '@/hooks/use-toast'

const DRAFT_KEY = 'incident-report-draft'
const SESSION_KEY = 'incident-report-session'

interface SessionData {
  formValues: IncidentReportFormValues
  generatedContent: string
  isSaved: boolean
  savedDocId: string | null
}

export function IncidentReportForm() {
  const [generatedContent, setGeneratedContent] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [savedDocId, setSavedDocId] = useState<string | null>(null)
  const [currentValues, setCurrentValues] = useState<IncidentReportFormValues | null>(null)
  const [hasDraft, setHasDraft] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
    watch,
  } = useForm<IncidentReportFormValues>({
    resolver: zodResolver(incidentReportSchema),
    defaultValues: {
      incidentDate: new Date().toISOString().split('T')[0],
    },
  })

  // On mount: restore full session first, then fall back to draft
  useEffect(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY)
      if (session) {
        const parsed = JSON.parse(session) as SessionData
        setValue('participantName', parsed.formValues.participantName)
        setValue('incidentDate', parsed.formValues.incidentDate)
        setValue('rawNotes', parsed.formValues.rawNotes)
        setCurrentValues(parsed.formValues)
        setGeneratedContent(parsed.generatedContent)
        setIsSaved(parsed.isSaved)
        setSavedDocId(parsed.savedDocId)
        return
      }

      const draft = localStorage.getItem(DRAFT_KEY)
      if (draft) {
        const parsed = JSON.parse(draft) as Partial<IncidentReportFormValues>
        if (parsed.participantName) setValue('participantName', parsed.participantName)
        if (parsed.incidentDate) setValue('incidentDate', parsed.incidentDate)
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
    data: IncidentReportFormValues,
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
        type: 'incident-report',
        participantName: data.participantName,
        date: data.incidentDate,
        rawInput: data.rawNotes,
        generatedOutput: output,
      }),
    })
    const result = await response.json()
    if (response.ok && result.success) return result.data._id as string
    throw new Error(result.error || 'Failed to save document')
  }

  const generateReport = async (data: IncidentReportFormValues) => {
    setIsGenerating(true)
    setGeneratedContent(null)
    setIsSaved(false)
    setCurrentValues(data)
    clearSession()

    try {
      const response = await fetch('/api/generate/incident-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to generate incident report')

      setGeneratedContent(result.data.generatedOutput)
      toast({
        title: 'Incident report generated',
        description: 'Review carefully for accuracy, then click Save.',
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
        description: 'Incident report saved to your history.',
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
    generateReport(values)
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <CardTitle>Incident Report Generator</CardTitle>
              <CardDescription>
                Generate a structured ABCD incident report from your raw incident notes.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 mb-5">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-400">
              Document only what you directly observed or was reported to you. Accuracy is critical.
              The AI will only use information you provide.
            </p>
          </div>

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

          <form onSubmit={handleSubmit(generateReport)} className="space-y-5">
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
                <Label htmlFor="incidentDate">
                  Incident Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="incidentDate"
                  type="date"
                  {...register('incidentDate')}
                  className={errors.incidentDate ? 'border-destructive' : ''}
                />
                {errors.incidentDate && (
                  <p className="text-xs text-destructive">{errors.incidentDate.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rawNotes">
                Raw Incident Notes <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Describe what happened before the incident, the behaviour you observed, what
                strategies were used, and what happened afterward. Be as specific as possible.
              </p>
              <Textarea
                id="rawNotes"
                placeholder="e.g. Before: John was in the kitchen. Support worker asked John if he was ready to take his medication. Behaviour: John raised his voice, pushed the medication cup off the bench, and walked out of the kitchen. He stood in the hallway and continued yelling. De-escalation: Support worker remained calm, did not follow John into the hallway, and waited quietly at a distance. Support worker spoke in a low, calm tone and acknowledged John. Consequence: John returned to the kitchen after approximately 5 minutes. The environment became calm. Medication was not administered at this time."
                rows={10}
                {...register('rawNotes')}
                className={`min-h-[220px] ${errors.rawNotes ? 'border-destructive' : ''}`}
              />
              {errors.rawNotes && (
                <p className="text-xs text-destructive">{errors.rawNotes.message}</p>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-black"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating Report...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate Incident Report</>
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
              <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
              <div>
                <p className="font-medium">Generating incident report...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Structuring your notes into Antecedent, Behaviour, De-escalation, and Consequence.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {generatedContent && !isGenerating && currentValues && (
        <GeneratedDocumentCard
          type="incident-report"
          participantName={currentValues.participantName}
          date={currentValues.incidentDate}
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
