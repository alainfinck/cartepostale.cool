export interface MediaItem {
    id: string;
    type: 'image' | 'video';
    url: string;
    key?: string;
    mimeType?: string;
    filesize?: number;
}

/** Position de recadrage de la photo (pour aperçu / éditeur). x,y en % (0–100). */
export interface FrontImageCrop {
    /** Zoom : 1 = fit, >1 = zoom (ex. 1.5 = 150%). */
    scale: number;
    /** Point focal horizontal (%). 50 = centre. */
    x: number;
    /** Point focal vertical (%). 50 = centre. */
    y: number;
}

export interface Postcard {
    id: string;
    frontImage: string;
    /** Recadrage / zoom de la face avant (éditeur uniquement, non persisté). */
    frontImageCrop?: FrontImageCrop;
    frontCaption?: string;
    frontEmoji?: string;
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
    stickers?: StickerPlacement[];
}

export interface Sticker {
    id: string;
    name: string;
    image: string; // URL
    category?: string;
}

export interface StickerPlacement {
    id: string; // Unique instance ID
    stickerId: string;
    x: number; // %
    y: number; // %
    scale: number;
    rotation: number;
    imageUrl?: string; // Cache for display
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

export type TemplateCategory =
    | 'beach' | 'city' | 'nature' | 'travel'
    | 'romantic' | 'festive' | 'food' | 'abstract';

export interface Template {
    id: string;
    name: string;
    description?: string;
    imageUrl: string;
    category: TemplateCategory;
    // Donnees pre-remplies
    frontCaption?: string;
    frontEmoji?: string;
    message?: string;
    location?: string;
    stampStyle?: 'classic' | 'modern' | 'airmail';
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
