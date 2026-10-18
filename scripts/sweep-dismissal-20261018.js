#!/usr/bin/env node
// scripts/sweep-dismissal-20261018.js — sim-dismissal b2 dismissal-shape
// census sweep (flesh-out loop, axis scale-onramp, arm sim-dismissal,
// run fleshout-20261018T0122Z).
//
// READ-ONLY DIAGNOSTIC. Zero src/js, zero policy changes — the treatment is
// a policy composition of two LANDED layers: withReposition(vetrelLead /
// vetrelBelong) with REPOSITION=1 + VETREL=1 (the task's "compose the landed
// instruments that maximize the dismissal pool": reposition.js raised
// movement-kind performances blindside 15v6 / face_it 2v0; vetrel.js adds
// companion presence on the competent courtship substrate).
//
// Arms (identical seeds, 180d death-aware):
//   control: leadfeast, belongfeast (REPOSITION unset, VETREL unset)
//   armed:   reposition-vetrel-lead, reposition-vetrel-belong
//            (REPOSITION=1, VETREL=1)
//
// Substrate: competent courtship pre-seat — SEATDRIVE=0 EXPLICIT,
// FEASTSCALE_R13=1 (same as the attrcensus re-sweep).
//
// PRE-REGISTRATION (docs/MEASUREMENT.md §§9-12, 14 — BINDING, written BEFORE
// the sweep):
//   PRIMARY: 100% attribution/classification of dismissal fights
//     (trick performs + target flees + 0 kills attributed) to the
//     deed-relevant taxonomy — species, trick kind, wave, monster HP state
//     at flight, counter known at start — plus the counterfactual bar replay
//     per run (dismissal-counted deeds D1/D2 vs kill-counted).
//     GO: 100% classified, 0 unattributed, 0 instrument errors, and the
//     counterfactual computed for every run with >=1 dismissal.
//     A miss is NO-GO — reported as such with the reason.
//     UNMEASURABLE OUT: if the dismissal pool is empty on this substrate
//     (0 dismissals across 32 runs), PRIMARY is marked unmeasurable
//     honestly — the instrument is kept and the substrate that WOULD
//     produce the pool is named. No re-scoring.
//   GUARDRAILS: wall metrics within noise of the attrcensus re-sweep on
//     this substrate (national ~3/8, table ~6/8 per 8-seed set, wins 0);
//     no new death mode (death-cause key sets compared); det-gate
//     byte-identical (proof).
//   Horizon: 180d death-aware (dead villages stop).
//   Seeds: 8 FRESH [5501-5508] x {leadfeast, belongfeast} x {control, armed}
//     = 32 runs. FRESH = 0 per-seed filename hits across evidence/
//     (verified 2026-10-18 before the run).
//
// Per-seed JSONs carry canonical wall keys (finding #482): national, table,
// wins, exiled — plus dismissal rows, the ledger/standing snapshot for the
// counterfactual, and the final rung ladder.
//
// Usage:
//   SEEDS="5501,5502,5503,5504,5505,5506,5507,5508" DAYS=180 \
//   OUT=evidence/2026-10-18/sim-dismissal-census.json \
//   PERSEED=evidence/2026-10-18/perseed-dismissal \
//   node scripts/sweep-dismissal-20261018.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { vetrelLead, vetrelBelong } = require('./policies/vetrel');
const { withReposition } = require('./policies/reposition');
const { attachDismissalCapture } = require('./dismissal-instrument-20261018');
const { classifyFights } = require('./analyze-dismissal-20261018');

const armedLead = withReposition(vetrelLead, 'reposition-vetrel-lead',
  'vetrel-lead + reposition layer (REPOSITION=1 VETREL=1): dismissal-pool maximizer');
const armedBelong = withReposition(vetrelBelong, 'reposition-vetrel-belong',
  'vetrel-belong + reposition layer (REPOSITION=1 VETREL=1): dismissal-pool maximizer');

function nationalAt(Game) {
  try { const r = typeof Game.scaleRank === 'function' ? Game.scaleRank() : 'village'; return (r === 'national' || r === 'global') ? 1 : 0; }
  catch (e) { return 0; }
}
function wonAt(Game) { try { return Game.won === true ? 1 : 0; } catch (e) { return 0; } }
function tableAt(Game) {
  try {
    const tel = (Game.state || {}).telemetry || [];
    if (tel.some(e => e && (e.type === 'table_won' || e.type === 'table_failed' || e.type === 'table_entered'))) return 1;
    const pg = Game.progState ? Game.progState() : {};
    return (pg.tableWaiting || pg.tableDone) ? 1 : 0;
  } catch (e) { return 0; }
}
function exiledAt(Game) { try { return ((Game.state || {}).scholar || {}).exiled ? 1 : 0; } catch (e) { return 0; } }

function scholarDeaths(Game) {
  const tel = (Game.state || {}).telemetry || [];
  const ds = tel.filter(e => e && e.type === 'death' && e.player === true);
  const causes = {};
  let combat = 0;
  for (const e of ds) {
    const c = String(e.cause || 'unknown');
    causes[c] = (causes[c] || 0) + 1;
    if (/combat|fight|monster|maul|bite|claw|wound|slain|killed|strike/i.test(c)) combat++;
  }
  return { n: ds.length, combat, causes };
}
function villagerDeaths(Game) {
  try {
    const fallen = ((Game.state || {}).village || {}).fallen || [];
    return { n: fallen.length, combat: fallen.filter(f => f && f.cause === 'combat').length };
  } catch (e) { return { n: 0, combat: 0 }; }
}

// The ledger + standing snapshot the analyzer's counterfactual needs.
function ledgerSnapshot(Game) {
  try {
    const L = (typeof Game.ledgerState === 'function') ? Game.ledgerState() : {};
    const points = {}, perType = {};
    for (let w = 1; w <= 5; w++) {
      points[w] = ((L[w] || {}).points | 0) || 0;
      perType[w] = Object.assign({}, (L[w] || {}).perType || {});
    }
    const wl = (typeof Game.waveLedgerCfg === 'function') ? Game.waveLedgerCfg() : {};
    const sc = (typeof Game.standingCfg === 'function') ? Game.standingCfg() : {};
    const st = (typeof Game.villageStanding === 'function') ? Game.villageStanding() : {};
    const gated = (typeof Game.villageStandingTotal === 'function') ? Game.villageStandingTotal() : 0;
    const rd4 = (typeof Game.waveUnlockReady === 'function') ? Game.waveUnlockReady(4) : {};
    const rd5 = (typeof Game.waveUnlockReady === 'function') ? Game.waveUnlockReady(5) : {};
    let peak = 0;
    try { peak = (typeof Game._standingPeakWave === 'function') ? (Game._standingPeakWave() | 0) : 0; } catch (e) {}
    let w4faced = false;
    try { w4faced = (typeof Game.waveEngaged === 'function') ? Game.waveEngaged(4) > 0 : false; } catch (e) {}
    return {
      day: ((Game.state || {}).scholar || {}).day || 0,
      cfg: {
        barsPerWave: Object.assign({ 1: 5, 2: 4, 3: 4, 4: 3, 5: 2 }, (wl.barsPerWave || {})),
        wave2DayFloor: wl.wave2DayFloor != null ? wl.wave2DayFloor : 8,
        dayFloor: wl.dayFloor != null ? wl.dayFloor : 25,
        pointsPerKill: wl.pointsPerKill != null ? wl.pointsPerKill : 1,
        pointsPerCounterKill: wl.pointsPerCounterKill != null ? wl.pointsPerCounterKill : 2,
        perTypeCap: wl.perTypeCap != null ? wl.perTypeCap : 2,
        warPerKill: sc.warPerKill != null ? sc.warPerKill : 25,
        t4: sc.t4 != null ? sc.t4 : 100, t5: sc.t5 != null ? sc.t5 : 200,
        plentyCapT5: sc.plentyCapT5 != null ? sc.plentyCapT5 : 100,
      },
      ledgerPoints: points, ledgerPerType: perType,
      standing: { war: (st.war | 0) || 0, diplomacy: (st.diplomacy | 0) || 0, plenty: (st.plenty | 0) || 0 },
      gated: (gated | 0) || 0,
      rd4Ready: !!rd4.ready, rd5Ready: !!rd5.ready, peak: peak, w4faced: w4faced,
      maxWave: (Game.unlockedWave ? Game.unlockedWave() : 1) | 0,
    };
  } catch (e) { return { error: String(e && e.message) }; }
}

async function runOne(policy, gate, seed, days) {
  if (gate) { process.env.REPOSITION = '1'; process.env.VETREL = '1'; }
  else { delete process.env.REPOSITION; delete process.env.VETREL; }
  process.env.SEATDRIVE = '0';
  process.env.FEASTSCALE_R13 = '1';
  const { Game } = await loadGame({ seed, mode: 'dismissal-' + policy.id, fullTelemetry: true });
  await setupGame(Game);
  const cap = attachDismissalCapture(Game);
  const result = await quietLog(async () => runDays(Game, policy, { days, sampleEvery: 15 }));
  // The attribution join runs over the FINAL waveKillLog (the instrument's
  // pre-ledger snapshot cannot see entries the engine writes inside tbEnd).
  const cls = classifyFights(cap.tbFights, (Game.state || {}).waveKillLog || []);
  cap.restore();
  const sd = scholarDeaths(Game);
  const vd = villagerDeaths(Game);
  const snap = ledgerSnapshot(Game);
  // Sense-testing transcripts: beats for each b2 dismissal fight (<=12).
  const b2seqs = new Set(cls.rows.filter(r => r.cls === 'b2-dismissal').map(r => r.seq));
  const transcripts = {};
  for (const b of (cap.sayBeats || [])) {
    if (!b2seqs.has(b.seq)) continue;
    (transcripts[b.seq] = transcripts[b.seq] || []).push(b.text);
    if (transcripts[b.seq].length >= 12) b2seqs.delete(b.seq);
  }
  for (const r of cls.rows) {
    if (r.cls === 'b2-dismissal' && transcripts[r.seq]) r.transcript = transcripts[r.seq];
  }
  return {
    policy: policy.id, gate: gate ? '1' : '0', seed,
    days: result.days, endReason: result.endReason || 'alive',
    national: nationalAt(Game), table: tableAt(Game), wins: wonAt(Game), exiled: exiledAt(Game),
    // PRIMARY inputs
    nFights: cap.tbFights.length,
    rows: cls.rows, unattributed: cls.unattributed, instrumentErrors: cls.instrumentErrors,
    snapshot: snap,
    // guardrails
    scholarDeaths: sd.n, scholarCombatDeaths: sd.combat, scholarDeathCauses: sd.causes,
    villagerDeaths: vd.n, villagerCombatDeaths: vd.combat,
  };
}

async function main() {
  const seeds = (process.env.SEEDS || '5501,5502,5503,5504,5505,5506,5507,5508').split(',').map(x => parseInt(x.trim(), 10)).filter(Number.isFinite);
  const days = parseInt(process.env.DAYS || '180', 10);
  const out = process.env.OUT || 'evidence/2026-10-18/sim-dismissal-census.json';
  const perSeedDir = process.env.PERSEED || null;
  const arms = [
    { policy: leadfeast, gate: false },
    { policy: belongfeast, gate: false },
    { policy: armedLead, gate: true },
    { policy: armedBelong, gate: true },
  ];
  const rows = [];
  for (const a of arms) {
    for (const seed of seeds) {
      const row = await runOne(a.policy, a.gate, seed, days);
      rows.push(row);
      if (perSeedDir) {
        try {
          fs.mkdirSync(perSeedDir, { recursive: true });
          fs.writeFileSync(path.join(perSeedDir, `${row.policy}-s${seed}.json`), JSON.stringify(row, null, 1));
        } catch (e) {}
      }
      const b2 = row.rows.filter(r => r.cls === 'b2-dismissal').length;
      console.log(`  [${row.policy} s${seed}] d=${row.days} ${row.endReason} fights=${row.nFights} b2=${b2} unatt=${row.unattributed} ierr=${row.instrumentErrors} maxWave=${row.snapshot.maxWave || '?'} nat=${row.national} tbl=${row.table} won=${row.wins}`);
    }
  }
  const byCls = {};
  for (const r of rows) for (const fr of r.rows) byCls[fr.cls] = (byCls[fr.cls] || 0) + 1;
  const summary = {
    seeds, days, n: rows.length,
    byCls: byCls,
    unattributedTotal: rows.reduce((s, r) => s + r.unattributed, 0),
    instrumentErrorsTotal: rows.reduce((s, r) => s + r.instrumentErrors, 0),
  };
  try {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(summary, null, 1));
  } catch (e) {}
  console.log(JSON.stringify(summary, null, 1));
}

main().catch(e => { console.error('SWEEP FAILED:', e && e.stack || e); process.exit(1); });
