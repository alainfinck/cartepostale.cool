
import React from 'react'
import { Metadata } from 'next'
import { Check, X, Star, Zap, Globe, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Tarifs et Abonnements',
    description: 'Choisissez le plan qui vous correspond. Envoyez des cartes postales à l\'unité ou profitez de tarifs réduits avec nos abonnements.',
}

const pricingPlans = [
    {
        name: 'Gratuit',
        price: '0€',
        period: '',
        description: 'Carte gratuite mais limitée pour découvrir le service.',
        features: [
            '1 carte offerte',
            'Version numérique uniquement',
            'Album photo (3 photos max)',
        ],
        notIncluded: [
            'Impression et expédition',
            'Vidéo dans l\'album',
            'Suivi de l\'envoi',
        ],
        buttonText: 'Essayer gratuitement',
        buttonVariant: 'outline',
        href: '/editor',
        popular: false,
        icon: <Gift className="w-6 h-6 text-teal-500" />
    },
    {
        name: 'Occasionnel',
        price: '2.99€',
        period: '/ carte',
        description: 'Parfait pour envoyer une carte de temps en temps.',
        features: [
            'Album photo (10 photos max + 1 vidéo)',
            'Impression haute qualité',
            'Expédition monde incluse',
            'Personnalisation complète',
            'Suivi de l\'envoi',
        ],
        notIncluded: [
            'Tarifs réduits',
            'Envois en masse',
            'Support prioritaire'
        ],
        buttonText: 'Envoyer une carte',
        buttonVariant: 'outline',
        href: '/editor',
        popular: false,
        icon: <Globe className="w-6 h-6 text-stone-500" />
    },
    {
        name: 'Voyageur',
        price: '9.99€',
        period: '/ mois',
        description: 'Pour les amoureux du voyage et des souvenirs.',
        features: [
            '5 cartes incluses / mois',
            'Carte suppl. à 1.99€',
            'Tout ce qui est dans Occasionnel',
            'Carnet d\'adresses illimité',
            'Historique complet',
            'Badge "Voyageur" sur votre profil'
        ],
        notIncluded: [
            'Envoi API',
        ],
        buttonText: 'Commencer l\'essai gratuit',
        buttonVariant: 'default',
        href: '/register?plan=traveler',
        popular: true,
        icon: <Star className="w-6 h-6 text-orange-500" />
    },
    {
        name: 'Pro & Agence',
        price: 'Sur devis',
        period: '',
        description: 'Solutions marketing et automation pour entreprises.',
        features: [
            'Volume illimité',
            'Tarifs dégressifs',
            'API d\'envoi automatisé',
            'White-label (Marque blanche)',
            'Campagnes marketing',
            'Support dédié 24/7'
        ],
        notIncluded: [],
        buttonText: 'Contacter l\'équipe Pro',
        buttonVariant: 'outline',
        href: '/contact',
        popular: false,
        icon: <Zap className="w-6 h-6 text-teal-600" />
    }
]

export default function PricingPage() {
    return (
        <div className="bg-[#fdfbf7] min-h-screen py-24">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-6">
                    Des souvenirs, <span className="text-orange-500">au juste prix</span>
                </h1>
                <p className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
                    Que vous soyez un voyageur occasionnel ou une agence de communication, nous avons la formule adaptée à vos besoins.
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
                    {pricingPlans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative bg-white rounded-2xl shadow-xl border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${plan.popular ? 'border-orange-500 ring-4 ring-orange-500/10 z-10 scale-105' : 'border-stone-100'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                                    Recommandé
                                </div>
                            )}

                            <div className="p-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`p-2 rounded-lg ${plan.popular ? 'bg-orange-100' : 'bg-stone-100'}`}>
                                        {plan.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-stone-800">{plan.name}</h3>
                                </div>

                                <div className="flex items-baseline mb-6">
                                    <span className="text-4xl font-extrabold text-stone-900">{plan.price}</span>
                                    <span className="text-stone-500 ml-2 font-medium">{plan.period}</span>
                                </div>

                                <p className="text-stone-600 mb-8 min-h-[50px]">{plan.description}</p>

                                <Link href={plan.href} className="block mb-8">
                                    <Button
                                        className={`w-full py-6 text-lg font-bold rounded-xl transition-all ${plan.popular
                                                ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-orange-500/30'
                                                : 'bg-white hover:bg-stone-50 text-stone-800 border-2 border-stone-200 hover:border-stone-300'
                                            }`}
                                    >
                                        {plan.buttonText}
                                    </Button>
                                </Link>

                                <div className="space-y-4">
                                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Inclus</p>
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center mt-0.5">
                                                <Check className="w-3 h-3 text-teal-600" strokeWidth={3} />
                                            </div>
                                            <span className="text-stone-700 text-sm font-medium">{feature}</span>
                                        </div>
                                    ))}

                                    {plan.notIncluded.length > 0 && (
                                        <>
                                            <div className="h-px bg-stone-100 my-4"></div>
                                            {plan.notIncluded.map((feature, i) => (
                                                <div key={i} className="flex items-start gap-3 opacity-50">
                                                    <X className="w-5 h-5 text-stone-400" />
                                                    <span className="text-stone-500 text-sm">{feature}</span>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQ Teaser */}
            <div className="max-w-3xl mx-auto px-4 mt-24 text-center">
                <h2 className="text-2xl font-bold text-stone-800 mb-4">Des questions ?</h2>
                <p className="text-stone-600 mb-8">
                    Notre équipe est là pour vous aider à choisir la meilleure solution pour vos besoins.
                </p>
                <Link href="/contact" className="text-teal-600 font-bold hover:text-teal-700 underline underline-offset-4">
                    Contacter le support
                </Link>
            </div>
        </div>
    )
}
