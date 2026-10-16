#!/usr/bin/env node
// scripts/sweep-eveningmeal-20261016.js — PILOT sweep for the scheduled
// evening meal layer (loop B, sim-findings #314, 2026-10-16).
//
// The scholar's bank cap (~2400) sits below an active courtship day's burn
// (~4900 on leadcourt): one dawn fill is structurally insufficient. The
// killed sibling arms were REACTIVE (dawnmeal 0.869, dawngo 0.862, sleepin
// 0.787) or location-state (goinside 1.158). THIS arm is a SCHEDULED second
// meal: at dusk, fill the bank to 95% — the day's intake completed before
// the night burn (EVENINGMEAL=1, default OFF, zero src/js changes).
//
// Sides: CONTROL (FEASTSCALE_R13=1 substrate only) vs ARMED (FEASTSCALE_R13=1
// + EVENINGMEAL=1). 8 seeds x {leadcourt, belongseek} x {control, armed} =
// 32 runs, 180d death-aware, identical seeds across sides (OWN control in
// the SAME sweep).
//
// PRE-REGISTERED (evidence header, docs/MEASUREMENT.md §§9-12, 14 — binding):
//   PRIMARY: per-day-alive scholar hunger-days armed <= 0.75x control
//     (pooled; the sleepin metric-review recommendation).
//   GUARDRAILS (binding): starvation deaths armed <= control+2; scholar
//     starvation armed <= control+1; no new death mode (armed-only cause
//     at n>=3); national armed >= control-2; median survival armed >=
//     control-10d.
//   WATCH (report-only, do NOT kill on it): day the cumulative -5000 trust
//     bar arms armed vs control (#340 tension); half-ration beat counts;
//     justice-heat (-15000) tier landings.
//   GO -> commit the layer for landing. MISS -> layer deleted per kill
//     protocol, evidence + instruments only.
//   Horizon: 180d death-aware (+10d tail max). Reason: the evening meal is
//     a nightly habit — its hunger effect compounds over multi-week courtship
//     arcs; 180d matches the sleepin/dawnmeal substrate cadence.
//   Det-gate: scripts/test-eveningmeal-20261016.js PART C green first.
//   SMOKE=1: 1 seed x 2 policies x 2 sides x 25d — layer-fires assert.
//   Sense-test: evening-meal beats + village reactions read in transcripts.
//
// Outputs: sweep JSON + per-seed JSON + transcripts (dinner beats, trust
// reactions, hunger beats).
//
// Usage:
//   SMOKE=1 node scripts/sweep-eveningmeal-20261016.js
//   node scripts/sweep-eveningmeal-20261016.js
//   OUT=... PERSEED_DIR=... TRANSCRIPT_DIR=... node scripts/sweep-eveningmeal-20261016.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { installTrustCensus } = require('./trustcensus-lib-20261015');

const SEEDS = (process.env.SEEDS || '107,218,329,440,551,662,773,884').split(',').map(Number);
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
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

function policyFor(pid, armed) {
  process.env.FEASTSCALE_R13 = '1';
  process.env.TRUSTCENSUS = '1';
  if (armed) process.env.EVENINGMEAL = '1'; else delete process.env.EVENINGMEAL;
  const emPath = './policies/eveningmeal';
  delete require.cache[require.resolve(emPath)];
  const em = require(emPath);
  const fs_ = require('./policies/feastscale');
  const base = pid === 'leadcourt' ? fs_.leadfeast : fs_.belongfeast;
  return em.wrapPolicy(base); // gate off -> the base itself
}

async function oneRun(seed, pid, armed, tdir) {
  const side = armed ? 'armed' : 'control';
  const policy = policyFor(pid, armed);
  const { Game } = await loadGame({ seed, mode: 'eveningmeal-' + side });
  await setupGame(Game);
  const track = installTrustCensus(Game);
  // Beat capture: dinner beats + trust reactions + hunger beats (sense-test).
  const beats = [];
  const oSay = Game.say;
  Game.say = function (t) {
    try {
      const s = String(t);
      if (/Dinner|Took |You eat |Half ration|half ration|STARVING|Someone watches you load up|Trust -|hoard|stole|steal/i.test(s) && beats.length < 8000)
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
  let result;
  await quietLog(async () => { result = await runDays(Game, wrapped, { days: DAYS, sampleEvery: 10 }); });
  const end = stdSnapshot(Game);
  let fin = null;
  try { fin = track.finalize(); } catch (e) { fin = { error: String(e && e.message) }; }
  try { track.uninstall(); } catch (e) {}
  Game.say = oSay;
  const rows = (fin && fin.rows) || [];
  const x = (fin && fin.crossings) || {};
  const cum = x.cum || {}, jus = x.justice || {};
  const deaths = {};
  let starveDeaths = 0, scholarStarveDeaths = 0;
  try {
    for (const d of (result.samples.deaths || [])) {
      const k = String(d.cause || d.kind || 'unknown');
      deaths[k] = (deaths[k] || 0) + 1;
      if (/starv/i.test(k)) {
        starveDeaths++;
        if (d.player) scholarStarveDeaths++;
      }
    }
  } catch (e) {}
  if (tdir) {
    try {
      fs.mkdirSync(tdir, { recursive: true });
      fs.writeFileSync(path.join(tdir, `eveningmeal-${side}-${pid}-s${seed}.txt`),
        beats.map(b => `d${b.day}: ${b.text}`).join('\n'));
    } catch (e) {}
  }
  const ctx = ctxRef || {};
  const hungerDays = rows.filter(r => r.hunger).length;
  const halfRationDays = rows.filter(r => r.halfRation).length;
  const daysAlive = rows.length || result.gameDays || 1;
  const r = {
    policy: pid, seed, side, days: result.days, gameDays: result.gameDays,
    endReason: result.endReason,
    won: end.won ? 1 : 0, maxArc: hist.maxArc,
    maxRank: Object.keys(RANK_ORDER).find(k => RANK_ORDER[k] === hist.maxRank) || 'village',
    national: hist.maxRank >= 2 ? 1 : 0,
    table: (hist.everTable || end.tableWaiting) ? 1 : 0,
    waveReach: hist.maxWave,
    deaths, starveDeaths, scholarStarveDeaths,
    dailyCalls,
    hungerDays, daysAlive,
    perDayAlive: +(hungerDays / daysAlive).toFixed(4),
    halfRationDays,
    crossDay: cum.crossed ? cum.day : daysAlive, // non-crossing counts its end day (bowldecline precedent)
    crossed: !!cum.crossed,
    crossTrust: cum.crossed ? cum.trust : null,
    justiceCrossed: !!jus.crossed,
    justiceCrossDay: jus.crossed ? jus.day : null,
    // layer audit (armed side)
    emMeals: ctx.emMeals || 0, emTakes: ctx.emTakes || 0, emKcal: ctx.emKcal || 0,
    emSkippedFull: ctx.emSkippedFull || 0, emPantryHold: ctx.emPantryHold || 0,
    emBlocked: ctx.emBlocked || 0, emNothingTakeable: ctx.emNothingTakeable || 0,
    emNothingTook: ctx.emNothingTook || 0,
    censusRows: rows.length,
    instrErrors: ((fin && fin.instrErrors) || []).length,
  };
  delete process.env.EVENINGMEAL;
  return r;
}

async function smokeGate() {
  console.log('== eveningmeal SMOKE ==');
  const r = await oneRun(107, 'leadcourt', true, null);
  const fails = [];
  const check = (n, c, d) => { console.log(`  ${c ? 'PASS' : 'FAIL'} ${n}${d ? ' — ' + d : ''}`); if (!c) fails.push(n); };
  check('policy.daily fired', r.dailyCalls >= 20, `calls=${r.dailyCalls}`);
  check('trustcensus instrument ran', r.censusRows > 0, `rows=${r.censusRows} instrErrors=${r.instrErrors}`);
  check('evening meal fired at dusk', r.emMeals > 0, `emMeals=${r.emMeals} emTakes=${r.emTakes} emKcal=${r.emKcal}`);
  check('audit counters consistent', r.emMeals <= r.emTakes, `meals=${r.emMeals} takes=${r.emTakes}`);
  check('dinner kcal positive', r.emKcal > 0, `emKcal=${r.emKcal}`);
  console.log(fails.length ? `\nSMOKE: ${fails.length} FAILURES` : '\nSMOKE: ALL GREEN');
  process.exit(fails.length ? 1 : 0);
}

(async () => {
  if (SMOKE) { await smokeGate(); return; }
  const sides = SIDES.includes('both') ? ['control', 'armed'] : SIDES;
  console.log(`== eveningmeal pilot: ${SEEDS.length} seeds x ${POLICIES.length} policies x ${sides.length} sides, ${DAYS}d ==`);
  const runs = [];
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      for (const side of sides) {
        const armed = side === 'armed';
        const r = await oneRun(seed, pid, armed, TRANSCRIPT_DIR);
        runs.push(r);
        console.log(`  [${side}/${pid} s${seed}] days=${r.days} end=${r.endReason} ` +
          `hunger=${r.hungerDays}/${r.daysAlive}d emMeals=${r.emMeals} cross=${r.crossDay}${r.crossed ? '' : '(no)'} ` +
          `halfR=${r.halfRationDays} wave=${r.waveReach} rank=${r.maxRank}`);
        if (PERSEED_DIR) {
          try {
            fs.mkdirSync(PERSEED_DIR, { recursive: true });
            fs.writeFileSync(path.join(PERSEED_DIR, `eveningmeal-${side}-${pid}-s${seed}.json`),
              JSON.stringify(r, null, 1));
          } catch (e) {}
        }
      }
    }
  }
  const pool = (side) => runs.filter(r => r.side === side);
  const sum = (rs, k) => rs.reduce((t, r) => t + (r[k] || 0), 0);
  const med = (rs, k) => { const v = rs.map(r => r[k]).sort((a, b) => a - b); return v[Math.floor(v.length / 2)]; };
  const mean = (rs, k) => rs.length ? sum(rs, k) / rs.length : 0;
  const rep = {};
  for (const side of sides) {
    const rs = pool(side);
    rep[side] = {
      n: rs.length,
      hungerDays: sum(rs, 'hungerDays'),
      daysAlive: sum(rs, 'daysAlive'),
      perDayAlive: +(sum(rs, 'hungerDays') / Math.max(1, sum(rs, 'daysAlive'))).toFixed(4),
      starveDeaths: sum(rs, 'starveDeaths'),
      scholarStarveDeaths: sum(rs, 'scholarStarveDeaths'),
      medianDays: med(rs, 'gameDays'),
      meanCrossDay: +mean(rs, 'crossDay').toFixed(1),
      crossed: sum(rs, 'crossed'),
      halfRationDays: sum(rs, 'halfRationDays'),
      justiceCrossed: sum(rs, 'justiceCrossed'),
      national: sum(rs, 'national'),
      table: sum(rs, 'table'),
      won: sum(rs, 'won'),
      wave4: rs.filter(r => r.waveReach >= 4).length,
      wave5: rs.filter(r => r.waveReach >= 5).length,
      maxArc: Math.max.apply(null, rs.map(r => r.maxArc || 1)),
      emMeals: sum(rs, 'emMeals'), emTakes: sum(rs, 'emTakes'), emKcal: sum(rs, 'emKcal'),
      emSkippedFull: sum(rs, 'emSkippedFull'), emPantryHold: sum(rs, 'emPantryHold'),
      emBlocked: sum(rs, 'emBlocked'),
      deaths: rs.reduce((acc, r) => { for (const [k, v] of Object.entries(r.deaths || {})) acc[k] = (acc[k] || 0) + v; return acc; }, {}),
    };
  }
  rep.perSeed = runs.map(r => ({
    policy: r.policy, seed: r.seed, side: r.side, days: r.days, gameDays: r.gameDays, endReason: r.endReason,
    hungerDays: r.hungerDays, daysAlive: r.daysAlive, perDayAlive: r.perDayAlive,
    starveDeaths: r.starveDeaths, scholarStarveDeaths: r.scholarStarveDeaths,
    crossDay: r.crossDay, crossed: r.crossed, halfRationDays: r.halfRationDays,
    justiceCrossed: r.justiceCrossed, justiceCrossDay: r.justiceCrossDay,
    national: r.national, table: r.table, won: r.won, waveReach: r.waveReach, maxArc: r.maxArc,
    emMeals: r.emMeals, emTakes: r.emTakes, emKcal: r.emKcal,
    emSkippedFull: r.emSkippedFull, emPantryHold: r.emPantryHold, emBlocked: r.emBlocked,
  }));
  // Primary: pooled per-day-alive ratio armed/control
  const c = rep.control, a = rep.armed;
  if (c && a) {
    rep.primary = {
      ratio: +(a.perDayAlive / Math.max(1e-9, c.perDayAlive)).toFixed(3),
      armed: a.perDayAlive, control: c.perDayAlive,
      go: (a.perDayAlive / Math.max(1e-9, c.perDayAlive)) <= 0.75,
    };
    rep.guardrails = {
      starveDeaths: { armed: a.starveDeaths, control: c.starveDeaths, go: a.starveDeaths <= c.starveDeaths + 2 },
      scholarStarve: { armed: a.scholarStarveDeaths, control: c.scholarStarveDeaths, go: a.scholarStarveDeaths <= c.scholarStarveDeaths + 1 },
      national: { armed: a.national, control: c.national, go: a.national >= c.national - 2 },
      medianSurv: { armed: a.medianDays, control: c.medianDays, go: a.medianDays >= c.medianDays - 10 },
    };
  }
  console.log('\n== POOLED ==');
  for (const side of sides) {
    const p = rep[side];
    console.log(`  ${side}: perDayAlive=${p.perDayAlive} (hunger ${p.hungerDays}/${p.daysAlive}d) ` +
      `starve=${p.starveDeaths}(scholar ${p.scholarStarveDeaths}) median=${p.medianDays}d ` +
      `cross=${p.meanCrossDay}d(${p.crossed}/16) halfR=${p.halfRationDays} just=${p.justiceCrossed} ` +
      `national=${p.national}/${p.n} table=${p.table} won=${p.won} wave4=${p.wave4} wave5=${p.wave5} ` +
      `emMeals=${p.emMeals} emKcal=${p.emKcal}`);
  }
  if (rep.primary) console.log(`\nPRIMARY ratio=${rep.primary.ratio} (armed ${rep.primary.armed} vs control ${rep.primary.control}) -> ${rep.primary.go ? 'GO' : 'NO-GO'}`);
  if (OUT) {
    try { fs.writeFileSync(OUT, JSON.stringify(rep, null, 1)); console.log('\nwrote ' + OUT); } catch (e) { console.log('OUT write failed: ' + e.message); }
  } else {
    console.log('\n' + JSON.stringify(rep, null, 1));
  }
})();
