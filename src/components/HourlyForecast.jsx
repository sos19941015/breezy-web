import React, { useRef } from 'react';
import * as Icons from 'lucide-react';
import { getWeatherCondition } from '../api/weather';

export default function HourlyForecast({ hourly, t, lang }) {
    const scrollRef = useRef(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    if (!hourly) return <section className="card skeleton" style={{ height: '140px' }}></section>;

    // Get current hour index roughly
    const currentHour = new Date().getHours();
    // Show next 48 hours
    const nextHours = hourly.time.slice(currentHour, currentHour + 48).map((time, idx) => {
        const dataIdx = currentHour + idx;
        const dateObj = new Date(time);
        return {
            time: dateObj.getHours() + ':00',
            temp: hourly.temperature_2m[dataIdx],
            code: hourly.weather_code[dataIdx],
            precipitation: hourly.precipitation_probability ? hourly.precipitation_probability[dataIdx] : 0,
            isDay: dateObj.getHours() > 6 && dateObj.getHours() < 18 ? 1 : 0
        };
    });

    const scroll = (offset) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
        }
    };

    const handleMouseDown = (e) => {
        isDragging.current = true;
        startX.current = e.pageX - scrollRef.current.offsetLeft;
        scrollLeft.current = scrollRef.current.scrollLeft;
        scrollRef.current.style.cursor = 'grabbing';
        scrollRef.current.style.scrollSnapType = 'none'; // Disable snap while dragging
    };

    const handleMouseLeave = () => {
        isDragging.current = false;
        if (scrollRef.current) {
            scrollRef.current.style.cursor = 'grab';
            scrollRef.current.style.scrollSnapType = 'x mandatory';
        }
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        if (scrollRef.current) {
            scrollRef.current.style.cursor = 'grab';
            scrollRef.current.style.scrollSnapType = 'x mandatory';
        }
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX.current) * 2; // Scroll-fast multiplier
        scrollRef.current.scrollLeft = scrollLeft.current - walk;
    };

    return (
        <section className="card" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xs)' }}>
                <h3 className="text-label">{t.hourlyForecast}</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="scroll-btn" onClick={() => scroll(-200)} aria-label="Scroll Left">
                        <Icons.ChevronLeft size={20} />
                    </button>
                    <button className="scroll-btn" onClick={() => scroll(200)} aria-label="Scroll Right">
                        <Icons.ChevronRight size={20} />
                    </button>
                </div>
            </div>
            <div
                className="horizontal-scroll"
                ref={scrollRef}
                style={{ overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth', cursor: 'grab' }}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
            >
                {nextHours.map((hour, i) => {
                    const condition = getWeatherCondition(hour.code, hour.isDay, lang);
                    const Icon = Icons[condition.icon] || Icons.Cloud;

                    return (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '60px', scrollSnapAlign: 'start', userSelect: 'none' }}>
                            <span className="text-body" style={{ color: i === 0 ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-variant)' }}>
                                {i === 0 ? t.now : hour.time}
                            </span>
                            <Icon size={28} color={condition.color} />
                            <span className="text-title" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                {Math.round(hour.temp)}°
                                {hour.precipitation > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--weather-color-rain)', marginTop: '2px' }}>{hour.precipitation}%</span>}
                            </span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
