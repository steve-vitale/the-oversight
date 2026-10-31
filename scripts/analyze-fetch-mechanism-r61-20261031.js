// scripts/analyze-fetch-mechanism-r61-20261031.js — journey-scale r61 Q2.
// Deterministic re-read of r60 wide-band evidence ONLY (no engine load,
// no RNG, no new seeds): current vs nofetch arms, seeds 85101-85108.
// For each arm: end-state class (ALIVE / SCATTERED / DEAD, r61 prereg),
// death cluster in the final 20 days, pantry trajectory over the final
// 30 hungerwatch days. Usage: node scripts/analyze-fetch-mechanism-r61-20261031.js
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const ARMS = [
  ['current', path.join(ROOT, 'evidence', '2026-10-30', 'journey-scale-r60-wide')],
  ['nofetch', path.join(ROOT, 'evidence', '2026-10-30', 'journey-scale-r60-wide-nofetch')],
];
function armRow(arm, dir, seed) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, `journey-scale-r60-trust-${seed}.json`), 'utf8'));
  const c = j.census || {};
  const cls = !c.over ? 'ALIVE' : (c.popAlive > 0 ? 'SCATTERED' : 'DEAD');
  const deaths = c.deathLog || [];
  const endDay = c.day;
  const final = deaths.filter(d => d.day >= endDay - 20);
  const causes = {};
  for (const d of final) causes[d.cause || '?'] = (causes[d.cause || '?'] || 0) + 1;
  const hw = fs.readFileSync(path.join(dir, `journey-scale-r60-hungerwatch-${seed}.txt`), 'utf8')
    .trim().split('\n').map(l => {
      const m = /^d(\d+) pantry=(\d+) hungryDays=(\d+)/.exec(l);
      return m ? { day: +m[1], pantry: +m[2], hungry: +m[3] } : null;
    }).filter(Boolean);
  const last30 = hw.slice(-30);
  const minPantry = Math.min(...last30.map(r => r.pantry));
  const zeroDays = last30.filter(r => r.pantry === 0).length;
  const maxHungry = Math.max(...last30.map(r => r.hungry));
  const hungryDays = last30.filter(r => r.hungry > 0).length;
  const firstFetch = (() => {
    try {
      const cap = fs.readFileSync(path.join(dir, `journey-scale-r60-capture-${seed}.txt`), 'utf8').split('\n');
      return cap.find(l => /Equipped|fetches|stash/i.test(l)) || '(no fetch line found)';
    } catch (e) { return '(capture unreadable)'; }
  })();
  return { arm, seed, endDay, over: c.over, pop: `${c.popAlive}/${c.popTotal}`, cls,
    pantry: c.pantryKcal, seat: c.tableSeat, arc: c.arcNow, maxWave: c.maxWave,
    deathsTotal: deaths.length, finalDeaths: final.length,
    finalCauses: causes,
    finalDeathDays: final.map(d => `d${d.day}:${d.who || '?'}:${d.cause || '?'}`).join(' '),
    minPantry30: minPantry, zeroPantryDays30: zeroDays, maxHungry30: maxHungry,
    hungryDays30: hungryDays, lastPantry: last30.length ? last30[last30.length - 1].pantry : null };
}
for (const seed of [85101, 85102, 85103, 85104, 85105, 85106, 85107, 85108]) {
  console.log(`\n===== seed ${seed} =====`);
  for (const [arm, dir] of ARMS) {
    const r = armRow(arm, dir, seed);
    console.log(`${r.arm}: end d${r.endDay} over=${r.over} pop=${r.pop} class=${r.cls} pantry=${r.pantry} seat=${r.seat} arc=${r.arc} maxWave=${r.maxWave} deaths=${r.deathsTotal} final20=${r.finalDeaths} causes=${JSON.stringify(r.finalCauses)}`);
    console.log(`  final20 deaths: ${r.finalDeathDays || '(none)'}`);
    console.log(`  pantry last30: min=${r.minPantry30} zeroDays=${r.zeroPantryDays30} maxHungry=${r.maxHungry30} hungryDays=${r.hungryDays30} last=${r.lastPantry}`);
  }
}
