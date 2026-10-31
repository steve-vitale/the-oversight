#!/usr/bin/env node
// p4sleep-trace-b.js — P4 sleep/upkeep-window tracer (DIAG ONLY).
// (sim-p4sleep-b; prereg: evidence/2026-10-31/sim-p4sleep-b-prereg.md,
// committed BEFORE any judged leg.)
//
// Brackets the absencehunt window: between the evening snap (after
// daily(), before sleep()) and the next morning snap (start of the next
// daily(), after that loop-day's 3 upkeep parts). Every hook boundary
// snaps the vessel position; a position change is attributed to the
// hook call whose post-snap first differs from its pre-snap.
//
// READ-ONLY with respect to game behavior: wrappers snap and delegate.
// No verb calls, no state writes, no RNG draws beyond what the routine
// itself performs. The policy wrapped is nomadseek, unmodified.
//
// Transport (EPERM-flap rule): this process NEVER writes files — it
// prints one JSON line per seed to stdout (a pre-opened fd). The caller
// redirects stdout to a .jsonl file in evidence/ in a foreground exec
// and splits it afterwards with an idle process
// (scripts/split-p4sleep-jsonl-b.js). Judged corpora are NEVER staged
// in /tmp, and judged legs NEVER write files from a game-loaded process.
//
// Env (all substrate gates asserted FATAL):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY must be nomadseek
//   WOODCARRY/WOODWARM must NOT be 1
//   MORNINGCARRY, WINDOWCARRY, STRANDFIX, PRESSB, FEDEVENING must NOT be 1
//   SEEDS (default 17501), DAYS in {30, 60}
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { nomadseek } = require('./policies/nomadseek');

if (process.env.POLICY !== 'nomadseek') { console.error('FATAL: POLICY must be nomadseek'); process.exit(2); }
if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }
if (process.env.WOODCARRY === '1' || process.env.WOODWARM === '1') { console.error('FATAL: WOODCARRY/WOODWARM must NOT be 1 for nomadseek'); process.exit(2); }
for (const k of ['MORNINGCARRY', 'WINDOWCARRY', 'STRANDFIX', 'PRESSB', 'FEDEVENING']) {
  if (process.env[k] === '1') { console.error('FATAL: ' + k + ' must NOT be 1 in a p4sleep leg'); process.exit(2); }
}

const SEEDS = (process.env.SEEDS || '17501')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '30', 10);
if (DAYS !== 30 && DAYS !== 60) { console.error('FATAL: DAYS must be 30 or 60 for p4sleep legs'); process.exit(2); }

const CTX_KEYS = ['forageTrips', 'tripHomeDetours', 'recoverDays', 'patrols',
  'nomadMoves', 'nomadRoadDays', 'nomadJoins',
  'capHuntSorties', 'capHuntAmbushed', 'capHuntNoticed', 'capHuntFeastFights',
  'capHuntWaveFights', 'capHuntNoTarget', 'capHuntUnreached', 'capHuntGone',
  'capHuntNoPos', 'facedDraw', 'thirstHome', 'capFightsFinishedAtDusk',
  'capFinishStalled'];
const FLAG_KEYS = ['_capHuntAway', '_capHuntAwayHome', '_feastFightDay', '_feastFightSweeps'];

function snapPos(Game) {
  const sch = (Game.state || {}).scholar || {};
  let tile = null, access = null, stage = null;
  try { const t = Game.playerTile(); tile = t ? (t.type || null) : null; } catch (e) {}
  try { access = (typeof Game.havenStoresAccess === 'function') ? Game.havenStoresAccess() : null; } catch (e) {}
  try { stage = (typeof Game.integrationStage === 'function') ? Game.integrationStage() : null; } catch (e) {}
  const v = (Game.state || {}).village || {};
  let roadActive = null, roadOnRoad = null;
  try { roadActive = !!((Game.state || {}).road && Game.state.road.active); } catch (e) {}
  try { roadOnRoad = (Game.nomad && typeof Game.nomad.onRoad === 'function') ? !!Game.nomad.onRoad() : null; } catch (e) {}
  return {
    inside: (sch.insideHaven === undefined ? null : !!sch.insideHaven),
    insideTent: (sch.insideTent === undefined ? null : !!sch.insideTent),
    exiled: (sch.exiled === undefined ? null : !!sch.exiled),
    mx: (sch.mx === undefined ? null : sch.mx), my: (sch.my === undefined ? null : sch.my),
    tile, access, stage,
    mapPx: (Game.map ? Game.map.px : null), mapPy: (Game.map ? Game.map.py : null),
    havenPx: (v.px === undefined ? null : v.px), havenPy: (v.py === undefined ? null : v.py),
    kcal: Math.round(sch.kcal || 0),
    gameDay: sch.day || 0,
    dayTicks: (sch.dayTicks === undefined ? null : sch.dayTicks),
    vesselId: (Game.villagerId !== undefined ? Game.villagerId : (sch.villagerId !== undefined ? sch.villagerId : null)),
    roadActive, roadOnRoad,
  };
}

function pantryKcal(Game) {
  try {
    const items = ((Game.state || {}).village || {}).pantry || [];
    let kcal = 0;
    for (const it of items) kcal += (it.kcalEach || 0) * (it.units || 1);
    return { kcal: Math.round(kcal), count: items.length };
  } catch (e) { return null; }
}

function ctxSnap(ctx) {
  const out = {};
  if (!ctx) return out;
  for (const k of CTX_KEYS) out[k] = ctx[k] || 0;
  for (const k of FLAG_KEYS) out[k] = (ctx[k] === undefined ? null : ctx[k]);
  return out;
}

function ctxDelta(before, after) {
  const out = {};
  for (const k of CTX_KEYS) out[k] = (after[k] || 0) - (before[k] || 0);
  for (const k of FLAG_KEYS) out[k] = { before: before[k], after: after[k] };
  return out;
}

function posKey(p) {
  if (!p) return 'null';
  return [p.inside, p.tile, p.mapPx, p.mapPy, p.mx, p.my, p.roadActive, p.roadOnRoad].join('|');
}

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'p4sleep-b', fullTelemetry: false });
  const sayLines = [];
  let saySeq = 0;
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { if (sayLines.length < 60000) sayLines.push({ seq: saySeq++, day: (Game.state.scholar || {}).day || 0, line: String(args[0] || '').slice(0, 400) }); } catch (e) {}
        return origSay.apply(this, args);
      };
    }
  }
  await setupGame(Game);

  // --- bracket state ---
  let ctxRef = null; // set from policy calls (same ctx object throughout)
  let phase = 'pre'; // 'pre' | 'daily' | 'window'
  let upkeepN = 0; // upkeep calls since last daily-pre
  let lastSnap = null; // last bracket snap (any hook)
  let lastHook = null; // hook label that produced lastSnap
  let lastPostSegment = null; // segment of the last POST snap (gap naming)
  let curWindow = null; // { openingLoopDay, openingEvening, events: [] }
  const windows = [];
  const decisions = [], evenings = [];
  let callIdx = 0;
  let fightCalls = 0, contestCalls = 0;

  function snap() { return snapPos(Game); }

  // Record a boundary snap. Attribution rule (prereg): a move detected
  // at a POST snap belongs to that hook call; a move detected at a PRE
  // snap belongs to the GAP since the last post-snap (the code that ran
  // between the two boundaries — wait-blocks, drives — not the hook
  // being entered). Gap naming from lastPostSegment: after an upkeep
  // post-snap the gap is a wait-block; after sleep-post it is the
  // post-sleep drive; after a drive/doAction post it stays a wait-block.
  function gapSegment() {
    if (!lastPostSegment) return 'gap-unknown';
    if (lastPostSegment === 'sleep') return 'post-sleep-drive';
    if (lastPostSegment === 'daily') return 'gap-evening-sleep';
    return 'wait-block';
  }
  function boundary(hookLabel, kind, ownSegment, ctxDeltaForHook, sayBefore, sayAfter) {
    const s = snap();
    if (lastSnap && posKey(s) !== posKey(lastSnap) && phase === 'window' && curWindow) {
      if (kind === 'post') {
        curWindow.events.push({
          hook: hookLabel, segment: ownSegment,
          from: lastSnap, to: s,
          ctxDelta: ctxDeltaForHook || null,
          saySeqBefore: sayBefore, saySeqAfter: sayAfter,
        });
        lastPostSegment = ownSegment;
      } else {
        curWindow.events.push({
          hook: hookLabel + ' (gap)', segment: gapSegment(),
          from: lastSnap, to: s,
          ctxDelta: null,
          saySeqBefore: sayBefore, saySeqAfter: sayAfter,
        });
      }
    } else if (kind === 'post') {
      lastPostSegment = ownSegment;
    }
    lastSnap = s;
    lastHook = hookLabel;
    return s;
  }

  // Wrap Game.sleep (harness calls Game.sleep() directly).
  const origSleep = Game.sleep;
  if (typeof origSleep === 'function') {
    Game.sleep = function (...args) {
      const before = ctxSnap(ctxRef);
      const sb = saySeq;
      boundary('sleep-pre', 'pre', null, null, sb, sb);
      const r = origSleep.apply(this, args);
      const after = ctxSnap(ctxRef);
      boundary('sleep-post', 'post', 'sleep', ctxDelta(before, after), sb, saySeq);
      return r;
    };
  }
  // Wrap Game.doAction BEFORE runDays wraps it again (runDays' wrapper
  // calls this one as its orig). Only 'wait' calls occur in the window,
  // but snap every call — a non-wait call that moved the vessel inside
  // the window must still be attributed, never assumed away.
  const origDoAction = Game.doAction;
  if (typeof origDoAction === 'function') {
    Game.doAction = function (action, ...rest) {
      const before = ctxSnap(ctxRef);
      const sb = saySeq;
      boundary('doAction-' + String(action) + '-pre', 'pre', null, null, sb, sb);
      let r;
      try { r = origDoAction.apply(this, [action, ...rest]); } catch (e) { throw e; }
      const after = ctxSnap(ctxRef);
      // Segment: a wait between sleep-post and upkeep-1-pre is still a
      // wait-block; the analyzer refines wait-block numbering from the
      // surrounding upkeep numbers, so 'wait-block' suffices here.
      boundary('doAction-' + String(action) + '-post', 'post', 'wait-block', ctxDelta(before, after), sb, saySeq);
      return r;
    };
  }

  const baseDaily = nomadseek.daily.bind(nomadseek);
  const baseUpkeep = nomadseek.upkeep.bind(nomadseek);
  const baseFight = (typeof nomadseek.fight === 'function') ? nomadseek.fight.bind(nomadseek) : null;
  const baseContest = (typeof nomadseek.contest === 'function') ? nomadseek.contest.bind(nomadseek) : null;

  const policy = Object.assign({}, nomadseek, {
    daily(Game2, ctx) {
      ctxRef = ctx;
      callIdx++;
      upkeepN = 0; // new loop-day's upkeeps already ran; reset for next
      phase = 'daily';
      const mPos = snapPos(Game2);
      const mPantry = pantryKcal(Game2);
      const before = ctxSnap(ctx);
      const sayBefore = saySeq;
      // Morning snap = the window's closing boundary. If a window is open
      // (previous evening recorded), close it now: any move already
      // attributed landed in curWindow.events via boundary() calls, but
      // the daily-pre position itself must be compared against lastSnap
      // (upkeep-3-post / wait-block) — boundary() does that comparison.
      // Set phase to 'window' FIRST so boundary() records a final
      // wait-block move if the morning position differs, then close.
      phase = 'window';
      const closedMorning = boundary('daily-pre', 'pre', null, null, sayBefore, sayBefore);
      if (curWindow) {
        curWindow.closingLoopDay = callIdx;
        curWindow.closingMorning = closedMorning;
        windows.push(curWindow);
        curWindow = null;
      }
      phase = 'daily';
      lastSnap = mPos; lastHook = 'daily-pre';
      baseDaily(Game2, ctx);
      const sayAfter = saySeq;
      const after = ctxSnap(ctx);
      const dayLines = sayLines.slice(sayBefore, sayAfter).map((x) => x.line);
      decisions.push({
        loopDay: callIdx,
        morning: mPos, pantry: mPantry,
        day: mPos.gameDay,
        ctxDelta: ctxDelta(before, after),
        saySeqAtMorning: sayBefore,
      });
      const ePos = snapPos(Game2);
      const row = { loopDay: callIdx, ...ePos, saySeqAtEvening: saySeq };
      if (Game2.over) { row.eveningOutcome = 'game-over'; }
      else { row.eveningOutcome = 'policy-no-record'; row.eveningMethod = null; row.travelledHome = false; }
      row.pantry = pantryKcal(Game2);
      row.inCombat = !!(Game2.inCombat && Game2.inCombat());
      row.gameOver = !!Game2.over;
      row.dayLines = dayLines;
      row.ctxDelta = ctxDelta(before, after);
      evenings.push(row);
      // Open the next window: evening snap is the opening boundary.
      phase = 'window';
      lastSnap = ePos; lastHook = 'daily-post'; lastPostSegment = 'daily';
      curWindow = { openingLoopDay: callIdx, openingEvening: ePos, events: [] };
    },
    upkeep(Game2, ctx) {
      ctxRef = ctx;
      upkeepN++;
      const n = upkeepN;
      const before = ctxSnap(ctx);
      const sb = saySeq;
      boundary('upkeep-' + n + '-pre', 'pre', null, null, sb, sb);
      baseUpkeep(Game2, ctx);
      const after = ctxSnap(ctx);
      boundary('upkeep-' + n + '-post', 'post', 'upkeep-' + n, ctxDelta(before, after), sb, saySeq);
    },
    fight(Game2, ctx) {
      if (!baseFight) return false;
      ctxRef = ctx;
      fightCalls++;
      const before = ctxSnap(ctx);
      const sb = saySeq;
      // Fight drives run inside wait-blocks and after sleep; attribute to
      // fight-drive when in window phase, else just snap for continuity.
      boundary('fight-pre', 'pre', null, null, sb, sb);
      const r = baseFight(Game2, ctx);
      const after = ctxSnap(ctx);
      boundary('fight-post', 'post', 'fight-drive', ctxDelta(before, after), sb, saySeq);
      return r;
    },
    contest(Game2, ctx) {
      if (!baseContest) return false;
      ctxRef = ctx;
      contestCalls++;
      const before = ctxSnap(ctx);
      const sb = saySeq;
      boundary('contest-pre', 'pre', null, null, sb, sb);
      const r = baseContest(Game2, ctx);
      const after = ctxSnap(ctx);
      boundary('contest-post', 'post', 'contest-drive', ctxDelta(before, after), sb, saySeq);
      return r;
    },
  });

  const errs = [];
  const spawn = { pos: snapPos(Game), pantry: pantryKcal(Game) };
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  return {
    seed, policy: 'nomadseek', days: DAYS,
    spawn, errs, errCount: errs.length,
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    maxWaveUnlocked: result.maxWaveUnlocked, waveKills: result.waveKills,
    deaths: (result.samples && result.samples.deaths) || [],
    fightCalls, contestCalls,
    decisions, evenings, windows, sayLines,
  };
}

async function main() {
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    process.stdout.write(JSON.stringify(inst) + '\n');
    console.error('p4sleep policy=nomadseek days=' + DAYS + ' seed=' + seed + ' end=' + inst.endReason + ' daysAlive=' + inst.daysAlive + ' decisions=' + inst.decisions.length + ' evenings=' + inst.evenings.length + ' windows=' + inst.windows.length + ' errs=' + inst.errCount + ' stdout');
  }
  console.error('wrote ' + SEEDS.length + ' p4sleep JSON lines to stdout');
}

if (require.main === module) {
  main().catch((e) => { console.error('P4SLEEP TRACE CRASH', e && (e.stack || e)); process.exit(2); });
}

module.exports = { oneInstance, snapPos, posKey };
