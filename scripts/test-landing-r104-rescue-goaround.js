// Proof test for the r104 landing finding / R104-GOAROUND driver fix
// (driver policy, zero src/js):
//   r104 seed 870: scholar Mateo (gen_ordyupl) sat 3 tiles from a full
//   pantry for 6 days (d12-d17) at 0 kcal / 0 hydration, because the
//   return path crossed a creek band the rescue ladder could not clear:
//   walkHome stopped on the creek, clearBlockage refuses creeks honestly
//   ("Bridge it (4 wood) or swim it"), and the ladder never tried the
//   third prescribed option — go around. Mateo never got home and died
//   of sickness d22 in the wild; the mantle passed d23.
//   The fixed ladder adds (a) a bridge rung (creek + >=4 wood ->
//   Game.buildBridge) and (b) a detour rung (BFS over orthogonal
//   enterable tiles, travelBlockage as oracle, home board only), walked
//   one tile at a time through travelTo.
// Usage: node scripts/test-landing-r104-rescue-goaround.js <census-870.json>
//   Exits 0 with PASS lines on the fixed-driver replay corpus; exits 1
//   (FAIL) on the r104 panel corpus, which is the before/after proof.
const fs = require('fs');
const path = process.argv[2];
if (!path) { console.error('usage: node test-landing-r104-rescue-goaround.js <census-870.json>'); process.exit(2); }
const d = JSON.parse(fs.readFileSync(path, 'utf8'));
let fail = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'ok' : 'FAIL'}: ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fail++; };
const arr = d.outingGuardArrivals || [];
const d12 = arr.find(a => a.day === 12);
check('day-12 kcal rescue arrival recorded', !!d12, d12 ? `atHavenFinal=${d12.atHavenFinal}` : 'none');
check('day-12 rescue ARRIVED at Haven', !!(d12 && d12.atHavenFinal),
  d12 ? `steps=${(d12.rescueSteps || []).join(' | ')}` : 'none');
const steps12 = (d12 && d12.rescueSteps) || [];
check('day-12 rescue used the detour rung (go around)', steps12.some(s => /^detour:walked:\d+$/.test(s)),
  `steps=${steps12.join(' | ')}`);
const nonArr = arr.filter(a => !a.atHavenFinal);
check('zero non-arrived kcal rescues on seed 870', nonArr.length === 0,
  `non-arrived days=${nonArr.map(a => a.day).join(',') || 'none'}`);
const mateoDied = (d.villagerDeaths || []).some(x => x.who === 'gen_ordyupl');
check('Mateo (gen_ordyupl) has no death record', !mateoDied);
const mantleFromMateo = (d.mantleLog || []).some(m => m.from === 'gen_ordyupl');
check('no mantle transition away from Mateo', !mantleFromMateo);
const s13 = (d.series || []).find(s => s.day === 13);
check('day-13 snapshot: scholar home and fed', !!(s13 && s13.loc === 'haven' && (s13.scholarKcal || 0) >= 1000),
  s13 ? `loc=${s13.loc} kcal=${s13.scholarKcal}` : 'no day-13 snap');
console.log(fail === 0 ? 'RESCUE-GOAROUND: PASS' : 'RESCUE-GOAROUND: FAIL');
process.exit(fail === 0 ? 0 : 1);
