#!/usr/bin/env node
// wave5door-openers-classify-20261022.js — release-path classifier for the
// wave-5 door-openers census (flesh-out loop arm sim-wave5door-openers,
// axis scale-onramp). PURE — unit-testable without a harness.
//
// Engine semantics (src/js/standing.js, authoritative):
//   The defer5 hold applies iff capped >= t5 && !rd5.ready && peak < 5. On
//   the FIRST day the gated total releases wave 5, peak<5 is required for
//   the peak to be recorded — so that release MUST have had rd5.ready=true
//   (live demand). The grandfather clause (peak>=w) only waives FUTURE
//   holds: a released door stays open while standing falls.
//   End-of-run standingDeferral(5).grandfathered=True is expected on EVERY
//   unlocking run (peak>=5 ⇒ waived); it does NOT discriminate the release
//   path. Classification is from the daily window trace, never the end flag.
//
//   standing-release day (peakRecord5Day): first trace day with
//     raw>=t5 && capped>=t5 && r5.ready — the standing release, live
//     demand by construction.
//   door-open day (w5Day): first trace day with uw>=5 (additionally needs
//     w3rung and w4faced>0).
//   defer5 open path:
//     'live-demand'   if peakRecord5Day == w5Day (bars were met the day the
//                     door opened);
//     'grandfathered' if peakRecord5Day < w5Day (bars met earlier, fell
//                     before the door opened — the peak ratchet held it);
//     'locked'        if the door never opened.
//   Same rule for defer4 (raw>=t4, r4.ready) vs w4Day.
//   Bar release days: first trace day each bar >= its demand.
'use strict';

function i0(x) { const n = +x; return Number.isFinite(n) ? (n | 0) : -1; }

function firstDay(window, pred) {
  for (const w of window) { try { if (pred(w)) return i0(w.day); } catch (e) {} }
  return null;
}

// barRelease(window, demand): first day each of the 4 bars >= demand.
function barRelease(window, demand) {
  const out = { armored: null, armed: null, tricks: null, veterans: null };
  if (!demand) return out;
  const need = { armored: i0(demand.armored), armed: i0(demand.armed), tricks: i0(demand.tricks), veterans: i0(demand.veterans) };
  for (const w of window) {
    const b = w.r5 || {};
    if (out.armored == null && i0(b.armored) >= need.armored) out.armored = i0(w.day);
    if (out.armed == null && i0(b.armed) >= need.armed) out.armed = i0(w.day);
    if (out.tricks == null && i0(b.tricks) >= need.tricks) out.tricks = i0(w.day);
    if (out.veterans == null && i0(b.veterans) >= need.veterans) out.veterans = i0(w.day);
    if (out.armored != null && out.armed != null && out.tricks != null && out.veterans != null) break;
  }
  return out;
}

function barRelease4(window, demand) {
  const out = { armored: null, armed: null, tricks: null, veterans: null };
  if (!demand) return out;
  const need = { armored: i0(demand.armored), armed: i0(demand.armed), tricks: i0(demand.tricks), veterans: i0(demand.veterans) };
  for (const w of window) {
    const b = w.r4 || {};
    if (out.armored == null && i0(b.armored) >= need.armored) out.armored = i0(w.day);
    if (out.armed == null && i0(b.armed) >= need.armed) out.armed = i0(w.day);
    if (out.tricks == null && i0(b.tricks) >= need.tricks) out.tricks = i0(w.day);
    if (out.veterans == null && i0(b.veterans) >= need.veterans) out.veterans = i0(w.day);
    if (out.armored != null && out.armed != null && out.tricks != null && out.veterans != null) break;
  }
  return out;
}

// readyOn(window, day, w): the r4/r5 .ready flag on a given trace day.
function readyOn(window, day, w) {
  for (const e of window) {
    if (i0(e.day) === day) {
      const b = (w === 4 ? e.r4 : e.r5) || {};
      return !!b.ready;
    }
  }
  return null;
}

// barsOn(window, day, w): the 4 bar values on a given trace day.
function barsOn(window, day, w) {
  for (const e of window) {
    if (i0(e.day) === day) {
      const b = (w === 4 ? e.r4 : e.r5) || {};
      return { armored: i0(b.armored), armed: i0(b.armed), tricks: i0(b.tricks), veterans: i0(b.veterans), ready: !!b.ready };
    }
  }
  return null;
}

// classifyOpenPath(window, opts): the per-gate release-path classification.
// opts: { t4, t5, demand4, demand5 }.
function classifyOpenPath(window, opts) {
  const t4 = (opts && opts.t4) || 100, t5 = (opts && opts.t5) || 200;
  const demand4 = opts && opts.demand4, demand5 = opts && opts.demand5;
  const c = {};
  c.w5Day = firstDay(window, (w) => i0(w.uw) >= 5);
  c.w4Day = firstDay(window, (w) => i0(w.uw) >= 4);
  c.w3Day = firstDay(window, (w) => i0(w.uw) >= 3);
  c.w4facedDay = firstDay(window, (w) => i0(w.w4faced) > 0);
  c.standRawDay = firstDay(window, (w) => i0(w.raw) >= t5);
  c.plentyDay = firstDay(window, (w) => i0(w.raw) >= t5 && i0(w.capped) >= t5);
  // Standing-release (peak-record) days: the readiness gate's live-demand
  // moment, by engine construction.
  c.peakRecord4Day = firstDay(window, (w) => i0(w.raw) >= t4 && !!((w.r4 || {}).ready));
  c.peakRecord5Day = firstDay(window, (w) => i0(w.raw) >= t5 && i0(w.capped) >= t5 && !!((w.r5 || {}).ready));
  c.barRelease4 = barRelease4(window, demand4);
  c.barRelease5 = barRelease(window, demand5);
  // defer4 open path.
  if (c.w4Day == null) c.defer4OpenPath = 'locked';
  else if (c.peakRecord4Day != null && c.peakRecord4Day <= c.w4Day) {
    c.defer4OpenPath = (c.peakRecord4Day === c.w4Day) ? 'live-demand' : 'grandfathered';
  } else c.defer4OpenPath = 'unknown';
  // defer5 open path — the sharp question of this census.
  if (c.w5Day == null) c.defer5OpenPath = 'locked';
  else if (c.peakRecord5Day != null && c.peakRecord5Day <= c.w5Day) {
    c.defer5OpenPath = (c.peakRecord5Day === c.w5Day) ? 'live-demand' : 'grandfathered';
  } else c.defer5OpenPath = 'unknown';
  c.r4ReadyAtW4Day = c.w4Day != null ? readyOn(window, c.w4Day, 4) : null;
  c.r5ReadyAtW5Day = c.w5Day != null ? readyOn(window, c.w5Day, 5) : null;
  c.barsAtW5Day = c.w5Day != null ? barsOn(window, c.w5Day, 5) : null;
  // End-of-run state: is the door held open by the ratchet after the bars
  // fell? (last trace day)
  const last = window.length ? window[window.length - 1] : null;
  if (last) {
    const lb = last.r5 || {};
    c.endUw = i0(last.uw);
    c.endR5Ready = !!lb.ready;
    c.endBars = { armored: i0(lb.armored), armed: i0(lb.armed), tricks: i0(lb.tricks), veterans: i0(lb.veterans) };
    c.grandfatheredHoldOpen = (c.endUw >= 5 && !c.endR5Ready);
  } else {
    c.endUw = null; c.endR5Ready = null; c.endBars = null; c.grandfatheredHoldOpen = null;
  }
  return c;
}

module.exports = { classifyOpenPath, barRelease, barRelease4, readyOn, barsOn, firstDay };
