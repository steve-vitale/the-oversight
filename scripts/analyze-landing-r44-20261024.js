// Analyzer for landing r44: grief-registration + scholar-mortality watch.
// Reads landing-r44 census JSONs and judges Q-A (registration) and Q-B (scholar
// mortality) plus stay-green fields. See journey-landing-r44-prereg.md.
// Usage: node scripts/analyze-landing-r44-20261024.js [evidence-dir]
const fs = require('fs');
const path = require('path');
const DIR = process.argv[2] || path.join(process.env.HOME || '/home/hatch',
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-24/landing-r44');
const files = fs.readdirSync(DIR).filter(f => /census-\d+\.json$/.test(f)).sort();
if (!files.length) { console.log('NO CENSUS FILES in ' + DIR); process.exit(2); }
let scholarDeaths = 0, scholarDeathSeeds = 0, regMiss = 0, regTotal = 0;
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const series = d.series || [];
  const deaths = d.deaths || [];
  const mantle = d.mantleLog || [];
  const nameOf = (id) => {
    const c = (d.census || []).find(p => p.id === id);
    return c ? c.name : (id || '?');
  };
  console.log(`\n=== seed ${d.seed} (${f}) ===`);
  console.log(`systemDay=${d.systemDay} popEnd=${series.length ? series[series.length - 1].pop : '?'} ` +
    `griefBeats=${(d.r41Summary || {}).griefBeats} theft=${(d.r41Summary || {}).caughtRedHanded} ` +
    `plentyVoice=${(d.r41Summary || {}).plentyVoiceLines}`);
  // --- A: grief registration per VILLAGER death only. Monster kills (hummice,
  // mirrormoth, hushwolf, ...) never fire villageEvent('death') — registerDeath's
  // GRIEF branch (corpses.js) fires exactly once per villager death, so only
  // deaths whose `who` is on the village roster count toward registration.
  // Monster rows are listed separately, informational only.
  const roster = new Set((d.census || []).map(x => x.id));
  const villagerDeaths = deaths.filter(x => roster.has(x.who));
  const monsterDeaths = deaths.filter(x => !roster.has(x.who));
  for (const m of monsterDeaths)
    console.log(`  MONSTER KILL d${m.day} ${m.who} cause=${m.cause || '?'} (no grief event by design)`);
  for (const death of villagerDeaths) {
    const day = death.day;
    const snap = series.find(s => s.day >= day) || series[series.length - 1];
    const next = series.find(s => s.day > day);
    const g = snap ? snap.villageGrief : undefined;
    const g2 = next ? next.villageGrief : undefined;
    const ok = (g !== undefined && g > 0) || (g2 !== undefined && g2 > 0);
    regTotal++;
    if (!ok) regMiss++;
    console.log(`  DEATH d${day} ${nameOf(death.who)} cause=${death.cause || '?'} ` +
      `grief@snap(d${snap ? snap.day : '?'})=${g} grief@next=${g2} loc=${snap ? snap.loc : '?'} -> ${ok ? 'REGISTERED' : 'MISS'}`);
  }
  // --- B: scholar mortality via mantle transitions ---
  const deathDays = new Map();
  for (const death of deaths) deathDays.set(death.who, death.day);
  let seedScholarDeaths = 0;
  for (const m of mantle) {
    const dd = deathDays.get(m.from);
    if (dd !== undefined && Math.abs(dd - m.day) <= 1) {
      seedScholarDeaths++;
      const cause = (deaths.find(x => x.who === m.from) || {}).cause || '?';
      console.log(`  SCHOLAR DEATH: ${nameOf(m.from)} d${dd} cause=${cause} -> mantle ${nameOf(m.to)} d${m.day}`);
    }
  }
  scholarDeaths += seedScholarDeaths;
  if (seedScholarDeaths) scholarDeathSeeds++;
  console.log(`  scholarDeaths(seed)=${seedScholarDeaths} mantleTransitions=${mantle.length} ` +
    `popSeries=${series.map(s => s.pop).join(',')}`);
}
console.log(`SUMMARY: villagerDeaths=${regTotal} (monster kills excluded, see above) griefRegistrationMiss=${regMiss} ` +
  `scholarDeaths=${scholarDeaths} on ${scholarDeathSeeds}/${files.length} seeds`);
console.log(regMiss === 0 ? 'A: GO (all deaths registered grief)' : 'A: NO-GO (registration miss)');
