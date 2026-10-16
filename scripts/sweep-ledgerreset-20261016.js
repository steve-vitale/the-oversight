#!/usr/bin/env node
// scripts/sweep-ledgerreset-20261016.js — sim-findings #16 PILOT (loop B, 2026-10-16).
//
// The r8 fix (commit 26c1ac56) is already live: playerDeath resets the
// successor's personal takes/gives/takeHist/giveHist. This pilot measures
// the reset's causal contribution on the CURRENT base and checks for
// ledger regression.
//
//   control: the reset NEUTRALIZED driver-side (pre-death takes/gives/
//            takeHist/giveHist for the successor are snapshotted before
//            playerDeath and restored after — behaviorally identical to
//            pre-r8 for these four stores; all other r8/r9 changes held
//            constant). Reproduces the "mystery takes" bug on demand.
//   armed:   reset LIVE (current HEAD). Only difference vs control.
//
// 16 runs: 4 seeds x leadfeast + 4 seeds x belongfeast, each (policy, seed)
// under both cells (identical seeds across cells). 180d death-aware,
// SEATDRIVE=0 explicit, FEASTSCALE_R13=1.
//
// PRE-REGISTRATION (binding, §14 — written BEFORE sims; full header in
// evidence/2026-10-16/sim-ledgerreset-b.md):
//   PRIMARY (a) no ledger regression — scholar-vessel freeload stage>=2
//     escalations (warning+vote while bearer) armed <= control (aggregate);
//     succession trust-deltas sane (median within [-60,+60], no |d|>90);
//     death-cause mode set identical (no new mode with n>=2).
//   PRIMARY (b) coverage — >=1 succession-reset event on the armed side
//     across the pilot (a succession where the successor carried nonzero
//     NPC-era takes that the reset cleared); else no-coverage.
//   GUARDRAILS — national armed >= control-2; median survival armed >=
//     control-10d.
//   GO = PRIMARY(a) holds + PRIMARY(b) holds + guardrails hold.
//     (There is no new game code to land — the fix is already in HEAD.
//     GO closes finding #16 as fixed-by-r8, verified.)
//
// Usage:
//   SEATDRIVE=0 FEASTSCALE_R13=1 node scripts/sweep-ledgerreset-20261016.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

const OUTDIR = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-ledgerreset');
const DAYS = 180;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

const CELLS = [
  { key: 'control', neutralize: true },
  { key: 'armed', neutralize: false },
];
const ROADS = [
  { road: 'lead', policy: leadfeast, seeds: [11, 22, 33, 44] },
  { road: 'belong', policy: belongfeast, seeds: [55, 66, 77, 88] },
];

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function deepHist(h) { return (h || []).map(e => ({ day: e.day, kcal: e.kcal })); }

// Driver-side instruments. No game-code changes.
function instrument(Game, W, neutralize) {
  // --- succession ledger wrapper: count reset events; neutralize for control
  const oDeath = Game.playerDeath;
  if (typeof oDeath === 'function') Game.playerDeath = function (cause) {
    const v = this.state.village || {};
    const oldVid = this.villagerId;
    // snapshot the personal books of every roster member (pre-death)
    const snap = {};
    try {
      for (const id of (v.roster || [])) {
        snap[id] = {
          takes: ((v.takes || {})[id] || 0),
          gives: ((v.gives || {})[id] || 0),
          takeHist: deepHist((v.takeHist || {})[id]),
          giveHist: deepHist((v.giveHist || {})[id]),
          trust: ((v.trust || {})[id]),
        };
      }
    } catch (e) {}
    let r;
    try { r = oDeath.apply(this, arguments); }
    finally {
      try {
        const newVid = this.villagerId;
        if (newVid && newVid !== oldVid && snap[newVid]) {
          const pre = snap[newVid];
          W.successions++;
          W.trustDeltas.push((((v.trust || {})[newVid] || 0)) - (pre.trust == null ? 0 : pre.trust));
          if (pre.takes > 0) {
            W.resetEvents++;
            W.mysteryKcalCleared += pre.takes;
          }
          if (neutralize) {
            // control: reproduce pre-r8 — the successor keeps the NPC-era book
            try {
              v.takes = v.takes || {}; v.takes[newVid] = pre.takes;
              v.gives = v.gives || {}; v.gives[newVid] = pre.gives;
              v.takeHist = v.takeHist || {}; v.takeHist[newVid] = pre.takeHist;
              v.giveHist = v.giveHist || {}; v.giveHist[newVid] = pre.giveHist;
            } catch (e) {}
          }
        }
      } catch (e) {}
    }
    return r;
  };
  // --- freeloader stage>=2 escalations against the bearer
  const oWarn = Game.freeloadWarning, oVote = Game.freeloadVote;
  const esc = (stage, orig) => function (vid) {
    try {
      if (vid && vid === this.villagerId) {
        W.scholarFreeloadEsc.push({ day: gday(this), stage });
      }
    } catch (e) {}
    return orig ? orig.apply(this, arguments) : undefined;
  };
  if (typeof oWarn === 'function') Game.freeloadWarning = esc(2, oWarn);
  if (typeof oVote === 'function') Game.freeloadVote = esc(3, oVote);
  // --- succession/freeloader say-capture for the sense test
  const oSay = Game.say;
  const KW = /mantle|codex|successor|freeload|exil|taking|hoard|pantry|quiet around|earn this face|picks up|wake up somebody/i;
  Game.say = function (m) {
    try {
      const s = String((m && (m.text || m)) || m);
      if (KW.test(s) && W.transcript.length < 400) W.transcript.push(`d${gday(this)}: ${s.slice(0, 220)}`);
    } catch (e) {}
    return oSay ? oSay.apply(this, arguments) : undefined;
  };
}

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}

async function oneRun(roadDef, seed, cell) {
  const { Game } = await loadGame({ seed, mode: `ledgerreset-${cell.key}-${roadDef.road}`, fullTelemetry: false });
  await setupGame(Game);
  const W = { successions: 0, resetEvents: 0, mysteryKcalCleared: 0, trustDeltas: [],
              scholarFreeloadEsc: [], transcript: [], maxRank: 0 };
  instrument(Game, W, cell.neutralize);
  const base = roadDef.policy;
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const s = stdSnapshot(G);
      W.maxRank = Math.max(W.maxRank, RANK_ORDER[s.rank] || 0);
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 10 }); });
  const end = stdSnapshot(Game);
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  let exiled = 0;
  try { exiled = (typeof Game.justiceExiled === 'function' && Game.justiceExiled()) ? 1 : 0; } catch (e) {}
  const days = (result && result.days) || gday(Game);
  return {
    cell: cell.key, road: roadDef.road, seed, days,
    endReason: (result && result.endReason) || '?',
    won: end.won, national: W.maxRank >= 2, maxRank: W.maxRank, arc: end.arc,
    tableWaiting: end.tableWaiting, exiled,
    successions: W.successions, resetEvents: W.resetEvents,
    mysteryKcalCleared: W.mysteryKcalCleared,
    scholarFreeloadEsc2plus: W.scholarFreeloadEsc.filter(e => e.stage >= 2).length,
    scholarFreeloadEsc: W.scholarFreeloadEsc,
    trustDeltas: W.trustDeltas,
    deaths, transcript: W.transcript,
  };
}

async function main() {
  fs.mkdirSync(OUTDIR, { recursive: true });
  const rows = [];
  for (const roadDef of ROADS) {
    for (const seed of roadDef.seeds) {
      for (const cell of CELLS) {
        const tag = `${roadDef.road}-s${seed}-${cell.key}`;
        console.log(`--- ${tag} ---`);
        const t0 = Date.now();
        let row;
        try { row = await oneRun(roadDef, seed, cell); }
        catch (e) { console.log(`  RUN FAIL ${tag}: ${e.message}`); row = { cell: cell.key, road: roadDef.road, seed, runFail: String(e.message).slice(0, 120) }; }
        rows.push(row);
        fs.writeFileSync(path.join(OUTDIR, `${tag}.json`), JSON.stringify(row, null, 1));
        console.log(`  done in ${((Date.now() - t0) / 1000).toFixed(1)}s: days=${row.days} succ=${row.successions} resetEv=${row.resetEvents} esc2+=${row.scholarFreeloadEsc2plus} national=${row.national}`);
      }
    }
  }
  // aggregate control vs armed
  const agg = {};
  for (const cell of CELLS) {
    const rs = rows.filter(r => r.cell === cell.key && !r.runFail);
    const days = rs.map(r => r.days || 0).sort((a, b) => a - b);
    const td = rs.flatMap(r => r.trustDeltas || []);
    const dmodes = {};
    for (const r of rs) for (const k of Object.keys(r.deaths || {})) dmodes[k] = (dmodes[k] || 0) + (r.deaths[k] || 0);
    agg[cell.key] = {
      n: rs.length,
      national: rs.filter(r => r.national).length,
      won: rs.filter(r => r.won).length,
      table: rs.filter(r => r.tableWaiting).length,
      exiled: rs.filter(r => r.exiled).length,
      medianDays: days.length ? days[Math.floor(days.length / 2)] : 0,
      successions: rs.reduce((t, r) => t + (r.successions || 0), 0),
      resetEvents: rs.reduce((t, r) => t + (r.resetEvents || 0), 0),
      mysteryKcal: rs.reduce((t, r) => t + (r.mysteryKcalCleared || 0), 0),
      esc2plus: rs.reduce((t, r) => t + (r.scholarFreeloadEsc2plus || 0), 0),
      trustDeltaMedian: td.length ? td.slice().sort((a, b) => a - b)[Math.floor(td.length / 2)] : null,
      trustDeltaMin: td.length ? Math.min.apply(null, td) : null,
      trustDeltaMax: td.length ? Math.max.apply(null, td) : null,
      deathModes: dmodes,
    };
  }
  // verdicts
  const c = agg.control, a = agg.armed;
  const verdict = {
    coverage: (a.resetEvents || 0) >= 1,
    escNoRegress: (a.esc2plus || 0) <= (c.esc2plus || 0),
    trustSane: (a.trustDeltaMedian == null) || (a.trustDeltaMedian >= -60 && a.trustDeltaMedian <= 60 && (a.trustDeltaMin || 0) > -90 && (a.trustDeltaMax || 0) < 90),
    nationalGuard: (a.national || 0) >= (c.national || 0) - 2,
    medianGuard: (a.medianDays || 0) >= (c.medianDays || 0) - 10,
  };
  const newModes = Object.keys(a.deathModes || {}).filter(k => !(k in (c.deathModes || {})) && (a.deathModes || {})[k] >= 2);
  verdict.noNewDeathMode = !Object.keys(a.deathModes || {}).some(k => !(k in (c.deathModes || {})) && (a.deathModes[k] || 0) >= 2);
  verdict.GO = verdict.coverage && verdict.escNoRegress && verdict.trustSane && verdict.noNewDeathMode && verdict.nationalGuard && verdict.medianGuard;
  const out = { agg, verdict, rows: rows.map(r => { const t = Object.assign({}, r); delete t.transcript; return t; }) };
  fs.writeFileSync(path.join(OUTDIR, '..', 'ledgerreset-sweep.json'), JSON.stringify(out, null, 1));
  console.log('\n=== AGGREGATE ===');
  console.log(JSON.stringify(agg, null, 1));
  console.log('=== VERDICT ===');
  console.log(JSON.stringify(verdict, null, 1));
}

main().catch(e => { console.error('SWEEP FAIL', e); process.exit(2); });
