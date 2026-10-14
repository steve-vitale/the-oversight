#!/usr/bin/env node
// sweep-unloaddiv-20261014.js — UNLOAD-TRUST DIVERGENCE sweep (sim-findings #155,
// scale-onramp r30 diagnostic).
//
// Armed (r29 patch re-applied for measurement only) vs control (pristine) on
// IDENTICAL seeds (MEASUREMENT.md §§9–12, 14):
//   8 seeds (11/22/33/44/55/66/77/88) x belongseek/leadcourt, 180d death-aware.
// Modes:
//   --invocations=1   single invocation per (policy x seed)  -> sweep JSON
//   --invocations=2   two in-process invocations              -> det-gate style
//                     A/A (identical day-hash check + metric spread for the
//                     #113/#150 noise floor) -> sweep JSON per invocation
//
// PRE-REGISTERED (evidence/2026-10-14/sim-unloaddiv.md header, written before any sims):
//   HYPOTHESIS: armed-vs-control survival delta sign correlates with
//     raid/lingerer nights: high-raid seeds -> armed worse, low-raid -> armed
//     better or neutral; >=6/8 seeds follow the sign prediction.
//   HIGH-RAID ⟺ mean control-side gorge nights (both policies) >= 8 AND
//     mean control-side total gorged kcal >= 5000.
//   Per-seed delta = mean over policies of (armedDays - controlDays).
//   HIGH-RAID predicts avgDelta <= 0; LOW-RAID predicts avgDelta >= 0;
//   NEUTRAL = |avgDelta| <= 10d (follows either way).
//   DIAGNOSTIC GO: >= 6/8 seeds follow the sign prediction.
//
// Raid classification uses scripts/predation-lib-20261014.js (landed on master,
// r30b; INSTRUMENT ONLY, proven byte-identical by its Part C test), installed
// per combo before runDays. The say-wrap below is the same filtered-capture
// class the r28 census proved read-only; the det-gate identical-check guards
// every combo on top.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const { stdSnapshot } = require('./sweep-compare');
const { installPredation, finalizePredation } = require('./predation-lib-20261014');
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
  const { Game } = await loadGame({ seed, mode: `unloaddiv-${SIDE}-i${inv}` });
  await setupGame(Game);
  // predation instrument FIRST (its say wrap goes innermost; call-through, proven byte-identical)
  const track = installPredation(Game);
  const vid = Game.villagerId;
  const halfDays = new Set();
  const daySamples = [];
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
  let pred = null;
  try { pred = finalizePredation(Game, track); } catch (e) { pred = { error: String(e && e.message) }; }
  const gorgeNights = (track.gorgeNights || []);
  const totalGorgedKcal = gorgeNights.reduce((t, g) => t + Math.round(g.totalGorged || 0), 0);
  const vv = Game.state.village || {};
  const end = stdSnapshot(Game);
  const trusts = daySamples.map(x => x.trust).filter(t => t !== null);
  return {
    side: SIDE, invocation: inv, policy: pid, seed,
    days: r.days, gameDays: r.gameDays, endReason: r.endReason,
    waveReach: r.maxWaveUnlocked || 1,
    national: maxRank >= 2 ? 1 : 0, table: everTable || end.tableWaiting ? 1 : 0,
    won: won || end.won ? 1 : 0, vests: end.vests || 0, maxArc,
    halfRationDays: halfDays.size,
    halfRationShare: r.gameDays > 0 ? halfDays.size / r.gameDays : 0,
    trustLT30Days: daySamples.filter(x => x.trust !== null && x.trust < 30).length,
    trustEnd: trusts.length ? trusts[trusts.length - 1] : null,
    givesEnd: (vv.gives || {})[vid] || 0,
    takesEnd: (vv.takes || {})[vid] || 0,
    everExiled: daySamples.some(x => x.exiled) ? 1 : 0,
    // raid classification fields
    gorgeNights: gorgeNights.length,
    totalGorgedKcal,
    predInstrErrors: (track.instrErrors || []).length,
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
      console.log(`  [${SIDE} ${pid} seed ${seed} i1] days=${a.days} end=${a.endReason} wave=${a.waveReach} hrShare=${a.halfRationShare.toFixed(4)} gives=${a.givesEnd} takes=${a.takesEnd} trustEnd=${a.trustEnd} national=${a.national} table=${a.table} exiled=${a.everExiled} gorgeN=${a.gorgeNights} gorgeK=${a.totalGorgedKcal} instrErr=${a.predInstrErrors}`);
      if (INVOC >= 2) {
        const b = await runCombo(pid, seed, 2);
        rows.push(b);
        let firstDiv = -1;
        const n = Math.min(a.hashes.length, b.hashes.length);
        for (let i = 0; i < n; i++) { if (a.hashes[i] !== b.hashes[i]) { firstDiv = i; break; } }
        const identical = firstDiv < 0 && a.hashes.length === b.hashes.length;
        const divDay = firstDiv >= 0 ? a.hashes[firstDiv].split(':')[0] : '-';
        gateLines.push(`${SIDE} ${pid} s${seed}: ${identical ? 'IDENTICAL' : 'DIVERGED@day' + divDay} (${n} days)`);
        console.log(`  [${SIDE} ${pid} seed ${seed} i2] ${identical ? 'IDENTICAL' : 'DIVERGED@day' + divDay} hrShare=${b.halfRationShare.toFixed(4)} gorgeN=${b.gorgeNights} gorgeK=${b.totalGorgedKcal}`);
      }
    }
  }
  const fs = require('fs');
  const out = `sweep-unloaddiv-${SIDE}-inv${INVOC}.json`;
  fs.writeFileSync(out, JSON.stringify({ side: SIDE, invocations: INVOC, days: DAYS, rows, gate: gateLines }, null, 1));
  console.log(`wrote ${out}`);
  if (gateLines.length) {
    const idn = gateLines.filter(l => l.includes('IDENTICAL')).length;
    console.log(`GATE: ${idn}/${gateLines.length} identical`);
    for (const l of gateLines) console.log('  ' + l);
  }
}
main().catch(e => { console.error('THREW', e); process.exit(2); });
