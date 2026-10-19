#!/usr/bin/env node
// scripts/sweep-wirewatch-20261019.js — wirewatch watch-drive pilot.
// Before/after on IDENTICAL seeds (MEASUREMENT.md §§9-12, 14-15): pilot
// 8 screened seeds x {leadfeast, belongfeast}, 180d death-aware,
// FEASTSCALE_R13=1 / SEATDRIVE=0 substrate. WIREWATCH=1 arms the drive;
// unset = byte-identical control.
//
// Per-run telemetry: scholar snare-recipe learns (day + via type from
// _grantRecipe), teach tele events (npc_trap, snare_lesson, snare_overhear),
// scholar position at each npc_trap (witness rate + the control-side
// counterfactual for mechanism attribution), drive engagement
// (come-home nights), survival + scale-wall numbers (scale-repro),
// starvation deaths + death-cause corpus (guardrails).
//
// Usage:
//   LEVER=wirewatch-baseline SEEDS="41711,41713,..." POLICIES="leadfeast,belongfeast" DAYS=180 \
//     FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-wirewatch-20261019.js
//   ... WIREWATCH=1 LEVER=wirewatch-armed ... (after side)
// Writes per-seed JSON to evidence/2026-10-19/perseed-wirewatch-b/ + summary.
//
// TOOLING ONLY — no game balance changes.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { POLICY_REGISTRY } = require('./sweep-compare');
const { attachScale, scaleRow, finalizeScale } = require('./scale-repro-20261013');

const dayOf = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; }; };

function atHaven(Game) {
  try {
    if (Game.playerAtHaven) return !!Game.playerAtHaven();
    const v = Game.state.village || {};
    return Game.map.px === (v.px ?? 4) && Game.map.py === (v.py ?? 4);
  } catch (e) { return false; }
}

// Trapline instruments: recipe learns, teach tele events, witness rate,
// drive engagement. Wrappers record-and-delegate; no RNG in the instrument.
function attachWirewatch(Game) {
  const t = {
    recipeLearns: [],   // {day, level, type, by} for recipe 'snare'
    tele: { npc_trap: 0, npc_trap_caught: 0, snare_lesson: 0, snare_overhear: 0 },
    awayReturns: 0,     // npc_trap teles with the scholar away (unwitnessed)
    awayReturnDays: [],  // days with >=1 unwitnessed return
    knowers0: [],
  };
  const origGR = Game._grantRecipe;
  if (typeof origGR === 'function') {
    Game._grantRecipe = function (id, level, src) {
      try {
        if (String(id) === 'snare') {
          t.recipeLearns.push({ day: dayOf(Game), level, type: String((src || {}).type || '?'), by: String((src || {}).by || '?').slice(0, 40) });
        }
      } catch (e) {}
      return origGR.apply(this, arguments);
    };
  }
  const origTele = Game.tele;
  Game.tele = function (type, data) {
    try {
      if (type === 'npc_trap') {
        t.tele.npc_trap++;
        if (data && data.caught) t.tele.npc_trap_caught++;
        if (!atHaven(Game)) {
          t.awayReturns++;
          const d = dayOf(Game);
          if (t.awayReturnDays[t.awayReturnDays.length - 1] !== d) t.awayReturnDays.push(d);
        }
      }
      else if (type === 'snare_lesson') t.tele.snare_lesson++;
      else if (type === 'snare_overhear') t.tele.snare_overhear++;
    } catch (e) {}
    return origTele.apply(this, arguments);
  };
  try {
    const roster = ((Game.state.village || {}).roster || []);
    for (const vid of roster) {
      let vp = null;
      try { vp = Game.vpOf(vid); } catch (e) {}
      if (vp && vp.knowsSnare) t.knowers0.push(String(vid).slice(0, 16));
    }
  } catch (e) {}
  return t;
}

async function main() {
  // env asserted up front; SWEEP STOPS on mismatch (trapjoin precedent)
  if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
    console.error('SWEEP STOP: FEASTSCALE_R13=1 and SEATDRIVE=0 required, got ' +
      `FEASTSCALE_R13=${process.env.FEASTSCALE_R13} SEATDRIVE=${process.env.SEATDRIVE}`);
    process.exit(2);
  }
  const wwOn = process.env.WIREWATCH === '1';
  const label = process.env.LEVER || (wwOn ? 'wirewatch-armed' : 'wirewatch-baseline');
  const seeds = (process.env.SEEDS || '41711,41713,41714,41715,41716,41718,41719,41720').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  const policyIds = (process.env.POLICIES || 'leadfeast,belongfeast').split(',').map(s => s.trim()).filter(Boolean);
  const days = parseInt(process.env.DAYS || '180', 10);
  const outDir = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-wirewatch-b', label);
  fs.mkdirSync(outDir, { recursive: true });
  console.log(`# wirewatch sweep: ${label} WIREWATCH=${wwOn ? '1' : 'unset'} seeds=[${seeds.join(',')}] policies=[${policyIds.join(',')}] days=${days}`);
  const t0 = Date.now();
  const rows = [];
  for (const pid of policyIds) {
    const base = POLICY_REGISTRY[pid];
    if (!base) throw new Error('unknown policy: ' + pid);
    for (const seed of seeds) {
      const { Game } = await loadGame({ seed, mode: 'wirewatch-' + pid });
      await setupGame(Game);
      const m = {};
      try { attachScale(Game, m); } catch (e) {}
      const tr = attachWirewatch(Game);
      let ctxRef = null;
      const policy = Object.assign({}, base, {
        setup(G, ctx) { ctxRef = ctx; if (base.setup) return base.setup(G, ctx); },
        daily(G, ctx) {
          if (!ctxRef) ctxRef = ctx;
          let r;
          if (base.daily) { try { r = base.daily(G, ctx); } catch (e) {} }
          try { if (m.scale && scaleRow) m.scale.daily.push(scaleRow(Game)); } catch (e) {}
          return r;
        },
      });
      const result = await runDays(Game, policy, { days, sampleEvery: 10 });
      let wave = 1;
      try { wave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
      let scale = {};
      try { if (m.scale && finalizeScale) scale = finalizeScale(Game, m) || {}; } catch (e) {}
      const firstLearn = tr.recipeLearns.find(l => l.level >= 1) || null;
      // starvation deaths + death-cause corpus (guardrails)
      let starv = 0;
      const causes = {};
      try {
        for (const d of (result.samples.deaths || [])) {
          const c = String(d.cause || 'unknown');
          causes[c] = (causes[c] || 0) + 1;
          if (/starv/i.test(c)) starv++;
        }
      } catch (e) {}
      let snareLevelEnd = 0;
      try { snareLevelEnd = (((Game.state.codex || {}).recipes || {}).snare || {}).level || 0; } catch (e) {}
      const row = {
        label, policy: pid, seed, wwOn,
        days: result.days, gameDays: result.gameDays, endReason: result.endReason,
        knowers0: tr.knowers0.length,
        snareLearnDay: firstLearn ? firstLearn.day : null,
        snareLearnVia: firstLearn ? firstLearn.type : null,
        snareLearnBy: firstLearn ? firstLearn.by : null,
        snareLevelEnd,
        recipeLearns: tr.recipeLearns,
        tele: tr.tele,
        awayReturns: tr.awayReturns,
        awayReturnDays: tr.awayReturnDays,
        witnessRate: tr.tele.npc_trap ? +((tr.tele.npc_trap - tr.awayReturns) / tr.tele.npc_trap).toFixed(3) : null,
        driveComeHomes: (ctxRef && ctxRef.wirewatchComeHomes) || 0,
        driveComeHomeDays: (ctxRef && ctxRef.wirewatchComeHomeDays) || [],
        starvationDeaths: starv,
        deathCauses: causes,
        unlockedWave: wave,
      };
      Object.assign(row, scale);
      rows.push(row);
      fs.writeFileSync(path.join(outDir, `${pid}-s${seed}.json`), JSON.stringify(row, null, 1));
      const nat = (row.nationalHeldDays || 0) > 0 ? 1 : 0;
      console.log(`  [${pid} s${seed}] d=${row.days}/${row.gameDays} ${row.endReason} learnDay=${row.snareLearnDay} via=${row.snareLearnVia} wit=${row.witnessRate} comeHomes=${row.driveComeHomes} awayRet=${row.awayReturns} starv=${row.starvationDeaths} nat=${nat} wave=${row.unlockedWave}`);
    }
  }
  const agg = (fn) => rows.reduce((tt, r) => tt + fn(r), 0);
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : null; };
  const learnDays = rows.filter(r => r.snareLearnDay != null).map(r => r.snareLearnDay);
  const witRates = rows.filter(r => r.witnessRate != null).map(r => r.witnessRate);
  const s = {
    label, wwOn, runs: rows.length,
    learnRate: rows.filter(r => r.snareLearnDay != null).length + '/' + rows.length,
    medianLearnDay: med(learnDays),
    learnVias: rows.filter(r => r.snareLearnVia).reduce((o, r) => { o[r.snareLearnVia] = (o[r.snareLearnVia] || 0) + 1; return o; }, {}),
    witnessRateMean: witRates.length ? +(witRates.reduce((a, b) => a + b, 0) / witRates.length).toFixed(3) : null,
    awayReturns: agg(r => r.awayReturns),
    npcTrap: agg(r => r.tele.npc_trap),
    snareLessons: agg(r => r.tele.snare_lesson),
    snareOverhears: agg(r => r.tele.snare_overhear),
    driveComeHomes: agg(r => r.driveComeHomes),
    medianSurvival: med(rows.map(r => r.days)),
    maxSurvival: Math.max.apply(null, rows.map(r => r.days).concat([0])),
    starvationDeaths: agg(r => r.starvationDeaths),
    national: agg(r => ((r.nationalHeldDays || 0) > 0 ? 1 : 0)),
    table: agg(r => (r.tableEntered ? 1 : 0)),
    wins: agg(r => (r.won ? 1 : 0)),
    waveMax: Math.max.apply(null, rows.map(r => r.unlockedWave || 1)),
    ms: Date.now() - t0,
  };
  fs.writeFileSync(path.join(outDir, '_summary.json'), JSON.stringify(s, null, 1));
  console.log('\nSUMMARY ' + JSON.stringify(s));
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
