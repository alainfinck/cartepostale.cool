
import React from 'react'
import { Metadata } from 'next'
import { Mail, MapPin, Phone, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export const metadata: Metadata = {
    title: 'Contactez-nous',
    description: 'Une question ? Notre équipe est là pour vous aider. Contactez le support de CartePostale.cool.',
}

export default function ContactPage() {
    return (
        <div className="bg-[#fdfbf7] min-h-screen py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 mb-6">
                        Besoin d'<span className="text-orange-500">aide ?</span>
                    </h1>
                    <p className="text-xl text-stone-600 max-w-2xl mx-auto">
                        Notre équipe support est basée à Lyon et répond en général sous 24h.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Contact Info */}
                    <div className="space-y-12">
                        <div>
                            <h3 className="text-2xl font-bold text-stone-800 mb-6 font-serif">Nos coordonnées</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                        <Mail className="w-6 h-6 text-teal-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-stone-800">Email</h4>
                                        <p className="text-stone-600">hello@cartepostale.cool</p>
                                        <p className="text-stone-500 text-sm mt-1">Pour toute question générale</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                        <MessageSquare className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-stone-800">Support Client</h4>
                                        <p className="text-stone-600">support@cartepostale.cool</p>
                                        <p className="text-stone-500 text-sm mt-1">Pour les problèmes de commande</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                        <MapPin className="w-6 h-6 text-indigo-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-stone-800">Bureaux</h4>
                                        <p className="text-stone-600">CartePostale.cool HQ</p>
                                        <p className="text-stone-600">12 Rue de la République</p>
                                        <p className="text-stone-600">69002 Lyon, France</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Teaser */}
                        <div className="bg-orange-50 p-8 rounded-2xl border border-orange-100">
                            <h3 className="font-bold text-stone-800 mb-2">Avant de nous contacter</h3>
                            <p className="text-stone-600 mb-4">
                                Avez-vous consulté notre foire aux questions ? La réponse s'y trouve peut-être déjà !
                            </p>
                            <Button variant="outline" className="bg-white border-orange-200 text-orange-600 hover:bg-orange-100 hover:text-orange-700">
                                Consulter la FAQ
                            </Button>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-stone-100">
                        <h3 className="text-2xl font-bold text-stone-800 mb-6 font-serif">Envoyez-nous un message</h3>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium text-stone-700">Nom</label>
                                    <Input id="name" placeholder="Votre nom" className="bg-stone-50 border-stone-200 focus:ring-teal-500" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-stone-700">Email</label>
                                    <Input id="email" type="email" placeholder="votre@email.com" className="bg-stone-50 border-stone-200 focus:ring-teal-500" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="subject" className="text-sm font-medium text-stone-700">Sujet</label>
                                <select id="subject" className="w-full h-10 px-3 rounded-md border border-stone-200 bg-stone-50 text-stone-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                                    <option value="">Sélectionnez un sujet</option>
                                    <option value="order">Problème avec ma commande</option>
                                    <option value="question">Question générale</option>
                                    <option value="partnership">Partenariat / Presse</option>
                                    <option value="other">Autre</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium text-stone-700">Message</label>
                                <Textarea
                                    id="message"
                                    placeholder="Dites-nous tout..."
                                    className="min-h-[150px] bg-stone-50 border-stone-200 focus:ring-teal-500"
                                />
                            </div>

                            <Button type="submit" className="w-full py-6 text-lg font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-lg shadow-teal-600/20">
                                Envoyer le message
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
