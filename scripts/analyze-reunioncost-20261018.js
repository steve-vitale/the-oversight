#!/usr/bin/env node
// scripts/analyze-reunioncost-20261018.js — judge for sim-reunioncost
// (flesh-out loop, 2026-10-18, axis scale-onramp).
//
// THE QUESTION (fightopen round-2 named next, evidence/2026-10-16/sim-fightopen.md):
// the reunion opener's round-1 strike cost flagged a median-survival breach
// (126.0d vs 144.0d, n=8 — noisy but flagged honestly). This arm CONFIRMS it
// on a reunion-enrolled sample: does FIGHTOPEN=1 shorten survival vs the
// identical-seed control (flag unset) on the same pre-seat courtship stack?
//
// PRIMARY (GO = survival cost confirmed): median survival armed < control − 10d
//   over enrolled identical-seed pairs. GO => named next: gate reunion OUT of
//   the opener set (species-level exclusion) or pair with survival work.
//   NO-GO => the round-2 −18d was noise; the reunion opener stands.
// SECONDARY (measured, not binding): opener-fire rate, resolutions movement,
//   vDie share in opener fights, conditions-never-met share (expect ~0 armed),
//   opener-fight outcome-class distribution.
// GUARDRAILS (any miss = NO-GO per §14): no treatment-only death causes;
//   national >= control − 2; wave reach not worse.
//
// ENROLLMENT: a (seed) enrolls iff EITHER arm's per-seed JSON carries a
// reunion witness-learning (id === 'reunion'). Learning is FIGHTOPEN-
// independent (confirmed identical twice in sim-fightopen), so enrollment is
// post-hoc, never a re-score.
//
// Usage: node scripts/analyze-reunioncost-20261018.js [--pool 24]
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-reunioncost');
const POOL_BAR = parseInt((process.argv.find(a => a.startsWith('--pool')) || '').split('=')[1] || '24', 10) || 24;

const files = fs.existsSync(EVID) ? fs.readdirSync(EVID).filter(f => f.endsWith('.json')) : [];
const recs = files.map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));

// Group by (policyId, seed): { armed, control }
const pairs = {};
for (const r of recs) {
  const k = r.policyId + '-s' + r.seed;
  pairs[k] = pairs[k] || {};
  pairs[k][r.armId] = r;
}

const enrolled = [];
for (const [k, p] of Object.entries(pairs)) {
  if (!p.armed || !p.control) continue; // need the identical-seed pair
  const hasReunion = (r) => (r.witnessLearnings || []).some(l => l.id === 'reunion');
  if (hasReunion(p.armed) || hasReunion(p.control)) enrolled.push(k);
}

function median(xs) {
  if (!xs.length) return NaN;
  const s = xs.slice().sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Pool reunion-eligible post-learning field fights per arm
const pool = { armed: [], control: [] };
const learnCount = { armed: 0, control: 0 };
for (const k of enrolled) {
  for (const arm of ['armed', 'control']) {
    const r = pairs[k][arm];
    for (const l of (r.witnessLearnings || [])) {
      if (l.id !== 'reunion') continue;
      learnCount[arm]++;
      const f = (r.funnel || []).find(x => x.learnId === l.learnId);
      if (!f) continue;
      for (const fg of (f.fights || [])) {
        pool[arm].push({ ...fg, run: k, day: fg.day, cls: fg.cls, fires: fg.fires | 0, outcome: fg.outcome, rounds: fg.rounds });
      }
    }
  }
}

function summarize(fights) {
  const s = { n: fights.length, fired: 0, cnm: 0, byCls: {}, vDie: 0, mKill: 0, rounds: [] };
  for (const f of fights) {
    if ((f.fires | 0) > 0) s.fired++;
    if (f.cls === 'conditions-never-met') s.cnm++;
    s.byCls[f.cls] = (s.byCls[f.cls] || 0) + 1;
    if (f.outcome === 'vDie') s.vDie++;
    if (f.outcome === 'mKill') s.mKill++;
    if (Number.isFinite(f.rounds)) s.rounds.push(f.rounds);
  }
  return s;
}
const sum = { armed: summarize(pool.armed), control: summarize(pool.control) };

const surv = {};
for (const arm of ['armed', 'control']) surv[arm] = enrolled.map(k => pairs[k][arm].days);
const medSurv = { armed: median(surv.armed), control: median(surv.control) };
const survDelta = medSurv.armed - medSurv.control;

const nat = {};
for (const arm of ['armed', 'control']) nat[arm] = enrolled.reduce((a, k) => a + (pairs[k][arm].national | 0), 0);
const wave = {};
for (const arm of ['armed', 'control']) wave[arm] = enrolled.reduce((a, k) => a + (pairs[k][arm].maxWave | 0), 0) / Math.max(1, enrolled.length);

const causes = { armed: {}, control: {} };
for (const k of enrolled) for (const arm of ['armed', 'control']) {
  for (const [c, n] of Object.entries(pairs[k][arm].deathCauses || {})) causes[arm][c] = (causes[arm][c] || 0) + n;
}
const treatOnlyCauses = Object.keys(causes.armed).filter(c => !causes.control[c]);

const totalRuns = recs.length;
const pooled = pool.armed.length + pool.control.length;

console.log('=== sim-reunioncost verdict ===');
console.log(`runs=${totalRuns} enrolled_pairs=${enrolled.length} pool=${pooled} (bar >=${POOL_BAR}) learnings reunion armed=${learnCount.armed} control=${learnCount.control}`);
console.log(`pool armed: n=${sum.armed.n} fired=${sum.armed.fired} cnm=${sum.armed.cnm} vDie=${sum.armed.vDie} mKill=${sum.armed.mKill}`);
console.log(`pool control: n=${sum.control.n} fired=${sum.control.fired} cnm=${sum.control.cnm} vDie=${sum.control.vDie} mKill=${sum.control.mKill}`);
console.log(`armed cls: ${JSON.stringify(sum.armed.byCls)}`);
console.log(`control cls: ${JSON.stringify(sum.control.byCls)}`);
console.log(`median survival: armed=${medSurv.armed.toFixed(1)}d control=${medSurv.control.toFixed(1)}d delta=${survDelta.toFixed(1)}d (GO bar <= -10d)`);
console.log(`national: armed=${nat.armed} control=${nat.control} (guardrail >= control-2)`);
console.log(`avg maxWave: armed=${wave.armed.toFixed(2)} control=${wave.control.toFixed(2)}`);
console.log(`treatment-only death causes: ${treatOnlyCauses.length ? treatOnlyCauses.join(', ') : 'none'}`);

let verdict = 'UNDECIDED';
let reason = '';
if (enrolled.length === 0 || pooled < POOL_BAR) {
  verdict = 'INCONCLUSIVE';
  reason = `pool ${pooled} < ${POOL_BAR} (insufficient enrollment)`;
} else {
  const primaryGo = survDelta <= -10;
  const guardOk = treatOnlyCauses.length === 0 && nat.armed >= nat.control - 2;
  if (!guardOk) { verdict = 'NO-GO'; reason = 'guardrail miss'; }
  else if (primaryGo) { verdict = 'GO'; reason = `survival cost confirmed: delta ${survDelta.toFixed(1)}d <= -10d`; }
  else { verdict = 'NO-GO'; reason = `survival cost NOT confirmed: delta ${survDelta.toFixed(1)}d > -10d (round-2 breach was noise)`; }
}
console.log(`\nPRIMARY: ${verdict} — ${reason}`);

const out = {
  arm: 'reunioncost', bar: POOL_BAR, runs: totalRuns, enrolledPairs: enrolled.length,
  enrolledSeeds: enrolled, pooled,
  learnings: learnCount,
  pool: { armed: sum.armed, control: sum.control },
  medianSurvival: medSurv, survivalDelta: survDelta,
  national: nat, avgMaxWave: wave,
  treatmentOnlyCauses: treatOnlyCauses,
  verdict, reason,
};
fs.writeFileSync(path.join(EVID, '_verdict.json'), JSON.stringify(out, null, 1));
console.log('\nverdict JSON: ' + path.join(EVID, '_verdict.json'));
