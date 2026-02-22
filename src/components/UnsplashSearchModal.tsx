'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { searchUnsplashPhotos, getLocationSuggestions, UnsplashPhoto } from '@/lib/unsplash';
import { cn } from '@/lib/utils';

type ImageSource = 'unsplash' | 'pixabay';

interface GalleryPhoto {
    id: string;
    thumbUrl: string;
    regularUrl: string;
    user: string;
    source: ImageSource;
    alt?: string;
}

interface UnsplashSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (imageUrl: string) => void;
    location?: string;
}

export function UnsplashSearchModal({
    isOpen,
    onClose,
    onSelect,
    location,
}: UnsplashSearchModalProps) {
    const [query, setQuery] = useState('');
    const [source, setSource] = useState<ImageSource>('unsplash');
    const [results, setResults] = useState<GalleryPhoto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const handleSearch = useCallback(async (searchQuery: string, src: ImageSource) => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError(null);
        setQuery(searchQuery);

        try {
            if (src === 'unsplash') {
                const response = await searchUnsplashPhotos(searchQuery);
                const photos: GalleryPhoto[] = response.results.map((p: UnsplashPhoto) => ({
                    id: `unsplash-${p.id}`,
                    thumbUrl: p.urls.small,
                    regularUrl: p.urls.regular,
                    user: p.user.name,
                    source: 'unsplash',
                    alt: p.alt_description || p.description,
                }));
                setResults(photos);
            } else {
                const res = await fetch(`/api/pixabay-images?q=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                const photos: GalleryPhoto[] = (data.hits || []).map((hit: any) => ({
                    id: `pixabay-${hit.id}`,
                    thumbUrl: hit.previewURL || hit.webformatURL,
                    regularUrl: hit.webformatURL || hit.largeImageURL || hit.previewURL,
                    user: hit.user || 'Pixabay',
                    source: 'pixabay',
                    alt: hit.tags,
                }));
                setResults(photos);
                if (data.message && !data.hits?.length) {
                    setError(data.message);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue lors de la recherche.');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            const initialSuggestions = getLocationSuggestions(location);
            setSuggestions(initialSuggestions);
            if (initialSuggestions.length > 0) {
                handleSearch(initialSuggestions[0], source);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run on open/location
    }, [isOpen, location]);

    const onSourceChange = (newSource: ImageSource) => {
        setSource(newSource);
        setError(null);
        if (query.trim()) {
            handleSearch(query, newSource);
        } else if (suggestions.length > 0) {
            handleSearch(suggestions[0], newSource);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch(query, source);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[900px] max-w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white border-none shadow-2xl">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-2xl font-serif font-bold text-stone-800">
                        Galerie d&apos;images
                    </DialogTitle>
                    <DialogDescription className="text-stone-500">
                        Trouvez la photo parfaite parmi des millions d&apos;images gratuites et libres de droits.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 flex flex-col gap-6 overflow-hidden flex-1">
                    {/* Source Tabs */}
                    <div className="flex gap-2 p-1 bg-stone-100 rounded-xl w-fit">
                        <button
                            onClick={() => onSourceChange('unsplash')}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                                source === 'unsplash'
                                    ? 'bg-white text-stone-800 shadow-sm'
                                    : 'text-stone-500 hover:text-stone-700'
                            )}
                        >
                            Unsplash
                        </button>
                        <button
                            onClick={() => onSourceChange('pixabay')}
                            className={cn(
                                'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                                source === 'pixabay'
                                    ? 'bg-white text-stone-800 shadow-sm'
                                    : 'text-stone-500 hover:text-stone-700'
                            )}
                        >
                            Pixabay
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-teal-500 transition-colors" size={20} />
                        <Input
                            placeholder="Rechercher des photos (ex: Plage, Montagne, Paris...)"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="pl-12 h-14 text-lg rounded-2xl border-stone-200 bg-stone-50/50 focus:border-teal-400 focus:ring-teal-400 transition-all"
                        />
                        <Button
                            onClick={() => handleSearch(query, source)}
                            disabled={loading || !query.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white h-10 px-6 font-bold transition-all"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Rechercher'}
                        </Button>
                    </div>

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest self-center mr-2">Suggestions :</span>
                            {suggestions.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => handleSearch(s, source)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-sm font-semibold transition-all",
                                        query === s
                                            ? "bg-teal-500 text-white shadow-md shadow-teal-100"
                                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Results Grid */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full border-4 border-teal-100 border-t-teal-500 animate-spin" />
                                    <ImageIcon size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-teal-500" />
                                </div>
                                <p className="text-stone-500 font-medium animate-pulse">Recherche des meilleures photos...</p>
                            </div>
                        ) : error ? (
                            <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100">
                                <p className="text-red-600 font-medium">{error}</p>
                                <Button variant="outline" onClick={() => handleSearch(query, source)} className="mt-4 border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700">
                                    Réessayer
                                </Button>
                            </div>
                        ) : results.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {results.map((photo) => (
                                    <div
                                        key={photo.id}
                                        className="group relative aspect-[3/2] rounded-xl overflow-hidden bg-stone-100 cursor-pointer border border-stone-200 hover:border-teal-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                        onClick={() => onSelect(photo.regularUrl)}
                                    >
                                        <img
                                            src={photo.thumbUrl}
                                            alt={photo.alt || 'Photo'}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                                            <p className="text-white text-[10px] font-medium truncate">
                                                Par <span className="font-bold underline">{photo.user}</span>
                                            </p>
                                            <p className="text-white/70 text-[8px] uppercase tracking-wider">
                                                {photo.source === 'unsplash' ? 'Unsplash' : 'Pixabay'}
                                            </p>
                                        </div>
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-sm">
                                                <ExternalLink size={12} className="text-stone-600" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : query && !loading ? (
                            <div className="py-20 text-center">
                                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search size={24} className="text-stone-400" />
                                </div>
                                <p className="text-stone-800 font-bold text-lg">Aucun résultat trouvé</p>
                                <p className="text-stone-500">Essayez avec d&apos;autres mots-clés ou suggestions.</p>
                            </div>
                        ) : (
                            <div className="py-20 text-center">
                                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ImageIcon size={24} className="text-teal-500" />
                                </div>
                                <p className="text-stone-800 font-bold text-lg">Prêt à explorer</p>
                                <p className="text-stone-500">Saisissez un mot-clé ou choisissez une suggestion ci-dessus.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between flex-wrap gap-2">
                    <p className="text-[10px] text-stone-400 font-medium flex items-center gap-2">
                        Propulsé par
                        <a href="https://unsplash.com/?utm_source=cartepostale&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="underline font-bold text-stone-500 hover:text-teal-600">Unsplash</a>
                        <span className="text-stone-300">•</span>
                        <a href="https://pixabay.com/?utm_source=cartepostale&utm_medium=referral" target="_blank" rel="noopener noreferrer" className="underline font-bold text-stone-500 hover:text-teal-600">Pixabay</a>
                    </p>
                    <Button variant="ghost" size="sm" onClick={onClose} className="text-stone-400 hover:text-stone-600 font-bold uppercase tracking-widest text-[10px]">
                        Fermer
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
