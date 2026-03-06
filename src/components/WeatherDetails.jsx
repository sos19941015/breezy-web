import React, { useState, useEffect } from 'react';
import { Droplets, Wind, Sun, Eye, Sunrise, Sunset, Activity, Navigation } from 'lucide-react';

export default function WeatherDetails({ current, daily, t }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    if (!current) return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'var(--spacing-md)' }}>
            <section className="card skeleton" style={{ height: '120px' }}></section>
            <section className="card skeleton" style={{ height: '120px' }}></section>
        </div>
    );

    const uvIndex = daily?.uv_index_max?.[0] || 0;

    const formatTime = (isoString) => {
        if (!isoString) return '--:--';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const sunriseStr = daily?.sunrise?.[0];
    const sunsetStr = daily?.sunset?.[0];
    const sunriseDate = sunriseStr ? new Date(sunriseStr) : null;
    const sunsetDate = sunsetStr ? new Date(sunsetStr) : null;
    const sunriseTime = formatTime(sunriseStr);
    const sunsetTime = formatTime(sunsetStr);
    const pm25 = current?.pm2_5 !== undefined ? current.pm2_5 : '--';

    const getUVColor = (uvi) => {
        if (uvi <= 2) return '#22c55e'; // Green
        if (uvi <= 5) return '#eab308'; // Yellow
        if (uvi <= 7) return '#f97316'; // Orange
        if (uvi <= 10) return '#ef4444'; // Red
        return '#a855f7'; // Purple
    };

    const interpolateColor = (val, colorStops) => {
        let lower = colorStops[0];
        let upper = colorStops[colorStops.length - 1];

        for (let i = 0; i < colorStops.length - 1; i++) {
            if (val >= colorStops[i].v && val <= colorStops[i + 1].v) {
                lower = colorStops[i];
                upper = colorStops[i + 1];
                break;
            }
        }

        let ratio = 0;
        if (upper.v > lower.v) {
            ratio = (val - lower.v) / (upper.v - lower.v);
        }

        const r = Math.round(lower.r + ratio * (upper.r - lower.r));
        const g = Math.round(lower.g + ratio * (upper.g - lower.g));
        const b = Math.round(lower.b + ratio * (upper.b - lower.b));

        return `rgb(${r}, ${g}, ${b})`;
    };

    const getPM25Color = (pm) => {
        if (pm === '--') return '';
        const clampedPm = Math.max(0, Math.min(100, parseFloat(pm)));
        // Stops based on the provided PM2.5 chart image
        const stops = [
            { v: 0, r: 0, g: 0, b: 255 },       // Blue
            { v: 10, r: 0, g: 255, b: 255 },    // Cyan
            { v: 20, r: 255, g: 255, b: 0 },    // Yellow
            { v: 30, r: 255, g: 170, b: 0 },    // Orange
            { v: 40, r: 255, g: 85, b: 0 },     // Red-orange
            { v: 50, r: 255, g: 0, b: 0 },      // Red
            { v: 60, r: 204, g: 0, b: 0 },      // Darker red
            { v: 70, r: 153, g: 0, b: 0 },      // Dark red
            { v: 80, r: 153, g: 0, b: 153 },    // Purple-red
            { v: 90, r: 204, g: 0, b: 204 },    // Magenta
            { v: 100, r: 255, g: 0, b: 255 }    // Light Magenta
        ];
        return interpolateColor(clampedPm, stops);
    };

    const getPM25Label = (pm) => {
        if (pm > 70) return 'Hazardous';
        if (pm > 54.4) return '紫爆 (Very Unhealthy)';
        if (pm > 35.4) return t.pm25Poor || 'Poor';
        if (pm > 15.4) return t.pm25Moderate || 'Moderate';
        return t.pm25Good || 'Good';
    };

    const getTempColor = (temp) => {
        if (temp < 10) return '#3b82f6'; // Blue
        if (temp < 20) return '#06b6d4'; // Cyan
        if (temp < 28) return '#22c55e'; // Green
        if (temp < 33) return '#f97316'; // Orange
        return '#ef4444'; // Red
    };

    const getHumidityColor = (hum) => {
        const h = Math.min(100, Math.max(0, hum));
        const lightness = 80 - (h * 0.4);
        return `hsl(210, 100%, ${lightness}%)`;
    };

    let sunProgress = 0;
    if (sunriseDate && sunsetDate) {
        if (currentTime > sunsetDate) {
            sunProgress = 100;
        } else if (currentTime > sunriseDate) {
            const total = sunsetDate - sunriseDate;
            const cur = currentTime - sunriseDate;
            sunProgress = (cur / total) * 100;
        }
    }

    const windSpeed = current.wind_speed_10m || 0;
    const windAnimDuration = Math.max(0.5, 3 - (windSpeed * 0.05));
    // wind_direction_10m is the direction wind originates from. 
    // To show where it goes, we add 180 degrees. Navigation icon points UP natively (0 deg).
    const windDir = current.wind_direction_10m || 0;
    const windArrowRotation = (windDir + 180) % 360;

    // Helper rendering function for cards
    const renderCardValueBar = (val, maxVal, color) => {
        const pct = Math.min(100, Math.max(0, (val / maxVal) * 100));
        return (
            <div style={{ width: '100%', height: '4px', background: 'var(--md-sys-color-surface)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width 1s ease' }}></div>
            </div>
        );
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'var(--spacing-md)' }}>
            <style>{`
                @keyframes windBlow {
                    0% { transform: translateX(-50px); opacity: 0; }
                    20% { opacity: 0.8; }
                    80% { opacity: 0.8; }
                    100% { transform: translateX(250px); opacity: 0; }
                }
                .wind-line {
                    position: absolute;
                    height: 2px;
                    border-radius: 2px;
                    animation: windBlow var(--wind-duration, 2s) linear infinite;
                    background: var(--md-sys-color-on-surface);
                    box-shadow: 0 0 8px currentColor;
                }
                .sun-progress-track {
                    height: 6px;
                    background: var(--md-sys-color-surface);
                    border-radius: 3px;
                    position: relative;
                    margin-top: 16px;
                    box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
                }
                .sun-progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #fcd34d, #f59e0b, #d97706);
                    border-radius: 3px;
                    position: absolute;
                    left: 0;
                    top: 0;
                    transition: width 1s ease;
                }
                .sun-progress-icon {
                    position: absolute;
                    top: -12px;
                    transform: translateX(-50%);
                    color: #f59e0b;
                    filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.8));
                    transition: left 1s ease;
                }
            `}</style>

            {/* Wind */}
            <section className="card" style={{ padding: 'var(--spacing-md)', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                    '--wind-duration': `${windAnimDuration}s`,
                    position: 'absolute',
                    inset: '-100px',
                    pointerEvents: 'none',
                    opacity: 0.5,
                    transform: `rotate(${windDir + 90}deg)`,
                    transformOrigin: 'center'
                }}>
                    <div className="wind-line" style={{ top: '30%', animationDelay: '0s', width: '40px' }}></div>
                    <div className="wind-line" style={{ top: '60%', animationDelay: `${windAnimDuration * 0.3}s`, width: '25px' }}></div>
                    <div className="wind-line" style={{ top: '80%', animationDelay: `${windAnimDuration * 0.7}s`, width: '45px' }}></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--spacing-sm)', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Wind size={20} />
                        <span className="text-label">{t.wind}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', position: 'relative' }}>
                    <p className="text-headline">{current.wind_speed_10m} <span className="text-body">km/h</span></p>
                    <Navigation
                        size={24}
                        color="var(--md-sys-color-on-surface)"
                        style={{ transform: `rotate(${windArrowRotation}deg)`, transition: 'transform 1s ease' }}
                        strokeWidth={2.5}
                    />
                </div>
            </section>

            {/* Humidity */}
            <section className="card" style={{ padding: 'var(--spacing-md)', background: `linear-gradient(180deg, var(--md-sys-color-surface-variant) 40%, ${getHumidityColor(current.relative_humidity_2m)} 300%)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--spacing-sm)' }}>
                    <Droplets size={20} color={getHumidityColor(current.relative_humidity_2m)} />
                    <span className="text-label">{t.humidity}</span>
                </div>
                <p className="text-headline">{current.relative_humidity_2m}%</p>
                {renderCardValueBar(current.relative_humidity_2m, 100, getHumidityColor(current.relative_humidity_2m))}
            </section>

            {/* UV Index */}
            <section className="card" style={{ padding: 'var(--spacing-md)', background: `linear-gradient(180deg, var(--md-sys-color-surface-variant) 40%, ${getUVColor(uvIndex)} 300%)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--spacing-sm)' }}>
                    <Sun size={20} color={getUVColor(uvIndex)} />
                    <span className="text-label">{t.uvIndex}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <p className="text-headline" style={{ color: getUVColor(uvIndex) }}>{uvIndex}</p>
                    <p className="text-body" style={{ color: getUVColor(uvIndex), fontWeight: 500, marginBottom: '4px' }}>
                        {uvIndex > 10 ? 'Extreme' : uvIndex > 7 ? t.uvHigh : uvIndex > 2 ? t.uvModerate : t.uvLow}
                    </p>
                </div>
                {renderCardValueBar(uvIndex, 15, getUVColor(uvIndex))}
            </section>

            {/* Feels Like Temp */}
            <section className="card" style={{ padding: 'var(--spacing-md)', background: `linear-gradient(180deg, var(--md-sys-color-surface-variant) 40%, ${getTempColor(current.apparent_temperature)} 300%)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--spacing-sm)' }}>
                    <Eye size={20} color={getTempColor(current.apparent_temperature)} />
                    <span className="text-label">{t.feelsLike}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <p className="text-headline" style={{ color: getTempColor(current.apparent_temperature) }}>{Math.round(current.apparent_temperature)}°</p>
                    <p className="text-body" style={{ color: getTempColor(current.apparent_temperature), fontWeight: 500, marginBottom: '4px' }}>
                        {current.apparent_temperature >= 33 ? (t.tempHot || 'Hot') : current.apparent_temperature < 10 ? (t.tempCold || 'Cold') : (t.tempComfortable || 'Comfortable')}
                    </p>
                </div>
                {/* Scale from -10 to 40 for feel-like progress. span = 50 */}
                {renderCardValueBar(Math.max(0, current.apparent_temperature + 10), 50, getTempColor(current.apparent_temperature))}
            </section>

            {/* PM2.5 */}
            <section className="card" style={{ padding: 'var(--spacing-md)', background: pm25 !== '--' ? `linear-gradient(180deg, var(--md-sys-color-surface-variant) 40%, ${getPM25Color(pm25)} 400%)` : 'var(--md-sys-color-surface-variant)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--spacing-sm)' }}>
                    <Activity size={20} color={getPM25Color(pm25)} />
                    <span className="text-label">{t.pm25 || 'PM2.5'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <p className="text-headline" style={{ color: getPM25Color(pm25) }}>{pm25} <span className="text-body" style={{ fontSize: '0.9rem', color: 'var(--md-sys-color-on-surface-variant)' }}>μg/m³</span></p>
                    {pm25 !== '--' && (
                        <p className="text-body" style={{ fontWeight: 500, color: getPM25Color(pm25), marginBottom: '4px' }}>
                            {getPM25Label(pm25)}
                        </p>
                    )}
                </div>
                {pm25 !== '--' && renderCardValueBar(pm25, 100, getPM25Color(pm25))}
            </section>

            {/* Sunrise / Sunset */}
            <section className="card" style={{ padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(180deg, var(--md-sys-color-surface-variant) 0%, rgba(245, 158, 11, 0.05) 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sunrise size={16} />
                        <span className="text-label" style={{ fontSize: '0.75rem' }}>{sunriseTime}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="text-label" style={{ fontSize: '0.75rem' }}>{sunsetTime}</span>
                        <Sunset size={16} />
                    </div>
                </div>
                <div className="sun-progress-track">
                    <div className="sun-progress-fill" style={{ width: `${sunProgress}%` }}></div>
                    <div className="sun-progress-icon" style={{ left: `${sunProgress}%` }}>
                        <Sun size={14} fill="currentColor" />
                    </div>
                </div>
            </section>
        </div>
    );
}
