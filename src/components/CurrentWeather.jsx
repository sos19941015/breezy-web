import React from 'react';
import * as Icons from 'lucide-react';
import { getWeatherCondition } from '../api/weather';
import WeatherEffects from './WeatherEffects';

export default function CurrentWeather({ current, todayMax, todayMin, todayPrecipSum, t, lang }) {
    if (!current) return <section className="card skeleton" style={{ height: '180px' }}></section>;

    const condition = getWeatherCondition(current.weather_code, current.is_day, lang);
    const Icon = Icons[condition.icon] || Icons.Cloud;

    // Format current time properly (e.g., 14:30)
    const formatTime = () => {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    };

    return (
        <section className={`card ${condition.bgClass}`} style={{ alignItems: 'center', textAlign: 'center', padding: 'var(--spacing-lg)', position: 'relative', overflow: 'hidden' }}>
            <WeatherEffects bgClass={condition.bgClass} />

            <div style={{ position: 'absolute', bottom: 'var(--spacing-sm)', left: 'var(--spacing-md)', fontSize: '0.75rem', color: 'inherit', opacity: 0.85, zIndex: 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Icons.Droplets size={14} />
                {t.precipitation}: {todayPrecipSum !== undefined ? todayPrecipSum : 0} mm
            </div>
            <div style={{ position: 'absolute', bottom: 'var(--spacing-sm)', right: 'var(--spacing-md)', fontSize: '0.75rem', color: 'inherit', opacity: 0.85, zIndex: 1 }}>
                {t.updatedAt || 'Updated at'}: {formatTime()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)', zIndex: 1, position: 'relative' }}>
                <Icon size={48} color={condition.color} />
                <h2 className="text-display">{Math.round(current.temperature_2m)}°</h2>
            </div>
            <p className="text-title" style={{ marginTop: '0', zIndex: 1, position: 'relative' }}>{condition.label}</p>

            <div style={{ display: 'flex', gap: 'var(--spacing-md)', color: 'inherit', opacity: 0.85, marginTop: 'var(--spacing-xs)', zIndex: 1, position: 'relative' }}>
                <span>{t.high}: {Math.round(todayMax)}°</span>
                <span>{t.low}: {Math.round(todayMin)}°</span>
            </div>
            <p className="text-body" style={{ color: 'inherit', opacity: 0.85, marginTop: 'var(--spacing-sm)', zIndex: 1, position: 'relative' }}>
                {t.feelsLike} {Math.round(current.apparent_temperature)}°
            </p>
        </section>
    );
}
