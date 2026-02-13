'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { Plus, Trash2, ImageIcon, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { getAllStickers, createSticker, deleteSticker, uploadStickerImage } from '@/actions/manager-stickers-actions'
import { Sticker, Media } from '@/payload-types'
import { getOptimizedImageUrl } from '@/lib/image-processing'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

export default function ManagerStickers() {
    const [stickers, setStickers] = useState<Sticker[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newStickerName, setNewStickerName] = useState('')
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    useEffect(() => {
        loadStickers()
    }, [])

    const loadStickers = async () => {
        setIsLoading(true)
        const data = await getAllStickers()
        setStickers(data)
        setIsLoading(false)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedImage(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleAddSticker = async () => {
        if (!newStickerName || !selectedImage) return

        startTransition(async () => {
            const reader = new FileReader()
            reader.readAsDataURL(selectedImage)
            reader.onload = async () => {
                const base64 = reader.result as string
                const res = await uploadStickerImage(base64, selectedImage.name, newStickerName)
                if (res.success) {
                    setIsAddOpen(false)
                    setNewStickerName('')
                    setSelectedImage(null)
                    setPreviewUrl(null)
                    loadStickers()
                } else {
                    alert(res.error || 'Erreur lors de l\'envoi')
                }
            }
        })
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Supprimer ce sticker ?')) return
        const res = await deleteSticker(id)
        if (res.success) {
            loadStickers()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-stone-800">Galerie de Stickers</h2>
                    <p className="text-sm text-stone-500">Gérez les autocollants disponibles pour les utilisateurs.</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} className="gap-2 bg-teal-600 hover:bg-teal-700">
                    <Plus size={16} />
                    Ajouter un sticker
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-teal-600" size={32} />
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                    {stickers.map((sticker) => {
                        const imgUrl = typeof sticker.image === 'object' ? sticker.image?.url : ''
                        return (
                            <Card key={sticker.id} className="group relative overflow-hidden border-border/50 hover:shadow-md transition-all h-48 flex flex-col">
                                <div className="flex-1 bg-stone-50 flex items-center justify-center p-4 relative overflow-hidden">
                                    <img
                                        src={getOptimizedImageUrl(imgUrl || '', { width: 200 })}
                                        alt={sticker.name}
                                        className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleDelete(sticker.id)}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                    <div className="absolute bottom-2 left-2">
                                        <Badge variant="outline" className="bg-white/80 backdrop-blur-sm text-[10px] py-0 px-1">
                                            {sticker.category}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-2 border-t border-border/10 bg-white">
                                    <p className="text-xs font-medium text-stone-700 truncate">{sticker.name}</p>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ajouter un nouveau sticker</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nom du sticker</label>
                            <Input
                                value={newStickerName}
                                onChange={(e) => setNewStickerName(e.target.value)}
                                placeholder="ex: Palmier, Coeur, Vintage..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Image (PNG transparent recommandé)</label>
                            <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-stone-50 transition-colors relative">
                                {previewUrl ? (
                                    <div className="relative">
                                        <img src={previewUrl} className="max-h-32 object-contain" />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute -top-2 -right-2 h-6 w-6 bg-white shadow rounded-full"
                                            onClick={() => { setSelectedImage(null); setPreviewUrl(null); }}
                                        >
                                            <X size={14} />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <ImageIcon className="text-stone-300" size={48} />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleImageChange}
                                        />
                                        <p className="text-xs text-stone-500">Cliquez ou glissez une image ici</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>Annuler</Button>
                        <Button
                            onClick={handleAddSticker}
                            disabled={!newStickerName || !selectedImage || isPending}
                            className="bg-teal-600 hover:bg-teal-700"
                        >
                            {isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                            Ajouter
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
