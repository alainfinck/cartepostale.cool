'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { LogIn, Mail, Lock, AlertCircle, UserPlus, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ConnexionClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialFlipped = useMemo(() => searchParams.get('inscription') === '1', [searchParams])

  const [flipped, setFlipped] = useState(initialFlipped)

  // Connexion
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Inscription
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupName, setSignupName] = useState('')
  const [signupError, setSignupError] = useState<string | null>(null)
  const [signupLoading, setSignupLoading] = useState(false)

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
        setError(data.errors?.[0]?.message || data.message || (res.status === 401 ? 'Email ou mot de passe incorrect.' : 'Une erreur est survenue.'))
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignupError(null)
    setSignupLoading(true)
    try {
      const createRes = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
          name: signupName || undefined,
        }),
        credentials: 'include',
      })
      const createData = await createRes.json().catch(() => ({}))
      if (!createRes.ok) {
        setSignupError(createData.errors?.[0]?.message || createData.message || 'Une erreur est survenue.')
        setSignupLoading(false)
        return
      }
      // Connexion automatique après inscription
      const loginRes = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signupEmail, password: signupPassword }),
        credentials: 'include',
      })
      if (!loginRes.ok) {
        setSignupError('Compte créé. Connectez-vous avec vos identifiants.')
        setFlipped(false)
        setSignupLoading(false)
        return
      }
      router.push('/espace-client')
      router.refresh()
    } catch {
      setSignupError('Impossible de créer le compte. Réessayez.')
      setSignupLoading(false)
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
              {flipped ? 'Créer un compte' : 'Connexion'}
            </h1>
            <p className="text-stone-600">
              {flipped
                ? 'Inscrivez-vous pour gérer vos cartes postales.'
                : 'Connectez-vous pour gérer vos cartes postales.'}
            </p>
          </div>

          {/* Carte recto-verso — hauteur unique pour le verso (inscription plus haut) */}
          <div className="perspective-1000 min-h-[520px]">
            <div
              className="relative w-full min-h-[520px] transform-style-3d"
              style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              {/* Recto : Connexion */}
              <div
                className="absolute inset-0 w-full backface-hidden rounded-2xl overflow-hidden"
                style={{ transform: 'rotateY(0deg)' }}
              >
                <form
                  onSubmit={handleLogin}
                  className="h-full min-h-[520px] bg-white border border-stone-200 rounded-2xl p-8 shadow-xl shadow-stone-200/50 space-y-6 flex flex-col"
                >
                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                      <AlertCircle size={18} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-stone-700">Email</label>
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
                    <label htmlFor="password" className="text-sm font-medium text-stone-700">Mot de passe</label>
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
                  <div className="pt-2">
                    <Link href="/connexion/mot-de-passe-oublié" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
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
                  <button
                    type="button"
                    onClick={() => setFlipped(true)}
                    className="text-sm text-stone-500 hover:text-teal-600 font-medium mt-auto pt-2"
                  >
                    Pas encore de compte ? <span className="text-teal-600 underline">Créer un compte</span>
                  </button>
                </form>
              </div>

              {/* Verso : Inscription */}
              <div
                className="absolute inset-0 w-full backface-hidden rounded-2xl overflow-hidden"
                style={{ transform: 'rotateY(180deg)' }}
              >
                <form
                  onSubmit={handleSignup}
                  className="h-full min-h-[520px] bg-white border border-stone-200 rounded-2xl p-8 shadow-xl shadow-stone-200/50 space-y-5 flex flex-col"
                >
                  {signupError && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                      <AlertCircle size={18} className="shrink-0" />
                      <span>{signupError}</span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <label htmlFor="signup-name" className="text-sm font-medium text-stone-700">Nom (optionnel)</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Votre nom"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        className="pl-10 h-12 rounded-xl border-stone-200 bg-stone-50 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="signup-email" className="text-sm font-medium text-stone-700">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="vous@exemple.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                        className="pl-10 h-12 rounded-xl border-stone-200 bg-stone-50 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="signup-password" className="text-sm font-medium text-stone-700">Mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        minLength={8}
                        className="pl-10 h-12 rounded-xl border-stone-200 bg-stone-50 focus:ring-teal-500"
                      />
                    </div>
                    <p className="text-xs text-stone-500">Minimum 8 caractères</p>
                  </div>
                  <Button
                    type="submit"
                    disabled={signupLoading}
                    className="w-full h-12 rounded-xl font-bold text-base bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25 disabled:opacity-70 mt-auto"
                  >
                    {signupLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Création...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <UserPlus size={20} /> Créer mon compte
                      </span>
                    )}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setFlipped(false)}
                    className="text-sm text-stone-500 hover:text-teal-600 font-medium pt-2"
                  >
                    Déjà un compte ? <span className="text-teal-600 underline">Se connecter</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
