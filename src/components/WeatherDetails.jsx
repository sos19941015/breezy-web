import React, { useState, useEffect } from 'react';
import { Droplets, Wind, Sun, Moon, Eye, Sunrise, Sunset, Activity, Navigation, Clock, Sparkles } from 'lucide-react';
import SunCalc from 'suncalc';

export default function WeatherDetails({ lat = 25.033, lon = 121.565, current, daily, timezone = 'auto', t, lang = 'zh' }) {
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

    const formatTimeOffset = (date, tz) => {
        try {
            return new Intl.DateTimeFormat('en-GB', {
                timeZone: tz === 'auto' ? undefined : tz,
                hour: '2-digit', minute: '2-digit', hour12: false
            }).format(date);
        } catch {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        }
    };

    // Calculate simulated local Date object for progress math
    const getSimulatedTargetDate = (date, tz) => {
        try {
            const str = new Intl.DateTimeFormat('sv-SE', {
                timeZone: tz === 'auto' ? undefined : tz,
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            }).format(date).replace(' ', 'T');
            return new Date(str);
        } catch {
            return date;
        }
    };

    const targetLocalDate = getSimulatedTargetDate(currentTime, timezone);
    const targetLocalTimeStr = formatTimeOffset(currentTime, timezone);

    const sunriseStr = daily?.sunrise?.[0];
    const sunsetStr = daily?.sunset?.[0];
    const sunriseDate = sunriseStr ? new Date(sunriseStr) : null;
    const sunsetDate = sunsetStr ? new Date(sunsetStr) : null;
    const sunriseTime = sunriseStr ? sunriseStr.slice(11, 16) : '--:--';
    const sunsetTime = sunsetStr ? sunsetStr.slice(11, 16) : '--:--';
    const aqi = current?.aqi !== undefined ? current.aqi : '--';
    const pm25 = current?.pm2_5 !== undefined ? current.pm2_5 : '--';
    const pm10 = current?.pm10 !== undefined ? current.pm10 : '--';
    const no2 = current?.no2 !== undefined ? current.no2 : '--';
    const so2 = current?.so2 !== undefined ? current.so2 : '--';

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

    const getAQIColor = (aqiValue) => {
        if (aqiValue === '--') return '';
        const val = Math.max(0, Math.min(100, parseFloat(aqiValue)));
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
        return interpolateColor(val, stops);
    };

    const getAQILabel = (aqiValue) => {
        if (aqiValue > 80) return t.aqiVeryPoor || 'Very Poor';
        if (aqiValue > 60) return t.aqiPoor || 'Poor';
        if (aqiValue > 40) return t.aqiModerate || 'Moderate';
        if (aqiValue > 20) return t.aqiFair || 'Fair';
        return t.aqiGood || 'Good';
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

    // Restore simple Sun progress
    let sunProgress = 0;
    if (sunriseDate && sunsetDate && !isNaN(sunriseDate.getTime()) && !isNaN(sunsetDate.getTime())) {
        if (targetLocalDate > sunsetDate) {
            sunProgress = 100;
        } else if (targetLocalDate > sunriseDate) {
            const total = sunsetDate - sunriseDate;
            const cur = targetLocalDate - sunriseDate;
            sunProgress = Math.min(100, Math.max(0, (cur / total) * 100));
        }
    }

    // Moon calculations using SunCalc
    const moonTimes = SunCalc.getMoonTimes(targetLocalDate, lat, lon);
    const moonIllum = SunCalc.getMoonIllumination(targetLocalDate);
    
    // Moon phases with appropriate emojis
    const phasesInfo = {
        newMoon: { zh: '新月 / 朔', en: 'New Moon', emoji: '🌑' },
        waxingCrescent: { zh: '眉月', en: 'Waxing Crescent', emoji: '🌒' },
        firstQuarter: { zh: '上弦月', en: 'First Quarter', emoji: '🌓' },
        waxingGibbous: { zh: '盈凸月', en: 'Waxing Gibbous', emoji: '🌔' },
        fullMoon: { zh: '滿月 / 望', en: 'Full Moon', emoji: '🌕' },
        waningGibbous: { zh: '虧凸月', en: 'Waning Gibbous', emoji: '🌖' },
        lastQuarter: { zh: '下弦月', en: 'Last Quarter', emoji: '🌗' },
        waningCrescent: { zh: '殘月', en: 'Waning Crescent', emoji: '🌘' }
    };

    const phase = moonIllum.phase;
    let phaseKey = '';
    if (phase < 0.03 || phase > 0.97) phaseKey = 'newMoon';
    else if (phase < 0.22) phaseKey = 'waxingCrescent';
    else if (phase < 0.28) phaseKey = 'firstQuarter';
    else if (phase < 0.47) phaseKey = 'waxingGibbous';
    else if (phase < 0.53) phaseKey = 'fullMoon';
    else if (phase < 0.72) phaseKey = 'waningGibbous';
    else if (phase < 0.78) phaseKey = 'lastQuarter';
    else phaseKey = 'waningCrescent';

    const pInfo = phasesInfo[phaseKey];
    const phaseNameStr = (lang === 'zh' || lang === 'zh-CN') ? pInfo.zh : pInfo.en;
    const phaseName = `${pInfo.emoji} ${phaseNameStr}`;

    const formatMoonTime = (dateObj) => {
        if (!dateObj || isNaN(dateObj.getTime())) return '--:--';
        return formatTimeOffset(dateObj, timezone);
    };

    const moonriseTimeText = formatMoonTime(moonTimes.rise);
    const moonsetTimeText = formatMoonTime(moonTimes.set);

    let moonProgressPct = 0;
    if (moonTimes.rise && moonTimes.set) {
        if (moonTimes.rise < moonTimes.set) {
            if (targetLocalDate > moonTimes.set) moonProgressPct = 100;
            else if (targetLocalDate > moonTimes.rise) {
                const total = moonTimes.set - moonTimes.rise;
                const cur = targetLocalDate - moonTimes.rise;
                moonProgressPct = Math.min(100, Math.max(0, (cur / total) * 100));
            }
        } else {
            // crosses midnight
            if (targetLocalDate < moonTimes.set) {
                const assumedRise = new Date(moonTimes.set.getTime() - 43200000);
                moonProgressPct = Math.max(0, Math.min(100, ((targetLocalDate - assumedRise)/(moonTimes.set - assumedRise))*100));
            } else if (targetLocalDate > moonTimes.rise) {
                const assumedSet = new Date(moonTimes.rise.getTime() + 43200000);
                moonProgressPct = Math.max(0, Math.min(100, ((targetLocalDate - moonTimes.rise)/(assumedSet - moonTimes.rise))*100));
            }
        }
    } else {
        moonProgressPct = moonTimes.alwaysUp ? 100 : 0;
    }

    const windSpeed = current.wind_speed_10m || 0;
    const windAnimDuration = Math.max(0.5, 3 - (windSpeed * 0.05));
    // wind_direction_10m is the direction wind originates from. 
    // Navigation icon natively points to Top-Right (45 deg).
    // Arrow should point to windDir + 180. To offset the native 45deg: windDir + 180 - 45 = windDir + 135
    const windDir = current.wind_direction_10m || 0;
    const windArrowRotation = (windDir + 135) % 360;

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
                    100% { transform: translateX(350px); opacity: 0; }
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <p className="text-headline">{current.relative_humidity_2m}%</p>
                    <div style={{ textAlign: 'right' }}>
                        <p className="text-body" style={{ color: getHumidityColor(current.relative_humidity_2m), fontWeight: 500, marginBottom: '2px' }}>
                            {current.relative_humidity_2m >= 65 ? (t.humWet || 'Humid') : current.relative_humidity_2m <= 30 ? (t.humDry || 'Dry') : (t.humComfortable || 'Comfortable')}
                        </p>
                        {current.dew_point_2m !== undefined && (
                            <p className="text-label" style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                                {t.dewPoint || 'Dew Point'} {current.dew_point_2m}°
                            </p>
                        )}
                    </div>
                </div>
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

            {/* AQI */}
            <section className="card" style={{ padding: 'var(--spacing-md)', background: aqi !== '--' ? `linear-gradient(180deg, var(--md-sys-color-surface-variant) 40%, ${getAQIColor(aqi)} 400%)` : 'var(--md-sys-color-surface-variant)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--spacing-sm)' }}>
                    <Activity size={20} color={getAQIColor(aqi)} />
                    <span className="text-label">{t.aqi || 'Air Quality (AQI)'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <p className="text-headline" style={{ color: getAQIColor(aqi) }}>{aqi}</p>
                    {aqi !== '--' && (
                        <p className="text-body" style={{ fontWeight: 500, color: getAQIColor(aqi), marginBottom: '4px' }}>
                            {getAQILabel(aqi)}
                        </p>
                    )}
                </div>
                {aqi !== '--' && renderCardValueBar(aqi, 100, getAQIColor(aqi))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '0.75rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255, 255, 255, 0.4)', padding: '6px 0', borderRadius: '8px', flex: 1, margin: '0 4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }} className="pol-box">
                        <span style={{opacity: 0.8, marginBottom:'2px'}}>PM2.5</span>
                        <span style={{ fontWeight: 600, color: 'var(--md-sys-color-on-surface)', fontSize: '0.85rem' }}>{pm25}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255, 255, 255, 0.4)', padding: '6px 0', borderRadius: '8px', flex: 1, margin: '0 4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }} className="pol-box">
                        <span style={{opacity: 0.8, marginBottom:'2px'}}>PM10</span>
                        <span style={{ fontWeight: 600, color: 'var(--md-sys-color-on-surface)', fontSize: '0.85rem' }}>{pm10}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255, 255, 255, 0.4)', padding: '6px 0', borderRadius: '8px', flex: 1, margin: '0 4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }} className="pol-box">
                        <span style={{opacity: 0.8, marginBottom:'2px'}}>NO2</span>
                        <span style={{ fontWeight: 600, color: 'var(--md-sys-color-on-surface)', fontSize: '0.85rem' }}>{no2}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255, 255, 255, 0.4)', padding: '6px 0', borderRadius: '8px', flex: 1, margin: '0 4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }} className="pol-box">
                        <span style={{opacity: 0.8, marginBottom:'2px'}}>SO2</span>
                        <span style={{ fontWeight: 600, color: 'var(--md-sys-color-on-surface)', fontSize: '0.85rem' }}>{so2}</span>
                    </div>
                </div>
            </section>

            {/* Sunrise / Sunset & Moonrise / Moonset */}
            <section className="card" style={{ padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(180deg, var(--md-sys-color-surface-variant) 0%, rgba(245, 158, 11, 0.05) 50%, rgba(129, 140, 248, 0.08) 100%)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 className="text-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={16} />
                        {t.astronomy}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                        {targetLocalDate > sunsetDate || targetLocalDate < sunriseDate ? <Moon size={16} /> : <Sun size={16} />}
                        <span style={{ fontSize: '0.75rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {targetLocalTimeStr}</span>
                    </div>
                </div>
                
                {/* Sun Track */}
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
                    <div className="sun-progress-fill" style={{ width: `${sunProgress}%`, background: 'linear-gradient(90deg, #fcd34d, #f59e0b, #d97706)' }}></div>
                    <div className="sun-progress-icon" style={{ left: `${sunProgress}%`, color: '#f59e0b', filter: 'drop-shadow(0 0 8px #f59e0b)' }}>
                        <Sun size={14} fill="currentColor" />
                    </div>
                </div>

                <div style={{ borderTop: '1px dashed var(--md-sys-color-outline-variant)', margin: '16px 0', opacity: 0.5 }}></div>

                {/* Moon Track */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Moon size={16} style={{transform: 'scaleX(-1)'}} /> {/* approximate Moonrise mapping */}
                        <span className="text-label" style={{ fontSize: '0.75rem' }}>{moonriseTimeText}</span>
                    </div>
                    <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--md-sys-color-primary)' }}>{phaseName}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="text-label" style={{ fontSize: '0.75rem' }}>{moonsetTimeText}</span>
                        <Moon size={16} />
                    </div>
                </div>
                <div className="sun-progress-track">
                    <div className="sun-progress-fill" style={{ width: `${moonProgressPct}%`, background: 'linear-gradient(90deg, #c7d2fe, #818cf8, #4f46e5)' }}></div>
                    <div className="sun-progress-icon" style={{ left: `${moonProgressPct}%`, color: '#818cf8', filter: 'drop-shadow(0 0 8px #818cf8)' }}>
                        <Moon size={14} fill="currentColor" />
                    </div>
                </div>

            </section>
        </div>
    );
}
