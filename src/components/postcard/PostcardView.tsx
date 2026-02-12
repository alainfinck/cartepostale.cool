'use client'

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Postcard } from '@/types';
import { 
    RotateCw, 
    MapPin, 
    X, 
    Play, 
    ChevronLeft, 
    ChevronRight, 
    Camera,
    Search, 
    Info 
} from 'lucide-react';
import { motion, useSpring, useMotionValue, useTransform, PanInfo, useAnimation } from 'framer-motion';

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
    isLarge?: boolean;
    width?: string;
    height?: string;
}

const FALLBACK_FRONT_IMAGE = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'

const PostcardView: React.FC<PostcardViewProps> = ({ 
    postcard, 
    isPreview = false, 
    flipped, 
    className, 
    isLarge = false,
    width,
    height
}) => {
    const [isFlipped, setIsFlipped] = useState(flipped ?? false);
    const [isDragging, setIsDragging] = useState(false);
    const [frontImageSrc, setFrontImageSrc] = useState(postcard.frontImage);
    useEffect(() => {
        setFrontImageSrc(postcard.frontImage);
    }, [postcard.frontImage, postcard.id]);

    // Motion values for rotation
    const rotateY = useMotionValue(flipped ? 180 : 0);
    const springRotateY = useSpring(rotateY, { stiffness: 80, damping: 26 });
    
    // Controls for animation
    const controls = useAnimation();

    useEffect(() => {
        if (flipped !== undefined) {
            setIsFlipped(flipped);
            rotateY.set(flipped ? 180 : 0);
        }
    }, [flipped, rotateY]);

    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const [isAlbumOpen, setIsAlbumOpen] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [messageModalFontSize, setMessageModalFontSize] = useState(2);
    // Slider de taille du texte au verso (0.7 = petit, 2.2 = grand)
    const [backTextScale, setBackTextScale] = useState(1);
    // Zoom de la mini-carte au verso (pour que + / - fonctionnent sans déclencher le flip)
    const [backMapZoom, setBackMapZoom] = useState(11);

    const handleFlip = () => {
        if (isDragging) return;
        const newFlippedState = !isFlipped;
        setIsFlipped(newFlippedState);
        rotateY.set(newFlippedState ? 180 : 0);
    };

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        setIsDragging(false);
        const currentRotation = rotateY.get();
        // Normalize rotation to 0-360 range
        const normalizedRotation = ((currentRotation % 360) + 360) % 360;
        
        // Determine if we should snap to front (0) or back (180)
        // If rotation is between 90 and 270, snap to back (180)
        if (normalizedRotation > 90 && normalizedRotation < 270) {
            setIsFlipped(true);
            rotateY.set(180);
        } else {
            setIsFlipped(false);
            rotateY.set(0);
        }
    };

    const handleDragStart = () => {
        setIsDragging(true);
    };

    const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        // Map drag distance to rotation
        // Sensitive enough to rotate easily but not too fast
        const current = rotateY.get();
        rotateY.set(current + info.delta.x * 0.5);
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

    // OSM tile coords from lat/lng (for static map on back - avoids iframe + 3D transform issues)
    const getTileCoord = (lat: number, lng: number, zoom: number) => {
        const x = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
        const y = Math.floor(
            ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
                Math.pow(2, zoom)
        );
        return { x, y, z: zoom };
    };

    const openMessage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMessageOpen(true);
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

    const renderMessageModal = () => {
        if (!portalRoot || !isMessageOpen) return null;

        return createPortal(
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[150] bg-stone-900/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
                onClick={() => setIsMessageOpen(false)}
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="w-full max-w-[95vw] h-[90vh] min-h-0 bg-[#fafaf9] rounded-3xl shadow-2xl p-6 md:p-16 relative overflow-hidden flex flex-col items-center text-center border-8 border-white/50"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Background decorations */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/5 rounded-full -ml-16 -mb-16 blur-3xl"></div>
                    
                    <button
                        onClick={() => setIsMessageOpen(false)}
                        className="absolute top-3 right-3 md:top-4 md:right-4 z-[100] bg-white hover:bg-stone-100 text-stone-500 hover:text-stone-800 p-4 rounded-full transition-all shadow-2xl border-2 border-stone-100 group/close"
                    >
                        <X size={32} className="group-hover/close:rotate-90 transition-transform duration-300" />
                    </button>

                    {/* Header en haut, en position absolue pour ne pas descendre le contenu */}
                    <div className="absolute top-4 left-6 md:top-6 md:left-10 right-20 z-[90] pointer-events-none">
                        <p className="text-[10px] md:text-xs font-bold text-stone-400 uppercase tracking-widest">
                            Carte postale reçue de la part de {postcard.senderName || '…'}
                            {postcard.location && (
                                <span className="text-stone-300 font-normal normal-case tracking-normal"> · {postcard.location}</span>
                            )}
                        </p>
                    </div>

                    <div className="w-24 h-1.5 bg-stone-100 rounded-full mb-4 opacity-50 shrink-0"></div>

                    <div className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden custom-scrollbar px-4 flex flex-col pt-0">
                        <p 
                            className="font-handwriting text-stone-700 leading-relaxed text-center whitespace-pre-wrap pt-2 pb-6 w-full max-w-full break-words"
                            style={{ fontSize: `${messageModalFontSize}rem` }}
                        >
                            {postcard.message}
                        </p>
                    </div>

                    <div className="w-full h-px bg-stone-100 my-6 shrink-0"></div>

                    <div className="w-full flex flex-wrap items-end justify-between gap-4 shrink-0 pb-2">
                        <div className="text-left shrink-0">
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Envoyé de</p>
                            <p className="text-stone-600 font-medium flex items-center gap-1.5 text-sm uppercase">
                                <MapPin size={14} className="text-teal-600" />
                                {postcard.location}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 min-w-0 flex-1 justify-center max-w-xs mx-auto">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest whitespace-nowrap shrink-0">Taille</span>
                            <input
                                type="range"
                                min={1}
                                max={4}
                                step={0.1}
                                value={messageModalFontSize}
                                onChange={(e) => setMessageModalFontSize(Number(e.target.value))}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 min-w-[80px] h-2 bg-stone-200 rounded-full appearance-none cursor-pointer accent-teal-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow"
                                aria-label="Taille du texte"
                            />
                            <span className="text-[10px] font-medium text-stone-500 tabular-nums w-7 shrink-0">{Math.round(messageModalFontSize * 100)}%</span>
                        </div>
                        <p className="font-handwriting text-teal-700 text-2xl md:text-3xl rotate-[-2deg] shrink-0 text-right">
                            - {postcard.senderName}
                        </p>
                    </div>
                </motion.div>
            </motion.div>,
            portalRoot
        );
    };

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
                    className="absolute -top-12 right-0 md:right-0 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all shadow-lg backdrop-blur-md border border-white/20"
                >
                    <X size={24} />
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
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
            <div className="flex flex-col items-center gap-6 select-none">
                <motion.div
                    className={cn(
                        "perspective-1000 cursor-grab active:cursor-grabbing group touch-none",
                        !width && !height && (isLarge 
                            ? "w-[95vw] h-[65vw] max-w-[480px] max-h-[320px] sm:w-[600px] sm:h-[400px] md:w-[840px] md:h-[560px] lg:w-[1050px] lg:h-[700px] sm:max-w-none sm:max-h-none portrait:max-h-none" 
                            : "w-[340px] h-[240px] sm:w-[600px] sm:h-[400px]"),
                        className
                    )}
                    onClick={handleFlip}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragStart={handleDragStart}
                    onDrag={handleDrag}
                    onDragEnd={handleDragEnd}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{ perspective: 1000, width, height }}
                >
                    <motion.div
                        className={cn(
                            "relative w-full h-full transform-style-3d",
                        )}
                        style={{ 
                            rotateY: springRotateY,
                            transformStyle: "preserve-3d"
                        }}
                    >
                        {/* Front of Card */}
                        <div 
                            className="absolute w-full h-full backface-hidden rounded-xl shadow-2xl overflow-hidden bg-white border border-stone-200"
                            style={{ backfaceVisibility: 'hidden' }}
                        >
                            <img
                                src={frontImageSrc}
                                alt="Postcard Front"
                                className="w-full h-full object-cover pointer-events-none"
                                onError={() => setFrontImageSrc(FALLBACK_FRONT_IMAGE)}
                            />



                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none z-0" />

                            {/* Indication "Retourner la carte" au survol — en haut à droite */}
                            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-lg bg-white/90 backdrop-blur-md px-3 py-2 shadow-lg border border-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                <RotateCw size={isLarge ? 20 : 16} className="text-stone-600 shrink-0" />
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-700">Retourner la carte</span>
                            </div>

                            {/* Message démo au-dessus de la localisation (frontCaption sans frontEmoji) */}
                            {postcard.frontCaption && !postcard.frontEmoji && (
                                <div className="absolute left-4 sm:left-6 right-4 sm:right-6 z-10 bottom-10 sm:bottom-12 text-stone-800 text-[11px] sm:text-xs font-medium drop-shadow-sm">
                                    {postcard.frontCaption}
                                </div>
                            )}

                            {postcard.location && (
                                <div
                                    className={cn(
                                        "absolute left-4 sm:left-6 z-10 bg-white/90 backdrop-blur-md text-teal-900 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-semibold shadow-lg flex items-center gap-1.5",
                                        postcard.frontEmoji ? "bottom-20 sm:bottom-24" : "bottom-4 sm:bottom-6"
                                    )}
                                >
                                    <MapPin size={12} className="text-orange-500 shrink-0" />
                                    <span className="normal-case tracking-wide break-words max-w-[160px] sm:max-w-[220px]">{postcard.location}</span>
                                </div>
                            )}

                            {/* Bloc caption + emoji en bas (affiché seulement si frontEmoji) */}
                            {(postcard.frontCaption || postcard.frontEmoji) && postcard.frontEmoji && (
                                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-10 flex items-center gap-3 rounded-xl sm:rounded-2xl border border-white/50 bg-white/90 backdrop-blur-md px-4 py-3 sm:px-5 sm:py-3.5 shadow-xl">
                                    <span className="text-xl sm:text-4xl leading-none shrink-0" aria-hidden>{postcard.frontEmoji}</span>
                                    {postcard.frontCaption ? (
                                        <p className="m-0 text-sm sm:text-lg font-semibold leading-tight tracking-tight text-stone-800 break-words line-clamp-2">
                                            {postcard.frontCaption}
                                        </p>
                                    ) : null}
                                </div>
                            )}
                        </div>

                        {/* Back of Card */}
                        <div 
                            className={cn(
                                "absolute w-full h-full backface-hidden rounded-xl shadow-2xl bg-[#fafaf9] border border-stone-200 flex overflow-hidden",
                                isLarge ? "p-4 sm:p-8" : "p-5 sm:p-8"
                            )}
                            style={{ 
                                backfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)'
                            }}
                        >
                            {/* Top bar: Retourner + Slider taille du texte */}
                            <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-1.5 text-stone-400 pointer-events-none group-hover:text-stone-600 transition-all duration-300">
                                    <RotateCw size={isLarge ? 22 : 18} />
                                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Retourner</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/70 border border-stone-200/80 shadow-sm" onClick={(e) => e.stopPropagation()}>
                                    <span className="text-[8px] font-bold uppercase tracking-wider text-stone-500">A</span>
                                    <input
                                        type="range"
                                        min={0.7}
                                        max={2.2}
                                        step={0.05}
                                        value={backTextScale}
                                        onChange={(e) => setBackTextScale(Number(e.target.value))}
                                        className={cn("h-1 accent-teal-500 rounded-full appearance-none bg-stone-200 cursor-pointer", isLarge ? "w-20 sm:w-24" : "w-14")}
                                    />
                                    <span className="text-[8px] font-bold uppercase tracking-wider text-stone-500">A+</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-stone-400 pointer-events-none group-hover:text-stone-600 transition-all duration-300 sm:flex">
                                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider hidden sm:inline">Retourner</span>
                                    <RotateCw size={isLarge ? 22 : 18} />
                                </div>
                            </div>

                            {/* Flip indicator — bottom-center (above branding) */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 text-stone-300 pointer-events-none group-hover:text-stone-500 transition-all duration-300">
                                <RotateCw size={16} />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Cliquer pour retourner</span>
                            </div>

                            {/* Small branding bottom-left */}
                            <div className="absolute bottom-3 left-6 text-stone-300 text-[8px] font-bold tracking-[0.2em] uppercase flex items-center gap-1.5">
                                <div className="w-1 h-1 bg-stone-200 rounded-full" />
                                cartepostale.cool
                            </div>
                            <div className="absolute left-[62%] top-10 bottom-10 w-px bg-stone-300 hidden sm:block opacity-50"></div>

                            <div className="flex w-full h-full gap-8 sm:gap-14">
                                {/* Left Side: Message - much wider */}
                                <div className="flex-[1.6] min-w-0 flex flex-col justify-start relative pt-2 pr-6 sm:pr-8">

                                    <div 
                                        className="flex-1 min-w-0 overflow-y-auto custom-scrollbar my-1 cursor-pointer group/msg relative pr-2"
                                        onClick={openMessage}
                                    >
                                        <p 
                                            className="font-handwriting text-stone-700 leading-loose sm:leading-loose text-left whitespace-pre-wrap w-full max-w-full break-words"
                                            style={{
                                                // Peu de texte → plus grand par défaut; barre A/A+ permet de zoomer encore plus
                                                fontSize: `${
                                                    (() => {
                                                        const len = (postcard.message || '').trim().length;
                                                        const baseRem = len < 80 ? 1.55 : len < 180 ? 1.25 : 1.0;
                                                        return Math.round(baseRem * backTextScale * 100) / 100;
                                                    })()
                                                }rem`
                                            }}
                                        >
                                            {postcard.message}
                                        </p>
                                        
                                        {/* Zoom hint - shown when hovering */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover/msg:opacity-100 transition-opacity duration-300">
                                            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-stone-200 shadow-xl flex items-center gap-2 transform scale-75 sm:scale-100">
                                                <Search size={14} className="text-teal-600" />
                                                <span className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">Agrandir</span>
                                            </div>
                                        </div>
                                    </div>
                                    {postcard.senderName && (
                                        <p className="font-handwriting text-teal-700 text-base sm:text-xl mt-auto self-start transform -rotate-2 pt-1">
                                            - {postcard.senderName}
                                        </p>
                                    )}
                                    {hasMedia && (
                                        <div className="mt-3 self-start" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={openAlbum}
                                                title="Voir les photos de la carte"
                                                className="group/album relative inline-flex items-center gap-2 px-3 py-2 rounded-xl font-semibold text-[11px] sm:text-xs uppercase tracking-wide shadow-md border-2 border-amber-200/80 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 text-amber-900 hover:from-amber-100 hover:via-orange-100 hover:to-rose-100 hover:shadow-lg hover:border-amber-300/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                                            >
                                                <Camera size={14} className="text-amber-600 sm:text-amber-700" />
                                                <span>Album photos</span>
                                                <span className="text-[10px] text-amber-600/80 font-normal">({postcard.mediaItems!.length})</span>
                                                {/* Tooltip au survol */}
                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-stone-800 text-white text-[10px] font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover/album:opacity-100 group-hover/album:translate-y-0 transition-all duration-200 -translate-y-1 z-50 shadow-lg">
                                                    Voir les photos de la carte
                                                </span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Address & Stamp */}
                                <div className="flex-1 flex flex-col relative min-w-0 pt-0 sm:pt-1">
                                    {/* Top Section: Recipient (left) + Stamp (right) */}
                                    <div className="flex justify-between items-start mb-1 gap-2">
                                        <div className="flex-1 pt-3">
                                            {postcard.recipientName && (
                                                <div className={cn(
                                                    "border-b-2 border-stone-300 border-dotted pb-0.5 font-handwriting text-stone-600 pl-2",
                                                    isLarge ? "text-base sm:text-xl" : "text-sm sm:text-base"
                                                )}>
                                                    {postcard.recipientName}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Stamp - plus petit et plus réaliste */}
                                        {(() => {
                                            const style = postcard.stampStyle || 'classic';
                                            const label = (postcard.stampLabel || 'Digital Poste').trim() || 'Digital Poste';
                                            const year = (postcard.stampYear || '2024').trim() || '2024';
                                            // Split text for postmark if too long or multiline needed? defaulted to location/date
                                            const pmText = postcard.postmarkText || (postcard.location ? postcard.location.split(',')[0] : 'Digital');
                                            
                                            return (
                                                <div className="relative group-hover:rotate-2 transition-transform duration-500 ease-out pt-0 pb-2 pr-2">
                                                    
                                                    {/* The Stamp itself - Reduced size (w-20/h-24 on desktop) */}
                                                    <div className={cn(
                                                        "relative shadow-[2px_3px_5px_rgba(0,0,0,0.2)] transform rotate-1",
                                                        isLarge ? "w-10 h-13 sm:w-20 sm:h-24" : "w-10 h-12 sm:w-16 sm:h-20"
                                                    )}>
                                                        
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
                                                                            <img src="https://i.imgur.com/R21Yw3x.png" className="w-6 h-6 sm:w-9 sm:h-9 object-contain grayscale text-orange-900/50 opacity-60" alt="stamp" />
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
                                                    <div className={cn(
                                                        "absolute -left-6 top-5 pointer-events-none z-20 mix-blend-multiply opacity-85 transform -rotate-12",
                                                        isLarge ? "w-16 h-16 sm:w-24 sm:h-24" : "w-14 h-14 sm:w-18 sm:h-18"
                                                    )}>
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

                                    </div>
                                    {/* Mini carte au verso : tuiles OSM (évite iframe + 3D) ou bouton "Voir la carte" */}
                                    {(postcard.coords || postcard.location) && (
                                        <div className={cn(
                                            "mt-2 flex-1 rounded-lg overflow-hidden border border-stone-200/80 bg-stone-50 shadow-inner min-h-0",
                                            isLarge ? "min-h-[140px] sm:min-h-[200px] md:min-h-[280px]" : "min-h-[80px] sm:min-h-[100px]"
                                        )}>
                                            {postcard.coords ? (
                                                <div
                                                    className="group/map relative w-full h-full flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                                                    onClick={openMap}
                                                    role="button"
                                                    tabIndex={0}
                                                    title="Agrandir la carte"
                                                >
                                                    {/* Carte statique en tuiles OSM (zoom contrôlé par backMapZoom) */}
                                                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 overflow-hidden">
                                                        {(() => {
                                                            const { lat, lng } = postcard.coords!;
                                                            const { x, y, z } = getTileCoord(lat, lng, backMapZoom);
                                                            const tiles = [
                                                                [x, y],
                                                                [x + 1, y],
                                                                [x, y + 1],
                                                                [x + 1, y + 1],
                                                            ];
                                                            return tiles.map(([tx, ty], i) => (
                                                                <img
                                                                    key={i}
                                                                    src={`https://tile.openstreetmap.org/${z}/${tx}/${ty}.png`}
                                                                    alt=""
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ));
                                                        })()}
                                                    </div>
                                                    {/* Boutons zoom + / - au-dessus de la carte, cliquables sans déclencher flip ni ouverture modal */}
                                                    <div className="absolute top-1.5 right-1.5 z-10 flex flex-col gap-0.5 shadow-md rounded-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); setBackMapZoom((z) => Math.min(18, z + 1)); }}
                                                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white/95 hover:bg-white text-stone-600 hover:text-teal-600 border border-stone-200/80 transition-colors"
                                                            aria-label="Zoom avant"
                                                        >
                                                            <span className="text-lg font-bold leading-none">+</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); setBackMapZoom((z) => Math.max(5, z - 1)); }}
                                                            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white/95 hover:bg-white text-stone-600 hover:text-teal-600 border border-stone-200/80 transition-colors"
                                                            aria-label="Zoom arrière"
                                                        >
                                                            <span className="text-lg font-bold leading-none">−</span>
                                                        </button>
                                                    </div>
                                                    {/* Overlay loupe au hover — clic ouvre le modal carte (pointer-events-none pour ne pas bloquer les boutons zoom) */}
                                                    <span className="absolute inset-0 flex items-center justify-center bg-stone-900/40 opacity-0 group-hover/map:opacity-100 transition-opacity duration-200 pointer-events-none">
                                                        <span className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/95 shadow-lg text-teal-600">
                                                            <Search size={isLarge ? 28 : 22} strokeWidth={2.5} />
                                                        </span>
                                                    </span>
                                                    <span className="sr-only">Agrandir la carte</span>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={openMap}
                                                    className="group/map relative w-full h-full flex flex-col items-center justify-center gap-2 text-stone-500 hover:bg-stone-100/80 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-inset rounded-lg overflow-hidden"
                                                    title="Voir la carte"
                                                >
                                                    <MapPin size={isLarge ? 32 : 24} className="text-teal-500 transition-opacity group-hover/map:opacity-60" />
                                                    <span className="text-xs sm:text-sm font-semibold text-teal-700 uppercase tracking-wide transition-opacity group-hover/map:opacity-60">Voir la carte</span>
                                                    <span className="absolute inset-0 flex items-center justify-center bg-stone-900/30 opacity-0 group-hover/map:opacity-100 transition-opacity duration-200 pointer-events-none">
                                                        <span className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 shadow-lg text-teal-600">
                                                            <Search size={isLarge ? 24 : 20} strokeWidth={2.5} />
                                                        </span>
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                <div className="flex items-center gap-2 text-teal-600/60 text-xs font-bold tracking-widest uppercase animate-pulse">
                    <RotateCw size={12} />
                    <span>Faire glisser pour retourner</span>
                </div>

                </div>


            {renderAlbumModal()}
            {renderMessageModal()}
            
            {/* New Leaflet Map Modal - Portaled to avoid perspective/transform issues */}
            {isMapOpen && portalRoot && createPortal(
                <MapModal
                    isOpen={isMapOpen}
                    onClose={() => setIsMapOpen(false)}
                    location={postcard.location || ''}
                    coords={postcard.coords}
                    image={postcard.frontImage}
                    message={postcard.message}
                    isLarge={isLarge}
                />,
                portalRoot
            )}
        </>
    );
};

export default PostcardView;
