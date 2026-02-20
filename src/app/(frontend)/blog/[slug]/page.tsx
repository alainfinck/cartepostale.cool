import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Metadata } from 'next'
import { Serialize } from '@/components/RichTextRenderer'

export const dynamic = 'force-dynamic'

interface BlogPostProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config })
  const posts = await payload.find({
    collection: 'posts',
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  const post = posts.docs[0]

  if (!post) {
    return {
      title: 'Article non trouvé',
    }
  }

  return {
    title: `${post.title} - Blog CartePostale.cool`,
    description: post.excerpt || `Lisez notre article sur ${post.title}`,
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      images:
        post.image && typeof post.image !== 'number' && post.image.url ? [post.image.url] : [],
    },
  }
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const posts = await payload.find({
    collection: 'posts',
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  const post = posts.docs[0]

  if (!post) {
    notFound()
  }

  const imageUrl =
    post.image && typeof post.image !== 'number' && post.image.url ? post.image.url : null

  return (
    <article className="min-h-screen pb-20">
      {/* Hero Header */}
      <div className="relative w-full h-[50vh] min-h-[400px] flex items-end">
        {imageUrl ? (
          <>
            <Image src={imageUrl} alt={post.title} fill className="object-cover z-0" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 z-0" />
        )}

        <div className="container mx-auto px-4 pb-12 relative z-20 text-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              {post.category && (
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wider border border-white/30">
                  {post.category === 'travel'
                    ? 'Voyage'
                    : post.category === 'tips'
                      ? 'Astuces'
                      : post.category === 'lifestyle'
                        ? 'Lifestyle'
                        : post.category === 'news'
                          ? 'Actualités'
                          : post.category}
                </span>
              )}
              <span className="text-white/80 text-sm font-medium">
                {post.publishedDate
                  ? new Date(post.publishedDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : ''}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight max-w-3xl">
              {post.title}
            </h1>
            {post.author && typeof post.author === 'object' && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
                  👤
                </div>
                <div>
                  <p className="font-medium text-white">
                    {post.author.name || "L'équipe CartePostale.cool"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-xl -mt-20 z-30 relative">
          <div className="prose prose-lg prose-teal max-w-none">
            {/* 
                     Payload richText content structure usually has a 'root'
                     We pass the children of root to our serializer
                */}
            {post.content && post.content.root && post.content.root.children ? (
              <Serialize nodes={post.content.root.children} />
            ) : (
              <p>Contenu indisponible.</p>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
