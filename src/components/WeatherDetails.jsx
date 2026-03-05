import React from 'react';
import { Droplets, Wind, Sun, Eye } from 'lucide-react';

export default function WeatherDetails({ current, daily, t }) {
    if (!current) return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <section className="card skeleton" style={{ height: '120px' }}></section>
            <section className="card skeleton" style={{ height: '120px' }}></section>
        </div>
    );

    const uvIndex = daily?.uv_index_max?.[0] || 0;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <section className="card" style={{ padding: 'var(--spacing-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--spacing-sm)' }}>
                    <Wind size={20} />
                    <span className="text-label">{t.wind}</span>
                </div>
                <p className="text-headline">{current.wind_speed_10m} <span className="text-body">km/h</span></p>
            </section>

            <section className="card" style={{ padding: 'var(--spacing-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--spacing-sm)' }}>
                    <Droplets size={20} />
                    <span className="text-label">{t.humidity}</span>
                </div>
                <p className="text-headline">{current.relative_humidity_2m}%</p>
            </section>

            <section className="card" style={{ padding: 'var(--spacing-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--spacing-sm)' }}>
                    <Sun size={20} />
                    <span className="text-label">{t.uvIndex}</span>
                </div>
                <p className="text-headline">{uvIndex}</p>
                <p className="text-body" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginTop: '4px' }}>
                    {uvIndex > 7 ? t.uvHigh : uvIndex > 3 ? t.uvModerate : t.uvLow}
                </p>
            </section>

            <section className="card" style={{ padding: 'var(--spacing-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--spacing-sm)' }}>
                    <Eye size={20} />
                    <span className="text-label">{t.feelsLike}</span>
                </div>
                <p className="text-headline">{Math.round(current.apparent_temperature)}°</p>
            </section>
        </div>
    );
}
