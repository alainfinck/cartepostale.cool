'use client'

import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export const PACK_TIERS: Array<{ count: number; price: number; id: string; popular?: boolean }> = [
  { count: 5, price: 12, id: 'pack_5' },
  { count: 10, price: 22, id: 'pack_10' },
  { count: 20, price: 40, id: 'pack_20', popular: true },
  { count: 50, price: 95, id: 'pack_50' },
  { count: 100, price: 150, id: 'pack_100' },
  { count: 200, price: 280, id: 'pack_200' },
]

function getUnitPrice(price: number, count: number) {
  return price / count
}

export function PacksSlider() {
  const [index, setIndex] = useState(2) // default Pack 20
  const tier = PACK_TIERS[index]
  const unitPrice = getUnitPrice(tier.price, tier.count)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 flex flex-col text-center relative overflow-hidden">
        {tier.popular && (
          <div className="absolute top-0 inset-x-0 -translate-y-1/2 flex justify-center">
            <span className="bg-teal-600 text-white text-xs font-black uppercase tracking-wider py-1 px-3 rounded-full">
              Plus populaire
            </span>
          </div>
        )}
        <div className="text-4xl mb-4">💌</div>
        <p className="text-sm text-stone-500 mb-2">Choisissez le nombre de cartes</p>

        {/* Slider */}
        <div className="px-2 mb-8">
          <input
            type="range"
            min={0}
            max={PACK_TIERS.length - 1}
            value={index}
            onChange={(e) => setIndex(Number(e.target.value))}
            className="w-full h-3 rounded-full appearance-none bg-stone-100 accent-teal-600 cursor-pointer"
          />
          <div className="flex justify-between mt-2 text-xs font-bold text-stone-400">
            {PACK_TIERS.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  'transition-colors',
                  i === index ? 'text-teal-600' : 'hover:text-stone-600',
                )}
              >
                {t.count}
              </button>
            ))}
          </div>
        </div>

        <h3 className="text-xl font-bold text-stone-900 mb-1">
          Pack {tier.count} cartes
        </h3>
        <div className="flex flex-col mb-6">
          <span className="text-3xl font-black text-teal-700">{tier.price} €</span>
          <span className="text-sm text-teal-600 font-bold mt-1">
            Soit {unitPrice.toFixed(2).replace('.', ',')} € / carte
          </span>
        </div>
        <Button
          className="w-full rounded-xl font-bold bg-teal-600 hover:bg-teal-700"
          asChild
        >
          <Link href="/connexion?redirect=/espace-client">Acheter ce pack</Link>
        </Button>
      </div>
    </div>
  )
}
