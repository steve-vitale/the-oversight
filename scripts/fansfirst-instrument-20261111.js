// fansfirst-instrument-20261111.js — fans / audience first-numbers
// recorder (arm sim-fansfirst-a, run fleshout-20261111T0715Z).
// Scripts only, zero src/js.
//
// Records, per seed:
//   (1) FAVOR (apAdjustFavor): every call — n, why, lane, clubs
//       before/after, apFavor before/after.
//   (2) PACKAGES (apCarePackage): every call — favor at call,
//       returned, gift id + tier (via apWackyGift), snack kcal
//       (via scholar-kcal diff), club-credit line (via
//       apPackageClubLine read), origin (daily-tick vs direct
//       show/contest call, from the _inDailyTick flag).
//   (3) WACKY (apWackyGift): every call — tier, returned id/null
//       (vault-shy).
//   (4) GRANTS (apGrantItem): every call — itemId, and whether it
//       was issued inside a fan package/boon (context flag) vs a
//       persona package vs other.
//   (5) CLUBLINE (apPackageClubLine): every call — returned string,
//       top lane, top lane value.
//   (6) BOONS (apClubBoon): every call — returned, top lane +
//       value, boon type (from the say lines fired during the call
//       + state diff: health / pantry / unity / gift).
//   (7) FEED (apFeedMessage): every call — returned, favor at call,
//       lane values at call.
//   (8) DAILY (apDailyTick): every call — eligible or not
//       (apEligible), drift diff (clubs before/after on %3 days),
//       the package gate/cooldown/roll outcome for that day (a
//       roll-block is counted here, never inferred from silence:
//       if no package event was added during the tick while the
//       gate + cooldown would have passed, the 25% roll failed),
//       sub-event counts during the tick.
//   (9) PERSONA PACKAGES (apPersonaPackage): every call —
//       returned, say-seq range. Separate class: meddler packages,
//       never counted as fan packages.
//  (10) INTERFERENCE (apContestInterference): every call —
//       forPlayer, winMod, deathSave, note, favor at call.
//  (11) TRIALS (offerAudienceTrial / completeTrial /
//       checkStruggle): every call — reason, task id/text,
//       expires; completion with integration before/after;
//       struggle-check offers.
//  (12) SAY + SYSSAY: fan-regex lines only (uncapped up to a
//       5000-line cap with a dropped counter), day + seq + source
//       (say vs sysSay) — the per-call attribution source and the
//       line-repetition census. BOTH are wrapped, and that is
//       correct in node, not a double-count: the harness stubs say
//       and sysSay as SEPARATE no-ops (sim-harness.js:242-243,
//       narration off), so a sysSay line never reaches say in a
//       node sim. In the browser sysSay routes through say
//       (game.js:37082) — but this instrument never runs in the
//       browser. Say-only capture would lose every feed and
//       favor-announce line in the pilot (the abilityfirst
//       "sysSay blind spot" is real under the harness).
//  (13) TELE: only tele types matching /fan|favor|audience|
//       package|boon|trial/i are recorded. No fan/favor tele
//       type is known to exist (no tele('fan…') call found in
//       alienPlayers.js or contests.js) — the wrap exists to
//       catch one if it fires, and the proof asserts the
//       absence honestly rather than inventing a cross-check.
//  (14) DAILY SNAPSHOT: fanClubs, apFavor, topLane,
//       lastPackageDay/lastBoonDay/lastFeedDay, havenViewership,
//       contestsHeld, trial state, pantry kcal, roster size,
//       standing, scaleRank, nationalLive, wave.
//
// All wraps are record-only: call the original, return its value
// unchanged, never alter state, never consume RNG. Any failure in
// the RECORDING path is logged to instrumentErrors, never thrown
// into the game.
//
// KNOWN WRAP LIMIT: a wrap records nothing if the engine calls a
// closure instead of the Game method. apDailyTick IS a Game method
// (called as this.apDailyTick() from the endDay wrapper), so the
// wrap sees every daily tick. The 25% package roll lives inside
// the original apDailyTick and is not directly visible — it is
// classified by the (8) gate/cooldown/roll accounting above.
//
// Usage: const FF = require('./fansfirst-instrument-20261111');
//   const ff = FF.install(Game); ff.snapshot(); ... ff.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function clone(o) { try { return JSON.parse(JSON.stringify(o || {})); } catch (e) { return {}; } }
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) { return null; }
}
function fanClubsOf(Game) {
  try {
    var ap = (Game.state || {}).alienPlayers || {};
    return clone(ap.fanClubs || {});
  } catch (e) { return {}; }
}
function favorOf(Game) {
  try { return (typeof Game.apFavor === 'function') ? Game.apFavor() : null; } catch (e) { return null; }
}
function topLaneOf(Game) {
  try { return (typeof Game.apTopLane === 'function') ? Game.apTopLane() : null; } catch (e) { return null; }
}
function viewershipOf(Game) {
  try { return (typeof Game.havenViewership === 'function') ? Game.havenViewership() : null; } catch (e) { return null; }
}
function trialOf(Game) {
  try {
    if (typeof Game.progState === 'function') {
      var pg = Game.progState() || {};
      return pg.trial ? clone(pg.trial) : null;
    }
  } catch (e) {}
  return null;
}
function scholarKcal(Game) {
  try { return ((Game.state || {}).scholar || {}).kcal || 0; } catch (e) { return null; }
}

// The fan say regex: broad enough to catch every fan/audience line
// (packages, boons, feed, trials, favor announcements, viewership)
// plus the two known other-system matches (the "fan" in "OnlyFans"-
// style jokes does not exist in the corpus; 'favor' also matches
// the alien-player "fan favor" lines, which ARE fan lines).
// Word boundaries on 'boo' (bare 'boo' matched 'book'/'boost' in a
// smoke pass) and on 'cheer'. The 📦 prefix is needed because the
// persona-package line carries no keyword at all; the analyzer
// classifies 📦 lines by their origin flag, never by emoji alone.
const FAN_SAY_RE = /fan|audience|care package|favor|viewer|showbiz|moot crowd|fight fans|survival fans|the crowd|\bcheer\b|\bboo\b|📦|◈ AUDIENCE TRIAL/i;
const SAY_CAP = 5000;
const TELE_RE = /fan|favor|audience|package|boon|trial/i;

function install(Game) {
  const t = {
    favorEvents: [], packageEvents: [], wackyEvents: [], grantEvents: [],
    clubLineEvents: [], boonEvents: [], feedEvents: [], dailyEvents: [],
    personaPackageEvents: [], interferenceEvents: [], trialEvents: [],
    fanSays: [], teleEvents: [],
    daily: [], instrumentErrors: [], wrapLive: {}, wrapCounts: {},
    sayDropped: 0, teleWrapped: false,
  };
  let seq = 0;
  let saySeq = 0;
  const origs = {};
  // Context flags (single-threaded; set around the original call).
  let inDailyTick = false;
  let inFanPackage = false;
  let inFanBoon = false;
  let inPersonaPackage = false;

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
  function saySeqNow() { return saySeq; }

  // ---- (12) say + sysSay capture (installed first: other wraps read its seq) ----
  // BOTH are wrapped, and that is correct in node, not a double-count:
  // the harness stubs say and sysSay as SEPARATE no-ops
  // (sim-harness.js:242-243, narration off), so a sysSay line never
  // reaches say in a node sim. In the browser sysSay routes through
  // say (game.js:37082) — but this instrument never runs in the
  // browser. Wrapping say only would lose every feed/favor-announce
  // line in the pilot (the abilityfirst "sysSay blind spot", which
  // is real under the harness, not in the browser).
  // GUARD: the sysSay wrapper replicates the real sysSay's
  // systemArrived early-return (game.js:37082) — the harness stub
  // has no such guard, so without it pre-arrival feed lines the
  // player would never see would enter the corpus as phantoms.
  function installSay(name) {
    try {
      if (typeof Game[name] !== 'function') { err(name + '-missing', 'Game.' + name + ' is not a function'); return; }
      origs[name] = Game[name];
      Game[name] = function () {
        let ret;
        try { ret = origs[name].apply(Game, arguments); } catch (e) { err(name + '-call', e.message); }
        try {
          // GUARD: the real sysSay returns early when the System has
          // not arrived (game.js:37082); the harness stub has no such
          // guard, so the sysSay wrapper replicates it — a pre-arrival
          // feed line the player would never see is not recorded.
          // The say wrapper has no guard: the real say is unconditional.
          if (name === 'sysSay') {
            try { if (!((Game.state || {}).systemArrived)) return ret; } catch (e) { return ret; }
          }
          const arg = arguments.length ? arguments[0] : null;
          if (typeof arg === 'string' && FAN_SAY_RE.test(arg)) {
            if (t.fanSays.length < SAY_CAP) {
              t.fanSays.push({ seq: ++saySeq, day: dayOf(Game), src: name, line: String(arg).slice(0, 600) });
            } else { t.sayDropped++; }
          }
        } catch (e) { err(name + '-log', e.message); }
        return ret;
      };
      mark(name);
    } catch (e) { err(name + '-wrap', e.message); }
  }
  installSay('say');
  installSay('sysSay');

  // ---- (13) tele (filtered) ----
  try {
    if (typeof Game.tele === 'function') {
      origs.tele = Game.tele;
      Game.tele = function (type, data) {
        let ret;
        try { ret = origs.tele.apply(Game, arguments); } catch (e) { err('tele-call', e.message); }
        try {
          if (typeof type === 'string' && TELE_RE.test(type)) {
            t.teleEvents.push({ seq: ++seq, day: dayOf(Game), type: type, data: clone(data || {}) });
          }
        } catch (e) { err('tele-log', e.message); }
        return ret;
      };
      t.teleWrapped = true;
      mark('tele');
    } else { t.teleWrapped = false; }
  } catch (e) { err('tele-wrap', e.message); }

  // ---- (1) favor ----
  wrap('apAdjustFavor', function (n, why, lane) {
    mark('apAdjustFavor');
    let before = null, favorBefore = null;
    try { before = fanClubsOf(Game); favorBefore = favorOf(Game); } catch (e) { err('apAdjustFavor-pre', e.message); }
    let ret;
    try { ret = origs.apAdjustFavor.call(Game, n, why, lane); } catch (e) { err('apAdjustFavor-call', e.message); }
    try {
      t.favorEvents.push({ seq: ++seq, day: dayOf(Game), n: n, why: (why == null ? null : String(why)),
        lane: lane || 'showbiz', clubsBefore: before, clubsAfter: fanClubsOf(Game),
        favorBefore: favorBefore, favorAfter: favorOf(Game), saySeqBefore: saySeqNow(), via: 'apAdjustFavor' });
    } catch (e) { err('apAdjustFavor-log', e.message); }
    return ret;
  });

  // ---- (3) wacky gift (installed before apCarePackage so the gift is seen) ----
  wrap('apWackyGift', function (tier) {
    mark('apWackyGift');
    let ret = null;
    try { ret = origs.apWackyGift.call(Game, tier); } catch (e) { err('apWackyGift-call', e.message); }
    try {
      t.wackyEvents.push({ seq: ++seq, day: dayOf(Game), tier: tier || 1,
        giftId: (ret && ret.id) || null, giftName: (ret && ret.name) || null,
        inFanPackage: inFanPackage, inFanBoon: inFanBoon, via: 'apWackyGift' });
    } catch (e) { err('apWackyGift-log', e.message); }
    return ret;
  });

  // ---- (4) grants ----
  wrap('apGrantItem', function (itemId) {
    mark('apGrantItem');
    let ret = null;
    try { ret = origs.apGrantItem.call(Game, itemId); } catch (e) { err('apGrantItem-call', e.message); }
    try {
      var ctx = inFanPackage ? 'fan-package' : inFanBoon ? 'fan-boon' : inPersonaPackage ? 'persona-package' : 'other';
      t.grantEvents.push({ seq: ++seq, day: dayOf(Game), itemId: itemId || null, ctx: ctx, via: 'apGrantItem' });
    } catch (e) { err('apGrantItem-log', e.message); }
    return ret;
  });

  // ---- (5) club credit line ----
  wrap('apPackageClubLine', function () {
    mark('apPackageClubLine');
    let ret = '';
    try { ret = origs.apPackageClubLine.call(Game); } catch (e) { err('apPackageClubLine-call', e.message); }
    try {
      t.clubLineEvents.push({ seq: ++seq, day: dayOf(Game), line: (ret == null ? null : String(ret)),
        topLane: topLaneOf(Game), topValue: (function () { try { return Game.apFanLane(topLaneOf(Game)); } catch (e2) { return null; } })(), via: 'apPackageClubLine' });
    } catch (e) { err('apPackageClubLine-log', e.message); }
    return ret;
  });

  // ---- (2) care packages ----
  wrap('apCarePackage', function () {
    mark('apCarePackage');
    let pre = null;
    try {
      var ap = (Game.state || {}).alienPlayers || {};
      pre = { favor: favorOf(Game), day: dayOf(Game),
        lastPackageDay: (ap.lastPackageDay == null ? null : ap.lastPackageDay),
        kcalBefore: scholarKcal(Game), sayBefore: saySeqNow(),
        pkgCountBefore: t.packageEvents.length, wackyBefore: t.wackyEvents.length };
    } catch (e) { err('apCarePackage-pre', e.message); }
    let ret = false;
    inFanPackage = true;
    try { ret = origs.apCarePackage.call(Game); } catch (e) { err('apCarePackage-call', e.message); }
    inFanPackage = false;
    try {
      var gift = null;
      try {
        for (var i = t.wackyEvents.length - 1; i >= (pre ? pre.wackyBefore : 0); i--) {
          if (t.wackyEvents[i] && t.wackyEvents[i].inFanPackage) { gift = t.wackyEvents[i]; break; }
        }
      } catch (e) {}
      t.packageEvents.push({ seq: ++seq, day: dayOf(Game), returned: !!ret,
        origin: inDailyTick ? 'daily-tick' : 'direct',
        favorAtCall: pre ? pre.favor : null, lastPackageDay: pre ? pre.lastPackageDay : null,
        kcalBefore: pre ? pre.kcalBefore : null, kcalAfter: scholarKcal(Game),
        giftId: gift ? gift.giftId : null, giftTier: gift ? gift.tier : null,
        saySeqBefore: pre ? pre.sayBefore : null, saySeqAfter: saySeqNow(), via: 'apCarePackage' });
    } catch (e) { err('apCarePackage-log', e.message); }
    return ret;
  });

  // ---- (6) club boons ----
  wrap('apClubBoon', function () {
    mark('apClubBoon');
    let pre = null;
    try {
      var ap = (Game.state || {}).alienPlayers || {};
      pre = { day: dayOf(Game), topLane: topLaneOf(Game),
        topValue: (function () { try { return Game.apFanLane(topLaneOf(Game)); } catch (e2) { return null; } })(),
        lastBoonDay: (ap.lastBoonDay == null ? null : ap.lastBoonDay),
        healthBefore: ((Game.state || {}).scholar || {}).health,
        pantryBefore: pantryKcal(Game), sayBefore: saySeqNow() };
    } catch (e) { err('apClubBoon-pre', e.message); }
    let ret = false;
    inFanBoon = true;
    try { ret = origs.apClubBoon.call(Game); } catch (e) { err('apClubBoon-call', e.message); }
    inFanBoon = false;
    try {
      t.boonEvents.push({ seq: ++seq, day: dayOf(Game), returned: !!ret,
        origin: inDailyTick ? 'daily-tick' : 'direct',
        topLane: pre ? pre.topLane : null, topValue: pre ? pre.topValue : null,
        lastBoonDay: pre ? pre.lastBoonDay : null,
        healthBefore: pre ? pre.healthBefore : null, healthAfter: ((Game.state || {}).scholar || {}).health,
        pantryBefore: pre ? pre.pantryBefore : null, pantryAfter: pantryKcal(Game),
        saySeqBefore: pre ? pre.sayBefore : null, saySeqAfter: saySeqNow(), via: 'apClubBoon' });
    } catch (e) { err('apClubBoon-log', e.message); }
    return ret;
  });

  // ---- (7) feed ----
  wrap('apFeedMessage', function () {
    mark('apFeedMessage');
    let pre = null;
    try {
      var ap = (Game.state || {}).alienPlayers || {};
      pre = { day: dayOf(Game), favor: favorOf(Game), clubs: fanClubsOf(Game),
        lastFeedDay: (ap.lastFeedDay == null ? null : ap.lastFeedDay), sayBefore: saySeqNow() };
    } catch (e) { err('apFeedMessage-pre', e.message); }
    let ret = false;
    try { ret = origs.apFeedMessage.call(Game); } catch (e) { err('apFeedMessage-call', e.message); }
    try {
      t.feedEvents.push({ seq: ++seq, day: dayOf(Game), returned: !!ret,
        origin: inDailyTick ? 'daily-tick' : 'direct',
        favorAtCall: pre ? pre.favor : null, clubsAtCall: pre ? pre.clubs : null,
        lastFeedDay: pre ? pre.lastFeedDay : null,
        saySeqBefore: pre ? pre.sayBefore : null, saySeqAfter: saySeqNow(), via: 'apFeedMessage' });
    } catch (e) { err('apFeedMessage-log', e.message); }
    return ret;
  });

  // ---- (8) daily tick ----
  wrap('apDailyTick', function () {
    mark('apDailyTick');
    let pre = null;
    try {
      var ap = (Game.state || {}).alienPlayers || {};
      pre = { day: dayOf(Game),
        eligible: (function () { try { return Game.apEligible(); } catch (e2) { return null; } })(),
        clubs: fanClubsOf(Game), favor: favorOf(Game),
        lastPackageDay: (ap.lastPackageDay == null ? null : ap.lastPackageDay),
        pkgCount: t.packageEvents.length, boonCount: t.boonEvents.length,
        feedCount: t.feedEvents.length, sayBefore: saySeqNow() };
    } catch (e) { err('apDailyTick-pre', e.message); }
    let ret;
    inDailyTick = true;
    try { ret = origs.apDailyTick.apply(Game, arguments); } catch (e) { err('apDailyTick-call', e.message); }
    inDailyTick = false;
    try {
      var post = fanClubsOf(Game);
      var drift = null;
      try {
        if (pre && JSON.stringify(pre.clubs) !== JSON.stringify(post)) {
          drift = { before: pre.clubs, after: post };
        }
      } catch (e) {}
      // Package roll accounting: a package event added during this
      // tick means the 25% roll passed and apCarePackage ran; none
      // added while gate + cooldown passed means the roll failed.
      var pkgAdded = t.packageEvents.length - (pre ? pre.pkgCount : 0);
      var gateOk = (pre ? pre.favor : -999) >= 12;
      var cdOk = pre ? ((pre.day - (pre.lastPackageDay == null ? -999 : pre.lastPackageDay)) >= 4) : false;
      var pkgRoll = null;
      if (pkgAdded > 0) pkgRoll = 'called';
      else if (gateOk && cdOk) pkgRoll = 'roll-blocked';
      else if (!gateOk) pkgRoll = 'gate-blocked';
      else pkgRoll = 'cooldown-blocked';
      t.dailyEvents.push({ seq: ++seq, day: dayOf(Game),
        eligible: pre ? pre.eligible : null, drift: drift,
        pkgAdded: pkgAdded, pkgRoll: pkgRoll,
        boonAdded: t.boonEvents.length - (pre ? pre.boonCount : 0),
        feedAdded: t.feedEvents.length - (pre ? pre.feedCount : 0),
        clubsAfter: post, saySeqBefore: pre ? pre.sayBefore : null,
        saySeqAfter: saySeqNow(), via: 'apDailyTick' });
    } catch (e) { err('apDailyTick-log', e.message); }
    return ret;
  });

  // ---- (9) persona packages ----
  wrap('apPersonaPackage', function () {
    mark('apPersonaPackage');
    let pre = null;
    try { pre = { day: dayOf(Game), sayBefore: saySeqNow() }; } catch (e) { err('apPersonaPackage-pre', e.message); }
    let ret = false;
    inPersonaPackage = true;
    try { ret = origs.apPersonaPackage.call(Game); } catch (e) { err('apPersonaPackage-call', e.message); }
    inPersonaPackage = false;
    try {
      t.personaPackageEvents.push({ seq: ++seq, day: dayOf(Game), returned: !!ret,
        saySeqBefore: pre ? pre.sayBefore : null, saySeqAfter: saySeqNow(), via: 'apPersonaPackage' });
    } catch (e) { err('apPersonaPackage-log', e.message); }
    return ret;
  });

  // ---- (10) contest interference ----
  wrap('apContestInterference', function (ac, opts) {
    mark('apContestInterference');
    let pre = null;
    try { pre = { day: dayOf(Game), favor: favorOf(Game), forPlayer: !!(opts && opts.forPlayer), sayBefore: saySeqNow() }; } catch (e) { err('apContestInterference-pre', e.message); }
    let ret = null;
    try { ret = origs.apContestInterference.call(Game, ac, opts); } catch (e) { err('apContestInterference-call', e.message); }
    try {
      t.interferenceEvents.push({ seq: ++seq, day: dayOf(Game),
        forPlayer: pre ? pre.forPlayer : null, favorAtCall: pre ? pre.favor : null,
        winMod: (ret && ret.winMod != null) ? ret.winMod : null,
        deathSave: (ret && ret.deathSave != null) ? !!ret.deathSave : null,
        note: (ret && ret.note) ? String(ret.note).slice(0, 300) : null,
        saySeqBefore: pre ? pre.sayBefore : null, saySeqAfter: saySeqNow(), via: 'apContestInterference' });
    } catch (e) { err('apContestInterference-log', e.message); }
    return ret;
  });

  // ---- (11) audience trials ----
  wrap('offerAudienceTrial', function (reason) {
    mark('offerAudienceTrial');
    let pre = null;
    try { pre = { day: dayOf(Game), trialBefore: trialOf(Game), sayBefore: saySeqNow() }; } catch (e) { err('offerAudienceTrial-pre', e.message); }
    let ret;
    try { ret = origs.offerAudienceTrial.call(Game, reason); } catch (e) { err('offerAudienceTrial-call', e.message); }
    try {
      var after = trialOf(Game);
      t.trialEvents.push({ seq: ++seq, day: dayOf(Game), kind: 'offer',
        reason: (reason == null ? null : String(reason)),
        offered: !!(after && (!pre || !pre.trialBefore)),
        taskId: after ? (after.id || null) : null, taskText: after ? (after.text || null) : null,
        expires: after ? (after.expires == null ? null : after.expires) : null,
        saySeqBefore: pre ? pre.sayBefore : null, saySeqAfter: saySeqNow(), via: 'offerAudienceTrial' });
    } catch (e) { err('offerAudienceTrial-log', e.message); }
    return ret;
  });
  wrap('completeTrial', function () {
    mark('completeTrial');
    let pre = null;
    try {
      pre = { day: dayOf(Game), trialBefore: trialOf(Game),
        integrationBefore: ((Game.state || {}).scholar || {}).integration,
        sayBefore: saySeqNow() };
    } catch (e) { err('completeTrial-pre', e.message); }
    let ret;
    try { ret = origs.completeTrial.apply(Game, arguments); } catch (e) { err('completeTrial-call', e.message); }
    try {
      t.trialEvents.push({ seq: ++seq, day: dayOf(Game), kind: 'complete',
        taskId: pre && pre.trialBefore ? (pre.trialBefore.id || null) : null,
        integrationBefore: pre ? pre.integrationBefore : null,
        integrationAfter: ((Game.state || {}).scholar || {}).integration,
        trialAfter: trialOf(Game),
        saySeqBefore: pre ? pre.sayBefore : null, saySeqAfter: saySeqNow(), via: 'completeTrial' });
    } catch (e) { err('completeTrial-log', e.message); }
    return ret;
  });
  wrap('checkStruggle', function () {
    mark('checkStruggle');
    let pre = null;
    try { pre = { day: dayOf(Game), trialBefore: trialOf(Game) }; } catch (e) { err('checkStruggle-pre', e.message); }
    let ret;
    try { ret = origs.checkStruggle.apply(Game, arguments); } catch (e) { err('checkStruggle-call', e.message); }
    try {
      var after = trialOf(Game);
      t.trialEvents.push({ seq: ++seq, day: dayOf(Game), kind: 'struggle-check',
        offered: !!(after && (!pre || !pre.trialBefore)), taskId: after ? (after.id || null) : null,
        via: 'checkStruggle' });
    } catch (e) { err('checkStruggle-log', e.message); }
    return ret;
  });

  // ---- (14) daily snapshot ----
  function snapshot() {
    const snap = { day: dayOf(Game), seq: seq };
    try { snap.fanClubs = fanClubsOf(Game); } catch (e) { snap.fanClubs = null; }
    try { snap.favor = favorOf(Game); } catch (e) { snap.favor = null; }
    try { snap.topLane = topLaneOf(Game); } catch (e) { snap.topLane = null; }
    try {
      var ap = (Game.state || {}).alienPlayers || {};
      snap.lastPackageDay = (ap.lastPackageDay == null ? null : ap.lastPackageDay);
      snap.lastBoonDay = (ap.lastBoonDay == null ? null : ap.lastBoonDay);
      snap.lastFeedDay = (ap.lastFeedDay == null ? null : ap.lastFeedDay);
      snap.legacyFavor = (ap.favor == null ? null : ap.favor);
    } catch (e) { snap.lastPackageDay = null; snap.lastBoonDay = null; snap.lastFeedDay = null; }
    try { snap.viewership = viewershipOf(Game); } catch (e) { snap.viewership = null; }
    try { snap.contestsHeld = ((Game.state || {}).contestsHeld == null ? null : Game.state.contestsHeld); } catch (e) { snap.contestsHeld = null; }
    try { snap.trial = trialOf(Game); } catch (e) { snap.trial = null; }
    try { snap.pantryKcal = pantryKcal(Game); } catch (e) { snap.pantryKcal = null; }
    try { snap.rosterSize = ((Game.state.village || {}).roster || []).length; } catch (e) { snap.rosterSize = null; }
    try { snap.standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) { snap.standing = null; }
    try { snap.scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { snap.scaleRank = null; }
    try { snap.nationalLive = !!(Game.state || {}).nationalLive; } catch (e) { snap.nationalLive = null; }
    try { snap.wave = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { snap.wave = null; }
    try { snap.systemArrived = !!(Game.state || {}).systemArrived; } catch (e) { snap.systemArrived = null; }
    try { snap.bearer = Game.villagerId || null; } catch (e) { snap.bearer = null; }
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

  return { t: t, snapshot: snapshot, uninstall: uninstall, SAY_RE: FAN_SAY_RE };
}

module.exports = { install: install, FAN_SAY_RE: FAN_SAY_RE };
