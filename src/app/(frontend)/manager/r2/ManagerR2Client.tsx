'use client'

import { useState, useTransition } from 'react'
import {
  FolderOpen,
  FileImage,
  File,
  ChevronRight,
  Home,
  Loader2,
  ExternalLink,
  HardDrive,
  Trash2,
  LayoutGrid,
  List,
  Search,
} from 'lucide-react'
import Image from 'next/image'
import {
  listR2Objects,
  deleteR2Object,
  listUnusedR2Objects,
  type ListR2Result,
  type R2ObjectItem,
} from '@/actions/manager-actions'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif)$/i

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ManagerR2Client({ initial }: { initial: ListR2Result }) {
  const [result, setResult] = useState(initial)
  const [prefix, setPrefix] = useState<string | undefined>(undefined)
  const [isPending, startTransition] = useTransition()
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [isDeletingMass, setIsDeletingMass] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showingUnused, setShowingUnused] = useState(false)

  const breadcrumbs = prefix ? prefix.split('/').filter(Boolean) : []

  const loadPrefix = (newPrefix: string | undefined) => {
    startTransition(async () => {
      const next = await listR2Objects(newPrefix, 200)
      setResult(next)
      setPrefix(newPrefix)
      setSelectedKeys(new Set())
      setShowingUnused(false)
    })
  }

  const loadUnused = () => {
    startTransition(async () => {
      const next = await listUnusedR2Objects(prefix)
      setResult(next)
      setSelectedKeys(new Set())
      setShowingUnused(true)
    })
  }

  const handleDeleteSelected = () => {
    if (!confirm(`Voulez-vous vraiment supprimer ${selectedKeys.size} élément(s) ?`)) return
    setIsDeletingMass(true)
    startTransition(async () => {
      let deletedCount = 0
      for (const key of selectedKeys) {
        const res = await deleteR2Object(key)
        if (res.success) deletedCount++
      }
      if (deletedCount > 0) {
        toast.success(`${deletedCount} élément(s) supprimé(s)`)
      }
      setSelectedKeys(new Set())
      setIsDeletingMass(false)
      const next = await listR2Objects(prefix, 200)
      setResult(next)
    })
  }

  if (!result.configured) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <HardDrive className="h-7 w-7" />
          Bucket R2
        </h1>
        <Card className="p-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <p className="text-amber-800 dark:text-amber-200">
            R2 n’est pas configuré. Définissez{' '}
            <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">S3_BUCKET</code>,{' '}
            <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">S3_ENDPOINT</code>,{' '}
            <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">S3_ACCESS_KEY_ID</code> et{' '}
            <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">
              S3_SECRET_ACCESS_KEY
            </code>{' '}
            dans les variables d’environnement.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <HardDrive className="h-7 w-7" />
          Bucket R2
        </h1>
        {result.publicBaseUrl && (
          <a
            href={result.publicBaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            {result.publicBaseUrl.replace(/^https?:\/\//, '')}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-1 text-sm">
        <button
          type="button"
          onClick={() => loadPrefix(undefined)}
          disabled={isPending}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          <Home className="h-4 w-4" />
          Racine
        </button>
        {breadcrumbs.map((segment, i) => {
          const path = breadcrumbs.slice(0, i + 1).join('/')
          return (
            <span key={path} className="flex items-center gap-1">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <button
                type="button"
                onClick={() => loadPrefix(path)}
                disabled={isPending}
                className="text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                {segment}
              </button>
            </span>
          )
        })}

        <div className="ml-auto flex items-center gap-2">
          {!showingUnused && (
            <Button
              variant="outline"
              size="sm"
              onClick={loadUnused}
              disabled={isPending}
              className="text-amber-600 border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/20"
            >
              <Search className="h-4 w-4 mr-1" />
              Trouver les fichiers orphelins
            </Button>
          )}
          {showingUnused && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadPrefix(prefix)}
              disabled={isPending}
            >
              Afficher tout
            </Button>
          )}

          <div className="flex bg-muted rounded-md p-0.5 border">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-sm text-muted-foreground',
                viewMode === 'grid' && 'bg-background text-foreground shadow-sm',
              )}
              title="Vue grille"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded-sm text-muted-foreground',
                viewMode === 'list' && 'bg-background text-foreground shadow-sm',
              )}
              title="Vue liste"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isPending && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement…
        </div>
      )}

      {result.objects.length > 0 && (
        <div className="flex items-center gap-4 p-2 bg-muted/30 rounded-lg">
          <label className="flex items-center gap-2 text-sm cursor-pointer font-medium select-none text-foreground ml-2">
            <input
              type="checkbox"
              checked={selectedKeys.size === result.objects.length && result.objects.length > 0}
              ref={(input) => {
                if (input) {
                  input.indeterminate =
                    selectedKeys.size > 0 && selectedKeys.size < result.objects.length
                }
              }}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedKeys(new Set(result.objects.map((o) => o.key)))
                } else {
                  setSelectedKeys(new Set())
                }
              }}
              className="h-4 w-4 rounded border-gray-300 text-primary cursor-pointer accent-primary"
            />
            Tout sélectionner
          </label>
          {selectedKeys.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={isDeletingMass || isPending}
              className="gap-2 h-8 ml-auto"
            >
              {isDeletingMass ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Supprimer ({selectedKeys.size})
            </Button>
          )}
        </div>
      )}

      {viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Folders */}
          {result.prefixes.map((p) => {
            const fullPath = prefix ? `${prefix}/${p}` : p
            const displayName = p
            return (
              <button
                key={fullPath}
                type="button"
                onClick={() => loadPrefix(fullPath)}
                disabled={isPending}
                className={cn(
                  'flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors',
                  'hover:bg-muted/50 hover:border-primary/30 disabled:opacity-50',
                )}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FolderOpen className="h-6 w-6" />
                </div>
                <span className="font-medium truncate">{displayName}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground ml-auto" />
              </button>
            )
          })}

          {/* Files */}
          {result.objects.map((obj) => (
            <R2ObjectCard
              key={obj.key}
              item={obj}
              onDeleted={() => {
                showingUnused ? loadUnused() : loadPrefix(prefix)
              }}
              isSelected={selectedKeys.has(obj.key)}
              onSelect={(checked) => {
                const newKeys = new Set(selectedKeys)
                if (checked) newKeys.add(obj.key)
                else newKeys.delete(obj.key)
                setSelectedKeys(newKeys)
              }}
            />
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted bg-opacity-50 text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-4 py-3 w-8"></th>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Taille</th>
                <th className="px-4 py-3">Date de modification</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {result.prefixes.map((p) => {
                const fullPath = prefix ? `${prefix}/${p}` : p
                return (
                  <tr key={fullPath} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">
                      <FolderOpen className="h-5 w-5" />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => loadPrefix(fullPath)}
                        disabled={isPending}
                        className="font-medium text-foreground hover:text-primary transition-colors text-left"
                      >
                        {p}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">—</td>
                    <td className="px-4 py-3 text-muted-foreground">—</td>
                    <td className="px-4 py-3"></td>
                  </tr>
                )
              })}
              {result.objects.map((obj) => (
                <R2ObjectListRow
                  key={obj.key}
                  item={obj}
                  onDeleted={() => {
                    showingUnused ? loadUnused() : loadPrefix(prefix)
                  }}
                  isSelected={selectedKeys.has(obj.key)}
                  onSelect={(checked) => {
                    const newKeys = new Set(selectedKeys)
                    if (checked) newKeys.add(obj.key)
                    else newKeys.delete(obj.key)
                    setSelectedKeys(newKeys)
                  }}
                />
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {!isPending && result.prefixes.length === 0 && result.objects.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">Ce dossier est vide.</Card>
      )}
    </div>
  )
}

function R2ObjectCard({
  item,
  onDeleted,
  isSelected,
  onSelect,
}: {
  item: R2ObjectItem
  onDeleted: () => void
  isSelected?: boolean
  onSelect?: (checked: boolean) => void
}) {
  const [isDeleting, startTransition] = useTransition()
  const name = item.key.split('/').pop() ?? item.key
  const isImage = IMAGE_EXT.test(name)

  const handleDelete = () => {
    if (!confirm(`Voulez-vous vraiment supprimer "${name}" ?`)) return
    startTransition(async () => {
      const res = await deleteR2Object(item.key)
      if (res.success) {
        toast.success('Fichier supprimé')
        onDeleted()
      } else {
        toast.error(res.error || 'Erreur lors de la suppression')
      }
    })
  }

  return (
    <Card
      className={cn(
        'overflow-hidden relative group transition-colors',
        isSelected && 'border-primary ring-1 ring-primary/20',
        isDeleting && 'opacity-50 pointer-events-none',
      )}
    >
      {onSelect && (
        <div className="absolute top-2 left-2 z-10 transition-opacity">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="h-5 w-5 bg-white cursor-pointer rounded border-gray-300 text-primary shadow-sm focus:ring-primary accent-primary"
          />
        </div>
      )}
      <div className="aspect-square bg-muted/30 relative">
        {isImage && item.publicUrl ? (
          <a
            href={item.publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block size-full"
          >
            <Image
              src={item.publicUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 300px"
            />
          </a>
        ) : (
          <div className="size-full flex items-center justify-center text-muted-foreground">
            {isImage ? <FileImage className="h-12 w-12" /> : <File className="h-12 w-12" />}
          </div>
        )}
      </div>
      <div className="p-3 space-y-1">
        <p className="text-sm font-medium truncate" title={item.key}>
          {name}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatSize(item.size)} · {formatDate(item.lastModified)}
        </p>
        <div className="flex items-center justify-between mt-2 pt-2 border-t text-muted-foreground">
          {item.publicUrl ? (
            <a
              href={item.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Ouvrir <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span />
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Supprimer"
          >
            {isDeleting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}

function R2ObjectListRow({
  item,
  onDeleted,
  isSelected,
  onSelect,
}: {
  item: R2ObjectItem
  onDeleted: () => void
  isSelected?: boolean
  onSelect?: (checked: boolean) => void
}) {
  const [isDeleting, startTransition] = useTransition()
  const name = item.key.split('/').pop() ?? item.key
  const isImage = IMAGE_EXT.test(name)

  const handleDelete = () => {
    if (!confirm(`Voulez-vous vraiment supprimer "${name}" ?`)) return
    startTransition(async () => {
      const res = await deleteR2Object(item.key)
      if (res.success) {
        toast.success('Fichier supprimé')
        onDeleted()
      } else {
        toast.error(res.error || 'Erreur lors de la suppression')
      }
    })
  }

  return (
    <tr className={cn('hover:bg-muted/30 transition-colors', isSelected && 'bg-primary/5')}>
      <td className="px-4 py-3">
        {onSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            disabled={isDeleting}
            onChange={(e) => onSelect(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-gray-300 text-primary focus:ring-primary accent-primary"
          />
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 bg-muted rounded flex items-center justify-center relative overflow-hidden">
            {isImage && item.publicUrl ? (
              <Image src={item.publicUrl} alt={name} fill className="object-cover" sizes="40px" />
            ) : isImage ? (
              <FileImage className="h-5 w-5 text-muted-foreground" />
            ) : (
              <File className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <span className="font-medium truncate max-w-[200px] md:max-w-xs block" title={item.key}>
            {name}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{formatSize(item.size)}</td>
      <td className="px-4 py-3 text-muted-foreground">{formatDate(item.lastModified)}</td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          {item.publicUrl && (
            <a
              href={item.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
              title="Ouvrir"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Supprimer"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </td>
    </tr>
  )
}
