// diplo-instrument-20261110.js — diplomacy / village-link + ally-join recorder
// (arm sim-diplo-a, run fleshout-20261110T1815Z). Scripts only, zero src/js.
// Thin extension on top of scripts/secondlink-instrument-20261110.js (reused
// unchanged): the secondlink instrument already records daily snapshots,
// link-raise wraps, and tele('bond_proposed') capture (kind 'link' AND 'bond').
// This file adds ONLY what the diplo arm needs:
//
//   (1) FORMATION PROVENANCE: wraps _formLink and _formPeerLink (the two
//       birthplaces). Every link formed is classified by caller path from
//       the call stack: propose / counter / raid / ladder / peer-propose /
//       peer-counter. 'other' is a failure, not a class — a formation whose
//       stack names none of the six known callers is reported as
//       unclassified and fails the prereg GO bar.
//   (2) DIPLOMACY VERB CALLS: wraps proposeCovenant, proposeTrade,
//       raidVillage, answerCounter, answerAccord, answerNationalChoice,
//       answerGlobalChoice, bidForPrimacy, tendLink — call counts + outcome
//       class where the return carries one. (answerRaid is NOT wrapped:
//       competent never calls raidVillage, so no pending raid can exist in
//       this pilot; a raid outcome is still captured via the _formLink
//       stack when answerRaid forms a link. Named here so the gap is
//       explicit, not hidden.)
//   (3) DAILY DIPLO SNAPSHOT: foreignPolities() (count, max size, any >=4),
//       nationalLive / globalLive / networkLive flags, pendingNational /
//       pendingGlobal shape, pendingCounter kind, link-kind roll counts
//       (primary-subordinate vs covenant vs trade, seasoned counts).
//       The link roll itself is read from the secondlink snapshot, not
//       re-read — this snapshot carries only the diplo aggregates.
//
// All wraps are record-only: call the original, return its value unchanged,
// never alter state, never consume RNG. Any failure in the RECORDING path
// is logged to instrumentErrors, never thrown into the game.
//
// KNOWN WRAP RISK (secondlink-a lesson): a wrap records nothing if the
// engine calls the closure instead of the Game method (stageLinkRaise was
// dead that way). The proof (scripts/test-diplo-a.js) verifies EACH wrapped
// method's call path is live on a fixture or live miniature; a wrap with
// no live call observed is marked dead in the evidence and its zero is
// never treated as evidence. _formLink/_formPeerLink are the backstop for
// formation provenance: if the propose/counter/raid wraps are dead,
// formation is still classified from the birthplace stack.
//
// Usage: const DI = require('./diplo-instrument-20261110');
//   const di = DI.install(Game); di.snapshot(); ... di.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function stackText(skip) {
  try { return (new Error().stack || '').split('\n').slice(skip || 0).join(' | '); } catch (e) { return ''; }
}

// Formation-path classification from the call stack. The six paths are
// mutually exclusive in the engine (each formation goes through exactly
// one caller), so inclusion order is a priority order, not a guess:
// ladder first (it is the only path that never passes through a propose
// verb), then raid, then counter, then peer-propose, then propose.
function classifyFormPath(stack) {
  if (!stack) return 'other';
  if (stack.indexOf('_ladderRewardLink') !== -1) return 'ladder';
  if (stack.indexOf('answerRaid') !== -1) return 'raid';
  if (stack.indexOf('answerCounter') !== -1) return 'counter';
  if (stack.indexOf('_proposePeer') !== -1) return 'peer-propose';
  if (stack.indexOf('proposeLink') !== -1) return 'propose';
  return 'other';
}

function classifyPeerFormPath(stack) {
  if (!stack) return 'other';
  if (stack.indexOf('answerCounter') !== -1) return 'peer-counter';
  if (stack.indexOf('_proposePeer') !== -1) return 'peer-propose';
  return 'other';
}

// Outcome class from a verb's return value. Kept deliberately coarse:
// object (a link) = formed; 'counter' = counter staged; true = the verb
// did its thing; null = refused / no-op; anything else recorded verbatim
// (short) so a new return shape shows up instead of being forced.
function classifyReturn(r) {
  if (r && typeof r === 'object') return 'formed';
  if (r === 'counter') return 'counter';
  if (r === true) return 'true';
  if (r === false) return 'false';
  if (r === null || r === undefined) return 'null';
  if (typeof r === 'number') return 'number';
  if (typeof r === 'string') return 'str:' + String(r).slice(0, 40);
  return typeof r;
}

function install(Game) {
  const t = {
    formLinkCalls: [], formPeerLinkCalls: [],
    verbCalls: [], // {day, verb, outcome, target}
    diploDaily: [],
    instrumentErrors: [],
    wrapLive: {}, // name -> true once a wrapped call is observed live
  };
  const wrapped = {};

  function wrapMethod(name, record) {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { t.instrumentErrors.push(name + '-missing: not a function'); return; }
      wrapped[name] = orig;
      const selfGame = Game;
      Game[name] = function () {
        let r, threw = null;
        try { r = orig.apply(selfGame, arguments); } catch (e) { threw = e; }
        try {
          t.wrapLive[name] = true;
          record(Array.prototype.slice.call(arguments), r, threw);
        } catch (e) { t.instrumentErrors.push(name + '-record: ' + String(e.message).slice(0, 80)); }
        if (threw) throw threw;
        return r;
      };
    } catch (e) { t.instrumentErrors.push(name + '-wrap: ' + String(e.message).slice(0, 80)); }
  }

  // (1) Formation provenance — the two birthplaces.
  wrapMethod('_formLink', function (args, r) {
    const stack = stackText(3);
    const path = classifyFormPath(stack);
    if (path === 'other') t.instrumentErrors.push('_formLink-other-path: stack=' + stack.slice(0, 300));
    t.formLinkCalls.push({
      day: dayOf(Game), targetId: args[0] || null, path: path,
      asSubordinate: !!(args[1] && args[1].asSubordinate),
      tribute: (args[1] && args[1].tributeKcalPerWeek) || null,
      linkId: (r && r.id) || null,
      stack: stack.slice(0, 400),
    });
  });
  wrapMethod('_formPeerLink', function (args, r) {
    const stack = stackText(3);
    const path = classifyPeerFormPath(stack);
    if (path === 'other') t.instrumentErrors.push('_formPeerLink-other-path: stack=' + stack.slice(0, 300));
    t.formPeerLinkCalls.push({
      day: dayOf(Game), targetId: args[0] || null, path: path,
      kind: (args[1] && args[1].kind) || null,
      linkId: (r && r.id) || null,
      stack: stack.slice(0, 400),
    });
  });

  // (2) Diplomacy verb calls.
  [
    'proposeCovenant', 'proposeTrade', 'raidVillage', 'answerCounter',
    'answerAccord', 'answerNationalChoice', 'answerGlobalChoice',
    'bidForPrimacy', 'tendLink',
  ].forEach(function (verb) {
    wrapMethod(verb, function (args, r) {
      t.verbCalls.push({
        day: dayOf(Game), verb: verb,
        target: (verb.indexOf('answer') === 0 ? null : (args[0] != null ? String(args[0]).slice(0, 60) : null)),
        how: (verb.indexOf('answer') === 0 && args[0] != null ? String(args[0]).slice(0, 40) : null),
        outcome: classifyReturn(r),
        retNumber: (typeof r === 'number' ? r : null),
      });
    });
  });

  // (3) Daily diplo snapshot (aggregates only; the link roll lives in the
  // secondlink snapshot).
  function snapshot() {
    const snap = { day: dayOf(Game) };
    try {
      const st = Game.state || {};
      snap.flags = {
        networkLive: !!st.networkLive, nationalLive: !!st.nationalLive,
        globalLive: !!st.globalLive, scaleRefused: !!st.scaleRefused,
      };
      snap.pendingNational = st.pendingNational ? { shape: st.pendingNational.shape || null, day: st.pendingNational.day || null } : null;
      snap.pendingGlobal = st.pendingGlobal ? { day: st.pendingGlobal.day || null } : null;
      snap.pendingCounter = st.pendingCounter ? { kind: st.pendingCounter.kind || 'link', targetId: st.pendingCounter.targetId || null, day: st.pendingCounter.day || null } : null;
      snap.pendingAccord = !!st.pendingAccord;
    } catch (e) { snap.flags = null; t.instrumentErrors.push('diplo-flags: ' + String(e.message).slice(0, 80)); }
    try {
      const fps = (typeof Game.foreignPolities === 'function') ? (Game.foreignPolities() || []) : [];
      snap.foreignPolities = {
        count: fps.length,
        maxSize: fps.reduce(function (m, p) { const s = ((p.subs || []).length || 0) + 1; return Math.max(m, s); }, 0),
        any4plus: fps.some(function (p) { return (((p.subs || []).length || 0) + 1) >= 4; }),
        entries: fps.map(function (p) { return { primary: p.primary || null, subs: (p.subs || []).slice(), day: p.day || null }; }),
      };
    } catch (e) { snap.foreignPolities = null; t.instrumentErrors.push('diplo-foreign: ' + String(e.message).slice(0, 80)); }
    try {
      const ls = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
      snap.linkKinds = {
        total: ls.length,
        primarySub: ls.filter(function (l) { return l && l.primary; }).length,
        covenant: ls.filter(function (l) { return l && l.kind === 'covenant'; }).length,
        trade: ls.filter(function (l) { return l && l.kind === 'trade'; }).length,
        conquered: ls.filter(function (l) { return l && l.conquered; }).length,
        active: ls.filter(function (l) { return l && l.status === 'active'; }).length,
      };
    } catch (e) { snap.linkKinds = null; t.instrumentErrors.push('diplo-linkKinds: ' + String(e.message).slice(0, 80)); }
    t.diploDaily.push(snap);
    return snap;
  }

  function uninstall() {
    Object.keys(wrapped).forEach(function (name) {
      try { Game[name] = wrapped[name]; } catch (e) { t.instrumentErrors.push('uninstall-' + name + ': ' + String(e.message).slice(0, 80)); }
    });
  }

  return { t: t, snapshot: snapshot, uninstall: uninstall };
}

module.exports = { install: install, classifyFormPath: classifyFormPath, classifyPeerFormPath: classifyPeerFormPath, classifyReturn: classifyReturn };
