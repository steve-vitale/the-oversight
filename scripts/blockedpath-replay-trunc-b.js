#!/usr/bin/env node
// blockedpath-replay-b.js — geometry + clearability replay for the
// nighttravel verdict's 115 refused-hop evenings (MEASUREMENT ONLY).
//
// Replays the pooled-36 nighttravel policy leg EXACTLY as
// scripts/nighttravel-trace-b.js ran it (same harness mode, same
// substrate gates, same thief grant, same genuine tap days), with
// two added non-destructive reads:
//   (1) a Game.travelTo wrapper recording every hop call's return
//       block {blockType, x, y} per loop-day — the engine's own
//       first-blockage tile, which the verdict corpus did not store
//       (it stored only hopReturnKind);
//   (2) a post-daily probe on refused evenings (state is unchanged
//       by a refused hop: position/kcal/ticks identical, verified
//       per evening against the corpus travel record) using the
//       shared creekpath probe: directHopBlockage (destination vs
//       intermediate leg), bfsRouteAround, crossingFix, wood,
//       swimmer.
// No game code, no policy code, no trajectory steering: the wrapper
// only records, the probe only reads. Tap days are replicated
// exactly (genuine thief tap) so tap-day trajectories match the
// corpus; tap outcome classification is omitted (it does not
// affect trajectory, only the tap record).
//
// Env (asserted FATAL, same as the nighttravel corpus):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   SEEDS (default: the pooled-36 list)  DAYS=30 TAPDAYS=5
//   OUT (default evidence/2026-10-29/sim-blockedpath-diag-b-replay.json)
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { nighttravel } = require('./policies/nighttravel');
const { directHopBlockage, bfsRouteAround, crossingFix } = require('./creekpath-probe-b');

for (const [k, v] of [['COMPETENT_FEAST', '0'], ['SEATDRIVE', '0'], ['PLENTYDEPRI', '0'], ['DEPOSITGATE', '1']]) {
  if (process.env[k] !== v) { console.error(`FATAL: ${k}=${v} must be set explicitly`); process.exit(2); }
}
// TRUNCATED variant: only the 18 seeds with refused evenings, each run
// only to its last refused loop-day (corpus-derived). Prefix-identical
// to the full 30-day run (deterministic, no future dependence) — but
// the tap window MUST stay at the original days 26-30, not shift with
// truncation, so it is hardcoded below (callIdx > 25) instead of
// DAYS-TAPDAYS. Total 347 days vs 1080 for the full leg.
const LASTDAYS = { 11031: 29, 11077: 10, 11112: 22, 11133: 16, 11149: 30, 11208: 30, 11246: 10, 11251: 12, 11273: 26, 11299: 16, 11349: 23, 11360: 15, 11365: 16, 11384: 15, 11390: 28, 11408: 25, 11435: 9, 11439: 15 };
const SEEDS = (process.env.SEEDS || Object.keys(LASTDAYS).join(','))
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const OUT = process.env.OUT || path.join(__dirname, '..', 'evidence', '2026-10-29', 'sim-blockedpath-diag-b-replay.json');

function loadAbilityDefs() {
  const abs = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'abilities.json'), 'utf8'));
  const map = {};
  for (const a of abs) for (const act of (a.actions || [])) map[a.id + '.' + act.id] = { ability: a.id, action: act.id, actObj: act };
  return map;
}
function snapPos(Game) {
  const sch = (Game.state || {}).scholar || {};
  let tile = null;
  try { const t = Game.playerTile(); tile = t ? (t.type || null) : null; } catch (e) {}
  return { inside: (sch.insideHaven === undefined ? null : !!sch.insideHaven),
    insideTent: (sch.insideTent === undefined ? null : !!sch.insideTent),
    tile, mapPx: (Game.map ? Game.map.px : null), mapPy: (Game.map ? Game.map.py : null),
    kcal: Math.round(sch.kcal || 0) };
}

async function oneInstance(seed, defs) {
  const { Game } = await loadGame({ seed, mode: 'nighttravel-b', fullTelemetry: false });
  await setupGame(Game);
  const s = Game.state.scholar;
  try {
    const abs = (s.abilities || []);
    if (!abs.some((a) => (a.id || a) === 'thief')) abs.push({ id: 'thief', level: 1 });
    s.abilities = abs;
  } catch (e) {}
  // travelTo wrapper: record only, never steer.
  const travelCalls = [];
  let curDay = 0;
  const origTravel = Game.travelTo;
  Game.travelTo = function (x, y, force, combatExit) {
    const fx = Game.map ? Game.map.px : null, fy = Game.map ? Game.map.py : null;
    const r = origTravel.apply(Game, arguments);
    let ret = null;
    if (r === undefined) ret = { kind: 'ok' };
    else if (r === null) ret = { kind: 'null' };
    else if (typeof r === 'object') ret = { kind: 'block', blockType: r.blockType || r.kind || null, x: r.x, y: r.y };
    else ret = { kind: String(r) };
    travelCalls.push({ loopDay: curDay, from: [fx, fy], to: [x, y], ret });
    return r;
  };
  const refused = [];
  let callIdx = 0;
  const policy = Object.assign({}, nighttravel, {
    daily(Game2, ctx) {
      callIdx++; curDay = callIdx;
      nighttravel.daily(Game2, ctx);
      const nt = ctx._ntLast || {};
      if (nt.outcome === 'travel-refused') {
        // Post-nightStep state == pre-hop state for a refusal
        // (corpus travel record: kcalDeltaHop 0, ticks unchanged,
        // arrival == departure). Probe it now, read-only.
        const b = nt.before || {};
        let probe = null;
        try {
          const block = directHopBlockage(Game2, 4, 4);
          const route = bfsRouteAround(Game2, 4, 4);
          const fix = block ? crossingFix(Game2, block) : null;
          let wood = null, swimmer = null;
          try { wood = Game2.woodCount(); } catch (e) {}
          try { swimmer = !!Game2.hasAbility('swimmer'); } catch (e) {}
          probe = { block, route: route || null, fix, wood, swimmer };
        } catch (e) { probe = { error: String(e && e.message).slice(0, 200) }; }
        refused.push({ seed, loopDay: callIdx, preStepMap: (b.mapPx + ',' + b.mapPy),
          preStepTile: b.tile || null, havenDistance: nt.havenDistance,
          hopReturnKind: (nt.travel || {}).hopReturnKind || null,
          kcalDeltaHop: (nt.travel || {}).kcalDeltaHop,
          ticksBefore: (nt.travel || {}).ticksBefore, ticksAfterHop: (nt.travel || {}).ticksAfterHop,
          arrivalMap: (nt.travel && nt.travel.arrival) ? (nt.travel.arrival.mapPx + ',' + nt.travel.arrival.mapPy) : null,
          probe });
      }
      // TAP DAYS: replicate the corpus driver's genuine thief tap.
      if (callIdx > 25 && !Game2.over) { // original tap window: days 26-30 of the 30-day leg
        const def = defs['thief.steal_pantry'];
        let avail = null;
        try { avail = Game2._actionAvailable('thief', def.actObj); } catch (e) {}
        if (avail && avail.ok) { try { Game2.activateAbility('thief.steal_pantry'); } catch (e) {} }
      }
    },
  });
  const result = await runDays(Game, policy, { days: LASTDAYS[seed] || 30, manifest: null });
  return { seed, daysAlive: result.days, endReason: result.endReason, refused, travelCalls };
}

(async () => {
  const defs = loadAbilityDefs();
  const out = { seeds: SEEDS, refused: [], travelCallsBySeed: {} };
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed, defs);
    console.log(`seed ${seed}: daysAlive=${inst.daysAlive} end=${inst.endReason} refused=${inst.refused.length}`);
    out.refused.push(...inst.refused);
    out.travelCallsBySeed[seed] = inst.travelCalls;
    // Incremental write: a timeout kill must not lose finished seeds.
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
  const back = fs.readFileSync(OUT, 'utf8');
  if (back !== JSON.stringify(out, null, 1)) { console.error('READBACK MISMATCH'); process.exit(3); }
  console.log(`refused total=${out.refused.length} wrote ${OUT}`);
})().catch((e) => { console.error('REPLAY CRASH', e && (e.stack || e)); process.exit(2); });
