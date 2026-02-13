 'use client'
 
import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
    Building2,
    Zap,
    Globe2,
    ArrowRight,
    Palette,
    Database,
    ImageIcon,
    Users2,
    BarChart3,
    Trophy,
    Percent,
    Eye,
    CheckCircle2,
    LayoutDashboard,
    Compass
} from 'lucide-react'
import { getOptimizedImageUrl } from '@/lib/image-processing'
import { motion, easeOut } from 'framer-motion'

export default function BusinessClient() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: easeOut
            }
        }
    }

    return (
        <div className="bg-[#fdfbf7] min-h-screen font-sans selection:bg-teal-100">
            {/* Hero Section */}
            <section className="relative bg-[#061e1e] min-h-[85vh] flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={getOptimizedImageUrl("/images/demo/photo-1486406146926-c627a92ad1ab.jpg", { width: 1920 })}
                        alt="Business Background"
                        className="w-full h-full object-cover opacity-30 mix-blend-overlay scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-teal-950/40 via-teal-950/80 to-[#061e1e]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="max-w-4xl"
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full text-teal-200 text-sm font-bold mb-8 border border-white/10 shadow-2xl">
                            <Zap size={16} className="text-orange-400" /> SOLUTIONS POUR LE TOURISME & ENTREPRISES
                        </motion.div>

                        <motion.h1 variants={itemVariants} className="text-5xl md:text-8xl font-serif font-bold text-white mb-8 leading-[1.1] tracking-tight">
                            Faites rayonner <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-amber-200 to-teal-200">votre destination.</span>
                        </motion.h1>

                        <motion.p variants={itemVariants} className="text-teal-50/80 text-xl md:text-2xl mb-12 leading-relaxed max-w-2xl font-light">
                            Offrez à vos visiteurs une expérience mémorable. Une banque d'images pro, votre branding sur chaque carte, et des statistiques en temps réel. Simple, puissant, élégant.
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6">
                            <Button
                                asChild
                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white px-10 py-8 rounded-2xl text-xl font-bold transition-all shadow-2xl shadow-orange-950/40 flex items-center gap-3 border-0"
                            >
                                <Link href="/contact">Démarrer maintenant <ArrowRight size={24} /></Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="bg-white/5 backdrop-blur-md border-white/20 text-white hover:bg-white/10 px-10 py-8 rounded-2xl text-xl font-bold transition-all flex items-center gap-3"
                            >
                                <Link href="/pricing">Voir les tarifs</Link>
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Core Features Grid */}
            <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="absolute -inset-4 bg-orange-100 rounded-[40px] rotate-2 -z-10 blur-2xl opacity-50"></div>
                        <div className="bg-white rounded-[40px] p-2 shadow-2xl overflow-hidden border border-stone-100">
                            <img
                                src={getOptimizedImageUrl("/images/demo/photo-1502602898657-3e91760cbb34.jpg", { width: 1000 })}
                                alt="Image Bank Preview"
                                className="rounded-[36px] w-full"
                            />
                        </div>
                        <div className="absolute -bottom-10 -right-10 bg-white p-6 rounded-3xl shadow-2xl border border-stone-100 hidden md:block max-w-[240px]">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
                                    <ImageIcon size={20} />
                                </div>
                                <span className="font-bold text-stone-800">Banque d'images</span>
                            </div>
                            <p className="text-sm text-stone-500 leading-relaxed">Mettez à disposition vos plus beaux clichés pour vos visiteurs.</p>
                        </div>
                    </motion.div>

                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest">
                            Photothèque Locale
                        </div>
                        <h2 className="text-4xl md:text-6xl font-serif font-bold text-stone-900 leading-tight">
                            Vos photos, leurs souvenirs.
                        </h2>
                        <p className="text-xl text-stone-600 leading-relaxed">
                            Alimentez une banque d'images exclusive pour votre territoire ou établissement. Vos visiteurs peuvent choisir parmi vos clichés professionnels pour créer leurs cartes, garantissant une esthétique parfaite pour chaque envoi.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="text-teal-500 mt-1 flex-shrink-0" />
                                <span className="font-bold text-stone-700">Contrôle éditorial total</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="text-teal-500 mt-1 flex-shrink-0" />
                                <span className="font-bold text-stone-700">Mise en avant du patrimoine</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center flex-row-reverse">
                    <div className="order-2 lg:order-1 space-y-8">
                        <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest">
                            Co-Branding Automatique
                        </div>
                        <h2 className="text-4xl md:text-6xl font-serif font-bold text-stone-900 leading-tight">
                            Votre logo <br />sur chaque carte.
                        </h2>
                        <p className="text-xl text-stone-600 leading-relaxed">
                            Renforcez votre image de marque sans effort. Votre logo et votre identité visuelle sont automatiquement intégrés sur toutes les cartes créées via votre espace, qu'elles utilisent vos photos ou celles des visiteurs.
                        </p>
                        <div className="bg-stone-50 p-8 rounded-3xl border border-stone-100">
                            <p className="text-stone-500 italic text-lg whitespace-pre-line">
                                "Une visibilité organique exceptionnelle : chaque carte postale devient une ambassadrice de votre marque auprès de l'entourage de vos visiteurs."
                            </p>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="order-1 lg:order-2 relative"
                    >
                        <div className="absolute -inset-4 bg-teal-100 rounded-[40px] -rotate-2 -z-10 blur-2xl opacity-50"></div>
                        <div className="bg-stone-900 rounded-[40px] p-8 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Palette size={200} className="text-white" />
                            </div>
                            <div className="relative z-10 text-center text-white">
                                <div className="w-24 h-24 bg-white rounded-3xl mb-6 mx-auto flex items-center justify-center shadow-xl">
                                    <span className="text-teal-900 font-serif font-black text-2xl">VOTRE LOGO</span>
                                </div>
                                <h3 className="text-2xl font-serif font-bold mb-2">Signature Visuelle</h3>
                                <p className="text-teal-200/60 uppercase tracking-widest text-xs font-bold">Intégration Marque Blanche</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="py-32 bg-[#0a1515] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-full h-full bg-teal-500/10 rounded-full blur-[120px]"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-24">
                        <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full text-teal-300 text-sm font-black uppercase tracking-widest mb-6 border border-white/10">
                            <BarChart3 size={16} /> Analytics & Insights
                        </div>
                        <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8">Pilotez votre impact.</h2>
                        <p className="text-xl text-teal-200/70 leading-relaxed">
                            Accédez à un tableau de bord complet pour mesurer l'engagement. Suivez le nombre de cartes envoyées, les photos les plus populaires et la portée géographique de votre destination.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[32px] border border-white/10 group hover:bg-white/10 transition-all">
                            <div className="w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center mb-8 text-teal-400 group-hover:scale-110 transition-transform">
                                <LayoutDashboard size={32} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Stats de diffusion</h3>
                            <p className="text-teal-100/60 leading-relaxed">Nombre de cartes envoyées par jour, mois ou événement spécifique.</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[32px] border border-white/10 group hover:bg-white/10 transition-all">
                            <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-8 text-orange-400 group-hover:scale-110 transition-transform">
                                <Eye size={32} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Photos populaires</h3>
                            <p className="text-teal-100/60 leading-relaxed">Identifiez les visuels qui plaisent le plus à vos visiteurs pour vos futures campagnes.</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[32px] border border-white/10 group hover:bg-white/10 transition-all">
                            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-8 text-purple-400 group-hover:scale-110 transition-transform">
                                <Users2 size={32} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Portée Sociale</h3>
                            <p className="text-teal-100/60 leading-relaxed">Estimez le nombre de personnes ayant découvert votre destination grâce aux cartes.</p>
                        </div>
                    </div>

                    <div className="mt-20 p-8 rounded-[32px] bg-gradient-to-r from-teal-900/40 to-transparent border border-white/5 flex flex-col md:flex-row items-center gap-6 justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-500/20 rounded-full text-red-400">
                                <span className="block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            </div>
                            <p className="text-teal-100/80 font-medium">Le contenu des cartes reste 100% privé et sécurisé pour vos utilisateurs.</p>
                        </div>
                        <Link href="/contact" className="text-orange-400 font-bold hover:text-orange-300 transition-colors flex items-center gap-2">
                            En savoir plus sur la protection des données <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Marketing & Coupons Section */}
            <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest">
                            Marketing Direct
                        </div>
                        <h2 className="text-4xl md:text-6xl font-serif font-bold text-stone-900 leading-tight">
                            Convertissez <br />les destinataires.
                        </h2>
                        <p className="text-xl text-stone-600 leading-relaxed">
                            Transformez chaque carte en opportunité de vente. Insérez des offres promotionnelles ou des bons de réduction exclusifs (codes promo, QR codes) visibles uniquement par ceux qui reçoivent la carte.
                        </p>
                        <ul className="space-y-6">
                            {[
                                { title: "Offres personnalisées", icon: <Percent size={20} className="text-purple-500" /> },
                                { title: "Bons de réduction traçables", icon: <Trophy size={20} className="text-purple-500" /> },
                                { title: "Call-to-action dynamique", icon: <ArrowRight size={20} className="text-purple-500" /> }
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="p-2 bg-purple-50 rounded-lg">
                                        {item.icon}
                                    </div>
                                    <span className="font-bold text-stone-800 text-lg">{item.title}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="absolute -inset-10 bg-gradient-to-br from-purple-100 to-teal-100 rounded-full blur-[100px] opacity-30"></div>
                        <div className="relative bg-white p-12 rounded-[48px] shadow-2xl border border-stone-100 overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-[100px]"></div>
                            <div className="w-16 h-1 bg-purple-500 mb-8"></div>
                            <h3 className="text-3xl font-serif font-bold text-stone-900 mb-4">Offre Spéciale Visitors</h3>
                            <p className="text-stone-500 text-lg mb-8 italic leading-relaxed">
                                "Bonjour ! Profitez de -15% sur votre prochaine visite avec le code"
                            </p>
                            <div className="bg-stone-50 border-2 border-dashed border-stone-200 p-6 rounded-2xl text-center mb-8 group-hover:border-purple-300 transition-colors">
                                <span className="text-3xl font-black text-stone-800 tracking-[0.2em] font-mono">EXPLORE25</span>
                            </div>
                            <Button className="w-full bg-stone-900 hover:bg-black text-white py-6 rounded-xl font-bold flex items-center justify-center gap-2">
                                Réserver mon activité <Compass size={20} />
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Testimonials / Trust */}
            <section className="py-32 bg-stone-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-serif font-bold text-stone-400 uppercase tracking-[0.3em] mb-16">Ils nous font confiance</h2>
                    <div className="flex flex-wrap justify-center items-center gap-16 md:gap-32 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                        {/* Fake placeholders for logos */}
                        <div className="text-2xl font-black tracking-tighter text-stone-800">OFFICE TOURISME</div>
                        <div className="text-2xl font-black tracking-tighter text-stone-800">HOTEL&RELAIS</div>
                        <div className="text-2xl font-black tracking-tighter text-stone-800">CAMPING++</div>
                        <div className="text-2xl font-black tracking-tighter text-stone-800">ALPINE RESORT</div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-40 bg-[#061e1e] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/ui/grid.svg')] opacity-10"></div>
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8">Prêt à transformer <br />votre communication ?</h2>
                        <p className="text-teal-100/60 text-xl mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                            Rejoignez les destinations et établissements qui réinventent le souvenir voyageur. Nos experts vous accompagnent dans la mise en place de votre banque d'images et de votre branding.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-8 rounded-2xl text-xl font-bold h-auto shadow-2xl shadow-orange-950/40 border-0">
                                <Link href="/contact">Demander une démo</Link>
                            </Button>
                            <Button asChild variant="outline" className="bg-transparent text-white hover:bg-white/10 px-12 py-8 rounded-2xl text-xl font-bold h-auto border-white/20">
                                <Link href="/pricing">Consulter les prix</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
