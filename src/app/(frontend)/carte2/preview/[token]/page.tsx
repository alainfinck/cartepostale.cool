import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { getEditorPreview } from '@/lib/editor-preview-store'
import ScratchCardWrapper from '@/components/view/ScratchCardWrapper'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Postcard as FrontendPostcard } from '@/types'
import { RotateDevicePrompt } from '@/components/ui/rotate-device-prompt'
import ViewPageTitle from '@/components/view/ViewPageTitle'
import PhotoFeed from '@/components/view/PhotoFeed'
import EnvelopeExperience from '@/components/view/EnvelopeExperience'
import { TextAnimate } from '@/components/ui/text-animate'
import * as motion from 'motion/react-client'

interface PageProps {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params
  const data = await getEditorPreview(token)
  if (!data) {
    return { title: 'Aperçu expiré' }
  }
  const senderName = (data.senderName as string) || 'Expéditeur'
  return {
    title: `Aperçu — Carte de ${senderName}`,
    robots: 'noindex, nofollow',
  }
}

export default async function PreviewPostcardPage({ params }: PageProps) {
  const { token } = await params
  const data = await getEditorPreview(token)
  if (!data) {
    notFound()
  }
  const frontendPostcard = data as unknown as FrontendPostcard

  const heroSection = (
    <ViewPageTitle
      title="Vous avez reçu une carte postale !"
      senderName={frontendPostcard.senderName}
      location={frontendPostcard.location}
      date={frontendPostcard.date}
    />
  )

  const pageContent = (
    <div className="min-h-screen bg-[#fdfbf7] pt-9 md:pt-0 flex flex-col items-center overflow-x-hidden landscape:justify-center landscape:pt-4 landscape:pb-4">
      <RotateDevicePrompt />

      <div className="w-full max-w-6xl flex flex-col items-center perspective-[2000px] mb-0 px-2 md:px-4 min-h-[70vh] md:min-h-[80vh] justify-center">
        <ScratchCardWrapper postcard={frontendPostcard} views={0} />
      </div>

      {frontendPostcard.mediaItems && frontendPostcard.mediaItems.length > 0 && (
        <PhotoFeed
          mediaItems={frontendPostcard.mediaItems}
          senderName={frontendPostcard.senderName}
          postcardId={0}
          postcardDate={frontendPostcard.date}
        />
      )}

      {/* Signature de l'expéditeur + lieu et date */}
      <div className="w-full py-8 md:py-12 text-center space-y-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative inline-block"
        >
          <p className="font-serif font-bold text-teal-700 text-4xl sm:text-5xl md:text-6xl -rotate-2 drop-shadow-sm tracking-tight">
            — {frontendPostcard.senderName}
          </p>
          <div className="absolute -bottom-3 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal-300/40 to-transparent" />
        </motion.div>

        <div className="max-w-2xl mx-auto px-8 py-10 rounded-[2.5rem] bg-white border border-stone-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-full bg-teal-500/20" />
          <TextAnimate
            by="character"
            animation="blurIn"
            duration={3}
            className="text-stone-600 text-lg sm:text-xl md:text-2xl leading-relaxed font-semibold italic md:px-6"
          >
            {`Carte postale envoyée avec amour${
              frontendPostcard.location?.trim() ? ` de ${frontendPostcard.location.trim()}` : ''
            }${frontendPostcard.date ? `, le ${frontendPostcard.date}` : ''}.`}
          </TextAnimate>
        </div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="w-full bg-gradient-to-b from-white to-[#fdfbf7] pt-12 pb-24 md:pt-16 md:pb-40 px-4 relative"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-stone-200 to-transparent" />
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-[3rem] p-10 md:p-20 shadow-[0_50px_120px_rgba(0,0,0,0.06)] border border-stone-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-teal-50/50 rounded-full blur-3xl -mr-40 -mt-40" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-50/50 rounded-full blur-3xl -ml-40 -mb-40" />
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-50 text-orange-500 rounded-2xl rotate-6 mb-6 shadow-sm border border-orange-100/50 group hover:rotate-12 transition-transform duration-500">
                <Sparkles size={28} className="group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-serif font-bold text-2xl md:text-3xl text-stone-800 mb-4 tracking-tight leading-tight">
                Envoyez le <br className="sm:hidden" />
                même bonheur
              </h3>
              <p className="text-stone-500 text-base md:text-lg mb-8 leading-relaxed max-w-xl mx-auto font-medium">
                Créez vos propres cartes postales numériques et partagez vos meilleurs moments avec
                vos proches.
              </p>
              <div className="max-w-md mx-auto space-y-10">
                <Link href="/editor">
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black h-20 sm:h-28 text-2xl sm:text-3xl rounded-[2rem] shadow-[0_30px_70px_rgba(13,148,136,0.35)] transition-all hover:-translate-y-2 active:scale-[0.98] group flex items-center justify-center gap-5">
                    <span>Créer ma carte</span>
                    <ArrowRight
                      className="group-hover:translate-x-3 transition-transform"
                      size={32}
                    />
                  </Button>
                </Link>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                  className="flex items-center justify-center gap-6"
                >
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-stone-200" />
                  <p className="text-teal-600 font-black tracking-widest text-sm uppercase px-2 whitespace-nowrap">
                    Gratuit et instantané ✨
                  </p>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-stone-200" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="py-24 text-center space-y-10">
        <p className="text-stone-500 text-lg md:text-2xl leading-relaxed max-w-xl mx-auto font-medium">
          Merci de faire vivre les cartes postales numériques. Chaque envoi compte.
        </p>
        <p className="text-stone-400 text-sm md:text-base font-black tracking-[0.3em] uppercase">
          — L&apos;équipe cartepostale.cool
        </p>
      </div>
    </div>
  )

  return (
    <EnvelopeExperience enabled={false} hero={heroSection}>
      {pageContent}
    </EnvelopeExperience>
  )
}
