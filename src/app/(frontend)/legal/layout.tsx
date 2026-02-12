
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function LegalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="bg-[#fdfbf7] min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-stone-800 mb-8 font-serif">Informations Légales</h1>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <nav className="md:col-span-1 space-y-2">
                        <LegalLink href="/legal/mentions-legales">Mentions Légales</LegalLink>
                        <LegalLink href="/legal/cgu">CGU / CGV</LegalLink>
                        <LegalLink href="/legal/privacy">Confidentialité</LegalLink>
                        <LegalLink href="/legal/cookies">Cookies</LegalLink>
                    </nav>

                    <div className="md:col-span-3 bg-white p-8 rounded-2xl shadow-sm border border-stone-100 prose prose-stone max-w-none">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

function LegalLink({ href, children }: { href: string; children: React.ReactNode }) {
    // Simple link component, active state handling would need client component or props drilled
    return (
        <Link
            href={href}
            className="block px-4 py-2 rounded-lg text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors font-medium text-sm"
        >
            {children}
        </Link>
    )
}
