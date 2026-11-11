// kinfirst-instrument-20261111.js — kin / naming / childbirth / keepsakes
// first-numbers recorder (arm sim-kinfirst-b, run fleshout-loop-b-20261111T1131Z).
// Scripts only, zero src/js.
//
// Records, per seed:
//   (1) NAMING (nameBaby / bestowUseName / nameUnnamedBabies /
//       babyNamingPending): every call — args, gate outcome, return.
//   (2) KEEPSAKE GROWTH (keepsakeGrow / keepsakeLevelBeat /
//       keepsakeMaybeOffer / offerRelicEnhancement / accrueRelicBond):
//       every call — item, gain, why, bond/level before/after, worn,
//       mine, lane; offers with options + threshold.
//   (3) THREAD HOME (keepsakeThreadCheck / keepsakeTrailCheck): every
//       call — taken-kin found, clue recorded (kind), trail ok.
//   (4) KEEPSAKE POWERS (keepsakeLuckyBreak / keepsakeHoldsGround /
//       keepsakeAnchorPursuit / addTrauma / useAbility 'keepsake' only):
//       every call — returned, context, kcal.
//   (5) SLOTS + MIGRATION (equipAccessory / migrateKeepsakes): every
//       call — target or refusal, keepsakes worn after.
//   (6) FLASHBACKS (playFlashback): every call — item, memoryOf or
//       not, keepsake-classified or not.
//   (7) KIN DEATHS (creditDeed, ONLY deedId 'death_in_family'):
//       every call — who, granted.
//   (8) SUCCESSION (playerDeath / mantleBecome): every call — cause,
//       old/new bearer, lineage + fallen lengths, keepsakes buried,
//       what the successor brings.
//   (9) TELEMETRY CROSS-CHECK (tele, if present): 'mantle_become'
//       events only.
//  (10) BIRTHS: NO Game method exists — detected by daily snapshot
//       diffs of every otherVillage roster (new person with birthDay,
//       unnamed) + village.news baby lines; home roster diffs likewise.
//  (11) DAILY SNAPSHOT: scholar keepsakes (inventory + equipped),
//       keepsakeThread clues, keepsakeTakenKin list, bearer lifeseed
//       people + taken kin, home roster (partner/children/calledName),
//       otherVillages roster summary (babies, pending namings),
//       lineage + fallen entries, pantry kcal, standing, scaleRank,
//       nationalLive, wave.
//
// All wraps are record-only: call the original, return its value
// unchanged, never alter state, never consume RNG. Any failure in
// the RECORDING path is logged to instrumentErrors, never thrown
// into the game.
//
// KNOWN WRAP RISK (secondlink-a / diplo-a lesson): a wrap records
// nothing if the engine calls the closure instead of the Game
// method. The proof (scripts/test-kinfirst-b.js) verifies EACH
// wrapped method's call path is live on a fixture or live
// miniature; a wrap with no live call observed is marked dead in
// the evidence and its zero is never treated as evidence.
//
// Usage: const KF = require('./kinfirst-instrument-20261111');
//   const kf = KF.install(Game); kf.snapshot(); ... kf.uninstall();
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
function itemIdOf(it) { try { return (it && (it.itemId || it.id)) || null; } catch (e) { return null; } }
function itemNameOf(it) { try { return (it && (it.name || it.itemId || it.id)) || null; } catch (e) { return null; } }
function isSentimental(Game, it) {
  try {
    if (Game.isKeepsake) return !!Game.isKeepsake(it);
    const def = (Game.data.items || []).find(function (x) { return x && x.id === itemIdOf(it); });
    return !!(def && def.class === 'sentimental');
  } catch (e) { return false; }
}
function ksLane(Game, it) {
  try { return (typeof Game.keepsakeLane === 'function') ? Game.keepsakeLane(it) : 'unknown'; } catch (e) { return 'unknown'; }
}
function ksLevel(Game, it) {
  try { return (typeof Game.keepsakeLevel === 'function') ? Game.keepsakeLevel(it) : null; } catch (e) { return null; }
}
function ksWorn(Game, it) {
  try { return (typeof Game.keepsakeIsWorn === 'function') ? !!Game.keepsakeIsWorn(it) : null; } catch (e) { return null; }
}
function ksMine(Game, it) {
  try { return (typeof Game.keepsakeMine === 'function') ? !!Game.keepsakeMine(it) : null; } catch (e) { return null; }
}
function ksDef(Game, it) {
  try { return (Game.data.items || []).find(function (x) { return x && x.id === itemIdOf(it); }) || null; } catch (e) { return null; }
}
function inTbFight(Game) {
  try { const f = Game.tbfight; return !!(f && !f.over); } catch (e) { return false; }
}
function trustOf(Game, vid) {
  try { const t = ((Game.state.village || {}).trust || {})[vid]; return (t === undefined ? null : t); } catch (e) { return null; }
}

function install(Game) {
  const t = {
    nameBabyEvents: [], useNameEvents: [], autoNameEvents: [], pendingEvents: [],
    growEvents: [], levelBeatEvents: [], threadEvents: [], trailEvents: [],
    maybeOfferEvents: [], relicOfferEvents: [], bondCallEvents: [],
    luckyEvents: [], holdEvents: [], anchorEvents: [], traumaEvents: [],
    useKsEvents: [], equipEvents: [], migrateEvents: [], flashbackEvents: [],
    deathInFamilyEvents: [], playerDeathEvents: [], mantleEvents: [],
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
  function ksSnap(it) {
    if (!it) return null;
    const def = ksDef(Game, it);
    return { id: itemIdOf(it), name: itemNameOf(it), kin: def ? (def.kin || null) : null,
      lane: ksLane(Game, it), bond: (it.bond || 0), level: ksLevel(Game, it),
      worn: ksWorn(Game, it), mine: ksMine(Game, it),
      owner: it.owner || null, memoryOf: it.memoryOf || null,
      takenKin: it.takenKin ? clone(it.takenKin) : null,
      enhancements: (it.enhancements || []).slice(),
      bondOffered: (it.bondOffered || []).slice() };
  }

  // ---- (1) naming ----
  wrap('nameBaby', function (villageId, babyId, name) {
    mark('nameBaby');
    const stack = stackText(2);
    let ret = null;
    try { ret = origs.nameBaby.call(Game, villageId, babyId, name); } catch (e) { err('nameBaby-call', e.message); }
    try {
      t.nameBabyEvents.push({ seq: ++seq, day: dayOf(Game), villageId: villageId || null,
        babyId: babyId || null, name: (name == null ? null : String(name)),
        ok: !!(ret && ret.ok), already: !!(ret && ret.already), empty: !!(ret && ret.empty),
        ret: ret ? clone(ret) : null, stack: stack, via: 'nameBaby' });
    } catch (e) { err('nameBaby-log', e.message); }
    return ret;
  });

  wrap('bestowUseName', function (vid, name) {
    mark('bestowUseName');
    const stack = stackText(2);
    const trustBefore = trustOf(Game, vid);
    let ret = null;
    try { ret = origs.bestowUseName.call(Game, vid, name); } catch (e) { err('bestowUseName-call', e.message); }
    try {
      let calledName = null;
      try {
        const v = (typeof Game.getPerson === 'function' ? Game.getPerson(vid) : null)
          || (Game.data.villagers || []).find(function (x) { return x.id === vid; });
        calledName = v ? (v.calledName || null) : null;
      } catch (e2) {}
      t.useNameEvents.push({ seq: ++seq, day: dayOf(Game), vid: vid || null,
        name: (name == null ? null : String(name)), trustBefore: trustBefore,
        ok: !!(ret && ret.ok), empty: !!(ret && ret.empty), replaced: !!(ret && ret.replaced),
        calledNameAfter: calledName, stack: stack, via: 'bestowUseName' });
    } catch (e) { err('bestowUseName-log', e.message); }
    return ret;
  });

  wrap('nameUnnamedBabies', function (village) {
    mark('nameUnnamedBabies');
    const stack = stackText(2);
    let before = null;
    try {
      before = ((village || {}).roster || []).filter(function (p) { return p && p.alive && p.unnamed; })
        .map(function (p) { return { id: p.id, birthDay: p.birthDay }; });
    } catch (e) {}
    try { origs.nameUnnamedBabies.call(Game, village); } catch (e) { err('nameUnnamedBabies-call', e.message); }
    try {
      const named = [];
      try {
        const afterMap = {};
        ((village || {}).roster || []).forEach(function (p) { if (p) afterMap[p.id] = p; });
        (before || []).forEach(function (b) {
          const a = afterMap[b.id];
          if (a && !a.unnamed) named.push({ id: b.id, name: a.name || null, namedBy: a.namedBy || null, birthDay: b.birthDay });
        });
      } catch (e2) {}
      t.autoNameEvents.push({ seq: ++seq, day: dayOf(Game), villageId: (village && village.id) || null,
        unnamedBefore: (before || []).length, named: named, stack: stack, via: 'nameUnnamedBabies' });
    } catch (e) { err('nameUnnamedBabies-log', e.message); }
    return undefined;
  });

  wrap('babyNamingPending', function (villageId) {
    mark('babyNamingPending');
    let ret = null;
    try { ret = origs.babyNamingPending.call(Game, villageId); } catch (e) { err('babyNamingPending-call', e.message); }
    try {
      t.pendingEvents.push({ seq: ++seq, day: dayOf(Game), villageId: villageId || null,
        pending: !!ret, babyId: (ret && ret.babyId) || null, parentName: (ret && ret.parentName) || null,
        stack: stackText(2), via: 'babyNamingPending' });
    } catch (e) { err('babyNamingPending-log', e.message); }
    return ret;
  });

  // ---- (2) keepsake growth ----
  wrap('keepsakeGrow', function (r, gain, why) {
    mark('keepsakeGrow');
    const stack = stackText(2);
    const bondBefore = r ? (r.bond || 0) : null;
    const levelBefore = r ? ksLevel(Game, r) : null;
    const wornBefore = r ? ksWorn(Game, r) : null;
    let ret = 0;
    try { ret = origs.keepsakeGrow.call(Game, r, gain, why); } catch (e) { err('keepsakeGrow-call', e.message); }
    try {
      t.growEvents.push({ seq: ++seq, day: dayOf(Game), id: itemIdOf(r), name: itemNameOf(r),
        lane: r ? ksLane(Game, r) : null, gainArg: (gain == null ? null : gain), why: (why == null ? null : String(why)),
        bondBefore: bondBefore, bondAfter: r ? (r.bond || 0) : null,
        levelBefore: levelBefore, levelAfter: r ? ksLevel(Game, r) : null,
        worn: wornBefore, mine: r ? ksMine(Game, r) : null, applied: ret,
        stack: stack, via: 'keepsakeGrow' });
    } catch (e) { err('keepsakeGrow-log', e.message); }
    return ret;
  });

  wrap('keepsakeLevelBeat', function (r, before, after) {
    mark('keepsakeLevelBeat');
    try { origs.keepsakeLevelBeat.call(Game, r, before, after); } catch (e) { err('keepsakeLevelBeat-call', e.message); }
    try {
      t.levelBeatEvents.push({ seq: ++seq, day: dayOf(Game), id: itemIdOf(r), name: itemNameOf(r),
        lane: r ? ksLane(Game, r) : null, before: before, after: after,
        stack: stackText(2), via: 'keepsakeLevelBeat' });
    } catch (e) { err('keepsakeLevelBeat-log', e.message); }
    return undefined;
  });

  wrap('keepsakeMaybeOffer', function (r) {
    mark('keepsakeMaybeOffer');
    let ret = false;
    try { ret = origs.keepsakeMaybeOffer.call(Game, r); } catch (e) { err('keepsakeMaybeOffer-call', e.message); }
    try {
      t.maybeOfferEvents.push({ seq: ++seq, day: dayOf(Game), id: itemIdOf(r), name: itemNameOf(r),
        bond: r ? (r.bond || 0) : null, offered: !!ret, stack: stackText(2), via: 'keepsakeMaybeOffer' });
    } catch (e) { err('keepsakeMaybeOffer-log', e.message); }
    return ret;
  });

  wrap('offerRelicEnhancement', function (item, threshold) {
    mark('offerRelicEnhancement');
    const stack = stackText(2);
    try { origs.offerRelicEnhancement.call(Game, item, threshold); } catch (e) { err('offerRelicEnhancement-call', e.message); }
    try {
      let choices = null;
      try {
        const rc = ((Game.state || {}).scholar || {}).relicChoices || null;
        choices = rc ? { itemId: rc.itemId || null, threshold: rc.threshold,
          options: (rc.options || []).map(function (o) { return { id: o.id || null, secret: !!o.secret }; }) } : null;
      } catch (e2) {}
      const def = ksDef(Game, item);
      t.relicOfferEvents.push({ seq: ++seq, day: dayOf(Game), id: itemIdOf(item), name: itemNameOf(item),
        keepsake: isSentimental(Game, item), cls: def ? (def.class || null) : null,
        threshold: threshold, bond: item ? (item.bond || 0) : null,
        choices: choices, stack: stack, via: 'offerRelicEnhancement' });
    } catch (e) { err('offerRelicEnhancement-log', e.message); }
    return undefined;
  });

  wrap('accrueRelicBond', function () {
    mark('accrueRelicBond');
    try { origs.accrueRelicBond.apply(Game, arguments); } catch (e) { err('accrueRelicBond-call', e.message); }
    try {
      t.bondCallEvents.push({ seq: ++seq, day: dayOf(Game), stack: stackText(2), via: 'accrueRelicBond' });
    } catch (e) { err('accrueRelicBond-log', e.message); }
    return undefined;
  });

  // ---- (3) thread home ----
  wrap('keepsakeThreadCheck', function (r) {
    mark('keepsakeThreadCheck');
    const stack = stackText(2);
    let cluesBefore = null;
    try { cluesBefore = (((Game.state || {}).keepsakeThread || {}).clues || []).length; } catch (e) {}
    let ret = false;
    try { ret = origs.keepsakeThreadCheck.call(Game, r); } catch (e) { err('keepsakeThreadCheck-call', e.message); }
    try {
      let cluesAfter = null, newClue = null;
      try {
        const clues = (((Game.state || {}).keepsakeThread || {}).clues || []);
        cluesAfter = clues.length;
        if (cluesAfter > (cluesBefore || 0)) newClue = clone(clues[clues.length - 1]);
      } catch (e2) {}
      t.threadEvents.push({ seq: ++seq, day: dayOf(Game), id: itemIdOf(r), name: itemNameOf(r),
        takenKinFound: !!ret, cluesBefore: cluesBefore, cluesAfter: cluesAfter,
        newClue: newClue, takenKin: r ? (r.takenKin ? clone(r.takenKin) : null) : null,
        stack: stack, via: 'keepsakeThreadCheck' });
    } catch (e) { err('keepsakeThreadCheck-log', e.message); }
    return ret;
  });

  wrap('keepsakeTrailCheck', function (r) {
    mark('keepsakeTrailCheck');
    let ret = false;
    try { ret = origs.keepsakeTrailCheck.call(Game, r); } catch (e) { err('keepsakeTrailCheck-call', e.message); }
    try {
      t.trailEvents.push({ seq: ++seq, day: dayOf(Game), id: itemIdOf(r), name: itemNameOf(r),
        level: r ? ksLevel(Game, r) : null, ok: !!ret, stack: stackText(2), via: 'keepsakeTrailCheck' });
    } catch (e) { err('keepsakeTrailCheck-log', e.message); }
    return ret;
  });

  // ---- (4) keepsake powers ----
  wrap('keepsakeLuckyBreak', function (where) {
    mark('keepsakeLuckyBreak');
    let ret = false;
    try { ret = origs.keepsakeLuckyBreak.call(Game, where); } catch (e) { err('keepsakeLuckyBreak-call', e.message); }
    try {
      t.luckyEvents.push({ seq: ++seq, day: dayOf(Game), where: (where == null ? null : String(where)),
        inTb: inTbFight(Game), returned: !!ret, stack: stackText(2), via: 'keepsakeLuckyBreak' });
    } catch (e) { err('keepsakeLuckyBreak-log', e.message); }
    return ret;
  });

  wrap('keepsakeHoldsGround', function (fighter) {
    mark('keepsakeHoldsGround');
    let ret = false;
    try { ret = origs.keepsakeHoldsGround.call(Game, fighter); } catch (e) { err('keepsakeHoldsGround-call', e.message); }
    try {
      t.holdEvents.push({ seq: ++seq, day: dayOf(Game),
        fighterKind: (fighter && fighter.kind) || null, returned: !!ret,
        stack: stackText(2), via: 'keepsakeHoldsGround' });
    } catch (e) { err('keepsakeHoldsGround-log', e.message); }
    return ret;
  });

  wrap('keepsakeAnchorPursuit', function () {
    mark('keepsakeAnchorPursuit');
    let ret = 0;
    try { ret = origs.keepsakeAnchorPursuit.apply(Game, arguments); } catch (e) { err('keepsakeAnchorPursuit-call', e.message); }
    try {
      t.anchorEvents.push({ seq: ++seq, day: dayOf(Game), returned: ret,
        stack: stackText(2), via: 'keepsakeAnchorPursuit' });
    } catch (e) { err('keepsakeAnchorPursuit-log', e.message); }
    return ret;
  });

  wrap('addTrauma', function (n) {
    mark('addTrauma');
    let resolveOn = null;
    try { resolveOn = (typeof Game.keepsakePassive === 'function') ? !!Game.keepsakePassive('resolve') : null; } catch (e) {}
    let ret;
    try { ret = origs.addTrauma.call(Game, n); } catch (e) { err('addTrauma-call', e.message); }
    try {
      t.traumaEvents.push({ seq: ++seq, day: dayOf(Game), nIn: (n == null ? null : n),
        resolvePassiveOn: resolveOn, ret: (ret == null ? null : ret),
        stack: stackText(2), via: 'addTrauma' });
    } catch (e) { err('addTrauma-log', e.message); }
    return ret;
  });

  wrap('useAbility', function (abilityId, actionId, target) {
    mark('useAbility');
    const stack = stackText(2);
    const inFight = inTbFight(Game);
    const kcalBefore = kcalOf(Game);
    let ret = false;
    try { ret = origs.useAbility.call(Game, abilityId, actionId, target); } catch (e) { err('useAbility-call', e.message); }
    try {
      if (abilityId === 'keepsake') {
        t.useKsEvents.push({ seq: ++seq, day: dayOf(Game), action: actionId || null,
          target: (target == null ? null : String(target)), inTb: inFight,
          kcalBefore: kcalBefore, kcalAfter: kcalOf(Game), returned: !!ret,
          stack: stack, via: 'useAbility' });
      }
    } catch (e) { err('useAbility-log', e.message); }
    return ret;
  });

  // ---- (5) slots + migration ----
  wrap('equipAccessory', function (idx, slot) {
    mark('equipAccessory');
    const stack = stackText(2);
    let ret = null;
    try { ret = origs.equipAccessory.call(Game, idx, slot); } catch (e) { err('equipAccessory-call', e.message); }
    try {
      let wornAfter = null;
      try { wornAfter = (typeof Game.wornKeepsakes === 'function') ? Game.wornKeepsakes().map(function (it) { return itemIdOf(it); }) : null; } catch (e2) {}
      t.equipEvents.push({ seq: ++seq, day: dayOf(Game), idx: idx, slot: slot || null,
        target: ret, wornAfter: wornAfter, stack: stack, via: 'equipAccessory' });
    } catch (e) { err('equipAccessory-log', e.message); }
    return ret;
  });

  wrap('migrateKeepsakes', function () {
    mark('migrateKeepsakes');
    let ret = false;
    try { ret = origs.migrateKeepsakes.apply(Game, arguments); } catch (e) { err('migrateKeepsakes-call', e.message); }
    try {
      let wornAfter = null;
      try { wornAfter = (typeof Game.wornKeepsakes === 'function') ? Game.wornKeepsakes().map(function (it) { return itemIdOf(it); }) : null; } catch (e2) {}
      t.migrateEvents.push({ seq: ++seq, day: dayOf(Game), returned: !!ret,
        wornAfter: wornAfter, stack: stackText(2), via: 'migrateKeepsakes' });
    } catch (e) { err('migrateKeepsakes-log', e.message); }
    return ret;
  });

  // ---- (6) flashbacks ----
  wrap('playFlashback', function (item, def) {
    mark('playFlashback');
    const stack = stackText(2);
    try { origs.playFlashback.call(Game, item, def); } catch (e) { err('playFlashback-call', e.message); }
    try {
      t.flashbackEvents.push({ seq: ++seq, day: dayOf(Game), id: itemIdOf(item), name: itemNameOf(item),
        memoryOf: (item && item.memoryOf) || null, keepsake: isSentimental(Game, item),
        owner: (item && item.owner) || null, stack: stack, via: 'playFlashback' });
    } catch (e) { err('playFlashback-log', e.message); }
    return undefined;
  });

  // ---- (7) kin deaths (narrow deed wrap) ----
  wrap('creditDeed', function (who, deedId, trackOverride) {
    mark('creditDeed');
    const stack = stackText(2);
    let ret = 0;
    try { ret = origs.creditDeed.call(Game, who, deedId, trackOverride); } catch (e) { err('creditDeed-call', e.message); }
    try {
      if (deedId === 'death_in_family') {
        t.deathInFamilyEvents.push({ seq: ++seq, day: dayOf(Game), who: who || null,
          granted: ret, stack: stack, via: 'creditDeed' });
      }
    } catch (e) { err('creditDeed-log', e.message); }
    return ret;
  });

  // ---- (8) succession ----
  function sentCount() {
    try {
      const s = Game.state.scholar || {};
      const all = (s.inventory || []).concat(Object.keys(s.equipped || {}).map(function (k) { return s.equipped[k]; }));
      return all.filter(function (it) { return it && isSentimental(Game, it); }).length;
    } catch (e) { return null; }
  }
  wrap('playerDeath', function (cause) {
    mark('playerDeath');
    const stack = stackText(2);
    let oldId = null, oldName = null, linBefore = null, falBefore = null, sentBefore = null;
    try {
      oldId = Game.villagerId || null;
      const ch = (Game.data.villagers || []).find(function (v) { return v.id === oldId; });
      oldName = ch ? (ch.name || null) : null;
      linBefore = (typeof Game.lineage === 'function') ? Game.lineage().length : null;
      falBefore = (((Game.state.village || {}).fallen) || []).length;
      sentBefore = sentCount();
    } catch (e) {}
    try { origs.playerDeath.call(Game, cause); } catch (e) { err('playerDeath-call', e.message); }
    try {
      let linAfter = null, falAfter = null, sentAfter = null, newId = null;
      try { linAfter = (typeof Game.lineage === 'function') ? Game.lineage().length : null; } catch (e2) {}
      try { falAfter = (((Game.state.village || {}).fallen) || []).length; } catch (e2) {}
      try { sentAfter = sentCount(); } catch (e2) {}
      try { newId = Game.villagerId || null; } catch (e2) {}
      t.playerDeathEvents.push({ seq: ++seq, day: dayOf(Game), cause: (cause == null ? null : String(cause)),
        oldId: oldId, oldName: oldName, newId: newId,
        lineageBefore: linBefore, lineageAfter: linAfter,
        fallenBefore: falBefore, fallenAfter: falAfter,
        sentBefore: sentBefore, sentAfter: sentAfter,
        stack: stack, via: 'playerDeath' });
    } catch (e) { err('playerDeath-log', e.message); }
    return undefined;
  });

  wrap('mantleBecome', function (oldId, newId) {
    mark('mantleBecome');
    const stack = stackText(2);
    let ret = false;
    try { ret = origs.mantleBecome.call(Game, oldId, newId); } catch (e) { err('mantleBecome-call', e.message); }
    try {
      let abCount = null, trackXp = null, gearCount = null, wornKs = null;
      try {
        const s = Game.state.scholar || {};
        abCount = (s.abilities || []).length;
        trackXp = {};
        const tr = s.tracks || {};
        Object.keys(tr).forEach(function (k) { trackXp[k] = tr[k] ? (tr[k].xp || 0) : 0; });
        gearCount = Object.keys(s.equipped || {}).length;
        wornKs = (typeof Game.wornKeepsakes === 'function') ? Game.wornKeepsakes().map(function (it) { return itemIdOf(it); }) : null;
      } catch (e2) {}
      t.mantleEvents.push({ seq: ++seq, day: dayOf(Game), oldId: oldId || null, newId: newId || null,
        ok: !!ret, successorAbilities: abCount, successorTrackXp: trackXp,
        successorGearSlots: gearCount, successorWornKeepsakes: wornKs,
        stack: stack, via: 'mantleBecome' });
    } catch (e) { err('mantleBecome-log', e.message); }
    return ret;
  });

  // ---- (9) telemetry cross-check ----
  try {
    if (typeof Game.tele === 'function') {
      origs.tele = Game.tele;
      Game.tele = function (type, data) {
        let ret;
        try { ret = origs.tele.call(Game, type, data); } catch (e) { err('tele-call', e.message); }
        try {
          if (type === 'mantle_become') {
            t.teleEvents.push({ seq: ++seq, day: dayOf(Game), type: type, data: clone(data || {}) });
          }
          mark('tele');
        } catch (e) { err('tele-log', e.message); }
        return ret;
      };
    }
  } catch (e) { err('tele-wrap', e.message); }

  // ---- (10/11) daily snapshot (births by roster diff in the analyzer) ----
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
    // scholar keepsakes (inventory + equipped)
    try {
      const s = Game.state.scholar || {};
      const all = [];
      (s.inventory || []).forEach(function (it) { if (it && isSentimental(Game, it)) all.push(ksSnap(it)); });
      Object.keys(s.equipped || {}).forEach(function (sl) {
        const it = s.equipped[sl];
        if (it && isSentimental(Game, it)) all.push(Object.assign(ksSnap(it), { slot: sl }));
      });
      snap.keepsakes = all;
    } catch (e) { err('snapshot-keepsakes', e.message); snap.keepsakes = null; }
    // thread-home clues + taken kin
    try { snap.threadClues = clone(((Game.state || {}).keepsakeThread || {}).clues || []); } catch (e) { snap.threadClues = null; }
    try { snap.takenKin = (typeof Game.keepsakeTakenKin === 'function') ? Game.keepsakeTakenKin() : null; } catch (e) { snap.takenKin = null; }
    // bearer lifeseed kin
    try {
      const bid = Game.villagerId || null;
      const ch = (Game.data.villagers || []).find(function (v) { return v.id === bid; }) || null;
      snap.bearerName = ch ? (ch.name || null) : null;
      const ls = ch ? (ch.lifeseed || null) : null;
      snap.lifeseedPeople = ls ? ((ls.people || []).map(function (p) { return { name: p.name || null, relation: p.relation || null }; })) : null;
      snap.takenKinOf = (typeof Game.takenKinOf === 'function' && bid) ? Game.takenKinOf(bid) : null;
    } catch (e) { err('snapshot-lifeseed', e.message); }
    // home roster (kin links) — roster entries are villager IDs; resolve
    // each to its person record (same pattern as naming-rite.js).
    try {
      const v = Game.state.village || {};
      snap.roster = ((v.roster || []).map(function (entry) {
        const p = (typeof entry === 'string')
          ? ((typeof Game.getPerson === 'function' ? Game.getPerson(entry) : null)
            || (Game.data.villagers || []).find(function (x) { return x.id === entry; }) || { id: entry })
          : entry;
        return { id: p.id || null, name: p.name || null, age: (p.age == null ? null : Math.round(p.age * 10) / 10),
          alive: !!p.alive, partner: p.partner || null, children: (p.children || []).slice(),
          parents: (p.parents || []).slice(), calledName: p.calledName || null,
          unnamed: !!p.unnamed, birthDay: (p.birthDay == null ? null : p.birthDay) };
      }));
      snap.fallen = clone(v.fallen || []);
      try { snap.lineage = (typeof Game.lineage === 'function') ? clone(Game.lineage()) : null; } catch (e2) { snap.lineage = null; }
    } catch (e) { err('snapshot-roster', e.message); }
    // other villages (birth detection surface)
    try {
      snap.otherVillages = ((Game.state || {}).otherVillages || []).map(function (ov) {
        const babies = ((ov.roster || []).filter(function (p) { return p && (p.unnamed || (p.age != null && p.age < 5)); })
          .map(function (p) { return { id: p.id, name: p.name || null, unnamed: !!p.unnamed, birthDay: p.birthDay, age: p.age, alive: !!p.alive, parents: (p.parents || []).slice() }; }));
        return { id: ov.id || null, name: ov.name || null, day: ov.day || null,
          rosterCount: (ov.roster || []).length,
          aliveCount: (ov.roster || []).filter(function (p) { return p && p.alive; }).length,
          babies: babies, pendingBabyNaming: ov.pendingBabyNaming || null,
          babyNews: ((ov.news || []).filter(function (n) { return /👶|baby|born/i.test(String(n)); })).slice(-5) };
      });
    } catch (e) { err('snapshot-other', e.message); snap.otherVillages = null; }
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
