'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import {
  FileText,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime, getDocumentTypeLabel, truncateText } from '@/lib/utils'
import { DashboardStats } from '@/types'

export default function DashboardPage() {
  const { user } = useUser()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard')
        const result = await response.json()
        if (result.success) {
          setStats(result.data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const firstName = user?.firstName || 'there'
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          What would you like to document today?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
        <Link href="/dashboard/progress-note">
          <div className="group relative overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all cursor-pointer h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/25">
                <FileText className="w-5 h-5 text-emerald-400" />
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-400/50 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-semibold text-base mb-1">Progress Note</h3>
            <p className="text-sm text-muted-foreground">
              Convert shift notes into professional NDIS documentation.
            </p>
          </div>
        </Link>

        <Link href="/dashboard/incident-report">
          <div className="group relative overflow-hidden rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all cursor-pointer h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/25">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400/50 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-semibold text-base mb-1">Incident Report</h3>
            <p className="text-sm text-muted-foreground">
              Generate structured ABCD incident reports accurately.
            </p>
          </div>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 animate-fade-in">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="pt-5 pb-5">
                  <Skeleton className="h-7 w-10 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="border-border/50">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-2xl font-bold">{stats?.totalDocuments ?? 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Total documents</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span className="text-2xl font-bold">{stats?.progressNotes ?? 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Progress notes</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-2xl font-bold">{stats?.incidentReports ?? 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">Incident reports</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Documents */}
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Documents</h2>
          <Link href="/dashboard/history">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-60" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stats?.recentDocuments && stats.recentDocuments.length > 0 ? (
          <div className="space-y-3">
            {stats.recentDocuments.map((doc) => (
              <Card key={doc._id} className="border-border/50 hover:border-border transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${
                        doc.type === 'progress-note'
                          ? 'bg-emerald-500/10 border border-emerald-500/20'
                          : 'bg-amber-500/10 border border-amber-500/20'
                      }`}
                    >
                      {doc.type === 'progress-note' ? (
                        <FileText className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm truncate">{doc.participantName}</p>
                        <Badge
                          variant={doc.type === 'progress-note' ? 'success' : 'warning'}
                          className="shrink-0"
                        >
                          {getDocumentTypeLabel(doc.type)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {truncateText(doc.generatedOutput, 80)}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(doc.createdAt)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border/50 border-dashed">
            <CardContent className="py-12 text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted mx-auto mb-4">
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-medium mb-1">No documents yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Generate your first progress note or incident report to get started.
              </p>
              <div className="flex items-center justify-center gap-2">
                <Link href="/dashboard/progress-note">
                  <Button size="sm">
                    <Plus className="w-4 h-4" />
                    Progress Note
                  </Button>
                </Link>
                <Link href="/dashboard/incident-report">
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4" />
                    Incident Report
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
