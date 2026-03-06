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
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data && data.city) {
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
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&addressdetails=1&accept-language=${lang}&limit=5`, {
            headers: { 'User-Agent': 'BreezyWeatherApp/1.0' }
        });
        const data = await response.json();
        if (data && data.length > 0) {
            return data.map(result => ({
                lat: parseFloat(result.lat),
                lon: parseFloat(result.lon),
                name: result.name || (result.display_name ? result.display_name.split(',')[0] : 'Unknown'),
                admin1: result.address?.state || result.address?.county || result.address?.region,
                country: result.address?.country
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
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=${lang}`, {
            headers: { 'User-Agent': 'BreezyWeatherApp/1.0' }
        });
        const data = await response.json();
        if (data && data.address) {
            const a = data.address;
            const specific = a.amenity || a.building || a.neighbourhood || a.road;
            const district = a.suburb || a.city_district || a.town || a.village || a.city || a.county;
            if (specific && district && specific !== district) {
                return `${district} ${specific}`;
            }
            return specific || district || a.state || null;
        }
        return null;
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
