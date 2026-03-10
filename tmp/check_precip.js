async function testPrecipValue() {
    const lat = 25.0118; // Banqiao
    const lon = 121.4646;
    const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current: 'precipitation',
        daily: 'precipitation_sum',
        timezone: 'auto'
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    console.log("Fetching URL:", url);

    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log("Current Precip:", data.current.precipitation);
        console.log("Daily Precip Sum (Today):", data.daily.precipitation_sum[0]);
    } catch (e) {
        console.error(e);
    }
}

testPrecipValue();
