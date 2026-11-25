// wilddeath-b-instrument-20261124.js — "what kills a veteran in
// the wild" death-attribution instrument (arm sim-wilddeath-b).
// Scripts only, zero src/js. Reuses the standing-gearready
// instrument VERBATIM as the base (daily snapshots, killEvents,
// deathEvents, standing lines) and ADDS a death-capture layer:
//   - playerDeath(cause): one row per scholar death, captured
//     BEFORE the original runs (succession changes the scholar id
//     and tbEnd clears tbfight in its finally AFTER the loss
//     branch calls playerDeath — game.js:48334 vs :48432 — so the
//     live fight is still readable here). Records the cause
//     argument AS PASSED ('<undefined>' when the caller passed
//     nothing — the `cause || 'the wild'` default in ledger.js),
//     a stack trace naming the call site, the live tbfight
//     (fighters, monster ids + waves, fight flags), the scholar's
//     live where-context (departed, location, tile type, tent,
//     camp, pending encounter, day part, vitals), and the say tail
//     (last 8 say/sysSay lines of any content).
//   - registerDeath(opts): one row per person/villager death with
//     cause 'the wild' (the backstop for a non-scholar wild death —
//     hurtVillager never passes 'the wild', but the analyzer must
//     never have to guess). Only the stack site + fight-lite
//     context: the where-context describes the SCHOLAR, not the
//     victim, so it is NOT recorded here.
//   - say/sysSay ring buffer (last 30 lines, any content) feeding
//     the death rows' say tails. The base instrument's SAY_RE
//     capture still runs (chained wraps).
// All wraps are call-through and RNG-neutral; every catch reports
// into t.instrumentErrors, never silently. This is the fix for
// the vetattrition-a G recorder gap (2026-11-15): every death row
// carries victim identity + call site + live fight context at
// death time, so no analyzer ever infers a victim from a same-day
// death count.
// Usage: const INST = require('./wilddeath-b-instrument-20261124');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.uninstall();
'use strict';

const BASE = require('./standing-gearready-b-instrument-20261124');

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function waveOf(Game, mid) {
  try {
    const m = (Game.data.monsters || []).find(function (x) { return x && x.id === mid; });
    if (m) return m.wave || 1;
  } catch (e) {}
  return null;
}

// --- stack parsing: first src/js frame is the call site ---
// Node stack lines look like:
//   at Game.tbEnd (/.../src/js/game.js:48334:15)
//   at Object.<anonymous> (/.../scripts/foo.js:12:3)
// Frames inside this instrument file are skipped: the wrapper is
// never the site. Returns { site: 'game.js:48334 Game.tbEnd' (or
// null), hasTbEnd: bool, frames: [up to 8 site strings] }.
function parseStack() {
  const out = { site: null, hasTbEnd: false, frames: [] };
  try {
    const st = new Error().stack || '';
    const lines = st.split('\n').slice(1);
    for (const ln of lines) {
      if (out.frames.length >= 8) break;
      const m = ln.match(/at\s+(.*?)\s+\((.*):(\d+):(\d+)\)/) || ln.match(/at\s+(.*):(\d+):(\d+)/);
      if (!m) continue;
      const fn = (m[1] || '').trim();
      const file = m[2] || m[1] || '';
      const line = m[3] || m[2] || '?';
      if (file.indexOf('wilddeath-b-instrument') >= 0) continue;
      const short = file.split('/').slice(-2).join('/');
      out.frames.push(fn + ' @ ' + short + ':' + line);
      if (out.site == null && file.indexOf('/src/js/') >= 0) {
        out.site = short + ':' + line + ' ' + fn;
      }
      if (fn.indexOf('tbEnd') >= 0) out.hasTbEnd = true;
    }
    if (out.site == null && out.frames.length) out.site = out.frames[0];
  } catch (e) {}
  return out;
}

// --- live tbfight snapshot (read-only; null when no fight live) ---
function tbCtx(Game) {
  const ctx = { inTbFight: false, fightId: null, over: null, result: null,
    fighters: [], monsterIds: [], monsterWaves: [], villagerIds: [],
    hasMonster: false, hasHostile: false, arenaContest: false,
    betrayal: false, tableTrial: false, coalitionArena: false };
  try {
    const tf = Game.tbfight || null;
    if (!tf) return ctx;
    ctx.inTbFight = true;
    ctx.fightId = tf.id || null;
    ctx.over = !!tf.over;
    ctx.result = tf.result || null;
    ctx.betrayal = !!tf.betrayal;
    ctx.tableTrial = !!tf.tableTrial;
    ctx.coalitionArena = !!tf.coalitionArena;
    try { ctx.arenaContest = !!((Game.state || {}).arenaContest); } catch (e) {}
    const fighters = Array.isArray(tf.fighters) ? tf.fighters : [];
    for (const f of fighters) {
      if (!f) continue;
      const kind = f.kind || null;
      const mid = (f.mdef && f.mdef.id) || f.monsterId || null;
      ctx.fighters.push({ kind: kind, monsterId: mid,
        wave: mid ? waveOf(Game, mid) : null,
        villagerId: f.villagerId || null, alive: (f.alive == null ? null : !!f.alive) });
      if (kind === 'monster') {
        ctx.hasMonster = true;
        if (mid) { ctx.monsterIds.push(mid); ctx.monsterWaves.push(waveOf(Game, mid)); }
      }
      if (kind === 'hostile') ctx.hasHostile = true;
      if ((kind === 'villager' || kind === 'ally') && f.villagerId) ctx.villagerIds.push(f.villagerId);
    }
  } catch (e) {}
  return ctx;
}

// --- scholar where-context (victim IS the scholar on playerDeath) ---
function whereCtx(Game) {
  const w = { departed: null, location: null, runLocation: null, tileType: null,
    dayPart: null, insideTent: null, camp: false, campXY: null,
    pendingEncounter: false, pendingMonsterId: null, pendingInTent: false,
    vitals: {}, scholarId: null };
  try { w.scholarId = Game.villagerId || null; } catch (e) {}
  try { w.departed = !!Game.departed; } catch (e) {}
  try {
    const loc = Game.location;
    w.location = (loc == null) ? null : (typeof loc === 'string' ? loc : JSON.stringify(loc).slice(0, 120));
  } catch (e) {}
  try { w.runLocation = (((Game.state || {}).run) || {}).location || null; } catch (e) {}
  try {
    const t = (typeof Game.playerTile === 'function') ? Game.playerTile() : null;
    w.tileType = (t && t.type) || null;
  } catch (e) {}
  try { w.dayPart = Game.dayPart || null; } catch (e) {}
  try {
    const s = (Game.state || {}).scholar || {};
    w.insideTent = (s.insideTent == null) ? null : !!s.insideTent;
    w.camp = !!Game.state.camp;
    if (Game.state.camp) w.campXY = [Game.state.camp.px | 0, Game.state.camp.py | 0];
    w.pendingEncounter = !!Game.pendingEncounter;
    w.pendingMonsterId = Game.pendingMonsterId || null;
    w.pendingInTent = !!Game.pendingInTent;
    for (const k of ['health', 'hunger', 'thirst', 'energy', 'stamina']) {
      if (s[k] != null) w.vitals[k] = s[k];
    }
    if (Array.isArray(s.wounds)) w.vitals.wounds = s.wounds.length;
    if (Array.isArray(s.conditions)) w.vitals.conditions = s.conditions.slice(0, 6);
  } catch (e) {}
  return w;
}

function install(Game) {
  const base = BASE.install(Game);
  const t = base.t;
  t.playerDeaths = [];
  t.regDeaths = [];
  const orig = {};
  const sayRing = [];
  function err(where, e) { try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e).slice(0, 100)); } catch (e2) {} }

  // --- say ring buffer (last 30 lines, any content) ---
  // Chained AFTER the base wraps: install order is base first, so
  // Game.say here IS the base-wrapped version; uninstall restores
  // mine first, then base's.
  function wrapSay(fnName) {
    if (typeof Game[fnName] !== 'function') return;
    orig[fnName] = Game[fnName];
    Game[fnName] = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayRing.push({ day: dayOf(Game), via: fnName, line: String(arg).slice(0, 300) });
          if (sayRing.length > 30) sayRing.splice(0, sayRing.length - 30);
        }
      } catch (e) { err(fnName + '-ring', e); }
      return orig[fnName].apply(this, arguments);
    };
  }
  wrapSay('say');
  wrapSay('sysSay');

  function sayTail() {
    try { return sayRing.slice(-8).map(function (x) { return { day: x.day, via: x.via, line: x.line }; }); }
    catch (e) { return []; }
  }

  // --- scholar deaths: full capture BEFORE the original runs ---
  if (typeof Game.playerDeath === 'function') {
    orig.playerDeath = Game.playerDeath;
    Game.playerDeath = function (cause) {
      let row = null;
      try {
        const stk = parseStack();
        row = {
          day: dayOf(Game),
          causeArg: (cause === undefined) ? '<undefined>' : (cause === null ? '<null>' : String(cause)),
          site: stk.site, hasTbEnd: stk.hasTbEnd, stackFrames: stk.frames,
          tb: tbCtx(Game),
          where: whereCtx(Game),
          sayTail: sayTail(),
        };
        try {
          row.victimName = (typeof Game.displayName === 'function')
            ? Game.displayName(Game.villagerId) : null;
        } catch (e) { row.victimName = null; }
      } catch (e) { err('playerDeath-ctx', e); }
      let r;
      try { r = orig.playerDeath.apply(this, arguments); }
      finally {
        try {
          if (row) { row.afterOver = !!Game.over; t.playerDeaths.push(row); }
        } catch (e) { err('playerDeath-row', e); }
      }
      return r;
    };
  } else { err('install.playerDeath', new Error('not a function')); }

  // --- all person/villager deaths, wild-cause only (backstop) ---
  // registerDeath is already wrapped at load (codex-people.js,
  // comms.js); this chains after those — capture the CURRENT
  // function, never the load-time one.
  if (typeof Game.registerDeath === 'function') {
    orig.registerDeath = Game.registerDeath;
    Game.registerDeath = function (opts) {
      let row = null;
      try {
        const o = opts || {};
        if ((o.kind === 'person' || o.kind === 'villager') && (o.cause === 'the wild')) {
          const stk = parseStack();
          const tb = tbCtx(Game);
          row = {
            day: dayOf(Game),
            who: o.villagerId || o.name || null,
            kind: o.kind || null,
            cause: o.cause || null,
            player: !!o.player,
            site: stk.site, hasTbEnd: stk.hasTbEnd, stackFrames: stk.frames,
            tbFightId: tb.fightId, tbInFight: tb.inTbFight,
            tbMonsterIds: tb.monsterIds.slice(), tbMonsterWaves: tb.monsterWaves.slice(),
            tbHasMonster: tb.hasMonster, tbHasHostile: tb.hasHostile,
            tbArenaContest: tb.arenaContest,
          };
        }
      } catch (e) { err('registerDeath-ctx', e); }
      let r;
      try { r = orig.registerDeath.apply(this, arguments); }
      finally {
        try { if (row) t.regDeaths.push(row); } catch (e) { err('registerDeath-row', e); }
      }
      return r;
    };
  } else { err('install.registerDeath', new Error('not a function')); }

  function uninstall() {
    Object.keys(orig).forEach(function (n) { try { Game[n] = orig[n]; } catch (e) {} });
    try { base.uninstall(); } catch (e) {}
  }
  return { t: t, snapshot: base.snapshot, uninstall: uninstall };
}

module.exports = { install: install, dayOf: dayOf, waveOf: waveOf, parseStack: parseStack, tbCtx: tbCtx, whereCtx: whereCtx };
