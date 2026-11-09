// recorder-sitgap-20261108.js — the SIT GAP recorder
// (arm sim-sitgap-b, run fleshout-loop-b-20261109T0130Z). Scripts only, zero src/js.
// Wraps the sitstep instrument snapshot (same pattern as the 53007 DIAG
// recorder) and adds ONE pure-read `sitgap` object per daily row: the
// cumulative takeseat drive counters, so the analyzer can attribute each
// ready-day's non-sit to its skip reason by diffing consecutive days.
//
// PURE READS ONLY: takeseatStats() returns a deep copy of the policy
// module's counters (no game-state read, no RNG draw, no write). The
// sitstep snapshot already carries seat / seatDetail / preview /
// entryBlock / gate / tableWaiting / tableAnnounced / tableDone /
// winDayFloorOk / scholarAtHaven / raw standing per day — this recorder
// adds only the policy-side counters those fields cannot see (the sit
// drive runs in upkeep, 3x/day; the snapshot runs once/day, so the
// cumulative counters are the only per-day attribution channel).
// Neutrality is proven, not assumed: scripts/test-sitgap-b.js G2 compares
// armed vs unrecorded trajectories on identical seeds.
// Usage: const REC2 = require('./recorder-sitgap-20261108');
//   const inst = INST.install(Game); REC.install(Game, inst);
//   REC2.install(Game, inst, DOORWALK.takeseatStats);
//   ... inst.snapshot() per day ... inst.uninstall();
'use strict';

function sitgapRow(takeseatStats) {
  const d = { tsSkips: null, tsAttempts: null, tsTaken: null, tsFailed: null, tsSeatDay: null, tsSeatKind: null };
  try {
    if (typeof takeseatStats !== 'function') { d._error = 'takeseatStats not a function'; return d; }
    const st = takeseatStats() || {};
    d.tsSkips = st.skips || {};
    d.tsAttempts = (st.seatAttempts | 0);
    d.tsTaken = (st.seatTaken | 0);
    d.tsFailed = (st.seatFailed | 0);
    d.tsSeatDay = (st.seatDay != null) ? (st.seatDay | 0) : null;
    d.tsSeatKind = st.seatKind || null;
  } catch (e) {
    d._error = String(e && e.message ? e.message : e).slice(0, 80);
  }
  return d;
}

function install(Game, inst, takeseatStats) {
  if (!inst || typeof inst.snapshot !== 'function') throw new Error('recorder-sitgap: inst.snapshot required');
  if (typeof takeseatStats !== 'function') throw new Error('recorder-sitgap: takeseatStats function required');
  const t = inst.t || {};
  const origSnapshot = inst.snapshot;
  inst.snapshot = function () {
    const snap = origSnapshot();
    try {
      snap.sitgap = sitgapRow(takeseatStats);
      if (snap.sitgap && snap.sitgap._error) {
        try { (t.instrumentErrors || (t.instrumentErrors = [])).push('sitgap-53008: ' + snap.sitgap._error); } catch (e) {}
        delete snap.sitgap._error;
      }
    } catch (e) {
      try { (t.instrumentErrors || (t.instrumentErrors = [])).push('sitgap-wrap: ' + String(e.message).slice(0, 80)); } catch (e2) {}
      snap.sitgap = null;
    }
    return snap;
  };
  return inst;
}

module.exports = { install: install, sitgapRow: sitgapRow };
