import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import connectDB from '@/lib/db'
import { DocumentModel } from '@/models/Document'
import { UserModel } from '@/models/User'

const saveDocumentSchema = z.object({
  type: z.enum(['progress-note', 'incident-report']),
  participantName: z.string().min(1),
  date: z.string().min(1),
  rawInput: z.string().min(1),
  generatedOutput: z.string().min(1),
})

// GET - fetch documents for current user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')

    const query: Record<string, unknown> = { userId }

    if (type && type !== 'all') {
      query.type = type
    }

    if (search) {
      query.participantName = { $regex: search, $options: 'i' }
    }

    const documents = await DocumentModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      data: documents,
    })
  } catch (error) {
    console.error('Get documents error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

// POST - save a document
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const validationResult = saveDocumentSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    // Ensure user exists in DB
    await UserModel.findOneAndUpdate(
      { clerkId: userId },
      { clerkId: userId },
      { upsert: true, new: true }
    )

    const document = await DocumentModel.create({
      userId,
      ...validationResult.data,
    })

    return NextResponse.json(
      { success: true, data: document },
      { status: 201 }
    )
  } catch (error) {
    console.error('Save document error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save document' },
      { status: 500 }
    )
  }
}
