import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from './components/AuthProvider'
import { CartProvider } from './context/CartContext'
import Navigation from './components/Navigation'

export const metadata: Metadata = {
  title: 'Mechatronics Engineering & Automation',
  description: 'Professional automation project services by experienced mechatronics engineer',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hu">
      <body className="font-sans">
        <AuthProvider>
          <CartProvider>
            <Navigation />
            <main className="min-h-screen">
              {children}
            </main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
