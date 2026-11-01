#!/usr/bin/env node
// test-s87135traj-a.js — proof for sim-s87135-traj-a (DIAG ONLY, no game load).
//
// Checks, against the committed v3 corpora:
//  (a) prereg classification sums: baseline wave-3 rows = Spool-post-85 + other.
//  (b) divergence chain: first snapshot diff d85 (worldMonsters only);
//      first hash diff d87; first sheltered snap d89; wave-4 unlock lever
//      d88 vs baseline d135; first wave-3+ kill lever d87 vs baseline d135.
//  (c) tick opportunities collapse on lever post-87 while the per-opportunity
//      fight rate stays normal (shelter filter, not tick breakage).
//  (d) determinism: v2/v3 trajectories identical on judged fields
//      (hashes, ff rows excl. log/stack, spawns, daily judged fields).
//  (e) recorder units: snapTraj is pure-read (mock state deep-unchanged);
//      the tick wrapper delegates and records opportunities.
// Usage: node scripts/test-s87135traj-a.js  (exit 0 = ALL CHECKS PASSED)
'use strict';
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const REPO = path.join(__dirname, '..');
const TJ = require(path.join(REPO, 'scripts', 'policies', 's87135traj-diag'));

let n = 0;
function check(name, cond, extra) {
  n++;
  if (!cond) { console.error(`FAIL ${name}${extra !== undefined ? ': ' + JSON.stringify(extra) : ''}`); process.exitCode = 1; }
  else console.log(`ok ${n} - ${name}`);
}
function load(leg) {
  return JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-01', `s87135traj-${leg}`, 'leadfeast', 's87135.json'), 'utf8'));
}

const B = load('baseline-v3');
const L = load('lever-v3');
const B2 = load('baseline-v2');
const L2 = load('lever-v2');

// (a) classification sums.
const bW3 = B.fieldFights.filter((r) => r.wave === 3);
const spoolPost = bW3.filter((r) => r.mid === 'spool' && r.day >= 85);
const other = bW3.filter((r) => !(r.mid === 'spool' && r.day >= 85));
check('baseline wave-3 rows = 47', bW3.length === 47, bW3.length);
check('classification sums: 12 lineage + 35 other = 47', spoolPost.length === 12 && other.length === 35 && spoolPost.length + other.length === 47, [spoolPost.length, other.length]);
check('lever wave-3 rows = 6', L.fieldFights.filter((r) => r.wave === 3).length === 6);
check('lever conversions = 2 (d85 strike, d87 kill)', L.fieldFights.filter((r) => r.contactFinishAttempted).length === 2);
check('lever conversion days are 85 and 87', JSON.stringify(L.fieldFights.filter((r) => r.contactFinishAttempted).map((r) => r.day)) === '[85,87]');

// (b) divergence chain.
function snapDiffFields(a, b) {
  const out = [];
  if (a.px !== b.px || a.py !== b.py) out.push('tile');
  if (JSON.stringify(a.worldMonsters) !== JSON.stringify(b.worldMonsters)) out.push('worldMonsters');
  if (JSON.stringify(a.roster) !== JSON.stringify(b.roster)) out.push('roster');
  if (JSON.stringify(a.nodePos) !== JSON.stringify(b.nodePos)) out.push('nodePos');
  if (JSON.stringify(a.shelteredList) !== JSON.stringify(b.shelteredList)) out.push('shelteredList');
  return out;
}
let firstSnap = null;
for (let i = 0; i < Math.min(B.trajSnaps.length, L.trajSnaps.length); i++) {
  const f = snapDiffFields(B.trajSnaps[i], L.trajSnaps[i]);
  if (f.length) { firstSnap = { day: B.trajSnaps[i].day, fields: f }; break; }
}
check('first snapshot divergence is day 85, worldMonsters only', firstSnap && firstSnap.day === 85 && JSON.stringify(firstSnap.fields) === '["worldMonsters"]', firstSnap);
let firstHash = null;
for (let i = 0; i < Math.min(B.hashes.length, L.hashes.length); i++) {
  if (B.hashes[i] !== L.hashes[i]) { firstHash = parseInt(B.hashes[i].split(':')[0], 10); break; }
}
check('first hash divergence is day 87', firstHash === 87, firstHash);
let firstShelter = null;
for (const s of L.trajSnaps) if (s.shelteredList && s.shelteredList.length) { firstShelter = s.day; break; }
check('first lever sheltered snap is day 89', firstShelter === 89, firstShelter);
check('baseline never shelters', !B.trajSnaps.some((s) => s.shelteredList && s.shelteredList.length));
function uwFlip(d) {
  for (const h of d.hashes) {
    const day = parseInt(h.split(':')[0], 10);
    const uw = parseInt(h.split(':')[1].split('|')[6], 10);
    if (uw >= 4) return day;
  }
  return null;
}
check('lever wave-4 unlock day 88', uwFlip(L) === 88, uwFlip(L));
check('baseline wave-4 unlock day 135', uwFlip(B) === 135, uwFlip(B));
const firstW3Kill = (d) => { const k = d.killLog.find((x) => x.w >= 3); return k ? k.d : null; };
check('first lever wave-3+ kill day 87 (Spool)', firstW3Kill(L) === 87, firstW3Kill(L));
check('first baseline wave-3+ kill day 135 (Spool)', firstW3Kill(B) === 135, firstW3Kill(B));
check('lever d88 Algorithm within muster radius 2 of Haven (4,4)', (() => {
  const s = L.trajSnaps.find((x) => x.day === 88);
  if (!s) return false;
  return s.worldMonsters.some((m) => m.id === 'algorithm' && Math.max(Math.abs(m.tx - 4), Math.abs(m.ty - 4)) <= 2);
})());
check('headline outcomes reproduce confirm (base nat1/144d, lever nat0/163d)',
  B.national === 1 && B.gameDays === 144 && L.national === 0 && L.gameDays === 163,
  [B.national, B.gameDays, L.national, L.gameDays]);

// (c) tick opportunities.
function tickAgg(d, lo, hi) {
  let opps = 0, fights = 0;
  for (const t of d.trajTicks) if (t.day >= lo && t.day <= hi) opps += t.opps;
  for (const f of d.fieldFights) if (f.caller === 'wild' && f.day >= lo && f.day <= hi) fights++;
  return { opps, fights, rate: opps ? fights / opps : 0 };
}
const bPost = tickAgg(B, 88, 144), lPost = tickAgg(L, 88, 144), lPre = tickAgg(L, 1, 87);
check('baseline post-87 tick opportunities >= 100', bPost.opps >= 100, bPost);
check('lever post-87 tick opportunities collapse to single digits', lPost.opps < 10, lPost);
check('lever pre-88 fight-per-opportunity rate sane (0.3-0.9)', lPre.rate > 0.3 && lPre.rate < 0.9, lPre);
check('lever post-87 fight-per-opportunity rate still sane (tick not broken)', lPost.rate > 0.3, lPost);

// (d) determinism across instrument versions (judged fields only).
const stripFf = (rows) => rows.map((r) => { const o = {}; for (const k of Object.keys(r)) if (k !== 'log' && k !== 'stack') o[k] = r[k]; return o; });
check('v3==v2 hashes (both legs)', B.hashes.join() === B2.hashes.join() && L.hashes.join() === L2.hashes.join());
check('v3==v2 ff judged fields (both legs)', JSON.stringify(stripFf(B.fieldFights)) === JSON.stringify(stripFf(B2.fieldFights)) && JSON.stringify(stripFf(L.fieldFights)) === JSON.stringify(stripFf(L2.fieldFights)));
check('v3==v2 spawns (both legs)', JSON.stringify(B.spawns) === JSON.stringify(B2.spawns) && JSON.stringify(L.spawns) === JSON.stringify(L2.spawns));

// (e) recorder units: pure-read snapshot + tick wrapper delegation.
(function () {
  const mockState = {
    scholar: { day: 10, health: 90, kcal: 2000 },
    village: { roster: ['a', 'b'], health: {}, pantry: [], nodePos: { a: { nx: 1, ny: 1 }, b: { nx: 2, ny: 2 } }, sheltered: {} },
    worldMonsters: [{ id: 'spool', tx: 1, ty: 1, hp: 7, maxHp: 280, veteran: false }],
    fledMonsters: {}, waveKillLog: [],
  };
  const before = JSON.stringify(mockState);
  const store = TJ.newStore();
  const fakeGame = { state: mockState, map: { px: 4, py: 4 }, _postFleeRest: {}, villagerId: 'scholar' };
  TJ.snapTraj(fakeGame, store);
  check('snapTraj records one snapshot', store.snaps.length === 1);
  check('snapTraj is pure-read (mock state unchanged)', JSON.stringify(mockState) === before);
  check('snapTraj overlap counts villager on monster tile', store.snaps[0].overlap === 1, store.snaps[0].overlap);
  // Tick wrapper: delegates, records opportunities, never throws into engine.
  let delegated = 0;
  const g2 = {
    state: mockState, map: { px: 4, py: 4 }, villagerId: 'scholar',
    villagerMonsterTick() { delegated++; return 'tick-ok'; },
  };
  const store2 = TJ.newStore();
  TJ.installS87135TrajTick(g2, store2);
  const ret = g2.villagerMonsterTick();
  check('tick wrapper delegates and returns value', ret === 'tick-ok' && delegated === 1);
  check('tick wrapper records 1 opportunity monster', store2.ticks.length === 1 && store2.ticks[0].opps === 1, store2.ticks[0]);
})();

if (process.exitCode) console.error('TESTS FAILED');
else console.log(`ALL CHECKS PASSED (${n} checks)`);
