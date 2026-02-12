import { getAllPostcards } from '@/actions/manager-actions'
import ManagerClient from './ManagerClient'

export const metadata = {
    title: 'Manager - CartePostale.cool',
    description: 'Gestion des cartes postales',
}

export const dynamic = 'force-dynamic'

export default async function ManagerPage() {
    const result = await getAllPostcards()

    return <ManagerClient initialData={result} />
}
