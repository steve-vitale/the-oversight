// scripts/policies/tbstarts-diag.js — TB-start classification recorder
// (sim-tbstarts-a, 2026-10-27, flesh-out loop, axis scale-onramp).
//
// QUESTION (not a claim): the w4melt corpus records 61 startCombat
// rows but only 28 tbEnd rows on seed 73675, clustered d113-118,
// d126-127, d152. What ARE those unsettled starts, mechanically?
// The w4melt rows cannot answer it: they carry no tbfight.id, no
// startCombat call argument, no pre-call live-fight identity, and
// no tbfight=null site marker, so a row with an empty post-call
// fighter list cannot be told apart between (i) a refused call
// during a live person-fight, (ii) a new fight that started and
// settled inside the same startCombat call, and (iii) a new fight
// dissolved without tbEnd. This recorder separates exactly those
// cases, per start, by fight id:
//
//   - startCombat pre-call: call argument, day, pre-call tbfight
//     id / over / fighter kinds+ids, player-tile monster via the
//     pure monsterAt scan (never playerMonster(), which can adopt
//     a debug-set alias), trimmed call-stack top, pre-call titan
//     outcome-log length + muster snapshot for a titan argument.
//   - startCombat post-call: tbfight id / over / fighter kinds+ids,
//     lifted flag for the pre-call tile monster, worldOrigin set
//     flag, return value null-ness, and titan outcome entries
//     appended during the call (titans.js titanRecordOutcome
//     writes {titan, day, outcome:'refused', detail:{gate, have,
//     need}} into state.titans.outcomes when its wrapper refuses
//     a solo titan fight BEFORE core startCombat runs — a call
//     that produces no fight and no tbEnd, distinguishable from
//     every other null-post-call case only by that log entry).
//     Each startCombat invocation carries a call index; tbEnd and
//     tbBarrierExit rows recorded DURING a startCombat call carry
//     that call's index (activeStart), so a fight that starts and
//     settles inside its own startCombat call joins to its end by
//     call index even though its post-call tbfight is already null
//     (tbEnd's finally cleared it) — an id join alone cannot see it.
//   - tbEnd pre-call: fight id, result, fighter kinds+ids;
//     post-call: tbfight null or surviving id.
//   - tbBarrierExit pre/post tbfight id — the dissolve site
//     marker (game.js tbBarrierExit: death mid-crossing sets
//     over=true, result='dissolved', tbfight=null, with no tbEnd).
//   - Daily snapshot: day, live fight id / over / result, so a
//     fight id's disappearance without an end or dissolve row is
//     bounded between two daily observations, never asserted
//     from day proximity alone.
//
// V2 NOTE (disclosed in the evidence): the smoke run of this
// recorder on 73675 showed 34 starts with a null post-call fight
// and no live pre-call fight — a shape the v1 fields could not
// split between a titan-gate refusal (no fight at all) and an
// instant settlement (a fight that ended inside the call). V2
// adds exactly the two discriminators that split them: the titan
// outcome-log diff and the active-start call index. No class,
// threshold, or seed changed; the prereg's DIAG-GO rule is
// untouched.
//
// READS (pure, never writes to game state): draws no RNG, throws
// nothing into the engine (recording errors are counted), returns
// every original value untouched. A startCombat call that throws
// records no start row (it never started); the throw is counted
// separately in `throws` so a thrown call can never hide as an
// unsettled start.
//
// OBSERVATIONAL ONLY. TBSTARTS=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx surface,
// no record. COMPOSE UPON (never edit): tableseat-nowait +
// raftdraft-diag + spawnsrc-diag. POLICY-SIDE ONLY — zero src/js
// changes (DIAG ONLY).
'use strict';

const MAX_EVENTS = 80000;

function layerOn() { try { return process.env.TBSTARTS === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function newStore() {
  return {
    starts: [], ends: [], dissolves: [], throws: [], daily: [],
    errs: 0, errors: [], overflow: {},
    installed: false,
    _callIdx: 0, _activeCall: null, _tokMap: null, _tokN: 0,
  };
}

function nextToken(store, obj) {
  try {
    if (!obj) return null;
    if (!store._tokMap) store._tokMap = new WeakMap();
    if (!store._tokMap.has(obj)) store._tokMap.set(obj, ++store._tokN);
    return store._tokMap.get(obj);
  } catch (e) { return null; }
}

function titanOutcomes(Game) {
  try {
    const oc = (((Game.state || {}).titans || {}).outcomes || []);
    return oc.slice();
  } catch (e) { return []; }
}

function titanMusterSnap(Game, arg) {
  try {
    if (!arg) return null;
    const defs = ((Game.data || {}).titans || {})[arg];
    if (!defs) return null;
    const muster = (((Game.state || {}).titans || {}).musters || {})[arg] || null;
    return {
      titan: arg, minAllies: (defs.minAllies != null ? defs.minAllies : null),
      allies: muster ? ((muster.allies || []).length) : 0,
      turned: muster && muster.turned ? Object.keys(muster.turned).length : 0,
    };
  } catch (e) { return null; }
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function pushCapped(store, list, item) {
  if (store[list].length >= MAX_EVENTS) { store.overflow[list] = (store.overflow[list] || 0) + 1; return false; }
  store[list].push(item);
  return true;
}

function roundHp(v) { try { return (v != null && isFinite(v)) ? Math.round(v) : null; } catch (e) { return null; } }

function waveOf(Game, m) {
  try {
    if (m && m.wave != null && isFinite(m.wave)) return m.wave | 0;
    if (typeof Game.crisisWaveOf === 'function') {
      const w = Game.crisisWaveOf(m);
      if (w && isFinite(w)) return w | 0;
    }
  } catch (e) { /* fall through */ }
  return 1;
}

function seqOf(mon) {
  try { return (mon && mon._spawnSeq != null) ? mon._spawnSeq : null; } catch (e) { return null; }
}

function monShape(Game, m) {
  if (!m) return null;
  try {
    return {
      seq: seqOf(m), type: m.id || null, wave: waveOf(Game, m),
      hp: roundHp(m.hp), maxHp: roundHp(m.maxHp),
      titan: !!m.titan, lingering: !!m.lingering,
      lingerSince: (m.lingerSince != null) ? m.lingerSince : null,
      tx: (m.tx != null) ? m.tx : null, ty: (m.ty != null) ? m.ty : null,
    };
  } catch (e) { return null; }
}

function fighterSummary(tf) {
  try {
    const out = [];
    for (const f of ((tf && tf.fighters) || [])) {
      if (!f) continue;
      out.push({
        kind: f.kind || null,
        id: ((f.mdef || {}).id || f.monsterId || f.villagerId || f.alienPid || f.id || f.key || null),
        key: f.key || null, alive: !!f.alive, hp: roundHp(f.hp),
      });
    }
    return out;
  } catch (e) { return []; }
}

function tileMonster(Game) {
  try {
    const px = (Game.map || {}).px, py = (Game.map || {}).py;
    if (px == null || py == null) return null;
    if (typeof Game.monsterAt !== 'function') return null;
    return Game.monsterAt(px, py);
  } catch (e) { return null; }
}

function inWorld(Game, mon) {
  try { return (typeof Game.worldMonsters === 'function') && Game.worldMonsters().indexOf(mon) >= 0; } catch (e) { return false; }
}

function fightIdOf(tf) { try { return (tf && tf.id) ? String(tf.id) : null; } catch (e) { return null; } }

function stackTop() {
  try {
    const st = (new Error('tbstarts-stack').stack || '').split('\n').slice(1);
    const kept = [];
    for (const line of st) {
      const t = line.trim();
      if (!t) continue;
      if (/tbstarts-diag/.test(t)) continue;
      const m = t.match(/\(([^)]+)\)/);
      let loc = m ? m[1] : t;
      loc = loc.replace(/^.*?(src\/js\/|scripts\/|scripts\/policies\/)/, '$1');
      kept.push(loc);
      if (kept.length >= 6) break;
    }
    return kept;
  } catch (e) { return []; }
}

function installTbstartsDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._tbstartsDiagStore === store && Game._tbstartsDiagInstalled) return Game._tbstartsDiagUninstall || function () {};
  const uninstalls = [];
  const wrap = (name, fn) => {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  };

  wrap('startCombat', (orig) => function () {
    const callIdx = store._callIdx++;
    let pre = null, preMon = null, preFight = null, preOutcomesLen = 0;
    try {
      preFight = this.tbfight || Game.tbfight || null;
      preMon = tileMonster(Game);
      preOutcomesLen = titanOutcomes(Game).length;
      pre = {
        arg: (arguments.length > 0 && arguments[0] != null) ? String(arguments[0]) : null,
        preId: fightIdOf(preFight), preOver: preFight ? !!preFight.over : null,
        preToken: nextToken(store, preFight),
        preFighters: fighterSummary(preFight),
        tileMon: monShape(Game, preMon),
        stack: stackTop(),
        titanMuster: titanMusterSnap(Game, (arguments.length > 0 && arguments[0] != null) ? String(arguments[0]) : null),
      };
    } catch (e) { noteErr(store, 'startCombat.pre', e); }
    let r;
    store._activeCall = callIdx;
    try { r = orig.apply(this, arguments); } catch (e) {
      try {
        pushCapped(store, 'throws', {
          day: dayOf(Game), callIdx: callIdx, arg: pre ? pre.arg : null, preId: pre ? pre.preId : null,
          tileMon: pre ? pre.tileMon : null, message: String((e && e.message) || e).slice(0, 120),
        });
      } catch (e2) { noteErr(store, 'startCombat.throw-record', e2); }
      store._activeCall = null;
      throw e;
    }
    store._activeCall = null;
    try {
      let tf = null;
      try { tf = this.tbfight || Game.tbfight || null; } catch (e) {}
      const postId = fightIdOf(tf);
      const postFighters = fighterSummary(tf);
      // REFUSED (core startCombat live-fight refusal): the same fight
      // object survives the call (token equality, not id equality —
      // direct-build person-fights carry no tbfight.id, and the
      // party wrapper may add allies to the live fight during the
      // refused call, so fighter lists need not match exactly).
      const refused = !!(pre && pre.preOver === false && pre.preToken !== null
        && nextToken(store, tf) === pre.preToken);
      const postOutcomes = titanOutcomes(Game);
      const newOutcomes = postOutcomes.slice(preOutcomesLen);
      pushCapped(store, 'starts', {
        day: dayOf(Game), callIdx: callIdx,
        arg: pre ? pre.arg : null,
        preId: pre ? pre.preId : null, preOver: pre ? pre.preOver : null,
        preToken: pre ? pre.preToken : null,
        preFighters: pre ? pre.preFighters : [],
        tileMon: pre ? pre.tileMon : null,
        stack: pre ? pre.stack : [],
        titanMuster: pre ? pre.titanMuster : null,
        postId: postId, postOver: tf ? !!tf.over : null,
        postToken: nextToken(store, tf),
        postFighters: postFighters,
        lifted: (preMon != null) ? !inWorld(Game, preMon) : null,
        worldOriginSet: !!(tf && tf.worldOrigin),
        worldOriginSeq: (tf && tf.worldOrigin) ? seqOf(tf.worldOrigin) : null,
        refused: refused,
        retNull: (r === null || r === undefined),
        retId: fightIdOf(r),
        newOutcomes: newOutcomes,
      });
    } catch (e) { noteErr(store, 'startCombat.post', e); }
    return r;
  });

  wrap('tbEnd', (orig) => function (result) {
    let pre = null;
    try {
      let tf = null;
      try { tf = this.tbfight || Game.tbfight || null; } catch (e) {}
      pre = { id: fightIdOf(tf), token: nextToken(store, tf), fighters: fighterSummary(tf) };
    } catch (e) { noteErr(store, 'tbEnd.pre', e); }
    const r = orig.apply(this, arguments);
    try {
      let tf = null;
      try { tf = this.tbfight || Game.tbfight || null; } catch (e) {}
      pushCapped(store, 'ends', {
        day: dayOf(Game),
        activeStart: store._activeCall,
        result: (result != null) ? String(result) : null,
        id: pre ? pre.id : null,
        token: pre ? pre.token : null,
        fighters: pre ? pre.fighters : [],
        postId: fightIdOf(tf),
      });
    } catch (e) { noteErr(store, 'tbEnd.post', e); }
    return r;
  });

  wrap('tbBarrierExit', (orig) => function () {
    let pre = null;
    try {
      let tf = null;
      try { tf = this.tbfight || Game.tbfight || null; } catch (e) {}
      pre = { id: fightIdOf(tf), token: nextToken(store, tf), over: tf ? !!tf.over : null, fighters: fighterSummary(tf) };
    } catch (e) { noteErr(store, 'tbBarrierExit.pre', e); }
    const r = orig.apply(this, arguments);
    try {
      let tf = null;
      try { tf = this.tbfight || Game.tbfight || null; } catch (e) {}
      const postId = fightIdOf(tf);
      if (pre && (pre.id || pre.token) && postId !== pre.id) {
        pushCapped(store, 'dissolves', {
          day: dayOf(Game), activeStart: store._activeCall,
          id: pre.id, token: pre.token, preOver: pre.over, fighters: pre.fighters,
          postId: postId, ret: (r === undefined) ? null : !!r,
        });
      }
    } catch (e) { noteErr(store, 'tbBarrierExit.post', e); }
    return r;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._tbstartsDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._tbstartsDiagStore = store;
    Game._tbstartsDiagInstalled = true;
    Game._tbstartsDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function snapshotTbstarts(Game, store) {
  try {
    let tf = null;
    try { tf = Game.tbfight || null; } catch (e) {}
    pushCapped(store, 'daily', {
      day: dayOf(Game), fightId: fightIdOf(tf),
      over: tf ? !!tf.over : null, result: tf ? (tf.result || null) : null,
      fighterKinds: fighterSummary(tf).map(f => f.kind),
    });
  } catch (e) { noteErr(store, 'snapshot', e); }
}

function withTbstartsDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installTbstartsDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._tbstarts = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
        try { snapshotTbstarts(Game, st); } catch (e) { noteErr(st, 'daily.snapshot', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installTbstartsDiag, withTbstartsDiag, snapshotTbstarts, MAX_EVENTS };
