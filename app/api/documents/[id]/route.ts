import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/db'
import { DocumentModel } from '@/models/Document'

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

    const document = await DocumentModel.findOneAndDelete({
      _id: id,
      userId,
    })

    if (!document) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: { deleted: true } })
  } catch (error) {
    console.error('Delete document error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}

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

    const document = await DocumentModel.findOne({
      _id: id,
      userId,
    }).lean()

    if (!document) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: document })
  } catch (error) {
    console.error('Get document error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch document' },
      { status: 500 }
    )
  }
}
