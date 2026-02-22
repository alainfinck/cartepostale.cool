'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { getSettings, updateSettings } from '@/actions/settings-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'

export default function SettingsPage() {
  const [exitIntentEnabled, setExitIntentEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    getSettings().then((settings) => {
      if (settings) {
        setExitIntentEnabled(settings.exitIntentEnabled ?? true)
      }
      setIsLoading(false)
    })
  }, [])

  const handleSave = () => {
    startTransition(async () => {
      try {
        const result = await updateSettings({ exitIntentEnabled })
        if (result.success) {
          toast.success('Réglages enregistrés')
        }
      } catch (error) {
        toast.error('Erreur lors de l’enregistrement')
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-stone-900">Réglages</h1>
        <p className="text-stone-500">Configurez les paramètres globaux du site.</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Marketing & Popups</CardTitle>
            <CardDescription>
              Gérez les éléments interactifs destinés à la conversion.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2 p-4 rounded-xl bg-stone-50 border border-stone-100">
              <div className="space-y-0.5">
                <Label htmlFor="exit-intent" className="text-base font-bold text-stone-800">
                  Modal "Carte Pro Gratuite"
                </Label>
                <p className="text-sm text-stone-500">
                  Affiche un popup quand l'utilisateur s'apprête à quitter la page.
                </p>
              </div>
              <Switch
                id="exit-intent"
                checked={exitIntentEnabled}
                onCheckedChange={setExitIntentEnabled}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="bg-teal-600 hover:bg-teal-700 text-white gap-2 h-12 px-8 rounded-xl font-bold transition-all active:scale-95"
          >
            {isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </div>
      </div>
    </div>
  )
}
