'use client'

import React, { useState, useTransition, useCallback, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  LayoutGrid,
  List,
  Eye,
  Share2,
  Mail,
  Trash2,
  ChevronDown,
  ExternalLink,
  MapPin,
  Calendar,
  User,
  Users,
  Archive,
  FileText,
  BarChart3,
  ArrowUpDown,
  Building2,
  Image as ImageIcon,
  Cloud,
  LogOut,
  Menu,
  User as UserIcon,
  Link2,
  Copy,
  MessageCircle,
  Send,
  Gift,
  CreditCard,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Pencil, PenTool, RotateCcw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { getOptimizedImageUrl } from '@/lib/image-processing'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Minus } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Postcard as PayloadPostcard, Media, PostcardTrackingLink } from '@/payload-types'
import {
  getAllPostcards,
  updatePostcardStatus,
  deletePostcard,
  updatePostcard,
  updatePostcardStatusBulk,
  deletePostcardsBulk,
  PostcardsResult,
} from '@/actions/manager-actions'
import {
  getMyPostcards,
  updateMyPostcard,
  updateMyPostcardStatus,
  deleteMyPostcard,
  duplicateMyPostcard,
  setMyPostcardPublicVisibility,
  createTrackingLink,
  getTrackingLinksForPostcard,
  sendTrackingLinkByEmail,
  type CreateTrackingLinkData,
} from '@/actions/espace-client-actions'
import { getPostcardViewStats, type PostcardViewStats } from '@/actions/postcard-view-stats'
import {
  getUmamiPageStats,
  getDetailedUmamiStats,
  type DetailedUmamiStats,
} from '@/actions/umami-actions'
import {
  getAgencyPostcards,
  updateAgencyPostcard,
  updateAgencyPostcardStatus,
  deleteAgencyPostcard,
  getAgencyPostcardViewStats,
  createAgencyTrackingLink,
  getAgencyTrackingLinks,
  sendAgencyTrackingLinkByEmail,
} from '@/actions/agence-actions'
import { redeemPromoCodeForCredits } from '@/actions/leads-actions'
import PostcardView from '@/components/postcard/PostcardView'
import ShareContributionModal from '@/components/postcard/ShareContributionModal'
import { Postcard as FrontendPostcard, MediaItem } from '@/types'
import EditPostcardDialog from './EditPostcardDialog'

export type StatusFilter = 'all' | 'published' | 'draft' | 'archived'
type ViewMode = 'grid' | 'list'

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

function mapToFrontend(p: PayloadPostcard): FrontendPostcard {
  const mediaItems: MediaItem[] = (p.mediaItems || [])
    .map((item: any) => {
      if (isMedia(item.media)) {
        let url = item.media.url || ''
        if (!url && item.media.filename) {
          url = `/media/${item.media.filename}`
        }
        return {
          id: item.id || Math.random().toString(36).substring(7),
          type: item.type === 'video' ? ('video' as const) : ('image' as const),
          url: item.type === 'video' ? url : getOptimizedImageUrl(url, { width: 800 }),
        }
      }
      return null
    })
    .filter((item): item is MediaItem => item !== null)

  return {
    id: p.publicId,
    frontImage: getFrontImageUrl(p),
    message: p.message || '',
    recipientName: p.recipientName || '',
    senderName: p.senderName || '',
    location: p.location || '',
    stampStyle: p.stampStyle || 'classic',
    stampLabel: p.stampLabel || undefined,
    stampYear: p.stampYear || undefined,
    date: new Date(p.date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    mediaItems,
    isPremium: p.isPremium || false,
    coords: p.coords?.lat && p.coords?.lng ? { lat: p.coords.lat, lng: p.coords.lng } : undefined,
  }
}

const statusConfig = {
  published: {
    label: 'Publiée',
    color: 'bg-emerald-100/80 text-emerald-700 border-emerald-200/50 backdrop-blur-sm',
  },
  draft: {
    label: 'Brouillon',
    color: 'bg-amber-100/80 text-amber-700 border-amber-200/50 backdrop-blur-sm',
  },
  archived: {
    label: 'Archivée',
    color: 'bg-stone-100/80 text-stone-500 border-stone-200/50 backdrop-blur-sm',
  },
} as const

interface Props {
  initialData: PostcardsResult
  /** When true, use espace-client Server Actions (getMyPostcards, etc.) instead of manager actions. */
  useEspaceClientActions?: boolean
  /** When true, use agence Server Actions (getAgencyPostcards, etc.) instead of manager actions. */
  useAgenceActions?: boolean
  /** For espace-client: display remaining credits and buy-credits CTA when set. */
  initialCredits?: number
  userId?: string | number
  userEmail?: string | null
}

export default function ManagerClient({
  initialData,
  useEspaceClientActions,
  useAgenceActions,
  initialCredits,
  userId,
  userEmail,
}: Props) {
  const [data, setData] = useState(initialData)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedPostcard, setSelectedPostcard] = useState<PayloadPostcard | null>(null)
  const [viewStats, setViewStats] = useState<PostcardViewStats | null>(null)
  const [isPending, startTransition] = useTransition()
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [editingPostcard, setEditingPostcard] = useState<PayloadPostcard | null>(null)
  const [editingIsDuplicate, setEditingIsDuplicate] = useState(false)
  const [columns, setColumns] = useState(3)
  const [isAuto, setIsAuto] = useState(true)
  const [trackingLinks, setTrackingLinks] = useState<PostcardTrackingLink[]>([])
  const [detailedUmamiStats, setDetailedUmamiStats] = useState<DetailedUmamiStats | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [deleteConfirmBulkIds, setDeleteConfirmBulkIds] = useState<number[] | null>(null)
  const [umamiStats, setUmamiStats] = useState<Record<string, number>>({})
  const [promoDialogOpen, setPromoDialogOpen] = useState(false)
  const [promoCodeInput, setPromoCodeInput] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoResult, setPromoResult] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [buyCreditsModalOpen, setBuyCreditsModalOpen] = useState(false)
  const [buyCreditsPack, setBuyCreditsPack] = useState<string>('pack_20')
  const [buyCreditsPromoCode, setBuyCreditsPromoCode] = useState('')
  const [buyCreditsPromoResult, setBuyCreditsPromoResult] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [buyCreditsLoading, setBuyCreditsLoading] = useState(false)
  const [buyCreditsError, setBuyCreditsError] = useState<string | null>(null)
  const [editorModalPostcard, setEditorModalPostcard] = useState<PayloadPostcard | null>(null)
  const [shareContributionModalOpen, setShareContributionModalOpen] = useState(false)
  const maxAutoColumns = useEspaceClientActions ? 3 : 6

  const CREDITS_PACKS = [
    { id: 'pack_5', label: '5 cartes', credits: 5, price: 12 },
    { id: 'pack_10', label: '10 cartes', credits: 10, price: 22 },
    { id: 'pack_20', label: '20 cartes', credits: 20, price: 40, popular: true },
    { id: 'pack_50', label: '50 cartes', credits: 50, price: 95 },
    { id: 'pack_100', label: '100 cartes', credits: 100, price: 150 },
    { id: 'pack_200', label: '200 cartes', credits: 200, price: 280 },
  ]
  const selectedPackInfo = CREDITS_PACKS.find((p) => p.id === buyCreditsPack) ?? CREDITS_PACKS[2]

  useEffect(() => {
    getUmamiPageStats().then(setUmamiStats)
  }, [])

  useEffect(() => {
    if (!isAuto) return

    const updateCols = () => {
      const w = window.innerWidth
      let nextColumns = 6
      if (w < 640) nextColumns = 1
      else if (w < 1024) nextColumns = 2
      else if (w < 1280) nextColumns = 3
      else if (w < 1536) nextColumns = 4
      else if (w < 1920) nextColumns = 5
      setColumns(Math.min(nextColumns, maxAutoColumns))
    }

    updateCols()
    window.addEventListener('resize', updateCols)
    return () => window.removeEventListener('resize', updateCols)
  }, [isAuto, maxAutoColumns])

  useEffect(() => {
    setColumns((prev) => Math.min(prev, maxAutoColumns))
  }, [maxAutoColumns])

  const showTrackingLinks = useEspaceClientActions || useAgenceActions

  useEffect(() => {
    if (!selectedPostcard) {
      setViewStats(null)
      setTrackingLinks([])
      return
    }
    if (useAgenceActions) {
      getAgencyPostcardViewStats(selectedPostcard.id).then(setViewStats)
      getAgencyTrackingLinks(selectedPostcard.id).then((res) => {
        setTrackingLinks(res.success && res.links ? res.links : [])
      })
    } else if (useEspaceClientActions) {
      getPostcardViewStats(selectedPostcard.id).then(setViewStats)
      getTrackingLinksForPostcard(selectedPostcard.id).then((res) => {
        setTrackingLinks(res.success && res.links ? res.links : [])
      })
    } else {
      getPostcardViewStats(selectedPostcard.id).then(setViewStats)
      setTrackingLinks([])
    }

    getDetailedUmamiStats(selectedPostcard.publicId).then(setDetailedUmamiStats)
  }, [selectedPostcard?.id, selectedPostcard?.publicId, useEspaceClientActions, useAgenceActions])

  const postcards = data.docs

  // Stats
  const totalCards = data.totalDocs
  const publishedCount = postcards.filter((p) => p.status === 'published').length
  const draftCount = postcards.filter((p) => p.status === 'draft').length
  const archivedCount = postcards.filter((p) => p.status === 'archived').length
  const totalViews = postcards.reduce((sum, p) => sum + (p.views || 0), 0)
  const totalShares = postcards.reduce((sum, p) => sum + (p.shares || 0), 0)
  const totalUmamiViews = Object.values(umamiStats).reduce((sum, v) => sum + v, 0)

  const fetchPostcards = useAgenceActions
    ? async (filters?: { status?: StatusFilter; search?: string }) =>
        getAgencyPostcards({
          status: filters?.status !== 'all' ? filters?.status : undefined,
          search: filters?.search,
        })
    : useEspaceClientActions
      ? async (filters?: { status?: StatusFilter; search?: string }) =>
          getMyPostcards({
            status: filters?.status !== 'all' ? filters?.status : undefined,
            search: filters?.search,
          })
      : async (filters: any) => getAllPostcards(filters)
  const updatePostcardFn = useAgenceActions
    ? updateAgencyPostcard
    : useEspaceClientActions
      ? updateMyPostcard
      : updatePostcard
  const updatePostcardStatusFn = useAgenceActions
    ? updateAgencyPostcardStatus
    : useEspaceClientActions
      ? updateMyPostcardStatus
      : updatePostcardStatus
  const deletePostcardFn = useAgenceActions
    ? deleteAgencyPostcard
    : useEspaceClientActions
      ? deleteMyPostcard
      : deletePostcard
  const canDuplicatePostcard = Boolean(useEspaceClientActions)
  const canTogglePublicVisibility = Boolean(useEspaceClientActions)

  const refreshData = useCallback(
    (statusF?: StatusFilter, searchQ?: string) => {
      startTransition(async () => {
        const filters: any = {}
        const s = statusF ?? statusFilter
        const q = searchQ ?? search
        if (s !== 'all') filters.status = s
        if (q.trim()) filters.search = q.trim()
        const result = await fetchPostcards(filters)
        setData(result)
      })
    },
    [statusFilter, search, fetchPostcards],
  )

  const handleSearch = (value: string) => {
    setSearch(value)
    refreshData(undefined, value)
  }

  const handleStatusFilter = (status: StatusFilter) => {
    setStatusFilter(status)
    refreshData(status, undefined)
  }

  const handleUpdateStatus = (id: number, newStatus: 'published' | 'draft' | 'archived') => {
    startTransition(async () => {
      const result = await updatePostcardStatusFn(id, newStatus)
      if (result.success) {
        refreshData()
      } else if (result.error) {
        alert(result.error)
      }
    })
  }

  const handleDelete = (id: number) => {
    startTransition(async () => {
      const result = await deletePostcardFn(id)
      if (result.success) {
        setDeleteConfirm(null)
        if (selectedPostcard?.id === id) setSelectedPostcard(null)
        refreshData()
      } else if (result.error) {
        alert(result.error)
      }
    })
  }

  const handleDuplicate = (id: number) => {
    if (!canDuplicatePostcard) return

    startTransition(async () => {
      const result = await duplicateMyPostcard(id)
      if (result.success) {
        if (result.postcard) {
          setSelectedPostcard(result.postcard)
          setEditingIsDuplicate(true)
          setEditingPostcard(result.postcard)
        }
        refreshData()
      } else if (result.error) {
        alert(result.error)
      }
    })
  }

  const handleSetPublicVisibility = (id: number, isPublic: boolean) => {
    if (!canTogglePublicVisibility) return
    startTransition(async () => {
      const result = await setMyPostcardPublicVisibility(id, isPublic)
      if (result.success) {
        refreshData()
        if (selectedPostcard?.id === id) {
          setSelectedPostcard((prev) => (prev ? { ...prev, isPublic } : prev))
        }
      } else if (result.error) {
        alert(result.error)
      }
    })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const toggleSelectAll = () => {
    if (selectedIds.size === postcards.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(postcards.map((p) => p.id)))
  }
  const clearSelection = () => setSelectedIds(new Set())

  const handleBulkStatus = (newStatus: 'published' | 'draft' | 'archived') => {
    const ids = Array.from(selectedIds)
    if (!ids.length) return
    startTransition(async () => {
      if (useEspaceClientActions || useAgenceActions) {
        for (const id of ids) {
          await updatePostcardStatusFn(id, newStatus)
        }
      } else {
        const result = await updatePostcardStatusBulk(ids, newStatus)
        if (!result.success && result.error) {
          alert(result.error)
          return
        }
      }
      clearSelection()
      refreshData()
    })
  }

  const handleBulkDeleteConfirm = () => {
    const ids = deleteConfirmBulkIds ?? []
    if (!ids.length) {
      setDeleteConfirmBulkIds(null)
      return
    }
    startTransition(async () => {
      if (useEspaceClientActions || useAgenceActions) {
        for (const id of ids) {
          await deletePostcardFn(id)
        }
      } else {
        const result = await deletePostcardsBulk(ids)
        if (!result.success && result.error) {
          alert(result.error)
          setDeleteConfirmBulkIds(null)
          return
        }
      }
      setDeleteConfirmBulkIds(null)
      if (selectedPostcard && ids.includes(selectedPostcard.id)) setSelectedPostcard(null)
      clearSelection()
      refreshData()
    })
  }

  return (
    <div className="space-y-6">
      <>
        {/* Crédits (espace client) */}
        {useEspaceClientActions && initialCredits != null && (
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-teal-200/60 bg-teal-50/40 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">
                  Mes crédits restants
                </p>
                <p className="text-2xl font-bold text-teal-700">{initialCredits}</p>
              </div>
            </div>
            <Button
              variant="default"
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 text-white shadow-md"
              onClick={() => {
                setBuyCreditsModalOpen(true)
                setBuyCreditsError(null)
                setBuyCreditsPromoResult(null)
                setBuyCreditsPromoCode('')
              }}
            >
              <CreditCard size={16} className="mr-2" />
              Acheter des crédits / cartes
            </Button>
          </div>
        )}

        {/* Modal Acheter des crédits */}
        <Dialog open={buyCreditsModalOpen} onOpenChange={setBuyCreditsModalOpen}>
          <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles size={20} className="text-teal-600" />
                Acheter des crédits / cartes
              </DialogTitle>
              <DialogDescription>
                Choisissez un pack de cartes pré-payées. Vous pourrez les utiliser pour publier vos
                cartes sans repasser par le paiement.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div>
                <p className="text-sm font-medium text-stone-700 mb-2">Choisir un pack</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CREDITS_PACKS.map((pack) => (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => setBuyCreditsPack(pack.id)}
                      className={cn(
                        'flex flex-col p-3 rounded-xl border-2 text-left transition-all',
                        buyCreditsPack === pack.id
                          ? 'border-teal-500 bg-teal-50 text-teal-800'
                          : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700',
                      )}
                    >
                      <span className="font-bold text-stone-900">{pack.credits} cartes</span>
                      <span className="text-sm font-semibold text-teal-600 mt-0.5">
                        {pack.price} €
                      </span>
                      {pack.popular && (
                        <span className="mt-1 text-[10px] font-bold text-teal-600 uppercase">
                          Populaire
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-stone-50 border border-stone-200 p-4">
                <span className="font-medium text-stone-700">Total</span>
                <span className="text-xl font-bold text-teal-700">{selectedPackInfo.price} €</span>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">Code promo (optionnel)</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex. COOLOS"
                    value={buyCreditsPromoCode}
                    onChange={(e) => setBuyCreditsPromoCode(e.target.value.toUpperCase().trim())}
                    className="font-mono uppercase flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        redeemPromoCodeForCredits(buyCreditsPromoCode).then((res) => {
                          if (res?.success) {
                            setBuyCreditsPromoResult({
                              type: 'success',
                              message: `+${res.creditsAdded ?? 1} crédit ajouté !`,
                            })
                            refreshData()
                            setBuyCreditsPromoCode('')
                          } else {
                            setBuyCreditsPromoResult({
                              type: 'error',
                              message: res?.error ?? 'Code invalide ou déjà utilisé.',
                            })
                          }
                        })
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => {
                      if (!buyCreditsPromoCode.trim()) return
                      setBuyCreditsPromoResult(null)
                      redeemPromoCodeForCredits(buyCreditsPromoCode).then((res) => {
                        if (res?.success) {
                          setBuyCreditsPromoResult({
                            type: 'success',
                            message: `+${res.creditsAdded ?? 1} crédit ajouté !`,
                          })
                          refreshData()
                          setBuyCreditsPromoCode('')
                        } else {
                          setBuyCreditsPromoResult({
                            type: 'error',
                            message: res?.error ?? 'Code invalide ou déjà utilisé.',
                          })
                        }
                      })
                    }}
                  >
                    Appliquer
                  </Button>
                </div>
                {buyCreditsPromoResult && (
                  <p
                    className={cn(
                      'text-sm',
                      buyCreditsPromoResult.type === 'success'
                        ? 'text-teal-600 font-medium'
                        : 'text-rose-600',
                    )}
                  >
                    {buyCreditsPromoResult.message}
                  </p>
                )}
              </div>
              {buyCreditsError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-600 font-medium">
                  {buyCreditsError}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBuyCreditsModalOpen(false)}>
                Annuler
              </Button>
              <Button
                className="bg-teal-600 hover:bg-teal-700"
                disabled={buyCreditsLoading}
                onClick={async () => {
                  setBuyCreditsError(null)
                  setBuyCreditsLoading(true)
                  try {
                    const res = await fetch('/api/revolut/create-order', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        amountEur: selectedPackInfo.price,
                        description: `Pack ${selectedPackInfo.credits} cartes - CartePostale.cool`,
                        customerEmail: userEmail ?? undefined,
                        redirectPath: '/espace-client/cartes?payment_success=true',
                        metadata: {
                          userId: userId?.toString(),
                          paymentType: selectedPackInfo.id,
                        },
                      }),
                    })
                    const data = await res.json()
                    if (!res.ok)
                      throw new Error(data.error || 'Erreur lors de la création du paiement')
                    if (data.checkout_url) {
                      window.location.href = data.checkout_url
                    } else {
                      throw new Error('URL de paiement manquante')
                    }
                  } catch (err: any) {
                    setBuyCreditsError(err.message || 'Une erreur est survenue')
                    setBuyCreditsLoading(false)
                  }
                }}
              >
                {buyCreditsLoading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Redirection...
                  </>
                ) : (
                  <>Payer {selectedPackInfo.price} €</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard icon={<Mail size={18} />} label="Total" value={totalCards} />
          <StatCard icon={<Eye size={18} />} label="Vues (Int)" value={totalViews} variant="info" />
          <StatCard
            icon={<Share2 size={18} />}
            label="Partages"
            value={totalShares}
            variant="info"
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-card/50 backdrop-blur-md p-4 rounded-xl border border-border/50 shadow-sm">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Rechercher par nom, lieu, message..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 bg-background/50 border-border/50 focus-visible:ring-teal-500/30"
            />
          </div>

          <div className="flex gap-1 bg-muted/30 p-1 rounded-lg border border-border/30">
            {(['all', 'published', 'draft', 'archived'] as StatusFilter[]).map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleStatusFilter(s)}
                className={cn(
                  'px-3 text-xs h-8',
                  statusFilter === s && 'bg-background shadow-sm hover:bg-background',
                )}
              >
                {s === 'all' ? 'Tous' : statusConfig[s].label}
              </Button>
            ))}
          </div>

          <div className="flex gap-1 rounded-lg border border-border/30 p-1 bg-muted/30">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className={cn(
                'h-8 w-8',
                viewMode === 'grid' && 'bg-background shadow-sm hover:bg-background',
              )}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={16} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className={cn(
                'h-8 w-8',
                viewMode === 'list' && 'bg-background shadow-sm hover:bg-background',
              )}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </Button>
          </div>

          {viewMode === 'grid' && (
            <div className="flex gap-1 rounded-lg border border-border/30 p-1 bg-muted/30">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:bg-muted"
                onClick={() => {
                  setColumns(Math.max(1, columns - 1))
                  setIsAuto(false)
                }}
                disabled={columns <= 1}
              >
                <Minus size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'flex items-center justify-center min-w-[40px] px-2 text-xs font-bold transition-all',
                  isAuto
                    ? 'text-teal-600 bg-teal-50/50 rounded-md ring-1 ring-teal-500/20 shadow-[0_0_10px_rgba(20,184,166,0.1)]'
                    : 'text-stone-600',
                )}
                onClick={() => setIsAuto(!isAuto)}
                title={isAuto ? 'Passer en mode manuel' : 'Passer en mode automatique'}
              >
                {columns}
                {isAuto && (
                  <span className="ml-1 text-[8px] font-black tracking-tighter opacity-70">
                    AUTO
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:bg-muted"
                onClick={() => {
                  setColumns(Math.min(maxAutoColumns, columns + 1))
                  setIsAuto(false)
                }}
                disabled={columns >= maxAutoColumns}
              >
                <Plus size={14} />
              </Button>
            </div>
          )}
        </div>

        {/* Bulk actions bar */}
        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-teal-200/60 bg-teal-50/50 backdrop-blur-sm shadow-sm">
            <span className="text-sm font-medium text-teal-800">
              {selectedIds.size} carte{selectedIds.size > 1 ? 's' : ''} sélectionnée
              {selectedIds.size > 1 ? 's' : ''}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-teal-700 hover:bg-teal-100"
              onClick={clearSelection}
            >
              Tout désélectionner
            </Button>
            <div className="h-4 w-px bg-teal-200" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white border-teal-200 text-teal-800 hover:bg-teal-100"
                >
                  <ArrowUpDown size={14} className="mr-2" />
                  Changer le statut
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {(['published', 'draft', 'archived'] as const).map((s) => (
                  <DropdownMenuItem key={s} onClick={() => handleBulkStatus(s)} className="gap-2">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        s === 'published'
                          ? 'bg-emerald-500'
                          : s === 'draft'
                            ? 'bg-amber-500'
                            : 'bg-stone-400',
                      )}
                    />
                    {statusConfig[s].label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-700 hover:bg-red-50"
              onClick={() => setDeleteConfirmBulkIds(Array.from(selectedIds))}
            >
              <Trash2 size={14} className="mr-2" />
              Supprimer
            </Button>
          </div>
        )}

        {/* Loading overlay */}
        {isPending && (
          <div className="flex items-center gap-2 text-sm text-stone-500">
            <div className="w-4 h-4 border-2 border-stone-300 border-t-teal-500 rounded-full animate-spin" />
            Chargement...
          </div>
        )}

        {/* Content */}
        {postcards.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20">
              <Mail size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">Aucune carte trouvée</h3>
              <p className="text-muted-foreground text-sm">
                {search || statusFilter !== 'all'
                  ? 'Essayez de modifier vos filtres'
                  : 'Aucune carte postale dans la base de données'}
              </p>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {postcards.map((postcard) => (
              <GridCard
                key={postcard.id}
                postcard={postcard}
                selected={selectedIds.has(postcard.id)}
                onToggleSelect={() => toggleSelect(postcard.id)}
                onSelect={() => setSelectedPostcard(postcard)}
                onEdit={() => {
                  setEditingIsDuplicate(false)
                  setEditingPostcard(postcard)
                }}
                onEditInEditor={() => setEditorModalPostcard(postcard)}
                onDuplicate={canDuplicatePostcard ? () => handleDuplicate(postcard.id) : undefined}
                onUpdateStatus={handleUpdateStatus}
                onDelete={(id) => setDeleteConfirm(id)}
                umamiViews={umamiStats[`/carte/${postcard.publicId}`] || 0}
                onOpenShareContribution={
                  useEspaceClientActions
                    ? () => {
                        setSelectedPostcard(postcard)
                        setShareContributionModalOpen(true)
                      }
                    : undefined
                }
              />
            ))}
          </div>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <input
                        type="checkbox"
                        checked={postcards.length > 0 && selectedIds.size === postcards.length}
                        ref={(el) => {
                          if (el)
                            el.indeterminate =
                              selectedIds.size > 0 && selectedIds.size < postcards.length
                        }}
                        onChange={toggleSelectAll}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-border text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                    </TableHead>
                    <TableHead>Image</TableHead>
                    <TableHead>Expéditeur</TableHead>
                    <TableHead>Destinataire</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Lieu</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Vues</TableHead>
                    <TableHead className="text-right">Partages</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {postcards.map((postcard) => (
                    <ListRow
                      key={postcard.id}
                      postcard={postcard}
                      selected={selectedIds.has(postcard.id)}
                      onToggleSelect={() => toggleSelect(postcard.id)}
                      onSelect={() => setSelectedPostcard(postcard)}
                      onEdit={() => {
                        setEditingIsDuplicate(false)
                        setEditingPostcard(postcard)
                      }}
                      onEditInEditor={() => setEditorModalPostcard(postcard)}
                      onDuplicate={
                        canDuplicatePostcard ? () => handleDuplicate(postcard.id) : undefined
                      }
                      onUpdateStatus={handleUpdateStatus}
                      onDelete={(id) => setDeleteConfirm(id)}
                      formatDate={formatDate}
                      umamiViews={umamiStats[`/carte/${postcard.publicId}`] || 0}
                      onOpenShareContribution={
                        useEspaceClientActions
                          ? () => {
                              setSelectedPostcard(postcard)
                              setShareContributionModalOpen(true)
                            }
                          : undefined
                      }
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {/* Side Panel Details */}
        <DetailsSheet
          postcard={selectedPostcard}
          viewStats={viewStats}
          umamiDetails={detailedUmamiStats}
          isOpen={!!selectedPostcard}
          onClose={() => setSelectedPostcard(null)}
          onEdit={() => {
            setEditingIsDuplicate(false)
            setEditingPostcard(selectedPostcard)
          }}
          onEditInEditor={
            selectedPostcard ? () => setEditorModalPostcard(selectedPostcard) : undefined
          }
          onDuplicate={canDuplicatePostcard ? handleDuplicate : undefined}
          onSetPublicVisibility={canTogglePublicVisibility ? handleSetPublicVisibility : undefined}
          onUpdateStatus={handleUpdateStatus}
          onDelete={(id) => setDeleteConfirm(id)}
          formatDate={formatDate}
          useEspaceClientActions={showTrackingLinks}
          useAgenceActions={useAgenceActions}
          trackingLinks={trackingLinks}
          onRefreshTrackingLinks={() => {
            if (selectedPostcard && useAgenceActions) {
              getAgencyTrackingLinks(selectedPostcard.id).then((res) => {
                setTrackingLinks(res.success && res.links ? res.links : [])
              })
            } else if (selectedPostcard && useEspaceClientActions) {
              getTrackingLinksForPostcard(selectedPostcard.id).then((res) => {
                setTrackingLinks(res.success && res.links ? res.links : [])
              })
            }
          }}
          umamiViews={selectedPostcard ? umamiStats[`/carte/${selectedPostcard.publicId}`] || 0 : 0}
          onOpenShareContribution={
            useEspaceClientActions ? () => setShareContributionModalOpen(true) : undefined
          }
        />

        {/* Edit Dialog */}
        <EditPostcardDialog
          postcard={editingPostcard}
          isOpen={!!editingPostcard}
          isDuplicateMode={editingIsDuplicate}
          onClose={() => {
            setEditingPostcard(null)
            setEditingIsDuplicate(false)
          }}
          onSuccess={() => {
            refreshData()
            if (selectedPostcard?.id === editingPostcard?.id) {
              fetchPostcards({
                search: search,
                status: statusFilter !== 'all' ? statusFilter : undefined,
              }).then((res) => {
                const updated = res.docs.find((p) => p.id === editingPostcard?.id)
                if (updated) setSelectedPostcard(updated)
              })
            }
          }}
          updatePostcardFn={updatePostcardFn}
          allowChangeAuthor={!useEspaceClientActions && !useAgenceActions}
        />

        {/* Modal partage lien contribution (espace client) */}
        {shareContributionModalOpen &&
          selectedPostcard?.contributionToken &&
          selectedPostcard.isContributionEnabled !== false && (
            <ShareContributionModal
              isOpen={shareContributionModalOpen}
              onClose={() => setShareContributionModalOpen(false)}
              contributeUrl={
                typeof window !== 'undefined'
                  ? `${window.location.origin}/carte/${selectedPostcard.publicId}?token=${selectedPostcard.contributionToken}`
                  : ''
              }
            />
          )}

        {/* Modal Éditeur (iframe) */}
        {editorModalPostcard && (
          <div className="fixed inset-0 z-50 flex flex-col bg-stone-900">
            <div className="flex items-center justify-between px-4 py-2 bg-stone-800 border-b border-stone-700 shrink-0">
              <span className="text-sm font-medium text-stone-200">
                Édition : {editorModalPostcard.recipientName || editorModalPostcard.publicId}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-stone-300 hover:text-white hover:bg-stone-700"
                onClick={() => {
                  setEditorModalPostcard(null)
                  refreshData()
                }}
              >
                Fermer
              </Button>
            </div>
            <iframe
              title="Éditeur de carte"
              src={`/editor?edit=${encodeURIComponent(editorModalPostcard.publicId)}&embed=1`}
              className="flex-1 w-full border-0"
            />
          </div>
        )}

        {/* Delete confirmation (single) */}
        <Dialog
          open={deleteConfirm !== null}
          onOpenChange={(open) => !open && setDeleteConfirm(null)}
        >
          <DialogContent className="sm:max-w-sm" onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Cette action est irréversible. La carte postale sera définitivement supprimée.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteConfirm !== null && handleDelete(deleteConfirm)}
                disabled={isPending}
              >
                {isPending ? 'Suppression…' : 'Supprimer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk delete confirmation */}
        <Dialog
          open={deleteConfirmBulkIds !== null && deleteConfirmBulkIds.length > 0}
          onOpenChange={(open) => !open && setDeleteConfirmBulkIds(null)}
        >
          <DialogContent className="sm:max-w-sm" onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>Supprimer les cartes sélectionnées</DialogTitle>
              <DialogDescription>
                {deleteConfirmBulkIds?.length ?? 0} carte
                {(deleteConfirmBulkIds?.length ?? 0) > 1 ? 's' : ''} seront définitivement supprimée
                {(deleteConfirmBulkIds?.length ?? 0) > 1 ? 's' : ''}. Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setDeleteConfirmBulkIds(null)}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDeleteConfirm}
                disabled={isPending}
              >
                {isPending ? 'Suppression…' : `Supprimer (${deleteConfirmBulkIds?.length ?? 0})`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Code promo — ajouter des crédits */}
        <Dialog open={promoDialogOpen} onOpenChange={setPromoDialogOpen}>
          <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Gift size={20} className="text-teal-600" />
                Ajouter des crédits avec un code promo
              </DialogTitle>
              <DialogDescription>
                Entrez votre code promo pour ajouter une carte (1 crédit) à votre compte.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-stone-700">Code promo</label>
                <Input
                  placeholder="Ex. COOLOS"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase().trim())}
                  className="font-mono uppercase"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (promoCodeInput && !promoLoading) {
                        setPromoLoading(true)
                        setPromoResult(null)
                        redeemPromoCodeForCredits(promoCodeInput).then((res) => {
                          setPromoLoading(false)
                          if (res.success) {
                            setPromoResult({
                              type: 'success',
                              message: `Code accepté ! 1 crédit a été ajouté à votre compte.`,
                            })
                            setPromoCodeInput('')
                          } else {
                            setPromoResult({
                              type: 'error',
                              message: res.error ?? 'Erreur inconnue',
                            })
                          }
                        })
                      }
                    }
                  }}
                />
              </div>
              {promoResult && (
                <p
                  className={cn(
                    'text-sm rounded-md p-3',
                    promoResult.type === 'success'
                      ? 'bg-teal-50 text-teal-800 border border-teal-200'
                      : 'bg-red-50 text-red-800 border border-red-200',
                  )}
                >
                  {promoResult.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setPromoDialogOpen(false)}>
                Fermer
              </Button>
              <Button
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 text-white"
                disabled={!promoCodeInput || promoLoading}
                onClick={() => {
                  if (!promoCodeInput || promoLoading) return
                  setPromoLoading(true)
                  setPromoResult(null)
                  redeemPromoCodeForCredits(promoCodeInput).then((res) => {
                    setPromoLoading(false)
                    if (res.success) {
                      setPromoResult({
                        type: 'success',
                        message: `Code accepté ! 1 crédit a été ajouté à votre compte.`,
                      })
                      setPromoCodeInput('')
                    } else {
                      setPromoResult({
                        type: 'error',
                        message: res.error ?? 'Erreur inconnue',
                      })
                    }
                  })
                }}
              >
                {promoLoading ? 'Validation…' : 'Valider le code'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    </div>
  )
}

// --- Sub-components ---

const statVariants = {
  default: 'border-border/50 bg-card/50 backdrop-blur-sm',
  success: 'border-emerald-200/50 bg-emerald-50/50 text-emerald-700 backdrop-blur-sm',
  warning: 'border-amber-200/50 bg-amber-50/50 text-amber-700 backdrop-blur-sm',
  muted: 'border-border/50 bg-muted/40 text-muted-foreground backdrop-blur-sm',
  info: 'border-blue-200/50 bg-blue-50/50 text-blue-700 backdrop-blur-sm',
} as const

function StatCard({
  icon,
  label,
  value,
  variant = 'default',
}: {
  icon: React.ReactNode
  label: string
  value: number
  variant?: keyof typeof statVariants
}) {
  return (
    <Card className={cn('p-4 flex items-center gap-3 shadow-none border', statVariants[variant])}>
      <CardContent className="flex flex-row items-center gap-3 p-0">
        <div className="opacity-60">{icon}</div>
        <div>
          <div className="text-xl font-bold leading-none">{value}</div>
          <div className="text-[10px] uppercase tracking-wider opacity-70 mt-1 font-medium">
            {label}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status as keyof typeof statusConfig]
  if (!config) return null
  return (
    <Badge
      variant="outline"
      className={cn('font-medium px-2 py-0 border shadow-none', config.color)}
    >
      {config.label}
    </Badge>
  )
}

function StatusDropdown({
  currentStatus,
  onUpdate,
  postcardId,
}: {
  currentStatus: string
  onUpdate: (id: number, status: 'published' | 'draft' | 'archived') => void
  postcardId: number
}) {
  const statuses = ['published', 'draft', 'archived'] as const

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-[11px] text-muted-foreground hover:bg-muted/50 rounded-full border border-border/30"
        >
          <ArrowUpDown size={12} />
          Statut
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-40 backdrop-blur-xl bg-background/80"
        onClick={(e) => e.stopPropagation()}
      >
        {statuses.map((s) => (
          <DropdownMenuItem
            key={s}
            onClick={(e) => {
              e.stopPropagation()
              onUpdate(postcardId, s)
            }}
            className={cn('text-sm gap-2', currentStatus === s && 'bg-muted font-medium')}
          >
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                s === 'published'
                  ? 'bg-emerald-500'
                  : s === 'draft'
                    ? 'bg-amber-500'
                    : 'bg-stone-400',
              )}
            />
            {statusConfig[s].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function GridCard({
  postcard,
  selected,
  onToggleSelect,
  onSelect,
  onEdit,
  onEditInEditor,
  onDuplicate,
  onUpdateStatus,
  onDelete,
  umamiViews,
  onOpenShareContribution,
}: {
  postcard: PayloadPostcard
  selected: boolean
  onToggleSelect: () => void
  onSelect: () => void
  onEdit: () => void
  onEditInEditor?: () => void
  onDuplicate?: () => void
  onUpdateStatus: (id: number, status: 'published' | 'draft' | 'archived') => void
  onDelete: (id: number) => void
  umamiViews?: number
  onOpenShareContribution?: () => void
}) {
  const imageUrl = getFrontImageUrl(postcard)
  const [isFlipped, setIsFlipped] = useState(false)
  const toggleFlip = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setIsFlipped((prev) => !prev)
  }

  return (
    <div className="[perspective:1000px] h-full">
      <div
        className="relative h-full transition-transform duration-300 ease-out [transform-style:preserve-3d]"
        style={{ minHeight: '320px', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        <div className="[backface-visibility:hidden] h-full" style={{ transform: 'rotateY(0deg)' }}>
          <Card
            className={cn(
              'overflow-hidden border-border/50 hover:shadow-xl hover:shadow-black/5 transition-shadow duration-300 cursor-pointer group bg-card/60 backdrop-blur-sm h-full flex flex-col',
              selected && 'ring-2 ring-teal-500 ring-offset-2',
            )}
            onClick={onSelect}
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden flex-shrink-0">
              <div className="absolute top-3 left-3 z-10" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={onToggleSelect}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 rounded border-border text-teal-600 focus:ring-teal-500 cursor-pointer bg-white/90 shadow"
                />
              </div>
              <Image
                src={imageUrl}
                alt={`Carte de ${postcard.senderName}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute top-3 left-10 flex gap-2">
                <StatusBadge status={postcard.status || 'draft'} />
              </div>
              {postcard.isPremium && (
                <div className="absolute top-3 right-3 bg-amber-400/90 backdrop-blur-sm text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  PREMIUM
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-xs line-clamp-2 italic">
                  &quot;{postcard.message}&quot;
                </p>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 space-y-4 flex-1">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-stone-800">
                    <span className="bg-teal-100 text-teal-700 text-[10px] px-1.5 py-0.5 rounded leading-none">
                      DE
                    </span>
                    {postcard.senderName}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span className="bg-stone-100 text-stone-600 text-[10px] px-1.5 py-0.5 rounded leading-none">
                      À
                    </span>
                    {postcard.recipientName}
                  </div>
                </div>
                <div className="text-[10px] font-medium text-stone-400 bg-stone-50 px-2 py-1 rounded-md border border-stone-100">
                  {new Date(postcard.date)
                    .toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
                    .toUpperCase()}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-stone-500 py-1.5 px-2 bg-stone-50/50 rounded-lg border border-stone-100/50">
                <MapPin size={12} className="text-orange-400 shrink-0" />
                <span className="truncate">{postcard.location}</span>
              </div>

              <div className="space-y-3 pt-3 border-t border-border/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-stone-400">
                    <span
                      className="flex items-center gap-1 hover:text-stone-600 transition-colors"
                      title="Vues (Interne)"
                    >
                      <Eye size={12} /> {postcard.views || 0}
                    </span>
                    <span
                      className="flex items-center gap-1 text-teal-600 font-medium"
                      title="Vues Umami"
                    >
                      <BarChart3 size={12} /> {umamiViews || 0}
                    </span>
                    <span
                      className="flex items-center gap-1 hover:text-stone-600 transition-colors"
                      title="Partages"
                    >
                      <Share2 size={12} /> {postcard.shares || 0}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-stone-600 hover:text-teal-600 border-stone-200 bg-white shadow-sm"
                    onClick={toggleFlip}
                    title={isFlipped ? 'Retourner recto' : 'Voir le verso'}
                  >
                    <RotateCcw size={14} />
                  </Button>
                </div>

                <div
                  className="flex flex-wrap items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/carte/${postcard.publicId}`}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 text-stone-600 hover:text-teal-600 border-stone-200 bg-white shadow-sm"
                        title="Ouvrir dans un nouvel onglet"
                      >
                        <ExternalLink size={16} />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit()
                      }}
                      className="h-9 w-9 text-stone-600 hover:text-teal-600 hover:bg-teal-50 border-teal-200 shadow-sm"
                      title="Modifier"
                    >
                      <Pencil size={16} />
                    </Button>
                    {onEditInEditor && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditInEditor()
                        }}
                        className="h-9 px-2.5 text-amber-700 border-amber-200 bg-amber-50/50 hover:bg-amber-100 font-medium shadow-sm"
                        title="Ouvrir dans l’éditeur"
                      >
                        <PenTool size={14} className="mr-1.5 shrink-0" />
                        Éditeur
                      </Button>
                    )}
                    {onOpenShareContribution && postcard.contributionToken && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          onOpenShareContribution()
                        }}
                        className="h-9 w-9 text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200 shadow-sm"
                        title="Partager le lien de contribution (photos)"
                      >
                        <Users size={16} />
                      </Button>
                    )}
                    <StatusDropdown
                      currentStatus={postcard.status || 'draft'}
                      onUpdate={onUpdateStatus}
                      postcardId={postcard.id}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(postcard.id)
                      }}
                      className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 shadow-sm"
                      title="Supprimer la carte"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                {onDuplicate && (
                  <div
                    className="pt-3 border-t border-stone-100 space-y-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDuplicate()
                      }}
                      className="w-full h-10 text-violet-700 border-violet-200 bg-violet-50/50 hover:bg-violet-100 hover:border-violet-300 font-medium shadow-sm"
                      title="Dupliquer la carte pour modifier texte et photos"
                    >
                      <Copy size={16} className="mr-2 shrink-0" />
                      Dupliquer la carte
                    </Button>
                    <p className="text-[11px] text-stone-500 leading-tight px-0.5">
                      Modifiez le texte et les photos en repartant de la même base.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
        {/* Face verso */}
        <div
          className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-lg overflow-hidden border border-border/50 bg-gradient-to-br from-stone-100 to-stone-200/80 shadow-lg cursor-pointer"
          onClick={onSelect}
        >
          <div className="h-full flex flex-col p-5 justify-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">
              Message
            </p>
            <p className="text-sm text-stone-700 italic leading-relaxed line-clamp-6">
              {postcard.message ? `"${postcard.message}"` : '—'}
            </p>
            <div className="mt-4 pt-4 border-t border-stone-300/50 flex items-center gap-2 text-xs text-stone-500">
              <MapPin size={12} className="text-orange-500 shrink-0" />
              <span>{postcard.location || '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ListRow({
  postcard,
  selected,
  onToggleSelect,
  onSelect,
  onEdit,
  onEditInEditor,
  onDuplicate,
  onUpdateStatus,
  onDelete,
  formatDate,
  umamiViews,
  onOpenShareContribution,
}: {
  postcard: PayloadPostcard
  selected: boolean
  onToggleSelect: () => void
  onSelect: () => void
  onEdit: () => void
  onEditInEditor?: () => void
  onDuplicate?: () => void
  onUpdateStatus: (id: number, status: 'published' | 'draft' | 'archived') => void
  onDelete: (id: number) => void
  formatDate: (d: string) => string
  umamiViews?: number
  onOpenShareContribution?: () => void
}) {
  const imageUrl = getFrontImageUrl(postcard)

  return (
    <TableRow
      className={cn(
        'group cursor-pointer hover:bg-muted/30 transition-colors border-border/50',
        selected && 'bg-teal-50/50',
      )}
      onClick={onSelect}
    >
      <TableCell onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 rounded border-border text-teal-600 focus:ring-teal-500 cursor-pointer"
        />
      </TableCell>
      <TableCell>
        <div className="relative w-16 h-11 group-hover:scale-105 transition-transform duration-300">
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover rounded-md shadow-sm border border-border/30"
            sizes="64px"
          />
        </div>
      </TableCell>
      <TableCell className="font-semibold text-stone-800">{postcard.senderName}</TableCell>
      <TableCell className="text-stone-600">{postcard.recipientName}</TableCell>
      <TableCell className="text-stone-500 max-w-[140px] truncate text-xs">
        {typeof postcard.author === 'object' && postcard.author
          ? postcard.author.name || postcard.author.email || '—'
          : '—'}
      </TableCell>
      <TableCell className="text-stone-500 max-w-[150px] truncate">{postcard.location}</TableCell>
      <TableCell className="text-stone-400 text-xs font-medium uppercase">
        {formatDate(postcard.date)}
      </TableCell>
      <TableCell>
        <StatusBadge status={postcard.status || 'draft'} />
      </TableCell>
      <TableCell className="text-right text-stone-500 font-medium">
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-stone-400 uppercase leading-none mb-1">Interne</span>
          <span>{postcard.views || 0}</span>
        </div>
      </TableCell>
      <TableCell className="text-right text-teal-600 font-bold">
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-teal-500/70 uppercase leading-none mb-1">Umami</span>
          <span className="flex items-center gap-1">
            <BarChart3 size={10} /> {umamiViews || 0}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right text-stone-500 font-medium">
        {postcard.shares || 0}
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <Link href={`/carte/${postcard.publicId}`} target="_blank">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 text-stone-600 hover:text-teal-600 border-stone-200 bg-white shadow-sm"
              title="Voir la carte"
            >
              <ExternalLink size={16} />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 text-stone-600 hover:text-teal-600 hover:bg-teal-50 border-teal-200 shadow-sm"
            onClick={() => onEdit()}
            title="Modifier"
          >
            <Pencil size={16} />
          </Button>
          {onEditInEditor && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-2.5 text-amber-700 border-amber-200 bg-amber-50/50 hover:bg-amber-100 font-medium shadow-sm"
              onClick={() => onEditInEditor()}
              title="Ouvrir dans l’éditeur"
            >
              <PenTool size={14} className="mr-1.5" />
              Éditeur
            </Button>
          )}
          {onDuplicate && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-violet-700 border-violet-200 bg-violet-50/50 hover:bg-violet-100 font-medium shadow-sm"
              onClick={() => onDuplicate()}
              title="Dupliquer la carte"
            >
              <Copy size={14} className="mr-1.5" />
              Dupliquer
            </Button>
          )}
          {onOpenShareContribution && postcard.contributionToken && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-purple-700 border-purple-200 bg-purple-50/50 hover:bg-purple-100 font-medium shadow-sm"
              onClick={() => onOpenShareContribution()}
              title="Partager le lien de contribution (photos)"
            >
              <Users size={14} className="mr-1.5" />
              Contribuer
            </Button>
          )}
          <StatusDropdown
            currentStatus={postcard.status || 'draft'}
            onUpdate={onUpdateStatus}
            postcardId={postcard.id}
          />
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 shadow-sm"
            onClick={() => onDelete(postcard.id)}
            title="Supprimer"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

function DetailsSheet(props: {
  postcard: PayloadPostcard | null
  viewStats: PostcardViewStats | null
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
  onEditInEditor?: () => void
  onDuplicate?: (id: number) => void
  onSetPublicVisibility?: (id: number, isPublic: boolean) => void
  onUpdateStatus: (id: number, status: 'published' | 'draft' | 'archived') => void
  onDelete: (id: number) => void
  formatDate: (d: string) => string
  useEspaceClientActions?: boolean
  useAgenceActions?: boolean
  trackingLinks?: PostcardTrackingLink[]
  onRefreshTrackingLinks?: () => void
  onOpenShareContribution?: () => void
  umamiViews?: number
  umamiDetails?: DetailedUmamiStats | null
}) {
  const {
    postcard,
    viewStats,
    isOpen,
    onClose,
    onEdit,
    onEditInEditor,
    onDuplicate,
    onSetPublicVisibility,
    onUpdateStatus,
    onDelete,
    formatDate,
    onOpenShareContribution,
    useEspaceClientActions,
    useAgenceActions,
    trackingLinks,
    onRefreshTrackingLinks,
    umamiViews,
    umamiDetails,
  } = props
  const [activePanelTab, setActivePanelTab] = useState<'details' | 'stats'>('details')
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [emailDialogTracking, setEmailDialogTracking] = useState<PostcardTrackingLink | null>(null)
  const [emailInput, setEmailInput] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [quickSendDialogOpen, setQuickSendDialogOpen] = useState(false)
  const [quickSendPending, setQuickSendPending] = useState(false)
  const [quickSendForm, setQuickSendForm] = useState({
    recipientFirstName: '',
    recipientLastName: '',
    description: '',
    recipientEmail: '',
  })
  const [createTrackingPending, setCreateTrackingPending] = useState(false)
  const [createForm, setCreateForm] = useState({
    recipientFirstName: '',
    recipientLastName: '',
    description: '',
  } as CreateTrackingLinkData)

  useEffect(() => {
    setActivePanelTab('details')
  }, [postcard?.id])

  if (!postcard) return null
  const frontendPostcard = mapToFrontend(postcard)
  const publicUrl = `/carte/${postcard.publicId}`
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl w-full p-0 flex flex-col border-l border-border/50 bg-background/95 backdrop-blur-xl animate-in slide-in-from-right duration-500">
        <SheetHeader className="p-6 border-b border-border/30 bg-card/30">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <SheetTitle className="text-xl font-bold">Détails de la carte</SheetTitle>
              <SheetDescription className="text-xs uppercase tracking-widest font-medium">
                #{postcard.publicId}
              </SheetDescription>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/manager/stats">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-[11px] text-muted-foreground hover:bg-muted/50 rounded-full border border-border/30"
                >
                  <BarChart3 size={12} />
                  Stats détaillées
                </Button>
              </Link>
              <StatusBadge status={postcard.status || 'draft'} />
            </div>
          </div>
          <div className="mt-4 inline-flex rounded-lg border border-border/40 bg-muted/20 p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActivePanelTab('details')}
              className={cn(
                'h-8 rounded-md px-3 text-xs',
                activePanelTab === 'details'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Détails
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActivePanelTab('stats')}
              className={cn(
                'h-8 rounded-md px-3 text-xs',
                activePanelTab === 'stats'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              Stats
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-8">
            {activePanelTab === 'details' ? (
              <>
                {/* Preview Section */}
                <div className="bg-stone-50/50 rounded-2xl p-6 border border-stone-200/50 flex justify-center shadow-inner overflow-hidden relative group">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,128,128,0.05),transparent)] pointer-events-none" />
                  <div className="transform scale-[0.65] sm:scale-[0.85] origin-center transition-transform hover:scale-[0.88] duration-700">
                    <PostcardView postcard={frontendPostcard} isPreview />
                  </div>
                </div>

                {/* Metadatas Section */}
                <div className="grid grid-cols-2 gap-4">
                  <InfoCard
                    icon={<User size={16} />}
                    label="Expéditeur"
                    value={postcard.senderName || ''}
                  />
                  <InfoCard
                    icon={<Users size={16} />}
                    label="Destinataire"
                    value={postcard.recipientName || ''}
                  />
                  <InfoCard
                    icon={<MapPin size={16} className="text-orange-400" />}
                    label="Lieu"
                    value={postcard.location || ''}
                  />
                  <InfoCard
                    icon={<Calendar size={16} />}
                    label="Date de l'envoi"
                    value={formatDate(postcard.date)}
                  />
                  <InfoCard
                    icon={<UserIcon size={16} className="text-teal-500" />}
                    label="Client (Compte)"
                    value={
                      typeof postcard.author === 'object' && postcard.author
                        ? postcard.author.name || postcard.author.email
                        : 'Aucun'
                    }
                  />
                </div>

                {/* Message Section */}
                {postcard.message && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">
                      Message écrit
                    </h4>
                    <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm italic text-stone-600 leading-relaxed relative bg-gradient-to-br from-white to-stone-50">
                      <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                        <FileText size={48} />
                      </div>
                      &quot;{postcard.message}&quot;
                    </div>
                  </div>
                )}

                {/* Lien pour ajouter des photos (espace client uniquement) */}
                {useEspaceClientActions &&
                  postcard?.contributionToken &&
                  postcard.isContributionEnabled !== false &&
                  onOpenShareContribution && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">
                        Lien pour ajouter des photos
                      </h4>
                      <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100/80 space-y-2">
                        <p className="text-sm text-stone-600">
                          Partagez ce lien pour permettre à d&apos;autres personnes d&apos;ajouter
                          leurs photos à cette carte (même lien pour toute la carte).
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2 border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300"
                          onClick={onOpenShareContribution}
                        >
                          <Link2 size={14} />
                          Partager le lien pour ajouter des photos
                        </Button>
                      </div>
                    </div>
                  )}

                {/* Liens de tracking (espace client uniquement) */}
                {useEspaceClientActions && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">
                      Suivi par destinataire
                    </h4>
                    <div className="p-4 bg-muted/30 rounded-xl border border-border/30 space-y-3">
                      {(trackingLinks?.length ?? 0) === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Aucun lien de tracking. Créez-en un pour partager cette carte avec un
                          suivi personnalisé.
                        </p>
                      ) : (
                        <ul className="space-y-3">
                          {(trackingLinks ?? []).map((t) => {
                            const trackingUrl = `${baseUrl}/v/${t.token}`
                            const shareText = 'Une carte postale pour vous : '
                            return (
                              <li
                                key={t.id}
                                className="p-3 rounded-lg border border-border/50 bg-background/50 space-y-2"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium text-sm text-foreground">
                                    {[t.recipientFirstName, t.recipientLastName]
                                      .filter(Boolean)
                                      .join(' ') || 'Sans nom'}
                                  </span>
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Eye size={12} /> {t.views ?? 0} vues
                                  </span>
                                </div>
                                {t.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {t.description}
                                  </p>
                                )}
                                <div className="flex flex-wrap items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1.5 text-xs"
                                    onClick={() => {
                                      const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/v/${t.token}`
                                      void navigator.clipboard
                                        .writeText(url)
                                        .then(() => alert('Lien copié !'))
                                    }}
                                  >
                                    <Copy size={12} /> Copier
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1.5 text-xs"
                                    onClick={() => {
                                      setEmailDialogTracking(t)
                                      setEmailInput('')
                                      setEmailDialogOpen(true)
                                    }}
                                  >
                                    <Mail size={12} /> Email
                                  </Button>
                                  <a
                                    href={`https://wa.me/?text=${encodeURIComponent(shareText + (typeof window !== 'undefined' ? window.location.origin : '') + '/v/' + t.token)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 gap-1.5 text-xs"
                                    >
                                      <MessageCircle size={12} /> WhatsApp
                                    </Button>
                                  </a>
                                  <a
                                    href={`sms:?body=${encodeURIComponent(shareText + (typeof window !== 'undefined' ? window.location.origin : '') + '/v/' + t.token)}`}
                                  >
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 gap-1.5 text-xs"
                                    >
                                      <Send size={12} /> SMS
                                    </Button>
                                  </a>
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 border-dashed"
                        onClick={() => {
                          setCreateForm({
                            recipientFirstName: '',
                            recipientLastName: '',
                            description: '',
                          })
                          setTrackingDialogOpen(true)
                        }}
                      >
                        <Link2 size={14} /> Créer un lien de tracking
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => {
                          setQuickSendForm({
                            recipientFirstName: '',
                            recipientLastName: '',
                            description: '',
                            recipientEmail: '',
                          })
                          setQuickSendDialogOpen(true)
                        }}
                      >
                        <Mail size={14} /> Envoyer a un destinataire (email)
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 bg-muted/30 rounded-xl border border-border/30 space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 opacity-50">
                  Audience & Technique
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[10px] text-teal-600 mb-1 uppercase tracking-tight font-bold flex items-center gap-1">
                      <BarChart3 size={10} /> Umami
                    </p>
                    <p className="text-2xl font-bold text-teal-700">{umamiViews || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-tight">
                      Vues (Int.)
                    </p>
                    <p className="text-2xl font-bold text-foreground">{postcard.views || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-tight">
                      Partages
                    </p>
                    <p className="text-2xl font-bold text-foreground">{postcard.shares || 0}</p>
                  </div>
                </div>
                {viewStats ? (
                  <>
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/20">
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-tight">
                          Sessions uniques
                        </p>
                        <p className="text-lg font-semibold text-foreground">
                          {viewStats.uniqueSessions}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-tight">
                          Temps moyen (s)
                        </p>
                        <p className="text-lg font-semibold text-foreground">
                          {viewStats.avgDurationSeconds != null
                            ? Math.round(viewStats.avgDurationSeconds)
                            : '—'}
                        </p>
                      </div>
                    </div>
                    {(viewStats.byCountry.length > 0 || viewStats.byBrowser.length > 0) && (
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/20">
                        {viewStats.byCountry.length > 0 && (
                          <div>
                            <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-tight">
                              Pays (top)
                            </p>
                            <ul className="space-y-1 text-xs text-foreground">
                              {viewStats.byCountry.slice(0, 5).map(({ country, count }) => (
                                <li key={country} className="flex justify-between gap-2">
                                  <span className="truncate">{country}</span>
                                  <span className="font-medium tabular-nums">{count}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {viewStats.byBrowser.length > 0 && (
                          <div>
                            <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-tight">
                              Navigateurs (top)
                            </p>
                            <ul className="space-y-1 text-xs text-foreground">
                              {viewStats.byBrowser.slice(0, 5).map(({ browser, count }) => (
                                <li key={browser} className="flex justify-between gap-2">
                                  <span className="truncate">{browser}</span>
                                  <span className="font-medium tabular-nums">{count}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    {viewStats.recentEvents.length > 0 && (
                      <div className="pt-2 border-t border-border/20">
                        <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-tight">
                          Dernières ouvertures
                        </p>
                        <ul className="space-y-1.5 text-xs text-foreground max-h-64 overflow-y-auto">
                          {viewStats.recentEvents.map((ev, i) => (
                            <li
                              key={i}
                              className="flex justify-between gap-2 py-1 border-b border-border/10 last:border-0"
                            >
                              <span className="text-muted-foreground truncate">
                                {new Date(ev.openedAt).toLocaleString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              <span className="truncate">{ev.country ?? '—'}</span>
                              <span className="truncate">{ev.browser ?? '—'}</span>
                              <span className="tabular-nums">
                                {ev.durationSeconds != null ? `${ev.durationSeconds}s` : '—'}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground border-t border-border/20 pt-3">
                    Les statistiques détaillées se chargent ou ne sont pas encore disponibles pour
                    cette carte.
                  </p>
                )}
                {umamiDetails && (
                  <div className="pt-4 border-t border-border/20 space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-teal-600 opacity-80 flex items-center gap-2">
                      <BarChart3 size={12} /> Umami Analytics
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100/50">
                        <p className="text-[10px] text-teal-600 mb-0.5 uppercase tracking-tight font-bold">
                          Vues (Totales)
                        </p>
                        <p className="text-xl font-bold text-teal-700">{umamiDetails.views}</p>
                      </div>
                      <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100/50">
                        <p className="text-[10px] text-teal-600 mb-0.5 uppercase tracking-tight font-bold">
                          Visiteurs uniques
                        </p>
                        <p className="text-xl font-bold text-teal-700">{umamiDetails.visitors}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {umamiDetails.countries.length > 0 && (
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-tight font-bold">
                            Top Pays
                          </p>
                          <ul className="space-y-1 text-xs">
                            {umamiDetails.countries.slice(0, 5).map((c) => (
                              <li
                                key={c.x}
                                className="flex justify-between items-center bg-stone-50/50 p-1 rounded px-2"
                              >
                                <span className="truncate max-w-[80px]">{c.x}</span>
                                <span className="font-semibold">{c.y}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {umamiDetails.browsers.length > 0 && (
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-tight font-bold">
                            Top Navs
                          </p>
                          <ul className="space-y-1 text-xs">
                            {umamiDetails.browsers.slice(0, 5).map((b) => (
                              <li
                                key={b.x}
                                className="flex justify-between items-center bg-stone-50/50 p-1 rounded px-2"
                              >
                                <span className="truncate max-w-[80px]">{b.x}</span>
                                <span className="font-semibold">{b.y}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-border/30 bg-card/30 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-3">
            <Link href={publicUrl} target="_blank" className="flex-1">
              <Button
                variant="default"
                className="w-full gap-2 shadow-teal-500/20 shadow-lg bg-teal-600 hover:bg-teal-700 rounded-xl py-6 transition-all active:scale-[0.98]"
              >
                <ExternalLink size={16} />
                Voir en ligne
              </Button>
            </Link>

            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-12 px-4 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm"
                  >
                    <ArrowUpDown size={16} className="mr-2" />
                    Statut
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 backdrop-blur-xl bg-background/80">
                  {['published', 'draft', 'archived'].map((s) => (
                    <DropdownMenuItem
                      key={s}
                      disabled={postcard.status === s}
                      onClick={() => onUpdateStatus(postcard.id, s as any)}
                      className="gap-3 py-3"
                    >
                      <div
                        className={cn(
                          'w-3 h-3 rounded-full',
                          s === 'published'
                            ? 'bg-emerald-500'
                            : s === 'draft'
                              ? 'bg-amber-500'
                              : 'bg-stone-400',
                        )}
                      />
                      <span>
                        Marquer comme {statusConfig[s as keyof typeof statusConfig].label}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="icon"
                onClick={onEdit}
                className="w-12 h-12 text-teal-600 border-border/50 hover:bg-teal-50 rounded-xl transition-colors"
                title="Modifier"
              >
                <Pencil size={18} />
              </Button>
              {onEditInEditor && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEditInEditor}
                  className="h-12 px-4 text-amber-700 border-amber-200 bg-amber-50/50 hover:bg-amber-100 rounded-xl font-medium"
                  title="Ouvrir dans l’éditeur"
                >
                  <PenTool size={18} className="mr-2" />
                  Éditeur
                </Button>
              )}
              {onDuplicate && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDuplicate(postcard.id)}
                  className="w-12 h-12 text-violet-600 border-border/50 hover:bg-violet-50 rounded-xl transition-colors"
                  title="Dupliquer la carte"
                >
                  <Copy size={18} />
                </Button>
              )}
              {onSetPublicVisibility && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSetPublicVisibility(postcard.id, !(postcard.isPublic ?? true))}
                  className={cn(
                    'h-12 px-4 rounded-xl border-border/50 transition-colors',
                    postcard.isPublic
                      ? 'text-emerald-700 hover:bg-emerald-50'
                      : 'text-stone-600 hover:bg-stone-50',
                  )}
                  title={postcard.isPublic ? 'Rendre la carte privee' : 'Rendre la carte publique'}
                >
                  {postcard.isPublic ? 'Publique' : 'Privee'}
                </Button>
              )}

              <Button
                variant="outline"
                size="icon"
                onClick={() => onDelete(postcard.id)}
                className="w-12 h-12 text-destructive border-border/50 hover:bg-destructive/10 rounded-xl transition-colors"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          </div>
        </div>

        {/* Dialog: Créer un lien de tracking */}
        <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un lien de tracking</DialogTitle>
              <DialogDescription>
                Nom et prénom du destinataire pour identifier ce lien. Optionnel : une description.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prénom</label>
                  <Input
                    value={createForm.recipientFirstName ?? ''}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, recipientFirstName: e.target.value }))
                    }
                    placeholder="Prénom"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom</label>
                  <Input
                    value={createForm.recipientLastName ?? ''}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, recipientLastName: e.target.value }))
                    }
                    placeholder="Nom"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (optionnel)</label>
                <Input
                  value={createForm.description ?? ''}
                  onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Ex. Carte pour l’anniversaire de Marie"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTrackingDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                disabled={createTrackingPending}
                onClick={async () => {
                  if (!postcard) return
                  setCreateTrackingPending(true)
                  const createFn = useAgenceActions ? createAgencyTrackingLink : createTrackingLink
                  const res = await createFn(postcard.id, {
                    recipientFirstName: createForm.recipientFirstName || undefined,
                    recipientLastName: createForm.recipientLastName || undefined,
                    description: createForm.description || undefined,
                  })
                  setCreateTrackingPending(false)
                  if (res.success) {
                    setTrackingDialogOpen(false)
                    onRefreshTrackingLinks?.()
                  } else {
                    alert(res.error ?? 'Erreur')
                  }
                }}
              >
                {createTrackingPending ? 'Création…' : 'Créer le lien'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog: Envoi direct a un destinataire specifique */}
        <Dialog open={quickSendDialogOpen} onOpenChange={setQuickSendDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Envoyer la carte par email</DialogTitle>
              <DialogDescription>
                Cree un lien de tracking personnalise puis envoie l'email au destinataire.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prenom</label>
                  <Input
                    value={quickSendForm.recipientFirstName}
                    onChange={(e) =>
                      setQuickSendForm((f) => ({ ...f, recipientFirstName: e.target.value }))
                    }
                    placeholder="Prenom"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom</label>
                  <Input
                    value={quickSendForm.recipientLastName}
                    onChange={(e) =>
                      setQuickSendForm((f) => ({ ...f, recipientLastName: e.target.value }))
                    }
                    placeholder="Nom"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email destinataire</label>
                <Input
                  type="email"
                  value={quickSendForm.recipientEmail}
                  onChange={(e) =>
                    setQuickSendForm((f) => ({ ...f, recipientEmail: e.target.value }))
                  }
                  placeholder="destinataire@exemple.fr"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (optionnel)</label>
                <Input
                  value={quickSendForm.description}
                  onChange={(e) => setQuickSendForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Ex. Carte anniversaire"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setQuickSendDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                disabled={quickSendPending || !quickSendForm.recipientEmail.trim()}
                onClick={async () => {
                  if (!postcard) return
                  const email = quickSendForm.recipientEmail.trim()
                  if (!email) {
                    alert('Veuillez renseigner un email.')
                    return
                  }

                  setQuickSendPending(true)
                  const createFn = useAgenceActions ? createAgencyTrackingLink : createTrackingLink
                  const sendFn = useAgenceActions
                    ? sendAgencyTrackingLinkByEmail
                    : sendTrackingLinkByEmail

                  const createRes = await createFn(postcard.id, {
                    recipientFirstName: quickSendForm.recipientFirstName || undefined,
                    recipientLastName: quickSendForm.recipientLastName || undefined,
                    description: quickSendForm.description || undefined,
                  })

                  if (!createRes.success || !createRes.tracking) {
                    setQuickSendPending(false)
                    alert(createRes.error ?? 'Erreur lors de la creation du lien.')
                    return
                  }

                  const sendRes = await sendFn(createRes.tracking.id, email)
                  setQuickSendPending(false)
                  if (sendRes.success) {
                    setQuickSendDialogOpen(false)
                    onRefreshTrackingLinks?.()
                  } else {
                    alert(sendRes.error ?? "Erreur lors de l'envoi de l'email.")
                  }
                }}
              >
                {quickSendPending ? 'Envoi…' : 'Creer et envoyer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog: Envoyer le lien par email */}
        <Dialog
          open={emailDialogOpen}
          onOpenChange={(open) => {
            setEmailDialogOpen(open)
            if (!open) setEmailDialogTracking(null)
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Envoyer le lien par email</DialogTitle>
              <DialogDescription>
                Indiquez l’adresse email du destinataire. Il recevra un email avec le lien vers la
                carte.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="destinataire@exemple.fr"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                disabled={emailSending || !emailInput.trim()}
                onClick={async () => {
                  if (!emailDialogTracking) return
                  setEmailSending(true)
                  const sendFn = useAgenceActions
                    ? sendAgencyTrackingLinkByEmail
                    : sendTrackingLinkByEmail
                  const res = await sendFn(emailDialogTracking.id, emailInput.trim())
                  setEmailSending(false)
                  if (res.success) {
                    setEmailDialogOpen(false)
                    setEmailDialogTracking(null)
                    setEmailInput('')
                    onRefreshTrackingLinks?.()
                  } else {
                    alert(res.error ?? 'Erreur')
                  }
                }}
              >
                {emailSending ? 'Envoi…' : 'Envoyer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  )
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-card/40 border border-border/30 p-4 rounded-xl flex items-start gap-4 shadow-sm backdrop-blur-sm">
      <div className="p-2 bg-background/80 rounded-lg border border-border/20 text-muted-foreground shadow-xs shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1">
          {label}
        </p>
        <p className="text-sm font-semibold text-stone-700 truncate">{value}</p>
      </div>
    </div>
  )
}
