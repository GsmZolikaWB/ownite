'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { User, ShoppingCart, LogOut, Settings, Cog } from 'lucide-react'
import { useCart } from '@/app/context/CartContext'

export default function Navigation() {
  const { data: session } = useSession()
  const { itemCount } = useCart()
  const [siteName, setSiteName] = useState('Mechatronics Engineering')
  const [logo, setLogo] = useState('')

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setSiteName(data.siteName)
        setLogo(data.logo)
      })
      .catch(() => {})
  }, [])

  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0]
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            {logo ? (
              <div className="relative h-10 w-auto min-w-[40px]">
                <Image src={logo} alt="Logo" height={40} width={120} className="h-10 w-auto object-contain" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
            )}
            <span className="font-semibold text-gray-900 hidden sm:block">
              {siteName}
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              href="/#contact"
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Kapcsolat
            </Link>

            {session ? (
              <>
                <Link
                  href="/shop"
                  className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Webshop</span>
                </Link>

                <Link
                  href="/cart"
                  className="relative flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-900 text-white text-xs rounded-full flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                  <span>Kosár</span>
                </Link>

                {session.user?.role === 'ADMIN' && (
                  <>
                    <Link
                      href="/admin"
                      className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                      <span>Admin</span>
                    </Link>
                    <Link
                      href="/admin/settings"
                      className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <Cog className="w-5 h-5" />
                      <span>Beállítások</span>
                    </Link>
                  </>
                )}

                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Kilépés</span>
                </button>

                <div className="flex items-center space-x-2 pl-4 border-l border-gray-300">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">
                    {getFirstName(session.user?.name || '')}
                  </span>
                </div>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="px-4 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                Bejelentkezés
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
