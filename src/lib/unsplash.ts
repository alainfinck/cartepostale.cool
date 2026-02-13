/**
 * Unsplash API Utility
 */

const ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
const API_URL = 'https://api.unsplash.com';

export interface UnsplashPhoto {
    id: string;
    urls: {
        regular: string;
        small: string;
        thumb: string;
    };
    user: {
        name: string;
        links: {
            html: string;
        };
    };
    links: {
        html: string;
    };
    description?: string;
    alt_description?: string;
}

export interface UnsplashSearchResponse {
    results: UnsplashPhoto[];
    total: number;
    total_pages: number;
}

export type UnsplashOrderBy = 'relevant' | 'latest';

/**
 * Searches photos on Unsplash
 */
export async function searchUnsplashPhotos(
    query: string,
    page = 1,
    perPage = 20,
    orderBy: UnsplashOrderBy = 'relevant'
): Promise<UnsplashSearchResponse> {
    if (!ACCESS_KEY) {
        console.error('Unsplash Access Key is missing');
        return { results: [], total: 0, total_pages: 0 };
    }

    const response = await fetch(
        `${API_URL}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&order_by=${orderBy}&client_id=${ACCESS_KEY}`
    );

    if (!response.ok) {
        const error = await response.json();
        console.error('Unsplash API error:', error);
        throw new Error(error.errors?.[0] || 'Failed to fetch photos from Unsplash');
    }

    return response.json();
}

/**
 * Generates search suggestions based on location
 */
export function getLocationSuggestions(location?: string): string[] {
    if (!location) return ['Nature', 'Voyage', 'Paysage', 'Plage', 'Montagne'];

    const suggestions = [location];

    // If location contains a comma, add the first part (e.g., "Paris, France" -> "Paris")
    if (location.includes(',')) {
        const city = location.split(',')[0].trim();
        if (city && city !== location) {
            suggestions.push(city);
        }
    }

    // Add generic scenic terms combined with location
    suggestions.push(`${location} landscape`);
    suggestions.push(`${location} nature`);

    return suggestions;
}
