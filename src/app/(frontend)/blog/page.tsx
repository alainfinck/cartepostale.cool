import React from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Blog - CartePostale.cool',
  description: 'Découvrez nos astuces, actualités et inspirations pour vos cartes postales.',
}

export default async function BlogPage() {
  const payload = await getPayload({ config })

  const posts = await payload.find({
    collection: 'posts',
    where: {
      status: {
        equals: 'published',
      },
    },
    sort: '-publishedDate',
  })

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
          Le Blog <span className="text-teal-600">CartePostale.cool</span>
        </h1>
        <p className="text-xl text-gray-600">
          Inspirations, nouveautés et conseils pour sublimer vos souvenirs de voyage.
        </p>
      </div>

      {posts.totalDocs === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-xl">Bientôt de nouveaux articles !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.docs.map((post) => {
            const imageUrl =
              post.image && typeof post.image !== 'number' && post.image.url ? post.image.url : null

            return (
              <article
                key={post.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col h-full overflow-hidden group"
              >
                {imageUrl ? (
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="h-56 w-full bg-teal-50 flex items-center justify-center">
                    <span className="text-teal-200 text-6xl">📝</span>
                  </div>
                )}

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-3">
                    {post.category && (
                      <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md uppercase tracking-wider">
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
                    <span className="text-xs text-gray-400">
                      {post.publishedDate
                        ? new Date(post.publishedDate).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : ''}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold mb-3 text-gray-800 leading-tight">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:text-teal-600 transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h2>

                  {post.excerpt && (
                    <p className="text-gray-600 mb-6 line-clamp-3 text-sm flex-grow">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="mt-auto pt-4 border-t border-gray-50">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-teal-600 font-medium hover:text-teal-800 text-sm inline-flex items-center gap-1 group/link"
                    >
                      Lire l'article
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 transition-transform group-hover/link:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
