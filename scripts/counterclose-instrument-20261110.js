// counterclose-instrument-20261110.js — counter-wall recorder
// (arm sim-counterclose-a, run fleshout-20261110T1915Z). Scripts only,
// zero src/js. Extends the secondlink-a recorder (which it runs
// alongside, unchanged) with the counter split the raiserseat-a
// evidence conflated:
//
//   (1) proposeLink outcomes split FRESH vs BLOCKED: a 'counter'
//       return is FRESH only when no counter was pending at entry;
//       when state.pendingCounter is already set, proposeLink returns
//       'counter' from its guard without re-judging — a blocked
//       re-knock, not a new judgment. Each propose call records
//       pendingCounter-before, the target's opinion, the
//       representative's standing, allied status, both standings, and
//       whether a link already exists.
//   (2) judgeLink scores: every judgment call records its score and
//       reasons, tagged by caller (proposeLink vs answerCounter
//       sweeten re-judgment) via the stack, so a fresh counter's
//       score can be read off directly.
//   (3) answerCounter calls: how (accept/sweeten/walk), result class
//       (formed-link / refused-null / held-counter), target, pantry
//       kcal before the call.
//   (4) Daily counter snapshot: pendingCounter detail (targetId,
//       asSubordinate, tribute, day staged, terms) + pantry kcal,
//       so "stalled at unanswered counters" is read off the last
//       snapshot, not inferred from return counts.
//
// All wraps are record-only: call the original, return its value
// unchanged, never alter state, never consume RNG. Recording
// failures are logged, never thrown into the game.
//
// Usage: const INST = require('./counterclose-instrument-20261110');
//   const inst = INST.install(Game); inst.snapshotDay(); ...
//   inst.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function pantryKcal(Game) {
  try { return ((Game.state.village || {}).pantry || []).reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0); } catch (e) { return null; }
}

function install(Game) {
  const t = {
    propose: [], judgments: [], answers: [], counterDays: [],
    instrumentErrors: [],
  };
  const wrapped = {};

  function stackFrames(skip) {
    try { return (new Error().stack || '').split('\n').slice(skip, skip + 5).join(' | '); } catch (e) { return ''; }
  }

  function wrapMethod(name, record) {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { t.instrumentErrors.push(name + '-missing: not a function'); return; }
      wrapped[name] = orig;
      const selfGame = Game;
      Game[name] = function () {
        let r, threw = null;
        let pre = null;
        try { pre = record.pre ? record.pre(Array.prototype.slice.call(arguments)) : null; } catch (e) { t.instrumentErrors.push(name + '-pre: ' + String(e.message).slice(0, 80)); }
        try { r = orig.apply(selfGame, arguments); } catch (e) { threw = e; }
        try { if (record.post) record.post(Array.prototype.slice.call(arguments), r, threw, pre); } catch (e) { t.instrumentErrors.push(name + '-post: ' + String(e.message).slice(0, 80)); }
        if (threw) throw threw;
        return r;
      };
    } catch (e) { t.instrumentErrors.push(name + '-wrap: ' + String(e.message).slice(0, 80)); }
  }

  // proposeLink: split fresh counter vs blocked re-knock, with the
  // propose-time courtship state the prereg's diagnosis names.
  wrapMethod('proposeLink', {
    pre: function (args) {
      const targetId = args[0] || null;
      const pre = { targetId: targetId, pendingBefore: !!(Game.state || {}).pendingCounter };
      try {
        const ovs = ((Game.state || {}).otherVillages || []);
        const ov = ovs.filter(function (v) { return v && v.id === targetId; })[0] || null;
        pre.opinion = ov ? (ov.opinion != null ? ov.opinion : null) : null;
        pre.targetName = ov ? (ov.name || null) : null;
      } catch (e) { pre.opinion = null; }
      try { const rep = Game.representative ? Game.representative() : null; pre.repStanding = rep ? (rep.standing != null ? rep.standing : null) : null; pre.repId = rep ? (rep.id || null) : null; } catch (e) { pre.repStanding = null; }
      try { pre.allied = (Game.isAllied && Game.isAllied('haven', targetId)) ? true : false; } catch (e) { pre.allied = null; }
      try { pre.ourStanding = Game.regionalStanding ? Game.regionalStanding() : null; } catch (e) { pre.ourStanding = null; }
      try { pre.theirStanding = Game.villageStandingOf ? Game.villageStandingOf(targetId) : null; } catch (e) { pre.theirStanding = null; }
      try { pre.alreadyLinked = !!(Game.linkWith && Game.linkWith(targetId)); } catch (e) { pre.alreadyLinked = null; }
      try { pre.knows = (Game.knowsVillage && ov) ? !!Game.knowsVillage(ov) : null; } catch (e) { pre.knows = null; }
      return pre;
    },
    post: function (args, r, threw, pre) {
      if (threw) return;
      let cls = 'declined-null';
      if (r === 'counter') cls = 'counter';
      else if (r && typeof r === 'object') cls = 'formed';
      t.propose.push({
        day: dayOf(Game), villageId: (pre && pre.targetId) || null,
        outcome: cls,
        kind: cls === 'counter' ? ((pre && pre.pendingBefore) ? 'blocked-reknock' : 'fresh-counter') : cls,
        pendingBefore: !!(pre && pre.pendingBefore),
        opinion: (pre && pre.opinion != null) ? pre.opinion : null,
        targetName: (pre && pre.targetName) || null,
        repStanding: (pre && pre.repStanding != null) ? pre.repStanding : null,
        repId: (pre && pre.repId) || null,
        allied: (pre && pre.allied != null) ? pre.allied : null,
        ourStanding: (pre && pre.ourStanding != null) ? pre.ourStanding : null,
        theirStanding: (pre && pre.theirStanding != null) ? pre.theirStanding : null,
        alreadyLinked: (pre && pre.alreadyLinked != null) ? pre.alreadyLinked : null,
        stack: stackFrames(3),
      });
    },
  });

  // judgeLink: the score behind each fresh judgment. Caller is read
  // off the stack: a sweeten re-judgment runs inside answerCounter.
  wrapMethod('judgeLink', {
    pre: function (args) { return { targetId: args[0] || null, stack: stackFrames(3) }; },
    post: function (args, r, threw, pre) {
      if (threw) return;
      const st = (pre && pre.stack) || '';
      t.judgments.push({
        day: dayOf(Game), targetId: (pre && pre.targetId) || null,
        score: (r && r.score != null) ? r.score : null,
        reasons: (r && r.reasons) ? r.reasons.slice() : null,
        caller: st.indexOf('answerCounter') !== -1 ? 'answerCounter-sweeten' : 'proposeLink',
      });
    },
  });

  // answerCounter: how the table was answered, and what came of it.
  wrapMethod('answerCounter', {
    pre: function (args) {
      const c = (Game.state || {}).pendingCounter || null;
      return {
        how: args[0] || null,
        targetId: c ? (c.targetId || null) : null,
        asSubordinate: c ? !!c.asSubordinate : null,
        tribute: c ? (c.tributeKcalPerWeek != null ? c.tributeKcalPerWeek : null) : null,
        counterDay: c ? (c.day != null ? c.day : null) : null,
        pantryBefore: pantryKcal(Game),
      };
    },
    post: function (args, r, threw, pre) {
      if (threw) return;
      let cls = 'refused-null';
      if (r === 'counter') cls = 'held-counter';
      else if (r && typeof r === 'object') cls = 'formed-link';
      t.answers.push({
        day: dayOf(Game), how: (pre && pre.how) || null,
        targetId: (pre && pre.targetId) || null,
        asSubordinate: (pre && pre.asSubordinate != null) ? pre.asSubordinate : null,
        tribute: (pre && pre.tribute != null) ? pre.tribute : null,
        counterDay: (pre && pre.counterDay != null) ? pre.counterDay : null,
        pantryBefore: (pre && pre.pantryBefore != null) ? pre.pantryBefore : null,
        pantryAfter: pantryKcal(Game),
        result: cls,
      });
    },
  });

  // Daily counter snapshot: the pending offer in full, so the
  // end-of-run stall verdict reads off state, not return counts.
  function snapshotDay() {
    const snap = { day: dayOf(Game) };
    try {
      const c = (Game.state || {}).pendingCounter || null;
      snap.pendingCounter = c ? {
        targetId: c.targetId || null, asSubordinate: !!c.asSubordinate,
        tributeKcalPerWeek: (c.tributeKcalPerWeek != null ? c.tributeKcalPerWeek : null),
        day: (c.day != null ? c.day : null), kind: c.kind || null,
        terms: c.terms ? String(c.terms).slice(0, 300) : null,
      } : null;
    } catch (e) { snap.pendingCounter = null; t.instrumentErrors.push('counterSnap: ' + String(e.message).slice(0, 80)); }
    try { snap.pantryKcal = pantryKcal(Game); } catch (e) { snap.pantryKcal = null; }
    t.counterDays.push(snap);
    return snap;
  }

  function uninstall() {
    Object.keys(wrapped).forEach(function (name) {
      try { Game[name] = wrapped[name]; } catch (e) { t.instrumentErrors.push('uninstall-' + name + ': ' + String(e.message).slice(0, 80)); }
    });
  }

  return { t: t, snapshotDay: snapshotDay, uninstall: uninstall };
}

module.exports = { install: install };
