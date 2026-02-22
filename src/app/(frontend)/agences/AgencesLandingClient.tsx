'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Building2,
  Zap,
  ArrowRight,
  Palette,
  ImageIcon,
  BarChart3,
  Check,
  Percent,
  Globe2,
  HeadphonesIcon,
  Layers,
  Sparkles,
  Mail,
} from 'lucide-react'
import { getOptimizedImageUrl } from '@/lib/image-processing'
import { motion } from 'framer-motion'

const agencyPlans = [
  {
    name: 'Starter Agence',
    price: '49',
    period: '€/mois',
    description: 'Pour tester la marque blanche avec vos premiers clients.',
    features: [
      '100 cartes incluses / mois',
      'Marque blanche (logo, couleurs)',
      '1 espace agence',
      'Photothèque locale (50 photos)',
      'Statistiques de base',
      'Support email',
    ],
    cta: 'Démarrer',
    href: '/contact?plan=starter-agence',
    popular: false,
    badge: null,
  },
  {
    name: 'Pro Agence',
    price: '99',
    period: '€/mois',
    description: 'Pour les agences qui déploient la solution auprès de nombreux clients.',
    features: [
      '500 cartes incluses / mois',
      'Marque blanche illimitée',
      'Espaces multi-clients',
      'Photothèque illimitée',
      'Analytics avancés & export',
      'Codes promo & campagnes',
      'Support prioritaire',
    ],
    cta: 'Choisir Pro',
    href: '/contact?plan=pro-agence',
    popular: true,
    badge: 'Recommandé',
  },
  {
    name: 'Enterprise',
    price: 'Sur devis',
    period: '',
    description: 'Volume illimité, API et accompagnement sur mesure.',
    features: [
      'Cartes illimitées',
      'API d’envoi automatisé',
      'Multi-destinations / white-label',
      'Support dédié 24/7',
      'Formation & onboarding',
      'SLA garanti',
    ],
    cta: 'Nous contacter',
    href: '/contact?plan=enterprise',
    popular: false,
    badge: 'Sur mesure',
  },
]

const prosBenefits = [
  {
    icon: Palette,
    title: 'Marque blanche totale',
    desc: 'Votre logo, vos couleurs et votre nom sur chaque carte. Vos clients ne voient que votre marque.',
  },
  {
    icon: ImageIcon,
    title: 'Photothèque dédiée',
    desc: 'Uploadez les visuels de vos destinations. Les visiteurs créent des cartes avec vos images professionnelles.',
  },
  {
    icon: BarChart3,
    title: 'Statistiques & ROI',
    desc: 'Tableaux de bord par agence et par client. Mesurez l’impact des cartes envoyées et la portée.',
  },
  {
    icon: Percent,
    title: 'Campagnes & codes promo',
    desc: 'Insérez des offres et bons de réduction dans les cartes. Conversion traçable pour vos clients.',
  },
  {
    icon: Globe2,
    title: 'Multi-espaces',
    desc: 'Un espace par client (office de tourisme, hôtel, camping…). Chacun avec sa photothèque et son branding.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Support dédié',
    desc: 'Accompagnement à la mise en place, formation et support prioritaire pour les plans Pro et Enterprise.',
  },
]

export default function AgencesLandingClient() {
  return (
    <div className="bg-[#fdfbf7] min-h-screen font-sans selection:bg-teal-100">
      {/* Hero */}
      <section className="relative bg-[#061e1e] min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={getOptimizedImageUrl('https://img.cartepostale.cool/demo/photo-1486406146926-c627a92ad1ab.jpg', { width: 1920 })}
            alt="Agences"
            className="w-full h-full object-cover opacity-25 mix-blend-overlay scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-teal-950/50 via-teal-950/85 to-[#061e1e]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-teal-200 text-sm font-bold mb-8 border border-white/10">
              <Building2 size={16} className="text-orange-400" /> POUR LES AGENCES & PROFESSIONNELS
            </div>
            <h1 className="text-4xl md:text-7xl font-serif font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Cartes postales en <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-200 to-amber-200">marque blanche</span>
              <br />
              pour vos clients
            </h1>
            <p className="text-teal-100/80 text-lg md:text-xl mb-10 max-w-2xl font-light leading-relaxed">
              Proposez à vos offices de tourisme, hôtels et partenaires une solution clé en main : cartes postales à leur image, avec votre branding. Tarifs dédiés agences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white px-8 py-6 rounded-2xl text-lg font-bold shadow-xl border-0"
              >
                <Link href="/contact">Demander une démo <ArrowRight size={20} /></Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8 py-6 rounded-2xl text-lg font-bold"
              >
                <Link href="#tarifs">Voir les tarifs agences</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Avantages pros */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest mb-6">
            <Sparkles size={16} /> Avantages pour les pros
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-stone-900 mb-4">
            Tout ce dont votre agence a besoin
          </h2>
          <p className="text-stone-600 text-lg">
            Une solution pensée pour les agences qui revendent ou déploient la carte postale auprès de leurs clients.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {prosBenefits.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-stone-100 hover:shadow-xl hover:border-teal-100 transition-all"
            >
              <div className="w-14 h-14 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600 mb-5">
                <item.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">{item.title}</h3>
              <p className="text-stone-600 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="py-16 bg-stone-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-stone-500 text-sm font-bold uppercase tracking-widest mb-4">Idéal pour</p>
          <div className="flex flex-wrap justify-center gap-8 text-stone-700 font-semibold">
            <span>Offices de tourisme</span>
            <span>•</span>
            <span>Agences réceptives</span>
            <span>•</span>
            <span>Réseaux d’hébergement</span>
            <span>•</span>
            <span>Destinations & communes</span>
          </div>
        </div>
      </section>

      {/* Tarifs agences */}
      <section id="tarifs" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest mb-6">
              <Layers size={16} /> Tarifs dédiés agences
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-stone-900 mb-4">
              Marque blanche à prix agence
            </h2>
            <p className="text-stone-600 text-lg">
              Formules mensuelles avec volume de cartes inclus. Carte supplémentaire facturée au dégressif.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {agencyPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex flex-col rounded-2xl border overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all ${
                  plan.popular ? 'ring-2 ring-orange-500 ring-offset-4 scale-[1.02]' : 'border-stone-200'
                }`}
              >
                {plan.badge && (
                  <div
                    className={`absolute top-0 right-0 px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${
                      plan.popular ? 'bg-orange-500 text-white' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {plan.badge}
                  </div>
                )}
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${plan.popular ? 'bg-orange-100' : 'bg-stone-100'}`}>
                      <Zap className={`w-6 h-6 ${plan.popular ? 'text-orange-600' : 'text-stone-600'}`} />
                    </div>
                    <h3 className="text-xl font-bold text-stone-800">{plan.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-extrabold text-stone-900">{plan.price}</span>
                    <span className="text-stone-500 font-medium">{plan.period}</span>
                  </div>
                  <p className="text-stone-600 text-sm mb-6 min-h-[40px]">{plan.description}</p>
                  <ul className="space-y-3 flex-1 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                        <span className="text-stone-700 text-sm font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="mt-auto w-full py-6 rounded-xl text-base font-bold" variant={plan.popular ? 'default' : 'outline'}>
                    <Link
                      href={plan.href}
                      className={plan.popular ? 'bg-orange-500 hover:bg-orange-600' : ''}
                    >
                      {plan.cta}
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24 bg-[#061e1e] text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">
            Prêt à proposer la marque blanche à vos clients ?
          </h2>
          <p className="text-teal-100/80 text-lg mb-10">
            Demandez une démo ou un devis personnalisé. Nous vous répondons sous 24 h.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-6 rounded-2xl text-lg font-bold border-0">
              <Link href="/contact">
                <Mail className="w-5 h-5 mr-2 inline" />
                Nous contacter
              </Link>
            </Button>
            <Button asChild variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 px-10 py-6 rounded-2xl text-lg font-bold">
              <Link href="/pricing">Voir tous les tarifs</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
