// steeple-after-compare-20261113.js — compares the check-leg corpus
// (perseed-steeple-a-check) against the after-leg corpus
// (perseed-steeple-a-after) on identical seeds. Prints per-seed
// before -> after for the two fixed lines, the ignition beats, the
// invite line, the rage press counts, the controls, and the survival
// fields; exits non-zero unless survival is byte-identical on every
// seed and every fixed line is <= 1 per (fight, monster).
// Usage: node scripts/steeple-after-compare-20261113.js [checkDir] [afterDir]
'use strict';
const fs = require('fs');
const path = require('path');
const CHECK = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-11-13', 'perseed-steeple-a-check');
const AFTER = process.argv[3] || path.join(__dirname, '..', 'evidence', '2026-11-13', 'perseed-steeple-a-after');

const SURVIVAL_FIELDS = ['days', 'gameDays', 'endReason', 'won', 'over', 'villageLost',
  'scaleRank', 'maxWave', 'unlockedWave', 'standing', 'endPantryKcal'];
function survivalOf(d) {
  const o = {};
  for (const k of SURVIVAL_FIELDS) o[k] = d[k];
  o.deaths = d.deaths;
  return o;
}
function maxPerFightMonster(d, linesKey, keyFn) {
  const groups = {};
  const lines = d[linesKey] || [];
  for (const e of lines) groups[keyFn(e)] = (groups[keyFn(e)] || 0) + 1;
  let best = 0;
  for (const k of Object.keys(groups)) if (groups[k] > best) best = groups[k];
  return best;
}
// Rage lines carry fight id only (scholar-side) — group by fight.
function rageMaxPerFight(d) {
  return maxPerFightMonster(d, 'rageLines', function (e) { return e.fight || '?'; });
}
// Steeple lines carry fight id; the monster key comes from the hook-call
// records (exact per-(fight, monster) attribution).
function steepleMaxPerFightMonster(d) {
  const groups = {};
  for (const c of (d.congHookCalls || [])) {
    if (!c.steepleFired) continue;
    const k = (c.fight || '?') + '|' + (c.mkey || '?');
    groups[k] = (groups[k] || 0) + 1;
  }
  let best = 0;
  for (const k of Object.keys(groups)) if (groups[k] > best) best = groups[k];
  return best;
}

const checkFiles = fs.readdirSync(CHECK).filter(function (f) { return f.endsWith('.json'); }).sort();
let fail = 0;
let totRageB = 0, totRageA = 0, totSteepleB = 0, totSteepleA = 0;
let totIgnB = 0, totIgnA = 0, totInviteB = 0, totInviteA = 0;
let totPressB = 0, totPressA = 0, totFreezeB = 0, totFreezeA = 0, totApplyB = 0, totApplyA = 0;
console.log('seed rageB->A (max/fight) steepleB->A (max/f,m) ignB->A inviteB->A pressB->A freezeB->A applyB->A survival');
for (const f of checkFiles) {
  const m = f.match(/s(\d+)-/);
  if (!m) continue;
  const seed = m[1];
  const afterFile = fs.readdirSync(AFTER).filter(function (g) { return g.indexOf('-s' + seed + '-') !== -1; })[0];
  if (!afterFile) { console.log('seed ' + seed + ' MISSING after-leg JSON'); fail++; continue; }
  const b = JSON.parse(fs.readFileSync(path.join(CHECK, f), 'utf8'));
  const a = JSON.parse(fs.readFileSync(path.join(AFTER, afterFile), 'utf8'));
  const survSame = JSON.stringify(survivalOf(b)) === JSON.stringify(survivalOf(a));
  if (!survSame) fail++;
  const rB = rageMaxPerFight(b), rA = rageMaxPerFight(a);
  const sB = steepleMaxPerFightMonster(b), sA = steepleMaxPerFightMonster(a);
  if (rA > 1 || sA > 1) fail++;
  const ignB = b.igniteAbsolutionCount + b.igniteExcommCount;
  const ignA = a.igniteAbsolutionCount + a.igniteExcommCount;
  if (ignA !== ignB) fail++;
  // Invite control: the check-leg JSONs predate the invite capture, so
  // only seed 190396 has a before-count (from the invite probe run).
  // Other seeds print n/a and are not gated on invites.
  let invB = null, invA = null, invCell = 'n/a';
  if (typeof b.inviteCount === 'number') {
    invB = b.inviteCount; invA = a.inviteCount || 0;
    if (invA !== invB) fail++;
    invCell = invB + '->' + invA;
  } else if (seed === '190396') {
    try {
      const probe = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'evidence', '2026-11-13', 'perseed-steeple-a-invite', 'steeple-check-s190396-steeple-invite.json'), 'utf8'));
      invB = probe.inviteCount; invA = a.inviteCount || 0;
      if (invA !== invB) fail++;
      invCell = invB + '->' + invA + ' (probe)';
    } catch (e) { invCell = 'n/a (probe missing)'; }
  }
  if (a.ragePressCount !== b.ragePressCount) fail++;
  if (a.freezelineCount !== b.freezelineCount || a.applyCount !== b.applyCount) fail++;
  totRageB += b.rageCount; totRageA += a.rageCount;
  totSteepleB += b.steepleCount; totSteepleA += a.steepleCount;
  totIgnB += ignB; totIgnA += ignA;
  if (invB !== null) { totInviteB += invB; totInviteA += invA; }
  totPressB += b.ragePressCount; totPressA += a.ragePressCount;
  totFreezeB += b.freezelineCount; totFreezeA += a.freezelineCount;
  totApplyB += b.applyCount; totApplyA += a.applyCount;
  console.log([
    seed,
    b.rageCount + '->' + a.rageCount + ' (' + rB + '->' + rA + ')',
    b.steepleCount + '->' + a.steepleCount + ' (' + sB + '->' + sA + ')',
    ignB + '->' + ignA, invCell,
    b.ragePressCount + '->' + a.ragePressCount,
    b.freezelineCount + '->' + a.freezelineCount,
    b.applyCount + '->' + a.applyCount,
    survSame ? 'IDENTICAL' : 'DIFFERS',
  ].join(' '));
}
console.log('TOTAL rage ' + totRageB + ' -> ' + totRageA +
  ' | steeple ' + totSteepleB + ' -> ' + totSteepleA +
  ' | ignitions ' + totIgnB + ' -> ' + totIgnA +
  ' | invites ' + totInviteB + ' -> ' + totInviteA +
  ' | rage presses ' + totPressB + ' -> ' + totPressA +
  ' | freezeline ' + totFreezeB + ' -> ' + totFreezeA +
  ' | apply ' + totApplyB + ' -> ' + totApplyA);
console.log(fail === 0 ? 'COMPARE: GO (all bars hold)' : 'COMPARE: FAIL (' + fail + ' violations)');
if (fail) process.exit(1);
