'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { Building2, Save, Globe, Phone, Mail, MapPin, Palette, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getAgencyInfo, updateAgencyInfo } from '@/actions/agence-actions'
import type { Agency } from '@/payload-types'

export default function EspaceAgenceAgencePage() {
  const [agency, setAgency] = useState<Agency | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    region: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    primaryColor: '',
    qrCodeUrl: '',
  })

  useEffect(() => {
    getAgencyInfo().then((data) => {
      if (data) {
        setAgency(data)
        setForm({
          name: data.name || '',
          address: data.address || '',
          city: data.city || '',
          region: data.region || '',
          country: data.country || '',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          primaryColor: data.primaryColor || '',
          qrCodeUrl: data.qrCodeUrl || '',
        })
      }
      setLoading(false)
    })
  }, [])

  const handleSave = () => {
    setMessage(null)
    startTransition(async () => {
      const res = await updateAgencyInfo(form)
      if (res.success) {
        setMessage({ type: 'success', text: 'Informations mises à jour.' })
      } else {
        setMessage({ type: 'error', text: res.error || 'Erreur lors de la mise à jour.' })
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-12">
        <div className="w-4 h-4 border-2 border-muted border-t-teal-500 rounded-full animate-spin" />
        Chargement...
      </div>
    )
  }

  if (!agency) {
    return <p className="text-muted-foreground">Aucune agence associée à votre compte.</p>
  }

  const logoUrl = typeof agency.logo === 'object' && agency.logo
    ? (agency.logo as { url?: string | null }).url
    : null

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mon agence</h1>
        <p className="text-muted-foreground mt-1">Gérez les informations de votre agence.</p>
      </div>

      {/* Logo section */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Logo</h2>
        {logoUrl ? (
          <div className="w-24 h-24 rounded-xl border border-border overflow-hidden bg-muted">
            <img src={logoUrl} alt="Logo agence" className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-xl border border-dashed border-border flex items-center justify-center bg-muted/30">
            <ImageIcon size={32} className="text-muted-foreground" />
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-2">Pour modifier le logo, contactez l&apos;administrateur ou utilisez le panneau Payload.</p>
      </div>

      {/* Form */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Informations</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field icon={<Building2 size={16} />} label="Nom de l'agence" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field icon={<MapPin size={16} />} label="Adresse" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
          <Field icon={<MapPin size={16} />} label="Ville" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
          <Field label="Région" value={form.region} onChange={(v) => setForm({ ...form, region: v })} />
          <Field label="Pays" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
          <Field icon={<Phone size={16} />} label="Téléphone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Field icon={<Mail size={16} />} label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field icon={<Globe size={16} />} label="Site web" value={form.website} onChange={(v) => setForm({ ...form, website: v })} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Palette size={16} className="text-muted-foreground" />
              Couleur primaire
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.primaryColor || '#0d9488'}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg border border-border cursor-pointer"
              />
              <Input
                value={form.primaryColor}
                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                placeholder="#0d9488"
                className="flex-1"
              />
            </div>
          </div>
          <Field label="URL QR Code" value={form.qrCodeUrl} onChange={(v) => setForm({ ...form, qrCodeUrl: v })} />
        </div>
      </div>

      {/* Image bank */}
      {agency.imageBank && agency.imageBank.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Banque d&apos;images</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {agency.imageBank.map((item, i) => {
              const img = typeof item.image === 'object' && item.image ? item.image as { url?: string | null } : null
              if (!img?.url) return null
              return (
                <div key={item.id || i} className="aspect-square rounded-lg border border-border overflow-hidden bg-muted">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </div>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground">Pour ajouter ou supprimer des images, contactez l&apos;administrateur.</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={isPending} className="bg-teal-600 hover:bg-teal-700 gap-2">
          <Save size={16} />
          {isPending ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
        {message && (
          <p className={`text-sm font-medium ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  )
}

function Field({ icon, label, value, onChange }: { icon?: React.ReactNode; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        {label}
      </label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
