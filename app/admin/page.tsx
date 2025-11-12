'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Users,
  Mail,
  ShoppingBag,
  MessageSquare,
  UserPlus,
  Send,
  Trash2,
  Plus,
  Truck,
  Package,
} from 'lucide-react'
import FileUpload from '@/app/components/FileUpload'

type Tab = 'users' | 'invitations' | 'products' | 'messages' | 'shipping' | 'variants'

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

interface Invitation {
  id: string
  email: string
  token: string
  used: boolean
  expiresAt: string
  createdAt: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
}

interface Message {
  id: string
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  createdAt: string
}

interface ShippingMethod {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: string
  active: boolean
  createdAt: string
}

interface ProductVariant {
  id: string
  productId: string
  name: string
  sku: string
  voltage?: number
  current?: number
  cells?: number
  cellType?: string
  price: number
  stock: number
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('users')
  const [users, setUsers] = useState<User[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // User creation form
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER',
  })

  // Invitation form
  const [newInvitation, setNewInvitation] = useState({
    email: '',
  })

  // Product form
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
  })

  // Shipping method form
  const [newShipping, setNewShipping] = useState({
    name: '',
    description: '',
    price: '',
    estimatedDays: '',
    active: true,
  })

  // Product variant form
  const [newVariant, setNewVariant] = useState({
    productId: '',
    name: '',
    sku: '',
    voltage: '',
    current: '',
    cells: '',
    cellType: '',
    price: '',
    stock: '',
  })

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      if (activeTab === 'users') {
        const res = await fetch('/api/admin/users')
        setUsers(await res.json())
      } else if (activeTab === 'invitations') {
        const res = await fetch('/api/admin/invitations')
        setInvitations(await res.json())
      } else if (activeTab === 'products') {
        const res = await fetch('/api/products')
        setProducts(await res.json())
      } else if (activeTab === 'messages') {
        const res = await fetch('/api/admin/messages')
        setMessages(await res.json())
      } else if (activeTab === 'shipping') {
        const res = await fetch('/api/admin/shipping')
        setShippingMethods(await res.json())
      } else if (activeTab === 'variants') {
        const res = await fetch('/api/admin/variants')
        setVariants(await res.json())
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchData()
    }
  }, [status, session, activeTab, router, fetchData])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })
      const data = await res.json()

      if (res.ok) {
        setNewUser({ name: '', email: '', password: '', role: 'USER' })
        fetchData()
        alert('Felhasználó sikeresen létrehozva!')
      } else {
        // Show specific error message from server
        const errorMsg = data.error || 'Hiba történt a felhasználó létrehozása során'
        alert(`Hiba: ${errorMsg}`)
      }
    } catch (err) {
      console.error('Error creating user:', err)
      alert('Hiba történt a felhasználó létrehozása során')
    }
  }

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvitation),
      })
      const data = await res.json()

      if (res.ok) {
        setNewInvitation({ email: '' })
        fetchData()
        alert('Meghívó sikeresen elküldve!')
      } else {
        const errorMsg = data.error || 'Hiba történt a meghívó küldése során'
        alert(`Hiba: ${errorMsg}`)
      }
    } catch (err) {
      console.error('Error sending invitation:', err)
      alert('Hiba történt a meghívó küldése során')
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
        }),
      })
      const data = await res.json()

      if (res.ok) {
        setNewProduct({ name: '', description: '', price: '', category: '', imageUrl: '' })
        fetchData()
        alert('Termék sikeresen létrehozva!')
      } else {
        const errorMsg = data.error || 'Hiba történt a termék létrehozása során'
        alert(`Hiba: ${errorMsg}`)
      }
    } catch (err) {
      console.error('Error creating product:', err)
      alert('Hiba történt a termék létrehozása során')
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Biztosan törölni szeretné ezt a felhasználót?')) return
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
        alert('Felhasználó sikeresen törölve!')
      }
    } catch (err) {
      console.error('Error deleting user:', err)
      alert('Hiba történt a felhasználó törlése során')
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Biztosan törölni szeretné ezt a terméket?')) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
        alert('Termék sikeresen törölve!')
      }
    } catch (err) {
      console.error('Error deleting product:', err)
      alert('Hiba történt a termék törlése során')
    }
  }

  const handleCreateShipping = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newShipping,
          price: parseFloat(newShipping.price),
        }),
      })
      const data = await res.json()

      if (res.ok) {
        setNewShipping({ name: '', description: '', price: '', estimatedDays: '', active: true })
        fetchData()
        alert('Szállítási mód sikeresen létrehozva!')
      } else {
        const errorMsg = data.error || 'Hiba történt a szállítási mód létrehozása során'
        alert(`Hiba: ${errorMsg}`)
      }
    } catch (err) {
      console.error('Error creating shipping method:', err)
      alert('Hiba történt a szállítási mód létrehozása során')
    }
  }

  const handleDeleteShipping = async (id: string) => {
    if (!confirm('Biztosan törölni szeretné ezt a szállítási módot?')) return
    try {
      const res = await fetch(`/api/admin/shipping/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
        alert('Szállítási mód sikeresen törölve!')
      }
    } catch (err) {
      console.error('Error deleting shipping method:', err)
      alert('Hiba történt a szállítási mód törlése során')
    }
  }

  const handleToggleShipping = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`/api/admin/shipping/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active }),
      })
      if (res.ok) {
        fetchData()
      }
    } catch (err) {
      console.error('Error toggling shipping method:', err)
      alert('Hiba történt a szállítási mód állapotának változtatása során')
    }
  }

  const handleCreateVariant = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newVariant,
          price: parseFloat(newVariant.price),
          stock: parseInt(newVariant.stock),
          voltage: newVariant.voltage ? parseFloat(newVariant.voltage) : undefined,
          current: newVariant.current ? parseFloat(newVariant.current) : undefined,
          cells: newVariant.cells ? parseInt(newVariant.cells) : undefined,
        }),
      })
      const data = await res.json()

      if (res.ok) {
        setNewVariant({
          productId: '',
          name: '',
          sku: '',
          voltage: '',
          current: '',
          cells: '',
          cellType: '',
          price: '',
          stock: '',
        })
        fetchData()
        alert('Termék variáns sikeresen létrehozva!')
      } else {
        const errorMsg = data.error || 'Hiba történt a variáns létrehozása során'
        alert(`Hiba: ${errorMsg}`)
      }
    } catch (err) {
      console.error('Error creating variant:', err)
      alert('Hiba történt a variáns létrehozása során')
    }
  }

  const handleDeleteVariant = async (id: string) => {
    if (!confirm('Biztosan törölni szeretné ezt a variánst?')) return
    try {
      const res = await fetch(`/api/admin/variants/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchData()
        alert('Variáns sikeresen törölve!')
      }
    } catch (err) {
      console.error('Error deleting variant:', err)
      alert('Hiba történt a variáns törlése során')
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-gray-600">Betöltés...</div>
      </div>
    )
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
    return null
  }

  const tabs = [
    { id: 'users' as Tab, label: 'Felhasználók', icon: <Users className="w-5 h-5" /> },
    { id: 'invitations' as Tab, label: 'Meghívók', icon: <Mail className="w-5 h-5" /> },
    { id: 'products' as Tab, label: 'Termékek', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'variants' as Tab, label: 'Variánsok', icon: <Package className="w-5 h-5" /> },
    { id: 'shipping' as Tab, label: 'Szállítás', icon: <Truck className="w-5 h-5" /> },
    { id: 'messages' as Tab, label: 'Üzenetek', icon: <MessageSquare className="w-5 h-5" /> },
  ]

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Admin Panel</h1>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8 bg-white p-2 rounded-2xl card-elevated">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 card-elevated">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <UserPlus className="w-6 h-6 mr-2" />
                Új felhasználó létrehozása
              </h2>
              <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Név"
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <input
                  type="password"
                  placeholder="Jelszó"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="USER">Felhasználó</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <button
                  type="submit"
                  className="md:col-span-2 px-8 py-3 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all"
                >
                  Felhasználó létrehozása
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl p-8 card-elevated">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Felhasználók listája</h2>
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50"
                  >
                    <div>
                      <div className="font-semibold text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Szerepkör: {user.role === 'ADMIN' ? 'Admin' : 'Felhasználó'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Invitations Tab */}
        {activeTab === 'invitations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 card-elevated">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Send className="w-6 h-6 mr-2" />
                Meghívó küldése
              </h2>
              <form onSubmit={handleSendInvitation} className="flex gap-4">
                <input
                  type="email"
                  placeholder="Email cím"
                  required
                  value={newInvitation.email}
                  onChange={(e) => setNewInvitation({ email: e.target.value })}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-8 py-3 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all"
                >
                  Küldés
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl p-8 card-elevated">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Meghívók listája</h2>
              <div className="space-y-4">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-xl bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-900">{inv.email}</div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          inv.used
                            ? 'bg-green-100 text-green-800'
                            : new Date() > new Date(inv.expiresAt)
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {inv.used ? 'Felhasználva' : new Date() > new Date(inv.expiresAt) ? 'Lejárt' : 'Aktív'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">Token: {inv.token}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Lejárat: {new Date(inv.expiresAt).toLocaleDateString('hu-HU')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 card-elevated">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Plus className="w-6 h-6 mr-2" />
                Új termék hozzáadása
              </h2>
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <input
                  type="text"
                  placeholder="Termék neve"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <textarea
                  placeholder="Leírás"
                  required
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  rows={3}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Ár (Ft)"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Kategória"
                    required
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
                <FileUpload
                  label="Termék Kép"
                  folder="products"
                  currentImage={newProduct.imageUrl}
                  onUpload={(url) => setNewProduct({ ...newProduct, imageUrl: url })}
                />
                <button
                  type="submit"
                  className="w-full px-8 py-3 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all"
                >
                  Termék hozzáadása
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl p-8 card-elevated">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Termékek listája</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 rounded-xl bg-gray-50 space-y-3"
                  >
                    <div className="font-semibold text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-600">{product.description}</div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">
                        {product.price.toLocaleString('hu-HU')} Ft
                      </span>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-2xl p-8 card-elevated">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Beérkezett üzenetek</h2>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-6 rounded-xl bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-gray-900">{msg.name}</div>
                      <div className="text-sm text-gray-600">{msg.email}</div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(msg.createdAt).toLocaleDateString('hu-HU')}
                    </div>
                  </div>
                  <div className="font-semibold text-gray-800 mb-2">{msg.subject}</div>
                  <div className="text-gray-600">{msg.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shipping Tab */}
        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 card-elevated">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Truck className="w-6 h-6 mr-2" />
                Új szállítási mód hozzáadása
              </h2>
              <form onSubmit={handleCreateShipping} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Név (pl. GLS futár)"
                  required
                  value={newShipping.name}
                  onChange={(e) => setNewShipping({ ...newShipping, name: e.target.value })}
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <input
                  type="text"
                  placeholder="Leírás"
                  required
                  value={newShipping.description}
                  onChange={(e) => setNewShipping({ ...newShipping, description: e.target.value })}
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ár (Ft)"
                  required
                  value={newShipping.price}
                  onChange={(e) => setNewShipping({ ...newShipping, price: e.target.value })}
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <input
                  type="text"
                  placeholder="Szállítási idő (pl. 1-3 nap)"
                  required
                  value={newShipping.estimatedDays}
                  onChange={(e) => setNewShipping({ ...newShipping, estimatedDays: e.target.value })}
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <button
                  type="submit"
                  className="md:col-span-2 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Szállítási mód létrehozása</span>
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl p-8 card-elevated">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Szállítási módok</h2>
              <div className="space-y-4">
                {shippingMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-6 rounded-xl bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{method.name}</div>
                      <div className="text-sm text-gray-600">{method.description}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {method.price} Ft • {method.estimatedDays}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleShipping(method.id, method.active)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          method.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {method.active ? 'Aktív' : 'Inaktív'}
                      </button>
                      <button
                        onClick={() => handleDeleteShipping(method.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Variants Tab */}
        {activeTab === 'variants' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 card-elevated">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Package className="w-6 h-6 mr-2" />
                Új termék variáns hozzáadása
              </h2>
              <form onSubmit={handleCreateVariant} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={newVariant.productId}
                  onChange={(e) => setNewVariant({ ...newVariant, productId: e.target.value })}
                  required
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">Válassz terméket</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Variáns név (pl. 12V 2A)"
                  required
                  value={newVariant.name}
                  onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <input
                  type="text"
                  placeholder="SKU kód"
                  required
                  value={newVariant.sku}
                  onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Feszültség (V) - opcionális"
                  value={newVariant.voltage}
                  onChange={(e) => setNewVariant({ ...newVariant, voltage: e.target.value })}
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Áram (A) - opcionális"
                  value={newVariant.current}
                  onChange={(e) => setNewVariant({ ...newVariant, current: e.target.value })}
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <input
                  type="number"
                  placeholder="Cellák száma - opcionális"
                  value={newVariant.cells}
                  onChange={(e) => setNewVariant({ ...newVariant, cells: e.target.value })}
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <input
                  type="text"
                  placeholder="Cella típus (pl. Li-ion) - opcionális"
                  value={newVariant.cellType}
                  onChange={(e) => setNewVariant({ ...newVariant, cellType: e.target.value })}
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ár (Ft)"
                  required
                  value={newVariant.price}
                  onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <input
                  type="number"
                  placeholder="Készlet"
                  required
                  value={newVariant.stock}
                  onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })}
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <button
                  type="submit"
                  className="md:col-span-2 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Variáns létrehozása</span>
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl p-8 card-elevated">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Termék variánsok</h2>
              <div className="space-y-4">
                {variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-center justify-between p-6 rounded-xl bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{variant.name}</div>
                      <div className="text-sm text-gray-600">SKU: {variant.sku}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {variant.voltage && `${variant.voltage}V `}
                        {variant.current && `${variant.current}A `}
                        {variant.cells && `${variant.cells} cellás `}
                        {variant.cellType && `(${variant.cellType})`}
                      </div>
                      <div className="text-sm font-medium text-gray-700 mt-1">
                        {variant.price} Ft • Készlet: {variant.stock} db
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteVariant(variant.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
