import confetti from "canvas-confetti";

interface ConfettiOptions extends confetti.Options {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: { x: number; y: number };
    colors?: string[];
    shapes?: confetti.Shape[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
}

const fireConfetti = (options: ConfettiOptions = {}) => {
    confetti({
        ...options,
        disableForReducedMotion: Boolean(window.matchMedia('(prefers-reduced-motion)').matches),
    });
};

export const fireSideCannons = () => {
    const end = Date.now() + 3 * 1000;
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

    (function frame() {
        confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors,
        });
        confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors,
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    })();
};

export default fireConfetti;
