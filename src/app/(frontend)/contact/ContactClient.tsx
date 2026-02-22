'use client'

import React, { useState } from 'react'
import { Mail, MapPin, MessageSquare, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useFacebookPixel } from '@/hooks/useFacebookPixel'

export default function ContactClient() {
  const { trackLead } = useFacebookPixel()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulation d'envoi (le backend n'est pas forcément prêt)
    // On track quand même le Lead car l'intention est là
    trackLead({ content_name: 'Formulaire de Contact' })

    setTimeout(() => {
      setLoading(false)
      setIsSubmitted(true)
    }, 1500)
  }

  if (isSubmitted) {
    return (
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-stone-100 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-teal-600" />
        </div>
        <h3 className="text-2xl font-bold text-stone-800 mb-4 font-serif">Message envoyé !</h3>
        <p className="text-stone-600 mb-8">
          Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais
          (généralement sous 24h).
        </p>
        <Button
          onClick={() => setIsSubmitted(false)}
          className="bg-stone-900 hover:bg-black text-white px-8 py-3 rounded-xl"
        >
          Envoyer un autre message
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-stone-100">
      <h3 className="text-2xl font-bold text-stone-800 mb-6 font-serif">Envoyez-nous un message</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-stone-700">
              Nom
            </label>
            <Input
              id="name"
              required
              placeholder="Votre nom"
              className="bg-stone-50 border-stone-200 focus:ring-teal-500"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-stone-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              required
              placeholder="votre@email.com"
              className="bg-stone-50 border-stone-200 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm font-medium text-stone-700">
            Sujet
          </label>
          <select
            id="subject"
            required
            className="w-full h-10 px-3 rounded-md border border-stone-200 bg-stone-50 text-stone-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Sélectionnez un sujet</option>
            <option value="order">Problème avec ma commande</option>
            <option value="question">Question générale</option>
            <option value="partnership">Partenariat / Presse</option>
            <option value="other">Autre</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="text-sm font-medium text-stone-700">
            Message
          </label>
          <Textarea
            id="message"
            required
            placeholder="Dites-nous tout..."
            className="min-h-[150px] bg-stone-50 border-stone-200 focus:ring-teal-500"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full py-6 text-lg font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-600/20"
        >
          {loading ? 'Envoi en cours...' : 'Envoyer le message'}
        </Button>
      </form>
    </div>
  )
}
