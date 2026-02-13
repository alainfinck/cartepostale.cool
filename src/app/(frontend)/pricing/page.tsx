
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
        description: 'Carte 100% virtuelle pour découvrir le service.',
        features: [
            '1 carte offerte',
            'Version numérique uniquement',
            'Optimisation Mobile & Cloud',
            'Images Auto-Optimisées (WebP)',
            'Album photo (3 photos max)',
            'Filigrane discret'
        ],
        notIncluded: [
            'Haute résolution (HD)',
            'Vidéo dans l\'album',
            'Zéro publicité',
        ],
        buttonText: 'Essayer gratuitement',
        buttonVariant: 'outline',
        href: '/editor',
        popular: false,
        icon: <Gift className="w-6 h-6 text-teal-500" />
    },
    {
        name: 'Occasionnel',
        price: '1.99€',
        period: '/ carte',
        description: 'Pour une carte premium sans publicité.',
        features: [
            'Vitesse Éclair (AVIF/WebP)',
            'Album photo (10 photos max + 1 vidéo)',
            'Haute résolution (HD)',
            'Expédition virtuelle instantanée',
            'Personnalisation complète',
            'Livre d\'or interactif',
            'Zéro publicité'
        ],
        notIncluded: [
            'Tarifs dégressifs',
            'Envois groupés',
            'Support prioritaire'
        ],
        buttonText: 'Envoyer une carte',
        buttonVariant: 'outline',
        href: '/editor',
        popular: true,
        icon: <Globe className="w-6 h-6 text-stone-500" />
    },
    {
        name: 'Voyageur',
        price: '9.99€',
        period: '/ mois',
        description: 'Pour les amoureux du partage et des souvenirs.',
        features: [
            '10 cartes incluses / mois',
            'Carte suppl. à 0.99€',
            'Tout ce qui est dans Occasionnel',
            'Musique d\'ambiance premium',
            'Historique illimité',
            'Badge "Voyageur" sur votre profil'
        ],
        notIncluded: [
            'Envoi API / Pro',
        ],
        buttonText: 'Commencer l\'abonnement',
        buttonVariant: 'default',
        href: '/register?plan=traveler',
        popular: false,
        icon: <Star className="w-6 h-6 text-orange-500" />
    },
]

const enterprisePlan = {
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
    buttonText: 'Contacter l\'équipe Pro',
    href: '/contact',
    icon: <Zap className="w-6 h-6 text-teal-600" />
}

export default function PricingPage() {
    return (
        <div className="bg-[#fdfbf7] min-h-screen py-24 pb-32">
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-6">
                    Des souvenirs, <span className="text-orange-500">au juste prix</span>
                </h1>
                <p className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
                    Que vous soyez un voyageur occasionnel ou un grand voyageur, nous avons la formule adaptée à vos besoins.
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    {pricingPlans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative bg-white rounded-2xl shadow-xl border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col ${plan.popular ? 'border-orange-500 ring-4 ring-orange-500/10 z-10 scale-105' : 'border-stone-100'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                                    Recommandé
                                </div>
                            )}

                            <div className="p-8 flex flex-col h-full">
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

                                <div className="flex-grow">
                                    <div className="space-y-4 mb-8">
                                        <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Inclus</p>
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

                                <Link href={plan.href} className="mt-auto">
                                    <Button
                                        className={`w-full py-6 text-lg font-bold rounded-xl transition-all ${plan.popular
                                            ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-orange-500/30'
                                            : 'bg-white hover:bg-stone-50 text-stone-800 border-2 border-stone-200 hover:border-stone-300'
                                            }`}
                                    >
                                        {plan.buttonText}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Enterprise Block */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-stone-900 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <Zap className="w-48 h-48 text-teal-500 rotate-12" />
                    </div>

                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                        <div className="flex-1 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 text-teal-400 text-sm font-bold uppercase tracking-wider mb-6">
                                <Zap className="w-4 h-4" />
                                Solutions Entreprises
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                                {enterprisePlan.name}
                            </h2>
                            <p className="text-stone-400 text-lg mb-8 max-w-xl">
                                {enterprisePlan.description} Nos experts vous accompagnent pour créer des expériences mémorables à grande échelle.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                {enterprisePlan.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center">
                                            <Check className="w-4 h-4 text-teal-400" />
                                        </div>
                                        <span className="text-stone-300 font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex-shrink-0 bg-stone-800/50 backdrop-blur-sm border border-stone-700/50 rounded-2xl p-8 w-full lg:w-80 text-center">
                            <div className="text-stone-400 mb-2 uppercase tracking-widest text-sm font-bold">À partir de</div>
                            <div className="text-4xl font-extrabold text-white mb-8">{enterprisePlan.price}</div>
                            <Link href="/business">
                                <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white py-6 text-lg font-bold rounded-xl shadow-lg shadow-teal-500/20">
                                    En savoir plus
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ Teaser */}
            <div className="max-w-3xl mx-auto px-4 mt-24 text-center">
                <h2 className="text-2xl font-bold text-stone-800 mb-4">Besoin d'aide ?</h2>
                <p className="text-stone-600 mb-8">
                    Que vous ayez une question technique ou besoin d'un devis personnalisé, nous sommes à votre écoute.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/contact" className="px-8 py-3 bg-white border border-stone-200 rounded-full font-bold text-stone-700 hover:bg-stone-50 transition-colors">
                        Contacter le support
                    </Link>
                </div>
            </div>
        </div>
    )
}

