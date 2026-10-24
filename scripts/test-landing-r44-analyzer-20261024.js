// Proof test for analyze-landing-r44-20261024.js kind-filter (landing r44).
// The analyzer must count ONLY roster (villager/person) deaths toward grief
// registration: monster kills never fire villageEvent('death') (registerDeath's
// GRIEF branch, corpses.js), so a corpus of pure monster kills is NOT a
// registration miss, and a villager death with grief 0 across two snapshots IS.
// Also proves the r44 driver field: real 605 census series entries carry numeric
// villageGrief (state.village.grief per day-snapshot).
// Run: node scripts/test-landing-r44-analyzer-20261024.js  (exit 0 = all green)
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const ANALYZER = path.join(__dirname, 'analyze-landing-r44-20261024.js');
const EVID = path.join(process.env.HOME || '/home/hatch',
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-24/landing-r44');
let failures = 0;
function check(name, cond, extra) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (cond ? '' : ' :: ' + (extra || '')));
  if (!cond) failures++;
}
function census(seed, series, deaths, censusIds, mantleLog, r41) {
  return {
    seed, series,
    deaths,
    census: censusIds.map(id => ({ id, name: id, alive: true })),
    mantleLog: mantleLog || [],
    r41Summary: r41 || { griefBeats: 0, caughtRedHanded: 0, plentyVoiceLines: 0 },
    systemDay: 8,
  };
}
function seriesWith(griefByDay, deaths, holder) {
  return Object.keys(griefByDay).map(d => ({
    day: +d, pop: 12, villageGrief: griefByDay[d], loc: 'haven',
    deaths: deaths.filter(x => x.day === +d), journalHolder: holder || 'v1',
  }));
}
function runAnalyzer(dir) {
  return execFileSync('node', [ANALYZER, dir], { encoding: 'utf8' });
}
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'r44proof-'));
try {
  // Fixture 1: villager death registers (0 at snap, 2 next) + monster kills + scholar death.
  const f1 = path.join(tmp, 'f1'); fs.mkdirSync(f1);
  const d1 = census(901,
    seriesWith({ 5: 0, 6: 2, 7: 1 }, [{ day: 5, who: 'v1', cause: 'ambush' }], 'v1'),
    [{ day: 5, who: 'v1', cause: 'ambush' }, { day: 6, who: 'mirrormoth', cause: 'villager combat' }],
    ['v1', 'v2'], [{ day: 6, from: 'v1', to: 'v2', fromName: 'A', toName: 'B' }]);
  // The scholar-death matcher needs the death in `deaths` and the mantle `from` to match;
  // series holder switch is informational only.
  fs.writeFileSync(path.join(f1, 'journey-landing-r44-census-901.json'), JSON.stringify(d1));
  const out1 = runAnalyzer(f1);
  check('F1 villager death registered -> A: GO', out1.includes('A: GO'), out1);
  check('F1 monster kill listed, not counted', out1.includes('MONSTER KILL d6 mirrormoth') && out1.includes('villagerDeaths=1'), out1);
  check('F1 scholar death detected', out1.includes('SCHOLAR DEATH'), out1);
  // Fixture 2: villager death with grief 0 at snap AND next -> NO-GO.
  const f2 = path.join(tmp, 'f2'); fs.mkdirSync(f2);
  const d2 = census(902,
    seriesWith({ 5: 0, 6: 0 }, [{ day: 5, who: 'v1', cause: 'ambush' }], 'v1'),
    [{ day: 5, who: 'v1', cause: 'ambush' }], ['v1', 'v2'], []);
  fs.writeFileSync(path.join(f2, 'journey-landing-r44-census-902.json'), JSON.stringify(d2));
  const out2 = runAnalyzer(f2);
  check('F2 unregistered villager death -> A: NO-GO', out2.includes('A: NO-GO'), out2);
  // Fixture 3: monster kills ONLY -> no villager deaths, A: GO (vacuous, not a miss).
  const f3 = path.join(tmp, 'f3'); fs.mkdirSync(f3);
  const d3 = census(903,
    seriesWith({ 5: 0, 6: 0 }, [], 'v1'),
    [{ day: 5, who: 'hummice', cause: 'villager combat' }], ['v1', 'v2'], []);
  fs.writeFileSync(path.join(f3, 'journey-landing-r44-census-903.json'), JSON.stringify(d3));
  const out3 = runAnalyzer(f3);
  check('F3 monster-only corpus -> A: GO, 0 villager deaths', out3.includes('A: GO') && out3.includes('villagerDeaths=0'), out3);
  // Real corpus: r44 driver wrote numeric villageGrief on every series entry.
  const real = JSON.parse(fs.readFileSync(path.join(EVID, 'journey-landing-r44-census-605.json'), 'utf8'));
  check('real 605 series carries numeric villageGrief',
    real.series.length > 0 && real.series.every(s => typeof s.villageGrief === 'number'), JSON.stringify(real.series.map(s => s.villageGrief)));
  check('real 605 villageGrief shows the d11 set (2 on d12 snap)',
    real.series.find(s => s.day === 12).villageGrief === 2, JSON.stringify(real.series.map(s => [s.day, s.villageGrief])));
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(failures === 0 ? 'ALL GREEN' : failures + ' FAILURES');
process.exit(failures === 0 ? 0 : 1);
