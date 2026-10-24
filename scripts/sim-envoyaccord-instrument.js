#!/usr/bin/env node
// sim-envoyaccord-instrument.js — ENVOY->ACCORD census instrument for arm
// sim-envoyaccord (flesh-out loop, axis scale-onramp). DIAG instrument:
// ZERO src/js changes, zero game-state writes, ZERO RNG draws.
//
// THE MECHANISM, AS THE ENGINE STATES IT (read, not invented):
// - The "envoys arrive" line is a ledger narration beat, not a game
//   object: ledger.js ledgerBeat() fires ~every 12 days once the village
//   has a non-Unknown leadership epithet; the 'indispensable' flavor
//   reads "Other villages send envoys now. They need what you know."
// - An accord is NOT triggered by that beat. An accord stages ONLY at
//   link formation: hierarchy.js _formLink() calls stageFirstAccord()
//   when (!networkLive || accordUnanswered). stageFirstAccord sets
//   state.pendingAccord; answerAccord('gift'|'visit'|'cold') resolves it.
// - Links form ONLY through player/policy verbs: proposeLink (UI
//   buttons in app.js; >=55 judgeLink -> link, 35-54 -> pendingCounter,
//   <35 -> decline, opinion <= -20 -> shut door, unknown village ->
//   refused, existing link -> refused, pendingCounter -> refused),
//   proposeCovenant/proposeTrade (_proposePeer), answerCounter accept,
//   or raid resolution. No daily driver forms links autonomously.
// - judgeLink() itself draws RNG (score += R()*20-10, hierarchy.js).
//   This instrument NEVER calls judgeLink (that would perturb the sim).
//   It records judgeLink's deterministic inputs at each envoy beat and
//   replicates the deterministic part of the formula (see judgeBase)
//   so the analyzer can report the counterfactual band with the
//   R-term shown as a +/-10 range, never a fake exact score.
//
// What it records (per run, in t):
//   t.envoyDaily — one row per policy.daily: day, rank, networkLive,
//     active links, pendingAccord, pendingCounter, accordUnanswered,
//     other-village counts, verb call counts, standing.
//   t.envoyBeats — one row per ledgerBeat firing (any epithet): day,
//     epithet, frame, isEnvoy (epithet == 'the Indispensable'), accord
//     snapshot at the beat, known-village detail (opinion, courtship
//     inputs, judgeBase central band + R-range), verb counts.
//   t.envoyVerbs — call log for proposeLink/proposeCovenant/
//     proposeTrade/answerCounter/answerAccord/stageFirstAccord/
//     _formLink/_formPeerLink (passthrough wrappers; a call that never
//     happens is itself the measurement).
//   t.envoyErrors — instrument errors only (never thrown into game flow).
//
// classifyEnvoyEvent(ev) is PURE (no Game reads) so the analyzer and
// the proof test share one implementation. Attribution order follows
// the engine's own gate order (proposeLink, hierarchy.js):
//   pending accord -> accord answered -> link exists, no pending accord
//   -> pending counter blocks -> no known village -> no proposal made
//   -> proposal made, no link. A staged-but-unanswered accord and an
//   answered accord are ACCORD outcomes, not failing conditions; the
//   failing-condition set is the other five.
'use strict';

function dayOf(Game) {
  try { return (((Game.state || {}).scholar || {}).day) | 0 || 0; } catch (e) { return 0; }
}
function err(t, where, e) {
  try { (t.envoyErrors = t.envoyErrors || []).push('envoy.' + where + ': ' + String((e && e.message) || e)); } catch (e2) {}
}
function linksActive(Game) {
  try {
    const ls = (typeof Game.hierarchyState === 'function' ? Game.hierarchyState() : []) || [];
    return ls.filter(l => l && l.status === 'active');
  } catch (e) { return []; }
}
function accordSnapshot(Game) {
  const snap = { day: dayOf(Game), rank: 'village', networkLive: false,
    nLinksActive: 0, pendingAccord: null, pendingCounter: null,
    accordUnanswered: false, nOV: 0, nKnown: 0, standing: null };
  try { snap.rank = (Game.scaleRank ? (Game.scaleRank() || 'village') : 'village'); } catch (e) {}
  try { snap.networkLive = !!((Game.state || {}).networkLive); } catch (e) {}
  try { snap.nLinksActive = linksActive(Game).length; } catch (e) {}
  try {
    const pa = (Game.state || {}).pendingAccord;
    if (pa) snap.pendingAccord = { linkId: pa.linkId || null, day: pa.day != null ? pa.day : null };
  } catch (e) {}
  try {
    const pc = (Game.state || {}).pendingCounter;
    if (pc) snap.pendingCounter = { targetId: pc.targetId || null, day: pc.day != null ? pc.day : null, kind: pc.kind || null };
  } catch (e) {}
  try { snap.accordUnanswered = !!((Game.state || {}).accordUnanswered); } catch (e) {}
  try {
    const ovs = ((Game.state || {}).otherVillages || []);
    snap.nOV = ovs.length;
    snap.nKnown = ovs.filter(ov => { try { return Game.knowsVillage(ov); } catch (e2) { return false; } }).length;
  } catch (e) {}
  try { snap.standing = (Game.villageStanding ? ((Game.villageStanding() || {}).total | 0) : null); } catch (e) {}
  return snap;
}
// judgeBase: judgeLink's deterministic part, hierarchy.js judgeLink().
// Base 38 + min(20, repS/2) + opinion/2 + allied 15 + subordinate
// branch (+10, +8 if tribute>=3000 and opinion>=5) OR primary branch
// (ourS>theirS: +min(15,(ourS-theirS)/5), else -10). The live score adds
// R()*20-10, i.e. +/-10, which the instrument never draws.
function judgeBase(repS, opinion, allied, ourS, theirS, opts) {
  opts = opts || {};
  let s = 38;
  s += Math.min(20, (repS || 0) / 2);
  s += (opinion || 0) / 2;
  if (allied) s += 15;
  if (opts.asSubordinate) {
    s += 10;
    if ((opts.tributeKcalPerWeek || 0) >= 3000 && (opinion || 0) >= 5) s += 8;
  } else {
    if ((ourS || 0) > (theirS || 0)) s += Math.min(15, ((ourS || 0) - (theirS || 0)) / 5);
    else s -= 10;
  }
  return Math.round(s);
}
function centralBand(base) {
  if (base == null) return 'unknown';
  if (base >= 55) return 'accept';
  if (base >= 35) return 'counter';
  return 'decline';
}
function knownDetail(Game, t) {
  const out = [];
  try {
    const ovs = ((Game.state || {}).otherVillages || []);
    let repS = 0;
    try { const rep = Game.representative ? Game.representative() : null; repS = rep ? (rep.standing || 0) : 0; } catch (e) {}
    let ourS = 0;
    try { ourS = Game.regionalStanding ? (Game.regionalStanding() | 0) : 0; } catch (e) {}
    for (const ov of ovs) {
      let known = false;
      try { known = !!Game.knowsVillage(ov); } catch (e) {}
      if (!known) continue;
      const opinion = ov.opinion || 0;
      let allied = false, theirS = 0;
      try { allied = !!(Game.isAllied && Game.isAllied('haven', ov.id)); } catch (e) {}
      try { theirS = Game.villageStandingOf ? (Game.villageStandingOf(ov.id) | 0) : 0; } catch (e) {}
      const bp = judgeBase(repS, opinion, allied, ourS, theirS, { asSubordinate: false, tributeKcalPerWeek: 4000 });
      const bs = judgeBase(repS, opinion, allied, ourS, theirS, { asSubordinate: true, tributeKcalPerWeek: 4000 });
      out.push({ id: ov.id || null, name: ov.name || null, opinion,
        generated: !!ov.generated, rumored: !!ov.rumored, allied,
        repStanding: repS, ourStanding: ourS, theirStanding: theirS,
        basePrimary: bp, bandPrimary: centralBand(bp),
        baseSubordinate: bs, bandSubordinate: centralBand(bs),
        shutDoor: opinion <= -20 });
    }
  } catch (e) { err(t, 'knownDetail', e); }
  return out;
}
function verbCounts(t) {
  const v = t.envoyVerbs || {};
  return { proposeLink: (v.proposeLink || []).length, proposePeer: ((v.proposeCovenant || []).length + (v.proposeTrade || []).length),
    answerCounter: (v.answerCounter || []).length, answerAccord: (v.answerAccord || []).length,
    stageFirstAccord: (v.stageFirstAccord || []).length, formLink: (v._formLink || []).length,
    formPeerLink: (v._formPeerLink || []).length, raidVillage: (v.raidVillage || []).length };
}
function wrapVerb(Game, t, name) {
  try {
    const orig = Game[name];
    if (typeof orig !== 'function') { err(t, 'wrap.missing:' + name, new Error('not a function')); return; }
    Game[name] = function () {
      const args = Array.prototype.slice.call(arguments);
      let ret, threw = null;
      try { ret = orig.apply(this, arguments); } catch (e) { threw = e; }
      try {
        (t.envoyVerbs[name] = t.envoyVerbs[name] || []).push({ day: dayOf(Game),
          args: args.map(a => (a && typeof a === 'object' ? JSON.stringify(a).slice(0, 200) : String(a)).slice(0, 3)),
          ret: (ret && typeof ret === 'object' ? ('link:' + (ret.id || '?')) : String(ret)) });
      } catch (e) { err(t, 'verb.log:' + name, e); }
      if (threw) throw threw;
      return ret;
    };
    (t.envoyUninstalls = t.envoyUninstalls || []).push(() => { try { Game[name] = orig; } catch (e) {} });
  } catch (e) { err(t, 'wrap:' + name, e); }
}
function install(Game, t) {
  t.envoyDaily = t.envoyDaily || [];
  t.envoyBeats = t.envoyBeats || [];
  t.envoyVerbs = t.envoyVerbs || {};
  t.envoyErrors = t.envoyErrors || [];
  t.envoyUninstalls = t.envoyUninstalls || [];
  const VERBS = ['proposeLink', 'proposeCovenant', 'proposeTrade', 'answerCounter', 'answerAccord', 'stageFirstAccord', '_formLink', '_formPeerLink', 'raidVillage'];
  for (const v of VERBS) wrapVerb(Game, t, v);
  // ledgerBeat wrap: the envoy-arrival event detector. The original
  // still runs (its own R() draws are game code, unchanged); the wrap
  // only reads the advanced lastLedgerBeat + the pure epithet sum.
  try {
    const origBeat = Game.ledgerBeat;
    if (typeof origBeat !== 'function') { err(t, 'wrap.missing:ledgerBeat', new Error('not a function')); }
    else {
      Game.ledgerBeat = function () {
        let before = null;
        try { before = ((Game.progState ? Game.progState() : {}) || {}).lastLedgerBeat; } catch (e) {}
        const r = origBeat.apply(this, arguments);
        try {
          const after = ((Game.progState ? Game.progState() : {}) || {}).lastLedgerBeat;
          if (after != null && after !== before) {
            let epithet = 'the Unknown', frame = 'unwritten';
            try { epithet = Game.leadershipEpithet ? Game.leadershipEpithet() : epithet; } catch (e) {}
            try { frame = Game.endingFrame ? Game.endingFrame() : frame; } catch (e) {}
            const vc = verbCounts(t);
            const accordAnswered = (t.envoyVerbs.answerAccord || []).some(x => x.ret === 'true');
            t.envoyBeats.push({ day: dayOf(Game), epithet, frame,
              isEnvoy: epithet === 'the Indispensable',
              snap: accordSnapshot(Game), known: knownDetail(Game, t),
              verbCounts: vc, accordAnsweredEver: accordAnswered,
              accordStagedEver: vc.stageFirstAccord > 0 });
          }
        } catch (e) { err(t, 'beat.rec', e); }
        return r;
      };
      t.envoyUninstalls.push(() => { try { Game.ledgerBeat = origBeat; } catch (e) {} });
    }
  } catch (e) { err(t, 'wrap:ledgerBeat', e); }
  return function uninstallEnvoy() {
    for (let i = t.envoyUninstalls.length - 1; i >= 0; i--) { try { t.envoyUninstalls[i](); } catch (e) {} }
  };
}
function wrapPolicy(policy, t) {
  if (!Array.isArray(t.envoyDaily)) t.envoyDaily = [];
  if (!Array.isArray(t.envoyErrors)) t.envoyErrors = [];
  const origDaily = policy.daily;
  const wrapped = Object.assign({}, policy, {
    daily(Game, ctx) {
      try {
        const snap = accordSnapshot(Game);
        const vc = verbCounts(t);
        t.envoyDaily.push({ day: snap.day, rank: snap.rank, networkLive: snap.networkLive,
          nLinksActive: snap.nLinksActive, pendingAccord: snap.pendingAccord,
          pendingCounter: snap.pendingCounter, accordUnanswered: snap.accordUnanswered,
          nOV: snap.nOV, nKnown: snap.nKnown, standing: snap.standing,
          proposeCalls: vc.proposeLink + vc.proposePeer, accordCalls: vc.answerAccord });
      } catch (e) { err(t, 'daily.rec', e); }
      if (typeof origDaily === 'function') return origDaily(Game, ctx);
      return undefined;
    },
  });
  return wrapped;
}
// classifyEnvoyEvent(ev): PURE. ev is one t.envoyBeats row. Returns
// { outcome: 'accord'|'no-accord', condition } where condition is one of
// the engine's own states (see header). no-accord conditions:
//   link-exists-no-pending-accord | pending-counter-blocks-proposal |
//   no-known-village | no-proposal-made | proposal-made-no-link.
function classifyEnvoyEvent(ev) {
  ev = ev || {};
  const snap = ev.snap || {};
  const known = Array.isArray(ev.known) ? ev.known : [];
  const vc = ev.verbCounts || {};
  if (snap.pendingAccord) return { outcome: 'accord', condition: 'accord-pending-unanswered' };
  if (ev.accordAnsweredEver) return { outcome: 'accord', condition: 'accord-answered' };
  if ((snap.nLinksActive || 0) > 0) return { outcome: 'no-accord', condition: 'link-exists-no-pending-accord' };
  if (snap.pendingCounter) return { outcome: 'no-accord', condition: 'pending-counter-blocks-proposal' };
  if (known.length === 0) return { outcome: 'no-accord', condition: 'no-known-village' };
  const proposals = (vc.proposeLink || 0) + (vc.proposePeer || 0) + (vc.raidVillage || 0);
  if (proposals === 0) return { outcome: 'no-accord', condition: 'no-proposal-made' };
  return { outcome: 'no-accord', condition: 'proposal-made-no-link' };
}
module.exports = { install, wrapPolicy, accordSnapshot, knownDetail, judgeBase, centralBand, classifyEnvoyEvent, verbCounts };
