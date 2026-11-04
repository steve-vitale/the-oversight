#!/usr/bin/env node
// trace-firenarr-deploy-b.js — DEPLOY-INPUT tracer for
// sim-firenarr-deploy-b (DIAG ONLY). Re-runs one seed at a time
// under competent policy, 30d, and records the exact evenings the
// deploy hook reads: wraps Game.villageEats, and after the
// original returns records scholar.day, Game.pantryKcal(),
// progState().hungryStreak, and Game._depositGateEngaged().
// Firenarr say lines are attributed to the evening whose
// villageEats call they FOLLOW (the hook runs after villageEats
// returns, before the next night's villageEats call), so the
// night's line list is flushed on the NEXT wrapper entry.
// No game-code change, no policy change. Prints one JSON line
// per seed to stdout (caller redirects to a jsonl file).
// Env (FATAL if violated): POLICY=competent, COMPETENT_FEAST=0,
// SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1, DAYS=30, SEEDS=<csv>.
// FIRENARR_OFF=1 runs the ablation: the hook method is replaced
// with a no-op before runDays (identical code otherwise).
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

if (process.env.POLICY !== 'competent') { console.error('FATAL: POLICY must be competent'); process.exit(2); }
if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 (armed only) must be set explicitly'); process.exit(2); }
for (const k of ['WOODCARRY', 'WOODWARM', 'MORNINGCARRY', 'WINDOWCARRY', 'STRANDFIX', 'PRESSB', 'FEDEVENING']) {
  if (process.env[k] === '1') { console.error('FATAL: ' + k + ' must NOT be 1 in a firenarr leg'); process.exit(2); }
}
const SEEDS = (process.env.SEEDS || '').split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '30', 10);
if (DAYS !== 30) { console.error('FATAL: DAYS must be 30 for firenarr legs'); process.exit(2); }
if (!SEEDS.length) { console.error('FATAL: SEEDS must be set'); process.exit(2); }
const OFF = process.env.FIRENARR_OFF === '1';

const FIRENARR_TEMPLATES = [
  '⚠ The store has fallen from its recent high — the shelves are thinning.',
  '⚠ The store has fallen far from its recent high — the shelves are nearly bare.',
  '⚠ The store keeps slipping from its recent high — evening after evening, lower.',
  '⚠ The store has fallen further still from its recent high.',
  '⚠ The store has fallen from its recent high again — the shelves are thinning.',
  '⚠ The store has fallen far from its recent high again — the shelves are nearly bare.',
  '⚠ The store keeps slipping from its recent high again — evening after evening, lower.',
];

function numOrNull(fn) { try { const v = fn(); return (typeof v === 'number' && isFinite(v)) ? v : null; } catch (e) { return null; } }

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'depositgate-b', fullTelemetry: false });
  if (OFF) Game._firenarrEvening = function () { return null; };
  const sayLines = [];
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { sayLines.push({ day: (Game.state.scholar || {}).day || 0, line: String(args[0] || '').slice(0, 400) }); } catch (e) {}
        return origSay.apply(this, args);
      };
    }
  }
  await setupGame(Game);
  const rows = [];
  const firenarrByNight = [];
  let sayCursor = 0;
  let pendingNight = null;
  const origEats = Game.villageEats;
  Game.villageEats = function (...args) {
    // Flush: firenarr lines since the last villageEats call belong
    // to the PREVIOUS night (hook runs after villageEats returns).
    if (pendingNight != null) {
      for (let i = sayCursor; i < sayLines.length; i++) {
        if (FIRENARR_TEMPLATES.includes(sayLines[i].line)) {
          firenarrByNight.push({ day: pendingNight, line: sayLines[i].line });
        }
      }
    }
    sayCursor = sayLines.length;
    const ret = origEats.apply(this, args);
    const day = (Game.state.scholar || {}).day || 0;
    let streak = null;
    try { const pg = (typeof Game.progState === 'function') ? Game.progState() : null; streak = pg ? (pg.hungryStreak || 0) : null; } catch (e) { streak = null; }
    rows.push({
      day,
      pantryKcal: numOrNull(() => Math.round(Game.pantryKcal())),
      hungryStreak: streak,
      gateEngaged: numOrNull(() => (typeof Game._depositGateEngaged === 'function') ? (Game._depositGateEngaged() ? 1 : 0) : null) === 1,
    });
    pendingNight = day;
    sayCursor = sayLines.length;
    return ret;
  };
  const result = await runDays(Game, competent, { days: DAYS, manifest: null });
  // Final flush: the last night's firenarr line (if any) follows the
  // final villageEats call and precedes no further call.
  if (pendingNight != null) {
    for (let i = sayCursor; i < sayLines.length; i++) {
      if (FIRENARR_TEMPLATES.includes(sayLines[i].line)) {
        firenarrByNight.push({ day: pendingNight, line: sayLines[i].line });
      }
    }
  }
  let alive = null;
  try {
    const roster = ((Game.state || {}).village || {}).roster || [];
    alive = roster.filter((id) => { try { const p = Game.getPerson(id); return p && !p.dead; } catch (e) { return false; } }).length;
  } catch (e) {}
  return {
    seed, arm: OFF ? 'off' : 'on', policy: 'competent', days: DAYS,
    daysAlive: result.days, endReason: result.endReason,
    deaths: (result.samples && result.samples.deaths) || [],
    alive, rows, firenarrByNight,
    sayLines: sayLines.filter((x) => FIRENARR_TEMPLATES.includes(x.line)),
  };
}

(async () => {
  for (const seed of SEEDS) {
    try {
      const out = await oneInstance(seed);
      process.stdout.write(JSON.stringify(out) + '\n');
    } catch (e) {
      console.error('FATAL seed ' + seed + ': ' + (e && e.stack ? e.stack : e));
      process.exitCode = 3;
    }
  }
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
