'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.resend.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'resend',
    pass: process.env.SMTP_PASS || '',
  },
})

export async function getEmailTemplates(targetRole?: 'client' | 'agence' | 'all') {
  try {
    const payload = await getPayload({ config })
    const where: any = {}
    if (targetRole && targetRole !== 'all') {
      where.or = [{ targetRole: { equals: targetRole } }, { targetRole: { equals: 'all' } }]
    }

    const templates = await payload.find({
      collection: 'email-templates',
      where,
      limit: 50,
    })
    return { success: true, templates: templates.docs }
  } catch (error) {
    console.error('Error fetching email templates:', error)
    return { success: false, error: 'Failed to fetch templates' }
  }
}

export async function sendEmailToUsers(
  userIds: (string | number)[],
  subject: string,
  body: string,
) {
  try {
    const payload = await getPayload({ config })
    const users = await payload.find({
      collection: 'users',
      where: {
        id: {
          in: userIds,
        },
      },
      limit: 1000,
    })

    if (!users.docs.length) {
      return { success: false, error: 'No users found' }
    }

    const senderEmail = process.env.EMAIL_FROM || 'bonjour@cartepostale.cool'

    // Send emails
    let sentCount = 0
    let errorCount = 0

    for (const user of users.docs) {
      try {
        // simple replacement
        const personalizedBody = body
          .replace(/{{name}}/g, user.name || 'Client')
          .replace(/{{company}}/g, user.company || '')
          .replace(/{{email}}/g, user.email || '')

        await transporter.sendMail({
          from: `"Cartepostale.cool" <${senderEmail}>`,
          to: user.email,
          subject,
          html: personalizedBody.replace(/\n/g, '<br/>'),
        })
        sentCount++
      } catch (err) {
        console.error(`Failed to send email to ${user.email}:`, err)
        errorCount++
      }
    }

    return {
      success: true,
      message: `${sentCount} emails envoyés, ${errorCount} erreurs`,
    }
  } catch (error) {
    console.error('Error sending emails:', error)
    return { success: false, error: 'Failed to send emails' }
  }
}
