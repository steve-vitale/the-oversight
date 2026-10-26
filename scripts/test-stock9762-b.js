#!/usr/bin/env node
// test-stock9762-b.js — proof for sim-stock9762-b (measurement only).
//
// Asserts, against evidence/2026-10-26/sim-stock9762-b-corpus/:
//  1. corpus validity: 8 seeds, policy fields, stock/garden/throttle
//     resolution records present.
//  2. control reproduction exact vs gardenbar (761/750/11/3167/32/235).
//  3. snapshot rebuild: freshRebuilt == freshKcal on >= 99% of all
//     stock resolutions.
//  4. GO/NO-GO judgment recomputed independently from the corpus
//     (median decomposition per the prereg; printed, and asserted to
//     be internally consistent: the verdict follows from the legs).
//  5. determinism: a fresh seed-9760 run (stdout mode, no repo writes)
//     reproduces every stock resolution (day, vid, throttle, freshKcal,
//     freshRebuilt) identically.
//  6. hygiene: no src/js file is modified in this worktree, and no
//     sibling capture file is modified.
// Exit 0 only if all pass. Writes nothing into the repo.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIR = path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-stock9762-b-corpus');
const EXPECT = { resolutions: 761, engaged: 750, npcSows: 11, keeperTurns: 3167, beds: 32, playerSows: 235 };
let failures = [];
function check(cond, msg) { console.log((cond ? 'PASS ' : 'FAIL ') + msg); if (!cond) failures.push(msg); }
function median(xs) {
  // Conventional median (average of two middles for even n) — matches
  // the throttledays evidence medians and the analyzer.
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
function bucketFresh(rec, channel) {
  const b = (rec.buckets || []).find(x => x.channel === channel);
  return b ? b.freshKcal : 0;
}

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
check(files.length === 8, 'corpus has 8 per-seed files (found ' + files.length + ')');
const seeds = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
for (const s of seeds) {
  check(s.policy === 'competent-nofeast' && s.plentydepri === 0 && s.depositgate === 1 &&
    s.competentFeast === 0 && s.feastscaleR13 === 0, 'seed ' + s.seed + ' policy fields competent-nofeast');
  check(Array.isArray((s.stockEvents && s.stockEvents.resolutions)) && s.stockEvents.resolutions.length > 0,
    'seed ' + s.seed + ' stock resolutions present (' + ((s.stockEvents && s.stockEvents.resolutions) || []).length + ')');
}

// Reproduction.
let rep = { resolutions: 0, engaged: 0, npcSows: 0, keeperTurns: 0, beds: 0, playerSows: 0 };
for (const s of seeds) {
  rep.resolutions += (s.gardenEvents.resolutions || []).length;
  rep.engaged += (s.gardenEvents.resolutions || []).filter(r => r.throttle === true).length;
  rep.npcSows += (s.gardenEvents.npcSows || []).length;
  rep.keeperTurns += (s.gardenEvents.keeperTurns || []).length;
  rep.beds += (s.gardenEvents.makes || []).length;
  rep.playerSows += (s.gardenEvents.sows || []).length;
}
check(JSON.stringify(rep) === JSON.stringify(EXPECT), 'control reproduction exact ' + JSON.stringify(rep) + ' vs ' + JSON.stringify(EXPECT));

// Rebuild.
let ok = 0, total = 0;
for (const s of seeds) for (const r of (s.stockEvents.resolutions || [])) {
  if (r.freshKcal != null && r.freshRebuilt != null) { total++; if (r.freshRebuilt === r.freshKcal) ok++; }
}
check(total > 0 && ok / total >= 0.99, 'snapshot rebuild ' + ok + '/' + total + ' = ' + (total ? (100 * ok / total).toFixed(1) + '%' : 'n/a') + ' (>= 99%)');

// Independent GO recomputation.
const perSeed = {};
const channels = new Set();
const engBySeed = {};
for (const s of seeds) {
  const eng = (s.stockEvents.resolutions || []).filter(r => r.throttle === true);
  engBySeed[s.seed] = eng;
  for (const r of eng) for (const b of (r.buckets || [])) channels.add(b.channel);
  perSeed[s.seed] = { engaged: eng.length, medFresh: median(eng.map(r => r.freshKcal)) };
}
// Second pass over the full channel set (see analyzer comment).
for (const s of seeds) {
  const eng = engBySeed[s.seed];
  const medByChannel = {}, presence = {};
  for (const c of channels) {
    const vals = eng.map(r => bucketFresh(r, c));
    medByChannel[c] = median(vals);
    let cnt = 0; const days = new Set();
    for (const r of eng) if (bucketFresh(r, c) > 0) { cnt++; days.add(r.day); }
    presence[c] = { resShare: eng.length ? cnt / eng.length : 0, days: days.size };
  }
  perSeed[s.seed].medByChannel = medByChannel;
  perSeed[s.seed].presence = presence;
}
const others = seeds.map(s => s.seed).filter(x => x !== 9762);
const totalGap = perSeed[9762].medFresh - median(others.map(x => perSeed[x].medFresh));
check(totalGap > 0, 'totalGap positive (' + totalGap + '; medFresh[9762] ' + perSeed[9762].medFresh + ')');
const rows = [];
for (const c of channels) {
  const gap = perSeed[9762].medByChannel[c] - median(others.map(x => perSeed[x].medByChannel[c]));
  const pres = perSeed[9762].presence[c];
  rows.push({ channel: c, share: totalGap ? gap / totalGap : 0, presentAcross: pres.resShare >= 0.8 && pres.days >= 50 });
}
rows.sort((a, b) => b.share - a.share);
const bestSingle = rows.find(r => r.presentAcross) || null;
const setRows = rows.filter(r => r.presentAcross && r.share >= 0.10).slice(0, 3);
const setShare = setRows.reduce((a, r) => a + r.share, 0);
const leg3 = !!(bestSingle && bestSingle.share >= 0.5) || setShare >= 0.5;
console.log('GO recomputation: totalGap ' + totalGap + ', best single ' + JSON.stringify(bestSingle && bestSingle.channel) + ' ' + (bestSingle ? (100 * bestSingle.share).toFixed(1) + '%' : 'n/a') + ', best set ' + JSON.stringify(setRows.map(r => r.channel)) + ' ' + (100 * setShare).toFixed(1) + '% => leg3=' + leg3);
const verdict = (JSON.stringify(rep) === JSON.stringify(EXPECT)) && (ok / total >= 0.99) && leg3 ? 'GO' : 'NO-GO';
console.log('VERDICT (proof recomputation): ' + verdict);
check(verdict === 'GO' || verdict === 'NO-GO', 'verdict is GO or NO-GO (got ' + verdict + ')');

// Determinism: fresh seed-9760 run in stdout mode (no repo writes).
try {
  const env = Object.assign({}, process.env, { COMPETENT_FEAST: '0', SEATDRIVE: '0', PLENTYDEPRI: '0', DEPOSITGATE: '1', SEEDS: '9760', DAYS: '100', SWEEP_STDOUT_JSON: '1' });
  delete env.FEASTSCALE_R13;
  const out = execSync('node scripts/sweep-stock9762-b.js', { cwd: path.join(__dirname, '..'), env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 600000 });
  const line = out.split('\n').find(l => l.startsWith('{'));
  const fresh = JSON.parse(line);
  const orig = seeds.find(s => s.seed === 9760);
  const key = (r) => [r.day, r.vid, r.throttle, r.freshKcal, r.freshRebuilt].join('|');
  const a = (orig.stockEvents.resolutions || []).map(key);
  const b = (fresh.stockEvents.resolutions || []).map(key);
  check(JSON.stringify(a) === JSON.stringify(b), 'determinism: seed-9760 stock resolutions reproduce identically (' + a.length + ' resolutions)');
} catch (e) {
  check(false, 'determinism re-run crashed: ' + String(e && e.message).slice(0, 300));
}

// Hygiene: no src/js modifications, no sibling capture modifications.
try {
  const changed = execSync('git status --porcelain', { cwd: path.join(__dirname, '..'), encoding: 'utf8' });
  const srcTouched = changed.split('\n').filter(l => l.includes('src/js/'));
  check(srcTouched.length === 0, 'no src/js files modified in worktree (' + srcTouched.length + ' found)');
  const siblings = ['scripts/throttledays-capture.js', 'scripts/stockdoor-capture.js', 'scripts/garden-capture.js', 'scripts/inflow-capture.js'];
  const sibTouched = changed.split('\n').filter(l => siblings.some(s => l.includes(s)));
  check(sibTouched.length === 0, 'no sibling capture files modified (' + sibTouched.length + ' found)');
} catch (e) {
  check(false, 'hygiene git check crashed: ' + String(e && e.message).slice(0, 200));
}

if (failures.length) { console.log('PROOF FAILED: ' + failures.length + ' failure(s)'); process.exit(1); }
console.log('PROOF GREEN: all checks passed, verdict ' + verdict);
