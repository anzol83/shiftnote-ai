import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12 grid-bg">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[400px] h-[300px] bg-primary/6 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 border border-primary/25">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-lg tracking-tight">ShiftNote AI</span>
        </Link>
        <SignUp
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'bg-card border border-border/50 shadow-xl rounded-2xl',
              headerTitle: 'text-foreground font-semibold',
              headerSubtitle: 'text-muted-foreground',
              formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
              formFieldInput:
                'bg-background border-input text-foreground placeholder:text-muted-foreground',
              footerActionLink: 'text-primary hover:text-primary/80',
              identityPreviewText: 'text-foreground',
              identityPreviewEditButton: 'text-primary',
              socialButtonsBlockButton:
                'border-border text-foreground hover:bg-accent',
              dividerLine: 'bg-border',
              dividerText: 'text-muted-foreground',
            },
          }}
        />
      </div>
    </div>
  )
}
