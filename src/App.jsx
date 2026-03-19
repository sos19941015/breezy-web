import React, { useState, useEffect } from 'react';
import { Search, MapPin, RefreshCw, AlertCircle, Globe, Navigation, Star, Map, ExternalLink } from 'lucide-react';
import { fetchWeather, fetchCityByIP, geocodeCity, reverseGeocode } from './api/weather';
import { translations } from './i18n';

import CurrentWeather from './components/CurrentWeather';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import WeatherDetails from './components/WeatherDetails';
import About from './components/About';
import Favorites from './components/Favorites';
import MapPicker from './components/MapPicker';
import 'leaflet/dist/leaflet.css';

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
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [isSourceMenuOpen, setIsSourceMenuOpen] = useState(false);

    // Favorites from localStorage
    const [favorites, setFavorites] = useState(() => {
        try {
            const saved = localStorage.getItem('breezy-favorites');
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [currentCoords, setCurrentCoords] = useState(null);

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
            setCurrentCoords({ lat, lon, name });
            localStorage.setItem('breezy-last-coords', JSON.stringify({ lat, lon, name }));
        } else {
            setError(t.failedFetch);
        }
        setLoading(false);
    };

    const fallbackToIP = async () => {
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

    const initApp = async () => {
        setLoading(true);

        // Always try to locate the user (GPS or IP) as default
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const cityName = await reverseGeocode(latitude, longitude, lang) || t.currentLocation;
                    await loadWeatherForCoords(latitude, longitude, cityName);
                },
                async (err) => {
                    console.warn("Geolocation fetch error:", err);
                    await fallbackToIP();
                },
                { timeout: 10000, enableHighAccuracy: true }
            );
        } else {
            await fallbackToIP();
        }
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

    const handleLocateUser = () => {
        if (!navigator.geolocation) {
            fallbackToIP();
            return;
        }

        setLoading(true);
        setLocationName(t.locatingGPS || t.locating);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const cityName = await reverseGeocode(latitude, longitude, lang) || t.currentLocation;
                await loadWeatherForCoords(latitude, longitude, cityName);
            },
            async (err) => {
                console.warn(err);
                await fallbackToIP();
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    };


    useEffect(() => {
        initApp();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.lang-menu-container') && !e.target.closest('.source-menu-container')) {
                setIsLangMenuOpen(false);
                setIsSourceMenuOpen(false);
            }
        };
        if (isLangMenuOpen || isSourceMenuOpen) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isLangMenuOpen, isSourceMenuOpen]);

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

    // Favorites functions
    const saveFavorites = (newFavs) => {
        setFavorites(newFavs);
        localStorage.setItem('breezy-favorites', JSON.stringify(newFavs));
    };

    const isFavorite = () => {
        if (!currentCoords) return false;
        return favorites.some(f => Math.abs(f.lat - currentCoords.lat) < 0.01 && Math.abs(f.lon - currentCoords.lon) < 0.01);
    };

    const toggleFavorite = () => {
        if (!currentCoords || !locationName) return;
        if (isFavorite()) {
            const newFavs = favorites.filter(f => !(Math.abs(f.lat - currentCoords.lat) < 0.01 && Math.abs(f.lon - currentCoords.lon) < 0.01));
            saveFavorites(newFavs);
        } else {
            const newFav = { lat: currentCoords.lat, lon: currentCoords.lon, name: locationName, admin1: data?.admin1 || '', country: data?.country || '' };
            saveFavorites([...favorites, newFav]);
        }
    };

    const handleSelectFavorite = async (fav) => {
        await loadWeatherForCoords(fav.lat, fav.lon, fav.name);
    };

    const handleRemoveFavorite = (idx) => {
        const newFavs = [...favorites];
        newFavs.splice(idx, 1);
        saveFavorites(newFavs);
    };

    return (
        <div className="app-container">
            {/* Header */}
            <header className="app-header">
                {isSearching ? (
                    <div className="search-container">
                        <form onSubmit={handleSearchSubmit} className="search-form">
                            <input
                                autoFocus
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t.searchPlaceholder}
                                className="search-input"
                            />
                            <button type="button" onClick={() => { setIsSearching(false); setSearchResults([]); }} className="cancel-btn">{t.cancel}</button>
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
                        <div className="header-left">
                            <div
                                onClick={() => setIsMapOpen(true)}
                                className="location-trigger"
                                title={t.selectLocation}
                            >
                                <MapPin size={28} color="var(--md-sys-color-primary)" />
                                <h1 className="location-name">{locationName}</h1>
                            </div>
                            <div className="action-icons">
                                <button
                                    onClick={toggleFavorite}
                                    title={isFavorite() ? t.removeFromFavorites : t.addToFavorites}
                                    className="icon-btn-small"
                                >
                                    <Star
                                        size={22}
                                        color={isFavorite() ? '#f59e0b' : 'var(--md-sys-color-on-surface-variant)'}
                                        fill={isFavorite() ? '#f59e0b' : 'none'}
                                    />
                                </button>
                                <div className="source-menu-container" style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => setIsSourceMenuOpen(!isSourceMenuOpen)}
                                        title={t.weatherSources}
                                        className="icon-btn-small"
                                    >
                                        <ExternalLink size={20} />
                                    </button>
                                    {isSourceMenuOpen && (
                                        <div className="dropdown-menu source-menu">
                                            <a
                                                href={`https://www.accuweather.com/en/search-locations?query=${data?.latitude},${data?.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="menu-item"
                                            >
                                                {t.accuWeather}
                                            </a>
                                            <a
                                                href={`https://weather.com/${lang === 'zh' ? 'zh-TW' : lang === 'zh-CN' ? 'zh-CN' : lang === 'ja' ? 'ja-JP' : 'en-US'}/weather/today/l/${data?.latitude},${data?.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="menu-item border-top"
                                            >
                                                {t.weatherChannel}
                                            </a>
                                            <a
                                                href={`https://www.msn.com/${lang === 'zh' ? 'zh-tw' : lang === 'zh-CN' ? 'zh-cn' : lang === 'ja' ? 'ja-jp' : 'en-us'}/weather?lat=${data?.latitude}&lon=${data?.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="menu-item border-top"
                                            >
                                                {t.msnWeather}
                                            </a>
                                            <a
                                                href={`https://www.google.com/search?q=weather+${encodeURIComponent(locationName)}&hl=${lang === 'zh' ? 'zh-TW' : lang === 'zh-CN' ? 'zh-CN' : lang === 'ja' ? 'ja' : 'en'}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="menu-item border-top"
                                            >
                                                {t.googleWeather}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="header-right">
                            <div className="lang-menu-container" style={{ position: 'relative', display: 'flex' }}>
                                <button
                                    className="lang-toggle-btn"
                                    aria-label="Toggle Language Menu"
                                    onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                                    title="Change Language"
                                >
                                    <img
                                        src={currentLangObj.flag}
                                        alt={currentLangObj.alt}
                                        className="lang-flag"
                                    />
                                </button>

                                {isLangMenuOpen && (
                                    <div className="dropdown-menu lang-menu">
                                        {languages.map((l) => (
                                            <button
                                                key={l.code}
                                                onClick={() => selectLanguage(l.code)}
                                                className={`menu-item ${lang === l.code ? 'active' : ''}`}
                                            >
                                                <img src={l.flag} alt={l.alt} className="lang-flag-small" />
                                                <span style={{ fontWeight: lang === l.code ? '600' : '400' }}>{l.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button className="icon-btn" aria-label="Locate Me" onClick={handleLocateUser} title="Locate Me">
                                <Navigation size={24} />
                            </button>
                            <button className="icon-btn" aria-label="Refresh" onClick={() => loadWeatherForCoords(data?.latitude || fallbackCoords.lat, data?.longitude || fallbackCoords.lon, locationName)}>
                                <RefreshCw size={24} className={loading ? "spin" : ""} />
                            </button>
                            <button className="icon-btn" aria-label="Map" onClick={() => setIsMapOpen(true)} title={t.selectLocation}>
                                <Map size={24} />
                            </button>
                            <button className="icon-btn" aria-label="Search" onClick={() => setIsSearching(true)}>
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

                {data && <WeatherDetails lat={data.latitude} lon={data.longitude} current={data.current} daily={data.daily} timezone={data.timezone} t={t} lang={lang} />}

                <Favorites
                    favorites={favorites}
                    onSelect={handleSelectFavorite}
                    onRemove={handleRemoveFavorite}
                    t={t}
                />

                <About t={t} />
            </main>

            <MapPicker
                isOpen={isMapOpen}
                onClose={() => setIsMapOpen(false)}
                onSelect={loadWeatherForCoords}
                initialPos={currentCoords ? { lat: currentCoords.lat, lng: currentCoords.lon } : null}
                t={t}
                lang={lang}
                initialSearchQuery={searchQuery}
            />
        </div>
    );
}

export default App;
