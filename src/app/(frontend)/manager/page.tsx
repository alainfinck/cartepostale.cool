import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * Redirection : /manager pointe vers l'espace client > Mes cartes.
 * Les utilisateurs non connectés sont renvoyés vers la connexion.
 */
export default async function ManagerPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/connexion')
  redirect('/espace-client/cartes')
}
