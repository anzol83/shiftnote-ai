import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'
import { incidentReportSchema } from '@/lib/validations'
import { INCIDENT_REPORT_SYSTEM_PROMPT, buildIncidentReportUserPrompt } from '@/lib/prompts'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorised' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validationResult = incidentReportSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { participantName, incidentDate, rawNotes } = validationResult.data

    const userPrompt = buildIncidentReportUserPrompt(participantName, incidentDate, rawNotes)

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2048,
      system: INCIDENT_REPORT_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })

    // Safe narrowing — no unsafe cast
    const generatedOutput = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n')

    return NextResponse.json({
      success: true,
      data: {
        generatedOutput,
        participantName,
        date: incidentDate,
      },
    })
  } catch (error) {
    console.error('Incident report generation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate incident report. Please try again.' },
      { status: 500 }
    )
  }
}
