import { Metadata } from 'next'
import SmartphoneMockup from '@/components/view/SmartphoneMockup'
import { getPostcardByPublicId } from '@/actions/postcard-actions'
import { demoPostcards } from '@/data/demoPostcards'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Smartphone, Monitor, Info } from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const postcard = await getPostcardByPublicId(slug)
  const demoCard = demoPostcards.find((c) => c.id === slug)

  if (!postcard && !demoCard) {
    return { title: 'Aperçu Smartphone' }
  }

  const sender = postcard?.senderName || demoCard?.senderName
  return {
    title: `Aperçu smartphone: Carte de ${sender}`,
    description: `Découvrez comment le destinataire verra sa carte postale sur son smartphone.`,
  }
}

export default async function CardPreviewPage({ params }: PageProps) {
  const { slug } = await params
  const postcard = await getPostcardByPublicId(slug)
  const demoCard = demoPostcards.find((c) => c.id === slug)

  if (!postcard && !demoCard) {
    notFound()
  }

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const iframeUrl = `/carte/${slug}`

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col">
      {/* Header / Context Bar */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 text-teal-700 rounded-lg">
            <Smartphone size={20} />
          </div>
          <div>
            <h1 className="font-bold text-stone-800 leading-none">Vue Destinataire</h1>
            <p className="text-xs text-stone-500 mt-1">Simulateur mobile: /carte/{slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href={`/carte/${slug}`} className="hidden md:block">
            <Button variant="outline" className="gap-2">
              <Monitor size={16} />
              <span>Voir en plein écran</span>
            </Button>
          </Link>
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-white bg-teal-500 flex items-center justify-center text-[10px] text-white font-bold"
              >
                CP
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row items-center justify-center p-4 md:p-12 gap-12 max-w-7xl mx-auto w-full">
        {/* Helper Text (Desktop Only) */}
        <div className="flex-1 max-w-md hidden lg:block space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-stone-900 tracking-tight leading-tight">
              Aperçu mobile <br />
              <span className="text-teal-600">en conditions réelles</span>
            </h2>
            <p className="text-stone-600 text-lg leading-relaxed">
              C'est exactement ce que verra le destinataire lorsqu'il ouvrira le lien depuis son
              smartphone.
            </p>
          </div>

          <div className="bg-teal-50 border border-teal-100 p-6 rounded-2xl shadow-sm text-teal-800">
            <h3 className="font-bold flex items-center gap-2 mb-2">
              <Info size={18} />
              <span>Le saviez-vous ?</span>
            </h3>
            <p className="text-sm leading-relaxed opacity-90">
              92% des cartes postales numériques sont ouvertes sur smartphone. L'expérience mobile
              est notre priorité absolue pour garantir l'effet "waouh".
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-stone-500">
              <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center shadow-sm">
                ✨
              </div>
              <span className="text-sm">Animations optimisées (Framer Motion)</span>
            </div>
            <div className="flex items-center gap-4 text-stone-500">
              <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center shadow-sm">
                🎹
              </div>
              <span className="text-sm">Expérience sonore immersive</span>
            </div>
            <div className="flex items-center gap-4 text-stone-500">
              <div className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center shadow-sm">
                🖼️
              </div>
              <span className="text-sm">Flux photos haute définition</span>
            </div>
          </div>
        </div>

        {/* Smartphone Wrapper */}
        <div className="relative flex-1 flex justify-center py-8">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[700px] bg-teal-400/20 blur-[100px] rounded-full -z-10" />

          <SmartphoneMockup url={iframeUrl} />
        </div>
      </main>

      {/* Footer / Disclaimer */}
      <footer className="py-6 px-12 text-center text-stone-400 text-sm border-t border-stone-200 bg-white/50">
        <p>© 2025 CartePostale.cool • Simulateur d'expérience destinataire</p>
      </footer>
    </div>
  )
}
