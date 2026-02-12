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

export function generateMagicLinkEmail(magicLink: string, postcardUrl: string, publicId: string, postcardImageUrl?: string) {
  const previewImage = postcardImageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Votre carte postale est prête !</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-top: 40px; margin-bottom: 40px; }
        .header { background-color: #fdfbf7; padding: 40px 0; text-align: center; border-bottom: 1px solid #f3f4f6; }
        .logo { font-family: 'Times New Roman', serif; font-size: 24px; font-weight: bold; color: #0f766e; text-decoration: none; }
        .content { padding: 40px; }
        .h1 { font-family: 'Georgia', serif; font-size: 28px; color: #111827; margin-bottom: 24px; text-align: center; }
        .p { font-size: 16px; color: #4b5563; margin-bottom: 24px; text-align: center; }
        .card-preview { background-color: #f3f4f6; padding: 20px; border-radius: 12px; margin-bottom: 32px; text-align: center; }
        .card-image { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); transform: rotate(-1deg); }
        .btn-primary { display: block; width: fit-content; margin: 0 auto; background-color: #0d9488; color: #ffffff !important; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px; text-align: center; transition: background-color 0.2s; box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.3); }
        .btn-secondary { display: block; width: fit-content; margin: 20px auto 0; color: #0d9488 !important; text-decoration: none; font-weight: 500; font-size: 14px; }
        .footer { background-color: #f9fafb; padding: 32px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
        .link-muted { color: #9ca3af; text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <a href="${postcardUrl.split('/view')[0]}" class="logo">CartePostale.cool</a>
        </div>
        <div class="content">
          <h1 class="h1">Votre carte est prête ! 💌</h1>
          <p class="p">Félicitations ! Votre carte postale a été créée avec succès et est prête à voyager.</p>
          
          <div class="card-preview">
            <img src="${previewImage}" alt="Votre carte postale" class="card-image" />
          </div>

          <p class="p">Pour retrouver votre création, voir les statistiques de vue et gérer vos futures cartes, connectez-vous directement :</p>

          <a href="${magicLink}" class="btn-primary">Accéder à mon espace</a>
          <a href="${postcardUrl}" class="btn-secondary">Voir ma carte en ligne →</a>
        </div>
        <div class="footer">
          <p>Ce lien de connexion est magique et temporaire (valide 1h).<br>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
          <p>© ${new Date().getFullYear()} CartePostale.cool - Tous droits réservés</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
