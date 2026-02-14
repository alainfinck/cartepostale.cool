import { getAllAgencies, getAgencyUsersMap } from '@/actions/manager-actions'
import { ManagerAgenciesClient } from './ManagerAgenciesClient'

export const dynamic = 'force-dynamic'

export default async function ManagerAgencesPage() {
  const [agenciesResult, agencyUsersMap] = await Promise.all([
    getAllAgencies(),
    getAgencyUsersMap(),
  ])

  return (
    <ManagerAgenciesClient
      initialAgencies={agenciesResult.docs}
      initialAgencyUsers={agencyUsersMap}
    />
  )
}
