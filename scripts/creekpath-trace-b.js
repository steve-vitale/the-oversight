#!/usr/bin/env node
// creekpath-trace-b.js — blocked-path travel-home census instrument
// (sim-creekpath-b; prereg: evidence/2026-10-28/sim-creekpath-b-prereg.md,
// committed BEFORE any judged run).
//
// One fresh game per seed (scripts/sim-harness.js). The wrapped policy runs
// competent.daily once per loop-day; the driver then takes a NON-DESTRUCTIVE
// evening probe: it NEVER calls travelTo, so probed trajectories are
// identical to plain competent. The probe classifies the direct hop home
// exactly as Game.travelTo would (destination blockage first, then the
// intermediate-tile scan on shortest paths — mirrored from travelTo), and
// for refused hops records lawful daytime alternatives: a BFS route-around
// over orthogonal travelBlockage-clean steps, and crossing-fix feasibility
// on the first blocking tile (bridge wood / swimmer / clearable blockFrom).
//
// Env (substrate gates asserted FATAL, same as the nighttravel corpus so
// the 10757 index case is comparable):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY="competent" (default) — a policy module name under scripts/policies/
//   SEEDS="10750,...,10757"  DAYS=30
//   OUTDIR (default evidence/2026-10-28/sim-creekpath-b-corpus-<policy>)
// Write transport mirrors the sibling arms: failed writes are retried, then
// staged inside this worktree (.creekpath-staging, never /tmp) and the run
// exits loudly.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');

if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }
const POLICY = process.env.POLICY || 'competent';
const SEEDS = (process.env.SEEDS || '10750,10751,10752,10753,10754,10755,10756,10757')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '30', 10);
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-28', 'sim-creekpath-b-corpus-' + POLICY);
const STAGING_DIR = path.join(__dirname, '..', '.creekpath-staging');

function realSleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) { try { require('child_process').execSync('sleep ' + (ms / 1000)); } catch (e2) {} }
}
function tryWrite(filePath, data, attempts) {
  for (let i = 0; i < attempts; i++) {
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, data);
      const back = fs.readFileSync(filePath, 'utf8');
      if (back !== data) throw new Error('readback mismatch');
      JSON.parse(back);
      return true;
    } catch (e) {
      if (i === attempts - 1) return false;
      realSleepMs(2000);
    }
  }
  return false;
}

const { havenCoords, directHopBlockage, bfsRouteAround, crossingFix } = require('./creekpath-probe-b');

function snapPos(Game) {
  const sch = (Game.state || {}).scholar || {};
  let tile = null;
  try { const t = Game.playerTile(); tile = t ? (t.type || null) : null; } catch (e) {}
  return {
    inside: (sch.insideHaven === undefined ? null : !!sch.insideHaven),
    insideTent: (sch.insideTent === undefined ? null : !!sch.insideTent),
    mx: (sch.mx === undefined ? null : sch.mx), my: (sch.my === undefined ? null : sch.my),
    tile, mapPx: (Game.map ? Game.map.px : null), mapPy: (Game.map ? Game.map.py : null),
    kcal: Math.round(sch.kcal || 0), gameDay: sch.day || 0,
  };
}

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'creekpath-b', fullTelemetry: false });
  await setupGame(Game);
  // GRANT_THIEF=1 replicates the nighttravel corpus driver's grant
  // (thief ability pushed before day 1) so a strand seen only under that
  // substrate can be reproduced or ruled out. Default off: the census
  // baseline is ungranted competent.
  let grantThief = false;
  if (process.env.GRANT_THIEF === '1') {
    try {
      const s = Game.state.scholar;
      const abs = (s.abilities || []);
      if (!abs.some((a) => (a.id || a) === 'thief')) abs.push({ id: 'thief', level: 1 });
      s.abilities = abs;
      grantThief = !!Game.hasAbility('thief');
    } catch (e) { grantThief = false; }
  }
  // Fresh-map corridor snapshot (index-case check): tiles around the
  // (3,3)->(4,4) strand, read before any daily runs.
  const corridor = {};
  for (const [x, y] of [[3, 3], [4, 3], [3, 4], [4, 4], [2, 3], [3, 2], [4, 2], [2, 4], [5, 4], [4, 5]]) {
    try {
      const t = Game.tileAt(x, y);
      corridor[x + ',' + y] = t ? { type: t.type, needsBridge: !!t.needsBridge, bridged: !!t.bridged, blockFrom: t.blockFrom || null, revealed: !!t.revealed } : null;
    } catch (e) { corridor[x + ',' + y] = { error: String(e && e.message).slice(0, 80) }; }
  }
  const base = require('./policies/' + POLICY);
  const basePolicy = base[POLICY] || base.competent || base;
  const evenings = [];
  let callIdx = 0;
  const policy = Object.assign({}, basePolicy, {
    daily(Game2, ctx) {
      callIdx++;
      // Arm B instrument fields (non-destructive reads only): tile before
      // the day runs, and the detour counter the policy accumulates in
      // ctx (0 under pristine competent, which has no such counter).
      const prevPx = Game2.map ? Game2.map.px : null;
      const prevPy = Game2.map ? Game2.map.py : null;
      const prevDetours = (ctx && ctx.tripHomeDetours) || 0;
      basePolicy.daily(Game2, ctx);
      const pos = snapPos(Game2);
      const row = { loopDay: callIdx, ...pos,
        movedDuringDay: (prevPx === null || prevPy === null) ? null :
          (pos.mapPx !== prevPx || pos.mapPy !== prevPy),
        tripHomeDetours: ((ctx && ctx.tripHomeDetours) || 0) - prevDetours };
      if (Game2.over) {
        row.probe = 'game-over';
      } else {
        const { hx, hy, type } = havenCoords(Game2);
        row.haven = { hx, hy, type };
        row.inCombat = !!(Game2.inCombat && Game2.inCombat());
        if (pos.tile === 'haven') {
          row.probe = 'at-home';
        } else if (type !== 'haven') {
          row.probe = 'haven-unknown';
        } else {
          let offered = false;
          try { offered = (Game2.travelTargets() || []).some((t) => t.x === hx && t.y === hy); } catch (e) { row.offerErr = String(e && e.message).slice(0, 120); }
          row.travelOffered = offered;
          if (!offered) {
            row.probe = 'out-of-reach';
            row.havenDistance = Math.abs(pos.mapPx - hx) + Math.abs(pos.mapPy - hy);
          } else if (row.inCombat) {
            row.probe = 'blocked-combat';
          } else {
            row.havenDistance = Math.abs(pos.mapPx - hx) + Math.abs(pos.mapPy - hy);
            const block = directHopBlockage(Game2, hx, hy);
            if (!block) {
              row.probe = 'hop-clear';
            } else {
              row.probe = 'refused';
              row.block = block;
              row.routeAround = bfsRouteAround(Game2, hx, hy);
              row.crossingFix = crossingFix(Game2, block);
              row.wood = (typeof Game2.woodCount === 'function') ? Game2.woodCount() : null;
              try { row.swimmer = !!Game2.hasAbility('swimmer'); } catch (e) { row.swimmer = null; }
              row.hasAlternative = !!(row.routeAround && row.routeAround.path) || !!(row.crossingFix && row.crossingFix.feasible);
            }
          }
        }
      }
      evenings.push(row);
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  return {
    seed, policy: POLICY, grantThief, daysAlive: result.days, endReason: result.endReason,
    gameDays: result.gameDays, maxWaveUnlocked: result.maxWaveUnlocked,
    waveKills: result.waveKills, deaths: (result.samples && result.samples.deaths) || [],
    corridor, evenings,
  };
}

async function main() {
  const staged = [];
  for (const seed of SEEDS) {
    let rec = null;
    try {
      rec = await oneInstance(seed);
      const nRef = rec.evenings.filter((e) => e.probe === 'refused').length;
      const nAway = rec.evenings.filter((e) => e.probe === 'refused' || e.probe === 'hop-clear' || e.probe === 'out-of-reach').length;
      console.log(`seed ${seed}: daysAlive=${rec.daysAlive} end=${rec.endReason} evenings=${rec.evenings.length} away=${nAway} refused=${nRef}`);
    } catch (e) {
      console.error(`seed ${seed}: ERROR ${e && (e.stack || e.message)}`);
      staged.push({ seed, error: String(e && (e.stack || e.message)).slice(0, 500) });
      continue;
    }
    const file = path.join(OUTDIR, `creekpath-b-${POLICY}-s${seed}.json`);
    const data = JSON.stringify(rec);
    if (!tryWrite(file, data, 5)) {
      staged.push(rec);
      console.error(`seed ${seed}: WRITE FAILED, staged in memory`);
    }
  }
  if (staged.length) {
    fs.mkdirSync(STAGING_DIR, { recursive: true });
    const sf = path.join(STAGING_DIR, `creekpath-b-${POLICY}-staged.json`);
    tryWrite(sf, JSON.stringify(staged), 5);
    console.error(`STAGED ${staged.length} records at ${sf} — move into ${OUTDIR} before analyzing`);
    process.exit(3);
  }
  console.log('done');
}

main().catch((e) => { console.error('FATAL', e && (e.stack || e.message)); process.exit(1); });
