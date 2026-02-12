'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ConnexionClient() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        const message =
          data.errors?.[0]?.message ||
          data.message ||
          (res.status === 401 ? 'Email ou mot de passe incorrect.' : 'Une erreur est survenue.')
        setError(message)
        setLoading(false)
        return
      }

      router.push('/espace-client')
      router.refresh()
    } catch {
      setError('Impossible de se connecter. Vérifiez votre connexion.')
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#fdfbf7] min-h-screen">
      <section className="relative py-16 md:py-24 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-200 rounded-full blur-3xl opacity-20 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-200 rounded-full blur-3xl opacity-15 translate-x-1/2 translate-y-1/2" />

        <div className="relative max-w-md mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 mb-2">
              Connexion
            </h1>
            <p className="text-stone-600">
              Connectez-vous pour gérer vos cartes postales.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white border border-stone-200 rounded-2xl p-8 shadow-xl shadow-stone-200/50 space-y-6"
          >
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-stone-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-12 rounded-xl border-stone-200 bg-stone-50 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-stone-700">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 h-12 rounded-xl border-stone-200 bg-stone-50 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
              <Link
                href="/connexion/mot-de-passe-oublié"
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl font-bold text-base bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/25 disabled:opacity-70"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <LogIn size={20} /> Se connecter
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-stone-500 text-sm mt-6">
            Pas encore de compte ?{' '}
            <Link href="/connexion/inscription" className="text-teal-600 hover:text-teal-700 font-medium">
              Créer un compte
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
