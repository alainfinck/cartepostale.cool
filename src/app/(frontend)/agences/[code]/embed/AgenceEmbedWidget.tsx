'use client'

import React from 'react'
import Link from 'next/link'
import { Send, Sparkles } from 'lucide-react'

interface Props {
  code: string
  agencyName: string
  primaryColor: string
}

export default function AgenceEmbedWidget({ code, agencyName, primaryColor }: Props) {
  const href = `/agences/${code}`

  return (
    <div
      className="min-h-[200px] w-full flex items-center justify-center p-4 bg-gradient-to-br from-stone-50 to-stone-100/80"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      <div className="w-full max-w-md rounded-2xl shadow-lg border border-stone-200/80 bg-white overflow-hidden">
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4">
          <div
            className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-md"
            style={{ backgroundColor: primaryColor }}
          >
            <Send className="w-7 h-7" strokeWidth={2} />
          </div>
          <div className="flex-1 text-center sm:text-left min-w-0">
            <p className="text-stone-800 font-semibold text-base leading-snug">
              Créez une carte postale virtuelle gratuite pour vos vacances
            </p>
            <p className="text-stone-500 text-sm mt-0.5">
              Envoyez-la en un clic depuis la page {agencyName}
            </p>
          </div>
          <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-md hover:opacity-95 transition-opacity"
            style={{ backgroundColor: primaryColor }}
          >
            <Sparkles className="w-4 h-4" />
            Créer ma carte
          </Link>
        </div>
      </div>
    </div>
  )
}
