// hold-instrument-20261106.js — trust-bleed eater instrument
// (arm sim-hold-b, run fleshout-loop-b-20261106T0930Z). Scripts only,
// zero src/js. Wraps the linkseek instrument (daily standing, ledger,
// full link roll, knowledge roll) and adds a per-snapshot HOLD roll:
// every link (active AND broken, so dissolutions stay visible) with
// the fields a trust delta can be attributed from — trust, arrears,
// tribute terms + paid week, tendedWeek, mourningUntil, lastKeptDay,
// pendingRenegotiation / pendingDefense, their speaker, formation
// day, the engine's own link.history (day/kind/note, capped at 40
// in the engine — snapshots are daily so entries are captured
// before they age out), the subordinate's own pantry, and Haven's
// pantry (the tend guard reads it).
//
// Attribution lives in the analyzer (hold-eater-analyze-20261106):
// day-level trust deltas are matched against new history entries
// + field diffs. Tends are NOT in the court log (linkseek evidence
// §"The hold") — the instrument records them from tendedWeek /
// history 'tended' entries, and never claims the engine logs them.
// Usage: const INST = require('./hold-instrument-20261106');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.uninstall();
'use strict';
const path = require('path');
const LINKSEEK = require(path.join(__dirname, 'linkseek-instrument-20261106'));
const STAND = require(path.join(__dirname, 'standaccum-instrument-20261104'));

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) { return 0; }
}

function otherOf(Game, l) {
  try { if (typeof Game._linkOther === 'function') return Game._linkOther(l, 'haven'); } catch (e) {}
  if (l.primary === 'haven') return l.subordinate || null;
  if (l.subordinate === 'haven') return l.primary || null;
  if (l.a === 'haven') return l.b || null;
  if (l.b === 'haven') return l.a || null;
  return null;
}

function holdRoll(Game, t) {
  const roll = { havenPantry: pantryKcal(Game), links: [] };
  try {
    const st = Game.state || {};
    try {
      const of = st.pendingAidOffer || null;
      roll.pendingAidOffer = of ? { villageId: of.villageId || null, kind: of.kind || null, amount: (of.amount || 0) | 0 } : null;
    } catch (e) { roll.pendingAidOffer = null; }
    try {
      const beg = st.pendingAidBeg || null;
      roll.pendingAidBeg = beg ? { villageId: beg.villageId || null, amount: (beg.amount || 0) | 0 } : null;
    } catch (e) { roll.pendingAidBeg = null; }
    try { roll.aidOutCount = ((st.aidOut || []).length) | 0; } catch (e) { roll.aidOutCount = null; }
    try { roll.aidInboundCount = ((st.aidInbound || []).length) | 0; } catch (e) { roll.aidInboundCount = null; }
  } catch (e) { t.instrumentErrors.push('hold-aid: ' + String(e.message).slice(0, 80)); }
  try {
    const ls = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
    for (const l of ls) {
      if (!l) continue;
      const other = otherOf(Game, l);
      const entry = {
        key: STAND.linkKey(l, other), other: other, kind: l.kind || null,
        primary: l.primary || null, subordinate: l.subordinate || null,
        status: l.status || null, formedDay: (l.day || 0) | 0,
        trust: (l.trust || 0) | 0, arrears: (l.arrears || 0) | 0,
        tributeKcalPerWeek: (l.tributeKcalPerWeek || 0) | 0,
        tributePaidKcal: (l.tributePaidKcal || 0) | 0,
        tributePaidWeek: (l.tributePaidWeek == null ? null : l.tributePaidWeek | 0),
        tributeWeek: (l.tributeWeek == null ? null : l.tributeWeek | 0),
        tendedWeek: (l.tendedWeek == null ? null : l.tendedWeek | 0),
        mourningUntil: (l.mourningUntil == null ? null : l.mourningUntil | 0),
        lastKeptDay: (l.lastKeptDay == null ? null : l.lastKeptDay | 0),
        pendingRenegotiation: l.pendingRenegotiation ? { day: (l.pendingRenegotiation.day || 0) | 0, sub: !!l.pendingRenegotiation.sub, succgrace: !!l.pendingRenegotiation.succgrace } : null,
        pendingDefense: !!l.pendingDefense,
        pendingDemand: !!l.pendingDemand,
        theirSpeaker: (l.theirSpeaker && l.theirSpeaker.name) || null,
        conquered: !!l.conquered,
        history: Array.isArray(l.history) ? l.history.map(function (h) { return { day: (h.day || 0) | 0, kind: h.kind || null, note: String(h.note || '').slice(0, 200) }; }) : [],
      };
      try {
        const sov = (typeof Game._otherVillage === 'function') ? Game._otherVillage(other) : null;
        entry.subPantryKcal = sov ? Math.round(sov.pantryKcal || 0) : null;
        entry.subPopulation = sov ? (sov.population || null) : null;
      } catch (e) { entry.subPantryKcal = null; entry.subPopulation = null; }
      roll.links.push(entry);
    }
  } catch (e) { t.instrumentErrors.push('hold-roll: ' + String(e.message).slice(0, 80)); }
  return roll;
}

function install(Game) {
  const base = LINKSEEK.install(Game);
  const t = base.t;
  t.aidAnswers = [];
  // Spy (not stub) the aid / renegotiation answers: competent answers
  // offers and begs inside its own daily, between snapshots — a
  // pending-state snapshot can never see them (staged at endDay,
  // answered next morning, before the snapshot). The spy records
  // (day, village, how, result) so the analyzer can attribute the
  // direct link.trust writes these verbs make (safetynets.js /
  // hierarchy.js), which carry no history note.
  const spies = [];
  function spyMethod(name, kind) {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') return;
      Game[name] = function () {
        // Village first: answerAidOffer/Beg clear the pending beat
        // inside the call, so the village must be read BEFORE it.
        let villageId = null;
        try {
          if (kind === 'offer') villageId = ((Game.state || {}).pendingAidOffer || {}).villageId || null;
          else if (kind === 'beg') villageId = ((Game.state || {}).pendingAidBeg || {}).villageId || null;
          else {
            const a0 = arguments.length ? arguments[0] : null;
            const l = (typeof Game._linkById === 'function') ? Game._linkById(a0) : null;
            villageId = l ? (l.subordinate === 'haven' ? l.primary : l.subordinate) : null;
          }
        } catch (e) {}
        const how = (kind === 'request' || kind === 'renegotiation')
          ? (typeof arguments[1] === 'string' ? arguments[1] : null)
          : (typeof arguments[0] === 'string' ? arguments[0] : null);
        let result = null;
        try { result = orig.apply(this, arguments); } catch (e) { throw e; }
        try {
          t.aidAnswers.push({ day: dayOf(Game), kind: kind, how: how, villageId: villageId, result: (typeof result === 'string' ? result : (result === true ? 'true' : (result == null ? null : 'object'))) });
        } catch (e) { t.instrumentErrors.push('aid-spy-record: ' + String(e.message).slice(0, 80)); }
        return result;
      };
      spies.push({ name: name, orig: orig });
    } catch (e) { t.instrumentErrors.push('aid-spy-install:' + name + ': ' + String(e.message).slice(0, 80)); }
  }
  spyMethod('answerAidOffer', 'offer');
  spyMethod('answerAidBeg', 'beg');
  spyMethod('answerRenegotiation', 'renegotiation');
  spyMethod('requestAid', 'request');
  function snapshot() {
    const snap = base.snapshot();
    try { snap.hold = holdRoll(Game, t); } catch (e) { snap.hold = null; t.instrumentErrors.push('hold-snap: ' + String(e.message).slice(0, 80)); }
    return snap;
  }
  function uninstall() {
    try { for (const s of spies) { try { Game[s.name] = s.orig; } catch (e) {} } } catch (e) {}
    try { base.uninstall(); } catch (e) {}
  }
  return { t: t, snapshot: snapshot, uninstall: uninstall };
}

module.exports = { install: install, holdRoll: holdRoll, pantryKcal: pantryKcal };
