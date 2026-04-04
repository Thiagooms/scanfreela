import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/Providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SpotLead — Encontre, qualifique e feche mais negócios',
  description: 'Encontre negócios locais, colete contatos automaticamente e gerencie seus leads em um pipeline Kanban. Prospecção sem planilha, sem esforço.',
  icons: {
    icon: '/assets/logo-nova.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col"><Providers>{children}</Providers></body>
    </html>
  )
}
