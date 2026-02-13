'use client'

import React, { useState, useTransition, useCallback, useEffect } from 'react'
import Link from 'next/link'
import {
    Search, LayoutGrid, List, Eye, Share2, Mail, Trash2,
    ChevronDown, ExternalLink, MapPin, Calendar, User,
    Users, Archive, FileText, BarChart3, ArrowUpDown,
    Building2, Image as ImageIcon, Cloud, LogOut, Menu, User as UserIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { getOptimizedImageUrl } from '@/lib/image-processing'
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
import { Postcard as PayloadPostcard, Media } from '@/payload-types'
import { getAllPostcards, updatePostcardStatus, deletePostcard, updatePostcard, PostcardsResult } from '@/actions/manager-actions'
import {
    getMyPostcards,
    updateMyPostcard,
    updateMyPostcardStatus,
    deleteMyPostcard,
} from '@/actions/espace-client-actions'
import { getPostcardViewStats, type PostcardViewStats } from '@/actions/postcard-view-stats'
import PostcardView from '@/components/postcard/PostcardView'
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
    else url = '/images/demo/photo-1507525428034-b723cf961d3e.jpg'

    return getOptimizedImageUrl(url, { width: 400 })
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
                    type: item.type === 'video' ? 'video' as const : 'image' as const,
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
        coords: p.coords?.lat && p.coords?.lng
            ? { lat: p.coords.lat, lng: p.coords.lng }
            : undefined,
    }
}

const statusConfig = {
    published: { label: 'Publiée', color: 'bg-emerald-100/80 text-emerald-700 border-emerald-200/50 backdrop-blur-sm' },
    draft: { label: 'Brouillon', color: 'bg-amber-100/80 text-amber-700 border-amber-200/50 backdrop-blur-sm' },
    archived: { label: 'Archivée', color: 'bg-stone-100/80 text-stone-500 border-stone-200/50 backdrop-blur-sm' },
} as const

interface Props {
    initialData: PostcardsResult
    /** When true, use espace-client Server Actions (getMyPostcards, etc.) instead of manager actions. */
    useEspaceClientActions?: boolean
}

export default function ManagerClient({ initialData, useEspaceClientActions }: Props) {
    const [data, setData] = useState(initialData)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [selectedPostcard, setSelectedPostcard] = useState<PayloadPostcard | null>(null)
    const [viewStats, setViewStats] = useState<PostcardViewStats | null>(null)
    const [isPending, startTransition] = useTransition()
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
    const [editingPostcard, setEditingPostcard] = useState<PayloadPostcard | null>(null)
    const [columns, setColumns] = useState(3)
    const [isAuto, setIsAuto] = useState(true)

    useEffect(() => {
        if (!isAuto) return

        const updateCols = () => {
            const w = window.innerWidth
            if (w < 640) setColumns(1)
            else if (w < 1024) setColumns(2)
            else if (w < 1280) setColumns(3)
            else if (w < 1536) setColumns(4)
            else if (w < 1920) setColumns(5)
            else setColumns(6)
        }

        updateCols()
        window.addEventListener('resize', updateCols)
        return () => window.removeEventListener('resize', updateCols)
    }, [isAuto])

    useEffect(() => {
        if (!selectedPostcard) {
            setViewStats(null)
            return
        }
        getPostcardViewStats(selectedPostcard.id).then(setViewStats)
    }, [selectedPostcard?.id])

    const postcards = data.docs

    // Stats
    const totalCards = data.totalDocs
    const publishedCount = postcards.filter(p => p.status === 'published').length
    const draftCount = postcards.filter(p => p.status === 'draft').length
    const archivedCount = postcards.filter(p => p.status === 'archived').length
    const totalViews = postcards.reduce((sum, p) => sum + (p.views || 0), 0)
    const totalShares = postcards.reduce((sum, p) => sum + (p.shares || 0), 0)

    const fetchPostcards = useEspaceClientActions
        ? (async (filters?: { status?: StatusFilter; search?: string }) =>
            getMyPostcards({
                status: filters?.status !== 'all' ? filters?.status : undefined,
                search: filters?.search,
            }))
        : (async (filters: any) => getAllPostcards(filters))
    const updatePostcardFn = useEspaceClientActions ? updateMyPostcard : updatePostcard
    const updatePostcardStatusFn = useEspaceClientActions ? updateMyPostcardStatus : updatePostcardStatus
    const deletePostcardFn = useEspaceClientActions ? deleteMyPostcard : deletePostcard

    const refreshData = useCallback((statusF?: StatusFilter, searchQ?: string) => {
        startTransition(async () => {
            const filters: any = {}
            const s = statusF ?? statusFilter
            const q = searchQ ?? search
            if (s !== 'all') filters.status = s
            if (q.trim()) filters.search = q.trim()
            const result = await fetchPostcards(filters)
            setData(result)
        })
    }, [statusFilter, search, fetchPostcards])

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

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatCard icon={<Mail size={18} />} label="Total" value={totalCards} />
                <StatCard icon={<FileText size={18} />} label="Publiées" value={publishedCount} variant="success" />
                <StatCard icon={<FileText size={18} />} label="Brouillons" value={draftCount} variant="warning" />
                <StatCard icon={<Archive size={18} />} label="Archivées" value={archivedCount} variant="muted" />
                <StatCard icon={<Eye size={18} />} label="Vues" value={totalViews} variant="info" />
                <StatCard icon={<Share2 size={18} />} label="Partages" value={totalShares} variant="info" />
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-card/50 backdrop-blur-md p-4 rounded-xl border border-border/50 shadow-sm">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
                                "px-3 text-xs h-8",
                                statusFilter === s && "bg-background shadow-sm hover:bg-background"
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
                        className={cn("h-8 w-8", viewMode === 'grid' && "bg-background shadow-sm hover:bg-background")}
                        onClick={() => setViewMode('grid')}
                    >
                        <LayoutGrid size={16} />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="icon"
                        className={cn("h-8 w-8", viewMode === 'list' && "bg-background shadow-sm hover:bg-background")}
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
                                "flex items-center justify-center min-w-[40px] px-2 text-xs font-bold transition-all",
                                isAuto ? "text-teal-600 bg-teal-50/50 rounded-md ring-1 ring-teal-500/20 shadow-[0_0_10px_rgba(20,184,166,0.1)]" : "text-stone-600"
                            )}
                            onClick={() => setIsAuto(!isAuto)}
                            title={isAuto ? "Passer en mode manuel" : "Passer en mode automatique"}
                        >
                            {columns}
                            {isAuto && <span className="ml-1 text-[8px] font-black tracking-tighter opacity-70">AUTO</span>}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:bg-muted"
                            onClick={() => {
                                setColumns(Math.min(6, columns + 1))
                                setIsAuto(false)
                            }}
                            disabled={columns >= 6}
                        >
                            <Plus size={14} />
                        </Button>
                    </div>
                )}
            </div>

            {/* Loading overlay */}
            {isPending && (
                <div className="flex items-center gap-2 text-sm text-stone-500">
                    <div className="w-4 h-4 border-2 border-stone-300 border-t-teal-500 rounded-full animate-spin" />
                    Chargement...
                </div>
            )
            }

            {/* Content */}
            {
                postcards.length === 0 ? (
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
                            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
                        }}
                    >
                        {postcards.map((postcard) => (
                            <GridCard
                                key={postcard.id}
                                postcard={postcard}
                                onSelect={() => setSelectedPostcard(postcard)}
                                onEdit={() => setEditingPostcard(postcard)}
                                onUpdateStatus={handleUpdateStatus}
                                onDelete={(id) => setDeleteConfirm(id)}
                            />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Image</TableHead>
                                        <TableHead>Expéditeur</TableHead>
                                        <TableHead>Destinataire</TableHead>
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
                                            onSelect={() => setSelectedPostcard(postcard)}
                                            onEdit={() => setEditingPostcard(postcard)}
                                            onUpdateStatus={handleUpdateStatus}
                                            onDelete={(id) => setDeleteConfirm(id)}
                                            formatDate={formatDate}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                )
            }

            {/* Side Panel Details */}
            <DetailsSheet
                postcard={selectedPostcard}
                viewStats={viewStats}
                isOpen={!!selectedPostcard}
                onClose={() => setSelectedPostcard(null)}
                onEdit={() => setEditingPostcard(selectedPostcard)}
                onUpdateStatus={handleUpdateStatus}
                onDelete={(id) => setDeleteConfirm(id)}
                formatDate={formatDate}
            />

            {/* Edit Dialog */}
            <EditPostcardDialog
                postcard={editingPostcard}
                isOpen={!!editingPostcard}
                onClose={() => setEditingPostcard(null)}
                onSuccess={() => {
                    refreshData()
                    if (selectedPostcard?.id === editingPostcard?.id) {
                        fetchPostcards({ search: search, status: statusFilter !== 'all' ? statusFilter : undefined }).then(res => {
                            const updated = res.docs.find(p => p.id === editingPostcard?.id)
                            if (updated) setSelectedPostcard(updated)
                        })
                    }
                }}
                updatePostcardFn={updatePostcardFn}
            />

            {/* Delete confirmation */}
            <Dialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
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
        </div >
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

function StatCard({ icon, label, value, variant = 'default' }: { icon: React.ReactNode; label: string; value: number; variant?: keyof typeof statVariants }) {
    return (
        <Card className={cn('p-4 flex items-center gap-3 shadow-none border', statVariants[variant])}>
            <CardContent className="flex flex-row items-center gap-3 p-0">
                <div className="opacity-60">{icon}</div>
                <div>
                    <div className="text-xl font-bold leading-none">{value}</div>
                    <div className="text-[10px] uppercase tracking-wider opacity-70 mt-1 font-medium">{label}</div>
                </div>
            </CardContent>
        </Card>
    )
}

function StatusBadge({ status }: { status: string }) {
    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return null
    return (
        <Badge variant="outline" className={cn("font-medium px-2 py-0 border shadow-none", config.color)}>
            {config.label}
        </Badge>
    )
}

function StatusDropdown({ currentStatus, onUpdate, postcardId }: {
    currentStatus: string
    onUpdate: (id: number, status: 'published' | 'draft' | 'archived') => void
    postcardId: number
}) {
    const statuses = ['published', 'draft', 'archived'] as const

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-[11px] text-muted-foreground hover:bg-muted/50 rounded-full border border-border/30">
                    <ArrowUpDown size={12} />
                    Statut
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 backdrop-blur-xl bg-background/80" onClick={(e) => e.stopPropagation()}>
                {statuses.map((s) => (
                    <DropdownMenuItem
                        key={s}
                        onClick={(e) => { e.stopPropagation(); onUpdate(postcardId, s) }}
                        className={cn(
                            "text-sm gap-2",
                            currentStatus === s && 'bg-muted font-medium'
                        )}
                    >
                        <div className={cn("w-2 h-2 rounded-full", s === 'published' ? 'bg-emerald-500' : s === 'draft' ? 'bg-amber-500' : 'bg-stone-400')} />
                        {statusConfig[s].label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function GridCard({ postcard, onSelect, onEdit, onUpdateStatus, onDelete }: {
    postcard: PayloadPostcard
    onSelect: () => void
    onEdit: () => void
    onUpdateStatus: (id: number, status: 'published' | 'draft' | 'archived') => void
    onDelete: (id: number) => void
}) {
    const imageUrl = getFrontImageUrl(postcard)

    return (
        <Card
            className="overflow-hidden border-border/50 hover:shadow-xl hover:shadow-black/5 transition-all duration-300 cursor-pointer group bg-card/60 backdrop-blur-sm"
            onClick={onSelect}
        >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={imageUrl}
                    alt={`Carte de ${postcard.senderName}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                    <StatusBadge status={postcard.status || 'draft'} />
                </div>
                {postcard.isPremium && (
                    <div className="absolute top-3 right-3 bg-amber-400/90 backdrop-blur-sm text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                        PREMIUM
                    </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-xs line-clamp-2 italic">&quot;{postcard.message}&quot;</p>
                </div>
            </div>

            {/* Info */}
            <div className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-semibold text-stone-800">
                            <span className="bg-teal-100 text-teal-700 text-[10px] px-1.5 py-0.5 rounded leading-none">DE</span>
                            {postcard.senderName}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-stone-500">
                            <span className="bg-stone-100 text-stone-600 text-[10px] px-1.5 py-0.5 rounded leading-none">À</span>
                            {postcard.recipientName}
                        </div>
                    </div>
                    <div className="text-[10px] font-medium text-stone-400 bg-stone-50 px-2 py-1 rounded-md border border-stone-100">
                        {new Date(postcard.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }).toUpperCase()}
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-stone-500 py-1.5 px-2 bg-stone-50/50 rounded-lg border border-stone-100/50">
                    <MapPin size={12} className="text-orange-400 shrink-0" />
                    <span className="truncate">{postcard.location}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/10">
                    <div className="flex items-center gap-3 text-xs text-stone-400">
                        <span className="flex items-center gap-1 hover:text-stone-600 transition-colors"><Eye size={12} /> {postcard.views || 0}</span>
                        <span className="flex items-center gap-1 hover:text-stone-600 transition-colors"><Share2 size={12} /> {postcard.shares || 0}</span>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Link href={`/carte/${postcard.publicId}`} target="_blank" onClick={(e) => e.stopPropagation()}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-stone-400 hover:text-teal-600 transition-colors rounded-full border border-border/30"
                                title="Ouvrir dans un nouvel onglet"
                            >
                                <ExternalLink size={14} />
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); onEdit() }}
                            className="h-8 w-8 text-stone-400 hover:text-teal-600 hover:bg-teal-50 transition-all rounded-full border border-border/30"
                            title="Modifier"
                        >
                            <Pencil size={14} />
                        </Button>
                        <StatusDropdown
                            currentStatus={postcard.status || 'draft'}
                            onUpdate={onUpdateStatus}
                            postcardId={postcard.id}
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); onDelete(postcard.id) }}
                            className="h-8 w-8 text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-full"
                        >
                            <Trash2 size={14} />
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    )
}

function ListRow({ postcard, onSelect, onEdit, onUpdateStatus, onDelete, formatDate }: {
    postcard: PayloadPostcard
    onSelect: () => void
    onEdit: () => void
    onUpdateStatus: (id: number, status: 'published' | 'draft' | 'archived') => void
    onDelete: (id: number) => void
    formatDate: (d: string) => string
}) {
    const imageUrl = getFrontImageUrl(postcard)

    return (
        <TableRow className="group cursor-pointer hover:bg-muted/30 transition-colors border-border/50" onClick={onSelect}>
            <TableCell>
                <div className="relative w-16 h-11 group-hover:scale-105 transition-transform duration-300">
                    <img src={imageUrl} alt="" className="w-full h-full object-cover rounded-md shadow-sm border border-border/30" />
                </div>
            </TableCell>
            <TableCell className="font-semibold text-stone-800">{postcard.senderName}</TableCell>
            <TableCell className="text-stone-600">{postcard.recipientName}</TableCell>
            <TableCell className="text-stone-500 max-w-[150px] truncate">{postcard.location}</TableCell>
            <TableCell className="text-stone-400 text-xs font-medium uppercase">{formatDate(postcard.date)}</TableCell>
            <TableCell><StatusBadge status={postcard.status || 'draft'} /></TableCell>
            <TableCell className="text-right text-stone-500 font-medium">{postcard.views || 0}</TableCell>
            <TableCell className="text-right text-stone-500 font-medium">{postcard.shares || 0}</TableCell>
            <TableCell>
                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Link href={`/carte/${postcard.publicId}`} target="_blank">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-400 hover:text-teal-600 transition-colors rounded-full" title="Voir la carte">
                            <ExternalLink size={14} />
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-stone-400 hover:text-teal-600 hover:bg-teal-50 transition-all rounded-full"
                        onClick={() => onEdit()}
                        title="Modifier"
                    >
                        <Pencil size={14} />
                    </Button>
                    <StatusDropdown
                        currentStatus={postcard.status || 'draft'}
                        onUpdate={onUpdateStatus}
                        postcardId={postcard.id}
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-full"
                        onClick={() => onDelete(postcard.id)}
                        title="Supprimer"
                    >
                        <Trash2 size={14} />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    )
}

function DetailsSheet({ postcard, viewStats, isOpen, onClose, onEdit, onUpdateStatus, onDelete, formatDate }: {
    postcard: PayloadPostcard | null
    viewStats: PostcardViewStats | null
    isOpen: boolean
    onClose: () => void
    onEdit: () => void
    onUpdateStatus: (id: number, status: 'published' | 'draft' | 'archived') => void
    onDelete: (id: number) => void
    formatDate: (d: string) => string
}) {
    if (!postcard) return null
    const frontendPostcard = mapToFrontend(postcard)
    const publicUrl = `/carte/${postcard.publicId}`

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="sm:max-w-xl w-full p-0 flex flex-col border-l border-border/50 bg-background/95 backdrop-blur-xl animate-in slide-in-from-right duration-500">
                <SheetHeader className="p-6 border-b border-border/30 bg-card/30">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <SheetTitle className="text-xl font-bold">Détails de la carte</SheetTitle>
                            <SheetDescription className="text-xs uppercase tracking-widest font-medium">#{postcard.publicId}</SheetDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/manager/stats">
                                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-[11px] text-muted-foreground hover:bg-muted/50 rounded-full border border-border/30">
                                    <BarChart3 size={12} />
                                    Stats détaillées
                                </Button>
                            </Link>
                            <StatusBadge status={postcard.status || 'draft'} />
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-6 space-y-8">
                        {/* Preview Section */}
                        <div className="bg-stone-50/50 rounded-2xl p-6 border border-stone-200/50 flex justify-center shadow-inner overflow-hidden relative group">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,128,128,0.05),transparent)] pointer-events-none" />
                            <div className="transform scale-[0.65] sm:scale-[0.85] origin-center transition-transform hover:scale-[0.88] duration-700">
                                <PostcardView postcard={frontendPostcard} isPreview />
                            </div>
                        </div>

                        {/* Metadatas Section */}
                        <div className="grid grid-cols-2 gap-4">
                            <InfoCard icon={<User size={16} />} label="Expéditeur" value={postcard.senderName || ''} />
                            <InfoCard icon={<Users size={16} />} label="Destinataire" value={postcard.recipientName || ''} />
                            <InfoCard icon={<MapPin size={16} className="text-orange-400" />} label="Lieu" value={postcard.location || ''} />
                            <InfoCard icon={<Calendar size={16} />} label="Date de l'envoi" value={formatDate(postcard.date)} />
                            <InfoCard
                                icon={<UserIcon size={16} className="text-teal-500" />}
                                label="Client (Compte)"
                                value={typeof postcard.author === 'object' && postcard.author ? (postcard.author.name || postcard.author.email) : 'Aucun'}
                            />
                        </div>

                        {/* Stats & Tech Section */}
                        <div className="p-4 bg-muted/30 rounded-xl border border-border/30 space-y-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 opacity-50">Audience & Technique</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-tight">Vues</p>
                                    <p className="text-2xl font-bold text-foreground">{postcard.views || 0}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-tight">Partages</p>
                                    <p className="text-2xl font-bold text-foreground">{postcard.shares || 0}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-tight">Type</p>
                                    <Badge variant={postcard.isPremium ? "secondary" : "outline"} className="mt-1 shadow-none">
                                        {postcard.isPremium ? "Premium" : "Classique"}
                                    </Badge>
                                </div>
                            </div>
                            {viewStats && (
                                <>
                                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/20">
                                        <div>
                                            <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-tight">Sessions uniques</p>
                                            <p className="text-lg font-semibold text-foreground">{viewStats.uniqueSessions}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground mb-0.5 uppercase tracking-tight">Temps moyen (s)</p>
                                            <p className="text-lg font-semibold text-foreground">
                                                {viewStats.avgDurationSeconds != null ? Math.round(viewStats.avgDurationSeconds) : '—'}
                                            </p>
                                        </div>
                                    </div>
                                    {(viewStats.byCountry.length > 0 || viewStats.byBrowser.length > 0) && (
                                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/20">
                                            {viewStats.byCountry.length > 0 && (
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-tight">Pays (top)</p>
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
                                                    <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-tight">Navigateurs (top)</p>
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
                                            <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-tight">Dernières ouvertures</p>
                                            <ul className="space-y-1.5 text-xs text-foreground max-h-32 overflow-y-auto">
                                                {viewStats.recentEvents.map((ev, i) => (
                                                    <li key={i} className="flex justify-between gap-2 py-1 border-b border-border/10 last:border-0">
                                                        <span className="text-muted-foreground truncate">
                                                            {new Date(ev.openedAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        <span className="truncate">{ev.country ?? '—'}</span>
                                                        <span className="truncate">{ev.browser ?? '—'}</span>
                                                        <span className="tabular-nums">{ev.durationSeconds != null ? `${ev.durationSeconds}s` : '—'}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Message Section */}
                        {postcard.message && (
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Message écrit</h4>
                                <div className="bg-card border border-border/50 rounded-xl p-5 shadow-sm italic text-stone-600 leading-relaxed relative bg-gradient-to-br from-white to-stone-50">
                                    <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                                        <FileText size={48} />
                                    </div>
                                    &quot;{postcard.message}&quot;
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-border/30 bg-card/30 backdrop-blur-sm">
                    <div className="flex flex-wrap items-center gap-3">
                        <Link href={publicUrl} target="_blank" className="flex-1">
                            <Button variant="default" className="w-full gap-2 shadow-teal-500/20 shadow-lg bg-teal-600 hover:bg-teal-700 rounded-xl py-6 transition-all active:scale-[0.98]">
                                <ExternalLink size={16} />
                                Voir en ligne
                            </Button>
                        </Link>

                        <div className="flex gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-12 px-4 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm">
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
                                            <div className={cn("w-3 h-3 rounded-full", s === 'published' ? 'bg-emerald-500' : s === 'draft' ? 'bg-amber-500' : 'bg-stone-400')} />
                                            <span>Marquer comme {statusConfig[s as keyof typeof statusConfig].label}</span>
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
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1">{label}</p>
                <p className="text-sm font-semibold text-stone-700 truncate">{value}</p>
            </div>
        </div>
    )
}
