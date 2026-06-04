export type DocumentType = 'progress-note' | 'incident-report'

export interface Document {
  _id: string
  userId: string
  type: DocumentType
  participantName: string
  date: string
  rawInput: string
  generatedOutput: string
  createdAt: string
}

export interface User {
  _id: string
  clerkId: string
  email: string
  createdAt: string
}

export interface GenerateProgressNoteInput {
  participantName: string
  shiftDate: string
  rawNotes: string
}

export interface GenerateIncidentReportInput {
  participantName: string
  incidentDate: string
  rawNotes: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface DashboardStats {
  totalDocuments: number
  progressNotes: number
  incidentReports: number
  recentDocuments: Document[]
}
