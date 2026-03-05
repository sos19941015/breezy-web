import React from 'react';
import * as Icons from 'lucide-react';
import { getWeatherCondition } from '../api/weather';

export default function CurrentWeather({ current, todayMax, todayMin, t, lang }) {
    if (!current) return <section className="card skeleton" style={{ height: '180px' }}></section>;

    const condition = getWeatherCondition(current.weather_code, current.is_day, lang);
    const Icon = Icons[condition.icon] || Icons.Cloud;

    // Format current time properly (e.g., 14:30)
    const formatTime = () => {
        const now = new Date();
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    };

    return (
        <section className={`card ${condition.bgClass}`} style={{ alignItems: 'center', textAlign: 'center', padding: 'var(--spacing-lg)', position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: 'var(--spacing-sm)', right: 'var(--spacing-md)', fontSize: '0.75rem', color: 'inherit', opacity: 0.85 }}>
                {t.updatedAt || 'Updated at'}: {formatTime()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)' }}>
                <Icon size={48} color={condition.color} />
                <h2 className="text-display">{Math.round(current.temperature_2m)}°</h2>
            </div>
            <p className="text-title" style={{ marginTop: '0' }}>{condition.label}</p>

            <div style={{ display: 'flex', gap: 'var(--spacing-md)', color: 'inherit', opacity: 0.85, marginTop: 'var(--spacing-xs)' }}>
                <span>{t.high}: {Math.round(todayMax)}°</span>
                <span>{t.low}: {Math.round(todayMin)}°</span>
            </div>
            <p className="text-body" style={{ color: 'inherit', opacity: 0.85, marginTop: 'var(--spacing-sm)' }}>
                {t.feelsLike} {Math.round(current.apparent_temperature)}°
            </p>
        </section>
    );
}
