'use client'

import React, { useState, useEffect, useTransition, useRef } from 'react'
import Link from 'next/link'
import {
  Building2,
  Save,
  Globe,
  Phone,
  Mail,
  MapPin,
  Palette,
  Megaphone,
  Link2,
  ToggleLeft,
  ToggleRight,
  Image as ImageIcon,
  X,
  Check,
  RefreshCw,
  ExternalLink,
  Upload,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getAgencyInfo, updateAgencyInfo, uploadAgencyLogo } from '@/actions/agence-actions'
import type { Agency } from '@/payload-types'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Page principale
// ---------------------------------------------------------------------------
export default function EspaceAgenceAgencePage() {
  const [agency, setAgency] = useState<Agency | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Logo
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    region: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    primaryColor: '#0d9488',
    qrCodeUrl: '',
  })

  // Bannière
  const [banner, setBanner] = useState({
    bannerEnabled: false,
    bannerText: '',
    bannerSubtext: '',
    bannerColor: '#0d9488',
    bannerTextColor: '#ffffff',
    bannerLink: '',
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
          primaryColor: data.primaryColor || '#0d9488',
          qrCodeUrl: data.qrCodeUrl || '',
        })
        const anyData = data as any
        setBanner({
          bannerEnabled: anyData.bannerEnabled || false,
          bannerText: anyData.bannerText || '',
          bannerSubtext: anyData.bannerSubtext || '',
          bannerColor: anyData.bannerColor || '#0d9488',
          bannerTextColor: anyData.bannerTextColor || '#ffffff',
          bannerLink: anyData.bannerLink || '',
        })
      }
      setLoading(false)
    })
  }, [])

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setLogoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleLogoUpload = async () => {
    if (!logoFile || !logoPreview) return
    setIsUploadingLogo(true)
    setMessage(null)
    try {
      const res = await uploadAgencyLogo(logoPreview, logoFile.type, logoFile.name)
      if (res.success) {
        setMessage({ type: 'success', text: 'Logo mis à jour avec succès !' })
        const updated = await getAgencyInfo()
        if (updated) setAgency(updated)
        setLogoFile(null)
        setLogoPreview(null)
      } else {
        setMessage({ type: 'error', text: res.error || "Erreur lors de l'upload du logo." })
      }
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleSave = () => {
    setMessage(null)
    startTransition(async () => {
      const res = await updateAgencyInfo({ ...form, ...banner })
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

  const logoUrl =
    logoPreview ??
    (typeof agency.logo === 'object' && agency.logo
      ? (agency.logo as { url?: string | null }).url
      : null)

  const agencyCode = (agency as any).code
  const publicPageUrl = agencyCode ? `/agences/${agencyCode}` : null

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mon agence</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les informations et la bannière de votre agence.
          </p>
        </div>
        {publicPageUrl && (
          <Link href={publicPageUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-2 shrink-0">
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Voir ma page publique</span>
              <span className="sm:hidden">Page publique</span>
            </Button>
          </Link>
        )}
      </div>

      {/* ── Logo ── */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Logo</h2>
        <div className="flex items-start gap-5">
          {/* Preview */}
          <div
            className={cn(
              'relative w-28 h-28 rounded-xl border-2 overflow-hidden flex items-center justify-center bg-muted/30 shrink-0 group cursor-pointer',
              logoPreview ? 'border-teal-400' : 'border-dashed border-border',
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            {logoUrl ? (
              <>
                <img src={logoUrl} alt="Logo agence" className="w-full h-full object-contain p-2" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload size={22} className="text-white" />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <ImageIcon size={28} />
                <span className="text-[10px]">Cliquer</span>
              </div>
            )}
          </div>

          <div className="space-y-3 flex-1">
            <p className="text-sm text-muted-foreground">
              Cliquez sur l&apos;aperçu pour changer de logo. Formats acceptés: PNG, SVG, JPG.
              Recommandé: PNG transparent.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoSelect}
            />
            {logoPreview && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleLogoUpload}
                  disabled={isUploadingLogo}
                  className="bg-teal-600 hover:bg-teal-700 gap-2"
                >
                  {isUploadingLogo ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  {isUploadingLogo ? 'Upload...' : 'Confirmer ce logo'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setLogoPreview(null)
                    setLogoFile(null)
                  }}
                >
                  <X size={14} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Informations ── */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Informations
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            icon={<Building2 size={16} />}
            label="Nom de l'agence"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
          />
          <Field
            icon={<MapPin size={16} />}
            label="Adresse"
            value={form.address}
            onChange={(v) => setForm({ ...form, address: v })}
          />
          <Field
            icon={<MapPin size={16} />}
            label="Ville"
            value={form.city}
            onChange={(v) => setForm({ ...form, city: v })}
          />
          <Field
            label="Région"
            value={form.region}
            onChange={(v) => setForm({ ...form, region: v })}
          />
          <Field
            label="Pays"
            value={form.country}
            onChange={(v) => setForm({ ...form, country: v })}
          />
          <Field
            icon={<Phone size={16} />}
            label="Téléphone"
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
          />
          <Field
            icon={<Mail size={16} />}
            label="Email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
          />
          <Field
            icon={<Globe size={16} />}
            label="Site web"
            value={form.website}
            onChange={(v) => setForm({ ...form, website: v })}
          />
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
          <Field
            label="URL QR Code"
            value={form.qrCodeUrl}
            onChange={(v) => setForm({ ...form, qrCodeUrl: v })}
          />
        </div>
      </div>

      {/* ── Bannière promotionnelle ── */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-2">
            <Megaphone size={16} className="text-teal-600" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Bannière promotionnelle
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setBanner((b) => ({ ...b, bannerEnabled: !b.bannerEnabled }))}
            className="flex items-center gap-2 text-sm font-medium transition-colors"
          >
            {banner.bannerEnabled ? (
              <>
                <ToggleRight size={24} className="text-teal-600" />
                <span className="text-teal-600">Active</span>
              </>
            ) : (
              <>
                <ToggleLeft size={24} className="text-muted-foreground" />
                <span className="text-muted-foreground">Inactive</span>
              </>
            )}
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5">
          <p className="text-xs text-muted-foreground">
            La bannière apparaît en bas de la face avant des cartes postales créées par votre
            agence, et sur votre page publique.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field
                icon={<Megaphone size={16} />}
                label="Texte principal"
                value={banner.bannerText}
                onChange={(v) => setBanner({ ...banner, bannerText: v })}
                placeholder="Ex : Offre spéciale printemps 2025"
              />
            </div>
            <div className="sm:col-span-2">
              <Field
                label="Sous-texte / accroche"
                value={banner.bannerSubtext}
                onChange={(v) => setBanner({ ...banner, bannerSubtext: v })}
                placeholder="Ex : Profitez de -20% avec le code SPRING"
              />
            </div>
            <Field
              icon={<Link2 size={16} />}
              label="Lien URL"
              value={banner.bannerLink}
              onChange={(v) => setBanner({ ...banner, bannerLink: v })}
              placeholder="https://votre-site.fr/promo"
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Couleurs</label>
              <div className="flex items-center gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    Fond
                  </span>
                  <input
                    type="color"
                    value={banner.bannerColor}
                    onChange={(e) => setBanner({ ...banner, bannerColor: e.target.value })}
                    className="w-9 h-9 rounded-lg border border-border cursor-pointer block"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    Texte
                  </span>
                  <input
                    type="color"
                    value={banner.bannerTextColor}
                    onChange={(e) => setBanner({ ...banner, bannerTextColor: e.target.value })}
                    className="w-9 h-9 rounded-lg border border-border cursor-pointer block"
                  />
                </div>
                <div className="flex-1 text-xs text-muted-foreground">
                  Fond <code className="font-mono">{banner.bannerColor}</code> · Texte{' '}
                  <code className="font-mono">{banner.bannerTextColor}</code>
                </div>
              </div>
            </div>
          </div>

          {/* ── Aperçu live bannière ── */}
          <div className="pt-2">
            <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
              <Eye size={13} />
              Aperçu en direct
            </p>
            <LivePostcardPreview
              banner={banner}
              logoUrl={logoUrl}
              agencyName={form.name || agency.name}
              primaryColor={form.primaryColor || '#0d9488'}
            />
          </div>
        </div>
      </div>

      {/* ── Banque d'images ── */}
      {agency.imageBank && agency.imageBank.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Banque d&apos;images
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {agency.imageBank.map((item, i) => {
              const img =
                typeof item.image === 'object' && item.image
                  ? (item.image as { url?: string | null })
                  : null
              if (!img?.url) return null
              return (
                <div
                  key={item.id || i}
                  className="aspect-square rounded-lg border border-border overflow-hidden bg-muted"
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </div>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Pour ajouter ou supprimer des images, contactez l&apos;administrateur.
          </p>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleSave}
          disabled={isPending}
          className="bg-teal-600 hover:bg-teal-700 gap-2"
        >
          <Save size={16} />
          {isPending ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
        {message && (
          <p
            className={`text-sm font-medium ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Aperçu live de la bannière sur une mini carte postale
// ---------------------------------------------------------------------------
function LivePostcardPreview({
  banner,
  logoUrl,
  agencyName,
  primaryColor,
}: {
  banner: {
    bannerEnabled: boolean
    bannerText: string
    bannerSubtext: string
    bannerColor: string
    bannerTextColor: string
    bannerLink: string
  }
  logoUrl: string | null | undefined
  agencyName: string
  primaryColor: string
}) {
  const DEMO_IMG = 'https://img.cartepostale.cool/demo/photo-1507525428034-b723cf961d3e.jpg'

  return (
    <div className="rounded-xl overflow-hidden border border-border shadow-md">
      {/* Mini carte simulée */}
      <div className="relative w-full" style={{ aspectRatio: '4/3', maxHeight: '280px' }}>
        {/* Photo de fond */}
        <img
          src={DEMO_IMG}
          alt="Aperçu carte"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Localisation simulée */}
        <div className="absolute bottom-12 left-3 bg-white/90 backdrop-blur text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1 text-stone-700 shadow">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-orange-500"
          >
            <path d="M12 21s-8-5.5-8-11a8 8 0 0 1 16 0c0 5.5-8 11-8 11z" />
            <circle cx="12" cy="10" r="2" />
          </svg>
          Maldives, Atoll Sud
        </div>

        {/* Logo agence simulé */}
        {logoUrl && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full backdrop-blur-sm bg-black/30">
            <img src={logoUrl} alt={agencyName} className="h-4 w-auto object-contain" />
          </div>
        )}

        {/* Bouton retourner simulé */}
        <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[9px] font-black uppercase tracking-widest">
          Retourner la carte
        </div>

        {/* Bannière */}
        <div className="absolute bottom-0 left-0 right-0">
          {banner.bannerText ? (
            <div
              className="flex items-center gap-2 px-3 py-2"
              style={{ backgroundColor: banner.bannerColor }}
            >
              <div className="flex-1 min-w-0">
                <p
                  className="font-bold text-[11px] leading-tight truncate"
                  style={{ color: banner.bannerTextColor }}
                >
                  {banner.bannerText}
                </p>
                {banner.bannerSubtext && (
                  <p
                    className="text-[9px] opacity-85 leading-tight truncate"
                    style={{ color: banner.bannerTextColor }}
                  >
                    {banner.bannerSubtext}
                  </p>
                )}
              </div>
              {banner.bannerLink && (
                <div
                  className="shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full border"
                  style={{
                    borderColor: banner.bannerTextColor,
                    color: banner.bannerTextColor,
                  }}
                >
                  →
                </div>
              )}
            </div>
          ) : (
            <div
              className="px-3 py-2 text-center text-[10px] italic"
              style={{
                backgroundColor: banner.bannerColor + '80',
                color: banner.bannerTextColor,
              }}
            >
              Entrez un texte pour voir la bannière
            </div>
          )}
        </div>
      </div>

      <div className="px-3 py-2 bg-muted/30 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Aperçu de la bannière sur une carte postale</span>
        <span className={banner.bannerEnabled ? 'text-teal-600 font-semibold' : 'text-amber-600'}>
          {banner.bannerEnabled ? '● Active' : '○ Inactive'}
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Composant champ générique
// ---------------------------------------------------------------------------
function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
}: {
  icon?: React.ReactNode
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        {label}
      </label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  )
}
