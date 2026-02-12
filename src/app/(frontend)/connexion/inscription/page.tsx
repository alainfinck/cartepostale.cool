import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { UserPlus, Mail, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
    title: 'Créer un compte',
    description: 'Créez un compte CartePostale.cool pour créer et gérer vos cartes postales.',
}

export default function InscriptionPage() {
    return (
        <div className="bg-[#fdfbf7] min-h-screen py-16 md:py-24 px-4">
            <div className="max-w-md mx-auto">
                <Link href="/connexion" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 text-sm font-medium mb-8">
                    <ArrowLeft size={18} /> Retour à la connexion
                </Link>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-100 text-teal-600 mb-6">
                    <UserPlus size={28} />
                </div>
                <h1 className="text-3xl font-serif font-bold text-stone-800 mb-2">Créer un compte</h1>
                <p className="text-stone-600 mb-8">
                    Pour créer un compte et gérer vos cartes postales, contactez-nous. Nous ouvrons les inscriptions très bientôt.
                </p>
                <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-lg space-y-6">
                    <p className="text-stone-600 text-sm">
                        En attendant, vous pouvez déjà créer des cartes sans compte. La création de compte vous permettra de les retrouver et de les gérer à tout moment.
                    </p>
                    <Link href="/contact">
                        <Button className="w-full h-12 rounded-xl font-bold bg-teal-600 hover:bg-teal-700 text-white inline-flex items-center justify-center gap-2">
                            <Mail size={20} /> Nous contacter
                        </Button>
                    </Link>
                </div>
                <p className="text-center mt-6">
                    <Link href="/editor" className="text-teal-600 hover:text-teal-700 font-medium">
                        Créer une carte sans compte →
                    </Link>
                </p>
            </div>
        </div>
    )
}
