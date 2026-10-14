#!/usr/bin/env node
// preddisc-20261014.js — RAID-PREDATION vs INCOME-SHORTFALL discriminator
// (sim-findings #163, flesh-out 2026-10-14).
//
// The spiralverb kill (evidence/2026-10-14/sim-spiralverb.md) showed s44's
// pantry collapse was RAID-DRIVEN (~4.4k kcal/night stripped; fresh-days
// 24.0->1.6 in days; the base policy's own forage trips already returning
// empty) while the pantry-trajectory marker couldn't distinguish it from an
// income shortfall. This instrument is the named next step: a predation
// discriminator that classifies pantry-collapse/spiral runs as
// RAID-PREDATION vs INCOME-SHORTFALL (vs MIXED), so a future
// conditional-posture arm can key verbs to the cause:
//   combat-spiral  -> homebound brace (r24 verbs)
//   pantry-spiral (income) -> ranging/income priority (r29 pantry verbs)
//   raid-spiral    -> raid defense (UNBUILT — see sim-findings #161)
//   mixed          -> combat posture wins on scholar safety (r29 tie-break)
//
// INSTRUMENT ONLY — read-only telemetry wraps around the engine; zero
// game-code changes. Gorge/lingerer telemetry is REUSED from
// scripts/predation-lib-20261014.js (landed on master, r30b), not rebuilt.
// Added inputs: forage-return rates (doAction('forage') pack-kcal deltas +
// "worked out" beats), fresh-days trajectory shape (pantryDaysEstimate
// daily), scholar-death days (death-acceleration marker).
//
// Usage:
//   const { attachPreddisc, finalizePreddisc, classifyRun } = require('./preddisc-20261014');
//   const track = attachPreddisc(Game);          // before runDays
//   ... policy.daily calls track.sampleDay() ...
//   const T = finalizePreddisc(Game, track);     // telemetry bundle
//   const verdict = classifyRun(T);              // {class, features, markers, verbs, verbFor}
//
// The classification rule is frozen in evidence/2026-10-14/sim-preddisc.md
// (pre-registration). Do not tune thresholds against the adjudicated runs.
'use strict';
const { installPredation, finalizePredation, pantryKcal, gday } =
  require('./predation-lib-20261014');

function packKcal(Game) {
  try {
    return ((Game.state.scholar || {}).inventory || [])
      .reduce((t, i) => t + ((i.kcalEach || 0) * (i.units || 1)), 0);
  } catch (e) { return 0; }
}
function freshDays(Game) {
  try {
    const e = Game.pantryDaysEstimate();
    return (typeof e === 'number' && e >= 0) ? Math.min(999, e) : null;
  } catch (e2) { return null; }
}
function scholarVid(Game) {
  try { return (Game.state.scholar || {}).villagerId || Game.villagerId || null; }
  catch (e) { return null; }
}

function attachPreddisc(Game) {
  const ptrack = installPredation(Game); // gorge/lingerer telemetry (reused)
  const track = {
    ptrack,
    pantry: [],          // {day, kcal, freshDays} — daily, via sampleDay()
    forageAttempts: [],  // {day, ok, gained} — per doAction('forage')
    workedOutLines: [],  // {day, text} — "worked out" beats
    scholarDeaths: [],   // {day, prev, now} — scholar vid changes
    instrErrors: [],
    _lastVid: null,
  };
  const note = (where, e) => { track.instrErrors.push(where + ': ' + (e && e.message)); };

  // --- doAction('forage'): pack-kcal delta = the trip's real return ---
  try {
    const origDo = Game.doAction.bind(Game);
    Game.doAction = function (action, opts) {
      const isForage = String(action) === 'forage';
      let before = 0;
      const day = gday(Game);
      try { if (isForage) before = packKcal(Game); } catch (e) {}
      const ret = origDo(action, opts);
      try {
        if (isForage) {
          const after = packKcal(Game);
          track.forageAttempts.push({ day, ok: !!ret,
            gained: Math.max(0, Math.round(after - before)) });
        }
      } catch (e) { note('doAction', e); }
      return ret;
    };
  } catch (e) { note('wrapDoAction', e); }

  // --- say (chained AFTER predation-lib's wrap): count "worked out" beats ---
  try {
    const chainedSay = Game.say.bind(Game);
    Game.say = function (msg) {
      try {
        const s = String(msg || '');
        if (/worked out/i.test(s)) {
          track.workedOutLines.push({ day: gday(Game), text: s.slice(0, 160) });
        }
      } catch (e) {}
      return chainedSay(msg);
    };
  } catch (e) { note('wrapSay', e); }

  track.sampleDay = function () {
    try { track.ptrack.sampleDay(); } catch (e) { note('ptrackSample', e); }
    try {
      const day = gday(Game);
      track.pantry.push({ day, kcal: Math.round(pantryKcal(Game)), freshDays: freshDays(Game) });
      const vid = scholarVid(Game);
      if (track._lastVid && vid && track._lastVid !== vid) {
        track.scholarDeaths.push({ day, prev: String(track._lastVid).slice(0, 24),
                                   now: String(vid).slice(0, 24) });
      }
      if (vid) track._lastVid = vid;
    } catch (e) { note('sampleDay', e); }
  };

  return track;
}

// findCollapseWindow(pantrySamples) — the maximal span where fresh-days < 3
// (the spiralverb pantry-trajectory marker's band), merging gaps < 4d and
// dropping blips < 3d. Longest span wins; ties go to the latest.
function findCollapseWindow(pantry) {
  const ps = (pantry || []).filter(p => p && p.freshDays != null)
    .slice().sort((a, b) => a.day - b.day);
  if (!ps.length) return null;
  const below = ps.filter(p => p.freshDays < 3).map(p => p.day);
  if (!below.length) return null;
  const groups = [];
  let cur = [below[0]];
  for (let i = 1; i < below.length; i++) {
    if (below[i] - cur[cur.length - 1] < 4) cur.push(below[i]);
    else { groups.push(cur); cur = [below[i]]; }
  }
  groups.push(cur);
  const solid = groups.filter(g => g.length >= 3);
  if (!solid.length) return null;
  solid.sort((a, b) => (b.length - a.length) || (b[0] - a[0]));
  const w = solid[0];
  return { startDay: w[0], endDay: w[w.length - 1] };
}

// findFallStart — scan backward from the collapse-window start while
// fresh-days keeps falling: the raids that CAUSE a collapse gorge BEFORE
// fresh-days crosses below 3, so attribution must cover the fall, not just
// the <3 span.
function findFallStart(pan, windowStart) {
  const ps = pan.slice().sort((a, b) => a.day - b.day);
  let i = ps.findIndex(p => p.day >= windowStart);
  if (i < 0) i = ps.length - 1;
  let start = ps[i] ? ps[i].day : windowStart;
  for (let j = i; j > 0; j--) {
    const cur = ps[j], prev = ps[j - 1];
    if (cur.freshDays == null || prev.freshDays == null) break;
    if (prev.freshDays > cur.freshDays - 0.5) start = prev.day;
    else break;
  }
  return start;
}

function overlapDays(a0, a1, b0, b1) {
  const s = Math.max(a0, b0), e = Math.min(a1, b1);
  return e >= s ? (e - s + 1) : 0;
}

// Death-acceleration marker (the spiralcond spec, evidence/2026-10-14/
// sim-spiralcond.md): >=2 scholar deaths in the trailing 21d AND the 2nd
// within 14d of the 1st. Computed at the attribution window end.
function deathAccel(deathDays, atDay) {
  const ds = (deathDays || []).filter(d => d > atDay - 21 && d <= atDay).sort((a, b) => a - b);
  let accel = false, lastGap = null;
  if (ds.length >= 2) {
    lastGap = ds[ds.length - 1] - ds[ds.length - 2];
    accel = lastGap <= 14;
  }
  return { accel, deaths21d: ds.length, lastGap };
}

// THE FROZEN RULE (v1) — pre-registered in evidence/2026-10-14/sim-preddisc.md.
// raidExplains = gorge kcal inside the attribution window / pantry drain over
// the same window (drain floored at 3000 kcal ~ 1.5 village-days so the ratio
// can't fire on noise).
//   raidExplains >= 0.40  -> 'predation'  (raids drove the collapse)
//   raidExplains >= 0.15  -> 'mixed'      (both causes active)
//   else                  -> 'income'     (pantry fell without raid evidence)
//   no collapse window    -> 'no-spiral'
// A sustained siege (3+ gorge nights AND 6000+ kcal) also reads predation.
function classifyRun(T) {
  const pan = ((T && T.pantry) || []).filter(p => p && p.freshDays != null)
    .slice().sort((a, b) => a.day - b.day);
  const window = (T && T.window) || findCollapseWindow(pan);
  const deathDays = ((T && T.scholarDeaths) || []).map(d => (typeof d === 'number' ? d : d.day));

  const verbs = {
    combat: 'homebound-brace',
    pantryIncome: 'ranging-income-priority',
    pantryRaid: 'raid-defense',
    mixed: 'combat-posture-wins',
    none: 'no-posture',
  };
  const noSpiral = (reason) => ({
    class: 'no-spiral',
    confidence: 'high',
    window: null,
    attrWindow: null,
    features: {
      gorgeNights: 0, gorgeKcal: 0, drain: 0, raidExplains: 0,
      lingerNights: 0, incomeRatio: 1, freshDaysDrop: 0, cliff: false,
      forageKcalInW: 0, forageKcalBase: 0, forageTripsInW: 0,
    },
    markers: {
      'spiral.type': 'none',
      'spiral.predation': { gorgeNights7d: 0, gorgeKcal7d: 0, lingerNights7d: 0, raidExplains7d: 0 },
      'spiral.income': { forageKcal7d: 0, forageSuccess7d: 0, forageTrips7d: 0, freshDaysSlope7d: 0 },
      'spiral.window': null,
      'spiral.deaths': Object.assign({ atDay: pan.length ? pan[pan.length - 1].day : 0 },
        deathAccel(deathDays, pan.length ? pan[pan.length - 1].day : 0)),
    },
    verbs,
    verbFor: verbs.none,
    note: reason,
  });
  if (!window) return noSpiral('no <3-fresh-days span of >=3d');

  const fallStart = findFallStart(pan, window.startDay);
  const a0 = fallStart, a1 = window.endDay;
  const inAttr = (d) => d >= a0 && d <= a1;

  // gorge inside the attribution window
  const gorge = ((T && T.gorge) || []).filter(g => g && inAttr(g.day));
  const gorgeNights = gorge.length;
  const gorgeKcal = gorge.reduce((t, g) => t + (g.totalGorged || 0), 0);
  // pantry drain over the attribution window
  const before = pan.filter(p => p.day < a0).pop() || pan.find(p => p.day >= a0);
  const endSamp = pan.filter(p => p.day <= a1).pop();
  const startK = before ? before.kcal : 0;
  const endK = endSamp ? endSamp.kcal : startK;
  const drain = Math.max(0, startK - endK);
  const raidExplains = gorgeKcal / Math.max(3000, drain);
  // lingering-entity nights vs the collapse window
  const lingerNights = ((T && T.episodes) || [])
    .reduce((t, e) => t + overlapDays(e.firstDay, e.lastDay, a0, a1), 0);
  // forage returns: attribution window vs trailing 21d baseline
  const fag = ((T && T.forage) || []).filter(f => f && f.day != null);
  const inW = fag.filter(f => inAttr(f.day));
  const base = fag.filter(f => f.day >= a0 - 21 && f.day < a0);
  const perDay = (arr) => arr.length ? arr.reduce((t, f) => t + (f.kcal || 0), 0) / arr.length : 0;
  const forageKcalInW = perDay(inW), forageKcalBase = perDay(base);
  const incomeRatio = forageKcalInW / Math.max(1, forageKcalBase);
  const forageTripsInW = inW.reduce((t, f) => t + (f.attempts || 0), 0);
  const forageSuccessInW = inW.reduce((t, f) => t + (f.success || 0), 0);
  // fresh-days trajectory shape
  const fd0 = before ? before.freshDays : null;
  const fd1 = endSamp ? endSamp.freshDays : null;
  const freshDaysDrop = (fd0 != null && fd1 != null) ? +(fd0 - fd1).toFixed(1) : 0;
  const cliff = freshDaysDrop >= 8 && (a1 - a0) <= 7;

  let cls = 'income', confidence = 'medium';
  if (raidExplains >= 0.40 || (gorgeNights >= 3 && gorgeKcal >= 6000)) {
    cls = 'predation';
    confidence = raidExplains >= 0.60 ? 'high' : 'medium';
  } else if (raidExplains >= 0.15) {
    cls = 'mixed';
    confidence = 'medium';
  } else {
    cls = 'income';
    confidence = gorgeKcal === 0 ? 'high' : 'medium';
  }

  // trailing-7d marker snapshot at the window end (the posture's decision point)
  const t7 = (arr, key) => arr.filter(x => x.day > a1 - 7 && x.day <= a1)
    .reduce((t, x) => t + (x[key] || 0), 0);
  const drain7 = (() => {
    const b7 = pan.filter(p => p.day <= a1 - 7).pop() || pan[0];
    const e7 = pan.filter(p => p.day <= a1).pop();
    return (b7 && e7) ? Math.max(0, b7.kcal - e7.kcal) : 0;
  })();
  const fdSlope7 = (() => {
    const b7 = pan.filter(p => p.day <= a1 - 7).pop(), e7 = pan.filter(p => p.day <= a1).pop();
    return (b7 && e7 && b7.freshDays != null && e7.freshDays != null)
      ? +((b7.freshDays - e7.freshDays) / 7).toFixed(2) : 0;
  })();
  const da = deathAccel(deathDays, a1);

  const features = {
    gorgeNights, gorgeKcal: Math.round(gorgeKcal), drain: Math.round(drain),
    raidExplains: +raidExplains.toFixed(3),
    lingerNights, incomeRatio: +incomeRatio.toFixed(3),
    freshDaysDrop, cliff,
    forageKcalInW: Math.round(forageKcalInW), forageKcalBase: Math.round(forageKcalBase),
    forageTripsInW, forageSuccessInW,
  };
  const markers = {
    'spiral.type': cls === 'predation' ? 'pantry-raid' : (cls === 'income' ? 'pantry-income' : 'mixed'),
    'spiral.predation': {
      gorgeNights7d: ((T.gorge || []).filter(g => g.day > a1 - 7 && g.day <= a1)).length,
      gorgeKcal7d: Math.round(t7(T.gorge || [], 'totalGorged')),
      lingerNights7d: ((T.episodes || []))
        .reduce((t, e) => t + overlapDays(e.firstDay, e.lastDay, a1 - 6, a1), 0),
      raidExplains7d: +(t7(T.gorge || [], 'totalGorged') / Math.max(3000, drain7)).toFixed(3),
    },
    'spiral.income': {
      forageKcal7d: Math.round(t7(fag, 'kcal')),
      forageSuccess7d: t7(fag, 'success'),
      forageTrips7d: t7(fag, 'attempts'),
      freshDaysSlope7d: fdSlope7,
    },
    'spiral.window': { startDay: window.startDay, endDay: window.endDay,
                       attrStartDay: a0, attrEndDay: a1 },
    'spiral.deaths': Object.assign({ atDay: a1 }, da),
  };
  // Verb dispatch for the future conditional-posture arm. NOTE the combat
  // branch: death-acceleration WITHOUT a pantry collapse is a combat spiral
  // (homebound brace); the succession-feed marker (spiralcond spec) is
  // documented but unimplemented — it fired 0 times in 32 runs across
  // r28+r29, so any consumer must measure its base rate first.
  const verbFor = cls === 'predation' ? verbs.pantryRaid
    : cls === 'mixed' ? verbs.mixed
    : verbs.pantryIncome;
  return {
    class: cls, confidence,
    window: { startDay: window.startDay, endDay: window.endDay },
    attrWindow: { startDay: a0, endDay: a1 },
    features, markers, verbs, verbFor,
    combatSpiralNote: da.accel && cls !== 'predation'
      ? 'death-acceleration present: if the pantry had NOT collapsed this would key the combat verb (homebound-brace)'
      : null,
  };
}

function finalizePreddisc(Game, track) {
  const fin = finalizePredation(Game, track.ptrack);
  const pan = (track.pantry || []).slice().sort((a, b) => a.day - b.day);
  // daily forage aggregates
  const byDay = new Map();
  for (const a of (track.forageAttempts || [])) {
    if (!byDay.has(a.day)) byDay.set(a.day, { day: a.day, attempts: 0, success: 0, kcal: 0 });
    const r = byDay.get(a.day);
    r.attempts += 1;
    if (a.ok && a.gained > 0) r.success += 1;
    r.kcal += a.gained || 0;
  }
  const forage = Array.from(byDay.values()).sort((a, b) => a.day - b.day);
  const woByDay = new Map();
  for (const w of (track.workedOutLines || [])) {
    woByDay.set(w.day, (woByDay.get(w.day) || 0) + 1);
  }
  const workedOut = Array.from(woByDay.entries())
    .map(([day, count]) => ({ day, count })).sort((a, b) => a.day - b.day);
  return {
    window: null, // auto-detect in classifyRun; a driver may set it explicitly
    days: pan.length ? pan[pan.length - 1].day : 0,
    pantry: pan,
    gorge: fin.rawGorgeNights || [],
    episodes: fin.episodes || [],
    forage,
    workedOut,
    workedOutLines: track.workedOutLines || [],
    scholarDeaths: (track.scholarDeaths || []).map(d => d.day),
    scholarDeathRecs: track.scholarDeaths || [],
    sayBeats: fin.sayBeats || [],
    instrErrors: (track.instrErrors || []).concat(fin.instrErrors || []),
  };
}

module.exports = { attachPreddisc, finalizePreddisc, classifyRun, findCollapseWindow, findFallStart };
