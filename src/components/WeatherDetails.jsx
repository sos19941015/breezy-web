import React from 'react';
import { Droplets, Wind, Sun, Eye, Sunrise, Sunset, Activity } from 'lucide-react';

export default function WeatherDetails({ current, daily, t }) {
    if (!current) return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
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

    const sunriseTime = formatTime(daily?.sunrise?.[0]);
    const sunsetTime = formatTime(daily?.sunset?.[0]);
    const pm25 = current?.pm2_5 !== undefined ? current.pm2_5 : '--';

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

            <section className="card" style={{ padding: 'var(--spacing-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--spacing-sm)' }}>
                    <Activity size={20} />
                    <span className="text-label">{t.pm25 || 'PM2.5'}</span>
                </div>
                <p className="text-headline">{pm25} <span className="text-body" style={{ fontSize: '0.9rem' }}>μg/m³</span></p>
                {pm25 !== '--' && (
                    <p className="text-body" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginTop: '4px' }}>
                        {pm25 > 50 ? t.pm25Poor : pm25 > 15 ? t.pm25Moderate : t.pm25Good}
                    </p>
                )}
            </section>

            <section className="card" style={{ padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                        <Sunrise size={20} />
                        <span className="text-label">{t.sunrise || 'Sunrise'}</span>
                    </div>
                    <p className="text-headline" style={{ fontSize: '1.25rem' }}>{sunriseTime}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                        <Sunset size={20} />
                        <span className="text-label">{t.sunset || 'Sunset'}</span>
                    </div>
                    <p className="text-headline" style={{ fontSize: '1.25rem' }}>{sunsetTime}</p>
                </div>
            </section>
        </div>
    );
}
