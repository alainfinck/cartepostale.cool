'use client'

import React from 'react'
import { Check, X, Clock, Users, DollarSign, Sparkles } from 'lucide-react'

export default function ComparisonSection() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Design elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />
      <div className="absolute -left-[10%] top-[20%] w-[30%] h-[30%] bg-pink-50 rounded-full blur-3xl opacity-60" />
      <div className="absolute -right-[10%] bottom-[20%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-3xl opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 text-xs font-bold uppercase tracking-widest rounded-full mb-4">
            <Sparkles size={14} />
            <span>Pourquoi changer ?</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-6">
            Plus qu&apos;une carte, une expérience
          </h2>
          <p className="text-stone-500 text-lg">
            Redécouvrez le plaisir d&apos;envoyer des cartes postales sans les contraintes
            habituelles. Moins cher, plus rapide, et surtout beaucoup plus fun.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Traditional Card */}
          <div className="bg-stone-50 rounded-3xl p-8 border border-stone-100 relative opacity-80 scale-95 origin-right">
            <div className="absolute top-0 right-0 bg-stone-200 text-stone-500 text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-3xl">
              TRADITIONNEL
            </div>
            <h3 className="text-xl font-bold text-stone-600 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 text-sm">
                VS
              </span>
              Carte Papier Classique
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-stone-500">
                <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-stone-600">
                    Payez par carte + timbre
                  </span>
                  <span className="text-sm">~35€ pour 10 destinataires</span>
                </div>
              </li>
              <li className="flex items-start gap-3 text-stone-500">
                <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-stone-600">Délai postal</span>
                  <span className="text-sm">3 à 10 jours d&apos;attente</span>
                </div>
              </li>
              <li className="flex items-start gap-3 text-stone-500">
                <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-stone-600">Aucune interaction</span>
                  <span className="text-sm">Le destinataire reçoit, c&apos;est tout</span>
                </div>
              </li>
              <li className="flex items-start gap-3 text-stone-500">
                <X className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block text-stone-600">Contenu limité</span>
                  <span className="text-sm">Une seule photo, texte court</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Digital Card */}
          <div className="bg-white rounded-3xl p-8 md:p-10 border border-pink-100 shadow-xl shadow-pink-100/30 relative z-10 transform md:-translate-x-4">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-3xl shadow-lg shadow-pink-500/20">
              RECOMMANDÉ
            </div>
            <h3 className="text-2xl font-bold text-stone-800 mb-8 flex items-center gap-2">
              <span className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
                <Sparkles size={20} />
              </span>
              CartePostale.cool
            </h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <span className="font-bold block text-stone-800 text-lg">
                    Payez 1x, envoyez à l&apos;infini
                  </span>
                  <span className="text-stone-500">2,50 € seulement pour des envois illimités</span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <span className="font-bold block text-stone-800 text-lg">Instantané</span>
                  <span className="text-stone-500">Arrive tout de suite, zéro délai</span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <span className="font-bold block text-stone-800 text-lg">
                    100% Social & Interactif
                  </span>
                  <span className="text-stone-500">Réactions, commentaires, livre d&apos;or</span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <span className="font-bold block text-stone-800 text-lg">Multimédia riche</span>
                  <span className="text-stone-500">Vidéo, musique, album photo</span>
                </div>
              </li>
            </ul>

            <div className="mt-8 pt-8 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-sm text-stone-400 font-medium mb-1">Pour 10 amis</div>
                  <div className="text-3xl font-bold text-stone-300 line-through Decoration-rose-500/50">
                    ~35€
                  </div>
                </div>
                <div className="h-10 w-px bg-stone-200" />
                <div className="text-center">
                  <div className="text-sm text-pink-600 font-bold mb-1">Prix unique</div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    2,50 €
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
