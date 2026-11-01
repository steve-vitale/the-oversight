#!/usr/bin/env node
// depositgate-b-driver.js — DEPOSITGATE gate-ledger census tracer (DIAG ONLY).
// (sim-depositgate-b; prereg: evidence/2026-11-01/sim-depositgate-b-prereg.md,
// committed BEFORE any judged sim.)
//
// Per seed, competent policy, 30 days, one arm per process (DEPOSITGATE=0
// control | =1 armed): a per-lived-day evening census row — pantry sensors
// (whole-pantry kcal, fresh days, days estimate), evening gate-engaged read
// (read-only, no RNG), hungryStreak, alive count, cumulative gate-ledger
// totals (shareEased kcal, return/bigHaul eased counts, tributeWaived kcal),
// plus driver-side wrapper totals: _depositGateHoldback held kcal by kind,
// and recordHarvestIntake 'depositgate-eased' kcal. Per-day eased-fire kcal
// is derived by the analyzer from cumulative deltas, so a ledger day keyed
// to scholar day can never misattribute a day.
//
// Transport (EPERM-flap rule, supplyleg precedent): this process NEVER
// writes files — it prints one JSON line per seed to stdout. The caller
// redirects stdout to a .jsonl file in evidence/.
//
// Env (FATAL if violated):
//   POLICY=competent, COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
//   DEPOSITGATE=0|1 (explicit), DAYS=30, SEEDS=<csv>
//   WOODCARRY/WOODWARM/MORNINGCARRY/WINDOWCARRY/STRANDFIX/PRESSB/FEDEVENING
//   must NOT be 1.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

if (process.env.POLICY !== 'competent') { console.error('FATAL: POLICY must be competent'); process.exit(2); }
if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '0' && process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=0|1 must be set explicitly'); process.exit(2); }
for (const k of ['WOODCARRY', 'WOODWARM', 'MORNINGCARRY', 'WINDOWCARRY', 'STRANDFIX', 'PRESSB', 'FEDEVENING']) {
  if (process.env[k] === '1') { console.error('FATAL: ' + k + ' must NOT be 1 in a depositgate leg'); process.exit(2); }
}
const SEEDS = (process.env.SEEDS || '51101').split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '30', 10);
if (DAYS !== 30) { console.error('FATAL: DAYS must be 30 for depositgate legs'); process.exit(2); }
const ARM = process.env.DEPOSITGATE === '1' ? 'armed' : 'control';

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
function ledgerTotals(Game) {
  try {
    const lg = (((Game.state || {}).village || {})._depositGate || {}).days || {};
    let share = 0, ret = 0, big = 0, trib = 0;
    for (const k of Object.keys(lg)) {
      const r = lg[k] || {};
      share += r.shareEased || 0; ret += r.returnEased || 0; big += r.bigHaulEased || 0; trib += r.tributeWaived || 0;
    }
    return { share: Math.round(share), returnCount: ret, bigCount: big, tributeWaived: Math.round(trib) };
  } catch (e) { return { share: 0, returnCount: 0, bigCount: 0, tributeWaived: 0 }; }
}

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'depositgate-b', fullTelemetry: false });
  const sayLines = [];
  let saySeq = 0;
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { if (sayLines.length < 40000) sayLines.push({ seq: saySeq++, day: (Game.state.scholar || {}).day || 0, line: String(args[0] || '').slice(0, 400) }); } catch (e) { console.error('depositgate say-tap error', e && e.message); }
        return origSay.apply(this, args);
      };
    }
  }
  await setupGame(Game);
  const holdbacks = []; // {loopDay, kind, vid, held}
  const intakes = []; // {loopDay, kcal} for route 'depositgate-eased'
  let loopDay = 0;
  if (typeof Game._depositGateHoldback === 'function') {
    const origHold = Game._depositGateHoldback.bind(Game);
    Game._depositGateHoldback = function (vid, kcal, kind) {
      const held = origHold(vid, kcal, kind);
      try { if (held > 0) holdbacks.push({ loopDay, kind: kind || null, vid: vid || null, held: Math.round(held) }); } catch (e) {}
      return held;
    };
  }
  if (typeof Game.recordHarvestIntake === 'function') {
    const origIntake = Game.recordHarvestIntake.bind(Game);
    Game.recordHarvestIntake = function (eater, portions, route) {
      try {
        if (route === 'depositgate-eased' && Array.isArray(portions)) {
          let k = 0;
          for (const p of portions) k += (p && p.kcal) || 0;
          if (k > 0) intakes.push({ loopDay, kcal: Math.round(k) });
        }
      } catch (e) {}
      return origIntake.apply(this, arguments);
    };
  }
  const rows = [];
  const cumAt = () => {
    const lt = ledgerTotals(Game);
    let hb = 0, hbRet = 0, hbBig = 0, ink = 0;
    for (const h of holdbacks) { hb += h.held; if (h.kind === 'return') hbRet += h.held; else hbBig += h.held; }
    for (const it of intakes) ink += it.kcal;
    return { share: lt.share, returnCount: lt.returnCount, bigCount: lt.bigCount, tributeWaived: lt.tributeWaived,
      holdbackKcal: hb, holdbackReturnKcal: hbRet, holdbackBigKcal: hbBig, intakeKcal: ink,
      holdbackCalls: holdbacks.length, intakeEvents: intakes.length };
  };
  const eveningRow = (loopDay2) => {
    let engaged = null;
    try { engaged = (typeof Game._depositGateEngaged === 'function') ? !!Game._depositGateEngaged() : null; } catch (e) { engaged = null; }
    let streak = null;
    try { const pg = (typeof Game.progState === 'function') ? Game.progState() : null; streak = pg ? (pg.hungryStreak || 0) : null; } catch (e) { streak = null; }
    return {
      loopDay: loopDay2,
      gameDay: numOrNull(() => (Game.state.scholar || {}).day || 0),
      pantryKcal: pantryKcal(Game),
      freshDays: numOrNull(() => Game.pantryFreshDays()),
      daysEstimate: numOrNull(() => Game.pantryDaysEstimate()),
      gateEngaged: engaged,
      hungryStreak: streak,
      alive: aliveCount(Game),
      cum: cumAt(),
    };
  };
  let callIdx = 0;
  const baseDaily = competent.daily.bind(competent);
  const policy = Object.assign({}, competent, {
    daily(Game2, ctx) {
      callIdx++;
      loopDay = callIdx;
      const morning = pantryKcal(Game2);
      const sayBefore = sayLines.length;
      baseDaily(Game2, ctx);
      const row = eveningRow(callIdx);
      row.morningPantryKcal = morning;
      row.sayLines = sayLines.slice(sayBefore).map((x) => x.line);
      rows.push(row);
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  return {
    seed, arm: ARM, policy: 'competent', days: DAYS,
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    maxWaveUnlocked: result.maxWaveUnlocked, waveKills: result.waveKills,
    deaths: (result.samples && result.samples.deaths) || [],
    rows, holdbacks, intakes, sayLines,
  };
}

async function main() {
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    process.stdout.write(JSON.stringify(inst) + '\n');
    console.error('depositgate arm=' + ARM + ' seed=' + seed + ' end=' + inst.endReason +
      ' daysAlive=' + inst.daysAlive + ' rows=' + inst.rows.length +
      ' holdbacks=' + inst.holdbacks.length + ' intakes=' + inst.intakes.length + ' stdout');
  }
  console.error('wrote ' + SEEDS.length + ' depositgate JSON lines to stdout');
}

if (require.main === module) {
  main().catch((e) => { console.error('DEPOSITGATE TRACE CRASH', e && (e.stack || e)); process.exit(2); });
}
module.exports = { oneInstance };
