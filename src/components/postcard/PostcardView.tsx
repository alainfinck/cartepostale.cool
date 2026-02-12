'use client'

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Postcard } from '@/types';
import { RotateCw, MapPin, Image as ImageIcon, X, Play, ChevronLeft, ChevronRight, Maximize2, Camera } from 'lucide-react';

import { cn } from '@/lib/utils';

interface PostcardViewProps {
    postcard: Postcard;
    isPreview?: boolean;
    flipped?: boolean;
    className?: string;
}

const PostcardView: React.FC<PostcardViewProps> = ({ postcard, isPreview = false, flipped, className }) => {
    const [isFlipped, setIsFlipped] = useState(false);

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
            <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
                <button
                    onClick={() => setIsAlbumOpen(false)}
                    className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                >
                    <X size={32} />
                </button>

                <div className="w-full max-w-5xl flex flex-col items-center">
                    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl flex items-center justify-center mb-6">
                        {postcard.mediaItems![currentMediaIndex].type === 'video' ? (
                            <video controls autoPlay className="max-w-full max-h-[80vh]">
                                <source src={postcard.mediaItems![currentMediaIndex].url} />
                            </video>
                        ) : (
                            <img
                                src={postcard.mediaItems![currentMediaIndex].url}
                                className="max-w-full max-h-[80vh] object-contain"
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

    const renderMapModal = () => {
        if (!portalRoot || !isMapOpen || !(postcard.coords || postcard.location)) return null;

        return createPortal(
            <div className="fixed inset-0 z-[150] bg-stone-900/95 backdrop-blur-md flex items-center justify-center p-4">
                <button
                    onClick={() => setIsMapOpen(false)}
                    className="absolute top-6 right-6 text-white hover:text-red-400 transition-colors z-[110]"
                >
                    <X size={48} />
                </button>

                <div className="w-full h-full max-w-[95vw] max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl relative">
                    <iframe
                        title="Full Map"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(postcard.location)}&output=embed&z=14`}
                    ></iframe>
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

                            <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm text-teal-900 px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2 transform transition-transform group-hover:scale-105">
                                <MapPin size={16} className="text-orange-500" />
                                <span className="uppercase tracking-wide">{postcard.location}</span>
                            </div>

                            {hasMedia && (
                                <button
                                    onClick={openAlbum}
                                    className="absolute top-6 right-6 bg-stone-900/80 hover:bg-stone-900 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm flex items-center gap-2 transition-all hover:scale-105 z-20"
                                >
                                    <ImageIcon size={16} />
                                    <span>Album ({postcard.mediaItems!.length})</span>
                                </button>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
                        </div>

                        {/* Back of Card */}
                        <div className="absolute w-full h-full backface-hidden rotate-y-180 rounded-xl shadow-2xl paper-texture border border-stone-200 p-5 sm:p-8 flex">
                            <div className="absolute left-1/2 top-10 bottom-10 w-px bg-stone-300 hidden sm:block opacity-50"></div>

                            <div className="flex w-full h-full gap-5 sm:gap-8">
                                {/* Left Side: Message - wider and more vertical space */}
                                <div className="flex-[1.25] min-w-0 flex flex-col justify-start relative pt-2">

                                    <div className="flex-1 flex flex-col justify-start items-start my-1 min-h-0">
                                        <p className="font-handwriting text-stone-700 text-sm sm:text-lg leading-loose sm:leading-loose line-clamp-7 sm:line-clamp-none text-left">
                                            {postcard.message}
                                        </p>
                                    </div>
                                    <p className="font-handwriting text-stone-800 text-lg sm:text-xl mt-auto self-start text-teal-700 transform -rotate-2 pt-1">
                                        - {postcard.senderName}
                                    </p>
                                </div>

                                {/* Right Side: Address & Stamp */}
                                <div className="flex-1 flex flex-col relative min-w-0">
                                    {/* Top Section: Album button (left) + Stamp (right, smaller) */}
                                    <div className="flex justify-end items-center gap-3 mb-2">
                                        {hasMedia && (
                                            <button
                                                onClick={openAlbum}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-stone-900/80 hover:bg-stone-900 text-white rounded-2xl transition-all shadow-sm shadow-stone-900/40 backdrop-blur-sm border border-white/20 text-[11px] tracking-[0.2em] uppercase whitespace-nowrap"
                                            >
                                                <Camera size={16} className="text-white/90" />
                                                <span className="text-[10px] font-semibold">Voir l'album</span>
                                                <span className="text-[8px] text-white/70">({postcard.mediaItems!.length})</span>
                                            </button>
                                        )}

                                        {/* Stamp - plus grand, personnalisable (style + texte + année) */}
                                        {(() => {
                                            const style = postcard.stampStyle || 'classic';
                                            const label = (postcard.stampLabel || 'Digital Poste').trim() || 'Digital Poste';
                                            const year = (postcard.stampYear || '2024').trim() || '2024';
                                            const perforatedClip = "polygon(0% 18%, 5% 18%, 5% 0%, 10% 0%, 10% 18%, 15% 18%, 15% 0%, 20% 0%, 20% 18%, 25% 18%, 25% 0%, 30% 0%, 30% 18%, 35% 18%, 35% 0%, 40% 0%, 40% 18%, 45% 18%, 45% 0%, 50% 0%, 50% 18%, 55% 18%, 55% 0%, 60% 0%, 60% 18%, 65% 18%, 65% 0%, 70% 0%, 70% 18%, 75% 18%, 75% 0%, 80% 0%, 80% 18%, 85% 18%, 85% 0%, 90% 0%, 90% 18%, 95% 18%, 95% 0%, 100% 0%, 100% 18%, 100% 22%, 95% 22%, 95% 28%, 100% 28%, 100% 32%, 95% 32%, 95% 38%, 100% 38%, 100% 42%, 95% 42%, 95% 48%, 100% 48%, 100% 52%, 95% 52%, 95% 58%, 100% 58%, 100% 62%, 95% 62%, 95% 68%, 100% 68%, 100% 72%, 95% 72%, 95% 78%, 100% 78%, 100% 82%, 95% 82%, 95% 88%, 100% 88%, 100% 92%, 95% 92%, 95% 98%, 100% 98%, 100% 100%, 95% 100%, 95% 98%, 90% 98%, 90% 100%, 85% 100%, 85% 98%, 80% 98%, 80% 100%, 75% 100%, 75% 98%, 70% 98%, 70% 100%, 65% 100%, 65% 98%, 60% 98%, 60% 100%, 55% 100%, 55% 98%, 50% 98%, 50% 100%, 45% 100%, 45% 98%, 40% 98%, 40% 100%, 35% 100%, 35% 98%, 30% 98%, 30% 100%, 25% 100%, 25% 98%, 20% 98%, 20% 100%, 15% 100%, 15% 98%, 10% 98%, 10% 100%, 5% 100%, 5% 98%, 0% 98%, 0% 100%, 0% 100%, 0% 98%, 0% 92%, 5% 92%, 5% 88%, 0% 88%, 0% 82%, 5% 82%, 5% 78%, 0% 78%, 0% 72%, 5% 72%, 5% 68%, 0% 68%, 0% 62%, 5% 62%, 5% 58%, 0% 58%, 0% 52%, 5% 52%, 5% 48%, 0% 48%, 0% 42%, 5% 42%, 5% 38%, 0% 38%, 0% 32%, 5% 32%, 5% 28%, 0% 28%, 0% 22%, 5% 22%, 5% 18%, 0% 18%)";
                                            return (
                                                <div className="w-14 h-[6rem] sm:w-32 sm:h-[7.5rem] flex-shrink-0 relative group-hover:rotate-6 transition-transform shadow-xl">
                                                    {/* Classic: perforated, orange/cream */}
                                                    {style === 'classic' && (
                                                        <div className="w-full h-full bg-[#fdf5e6] shadow-lg border-2 border-stone-300/30 flex items-center justify-center p-1 relative z-10" style={{ clipPath: perforatedClip }}>
                                                            <div className="w-full h-full border border-orange-200/60 flex flex-col items-center justify-between p-1 bg-white/70">
                                                                <div className="text-[8px] sm:text-[10px] font-bold text-orange-800 uppercase leading-none mt-0.5 text-center max-w-full">{label}</div>
                                                                <img src="https://i.imgur.com/R21Yw3x.png" className="w-9 h-9 sm:w-10 sm:h-10 object-contain grayscale opacity-70" alt="stamp" />
                                                                <div className="text-[8px] sm:text-[9px] font-serif font-bold text-orange-900 leading-none mb-0.5">{year}</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Modern: clean rectangle, teal/white */}
                                                    {style === 'modern' && (
                                                        <div className="w-full h-full rounded-xl shadow-lg border-2 border-teal-300/60 bg-gradient-to-b from-teal-50 to-white flex flex-col items-center justify-between p-2 relative z-10">
                                                            <div className="text-[7px] sm:text-[9px] font-bold text-teal-700 uppercase leading-none text-center max-w-full">{label}</div>
                                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-teal-400 flex items-center justify-center">
                                                                <span className="text-[10px] sm:text-[12px] font-bold text-teal-600">DP</span>
                                                            </div>
                                                            <div className="text-[8px] sm:text-[9px] font-semibold text-teal-800 leading-none">{year}</div>
                                                        </div>
                                                    )}
                                                    {/* Airmail: red/blue diagonal stripes */}
                                                    {style === 'airmail' && (
                                                        <div
                                                            className="w-full h-full rounded-xl shadow-lg border-2 border-red-400/80 flex flex-col items-center justify-between p-1 relative z-10 overflow-hidden"
                                                            style={{
                                                                background: 'repeating-linear-gradient(-45deg, #dc2626 0px, #dc2626 5px, #1d4ed8 5px, #1d4ed8 10px)',
                                                            }}
                                                        >
                                                            <div className="w-full h-full flex flex-col items-center justify-between p-1.5 bg-white/85 rounded-lg">
                                                                <div className="text-[6px] sm:text-[7px] font-bold text-red-600 uppercase leading-none tracking-[0.2em]">Par avion</div>
                                                                <div className="text-[7px] sm:text-[8px] font-bold text-stone-700 uppercase text-center max-w-full">{label}</div>
                                                                <div className="text-[7px] sm:text-[8px] font-serif text-stone-600 leading-none">{year}</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Postmark circle overlay */}
                                                    <div className="absolute -left-5 top-4 w-12 h-12 sm:w-14 sm:h-14 border-2 border-stone-900/10 rounded-full flex items-center justify-center transform -rotate-10 pointer-events-none z-20">
                                                        <div className="text-[5px] sm:text-[6px] font-mono text-stone-500/40 text-center leading-none uppercase font-bold">
                                                            {postcard.location.split(',')[0]}<br />{postcard.date}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    <div className="mt-auto w-full">
                                        <div className="border-b-2 border-stone-300 border-dotted pb-1 mb-2 font-handwriting text-xl sm:text-2xl text-stone-600 pl-4">
                                            {postcard.recipientName}
                                        </div>
                                        {(postcard.coords || postcard.location) && (
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
            </div >

            {renderAlbumModal()}
            {renderMapModal()}
        </>
    );
};

export default PostcardView;
