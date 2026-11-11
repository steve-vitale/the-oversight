// trustfirst-instrument-20261111.js — trust + gossip first-numbers
// recorder (arm sim-trustfirst-a, run fleshout-20261111T0815Z).
// Scripts only, zero src/js.
//
// Records, per seed:
//   (1) VILLAGER TRUST WRITES (bumpTrust / _evTrustAll / applyRep
//       drift / deed-direct trustGainProgressive calls): every call —
//       vid, requested vs applied, reason/caller stack. The four
//       trust numbers are kept apart: villager trust
//       (state.village.trust[vid]), village opinion (ov.trust),
//       link trust (link.trust, via the reused trustgrowth
//       instrument), reputation (state.village.rep[vid]).
//   (2) REPUTATION WRITES (applyRep): every call — vid, dims,
//       weight, noTrust, rep before/after, trust before/after
//       (drift visible or not), caller stack.
//   (3) OBSERVE (observe): every call — action, opts, caller stack.
//       Witnesses/effects ride the applyRep + seedGossip wraps.
//   (4) GOSSIP SEEDS (seedGossip): every call — action, dims,
//       heardBy, noTrust, dedupe-hit or new, caller stack.
//   (5) GOSSIP SPREAD (spreadGossip): per call, per gossip item —
//       heard before/after (new listeners), distortion before/after,
//       mutated dims, rep applied (via the applyRep wrap's stack),
//       fragments said or gated, items expired. ENGINE LIMIT (recorded
//       honestly): the engine stores no per-hop TELLER — only the
//       heard set and the distortion count — so a hop is recorded as
//       (gossip, new listener, distortion) with teller "a prior
//       hearer", never invented.
//   (6) PLAYER RUMORS (spreadRumor): every call — target, type,
//       first hearer, result. (7) gossipActionDims: every call —
//       action/dims in, rep dims out.
//   (8) CONVERSATIONS (talkTo / endConvo): opens and closes — vid,
//       exchanges, substantive?, stipend applied (before/after
//       trust). Under default competent, talkRound opens and leaves
//       with 0 exchanges: +0 is then a real zero, not a dead wrap.
//   (9) MOOT/JUSTICE (mootQuorum / mootFriendVoice /
//       mootAccuserAftermath): every call — case, quorum, voices,
//       aftermath path. Their trust moves ride the bumpTrust wrap.
//  (10) LINK VERBS (tendLink wrap here; _trustGain + the link-trust
//       setter via the REUSED trustgrowth instrument): tendLink is
//       expected 0 under plain competent — proven live in the
//       fixture by a direct call.
//  (11) VILLAGE OPINION VERBS (villageTalk / villageDeal /
//       villageShareFood / joinVillageReal / probationTick): every call
//       — village, verb, trust before/after, result. All expected 0
//       under competent (app.js UI verbs) — proven live in the
//       fixture by direct calls.
//  (12) RIVER ROUTE (evRiverTrader / feedRiverTrader /
//       tradeRiverTrader / snubRiverTrader): every call — expected 0
//       under the harness (drama stubbed). Proven live in the
//       fixture; a 0 here is a real 0, not a dead wrap.
//  (13) TELEMETRY CROSS-CHECK (tele, if present): 'trust' events
//       only — {who, delta, reason} as the engine teles them.
//  (14) LINK TRUST: reused wholesale from
//       scripts/trustgrowth-instrument-20261109.js — setter
//       interception + _trustGain wrap + daily link snapshots with
//       seq. Its `t` is exposed as `tgT` on the returned handle.
//  (15) DAILY SNAPSHOT: per-villager trust map, per-villager rep
//       dims, trustBand per villager, ov.trust per other village,
//       gossip alive, groups, pantry kcal, roster size, standing,
//       scaleRank, nationalLive, pending flags, justice state,
//       bond proposals/raises state.
//
// All wraps are record-only: call the original, return its value
// unchanged, never alter state, never consume RNG. Any failure in
// the RECORDING path is logged to instrumentErrors, never thrown
// into the game.
//
// KNOWN WRAP RISK (secondlink-a / diplo-a lesson): a wrap records
// nothing if the engine calls the closure instead of the Game
// method. The proof (scripts/test-trustfirst-a.js) verifies EACH
// wrapped method's call path is live on a fixture or live
// miniature; a wrap with no live call observed is marked dead in
// the evidence and its zero is never treated as evidence.
//
// Usage: const TF = require('./trustfirst-instrument-20261111');
//   const tf = TF.install(Game); tf.snapshot(); ... tf.uninstall();
'use strict';
const TG = require('./trustgrowth-instrument-20261109');

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function stackText(skip) {
  try { return (new Error().stack || '').split('\n').slice(skip || 0).join(' | '); } catch (e) { return ''; }
}
function clone(o) { try { return JSON.parse(JSON.stringify(o || {})); } catch (e) { return {}; } }
function trustNow(Game, vid) {
  try { const t = (Game.state.village || {}).trust || {}; return (t[vid] === undefined ? 10 : t[vid]); } catch (e) { return null; }
}
function repNow(Game, vid) {
  try { const r = Game.repOf ? Game.repOf(vid) : {}; return clone(r); } catch (e) { return {}; }
}
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) { return null; }
}

function install(Game) {
  const t = {
    bumpTrust: [], evTrustAll: [], trustGains: [], applyRep: [],
    observe: [], seedGossip: [], spreadGossip: [], spreadRumor: [],
    gossipDims: [], talkOpens: [], endConvo: [], moot: [],
    tendLink: [], opinionVerbs: [], river: [], teleTrust: [],
    trustWrites: [], bondEvents: [], teleBond: [],
    daily: [], instrumentErrors: [], wrapLive: {}, wrapCounts: {},
  };
  let seq = 0;
  const origs = {};
  const instrumentedTrustKeys = new WeakSet(); // map objects already setter-fitted

  function mark(name) {
    t.wrapLive[name] = true;
    t.wrapCounts[name] = (t.wrapCounts[name] || 0) + 1;
  }
  function wrap(name, fn) {
    try {
      if (typeof Game[name] !== 'function') { t.instrumentErrors.push(name + '-missing: Game.' + name + ' is not a function'); return; }
      origs[name] = Game[name];
      Game[name] = fn;
    } catch (e) { t.instrumentErrors.push(name + '-wrap: ' + String(e.message).slice(0, 80)); }
  }

  // ---- link trust: reused wholesale (setter + _trustGain + snapshots) ----
  let tg = null;
  try { tg = TG.install(Game); } catch (e) { t.instrumentErrors.push('trustgrowth-install: ' + String(e.message).slice(0, 80)); }

  // ---- (1a) villager-trust map setter interception (trustgrowth pattern) ----
  // Every write to state.village.trust[vid] is logged with its caller stack,
  // so direct writes that bypass bumpTrust (e.g. abilityActions.js:1848)
  // are caught exactly. The setter never alters a value. Known gap (same
  // as trustgrowth): a write landing between a villager's first appearance
  // and the next snapshot is not setter-logged; the bumpTrust /
  // trustGainProgressive wraps still catch the choked gains in that window.
  // Re-instrumentation runs at every snapshot (new villagers, map swaps).
  const instrumentedTrustVids = new WeakSet();
  function instrumentTrustMap() {
    try {
      const v = Game.state.village || {};
      const map = v.trust || (v.trust = {});
      Object.keys(map).forEach(function (vid) {
        try {
          const desc = Object.getOwnPropertyDescriptor(map, vid);
          if (desc && (desc.get || desc.set)) return; // already fitted
          let cur = map[vid];
          Object.defineProperty(map, vid, {
            configurable: true, enumerable: true,
            get: function () { return cur; },
            set: function (nv) {
              try {
                if (nv !== cur) {
                  t.trustWrites.push({ seq: ++seq, day: dayOf(Game), vid: vid, old: cur, new: nv,
                    delta: nv - cur, stack: stackText(2), via: 'setter' });
                }
                cur = nv;
              } catch (e) { try { cur = nv; } catch (e2) {} t.instrumentErrors.push('trustSetter-log: ' + String(e.message).slice(0, 80)); }
            },
          });
        } catch (e) { t.instrumentErrors.push('instrumentTrustVid: ' + String(e.message).slice(0, 80)); }
      });
    } catch (e) { t.instrumentErrors.push('instrumentTrustMap: ' + String(e.message).slice(0, 80)); }
  }

  // ---- (1) villager trust writes ----
  wrap('bumpTrust', function (vid, n, reason) {
    mark('bumpTrust');
    const stack = stackText(2);
    let before = null, after = null, ret;
    try { before = trustNow(Game, vid); } catch (e) {}
    try { ret = origs.bumpTrust.call(Game, vid, n, reason); } catch (e) { t.instrumentErrors.push('bumpTrust-call: ' + String(e.message).slice(0, 80)); }
    try { after = trustNow(Game, vid); } catch (e) {}
    try {
      t.bumpTrust.push({ seq: ++seq, day: dayOf(Game), vid: vid || null, requested: (n | 0), before: before, after: after,
        applied: (typeof before === 'number' && typeof after === 'number') ? (after - before) : null,
        reason: reason || null, stack: stack, via: 'bumpTrust' });
    } catch (e) { t.instrumentErrors.push('bumpTrust-log: ' + String(e.message).slice(0, 80)); }
    return ret;
  });

  wrap('_evTrustAll', function (n) {
    mark('_evTrustAll');
    const stack = stackText(2);
    let before = {}, after = {}, ret;
    try { before = clone((Game.state.village || {}).trust || {}); } catch (e) {}
    try { ret = origs._evTrustAll.call(Game, n); } catch (e) { t.instrumentErrors.push('_evTrustAll-call: ' + String(e.message).slice(0, 80)); }
    try { after = clone((Game.state.village || {}).trust || {}); } catch (e) {}
    try {
      const applied = {};
      Object.keys(after).forEach(function (vid) {
        const b = (before[vid] === undefined ? 10 : before[vid]);
        if (after[vid] !== b) applied[vid] = after[vid] - b;
      });
      t.evTrustAll.push({ seq: ++seq, day: dayOf(Game), requested: (n | 0), applied: applied, stack: stack, via: 'evTrustAll' });
    } catch (e) { t.instrumentErrors.push('_evTrustAll-log: ' + String(e.message).slice(0, 80)); }
    return ret;
  });

  wrap('trustGainProgressive', function (vid, baseAmount) {
    mark('trustGainProgressive');
    let cur = null, ret = null;
    try { cur = trustNow(Game, vid); } catch (e) {}
    try { ret = origs.trustGainProgressive.call(Game, vid, baseAmount); } catch (e) { t.instrumentErrors.push('trustGainProgressive-call: ' + String(e.message).slice(0, 80)); }
    try {
      t.trustGains.push({ seq: ++seq, day: dayOf(Game), vid: vid || null, base: baseAmount, scaled: ret, cur: cur,
        stack: stackText(2), via: 'trustGainProgressive' });
    } catch (e) { t.instrumentErrors.push('trustGainProgressive-log: ' + String(e.message).slice(0, 80)); }
    return ret;
  });

  // ---- (2) reputation writes ----
  wrap('applyRep', function (vid, dims, weight, noTrust, trustRippleTo) {
    mark('applyRep');
    const stack = stackText(2);
    let repBefore = {}, trustBefore = null, repAfter = {}, trustAfter = null, ret;
    try { repBefore = repNow(Game, vid); trustBefore = trustNow(Game, vid); } catch (e) {}
    try { ret = origs.applyRep.call(Game, vid, dims, weight, noTrust, trustRippleTo); } catch (e) { t.instrumentErrors.push('applyRep-call: ' + String(e.message).slice(0, 80)); }
    try { repAfter = repNow(Game, vid); trustAfter = trustNow(Game, vid); } catch (e) {}
    try {
      const repDelta = {};
      Object.keys(dims || {}).forEach(function (k) {
        const d = (repAfter[k] || 0) - (repBefore[k] || 0);
        if (d) repDelta[k] = d;
      });
      t.applyRep.push({ seq: ++seq, day: dayOf(Game), vid: vid || null, dims: clone(dims || {}),
        weight: (weight === undefined ? null : weight), noTrust: !!noTrust,
        repBefore: repBefore, repAfter: repAfter, repDelta: repDelta,
        trustBefore: trustBefore, trustAfter: trustAfter,
        trustDelta: (typeof trustBefore === 'number' && typeof trustAfter === 'number') ? (trustAfter - trustBefore) : null,
        stack: stack, via: 'applyRep' });
    } catch (e) { t.instrumentErrors.push('applyRep-log: ' + String(e.message).slice(0, 80)); }
    return ret;
  });

  // ---- (3) observe ----
  wrap('observe', function (action, opts) {
    mark('observe');
    let ret;
    try { ret = origs.observe.call(Game, action, opts); } catch (e) { t.instrumentErrors.push('observe-call: ' + String(e.message).slice(0, 80)); }
    try {
      t.observe.push({ seq: ++seq, day: dayOf(Game), action: action || null,
        target: (opts && opts.target) || null, noTrust: !!(opts && opts.noTrust), noGossip: !!(opts && opts.noGossip),
        stack: stackText(2), via: 'observe' });
    } catch (e) { t.instrumentErrors.push('observe-log: ' + String(e.message).slice(0, 80)); }
    return ret;
  });

  // ---- (4) gossip seeds ----
  wrap('seedGossip', function (action, dims, heardBy, noTrust) {
    mark('seedGossip');
    const stack = stackText(2);
    let beforeLen = null, ret;
    try { beforeLen = (((Game.state || {}).village || {}).gossip || []).length; } catch (e) {}
    try { ret = origs.seedGossip.call(Game, action, dims, heardBy, noTrust); } catch (e) { t.instrumentErrors.push('seedGossip-call: ' + String(e.message).slice(0, 80)); }
    try {
      const after = ((Game.state || {}).village || {}).gossip || [];
      t.seedGossip.push({ seq: ++seq, day: dayOf(Game), action: action || null, dims: clone(dims || {}),
        heardBy: (heardBy || []).slice(), noTrust: !!noTrust,
        deduped: (beforeLen !== null && after.length === beforeLen),
        stack: stack, via: 'seedGossip' });
    } catch (e) { t.instrumentErrors.push('seedGossip-log: ' + String(e.message).slice(0, 80)); }
    return ret;
  });

  // ---- (5) gossip spread: per-call, per-item heard/distortion diff ----
  wrap('spreadGossip', function () {
    mark('spreadGossip');
    let before = [], ret;
    try {
      before = (((Game.state || {}).village || {}).gossip || []).map(function (g) {
        return { action: g.action || null, heard: (g.heard || []).slice(), distortion: (g.distortion || 0), day: g.day || null, dims: clone(g.dims || {}) };
      });
    } catch (e) {}
    try { ret = origs.spreadGossip.apply(Game, arguments); } catch (e) { t.instrumentErrors.push('spreadGossip-call: ' + String(e.message).slice(0, 80)); }
    try {
      const after = ((Game.state || {}).village || {}).gossip || [];
      const hops = [];
      after.forEach(function (g, i) {
        const b = before[i] || { heard: [], distortion: 0, dims: {} };
        const newHeard = (g.heard || []).filter(function (id) { return b.heard.indexOf(id) === -1; });
        const dimChanged = JSON.stringify(g.dims || {}) !== JSON.stringify(b.dims || {});
        newHeard.forEach(function (listener) {
          hops.push({ gossip: g.action || null, listener: listener, distortionBefore: (b.distortion || 0),
            distortionAfter: (g.distortion || 0), mutated: dimChanged, day: dayOf(Game) });
        });
        if (!newHeard.length && (g.distortion || 0) !== (b.distortion || 0)) {
          hops.push({ gossip: g.action || null, listener: null, distortionBefore: (b.distortion || 0),
            distortionAfter: (g.distortion || 0), mutated: dimChanged, day: dayOf(Game), note: 'distortion-only' });
        }
      });
      const expired = before.filter(function (b) {
        return !after.some(function (g) { return g.action === b.action && g.day === b.day; });
      }).length;
      t.spreadGossip.push({ seq: ++seq, day: dayOf(Game), hops: hops, expired: expired,
        itemsBefore: before.length, itemsAfter: after.length, stack: stackText(2), via: 'spreadGossip' });
    } catch (e) { t.instrumentErrors.push('spreadGossip-log: ' + String(e.message).slice(0, 80)); }
    return ret;
  });

  // ---- (6) player rumors + (7) gossip dims ----
  wrap('spreadRumor', function (targetId, rumorType, firstHearerId) {
    mark('spreadRumor');
    let ret;
    try { ret = origs.spreadRumor.call(Game, targetId, rumorType, firstHearerId); } catch (e) { t.instrumentErrors.push('spreadRumor-call: ' + String(e.message).slice(0, 80)); }
    try {
      t.spreadRumor.push({ seq: ++seq, day: dayOf(Game), target: targetId || null, type: rumorType || null,
        firstHearer: firstHearerId || null, ok: !!ret, stack: stackText(2), via: 'spreadRumor' });
    } catch (e) { t.instrumentErrors.push('spreadRumor-log: ' + String(e.message).slice(0, 80)); }
    return ret;
  });

  wrap('gossipActionDims', function (action, dims) {
    mark('gossipActionDims');
    let ret = {};
    try { ret = origs.gossipActionDims.call(Game, action, dims); } catch (e) { t.instrumentErrors.push('gossipActionDims-call: ' + String(e.message).slice(0, 80)); }
    try {
      t.gossipDims.push({ seq: ++seq, day: dayOf(Game), action: action || null, dimsIn: clone(dims || {}),
        dimsOut: clone(ret || {}), stack: stackText(2), via: 'gossipActionDims' });
    } catch (e) { t.instrumentErrors.push('gossipActionDims-log: ' + String(e.message).slice(0, 80)); }
    return ret;
  });

  // ---- (8) conversations ----
  wrap('talkTo', function (vid) {
    mark('talkTo');
    let ret;
    try { ret = origs.talkTo.call(Game, vid); } catch (e) { t.instrumentErrors.push('talkTo-call: ' + String(e.message).slice(0, 80)); }
    try { t.talkOpens.push({ seq: ++seq, day: dayOf(Game), vid: vid || null, stack: stackText(2), via: 'talkTo' }); } catch (e) { t.instrumentErrors.push('talkTo-log: ' + String(e.message).slice(0, 80)); }
    return ret;
  });

  wrap('endConvo', function (vid, how) {
    mark('endConvo');
    const stack = stackText(2);
    let before = null, after = null, exchanges = null, substantive = null, ret;
    try {
      before = trustNow(Game, vid);
      const c = (typeof Game.convoGet === 'function') ? Game.convoGet(vid) : null;
      if (c) { exchanges = (c.count != null ? c.count : (c.exchanges != null ? c.exchanges : null)); substantive = !!c.substantive; }
    } catch (e) {}
    try { ret = origs.endConvo.call(Game, vid, how); } catch (e) { t.instrumentErrors.push('endConvo-call: ' + String(e.message).slice(0, 80)); }
    try { after = trustNow(Game, vid); } catch (e) {}
    try {
      t.endConvo.push({ seq: ++seq, day: dayOf(Game), vid: vid || null, how: how || null,
        exchangesBefore: exchanges, substantiveBefore: substantive,
        trustBefore: before, trustAfter: after,
        stipend: (typeof before === 'number' && typeof after === 'number') ? (after - before) : null,
        stack: stack, via: 'endConvo' });
    } catch (e) { t.instrumentErrors.push('endConvo-log: ' + String(e.message).slice(0, 80)); }
    return ret;
  });

  // ---- (9) moot / justice ----
  ['mootQuorum', 'mootFriendVoice', 'mootAccuserAftermath'].forEach(function (name) {
    wrap(name, function () {
      mark(name);
      let ret;
      try { ret = origs[name].apply(Game, arguments); } catch (e) { t.instrumentErrors.push(name + '-call: ' + String(e.message).slice(0, 80)); }
      try {
        t.moot.push({ seq: ++seq, day: dayOf(Game), fn: name,
          args: Array.prototype.slice.call(arguments).map(function (a) { return (a && typeof a === 'object') ? (a.id || a.kind || '[obj]') : a; }),
          ret: (ret && typeof ret === 'object') ? clone(ret) : ret,
          stack: stackText(2), via: name });
      } catch (e) { t.instrumentErrors.push(name + '-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    });
  });

  // ---- (9b) bond proposals / link raises (bond-initiation.js) ----
  // Villager-initiated bonds + link raises are the trust-read gates of
  // metric 8. Their trust effects ride the bumpTrust wrap (decline −1);
  // these wraps classify the proposal event itself.
  ['proposeBond', 'stageBondProposal', 'acceptBondProposal', 'declineBondProposal',
   'stageLinkRaise', 'acceptLinkRaise', 'declineLinkRaise', 'npcBondTick', 'npcLinkRaiseTick'].forEach(function (name) {
    wrap(name, function () {
      mark(name);
      const stack = stackText(2);
      const args = Array.prototype.slice.call(arguments);
      let trustBefore = {}, ret;
      try {
        args.forEach(function (a) { if (typeof a === 'string') trustBefore[a] = trustNow(Game, a); });
      } catch (e) {}
      try { ret = origs[name].apply(Game, args); } catch (e) { t.instrumentErrors.push(name + '-call: ' + String(e.message).slice(0, 80)); }
      try {
        t.bondEvents.push({ seq: ++seq, day: dayOf(Game), fn: name,
          args: args.map(function (a) { return (a && typeof a === 'object') ? (a.id || '[obj]') : a; }),
          trustBefore: trustBefore,
          ret: (ret && typeof ret === 'object') ? clone(ret) : ret,
          stack: stack, via: name });
      } catch (e) { t.instrumentErrors.push(name + '-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    });
  });

  // ---- (10) tendLink (link-trust verb; _trustGain rides the TG wrap) ----
  wrap('tendLink', function (linkId) {
    mark('tendLink');
    const stack = stackText(2);
    let ret;
    try { ret = origs.tendLink.call(Game, linkId); } catch (e) { t.instrumentErrors.push('tendLink-call: ' + String(e.message).slice(0, 80)); }
    try {
      t.tendLink.push({ seq: ++seq, day: dayOf(Game), linkId: linkId || null, paid: ret,
        stack: stack, via: 'tendLink' });
    } catch (e) { t.instrumentErrors.push('tendLink-log: ' + String(e.message).slice(0, 80)); }
    return ret;
  });

  // ---- (11) village-opinion verbs ----
  // NOTE: the engine method is joinVillageReal (betrayal.js:2450);
  // `joinVillage` is an app.js UI function, DOM-only and absent from
  // the node load — the proof caught the wrong name (2026-11-11).
  ['villageTalk', 'villageDeal', 'villageShareFood', 'joinVillageReal', 'probationTick'].forEach(function (name) {
    wrap(name, function () {
      mark(name);
      const stack = stackText(2);
      const args = Array.prototype.slice.call(arguments);
      let trustBefore = {}, ret;
      try {
        ((Game.state || {}).otherVillages || []).forEach(function (ov) { trustBefore[ov.id] = (ov.trust || 0); });
      } catch (e) {}
      try { ret = origs[name].apply(Game, args); } catch (e) { t.instrumentErrors.push(name + '-call: ' + String(e.message).slice(0, 80)); }
      try {
        const trustAfter = {};
        ((Game.state || {}).otherVillages || []).forEach(function (ov) { trustAfter[ov.id] = (ov.trust || 0); });
        const moved = {};
        Object.keys(trustAfter).forEach(function (id) { if (trustAfter[id] !== trustBefore[id]) moved[id] = trustAfter[id] - (trustBefore[id] || 0); });
        t.opinionVerbs.push({ seq: ++seq, day: dayOf(Game), fn: name,
          args: args.map(function (a) { return (a && typeof a === 'object') ? (a.id || '[obj]') : a; }),
          moved: moved, ret: (ret && typeof ret === 'object') ? '[obj]' : ret,
          stack: stack, via: name });
      } catch (e) { t.instrumentErrors.push(name + '-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    });
  });

  // ---- (12) river route (drama-stubbed under the harness) ----
  ['evRiverTrader', 'feedRiverTrader', 'tradeRiverTrader', 'snubRiverTrader'].forEach(function (name) {
    wrap(name, function () {
      mark(name);
      let ret;
      try { ret = origs[name].apply(Game, arguments); } catch (e) { t.instrumentErrors.push(name + '-call: ' + String(e.message).slice(0, 80)); }
      try {
        t.river.push({ seq: ++seq, day: dayOf(Game), fn: name,
          args: Array.prototype.slice.call(arguments).map(function (a) { return (a && typeof a === 'object') ? (a.id || a.goodId || '[obj]') : a; }),
          ret: (ret && typeof ret === 'object') ? '[obj]' : ret,
          stack: stackText(2), via: name });
      } catch (e) { t.instrumentErrors.push(name + '-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    });
  });

  // ---- (13) telemetry cross-check: 'trust' + 'bond_proposed' tele events ----
  try {
    if (typeof Game.tele === 'function') {
      origs.tele = Game.tele;
      Game.tele = function (type, data) {
        let ret;
        try { ret = origs.tele.call(Game, type, data); } catch (e) { t.instrumentErrors.push('tele-call: ' + String(e.message).slice(0, 80)); }
        try {
          if (type === 'trust') t.teleTrust.push({ seq: ++seq, day: dayOf(Game), data: clone(data || {}) });
          if (type === 'bond_proposed') t.teleBond.push({ seq: ++seq, day: dayOf(Game), data: clone(data || {}) });
          mark('tele');
        } catch (e) { t.instrumentErrors.push('tele-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    }
  } catch (e) { t.instrumentErrors.push('tele-wrap: ' + String(e.message).slice(0, 80)); }

  // Fit the trust-map setters now (install runs after setupGame, so the
  // map exists); re-fit at every snapshot for new villagers / map swaps.
  try { instrumentTrustMap(); } catch (e) { t.instrumentErrors.push('instrumentTrustMap-install: ' + String(e.message).slice(0, 80)); }

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
    try {
      const st = Game.state || {};
      snap.pending = { counter: !!st.pendingCounter, accord: !!st.pendingAccord, national: !!st.pendingNational, global: !!st.pendingGlobal };
    } catch (e) { snap.pending = null; }
    try {
      const v = Game.state.village || {};
      snap.roster = (v.roster || []).slice();
      snap.trust = clone(v.trust || {});
      snap.rep = {};
      Object.keys(v.rep || {}).forEach(function (vid) { snap.rep[vid] = clone(v.rep[vid]); });
      snap.trustBand = {};
      Object.keys(snap.trust).forEach(function (vid) {
        try { snap.trustBand[vid] = (typeof Game.trustBand === 'function') ? Game.trustBand(vid) : null; } catch (e) { snap.trustBand[vid] = null; }
      });
      snap.groups = clone(v.groups || []);
      snap.gossipAlive = (v.gossip || []).map(function (g) {
        return { action: g.action || null, heard: (g.heard || []).slice(), distortion: (g.distortion || 0), day: g.day || null, noTrust: !!g.noTrust };
      });
      snap.opinion = ((Game.state || {}).otherVillages || []).map(function (ov) {
        return { id: ov.id || null, name: ov.name || null, trust: (ov.trust || 0), population: (ov.population || 0) };
      });
      try {
        const j = (typeof Game.justiceState === 'function') ? Game.justiceState() : null;
        snap.justice = j ? { stage: (j.stage != null ? j.stage : null), mootDemanded: !!j.mootDemanded, heat: (typeof Game.justiceHeat === 'function' ? Game.justiceHeat() : null) } : null;
      } catch (e) { snap.justice = null; }
      try {
        snap.bonds = {
          proposals: Object.keys((v.bondProposals || {})).length,
          requests: Object.keys((v.bondRequests || {})).length,
          linkRaises: Object.keys((v.linkRaises || {})).length,
        };
      } catch (e) { snap.bonds = null; }
    } catch (e) { t.instrumentErrors.push('snapshot-village: ' + String(e.message).slice(0, 80)); }
    // Re-fit trust-map setters for new villagers / map swaps (no-op for
    // keys already fitted).
    try { instrumentTrustMap(); } catch (e) { t.instrumentErrors.push('snapshot-trustmap: ' + String(e.message).slice(0, 80)); }
    // Link-trust snapshot rides the reused trustgrowth instrument (its own
    // daily array + seq); keep a pointer here for the analyzer.
    try { if (tg) { tg.snapshot(); snap.tgSeq = tg.t.daily.length ? tg.t.daily[tg.t.daily.length - 1].seq : null; } } catch (e) { t.instrumentErrors.push('snapshot-tg: ' + String(e.message).slice(0, 80)); }
    t.daily.push(snap);
    return snap;
  }

  function uninstall() {
    try {
      Object.keys(origs).forEach(function (name) {
        if (name === 'tele') { try { Game.tele = origs.tele; } catch (e) {} return; }
        try { Game[name] = origs[name]; } catch (e) { t.instrumentErrors.push('uninstall-' + name + ': ' + String(e.message).slice(0, 80)); }
      });
    } catch (e) { t.instrumentErrors.push('uninstall: ' + String(e.message).slice(0, 80)); }
    try { if (tg) tg.uninstall(); } catch (e) { t.instrumentErrors.push('uninstall-tg: ' + String(e.message).slice(0, 80)); }
    // NOTE: the trustgrowth link-trust setters stay installed (same reason
    // as upstream: restoring the plain value would lose live trust).
  }

  return { t: t, tgT: tg ? tg.t : null, snapshot: snapshot, uninstall: uninstall };
}

module.exports = { install: install };
