'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useGoogleLogin } from '@react-oauth/google'
import { loginWithGoogle } from '@/actions/google-auth-actions'

interface GoogleLoginButtonProps {
  redirectPath?: string
  className?: string
  onSuccess?: (result: { success: boolean; role: string; email?: string }) => void
}

export function GoogleLoginButton({ redirectPath, className, onSuccess }: GoogleLoginButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true)
      setError(null)
      try {
        const result = await loginWithGoogle(tokenResponse.access_token)
        if (result.error) {
          setError(result.error)
        } else {
          if (onSuccess) {
            onSuccess({
              success: true,
              role: result.role!,
              email: result.email,
            })
          } else if (redirectPath) {
            router.push(redirectPath)
          } else {
            // Default redirects based on role
            if (result.role === 'agence' || result.role === 'admin') {
              window.location.href = '/espace-agence'
            } else {
              window.location.href = '/espace-client'
            }
          }
        }
      } catch (_err) {
        setError('Erreur lors de la connexion Google.')
      } finally {
        setLoading(false)
      }
    },
    onError: () => {
      setError('La connexion Google a échoué.')
    },
  })

  return (
    <div className="w-full">
      <Button
        type="button"
        variant="outline"
        disabled={loading}
        onClick={() => login()}
        className={`w-full h-14 rounded-xl font-bold text-lg border-stone-300 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-400 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 relative overflow-hidden ${className}`}
      >
        {loading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1c-2.4 0-4.52 1.25-5.76 3.16l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continuer avec Google
          </>
        )}
      </Button>
      {error && <div className="mt-2 text-center text-sm text-red-600 font-medium">{error}</div>}
    </div>
  )
}
