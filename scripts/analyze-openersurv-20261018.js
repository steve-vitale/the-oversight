#!/usr/bin/env node
// scripts/analyze-openersurv-20261018.js — judge for sim-openersurv
// (flesh-out loop, 2026-10-18, axis scale-onramp).
//
// THE QUESTION (fightopen round-2 named next, evidence/2026-10-16/sim-fightopen.md):
// the reunion opener's round-1 strike cost vs benefit, measured where
// wave-4 unlocks actually happen (fightopen round-1 named set 975-982 +
// VETREL=1 companion-veteran stack on both sides).
//
// PRE-REGISTERED GATES (binding, §14):
//   A. performer-death delta (armed - control) <= +3 — performer death =
//      reunion post-learning field fight with outcome 'vDie'.
//   B. reunion trick-attributed kills (armed - control) >= +4 —
//      funnel fight cls 'kill' (outcome vKill with the trick fired).
//   C. conditions-met >= 50% on armed reunion fights — (fires>0)/n.
// MISS on any gate -> KILL (nothing to delete; evidence+instruments land).
//
// PILOT ANSWERABILITY (pre-registered): pooled reunion post-learning field
// fights >= 6 across both arms AND wave-4 reached on >= 4 runs. Miss ->
// no confirm, verdict INCONCLUSIVE.
//
// Usage: node scripts/analyze-openersurv-20261018.js [--pool 6]
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-openersurv');
const POOL_BAR = parseInt((process.argv.find(a => a.startsWith('--pool')) || '').split('=')[1] || '6', 10) || 6;

const files = fs.existsSync(EVID) ? fs.readdirSync(EVID).filter(f => f.endsWith('.json') && !f.startsWith('_')) : [];
const recs = files.map(f => JSON.parse(fs.readFileSync(path.join(EVID, f), 'utf8')));

function median(xs) {
  if (!xs.length) return NaN;
  const s = xs.slice().sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const pairs = {};
for (const r of recs) {
  const k = r.policyId + '-s' + r.seed;
  pairs[k] = pairs[k] || {};
  // armId is 'treatment'/'control' in the per-seed JSON; normalize to 'armed'/'control'.
  pairs[k][r.armId === 'treatment' ? 'armed' : r.armId] = r;
}

// Reunion pool per arm: post-learning field fights from reunion witness-learnings
const pool = { armed: [], control: [] };
const learnCount = { armed: 0, control: 0 };
const w4 = { armed: 0, control: 0 };
const runs = { armed: 0, control: 0 };
for (const [k, p] of Object.entries(pairs)) {
  for (const arm of ['armed', 'control']) {
    const r = p[arm];
    if (!r) continue;
    runs[arm]++;
    w4[arm] += (r.wave4Reached | 0);
    for (const l of (r.witnessLearnings || [])) {
      if (l.id !== 'reunion') continue;
      learnCount[arm]++;
      const f = (r.funnel || []).find(x => x.learnId === l.learnId);
      if (!f) continue;
      for (const fg of (f.fights || [])) {
        if (fg.path !== 'field') continue;
        pool[arm].push({ ...fg, run: k, day: fg.day, cls: fg.cls, fires: fg.fires | 0, outcome: fg.outcome, rounds: fg.rounds });
      }
    }
  }
}

function summarize(fights) {
  const s = { n: fights.length, fired: 0, cnm: 0, byCls: {}, vDie: 0, vKill: 0, vFlee: 0, mFlee: 0, killTrick: 0, rounds: [] };
  for (const f of fights) {
    if ((f.fires | 0) > 0) s.fired++;
    if (f.cls === 'conditions-never-met') s.cnm++;
    s.byCls[f.cls] = (s.byCls[f.cls] || 0) + 1;
    if (f.outcome === 'vDie') s.vDie++;
    if (f.outcome === 'vKill') s.vKill++;
    if (f.outcome === 'vFlee') s.vFlee++;
    if (f.outcome === 'mFlee') s.mFlee++;
    // trick-attributed kill: the trick fired AND the monster died (fightopen
    // metric-review definition: vKill with non-empty trickLog / cls 'kill').
    if (f.cls === 'kill') s.killTrick++;
    if (Number.isFinite(f.rounds)) s.rounds.push(f.rounds);
  }
  return s;
}
const sum = { armed: summarize(pool.armed), control: summarize(pool.control) };

// Cross-check: waveKillLog trick-attributed reunion kills per arm
const wkTrick = { armed: 0, control: 0 };
for (const r of recs) {
  const armKey = r.armId === 'treatment' ? 'armed' : r.armId;
  for (const k of (r.waveKillTricks || [])) {
    if (k.mid === 'reunion' && k.trick) wkTrick[armKey] = (wkTrick[armKey] || 0) + 1;
  }
}

// Gates
const deathDelta = sum.armed.vDie - sum.control.vDie;          // GATE A: <= +3
const killDelta = sum.armed.killTrick - sum.control.killTrick; // GATE B: >= +4
const condMetArmed = sum.armed.n ? sum.armed.fired / sum.armed.n : NaN; // GATE C: >= 0.50

const pooled = sum.armed.n + sum.control.n;
const w4Runs = w4.armed + w4.control;
const answerable = pooled >= POOL_BAR && w4Runs >= 4;

const surv = {};
for (const arm of ['armed', 'control']) surv[arm] = recs.filter(r => (r.armId === 'treatment' ? 'armed' : r.armId) === arm).map(r => r.days);
const medSurv = { armed: median(surv.armed), control: median(surv.control) };
const nat = {};
for (const arm of ['armed', 'control']) nat[arm] = recs.filter(r => (r.armId === 'treatment' ? 'armed' : r.armId) === arm).reduce((a, r) => a + (r.national | 0), 0);
const tab = {};
for (const arm of ['armed', 'control']) tab[arm] = recs.filter(r => (r.armId === 'treatment' ? 'armed' : r.armId) === arm).reduce((a, r) => a + (r.table | 0), 0);
const causes = { armed: {}, control: {} };
for (const r of recs) {
  const armKey = r.armId === 'treatment' ? 'armed' : r.armId;
  for (const [c, n] of Object.entries(r.deathCauses || {})) causes[armKey][c] = (causes[armKey][c] || 0) + n;
}
const treatOnlyCauses = Object.keys(causes.armed).filter(c => !causes.control[c]);

console.log('=== sim-openersurv verdict ===');
console.log(`runs=${recs.length} (armed=${runs.armed} control=${runs.control})`);
console.log(`reunion witness-learnings: armed=${learnCount.armed} control=${learnCount.control}`);
console.log(`pooled reunion field fights: armed=${sum.armed.n} control=${sum.control.n} total=${pooled} (answerability bar >=${POOL_BAR})`);
console.log(`wave-4 reached: armed=${w4.armed} control=${w4.control} pooled=${w4Runs} (bar >=4)`);
console.log(`ANSWERABILITY: ${answerable ? 'YES' : 'NO'}`);
console.log(`-- armed pool: n=${sum.armed.n} fired=${sum.armed.fired} cnm=${sum.armed.cnm} vDie=${sum.armed.vDie} vKill=${sum.armed.vKill} killTrick=${sum.armed.killTrick}`);
console.log(`-- control pool: n=${sum.control.n} fired=${sum.control.fired} cnm=${sum.control.cnm} vDie=${sum.control.vDie} vKill=${sum.control.vKill} killTrick=${sum.control.killTrick}`);
console.log(`armed cls: ${JSON.stringify(sum.armed.byCls)}`);
console.log(`control cls: ${JSON.stringify(sum.control.byCls)}`);
console.log(`GATE A (performer-death delta <= +3): ${sum.armed.vDie} - ${sum.control.vDie} = ${deathDelta} ${deathDelta <= 3 ? 'PASS' : 'MISS'}`);
console.log(`GATE B (reunion trick-attributed kills delta >= +4): ${sum.armed.killTrick} - ${sum.control.killTrick} = ${killDelta} ${killDelta >= 4 ? 'PASS' : 'MISS'}`);
console.log(`GATE C (conditions-met >= 50% armed): ${sum.armed.fired}/${sum.armed.n} = ${Number.isFinite(condMetArmed) ? (condMetArmed * 100).toFixed(1) + '%' : 'n/a'} ${condMetArmed >= 0.5 ? 'PASS' : 'MISS'}`);
console.log(`waveKillLog cross-check (reunion trick-attributed): armed=${wkTrick.armed} control=${wkTrick.control} delta=${wkTrick.armed - wkTrick.control}`);
console.log(`median survival: armed=${medSurv.armed.toFixed(1)}d control=${medSurv.control.toFixed(1)}d`);
console.log(`national: armed=${nat.armed} control=${nat.control} | table: armed=${tab.armed} control=${tab.control}`);
console.log(`treatment-only death causes: ${treatOnlyCauses.length ? treatOnlyCauses.join(', ') : 'none'}`);

let verdict, reason;
if (!answerable) {
  verdict = 'INCONCLUSIVE';
  reason = `pool ${pooled} < ${POOL_BAR} or wave-4 runs ${w4Runs} < 4 (substrate still missing)`;
} else if (deathDelta <= 3 && killDelta >= 4 && condMetArmed >= 0.5) {
  verdict = 'GO';
  reason = `all gates pass (deathDelta=${deathDelta}<=+3, killDelta=${killDelta}>=+4, condMet=${(condMetArmed * 100).toFixed(1)}%>=50%)`;
} else {
  verdict = 'KILL';
  const misses = [];
  if (deathDelta > 3) misses.push(`GATE A miss (deathDelta=${deathDelta}>+3)`);
  if (killDelta < 4) misses.push(`GATE B miss (killDelta=${killDelta}<+4)`);
  if (condMetArmed < 0.5) misses.push(`GATE C miss (condMet=${(condMetArmed * 100).toFixed(1)}%<50%)`);
  reason = misses.join('; ');
}
console.log(`\nVERDICT: ${verdict} — ${reason}`);

const out = {
  arm: 'openersurv', bar: POOL_BAR, runs: recs.length, runsByArm: runs,
  answerable, pooled, wave4Runs: w4Runs,
  learnings: learnCount,
  pool: { armed: sum.armed, control: sum.control },
  gates: { deathDelta, killDelta, condMetArmed: Number.isFinite(condMetArmed) ? condMetArmed : null },
  waveKillTrickDelta: wkTrick.armed - wkTrick.control,
  medianSurvival: medSurv, national: nat, table: tab,
  treatmentOnlyCauses: treatOnlyCauses,
  verdict, reason,
};
fs.writeFileSync(path.join(EVID, '_verdict.json'), JSON.stringify(out, null, 1));
console.log('\nverdict JSON: ' + path.join(EVID, '_verdict.json'));
