'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'
// crypto is available globally in Node.js 18+ and Next.js server actions


export async function submitLead(email: string) {
    try {
        const payload = await getPayload({ config })
        
        // Check if email already exists
        const existing = await payload.find({
            collection: 'leads',
            where: {
                email: { equals: email }
            }
        })

        if (existing.docs.length > 0) {
            return { 
                success: true, 
                code: existing.docs[0].code, 
                message: 'Vous avez déjà réclamé votre carte gratuite !' 
            }
        }

        // Generate a unique short code
        const code = crypto.randomUUID().split('-')[0].toUpperCase()

        const lead = await payload.create({
            collection: 'leads',
            data: {
                email,
                code,
                source: 'exit-intent',
            }
        })

        return { 
            success: true, 
            code: lead.code, 
            message: 'Code généré avec succès !' 
        }
    } catch (error: any) {
        console.error('Error submitting lead:', error)
        return { success: false, error: error.message }
    }
}

export async function validatePromoCode(code: string) {
    try {
        const payload = await getPayload({ config })
        
        const result = await payload.find({
            collection: 'leads',
            where: {
                code: { equals: code },
                isUsed: { equals: false }
            }
        })

        if (result.docs.length === 0) {
            return { success: false, error: 'Code invalide ou déjà utilisé' }
        }

        return { success: true, leadId: result.docs[0].id }
    } catch (error: any) {
        console.error('Error validating code:', error)
        return { success: false, error: 'Erreur lors de la validation' }
    }
}

export async function usePromoCode(code: string, postcardId: number) {
    try {
        const payload = await getPayload({ config })
        
        const result = await payload.find({
            collection: 'leads',
            where: {
                code: { equals: code },
                isUsed: { equals: false }
            }
        })

        if (result.docs.length === 0) {
            return { success: false, error: 'Code invalide ou déjà utilisé' }
        }

        const leadId = result.docs[0].id

        // Mark lead as used
        await payload.update({
            collection: 'leads',
            id: leadId,
            data: {
                isUsed: true,
                usedAt: new Date().toISOString(),
                usedByPostcard: postcardId
            }
        })

        // Update postcard to be premium
        await payload.update({
            collection: 'postcards',
            id: postcardId,
            data: {
                isPremium: true
            }
        })

        return { success: true }
    } catch (error: any) {
        console.error('Error using code:', error)
        return { success: false, error: 'Erreur lors de l\'activation' }
    }
}

export async function getAllLeads() {
    try {
        const payload = await getPayload({ config })
        const leads = await payload.find({
            collection: 'leads',
            limit: 100,
            sort: '-createdAt'
        })
        return { success: true, docs: leads.docs, totalDocs: leads.totalDocs }
    } catch (error: any) {
        console.error('Error getting leads:', error)
        return { success: false, error: 'Erreur lors de la récupération des leads' }
    }
}
