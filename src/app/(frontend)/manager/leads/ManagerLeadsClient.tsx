'use client'

import { useState } from 'react'
import { 
    Mail, Calendar, CheckCircle2, XCircle, 
    Search, ExternalLink, Copy, Check 
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
    Table, TableBody, TableCell, TableHead, 
    TableHeader, TableRow 
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Lead } from '@/payload-types'

export function ManagerLeadsClient({ initialData }: { initialData: any }) {
    const [leads, setLeads] = useState<Lead[]>(initialData.docs || [])
    const [search, setSearch] = useState('')
    const [copiedId, setCopiedId] = useState<number | null>(null)

    const filteredLeads = leads.filter(lead => 
        lead.email.toLowerCase().includes(search.toLowerCase()) ||
        lead.code.toLowerCase().includes(search.toLowerCase())
    )

    const formatDate = (date: string) => 
        new Date(date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })

    const handleCopy = (code: string, id: number) => {
        navigator.clipboard.writeText(code)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-stone-800">Leads & Codes Promo</h1>
                <p className="text-stone-500">
                    Emails collectés via l'exit intent et codes promo associés.
                </p>
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
                                            Aucun lead trouvé.
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
                                                {lead.usedByPostcard && (
                                                    <Button variant="ghost" size="sm" asChild className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 gap-1">
                                                        <a href={`/carte/${(lead.usedByPostcard as any).publicId}`} target="_blank" rel="noopener noreferrer">
                                                            Voir carte <ExternalLink size={14} />
                                                        </a>
                                                    </Button>
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
