import React from 'react';
import * as Icons from 'lucide-react';
import { getWeatherCondition } from '../api/weather';

const getDayName = (dateStr, isToday, t, lang) => {
    if (isToday) return t.today;
    return new Date(dateStr).toLocaleDateString(lang === 'zh' ? 'zh-TW' : 'en-US', { weekday: 'short' });
}

export default function DailyForecast({ daily, t, lang }) {
    if (!daily) return <section className="card skeleton" style={{ height: '300px' }}></section>;

    const days = daily.time.map((time, idx) => ({
        time,
        maxTemp: daily.temperature_2m_max[idx],
        minTemp: daily.temperature_2m_min[idx],
        code: daily.weather_code[idx],
        pop: daily.precipitation_probability_max ? daily.precipitation_probability_max[idx] : 0
    }));

    return (
        <section className="card">
            <h3 className="text-label" style={{ marginBottom: 'var(--spacing-md)' }}>{t.sevenDayForecast}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {days.map((day, i) => {
                    const condition = getWeatherCondition(day.code, 1, lang);
                    const Icon = Icons[condition.icon] || Icons.Cloud;

                    return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span className="text-body" style={{ width: '60px', fontWeight: i === 0 ? '600' : '400' }}>
                                {getDayName(day.time, i === 0, t, lang)}
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flex: 1, justifyContent: 'center' }}>
                                <Icon size={24} color={condition.color} />
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <span className="text-body" style={{ color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.85rem' }}>
                                        {condition.label}
                                    </span>
                                    {day.pop !== undefined && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--weather-color-rain)', fontSize: '0.75rem', fontWeight: 500 }}>
                                            <Icons.Droplets size={12} />
                                            <span>{day.pop}%</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--spacing-md)', width: '80px', justifyContent: 'flex-end' }}>
                                <span className="text-body" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>{Math.round(day.minTemp)}°</span>
                                <span className="text-title">{Math.round(day.maxTemp)}°</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
