#!/usr/bin/env node
// analyze-vetobudget-qual-b.js — guard-only band QUALIFICATION screen
// (sim-vetobudget-qual-b). Reads ONE guard-only JSONL produced by
// scripts/vetobudget-confirm-b-driver.js (POLICY=competent-homewardstep-b,
// DAYS=60) and judges whether the band qualifies for a veto-budget
// confirm, per the coordinator brief (run fleshout-loop-b-20261102T1505Z)
// and the 1345Z arm's definitions (sim-vetobudget-confirm-b-prereg.md):
//
//   - Repetition seed (1345Z definition, baseline guard-only leg): a seed
//     where some step accumulates >= 6 total silent vetoes OR same-step
//     silent vetoes on >= 4 distinct days. Silent vetoes are hop-log
//     entries with vetoed && silent, grouped by from->to step key.
//   - Would-abandon step (screen observable for "abandonment"): a step
//     with >= 3 total silent vetoes at baseline — the budget's N=3
//     trigger. Actual abandonments cannot occur on a guard-only leg
//     (the budget is not armed), so would-abandon is the honest
//     screen translation of the brief's ">= 1 abandonment".
//   - QUALIFICATION (brief-literal): band QUALIFIES iff
//     repetitionSeeds >= 2 OR wouldAbandonSteps >= 1.
//   - A seed with >= 2 total vetoes (any kind) is also tabulated as a
//     secondary column, because the brief's parenthetical mentions it;
//     it does NOT qualify a band on its own.
//
// Usage: node scripts/analyze-vetobudget-qual-b.js <guard-only.jsonl>
// Prints a per-seed table plus QUALIFIED / NOT-QUALIFIED. Exit 0 on a
// successful parse (verdict is in the text, never the exit code);
// exit 2 on unreadable input or a non-guard-only leg.
'use strict';
const fs = require('fs');

function stepKeyOf(h) { return h.from.x + ',' + h.from.y + '->' + h.to.x + ',' + h.to.y; }

function analyzeSeed(rec) {
  const perStep = new Map(); // key -> { total, days:Set }
  let vetoes = 0, silentVetoes = 0;
  for (const d of rec.days || []) {
    vetoes += d.vetoes || 0;
    silentVetoes += d.silentVetoes || 0;
    for (const h of d.hops || []) {
      if (!h.vetoed || !h.silent) continue;
      const k = stepKeyOf(h);
      if (!perStep.has(k)) perStep.set(k, { total: 0, days: new Set() });
      const s = perStep.get(k);
      s.total++;
      s.days.add(d.loopDay);
    }
  }
  const steps = [...perStep.entries()].map(([step, s]) => ({
    step, total: s.total, days: s.days.size,
  })).sort((a, b) => b.total - a.total);
  const isRepetitionSeed = steps.some((s) => s.total >= 6 || s.days >= 4);
  const wouldAbandon = steps.filter((s) => s.total >= 3);
  return {
    seed: rec.seed, daysAlive: rec.daysAlive, endReason: rec.endReason,
    maxWaveUnlocked: rec.maxWaveUnlocked,
    vetoes, silentVetoes, steps, isRepetitionSeed, wouldAbandon,
  };
}

function main() {
  const file = process.argv[2];
  if (!file) { console.error('usage: analyze-vetobudget-qual-b.js <guard-only.jsonl>'); process.exit(2); }
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch (e) { console.error('cannot read ' + file + ': ' + e.message); process.exit(2); }
  const recs = text.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
  if (recs.length === 0) { console.error('no records in ' + file); process.exit(2); }
  for (const r of recs) {
    if (r.policy !== 'competent-homewardstep-b') {
      console.error('not a guard-only leg: seed ' + r.seed + ' policy=' + r.policy);
      process.exit(2);
    }
  }
  const seeds = recs.map(analyzeSeed);
  const repetitionSeeds = seeds.filter((s) => s.isRepetitionSeed).map((s) => s.seed);
  const wouldAbandonSteps = [];
  for (const s of seeds) for (const w of s.wouldAbandon) wouldAbandonSteps.push({ seed: s.seed, step: w.step, total: w.total, days: w.days });
  const looseSeeds = seeds.filter((s) => s.vetoes >= 2).map((s) => s.seed);
  const qualified = repetitionSeeds.length >= 2 || wouldAbandonSteps.length >= 1;
  console.log('seed | daysAlive | vetoes(silent) | topStep total/days | repetition | wouldAbandon');
  for (const s of seeds) {
    const top = s.steps[0] ? s.steps[0].total + '/' + s.steps[0].days + ' ' + s.steps[0].step : 'none';
    console.log(s.seed + ' | ' + s.daysAlive + ' | ' + s.vetoes + '(' + s.silentVetoes + ') | ' + top +
      ' | ' + (s.isRepetitionSeed ? 'YES' : 'no') + ' | ' + s.wouldAbandon.map((w) => w.step + ':' + w.total).join(', '));
  }
  console.log('band seeds=' + seeds.length + ' totalVetoes=' + seeds.reduce((t, s) => t + s.vetoes, 0) +
    ' totalSilent=' + seeds.reduce((t, s) => t + s.silentVetoes, 0) +
    ' repetitionSeeds=[' + repetitionSeeds.join(',') + ']' +
    ' wouldAbandonSteps=' + wouldAbandonSteps.length + ' ' + JSON.stringify(wouldAbandonSteps) +
    ' looseSeeds(>=2 vetoes)=[' + looseSeeds.join(',') + ']');
  console.log(qualified ? 'VERDICT: QUALIFIED' : 'VERDICT: NOT-QUALIFIED');
}

if (require.main === module) main();
module.exports = { analyzeSeed, stepKeyOf };
