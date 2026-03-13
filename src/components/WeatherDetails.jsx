import React, { useState, useEffect } from 'react';
import { Droplets, Wind, Sun, Moon, Eye, Sunrise, Sunset, Activity, Navigation, Clock, Sparkles, Gauge, Thermometer } from 'lucide-react';
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

    const uvIndex = current?.is_day === 0 ? 0 : (current?.uv_index !== undefined ? current.uv_index : (daily?.uv_index_max?.[0] || 0));

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
        if (uvi <= 2) return '#22c55e'; // Green (Low)
        if (uvi <= 5) return '#eab308'; // Yellow (Moderate)
        if (uvi <= 7) return '#f97316'; // Orange (High)
        if (uvi <= 10) return '#ef4444'; // Red (Very High)
        return '#a855f7'; // Purple (Extreme)
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
        if (upper.v > lower.v) ratio = (val - lower.v) / (upper.v - lower.v);
        const r = Math.round(lower.r + ratio * (upper.r - lower.r));
        const g = Math.round(lower.g + ratio * (upper.g - lower.g));
        const b = Math.round(lower.b + ratio * (upper.b - lower.b));
        return `rgb(${r}, ${g}, ${b})`;
    };

    const getAQIColor = (aqiValue) => {
        if (aqiValue === '--') return '';
        const val = Math.max(0, Math.min(500, parseFloat(aqiValue)));
        const stops = [
            { v: 0, r: 76, g: 175, b: 80 },      // Green (Level 1: 0-20)
            { v: 20, r: 76, g: 175, b: 80 },     // Green (Cap Level 1)
            { v: 50, r: 251, g: 192, b: 45 },    // Yellow (Level 2: 21-50)
            { v: 100, r: 255, g: 152, b: 0 },    // Orange (Level 3: 51-100)
            { v: 150, r: 244, g: 67, b: 54 },    // Red (Level 4: 101-150)
            { v: 250, r: 156, g: 39, b: 176 },   // Purple (Level 5: 151-250)
            { v: 500, r: 121, g: 85, b: 72 }     // Brown (Level 6: 251+)
        ];
        return interpolateColor(val, stops);
    };

    const getAQILabel = (aqiValue) => {
        if (aqiValue === '--') return '';
        const v = parseFloat(aqiValue);
        if (v > 250) return t.aqiL6 || 'Hazardous';
        if (v > 150) return t.aqiL5 || 'Very Unhealthy';
        if (v > 100) return t.aqiL4 || 'Unhealthy';
        if (v > 50) return t.aqiL3 || 'Poor';
        if (v > 20) return t.aqiL2 || 'Fair';
        return t.aqiL1 || 'Excellent';
    };

    const getPollutantColor = (type, val) => {
        if (val === '--') return 'rgba(255,255,255,0.2)';
        const v = parseFloat(val);
        switch (type) {
            case 'pm25':
                if (v <= 12) return '#22c55e';
                if (v <= 35) return '#eab308';
                if (v <= 55) return '#f97316';
                return '#ef4444';
            case 'pm10':
                if (v <= 54) return '#22c55e';
                if (v <= 154) return '#eab308';
                if (v <= 254) return '#f97316';
                return '#ef4444';
            default:
                if (v <= 50) return '#22c55e';
                if (v <= 100) return '#eab308';
                return '#f97316';
        }
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
    if (sunriseDate && sunsetDate && !isNaN(sunriseDate.getTime()) && !isNaN(sunsetDate.getTime())) {
        if (targetLocalDate > sunsetDate) sunProgress = 100;
        else if (targetLocalDate > sunriseDate) {
            const total = sunsetDate - sunriseDate;
            const cur = targetLocalDate - sunriseDate;
            sunProgress = Math.min(100, Math.max(0, (cur / total) * 100));
        }
    }

    const getMoonEvents = (date, lat, lon, dailyData) => {
        let allEvents = [];
        if (dailyData?.moonrise && dailyData?.moonset) {
            const apiEvents = [];
            dailyData.moonrise.forEach(t => t && apiEvents.push({ type: 'rise', time: new Date(t) }));
            dailyData.moonset.forEach(t => t && apiEvents.push({ type: 'set', time: new Date(t) }));
            allEvents = apiEvents.sort((a, b) => a.time - b.time);
        } else {
            const searchDates = [-1, 0, 1].map(offset => {
                const d = new Date(date);
                d.setDate(d.getDate() + offset);
                return d;
            });
            allEvents = searchDates.flatMap(d => {
                const t = SunCalc.getMoonTimes(d, lat, lon);
                const events = [];
                if (t.rise) events.push({ type: 'rise', time: t.rise });
                if (t.set) events.push({ type: 'set', time: t.set });
                return events;
            }).sort((a, b) => a.time - b.time);
        }
        let rise = allEvents.filter(e => e.type === 'rise' && e.time <= date).pop()?.time || allEvents.find(e => e.type === 'rise' && e.time > date)?.time;
        let set = allEvents.filter(e => e.type === 'set' && e.time <= date).pop()?.time || allEvents.find(e => e.type === 'set' && e.time > date)?.time;
        const todayTimes = SunCalc.getMoonTimes(date, lat, lon);
        if (!rise) rise = todayTimes.rise;
        if (!set) set = todayTimes.set;
        return { rise, set, alwaysUp: todayTimes.alwaysUp, alwaysDown: todayTimes.alwaysDown };
    };

    const moonEvents = getMoonEvents(targetLocalDate, lat, lon, daily);
    const moonIllum = SunCalc.getMoonIllumination(targetLocalDate);

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
    else if (phase < 0.71) phaseKey = 'waningGibbous';
    else if (phase < 0.79) phaseKey = 'lastQuarter';
    else phaseKey = 'waningCrescent';

    const pInfo = phasesInfo[phaseKey];
    const phaseNameStr = (lang === 'zh' || lang === 'zh-CN') ? pInfo.zh : pInfo.en;
    const phaseName = `${pInfo.emoji} ${phaseNameStr}`;

    const formatMoonTime = (dateObj) => {
        if (!dateObj || isNaN(dateObj.getTime())) return '--:--';
        return formatTimeOffset(dateObj, timezone);
    };

    const moonriseTimeText = formatMoonTime(moonEvents.rise);
    const moonsetTimeText = formatMoonTime(moonEvents.set);

    let moonProgressPct = 0;
    if (moonEvents.rise && moonEvents.set) {
        const now = targetLocalDate.getTime();
        const rTime = moonEvents.rise.getTime();
        const sTime = moonEvents.set.getTime();
        if (rTime < sTime) {
            if (now >= sTime) moonProgressPct = 100;
            else if (now >= rTime) moonProgressPct = ((now - rTime) / (sTime - rTime)) * 100;
            else moonProgressPct = 0;
        } else {
            if (now < sTime) {
                const assumedRise = rTime - 86400000;
                moonProgressPct = ((now - assumedRise) / (sTime - assumedRise)) * 100;
            } else if (now > rTime) {
                const assumedSet = sTime + 86400000;
                moonProgressPct = ((now - rTime) / (assumedSet - rTime)) * 100;
            } else moonProgressPct = 0;
        }
    } else moonProgressPct = moonEvents.alwaysUp ? 100 : 0;
    moonProgressPct = Math.min(100, Math.max(0, moonProgressPct));

    const windSpeed = current.wind_speed_10m || 0;
    const windAnimDuration = Math.max(0.5, 3 - (windSpeed * 0.05));
    const windDir = current.wind_direction_10m || 0;
    const windArrowRotation = (windDir + 135) % 360;

    const getWindDirectionLabel = (degree) => {
        const d = (degree + 22.5) % 360;
        if (d < 45) return t.windN;
        if (d < 90) return t.windNE;
        if (d < 135) return t.windE;
        if (d < 180) return t.windSE;
        if (d < 225) return t.windS;
        if (d < 270) return t.windSW;
        if (d < 315) return t.windW;
        return t.windNW;
    };

    const renderCardValueBar = (val, maxVal, color) => {
        const pct = Math.min(100, Math.max(0, (val / maxVal) * 100));
        return (
            <div style={{ width: '100%', height: '4px', background: 'var(--md-sys-color-surface)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width 1s ease' }}></div>
            </div>
        );
    };

    const SunMoonArc = ({ progress, startTime, endTime, icon: Icon, color }) => {
        const angle = (progress / 100) * 180;
        const radian = (angle - 180) * (Math.PI / 180);
        const radius = 60;
        const centerX = 80;
        const centerY = 70;
        const x = centerX + radius * Math.cos(radian);
        const y = centerY + radius * Math.sin(radian);

        return (
            <div style={{ position: 'relative', height: '85px', width: '160px', margin: '0 auto' }}>
                <svg width="160" height="85" viewBox="0 0 160 85">
                    <path d="M 20 70 A 60 60 0 0 1 140 70" fill="none" stroke="var(--md-sys-color-outline-variant)" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />
                    <path d="M 20 70 A 60 60 0 0 1 140 70" fill="none" stroke={color} strokeWidth="2" strokeDasharray="200" strokeDashoffset={200 - (progress / 100 * 200)} transition="stroke-dashoffset 1s ease" opacity="0.6" />
                </svg>
                <div style={{
                    position: 'absolute', left: `${x}px`, top: `${y}px`, transform: 'translate(-50%, -50%)',
                    color: color, filter: `drop-shadow(0 0 8px ${color})`, transition: 'all 1s ease', zIndex: 2
                }}>
                    <Icon size={20} fill="currentColor" />
                </div>
                <div style={{ position: 'absolute', bottom: '0', left: '0', width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0 10px', fontSize: '0.75rem', opacity: 0.7 }}>
                    <span>{startTime}</span>
                    <span>{endTime}</span>
                </div>
            </div>
        );
    };

    const visibilityVal = (current.visibility !== undefined && current.visibility !== null) ? Math.round(current.visibility / 1000) : '--';
    const pressureVal = (current.surface_pressure !== undefined && current.surface_pressure !== null) ? Math.round(current.surface_pressure) : '--';

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 'var(--spacing-md)' }}>
            <style>{`
                @keyframes windBlow {
                    0% { transform: translateX(-50px); opacity: 0; }
                    20% { opacity: 0.8; }
                    80% { opacity: 0.8; }
                    100% { transform: translateX(350px); opacity: 0; }
                }
                .wind-line { position: absolute; height: 2px; border-radius: 2px; animation: windBlow var(--wind-duration, 2s) linear infinite; background: var(--md-sys-color-on-surface); box-shadow: 0 0 8px currentColor; }
                .pol-box { transition: all 0.3s ease; }
                .pol-box:hover { transform: translateY(-2px); background: rgba(255, 255, 255, 0.1) !important; }
            `}</style>

            {/* Wind */}
            <section className="card" style={{ padding: 'var(--spacing-md)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ '--wind-duration': `${windAnimDuration}s`, position: 'absolute', inset: '-100px', pointerEvents: 'none', opacity: 0.5, transform: `rotate(${windDir + 90}deg)`, transformOrigin: 'center' }}>
                    <div className="wind-line" style={{ top: '30%', animationDelay: '0s', width: '40px' }}></div>
                    <div className="wind-line" style={{ top: '60%', animationDelay: `${windAnimDuration * 0.3}s`, width: '25px' }}></div>
                    <div className="wind-line" style={{ top: '80%', animationDelay: `${windAnimDuration * 0.7}s`, width: '45px' }}></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--spacing-sm)', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Wind size={20} />
                        <span className="text-label" style={{ fontWeight: 600 }}>{t.wind}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span className="text-body" style={{ fontWeight: 600, color: 'var(--md-sys-color-primary)', fontSize: '0.9rem' }}>{getWindDirectionLabel(windDir)}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span className="text-headline" style={{ fontSize: '2.5rem', fontWeight: 500, lineHeight: 1 }}>{current.wind_speed_10m}</span>
                            <span className="text-body" style={{ opacity: 0.7, fontSize: '0.9rem' }}>km/h</span>
                        </div>
                        {current.wind_gusts_10m !== undefined && (
                            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.8 }}>
                                <span className="text-label" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>{t.windGust}</span>
                                <span className="text-body" style={{ fontSize: '0.9rem', fontWeight: 500 }}>{current.wind_gusts_10m} <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>km/h</span></span>
                            </div>
                        )}
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)' }}>
                        <Navigation size={28} color="var(--md-sys-color-on-surface)" style={{ transform: `rotate(${windArrowRotation}deg)`, transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }} strokeWidth={2} />
                    </div>
                </div>
            </section>

            {/* Humidity */}
            <section className="card" style={{ padding: 'var(--spacing-md)', background: `linear-gradient(180deg, var(--md-sys-color-surface-variant) 40%, ${getHumidityColor(current.relative_humidity_2m)} 400%)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--spacing-sm)' }}>
                    <Droplets size={20} color={getHumidityColor(current.relative_humidity_2m)} />
                    <span className="text-label" style={{ fontWeight: 600 }}>{t.humidity}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span className="text-headline" style={{ fontSize: '2.5rem', fontWeight: 500, lineHeight: 1 }}>{current.relative_humidity_2m}</span>
                        <span className="text-body" style={{ opacity: 0.7, fontSize: '1rem' }}>%</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p className="text-body" style={{ color: getHumidityColor(current.relative_humidity_2m), fontWeight: 600, fontSize: '0.9rem' }}>
                            {current.relative_humidity_2m >= 65 ? (t.humWet || 'Humid') : current.relative_humidity_2m <= 30 ? (t.humDry || 'Dry') : (t.humComfortable || 'Comfortable')}
                        </p>
                    </div>
                </div>
                {renderCardValueBar(current.relative_humidity_2m, 100, getHumidityColor(current.relative_humidity_2m))}
            </section>

            {/* UV Index */}
            <section className="card" style={{ padding: 'var(--spacing-md)', background: `linear-gradient(180deg, var(--md-sys-color-surface-variant) 40%, ${getUVColor(uvIndex)} 400%)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--spacing-sm)' }}>
                    <Sun size={20} color={getUVColor(uvIndex)} />
                    <span className="text-label" style={{ fontWeight: 600 }}>{t.uvIndex}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', marginBottom: '8px' }}>
                    <p className="text-headline" style={{ fontSize: '2.5rem', fontWeight: 500, lineHeight: 1, color: getUVColor(uvIndex) }}>{uvIndex}</p>
                    <p className="text-body" style={{ color: getUVColor(uvIndex), fontWeight: 600, fontSize: '0.9rem' }}>{uvIndex >= 11 ? t.uvExtreme : uvIndex >= 8 ? t.uvVeryHigh : uvIndex >= 6 ? t.uvHigh : uvIndex >= 3 ? t.uvModerate : t.uvLow}</p>
                </div>
                {renderCardValueBar(uvIndex, 15, getUVColor(uvIndex))}
            </section>

            {/* Feels Like */}
            <section className="card" style={{ padding: 'var(--spacing-md)', background: `linear-gradient(180deg, var(--md-sys-color-surface-variant) 40%, ${getTempColor(current.apparent_temperature)} 400%)` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--spacing-sm)' }}>
                    <Thermometer size={20} color={getTempColor(current.apparent_temperature)} />
                    <span className="text-label" style={{ fontWeight: 600 }}>{t.feelsLike}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                        <span className="text-headline" style={{ fontSize: '2.5rem', fontWeight: 500, lineHeight: 1, color: getTempColor(current.apparent_temperature) }}>{Math.round(current.apparent_temperature)}</span>
                        <span className="text-body" style={{ color: getTempColor(current.apparent_temperature), fontSize: '1.2rem', fontWeight: 500 }}>°</span>
                    </div>
                    <p className="text-body" style={{ color: getTempColor(current.apparent_temperature), fontWeight: 600, fontSize: '0.9rem' }}>{current.apparent_temperature >= 33 ? (t.tempHot || 'Hot') : current.apparent_temperature < 10 ? (t.tempCold || 'Cold') : (t.tempComfortable || 'Comfortable')}</p>
                </div>
                {renderCardValueBar(Math.max(0, current.apparent_temperature + 10), 50, getTempColor(current.apparent_temperature))}
            </section>

            {/* Visibility */}
            <section className="card" style={{ padding: 'var(--spacing-md)', background: 'linear-gradient(180deg, var(--md-sys-color-surface-variant) 40%, rgba(139, 92, 246, 0.1) 400%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--spacing-sm)' }}>
                    <Eye size={20} color="#8b5cf6" />
                    <span className="text-label" style={{ fontWeight: 600 }}>{t.visibility}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span className="text-headline" style={{ fontSize: '2.5rem', fontWeight: 500, lineHeight: 1 }}>{visibilityVal}</span>
                        {visibilityVal !== '--' && <span className="text-body" style={{ opacity: 0.7, fontSize: '1rem' }}>km</span>}
                    </div>
                </div>
                {renderCardValueBar(current.visibility ? Math.min(24000, current.visibility) : 0, 24000, "#8b5cf6")}
            </section>

            {/* Pressure */}
            <section className="card" style={{ padding: 'var(--spacing-md)', background: 'linear-gradient(180deg, var(--md-sys-color-surface-variant) 40%, rgba(20, 184, 166, 0.1) 400%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--spacing-sm)' }}>
                    <Gauge size={20} color="#14b8a6" />
                    <span className="text-label" style={{ fontWeight: 600 }}>{t.pressure}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span className="text-headline" style={{ fontSize: '2.5rem', fontWeight: 500, lineHeight: 1 }}>{pressureVal}</span>
                        {pressureVal !== '--' && <span className="text-body" style={{ opacity: 0.7, fontSize: '1rem' }}>hPa</span>}
                    </div>
                </div>
                {renderCardValueBar(current.surface_pressure ? Math.max(0, current.surface_pressure - 950) : 0, 100, "#14b8a6")}
            </section>

            {/* AQI */}
            <section className="card" style={{ padding: 'var(--spacing-md)', background: aqi !== '--' ? `linear-gradient(180deg, var(--md-sys-color-surface-variant) 40%, ${getAQIColor(aqi)} 400%)` : 'var(--md-sys-color-surface-variant)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: 'var(--spacing-sm)' }}>
                    <Activity size={20} color={getAQIColor(aqi)} />
                    <span className="text-label" style={{ fontWeight: 600 }}>{t.aqi || 'Air Quality (AQI)'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 'auto', marginBottom: '8px' }}>
                    <p className="text-headline" style={{ fontSize: '2.5rem', fontWeight: 500, lineHeight: 1, color: getAQIColor(aqi) }}>{aqi}</p>
                    {aqi !== '--' && <p className="text-body" style={{ fontWeight: 600, color: getAQIColor(aqi), fontSize: '1rem' }}>{getAQILabel(aqi)}</p>}
                </div>
                {aqi !== '--' && renderCardValueBar(aqi, 200, getAQIColor(aqi))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', gap: '8px' }}>
                    {[
                        { label: 'PM2.5', val: pm25, type: 'pm25' },
                        { label: 'PM10', val: pm10, type: 'pm10' },
                        { label: 'NO2', val: no2, type: 'no2' },
                        { label: 'SO2', val: so2, type: 'so2' }
                    ].map(p => (
                        <div key={p.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255, 255, 255, 0.04)', backdropFilter: 'blur(8px)', padding: '10px 0', borderRadius: '14px', flex: 1, border: '1px solid rgba(255,255,255,0.06)', position: 'relative' }} className="pol-box">
                            <span style={{ opacity: 0.5, marginBottom: '2px', fontWeight: 600, fontSize: '0.65rem', letterSpacing: '0.05em' }}>{p.label}</span>
                            <span style={{ fontWeight: 700, color: getPollutantColor(p.type, p.val), fontSize: '0.95rem' }}>{p.val}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Astronomy */}
            <section className="card" style={{ padding: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, var(--md-sys-color-surface-variant) 0%, rgba(245, 158, 11, 0.04) 40%, rgba(129, 140, 248, 0.06) 100%)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 className="text-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                        <Sparkles size={18} color="#f59e0b" />
                        {t.astronomy}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', background: 'rgba(0,0,0,0.1)', borderRadius: '20px', color: 'var(--md-sys-color-on-surface-variant)' }}>
                        <Clock size={14} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{targetLocalTimeStr}</span>
                    </div>
                </div>

                {/* Sun Track */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Sunrise size={18} color="#fcd34d" />
                            <span className="text-label" style={{ fontSize: '0.8rem', fontWeight: 500 }}>{sunriseTime}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="text-label" style={{ fontSize: '0.8rem', fontWeight: 500 }}>{sunsetTime}</span>
                            <Sunset size={18} color="#f59e0b" />
                        </div>
                    </div>
                    <div style={{ height: '6px', background: 'var(--md-sys-color-surface)', borderRadius: '3px', position: 'relative', marginTop: '12px' }}>
                        <div style={{ width: `${sunProgress}%`, height: '100%', background: 'linear-gradient(90deg, #fcd34d, #f59e0b)', borderRadius: '3px', transition: 'width 1s ease' }}></div>
                        <div style={{ position: 'absolute', left: `${sunProgress}%`, top: '50%', transform: 'translate(-50%, -50%)', filter: 'drop-shadow(0 0 6px #f59e0b)', transition: 'left 1s ease' }}>
                            <Sun size={14} fill="#f59e0b" color="#f59e0b" />
                        </div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid var(--md-sys-color-outline-variant)', margin: '4px 0 20px 0', opacity: 0.2 }}></div>

                {/* Moon Track */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Moon size={18} color="#c7d2fe" />
                            <span className="text-label" style={{ fontSize: '0.8rem', fontWeight: 500 }}>{moonriseTimeText}</span>
                        </div>
                        <div style={{ padding: '2px 8px', background: 'rgba(129, 140, 248, 0.1)', borderRadius: '12px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#818cf8' }}>{phaseName}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="text-label" style={{ fontSize: '0.8rem', fontWeight: 500 }}>{moonsetTimeText}</span>
                            <Moon size={18} color="#818cf8" />
                        </div>
                    </div>
                    <div style={{ height: '6px', background: 'var(--md-sys-color-surface)', borderRadius: '3px', position: 'relative', marginTop: '12px' }}>
                        <div style={{ width: `${moonProgressPct}%`, height: '100%', background: 'linear-gradient(90deg, #c7d2fe, #818cf8)', borderRadius: '3px', transition: 'width 1s ease' }}></div>
                        <div style={{ position: 'absolute', left: `${moonProgressPct}%`, top: '50%', transform: 'translate(-50%, -50%)', filter: 'drop-shadow(0 0 6px #818cf8)', transition: 'left 1s ease' }}>
                            <Moon size={14} fill="#818cf8" color="#818cf8" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
