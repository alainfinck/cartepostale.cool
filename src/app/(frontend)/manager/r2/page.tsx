import { listR2Objects } from '@/actions/manager-actions'
import { ManagerR2Client } from './ManagerR2Client'

export const dynamic = 'force-dynamic'

export default async function ManagerR2Page() {
  const initial = await listR2Objects(undefined, 200)
  return <ManagerR2Client initial={initial} />
}
