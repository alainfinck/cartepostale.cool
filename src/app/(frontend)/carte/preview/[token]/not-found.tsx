import Link from 'next/link'
import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PreviewExpiredNotFound() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col items-center justify-center px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
          <Clock size={32} className="text-amber-600" />
        </div>
        <h1 className="text-xl font-serif font-bold text-stone-800">
          Lien d&apos;aperçu expiré
        </h1>
        <p className="text-stone-600">
          Ce lien était valide 5 minutes. Retournez dans l&apos;éditeur et cliquez à nouveau sur
          « Voir comme un destinataire » pour générer un nouvel aperçu. Le lien définitif sera
          activé après paiement.
        </p>
        <Link href="/editor">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white">
            Retour à l&apos;éditeur
          </Button>
        </Link>
      </div>
    </div>
  )
}
