#!/usr/bin/env node
// dawnhall-trace-b.js — dawn-hall fight-origin tracer
// (sim-dawnhall-b; prereg:
// evidence/2026-10-28/sim-dawnhall-b-prereg.md, committed
// BEFORE any judged run).
//
// MEASUREMENT ONLY: zero src/js changes, zero policy changes.
// Day loop, substrate, grant fixture and tap code are copied
// from scripts/morningpersist-trace-b.js (the sim-morningpersist-b
// instrument, same substrate) PLUS fight-origin layers: tbfight
// fighters + pendingEncounter provenance at every fight-drive
// entry, fight-creation wrappers (startCombat / pending
// creators with caller stacks), and verb-transition records.
// so the judged band reproduces the 1930Z trajectories.
// Added layers are READ-ONLY tracing: position snapshots at
// evening / post-sleep / pre- and post-each-upkeep / morning,
// and wrappers around the position-moving verbs that record
// before/after position + phase + feasted/combat state + the
// say lines since the previous record. A wrapper calls the
// original verb exactly once and never writes game state;
// a record is kept only when the position changes (or the
// verb is exit/enter/travel, recorded regardless).
//
// The traced interval for a morning miss (morning loop-day M
// after an inside evening on loop-day M-1) is, from
// scripts/sim-harness.js runDays: Game.sleep() after the
// evening, then 3x [policy.upkeep, driveFights,
// driveContests, doAction('wait'), ...], then the daily
// wrapper's morning snapshot (pre-daily). Every record
// carries a global seq so the analyzer can order the
// interval exactly.
//
// Env (all substrate gates asserted FATAL):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY=insideevening (this driver is policy-leg only)
//   SEEDS="10710,...,10725" (confirm default)
//   DAYS=30 TAPDAYS=5
//   OUTDIR (default evidence/2026-10-28/sim-dawnhall-b-corpus)
// Write transport mirrors the insideevening driver: failed
// writes are kept in memory and flushed at the end (EPERM
// flap waited out, never forced); deadline exhaustion stages
// inside this worktree (.dawnhall-staging, never /tmp)
// and exits loudly.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { insideevening } = require('./policies/insideevening');

if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }
if (process.env.POLICY !== 'insideevening') { console.error('FATAL: POLICY must be insideevening (policy-leg tracer only)'); process.exit(2); }

const SEEDS = (process.env.SEEDS || '10710,10711,10712,10713,10714,10715,10716,10717,10718,10719,10720,10721,10722,10723,10724,10725')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '30', 10);
const TAPDAYS = parseInt(process.env.TAPDAYS || '5', 10);
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-28', 'sim-dawnhall-b-corpus');
const STAGING_DIR = path.join(__dirname, '..', '.dawnhall-staging');

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

function loadAbilityDefs() {
  const abs = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'abilities.json'), 'utf8'));
  const map = {};
  for (const a of abs) for (const act of (a.actions || [])) map[a.id + '.' + act.id] = { ability: a.id, action: act.id, actObj: act };
  return map;
}

// Fight-origin snapshot (read-only): the live fight's fighters +
// the pending-encounter slot + the door-fled stash + the feast
// draw + the scholar's world-monster mirror. Called from
// snapPos, so every checkpoint and verb record carries it.
function fightSnap(Game) {
  try {
    const f = Game.tbfight || null;
    const sch = (Game.state && Game.state.scholar) || {};
    const fighters = f ? (f.fighters || []).map((x) => ({
      key: x.key || null, kind: x.kind || null,
      monsterId: x.monsterId || null, name: x.name || null,
      hp: (x.hp === undefined ? null : Math.round(x.hp)),
      maxHp: (x.maxHp === undefined ? null : x.maxHp),
      mx: (x.mx === undefined ? null : x.mx),
      my: (x.my === undefined ? null : x.my),
      veteran: !!x.veteran, veteranVariant: x.veteranVariant || null,
      alive: x.alive !== false, fled: !!x.fled,
    })) : null;
    const door = Array.isArray(Game.state && Game.state.doorFledMonsters)
      ? Game.state.doorFledMonsters.map((w) => ({ id: (w && w.id) || null, hp: (w && w.hp === undefined ? null : w.hp), bearer: (w && w.bearer === undefined ? null : w.bearer) }))
      : null;
    return {
      fight: f ? { id: f.id || null, over: !!f.over, result: f.result || null, round: f.round || null, fighters } : null,
      pending: !!Game.pendingEncounter,
      pendingMonsterId: Game.pendingMonsterId || null,
      pendingInTent: !!Game.pendingInTent,
      doorFledMonsters: door,
      feastDraw: sch.feastDraw ? { monsterId: sch.feastDraw.monsterId || null, veteran: !!sch.feastDraw.veteran, day: sch.feastDraw.day || null } : null,
      worldMonster: sch.monster ? { id: sch.monster.id || null, hp: sch.monster.hp || null } : null,
    };
  } catch (e) { return { error: String(e && e.message).slice(0, 120) }; }
}
function stackTop() {
  try {
    return (new Error().stack || '').split('\n').slice(1).map((l) => l.trim())
      .filter((l) => /src\/js|dawnhall-trace|sim-harness|policies\//.test(l)).slice(0, 6);
  } catch (e) { return []; }
}
function snapPos(Game) {
  const sch = (Game.state || {}).scholar || {};
  let tile = null, access = null, stage = null;
  try { const t = Game.playerTile(); tile = t ? (t.type || null) : null; } catch (e) {}
  try { access = (typeof Game.havenStoresAccess === 'function') ? Game.havenStoresAccess() : null; } catch (e) {}
  try { stage = (typeof Game.integrationStage === 'function') ? Game.integrationStage() : null; } catch (e) {}
  let feasted = null, feastUsed = null;
  try { feasted = (typeof Game.feastedActive === 'function') ? !!Game.feastedActive() : null; } catch (e) {}
  try { feastUsed = (sch.feastBuff ? !!sch.feastBuff.used : null); } catch (e) {}
  return {
    inside: (sch.insideHaven === undefined ? null : !!sch.insideHaven),
    insideTent: (sch.insideTent === undefined ? null : !!sch.insideTent),
    exiled: (sch.exiled === undefined ? null : !!sch.exiled),
    mx: (sch.mx === undefined ? null : sch.mx), my: (sch.my === undefined ? null : sch.my),
    tile, access, stage,
    mapPx: (Game.map ? Game.map.px : null), mapPy: (Game.map ? Game.map.py : null),
    kcal: Math.round(sch.kcal || 0), gameDay: sch.day || 0,
    vid: (Game.villagerId === undefined ? null : Game.villagerId),
    feasted, feastUsed,
    inCombat: !!(Game.inCombat && Game.inCombat()),
    pendingEncounter: !!Game.pendingEncounter,
    pendingMonsterId: Game.pendingMonsterId || null,
    gameOver: !!Game.over,
    fight: fightSnap(Game),
  };
}
function posKey(p) {
  return [p.inside, p.insideTent, p.mx, p.my, p.tile, p.mapPx, p.mapPy, p.vid].join('|');
}

async function oneInstance(seed, defs) {
  const key = 'thief.steal_pantry';
  const def = defs[key];
  const { Game } = await loadGame({ seed, mode: 'dawnhall-b', fullTelemetry: false });
  const sayLines = [];
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { if (sayLines.length < 40000) sayLines.push({ day: (Game.state.scholar || {}).day || 0, line: String(args[0] || '').slice(0, 400) }); } catch (e) {}
        return origSay.apply(this, args);
      };
    }
  }
  await setupGame(Game);
  const s = Game.state.scholar;
  let grantMethod = null;
  try {
    const abs = (s.abilities || []);
    if (!abs.some((a) => (a.id || a) === 'thief')) abs.push({ id: 'thief', level: 1 });
    s.abilities = abs;
    if (Game.hasAbility('thief')) grantMethod = 'abilities-push';
  } catch (e) { grantMethod = 'grant-error:' + String(e && e.message); }
  const grantOk = grantMethod === 'abilities-push';

  // ---- tracing state (per instance) ----
  let seq = 0;
  let phase = 'harness';
  let lastSayIdx = 0;
  const checkpoints = []; // {seq, loopDay, checkpoint, pos}
  const moves = []; // {seq, loopDay, phase, verb, args, before, after, ret, sayTail}
  function sayTail() {
    const t = sayLines.slice(lastSayIdx).map((x) => x.line);
    lastSayIdx = sayLines.length;
    return t.slice(-12);
  }
  function checkpoint(loopDay, name) {
    const pos = snapPos(Game);
    checkpoints.push({ seq: ++seq, loopDay, checkpoint: name, pos, sayTail: sayTail() });
    return pos;
  }
  function loopDayNow(callIdx) { return callIdx + 1; }
  let callIdx = 0; // daily calls completed; upkeep loop-day = callIdx+1
  let upkeepIdx = 0; // 1..3 within the current loop-day

  // Fight-origin log: one record at every fight-drive entry, every
  // fight/pending creation, and every verb that changes the live
  // fight or the pending slot. Read-only: records snapshots and
  // say windows only, never writes game state.
  const fightOrigins = [];
  function recordOrigin(slot, trigger, extra) {
    try {
      fightOrigins.push(Object.assign({
        seq: ++seq, loopDay: callIdx + 1, phase, slot, trigger,
        fight: fightSnap(Game),
        sayTail: sayLines.slice(Math.max(0, sayLines.length - 12)).map((x) => x.line),
      }, extra || {}));
    } catch (e) {}
  }

  // Verb wrappers: installed BEFORE runDays, which wraps them again
  // for pacing (our wrappers do not set _verbWrapped, so the pacing
  // wrap stays the outer layer and still counts). Each wrapper
  // calls the original exactly once.
  const VERBS = ['travelTo', 'beginPathWalk', 'pathStep', 'microMove',
    'exitBuilding', 'enterBuilding', 'doAction', 'useAbility',
    'activateAbility', 'faceFeastDraw', 'tbPlayerMove',
    'tbBarrierExit', 'tbEnd', 'standGround', 'answerDefenseCall',
    'tickAction', 'contestChoose'];
  const ALWAYS = new Set(['exitBuilding', 'enterBuilding', 'travelTo']);
  for (const v of VERBS) {
    try {
      const orig = Game[v];
      if (typeof orig !== 'function') continue;
      Game[v] = function (...args) {
        const before = snapPos(Game);
        const sayBeforeIdx = sayLines.length;
        let ret = null, err = null;
        try { ret = orig.apply(this, args); } catch (e) { err = String(e && e.message).slice(0, 160); }
        const after = snapPos(Game);
        // Verb-transition: a verb that creates, resolves, or ends
        // a fight / pending slot is a fight-origin record even
        // when the position does not move (the wait that makes a
        // dawn fight live moves nothing by itself).
        try {
          if (JSON.stringify(before.fight) !== JSON.stringify(after.fight)) {
            fightOrigins.push({
              seq: ++seq, loopDay: callIdx + 1, phase, slot: 'verb-transition', trigger: v,
              beforeFight: before.fight, fight: after.fight,
              sayTail: sayLines.slice(sayBeforeIdx).map((x) => x.line).slice(-12),
            });
          }
        } catch (e) {}
        if (ALWAYS.has(v) || posKey(before) !== posKey(after)) {
          moves.push({
            seq: ++seq, loopDay: callIdx + 1, phase, verb: v,
            args: args.map((a) => (a === null || a === undefined) ? a : (typeof a === 'object' ? '[obj]' : String(a).slice(0, 80))),
            before, after,
            ret: (ret === undefined ? null : (typeof ret === 'object' ? '[obj]' : String(ret).slice(0, 80))),
            err, sayTail: sayLines.slice(sayBeforeIdx).map((x) => x.line).slice(-12),
          });
          lastSayIdx = sayLines.length;
        }
        if (err) throw new Error(err);
        return ret;
      };
    } catch (e) {}
  }
  // Fight/pending creator wrappers: each calls the original
  // exactly once. startCombat / triggerEncounter /
  // wandererTentBreach / drawFeastScavenger are recorded always
  // (rare); havenRaidTick / reengageWaitingMonsters /
  // enterBuilding only when they change the fight or pending
  // slot (they also run on quiet days). The caller stack is
  // captured BEFORE the call, so a startCombat fired from
  // inside a tick, a wait, a raid, or the harness pending
  // fallback names its real caller.
  const CREATORS_ALWAYS = ['startCombat', 'triggerEncounter', 'wandererTentBreach', 'drawFeastScavenger'];
  const CREATORS_ON_CHANGE = ['havenRaidTick', 'reengageWaitingMonsters', 'enterBuilding'];
  for (const v of CREATORS_ALWAYS.concat(CREATORS_ON_CHANGE)) {
    try {
      const orig = Game[v];
      if (typeof orig !== 'function') continue;
      // enterBuilding already has a verb wrapper; this creator
      // wrapper sits outside it (outer layer) and records the
      // fight change the inner verb wrapper also logs as a move.
      const always = CREATORS_ALWAYS.indexOf(v) >= 0;
      Game[v] = function (...args) {
        const before = fightSnap(Game);
        const stack = stackTop();
        const sayBeforeIdx = sayLines.length;
        let ret = null, err = null;
        try { ret = orig.apply(this, args); } catch (e) { err = String(e && e.message).slice(0, 160); }
        const after = fightSnap(Game);
        if (always || JSON.stringify(before) !== JSON.stringify(after)) {
          fightOrigins.push({
            seq: ++seq, loopDay: callIdx + 1, phase, slot: 'creator', trigger: v,
            args: args.map((a) => (a === null || a === undefined) ? a : (typeof a === 'object' ? '[obj]' : String(a).slice(0, 80))),
            beforeFight: before, fight: after, stack,
            ret: (ret === undefined ? null : (typeof ret === 'object' ? '[obj]' : String(ret).slice(0, 80))),
            err, sayTail: sayLines.slice(sayBeforeIdx).map((x) => x.line).slice(-12),
          });
        }
        if (err) throw new Error(err);
        return ret;
      };
    } catch (e) {}
  }
  // Sleep wrapper (not pacing-wrapped by the harness).
  try {
    const origSleep = Game.sleep;
    if (typeof origSleep === 'function') {
      Game.sleep = function (...args) {
        const prevPhase = phase; phase = 'sleep';
        let ret = null;
        try { ret = origSleep.apply(this, args); } finally { phase = prevPhase; }
        checkpoint(callIdx, 'post-sleep');
        recordOrigin('post-sleep', 'sleep-return');
        return ret;
      };
    }
  } catch (e) {}

  const evenings = [], mornings = [], taps = [];
  const policy = Object.assign({}, insideevening, {
    upkeep(Game2, ctx) {
      upkeepIdx = (upkeepIdx % 3) + 1;
      const ld = callIdx + 1;
      const prevPhase = phase; phase = 'upkeep-' + upkeepIdx;
      try {
        checkpoint(ld, 'pre-upkeep-' + upkeepIdx);
        insideevening.upkeep(Game2, ctx);
        checkpoint(ld, 'post-upkeep-' + upkeepIdx);
      } finally { phase = prevPhase; }
    },
    fight(Game2, ctx) {
      const prevPhase = phase; phase = 'fight';
      recordOrigin('fight-drive', 'policy.fight-entry');
      try { return insideevening.fight(Game2, ctx); } finally { phase = prevPhase; }
    },
    // Contest-drive entry: competent defines no contest hook, so
    // returning false lets the harness's default contestChoose
    // path run unchanged; the record is the point, not handling.
    contest(Game2, ctx) {
      const prevPhase = phase; phase = 'contest-drive';
      recordOrigin('contest-drive', 'policy.contest-entry');
      phase = prevPhase;
      return false;
    },
    // Pending-drive entry: returning undefined lets the harness
    // pending fallback (pending -> startCombat) run unchanged.
    pending(Game2, ctx) {
      const prevPhase = phase; phase = 'pending-drive';
      recordOrigin('pending-drive', 'policy.pending-entry');
      phase = prevPhase;
      return undefined;
    },
    daily(Game2, ctx) {
      callIdx++;
      upkeepIdx = 0;
      // MORNING position: post-sleep, post-3-upkeeps, pre-daily.
      if (callIdx > 1) {
        const m = snapPos(Game2);
        mornings.push({ loopDay: callIdx, seq: seq, ...m });
        checkpoints.push({ seq: ++seq, loopDay: callIdx, checkpoint: 'morning', pos: m, sayTail: sayTail() });
      }
      const prevPhase = phase; phase = 'daily';
      const sayBefore = sayLines.length;
      try { insideevening.daily(Game2, ctx); } finally { phase = prevPhase; }
      const sayAfter = sayLines.length;
      const eveningSayTail = sayLines.slice(Math.max(sayBefore, sayAfter - 30), sayAfter).map((x) => x.line);
      const pos = snapPos(Game2);
      const row = { loopDay: callIdx, tapDay: callIdx > DAYS - TAPDAYS, seq: seq, ...pos, eveningSayTail };
      if (Game2.over) {
        row.eveningOutcome = 'game-over';
      } else {
        const ie = ctx._ieLast || {};
        row.eveningOutcome = ie.outcome || 'policy-no-record';
        row.eveningMethod = ie.method || null;
        row.policyBefore = ie.before || null;
        row.policyWalkTarget = ie.walkTarget || null;
        row.policyEntryCellActions = ie.entryCellActions || null;
        row.policyEntryAdjacency = (ie.entryAdjacency === undefined ? null : ie.entryAdjacency);
        row.policyAfter = ie.after || null;
        row.positionAgreesWithPolicy = (row.eveningOutcome === 'completed' || row.eveningOutcome === 'already-inside')
          ? (pos.inside === true && pos.tile === 'haven') : null;
      }
      row.inCombat = !!(Game2.inCombat && Game2.inCombat());
      row.gameOver = !!Game2.over;
      evenings.push(row);
      checkpoints.push({ seq: ++seq, loopDay: callIdx, checkpoint: 'evening', pos, sayTail: [] });
      // TAP DAYS: identical genuine thief tap to the 1930Z driver.
      if (row.tapDay && !Game2.over) {
        const tap = { loopDay: callIdx, gameDayBefore: (Game2.state.scholar || {}).day || 0 };
        const atTap = snapPos(Game2);
        tap.accessAtTap = atTap.access; tap.insideAtTap = atTap.inside; tap.tileAtTap = atTap.tile;
        tap.exiledAtTap = atTap.exiled; tap.stageAtTap = atTap.stage;
        tap.mxAtTap = atTap.mx; tap.myAtTap = atTap.my;
        tap.kcalAtTap = atTap.kcal;
        tap.eveningOutcome = row.eveningOutcome;
        let ownsThief = null;
        try { ownsThief = !!(Game2.hasAbility ? Game2.hasAbility('thief') : false); } catch (e) {}
        tap.ownsThiefBefore = ownsThief;
        let avail = null, availErr = null;
        try { avail = Game2._actionAvailable('thief', def.actObj); } catch (e) { availErr = String(e && e.message); }
        tap.buttonOk = !!(avail && avail.ok); tap.buttonWhy = avail ? (avail.why || null) : null; tap.buttonErr = availErr;
        if (!tap.buttonOk) {
          tap.outcome = 'button-refused';
        } else {
          const sayB = sayLines.length;
          let tapRes = null, tapErr = null;
          try { tapRes = Game2.activateAbility(key); } catch (e) { tapErr = String(e && (e.stack || e.message)); }
          const sayA = sayLines.length;
          tap.tapResult = (tapRes === undefined ? null : tapRes); tap.tapError = tapErr;
          tap.sayWindow = sayLines.slice(sayB, sayA).map((x) => x.line);
          const win = tap.sayWindow;
          const has = (re) => win.some((l) => re.test(l));
          if (tapRes === true && has(/A hand closes on your wrist/)) tap.tapOutcomeClass = 'success-caught';
          else if (tapRes === true && has(/The food disappears\. Magic/)) tap.tapOutcomeClass = 'success-clean';
          else if (tapRes === false && has(/The pantry is in the hall\. Your hands are not\./)) tap.tapOutcomeClass = 'impl-refused-hall';
          else if (tapRes === false && has(/Nothing worth lifting/)) tap.tapOutcomeClass = 'impl-refused-empty';
          else if (tapRes === false && has(/Too heavy for even a light lift/)) tap.tapOutcomeClass = 'impl-refused-heavy';
          else if (tapRes === false) tap.tapOutcomeClass = 'other-refusal';
          else tap.tapOutcomeClass = 'other-success';
          tap.outcome = 'attempted';
          try {
            const pan = (Game2.state.village || {}).pantry || [];
            tap.pantryKcalAfterTap = Math.round(pan.reduce((t, it) => t + (it.kcalEach || 0) * (it.units || 1), 0));
          } catch (e) {}
          const after = snapPos(Game2);
          tap.accessAfter = after.access; tap.insideAfter = after.inside; tap.tileAfter = after.tile;
          tap.kcalAfter = after.kcal;
        }
        taps.push(tap);
      }
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  let scaleLast = null, standingLast = null;
  try {
    const sc = (result.samples && result.samples.scale) || [];
    if (sc.length) scaleLast = sc[sc.length - 1][1];
    const st = (result.samples && result.samples.standing) || [];
    if (st.length) standingLast = st[st.length - 1][1];
  } catch (e) {}
  return {
    seed, policy: 'insideevening', key, grantOk, grantMethod,
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    maxWaveUnlocked: result.maxWaveUnlocked, waveKills: result.waveKills,
    deaths: (result.samples && result.samples.deaths) || [],
    scaleLast, standingLast,
    evenings, mornings, taps, checkpoints, moves, fightOrigins,
  };
}

(async () => {
  const defs = loadAbilityDefs();
  const pending = [];
  let done = 0;
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed, defs);
    done++;
    const ins = inst.evenings.filter((e) => e.inside === true && e.tile === 'haven').length;
    const att = inst.taps.filter((t) => t.outcome === 'attempted').length;
    const name = `dawnhall-b-insideevening-s${seed}.json`;
    const summary = `dawnhall policy=insideevening seed=${seed} grant=${inst.grantOk} end=${inst.endReason} days=${inst.daysAlive} evenings=${inst.evenings.length} inside=${ins} taps=${inst.taps.length} attempted=${att} checkpoints=${inst.checkpoints.length} moves=${inst.moves.length} origins=${inst.fightOrigins.length}`;
    const data = JSON.stringify(inst);
    if (tryWrite(path.join(OUTDIR, name), data, 6)) console.log(summary + ' written');
    else { pending.push({ name, data }); console.error(summary + ' WRITE PENDING (EPERM flap) — kept in memory'); }
  }
  if (pending.length) {
    const deadline = Date.now() + 45 * 60 * 1000;
    while (pending.length && Date.now() < deadline) {
      for (let i = pending.length - 1; i >= 0; i--) {
        if (tryWrite(path.join(OUTDIR, pending[i].name), pending[i].data, 5)) {
          console.log('flushed pending ' + pending[i].name);
          pending.splice(i, 1);
        }
      }
      if (pending.length && Date.now() < deadline) realSleepMs(30000);
    }
  }
  if (pending.length) {
    for (const p of pending) {
      if (tryWrite(path.join(STAGING_DIR, p.name), p.data, 30)) console.error('STAGED (not evidence) ' + p.name);
      else console.error('STAGE FAIL LOUDLY ' + p.name);
    }
    console.error('PENDING STAGED: ' + pending.length + ' files in ' + STAGING_DIR + ' — copy to ' + OUTDIR + ' before judging');
    process.exit(3);
  }
  console.log('wrote ' + done + ' dawnhall files to ' + OUTDIR);
})().catch((e) => { console.error('DAWNHALL CRASH', e && (e.stack || e)); process.exit(2); });
