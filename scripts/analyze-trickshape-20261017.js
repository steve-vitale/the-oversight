#!/usr/bin/env node
// analyze-trickshape-20261017.js — the sim-trickshape judge.
// Reads evidence/2026-10-17/perseed-trickshape/*.json and answers:
// do performed tricks CHANGE FIGHT SHAPE versus matched non-trick fights?
//
// Treatment: (fight,mid) rows with performed=1 (TB path, engine's own
// trickLogByMid performance record).
// Controls (matched on mid + era(30d) + partyN bucket):
//   C1 known-not-performed: same mid, performed=0, known_at_start=1
//      (controls for knowledge — isolates the performance effect)
//   C2 all non-performed: same mid, performed=0
// Shape metrics: p survival rate, mean HP cost, mean rounds, outcome shares
// (won / fled+routed / lost), companion-death rate, species-kill rate.
//
// PRIMARY (diagnostic GO, binding): 100% attribution — every performed
// (fight,mid) row has complete fight shape (unattributed=0). A miss means
// the instrument is incomplete, never re-scored.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-10-17', 'perseed-trickshape');

const files = fs.readdirSync(EVID).filter(f => f.endsWith('.json')).sort();
const rows = [];
const wall = { national: 0, table: 0, won: 0, n: 0, wave4: 0, wave5: 0, fieldFires: 0 };
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8'));
  wall.n++;
  wall.national += d.national; wall.table += d.table; wall.won += d.won;
  wall.wave4 += d.wave4Reached; wall.wave5 += d.wave5Reached;
  wall.fieldFires += d.nFieldFires || 0;
  for (const r of (d.rows || [])) rows.push(r);
}

const eraOf = (day) => Math.floor((day || 0) / 30);
const partyBucket = (n) => (n == null ? 'u' : (n <= 1 ? '1' : (n === 2 ? '2' : '3+')));

// ---------- PRIMARY ----------
const perf = rows.filter(r => r.performed === 1);
const perfShaped = perf.filter(r => !r.unattributed);
const primaryPct = perf.length ? (100 * perfShaped.length / perf.length) : 0;
console.log('=== PRIMARY (diagnostic GO: 100% attribution of performed-trick fight outcomes) ===');
console.log(`performed (fight,mid) rows: ${perf.length}; complete shape: ${perfShaped.length}; attribution=${primaryPct.toFixed(1)}%`);
console.log(primaryPct === 100 && perf.length > 0 ? 'PRIMARY: GO' : 'PRIMARY: NO-GO — instrument incomplete');
const bad = perf.filter(r => r.unattributed);
if (bad.length) {
  console.log('UNATTRIBUTED PERFORMED ROWS:');
  for (const r of bad.slice(0, 10)) console.log('  ', JSON.stringify({ seq: r.fightSeq, policy: r.policyId, seed: r.seed, day: r.day, mid: r.mid, kind: r.kind, result: r.result, rounds: r.rounds, hpStart: r.p_hp_start, hpEnd: r.p_hp_end, surv: r.p_survived }));
}

// ---------- matched pools ----------
function shapeStats(list) {
  const n = list.length;
  if (!n) return { n: 0 };
  const surv = list.filter(r => r.p_survived === 1).length / n;
  const costs = list.map(r => r.hp_cost).filter(x => x != null);
  const rounds = list.map(r => r.rounds).filter(x => x != null);
  const mean = (a) => a.length ? a.reduce((s, x) => s + x, 0) / a.length : null;
  const out = {
    n: n,
    surv: surv,
    hpCost: mean(costs), hpCostN: costs.length,
    rounds: mean(rounds), roundsN: rounds.length,
    won: list.filter(r => r.result === 'won').length / n,
    flight: list.filter(r => r.result === 'fled' || r.result === 'routed').length / n,
    lost: list.filter(r => r.result === 'lost').length / n,
    compDeath: list.filter(r => (r.companion_deaths || 0) > 0).length / n,
    speciesKilled: list.filter(r => r.species_killed === 1).length / n,
    attr: list.filter(r => r.kill_attributed === 1).length / n,
  };
  return out;
}

// Index controls by (mid, era, partyBucket).
const c1 = rows.filter(r => !r.performed && r.known_at_start === 1 && !r.unattributed);
const c2 = rows.filter(r => !r.performed && !r.unattributed);
function index(list) {
  const m = new Map();
  for (const r of list) {
    const k = [r.mid, eraOf(r.day), partyBucket(r.partyN)].join('|');
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(r);
  }
  return m;
}
const i1 = index(c1), i2 = index(c2);
const T = perf.filter(r => !r.unattributed);

function matched(pool, idx) {
  const out = [];
  for (const t of T) {
    const k = [t.mid, eraOf(t.day), partyBucket(t.partyN)].join('|');
    const cands = idx.get(k) || [];
    out.push({ t: t, controls: cands });
  }
  return out;
}
const m1 = matched(T, i1), m2 = matched(T, i2);
const tMatched1 = m1.filter(x => x.controls.length > 0);
const tMatched2 = m2.filter(x => x.controls.length > 0);
// Collapse controls (each treatment contributes its matched controls once).
const c1m = tMatched1.flatMap(x => x.controls);
const c2m = tMatched2.flatMap(x => x.controls);
const tm1 = tMatched1.map(x => x.t);
const tm2 = tMatched2.map(x => x.t);

function fmt(x) { return x == null ? 'n/a' : (typeof x === 'number' ? (Math.abs(x) < 1 && x !== 0 ? x.toFixed(3) : x.toFixed(1)) : x); }
function pct(x) { return x == null ? 'n/a' : (100 * x).toFixed(1) + '%'; }

function report(name, tList, cList) {
  const ts = shapeStats(tList), cs = shapeStats(cList);
  console.log(`\n--- ${name} (treatment n=${ts.n}, control n=${cs.n}) ---`);
  if (!ts.n || !cs.n) { console.log('insufficient data'); return; }
  console.log(`p survival:        T ${pct(ts.surv)}  vs C ${pct(cs.surv)}   delta ${((ts.surv - cs.surv) * 100).toFixed(1)}pp`);
  console.log(`mean HP cost:      T ${fmt(ts.hpCost)}  vs C ${fmt(cs.hpCost)}   delta ${fmt(ts.hpCost - cs.hpCost)}`);
  console.log(`mean rounds:       T ${fmt(ts.rounds)}  vs C ${fmt(cs.rounds)}   delta ${fmt(ts.rounds - cs.rounds)}`);
  console.log(`outcome won:       T ${pct(ts.won)}  vs C ${pct(cs.won)}`);
  console.log(`outcome flight:    T ${pct(ts.flight)}  vs C ${pct(cs.flight)}`);
  console.log(`outcome lost:      T ${pct(ts.lost)}  vs C ${pct(cs.lost)}`);
  console.log(`companion-death:   T ${pct(ts.compDeath)}  vs C ${pct(cs.compDeath)}`);
  console.log(`species killed:    T ${pct(ts.speciesKilled)}  vs C ${pct(cs.speciesKilled)}`);
  console.log(`kill-attributed:   T ${pct(ts.attr)}`);
}

console.log('\n=== FIGHT-SHAPE COMPARISON ===');
console.log(`pools: treatment=${T.length} (shaped), C1 known-not-performed=${c1.length}, C2 all non-performed=${c2.length}`);
console.log(`matched: T-vs-C1 ${tm1.length}/${T.length} treatments have matches (${c1m.length} controls); T-vs-C2 ${tm2.length}/${T.length} (${c2m.length} controls)`);
report('POOLED: performed vs matched known-not-performed (C1)', tm1, c1m);
report('POOLED: performed vs matched all-non-performed (C2)', tm2, c2m);

// Per-kind (n_perf >= 5).
console.log('\n=== PER-KIND (n_perf>=5) vs matched C1 ===');
const byKind = {};
for (const t of T) { (byKind[t.kind] || (byKind[t.kind] = [])).push(t); }
for (const k of Object.keys(byKind).sort()) {
  const tl = byKind[k];
  if (tl.length < 5) continue;
  const ctrl = [];
  for (const t of tl) {
    const kk = [t.mid, eraOf(t.day), partyBucket(t.partyN)].join('|');
    for (const c of (i1.get(kk) || [])) ctrl.push(c);
  }
  const ts = shapeStats(tl), cs = shapeStats(ctrl);
  console.log(`${k}: nT=${ts.n} nC=${cs.n} | surv T ${pct(ts.surv)} C ${pct(cs.surv)} | hpCost T ${fmt(ts.hpCost)} C ${fmt(cs.hpCost)} | rounds T ${fmt(ts.rounds)} C ${fmt(cs.rounds)} | won T ${pct(ts.won)} C ${pct(cs.won)} | lost T ${pct(ts.lost)} C ${pct(cs.lost)}`);
}

// Confounder check: rounds distribution of performed vs controls (performance needs time).
console.log('\n=== CONFOUNDER: rounds distribution (does performance require longer fights?) ===');
function roundHist(list) {
  const h = {};
  for (const r of list) { const k = r.rounds == null ? 'null' : String(Math.min(r.rounds, 8)); h[k] = (h[k] || 0) + 1; }
  return h;
}
console.log('treatment rounds hist:', JSON.stringify(roundHist(T)));
console.log('C1 rounds hist:      ', JSON.stringify(roundHist(c1)));
console.log('C2 rounds hist:      ', JSON.stringify(roundHist(c2)));

// Perf->attr decomposition: of the 42-gap, where do performed-but-unattributed fights go?
console.log('\n=== PERF->ATTR DECOMPOSITION (performed fights by outcome) ===');
const tOut = {};
for (const t of T) {
  const k = t.result + (t.kill_attributed ? '/attr' : '/noattr');
  tOut[k] = (tOut[k] || 0) + 1;
}
console.log(JSON.stringify(tOut, null, 1));

// Wall metrics (context).
console.log('\n=== WALL (context, pre-seat by design) ===');
console.log(`runs=${wall.n} national=${wall.national}/${wall.n} table=${wall.table}/${wall.n} won=${wall.won}/${wall.n} wave4=${wall.wave4}/${wall.n} wave5=${wall.wave5}/${wall.n} fieldFires=${wall.fieldFires}`);

// Summary JSON for the evidence file.
const summary = {
  primaryPct, primaryGo: primaryPct === 100 && perf.length > 0,
  nPerformed: perf.length, nShaped: perfShaped.length,
  pools: { T: T.length, C1: c1.length, C2: c2.length, matched1: tm1.length, matched2: tm2.length },
  treatment: shapeStats(T), controlC1matched: shapeStats(c1m), controlC2matched: shapeStats(c2m),
  treatmentMatched1: shapeStats(tm1), treatmentMatched2: shapeStats(tm2),
  perfOutcomeSplit: tOut,
  wall,
};
fs.writeFileSync(path.join(EVID, 'SUMMARY.json'), JSON.stringify(summary, null, 1));
console.log('\nSUMMARY.json written.');
