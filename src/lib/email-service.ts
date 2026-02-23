import * as nodemailer from 'nodemailer'

// Create a transporter using SMTP
const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null

interface EmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailParams): Promise<boolean> {
  if (!transporter) {
    console.log('⚠️ [EMAIL MOCK] No SMTP configuration found. Logging email instead.')
    console.log(`To: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Body: ${html}`)
    return true
  }

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'CartePostale'}" <${process.env.EMAIL_FROM || 'cartepostalecool@gmail.com'}>`,
      to,
      subject,
      html,
    })

    console.log('Message sent: %s', info.messageId)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

const EMAIL_BASE_STYLES = {
  body: "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f0f4f3;",
  container:
    'max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(15, 118, 110, 0.08); margin-top: 32px; margin-bottom: 32px;',
  header:
    'background: linear-gradient(135deg, #fdfbf7 0%, #f0fdfa 100%); padding: 36px 24px; text-align: center; border-bottom: 1px solid #e5e7eb;',
  logo: "font-family: 'Times New Roman', Georgia, serif; font-size: 22px; font-weight: bold; color: #0f766e; text-decoration: none;",
  content: 'padding: 40px 32px;',
  h1: 'font-family: Georgia, serif; font-size: 26px; color: #111827; margin: 0 0 20px 0; text-align: center; line-height: 1.3;',
  p: 'font-size: 16px; color: #4b5563; margin: 0 0 20px 0; text-align: center; line-height: 1.6;',
  cardPreview:
    'background-color: #f8fafc; padding: 24px; border-radius: 12px; margin: 28px 0; text-align: center; border: 1px solid #e2e8f0;',
  cardImage: 'max-width: 100%; height: auto; border-radius: 10px; display: block; margin: 0 auto;',
  btnPrimary:
    'display: inline-block; background-color: #0d9488; color: #ffffff !important; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 16px; text-align: center; box-shadow: 0 4px 14px rgba(13, 148, 136, 0.35);',
  btnSecondary:
    'display: inline-block; color: #0d9488 !important; text-decoration: none; font-weight: 500; font-size: 14px; padding: 8px 0;',
  footer:
    'background-color: #f8fafc; padding: 28px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;',
}

export function generateMagicLinkEmail(
  magicLink: string,
  postcardUrl: string,
  publicId: string,
  postcardImageUrl?: string,
) {
  const baseUrl = postcardUrl.replace(/\/view\/.*$/, '')
  const previewImage = postcardImageUrl?.startsWith('http')
    ? postcardImageUrl
    : postcardImageUrl
      ? `${baseUrl}${postcardImageUrl}`
      : `${baseUrl}https://img.cartepostale.cool/demo/photo-1507525428034-b723cf961d3e.jpg`

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre carte postale est prête !</title>
  <style>
    body { ${EMAIL_BASE_STYLES.body} }
    .container { ${EMAIL_BASE_STYLES.container} }
    .header { ${EMAIL_BASE_STYLES.header} }
    .logo { ${EMAIL_BASE_STYLES.logo} }
    .content { ${EMAIL_BASE_STYLES.content} }
    .h1 { ${EMAIL_BASE_STYLES.h1} }
    .p { ${EMAIL_BASE_STYLES.p} }
    .card-preview { ${EMAIL_BASE_STYLES.cardPreview} }
    .card-image { ${EMAIL_BASE_STYLES.cardImage} }
    .btn-primary { ${EMAIL_BASE_STYLES.btnPrimary} }
    .btn-secondary { ${EMAIL_BASE_STYLES.btnSecondary} }
    .footer { ${EMAIL_BASE_STYLES.footer} }
    .cta-block { text-align: center; margin: 28px 0; }
    .cta-primary { margin-bottom: 16px; }
  </style>
</head>
<body style="${EMAIL_BASE_STYLES.body}">
  <div class="container" style="${EMAIL_BASE_STYLES.container}">
    <div class="header" style="${EMAIL_BASE_STYLES.header}">
      <a href="${baseUrl}" style="${EMAIL_BASE_STYLES.logo}">CartePostale.cool</a>
    </div>
    <div class="content" style="${EMAIL_BASE_STYLES.content}">
      <h1 class="h1" style="${EMAIL_BASE_STYLES.h1}">Votre carte est prête ! 💌</h1>
      <p class="p" style="${EMAIL_BASE_STYLES.p}">Votre carte postale a été créée avec succès. Cliquez ci-dessous pour la voir en ligne et la partager.</p>
      
      <div class="card-preview" style="${EMAIL_BASE_STYLES.cardPreview}">
        <img src="${previewImage}" alt="Votre carte postale" class="card-image" style="${EMAIL_BASE_STYLES.cardImage}" width="280" />
      </div>

      <div class="cta-block">
        <p class="p" style="${EMAIL_BASE_STYLES.p}; margin-bottom: 24px;">Voir votre carte postale en ligne :</p>
        <p class="cta-primary"><a href="${postcardUrl}" class="btn-primary" style="${EMAIL_BASE_STYLES.btnPrimary}">Voir ma carte postale</a></p>
        <p class="p" style="margin-top: 24px; font-size: 14px; color: #64748b;">Pour gérer vos cartes et voir les statistiques :</p>
        <a href="${magicLink}" class="btn-secondary" style="${EMAIL_BASE_STYLES.btnSecondary}">Accéder à mon espace →</a>
      </div>
    </div>
    <div class="footer" style="${EMAIL_BASE_STYLES.footer}">
      <p style="margin: 0 0 8px 0;">Ce lien de connexion est valide 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      <p style="margin: 0;">© ${new Date().getFullYear()} CartePostale.cool</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/** HTML body for "your promo code" email (admin sends code to an email). */
export function generatePromoCodeEmail(code: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cartepostale.cool'
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre code promo CartePostale</title>
  <style>
    body { ${EMAIL_BASE_STYLES.body} }
    .container { ${EMAIL_BASE_STYLES.container} }
    .header { ${EMAIL_BASE_STYLES.header} }
    .logo { ${EMAIL_BASE_STYLES.logo} }
    .content { ${EMAIL_BASE_STYLES.content} }
    .h1 { ${EMAIL_BASE_STYLES.h1} }
    .p { ${EMAIL_BASE_STYLES.p} }
    .code-block { background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); padding: 24px; border-radius: 12px; margin: 24px 0; text-align: center; border: 2px dashed #0d9488; }
    .code-value { font-family: monospace; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #0f766e; }
    .btn-primary { ${EMAIL_BASE_STYLES.btnPrimary} }
    .footer { ${EMAIL_BASE_STYLES.footer} }
    .cta-block { text-align: center; margin: 28px 0; }
  </style>
</head>
<body style="${EMAIL_BASE_STYLES.body}">
  <div class="container" style="${EMAIL_BASE_STYLES.container}">
    <div class="header" style="${EMAIL_BASE_STYLES.header}">
      <a href="${baseUrl}" style="${EMAIL_BASE_STYLES.logo}">CartePostale.cool</a>
    </div>
    <div class="content" style="${EMAIL_BASE_STYLES.content}">
      <h1 class="h1" style="${EMAIL_BASE_STYLES.h1}">Votre code promo 💌</h1>
      <p class="p" style="${EMAIL_BASE_STYLES.p}">Utilisez le code ci-dessous pour débloquer une carte pro gratuite (galerie photo illimitée) sur CartePostale.cool.</p>
      <div class="code-block">
        <p class="code-value">${code}</p>
      </div>
      <div class="cta-block">
        <a href="${baseUrl}/editor" class="btn-primary" style="${EMAIL_BASE_STYLES.btnPrimary}">Créer ma carte</a>
      </div>
      <p class="p" style="${EMAIL_BASE_STYLES.p}; font-size: 14px; color: #64748b;">Entrez ce code dans la section « Code Promo / Carte Gratuite » lors de la création de votre carte.</p>
    </div>
    <div class="footer" style="${EMAIL_BASE_STYLES.footer}">
      <p style="margin: 0;">© ${new Date().getFullYear()} CartePostale.cool</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/** HTML body for "someone sent you a postcard" email with tracking link (espace client / agence, avec ou sans DHL). */
export function generateTrackingLinkEmail(
  trackingUrl: string,
  recipientFirstName?: string | null,
  senderName?: string | null,
) {
  const greeting = recipientFirstName?.trim() ? `Bonjour ${recipientFirstName},` : 'Bonjour,'
  const sender = senderName?.trim() || "Quelqu'un"
  const baseUrl = trackingUrl.replace(/\/v\/.*$/, '') || trackingUrl.split('/v/')[0]
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Une carte postale pour vous</title>
  <style>
    body { ${EMAIL_BASE_STYLES.body} }
    .container { ${EMAIL_BASE_STYLES.container} }
    .header { ${EMAIL_BASE_STYLES.header} }
    .logo { ${EMAIL_BASE_STYLES.logo} }
    .content { ${EMAIL_BASE_STYLES.content} }
    .h1 { ${EMAIL_BASE_STYLES.h1} }
    .p { ${EMAIL_BASE_STYLES.p} }
    .btn-primary { ${EMAIL_BASE_STYLES.btnPrimary} }
    .footer { ${EMAIL_BASE_STYLES.footer} }
    .cta-block { text-align: center; margin: 28px 0; }
  </style>
</head>
<body style="${EMAIL_BASE_STYLES.body}">
  <div class="container" style="${EMAIL_BASE_STYLES.container}">
    <div class="header" style="${EMAIL_BASE_STYLES.header}">
      <a href="${baseUrl}" style="${EMAIL_BASE_STYLES.logo}">CartePostale.cool</a>
    </div>
    <div class="content" style="${EMAIL_BASE_STYLES.content}">
      <h1 class="h1" style="${EMAIL_BASE_STYLES.h1}">${greeting} 💌</h1>
      <p class="p" style="${EMAIL_BASE_STYLES.p}">${sender} vous envoie une carte postale. Cliquez ci-dessous pour la voir en ligne.</p>
      <div class="cta-block">
        <a href="${trackingUrl}" class="btn-primary" style="${EMAIL_BASE_STYLES.btnPrimary}">Voir ma carte postale</a>
      </div>
    </div>
    <div class="footer" style="${EMAIL_BASE_STYLES.footer}">
      <p style="margin: 0;">© ${new Date().getFullYear()} CartePostale.cool</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * HTML for "your postcard was created" confirmation email sent to the creator.
 * Includes a button to view the card exactly as the recipient will see it.
 */
export function generateCreatorConfirmationEmail({
  creatorName,
  recipientName,
  postcardPublicUrl,
  postcardImageUrl,
  espaceClientUrl,
  editMagicLinkUrl,
}: {
  creatorName?: string | null
  recipientName?: string | null
  postcardPublicUrl: string
  postcardImageUrl?: string | null
  espaceClientUrl: string
  editMagicLinkUrl?: string | null
}) {
  const baseUrl = postcardPublicUrl.split('/v/')[0].split('/view/')[0]
  const greeting = creatorName?.trim() ? `Bonjour ${creatorName} 👋` : 'Bonjour 👋'
  const dedicaceeLine = recipientName?.trim()
    ? `Votre carte pour <strong>${recipientName}</strong> a bien été créée.`
    : 'Votre carte postale a bien été créée.'

  const previewSrc = postcardImageUrl?.startsWith('http')
    ? postcardImageUrl
    : postcardImageUrl
      ? `${baseUrl}${postcardImageUrl}`
      : `https://img.cartepostale.cool/demo/photo-1507525428034-b723cf961d3e.jpg`

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre carte postale est prête !</title>
  <style>
    body { ${EMAIL_BASE_STYLES.body} }
    .container { ${EMAIL_BASE_STYLES.container} }
    .header { ${EMAIL_BASE_STYLES.header} }
    .logo { ${EMAIL_BASE_STYLES.logo} }
    .content { ${EMAIL_BASE_STYLES.content} }
    .h1 { ${EMAIL_BASE_STYLES.h1} }
    .p { ${EMAIL_BASE_STYLES.p} }
    .card-preview { ${EMAIL_BASE_STYLES.cardPreview} }
    .card-image { ${EMAIL_BASE_STYLES.cardImage} }
    .btn-primary { ${EMAIL_BASE_STYLES.btnPrimary} }
    .btn-secondary { ${EMAIL_BASE_STYLES.btnSecondary} }
    .footer { ${EMAIL_BASE_STYLES.footer} }
    .cta-block { text-align: center; margin: 28px 0; }
    .cta-primary { margin-bottom: 16px; }
    .badge {
      display: inline-block;
      background: linear-gradient(135deg, #0d9488, #0891b2);
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
      padding: 4px 12px;
      border-radius: 50px;
      margin-bottom: 20px;
      text-transform: uppercase;
    }
  </style>
</head>
<body style="${EMAIL_BASE_STYLES.body}">
  <div class="container" style="${EMAIL_BASE_STYLES.container}">
    <div class="header" style="${EMAIL_BASE_STYLES.header}">
      <a href="${baseUrl}" style="${EMAIL_BASE_STYLES.logo}">CartePostale.cool</a>
    </div>
    <div class="content" style="${EMAIL_BASE_STYLES.content}">
      <p style="text-align:center;margin:0 0 8px 0;">
        <span class="badge">✅ Carte créée</span>
      </p>
      <h1 class="h1" style="${EMAIL_BASE_STYLES.h1}">${greeting}</h1>
      <p class="p" style="${EMAIL_BASE_STYLES.p}">${dedicaceeLine}</p>
      <p class="p" style="${EMAIL_BASE_STYLES.p}; font-size: 14px; color: #64748b;">
        Cliquez sur le bouton ci-dessous pour voir votre carte exactement comme la verra le destinataire.
      </p>

      <div class="card-preview" style="${EMAIL_BASE_STYLES.cardPreview}">
        <img src="${previewSrc}" alt="Aperçu de votre carte postale" class="card-image" style="${EMAIL_BASE_STYLES.cardImage}" width="280" />
      </div>

      <div class="cta-block">
        <p class="cta-primary">
          <a href="${postcardPublicUrl}" class="btn-primary" style="${EMAIL_BASE_STYLES.btnPrimary}">
            👁️ Voir ma carte comme le destinataire
          </a>
        </p>
        ${
          editMagicLinkUrl
            ? `
        <p style="margin: 20px 0 8px 0; font-size: 14px; color: #64748b; text-align: center;">
          Vous souhaitez modifier votre carte ?
        </p>
        <p style="margin-bottom: 20px;">
          <a href="${editMagicLinkUrl}" style="display:inline-block;background-color:#f0fdfa;color:#0d9488 !important;border:2px solid #0d9488;padding:13px 28px;border-radius:50px;text-decoration:none;font-weight:600;font-size:15px;">
            ✏️ Modifier ma carte
          </a>
        </p>`
            : ''
        }
        <p style="margin: 20px 0 8px 0; font-size: 14px; color: #64748b; text-align: center;">
          Gérer vos cartes et statistiques :
        </p>
        <a href="${espaceClientUrl}" class="btn-secondary" style="${EMAIL_BASE_STYLES.btnSecondary}">
          Accéder à mon espace →
        </a>
      </div>
    </div>
    <div class="footer" style="${EMAIL_BASE_STYLES.footer}">
      <p style="margin: 0 0 8px 0;">Vous recevez cet email car vous venez de créer une carte sur CartePostale.cool.</p>
      <p style="margin: 0;">© ${new Date().getFullYear()} CartePostale.cool</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/** HTML for "welcome / account created" email. */
export function generateWelcomeEmail(name?: string | null) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.cartepostale.cool'
  const greeting = name?.trim() ? `Bienvenue ${name} !` : 'Bienvenue !'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue sur CartePostale.cool</title>
  <style>
    body { ${EMAIL_BASE_STYLES.body} }
    .container { ${EMAIL_BASE_STYLES.container} }
    .header { ${EMAIL_BASE_STYLES.header} }
    .logo { ${EMAIL_BASE_STYLES.logo} }
    .content { ${EMAIL_BASE_STYLES.content} }
    .h1 { ${EMAIL_BASE_STYLES.h1} }
    .p { ${EMAIL_BASE_STYLES.p} }
    .btn-primary { ${EMAIL_BASE_STYLES.btnPrimary} }
    .footer { ${EMAIL_BASE_STYLES.footer} }
    .cta-block { text-align: center; margin: 32px 0; }
  </style>
</head>
<body style="${EMAIL_BASE_STYLES.body}">
  <div class="container" style="${EMAIL_BASE_STYLES.container}">
    <div class="header" style="${EMAIL_BASE_STYLES.header}">
      <a href="${baseUrl}" style="${EMAIL_BASE_STYLES.logo}">CartePostale.cool</a>
    </div>
    <div class="content" style="${EMAIL_BASE_STYLES.content}">
      <h1 class="h1" style="${EMAIL_BASE_STYLES.h1}">${greeting} 💌</h1>
      <p class="p" style="${EMAIL_BASE_STYLES.p}">Votre compte a été créé avec succès sur CartePostale.cool.</p>
      <p class="p" style="${EMAIL_BASE_STYLES.p}">Vous pouvez désormais créer, personnaliser et envoyer des cartes postales interactives à vos proches.</p>
      
      <div class="cta-block">
        <a href="${baseUrl}/editor" class="btn-primary" style="${EMAIL_BASE_STYLES.btnPrimary}">Créer ma première carte</a>
      </div>
      
      <p class="p" style="${EMAIL_BASE_STYLES.p}; font-size: 14px; margin-top: 24px;">Si vous avez des questions, n'hésitez pas à nous contacter.</p>
    </div>
    <div class="footer" style="${EMAIL_BASE_STYLES.footer}">
      <p style="margin: 0;">© ${new Date().getFullYear()} CartePostale.cool</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
