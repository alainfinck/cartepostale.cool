'use client'

import React, { useState, useTransition, useCallback } from 'react'
import Link from 'next/link'
import {
    Search, LayoutGrid, List, Eye, Share2, Mail, Trash2,
    ChevronDown, X, ExternalLink, MapPin, Calendar, User,
    Users, Archive, FileText, BarChart3, ArrowUpDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
        <div className="min-h-screen bg-[#fdfbf7]">
            {/* Header */}
            <div className="bg-white border-b border-stone-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-serif font-bold text-stone-800">
                                Manager
                            </h1>
                            <p className="text-sm text-stone-500 mt-0.5">
                                Gestion des cartes postales
                            </p>
                        </div>
                        <Link href="/">
                            <Button variant="outline" size="sm">
                                Retour au site
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <StatCard icon={<Mail size={18} />} label="Total" value={totalCards} color="text-stone-700 bg-white" />
                    <StatCard icon={<FileText size={18} />} label="Publiées" value={publishedCount} color="text-emerald-700 bg-emerald-50" />
                    <StatCard icon={<FileText size={18} />} label="Brouillons" value={draftCount} color="text-amber-700 bg-amber-50" />
                    <StatCard icon={<Archive size={18} />} label="Archivées" value={archivedCount} color="text-stone-500 bg-stone-50" />
                    <StatCard icon={<Eye size={18} />} label="Vues" value={totalViews} color="text-blue-700 bg-blue-50" />
                    <StatCard icon={<Share2 size={18} />} label="Partages" value={totalShares} color="text-purple-700 bg-purple-50" />
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <Input
                            placeholder="Rechercher par nom, lieu, message..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-9 bg-white"
                        />
                    </div>

                    <div className="flex gap-2">
                        {(['all', 'published', 'draft', 'archived'] as StatusFilter[]).map((s) => (
                            <button
                                key={s}
                                onClick={() => handleStatusFilter(s)}
                                className={cn(
                                    'px-3 py-2 text-xs font-medium rounded-lg border transition-colors',
                                    statusFilter === s
                                        ? 'bg-stone-800 text-white border-stone-800'
                                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                                )}
                            >
                                {s === 'all' ? 'Tous' : statusConfig[s].label}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-1 bg-white border border-stone-200 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                'p-2 rounded-md transition-colors',
                                viewMode === 'grid' ? 'bg-stone-100 text-stone-800' : 'text-stone-400 hover:text-stone-600'
                            )}
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                'p-2 rounded-md transition-colors',
                                viewMode === 'list' ? 'bg-stone-100 text-stone-800' : 'text-stone-400 hover:text-stone-600'
                            )}
                        >
                            <List size={16} />
                        </button>
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
                    <div className="text-center py-20">
                        <Mail size={48} className="mx-auto text-stone-300 mb-4" />
                        <h3 className="text-lg font-medium text-stone-600 mb-1">Aucune carte trouvée</h3>
                        <p className="text-stone-400 text-sm">
                            {search || statusFilter !== 'all'
                                ? 'Essayez de modifier vos filtres'
                                : 'Aucune carte postale dans la base de données'}
                        </p>
                    </div>
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
                    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-stone-100 bg-stone-50/50">
                                        <th className="text-left py-3 px-4 font-medium text-stone-500">Image</th>
                                        <th className="text-left py-3 px-4 font-medium text-stone-500">Expéditeur</th>
                                        <th className="text-left py-3 px-4 font-medium text-stone-500">Destinataire</th>
                                        <th className="text-left py-3 px-4 font-medium text-stone-500">Lieu</th>
                                        <th className="text-left py-3 px-4 font-medium text-stone-500">Date</th>
                                        <th className="text-left py-3 px-4 font-medium text-stone-500">Statut</th>
                                        <th className="text-right py-3 px-4 font-medium text-stone-500">Vues</th>
                                        <th className="text-right py-3 px-4 font-medium text-stone-500">Partages</th>
                                        <th className="text-right py-3 px-4 font-medium text-stone-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
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
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

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
            {deleteConfirm !== null && (
                <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-stone-800 mb-2">Confirmer la suppression</h3>
                        <p className="text-stone-500 text-sm mb-6">
                            Cette action est irréversible. La carte postale sera définitivement supprimée.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(null)}>
                                Annuler
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(deleteConfirm)}
                                disabled={isPending}
                            >
                                {isPending ? 'Suppression...' : 'Supprimer'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// --- Sub-components ---

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
    return (
        <div className={cn('rounded-xl border border-stone-200 p-4 flex items-center gap-3', color)}>
            <div className="opacity-60">{icon}</div>
            <div>
                <div className="text-xl font-bold leading-none">{value}</div>
                <div className="text-xs opacity-70 mt-0.5">{label}</div>
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return null
    return (
        <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full border', config.color)}>
            {config.label}
        </span>
    )
}

function StatusDropdown({ currentStatus, onUpdate, postcardId }: {
    currentStatus: string
    onUpdate: (id: number, status: 'published' | 'draft' | 'archived') => void
    postcardId: number
}) {
    const [open, setOpen] = useState(false)
    const statuses = ['published', 'draft', 'archived'] as const

    return (
        <div className="relative">
            <button
                onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
                className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700 transition-colors"
            >
                <ArrowUpDown size={12} />
                <span>Statut</span>
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg z-50 py-1 min-w-[120px]">
                        {statuses.map((s) => (
                            <button
                                key={s}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onUpdate(postcardId, s)
                                    setOpen(false)
                                }}
                                className={cn(
                                    'w-full text-left px-3 py-1.5 text-xs hover:bg-stone-50 transition-colors',
                                    currentStatus === s ? 'font-bold text-teal-600' : 'text-stone-600'
                                )}
                            >
                                {statusConfig[s].label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
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
        <div
            className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
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
        </div>
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
        <tr
            className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors cursor-pointer"
            onClick={onSelect}
        >
            <td className="py-3 px-4">
                <img src={imageUrl} alt="" className="w-16 h-11 object-cover rounded-md" />
            </td>
            <td className="py-3 px-4 font-medium text-stone-700">{postcard.senderName}</td>
            <td className="py-3 px-4 text-stone-600">{postcard.recipientName}</td>
            <td className="py-3 px-4 text-stone-500">{postcard.location}</td>
            <td className="py-3 px-4 text-stone-500">{formatDate(postcard.date)}</td>
            <td className="py-3 px-4"><StatusBadge status={postcard.status || 'draft'} /></td>
            <td className="py-3 px-4 text-right text-stone-500">{postcard.views || 0}</td>
            <td className="py-3 px-4 text-right text-stone-500">{postcard.shares || 0}</td>
            <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <Link href={`/view/${postcard.publicId}`} target="_blank">
                        <button className="text-stone-400 hover:text-teal-600 transition-colors" title="Voir la carte">
                            <ExternalLink size={14} />
                        </button>
                    </Link>
                    <StatusDropdown
                        currentStatus={postcard.status || 'draft'}
                        onUpdate={onUpdateStatus}
                        postcardId={postcard.id}
                    />
                    <button
                        onClick={() => onDelete(postcard.id)}
                        className="text-stone-300 hover:text-red-500 transition-colors"
                        title="Supprimer"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </td>
        </tr>
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
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 pt-12 overflow-y-auto" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Modal header */}
                <div className="flex items-center justify-between p-4 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                        <h2 className="font-serif font-bold text-lg text-stone-800">
                            Détail de la carte
                        </h2>
                        <StatusBadge status={postcard.status || 'draft'} />
                    </div>
                    <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Card preview */}
                <div className="p-6 bg-[#fdfbf7] flex justify-center">
                    <div className="transform scale-75 sm:scale-90 origin-top">
                        <PostcardView postcard={frontendPostcard} isPreview />
                    </div>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4">
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
                        <div className="bg-stone-50 rounded-lg p-4">
                            <p className="text-xs text-stone-400 mb-1">Message</p>
                            <p className="text-sm text-stone-700 leading-relaxed">{postcard.message}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100">
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
                    </div>
                </div>
            </div>
        </div>
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
