import { redirect } from 'next/navigation'

/**
 * Redirige vers la page connexion avec la carte retournée sur le formulaire d'inscription.
 */
export default function InscriptionPage() {
  redirect('/connexion?inscription=1')
}
