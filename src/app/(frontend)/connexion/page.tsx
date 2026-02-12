import React from 'react'
import { Metadata } from 'next'
import ConnexionClient from './ConnexionClient'

export const metadata: Metadata = {
    title: 'Connexion',
    description: 'Connectez-vous à votre compte CartePostale.cool pour gérer vos cartes postales.',
}

export default function ConnexionPage() {
    return <ConnexionClient />
}
