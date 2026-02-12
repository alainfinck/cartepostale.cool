'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'cartepostale-session-id'

function generateSessionId(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 24; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

export function useSessionId(): string {
    const [sessionId, setSessionId] = useState('')

    useEffect(() => {
        let id = localStorage.getItem(STORAGE_KEY)
        if (!id) {
            id = generateSessionId()
            localStorage.setItem(STORAGE_KEY, id)
        }
        setSessionId(id)
    }, [])

    return sessionId
}
