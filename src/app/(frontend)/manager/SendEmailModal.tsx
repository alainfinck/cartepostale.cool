'use client'

import { useState, useTransition, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Mail, Send } from 'lucide-react'
import { toast } from 'sonner'
import { getEmailTemplates, sendEmailToUsers } from '@/actions/email-actions'

type Template = {
  id: string
  name: string
  subject: string
  body: string
}

export function SendEmailModal({
  isOpen,
  onClose,
  selectedUsers,
  targetRole = 'all',
}: {
  isOpen: boolean
  onClose: () => void
  selectedUsers: { id: string | number; name?: string | null; email: string }[]
  targetRole?: 'client' | 'agence' | 'all'
}) {
  const [isPending, startTransition] = useTransition()
  const [templates, setTemplates] = useState<Template[]>([])
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  useEffect(() => {
    if (isOpen) {
      startTransition(async () => {
        const res = await getEmailTemplates(targetRole)
        if (res.success && res.templates) {
          setTemplates(res.templates as any)
        }
      })
    }
  }, [isOpen, targetRole])

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    const tpl = templates.find((t) => t.id === templateId)
    if (tpl) {
      setSubject(tpl.subject)
      setBody(tpl.body)
    } else {
      setSubject('')
      setBody('')
    }
  }

  const handleSend = () => {
    if (!subject || !body) {
      toast.error('Le sujet et le corps du message sont requis')
      return
    }
    if (selectedUsers.length === 0) {
      toast.error('Aucun utilisateur sélectionné')
      return
    }

    startTransition(async () => {
      const ids = selectedUsers.map((u) => u.id)
      const res = await sendEmailToUsers(ids, subject, body)
      if (res.success) {
        toast.success(res.message || 'Email(s) envoyé(s) avec succès')
        onClose()
      } else {
        toast.error(res.error || "Erreur lors de l'envoi")
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-teal-600" />
            Envoyer un email
          </DialogTitle>
          <DialogDescription>
            {selectedUsers.length} destinataire(s) sélectionné(s).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Modèle d&apos;email</label>
            <select
              value={selectedTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="flex h-11 w-full rounded-md border border-border/50 bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-teal-500/30"
              disabled={isPending}
            >
              <option value="">Sélectionner un modèle...</option>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name}
                </option>
              ))}
            </select>
            {templates.length === 0 && !isPending && (
              <p className="text-xs text-muted-foreground">
                Aucun modèle trouvé pour cette catégorie. Créez-en dans le CMS.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sujet</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Sujet de l'email"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Contenu du message (html supporté)"
              className="min-h-[200px]"
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Variables utilisables : {'{{name}}'}, {'{{company}}'}, {'{{email}}'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Annuler
          </Button>
          <Button
            onClick={handleSend}
            disabled={isPending || selectedUsers.length === 0}
            className="gap-2 bg-teal-600 hover:bg-teal-700"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-stone-300 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={16} />
            )}
            Envoyer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
