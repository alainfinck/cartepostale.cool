
import React from 'react'
import { Metadata } from 'next'
import Image from 'next/image'
import { Heart, Globe, ShieldCheck, Smile } from 'lucide-react'

export const metadata: Metadata = {
    title: 'À propos de nous',
    description: 'Découvrez l\'histoire de CartePostale.cool, notre mission pour reconnecter les gens à travers des souvenirs tangibles.',
}

export default function AProposPage() {
    return (
        <div className="bg-[#fdfbf7] min-h-screen">
            {/* Hero Section */}
            <section className="relative py-24 px-4 overflow-hidden">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-stone-800 mb-6">
                        Ramener l&apos;émotion <br /><span className="text-orange-500">dans vos boîtes aux lettres</span>
                    </h1>
                    <p className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
                        Dans un monde numérique éphémère, nous croyons au pouvoir durable d&#39;une carte postale tenue en main.
                    </p>
                </div>

                {/* Background blobs */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-teal-200 rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
            </section>

            {/* Story Section */}
            <section className="py-20 px-4">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-stone-900/5 rotate-3 rounded-2xl"></div>
                        <Image
                            src="/images/demo/photo-1527529482837-4698179dc6ce.jpg"
                            alt="Notre équipe en voyage"
                            width={600}
                            height={400}
                            unoptimized
                            className="rounded-2xl shadow-xl relative z-10 rotate-[-2deg] hover:rotate-0 transition-transform duration-500"
                        />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-stone-800 mb-6 font-serif">Notre Histoire</h2>
                        <div className="space-y-4 text-lg text-stone-600">
                            <p>
                                Tout a commencé lors d&#39;un voyage en sac à dos à travers l&#39;Asie. Nous voulions partager nos moments, mais trouver un timbre et une boîte aux lettres était souvent une aventure en soi.
                            </p>
                            <p>
                                Et quand les cartes arrivaient (si elles arrivaient), nous étions souvent déjà rentrés depuis des semaines.
                            </p>
                            <p>
                                C&#39;est là qu&#39;est née l&#39;idée de <strong>CartePostale.cool</strong> : combiner la spontanéité du numérique avec l&#39;authenticité du papier.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-stone-800 mb-4 font-serif">Nos Valeurs</h2>
                        <p className="text-stone-500">Ce qui nous guide chaque jour.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: <Heart className="w-8 h-8 text-rose-500" />,
                                title: "Authenticité",
                                desc: "Rien ne remplace le toucher du papier et l'écriture manuscrite (même numérique)."
                            },
                            {
                                icon: <Globe className="w-8 h-8 text-teal-500" />,
                                title: "Simplicité",
                                desc: "Envoyer une carte devrait être aussi simple que d'envoyer un SMS, mais avec plus d'âme."
                            },
                            {
                                icon: <ShieldCheck className="w-8 h-8 text-indigo-500" />,
                                title: "Qualité",
                                desc: "Nous utilisons du papier premium 300g/m² pour que vos souvenirs durent toute une vie."
                            },
                            {
                                icon: <Smile className="w-8 h-8 text-amber-500" />,
                                title: "Joie",
                                desc: "Notre mission ultime : créer un sourire à l'ouverture de la boîte aux lettres."
                            }
                        ].map((value, i) => (
                            <div key={i} className="bg-stone-50 p-8 rounded-2xl hover:bg-stone-100 transition-colors">
                                <div className="bg-white w-14 h-14 rounded-xl flex items-center justify-center shadow-sm mb-6">
                                    {value.icon}
                                </div>
                                <h3 className="text-xl font-bold text-stone-800 mb-3">{value.title}</h3>
                                <p className="text-stone-600">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
