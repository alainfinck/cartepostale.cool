import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const blogPosts = [
  {
    title: 'Le Guide Ultime pour Créer une Carte Postale Inoubliable',
    slug: 'comment-creer-une-carte-postale-inoubliable',
    category: 'tips',
    excerpt:
      "Ne vous contentez plus du classique 'Bons baisers de...'. Découvrez nos secrets pour transformer vos photos de vacances en véritables souvenirs émotionnels.",
    content: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "Nous avons tous reçu cette carte postale générique avec un coucher de soleil saturé et un texte laconique. C'est gentil, mais est-ce mémorable ? Pas vraiment. À l'ère où nous prenons des centaines de photos par jour, comment redonner du sens à ce geste traditionnel ? Voici notre guide pour créer des cartes postales qui finiront encadrées, et non au fond d'un tiroir.",
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                type: 'text',
                text: "1. La Photo : Cherchez l'Émotion, pas la Perfection",
                mode: 'normal',
                format: 0,
                style: '',
                detail: 0,
                version: 1,
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "L'erreur classique est de vouloir imiter les cartes postales touristiques vendues en boutique. Personne n'a besoin d'une énième photo de la Tour Eiffel vue du Trocadéro. Vos proches veulent VOUS voir, ou voir ce que vous ressentez.",
                version: 1,
              },
            ],
          },
          {
            type: 'list',
            tag: 'ul',
            listType: 'bullet',
            children: [
              {
                type: 'listitem',
                children: [
                  {
                    type: 'text',
                    text: 'Privilégiez les moments "candides" (pris sur le vif) plutôt que les poses figées.',
                    version: 1,
                  },
                ],
              },
              {
                type: 'listitem',
                children: [
                  {
                    type: 'text',
                    text: 'Jouez avec la lumière : la "Golden Hour" (juste après le lever ou avant le coucher du soleil) sublime n\'importe quel paysage.',
                    version: 1,
                  },
                ],
              },
              {
                type: 'listitem',
                children: [
                  {
                    type: 'text',
                    text: 'Osez le détail : un plat local appétissant, une texture, une scène de rue insolite.',
                    version: 1,
                  },
                ],
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: '2. Le Message : Racontez une Histoire', version: 1 }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "'Il fait beau, on mange bien, bisous'. Stop ! Profitez de l'espace verso pour partager une véritable anecdote.",
                version: 1,
              },
            ],
          },
          {
            type: 'quote',
            children: [
              {
                type: 'text',
                text: 'Une bonne carte postale transporte son destinataire. Décrivez les odeurs du marché, le bruit des vagues la nuit, ou cette rencontre improbable avec un local.',
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [
              { type: 'text', text: "3. L'Innovation : Passez au Multimédia", version: 1 },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "C'est là que la magie opère. Avec CartePostale.cool, vous n'êtes plus limité au papier. Pourquoi ne pas ajouter un QR code vers une vidéo de votre plongeon dans les calanques ? Ou un mémo vocal où l'on entend les cigales chanter ?",
                version: 1,
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "L'hybridation physique/numérique permet d'envoyer une expérience complète, pas juste une image.",
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'Conclusion', version: 1 }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "La prochaine fois que vous partez, prenez le temps. Prenez le temps de capturer le vrai, d'écrire le ressenti, et d'envoyer un peu de votre bonheur. C'est ça, une carte postale inoubliable.",
                version: 1,
              },
            ],
          },
        ],
      },
    },
  },
  {
    title: "Pourquoi la Carte Postale Revient en Force à l'Ère du Numérique",
    slug: 'pourquoi-la-carte-postale-revient-a-la-mode',
    category: 'lifestyle',
    excerpt:
      "Paradoxe ou évidence ? À l'heure de l'instantanéité, le \"slow communication\" séduit de plus en plus. Analyse d'un retour de hype.",
    content: {
      root: {
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "On l'avait enterrée un peu vite. Face aux SMS, à WhatsApp, aux Stories Instagram qui disparaissent en 24h, la carte postale semblait désuète, lente, coûteuse. Et pourtant, elle connaît un regain d'intérêt spectaculaire, notamment chez les millenials et la Gen Z. Pourquoi ce revirement ?",
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [
              { type: 'text', text: "La Fatigue du Virtuel et l'Immédiateté", version: 1 },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "Nous sommes saturés de notifications. Un message WhatsApp fait vibrer notre poche, on le lit, on répond un emoji, et c'est oublié dans la seconde. La communication est devenue utilitaire et éphémère.",
                version: 1,
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "Envoyer une carte postale, c'est un acte de résistance. C'est dire à l'autre : \"J'ai pris du temps pour toi\". Du temps pour choisir, du temps pour écrire, du temps pour poster. Dans une économie de l'attention, offrir son temps est le cadeau le plus précieux.",
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [
              { type: 'text', text: "L'Objet Tangible : Un Souvenir qui Reste", version: 1 },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Le "Fridge Magnet Effect" (l\'effet magnet de frigo) est puissant. Une carte postale reste affichée des mois, voire des années. Elle devient une décoration, un souvenir physique que l\'on peut toucher. Un SMS ne finit jamais sur le frigo.',
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'Le Meilleur des Deux Mondes', version: 1 }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "Les nouvelles plateformes comme CartePostale.cool ne nient pas le progrès. Au contraire, elles l'utilisent pour faciliter la tradition. On utilise son smartphone pour la photo (car c'est le meilleur appareil qu'on a toujours sur soi), mais on finalise par un objet physique.",
                version: 1,
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "C'est peut-être ça, la modernité : utiliser la technologie pour retrouver de l'humanité.",
                version: 1,
              },
            ],
          },
        ],
      },
    },
  },
  {
    title: 'Top 5 des Destinations Photogéniques pour vos Cartes cet Été',
    slug: 'top-5-destinations-photos-ete',
    category: 'travel',
    excerpt:
      "Vous cherchez l'inspiration pour vos prochaines vacances ? Voici 5 lieux où vos photos seront naturellement des chefs-d'œuvre.",
    content: {
      root: {
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Certains lieux semblent avoir été conçus pour la photographie. La lumière y est différente, les couleurs plus vibrantes. Si vous voulez épater vos proches avec des cartes postales dignes de magazines, voici notre sélection estivale.',
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [
              { type: 'text', text: '1. Santorin, Grèce : Le Classique Intemporel', version: 1 },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Impossible de se tromper avec le contraste blanc éclatant des maisons et le bleu profond de la mer Égée. Astuce : levez-vous tôt pour éviter la foule à Oia et capturer les dômes bleus dans le calme.',
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [
              { type: 'text', text: "2. Kyoto, Japon : L'Élégance Traditionnelle", version: 1 },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "Pour une carte postale empreinte de zenitude. Les torii rouges de Fushimi Inari ou les bambouseraies d'Arashiyama offrent des lignes graphiques incroyables pour vos compositions.",
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [
              { type: 'text', text: '3. La Côte Amalfitaine, Italie : La Dolce Vita', version: 1 },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "Positano est un tableau vivant. Les maisons pastel accrochées à la falaise sont photogéniques sous tous les angles. N'oubliez pas une photo depuis un bateau pour avoir la vue d'ensemble.",
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: "4. L'Islande : Terre de Contrastes", version: 1 }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "Si vous fuyez la canicule, l'Islande offre des paysages dramatiques. Cascades géantes, sable noir, mousse vert fluo... Vos cartes postales ressembleront à des affiches de film.",
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [
              { type: 'text', text: '5. Chefchaouen, Maroc : La Perle Bleue', version: 1 },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "Moins connue que Marrakech, cette ville est entièrement peinte en nuancier de bleus. C'est un studio photo à ciel ouvert. Chaque ruelle, chaque porte est une opportunité artistique.",
                version: 1,
              },
            ],
          },
        ],
      },
    },
  },
]

async function main() {
  const payload = await getPayload({ config })

  console.log('Seeding blog posts...')

  // Check for author (using admin for now)
  const users = await payload.find({
    collection: 'users',
    limit: 1,
  })

  const authorId = users.docs.length > 0 ? users.docs[0].id : null

  for (const post of blogPosts) {
    const existing = await payload.find({
      collection: 'posts',
      where: {
        slug: { equals: post.slug },
      },
    })

    if (existing.totalDocs > 0) {
      console.log(`Updating post: ${post.title}`)
      await payload.update({
        collection: 'posts',
        id: existing.docs[0].id,
        data: {
          title: post.title,
          category: post.category as any,
          excerpt: post.excerpt,
          content: post.content as any,
          // Keep original published date if updated, or update it? Let's keep it simply updated.
        },
      })
    } else {
      console.log(`Creating post: ${post.title}`)
      await payload.create({
        collection: 'posts',
        data: {
          title: post.title,
          slug: post.slug,
          category: post.category as any,
          excerpt: post.excerpt,
          content: post.content as any,
          publishedDate: new Date().toISOString(),
          status: 'published',
          author: authorId,
        },
      })
    }
  }

  console.log('Done seeding blog posts.')
  process.exit(0)
}

main().catch((error) => {
  console.error('Failed to seed blog:', error)
  process.exit(1)
})
