'use client'

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Postcard } from '@/types';
import { RotateCw, MapPin, X, Play, ChevronLeft, ChevronRight, Maximize2, Camera } from 'lucide-react';

import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic'

// Dynamically import MapModal to avoid SSR issues with Leaflet
const MapModal = dynamic(() => import('@/components/ui/MapModal'), {
    ssr: false,
    loading: () => null
})

interface PostcardViewProps {
    postcard: Postcard;
    isPreview?: boolean;
    flipped?: boolean;
    className?: string;
}

const PostcardView: React.FC<PostcardViewProps> = ({ postcard, isPreview = false, flipped, className }) => {
    const [isFlipped, setIsFlipped] = useState(flipped ?? false);

    useEffect(() => {
        if (flipped !== undefined) {
            setIsFlipped(flipped);
        }
    }, [flipped]);
    const [isAlbumOpen, setIsAlbumOpen] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    const handleFlip = (e: React.MouseEvent) => {
        // Don't flip if clicking buttons
        if ((e.target as HTMLElement).closest('button')) return;
        setIsFlipped(!isFlipped);
    };

    const openAlbum = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsAlbumOpen(true);
    };

    const openMap = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (postcard.coords || postcard.location) {
            setIsMapOpen(true);
        }
    };

    const nextMedia = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (postcard.mediaItems) {
            setCurrentMediaIndex((prev) => (prev + 1) % postcard.mediaItems!.length);
        }
    };

    const prevMedia = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (postcard.mediaItems) {
            setCurrentMediaIndex((prev) => (prev - 1 + postcard.mediaItems!.length) % postcard.mediaItems!.length);
        }
    };

    const hasMedia = postcard.mediaItems && postcard.mediaItems.length > 0;

    useEffect(() => {
        setPortalRoot(document.body);
    }, []);

    const renderAlbumModal = () => {
        if (!portalRoot || !isAlbumOpen || !hasMedia) return null;

        return createPortal(
            <div 
                className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
                onClick={() => setIsAlbumOpen(false)}
            >
                <div 
                    className="w-full max-w-4xl flex flex-col items-center relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => setIsAlbumOpen(false)}
                        className="absolute -top-10 right-0 text-white/50 hover:text-white transition-colors"
                    >
                        <X size={32} />
                    </button>

                    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl flex items-center justify-center mb-6">
                        {postcard.mediaItems![currentMediaIndex].type === 'video' ? (
                            <video controls autoPlay className="max-w-full max-h-[70vh]">
                                <source src={postcard.mediaItems![currentMediaIndex].url} />
                            </video>
                        ) : (
                            <img
                                src={postcard.mediaItems![currentMediaIndex].url}
                                className="max-w-full max-h-[70vh] object-contain"
                                alt="Album item"
                            />
                        )}

                        {postcard.mediaItems!.length > 1 && (
                            <>
                                <button
                                    onClick={prevMedia}
                                    className="absolute left-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white backdrop-blur-md transition-all"
                                >
                                    <ChevronLeft size={32} />
                                </button>
                                <button
                                    onClick={nextMedia}
                                    className="absolute right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white backdrop-blur-md transition-all"
                                >
                                    <ChevronRight size={32} />
                                </button>
                            </>
                        )}
                    </div>

                    <div className="flex gap-4 overflow-x-auto max-w-full pb-4 px-2">
                        {postcard.mediaItems!.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentMediaIndex(idx)}
                                className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${currentMediaIndex === idx ? 'border-teal-500 opacity-100 scale-105' : 'border-transparent opacity-50 hover:opacity-80'
                                    }`}
                                aria-label={`Voir le média ${idx + 1}`}
                            >
                                {item.type === 'video' ? (
                                    <div className="w-full h-full bg-stone-800 flex items-center justify-center">
                                        <Play size={20} className="text-white" />
                                    </div>
                                ) : (
                                    <img src={item.url} className="w-full h-full object-cover" alt="thumbnail" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>,
            portalRoot
        );
    };



    return (
        <>
            <div className="flex flex-col items-center gap-6">
                <div
                    className={cn(
                        "perspective-1000 cursor-pointer group",
                        "w-[340px] h-[240px] sm:w-[600px] sm:h-[400px]",
                        className
                    )}
                    onClick={handleFlip}
                >
                    <div
                        className={cn(
                            "relative w-full h-full duration-700 transform-style-3d transition-transform",
                            isFlipped ? 'rotate-y-180' : ''
                        )}
                    >
                        {/* Front of Card */}
                        <div className="absolute w-full h-full backface-hidden rounded-xl shadow-2xl overflow-hidden bg-white border border-stone-200">
                            <img
                                src={postcard.frontImage}
                                alt="Postcard Front"
                                className="w-full h-full object-cover"
                            />



                            {postcard.location && (
                                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm text-teal-900 px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2 transform transition-transform group-hover:scale-105">
                                    <MapPin size={16} className="text-orange-500" />
                                    <span className="uppercase tracking-wide">{postcard.location}</span>
                                </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
                        </div>

                        {/* Back of Card */}
                        <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-xl shadow-2xl bg-[#fafaf9] border border-stone-200 p-5 sm:p-8 flex">
                            {/* Small branding bottom-left */}
                            <div className="absolute bottom-3 left-6 text-stone-300 text-[8px] font-bold tracking-[0.2em] uppercase flex items-center gap-1.5">
                                <div className="w-1 h-1 bg-stone-200 rounded-full" />
                                cartepostale.cool
                            </div>
                            <div className="absolute left-1/2 top-10 bottom-10 w-px bg-stone-300 hidden sm:block opacity-50"></div>

                            <div className="flex w-full h-full gap-5 sm:gap-8">
                                {/* Left Side: Message - wider and more vertical space */}
                                <div className="flex-[1.25] min-w-0 flex flex-col justify-start relative pt-2">

                                    <div className="flex-1 flex flex-col justify-start items-start my-1 min-h-0">
                                        <p className="font-handwriting text-stone-700 text-sm sm:text-lg leading-loose sm:leading-loose line-clamp-7 sm:line-clamp-none text-left">
                                            {postcard.message}
                                        </p>
                                    </div>
                                    {postcard.senderName && (
                                        <p className="font-handwriting text-stone-800 text-lg sm:text-xl mt-auto self-start text-teal-700 transform -rotate-2 pt-1">
                                            - {postcard.senderName}
                                        </p>
                                    )}
                                </div>

                                {/* Right Side: Address & Stamp */}
                                <div className="flex-1 flex flex-col relative min-w-0">
                                    {/* Top Section: Album button (left) + Stamp (right, smaller) */}
                                    <div className="flex flex-col items-end gap-2 mb-2">
                                        {/* Stamp - plus petit et plus réaliste */}
                                        {(() => {
                                            const style = postcard.stampStyle || 'classic';
                                            const label = (postcard.stampLabel || 'Digital Poste').trim() || 'Digital Poste';
                                            const year = (postcard.stampYear || '2024').trim() || '2024';
                                            // Split text for postmark if too long or multiline needed? defaulted to location/date
                                            const pmText = postcard.postmarkText || (postcard.location ? postcard.location.split(',')[0] : 'Digital');
                                            
                                            return (
                                                <div className="relative group-hover:rotate-2 transition-transform duration-500 ease-out py-2 pr-2">
                                                    
                                                    {/* The Stamp itself - Reduced size (w-20/h-24 on desktop) */}
                                                    <div className="w-16 h-20 sm:w-24 sm:h-28 relative shadow-[2px_3px_5px_rgba(0,0,0,0.2)] transform rotate-1">
                                                        
                                                        {/* Classic: perforated edges using radial-gradient mask/clip for realism */}
                                                        {style === 'classic' && (
                                                            <div className="w-full h-full bg-[#fdf5e6] p-1.5 relative overflow-hidden"
                                                                style={{
                                                                    // CSS-only sawtooth wave pattern for edges
                                                                    mask: 'conic-gradient(from 45deg, transparent 0deg 90deg, black 90deg 360deg) 0 0/10px 10px round',
                                                                    WebkitMask: 'conic-gradient(from 45deg, transparent 0deg 90deg, black 90deg 360deg) 0 0/10px 10px round'
                                                                }}
                                                            >
                                                                <div className="w-full h-full border-[1.5px] border-orange-300/60 flex flex-col items-center justify-between p-1 bg-white/40">
                                                                    <div className="text-[6px] sm:text-[8px] font-bold text-orange-900/80 uppercase tracking-wide text-center w-full truncate px-1">{label}</div>
                                                                    <div className="flex-1 flex items-center justify-center opacity-80 mix-blend-multiply">
                                                                         {/* Generic symbol */}
                                                                         <div className="w-8 h-8 sm:w-12 sm:h-12 border border-orange-200/50 rounded-full flex items-center justify-center">
                                                                            <img src="https://i.imgur.com/R21Yw3x.png" className="w-6 h-6 sm:w-9 sm:h-9 object-contain grayscale contrast-125 opacity-60" alt="stamp" />
                                                                         </div>
                                                                    </div>
                                                                    <div className="text-[6px] sm:text-[8px] font-serif font-bold text-orange-900/60">{year}</div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Modern: Gradient, rounded */}
                                                        {style === 'modern' && (
                                                            <div className="w-full h-full rounded-lg bg-gradient-to-tr from-teal-50 to-white border border-teal-200 shadow-sm flex flex-col items-center justify-between p-2 relative overflow-hidden">
                                                                <div className="absolute top-0 left-0 w-full h-1 bg-teal-400/30"></div>
                                                                <div className="text-[6px] sm:text-[8px] font-bold text-teal-800 uppercase tracking-widest">{label}</div>
                                                                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full border border-teal-200 flex items-center justify-center bg-teal-50/50">
                                                                    <span className="text-[8px] sm:text-[10px] font-bold text-teal-600/80">POST</span>
                                                                </div>
                                                                <div className="text-[7px] sm:text-[9px] font-semibold text-teal-700/60">{year}</div>
                                                                <div className="absolute bottom-0 left-0 w-full h-1 bg-teal-400/30"></div>
                                                            </div>
                                                        )}

                                                        {/* Airmail: Stripes */}
                                                        {style === 'airmail' && (
                                                            <div className="w-full h-full bg-white p-1 shadow-sm relative overflow-hidden"
                                                                style={{
                                                                    mask: 'radial-gradient(circle at 2px 2px, transparent 2px, black 0) -2px -2px / 11px 11px repeat-x, radial-gradient(circle at 2px 2px, transparent 2px, black 0) -2px -2px / 11px 11px repeat-y',
                                                                    WebkitMask: 'radial-gradient(circle at 50% 50%, white, white)' // Fallback generic because radial zig-zag complex in CSS
                                                                }}
                                                            >
                                                                <div className="absolute inset-0 border-4 border-transparent" 
                                                                    style={{
                                                                        backgroundImage: 'repeating-linear-gradient(135deg, #ef4444 0, #ef4444 10px, transparent 10px, transparent 20px, #3b82f6 20px, #3b82f6 30px, transparent 30px, transparent 40px)'
                                                                    }} 
                                                                ></div>
                                                                <div className="absolute inset-2 bg-white flex flex-col items-center justify-center gap-1 shadow-inner">
                                                                    <div className="text-[5px] sm:text-[6px] font-black text-blue-800 uppercase tracking-widest">AIR MAIL</div>
                                                                    <div className="text-[6px] sm:text-[8px] font-bold text-stone-600 text-center leading-none">{label}</div>
                                                                    <div className="text-[6px] sm:text-[8px] font-bold text-red-600">{year}</div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Subtle paper texture overlay */}
                                                        <div className="absolute inset-0 bg-stone-50 opacity-10 mix-blend-multiply pointer-events-none"></div>
                                                    </div>

                                                    {/* Realistic Postmark (Tampon) - SVG Overlay */}
                                                    <div className="absolute -left-6 top-6 w-20 h-20 sm:w-28 sm:h-28 pointer-events-none z-20 mix-blend-multiply opacity-85 transform -rotate-12">
                                                        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm text-stone-800/70 fill-current">
                                                            <defs>
                                                                <path id="curve" d="M 15,50 A 35,35 0 1,1 85,50 A 35,35 0 1,1 15,50" />
                                                                <filter id="roughness">
                                                                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
                                                                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
                                                                </filter>
                                                            </defs>
                                                            <g filter="url(#roughness)">
                                                                {/* Outer Circle */}
                                                                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" />
                                                                {/* Inner Circle */}
                                                                <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="1" />
                                                                
                                                                {/* Wavy lines */}
                                                                <path d="M10,50 Q30,45 50,50 T90,50" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
                                                                <path d="M12,56 Q32,51 52,56 T88,56" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
                                                                <path d="M12,44 Q32,39 52,44 T88,44" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />

                                                                {/* Text on curve */}
                                                                <text fontSize="7.5" fontWeight="bold" letterSpacing="1" textAnchor="middle">
                                                                    <textPath href="#curve" startOffset="50%" className="uppercase">
                                                                        {pmText.length > 20 ? pmText.substring(0, 18) + '..' : pmText || 'POSTE AERIENNE'}
                                                                    </textPath>
                                                                </text>
                                                                
                                                                {/* Center Date */}
                                                                <text x="50" y="52" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle" className="uppercase">
                                                                    {postcard.date.split('/').slice(0, 2).join('/')}
                                                                </text>
                                                                <text x="50" y="60" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle" className="uppercase">
                                                                    {postcard.date.split('/')[2] || '2024'}
                                                                </text>
                                                            </g>
                                                        </svg>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {hasMedia && (
                                            <button
                                                onClick={openAlbum}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-stone-900/80 hover:bg-stone-900 text-white rounded-2xl transition-all shadow-sm shadow-stone-900/40 backdrop-blur-sm border border-white/20 text-[11px] tracking-[0.2em] uppercase whitespace-nowrap"
                                            >
                                                <Camera size={16} className="text-white/90" />
                                                <span className="text-[10px] font-semibold">{"Voir l'album"}</span>
                                                <span className="text-[8px] text-white/70">({postcard.mediaItems!.length})</span>
                                            </button>
                                        )}
                                    </div>
                                    <div className="mt-auto w-full">
                                        {postcard.recipientName && (
                                            <div className="border-b-2 border-stone-300 border-dotted pb-1 mb-2 font-handwriting text-xl sm:text-2xl text-stone-600 pl-4">
                                                {postcard.recipientName}
                                            </div>
                                        )}
                                        {postcard.location && (
                                            <div className="relative group/map">
                                                <h4 className="font-bold text-stone-400 text-[10px] uppercase mb-1 tracking-wider flex items-center gap-1">
                                                    <MapPin size={10} /> {postcard.location}
                                                </h4>
                                                <div className="w-full h-24 sm:h-40 bg-stone-100 rounded-lg overflow-hidden border border-stone-200 relative cursor-pointer hover:border-teal-400 transition-colors" onClick={openMap}>
                                                    <iframe
                                                        title="Mini Map"
                                                        width="100%"
                                                        height="100%"
                                                        frameBorder="0"
                                                        scrolling="no"
                                                        className="opacity-80 group-hover/map:opacity-100 transition-opacity pointer-events-none"
                                                        src={`https://www.google.com/maps?q=${encodeURIComponent(postcard.location)}&output=embed&z=10`}
                                                    ></iframe>
                                                    <div className="absolute inset-0 bg-transparent flex items-center justify-center">
                                                        <div className="bg-white/80 p-2 rounded-full opacity-0 group-hover/map:opacity-100 transition-opacity transform scale-75 group-hover/map:scale-100 shadow-sm">
                                                            <Maximize2 size={16} className="text-stone-700" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-teal-600/60 text-xs font-bold tracking-widest uppercase animate-pulse">
                    <RotateCw size={12} />
                    <span>Appuyer pour retourner</span>
                </div>

                </div>


            {renderAlbumModal()}
            
            {/* New Leaflet Map Modal */}
            {isMapOpen && (
                <div style={{ position: 'fixed', zIndex: 9999 }}>
                    <MapModal
                        isOpen={isMapOpen}
                        onClose={() => setIsMapOpen(false)}
                        location={postcard.location || ''}
                        coords={postcard.coords}
                        image={postcard.frontImage}
                        message={postcard.message}
                    />
                </div>
            )}
        </>
    );
};

export default PostcardView;
