'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'

export default function AgencyLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
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
        setError(
          data.errors?.[0]?.message ||
            data.message ||
            (res.status === 401 ? 'Email ou mot de passe incorrect.' : 'Une erreur est survenue.'),
        )
        setLoading(false)
        return
      }
      // Redirect to agency dashboard
      router.push('/espace-agence')
      router.refresh()
    } catch {
      setError('Impossible de se connecter. Vérifiez votre connexion.')
      setLoading(false)
    }
  }

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  return (
    <div className="bg-[#f0fdfa] min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-teal-100 rounded-full blur-[100px] opacity-40 -translate-y-1/2" />

      <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-8 relative z-10 border border-teal-50">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-50 rounded-2xl mb-6 text-teal-600">
            <LogIn size={32} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-teal-900 mb-2">Espace Pro & Agence</h1>
          <p className="text-stone-500">Connectez-vous pour gérer votre flotte de cartes.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle size={20} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {googleClientId && (
            <div className="space-y-6">
              <GoogleLoginButton redirectPath="/espace-agence" />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-stone-500 font-medium whitespace-nowrap">
                    Ou connectez-vous par email
                  </span>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-bold text-teal-900 uppercase tracking-wide"
            >
              Email professionnel
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-300" />
              <Input
                id="email"
                type="email"
                placeholder="agence@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-12 h-12 text-base rounded-xl border-teal-100 bg-teal-50/30 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-teal-900 placeholder:text-teal-900/40"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-bold text-teal-900 uppercase tracking-wide"
              >
                Mot de passe
              </label>
              <Link
                href="/connexion/mot-de-passe-oublie"
                className="text-xs font-semibold text-teal-500 hover:text-teal-600"
              >
                Oublié ?
              </Link>
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-300" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-12 h-12 text-base rounded-xl border-teal-100 bg-teal-50/30 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-teal-900 placeholder:text-teal-900/40"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl font-bold text-lg bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20 disabled:opacity-70 transition-all mt-4"
          >
            {loading ? 'Connexion en cours...' : 'Accéder à mon espace'}
          </Button>
        </form>

        <div className="mt-8 text-center pt-8 border-t border-stone-100">
          <p className="text-stone-500 text-sm mb-2">Pas encore partenaire ?</p>
          <Link href="/contact" className="text-teal-600 font-bold hover:underline">
            Demander une ouverture de compte
          </Link>
        </div>
      </div>
    </div>
  )
}
