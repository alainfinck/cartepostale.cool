'use client'

import React, { useState, useCallback, useRef, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash2,
  Eye,
  Map as MapIcon,
  Image as ImageIcon,
  FolderPlus,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Upload,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  Home,
  Grid3X3,
  Move,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  deleteAgencyGalleryItem,
  createGalleryCategory,
  deleteGalleryCategory,
  moveGalleryItem,
} from '@/actions/galerie-actions'
import type { Gallery, GalleryCategory } from '@/payload-types'
import { toast } from 'sonner'

// ─── Config ───────────────────────────────────────────────────────────────────

const CDN_BASE = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL || 'https://img.cartepostale.cool'

/** Build a Cloudflare Image Resizing URL */
function cfUrl(src: string, width = 400, quality = 80): string {
  if (!src) return src
  // If already an absolute URL from our CDN, apply CF transforms
  if (src.startsWith('http')) {
    // Use Cloudflare Image Resizing: /cdn-cgi/image/w=...,q=.../original-url
    const origin = new URL(src).origin
    const pathname = new URL(src).pathname
    return `${origin}/cdn-cgi/image/width=${width},quality=${quality},format=auto${pathname}`
  }
  return src
}

// ─── Client-side resize to 2K max ─────────────────────────────────────────────

async function resizeImageToMax2K(file: File): Promise<File> {
  const MAX = 2000
  return new Promise((resolve) => {
    const img = document.createElement('img')
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const { width, height } = img
      if (width <= MAX && height <= MAX) {
        resolve(file)
        return
      }
      const ratio = Math.min(MAX / width, MAX / height)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file)
            return
          }
          resolve(new File([blob], file.name, { type: 'image/jpeg' }))
        },
        'image/jpeg',
        0.88,
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(file)
    }
    img.src = url
  })
}

// ─── Upload via Payload presigned URL → R2 direct ─────────────────────────────

async function uploadFileViaPayload(
  file: File,
  categoryId?: number | null,
): Promise<{ success: boolean; doc?: any; error?: string }> {
  try {
    // 1. Create media doc + get presigned URL from Payload
    const initRes = await fetch('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        filename: file.name,
        mimeType: file.type || 'image/jpeg',
        alt: file.name.replace(/\.[^.]+$/, ''),
        prefix: 'gallery',
      }),
    })

    if (!initRes.ok) {
      const errText = await initRes.text()
      return { success: false, error: `Payload init error: ${initRes.status} ${errText}` }
    }

    const initData = await initRes.json()
    // Payload with clientUploads returns {doc, signedURL} or {doc} depending on version
    const signedURL: string | undefined = initData.signedURL || initData.doc?.signedURL
    const mediaDoc = initData.doc || initData

    if (signedURL) {
      // 2. PUT directly to R2
      const putRes = await fetch(signedURL, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'image/jpeg' },
      })
      if (!putRes.ok) {
        return { success: false, error: `R2 upload error: ${putRes.status}` }
      }
    } else {
      // Fallback: send file via multipart to Payload (pre-signed not enabled or dev mode)
      const fd = new FormData()
      fd.append('file', file)
      fd.append('alt', file.name.replace(/\.[^.]+$/, ''))
      fd.append(
        '_payload',
        JSON.stringify({ alt: file.name.replace(/\.[^.]+$/, ''), prefix: 'gallery' }),
      )
      const uploadRes = await fetch(`/api/media/${mediaDoc.id}`, {
        method: 'PATCH',
        body: fd,
        credentials: 'include',
      })
      if (!uploadRes.ok) {
        return { success: false, error: `Upload error: ${uploadRes.status}` }
      }
    }

    // 3. Create gallery item linked to the media doc
    const galleryRes = await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title: file.name.replace(/\.[^.]+$/, ''),
        image: mediaDoc.id,
        ...(categoryId ? { category: categoryId } : {}),
        views: 0,
        usages: 0,
      }),
    })
    if (!galleryRes.ok) {
      return { success: false, error: `Gallery create error: ${galleryRes.status}` }
    }
    const galleryData = await galleryRes.json()
    return { success: true, doc: galleryData.doc || galleryData }
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur réseau' }
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryNode extends GalleryCategory {
  children: CategoryNode[]
}

interface Props {
  initialItems: Gallery[]
  categories: GalleryCategory[]
  tags: any[]
}

function buildTree(categories: GalleryCategory[]): CategoryNode[] {
  const nodeMap = new Map<number, CategoryNode>()
  categories.forEach((c) => nodeMap.set(c.id, { ...c, children: [] }))
  const roots: CategoryNode[] = []
  categories.forEach((c) => {
    const parentId =
      typeof c.parent === 'object' && c.parent ? c.parent.id : (c.parent as number | null)
    if (parentId && nodeMap.has(parentId)) {
      nodeMap.get(parentId)!.children.push(nodeMap.get(c.id)!)
    } else {
      roots.push(nodeMap.get(c.id)!)
    }
  })
  return roots
}

// ─── CategoryTreeItem ─────────────────────────────────────────────────────────

function CategoryTreeItem({
  node,
  selectedId,
  onSelect,
  depth = 0,
  photoCounts,
  onDropItem,
  draggingItemId,
}: {
  node: CategoryNode
  selectedId: number | 'root' | null
  onSelect: (id: number) => void
  depth?: number
  photoCounts: Record<number, number>
  onDropItem: (itemId: number, targetCategoryId: number | null) => void
  draggingItemId: number | null
}) {
  const [expanded, setExpanded] = useState(true)
  const [isDragOver, setIsDragOver] = useState(false)
  const hasChildren = node.children.length > 0
  const isSelected = selectedId === node.id
  const count = photoCounts[node.id] ?? 0

  return (
    <div>
      <div
        className={`group flex items-center gap-1.5 rounded-lg px-2 py-1.5 cursor-pointer transition-all select-none ${
          isDragOver && draggingItemId !== null
            ? 'bg-teal-100 border border-teal-400 ring-2 ring-teal-300'
            : isSelected
              ? 'bg-teal-600 text-white'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => onSelect(node.id)}
        onDragOver={(e) => {
          if (draggingItemId !== null) {
            e.preventDefault()
            setIsDragOver(true)
          }
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragOver(false)
          if (draggingItemId !== null) onDropItem(draggingItemId, node.id)
        }}
      >
        {hasChildren ? (
          <button
            className="p-0.5 rounded hover:bg-black/10 shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}
        {isSelected ? (
          <FolderOpen size={14} className="shrink-0" />
        ) : (
          <Folder size={14} className="shrink-0" />
        )}
        <span className="flex-1 text-xs font-medium truncate">{node.name}</span>
        {count > 0 && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
              isSelected ? 'bg-white/20' : 'bg-muted text-muted-foreground'
            }`}
          >
            {count}
          </span>
        )}
      </div>
      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <CategoryTreeItem
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
              photoCounts={photoCounts}
              onDropItem={onDropItem}
              draggingItemId={draggingItemId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Upload Progress Modal ─────────────────────────────────────────────────────

function UploadModal({
  isOpen,
  current,
  total,
  progress,
  status,
  message,
}: {
  isOpen: boolean
  current: number
  total: number
  progress: number
  status: 'idle' | 'success' | 'error'
  message: string
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="upload-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            className="bg-card border border-border rounded-2xl p-8 w-80 shadow-2xl"
          >
            <div className="flex flex-col items-center text-center gap-5">
              {status === 'idle' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 size={38} className="text-teal-600" />
                </motion.div>
              )}
              {status === 'success' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <CheckCircle2 size={38} className="text-emerald-500" />
                </motion.div>
              )}
              {status === 'error' && <XCircle size={38} className="text-red-500" />}

              <div>
                <p className="font-bold text-foreground text-base">
                  {status === 'idle' && `Upload ${current}/${total}…`}
                  {status === 'success' && '✓ Upload terminé !'}
                  {status === 'error' && 'Erreur'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{message}</p>
              </div>

              {status === 'idle' && (
                <div className="w-full space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Redim. + envoi R2</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Create Category Modal ────────────────────────────────────────────────────

function CreateCategoryModal({
  open,
  onClose,
  parentId,
  parentName,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  parentId: number | null
  parentName: string | null
  onCreated: (category: GalleryCategory) => void
}) {
  const [name, setName] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    startTransition(async () => {
      const res = await createGalleryCategory({
        name: name.trim(),
        parentId: parentId || undefined,
      })
      if (res.success && res.doc) {
        toast.success(`Album "${name}" créé`)
        onCreated(res.doc as GalleryCategory)
        setName('')
        onClose()
      } else {
        toast.error(res.error || 'Erreur')
      }
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-base">Nouvel album</h2>
            {parentId && parentName && (
              <p className="text-xs text-muted-foreground mt-0.5">
                sous-album de <span className="font-semibold text-foreground">{parentName}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
          >
            <X size={15} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Nom de l'album…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1 text-sm" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isPending}
              className="flex-1 text-sm bg-teal-600 hover:bg-teal-700"
            >
              {isPending ? <Loader2 size={13} className="animate-spin" /> : 'Créer'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ─── Move Modal ───────────────────────────────────────────────────────────────

function MoveModal({
  item,
  categories,
  onClose,
  onMoved,
}: {
  item: Gallery
  categories: GalleryCategory[]
  onClose: () => void
  onMoved: (itemId: number, newCategoryId: number | null) => void
}) {
  const [isPending, startTransition] = useTransition()
  const tree = buildTree(categories)

  const currentCategoryId =
    typeof item.category === 'object' && item.category
      ? item.category.id
      : (item.category as number | null)

  const doMove = (targetId: number | null) => {
    startTransition(async () => {
      const res = await moveGalleryItem(item.id, targetId)
      if (res.success) {
        toast.success('Image déplacée')
        onMoved(item.id, targetId)
        onClose()
      } else {
        toast.error(res.error || 'Erreur')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl p-5 w-full max-w-sm shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-sm">Déplacer vers…</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
          >
            <X size={14} />
          </button>
        </div>

        <div className="space-y-1 max-h-60 overflow-y-auto">
          {/* Root option */}
          <button
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
              currentCategoryId === null
                ? 'bg-teal-50 text-teal-700 font-semibold'
                : 'hover:bg-muted'
            }`}
            onClick={() => doMove(null)}
            disabled={isPending}
          >
            <Home size={13} />
            Sans catégorie (racine)
            {currentCategoryId === null && (
              <span className="ml-auto text-[10px] text-teal-600">actuel</span>
            )}
          </button>

          <MoveTreeItem
            nodes={tree}
            currentId={currentCategoryId}
            onSelect={doMove}
            depth={0}
            isPending={isPending}
          />
        </div>
      </motion.div>
    </div>
  )
}

function MoveTreeItem({
  nodes,
  currentId,
  onSelect,
  depth,
  isPending,
}: {
  nodes: CategoryNode[]
  currentId: number | null
  onSelect: (id: number) => void
  depth: number
  isPending: boolean
}) {
  return (
    <>
      {nodes.map((node) => (
        <React.Fragment key={node.id}>
          <button
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
              currentId === node.id ? 'bg-teal-50 text-teal-700 font-semibold' : 'hover:bg-muted'
            }`}
            style={{ paddingLeft: `${12 + depth * 16}px` }}
            onClick={() => onSelect(node.id)}
            disabled={isPending}
          >
            <Folder size={12} className="shrink-0" />
            <span className="truncate">{node.name}</span>
            {currentId === node.id && (
              <span className="ml-auto text-[10px] text-teal-600">actuel</span>
            )}
          </button>
          {node.children.length > 0 && (
            <MoveTreeItem
              nodes={node.children}
              currentId={currentId}
              onSelect={onSelect}
              depth={depth + 1}
              isPending={isPending}
            />
          )}
        </React.Fragment>
      ))}
    </>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GalerieClient({ initialItems, categories: initialCategories }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [items, setItems] = useState(initialItems)
  const [categories, setCategories] = useState(initialCategories)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'root' | null>(null)

  // Upload state
  const [isUploading, setIsUploading] = useState(false)
  const [uploadCurrent, setUploadCurrent] = useState(0)
  const [uploadTotal, setUploadTotal] = useState(0)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [uploadMessage, setUploadMessage] = useState('')

  // Drag & drop
  const [isDragging, setIsDragging] = useState(false)
  const [draggingItemId, setDraggingItemId] = useState<number | null>(null)
  const dragCounter = useRef(0)

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createModalParentId, setCreateModalParentId] = useState<number | null>(null)
  const [moveItem, setMoveItem] = useState<Gallery | null>(null)

  // ── Derived data ─────────────────────────────────────────────────────────

  const tree = buildTree(categories)

  const photoCounts = React.useMemo(() => {
    const counts: Record<number, number> = {}
    items.forEach((item) => {
      const catId =
        typeof item.category === 'object' && item.category
          ? item.category.id
          : (item.category as number | null)
      if (catId) counts[catId] = (counts[catId] || 0) + 1
    })
    return counts
  }, [items])

  const filteredItems = React.useMemo(() => {
    if (selectedCategoryId === null) return items
    if (selectedCategoryId === 'root') {
      return items.filter((item) => {
        const catId =
          typeof item.category === 'object' && item.category
            ? item.category.id
            : (item.category as number | null)
        return !catId
      })
    }
    return items.filter((item) => {
      const catId =
        typeof item.category === 'object' && item.category
          ? item.category.id
          : (item.category as number | null)
      return catId === selectedCategoryId
    })
  }, [items, selectedCategoryId])

  const selectedCategory = React.useMemo(
    () =>
      selectedCategoryId && selectedCategoryId !== 'root'
        ? categories.find((c) => c.id === selectedCategoryId) || null
        : null,
    [categories, selectedCategoryId],
  )

  const breadcrumb = React.useMemo(() => {
    if (!selectedCategoryId || selectedCategoryId === 'root') return []
    const path: GalleryCategory[] = []
    let current = selectedCategory
    while (current) {
      path.unshift(current)
      const parentId =
        typeof current.parent === 'object' && current.parent
          ? current.parent.id
          : (current.parent as number | null)
      current = parentId ? categories.find((c) => c.id === parentId) || null : null
    }
    return path
  }, [selectedCategory, categories])

  const currentCategoryName =
    selectedCategoryId === 'root' ? 'Sans catégorie' : selectedCategory?.name || 'Toute la galerie'
  const totalPhotos = items.length
  const uncategorizedCount = items.filter((item) => {
    const catId =
      typeof item.category === 'object' && item.category
        ? item.category.id
        : (item.category as number | null)
    return !catId
  }).length

  // ── File drag zone (file upload via drag from OS) ────────────────────────

  const handleFileDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
    if (e.dataTransfer.types.includes('Files')) setIsDragging(true)
  }, [])

  const handleFileDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragging(false)
  }, [])

  const handleFileDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleFileDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      dragCounter.current = 0
      setIsDragging(false)
      const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
      if (files.length === 0) {
        toast.error('Aucune image valide')
        return
      }
      await uploadFiles(files)
    },
    [selectedCategoryId],
  )

  // ── Upload orchestration ─────────────────────────────────────────────────

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true)
    setUploadTotal(files.length)
    setUploadCurrent(0)
    setUploadProgress(0)
    setUploadStatus('idle')
    setUploadMessage('Redimensionnement en cours…')

    const categoryId =
      selectedCategoryId && selectedCategoryId !== 'root' ? (selectedCategoryId as number) : null
    const uploadedDocs: any[] = []
    let errorCount = 0

    for (let i = 0; i < files.length; i++) {
      setUploadCurrent(i + 1)
      setUploadMessage(`Image ${i + 1}/${files.length} — redim. 2K…`)
      setUploadProgress(Math.round((i / files.length) * 50))

      const resized = await resizeImageToMax2K(files[i])

      setUploadMessage(`Image ${i + 1}/${files.length} — envoi R2…`)

      const res = await uploadFileViaPayload(resized, categoryId)
      setUploadProgress(Math.round(((i + 1) / files.length) * 100))

      if (res.success && res.doc) {
        uploadedDocs.push(res.doc)
      } else {
        errorCount++
        console.error('Upload error for', files[i].name, res.error)
      }
    }

    if (errorCount === 0) {
      setUploadStatus('success')
      setUploadMessage(
        `${uploadedDocs.length} photo${uploadedDocs.length > 1 ? 's' : ''} ajoutée${uploadedDocs.length > 1 ? 's' : ''} !`,
      )
    } else {
      setUploadStatus(errorCount === files.length ? 'error' : 'success')
      setUploadMessage(
        `${uploadedDocs.length} réussi${errorCount > 0 ? `, ${errorCount} erreur${errorCount > 1 ? 's' : ''}` : ''}`,
      )
    }

    setTimeout(() => {
      setIsUploading(false)
      setUploadStatus('idle')
      router.refresh()
    }, 2000)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'))
    if (files.length > 0) uploadFiles(files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Item actions ─────────────────────────────────────────────────────────

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Supprimer cette image ?')) return
    const prev = [...items]
    setItems(items.filter((i) => i.id !== id))
    const res = await deleteAgencyGalleryItem(id)
    if (res.success) {
      toast.success('Image supprimée')
    } else {
      setItems(prev)
      toast.error(res.error || 'Erreur')
    }
  }

  const handleDeleteCategory = async (id: number, name: string) => {
    if (!confirm(`Supprimer l'album "${name}" ? Les photos resteront dans la galerie.`)) return
    const res = await deleteGalleryCategory(id)
    if (res.success) {
      toast.success(`Album "${name}" supprimé`)
      setCategories((prev) => prev.filter((c) => c.id !== id))
      if (selectedCategoryId === id) setSelectedCategoryId(null)
    } else {
      toast.error(res.error || 'Erreur')
    }
  }

  // Drag item to category in sidebar
  const handleDropItemToCategory = async (itemId: number, targetCategoryId: number | null) => {
    const currentItem = items.find((i) => i.id === itemId)
    if (!currentItem) return
    const currentCatId =
      typeof currentItem.category === 'object' && currentItem.category
        ? currentItem.category.id
        : (currentItem.category as number | null)
    if (currentCatId === targetCategoryId) return

    // Optimistic update
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              category: targetCategoryId
                ? ((categories.find((c) => c.id === targetCategoryId) as any) ?? targetCategoryId)
                : null,
            }
          : i,
      ),
    )

    const res = await moveGalleryItem(itemId, targetCategoryId)
    if (res.success) {
      toast.success('Image déplacée')
    } else {
      toast.error(res.error || 'Erreur')
      router.refresh()
    }
    setDraggingItemId(null)
  }

  const handleMoved = (itemId: number, newCategoryId: number | null) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              category: newCategoryId
                ? ((categories.find((c) => c.id === newCategoryId) as any) ?? newCategoryId)
                : null,
            }
          : i,
      ),
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <CreateCategoryModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        parentId={createModalParentId}
        parentName={
          createModalParentId
            ? categories.find((c) => c.id === createModalParentId)?.name || null
            : null
        }
        onCreated={(cat) => setCategories((prev) => [...prev, cat])}
      />

      {moveItem && (
        <MoveModal
          item={moveItem}
          categories={categories}
          onClose={() => setMoveItem(null)}
          onMoved={handleMoved}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      <UploadModal
        isOpen={isUploading}
        current={uploadCurrent}
        total={uploadTotal}
        progress={uploadProgress}
        status={uploadStatus}
        message={uploadMessage}
      />

      <div className="flex gap-5 h-[calc(100vh-180px)] min-h-[500px]">
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside className="w-52 shrink-0 flex flex-col gap-2 overflow-y-auto">
          {/* All / root */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div
              className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors text-sm font-medium ${
                selectedCategoryId === null
                  ? 'bg-teal-600 text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
              onClick={() => setSelectedCategoryId(null)}
              onDragOver={(e) => {
                if (draggingItemId !== null) e.preventDefault()
              }}
              onDrop={(e) => {
                e.preventDefault()
                if (draggingItemId !== null) handleDropItemToCategory(draggingItemId, null)
              }}
            >
              <Grid3X3 size={13} className="shrink-0" />
              <span className="flex-1 truncate text-xs">Toute la galerie</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${selectedCategoryId === null ? 'bg-white/20' : 'bg-muted text-muted-foreground'}`}
              >
                {totalPhotos}
              </span>
            </div>

            <div
              className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors text-sm font-medium border-t border-border ${
                selectedCategoryId === 'root'
                  ? 'bg-teal-600 text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              } ${draggingItemId !== null ? 'hover:ring-2 hover:ring-teal-300' : ''}`}
              onClick={() => setSelectedCategoryId('root')}
              onDragOver={(e) => {
                if (draggingItemId !== null) e.preventDefault()
              }}
              onDrop={(e) => {
                e.preventDefault()
                if (draggingItemId !== null) handleDropItemToCategory(draggingItemId, null)
              }}
            >
              <Home size={13} className="shrink-0" />
              <span className="flex-1 truncate text-xs">Sans catégorie</span>
              {uncategorizedCount > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${selectedCategoryId === 'root' ? 'bg-white/20' : 'bg-amber-100 text-amber-700'}`}
                >
                  {uncategorizedCount}
                </span>
              )}
            </div>
          </div>

          {/* Tree */}
          {tree.length > 0 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden py-1">
              {tree.map((node) => (
                <CategoryTreeItem
                  key={node.id}
                  node={node}
                  selectedId={selectedCategoryId}
                  onSelect={setSelectedCategoryId}
                  photoCounts={photoCounts}
                  onDropItem={handleDropItemToCategory}
                  draggingItemId={draggingItemId}
                />
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-1.5">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-xs"
              onClick={() => {
                // If an album is selected, create sub-album; else create root album
                setCreateModalParentId(
                  selectedCategoryId && selectedCategoryId !== 'root'
                    ? (selectedCategoryId as number)
                    : null,
                )
                setShowCreateModal(true)
              }}
            >
              <FolderPlus size={13} />
              {selectedCategoryId && selectedCategoryId !== 'root'
                ? 'Sous-album ici'
                : 'Nouvel album'}
            </Button>

            {selectedCategoryId !== null && selectedCategoryId !== 'root' && (
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-xs text-red-600 hover:text-red-700 hover:border-red-200"
                onClick={() =>
                  handleDeleteCategory(selectedCategoryId as number, selectedCategory?.name || '')
                }
              >
                <Trash2 size={13} />
                Supprimer l&apos;album
              </Button>
            )}
          </div>
        </aside>

        {/* ── Main panel ──────────────────────────────────────────────────── */}
        <div
          className="flex-1 flex flex-col gap-3 min-w-0"
          onDragEnter={handleFileDragEnter}
          onDragLeave={handleFileDragLeave}
          onDragOver={handleFileDragOver}
          onDrop={handleFileDrop}
        >
          {/* Header + breadcrumb */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-sm min-w-0">
              <button
                onClick={() => setSelectedCategoryId(null)}
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0 text-xs"
              >
                Galerie
              </button>
              {selectedCategoryId === 'root' && (
                <>
                  <ChevronRight size={11} className="text-muted-foreground shrink-0" />
                  <span className="font-semibold text-foreground text-xs">Sans catégorie</span>
                </>
              )}
              {breadcrumb.map((cat, i) => (
                <React.Fragment key={cat.id}>
                  <ChevronRight size={11} className="text-muted-foreground shrink-0" />
                  <button
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`text-xs ${i === breadcrumb.length - 1 ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'} truncate`}
                  >
                    {cat.name}
                  </button>
                </React.Fragment>
              ))}
            </div>

            <Button
              size="sm"
              className="shrink-0 gap-1.5 text-xs bg-teal-600 hover:bg-teal-700"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={12} />
              Uploader
            </Button>
          </div>

          {/* Drop zone / grid */}
          <div className="relative flex-1 min-h-0 overflow-y-auto rounded-xl">
            {/* File drag overlay */}
            <AnimatePresence>
              {isDragging && (
                <motion.div
                  key="drag-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-teal-600/15 border-2 border-dashed border-teal-500 pointer-events-none"
                >
                  <motion.div
                    animate={{ scale: [1, 1.08, 1], y: [0, -5, 0] }}
                    transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
                    className="p-5 bg-teal-600 rounded-2xl shadow-xl mb-3"
                  >
                    <Upload size={28} className="text-white" />
                  </motion.div>
                  <p className="text-base font-bold text-teal-700">Déposer les photos ici</p>
                  <p className="text-sm text-teal-600 mt-1">
                    → <strong>{currentCategoryName}</strong> · redim. 2K auto
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {filteredItems.length === 0 ? (
              <div
                className="h-full min-h-[300px] flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 cursor-pointer hover:border-teal-400 hover:bg-teal-50/20 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="p-4 rounded-2xl bg-muted mb-3"
                >
                  <Upload size={26} className="text-muted-foreground" />
                </motion.div>
                <p className="font-semibold text-foreground text-sm">Glissez des photos ici</p>
                <p className="text-xs text-muted-foreground mt-1">ou cliquez pour choisir</p>
                <p className="text-[10px] text-muted-foreground/60 mt-2">
                  JPG, PNG, WebP, HEIC · Redimensionnement 2K automatique · Envoi direct R2
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pb-4">
                {/* Add tile */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="aspect-square rounded-xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="p-2 rounded-xl bg-muted">
                    <Plus size={16} className="text-muted-foreground" />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">Ajouter</span>
                </motion.div>

                {/* Sub-album tiles */}
                {selectedCategoryId !== null &&
                  selectedCategoryId !== 'root' &&
                  categories
                    .filter((c) => {
                      const pid =
                        typeof c.parent === 'object' && c.parent
                          ? c.parent.id
                          : (c.parent as number | null)
                      return pid === selectedCategoryId
                    })
                    .map((subcat) => (
                      <motion.div
                        key={`sub-${subcat.id}`}
                        whileHover={{ scale: 1.02 }}
                        className="aspect-square rounded-xl border border-border bg-card flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-teal-400 hover:shadow-md transition-all"
                        onClick={() => setSelectedCategoryId(subcat.id)}
                      >
                        <div className="p-3 rounded-xl bg-teal-50">
                          <Folder size={20} className="text-teal-600" />
                        </div>
                        <span className="text-xs font-semibold truncate max-w-[80%] text-center">
                          {subcat.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {photoCounts[subcat.id] ?? 0} photo
                          {(photoCounts[subcat.id] ?? 0) !== 1 ? 's' : ''}
                        </span>
                      </motion.div>
                    ))}

                {/* Photo tiles */}
                {filteredItems.map((item) => {
                  const rawUrl =
                    typeof item.image === 'object' && item.image ? item.image.url : null
                  const mediaUrl = rawUrl ? cfUrl(rawUrl, 400, 80) : null
                  const categoryName =
                    typeof item.category === 'object' && item.category ? item.category.name : null

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      draggable
                      onDragStart={() => setDraggingItemId(item.id)}
                      onDragEnd={() => setDraggingItemId(null)}
                      className={`group relative rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-all cursor-grab active:cursor-grabbing ${
                        draggingItemId === item.id
                          ? 'opacity-50 scale-95 border-teal-400'
                          : 'border-border'
                      }`}
                    >
                      <div className="aspect-square bg-muted relative">
                        {mediaUrl ? (
                          <img
                            src={mediaUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <ImageIcon size={18} />
                          </div>
                        )}

                        {/* Hover actions */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/40 text-white border-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              setMoveItem(item)
                            }}
                            title="Déplacer"
                          >
                            <Move className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteItem(item.id)
                            }}
                            title="Supprimer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        {/* Drag handle indicator */}
                        {draggingItemId === null && (
                          <div className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black/40 rounded p-0.5">
                              <Move size={10} className="text-white" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-2">
                        <h3
                          className="font-medium text-[11px] truncate text-foreground"
                          title={item.title}
                        >
                          {item.title}
                        </h3>
                        {selectedCategoryId === null && categoryName && (
                          <span className="text-[9px] uppercase font-bold text-teal-600 tracking-wider">
                            {categoryName}
                          </span>
                        )}
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Eye size={9} /> {item.views || 0}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <MapIcon size={9} /> {item.usages || 0}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
