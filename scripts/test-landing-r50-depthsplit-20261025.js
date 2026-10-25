// Proof test for landing r50 instrument changes (scripts/journey-landing-r50-20261025.js
// + scripts/analyze-landing-r50-20261025.js). Structural cases only — the driver is not
// requireable (it runs sims on load), so these cases prove the code shape; the LIVE proof is
// the r50 run itself (census depthHonestExhaustions/depthFizzle samples + villagerDeaths
// counts, sense-read in the run note). No game code, no repo writes.
// Cases:
//   A: driver defines per-thread known-max + content-seen maps.
//   B: dry-admission branch classifies honest exhaustion when content was seen
//      AND preDepth >= known max (depthHonestExhaustions increment, gated).
//   C: fizzle path retained for the other dry cases (depth < known max, or
//      thread never delivered content) — depthFizzles increment in the dry branch.
//   D: content beats update the maps (content-seen flag + known-max update).
//   E: per-seed reset clears the maps and the new counters.
//   F: census carries villagerDeaths (kind-filtered: villager/person, NOT roster —
//      the pilot proved roster-at-census holds only the living) + depthHonestExhaustions.
//   G: transcript THEM-loop carried from r48 (sayThem loop; only fallback is r0.line).
//   H: analyzer prints the per-seed DEATHS SPLIT + the split summary line.
//   I: analyzer matches contest participants on the autopsy resolved name too,
//      not census name alone (628 Zoey: census name stayed the raw id).
//   J (functional): the analyzer run on a synthetic Zoey corpus (unrevealed
//      census name, autopsy name matching the participant) reports the death
//      CONTEXT OK with zero disagreements.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const DRIVER = path.join(__dirname, 'journey-landing-r50-20261025.js');
const ANALYZER = path.join(__dirname, 'analyze-landing-r50-20261025.js');
const driver = fs.readFileSync(DRIVER, 'utf8');
const analyzer = fs.readFileSync(ANALYZER, 'utf8');

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// A: maps defined
check('A maps-defined',
  /let threadKnownMax = \{\};/.test(driver) && /let threadContentSeen = \{\};/.test(driver));
// B: honest-exhaustion gate + increment
check('B honest-exhaustion-gate',
  /if \(seen && preDepth >= known\)/.test(driver) &&
  /MET\.depthHonestExhaustions = \(MET\.depthHonestExhaustions \|\| 0\) \+ 1;/.test(driver) &&
  /depthHonestExhaustionSamples/.test(driver));
// C: fizzle path retained in the dry branch (else arm of the same gate)
check('C fizzle-path-retained',
  /else \{\s*MET\.depthFizzles = \(MET\.depthFizzles \|\| 0\) \+ 1;/s.test(driver) &&
  /depthFizzleSamples/.test(driver));
// D: content beats update maps
check('D content-beats-update-maps',
  /threadContentSeen\[preThread\] = true;/.test(driver) &&
  /threadKnownMax\[preThread\] = postDepth;/.test(driver));
// E: per-seed reset
check('E per-seed-reset',
  /MET\.depthHonestExhaustionSamples = \[\];\s*threadKnownMax = \{\};\s*threadContentSeen = \{\};/.test(driver));
// F: census fields
check('F census-split-fields',
  /villagerDeaths: \(\(\) =>/.test(driver) &&
  /d\.kind === 'villager' \|\| d\.kind === 'person'/.test(driver) &&
  /depthHonestExhaustions: MET\.depthHonestExhaustions/.test(driver));
// G: transcript THEM-loop carried (loop over transcript THEM lines via sayThem;
// the only sayThem(r0.line) in CODE is the fallback — comment mentions excluded)
const driverCode = driver.split('\n').filter(l => !/^\s*\/\//.test(l)).join('\n');
check('G transcript-loop-carried',
  /for \(const _tl of _startThem\) sayThem\(_tl\);/.test(driverCode) &&
  (driverCode.match(/sayThem\(r0\.line\)/g) || []).length === 1);
// H: analyzer split prints
check('H analyzer-split-prints',
  /DEATHS SPLIT: villagerDeaths=/.test(analyzer) &&
  /DEATHS SPLIT SUMMARY: villagerDeaths=/.test(analyzer));

// I: dual-name participant match in the analyzer
check('I analyzer-dual-name-match',
  /\(span\.participants \|\| \[\]\)\.includes\(a\.name\)/.test(analyzer));

// J: functional — synthetic Zoey corpus through the real analyzer
(function () {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'landing-r50-zoey-'));
  try {
    const series = [];
    for (let d = 1; d <= 24; d++) series.push({ day: d, pop: 12, villageGrief: d >= 17 ? 3 : 0, scholarKcal: 1000, loc: 'haven' });
    const census = {
      seed: 999, systemDay: 8, series,
      deaths: [{ day: 17, who: 'gen_x', cause: 'the arena', kind: 'villager' }],
      mantleLog: [], awayDayDigest: [], starvAutopsies: [], r41Summary: {},
      census: [{ id: 'gen_x', name: 'gen_x' }],
      contestsHeld: 1,
      contestLedger: [{ contestId: 'guest', name: 'The Guest', kind: 'contest', firedDay: 15, endDay: 17, outcome: 'won', participants: ['Zoey'], firedFromTele: true, endedFromTele: true, tvExcerpts: [], tvLineCount: 0 }],
      contestDeathAutopsies: [{ day: 17, who: 'gen_x', name: 'Zoey', cause: 'the arena', kind: 'villager', arenaish: true, contestId: 'guest', contestOutcome: 'won', contestParticipants: ['Zoey'], deathLines: [], context: 'LEDGER' }],
    };
    fs.writeFileSync(path.join(dir, 'journey-landing-r50-census-999.json'), JSON.stringify(census));
    const out = execFileSync(process.execPath, [ANALYZER, dir], { encoding: 'utf8' });
    check('J analyzer-zoey-corpus',
      /CONTEXT OK/.test(out) && /deathsWithContext=1/.test(out) && !/DISAGREE/.test(out) && !/coincidentWildDeaths=1/.test(out),
      out.split('\n').filter(l => /CONTEST|DISAGREE/.test(l)).join(' | ').slice(0, 300));
  } catch (e) {
    check('J analyzer-zoey-corpus', false, 'analyzer run threw: ' + (e && e.message));
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) { console.log('temp cleanup NOTE: ' + (e && e.message)); }
  }
})();

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
