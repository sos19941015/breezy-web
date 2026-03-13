async function testApi() {
    const lat = 25.033;
    const lon = 121.565;
    const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,dew_point_2m,precipitation,uv_index,visibility,surface_pressure',
        timezone: 'auto'
    });

    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
        const data = await response.json();
        console.log('Current Data:', JSON.stringify(data.current, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testApi();
