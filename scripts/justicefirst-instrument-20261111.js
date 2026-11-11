// justicefirst-instrument-20261111.js — justice + moot first-numbers
// recorder (arm sim-justicefirst-a, run fleshout-20261111T1115Z).
// Scripts only, zero src/js.
//
// Records, per seed:
//   (1) CRIMES (recordCrime): every call — type, victim, villain,
//       witnessed, caught, caseId at call time, booked-or-dropped
//       (the engine DROPS NPC-villain crimes: recordCrime returns
//       early when villain != player, so the wrap records the call
//       AND whether the crime landed on the books — a dropped call
//       is classified 'dropped-not-player', never 'unclassified').
//   (2) LADDER (justiceTick / justiceHeat): every tick — stage and
//       heat before/after (heat via justiceHeat(), a pure read).
//   (3) CONFRONTATION (justiceConfront / justiceRespond): confronter,
//       known (witnessed) crime counts; every answer — pay/refuse,
//       kcal paid, restitution owed, stage before/after.
//   (4) DEMAND (justiceDemandMoot): reason (refused/silence/heat),
//       serious crime type, chargeWord.
//   (5) AFTERMATH (syncJusticeAfterMoot / mootAccuserAftermath):
//       path; accuser + trust before/after.
//   (6) UPRISING (startVillageUprising / uprisingAftermath):
//       reason, attacker/defender counts; result, dead/alive.
//   (7) EXILE LIFE (exilePlayer / justiceExileColdResolve /
//       justiceExileCutsTalk): how exiled; every cold-shoulder
//       resolution (refused/broke); every talk-cut check.
//   (8) THEFT (theftConfrontation / stealFrom): pantry-freeloader
//       confrontations (totalKcal); every steal attempt + return.
//   (9) CASES (openCase / openPlayerCase / considerPlayerAccusation /
//       forcePlayerAccusation): open path, charge, accuser,
//       accused, fabricated, mootIn, return (case/null).
//  (10) CONVENING (mootConveneHeld / callMoot / conductTrial /
//       tallyVotes / mootQuorum): every gate read (held or not),
//       every call (caller, playerConvened), every trial (wildDay,
//       playerVoter, awaitingPlayerVote, guiltySoFar, need), every
//       tally (present, votes with scores, guilty, playerVoter),
//       every quorum read (living, present, quorum).
//  (11) VOTE + VERDICT (castPlayerVote / finishTrial / sentenceCase /
//       resolveCase): every scholar vote; every verdict (convicted,
//       advisory or not, guilty/total, resolution); every sentence
//       (charge, avgBelief, thresholds); every resolution (path,
//       accused, already-resolved flag).
//  (12) BRIBERY (bribeVoter / exposeBribery / investigateBribery):
//       every call + return (expected dead under competent).
//  (13) REMOVALS (removeVillager): every call — vid, reason
//       (exiled/killed/fled/splinter).
//  (14) TRUST (bumpTrust / recordGrievance): every trust write —
//       vid, requested delta, trust before/after, reason, STACK
//       (the moot-attribution classifier reads the stack); every
//       grievance — from, to, kind, weight.
//  (15) DAILY SNAPSHOT: justice state (stage, heat, crimes,
//       exiled, exileDay, amendsCredit, confrontedBy,
//       pendingConfront, mootDemanded); betrayal cases (id, charge,
//       accused, accuser, target, status, resolution, fabricated,
//       mootIn, trial, advisoryDay); trust map; roster; pantry
//       kcal, standing, scaleRank, nationalLive, wave, bearer id.
//
// All wraps are record-only: call the original, return its value
// unchanged, never alter state, never consume RNG. Any failure in
// the RECORDING path is logged to instrumentErrors, never thrown
// into the game. RAW reads only where a getter would create state
// (justiceState() creates v.justice) — the instrument never calls
// justiceState() itself.
//
// KNOWN WRAP RISK (secondlink-a / diplo-a lesson): a wrap records
// nothing if the engine calls the closure instead of the Game
// method. The proof (scripts/test-justicefirst-a.js) verifies EACH
// wrapped method's call path is live on a fixture or live
// miniature; a wrap with no live call observed is marked dead in
// the evidence and its zero is never treated as evidence.
//
// There are NO justice/moot tele types (grep of tele('...') across
// betrayal.js / justice.js / membership.js returns only
// godpath_deed), so this instrument has no tele cross-check.
//
// Usage: const JF = require('./justicefirst-instrument-20261111');
//   const jf = JF.install(Game); jf.snapshot(); ... jf.uninstall();
'use strict';

const CRIME_TYPES = ['theft', 'attack', 'murder', 'intimidation', 'cannibalism', 'desecration', 'threat', 'assault'];
const CHARGES = ['theft', 'intimidation', 'assault', 'murder', 'cannibalism', 'ambush'];
const RESOLUTIONS = ['exile', 'weregild', 'schism', 'cold_war', 'player_exile', 'acquitted', 'advisory_guilty', 'advisory_acquit', 'fled'];

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
// RAW justice read — never justiceState(), which creates v.justice.
function rawJustice(Game) {
  try { return ((Game.state || {}).village || {}).justice || null; } catch (e) { return null; }
}
function heatOf(Game) {
  try { return (typeof Game.justiceHeat === 'function') ? Game.justiceHeat() : null; } catch (e) { return null; }
}
function trustOf(Game, vid) {
  try { const t = ((Game.state || {}).village || {}).trust || {}; return (t[vid] == null ? 10 : t[vid]); } catch (e) { return null; }
}
function caseLite(c) {
  if (!c) return null;
  return {
    id: c.id || null, charge: c.charge || null, accused: (c.accused || []).slice(),
    accuser: c.accuser || null, target: c.target || null, status: c.status || null,
    resolution: c.resolution || null, fabricated: !!c.fabricated, mootIn: c.mootIn || null,
    trial: c.trial ? {
      present: (c.trial.present || []).slice(), guilty: c.trial.guilty || 0,
      playerVoter: !!c.trial.playerVoter, wildDay: !!c.trial.wildDay,
      convicted: c.trial.convicted == null ? null : !!c.trial.convicted,
      finalGuilty: c.trial.finalGuilty == null ? null : c.trial.finalGuilty,
      awaitingPlayerVote: !!c.trial.awaitingPlayerVote,
    } : null,
    advisoryDay: c.advisoryDay || null,
  };
}

function install(Game) {
  const t = {
    crimeEvents: [], tickEvents: [], heatEvents: [], confrontEvents: [], respondEvents: [],
    demandEvents: [], syncEvents: [], aftermathEvents: [], uprisingEvents: [], uprisingAfterEvents: [],
    exileColdEvents: [], exileCutsEvents: [], exilePlayerEvents: [], theftConfEvents: [], stealEvents: [],
    openCaseEvents: [], openPlayerCaseEvents: [], considerEvents: [], forceEvents: [],
    conveneHeldEvents: [], callMootEvents: [], trialEvents: [], tallyEvents: [], quorumEvents: [],
    voteEvents: [], finishEvents: [], sentenceEvents: [], resolveEvents: [],
    bribeEvents: [], exposeEvents: [], investigateEvents: [], removeEvents: [],
    bumpTrustEvents: [], grievanceEvents: [],
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

  // ---- (1) crimes ----
  wrap('recordCrime', function (type, opts) {
    mark('recordCrime');
    const stack = stackText(2);
    opts = opts || {};
    const jBefore = rawJustice(Game);
    const nBefore = jBefore ? ((jBefore.crimes || []).length) : 0;
    let ret;
    try { ret = origs.recordCrime.call(Game, type, opts); } catch (e) { err('recordCrime-call', e.message); }
    try {
      const jAfter = rawJustice(Game);
      const nAfter = jAfter ? ((jAfter.crimes || []).length) : 0;
      const villain = (opts.villain == null ? null : opts.villain);
      const dropped = (villain != null && villain !== Game.villagerId);
      const booked = nAfter > nBefore;
      t.crimeEvents.push({ seq: ++seq, day: dayOf(Game), type: type || null,
        victim: opts.victim || null, villain: villain,
        witnessed: (opts.witnessed == null ? null : !!opts.witnessed),
        caught: (opts.caught == null ? null : !!opts.caught),
        caseId: opts.caseId || null, booked: booked, droppedNotPlayer: dropped,
        stack: stack, via: 'recordCrime' });
    } catch (e) { err('recordCrime-log', e.message); }
    return ret;
  });

  // ---- (2) ladder tick + heat ----
  wrap('justiceHeat', function () {
    mark('justiceHeat');
    let ret = 0;
    try { ret = origs.justiceHeat.apply(Game, arguments); } catch (e) { err('justiceHeat-call', e.message); }
    try { t.heatEvents.push({ seq: ++seq, day: dayOf(Game), heat: ret, stack: stackText(2), via: 'justiceHeat' }); } catch (e) { err('justiceHeat-log', e.message); }
    return ret;
  });

  wrap('justiceTick', function () {
    mark('justiceTick');
    const jB = rawJustice(Game);
    const stageBefore = jB ? (jB.stage || 0) : 0;
    const heatBefore = heatOf(Game);
    let ret;
    try { ret = origs.justiceTick.apply(Game, arguments); } catch (e) { err('justiceTick-call', e.message); }
    try {
      const jA = rawJustice(Game);
      t.tickEvents.push({ seq: ++seq, day: dayOf(Game),
        stageBefore: stageBefore, stageAfter: jA ? (jA.stage || 0) : 0,
        heatBefore: heatBefore, heatAfter: heatOf(Game),
        stack: stackText(2), via: 'justiceTick' });
    } catch (e) { err('justiceTick-log', e.message); }
    return ret;
  });

  // ---- (3) confrontation ----
  wrap('justiceConfront', function () {
    mark('justiceConfront');
    let ret;
    try { ret = origs.justiceConfront.apply(Game, arguments); } catch (e) { err('justiceConfront-call', e.message); }
    try {
      const j = rawJustice(Game) || {};
      const known = (j.crimes || []).filter(function (c) { return c.witnessed !== false; });
      const count = function (ty) { return known.filter(function (c) { return c.type === ty; }).length; };
      t.confrontEvents.push({ seq: ++seq, day: dayOf(Game),
        confronter: j.confrontedBy || null,
        cannibalism: count('cannibalism'), murder: count('murder'), attack: count('attack'), theft: count('theft'),
        stack: stackText(2), via: 'justiceConfront' });
    } catch (e) { err('justiceConfront-log', e.message); }
    return ret;
  });

  wrap('justiceRespond', function (choice) {
    mark('justiceRespond');
    const stack = stackText(2);
    const jB = rawJustice(Game);
    const stageBefore = jB ? (jB.stage || 0) : 0;
    let owed = null;
    try { owed = (typeof Game.justiceRestitutionOwed === 'function') ? Game.justiceRestitutionOwed() : null; } catch (e) {}
    let ret = null;
    try { ret = origs.justiceRespond.call(Game, choice); } catch (e) { err('justiceRespond-call', e.message); }
    try {
      const jA = rawJustice(Game);
      t.respondEvents.push({ seq: ++seq, day: dayOf(Game), choice: choice || null,
        paid: (ret && ret.paid != null) ? ret.paid : null,
        enough: (ret && ret.enough != null) ? !!ret.enough : null,
        refused: (ret && ret.refused != null) ? ret.refused : null,
        owed: owed, stageBefore: stageBefore, stageAfter: jA ? (jA.stage || 0) : 0,
        stack: stack, via: 'justiceRespond' });
    } catch (e) { err('justiceRespond-log', e.message); }
    return ret;
  });

  // ---- (4) demand ----
  wrap('justiceDemandMoot', function () {
    mark('justiceDemandMoot');
    const stack = stackText(2);
    const j = rawJustice(Game) || {};
    const reason = j.silenceRefused ? 'silence' : (j.confrontRefused ? 'refused' : 'heat');
    let ret;
    try { ret = origs.justiceDemandMoot.apply(Game, arguments); } catch (e) { err('justiceDemandMoot-call', e.message); }
    try {
      const rank = { cannibalism: 5, murder: 4, attack: 3, theft: 2, intimidation: 1 };
      const provable = ((j.crimes || []).filter(function (c) { return rank[c.type] && c.witnessed !== false && !c.caseId; }));
      const serious = provable.sort(function (a, b) { return (rank[b.type] || 0) - (rank[a.type] || 0); })[0];
      t.demandEvents.push({ seq: ++seq, day: dayOf(Game), reason: reason,
        seriousType: serious ? serious.type : null, stack: stack, via: 'justiceDemandMoot' });
    } catch (e) { err('justiceDemandMoot-log', e.message); }
    return ret;
  });

  // ---- (5) aftermath ----
  wrap('syncJusticeAfterMoot', function (path) {
    mark('syncJusticeAfterMoot');
    let ret;
    try { ret = origs.syncJusticeAfterMoot.call(Game, path); } catch (e) { err('syncJusticeAfterMoot-call', e.message); }
    try { t.syncEvents.push({ seq: ++seq, day: dayOf(Game), path: path || null, stack: stackText(2), via: 'syncJusticeAfterMoot' }); } catch (e) { err('syncJusticeAfterMoot-log', e.message); }
    return ret;
  });

  wrap('mootAccuserAftermath', function (path) {
    mark('mootAccuserAftermath');
    const stack = stackText(2);
    let accuser = null, trustBefore = null;
    try {
      const cases = ((typeof Game.betrayalState === 'function') ? (Game.betrayalState() || {}).cases : []) || [];
      for (let i = cases.length - 1; i >= 0; i--) {
        const x = cases[i];
        if (x && x.accused && x.accused.includes(Game.villagerId) && (x.status === 'resolved' || x.status === 'acquitted')) { accuser = x.accuser || null; break; }
      }
      if (accuser) trustBefore = trustOf(Game, accuser);
    } catch (e) {}
    let ret;
    try { ret = origs.mootAccuserAftermath.call(Game, path); } catch (e) { err('mootAccuserAftermath-call', e.message); }
    try {
      t.aftermathEvents.push({ seq: ++seq, day: dayOf(Game), path: path || null,
        accuser: accuser, trustBefore: trustBefore,
        trustAfter: accuser ? trustOf(Game, accuser) : null,
        stack: stack, via: 'mootAccuserAftermath' });
    } catch (e) { err('mootAccuserAftermath-log', e.message); }
    return ret;
  });

  // ---- (6) uprising ----
  wrap('startVillageUprising', function (reason) {
    mark('startVillageUprising');
    let ret = null;
    try { ret = origs.startVillageUprising.call(Game, reason); } catch (e) { err('startVillageUprising-call', e.message); }
    try {
      const f = Game.tbfight || null;
      const attackers = (f && f.uprisingAttackers) ? f.uprisingAttackers.length : null;
      t.uprisingEvents.push({ seq: ++seq, day: dayOf(Game), reason: (reason == null ? null : String(reason)),
        attackers: attackers, stack: stackText(2), via: 'startVillageUprising' });
    } catch (e) { err('startVillageUprising-log', e.message); }
    return ret;
  });

  wrap('uprisingAftermath', function () {
    mark('uprisingAftermath');
    let ret;
    try { ret = origs.uprisingAftermath.apply(Game, arguments); } catch (e) { err('uprisingAftermath-call', e.message); }
    try {
      const lb = Game._lastBetrayal || {};
      const attackers = lb.uprisingAttackers || [];
      const v = Game.state.village || {};
      const dead = attackers.filter(function (id) { return !((v.roster || []).includes(id)); });
      t.uprisingAfterEvents.push({ seq: ++seq, day: dayOf(Game), result: lb.result || null,
        attackers: attackers.length, dead: dead.length, alive: attackers.length - dead.length,
        stack: stackText(2), via: 'uprisingAftermath' });
    } catch (e) { err('uprisingAftermath-log', e.message); }
    return ret;
  });

  // ---- (7) exile life ----
  wrap('exilePlayer', function (how) {
    mark('exilePlayer');
    let ret;
    try { ret = origs.exilePlayer.call(Game, how); } catch (e) { err('exilePlayer-call', e.message); }
    try { t.exilePlayerEvents.push({ seq: ++seq, day: dayOf(Game), how: how || null, stack: stackText(2), via: 'exilePlayer' }); } catch (e) { err('exilePlayer-log', e.message); }
    return ret;
  });

  wrap('justiceExileColdResolve', function (vid) {
    mark('justiceExileColdResolve');
    const stack = stackText(2);
    let ret = null;
    try { ret = origs.justiceExileColdResolve.call(Game, vid); } catch (e) { err('justiceExileColdResolve-call', e.message); }
    try {
      t.exileColdEvents.push({ seq: ++seq, day: dayOf(Game), vid: vid || null,
        refused: ret ? !!ret.refused : null, broke: ret ? !!ret.broke : null,
        lineHead: (ret && ret.line) ? String(ret.line).slice(0, 40) : null,
        stack: stack, via: 'justiceExileColdResolve' });
    } catch (e) { err('justiceExileColdResolve-log', e.message); }
    return ret;
  });

  wrap('justiceExileCutsTalk', function (vid) {
    mark('justiceExileCutsTalk');
    let ret = false;
    try { ret = origs.justiceExileCutsTalk.call(Game, vid); } catch (e) { err('justiceExileCutsTalk-call', e.message); }
    try { t.exileCutsEvents.push({ seq: ++seq, day: dayOf(Game), vid: vid || null, cuts: !!ret, stack: stackText(2), via: 'justiceExileCutsTalk' }); } catch (e) { err('justiceExileCutsTalk-log', e.message); }
    return ret;
  });

  // ---- (8) theft ----
  wrap('theftConfrontation', function (totalKcal) {
    mark('theftConfrontation');
    let ret;
    try { ret = origs.theftConfrontation.call(Game, totalKcal); } catch (e) { err('theftConfrontation-call', e.message); }
    try { t.theftConfEvents.push({ seq: ++seq, day: dayOf(Game), totalKcal: totalKcal || 0, stack: stackText(2), via: 'theftConfrontation' }); } catch (e) { err('theftConfrontation-log', e.message); }
    return ret;
  });

  wrap('stealFrom', function (vid) {
    mark('stealFrom');
    let ret = false;
    try { ret = origs.stealFrom.call(Game, vid); } catch (e) { err('stealFrom-call', e.message); }
    try { t.stealEvents.push({ seq: ++seq, day: dayOf(Game), vid: vid || null, returned: !!ret, stack: stackText(2), via: 'stealFrom' }); } catch (e) { err('stealFrom-log', e.message); }
    return ret;
  });

  // ---- (9) cases ----
  wrap('openCase', function (plot, charge) {
    mark('openCase');
    const stack = stackText(2);
    let ret = null;
    try { ret = origs.openCase.call(Game, plot, charge); } catch (e) { err('openCase-call', e.message); }
    try {
      t.openCaseEvents.push({ seq: ++seq, day: dayOf(Game), charge: charge || null,
        caseId: (ret && ret.id) || null, accused: (ret && ret.accused) ? ret.accused.slice() : null,
        accuser: (ret && ret.accuser) || null, target: (ret && ret.target) || null,
        stack: stack, via: 'openCase' });
    } catch (e) { err('openCase-log', e.message); }
    return ret;
  });

  wrap('openPlayerCase', function (accuser, charge, crimes, fabricated) {
    mark('openPlayerCase');
    const stack = stackText(2);
    let ret = null;
    try { ret = origs.openPlayerCase.call(Game, accuser, charge, crimes, fabricated); } catch (e) { err('openPlayerCase-call', e.message); }
    try {
      t.openPlayerCaseEvents.push({ seq: ++seq, day: dayOf(Game),
        accuser: accuser || null, charge: charge || null, fabricated: !!fabricated,
        caseId: (ret && ret.id) || null, mootIn: (ret && ret.mootIn) || null,
        stack: stack, via: 'openPlayerCase' });
    } catch (e) { err('openPlayerCase-log', e.message); }
    return ret;
  });

  wrap('considerPlayerAccusation', function () {
    mark('considerPlayerAccusation');
    const stack = stackText(2);
    let ret;
    try { ret = origs.considerPlayerAccusation.apply(Game, arguments); } catch (e) { err('considerPlayerAccusation-call', e.message); }
    try {
      t.considerEvents.push({ seq: ++seq, day: dayOf(Game),
        openedCaseId: (ret && ret.id) || null, stack: stack, via: 'considerPlayerAccusation' });
    } catch (e) { err('considerPlayerAccusation-log', e.message); }
    return ret;
  });

  wrap('forcePlayerAccusation', function () {
    mark('forcePlayerAccusation');
    const stack = stackText(2);
    let ret;
    try { ret = origs.forcePlayerAccusation.apply(Game, arguments); } catch (e) { err('forcePlayerAccusation-call', e.message); }
    try {
      t.forceEvents.push({ seq: ++seq, day: dayOf(Game),
        caseId: (ret && ret.id) || null, charge: (ret && ret.charge) || null,
        stack: stack, via: 'forcePlayerAccusation' });
    } catch (e) { err('forcePlayerAccusation-log', e.message); }
    return ret;
  });

  // ---- (10) convening ----
  wrap('mootConveneHeld', function () {
    mark('mootConveneHeld');
    let ret = false;
    try { ret = origs.mootConveneHeld.apply(Game, arguments); } catch (e) { err('mootConveneHeld-call', e.message); }
    try { t.conveneHeldEvents.push({ seq: ++seq, day: dayOf(Game), held: !!ret, stack: stackText(2), via: 'mootConveneHeld' }); } catch (e) { err('mootConveneHeld-log', e.message); }
    return ret;
  });

  wrap('callMoot', function (caseId, byId) {
    mark('callMoot');
    const stack = stackText(2);
    let ret = null;
    try { ret = origs.callMoot.call(Game, caseId, byId); } catch (e) { err('callMoot-call', e.message); }
    try {
      t.callMootEvents.push({ seq: ++seq, day: dayOf(Game), caseId: caseId || null,
        caller: byId || null, playerConvened: !!(byId && Game.isPlayer && Game.isPlayer(byId)),
        returnedNull: (ret == null), stack: stack, via: 'callMoot' });
    } catch (e) { err('callMoot-log', e.message); }
    return ret;
  });

  wrap('conductTrial', function (c) {
    mark('conductTrial');
    const stack = stackText(2);
    let ret = null;
    try { ret = origs.conductTrial.call(Game, c); } catch (e) { err('conductTrial-call', e.message); }
    try {
      const tr = (c && c.trial) || null;
      t.trialEvents.push({ seq: ++seq, day: dayOf(Game), caseId: (c && c.id) || null,
        wildDay: tr ? !!tr.wildDay : null, playerVoter: tr ? !!tr.playerVoter : null,
        awaitingPlayerVote: tr ? !!tr.awaitingPlayerVote : null,
        guiltySoFar: tr ? (tr.guilty || 0) : null,
        returnedAwaiting: !!(ret && ret.awaitingPlayerVote),
        stack: stack, via: 'conductTrial' });
    } catch (e) { err('conductTrial-log', e.message); }
    return ret;
  });

  wrap('tallyVotes', function (c, wildDay, rng) {
    mark('tallyVotes');
    const stack = stackText(2);
    let ret = null;
    try { ret = origs.tallyVotes.call(Game, c, wildDay, rng); } catch (e) { err('tallyVotes-call', e.message); }
    try {
      t.tallyEvents.push({ seq: ++seq, day: dayOf(Game), caseId: (c && c.id) || null,
        wildDay: !!wildDay, present: ret ? (ret.present || []).length : null,
        votes: ret ? (ret.votes || []).map(function (v) { return { vid: v.vid || null, vote: v.vote || null, score: v.score || 0 }; }) : null,
        guilty: ret ? (ret.guilty || 0) : null, playerVoter: ret ? !!ret.playerVoter : null,
        stack: stack, via: 'tallyVotes' });
    } catch (e) { err('tallyVotes-log', e.message); }
    return ret;
  });

  wrap('mootQuorum', function (c) {
    mark('mootQuorum');
    let ret = null;
    try { ret = origs.mootQuorum.call(Game, c); } catch (e) { err('mootQuorum-call', e.message); }
    try {
      t.quorumEvents.push({ seq: ++seq, day: dayOf(Game), caseId: (c && c.id) || null,
        living: ret ? ret.living : null, present: ret ? ret.present : null,
        quorum: ret ? !!ret.quorum : null, stack: stackText(2), via: 'mootQuorum' });
    } catch (e) { err('mootQuorum-log', e.message); }
    return ret;
  });

  // ---- (11) vote + verdict + sentence + resolution ----
  wrap('castPlayerVote', function (caseId, guiltyVote) {
    mark('castPlayerVote');
    const stack = stackText(2);
    let ret = null;
    try { ret = origs.castPlayerVote.call(Game, caseId, guiltyVote); } catch (e) { err('castPlayerVote-call', e.message); }
    try {
      t.voteEvents.push({ seq: ++seq, day: dayOf(Game), caseId: caseId || null,
        guiltyVote: !!guiltyVote, stack: stack, via: 'castPlayerVote' });
    } catch (e) { err('castPlayerVote-log', e.message); }
    return ret;
  });

  wrap('finishTrial', function (c, playerGuiltyVotes) {
    mark('finishTrial');
    const stack = stackText(2);
    let ret = null;
    try { ret = origs.finishTrial.call(Game, c, playerGuiltyVotes); } catch (e) { err('finishTrial-call', e.message); }
    try {
      t.finishEvents.push({ seq: ++seq, day: dayOf(Game), caseId: (c && c.id) || null,
        convicted: (c && c.trial) ? (c.trial.convicted == null ? null : !!c.trial.convicted) : null,
        advisory: !!(ret && ret.advisory), guilty: (c && c.trial) ? (c.trial.finalGuilty == null ? null : c.trial.finalGuilty) : null,
        total: (c && c.trial) ? ((c.trial.present || []).length + (c.trial.playerVoter ? 1 : 0)) : null,
        resolution: (c && c.resolution) || null, status: (c && c.status) || null,
        playerGuiltyVotes: playerGuiltyVotes || 0, stack: stack, via: 'finishTrial' });
    } catch (e) { err('finishTrial-log', e.message); }
    return ret;
  });

  wrap('sentenceCase', function (c) {
    mark('sentenceCase');
    const stack = stackText(2);
    let avg = null;
    try { avg = (typeof Game.avgBelief === 'function') ? Game.avgBelief(c) : null; } catch (e) {}
    let ret = null;
    try { ret = origs.sentenceCase.call(Game, c); } catch (e) { err('sentenceCase-call', e.message); }
    try {
      t.sentenceEvents.push({ seq: ++seq, day: dayOf(Game), caseId: (c && c.id) || null,
        charge: (c && c.charge) || null, avgBelief: avg,
        resolution: (ret && ret.path) || null, stack: stack, via: 'sentenceCase' });
    } catch (e) { err('sentenceCase-log', e.message); }
    return ret;
  });

  wrap('resolveCase', function (caseId, path) {
    mark('resolveCase');
    const stack = stackText(2);
    let ret = null;
    try { ret = origs.resolveCase.call(Game, caseId, path); } catch (e) { err('resolveCase-call', e.message); }
    try {
      const c = (typeof Game.getCase === 'function') ? Game.getCase(caseId) : null;
      t.resolveEvents.push({ seq: ++seq, day: dayOf(Game), caseId: caseId || null,
        path: path || null, accused: c ? (c.accused || []).slice() : null,
        already: !!(ret && ret.already), resolution: c ? (c.resolution || null) : null,
        stack: stack, via: 'resolveCase' });
    } catch (e) { err('resolveCase-log', e.message); }
    return ret;
  });

  // ---- (12) bribery ----
  wrap('bribeVoter', function (caseId, voterId, byId, amount) {
    mark('bribeVoter');
    let ret = null;
    try { ret = origs.bribeVoter.call(Game, caseId, voterId, byId, amount); } catch (e) { err('bribeVoter-call', e.message); }
    try { t.bribeEvents.push({ seq: ++seq, day: dayOf(Game), caseId: caseId || null, voter: voterId || null, by: byId || null, amount: amount || 0, ok: !!ret, stack: stackText(2), via: 'bribeVoter' }); } catch (e) { err('bribeVoter-log', e.message); }
    return ret;
  });

  wrap('exposeBribery', function (caseId, voterId) {
    mark('exposeBribery');
    let ret = null;
    try { ret = origs.exposeBribery.call(Game, caseId, voterId); } catch (e) { err('exposeBribery-call', e.message); }
    try { t.exposeEvents.push({ seq: ++seq, day: dayOf(Game), caseId: caseId || null, voter: voterId || null, ok: !!ret, stack: stackText(2), via: 'exposeBribery' }); } catch (e) { err('exposeBribery-log', e.message); }
    return ret;
  });

  wrap('investigateBribery', function (caseId, opts) {
    mark('investigateBribery');
    let ret = null;
    try { ret = origs.investigateBribery.call(Game, caseId, opts); } catch (e) { err('investigateBribery-call', e.message); }
    try { t.investigateEvents.push({ seq: ++seq, day: dayOf(Game), caseId: caseId || null, found: ret ? ret.length : 0, stack: stackText(2), via: 'investigateBribery' }); } catch (e) { err('investigateBribery-log', e.message); }
    return ret;
  });

  // ---- (13) removals ----
  wrap('removeVillager', function (vid, how) {
    mark('removeVillager');
    let ret;
    try { ret = origs.removeVillager.call(Game, vid, how); } catch (e) { err('removeVillager-call', e.message); }
    try { t.removeEvents.push({ seq: ++seq, day: dayOf(Game), vid: vid || null, reason: how || null, stack: stackText(2), via: 'removeVillager' }); } catch (e) { err('removeVillager-log', e.message); }
    return ret;
  });

  // ---- (14) trust ----
  wrap('bumpTrust', function (vid, n, reason) {
    mark('bumpTrust');
    const stack = stackText(2);
    const before = trustOf(Game, vid);
    let ret;
    try { ret = origs.bumpTrust.call(Game, vid, n, reason); } catch (e) { err('bumpTrust-call', e.message); }
    try {
      t.bumpTrustEvents.push({ seq: ++seq, day: dayOf(Game), vid: vid || null,
        requested: (n | 0), before: before, after: trustOf(Game, vid),
        reason: reason || null, stack: stack, via: 'bumpTrust' });
    } catch (e) { err('bumpTrust-log', e.message); }
    return ret;
  });

  wrap('recordGrievance', function (from, to, kind, weight) {
    mark('recordGrievance');
    let ret;
    try { ret = origs.recordGrievance.call(Game, from, to, kind, weight); } catch (e) { err('recordGrievance-call', e.message); }
    try { t.grievanceEvents.push({ seq: ++seq, day: dayOf(Game), from: from || null, to: to || null, kind: kind || null, weight: (weight | 0), stack: stackText(2), via: 'recordGrievance' }); } catch (e) { err('recordGrievance-log', e.message); }
    return ret;
  });

  // ---- (15) daily snapshot ----
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
      const j = rawJustice(Game) || {};
      snap.justice = {
        stage: j.stage || 0, heat: heatOf(Game),
        exiled: !!j.exiled, exileDay: j.exileDay || null,
        amendsCredit: j.amendsCredit || 0,
        confrontedBy: j.confrontedBy || null, pendingConfront: !!j.pendingConfront,
        mootDemanded: !!j.mootDemanded,
        crimes: (j.crimes || []).map(function (c) {
          return { type: c.type || null, victim: c.victim || null, witnessed: c.witnessed == null ? null : !!c.witnessed, caseId: c.caseId || null, day: c.day || null };
        }),
      };
    } catch (e) { err('snapshot-justice', e.message); }
    try {
      const bs = (typeof Game.betrayalState === 'function') ? Game.betrayalState() : {};
      snap.cases = ((bs.cases || []).map(caseLite));
      snap.coldWar = bs.coldWar || 0;
    } catch (e) { err('snapshot-cases', e.message); }
    try {
      const v = Game.state.village || {};
      snap.roster = (v.roster || []).slice();
      snap.trust = clone(v.trust || {});
      snap.takes = clone(v.takes || {});
      snap.gives = clone(v.gives || {});
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

module.exports = { install: install, CRIME_TYPES: CRIME_TYPES, CHARGES: CHARGES, RESOLUTIONS: RESOLUTIONS };
