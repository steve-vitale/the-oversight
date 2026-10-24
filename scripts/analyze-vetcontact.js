#!/usr/bin/env node
// analyze-vetcontact.js — the judge for sim-vetcontact (run 2026-10-24,
// axis scale-onramp). Reads the 32 per-seed JSONs
// (evidence/2026-10-24/perseed-vetcontact/{control,vetcontact}/) and
// judges the pre-registered bars from the arm brief (the evidence file's
// pre-registered header):
//
//   PRIMARY (binding, §14): wave-4+ kills per config, read DIRECTLY from
//     state.waveKillLog (the source the veterans bar reads — standing.js),
//     armed vs control, paired identical seeds, 8-seed pilot (16 configs),
//     180d death-aware. GO iff armed_total − control_total >= +4 kills
//     AND armed >= control on >=6/8 seed-pairs (seed-pair = both bases).
//     A miss is NO-GO, never re-scored.
//   ENGAGEMENT (reported): contactStages (formations staged for
//     havencontact) > 0 on >=6/8 armed configs; staged wave-4 fights
//     armed > control (vcW4FightsFormed2, union of vc+vf traces).
//   GUARDRAILS: median survival paired diff >= -10d; starvation <=
//     control+2; no new death kinds (>=2-event rule); wall block
//     (national/table/wins, wave4/5, median survival) reported for both
//     arms.
//   SECONDARY (reported): distinct wave-4+ killer vids (the vetkill-autopsy
//     sensor); damage-majority villager wave-4 kills.
//
// Usage: node scripts/analyze-vetcontact.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-24', 'perseed-vetcontact');

function load(arm) {
  const d = path.join(DIR, arm);
  const out = [];
  for (const f of fs.readdirSync(d)) {
    if (!f.endsWith('.json')) continue;
    const r = JSON.parse(fs.readFileSync(path.join(d, f), 'utf8'));
    out.push(r);
  }
  return out;
}
function w4kills(r) {
  return (r.waveKillLog || []).filter(e => (e.w | 0) >= 4).length;
}
function w4vids(r) {
  const s = new Set();
  for (const e of (r.waveKillLog || [])) {
    if ((e.w | 0) >= 4 && e.by) s.add(e.by);
  }
  return s;
}
function median(xs) {
  if (!xs.length) return 0;
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const C = load('control'), A = load('vetcontact');
const key = (r) => r.seed + '|' + r.base;
const cMap = new Map(C.map(r => [key(r), r]));
const pairs = A.map(a => ({ a, c: cMap.get(key(a)) })).filter(p => p.c);
console.log(`configs: control=${C.length} armed=${A.length} pairs=${pairs.length}`);

let anchorBad = 0;
for (const r of C.concat(A)) if (!r.anchorCommit || r.anchorCommit === 'unknown') anchorBad++;
console.log(`anchor check: ${anchorBad} configs with missing anchor (${[...new Set(C.concat(A).map(r => r.anchorCommit))].join(',')})`);

// ---- PRIMARY: wave-4+ kills per config (waveKillLog direct read) ----
let cK = 0, aK = 0;
const pairRows = [];
const seedPair = {}; // seed -> {c, a} summed over bases
for (const { a, c } of pairs) {
  const ck = w4kills(c), ak = w4kills(a);
  cK += ck; aK += ak;
  pairRows.push({ seed: a.seed, base: a.base, c: ck, a: ak });
  seedPair[a.seed] = seedPair[a.seed] || { c: 0, a: 0 };
  seedPair[a.seed].c += ck; seedPair[a.seed].a += ak;
}
let seedPairsGe = 0;
const seedPairRows = [];
for (const [seed, t] of Object.entries(seedPair)) {
  const ge = t.a >= t.c;
  if (ge) seedPairsGe++;
  seedPairRows.push({ seed, c: t.c, a: t.a, ge });
}
console.log('\n== PRIMARY (binding): wave-4+ kills, waveKillLog direct ==');
console.log(`control total: ${cK} kills`);
console.log(`armed total:   ${aK} kills`);
console.log(`delta: ${aK - cK} (bar >= +4) -> ${(aK - cK) >= 4 ? 'PASS' : 'FAIL'}`);
console.log(`seed-pairs armed >= control: ${seedPairsGe}/${Object.keys(seedPair).length} (bar >= 6/8) -> ${seedPairsGe >= 6 ? 'PASS' : 'FAIL'}`);
for (const p of pairRows) {
  console.log(`  s${p.seed} ${p.base}: ctrl=${p.c} armed=${p.a}`);
}
const primaryGo = (aK - cK) >= 4 && seedPairsGe >= 6;
console.log(`PRIMARY -> ${primaryGo ? 'GO' : 'NO-GO'}`);

// ---- ENGAGEMENT ----
const armedCfgs = A.length;
const staged = A.filter(r => ((r.vcCtx || {}).vcContactStages | 0) > 0).length;
const stagedPerConfig = A.map(r => `s${r.seed}-${r.base}:${(r.vcCtx || {}).vcContactStages | 0}`).join(' ');
console.log('\n== ENGAGEMENT ==');
console.log(`contactStages>0 on ${staged}/${armedCfgs} armed configs (bar >=6/8 configs): ${stagedCfgsOk(staged, armedCfgs) ? 'PASS' : 'FAIL'}`);
console.log(`  per-config contactStages: ${stagedPerConfig}`);
// Staged wave-4 fights: the same instrument on both arms — wave-4 fights
// with >=2 engaged companions committed by the policy's affirmed
// formation. Armed uses the vc wrapper's union counter (vc+vf traces);
// control uses vetformation's own affirmed trace (the vc beat is absent).
const cStagedF = C.reduce((x, r) => x + (((r.vfCtx || {}).vfW4FightsFormed2) | 0), 0);
const aStagedF = A.reduce((x, r) => x + (((r.vcCtx || {}).vcW4FightsFormed2) | 0), 0);
const aVcAttr = A.reduce((x, r) => x + (((r.vcCtx || {}).vcW4FightsVcFormed2) | 0), 0);
console.log(`staged wave-4 fights (union trace): control=${cStagedF} armed=${aStagedF} (bar armed > control) -> ${aStagedF > cStagedF ? 'PASS' : 'FAIL'}`);
console.log(`  of which vc-attributed (armed): ${aVcAttr}`);
const engGo = stagedCfgsOk(staged, armedCfgs) && aStagedF > cStagedF;
function stagedCfgsOk(n, d) { return n >= Math.ceil(d * 6 / 8); }

// ---- SECONDARY: distinct wave-4+ killer vids + damage-majority kills ----
let cV = 0, aV = 0;
for (const { a, c } of pairs) { cV += w4vids(c).size; aV += w4vids(a).size; }
console.log('\n== SECONDARY (reported): distinct wave-4+ killer vids ==');
console.log(`control=${cV} armed=${aV} (delta ${aV - cV})`);
let cDM = 0, aDM = 0;
const dmRows = [];
for (const { a, c } of pairs) {
  for (const r of (c.w4killRows || [])) if (r.killTimeVillager && r.dmgMaj) { cDM++; }
  for (const r of (a.w4killRows || [])) {
    if (r.killTimeVillager && r.dmgMaj) {
      aDM++;
      dmRows.push(`s${a.seed} ${a.base}: ${r.byName} d${r.day} ${r.mid} share=${r.nonScholarShare}`);
    }
  }
}
console.log('\n== SECONDARY (reported): damage-majority villager wave-4 kills ==');
console.log(`control=${cDM} armed=${aDM}`);
for (const r of dmRows) console.log('  ' + r);

// ---- GUARDRAILS ----
const survDiffs = pairs.map(({ a, c }) => (a.gameDays | 0) - (c.gameDays | 0));
const medDiff = median(survDiffs);
console.log('\n== GUARDRAILS ==');
console.log(`median survival paired diff: ${medDiff.toFixed(1)}d (bar >= -10d) -> ${medDiff >= -10 ? 'PASS' : 'FAIL'}`);
const cStarv = C.reduce((x, r) => x + (r.starvation | 0), 0);
const aStarv = A.reduce((x, r) => x + (r.starvation | 0), 0);
console.log(`starvation deaths: control=${cStarv} armed=${aStarv} (bar <= control+2) -> ${aStarv <= cStarv + 2 ? 'PASS' : 'FAIL'}`);
// no new death kinds (>=2-event rule): an armed-only kind counts only if >=2 events
const cCauses = {}, aCauses = {};
for (const r of C) for (const [k, n] of Object.entries(r.deaths || {})) cCauses[k] = (cCauses[k] || 0) + n;
for (const r of A) for (const [k, n] of Object.entries(r.deaths || {})) aCauses[k] = (aCauses[k] || 0) + n;
const newKinds = Object.keys(aCauses).filter(k => !cCauses[k] && aCauses[k] >= 2);
console.log(`new death kinds on armed (>=2 events): ${newKinds.length ? newKinds.join(', ') : 'none'} -> ${newKinds.length ? 'FAIL' : 'PASS'}`);

// ---- WALL both arms ----
function wall(rs, name) {
  const n = rs.length;
  const nat = rs.filter(r => r.national).length;
  const tab = rs.filter(r => r.table).length;
  const won = rs.filter(r => r.won).length;
  const w4 = rs.filter(r => (r.maxWave | 0) >= 4).length;
  const w5 = rs.filter(r => (r.maxWave | 0) >= 5).length;
  const med = median(rs.map(r => r.gameDays | 0));
  const max = Math.max(...rs.map(r => r.gameDays | 0));
  console.log(`${name}: national=${nat}/${n} table=${tab}/${n} wins=${won}/${n} wave4=${w4}/${n} wave5=${w5}/${n} medianSurv=${med}d maxSurv=${max}d`);
}
console.log('\n== WALL ==');
wall(C, 'control');
wall(A, 'armed');

// ---- contact-beat trace summary (armed) ----
console.log('\n== CONTACT TRACE (armed) ==');
for (const r of A) {
  const t = r.vcTele || {};
  console.log(`  s${r.seed} ${r.base}: contactDays=${t.contactDays | 0} commits=${t.contactCommits | 0} invitesOk=${t.contactInvitesOk | 0} skipWin=${t.skippedWindow | 0} skipVfHot=${t.skippedVfHot | 0} skipNoContact=${t.skippedNoContact | 0} w4Fights=${t.w4Fights | 0} formed2=${t.w4FightsFormed2 | 0}`);
}

// ---- VERDICT ----
const guardOk = medDiff >= -10 && aStarv <= cStarv + 2 && newKinds.length === 0;
console.log('\n== VERDICT ==');
console.log(`PRIMARY ${primaryGo ? 'GO' : 'NO-GO'} | ENGAGEMENT ${engGo ? 'GO' : 'NO-GO'} | GUARDRAILS ${guardOk ? 'PASS' : 'FAIL'}`);
console.log(`OVERALL: ${primaryGo && engGo && guardOk ? 'GO' : 'NO-GO'}`);
