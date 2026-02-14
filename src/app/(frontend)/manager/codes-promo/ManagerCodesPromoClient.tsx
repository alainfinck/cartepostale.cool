'use client'

import { useState, useTransition } from 'react'
import {
  Mail,
  Search,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Plus,
  Send,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { createPromoCode, sendPromoCodeToEmail } from '@/actions/leads-actions'
import { getAllLeads } from '@/actions/leads-actions'
import type { Lead } from '@/payload-types'

export function ManagerCodesPromoClient({ initialData }: { initialData: { success: boolean; docs?: Lead[]; totalDocs?: number } }) {
  const [leads, setLeads] = useState<Lead[]>(initialData.docs || [])
  const [search, setSearch] = useState('')
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const [createEmail, setCreateEmail] = useState('')
  const [createCode, setCreateCode] = useState('')
  const [createMessage, setCreateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isCreatePending, startCreateTransition] = useTransition()

  const [sendEmail, setSendEmail] = useState('')
  const [sendMessage, setSendMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isSendPending, startSendTransition] = useTransition()

  const [sendingLeadId, setSendingLeadId] = useState<number | null>(null)
  const [rowMessage, setRowMessage] = useState<{ leadId: number; type: 'success' | 'error'; text: string } | null>(null)

  const filteredLeads = leads.filter(
    (lead) =>
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.code.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  const handleCopy = (code: string, id: number) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const refreshLeads = () => {
    getAllLeads().then((r) => {
      if (r.success && r.docs) setLeads(r.docs)
    })
  }

  const handleCreate = () => {
    setCreateMessage(null)
    startCreateTransition(async () => {
      const res = await createPromoCode({
        email: createEmail.trim(),
        code: createCode.trim() || undefined,
      })
      if (res.success) {
        setCreateMessage({ type: 'success', text: res.message || `Code créé : ${res.code}` })
        setCreateEmail('')
        setCreateCode('')
        refreshLeads()
      } else {
        setCreateMessage({ type: 'error', text: res.error || 'Erreur' })
      }
    })
  }

  const handleSend = () => {
    setSendMessage(null)
    startSendTransition(async () => {
      const res = await sendPromoCodeToEmail(sendEmail.trim())
      if (res.success) {
        setSendMessage({ type: 'success', text: `Code envoyé à ${sendEmail.trim()} (code : ${res.code})` })
        setSendEmail('')
        refreshLeads()
      } else {
        setSendMessage({ type: 'error', text: res.error || 'Erreur' })
      }
    })
  }

  const handleSendToLead = (lead: Lead) => {
    setRowMessage(null)
    setSendingLeadId(lead.id)
    sendPromoCodeToEmail(lead.email).then((res) => {
      setSendingLeadId(null)
      if (res.success) {
        setRowMessage({ leadId: lead.id, type: 'success', text: 'Email envoyé' })
        setTimeout(() => setRowMessage(null), 3000)
      } else {
        setRowMessage({ leadId: lead.id, type: 'error', text: res.error || 'Erreur' })
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-stone-800">Codes promo</h1>
        <p className="text-stone-500">
          Créez des codes promo et envoyez-les par email aux utilisateurs.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50 shadow-sm bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus size={20} className="text-teal-600" />
              Créer un code promo
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Associez un email à un code (généré automatiquement ou personnalisé).
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                placeholder="client@exemple.com"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-code">Code (optionnel, auto si vide)</Label>
              <div className="flex gap-2">
                <Input
                  id="create-code"
                  type="text"
                  placeholder="ex: BONUS2024"
                  value={createCode}
                  onChange={(e) => setCreateCode(e.target.value.toUpperCase())}
                  className="bg-background font-mono uppercase"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setCreateCode(crypto.randomUUID().split('-')[0].toUpperCase())}
                  title="Générer un code"
                >
                  <RefreshCw size={16} />
                </Button>
              </div>
            </div>
            {createMessage && (
              <p
                className={
                  createMessage.type === 'success'
                    ? 'text-sm text-emerald-600'
                    : 'text-sm text-red-600'
                }
              >
                {createMessage.text}
              </p>
            )}
            <Button
              onClick={handleCreate}
              disabled={!createEmail.trim() || isCreatePending}
              className="w-full gap-2 bg-teal-600 hover:bg-teal-700"
            >
              {isCreatePending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Créer le code
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Send size={20} className="text-teal-600" />
              Envoyer un code par email
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Un code sera créé pour cet email (ou réutilisé) et envoyé par email.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="send-email">Email du destinataire</Label>
              <Input
                id="send-email"
                type="email"
                placeholder="destinataire@exemple.com"
                value={sendEmail}
                onChange={(e) => setSendEmail(e.target.value)}
                className="bg-background"
              />
            </div>
            {sendMessage && (
              <p
                className={
                  sendMessage.type === 'success'
                    ? 'text-sm text-emerald-600'
                    : 'text-sm text-red-600'
                }
              >
                {sendMessage.text}
              </p>
            )}
            <Button
              onClick={handleSend}
              disabled={!sendEmail.trim() || isSendPending}
              className="w-full gap-2 bg-teal-600 hover:bg-teal-700"
            >
              {isSendPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Envoyer le code par email
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm bg-card/60 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
            <Input
              placeholder="Rechercher un email ou un code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-background/50 border-border/50 rounded-xl"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-stone-400">
                      Aucun code promo.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="font-medium text-stone-700">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-stone-300" />
                          {lead.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="bg-stone-100 px-2 py-1 rounded text-sm font-mono font-bold text-stone-600">
                            {lead.code}
                          </code>
                          <button
                            onClick={() => handleCopy(lead.code, lead.id)}
                            className="text-stone-300 hover:text-teal-600 transition-colors"
                          >
                            {copiedId === lead.id ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.isUsed ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                            <CheckCircle2 size={12} className="mr-1" /> Utilisé
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-stone-400 border-stone-200">
                            En attente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-stone-400 uppercase tracking-widest font-bold">
                          {lead.source || 'exit-intent'}
                        </span>
                      </TableCell>
                      <TableCell className="text-stone-500 text-sm">
                        {formatDate(lead.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 flex-wrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendToLead(lead)}
                            disabled={sendingLeadId === lead.id}
                            className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 gap-1"
                            title="Envoyer / Renvoyer le code par email"
                          >
                            {sendingLeadId === lead.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Send size={14} />
                            )}
                            {sendingLeadId === lead.id ? 'Envoi…' : 'Envoyer'}
                          </Button>
                          {lead.usedByPostcard && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 gap-1"
                            >
                              <a
                                href={`/carte/${(lead.usedByPostcard as { publicId?: string })?.publicId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Voir carte <ExternalLink size={14} />
                              </a>
                            </Button>
                          )}
                        </div>
                        {rowMessage?.leadId === lead.id && (
                          <p
                            className={
                              rowMessage.type === 'success'
                                ? 'text-xs text-emerald-600 mt-1'
                                : 'text-xs text-red-600 mt-1'
                            }
                          >
                            {rowMessage.text}
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
