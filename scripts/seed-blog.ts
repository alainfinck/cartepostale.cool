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
  {
    title: '5 Astuces pour réussir vos photos de voyage',
    slug: 'astuces-photos-voyage',
    category: 'tips',
    excerpt:
      "Pas besoin d'être un pro pour faire de belles photos. Voici 5 conseils simples pour ramener des souvenirs impérissables et faire des cartes postales qui font mouche.",
    content: {
      root: {
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "On a tous connu ça : ce paysage magnifique devant nos yeux qui rend 'plat' et sans âme une fois en photo. La bonne nouvelle, c'est qu'il suffit souvent de quelques ajustements simples pour transformer vos clichés.",
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: '1. La Lumière est Reine', version: 1 }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "Évitez le soleil de midi, qui écrase les reliefs et crée des ombres dures. Privilégiez la 'Golden Hour' (l'heure dorée), juste après le lever ou avant le coucher du soleil. La lumière est douce, chaude et flatteuse pour tout le monde.",
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: '2. La Règle des Tiers', version: 1 }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "Imaginez une grille de morpion sur votre image (la plupart des téléphones l'affichent). Ne mettez pas votre sujet en plein centre. Placez-le sur l'une des lignes verticales ou à une intersection. Cela rend l'image plus dynamique et laisse 'respirer' le paysage.",
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: "3. Cherchez l'Insolite et le Détail", version: 1 }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "La Tour Eiffel en entier, tout le monde l'a vue. Mais ce chat qui dort sur une chaise de bistrot parisien ? Ces carreaux de faïence colorés à Lisbonne ? Les détails racontent souvent mieux l'ambiance d'un lieu que les grands monuments.",
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: '4. Intégrez de la Vie', version: 1 }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "Un paysage vide peut être beau mais froid. Attendez qu'un cycliste passe, qu'un oiseau s'envole, ou demandez à votre compagnon de voyage de marcher au loin. L'élément humain donne une échelle et une histoire à la photo.",
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: '5. Restez Naturel', version: 1 }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "Côté retouche, ayez la main légère. Un peu de contraste ou de saturation, c'est bien. Mais si le ciel devient violet radioactif, c'est trop. L'authenticité est la tendance actuelle. Vos proches veulent voir ce que vous avez vu, pas un filtre Instagram.",
                version: 1,
              },
            ],
          },
        ],
      },
    },
  },
  {
    title: 'Comment préparer son bagage cabine pour 1 semaine',
    slug: 'bagage-cabine-organisation',
    category: 'tips',
    excerpt:
      "Voyager léger est un art. Fini les frais de bagages en soute et l'attente au tapis roulant. Voici comment tout faire tenir dans un sac à dos !",
    content: {
      root: {
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "Partir une semaine avec juste un bagage cabine ? Ça fait peur à beaucoup, mais c'est la clé de la liberté en voyage. Plus mobile, moins cher, moins de stress. Voici la méthode infaillible.",
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: '1. La Règle du 5-4-3-2-1', version: 1 }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Pour une semaine, limitez-vous à : 5 hauts, 4 bas (short/pantalon/jupe), 3 accessoires, 2 paires de chaussures, 1 maillot de bain. En choisissant des couleurs neutres qui vont toutes ensemble, vous avez plus de 20 tenues différentes !',
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: '2. Roulez, ne pliez pas', version: 1 }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "C'est la base. Rouler ses vêtements serrés permet de gagner un tiers de place en plus et évite les faux plis. Pour les pro, utilisez des cubes de rangement (packing cubes) pour compresser encore plus.",
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: '3. Les Liquides Solides', version: 1 }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Le sac ziploc de 1L est votre ennemi. Passez au solide : shampoing solide, savon, déodorant stick, dentifrice en pastilles. Ça ne compte pas dans la limite des liquides et ça ne coule pas dans le sac !',
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: '4. Portez le plus gros sur vous', version: 1 }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "L'avion est souvent climatisé de toute façon. Portez votre jean le plus lourd, vos grosses baskets et votre pull ou veste sur le dos. C'est autant de place gagnée dans la valise.",
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: '5. Le Tech Minimaliste', version: 1 }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "Avez-vous vraiment besoin de l'ordi, de la tablette ET de la liseuse ? Votre smartphone fait souvent tout ça. Un bon chargeur universel compact et une batterie externe suffisent généralement.",
                version: 1,
              },
            ],
          },
        ],
      },
    },
  },
  {
    title: 'City Guide : Un week-end magique à Cannes',
    slug: 'city-guide-cannes',
    category: 'travel',
    excerpt:
      "Cannes, ce n'est pas que le Festival et les paillettes. Découvrez le charme authentique de la perle de la Côte d'Azur en 48h.",
    content: {
      root: {
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "Mondialement connue pour son tapis rouge, Cannes cache bien son jeu. Derrière le glamour se cache une ville provençale authentique, baignée de lumière et d'histoire. Voici notre itinéraire idéal.",
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'Samedi Matin : Le Suquet Historique', version: 1 }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "Commencez par grimper dans le Suquet, la vieille ville. Perdez-vous dans les ruelles pavées et fleuries. Montez jusqu'à l'église Notre-Dame d'Espérance pour la vue panoramique sur la baie. C'est LE spot photo incontournable.",
                version: 1,
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Redescendez faire un tour au Marché Forville (fermé le lundi) pour goûter à la Socca locale et acheter quelques fruits frais.',
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [
              { type: 'text', text: 'Samedi Après-midi : La Croisette et la Plage', version: 1 },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Impossible de venir à Cannes sans arpenter la Croisette. Admirez les palaces, les chaises bleues emblématiques. En fin de journée, offrez-vous un verre en terrasse face à la mer pour le coucher de soleil.',
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'Dimanche : Évasion aux Îles de Lérins', version: 1 }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "À 15 minutes de bateau se trouve un autre monde : l'île Sainte-Marguerite. Pas de voiture, juste des pins, des criques turquoises et le chant des cigales. Visitez le Fort Royal (où fut emprisonné l'Homme au Masque de Fer) et pique-niquez au bord de l'eau.",
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'Nos Adresses Gourmandes', version: 1 }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "Pour un dîner authentique, fuyez les 'pièges à touristes' du bord de mer et cherchez les petits restos rue Saint-Antoine dans le Suquet. L'ambiance y est chaleureuse et la cuisine souvent familiale.",
                version: 1,
              },
            ],
          },
        ],
      },
    },
  },
  {
    title: "L'évolution de la carte postale à l'ère du numérique",
    slug: 'evolution-carte-postale',
    category: 'lifestyle',
    excerpt:
      "Du carton imprimé à l'expérience multimédia connectée : retour sur 150 ans d'histoire et un futur prometteur.",
    content: {
      root: {
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "On a souvent prédit sa mort. L'email, puis MMS, puis les réseaux sociaux devaient l'enterrer. Pourtant, la carte postale survit et se transforme. Comment ce rectangle de carton a-t-il traversé les époques ?",
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: "L'Âge d'Or (1900-1920)", version: 1 }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "Au début du XXe siècle, c'était le SMS de l'époque ! On s'en envoyait plusieurs par jour, pour se donner rendez-vous ou juste dire bonjour. Les facteurs passaient plusieurs fois par jour. C'était le premier média social visuel de masse.",
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'Le Déclin et la Banalisation', version: 1 }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Avec le téléphone, puis internet, la carte postale est devenue un rituel de vacances un peu kitsch. On achetait des vues génériques, on écrivait trois mots, et ça arrivait (parfois) après notre retour. Elle a perdu son utilité de communication pour devenir un pur symbole.',
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'Le Renouveau Hybride', version: 1 }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "Aujourd'hui, nous vivons une renaissance. Nous avons des milliers de photos dans nos téléphones, mais nous manquons de tangible. Les services comme CartePostale.cool font le pont : la facilité du numérique (on utilise ses propres photos, on écrit sur son clavier) avec l'émotion du physique (une vraie carte dans la boîte aux lettres).",
                version: 1,
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'La Carte Postale 2.0', version: 1 }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "Le futur est interactif. Imaginez scanner votre carte reçue pour voir la vidéo du moment où la photo a été prise. Ou entendre la voix de l'expéditeur. La carte devient une porte d'entrée vers une expérience plus riche, tout en gardant sa valeur d'objet collectionnable.",
                version: 1,
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'La technologie ne tue pas la tradition, elle lui donne un nouveau souffle. Alors, à vos claviers... et à vos timbres !',
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
