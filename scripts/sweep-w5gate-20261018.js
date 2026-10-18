#!/usr/bin/env node
// sweep-w5gate-20261018.js — the tableActive gate refinement re-measured
// on the NEW readiness bar (flesh-out loop, 2026-10-18, scale-onramp axis,
// ARM sim-w5gate-a).
//
// 8 FRESH seeds [54201..54208] (verified: zero per-seed files in
// evidence/*/perseed-*; the only "54207" hits in evidence are foraged-food
// kcal counts) x {leadfeast, belongfeast} x {control, armed}, 180d
// death-aware, identical seeds both sides. Own control in the SAME sweep.
//
// Substrate (the exact readconfirm instrument — the current stack):
//   FEASTSCALE_R13=1  TRIBFLOOR=1  SUCCGRACE=1  RAIDDENSITY=1
//   WINPURSUIT=1  WINDEFER=1
//   SEATDRIVE=0  (REQUIRED — post-c004b9dd the seat default is ON; unset
//   now means the win-side stack. finding #380.)
//   NODEWITNESS=1
//   control: W5R.leadseat/belongseat with WAVE5REACH unset (the layer
//     gate-offs to pure delegation)
//   armed:   the SAME objects + WAVE5REACH=1 (the refined tableActive gate)
//
// Wave-5 unlock DATING (finding #360): no engine telemetry event fires on
// wave unlock — this sweep samples Game.unlockedWave() DAILY and records
// the first day it reads 5, PLUS a run-end sample (finding #376: a
// final-day unlock is never daily-sampled — the run-end sample catches it
// and records gameDays as the unlock day).
//
// Gate-liveness tracking (finding #369's instrument, reused):
//   liveDays      — huntLive true at the daily check (the refined gate)
//   recoveredDays — days the OLD heuristic (tableDone||tableWaiting) would
//                   have stranded (invitation pending, table NOT active)
//                   but the refined gate keeps live
//   sanctityDays  — days the refined gate stands down on engine-honest
//                   grounds (Game.tableActive() true — the sitting)
//
// Pre-registered (binding, MEASUREMENT §14 — see
// evidence/2026-10-18/sim-w5gate.md):
//   PRIMARY (engagement-conditioned): GO condition A: >=4 engaged pairs
//     (armed run has >=1 hunt engagement) with armed-earlier wave-5 unlock
//     (armed wave5Day < control wave5Day; armed-only unlock counts as
//     armed-earlier; control-only counts as armed-later; both-miss
//     excluded), OR GO condition B: median paired unlock-day delta
//     (armed - control) <= -5d over engaged pairs where BOTH unlocked.
//   GUARDRAILS: no new death mode at n>=3; national >= control - 2;
//     median survival >= control - 25d.
//   ENGAGEMENT GATE: <3 engagements across 16 armed runs = NO-CONTACT:
//     kill the arm, revert the refinement in-tree.
// Per-seed JSONs carry numeric national, table, wins, exiled, wave5,
// wave5Day for the coordinator's telemetry-check (keys EXACT — the
// won/wins schema-drift trap, twice this week).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 node scripts/sweep-w5gate-20261018.js
// Targeted re-runs: SEEDS="54201,54202" ONLY="leadfeast,armed;belongfeast,control"
'use strict';
const fs = require('fs');
const path = require('path');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');
const W5R = require('./policies/wave5reach');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('SWEEP STOP: NODEWITNESS=1 is required (channel).'); process.exit(2); }
if (!WD.layerOn()) { console.error('SWEEP STOP: windefer layerOn() false despite WINDEFER=1.'); process.exit(2); }
if (SD.layerOn()) { console.error('SWEEP STOP: seatdrive layerOn() true with SEATDRIVE=0 — substrate broken.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [54201, 54202, 54203, 54204, 54205, 54206, 54207, 54208]).filter(Number.isFinite);
const DAYS = 180;
const POLICIES = ['belongfeast', 'leadfeast'];
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-w5gate');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-18', 'w5gate-beats');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// Both sides share the same policy objects — WAVE5REACH is the only switch.
function policyFor(policyId) {
  return policyId === 'leadfeast' ? W5R.leadseat : W5R.belongseat;
}

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// Beat capture: ring buffer. Keyed on wave-5/unlock/standing language for
// the SENSE-TESTING read.
const BEAT_RE = /wave ?5|producers|standing|unlock|readiness|facing|wave ?4|mirror draft|won|win |died|dead|national|exile|hunt|expedition/i;
function attachBeats(Game, t) {
  t.beats = [];
  const push = (text) => {
    try {
      const s = String((text && (text.text || text.msg || text.message)) || text || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 260);
      if (BEAT_RE.test(s)) {
        t.beats.push({ day: gday(Game), text: s });
        if (t.beats.length > 4000) t.beats.splice(0, 500);
      }
    } catch (e) {}
  };
  const origSay = Game.say ? Game.say.bind(Game) : null;
  const origSys = Game.sysSay ? Game.sysSay.bind(Game) : null;
  Game.say = function (msg) { push(msg); return origSay ? origSay(msg) : msg; };
  if (origSys) Game.sysSay = function (msg) { push(msg); return origSys(msg); };
}

function attachDeaths(Game, t) {
  t.deaths = [];
  const origReg = Game.registerDeath ? Game.registerDeath.bind(Game) : null;
  if (origReg) {
    Game.registerDeath = function (opts) {
      const r = origReg(opts);
      try {
        const o = opts || {};
        if (t.deaths.length < 400) {
          t.deaths.push({
            day: gday(Game), kind: String(o.kind || '?'),
            vid: String(o.villagerId || o.monsterId || '?').slice(0, 24),
            name: String(o.name || '?').slice(0, 40),
            cause: String(o.cause || '?').slice(0, 60),
          });
        }
      } catch (e) {}
      return r;
    };
  }
}

async function oneRun(seed, policyId, side) {
  const armed = side === 'armed';
  if (armed) process.env.WAVE5REACH = '1'; else delete process.env.WAVE5REACH;
  const base = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: `w5gate-${side}`, fullTelemetry: false });
  await setupGame(Game);
  let runCtx = null, w5Live = null, seatLive = null, deferLive = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    runCtx = ctx; w5Live = W5R.wave5reachOn(); seatLive = SD.layerOn(); deferLive = WD.layerOn();
    if (oSetup) return oSetup(G, ctx);
  };
  const hist = { maxRank: 0, everTable: false, exiled: false };
  // finding #360: sample unlockedWave() daily — the unlock day is the
  // first day the read hits the new wave.
  const waveTrace = { maxWave: 1, wave4Day: null, wave5Day: null, liveDays: 0, recoveredDays: 0, sanctityDays: 0 };
  const hashes = [];
  const beats = { beats: [] };
  const deathsT = { deaths: [] };
  attachBeats(Game, beats);
  attachDeaths(Game, deathsT);
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) hist.everTable = true;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      const uw = (G.unlockedWave ? G.unlockedWave() : 1) | 0;
      if (uw > waveTrace.maxWave) waveTrace.maxWave = uw;
      const day = gday(G);
      if (uw >= 4 && waveTrace.wave4Day == null) waveTrace.wave4Day = day;
      if (uw >= 5 && waveTrace.wave5Day == null) waveTrace.wave5Day = day;
      if (armed && uw >= 4 && uw < 5) {
        const live = W5R.huntLive(G);
        if (live) waveTrace.liveDays++;
        else {
          let active = false;
          try { active = !!(G.tableActive && G.tableActive()); } catch (e) {}
          if (active) waveTrace.sanctityDays++;
        }
        // The refinement's own instrument: old-heuristic-stranded but
        // new-gate-live (pending invitation, table not active).
        let tw = false, ta = false;
        try { tw = !!(pg.tableWaiting); } catch (e) {}
        try { ta = !!(G.tableActive && G.tableActive()); } catch (e) {}
        if (tw && !ta && live) waveTrace.recoveredDays++;
      }
    } catch (e) {}
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try { hashes.push(G.state.scholar.day + ':' + dayHash(Game)); } catch (e) {}
    return r;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  if (w5Live !== armed || seatLive !== false || deferLive !== true)
    throw new Error(`layer-live marker mismatch: side=${side} w5r=${w5Live} seat=${seatLive} defer=${deferLive}`);
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  const endInfo = { won: !!Game.won, gameDays: result.gameDays, endReason: result.endReason };
  let maxWave = Math.max(result.maxWaveUnlocked || 1, waveTrace.maxWave);
  let gameDays = 0;
  try { gameDays = (Game.state.scholar || {}).day || 0; } catch (e) {}
  // finding #376 edge: a final-day unlock is never daily-sampled — the
  // run-end read catches it and records gameDays as the unlock day.
  try {
    const endUw = (Game.unlockedWave ? Game.unlockedWave() : 1) | 0;
    if (endUw > maxWave) maxWave = endUw;
    if (maxWave >= 5 && waveTrace.wave5Day == null) waveTrace.wave5Day = gameDays;
    if (maxWave >= 4 && waveTrace.wave4Day == null) waveTrace.wave4Day = gameDays;
  } catch (e) {}
  const out = {
    seed, policyId, side,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    deaths,
    maxRank: hist.maxRank, national: hist.maxRank >= 2 ? 1 : 0,
    table: hist.everTable ? 1 : 0, wins: endInfo.won ? 1 : 0,
    maxWave, wave45: maxWave >= 4 ? 1 : 0, wave5: maxWave >= 5 ? 1 : 0,
    wave4Day: waveTrace.wave4Day, wave5Day: waveTrace.wave5Day,
    exiled: hist.exiled ? 1 : 0,
    // wave5reach counters + refined gate liveness
    w5Hunts: (runCtx && runCtx.w5Hunts) || 0,
    w5HuntLegs: (runCtx && runCtx.w5HuntLegs) || 0,
    w5HuntSteps: (runCtx && runCtx.w5HuntSteps) || 0,
    w5HuntEngaged: (runCtx && runCtx.w5HuntEngaged) || 0,
    w5BloodFights: (runCtx && runCtx.w5BloodFights) || 0,
    w5FacingFights: (runCtx && runCtx.w5FacingFights) || 0,
    w5LiveDays: waveTrace.liveDays,
    w5SanctityDays: waveTrace.sanctityDays,
    w5RecoveredDays: waveTrace.recoveredDays,
    hashes,
  };
  // Numeric fields the coordinator's telemetry-check reads: national,
  // table, wins, exiled, wave5 — all 0/1. gameDays is the survival day.
  // wave5Day is the unlock day (daily sample, or run-end for #376 edge).
  fs.mkdirSync(path.join(EVID, side), { recursive: true });
  fs.writeFileSync(path.join(EVID, side, `${policyId}-s${seed}.json`), JSON.stringify(out, null, 1));
  try {
    if (beats.beats.length) {
      fs.mkdirSync(BEATS, { recursive: true });
      fs.writeFileSync(path.join(BEATS, `${policyId}-${side}-s${seed}.json`), JSON.stringify(beats.beats, null, 1));
    }
  } catch (e) {}
  console.log(`  [${side} ${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} nat=${out.national} wave=${out.maxWave} w4d=${out.wave4Day} w5=${out.wave5} w5d=${out.wave5Day} table=${out.table} wins=${out.wins} hunts=${out.w5Hunts} live=${out.w5LiveDays} recov=${out.w5RecoveredDays} sanct=${out.w5SanctityDays} engaged=${out.w5HuntEngaged} exiled=${out.exiled}`);
  return out;
}

function median(xs) {
  if (!xs.length) return 0;
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

(async () => {
  let only = null;
  if (process.env.ONLY) {
    only = new Set();
    for (const part of String(process.env.ONLY).split(';')) {
      const [p, s] = part.split(',').map(x => x.trim());
      only.add(`${p}|${s}`);
    }
  }
  const runs = [];
  for (const policyId of POLICIES)
    for (const seed of SEEDS)
      for (const side of ['control', 'armed'])
        if (!only || only.has(`${policyId}|${side}`)) runs.push([seed, policyId, side]);
  const results = [];
  for (const [seed, policyId, side] of runs) {
    results.push(await oneRun(seed, policyId, side));
  }
  // Summary (judgment happens in the evidence file, not here).
  for (const side of ['control', 'armed']) {
    const rs = results.filter(r => r.side === side);
    const sum = (f) => rs.reduce((a, r) => a + (r[f] | 0), 0);
    console.log(`\n[${side} n=${rs.length}] wave4=${sum('wave45')} wave5=${sum('wave5')} national=${sum('national')} table=${sum('table')} wins=${sum('wins')} exiled=${sum('exiled')} medianDays=${median(rs.map(r => r.gameDays))} hunts=${sum('w5Hunts')} engaged=${sum('w5HuntEngaged')} live=${sum('w5LiveDays')} recov=${sum('w5RecoveredDays')} sanct=${sum('w5SanctityDays')}`);
    console.log(`  wave5Days: ${rs.filter(r => r.wave5).map(r => `${r.policyId}-s${r.seed}=d${r.wave5Day}`).join(' ')}`);
  }
  const engagedPairs = [];
  for (const seed of SEEDS) for (const policyId of POLICIES) {
    const a = results.find(r => r.seed === seed && r.policyId === policyId && r.side === 'armed');
    const c = results.find(r => r.seed === seed && r.policyId === policyId && r.side === 'control');
    if (a && c && a.w5HuntEngaged >= 1) {
      let verdict;
      if (a.wave5Day != null && c.wave5Day != null) verdict = a.wave5Day < c.wave5Day ? 'armed-earlier' : (a.wave5Day > c.wave5Day ? 'armed-later' : 'tie');
      else if (a.wave5Day != null) verdict = 'armed-earlier (armed-only)';
      else if (c.wave5Day != null) verdict = 'armed-later (control-only)';
      else verdict = 'both-miss';
      engagedPairs.push({ seed, policyId, aDay: a.wave5Day, cDay: c.wave5Day, delta: (a.wave5Day != null && c.wave5Day != null) ? a.wave5Day - c.wave5Day : null, verdict });
    }
  }
  console.log(`\n[engaged pairs n=${engagedPairs.length}]`);
  for (const p of engagedPairs) console.log(`  ${p.policyId}-s${p.seed}: armed d${p.aDay} vs control d${p.cDay} delta=${p.delta} -> ${p.verdict}`);
  const both = engagedPairs.filter(p => p.delta != null);
  if (both.length) console.log(`  median paired delta (both-unlocked, n=${both.length}): ${median(both.map(p => p.delta))}`);
  const armedEarlier = engagedPairs.filter(p => p.verdict.startsWith('armed-earlier')).length;
  console.log(`  engaged pairs with armed-earlier unlock: ${armedEarlier}`);
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(5); });
