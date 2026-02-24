'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Postcard as PayloadPostcard, Media } from '@/payload-types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Code, Copy, Check, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Props {
  postcards: PayloadPostcard[]
}

function isMedia(media: any): media is Media {
  return media && typeof media === 'object' && 'url' in media
}

function getFrontImageUrl(postcard: PayloadPostcard): string {
  let url = ''
  if (postcard.frontImageURL) url = postcard.frontImageURL
  else if (isMedia(postcard.frontImage) && postcard.frontImage.url) url = postcard.frontImage.url
  else url = 'https://img.cartepostale.cool/demo/photo-1507525428034-b723cf961d3e.jpg'

  return url
}

export default function DevClient({ postcards }: Props) {
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const publishedPostcards = postcards.filter((p) => p.status === 'published')

  const handleCopy = (id: number, publicId: string) => {
    // Assuming the app runs on a domain known as NEXT_PUBLIC_APP_URL, or window.location.origin
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://cartepostale.cool'
    const iframeCode = `<iframe src="${origin}/carte/${publicId}" width="100%" height="600" style="border:none; border-radius:12px; overflow:hidden;" title="Carte Postale ${publicId}"></iframe>`

    navigator.clipboard.writeText(iframeCode)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (publishedPostcards.length === 0) {
    return (
      <Card className="p-8 text-center text-stone-500 bg-stone-50/50 border-stone-200 shadow-sm">
        <Code className="mx-auto h-12 w-12 text-stone-300 mb-3" />
        <h3 className="text-lg font-medium text-stone-800 mb-1">Aucune carte publiée</h3>
        <p className="text-sm text-stone-500 max-w-sm mx-auto">
          Publiez au moins une carte postale pour générer un code d&apos;intégration iframe.
        </p>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {publishedPostcards.map((postcard) => {
        const origin =
          typeof window !== 'undefined' ? window.location.origin : 'https://cartepostale.cool'
        const iframeCode = `<iframe src="${origin}/carte/${postcard.publicId}" width="100%" height="600" style="border:none; border-radius:12px; overflow:hidden;" title="Carte Postale ${postcard.publicId}"></iframe>`

        return (
          <Card
            key={postcard.id}
            className="overflow-hidden flex flex-col hover:border-teal-200 transition-colors duration-200"
          >
            <div className="relative h-48 w-full bg-stone-100">
              <Image
                src={getFrontImageUrl(postcard)}
                alt="Front image"
                fill
                className="object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge className="bg-emerald-100/90 text-emerald-700 hover:bg-emerald-100/90 border-emerald-200/50 backdrop-blur-sm">
                  Publiée
                </Badge>
              </div>
            </div>

            <CardContent className="p-5 flex-1 flex flex-col gap-4">
              <div>
                <div className="font-semibold text-stone-800 line-clamp-1">
                  {postcard.recipientName || postcard.publicId}
                </div>
                <div className="text-xs text-stone-500 mt-0.5">ID: {postcard.publicId}</div>
              </div>

              <div className="mt-auto space-y-2">
                <div className="text-xs font-semibold text-stone-700 uppercase tracking-widest flex items-center justify-between">
                  <span>Code Iframe</span>
                  <a
                    href={`/carte/${postcard.publicId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-600 hover:text-teal-700 flex items-center gap-1 normal-case font-medium"
                  >
                    <ExternalLink size={12} />
                    Aperçu
                  </a>
                </div>
                <div className="relative">
                  <Input
                    readOnly
                    value={iframeCode}
                    className="font-mono text-[10px] pr-12 text-stone-600 bg-stone-50 border-stone-200 focus-visible:ring-teal-500"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-stone-400 hover:text-teal-600 hover:bg-teal-50"
                    onClick={() => handleCopy(postcard.id, postcard.publicId)}
                    title="Copier le code"
                  >
                    {copiedId === postcard.id ? (
                      <Check size={14} className="text-teal-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
