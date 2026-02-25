'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Code, Copy, Check, ArrowRight, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const DEMO_SLUG = 'demo-anniv'

function buildIframeCode(origin: string, slug: string): string {
  return `<iframe src="${origin}/carte/${slug}?embed=1" width="100%" height="600" style="border:none; border-radius:12px; overflow:hidden;" title="Carte Postale"></iframe>`
}

export default function IntegrerClient() {
  const [origin, setOrigin] = useState('https://www.cartepostale.cool')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin)
    }
  }, [])

  const iframeCode = buildIframeCode(origin, DEMO_SLUG)

  const handleCopy = () => {
    navigator.clipboard.writeText(iframeCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
          Intégrer une carte postale sur votre site
        </h1>
        <p className="text-stone-600 text-lg leading-relaxed">
          Particuliers, pros, blogs ou sites d&apos;agences : affichez le composant carte postale (effet
          recto/verso uniquement) directement sur votre page avec un simple code à copier-coller.
          Aucune compétence technique avancée requise.
        </p>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="text-xl font-bold text-stone-800 mb-6">En 3 étapes</h2>
          <ol className="space-y-6 list-decimal list-inside text-stone-600">
            <li className="pl-2">
              <strong className="text-stone-800">Créez et publiez une carte</strong> sur
              CartePostale.cool.{' '}
              <Link
                href="/editor"
                className="text-teal-600 hover:text-teal-700 font-medium underline underline-offset-2"
              >
                Créer une carte
              </Link>
            </li>
            <li className="pl-2">
              <strong className="text-stone-800">Récupérez l&apos;URL de la carte</strong> une fois
              publiée (ex. <code className="bg-stone-100 px-1.5 py-0.5 rounded text-sm">https://www.cartepostale.cool/carte/VOTRE_PUBLIC_ID</code>).
              L&apos;identifiant de la carte est visible dans cette URL.
            </li>
            <li className="pl-2">
              <strong className="text-stone-800">Insérez le code iframe</strong> dans votre page
              HTML ou votre CMS, en remplaçant l&apos;identifiant d&apos;exemple par le vôtre (voir
              ci-dessous).
            </li>
          </ol>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-stone-50/50 p-6 md:p-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
              <Code size={20} className="text-teal-600" />
              Code à copier
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="shrink-0 border-stone-300 text-stone-700 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700"
            >
              {copied ? (
                <>
                  <Check size={16} className="mr-2 text-teal-600" />
                  Copié
                </>
              ) : (
                <>
                  <Copy size={16} className="mr-2" />
                  Copier le code
                </>
              )}
            </Button>
          </div>
          <Input
            readOnly
            value={iframeCode}
            className="font-mono text-xs md:text-sm text-stone-600 bg-white border-stone-200 focus-visible:ring-teal-500 pr-4"
          />
          <p className="mt-4 text-sm text-stone-500">
            Remplacez <code className="bg-stone-200/80 px-1.5 py-0.5 rounded font-mono text-stone-700">{DEMO_SLUG}</code> par
            l&apos;identifiant de votre carte (visible dans l&apos;URL une fois la carte publiée).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-stone-800 mb-4">Aperçu du rendu</h2>
          <div className="rounded-2xl border border-stone-200 overflow-hidden bg-white shadow-sm">
            <iframe
              src={`${origin}/carte/${DEMO_SLUG}?embed=1`}
              title="Aperçu carte postale intégrée"
              className="w-full border-0"
              style={{ height: '560px' }}
            />
          </div>
        </section>

        <section className="flex flex-wrap gap-4 pt-4">
          <Link href="/editor">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-95 text-white rounded-xl font-semibold shadow-lg shadow-pink-500/25 inline-flex items-center gap-2">
              Créer une carte <ArrowRight size={18} />
            </Button>
          </Link>
          <Link href="/espace-client">
            <Button variant="outline" className="rounded-xl border-stone-300 text-stone-700 inline-flex items-center gap-2">
              <ExternalLink size={18} />
              Espace client
            </Button>
          </Link>
        </section>
      </div>
    </div>
  )
}
