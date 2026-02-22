'use client'

import { useRouter } from 'next/navigation'
import ShimmerButton from '@/components/ui/shimmer-button'
import { ArrowRight } from 'lucide-react'

export function HeroShimmerCta() {
  const router = useRouter()
  return (
    <ShimmerButton
      onClick={() => router.push('/editor')}
      className="mt-6 bg-teal-600 text-white border-teal-500/30 hover:bg-teal-700"
      background="rgb(13 148 136)"
      shimmerColor="rgba(255,255,255,0.3)"
    >
      Créer ma carte
      <ArrowRight className="ml-2 w-4 h-4 inline" />
    </ShimmerButton>
  )
}
