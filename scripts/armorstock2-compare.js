#!/usr/bin/env node
// scripts/armorstock2-compare.js — §15 before/after comparison for
// sim-armorstock2 (the armorbreak NAMED RETRY).
//
// §15 DEVIATION (same pattern as sim-armorstock, sim-shellcounter-b): the
// official balance-panel driver cannot express the pre-registered PRIMARY —
// the 23-metric contract has no deferral-margin, reserve, or scholar-armor
// metrics. The official panel (armorstock2-panel-compare.md) covers the
// contract metrics; THIS script runs the paired statistics on the
// pre-registered primary/secondary/guardrails directly from the sweep's
// per-seed JSONs and writes the compare .md attached to the evidence.
//
// Reads evidence/2026-10-18/perseed-armorstock2/*.json (control-*.json,
// armed-*.json), pairs by seed+policy, and reports:
//   PRIMARY: median paired deferral-margin delta on qualifying pairs
//     (both deferred AND neither won — non-winning pairs per the w5reach
//     lesson), GO >= +1.0 piece, >= 6 qualifying pairs.
//   SECONDARY: all-pairs median delta; deferral coverage; wave-4 unlock
//     share (contact check); leg engagement; wall numbers.
//   GUARDRAILS: new death modes (cause-canonicalized), median survival
//     (harness days), wins, villager (non-scholar) combat deaths (§14c).
//
// Usage: node scripts/armorstock2-compare.js
// Writes: evidence/2026-10-18/armorstock2-compare-20261018.md
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-armorstock2');
const OUT = path.join(__dirname, '..', 'evidence', '2026-10-18', 'armorstock2-compare-20261018.md');

function load() {
  const rows = [];
  for (const f of fs.readdirSync(DIR)) {
    if (!f.endsWith('.json')) continue;
    try { rows.push(JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'))); }
    catch (e) { console.error('skip ' + f); }
  }
  return rows.filter(r => !r.crashed);
}

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort((x, y) => x - y);
  return s[Math.floor(s.length / 2)];
}

function main() {
  const rows = load();
  const pairs = [];
  const key = r => `${r.policyId}-s${r.seed}`;
  const byKey = {};
  for (const r of rows) byKey[`${r.arm}:${key(r)}`] = r;
  for (const r of rows.filter(x => x.arm === 'control')) {
    const a = byKey[`armed:${key(r)}`];
    if (a) pairs.push({ control: r, armed: a, key: key(r) });
  }

  // PRIMARY pairs: both have a deferral read AND neither won.
  const qual = pairs.filter(p =>
    p.control.deferralArmorMargin != null && p.armed.deferralArmorMargin != null &&
    !p.control.won && !p.armed.won);
  const deltas = qual.map(p => p.armed.deferralArmorMargin - p.control.deferralArmorMargin);
  const medDelta = median(deltas);
  const measurable = qual.length >= 6;
  const go = measurable && medDelta != null && medDelta >= 1.0;
  const verdict = !measurable
    ? 'UNMEASURABLE (<6 qualifying pairs — pre-registered measurability floor; file the census as the diagnostic)'
    : (go ? 'GO' : 'NO-GO');

  // SECONDARY: all pairs with both deferred (incl. winning runs).
  const allP = pairs.filter(p => p.control.deferralArmorMargin != null && p.armed.deferralArmorMargin != null);
  const allD = allP.map(p => p.armed.deferralArmorMargin - p.control.deferralArmorMargin);

  const L = [];
  L.push('# sim-armorstock2 — balanced before/after (§15-deviation compare)');
  L.push('');
  L.push(`pairs: ${pairs.length} (control+armed on identical seeds x {leadseat, belongseat})`);
  L.push('');
  L.push('## PRIMARY (binding): paired deferral-margin delta, qualifying (non-winning, both-deferred) pairs');
  L.push('');
  L.push(`qualifying pairs: ${qual.length}/16 — ${qual.map(p => p.key).join(', ') || 'none'}`);
  L.push(`per-pair deltas (armed − control margin pieces): [${deltas.join(', ')}]`);
  L.push(`median paired delta: ${medDelta == null ? 'n/a' : medDelta.toFixed(2)} (GO needs >= +1.0, >= 6 pairs)`);
  L.push(`**verdict: ${verdict}**`);
  L.push('');
  L.push('## SECONDARY (report-only)');
  L.push('');
  L.push(`all-pairs median delta (incl. winning runs): ${median(allD) == null ? 'n/a' : median(allD).toFixed(2)} (n=${allD.length})`);
  const cov = a => rows.filter(r => r.arm === a && r.deferralArmorMargin != null).length;
  L.push(`deferral coverage: control ${cov('control')}/16, armed ${cov('armed')}/16`);
  const w4 = a => rows.filter(r => r.arm === a && (r.maxWaveUnlocked || 1) >= 4).length;
  L.push(`wave-4 unlock share (contact check): control ${w4('control')}/16, armed ${w4('armed')}/16`);
  const wins = a => rows.filter(r => r.arm === a && r.won).length;
  L.push(`wins: control ${wins('control')}/16, armed ${wins('armed')}/16`);
  const nat = a => rows.filter(r => r.arm === a && r.national).length;
  L.push(`national: control ${nat('control')}/16, armed ${nat('armed')}/16`);
  L.push('');
  L.push('### leg engagement (armed, 16 runs)');
  const sum = k => rows.filter(r => r.arm === 'armed').reduce((t, r) => t + ((r.armorstockCounters && r.armorstockCounters[k]) | 0), 0);
  L.push(`recovered=${sum('asRecovered')} crafted=${sum('asCrafted')} (tries ${sum('asCraftTries')}, fails ${sum('asCraftFails')}) wore=${sum('asWore')} successions=${sum('asSuccessions')} recoveryTries=${sum('asRecoveryTries')}`);
  const rp = rows.filter(r => r.arm === 'armed').map(r => (r.armorstockCounters && r.armorstockCounters.asReservePeak) | 0);
  L.push(`reservePeak total=${rp.reduce((a, b) => a + b, 0)}`);
  const resNow = a => { const rs = rows.filter(r => r.arm === a && r.reserveNow != null).map(r => r.reserveNow); return median(rs); };
  const spNow = a => { const rs = rows.filter(r => r.arm === a && r.scholarPNow != null).map(r => r.scholarPNow); return median(rs); };
  L.push(`median reserve (trophy in scholar pack, end): control ${resNow('control')} vs armed ${resNow('armed')}`);
  L.push(`median scholar worn P (end): control ${spNow('control')} vs armed ${spNow('armed')}`);
  L.push('');
  L.push('## GUARDRAILS');
  L.push('');
  const starv = a => rows.filter(r => r.arm === a).reduce((t, r) => t + (r.deaths ? r.deaths.starv : 0), 0);
  L.push(`starvation deaths: control ${starv('control')} vs armed ${starv('armed')}`);
  const medD = a => median(rows.filter(r => r.arm === a).map(r => r.days));
  L.push(`median survival (harness days): control ${medD('control')} vs armed ${medD('armed')} (kill if armed < control−10)`);
  const medG = a => median(rows.filter(r => r.arm === a).map(r => r.gameDays));
  L.push(`median gameDays (report-only; vetrel clock-stall confounds): control ${medG('control')} vs armed ${medG('armed')}`);
  const vc = a => rows.filter(r => r.arm === a).reduce((t, r) => t + (r.deaths ? r.deaths.villagerCombat : 0), 0);
  L.push(`villager (non-scholar) combat deaths (§14c co-primary): control ${vc('control')} vs armed ${vc('armed')} (kill if armed > control×1.25 = ${(vc('control') * 1.25).toFixed(1)})`);
  // new death modes, cause-canonicalized
  const causes = a => { const c = {}; for (const r of rows.filter(x => x.arm === a)) for (const [k, n] of Object.entries((r.deaths && r.deaths.byCause) || {})) c[k] = (c[k] || 0) + n; return c; };
  const cc = causes('control'), ca = causes('armed');
  const newModes = Object.keys(ca).filter(k => !cc[k]);
  L.push(`death causes control: ${JSON.stringify(cc)}`);
  L.push(`death causes armed: ${JSON.stringify(ca)}`);
  L.push(`new-on-armed causes: ${newModes.length ? newModes.map(k => `${k}:${ca[k]}`).join(', ') : 'none'}`);
  L.push('');
  L.push('## §15 deviation noted');
  L.push('Official balance-panel driver cannot express the pre-registered PRIMARY (the 23-metric contract has no deferral-margin, reserve, or scholar-armor metrics); paired statistics above run on the pre-registered metrics directly. The official panel compare (armorstock2-panel-compare.md) covers the contract metrics as the guardrail instrument.');
  fs.writeFileSync(OUT, L.join('\n') + '\n');
  console.log(L.join('\n'));
}

main();
