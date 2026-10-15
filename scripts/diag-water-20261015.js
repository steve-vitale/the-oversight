#!/usr/bin/env node
// diag-water-20261015.js — MECHANISM PROBE (exploratory instrument, not an arm).
//
// Reconstructs the killed bankleg layer (scripts/policies/diagbankleg.js,
// BANKLEGDIAG=1; the .bak copy, behavior-identical) and runs
// seeds 33,88 x {belongseek, leadfeast} x {control, diag}, 70d, capturing
// daily water/siege covariates around the early-siege window (d20-60).
//
// Goal: name the mechanism behind the 9 early collapse-thirst deaths
// (sim-findings #285/#286). Read-only wraps only; INFO-SKIP (exit 0) if the
// diag layer is absent (kill protocol).
//
// Usage: node scripts/diag-water-20261015.js [--seed N] [--policy P]
'use strict';
const fs = require('fs');
const path = require('path');
let bl = null;
try { bl = require('./policies/diagbankleg'); } catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: diagbankleg layer absent (diagnostic probe only); see evidence/2026-10-15/sim-thirstsafe-b.md');
    process.exit(0);
  }
  throw e;
}
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEEDS = (process.env.SEED ? [parseInt(process.env.SEED, 10)] : [33, 88]);
const POLICIES = process.env.POLICY ? [process.env.POLICY] : ['belongseek', 'leadfeast'];
const DAYS = 70;
const OUT = path.join(__dirname, '..', 'evidence', '2026-10-15', 'diag-water-20261015.json');

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

function installProbe(Game, M) {
  const ow = Game.worldMonsters ? Game.worldMonsters.bind(Game) : null;
  // deaths
  const oDeath = Game.registerDeath ? Game.registerDeath.bind(Game) : null;
  if (oDeath) {
    Game.registerDeath = function (d) {
      try {
        M.deaths.push({ day: gday(Game), cause: (d && d.cause) || '?',
          scholar: !!(d && d.villagerId && d.villagerId === Game.villagerId),
          name: (d && (d.name || d.villagerId)) || '?' });
      } catch (e) {}
      return oDeath(d);
    };
  }
  // water-duty assignments: record call AND outcome (ok/refused)
  const oAssign = Game.assignTask ? Game.assignTask.bind(Game) : null;
  if (oAssign) {
    Game.assignTask = function (vid, task, opts) {
      const r = oAssign(vid, task, opts);
      try {
        const d = gday(Game);
        M.assigns[d] = M.assigns[d] || {};
        const ok = !(r && r.refused) && r !== null;
        const key = task + (ok ? ':ok' : ':refused');
        M.assigns[d][key] = (M.assigns[d][key] || 0) + 1;
      } catch (e) {}
      return r;
    };
  }
  // water-duty resolution: did the haul land, and how much?
  const oResolve = Game.resolveOneAssignment ? Game.resolveOneAssignment.bind(Game) : null;
  if (oResolve) {
    Game.resolveOneAssignment = function (vid, a) {
      let d0 = 0;
      try { d0 = ((Game.state.village || {}).water || {}).dirty || 0; } catch (e) {}
      const r = oResolve(vid, a);
      try {
        if (a && a.task === 'water') {
          const d1 = ((Game.state.village || {}).water || {}).dirty || 0;
          const d = gday(Game);
          M.hauls = M.hauls || [];
          M.hauls.push({ day: d, vid: String(vid).slice(0, 10), added: Math.round(d1 - d0) });
        }
      } catch (e) {}
      return r;
    };
  }
  M.sample = function (when) {
    const v = Game.state.village || {};
    const vw = v.water || { clean: 0, dirty: 0 };
    const d = gday(Game);
    let havenMon = 0, totalMon = 0;
    try {
      const mons = Game.worldMonsters ? Game.worldMonsters() : [];
      totalMon = mons.length;
      const px = Game.map.px, py = Game.map.py;
      for (const m of mons) if (m && m.tx === px && m.ty === py) havenMon++;
    } catch (e) {}
    let minH = 100;
    try {
      const h = v.health || {};
      for (const id of (v.roster || [])) {
        if (id === Game.villagerId) continue;
        const hv = h[id] !== undefined ? h[id] : 100;
        if (hv < minH) minH = hv;
      }
    } catch (e) {}
    let home = false;
    try { home = !!Game.playerAtHaven(); } catch (e) {}
    M.days[d] = M.days[d] || {};
    let trustMean = null;
    try { const tr = Object.values(v.trust || {}); if (tr.length) trustMean = +(tr.reduce((a,b)=>a+b,0)/tr.length).toFixed(1); } catch (e) {}
    M.days[d][when] = { clean: Math.round(vw.clean || 0), dirty: Math.round(vw.dirty || 0),
      wood: v.wood || 0, home, havenMon, totalMon, minH: Math.round(minH),
      roster: (v.roster || []).length, trustMean };
  };
}

async function oneRun(seed, policyId, armed) {
  if (armed) process.env.BANKLEGDIAG = '1'; else delete process.env.BANKLEGDIAG;
  process.env.POLICY = policyId;
  const { Game } = await loadGame({ seed, mode: 'diag-water' });
  await quietLog(async () => { await setupGame(Game); });
  const M = { deaths: [], assigns: {}, days: {} };
  installProbe(Game, M);
  const base = bl.policyForRun();
  const wrapped = Object.assign({}, base, {
    id: (base.id || 'base') + '+diagprobe',
    daily(Game2, ctx) {
      try { if (process.env.NOSAMPLE) {} else M.sample("start"); } catch (e) {}
      const r = base.daily(Game2, ctx);
      try { if (process.env.NOSAMPLE) {} else M.sample("end"); } catch (e) {}
      return r;
    },
  });
  await quietLog(async () => {
    await runDays(Game, wrapped, { days: DAYS, sampleEvery: 1 });
  });
  return M;
}

(async () => {
  const rows = [];
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      for (const armed of [false, true]) {
        const M = await oneRun(seed, policyId, armed);
        rows.push({ seed, policyId, side: armed ? 'diag' : 'control', M });
        const th = M.deaths.filter(d => d.cause === 'thirst' && !d.scholar);
        console.log(`${policyId} s${seed} ${armed ? 'diag' : 'ctrl'}: thirstDeaths=${th.length} ${th.map(d => 'd' + d.day).join(',')}`);
      }
    }
  }
  fs.writeFileSync(OUT, JSON.stringify(rows, null, 1));
  console.log('wrote ' + OUT);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
