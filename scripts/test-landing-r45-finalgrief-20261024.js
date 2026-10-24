// Proof test for landing r45's two instrument fixes (no game change):
//  (1) Horizon-end grief rule: a villager death on the last series day with no
//      next snapshot is REGISTERED iff finalGrief > 0 (r45 pilot 609: Jae d14,
//      death + grief lines fired after the last snapshot, snapshot rule alone
//      scored a false MISS). With finalGrief 0 it must still score MISS.
//  (2) Inventory instrument: the r45 census records scholar inventory energy
//      (invKcal) per day — day 1 must show the starting inventory (1400 on
//      every r45 seed), proving the driver reads scholar.inventory, not the
//      always-empty scholar.pack the pilot first measured.
// Usage: node scripts/test-landing-r45-finalgrief-20261024.js [evidence-dir]
// Exit 0 iff all assertions pass.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const DIR = process.argv[2] || path.join(process.env.HOME || '/home/hatch',
  'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-24/landing-r45');
const ANALYZER = path.join(__dirname, 'analyze-landing-r45-20261024.js');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`PASS: ${name}`); }
  else { fail++; console.log(`FAIL: ${name}${extra ? ' — ' + extra : ''}`); }
}
function runAnalyzer(dir) {
  try { return execFileSync('node', [ANALYZER, dir], { encoding: 'utf8' }); }
  catch (e) { return (e.stdout || '') + (e.stderr || ''); }
}
function minimalCensus(seed, finalGrief) {
  // One villager death on the last (and only) series day, no next snapshot.
  return {
    seed, series: [{ day: 14, pop: 11, villageGrief: 0, loc: 'haven' }],
    deaths: [{ day: 14, who: 'gen_test', cause: "a wound that wouldn't close" }],
    census: [{ id: 'gen_test', name: 'Test' }],
    mantleLog: [], awayDayDigest: [],
    r41Summary: { griefBeats: 0, caughtRedHanded: 0, plentyVoiceLines: 0 },
    finalGrief,
  };
}
const tmp = fs.mkdtempSync(path.join('/tmp', 'r45proof-'));
try {
  // --- (1) synthetic horizon-end cases ---
  const dirA = path.join(tmp, 'a'); fs.mkdirSync(dirA);
  fs.writeFileSync(path.join(dirA, 'journey-landing-r45-census-1.json'),
    JSON.stringify(minimalCensus(1, 3)));
  const outA = runAnalyzer(dirA);
  check('horizon-end death + finalGrief 3 => REGISTERED',
    /REGISTERED/.test(outA) && !/MISS/.test(outA.split('DEATH')[1] || ''), outA);
  const dirB = path.join(tmp, 'b'); fs.mkdirSync(dirB);
  fs.writeFileSync(path.join(dirB, 'journey-landing-r45-census-1.json'),
    JSON.stringify(minimalCensus(1, 0)));
  const outB = runAnalyzer(dirB);
  check('horizon-end death + finalGrief 0 => MISS (no false pass)',
    /MISS/.test(outB), outB);
  // --- (2) real corpus inventory instrument ---
  for (const seed of [609, 610, 611, 612]) {
    const p = path.join(DIR, `journey-landing-r45-census-${seed}.json`);
    if (!fs.existsSync(p)) { check(`census ${seed} exists`, false, 'missing'); continue; }
    const d = JSON.parse(fs.readFileSync(p, 'utf8'));
    const d1 = (d.awayDayDigest || [])[0];
    check(`seed ${seed} day-1 invKcal is 1400 (starting inventory recorded)`,
      d1 && d1.invKcal === 1400, d1 ? `got ${d1.invKcal}` : 'no digest');
    check(`seed ${seed} day-1 packItems non-empty`,
      d1 && (d1.packItems || []).length > 0, d1 ? `got ${(d1.packItems || []).length}` : 'no digest');
  }
  // --- (3) real corpus analyzer verdicts ---
  const out = runAnalyzer(DIR);
  check('real corpus: griefMiss 0/2', /griefMiss=0\/2/.test(out), out);
  check('real corpus: starvationDeaths 0', /starvationDeaths=0/.test(out), out);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
