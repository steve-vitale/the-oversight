// corruptfirst-instrument-20261111.js — corruption / cannibalism
// first-numbers recorder (arm sim-corruptfirst-a, run
// fleshout-20261111T1408Z). Scripts only, zero src/js.
//
// Records, per seed:
//   (1) CORRUPTION ADDS (addCorruption / addNpcCorruption): every call —
//       who, n, reason, corruption before/after.
//   (2) THE SLOPE (corpseButcher / eatCannibal): every call — granted or
//       refused, units, trauma/corruption deltas, norm at the call, crime
//       events fired during the call (seq-correlated), Trembles present
//       after (seList read).
//   (3) DISEASE (contractDisease): every call — id, source, returned;
//       Trembles flagged.
//   (4) CRIMES (recordCrime): every call — type, witnessed, victim,
//       villain, crimes count after.
//   (5) THRESHOLD BEATS (corruptionThresholdBeat): every call —
//       before/after, crossed thresholds.
//   (6) TICKS (cravingTick / npcDriftTick / npcCannibalTick / temptTick /
//       darkCarePackageTick / psychoViolenceTick): every call — day, part,
//       effect deltas (energy, npc corruption map, npcFed corpses,
//       inventory meat delta, psycho stages). corruptionTick itself is
//       invocation-counted only (it runs every part).
//   (7) PSYCHO SPAWN / MANTLE (psychoIntro / mantleWatch): every call —
//       fired or not, corruption carried, darkPath.
//   (8) DISCOVERY (discoverNpcCannibalism): every call — cid, discovered.
//   (9) FEAR (addFear / fearWeakness / intimidate): every call —
//       vid/target/n, before/after, returned value, collapse or not.
//  (10) FOIL (trustGainProgressive): every call counted; drag events
//       recorded only when the foil can apply (scholar corruption
//       >= 30), with the corruption-attributable drag recovered from
//       the final value (implied base = returned / (1 - c/250)).
//  (11) JUSTICE HEAT (justiceHeat): every call — heat, norm at call.
//  (12) SHOW (darkShowBeat): every call — kind.
//  (13) MEMORY (remember): filtered to corruption keys only —
//       shared_secret with the exact eatCannibal text (approving
//       witness), offered_meat, exposed_cannibal, saw_weakness,
//       you_threatened.
//  (14) DAILY SNAPSHOT: scholar corruption/meals/trauma/darkPath;
//       village corruption mean + map; cannibalNorm; starvingVillage;
//       normShift; avgFearOf scholar; dread entries; human-meat units;
//       person-corpses (total/butchered/npcFed/npcKnown); justice crimes
//       + stage + exiled + exileDay; Trembles cases (scholar +
//       villagers, via seList); malicious-dark roster count + psycho
//       stages; pantry kcal, roster, standing, scaleRank, nationalLive,
//       wave.
//
// All wraps are record-only: call the original, return its value
// unchanged, never alter state, never consume RNG. Any failure in
// the RECORDING path is logged to instrumentErrors, never thrown
// into the game.
//
// KNOWN WRAP RISK (secondlink-a / diplo-a lesson): a wrap records
// nothing if the engine calls the closure instead of the Game
// method. The proof (scripts/test-corruptfirst-a.js) verifies EACH
// wrapped method's call path is live on a fixture or live
// miniature; a wrap with no live call observed is marked dead in
// the evidence and its zero is never treated as evidence.
//
// Tele cross-check: NONE — corruption fires no tele events (no
// tele('crime'/'moot'/'exile'/'cannibal') anywhere in src/js). The
// cross-check is snapshot reconciliation instead: justice crimes
// in daily snapshots vs recordCrime events, NPC corruption deltas
// vs addNpcCorruption events.
//
// Usage: const CF = require('./corruptfirst-instrument-20261111');
//   const cf = CF.install(Game); cf.snapshot(); ... cf.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function stackText(skip) {
  try { return (new Error().stack || '').split('\n').slice(skip || 0).join(' | '); } catch (e) { return ''; }
}
function clone(o) { try { return JSON.parse(JSON.stringify(o || {})); } catch (e) { return {}; } }
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) { return null; }
}
function scholarCorr(Game) { try { return (typeof Game.corruptionOf === 'function') ? Game.corruptionOf('player') : (((Game.state || {}).scholar || {}).corruption || 0); } catch (e) { return null; } }
function npcCorrMap(Game) { try { return clone(((Game.state || {}).village || {}).corruption || {}); } catch (e) { return {}; } }
function humanMeatUnits(Game) {
  try {
    return ((Game.state.scholar || {}).inventory || [])
      .filter(function (i) { return i && i.plantId === 'meat_human'; })
      .reduce(function (t, i) { return t + (i.units || 1); }, 0);
  } catch (e) { return null; }
}
function corpseStats(Game) {
  const out = { total: 0, person: 0, butchered: 0, npcFed: 0, npcKnown: 0 };
  try {
    const list = (typeof Game.corpses === 'function') ? (Game.corpses() || []) : ((Game.state || {}).corpses || []);
    out.total = list.length;
    for (const c of list) {
      let isPerson = false;
      try { isPerson = (typeof Game.corpseIsPerson === 'function') ? !!Game.corpseIsPerson(c) : c.kind === 'person'; } catch (e) { isPerson = c.kind === 'person'; }
      if (!isPerson) continue;
      out.person++;
      if (c.butchered) out.butchered++;
      if (c.npcFed) out.npcFed++;
      if (c.npcKnown) out.npcKnown++;
    }
  } catch (e) {}
  return out;
}
function hasTrembles(Game, who) {
  try {
    if (typeof Game.seList !== 'function') return null;
    const list = Game.seList(who) || [];
    return list.some(function (e) { return e && e.id === 'trembles'; });
  } catch (e) { return null; }
}
function tremblesCount(Game) {
  let scholar = null, villagers = 0, villIds = [];
  try { scholar = hasTrembles(Game, 'scholar'); } catch (e) {}
  try {
    const roster = ((Game.state.village || {}).roster || []).filter(function (id) { return id !== Game.villagerId; });
    for (const id of roster) {
      try { if (hasTrembles(Game, id)) { villagers++; villIds.push(id); } } catch (e) {}
    }
  } catch (e) {}
  return { scholar: scholar, villagers: villagers, villIds: villIds };
}

function install(Game) {
  const t = {
    corrEvents: [], slopeEvents: [], diseaseEvents: [], crimeEvents: [],
    thresholdEvents: [], tickEvents: [], psychoEvents: [], discoveryEvents: [],
    fearEvents: [], foilEvents: [], heatEvents: [], showEvents: [],
    memoryEvents: [],
    daily: [], instrumentErrors: [], wrapLive: {}, wrapCounts: {},
    trustGainCalls: 0, corruptionTickCalls: 0,
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
  function crimesSince(n) {
    // Crime events recorded during a call, by seq order.
    try { return t.crimeEvents.slice(n).map(function (e) { return { type: e.type, witnessed: e.witnessed, victim: e.victim }; }); } catch (e) { return []; }
  }

  // ---- (1) corruption adds ----
  wrap('addCorruption', function (n, reason) {
    mark('addCorruption');
    const stack = stackText(2);
    const before = scholarCorr(Game);
    let ret = 0;
    try { ret = origs.addCorruption.call(Game, n, reason); } catch (e) { err('addCorruption-call', e.message); }
    try {
      t.corrEvents.push({ seq: ++seq, day: dayOf(Game), who: 'player', n: (n | 0),
        reason: (reason == null ? null : String(reason)), before: before, after: scholarCorr(Game),
        ret: ret, stack: stack, via: 'addCorruption' });
    } catch (e) { err('addCorruption-log', e.message); }
    return ret;
  });

  wrap('addNpcCorruption', function (vid, n, reason) {
    mark('addNpcCorruption');
    const stack = stackText(2);
    let before = null;
    try { before = npcCorrMap(Game)[vid] || 0; } catch (e) {}
    let ret = 0;
    try { ret = origs.addNpcCorruption.call(Game, vid, n, reason); } catch (e) { err('addNpcCorruption-call', e.message); }
    try {
      t.corrEvents.push({ seq: ++seq, day: dayOf(Game), who: vid || null, n: (n | 0),
        reason: (reason == null ? null : String(reason)), before: before,
        after: (function () { try { return npcCorrMap(Game)[vid] || 0; } catch (e) { return null; } })(),
        ret: ret, stack: stack, via: 'addNpcCorruption' });
    } catch (e) { err('addNpcCorruption-log', e.message); }
    return ret;
  });

  // ---- (4) crimes (wrapped before the slope so seq-correlation works) ----
  wrap('recordCrime', function (type, opts) {
    mark('recordCrime');
    const stack = stackText(2);
    let ret;
    try { ret = origs.recordCrime.call(Game, type, opts); } catch (e) { err('recordCrime-call', e.message); }
    try {
      let crimesAfter = null;
      try { crimesAfter = (((Game.state || {}).village || {}).justice || {}).crimes ? ((Game.state.village.justice.crimes || []).length) : null; } catch (e) {}
      t.crimeEvents.push({ seq: ++seq, day: dayOf(Game), type: type || null,
        witnessed: opts ? (opts.witnessed !== false ? (opts.witnessed == null ? null : !!opts.witnessed) : false) : null,
        victim: opts ? (opts.victim || null) : null,
        villain: opts ? (opts.villain || null) : null,
        crimesAfter: crimesAfter, stack: stack, via: 'recordCrime' });
    } catch (e) { err('recordCrime-log', e.message); }
    return ret;
  });

  // ---- (3) disease ----
  wrap('contractDisease', function (effectId, opts) {
    mark('contractDisease');
    const stack = stackText(2);
    let ret = false;
    try { ret = origs.contractDisease.call(Game, effectId, opts); } catch (e) { err('contractDisease-call', e.message); }
    try {
      t.diseaseEvents.push({ seq: ++seq, day: dayOf(Game), id: effectId || null,
        source: opts ? (opts.source || null) : null, returned: !!ret,
        trembles: effectId === 'trembles', stack: stack, via: 'contractDisease' });
    } catch (e) { err('contractDisease-log', e.message); }
    return ret;
  });

  // ---- (2) the slope ----
  wrap('corpseButcher', function (cid) {
    mark('corpseButcher');
    const stack = stackText(2);
    const crimeMark = t.crimeEvents.length;
    const traumaBefore = ((Game.state.scholar || {}).trauma || 0);
    const corrBefore = scholarCorr(Game);
    const meatBefore = humanMeatUnits(Game);
    let ret = null;
    try { ret = origs.corpseButcher.call(Game, cid); } catch (e) { err('corpseButcher-call', e.message); }
    try {
      t.slopeEvents.push({ seq: ++seq, day: dayOf(Game), verb: 'corpseButcher', cid: cid || null,
        granted: !!ret, units: ret ? (ret.units || null) : null,
        traumaBefore: traumaBefore, traumaAfter: ((Game.state.scholar || {}).trauma || 0),
        corrBefore: corrBefore, corrAfter: scholarCorr(Game),
        meatBefore: meatBefore, meatAfter: humanMeatUnits(Game),
        crimesDuring: crimesSince(crimeMark), stack: stack, via: 'corpseButcher' });
    } catch (e) { err('corpseButcher-log', e.message); }
    return ret;
  });

  wrap('eatCannibal', function (idx) {
    mark('eatCannibal');
    const stack = stackText(2);
    const crimeMark = t.crimeEvents.length;
    const s = Game.state.scholar || {};
    const mealsBefore = s.cannibalMeals || 0;
    const traumaBefore = s.trauma || 0;
    const corrBefore = scholarCorr(Game);
    const kcalBefore = s.kcal || 0;
    let norm = null;
    try { norm = (typeof Game.cannibalNorm === 'function') ? Game.cannibalNorm() : null; } catch (e) {}
    let ret = false;
    try { ret = origs.eatCannibal.call(Game, idx); } catch (e) { err('eatCannibal-call', e.message); }
    try {
      t.slopeEvents.push({ seq: ++seq, day: dayOf(Game), verb: 'eatCannibal', idx: (idx == null ? null : idx),
        granted: !!ret, mealsBefore: mealsBefore, mealsAfter: ((Game.state.scholar || {}).cannibalMeals || 0),
        traumaBefore: traumaBefore, traumaAfter: ((Game.state.scholar || {}).trauma || 0),
        corrBefore: corrBefore, corrAfter: scholarCorr(Game),
        kcalBefore: kcalBefore, kcalAfter: ((Game.state.scholar || {}).kcal || 0),
        norm: norm, tremblesAfter: hasTrembles(Game, 'scholar'),
        crimesDuring: crimesSince(crimeMark), stack: stack, via: 'eatCannibal' });
    } catch (e) { err('eatCannibal-log', e.message); }
    return ret;
  });

  // ---- (5) threshold beats ----
  wrap('corruptionThresholdBeat', function (before, after, reason) {
    mark('corruptionThresholdBeat');
    const stack = stackText(2);
    let ret;
    try { ret = origs.corruptionThresholdBeat.call(Game, before, after, reason); } catch (e) { err('corruptionThresholdBeat-call', e.message); }
    try {
      const crossed = [30, 60, 85].filter(function (x) { return before < x && after >= x; });
      t.thresholdEvents.push({ seq: ++seq, day: dayOf(Game), before: before, after: after,
        reason: (reason == null ? null : String(reason)), crossed: crossed, stack: stack, via: 'corruptionThresholdBeat' });
    } catch (e) { err('corruptionThresholdBeat-log', e.message); }
    return ret;
  });

  // ---- (6) ticks ----
  wrap('cravingTick', function () {
    mark('cravingTick');
    const s = Game.state.scholar || {};
    const energyBefore = s.energy || 0;
    const corr = scholarCorr(Game);
    let ret;
    try { ret = origs.cravingTick.apply(Game, arguments); } catch (e) { err('cravingTick-call', e.message); }
    try {
      const energyAfter = ((Game.state.scholar || {}).energy || 0);
      t.tickEvents.push({ seq: ++seq, day: dayOf(Game), verb: 'cravingTick',
        corruption: corr, energyBefore: energyBefore, energyAfter: energyAfter,
        drained: energyBefore - energyAfter,
        sinceFed: (s.day || 0) - (s.cravingFedDay || 0), stack: stackText(2), via: 'cravingTick' });
    } catch (e) { err('cravingTick-log', e.message); }
    return ret;
  });

  wrap('npcDriftTick', function () {
    mark('npcDriftTick');
    const before = npcCorrMap(Game);
    let ret;
    try { ret = origs.npcDriftTick.apply(Game, arguments); } catch (e) { err('npcDriftTick-call', e.message); }
    try {
      const after = npcCorrMap(Game);
      const changed = [];
      Object.keys(after).forEach(function (vid) { if ((after[vid] || 0) !== (before[vid] || 0)) changed.push({ vid: vid, before: before[vid] || 0, after: after[vid] || 0 }); });
      t.tickEvents.push({ seq: ++seq, day: dayOf(Game), verb: 'npcDriftTick',
        changed: changed, stack: stackText(2), via: 'npcDriftTick' });
    } catch (e) { err('npcDriftTick-log', e.message); }
    return ret;
  });

  wrap('npcCannibalTick', function () {
    mark('npcCannibalTick');
    const before = corpseStats(Game);
    const normBefore = (function () { try { return (Game.state.village || {}).normShift || 0; } catch (e) { return null; } })();
    let ret;
    try { ret = origs.npcCannibalTick.apply(Game, arguments); } catch (e) { err('npcCannibalTick-call', e.message); }
    try {
      const after = corpseStats(Game);
      const normAfter = (function () { try { return (Game.state.village || {}).normShift || 0; } catch (e) { return null; } })();
      t.tickEvents.push({ seq: ++seq, day: dayOf(Game), verb: 'npcCannibalTick',
        fedBefore: before.npcFed, fedAfter: after.npcFed, fed: after.npcFed > before.npcFed,
        normShiftBefore: normBefore, normShiftAfter: normAfter,
        stack: stackText(2), via: 'npcCannibalTick' });
    } catch (e) { err('npcCannibalTick-log', e.message); }
    return ret;
  });

  wrap('temptTick', function () {
    mark('temptTick');
    const meatBefore = humanMeatUnits(Game);
    let ret;
    try { ret = origs.temptTick.apply(Game, arguments); } catch (e) { err('temptTick-call', e.message); }
    try {
      t.tickEvents.push({ seq: ++seq, day: dayOf(Game), verb: 'temptTick',
        meatBefore: meatBefore, meatAfter: humanMeatUnits(Game),
        offered: (humanMeatUnits(Game) || 0) > (meatBefore || 0), stack: stackText(2), via: 'temptTick' });
    } catch (e) { err('temptTick-log', e.message); }
    return ret;
  });

  wrap('darkCarePackageTick', function () {
    mark('darkCarePackageTick');
    const meatBefore = humanMeatUnits(Game);
    let ret;
    try { ret = origs.darkCarePackageTick.apply(Game, arguments); } catch (e) { err('darkCarePackageTick-call', e.message); }
    try {
      t.tickEvents.push({ seq: ++seq, day: dayOf(Game), verb: 'darkCarePackageTick',
        meatBefore: meatBefore, meatAfter: humanMeatUnits(Game),
        delivered: (humanMeatUnits(Game) || 0) > (meatBefore || 0), stack: stackText(2), via: 'darkCarePackageTick' });
    } catch (e) { err('darkCarePackageTick-log', e.message); }
    return ret;
  });

  wrap('psychoViolenceTick', function () {
    mark('psychoViolenceTick');
    let before = null;
    try { before = clone(((Game.state || {}).village || {})._psychoState || {}); } catch (e) {}
    let ret;
    try { ret = origs.psychoViolenceTick.apply(Game, arguments); } catch (e) { err('psychoViolenceTick-call', e.message); }
    try {
      let after = null;
      try { after = clone(((Game.state || {}).village || {})._psychoState || {}); } catch (e) {}
      const stages = [];
      Object.keys(after || {}).forEach(function (vid) {
        const b = (before || {})[vid] || { stage: 0 };
        const a = after[vid] || { stage: 0 };
        if ((a.stage || 0) !== (b.stage || 0)) stages.push({ vid: vid, before: b.stage || 0, after: a.stage || 0 });
      });
      t.tickEvents.push({ seq: ++seq, day: dayOf(Game), verb: 'psychoViolenceTick',
        stages: stages, stack: stackText(2), via: 'psychoViolenceTick' });
    } catch (e) { err('psychoViolenceTick-log', e.message); }
    return ret;
  });

  wrap('corruptionTick', function () {
    mark('corruptionTick');
    t.corruptionTickCalls++;
    let ret;
    try { ret = origs.corruptionTick.apply(Game, arguments); } catch (e) { err('corruptionTick-call', e.message); }
    return ret;
  });

  // ---- (7) psycho spawn / mantle ----
  wrap('psychoIntro', function (char) {
    mark('psychoIntro');
    const stack = stackText(2);
    let ret = false;
    try { ret = origs.psychoIntro.call(Game, char); } catch (e) { err('psychoIntro-call', e.message); }
    try {
      t.psychoEvents.push({ seq: ++seq, day: dayOf(Game), verb: 'psychoIntro',
        fired: !!ret, corruptionAfter: scholarCorr(Game),
        darkPath: !!((Game.state || {}).scholar || {}).darkPath,
        charName: char ? (char.name || null) : null, stack: stack, via: 'psychoIntro' });
    } catch (e) { err('psychoIntro-log', e.message); }
    return ret;
  });

  wrap('mantleWatch', function () {
    mark('mantleWatch');
    // Change detection must mirror the method itself: it acts when
    // _lastBearer is stale relative to the current bearer. Comparing
    // villagerId before/after misses the carry (villagerId does not
    // change inside the call — _lastBearer does).
    const lastBearerBefore = Game._lastBearer || null;
    const corrBefore = scholarCorr(Game);
    let ret;
    try { ret = origs.mantleWatch.apply(Game, arguments); } catch (e) { err('mantleWatch-call', e.message); }
    try {
      const lastBearerAfter = Game._lastBearer || null;
      if (lastBearerBefore !== lastBearerAfter || scholarCorr(Game) !== corrBefore) {
        t.psychoEvents.push({ seq: ++seq, day: dayOf(Game), verb: 'mantleWatch',
          bearerBefore: lastBearerBefore, bearerAfter: lastBearerAfter,
          corrBefore: corrBefore, corrAfter: scholarCorr(Game),
          stack: stackText(2), via: 'mantleWatch' });
      }
    } catch (e) { err('mantleWatch-log', e.message); }
    return ret;
  });

  // ---- (8) discovery ----
  wrap('discoverNpcCannibalism', function (cid) {
    mark('discoverNpcCannibalism');
    const stack = stackText(2);
    let ret = false;
    try { ret = origs.discoverNpcCannibalism.call(Game, cid); } catch (e) { err('discoverNpcCannibalism-call', e.message); }
    try {
      t.discoveryEvents.push({ seq: ++seq, day: dayOf(Game), cid: cid || null,
        discovered: !!ret, stack: stack, via: 'discoverNpcCannibalism' });
    } catch (e) { err('discoverNpcCannibalism-log', e.message); }
    return ret;
  });

  // ---- (9) fear ----
  wrap('addFear', function (vid, target, n) {
    mark('addFear');
    const stack = stackText(2);
    let before = null;
    try { before = (typeof Game.fearOf === 'function') ? Game.fearOf(vid, target) : null; } catch (e) {}
    let ret = 0;
    try { ret = origs.addFear.call(Game, vid, target, n); } catch (e) { err('addFear-call', e.message); }
    try {
      let after = null;
      try { after = (typeof Game.fearOf === 'function') ? Game.fearOf(vid, target) : null; } catch (e) {}
      t.fearEvents.push({ seq: ++seq, day: dayOf(Game), verb: 'addFear', vid: vid || null,
        target: target || null, n: (n | 0), before: before, after: after, stack: stack, via: 'addFear' });
    } catch (e) { err('addFear-log', e.message); }
    return ret;
  });

  wrap('fearWeakness', function (target) {
    mark('fearWeakness');
    const stack = stackText(2);
    let before = null;
    try { before = clone((((Game.state || {}).village || {}).dread || {})[target || Game.villagerId] || {}); } catch (e) {}
    let ret = false;
    try { ret = origs.fearWeakness.call(Game, target); } catch (e) { err('fearWeakness-call', e.message); }
    try {
      let after = null;
      try { after = clone((((Game.state || {}).village || {}).dread || {})[target || Game.villagerId] || {}); } catch (e) {}
      t.fearEvents.push({ seq: ++seq, day: dayOf(Game), verb: 'fearWeakness',
        target: target || null, collapsed: !!ret, before: before, after: after, stack: stack, via: 'fearWeakness' });
    } catch (e) { err('fearWeakness-log', e.message); }
    return ret;
  });

  wrap('intimidate', function (vid) {
    mark('intimidate');
    const stack = stackText(2);
    let dreadBefore = null;
    try { dreadBefore = (typeof Game.fearOf === 'function') ? Game.fearOf(vid, Game.villagerId) : null; } catch (e) {}
    let ret = null;
    try { ret = origs.intimidate.call(Game, vid); } catch (e) { err('intimidate-call', e.message); }
    try {
      let dreadAfter = null;
      try { dreadAfter = (typeof Game.fearOf === 'function') ? Game.fearOf(vid, Game.villagerId) : null; } catch (e) {}
      t.fearEvents.push({ seq: ++seq, day: dayOf(Game), verb: 'intimidate', vid: vid || null,
        returned: (ret == null ? null : String(ret)), dreadBefore: dreadBefore, dreadAfter: dreadAfter,
        stack: stack, via: 'intimidate' });
    } catch (e) { err('intimidate-log', e.message); }
    return ret;
  });

  // ---- (10) foil: trust drag (count all, record true foil drags) ----
  // The corruption wrap in corruption.js applies the foil AFTER the
  // base progressive curve: final = round(n_base * (1 - c/250)) for
  // c >= 30. The base curve ALSO returns less than the `base` arg on
  // its own (trust gets harder to earn as it grows), so `returned <
  // base` alone is NOT a corruption drag — the first two pilot seeds
  // recorded 1,370–2,138 such events at corruption 0, all base-curve.
  // Record only when the foil can apply (c >= 30) and recover the
  // corruption-attributable drag from the final value: n_base is
  // implied by final / (1 - c/250), drag = impliedBase - final.
  // (Rounding makes this an estimate to the nearest unit; recorded
  // as such. Calls at c < 30 are counted, never recorded as drags.)
  wrap('trustGainProgressive', function (vid, base) {
    mark('trustGainProgressive');
    t.trustGainCalls++;
    const c = scholarCorr(Game);
    let ret = 0;
    try { ret = origs.trustGainProgressive.call(Game, vid, base); } catch (e) { err('trustGainProgressive-call', e.message); }
    try {
      if (c != null && c >= 30 && ret > 0) {
        const factor = 1 - c / 250;
        const impliedBase = factor > 0 ? (ret / factor) : ret;
        t.foilEvents.push({ seq: ++seq, day: dayOf(Game), vid: vid || null, base: base,
          returned: ret, scholarCorruption: c,
          impliedBase: Math.round(impliedBase * 100) / 100,
          dragged: Math.round((impliedBase - ret) * 100) / 100,
          stack: stackText(2), via: 'trustGainProgressive' });
      }
    } catch (e) { err('trustGainProgressive-log', e.message); }
    return ret;
  });

  // ---- (11) justice heat ----
  wrap('justiceHeat', function () {
    mark('justiceHeat');
    let ret = 0;
    try { ret = origs.justiceHeat.apply(Game, arguments); } catch (e) { err('justiceHeat-call', e.message); }
    try {
      let norm = null;
      try { norm = (typeof Game.cannibalNorm === 'function') ? Game.cannibalNorm() : null; } catch (e) {}
      t.heatEvents.push({ seq: ++seq, day: dayOf(Game), heat: ret, norm: norm, via: 'justiceHeat' });
    } catch (e) { err('justiceHeat-log', e.message); }
    return ret;
  });

  // ---- (12) show ----
  wrap('darkShowBeat', function (kind) {
    mark('darkShowBeat');
    const stack = stackText(2);
    let ret;
    try { ret = origs.darkShowBeat.call(Game, kind); } catch (e) { err('darkShowBeat-call', e.message); }
    try {
      t.showEvents.push({ seq: ++seq, day: dayOf(Game), kind: kind || null, stack: stack, via: 'darkShowBeat' });
    } catch (e) { err('darkShowBeat-log', e.message); }
    return ret;
  });

  // ---- (13) memory (filtered keys only) ----
  wrap('remember', function (vid, key, text) {
    mark('remember');
    const interesting =
      (key === 'shared_secret' && typeof text === 'string' && text.indexOf('watched you feed') >= 0) ||
      key === 'offered_meat' || key === 'exposed_cannibal' ||
      key === 'saw_weakness' || key === 'you_threatened';
    let ret;
    try { ret = origs.remember.call(Game, vid, key, text); } catch (e) { err('remember-call', e.message); }
    try {
      if (interesting) {
        t.memoryEvents.push({ seq: ++seq, day: dayOf(Game), vid: vid || null, key: key || null,
          text: (text == null ? null : String(text).slice(0, 200)), stack: stackText(2), via: 'remember' });
      }
    } catch (e) { err('remember-log', e.message); }
    return ret;
  });

  // ---- (14) daily snapshot ----
  function snapshot() {
    const snap = { day: dayOf(Game), seq: seq };
    try { snap.pantryKcal = pantryKcal(Game); } catch (e) { snap.pantryKcal = null; }
    try { snap.standing = Game.villageStanding ? Game.villageStanding() : null; if (snap.standing) snap.standing = snap.standing.total; } catch (e) { snap.standing = null; }
    try { snap.gated = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) { snap.gated = null; }
    try { snap.scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { snap.scaleRank = null; }
    try { snap.nationalLive = !!(Game.state || {}).nationalLive; } catch (e) { snap.nationalLive = null; }
    try { snap.wave = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { snap.wave = null; }
    try { snap.bearer = Game.villagerId || null; } catch (e) { snap.bearer = null; }
    try {
      const s = Game.state.scholar || {};
      snap.scholarCorruption = scholarCorr(Game);
      snap.cannibalMeals = s.cannibalMeals || 0;
      snap.lastCannibalDay = (s.lastCannibalDay == null ? null : s.lastCannibalDay);
      snap.cravingFedDay = (s.cravingFedDay == null ? null : s.cravingFedDay);
      snap.trauma = s.trauma || 0;
      snap.darkPath = !!s.darkPath;
      snap.psychoIntroFired = !!s._psychoIntroFired;
      snap.kcal = (s.kcal == null ? null : s.kcal);
      snap.energy = (s.energy == null ? null : s.energy);
    } catch (e) { err('snapshot-scholar', e.message); }
    try {
      const v = Game.state.village || {};
      snap.villageCorruption = (typeof Game.villageCorruption === 'function') ? Game.villageCorruption() : null;
      snap.npcCorruption = npcCorrMap(Game);
      snap.cannibalNorm = (typeof Game.cannibalNorm === 'function') ? Game.cannibalNorm() : null;
      snap.starvingVillage = (typeof Game.starvingVillage === 'function') ? Game.starvingVillage() : null;
      snap.normShift = v.normShift || 0;
      snap.roster = (v.roster || []).slice();
      try { snap.avgFearOfScholar = (typeof Game.avgFearOf === 'function') ? Game.avgFearOf(Game.villagerId) : null; } catch (e) { snap.avgFearOfScholar = null; }
      snap.dreadEntries = 0;
      try { Object.keys(v.dread || {}).forEach(function (k) { snap.dreadEntries += Object.keys(v.dread[k] || {}).length; }); } catch (e) {}
      snap.humanMeatUnits = humanMeatUnits(Game);
      snap.corpses = corpseStats(Game);
      snap.psychoState = clone(v._psychoState || {});
      snap.maliciousDark = 0;
      try {
        for (const id of (v.roster || [])) {
          try { const d = (typeof Game.npcDark === 'function') ? Game.npcDark(id) : null; if (d && d.kind === 'malicious') snap.maliciousDark++; } catch (e) {}
        }
      } catch (e) {}
      const j = v.justice || null;
      snap.justiceStage = j ? (j.stage || 0) : 0;
      snap.justiceCrimes = j ? clone(j.crimes || []) : [];
      snap.exiled = j ? !!j.exiled : false;
      snap.exileDay = j ? (j.exileDay == null ? null : j.exileDay) : null;
      snap.mootDemanded = j ? !!j.mootDemanded : false;
      snap.trembles = tremblesCount(Game);
      snap.trustGainCalls = t.trustGainCalls;
      snap.corruptionTickCalls = t.corruptionTickCalls;
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
