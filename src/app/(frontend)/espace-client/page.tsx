import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { Mail, Plus, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCurrentUser } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Mon espace',
  description: 'Tableau de bord de votre espace client CartePostale.cool',
}

export const dynamic = 'force-dynamic'

export default async function EspaceClientDashboardPage() {
  const user = await getCurrentUser()
  if (!user) return null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-stone-800">
          Bonjour{user.name ? ` ${user.name}` : ''} 👋
        </h1>
        <p className="text-stone-600 mt-1">
          Bienvenue dans votre espace client. Gérez vos cartes postales et votre compte.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/espace-client/cartes"
          className="group flex items-start gap-4 p-6 rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center shrink-0 group-hover:bg-teal-200 transition-colors">
            <Mail className="w-6 h-6 text-teal-600" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-stone-800 group-hover:text-teal-700">Mes cartes</h2>
            <p className="text-sm text-stone-500 mt-0.5">
              Voir, modifier et gérer toutes vos cartes postales.
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 mt-2">
              Accéder <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </Link>

        <Link
          href="/editor"
          className="group flex items-start gap-4 p-6 rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0 group-hover:bg-orange-200 transition-colors">
            <Plus className="w-6 h-6 text-orange-600" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-stone-800 group-hover:text-orange-700">Créer une carte</h2>
            <p className="text-sm text-stone-500 mt-0.5">
              Nouvelle carte postale avec vos photos et votre message.
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 mt-2">
              Créer <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </Link>

        <Link
          href="/espace-client/compte"
          className="group flex items-start gap-4 p-6 rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center shrink-0 group-hover:bg-teal-200 transition-colors">
            <Sparkles className="w-6 h-6 text-teal-600" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-stone-800 group-hover:text-teal-700">Mon compte</h2>
            <p className="text-sm text-stone-500 mt-0.5">
              Informations personnelles et préférences.
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 mt-2">
              Voir le profil <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </Link>
      </div>

      <div className="p-6 rounded-2xl bg-stone-50 border border-stone-100">
        <h3 className="font-bold text-stone-800 mb-2">Raccourci</h3>
        <p className="text-stone-600 text-sm mb-4">
          Vous pouvez à tout moment créer une nouvelle carte depuis le menu ou le bouton ci-dessous.
        </p>
        <Link href="/editor">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl gap-2">
            <Plus size={20} /> Créer une carte
          </Button>
        </Link>
      </div>
    </div>
  )
}
