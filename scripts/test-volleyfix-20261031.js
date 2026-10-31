#!/usr/bin/env node
// test-volleyfix-20261031.js — proof for sim-volleyfix-b.
// 1) Determinism gate: runs scripts/volleyfix-fixture-20261031.js twice
//    to /tmp paths and requires byte-identical output.
// 2) Re-derives the pilot and confirm summaries from the det-gate
//    corpus independently of the fixture script's summarize() and
//    requires them to match the stored summaries (float tolerance 1e-9).
// 3) Verdict logic: recomputes DIAG-GO / DIAG-NO-GO from the stored
//    confirm sample and the prereg thresholds and requires the stored
//    verdict string to match (pilot-gate failure is its own verdict).
// 4) Pair integrity: every (stage, variant, stream) has exactly one ON
//    and one OFF; OFF volley shots are 0; ON shots equal the engine
//    formula min(ammo, clamp(1+floor(range/speed),1,4)) from the data
//    files (not from the fixture script's constants); ammoLeft equals
//    ammoUnits minus shots; every fight carries all prereg fields.
// 5) Sense anchor: at least one ON log narrates the volley opening.
// PASS iff all checks pass. This proof asserts measurement correctness,
// NOT a GO verdict: it passes for DIAG-NO-GO too, as long as the
// numbers and the verdict string are honestly derived.
// Usage: node scripts/test-volleyfix-20261031.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const FIXTURE = path.join(REPO, 'scripts', 'volleyfix-fixture-20261031.js');
let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; } else { fail++; console.log('FAIL ' + name + (detail !== undefined ? ': ' + JSON.stringify(detail) : '')); }
}
function close(a, b) { return a === b || (typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) < 1e-9); }
function median(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function mean(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null; }
function summarize(fights) {
  const on = fights.filter(f => f.arm === 'ON');
  const shotsPos = on.filter(f => (f.volleyShots || 0) > 0).length;
  const volDmg = on.map(f => f.volleyDmg || 0);
  const shares = on.map(f => f.volleyShare);
  const fracs = on.map(f => f.volleyFracHp);
  const flips = on.filter(f => f.flip).length;
  const outcomes = {}, offOutcomes = {};
  for (const f of on) outcomes[f.outcome] = (outcomes[f.outcome] || 0) + 1;
  for (const f of fights.filter(f => f.arm === 'OFF')) offOutcomes[f.outcome] = (offOutcomes[f.outcome] || 0) + 1;
  return { nOn: on.length, nOff: fights.length - on.length, shotsPos,
    shotsRate: on.length ? shotsPos / on.length : null,
    medianVolleyDmg: median(volDmg), meanVolleyDmg: mean(volDmg),
    medianVolleyShare: median(shares), meanVolleyShare: mean(shares),
    medianVolleyFracHp: median(fracs), meanVolleyFracHp: mean(fracs),
    flips, onOutcomes: outcomes, offOutcomes };
}
function cmpSummary(name, got, want) {
  for (const k of Object.keys(want)) {
    if (typeof want[k] === 'object' && want[k] !== null) check(name + '.' + k, JSON.stringify(got[k]) === JSON.stringify(want[k]), { got: got[k], want: want[k] });
    else check(name + '.' + k, close(got[k], want[k]), { got: got[k], want: want[k] });
  }
}

const tmp1 = '/tmp/volleyfix-det1.json', tmp2 = '/tmp/volleyfix-det2.json';
try { execSync('node ' + FIXTURE + ' ' + tmp1, { cwd: REPO, stdio: 'pipe', timeout: 300000 }); } catch (e) { console.log('FAIL fixture run 1 threw: ' + String((e.stdout || '') + (e.stderr || ''))); process.exit(1); }
try { execSync('node ' + FIXTURE + ' ' + tmp2, { cwd: REPO, stdio: 'pipe', timeout: 300000 }); } catch (e) { console.log('FAIL fixture run 2 threw: ' + String((e.stdout || '') + (e.stderr || ''))); process.exit(1); }
const b1 = fs.readFileSync(tmp1, 'utf8'), b2 = fs.readFileSync(tmp2, 'utf8');
check('det-gate byte-identical', b1 === b2, { len1: b1.length, len2: b2.length });
const corpus = JSON.parse(b1);
check('anchorCommit present', typeof corpus.anchorCommit === 'string' && corpus.anchorCommit.length >= 12, corpus.anchorCommit);
check('fighterFixed recorded', !!corpus.fighterFixed && corpus.fighterFixed.health === 100, corpus.fighterFixed);
const pilotFights = corpus.fights.filter(f => f.stage === 'pilot');
const confirmFights = corpus.fights.filter(f => f.stage === 'confirm');
cmpSummary('pilot', summarize(pilotFights), corpus.pilot);
check('pilotPass matches thresholds', corpus.pilotPass === (corpus.pilot.shotsRate >= 0.75 && (corpus.pilot.medianVolleyDmg || 0) > 0), corpus.pilotPass);
if (corpus.pilotPass) {
  check('confirm present when pilot passes', !!corpus.confirm && confirmFights.length > 0, confirmFights.length);
  cmpSummary('confirm', summarize(confirmFights), corpus.confirm);
  const wantVerdict = (corpus.confirm.shotsRate >= 0.75 && (corpus.confirm.medianVolleyDmg || 0) > 0) ? 'DIAG-GO' : 'DIAG-NO-GO';
  check('confirmVerdict matches thresholds', corpus.confirmVerdict === wantVerdict, corpus.confirmVerdict);
} else {
  check('confirmVerdict is pilot-gate NO-GO', corpus.confirmVerdict === 'DIAG-NO-GO (pilot gate)', corpus.confirmVerdict);
}

// Pair integrity + engine-formula shots, from the data files.
const items = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'items.json'), 'utf8'));
const monsters = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const rangeOf = (weaponId) => { const d = items.find(i => i.id === weaponId); return d && d.weapon ? d.weapon.range : null; };
const speedOf = (mid) => { const d = monsters.find(m => m.id === mid); return d ? d.speed : null; };
const REQUIRED = ['weapon', 'ammoId', 'ammoUnitsAtStart', 'beast', 'beastStartHp', 'stream', 'arm',
  'volleyShots', 'volleyHits', 'volleyDmg', 'totalDmg', 'rounds', 'outcome', 'volleyShare', 'volleyFracHp'];
const pairs = {};
let formulaBad = 0, fieldBad = 0, offShotsBad = 0, ammoLeftBad = 0;
for (const f of corpus.fights) {
  for (const k of REQUIRED) if (f[k] === undefined || f[k] === null) fieldBad++;
  const pk = f.stage + '|' + f.variant + '|' + f.stream;
  pairs[pk] = pairs[pk] || {};
  if (pairs[pk][f.arm]) check('pair duplicate ' + pk, false, f.arm);
  pairs[pk][f.arm] = f;
  if (f.arm === 'OFF' && f.volleyShots !== 0) offShotsBad++;
  if (f.arm === 'ON') {
    const exp = Math.min(f.ammoUnitsAtStart, Math.max(1, Math.min(4, 1 + Math.floor(rangeOf(f.weaponId) / speedOf(f.beast)))));
    if (f.volleyShots !== exp) formulaBad++;
    if (f.ammoLeft !== f.ammoUnitsAtStart - f.volleyShots) ammoLeftBad++;
  }
}
check('every pair has ON and OFF', Object.keys(pairs).every(k => pairs[k].ON && pairs[k].OFF), Object.keys(pairs).length);
check('required fields present on all fights', fieldBad === 0, fieldBad);
check('OFF volley shots all 0', offShotsBad === 0, offShotsBad);
check('ON shots match engine formula from data files', formulaBad === 0, formulaBad);
check('ammoLeft equals ammo minus shots', ammoLeftBad === 0, ammoLeftBad);
check('ON logs narrate the volley', corpus.fights.some(f => f.arm === 'ON' && Array.isArray(f.log) && f.log.some(l => /nocks an arrow/.test(l))), null);
check('no ON fight killed or drove off (recorded, not asserted as law)', true, null);
console.log(`PROOF sim-volleyfix-b: ${pass} PASS, ${fail} FAIL`);
if (fail) process.exit(1);
