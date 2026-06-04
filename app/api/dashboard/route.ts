import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/db'
import { DocumentModel } from '@/models/Document'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 })
    }

    await connectDB()

    const [totalDocuments, progressNotes, incidentReports, recentDocuments] = await Promise.all([
      DocumentModel.countDocuments({ userId }),
      DocumentModel.countDocuments({ userId, type: 'progress-note' }),
      DocumentModel.countDocuments({ userId, type: 'incident-report' }),
      DocumentModel.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalDocuments,
        progressNotes,
        incidentReports,
        recentDocuments,
      },
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}
