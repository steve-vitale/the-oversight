// w4dmg-diag — per-fight wave-4 damage decomposition recorder for
// sim-w4dmg-a (2026-10-26, flesh-out loop, axis scale-onramp).
// DIAG ONLY: zero src/js changes, policy-side only.
//
// WHAT IT RECORDS (and what it cannot):
// - FIELD fights: wraps Game.fieldFight. Pre-capture reads the
//   entity's hp/maxHp/_spawnSeq/_spawnsrc and the fighter's village
//   health, all before delegating (the engine mutates m.hp during
//   the fight). Post-capture reads the RETURNED record only:
//   outcome, rounds, vTaken, mDealt, vHpLeft, mHpLeft, volley,
//   allyDealt, calledHelp, allyVid, intent, packCount. Source
//   taxonomy is the record's own fields: volley = rec.volley.dmg,
//   ally = rec.allyDealt, close-in = mDealt - volley - ally.
//   Close-in folds villager melee strikes together with
//   ability/trick/godpath field effects — the engine's record has
//   no separate field for those, so they are NEVER split here.
//   Fighter gear (weapon bonus melee/ranged, armor P) and abilities
//   held are read AFTER delegating, best-effort, via the equipment
//   helpers when reachable; null = unknown-gear, counted by the
//   analyzer. HELD abilities are not USED abilities: the record
//   does not attribute ability damage separately.
// - TB fights: wraps Game.tbEnd. Pre-capture (before delegating,
//   because tbEnd nulls tbfight at its tail) reads the fight id,
//   round count, and fighters (key/kind/monsterId/villagerId/hp/
//   maxHp/wbonus/varmor as carried on the fighter objects). The
//   analyzer joins these end rows to nonworldkill-diag start rows
//   by fightId: net tb damage = start monster hp - end monster hp.
//   TB fights have NO per-round or per-source damage record in
//   the engine — that damage is reported as unattributed, never
//   invented from the field formula.
//
// OBSERVATIONAL ONLY. W4DMG=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx surface,
// no record. The wraps record after delegating (field) or capture
// before delegating (tbEnd pre-state, which the engine destroys).
// They write nothing to game state, draw no RNG, never throw into
// the engine (recording errors are counted), and return the
// original's value untouched. They never call
// villageStandingTotal() or unlockedWave() mid-run.
//
// KNOWN LIMITS (stated, not hidden):
// - Field gear reads are best-effort: if the equipment helpers
//   are unreachable from this module, gear fields are null and
//   the analyzer counts unknown-gear rows explicitly.
// - Field fights with m == null (ephemeral) have no start hp and
//   no seq: startHp null, woundsIn null, never counted as a
//   wounded-entry fight.
// - Tb end rows with no monster fighter present at tbEnd (fighter
//   removed) carry endHp null: net damage is then unattributed-
//   end-missing, counted explicitly, never defaulted to 0.
// - Tb fights that never reach tbEnd (unended) have no end row
//   and are named as unended by the analyzer's join, never hidden.
'use strict';

const MAX_EVENTS = 20000;

function layerOn() { try { return process.env.W4DMG === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function roundHp(x) { return (x != null && isFinite(x)) ? Math.round(x) : null; }
function n0(x) { const n = x | 0; return n > 0 ? n : 0; }

function newStore() {
  return {
    fieldFights: [], tbEnds: [],
    errs: 0, errors: [], overflow: { fieldFights: 0, tbEnds: 0 },
    installed: false,
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

// Best-effort fighter gear/ability read AFTER the fight (gear-up
// inside fieldFight is re-equip only, so post-fight gear is fight
// gear). Pure reads; any failure yields nulls, never a throw.
function gearOf(Game, vid) {
  const out = { wbMelee: null, wbRanged: null, armorP: null, abilities: null, personFound: false };
  try {
    let person = null;
    try { if (typeof Game.vpOf === 'function') person = Game.vpOf(vid); } catch (e) {}
    if (!person) {
      const lists = [];
      try { if (Game.data && Array.isArray(Game.data.villagers)) lists.push(Game.data.villagers); } catch (e) {}
      try { if (Game.data && Array.isArray(Game.data.background_survivors)) lists.push(Game.data.background_survivors); } catch (e) {}
      for (const l of lists) { const f = l.find(x => x && x.id === vid); if (f) { person = f; break; } }
    }
    if (!person) return out;
    out.personFound = true;
    let eq = null;
    try { eq = (globalThis.Scattering || {}).equipment || null; } catch (e) {}
    if (!eq) {
      try { eq = ((globalThis.Scattering || {}).S || {}).equipment || null; } catch (e) {}
    }
    if (!eq) {
      try { eq = (Game.S && Game.S.equipment) ? Game.S.equipment : null; } catch (e) {}
    }
    if (eq) {
      try { if (typeof eq.weaponBonusOf === 'function') out.wbMelee = eq.weaponBonusOf(person, Game.data.items, 'melee'); } catch (e) {}
      try { if (typeof eq.weaponBonusOf === 'function') out.wbRanged = eq.weaponBonusOf(person, Game.data.items, 'ranged'); } catch (e) {}
      try { if (typeof eq.armorOf === 'function') out.armorP = eq.armorOf(person, Game.data.items); } catch (e) {}
    }
    try {
      if (typeof Game.npcOwnedIds === 'function') out.abilities = Game.npcOwnedIds(vid);
      else if (Game.state && Game.state.village && Game.state.village.npcAbilities && Game.state.village.npcAbilities[vid]) out.abilities = Game.state.village.npcAbilities[vid].slice();
    } catch (e) {}
  } catch (e) { /* best-effort only; nulls stand */ }
  return out;
}

function installW4dmgDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._w4dmgDiagStore === store && Game._w4dmgDiagInstalled) return Game._w4dmgDiagUninstall || function () {};
  const uninstalls = [];
  try {
    if (typeof Game.fieldFight === 'function') {
      const orig = Game.fieldFight;
      Game.fieldFight = function (vid, mdef, m, opts) {
        let startHp = null, startMax = null, seq = null, src = null, vHpEntry = null;
        try {
          if (m && m.hp != null) startHp = roundHp(m.hp);
          if (m && m.maxHp != null) startMax = roundHp(m.maxHp);
          if (startMax == null && mdef && mdef.hp && mdef.hp.length === 2) startMax = roundHp(mdef.hp[1]);
          if (m && m._spawnSeq != null) seq = m._spawnSeq | 0;
          if (m && m._spawnsrc != null) src = String(m._spawnsrc);
          const hv = (Game.state && Game.state.village && Game.state.village.health) || {};
          if (hv[vid] !== undefined) vHpEntry = roundHp(hv[vid]);
        } catch (e) { noteErr(store, 'fieldFight.start', e); }
        const rec = orig.apply(this, arguments);
        try {
          const md = mdef || {};
          const atk = md.attack || {};
          const volleyDmg = (rec && rec.volley) ? (rec.volley.dmg | 0) : 0;
          const allyDmg = (rec && rec.allyDealt != null) ? (rec.allyDealt | 0) : 0;
          const totalDmg = (rec && rec.mDealt != null) ? (rec.mDealt | 0) : 0;
          const gear = gearOf(Game, vid);
          pushCapped(store, 'fieldFights', {
            day: dayOf(Game), vid: vid != null ? String(vid) : null,
            mid: md.id || null, wave: (md.wave | 0) || 1,
            seq: seq, src: src,
            startHp: startHp, startMax: startMax,
            woundsIn: (startHp != null && startMax != null) ? (startMax - startHp) : null,
            endHp: rec ? roundHp(rec.mHpLeft) : null,
            vHpEntry: vHpEntry, vHpLeft: rec ? roundHp(rec.vHpLeft) : null,
            vTaken: rec ? (rec.vTaken | 0) : null,
            totalDmg: totalDmg, volleyDmg: volleyDmg, allyDmg: allyDmg,
            closeInDmg: totalDmg - volleyDmg - allyDmg,
            volleyShots: (rec && rec.volley) ? (rec.volley.shots | 0) : null,
            volleyHits: (rec && rec.volley) ? (rec.volley.hits | 0) : null,
            outcome: rec ? (rec.outcome || null) : null,
            rounds: rec ? (rec.rounds | 0) : null,
            packCount: rec ? (rec.packCount | 0) : null,
            calledHelp: rec ? !!rec.calledHelp : false,
            allyVid: rec ? (rec.allyVid || null) : null,
            optsAllies: (opts && opts.allies != null) ? (opts.allies | 0) : 0,
            intent: rec ? (rec.intent || null) : null,
            mDmgRange: (atk.damage && atk.damage.length === 2) ? [atk.damage[0] | 0, atk.damage[1] | 0] : null,
            mPierce: (md.pierce != null) ? Number(md.pierce) : null,
            mSpeed: (md.speed != null) ? (md.speed | 0) : null,
            mPack: (md.pack != null) ? (md.pack | 0) : null,
            mHpRange: (md.hp && md.hp.length === 2) ? [md.hp[0] | 0, md.hp[1] | 0] : null,
            wbMelee: gear.wbMelee, wbRanged: gear.wbRanged, armorP: gear.armorP,
            abilitiesHeld: gear.abilities, personFound: gear.personFound,
            hasRng: !!(opts && opts.rng),
          });
        } catch (e) { noteErr(store, 'fieldFight.rec', e); }
        return rec;
      };
      uninstalls.push(() => { try { Game.fieldFight = orig; } catch (e) {} });
    } else { noteErr(store, 'fieldFight.missing', new Error('no fieldFight')); }
  } catch (e) { noteErr(store, 'fieldFight.wrap', e); }
  try {
    if (typeof Game.tbEnd === 'function') {
      const orig = Game.tbEnd;
      Game.tbEnd = function (result) {
        let fightId = null, round = null, fighters = null;
        try {
          const f = Game.tbfight;
          if (f) {
            fightId = f.id || null;
            round = (f.round != null) ? (f.round | 0) : null;
            fighters = (f.fighters || []).map(x => x ? {
              key: x.key || null, kind: x.kind || null,
              monsterId: x.monsterId || (x.mdef && x.mdef.id) || null,
              villagerId: x.villagerId || null,
              hp: roundHp(x.hp), maxHp: roundHp(x.maxHp),
              wbonus: (x.wbonus != null) ? x.wbonus : null,
              varmor: (x.varmor != null) ? x.varmor : null,
              alive: !!x.alive, fled: !!x.fled,
            } : null);
          }
        } catch (e) { noteErr(store, 'tbEnd.pre', e); }
        const r = orig.apply(this, arguments);
        try {
          pushCapped(store, 'tbEnds', {
            day: dayOf(Game), fightId: fightId, round: round,
            result: (result === undefined || result === null) ? null : String(result),
            fighters: fighters,
          });
        } catch (e) { noteErr(store, 'tbEnd.rec', e); }
        return r;
      };
      uninstalls.push(() => { try { Game.tbEnd = orig; } catch (e) {} });
    } else { noteErr(store, 'tbEnd.missing', new Error('no tbEnd')); }
  } catch (e) { noteErr(store, 'tbEnd.wrap', e); }
  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._w4dmgDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._w4dmgDiagStore = store;
    Game._w4dmgDiagInstalled = true;
    Game._w4dmgDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withW4dmgDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installW4dmgDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._w4dmg = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installW4dmgDiag, withW4dmgDiag, MAX_EVENTS };
