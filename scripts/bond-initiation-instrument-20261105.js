// bond-initiation-instrument-20261105.js — bond-initiation build instrument
// (Steve ruling 2026-11-04 22:32: villagers initiate bonds).
// Wraps (call-through, RNG-neutral; every catch reports into
// t.instrumentErrors, never silently):
//   - proposeBond (the new verb; ABSENT on baseline — the wrap is
//     defensive: no wrap, no error, proposals read 0, which IS the
//     baseline), npcInviteDecision (kind 'bond' decisions),
//     acceptBondProposal / declineBondProposal (pending scholar
//     proposals), proposeLink (link-raise conversions — the player
//     proposing after an NPC raised the idea), talkTo / endConvo
//     (conversation context: competent opens and walks out).
//   - tele('bond_proposed', ...) events captured directly.
// Snapshot (daily): bond records with the `proposed` marker
// (initiated bonds) vs accumulation-formed bonds, staged pendings
// (bondRequests, linkRaises), roster/living counts. The snapshot
// NEVER calls villageStandingTotal() or unlockedWave().
// Usage: const INST = require('./bond-initiation-instrument-20261105');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function shallow(x, keys) {
  const o = {};
  try {
    for (const k of keys) {
      const v = x ? x[k] : undefined;
      if (v == null) o[k] = null;
      else if (typeof v === 'object') o[k] = '[obj]';
      else o[k] = v;
    }
  } catch (e) {}
  return o;
}
// Proposal narration lines (the verb's own words, written in the module).
// Tight on purpose: bare "bond" matches keepsake-bond noise, so match
// the proposal phrases only (stick together / stick with me / bonded /
// proposes a bond / watch each other's backs).
const SAY_RE = /stick together|stick with me|watch each other'?s backs|propos\w+ a bond|bonded/i;

function install(Game) {
  const t = {
    daily: [], proposalEvents: [], decisionEvents: [], bondTeleEvents: [],
    linkEvents: [], convoEvents: [], sayLines: [],
    instrumentErrors: [], wrapCounts: {},
  };
  const orig = {};
  function count(n) { t.wrapCounts[n] = (t.wrapCounts[n] || 0) + 1; }
  function err(where, e) { try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e).slice(0, 100)); } catch (e2) {} }

  function describeRet(r) {
    try {
      if (r == null) return null;
      if (typeof r === 'string' || typeof r === 'number' || typeof r === 'boolean') return r;
      if (Array.isArray(r)) return '[array:' + r.length + ']';
      return shallow(r, ['ok', 'accepted', 'outcome', 'kind', 'reason', 'chance', 'gate', 'perceived', 'proposer', 'target']);
    } catch (e) { return '[unreadable]'; }
  }

  // proposeBond: the verb under test. Defensive: absent on baseline.
  if (typeof Game.proposeBond === 'function') {
    orig.proposeBond = Game.proposeBond;
    Game.proposeBond = function (initiator, target, opts) {
      count('proposeBond');
      let r;
      try { r = orig.proposeBond.apply(this, arguments); } catch (e) { throw e; }
      try {
        t.proposalEvents.push({ day: dayOf(Game), fn: 'proposeBond',
          initiator: initiator, target: target,
          kind: (opts && opts.kind) || 'person', ret: describeRet(r) });
      } catch (e) { err('proposeBond-row', e); }
      return r;
    };
  }
  // npcInviteDecision: the shared character decision (kind 'bond' rows).
  if (typeof Game.npcInviteDecision === 'function') {
    orig.npcInviteDecision = Game.npcInviteDecision;
    Game.npcInviteDecision = function (invitee, inviter, opts) {
      count('npcInviteDecision');
      let r;
      try { r = orig.npcInviteDecision.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (opts && opts.kind === 'bond') {
          t.decisionEvents.push({ day: dayOf(Game), fn: 'npcInviteDecision',
            invitee: invitee, inviter: inviter, kind: 'bond',
            chance: (r && r.chance) != null ? r.chance : null,
            accept: !!(r && r.accept), veto: (r && r.veto) || null,
            reasons: (r && r.reasons) || null });
        }
      } catch (e) { err('npcInviteDecision-row', e); }
      return r;
    };
  }
  // Pending scholar-proposal resolvers (absent on baseline).
  ['acceptBondProposal', 'declineBondProposal', 'acceptLinkRaise', 'declineLinkRaise'].forEach(function (fnName) {
    if (typeof Game[fnName] !== 'function') return;
    orig[fnName] = Game[fnName];
    Game[fnName] = function () {
      count(fnName);
      let r;
      try { r = orig[fnName].apply(this, arguments); } catch (e) { throw e; }
      try {
        t.proposalEvents.push({ day: dayOf(Game), fn: fnName,
          target: (arguments.length ? arguments[0] : null), ret: describeRet(r) });
      } catch (e) { err(fnName + '-row', e); }
      return r;
    };
  });
  // proposeLink: link-raise conversions (an NPC raised it, the player proposes).
  if (typeof Game.proposeLink === 'function') {
    orig.proposeLink = Game.proposeLink;
    Game.proposeLink = function (targetId, opts) {
      count('proposeLink');
      let r;
      try { r = orig.proposeLink.apply(this, arguments); } catch (e) { throw e; }
      try { t.linkEvents.push({ day: dayOf(Game), fn: 'proposeLink', target: targetId, ret: describeRet(r) }); } catch (e) { err('proposeLink-row', e); }
      return r;
    };
  }
  // Conversation context (competent opens and walks out — the policy side).
  ['talkTo', 'endConvo'].forEach(function (fnName) {
    if (typeof Game[fnName] !== 'function') return;
    orig[fnName] = Game[fnName];
    Game[fnName] = function () {
      count(fnName);
      let r;
      try { r = orig[fnName].apply(this, arguments); } catch (e) { throw e; }
      try { t.convoEvents.push({ day: dayOf(Game), fn: fnName, target: (arguments.length ? arguments[0] : null) }); } catch (e) { err(fnName + '-row', e); }
      return r;
    };
  });
  // tele: bond_proposed is the primary signal.
  if (typeof Game.tele === 'function') {
    orig.tele = Game.tele;
    Game.tele = function (type, data) {
      let r;
      try { r = orig.tele.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (type === 'bond_proposed' && data && typeof data === 'object') {
          // Scholar at EVENT time (succession changes the scholar: the
          // final scholarId would misattribute earlier asks).
          let sid = null;
          try { sid = Game.villagerId || null; } catch (e) {}
          t.bondTeleEvents.push({ day: dayOf(Game), scholarId: sid,
            initiator: data.initiator || null,
            target: data.target || null, kind: data.kind || 'person',
            outcome: data.outcome || null, chance: (data.chance == null ? null : data.chance),
            reason: data.reason || null });
        }
      } catch (e) { err('tele', e); }
      return r;
    };
  } else { err('install.tele', new Error('not a function')); }

  function wrapSay(fnName) {
    if (typeof Game[fnName] !== 'function') return;
    orig[fnName] = Game[fnName];
    Game[fnName] = function () {
      const arg = arguments.length ? arguments[0] : null;
      try {
        if (typeof arg === 'string' && SAY_RE.test(arg) && t.sayLines.length < 200) {
          t.sayLines.push({ day: dayOf(Game), via: fnName, line: String(arg).slice(0, 600) });
        }
      } catch (e) { err(fnName + '-wrap', e); }
      return orig[fnName].apply(this, arguments);
    };
  }
  wrapSay('say');
  wrapSay('sysSay');

  function isLiving(Game, vid, scholarId) {
    if (vid === scholarId) return true;
    try {
      const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null;
      return !!(vp && !vp.dead);
    } catch (e) { return false; }
  }

  function snapshot() {
    const snap = { day: dayOf(Game) };
    try { snap.scholarId = Game.villagerId || null; } catch (e) { snap.scholarId = null; }
    try {
      const v = ((Game.state || {}).village || {});
      const bonds = v.bonds || {};
      let total = 0, initiated = 0;
      const initiatedList = [];
      for (const k in bonds) {
        const b = bonds[k];
        if (!b) continue;
        total++;
        if (b.proposed) {
          initiated++;
          if (initiatedList.length < 40) initiatedList.push({ key: k, v: b.v || 0, depth: b.depth || 0, proposer: b.proposer || null, day: b.proposedDay || null });
        }
      }
      snap.bondsTotal = total;
      snap.bondsInitiated = initiated;
      snap.bondsInitiatedList = initiatedList;
      snap.bondsAccumulated = total - initiated;
      const bp = v.bondProposals || {};
      snap.bondProposalPairs = Object.keys(bp).length;
      const br = v.bondRequests || {};
      snap.bondRequestsStaged = Object.keys(br).length;
      const lr = v.linkRaises || {};
      snap.linkRaisesStaged = Object.keys(lr).length;
    } catch (e) { snap.bondsTotal = null; err('bonds', e); }
    try {
      const roster = (((Game.state || {}).village || {}).roster || []);
      snap.roster = roster.slice();
      snap.livingCount = roster.filter(function (vid) { return isLiving(Game, vid, snap.scholarId); }).length;
    } catch (e) { snap.roster = []; snap.livingCount = null; err('livingCount', e); }
    t.daily.push(snap);
    return snap;
  }

  function uninstall() { Object.keys(orig).forEach(function (n) { try { Game[n] = orig[n]; } catch (e) {} }); }
  return { t: t, snapshot: snapshot, uninstall: uninstall };
}

module.exports = { install: install, dayOf: dayOf, SAY_RE: SAY_RE };
