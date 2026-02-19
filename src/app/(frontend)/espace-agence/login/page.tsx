'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google'
import { loginWithGoogle } from './actions'

function GoogleLoginButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true)
      try {
        const result = await loginWithGoogle(tokenResponse.access_token)
        if (result.error) {
          setError(result.error)
        } else {
          router.push('/espace-agence')
          router.refresh()
        }
      } catch (_err) {
        setError('Erreur lors de la connexion Google.')
      } finally {
        setLoading(false)
      }
    },
    onError: () => {
      setError('La connexion Google a échoué.')
    },
  })

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={loading}
        onClick={() => login()}
        className="w-full h-12 rounded-xl font-bold text-lg border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800 transition-all flex items-center justify-center gap-3 relative overflow-hidden"
      >
        {loading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continuer avec Google
          </>
        )}
      </Button>
      {error && <div className="mt-2 text-center text-sm text-red-600 font-medium">{error}</div>}
    </>
  )
}

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

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      <div className="bg-[#f0fdfa] min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-teal-100 rounded-full blur-[100px] opacity-40 -translate-y-1/2" />

        <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-8 relative z-10 border border-teal-50">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-50 rounded-2xl mb-6 text-teal-600">
              <LogIn size={32} />
            </div>
            <h1 className="text-3xl font-serif font-bold text-teal-900 mb-2">
              Espace Pro & Agence
            </h1>
            <p className="text-stone-500">Connectez-vous pour gérer votre flotte de cartes.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle size={20} className="shrink-0" />
                <span>{error}</span>
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou</span>
              </div>
            </div>

            <GoogleLoginButton />
          </form>

          <div className="mt-8 text-center pt-8 border-t border-stone-100">
            <p className="text-stone-500 text-sm mb-2">Pas encore partenaire ?</p>
            <Link href="/contact" className="text-teal-600 font-bold hover:underline">
              Demander une ouverture de compte
            </Link>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}
