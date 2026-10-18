#!/usr/bin/env node
// dayfreeze-red-20261018.js — RED reproduction for the DAY-ADVANCE STALL
// (sim-winloss-a evidence, lever spec #5; arm fleshout-20261018T1715Z,
// axis scale-onramp, game-code arm).
//
// Replays the winseat corpus seeds 59101–59108 x {leadfeast, belongfeast} and
// records the ANATOMY of every sleep: which exit path sleep() took, whether
// tickAction/endDay fired, and the wake conditions. A freeze = ≥8 consecutive
// non-advancing FULL sleeps (refusals don't count) with Game not over.
// Read-only wrappers: no state writes, no RNG draws (trajectory-neutral).
//
// Writes evidence/2026-10-18/dayfreeze-red-20261018.json (per-run freeze
// verdicts + first-freeze anatomy), not evidence/*.md (that lands later).
'use strict';
const fs = require('fs');
const path = require('path');
const SW = require('./winloss-sweep-20261018');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const ENV_REQ = ['SEATDRIVE', 'VETREL', 'REPOSITION', 'NODEWITNESS', 'FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY'];
for (const k of ENV_REQ) if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required (winseat).`); process.exit(2); }
process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [59101, 59102, 59103, 59104, 59105, 59106, 59107, 59108]).filter(Number.isFinite);
const POLICIES = (process.env.ONLY ? [process.env.ONLY] : ['belongfeast', 'leadfeast']);
const DAYS = 180;
const FREEZE_STREAK = 8;
const OUT = path.join(__dirname, '..', 'evidence', '2026-10-18', 'dayfreeze-red-20261018.json');

async function oneRun(seed, policyId) {
  const base = SW.policyFor(policyId);
  const policy = Object.assign({}, base, { id: base.id + '-dayfreezered', desc: base.desc + ' [DAYFREEZE-RED]' });
  const { Game } = await loadGame({ seed, mode: 'winloss', fullTelemetry: false });
  await setupGame(Game);

  // ---- read-only anatomy instrumentation (no state writes, no RNG) ----
  const sleeps = [];
  let stuckStreak = 0, freezeAnatomy = null;
  let inSleep = null; // current sleep record
  const osay = Game.say.bind(Game);
  Game.say = function (msg) {
    try { if (inSleep) { inSleep.sayTail.push(String(msg).slice(0, 160)); if (inSleep.sayTail.length > 10) inSleep.sayTail.shift(); } } catch (e) {}
    return osay.apply(this, arguments);
  };
  const otick = Game.tickAction.bind(Game);
  Game.tickAction = function (...a) { try { if (inSleep) inSleep.nTicks++; } catch (e) {} return otick.apply(this, a); };
  const oend = Game.endDay.bind(Game);
  Game.endDay = function (...a) {
    let rec = null;
    try {
      if (inSleep) {
        const s0 = (Game.state.scholar || {});
        rec = {
          dayBefore: s0.day | 0, overBefore: !!Game.over, vlBefore: !!Game.villageLost,
          healthBefore: Math.round(s0.health || 0), kcalBefore: Math.round(s0.kcal || 0),
          phoenixBefore: !!(Game.state && Game.state.phoenixLink),
          secondWindBefore: s0.secondWindDay === (s0.day | 0),
        };
        inSleep.endDays.push(rec); inSleep.nEndDays++;
      }
    } catch (e) {}
    const r = oend.apply(this, a);
    try {
      if (rec) {
        const s1 = (Game.state.scholar || {});
        rec.dayAfter = s1.day | 0; rec.overAfter = !!Game.over; rec.vlAfter = !!Game.villageLost;
        rec.healthAfter = Math.round(s1.health || 0); rec.kcalAfter = Math.round(s1.kcal || 0);
      }
    } catch (e) {}
    return r;
  };
  const osleep = Game.sleep.bind(Game);
  const oSetup = policy.setup;
  policy.setup = (G, ctx) => {
    const r = oSetup ? oSetup(G, ctx) : undefined;
    const s0 = G.sleep.bind(G);
    G.sleep = function (...a) {
      const s = (G.state.scholar || {});
      const rec = {
        dayBefore: s.day | 0, partBefore: G.dayPart | 0, dayTicksBefore: Math.round(s.dayTicks || 0),
        healthBefore: Math.round(s.health || 0), kcalBefore: Math.round(s.kcal || 0),
        nTicks: 0, nEndDays: 0, endDays: [], sayTail: [], dayAfter: null, kind: '?',
        tbfight: !!G.tbfight, pendingEncounter: !!G.pendingEncounter, over: !!G.over,
        villageLost: !!G.villageLost, activeContest: !!(G.state && G.state.activeContest),
        insideTent: !!(s.insideTent),
      };
      inSleep = rec;
      let ret;
      try { ret = s0.apply(this, a); } finally { inSleep = null; }
      rec.dayAfter = ((G.state.scholar || {}).day | 0);
      const tail = rec.sayTail.join(' | ');
      if (/barely dawn/.test(tail)) rec.kind = 'dawn-refusal';
      else if (/hour off/.test(tail)) rec.kind = 'late-refusal';
      else if (/Not in the middle of a fight/.test(tail)) rec.kind = 'fight-refusal';
      else if (/wake with a start/.test(tail)) rec.kind = 'woke';
      else if (rec.nTicks === 0) rec.kind = 'no-loop';
      else rec.kind = 'full-sleep';
      rec.overAfter = !!G.over; rec.villageLostAfter = !!G.villageLost;
      sleeps.push(rec);
      // freeze detection: consecutive non-advancing FULL sleeps, game not over
      if (rec.kind === 'full-sleep' && rec.dayAfter === rec.dayBefore && !rec.overAfter) {
        stuckStreak++;
        if (stuckStreak === FREEZE_STREAK) {
          freezeAnatomy = { firstStuckSleep: sleeps[sleeps.length - FREEZE_STREAK], lastStuckSleep: rec, streak: stuckStreak };
        }
      } else stuckStreak = 0;
      return ret;
    };
    return r;
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  // summary of sleep kinds
  const kinds = {};
  for (const sl of sleeps) kinds[sl.kind] = (kinds[sl.kind] || 0) + 1;
  const frozen = !Game.over && !Game.won && (result.gameDays | 0) < DAYS;
  let scholarEnd = null;
  try {
    const s = Game.state.scholar || {};
    scholarEnd = { day: s.day | 0, part: Game.dayPart | 0, dayTicks: Math.round(s.dayTicks || 0),
      health: Math.round(s.health || 0), kcal: Math.round(s.kcal || 0), hydration: Math.round(s.hydration || 0),
      phoenixLink: !!(Game.state && Game.state.phoenixLink), secondWindDay: s.secondWindDay,
      insideTent: !!s.insideTent, over: !!Game.over, villageLost: !!Game.villageLost,
      tbfight: !!Game.tbfight, pendingEncounter: !!Game.pendingEncounter,
      activeContest: !!(Game.state && Game.state.activeContest) };
  } catch (e) {}
  return {
    seed, policyId, frozen, freezeAnatomy,
    sleepKinds: kinds, nSleeps: sleeps.length,
    tailSleeps: frozen ? sleeps : sleeps.slice(-3),
    scholarEnd,
    gameDays: result.gameDays | 0, loopDays: result.days | 0,
    over: !!Game.over, won: !!Game.won, villageLost: !!Game.villageLost,
    legend: (function () { try { return (Game.progState() || {}).legend || null; } catch (e) { return null; } })(),
  };
}

(async () => {
  const runs = [];
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      const r = await oneRun(seed, pid);
      runs.push(r);
      console.log(`${r.policyId} s${r.seed}: frozen=${r.frozen} gameDays=${r.gameDays} over=${r.over} won=${r.won} kinds=${JSON.stringify(r.sleepKinds)}`);
    }
  }
  fs.writeFileSync(OUT, JSON.stringify({ ts: new Date().toISOString(), runs }, null, 1));
  console.log('\nwrote', OUT);
  const nFrozen = runs.filter(r => r.frozen).length;
  console.log(`FREEZES: ${nFrozen}/${runs.length}`);
  for (const r of runs.filter(x => x.frozen)) {
    const a = r.freezeAnatomy.firstStuckSleep;
    console.log(`--- ${r.policyId} s${r.seed} first stuck sleep: day=${a.dayBefore} kind=${a.kind} nTicks=${a.nTicks} nEndDays=${a.nEndDays} part=${a.partBefore} dayTicks=${a.dayTicksBefore} health=${a.healthBefore} kcal=${a.kcalBefore}`);
    console.log('    endDays:', JSON.stringify(a.endDays.slice(0, 3)));
    console.log('    sayTail:', JSON.stringify(a.sayTail.slice(-4)));
  }
})().catch(e => { console.error('RED CRASH:', e); process.exit(2); });
