'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/app/context/CartContext'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function CartPage() {
  const { status } = useSession()
  const router = useRouter()
  const { items, updateQuantity, removeItem, total, itemCount } = useCart()

  if (status === 'loading') {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-gray-600">Betöltés...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Kosár</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 card-elevated text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              A kosár üres
            </h2>
            <p className="text-gray-600 mb-6">
              Még nem adott hozzá termékeket a kosárhoz
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all"
            >
              <span>Tovább a webshopba</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-6 card-elevated"
                >
                  <div className="flex items-center space-x-4">
                    {item.imageUrl ? (
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-xl flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-gray-600">
                        {item.price.toLocaleString('hu-HU')} Ft
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-gray-900 mb-2">
                        {(item.price * item.quantity).toLocaleString('hu-HU')} Ft
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 card-elevated sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Összesítő
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Termékek ({itemCount} db)</span>
                    <span>{total.toLocaleString('hu-HU')} Ft</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Szállítás</span>
                    <span>Ingyenes</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>Összesen</span>
                    <span>{total.toLocaleString('hu-HU')} Ft</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all"
                >
                  <span>Tovább a fizetéshez</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/shop"
                  className="block text-center mt-4 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Vásárlás folytatása
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
