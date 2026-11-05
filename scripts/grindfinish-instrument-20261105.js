// grindfinish-instrument-20261105.js — grind-to-finish chain instrument
// (arm sim-grindfinish-b, run fleshout-loop-b-20261105T1322Z). Scripts only,
// zero src/js. Extends dmground-instrument-20261105 (identical record shape
// for wave-4+ field + player-TB fights) with the chain fields the DIAG
// needs:
//  - def HP range per mid (defHpLo/defHpHi from monsters.json) so every
//    fight carries entryFracHi = entryHp/hpHi and entryFracLo = entryHp/hpLo.
//    World spawns sit at hpLo (spawnWorldMonster: hp = maxHp = hp[0]); fresh
//    TB rolls sit in [hpLo, hpHi]; lifted TB fighters sit at world HP.
//  - TB lift detection: BEFORE startCombat, capture the tile-monster alias
//    (state.scholar.monster) — if its id === mid the fight lifts that world
//    entity and tbWorldHpFor (game.js, sim-w4tbkill-a phase B) enters it at
//    world HP; otherwise the fight rolls fresh. Also captures pendingMonsterId
//    liveness (wanderer contact) and a live doorFledMonsters stash
//    (re-engage honors stashed wounds, floored at 1 HP).
//  - TB primary-fighter HP/maxHp + veteran flag + worldOrigin presence
//    (titan/lingering only — ordinary wild entities are removed at fight
//    start and never restored by tbEnd; lingerers restore at
//    min(preHp, fighterEndHp) floored at 1, titans at full).
//  - Field fights carry the world entity's maxHp and tile/grid location
//    (tx,ty,mx,my) as an entity proxy for re-find linkage.
// Wrappers never throw into game code: a recording failure is counted in
// instrumentErrors and the original call's result is returned untouched.
// Usage: const INST = require('./grindfinish-instrument-20261105');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.finalize(); inst.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function mapOutcomeField(o) {
  if (o === 'vKill') return 'kill';
  if (o === 'mFlee' || o === 'vFlee') return 'flee';
  if (o === 'vDie') return 'death';
  return 'other';
}
function mapOutcomeTb(result) {
  if (result === 'won') return 'kill-or-rout';
  if (result === 'fled') return 'flee';
  if (result === 'lost') return 'death';
  return 'other';
}

function install(Game) {
  const t = { fights: [], daily: [], killsLive: [], scholarDeaths: [], killerTrack: [], instrumentErrors: [] };
  const waveById = {};
  const defHpById = {};
  const itemById = {};
  try {
    const mons = ((Game.data || {}).monsters) || [];
    mons.forEach(function (m) {
      if (m && m.id) {
        waveById[m.id] = (m.wave | 0) || 1;
        if (m.hp && m.hp.length >= 2) defHpById[m.id] = { lo: m.hp[0] | 0, hi: m.hp[1] | 0 };
        else if (m.hp && m.hp.length === 1) defHpById[m.id] = { lo: m.hp[0] | 0, hi: m.hp[0] | 0 };
      }
    });
  } catch (e) { t.instrumentErrors.push('monster-map: ' + String(e.message).slice(0, 80)); }
  try {
    const items = ((Game.data || {}).items) || [];
    items.forEach(function (it) { if (it && it.id) itemById[it.id] = it; });
  } catch (e) { t.instrumentErrors.push('item-map: ' + String(e.message).slice(0, 80)); }

  function waveOf(mid, mdef) {
    if (mdef && (mdef.wave | 0)) return (mdef.wave | 0);
    if (mid && waveById[mid]) return waveById[mid];
    return null;
  }

  // First-blood state as of NOW (fight-start snapshot for TB, fight-time
  // snapshot for field fights, which resolve synchronously).
  function firstBloodState() {
    const out = { firstDay: null, firstKiller: null, firstKillerAlive: null, daysSinceFirstBlood: null };
    try {
      const log = (((Game.state || {}).waveKillLog) || []).filter(function (e) { return ((e && e.w) | 0) >= 4 && e.by; });
      if (!log.length) return out;
      log.sort(function (a, b) { return (a.d | 0) - (b.d | 0); });
      out.firstDay = log[0].d | 0;
      out.firstKiller = log[0].by;
      const d = dayOf(Game);
      out.daysSinceFirstBlood = d - out.firstDay;
      const fallen = (((Game.state || {}).village || {}).fallen) || [];
      out.firstKillerAlive = !fallen.some(function (f) { return f.villagerId === out.firstKiller && (f.day | 0) < d; });
    } catch (e) { t.instrumentErrors.push('firstBlood: ' + String(e.message).slice(0, 80)); }
    return out;
  }

  function hasWave4Kill(vid) {
    try {
      return (((Game.state || {}).waveKillLog) || []).some(function (e) { return ((e && e.w) | 0) >= 4 && e.by === vid; });
    } catch (e) { return false; }
  }

  function gearOf(vid) {
    const g = { weaponId: null, weaponBonus: null, armorId: null, armorP: null };
    try {
      if (vid === 'player' || vid === 'p') vid = Game.villagerId || vid;
      const p = (typeof Game.getPerson === 'function') ? Game.getPerson(vid) : null;
      if (!p) return g;
      const eq = p.equipped || {};
      const w = eq.melee || eq.ranged || eq.weapon || null;
      const wid = (w && (w.itemId || w.id)) || (typeof w === 'string' ? w : null);
      if (wid) {
        g.weaponId = wid;
        const def = itemById[wid];
        if (def && def.weapon && def.weapon.bonus != null) g.weaponBonus = def.weapon.bonus;
      }
      // ARMOR SLOT FIX (post-corpus, 2026-11-05): worn armor lives in the
      // torso/legs/shoes slots, NOT an `armor` slot — the judged corpus
      // therefore has armorP null throughout (weaponBonus was captured
      // correctly). Prefer the engine's own armorOf when reachable.
      try {
        const S = (typeof globalThis !== 'undefined' && globalThis.Scattering) ? globalThis.Scattering : null;
        if (S && S.equipment && typeof S.equipment.armorOf === 'function') {
          const ap = S.equipment.armorOf(p, Game.data.items);
          if (ap != null) g.armorP = ap;
        }
      } catch (e) {}
      if (g.armorP == null) {
        const slots = [eq.torso, eq.legs, eq.shoes];
        let sum = 0, seen = false;
        slots.forEach(function (sl) {
          const id = (sl && (sl.itemId || sl.id)) || (typeof sl === 'string' ? sl : null);
          if (id) {
            if (!g.armorId) g.armorId = id;
            const def = itemById[id];
            if (def && def.armor && def.armor.protection != null) { sum += def.armor.protection; seen = true; }
          }
        });
        if (seen) g.armorP = sum;
      } else if (eq.torso) { g.armorId = (eq.torso.itemId || eq.torso.id) || null; }
    } catch (e) { t.instrumentErrors.push('gear: ' + String(e.message).slice(0, 80)); }
    return g;
  }

  function monsterHpSum(f) {
    try {
      return (f.fighters || []).filter(function (x) { return x && (x.kind === 'monster' || x.kind === 'hostile'); })
        .reduce(function (s, x) { return s + ((x.hp || 0) > 0 ? (x.hp | 0) : 0); }, 0);
    } catch (e) { return null; }
  }
  function humanFighterVids(f) {
    try {
      return (f.fighters || []).filter(function (x) { return x && (x.kind === 'villager' || x.kind === 'ally' || x.kind === 'player') && x.villagerId; })
        .map(function (x) { return x.villagerId; });
    } catch (e) { return []; }
  }

  let openTb = null;

  // ---- fieldFight wrapper (synchronous; record completed at return) ----
  const origField = Game.fieldFight;
  if (typeof origField === 'function') {
    Game.fieldFight = function (vid, mdef, m, opts) {
      const fb = firstBloodState();
      const entryHp = (m && m.hp != null) ? m.hp : null;
      // GRINDFINISH: world-entity state at fight start — maxHp (world spawns
      // sit at hpLo) and tile/grid location as an entity proxy for re-find
      // linkage. Captured pre-call; m is the live world entity.
      const entryMaxHp = (m && m.maxHp != null) ? m.maxHp : null;
      const entityLoc = (m && (m.tx != null || m.mx != null)) ? { tx: (m.tx != null ? m.tx : null), ty: (m.ty != null ? m.ty : null), mx: (m.mx != null ? m.mx : null), my: (m.my != null ? m.my : null) } : null;
      const gear = gearOf(vid);
      let allyGear = null;
      try {
        const av = opts && opts.allyVids && opts.allyVids[0];
        if (av) allyGear = gearOf(av);
      } catch (e) {}
      // Pre-fight wave-4 kill status per fighter, so a kill scored IN this
      // fight never masquerades as prior blood (the second-candidate test
      // is about status at fight start, not at fight end).
      const preKill = {};
      try {
        (((Game.state || {}).waveKillLog) || []).forEach(function (e) {
          if (((e && e.w) | 0) >= 4 && e.by) preKill[e.by] = true;
        });
      } catch (e) {}
      let ret;
      try { ret = origField.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        const rec = ret || {};
        const mid = (mdef && mdef.id) || (m && m.id) || null;
        const wave = waveOf(mid, mdef);
        if (wave != null && wave >= 4) {
          const dealt = (rec.mDealt | 0) + (rec.allyDealt | 0);
          const denom = (entryHp != null && entryHp > 0) ? entryHp : (dealt + (rec.mHpLeft | 0));
          const fighters = [vid];
          if (rec.allyVid) fighters.push(rec.allyVid);
          const secondCandidates = fighters.filter(function (f) { return f !== fb.firstKiller && !preKill[f]; });
          const dh = defHpById[mid] || null;
          t.fights.push({
            day: dayOf(Game), channel: 'field', fighter: vid || null, fighters: fighters,
            mid: mid, wave: wave, entryHp: entryHp, entryMaxHp: entryMaxHp, entityLoc: entityLoc,
            defHpLo: dh ? dh.lo : null, defHpHi: dh ? dh.hi : null,
            entryFracHi: (entryHp != null && dh && dh.hi > 0) ? entryHp / dh.hi : null,
            entryFracLo: (entryHp != null && dh && dh.lo > 0) ? entryHp / dh.lo : null,
            damageDealt: dealt,
            damageFrac: denom > 0 ? dealt / denom : null,
            rounds: (rec.rounds | 0) || 0, swingsAttempted: (rec.rounds | 0) || 0,
            partySize: (rec.partySize | 0) || 1, allyVid: rec.allyVid || null,
            allyFromStart: !!(opts && opts.allyFromStart),
            optsAllies: (opts && opts.allies) || 0,
            gear: gear, allyGear: allyGear,
            abilitiesUsed: (rec.trickLog && rec.trickLog.slice()) || null,
            trickSummary: null, intent: rec.intent || null, intentWhy: rec.intentWhy || null,
            focusFire: !!rec.focusFire, gearFull: !!rec.gearFull, committedFinish: !!rec.committedFinish,
            committedRounds: (rec.committedRounds | 0) || 0,
            shoutRound: (rec.shoutRound != null) ? rec.shoutRound : null,
            everWinning: !!rec.everWinning, everHopeless: !!rec.everHopeless,
            outcomeRaw: rec.outcome || null, ending: mapOutcomeField(rec.outcome),
            mHpLeft: (rec.mHpLeft != null) ? rec.mHpLeft : null,
            vTaken: (rec.vTaken | 0) || 0,
            firstDay: fb.firstDay, firstKiller: fb.firstKiller,
            firstKillerAliveAtStart: fb.firstKillerAlive,
            daysSinceFirstBlood: fb.daysSinceFirstBlood,
            firstKillerInFight: fb.firstKiller ? fighters.indexOf(fb.firstKiller) >= 0 : false,
            secondCandidates: secondCandidates,
            secondCandidatePresent: secondCandidates.length > 0,
          });
        }
      } catch (e) { t.instrumentErrors.push('fieldFight-record: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('fieldFight-missing'); }

  // ---- player TB wrappers ----
  const origStart = Game.startCombat;
  if (typeof origStart === 'function') {
    Game.startCombat = function () {
      const mid = arguments.length ? arguments[0] : null;
      // GRINDFINISH pre-call lift capture: the tile-monster alias
      // (state.scholar.monster) is the world entity startCombat may lift.
      // If its id === mid, tbWorldHpFor enters the fighter at world HP
      // (field wounds inherited); otherwise the fighter rolls fresh from
      // the def range. The alias is removed by startCombat itself, so this
      // read must happen BEFORE delegating. pendingMonsterId liveness and
      // a doorFledMonsters stash are captured the same way.
      let preAlias = null, prePendingId = null, preDoorFled = null;
      try {
        const s = (Game.state || {}).scholar || {};
        if (s.monster && s.monster.id) preAlias = { id: s.monster.id, hp: (s.monster.hp != null ? s.monster.hp : null), maxHp: (s.monster.maxHp != null ? s.monster.maxHp : null), veteran: !!s.monster.veteran, lingering: !!s.monster.lingering, titan: !!s.monster.titan, tx: (s.monster.tx != null ? s.monster.tx : null), ty: (s.monster.ty != null ? s.monster.ty : null) };
      } catch (e) {}
      try { prePendingId = Game.pendingMonsterId || null; } catch (e) {}
      try {
        const dw = (Game.state || {}).doorFledMonsters || null;
        if (dw && dw.length) preDoorFled = dw.map(function (w) { return { id: w.id || null, hp: (w.hp != null ? w.hp : null) }; });
      } catch (e) {}
      let ret;
      try { ret = origStart.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        const wave = waveOf(mid, null);
        // Resolve mid/wave from the live fight when the arg is not a monster id.
        let fmid = mid, fwave = wave;
        try {
          const f = Game.tbfight;
          if (f && (!fwave || !waveById[fmid])) {
            const mon = (f.fighters || []).filter(function (x) { return x && (x.kind === 'monster' || x.kind === 'hostile'); })[0];
            if (mon) { fmid = (mon.mdef && mon.mdef.id) || mon.monsterId || mon.id || fmid; fwave = waveOf(fmid, mon.mdef || null); }
          }
        } catch (e2) {}
        if (fwave != null && fwave >= 4) {
          const fb = firstBloodState();
          const humans = Game.tbfight ? humanFighterVids(Game.tbfight) : [];
          // SCHOLAR-VID FIX (post-corpus, 2026-11-05): the scholar's own
          // tbfight entry often carries no villagerId (kind 'player', key
          // 'p'), so humanFighterVids returns [] for solo scholar fights
          // and secondCandidates came out [] even though the scholar IS a
          // fresh candidate. Compute candidates from the SAME fighter list
          // the record carries (humans, else the scholar fallback).
          // DMGROUND FIX (2026-11-05, pre-armed): the fallback above only
          // covered SOLO scholar fights. With companions present, humans is
          // non-empty and the scholar's vid was missing from fighters, so
          // 4/11 baseline kills (all via player, scholar killer, companions
          // present) matched NO fight under the strict rule. The scholar is
          // always a fighter in a player TB fight, so their vid is always
          // in the list now; firstKillerInFight reads the same list.
          const fightFighters = humans.slice();
          const _sv = Game.villagerId || null;
          if (_sv && fightFighters.indexOf(_sv) < 0) fightFighters.push(_sv);
          if (!fightFighters.length) fightFighters.push(_sv);
          const secondCandidates = fightFighters.filter(function (h) { return h && h !== fb.firstKiller && !hasWave4Kill(h); });
          // GRINDFINISH: primary monster fighter + lift classification.
          let entryHpPrimary = null, entryMaxHpPrimary = null, primaryVeteran = null, worldOriginPresent = null;
          try {
            const f = Game.tbfight;
            if (f) {
              const mon = (f.fighters || []).filter(function (x) { return x && (x.kind === 'monster' || x.kind === 'hostile'); })[0];
              if (mon) {
                entryHpPrimary = (mon.hp != null) ? mon.hp : null;
                entryMaxHpPrimary = (mon.maxHp != null) ? mon.maxHp : null;
                primaryVeteran = !!mon.veteran;
              }
              worldOriginPresent = !!(f.worldOrigin);
            }
          } catch (e3) {}
          const dh = defHpById[fmid] || null;
          const _entryHp = Game.tbfight ? monsterHpSum(Game.tbfight) : null;
          openTb = {
            day: dayOf(Game), channel: 'player-tb', fighter: Game.villagerId || null,
            fighters: fightFighters, mid: fmid || null, wave: fwave,
            entryHp: _entryHp, entryHpPrimary: entryHpPrimary, entryMaxHpPrimary: entryMaxHpPrimary,
            primaryVeteran: primaryVeteran, worldOriginPresent: worldOriginPresent,
            defHpLo: dh ? dh.lo : null, defHpHi: dh ? dh.hi : null,
            entryFracHi: (_entryHp != null && dh && dh.hi > 0) ? _entryHp / dh.hi : null,
            entryFracLo: (_entryHp != null && dh && dh.lo > 0) ? _entryHp / dh.lo : null,
            entryFracHiPrimary: (entryHpPrimary != null && dh && dh.hi > 0) ? entryHpPrimary / dh.hi : null,
            entryFracLoPrimary: (entryHpPrimary != null && dh && dh.lo > 0) ? entryHpPrimary / dh.lo : null,
            lifted: !!(preAlias && preAlias.id === fmid),
            worldHpAtLift: (preAlias && preAlias.id === fmid) ? { hp: preAlias.hp, maxHp: preAlias.maxHp } : null,
            liftAlias: preAlias,
            pendingLive: prePendingId != null, pendingId: prePendingId,
            doorFledAtEntry: preDoorFled,
            damageDealt: null, damageFrac: null, rounds: null, swingsAttempted: 0,
            partySize: humans.length || 1, allyVid: null, allyFromStart: false, optsAllies: 0,
            gear: gearOf(Game.villagerId), allyGear: null,
            abilitiesUsed: [], trickSummary: null, intent: null, intentWhy: null,
            focusFire: false, committedFinish: false, committedRounds: 0, shoutRound: null,
            everWinning: null, everHopeless: null,
            outcomeRaw: null, ending: null, mHpLeft: null, vTaken: null,
            firstDay: fb.firstDay, firstKiller: fb.firstKiller,
            firstKillerAliveAtStart: fb.firstKillerAlive,
            daysSinceFirstBlood: fb.daysSinceFirstBlood,
            firstKillerInFight: fb.firstKiller ? fightFighters.indexOf(fb.firstKiller) >= 0 : false,
            secondCandidates: secondCandidates,
            secondCandidatePresent: secondCandidates.length > 0,
            _open: true,
          };
        } else { openTb = null; }
      } catch (e) { t.instrumentErrors.push('startCombat-record: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('startCombat-missing'); }

  const origStrike = Game.tbPlayerStrike;
  if (typeof origStrike === 'function') {
    Game.tbPlayerStrike = function () {
      let ret;
      try { ret = origStrike.apply(this, arguments); }
      catch (e) { throw e; }
      try { if (openTb && ret) openTb.swingsAttempted = (openTb.swingsAttempted | 0) + 1; } catch (e) {}
      return ret;
    };
  } else { t.instrumentErrors.push('tbPlayerStrike-missing'); }

  const origUseAbility = Game.useAbility;
  if (typeof origUseAbility === 'function') {
    Game.useAbility = function () {
      let ret;
      try { ret = origUseAbility.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        if (openTb && arguments.length && typeof arguments[0] === 'string') {
          if (openTb.abilitiesUsed.indexOf(arguments[0]) < 0) openTb.abilitiesUsed.push(arguments[0]);
        }
      } catch (e) {}
      return ret;
    };
  } else { t.instrumentErrors.push('useAbility-missing'); }

  const origTbEnd = Game.tbEnd;
  if (typeof origTbEnd === 'function') {
    Game.tbEnd = function (result) {
      try {
        if (openTb) {
          const f = Game.tbfight;
          const endHp = f ? monsterHpSum(f) : null;
          const dealt = (openTb.entryHp != null && endHp != null) ? Math.max(0, openTb.entryHp - endHp) : null;
          // GRINDFINISH: primary-fighter end HP (chain linkage uses the
          // primary, not the pack sum) + worldOrigin at close (titan /
          // lingering restores vs ordinary-wild removal).
          let endHpPrimary = null, endWorldOrigin = null;
          try {
            if (f) {
              const mon = (f.fighters || []).filter(function (x) { return x && (x.kind === 'monster' || x.kind === 'hostile'); })[0];
              if (mon) endHpPrimary = (mon.hp != null) ? mon.hp : null;
              endWorldOrigin = !!(f.worldOrigin);
            }
          } catch (e2) {}
          // Fighters/party stay as captured at fight START (presence at
          // start is the pre-registered split); end-time fighters may have
          // lost members to death and would undercount presence.
          openTb.partySize = (openTb.fighters && openTb.fighters.length) || 1;
          openTb.rounds = f ? (f.round | 0) : null;
          openTb.damageDealt = dealt;
          openTb.damageFrac = (dealt != null && openTb.entryHp > 0) ? dealt / openTb.entryHp : null;
          openTb.outcomeRaw = result || null;
          openTb.ending = mapOutcomeTb(result);
          openTb.mHpLeft = endHp;
          openTb.mHpLeftPrimary = endHpPrimary;
          openTb.worldOriginAtEnd = endWorldOrigin;
          openTb.firstKillerInFight = openTb.firstKiller ? openTb.fighters.indexOf(openTb.firstKiller) >= 0 : false;
          openTb._open = false;
          t.fights.push(openTb);
          openTb = null;
        }
      } catch (e) { t.instrumentErrors.push('tbEnd-record: ' + String(e.message).slice(0, 80)); }
      return origTbEnd.apply(this, arguments);
    };
  } else { t.instrumentErrors.push('tbEnd-missing'); }

  // ---- recordWaveKill + playerDeath (killerdeath base, unchanged) ----
  const origRecordKill = Game.recordWaveKill;
  if (typeof origRecordKill === 'function') {
    Game.recordWaveKill = function (monsterId, killerVid, via, detail) {
      let scholarAtKill = null;
      try { scholarAtKill = Game.villagerId || null; } catch (e) {}
      let ret;
      try { ret = origRecordKill.apply(this, arguments); }
      catch (e) { throw e; }
      try {
        const mdef = ((Game.data || {}).monsters || []).find(function (m) { return m && m.id === monsterId; }) || null;
        t.killsLive.push({ day: dayOf(Game), mid: monsterId || null, wave: waveOf(monsterId, mdef), by: killerVid || null, via: via || null, scholarAtKill: scholarAtKill, scholarChannel: !!(scholarAtKill && killerVid && scholarAtKill === killerVid) });
      } catch (e) { t.instrumentErrors.push('recordWaveKill-record: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('recordWaveKill-missing'); }

  const origPlayerDeath = Game.playerDeath;
  if (typeof origPlayerDeath === 'function') {
    Game.playerDeath = function (cause) {
      let ctx = null;
      try {
        ctx = { day: dayOf(Game), scholarId: Game.villagerId || null, causeArg: cause || null,
          atHaven: (typeof Game.playerAtHaven === 'function') ? !!Game.playerAtHaven() : null,
          mapX: (Game.map && Game.map.px != null) ? Game.map.px : null,
          mapY: (Game.map && Game.map.py != null) ? Game.map.py : null,
          inCombat: !!Game.tbfight, pendingEncounter: !!Game.pendingEncounter };
      } catch (e) { t.instrumentErrors.push('playerDeath-ctx: ' + String(e.message).slice(0, 80)); }
      let ret;
      try { ret = origPlayerDeath.apply(this, arguments); }
      catch (e) { throw e; }
      try { if (ctx) t.scholarDeaths.push(ctx); } catch (e2) { t.instrumentErrors.push('playerDeath-record: ' + String(e2.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('playerDeath-missing'); }

  // ---- daily snapshot + killer tracker + finalize (killerdeath base) ----
  function snapshot() {
    const snap = { day: dayOf(Game) };
    try { snap.scholarId = Game.villagerId || null; } catch (e) { snap.scholarId = null; }
    try {
      const roster = (((Game.state || {}).village || {}).roster || []).slice();
      snap.rosterSize = roster.length;
      let living = 0;
      roster.forEach(function (vid) {
        if (vid === snap.scholarId) { living++; return; }
        try { const p = (typeof Game.getPerson === 'function') ? Game.getPerson(vid) : null; if (p && !p.dead) living++; } catch (e) {}
      });
      snap.living = living;
    } catch (e) { snap.rosterSize = null; snap.living = null; t.instrumentErrors.push('roster: ' + String(e.message).slice(0, 80)); }
    try {
      const st = Game.villageStanding ? Game.villageStanding() : null;
      snap.raw = st ? (st.total | 0) : null;
    } catch (e) { snap.raw = null; t.instrumentErrors.push('standing: ' + String(e.message).slice(0, 80)); }
    try { snap.gated = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) { snap.gated = null; t.instrumentErrors.push('gated: ' + String(e.message).slice(0, 80)); }
    try { snap.readiness5 = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; } catch (e) { snap.readiness5 = null; t.instrumentErrors.push('readiness5: ' + String(e.message).slice(0, 80)); }
    try {
      const log = ((Game.state || {}).waveKillLog) || [];
      const w4 = log.filter(function (e2) { return ((e2 && e2.w) | 0) >= 4; });
      snap.w4kills = w4.length;
      const seen = {};
      w4.forEach(function (e2) { if (e2 && e2.by) seen[e2.by] = true; });
      snap.w4killers = Object.keys(seen).length;
    } catch (e) { snap.w4kills = null; snap.w4killers = null; t.instrumentErrors.push('killlog-snap: ' + String(e.message).slice(0, 80)); }
    try { snap.w4facedTypes = (typeof Game.waveEngaged === 'function') ? (Game.waveEngaged(4) | 0) : null; } catch (e) { snap.w4facedTypes = null; }
    try {
      snap.mapX = (Game.map && Game.map.px != null) ? Game.map.px : null;
      snap.mapY = (Game.map && Game.map.py != null) ? Game.map.py : null;
      snap.scholarAtHaven = (typeof Game.playerAtHaven === 'function') ? !!Game.playerAtHaven() : null;
    } catch (e) { snap.mapX = null; snap.mapY = null; snap.scholarAtHaven = null; }
    t.daily.push(snap);
    try {
      const log = ((Game.state || {}).waveKillLog) || [];
      const killers = {};
      log.forEach(function (e2) { if (((e2 && e2.w) | 0) >= 4 && e2.by) killers[e2.by] = true; });
      const fallen = (((Game.state || {}).village || {}).fallen) || [];
      const health = (((Game.state || {}).village || {}).health) || {};
      Object.keys(killers).forEach(function (by) {
        const dead = fallen.some(function (f) { return f.villagerId === by; });
        const isScholar = (by === snap.scholarId);
        let atHaven = null;
        try { if (isScholar && typeof Game.playerAtHaven === 'function') atHaven = !!Game.playerAtHaven(); } catch (e) {}
        t.killerTrack.push({ day: snap.day, by: by, isScholar: isScholar, deadInFallen: dead,
          atHaven: atHaven, health: (health[by] != null) ? health[by] : null, onExped: null });
      });
    } catch (e) { t.instrumentErrors.push('killerTrack: ' + String(e.message).slice(0, 80)); }
    return snap;
  }

  function finalize() {
    const out = {};
    try { out.waveKillLog = (((Game.state || {}).waveKillLog) || []).slice(); } catch (e) { out.waveKillLog = null; t.instrumentErrors.push('killlog-final: ' + String(e.message).slice(0, 80)); }
    try { out.fallen = (((Game.state || {}).village || {}).fallen || []).slice(); } catch (e) { out.fallen = null; t.instrumentErrors.push('fallen-final: ' + String(e.message).slice(0, 80)); }
    try {
      const ds = (typeof Game.deedState === 'function') ? Game.deedState() : null;
      out.wavesFaced = (ds && ds.wavesFaced) || null;
    } catch (e) { out.wavesFaced = null; t.instrumentErrors.push('deed-final: ' + String(e.message).slice(0, 80)); }
    try { out.scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { out.scaleRank = null; }
    try { out.unlockedWave = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { out.unlockedWave = null; }
    try { out.standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) { out.standing = null; }
    try { out.readiness5 = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; } catch (e) { out.readiness5 = null; }
    try {
      const dead = {};
      ((Game.data || {}).villagers || []).forEach(function (p) { if (p && p.id) dead[p.id] = !!p.dead; });
      ((Game.data || {}).background_survivors || []).forEach(function (p) { if (p && p.id && dead[p.id] === undefined) dead[p.id] = !!p.dead; });
      out.deadMap = dead;
      out.endScholarId = Game.villagerId || null;
    } catch (e) { out.deadMap = null; out.endScholarId = null; t.instrumentErrors.push('deadMap: ' + String(e.message).slice(0, 80)); }
    // A TB fight still open at finalize (village died mid-fight, run ended)
    // is recorded as an unfinished fight, never dropped silently.
    try {
      if (openTb) { openTb.ending = 'unfinished'; openTb.outcomeRaw = 'unfinished'; openTb._open = false; t.fights.push(openTb); openTb = null; }
    } catch (e) { t.instrumentErrors.push('openTb-finalize: ' + String(e.message).slice(0, 80)); }
    return out;
  }

  function uninstall() {
    try { if (typeof origField === 'function') Game.fieldFight = origField; } catch (e) {}
    try { if (typeof origStart === 'function') Game.startCombat = origStart; } catch (e) {}
    try { if (typeof origStrike === 'function') Game.tbPlayerStrike = origStrike; } catch (e) {}
    try { if (typeof origUseAbility === 'function') Game.useAbility = origUseAbility; } catch (e) {}
    try { if (typeof origTbEnd === 'function') Game.tbEnd = origTbEnd; } catch (e) {}
    try { if (typeof origRecordKill === 'function') Game.recordWaveKill = origRecordKill; } catch (e) {}
    try { if (typeof origPlayerDeath === 'function') Game.playerDeath = origPlayerDeath; } catch (e) {}
  }

  return { t: t, snapshot: snapshot, finalize: finalize, uninstall: uninstall, _helpers: { mapOutcomeField: mapOutcomeField, mapOutcomeTb: mapOutcomeTb, firstBloodState: firstBloodState, gearOf: gearOf } };
}

module.exports = { install: install, mapOutcomeField: mapOutcomeField, mapOutcomeTb: mapOutcomeTb };
