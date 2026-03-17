async function test() {
    const lat = 40.7127;
    const lon = -74.0059;
    const lang = 'zh';
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=${lang}`;
    console.log("URL:", url);
    const res = await fetch(url, { headers: { 'User-Agent': 'Test/1.0' } });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}
test();
