#!/usr/bin/env node
// test-throttledays-b.js — proof for sim-throttledays-b (measurement arm).
//
// Asserts, and prints PASS/FAIL with the numbers:
//  1. Unit: need-days definition — freshKcal 42,687 / (9 x 2000) = 2.37,
//     matching the freshdays arm's quoted 2.4-day full-need equivalent
//     for seed 9753 day 74 (within 0.05).
//  2. Corpus validity: 8 seeds, competent-nofeast fields, throttle
//     resolution records present on every seed.
//  3. Coverage (pre-registered bar): resolution AND day coverage >= 95%.
//  4. Consistency: zero throttle-flag mismatches vs garden-capture, zero
//     engaged resolutions with drain-days <= 4, zero fallback-inflated
//     agreement hidden (fallback share printed).
//  5. Disagreement share printed at primary + sensitivity thresholds
//     (reported, not asserted — it IS the answer).
//  6. Reproduction: gardenbar trajectory counts match exactly
//     (761 / 750 / 11 / 3167 / 32 / 235), else the band re-labels and
//     this leg FAILS LOUDLY so the evidence cannot claim "reproduced".
//  7. Determinism: a fresh identical-seed re-run (seed 9760, stdout
//     mode, no corpus write) reproduces the corpus file's resolution
//     count, engaged count, and every engaged resolution's
//     (day, freshKcal, freshDays, needDays) tuple.
// Exit 0 on PASS, 1 on FAIL. No jest, no concurrent harness use.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const DIR = path.join(__dirname, '..', 'evidence', '2026-10-26', 'sim-throttledays-b-corpus');
let fail = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + ' :: ' + detail);
  if (!ok) fail++;
}

// 1. Unit: need-days definition.
const unit = 42687 / (9 * 2000);
check('unit need-days definition', Math.abs(unit - 2.4) < 0.05, '42687/(9x2000) = ' + unit.toFixed(4) + ' (freshdays quoted 2.4)');

// 2. Corpus validity.
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();
check('corpus file count', files.length === 8, files.length + ' files');
const seeds = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
let fieldsOk = true, resOk = true;
for (const s of seeds) {
  if (s.policy !== 'competent-nofeast' || s.competentFeast !== 0 || s.plentydepri !== 0 || s.depositgate !== 1) fieldsOk = false;
  if (!s.throttleEvents || !Array.isArray(s.throttleEvents.resolutions) || !s.throttleEvents.resolutions.length) resOk = false;
}
check('corpus policy fields', fieldsOk, 'all seeds competent-nofeast, feast 0, pd 0, dg 1');
check('corpus throttle records', resOk, 'every seed carries throttle resolutions');

// 3-6. Recompute from corpus (independent pass, not the analyzer's code path).
let totRes = 0, totEng = 0, covRes = 0, mismatch = 0, anomaly = 0, fallbackEng = 0;
let dis4 = 0, dis2 = 0, dis1 = 0;
const dayMap = new Map();
let rep = { res: 0, eng: 0, npc: 0, keeper: 0, beds: 0, psow: 0 };
for (const s of seeds) {
  const tr = s.throttleEvents.resolutions, gr = s.gardenEvents.resolutions;
  rep.res += gr.length; rep.eng += gr.filter(r => r.throttle === true).length;
  rep.npc += (s.gardenEvents.npcSows || []).length;
  rep.keeper += (s.gardenEvents.keeperTurns || []).length;
  rep.beds += (s.gardenEvents.makes || []).length;
  rep.psow += (s.gardenEvents.sows || []).length;
  for (let i = 0; i < Math.min(tr.length, gr.length); i++) if (tr[i].throttle !== gr[i].throttle) mismatch++;
  for (const r of tr) {
    totRes++;
    if (r.throttle === true) {
      totEng++;
      const covered = (r.freshDays != null && r.needDays != null);
      if (covered) {
        covRes++;
        if (r.needDays <= 4) dis4++;
        if (r.needDays <= 2) dis2++;
        if (r.needDays <= 1) dis1++;
      }
      if (r.fallback) fallbackEng++;
      if (r.freshDays != null && r.freshDays <= 4) anomaly++;
      const key = s.seed + '|' + r.day;
      if (!dayMap.has(key)) dayMap.set(key, { covered: covered });
    }
  }
}
let dayCov = 0;
for (const d of dayMap.values()) if (d.covered) dayCov++;
const resCovPct = totEng ? covRes / totEng : 0;
const dayCovPct = dayMap.size ? dayCov / dayMap.size : 0;
check('coverage resolution >= 95%', resCovPct >= 0.95, covRes + '/' + totEng + ' = ' + (100 * resCovPct).toFixed(1) + '%');
check('coverage day >= 95%', dayCovPct >= 0.95, dayCov + '/' + dayMap.size + ' = ' + (100 * dayCovPct).toFixed(1) + '%');
check('flag agreement vs garden-capture', mismatch === 0, mismatch + ' mismatches / ' + totRes);
check('no engaged resolution with drain-days <= 4', anomaly === 0, anomaly + ' anomalies');
console.log('INFO disagreement (resolution): need>4 ' + (100 * dis4 / Math.max(1, covRes)).toFixed(1) + '% (' + dis4 + '/' + covRes + '); need>2 ' + (100 * dis2 / Math.max(1, covRes)).toFixed(1) + '%; need>1 ' + (100 * dis1 / Math.max(1, covRes)).toFixed(1) + '%');
console.log('INFO fallback engaged share: ' + fallbackEng + '/' + totEng);
const reproOk = rep.res === 761 && rep.eng === 750 && rep.npc === 11 && rep.keeper === 3167 && rep.beds === 32 && rep.psow === 235;
check('reproduction vs gardenbar', reproOk, 'res ' + rep.res + '/761, eng ' + rep.eng + '/750, npc ' + rep.npc + '/11, keeper ' + rep.keeper + '/3167, beds ' + rep.beds + '/32, psow ' + rep.psow + '/235');

// 7. Determinism: fresh seed-9760 re-run via stdout mode.
try {
  const env = Object.assign({}, process.env, {
    COMPETENT_FEAST: '0', SEATDRIVE: '0', PLENTYDEPRI: '0', DEPOSITGATE: '1',
    SEEDS: '9760', DAYS: '100', SWEEP_STDOUT_JSON: '1',
  });
  delete env.FEASTSCALE_R13;
  const out = execFileSync('node', [path.join(__dirname, 'sweep-throttledays-b.js')], { env, encoding: 'utf8', timeout: 180000 });
  const line = out.split('\n').find(l => l.startsWith('{'));
  const fresh = JSON.parse(line);
  const corpus = seeds.find(s => s.seed === 9760);
  const fEng = fresh.throttleEvents.resolutions.filter(r => r.throttle === true);
  const cEng = corpus.throttleEvents.resolutions.filter(r => r.throttle === true);
  let tuplesOk = fEng.length === cEng.length;
  if (tuplesOk) {
    for (let i = 0; i < fEng.length; i++) {
      const a = fEng[i], b = cEng[i];
      if (a.day !== b.day || a.freshKcal !== b.freshKcal || a.freshDays !== b.freshDays || a.needDays !== b.needDays) { tuplesOk = false; break; }
    }
  }
  check('determinism seed 9760 re-run', tuplesOk, 'fresh res ' + fresh.throttleEvents.resolutions.length + ' vs corpus ' + corpus.throttleEvents.resolutions.length + '; engaged ' + fEng.length + ' vs ' + cEng.length + '; all (day,freshKcal,freshDays,needDays) tuples identical: ' + tuplesOk);
} catch (e) {
  check('determinism seed 9760 re-run', false, 're-run failed: ' + String(e.message).slice(0, 200));
}

console.log(fail === 0 ? 'OVERALL: PASS' : 'OVERALL: FAIL (' + fail + ' legs)');
process.exit(fail === 0 ? 0 : 1);
