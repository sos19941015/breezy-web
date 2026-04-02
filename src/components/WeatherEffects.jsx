import { useMemo } from 'react';
import { Star, Snowflake, Droplets, Zap } from 'lucide-react';

export default function WeatherEffects({ bgClass }) {
    if (!bgClass) return null;

    const isRain = bgClass.includes('rain');
    const isSnow = bgClass.includes('snow');
    const isThunder = bgClass.includes('thunder');
    const isCloudy = bgClass.includes('cloudy');
    const isClearNight = bgClass.includes('clear-night');
    const isClearDay = bgClass.includes('clear-day');

    // Pre-generate random values so they don't change on re-render
    const rainDrops = useMemo(() =>
        Array.from({ length: 20 }, () => ({
            left: `${Math.random() * 100}%`,
            height: `${10 + Math.random() * 20}px`,
            duration: `${0.5 + Math.random() * 0.5}s`,
            delay: `${Math.random()}s`
        })), []
    );

    const snowFlakes = useMemo(() =>
        Array.from({ length: 25 }, () => ({
            left: `${Math.random() * 100}%`,
            duration: `${3 + Math.random() * 3}s`,
            delay: `${-Math.random() * 5}s`,
            blur: `blur(${Math.random() > 0.5 ? 1 : 0}px)`,
            size: 8 + Math.random() * 12
        })), []
    );

    const stars = useMemo(() =>
        Array.from({ length: 15 }, () => ({
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            duration: `${2 + Math.random() * 3}s`,
            delay: `${Math.random() * 2}s`,
            size: 4 + Math.random() * 6
        })), []
    );

    const lightningDelay = useMemo(() => `${Math.random() * 5}s`, []);

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            borderRadius: 'inherit',
            zIndex: 0
        }}>
            <style>{`
                @keyframes float-pill {
                    0% { transform: translateX(-300px); }
                    100% { transform: translateX(800px); }
                }
                .composite-cloud {
                    position: absolute;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    filter: blur(0.5px);
                }
                .cloud-pill {
                    height: 24px;
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }
                @keyframes fall-rain {
                    0% { transform: translateY(-50px) rotate(15deg); opacity: 0; }
                    10% { opacity: 0.8; }
                    90% { opacity: 0.8; }
                    100% { transform: translateY(400px) rotate(15deg); opacity: 0; }
                }
                @keyframes fall-snow {
                    0% { transform: translateY(-50px) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.8; }
                    100% { transform: translateY(400px) rotate(360deg); opacity: 0; }
                }
                @keyframes twinkle-star {
                    0%, 100% { opacity: 0.2; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                @keyframes lightning-flash {
                    0%, 100% { background: transparent; }
                    1%, 3% { background: rgba(255, 255, 255, 0.6); }
                    2%, 4% { background: transparent; }
                }
                @keyframes sun-pulse {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.5); }
                }
                .effect-item {
                    position: absolute;
                    color: rgba(255, 255, 255, 0.4);
                }
            `}</style>

            {/* Minimalist Pill Clouds (for cloudy or rain/thunder) */}
            {(isCloudy || isRain || isThunder || isSnow) && (
                <div className="clouds-container" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '60%',
                    pointerEvents: 'none',
                    zIndex: 0
                }}>
                    {[
                        { top: '15%', delay: 0, duration: 25, pills: [120, 80] },
                        { top: '35%', delay: -12, duration: 32, pills: [160, 100, 140] },
                        { top: '10%', delay: -18, duration: 28, pills: [90, 130] },
                        { top: '45%', delay: -5, duration: 22, pills: [110] },
                        { top: '25%', delay: -25, duration: 35, pills: [140, 60] }
                    ].map((group, i) => (
                        <div key={i} className="composite-cloud" style={{
                            top: group.top,
                            animation: `float-pill ${group.duration}s linear infinite`,
                            animationDelay: `${group.delay}s`,
                            left: -200
                        }}>
                            {group.pills.map((w, pi) => (
                                <div key={pi} className="cloud-pill" style={{
                                    width: w,
                                    opacity: 0.8 / (pi + 1),
                                    marginLeft: pi * 20 * (i % 2 === 0 ? 1 : -1)
                                }} />
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {/* Raindrops */}
            {(isRain || isThunder) && rainDrops.map((drop, i) => (
                <div key={`rain-${i}`} className="effect-item" style={{
                    top: -20,
                    left: drop.left,
                    width: '2px',
                    height: drop.height,
                    background: 'rgba(255,255,255,0.6)',
                    animation: `fall-rain ${drop.duration} linear infinite`,
                    animationDelay: drop.delay,
                    borderRadius: '2px'
                }} />
            ))}

            {/* Lightning flashes */}
            {isThunder && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    animation: 'lightning-flash 6s infinite',
                    animationDelay: lightningDelay
                }} />
            )}

            {/* Snow */}
            {isSnow && snowFlakes.map((flake, i) => (
                <div key={`snow-${i}`} className="effect-item" style={{
                    top: -20,
                    left: flake.left,
                    animation: `fall-snow ${flake.duration} linear infinite`,
                    animationDelay: flake.delay,
                    filter: flake.blur
                }}>
                    <Snowflake size={flake.size} />
                </div>
            ))}

            {/* Stars */}
            {isClearNight && stars.map((star, i) => (
                <div key={`star-${i}`} className="effect-item" style={{
                    top: star.top,
                    left: star.left,
                    animation: `twinkle-star ${star.duration} infinite`,
                    animationDelay: star.delay
                }}>
                    <Star fill="currentColor" size={star.size} />
                </div>
            ))}

            {/* Sun Rays */}
            {isClearDay && (
                <div style={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-10%',
                    width: '150px',
                    height: '150px',
                    background: 'rgba(255, 235, 59, 0.3)',
                    borderRadius: '50%',
                    filter: 'blur(30px)',
                    animation: 'sun-pulse 8s infinite alternate'
                }} />
            )}
        </div>
    );
}
