'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  User,
  Building2,
  Globe,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Save,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { updateUserProfile } from '@/actions/espace-client-actions'
import type { CurrentUser } from '@/lib/auth'

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
)

interface AccountFormProps {
  user: CurrentUser
}

export default function AccountForm({ user }: AccountFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name || '',
    company: user.company || '',
    socials: {
      instagram: user.socials?.instagram || '',
      tiktok: user.socials?.tiktok || '',
      facebook: user.socials?.facebook || '',
      linkedin: user.socials?.linkedin || '',
      twitter: user.socials?.twitter || '',
      youtube: user.socials?.youtube || '',
      website: user.socials?.website || '',
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name.startsWith('socials.')) {
      const socialKey = name.split('.')[1]
      setFormData((prev) => ({
        ...prev,
        socials: {
          ...prev.socials,
          [socialKey as keyof typeof prev.socials]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await updateUserProfile(formData)
      if (result.success) {
        toast.success('Profil mis à jour avec succès')
        router.refresh()
      } else {
        toast.error(result.error || 'Une erreur est survenue')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Une erreur est survenue lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Informations Générales */}
      <section className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 bg-stone-50/50">
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <User className="text-teal-600" size={20} />
            Informations générales
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nom complet</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Votre nom"
                className="pl-10 rounded-xl border-stone-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="company">Société (facultatif)</Label>
            <div className="relative">
              <Building2
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                size={18}
              />
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Nom de votre entreprise"
                className="pl-10 rounded-xl border-stone-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Réseaux Sociaux */}
      <section className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100 bg-stone-50/50">
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <Globe className="text-orange-500" size={20} />
            Présence en ligne
          </h2>
          <p className="text-stone-500 text-xs mt-1">
            Renseignez vos pseudos ou URLs pour vos réseaux sociaux.
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="socials.instagram">Instagram</Label>
              <div className="relative">
                <Instagram
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500"
                  size={18}
                />
                <Input
                  id="socials.instagram"
                  name="socials.instagram"
                  value={formData.socials.instagram}
                  onChange={handleChange}
                  placeholder="@pseudo"
                  className="pl-10 rounded-xl border-stone-200 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="socials.tiktok">TikTok</Label>
              <div className="relative">
                <TikTokIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
                <Input
                  id="socials.tiktok"
                  name="socials.tiktok"
                  value={formData.socials.tiktok}
                  onChange={handleChange}
                  placeholder="@pseudo"
                  className="pl-10 rounded-xl border-stone-200 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="socials.facebook">Facebook</Label>
              <div className="relative">
                <Facebook
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600"
                  size={18}
                />
                <Input
                  id="socials.facebook"
                  name="socials.facebook"
                  value={formData.socials.facebook}
                  onChange={handleChange}
                  placeholder="facebook.com/votre.profil"
                  className="pl-10 rounded-xl border-stone-200 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="socials.linkedin">LinkedIn</Label>
              <div className="relative">
                <Linkedin
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-700"
                  size={18}
                />
                <Input
                  id="socials.linkedin"
                  name="socials.linkedin"
                  value={formData.socials.linkedin}
                  onChange={handleChange}
                  placeholder="linkedin.com/in/votre.profil"
                  className="pl-10 rounded-xl border-stone-200 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="socials.twitter">Twitter (X)</Label>
              <div className="relative">
                <Twitter
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-800"
                  size={18}
                />
                <Input
                  id="socials.twitter"
                  name="socials.twitter"
                  value={formData.socials.twitter}
                  onChange={handleChange}
                  placeholder="@pseudo"
                  className="pl-10 rounded-xl border-stone-200 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="socials.youtube">YouTube</Label>
              <div className="relative">
                <Youtube
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-red-600"
                  size={18}
                />
                <Input
                  id="socials.youtube"
                  name="socials.youtube"
                  value={formData.socials.youtube}
                  onChange={handleChange}
                  placeholder="youtube.com/@votre.chaine"
                  className="pl-10 rounded-xl border-stone-200 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-2 pt-2">
            <Label htmlFor="socials.website">Site Web / Portfolio</Label>
            <div className="relative">
              <Globe
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                size={18}
              />
              <Input
                id="socials.website"
                name="socials.website"
                value={formData.socials.website}
                onChange={handleChange}
                placeholder="https://votre-site.com"
                className="pl-10 rounded-xl border-stone-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end pt-4 pb-10">
        <Button
          type="submit"
          disabled={loading}
          className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8 h-12 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-teal-200/50"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Sauvegarder les modifications
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
