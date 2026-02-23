'use client'

import React from 'react'
import { Sparkles, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ScrollToCreditsButtonProps = {
  credits?: number
  className?: string
}

export function ScrollToCreditsButton({ credits = 0, className }: ScrollToCreditsButtonProps) {
  const scrollToCredits = () => {
    document.getElementById('espace-client-credits')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <Button
      type="button"
      onClick={scrollToCredits}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl border-2 border-teal-200 bg-teal-50/80 px-5 py-2.5 text-teal-800 shadow-sm transition-all hover:border-teal-300 hover:bg-teal-100 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
        className,
      )}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-200/80 text-teal-600">
        <Sparkles size={18} />
      </span>
      <span className="font-semibold">
        Mes crédits
        {typeof credits === 'number' && (
          <span className="ml-1.5 font-bold text-teal-600">({credits})</span>
        )}
      </span>
      <ChevronDown size={18} className="text-teal-500 opacity-80" />
    </Button>
  )
}
