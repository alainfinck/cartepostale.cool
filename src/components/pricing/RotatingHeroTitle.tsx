'use client'

import React, { useState, useEffect } from 'react'

const PHRASES = [
  'À un prix dérisoire face au papier',
  'Envoi illimité de destinataires par carte',
  'Photo, vidéo, message vocal : même prix',
  'Cartes 100 % virtuelles, avec stats de visite',
]

const ROTATION_MS = 4200

export function RotatingHeroTitle() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    const t = setInterval(() => {
      setVisible(false)
      timeoutId = setTimeout(() => {
        setIndex((i) => (i + 1) % PHRASES.length)
        setVisible(true)
      }, 300)
    }, ROTATION_MS)
    return () => {
      clearInterval(t)
      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <span
      className={`inline-block min-h-[1.4em] text-teal-600 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
      }`}
    >
      {PHRASES[index]}
    </span>
  )
}
