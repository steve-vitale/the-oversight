#!/usr/bin/env node
// trace-gatecover-b.js — GATE-STATE tracer for sim-gatecover-b (DIAG ONLY).
// Diagnostic re-run of one seed (51608), armed only, 30d competent.
// Wraps scripts/policies/competent.js exactly as
// scripts/depositgate-b-driver.js does, and at each evening records
// the gate read the sensor's final-run counting uses PLUS the two
// condition values that decide it: pantryFreshDays (> 4?) and
// hungryStreak (>= 3?). No game-code change, no policy change, no
// RNG in this recorder; it only reads. Prints one JSON line to
// stdout (never writes files), with the depositgate write-retry
// discipline (callback-based, retried) so an EPERM flap cannot
// silently lose the line.
//
// Env (FATAL if violated): POLICY=competent, COMPETENT_FEAST=0,
// SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1, DAYS=30, SEEDS=<csv>
// (single seed in this arm), and the seven non-gate flags not 1.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

if (process.env.POLICY !== 'competent') { console.error('FATAL: POLICY must be competent'); process.exit(2); }
if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 (armed only) must be set explicitly'); process.exit(2); }
for (const k of ['WOODCARRY', 'WOODWARM', 'MORNINGCARRY', 'WINDOWCARRY', 'STRANDFIX', 'PRESSB', 'FEDEVENING']) {
  if (process.env[k] === '1') { console.error('FATAL: ' + k + ' must NOT be 1 in a gatecover leg'); process.exit(2); }
}
const SEEDS = (process.env.SEEDS || '').split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '30', 10);
if (DAYS !== 30) { console.error('FATAL: DAYS must be 30 for gatecover legs'); process.exit(2); }
if (!SEEDS.length) { console.error('FATAL: SEEDS must be set'); process.exit(2); }

function pantryKcal(Game) {
  try {
    const items = ((Game.state || {}).village || {}).pantry || [];
    let kcal = 0;
    for (const it of items) kcal += (it.kcalEach || 0) * (it.units || 1);
    return Math.round(kcal);
  } catch (e) { return null; }
}
function numOrNull(fn) { try { const v = fn(); return (typeof v === 'number' && isFinite(v)) ? v : null; } catch (e) { return null; } }
function aliveCount(Game) {
  try {
    const v = (Game.state || {}).village || {};
    const roster = v.roster || [];
    let n = 0;
    for (const rid of roster) {
      try { const p = Game.getPerson ? Game.getPerson(rid) : null; if (p && !p.dead) n++; else if (!p) n++; } catch (e) { n++; }
    }
    return n;
  } catch (e) { return null; }
}

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'depositgate-b', fullTelemetry: false });
  const sayLines = [];
  let saySeq = 0;
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { if (sayLines.length < 40000) sayLines.push({ seq: saySeq++, day: (Game.state.scholar || {}).day || 0, line: String(args[0] || '').slice(0, 400) }); } catch (e) { console.error('gatecover say-tap error', e && e.message); }
        return origSay.apply(this, args);
      };
    }
  }
  await setupGame(Game);
  const rows = [];
  let callIdx = 0;
  const baseDaily = competent.daily.bind(competent);
  const policy = Object.assign({}, competent, {
    daily(Game2, ctx) {
      callIdx++;
      const loopDay = callIdx;
      const morning = pantryKcal(Game2);
      const sayBefore = sayLines.length;
      baseDaily(Game2, ctx);
      // Evening gate-state read: the same read the sensor uses, plus
      // the two deciding condition values, read directly off Game.
      const freshDays = numOrNull(() => Game.pantryFreshDays());
      const freshKcal = numOrNull(() => Game.pantryFreshKcal());
      const engaged = numOrNull(() => (typeof Game._depositGateEngaged === 'function') ? (Game._depositGateEngaged() ? 1 : 0) : null);
      const throttle = numOrNull(() => (typeof Game.prodThrottleEngaged === 'function') ? (Game.prodThrottleEngaged() ? 1 : 0) : null);
      const gateOn = numOrNull(() => (typeof Game._depositGateOn === 'function') ? (Game._depositGateOn() ? 1 : 0) : null);
      let streak = null;
      try { const pg = (typeof Game.progState === 'function') ? Game.progState() : null; streak = pg ? (pg.hungryStreak || 0) : null; } catch (e) { streak = null; }
      rows.push({
        loopDay,
        gameDay: numOrNull(() => (Game.state.scholar || {}).day || 0),
        pantryKcal: pantryKcal(Game2),
        morningPantryKcal: morning,
        freshKcal: freshKcal == null ? null : Math.round(freshKcal),
        freshDays,
        plenty: freshDays == null ? null : freshDays > 4,
        hungryStreak: streak,
        hungerExempt: streak == null ? null : streak >= 3,
        gateOn: gateOn == null ? null : !!gateOn,
        prodThrottleEngaged: throttle == null ? null : !!throttle,
        gateEngaged: engaged == null ? null : !!engaged,
        alive: aliveCount(Game2),
        sayLines: sayLines.slice(sayBefore).map((x) => x.line),
      });
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  return {
    seed, arm: 'armed', policy: 'competent', days: DAYS,
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    maxWaveUnlocked: result.maxWaveUnlocked, waveKills: result.waveKills,
    deaths: (result.samples && result.samples.deaths) || [],
    rows, sayLines,
  };
}

process.stdout.on('error', () => { /* guarded: callback below reports it */ });
function sleepMs(ms) { return new Promise((r) => setTimeout(r, ms)); }
async function writeLineStrict(line) {
  for (let attempt = 1; attempt <= 12; attempt++) {
    const ok = await new Promise((resolve) => {
      let settled = false;
      const done = (v) => { if (!settled) { settled = true; resolve(v); } };
      const timer = setTimeout(() => done(false), 30000);
      try { process.stdout.write(line, (err) => { clearTimeout(timer); done(!err); }); } catch (e) { clearTimeout(timer); done(false); }
    });
    if (ok) return;
    const wait = Math.min(30000, 2000 * attempt);
    try { console.error('gatecover stdout write failed, retry ' + attempt + ' in ' + wait + 'ms'); } catch (e) {}
    await sleepMs(wait);
  }
  throw new Error('gatecover stdout write failed after 12 retries');
}

async function main() {
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    await writeLineStrict(JSON.stringify(inst) + '\n');
    try { console.error('gatecover arm=armed seed=' + seed + ' end=' + inst.endReason + ' daysAlive=' + inst.daysAlive + ' rows=' + inst.rows.length + ' stdout'); } catch (e) {}
  }
  console.error('wrote ' + SEEDS.length + ' gatecover JSON lines to stdout');
}

if (require.main === module) {
  main().catch((e) => { console.error('GATECOVER TRACE CRASH', e && (e.stack || e)); process.exit(2); });
}
module.exports = { oneInstance };
