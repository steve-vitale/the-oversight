#!/usr/bin/env node
// scripts/sweep-spiralgate-20261017.js — the sim-spiralgate-b sweep
// (lever loop B, 2026-10-17; sim-findings #457).
//
// VOICE-ONLY lever: the day-1 "STARVING: ... The spiral has started." alarm
// is gated behind the SECOND consecutive starving night (engine/calories.js).
// First-tick hunger keeps honest framing ("You went to bed on an empty
// stomach") but drops the spiral alarm; the underlying health/energy damage
// and the STARVING:/WARNING states are untouched. Zero RNG-draw changes,
// zero mechanic changes (prosefix-b precedent).
//
// Sides: CONTROL (pre-fix tree, ab046665) vs ARMED (the lever).
// 8 fresh seeds x {leadfeast, belongfeast} x {control, armed} = 32 runs,
// 180d death-aware, identical seeds across sides (paired: control first on
// the unmodified tree, armed after the lever lands). Substrate (asserted up
// front): FEASTSCALE_R13=1, SEATDRIVE=0 explicit.
//
// PRE-REGISTERED (docs/MEASUREMENT.md §§9-12, 14 — binding):
//   PRIMARY GO: 0 'spiral has started' beats at pre-gate positions
//     (first-in-streak starving nights) on ARMED runs. Any armed pre-gate
//     spiral beat = the gate failed = NO-GO.
//   BLANK-EXISTENCE: CONTROL fires day-1..3 'spiral has started' beats at
//     pre-gate positions on >=X of 16 control runs. X is set from the
//     control probe BEFORE adjudicating the armed side (the bar is recorded
//     in the evidence header; the finding claims the blank is common).
//   GUARDRAILS (report-only): det-gate byte-identical per-dawn extHash
//     armed vs control (voice-only); wall metrics identical
//     (national/table/wins/exiled, median survival, death-cause shares).
//   Horizon: 180d death-aware (+10d tail). SMOKE=1: 2 seeds x 2 policies
//     x 25d (instrument check).
//
// Outputs: per-seed JSON + hashes to PERSEED_DIR, summary to OUT, spiral
// transcripts to TRANSCRIPT_DIR.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 \
//     SIDES=control OUT=evidence/2026-10-17/spiralgate-control.json \
//     PERSEED_DIR=evidence/2026-10-17/perseed-spiralgate \
//     TRANSCRIPT_DIR=evidence/2026-10-17/spiralgate-beats-control \
//     node scripts/sweep-spiralgate-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');

if (process.env.FEASTSCALE_R13 !== '1') { console.error('SWEEP STOP: FEASTSCALE_R13=1 required (substrate).'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 explicit required.'); process.exit(2); }

const SEEDS = (process.env.SEEDS || '1103,2219,3323,4427,5529,6631,7735,8837').split(',').map(Number);
const POLICIES = (process.env.POLICIES || 'leadfeast,belongfeast').split(',').map(s => s.trim());
const SIDES = (process.env.SIDES || 'control').split(',').map(s => s.trim());
const DAYS = Number(process.env.DAYS || 180);
const SMOKE = process.env.SMOKE === '1';
const OUT = process.env.OUT || null;
const PERSEED_DIR = process.env.PERSEED_DIR || null;
const TRANSCRIPT_DIR = process.env.TRANSCRIPT_DIR || null;

const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const FS = require('./policies/feastscale');
const PMAP = { leadfeast: FS.leadfeast, belongfeast: FS.belongfeast };

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// Mechanics-only per-dawn trajectory hash. Say TEXT is deliberately NOT in
// the hash (voice-only lever); day counters, health, kcal, roster, takes/
// gives, pantry are. (Same extHash as the sim-prosefix-b sweep.)
function extHash(Game) {
  try {
    const s = Game.state.scholar || {}, v = Game.state.village || {};
    const vid = s.villagerId || Game.villagerId;
    return [s.day, Math.round(s.health || 0), Math.round(s.kcal || 0),
      (v.roster || []).length,
      Math.round(((v.takes || {})[vid]) || 0), Math.round(((v.gives || {})[vid]) || 0),
      Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)) / 100)
    ].join('|');
  } catch (e) { return 'ERR'; }
}

// Spiral instrument: from the say stream, find STARVING beats (the overnight
// starvation-damage warning) and WARNING reserve-telegraph beats. A STARVING
// beat is PRE-GATE (first-in-streak) iff the same villagerId had no STARVING
// beat the day before — mirroring the code's consecutive-night gate.
function spiralInstruments(sayBuf) {
  const starving = []; // {day, vid, text, spiral}
  const warnings = [];
  for (const b of sayBuf) {
    const t = b.text;
    if (/STARVING:/.test(t)) {
      starving.push({ day: b.day, vid: b.vid, text: t, spiral: /spiral has started/i.test(t) });
    } else if (/WARNING: reserves critical/.test(t)) {
      warnings.push({ day: b.day, vid: b.vid });
    }
  }
  starving.sort((a, b2) => a.day - b2.day || String(a.vid).localeCompare(String(b2.vid)));
  const lastDay = {};
  for (const s of starving) {
    const key = String(s.vid);
    s.preGate = lastDay[key] !== s.day - 1;
    lastDay[key] = s.day;
  }
  const preGateSpiral = starving.filter(s => s.preGate && s.spiral);
  const postGateSpiral = starving.filter(s => !s.preGate && s.spiral);
  const preGateHonest = starving.filter(s => s.preGate && !s.spiral);
  const day13PreGateSpiral = preGateSpiral.filter(s => s.day <= 3);
  return {
    starvingN: starving.length,
    warningsN: warnings.length,
    preGateSpiralN: preGateSpiral.length,
    postGateSpiralN: postGateSpiral.length,
    preGateHonestN: preGateHonest.length,
    day13PreGateSpiralN: day13PreGateSpiral.length,
    starvingSamples: starving.slice(0, 12).map(s => ({
      day: s.day, vid: String(s.vid), preGate: s.preGate, spiral: s.spiral, text: s.text.slice(0, 160),
    })),
  };
}

async function oneRun(pid, seed, side) {
  const base = PMAP[pid];
  if (!base) throw new Error('unknown policy ' + pid);
  const policy = Object.assign({}, base);
  const od = base.daily, ou = base.upkeep, os = base.setup;
  const hashes = [];
  const sayBuf = [];
  let sayHookErr = 0, runCtx = null;
  const hist = { maxRank: 0, maxArc: 1, everTable: false, everWon: false, maxWave: 1 };
  policy.setup = (G, ctx) => { runCtx = ctx; return os ? os(G, ctx) : undefined; };
  policy.daily = (G, ctx) => {
    try {
      const pg = G.progState ? G.progState() : {};
      hist.maxArc = Math.max(hist.maxArc, pg.arc || 1);
      if (pg.tableWaiting) hist.everTable = true;
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[(G.scaleRank ? G.scaleRank() : 'village') || 'village'] || 0);
      if (G.won) hist.everWon = true;
      try { hist.maxWave = Math.max(hist.maxWave, G.unlockedWave ? G.unlockedWave() : 1); } catch (e) {}
    } catch (e) {}
    try { hashes.push(G.state.scholar.day + ':' + extHash(G)); } catch (e) {}
    return od ? od(G, ctx) : undefined;
  };
  if (ou) policy.upkeep = (G, ctx) => ou(G, ctx);
  let fin = null, result = null;
  await quietLog(async () => {
    const { Game } = await loadGame({ seed, mode: 'spiralgate-' + side });
    await setupGame(Game);
    const oSay = Game.say;
    Game.say = function (t) {
      try {
        const s = String(t);
        const sch = Game.state.scholar || {};
        sayBuf.push({ day: sch.day || 0, vid: sch.villagerId || Game.villagerId || '?', text: s.slice(0, 400) });
        if (sayBuf.length > 20000) sayBuf.splice(0, sayBuf.length - 20000);
      } catch (e) { sayHookErr++; }
      return oSay.apply(this, arguments);
    };
    try {
      result = await runDays(Game, policy, { days: SMOKE ? 25 : DAYS, sampleEvery: 1 });
    } finally {
      Game.say = oSay;
    }
  });
  const deaths = {};
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = (d.player ? 'player:' : (d.kind || 'other') + ':') + String(d.cause || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
    }
  } catch (e) {}
  const spiral = spiralInstruments(sayBuf);
  const out = {
    policy: pid, seed, side,
    days: result.days, gameDays: result.gameDays || result.days, endReason: result.endReason,
    national: hist.maxRank >= 2 ? 1 : 0, table: hist.everTable ? 1 : 0,
    wins: hist.everWon ? 1 : 0, exiled: 0,
    sittings: (runCtx && runCtx.sdSeatTaken) | 0,
    maxArc: hist.maxArc, maxWave: hist.maxWave, wave45: hist.maxWave >= 4 ? 1 : 0,
    deaths,
    spiral,
    hashes,
    sayHookErr,
    nSays: sayBuf.length,
  };
  if (result.samples && result.samples.exiled) out.exiled = 1;
  return { out, sayBuf };
}

function median(xs) {
  if (!xs.length) return 0;
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

async function main() {
  const t0 = process.hrtime.bigint(); // monotonic: the harness freezes Date.now()
  if (PERSEED_DIR) fs.mkdirSync(PERSEED_DIR, { recursive: true });
  if (TRANSCRIPT_DIR) fs.mkdirSync(TRANSCRIPT_DIR, { recursive: true });
  const perSeed = [];
  for (const side of SIDES) {
    for (const seed of SEEDS) {
      for (const pid of POLICIES) {
        console.log(`  run ${side} ${pid} s${seed} ...`);
        const { out, sayBuf } = await oneRun(pid, seed, side);
        perSeed.push(out);
        if (PERSEED_DIR) {
          fs.writeFileSync(path.join(PERSEED_DIR, `${side}-${pid}-s${seed}.json`), JSON.stringify(out, null, 1));
          fs.writeFileSync(path.join(PERSEED_DIR, `${side}-${pid}-s${seed}.hashes.json`), JSON.stringify(out.hashes));
        }
        if (TRANSCRIPT_DIR) {
          const beats = sayBuf.filter(b => /STARVING:|WARNING: reserves critical/.test(b.text))
            .map(b => `[d${b.day}] ${b.text}`);
          fs.writeFileSync(path.join(TRANSCRIPT_DIR, `${side}-${pid}-s${seed}.spiral.md`),
            `# starving/warning beats — ${side} ${pid} s${seed}\n\n${beats.join('\n\n') || '(none)'}\n`);
        }
      }
    }
  }
  const days = perSeed.map(p => p.gameDays);
  const summary = {
    sides: SIDES, seeds: SEEDS, policies: POLICIES, days: DAYS, smoke: SMOKE,
    runs: perSeed.length,
    wall: {
      national: perSeed.filter(p => p.national).length,
      table: perSeed.filter(p => p.table).length,
      wins: perSeed.filter(p => p.wins).length,
      wave45: perSeed.filter(p => p.wave45).length,
      medianDays: median(days), maxDays: Math.max(...days),
      maxArc: Math.max(...perSeed.map(p => p.maxArc)),
      maxWave: Math.max(...perSeed.map(p => p.maxWave)),
    },
    spiral: {
      preGateSpiralN: perSeed.reduce((t, p) => t + p.spiral.preGateSpiralN, 0),
      postGateSpiralN: perSeed.reduce((t, p) => t + p.spiral.postGateSpiralN, 0),
      preGateHonestN: perSeed.reduce((t, p) => t + p.spiral.preGateHonestN, 0),
      starvingN: perSeed.reduce((t, p) => t + p.spiral.starvingN, 0),
      warningsN: perSeed.reduce((t, p) => t + p.spiral.warningsN, 0),
      day13PreGateSpiralRuns: perSeed.filter(p => p.spiral.day13PreGateSpiralN > 0).length,
      runs: perSeed.length,
    },
    elapsedMin: (Number(process.hrtime.bigint() - t0) / 6e10).toFixed(1),
  };
  console.log(JSON.stringify(summary, null, 1));
  if (OUT) fs.writeFileSync(OUT, JSON.stringify({ summary, perSeed: perSeed.map(p => Object.assign({}, p, { hashes: p.hashes.length })) }, null, 1));
}

main().catch(e => { console.error('SWEEP ERROR: ' + (e && e.stack || e)); process.exit(1); });
