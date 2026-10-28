#!/usr/bin/env node
// analyze-prestage3tap-b.js — per-seed pre-stage-3 tap-window table
// + verdict vs the sim-prestage3tap-b prereg bars.
//
// Usage:
//   node scripts/analyze-prestage3tap-b.js --before <control-dir>
//     --after <policy-dir> [--bar-pass N] [--out <analysis.json>]
// Judged (prereg): P1 pooled tap-day at-haven inside rate >= 0.80,
// P2 share of policy tap rows with stageAtTap < 3 > 0.50,
// P3 per-seed inside tap (>= 1 tap with access 'inside' + issued),
// G1 median days policy >= 0.8x control, G2 starvation <= control+2.
// Exits 0 when the analysis is complete (the verdict is data,
// not an exit code — the evidence file judges it).
'use strict';
const fs = require('fs');
const path = require('path');
const arg = (n, f) => { const i = process.argv.indexOf('--' + n); return i < 0 ? f : process.argv[i + 1]; };
const beforeDir = arg('before', null), afterDir = arg('after', null);
const barPass = parseInt(arg('bar-pass', '6'), 10);
const outFile = arg('out', null);
if (!beforeDir || !afterDir) { console.error('usage: --before <dir> --after <dir> [--bar-pass N] [--out <file>]'); process.exit(2); }

function loadDir(dir) {
  const out = {};
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith('.json')) continue;
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[j.seed] = j;
  }
  return out;
}
function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  if (!s.length) return null;
  return s.length % 2 ? s[Math.floor(s.length / 2)] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function isStarv(d) { return /starv|hunger|famine/i.test(String((d && d.cause) || '')); }

function perSeed(j, policyLeg) {
  const evs = (j.evenings || []).filter((e) => e.eveningOutcome !== 'game-over');
  let atHaven = 0, inside = 0;
  const outcomes = {};
  for (const e of evs) {
    outcomes[e.eveningOutcome] = (outcomes[e.eveningOutcome] || 0) + 1;
    const preTile = policyLeg && e.policyBefore ? e.policyBefore.tile : e.tile;
    if (preTile === 'haven') { atHaven++; if (e.inside === true && e.tile === 'haven') inside++; }
  }
  const rate = atHaven ? inside / atHaven : null;
  // Tap-day evenings only (tapDay flag set by the driver).
  const tapEvs = evs.filter((e) => e.tapDay);
  let tapAtHaven = 0, tapInside = 0;
  for (const e of tapEvs) {
    const preTile = policyLeg && e.policyBefore ? e.policyBefore.tile : e.tile;
    if (preTile === 'haven') { tapAtHaven++; if (e.inside === true && e.tile === 'haven') tapInside++; }
  }
  const tapRate = tapAtHaven ? tapInside / tapAtHaven : null;
  const taps = j.taps || [];
  const insideTaps = taps.filter((t) => t.outcome === 'attempted' && t.accessAtTap === 'inside');
  const byAccess = {}, byStage = {}, accessXStage = {};
  const tapClasses = {};
  for (const t of taps) {
    byAccess[t.accessAtTap] = (byAccess[t.accessAtTap] || 0) + 1;
    const band = (t.stageAtTap === null || t.stageAtTap === undefined) ? 'null' : (t.stageAtTap < 3 ? '<3' : '>=3');
    byStage[band] = (byStage[band] || 0) + 1;
    const k = t.accessAtTap + '/' + band;
    accessXStage[k] = (accessXStage[k] || 0) + 1;
    if (t.outcome === 'attempted') tapClasses[t.tapOutcomeClass] = (tapClasses[t.tapOutcomeClass] || 0) + 1;
    else tapClasses['button-refused:' + (t.buttonWhy || 'null')] = (tapClasses['button-refused:' + (t.buttonWhy || 'null')] || 0) + 1;
  }
  const mornings = j.mornings || [];
  const mornInside = mornings.filter((m) => m.inside === true && m.tile === 'haven').length;
  const starv = (j.deaths || []).filter(isStarv).length;
  return {
    seed: j.seed, daysAlive: j.daysAlive, endReason: j.endReason,
    maxWaveUnlocked: j.maxWaveUnlocked, waveKills: j.waveKills,
    evenings: evs.length, atHaven, inside, rate,
    m1Pass: rate !== null && rate >= 0.5,
    tapEvenings: tapEvs.length, tapAtHaven, tapInside, tapRate,
    tapDays: taps.length, insideTaps: insideTaps.length,
    p3Pass: insideTaps.length >= 1,
    byAccess, byStage, accessXStage, tapClasses, outcomes,
    mornings: mornings.length, morningsInside: mornInside,
    deaths: (j.deaths || []).length, starvationDeaths: starv,
    deathCauses: (j.deaths || []).map((d) => d.cause || null),
    grantOk: j.grantOk,
    tapStageDist: taps.map((t) => ({ loopDay: t.loopDay, access: t.accessAtTap, stage: t.stageAtTap, inside: t.insideAtTap, tile: t.tileAtTap, outcome: t.outcome, cls: t.tapOutcomeClass || null, why: t.buttonWhy || null })),
  };
}

const before = loadDir(beforeDir), after = loadDir(afterDir);
const seeds = Object.keys(after).map(Number).sort((a, b) => a - b);
const rows = { before: {}, after: {} };
for (const s of seeds) {
  if (before[s]) rows.before[s] = perSeed(before[s], false);
  rows.after[s] = perSeed(after[s], true);
}
const sum = (rs, k) => Object.values(rs).reduce((t, r) => t + (r[k] || 0), 0);
const mergeCounts = (rs, k) => { const o = {}; for (const r of Object.values(rs)) for (const [ck, cv] of Object.entries(r[k] || {})) o[ck] = (o[ck] || 0) + cv; return o; };
// P1 pooled over policy tap-day at-haven evenings.
const p1Num = sum(rows.after, 'tapInside'), p1Den = sum(rows.after, 'tapAtHaven');
const p1 = p1Den ? p1Num / p1Den : null;
// P2 pooled over policy tap rows with a recorded stage.
let p2Num = 0, p2Den = 0;
for (const s of seeds) for (const t of (after[s].taps || [])) {
  if (t.stageAtTap === null || t.stageAtTap === undefined) continue;
  p2Den++;
  if (t.stageAtTap < 3) p2Num++;
}
const p2 = p2Den ? p2Num / p2Den : null;
const p3Pass = Object.values(rows.after).filter((r) => r.p3Pass).length;
const m1Pass = Object.values(rows.after).filter((r) => r.m1Pass).length;
const medBefore = median(Object.values(rows.before).map((r) => r.daysAlive));
const medAfter = median(Object.values(rows.after).map((r) => r.daysAlive));
const starvBefore = sum(rows.before, 'starvationDeaths');
const starvAfter = sum(rows.after, 'starvationDeaths');
const g1 = medBefore === null ? null : (medAfter >= 0.8 * medBefore);
const g2 = starvAfter <= starvBefore + 2;
const verdict = {
  seeds: seeds.length, barPass,
  p1Num, p1Den, p1, p1Go: p1 !== null && p1 >= 0.80,
  p2Num, p2Den, p2, p2Go: p2 !== null && p2 > 0.50,
  p3Pass, p3Bar: barPass, p3Go: p3Pass >= barPass,
  m1Pass, m1Bar: barPass,
  medianDaysControl: medBefore, medianDaysPolicy: medAfter, g1,
  starvationControl: starvBefore, starvationPolicy: starvAfter, g2,
  go: (p1 !== null && p1 >= 0.80) && (p2 !== null && p2 > 0.50) && (p3Pass >= barPass) && g1 && g2,
  policyTapByAccess: mergeCounts(rows.after, 'byAccess'),
  policyTapByStage: mergeCounts(rows.after, 'byStage'),
  policyAccessXStage: mergeCounts(rows.after, 'accessXStage'),
  policyTapClasses: mergeCounts(rows.after, 'tapClasses'),
  controlTapByAccess: mergeCounts(rows.before, 'byAccess'),
  controlTapByStage: mergeCounts(rows.before, 'byStage'),
  controlAccessXStage: mergeCounts(rows.before, 'accessXStage'),
  controlTapClasses: mergeCounts(rows.before, 'tapClasses'),
  policyEveningOutcomes: mergeCounts(rows.after, 'outcomes'),
  controlEveningOutcomes: mergeCounts(rows.before, 'outcomes'),
  maxWavePolicy: Object.fromEntries(seeds.map((s) => [s, rows.after[s].maxWaveUnlocked])),
  maxWaveControl: Object.fromEntries(seeds.map((s) => [s, rows.before[s] ? rows.before[s].maxWaveUnlocked : null])),
};
const analysis = { verdict, rows };
console.log('seed | days | wave | tapEv atHaven inside rate | taps insideTaps | p3 | stages | access (policy leg)');
for (const s of seeds) {
  const r = rows.after[s];
  console.log(`${s} | ${r.daysAlive} | ${r.maxWaveUnlocked} | ${r.tapEvenings} ${r.tapAtHaven} ${r.tapInside} ${r.tapRate === null ? 'null' : r.tapRate.toFixed(2)} | ${r.tapDays} ${r.insideTaps} | ${r.p3Pass} | ${JSON.stringify(r.byStage)} | ${JSON.stringify(r.byAccess)}`);
}
console.log('--- control ---');
for (const s of seeds) {
  const r = rows.before[s];
  if (!r) { console.log(`${s} | MISSING`); continue; }
  console.log(`${s} | ${r.daysAlive} | ${r.maxWaveUnlocked} | ${r.tapEvenings} ${r.tapAtHaven} ${r.tapInside} ${r.tapRate === null ? 'null' : r.tapRate.toFixed(2)} | ${r.tapDays} ${r.insideTaps} | ${r.p3Pass} | ${JSON.stringify(r.byStage)} | ${JSON.stringify(r.byAccess)}`);
}
console.log('--- verdict ---');
console.log(JSON.stringify(verdict, null, 2));
if (outFile) fs.writeFileSync(outFile, JSON.stringify(analysis, null, 2) + '\n');
