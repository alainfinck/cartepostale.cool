'use client'

import React, { useState, useTransition, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Postcard, Media } from '@/payload-types'
import { updatePostcard } from '@/actions/manager-actions'
import { Camera, Loader2, Save, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditPostcardDialogProps {
    postcard: Postcard | null
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

function isMedia(media: any): media is Media {
    return media && typeof media === 'object' && 'url' in media
}

function getFrontImageUrl(postcard: Postcard): string {
    if (postcard.frontImageURL) return postcard.frontImageURL
    if (isMedia(postcard.frontImage) && postcard.frontImage.url) return postcard.frontImage.url
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
}

export default function EditPostcardDialog({ postcard, isOpen, onClose, onSuccess }: EditPostcardDialogProps) {
    const [isPending, startTransition] = useTransition()
    const [formData, setFormData] = useState({
        senderName: '',
        recipientName: '',
        location: '',
        message: '',
        frontCaption: '',
        frontEmoji: '',
        frontImage: '',
    })
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    useEffect(() => {
        if (postcard) {
            setFormData({
                senderName: postcard.senderName || '',
                recipientName: postcard.recipientName || '',
                location: postcard.location || '',
                message: postcard.message || '',
                frontCaption: postcard.frontCaption || '',
                frontEmoji: postcard.frontEmoji || '',
                frontImage: '', // Will only hold new image base64 if changed
            })
            setImagePreview(getFrontImageUrl(postcard))
        }
    }, [postcard])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64 = reader.result as string
                setImagePreview(base64)
                setFormData(prev => ({ ...prev, frontImage: base64 }))
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!postcard) return

        startTransition(async () => {
            const dataToUpdate: any = {
                senderName: formData.senderName,
                recipientName: formData.recipientName,
                location: formData.location,
                message: formData.message,
                frontCaption: formData.frontCaption,
                frontEmoji: formData.frontEmoji,
            }

            if (formData.frontImage) {
                dataToUpdate.frontImage = formData.frontImage
            }

            const result = await updatePostcard(postcard.id, dataToUpdate)
            if (result.success) {
                onSuccess()
                onClose()
            } else {
                alert(result.error || 'Une erreur est survenue lors de la mise à jour.')
            }
        })
    }

    if (!postcard) return null

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isPending && onClose()}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Modifier la carte #{postcard.publicId}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* Image Upload Preview */}
                    <div className="space-y-2">
                        <Label>Photo de la carte</Label>
                        <div className="relative group aspect-[3/2] w-full rounded-xl overflow-hidden border-2 border-dashed border-border/50 hover:border-teal-500/50 transition-colors bg-muted/30">
                            {imagePreview ? (
                                <>
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <label className="cursor-pointer bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/30 flex items-center gap-2 hover:bg-white/30 transition-colors">
                                            <Camera size={18} />
                                            Changer la photo
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                        </label>
                                    </div>
                                </>
                            ) : (
                                <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-teal-500 transition-colors">
                                    <Camera size={32} />
                                    <span>Ajouter une photo</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="frontCaption">Texte avant</Label>
                            <Input
                                id="frontCaption"
                                value={formData.frontCaption}
                                onChange={(e) => setFormData(prev => ({ ...prev, frontCaption: e.target.value }))}
                                placeholder="Texte sur la face avant"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="frontEmoji">Emoji avant</Label>
                            <Input
                                id="frontEmoji"
                                value={formData.frontEmoji}
                                onChange={(e) => setFormData(prev => ({ ...prev, frontEmoji: e.target.value }))}
                                placeholder="Emoji (ex: 🌴)"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="senderName">Expéditeur</Label>
                            <Input
                                id="senderName"
                                value={formData.senderName}
                                onChange={(e) => setFormData(prev => ({ ...prev, senderName: e.target.value }))}
                                placeholder="Nom de l'expéditeur"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="recipientName">Destinataire</Label>
                            <Input
                                id="recipientName"
                                value={formData.recipientName}
                                onChange={(e) => setFormData(prev => ({ ...prev, recipientName: e.target.value }))}
                                placeholder="Nom du destinataire"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Lieu</Label>
                        <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                            placeholder="Lieu (ex: Paris, France)"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                            placeholder="Écrivez votre message ici..."
                            className="min-h-[120px] resize-none"
                            required
                        />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isPending} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
                            {isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
