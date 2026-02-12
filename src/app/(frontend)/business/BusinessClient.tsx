import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
    Building2,
    Zap,
    BarChart3,
    Globe2,
    ArrowRight,
    CheckCircle2,
    Briefcase,
    Users2,
    Mail
} from 'lucide-react'

export default function BusinessPage() {
    return (
        <div className="bg-[#fdfbf7] min-h-screen font-sans">
            {/* Hero Section */}
            <section className="relative bg-teal-950 min-h-[600px] flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                        alt="Business Background"
                        className="w-full h-full object-cover opacity-20 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-950 via-teal-900/95 to-teal-800/80"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full text-orange-200 text-sm font-semibold mb-8 border border-white/10">
                            <Building2 size={16} className="text-orange-400" /> B2B Solutions
                        </div>

                        <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8 leading-tight">
                            L&apos;impact émotionnel <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-200 to-amber-200">au service de votre marque.</span>
                        </h1>

                        <p className="text-teal-50 text-xl mb-10 leading-relaxed max-w-2xl font-light">
                            Transformez vos relations clients grâce à l&apos;envoi automatisé de cartes postales physiques premium.
                            Le meilleur du digital combiné à l&apos;authenticité du papier.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-7 rounded-full text-lg font-semibold transition-all shadow-lg shadow-orange-900/20 flex items-center gap-2"
                            >
                                Parler à un expert <ArrowRight size={20} />
                            </Button>
                            <Button
                                variant="outline"
                                className="bg-transparent border-white/20 text-white hover:bg-white/10 px-8 py-7 rounded-full text-lg font-semibold transition-all flex items-center gap-2"
                            >
                                Voir les tarifs
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Value Proposition Grid */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto -mt-20 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <Zap className="w-8 h-8 text-orange-500" />,
                            title: "Automatisation Intelligente",
                            desc: "Connectez votre CRM (Salesforce, HubSpot) ou utilisez notre API pour déclencher des envois basés sur des événements clés."
                        },
                        {
                            icon: <Globe2 className="w-8 h-8 text-teal-500" />,
                            title: "Réseau Global",
                            desc: "Impression et expédition depuis nos centres partenaires dans 30+ pays. Délais réduits, empreinte carbone minimisée."
                        },
                        {
                            icon: <BarChart3 className="w-8 h-8 text-purple-500" />,
                            title: "Tracking & Analytics",
                            desc: "Suivez chaque envoi en temps réel. QR codes dynamiques pour mesurer le ROI et l'engagement de vos campagnes."
                        }
                    ].map((feature, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-100 hover:transform hover:-translate-y-1 transition-all duration-300">
                            <div className="bg-stone-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-serif font-bold text-stone-800 mb-3">{feature.title}</h3>
                            <p className="text-stone-600 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Use Cases Section */}
            <section className="py-20 bg-stone-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-teal-900 mb-4">Pour chaque industrie</h2>
                        <p className="text-lg text-stone-600">Nos solutions s&apos;adaptent à votre secteur pour maximiser l&apos;impact.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            {[
                                {
                                    title: "Agences de Voyage & Tourisme",
                                    desc: "Envoyez un souvenir physique après le voyage pour encourager les avis positifs et la fidélisation.",
                                    icon: <Globe2 size={24} />
                                },
                                {
                                    title: "Immobilier",
                                    desc: "Féliicitez vos clients pour leur nouvel achat ou prospectez un quartier avec des cartes ultra-personnalisées.",
                                    icon: <Building2 size={24} />
                                },
                                {
                                    title: "E-commerce & DNVB",
                                    desc: "Remerciez vos meilleurs clients ou réactivez les paniers abandonnés avec une offre tangible.",
                                    icon: <Users2 size={24} />
                                }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-6 group">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-stone-800 mb-2">{item.title}</h3>
                                        <p className="text-stone-600">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white p-2 rounded-2xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                            <img
                                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
                                alt="Meeting"
                                className="rounded-xl w-full"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing / CTA Strip */}
            <section className="py-20 bg-teal-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Prêt à marquer les esprits ?</h2>
                    <p className="text-teal-100 text-lg mb-10 max-w-2xl mx-auto">
                        Rejoignez plus de 500 entreprises qui utilisent notre plateforme pour créer des liens durables.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 rounded-full text-lg h-auto shadow-lg shadow-orange-900/30">
                            Créer un compte professionnel
                        </Button>
                        <Button variant="ghost" className="text-white hover:bg-white/10 px-8 py-6 rounded-full text-lg h-auto border border-white/20">
                            Contacter l&apos;équipe commerciale
                        </Button>
                    </div>
                    <p className="mt-6 text-sm text-teal-300 opacity-80">
                        Aucune carte de crédit requise pour commencer • 10 envois offerts
                    </p>
                </div>
            </section>
        </div>
    )
}
