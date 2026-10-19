#!/usr/bin/env node
// analyze-leanclass-b.js — lean-regime divergence census (arm sim-leanclass-b).
//
// Usage: node scripts/analyze-leanclass-b.js <dir-with-4-sweep-jsons> [out.json]
//
// Per seed×policy pair it reads the per-dawn trajectory fingerprints and the
// governor call-site logs from both twins, then:
//   - onset: first dawn whose fingerprint differs between the twins.
//   - firstTrimDay (armed), firstWouldDay (control, read-only condition).
//   - channel: governor-effect | artifact | identical-no-trim | identical.
//   - lean-window trims (fire-time freshDays <= 4) — pre-registered bar: 0.
//   - Class L (lean-divergence pair): min(days) < 120.
// Judges the pre-registered attribution bar in evidence/2026-10-18/sim-leanclass-b.md.
'use strict';
const fs = require('fs'), path = require('path');

const dir = process.argv[2] || 'evidence/2026-10-18/perseed-leanclass-b';
const out = process.argv[3] || null;

function load(side, policy) {
  const f = path.join(dir, `sweep-${side}-${policy}.json`);
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

function onset(fpC, fpA) {
  const n = Math.min(fpC.length, fpA.length);
  for (let i = 0; i < n; i++) {
    if (JSON.stringify(fpC[i]) !== JSON.stringify(fpA[i])) return fpC[i].day;
  }
  if (fpC.length === fpA.length) return null;
  return (fpC[n] || fpA[n]).day;
}

const pairs = [];
for (const policy of ['leadfeast', 'belongfeast']) {
  const c = load('control', policy), a = load('armed', policy);
  const am = {};
  for (const r of a.rows) am[r.seed] = r;
  for (const r of c.rows) {
    const ar = am[r.seed];
    if (!ar) { console.error('missing armed pair for seed ' + r.seed + ' ' + policy); continue; }
    pairs.push({ seed: r.seed, policy, c: r.end, a: ar.end, lc: r.lean, la: ar.lean });
  }
}

const perPair = [];
let artifactPairs = 0, leanWindowTrims = 0, classL = 0;
const channelCounts = { 'governor-effect': 0, artifact: 0, 'identical-no-trim': 0, 'identical-despite-trims': 0 };
const classLChannels = { 'governor-effect': 0, artifact: 0, 'identical-no-trim': 0, 'identical-despite-trims': 0 };
let wouldSanityMisses = 0;

for (const p of pairs) {
  const on = onset(p.lc.fps, p.la.fps);
  const ft = p.la.firstTrimDay;
  const fw = p.lc.firstWouldDay;
  const govTrimLog = (p.la.govLog || []).filter(g => g.trim);
  const leanWins = govTrimLog.filter(g => g.fireFd <= 4);
  const spikes = govTrimLog.filter(g => g.fireFd > 4 && g.dawnFd <= 4);
  leanWindowTrims += leanWins.length;
  if (ft !== null && fw !== null && ft !== fw) wouldSanityMisses++;
  if (ft !== null && fw === null) wouldSanityMisses++; // armed trimmed but control "never would" — determinism flag

  let channel;
  if (ft === null) {
    channel = (on === null) ? 'identical-no-trim' : 'artifact';
  } else {
    if (on === null) channel = 'identical-despite-trims';
    else if (on <= ft) channel = 'artifact';
    else channel = 'governor-effect';
  }
  if (channel === 'artifact') artifactPairs++;
  channelCounts[channel]++;

  const isL = Math.min(p.c.days, p.a.days) < 120;
  if (isL) { classL++; classLChannels[channel]++; }

  // death-cause attribution around the first trim (Class L interest)
  const causeSplit = { preC: {}, postC: {}, preA: {}, postA: {} };
  const bump = (m, d) => { m[d.cause] = (m[d.cause] || 0) + 1; };
  for (const d of (p.c.deaths || [])) bump(ft === null || d.day <= ft ? causeSplit.preC : causeSplit.postC, d);
  for (const d of (p.a.deaths || [])) bump(ft === null || d.day <= ft ? causeSplit.preA : causeSplit.postA, d);

  perPair.push({
    seed: p.seed, policy: p.policy,
    daysC: p.c.days, daysA: p.a.days, endC: p.c.endReason, endA: p.a.endReason,
    classL: isL, channel, onsetDay: on, firstTrimDay: ft, firstWouldDay: fw,
    wouldSanityOk: !(ft !== null && fw !== ft),
    trims: govTrimLog.length, leanWindowTrims: leanWins.length,
    intraDaySpikes: spikes.length,
    rotC: Math.round(p.c.rotFresh / 1000) + 'k', rotA: Math.round(p.a.rotFresh / 1000) + 'k',
    shareC: Math.round(p.c.shareSurplus / 1000) + 'k', shareA: Math.round(p.a.shareSurplus / 1000) + 'k',
    starveC: p.c.starveDays, starveA: p.a.starveDays,
    glutC: p.c.glutDays, glutA: p.a.glutDays,
    causeSplit,
  });
}

const med = xs => { const s = xs.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const rep = {
  pairs: pairs.length,
  attribution: {
    artifactPairs, artifactBar: 0, artifactOk: artifactPairs === 0,
    leanWindowTrims, leanWindowBar: 0, leanWindowOk: leanWindowTrims === 0,
    wouldSanityMisses,
  },
  channels: channelCounts,
  classL: { total: classL, channels: classLChannels,
    governorEffectShare: classL ? +(classLChannels['governor-effect'] / classL).toFixed(3) : null },
  wall: {
    national: pairs.map(p => p.a.nationalLive).filter(Boolean).length + '/' + pairs.length,
    table: pairs.map(p => p.a.tableWaiting).filter(Boolean).length + '/' + pairs.length,
    wins: pairs.map(p => p.a.won).filter(Boolean).length + '/' + pairs.length,
    wave4: pairs.map(p => p.a.maxWave >= 4).filter(Boolean).length + '/' + pairs.length,
    wave5: pairs.map(p => p.a.maxWave >= 5).filter(Boolean).length + '/' + pairs.length,
    medianSurvivalArmed: med(pairs.map(p => p.a.days)),
    medianSurvivalControl: med(pairs.map(p => p.c.days)),
    maxSurvival: Math.max(...pairs.map(p => Math.max(p.a.days, p.c.days))),
  },
  survivalDelta: pairs.map(p => ({ seed: p.seed, policy: p.policy, delta: p.a.days - p.c.days })),
  perPair,
};
console.log(JSON.stringify(rep, null, 1));
if (out) fs.writeFileSync(out, JSON.stringify(rep, null, 1) + '\n');
console.log('ARTIFACT-PAIRS: ' + artifactPairs + ' (bar 0) | LEAN-WINDOW-TRIMS: ' + leanWindowTrims +
  ' (bar 0) | CLASS-L: ' + classL + ' pairs');
