async function checkVariables() {
    const lat = 25.01;
    const lon = 121.46;
    // Try to guess common moon phase variable names
    const vars = ["moon_phase", "moon_illumination", "moonphase", "illumination"];
    for (const v of vars) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=${v}&timezone=auto`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (!data.error) {
                console.log(`Open-Meteo SUCCESS for variable: ${v}`);
                console.log(data.daily);
            } else {
                console.log(`Open-Meteo FAIL for variable: ${v} - ${data.reason}`);
            }
        } catch (e) {
            console.log(`Fetch error for ${v}`);
        }
    }
}
checkVariables();
