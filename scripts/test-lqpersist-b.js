#!/usr/bin/env node
// test-lqpersist-b.js — proof for sim-lqpersist-b (measurement only).
//
// Asserts, against the pilot corpus evidence/2026-10-26/
// sim-lqpersist-b-corpus/ (8 seeds, 9760-9767):
//   1. corpus validity (8 files, policy fields, stock + lq resolutions,
//      mealDraw records, no truncation)
//   2. control reproduction exact (761/750/11/3167/32/235)
//   3. snapshot rebuild >= 99% + throttle flags agree >= 99%
//   4. independent recomputation of the PRIMARY verdict (post-arrival
//      LQ presence on 9762 >= 80%) and the three mechanism bars, and
//      agreement with the analyzer's printed VERDICT/MECHANISM lines
//   5. determinism: a fresh seed-9760 run (SWEEP_STDOUT_JSON=1) reproduces
//      the corpus file exactly except `ms`
//   6. hygiene: 0 src/js files modified, 0 sibling capture files modified,
//      no modified tracked files at all (new files only)
// Exit 0 iff all pass. Run: node scripts/test-lqpersist-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'evidence', '2026-10-26', 'sim-lqpersist-b-corpus');
const LQ = "Lamb's Quarters";
let failures = [];
function check(name, ok, detail) {
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail != null ? ' — ' + detail : ''));
  if (!ok) failures.push(name);
}
function median(xs) {
  const v = xs.filter(x => x != null && isFinite(x));
  if (!v.length) return null;
  const s = [...v].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
function stockFresh(rec, channel) {
  const b = (rec.buckets || []).find(x => x.channel === channel);
  return b ? b.freshKcal : 0;
}
function lqChan(rec, channel) {
  return (rec.channels || []).find(x => x.channel === channel) || null;
}
function gitNames(args) {
  try {
    return execSync('git ' + args, { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  } catch (e) { return ['GIT-ERROR:' + String(e && e.message)]; }
}

// 1. corpus validity.
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
check('corpus has 8 pilot files', files.length === 8, files.length + ' files');
const seeds = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
const bySeed = {};
for (const s of seeds) bySeed[s.seed] = s;
check('pilot seeds are 9760-9767', seeds.map(s => s.seed).join(',') === '9760,9761,9762,9763,9764,9765,9766,9767');
let policyOk = true, recOk = true;
for (const s of seeds) {
  if (s.policy !== 'competent-nofeast' || s.plentydepri !== 0 || s.depositgate !== 1 ||
      s.competentFeast !== 0 || s.feastscaleR13 !== 0) policyOk = false;
  if (!(s.stockEvents && s.stockEvents.resolutions && s.stockEvents.resolutions.length) ||
      !(s.lqEvents && s.lqEvents.resolutions && s.lqEvents.resolutions.length) ||
      !Array.isArray(s.mealDrawRecords) || !s.mealDrawRecords.length ||
      s.mealdrawTruncated || s.inflowTruncated) recOk = false;
}
check('policy fields + recorders present, no truncation', policyOk && recOk);

// 2. reproduction exact.
let rep = { resolutions: 0, engaged: 0, npcSows: 0, keeperTurns: 0, beds: 0, playerSows: 0 };
for (const s of seeds) {
  rep.resolutions += ((s.gardenEvents && s.gardenEvents.resolutions) || []).length;
  rep.engaged += ((s.gardenEvents && s.gardenEvents.resolutions) || []).filter(r => r.throttle === true).length;
  rep.npcSows += ((s.gardenEvents && s.gardenEvents.npcSows) || []).length;
  rep.keeperTurns += ((s.gardenEvents && s.gardenEvents.keeperTurns) || []).length;
  rep.beds += ((s.gardenEvents && s.gardenEvents.makes) || []).length;
  rep.playerSows += ((s.gardenEvents && s.gardenEvents.sows) || []).length;
}
check('reproduction exact 761/750/11/3167/32/235', rep.resolutions === 761 && rep.engaged === 750 &&
  rep.npcSows === 11 && rep.keeperTurns === 3167 && rep.beds === 32 && rep.playerSows === 235, JSON.stringify(rep));

// 3. rebuild + flags.
let rebuildOk = 0, rebuildChecked = 0, flagMismatch = 0, flagChecked = 0;
for (const s of seeds) {
  const gr = (s.gardenEvents && s.gardenEvents.resolutions) || [];
  const tr = (s.throttleEvents && s.throttleEvents.resolutions) || [];
  const sr = (s.stockEvents && s.stockEvents.resolutions) || [];
  const lr = (s.lqEvents && s.lqEvents.resolutions) || [];
  const n = Math.min(gr.length, tr.length, sr.length, lr.length);
  for (let i = 0; i < n; i++) {
    flagChecked++;
    if (gr[i].throttle !== tr[i].throttle || gr[i].throttle !== sr[i].throttle || gr[i].throttle !== lr[i].throttle) flagMismatch++;
  }
  for (const r of sr) {
    if (r.freshKcal != null && r.freshRebuilt != null) {
      rebuildChecked++;
      if (r.freshRebuilt === r.freshKcal) rebuildOk++;
    }
  }
}
check('rebuild >= 99%', rebuildChecked > 0 && rebuildOk / rebuildChecked >= 0.99, rebuildOk + '/' + rebuildChecked);
check('flags agree >= 99%', flagChecked > 0 && 1 - flagMismatch / flagChecked >= 0.99, (flagChecked - flagMismatch) + '/' + flagChecked);

// 4. independent recomputation of verdict + mechanism bars.
const s9762 = bySeed[9762];
const eng = (s9762.stockEvents.resolutions || []).filter(r => r.throttle === true);
const engLq = (s9762.lqEvents.resolutions || []).filter(r => r.throttle === true);
let fa = null;
for (const r of eng) if (stockFresh(r, LQ) > 0) { fa = r.day; break; }
const post = eng.filter(r => r.day >= fa);
const postPresent = post.filter(r => stockFresh(r, LQ) > 0).length;
const postShare = post.length ? postPresent / post.length : 0;
const bandPresent = eng.filter(r => stockFresh(r, LQ) > 0).length;
check('LQ first appearance + post-arrival presence (independent)', fa != null && postShare >= 0.80,
  'fa day ' + fa + ', present ' + postPresent + '/' + post.length + ' = ' + (100 * postShare).toFixed(1) + '%; band-start ' + bandPresent + '/' + eng.length);
const postLq = engLq.filter(r => r.day >= fa);
const horizons = [], slabShares = [];
for (const r of postLq) {
  const c = lqChan(r, LQ);
  if (c && c.freshKcal > 0) {
    if (c.horizonMed != null) horizons.push(c.horizonMed);
    slabShares.push(c.slabFreshKcal / c.freshKcal);
  }
}
const medHorizon = median(horizons);
const medSlab = median(slabShares);
const pooled = [];
for (const [seed, channel] of [[9761, 'Cattail'], [9760, 'Burdock']]) {
  const s = bySeed[seed];
  for (const r of (s.lqEvents.resolutions || []).filter(x => x.throttle === true)) {
    const c = lqChan(r, channel);
    if (c && c.freshKcal > 0 && c.horizonMed != null) pooled.push(c.horizonMed);
  }
}
const pooledMed = median(pooled);
const barA = medHorizon != null && pooledMed != null && medHorizon >= 2.0 * pooledMed;
const drawPer = {};
let drawTotal = 0;
for (const r of (s9762.mealDrawRecords || [])) {
  if (r.kind !== 'pantryDraw' || r.context === 'other') continue;
  for (const it of (r.items || [])) {
    const k = (it.units || 0) * (it.effectiveKcal || 0);
    drawTotal += k; drawPer[it.name] = (drawPer[it.name] || 0) + k;
  }
}
const drawShare = drawTotal ? (drawPer[LQ] || 0) / drawTotal : 0;
const medFresh = median(post.map(r => stockFresh(r, LQ)));
const medTotal = median(post.map(r => r.freshKcal));
const stockShare = medTotal ? medFresh / medTotal : 0;
const barB = medSlab != null && medSlab >= 0.50 && stockShare > 0 && drawShare <= 0.50 * stockShare;
function depCov(s, channel) {
  const evs = (s.inflows || []).filter(e => e.name === channel);
  if (!evs.length) return null;
  const days = [...new Set(evs.map(e => e.day))].sort((a, b) => a - b);
  return days.length / (days[days.length - 1] - days[0] + 1);
}
const covLQ = depCov(s9762, LQ);
const covCat = depCov(bySeed[9761], 'Cattail');
const covBur = depCov(bySeed[9760], 'Burdock');
const barC = covLQ != null && covLQ >= 0.60 && covCat != null && covCat < 0.40 && covBur != null && covBur < 0.40;
const passed = ['SPOIL-TIMING', 'MEAL-DRAW-ORDER', 'DEPOSIT-FREQUENCY'].filter((_, i) => [barA, barB, barC][i]);
const mechanism = passed.length === 1 ? passed[0] : 'UNDISTINGUISHED';
const verdict = rep.resolutions === 761 && rep.engaged === 750 && rep.npcSows === 11 && rep.keeperTurns === 3167 &&
  rep.beds === 32 && rep.playerSows === 235 && rebuildOk / rebuildChecked >= 0.99 &&
  1 - flagMismatch / flagChecked >= 0.99 && postShare >= 0.80 ? 'GO' : 'NO-GO';
console.log('independent recomputation: horizon ' + medHorizon + ' vs pooled ' + pooledMed + ' => A=' + barA +
  '; slabShare ' + (medSlab != null ? medSlab.toFixed(3) : 'n/a') + ', drawShare ' + drawShare.toFixed(3) + ' vs 0.50x stockShare ' + (0.50 * stockShare).toFixed(3) + ' => B=' + barB +
  '; coverage LQ ' + (covLQ != null ? covLQ.toFixed(3) : 'n/a') + ' Cattail ' + (covCat != null ? covCat.toFixed(3) : 'n/a') + ' Burdock ' + (covBur != null ? covBur.toFixed(3) : 'n/a') + ' => C=' + barC +
  '; verdict ' + verdict + ', mechanism ' + mechanism);
// Analyzer agreement.
const analyzerOut = execSync('node scripts/analyze-lqpersist-b.js ' + DIR + ' pilot', { cwd: ROOT, encoding: 'utf8' });
const vLine = (analyzerOut.match(/VERDICT: (GO|NO-GO)/) || [])[1];
const mLine = (analyzerOut.match(/MECHANISM: ([A-Z-]+)/) || [])[1];
check('analyzer agrees with independent verdict', vLine === verdict, 'analyzer ' + vLine + ' vs proof ' + verdict);
check('analyzer agrees with independent mechanism', mLine === mechanism, 'analyzer ' + mLine + ' vs proof ' + mechanism);

// 5. determinism: fresh seed-9760 run reproduces corpus except ms.
const env = Object.assign({}, process.env, {
  COMPETENT_FEAST: '0', SEATDRIVE: '0', PLENTYDEPRI: '0', DEPOSITGATE: '1',
  SEEDS: '9760', DAYS: '100', SAYCAP: '300', INFLOWCAP: '50000', MEALDRAWCAP: '50000',
  SWEEP_STDOUT_JSON: '1',
});
delete env.FEASTSCALE_R13;
const run = spawnSync('node', ['scripts/sweep-lqpersist-b.js'], { cwd: ROOT, env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
let detOk = false, detDetail = '';
if (run.status !== 0) {
  detDetail = 'sweep exit ' + run.status + ': ' + (run.stderr || '').slice(-300);
} else {
  const lines = (run.stdout || '').trim().split('\n').filter(Boolean);
  if (lines.length !== 1) detDetail = 'expected 1 stdout JSON line, got ' + lines.length;
  else {
    const fresh = JSON.parse(lines[0]);
    const corpus = JSON.parse(fs.readFileSync(path.join(DIR, 'lqpersist-b-competent-nofeast-s9760.json'), 'utf8'));
    delete fresh.ms; delete corpus.ms;
    detOk = JSON.stringify(fresh) === JSON.stringify(corpus);
    detDetail = detOk ? 'seed 9760 reproduced exactly except ms' : 'payload differs';
  }
}
check('determinism seed 9760 (except ms)', detOk, detDetail);

// 6. hygiene.
const modified = gitNames('diff --name-only HEAD').concat(gitNames('diff --cached --name-only HEAD'));
const srcModified = modified.filter(f => f.startsWith('src/'));
const siblingCaptures = ['scripts/inflow-capture.js', 'scripts/garden-capture.js', 'scripts/throttledays-capture.js',
  'scripts/stock9762-capture.js', 'scripts/mealdraw-capture.js'];
const siblingModified = modified.filter(f => siblingCaptures.includes(f));
check('0 src/js files modified', srcModified.length === 0, srcModified.join(',') || 'none');
check('0 sibling capture files modified', siblingModified.length === 0, siblingModified.join(',') || 'none');
check('no modified tracked files (new files only)', modified.length === 0, modified.join(',') || 'none');
const head = execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
console.log('base HEAD: ' + head);
console.log(failures.length ? 'PROOF FAILURES: ' + failures.join(', ') : 'PROOF GREEN');
process.exit(failures.length ? 1 : 0);
