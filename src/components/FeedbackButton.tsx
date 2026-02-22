'use client'

import React, { useState } from 'react'
import { MessageSquare, Star, X, CheckCircle2 } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { submitFeedback } from '@/actions/feedback-actions'
import { toast } from 'sonner'

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const pathname = usePathname()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message) {
      toast.error('Veuillez entrer un message')
      return
    }

    setIsSubmitting(true)
    const result = await submitFeedback({
      rating,
      message,
      email,
      pageUrl: window.location.href,
    })
    setIsSubmitting(false)

    if (result.success) {
      setIsSuccess(true)
      toast.success('Merci pour votre feedback !')
      setTimeout(() => {
        setIsOpen(false)
        // Reset after a delay
        setTimeout(() => {
          setIsSuccess(false)
          setRating(0)
          setMessage('')
          setEmail('')
        }, 300)
      }, 2000)
    } else {
      toast.error(result.error || 'Erreur lors de l’envoi')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className={cn(
            'fixed left-4 bottom-4 z-[71] group flex items-center gap-2 px-4 py-2.5',
            'bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg transition-all duration-300',
            'hover:scale-105 active:scale-95',
          )}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="font-medium text-sm hidden md:inline">Feedback</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-600" />
            Votre avis nous intéresse
          </DialogTitle>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-10 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold">Merci beaucoup !</h3>
              <p className="text-stone-500 text-sm">Votre feedback a bien été enregistré.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="space-y-3">
              <label className="text-sm font-medium text-stone-700">Note (facultatif)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => !rating && setRating(star)}
                    className="transition-transform hover:scale-110 active:scale-90"
                  >
                    <Star
                      className={cn(
                        'w-8 h-8 transition-colors',
                        star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-stone-300',
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-stone-700">Message</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Dites-nous ce que vous en pensez ou signalez-nous un problème..."
                className="min-h-[120px] resize-none"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-stone-700">
                Email{' '}
                <span className="text-stone-400 font-normal">
                  (facultatif, pour vous recontacter)
                </span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Envoi...' : 'Envoyer mon feedback'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
