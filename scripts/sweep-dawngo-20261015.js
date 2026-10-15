#!/usr/bin/env node
// scripts/sweep-dawngo-20261015.js — PILOT sweep for the DAWNGO dawn
// go-inside + REACTIVE pantry draw layer (loop B, run
// fleshout-b-20261015T2022Z, axis food-economy, 2026-10-15).
//
// The killed series: dawnmeal (0.869x vs 0.60 — the inside/outside pantry
// wall, #328), goinside (1.158x — 420 takes taxed the trust ledger, #329),
// trustguard (1.001x, pro-cyclical take-blocking). This arm is the leanest
// variant: the real go-inside verb + a strictly reactive dawn draw —
// no EWMA, no packed-lunch mid-day chain, no take-blocking. Emergency
// only: pack empty + kcal < 0.5*cap, one take/day, eaten immediately.
//
// Sides: CONTROL (base leadcourt/belongseek + FEASTSCALE_R13=1, DAWNGO
// unset) vs ARMED (dawngo-wrapped + FEASTSCALE_R13=1, DAWNGO=1).
// 8 seeds x {leadcourt, belongseek} x {control, armed} = 32 runs, 180d
// death-aware, identical seeds across sides (OWN control in the SAME
// sweep — never an inherited baseline, sim-findings #247).
//
// Measurement: the distrhalf instrument (scripts/distrhalf-lib-20261015.js)
// attributes every hunger-day; PRIMARY is scholar hunger-days.
//
// PRE-REGISTERED (evidence header, docs/MEASUREMENT.md §§9-12, 14 — binding):
//   PRIMARY: scholar hunger-days armed <= 0.75x control (pooled).
//   GUARDRAILS: scholar starvation-deaths <= control+2; national armed >=
//     control-2/16; no new death mode with n>=3 on the armed side absent
//     on control.
//   MEDIAN SURVIVAL: REPORT-ONLY (fragile per metric review — record it,
//     never score it).
//   GO -> commit the layer for landing. MISS -> KILLED AT PILOT: layer
//     deleted per kill protocol, evidence + instruments only.
//   Horizon: 180d death-aware (+10d tail). This is the PILOT (8 seeds); a
//     confirm (12-16) only follows a GO.
//   Det-gate: scripts/test-dawngo-20261015.js PART C green first (DONE).
//   SMOKE=1: 1 seed (belongseek s109) x 25d — instrument-honesty asserts.
//   Sense-test: 2-3 dawn episodes read in the transcripts.
//
// Outputs: sweep JSON + per-seed JSON + transcripts (hunger beats + the
// layer's enter/draw voice lines for the sense-test).
//
// Usage:
//   SMOKE=1 node scripts/sweep-dawngo-20261015.js
//   node scripts/sweep-dawngo-20261015.js
//   OUT=... PERSEED_DIR=... TRANSCRIPT_DIR=... node scripts/sweep-dawngo-20261015.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installDistrHalf, finalizeDistrHalf } = require('./distrhalf-lib-20261015');

const SEEDS = (process.env.SEEDS || '109,218,327,436,545,654,763,872').split(',').map(Number);
const POLICIES = (process.env.POLICIES || 'leadcourt,belongseek').split(',');
const SIDES = (process.env.SIDES || 'both').split(',');
const DAYS = Number(process.env.DAYS || 180);
const SMOKE = process.env.SMOKE === '1';
const OUT = process.env.OUT || null;
const PERSEED_DIR = process.env.PERSEED_DIR || null;
const TRANSCRIPT_DIR = process.env.TRANSCRIPT_DIR || null;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// The courtship substrate for this run: the r13 feast layer BOTH sides
// (the feast chain was unreachable by construction without it, scale-wall
// r13). Not part of the lever — identical both arms.
const FEASTSCALE_WAS = process.env.FEASTSCALE_R13;
process.env.FEASTSCALE_R13 = '1';

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) {} return 0; }

function policyFor(pid, armed) {
  if (armed) process.env.DAWNGO = '1'; else delete process.env.DAWNGO;
  const dgPath = './policies/dawngo';
  delete require.cache[require.resolve(dgPath)];
  const dg = require(dgPath);
  const fsPath = './policies/feastscale';
  delete require.cache[require.resolve(fsPath)];
  const fs = require(fsPath);
  const base = require('./policies/' + pid)[pid];
  const levered = armed ? dg.wrapPolicy(base) : base;
  return fs.withFeastScale(levered, (armed ? 'dawngo-' : 'control-') + pid + '-r13',
    pid + (armed ? ' + DAWNGO dawn reactive draw' : ' control') + ' + FEASTSCALE_R13=1');
}

async function oneRun(seed, pid, armed, tdir) {
  const side = armed ? 'armed' : 'control';
  const policy = policyFor(pid, armed);
  const { Game } = await loadGame({ seed, mode: 'dawngo-' + side });
  await setupGame(Game);
  const track = installDistrHalf(Game);
  // Beat capture: hunger beats + the layer's enter/draw voice lines (sense-test).
  const beats = [];
  const oSay = Game.say;
  Game.say = function (t) {
    try {
      const s = String(t);
      if (/Half ration|half ration|STARVING|pantry is empty|better than an empty belly|duck into the hall for the stores|pantry is in the hall|went to sleep hungry|down to crumbs/i.test(s) && beats.length < 8000)
        beats.push({ day: gday(Game), text: s.slice(0, 500) });
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
  const wrapped = Object.assign({}, policy);
  const origDaily = policy.daily, origUpkeep = policy.upkeep;
  let dailyCalls = 0, ctxRef = null;
  const hist = { maxRank: 0, maxArc: 1, everTable: false, maxWave: 1 };
  wrapped.upkeep = (G, ctx) => { ctxRef = ctx; return origUpkeep ? origUpkeep(G, ctx) : undefined; };
  wrapped.daily = (G, ctx) => {
    dailyCalls++;
    ctxRef = ctx;
    try { track.dawn(G); } catch (e) {}
    try {
      const s = stdSnapshot(G);
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[s.rank] || 0);
      hist.maxArc = Math.max(hist.maxArc, s.arc || 1);
      if (s.tableWaiting) hist.everTable = true;
      if (G.unlockedWave) hist.maxWave = Math.max(hist.maxWave, G.unlockedWave() || 1);
    } catch (e) {}
    return origDaily ? origDaily(G, ctx) : undefined;
  };
  wrapped.setup = undefined;
  let result;
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, sampleEvery: 10 }); });
  const end = stdSnapshot(Game);
  const rep = finalizeDistrHalf(Game, track);
  const deaths = {};
  let starveDeaths = 0;
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      if (/starv/i.test(k)) starveDeaths++;
    }
  } catch (e) {}
  Game.say = oSay;
  try { track.uninstall(); } catch (e) {}
  if (tdir) {
    try {
      fs.mkdirSync(tdir, { recursive: true });
      fs.writeFileSync(path.join(tdir, `dawngo-${side}-${pid}-s${seed}.txt`),
        beats.map(b => `d${b.day}: ${b.text}`).join('\n'));
    } catch (e) {}
  }
  const hungerDays = rep.hungerDays;
  const scholarDays = hungerDays.filter(h => h.subject === 'scholar');
  const ctx = ctxRef || {};
  const dgLog = ctx._dgLog || [];
  const dgDaysWithTake = new Set(dgLog.filter(e => e.took).map(e => e.day)).size;
  delete process.env.DAWNGO;
  return {
    policy: pid, seed, side, days: result.days, gameDays: result.gameDays,
    endReason: result.endReason,
    won: end.won ? 1 : 0, maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    waveReach: hist.maxWave,
    deaths, starveDeaths,
    dailyCalls,
    hungerDays: hungerDays.length,
    scholarHungerDays: scholarDays.length,
    villagerHungerDays: hungerDays.length - scholarDays.length,
    byChannel: rep.byChannel,
    unattributed: rep.unattributed,
    // layer audit (armed side; control has none)
    dgTriggers: ctx._dgTriggers || 0,
    dgEnters: ctx._dgEnters || 0,
    dgTakes: ctx._dgTakes || 0,
    dgTakeDays: dgDaysWithTake,
    dgKcalEaten: Math.round(ctx._dgKcalEaten || 0),
    dgNoGain: ctx._dgNoGain || 0,
    dgRefused: ctx._dgRefused || 0,
    dgDawnRows: dgLog.length,
  };
}

async function smokeGate() {
  console.log('== dawngo SMOKE ==');
  const r = await oneRun(109, 'belongseek', true, null);
  const fails = [];
  const check = (n, c, d) => { console.log(`  ${c ? 'PASS' : 'FAIL'} ${n}${d ? ' — ' + d : ''}`); if (!c) fails.push(n); };
  check('policy.daily fired', r.dailyCalls >= 20, `calls=${r.dailyCalls}`);
  check('distrhalf instrument ran', r.hungerDays >= 0 && r.unattributed !== undefined, `hunger=${r.hungerDays} unattrib=${r.unattributed}`);
  check('dawn machinery ran hot', r.dgDawnRows >= 15, `dawnRows=${r.dgDawnRows}`);
  check('layer audit consistent', r.dgTriggers === r.dgTakes, `triggers=${r.dgTriggers} takes=${r.dgTakes}`);
  check('takes/enters/kcal consistent', r.dgTakes >= 0 && (r.dgTakes === 0 || (r.dgEnters > 0 && r.dgKcalEaten > 0)),
    `takes=${r.dgTakes} enters=${r.dgEnters} kcal=${r.dgKcalEaten}`);
  console.log(fails.length ? `\nSMOKE: ${fails.length} FAILURES` : '\nSMOKE: ALL GREEN');
  process.exit(fails.length ? 1 : 0);
}

(async () => {
  if (SMOKE) { await smokeGate(); return; }
  const sides = SIDES.includes('both') ? ['control', 'armed'] : SIDES;
  console.log(`== dawngo pilot: ${SEEDS.length} seeds x ${POLICIES.length} policies x ${sides.length} sides, ${DAYS}d, FEASTSCALE_R13=1 both sides ==`);
  const runs = [];
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      for (const side of sides) {
        const armed = side === 'armed';
        const r = await oneRun(seed, pid, armed, TRANSCRIPT_DIR);
        runs.push(r);
        console.log(`  [${side}/${pid} s${seed}] days=${r.days} end=${r.endReason} ` +
          `scholarHunger=${r.scholarHungerDays} dgTakes=${r.dgTakes} dgKcal=${r.dgKcalEaten} ` +
          `wave=${r.waveReach} rank=${r.maxRank}`);
        if (PERSEED_DIR) {
          try {
            fs.mkdirSync(PERSEED_DIR, { recursive: true });
            fs.writeFileSync(path.join(PERSEED_DIR, `dawngo-${side}-${pid}-s${seed}.json`),
              JSON.stringify(r, null, 1));
          } catch (e) {}
        }
      }
    }
  }
  const pool = (side) => runs.filter(r => r.side === side);
  const sum = (rs, k) => rs.reduce((t, r) => t + (r[k] || 0), 0);
  const med = (rs, k) => { const v = rs.map(r => r[k]).sort((a, b) => a - b); return v[Math.floor(v.length / 2)]; };
  const rep = {};
  for (const side of sides) {
    const rs = pool(side);
    rep[side] = {
      n: rs.length,
      scholarHungerDays: sum(rs, 'scholarHungerDays'),
      hungerDays: sum(rs, 'hungerDays'),
      starveDeaths: sum(rs, 'starveDeaths'),
      medianDays: med(rs, 'gameDays'),
      national: sum(rs, 'national'),
      table: sum(rs, 'table'),
      won: sum(rs, 'won'),
      wave4: rs.filter(r => r.waveReach >= 4).length,
      wave5: rs.filter(r => r.waveReach >= 5).length,
      dgTakes: sum(rs, 'dgTakes'),
      dgEnters: sum(rs, 'dgEnters'),
      dgTakeDays: sum(rs, 'dgTakeDays'),
      dgKcalEaten: sum(rs, 'dgKcalEaten'),
      dgNoGain: sum(rs, 'dgNoGain'),
      dgRefused: sum(rs, 'dgRefused'),
      dgTriggers: sum(rs, 'dgTriggers'),
      deaths: {},
    };
    for (const r of rs) for (const [k, v] of Object.entries(r.deaths)) rep[side].deaths[k] = (rep[side].deaths[k] || 0) + v;
  }
  let verdict = 'NO-GO', goDetail = '';
  if (sides.includes('control') && sides.includes('armed')) {
    const c = rep.control, a = rep.armed;
    const primary = c.scholarHungerDays > 0 ? (a.scholarHungerDays / c.scholarHungerDays) : (a.scholarHungerDays === 0 ? 0 : Infinity);
    const gPrimary = primary <= 0.75;
    const gStarve = a.starveDeaths <= c.starveDeaths + 2;
    const gNat = a.national >= c.national - 2;
    const newModes = Object.keys(a.deaths).filter(k => a.deaths[k] >= 3 && !(c.deaths[k] > 0));
    const gModes = newModes.length === 0;
    verdict = (gPrimary && gStarve && gNat && gModes) ? 'GO' : 'NO-GO';
    goDetail = `primary ratio=${primary.toFixed(3)} (GO<=0.75): ${gPrimary}; ` +
      `starveDeaths ${a.starveDeaths} vs ${c.starveDeaths} (<=ctrl+2): ${gStarve}; ` +
      `national ${a.national} vs ${c.national} (>=ctrl-2): ${gNat}; ` +
      `new death modes: ${newModes.length ? newModes.join(',') : 'none'}: ${gModes}; ` +
      `median ${a.medianDays}d vs ${c.medianDays}d (REPORT-ONLY)`;
  }
  const sweep = {
    label: 'dawngo-pilot', seeds: SEEDS, policies: POLICIES, sides, days: DAYS,
    substrate: 'FEASTSCALE_R13=1 both sides',
    when: new Date().toISOString(), runs, pooled: rep,
    go: { verdict, detail: goDetail },
    prereg: 'PRIMARY scholar hunger-days armed <= 0.75x control; guardrails: starveDeaths<=ctrl+2, national>=ctrl-2, no new death mode n>=3; median REPORT-ONLY',
  };
  if (OUT) { try { fs.writeFileSync(OUT, JSON.stringify(sweep, null, 1)); } catch (e) {} }
  console.log('\n-- pooled --');
  for (const side of sides) {
    const p = rep[side];
    console.log(`  ${side}: scholarHunger=${p.scholarHungerDays} hunger=${p.hungerDays} ` +
      `starveDeaths=${p.starveDeaths} median=${p.medianDays}d national=${p.national}/16 table=${p.table} ` +
      `won=${p.won} wave4=${p.wave4} wave5=${p.wave5} dgTakes=${p.dgTakes} dgTakeDays=${p.dgTakeDays} ` +
      `dgKcal=${p.dgKcalEaten} dgEnters=${p.dgEnters} dgNoGain=${p.dgNoGain} dgRefused=${p.dgRefused}`);
    console.log(`    deaths: ${JSON.stringify(p.deaths)}`);
  }
  console.log(`\nVERDICT: ${verdict} — ${goDetail}`);
  if (FEASTSCALE_WAS === undefined) delete process.env.FEASTSCALE_R13; else process.env.FEASTSCALE_R13 = FEASTSCALE_WAS;
})().catch(e => { console.error('FATAL', e); process.exit(1); });
