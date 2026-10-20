#!/usr/bin/env node
// analyze-vgearbeats-20261020.js — judges the sim-vgearbeats corpus.
//
// Reads evidence/2026-10-20/perseed-vgearbeats/*.json and reports:
//   COVERAGE (primary, stretch-level per design call #1 in vgearbeats.js):
//     donation: epochs-with-donations beaten / epochs-with-donations
//     invite:   (episode,vid) pairs beaten / pairs with accepted invites
//     yield:    fights-with-yield beaten / fights-with-yield
//     overall: beaten stretches / stretches with events  (GO bar: >= 0.75)
//   plus raw occurrence-level ratios (beats / layer-counter) for transparency.
//   GUARDRAILS: zero same-stretch repeats; say-stream visibility
//     (beatLinesSay == beats counters); behavior-neutral det-gate
//     (trajHash identical on paired seeds); beatErrors == 0.
//   WALL: national/table/wins/wave reach/survival/death causes per arm.
// Usage: node scripts/analyze-vgearbeats-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-vgearbeats');

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json') && !f.startsWith('_summary'));
const recs = files.map(f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
const byKey = {};
for (const r of recs) {
  const m = r.policy.match(/^(leadfeast|belongfeast)/);
  byKey[`${r.seed}/${m ? m[1] : r.policy}`] = byKey[`${r.seed}/${m ? m[1] : r.policy}`] || {};
  byKey[`${r.seed}/${m ? m[1] : r.policy}`][r.arm] = r;
}

function stretchCover(r) {
  // donation: attribute each day's donation delta to that day's epoch.
  const epDon = {};
  let lastDon = 0;
  for (const d of (r.dailySeries || [])) {
    const delta = (d.vgDon | 0) - lastDon; lastDon = d.vgDon | 0;
    if (delta > 0 && (d.donEpoch | 0) > 0) epDon[d.donEpoch | 0] = (epDon[d.donEpoch | 0] || 0) + delta;
  }
  const epochsWithDon = Object.keys(epDon);
  const firedDonKeys = r.firedDonKeys || [];
  const donBeatenWithDon = epochsWithDon.filter(e => firedDonKeys.includes(e)).length;
  // invite: (stageEp, pickVid) on days with invite delta.
  const pairs = new Set(); let lastInv = 0;
  for (const d of (r.dailySeries || [])) {
    const delta = (d.vgInv | 0) - lastInv; lastInv = d.vgInv | 0;
    if (delta > 0 && d.pickVid) pairs.add(`${d.stageEp | 0}:${d.pickVid}`);
  }
  const pairsBeaten = new Set(r.firedInvKeys || []);
  let pairHit = 0; for (const p of pairs) if (pairsBeaten.has(p)) pairHit++;
  // yield: fights with yield vs yield beats (each beat = distinct fight).
  const yFights = r.yieldFights | 0, yBeats = r.beatsYield | 0;
  return {
    epDon, epochsWithDon: epochsWithDon.length,
    donBeaten: (r.donEpochsBeaten | 0), donBeatenWithDon,
    pairsWithInv: pairs.size, pairsBeatenHit: pairHit, pairsBeatenTotal: pairsBeaten.size,
    yFights, yBeats,
  };
}

let covNum = 0, covDen = 0, occB = 0, occE = 0;
let guardFails = [];
const wall = { vgear: [], vbeats: [] };
console.log('seed/policy: donCov invCov yldCov | occDon occInv occYld | say==beats err');
for (const key of Object.keys(byKey).sort()) {
  const arms = byKey[key];
  const b = arms.vbeats;
  if (!b) { console.log(`${key}: MISSING vbeats arm`); continue; }
  const s = stretchCover(b);
  const donC = s.epochsWithDon ? s.donBeatenWithDon / s.epochsWithDon : null;
  const invC = s.pairsWithInv ? s.pairsBeatenHit / s.pairsWithInv : null;
  const yldC = s.yFights ? s.yBeats / s.yFights : null;
  for (const [c, w] of [[donC, s.epochsWithDon], [invC, s.pairsWithInv], [yldC, s.yFights]]) {
    if (c !== null) { covNum += c * w; covDen += w; }
  }
  const oD = b.vgDonations ? b.beatsDon / b.vgDonations : null;
  const oI = b.vgInvitesOk ? b.beatsInv / b.vgInvitesOk : null;
  const oY = b.vgYields ? b.beatsYield / b.vgYields : null;
  occB += b.beatsDon + b.beatsInv + b.beatsYield;
  occE += b.vgDonations + b.vgInvitesOk + b.vgYields;
  const sayOk = b.beatLinesSay === (b.beatsDon + b.beatsInv + b.beatsYield);
  if (!sayOk) guardFails.push(`${key}: say-stream mismatch (say=${b.beatLinesSay} beats=${b.beatsDon + b.beatsInv + b.beatsYield})`);
  if ((b.beatErrors | 0) !== 0) guardFails.push(`${key}: beatErrors=${b.beatErrors}`);
  // same-stretch repeat guard: every fired epoch count must be 1
  for (const [ek, ev] of Object.entries(b.firedDonCounts || {})) {
    if (ev !== 1) guardFails.push(`${key}: epoch ${ek} beaten ${ev}x (repeat!)`);
  }
  console.log(`${key}: don ${s.donBeatenWithDon}/${s.epochsWithDon} inv ${s.pairsBeatenHit}/${s.pairsWithInv} yld ${s.yBeats}/${s.yFights} | ` +
    `${oD === null ? '-' : oD.toFixed(2)} ${oI === null ? '-' : oI.toFixed(2)} ${oY === null ? '-' : oY.toFixed(2)} | sayOk=${sayOk} err=${b.beatErrors}`);
  wall.vgear.push(arms.vgear); wall.vbeats.push(b);
}
// det-gate: paired trajectory hashes
let detOk = 0, detTotal = 0;
for (const key of Object.keys(byKey).sort()) {
  const arms = byKey[key];
  if (!arms.vgear || !arms.vbeats) continue;
  detTotal++;
  if (arms.vgear.trajHash === arms.vbeats.trajHash) detOk++;
  else console.log(`DET-MISMATCH ${key}: vgear=${arms.vgear.trajHash.slice(0, 12)} vbeats=${arms.vbeats.trajHash.slice(0, 12)}`);
}
console.log(`\nPRIMARY (stretch coverage): ${(covNum / Math.max(1, covDen)).toFixed(3)} over ${covDen} stretches (bar >= 0.75)`);
console.log(`occurrence-level (transparency): ${(occB / Math.max(1, occE)).toFixed(3)} (${occB}/${occE})`);
console.log(`det-gate (trajectory-identical pairs): ${detOk}/${detTotal}`);
console.log(`guardrail failures: ${guardFails.length}${guardFails.length ? ' -> ' + guardFails.join('; ') : ''}`);
// wall numbers
for (const arm of ['vgear', 'vbeats']) {
  const rs = wall[arm].filter(Boolean);
  const sum = k => rs.reduce((t, r) => t + (r[k] | 0), 0);
  const days = rs.map(r => r.gameDays | 0).sort((a, b) => a - b);
  const med = days.length ? days[Math.floor(days.length / 2)] : 0;
  console.log(`wall ${arm}: n=${rs.length} national=${sum('national')} table=${sum('table')} won=${sum('won')} ` +
    `wave4=${sum('wave4')} wave5=${sum('wave5')} w4villagerKills=${sum('w4villagerKills')} medDays=${med}`);
}
