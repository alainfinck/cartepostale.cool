'use client'

import { useState, useTransition, useCallback } from 'react'
import {
    Search,
    Plus,
    Image as ImageIcon,
    Tag,
    FolderOpen,
    Trash2,
    Edit2,
    X,
} from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    getAllGalleryImages,
    getAllGalleryCategories,
    getAllGalleryTags,
    createGalleryImage,
    updateGalleryImage,
    deleteGalleryImage,
    createGalleryCategory,
    updateGalleryCategory,
    deleteGalleryCategory,
    createGalleryTag,
    updateGalleryTag,
    deleteGalleryTag,
    getMediaForGallery,
} from '@/actions/manager-actions'
import type { Gallery, GalleryCategory, GalleryTag } from '@/payload-types'

function getImageUrl(item: Gallery): string | null {
    const img = item.image
    if (!img) return null
    if (typeof img === 'object' && img !== null && 'url' in img) {
        const m = img as { url?: string | null; filename?: string | null }
        return m.url ?? (m.filename ? `/media/${encodeURIComponent(m.filename)}` : null)
    }
    return null
}

export function ManagerGalleryClient({
    initialImages,
    initialCategories,
    initialTags,
}: {
    initialImages: Gallery[]
    initialCategories: GalleryCategory[]
    initialTags: GalleryTag[]
}) {
    const [images, setImages] = useState(initialImages)
    const [categories, setCategories] = useState(initialCategories)
    const [tags, setTags] = useState(initialTags)
    const [search, setSearch] = useState('')
    const [filterCategory, setFilterCategory] = useState<string>('all')
    const [filterTag, setFilterTag] = useState<string>('all')
    const [selectedImage, setSelectedImage] = useState<Gallery | null>(null)
    const [isImageSheetOpen, setIsImageSheetOpen] = useState(false)
    const [isCategoriesSheetOpen, setIsCategoriesSheetOpen] = useState(false)
    const [isTagsSheetOpen, setIsTagsSheetOpen] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
    const [isPending, startTransition] = useTransition()

    const refreshImages = useCallback(() => {
        startTransition(async () => {
            const result = await getAllGalleryImages({
                search: search.trim() || undefined,
                category: filterCategory === 'all' ? undefined : Number(filterCategory),
                tag: filterTag === 'all' ? undefined : Number(filterTag),
                limit: 100,
            })
            setImages(result.docs)
        })
    }, [search, filterCategory, filterTag])

    const handleOpenImageSheet = (image: Gallery | null) => {
        setSelectedImage(image)
        setIsImageSheetOpen(true)
    }

    const handleDeleteImage = (id: number) => {
        startTransition(async () => {
            const result = await deleteGalleryImage(id)
            if (result.success) {
                setDeleteConfirm(null)
                if (selectedImage?.id === id) {
                    setIsImageSheetOpen(false)
                    setSelectedImage(null)
                }
                refreshImages()
            }
        })
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-stone-800">
                        Galerie d&apos;images
                    </h1>
                    <p className="text-stone-500 text-sm">
                        Gérez les images, catégories et tags de la galerie.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setIsCategoriesSheetOpen(true)}
                    >
                        <FolderOpen className="h-4 w-4" />
                        Catégories
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setIsTagsSheetOpen(true)}
                    >
                        <Tag className="h-4 w-4" />
                        Tags
                    </Button>
                    <Button
                        onClick={() => handleOpenImageSheet(null)}
                        className="gap-2 bg-teal-600 hover:bg-teal-700 shadow-teal-500/20 shadow-lg rounded-xl"
                    >
                        <Plus className="h-4 w-4" />
                        Ajouter une image
                    </Button>
                </div>
            </div>

            <Card className="overflow-hidden border-border/50 bg-card/60 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher par titre ou légende..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && refreshImages()}
                            className="pl-9"
                        />
                    </div>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="flex h-10 w-full max-w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <option value="all">Toutes les catégories</option>
                        {categories.map((c) => (
                            <option key={c.id} value={String(c.id)}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filterTag}
                        onChange={(e) => setFilterTag(e.target.value)}
                        className="flex h-10 w-full max-w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <option value="all">Tous les tags</option>
                        {tags.map((t) => (
                            <option key={t.id} value={String(t.id)}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                    <Button variant="secondary" onClick={refreshImages} disabled={isPending}>
                        Filtrer
                    </Button>
                </div>
            </Card>

            {isPending && (
                <div className="flex items-center gap-2 text-sm text-stone-500 animate-pulse">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-teal-500" />
                    Mise à jour...
                </div>
            )}

            {images.length === 0 ? (
                <Card className="flex flex-col items-center justify-center border-dashed py-16">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 font-medium text-muted-foreground">
                        Aucune image dans la galerie.
                    </p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => handleOpenImageSheet(null)}
                    >
                        Ajouter une image
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {images.map((item) => {
                        const url = getImageUrl(item)
                        const category =
                            typeof item.category === 'object' && item.category
                                ? item.category.name
                                : null
                        const tagList = Array.isArray(item.tags)
                            ? item.tags.map((t) =>
                                typeof t === 'object' && t ? (t as GalleryTag).name : null
                            )
                            : []

                        return (
                            <Card
                                key={item.id}
                                className="group overflow-hidden border-border/50 transition-shadow hover:shadow-md"
                            >
                                <div
                                    className="relative aspect-square cursor-pointer bg-muted/30"
                                    onClick={() => handleOpenImageSheet(item)}
                                >
                                    {url ? (
                                        <Image
                                            src={url}
                                            alt={item.title}
                                            fill
                                            unoptimized
                                            className="object-cover"
                                            sizes="(max-width: 640px) 50vw, 20vw"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <ImageIcon className="h-10 w-10 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleOpenImageSheet(item)
                                            }}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setDeleteConfirm(item.id)
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-2">
                                    <p className="truncate text-sm font-medium text-stone-800">
                                        {item.title}
                                    </p>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {category && (
                                            <Badge variant="secondary" className="text-xs">
                                                {category}
                                            </Badge>
                                        )}
                                        {tagList.filter(Boolean).slice(0, 2).map((name, i) => (
                                            <Badge key={i} variant="outline" className="text-xs">
                                                {name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}

            <p className="text-xs text-muted-foreground">
                {images.length} image{images.length !== 1 ? 's' : ''} au total
            </p>

            <ImageSheet
                image={selectedImage}
                categories={categories}
                tags={tags}
                isOpen={isImageSheetOpen}
                onClose={() => {
                    setIsImageSheetOpen(false)
                    setSelectedImage(null)
                }}
                onSuccess={() => {
                    refreshImages()
                    setIsImageSheetOpen(false)
                    setSelectedImage(null)
                }}
            />

            <CategoriesSheet
                categories={categories}
                isOpen={isCategoriesSheetOpen}
                onClose={() => setIsCategoriesSheetOpen(false)}
                onSuccess={() => {
                    getAllGalleryCategories({ limit: 100 }).then((r) => setCategories(r.docs))
                }}
            />

            <TagsSheet
                tags={tags}
                isOpen={isTagsSheetOpen}
                onClose={() => setIsTagsSheetOpen(false)}
                onSuccess={() => {
                    getAllGalleryTags({ limit: 100 }).then((r) => setTags(r.docs))
                }}
            />

            <Dialog
                open={deleteConfirm !== null}
                onOpenChange={(open) => !open && setDeleteConfirm(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer l&apos;image</DialogTitle>
                        <DialogDescription>
                            Cette action est irréversible. L&apos;entrée de galerie sera
                            supprimée (l&apos;image média reste en base).
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                            Annuler
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={isPending}
                            onClick={() =>
                                deleteConfirm !== null && handleDeleteImage(deleteConfirm)
                            }
                        >
                            {isPending ? 'Suppression…' : 'Supprimer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function ImageSheet({
    image,
    categories,
    tags,
    isOpen,
    onClose,
    onSuccess,
}: {
    image: Gallery | null
    categories: GalleryCategory[]
    tags: GalleryTag[]
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [mediaList, setMediaList] = useState<{ id: number; alt: string; url?: string | null }[]>(
        []
    )
    const currentImageId =
        image?.image && typeof image.image === 'object'
            ? (image.image as { id: number }).id
            : (image?.image as number | undefined)
    const [selectedImageId, setSelectedImageId] = useState<string>(
        currentImageId ? String(currentImageId) : ''
    )
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
        typeof image?.category === 'object' && image?.category
            ? String((image.category as GalleryCategory).id)
            : image?.category
                ? String(image.category)
                : ''
    )
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>(() => {
        if (!Array.isArray(image?.tags)) return []
        return image.tags
            .map((x) => (typeof x === 'object' && x ? (x as GalleryTag).id : x))
            .filter((id): id is number => typeof id === 'number')
    })

    const loadMedia = useCallback(() => {
        getMediaForGallery({ limit: 80 }).then((r) => setMediaList(r.docs))
    }, [])

    const handleOpen = (open: boolean) => {
        if (open) {
            loadMedia()
            setSelectedImageId(currentImageId ? String(currentImageId) : '')
            setSelectedCategoryId(
                typeof image?.category === 'object' && image?.category
                    ? String((image.category as GalleryCategory).id)
                    : image?.category
                        ? String(image.category)
                        : ''
            )
            setSelectedTagIds(
                Array.isArray(image?.tags)
                    ? image.tags
                        .map((x) =>
                            typeof x === 'object' && x ? (x as GalleryTag).id : x
                        )
                        .filter((id): id is number => typeof id === 'number')
                    : []
            )
        } else {
            onClose()
        }
    }

    const toggleTag = (tagId: number) => {
        setSelectedTagIds((prev) =>
            prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
        )
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        const form = e.currentTarget
        const title = (form.elements.namedItem('title') as HTMLInputElement)?.value?.trim()
        const caption = (form.elements.namedItem('caption') as HTMLTextAreaElement)?.value?.trim()
        const order = Number((form.elements.namedItem('order') as HTMLInputElement)?.value) || 0
        const imageId = selectedImageId ? Number(selectedImageId) : null
        const categoryId = selectedCategoryId ? Number(selectedCategoryId) : null

        if (!title) {
            setError('Le titre est requis.')
            return
        }
        if (!imageId && !image?.image) {
            setError('Veuillez sélectionner une image.')
            return
        }

        startTransition(async () => {
            const result = image
                ? await updateGalleryImage(image.id, {
                    title,
                    image: imageId ?? (image.image as number),
                    caption: caption || null,
                    category: categoryId,
                    tags: selectedTagIds,
                    order,
                })
                : await createGalleryImage({
                    title,
                    image: imageId!,
                    caption: caption || undefined,
                    category: categoryId ?? undefined,
                    tags: selectedTagIds,
                    order,
                })

            if (result.success) {
                onSuccess()
            } else {
                setError(result.error ?? 'Erreur lors de l\'enregistrement.')
            }
        })
    }

    return (
        <Sheet open={isOpen} onOpenChange={handleOpen}>
            <SheetContent className="flex w-full flex-col border-l border-border/50 sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>{image ? 'Modifier l\'image' : 'Nouvelle image'}</SheetTitle>
                    <SheetDescription>
                        Titre, image média, légende, catégorie et tags.
                    </SheetDescription>
                </SheetHeader>
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-1 flex-col overflow-y-auto"
                >
                    <div className="space-y-4 py-4">
                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase text-muted-foreground">
                                Titre *
                            </label>
                            <Input
                                name="title"
                                required
                                defaultValue={image?.title}
                                placeholder="Titre de l'image"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase text-muted-foreground">
                                Image *
                            </label>
                            <select
                                value={selectedImageId}
                                onChange={(e) => setSelectedImageId(e.target.value)}
                                required={!image}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="">Choisir une image (média)</option>
                                {mediaList.map((m) => (
                                    <option key={m.id} value={String(m.id)}>
                                        {m.alt || `Media #${m.id}`}
                                    </option>
                                ))}
                            </select>
                            {!image && (
                                <p className="text-xs text-muted-foreground">
                                    Les médias sont ceux déjà uploadés (admin Payload ou autres
                                    écrans).
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase text-muted-foreground">
                                Légende
                            </label>
                            <textarea
                                name="caption"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                defaultValue={image?.caption ?? ''}
                                placeholder="Légende optionnelle"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase text-muted-foreground">
                                Catégorie
                            </label>
                            <select
                                value={selectedCategoryId}
                                onChange={(e) => setSelectedCategoryId(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="">Aucune</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={String(c.id)}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase text-muted-foreground">
                                Tags
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((t) => {
                                    const selected = selectedTagIds.includes(t.id)
                                    return (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => toggleTag(t.id)}
                                            className={cn(
                                                'inline-flex items-center rounded-full border px-3 py-1 text-sm transition-colors',
                                                selected
                                                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                                                    : 'border-border bg-muted/50 text-muted-foreground hover:bg-muted'
                                            )}
                                        >
                                            {t.name}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase text-muted-foreground">
                                Ordre
                            </label>
                            <Input
                                name="order"
                                type="number"
                                defaultValue={image?.order ?? 0}
                                className="w-24"
                            />
                        </div>
                    </div>

                    <div className="border-t border-border/50 py-4">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-teal-600 hover:bg-teal-700"
                        >
                            {isPending ? 'Enregistrement…' : image ? 'Mettre à jour' : 'Ajouter'}
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    )
}

function CategoriesSheet({
    categories,
    isOpen,
    onClose,
    onSuccess,
}: {
    categories: GalleryCategory[]
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}) {
    const [list, setList] = useState(categories)
    const [editing, setEditing] = useState<GalleryCategory | null>(null)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const refresh = () => {
        getAllGalleryCategories({ limit: 100 }).then((r) => {
            setList(r.docs)
            onSuccess()
        })
    }

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        const name = (e.currentTarget.elements.namedItem('newName') as HTMLInputElement)?.value?.trim()
        if (!name) return
        startTransition(async () => {
            const result = await createGalleryCategory({ name })
            if (result.success) {
                refresh()
                    ; (e.target as HTMLFormElement).reset()
            } else setError(result.error ?? 'Erreur')
        })
    }

    const handleUpdate = (cat: GalleryCategory, newName: string) => {
        if (!newName.trim()) return
        startTransition(async () => {
            const result = await updateGalleryCategory(cat.id, { name: newName.trim() })
            if (result.success) {
                setEditing(null)
                refresh()
            }
        })
    }

    const handleDelete = (id: number) => {
        startTransition(async () => {
            const result = await deleteGalleryCategory(id)
            if (result.success) {
                setEditing(null)
                refresh()
            }
        })
    }

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="flex w-full flex-col sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Catégories</SheetTitle>
                    <SheetDescription>
                        Créez et modifiez les catégories de la galerie.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleCreate} className="flex gap-2 border-b border-border/50 pb-4">
                    <Input
                        name="newName"
                        placeholder="Nouvelle catégorie"
                        className="flex-1"
                        disabled={isPending}
                    />
                    <Button type="submit" disabled={isPending}>
                        Ajouter
                    </Button>
                </form>
                {error && (
                    <p className="text-sm text-red-600">{error}</p>
                )}
                <ul className="flex-1 space-y-2 overflow-y-auto pt-4">
                    {list.map((c) => (
                        <li
                            key={c.id}
                            className="flex items-center justify-between rounded-lg border border-border/50 p-2"
                        >
                            {editing?.id === c.id ? (
                                <>
                                    <Input
                                        defaultValue={c.name}
                                        className="flex-1"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleUpdate(c, (e.target as HTMLInputElement).value)
                                            }
                                            if (e.key === 'Escape') setEditing(null)
                                        }}
                                        autoFocus
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setEditing(null)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <span className="font-medium">{c.name}</span>
                                    <div className="flex gap-1">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setEditing(c)}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-500"
                                            onClick={() => handleDelete(c.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </SheetContent>
        </Sheet>
    )
}

function TagsSheet({
    tags,
    isOpen,
    onClose,
    onSuccess,
}: {
    tags: GalleryTag[]
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}) {
    const [list, setList] = useState(tags)
    const [editing, setEditing] = useState<GalleryTag | null>(null)
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)

    const refresh = () => {
        getAllGalleryTags({ limit: 100 }).then((r) => {
            setList(r.docs)
            onSuccess()
        })
    }

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        const name = (e.currentTarget.elements.namedItem('newName') as HTMLInputElement)?.value?.trim()
        if (!name) return
        startTransition(async () => {
            const result = await createGalleryTag({ name })
            if (result.success) {
                refresh()
                    ; (e.target as HTMLFormElement).reset()
            } else setError(result.error ?? 'Erreur')
        })
    }

    const handleUpdate = (tag: GalleryTag, newName: string) => {
        if (!newName.trim()) return
        startTransition(async () => {
            const result = await updateGalleryTag(tag.id, { name: newName.trim() })
            if (result.success) {
                setEditing(null)
                refresh()
            }
        })
    }

    const handleDelete = (id: number) => {
        startTransition(async () => {
            const result = await deleteGalleryTag(id)
            if (result.success) {
                setEditing(null)
                refresh()
            }
        })
    }

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="flex w-full flex-col sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Tags</SheetTitle>
                    <SheetDescription>
                        Créez et modifiez les tags de la galerie.
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleCreate} className="flex gap-2 border-b border-border/50 pb-4">
                    <Input
                        name="newName"
                        placeholder="Nouveau tag"
                        className="flex-1"
                        disabled={isPending}
                    />
                    <Button type="submit" disabled={isPending}>
                        Ajouter
                    </Button>
                </form>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <ul className="flex-1 space-y-2 overflow-y-auto pt-4">
                    {list.map((t) => (
                        <li
                            key={t.id}
                            className="flex items-center justify-between rounded-lg border border-border/50 p-2"
                        >
                            {editing?.id === t.id ? (
                                <>
                                    <Input
                                        defaultValue={t.name}
                                        className="flex-1"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleUpdate(t, (e.target as HTMLInputElement).value)
                                            }
                                            if (e.key === 'Escape') setEditing(null)
                                        }}
                                        autoFocus
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setEditing(null)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <span className="font-medium">{t.name}</span>
                                    <div className="flex gap-1">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setEditing(t)}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-500"
                                            onClick={() => handleDelete(t.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </SheetContent>
        </Sheet>
    )
}
