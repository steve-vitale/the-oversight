// abilityfirst-instrument-20261111.js — abilities + XP first-numbers
// recorder (arm sim-abilityfirst-a, run fleshout-20261111T1015Z).
// Scripts only, zero src/js.
//
// Records, per seed:
//   (1) TRACK XP (gainTrackXP): every call — who (player/villager id),
//       track, n, why, xp/level before/after (RAW state reads — the
//       instrument never calls npcXp/playerTracks, which CREATE records).
//       A first credit on a fresh record also notes the occupation lean
//       applied at creation, so the analyzer never mistakes lean for XP.
//   (2) DEEDS (creditDeed): every call — who, deed, track, granted
//       (return = new xp total, 0 = per-day-capped or unknown deed).
//   (3) SYNERGY XP (creditSynergy): every call — who, synergy, bonus,
//       granted.
//   (4) ABILITY XP (gainAbilityXP): every call — id, amount, level/xp
//       before/after on the scholar's ability entry, lane.
//   (5) PLAYER PICKS (chooseAbility / keepAbilities / pumpLevelUps /
//       levelUpOffers): every pick (id, src, replaced, granted/refused,
//       slots before/after), every keep, every sheet opened (choices
//       offered), every offer list (track, level, ids).
//   (6) VILLAGER GRANTS (npcGrantAbility): every call — vid, id, lane,
//       ok. Skill-lane ids route to npcLearnSkill (recorded in (7),
//       never double-counted as a slot grant).
//   (7) VILLAGER SKILLS (npcLearnSkill): every call — vid, ability id,
//       skill id, ok.
//   (8) VILLAGER SHEETS (villagerResolveLevelUps): every call — vid,
//       return, sheets before/after, npcAbilities before/after.
//   (9) ABILITY USE (useAbility): every call — id, action, target,
//       in a turn-based fight or not, monster wave if in a fight,
//       kcal before/after, returned.
//  (10) VILLAGER ABILITY USE (tbVillagerAbility): every call — vid,
//       round, returned, fired identity from villager/monster flag
//       diffs (same flag set as the abilityuse instrument;
//       'wrapped-unknown' when the return is true and no flag moved
//       — never invented).
//  (11) SYNERGY UNLOCKS (unlockSynergy): every call — synergy id, day.
//  (12) EVOLUTION (stageEvolution): every call — ability id, choices
//       staged. (13) CHANNELING (channelSentiment): every call — ref,
//       message returned. (14) SLOT MOMENTS (slotMoment): every call —
//       threshold, slots after. (15) PASSIVES (checkPassiveUnlock):
//       every call — stat, passives before/after.
//  (16) TELEMETRY CROSS-CHECK (tele, if present): 'track_level',
//       'ability_granted', 'villager_skill', 'track_synergy',
//       'ability_replaced', 'level_up_kept' events only.
//  (17) DAILY SNAPSHOT: scholar integration/slots/abilities
//       [{id, level, xp, lane}]/tracks/levelUpQueue/abilityChoices/
//       surgeResonance/sentimentTaught/pendingEvolution/
//       activeSynergies/passives/trackStats; per-villager
//       npcAbilities/npcSkills/npcXp; bearer id (mantle detection);
//       pantry kcal, roster, standing, scaleRank, nationalLive, wave.
//
// All wraps are record-only: call the original, return its value
// unchanged, never alter state, never consume RNG. Any failure in
// the RECORDING path is logged to instrumentErrors, never thrown
// into the game.
//
// KNOWN WRAP RISK (secondlink-a / diplo-a lesson): a wrap records
// nothing if the engine calls the closure instead of the Game
// method. The proof (scripts/test-abilityfirst-a.js) verifies EACH
// wrapped method's call path is live on a fixture or live
// miniature; a wrap with no live call observed is marked dead in
// the evidence and its zero is never treated as evidence.
//
// Usage: const AF = require('./abilityfirst-instrument-20261111');
//   const af = AF.install(Game); af.snapshot(); ... af.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function stackText(skip) {
  try { return (new Error().stack || '').split('\n').slice(skip || 0).join(' | '); } catch (e) { return ''; }
}
function clone(o) { try { return JSON.parse(JSON.stringify(o || {})); } catch (e) { return {}; } }
function kcalOf(Game) { try { return ((Game.state || {}).scholar || {}).kcal || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) { return null; }
}
function thresholds(Game) {
  try {
    const th = ((Game.data || {}).tracks || {}).thresholds;
    if (Array.isArray(th) && th.length) return th.slice();
  } catch (e) {}
  return [18, 48, 96, 192, 384];
}
function levelFor(Game, xp) {
  let lvl = 0;
  for (const t of thresholds(Game)) if ((xp || 0) >= t) lvl++;
  return lvl;
}
function rawTrackXp(Game, who, track) {
  // RAW reads only — never npcXp()/playerTracks(), which create records.
  try {
    if (who === 'player' || (Game.villagerId && who === Game.villagerId)) {
      const rec = ((Game.state.scholar || {}).tracks || {})[track];
      return rec ? { xp: rec.xp || 0, level: rec.level || 0, exists: true } : { xp: 0, level: 0, exists: false };
    }
    const rec = (((Game.state.village || {}).npcXp || {})[who] || {})[track];
    if (rec == null) return { xp: 0, level: 0, exists: false };
    return { xp: rec, level: levelFor(Game, rec), exists: true };
  } catch (e) { return { xp: null, level: null, exists: false }; }
}
function abilityLane(Game, id) {
  try {
    const def = (Game.data.abilities || []).find(function (a) { return a && a.id === id; });
    return def ? (def.lane || 'unknown') : 'unknown-id';
  } catch (e) { return 'unknown'; }
}
function scholarAbility(Game, id) {
  try {
    const s = Game.state.scholar || {};
    const ab = ((s.backgroundAbilities || []).find(function (a) { return a.id === id; }) ||
                (s.abilities || []).find(function (a) { return a.id === id; }));
    return ab ? { level: ab.level || 1, xp: ab.xp || 0 } : null;
  } catch (e) { return null; }
}
function fightWave(Game) {
  try {
    const f = Game.tbfight;
    if (!f || f.over) return null;
    let w = null;
    for (const m of (f.fighters || [])) {
      if (!m || m.kind !== 'monster') continue;
      const mid = ((m.mdef || {}).id || m.monsterId || m.id) || null;
      const def = mid ? (Game.data.monsters || []).find(function (x) { return x && x.id === mid; }) : null;
      const mw = def ? (def.wave || 1) : null;
      if (mw != null && (w == null || mw > w)) w = mw;
    }
    return w;
  } catch (e) { return null; }
}
function inTbFight(Game) {
  try { const f = Game.tbfight; return !!(f && !f.over); } catch (e) { return false; }
}

function install(Game) {
  const t = {
    xpEvents: [], deedEvents: [], synergyXpEvents: [], abilityXpEvents: [],
    pickEvents: [], keepEvents: [], pumpEvents: [], offerEvents: [],
    villGrantEvents: [], skillEvents: [], villResolveEvents: [],
    useEvents: [], npcAbilityEvents: [], synergyUnlockEvents: [],
    evolutionEvents: [], channelEvents: [], slotEvents: [], passiveEvents: [],
    teleEvents: [],
    daily: [], instrumentErrors: [], wrapLive: {}, wrapCounts: {},
  };
  let seq = 0;
  const origs = {};

  function mark(name) {
    t.wrapLive[name] = true;
    t.wrapCounts[name] = (t.wrapCounts[name] || 0) + 1;
  }
  function err(where, msg) {
    try { t.instrumentErrors.push(where + ': ' + String(msg).slice(0, 100)); } catch (e) {}
  }
  function wrap(name, fn) {
    try {
      if (typeof Game[name] !== 'function') { err(name + '-missing', 'Game.' + name + ' is not a function'); return; }
      origs[name] = Game[name];
      Game[name] = fn;
    } catch (e) { err(name + '-wrap', e.message); }
  }

  // ---- (1) track XP ----
  wrap('gainTrackXP', function (who, track, n, why) {
    mark('gainTrackXP');
    const stack = stackText(2);
    const before = rawTrackXp(Game, who, track);
    let ret = 0;
    try { ret = origs.gainTrackXP.call(Game, who, track, n, why); } catch (e) { err('gainTrackXP-call', e.message); }
    try {
      const after = rawTrackXp(Game, who, track);
      t.xpEvents.push({ seq: ++seq, day: dayOf(Game), who: who || null, track: track || null,
        n: (n | 0), why: (why == null ? null : String(why)),
        xpBefore: before.xp, xpAfter: after.xp, levelBefore: before.level, levelAfter: after.level,
        recordCreated: !before.exists && after.exists, ret: ret, stack: stack, via: 'gainTrackXP' });
    } catch (e) { err('gainTrackXP-log', e.message); }
    return ret;
  });

  // ---- (2) deeds ----
  wrap('creditDeed', function (who, deedId, trackOverride) {
    mark('creditDeed');
    const stack = stackText(2);
    let ret = 0;
    try { ret = origs.creditDeed.call(Game, who, deedId, trackOverride); } catch (e) { err('creditDeed-call', e.message); }
    try {
      t.deedEvents.push({ seq: ++seq, day: dayOf(Game), who: who || null, deed: deedId || null,
        trackOverride: trackOverride || null, granted: ret, capped: ret === 0, stack: stack, via: 'creditDeed' });
    } catch (e) { err('creditDeed-log', e.message); }
    return ret;
  });

  // ---- (3) synergy XP ----
  wrap('creditSynergy', function (who, synergyId) {
    mark('creditSynergy');
    const stack = stackText(2);
    let ret = 0;
    try { ret = origs.creditSynergy.call(Game, who, synergyId); } catch (e) { err('creditSynergy-call', e.message); }
    try {
      t.synergyXpEvents.push({ seq: ++seq, day: dayOf(Game), who: who || null, synergy: synergyId || null,
        granted: ret, stack: stack, via: 'creditSynergy' });
    } catch (e) { err('creditSynergy-log', e.message); }
    return ret;
  });

  // ---- (4) ability XP ----
  wrap('gainAbilityXP', function (abilityId, amount) {
    mark('gainAbilityXP');
    const stack = stackText(2);
    const before = scholarAbility(Game, abilityId);
    try { origs.gainAbilityXP.call(Game, abilityId, amount); } catch (e) { err('gainAbilityXP-call', e.message); }
    try {
      const after = scholarAbility(Game, abilityId);
      t.abilityXpEvents.push({ seq: ++seq, day: dayOf(Game), id: abilityId || null,
        lane: abilityLane(Game, abilityId), amount: (amount | 0),
        levelBefore: before ? before.level : null, levelAfter: after ? after.level : null,
        xpBefore: before ? before.xp : null, xpAfter: after ? after.xp : null,
        held: !!after, stack: stack, via: 'gainAbilityXP' });
    } catch (e) { err('gainAbilityXP-log', e.message); }
    return undefined;
  });

  // ---- (5) player picks / sheets ----
  wrap('chooseAbility', function (id, replaceId) {
    mark('chooseAbility');
    const stack = stackText(2);
    let src = null, slotsBefore = null, ret = null;
    try {
      const ch = ((Game.state.scholar || {}).abilityChoices || []).find(function (c) { return c.id === id; });
      src = ch ? (ch.src || null) : null;
      slotsBefore = (typeof Game.abilitySlots === 'function') ? Game.abilitySlots() : null;
    } catch (e) {}
    try { ret = origs.chooseAbility.call(Game, id, replaceId); } catch (e) { err('chooseAbility-call', e.message); }
    try {
      let slotsAfter = null, held = false;
      try { slotsAfter = (typeof Game.abilitySlots === 'function') ? Game.abilitySlots() : null; } catch (e) {}
      try { held = ((Game.state.scholar || {}).abilities || []).some(function (a) { return (a.id || a) === id; }); } catch (e) {}
      t.pickEvents.push({ seq: ++seq, day: dayOf(Game), id: id || null, src: src,
        replaceId: replaceId || null, granted: held, retNull: (ret == null),
        heldAfter: held, slotsBefore: slotsBefore, slotsAfter: slotsAfter, stack: stack, via: 'chooseAbility' });
    } catch (e) { err('chooseAbility-log', e.message); }
    return ret;
  });

  wrap('keepAbilities', function () {
    mark('keepAbilities');
    let ret = false;
    try { ret = origs.keepAbilities.apply(Game, arguments); } catch (e) { err('keepAbilities-call', e.message); }
    try {
      t.keepEvents.push({ seq: ++seq, day: dayOf(Game), kept: !!ret, stack: stackText(2), via: 'keepAbilities' });
    } catch (e) { err('keepAbilities-log', e.message); }
    return ret;
  });

  wrap('pumpLevelUps', function () {
    mark('pumpLevelUps');
    let ret = false;
    try { ret = origs.pumpLevelUps.apply(Game, arguments); } catch (e) { err('pumpLevelUps-call', e.message); }
    try {
      const ch = ((Game.state.scholar || {}).abilityChoices || []) || [];
      t.pumpEvents.push({ seq: ++seq, day: dayOf(Game), offered: !!ret,
        choices: ch.map(function (c) { return { id: c.id || null, src: c.src || null }; }),
        stack: stackText(2), via: 'pumpLevelUps' });
    } catch (e) { err('pumpLevelUps-log', e.message); }
    return ret;
  });

  wrap('levelUpOffers', function (track, level) {
    mark('levelUpOffers');
    let ret = [];
    try { ret = origs.levelUpOffers.call(Game, track, level); } catch (e) { err('levelUpOffers-call', e.message); }
    try {
      t.offerEvents.push({ seq: ++seq, day: dayOf(Game), track: track || null, level: (level == null ? null : level),
        ids: (ret || []).map(function (d) { return (d && d.id) || null; }), stack: stackText(2), via: 'levelUpOffers' });
    } catch (e) { err('levelUpOffers-log', e.message); }
    return ret;
  });

  // ---- (6) villager grants ----
  wrap('npcGrantAbility', function (vid, id) {
    mark('npcGrantAbility');
    const stack = stackText(2);
    let ret = false;
    try { ret = origs.npcGrantAbility.call(Game, vid, id); } catch (e) { err('npcGrantAbility-call', e.message); }
    try {
      t.villGrantEvents.push({ seq: ++seq, day: dayOf(Game), vid: vid || null, id: id || null,
        lane: abilityLane(Game, id), ok: !!ret, stack: stack, via: 'npcGrantAbility' });
    } catch (e) { err('npcGrantAbility-log', e.message); }
    return ret;
  });

  // ---- (7) villager skills ----
  wrap('npcLearnSkill', function (vid, abilityId) {
    mark('npcLearnSkill');
    const stack = stackText(2);
    let ret = false;
    try { ret = origs.npcLearnSkill.call(Game, vid, abilityId); } catch (e) { err('npcLearnSkill-call', e.message); }
    try {
      let sid = null;
      try { sid = (typeof Game.abilitySkillId === 'function') ? Game.abilitySkillId(abilityId) : null; } catch (e) {}
      t.skillEvents.push({ seq: ++seq, day: dayOf(Game), vid: vid || null, abilityId: abilityId || null,
        skillId: sid || abilityId, ok: !!ret, stack: stack, via: 'npcLearnSkill' });
    } catch (e) { err('npcLearnSkill-log', e.message); }
    return ret;
  });

  // ---- (8) villager sheet resolution ----
  wrap('villagerResolveLevelUps', function (vid) {
    mark('villagerResolveLevelUps');
    const stack = stackText(2);
    let sheetsBefore = null, absBefore = null, ret = null;
    try {
      const x = (((Game.state.village || {}).npcXp || {})[vid]) || {};
      sheetsBefore = (x.sheets || []).length;
      absBefore = (((Game.state.village || {}).npcAbilities || {})[vid] || []).slice();
    } catch (e) {}
    try { ret = origs.villagerResolveLevelUps.call(Game, vid); } catch (e) { err('villagerResolveLevelUps-call', e.message); }
    try {
      let sheetsAfter = null, absAfter = null;
      try {
        const x = (((Game.state.village || {}).npcXp || {})[vid]) || {};
        sheetsAfter = (x.sheets || []).length;
        absAfter = (((Game.state.village || {}).npcAbilities || {})[vid] || []).slice();
      } catch (e) {}
      t.villResolveEvents.push({ seq: ++seq, day: dayOf(Game), vid: vid || null, ret: (ret == null ? null : String(ret)),
        sheetsBefore: sheetsBefore, sheetsAfter: sheetsAfter,
        absBefore: absBefore, absAfter: absAfter, stack: stack, via: 'villagerResolveLevelUps' });
    } catch (e) { err('villagerResolveLevelUps-log', e.message); }
    return ret;
  });

  // ---- (9) ability use (scholar) ----
  wrap('useAbility', function (abilityId, actionId, target) {
    mark('useAbility');
    const stack = stackText(2);
    const inFight = inTbFight(Game);
    const wave = inFight ? fightWave(Game) : null;
    const kcalBefore = kcalOf(Game);
    let ret = false;
    try { ret = origs.useAbility.call(Game, abilityId, actionId, target); } catch (e) { err('useAbility-call', e.message); }
    try {
      t.useEvents.push({ seq: ++seq, day: dayOf(Game), id: abilityId || null, act: actionId || null,
        target: (target == null ? null : String(target)), lane: abilityLane(Game, abilityId),
        inTb: inFight, wave: wave, kcalBefore: kcalBefore, kcalAfter: kcalOf(Game),
        returned: !!ret, stack: stack, via: 'useAbility' });
    } catch (e) { err('useAbility-log', e.message); }
    return ret;
  });

  // ---- (10) villager ability use in tb fights ----
  function twinFlagSnap(v) {
    if (!v) return null;
    return { screamedDay: (v._vScreamedDay != null ? v._vScreamedDay : null),
      sand: !!v._vSandThrown, loomed: !!v._vLoomed, raged: !!v._vRaged, shoved: !!v._vShoved,
      warCried: !!v._warCried, stared: !!v._vStared, walkedIn: !!v._vWalkedIn,
      goaded: !!v._vGoaded, bound: !!v._vBound, ambushed: !!v._vAmbushed,
      haymakerPressed: !!v._vHaymakerPressed, deadAimed: !!v._vDeadAimed,
      aimed: !!v._vAimed, tradeOpened: !!v._vTradeOpened, debtSettled: !!v._vDebtSettled,
      readFight: !!v._vReadFight };
  }
  function monFlagSnap() {
    const out = {};
    try {
      const f = Game.tbfight || null;
      for (const m of ((f && f.fighters) || [])) {
        if (!m || m.kind !== 'monster') continue;
        out[m.key || ''] = { hp: m.hp != null ? m.hp : null, bird: (m._birdStrike || 0),
          frozen: (m._frozen || 0), turncoat: (m._turncoatRounds || 0), bound: (m._bound || 0) };
      }
    } catch (e) {}
    return out;
  }
  wrap('tbVillagerAbility', function (v) {
    mark('tbVillagerAbility');
    const stack = stackText(2);
    const inFight = inTbFight(Game);
    const twinBefore = twinFlagSnap(v);
    const monsBefore = inFight ? monFlagSnap() : null;
    let ret = false;
    try { ret = origs.tbVillagerAbility.call(Game, v); } catch (e) { err('tbVillagerAbility-call', e.message); }
    try {
      const fired = [];
      if (v && twinBefore) {
        const after = twinFlagSnap(v);
        if (after.screamedDay !== twinBefore.screamedDay) fired.push('scream_cheese');
        if (after.sand && !twinBefore.sand) fired.push('pocket_sand');
        if (after.loomed && !twinBefore.loomed) fired.push('fear_aura');
        if (after.raged && !twinBefore.raged) fired.push('rage');
        if (after.shoved && !twinBefore.shoved) fired.push('shoulder_check');
        if (after.warCried && !twinBefore.warCried) fired.push('war_cry');
        if (after.stared && !twinBefore.stared) fired.push('intimidating_presence');
        if (after.walkedIn && !twinBefore.walkedIn) fired.push('peacemaker');
        if (after.goaded && !twinBefore.goaded) fired.push('come_get_some');
        if (after.bound && !twinBefore.bound) fired.push('hogtie');
        if (after.ambushed && !twinBefore.ambushed) fired.push('ambush');
        if (after.haymakerPressed && !twinBefore.haymakerPressed) fired.push('haymaker');
        if (after.deadAimed && !twinBefore.deadAimed) fired.push('dead_aim');
        if (after.aimed && !twinBefore.aimed) fired.push('patient_aim');
        if (after.tradeOpened && !twinBefore.tradeOpened) fired.push('trade_of_blows');
        if (after.debtSettled && !twinBefore.debtSettled) fired.push('trade_of_blows_settle');
        if (after.readFight && !twinBefore.readFight) fired.push('brawler_instinct');
      }
      if (monsBefore) {
        const monsAfter = monFlagSnap();
        for (const k of Object.keys(monsAfter)) {
          const b = monsBefore[k] || {}, a = monsAfter[k] || {};
          if ((a.bird || 0) > (b.bird || 0)) fired.push('bird_strike(monster)');
          if ((a.frozen || 0) > (b.frozen || 0)) fired.push('freeze_tag(monster)');
          if ((a.turncoat || 0) > (b.turncoat || 0)) fired.push('turncoat(monster)');
          if ((a.hp != null && b.hp != null) && a.hp < b.hp) fired.push('monster_hp_down:' + (b.hp - a.hp));
        }
      }
      if (ret && !fired.length) fired.push('wrapped-unknown');
      t.npcAbilityEvents.push({ seq: ++seq, day: dayOf(Game), vid: (v && v.villagerId) || null,
        inTb: inFight, round: (Game.tbfight && Game.tbfight.round != null) ? Game.tbfight.round : null,
        returned: !!ret, fired: fired, stack: stack, via: 'tbVillagerAbility' });
    } catch (e) { err('tbVillagerAbility-log', e.message); }
    return ret;
  });

  // ---- (11) synergy unlocks ----
  wrap('unlockSynergy', function (syn) {
    mark('unlockSynergy');
    let ret;
    try { ret = origs.unlockSynergy.call(Game, syn); } catch (e) { err('unlockSynergy-call', e.message); }
    try {
      t.synergyUnlockEvents.push({ seq: ++seq, day: dayOf(Game),
        syn: (syn && typeof syn === 'object') ? (syn.id || '[obj]') : (syn == null ? null : String(syn)),
        stack: stackText(2), via: 'unlockSynergy' });
    } catch (e) { err('unlockSynergy-log', e.message); }
    return ret;
  });

  // ---- (12) evolution ----
  wrap('stageEvolution', function (ab) {
    mark('stageEvolution');
    let ret;
    try { ret = origs.stageEvolution.call(Game, ab); } catch (e) { err('stageEvolution-call', e.message); }
    try {
      const choices = ((Game.state.scholar || {}).evolutionChoices || []).map(function (c) { return c.id || null; });
      t.evolutionEvents.push({ seq: ++seq, day: dayOf(Game), id: (ab && ab.id) || null,
        level: (ab && ab.level) || null, choices: choices, stack: stackText(2), via: 'stageEvolution' });
    } catch (e) { err('stageEvolution-log', e.message); }
    return ret;
  });

  // ---- (13) channeling ----
  wrap('channelSentiment', function (idx) {
    mark('channelSentiment');
    let ret = null;
    try { ret = origs.channelSentiment.call(Game, idx); } catch (e) { err('channelSentiment-call', e.message); }
    try {
      t.channelEvents.push({ seq: ++seq, day: dayOf(Game), ref: (idx == null ? null : String(idx)),
        msg: (ret == null ? null : String(ret).slice(0, 300)), stack: stackText(2), via: 'channelSentiment' });
    } catch (e) { err('channelSentiment-log', e.message); }
    return ret;
  });

  // ---- (14) slot moments ----
  wrap('slotMoment', function (tt) {
    mark('slotMoment');
    let ret;
    try { ret = origs.slotMoment.call(Game, tt); } catch (e) { err('slotMoment-call', e.message); }
    try {
      let slots = null;
      try { slots = (typeof Game.abilitySlots === 'function') ? Game.abilitySlots() : null; } catch (e) {}
      t.slotEvents.push({ seq: ++seq, day: dayOf(Game), threshold: tt, slotsAfter: slots,
        stack: stackText(2), via: 'slotMoment' });
    } catch (e) { err('slotMoment-log', e.message); }
    return ret;
  });

  // ---- (15) passives ----
  wrap('checkPassiveUnlock', function (stat) {
    mark('checkPassiveUnlock');
    let before = null, ret;
    try { before = clone((Game.state.scholar || {}).passives || {}); } catch (e) {}
    try { ret = origs.checkPassiveUnlock.call(Game, stat); } catch (e) { err('checkPassiveUnlock-call', e.message); }
    try {
      const after = clone((Game.state.scholar || {}).passives || {});
      t.passiveEvents.push({ seq: ++seq, day: dayOf(Game), stat: stat || null,
        before: before, after: after, stack: stackText(2), via: 'checkPassiveUnlock' });
    } catch (e) { err('checkPassiveUnlock-log', e.message); }
    return ret;
  });

  // ---- (16) telemetry cross-check ----
  try {
    if (typeof Game.tele === 'function') {
      origs.tele = Game.tele;
      Game.tele = function (type, data) {
        let ret;
        try { ret = origs.tele.call(Game, type, data); } catch (e) { err('tele-call', e.message); }
        try {
          if (type === 'track_level' || type === 'ability_granted' || type === 'villager_skill' ||
              type === 'track_synergy' || type === 'ability_replaced' || type === 'level_up_kept') {
            t.teleEvents.push({ seq: ++seq, day: dayOf(Game), type: type, data: clone(data || {}) });
          }
          mark('tele');
        } catch (e) { err('tele-log', e.message); }
        return ret;
      };
    }
  } catch (e) { err('tele-wrap', e.message); }

  // ---- (17) daily snapshot ----
  function snapshot() {
    const snap = { day: dayOf(Game), seq: seq };
    try { snap.pantryKcal = pantryKcal(Game); } catch (e) { snap.pantryKcal = null; }
    try {
      snap.standing = Game.villageStanding ? Game.villageStanding() : null;
      if (snap.standing) snap.standing.raw = snap.standing.total;
    } catch (e) { snap.standing = null; }
    try { snap.gated = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) { snap.gated = null; }
    try { snap.scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { snap.scaleRank = null; }
    try { snap.nationalLive = !!(Game.state || {}).nationalLive; } catch (e) { snap.nationalLive = null; }
    try { snap.wave = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { snap.wave = null; }
    try { snap.bearer = Game.villagerId || null; } catch (e) { snap.bearer = null; }
    try {
      const s = Game.state.scholar || {};
      snap.integration = (s.integration == null ? null : s.integration);
      snap.slots = (typeof Game.abilitySlots === 'function') ? Game.abilitySlots() : null;
      snap.abilities = ((s.abilities || []).map(function (a) {
        return { id: a.id || null, level: a.level || 1, xp: a.xp || 0, lane: abilityLane(Game, a.id) };
      }));
      snap.backgroundAbilities = ((s.backgroundAbilities || []).map(function (a) {
        return { id: a.id || null, level: a.level || 1, xp: a.xp || 0, lane: abilityLane(Game, a.id) };
      }));
      snap.tracks = {};
      const tr = s.tracks || {};
      ['combat', 'field', 'social', 'craft', 'strange'].forEach(function (tk) {
        snap.tracks[tk] = tr[tk] ? { xp: tr[tk].xp || 0, level: tr[tk].level || 0 } : { xp: 0, level: 0 };
      });
      snap.levelUpQueue = ((s.levelUpQueue || []).map(function (q) { return { track: q.track || null, level: q.level || null }; }));
      snap.abilityChoices = ((s.abilityChoices || []).map(function (c) { return { id: c.id || null, src: c.src || null }; }));
      snap.surgeResonance = ((s.prog || {}).surgeResonance || 0);
      snap.sentimentTaught = !!((s.prog || {}).sentimentTaught);
      snap.pendingEvolution = s.pendingEvolution || null;
      snap.activeSynergies = (s.activeSynergies || []).slice();
      snap.unlockedSynergies = (s.synergies || []).slice();
      snap.passives = clone(s.passives || {});
      snap.passiveBonus = {};
      try {
        Object.keys(Game.PASSIVES || {}).forEach(function (pid) {
          try { snap.passiveBonus[pid] = (typeof Game.passiveBonus === 'function') ? Game.passiveBonus(pid) : null; } catch (e) { snap.passiveBonus[pid] = null; }
        });
      } catch (e) {}
      snap.trackStats = clone(s.trackStats || {});
      snap.kcal = (s.kcal == null ? null : s.kcal);
    } catch (e) { err('snapshot-scholar', e.message); }
    try {
      const v = Game.state.village || {};
      snap.roster = (v.roster || []).slice();
      snap.npcAbilities = {};
      Object.keys(v.npcAbilities || {}).forEach(function (vid) { snap.npcAbilities[vid] = (v.npcAbilities[vid] || []).slice(); });
      snap.npcSkills = {};
      Object.keys(v.npcSkills || {}).forEach(function (vid) { snap.npcSkills[vid] = (v.npcSkills[vid] || []).slice(); });
      snap.npcXp = {};
      Object.keys(v.npcXp || {}).forEach(function (vid) {
        const x = v.npcXp[vid] || {};
        const rec = { granted: clone(x.granted || {}), skilled: clone(x.skilled || {}), sheets: (x.sheets || []).length };
        ['combat', 'field', 'social', 'craft', 'strange'].forEach(function (tk) { rec[tk] = x[tk] || 0; });
        snap.npcXp[vid] = rec;
      });
    } catch (e) { err('snapshot-village', e.message); }
    t.daily.push(snap);
    return snap;
  }

  function uninstall() {
    try {
      Object.keys(origs).forEach(function (name) {
        try { Game[name] = origs[name]; } catch (e) { err('uninstall-' + name, e.message); }
      });
    } catch (e) { err('uninstall', e.message); }
  }

  return { t: t, snapshot: snapshot, uninstall: uninstall };
}

module.exports = { install: install };
