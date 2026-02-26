import { redirect } from 'next/navigation'

/**
 * Redirige vers une démo si aucun slug n’est fourni.
 */
export default async function CardRootPage() {
  redirect('/card/TP0T')
}
