import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function isCoordinate(text: string | null | undefined): boolean {
    if (!text) return false
    // Matches patterns like "48.8, 2.3" or "-12.345, 67.890"
    const coordRegex = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/
    return coordRegex.test(text.trim())
}
