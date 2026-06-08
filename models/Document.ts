import mongoose, { Schema } from 'mongoose'
import type { DocumentType } from '@/types'

export interface IDocument {
  userId: string
  type: DocumentType
  participantName: string
  date: string
  rawInput: string
  generatedOutput: string
  createdAt: Date
  updatedAt: Date
}

const DocumentSchema = new Schema<IDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['progress-note', 'incident-report'],
      required: true,
    },
    participantName: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    rawInput: {
      type: String,
      required: true,
    },
    generatedOutput: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound indexes for efficient querying
DocumentSchema.index({ userId: 1, createdAt: -1 })
DocumentSchema.index({ userId: 1, type: 1 })

export const DocumentModel =
mongoose.models.ShiftDocument || mongoose.model<IDocument>('ShiftDocument', DocumentSchema)
