#!/usr/bin/env node
// analyze-insideevening-b.js — per-seed inside-evening table + verdict
// vs the sim-insideevening-b prereg bars.
//
// Usage:
//   node scripts/analyze-insideevening-b.js --before <control-dir>
//     --after <policy-dir> [--bar-pass N] [--out <analysis.json>]
// --before = competent corpus dir, --after = insideevening corpus dir.
// --bar-pass = seeds that must pass M1 and M2 for GO (pilot 6,
// confirm 12); the total seed count is read from the corpora.
// Prints a human table and writes the JSON analysis when --out
// is given. Exits 0 when the analysis is complete (the verdict
// is data, not an exit code — the evidence file judges it).
'use strict';
const fs = require('fs');
const path = require('path');
const arg = (n, f) => { const i = process.argv.indexOf('--' + n); return i < 0 ? f : process.argv[i + 1]; };
const beforeDir = arg('--before', null), afterDir = arg('--after', null);
const barPass = parseInt(arg('--bar-pass', '6'), 10);
const outFile = arg('--out', null);
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
    // Denominator: at haven at daily-end PRE-step. Policy leg:
    // policyBefore.tile when recorded; control leg: post-daily
    // tile (no step exists). already-inside/completed rows are
    // at-haven by construction on the policy leg.
    const preTile = policyLeg && e.policyBefore ? e.policyBefore.tile : e.tile;
    if (preTile === 'haven') {
      atHaven++;
      if (e.inside === true && e.tile === 'haven') inside++;
    }
  }
  const rate = atHaven ? inside / atHaven : null;
  const taps = j.taps || [];
  const insideTaps = taps.filter((t) => t.outcome === 'attempted' && t.accessAtTap === 'inside');
  const tapClasses = {};
  for (const t of taps) if (t.outcome === 'attempted') tapClasses[t.tapOutcomeClass] = (tapClasses[t.tapOutcomeClass] || 0) + 1;
  const mornings = j.mornings || [];
  const mornInside = mornings.filter((m) => m.inside === true && m.tile === 'haven').length;
  const starv = (j.deaths || []).filter(isStarv).length;
  return {
    seed: j.seed, daysAlive: j.daysAlive, endReason: j.endReason,
    evenings: evs.length, atHaven, inside, rate,
    m1Pass: rate !== null && rate >= 0.5,
    tapDays: taps.length, insideTaps: insideTaps.length,
    m2Pass: insideTaps.length >= 1,
    tapClasses, outcomes,
    mornings: mornings.length, morningsInside: mornInside,
    morningRate: mornings.length ? mornInside / mornings.length : null,
    deaths: (j.deaths || []).length, starvationDeaths: starv,
    deathCauses: (j.deaths || []).map((d) => d.cause || null),
    grantOk: j.grantOk,
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
const m1Pass = Object.values(rows.after).filter((r) => r.m1Pass).length;
const m2Pass = Object.values(rows.after).filter((r) => r.m2Pass).length;
const medBefore = median(Object.values(rows.before).map((r) => r.daysAlive));
const medAfter = median(Object.values(rows.after).map((r) => r.daysAlive));
const starvBefore = sum(rows.before, 'starvationDeaths');
const starvAfter = sum(rows.after, 'starvationDeaths');
const g1 = medBefore === null ? null : (medAfter >= 0.8 * medBefore);
const g2 = starvAfter <= starvBefore + 2;
const verdict = {
  seeds: seeds.length, barPass,
  m1Pass, m1Bar: barPass, m1Go: m1Pass >= barPass,
  m2Pass, m2Bar: barPass, m2Go: m2Pass >= barPass,
  medianDaysControl: medBefore, medianDaysPolicy: medAfter, g1,
  starvationControl: starvBefore, starvationPolicy: starvAfter, g2,
  go: (m1Pass >= barPass) && (m2Pass >= barPass) && g1 && g2,
};
const analysis = { verdict, rows };
console.log('seed | days | atHaven inside rate | m1 | taps insideTaps | m2 | mornIn/morn | starv | end (policy leg; control in JSON)');
for (const s of seeds) {
  const r = rows.after[s];
  console.log(`${s} | ${r.daysAlive} | ${r.atHaven} ${r.inside} ${r.rate === null ? 'null' : r.rate.toFixed(2)} | ${r.m1Pass} | ${r.tapDays} ${r.insideTaps} | ${r.m2Pass} | ${r.morningsInside}/${r.mornings} | ${r.starvationDeaths} | ${r.endReason}`);
}
console.log('--- control ---');
for (const s of seeds) {
  const r = rows.before[s];
  if (!r) { console.log(`${s} | MISSING`); continue; }
  console.log(`${s} | ${r.daysAlive} | ${r.atHaven} ${r.inside} ${r.rate === null ? 'null' : r.rate.toFixed(2)} | ${r.m1Pass} | ${r.tapDays} ${r.insideTaps} | ${r.m2Pass} | ${r.morningsInside}/${r.mornings} | ${r.starvationDeaths} | ${r.endReason}`);
}
console.log('--- verdict ---');
console.log(JSON.stringify(verdict, null, 2));
if (outFile) fs.writeFileSync(outFile, JSON.stringify(analysis, null, 2) + '\n');
