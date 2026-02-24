import { redirect } from 'next/navigation'
import MobileUploadClient from './MobileUploadClient'

export const metadata = {
  title: 'Envoyer une photo | CartePostale.cool',
  description: 'Envoyez une photo directement depuis votre mobile',
}

export default async function MobileUploadPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const currentParams = await searchParams
  const token = currentParams.t

  if (!token) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 text-center">
        <div className="bg-white p-6 rounded-2xl shadow-sm max-w-sm w-full">
          <h1 className="text-xl font-bold text-stone-900 mb-2">Lien invalide</h1>
          <p className="text-stone-600">
            Ce lien est incomplet ou invalide. Veuillez scanner à nouveau le QR code depuis votre
            ordinateur.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="bg-white border-b border-stone-200 p-4 sticky top-0 z-10 flex items-center justify-center">
        <h1 className="text-lg font-bold">Ajouter une photo</h1>
      </header>
      <main className="p-4 max-w-md mx-auto">
        <MobileUploadClient token={token} />
      </main>
    </div>
  )
}
