import { IncidentReportForm } from '@/components/forms/incident-report-form'

export const metadata = {
  title: 'Incident Report Generator — ShiftNote AI',
  description: 'Generate structured ABCD incident reports from your raw incident notes.',
}

export default function IncidentReportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Incident Report Generator</h1>
        <p className="text-muted-foreground mt-1">
          Enter your raw incident notes and generate a structured ABCD incident report.
        </p>
      </div>
      <IncidentReportForm />
    </div>
  )
}
