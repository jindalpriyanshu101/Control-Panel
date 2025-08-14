import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '../components/Providers'

export const metadata: Metadata = {
  title: 'ElementiX Hosting - Next-Generation Cloud Hosting',
  description: 'Experience lightning-fast web hosting powered by cutting-edge technology with ElementiX Hosting.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
