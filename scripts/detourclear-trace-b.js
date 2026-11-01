#!/usr/bin/env node
// detourclear-trace-b.js — intermediate-block-clearing census + probe driver (DIAG ONLY).
// (sim-detourclear-b; prereg: evidence/2026-11-01/sim-detourclear-b-prereg.md,
// committed BEFORE any judged leg.)
//
// CENSUS leg (PROBE=0): plain nighttravel, detour gate OFF. Per loop-day the
// wrapper records the nighttravel record (ctx._ntLast) and, on every
// travel-refused evening, a LIVE classification: departure, hop block kind,
// blocked tile + approach tile (found by mirroring travelTo's
// intermediate scan — read-only travelBlockage probes), BFS detour length
// (read-only mirror of nighttravel's BFS), approach-walk length, kcal,
// woodCount, swimmer flag, dayTicks, ticksToDayEnd (512 - dayTicks).
// No verb calls in the census leg.
//
// PROBE leg (PROBE=1, same seeds/gates): on a travel-refused evening the
// driver additionally walks honestly to the approach tile (BFS-clean
// orthogonal travelTo steps), calls the honest clearing action for the
// block type (clearBlockage for fallen_tree/rubble/washed_out;
// buildBridge for creek when wood >= 4; no call for creek + wood < 4 —
// that IS the fail case), verifies block-gone via travelBlockage, and
// re-hops travelTo(haven). It does NOT call the insideevening entry leg
// after the probe: the probe measures clearing + hop, not entry. The
// harness sleep then proceeds from wherever the probe left the villager,
// so probe-leg later evenings are POST-INTERVENTION and must never be
// pooled into census counts; the probe leg's judged outputs are attempt
// rows only.
//
// Env (all substrate gates asserted FATAL):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   COMPETENT_EVENING_DETOUR unset or "0" (never "1": detour would rescue
//     refusals before classification)
//   PROBE="0"|"1" (required), SEEDS, DAYS=30, OUTDIR (required)
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { nighttravel } = require('./policies/nighttravel');

if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }
if (process.env.COMPETENT_EVENING_DETOUR === '1') { console.error('FATAL: COMPETENT_EVENING_DETOUR must NOT be 1 (detour would rescue refusals before classification)'); process.exit(2); }
const PROBE = process.env.PROBE;
if (PROBE !== '0' && PROBE !== '1') { console.error('FATAL: PROBE must be exactly 0 or 1'); process.exit(2); }
const SEEDS = (process.env.SEEDS || '')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
if (!SEEDS.length) { console.error('FATAL: SEEDS required'); process.exit(2); }
const DAYS = parseInt(process.env.DAYS || '30', 10);
if (DAYS !== 30) { console.error('FATAL: DAYS must be 30 for detourclear legs'); process.exit(2); }
const OUTDIR = process.env.OUTDIR;
if (!OUTDIR) { console.error('FATAL: OUTDIR required'); process.exit(2); }

function realSleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) { try { require('child_process').execSync('sleep ' + (ms / 1000)); } catch (e2) { /* sleep fallback failed; retry loop continues */ } }
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
function snapPos(Game) {
  const sch = (Game.state || {}).scholar || {};
  let tile = null;
  try { const t = Game.playerTile(); tile = t ? (t.type || null) : null; } catch (e) { tile = 'tile-error:' + String(e && e.message).slice(0, 80); }
  return {
    inside: (sch.insideHaven === undefined ? null : !!sch.insideHaven),
    insideTent: (sch.insideTent === undefined ? null : !!sch.insideTent),
    tile,
    mapPx: (Game.map ? Game.map.px : null), mapPy: (Game.map ? Game.map.py : null),
    kcal: Math.round(sch.kcal || 0),
    dayTicks: (sch.dayTicks === undefined ? null : sch.dayTicks),
    gameDay: sch.day || 0,
  };
}
function combatLive(Game) {
  try { if (Game.inCombat && Game.inCombat()) return true; } catch (e) { /* combat probe failed; fall through */ }
  try { if (Game.pendingEncounter) return true; } catch (e) { /* pending probe failed */ }
  try { if (Game.tbfight && !Game.tbfight.over) return true; } catch (e) { /* tbfight probe failed */ }
  return false;
}
// BFS over orthogonal travelBlockage-clean steps (mirror of nighttravel's
// bfsDetourPath, generalized to any goal). Returns the step list from
// start (exclusive) to goal (inclusive), or null when unreachable.
function bfsPath(Game, sx, sy, hx, hy) {
  try {
    const N = (Game.map && Game.map.worldSize) || 9;
    const key = (x, y) => x + ',' + y;
    const prev = {}; prev[key(sx, sy)] = null;
    const q = [[sx, sy]];
    while (q.length) {
      const [x, y] = q.shift();
      if (x === hx && y === hy) break;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= N || ny >= N || key(nx, ny) in prev) continue;
        let blocked = true;
        try { blocked = !!Game.travelBlockage(nx, ny, x, y); } catch (e) { blocked = true; }
        if (blocked) continue;
        prev[key(nx, ny)] = [x, y];
        q.push([nx, ny]);
      }
    }
    if (!(key(hx, hy) in prev)) return null;
    const path = [];
    let cur = [hx, hy];
    while (!(cur[0] === sx && cur[1] === sy)) { path.unshift(cur); cur = prev[key(cur[0], cur[1])]; }
    return path;
  } catch (e) { return null; }
}
// Mirror of travelTo's intermediate scan (src/js/game.js): iterate the path
// bounding box in travelTo's order and return the FIRST blocking tile with
// its approach tile, or null when the hop is clean. Read-only except for
// beyondTile generation, which travelTo itself performs before checking.
function findFirstBlock(Game, px0, py0, x, y) {
  const dTot = Math.abs(x - px0) + Math.abs(y - py0);
  if (dTot <= 1) return null;
  const bx0 = Math.min(px0, x) - 1, bx1 = Math.max(px0, x) + 1;
  const by0 = Math.min(py0, y) - 1, by1 = Math.max(py0, y) + 1;
  const blocks = [];
  for (let ty = by0; ty <= by1; ty++) for (let tx = bx0; tx <= bx1; tx++) {
    if ((tx === px0 && ty === py0) || (tx === x && ty === y)) continue;
    const dS = Math.abs(tx - px0) + Math.abs(ty - py0);
    const dT = Math.abs(x - tx) + Math.abs(y - ty);
    if (dS === 0 || dS + dT !== dTot) continue;
    for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const ex = tx + ox, ey = ty + oy;
      if (ex < bx0 || ex > bx1 || ey < by0 || ey > by1) continue;
      const dE = Math.abs(ex - px0) + Math.abs(ey - py0);
      if (dE !== dS - 1 || dE + 1 + dT !== dTot) continue;
      try {
        if ((tx < 0 || tx > 8 || ty < 0 || ty > 8) && !Game.tileAt(tx, ty)) Game.beyondTile(tx, ty);
      } catch (e) { blocks.push({ error: 'beyondTile:' + String(e && e.message).slice(0, 80) }); continue; }
      let ib = null, ibErr = null;
      try { ib = Game.travelBlockage(tx, ty, ex, ey); } catch (e) { ibErr = String(e && e.message).slice(0, 80); }
      if (ibErr) { blocks.push({ error: ibErr }); continue; }
      if (ib) blocks.push({ blockedTile: { x: tx, y: ty }, approachTile: { x: ex, y: ey }, blockType: ib.blockType, kind: ib.kind });
    }
  }
  return { blocks, first: blocks.length ? blocks[0] : null };
}
function blockedTileProps(Game, bx, by) {
  try {
    const t = Game.tileAt(bx, by);
    if (!t) return null;
    return {
      type: t.type || null, needsBridge: (t.needsBridge === undefined ? null : !!t.needsBridge),
      bridged: (t.bridged === undefined ? null : !!t.bridged),
      blockFrom: t.blockFrom ? { dx: t.blockFrom.dx, dy: t.blockFrom.dy, type: t.blockFrom.type } : null,
    };
  } catch (e) { return { error: String(e && e.message).slice(0, 80) }; }
}

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'detourclear-b', fullTelemetry: false });
  const sayLines = [];
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { if (sayLines.length < 20000) sayLines.push({ day: (Game.state.scholar || {}).day || 0, line: String(args[0] || '').slice(0, 400) }); } catch (e) { /* say capture failed; narration is diagnostic only */ }
        return origSay.apply(this, args);
      };
    }
  }
  await setupGame(Game);
  const evenings = [];
  let callIdx = 0;
  const base = nighttravel;
  const policy = Object.assign({}, base, {
    daily(Game2, ctx) {
      callIdx++;
      const sayBefore = sayLines.length;
      base.daily(Game2, ctx);
      const nt = ctx._ntLast || {};
      const pos = snapPos(Game2);
      const row = {
        loopDay: callIdx, seed,
        eveningOutcome: nt.outcome || 'policy-no-record',
        travelledHome: !!nt.travelledHome,
        havenDistance: (nt.havenDistance === undefined ? null : nt.havenDistance),
        travelOffered: (nt.travelOffered === undefined ? null : nt.travelOffered),
        hopReturnKind: (nt.travel && nt.travel.hopReturnKind) || null,
        before: nt.before || null,
        after: pos,
        inCombat: combatLive(Game2), gameOver: !!Game2.over,
      };
      if (nt.outcome === 'travel-refused') {
        const before = nt.before || {};
        const hx = (nt.haven && nt.haven.hx !== undefined) ? nt.haven.hx : 4;
        const hy = (nt.haven && nt.haven.hy !== undefined) ? nt.haven.hy : 4;
        const px0 = before.mapPx, py0 = before.mapPy;
        const scan = (px0 !== null && px0 !== undefined) ? findFirstBlock(Game2, px0, py0, hx, hy) : { blocks: [], first: null, error: 'no-departure' };
        const first = scan.first || null;
        const detour = (px0 !== null && px0 !== undefined) ? bfsPath(Game2, px0, py0, hx, hy) : null;
        const approachWalk = (first && px0 !== null && px0 !== undefined)
          ? bfsPath(Game2, px0, py0, first.approachTile.x, first.approachTile.y) : null;
        let wood = null, woodErr = null, swimmer = null, swimmerErr = null;
        try { wood = Game2.woodCount(); } catch (e) { woodErr = String(e && e.message).slice(0, 80); }
        try { swimmer = !!(Game2.hasAbility && Game2.hasAbility('swimmer')); } catch (e) { swimmerErr = String(e && e.message).slice(0, 80); }
        const cls = {
          departure: { mapPx: px0, mapPy: py0, tile: before.tile || null },
          haven: { hx, hy },
          hopDistance: (nt.havenDistance === undefined ? null : nt.havenDistance),
          hopReturnKind: row.hopReturnKind,
          blockType: first ? first.blockType : null,
          blockedTile: first ? first.blockedTile : null,
          approachTile: first ? first.approachTile : null,
          scanBlocks: scan.blocks,
          scanFirstIsHopBlock: !!(first && row.hopReturnKind === 'block:' + first.blockType),
          blockedTileProps: first ? blockedTileProps(Game2, first.blockedTile.x, first.blockedTile.y) : null,
          detourPath: detour, detourLength: detour ? detour.length : null,
          approachWalkPath: approachWalk,
          approachWalkSteps: (first && px0 === first.approachTile.x && py0 === first.approachTile.y) ? 0
            : (approachWalk ? approachWalk.length : null),
          kcal: pos.kcal, wood, woodErr, swimmer, swimmerErr,
          dayTicks: pos.dayTicks, ticksToDayEnd: (pos.dayTicks === null ? null : 512 - pos.dayTicks),
        };
        row.classification = cls;
        row.eveningSayTail = sayLines.slice(Math.max(sayBefore, sayLines.length - 20), sayLines.length).map((x) => x.line);
        if (PROBE === '1' && first) {
          const attempt = { blockType: first.blockType, blockedTile: first.blockedTile, approachTile: first.approachTile };
          const sayA = sayLines.length;
          // 1. Walk honestly to the approach tile.
          const walkSteps = [];
          let walkOk = (px0 === first.approachTile.x && py0 === first.approachTile.y);
          if (!walkOk && approachWalk) {
            walkOk = true;
            for (const [tx, ty] of approachWalk) {
              if (Game2.over || combatLive(Game2)) { walkOk = false; break; }
              const fx = Game2.map.px, fy = Game2.map.py;
              let stepErr = null;
              try { Game2.travelTo(tx, ty); } catch (e) { stepErr = String(e && e.message).slice(0, 120); }
              const moved = (Game2.map.px === tx && Game2.map.py === ty);
              walkSteps.push({ from: { mapPx: fx, mapPy: fy }, to: { mapPx: tx, mapPy: ty }, moved, stepErr, combatLive: combatLive(Game2) });
              if (!moved) { walkOk = false; break; }
            }
          } else if (!approachWalk) { walkOk = false; }
          attempt.walkSteps = walkSteps; attempt.walkOk = walkOk;
          attempt.walkCombatLive = combatLive(Game2); attempt.walkGameOver = !!Game2.over;
          // 2. Honest clearing action (only from the approach tile, only
          // when the walk succeeded and no combat/death intervened).
          const kcalBefore = snapPos(Game2).kcal;
          const dayTicksBefore = snapPos(Game2).dayTicks;
          const gameDayBefore = snapPos(Game2).gameDay;
          let woodBefore = null;
          try { woodBefore = Game2.woodCount(); } catch (e) { woodBefore = null; }
          let action = null, actionReturn = null, actionErr = null;
          if (walkOk && !Game2.over && !combatLive(Game2)) {
            try {
              if (first.blockType === 'creek') {
                if ((woodBefore || 0) >= 4) { action = 'buildBridge'; actionReturn = Game2.buildBridge(first.blockedTile.x, first.blockedTile.y); }
                else { action = 'none-creek-no-wood'; actionReturn = null; }
              } else {
                action = 'clearBlockage'; actionReturn = Game2.clearBlockage(first.blockedTile.x, first.blockedTile.y);
              }
            } catch (e) { actionErr = String(e && (e.stack || e.message)).slice(0, 300); }
          } else { action = walkOk ? 'skipped-combat-or-dead' : 'skipped-walk-failed'; }
          const afterAct = snapPos(Game2);
          attempt.action = action; attempt.actionReturn = actionReturn; attempt.actionErr = actionErr;
          attempt.kcalBefore = kcalBefore; attempt.kcalAfterAction = afterAct.kcal;
          attempt.dayTicksBefore = dayTicksBefore; attempt.dayTicksAfterAction = afterAct.dayTicks;
          attempt.gameDayBefore = gameDayBefore; attempt.gameDayAfterAction = afterAct.gameDay;
          attempt.dayRolled = afterAct.gameDay !== gameDayBefore;
          try { attempt.woodAfterAction = Game2.woodCount(); } catch (e) { attempt.woodAfterAction = null; }
          attempt.woodBefore = woodBefore;
          // 3. Block-gone verification + re-hop.
          let blockGone = null, blockGoneErr = null;
          try { blockGone = !Game2.travelBlockage(first.blockedTile.x, first.blockedTile.y, first.approachTile.x, first.approachTile.y); }
          catch (e) { blockGoneErr = String(e && e.message).slice(0, 120); }
          attempt.blockGone = blockGone; attempt.blockGoneErr = blockGoneErr;
          let reHopMoved = null, reHopErr = null;
          if (blockGone && !Game2.over && !combatLive(Game2)) {
            try { Game2.travelTo(hx, hy); } catch (e) { reHopErr = String(e && e.message).slice(0, 120); }
            const afterHop = snapPos(Game2);
            reHopMoved = (afterHop.mapPx === hx && afterHop.mapPy === hy);
            attempt.reHopPosition = afterHop;
          }
          attempt.reHopMoved = reHopMoved; attempt.reHopErr = reHopErr;
          attempt.reHopCombatLive = combatLive(Game2); attempt.reHopGameOver = !!Game2.over;
          attempt.sayWindow = sayLines.slice(sayA).map((x) => x.line);
          row.probe = attempt;
        }
      }
      evenings.push(row);
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  return {
    seed, probe: PROBE === '1', gateDetour: process.env.COMPETENT_EVENING_DETOUR || 'unset',
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    maxWaveUnlocked: result.maxWaveUnlocked, waveKills: result.waveKills,
    deaths: (result.samples && result.samples.deaths) || [],
    evenings,
  };
}

(async () => {
  const pending = [];
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    const refused = inst.evenings.filter((e) => e.eveningOutcome === 'travel-refused').length;
    const attempts = inst.evenings.filter((e) => e.probe).length;
    const name = `detourclear-b-${PROBE === '1' ? 'probe' : 'census'}-s${seed}.json`;
    const data = JSON.stringify(inst);
    const summary = `detourclear probe=${PROBE} seed=${seed} end=${inst.endReason} days=${inst.daysAlive} evenings=${inst.evenings.length} refused=${refused} attempts=${attempts}`;
    if (tryWrite(path.join(OUTDIR, name), data, 6)) console.log(summary + ' written');
    else { pending.push({ name, data }); console.error(summary + ' WRITE PENDING (EPERM flap) — kept in memory'); }
  }
  for (const p of pending) {
    if (tryWrite(path.join(OUTDIR, p.name), p.data, 6)) console.log('flushed pending ' + p.name);
    else { console.error('FATAL: could not flush ' + p.name + ' — corpus incomplete'); process.exit(1); }
  }
})().catch((e) => { console.error('FATAL detourclear driver: ' + (e && (e.stack || e.message))); process.exit(1); });
