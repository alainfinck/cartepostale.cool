'use client'

import React, { useState, useEffect } from 'react'

interface WordRotateProps {
    words: string[]
    duration?: number
    className?: string
}

export default function WordRotate({
    words,
    duration = 2500,
    className = '',
}: WordRotateProps) {
    const [index, setIndex] = useState(0)
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible(false)
            setTimeout(() => {
                setIndex((prevIndex) => (prevIndex + 1) % words.length)
                setIsVisible(true)
            }, 500) // Half second to fade out before switching word
        }, duration)

        return () => clearInterval(interval)
    }, [words, duration])

    return (
        <span
            className={`inline-block transition-all duration-500 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                } ${className}`}
        >
            {words[index]}
        </span>
    )
}
