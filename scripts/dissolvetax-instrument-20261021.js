#!/usr/bin/env node
// dissolvetax-instrument-20261021.js — realm-dissolution attribution instrument
// for sim-dissolvetax (flesh-out loop, run fleshout-20261021T0915Z).
//
// DIAGNOSTIC ONLY. Pure reads, zero game-state writes, zero RNG draws,
// zero src/js changes, zero policy changes. Attaches to the standard sim
// harness on the VGEAR=1 winning substrate (scripts/policies/vgearconfirm.js
// armedFor, FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
// VGEAR=1).
//
// What it records (per run, in a closure-local K object — never Game.state,
// never the save stream):
//   1. DAILY LINK/REALM CENSUS (dawn, in the Game.sleep wrap AFTER the
//      engine's own call returns — hierarchyDaily/_checkNational already
//      ran): per-link ints (other village id, kind, dir, status, trust,
//      arrears, formed age, tribute/week, conquered, kept-days ints), the
//      foreign-polity table (primary, sub ids), nationalLive, nationalShape,
//      and the ENGINE'S OWN polity evaluation (Game.polityOf('haven'),
//      Game._belongPolity(), Game._covenantPolity(), Game._tradePolity())
//      recorded daily — the analyzer never re-implements polity math, it
//      reads the engine's verdicts. The one engine call that can create
//      state (foreignPolities()' ||= on a missing key) runs under a
//      snapshot/restore guard: if the key was absent and is still an empty
//      array after evaluation, it is deleted again — no observable write.
//      DET-gate (E1) proves byte-identical trajectories.
//   2. DISSOLUTION ATTRIBUTION: on the nationalLive true->false dawn edge,
//      attribute to exactly one taxonomy class (below). The analyzer works
//      on the census + event records only; attribution logic is exported as
//      attributeDissolution(K, edge) so proof fixtures exercise it directly.
//   3. breakLink events (post-call, engine's post-break state): d, how,
//      other, kind, trust, arrears, keptDays (mirror of _linkNeglected math),
//      nationalLive — the engine's verdict, read only.
//   4. Village-agency rumors (queueVillageEventRumor wrap, call-through):
//      schism/succession/famine events on foreign villages — context for the
//      schism taxonomy class.
//   5. Dissolution say-lines (fixed regex, deterministic): the sense corpus.
//
// TAXONOMY (contract, per the arm brief):
//   primary-foreign-collapse — belong road: Haven's own sub-link in good
//     standing (trust>=50, arrears 0, link>=14d) at loss, but the primary's
//     foreign realm fails the >=4 size check.
//   sub-drift — no-break trust erosion below the polity bar: a Haven-primary
//     sub fell below the trust-40 seasoned bar (lead/conquest), Haven's own
//     sub-link below trust-50 (belong), or peer seasoned count below 3
//     (covenant/trade) with no break in the 28d window. Sub-class note
//     'break-neglect' when the drift snapped via succession (leader death +
//     trust<20 + 14d no upkeep) — same mechanism, snapped aloud.
//   arrears-disqualify — belong road: Haven's own sub-link carries arrears>0
//     at loss (the good-standing bar; arrears alone disqualifies).
//   raid-burn — a raid destroyed a realm member's link in the 28d window.
//     HONEST SCOPE NOTE: no breakLink 'how' in the engine is raid-related
//     and no mechanic destroys villages by raid; this class is reachable
//     only via raid-destruction say-lines naming a realm member. Expected 0.
//   schism — a schism rumor hit a realm member in the 28d window AND the
//     mechanical attribution is otherwise other/unexplained; reported with
//     the evidence note 'mechanism unconfirmed in engine' — schisms keep the
//     parent village id, so they cannot shrink a polity by themselves.
//   other — residual, always with a one-line evidence note (break-revolt and
//     break-policy seceded/released/walked/gambit land here with sub-notes).
//   unexplained — instrument failure: no component delta and no context;
//     must be 0 in the sweep; the fixture gate demands the reason be honest.
//
// BREAK mapping (documented, not hidden): break-neglect -> sub-drift
// (neglect IS the drift, snapped); break-revolt -> other (conquest force
// dynamics); seceded/released/walked/gambit -> other (policy/covenant answers).
//
// HONESTY GATES: attribution completeness 100% / unexplained 0 /
// instrumentErrors 0 on the sweep; honesty cross-check >=99% on a 3-run
// sample (recomputed by hand from raw census in the evidence file).
//
// Usage (same env as the sweep):
//   const DT = require('./dissolvetax-instrument-20261021');
//   const { K, uninstall } = DT.install(Game);
//   ... runDays ...
//   uninstall();
//   DT.attributeDissolution(K, edge) // per lost edge
'use strict';

var TAXONOMY = [
  'primary-foreign-collapse',
  'sub-drift',
  'arrears-disqualify',
  'raid-burn',
  'schism',
  'other',
  'unexplained',
];

function dayOf(Game) {
  try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; }
}

function otherOf(link) {
  try {
    if (link.kind === 'covenant' || link.kind === 'trade') {
      return (link.a === 'haven' ? link.b : link.a) || '?';
    }
    return (link.subordinate === 'haven' ? link.primary : link.subordinate) || '?';
  } catch (e) { return '?'; }
}

function dirOf(link) {
  try {
    if (link.kind === 'covenant' || link.kind === 'trade') return 2;
    if (link.subordinate === 'haven') return 0; // Haven is the subordinate
    if (link.primary === 'haven') return 1;     // Haven is the primary
    return 2;
  } catch (e) { return 2; }
}

// mirror of hierarchy.js _linkNeglected's kept-day math (read-only)
function keptDaysAt(day, link) {
  try {
    var lastKept = (link.lastKeptDay != null) ? link.lastKeptDay : (link.day || 0);
    var tw = link.tributePaidWeek || -1;
    if (tw >= 0) lastKept = Math.max(lastKept, tw * 7);
    return day - lastKept;
  } catch (e) { return -1; }
}

// The engine's own polity evaluation, daily. Pure reads. The one engine call
// that can create state (foreignPolities()' ||= when the key is absent) runs
// under snapshot/restore: absent-before + still-empty-after => delete again.
// No observable write; DET-gate proves it.
function engineShapes(Game) {
  var out = { lead: false, belong: false, covenant: false, trade: false, error: null };
  try {
    var st = Game.state || {};
    var had = Object.prototype.hasOwnProperty.call(st, 'foreignPolities');
    try {
      if (typeof Game.polityOf === 'function') out.lead = !!Game.polityOf('haven');
      if (typeof Game._belongPolity === 'function') out.belong = !!Game._belongPolity();
      if (typeof Game._covenantPolity === 'function') out.covenant = !!Game._covenantPolity();
      if (typeof Game._tradePolity === 'function') out.trade = !!Game._tradePolity();
    } catch (e) { out.error = String((e && e.message) || e); }
    if (!had && st.foreignPolities && st.foreignPolities.length === 0) {
      try { delete st.foreignPolities; } catch (e2) { /* never */ }
    }
  } catch (e) { out.error = String((e && e.message) || e); }
  return out;
}

function censusLinks(Game, day) {
  var rows = [];
  try {
    var ls = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
    for (var i = 0; i < ls.length; i++) {
      var l = ls[i];
      if (!l) continue;
      rows.push({
        other: String(otherOf(l)),
        kind: l.kind || 'vassal',
        dir: dirOf(l),
        st: l.status === 'active' ? 0 : 1,
        trust: l.trust | 0,
        arr: Math.round(l.arrears || 0),
        age: day - (l.day || 0),
        tkpw: Math.round(l.tributeKcalPerWeek || 0),
        conq: l.conquered ? 1 : 0,
        tpw: (l.tributePaidWeek == null ? -1 : l.tributePaidWeek) | 0,
        tdw: (l.tendedWeek == null ? -1 : l.tendedWeek) | 0,
        lkd: (l.lastKeptDay == null ? -1 : l.lastKeptDay) | 0,
        mercy: (l.mercyUntil == null ? -1 : l.mercyUntil) | 0,
      });
    }
  } catch (e) { /* census row keeps going with what it has */ }
  return rows;
}

function censusForeign(Game) {
  var rows = [];
  try {
    var fps = (Game.state || {}).foreignPolities || [];
    for (var i = 0; i < fps.length; i++) {
      var f = fps[i];
      if (!f) continue;
      var subs = (f.subs || []).slice();
      rows.push({ primary: String(f.primary || '?'), nsubs: subs.length, subs: subs.map(String) });
    }
  } catch (e) { /* as above */ }
  return rows;
}

function censusVillages(Game) {
  var rows = [];
  try {
    var oV = (Game.state || {}).otherVillages || [];
    for (var i = 0; i < oV.length; i++) {
      var v = oV[i];
      if (v && v.id) rows.push({ id: String(v.id), name: String(v.name || v.id) });
    }
  } catch (e) { /* as above */ }
  return rows;
}

// fixed dissolution-narration regex (deterministic line selection) — loop-B's
// set plus the foreign-polity binding lines (primary-foreign-collapse sense
// corpus) plus raid-destruction candidates (raid-burn scope probe).
var DISSOLVE_RE = /realm came apart|missing tribute|Tribute short|Arrears|neglected link snaps|tribute arrives light|Nothing comes from|their fields are as empty|threw off.*yoke|tribute comes up thin|walks out of the pantry toward|Haven sends .* kcal of grain|The pantry is bare|installs their own speaker|pressed tribute down|The yoke is thrown off|bound itself to|have bound together|raid[^.]{0,60}burn|burn[^.]{0,60}raid|torches|razed/i;

// The dawn sensor body, extracted so constructed cases exercise the exact
// logic the sleep wrap runs (pure reads; no RNG; no state writes).
function dawnDissolveSensor(Game, K) {
  var d = dayOf(Game);
  var st = Game.state || {};
  var nat = !!st.nationalLive;
  var shape = st.nationalShape || '';
  var shapes = engineShapes(Game);
  var fps = censusForeign(Game);
  var links = censusLinks(Game, d);
  var villages = censusVillages(Game);
  K.census.push({ d: d, nat: nat, shape: shape, shapes: shapes, links: links, fps: fps, villages: villages });
  if (K._prevNat && !nat) {
    // the _checkNational dissolution path fired since the last dawn
    K.natEvents.push({
      d: d, kind: 'lost', shape: shape,
      natDay: st.nationalDay || 0,
      links: links, fps: fps, villages: villages, shapes: shapes,
    });
  } else if (!K._prevNat && nat) {
    K.natEvents.push({
      d: d, kind: 'sat', shape: shape, natDay: st.nationalDay || 0,
      fps: fps, villages: villages,
    });
  }
  K._prevNat = nat;
}

function pushErr(K, msg) {
  try { K.instrumentErrors.push(String(msg).slice(0, 200)); } catch (e) { /* never */ }
}

function install(Game) {
  var K = {
    census: [],        // daily: {d, nat, shape, shapes, links, fps, villages}
    breaks: [],        // breakLink: {d, how, other, kind, trust, arr, kept, natLive}
    rumors: [],        // queueVillageEventRumor: {d, village, kind, cause}
    natEvents: [],     // {d, kind:'sat'|'lost', shape, ...}
    dissolveLines: [], // {d, line}
    instrumentErrors: [],
    _prevNat: false,
  };
  var wrapped = [];

  function wrap(name, fn) {
    try {
      var o = Game[name];
      if (typeof o !== 'function') return;
      var bound = o.bind(Game);
      Game[name] = fn(bound);
      wrapped.push([name, bound]);
    } catch (e) { pushErr(K, 'install:' + name + ': ' + String((e && e.message) || e)); }
  }

  // 1+2. dawn census + national edges (sleep wrap, AFTER the engine's call).
  wrap('sleep', function (oSleep) {
    return function () {
      var r = oSleep.apply(this, arguments);
      try { dawnDissolveSensor(Game, K); } catch (e) { pushErr(K, 'sensor: ' + String((e && e.message) || e)); }
      return r;
    };
  });

  // 3. break attribution — the engine's post-break state, read only.
  wrap('breakLink', function (oBreak) {
    return function (linkId, how) {
      var r = oBreak.apply(this, arguments);
      if (r === null || r === undefined) return r; // no-op (dead link) — not a break
      try {
        var snap = null;
        try {
          var ls = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
          for (var i = 0; i < ls.length; i++) if (ls[i] && ls[i].id === linkId) { snap = ls[i]; break; }
        } catch (e) { /* never */ }
        var st = Game.state || {};
        K.breaks.push({
          d: dayOf(Game),
          how: String(how || 'severed'),
          other: snap ? String(otherOf(snap)) : '?',
          kind: snap ? (snap.kind || 'vassal') : '?',
          trust: snap ? (snap.trust | 0) : -1,
          arr: snap ? Math.round(snap.arrears || 0) : -1,
          kept: snap ? keptDaysAt(dayOf(Game), snap) : -1,
          natLive: !!st.nationalLive,
        });
      } catch (e) { pushErr(K, 'break: ' + String((e && e.message) || e)); }
      return r;
    };
  });

  // 4. village-agency rumors (schism/succession/famine context).
  wrap('queueVillageEventRumor', function (oRumor) {
    return function (villageId, kind, opts) {
      var r = oRumor.apply(this, arguments);
      try {
        K.rumors.push({
          d: dayOf(Game),
          village: String(villageId || '?'),
          kind: String(kind || '?'),
          cause: String((opts && opts.cause) || ''),
        });
      } catch (e) { pushErr(K, 'rumor: ' + String((e && e.message) || e)); }
      return r;
    };
  });

  // 5. dissolution say-lines (fixed regex).
  wrap('say', function (oSay) {
    return function (msg) {
      try {
        var s = String(msg || '');
        if (DISSOLVE_RE.test(s)) K.dissolveLines.push({ d: dayOf(Game), line: s });
      } catch (e) { /* never */ }
      return oSay.apply(this, arguments);
    };
  });

  function uninstall() {
    for (var i = wrapped.length - 1; i >= 0; i--) {
      try { Game[wrapped[i][0]] = wrapped[i][1]; } catch (e) { /* never */ }
    }
    wrapped.length = 0;
  }

  return { K: K, uninstall: uninstall };
}

// ---------- analyzer ----------

function lastNatRow(K, edgeDay) {
  var best = null;
  for (var i = 0; i < K.census.length; i++) {
    var c = K.census[i];
    if (c.d < edgeDay && c.nat) best = c;
  }
  return best;
}

function lastSatBefore(K, edgeDay) {
  var best = null;
  for (var i = 0; i < K.natEvents.length; i++) {
    var e = K.natEvents[i];
    if (e.kind === 'sat' && e.d < edgeDay) best = e;
  }
  return best;
}

function firstLossRow(K, edgeDay) {
  for (var i = 0; i < K.census.length; i++) {
    if (K.census[i].d === edgeDay) return K.census[i];
  }
  return null;
}

function breaksInWindow(K, from, to) {
  return K.breaks.filter(function (b) { return b.d >= from && b.d <= to; });
}

function linkByOther(links, other) {
  for (var i = 0; i < links.length; i++) if (links[i].other === other) return links[i];
  return null;
}

function trustTrail(K, other, from, to) {
  var out = [];
  for (var i = 0; i < K.census.length; i++) {
    var c = K.census[i];
    if (c.d < from || c.d > to) continue;
    for (var j = 0; j < c.links.length; j++) {
      var l = c.links[j];
      if (l.other === other) { out.push(c.d + ':' + l.trust); break; }
    }
  }
  return out.join(' ');
}

function memberNames(K, row) {
  var ids = {};
  for (var i = 0; i < row.links.length; i++) {
    var l = row.links[i];
    if (l.dir === 1 || l.dir === 0) ids[l.other] = 1;
    else if (l.dir === 2) ids[l.other] = 1;
  }
  for (var f = 0; f < row.fps.length; f++) {
    ids[row.fps[f].primary] = 1;
    var ss = row.fps[f].subs || [];
    for (var s = 0; s < ss.length; s++) ids[ss[s]] = 1;
  }
  var names = {};
  for (var v = 0; v < (row.villages || []).length; v++) names[row.villages[v].id] = row.villages[v].name;
  return { ids: ids, names: names };
}

function nameOf(mn, id) { return mn.names[id] || String(id); }

function mkRes(cls, sub, evidence) {
  return { class: cls, sub: sub || null, evidence: String(evidence || '') };
}

// attributeDissolution(K, edge) — edge = {d, kind:'lost', shape}.
// Exactly one taxonomy class, always with an evidence note.
function attributeDissolution(K, edge) {
  var L = edge.d;
  var W0 = L - 28;
  var sat = lastSatBefore(K, L);
  var P = lastNatRow(K, L);
  if (!P) {
    return mkRes('unexplained', null, 'no nat-true census row before loss d' + L + ' — instrument never saw the realm');
  }
  var Q = firstLossRow(K, L); // the loss-dawn row: the state _checkNational decided on
  var shape = (sat && sat.shape) || P.shape || 'lead';
  var mn = memberNames(K, P);
  var winBreaks = breaksInWindow(K, W0, L);

  // cross-cutting context: schism/raid on realm members in-window
  var schismCtx = [];
  for (var ri = 0; ri < K.rumors.length; ri++) {
    var ru = K.rumors[ri];
    if (ru.d >= W0 && ru.d <= L && ru.kind === 'schism' && mn.ids[ru.village]) {
      schismCtx.push(nameOf(mn, ru.village) + ' d' + ru.d + ' (' + (ru.cause || 'unknown') + ')');
    }
  }
  var raidCtx = [];
  var raidRe = /(raid[^.]{0,60}burn|burn[^.]{0,60}raid|torches|razed)/i;
  for (var li = 0; li < K.dissolveLines.length; li++) {
    var dl = K.dissolveLines[li];
    if (dl.d >= W0 && dl.d <= L && raidRe.test(dl.line)) {
      for (var id in mn.ids) {
        if (dl.line.indexOf(nameOf(mn, id)) >= 0) { raidCtx.push(nameOf(mn, id) + ' d' + dl.d); break; }
      }
    }
  }

  function withCtx(res) {
    var bits = [];
    if (schismCtx.length) bits.push('schism-ctx: ' + schismCtx.join('; '));
    if (raidCtx.length) bits.push('raid-ctx: ' + raidCtx.join('; '));
    if (bits.length) res.evidence += ' | ' + bits.join(' | ');
    return res;
  }

  // ---------- BELONG road ----------
  // _checkNational decides on the loss-dawn state (Q); the cause is in the
  // P->Q delta (it runs daily — had P-state failed, the loss would have
  // fired a dawn earlier). Q is the engine's verdict; P gives the delta.
  if (shape === 'belong') {
    // own link = the one _belongPolity() would have qualified: first dir-0
    // link (hierarchyState order, preserved by the census) whose primary had
    // a >=4-fire foreign realm at the sat edge.
    var satFps = (sat && sat.fps) || [];
    function satSize(other) {
      for (var q = 0; q < satFps.length; q++) {
        if (satFps[q].primary === other) return 2 + satFps[q].nsubs;
      }
      return 0;
    }
    var own = null;
    for (var oi = 0; oi < P.links.length; oi++) {
      var cand = P.links[oi];
      if (cand.dir !== 0 || cand.st !== 0) continue;
      if (!own) own = cand; // fallback: first sub-link
      if (satSize(cand.other) >= 4) { own = cand; break; }
    }
    var ownQ = own && Q ? linkByOther(Q.links, own.other) : null;
    if (!own || own.st !== 0 || (ownQ && ownQ.st !== 0)) {
      var ob = own ? winBreaks.filter(function (b) { return b.other === own.other; }) : [];
      if (ob.length) return withCtx(mkRes('other', breakSub(ob[0]), 'belong: own sub-link inactive at loss after break ' + ob[0].how + ' d' + ob[0].d));
      return withCtx(mkRes('other', null, 'belong: own sub-link missing/inactive at loss, no break in 28d window'));
    }
    var arrP = own.arr, arrQ = ownQ ? ownQ.arr : own.arr;
    var trustP = own.trust, trustQ = ownQ ? ownQ.trust : own.trust;
    if (arrQ > 0) {
      return withCtx(mkRes('arrears-disqualify', null,
        'belong: own sub-link to ' + nameOf(mn, own.other) + ' arrears ' + arrP.toLocaleString() + '->' + arrQ.toLocaleString() + ' kcal across the loss (trust ' + trustP + '->' + trustQ + ', age ' + own.age + 'd)'));
    }
    if (trustQ < 50) {
      return withCtx(mkRes('sub-drift', null,
        'belong: own sub-link to ' + nameOf(mn, own.other) + ' trust ' + trustP + '->' + trustQ + ' < 50 across the loss (arr 0, age ' + own.age + 'd); trail: ' + trustTrail(K, own.other, W0, P.d)));
    }
    // own link in good standing — the foreign realm is the only fail point
    var fpQ = null;
    var fpsQ = Q ? Q.fps : P.fps;
    for (var fi = 0; fi < fpsQ.length; fi++) if (fpsQ[fi].primary === own.other) { fpQ = fpsQ[fi]; break; }
    var satFp = (sat && sat.fp) || null;
    if (!fpQ) {
      return withCtx(mkRes('primary-foreign-collapse', null,
        'belong: own link good (trust ' + trustQ + ', arr 0, age ' + own.age + 'd) but no foreign-polity record for primary ' + nameOf(mn, own.other) + ' at loss'));
    }
    var sizeQ = 2 + fpQ.nsubs;
    if (sizeQ < 4) {
      var satN = satFp ? (2 + satFp.nsubs) : null;
      return withCtx(mkRes('primary-foreign-collapse', null,
        'belong: own link good (trust ' + trustQ + ', arr 0, age ' + own.age + 'd); primary ' + nameOf(mn, own.other) + "'s foreign realm " +
        (satN != null ? satN + '->' : '') + sizeQ + ' fires (subs ' +
        (satFp ? satFp.subs.join(',') : '?') + ' -> ' + fpQ.subs.join(',') + ')'));
    }
    // good link AND good foreign realm — the polity should not have failed
    return withCtx(mkRes('other', null,
      'belong: own link good AND foreign realm ' + sizeQ + ' fires at loss but the realm dissolved — honest mystery'));
  }

  // ---------- LEAD / CONQUEST road ----------
  if (shape === 'lead' || shape === 'conquest') {
    var subs = P.links.filter(function (l) { return l.dir === 1 && l.st === 0; });
    var realmOthers = {};
    for (var si = 0; si < subs.length; si++) realmOthers[subs[si].other] = 1;
    for (var bi = 0; bi < winBreaks.length; bi++) {
      var b = winBreaks[bi];
      if (!realmOthers[b.other]) continue;
      var bs = breakSub(b);
      if (bs === 'break-neglect') {
        return withCtx(mkRes('sub-drift', 'break-neglect',
          shape + ': ' + nameOf(mn, b.other) + ' snapped via succession d' + b.d + ' (trust ' + b.trust + ' < 20, kept ' + b.kept + 'd >= 14 — neglect snap)'));
      }
      return withCtx(mkRes('other', bs,
        shape + ': ' + nameOf(mn, b.other) + ' broke d' + b.d + ' how=' + b.how + ' (trust ' + b.trust + ', arr ' + b.arr + ', kept ' + b.kept + 'd)'));
    }
    // no break: who sits below the trust-40 seasoned bar at the loss dawn,
    // and did they cross in the final day(s)?
    var qLinks = Q ? Q.links : P.links;
    var crossed = [];
    for (var qi = 0; qi < qLinks.length; qi++) {
      var ql = qLinks[qi];
      if (ql.dir !== 1 || ql.st !== 0 || ql.age < 30 || ql.trust >= 40) continue;
      var pl = linkByOther(P.links, ql.other);
      if (pl && pl.trust >= 40) crossed.push({ other: ql.other, from: pl.trust, to: ql.trust, age: ql.age });
    }
    if (crossed.length) {
      var c0 = crossed[0];
      return withCtx(mkRes('sub-drift', null,
        shape + ': ' + nameOf(mn, c0.other) + ' trust ' + c0.from + '->' + c0.to + ' < 40 across the loss (age ' + c0.age + 'd, no break); trail: ' + trustTrail(K, c0.other, W0, P.d)));
    }
    var drifters = subs.filter(function (l) { return l.age >= 30 && l.trust < 40; });
    if (drifters.length) {
      var dl0 = drifters[0];
      return withCtx(mkRes('sub-drift', null,
        shape + ': ' + nameOf(mn, dl0.other) + ' trust ' + dl0.trust + ' < 40 at d' + P.d + ' (age ' + dl0.age + 'd, no break); trail: ' + trustTrail(K, dl0.other, W0, P.d)));
    }
    var inactive = P.links.filter(function (l) { return l.dir === 1 && l.st !== 0; });
    if (inactive.length) {
      return withCtx(mkRes('other', null,
        shape + ': ' + nameOf(mn, inactive[0].other) + ' link inactive at d' + P.d + ' with no break event in the 28d window'));
    }
    // cross-cutting: schism/raid become primary only over a mechanical void
    if (schismCtx.length) return mkRes('schism', null, 'no mechanical delta on ' + shape + ' road; schism in-window: ' + schismCtx.join('; ') + ' (mechanism unconfirmed in engine)');
    if (raidCtx.length) return mkRes('raid-burn', null, 'no mechanical delta on ' + shape + ' road; raid-destruction line in-window: ' + raidCtx.join('; '));
    return mkRes('unexplained', null,
      'no polity-component delta between d' + W0 + ' and loss d' + L + ' (' + subs.length + ' seasoned subs, all trust>=40, no breaks, no rumors, no raid lines) — honest instrument gap');
  }

  // ---------- COVENANT / TRADE road ----------
  if (shape === 'covenant' || shape === 'trade') {
    var peers = P.links.filter(function (l) { return l.dir === 2 && l.kind === shape && l.st === 0; });
    var peerOthers = {};
    for (var pi = 0; pi < peers.length; pi++) peerOthers[peers[pi].other] = 1;
    for (var bj = 0; bj < winBreaks.length; bj++) {
      var b2 = winBreaks[bj];
      if (!peerOthers[b2.other]) continue;
      return withCtx(mkRes('other', breakSub(b2),
        shape + ': peer ' + nameOf(mn, b2.other) + ' broke d' + b2.d + ' how=' + b2.how + ' (trust ' + b2.trust + ')'));
    }
    var qPeers = (Q ? Q.links : P.links).filter(function (l) { return l.dir === 2 && l.kind === shape && l.st === 0; });
    var seasonedQ = qPeers.filter(function (l) { return l.age >= 30 && l.trust >= 40; });
    var seasonedP = peers.filter(function (l) { return l.age >= 30 && l.trust >= 40; });
    if (seasonedQ.length < 3) {
      var cold = qPeers.filter(function (l) { return !(l.age >= 30 && l.trust >= 40); })[0];
      return withCtx(mkRes('sub-drift', null,
        shape + ': seasoned peers ' + seasonedP.length + '->' + seasonedQ.length + '/3 across the loss' + (cold ? ' (' + nameOf(mn, cold.other) + ' trust ' + cold.trust + ', age ' + cold.age + 'd)' : '') + ', no break'));
    }
    if (schismCtx.length) return mkRes('schism', null, 'no mechanical delta on ' + shape + ' road; schism in-window: ' + schismCtx.join('; ') + ' (mechanism unconfirmed in engine)');
    if (raidCtx.length) return mkRes('raid-burn', null, 'no mechanical delta on ' + shape + ' road; raid-destruction line in-window: ' + raidCtx.join('; '));
    return mkRes('unexplained', null, 'no polity-component delta on ' + shape + ' road before loss d' + L + ' — honest instrument gap');
  }

  return mkRes('unexplained', null, 'unknown sat shape ' + JSON.stringify(shape) + ' — cannot map components');
}

function breakSub(b) {
  if (b.how === 'succession' && b.trust < 20 && b.kept >= 14) return 'break-neglect';
  if (b.how === 'revolt') return 'break-revolt';
  return 'break-policy';
}

module.exports = {
  TAXONOMY: TAXONOMY,
  install: install, // returns {K, uninstall}
  dawnDissolveSensor: dawnDissolveSensor,
  attributeDissolution: attributeDissolution,
  engineShapes: engineShapes,
  keptDaysAt: keptDaysAt,
  DISSOLVE_RE: DISSOLVE_RE,
};
