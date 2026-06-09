'use client'

import { useState } from 'react'
import { Copy, Save, RefreshCw, Check, AlertTriangle, Pencil, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import type { DocumentType } from '@/types'

interface GeneratedDocumentCardProps {
  type: DocumentType
  participantName: string
  date: string
  content: string
  isSaved?: boolean
  onSave?: () => Promise<void>
  onRegenerate?: () => void
  onContentChange?: (newContent: string) => void
  isSaving?: boolean
}

export function GeneratedDocumentCard({
  type,
  participantName,
  date,
  content,
  isSaved = false,
  onSave,
  onRegenerate,
  onContentChange,
  isSaving = false,
}: GeneratedDocumentCardProps) {
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(content)

  // Keep editedContent in sync if parent updates content (e.g. after regenerate)
  const displayContent = isEditing ? editedContent : content

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayContent)
      setCopied(true)
      toast({ title: 'Copied to clipboard', description: 'The document has been copied.', variant: 'success' })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast({ title: 'Copy failed', description: 'Please try selecting and copying the text manually.', variant: 'destructive' })
    }
  }

  const handleCancelEdit = () => {
    setEditedContent(content) // discard changes
    setIsEditing(false)
  }

  const handleApplyEdit = () => {
    // Push the edited content up to the parent so it saves the correct version
    if (onContentChange) {
      onContentChange(editedContent)
    }
    setIsEditing(false)
    toast({ title: 'Changes applied', description: 'Your edits are ready. Save the document to store them.', variant: 'success' })
  }

  const isIncidentReport = type === 'incident-report'

  return (
    <div className="space-y-4 animate-fade-in">
      {isIncidentReport && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-500/30 bg-amber-500/10">
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-400">
            Please review and verify all information before submission. The reporting staff member
            remains responsible for ensuring factual accuracy.
          </p>
        </div>
      )}

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={isIncidentReport ? 'warning' : 'success'}>
                  {isIncidentReport ? 'Incident Report' : 'Progress Note'}
                </Badge>
                {isSaved && (
                  <Badge variant="outline" className="text-xs">
                    <Check className="w-3 h-3 mr-1" /> Saved
                  </Badge>
                )}
                {isEditing && (
                  <Badge variant="secondary" className="text-xs">
                    <Pencil className="w-3 h-3 mr-1" /> Editing
                  </Badge>
                )}
              </div>
              <CardTitle className="text-base">{participantName}</CardTitle>
              <p className="text-xs text-muted-foreground">{date}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={isEditing ? handleCancelEdit : () => { setEditedContent(content); setIsEditing(true) }}
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              {isEditing ? (
                <><X className="w-3.5 h-3.5" /> Cancel edit</>
              ) : (
                <><Pencil className="w-3.5 h-3.5" /> Edit</>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isEditing ? (
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[400px] text-sm leading-relaxed font-mono resize-y"
              autoFocus
            />
          ) : (
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 rounded-lg bg-muted/30 p-4 border border-border/30 max-h-[500px] overflow-y-auto">
              {displayContent}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2 pt-0">
          {isEditing ? (
            <Button onClick={handleApplyEdit} size="sm" className="flex-1 sm:flex-none">
              <Check className="w-4 h-4" />
              Apply changes
            </Button>
          ) : (
            <>
              <Button onClick={handleCopy} variant="outline" size="sm" className="flex-1 sm:flex-none">
                {copied ? (
                  <><Check className="w-4 h-4" /> Copied</>
                ) : (
                  <><Copy className="w-4 h-4" /> Copy</>
                )}
              </Button>

              {onSave && !isSaved && (
                <Button onClick={onSave} size="sm" className="flex-1 sm:flex-none" disabled={isSaving}>
                  {isSaving ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save</>
                  )}
                </Button>
              )}

              {onRegenerate && (
                <Button onClick={onRegenerate} variant="ghost" size="sm" className="flex-1 sm:flex-none text-muted-foreground">
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </Button>
              )}
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
