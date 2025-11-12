'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Settings, Save } from 'lucide-react'
import FileUpload from '@/app/components/FileUpload'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [settings, setSettings] = useState({
    siteName: '',
    logo: '',
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
    contactPhoto: '',
    heroImage: '',
    aboutText: '',
  })

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      setSettings(data)
    } catch (err) {
      console.error('Error fetching settings:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/')
    } else if (status === 'authenticated') {
      fetchSettings()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session, router])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (res.ok) {
        alert('Beállítások sikeresen mentve!')
      } else {
        throw new Error('Failed to save')
      }
    } catch (err) {
      console.error('Error saving settings:', err)
      alert('Hiba történt a mentés során')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-gray-600">Betöltés...</div>
      </div>
    )
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Settings className="w-8 h-8 text-gray-900" />
            <h1 className="text-4xl font-bold text-gray-900">Oldal Beállítások</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Mentés...' : 'Mentés'}</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-8 card-elevated space-y-8">
          {/* General Settings */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Általános</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Oldal Neve
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) =>
                    setSettings({ ...settings, siteName: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <FileUpload
                label="Logó"
                folder="logos"
                currentImage={settings.logo}
                onUpload={(url) => setSettings({ ...settings, logo: url })}
              />
            </div>
          </section>

          {/* Contact Settings */}
          <section className="pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Kapcsolat</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, contactEmail: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefonszám
                </label>
                <input
                  type="text"
                  value={settings.contactPhone}
                  onChange={(e) =>
                    setSettings({ ...settings, contactPhone: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cím
                </label>
                <input
                  type="text"
                  value={settings.contactAddress}
                  onChange={(e) =>
                    setSettings({ ...settings, contactAddress: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <FileUpload
                label="Kapcsolat Fotó"
                folder="contact"
                currentImage={settings.contactPhoto}
                onUpload={(url) => setSettings({ ...settings, contactPhoto: url })}
              />
            </div>
          </section>

          {/* Homepage Settings */}
          <section className="pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Főoldal</h2>
            <div className="space-y-4">
              <FileUpload
                label="Hero Kép"
                folder="hero"
                currentImage={settings.heroImage}
                onUpload={(url) => setSettings({ ...settings, heroImage: url })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rólam Szöveg
                </label>
                <textarea
                  value={settings.aboutText || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, aboutText: e.target.value })
                  }
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                  placeholder="Rövid bemutatkozás..."
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
