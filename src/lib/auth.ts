import { headers } from 'next/headers'
import type { User } from '@/payload-types'

export type CurrentUser = Pick<User, 'id' | 'email' | 'name' | 'role' | 'plan' | 'company' | 'cardsCreated'> & {
  agency?: number | null
}

/**
 * Returns the currently logged-in user from Payload (cookie).
 * Returns null if not authenticated. Use in Server Components / server actions.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const headersList = await headers()
  const cookie = headersList.get('cookie') ?? ''
  const host = headersList.get('host') ?? 'localhost:3000'
  const proto = headersList.get('x-forwarded-proto') ?? 'http'
  const base = `${proto}://${host}`

  try {
    const res = await fetch(`${base}/api/users/me`, {
      headers: { cookie },
      cache: 'no-store',
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data?.user) return null
    const u = data.user as User
    const agencyRaw = (u as any).agency
    const agencyId = typeof agencyRaw === 'object' && agencyRaw ? agencyRaw.id : (typeof agencyRaw === 'number' ? agencyRaw : null)
    return {
      id: u.id,
      email: u.email,
      name: u.name ?? null,
      role: u.role,
      plan: u.plan ?? null,
      company: u.company ?? null,
      cardsCreated: u.cardsCreated ?? null,
      agency: agencyId,
    }
  } catch {
    return null
  }
}
