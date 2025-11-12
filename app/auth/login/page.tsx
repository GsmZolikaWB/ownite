'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Helytelen email vagy jelszó')
      } else {
        router.push('/shop')
        router.refresh()
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Hiba történt a bejelentkezés során')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="absolute inset-0 brushed-metal opacity-30"></div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white rounded-3xl card-elevated p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-900 text-white mb-4">
              <LogIn className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bejelentkezés</h1>
            <p className="text-gray-600">Lépjen be a fiókjába a webshop eléréséhez</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-800 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email cím
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="email@pelda.hu"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jelszó
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-8 py-4 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all card-elevated disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Bejelentkezés...' : 'Bejelentkezés'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Még nincs fiókja?{' '}
              <Link
                href="/auth/register"
                className="font-semibold text-gray-900 hover:underline"
              >
                Regisztráció meghívóval
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
