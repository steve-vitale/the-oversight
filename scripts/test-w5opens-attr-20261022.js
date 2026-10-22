// test-w5opens-attr-20261022.js — sim-w5opens attribution DIAG (w5opens namespace)
// OFFLINE analysis of the committed tributeguard corpus. Zero new sims,
// zero src/js. Deterministic: double in-process run asserted byte-identical.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const assert = require('assert');

const CORPUS = path.join(__dirname, '..', 'evidence', '2026-10-21', 'perseed-tributeguard');
const SEEDS = [64921, 64922, 64923, 64924, 64925, 64926, 64927, 64928];
const ARMS = ['control', 'armed'];

// The wave-5 door legs, code-grounded:
// game.js unlockedWave() ~L31137: w3 && standing >= t5 && w4faced => 5
//   w3 = day >= 25 && wave2Ledger >= bar ; w4faced = waveEngaged(4) > 0
// standing.js: villageStandingTotal() gated by
//   (a) combat-readiness deferral -> holds at t5-1 while any bar short
//       waveCombatReadiness(5): 4 armored P>=15, 6 armed, 3 tricks,
//       2 veterans (wave-4+ kills)
//   (b) plenty cap -> bread counts at most plentyCapT5 toward t5
//   (c) monotonic peak ratchet (releases only)
function attribute(corpus) {
  const opens = [];
  for (const arm of ARMS) {
    for (const seed of SEEDS) {
      const f = path.join(corpus, `${arm}-belongfeast-tributeguard-s${seed}.json`);
      const d = JSON.parse(fs.readFileSync(f, 'utf8'));
      if (d.wave5 === 1) {
        opens.push({ arm, seed, d });
      }
    }
  }
  // Paired-seed guard-dependence (answerable from the corpus).
  const bySeed = {};
  for (const o of opens) {
    bySeed[o.seed] = bySeed[o.seed] || [];
    bySeed[o.seed].push(o.arm);
  }
  const table = opens.map(({ arm, seed, d }) => {
    const sibling = bySeed[seed];
    const guardIndep =
      sibling.includes('control') && sibling.includes('armed') ? 'YES (both arms, same seeds)'
      : arm === 'control' ? 'control-only' : 'armed-only';
    return {
      run: `${arm}/s${seed}`,
      wave5: d.wave5,
      maxWave: d.maxWave,
      // Leg 1: wave-3 rung (day>=25 + w2 ledger>=bar) — no day/ledger data in corpus.
      leg_w3rung: 'UNKNOWN — corpus records no unlock day, no day-25 floor check, no wave-2 ledger points',
      // Leg 2: standing >= 200 at unlock — no standing data in corpus.
      leg_standing200: 'UNKNOWN — corpus records no villageStandingTotal() series or value at unlock',
      // Leg 3: readiness deferral released (4 armored P>=15, 6 armed, 3 tricks, 2 veterans).
      leg_readiness: 'UNKNOWN — corpus records no waveCombatReadiness(5) bars, no armored/armed/trick/veteran counts, no hold-beat kind',
      // Leg 4: plenty cap.
      leg_plentycap: 'UNKNOWN — corpus records no standing composition (war/bonds/bread) at unlock',
      // Leg 5: wave-4 faced. End-state maxWave=5 PROVES w4faced happened (unlockedWave returns 5
      // only if waveEngaged(4)>0), but the day it happened is unknown.
      leg_w4faced: d.maxWave === 5
        ? 'SATISFIED (end-state) — maxWave=5 proves waveEngaged(4)>0 at some point (code requires it); faced DAY unknown'
        : 'not satisfied',
      // Leg 6: timing vs win.
      leg_timing_vs_win: 'UNKNOWN — corpus records no wave5UnlockDay and no table/win day (end-state won/table only)',
      // Leg 7: RERUN-overtime tier at unlock.
      leg_overtime: 'UNKNOWN — corpus records no overtime tier; WINDEFER=1 in substrate but no tier series',
      // Leg 8: seat state at unlock.
      leg_seat: `UNKNOWN — winTrack.seat is end-state only (${d.winTrack ? d.winTrack.seat : 'no winTrack (unwon)'})`,
      // Leg 9: guard dependence — answerable.
      leg_guard_independent: guardIndep,
      endState: {
        days: d.days, gameDays: d.gameDays, won: d.won, table: d.table,
        national: d.national, nationalEver: d.nationalEver, endReason: d.endReason,
        tgSkips: d.tgSkips, tgGuardPaid: d.tgGuardPaid, tgGuardPartial: d.tgGuardPartial,
      },
    };
  });
  return table;
}

const run1 = attribute(CORPUS);
const run2 = attribute(CORPUS);
const c1 = crypto.createHash('sha256').update(JSON.stringify(run1)).digest('hex');
const c2 = crypto.createHash('sha256').update(JSON.stringify(run2)).digest('hex');
assert.strictEqual(c1, c2, 'attribution must be byte-identical across runs');
console.log(`opens found: ${run1.length}`);
console.log(`attribution sha256: ${c1}`);

// DIAG-GO: 100% of opens attributed, 0 unexplained. An open counts as
// attributed only if legs 1-8 are all SATISFIED (not UNKNOWN).
const attributable = run1.filter(r => {
  const legVals = [r.leg_w3rung, r.leg_standing200, r.leg_readiness,
    r.leg_plentycap, r.leg_w4faced, r.leg_timing_vs_win, r.leg_overtime, r.leg_seat];
  return legVals.every(v => /^SATISFIED/.test(v));
});
const unknownLegs = run1.flatMap(r => {
  const legs = { leg_w3rung: r.leg_w3rung, leg_standing200: r.leg_standing200,
    leg_readiness: r.leg_readiness, leg_plentycap: r.leg_plentycap,
    leg_w4faced: r.leg_w4faced, leg_timing_vs_win: r.leg_timing_vs_win,
    leg_overtime: r.leg_overtime, leg_seat: r.leg_seat };
  return Object.entries(legs).filter(([, v]) => /^UNKNOWN/.test(v))
    .map(([k]) => `${r.run}:${k}`);
});
console.log(`fully attributable: ${attributable.length}/${run1.length}`);
console.log(`unknown legs: ${unknownLegs.length}`);
const verdict = (run1.length === 4 && attributable.length === run1.length)
  ? 'DIAG-GO' : 'NO-GO (unmeasurable-with-instrument-gap)';
console.log(`verdict: ${verdict}`);
console.log('\nopens:', run1.map(r => r.run).join(', '));
console.log('guard-independence:', run1.map(r => `${r.run}=${r.leg_guard_independent}`).join('; '));
fs.writeFileSync(path.join(__dirname, '..', 'evidence', '2026-10-22', 'w5opens-attribution.json'),
  JSON.stringify({ verdict, sha256: c1, table: run1 }, null, 1) + '\n');
