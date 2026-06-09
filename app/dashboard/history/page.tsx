'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  FileText,
  AlertTriangle,
  Search,
  Trash2,
  Copy,
  Check,
  Filter,
  Clock,
  Pencil,
  X,
  Save,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from '@/hooks/use-toast'
import { formatDateTime, getDocumentTypeLabel } from '@/lib/utils'
import type { Document } from '@/types'

type FilterType = 'all' | 'progress-note' | 'incident-report'

export default function HistoryPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState<string>('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  const fetchDocuments = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('type', filter)
      if (search) params.set('search', search)
      const response = await fetch(`/api/documents?${params.toString()}`)
      const result = await response.json()
      if (result.success) setDocuments(result.data)
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }, [filter, search])

  useEffect(() => {
    const timer = setTimeout(() => fetchDocuments(), 300)
    return () => clearTimeout(timer)
  }, [fetchDocuments])

  const handleCopy = async (doc: Document) => {
    try {
      await navigator.clipboard.writeText(doc.generatedOutput)
      setCopiedId(doc._id)
      toast({ title: 'Copied to clipboard', description: 'Document content has been copied.', variant: 'success' })
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast({ title: 'Copy failed', description: 'Please try again.', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setDocuments((prev) => prev.filter((d) => d._id !== id))
        toast({ title: 'Document deleted', description: 'The document has been permanently deleted.', variant: 'success' })
      } else {
        throw new Error('Delete failed')
      }
    } catch {
      toast({ title: 'Delete failed', description: 'Please try again.', variant: 'destructive' })
    }
  }

  const handleStartEdit = (doc: Document) => {
    setEditingId(doc._id)
    setEditContent(doc.generatedOutput)
    setExpandedId(doc._id)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditContent('')
  }

  const handleSaveEdit = async (id: string) => {
    if (!editContent.trim()) return
    setIsSavingEdit(true)
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generatedOutput: editContent }),
      })

      let result: { success: boolean; error?: string } = { success: false }
      try { result = await response.json() } catch { throw new Error('Failed to save') }

      if (!response.ok) throw new Error(result.error || 'Failed to save edit')

      // Update local state immediately so UI reflects change without refetch
      setDocuments((prev) =>
        prev.map((d) => (d._id === id ? { ...d, generatedOutput: editContent } : d))
      )
      setEditingId(null)
      setEditContent('')
      toast({ title: 'Document updated', description: 'Your changes have been saved.', variant: 'success' })
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSavingEdit(false)
    }
  }

  const filterButtons: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Progress Notes', value: 'progress-note' },
    { label: 'Incident Reports', value: 'incident-report' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Document History</h1>
        <p className="text-muted-foreground mt-1">
          Search, view, edit, copy, or delete your saved documentation.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by participant name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          {filterButtons.map((btn) => (
            <Button
              key={btn.value}
              variant={filter === btn.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(btn.value)}
              className="shrink-0"
            >
              {btn.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Document List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="py-5">
                <div className="flex items-start gap-3">
                  <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((doc) => {
            const isExpanded = expandedId === doc._id
            const isEditing = editingId === doc._id
            return (
              <Card key={doc._id} className="border-border/50">
                <CardContent className="py-5">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${
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
                      {/* Header row */}
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">{doc.participantName}</p>
                          <Badge variant={doc.type === 'progress-note' ? 'success' : 'warning'}>
                            {getDocumentTypeLabel(doc.type)}
                          </Badge>
                          {isEditing && (
                            <Badge variant="secondary" className="text-xs">
                              <Pencil className="w-3 h-3 mr-1" /> Editing
                            </Badge>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          {isEditing ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                onClick={handleCancelEdit}
                                title="Cancel edit"
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => handleSaveEdit(doc._id)}
                                disabled={isSavingEdit}
                              >
                                {isSavingEdit ? (
                                  <span className="flex items-center gap-1">
                                    <Save className="w-3 h-3 animate-pulse" /> Saving...
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <Save className="w-3 h-3" /> Save
                                  </span>
                                )}
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                onClick={() => handleStartEdit(doc)}
                                title="Edit document"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleCopy(doc)}
                                title="Copy document"
                              >
                                {copiedId === doc._id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    title="Delete document"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete document?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the {getDocumentTypeLabel(doc.type)} for {doc.participantName}. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(doc._id)}
                                      className="bg-destructive hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(doc.createdAt)} · Date: {doc.date}
                      </div>

                      {/* Content — edit mode or read mode */}
                      {isEditing ? (
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[300px] text-sm leading-relaxed font-mono resize-y mt-2"
                          autoFocus
                        />
                      ) : (
                        <>
                          <div
                            className={`text-xs text-muted-foreground leading-relaxed ${
                              !isExpanded ? 'line-clamp-2' : 'whitespace-pre-wrap'
                            }`}
                          >
                            {doc.generatedOutput}
                          </div>
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : doc._id)}
                            className="text-xs text-primary hover:text-primary/80 mt-1 transition-colors"
                          >
                            {isExpanded ? 'Show less' : 'Show more'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border-border/50 border-dashed">
          <CardContent className="py-16 text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-muted mx-auto mb-4">
              <Search className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="font-medium mb-1">
              {search || filter !== 'all' ? 'No documents found' : 'No documents yet'}
            </p>
            <p className="text-sm text-muted-foreground">
              {search || filter !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Generate your first document to see it here.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
