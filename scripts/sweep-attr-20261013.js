#!/usr/bin/env node
// scripts/sweep-attr-20261013.js — KILL ATTRIBUTION RUN (2026-10-13).
//
// MEASUREMENT ONLY. Re-runs the 4 seed/policy configs that produced
// villager wave-3 ledger kills in evidence/2026-10-13/sim-action-telemetry.json
//   competent s11 (1), competent s33 (1), belongseek s33 (1), leadcourt s88 (3)
// at the same 180-day horizon with the same instrument setup as the
// telemetry sweep, and attributes every wave-3 kill by channel
// (recordWaveKill `via` tag) + trick executions involved (trickSummary).
//
// Row convention EXTENDS sweep-action-telemetry-20261013.js: the same base
// fields plus an `attr` key { w3log, w3byChannel, trickTally }. Nothing
// existing is renamed or removed.
//
// Usage: node scripts/sweep-attr-20261013.js
//   OUT=evidence/2026-10-13/sim-attr-20261013.json
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { belongseek } = require('./policies/belongseek');
const { leadcourt } = require('./policies/leadcourt');
const fc = require('./food-coupling-20261013');
const sr = require('./scale-repro-20261013');
const { attachStanding, standingSample } = require('./sweep-action-telemetry-20261013');

const POLICY_REGISTRY = { competent, belongseek, leadcourt };
const _RUNS = [
  { policy: 'competent', seed: 11, expectW3: 1 },
  { policy: 'competent', seed: 33, expectW3: 1 },
  { policy: 'belongseek', seed: 33, expectW3: 1 },
  { policy: 'leadcourt', seed: 88, expectW3: 3 },
];
// SEEDS="11" POLICIES="competent" filters; ATTR_OFF=1 runs with the
// instrumentation gated off (Game._attrKills=false) as a control.
const _seedF = (process.env.SEEDS || '').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const _polF = (process.env.POLICIES || '').split(',').map(s => s.trim()).filter(Boolean);
const RUNS = _RUNS.filter(r => (!_seedF.length || _seedF.includes(r.seed)) && (!_polF.length || _polF.includes(r.policy)));
const ATTR_OFF = process.env.ATTR_OFF === '1';
const DAYS = 180;

// progressSample: copied from sweep-action-telemetry-20261013.js (not
// exported there) so the daily instrument stack matches exactly.
function progressSample(Game) {
  const d = (() => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } })();
  const out = { day: d, ledgerMag: null, scaleRank: 'village', codexP: 0, codexM: 0, codexS: 0, standing: 0 };
  try {
    const L = ((Game.progState ? Game.progState() : {}) || {}).ledger || {};
    out.ledgerMag = Object.values(L).reduce((t, v) => t + Math.abs(v || 0), 0);
  } catch (e) {}
  try { out.scaleRank = Game.scaleRank ? (Game.scaleRank() || 'village') : 'village'; } catch (e) {}
  try {
    const cx = Game.state.codex || {};
    out.codexP = Object.keys(cx.plants || {}).length;
    out.codexM = Object.keys(cx.monsters || {}).length;
    out.codexS = Object.keys(cx.skills || {}).length;
  } catch (e) {}
  try { out.standing = Game.villageStanding ? ((Game.villageStanding() || {}).total | 0) : 0; } catch (e) {}
  return out;
}

(async () => {
  const t0 = Date.now();
  const rows = [];
  for (const { policy: pid, seed, expectW3 } of RUNS) {
    const base = POLICY_REGISTRY[pid];
    const { Game } = await loadGame({ seed, mode: 'action-telemetry-' + pid, fullTelemetry: true });
    await setupGame(Game);
    if (ATTR_OFF) Game._attrKills = false; // control: instrumentation fully gated off
    const m = fc.attachInstruments(Game);
    sr.attachScale(Game, m);
    attachStanding(Game, m);
    m.progress = { rows: [] };
    const policy = Object.assign({}, base);
    const origDaily = base.daily;
    policy.daily = (G, ctx) => {
      try { m.daily.push(fc.dailyRow(G)); } catch (e) {}
      try { m.scale.daily.push(sr.scaleRow(G)); } catch (e) {}
      try { m.standing.rows.push(standingSample(G)); } catch (e) {}
      try { m.progress.rows.push(progressSample(G)); } catch (e) {}
      if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
    };
    const result = await runDays(Game, policy, { days: DAYS, sampleEvery: 10 });
    // ---- attribution finalization (extends the row convention) ----
    let waveKills = {};
    try { waveKills = Object.assign({}, Game.state.waveKills || {}); } catch (e) {}
    const w3log = ((Game.state.waveKillLog || []).filter(e => e.w === 3)).map(e => ({
      day: e.d, monster: e.mid, killer: e.by, channel: e.via, trick: e.trick || null,
    }));
    const w3byChannel = {};
    for (const e of w3log) w3byChannel[e.channel] = (w3byChannel[e.channel] || 0) + 1;
    const trickTally = Object.assign({}, Game._trickTally || {});
    const w3ledger = waveKills['3'] || waveKills[3] || 0;
    const reproduced = w3ledger === expectW3;
    const row = {
      label: 'attr-20261013', policy: pid, seed,
      days: result.days, endReason: result.endReason,
      waveKills, w3ledger, expectW3, reproduced,
      attr: { w3log, w3byChannel, trickTally },
    };
    rows.push(row);
    console.log(`  [${pid} s${seed}] d=${row.days} ${row.endReason} w3ledger=${w3ledger} (expect ${expectW3}) ${reproduced ? 'REPRO' : 'MISMATCH'}`);
    for (const k of w3log) {
      console.log(`      d${k.day} ${k.monster} by=${String(k.killer).slice(0, 14)} via=${k.channel} trick=${k.trick || '-'}`);
    }
    console.log(`      trickTally: ${JSON.stringify(trickTally)}`);
  }
  const allRepro = rows.every(r => r.reproduced);
  const attrTable = [];
  for (const r of rows) for (const k of r.attr.w3log) {
    attrTable.push({ seed: r.policy + '/s' + r.seed, day: k.day, monster: k.monster, killer: k.killer, channel: k.channel, trick: k.trick });
  }
  const rep = {
    label: 'attr-20261013',
    runs: RUNS, days: DAYS,
    reproduced: allRepro,
    totalW3: attrTable.length,
    w3WithTrick: attrTable.filter(k => k.trick).length,
    attrTable,
    rows,
    ms: Date.now() - t0,
  };
  console.log(`\n=== attribution: ${rep.totalW3} wave-3 kills, ${rep.w3WithTrick} with trick execution, reproduced=${allRepro} (${(rep.ms / 1000).toFixed(0)}s) ===`);
  const out = process.env.OUT || 'evidence/2026-10-13/sim-attr-20261013.json';
  fs.writeFileSync(path.resolve(out), JSON.stringify(rep, null, 1));
  console.error('wrote ' + out);
  if (!allRepro) process.exit(3);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
