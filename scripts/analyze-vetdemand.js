#!/usr/bin/env node
// scripts/analyze-vetdemand.js — sim-vetdemand diagnostic (2026-10-17, scale-onramp axis).
//
// ZERO-GAME-CODE DIAGNOSTIC. Read-only over the existing vetcompose corpora:
//   evidence/2026-10-17/perseed-vetcompose/*.json  (32 per-seed JSONs)
//   evidence/2026-10-17/vetcompose-beats/*.json    (32 beat captures)
// Does NOT re-run sims. Does NOT load the game. Does NOT touch src/js.
//
// QUESTION (sharpened from evidence/2026-10-17/sim-vetcompose.md): the wave-4
// census found veterans the binding bar on 29/34 non-winning win-side-stack
// runs — demand (2 living veterans) never met. The vetcompose arm proved the
// companion-kill channel works (+8 companion w3 kills) but the win truncates
// the horizon the channel needs. The steve-call: loosen the 2-living-veteran
// demand, or count veteran kills rather than living veterans?
//
// This analyzer reconstructs each run's veteran state from the persisted
// waveKillLog decomposition (w3kills/w3by/companionW3) + daily snapshots
// (vet2peak/maxVeterans from the engine's own waveCombatReadiness(4) reader)
// + deferral hold beats, and computes counterfactual wave-4 unlocks under:
//   (i)   living veterans >= 2            (the engine's current rule)
//   (ii)  cumulative wave-3+ kills >= 2   (not necessarily living)
//   (iii) living >= 1 AND cumulative wave-3+ kills >= 2
//
// ENGINE MODEL (read from src/js/standing.js + src/js/game.js, not changed):
// - wave-4 unlock = unlockedWave() >= 4 = w3-rung (day>=25, w2 ledger>=5)
//   AND villageStandingTotal() >= t4(100).
// - villageStandingTotal() holds the gated total at t4-1 while the
//   combat-readiness deferral bites: deferred = (raw >= t4 && !ready).
// - A defer4 hold beat ("The next act is...") fires ONLY while deferred, so
//   its existence proves raw standing >= 100 at that snapshot; its bar line
//   names exactly the short bars then. A veterans-ONLY hold beat therefore
//   proves: raw>=100, armor/weapons/tricks met, veterans short — the gate
//   would release at that snapshot if the veteran bar were satisfied.
// - TIMING LEMMA (wave-3 kills): the "WAVE LEDGER - wave 3 is halfway there
//   (2/4)" beat fires when waveLedgerPoints(3) >= 2. Every scoring kill flows
//   through recordWaveKill (which writes the waveKillLog entry), and
//   monsterCounterKnown requires the monster def to carry a `counter` field
//   — 0/9 wave-3 defs do (src/data/monsters.json) — so the mastery bonus can
//   never fire on wave-3 kills: every wave-3 scoring kill = exactly 1 point.
//   Hence halfway-at-day-D proves >=2 cumulative wave-3 waveKillLog entries
//   by day D. (Pyrrhic kills add entries without scoring — they only make
//   the true entry count larger, never smaller.)
// - Gate-level counterfactual: rule (ii) unlocks at the first veterans-only
//   hold beat V with V >= ledgerHalf3day (other bars met, raw>=100, kills>=2
//   banked). Rule (iii) additionally needs the beat's living count >= 1
//   ("blood your fighters (X of 2 veterans)" — X is the engine's living
//   count at that snapshot).
// - Bar-level counterfactual (PRIMARY): (i)=vet2peak, (ii)=w3kills>=2,
//   (iii)=maxVeterans>=1 && w3kills>=2. Fully determined by the corpus.
//
// METRIC-REVIEW NOTE (from sim-vetcompose.md): never read scholar.day as
// survival when treatments touch the clock — this analyzer uses endReason
// (village-lost rate) and total deaths only for context, never as outcomes.
//
// Deterministic: fixed input order, no clocks, no RNG. Output is written to
// evidence/2026-10-17/vetdemand-analysis.json; run twice and diff for the
// det-gate.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PERSEED = path.join(ROOT, 'evidence', '2026-10-17', 'perseed-vetcompose');
const BEATS = path.join(ROOT, 'evidence', '2026-10-17', 'vetcompose-beats');
const OUT = path.join(ROOT, 'evidence', '2026-10-17', 'vetdemand-analysis.json');

const EXPECTED_SEEDS = [2271121, 2381233, 2491345, 2601457, 2711569, 2821681, 2931793, 3041905];
const EXPECTED_POLICIES = ['belongseat', 'leadseat'];
const EXPECTED_SIDES = ['armed', 'control'];

function parseHoldBars(text) {
  const bars = [];
  if (/armor the village/.test(text)) bars.push('armor');
  if (/put weapons in hands/.test(text)) bars.push('weapons');
  if (/learn their tricks/.test(text)) bars.push('tricks');
  const m = /blood your fighters \((\d+) of \d+ veterans\)/.exec(text);
  if (m) bars.push('veterans');
  return { bars, living: m ? parseInt(m[1], 10) : null };
}

function analyzeRun(perseedFile) {
  const j = JSON.parse(fs.readFileSync(path.join(PERSEED, perseedFile), 'utf8'));
  const runId = perseedFile.replace(/\.json$/, '');
  const beatFile = path.join(BEATS, perseedFile);
  let beats = [];
  try { beats = JSON.parse(fs.readFileSync(beatFile, 'utf8')); } catch (e) { beats = []; }

  const holds = [];
  let ledgerHalf3 = null, ledgerFull3 = null;
  for (const b of beats) {
    const t = String((b && b.text) || '');
    if (/WAVE LEDGER — wave 3 is halfway there/.test(t) && ledgerHalf3 == null) ledgerHalf3 = b.day | 0;
    if (/WAVE LEDGER — wave 3's bar is full/.test(t) && ledgerFull3 == null) ledgerFull3 = b.day | 0;
    if (/The next act/.test(t)) {
      const p = parseHoldBars(t);
      if (p.bars.length) holds.push({ day: b.day | 0, bars: p.bars, living: p.living });
    }
  }
  holds.sort((a, b) => a.day - b.day);

  const vetOnly = holds.filter(h => h.bars.length === 1 && h.bars[0] === 'veterans');
  const lastHold = holds[holds.length - 1] || null;

  // Bar-level rule verdicts (fully determined by the corpus)
  const ruleI = (j.vet2peak | 0) === 1;
  const ruleII = (j.w3kills | 0) >= 2;
  const ruleIII = ((j.maxVeterans | 0) >= 1) && ((j.w3kills | 0) >= 2);
  const flip = (ruleII || ruleIII) && !ruleI;

  // Gate-level counterfactuals (report-only): veterans-only snapshot with
  // the kills banked by then. maxWave>=3 proves the w3 rung; wave45==0
  // everywhere proves no prior release (no grandfathering).
  const w3rung = (j.maxWave | 0) >= 3;
  let gateII = null, gateIIday = null, gateIII = null, gateIIIday = null;
  if (w3rung && ledgerHalf3 != null) {
    for (const h of vetOnly) {
      if (h.day >= ledgerHalf3) {
        gateII = true; gateIIday = h.day;
        if ((h.living | 0) >= 1) { gateIII = true; gateIIIday = h.day; }
        break;
      }
    }
    if (gateII == null) gateII = false;
    if (gateIII == null) gateIII = false;
  } else {
    gateII = false; gateIII = false; // kills never banked >=2, or w3 rung unmet: indeterminate->false
  }

  return {
    run: runId, policy: j.policyId, side: j.side, seed: j.seed,
    wins: j.wins | 0, endReason: j.endReason, gameDays: j.gameDays | 0,
    national: j.national | 0, maxWave: j.maxWave | 0, wave45: j.wave45 | 0,
    vet2peak: j.vet2peak | 0, maxVeterans: j.maxVeterans | 0,
    w3kills: j.w3kills | 0, w3by: j.w3by || {}, companionW3: j.companionW3 | 0,
    holds: holds.length,
    lastHoldBars: lastHold ? lastHold.bars.join('+') : null,
    lastHoldDay: lastHold ? lastHold.day : null,
    vetOnlyDays: vetOnly.map(h => h.day),
    vetOnlyLiving: vetOnly.map(h => h.living),
    ledgerHalf3, ledgerFull3,
    ruleI, ruleII, ruleIII, flip,
    gateII, gateIIday, gateIII, gateIIIday,
  };
}

function main() {
  const files = fs.readdirSync(PERSEED).filter(f => f.endsWith('.json')).sort();
  if (files.length !== 32) throw new Error('expected 32 per-seed files, got ' + files.length);
  const runs = files.map(analyzeRun);

  // corpus integrity: every policy x side x seed present
  const seen = new Set(runs.map(r => r.policy + '|' + r.side + '|' + r.seed));
  for (const p of EXPECTED_POLICIES) for (const s of EXPECTED_SIDES) for (const sd of EXPECTED_SEEDS) {
    if (!seen.has(p + '|' + s + '|' + sd)) throw new Error('missing run: ' + p + ' ' + s + ' s' + sd);
  }

  const armed = runs.filter(r => r.side === 'armed');
  const control = runs.filter(r => r.side === 'control');
  const sum = (rs, k) => rs.filter(r => r[k]).length;

  const summary = {
    n: runs.length,
    armed: {
      n: armed.length,
      ruleI: sum(armed, 'ruleI'), ruleII: sum(armed, 'ruleII'), ruleIII: sum(armed, 'ruleIII'),
      flips: sum(armed, 'flip'),
      gateII: sum(armed, 'gateII'), gateIII: sum(armed, 'gateIII'),
    },
    control: {
      n: control.length,
      ruleI: sum(control, 'ruleI'), ruleII: sum(control, 'ruleII'), ruleIII: sum(control, 'ruleIII'),
      flips: sum(control, 'flip'),
      gateII: sum(control, 'gateII'), gateIII: sum(control, 'gateIII'),
    },
  };
  // PRIMARY (binding, §14): bar-level verdict change on the armed-16 corpus.
  summary.primary = {
    corpus: 'armed-16',
    flips: summary.armed.flips,
    threshold: '>=4/16',
    verdict: summary.armed.flips >= 4 ? 'GO' : 'NO-GO',
  };

  const out = { generated_by: 'scripts/analyze-vetdemand.js', corpus: 'vetcompose 32-run (2026-10-17)', summary, runs };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');

  // human-readable table
  const hdr = ['run', 'end', 'gd', 'vet2', 'maxV', 'w3k', 'w3by', 'I', 'II', 'III', 'flip', 'gII', 'gIII', 'lastHold'];
  console.log(hdr.join(' | '));
  for (const r of runs) {
    console.log([
      r.run, r.endReason, r.gameDays, r.vet2peak, r.maxVeterans, r.w3kills,
      JSON.stringify(r.w3by).replace(/"/g, ''),
      r.ruleI ? 1 : 0, r.ruleII ? 1 : 0, r.ruleIII ? 1 : 0, r.flip ? 1 : 0,
      r.gateII ? ('d' + r.gateIIday) : 0, r.gateIII ? ('d' + r.gateIIIday) : 0,
      r.lastHoldDay != null ? ('d' + r.lastHoldDay + '[' + r.lastHoldBars + ']') : '-',
    ].join(' | '));
  }
  console.log(JSON.stringify(summary, null, 1));
}

main();
