'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { UserPlus, Mail, Lock, User } from 'lucide-react'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const invitationToken = searchParams.get('token')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    invitationToken: invitationToken || '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('A jelszavak nem egyeznek')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('A jelszónak legalább 8 karakter hosszúnak kell lennie')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          invitationToken: formData.invitationToken,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Hiba történt a regisztráció során')
      } else {
        router.push('/auth/login?registered=true')
      }
    } catch (err) {
    console.error(err)
      setError('Hiba történt a regisztráció során')
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
              <UserPlus className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Regisztráció</h1>
            <p className="text-gray-600">Hozzon létre fiókot a webshop eléréséhez</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-800 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meghívó kód
              </label>
              <input
                type="text"
                required
                value={formData.invitationToken}
                onChange={(e) =>
                  setFormData({ ...formData, invitationToken: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="Meghívó kód"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teljes név
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  placeholder="Kovács János"
                />
              </div>
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jelszó megerősítése
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
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
              {isLoading ? 'Regisztráció...' : 'Regisztráció'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Már van fiókja?{' '}
              <Link
                href="/auth/login"
                className="font-semibold text-gray-900 hover:underline"
              >
                Bejelentkezés
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-16 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-gray-600">Betöltés...</div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
