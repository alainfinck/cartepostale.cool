'use client'

import { useState, useTransition, useCallback } from 'react'
import {
    Search, Plus, Building2, MapPin, Phone,
    Mail, Calendar, Trash2, Edit2, Globe,
    ExternalLink, ArrowUpDown, Shield, LogIn, Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { getAllAgencies, createAgency, updateAgency, deleteAgency, getAgencyPanelLoginLink, getAgencyUsersMap } from '@/actions/manager-actions'
import type { Agency, User } from '@/payload-types'

export type AgencyUsersMap = Record<number, User[]>

function AgencyUsersCell({ users }: { users: User[] }) {
    if (users.length === 0) {
        return (
            <div className="flex items-center gap-1.5 text-xs text-stone-400">
                <Users size={12} className="text-stone-300" />
                <span>Aucun utilisateur</span>
            </div>
        )
    }
    return (
        <div className="flex flex-col gap-1 min-w-0 max-w-[200px]">
            {users.map((u) => (
                <div key={u.id} className="flex items-center gap-1.5 text-xs min-w-0">
                    <span className="truncate text-stone-700 font-medium" title={u.email ?? undefined}>
                        {u.name || u.email}
                    </span>
                    <Badge variant="outline" className={cn(
                        'shrink-0 text-[10px] px-1.5 py-0 font-medium',
                        u.role === 'agence' ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-violet-50 text-violet-700 border-violet-200'
                    )}>
                        {u.role === 'agence' ? 'Agence' : 'Client'}
                    </Badge>
                </div>
            ))}
        </div>
    )
}

export function ManagerAgenciesClient({ initialAgencies, initialAgencyUsers = {} }: { initialAgencies: Agency[]; initialAgencyUsers?: AgencyUsersMap }) {
    const [agencies, setAgencies] = useState(initialAgencies)
    const [agencyUsersMap, setAgencyUsersMap] = useState<AgencyUsersMap>(initialAgencyUsers)
    const [search, setSearch] = useState('')
    const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [deleteConfirm, setDeleteConfirm] = useState<number | string | null>(null)
    const [panelLinkAgencyId, setPanelLinkAgencyId] = useState<number | string | null>(null)
    const [panelLinkError, setPanelLinkError] = useState<string | null>(null)

    const refreshData = useCallback((searchQ?: string) => {
        startTransition(async () => {
            const q = searchQ ?? search
            const [agenciesResult, usersMap] = await Promise.all([
                getAllAgencies({ search: q.trim() || undefined }),
                getAgencyUsersMap(),
            ])
            setAgencies(agenciesResult.docs as any)
            setAgencyUsersMap(usersMap)
        })
    }, [search])

    const handleSearch = (value: string) => {
        setSearch(value)
        refreshData(value)
    }

    const handleCreateAgency = () => {
        setSelectedAgency(null)
        setIsSheetOpen(true)
    }

    const handleEditAgency = (agency: Agency) => {
        setSelectedAgency(agency)
        setIsSheetOpen(true)
    }

    const handleDelete = (id: number | string) => {
        startTransition(async () => {
            const result = await deleteAgency(id)
            if (result.success) {
                setDeleteConfirm(null)
                if (selectedAgency?.id === id) {
                    setIsSheetOpen(false)
                    setSelectedAgency(null)
                }
                refreshData()
            }
        })
    }

    const handleOpenAgencyPanel = (agency: Agency) => {
        setPanelLinkError(null)
        setPanelLinkAgencyId(agency.id)
        getAgencyPanelLoginLink(agency.id).then((result) => {
            setPanelLinkAgencyId(null)
            if (result.success && result.url) {
                window.location.href = result.url
            } else {
                setPanelLinkError(result.error || 'Impossible d\'accéder au panel agence.')
            }
        })
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header & Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-stone-800">Agences Partenaires</h1>
                    <p className="text-stone-500 text-sm">Gérez les agences de voyage et offices de tourisme.</p>
                </div>

                <Button onClick={handleCreateAgency} className="gap-2 bg-teal-600 hover:bg-teal-700 shadow-teal-500/20 shadow-lg rounded-xl h-11 px-6 transition-all active:scale-[0.98]">
                    <Plus size={18} />
                    Nouvelle Agence
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center bg-card/50 backdrop-blur-md p-4 rounded-xl border border-border/50 shadow-sm">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par nom, ville, code..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-9 bg-background/50 border-border/50 focus-visible:ring-teal-500/30"
                    />
                </div>
            </div>

            {panelLinkError && (
                <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                    <span>{panelLinkError}</span>
                    <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-900 shrink-0" onClick={() => setPanelLinkError(null)}>
                        Fermer
                    </Button>
                </div>
            )}

            {isPending && (
                <div className="flex items-center gap-2 text-sm text-stone-500 animate-pulse px-2">
                    <div className="w-4 h-4 border-2 border-stone-300 border-t-teal-500 rounded-full animate-spin" />
                    Mise à jour...
                </div>
            )}

            <Card className="overflow-hidden border-border/50 shadow-sm bg-card/60 backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead>Agence</TableHead>
                                <TableHead>Utilisateurs</TableHead>
                                <TableHead>Localisation</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {agencies.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3 opacity-50">
                                            <Building2 size={48} className="text-muted-foreground" />
                                            <p className="text-muted-foreground font-medium">Aucune agence trouvée.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                agencies.map((agency: any) => (
                                    <TableRow key={agency.id} className="group cursor-pointer hover:bg-muted/30 transition-colors border-border/50" onClick={() => handleEditAgency(agency)}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm shadow-sm">
                                                    {agency.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-semibold text-stone-800 truncate">{agency.name}</span>
                                                    <span className="text-[10px] text-stone-400 font-bold tracking-widest uppercase truncate">{agency.code || 'SANS CODE'}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <AgencyUsersCell users={agencyUsersMap[agency.id] ?? []} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                <span className="text-stone-700 font-medium">{agency.city}</span>
                                                <span className="text-xs text-stone-400">{agency.region || agency.country}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {agency.email && (
                                                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                                                        <Mail size={12} className="text-stone-300" />
                                                        {agency.email}
                                                    </div>
                                                )}
                                                {agency.phone && (
                                                    <div className="flex items-center gap-1.5 text-xs text-stone-500">
                                                        <Phone size={12} className="text-stone-300" />
                                                        {agency.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 font-medium shadow-none px-2 py-0">
                                                Active
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-stone-400 hover:text-teal-600 transition-colors rounded-full"
                                                    title="Accéder au panel agence"
                                                    onClick={() => handleOpenAgencyPanel(agency)}
                                                    disabled={panelLinkAgencyId === agency.id}
                                                >
                                                    {panelLinkAgencyId === agency.id ? (
                                                        <div className="w-3.5 h-3.5 border-2 border-stone-300 border-t-teal-500 rounded-full animate-spin" />
                                                    ) : (
                                                        <LogIn size={14} />
                                                    )}
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-400 hover:text-teal-600 transition-colors rounded-full" onClick={() => handleEditAgency(agency)}>
                                                    <Edit2 size={14} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-full"
                                                    onClick={() => setDeleteConfirm(agency.id)}
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            <div className="flex items-center justify-between px-2">
                <p className="text-xs font-medium text-stone-400 uppercase tracking-widest">
                    {agencies.length} agence{agencies.length !== 1 ? 's' : ''} au total
                </p>
            </div>

            {/* Agency Sheet (Create/Edit) */}
            <AgencySheet
                agency={selectedAgency}
                agencyUsers={selectedAgency ? (agencyUsersMap[selectedAgency.id] ?? []) : []}
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                onRefresh={() => refreshData()}
                onOpenAgencyPanel={handleOpenAgencyPanel}
                panelLinkAgencyId={panelLinkAgencyId}
            />

            {/* Delete confirmation */}
            <Dialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                <DialogContent className="sm:max-w-sm" onClick={(e) => e.stopPropagation()}>
                    <DialogHeader>
                        <DialogTitle>Supprimer l&apos;agence</DialogTitle>
                        <DialogDescription>
                            Cette action est irréversible. Toutes les données liées à cette agence seront définitivement supprimées.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
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

function AgencySheet({ agency, agencyUsers, isOpen, onClose, onRefresh, onOpenAgencyPanel, panelLinkAgencyId }: {
    agency: any | null
    agencyUsers: User[]
    isOpen: boolean
    onClose: () => void
    onRefresh: () => void
    onOpenAgencyPanel?: (agency: Agency) => void
    panelLinkAgencyId?: number | string | null
}) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData.entries())

        startTransition(async () => {
            const result = agency
                ? await updateAgency(agency.id, data)
                : await createAgency(data)

            if (result.success) {
                onRefresh()
                onClose()
            } else {
                setError(result.error || 'Une erreur est survenue')
            }
        })
    }

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="sm:max-w-xl w-full p-0 flex flex-col border-l border-border/50 bg-background/95 backdrop-blur-xl">
                <SheetHeader className="p-6 border-b border-border/30 bg-card/30">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <SheetTitle className="text-xl font-bold">
                                {agency ? 'Modifier l\'agence' : 'Nouvelle agence'}
                            </SheetTitle>
                            <SheetDescription className="text-xs uppercase tracking-widest font-medium opacity-70">
                                {agency ? `CODE: ${agency.code || agency.id}` : 'Remplissez les informations'}
                            </SheetDescription>
                        </div>
                        {agency && (
                            <div className="flex items-center gap-2">
                                {onOpenAgencyPanel && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="gap-1.5 text-teal-700 border-teal-200 hover:bg-teal-50"
                                        onClick={() => onOpenAgencyPanel(agency)}
                                        disabled={panelLinkAgencyId === agency.id}
                                    >
                                        {panelLinkAgencyId === agency.id ? (
                                            <div className="w-3.5 h-3.5 border-2 border-teal-300 border-t-teal-600 rounded-full animate-spin" />
                                        ) : (
                                            <LogIn size={14} />
                                        )}
                                        Accéder au panel agence
                                    </Button>
                                )}
                                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm">
                                    {agency.name.charAt(0).toUpperCase()}
                                </div>
                            </div>
                        )}
                    </div>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                    <div className="p-6 space-y-6 flex-1">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-200">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Informations Agence</h4>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-tight text-stone-500">Nom de l&apos;agence</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-stone-300" />
                                    <Input name="name" required defaultValue={agency?.name || ''} placeholder="Ex: Office de Tourisme de Paris" className="pl-10 bg-background/50 border-border/50" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-tight text-stone-500">Code Interne</label>
                                    <Input name="code" defaultValue={agency?.code || ''} placeholder="Ex: OTPARIS-01" className="bg-background/50 border-border/50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-tight text-stone-500">Région</label>
                                    <Input name="region" defaultValue={agency?.region || ''} placeholder="Ex: Île-de-France" className="bg-background/50 border-border/50" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-border/30">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Localisation</h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-tight text-stone-500">Ville</label>
                                    <Input name="city" required defaultValue={agency?.city || ''} placeholder="Paris" className="bg-background/50 border-border/50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-tight text-stone-500">Pays</label>
                                    <Input name="country" defaultValue={agency?.country || 'France'} className="bg-background/50 border-border/50" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-tight text-stone-500">Adresse</label>
                                <Input name="address" defaultValue={agency?.address || ''} placeholder="123 rue de Rivoli" className="bg-background/50 border-border/50" />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-border/30">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Contact</h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-tight text-stone-500">Email</label>
                                    <Input name="email" type="email" defaultValue={agency?.email || ''} placeholder="contact@agence.com" className="bg-background/50 border-border/50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-tight text-stone-500">Téléphone</label>
                                    <Input name="phone" defaultValue={agency?.phone || ''} placeholder="+33..." className="bg-background/50 border-border/50" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-tight text-stone-500">Site Web</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3 h-4 w-4 text-stone-300" />
                                    <Input name="website" defaultValue={agency?.website || ''} placeholder="https://..." className="pl-10 bg-background/50 border-border/50" />
                                </div>
                            </div>
                        </div>

                        {agency && (
                            <div className="space-y-4 pt-4 border-t border-border/30">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50 flex items-center gap-2">
                                    <Users size={12} />
                                    Utilisateurs associés
                                </h4>
                                {agencyUsers.length === 0 ? (
                                    <p className="text-sm text-stone-500">Aucun utilisateur (Agence ou Client) lié à cette agence.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {agencyUsers.map((u) => (
                                            <li key={u.id} className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-muted/40 border border-border/50">
                                                <div className="min-w-0">
                                                    <span className="font-medium text-stone-800 block truncate">{u.name || u.email}</span>
                                                    {u.email && <span className="text-xs text-stone-500 truncate block">{u.email}</span>}
                                                </div>
                                                <Badge variant="outline" className={cn(
                                                    'shrink-0 text-[10px] px-2 py-0',
                                                    u.role === 'agence' ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-violet-50 text-violet-700 border-violet-200'
                                                )}>
                                                    {u.role === 'agence' ? 'Agence' : 'Client'}
                                                </Badge>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-border/30 bg-card/30 backdrop-blur-sm">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-12 bg-teal-600 hover:bg-teal-700 shadow-teal-500/20 shadow-lg rounded-xl font-bold transition-all active:scale-[0.98]"
                        >
                            {isPending ? 'Enregistrement...' : (agency ? 'Mettre à jour' : 'Créer l\'agence')}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    )
}
