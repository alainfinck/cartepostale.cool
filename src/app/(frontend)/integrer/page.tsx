import { Metadata } from 'next'
import IntegrerClient from './IntegrerClient'

export const metadata: Metadata = {
  title: 'Intégrer une carte postale sur votre site | CartePostale.cool',
  description:
    'Guide d\'intégration : affichez vos cartes postales virtuelles sur votre site ou blog avec un simple code iframe à copier-coller.',
}

export default function IntegrerPage() {
  return <IntegrerClient />
}
