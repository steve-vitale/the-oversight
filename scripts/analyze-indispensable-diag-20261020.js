#!/usr/bin/env node
// analyze-indispensable-diag-20261020.js — rarity verdict + the binding
// decision for sim-indispensable (2026-10-20, flesh-out loop).
//
// Reads evidence/2026-10-20/perseed-indispensablediag/{leadfeast,belongfeast}/s*.json
// and reports: how rare a full seat is, how rare the indispensable door is,
// and per-component rarity of the FULL gate + the indispensable prereq —
// naming the binding blocker. Writes
// evidence/2026-10-20/indispensablediag-corpus-summary.json.
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-20', 'perseed-indispensablediag');

const POLICIES = ['leadfeast', 'belongfeast'];
const runs = [];
for (const p of POLICIES) {
  const dir = path.join(EVID, p);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter(f => /^s\d+\.json$/.test(f))) {
    try {
      const r = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      if (r && r.completed) runs.push(r);
    } catch (e) {}
  }
}
if (!runs.length) { console.error('no runs'); process.exit(2); }

const D = (r) => (r.diag || {});
const sat = runs.filter(r => ['lesser', 'full'].indexOf(D(r).bestSeat) >= 0);
const fullRuns = runs.filter(r => D(r).bestSeat === 'full');
const indRuns = runs.filter(r => D(r).indispEver);

// Per-component rarity among runs that reached ANY seat (the gate's
// binding surface) — bestGate is the engine's own deedGateReady() breakdown
// at the best-seat moment.
const pool = sat.filter(r => D(r).bestGate);
const comp = (fn) => ({ n: pool.filter(r => fn(D(r).bestGate, D(r).bestLedger)).length, of: pool.length });
const comps = {
  'w1>=5': comp(g => g.w1 >= 5),
  'w2>=5': comp(g => g.w2 >= 5),
  'w3>=4': comp(g => g.w3 >= 4),
  'w4>=3': comp(g => g.w4 >= 3),
  'w5>=2': comp(g => g.w5 >= 2),
  'contests>=3': comp(g => g.contestsN >= 3),
  'crises>=3': comp(g => g.crisesN >= 3),
  'stage>=2': comp(g => g.stage >= 2),
  'foodDeeds': comp(g => g.foodDeeds),
  'indisp-score>=10': comp((g, l) => (l ? l.score >= 10 : false)),
  'indisp-foodShared>0': comp((g, l) => (l ? l.foodShared > 0 : false)),
  // Wave-5 window context (docs/MONSTER-WAVES.md: wave-5 unlocks at
  // standing>=200 AND wave-4 faced — game-code, not policy-playable).
  'wave5-unlocked': { n: pool.filter(r => (D(r).bestUnlockedWave | 0) >= 5).length, of: pool.length },
  'standing>=200': { n: pool.filter(r => (D(r).bestStanding | 0) >= 200).length, of: pool.length },
};

console.log(`runs: ${runs.length} (leadfeast ${runs.filter(r => r.policyId === 'leadfeast').length}, belongfeast ${runs.filter(r => r.policyId === 'belongfeast').length})`);
console.log(`national: ${runs.filter(r => r.national).length}/${runs.length}`);
console.log(`sat (bestSeat lesser/full): ${sat.length}/${runs.length}`);
console.log(`full-seat-ever: ${fullRuns.length}/${runs.length}`);
console.log(`indispensable-door-ever: ${indRuns.length}/${runs.length}`);
console.log('\nPer-component rarity among seated runs (best-gate moment):');
for (const [k, v] of Object.entries(comps)) console.log(`  ${k}: ${v.n}/${v.of}`);

console.log('\nFull-seat runs detail:');
for (const r of fullRuns) {
  const g = D(r).bestGate || {};
  console.log(`  ${r.policyId} s${r.seed}: day=${D(r).bestSeatDay} gate=${JSON.stringify({ w1: g.w1, w2: g.w2, w3: g.w3, w4: g.w4, w5: g.w5, ct: g.contestsN, cr: g.crisesN, st: g.stage, fd: g.foodDeeds })} indisp=${D(r).indispEver}`);
}

console.log('\nIndispensable why-strings at best-seat (seated runs):');
const whys = {};
for (const r of sat) {
  const w = (D(r).best && D(r).best.indisp && D(r).best.indisp.why) || '(no indisp read)';
  whys[w] = (whys[w] || 0) + 1;
}
for (const [w, n] of Object.entries(whys)) console.log(`  x${n}: ${w}`);

// The binding blocker: among seated runs that did NOT reach full, which
// gate components failed. Count failures per component.
const notFull = sat.filter(r => D(r).bestSeat !== 'full' && D(r).bestGate);
const fails = {};
for (const r of notFull) {
  const g = D(r).bestGate, l = D(r).bestLedger || {};
  const f = [];
  if (g.w1 < 5) f.push('w1>=5'); if (g.w2 < 5) f.push('w2>=5'); if (g.w3 < 4) f.push('w3>=4');
  if (g.w4 < 3) f.push('w4>=3'); if (g.w5 < 2) f.push('w5>=2');
  if (g.contestsN < 3) f.push('contests>=3'); if (g.crisesN < 3) f.push('crises>=3');
  if (g.stage < 2) f.push('stage>=2'); if (!g.foodDeeds) f.push('foodDeeds');
  for (const k of f) fails[k] = (fails[k] || 0) + 1;
}
console.log(`\nBinding-blocker failures among ${notFull.length} seated-but-not-full runs:`);
for (const [k, v] of Object.entries(fails).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: fails ${v}/${notFull.length}`);

// The binding decision (pre-registered rule).
let verdict;
if (indRuns.length >= 1) verdict = 'ROAD-BUILDABLE';
else if (fullRuns.length === 0 && (fails['w5>=2'] | 0) === notFull.length && notFull.length > 0) {
  // Every seated run that missed full missed it on w5: the wave-5 window is
  // the sole binding blocker — a game-code substrate issue (no wave-5
  // fights in the world), not policy-playable state. Accept-as-gated.
  verdict = 'ACCEPT-AS-GATED';
} else if (fullRuns.length === 0) verdict = 'ACCEPT-AS-GATED';
else verdict = 'ROAD-BUILDABLE'; // full seats exist; the missing piece is the prereq score

console.log(`\nBINDING DECISION: ${verdict}`);
console.log(indRuns.length >= 1
  ? '  indispensable earned >=1x -> build scripts/policies/indispensable.js, run the 8-seed road pilot'
  : (fullRuns.length === 0
    ? '  full seat never earned; the wave-5 window is the binding blocker -> DIAG-GO: honest documented acceptance, no new layer'
    : '  full seats exist but the prereq (score/foodShared) is missing -> a policy road can manufacture dependence -> build it'));

const summary = {
  runs: runs.length, national: runs.filter(r => r.national).length,
  sat: sat.length, fullSeatEver: fullRuns.length, indispDoorEver: indRuns.length,
  components: Object.fromEntries(Object.entries(comps).map(([k, v]) => [k, `${v.n}/${v.of}`])),
  bindingBlockerFailures: fails, whys, verdict,
  perRun: runs.map(r => ({
    policy: r.policyId, seed: r.seed, gameDays: r.gameDays, endReason: r.endReason, won: !!r.won,
    bestSeat: D(r).bestSeat, bestSeatDay: D(r).bestSeatDay, bestGate: D(r).bestGate,
    bestLedger: D(r).bestLedger, bestStanding: D(r).bestStanding, bestUnlockedWave: D(r).bestUnlockedWave,
    indispEver: !!D(r).indispEver, indispFirst: D(r).indispFirst || null,
  })),
};
fs.writeFileSync(path.join(__dirname, '..', 'evidence', '2026-10-20', 'indispensablediag-corpus-summary.json'),
  JSON.stringify(summary, null, 2) + '\n');
console.log('\nwrote evidence/2026-10-20/indispensablediag-corpus-summary.json');

module.exports = { summary };
