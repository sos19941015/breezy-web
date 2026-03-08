import React, { useEffect, useState } from 'react';
import { Cloud, Star, Snowflake, Droplets, Zap } from 'lucide-react';

export default function WeatherEffects({ bgClass }) {
    if (!bgClass) return null;

    const isRain = bgClass.includes('rain');
    const isSnow = bgClass.includes('snow');
    const isThunder = bgClass.includes('thunder');
    const isCloudy = bgClass.includes('cloudy');
    const isClearNight = bgClass.includes('clear-night');
    const isClearDay = bgClass.includes('clear-day');

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
                @keyframes float-cloud {
                    0% { transform: translateX(-150px); opacity: 0; }
                    20% { opacity: 0.6; }
                    80% { opacity: 0.6; }
                    100% { transform: translateX(100vw); opacity: 0; }
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

            {/* Clouds (for cloudy or rain/thunder) */}
            {(isCloudy || isRain || isThunder || isSnow) && Array.from({ length: 4 }).map((_, i) => (
                <div key={`cloud-${i}`} className="effect-item" style={{
                    top: `${10 + Math.random() * 40}%`,
                    left: 0,
                    animation: `float-cloud ${20 + Math.random() * 20}s linear infinite`,
                    animationDelay: `${-Math.random() * 30}s`,
                    opacity: 0.6,
                    transform: `scale(${0.5 + Math.random() * 1.5})`
                }}>
                    <Cloud size={48} fill="currentColor" opacity={0.3} />
                </div>
            ))}

            {/* Raindrops */}
            {(isRain || isThunder) && Array.from({ length: 20 }).map((_, i) => (
                <div key={`rain-${i}`} className="effect-item" style={{
                    top: -20,
                    left: `${Math.random() * 100}%`,
                    width: '2px',
                    height: `${10 + Math.random() * 20}px`,
                    background: 'rgba(255,255,255,0.6)',
                    animation: `fall-rain ${0.5 + Math.random() * 0.5}s linear infinite`,
                    animationDelay: `${Math.random()}s`,
                    borderRadius: '2px'
                }} />
            ))}

            {/* Lightning flashes */}
            {isThunder && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    animation: 'lightning-flash 6s infinite',
                    animationDelay: `${Math.random() * 5}s`
                }} />
            )}

            {/* Snow */}
            {isSnow && Array.from({ length: 25 }).map((_, i) => (
                <div key={`snow-${i}`} className="effect-item" style={{
                    top: -20,
                    left: `${Math.random() * 100}%`,
                    animation: `fall-snow ${3 + Math.random() * 3}s linear infinite`,
                    animationDelay: `${-Math.random() * 5}s`,
                    filter: `blur(${Math.random() > 0.5 ? 1 : 0}px)`
                }}>
                    <Snowflake size={8 + Math.random() * 12} />
                </div>
            ))}

            {/* Stars */}
            {isClearNight && Array.from({ length: 15 }).map((_, i) => (
                <div key={`star-${i}`} className="effect-item" style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `twinkle-star ${2 + Math.random() * 3}s infinite`,
                    animationDelay: `${Math.random() * 2}s`
                }}>
                    <Star fill="currentColor" size={4 + Math.random() * 6} />
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
