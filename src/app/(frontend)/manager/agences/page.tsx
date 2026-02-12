import { getAllAgencies } from '@/actions/manager-actions'
import { ManagerAgenciesClient } from './ManagerAgenciesClient'

export const dynamic = 'force-dynamic'

export default async function ManagerAgencesPage() {
  const result = await getAllAgencies()

  return <ManagerAgenciesClient initialAgencies={result.docs} />
}
