import { Resend } from 'resend';
import { Postcard } from '@/payload-types';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailParams): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.log('⚠️ [EMAIL MOCK] No RESEND_API_KEY found. Logging email instead.');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${html}`);
    return true;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'CartePostale <no-reply@cartepostale.cool>', // Make sure this domain is verified in Resend
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception sending email:', error);
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
