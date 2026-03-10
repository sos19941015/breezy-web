async function checkOpenMeteoAstronomy() {
    const url = "https://api.open-meteo.com/v1/astronomy?latitude=36.17&longitude=-115.14&daily=sunrise,sunset,moonrise,moonset&timezone=auto";
    const res = await fetch(url);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}
checkOpenMeteoAstronomy();
