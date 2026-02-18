'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.errors?.[0]?.message || data.message || 'Une erreur est survenue.')
        setLoading(false)
        return
      }
      setSent(true)
    } catch {
      setError('Impossible d\'envoyer l\'email. Réessayez plus tard.')
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="bg-[#fdfbf7] min-h-screen py-24 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-100 text-teal-600 mb-6">
            <CheckCircle size={28} />
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-800 mb-2">Email envoyé</h1>
          <p className="text-stone-600 mb-8">
            Si un compte existe avec cette adresse, vous recevrez un lien pour réinitialiser votre mot de passe.
          </p>
          <Link href="/connexion">
            <Button variant="outline" className="rounded-xl">
              <ArrowLeft size={18} className="mr-2" /> Retour à la connexion
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#fdfbf7] min-h-screen py-16 md:py-24 px-4">
      <div className="max-w-md mx-auto">
        <Link href="/connexion" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 text-sm font-medium mb-8">
          <ArrowLeft size={18} /> Retour à la connexion
        </Link>
        <h1 className="text-3xl font-serif font-bold text-stone-800 mb-2">Mot de passe oublié</h1>
        <p className="text-stone-600 mb-8">Indiquez votre email pour recevoir un lien de réinitialisation.</p>

        <form onSubmit={handleSubmit} className="bg-white border border-stone-200 rounded-2xl p-8 shadow-xl shadow-stone-200/50 space-y-6">
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
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl font-bold bg-teal-600 hover:bg-teal-700 text-white"
          >
            {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
          </Button>
        </form>
      </div>
    </div>
  )
}
