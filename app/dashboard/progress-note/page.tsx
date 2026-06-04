import { ProgressNoteForm } from '@/components/forms/progress-note-form'

export const metadata = {
  title: 'Progress Note Generator — ShiftNote AI',
  description: 'Generate professional NDIS-style progress notes from your rough shift notes.',
}

export default function ProgressNotePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Progress Note Generator</h1>
        <p className="text-muted-foreground mt-1">
          Enter your rough shift notes and generate a professional NDIS-style progress note.
        </p>
      </div>
      <ProgressNoteForm />
    </div>
  )
}
