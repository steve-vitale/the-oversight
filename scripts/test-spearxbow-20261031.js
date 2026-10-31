#!/usr/bin/env node
// test-spearxbow-20261031.js — proof for sim-spearxbow-a.
// Checks, independently re-derived from the committed corpus (not from
// the fixture script's summary fields):
//  1. determinism gate: two fresh fixture runs byte-identical to each
//     other AND to the committed corpus (reruns go to /tmp, never the repo).
//  2. pilot gate M1/M2/M3 recomputed from pilot fights.
//  3. SPEAR S1/S2 recomputed from confirm fights (slot + volley-null).
//  4. XBOW X1/X2 recomputed from confirm fights (volley rank #1 pooled
//     AND per beast; total >= bow pooled AND per beast).
//  5. ally-spear null: all 12 confirm ally-spear fights identical
//     (total, volley, allyDealt, rounds, outcome, full log) to the
//     same-stream BOW x congregation fights.
//  6. mechanism invariants: fromStartJoined on every fight,
//     shoutJoined on none, SPEAR fights carry machete in melee +
//     hide_armor on torso, volley null rate on SPEAR confirm = 1.
// Usage: node scripts/test-spearxbow-20261031.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const CORPUS = path.join(REPO, 'evidence', '2026-10-31', 'perseed-spearxbow-a', 'fixture-band.json');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ' + name + (detail !== undefined ? ' — ' + detail : '')); }
  else { fail++; console.log('FAIL ' + name + (detail !== undefined ? ' — ' + detail : '')); }
}
function median(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function rate(arr, pred) { return arr.length ? arr.filter(pred).length / arr.length : null; }

const corpus = JSON.parse(fs.readFileSync(CORPUS, 'utf8'));
const fights = corpus.fights;
const pilot = fights.filter(f => f.stage === 'pilot');
const confirm = fights.filter(f => f.stage === 'confirm');

// 1. determinism gate
const tmp1 = '/tmp/spearxbow-det1.json', tmp2 = '/tmp/spearxbow-det2.json';
execSync('node scripts/spearxbow-fixture-20261031.js ' + tmp1, { cwd: REPO, stdio: 'pipe' });
execSync('node scripts/spearxbow-fixture-20261031.js ' + tmp2, { cwd: REPO, stdio: 'pipe' });
const committed = fs.readFileSync(CORPUS, 'utf8');
check('det-gate rerun1 == committed', fs.readFileSync(tmp1, 'utf8') === committed);
check('det-gate rerun2 == committed', fs.readFileSync(tmp2, 'utf8') === committed);
check('det-gate rerun1 == rerun2', fs.readFileSync(tmp1, 'utf8') === fs.readFileSync(tmp2, 'utf8'));

// 2. pilot gate, recomputed
const pilotSpear = pilot.filter(f => f.tier === 'SPEAR' && !f.allySpear);
const pilotXbow = pilot.filter(f => f.tier === 'XBOW');
const m1 = rate(pilot, f => f.fromStartJoined);
const m2 = rate(pilotXbow, f => f.volleyShots !== null && f.volleyShots > 0);
const m3 = rate(pilotSpear, f => f.equippedRanged === 'hunting_spear');
check('pilot M1 fromStart >= 0.9', m1 >= 0.9, m1);
check('pilot M2 xbow volley fired 4/4', m2 === 1, m2);
check('pilot M3 spear ranged 4/4', m3 === 1, m3);
check('pilot n = 20', pilot.length === 20, pilot.length);
check('confirm n = 156', confirm.length === 156, confirm.length);

// 3. SPEAR S1/S2, recomputed
const spear = confirm.filter(f => f.tier === 'SPEAR' && !f.allySpear);
const s1 = rate(spear, f => f.equippedRanged === 'hunting_spear');
const s2 = rate(spear, f => f.volleyShots === null || f.volleyShots === 0);
check('SPEAR S1 ranged==spear >= 0.9', s1 >= 0.9, s1 + ' (' + spear.length + ' fights)');
check('SPEAR S2 volley null/0 >= 0.9', s2 >= 0.9, s2);
check('SPEAR volley null on all 36', spear.every(f => f.volleyShots === null && f.volleyDmg === null));
check('SPEAR melee still machete on all 36', spear.every(f => f.equippedMelee === 'machete'));
check('SPEAR torso still hide_armor on all 36', spear.every(f => f.equippedTorso === 'hide_armor'));

// 4. XBOW X1/X2, recomputed (pooled + per beast)
const byTier = {};
for (const t of ['BOW', 'XBOW', 'SLING', 'SPEAR']) {
  byTier[t] = median(confirm.filter(f => f.tier === t && !f.allySpear).map(f => f.volleyDmg === null ? 0 : f.volleyDmg));
}
const totByTier = {};
for (const t of ['BOW', 'XBOW', 'SLING', 'SPEAR']) {
  totByTier[t] = median(confirm.filter(f => f.tier === t && !f.allySpear).map(f => f.totalDmg));
}
check('XBOW X1 volley rank #1 pooled', byTier.XBOW > byTier.BOW && byTier.XBOW > byTier.SLING && byTier.XBOW > byTier.SPEAR,
  JSON.stringify(byTier));
check('XBOW X2 total >= bow pooled', totByTier.XBOW >= totByTier.BOW, JSON.stringify(totByTier));
for (const b of ['congregation', 'eater', 'audit']) {
  const vb = {}, tb = {};
  for (const t of ['BOW', 'XBOW', 'SLING', 'SPEAR']) {
    const fsb = confirm.filter(f => f.tier === t && !f.allySpear && f.beast === b);
    vb[t] = median(fsb.map(f => f.volleyDmg === null ? 0 : f.volleyDmg));
    tb[t] = median(fsb.map(f => f.totalDmg));
  }
  check('XBOW volley #1 on ' + b, vb.XBOW > vb.BOW && vb.XBOW > vb.SLING && vb.XBOW > vb.SPEAR, JSON.stringify(vb));
  check('XBOW total #1 on ' + b, tb.XBOW >= tb.BOW && tb.XBOW >= tb.SLING && tb.XBOW >= tb.SPEAR, JSON.stringify(tb));
}

// 5. ally-spear null, per-fight identity
const as = confirm.filter(f => f.allySpear).sort((a, b) => a.stream - b.stream);
const bc = confirm.filter(f => !f.allySpear && f.tier === 'BOW' && f.beast === 'congregation').sort((a, b) => a.stream - b.stream);
let identical = 0;
for (let i = 0; i < as.length; i++) {
  const a = as[i], b = bc[i];
  if (a.stream === b.stream && a.totalDmg === b.totalDmg && a.volleyDmg === b.volleyDmg
    && a.allyDealt === b.allyDealt && a.rounds === b.rounds && a.outcome === b.outcome
    && a.log.join('\n') === b.log.join('\n')) identical++;
}
check('ally-spear identical fights 12/12', identical === 12, identical + '/12');

// 6. mechanism invariants
check('fromStartJoined on all 176', fights.every(f => f.fromStartJoined), fights.filter(f => f.fromStartJoined).length + '/176');
check('shoutJoined on none', fights.every(f => !f.shoutJoined));
check('kill/drive-off total 0', fights.every(f => f.outcome !== 'vKill' && f.outcome !== 'mFlee'));
check('anchor recorded', typeof corpus.anchorCommit === 'string' && corpus.anchorCommit.length === 40, corpus.anchorCommit);
check('verdict fields match recomputation',
  corpus.confirm.spear.pass === (s1 >= 0.9 && s2 >= 0.9)
  && corpus.confirm.xbow.pass === (byTier.XBOW > byTier.BOW && byTier.XBOW > byTier.SLING && byTier.XBOW > byTier.SPEAR && totByTier.XBOW >= totByTier.BOW));

console.log('\n' + pass + '/' + (pass + fail) + ' GREEN');
process.exit(fail ? 1 : 0);
