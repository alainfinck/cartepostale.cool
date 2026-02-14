
import React from 'react'
import { Metadata } from 'next'
import { Check, X, Star, Zap, Globe, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Tarifs et Abonnements',
    description: 'Choisissez le plan qui vous correspond. Envoyez des cartes postales à l\'unité ou profitez de tarifs réduits avec nos abonnements.',
}

type PricingPlan = {
    name: string
    subtitle?: string
    price: string
    period: string
    description: string
    features: string[]
    notIncluded: string[]
    buttonText: string
    buttonVariant: 'outline' | 'default'
    href: string
    popular: boolean
    icon: React.ReactNode
}

const pricingPlans: PricingPlan[] = [
    {
        name: 'La "Découverte"',
        subtitle: 'Gratuit',
        price: '0€',
        period: '',
        description: 'Faire connaître le site et tester l\'outil sans friction.',
        features: [
            '1 seule photo : mise en page classique "carte postale"',
            'Texte limité : nombre de caractères restreint (type tweet)',
            'Partage direct : lien public (URL) ou bouton de partage social',
            'Effets visuels : confettis ou neige à l\'ouverture',
            'Durée de vie : carte expirée après 7 jours'
        ],
        notIncluded: [
            'Multi-photos / collage',
            'Haute résolution (HD)',
            'Carte vidéo ou audio'
        ],
        buttonText: 'Essayer gratuitement',
        buttonVariant: 'outline',
        href: '/editor',
        popular: false,
        icon: <Gift className="w-6 h-6 text-green-500" />
    },
    {
        name: 'La "Personnalisée"',
        subtitle: 'Par carte',
        price: '2,99€',
        period: '/ carte',
        description: 'Offrir un souvenir propre, esthétique et durable pour un usage personnel.',
        features: [
            'Multi-photos (pêle-mêle) : jusqu\'à 4 ou 6 photos',
            'Personnalisation avancée : police, couleur du papier, stickers',
            'Téléchargement HD (recto/verso) pour impression',
            'Lien permanent (à vie ou au moins 1 an)'
        ],
        notIncluded: [
            'Carte postale vidéo',
            'Message vocal / audio',
            'Protection par mot de passe'
        ],
        buttonText: 'Choisir cette option',
        buttonVariant: 'outline',
        href: '/editor',
        popular: true,
        icon: <Globe className="w-6 h-6 text-teal-500" />
    },
    {
        name: 'L\'"Augmentée"',
        subtitle: 'Cadeau numérique',
        price: '4,99€',
        period: '/ carte',
        description: 'Créer une véritable émotion : plus qu\'une image, un cadeau numérique.',
        features: [
            'Carte postale vidéo (30 s) au retournement (effet "Harry Potter")',
            'Audio souvenir : message vocal ou musique d\'ambiance',
            'Le "Secret" : mot de passe ou question secrète',
            'Livre d\'or interactif (réponse du destinataire)',
            'Notification de lecture (email à l\'expéditeur)',
        ],
        notIncluded: [
            'Volume illimité',
            'API / Pro'
        ],
        buttonText: 'Choisir cette option',
        buttonVariant: 'outline',
        href: '/editor',
        popular: false,
        icon: <Star className="w-6 h-6 text-purple-500" />
    },
    {
        name: 'Voyageur',
        subtitle: 'Abonnement',
        price: '9,99€',
        period: '/ mois',
        description: 'Pour les amoureux du partage et des souvenirs réguliers.',
        features: [
            '10 cartes incluses / mois',
            'Carte suppl. à 0,99€',
            'Tout ce qui est dans La Personnalisée',
            'Musique d\'ambiance premium',
            'Historique illimité',
            'Badge « Voyageur » sur votre profil'
        ],
        notIncluded: [
            'Envoi API / Pro'
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
        'Gros volumes',
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6 items-stretch">
                    {pricingPlans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative bg-white rounded-2xl shadow-xl border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col ${plan.popular ? 'border-teal-500 ring-4 ring-teal-500/10 z-10 lg:scale-105' : 'border-stone-100'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                                    Recommandé
                                </div>
                            )}

                            <div className="p-6 flex flex-col h-full">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-2 rounded-lg shrink-0 ${plan.popular ? 'bg-teal-100' : 'bg-stone-100'}`}>
                                        {plan.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-stone-800 leading-tight">{plan.name}</h3>
                                        {plan.subtitle && (
                                            <p className="text-xs text-stone-500 font-medium mt-0.5">{plan.subtitle}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-baseline mb-4">
                                    <span className="text-3xl font-extrabold text-stone-900">{plan.price}</span>
                                    <span className="text-stone-500 ml-2 font-medium text-sm">{plan.period}</span>
                                </div>

                                <p className="text-stone-600 mb-4 text-sm leading-snug">{plan.description}</p>

                                <div className="flex-grow">
                                    <div className="space-y-3 mb-6">
                                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Inclus</p>
                                        {plan.features.map((feature, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <div className="flex-shrink-0 w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center mt-0.5">
                                                    <Check className="w-2.5 h-2.5 text-teal-600" strokeWidth={3} />
                                                </div>
                                                <span className="text-stone-700 text-xs font-medium leading-snug">{feature}</span>
                                            </div>
                                        ))}

                                        {plan.notIncluded.length > 0 && (
                                            <>
                                                <div className="h-px bg-stone-100 my-4"></div>
                                                {plan.notIncluded.map((feature, i) => (
                                                    <div key={i} className="flex items-start gap-2 opacity-50">
                                                        <X className="w-4 h-4 text-stone-400 shrink-0" />
                                                        <span className="text-stone-500 text-xs">{feature}</span>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </div>

                                <Link href={plan.href} className="mt-auto">
                                    <Button
                                        className={`w-full py-4 text-sm font-bold rounded-xl transition-all ${plan.popular
                                            ? 'bg-teal-500 hover:bg-teal-600 text-white shadow-lg hover:shadow-teal-500/30'
                                            : plan.buttonVariant === 'default'
                                                ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg'
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

