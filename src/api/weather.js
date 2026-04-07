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
            
            // Google Weather search name: district + 里/village level
            // e.g. "信義區西村里" — specific enough for Google, not too granular
            const district = a.suburb || a.city_district || a.city || a.town || '';
            const village = a.neighbourhood || a.village || '';
            let cityName;
            if (district && village && district !== village) {
                cityName = `${district}${village}`;
            } else {
                cityName = district || village || a.city || a.town || a.county || a.state || '';
            }
            
            // Display name for UI: Use specific details if available
            const mainName = a.city || a.town || a.village || a.suburb || a.city_district || a.county || a.state;
            const detailName = a.amenity || a.building || a.neighbourhood || a.road;
            
            let displayName = "";
            if (detailName && mainName && detailName !== mainName) {
                displayName = `${mainName} ${detailName}`;
            } else {
                displayName = mainName || detailName || "Unknown Location";
            }
            
            // Further fallback if everything fails
            if (displayName === "Unknown Location" && district) {
                displayName = district;
            }
            if (displayName === "Unknown Location") {
                displayName = cityName || "Unknown Location";
            }
            
            // Clean up duplicated strings like "纽约;紐約"
            if (displayName.includes(';')) {
                displayName = displayName.split(';')[0];
            }
            
            let cleanCityName = cityName;
            if (cleanCityName.includes(';')) {
                cleanCityName = cleanCityName.split(';')[0];
            }
            
            return { name: displayName, cityName: cleanCityName || displayName };
        }
        return null;
    } catch (error) {
        console.error("Failed to reverse geocode:", error);
        return null;
    }
};

export const fetchWeather = async (lat = 25.0330, lon = 121.5654) => {
    // Default is Taipei City — standardize to 5 decimal places
    const latStr = Number(lat).toFixed(5);
    const lonStr = Number(lon).toFixed(5);

    const params = new URLSearchParams({
        latitude: latStr,
        longitude: lonStr,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,dew_point_2m,precipitation,uv_index,visibility,surface_pressure',
        hourly: 'temperature_2m,weather_code,precipitation_probability',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset,precipitation_probability_max,precipitation_sum',
        timezone: 'auto'
    });

    const aqParams = new URLSearchParams({
        latitude: latStr,
        longitude: lonStr,
        current: 'us_aqi,pm10,pm2_5,nitrogen_dioxide,sulphur_dioxide',
        timezone: 'auto'
    });

    try {
        const [weatherRes, aqRes, astroRes] = await Promise.all([
            fetch(`${BASE_URL}?${params.toString()}`),
            fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${aqParams.toString()}`),
            fetch(`https://api.open-meteo.com/v1/astronomy?latitude=${latStr}&longitude=${lonStr}&daily=sunrise,sunset,moonrise,moonset&timezone=auto`)
        ]).catch(() => [null, null, null]);

        if (!weatherRes || !weatherRes.ok) {
            throw new Error('Weather data fetch failed');
        }

        const data = await weatherRes.json();

        if (aqRes && aqRes.ok) {
            const aqData = await aqRes.json();
            if (aqData && aqData.current) {
                data.current.pm2_5 = aqData.current.pm2_5;
                data.current.aqi = aqData.current.us_aqi;
                data.current.pm10 = aqData.current.pm10;
                data.current.no2 = aqData.current.nitrogen_dioxide;
                data.current.so2 = aqData.current.sulphur_dioxide;
            }
        }

        if (astroRes && astroRes.ok) {
            const astroData = await astroRes.json();
            if (astroData && astroData.daily) {
                // Merge accurate astronomy data
                data.daily.moonrise = astroData.daily.moonrise;
                data.daily.moonset = astroData.daily.moonset;
                // Prefer astronomy API for sunrise/sunset too as it's more specific
                data.daily.sunrise = astroData.daily.sunrise;
                data.daily.sunset = astroData.daily.sunset;
            }
        }

        return data;
    } catch (error) {
        console.error("Failed to fetch weather:", error);
        return null;
    }
};
