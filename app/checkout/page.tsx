'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/app/context/CartContext'
import { Truck, CreditCard, MapPin, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface ShippingMethod {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: string
  active: boolean
}

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { items, total, clearCart } = useCart()

  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([])
  const [selectedShipping, setSelectedShipping] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)

  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    country: 'Magyarország',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }

    if (items.length === 0 && !orderSuccess) {
      router.push('/shop')
    }
  }, [status, items, router, orderSuccess])

  useEffect(() => {
    const fetchShipping = async () => {
      try {
        const res = await fetch('/api/admin/shipping')
        const data = await res.json()
        const activeMethods = data.filter((m: ShippingMethod) => m.active)
        setShippingMethods(activeMethods)
        if (activeMethods.length > 0) {
          setSelectedShipping(activeMethods[0].id)
        }
      } catch (error) {
        console.error('Error fetching shipping methods:', error)
      }
    }

    fetchShipping()
  }, [])

  useEffect(() => {
    if (session?.user) {
      setShippingAddress((prev) => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || '',
      }))
    }
  }, [session])

  const selectedShippingMethod = shippingMethods.find(m => m.id === selectedShipping)
  const shippingCost = selectedShippingMethod?.price || 0
  const finalTotal = total + shippingCost

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedShipping || !paymentMethod) {
      alert('Kérem válasszon szállítási és fizetési módot!')
      return
    }

    setIsProcessing(true)

    try {
      const orderData = {
        items,
        shippingAddress: `${shippingAddress.name}, ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.zip}, ${shippingAddress.country}`,
        shippingMethodId: selectedShipping,
        shippingCost,
        paymentMethod,
        totalAmount: finalTotal,
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      const data = await res.json()

      if (res.ok) {
        // Handle different payment methods
        if (paymentMethod === 'paypal') {
          // Redirect to PayPal checkout
          if (data.paypalUrl) {
            window.location.href = data.paypalUrl
          } else {
            alert('PayPal fizetés jelenleg nem érhető el')
          }
        } else if (paymentMethod === 'revolut') {
          // Redirect to Revolut checkout
          if (data.revolutUrl) {
            window.location.href = data.revolutUrl
          } else {
            alert('Revolut fizetés jelenleg nem érhető el')
          }
        } else if (paymentMethod === 'cash_on_delivery') {
          // Cash on delivery - show success
          setOrderSuccess(true)
          clearCart()
        }
      } else {
        alert(`Hiba történt: ${data.error || 'Ismeretlen hiba'}`)
      }
    } catch (error) {
      console.error('Order error:', error)
      alert('Hiba történt a rendelés leadása során')
    } finally {
      setIsProcessing(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-gray-600">Betöltés...</div>
      </div>
    )
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl p-12 card-elevated text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Rendelés sikeresen leadva!
            </h1>
            <p className="text-gray-600 mb-8">
              Köszönjük a rendelését! Hamarosan e-mailben értesítjük a rendelés állapotáról.
            </p>
            <Link
              href="/shop"
              className="inline-block px-6 py-3 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all"
            >
              Vissza a webshopba
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/cart"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Vissza a kosárhoz
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Pénztár</h1>

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-2xl p-8 card-elevated">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <MapPin className="w-6 h-6 mr-2" />
                  Szállítási cím
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Teljes név *"
                    required
                    value={shippingAddress.name}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                    className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <input
                    type="email"
                    placeholder="Email cím *"
                    required
                    value={shippingAddress.email}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                    className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <input
                    type="tel"
                    placeholder="Telefonszám *"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <input
                    type="text"
                    placeholder="Ország"
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                    className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <input
                    type="text"
                    placeholder="Város *"
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <input
                    type="text"
                    placeholder="Irányítószám *"
                    required
                    value={shippingAddress.zip}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, zip: e.target.value })}
                    className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <input
                    type="text"
                    placeholder="Utca, házszám *"
                    required
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                    className="md:col-span-2 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>

              {/* Shipping Method */}
              <div className="bg-white rounded-2xl p-8 card-elevated">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Truck className="w-6 h-6 mr-2" />
                  Szállítási mód
                </h2>
                <div className="space-y-3">
                  {shippingMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedShipping === method.id
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="shipping"
                          value={method.id}
                          checked={selectedShipping === method.id}
                          onChange={(e) => setSelectedShipping(e.target.value)}
                          className="mr-4"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">{method.name}</div>
                          <div className="text-sm text-gray-600">
                            {method.description} • {method.estimatedDays}
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-gray-900">
                        {method.price === 0 ? 'Ingyenes' : `${method.price.toLocaleString('hu-HU')} Ft`}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl p-8 card-elevated">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <CreditCard className="w-6 h-6 mr-2" />
                  Fizetési mód
                </h2>
                <div className="space-y-3">
                  <label
                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'paypal'
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-4"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">PayPal</div>
                      <div className="text-sm text-gray-600">Biztonságos fizetés PayPal-on keresztül</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'revolut'
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="revolut"
                      checked={paymentMethod === 'revolut'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-4"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">Revolut Pay</div>
                      <div className="text-sm text-gray-600">Gyors és biztonságos fizetés Revolut-tal</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'cash_on_delivery'
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cash_on_delivery"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-4"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">Utánvét</div>
                      <div className="text-sm text-gray-600">Fizetés átvételkor, készpénzzel</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 card-elevated sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Rendelés összesítő</h2>

                <div className="space-y-3 mb-6">
                  <div className="space-y-2 pb-3 border-b border-gray-200">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="font-medium text-gray-900">
                          {(item.price * item.quantity).toLocaleString('hu-HU')} Ft
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Részösszeg</span>
                    <span>{total.toLocaleString('hu-HU')} Ft</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Szállítás</span>
                    <span>
                      {shippingCost === 0 ? 'Ingyenes' : `${shippingCost.toLocaleString('hu-HU')} Ft`}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3 flex justify-between text-xl font-bold text-gray-900">
                    <span>Összesen</span>
                    <span>{finalTotal.toLocaleString('hu-HU')} Ft</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing || !selectedShipping || !paymentMethod}
                  className="w-full px-6 py-4 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {isProcessing ? 'Feldolgozás...' : 'Rendelés leadása'}
                </button>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  A rendelés leadásával elfogadja az Általános Szerződési Feltételeket
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
