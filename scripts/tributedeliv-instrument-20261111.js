// tributedeliv-instrument-20261111.js — tribute-delivery diag recorder
// (arm sim-tributedeliv-b). Instrument-only: ZERO src/js changes.
//
// Per day it records, for military_tribute:
//   (1) the engine's own ladderCapstoneReady('military_tribute') return
//       {ready, veterans, payable, need, reason} — verbatim;
//   (2) a replication of the DELIVERY gate's own `seen` count from
//       table.js ladderDeliverCapstone: wave-4 log entries, distinct,
//       living, non-scholar, in waveKillLog order — replicating the
//       delivery's isLiving VERBATIM (vid !== scholarId; vpOf exists and
//       !vp.dead; catch -> true; NOTE: no roster check in the delivery's
//       own isLiving, unlike ladder.js countLivingVeterans). Each seen
//       killer also carries an onRoster flag for diagnosis, so a
//       roster-vs-vp.dead divergence is visible without changing the
//       replicated count.
//   (3) whether the scholar is one of the counted veterans;
//   (4) whether a capstone is already delivered.
// It also wraps ladderDeliverCapstone to log EVERY delivery attempt and
// its outcome (the competent policy is expected to make zero attempts —
// the wrap proves that instead of assuming it), and wraps Game.say to
// capture tribute lines for the sense test.
//
// classifyDay(rec, attempts) is pure and shared with the analyzer and
// the proof test, so the classification codes are defined exactly once:
//   DELIVERED, ATTEMPT_REFUSED_<reason>, DELIVERABLE_NO_ATTEMPT,
//   PAYABLE_SHORT, UNCLASSIFIED (must be 0 on judged corpora).
'use strict';

function dayOf(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

// Replicate table.js ladderDeliverCapstone's `seen` selection verbatim.
// Returns { seen: [{by, name, onRoster}], count } — ALL distinct living
// non-scholar wave-4+ killers in log order (the delivery itself breaks
// at 2; the recorder keeps the full list for diagnosis).
function deliverySeen(Game) {
  const scholarId = Game.villagerId;
  const roster = ((Game.state && Game.state.village && Game.state.village.roster) || []);
  const log = (Game.state && Game.state.waveKillLog) || [];
  const seen = [];
  const isLiving = (vid) => {
    if (!vid || vid === scholarId) return false;
    try { const vp = (typeof Game.vpOf === 'function') ? Game.vpOf(vid) : null; return !!(vp && !vp.dead); }
    catch (e) { return true; }
  };
  for (const e of log) {
    if (!e || !e.by || ((e.w | 0) < 4)) continue;
    if (!isLiving(e.by)) continue;
    if (seen.some(function (s) { return s.by === e.by; })) continue;
    let name = null;
    try { name = String(Game.displayName ? Game.displayName(e.by) : e.by); } catch (err) { name = e.by; }
    seen.push({ by: e.by, name: name, onRoster: roster.indexOf(e.by) >= 0 });
  }
  return { seen: seen, count: seen.length };
}

// Pure classification of one ready-day. rec = one daily snapshot,
// attempts = the run's attempt log (filtered to rec.day inside).
// Returns a code string; null when the day is not a ready day.
function classifyDay(rec, attempts) {
  if (!rec || !rec.tribute || !rec.tribute.ready) return null;
  const today = (attempts || []).filter(function (a) { return a && a.day === rec.day; });
  for (const a of today) {
    if (a.result && a.result.ok === true) return 'DELIVERED';
  }
  for (const a of today) {
    if (a.result && a.result.ok === false) {
      return 'ATTEMPT_REFUSED_' + String((a.result && a.result.reason) || 'unknown');
    }
  }
  if ((rec.tribute.payable | 0) >= 2) return 'DELIVERABLE_NO_ATTEMPT';
  if ((rec.tribute.payable | 0) < 2) return 'PAYABLE_SHORT';
  return 'UNCLASSIFIED';
}

function install(Game) {
  const t = { daily: [], attempts: [], tributeSays: [], sayCount: 0, instrumentErrors: [] };
  function err(where, e) {
    t.instrumentErrors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  }
  const wrapped = {};

  // Wrap the delivery entry point: log every attempt + outcome.
  try {
    if (typeof Game.ladderDeliverCapstone === 'function') {
      const orig = Game.ladderDeliverCapstone.bind(Game);
      wrapped.ladderDeliverCapstone = Game.ladderDeliverCapstone;
      Game.ladderDeliverCapstone = function (kind) {
        const d = dayOf(Game);
        let result = null, threw = false;
        try { result = orig(kind); } catch (e) { threw = true; result = { ok: false, reason: 'throw:' + String((e && e.message) || e).slice(0, 80) }; }
        try {
          t.attempts.push({
            day: d, kind: kind,
            result: result ? { ok: !!result.ok, reason: result.reason || null, veterans: result.veterans || null, need: result.need || null } : null,
            threw: threw,
          });
        } catch (e) { err('attempt-record', e); }
        if (threw) throw new Error(String((result && result.reason) || 'ladderDeliverCapstone threw'));
        return result;
      };
    }
  } catch (e) { err('wrap-deliver', e); }

  // Wrap say: capture tribute lines for the sense test.
  try {
    const origSay = Game.say;
    wrapped.say = origSay;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          t.sayCount++;
          if (/tribute/i.test(arg) && t.tributeSays.length < 200) {
            t.tributeSays.push({ day: dayOf(Game), line: String(arg).slice(0, 600) });
          }
        }
      } catch (e) { err('say-wrap', e); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { err('wrap-say', e); }

  function snapshot() {
    const snap = { day: dayOf(Game) };
    try { snap.scholarId = Game.villagerId || null; } catch (e) { snap.scholarId = null; }
    try {
      const r = (typeof Game.ladderCapstoneReady === 'function') ? Game.ladderCapstoneReady('military_tribute') : null;
      snap.tribute = r ? { kind: r.kind || 'military_tribute', ready: !!r.ready, veterans: (r.veterans | 0), payable: (r.payable | 0), need: (r.need | 0), reason: r.reason || null } : null;
    } catch (e) { snap.tribute = null; err('snap-tribute', e); }
    try {
      const ds = deliverySeen(Game);
      snap.deliverySeen = ds;
    } catch (e) { snap.deliverySeen = null; err('snap-seen', e); }
    try {
      snap.ladderVets4 = (typeof Game._ladderLivingVeterans === 'function') ? (Game._ladderLivingVeterans(4) | 0) : null;
    } catch (e) { snap.ladderVets4 = null; err('snap-ladder', e); }
    try {
      const log = (Game.state && Game.state.waveKillLog) || [];
      const sid = Game.villagerId;
      snap.scholarIsVeteran = log.some(function (e) { return e && e.by === sid && ((e.w | 0) >= 4); });
      snap.w4Log = log.filter(function (e) { return e && ((e.w | 0) >= 4); }).map(function (e) {
        return { d: e.d | 0, w: e.w | 0, by: e.by, via: e.via || null, pyrrhic: !!e.pyrrhic };
      });
    } catch (e) { snap.scholarIsVeteran = null; snap.w4Log = null; err('snap-log', e); }
    try { snap.delivered = (typeof Game.ladderCapstoneDelivered === 'function') ? Game.ladderCapstoneDelivered() : null; } catch (e) { snap.delivered = null; }
    t.daily.push(snap);
    return snap;
  }

  function uninstall() {
    Object.keys(wrapped).forEach(function (name) {
      try { Game[name] = wrapped[name]; } catch (e) { err('uninstall-' + name, e); }
    });
  }

  return { t: t, snapshot: snapshot, uninstall: uninstall };
}

module.exports = { install: install, classifyDay: classifyDay, deliverySeen: deliverySeen, dayOf: dayOf };
