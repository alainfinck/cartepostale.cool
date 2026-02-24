'use client'

import { useState, useCallback, useEffect } from 'react'
import { Copy, ExternalLink, Check, FileText, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type LandingPage = {
  id: string
  title: string
  description: string
  path: string
  icon: typeof Building2
  audience: string
}

const landingPages: LandingPage[] = [
  {
    id: 'agences',
    title: 'Landing Agences & Pro',
    description:
      'Page de conversion pour les agences : avantages pros, marque blanche, photothèque, stats et tarifs dédiés agences.',
    path: '/agences',
    icon: Building2,
    audience: 'Agences, offices de tourisme, réseaux d’hébergement',
  },
  {
    id: 'business',
    title: 'Page Business (générale)',
    description:
      'Présentation complète du service marque blanche pour tous types de professionnels.',
    path: '/business',
    icon: FileText,
    audience: 'Entreprises, destinations, établissements',
  },
]

export function ManagerLandingPagesClient() {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const getFullUrl = useCallback(
    (path: string) => {
      return `${origin}${path}`
    },
    [origin],
  )

  const copyLink = useCallback(
    (page: LandingPage) => {
      const url = getFullUrl(page.path)
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(page.id)
        setTimeout(() => setCopiedId(null), 2000)
      })
    },
    [getFullUrl],
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pages de conversion</h1>
        <p className="text-muted-foreground mt-1">
          Liens des landing pages à envoyer à vos clients (agences, prospects) pour présenter le
          service et les tarifs.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {landingPages.map((page) => {
          const fullUrl = getFullUrl(page.path)
          const isCopied = copiedId === page.id
          const Icon = page.icon
          return (
            <Card key={page.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{page.title}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">{page.audience}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{page.description}</p>
                <div className="flex gap-2">
                  <Input readOnly value={fullUrl} className="font-mono text-xs bg-muted/50" />
                  <Button
                    variant="outline"
                    size="icon"
                    title="Copier le lien"
                    onClick={() => copyLink(page)}
                    className="shrink-0"
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    title="Ouvrir dans un nouvel onglet"
                    asChild
                    className="shrink-0"
                  >
                    <a href={page.path} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => copyLink(page)}>
                    {isCopied ? 'Copié !' : 'Copier le lien'}
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <a href={page.path} target="_blank" rel="noopener noreferrer">
                      Ouvrir la page <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-dashed bg-muted/30">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Conseil :</strong> Envoyez le lien « Landing Agences » à vos prospects agences
            par email ou incluez-le dans vos propositions commerciales. La page présente le service,
            les avantages pour les pros et les tarifs dédiés marque blanche.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
