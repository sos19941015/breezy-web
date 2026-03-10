import SunCalc from 'suncalc';
const lat = 36.17;
const lon = -115.14;
const date = new Date("2026-03-10T03:46:54Z");
const moonIllum = SunCalc.getMoonIllumination(date);
console.log(`Phase: ${moonIllum.phase}`);
console.log(`Fraction: ${moonIllum.fraction}`);
