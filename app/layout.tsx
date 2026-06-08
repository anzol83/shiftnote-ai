import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

export const metadata: Metadata = {
  title: 'ShiftNote AI — Professional NDIS Documentation',
  description:
    'Generate professional progress notes and incident reports using AI built specifically for Australian disability support workers.',
  keywords: 'NDIS, disability support, progress notes, incident reports, AI, documentation',
  authors: [{ name: 'ShiftNote AI' }],
  openGraph: {
    title: 'ShiftNote AI — Professional NDIS Documentation',
    description:
      'Generate professional progress notes and incident reports using AI built for Australian disability support workers.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
  rel="stylesheet"
/>
        </head>
        <body className="antialiased min-h-screen bg-background text-foreground">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
