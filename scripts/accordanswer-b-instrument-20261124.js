// accordanswer-b-instrument-20261124.js — accord-answer probe
// instrument (arm sim-accordanswer-b, run
// fleshout-loop-b-20261124T0840Z). Scripts only, zero src/js.
// LAYERS over the havenlink instrument
// (scripts/havenlink-b-instrument-20261124.js), reused verbatim:
// its daily snapshot (standing decomposition, links, havenPolity,
// foreign polities, pendingNational, scaleRank, pendingAccord)
// is kept whole, and this layer appends accord fields to each
// snapshot plus two event streams. Pure reads only; all wraps
// call-through and RNG-neutral; every catch reports into
// t.instrumentErrors, never silently. The snapshot NEVER calls
// villageStandingTotal() or unlockedWave() (inherited guarantee).
//
// Event streams:
//   accordStageEvents[] — stageFirstAccord wrap: day, linkId,
//     target, targetName, staged (bool), caller marker.
//   accordAnswerEvents[] — answerAccord wrap: day, how, channel
//     (engine | policy | ui | other, from the call stack),
//     actorId + actorName (the available representative at answer
//     time for the engine channel; the player for a UI/player
//     answer; null when unknowable), linkId, targetName, lagDays
//     (answer day minus staged day), kcalPaid (pantry before minus
//     after), trustGain (link trust after minus before), outcome
//     (answered | no-pending-or-dead-link).
// Per snapshot (accord fields on the havenlink snapshot row):
//   accord — { pending: {linkId, day, targetName} | null,
//     pendingDays, stagedCount, answeredCount,
//     unansweredStaged: [linkIds staged but never answered] }.
//   driveStats — deep copy of state.answermailDrive, or null when
//     the env gate is off (the control leg MUST read null).
//   driveOn — process.env.ANSWERMAIL_DRIVE === '1'.
//   driveCalls — cumulative _answermailDriveDaily wrap count.
// Usage: const INST = require('./accordanswer-b-instrument-20261124');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.uninstall();
'use strict';

const HAVENLINK = require('./havenlink-b-instrument-20261124');

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function ovName(Game, id) {
  try { return (typeof Game._ovName === 'function') ? (Game._ovName(id) || id) : id; } catch (e) { return id; }
}

function pantryKcal(Game) {
  try {
    return (((Game.state || {}).village || {}).pantry || []).reduce(function (t, i) {
      return t + ((i.kcalEach || 0) * (i.units || 1));
    }, 0);
  } catch (e) { return null; }
}

function linkTrust(Game, linkId) {
  try {
    const links = (typeof Game.hierarchyState === 'function') ? (Game.hierarchyState() || []) : [];
    for (let i = 0; i < links.length; i++) {
      if (links[i].id === linkId) return { trust: (links[i].trust | 0) || 0, status: links[i].status || null, link: links[i] };
    }
  } catch (e) {}
  return null;
}

function otherOfLink(l) {
  if (!l) return null;
  if (l.primary === 'haven') return l.subordinate || null;
  if (l.subordinate === 'haven') return l.primary || null;
  if (l.a === 'haven') return l.b || null;
  if (l.b === 'haven') return l.a || null;
  return null;
}

function stackFrames() {
  try {
    return (new Error('accordanswer-caller').stack || '').split('\n').slice(1);
  } catch (e) { return []; }
}

function callerMarker() {
  try {
    const frames = [];
    for (const f of stackFrames()) {
      const m = f.match(/at\s+(?:\S+\s+\()?([^():]+)(?::\d+:\d+)?\)?/);
      const file = m ? m[1] : '';
      if (!file) continue;
      if (file.indexOf('accordanswer-b-instrument') >= 0) continue;
      if (file.indexOf('hierarchy.js') >= 0) continue;
      frames.push(file.split('/').slice(-2).join('/'));
      if (frames.length >= 3) break;
    }
    return frames.join(' <- ') || 'unknown';
  } catch (e) { return 'unknown'; }
}

// Channel: who called answerAccord. The engine drive calls it from
// _answermailDriveDaily; a policy calls it from scripts/policies/*;
// the player answers through app.js. Anything else is 'other'.
function answerChannel() {
  try {
    const stack = stackFrames().join('\n');
    if (stack.indexOf('_answermailDriveDaily') >= 0) return 'engine';
    if (/scripts\/policies\//.test(stack)) return 'policy';
    if (stack.indexOf('app.js') >= 0) return 'ui';
    return 'other';
  } catch (e) { return 'other'; }
}

function install(Game) {
  const base = HAVENLINK.install(Game);
  const t = base.t;
  t.accordStageEvents = [];
  t.accordAnswerEvents = [];
  t.driveCallDays = [];
  const orig = {};
  function err(where, e) { try { t.instrumentErrors.push(where + ': ' + String((e && e.message) || e).slice(0, 100)); } catch (e2) {} }
  function count(n) { t.wrapCounts[n] = (t.wrapCounts[n] || 0) + 1; }

  // --- staging (stageFirstAccord: the gesture is staged at link formation) ---
  if (typeof Game.stageFirstAccord === 'function') {
    orig.stageFirstAccord = Game.stageFirstAccord;
    Game.stageFirstAccord = function (link) {
      count('stageFirstAccord');
      let r;
      try { r = orig.stageFirstAccord.apply(this, arguments); } catch (e) { throw e; }
      try {
        const other = otherOfLink(link);
        t.accordStageEvents.push({ day: dayOf(Game),
          linkId: (link && link.id) || null, target: other, targetName: other ? ovName(Game, other) : null,
          staged: !!r, caller: callerMarker() });
      } catch (e) { err('stageFirstAccord-row', e); }
      return r;
    };
  } else { err('install.stageFirstAccord', new Error('not a function')); }

  // --- answering (answerAccord: the first gesture, priced honestly) ---
  if (typeof Game.answerAccord === 'function') {
    orig.answerAccord = Game.answerAccord;
    Game.answerAccord = function (how) {
      count('answerAccord');
      const channel = answerChannel();
      const day = dayOf(Game);
      let paBefore = null, trustBefore = null, pantryBefore = null, repBefore = null, repNameBefore = null;
      try { paBefore = (Game.state || {}).pendingAccord ? Object.assign({}, (Game.state || {}).pendingAccord) : null; } catch (e) {}
      try { if (paBefore && paBefore.linkId) { const lt = linkTrust(Game, paBefore.linkId); trustBefore = lt ? lt.trust : null; } } catch (e) {}
      try { pantryBefore = pantryKcal(Game); } catch (e) {}
      // Actor: for the engine channel, the drive chose the available
      // representative just before this call; _availableRepresentative
      // is a pure read (roster scan, no RNG, no mutation — hierarchy.js),
      // so re-reading it here returns the same villager.
      try {
        if (channel === 'engine' && typeof Game._availableRepresentative === 'function') {
          const rep = Game._availableRepresentative();
          if (rep && rep.id) {
            repBefore = rep.id;
            try { repNameBefore = String(Game.displayName ? Game.displayName(rep.id) : rep.id).split(' ')[0]; } catch (e) { repNameBefore = rep.id; }
          }
        } else if (channel === 'ui') {
          repBefore = Game.villagerId || null;
          try { repNameBefore = String(Game.displayName ? Game.displayName(repBefore) : repBefore).split(' ')[0]; } catch (e) { repNameBefore = repBefore; }
        }
      } catch (e) { err('answerAccord-actor', e); }
      let r;
      try { r = orig.answerAccord.apply(this, arguments); } catch (e) { throw e; }
      try {
        let trustAfter = null, pantryAfter = null;
        try { if (paBefore && paBefore.linkId) { const lt = linkTrust(Game, paBefore.linkId); trustAfter = lt ? lt.trust : null; } } catch (e) {}
        try { pantryAfter = pantryKcal(Game); } catch (e) {}
        const target = paBefore && paBefore.linkId ? (function () {
          try {
            const lt = linkTrust(Game, paBefore.linkId);
            return lt && lt.link ? otherOfLink(lt.link) : null;
          } catch (e) { return null; }
        })() : null;
        t.accordAnswerEvents.push({ day: day, how: how || null, channel: channel,
          actorId: repBefore, actorName: repNameBefore,
          linkId: (paBefore && paBefore.linkId) || null,
          target: target, targetName: target ? ovName(Game, target) : null,
          stagedDay: (paBefore && paBefore.day != null) ? (paBefore.day | 0) : null,
          lagDays: (paBefore && paBefore.day != null) ? (day - ((paBefore.day | 0) || 0)) : null,
          kcalPaid: (pantryBefore != null && pantryAfter != null) ? (pantryBefore - pantryAfter) : null,
          trustGain: (trustBefore != null && trustAfter != null) ? (trustAfter - trustBefore) : null,
          outcome: (r === null) ? 'no-pending-or-dead-link' : 'answered' });
      } catch (e) { err('answerAccord-row', e); }
      return r;
    };
  } else { err('install.answerAccord', new Error('not a function')); }

  // --- drive tick (proves the env gate ran, and with what rep) ---
  if (typeof Game._answermailDriveDaily === 'function') {
    orig._answermailDriveDaily = Game._answermailDriveDaily;
    Game._answermailDriveDaily = function () {
      count('_answermailDriveDaily');
      const day = dayOf(Game);
      let dsBefore = null, repId = null, repName = null;
      try { dsBefore = (Game.state || {}).answermailDrive ? JSON.parse(JSON.stringify((Game.state || {}).answermailDrive)) : null; } catch (e) {}
      try {
        if (typeof Game._availableRepresentative === 'function') {
          const rep = Game._availableRepresentative();
          if (rep && rep.id) {
            repId = rep.id;
            try { repName = String(Game.displayName ? Game.displayName(rep.id) : rep.id).split(' ')[0]; } catch (e) { repName = rep.id; }
          }
        }
      } catch (e) {}
      let r;
      try { r = orig._answermailDriveDaily.apply(this, arguments); } catch (e) { throw e; }
      try {
        let dsAfter = null;
        try { dsAfter = (Game.state || {}).answermailDrive ? JSON.parse(JSON.stringify((Game.state || {}).answermailDrive)) : null; } catch (e) {}
        t.driveCallDays.push({ day: day, envOn: (typeof process !== 'undefined' && process.env && process.env.ANSWERMAIL_DRIVE === '1'),
          repId: repId, repName: repName,
          accordAnswersBefore: dsBefore ? (dsBefore.accordAnswers | 0) : null,
          accordAnswersAfter: dsAfter ? (dsAfter.accordAnswers | 0) : null,
          tendsBefore: dsBefore ? (dsBefore.tends | 0) : null,
          tendsAfter: dsAfter ? (dsAfter.tends | 0) : null,
          errorsBefore: dsBefore ? (dsBefore.errors | 0) : null,
          errorsAfter: dsAfter ? (dsAfter.errors | 0) : null });
      } catch (e) { err('_answermailDriveDaily-row', e); }
      return r;
    };
  } else { err('install._answermailDriveDaily', new Error('not a function')); }

  function snapshot() {
    const snap = base.snapshot();
    try {
      const st = Game.state || {};
      const day = dayOf(Game);
      const staged = t.accordStageEvents.filter(function (e) { return e.staged; });
      const answered = t.accordAnswerEvents.filter(function (e) { return e.outcome === 'answered'; });
      const answeredLinkIds = {};
      answered.forEach(function (e) { if (e.linkId) answeredLinkIds[e.linkId] = true; });
      let ds = null;
      try { ds = st.answermailDrive ? JSON.parse(JSON.stringify(st.answermailDrive)) : null; } catch (e) { ds = null; err('driveStats-copy', e); }
      snap.accord = {
        pending: st.pendingAccord ? { linkId: st.pendingAccord.linkId || null,
          day: (st.pendingAccord.day | 0) || 0,
          targetName: (function () {
            try {
              const lt = linkTrust(Game, st.pendingAccord.linkId);
              const other = lt && lt.link ? otherOfLink(lt.link) : null;
              return other ? ovName(Game, other) : null;
            } catch (e) { return null; }
          })() } : null,
        pendingDays: st.pendingAccord ? (day - ((st.pendingAccord.day | 0) || 0)) : null,
        stagedCount: staged.length,
        answeredCount: answered.length,
        unansweredStaged: staged.filter(function (e) { return e.linkId && !answeredLinkIds[e.linkId]; }).map(function (e) { return e.linkId; }),
      };
      snap.driveStats = ds;
      snap.driveOn = (typeof process !== 'undefined' && process.env && process.env.ANSWERMAIL_DRIVE === '1');
      snap.driveCalls = (t.wrapCounts || {})._answermailDriveDaily || 0;
    } catch (e) { err('accordanswer-snapshot', e); }
    return snap;
  }

  function uninstall() {
    Object.keys(orig).forEach(function (n) { try { Game[n] = orig[n]; } catch (e) {} });
    try { base.uninstall(); } catch (e) {}
  }
  return { t: t, snapshot: snapshot, uninstall: uninstall, otherVillages: base.otherVillages };
}

module.exports = { install: install, dayOf: dayOf, answerChannel: answerChannel };
