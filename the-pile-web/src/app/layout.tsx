import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { QueryProvider } from '@/lib/query-provider'
import { AuthProvider } from '@/lib/auth-provider'
import { AuthNotification } from '@/components/auth-notification'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

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
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}