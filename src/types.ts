export interface MediaItem {
    id: string;
    type: 'image' | 'video';
    url: string;
}

export interface Postcard {
    id: string;
    frontImage: string;
    message: string;
    recipientName: string;
    senderName: string;
    senderEmail?: string;
    location: string;
    coords?: {
        lat: number;
        lng: number;
    };
    greeting?: string;
    stampStyle: 'classic' | 'modern' | 'airmail';
    /** Personnalisation du timbre (ex: "Digital Poste") */
    stampLabel?: string;
    /** Année affichée sur le timbre (ex: "2024") */
    /** Année affichée sur le timbre (ex: "2024") */
    stampYear?: string;
    /** Texte du tampon (ex: "Paris, France") */
    postmarkText?: string;
    date: string;
    status?: 'published' | 'draft' | 'archived';
    views?: number;
    shares?: number;
    mediaItems?: MediaItem[];
    isPremium?: boolean;
    agencyId?: string;
    brandLogo?: string;
}

export interface AgencyConfig {
    id: string;
    name: string;
    logo: string;
    primaryColor: string;
    imageBank: string[];
    qrCodeUrl: string;
}

export interface Lead {
    id: string;
    senderEmail: string;
    recipientEmail: string;
    date: string;
    location: string;
}

export interface Template {
    id: string;
    name: string;
    imageUrl: string;
    category: 'Beach' | 'City' | 'Mountain' | 'Abstract';
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'client' | 'user';
    company?: string;
    cardsCreated: number;
    plan: 'free' | 'pro' | 'enterprise';
}

export enum ViewState {
    HOME = 'HOME',
    EDITOR = 'EDITOR',
    GALLERY = 'GALLERY',
    PRICING = 'PRICING',
    BUSINESS = 'BUSINESS',
    SHOWCASE = 'SHOWCASE',
    ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
    CLIENT_PORTAL = 'CLIENT_PORTAL'
}
