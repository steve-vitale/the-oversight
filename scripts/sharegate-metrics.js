// sharegate-metrics.js — shared, instrument-based gate metrics for
// sim-sharegate-b. Used by scripts/test-sharegate-b.js (ENGAGE) and
// scripts/analyze-sharegate-b.js (pilot verdict).
//
// The check is INDEPENDENT of the layer's own bookkeeping: it rebuilds a
// per-link per-week kept/skip ledger from the upkeep instrument
// (tend/tribute events + dawn link snapshots) and the layer's decision
// log (cover attempts — a refused cover is an honest engine refusal, not
// a quiet skip).
//
// Definitions (mirroring hierarchy.js):
//   week(d) = Math.floor(d / 7)  (Game._week)
//   For a link in a week:
//     kept   = a tend event (lead side, dir=1) or tribute event (belong
//              side, dir=0) fired that week, OR the tdw/tpw stamp advanced
//              in the dawn snapshots.
//     skip   = the link was active (st=0) all week and not kept and the
//              layer made no cover attempt that week.
//     trust0 = the link's dawn trust at the week's first snapshot.
// Gate-crossing (armed side must be 0):
//   (i)  a skip-week with trust0 < 40 (the _linkSeasoned floor);
//   (ii) a run of >= 3 consecutive skip-weeks.
'use strict';

function weekOfDay(d) { return Math.floor(d / 7); }

// Build the per-link week ledger for one run's end-record.
function linkWeekLedger(end) {
  const up = end.upkeep || {};
  const snaps = up.links || [];
  const sgDecs = (end.sg && end.sg.decisions) || [];
  const byVid = {};
  function vid(v) {
    const k = String(v || '?');
    if (!byVid[k]) byVid[k] = { snaps: [], tendWeeks: new Set(), tribWeeks: new Set(), coverWeeks: new Set(), firstD: Infinity, lastD: -1, side: null };
    return byVid[k];
  }
  for (const s of snaps) {
    const L = vid(s.other);
    L.snaps.push(s);
    if (s.d < L.firstD) L.firstD = s.d;
    if (s.d > L.lastD) L.lastD = s.d;
    if (s.dir === 1) L.side = 'lead';
    else if (s.dir === 0 && !L.side) L.side = 'belong';
  }
  for (const e of (up.tendEvents || [])) {
    const L = byVid[String(e.other || '?')];
    if (L) L.tendWeeks.add(weekOfDay(e.d));
  }
  for (const e of (up.tributeEvents || [])) {
    const L = byVid[String(e.other || '?')];
    if (L) L.tribWeeks.add(weekOfDay(e.d));
  }
  for (const d of sgDecs) {
    const L = byVid[String(d.vid || '?')];
    if (L && String(d.action || '').indexOf('cover') === 0) L.coverWeeks.add(d.week);
    // decision-time trust: the engine's trust at the exact moment the
    // gate's rule was evaluated — the value the rule applies to. Dawn
    // snapshots can lag it (trust moves intraday: linkTick settlements,
    // courtship events); the ledger's kept/skip reconstruction stays
    // instrument-based, only the trust sample prefers decision time.
    if (L) {
      L.decTrust = L.decTrust || {};
      if (!(d.week in L.decTrust)) L.decTrust[d.week] = d.trust;
    }
  }
  const links = {};
  for (const k of Object.keys(byVid)) {
    const L = byVid[k];
    if (!L.snaps.length) continue;
    const w0 = weekOfDay(L.firstD), w1 = weekOfDay(L.lastD);
    const weeks = [];
    // stamp advancement per week (tdw/tpw from dawn snapshots)
    const byWeek = {};
    for (const s of L.snaps.slice().sort((a, b) => a.d - b.d)) {
      const w = weekOfDay(s.d);
      (byWeek[w] = byWeek[w] || []).push(s);
    }
    for (let w = w0; w <= w1; w++) {
      const ss = (byWeek[w] || []).filter(s => s.st === 0);
      if (!ss.length) continue; // link not active this week — not a skip
      // trust0: decision-time trust when the layer decided this week
      // (the value the gate's rule evaluated), else the week's first
      // dawn snapshot.
      const trust0 = (L.decTrust && w in L.decTrust) ? L.decTrust[w] : ss[0].trust;
      const stampKept = L.side === 'belong'
        ? ss.some(s => s.tpw === w)
        : ss.some(s => s.tdw === w);
      const eventKept = L.side === 'belong' ? L.tribWeeks.has(w) : L.tendWeeks.has(w);
      const kept = stampKept || eventKept;
      const attempted = L.coverWeeks.has(w);
      weeks.push({ week: w, kept, attempted, skip: !kept && !attempted, trust0, side: L.side });
    }
    links[k] = { side: L.side, weeks, snaps: L.snaps.slice().sort((a, b) => a.d - b.d) };
  }
  return links;
}

// Gate-crossing skips for one run: { below40, run3, detail[] }.
function gateCrossing(end) {
  const links = linkWeekLedger(end);
  let below40 = 0, run3 = 0;
  const detail = [];
  for (const k of Object.keys(links)) {
    const ws = links[k].weeks;
    let run = 0;
    for (const w of ws) {
      if (w.skip && w.trust0 < 40) { below40++; detail.push({ vid: k, week: w.week, trust: w.trust0, kind: 'skip-below-40' }); }
      run = w.skip ? run + 1 : 0;
      if (run === 3) { run3++; detail.push({ vid: k, week: w.week, kind: 'run-of-3' }); }
    }
  }
  return { below40, run3, total: below40 + run3, detail };
}

// Post-gate trust trajectories for one armed run: for links the second
// pass decided on, trust after the first decision; craters (90→<40 with a
// skip-week in the window).
function trustTrajectories(end) {
  const links = linkWeekLedger(end);
  const decVids = new Set(((end.sg && end.sg.decisions) || []).map(d => String(d.vid || '?')));
  const firstDecWeek = {};
  for (const d of ((end.sg && end.sg.decisions) || [])) {
    const k = String(d.vid || '?');
    if (!(k in firstDecWeek) || d.week < firstDecWeek[k]) firstDecWeek[k] = d.week;
  }
  const firstDecDay = {};
  for (const d of ((end.sg && end.sg.decisions) || [])) {
    const k = String(d.vid || '?');
    if (!(k in firstDecDay) || d.d < firstDecDay[k]) firstDecDay[k] = d.d;
  }
  let below40Links = 0, craters = 0;
  const detail = [];
  for (const k of Object.keys(links)) {
    if (!decVids.has(k)) continue; // the gate never touched this link
    // the trajectory is the raw dawn series (all active snapshots from
    // the first decision day) — the strictest honest read.
    const traj = links[k].snaps.filter(s => s.d >= firstDecDay[k] && s.st === 0);
    if (!traj.length) continue;
    if (traj.some(s => s.trust < 40)) {
      below40Links++;
      detail.push({ vid: k, kind: 'post-gate-below-40' });
    }
    const maxT = Math.max(-1, ...traj.map(s => s.trust));
    const minT = Math.min(999, ...traj.map(s => s.trust));
    const skipWeeks = links[k].weeks.filter(w => w.week >= firstDecWeek[k] && w.skip).length;
    if (maxT >= 90 && minT < 40 && skipWeeks > 0) {
      craters++;
      detail.push({ vid: k, kind: 'trust-crater', max: maxT, min: minT });
    }
  }
  return { below40Links, craters, detail };
}

module.exports = { weekOfDay, linkWeekLedger, gateCrossing, trustTrajectories };
