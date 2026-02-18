import React, { Fragment } from 'react'
import Link from 'next/link'

// Simple escape HTML function
const escapeHTML = (str: string) =>
  str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      })[tag] || tag,
  )

type Node = {
  type: string
  value?: any
  children?: Node[]
  url?: string
  [key: string]: any
}

export const Serialize = ({ nodes }: { nodes: Node[] }) => {
  if (!nodes || !Array.isArray(nodes)) return null

  return (
    <>
      {nodes.map((node, i) => {
        if (node.type === 'text') {
          let text = <span dangerouslySetInnerHTML={{ __html: escapeHTML(node.text) }} />

          if (node.format & 1) {
            text = <strong key={i}>{text}</strong>
          }
          if (node.format & 2) {
            text = <em key={i}>{text}</em>
          }
          if (node.format & 8) {
            text = (
              <span
                key={i}
                className="underline decoration-teal-500 decoration-2 underline-offset-2"
              >
                {text}
              </span>
            )
          }
          if (node.format & 4) {
            text = (
              <span key={i} className="line-through text-gray-400">
                {text}
              </span>
            )
          }
          if (node.format & 16) {
            text = (
              <code
                key={i}
                className="bg-gray-100 text-red-500 rounded px-1 py-0.5 font-mono text-sm"
              >
                {text}
              </code>
            )
          }

          return <Fragment key={i}>{text}</Fragment>
        }

        if (!node) {
          return null
        }

        // Handle blocks
        switch (node.type) {
          case 'heading':
            const HeadingTag = (node.tag as any) || 'h1'
            const className =
              {
                h1: 'text-4xl font-bold my-8 text-gray-900 leading-tight border-b pb-4 border-gray-100',
                h2: 'text-3xl font-bold my-6 text-gray-800 leading-tight',
                h3: 'text-2xl font-bold my-5 text-gray-800',
                h4: 'text-xl font-bold my-4 text-gray-800',
                h5: 'text-lg font-bold my-3 text-gray-800',
                h6: 'text-base font-bold my-2 text-gray-800',
              }[HeadingTag] || 'text-xl font-bold my-4'

            return (
              <HeadingTag key={i} className={className}>
                <Serialize nodes={node.children || []} />
              </HeadingTag>
            )

          case 'quote':
            return (
              <blockquote
                key={i}
                className="border-l-4 border-teal-500 pl-6 py-4 italic my-8 text-gray-700 bg-gray-50 rounded-r-lg text-lg leading-relaxed shadow-sm"
              >
                <Serialize nodes={node.children || []} />
              </blockquote>
            )

          case 'list':
            const ListTag = node.tag === 'ol' ? 'ol' : 'ul'
            const listClass =
              node.tag === 'ol'
                ? 'list-decimal ml-6 my-6 space-y-2 marker:text-teal-600 marker:font-bold'
                : 'list-disc ml-6 my-6 space-y-2 marker:text-teal-500'
            return (
              <ListTag key={i} className={listClass}>
                <Serialize nodes={node.children || []} />
              </ListTag>
            )

          case 'listitem':
            return (
              <li key={i} className="pl-2">
                <Serialize nodes={node.children || []} />
              </li>
            )

          case 'link':
            return (
              <a
                href={node.url} // No need to escape here, react handles href attribute safety mostly, but ideally validate url
                key={i}
                target={node.newTab ? '_blank' : undefined}
                rel={node.newTab ? 'noopener noreferrer' : undefined}
                className="text-teal-600 hover:text-teal-800 underline decoration-teal-200 hover:decoration-teal-600 transition-all font-medium"
              >
                <Serialize nodes={node.children || []} />
              </a>
            )

          case 'upload': {
            const value = node.value
            if (value?.url) {
              return (
                <figure
                  key={i}
                  className="my-10 rounded-xl overflow-hidden shadow-lg border border-gray-100 mx-auto max-w-4xl bg-white p-2"
                >
                  <img src={value.url} alt={value.alt || ''} className="w-full h-auto rounded-lg" />
                  {value.caption && (
                    <figcaption className="text-center text-sm text-gray-500 mt-3 italic pb-2">
                      {value.caption}
                    </figcaption>
                  )}
                </figure>
              )
            }
            return null
          }

          case 'paragraph':
            return (
              <p key={i} className="my-5 leading-relaxed text-gray-700 text-lg">
                <Serialize nodes={node.children || []} />
              </p>
            )

          default:
            return (
              <div key={i}>
                <Serialize nodes={node.children || []} />
              </div>
            )
        }
      })}
    </>
  )
}
