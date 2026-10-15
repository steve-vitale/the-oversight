// wintrace — table→win diagnostic instrument (flesh-out loop A ARM 2,
// 2026-10-15, sim-findings #233).
//
// PHASE 1 diagnostic. Env-gated WINTRAZE=1 (default OFF — unset delegates
// to the base policy byte-identically; the proof test's RED phase pins
// that). READ-ONLY: samples table state around the base policy's daily and
// captures finale transcript beats through a Game.say passthrough. It never
// writes game state — the sweep's own control side (unwrapped policy) must
// reproduce traced runs byte-identically on identical seeds.
//
// Attribution chain per run:
//   seat reached -> paths qualified -> path entered -> challenge attempted
//   -> outcome -> win / no-win reason.
// verdict buckets: WIN | never-sat | sat-withdrawn | invitation-no-fire |
// finale-died | deferred-died | reoffer-died | deferred-pending |
// deferral-reoffer-missed | sequence-stalled | resolved-no-win | unknown
//
// The base policies come from feastscale.js (leadfeast/belongfeast, the
// table road per #233). policyForRun() resolves them by POLICY env, like
// the sibling loop's arms.
//
// ZERO src/js changes. This file is scripts-side instrumentation.
'use strict';
const FS = require('./feastscale');

function layerOn() { return process.env.WINTRAZE === '1'; }

function policyForRun() {
  const pid = String(process.env.POLICY || 'belongseek').toLowerCase();
  return pid.indexOf('lead') === 0 ? FS.leadfeast : FS.belongfeast;
}

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

function tableSnap(Game) {
  const s = {
    tableWaiting: false, tableDone: false, arc: 1,
    phase: '', path: '', beat: 0, branch: '', winDeferred: false,
    weakened: 0, seat: '', modalPending: false, modalFrame: '',
    active: false, floorOk: false, answers: 0,
  };
  try {
    const pg = Game.progState ? Game.progState() : {};
    s.tableWaiting = !!pg.tableWaiting; s.tableDone = !!pg.tableDone; s.arc = pg.arc || 1;
  } catch (e) {}
  try {
    const T = Game.tableState ? Game.tableState() : {};
    s.phase = T.phase || ''; s.path = T.path || ''; s.beat = T.beat | 0;
    s.branch = T.branch || ''; s.winDeferred = !!T.winDeferred;
    s.weakened = T.weakened | 0; s.seat = T.seat || '';
  } catch (e) {}
  try {
    const sch = Game.state.scholar || {};
    const tc = sch.tableChoices;
    s.modalPending = !!(tc && tc.options && tc.options.length);
    s.modalFrame = (tc && tc.frame) || '';
  } catch (e) {}
  try { s.active = Game.tableActive ? !!Game.tableActive() : false; } catch (e) {}
  try { s.floorOk = Game.winDayFloorOk ? !!Game.winDayFloorOk() : false; } catch (e) {}
  return s;
}

// Sit-time pricing snapshot: the seat + the earned paths, read once when
// the table first sits. tableEarnedPaths prices all seven; keep id/earned/
// strength/why — "named and priced, never silently hidden" (TABLE.md).
function sitPricing(Game) {
  const out = { seat: 'none', seatDetail: {}, paths: [] };
  try { out.seat = (((typeof Game.tableSeat === 'function') ? Game.tableSeat() : null) || {}).seat || 'none'; } catch (e) {}
  try { out.seatDetail = (((typeof Game.tableSeat === 'function') ? Game.tableSeat() : null) || {}).detail || {}; } catch (e) {}
  try {
    const eps = Game.tableEarnedPaths ? Game.tableEarnedPaths() : [];
    for (const p of eps) out.paths.push({ id: p.id, earned: !!p.earned, strength: p.strength | 0, why: String(p.why || '').slice(0, 160) });
  } catch (e) {}
  return out;
}

function ensureW(Game, ctx) {
  let W = ctx._wintrace;
  if (!W) {
    W = ctx._wintrace = {
      rows: [], beats: [],
      firstWaitingDay: null, sitEpisodes: 0, lastTableDone: false,
      sat: false, sitPricing: null,
      firstPathDay: null, firstPath: '', challengeSeen: false,
      maxBeat: 0, finalsSeen: false, downgradeSeen: false, maxWeakened: 0,
      deferDays: [], pathsEntered: [],
      answersTotal: 0, answersToday: 0,
      modalStreak: 0, maxModalStreak: 0,
    };
  }
  return W;
}

// SENSE-TESTING capture: finale beats through a Game.say passthrough.
// Captured only while the table sequence is live (tableActive) or the line
// is one of the table's set-piece beats. Bounded; text truncated. The
// passthrough returns oSay's result — behavior byte-identical.
function installSayCapture(Game, ctx) {
  if (ctx._wtSayInstalled) return;
  ctx._wtSayInstalled = true;
  const oSay = Game.say.bind(Game);
  Game.say = function (t) {
    try {
      const s = String(t || '');
      let live = false;
      try { live = Game.tableActive ? !!Game.tableActive() : false; } catch (e) {}
      const setPiece = /THE TABLE|THE AUDIT|table is being set|EVERYONE\. SIT\. WATCH|THE TABLE RETURNS|THE TABLE WAITS|Ninety dawns|Seven doors|the Table/.test(s);
      if ((live || setPiece) && ctx._wintrace && ctx._wintrace.beats.length < 1500) {
        ctx._wintrace.beats.push({ day: gday(Game), text: s.slice(0, 280) });
      }
    } catch (e) {}
    return oSay.apply(this, arguments);
  };
}

function sampleDay(Game, ctx, when) {
  const W = ensureW(Game, ctx);
  const day = gday(Game);
  const s = tableSnap(Game);
  // Sit-episode counting: tableDone false->true rising edges. The win-day-
  // floor deferral clears tableDone and the re-offer sets it again — the
  // second sitting is a NEW episode, not the same challenge.
  if (s.tableDone && !W.lastTableDone) {
    W.sitEpisodes++;
    if (!W.sat) {
      W.sat = true;
      W.sitPricing = sitPricing(Game);
    }
  }
  W.lastTableDone = s.tableDone;
  if (s.tableWaiting && W.firstWaitingDay == null) {
    W.firstWaitingDay = day;
    // Invitation-time pricing: if the scene later withdraws (seat none),
    // the sit never happens and sitPricing is never taken — the invitation
    // snapshot is the only record of the priced seat.
    try { W.waitPricing = sitPricing(Game); } catch (e) {}
  }
  if (s.path) {
    if (W.firstPathDay == null) { W.firstPathDay = day; W.firstPath = s.path; }
    if (W.pathsEntered[W.pathsEntered.length - 1] !== s.path) W.pathsEntered.push(s.path);
  }
  if (s.phase === 'challenge') W.challengeSeen = true;
  if (s.phase === 'finals' && !W.finalsSeen) { W.finalsSeen = true; W.finalsDay = day; }
  if (s.phase === 'downgrade') W.downgradeSeen = true;
  if (s.weakened > W.maxWeakened) W.maxWeakened = s.weakened;
  if (s.beat > W.maxBeat) W.maxBeat = s.beat;
  if (s.winDeferred && W.deferDays[W.deferDays.length - 1] !== day) W.deferDays.push(day);
  // Modal streak: pending at the START of the day (the policy drains during
  // daily — a streak means the drain stalled or the day just ended).
  if (when === 'pre') {
    if (s.modalPending) { W.modalStreak++; if (W.modalStreak > W.maxModalStreak) W.maxModalStreak = W.modalStreak; }
    else W.modalStreak = 0;
  }
  if (when === 'post') {
    const a = (ctx.tableAnswers | 0);
    if (a > W.answersTotal) { W.answersToday = a - W.answersTotal; W.answersTotal = a; }
    else W.answersToday = 0;
  }
  W.rows.push(Object.assign({ day, when }, s));
}

// ---------- attribution ----------
function attribute(Game, ctx, endInfo) {
  const W = ctx._wintrace || null;
  const att = {
    traced: !!W, verdict: 'unknown', evidence: [],
    seatFirst: '', pathsCount: 0, pathsQualified: [],
    tableEver: false, sitEver: false, sitEpisodes: 0,
    pathEntered: '', pathsEntered: [], challengeSeen: false, maxBeat: 0,
    finalsSeen: false, downgradeSeen: false, weakened: 0,
    deferDays: [], reofferSeen: false,
    answersTotal: 0, maxModalStreak: 0,
    endDay: (endInfo && endInfo.gameDays) || 0,
    endReason: (endInfo && endInfo.endReason) || '',
    won: !!(endInfo && endInfo.won),
    maxArc: 0, maxRank: 0,
  };
  if (!W) { att.evidence.push('no trace recorded (layer off)'); return att; }
  att.sitEpisodes = W.sitEpisodes;
  att.tableEver = W.rows.some(r => r.tableWaiting) || W.sat;
  att.sitEver = W.sat;
  att.seatFirst = (W.sitPricing && W.sitPricing.seat) || (W.waitPricing && W.waitPricing.seat) || '';
  att.pathsQualified = ((W.sitPricing && W.sitPricing.paths) || []).filter(p => p.earned).map(p => p.id);
  att.pathsCount = att.pathsQualified.length;
  att.pathEntered = W.firstPath; att.pathsEntered = W.pathsEntered.slice();
  att.challengeSeen = W.challengeSeen; att.maxBeat = W.maxBeat;
  att.finalsSeen = W.finalsSeen; att.downgradeSeen = W.downgradeSeen;
  att.weakened = W.maxWeakened; att.deferDays = W.deferDays.slice();
  att.reofferSeen = W.sitEpisodes >= 2;
  att.answersTotal = W.answersTotal; att.maxModalStreak = W.maxModalStreak;
  try { att.maxArc = Math.max.apply(null, W.rows.map(r => r.arc || 1).concat([1])); } catch (e) {}
  // verdict
  const E = att.evidence;
  if (att.won) {
    att.verdict = 'WIN';
    E.push(`path=${att.pathEntered} episodes=${att.sitEpisodes} day=${att.endDay}`);
    return att;
  }
  if (!att.tableEver) {
    att.verdict = 'never-sat';
    E.push(`tableWaiting never set; maxArc=${att.maxArc} day=${att.endDay} end=${att.endReason}`);
    return att;
  }
  if (!att.sitEver) {
    // Invitation fired but the table never sat. Two cases: the scene ran
    // and withdrew aloud (seat none — invitation consumed), or the dawn
    // driver never fired the scene (invitation still pending at end).
    const _last = W.rows.length ? W.rows[W.rows.length - 1] : null;
    const lastW = _last ? _last.tableWaiting : false;
    if (W.firstWaitingDay != null && !lastW) {
      att.verdict = 'sat-withdrawn';
      E.push(`invitation day=${W.firstWaitingDay} consumed, seat=${att.seatFirst || 'none'} — withdrawal beat; end=${att.endReason}`);
    } else {
      att.verdict = 'invitation-no-fire';
      E.push(`firstWaiting day=${W.firstWaitingDay}, invitation still pending at end day=${att.endDay} — dawn driver never fired tableScene; end=${att.endReason}`);
    }
    return att;
  }
  // The table sat at least once; no win.
  const lastRow = W.rows.length ? W.rows[W.rows.length - 1] : null;
  const lastPhase = lastRow ? lastRow.phase : '';
  if (att.deferDays.length) {
    const deferDay = att.deferDays[0];
    if (att.endDay < 90 && !att.reofferSeen) {
      att.verdict = 'deferred-died';
      E.push(`deferred day=${deferDay} (win-day floor); died day=${att.endDay} before re-offer; end=${att.endReason}`);
      return att;
    }
    if (att.reofferSeen && att.endDay < 180) {
      att.verdict = 'reoffer-died';
      E.push(`deferred day=${deferDay}; re-offered (episodes=${att.sitEpisodes}); died day=${att.endDay}; end=${att.endReason}; lastPhase=${lastPhase}`);
      return att;
    }
    if (lastRow && lastRow.winDeferred && att.endDay >= 180) {
      att.verdict = att.endDay >= 90 ? 'deferral-reoffer-missed' : 'deferred-pending';
      E.push(`winDeferred still set at end day=${att.endDay} (floor ${att.endDay >= 90 ? 'met — dawn driver never re-offered' : 'unmet'}); end=${att.endReason}`);
      return att;
    }
  }
  if (lastRow && lastRow.active && /^(challenge|finals|paths|downgrade|conscript|demand-price)$/.test(lastPhase)) {
    // The run ENDED with the finale live — death interrupted the sequence.
    // (Horizon survivors with the sequence open are stalled, not dead —
    // that's the branch below.)
    const runEnded = !/^(survived|horizon)$/.test(att.endReason || '');
    if (runEnded) {
      att.verdict = 'finale-died';
      E.push(`died with finale live: phase=${lastPhase} path=${lastRow.path} beat=${lastRow.beat} branch=${lastRow.branch} day=${att.endDay}; end=${att.endReason}`);
      return att;
    }
  }
  if (att.endDay >= 180 && lastRow && /^(paths|challenge|finals|downgrade|conscript|demand-price)$/.test(lastPhase)) {
    att.verdict = 'sequence-stalled';
    E.push(`180d alive with sequence open: phase=${lastPhase} path=${lastRow.path} modalPending=${lastRow.modalPending} maxModalStreak=${att.maxModalStreak} answers=${att.answersTotal}`);
    return att;
  }
  if (lastRow && lastRow.phase === 'done') {
    att.verdict = 'resolved-no-win';
    E.push('phase done but won=false — engine inconsistency, investigate');
    return att;
  }
  att.verdict = 'unknown';
  E.push(`terminal state unclassified: lastPhase=${lastPhase} episodes=${att.sitEpisodes} defer=${att.deferDays.join(',')} end=${att.endReason} day=${att.endDay}`);
  return att;
}

// ---------- the wrapper ----------
function withWinTrace(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    setup(Game, ctx) {
      if (layerOn()) {
        ensureW(Game, ctx);
        installSayCapture(Game, ctx);
      }
      if (base.setup) return base.setup(Game, ctx);
    },
    upkeep(Game, ctx) { if (base.upkeep) return base.upkeep(Game, ctx); },
    daily(Game, ctx) {
      if (!layerOn()) return base.daily(Game, ctx); // gate off: pure delegation
      try { sampleDay(Game, ctx, 'pre'); } catch (e) {}
      const r = base.daily(Game, ctx);
      try { sampleDay(Game, ctx, 'post'); } catch (e) {}
      return r;
    },
    fight(Game, ctx) { if (base.fight) return base.fight(Game, ctx); return false; },
    contest(Game, ctx) { if (base.contest) return base.contest(Game, ctx); return false; },
  });
}

const leadtracer = withWinTrace(FS.leadfeast, 'leadfeast-wintrace',
  'leadfeast + table→win diagnostic (WINTRAZE=1)');
const belongtracer = withWinTrace(FS.belongfeast, 'belongfeast-wintrace',
  'belongfeast + table→win diagnostic (WINTRAZE=1)');

module.exports = {
  layerOn, policyForRun, withWinTrace, tableSnap, attribute,
  ensureW, sampleDay, installSayCapture,
  leadtracer, belongtracer,
};
