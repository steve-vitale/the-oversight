// convfirst-instrument-20261111.js — conversations first-numbers recorder
// (arm sim-convfirst-a, run fleshout-20261111T0815Z). Scripts only,
// zero src/js. Records what the conversation system actually DOES in a
// lived village under DEFAULT competent play (COMPETENT_TALK unset).
//
// Two independent records, cross-checked by the analyzer:
//   (1) DAILY SNAPSHOTS: the talk-request roll (vid/line/day/flags/
//       delivered), pending link raises, pantry kcal, roster size /
//       alive count, trust of villagers talked to that day, cumulative
//       answered-question count, scholar rumor-queue subjects.
//   (2) METHOD WRAPS (call the original, return its value unchanged,
//       record only — never alter state, never consume RNG):
//       talkTo / convoTurn / endConvo (the whole conversation verb
//       set), stageLinkRaise / acceptLinkRaise / declineLinkRaise /
//       proposeLink (link raises offered inside conversation),
//       stageBondProposal / acceptBondProposal / declineBondProposal
//       (bond verbs — same class: the NPC path calls bond-initiation
//       closures directly, so the Game verbs are expected 0 under
//       competent; proven live in fixtures), npcBondTick /
//       npcLinkRaiseTick (tick call counts),
//       expireTalkRequests (request pruning, pre/post diff),
//       villagerInitiative (talk-request staging, FINGERPRINT
//       pre/post diff — v2: the v1 key-set diff missed stagings
//       that OVERWROTE a live request for the same villager, which
//       is how requests are superseded in this engine),
//       hawkerOffer / hawkerBuy, compareMaps, tele('bond_proposed')
//       via the secondlink-a lazy-wrap pattern (chain onto the live
//       harness tele at first daily).
//       playerDeath (SELF-TALK-REQUEST PURGE wrap — v2 post-pilot:
//       ledger.js playerDeath deletes the successor's own talk
//       request (journey-succession r133) with no event record, so
//       a request staged by the inheriting villager vanished
//       between snapshots as 'unknown'. The wrap diffs the
//       talk-request roll pre/post the death and records every
//       vanished entry as a purge event; the analyzer classifies
//       it fate 'purged'. wipe() only clears the save, never the
//       in-memory roll, so a village-lost death diffs empty —
//       honestly no purge, not a false one.)
//
// v2 (pilot round 1, RUN=convfirst-pilot, found 62 unclassified
// sources + 55 unknown fates — root-caused, not re-scored):
//   (a) overwrites invisible to a key-set diff (above);
//   (b) bond/link staging + decisions live in bond-initiation.js
//       closures, not the Game verbs — the authoritative record is
//       the tele('bond_proposed') events (staged/accepted/refused/
//       expired), already captured; the analyzer reconciles
//       requests against them;
//   (c) requests deleted by consumeBondRequest/consumeLinkRaise on
//       character decisions, and superseded by overwrites, are real
//       fates ('decided' / 'superseded'), not 'unknown'.
// The v1 corpus is retained as the invalid round; the v2 pilot
// (RUN=convfirst-pilot2) re-runs the same seeds/policies.
//
// Choice-kind taxonomy is the prereg's (docs/CONVERSATIONS.md +
// src/js/conversation.js convoTurn branches + menu builder):
// prefixed families ans:/gq:/ask:/follow:/skill_learn:/skill_teach:/
// bond:/link:/dlg:/nv:/react:/alive:/betrayal:/confront:/agency:/
// secret:/rumor: plus the exact ids leave/goon/deflect_q/more/recap/
// observe/offer_help/trade/trade_yes/trade_no/callout_quiet/
// callout_public/hawker/hawker_yes/hawker_no/teach/speak_back/
// invite_party/theorize/compare_maps/agree/joke/silence/subject.
// Anything else classifies 'other' and fails the GO bar.
//
// Caller attribution: the stack frames of every talkTo/convoTurn/
// endConvo call are classified talkRound / deepTalk /
// keepPromiseSocial / other (holdConversation is shared by deepTalk
// and keepPromiseSocial, so the OUTER frame decides).
//
// Usage: const INST = require('./convfirst-instrument-20261111');
//   const inst = INST.install(Game); inst.snapshot(); ...
//   inst.installTeleLazy(); // called from the policy daily wrapper
//   ... inst.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// classifyChoice: prereg taxonomy. Returns the kind string, or
// 'other' for anything outside it (GO-bar failure, recorded verbatim).
function classifyChoice(choiceId) {
  if (typeof choiceId !== 'string' || !choiceId) return 'other';
  const prefixes = [
    ['ans:', 'ans'], ['gq:', 'gq'], ['ask:', 'ask'], ['follow:', 'follow'],
    ['skill_learn:', 'skill_learn'], ['skill_teach:', 'skill_teach'],
    ['bond:', 'bond'], ['link:', 'link'], ['dlg:', 'dlg'], ['nv:', 'nv'],
    ['react:', 'react'], ['alive:', 'alive'], ['betrayal:', 'betrayal'],
    ['confront:', 'confront'], ['agency:', 'agency'], ['secret:', 'secret'],
    ['rumor:', 'rumor'],
  ];
  for (let i = 0; i < prefixes.length; i++) {
    if (choiceId.indexOf(prefixes[i][0]) === 0) return prefixes[i][1];
  }
  switch (choiceId) {
    case 'leave': return 'leave';
    case 'goon': return 'goon';
    case 'deflect_q': return 'deflect_q';
    case 'more': return 'more';
    case 'recap': return 'recap';
    case 'observe': return 'observe';
    case 'offer_help': return 'offer_help';
    case 'trade': return 'trade';
    case 'trade_yes': return 'trade_yes';
    case 'trade_no': return 'trade_no';
    case 'callout_quiet': return 'callout_quiet';
    case 'callout_public': return 'callout_public';
    case 'hawker': return 'hawker';
    case 'hawker_yes': return 'hawker_yes';
    case 'hawker_no': return 'hawker_no';
    case 'teach': return 'teach';
    case 'speak_back': return 'speak_back';
    case 'invite_party': return 'invite_party';
    case 'theorize': return 'theorize';
    case 'compare_maps': return 'compare_maps';
    case 'agree': return 'agree';
    case 'joke': return 'joke';
    case 'silence': return 'silence';
    case 'subject': return 'subject';
    default: return 'other';
  }
}

// stackClass: which policy path opened/took this conversation verb.
// holdConversation is shared, so the outer frame decides.
function stackClass() {
  let s = '';
  try { s = new Error().stack || ''; } catch (e) { return 'other'; }
  if (s.indexOf('keepPromiseSocial') !== -1) return 'keepPromiseSocial';
  if (s.indexOf('deepTalk') !== -1) return 'deepTalk';
  if (s.indexOf('talkRound') !== -1) return 'talkRound';
  if (s.indexOf('keepPromises') !== -1) return 'keepPromises';
  if (s.indexOf('holdConversation') !== -1) return 'holdConversation';
  return 'other';
}

// requestFingerprint: identifies one talk request by value, not
// by key. One vid holds at most one request, and stagers OVERWRITE
// it (villagerInitiative, invitations) without deleting the old one
// first — so a key-set diff is blind to supersession. The
// fingerprint (stage day + line + flags) changes on overwrite.
// diffTalkRequests(before, after): before/after are {vid: req}
// maps; returns {staged: [...], superseded: [...]} where staged
// entries carry {vid, day, line, bondProposal, linkRaise,
// superseded} (superseded = the overwritten request's fingerprint,
// or null) and superseded entries carry {vid, oldDay, oldLine,
// newDay, newLine}.
function requestFingerprint(req) {
  if (!req || typeof req !== 'object') return null;
  return String(req.day == null ? '?' : req.day) + '|' +
    String(req.line || '') + '|' +
    (req.bondProposal ? 'B' : '') + (req.linkRaise ? 'L' : '');
}
function diffTalkRequests(before, after) {
  const staged = [], superseded = [];
  before = before || {}; after = after || {};
  Object.keys(after).forEach(function (vid) {
    const a = after[vid] || {};
    const fpA = requestFingerprint(a);
    const fpB = Object.prototype.hasOwnProperty.call(before, vid) ? requestFingerprint(before[vid]) : null;
    if (fpB === null) {
      staged.push({ vid: vid, day: (a.day != null ? a.day : null), line: a.line ? String(a.line).slice(0, 200) : null, bondProposal: !!a.bondProposal, linkRaise: !!a.linkRaise, superseded: null });
    } else if (fpB !== fpA) {
      const b = before[vid] || {};
      staged.push({ vid: vid, day: (a.day != null ? a.day : null), line: a.line ? String(a.line).slice(0, 200) : null, bondProposal: !!a.bondProposal, linkRaise: !!a.linkRaise, superseded: { day: (b.day != null ? b.day : null), line: b.line ? String(b.line).slice(0, 200) : null } });
      superseded.push({ vid: vid, oldDay: (b.day != null ? b.day : null), oldLine: b.line ? String(b.line).slice(0, 200) : null, newDay: (a.day != null ? a.day : null), newLine: a.line ? String(a.line).slice(0, 200) : null });
    }
  });
  return { staged: staged, superseded: superseded };
}

function install(Game) {
  const t = {
    daily: [], bondEvents: [], stageCalls: [], acceptCalls: [],
    declineCalls: [], proposeCalls: [], linkTickCalls: 0,
    bondTickCalls: 0, stageBondCalls: [], acceptBondCalls: [],
    declineBondCalls: [],
    talkOpens: [], turnEvents: [], endEvents: [],
    expireEvents: [], initiativeEvents: [], supersedeEvents: [],
    purgeEvents: [], playerDeathCalls: 0,
    hawkerOffers: [], hawkerBuys: [], compareMapsCalls: [],
    instrumentErrors: [],
    talkToCalls: 0, convoTurnCalls: 0, endConvoCalls: 0,
    initiativeCalls: 0, expireCalls: 0,
  };
  let teleWrapped = false;
  let origTele = null;
  const wrapped = {}; // name -> original fn (for uninstall)
  const talkedToday = {}; // vid -> true (reset each snapshot)
  let lastReqFp = {}; // vid -> fingerprint (supersession watch across snapshots)

  function err(tag, e) {
    t.instrumentErrors.push(tag + ': ' + String((e && e.message) || e).slice(0, 80));
  }

  // Wrap a Game method: call the original first, record, return its
  // value unchanged. Any failure in the RECORDING path is logged,
  // never thrown into the game. opts.pre runs BEFORE the original
  // (for diff wraps) and its return is passed to opts.record.
  function wrapMethod(name, record, opts) {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { t.instrumentErrors.push(name + '-missing: not a function'); return; }
      wrapped[name] = orig;
      const selfGame = Game;
      Game[name] = function () {
        const args = Array.prototype.slice.call(arguments);
        let pre = null;
        try { if (opts && opts.pre) pre = opts.pre(args); } catch (e) { err(name + '-pre', e); }
        let r, threw = null;
        try { r = orig.apply(selfGame, args); } catch (e) { threw = e; }
        try { record(args, r, threw, pre); } catch (e) { err(name + '-record', e); }
        if (threw) throw threw;
        return r;
      };
    } catch (e) { err(name + '-wrap', e); }
  }

  function convoRead(vid) {
    // Post-open read of the convo record: thread, question state,
    // counts. Read-only; convoGet creates the record if missing,
    // which is fine here (talkTo just opened it).
    try {
      const c = (typeof Game.convoGet === 'function') ? Game.convoGet(vid) : null;
      if (!c) return null;
      return {
        thread: c.thread || null,
        pendingQ: c.pendingQ ? (c.pendingQ.kind || c.pendingQ.id || true) : null,
        genericQ: c.genericQ ? (c.genericQ.kind || true) : null,
        count: (c.count != null ? c.count : null),
        budget: (c.budget != null ? c.budget : null),
        exchanges: (c.exchanges != null ? c.exchanges : null),
        secretShared: !!c.secretShared,
        confessed: !!c.confessedThisSitting,
        substantive: !!c.substantive,
      };
    } catch (e) { err('convoRead', e); return null; }
  }

  function talkReqOf(vid) {
    try {
      const treq = (((Game.state || {}).village || {}).talkRequests || {})[vid];
      if (!treq) return null;
      return {
        day: (treq.day != null ? treq.day : null),
        delivered: !!treq.delivered,
        bondProposal: !!treq.bondProposal,
        linkRaise: !!treq.linkRaise,
      };
    } catch (e) { return null; }
  }

  function pendingRaiseOf(vid) {
    try { return (typeof Game.pendingLinkRaise === 'function') ? !!Game.pendingLinkRaise(vid) : null; } catch (e) { return null; }
  }

  function commLevelOf(vid) {
    try {
      const cl = (typeof Game.commLevel === 'function') ? Game.commLevel(vid) : null;
      return cl ? (cl.level || cl) : null;
    } catch (e) { return null; }
  }

  wrapMethod('talkTo', function (args, r, threw) {
    if (threw) return;
    t.talkToCalls++;
    const vid = args[0] || null;
    if (vid) talkedToday[vid] = true;
    const ev = {
      day: dayOf(Game), vid: vid, opened: r != null,
      line: (typeof r === 'string') ? String(r).slice(0, 300) : null,
      caller: stackClass(),
      convo: convoRead(vid),
      talkReq: talkReqOf(vid),
      talkReqLine: null,
      pendingRaise: pendingRaiseOf(vid),
      commLevel: commLevelOf(vid),
    };
    try {
      const treq = (((Game.state || {}).village || {}).talkRequests || {})[vid];
      if (treq && treq.line) ev.talkReqLine = String(treq.line).slice(0, 200);
    } catch (e) {}
    if (t.talkOpens.length < 500) t.talkOpens.push(ev);
    else t.talkOpens.push({ day: ev.day, vid: ev.vid, opened: ev.opened, caller: ev.caller, _overflow: true });
  });

  wrapMethod('convoTurn', function (args, r, threw) {
    if (threw) return;
    t.convoTurnCalls++;
    const vid = args[0] || null;
    const choiceId = args[1] || null;
    const kind = classifyChoice(choiceId);
    const ev = {
      day: dayOf(Game), vid: vid, choiceId: (typeof choiceId === 'string' ? choiceId.slice(0, 80) : choiceId),
      kind: kind, caller: stackClass(),
      thread: null, result: null,
    };
    try {
      const c = (typeof Game.convoGet === 'function') ? Game.convoGet(vid) : null;
      if (c) ev.thread = c.thread || null;
    } catch (e) {}
    try {
      if (r && typeof r === 'object') {
        ev.result = {
          kind: r.kind || null, ignored: !!r.ignored, navigation: !!r.navigation,
          over: !!r.over,
        };
      } else if (r == null) ev.result = { kind: null, nullReturn: true };
    } catch (e) {}
    if (t.turnEvents.length < 1000) t.turnEvents.push(ev);
    else t.turnEvents.push({ day: ev.day, vid: ev.vid, choiceId: ev.choiceId, kind: ev.kind, caller: ev.caller, _overflow: true });
  });

  wrapMethod('endConvo', function (args, r, threw) {
    if (threw) return;
    t.endConvoCalls++;
    const vid = args[0] || null;
    const ev = {
      day: dayOf(Game), vid: vid, how: args[1] || null, caller: stackClass(),
      convo: convoRead(vid),
    };
    if (t.endEvents.length < 500) t.endEvents.push(ev);
    else t.endEvents.push({ day: ev.day, vid: ev.vid, how: ev.how, caller: ev.caller, _overflow: true });
  });

  wrapMethod('stageLinkRaise', function (args, r) {
    t.stageCalls.push({
      day: dayOf(Game), vid: args[0] || null, villageId: args[1] || null,
      staged: !!(r && r.villageId),
    });
  });
  wrapMethod('acceptLinkRaise', function (args, r) {
    t.acceptCalls.push({ day: dayOf(Game), vid: args[0] || null, ok: !!(r && r.ok), villageId: (r && r.villageId) || null });
  });
  wrapMethod('declineLinkRaise', function (args, r) {
    t.declineCalls.push({ day: dayOf(Game), vid: args[0] || null, ok: !!(r && r.ok) });
  });
  wrapMethod('proposeLink', function (args, r) {
    let cls = 'declined-null';
    if (r === 'counter') cls = 'counter';
    else if (r && typeof r === 'object') cls = 'formed';
    t.proposeCalls.push({ day: dayOf(Game), villageId: args[0] || null, outcome: cls });
  });
  wrapMethod('npcLinkRaiseTick', function () { t.linkTickCalls++; });
  wrapMethod('npcBondTick', function () { t.bondTickCalls++; });
  wrapMethod('stageBondProposal', function (args, r) {
    t.stageBondCalls.push({ day: dayOf(Game), vid: args[0] || null, staged: !!(r && r.vid) });
  });
  wrapMethod('acceptBondProposal', function (args, r) {
    t.acceptBondCalls.push({ day: dayOf(Game), vid: args[0] || null, ok: !!(r && r.ok) });
  });
  wrapMethod('declineBondProposal', function (args, r) {
    t.declineBondCalls.push({ day: dayOf(Game), vid: args[0] || null, ok: !!(r && r.ok) });
  });

  wrapMethod('hawkerOffer', function (args, r) {
    const ev = { day: dayOf(Game), vid: args[0] || null, offered: !!r };
    try {
      if (r && typeof r === 'object') {
        ev.ware = r.name || r.id || null;
        ev.kind = r.kind || null;
        ev.price = (r.price != null ? r.price : null);
      }
    } catch (e) {}
    t.hawkerOffers.push(ev);
  });
  wrapMethod('hawkerBuy', function (args, r) {
    t.hawkerBuys.push({ day: dayOf(Game), vid: args[0] || null, ok: !!r, result: (r && typeof r === 'object' ? (r.ok != null ? !!r.ok : true) : !!r) });
  });
  wrapMethod('compareMaps', function (args, r) {
    const ev = { day: dayOf(Game), vid: args[0] || null };
    try { if (r && typeof r === 'object') ev.newCount = (r.newCount != null ? r.newCount : null); } catch (e) {}
    t.compareMapsCalls.push(ev);
  });

  // expireTalkRequests: pre/post diff on the talk-request keys.
  wrapMethod('expireTalkRequests', function (args, r, threw, pre) {
    if (threw) return;
    t.expireCalls++;
    try {
      const after = (((Game.state || {}).village || {}).talkRequests || {});
      (pre || []).forEach(function (k) {
        if (!after[k.vid]) {
          t.expireEvents.push({ day: dayOf(Game), vid: k.vid, age: k.age, delivered: !!k.delivered, bondProposal: !!k.bondProposal, linkRaise: !!k.linkRaise });
        }
      });
    } catch (e) { err('expireTalkRequests-record', e); }
  }, {
    pre: function () {
      try {
        const reqs = (((Game.state || {}).village || {}).talkRequests || {});
        const day = dayOf(Game);
        return Object.keys(reqs).map(function (vid) {
          const q = reqs[vid] || {};
          return { vid: vid, age: day - ((q.day == null ? day : q.day)), delivered: !!q.delivered, bondProposal: !!q.bondProposal, linkRaise: !!q.linkRaise };
        });
      } catch (e) { return []; }
    },
  });

  // villagerInitiative: FINGERPRINT pre/post diff — a new request
  // for a vid whose live request it OVERWRITES is a staging (of the
  // new fingerprint) plus a supersession (of the old one). A key-set
  // diff is blind to this (v1 bug: 62 unclassified sources).
  wrapMethod('villagerInitiative', function (args, r, threw, pre) {
    if (threw) return;
    t.initiativeCalls++;
    try {
      const after = (((Game.state || {}).village || {}).talkRequests || {});
      const diff = diffTalkRequests(pre || {}, after);
      diff.staged.forEach(function (s) {
        t.initiativeEvents.push({
          day: dayOf(Game), vid: s.vid, line: s.line,
          bondProposal: !!s.bondProposal, linkRaise: !!s.linkRaise,
          superseded: s.superseded || null,
        });
      });
      diff.superseded.forEach(function (s) {
        t.supersedeEvents.push({ day: dayOf(Game), vid: s.vid, oldDay: s.oldDay, oldLine: s.oldLine, newDay: s.newDay, newLine: s.newLine, by: 'villagerInitiative' });
      });
    } catch (e) { err('villagerInitiative-record', e); }
  }, {
    pre: function () {
      try {
        const reqs = (((Game.state || {}).village || {}).talkRequests || {});
        const out = {};
        Object.keys(reqs).forEach(function (vid) { out[vid] = reqs[vid] || {}; });
        return out;
      } catch (e) { return {}; }
    },
  });

  // playerDeath: SELF-TALK-REQUEST PURGE wrap. ledger.js
  // playerDeath deletes the successor's own talk request
  // (v.talkRequests[newId], journey-succession r133) with no
  // event record — a staged request vanishes between snapshots
  // and the analyzer would call it 'unknown' (a GO failure).
  // Pre/post diff on the roll: every entry present before the
  // death and gone after is a purge event (vid, stage day, line,
  // flags, successor, kind). Recorded even if the original
  // throws — the diff is a fact about state either way (the
  // purge sits mid-function, so a throw after it is still a
  // real purge; a throw before it diffs empty). kind:
  // 'successor-self' (the new bearer's own request — the r133
  // case), 'dead-bearer' (the dead scholar's own request, if the
  // engine ever purges it), 'other' (anything else that left
  // the roll during the death). A village-lost death (no
  // successor) diffs empty: wipe() clears only the save.
  wrapMethod('playerDeath', function (args, r, threw, pre) {
    t.playerDeathCalls++;
    try {
      const after = (((Game.state || {}).village || {}).talkRequests || {});
      const successor = (function () { try { return Game.villagerId || null; } catch (e) { return null; } })();
      const oldBearer = (pre && pre.oldBearer) || null;
      const before = (pre && pre.reqs) || {};
      Object.keys(before).forEach(function (vid) {
        if (!Object.prototype.hasOwnProperty.call(after, vid)) {
          const b = before[vid] || {};
          t.purgeEvents.push({
            day: dayOf(Game), vid: vid,
            oldDay: (b.day != null ? b.day : null),
            oldLine: b.line ? String(b.line).slice(0, 200) : null,
            delivered: !!b.delivered,
            bondProposal: !!b.bondProposal, linkRaise: !!b.linkRaise,
            successor: successor,
            kind: (successor && vid === successor) ? 'successor-self'
              : (oldBearer && vid === oldBearer) ? 'dead-bearer' : 'other',
            cause: (args && args[0]) || null,
          });
        }
      });
    } catch (e) { err('playerDeath-record', e); }
  }, {
    pre: function () {
      try {
        const reqs = (((Game.state || {}).village || {}).talkRequests || {});
        const out = {};
        Object.keys(reqs).forEach(function (vid) { out[vid] = reqs[vid] || {}; });
        return { reqs: out, oldBearer: Game.villagerId || null };
      } catch (e) { return { reqs: {}, oldBearer: null }; }
    },
  });

  // Lazy tele capture: chain onto whatever Game.tele is NOW (the
  // harness wrapper, installed by runDays before the first daily).
  function installTeleLazy() {
    if (teleWrapped) return;
    try {
      const cur = Game.tele;
      if (typeof cur !== 'function') { t.instrumentErrors.push('tele-missing: Game.tele is not a function at first daily'); teleWrapped = true; return; }
      origTele = cur;
      const selfGame = Game;
      Game.tele = function (type, data) {
        let r;
        try { r = origTele.apply(selfGame, arguments); } catch (e) { throw e; }
        try {
          if (type === 'bond_proposed' && data && typeof data === 'object') {
            t.bondEvents.push({
              day: dayOf(selfGame),
              initiator: data.initiator || null, target: data.target || null,
              kind: data.kind || null, outcome: data.outcome || null,
              chance: (data.chance != null ? data.chance : null),
              reason: data.reason ? String(data.reason).slice(0, 200) : null,
            });
          }
        } catch (e) { err('tele-record', e); }
        return r;
      };
      teleWrapped = true;
    } catch (e) { err('tele-wrap', e); teleWrapped = true; }
  }

  function snapshot() {
    const snap = { day: dayOf(Game) };
    try { snap.scholarId = Game.villagerId || null; } catch (e) { snap.scholarId = null; }
    try { snap.standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) { snap.standing = null; }
    try { snap.scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { snap.scaleRank = null; }
    try {
      const v = (Game.state || {}).village || {};
      snap.pantryKcal = (v.pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0);
    } catch (e) { snap.pantryKcal = null; err('snap-pantry', e); }
    try {
      const v = (Game.state || {}).village || {};
      const roster = v.roster || [];
      snap.rosterSize = roster.length;
      let alive = 0;
      roster.forEach(function (vid) {
        try {
          const p = (typeof Game.getPerson === 'function') ? Game.getPerson(vid) : null;
          if (p && !p.dead) alive++;
        } catch (e) { alive++; }
      });
      snap.rosterAlive = alive;
    } catch (e) { snap.rosterSize = null; snap.rosterAlive = null; err('snap-roster', e); }
    try {
      const reqs = (((Game.state || {}).village || {}).talkRequests || {});
      snap.talkRequests = Object.keys(reqs).map(function (vid) {
        const q = reqs[vid] || {};
        return {
          vid: vid, day: (q.day != null ? q.day : null), delivered: !!q.delivered,
          bondProposal: !!q.bondProposal, linkRaise: !!q.linkRaise,
          line: q.line ? String(q.line).slice(0, 200) : null,
        };
      });
      // Supersession watch: a fingerprint change for a vid whose old
      // request was undelivered means the old request was overwritten
      // (by an invitation or another stager — villagerInitiative
      // overwrites are already caught by its wrap; this catches the
      // rest). Delivered records changing fingerprint are re-stagings
      // after an answer, not supersessions.
      try {
        const cur = {};
        snap.talkRequests.forEach(function (q) { cur[q.vid] = requestFingerprint(q); });
        Object.keys(cur).forEach(function (vid) {
          if (Object.prototype.hasOwnProperty.call(lastReqFp, vid) && lastReqFp[vid] !== cur[vid]) {
            const prev = (t.daily.length ? (t.daily[t.daily.length - 1].talkRequests || []) : []).filter(function (q) { return q.vid === vid; })[0] || null;
            if (prev && !prev.delivered) {
              t.supersedeEvents.push({ day: dayOf(Game), vid: vid, oldDay: prev.day, oldLine: prev.line, newDay: (snap.talkRequests.filter(function (q) { return q.vid === vid; })[0] || {}).day, newLine: (snap.talkRequests.filter(function (q) { return q.vid === vid; })[0] || {}).line, by: 'snapshot' });
            }
          }
        });
        lastReqFp = cur;
      } catch (e) { err('snap-supersede', e); }
    } catch (e) { snap.talkRequests = null; err('snap-talkRequests', e); }
    try {
      const lr = (((Game.state || {}).village || {}).linkRaises || {});
      snap.pendingRaises = Object.keys(lr).map(function (vid) {
        const p = lr[vid] || {};
        return { vid: vid, villageId: p.villageId || null, day: (p.day != null ? p.day : null) };
      });
    } catch (e) { snap.pendingRaises = null; err('snap-pendingRaises', e); }
    try {
      const v = (Game.state || {}).village || {};
      const trust = v.trust || {};
      snap.talkedTrust = {};
      Object.keys(talkedToday).forEach(function (vid) {
        snap.talkedTrust[vid] = (trust[vid] != null ? trust[vid] : null);
      });
    } catch (e) { snap.talkedTrust = null; err('snap-trust', e); }
    try {
      const conv = (((Game.state || {}).village || {}).conv || {});
      let answered = 0, sittings = 0;
      Object.keys(conv).forEach(function (vid) {
        const c = conv[vid] || {};
        answered += Object.keys(c.answered || {}).length;
        sittings += (c.count || 0);
      });
      snap.answeredTotal = answered;
      snap.sittingsTotal = sittings;
    } catch (e) { snap.answeredTotal = null; snap.sittingsTotal = null; err('snap-answered', e); }
    try {
      const rumors = ((Game.state || {}).scholar || {}).rumors || [];
      snap.rumors = rumors.map(function (rm) {
        return {
          subject: rm.subject || rm.about || rm.topic || null,
          delivered: !!rm.delivered,
          day: (rm.day != null ? rm.day : null),
        };
      });
    } catch (e) { snap.rumors = null; err('snap-rumors', e); }
    // Reset the talked-today set after the snapshot reads it.
    Object.keys(talkedToday).forEach(function (k) { delete talkedToday[k]; });
    t.daily.push(snap);
    return snap;
  }

  function uninstall() {
    try { if (teleWrapped && origTele) Game.tele = origTele; } catch (e) { err('uninstall-tele', e); }
    Object.keys(wrapped).forEach(function (name) {
      try { Game[name] = wrapped[name]; } catch (e) { err('uninstall-' + name, e); }
    });
  }

  return { t: t, snapshot: snapshot, installTeleLazy: installTeleLazy, uninstall: uninstall, classifyChoice: classifyChoice, stackClass: stackClass };
}

module.exports = { install: install, classifyChoice: classifyChoice, stackClass: stackClass, requestFingerprint: requestFingerprint, diffTalkRequests: diffTalkRequests };
