import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'),
  title: 'Story2book AI - Générateur d\'ebooks par IA',
  description: 'Créez des ebooks professionnels en quelques clics grâce à l\'Intelligence Artificielle. Transformez vos idées en livres numériques.',
  keywords: 'ebook, générateur, IA, intelligence artificielle, livre numérique, écriture automatique',
  authors: [{ name: 'Story2book AI' }],
  openGraph: {
    title: 'Story2book AI - Générateur d\'ebooks par IA',
    description: 'Créez des ebooks professionnels en quelques clics grâce à l\'Intelligence Artificielle',
    type: 'website',
    locale: 'fr_FR',
    url: '/',
    siteName: 'Story2book AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Story2book AI - Générateur d\'ebooks par IA',
    description: 'Créez des ebooks professionnels en quelques clics grâce à l\'Intelligence Artificielle',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}