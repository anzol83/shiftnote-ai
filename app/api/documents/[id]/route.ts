import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import connectDB from '@/lib/db'
import { DocumentModel } from '@/models/Document'

const updateSchema = z.object({
  generatedOutput: z.string().min(1),
})

// GET - get a specific document
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 })
    }
    const { id } = await params
    await connectDB()
    const document = await DocumentModel.findOne({ _id: id, userId }).lean()
    if (!document) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: document })
  } catch (error) {
    console.error('Get document error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch document' }, { status: 500 })
  }
}

// PATCH - update the generatedOutput of a document
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 })
    }
    const { id } = await params
    const body = await request.json()
    const validation = updateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }
    await connectDB()
    const document = await DocumentModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: { generatedOutput: validation.data.generatedOutput } },
      { new: true }
    ).lean()
    if (!document) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: document })
  } catch (error) {
    console.error('Update document error:', error)
    const message = error instanceof Error ? error.message : 'Failed to update document'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// DELETE - delete a specific document
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 })
    }
    const { id } = await params
    await connectDB()
    const document = await DocumentModel.findOneAndDelete({ _id: id, userId })
    if (!document) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: { deleted: true } })
  } catch (error) {
    console.error('Delete document error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete document' }, { status: 500 })
  }
}
