'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import {
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Code,
  LayoutTemplate,
  Mail,
  Sparkles,
} from 'lucide-react'
import type { Postcard as PayloadPostcard, Media } from '@/payload-types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Props {
  agencyCode: string | null
  agencyName: string
  postcards: PayloadPostcard[]
}

function isMedia(media: unknown): media is Media {
  return !!media && typeof media === 'object' && 'url' in media
}

function getFrontImageUrl(postcard: PayloadPostcard): string {
  if (postcard.frontImageURL) return postcard.frontImageURL
  if (isMedia(postcard.frontImage) && postcard.frontImage?.url) return postcard.frontImage.url
  return 'https://img.cartepostale.cool/demo/photo-1507525428034-b723cf961d3e.jpg'
}

export default function QrIntegrationClient({
  agencyCode,
  agencyName,
  postcards,
}: Props) {
  const [origin, setOrigin] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [copiedCardId, setCopiedCardId] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin)
  }, [])

  const publicPageUrl = agencyCode && origin ? `${origin}/agences/${agencyCode}` : null
  const pageEmbedCode =
    publicPageUrl &&
    `<iframe src="${publicPageUrl}" width="100%" height="800" style="border:none; border-radius:12px; overflow:hidden;" title="Page ${agencyName}"></iframe>`

  const ctaEmbedUrl = agencyCode && origin ? `${origin}/agences/${agencyCode}/embed` : null
  const ctaEmbedCode =
    ctaEmbedUrl &&
    `<iframe src="${ctaEmbedUrl}" width="100%" height="220" style="border:none; border-radius:12px; overflow:hidden;" title="Créez une carte postale - ${agencyName}"></iframe>`

  const handleCopy = (text: string, id?: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id ?? 'ok')
    setTimeout(() => setCopied(null), 2000)
  }

  const handleCopyCard = (id: number, publicId: string) => {
    const code = `<iframe src="${origin}/carte/${publicId}?embed=1" width="100%" height="600" style="border:none; border-radius:12px; overflow:hidden;" title="Carte Postale ${publicId}"></iframe>`
    navigator.clipboard.writeText(code)
    setCopiedCardId(id)
    setTimeout(() => setCopiedCardId(null), 2000)
  }

  const publishedPostcards = postcards.filter((p) => p.status === 'published')

  if (!agencyCode) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">
          QR code & intégration
        </h1>
        <Card className="p-8 text-center text-stone-500 bg-stone-50/50 border-stone-200">
          <p>Aucun code agence associé. Vérifiez la configuration de votre agence.</p>
          <Button asChild className="mt-4">
            <Link href="/espace-agence/agence">Mon agence</Link>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">
          QR code & intégration
        </h1>
        <p className="text-stone-500 mt-1">
          Gérez votre QR code et récupérez les codes à intégrer sur votre site.
        </p>
      </div>

      {/* QR code */}
      <Card className="border-stone-200 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <QrCode className="h-5 w-5 text-teal-600" />
            Votre QR code
          </CardTitle>
          <CardDescription>
            Scannez ce QR code pour ouvrir votre page agence publique.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-6 items-start">
          {publicPageUrl && (
            <>
              <div className="flex-shrink-0 rounded-lg border border-stone-200 bg-white p-4">
                <QRCodeSVG value={publicPageUrl} size={160} level="M" />
              </div>
              <div className="flex-1 space-y-3 min-w-0">
                <p className="text-sm text-stone-600">Lien de la page :</p>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={publicPageUrl}
                    className="font-mono text-xs bg-stone-50 border-stone-200"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleCopy(publicPageUrl, 'url')}
                    title="Copier le lien"
                  >
                    {copied === 'url' ? (
                      <Check className="h-4 w-4 text-teal-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <a
                  href={publicPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ouvrir la page
                </a>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Embed page agence */}
      {pageEmbedCode && (
        <Card className="border-stone-200 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <LayoutTemplate className="h-5 w-5 text-teal-600" />
              Intégrer votre page agence
            </CardTitle>
            <CardDescription>
              Copiez ce code et collez-le dans le HTML de votre site pour afficher votre page
              agence dans un cadre.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Input
                readOnly
                value={pageEmbedCode}
                className="font-mono text-[10px] pr-12 bg-stone-50 border-stone-200"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => handleCopy(pageEmbedCode, 'page-embed')}
                title="Copier le code"
              >
                {copied === 'page-embed' ? (
                  <Check className="h-4 w-4 text-teal-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bloc CTA à intégrer sur le site */}
      {ctaEmbedUrl && ctaEmbedCode && (
        <Card className="border-stone-200 overflow-hidden border-teal-200/60 bg-gradient-to-b from-white to-teal-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-teal-600" />
              Bloc à intégrer sur votre site
            </CardTitle>
            <CardDescription>
              Invitez vos visiteurs à créer une carte postale virtuelle gratuite pour leurs
              vacances — le bouton mène vers votre page agence.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-2 shadow-inner">
              <p className="text-xs font-medium text-stone-500 mb-2 px-1">Aperçu du bloc</p>
              <div className="rounded-lg overflow-hidden border border-stone-200 bg-white min-h-[200px]">
                <iframe
                  src={ctaEmbedUrl}
                  title="Aperçu bloc CTA"
                  className="w-full h-[220px] border-0"
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-stone-700 mb-2">Code à copier-coller</p>
              <div className="relative">
                <Input
                  readOnly
                  value={ctaEmbedCode}
                  className="font-mono text-[10px] pr-12 bg-stone-50 border-stone-200"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => handleCopy(ctaEmbedCode, 'cta-embed')}
                  title="Copier le code"
                >
                  {copied === 'cta-embed' ? (
                    <Check className="h-4 w-4 text-teal-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Embed cartes */}
      <Card className="border-stone-200 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-teal-600" />
            Intégrer vos cartes postales
          </CardTitle>
          <CardDescription>
            Codes iframe pour afficher chaque carte publiée sur votre site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {publishedPostcards.length === 0 ? (
            <div className="py-8 text-center text-stone-500 bg-stone-50/50 rounded-lg border border-dashed border-stone-200">
              <Code className="mx-auto h-10 w-10 text-stone-300 mb-2" />
              <p className="text-sm font-medium text-stone-700">Aucune carte publiée</p>
              <p className="text-xs text-stone-500 mt-1">
                Publiez des cartes dans l’onglet Cartes pour obtenir des codes d’intégration.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link href="/espace-agence/cartes">Voir les cartes</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {publishedPostcards.map((postcard) => {
                const iframeCode = `<iframe src="${origin}/carte/${postcard.publicId}?embed=1" width="100%" height="600" style="border:none; border-radius:12px; overflow:hidden;" title="Carte Postale ${postcard.publicId}"></iframe>`
                return (
                  <div
                    key={postcard.id}
                    className="rounded-lg border border-stone-200 bg-stone-50/50 overflow-hidden flex flex-col"
                  >
                    <div className="relative h-36 w-full bg-stone-100">
                      <Image
                        src={getFrontImageUrl(postcard)}
                        alt=""
                        fill
                        className="object-cover"
                      />
                      <Badge className="absolute top-2 right-2 bg-emerald-100 text-emerald-700 border-emerald-200/50 text-[10px]">
                        Publiée
                      </Badge>
                    </div>
                    <div className="p-3 flex-1 flex flex-col gap-2">
                      <p className="font-medium text-stone-800 text-sm truncate">
                        {postcard.recipientName || postcard.publicId}
                      </p>
                      <p className="text-[10px] text-stone-500">ID: {postcard.publicId}</p>
                      <div className="flex gap-2 mt-auto">
                        <Input
                          readOnly
                          value={iframeCode}
                          className="font-mono text-[9px] flex-1 min-w-0 bg-white border-stone-200"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          className="shrink-0 h-8 w-8"
                          onClick={() => handleCopyCard(postcard.id, postcard.publicId)}
                          title="Copier"
                        >
                          {copiedCardId === postcard.id ? (
                            <Check className="h-3.5 w-3.5 text-teal-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                      <a
                        href={`/carte/${postcard.publicId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-teal-600 hover:text-teal-700 flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Aperçu
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
