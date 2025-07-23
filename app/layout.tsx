import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Story2book AI - Générateur d\'ebooks par IA',
  description: 'Créez des ebooks professionnels en quelques clics grâce à l\'Intelligence Artificielle. Transformez vos idées en livres numériques.',
  keywords: 'ebook, générateur, IA, intelligence artificielle, livre numérique, écriture automatique',
  authors: [{ name: 'Story2book AI' }],
  openGraph: {
    title: 'Story2book AI - Générateur d\'ebooks par IA',
    description: 'Créez des ebooks professionnels en quelques clics grâce à l\'Intelligence Artificielle',
    type: 'website',
    locale: 'fr_FR',
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