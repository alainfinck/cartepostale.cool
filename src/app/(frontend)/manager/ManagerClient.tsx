'use client'

import React, { useState, useTransition, useCallback } from 'react'
import Link from 'next/link'
import {
    Search, LayoutGrid, List, Eye, Share2, Mail, Trash2,
    ChevronDown, ExternalLink, MapPin, Calendar, User,
    Users, Archive, FileText, BarChart3, ArrowUpDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
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
import { Postcard as PayloadPostcard, Media } from '@/payload-types'
import { getAllPostcards, updatePostcardStatus, deletePostcard, PostcardsResult } from '@/actions/manager-actions'
import PostcardView from '@/components/postcard/PostcardView'
import { Postcard as FrontendPostcard, MediaItem } from '@/types'

type StatusFilter = 'all' | 'published' | 'draft' | 'archived'
type ViewMode = 'grid' | 'list'

function isMedia(media: any): media is Media {
    return media && typeof media === 'object' && 'url' in media
}

function getFrontImageUrl(postcard: PayloadPostcard): string {
    if (postcard.frontImageURL) return postcard.frontImageURL
    if (isMedia(postcard.frontImage) && postcard.frontImage.url) return postcard.frontImage.url
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
}

function mapToFrontend(p: PayloadPostcard): FrontendPostcard {
    const mediaItems: MediaItem[] = (p.mediaItems || [])
        .map((item: any) => {
            if (isMedia(item.media)) {
                return {
                    id: item.id || Math.random().toString(36).substring(7),
                    type: item.type === 'video' ? 'video' as const : 'image' as const,
                    url: item.media.url || '',
                }
            }
            return null
        })
        .filter((item): item is MediaItem => item !== null)

    return {
        id: p.publicId,
        frontImage: getFrontImageUrl(p),
        message: p.message,
        recipientName: p.recipientName,
        senderName: p.senderName,
        location: p.location,
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
    published: { label: 'Publiée', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    draft: { label: 'Brouillon', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    archived: { label: 'Archivée', color: 'bg-stone-100 text-stone-500 border-stone-200' },
} as const

interface Props {
    initialData: PostcardsResult
}

export default function ManagerClient({ initialData }: Props) {
    const [data, setData] = useState(initialData)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [selectedPostcard, setSelectedPostcard] = useState<PayloadPostcard | null>(null)
    const [isPending, startTransition] = useTransition()
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

    const postcards = data.docs

    // Stats
    const totalCards = data.totalDocs
    const publishedCount = postcards.filter(p => p.status === 'published').length
    const draftCount = postcards.filter(p => p.status === 'draft').length
    const archivedCount = postcards.filter(p => p.status === 'archived').length
    const totalViews = postcards.reduce((sum, p) => sum + (p.views || 0), 0)
    const totalShares = postcards.reduce((sum, p) => sum + (p.shares || 0), 0)

    const refreshData = useCallback((statusF?: StatusFilter, searchQ?: string) => {
        startTransition(async () => {
            const filters: any = {}
            const s = statusF ?? statusFilter
            const q = searchQ ?? search
            if (s !== 'all') filters.status = s
            if (q.trim()) filters.search = q.trim()
            const result = await getAllPostcards(filters)
            setData(result)
        })
    }, [statusFilter, search])

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
            const result = await updatePostcardStatus(id, newStatus)
            if (result.success) {
                refreshData()
            }
        })
    }

    const handleDelete = (id: number) => {
        startTransition(async () => {
            const result = await deletePostcard(id)
            if (result.success) {
                setDeleteConfirm(null)
                if (selectedPostcard?.id === id) setSelectedPostcard(null)
                refreshData()
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
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par nom, lieu, message..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <div className="flex gap-2">
                        {(['all', 'published', 'draft', 'archived'] as StatusFilter[]).map((s) => (
                            <Button
                                key={s}
                                variant={statusFilter === s ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleStatusFilter(s)}
                            >
                                {s === 'all' ? 'Tous' : statusConfig[s].label}
                            </Button>
                        ))}
                    </div>

                    <div className="flex gap-1 rounded-lg border p-1">
                        <Button
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid size={16} />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewMode('list')}
                        >
                            <List size={16} />
                        </Button>
                    </div>
                </div>

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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {postcards.map((postcard) => (
                            <GridCard
                                key={postcard.id}
                                postcard={postcard}
                                onSelect={() => setSelectedPostcard(postcard)}
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
                                            onUpdateStatus={handleUpdateStatus}
                                            onDelete={(id) => setDeleteConfirm(id)}
                                            formatDate={formatDate}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                )}

            {/* Detail Modal */}
            {selectedPostcard && (
                <DetailModal
                    postcard={selectedPostcard}
                    onClose={() => setSelectedPostcard(null)}
                    onUpdateStatus={handleUpdateStatus}
                    onDelete={(id) => setDeleteConfirm(id)}
                    formatDate={formatDate}
                />
            )}

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
        </div>
    )
}

// --- Sub-components ---

const statVariants = {
    default: 'border-border bg-card',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    muted: 'border-border bg-muted/50 text-muted-foreground',
    info: 'border-blue-200 bg-blue-50 text-blue-700',
} as const

function StatCard({ icon, label, value, variant = 'default' }: { icon: React.ReactNode; label: string; value: number; variant?: keyof typeof statVariants }) {
    return (
        <Card className={cn('p-4 flex items-center gap-3', statVariants[variant])}>
            <CardContent className="flex flex-row items-center gap-3 p-0">
                <div className="opacity-60">{icon}</div>
                <div>
                    <div className="text-xl font-bold leading-none">{value}</div>
                    <div className="text-xs opacity-70 mt-0.5">{label}</div>
                </div>
            </CardContent>
        </Card>
    )
}

function StatusBadge({ status }: { status: string }) {
    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return null
    const variant = status === 'published' ? 'default' : status === 'draft' ? 'secondary' : 'outline'
    return <Badge variant={variant}>{config.label}</Badge>
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
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-muted-foreground">
                    <ArrowUpDown size={12} />
                    Statut
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                {statuses.map((s) => (
                    <DropdownMenuItem
                        key={s}
                        onClick={(e) => { e.stopPropagation(); onUpdate(postcardId, s) }}
                        className={cn(currentStatus === s && 'font-semibold')}
                    >
                        {statusConfig[s].label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function GridCard({ postcard, onSelect, onUpdateStatus, onDelete }: {
    postcard: PayloadPostcard
    onSelect: () => void
    onUpdateStatus: (id: number, status: 'published' | 'draft' | 'archived') => void
    onDelete: (id: number) => void
}) {
    const imageUrl = getFrontImageUrl(postcard)

    return (
        <Card
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
            onClick={onSelect}
        >
            {/* Image */}
            <div className="relative h-44 overflow-hidden">
                <img
                    src={imageUrl}
                    alt={`Carte de ${postcard.senderName}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                    <StatusBadge status={postcard.status || 'draft'} />
                </div>
                {postcard.isPremium && (
                    <div className="absolute top-3 right-3 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        PREMIUM
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-stone-800">
                        <User size={14} className="text-teal-500" />
                        {postcard.senderName}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-stone-400">
                        <Calendar size={12} />
                        {new Date(postcard.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <Users size={12} />
                    <span>vers {postcard.recipientName}</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <MapPin size={12} className="text-orange-400" />
                    <span className="truncate">{postcard.location}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <div className="flex items-center gap-3 text-xs text-stone-400">
                        <span className="flex items-center gap-1"><Eye size={12} /> {postcard.views || 0}</span>
                        <span className="flex items-center gap-1"><Share2 size={12} /> {postcard.shares || 0}</span>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <StatusDropdown
                            currentStatus={postcard.status || 'draft'}
                            onUpdate={onUpdateStatus}
                            postcardId={postcard.id}
                        />
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(postcard.id) }}
                            className="text-stone-300 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </Card>
    )
}

function ListRow({ postcard, onSelect, onUpdateStatus, onDelete, formatDate }: {
    postcard: PayloadPostcard
    onSelect: () => void
    onUpdateStatus: (id: number, status: 'published' | 'draft' | 'archived') => void
    onDelete: (id: number) => void
    formatDate: (d: string) => string
}) {
    const imageUrl = getFrontImageUrl(postcard)

    return (
        <TableRow className="cursor-pointer" onClick={onSelect}>
            <TableCell>
                <img src={imageUrl} alt="" className="w-16 h-11 object-cover rounded-md" />
            </TableCell>
            <TableCell className="font-medium">{postcard.senderName}</TableCell>
            <TableCell>{postcard.recipientName}</TableCell>
            <TableCell className="text-muted-foreground">{postcard.location}</TableCell>
            <TableCell className="text-muted-foreground">{formatDate(postcard.date)}</TableCell>
            <TableCell><StatusBadge status={postcard.status || 'draft'} /></TableCell>
            <TableCell className="text-right text-muted-foreground">{postcard.views || 0}</TableCell>
            <TableCell className="text-right text-muted-foreground">{postcard.shares || 0}</TableCell>
            <TableCell>
                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Link href={`/view/${postcard.publicId}`} target="_blank">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Voir la carte">
                            <ExternalLink size={14} />
                        </Button>
                    </Link>
                    <StatusDropdown
                        currentStatus={postcard.status || 'draft'}
                        onUpdate={onUpdateStatus}
                        postcardId={postcard.id}
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
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

function DetailModal({ postcard, onClose, onUpdateStatus, onDelete, formatDate }: {
    postcard: PayloadPostcard
    onClose: () => void
    onUpdateStatus: (id: number, status: 'published' | 'draft' | 'archived') => void
    onDelete: (id: number) => void
    formatDate: (d: string) => string
}) {
    const frontendPostcard = mapToFrontend(postcard)
    const publicUrl = `/view/${postcard.publicId}`

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <DialogTitle>Détail de la carte</DialogTitle>
                        <StatusBadge status={postcard.status || 'draft'} />
                    </div>
                </DialogHeader>

                <div className="p-6 bg-muted/30 flex justify-center rounded-lg">
                    <div className="transform scale-75 sm:scale-90 origin-top">
                        <PostcardView postcard={frontendPostcard} isPreview />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <InfoItem icon={<User size={14} />} label="Expéditeur" value={postcard.senderName} />
                        <InfoItem icon={<Users size={14} />} label="Destinataire" value={postcard.recipientName} />
                        <InfoItem icon={<MapPin size={14} />} label="Lieu" value={postcard.location} />
                        <InfoItem icon={<Calendar size={14} />} label="Date" value={formatDate(postcard.date)} />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <InfoItem icon={<Eye size={14} />} label="Vues" value={String(postcard.views || 0)} />
                        <InfoItem icon={<Share2 size={14} />} label="Partages" value={String(postcard.shares || 0)} />
                        <InfoItem icon={<BarChart3 size={14} />} label="ID Public" value={postcard.publicId} />
                        <InfoItem
                            icon={<FileText size={14} />}
                            label="Créée le"
                            value={formatDate(postcard.createdAt)}
                        />
                    </div>

                    {postcard.message && (
                        <div className="bg-muted/50 rounded-lg p-4">
                            <p className="text-xs text-muted-foreground mb-1">Message</p>
                            <p className="text-sm leading-relaxed">{postcard.message}</p>
                        </div>
                    )}

                    <DialogFooter className="flex flex-wrap gap-2 border-t pt-4">
                        <Link href={publicUrl} target="_blank">
                            <Button variant="outline" size="sm">
                                <ExternalLink size={14} />
                                Voir la carte
                            </Button>
                        </Link>

                        {postcard.status !== 'published' && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onUpdateStatus(postcard.id, 'published')}
                                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            >
                                Publier
                            </Button>
                        )}
                        {postcard.status !== 'draft' && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onUpdateStatus(postcard.id, 'draft')}
                                className="text-amber-600 border-amber-200 hover:bg-amber-50"
                            >
                                Brouillon
                            </Button>
                        )}
                        {postcard.status !== 'archived' && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onUpdateStatus(postcard.id, 'archived')}
                                className="text-stone-500 border-stone-200 hover:bg-stone-50"
                            >
                                Archiver
                            </Button>
                        )}

                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(postcard.id)}
                            className="ml-auto"
                        >
                            <Trash2 size={14} />
                            Supprimer
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-start gap-2">
            <div className="text-stone-400 mt-0.5">{icon}</div>
            <div>
                <p className="text-[11px] text-stone-400">{label}</p>
                <p className="text-stone-700 font-medium">{value}</p>
            </div>
        </div>
    )
}
