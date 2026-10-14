#!/usr/bin/env node
// sweep-ledgerpenalty-20261014.js — CUMULATIVE TAKE PENALTY vs RATE LEDGER
// sweep (sim-findings #156, longsim scale-wall r30 ARM).
//
// Before/after on IDENTICAL seeds (MEASUREMENT.md §§9–12, 14):
//   8 seeds (11/22/33/44/55/66/77/88) x belongseek/leadcourt, 180d death-aware.
// Modes:
//   --invocations=1   single invocation per (policy x seed)  -> sweep JSON
//   --invocations=2   two in-process invocations              -> det-gate style
//                     A/A (identical day-hash check + metric spread for the
//                     #113/#150 noise floor) -> sweep JSON per invocation
// Sides: SIDE=armed   (game.js takeFromPantry penalty routed through the
//                      trailing-7d net rate vs the 3000/day abuse bar)
//        SIDE=control (pristine: -2 per take at cumulative net < -5000)
//
// PRE-REGISTERED (evidence/2026-10-14/sim-ledgerpenalty.md header):
//   PRIMARY:    trust<30 scholar-day share reduction >= 25% relative vs
//               control (suite share = total trustLT30Days / total gameDays
//               across 16 combos). trust<30 is the engine's own half-ration
//               line; the say-line "(Half ration — ...)" is captured as a
//               cross-check instrument (same read-only class as the r28/r29
//               instruments, proven byte-identical 40/40).
//   GUARDRAILS: median survival >= control - 10d (one-sided);
//               national >= control - 2; exiled run-count <= control + 1.
//   A miss is NO-GO per §14 — never re-scored mid-run.
//
// The instrument is read-only by construction (filtered say capture, sampled
// engine-state reads). The det-gate identical-check additionally guards each
// combo.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const { stdSnapshot } = require('./sweep-compare');
const { belongseek } = require('./policies/belongseek');
const { leadcourt } = require('./policies/leadcourt');

const SEEDS = [11, 22, 33, 44, 55, 66, 77, 88];
const POLICIES = { belongseek, leadcourt };
const DAYS = parseInt(process.env.DAYS || '180', 10);
const SIDE = process.env.SIDE || 'armed';
const INVOC = parseInt((process.argv.find(a => a.startsWith('--invocations=')) || '=1').split('=')[1], 10) || 1;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

const HALF_RE = /Half ration/;

async function runCombo(pid, seed, inv) {
  const { Game } = await loadGame({ seed, mode: `ledgerpenalty-${SIDE}-i${inv}` });
  await setupGame(Game);
  const vid = Game.villagerId;
  const halfDays = new Set();
  const daySamples = []; // {day, trust, gives, takes, exiled}
  const hashes = [];
  let maxRank = 0, maxArc = 1, everTable = false, won = false;
  const origSay = Game.say;
  Game.say = function (msg) {
    try {
      const m = String(msg);
      if (HALF_RE.test(m)) halfDays.add((Game.state.scholar || {}).day || 0);
    } catch (e) {}
    return origSay.apply(this, arguments);
  };
  const base = POLICIES[pid];
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const d = (G.state.scholar || {}).day || 0;
      hashes.push(d + ':' + dayHash(G));
      const vv = G.state.village || {};
      const tr = (vv.trust || {})[vid];
      daySamples.push({ day: d, trust: tr === undefined ? null : tr,
        gives: (vv.gives || {})[vid] || 0, takes: (vv.takes || {})[vid] || 0,
        exiled: !!((G.state.scholar || {}).exiled) });
      const s = stdSnapshot(G);
      maxRank = Math.max(maxRank, RANK_ORDER[s.rank] || 0);
      maxArc = Math.max(maxArc, s.arc || 1);
      if (s.tableWaiting) everTable = true;
      if (s.won) won = true;
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  let r;
  try {
    r = await runDays(Game, policy, { days: DAYS, sampleEvery: 1 });
  } finally {
    Game.say = origSay;
  }
  const vv = Game.state.village || {};
  const end = stdSnapshot(Game);
  const trusts = daySamples.map(x => x.trust).filter(t => t !== null);
  const lt30 = daySamples.filter(x => x.trust !== null && x.trust < 30).length;
  return {
    side: SIDE, invocation: inv, policy: pid, seed,
    days: r.days, gameDays: r.gameDays, endReason: r.endReason,
    waveReach: r.maxWaveUnlocked || 1,
    national: maxRank >= 2 ? 1 : 0, table: everTable || end.tableWaiting ? 1 : 0,
    won: won || end.won ? 1 : 0, vests: end.vests || 0, maxArc,
    halfRationDays: halfDays.size,
    halfRationShare: r.gameDays > 0 ? halfDays.size / r.gameDays : 0,
    trustLT30Days: lt30,
    trustLT30Share: r.gameDays > 0 ? lt30 / r.gameDays : 0,
    trustEnd: trusts.length ? trusts[trusts.length - 1] : null,
    givesEnd: (vv.gives || {})[vid] || 0,
    takesEnd: (vv.takes || {})[vid] || 0,
    everExiled: daySamples.some(x => x.exiled) ? 1 : 0,
    hashes,
  };
}

async function main() {
  const rows = [];
  const gateLines = [];
  for (const pid of Object.keys(POLICIES)) {
    for (const seed of SEEDS) {
      const a = await runCombo(pid, seed, 1);
      rows.push(a);
      console.log(`  [${SIDE} ${pid} seed ${seed} i1] days=${a.days} end=${a.endReason} wave=${a.waveReach} lt30Share=${a.trustLT30Share.toFixed(4)} hrShare=${a.halfRationShare.toFixed(4)} takes=${a.takesEnd} trustEnd=${a.trustEnd} national=${a.national} table=${a.table} exiled=${a.everExiled}`);
      if (INVOC >= 2) {
        const b = await runCombo(pid, seed, 2);
        rows.push(b);
        let firstDiv = -1;
        const n = Math.min(a.hashes.length, b.hashes.length);
        for (let i = 0; i < n; i++) { if (a.hashes[i] !== b.hashes[i]) { firstDiv = i; break; } }
        const identical = firstDiv < 0 && a.hashes.length === b.hashes.length;
        const divDay = firstDiv >= 0 ? a.hashes[firstDiv].split(':')[0] : '-';
        gateLines.push(`${SIDE} ${pid} s${seed}: ${identical ? 'IDENTICAL' : 'DIVERGED@day' + divDay} (${n} days)`);
        console.log(`  [${SIDE} ${pid} seed ${seed} i2] ${identical ? 'IDENTICAL' : 'DIVERGED@day' + divDay} lt30Share=${b.trustLT30Share.toFixed(4)}`);
      }
    }
  }
  const fs = require('fs');
  const out = `sweep-ledgerpenalty-${SIDE}-inv${INVOC}.json`;
  fs.writeFileSync(out, JSON.stringify({ side: SIDE, invocations: INVOC, days: DAYS, rows, gate: gateLines }, null, 1));
  console.log(`wrote ${out}`);
  if (gateLines.length) {
    const idn = gateLines.filter(l => l.includes('IDENTICAL')).length;
    console.log(`GATE: ${idn}/${gateLines.length} identical`);
    for (const l of gateLines) console.log('  ' + l);
  }
}
main().catch(e => { console.error('THREW', e); process.exit(2); });
