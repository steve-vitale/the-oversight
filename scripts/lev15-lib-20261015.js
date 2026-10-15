'use strict';
// scripts/lev15-lib-20261015.js — succession ×1.5 tribute-leverage census
// (sim-lev15census, 2026-10-15, scale-onramp axis — #323 informer).
//
// READ-ONLY diagnostic instrument. Zero src/js changes. It wraps three
// Game methods — successionCrisis, theirLeaderDied, _resolveRenegotiation —
// plus breakLink, with spies that snapshot one link before/after the call,
// detect the engine's Math.round(tribute * 1.5) leverage application, and
// record a full trail. The originals are called with identical arguments;
// NOTHING is mutated by the instrument itself.
//
// The three leverage sites (hierarchy.js):
//   1579 — successionCrisis: Haven's speaker died, old link (≥21d), Haven is
//          the SUBORDINATE — "Grief is leverage, and they know it." The
//          #323 mechanism: immediate, no beat, no recourse.
//   1657 — theirLeaderDied: the OTHER village's speaker died, Haven is the
//          PRIMARY — Haven installs its own speaker at their table.
//   1757 — _resolveRenegotiation via answerRenegotiation 'wait' (or any
//          unrecognized answer) AND via _renegotiationTick's 7-day expiry:
//          the deferred leverage lands after silence — "Grief became
//          leverage, and they knew it would." The tick calls
//          _resolveRenegotiation DIRECTLY (hierarchy.js), never through
//          answerRenegotiation — so the wrapper must sit on
//          _resolveRenegotiation, which both paths funnel through. The
//          `chosen` arg separates the two: true = 'wait' chosen, false =
//          the 7-day expiry.
//
// Per event the census records: link id, day, call site, role, kind,
// link age, trust before/after, arrears before/after, tribute before/after,
// compounding depth (×1.5s already stacked on this link), young-national
// window flag (event within the realm's first 60 national hold-days), rank
// at event, and the aloud verdict line. Outcome (dissolve / demote / hold /
// paid-off) is resolved per link at run end by linkOutcome():
//   dissolve — the link broke at any point after its first leverage event
//   paid-off — link active, tribute bought back to <= its lowest pre-leverage level
//   demote   — link active, leverage still standing, but the polity it
//              belonged to shrank out of national (rank now < rank at event)
//   hold     — link active, the leverage stands, the polity intact
// Priority: dissolve > paid-off > demote > hold.
//
// Attribution audit: every aloud leverage verdict line
// ("Grief is leverage, and they know it." / "Grief became leverage, and
// they knew it would." / "installs its own at X's table") must pair with a
// same-day wrapped event; unpaired lines count as misses. Plus a
// link-history scan: succession/renegotiation notes mentioning tribute
// leverage with no same-day wrapped event also count as misses.
// Attribution rate = attributed / (attributed + misses); the pre-registered
// bar is ≥ 90%.

var HOME = 'haven';

function gday(Game) {
  try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; }
}
function linksOf(Game) {
  try { return (Game.mshipState() || {}).links || []; } catch (e) { return []; }
}
function findLink(Game, id) {
  var ls = linksOf(Game);
  for (var i = 0; i < ls.length; i++) if (ls[i] && ls[i].id === id) return ls[i];
  return null;
}
function rankOf(Game) {
  try { return (typeof Game.scaleRank === 'function' ? Game.scaleRank() : 'village') || 'village'; }
  catch (e) { return 'village'; }
}
function rankOrder(r) {
  if (r === 'global') return 3;
  if (r === 'national') return 2;
  if (r === 'regional') return 1;
  return 0;
}
// The engine's three aloud leverage verdicts (exact substrings of the
// hierarchy.js say() lines at the three sites).
var VERDICT_RES = [
  /grief is leverage, and they know it/i,
  /grief became leverage, and they knew it would/i,
  /installs its own at .*'s table — the empire's manners/i,
];
function isLeverageVerdict(text) {
  var s = String(text || '');
  for (var i = 0; i < VERDICT_RES.length; i++) if (VERDICT_RES[i].test(s)) return true;
  return false;
}

function snapFields(l) {
  if (!l) return null;
  return {
    id: String(l.id || '?'),
    kind: l.kind || '?',
    primary: l.primary || '?',
    subordinate: l.subordinate || '?',
    role: l.subordinate === HOME ? 'subordinate' : (l.primary === HOME ? 'primary' : 'peer'),
    trust: Math.round(l.trust || 0),
    arrears: Math.round(l.arrears || 0),
    tribute: Math.round(l.tributeKcalPerWeek || 0),
    formedDay: l.day || 0,
    status: l.status || '?',
  };
}

function attachCensus(Game) {
  var census = {
    events: [],        // leverage events with full trails
    depth: {},         // linkId -> ×1.5 applications stacked (compounding)
    sayLeverage: [],   // aloud verdict lines {day, text} (attribution audit)
    breaks: [],        // breakLink captures {day, linkId, reason}
    natFirstDay: null, // first day scaleRank() read national/global
    rankAtDay: {},     // day -> rank (stamped by tick())
    misses: [],        // unpaired verdict lines / history notes
    rankAtEnd: 'village',
    errors: [],        // instrument-internal errors (never thrown into the game)
  };
  var censusErr = function (where, e) {
    try { census.errors.push({ where: where, msg: String((e && e.message) || e).slice(0, 160) }); }
    catch (ee) { /* last resort: the instrument must never throw */ }
  };

  // recordEvent: the shared trail writer — both the linkId-keyed wrappers
  // (successionCrisis, theirLeaderDied) and the link-object-keyed one
  // (_resolveRenegotiation) funnel through here. `after` may be null when
  // the link broke mid-call (dissolution handled by linkOutcome).
  function recordEvent(fname, before, after, b, a) {
    var day = gday(Game);
    var depth = census.depth[before.id] || 0;
    census.depth[before.id] = depth + 1;
    var rank = rankOf(Game);
    var youngNat = census.natFirstDay != null && (day - census.natFirstDay) <= 60;
    var ev = {
      linkId: before.id,
      day: day,
      callSite: fname,
      role: before.role,
      kind: before.kind,
      ageDays: day - (before.formedDay || 0),
      oldLink: (day - (before.formedDay || 0)) >= 21,
      trustBefore: before.trust,
      trustAfter: after ? Math.round(after.trust || 0) : before.trust,
      arrearsBefore: before.arrears,
      arrearsAfter: after ? Math.round(after.arrears || 0) : before.arrears,
      tributeBefore: b,
      tributeAfter: a,
      weeklyHike: a - b,
      depthPrior: depth,
      depthNew: depth + 1,
      rankAtEvent: rank,
      youngNational: youngNat,
      natAgeDays: census.natFirstDay != null ? day - census.natFirstDay : null,
    };
    // Bind the aloud verdict line said on the same day (the trail's voice).
    // The line is already capped at 260 chars at capture — bind it whole.
    for (var i = census.sayLeverage.length - 1; i >= 0; i--) {
      if (census.sayLeverage[i].day === day) {
        ev.verdict = census.sayLeverage[i].text;
        census.sayLeverage[i].paired = true;
        break;
      }
    }
    census.events.push(ev);
  }

  function detectLeverage(fname, linkId, before) {
    if (!before) return;
    var after = findLink(Game, linkId);
    var b = before.tribute, a = after ? Math.round(after.tributeKcalPerWeek || 0) : 0;
    if (!(b > 0)) return;
    if (Math.round(b * 1.5) !== a) return; // not the leverage application
    recordEvent(fname, before, after, b, a);
  }

  // _resolveRenegotiation takes the LINK OBJECT (not the id) — snapshot
  // from arguments[0]. answerRenegotiation is NOT wrapped: it never
  // applies leverage except through _resolveRenegotiation (wrapping both
  // would double-record the 'wait' path).
  var origResolve = Game._resolveRenegotiation;
  if (typeof origResolve === 'function' && !origResolve._lev15) {
    var wResolve = function () {
      var linkArg = arguments.length > 0 ? arguments[0] : null;
      var linkId = linkArg ? String(linkArg.id || '?') : null;
      var chosen = arguments.length > 2 ? !!arguments[2] : false;
      var before = linkArg ? snapFields(linkArg) : null;
      var r = origResolve.apply(this, arguments);
      try {
        if (before && linkId) {
          var after = findLink(Game, linkId);
          var b = before.tribute, a = after ? Math.round(after.tributeKcalPerWeek || 0) : 0;
          if (b > 0 && Math.round(b * 1.5) === a) {
            recordEvent('renegotiation:' + (chosen ? 'wait-chosen' : 'expiry-7d'), before, after, b, a);
          }
        }
      } catch (e) { censusErr('detect:_resolveRenegotiation', e); }
      return r;
    };
    wResolve._lev15 = true;
    Game._resolveRenegotiation = wResolve;
  }

  ['successionCrisis', 'theirLeaderDied'].forEach(function (fname) {
    var orig = Game[fname];
    if (typeof orig !== 'function' || orig._lev15) return;
    var wrapped = function () {
      var linkId = arguments.length > 0 ? arguments[0] : null;
      var before = linkId != null ? snapFields(findLink(Game, linkId)) : null;
      var r = orig.apply(this, arguments);
      try { detectLeverage(fname, linkId, before); } catch (e) { censusErr('detect:' + fname, e); }
      return r;
    };
    wrapped._lev15 = true;
    Game[fname] = wrapped;
  });

  // breakLink: dissolution-day capture for outcomes (read-only record).
  var origBreak = Game.breakLink;
  if (typeof origBreak === 'function' && !origBreak._lev15) {
    var wBreak = function () {
      var linkId = arguments.length > 0 ? String(arguments[0] || '?') : '?';
      var reason = arguments.length > 1 ? String(arguments[1] || '') : '';
      var r = origBreak.apply(this, arguments);
      try { census.breaks.push({ day: gday(Game), linkId: linkId, reason: reason }); } catch (e) { censusErr('breaks-push', e); }
      return r;
    };
    wBreak._lev15 = true;
    Game.breakLink = wBreak;
  }

  // Aloud verdict capture: wrap say() to record leverage verdict lines
  // (also forwards to any prior say wrapper — e.g. attachBeats — via the
  // existing Game.say at wrap time).
  var origSay = Game.say ? Game.say.bind(Game) : null;
  Game.say = function (msg) {
    try {
      var s = String((msg && (msg.text || msg.msg || msg.message)) || msg || '')
        .replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');
      if (isLeverageVerdict(s)) census.sayLeverage.push({ day: gday(Game), text: s.slice(0, 260), paired: false });
    } catch (e) { censusErr('say-wrap', e); }
    return origSay ? origSay(msg) : msg;
  };

  // tick: stamp rank daily (drives the young-national window + rank at end).
  census.tick = function () {
    try {
      var day = gday(Game), r = rankOf(Game);
      census.rankAtDay[day] = r;
      census.rankAtEnd = r;
      if ((r === 'national' || r === 'global') && census.natFirstDay == null) census.natFirstDay = day;
    } catch (e) { censusErr('tick', e); }
  };

  return census;
}

// attributionAudit(census, Game): pairs verdict lines and link-history
// leverage notes against wrapped events. Returns { attributed, misses,
// rate }. MUST be called after the run.
function attributionAudit(census, Game) {
  var misses = [];
  var days = {};
  census.events.forEach(function (e) { days[e.day] = true; });
  census.sayLeverage.forEach(function (s) {
    if (!days[s.day]) misses.push({ type: 'unpaired-verdict', day: s.day, text: s.text.slice(0, 120) });
  });
  var ls = linksOf(Game);
  for (var i = 0; i < ls.length; i++) {
    var l = ls[i];
    var hist = l.history || [];
    for (var j = 0; j < hist.length; j++) {
      var h = hist[j] || {};
      var txt = String(h.text || '');
      if ((/tribute up to|grief.*leverage|leverage.*landed/i.test(txt)) &&
          (h.kind === 'succession' || h.kind === 'renegotiation')) {
        if (!days[h.day]) misses.push({ type: 'unpaired-history', day: h.day, link: l.id, text: txt.slice(0, 120) });
      }
    }
  }
  census.misses = misses;
  var attributed = census.events.length;
  var rate = attributed + misses.length === 0 ? 1 : attributed / (attributed + misses.length);
  return { attributed: attributed, misses: misses, rate: rate };
}

// linkOutcome(census, Game, linkId): the four-outcome taxonomy, resolved
// per link at run end. Priority: dissolve > paid-off > demote > hold.
function linkOutcome(census, Game, linkId) {
  var evs = census.events.filter(function (e) { return e.linkId === linkId; });
  if (!evs.length) return { outcome: 'none', linkId: linkId };
  var link = findLink(Game, linkId);
  var alive = !!(link && link.status === 'active');
  var brk = null;
  for (var i = 0; i < census.breaks.length; i++) {
    if (census.breaks[i].linkId === linkId) { brk = census.breaks[i]; break; }
  }
  var lowestBefore = Math.min.apply(null, evs.map(function (e) { return e.tributeBefore; }));
  var highestAfter = Math.max.apply(null, evs.map(function (e) { return e.tributeAfter; }));
  var finalTribute = alive ? Math.round(link.tributeKcalPerWeek || 0) : 0;
  var finalArrears = alive ? Math.round(link.arrears || 0) : null;
  var finalTrust = alive ? Math.round(link.trust || 0) : null;
  var evMaxDepth = Math.max.apply(null, evs.map(function (e) { return e.depthNew; }));
  var demoted = evs.some(function (e) { return rankOrder(e.rankAtEvent) > rankOrder(census.rankAtEnd); });
  var base = {
    linkId: linkId,
    nEvents: evs.length,
    role: evs[0].role,
    kind: evs[0].kind,
    maxDepth: evMaxDepth,
    lowestBefore: lowestBefore,
    highestAfter: highestAfter,
    finalTribute: finalTribute,
    finalArrears: finalArrears,
    finalTrust: finalTrust,
    rankAtEnd: census.rankAtEnd,
  };
  if (!alive) return Object.assign(base, { outcome: 'dissolve', dissolveDay: brk ? brk.day : null, breakReason: brk ? brk.reason : 'unknown' });
  if (finalTribute <= lowestBefore) return Object.assign(base, { outcome: 'paid-off' });
  if (demoted) return Object.assign(base, { outcome: 'demote' });
  return Object.assign(base, { outcome: 'hold' });
}

module.exports = { attachCensus: attachCensus, attributionAudit: attributionAudit, linkOutcome: linkOutcome, rankOrder: rankOrder };
