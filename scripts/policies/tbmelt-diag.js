// tbmelt-diag — TB bystander-melt recorder for sim-tbmelt-a
// (2026-10-25/26, flesh-out loop, axis scale-onramp, backlog #1054.
// DIAG ONLY: zero src/js changes, policy-side only.)
//
// QUESTION (from sim-nonworldkill-a): a TB fight about monster X,
// started while unrelated world monster Y sits on the player tile,
// lifts Y; unless Y is lingering/titan, tbEnd never restores it, so
// Y melts unfought. This recorder censuses that melt: for EVERY
// startCombat call with a world monster on the player tile, it
// records the lifted monster (the "lift"), and at tbEnd records
// whether that monster is back in the world (RESTORED) or gone
// (MELTED), joined by fight id.
//
// MECHANISM, READ FROM CODE (never invented):
//   - startCombat (game.js): _origin = playerMonster() (tableTrial
//     excepted); removeWorldMonster(_origin); if (_origin.titan
//     || _origin.lingering) tbfight.worldOrigin = _origin. Only a
//     titan/lingering origin is ever restored.
//   - tbEnd (game.js): worldOrigin is restored only when result
//     !== 'won'; a lingerer only on 'fled'/'lost'; a titan on any
//     non-won result if still standing. The restore pushes the SAME
//     object back, so identity (worldMonsters().includes(ref)) is
//     the primary restore test; id+spawnSeq is the fallback.
//   - For a MISMATCH lift, the bystander is not a fighter, so the
//     restore's "still standing" check is vacuously true: a
//     titan/lingering bystander IS restored on a non-won fight and
//     melts on a won fight like anything else.
//   - For a WORLD-ORIGIN lift, the lifted monster IS the fought
//     monster: dead fighter = KILL (not a melt); surviving fighter
//     + not restored = fought-monster melt (counted separately).
//   - The pre-tile monster is read from Game.worldMonsters() by
//     tile (tx,ty) == (map.px,map.py) — a pure read, never
//     playerMonster() (which can adopt a detached alias and would
//     mutate state on a refused call). Same rule as nonworldkill.
//   - Refused calls (a fight already live at pre-record) and
//     thrown calls lift nothing and are recorded as such, never
//     in the melt denominator.
//   - Same-call routed fights (startCombat routes the fight inside
//     the call; tbEnd nulls tbfight at its tail): the tbEnd for
//     such a fight runs BEFORE the start wrapper's post-record.
//     The recorder therefore tracks a pending stack: the start
//     pre-record pushes a pending lift; a tbEnd whose fight has a
//     pending lift adopts that lift's fightId from tbfight.id at
//     tbEnd pre-time; the start post-record then adopts the same
//     id. Joining is by fightId in the analyzer, never by order.
//
// OBSERVATIONAL ONLY. TBMELT=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx surface,
// no record. The wraps record AFTER delegating where it matters,
// write nothing to game state (store arrays only, plus the same
// installed-flag class the other recorders use), draw no RNG,
// never throw into the engine (a startCombat throw from the
// engine itself is recorded and RETHROWN unchanged), and return
// the original value untouched. Monster OBJECT references are
// kept in a module-side WeakMap keyed by store — never inside
// the serialized store — so JSON.stringify of a sweep row cannot
// drag a world object (or a cycle) into the corpus.
'use strict';

const MAX_EVENTS = 20000;

// Internal (never serialized): pending lifts + object refs per store.
const INTERNALS = new WeakMap();
function internalsOf(store) {
  let it = INTERNALS.get(store);
  if (!it) { it = { pending: [], refs: new Map(), nextLiftId: 1, endedLiftIds: new Set() }; INTERNALS.set(store, it); }
  return it;
}

function layerOn() { try { return process.env.TBMELT === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return { lifts: [], ends: [], errs: 0, errors: [], overflow: { lifts: 0, ends: 0 }, installed: false };
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

function stackInfo() {
  const names = [], lines = [];
  try {
    const st = (new Error()).stack || '';
    for (const line of st.split('\n')) {
      const t = line.trim();
      if (!t || t.indexOf('stackInfo') >= 0) continue;
      if (lines.length < 5) lines.push(t.slice(0, 180));
      const m = t.match(/at\s+(?:Object\.)?([A-Za-z_$][\w$]*)/);
      if (m) {
        const fn = m[1];
        if (fn === 'Error') continue;
        if (names.indexOf(fn) < 0) names.push(fn);
      }
      if (names.length >= 10) break;
    }
  } catch (e) { /* stack capture must never throw */ }
  return { names: names.join(','), lines: lines };
}

function tileMonsterSnap(tile, Game) {
  if (!tile) return null;
  let wave = null;
  try {
    const def = ((Game.data && Game.data.monsters) || []).find(d => d && d.id === tile.id);
    if (def) wave = def.wave | 0;
  } catch (e) { /* wave best-effort */ }
  return {
    id: tile.id || null, seq: (tile._spawnSeq != null ? tile._spawnSeq : null),
    src: tile._spawnsrc || null, hp: roundHp(tile.hp), maxHp: roundHp(tile.maxHp),
    titan: !!tile.titan, lingering: !!tile.lingering,
    veteran: !!tile.veteran, veteranVariant: tile.veteranVariant || null,
    wave: wave,
  };
}

function installTbmeltDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._tbmeltDiagStore === store && Game._tbmeltDiagInstalled) return Game._tbmeltDiagUninstall || function () {};
  const it = internalsOf(store);
  const uninstalls = [];
  function wrap(name, fn) {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  }

  wrap('startCombat', (orig) => function (monsterId, options) {
    // Pre-record: the tile monster BEFORE any lift. This pending
    // lift is what a same-call tbEnd adopts (see header).
    let pending = null;
    try {
      const s = (Game.state && Game.state.scholar) || {};
      const pre = {};
      pre.day = dayOf(Game);
      pre.arg = (monsterId === undefined || monsterId === null) ? null : String(monsterId);
      pre.tableTrial = !!(monsterId === 'finale' && options && options.tableTrial);
      pre.liveFight = !!(Game.tbfight && !Game.tbfight.over);
      pre.preFightId = (Game.tbfight && Game.tbfight.id) || null;
      pre.pendingEncounter = !!Game.pendingEncounter;
      pre.pendingMonsterId = (Game.pendingMonsterId === undefined || Game.pendingMonsterId === null) ? null : String(Game.pendingMonsterId);
      pre.pendingInTent = !!Game.pendingInTent;
      const fd = s.feastDraw || null;
      pre.feastDraw = fd ? { monsterId: (fd.monsterId || null), veteran: !!fd.veteran, day: fd.day || 0 } : null;
      pre.tentBreach = !!Game._tentBreachSpawn;
      pre.tentBreachAt = Game._tentBreachSpawn ? { mx: Game._tentBreachSpawn.mx, my: Game._tentBreachSpawn.my } : null;
      const ac = (Game.state && Game.state.arenaContest) || null;
      pre.arenaContest = ac ? { contestId: ac.contestId || null, waves: Array.isArray(ac.waves) ? ac.waves.slice() : null, waveIdx: ac.waveIdx | 0 } : null;
      pre.activeContestArena = !!((Game.state || {}).activeContest && Game.state.activeContest.arenaSuspended);
      const dw = (Game.state || {}).doorFledMonsters;
      pre.doorFled = Array.isArray(dw) ? dw.map(w => (w && w.id) ? String(w.id) : null) : null;
      let px = null, py = null;
      try { px = Game.map.px; py = Game.map.py; } catch (e) { /* tile best-effort */ }
      pre.playerTile = (px != null && py != null) ? [px, py] : null;
      let tile = null;
      try {
        const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
        tile = list.find(m => m && m.tx === px && m.ty === py) || null;
      } catch (e) { /* tile monster best-effort */ }
      pre.tileMonster = tileMonsterSnap(tile, Game);
      const si = stackInfo();
      pre.stack = si.names; pre.stackLines = si.lines;
      pending = { pre: pre, tileRef: tile || null };
      it.pending.push(pending);
    } catch (e) { noteErr(store, 'start.pre', e); }
    let result, threw = null;
    try { result = orig.apply(this, arguments); }
    catch (e) { threw = e; }
    try {
      if (pending) {
        // Remove exactly this pending entry (reentrancy-safe).
        const idx = it.pending.indexOf(pending);
        if (idx >= 0) it.pending.splice(idx, 1);
        const pre = pending.pre;
        let fightId = null, fighters = null, fightIdSource = 'tbfight';
        try {
          const f = Game.tbfight;
          if (f && !pre.liveFight) {
            fightId = f.id || null;
            fighters = (f.fighters || []).map(x => x ? {
              key: x.key || null, kind: x.kind || null,
              monsterId: x.monsterId || (x.mdef && x.mdef.id) || null,
              villagerId: x.villagerId || null, hp: roundHp(x.hp), maxHp: roundHp(x.maxHp),
              alive: !!x.alive, fled: !!x.fled,
            } : null);
          } else if (!f && !pre.liveFight) {
            // Same-call start-and-end: the tbEnd inside this call
            // adopted this pending lift's fightId at tbEnd pre.
            if (pending.fightId) { fightId = pending.fightId; fightIdSource = 'end-row'; }
          }
        } catch (e) { noteErr(store, 'start.post.fighters', e); }
        let mid = null;
        if (fighters && fighters.length) {
          const mf = fighters.find(x => x && x.kind === 'monster');
          mid = mf ? mf.monsterId : null;
        }
        // Mid fallback (adopted fights have no live fighters): the
        // engine rule arg || pendingMonsterId || 'bulldozer' is
        // recorded, never guessed from fighters alone.
        if (!mid && !pre.liveFight && !threw) {
          mid = pre.arg || pre.pendingMonsterId || null;
          if (mid) fightIdSource = fightIdSource + '+argmid';
        }
        let wave = null;
        if (mid) {
          try {
            const def = ((Game.data && Game.data.monsters) || []).find(d => d && d.id === mid);
            if (def) wave = def.wave | 0;
          } catch (e) { /* wave best-effort */ }
        }
        let origin = null;
        if (pre.tileMonster && mid) origin = (pre.tileMonster.id === mid) ? 'world-origin' : 'world-origin-mismatch';
        else if (pre.tileMonster && !mid) origin = 'world-origin-unresolved';
        else origin = 'null-origin';
        const lifted = !!pre.tileMonster && !pre.liveFight && !threw && !pre.tableTrial;
        const liftId = lifted ? it.nextLiftId++ : null;
        const endVerdict = pending.endVerdict || null;
        if (lifted) it.refs.set(liftId, pending.tileRef);
        pushCapped(store, 'lifts', {
          liftId: liftId, day: pre.day, arg: pre.arg, mid: mid, wave: wave,
          tableTrial: !!pre.tableTrial, refused: !!pre.liveFight,
          threw: threw ? String((threw && threw.message) || threw).slice(0, 160) : null,
          fightId: fightId, fightIdSource: fightIdSource, origin: origin,
          lifted: lifted, tileMonster: pre.tileMonster, playerTile: pre.playerTile,
          pendingEncounter: !!pre.pendingEncounter, pendingMonsterId: pre.pendingMonsterId,
          pendingInTent: !!pre.pendingInTent, feastDraw: pre.feastDraw,
          tentBreach: !!pre.tentBreach, tentBreachAt: pre.tentBreachAt,
          arenaContest: pre.arenaContest, activeContestArena: !!pre.activeContestArena,
          doorFled: pre.doorFled, stack: pre.stack || '', stackLines: pre.stackLines || [],
          fighters: fighters,
          endVerdict: endVerdict,
        });
        // If a tbEnd already ran for this fight (adopted case), its
        // end row carries liftId null (pending had no liftId yet);
        // patch it now so the analyzer joins by liftId as well.
        if (lifted && fightId) {
          try {
            for (let i = store.ends.length - 1; i >= 0; i--) {
              const er = store.ends[i];
              if (er && er.fightId === fightId && er.liftId == null && er.adoptedPending) { er.liftId = liftId; break; }
            }
          } catch (e) { /* patch best-effort */ }
        }
      }
    } catch (e) { noteErr(store, 'start.rec', e); }
    if (threw) throw threw;
    return result;
  });

  wrap('tbEnd', (orig) => function (result) {
    let fightId = null, lift = null, liftedFighter = null, worldOriginAtPre = null;
    try {
      const f = Game.tbfight;
      fightId = f ? (f.id || null) : null;
      try { worldOriginAtPre = (f && f.worldOrigin) ? { id: f.worldOrigin.id || null, titan: !!f.worldOrigin.titan, lingering: !!f.worldOrigin.lingering } : null; } catch (e) { /* best-effort */ }
      // Find the lift for this fight: a pending start (adopted
      // case — the fight started AND ends inside one startCombat
      // call) takes precedence; otherwise the last completed lift
      // with this fightId and no end yet.
      if (it.pending.length) {
        const pend = it.pending[it.pending.length - 1];
        if (pend && pend.pre && !pend.pre.liveFight) {
          lift = pend;
          if (fightId) pend.fightId = fightId;
        }
      }
      if (!lift && fightId) {
        // Match ANY start row with this fightId, lifted or not: a
        // null-origin fight has a start row but lifts nothing, and
        // its end is NOT direct-build. (First version matched only
        // lifted rows and mislabeled all 40 null-origin ends as
        // direct-build — caught by the corpus cross-check against
        // nonworldkill's 2 true direct-build ends.)
        for (let i = store.lifts.length - 1; i >= 0; i--) {
          const l = store.lifts[i];
          if (l && l.fightId === fightId && (l.liftId == null || !it.endedLiftIds.has(l.liftId))) { lift = l; break; }
        }
      }
      // Fighter state for the lifted monster BEFORE tbEnd clears it.
      if (lift && f && Array.isArray(f.fighters)) {
        const tid = lift.pre ? (lift.pre.tileMonster && lift.pre.tileMonster.id) : (lift.tileMonster && lift.tileMonster.id);
        const mf = f.fighters.find(x => x && x.kind === 'monster' && ((x.monsterId || (x.mdef && x.mdef.id)) === tid));
        if (mf) liftedFighter = { monsterId: mf.monsterId || (mf.mdef && mf.mdef.id) || null, alive: !!mf.alive, fled: !!mf.fled, hp: roundHp(mf.hp), maxHp: roundHp(mf.maxHp) };
      }
    } catch (e) { noteErr(store, 'tbEnd.pre', e); }
    const r = orig.apply(this, arguments);
    try {
      let restored = null, restoredVia = null, postWorldHas = null;
      let liftId = null, adoptedPending = false;
      if (lift) {
        if (lift.pre) {
          // Adopted case: the lift row is not written yet (the
          // start post-record runs after this tbEnd returns). The
          // end row is patched with the liftId then; mark it so.
          liftId = null; adoptedPending = true;
        } else {
          liftId = lift.liftId;
          // Never add a null liftId: null-origin rows all share
          // liftId null, and one null in the set would poison every
          // later null-origin lookup into a false direct-build
          // (caught on the re-run corpus: the d115 strike end
          // mislabeled direct-build). Null-origin rows are matched
          // by fightId, which is unique per fight, so no ended-set
          // entry is needed for them.
          if (liftId != null) it.endedLiftIds.add(liftId);
        }
        try {
          const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
          const ref = lift.pre ? lift.tileRef : it.refs.get(liftId);
          const tileSnap = lift.pre ? lift.pre.tileMonster : lift.tileMonster;
          if (ref && list.indexOf(ref) >= 0) { restored = true; restoredVia = 'identity'; postWorldHas = true; }
          else if (tileSnap && tileSnap.id) {
            const byIdSeq = list.find(m => m && m.id === tileSnap.id && (tileSnap.seq == null || m._spawnSeq === tileSnap.seq));
            if (byIdSeq) { restored = true; restoredVia = 'id+seq'; postWorldHas = true; }
            else { restored = false; postWorldHas = false; }
          } else { restored = false; postWorldHas = false; }
        } catch (e) { noteErr(store, 'tbEnd.post.world', e); restored = null; }
        if (lift.pre) {
          // Stash the restore verdict on the pending lift so the
          // start post-record can carry it into the lift row.
          lift.endVerdict = { restored: restored, restoredVia: restoredVia, result: (result === undefined || result === null) ? null : String(result) };
        }
      }
      pushCapped(store, 'ends', {
        day: dayOf(Game), fightId: fightId, result: (result === undefined || result === null) ? null : String(result),
        liftId: liftId, adoptedPending: adoptedPending, directBuild: !lift,
        restored: restored, restoredVia: restoredVia, postWorldHas: postWorldHas,
        worldOriginAtPre: worldOriginAtPre, liftedFighter: liftedFighter,
      });
    } catch (e) { noteErr(store, 'tbEnd.rec', e); }
    return r;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._tbmeltDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._tbmeltDiagStore = store;
    Game._tbmeltDiagInstalled = true;
    Game._tbmeltDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withTbmeltDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installTbmeltDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._tbmelt = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installTbmeltDiag, withTbmeltDiag, MAX_EVENTS };
