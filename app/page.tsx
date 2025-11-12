'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Cpu,
  Cog,
  Zap,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  CheckCircle,
  Factory,
  BarChart3,
} from 'lucide-react'

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        setSubmitStatus('error')
      }
    } catch (err) {
    console.error(err)
      console.error(err);
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const features = [
    {
      icon: <Cpu className="w-8 h-8" />,
      title: 'PLC Programozás',
      description: 'Ipari automatizálási rendszerek tervezése és programozása',
    },
    {
      icon: <Cog className="w-8 h-8" />,
      title: 'Mechatronikai Rendszerek',
      description: 'Komplex gépek és berendezések integrálása és optimalizálása',
    },
    {
      icon: <Factory className="w-8 h-8" />,
      title: 'Gyártási Folyamatok',
      description: 'Termelési vonalak automatizálása és hatékonyság növelése',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Robotika',
      description: 'Ipari robotok programozása és beüzemelése',
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'SCADA Rendszerek',
      description: 'Felügyeleti és adatgyűjtő rendszerek fejlesztése',
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: 'Minőségbiztosítás',
      description: 'Automatizált tesztelési és ellenőrzési folyamatok',
    },
  ]

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
        <div className="absolute inset-0 brushed-metal opacity-30"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Automatizálási
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-900">
                Megoldások
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Professzionális mechatronikai mérnöki szolgáltatások ipari automatizálási
              projektekhez
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="group inline-flex items-center justify-center px-8 py-4 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all card-elevated hover:scale-105"
              >
                Kapcsolatfelvétel
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#services"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-gray-900 hover:bg-gray-50 transition-all card-elevated border border-gray-200"
              >
                Szolgáltatások
              </a>
            </div>
          </motion.div>

          {/* Floating Elements */}
          <div className="absolute top-20 left-10 animate-pulse">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-400 opacity-20 rotate-12"></div>
          </div>
          <div className="absolute bottom-20 right-10 animate-pulse delay-75">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-gray-400 to-gray-500 opacity-20 -rotate-12"></div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Szakértelmem
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Komplex automatizálási megoldások tervezése és megvalósítása
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group p-8 rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 card-elevated hover:scale-105"
              >
                <div className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Kapcsolat
            </h2>
            <p className="text-xl text-gray-600">
              Vegye fel velem a kapcsolatot projektje megbeszéléséhez
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 card-elevated"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Név
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tárgy
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Üzenet
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {submitStatus === 'success' && (
                  <div className="p-4 rounded-xl bg-green-50 text-green-800 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Üzenet sikeresen elküldve!
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="p-4 rounded-xl bg-red-50 text-red-800">
                    Hiba történt az üzenet küldése közben. Kérem próbálja újra.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-8 py-4 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-all card-elevated disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Küldés...' : 'Üzenet Küldése'}
                </button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="bg-white rounded-3xl p-8 card-elevated">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center text-white flex-shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">info@mechatronics.hu</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 card-elevated">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center text-white flex-shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Telefon</h3>
                    <p className="text-gray-600">+36 XX XXX XXXX</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 card-elevated">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center text-white flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Elérhetőség</h3>
                    <p className="text-gray-600">Budapest, Magyarország</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 card-elevated text-white">
                <h3 className="text-2xl font-bold mb-4">Kezdjük el együtt!</h3>
                <p className="text-gray-300 mb-6">
                  Automatizálási projektje megvalósításához tapasztalt szakembert keres?
                  Vegye fel velem a kapcsolatot, és beszéljük meg, hogyan segíthetek.
                </p>
                <div className="flex items-center space-x-2 text-gray-300">
                  <CheckCircle className="w-5 h-5" />
                  <span>Ingyenes konzultáció</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 Mechatronics Engineering. Minden jog fenntartva.
          </p>
        </div>
      </footer>
    </div>
  )
}
