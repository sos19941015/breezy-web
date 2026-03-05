import React, { useState, useEffect } from 'react';
import { Search, MapPin, RefreshCw, AlertCircle, Globe } from 'lucide-react';
import { fetchWeather, fetchCityByIP, geocodeCity } from './api/weather';
import { translations } from './i18n';

import CurrentWeather from './components/CurrentWeather';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import WeatherDetails from './components/WeatherDetails';
import About from './components/About';

function App() {
    const [lang, setLang] = useState('zh');
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const t = translations[lang];

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [locationName, setLocationName] = useState(t.locating);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [error, setError] = useState(null);

    const languages = [
        { code: 'zh', name: '繁體中文', flag: 'https://flagcdn.com/w40/tw.png', alt: 'Taiwan' },
        { code: 'en', name: 'English', flag: 'https://flagcdn.com/w40/us.png', alt: 'United States' },
        { code: 'ja', name: '日本語', flag: 'https://flagcdn.com/w40/jp.png', alt: 'Japan' },
        { code: 'zh-CN', name: '简体中文', flag: 'https://flagcdn.com/w40/cn.png', alt: 'China' },
    ];

    const currentLangObj = languages.find(l => l.code === lang) || languages[0];

    // Default coordinate for Taipei City fallback
    const fallbackCoords = { lat: 25.0330, lon: 121.5654, name: lang === 'zh' ? '台北市' : 'Taipei City' };

    const loadWeatherForCoords = async (lat, lon, name) => {
        setLoading(true);
        setError(null);
        const weatherData = await fetchWeather(lat, lon);
        if (weatherData) {
            setData(weatherData);
            setLocationName(name);
        } else {
            setError(t.failedFetch);
        }
        setLoading(false);
    };

    const initApp = async () => {
        setLoading(true);
        let ipCity = await fetchCityByIP();
        if (ipCity) {
            const results = await geocodeCity(ipCity, lang);
            if (results && results.length > 0) {
                await loadWeatherForCoords(results[0].lat, results[0].lon, results[0].name || ipCity);
                return;
            }
        }
        // Fallback if IP fails
        await loadWeatherForCoords(fallbackCoords.lat, fallbackCoords.lon, fallbackCoords.name);
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError(null);
        const results = await geocodeCity(searchQuery, lang);

        if (results && results.length > 0) {
            setSearchResults(results);
            setLoading(false);
        } else {
            setError(`${t.cannotFind} ${searchQuery}`);
            setLoading(false);
            setSearchResults([]);
        }
    };

    const handleSelectCity = async (city) => {
        setSearchResults([]);
        setIsSearching(false);
        setSearchQuery('');
        await loadWeatherForCoords(city.lat, city.lon, city.name);
    };

    useEffect(() => {
        initApp();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.lang-menu-container')) {
                setIsLangMenuOpen(false);
            }
        };
        if (isLangMenuOpen) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isLangMenuOpen]);

    const selectLanguage = async (code) => {
        setLang(code);
        setIsLangMenuOpen(false);

        // Translate the current city name if we have data
        if (locationName && locationName !== translations[lang].locating && data) {
            const results = await geocodeCity(locationName, code);
            if (results && results.length > 0) {
                // Find nearest match just in case
                let bestMatch = results[0];
                let minDiff = Infinity;
                for (const res of results) {
                    const diff = Math.abs(res.lat - data.latitude) + Math.abs(res.lon - data.longitude);
                    if (diff < minDiff) {
                        minDiff = diff;
                        bestMatch = res;
                    }
                }
                setLocationName(bestMatch.name);
            }
        }
    };

    return (
        <div className="app-container">
            {/* Header */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)', minHeight: '48px' }}>
                {isSearching ? (
                    <div style={{ position: 'relative', width: '100%' }}>
                        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', width: '100%', gap: 'var(--spacing-sm)' }}>
                            <input
                                autoFocus
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t.searchPlaceholder}
                                style={{ flex: 1, padding: '8px 16px', borderRadius: 'var(--md-sys-shape-corner-medium)', border: 'none', backgroundColor: 'var(--md-sys-color-surface-variant)', color: 'var(--md-sys-color-on-surface-variant)', outline: 'none', font: 'inherit' }}
                            />
                            <button type="button" onClick={() => { setIsSearching(false); setSearchResults([]); }} style={{ padding: '8px', color: 'var(--md-sys-color-on-surface-variant)' }}>{t.cancel}</button>
                        </form>
                        {searchResults.length > 0 && (
                            <div className="search-dropdown">
                                {searchResults.map((city, idx) => (
                                    <button key={idx} className="search-result-item" onClick={() => handleSelectCity(city)}>
                                        <span className="city-name" style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--md-sys-color-on-surface)' }}>{city.name}</span>
                                        <span className="city-admin" style={{ fontSize: '0.85rem', color: 'var(--md-sys-color-on-surface-variant)' }}>
                                            {city.admin1 ? `${city.admin1}, ` : ''}{city.country}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <MapPin size={28} color="var(--md-sys-color-primary)" />
                            <h1 className="text-title" style={{ fontSize: '1.75rem', fontWeight: 600 }}>{locationName}</h1>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', position: 'relative' }} className="lang-menu-container">
                            <button
                                style={{ padding: '8px', display: 'flex', alignItems: 'center', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer' }}
                                aria-label="Toggle Language Menu"
                                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                                title="Change Language"
                            >
                                <img
                                    src={currentLangObj.flag}
                                    alt={currentLangObj.alt}
                                    style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '50%', border: '1px solid var(--md-sys-color-outline-variant)' }}
                                />
                            </button>

                            {isLangMenuOpen && (
                                <div style={{
                                    position: 'absolute', top: '100%', right: '100%', marginTop: '8px',
                                    backgroundColor: 'var(--md-sys-color-surface)',
                                    borderRadius: 'var(--md-sys-shape-corner-medium)',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                                    padding: 'var(--spacing-xs)',
                                    zIndex: 10,
                                    display: 'flex', flexDirection: 'column', gap: '4px',
                                    minWidth: '140px',
                                    border: '1px solid var(--md-sys-color-outline-variant)'
                                }}>
                                    {languages.map((l) => (
                                        <button
                                            key={l.code}
                                            onClick={() => selectLanguage(l.code)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px',
                                                border: 'none', background: lang === l.code ? 'var(--md-sys-color-surface-variant)' : 'transparent',
                                                color: 'var(--md-sys-color-on-surface)',
                                                borderRadius: '4px', cursor: 'pointer',
                                                textAlign: 'left', width: '100%'
                                            }}
                                        >
                                            <img src={l.flag} alt={l.alt} style={{ width: '20px', height: '20px', objectFit: 'cover', borderRadius: '50%' }} />
                                            <span style={{ fontSize: '0.9rem', fontWeight: lang === l.code ? '600' : '400' }}>{l.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <button style={{ padding: '8px' }} aria-label="Refresh" onClick={() => loadWeatherForCoords(data?.latitude || fallbackCoords.lat, data?.longitude || fallbackCoords.lon, locationName)}>
                                <RefreshCw size={24} className={loading ? "spin" : ""} style={{ transition: 'transform 0.3s ease' }} />
                            </button>
                            <button style={{ padding: '8px' }} aria-label="Search" onClick={() => setIsSearching(true)}>
                                <Search size={24} />
                            </button>
                        </div>
                    </>
                )}
            </header>

            {error && (
                <div style={{ padding: 'var(--spacing-md)', backgroundColor: '#ffb4ab', color: '#690005', borderRadius: 'var(--md-sys-shape-corner-medium)', marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* Main Content Area */}
            <main style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                <CurrentWeather
                    current={data?.current}
                    todayMax={data?.daily?.temperature_2m_max?.[0]}
                    todayMin={data?.daily?.temperature_2m_min?.[0]}
                    t={t}
                    lang={lang}
                />

                <HourlyForecast hourly={data?.hourly} t={t} lang={lang} />

                <DailyForecast daily={data?.daily} t={t} lang={lang} />

                {data && <WeatherDetails current={data.current} daily={data.daily} t={t} />}

                <About t={t} />
            </main>
        </div>
    );
}

export default App;
