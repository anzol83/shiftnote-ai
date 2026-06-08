'use client'

import { useState } from 'react'
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

export function ProgressNoteForm() {
  const [generatedContent, setGeneratedContent] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [currentValues, setCurrentValues] = useState<ProgressNoteFormValues | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ProgressNoteFormValues>({
    resolver: zodResolver(progressNoteSchema),
    defaultValues: {
      shiftDate: new Date().toISOString().split('T')[0],
    },
  })

  const generateNote = async (data: ProgressNoteFormValues) => {
    setIsGenerating(true)
    setGeneratedContent(null)
    setIsSaved(false)
    setCurrentValues(data)

    try {
      const response = await fetch('/api/generate/progress-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate progress note')
      }

      setGeneratedContent(result.data.generatedOutput)
      toast({
        title: 'Progress note generated',
        description: 'Review the note and save when ready.',
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
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'progress-note',
          participantName: currentValues.participantName,
          date: currentValues.shiftDate,
          rawInput: currentValues.rawNotes,
          generatedOutput: generatedContent,
        }),
      })

      let result: { success: boolean; error?: string } = { success: false }
try {
  result = await response.json()
} catch {
  throw new Error(`Server error (${response.status}) — please try again`)
}

if (!response.ok) {
  throw new Error(result.error || `Save failed with status ${response.status}`)
}

      setIsSaved(true)
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

            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Note...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Progress Note
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isGenerating && (
        <Card className="border-border/50">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              </div>
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
          onSave={handleSave}
          onRegenerate={handleRegenerate}
          isSaving={isSaving}
        />
      )}
    </div>
  )
}
