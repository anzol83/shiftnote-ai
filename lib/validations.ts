import { z } from 'zod'

export const progressNoteSchema = z.object({
  participantName: z
    .string()
    .min(2, 'Participant name must be at least 2 characters')
    .max(100, 'Participant name must be less than 100 characters'),
  shiftDate: z.string().min(1, 'Shift date is required'),
  rawNotes: z
    .string()
    .min(20, 'Please provide at least 20 characters of notes')
    .max(5000, 'Notes must be less than 5000 characters'),
})

export const incidentReportSchema = z.object({
  participantName: z
    .string()
    .min(2, 'Participant name must be at least 2 characters')
    .max(100, 'Participant name must be less than 100 characters'),
  incidentDate: z.string().min(1, 'Incident date is required'),
  rawNotes: z
    .string()
    .min(20, 'Please provide at least 20 characters of notes')
    .max(5000, 'Notes must be less than 5000 characters'),
})

export type ProgressNoteFormValues = z.infer<typeof progressNoteSchema>
export type IncidentReportFormValues = z.infer<typeof incidentReportSchema>
