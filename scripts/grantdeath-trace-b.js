#!/usr/bin/env node
// grantdeath-trace-b.js — death-cause trace instrument
// (sim-grantdeath-b; prereg:
// evidence/2026-10-28/sim-grantdeath-b-prereg.md, committed
// as 8566cd98d BEFORE any judged trace run).
// COPY of scripts/grantpersist-trace-b.js (never edited in
// place), extended ONLY with overnight death-cause capture:
// a Game.playerDeath wrapper (cause argument verbatim +
// caller stack + body at entry), a Game.registerDeath
// wrapper (opts verbatim), the full say-line capture
// returned (grantpersist dropped it except in tap windows),
// and a bracket window attached to every snapshot (death
// events + fallen diff + telemetry death records + say
// lines since the previous snapshot). Wrappers are
// read-only observers: they record, then call the original
// unchanged, and never alter a return value, a cause, or
// game state. A cause counts only if the window records
// it — never a guess from health/kcal alone.
//
// DIAGNOSIS ONLY: zero src/js changes, zero edits to
// scripts/playpath-spandraw-b.js (this file is a COPY of it,
// extended). Each instance is a FRESH game played EXACTLY as
// the playpath driver played it (same grant, same competent
// policy, same 2 lead + 5 tap days, same tap sequence, same
// honesty rules: NEVER sets dayTicks/dayPart, NEVER calls
// tickAction, NEVER tops up kcal/health, NEVER steers taps),
// PLUS ability-list snapshots that bracket the loss:
//   - a setup snapshot right after the grant,
//   - a tap-day-start snapshot at the top of every wrapper
//     daily (BEFORE competent.daily),
//   - a post-daily snapshot after competent.daily returns
//     (BEFORE any tap work),
//   - a pre-tap snapshot (ability list + bearer id) before
//     every tap, and a post-tap snapshot after it.
// Each snapshot records: ability ids + levels, bearer id
// (Game.villagerId and scholar.villagerId), game day +
// dayTicks, Game.hasAbility(aid), and whether the scholar
// object / abilities array reference changed since the
// previous snapshot. localizeLoss() (exported, proof-tested)
// finds the first absent snapshot after a present one and
// names the bracket (phase + day) and what changed
// (bearer / scholar object / list reference / entry gone).
//
// Env (all substrate gates asserted FATAL):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   SEEDS="10040,...,10047" (default judged pilot band)
//   KEYS="ability.action,..." (default: all 15 prereg keys)
//   OUTDIR (default evidence/2026-10-28/sim-grantdeath-b-corpus)
//   LEAD=2 TAPDAYS=5
// Output per instance: grantdeath-b-s<seed>-<ability>.<action>.json
// Write transport mirrors the playpath driver: failed writes
// are kept in memory and flushed at the end (EPERM flap waited
// out, never forced); deadline exhaustion stages inside this
// worktree (.grantdeath-staging, never /tmp) and exits loudly.
// When required (not run as main), only the snapshot helpers
// are exported and no band runs.
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
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-28', 'sim-grantdeath-b-corpus');
const STAGING_DIR = path.join(__dirname, '..', '.grantdeath-staging');

const PREREG_KEYS = [
  'tracker.track', 'thief.steal_pantry', 'game_sense.read_sign',
  'patient_aim.clean_shot', 'stalk.stalk_prey', 'blood_trail.follow_blood',
  'ambush.lay_wait', 'animal_ken.read_beast', 'scarecrow.stage_injury',
  'molt.shed_skin', 'fear_aura.menace',
  'intimidating_presence.end_it_before', 'war_cry.challenge',
  'trophy_room.mark', 'long_table.share_pot',
];
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

// --- grant-persistence snapshot helpers (exported for the proof) ---
// A snapshot is plain JSON-safe data. prevRefs is the caller's
// { scholar, list } from the previous snapshot (or null); the
// caller updates it after each snapshot from Game.state.scholar.
// grantedPresent mirrors modifiers.js hasAbility lineage: an
// entry whose evolvedFrom is the granted id still counts as
// present, so a deepening/evolution is NOT flagged as a loss.
function entryId(e) { return (e && e.id) || e || null; }
function snapshotScholar(Game, aid, phase, seq, prevRefs) {
  const s = Game.state.scholar;
  const list = (s.abilities || []).map((e) => ({
    id: entryId(e),
    level: (e && e.level) || 1,
    evolvedFrom: (e && e.evolvedFrom) || null,
  }));
  let has = null;
  try { has = !!Game.hasAbility(aid); } catch (e) { has = null; }
  return {
    phase, seq,
    gameDay: s.day, dayTicks: s.dayTicks,
    bearerGame: Game.villagerId || null,
    bearerScholar: s.villagerId || null,
    scholarChanged: prevRefs ? (prevRefs.scholar !== s) : false,
    listRefChanged: prevRefs ? (prevRefs.list !== s.abilities) : false,
    abilities: list,
    backgroundAbilities: (s.backgroundAbilities || []).map((e) => entryId(e)),
    grantedPresent: list.some((e) => e.id === aid || e.evolvedFrom === aid),
    hasAbility: has,
    over: !!Game.over,
    // grantdeath extension: body at snapshot time, so the
    // last-present body can be compared with the death
    // entry's body WITHOUT inferring a cause from either.
    health: Math.round(s.health || 0),
    kcal: Math.round(s.kcal || 0),
    hydration: Math.round(s.hydration || 0),
    energy: Math.round(s.energy || 0),
    woundsCount: Array.isArray(s.wounds) ? s.wounds.length : 0,
    diseaseKeys: s.diseases ? Object.keys(s.diseases) : [],
  };
}
function localizeLoss(snaps, aid) {
  let lastPresent = null;
  for (const snap of (snaps || [])) {
    const present = snap.grantedPresent || snap.hasAbility;
    if (present) { lastPresent = snap; continue; }
    if (!lastPresent) return { lost: true, lostAtSetup: true, firstAbsent: snap, lastPresent: null, bracket: snap.phase + ' seq ' + snap.seq + ' gameDay ' + snap.gameDay, bearerChanged: false, scholarChanged: !!snap.scholarChanged, listRefChanged: !!snap.listRefChanged };
    return {
      lost: true, lostAtSetup: false, firstAbsent: snap, lastPresent,
      bracket: snap.phase + ' seq ' + snap.seq + ' gameDay ' + snap.gameDay,
      bearerChanged: (snap.bearerGame !== lastPresent.bearerGame) || (snap.bearerScholar !== lastPresent.bearerScholar),
      scholarChanged: !!snap.scholarChanged,
      listRefChanged: !!snap.listRefChanged,
    };
  }
  return { lost: false, lastPresent };
}

// --- grantdeath death-cause capture (module-level, proof-tested) ---
// store: { sayLines, deathEvents, regDeathEvents, getLastSnap,
//   reinstalls, deathActive, regActive }. Wrappers record, then
// call the original unchanged. The reentrancy flags mean a
// double-wrap (e.g. a later module wrapping our wrapper, then a
// reassert wrapping that) records each death exactly once:
// the outermost wrapper records, inner wrappers pass through.
function deathStackFrames() {
  try {
    const lines = String(new Error().stack || '').split('\n').slice(1);
    const out = [];
    for (const ln of lines) {
      const t = ln.trim();
      if (/deathStackFrames|grantdeath|playerDeathWrapper|registerDeathWrapper|installDeathCapture|reassertDeathCapture/.test(t)) continue;
      out.push(t.slice(0, 220));
      if (out.length >= 8) break;
    }
    return out;
  } catch (e) { return []; }
}
function deathBody(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    return {
      health: Math.round(s.health || 0),
      kcal: Math.round(s.kcal || 0),
      hydration: Math.round(s.hydration || 0),
      woundsCount: Array.isArray(s.wounds) ? s.wounds.length : 0,
      diseaseKeys: s.diseases ? Object.keys(s.diseases) : [],
    };
  } catch (e) { return {}; }
}
function installDeathCapture(Game, store) {
  let wrapped = 0;
  try {
    const origPD = Game.playerDeath;
    if (typeof origPD === 'function' && !origPD.__grantdeathInstalled) {
      const w = function (...args) {
        if (store.deathActive) return origPD.apply(this, args);
        store.deathActive = true;
        try {
          const s = (Game.state || {}).scholar || {};
          const last = (typeof store.getLastSnap === 'function') ? (store.getLastSnap() || {}) : {};
          store.deathEvents.push({
            kind: 'playerDeath',
            cause: (args[0] == null ? null : String(args[0])),
            oldId: Game.villagerId || s.villagerId || null,
            gameDay: s.day, dayTicks: s.dayTicks,
            body: deathBody(Game),
            stack: deathStackFrames(),
            sayIndex: (store.sayLines || []).length,
            lastSnapPhase: last.phase || null, lastSnapSeq: (last.seq == null ? null : last.seq),
          });
        } catch (e) {}
        try { return origPD.apply(this, args); } finally { store.deathActive = false; }
      };
      w.__grantdeathInstalled = true;
      Game.playerDeath = w;
      wrapped++;
    }
  } catch (e) {}
  try {
    const origRD = Game.registerDeath;
    if (typeof origRD === 'function' && !origRD.__grantdeathInstalled) {
      const w = function (...args) {
        if (store.regActive) return origRD.apply(this, args);
        store.regActive = true;
        try {
          const opts = args[0] || {};
          const s = (Game.state || {}).scholar || {};
          const last = (typeof store.getLastSnap === 'function') ? (store.getLastSnap() || {}) : {};
          store.regDeathEvents.push({
            kind: 'registerDeath',
            cause: (opts.cause == null ? null : String(opts.cause)),
            villagerId: opts.villagerId || null,
            name: opts.name || null,
            kindOpt: opts.kind || null,
            killerId: opts.killerId || null,
            player: !!opts.player,
            gameDay: s.day, dayTicks: s.dayTicks,
            stack: deathStackFrames(),
            sayIndex: (store.sayLines || []).length,
            lastSnapPhase: last.phase || null, lastSnapSeq: (last.seq == null ? null : last.seq),
          });
        } catch (e) {}
        try { return origRD.apply(this, args); } finally { store.regActive = false; }
      };
      w.__grantdeathInstalled = true;
      Game.registerDeath = w;
      wrapped++;
    }
  } catch (e) {}
  return wrapped;
}
function reassertDeathCapture(Game, store) {
  const n = installDeathCapture(Game, store);
  if (n > 0) store.reinstalls = (store.reinstalls || 0) + 1;
  return n;
}
// Pure bracket-diff (proof-tested): window = everything in
// the parts since prev (null prev = from the start); nextPrev
// = counters as of now. oneInstance's bracketWindow is a thin
// wrapper over this, adding phase/seq.
function bracketDiff(prev, parts) {
  const say = (parts.sayLines || []).slice(prev ? prev.say : 0).map((x) => (x && x.line != null ? x.line : String(x)));
  const deaths = (parts.deathEvents || []).slice(prev ? prev.death : 0);
  const regs = (parts.regDeathEvents || []).slice(prev ? prev.reg : 0);
  const fallenAdded = (parts.fallen || []).slice(prev ? prev.fallen : 0);
  const teleAdded = (parts.teleDeaths || []).slice(prev ? prev.tele : 0);
  return {
    window: { sayLines: say, deathEvents: deaths, regDeathEvents: regs, fallenAdded, teleDeathAdded: teleAdded },
    nextPrev: { say: (parts.sayLines || []).length, death: (parts.deathEvents || []).length, reg: (parts.regDeathEvents || []).length, fallen: (parts.fallen || []).length, tele: (parts.teleDeaths || []).length },
  };
}
// Pure cause-naming rule (proof-tested): a cause counts ONLY
// when a recorded event names it. Body fields are deliberately
// NOT an input here — a health/kcal-only fixture must come
// back UNRECORDED. Priority: playerDeath for the old bearer,
// then registerDeath for that villager, then a fallen entry,
// then a telemetry death record. site = first stack frame.
function nameDeathCause(input, oldId) {
  const ev = (input || {}).deathEvents || [];
  for (const e of ev) {
    if (e && e.kind === 'playerDeath' && (!oldId || e.oldId === oldId)) {
      return { recorded: true, source: 'playerDeath', cause: e.cause, site: (e.stack || [])[0] || null, stack: e.stack || [], event: e };
    }
  }
  const regs = (input || {}).regDeathEvents || [];
  for (const e of regs) {
    if (e && (!oldId || e.villagerId === oldId)) {
      return { recorded: true, source: 'registerDeath', cause: e.cause, site: (e.stack || [])[0] || null, stack: e.stack || [], event: e };
    }
  }
  for (const f of ((input || {}).fallen || [])) {
    if (f && (!oldId || f.villagerId === oldId)) {
      return { recorded: true, source: 'fallen', cause: f.cause || null, site: null, stack: [], event: f };
    }
  }
  for (const t of ((input || {}).teleDeaths || [])) {
    if (t && (!oldId || String(t.who) === String(oldId))) {
      return { recorded: true, source: 'telemetry', cause: t.cause || null, site: null, stack: [], event: t };
    }
  }
  return { recorded: false, source: null, cause: null, site: null, stack: [], event: null };
}

async function oneInstance(seed, key, defs) {
  const [aid, actId] = key.split('.');
  const def = defs[key];
  if (!def) throw new Error('unknown key ' + key);
  const { Game } = await loadGame({ seed, mode: 'grantdeath-trace-b', fullTelemetry: false });
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
  // grantdeath: death-cause capture, installed after setup
  // (so it chains over any load/setup-time wrappers) and
  // re-asserted at every tapday-start. Read-only observers.
  let lastSnap = null;
  const deathStore = {
    sayLines, deathEvents: [], regDeathEvents: [], reinstalls: 0,
    deathActive: false, regActive: false,
    getLastSnap: () => lastSnap,
  };
  installDeathCapture(Game, deathStore);
  // Bracket bookkeeping: prevBracket holds the counters as of
  // the last snapshot taken, so the window attached to the
  // NEXT snapshot is exactly the interval since that snapshot
  // (sleep + endDay + morning waits, for a tapday-start).
  let prevBracket = null;
  function bracketWindow(phase, seq) {
    let fallenNow = [], teleNow = [];
    try { fallenNow = ((Game.state.village || {}).fallen || []).slice(); } catch (e) {}
    try { teleNow = ((Game.state.telemetry || []).filter((t) => t && t.type === 'death')); } catch (e) {}
    const d = bracketDiff(prevBracket, { sayLines, deathEvents: deathStore.deathEvents, regDeathEvents: deathStore.regDeathEvents, fallen: fallenNow, teleDeaths: teleNow });
    prevBracket = d.nextPrev;
    return Object.assign({ phase, seq }, d.window);
  }
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
  // Grant-persistence trace state: snapshots bracket every day.
  const daySnapshots = [];
  let prevRefs = null;
  function takeSnap(phase, seq) {
    const snap = snapshotScholar(Game, aid, phase, seq, prevRefs);
    // grantdeath: attach the bracket window (everything said /
    // died / recorded since the previous snapshot) BEFORE
    // updating lastSnap, so a death event's lastSnapSeq is
    // the snapshot before the bracket that contains it.
    snap.bracketWindow = bracketWindow(phase, seq);
    daySnapshots.push(snap);
    lastSnap = { phase, seq };
    prevRefs = { scholar: Game.state.scholar, list: Game.state.scholar.abilities };
    return snap;
  }
  const setupSnapshot = takeSnap('setup', 0);
  let openingKcal = null;
  try { openingKcal = spoilvol.snapshotPantry().freshKcal; } catch (e) {}

  const taps = [];
  let tapDayCount = 0;
  let dailySeq = 0;
  const policy = Object.assign({}, competent, {
    daily(Game2, ctx) {
      dailySeq++;
      // grantdeath: re-assert the death wrappers in case a
      // later module re-wrapped playerDeath/registerDeath
      // (reinstalls counted; the reentrancy guard keeps each
      // death recorded exactly once even under double-wrap).
      reassertDeathCapture(Game2, deathStore);
      // Snapshot pair brackets exactly what competent.daily does
      // to the ability list on this day (lead days included: the
      // loss may predate the tap days entirely).
      takeSnap('tapday-start', dailySeq);
      competent.daily(Game2, ctx);
      takeSnap('post-daily', dailySeq);
      tapDayCount++;
      if (tapDayCount <= LEAD) return;
      if (Game2.over) { taps.push({ tapDay: tapDayCount, outcome: 'game-over', note: 'run ended before tap' }); return; }
      const s2 = Game2.state.scholar;
      const rec = { tapDay: tapDayCount, gameDayBefore: s2.day, dayTicksBefore: s2.dayTicks, dayPartBefore: Game2.dayPart,
        kcalBefore: Math.round(s2.kcal || 0), healthBefore: Math.round(s2.health || 0),
        atHavenBefore: !!(Game2.playerAtHaven && Game2.playerAtHaven()),
        inCombatBefore: !!(Game2.inCombat && Game2.inCombat()),
        killsBefore: Object.keys(Game2.state.villageSlain || {}).filter((k) => (Game2.state.villageSlain[k] || 0) > 0).length };
      if (rec.inCombatBefore) { rec.outcome = 'skipped'; rec.skipReason = 'in-combat'; taps.push(rec); return; }
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
      // Genuine tap: UI entry point, no target. Pre-tap snapshot
      // is taken AFTER the conversation open (tap-time state) and
      // BEFORE the tap, so a loss between post-daily and the tap
      // itself is bracketed separately from a daily loss.
      rec.preTapSnapshot = takeSnap('pre-tap', dailySeq);
      rec.evtBefore = nestEvt; rec.sayBefore = sayLines.length; rec.directBefore = stockdoors.directRecords.length;
      let tapRes = null, tapErr = null;
      try { tapRes = Game2.activateAbility(key); } catch (e) { tapErr = String(e && (e.stack || e.message)); }
      rec.postTapSnapshot = takeSnap('post-tap', dailySeq);
      rec.evtAfter = nestEvt; rec.sayAfter = sayLines.length;
      const s3 = Game2.state.scholar;
      rec.gameDayAfter = s3.day; rec.dayTicksAfter = s3.dayTicks; rec.dayPartAfter = Game2.dayPart;
      rec.kcalAfter = Math.round(s3.kcal || 0); rec.healthAfter = Math.round(s3.health || 0);
      rec.tapResult = (tapRes === undefined ? null : tapRes); rec.tapError = tapErr;
      rec.sayWindow = sayLines.slice(rec.sayBefore, rec.sayAfter).map((x) => x.line);
      rec.outcome = 'attempted';
      if (SOCIAL_KEYS.has(key) && partner) { try { Game2.endConvo(partner, 'left'); } catch (e) {} }
      taps.push(rec);
    },
  });
  const result = await runDays(Game, policy, { days: LEAD + TAPDAYS, manifest: null });
  return {
    seed, ability: aid, action: actId, context: def.context, key,
    grantOk, grantMethod, openingKcal,
    setupSnapshot, daySnapshots,
    lossLocalization: localizeLoss(daySnapshots, aid),
    leadDays: LEAD, tapDaysPlanned: TAPDAYS,
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    taps, nestEvents,
    directRecords: stockdoors.directRecords,
    mealDrawRecords: mealdraw.mealDrawRecords,
    // grantdeath: full overnight evidence (grantpersist
    // dropped sayLines from the output; they are returned
    // here so the death narration is quotable).
    sayLines,
    deathEvents: deathStore.deathEvents,
    regDeathEvents: deathStore.regDeathEvents,
    deathReinstalls: deathStore.reinstalls,
    fallenFinal: (() => { try { return ((Game.state.village || {}).fallen || []).slice(); } catch (e) { return []; } })(),
    teleDeathFinal: (() => { try { return ((Game.state.telemetry || []).filter((t) => t && t.type === 'death')); } catch (e) { return []; } })(),
  };
}

if (require.main !== module) {
  module.exports = { snapshotScholar, localizeLoss, entryId, installDeathCapture, reassertDeathCapture, nameDeathCause, deathStackFrames, deathBody, bracketDiff };
} else (async () => {
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
      const name = `grantdeath-b-s${seed}-${key}.json`;
      const summary = `grantdeath seed=${seed} ${key} grant=${inst.grantOk} loss=${inst.lossLocalization.lost} end=${inst.endReason} taps=${inst.taps.length} attempted=${att} button-refused=${ref} skipped=${skp} spansLogged=${inst.nestEvents.filter((e) => e.kind === 'spanEnter').length}`;
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
  console.log('wrote ' + done + ' grantdeath trace files to ' + OUTDIR);
})().catch((e) => { console.error('GRANTDEATH CRASH', e && (e.stack || e)); process.exit(2); });
