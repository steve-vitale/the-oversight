#!/usr/bin/env node
// vetformation-analyze.js — the judge for sim-vetformation (run
// fleshout-20261023T1215Z, axis scale-onramp). Reads the 32 per-seed
// JSONs (evidence/2026-10-23/perseed-vetformation/{control,vetformation}/)
// and judges the pre-registered bars from the arm brief:
//
//   PRIMARY (binding, §14): distinct wave-4+ killer vids read DIRECTLY
//     from state.waveKillLog (the vetkill-autopsy method — the killdisc
//     wrapper missed these), summed over the 16 seed-policy pairs:
//     armed(VETFORMATION=1) >= control + 3. A miss is NO-GO, never
//     re-scored.
//   ENGAGEMENT: >=6/8 seeds have >=1 armed wave-4 fight with >=2
//     companions committed by the policy's staging (vfTele.w4FightsFormed2
//     >= 1 — the fight trace proves it fired).
//   GUARDRAILS: median survival paired diff >= -15d; starvation <=
//     control+2; no new death kinds; wall (national/table/wins, wave4/5,
//     median survival) reported for both arms.
//   SECONDARY (reported): damage-majority villager wave-4 kills
//     (killTimeVillager && dmgMaj, the feastdisc-confirm convention).
//
// Usage: node scripts/vetformation-analyze.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-23', 'perseed-vetformation');

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
function w4vids(r) {
  const s = new Set();
  for (const e of (r.waveKillLog || [])) {
    if ((e.w | 0) >= 4 && e.by) s.add(e.by);
  }
  return s;
}
function w4vidsNonScholar(r) {
  const s = new Set();
  const sv = r.scholarVid;
  for (const e of (r.waveKillLog || [])) {
    if ((e.w | 0) >= 4 && e.by && e.by !== sv && e.by !== 'player') s.add(e.by);
  }
  return s;
}
function median(xs) {
  if (!xs.length) return 0;
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const C = load('control'), A = load('vetformation');
const key = (r) => r.seed + '|' + r.base;
const cMap = new Map(C.map(r => [key(r), r]));
const pairs = A.map(a => ({ a, c: cMap.get(key(a)) })).filter(p => p.c);
console.log(`configs: control=${C.length} armed=${A.length} pairs=${pairs.length}`);

let anchorBad = 0;
for (const r of C.concat(A)) if (!r.anchorCommit || r.anchorCommit === 'unknown') anchorBad++;
console.log(`anchor check: ${anchorBad} configs with missing anchor (${[...new Set(C.concat(A).map(r => r.anchorCommit))].join(',')})`);

// ---- PRIMARY: distinct wave-4+ killer vids (waveKillLog direct read) ----
let cV = 0, aV = 0, cVNS = 0, aVNS = 0;
const pairRows = [];
for (const { a, c } of pairs) {
  const cv = w4vids(c), av = w4vids(a);
  const cvn = w4vidsNonScholar(c), avn = w4vidsNonScholar(a);
  cV += cv.size; aV += av.size; cVNS += cvn.size; aVNS += avn.size;
  pairRows.push({ seed: a.seed, base: a.base, c: [...cv], a: [...av], cns: cv.size && [...cvn], ans: [...avn] });
}
console.log('\n== PRIMARY (binding): distinct wave-4+ killer vids, waveKillLog direct ==');
console.log(`control: ${cV} distinct vids (non-scholar ${cVNS})`);
console.log(`armed:   ${aV} distinct vids (non-scholar ${aVNS})`);
console.log(`GO = armed >= control+3 -> ${aV >= cV + 3 ? 'GO' : 'NO-GO'}`);
for (const p of pairRows) {
  if (p.a.length || p.c.length) {
    console.log(`  s${p.seed} ${p.base}: ctrl=[${p.c.join(',') || '-'}] armed=[${p.a.join(',') || '-'}]`);
  }
}

// ---- ENGAGEMENT: >=6/8 seeds, >=1 armed w4 fight with >=2 formed comps ----
const seeds = [...new Set(A.map(r => r.seed))].sort((x, y) => x - y);
let engSeeds = 0;
console.log('\n== ENGAGEMENT (>=6/8 seeds with a formed wave-4 fight) ==');
for (const s of seeds) {
  const cfgs = A.filter(r => r.seed === s);
  const formed = cfgs.reduce((x, r) => x + (((r.vfTele || {}).w4FightsFormed2) | 0), 0);
  const w4f = cfgs.reduce((x, r) => x + (((r.vfTele || {}).w4Fights) | 0), 0);
  const commits = cfgs.reduce((x, r) => x + (((r.vfTele || {}).formationCommits) | 0), 0);
  const ok = formed >= 1;
  if (ok) engSeeds++;
  console.log(`  s${s}: w4Fights=${w4f} formed2=${formed} formationCommits=${commits} -> ${ok ? 'ENGAGED' : '-'}`);
}
console.log(`engagement: ${engSeeds}/${seeds.length} seeds -> ${engSeeds >= 6 ? 'GO' : 'NO-GO'}`);

// ---- GUARDRAILS ----
const survDiffs = pairs.map(({ a, c }) => (a.gameDays | 0) - (c.gameDays | 0));
const medDiff = median(survDiffs);
console.log('\n== GUARDRAILS ==');
console.log(`median survival paired diff: ${medDiff.toFixed(1)}d (bar >= -15d) -> ${medDiff >= -15 ? 'PASS' : 'FAIL'}`);
const cStarv = C.reduce((x, r) => x + (r.starvation | 0), 0);
const aStarv = A.reduce((x, r) => x + (r.starvation | 0), 0);
console.log(`starvation deaths: control=${cStarv} armed=${aStarv} (bar <= control+2) -> ${aStarv <= cStarv + 2 ? 'PASS' : 'FAIL'}`);
const cCauses = new Set(), aCauses = new Set();
for (const r of C) for (const k of Object.keys(r.deaths || {})) cCauses.add(k);
for (const r of A) for (const k of Object.keys(r.deaths || {})) aCauses.add(k);
const newKinds = [...aCauses].filter(k => !cCauses.has(k));
console.log(`new death kinds on armed: ${newKinds.length ? newKinds.join(', ') : 'none'} -> ${newKinds.length ? 'FAIL' : 'PASS'}`);

// ---- SECONDARY: damage-majority villager kills ----
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

// ---- formation trace summary ----
console.log('\n== FORMATION TRACE (armed) ==');
for (const r of A) {
  const t = r.vfTele || {};
  console.log(`  s${r.seed} ${r.base}: formationDays=${t.formationDays | 0} commits=${t.formationCommits | 0} holds=${t.holds | 0} softens=${t.softens | 0} w4Fights=${t.w4Fights | 0}`);
}

// ---- VERDICT ----
const primaryGo = aV >= cV + 3;
const engGo = engSeeds >= 6;
const guardOk = medDiff >= -15 && aStarv <= cStarv + 2 && newKinds.length === 0;
console.log('\n== VERDICT ==');
console.log(`PRIMARY ${primaryGo ? 'GO' : 'NO-GO'} | ENGAGEMENT ${engGo ? 'GO' : 'NO-GO'} | GUARDRAILS ${guardOk ? 'PASS' : 'FAIL'}`);
console.log(`OVERALL: ${primaryGo && engGo && guardOk ? 'GO' : 'NO-GO'}`);
