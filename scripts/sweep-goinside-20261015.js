#!/usr/bin/env node
// scripts/sweep-goinside-20261015.js — PILOT sweep for the goinside
// dawn go-inside pack-lunch layer (loop B, sim-findings #314/#315/#328,
// 2026-10-15).
//
// Claims sim-findings #328's named next (a): "dawn pack-lunch with a REAL
// go-inside verb before the draw". Rebuilds the killed sim-dawnmeal-b
// pack-lunch (0.869x vs the 0.60x bar — killed at the inside/outside
// pantry wall) and adds, before the dawn draw, the REAL Game.enterBuilding()
// when havenStoresAccess()==='none' and the scholar is on the haven tile.
//
// Sides: CONTROL (base leadcourt/belongseek, GOINSIDE unset) vs ARMED
// (goinside-wrapped, GOINSIDE=1). 8 seeds x {leadcourt, belongseek} x
// {control, armed} = 32 runs, 180d death-aware, identical seeds across
// sides (OWN control in the SAME sweep — never an inherited baseline,
// sim-findings #247).
//
// Measurement: the distrhalf instrument (scripts/distrhalf-lib-20261015.js)
// attributes every hunger-day; PRIMARY is scholar hunger-days.
//
// PRE-REGISTERED (evidence header, docs/MEASUREMENT.md §§9-12, 14 — binding):
//   PRIMARY: scholar hunger-days armed <= 0.60x control (pooled).
//   GUARDRAILS: scholar starvation-deaths <= control+2; median survival
//     armed >= control-10d; national armed >= control-2/16; no new death
//     mode with n>=3 on the armed side absent on control.
//   FREQUENCY GUARD (#169 boundary): armed giTakes/run <= 16 (2x the killed
//     middaymeal arm's take rate); <=1 take/day hard in the layer. Exceed
//     with no starvation gain -> KILL as reactive-but-too-often.
//   GO -> commit the layer for landing. MISS -> layer deleted per kill
//     protocol, evidence + instruments only.
//   Horizon: 180d death-aware (+10d tail). This is the PILOT (8 seeds); a
//     confirm (12-16) only follows a GO.
//   Det-gate: scripts/test-goinside-20261015.js PART C green first (DONE).
//   SMOKE=1: 1 seed (belongseek s11) x 25d — instrument-honesty asserts.
//   Sense-test: 2-3 pack-lunch episodes read in the transcripts.
//
// Outputs: sweep JSON + per-seed JSON + transcripts (hunger beats + the
// layer's pack/eat voice lines for the sense-test).
//
// Usage:
//   SMOKE=1 node scripts/sweep-goinside-20261015.js
//   node scripts/sweep-goinside-20261015.js
//   OUT=... PERSEED_DIR=... TRANSCRIPT_DIR=... node scripts/sweep-goinside-20261015.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installDistrHalf, finalizeDistrHalf } = require('./distrhalf-lib-20261015');

const SEEDS = (process.env.SEEDS || '11,22,33,44,55,66,77,88').split(',').map(Number);
const POLICIES = (process.env.POLICIES || 'leadcourt,belongseek').split(',');
const SIDES = (process.env.SIDES || 'both').split(',');
const DAYS = Number(process.env.DAYS || 180);
const SMOKE = process.env.SMOKE === '1';
const OUT = process.env.OUT || null;
const PERSEED_DIR = process.env.PERSEED_DIR || null;
const TRANSCRIPT_DIR = process.env.TRANSCRIPT_DIR || null;
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function stdSnapshot(Game) {
  const out = { won: false, arc: 1, tableWaiting: false, rank: 'village' };
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.arc = pg.arc || 1; out.tableWaiting = !!pg.tableWaiting; } catch (e) {}
  try { out.rank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  return out;
}
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) {} return 0; }

function policyFor(pid, armed) {
  if (armed) process.env.GOINSIDE = '1'; else delete process.env.GOINSIDE;
  const giPath = './policies/goinside';
  delete require.cache[require.resolve(giPath)];
  const dm = require(giPath);
  const base = require('./policies/' + pid)[pid];
  return armed ? dm.wrapPolicy(base) : base;
}

async function oneRun(seed, pid, armed, tdir) {
  const side = armed ? 'armed' : 'control';
  const policy = policyFor(pid, armed);
  const { Game } = await loadGame({ seed, mode: 'goinside-' + side });
  await setupGame(Game);
  const track = installDistrHalf(Game);
  // Beat capture: hunger beats + the layer's pack/eat voice lines (sense-test).
  const beats = [];
  const oSay = Game.say;
  Game.say = function (t) {
    try {
      const s = String(t);
      if (/Half ration|half ration|STARVING|pantry is empty|packed lunch|packed this morning|duck into the hall|went to sleep hungry|down to crumbs/i.test(s) && beats.length < 8000)
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
      fs.writeFileSync(path.join(tdir, `goinside-${side}-${pid}-s${seed}.txt`),
        beats.map(b => `d${b.day}: ${b.text}`).join('\n'));
    } catch (e) {}
  }
  const hungerDays = rep.hungerDays;
  const scholarDays = hungerDays.filter(h => h.subject === 'scholar');
  const ctx = ctxRef || {};
  delete process.env.GOINSIDE;
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
    giTriggers: ctx._giTriggers || 0,
    giEnters: ctx._giEnters || 0,
    giTakes: ctx._giTakes || 0,
    giMeals: ctx._giMeals || 0,
    giKcalEaten: Math.round(ctx._giKcalEaten || 0),
    giNoGain: ctx._giNoGain || 0,
    giRefused: ctx._giRefused || 0,
    giMealTriggers: ctx._giMealTriggers || 0,
    giDawnRows: (ctx._giLog || []).length,
    giMealRows: (ctx._giMealLog || []).length,
  };
}

async function smokeGate() {
  console.log('== goinside SMOKE ==');
  const r = await oneRun(11, 'belongseek', true, null);
  const fails = [];
  const check = (n, c, d) => { console.log(`  ${c ? 'PASS' : 'FAIL'} ${n}${d ? ' — ' + d : ''}`); if (!c) fails.push(n); };
  check('policy.daily fired', r.dailyCalls >= 20, `calls=${r.dailyCalls}`);
  check('distrhalf instrument ran', r.hungerDays >= 0 && r.unattributed !== undefined, `hunger=${r.hungerDays} unattrib=${r.unattributed}`);
  check('dawn machinery ran hot', r.giDawnRows >= 15, `dawnRows=${r.giDawnRows}`);
  check('layer audit log consistent', r.giTriggers >= r.giTakes, `triggers=${r.giTriggers} takes=${r.giTakes}`);
  check('enters consistent with takes', r.giTakes === 0 || r.giEnters > 0 || r.giTriggers > 0, `enters=${r.giEnters} takes=${r.giTakes}`);
  check('takes/meals/kcal consistent', r.giTakes >= r.giMeals && (r.giTakes === 0 || r.giKcalEaten > 0),
    `takes=${r.giTakes} meals=${r.giMeals} kcal=${r.giKcalEaten}`);
  console.log(fails.length ? `\nSMOKE: ${fails.length} FAILURES` : '\nSMOKE: ALL GREEN');
  process.exit(fails.length ? 1 : 0);
}

(async () => {
  if (SMOKE) { await smokeGate(); return; }
  const sides = SIDES.includes('both') ? ['control', 'armed'] : SIDES;
  console.log(`== goinside pilot: ${SEEDS.length} seeds x ${POLICIES.length} policies x ${sides.length} sides, ${DAYS}d ==`);
  const runs = [];
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      for (const side of sides) {
        const armed = side === 'armed';
        const r = await oneRun(seed, pid, armed, TRANSCRIPT_DIR);
        runs.push(r);
        console.log(`  [${side}/${pid} s${seed}] days=${r.days} end=${r.endReason} ` +
          `scholarHunger=${r.scholarHungerDays} giTakes=${r.giTakes} giKcal=${r.giKcalEaten} ` +
          `wave=${r.waveReach} rank=${r.maxRank}`);
        if (PERSEED_DIR) {
          try {
            fs.mkdirSync(PERSEED_DIR, { recursive: true });
            fs.writeFileSync(path.join(PERSEED_DIR, `goinside-${side}-${pid}-s${seed}.json`),
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
      giTakes: sum(rs, 'giTakes'),
      giEnters: sum(rs, 'giEnters'),
      giMeals: sum(rs, 'giMeals'),
      giKcalEaten: sum(rs, 'giKcalEaten'),
      giNoGain: sum(rs, 'giNoGain'),
      giRefused: sum(rs, 'giRefused'),
      giTriggers: sum(rs, 'giTriggers'),
      giMealTriggers: sum(rs, 'giMealTriggers'),
      deaths: {},
    };
    for (const r of rs) for (const [k, v] of Object.entries(r.deaths)) rep[side].deaths[k] = (rep[side].deaths[k] || 0) + v;
  }
  let verdict = 'NO-GO', goDetail = '';
  if (sides.includes('control') && sides.includes('armed')) {
    const c = rep.control, a = rep.armed;
    const primary = c.scholarHungerDays > 0 ? (a.scholarHungerDays / c.scholarHungerDays) : (a.scholarHungerDays === 0 ? 0 : Infinity);
    const gPrimary = primary <= 0.60;
    const gSurv = a.medianDays >= c.medianDays - 10;
    const gNat = a.national >= c.national - 2;
    const gStarve = a.starveDeaths <= c.starveDeaths + 2;
    const newModes = Object.keys(a.deaths).filter(k => a.deaths[k] >= 3 && !(c.deaths[k] > 0));
    const gModes = newModes.length === 0;
    // frequency guard: reactive-but-too-often (#169 boundary)
    const takesPerRun = a.n > 0 ? a.giTakes / a.n : 0;
    const gFreq = takesPerRun <= 16;
    const starveGain = c.starveDeaths - a.starveDeaths;
    const freqKill = !gFreq && starveGain <= 0;
    verdict = (gPrimary && gSurv && gNat && gStarve && gModes && !freqKill) ? 'GO' : 'NO-GO';
    goDetail = `primary ratio=${primary.toFixed(3)} (GO<=0.60): ${gPrimary}; ` +
      `median ${a.medianDays}d vs ${c.medianDays}d (>=ctrl-10): ${gSurv}; ` +
      `national ${a.national} vs ${c.national} (>=ctrl-2): ${gNat}; ` +
      `starveDeaths ${a.starveDeaths} vs ${c.starveDeaths} (<=ctrl+2): ${gStarve}; ` +
      `new death modes: ${newModes.length ? newModes.join(',') : 'none'}: ${gModes}; ` +
      `freq takes/run=${takesPerRun.toFixed(1)} (bound 16): ${gFreq}${freqKill ? ' KILL#169' : ''}`;
  }
  const sweep = {
    label: 'goinside-pilot', seeds: SEEDS, policies: POLICIES, sides, days: DAYS,
    when: new Date().toISOString(), runs, pooled: rep,
    go: { verdict, detail: goDetail },
    prereg: 'PRIMARY scholar hunger-days armed <= 0.60x control; guardrails: starveDeaths<=ctrl+2, median>=ctrl-10d, national>=ctrl-2, no new death mode n>=3; freq guard giTakes/run<=16 (#169 boundary)',
  };
  if (OUT) { try { fs.writeFileSync(OUT, JSON.stringify(sweep, null, 1)); } catch (e) {} }
  console.log('\n-- pooled --');
  for (const side of sides) {
    const p = rep[side];
    console.log(`  ${side}: scholarHunger=${p.scholarHungerDays} hunger=${p.hungerDays} ` +
      `starveDeaths=${p.starveDeaths} median=${p.medianDays}d national=${p.national}/16 table=${p.table} ` +
      `won=${p.won} wave4=${p.wave4} wave5=${p.wave5} giTakes=${p.giTakes} giMeals=${p.giMeals} giKcal=${p.giKcalEaten} ` +
      `giNoGain=${p.giNoGain} giRefused=${p.giRefused} giTriggers=${p.giTriggers} giEnters=${p.giEnters}`);
    console.log(`    deaths: ${JSON.stringify(p.deaths)}`);
  }
  console.log(`\nVERDICT: ${verdict} — ${goDetail}`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
