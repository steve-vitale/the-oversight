#!/usr/bin/env node
// scripts/carcasshaul-sweep-20261015.js — the sim-carcasshaul PILOT (loop B,
// 2026-10-15). Measures the landed V1 map-memory + cross-node HAUL mechanism
// in long sims — the design-level answer to sim-findings #18 (97% of edible
// kill kcal rotted unlooted; the policy-side haul closed ~half where
// reachable; the rest is villager kills on other nodes).
//
// Sides: CONTROL (MAPMEM=0 — methods deleted at load, hooks inert, the
// pristine pattern) vs ARMED (MAPMEM=1 — untouched tip). 8 seeds ×
// {leadcourt, belongseek}, 180d death-aware, identical seeds across sides.
// Tooling-only: no game-code changes.
//
// Usage:
//   node scripts/carcasshaul-sweep-20261015.js
//   OUTDIR defaults to evidence/2026-10-15; writes
//   carcasshaul-pilot.json (full rep) + carcasshaul-pilot-control.json /
//   carcasshaul-pilot-armed.json (per-seed rows for the telemetry check).
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { applyMapmemGate, smokeMapmem } = require('./mapmem-gate-20261015');
const md = require('./meat-discovery-20261013');
const fc = require('./food-coupling-20261013');

const REGISTRY = {
  leadcourt: require('./policies/leadcourt').leadcourt,
  belongseek: require('./policies/belongseek').belongseek,
};
const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// haul narration: the sense-test reads these as a person, never a robot
const HAUL_LINE = /🥩|Meat's meat|back with meat|back empty-handed|too far gone|don't know what that is|Picked clean|Or it walked off/;

function attachHaulTelemetry(Game, armed) {
  const h = {
    departures: 0,      // HAUL objectives that launched
    arrivals: 0,        // mapmemHaulAt calls (reached the remembered node)
    completed: 0,       // arrivals that carried kcal (net > 0)
    haulK: 0,           // kcal deposited to the pantry via haul returns
    lines: [],          // sampled haul narration (sense-test)
  };
  const wrap = (name, fn) => {
    const f = Game[name];
    if (typeof f !== 'function') return;
    Game[name] = function (...a) { try { fn.apply(this, a); } catch (e) {} return f.apply(this, a); };
  };
  wrap('objDepart', (vid, o) => {
    try { if (o && o.kind === 'HAUL') h.departures++; } catch (e) {}
  });
  if (armed) {
    const origHaulAt = Game.mapmemHaulAt;
    Game.mapmemHaulAt = function (vid) {
      h.arrivals++;
      const r = origHaulAt.apply(this, arguments);
      try {
        const o = Game.objOf ? Game.objOf(vid) : null;
        if (o && (o.haulKcal || 0) > 0) h.completed++;
      } catch (e) {}
      return r;
    };
  }
  const origRet = Game.objReturnEffect;
  if (typeof origRet === 'function') {
    Game.objReturnEffect = function (vid, purpose) {
      let hk = 0;
      try { if (purpose === 'haul') { const o = Game.objOf(vid); hk = (o && o.haulKcal) || 0; } } catch (e) {}
      const r = origRet.apply(this, arguments);
      if (purpose === 'haul' && hk > 0) h.haulK += hk;
      return r;
    };
  }
  const origSay = Game.say;
  if (typeof origSay === 'function') {
    Game.say = function (text) {
      try {
        if (HAUL_LINE.test(String(text || '')) && h.lines.length < 25) {
          let day = 0;
          try { day = (Game.state.scholar || {}).day || 0; } catch (e) {}
          h.lines.push('d' + day + ': ' + String(text).slice(0, 220));
        }
      } catch (e) {}
      return origSay.apply(this, arguments);
    };
  }
  return h;
}

async function runOne(pid, seed, side) {
  const armed = side === 'armed';
  process.env.MAPMEM = armed ? '1' : '0';
  const base = REGISTRY[pid];
  if (!base) throw new Error('unknown policy: ' + pid);
  const label = `${side}/${pid}/s${seed}`;
  const { Game } = await loadGame({ seed, mode: 'ch-pilot-' + side + '-' + pid });
  applyMapmemGate(Game);
  const smoke = smokeMapmem(Game, base, label, armed);
  if (smoke.length) throw new Error('SMOKE FAIL: ' + smoke.join('; '));
  await setupGame(Game);
  const m1 = md.attachInstruments(Game);
  const m2 = fc.attachInstruments(Game);
  const h = attachHaulTelemetry(Game, armed);
  const hist = { maxRank: 0, everTable: false, maxWave: 1 };
  let policyActs = 0;
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => {
    try {
      policyActs++;
      m2.daily.push(fc.dailyRow(G));
      const rk = RANK_ORDER[(G.scaleRank ? G.scaleRank() : 'village')] || 0;
      hist.maxRank = Math.max(hist.maxRank, rk);
      if (G.progState && G.progState().tableWaiting) hist.everTable = true;
      if (G.unlockedWave) hist.maxWave = Math.max(hist.maxWave, G.unlockedWave());
    } catch (e) {}
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  const result = await runDays(Game, policy, { days: DAYS });
  if (policyActs < 10) throw new Error('SMOKE FAIL: ' + label + ' policy.daily fired ' + policyActs + 'x (suite may be policy-less)');
  const row = Object.assign({ label, side, policy: pid, seed }, md.finalize(Game, m1, result));
  row.national = hist.maxRank >= 2 ? 1 : 0;
  row.table = (hist.everTable || row.table) ? 1 : 0;
  row.maxWave = Math.max(row.maxWave, hist.maxWave);
  // haul telemetry (the pilot's primary)
  row.haulDepartures = h.departures;
  row.haulArrivals = h.arrivals;
  row.haulCompleted = h.completed;
  row.villagerHaulK = h.haulK;
  row.haulSharePct = row.carcassKcal > 0 ? +((h.haulK / row.carcassKcal) * 100).toFixed(2) : 0;
  row.haulLines = h.lines;
  // guardrails: rot per-villager-day (r25b calibration x1.335)
  try {
    let vd = 0;
    for (const r of (m2.daily || [])) vd += (r.pop || 0);
    row.rotPerVd = vd > 0 ? +(m2.rot.kcal / vd).toFixed(1) : 0;
    row.starveDays = (m2.daily || []).filter(r => r.starved).length;
    row.villagerDays = vd;
  } catch (e) { row.rotPerVd = 0; row.starveDays = 0; }
  console.log(`  [${label}] d=${row.days} ${row.endReason} haulK=${(row.villagerHaulK/1000).toFixed(1)}k share=${row.haulSharePct}% dep=${row.haulDepartures} arr=${row.haulArrivals} comp=${row.haulCompleted} carcass=${(row.carcassKcal/1000).toFixed(1)}k rot/vd=${row.rotPerVd} nat=${row.national} wave=${row.maxWave} kills=${row.kills}`);
  return row;
}

function summarize(side, rows) {
  const med = (vs) => { vs = vs.slice().sort((a, b) => a - b); return vs.length ? vs[Math.floor(vs.length / 2)] : 0; };
  const sum = (f) => rows.reduce((t, r) => t + (f(r) || 0), 0);
  return {
    n: rows.length,
    medianDays: med(rows.map(r => r.days)),
    national: sum(r => r.national), table: sum(r => r.table),
    wins: sum(r => r.wins), exiled: sum(r => r.exiled),
    wave45: rows.filter(r => r.maxWave >= 4).length,
    haulK: sum(r => r.villagerHaulK),
    medianHaulK: med(rows.map(r => r.villagerHaulK)),
    runsWithHaul: rows.filter(r => r.villagerHaulK > 0).length,
    carcassKcal: sum(r => r.carcassKcal),
    haulSharePct: sum(r => r.carcassKcal) > 0 ? +((sum(r => r.villagerHaulK) / sum(r => r.carcassKcal)) * 100).toFixed(2) : 0,
    starveDays: sum(r => r.starveDays),
    rotPerVdMean: rows.length ? +((rows.reduce((t, r) => t + (r.rotPerVd || 0), 0) / rows.length).toFixed(1)) : 0,
  };
}

(async () => {
  const allRows = [];
  for (const side of ['control', 'armed']) {
    for (const pid of Object.keys(REGISTRY)) {
      for (const seed of SEEDS) {
        allRows.push(await runOne(pid, seed, side));
      }
    }
  }
  const ctrl = summarize('control', allRows.filter(r => r.side === 'control'));
  const armed = summarize('armed', allRows.filter(r => r.side === 'armed'));
  console.log('\n=== sim-carcasshaul PILOT (8 seeds x 2 policies, 180d death-aware) ===');
  for (const [nm, s] of [['CONTROL', ctrl], ['ARMED  ', armed]]) {
    console.log(`[${nm}] n=${s.n} medDays=${s.medianDays} national=${s.national}/${s.n} table=${s.table}/${s.n} wins=${s.wins} exiled=${s.exiled} wave45=${s.wave45}/${s.n}`);
    console.log(`  haul: total=${(s.haulK/1000).toFixed(1)}k median=${(s.medianHaulK/1000).toFixed(1)}k runsWithHaul=${s.runsWithHaul}/${s.n} share=${s.haulSharePct}% carcass=${(s.carcassKcal/1000).toFixed(1)}k`);
    console.log(`  guard: starveDays=${s.starveDays} rotPerVdMean=${s.rotPerVdMean}`);
  }
  console.log(`\nPRIMARY: armed median haulK ${(armed.medianHaulK/1000).toFixed(1)}k/run vs GO >= 1.5k; runsWithHaul ${armed.runsWithHaul}/16 vs GO >= 6/16`);
  const outdir = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-15');
  fs.mkdirSync(outdir, { recursive: true });
  const write = (name, obj) => {
    const p = path.join(outdir, name);
    fs.writeFileSync(p, JSON.stringify(obj, null, 1));
    console.log('wrote', p);
  };
  const rep = { label: 'carcasshaul-pilot', days: DAYS, seeds: SEEDS,
    policies: Object.keys(REGISTRY), control: ctrl, armed, rows: allRows };
  write('carcasshaul-pilot.json', rep);
  const isArmed = (r) => r.side === 'armed';
  const flat = (rows) => ({
    national: rows.reduce((t, r) => t + (r.national || 0), 0),
    table: rows.reduce((t, r) => t + (r.table || 0), 0),
    wins: rows.reduce((t, r) => t + (r.wins || 0), 0),
    exiled: rows.reduce((t, r) => t + (r.exiled || 0), 0),
  });
  write('carcasshaul-pilot-control.json', Object.assign({ label: 'carcasshaul-pilot-control',
    rows: allRows.filter(r => !isArmed(r)) }, flat(allRows.filter(r => !isArmed(r)))));
  write('carcasshaul-pilot-armed.json', Object.assign({ label: 'carcasshaul-pilot-armed',
    rows: allRows.filter(r => isArmed(r)) }, flat(allRows.filter(r => isArmed(r)))));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
