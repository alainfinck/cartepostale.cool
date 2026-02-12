import * as nodemailer from 'nodemailer';
import { Postcard } from '@/payload-types';

// Create a transporter using SMTP
const transporter = process.env.SMTP_HOST ? nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}) : null;

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailParams): Promise<boolean> {
  if (!transporter) {
    console.log('⚠️ [EMAIL MOCK] No SMTP configuration found. Logging email instead.');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${html}`);
    return true;
  }

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'CartePostale'}" <${process.env.EMAIL_FROM || 'cartepostalecool@gmail.com'}>`,
      to,
      subject,
      html,
    });

    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export function generateMagicLinkEmail(magicLink: string, postcardUrl: string, publicId: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1>Votre carte postale est prête !</h1>
      <p>Merci d'avoir utilisé CartePostale.cool.</p>
      <p>Vous pouvez consulter votre carte ici : <a href="${postcardUrl}">Voir ma carte</a></p>
      <p>Pour accéder à votre compte, voir les statistiques de votre carte, et plus encore, cliquez sur ce lien magique :</p>
      <p>
        <a href="${magicLink}" style="display: inline-block; background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Accéder à mon compte
        </a>
      </p>
      <p>Ce lien est valide pour 1 heure.</p>
      <hr />
      <p style="font-size: 12px; color: #666;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
    </div>
  `;
}
