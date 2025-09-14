import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { QueryProvider } from '@/lib/query-provider'
import { AuthProvider } from '@/lib/auth-provider'
import { AuthNotification } from '@/components/auth-notification'
import { AppLayout } from '@/components/app-layout'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
})

export const metadata: Metadata = {
  title: 'The Pile - Confront Your Gaming Backlog',
  description: 'A humorous take on your Steam backlog that helps you face the pile of shame',
  keywords: ['steam', 'gaming', 'backlog', 'pile of shame', 'statistics'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <AuthNotification />
            <AppLayout>
              {children}
            </AppLayout>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}