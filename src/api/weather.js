/**
 * Open-Meteo API Service
 * https://open-meteo.com/en/docs
 */

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

import { weatherConditions } from '../i18n';

// Helper to map WMO weather codes to readable conditions and icons
export const getWeatherCondition = (code, isDay = 1, lang = 'en') => {
    const conditionsBase = {
        0: { icon: isDay ? 'Sun' : 'Moon', color: 'var(--weather-color-sun)' },
        1: { icon: isDay ? 'CloudSun' : 'CloudMoon', color: 'var(--weather-color-sun)' },
        2: { icon: isDay ? 'CloudSun' : 'CloudMoon', color: 'var(--weather-color-cloud)' },
        3: { icon: 'Cloud', color: 'var(--weather-color-cloud)' },
        45: { icon: 'CloudFog', color: 'var(--weather-color-cloud)' },
        48: { icon: 'CloudFog', color: 'var(--weather-color-cloud)' },
        51: { icon: 'CloudDrizzle', color: 'var(--weather-color-rain)' },
        53: { icon: 'CloudDrizzle', color: 'var(--weather-color-rain)' },
        55: { icon: 'CloudDrizzle', color: 'var(--weather-color-rain)' },
        61: { icon: 'CloudRain', color: 'var(--weather-color-rain)' },
        63: { icon: 'CloudRain', color: 'var(--weather-color-rain)' },
        65: { icon: 'CloudRain', color: 'var(--weather-color-rain)' },
        71: { icon: 'CloudSnow', color: 'var(--weather-color-snow)' },
        73: { icon: 'CloudSnow', color: 'var(--weather-color-snow)' },
        75: { icon: 'CloudSnow', color: 'var(--weather-color-snow)' },
        80: { icon: 'CloudRain', color: 'var(--weather-color-rain)' },
        81: { icon: 'CloudRain', color: 'var(--weather-color-rain)' },
        82: { icon: 'CloudLightning', color: 'var(--weather-color-rain)' },
        95: { icon: 'CloudLightning', color: 'var(--weather-color-rain)' },
        96: { icon: 'CloudLightning', color: 'var(--weather-color-rain)' },
        99: { icon: 'CloudLightning', color: 'var(--weather-color-rain)' },
    };

    const base = conditionsBase[code] || { icon: 'Cloud', color: 'var(--weather-color-cloud)' };
    const label = weatherConditions[lang][code] || weatherConditions['en'][code] || 'Unknown';

    // Determine dynamic background class
    let bgClass = 'weather-bg-cloudy';
    if ([0, 1].includes(code)) bgClass = isDay ? 'weather-bg-clear-day' : 'weather-bg-clear-night';
    else if ([2, 3, 45, 48].includes(code)) bgClass = 'weather-bg-cloudy';
    else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) bgClass = 'weather-bg-rain';
    else if ([71, 73, 75].includes(code)) bgClass = 'weather-bg-snow';
    else if ([95, 96, 99].includes(code)) bgClass = 'weather-bg-thunder';

    return { ...base, label, bgClass };
};

export const fetchCityByIP = async () => {
    try {
        const response = await fetch('http://ip-api.com/json/?fields=status,city');
        const data = await response.json();
        if (data.status === 'success' && data.city) {
            return data.city;
        }
        return null;
    } catch (error) {
        console.error("Failed to fetch IP location:", error);
        return null;
    }
};

export const geocodeCity = async (cityName, lang = 'zh') => {
    try {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=5&language=${lang}`);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            return data.results.map(result => ({
                lat: result.latitude,
                lon: result.longitude,
                name: result.name,
                admin1: result.admin1,
                country: result.country
            }));
        }
        return null;
    } catch (error) {
        console.error("Failed to geocode city:", error);
        return null;
    }
};

export const reverseGeocode = async (lat, lon, lang = 'en') => {
    try {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${lang}`);
        const data = await response.json();
        return data.city || data.locality || data.principalSubdivision || null;
    } catch (error) {
        console.error("Failed to reverse geocode:", error);
        return null;
    }
};

export const fetchWeather = async (lat = 25.0330, lon = 121.5654) => {
    // Default is Taipei City
    const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m',
        hourly: 'temperature_2m,weather_code,precipitation_probability',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,uv_index_max',
        timezone: 'auto'
    });

    try {
        const response = await fetch(`${BASE_URL}?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Weather data fetch failed');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch weather:", error);
        return null;
    }
};
