import React, { useState, useEffect } from 'react';
import { Droplets, Wind, Sun, Eye, Sunrise, Sunset, Activity } from 'lucide-react';

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

    const getPM25Color = (pm) => {
        if (pm === '--') return '';
        if (pm <= 15.4) return '#22c55e'; // Good
        if (pm <= 35.4) return '#eab308'; // Moderate
        if (pm <= 54.4) return '#f97316'; // Unhealthy for sensitive
        if (pm <= 150.4) return '#ef4444'; // Unhealthy
        if (pm <= 250.4) return '#a855f7'; // Very Unhealthy (紫爆)
        return '#9f1239'; // Hazardous
    };

    const getPM25Label = (pm) => {
        if (pm > 250.4) return 'Hazardous';
        if (pm > 150.4) return '紫爆 (Very Unhealthy)';
        if (pm > 54.4) return t.pm25Poor || 'Unhealthy';
        if (pm > 15.4) return t.pm25Moderate || 'Moderate';
        return t.pm25Good || 'Good';
    };

    const getTempColor = (temp) => {
        if (temp < 10) return '#3b82f6';
        if (temp < 20) return '#06b6d4';
        if (temp < 28) return '#22c55e';
        if (temp < 33) return '#f97316';
        return '#ef4444';
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
                    margin-top: 24px;
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
                    top: -20px;
                    transform: translateX(-50%);
                    color: #f59e0b;
                    filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.8));
                    transition: left 1s ease;
                }
            `}</style>

            {/* Wind */}
            <section className="card" style={{ padding: 'var(--spacing-md)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ '--wind-duration': `${windAnimDuration}s`, position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5 }}>
                    <div className="wind-line" style={{ top: '30%', animationDelay: '0s', width: '40px' }}></div>
                    <div className="wind-line" style={{ top: '60%', animationDelay: `${windAnimDuration * 0.3}s`, width: '25px' }}></div>
                    <div className="wind-line" style={{ top: '80%', animationDelay: `${windAnimDuration * 0.7}s`, width: '45px' }}></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--spacing-sm)', position: 'relative' }}>
                    <Wind size={20} />
                    <span className="text-label">{t.wind}</span>
                </div>
                <p className="text-headline" style={{ position: 'relative' }}>{current.wind_speed_10m} <span className="text-body">km/h</span></p>
            </section>

            {/* Humidity */}
            <section className="card" style={{ padding: 'var(--spacing-md)', background: `linear-gradient(180deg, var(--md-sys-color-surface-variant) 40%, ${getHumidityColor(current.relative_humidity_2m)} 300%)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--spacing-sm)' }}>
                    <Droplets size={20} color={getHumidityColor(current.relative_humidity_2m)} />
                    <span className="text-label">{t.humidity}</span>
                </div>
                <p className="text-headline">{current.relative_humidity_2m}%</p>
                <div style={{ width: '100%', height: '4px', background: 'var(--md-sys-color-surface)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${current.relative_humidity_2m}%`, height: '100%', background: getHumidityColor(current.relative_humidity_2m), borderRadius: '2px', transition: 'width 1s ease' }}></div>
                </div>
            </section>

            {/* UV Index */}
            <section className="card" style={{ padding: 'var(--spacing-md)', borderTop: `4px solid ${getUVColor(uvIndex)}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--spacing-sm)' }}>
                    <Sun size={20} color={getUVColor(uvIndex)} />
                    <span className="text-label">{t.uvIndex}</span>
                </div>
                <p className="text-headline" style={{ color: getUVColor(uvIndex) }}>{uvIndex}</p>
                <p className="text-body" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginTop: '4px' }}>
                    {uvIndex > 10 ? 'Extreme' : uvIndex > 7 ? t.uvHigh : uvIndex > 2 ? t.uvModerate : t.uvLow}
                </p>
            </section>

            {/* Feels Like Temp */}
            <section className="card" style={{ padding: 'var(--spacing-md)', borderTop: `4px solid ${getTempColor(current.apparent_temperature)}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--spacing-sm)' }}>
                    <Eye size={20} color={getTempColor(current.apparent_temperature)} />
                    <span className="text-label">{t.feelsLike}</span>
                </div>
                <p className="text-headline" style={{ color: getTempColor(current.apparent_temperature) }}>{Math.round(current.apparent_temperature)}°</p>
                <p className="text-body" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginTop: '4px' }}>
                    {current.apparent_temperature >= 33 ? 'Hot' : current.apparent_temperature < 10 ? 'Cold' : 'Comfortable'}
                </p>
            </section>

            {/* PM2.5 */}
            <section className="card" style={{ padding: 'var(--spacing-md)', borderTop: pm25 !== '--' ? `4px solid ${getPM25Color(pm25)}` : 'none', gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--spacing-sm)' }}>
                    <Activity size={20} color={getPM25Color(pm25)} />
                    <span className="text-label">{t.pm25 || 'PM2.5'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <p className="text-headline" style={{ color: getPM25Color(pm25) }}>{pm25} <span className="text-body" style={{ fontSize: '1rem', color: 'var(--md-sys-color-on-surface-variant)' }}>μg/m³</span></p>
                    {pm25 !== '--' && (
                        <p className="text-body" style={{ fontWeight: 500, color: getPM25Color(pm25) }}>
                            {getPM25Label(pm25)}
                        </p>
                    )}
                </div>
            </section>

            {/* Sunrise / Sunset */}
            <section className="card" style={{ padding: 'var(--spacing-lg) var(--spacing-md)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gridColumn: 'span 2', background: 'linear-gradient(180deg, var(--md-sys-color-surface-variant) 0%, rgba(245, 158, 11, 0.05) 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--md-sys-color-on-surface-variant)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Sunrise size={18} />
                            <span className="text-label" style={{ fontSize: '0.8rem' }}>{t.sunrise || 'Sunrise'}</span>
                        </div>
                        <span style={{ fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>{sunriseTime}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span className="text-label" style={{ fontSize: '0.8rem' }}>{t.sunset || 'Sunset'}</span>
                            <Sunset size={18} />
                        </div>
                        <span style={{ fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>{sunsetTime}</span>
                    </div>
                </div>
                <div className="sun-progress-track">
                    <div className="sun-progress-fill" style={{ width: `${sunProgress}%` }}></div>
                    <div className="sun-progress-icon" style={{ left: `${sunProgress}%` }}>
                        <Sun size={24} fill="currentColor" />
                    </div>
                </div>
            </section>
        </div>
    );
}
