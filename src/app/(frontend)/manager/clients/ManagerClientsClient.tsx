'use client'

import { useState, useTransition, useCallback } from 'react'
import {
  Search, Plus, User as UserIcon, Building2, Mail,
  Calendar, Shield, CreditCard, Trash2, Edit2, X,
  ExternalLink, ArrowUpDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { getAllUsers, createUser, updateUser, deleteUser, type UsersResult } from '@/actions/manager-actions'
import type { User, Agency } from '@/payload-types'

const roleConfig: Record<string, { label: string; className: string }> = {
  admin: { label: 'Admin', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  agence: { label: 'Agence', className: 'bg-violet-50 text-violet-700 border-violet-200' },
  client: { label: 'Client', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  user: { label: 'User', className: 'bg-stone-50 text-stone-600 border-stone-200' },
}

function RoleBadge({ role }: { role?: string | null }) {
  const config = roleConfig[role ?? 'user'] ?? roleConfig.user
  return (
    <Badge variant="outline" className={cn('font-medium shadow-none border px-2', config.className)}>
      {config.label}
    </Badge>
  )
}

export function ManagerClientsClient({ initialData, agencies }: { initialData: UsersResult; agencies: Agency[] }) {
  const [data, setData] = useState(initialData)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [deleteConfirm, setDeleteConfirm] = useState<number | string | null>(null)

  const refreshData = useCallback((searchQ?: string) => {
    startTransition(async () => {
      const q = searchQ ?? search
      const result = await getAllUsers({ search: q.trim() || undefined, limit: 50 })
      setData(result)
    })
  }, [search])

  const handleSearch = (value: string) => {
    setSearch(value)
    refreshData(value)
  }

  const handleCreateUser = () => {
    setSelectedUser(null)
    setIsSheetOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsSheetOpen(true)
  }

  const handleDelete = (id: number | string) => {
    startTransition(async () => {
      const result = await deleteUser(id)
      if (result.success) {
        setDeleteConfirm(null)
        if (selectedUser?.id === id) {
          setIsSheetOpen(false)
          setSelectedUser(null)
        }
        refreshData()
      }
    })
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center bg-card/50 backdrop-blur-md p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par email, nom, société..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-background/50 border-border/50 focus-visible:ring-teal-500/30"
          />
        </div>

        <Button onClick={handleCreateUser} className="gap-2 bg-teal-600 hover:bg-teal-700 shadow-teal-500/20 shadow-lg rounded-xl h-11 px-6 transition-all active:scale-[0.98]">
          <Plus size={18} />
          Nouveau Client
        </Button>
      </div>

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
                <TableHead>Client</TableHead>
                <TableHead>Société</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Agence</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Usage</TableHead>
                <TableHead>Inscrit le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.docs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-50">
                      <UserIcon size={48} className="text-muted-foreground" />
                      <p className="text-muted-foreground font-medium">Aucun client trouvé.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.docs.map((user: User) => (
                  <TableRow key={user.id} className="group cursor-pointer hover:bg-muted/30 transition-colors border-border/50" onClick={() => handleEditUser(user)}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs ring-2 ring-background">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-stone-800 truncate">{user.name || 'Sans Nom'}</span>
                          <span className="text-xs text-stone-400 truncate">{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-stone-600">
                        <Building2 size={14} className="text-stone-300" />
                        <span className="truncate">{user.company ?? '—'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-stone-600 truncate block max-w-[140px]">
                        {typeof user.agency === 'object' && user.agency?.name ? user.agency.name : user.agency ? String(user.agency) : '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "font-medium shadow-none border px-2 uppercase text-[10px]",
                        (user.plan as string) === 'starter' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          (user.plan as string) === 'pro' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-stone-100/50 text-stone-500 border-stone-200"
                      )}>
                        {user.plan || 'Free'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-stone-700">{user.cardsCreated ?? 0}</span>
                        <span className="text-[10px] text-stone-400 font-medium tracking-tight uppercase">Cartes</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-stone-400 text-xs font-medium uppercase min-w-[120px]">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-400 hover:text-teal-600 transition-colors rounded-full" onClick={() => handleEditUser(user)}>
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-stone-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-full"
                          onClick={() => setDeleteConfirm(user.id)}
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
          {data.totalDocs} client{data.totalDocs !== 1 ? 's' : ''} au total
        </p>
      </div>

      {/* User Sheet (Create/Edit) */}
      <UserSheet
        user={selectedUser}
        agencies={agencies}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onRefresh={() => refreshData()}
      />

      {/* Delete confirmation */}
      <Dialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Supprimer le client</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. L&apos;utilisateur et toutes ses données seront définitivement supprimés.
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

function UserSheet({ user, agencies, isOpen, onClose, onRefresh }: {
  user: User | null
  agencies: Agency[]
  isOpen: boolean
  onClose: () => void
  onRefresh: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const agencyId = user?.agency
    ? (typeof user.agency === 'object' ? (user.agency as Agency)?.id : user.agency)
    : ''

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    startTransition(async () => {
      const result = user
        ? await updateUser(user.id, data)
        : await createUser(data)

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
                {user ? 'Modifier le client' : 'Nouveau client'}
              </SheetTitle>
              <SheetDescription className="text-xs uppercase tracking-widest font-medium opacity-70">
                {user ? `ID: ${user.id}` : 'Remplissez les informations'}
              </SheetDescription>
            </div>
            {user && (
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
                {(user.name || user.email).charAt(0).toUpperCase()}
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
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Informations de base</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-tight text-stone-500">Nom Complet</label>
                  <Input name="name" defaultValue={user?.name || ''} placeholder="Ex: Jean Dupont" className="bg-background/50 border-border/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-tight text-stone-500">Société</label>
                  <Input name="company" defaultValue={user?.company || ''} placeholder="Ex: Acme Corp" className="bg-background/50 border-border/50" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-tight text-stone-500">Adresse Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-stone-300" />
                  <Input name="email" type="email" required defaultValue={user?.email || ''} placeholder="jean@exemple.com" className="pl-10 bg-background/50 border-border/50" />
                </div>
              </div>

              {!user && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-tight text-stone-500">Mot de passe</label>
                  <Input name="password" type="password" required={!user} placeholder="Minimum 8 caractères" className="bg-background/50 border-border/50" />
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t border-border/30">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">Configuration du compte</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-tight text-stone-500">Rôle</label>
                  <select
                    name="role"
                    defaultValue={user?.role || 'user'}
                    className="flex h-11 w-full rounded-md border border-border/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500/30 ring-offset-background"
                  >
                    <option value="admin">Admin</option>
                    <option value="agence">Agence</option>
                    <option value="client">Client</option>
                    <option value="user">User</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-tight text-stone-500">Forfait</label>
                  <select
                    name="plan"
                    defaultValue={user?.plan || 'free'}
                    className="flex h-11 w-full rounded-md border border-border/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500/30 ring-offset-background"
                  >
                    <option value="free">Free</option>
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                  </select>
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-tight text-stone-500">Agence (pour rôle Client ou Agence)</label>
                  <select
                    name="agency"
                    defaultValue={agencyId}
                    className="flex h-11 w-full rounded-md border border-border/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500/30 ring-offset-background"
                  >
                    <option value="">Aucune agence</option>
                    {agencies.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                        {a.code ? ` (${a.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {user && (
              <div className="p-4 bg-muted/30 rounded-xl border border-border/30 mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-tight mb-1">Inscrit le</p>
                  <p className="text-sm font-semibold text-stone-700">{new Date(user.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-tight mb-1">Total Cartes</p>
                  <p className="text-sm font-semibold text-stone-700">{user.cardsCreated || 0}</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-border/30 bg-card/30 backdrop-blur-sm">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 bg-teal-600 hover:bg-teal-700 shadow-teal-500/20 shadow-lg rounded-xl font-bold transition-all active:scale-[0.98]"
            >
              {isPending ? 'Enregistrement...' : (user ? 'Mettre à jour' : 'Créer le client')}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
