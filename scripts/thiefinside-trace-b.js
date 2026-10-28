#!/usr/bin/env node
// thiefinside-trace-b.js — go-inside-then-tap evening instrument
// (sim-thiefinside-b; prereg:
// evidence/2026-10-28/sim-thiefinside-b-prereg.md, committed
// as f96d37d BEFORE any judged run).
// COPY of scripts/thiefhall-trace-b.js (never modified in place),
// extended ONLY with a per-tap-day "go inside, then tap" evening:
// after competent.daily, on haven-tile tap days the driver walks
// to the lodge via beginPathWalk/pathStep (the browser "Walk
// here" verbs), reads Game.cellActions at an adjacent lodge cell
// (must contain 'Go inside'), and dispatches that label exactly
// as app.js doContextAction does (Game.enterBuilding(); refresh
// is DOM-only and skipped) — labelled BUTTON-HANDLER-EQUIVALENT
// in every record, never "played entry". The thief tap itself is
// a genuine played tap (button read ok -> activateAbility, no
// target), as in thiefhall. DIAGNOSIS ONLY: zero src/js changes.
// Same competent-nofeast substrate, same 2 lead + 5 tap days.
// No clock-setting, no waits, no kcal/health top-ups, no travelTo,
// no direct position writes, no steering competent.daily.
//
// MEASUREMENT ONLY: zero src/js changes. Each instance is a FRESH
// game (loadGame + setupGame via scripts/sim-harness.js), played
// with the competent policy for 2 lead days + 5 tap days. On each
// tap day, AFTER competent.daily (real game actions), the driver
// performs the tap sequence as the day's last player act: social
// keys open a conversation via Game.talkTo and keep it open;
// the button is read via Game._actionAvailable (the bar's read,
// null target); if and only if the button reads ok, the tap is
// issued through Game.activateAbility('ability.action') with NO
// target — the exact dispatcher a UI bar tap reaches. The driver
// NEVER sets dayTicks/dayPart, NEVER calls tickAction, NEVER
// tops up kcal/health: the tap's position is whatever the day's
// work left, recorded, never chosen.
//
// Captures install in CENSUS ORDER (stockdoors, then spoilvol,
// then mealdraw, then the nest logger OUTERMOST), verbatim logic
// from scripts/probe-spandraw-design-b.js. Every tap records its
// nest evt window so the analyzer judges ONLY tap-window spans;
// policy spans (e.g. cultivate inside competent.daily) fall
// outside every window and are excluded.
//
// Env (all substrate gates asserted FATAL):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   SEEDS="10040,...,10047" (default judged pilot band)
//   KEYS="ability.action,..." (default: all 15 prereg keys)
//   OUTDIR (default evidence/2026-10-28/sim-thiefinside-b-corpus)
//   LEAD=2 TAPDAYS=5
// Output per instance: thiefinside-b-s<seed>-thief.steal_pantry.json
// Write transport mirrors the census/design sweeps: failed writes
// are kept in memory and flushed at the end (EPERM flap waited
// out, never forced); deadline exhaustion stages inside this
// worktree (.thiefinside-staging, never /tmp) and exits loudly.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { installStockdoorsCapture } = require('./stockdoors-capture-raidcallers');
const { installMealDrawCapture } = require('./mealdraw-capture');
const { installSpoilvolCapture } = require('./spoilvol-capture');

if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }

const SEEDS = (process.env.SEEDS || '10040,10041,10042,10043,10044,10045,10046,10047')
  .split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const LEAD = parseInt(process.env.LEAD || '2', 10);
const TAPDAYS = parseInt(process.env.TAPDAYS || '5', 10);
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-28', 'sim-thiefinside-b-corpus');
const STAGING_DIR = path.join(__dirname, '..', '.thiefinside-staging');

const PREREG_KEYS = ['thief.steal_pantry'];
const SOCIAL_KEYS = new Set(['fear_aura.menace', 'intimidating_presence.end_it_before', 'war_cry.challenge']);

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
  for (const a of abs) for (const act of (a.actions || [])) map[a.id + '.' + act.id] = { ability: a.id, action: act.id, context: act.context || 'explore', cost: act.cost || {}, actObj: act };
  return map;
}

async function oneInstance(seed, key, defs) {
  const [aid, actId] = key.split('.');
  const def = defs[key];
  if (!def) throw new Error('unknown key ' + key);
  const { Game } = await loadGame({ seed, mode: 'thiefinside-b', fullTelemetry: false });
  const stockdoors = installStockdoorsCapture(Game);
  const spoilvol = installSpoilvolCapture(Game);
  const mealdraw = installMealDrawCapture(Game, { mealdrawCap: 50000 });
  // Nest logger, verbatim pattern, OUTERMOST (installed last).
  const nestEvents = [];
  let nestEvt = 0, nestDepth = 0;
  function nestDay() { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
  function nestFrames() {
    try {
      const lines = String(new Error().stack || '').split('\n').slice(1);
      const out = [];
      for (const ln of lines) {
        if (/nestFrames|wrappedPlaypathUse|wrappedPlaypathDraw/.test(ln)) continue;
        const m = ln.match(/at\s+(?:async\s+)?([^\s(]+)/);
        out.push(m ? m[1] : ln.trim().slice(0, 80));
        if (out.length >= 8) break;
      }
      return out;
    } catch (e) { return []; }
  }
  {
    const origUse = Game.useAbility;
    if (typeof origUse === 'function' && !origUse.__playpathInstalled) {
      const wrappedPlaypathUse = function (...args) {
        const depth = nestDepth++;
        const directBefore = (() => { try { return stockdoors.directRecords.length; } catch (e) { return -1; } })();
        nestEvents.push({ evt: ++nestEvt, kind: 'spanEnter', ability: String(args[0]), action: String(args[1]), day: nestDay(), depth, directBefore });
        let ret;
        try { ret = origUse.apply(this, args); } finally {
          const directAfter = (() => { try { return stockdoors.directRecords.length; } catch (e) { return -1; } })();
          nestEvents.push({ evt: ++nestEvt, kind: 'spanExit', ability: String(args[0]), action: String(args[1]), day: nestDay(), depth, directBefore, directAfter, result: ret });
          nestDepth--;
        }
        return ret;
      };
      wrappedPlaypathUse.__playpathInstalled = true;
      Game.useAbility = wrappedPlaypathUse;
    }
    const origDraw = Game.pantryDraw;
    if (typeof origDraw === 'function' && !origDraw.__playpathInstalled) {
      const wrappedPlaypathDraw = function (...args) {
        const frames = nestFrames();
        const want = args[1];
        nestEvents.push({ evt: ++nestEvt, kind: 'drawEnter', day: nestDay(), want: (want == null ? null : Math.round(want)), frames });
        const ret = origDraw.apply(this, args);
        try {
          const items = [];
          for (const d of (ret.items || [])) {
            const it = d.item || {};
            items.push({ name: (it.name == null ? null : String(it.name)), kcalEach: (it.kcalEach || 0), units: (d.units || 0), spoilDay: (it.spoilDay == null ? null : it.spoilDay) });
          }
          nestEvents.push({ evt: ++nestEvt, kind: 'drawExit', day: nestDay(), want: (want == null ? null : Math.round(want)), taken: Math.round(ret.taken || 0), items });
        } catch (e) {}
        return ret;
      };
      wrappedPlaypathDraw.__playpathInstalled = true;
      Game.pantryDraw = wrappedPlaypathDraw;
    }
  }
  // Say-line capture (read-only, capped): loadGame silenced say to a
  // no-op; wrapping it records the game's own lines, then no-ops.
  const sayLines = [];
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { if (sayLines.length < 20000) sayLines.push({ day: nestDay(), line: String(args[0] || '').slice(0, 400) }); } catch (e) {}
        return origSay.apply(this, args);
      };
    }
  }
  await setupGame(Game);
  const s = Game.state.scholar;
  // Grant fixture (setup, disclosed in prereg).
  let grantMethod = null;
  try {
    const abs = (s.abilities || []);
    if (!abs.some((a) => (a.id || a) === aid)) abs.push({ id: aid, level: 1 });
    s.abilities = abs;
    if (Game.hasAbility(aid)) grantMethod = 'abilities-push';
  } catch (e) { grantMethod = 'grant-error:' + String(e && e.message); }
  const grantOk = grantMethod === 'abilities-push';
  let openingKcal = null;
  try { openingKcal = spoilvol.snapshotPantry().freshKcal; } catch (e) {}

  const taps = [];
  let tapDayCount = 0;
  const policy = Object.assign({}, competent, {
    daily(Game2, ctx) {
      competent.daily(Game2, ctx);
      tapDayCount++;
      if (tapDayCount <= LEAD) return;
      if (Game2.over) { taps.push({ tapDay: tapDayCount, outcome: 'game-over', eveningOutcome: 'game-over', note: 'run ended before tap' }); return; }
      const s2 = Game2.state.scholar;
      const rec = { tapDay: tapDayCount, gameDayBefore: s2.day, dayTicksBefore: s2.dayTicks, dayPartBefore: Game2.dayPart,
        kcalBefore: Math.round(s2.kcal || 0), healthBefore: Math.round(s2.health || 0),
        atHavenBefore: !!(Game2.playerAtHaven && Game2.playerAtHaven()),
        inCombatBefore: !!(Game2.inCombat && Game2.inCombat()),
        killsBefore: Object.keys(Game2.state.villageSlain || {}).filter((k) => (Game2.state.villageSlain[k] || 0) > 0).length };
      // THIEFHALL TRACE (read-only snapshot, before the tap): the full
      // havenStoresAccess() gate state, each component separately, so
      // 'none' is never confused across its causes (exile vs position
      // vs stage) and playerAtHaven is never merged into the gate.
      try {
        const sch = Game2.state.scholar || {};
        const vil = Game2.state.village || {};
        let tileType = null, tileErr = null;
        try { const t = Game2.playerTile(); tileType = t ? (t.type || null) : null; } catch (e) { tileErr = String(e && e.message).slice(0, 80); }
        let accessBefore = null, accessErr = null;
        try { accessBefore = (typeof Game2.havenStoresAccess === 'function') ? Game2.havenStoresAccess() : null; } catch (e) { accessErr = String(e && e.message).slice(0, 80); }
        let stageBefore = null;
        try { stageBefore = (typeof Game2.integrationStage === 'function') ? Game2.integrationStage() : null; } catch (e) {}
        let pantryStacks = null, pantryKcal = null;
        try {
          const pan = vil.pantry || [];
          pantryStacks = pan.length;
          pantryKcal = Math.round(pan.reduce((t, it) => t + (it.kcalEach || 0) * (it.units || 1), 0));
        } catch (e) {}
        let ownsThief = null;
        try { ownsThief = !!(Game2.hasAbility ? Game2.hasAbility('thief') : (sch.abilities || []).some((a) => (a.id || a) === 'thief')); } catch (e) {}
        Object.assign(rec, {
          accessBefore, accessErr,
          insideHavenBefore: (sch.insideHaven === undefined ? null : !!sch.insideHaven),
          insideTentBefore: (sch.insideTent === undefined ? null : !!sch.insideTent),
          exiledBefore: (sch.exiled === undefined ? null : !!sch.exiled),
          integrationStageBefore: stageBefore,
          systemArrivedBefore: (Game2.state.systemArrived === undefined ? null : !!Game2.state.systemArrived),
          mapPxBefore: (Game2.map ? Game2.map.px : null), mapPyBefore: (Game2.map ? Game2.map.py : null),
          villagePx: (vil.px === undefined ? null : vil.px), villagePy: (vil.py === undefined ? null : vil.py),
          mxBefore: (sch.mx === undefined ? null : sch.mx), myBefore: (sch.my === undefined ? null : sch.my),
          tileTypeBefore: tileType, tileErr,
          pantryStacksBefore: pantryStacks, pantryKcalBefore: pantryKcal,
          ownsThiefBefore: ownsThief,
        });
      } catch (e) { rec.accessTraceErr = String(e && e.message).slice(0, 120); }
      // THIEFINSIDE EVENING (prereg steps 2-8). Every branch records
      // eveningOutcome; only 'completed' evenings reach the thief tap.
      // Entry is BUTTON-HANDLER-EQUIVALENT (see header): adjacency
      // (Chebyshev <= 1, the app.js tile-card gate) + Game.cellActions
      // containing 'Go inside' are BOTH required before the app.js
      // doContextAction mapping ('Go inside' -> Game.enterBuilding())
      // is invoked. A bare enterBuilding() with no such checks never
      // happens in this driver.
      rec.eveningOutcome = null; rec.entryMethod = null;
      const snapPos = () => {
        let access = null, stage = null, tile = null;
        try { access = (typeof Game2.havenStoresAccess === 'function') ? Game2.havenStoresAccess() : null; } catch (e) {}
        try { stage = (typeof Game2.integrationStage === 'function') ? Game2.integrationStage() : null; } catch (e) {}
        try { const t = Game2.playerTile(); tile = t ? (t.type || null) : null; } catch (e) {}
        const sch = Game2.state.scholar || {};
        return { access, stage, tile,
          inside: (sch.insideHaven === undefined ? null : !!sch.insideHaven),
          exiled: (sch.exiled === undefined ? null : !!sch.exiled),
          mx: (sch.mx === undefined ? null : sch.mx), my: (sch.my === undefined ? null : sch.my) };
      };
      if (rec.inCombatBefore) {
        rec.eveningOutcome = 'not-attempted-in-combat'; rec.outcome = 'skipped'; rec.skipReason = 'in-combat'; taps.push(rec); return;
      }
      if (rec.insideHavenBefore === true && rec.tileTypeBefore === 'haven') {
        rec.eveningOutcome = 'completed'; rec.entryMethod = 'already-inside';
      } else if (rec.insideTentBefore === true) {
        rec.eveningOutcome = 'blocked-tent'; rec.outcome = 'evening-blocked-tent'; taps.push(rec); return;
      } else if (rec.tileTypeBefore !== 'haven') {
        rec.eveningOutcome = 'not-attempted-away'; rec.outcome = 'evening-away'; taps.push(rec); return;
      } else {
        // Walk to a lodge-adjacent cell via the browser "Walk here"
        // verbs (beginPathWalk + pathStep per square).
        const schE = Game2.state.scholar || {};
        const startMx = schE.mx ?? 4, startMy = schE.my ?? 4;
        const lodgeCells = [];
        for (let y = 3; y <= 4; y++) for (let x = 3; x <= 5; x++) lodgeCells.push([x, y]);
        const isLodge = (x, y) => lodgeCells.some(([qx, qy]) => qx === x && qy === y);
        const adjMap = new Map();
        for (const [lx, ly] of lodgeCells) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const ax = lx + dx, ay = ly + dy;
          if (ax < 0 || ax > 8 || ay < 0 || ay > 8 || isLodge(ax, ay)) continue;
          const k = ax + ',' + ay;
          if (!adjMap.has(k)) adjMap.set(k, { ax, ay, lx, ly });
        }
        const adjacentToLodge = (x, y) => lodgeCells.find(([lx, ly]) => Math.max(Math.abs(lx - x), Math.abs(ly - y)) <= 1) || null;
        const cands = [];
        for (const c of adjMap.values()) {
          let p = null;
          try { p = Game2.findPath(startMx, startMy, c.ax, c.ay); } catch (e) {}
          if (p) cands.push({ ...c, pathLen: p.length });
        }
        cands.sort((a, b) => ((a.ax === 4 && a.ay === 5) ? 0 : 1) - ((b.ax === 4 && b.ay === 5) ? 0 : 1) || a.pathLen - b.pathLen);
        rec.walkCandidates = cands.map((c) => ({ ax: c.ax, ay: c.ay, pathLen: c.pathLen }));
        rec.walkSayBefore = sayLines.length;
        rec.walkKcalBefore = Math.round((Game2.state.scholar || {}).kcal || 0);
        rec.walkTicksBefore = (Game2.state.scholar || {}).dayTicks;
        let walked = null, walkInterruptedCombat = false;
        for (const c of cands) {
          const cur = Game2.state.scholar || {};
          if ((cur.mx ?? 4) === c.ax && (cur.my ?? 4) === c.ay) { walked = { ...c, steps: 0, alreadyThere: true }; break; }
          let pth = null;
          try { pth = Game2.beginPathWalk(c.ax, c.ay); } catch (e) { pth = null; }
          if (!pth) continue;
          let steps = 0, blocked = false;
          for (const [sx, sy] of pth) {
            let stepped = false;
            try { stepped = Game2.pathStep(sx, sy); } catch (e) { stepped = false; }
            if (!stepped) { blocked = true; break; }
            steps++;
            if (Game2.inCombat && Game2.inCombat()) { walkInterruptedCombat = true; break; }
          }
          if (walkInterruptedCombat) { walked = { ...c, steps, interruptedCombat: true }; break; }
          const cur2 = Game2.state.scholar || {};
          if (adjacentToLodge(cur2.mx ?? 4, cur2.my ?? 4)) { walked = { ...c, steps, partial: blocked }; break; }
          if (blocked) rec.walkBlockedDetail = 'step false at candidate ' + c.ax + ',' + c.ay + ' after ' + steps + ' steps';
        }
        rec.walkSayAfter = sayLines.length;
        rec.walkKcalAfter = Math.round((Game2.state.scholar || {}).kcal || 0);
        rec.walkTicksAfter = (Game2.state.scholar || {}).dayTicks;
        rec.walkSayWindow = sayLines.slice(rec.walkSayBefore, rec.walkSayAfter).map((x) => x.line);
        if (walkInterruptedCombat) {
          rec.eveningOutcome = 'walk-interrupted-combat'; rec.outcome = 'evening-walk-interrupted-combat'; taps.push(rec); return;
        }
        if (!walked) {
          rec.eveningOutcome = 'walk-no-path'; rec.outcome = 'evening-walk-no-path'; taps.push(rec); return;
        }
        rec.walkTarget = { ax: walked.ax, ay: walked.ay, steps: walked.steps, partial: !!walked.partial, alreadyThere: !!walked.alreadyThere };
        const cur3 = Game2.state.scholar || {};
        const pmx = cur3.mx ?? 4, pmy = cur3.my ?? 4;
        const lodgeCell = adjacentToLodge(pmx, pmy) || [walked.lx, walked.ly];
        // Prefer the lodge cell the walk aimed at when it is adjacent.
        let lodgePick = lodgeCell;
        if (Math.max(Math.abs(walked.lx - pmx), Math.abs(walked.ly - pmy)) <= 1) lodgePick = [walked.lx, walked.ly];
        else if (Math.max(Math.abs(4 - pmx), Math.abs(4 - pmy)) <= 1 && isLodge(4, 4)) lodgePick = [4, 4];
        rec.entryLodgeCell = { x: lodgePick[0], y: lodgePick[1] };
        rec.entryAdjacency = Math.max(Math.abs(lodgePick[0] - pmx), Math.abs(lodgePick[1] - pmy));
        let cellList = null, cellErr = null;
        try { cellList = Game2.cellActions(lodgePick[0], lodgePick[1]); } catch (e) { cellErr = String(e && e.message).slice(0, 120); }
        rec.entryCellActions = cellList; rec.entryCellErr = cellErr;
        if (!Array.isArray(cellList) || cellList.indexOf('Go inside') < 0 || rec.entryAdjacency > 1) {
          rec.eveningOutcome = 'no-go-inside-button'; rec.outcome = 'evening-no-go-inside-button'; taps.push(rec); return;
        }
        // Dispatch 'Go inside' exactly as app.js doContextAction does:
        // Game.enterBuilding(); refresh() is DOM-only and skipped.
        rec.entrySayBefore = sayLines.length;
        let entryRet = null, entryErr = null;
        try { entryRet = Game2.enterBuilding(); } catch (e) { entryErr = String(e && (e.stack || e.message)); }
        rec.entrySayAfter = sayLines.length;
        rec.entrySayWindow = sayLines.slice(rec.entrySayBefore, rec.entrySayAfter).map((x) => x.line);
        rec.entryReturn = (entryRet === undefined ? null : entryRet); rec.entryError = entryErr;
        const afterEntry = snapPos();
        rec.accessAfterEntry = afterEntry.access; rec.insideHavenAfterEntry = afterEntry.inside;
        rec.tileAfterEntry = afterEntry.tile; rec.mxAfterEntry = afterEntry.mx; rec.myAfterEntry = afterEntry.my;
        if (entryRet !== true || afterEntry.inside !== true || afterEntry.tile !== 'haven') {
          rec.eveningOutcome = 'entry-refused'; rec.outcome = 'evening-entry-refused'; taps.push(rec); return;
        }
        rec.eveningOutcome = 'completed'; rec.entryMethod = 'walk+go-inside';
      }
      // At-tap snapshot: the gate state the thief tap will actually see.
      const atTap = snapPos();
      rec.accessAtTap = atTap.access; rec.insideHavenAtTap = atTap.inside; rec.tileTypeAtTap = atTap.tile;
      rec.exiledAtTap = atTap.exiled; rec.integrationStageAtTap = atTap.stage;
      rec.mxAtTap = atTap.mx; rec.myAtTap = atTap.my;
      rec.kcalAtTap = Math.round((Game2.state.scholar || {}).kcal || 0);
      // Social keys: open a conversation and KEEP it open for the tap.
      let partner = null, convActive = false;
      if (SOCIAL_KEYS.has(key)) {
        try {
          const roster = (Game2.state.village.roster || []).filter((id) => id !== Game2.villagerId);
          for (const vid of roster) {
            const person = (typeof Game2.getPerson === 'function') ? Game2.getPerson(vid) : null;
            if (person && person.dead) continue;
            try { Game2.talkTo(vid); partner = vid; break; } catch (e) {}
          }
        } catch (e) {}
        try { const cv = (Game2.state.village.conv || {})[partner]; convActive = !!(cv && cv.active); } catch (e) {}
      }
      rec.convoPartner = partner; rec.convoActive = convActive;
      // Button read (bar read, null target) — the gate for a genuine attempt.
      let avail = null, availErr = null;
      try { avail = Game2._actionAvailable(aid, def.actObj); } catch (e) { availErr = String(e && e.message); }
      rec.buttonOk = !!(avail && avail.ok); rec.buttonWhy = avail ? (avail.why || null) : null; rec.buttonErr = availErr;
      if (!rec.buttonOk) {
        rec.outcome = 'button-refused';
        if (SOCIAL_KEYS.has(key) && partner) { try { Game2.endConvo(partner, 'left'); } catch (e) {} }
        taps.push(rec); return;
      }
      // Genuine tap: UI entry point, no target.
      rec.evtBefore = nestEvt; rec.sayBefore = sayLines.length; rec.directBefore = stockdoors.directRecords.length;
      let tapRes = null, tapErr = null;
      try { tapRes = Game2.activateAbility(key); } catch (e) { tapErr = String(e && (e.stack || e.message)); }
      rec.evtAfter = nestEvt; rec.sayAfter = sayLines.length;
      const s3 = Game2.state.scholar;
      rec.gameDayAfter = s3.day; rec.dayTicksAfter = s3.dayTicks; rec.dayPartAfter = Game2.dayPart;
      rec.kcalAfter = Math.round(s3.kcal || 0); rec.healthAfter = Math.round(s3.health || 0);
      rec.tapResult = (tapRes === undefined ? null : tapRes); rec.tapError = tapErr;
      try {
        const sch3 = Game2.state.scholar || {};
        let accessAfter = null, tileAfter = null;
        try { accessAfter = (typeof Game2.havenStoresAccess === 'function') ? Game2.havenStoresAccess() : null; } catch (e) {}
        try { const t = Game2.playerTile(); tileAfter = t ? (t.type || null) : null; } catch (e) {}
        rec.accessAfter = accessAfter;
        rec.insideHavenAfter = (sch3.insideHaven === undefined ? null : !!sch3.insideHaven);
        rec.tileTypeAfter = tileAfter;
      } catch (e) {}
      rec.sayWindow = sayLines.slice(rec.sayBefore, rec.sayAfter).map((x) => x.line);
      rec.outcome = 'attempted';
      // Thief outcome class (verbatim-line based, never inferred from
      // tapResult alone: a caught roll still returns true).
      try {
        const win = rec.sayWindow;
        const has = (re) => win.some((l) => re.test(l));
        if (rec.tapResult === true && has(/A hand closes on your wrist/)) rec.tapOutcomeClass = 'success-caught';
        else if (rec.tapResult === true && has(/The food disappears\. Magic/)) rec.tapOutcomeClass = 'success-clean';
        else if (rec.tapResult === false && has(/The pantry is in the hall\. Your hands are not\./)) rec.tapOutcomeClass = 'impl-refused-hall';
        else if (rec.tapResult === false && has(/Nothing worth lifting/)) rec.tapOutcomeClass = 'impl-refused-empty';
        else if (rec.tapResult === false && has(/Too heavy for even a light lift/)) rec.tapOutcomeClass = 'impl-refused-heavy';
        else if (rec.tapResult === false) rec.tapOutcomeClass = 'other-refusal';
        else rec.tapOutcomeClass = 'other-success';
        const vil3 = Game2.state.village || {};
        const pan3 = vil3.pantry || [];
        rec.pantryStacksAfterTap = pan3.length;
        rec.pantryKcalAfterTap = Math.round(pan3.reduce((t, it) => t + (it.kcalEach || 0) * (it.units || 1), 0));
      } catch (e) { rec.tapOutcomeClass = 'classify-error'; }
      if (SOCIAL_KEYS.has(key) && partner) { try { Game2.endConvo(partner, 'left'); } catch (e) {} }
      taps.push(rec);
    },
  });
  const result = await runDays(Game, policy, { days: LEAD + TAPDAYS, manifest: null });
  return {
    seed, ability: aid, action: actId, context: def.context, key,
    grantOk, grantMethod, openingKcal,
    leadDays: LEAD, tapDaysPlanned: TAPDAYS,
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    taps, nestEvents,
    directRecords: stockdoors.directRecords,
    mealDrawRecords: mealdraw.mealDrawRecords,
  };
}

(async () => {
  const defs = loadAbilityDefs();
  let keys = PREREG_KEYS;
  if (process.env.KEYS) {
    keys = process.env.KEYS.split(',').map((x) => x.trim()).filter(Boolean);
    for (const k of keys) if (!defs[k]) { console.error('FATAL: KEYS entry not in abilities.json: ' + k); process.exit(2); }
  }
  const pending = [];
  let done = 0;
  for (const seed of SEEDS) {
    for (const key of keys) {
      const inst = await oneInstance(seed, key, defs);
      done++;
      const att = inst.taps.filter((t) => t.outcome === 'attempted').length;
      const ref = inst.taps.filter((t) => t.outcome === 'button-refused').length;
      const skp = inst.taps.filter((t) => t.outcome === 'skipped').length;
      const name = `thiefinside-b-s${seed}-${key}.json`;
      const summary = `thiefinside seed=${seed} ${key} grant=${inst.grantOk} end=${inst.endReason} taps=${inst.taps.length} attempted=${att} button-refused=${ref} skipped=${skp} spansLogged=${inst.nestEvents.filter((e) => e.kind === 'spanEnter').length}`;
      const data = JSON.stringify(inst);
      if (tryWrite(path.join(OUTDIR, name), data, 6)) console.log(summary + ' written');
      else { pending.push({ name, data }); console.error(summary + ' WRITE PENDING (EPERM flap) — kept in memory'); }
    }
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
  console.log('wrote ' + done + ' thiefinside files to ' + OUTDIR);
})().catch((e) => { console.error('THIEFHALL CRASH', e && (e.stack || e)); process.exit(2); });
