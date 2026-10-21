#!/usr/bin/env node
// sweep-sharegate-b.js — threshold-gated upkeep-skip confirm sweep (arm
// sim-sharegate-b, run fleshout-loop-b-20261021T1257Z).
//
// Env: FEASTSCALE_R13=1, SEATDRIVE=0 explicit (asserted).
//   SIDE=control|armed POLICY=leadfeast|belongfeast SEEDS="9011,...,9018"
//   DAYS=180 OUT=<path> node scripts/sweep-sharegate-b.js
//
// PAIRED DESIGN isolating the gate:
//   control: SURPLUSFEED=1 (engine trim on, no gate) + base policy,
//            SHAREGATE_B unset (FATAL otherwise)
//   armed:   SURPLUSFEED=1 + SHAREGATE_B=1 + sharegate variant policy
// Same commit, identical seeds. The only difference is the gate.
//
// Instruments: the surpluskeep upkeep instruments (tribute/tend events,
// break attribution, dawn per-link snapshots, national-lost edge,
// dissolution say-lines) + the sharegate voice-line capture + the
// surplusfeed trim/rot funnel from the parent sweep. Pure reads; the
// surpluskeep proof's RED-EQUIV/DET bars cover the instrument stack.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { leadfeast_sharegate, belongfeast_sharegate } = require('./policies/sharegate-b');
const { attachUpkeepProbe } = require('./upkeep-instruments-surpluskeep-b');

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('FATAL: FEASTSCALE_R13=1 and SEATDRIVE=0 must both be set explicitly');
  process.exit(2);
}
const SIDE = process.env.SIDE || 'control';
const POLICY_ID = process.env.POLICY || 'leadfeast';
const SHAREGATE = POLICY_ID.endsWith('-sharegate');
if (SIDE === 'armed') {
  if (process.env.SURPLUSFEED !== '1' || process.env.SHAREGATE_B !== '1' || !SHAREGATE) {
    console.error('FATAL: SIDE=armed requires SURPLUSFEED=1, SHAREGATE_B=1, and a -sharegate policy');
    process.exit(2);
  }
} else if (SIDE === 'control') {
  // control = the trim on, the gate off. The variant policy may run here
  // ONLY with the gate unset (the RED det-gate pair); the pilot control
  // cells always use the base policies.
  if (process.env.SURPLUSFEED !== '1') {
    console.error('FATAL: SIDE=control requires SURPLUSFEED=1');
    process.exit(2);
  }
  if (SHAREGATE && process.env.SHAREGATE_B) {
    console.error('FATAL: SIDE=control with a -sharegate policy requires SHAREGATE_B unset');
    process.exit(2);
  }
} else {
  console.error('FATAL: SIDE must be control|armed');
  process.exit(2);
}

const POLICIES = { leadfeast, belongfeast, 'leadfeast-sharegate': leadfeast_sharegate, 'belongfeast-sharegate': belongfeast_sharegate };
const POLICY = POLICIES[POLICY_ID] || POLICIES.leadfeast;
const SEEDS = (process.env.SEEDS || '9011,9012,9013,9014,9015,9016,9017,9018')
  .split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || ('/tmp/sim-sharegate-b/sweep-' + SIDE + '-' + POLICY_ID + '.json');

// sharegate voice lines (fixed phrases; sense-testing corpus)
const SG_RE = /wearing thin \(trust|two quiet weeks is enough|wait this week|goes anyway; a lean pantry/i;

function pantryKcal(Game) {
  try { return (((Game.state || {}).village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); } catch (e) { return 0; }
}
function canonCause(c) {
  c = String(c || '?').toLowerCase();
  if (/dehydrat|thirst/.test(c)) return 'dehydration';
  if (/starv/.test(c)) return 'starvation';
  return c.slice(0, 32);
}

async function oneRun(seed, days) {
  const { Game } = await loadGame({ seed, mode: 'sharegate-b-' + POLICY_ID + '-' + SIDE, fullTelemetry: false });
  await setupGame(Game);
  const W = {
    deaths: [], deathSeen: new Set(), starveDays: 0,
    shareSurplus: 0, ateSum: 0, vdays: 0, producedSum: 0,
    dawnFreshDays: [],
  };

  // --- rot: fresh vs preserved (dedupe by item identity) ---
  const rotCounted = new Set();
  const oSweep = Game.sweepSpoiled;
  if (typeof oSweep === 'function') Game.sweepSpoiled = function () {
    try {
      for (const it of (((Game.state.village || {}).pantry) || [])) {
        if (it && !it.bonded && !rotCounted.has(it) && Game.isSpoiled && Game.isSpoiled(it)) {
          rotCounted.add(it);
          const fs = (it.foodState === 'preserved' || it.foodState === 'rendered') ? 'preserved' : 'fresh';
          W['rot_' + fs] = (W['rot_' + fs] || 0) + (it.kcalEach || 0) * (it.units || 1);
        }
      }
    } catch (e) {}
    return oSweep.apply(this, arguments);
  };

  // --- villager surplus-share funnel (the governed channel) ---
  const oSur = Game.stockSurplus;
  if (typeof oSur === 'function') Game.stockSurplus = function (v, give) {
    let r = 0;
    try { r = oSur.apply(this, arguments); } catch (e) { r = 0; }
    try { if (typeof r === 'number' && r > 0) W.shareSurplus += r; } catch (e) {}
    return r;
  };

  // --- villager eating + production (guardrail: eating untouched) ---
  const oMeal = Game.villagerMealDay;
  if (typeof oMeal === 'function') Game.villagerMealDay = function () {
    const r = oMeal.apply(this, arguments);
    try { W.ateSum += (r && r.ate) || 0; W.vdays++; } catch (e) {}
    return r;
  };
  const oProd = Game.villagerDayProduction;
  if (typeof oProd === 'function') Game.villagerDayProduction = function () {
    const r = oProd.apply(this, arguments);
    try { if (typeof r === 'number' && r > 0) W.producedSum += r; } catch (e) {}
    return r;
  };

  // --- dawn sensor: freshDays at dawn (glut-day definition) ---
  const oSleep = Game.sleep;
  if (typeof oSleep === 'function') Game.sleep = function () {
    const r = oSleep.apply(this, arguments);
    try {
      if (Game.pantryFreshDays) W.dawnFreshDays.push(+Number(Game.pantryFreshDays()).toFixed(3));
    } catch (e) {}
    return r;
  };

  // --- deaths: kind-aware, dedup ---
  const oDie = Game.registerDeath;
  if (typeof oDie === 'function') Game.registerDeath = function (opts) {
    try {
      const kind = String((opts && opts.kind) || '');
      if (kind === 'person' || kind === 'villager') {
        const who = String((opts && (opts.villagerId || opts.name)) || '?');
        const day = (Game.state.scholar || {}).day || 0;
        const cause = canonCause((opts && opts.cause) || '?');
        const key = who + '|' + day + '|' + cause;
        if (!W.deathSeen.has(key)) {
          W.deathSeen.add(key);
          W.deaths.push({ day, who: who.slice(0, 24), kind, cause });
        }
      }
    } catch (e) {}
    return oDie.apply(this, arguments);
  };

  // --- upkeep instrument (surpluskeep stack: pure reads) ---
  const K = attachUpkeepProbe(Game);

  // --- sharegate voice-line capture ---
  const sgLines = [];
  const oSay = Game.say;
  if (typeof oSay === 'function') Game.say = function (msg) {
    try {
      const s = String(msg || '');
      if (SG_RE.test(s)) sgLines.push({ d: ((Game.state || {}).scholar || {}).day || 0, line: s });
    } catch (e) {}
    return oSay.apply(this, arguments);
  };

  const ctx = {};
  const policy = Object.assign({}, POLICY);
  const origDaily = POLICY.daily;
  // runDays creates its own ctx and passes it to policy.daily — capture it
  // here; the layer's sg telemetry lives on that ctx, not this one.
  let runCtx = null;
  policy.daily = (G, c) => {
    runCtx = c || runCtx;
    try {
      let hungry = 0;
      for (const id of (((G.state || {}).village || {}).roster || [])) {
        try { if (G.npcNeeds && (G.npcNeeds(id).hunger || 0) > 70) hungry++; } catch (e) {}
      }
      if (hungry > 0) W.starveDays++;
    } catch (e) {}
    if (origDaily) return origDaily(G, c);
  };

  const t0 = Date.now();
  const result = await runDays(Game, policy, { days, manifest: null });
  const ms = Date.now() - t0;

  // --- governor telemetry (engine _surplusFeed) ---
  let trimDays = 0, trimEvents = 0, trimKcal = 0;
  try {
    const sf = (Game.state.village || {})._surplusFeed || {};
    for (const d of Object.keys(sf.days || {})) {
      trimDays++; trimEvents += sf.days[d].trim; trimKcal += sf.days[d].kcal;
    }
  } catch (e) {}

  let rosterEnd = 0;
  try { rosterEnd = (Game.state.village || {}).roster.length; } catch (e) {}
  const glutDays = W.dawnFreshDays.filter(x => x > 4).length;
  const rc = runCtx || {};
  const sg = {
    coverTend: rc.sgCoverTend || 0,
    coverTrib: rc.sgCoverTrib || 0,
    skipHonest: rc.sgSkipHonest || 0,
    coverRefused: rc.sgCoverRefused || 0,
    decisions: rc.sgDecisions || [],
    lines: sgLines,
  };
  const end = {
    days: result.days, endReason: result.endReason, won: !!Game.won,
    tableWaiting: !!((Game.progState ? Game.progState() : {}).tableWaiting),
    rank: (() => { try { return Game.scaleRank(); } catch (e) { return '?'; } })(),
    nationalLive: !!((Game.state || {}).nationalLive),
    arc: (() => { try { return (Game.progState() || {}).arc || 1; } catch (e) { return 1; } })(),
    maxWave: (() => { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })(),
    rosterEnd, pkEnd: Math.round(pantryKcal(Game)),
    rotFresh: Math.round(W.rot_fresh || 0), rotPreserved: Math.round(W.rot_preserved || 0),
    starveDays: W.starveDays,
    shareSurplus: Math.round(W.shareSurplus),
    produced: Math.round(W.producedSum),
    atePerVday: W.vdays ? +(W.ateSum / W.vdays).toFixed(1) : 0,
    trimDays, trimEvents, trimKcal: Math.round(trimKcal),
    glutDays, dawnDays: W.dawnFreshDays.length,
    deathCount: W.deaths.length, deaths: W.deaths,
    exiled: (() => { try { return !!((Game.state || {}).village || {}).exiled; } catch (e) { return false; } })(),
    sg,
    upkeep: {
      tendEvents: K.tendEvents, tributeEvents: K.tributeEvents,
      breaks: K.breaks, natEvents: K.natEvents,
      links: K.links, dissolveLines: K.dissolveLines,
    },
    ms,
  };
  return { seed, end };
}

(async () => {
  const rows = [];
  for (const seed of SEEDS) {
    const { seed: s, end } = await oneRun(seed, DAYS);
    rows.push({ seed: s, end });
    console.log(`done seed=${s} days=${end.days} end=${end.endReason} rot=${Math.round((end.rotFresh + end.rotPreserved) / 1000)}k trim=${end.trimEvents}/${end.trimDays}d sg={covT:${end.sg.coverTend},covB:${end.sg.coverTrib},skip:${end.sg.skipHonest}} nat=${end.nationalLive} won=${end.won} (${end.ms}ms)`);
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ meta: { side: SIDE, policy: POLICY_ID, days: DAYS, seeds: SEEDS, env: { FEASTSCALE_R13: '1', SEATDRIVE: '0', SURPLUSFEED: '1', SHAREGATE_B: SIDE === 'armed' ? '1' : 'unset' } }, rows }, null, 1));
  console.log('wrote ' + OUT);
})().catch(e => { console.error('SWEEP CRASH', e); process.exit(2); });
