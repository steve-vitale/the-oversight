// havenlink-b-instrument-20261124.js — foreign-polity membership
// census instrument (arm sim-havenlink-b, run
// fleshout-loop-b-20261124T0630Z). Scripts only, zero src/js.
// LAYERS over the standing instrument
// (scripts/standing-gearready-b-instrument-20261124.js), reused
// verbatim: its daily snapshot (standing decomposition, links,
// havenPolity, foreignPolity COUNT, pendingNational, scaleRank)
// is kept whole, and this layer appends havenlink fields to each
// snapshot plus three event streams. Pure reads only; all wraps
// call-through and RNG-neutral; every catch reports into
// t.instrumentErrors, never silently. The snapshot NEVER calls
// villageStandingTotal() or unlockedWave() (inherited guarantee).
//
// Per snapshot (havenlink fields on the standing snapshot row):
//   havenLinks[] — every active Haven link with the far end NAMED
//     (village id + display name), role (Haven primary /
//     subordinate / peer), kind, day, trust, age, seasoned,
//     tribute, arrears, BELONG good-standing (trust>=50,
//     arrears 0, age>=14), isForeignPrimary, and the foreign
//     polity that far end belongs to (primary + subs + size).
//   foreignPolities[] — FULL entries {primary, primaryName,
//     subs[], subsNames[], day, size}, copied, not just a count.
//   belongPolity — Game._belongPolity() result (or null).
//   havenPolityFull — Game._havenPolity() result (or null).
//   pendingAccord — state.pendingAccord (or null).
// Event streams:
//   linkEvents[] — _formLink wrap: day, target, targetName,
//     asSubordinate, tributeKcalPerWeek, caller marker (first
//     non-hierarchy frames of the stack — bond-initiation /
//     conversation / ladder reward / policy, never a bare flag).
//   proposeEvents[] — proposeLink wrap: day, target, opts,
//     outcome (formed | counter | declined-or-shut |
//     counter-block).
//   counterEvents[] — _stageCounter wrap: day, target,
//     asSubordinate, tributeKcalPerWeek, terms.
//   nationalEvents[] — stageNationalBeat wrap (day, shape,
//     primary, villages) + answerNationalChoice wrap (day, how,
//     shape, primary; SWEAR costs 3,000 kcal and SERVE costs 7
//     speaker-days by code — recorded as the code-fixed cost,
//     not measured) + answerCounter wrap (day, how, target).
//   linkLines[] — say/sysSay lines matching the link/polity
//     regex (accord, courtship, binding, oath, tribute, "bound
//     itself", court, Binding, subordinate, league, charter,
//     council, counter, bow) — capped at 2000, same as the
//     standing stream.
// Usage: const INST = require('./havenlink-b-instrument-20261124');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.uninstall();
'use strict';

const STANDING = require('./standing-gearready-b-instrument-20261124');

const LINK_RE = /accord|courtship|bound (itself|together)|oath|Binding|tribute|swear|subordinate|primary|league|charter|council|counter|bow(s)? to|kneel|The First Court|The Iron Court|Founding Council|The Charter|network|regional/i;
const LINK_LINE_CAP = 2000;

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function ovName(Game, id) {
  try { return (typeof Game._ovName === 'function') ? (Game._ovName(id) || id) : id; } catch (e) { return id; }
}

function callerMarker() {
  try {
    const stack = (new Error('havenlink-caller').stack || '').split('\n').slice(1);
    const frames = [];
    for (const f of stack) {
      const m = f.match(/at\s+(?:\S+\s+\()?([^():]+)(?::\d+:\d+)?\)?/);
      const file = m ? m[1] : '';
      if (!file) continue;
      if (file.indexOf('havenlink-b-instrument') >= 0) continue;
      if (file.indexOf('hierarchy.js') >= 0) continue;
      frames.push(file.split('/').slice(-2).join('/'));
      if (frames.length >= 3) break;
    }
    return frames.join(' <- ') || 'unknown';
  } catch (e) { return 'unknown'; }
}

function install(Game) {
  const base = STANDING.install(Game);
  const t = base.t;
  t.linkEvents = [];
  t.proposeEvents = [];
  t.counterEvents = [];
  t.nationalEvents = [];
  t.linkLines = [];
  const orig = {};
  function err(where, e) { try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e).slice(0, 100)); } catch (e2) {} }
  function count(n) { t.wrapCounts[n] = (t.wrapCounts[n] || 0) + 1; }

  // --- link/polity say-lines (wraps the standing-wrapped say/sysSay;
  // uninstall restores mine first, then the standing layer's) ---
  function wrapSay(fnName) {
    if (typeof Game[fnName] !== 'function') return;
    orig[fnName] = Game[fnName];
    Game[fnName] = function () {
      const arg = arguments.length ? arguments[0] : null;
      try {
        if (typeof arg === 'string' && LINK_RE.test(arg)) {
          if (t.linkLines.length < LINK_LINE_CAP) t.linkLines.push({ day: dayOf(Game), via: fnName, line: String(arg).slice(0, 600) });
        }
      } catch (e) { err(fnName + '-linkwrap', e); }
      return orig[fnName].apply(this, arguments);
    };
  }
  wrapSay('say');
  wrapSay('sysSay');

  // --- link formation events (_formLink: the single place links are born) ---
  if (typeof Game._formLink === 'function') {
    orig._formLink = Game._formLink;
    Game._formLink = function (targetId, opts, j) {
      count('_formLink');
      let r;
      try { r = orig._formLink.apply(this, arguments); } catch (e) { throw e; }
      try {
        t.linkEvents.push({ day: dayOf(Game), target: targetId || null, targetName: ovName(Game, targetId),
          asSubordinate: !!(opts && opts.asSubordinate),
          tributeKcalPerWeek: (opts && opts.tributeKcalPerWeek != null) ? (opts.tributeKcalPerWeek | 0) : null,
          formed: !!(r && typeof r === 'object'), caller: callerMarker() });
      } catch (e) { err('_formLink-row', e); }
      return r;
    };
  } else { err('install._formLink', new Error('not a function')); }

  // --- proposals (proposeLink: negotiate one organization) ---
  if (typeof Game.proposeLink === 'function') {
    orig.proposeLink = Game.proposeLink;
    Game.proposeLink = function (targetId, opts) {
      count('proposeLink');
      let counterBefore = null;
      try { counterBefore = !!((Game.state || {}).pendingCounter); } catch (e) {}
      let r;
      try { r = orig.proposeLink.apply(this, arguments); } catch (e) { throw e; }
      try {
        let outcome = 'declined-or-shut';
        const counterAfter = !!((Game.state || {}).pendingCounter);
        if (r && typeof r === 'object') outcome = 'formed';
        else if (r === 'counter' && counterBefore) outcome = 'counter-block';
        else if (r === 'counter' && counterAfter) outcome = 'counter';
        t.proposeEvents.push({ day: dayOf(Game), target: targetId || null, targetName: ovName(Game, targetId),
          asSubordinate: !!(opts && opts.asSubordinate),
          tributeKcalPerWeek: (opts && opts.tributeKcalPerWeek != null) ? (opts.tributeKcalPerWeek | 0) : null,
          outcome: outcome });
      } catch (e) { err('proposeLink-row', e); }
      return r;
    };
  } else { err('install.proposeLink', new Error('not a function')); }

  // --- counters (_stageCounter: the middle band names its price) ---
  if (typeof Game._stageCounter === 'function') {
    orig._stageCounter = Game._stageCounter;
    Game._stageCounter = function (targetId, opts, j) {
      count('_stageCounter');
      let r;
      try { r = orig._stageCounter.apply(this, arguments); } catch (e) { throw e; }
      try {
        const c = (Game.state || {}).pendingCounter || {};
        t.counterEvents.push({ day: dayOf(Game), target: targetId || null, targetName: ovName(Game, targetId),
          asSubordinate: !!c.asSubordinate,
          tributeKcalPerWeek: (c.tributeKcalPerWeek != null) ? (c.tributeKcalPerWeek | 0) : null,
          terms: c.terms || null });
      } catch (e) { err('_stageCounter-row', e); }
      return r;
    };
  } else { err('install._stageCounter', new Error('not a function')); }

  // --- national beats (stage + answer) ---
  if (typeof Game.stageNationalBeat === 'function') {
    orig.stageNationalBeat = Game.stageNationalBeat;
    Game.stageNationalBeat = function (polity) {
      count('stageNationalBeat');
      let r;
      try { r = orig.stageNationalBeat.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (r) {
          t.nationalEvents.push({ day: dayOf(Game), kind: 'staged', shape: (r && r.shape) || (polity && polity.shape) || null,
            primary: (r && r.primary) || (polity && polity.primary) || null,
            primaryName: ovName(Game, (r && r.primary) || (polity && polity.primary)),
            villages: ((r && r.villages) || (polity && polity.villages) || []).slice() });
        }
      } catch (e) { err('stageNationalBeat-row', e); }
      return r;
    };
  } else { err('install.stageNationalBeat', new Error('not a function')); }
  if (typeof Game.answerNationalChoice === 'function') {
    orig.answerNationalChoice = Game.answerNationalChoice;
    Game.answerNationalChoice = function (how) {
      count('answerNationalChoice');
      let pnBefore = null;
      try { pnBefore = (Game.state || {}).pendingNational ? Object.assign({}, (Game.state || {}).pendingNational) : null; } catch (e) {}
      let r;
      try { r = orig.answerNationalChoice.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (pnBefore) {
          // Code-fixed costs (hierarchy.js answerNationalChoice):
          // swear = 3,000 kcal oath; serve = 7 speaker-days.
          const cost = (pnBefore.shape === 'belong' && how === 'swear') ? { kcal: 3000 }
            : (pnBefore.shape === 'belong' && how === 'serve') ? { speakerDays: 7 }
            : (pnBefore.shape === 'lead' && how === 'feast') ? { kcal: 5000 }
            : (pnBefore.shape === 'lead' && how === 'host') ? { speakerDays: 7 }
            : null;
          t.nationalEvents.push({ day: dayOf(Game), kind: 'answered', how: how || null,
            shape: pnBefore.shape || null, primary: pnBefore.primary || null,
            primaryName: ovName(Game, pnBefore.primary), cost: cost });
        }
      } catch (e) { err('answerNationalChoice-row', e); }
      return r;
    };
  } else { err('install.answerNationalChoice', new Error('not a function')); }
  if (typeof Game.answerCounter === 'function') {
    orig.answerCounter = Game.answerCounter;
    Game.answerCounter = function (how) {
      count('answerCounter');
      let cBefore = null;
      try { cBefore = (Game.state || {}).pendingCounter ? Object.assign({}, (Game.state || {}).pendingCounter) : null; } catch (e) {}
      let r;
      try { r = orig.answerCounter.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (cBefore) {
          t.nationalEvents.push({ day: dayOf(Game), kind: 'counter-answered', how: how || null,
            target: cBefore.targetId || null, targetName: ovName(Game, cBefore.targetId),
            asSubordinate: !!cBefore.asSubordinate,
            tributeKcalPerWeek: (cBefore.tributeKcalPerWeek != null) ? (cBefore.tributeKcalPerWeek | 0) : null,
            cost: (how === 'sweeten') ? { kcal: 1500 } : null });
        }
      } catch (e) { err('answerCounter-row', e); }
      return r;
    };
  }

  function snapshot() {
    const snap = base.snapshot();
    try {
      const st = Game.state || {};
      // --- foreign polities, FULL entries (primary + subs + day) ---
      let fps = [];
      try { fps = (typeof Game.foreignPolities === 'function') ? (Game.foreignPolities() || []) : []; } catch (e) { err('foreignPolities-full', e); }
      snap.foreignPolitiesFull = fps.map(function (fp) {
        const subs = (fp.subs || []).slice();
        return { primary: fp.primary || null, primaryName: ovName(Game, fp.primary),
          subs: subs, subsNames: subs.map(function (id) { return ovName(Game, id); }),
          day: (fp.day | 0) || 0, size: 1 + subs.length };
      });
      const fpPrimaries = {};
      snap.foreignPolitiesFull.forEach(function (fp) { fpPrimaries[fp.primary] = fp; });
      // --- Haven's links, far end named, BELONG bar stated ---
      let links = [];
      try { links = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : []; } catch (e) { err('links-full', e); }
      const day = dayOf(Game);
      snap.havenLinks = [];
      links.forEach(function (l) {
        try {
          if (!l || l.status !== 'active') return;
          let other = null, role = null;
          if (l.primary === 'haven') { other = l.subordinate; role = 'primary'; }
          else if (l.subordinate === 'haven') { other = l.primary; role = 'subordinate'; }
          else if (l.a === 'haven') { other = l.b; role = 'peer'; }
          else if (l.b === 'haven') { other = l.a; role = 'peer'; }
          else return;
          let seasoned = false;
          try { seasoned = (typeof Game._linkSeasoned === 'function') ? !!Game._linkSeasoned(l, !!l.conquered, true) : false; } catch (e) {}
          const age = day - ((l.day | 0) || 0);
          const trust = (l.trust | 0) || 0;
          const arrears = (l.arrears | 0) || 0;
          const fp = fpPrimaries[other] || null;
          snap.havenLinks.push({ other: other, otherName: ovName(Game, other),
            kind: l.kind || null, status: l.status || null, day: (l.day | 0) || 0,
            trust: trust, age: age, seasoned: seasoned,
            role: role, tributeKcalPerWeek: (l.tributeKcalPerWeek != null) ? (l.tributeKcalPerWeek | 0) : null,
            arrears: arrears,
            goodStanding: (trust >= 50 && arrears === 0 && age >= 14),
            belongGap: { trust: trust >= 50, arrears: arrears === 0, age: age >= 14,
              size: fp ? (fp.size + 1 >= 4) : false },
            isForeignPrimary: !!fp,
            foreignPolityOfOther: fp ? { primary: fp.primary, subs: fp.subs.slice(), size: fp.size, day: fp.day } : null });
        } catch (e) { err('havenLink-row', e); }
      });
      // --- Haven's polity on any road (BELONG included) ---
      try {
        const bp = (typeof Game._belongPolity === 'function') ? Game._belongPolity() : null;
        snap.belongPolity = bp ? { primary: bp.primary || null, primaryName: ovName(Game, bp.primary),
          villages: (bp.villages || []).slice(), size: (bp.size | 0) || 0, shape: bp.shape || null } : null;
      } catch (e) { snap.belongPolity = null; err('belongPolity', e); }
      try {
        const hp = (typeof Game._havenPolity === 'function') ? Game._havenPolity() : null;
        snap.havenPolityFull = hp ? { primary: hp.primary || null, primaryName: hp.primary ? ovName(Game, hp.primary) : null,
          villages: (hp.villages || []).slice(), size: (hp.size | 0) || 0, led: !!hp.led, shape: hp.shape || null } : null;
      } catch (e) { snap.havenPolityFull = null; err('havenPolityFull', e); }
      try { snap.pendingAccord = st.pendingAccord ? { target: st.pendingAccord.target || st.pendingAccord.village || null, day: (st.pendingAccord.day | 0) || 0, kind: st.pendingAccord.kind || null } : null; } catch (e) { snap.pendingAccord = null; err('pendingAccord', e); }
    } catch (e) { err('havenlink-snapshot', e); }
    return snap;
  }

  function otherVillages() {
    try {
      return ((Game.state || {}).otherVillages || []).map(function (v) {
        return { id: v.id || null, name: v.name || null, opinion: (v.opinion | 0) || 0 };
      });
    } catch (e) { err('otherVillages', e); return []; }
  }

  function uninstall() {
    Object.keys(orig).forEach(function (n) { try { Game[n] = orig[n]; } catch (e) {} });
    try { base.uninstall(); } catch (e) {}
  }
  return { t: t, snapshot: snapshot, uninstall: uninstall, otherVillages: otherVillages };
}

module.exports = { install: install, dayOf: dayOf, LINK_RE: LINK_RE, LINK_LINE_CAP: LINK_LINE_CAP };
