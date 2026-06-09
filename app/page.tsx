import Link from 'next/link'
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs'
import {
  FileText,
  AlertTriangle,
  Smartphone,
  Shield,
  ArrowRight,
  Sparkles,
  Check,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 md:px-10 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 group-hover:bg-primary/25 transition-colors">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-base tracking-tight">ShiftNote AI</span>
        </Link>
        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm">
                Start Free
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <Button size="sm">
                Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </SignedIn>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 md:px-10 text-center grid-bg">
        {/* Glow */}
        <div className="absolute inset-0 flex items-start justify-center pointer-events-none">
          <div className="w-[600px] h-[400px] bg-primary/8 rounded-full blur-[120px] mt-10" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            Write Professional
            <br />
            <span className="gradient-text">Support Documentation</span>
            <br />
            in Seconds
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Generate detailed progress notes and incident reports using AI built specifically
            for Australian disability support workers. NDIS-compliant, accurate, and fast.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <SignedOut>
              <SignUpButton mode="modal">
                <Button size="xl" className="w-full sm:w-auto gap-2 shadow-lg shadow-primary/20">
                  <Sparkles className="w-4 h-4" />
                  Start Free
                </Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="xl" className="w-full gap-2 shadow-lg shadow-primary/20">
                  <Sparkles className="w-4 h-4" />
                  Go to Dashboard
                </Button>
              </Link>
            </SignedIn>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
            {['NDIS Compliant', 'Australian English', 'Person-Centred Language', 'Audit Ready'].map(
              (item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-primary" />
                  {item}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 md:px-10 border-t border-border/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Everything you need to document shifts faster
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Two focused tools built for disability support workers in the field.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-8 hover:border-primary/30 transition-colors group">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-6 group-hover:bg-emerald-500/20 transition-colors">
                <FileText className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Professional Progress Notes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Convert rough shift notes into detailed, NDIS-style progress notes. Chronological,
                person-centred, and ready for provider audits — in seconds.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 hover:border-amber-500/30 transition-colors group">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6 group-hover:bg-amber-500/20 transition-colors">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Incident Reports</h3>
              <p className="text-muted-foreground leading-relaxed">
                Generate structured ABCD incident reports covering Antecedent, Behaviour,
                De-escalation, and Consequence — with strict factual accuracy.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 hover:border-blue-500/30 transition-colors group">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6 group-hover:bg-blue-500/20 transition-colors">
                <Smartphone className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Mobile Friendly</h3>
              <p className="text-muted-foreground leading-relaxed">
                Designed for support workers in the field. Works beautifully on any device — phone,
                tablet, laptop, or desktop. No app download required.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 hover:border-violet-500/30 transition-colors group">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 mb-6 group-hover:bg-violet-500/20 transition-colors">
                <Shield className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Storage</h3>
              <p className="text-muted-foreground leading-relaxed">
                All generated documents are saved securely and accessible anytime. Search, filter,
                copy, or delete your documentation history as needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 md:px-10 border-t border-border/40 bg-secondary/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">How it works</h2>
          <p className="text-muted-foreground mb-16">Three steps from rough notes to professional documentation.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Enter rough notes',
                description:
                  'Type your shift notes as you normally would — no perfect grammar required.',
              },
              {
                step: '02',
                title: 'Generate documentation',
                description:
                  'AI converts your notes into professional NDIS-style documentation in seconds.',
              },
              {
                step: '03',
                title: 'Review, save and copy',
                description:
                  'Verify the output, save to your history, and copy to paste into your system.',
              },
            ].map((item, index) => (
              <div key={index} className="relative text-left">
                <div className="text-5xl font-bold text-primary/20 mb-4 font-mono">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
<section className="py-24 px-6 md:px-10 border-t border-border/40">
  <div className="max-w-2xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-2xl md:text-3xl font-bold mb-3">Frequently asked questions</h2>
      <p className="text-muted-foreground">Everything you need to know before getting started.</p>
    </div>
    <div className="space-y-4">
      {[
        {
          q: 'Is this suitable for NDIS providers?',
          a: 'Yes. All generated notes follow NDIS documentation standards, use person-centred language, and are suitable for provider audits and compliance reviews.',
        },
        {
          q: 'Will the AI make up information?',
          a: 'No. The AI only uses the notes you provide. It will never invent, assume, or add information that was not in your original notes. Accuracy is built into the core of how it works.',
        },
        {
          q: 'Is my data secure?',
          a: 'Yes. All documents are stored securely and are only accessible by you. No one else can see your notes or your participants\' information.',
        },
        {
          q: 'Can I use this on my phone?',
          a: 'Yes. ShiftNote AI is fully mobile-friendly and works on any phone or tablet browser. No app download needed.',
        },
        {
          q: 'Do I still need to review the generated notes?',
          a: 'Yes. Always review generated documentation before submitting. The AI is a tool to help you write faster - you remain responsible for the accuracy of what you submit.',
        },
        {
          q: 'Is it really free?',
          a: 'Yes, completely free during early access. No credit card required, no subscription, no hidden fees.',
        },
      ].map((item, index) => (
        <div key={index} className="rounded-xl border border-border/50 p-6 hover:border-border transition-colors">
          <h3 className="font-semibold text-base mb-2">{item.q}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-6 md:px-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">ShiftNote AI</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Built for Australian disability support workers. Not a clinical tool - always verify documentation.
          </p>
        </div>
      </footer>
    </div>
  )
}
