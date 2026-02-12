import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Créer un compte',
  description: 'Créez un compte CartePostale.cool pour gérer vos cartes postales.',
}

export default function InscriptionLayout({ children }: { children: React.ReactNode }) {
  return children
}
