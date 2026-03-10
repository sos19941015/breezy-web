import SunCalc from 'suncalc';

const lat = 25.033;
const lon = 121.565;
const date = new Date('2026-03-10T11:17:02+08:00');

console.log("Current Date:", date.toISOString());

const moonIllum = SunCalc.getMoonIllumination(date);
console.log("Moon Illumination Phase:", moonIllum.phase);
console.log("Moon Illumination Fraction:", moonIllum.fraction);

const searchDates = [-1, 0, 1].map(offset => {
    const d = new Date(date);
    d.setDate(d.getDate() + offset);
    return d;
});

const allEvents = searchDates.flatMap(d => {
    const t = SunCalc.getMoonTimes(d, lat, lon);
    const events = [];
    if (t.rise) events.push({ type: 'rise', time: t.rise });
    if (t.set) events.push({ type: 'set', time: t.set });
    return events;
}).sort((a, b) => a.time - b.time);

console.log("Events found:");
allEvents.forEach(e => {
    console.log(`- ${e.type}: ${e.time.toISOString()}`);
});
