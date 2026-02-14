'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Sparkles, Gift, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { submitLead } from '@/actions/leads-actions'
import { cn } from '@/lib/utils'

export function ExitIntentPopup() {
    const [isVisible, setIsVisible] = useState(false)
    const [email, setEmail] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [promoCode, setPromoCode] = useState('')
    const [hasTriggered, setHasTriggered] = useState(false)

    useEffect(() => {
        // Check if already dismissed or triggered in this session
        const dismissed = sessionStorage.getItem('exit_intent_dismissed')
        if (dismissed) return

        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0 && !hasTriggered) {
                setIsVisible(true)
                setHasTriggered(true)
            }
        }

        document.addEventListener('mouseleave', handleMouseLeave)
        return () => document.removeEventListener('mouseleave', handleMouseLeave)
    }, [hasTriggered])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || isSubmitting) return

        setIsSubmitting(true)
        const result = await submitLead(email)
        setIsSubmitting(false)

        if (result.success && result.code) {
            setPromoCode(result.code)
            setIsSubmitted(true)
        }
    }

    const dismiss = () => {
        setIsVisible(false)
        sessionStorage.setItem('exit_intent_dismissed', 'true')
    }

    const copyCode = () => {
        navigator.clipboard.writeText(promoCode)
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={dismiss}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden border border-white/20"
                    >
                        {/* Decorative Top Bar */}
                        <div className="h-2 w-full bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500" />
                        
                        <button 
                            onClick={dismiss}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 transition-colors text-stone-400"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8 sm:p-10">
                            {!isSubmitted ? (
                                <div className="space-y-6">
                                    <div className="flex flex-col items-center text-center space-y-4">
                                        <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 mb-2">
                                            <Gift size={32} />
                                        </div>
                                        <h2 className="text-3xl font-black text-stone-800 tracking-tight leading-tight">
                                            Attends ! <br />
                                            <span className="text-teal-600 italic">C'est cadeau.</span>
                                        </h2>
                                        <p className="text-stone-500 text-lg">
                                            Ne pars pas sans ta <span className="font-bold text-stone-700">Carte Pro Gratuite</span> (avec galerie photo illimitée).
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-teal-500 transition-colors" size={20} />
                                            <Input
                                                type="email"
                                                placeholder="Ton adresse email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="h-14 pl-12 pr-4 bg-stone-50 border-none rounded-2xl ring-2 ring-stone-100 focus:ring-teal-500/30 transition-all text-lg"
                                            />
                                        </div>
                                        
                                        <Button 
                                            type="submit" 
                                            disabled={isSubmitting}
                                            className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-teal-500/20 transition-all active:scale-[0.98] group"
                                        >
                                            {isSubmitting ? (
                                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    Réclamer ma carte <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                                </span>
                                            )}
                                        </Button>
                                    </form>

                                    <p className="text-center text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                                        Pas de spam, c'est promis.
                                    </p>
                                </div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center text-center space-y-6"
                                >
                                    <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-2">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h2 className="text-3xl font-black text-stone-800 tracking-tight leading-tight">
                                        C'est prêt !
                                    </h2>
                                    <p className="text-stone-500 text-lg">
                                        Utilise ce code dans l'éditeur pour débloquer ta carte pro gratuite :
                                    </p>
                                    
                                    <div className="w-full relative group">
                                        <div className="h-16 bg-stone-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-stone-200 group-hover:border-teal-500 transition-colors">
                                            <span className="text-2xl font-mono font-black text-stone-800 tracking-widest">
                                                {promoCode}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={copyCode}
                                            className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg hover:bg-teal-700 transition-all"
                                        >
                                            Copier le code
                                        </button>
                                    </div>

                                    <div className="pt-8 w-full">
                                        <Button 
                                            onClick={dismiss}
                                            variant="outline"
                                            className="w-full h-14 border-stone-100 hover:bg-stone-50 text-stone-600 rounded-2xl font-bold text-lg"
                                        >
                                            C'est parti !
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
