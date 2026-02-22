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
  ImageIcon,
  Users2,
  BarChart3,
  Trophy,
  Percent,
  Eye,
  CheckCircle2,
  LayoutDashboard,
  Compass,
  QrCode,
  TrendingUp,
  Rocket,
} from 'lucide-react'
import WordRotate from '@/components/ui/word-rotate'
import { getOptimizedImageUrl } from '@/lib/image-processing'
import { motion, easeOut } from 'framer-motion'

export default function BusinessClient() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: easeOut,
      },
    },
  }

  return (
    <div className="bg-[#fdfbf7] min-h-screen font-sans selection:bg-teal-100">
      {/* Hero Section */}
      <section className="relative bg-[#061e1e] min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={getOptimizedImageUrl('https://img.cartepostale.cool/demo/photo-1507525428034-b723cf961d3e.jpg', {
              width: 1920,
            })}
            alt="Vacation Background"
            className="w-full h-full object-cover opacity-40 mix-blend-overlay scale-105"
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
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full text-teal-200 text-sm font-bold mb-8 border border-white/10 shadow-2xl"
            >
              <Zap size={16} className="text-orange-400" /> SOLUTIONS POUR LE TOURISME & ENTREPRISES
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-8 leading-[1.1] tracking-tight"
            >
              Faites rayonner <br />
              <WordRotate
                words={[
                  'votre destination.',
                  'votre agence.',
                  'votre entreprise.',
                  'votre office de tourisme.',
                  'votre commune.',
                  'votre restaurant.',
                  'votre hôtel.',
                ]}
                className="text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-amber-200 to-teal-200"
                duration={3000}
              />
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-teal-50/80 text-lg md:text-xl mb-12 leading-relaxed max-w-2xl font-light"
            >
              Offrez à vos visiteurs une expérience mémorable. Une banque d&apos;images pro, votre
              branding sur chaque carte, et des statistiques en temps réel. Simple, puissant,
              élégant.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6">
              <Button
                asChild
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white px-10 py-8 rounded-2xl text-xl font-bold transition-all shadow-2xl shadow-orange-950/40 flex items-center gap-3 border-0"
              >
                <Link href="/contact">
                  Démarrer maintenant <ArrowRight size={24} />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-white/5 backdrop-blur-md border-white/20 text-white hover:bg-white/10 px-10 py-8 rounded-2xl text-xl font-bold transition-all flex items-center gap-3"
              >
                <Link href="/espace-agence/login">Connexion Espace Agence</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 bg-stone-100 text-stone-600 px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest mb-6">
              <Users2 size={16} /> Solutions sur mesure
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6">
              Adapté à votre activité.
            </h2>
            <p className="text-xl text-stone-500 leading-relaxed">
              Que vous soyez une destination touristique, un hébergement ou une entreprise, nous
              avons conçu des outils spécifiques pour vos enjeux.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-stone-50 rounded-[32px] p-8 h-full border border-stone-100 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-900/5 transition-all">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm text-teal-600 group-hover:scale-110 transition-transform">
                  <Globe2 size={32} />
                </div>
                <h3 className="text-2xl font-bold text-stone-900 mb-4">Offices de Tourisme</h3>
                <ul className="space-y-4 text-stone-600">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-teal-500 shrink-0 mt-0.5" />
                    <span>Valorisez le territoire avec les photos des visiteurs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-teal-500 shrink-0 mt-0.5" />
                    <span>Collectez de la donnée qualifiée (emails)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-teal-500 shrink-0 mt-0.5" />
                    <span>Analysez les flux touristiques</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-stone-50 rounded-[32px] p-8 h-full border border-stone-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-900/5 transition-all">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm text-orange-500 group-hover:scale-110 transition-transform">
                  <Compass size={32} />
                </div>
                <h3 className="text-2xl font-bold text-stone-900 mb-4">Campings & Hôtels</h3>
                <ul className="space-y-4 text-stone-600">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-orange-500 shrink-0 mt-0.5" />
                    <span>Offre de bienvenue digitale innovante</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-orange-500 shrink-0 mt-0.5" />
                    <span>Fidélisation avec des codes promo exclusifs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-orange-500 shrink-0 mt-0.5" />
                    <span>Avis clients boostés post-séjour</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group hover:-translate-y-2 transition-transform duration-300">
              <div className="bg-stone-50 rounded-[32px] p-8 h-full border border-stone-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-900/5 transition-all">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm text-purple-600 group-hover:scale-110 transition-transform">
                  <Building2 size={32} />
                </div>
                <h3 className="text-2xl font-bold text-stone-900 mb-4">Entreprises & Events</h3>
                <ul className="space-y-4 text-stone-600">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-purple-500 shrink-0 mt-0.5" />
                    <span>Goodies digitaux éco-responsables</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-purple-500 shrink-0 mt-0.5" />
                    <span>Communication interne ludique</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 size={20} className="text-purple-500 shrink-0 mt-0.5" />
                    <span>Teambuilding photo challenge</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Branded Example Section */}
      <section className="py-24 bg-stone-900 text-white overflow-hidden relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest mb-6 border border-white/10">
              <Palette size={16} /> Personnalisation Totale
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              À quoi ça ressemble ?
            </h2>
            <p className="text-xl text-stone-400 max-w-2xl mx-auto">
              Vos couleurs, votre logo, votre message. L&apos;expérience est entièrement à votre
              image.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Mockup Container */}
            <div className="relative max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Recto - Real Card Look */}
                <motion.div
                  initial={{ opacity: 0, rotateY: -10, x: -20 }}
                  whileInView={{ opacity: 1, rotateY: 0, x: 0 }}
                  viewport={{ once: true }}
                  className="perspective-1000"
                >
                  <div className="relative aspect-[3/2] bg-white p-3 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)] transform-gpu hover:shadow-[0_40px_80px_rgba(0,0,0,0.5)] transition-all duration-500">
                    <div className="absolute inset-0 bg-[url('/images/ui/paper-texture.png')] opacity-20 pointer-events-none rounded-sm"></div>
                    <div className="w-full h-full overflow-hidden rounded-sm relative group">
                      <img
                        src={getOptimizedImageUrl(
                          'https://img.cartepostale.cool/demo/photo-1501785888041-af3ef285b470.jpg',
                          {
                            width: 800,
                          },
                        )}
                        alt="Exemple Recto"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      {/* Brand Overlay */}
                      <div className="absolute bottom-6 right-6 flex items-center gap-3 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-white/20">
                        <div className="w-6 h-6 bg-teal-600 rounded-lg shadow-inner flex items-center justify-center">
                          <span className="text-[10px] text-white font-bold">CP</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-widest font-black text-stone-900 leading-none">
                            VOTRE MARQUE
                          </span>
                          <span className="text-[8px] text-stone-400 font-bold">
                            PARTENAIRE OFFICIEL
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Card Edge Highlights */}
                    <div className="absolute inset-0 pointer-events-none border border-white/10 rounded-sm"></div>
                  </div>
                  <div className="mt-6 text-center">
                    <span className="text-stone-500 font-bold uppercase tracking-[0.2em] text-xs">
                      Vue de face (Recto)
                    </span>
                  </div>
                </motion.div>

                {/* Verso - Real Card Look */}
                <motion.div
                  initial={{ opacity: 0, rotateY: 10, x: 20 }}
                  whileInView={{ opacity: 1, rotateY: 0, x: 0 }}
                  viewport={{ once: true }}
                  className="perspective-1000"
                >
                  <div className="relative aspect-[3/2] bg-[#fcfaf7] p-8 rounded-sm shadow-[20px_20px_60px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)] flex flex-col transform-gpu hover:shadow-[30px_30px_80px_rgba(0,0,0,0.5)] transition-all duration-500">
                    {/* Paper Texture and Grain */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-30 pointer-events-none"></div>

                    {/* Center Vertical Line */}
                    <div className="absolute left-1/2 top-10 bottom-10 w-[1px] bg-stone-200/60 hidden md:block"></div>

                    <div className="flex-1 grid grid-cols-2 gap-8 relative z-10">
                      {/* Left Side - Message */}
                      <div className="flex flex-col pt-4">
                        <div className="font-handwriting text-stone-700 text-xl leading-relaxed mb-6">
                          &quot;Un moment magique dans ce lieu incroyable ! Merci pour
                          l&apos;accueil chaleureux, on reviendra c&apos;est certain.&quot;
                        </div>

                        {/* Brand Footer Small */}
                        <div className="mt-auto flex items-center gap-3 py-4 border-t border-stone-100">
                          <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center border border-stone-200">
                            <div className="w-4 h-4 bg-teal-600 rounded-sm"></div>
                          </div>
                          <div className="text-[9px] font-bold text-stone-400 uppercase leading-tight">
                            Posté avec <br />
                            <span className="text-teal-600">VOTRE MARQUE</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side - Stamp & Address */}
                      <div className="flex flex-col items-center pt-2">
                        {/* Stamp Area */}
                        <div className="w-24 h-28 border-[3px] border-stone-200/40 rounded bg-stone-50/50 flex flex-col items-center justify-center relative mb-12 self-end mr-4 group">
                          <div className="absolute inset-1 border border-stone-200/20 rounded-sm"></div>
                          <div className="w-12 h-12 bg-stone-200/30 rounded-full flex items-center justify-center mb-2">
                            <Compass size={24} className="text-stone-300" />
                          </div>
                          <span className="text-[8px] font-black text-stone-300 tracking-widest">
                            TIMBRE
                          </span>
                        </div>

                        {/* Address Lines */}
                        <div className="w-full space-y-4 px-4 pt-4">
                          <div className="h-[1px] bg-stone-200/60 w-full"></div>
                          <div className="h-[1px] bg-stone-200/60 w-full"></div>
                          <div className="h-[1px] bg-stone-200/60 w-full"></div>
                          <div className="h-[1px] bg-stone-200/60 w-3/4"></div>
                        </div>
                      </div>
                    </div>

                    {/* QR/Promo Code Area - Floating Look */}
                    <div className="absolute bottom-6 left-6 bg-white shadow-xl border border-stone-100 p-2 rounded-xl flex items-center gap-3 scale-90 origin-bottom-left">
                      <div className="w-10 h-10 bg-stone-900 rounded-lg flex items-center justify-center">
                        <QrCode size={20} className="text-white" />
                      </div>
                      <div className="pr-4">
                        <div className="text-[8px] font-bold text-stone-400 uppercase">
                          Offre Partenaire
                        </div>
                        <div className="text-xs font-black text-stone-900 leading-none">
                          LUNCH25
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <span className="text-stone-500 font-bold uppercase tracking-[0.2em] text-xs">
                      Vue de dos (Verso)
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
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
                src={getOptimizedImageUrl('https://img.cartepostale.cool/demo/photo-1502602898657-3e91760cbb34.jpg', {
                  width: 1000,
                })}
                alt="Image Bank Preview"
                className="rounded-[36px] w-full"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 bg-white p-6 rounded-3xl shadow-2xl border border-stone-100 hidden md:block max-w-[240px]">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
                  <ImageIcon size={20} />
                </div>
                <span className="font-bold text-stone-800">Banque d&apos;images</span>
              </div>
              <p className="text-sm text-stone-500 leading-relaxed">
                Mettez à disposition vos plus beaux clichés pour vos visiteurs.
              </p>
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
              Alimentez une banque d&apos;images exclusive pour votre territoire ou établissement.
              Vos visiteurs peuvent choisir parmi vos clichés professionnels pour créer leurs
              cartes, garantissant une esthétique parfaite pour chaque envoi.
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
              Votre logo <br />
              sur chaque carte.
            </h2>
            <p className="text-xl text-stone-600 leading-relaxed">
              Renforcez votre image de marque sans effort. Votre logo et votre identité visuelle
              sont automatiquement intégrés sur toutes les cartes créées via votre espace,
              qu&apos;elles utilisent vos photos ou celles des visiteurs.
            </p>
            <div className="bg-stone-50 p-8 rounded-3xl border border-stone-100">
              <p className="text-stone-500 italic text-lg whitespace-pre-line">
                &quot;Une visibilité organique exceptionnelle : chaque carte postale devient une
                ambassadrice de votre marque auprès de l&apos;entourage de vos visiteurs.&quot;
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
                <p className="text-teal-200/60 uppercase tracking-widest text-xs font-bold">
                  Intégration Marque Blanche
                </p>
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
            <h2 className="text-4xl md:text-6xl font-serif font-bold mb-8">
              Pilotez votre impact.
            </h2>
            <p className="text-xl text-teal-200/70 leading-relaxed">
              Accédez à un tableau de bord complet pour mesurer l&apos;engagement. Suivez le nombre
              de cartes envoyées, les photos les plus populaires et la portée géographique de votre
              destination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[32px] border border-white/10 group hover:bg-white/10 transition-all">
              <div className="w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center mb-8 text-teal-400 group-hover:scale-110 transition-transform">
                <LayoutDashboard size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Stats de diffusion</h3>
              <p className="text-teal-100/60 leading-relaxed">
                Nombre de cartes envoyées par jour, mois ou événement spécifique.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[32px] border border-white/10 group hover:bg-white/10 transition-all">
              <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-8 text-orange-400 group-hover:scale-110 transition-transform">
                <Eye size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Photos populaires</h3>
              <p className="text-teal-100/60 leading-relaxed">
                Identifiez les visuels qui plaisent le plus à vos visiteurs pour vos futures
                campagnes.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[32px] border border-white/10 group hover:bg-white/10 transition-all">
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-8 text-purple-400 group-hover:scale-110 transition-transform">
                <Users2 size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Portée Sociale</h3>
              <p className="text-teal-100/60 leading-relaxed">
                Estimez le nombre de personnes ayant découvert votre destination grâce aux cartes.
              </p>
            </div>
          </div>

          <div className="mt-20 p-8 rounded-[32px] bg-gradient-to-r from-teal-900/40 to-transparent border border-white/5 flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/20 rounded-full text-red-400">
                <span className="block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </div>
              <p className="text-teal-100/80 font-medium">
                Le contenu des cartes reste 100% privé et sécurisé pour vos utilisateurs.
              </p>
            </div>
            <Link
              href="/contact"
              className="text-orange-400 font-bold hover:text-orange-300 transition-colors flex items-center gap-2"
            >
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
              Convertissez <br />
              les destinataires.
            </h2>
            <p className="text-xl text-stone-600 leading-relaxed">
              Transformez chaque carte en opportunité de vente. Insérez des offres promotionnelles
              ou des bons de réduction exclusifs (codes promo, QR codes) visibles uniquement par
              ceux qui reçoivent la carte.
            </p>
            <ul className="space-y-6">
              {[
                {
                  title: 'Offres personnalisées',
                  icon: <Percent size={20} className="text-purple-500" />,
                },
                {
                  title: 'Bons de réduction traçables',
                  icon: <Trophy size={20} className="text-purple-500" />,
                },
                {
                  title: 'Call-to-action dynamique',
                  icon: <ArrowRight size={20} className="text-purple-500" />,
                },
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-2 bg-purple-50 rounded-lg">{item.icon}</div>
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
              <h3 className="text-3xl font-serif font-bold text-stone-900 mb-4">
                Offre Spéciale Visitors
              </h3>
              <p className="text-stone-500 text-lg mb-8 italic leading-relaxed">
                &quot;Bonjour ! Profitez de -15% sur votre prochaine visite avec le code&quot;
              </p>
              <div className="bg-stone-50 border-2 border-dashed border-stone-200 p-6 rounded-2xl text-center mb-8 group-hover:border-purple-300 transition-colors">
                <span className="text-3xl font-black text-stone-800 tracking-[0.2em] font-mono">
                  EXPLORE25
                </span>
              </div>
              <Button className="w-full bg-stone-900 hover:bg-black text-white py-6 rounded-xl font-bold flex items-center justify-center gap-2">
                Réserver mon activité <Compass size={20} />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Powerful Marketing Tool Highlight */}
      <section className="py-24 bg-gradient-to-br from-teal-900 via-[#061e1e] to-[#061e1e] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/ui/grid.svg')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest border border-orange-500/30">
                <TrendingUp size={16} /> ROI & Impact Marketing
              </div>
              <h2 className="text-4xl md:text-7xl font-serif font-bold leading-tight">
                Un outil marketing <br />
                <span className="text-orange-400">extrêmement puissant.</span>
              </h2>
              <p className="text-xl text-teal-100/70 leading-relaxed max-w-2xl font-light">
                Plus qu&apos;une simple carte postale, c&apos;est un levier de croissance
                exponentiel. Chaque envoi génère de l&apos;attention authentique et du
                bouche-à-oreille qualifié pour votre établissement.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                <div className="space-y-2">
                  <div className="text-3xl font-black text-white">100%</div>
                  <div className="text-teal-400 font-bold uppercase tracking-wider text-xs">
                    Taux d&apos;ouverture
                  </div>
                  <p className="text-teal-100/50 text-sm">
                    Contrairement aux emails, une carte postale est toujours lue avec attention.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-black text-white">x5.2</div>
                  <div className="text-teal-400 font-bold uppercase tracking-wider text-xs">
                    Portée moyenne
                  </div>
                  <p className="text-teal-100/50 text-sm">
                    Chaque destinataire partage souvent le message avec son entourage.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="absolute -inset-10 bg-orange-500/20 rounded-full blur-[100px] opacity-30"></div>
              <div className="bg-white/5 backdrop-blur-2xl p-12 rounded-[48px] border border-white/10 shadow-3xl text-center relative z-10">
                <Rocket size={64} className="text-orange-400 mx-auto mb-8 animate-bounce" />
                <h3 className="text-3xl font-bold mb-4">Accélérez votre visibilité</h3>
                <p className="text-teal-100/70 mb-8">
                  Passez du marketing digital froid à l&apos;émotion physique et authentique.
                </p>
                <Button
                  asChild
                  className="bg-orange-500 hover:bg-orange-400 text-white px-8 py-6 rounded-2xl font-bold border-0"
                >
                  <Link href="/contact">
                    Activer le levier <ArrowRight className="ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QR Code Access Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-stone-50 p-12 rounded-[48px] border border-stone-100 relative overflow-hidden flex items-center justify-center min-h-[400px]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-500/5 to-transparent"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="bg-white p-6 rounded-[32px] shadow-2xl mb-8 border border-stone-100">
                  <QrCode size={180} className="text-stone-900" />
                </div>
                <div className="inline-flex items-center gap-2 bg-teal-500/10 text-teal-700 px-4 py-2 rounded-full text-sm font-bold">
                  Scannez. Créez. Envoyez.
                </div>
              </div>
            </motion.div>

            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest">
                Déploiement Physique
              </div>
              <h2 className="text-4xl md:text-6xl font-serif font-bold text-stone-900 leading-tight">
                Accessible partout <br />
                en un instant.
              </h2>
              <p className="text-xl text-stone-600 leading-relaxed">
                Intégrez l&apos;expérience directement dans votre parcours client physique. Le
                créateur de carte est accessible via un simple QR Code placé stratégiquement dans
                votre établissement.
              </p>
              <div className="space-y-6">
                {[
                  { title: 'Comptoirs & Réceptions', desc: "Idéal pour l'accueil de vos clients." },
                  {
                    title: 'Chambres & Tables',
                    desc: 'Offrez un moment créatif lors de la détente.',
                  },
                  {
                    title: 'Brochures & Flyers',
                    desc: "Prolongez l'expérience au-delà de la visite.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center text-white shrink-0 mt-1">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-lg">{item.title}</h4>
                      <p className="text-stone-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials / Trust */}
      <section className="py-32 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold text-stone-400 uppercase tracking-[0.3em] mb-16">
            Ils nous font confiance
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-16 md:gap-32 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            {/* Fake placeholders for logos */}
            <div className="text-2xl font-black tracking-tighter text-stone-800">
              OFFICE TOURISME
            </div>
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
            <h2 className="text-5xl md:text-7xl font-serif font-bold text-white mb-8">
              Prêt à transformer <br />
              votre communication ?
            </h2>
            <p className="text-teal-100/60 text-xl mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              Rejoignez les destinations et établissements qui réinventent le souvenir voyageur. Nos
              experts vous accompagnent dans la mise en place de votre banque d&apos;images et de
              votre branding.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Button
                asChild
                className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-8 rounded-2xl text-xl font-bold h-auto shadow-2xl shadow-orange-950/40 border-0"
              >
                <Link href="/contact">Demander une démo</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-transparent text-white hover:bg-white/10 px-12 py-8 rounded-2xl text-xl font-bold h-auto border-white/20"
              >
                <Link href="/pricing">Consulter les prix</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
