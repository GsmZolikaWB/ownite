'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Package, ShoppingCart, Send, Plus } from 'lucide-react'
import { useCart } from '@/app/context/CartContext'

export default function ShopPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { addItem } = useCart()
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')

  const getFirstName = (fullName: string) => {
    return fullName?.split(' ')[0] || fullName
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
      fetchProducts()
    }
  }, [status])

  useEffect(() => {
    filterProducts()
  }, [searchQuery, selectedCategory, products])

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data)
      setFilteredProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredProducts(filtered)
  }

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      })

      if (res.ok) {
        const data = await res.json()
        alert(`Meghívó sikeresen elküldve! Link: ${window.location.origin}${data.invitationUrl}`)
        setInviteEmail('')
        setShowInviteModal(false)
      } else {
        const error = await res.json()
        alert(error.error || 'Hiba történt a meghívó küldése során')
      }
    } catch (error) {
      alert('Hiba történt a meghívó küldése során')
    }
  }

  const categories = ['all', ...new Set(products.map((p) => p.category))]

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-gray-600">Betöltés...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Webshop</h1>
            <p className="text-gray-600">
              Üdvözöljük, {getFirstName(session?.user?.name || '')}! Böngésszen termékek között.
            </p>
          </div>

          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center space-x-2 px-6 py-3 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all card-elevated"
          >
            <Send className="w-5 h-5" />
            <span>Meghívó küldése</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl p-6 card-elevated mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Termék keresése..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all appearance-none"
              >
                <option value="all">Minden kategória</option>
                {categories
                  .filter((c) => c !== 'all')
                  .map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 card-elevated text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Nincs megjeleníthető termék</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden card-elevated hover:scale-105 transition-transform duration-300"
              >
                <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-16 h-16 text-gray-400" />
                  )}
                </div>

                <div className="p-6">
                  <div className="mb-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                      {product.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      {product.price.toLocaleString('hu-HU')} Ft
                    </span>

                    <button
                      onClick={() =>
                        addItem({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          imageUrl: product.imageUrl,
                        })
                      }
                      className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Kosárba</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full card-elevated">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Meghívó küldése
            </h2>
            <p className="text-gray-600 mb-6">
              Küldjön meghívót egy ismerősének, hogy regisztrálhasson az oldalra
            </p>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <input
                type="email"
                placeholder="Email cím"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-6 py-3 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all"
                >
                  Küldés
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
