import React, { Suspense } from 'react'
import { Metadata } from 'next'
import ConnexionClient from './ConnexionClient'

export const metadata: Metadata = {
    title: 'Connexion',
    description: 'Connectez-vous à votre compte CartePostale.cool pour gérer vos cartes postales.',
}

export default function ConnexionPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center">Chargement...</div>}>
            <ConnexionClient />
        </Suspense>
    )
}
