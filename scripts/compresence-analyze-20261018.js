#!/usr/bin/env node
// compresence-analyze-20261018.js — presence-channel analysis for
// sim-compresence (2026-10-18, axis scale-onramp).
//
// Reads evidence/2026-10-18/perseed-compresence/*.json and prints:
//   1. per-kill attribution table (channel, shape, mechanism evidence)
//   2. channel totals overall + per fight-shape (raid vs haven-TB vs wild)
//   3. join-rate context from ALL wave-3 fight-starts (not just kills)
//   4. the (f) mechanism breakdown: door-side split, stale-position share,
//      scholar inside/outside distribution
//   5. anomaly probes (in-radius non-joiners, party-in-radius non-joiners)
//
// Usage: node scripts/compresence-analyze-20261018.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-18', 'perseed-compresence');

const files = fs.readdirSync(EVID).filter(x => x.endsWith('.json') && !x.startsWith('_')).sort();
const rows = [];
for (const fn of files) {
  try { rows.push({ fn, row: JSON.parse(fs.readFileSync(path.join(EVID, fn), 'utf8')) }); }
  catch (e) { console.error('SKIP ' + fn + ': ' + e.message); }
}

const kills = [];
for (const { fn, row } of rows) {
  for (const k of (row.kills || [])) kills.push({ fn, policy: row.policyId, seed: row.seed, k });
}
kills.sort((a, b) => a.k.day - b.k.day);

console.log(`runs=${rows.length} wave-3-killing-fights=${kills.length}`);
console.log('');
console.log('=== 1. ATTRIBUTION TABLE ===');
console.log('day  pol seed   monster            shape     ch  comp/sch dmg  mechanism');
for (const { policy, seed, k } of kills) {
  const d = k.dmg || {};
  const mech = summarizeMech(k);
  console.log(
    String(k.d).padStart(3) + '  ' + policy.slice(0, 4) + ' s' + seed +
    '  ' + String(k.mid).padEnd(18) + ' ' + String(k.shape).padEnd(9) +
    ' ' + k.channel + '   ' + String(d.companion | 0).padStart(4) + '/' + String(d.scholar | 0).padStart(4) +
    '  ' + mech
  );
}

console.log('');
console.log('=== 2. CHANNEL TOTALS ===');
const tot = {};
for (const { k } of kills) tot[k.channel] = (tot[k.channel] | 0) + 1;
console.log('overall: ' + JSON.stringify(tot));
const byShape = {};
for (const { k } of kills) {
  byShape[k.shape] = byShape[k.shape] || {};
  byShape[k.shape][k.channel] = (byShape[k.shape][k.channel] | 0) + 1;
}
for (const s of Object.keys(byShape).sort()) console.log('  ' + s + ': ' + JSON.stringify(byShape[s]));

console.log('');
console.log('=== 3. JOIN-RATE CONTEXT (all wave-3 fight-starts, kills or not) ===');
let fs3 = 0, fsJoin = 0, fsJoinDmg = 0;
const joinByShape = {};
for (const { row } of rows) {
  for (const f of (row.fights || [])) {
    fs3++;
    if ((f.joiners || []).length) {
      fsJoin++;
      const sh = 'tb'; // fight-start shape not recorded; kills carry shape
      joinByShape[sh] = (joinByShape[sh] | 0) + 1;
    }
  }
}
console.log(`wave-3 TB fight-starts=${fs3} with-joiners=${fsJoin} (${(100 * fsJoin / Math.max(1, fs3)).toFixed(1)}%)`);

// scholar location at wave-3 fight-starts
let atHaven = 0, inside = 0;
for (const { row } of rows) {
  for (const f of (row.fights || [])) {
    if (f.scholar && f.scholar.atHaven) atHaven++;
    if (f.scholar && f.scholar.insideHaven) inside++;
  }
}
console.log(`scholar at haven in ${atHaven}/${fs3} fight-starts; inside hall in ${inside}/${fs3}`);

console.log('');
console.log('=== 4. (f) MECHANISM BREAKDOWN ===');
// For channel-f kills: door-side split of same-node companions, stale
// positions, scholar inside/outside.
let fN = 0, fSchOutside = 0, fSchInside = 0;
let sameNodeTot = 0, doorBlocked = 0, nullPos = 0, farPos = 0, nearPos = 0;
for (const { k } of kills) {
  if (k.channel !== 'f') continue;
  fN++;
  const ev = k.channelEvidence || {};
  // scholar location comes with the kill row now (startScholar).
  const ss = k.startScholar || null;
  if (ss) {
    if (ss.insideHaven) fSchInside++; else fSchOutside++;
  }
  for (const n of (ev.nearest || [])) {
    sameNodeTot++;
    if (n.sideMatch === false) doorBlocked++;
    else if (n.gridDist == null) nullPos++;
    else if (n.gridDist > 4) farPos++;
    else nearPos++;
  }
}
console.log(`channel-f kills=${fN}: scholar outside hall in ${fSchOutside}, inside in ${fSchInside}`);
console.log(`same-node companions (nearest-4 per fight): door-blocked=${doorBlocked} no-grid-pos=${nullPos} beyond-radius=${farPos} in-radius=${nearPos} (total ${sameNodeTot})`);

console.log('');
console.log('=== 5. ANOMALY PROBES ===');
let anomParty = 0, anomRadius = 0;
for (const { k } of kills) {
  const ev = k.channelEvidence || {};
  anomParty += (ev.partyInRadiusNotJoined || []).length;
  anomRadius += (ev.inRadiusNotJoined || []).length;
}
console.log(`party-in-radius-not-joined=${anomParty}; in-radius-not-joined (f)=${anomRadius} (nonzero = join-rule violation — LOUD)`);

console.log('');
console.log('=== 6. RAID ENGAGEMENTS (fieldFights, wave-3+) ===');
let ff = 0, ffKills = 0;
for (const { row } of rows) {
  for (const r of (row.fieldFights || [])) {
    ff++;
    if (r.outcome === 'vKill') ffKills++;
  }
}
console.log(`wave-3+ fieldFights=${ff}, vKill=${ffKills}`);

function summarizeMech(k) {
  const ev = k.channelEvidence || {};
  if (k.channel === 'a' || k.channel === 'b') {
    return (ev.joiners || []).map(j => `${j.name}(${j.ai||'?'}):dist${j.dist} dmg${j.dmg}`).join('; ') || 'no joiner detail';
  }
  if (k.channel === 'c') {
    return 'party: ' + (ev.party || []).map(p => `${p.name}@${p.sameNode ? 'same-node' : p.node.nx + ',' + p.node.ny}${p.gridDist != null ? ' d' + p.gridDist : ''}${p.side ? ' ' + p.side : ''}`).join('; ');
  }
  if (k.channel === 'd') return `roster ${ev.rosterStart | 0} -> 0`;
  if (k.channel === 'e') {
    return `scholar@${(ev.scholarNode || {}).nx},${(ev.scholarNode || {}).ny} companions@${JSON.stringify(ev.nodeDist || {})}`;
  }
  if (k.channel === 'f') {
    const near = ev.nearest || [];
    const door = near.filter(n => n.sideMatch === false).length;
    const nullp = near.filter(n => n.sideMatch !== false && n.gridDist == null).length;
    const far = near.filter(n => n.gridDist != null && n.gridDist > 4).length;
    return `same-node ${ev.sameNodeCount | 0}: door-blocked ${door}, no-pos ${nullp}, beyond-4 ${far}`;
  }
  return k.channelNote || '?';
}

console.log('');
console.log('=== 7. DIAG-GO CHECK ===');
let unattributed = 0;
const perRun = {};
for (const { fn, policy, seed, k } of kills) {
  perRun[fn] = perRun[fn] || { total: 0, attr: 0 };
  perRun[fn].total++;
  if (/^[abcdef]$/.test(k.channel) && k.channelNote && k.channelEvidence) perRun[fn].attr++;
  else unattributed++;
}
const runIds = Object.keys(perRun);
const fullyAttr = runIds.filter(r => perRun[r].attr === perRun[r].total).length;
// Runs with zero wave-3 killing fights are vacuously attributed — but they
// must be reported, not hidden: the metric counts them as attributed.
const zeroKillRuns = rows.length - runIds.length;
console.log(`runs with kills, all attributed: ${fullyAttr}/${runIds.length}; zero-kill runs (vacuous): ${zeroKillRuns}; total runs attributed: ${fullyAttr + zeroKillRuns}/${rows.length} (kills unattributed: ${unattributed})`);
