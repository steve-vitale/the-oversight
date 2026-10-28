// fieldfeed-diag — field-party feed recorder (sim-fieldfeed-a,
// 2026-10-28, flesh-out loop, axis scale-onramp, DIAG ONLY: zero
// src/js changes, policy-side recorder only).
//
// QUESTION (from the 1528Z run, same band): wild meetings never see
// the party standing on the tile — 24/24 judged wave-4 field meetings
// were NO-CREW:RAW-EMPTY, formed 0, tile-could-form 14/24. This arm
// feeds present villagers into the wild/patrol routers (party-wiring
// presentFightAllies: villagerFightAllies filtered to earshot of the
// fighter's node). Per fieldFight, at fight start, this recorder
// captures: the fed allies (opts.allies / opts.allyVids — the
// engine's truth), the EARSHOT lens (living roster villagers on or
// adjacent to the fighter's node, Chebyshev <= 1, with trust per
// candidate — the feed's own input), the legacy crew lens and tile
// lens for contrast (as the 1528Z recorder did), gear per person
// (the waveCombatReadiness(4) read), village-wide armed counts, and
// the fight record (intent, calledHelp, allyVid, outcome) plus the
// fight log for wave-4 judged-channel meetings (sense reading).
// All lenses are pure nodePos reads, never npcNode() (which CREATES
// a default nodePos entry and would mutate game state); villagers
// with no nodePos entry are UNKNOWN, counted separately, never
// assumed on or off a node.
//
// MECHANISM, READ FROM CODE (never invented):
//   - party-wiring.js villagerFightAllies(vid): crew (live
//     assignments + _outdoorCrew snapshot) first, then earshot
//     (same/adjacent node, Chebyshev <= 1), trust >= 15, cap 2,
//     excludes self and the player. Called only by expeditionMonster
//     before this arm.
//   - party-wiring.js presentFightAllies(vid) (THIS ARM): the same
//     list filtered to earshot of the fighter's node — the wild /
//     patrol feed. Raid defense (opts.raid) and aid-crisis fights
//     keep the legacy crew-only feed.
//   - game.js villagerMonsterTick: per world monster, at most ONE npc
//     from npcsOnNode(tile) is picked per worldTick, and only with
//     probability 0.5 — co-located villagers meet one at a time.
//   - fieldFights.js fieldFight: at most ONE ally ever joins (shift
//     once; helpCalled guard). From-start join requires
//     opts.allyFromStart (set only by aidFight, lingering raider
//     during an aid crisis). The hopeless shout requires hopeless
//     trajectory AND allies > 0 AND intent !== 'learn'; a learn-intent
//     villager withdraws at round >= 3 before the shout can fire.
//     Intent is 'engage' iff trick known OR allies > 0, else 'learn'.
//   - havenGrowth.js lingererSortie is a deliberate muster, NOT a
//     meeting — recorded (caller 'sortie') for contrast, excluded
//     from the judged set by the analyzer.
//
// OBSERVATIONAL ONLY. FIELDFEED=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx surface,
// no record. Wraps record AFTER delegating (fieldFight pre-reads
// are pure state reads taken before the call, never writes), write
// nothing to game state (the advancePart wrap increments only the
// recorder's OWN part counter, never game state), draw no RNG,
// never throw into the engine (recording errors are counted, and
// an engine throw is recorded and RETHROWN unchanged), and return
// the original value untouched. Installed FIRST at sweep setup (as
// wave4demand-diag was) so other recorders' caller classification
// sees the same stack shape.
'use strict';

const MAX_EVENTS = 60000;

function layerOn() { try { return process.env.FIELDFEED === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }

function newStore() {
  return { meetings: [], partCounter: 0, errs: 0, errors: [], overflow: {}, installed: false };
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

function seqOf(m) {
  try { return (m && m._spawnSeq != null) ? m._spawnSeq : null; } catch (e) { return null; }
}
function waveOf(Game, m) {
  try {
    if (m && m.id && typeof Game.crisisWaveOf === 'function') {
      const w = Game.crisisWaveOf(m) | 0;
      if (w) return w;
    }
  } catch (e) { /* fall through */ }
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === (m && m.id));
    if (def && (def.wave | 0)) return def.wave | 0;
  } catch (e) { /* fall through */ }
  return 1;
}

// Caller classification from the Error stack at wrap entry.
// Same classifier as w4damage-diag / wave4demand-diag (order matters:
// aid before resolve; sortie/patrol call fieldFight directly).
function classifyCaller() {
  let stack = '';
  try { stack = (new Error()).stack || ''; } catch (e) { stack = ''; }
  const names = [];
  try {
    for (const line of stack.split('\n')) {
      const m = line.match(/at\s+(?:Object\.)?([A-Za-z_$][\w$]*)/);
      if (m && names.indexOf(m[1]) < 0) names.push(m[1]);
    }
  } catch (e) { /* names best-effort */ }
  let cls = 'other';
  if (names.indexOf('lingererSortie') >= 0) cls = 'sortie';
  else if (names.indexOf('resolvePatrol') >= 0) cls = 'patrol';
  else if (names.indexOf('aidFight') >= 0) cls = 'aid';
  else if (names.indexOf('resolveWildMonsterEncounter') >= 0) cls = 'resolve';
  return { cls: cls, stack: names.slice(0, 20).join(','), expedition: /expedition/i.test(stack) };
}

function resolveEquipment() {
  try {
    const gt = (typeof globalThis !== 'undefined') ? globalThis : {};
    if (gt.Scattering && gt.Scattering.equipment && gt.Scattering.equipment.armorOf) return gt.Scattering.equipment;
    if (gt.S && gt.S.equipment && gt.S.equipment.armorOf) return gt.S.equipment;
    if (gt.Scattering && gt.Scattering.S && gt.Scattering.S.equipment && gt.Scattering.S.equipment.armorOf) return gt.Scattering.S.equipment;
  } catch (e) { /* fall through */ }
  return null;
}

// Gear for one participant, mirroring waveCombatReadiness(4)
// exactly (copied from wave4demand-diag, same reads).
function gearOfVid(Game, vid) {
  const out = { vid: vid != null ? String(vid) : null, isScholar: null, armed: null, armorP: null, veteranW3: null };
  try {
    const scholarId = Game.villagerId;
    const isScholar = (vid === scholarId || vid === 'player');
    out.isScholar = isScholar;
    const itemDefs = (Game.data && Game.data.items) || [];
    const carriesWeapon = (items) => {
      for (const e of (items || [])) {
        const iid = (typeof e === 'string') ? e : (e && (e.itemId || e.id));
        if (!iid) continue;
        const def = itemDefs.find(d => d && d.id === iid);
        if (def && def.weapon) return true;
      }
      return false;
    };
    if (isScholar) {
      try { out.armorP = (typeof Game.armorBonus === 'function') ? (Game.armorBonus() | 0) : null; } catch (e) { out.armorP = null; }
      let wp = false, wpKnown = false;
      try { const ew = (typeof Game.equippedWeapon === 'function') ? Game.equippedWeapon() : null; wp = !!(ew && !ew.unarmed); wpKnown = true; } catch (e) { wpKnown = false; }
      if (!wp) { try { wp = carriesWeapon((Game.state && Game.state.scholar && Game.state.scholar.inventory) || []); wpKnown = true; } catch (e) { /* keep */ } }
      out.armed = wpKnown ? wp : null;
    } else {
      const eq = resolveEquipment();
      let vp = null;
      try { vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null; } catch (e) { vp = null; }
      if (!vp || !eq) { out.armed = null; out.armorP = null; }
      else {
        try { out.armorP = (eq.armorOf(vp, itemDefs) || 0) | 0; } catch (e) { out.armorP = null; }
        let wp = false;
        try { wp = !!((typeof eq.meleeWeaponOf === 'function' && eq.meleeWeaponOf(vp)) || (typeof eq.rangedWeaponOf === 'function' && eq.rangedWeaponOf(vp))); } catch (e) { wp = false; }
        if (!wp) { try { wp = carriesWeapon(vp.items); } catch (e) { wp = false; } }
        out.armed = wp;
      }
    }
    try {
      const log = (Game.state && Game.state.waveKillLog) || [];
      const keys = isScholar ? [vid, scholarId, 'player'] : [vid];
      out.veteranW3 = log.some(e => e && keys.indexOf(e.by) >= 0 && ((e.w | 0) >= 3));
    } catch (e) { out.veteranW3 = null; }
  } catch (e) { /* nulls stand */ }
  return out;
}

// Known-dead test, pure reads only. null = unknown (kept, flagged).
function deadKnown(Game, vid) {
  try {
    if (vid === Game.villagerId) return false; // scholar living by definition at fight time
    if (typeof Game.getPerson === 'function') {
      const p = Game.getPerson(vid);
      if (p && typeof p.dead !== 'undefined') return !!p.dead;
    }
    if (typeof Game.vpOf === 'function') {
      const vp = Game.vpOf(vid);
      if (vp && typeof vp.dead !== 'undefined') return !!vp.dead;
    }
  } catch (e) { /* unknown */ }
  return null;
}

function installFieldfeedDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._fieldfeedDiagStore === store && Game._fieldfeedDiagInstalled) return Game._fieldfeedDiagUninstall || function () {};
  const uninstalls = [];
  let raidDepth = 0;
  const wrap = (name, fn) => {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  };

  // Day-part counter: recorder-owned only, never game state.
  wrap('advancePart', (orig) => function () {
    const r = orig.apply(this, arguments);
    try { store.partCounter++; } catch (e) { noteErr(store, 'advancePart.counter', e); }
    return r;
  });

  // Raid depth flag only (raid calls reach fieldFight via resolveWild
  // with opts.raid; the depth flag is the belt-and-braces channel read).
  wrap('havenRaidTick', (orig) => function () {
    raidDepth++;
    try { return orig.apply(this, arguments); }
    finally { raidDepth--; }
  });

  wrap('fieldFight', (orig) => function (vid, mdef, m, opts) {
    const caller = classifyCaller();
    const inRaid = raidDepth > 0;
    let pre = null;
    try {
      const live = m || null;
      const defObj = mdef || null;
      const seq = seqOf(live) != null ? seqOf(live) : seqOf(defObj);
      const mid = (live && live.id) || (defObj && defObj.id) || null;
      const wave = waveOf(Game, live || defObj);
      const allyVids = (opts && Array.isArray(opts.allyVids)) ? opts.allyVids.slice() : [];
      const leader = gearOfVid(Game, vid);
      // CREW lens: the engine's own input, read verbatim.
      const crewRaw = Array.isArray(Game._outdoorCrew) ? Game._outdoorCrew.slice() : [];
      const roster = ((Game.state && Game.state.village && Game.state.village.roster) || []).slice();
      const assignments = ((Game.state && Game.state.village && Game.state.village.assignments) || {});
      const nodePos = ((Game.state && Game.state.village && Game.state.village.nodePos) || {});
      const mTile = (live && typeof live.tx === 'number' && typeof live.ty === 'number')
        ? { tx: live.tx, ty: live.ty } : null;
      const crew = crewRaw.filter(v => v !== vid && roster.indexOf(v) >= 0).map(v => {
        const g = gearOfVid(Game, v);
        const np = nodePos[v] || null;
        return {
          vid: String(v), armed: g.armed, armorP: g.armorP, veteranW3: g.veteranW3,
          deadKnown: deadKnown(Game, v),
          assignmentTask: (assignments[v] && assignments[v].task) || null,
          node: np ? { nx: np.nx, ny: np.ny } : null,
          sameTileAsMonster: !!(mTile && np && np.nx === mTile.tx && np.ny === mTile.ty),
        };
      });
      // TILE lens: pure nodePos read only — never npcNode() (it creates
      // default entries). Villagers with no nodePos entry are UNKNOWN,
      // counted separately, never assumed on or off the tile.
      let tileUnknown = 0;
      const tile = [];
      for (const v of roster) {
        if (v === vid) continue;
        const np = nodePos[v];
        if (!np) { tileUnknown++; continue; }
        if (mTile && np.nx === mTile.tx && np.ny === mTile.ty) {
          const g = gearOfVid(Game, v);
          tile.push({
            vid: String(v), armed: g.armed, armorP: g.armorP, veteranW3: g.veteranW3,
            deadKnown: deadKnown(Game, v),
            assignmentTask: (assignments[v] && assignments[v].task) || null,
            inCrewRaw: crewRaw.indexOf(v) >= 0,
          });
        }
      }
      // EARSHOT lens (the feed's own input): living roster villagers
      // on or adjacent to the FIGHTER's node (Chebyshev <= 1), pure
      // nodePos reads only. The fighter's node is nodePos[vid]; if
      // the fighter has no entry, earshot is UNKNOWN (null), never
      // guessed. Trust per candidate is the village trust map value
      // (default 10, the villagerFightAllies floor read).
      let earshotUnknown = 0;
      const earshot = [];
      let fighterNode = null;
      try {
        const fnp = nodePos[vid];
        if (fnp && typeof fnp.nx === 'number' && typeof fnp.ny === 'number') fighterNode = { nx: fnp.nx, ny: fnp.ny };
      } catch (e) { fighterNode = null; }
      if (!fighterNode) { earshotUnknown = -1; }
      else {
        let trustMap = {};
        try { trustMap = ((Game.state && Game.state.village && Game.state.village.trust) || {}); } catch (e) { trustMap = {}; }
        for (const v of roster) {
          if (v === vid) continue;
          const np = nodePos[v];
          if (!np) { earshotUnknown++; continue; }
          const d = Math.max(Math.abs(np.nx - fighterNode.nx), Math.abs(np.ny - fighterNode.ny));
          if (d <= 1) {
            const g = gearOfVid(Game, v);
            let tr = null;
            try { const t = trustMap[v]; tr = (t === undefined) ? 10 : t; } catch (e) { tr = null; }
            earshot.push({
              vid: String(v), armed: g.armed, armorP: g.armorP, veteranW3: g.veteranW3,
              deadKnown: deadKnown(Game, v),
              assignmentTask: (assignments[v] && assignments[v].task) || null,
              inCrewRaw: crewRaw.indexOf(v) >= 0,
              dist: d, trust: tr,
            });
          }
        }
      }
      // Village-wide armed / armored counts (living roster, gear read).
      let vArmed = 0, vArmored10 = 0, vKnown = 0, vVeterans = 0;
      for (const v of roster) {
        if (deadKnown(Game, v) === true) continue;
        const g = gearOfVid(Game, v);
        if (g.armed === null && g.armorP === null) continue;
        vKnown++;
        if (g.armed) vArmed++;
        if ((g.armorP || 0) >= 10) vArmored10++;
        if (g.veteranW3) vVeterans++;
      }
      let readiness = null;
      try {
        if (typeof Game.waveCombatReadiness === 'function') {
          const r = Game.waveCombatReadiness(4);
          readiness = r ? { armored: r.armored | 0, armed: r.armed | 0, tricks: r.tricks | 0, veterans: r.veterans | 0, ready: !!r.ready } : null;
        }
      } catch (e) { readiness = null; }
      let trickKnown = null;
      try { trickKnown = (typeof Game.villageKnowsTrick === 'function' && mid) ? !!Game.villageKnowsTrick(mid) : null; } catch (e) { trickKnown = null; }
      pre = {
        day: dayOf(Game), part: store.partCounter,
        vid: vid != null ? String(vid) : null,
        seq: seq, mid: mid, wave: wave,
        caller: caller.cls, stack: caller.stack,
        channel: (!m && caller.expedition) ? 'other' : (inRaid ? 'raid' : 'field'),
        mTile: mTile,
        mHpStart: (live && live.hp != null) ? roundHp(live.hp) : null,
        leader: leader,
        crewRaw: crewRaw.map(v => (v != null ? String(v) : null)),
        crew: crew,
        tile: tile, tileUnknown: tileUnknown,
        fighterNode: fighterNode,
        earshot: earshot, earshotUnknown: earshotUnknown,
        villageArmed: vArmed, villageArmored10: vArmored10, villageKnown: vKnown, villageVeterans: vVeterans,
        readiness: readiness, trickKnown: trickKnown,
        engineAllies: (opts && opts.allies != null) ? (opts.allies | 0) : null,
        allyVids: allyVids.map(a => (a != null ? String(a) : null)),
        cornered: !!(opts && opts.cornered),
        allyFromStart: !!(opts && opts.allyFromStart),
      };
    } catch (e) { noteErr(store, 'fieldFight.pre', e); }
    let rec = null;
    try { rec = orig.apply(this, arguments); }
    catch (e) {
      try { if (pre) { pre.threw = true; pre.error = String((e && e.message) || e).slice(0, 120); pushCapped(store, 'meetings', pre); } } catch (e2) { noteErr(store, 'fieldFight.throwRec', e2); }
      throw e;
    }
    try {
      if (pre) {
        pre.outcome = rec ? (rec.outcome || null) : null;
        pre.rounds = rec ? (rec.rounds | 0) : null;
        pre.mDealt = rec ? (rec.mDealt | 0) : null;
        pre.vTaken = rec ? (rec.vTaken | 0) : null;
        pre.mHpLeft = rec ? roundHp(rec.mHpLeft) : null;
        pre.intent = rec ? (rec.intent || null) : null;
        pre.intentWhy = rec ? (rec.intentWhy || null) : null;
        pre.everHopeless = rec ? !!rec.everHopeless : null;
        pre.everWinning = rec ? !!rec.everWinning : null;
        pre.fleeLearn = rec ? !!rec.fleeLearn : null;
        pre.fleeHopeless = rec ? !!rec.fleeHopeless : null;
        pre.calledHelp = rec ? !!rec.calledHelp : null;
        pre.joinedAllyVid = (rec && rec.allyVid != null) ? String(rec.allyVid) : null;
        pre.allyDealt = rec ? (rec.allyDealt | 0) : null;
        pre.allyTaken = rec ? (rec.allyTaken | 0) : null;
        // Sense log: wave-4 judged-channel meetings only, capped, so
        // the sense reading quotes a real fight without bloating the
        // corpus (all-wave meeting logs would dwarf it).
        try {
          if (pre.wave === 4 && (pre.caller === 'resolve' || pre.caller === 'patrol') && pre.channel === 'field'
            && rec && Array.isArray(rec.log)) {
            pre.fightLog = rec.log.slice(0, 120).map(l => String(l).slice(0, 300));
          }
        } catch (e) { /* log capture never blocks the record */ }
        pushCapped(store, 'meetings', pre);
      }
    } catch (e) { noteErr(store, 'fieldFight.rec', e); }
    return rec;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._fieldfeedDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._fieldfeedDiagStore = store;
    Game._fieldfeedDiagInstalled = true;
    Game._fieldfeedDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withFieldfeedDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installFieldfeedDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._fieldfeed = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installFieldfeedDiag, withFieldfeedDiag, MAX_EVENTS };
