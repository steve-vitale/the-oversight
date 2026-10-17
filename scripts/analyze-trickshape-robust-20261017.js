#!/usr/bin/env node
// analyze-trickshape-robust-20261017.js — robustness supplement for the
// sim-trickshape judge: survivor-bias checks + conditional-on-survival
// outcome splits + per-kind flight story.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-10-17', 'perseed-trickshape');

const rows = [];
for (const f of fs.readdirSync(EVID).filter(f => f.endsWith('.json')).sort()) {
  const d = JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8'));
  if (f === 'SUMMARY.json') continue;
  for (const r of (d.rows || [])) rows.push(r);
}
const eraOf = (day) => Math.floor((day || 0) / 30);
const partyBucket = (n) => (n == null ? 'u' : (n <= 1 ? '1' : (n === 2 ? '2' : '3+')));
const T = rows.filter(r => r.performed === 1 && !r.unattributed);
const C1 = rows.filter(r => !r.performed && r.known_at_start === 1 && !r.unattributed);

function stats(list) {
  const n = list.length;
  if (!n) return { n: 0 };
  const m = (a) => a.length ? a.reduce((s, x) => s + x, 0) / a.length : null;
  const surv = list.filter(r => r.p_survived === 1);
  return {
    n,
    surv: list.filter(r => r.p_survived === 1).length / n,
    hpCost: m(list.map(r => r.hp_cost).filter(x => x != null)),
    rounds: m(list.map(r => r.rounds).filter(x => x != null)),
    won: list.filter(r => r.result === 'won').length / n,
    flight: list.filter(r => r.result === 'fled' || r.result === 'routed').length / n,
    lost: list.filter(r => r.result === 'lost').length / n,
    wonGivenSurv: surv.length ? surv.filter(r => r.result === 'won').length / surv.length : null,
    flightGivenSurv: surv.length ? surv.filter(r => r.result === 'fled' || r.result === 'routed').length / surv.length : null,
  };
}
const f1 = (x) => x == null ? 'n/a' : (Math.abs(x) < 10 && x % 1 !== 0 ? x.toFixed(2) : x.toFixed(1));

function matchedCompare(minRounds, label) {
  const t = T.filter(r => (r.rounds || 0) >= minRounds);
  const cpool = C1.filter(r => (r.rounds || 0) >= minRounds);
  const idx = new Map();
  for (const r of cpool) {
    const k = [r.mid, eraOf(r.day), partyBucket(r.partyN)].join('|');
    if (!idx.has(k)) idx.set(k, []);
    idx.get(k).push(r);
  }
  const tm = [], cm = [];
  for (const x of t) {
    const k = [x.mid, eraOf(x.day), partyBucket(x.partyN)].join('|');
    const cs = idx.get(k) || [];
    if (cs.length) { tm.push(x); for (const c of cs) cm.push(c); }
  }
  const ts = stats(tm), cs = stats(cm);
  console.log(`\n--- ${label} (rounds>=${minRounds}): T n=${ts.n} (${cm.length} matched controls) ---`);
  if (!ts.n || !cs.n) { console.log('insufficient'); return; }
  console.log(`survival:        T ${f1(100 * ts.surv)}%  C ${f1(100 * cs.surv)}%  delta ${f1(100 * (ts.surv - cs.surv))}pp`);
  console.log(`HP cost:         T ${f1(ts.hpCost)}  C ${f1(cs.hpCost)}  delta ${f1(ts.hpCost - cs.hpCost)}`);
  console.log(`rounds:          T ${f1(ts.rounds)}  C ${f1(cs.rounds)}`);
  console.log(`won | flight | lost:  T ${f1(100 * ts.won)}% | ${f1(100 * ts.flight)}% | ${f1(100 * ts.lost)}%   C ${f1(100 * cs.won)}% | ${f1(100 * cs.flight)}% | ${f1(100 * cs.lost)}%`);
  console.log(`given survival -> won:   T ${f1(100 * ts.wonGivenSurv)}%  C ${f1(100 * cs.wonGivenSurv)}%`);
  console.log(`given survival -> flight: T ${f1(100 * ts.flightGivenSurv)}%  C ${f1(100 * cs.flightGivenSurv)}%`);
}

console.log('=== ROBUSTNESS: restrict to fights long enough for performance to be possible ===');
matchedCompare(1, 'all fights (baseline, matches analyzer)');
matchedCompare(2, 'rounds>=2');
matchedCompare(3, 'rounds>=3');

console.log('\n=== PER-KIND outcome splits (treatment) ===');
const byKind = {};
for (const t of T) { (byKind[t.kind] || (byKind[t.kind] = [])).push(t); }
for (const k of Object.keys(byKind).sort()) {
  const s = stats(byKind[k]);
  console.log(`${k}: n=${s.n} won=${f1(100 * s.won)}% flight=${f1(100 * s.flight)}% lost=${f1(100 * s.lost)}% surv=${f1(100 * s.surv)}% hpCost=${f1(s.hpCost)} rounds=${f1(s.rounds)}`);
}

console.log('\n=== PERF->ATTR: the unattributed 43 by kind x outcome ===');
const noattr = T.filter(t => !t.kill_attributed);
const tab = {};
for (const t of noattr) {
  const k = t.kind + ' / ' + t.result;
  tab[k] = (tab[k] || 0) + 1;
}
console.log(JSON.stringify(tab, null, 1));
console.log(`unattributed total: ${noattr.length}/${T.length}`);
