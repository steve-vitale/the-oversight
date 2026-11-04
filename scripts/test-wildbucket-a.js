'use strict';
// test-wildbucket-a.js — proof for sim-wildbucket-a.
// 1. Analyzer classification rules on fixtures (one per branch).
// 2. Sweep seed-list refusal via VALIDATE_ONLY subprocess runs
//    (accepts exactly the pilot band in pilot mode and exactly the
//    confirm band in confirm mode; refuses any other list, wrong
//    STAGE, wrong DAYS, or missing env gates).
// Plain node asserts; run: node scripts/test-wildbucket-a.js
const assert = require('assert');
const { execFileSync } = require('child_process');
const path = require('path');
const { classify } = require('./analyze-wildbucket-a');
const { BANDS } = require('./sweep-wildbucket-a');

let n = 0;
const ok = (cond, msg) => { n += 1; assert(cond, msg); };

// --- classification fixtures ---
const base = { cause: 'the wild', day: 40, tbfight: null, monsterId: null, monsterName: null, lastHurt: null };
ok(classify({ ...base, cause: 'monster' }) === null, 'non-wild death is not in the denominator');
let c = classify({ ...base, tbfight: { fighters: [
  { kind: 'villager', villagerId: 'v1', name: 'Ana' },
  { kind: 'monster', monsterId: 'highbeam_deer', name: 'Highbeam Deer' } ] } });
ok(c.rule === 'TB-MONSTER' && c.certain && c.monster === 'Highbeam Deer', 'TB-MONSTER with named monster');
c = classify({ ...base, tbfight: { fighters: [
  { kind: 'monster', monsterId: 'choir_toad', name: 'Choir Toad' },
  { kind: 'hostile', villagerId: 'h1', name: 'Stranger' } ] } });
ok(c.rule === 'RESIDUAL' && c.reason === 'tbfight has monster + hostile fighters',
  'hostile present defeats TB-MONSTER (tbFightDeathCause would read stranger, not wild)');
c = classify({ ...base, monsterId: 'grief_counselor', monsterName: 'Grief Counselor' });
ok(c.rule === 'CORPSE-MONSTER' && c.certain && c.monster === 'Grief Counselor', 'CORPSE-MONSTER');
c = classify({ ...base, lastHurt: { cause: 'monster', dmg: 40, day: 40, part: 2 } });
ok(c.rule === 'LAST-HURT-MONSTER' && !c.certain, 'LAST-HURT-MONSTER same day is probable, not certain');
c = classify({ ...base, lastHurt: { cause: 'monster', dmg: 40, day: 39, part: 2 } });
ok(c.rule === 'RESIDUAL' && c.reason === 'last hurt older than same day', 'yesterday monster hurt is residual');
c = classify({ ...base, lastHurt: { cause: 'starvation', dmg: 10, day: 40, part: 1 } });
ok(c.rule === 'RESIDUAL' && c.reason === 'last hurt non-monster', 'same-day non-monster hurt is residual');
c = classify({ ...base });
ok(c.rule === 'RESIDUAL' && c.reason === 'no tbfight, no monsterId, no same-day monster hurt', 'bare record is residual');
// Priority: tbfight beats monsterId beats last-hurt.
c = classify({ ...base, tbfight: { fighters: [{ kind: 'monster', monsterId: 'm1', name: 'M1' }] },
  monsterId: 'm2', monsterName: 'M2', lastHurt: { cause: 'monster', day: 40, part: 0 } });
ok(c.rule === 'TB-MONSTER', 'rule 1 wins over rules 2 and 3');
c = classify({ ...base, monsterId: 'm2', monsterName: 'M2', lastHurt: { cause: 'monster', day: 40, part: 0 } });
ok(c.rule === 'CORPSE-MONSTER', 'rule 2 wins over rule 3');
// GO-threshold arithmetic (prereg): >=0.80 assigned, no residual reason >0.10.
const goCheck = (assigned, wild, maxReason) => assigned / wild >= 0.80 && maxReason / wild <= 0.10;
ok(goCheck(80, 100, 10) && !goCheck(79, 100, 10) && !goCheck(85, 100, 11), 'GO threshold arithmetic');

// --- sweep refusal via VALIDATE_ONLY ---
const sweep = path.join(__dirname, 'sweep-wildbucket-a.js');
function runValidate(env) {
  try {
    const out = execFileSync(process.execPath, [sweep], { env: { ...process.env, ...env }, encoding: 'utf8', timeout: 60000 });
    return { code: 0, out };
  } catch (e) { return { code: e.status, out: (e.stdout || '') + (e.stderr || '') }; }
}
const baseEnv = { PLENTYDEPRI: '1', DEPOSITGATE: '1', DAYS: '100', VALIDATE_ONLY: '1' };
let r = runValidate({ ...baseEnv, STAGE: 'pilot', SEEDS: BANDS.pilot.join(',') });
ok(r.code === 0 && /VALIDATE OK/.test(r.out), 'pilot band accepted in pilot mode');
r = runValidate({ ...baseEnv, STAGE: 'confirm', SEEDS: BANDS.confirm.join(',') });
ok(r.code === 0 && /VALIDATE OK/.test(r.out), 'confirm band accepted in confirm mode');
r = runValidate({ ...baseEnv, STAGE: 'pilot', SEEDS: BANDS.confirm.join(',') });
ok(r.code !== 0 && /FATAL/.test(r.out), 'confirm band refused in pilot mode');
r = runValidate({ ...baseEnv, STAGE: 'pilot', SEEDS: '99957,99958' });
ok(r.code !== 0, 'short list refused');
r = runValidate({ ...baseEnv, STAGE: 'pilot', SEEDS: '99933,99934,99935,99936,99937,99938,99939,99940' });
ok(r.code !== 0, 'prior exphurt band refused');
r = runValidate({ ...baseEnv, STAGE: 'bogus', SEEDS: BANDS.pilot.join(',') });
ok(r.code !== 0, 'bad STAGE refused');
r = runValidate({ ...baseEnv, STAGE: 'pilot', SEEDS: BANDS.pilot.join(','), DAYS: '200' });
ok(r.code !== 0, 'wrong DAYS refused');
r = runValidate({ ...baseEnv, STAGE: 'pilot', SEEDS: BANDS.pilot.join(','), PLENTYDEPRI: '0' });
ok(r.code !== 0, 'missing env gate refused');

console.log('test-wildbucket-a: ' + n + '/' + n + ' green');
