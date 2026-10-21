#!/usr/bin/env node
// probe-surpluskeep-instruments.js — SHARED realm-upkeep instruments for
// sim-surpluskeep-diag-b (loop B, run fleshout-loop-b-20261021T0730Z).
//
// Question (the named next of the landed-open sim-surplusfeed-national-b):
// armed runs (SURPLUSFEED=1) reach the court as often but LOSE THE REALM
// more often. The standing-accumulation-tax hypothesis was REJECTED; the
// open question is post-court UPKEEP: does the trim lean the pantry onto
// the policy's own upkeep gates (belongseek: pantryKcal > 2x tribute;
// leadcourt: pantryKcal > 20000 for tendLink) so tribute/tend payments get
// skipped, arrears accrue, trust craters, and the polity dissolves?
//
// Instruments (pure telemetry wraps; every wrap calls through, draws no
// RNG, writes no game state; verified by the det-gate):
//   1. upkeep flow markers: wraps of payTribute ('tribute') and tendLink
//      ('tend') record {day, other, paid, pantryBefore} from the ENGINE'S
//      OWN return values — attribution exact by construction.
//   2. break attribution: a breakLink wrap records {day, how, other, kind,
//      trust, arrears, keptDays, nationalLive, nationalDay} AFTER the
//      engine's call returns — the engine's post-break state, read only.
//      keptDays mirrors _linkNeglected's own math (lastKeptDay vs
//      tributePaidWeek*7 vs formation day).
//   3. dawn per-link snapshots: a Game.sleep wrap (outside the standing
//      probe's, also call-through) samples every link's int state:
//      trust/arrears/tributePaidWeek/tendedWeek/lastKeptDay/status.
//      Link ids embed Date.now()+R() — recorded run-local only, never
//      joined across runs; other-village id is the cross-run key.
//   4. national-lost edge: the same dawn sensor watches the nationalLive
//      true->false transition (the _checkNational dissolution path) and
//      records the polity composition at loss time.
//   5. dissolution say-lines: full-length capture of lines matching a FIXED
//      regex (deterministic line selection) — the sense-testing corpus.
//
// Usage: same env as the parent probe (FEASTSCALE_R13=1 SEATDRIVE=0,
// SURPLUSFEED=1 armed / unset control).
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function pantryKcal(Game) {
  try {
    return (((Game.state || {}).village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}

function otherOf(Game, link) {
  try {
    if (link.kind === 'covenant' || link.kind === 'trade') {
      return (link.a === 'haven' ? link.b : link.a) || '?';
    }
    return (link.subordinate === 'haven' ? link.primary : link.subordinate) || '?';
  } catch (e) { return '?'; }
}

// mirror of hierarchy.js _linkNeglected's kept-day math (read-only)
function keptDays(Game, link) {
  try {
    const day = dayOf(Game);
    let lastKept = (link.lastKeptDay != null) ? link.lastKeptDay : (link.day || 0);
    const tw = link.tributePaidWeek || -1;
    if (tw >= 0) lastKept = Math.max(lastKept, tw * 7);
    return day - lastKept;
  } catch (e) { return -1; }
}

// fixed dissolution-narration regex (deterministic line selection)
const DISSOLVE_RE = /realm came apart|missing tribute|Tribute short|Arrears|neglected link snaps|tribute arrives light|Nothing comes from|their fields are as empty|threw off.*yoke|tribute comes up thin|walks out of the pantry toward|Haven sends .* kcal of grain|The pantry is bare|installs their own speaker|pressed tribute down|The yoke is thrown off/i;

// the dawn sensor body, extracted so constructed cases exercise the exact
// logic the sleep wrap runs (pure reads; no RNG; no state writes)
function dawnUpkeepSensor(Game, K) {
  const d = dayOf(Game);
  const st = Game.state || {};
  const nat = !!st.nationalLive;
  if (K._prevNat && !nat) {
    // the _checkNational dissolution path fired overnight
    let subs = [];
    try {
      const ls = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
      for (const l of ls) {
        if (l && l.status === 'active' && l.primary === 'haven') {
          subs.push({ other: otherOf(Game, l), trust: l.trust | 0, arrears: Math.round(l.arrears || 0) });
        }
      }
    } catch (e) {}
    K.natEvents.push({
      d, kind: 'lost', shape: st.nationalShape || '',
      natDay: st.nationalDay || 0, subs,
    });
  } else if (!K._prevNat && nat) {
    K.natEvents.push({ d, kind: 'sat', shape: st.nationalShape || '', natDay: st.nationalDay || 0, subs: [] });
  }
  K._prevNat = nat;
  // per-link snapshot (ints only; link.id excluded — unstable)
  try {
    const ls = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
    for (const l of ls) {
      if (!l) continue;
      K.links.push({
        d,
        other: String(otherOf(Game, l)),
        kind: l.kind || 'vassal',
        dir: l.subordinate === 'haven' ? 0 : (l.primary === 'haven' ? 1 : 2),
        st: l.status === 'active' ? 0 : 1,
        trust: l.trust | 0,
        arr: Math.round(l.arrears || 0),
        tpw: (l.tributePaidWeek == null ? -1 : l.tributePaidWeek) | 0,
        tdw: (l.tendedWeek == null ? -1 : l.tendedWeek) | 0,
        lkd: (l.lastKeptDay == null ? -1 : l.lastKeptDay) | 0,
        tkpw: Math.round(l.tributeKcalPerWeek || 0),
      });
    }
  } catch (e) {}
}

function attachUpkeepProbe(Game) {
  const K = {
    tributeEvents: [],  // {d, other, paid, pantryBefore}
    tendEvents: [],     // {d, other, paid, pantryBefore}
    breaks: [],         // {d, how, other, kind, trust, arrears, keptDays, tkpw, natLive, natDay}
    links: [],          // dawn snapshots: {d, other, kind, st, trust, arr, tpw, tdw, lkd, tkpw}
    natEvents: [],      // {d, kind:'sat'|'lost', shape, subs}
    dissolveLines: [],  // {d, line}
    _prevNat: false,
  };
  Game._upkeepProbe = K; // instrument-state marker (RED gate reads it)

  // 1. upkeep flow wraps — engine return values, pure reads around call-through
  {
    const o = Game.payTribute;
    if (typeof o === 'function') Game.payTribute = function (linkId, kcal) {
      const before = pantryKcal(Game);
      const r = o.apply(this, arguments);
      try {
        if (r !== null && r !== undefined) {
          let other = '?';
          try {
            const ls = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
            for (const l of ls) if (l && l.id === linkId) { other = otherOf(Game, l); break; }
          } catch (e) {}
          K.tributeEvents.push({ d: dayOf(Game), other, paid: Math.round(r) || 0, pantryBefore: Math.round(before) });
        }
      } catch (e) {}
      return r;
    };
  }
  {
    const o = Game.tendLink;
    if (typeof o === 'function') Game.tendLink = function (linkId) {
      const before = pantryKcal(Game);
      const r = o.apply(this, arguments);
      try {
        let other = '?';
        try {
          const ls = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
          for (const l of ls) if (l && l.id === linkId) { other = otherOf(Game, l); break; }
        } catch (e) {}
        K.tendEvents.push({ d: dayOf(Game), other, paid: Math.round(r) || 0, pantryBefore: Math.round(before) });
      } catch (e) {}
      return r;
    };
  }

  // 2. break attribution — read the engine's post-break state
  {
    const o = Game.breakLink;
    if (typeof o === 'function') Game.breakLink = function (linkId, how) {
      const r = o.apply(this, arguments);
      if (r === null || r === undefined) return r; // no-op (dead link) — not a break
      try {
        let snap = null;
        try {
          const ls = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : [];
          for (const l of ls) if (l && l.id === linkId) { snap = l; break; }
        } catch (e) {}
        const st = Game.state || {};
        K.breaks.push({
          d: dayOf(Game),
          how: String(how || 'severed'),
          other: snap ? otherOf(Game, snap) : '?',
          kind: snap ? (snap.kind || 'vassal') : '?',
          trust: snap ? (snap.trust | 0) : -1,
          arrears: snap ? Math.round(snap.arrears || 0) : -1,
          keptDays: snap ? keptDays(Game, snap) : -1,
          tkpw: snap ? Math.round(snap.tributeKcalPerWeek || 0) : -1,
          natLive: !!st.nationalLive,
          natDay: st.nationalDay || 0,
        });
      } catch (e) {}
      return r;
    };
  }

  // 3+4. dawn per-link snapshots + national-lost edge (sleep wrap outside
  // the standing probe's — both call through; the sensor body is extracted
  // as dawnUpkeepSensor so constructed cases can exercise the exact logic)
  {
    const o = Game.sleep;
    if (typeof o === 'function') Game.sleep = function () {
      const r = o.apply(this, arguments);
      try { dawnUpkeepSensor(Game, K); } catch (e) {}
      return r;
    };
  }

  // 5. dissolution say-lines (full-length, fixed regex)
  {
    const o = Game.say;
    if (typeof o === 'function') Game.say = function (msg) {
      try {
        const s = String(msg || '');
        if (DISSOLVE_RE.test(s)) K.dissolveLines.push({ d: dayOf(Game), line: s });
      } catch (e) {}
      return o.apply(this, arguments);
    };
  }

  return K;
}

module.exports = { attachUpkeepProbe, dawnUpkeepSensor, dayOf, pantryKcal, keptDays, DISSOLVE_RE, otherOf };
