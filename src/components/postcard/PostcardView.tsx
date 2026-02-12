'use client'

import React, { useState, useEffect } from 'react';
import { Postcard } from '@/types';
import { RotateCw, MapPin, Image as ImageIcon, X, Play, ChevronLeft, ChevronRight, Maximize2, Camera } from 'lucide-react';

interface PostcardViewProps {
    postcard: Postcard;
    isPreview?: boolean;
    flipped?: boolean;
}

const PostcardView: React.FC<PostcardViewProps> = ({ postcard, isPreview = false, flipped }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        if (flipped !== undefined) {
            setIsFlipped(flipped);
        }
    }, [flipped]);
    const [isAlbumOpen, setIsAlbumOpen] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);
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

    return (
        <>
            <div className="flex flex-col items-center gap-6">
                <div
                    className="perspective-1000 w-[340px] h-[240px] sm:w-[600px] sm:h-[400px] cursor-pointer group"
                    onClick={handleFlip}
                >
                    <div
                        className={`relative w-full h-full duration-700 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''
                            }`}
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
                                    <p className="font-handwriting text-stone-800 text-lg sm:text-xl mt-auto self-end text-teal-700 transform -rotate-2 pt-1">
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
                                                className="flex items-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all group/albumbtn shadow-md transform hover:-translate-y-0.5 active:translate-y-0 text-left flex-shrink-0"
                                            >
                                                <Camera size={18} className="group-hover/albumbtn:scale-110 transition-transform flex-shrink-0" />
                                                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide leading-tight">Voir l'album</span>
                                                <span className="text-[8px] text-orange-100/90">({postcard.mediaItems!.length})</span>
                                            </button>
                                        )}

                                        {/* Stamp - plus grand, personnalisable (style + texte + année) */}
                                        {(() => {
                                            const style = postcard.stampStyle || 'classic';
                                            const label = (postcard.stampLabel || 'Digital Poste').trim() || 'Digital Poste';
                                            const year = (postcard.stampYear || '2024').trim() || '2024';
                                            const perforatedClip = "polygon(0% 5%, 5% 5%, 5% 0%, 10% 0%, 10% 5%, 15% 5%, 15% 0%, 20% 0%, 20% 5%, 25% 5%, 25% 0%, 30% 0%, 30% 5%, 35% 5%, 35% 0%, 40% 0%, 40% 5%, 45% 5%, 45% 0%, 50% 0%, 50% 5%, 55% 5%, 55% 0%, 60% 0%, 60% 5%, 65% 5%, 65% 0%, 70% 0%, 70% 5%, 75% 5%, 75% 0%, 80% 0%, 80% 5%, 85% 5%, 85% 0%, 90% 0%, 90% 5%, 95% 5%, 95% 0%, 100% 0%, 100% 5%, 100% 10%, 95% 10%, 95% 15%, 100% 15%, 100% 20%, 95% 20%, 95% 25%, 100% 25%, 100% 30%, 95% 30%, 95% 35%, 100% 35%, 100% 40%, 95% 40%, 95% 45%, 100% 45%, 100% 50%, 95% 50%, 95% 55%, 100% 55%, 100% 60%, 95% 60%, 95% 65%, 100% 65%, 100% 70%, 95% 70%, 95% 75%, 100% 75%, 100% 80%, 95% 80%, 95% 85%, 100% 85%, 100% 90%, 95% 90%, 95% 95%, 100% 95%, 100% 100%, 95% 100%, 95% 95%, 90% 95%, 90% 100%, 85% 100%, 85% 95%, 80% 95%, 80% 100%, 75% 100%, 75% 95%, 70% 95%, 70% 100%, 65% 100%, 65% 95%, 60% 95%, 60% 100%, 55% 100%, 55% 95%, 50% 95%, 50% 100%, 45% 100%, 45% 95%, 40% 95%, 40% 100%, 35% 100%, 35% 95%, 30% 95%, 30% 100%, 25% 100%, 25% 95%, 20% 95%, 20% 100%, 15% 100%, 15% 95%, 10% 95%, 10% 100%, 5% 100%, 5% 95%, 0% 95%, 0% 90%, 5% 90%, 5% 85%, 0% 85%, 0% 80%, 5% 80%, 5% 75%, 0% 75%, 0% 70%, 5% 70%, 5% 65%, 0% 65%, 0% 60%, 5% 60%, 5% 55%, 0% 55%, 0% 50%, 5% 50%, 5% 45%, 0% 45%, 0% 40%, 5% 40%, 5% 35%, 0% 35%, 0% 30%, 5% 30%, 5% 25%, 0% 25%, 0% 20%, 5% 20%, 5% 15%, 0% 15%, 0% 10%, 5% 10%, 5% 5%, 0% 5%)";
                                            return (
                                                <div className="w-[4.5rem] h-[5.5rem] sm:w-28 sm:h-36 flex-shrink-0 relative group-hover:rotate-6 transition-transform">
                                                    {/* Classic: perforated, orange/cream */}
                                                    {style === 'classic' && (
                                                        <div className="w-full h-full bg-[#fdf5e6] shadow-md border-2 border-stone-300/30 flex items-center justify-center p-1 relative z-10" style={{ clipPath: perforatedClip }}>
                                                            <div className="w-full h-full border border-orange-200/50 flex flex-col items-center justify-between p-1 bg-white/50">
                                                                <div className="text-[6px] sm:text-[7px] font-bold text-orange-800 uppercase leading-none mt-0.5 text-center max-w-full truncate px-0.5">{label}</div>
                                                                <img src="https://i.imgur.com/R21Yw3x.png" className="w-7 h-7 sm:w-8 sm:h-8 object-contain grayscale opacity-60" alt="stamp" />
                                                                <div className="text-[7px] sm:text-[8px] font-serif font-bold text-orange-900 leading-none mb-0.5">{year}</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Modern: clean rectangle, teal/white */}
                                                    {style === 'modern' && (
                                                        <div className="w-full h-full rounded-lg shadow-md border-2 border-teal-300/50 bg-gradient-to-b from-teal-50 to-white flex flex-col items-center justify-between p-1.5 relative z-10">
                                                            <div className="text-[6px] sm:text-[7px] font-bold text-teal-700 uppercase leading-none text-center max-w-full truncate">{label}</div>
                                                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-teal-400 flex items-center justify-center">
                                                                <span className="text-[8px] sm:text-[9px] font-bold text-teal-600">DP</span>
                                                            </div>
                                                            <div className="text-[7px] sm:text-[8px] font-semibold text-teal-800 leading-none">{year}</div>
                                                        </div>
                                                    )}
                                                    {/* Airmail: red/blue diagonal stripes */}
                                                    {style === 'airmail' && (
                                                        <div
                                                            className="w-full h-full rounded-md shadow-md border-2 border-red-400/80 flex flex-col items-center justify-between p-1 relative z-10 overflow-hidden"
                                                            style={{
                                                                background: 'repeating-linear-gradient(-45deg, #dc2626 0px, #dc2626 4px, #1d4ed8 4px, #1d4ed8 8px)',
                                                            }}
                                                        >
                                                            <div className="w-full h-full flex flex-col items-center justify-between p-1 bg-white/90 rounded-sm">
                                                                <div className="text-[5px] sm:text-[6px] font-bold text-red-600 uppercase leading-none tracking-wider">Par avion</div>
                                                                <div className="text-[6px] sm:text-[7px] font-bold text-stone-700 uppercase text-center max-w-full truncate px-0.5">{label}</div>
                                                                <div className="text-[6px] sm:text-[7px] font-serif text-stone-600 leading-none">{year}</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Postmark circle overlay */}
                                                    <div className="absolute -left-4 top-4 w-10 h-10 sm:w-12 sm:h-12 border-2 border-stone-900/10 rounded-full flex items-center justify-center transform -rotate-12 pointer-events-none z-20">
                                                        <div className="text-[5px] sm:text-[6px] font-mono text-stone-500/40 text-center leading-none uppercase font-bold">
                                                            {postcard.location.split(',')[0]}<br />{postcard.date}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Map section - Height Increased */}
                                    <div className="mt-auto w-full">
                                        {postcard.coords || postcard.location ? (
                                            <div className="relative group/map">
                                                <h4 className="font-bold text-stone-400 text-[10px] uppercase mb-1 tracking-wider flex items-center gap-1">
                                                    <MapPin size={10} /> {postcard.location}
                                                </h4>
                                                <div className="w-full h-28 sm:h-44 bg-stone-100 rounded-lg overflow-hidden border border-stone-200 relative cursor-pointer hover:border-teal-400 transition-colors" onClick={openMap}>
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
                                        ) : (
                                            <div className="border-b-2 border-stone-300 border-dotted pb-2 font-handwriting text-xl sm:text-2xl text-stone-400 pl-4 mt-auto">
                                                {postcard.recipientName}
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

            {/* Lightbox Modal for Album */}
            {
                isAlbumOpen && hasMedia && (
                    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
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
                    </div>
                )
            }

            {/* Map Modal */}
            {
                isMapOpen && (postcard.coords || postcard.location) && (
                    <div className="fixed inset-0 z-[100] bg-stone-900/95 backdrop-blur-md flex items-center justify-center p-4">
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
                    </div>
                )
            }
        </>
    );
};

export default PostcardView;
