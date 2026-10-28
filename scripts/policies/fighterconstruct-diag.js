// fighterconstruct-diag — TB fighter-construction recorder for
// sim-fighterconstruct-a (flesh-out loop, axis scale-onramp,
// 2026-10-28, DIAG ONLY: zero src/js changes, policy-side only).
//
// QUESTION (the w4tbhp-a footnote, backlog #1301): two wave-4 TB
// fights start their monster fighter below max (75102 d166 audit
// 1140/1211, 75106 d143 audit 1268/1298), pre-wound2 as well as
// post, with deficits that do not track the world wound. The
// nonworldkill recorder snapshots fighters AFTER startCombat
// returns — but startCombat's tail runs OPENING TURNS inside the
// same call (game.js: turnIdx = -1, tbBeginTurn, then tbAdvance
// in node until the player's turn lands). This recorder therefore
// captures the two moments the start snapshot conflates:
//   (a) the CONSTRUCTION snapshot: fighters + turn order at the
//       FIRST tbAdvance entry inside a startCombat call — after
//       fighter creation and batch-2 init, before any AI turn
//       acts (startCombat builds every monster fighter with
//       hp == maxHp, so a construction snapshot below max would
//       itself name a construction input);
//   (b) every tbDamage event DURING that startCombat call, with
//       the target fighter's HP before and after the call and
//       the returned landed damage, so opening-turn damage can
//       be summed against the start deficit exactly.
// It also records a post-start snapshot (same moment as the
// nonworldkill post-record) so the join can be checked
// directly instead of trusting two recorders' clocks.
//
// OBSERVATIONAL ONLY. FIGHTERCONSTRUCT=1 is the only on-switch.
// Unset it delegates byte-identically: no wraps installed, no
// ctx surface, no record. The wraps record AFTER delegating for
// tbDamage (pre/post HP around the call) and at tbAdvance entry
// (a pure read), write nothing to game state (store arrays only,
// plus the same installed-flag class the other recorders use),
// draw no RNG, never throw into the engine (recording errors
// are counted), and return the original value untouched.
// tbDamage's intercept recursion ('player' alias) is recorded
// like any other call; events whose target resolves to no
// fighter carry null HPs and contribute nothing to any sum.
'use strict';

const MAX_EVENTS = 20000;

function layerOn() { try { return process.env.FIGHTERCONSTRUCT === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return {
    constructions: [], openingDamage: [], postStarts: [],
    errs: 0, errors: [],
    overflow: { constructions: 0, openingDamage: 0, postStarts: 0 },
    installed: false, frames: [],
  };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function pushCapped(store, list, item) {
  if (store[list].length >= MAX_EVENTS) { store.overflow[list]++; return false; }
  store[list].push(item);
  return true;
}

function snapFighters(Game) {
  try {
    const f = Game.tbfight;
    if (!f) return { fightId: null, round: null, order: null, fighters: [] };
    return {
      fightId: f.id || null, round: (f.round == null) ? null : (f.round | 0),
      order: Array.isArray(f.order) ? f.order.slice() : null,
      fighters: (f.fighters || []).map(x => (x ? {
        key: x.key || null, kind: x.kind || null,
        monsterId: x.monsterId || (x.mdef && x.mdef.id) || null,
        villagerId: x.villagerId || null, hp: roundHp(x.hp), maxHp: roundHp(x.maxHp),
        speed: (x.speed == null) ? null : x.speed,
        alive: (x.alive === undefined) ? null : !!x.alive,
        fled: (x.fled === undefined) ? null : !!x.fled,
      } : null)),
    };
  } catch (e) { return { fightId: null, round: null, order: null, fighters: [], snapError: String((e && e.message) || e).slice(0, 120) }; }
}

function fighterHp(Game, key) {
  try {
    const f = (typeof Game.tbFighter === 'function') ? Game.tbFighter(key) : null;
    return f ? { hp: roundHp(f.hp), maxHp: roundHp(f.maxHp), kind: f.kind || null,
      monsterId: f.monsterId || (f.mdef && f.mdef.id) || null, villagerId: f.villagerId || null } : null;
  } catch (e) { return null; }
}

function installFighterconstructDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._fighterconstructDiagStore === store && Game._fighterconstructDiagInstalled) return Game._fighterconstructDiagUninstall || function () {};
  const uninstalls = [];
  function wrap(name, fn) {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  }

  // Depth frames: startCombat is refused while a fight is live, so
  // frames never nest in practice, but a stack is used anyway so a
  // nested call can never leak a snapshot into the wrong fight.
  wrap('startCombat', (orig) => function (monsterId, options) {
    const frame = { snapshotted: false, fightId: null, day: null };
    try { frame.day = dayOf(Game); } catch (e) { /* day best-effort */ }
    store.frames.push(frame);
    let result, threw = null;
    try { result = orig.apply(this, arguments); }
    catch (e) { threw = e; }
    try {
      const post = snapFighters(Game);
      if (!post.fightId && frame.fightId) post.fightId = frame.fightId;
      pushCapped(store, 'postStarts', {
        day: frame.day, arg: (monsterId === undefined || monsterId === null) ? null : String(monsterId),
        fightId: post.fightId, endedInCall: !Game.tbfight,
        threw: threw ? String((threw && threw.message) || threw).slice(0, 160) : null,
        fighters: post.fighters, order: post.order,
      });
    } catch (e) { noteErr(store, 'start.post', e); }
    try { store.frames.pop(); } catch (e) { /* frame pop best-effort */ }
    if (threw) throw threw;
    return result;
  });

  wrap('tbAdvance', (orig) => function () {
    try {
      const frame = store.frames.length ? store.frames[store.frames.length - 1] : null;
      if (frame && !frame.snapshotted && Game.tbfight) {
        const snap = snapFighters(Game);
        frame.snapshotted = true;
        frame.fightId = snap.fightId;
        pushCapped(store, 'constructions', {
          day: frame.day, fightId: snap.fightId, round: snap.round,
          order: snap.order, fighters: snap.fighters,
        });
      }
    } catch (e) { noteErr(store, 'advance.snap', e); }
    return orig.apply(this, arguments);
  });

  wrap('tbDamage', (orig) => function (targetKey, dmg, sourceLabel, sourceKey, opts) {
    const frame = store.frames.length ? store.frames[store.frames.length - 1] : null;
    if (!frame) return orig.apply(this, arguments);
    let pre = null;
    try { pre = fighterHp(Game, targetKey); } catch (e) { /* pre best-effort */ }
    const result = orig.apply(this, arguments);
    try {
      const post = fighterHp(Game, targetKey);
      pushCapped(store, 'openingDamage', {
        day: frame.day, fightId: frame.fightId,
        targetKey: (targetKey === undefined || targetKey === null) ? null : String(targetKey),
        targetKind: pre ? pre.kind : (post ? post.kind : null),
        targetMonsterId: pre ? pre.monsterId : (post ? post.monsterId : null),
        targetVillagerId: pre ? pre.villagerId : (post ? post.villagerId : null),
        sourceLabel: (sourceLabel === undefined || sourceLabel === null) ? null : String(sourceLabel),
        sourceKey: (sourceKey === undefined || sourceKey === null) ? null : String(sourceKey),
        asked: (dmg == null) ? null : dmg,
        preHp: pre ? pre.hp : null, preMaxHp: pre ? pre.maxHp : null,
        postHp: post ? post.hp : null, postMaxHp: post ? post.maxHp : null,
        returned: (typeof result === 'number' && isFinite(result)) ? result : null,
      });
    } catch (e) { noteErr(store, 'damage.rec', e); }
    return result;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._fighterconstructDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._fighterconstructDiagStore = store;
    Game._fighterconstructDiagInstalled = true;
    Game._fighterconstructDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withFighterconstructDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installFighterconstructDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._fighterconstruct = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installFighterconstructDiag, withFighterconstructDiag, MAX_EVENTS };
