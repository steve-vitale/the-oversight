#!/usr/bin/env node
// formthick-analyze.js — the judge for sim-formthick (flesh-out loop arm
// sim-formthick, axis scale-onramp). Reads the 32 per-seed JSONs
// (evidence/2026-10-23/perseed-formthick/{control,formthick}/) and judges
// the pre-registered bars from the arm brief:
//
//   PRIMARY (binding, §14): defer5 veterans-bar co-satisfaction — armed
//     (FORMTHICK=1) configs with 2 LIVING wave-4+ killers simultaneously
//     (state.waveKillLog DIRECT post-run, deduped on (d, mid, by, via,
//     trick) per backlog #844; living = not in deathRows.who):
//     armed >= control + 2 AND >=1 armed config satisfying.
//     A miss is NO-GO, never re-scored.
//   SECONDARY: distinct wave-4+ killer vids, per-pair sum (the formation
//     arm's PRIMARY convention — formation-alone did 10 on this band;
//     the 9-vs-10 retention-interference question, now for thickening);
//     engagement (paired slot fires: configs/days); damage-majority
//     villager kills (reported); guardrails; wall.
//
// Usage: node scripts/formthick-analyze.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'evidence', '2026-10-23', 'perseed-formthick');

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
// Dedupe on (d, mid, by, via, trick) per backlog #844 (the engine
// double-writes waveKillLog on some lost fights — the formation arm's
// sensor observation).
function dedupedW4(r) {
  const seen = new Set();
  const out = [];
  for (const e of (r.waveKillLog || [])) {
    if ((e.w | 0) < 4 || !e.by) continue;
    const k = [e.d, e.mid, e.by, e.via, e.trick].join('|');
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(e);
  }
  return out;
}
function deadSet(r) {
  const s = new Set();
  for (const d of (r.deathRows || [])) if (d.who) s.add(d.who);
  return s;
}
// Co-satisfaction: >=2 LIVING distinct wave-4+ killer vids on one config.
function coSatisfies(r) {
  const dead = deadSet(r);
  const living = new Set();
  for (const e of dedupedW4(r)) if (!dead.has(e.by)) living.add(e.by);
  return { ok: living.size >= 2, n: living.size, vids: [...living] };
}
function w4vids(r) {
  const s = new Set();
  for (const e of dedupedW4(r)) s.add(e.by);
  return s;
}
function median(xs) {
  if (!xs.length) return 0;
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const C = load('control'), A = load('formthick');
const key = (r) => r.seed + '|' + r.base;
const cMap = new Map(C.map(r => [key(r), r]));
const pairs = A.map(a => ({ a, c: cMap.get(key(a)) })).filter(p => p.c);
console.log(`configs: control=${C.length} armed=${A.length} pairs=${pairs.length}`);

let anchorBad = 0;
for (const r of C.concat(A)) if (!r.anchorCommit || r.anchorCommit === 'unknown') anchorBad++;
console.log(`anchor check: ${anchorBad} configs with missing anchor (${[...new Set(C.concat(A).map(r => r.anchorCommit))].join(',')})`);

// ---- PRIMARY (binding): co-satisfaction ----
let cCo = 0, aCo = 0;
const coRows = [];
for (const { a, c } of pairs) {
  const cr = coSatisfies(c), ar = coSatisfies(a);
  if (cr.ok) cCo++;
  if (ar.ok) aCo++;
  coRows.push({ seed: a.seed, base: a.base, c: cr, a: ar });
}
console.log('\n== PRIMARY (binding): defer5 veterans-bar co-satisfaction ==');
console.log(`control (formation-alone): ${cCo}/16 configs with 2 living wave-4+ killers`);
console.log(`armed (FORMTHICK=1):       ${aCo}/16 configs with 2 living wave-4+ killers`);
console.log(`GO = armed >= control+2 AND armed >= 1 -> ${(aCo >= cCo + 2 && aCo >= 1) ? 'GO' : 'NO-GO'}`);
for (const p of coRows) {
  if (p.c.ok || p.a.ok || p.c.n > 0 || p.a.n > 0) {
    console.log(`  s${p.seed} ${p.base}: ctrl living=${p.c.n} [${p.c.vids.join(',') || '-'}]${p.c.ok ? ' CO' : ''} | armed living=${p.a.n} [${p.a.vids.join(',') || '-'}]${p.a.ok ? ' CO' : ''}`);
  }
}

// ---- SECONDARY: formation contrast (distinct vids, per-pair sum) ----
let cV = 0, aV = 0;
const pairRows = [];
for (const { a, c } of pairs) {
  const cv = w4vids(c), av = w4vids(a);
  cV += cv.size; aV += av.size;
  pairRows.push({ seed: a.seed, base: a.base, c: [...cv], a: [...av] });
}
console.log('\n== SECONDARY: distinct wave-4+ killer vids, per-pair sum (formation contrast) ==');
console.log(`control (formation-alone): ${cV} distinct vids`);
console.log(`armed (FORMTHICK=1):       ${aV} distinct vids`);
console.log('(retained formation-arm corpus on this band: formation-alone 10 vs its control 6)');
for (const p of pairRows) {
  if (p.a.length || p.c.length) {
    console.log(`  s${p.seed} ${p.base}: ctrl=[${p.c.join(',') || '-'}] armed=[${p.a.join(',') || '-'}]`);
  }
}

// ---- ENGAGEMENT: the paired slot ----
let engCfgs = 0, totPairDays = 0, totDrafts = 0, totRefused = 0;
const skipAgg = {};
console.log('\n== ENGAGEMENT: pair-them slot (armed) ==');
for (const r of A) {
  const t = r.ftTele || {};
  totPairDays += (t.pairDays | 0); totDrafts += (t.pairDrafts | 0); totRefused += (t.pairRefused | 0);
  for (const k of Object.keys(t)) if (/^skipped/.test(k)) skipAgg[k] = (skipAgg[k] | 0) + (t[k] | 0);
  const fired = (t.pairDrafts | 0) >= 1;
  if (fired) engCfgs++;
  if ((t.pairDays | 0) > 0 || (t.pairDrafts | 0) > 0) {
    console.log(`  s${r.seed} ${r.base}: pairDays=${t.pairDays | 0} drafts=${t.pairDrafts | 0} refused=${t.pairRefused | 0} beats=${r.ftBeats | 0}`);
  }
}
console.log(`paired slot fired on ${engCfgs}/16 configs; pairDays=${totPairDays} drafts=${totDrafts} refused=${totRefused}`);
console.log('skip breakdown:', JSON.stringify(skipAgg));

// ---- GUARDRAILS ----
const survDiffs = pairs.map(({ a, c }) => (a.gameDays | 0) - (c.gameDays | 0));
const medDiff = median(survDiffs);
console.log('\n== GUARDRAILS ==');
console.log(`median survival paired diff: ${medDiff.toFixed(1)}d (bar >= -15d) -> ${medDiff >= -15 ? 'PASS' : 'FAIL'}`);
const cStarv = C.reduce((x, r) => x + (r.starvation | 0), 0);
const aStarv = A.reduce((x, r) => x + (r.starvation | 0), 0);
console.log(`starvation deaths: control=${cStarv} armed=${aStarv} (bar <= control+2) -> ${aStarv <= cStarv + 2 ? 'PASS' : 'FAIL'}`);
const cCauses = {}, aCauses = {};
for (const r of C) for (const k of Object.keys(r.deaths || {})) cCauses[k] = (cCauses[k] | 0) + (r.deaths[k] | 0);
for (const r of A) for (const k of Object.keys(r.deaths || {})) aCauses[k] = (aCauses[k] | 0) + (r.deaths[k] | 0);
const newKinds = Object.keys(aCauses).filter(k => !cCauses[k]);
const newKinds2 = newKinds.filter(k => (aCauses[k] | 0) >= 2);
console.log(`new death kinds on armed (>=2-event rule): ${newKinds2.length ? newKinds2.map(k => `${k}(${aCauses[k]})`).join(', ') : 'none'} -> ${newKinds2.length ? 'FAIL' : 'PASS'}`);
const watchKinds = newKinds.filter(k => (aCauses[k] | 0) < 2);
if (watchKinds.length) console.log(`watch (1-event new kinds): ${watchKinds.map(k => `${k}(${aCauses[k]})`).join(', ')}`);

// ---- SECONDARY (reported): damage-majority villager kills ----
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

// ---- thickening trace summary ----
console.log('\n== THICKENING TRACE (armed) ==');
for (const r of A) {
  const t = r.ftTele || {};
  const v = r.vfTele || {};
  console.log(`  s${r.seed} ${r.base}: pairDays=${t.pairDays | 0} drafts=${t.pairDrafts | 0} | formationDays=${v.formationDays | 0} commits=${v.formationCommits | 0} w4Fights=${v.w4Fights | 0}`);
}

// ---- VERDICT ----
const primaryGo = (aCo >= cCo + 2) && (aCo >= 1);
const guardOk = medDiff >= -15 && aStarv <= cStarv + 2 && newKinds2.length === 0;
console.log('\n== VERDICT ==');
console.log(`PRIMARY ${primaryGo ? 'GO' : 'NO-GO'} | GUARDRAILS ${guardOk ? 'PASS' : 'FAIL'}`);
console.log(`OVERALL: ${primaryGo && guardOk ? 'GO' : 'NO-GO'}`);
