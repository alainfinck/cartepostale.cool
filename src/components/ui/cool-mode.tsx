"use client"

import React, { ReactNode, useEffect, useRef } from "react"

export interface BaseParticle {
  element: HTMLElement | SVGSVGElement
  left: number
  size: number
  top: number
}

export interface BaseParticleOptions {
  particle?: string
  size?: number
  effect?: "fountain" | "balloon"
}

export interface CoolParticle extends BaseParticle {
  direction: number
  speedHorz: number
  speedUp: number
  spinSpeed: number
  spinVal: number
  alpha: number
  scale: number
}

export interface CoolParticleOptions extends BaseParticleOptions {
  particleCount?: number
  speedHorz?: number
  speedUp?: number
}

const getContainer = () => {
  const id = "_coolMode_effect"
  const existingContainer = document.getElementById(id)

  if (existingContainer) {
    return existingContainer
  }

  const container = document.createElement("div")
  container.setAttribute("id", id)
  container.setAttribute(
    "style",
    "overflow:hidden; position:fixed; height:100%; top:0; left:0; right:0; bottom:0; pointer-events:none; z-index:2147483647"
  )

  document.body.appendChild(container)

  return container
}

let instanceCounter = 0

const applyParticleEffect = (
  element: HTMLElement,
  options?: CoolParticleOptions
): (() => void) => {
  instanceCounter++

  const defaultParticle = "circle"
  const particleType = options?.particle || defaultParticle
  const sizes = [15, 20, 25, 35, 45]
  const limit = 45
  const effect = options?.effect || "fountain"

  let particles: CoolParticle[] = []
  let autoAddParticle = false
  let mouseX = 0
  let mouseY = 0

  const container = getContainer()

  function generateParticle() {
    const size =
      options?.size || sizes[Math.floor(Math.random() * sizes.length)]

    // Default fountain values
    let speedHorz = options?.speedHorz || Math.random() * 10
    let speedUp = options?.speedUp || Math.random() * 25
    const spinVal = Math.random() * 360
    const spinSpeed = Math.random() * 35 * (Math.random() <= 0.5 ? -1 : 1)
    const top = mouseY - size / 2
    const left = mouseX - size / 2
    const direction = Math.random() <= 0.5 ? -1 : 1

    // Balloon overrides
    if (effect === "balloon") {
      speedHorz = (Math.random() * 2) + 0.5 // Slower horizontal drift
      speedUp = (Math.random() * 3) + 2     // Slow steady upward rise
    }

    const particle = document.createElement("div")

    if (particleType === "circle") {
      const svgNS = "http://www.w3.org/2000/svg"
      const circleSVG = document.createElementNS(svgNS, "svg")
      const circle = document.createElementNS(svgNS, "circle")
      circle.setAttributeNS(null, "cx", (size / 2).toString())
      circle.setAttributeNS(null, "cy", (size / 2).toString())
      circle.setAttributeNS(null, "r", (size / 2).toString())
      circle.setAttributeNS(
        null,
        "fill",
        `hsl(${Math.random() * 360}, 70%, 50%)`
      )

      circleSVG.appendChild(circle)
      circleSVG.setAttribute("width", size.toString())
      circleSVG.setAttribute("height", size.toString())

      particle.appendChild(circleSVG)
    } else if (
      particleType.startsWith("http") ||
      particleType.startsWith("/")
    ) {
      // Handle URL-based images
      particle.innerHTML = `<img src="${particleType}" width="${size}" height="${size}" style="border-radius: 50%">`
    } else {
      // Handle emoji or text characters
      const fontSizeMultiplier = effect === "balloon" ? 1.5 : 3
      const emojiSize = size * fontSizeMultiplier
      particle.innerHTML = `<div style="font-size: ${emojiSize}px; line-height: 1; text-align: center; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; transform: scale(${fontSizeMultiplier}); transform-origin: center;">${particleType}</div>`
    }

    particle.style.position = "absolute"
    particle.style.transform = `translate3d(${left}px, ${top}px, 0px) rotate(${spinVal}deg)`
    if (effect === "balloon") {
      particle.style.opacity = "1";
      particle.style.transition = "transform 0.1s linear"; // Smooth movement
    }

    container.appendChild(particle)

    particles.push({
      direction,
      element: particle,
      left,
      size,
      speedHorz,
      speedUp,
      spinSpeed,
      spinVal,
      top,
      alpha: 1,
      scale: 1,
    })
  }

  function refreshParticles() {
    particles.forEach((p) => {
      if (effect === "balloon") {
        // Balloon physics
        p.left = p.left - p.speedHorz * p.direction + Math.sin(p.top / 50) * 1 // Add waviness
        p.top = p.top - p.speedUp
        p.spinVal = p.spinVal + p.spinSpeed * 0.1 // Slower spin
        p.scale += 0.005 // Slowly grow
        p.alpha -= 0.005 // Slowly fade

        if (p.alpha <= 0 || p.top < -p.size) {
          particles = particles.filter((o) => o !== p)
          p.element.remove()
          return
        }

        p.element.setAttribute(
          "style",
          [
            "position:absolute",
            "will-change:transform, opacity",
            `top:${p.top}px`,
            `left:${p.left}px`,
            `opacity:${p.alpha}`,
            `transform:rotate(${p.spinVal}deg) scale(${p.scale})`,
          ].join(";")
        )

      } else {
        // Default Fountain physics
        p.left = p.left - p.speedHorz * p.direction
        p.top = p.top - p.speedUp
        p.speedUp = Math.min(p.size, p.speedUp - 1)
        p.spinVal = p.spinVal + p.spinSpeed

        if (
          p.top >=
          Math.max(window.innerHeight, document.body.clientHeight) + p.size
        ) {
          particles = particles.filter((o) => o !== p)
          p.element.remove()
        }

        p.element.setAttribute(
          "style",
          [
            "position:absolute",
            "will-change:transform",
            `top:${p.top}px`,
            `left:${p.left}px`,
            `transform:rotate(${p.spinVal}deg)`,
          ].join(";")
        )
      }
    })
  }

  let animationFrame: number | undefined

  let lastParticleTimestamp = 0
  const particleGenerationDelay = 30

  function loop() {
    const currentTime = performance.now()
    if (
      autoAddParticle &&
      particles.length < limit &&
      currentTime - lastParticleTimestamp > particleGenerationDelay
    ) {
      generateParticle()
      lastParticleTimestamp = currentTime
    }

    refreshParticles()
    animationFrame = requestAnimationFrame(loop)
  }

  loop()

  const isTouchInteraction = "ontouchstart" in window

  const tap = isTouchInteraction ? "touchstart" : "mousedown"
  const tapEnd = isTouchInteraction ? "touchend" : "mouseup"
  const move = isTouchInteraction ? "touchmove" : "mousemove"

  const updateMousePosition = (e: MouseEvent | TouchEvent) => {
    if ("touches" in e) {
      mouseX = e.touches?.[0].clientX
      mouseY = e.touches?.[0].clientY
    } else {
      mouseX = e.clientX
      mouseY = e.clientY
    }
  }

  const tapHandler = (e: MouseEvent | TouchEvent) => {
    updateMousePosition(e)
    autoAddParticle = true
  }

  const disableAutoAddParticle = () => {
    autoAddParticle = false
  }

  element.addEventListener(move, updateMousePosition, { passive: true })
  element.addEventListener(tap, tapHandler, { passive: true })
  element.addEventListener(tapEnd, disableAutoAddParticle, { passive: true })
  element.addEventListener("mouseleave", disableAutoAddParticle, {
    passive: true,
  })

  return () => {
    element.removeEventListener(move, updateMousePosition)
    element.removeEventListener(tap, tapHandler)
    element.removeEventListener(tapEnd, disableAutoAddParticle)
    element.removeEventListener("mouseleave", disableAutoAddParticle)

    const interval = setInterval(() => {
      if (animationFrame && particles.length === 0) {
        cancelAnimationFrame(animationFrame)
        clearInterval(interval)

        if (--instanceCounter === 0) {
          container.remove()
        }
      }
    }, 500)
  }
}

interface CoolModeProps {
  children: ReactNode
  options?: CoolParticleOptions
}

export const CoolMode: React.FC<CoolModeProps> = ({ children, options }) => {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (ref.current) {
      return applyParticleEffect(ref.current, options)
    }
  }, [options])

  return <span ref={ref}>{children}</span>
}
