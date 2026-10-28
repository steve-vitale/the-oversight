// Proof test for analyze-landing-r66-20261028.js R66 SLIDE block (landing r66).
// The r61 revised food gate's slide clause ("scholar-kcal slide below the
// ~1000-1500 floor band") was called unadjudicable in r64/r65 for want of a
// scholar-kcal series. The series exists (series[].scholarKcal in every snap);
// this test proves the analyzer adjudicates it: last3 = mean of the final 3
// snaps, SLIDE <1000, BAND [1000,1500), NO-SLIDE >=1500, and the revised gate
// is HUNGRY iff a starvation death occurred OR any seed is SLIDE.
// Fixtures are the real r65 seed-683 census with only the scholarKcal series
// (or one appended death) mutated, so the analyzer runs its full path.
// Retrospective: the real r65 corpus must come out 0 SLIDE / NOT-HUNGRY,
// agreeing with r65's verdict (consistency check, not a re-score).
// Run: node scripts/test-landing-r66-slide-20261028.js  (exit 0 = all green)
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const ANALYZER = path.join(__dirname, 'analyze-landing-r66-20261028.js');
const EVID = path.join(process.env.HOME || '/home/hatch',
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-28');
let failures = 0;
function check(name, cond, extra) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (cond ? '' : ' :: ' + (extra || '')));
  if (!cond) failures++;
}
function runAnalyzer(dir) {
  return execFileSync('node', [ANALYZER, dir], { encoding: 'utf8' });
}
const base = JSON.parse(fs.readFileSync(
  path.join(EVID, 'landing-r65', 'journey-landing-r62-census-683.json'), 'utf8'));
function cloneWith(seed, kcalFn, extraDeath) {
  const d = JSON.parse(JSON.stringify(base));
  d.seed = seed;
  for (const s of d.series) if (typeof s.scholarKcal === 'number') s.scholarKcal = kcalFn(s.scholarKcal);
  if (extraDeath) d.deaths = [...(d.deaths || []), extraDeath];
  return d;
}
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'r66slide-'));
function fixtureDir(name, census, seed) {
  const dir = path.join(tmp, name);
  fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, `journey-landing-r66-census-${seed}.json`), JSON.stringify(census));
  return dir;
}
// F1: SLIDE — every snap 800, so last3 = 800 < 1000.
const out1 = runAnalyzer(fixtureDir('f1', cloneWith(901, () => 800), 901));
check('SLIDE seed prints -> SLIDE', /R66 SLIDE:.*-> SLIDE/.test(out1));
check('SLIDE seed revised gate HUNGRY', /R66 REVISED GATE.*-> HUNGRY/.test(out1));
// F2: BAND — every snap 1200, so last3 = 1200 in [1000,1500).
const out2 = runAnalyzer(fixtureDir('f2', cloneWith(902, () => 1200), 902));
check('BAND seed prints -> BAND', /R66 SLIDE:.*-> BAND/.test(out2));
check('BAND seed revised gate NOT-HUNGRY', /R66 REVISED GATE.*-> NOT-HUNGRY/.test(out2));
// F3: NO-SLIDE — real 683 series, last3 = 1622 >= 1500.
const out3 = runAnalyzer(fixtureDir('f3', cloneWith(903, (v) => v), 903));
check('NO-SLIDE seed prints last3mean=1622 -> NO-SLIDE',
  /R66 SLIDE: last3mean=1622 .*-> NO-SLIDE/.test(out3));
check('NO-SLIDE seed revised gate NOT-HUNGRY', /R66 REVISED GATE.*-> NOT-HUNGRY/.test(out3));
// F4: starvation death with a NO-SLIDE series — HUNGRY via the death clause.
const out4 = runAnalyzer(fixtureDir('f4',
  cloneWith(904, (v) => v, { day: 20, who: 'v1', cause: 'starvation' }), 904));
check('death-clause seed prints -> NO-SLIDE', /R66 SLIDE:.*-> NO-SLIDE/.test(out4));
check('death-clause seed revised gate HUNGRY', /R66 REVISED GATE.*starvationDeaths=1.*-> HUNGRY/.test(out4));
// Retrospective: real r65 corpus — 0 SLIDE, gate NOT-HUNGRY, expected last3s.
const outR = runAnalyzer(path.join(EVID, 'landing-r65'));
const slideHits = (outR.match(/-> SLIDE/g) || []).length;
check('r65 retrospective: 0 SLIDE seeds', slideHits === 0, `found ${slideHits}`);
check('r65 retrospective: gate NOT-HUNGRY', /R66 REVISED GATE.*-> NOT-HUNGRY/.test(outR));
for (const [seed, last3] of [[683, 1622], [684, 2042], [685, 1542], [686, 2177]]) {
  check(`r65 retrospective: seed ${seed} last3mean=${last3}`,
    new RegExp(`=== seed ${seed} `).test(outR) &&
    new RegExp(`R66 SLIDE: last3mean=${last3} `).test(outR));
}
console.log(failures === 0 ? 'ALL GREEN' : `${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
