import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const adminRequestStub = {
  user: {
    id: 1,
    email: 'admin@cartepostale.local',
    role: 'admin',
    collection: 'users',
  },
} as any

const blogPosts = [
  {
    title: 'Comment créer une carte postale inoubliable ?',
    slug: 'comment-creer-une-carte-postale-inoubliable',
    category: 'tips',
    excerpt:
      "Découvrez nos conseils pour capturer l'essence de vos vacances et partager des souvenirs qui marqueront vos proches.",
    content: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'heading',
            tag: 'h2',
            format: '',
            indent: 0,
            version: 1,
            children: [
              {
                type: 'text',
                text: '1. Choisissez la bonne photo',
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
                text: "Une image vaut mille mots. Privilégiez des photos lumineuses, avec un sujet clair. Évitez les contre-jours trop prononcés sauf s'ils sont artistiques.",
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: '2. Écrivez avec le cœur', version: 1 }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "Racontez une anecdote, une émotion, une odeur. Ne dites pas juste 'il fait beau', dites 'le soleil caresse notre peau et l'odeur des pins est enivrante'.",
                version: 1,
              },
            ],
          },
          {
            type: 'quote',
            children: [
              {
                type: 'text',
                text: 'La carte postale est un fragment de bonheur envoyé par la poste (ou par internet !)',
                version: 1,
              },
            ],
          },
        ],
      },
    },
  },
  {
    title: 'Pourquoi la carte postale revient à la mode ?',
    slug: 'pourquoi-la-carte-postale-revient-a-la-mode',
    category: 'lifestyle',
    excerpt:
      "À l'ère du tout numérique, la carte postale fait de la résistance et se réinvente. Analyse d'un phénomène nostalgique et moderne.",
    content: {
      root: {
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "On pensait que les SMS et WhatsApp allaient la tuer. Pourtant, la carte postale n'a jamais été aussi tendance. Pourquoi ce retour en grâce ?",
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'Le besoin de tangible', version: 1 }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "Recevoir une vraie attention, personnalisée, a beaucoup plus de valeur qu'un simple message instantané noyé dans le flux.",
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'Le meilleur des deux mondes', version: 1 }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "Avec CartePostale.cool, vous combinez l'immédiateté du digital et l'émotion du format carte postale. Vous pouvez même ajouter des médias enrichis (audio, vidéo) qui seraient impossibles sur du papier !",
                version: 1,
              },
            ],
          },
        ],
      },
    },
  },
  {
    title: 'Les 5 meilleures destinations pour vos photos cet été',
    slug: 'top-5-destinations-photos-ete',
    category: 'travel',
    excerpt:
      'Envie de paysages à couper le souffle ? Voici notre sélection des spots les plus photogéniques pour vos cartes.',
    content: {
      root: {
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Préparez vos appareils photo et vos smartphones ! Voici les lieux qui feront vibrer vos abonnés et votre famille.',
                version: 1,
              },
            ],
          },
          {
            type: 'list',
            tag: 'ol',
            listType: 'number',
            children: [
              {
                type: 'listitem',
                children: [
                  {
                    type: 'text',
                    text: 'Santorin, Grèce : Pour ses murs blancs et toits bleus.',
                    version: 1,
                  },
                ],
              },
              {
                type: 'listitem',
                children: [
                  {
                    type: 'text',
                    text: 'Kyoto, Japon : Pour ses temples et ses couleurs.',
                    version: 1,
                  },
                ],
              },
              {
                type: 'listitem',
                children: [
                  { type: 'text', text: 'Amalfi, Italie : Pour la dolce vita.', version: 1 },
                ],
              },
              {
                type: 'listitem',
                children: [
                  { type: 'text', text: 'Bali, Indonésie : Pour la luxuriance.', version: 1 },
                ],
              },
              {
                type: 'listitem',
                children: [
                  { type: 'text', text: 'Islande : Pour les contrastes saisissants.', version: 1 },
                ],
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

    if (existing.totalDocs === 0) {
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
      console.log(`Created post: ${post.title}`)
    } else {
      console.log(`Post already exists: ${post.title}`)
    }
  }

  console.log('Done seeding blog posts.')
  process.exit(0)
}

main().catch((error) => {
  console.error('Failed to seed blog:', error)
  process.exit(1)
})
