import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { ManagerShell } from './ManagerShell'

export const dynamic = 'force-dynamic'

/**
 * Interface privée admin à /manager.
 * Réservée aux utilisateurs avec role === 'admin'.
 */
export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/connexion')
  if (user.role !== 'admin') redirect('/')

  return <ManagerShell>{children}</ManagerShell>
}
