#!/usr/bin/env node
// analyze-surpluskeep2-b.js — sim-surpluskeep2-b analysis (DIAGNOSTIC).
//
// Loads the 4-file corpus (evidence/2026-10-21/perseed-surpluskeep2-b/),
// detects DOWNWARD pantry gate-crossings through the policy's absolute
// 20,000 tendLink gate on leadfeast runs (leadcourt.js:61 — tending fires
// ONLY when pantryKcal > 20000), extracts 4-week post-gate trust
// trajectories on PAIRED SURPLUSFEED on/off runs, attributes each event
// and each post-gate realm dissolution, and evaluates the pre-registered
// DIAG-GO bar. Also reports wall numbers.
//
// Pre-registered DIAG-GO (evidence header, §14 binding):
//   1. >=4 gate-crossing events detected AND attributed across the corpus
//      (armed leadfeast runs); <4 -> DIAG-insufficient-data (report-only).
//   2. mean 4-week post-gate trust delta (armed minus paired control) <= -15,
//      over paired-evaluable events (both arms have trust at gate week and
//      4 weeks later).
//   3. 100% of post-gate (8-week window) realm dissolutions attributed to a
//      named cause.
//   4. 0 unexplained events or dissolutions.
//
// Usage: node scripts/analyze-surpluskeep2-b.js [--dir <corpus-dir>] [--out <analysis.json>]
'use strict';
const fs = require('fs'), path = require('path');
const { weeklyPantry, detectGateCrossings, detectRecrossings, TEND_GATE_KCAL } =
  require('./surpluskeep2-instruments');

const DIR = (() => { const i = process.argv.indexOf('--dir'); return i >= 0 ? process.argv[i + 1] : 'evidence/2026-10-21/perseed-surpluskeep2-b'; })();
const OUT = (() => { const i = process.argv.indexOf('--out'); return i >= 0 ? process.argv[i + 1] : path.join(DIR, 'analysis.json'); })();

function load(name) {
  const p = path.join(DIR, name);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

// compact link snapshot: [d, other, kindInt, dir, st, trust, arr, tpw, tdw, lkd, tkpw]
// dir: 0=Haven subordinate, 1=Haven primary (tend verb), 2=peer; st: 0=active.
// Accepts the probe's live object form too (tests pass inst.K.links direct).
function normLink(l) {
  if (Array.isArray(l)) return { d: l[0], other: l[1], dir: l[3], st: l[4], trust: l[5] };
  return { d: l.d, other: l.other, dir: l.dir | 0, st: l.st, trust: l.trust };
}
function weeklyTrust(links, week, dirWant) {
  // mean trust of active dirWant links, at the week's start (earliest dawn
  // snapshot in [7w, 7w+7) per other-village; null if no live snapshots)
  const d0 = week * 7, d1 = d0 + 7;
  const byOther = new Map();
  for (const l of links) {
    const n = normLink(l);
    if (n.dir !== dirWant || n.st !== 0) continue;
    if (n.d < d0 || n.d >= d1) continue;
    if (!byOther.has(n.other) || n.d < byOther.get(n.other).d) byOther.set(n.other, n);
  }
  if (!byOther.size) return null;
  let sum = 0;
  for (const n of byOther.values()) sum += n.trust;
  return sum / byOther.size;
}

function activeOthers(links, week, dirWant) {
  const d0 = week * 7, d1 = d0 + 7;
  const set = new Set();
  for (const l of links) {
    const n = normLink(l);
    if (n.dir !== dirWant || n.st !== 0) continue;
    if (n.d < d0 || n.d >= d1) continue;
    set.add(n.other);
  }
  return [...set].sort();
}

// dissolution classification adapted from the parent's analyze-surpluskeep-b.js
// classifyLoss, anchored to a post-gate lost edge (not natDay).
function classifyPostGateLoss(row, lostEv) {
  const u = row.upkeep || {};
  const lostDay = lostEv.d;
  const shape = row.nationalShape || lostEv.shape || '';
  const winBreaks = (u.breaks || []).filter(b => b.d >= lostDay - 56 && b.d <= lostDay);
  const links = u.links || [];
  const latestByOther = {};
  for (const l of links) { if (l[0] <= lostDay) latestByOther[l[1]] = l; }
  const lat = Object.values(latestByOther);
  if (shape === 'belong') {
    const sub = lat.find(l => l[3] === 0);
    if (sub) {
      if (sub[6] > 0 || sub[5] < 50)
        return { cause: 'arrears-disqualify', detail: `sub-link trust ${sub[5]}, arrears ${sub[6]} at loss` };
      return { cause: 'primary-realm-collapse', detail: 'Haven link good; primary realm collapsed' };
    }
    if (winBreaks.length) { const b = winBreaks[0]; return { cause: 'break-' + b.how, detail: `break ${b.how} on ${b.other} at d${b.d}` }; }
    return { cause: 'unexplained', detail: 'belong loss, sub-link not found in snapshots' };
  }
  const subs = lat.filter(l => l[3] === 1 && l[4] === 0);
  const seasoned = subs.filter(l => l[5] >= 40);
  if (winBreaks.length) {
    const b = winBreaks[0];
    const map = { succession: 'break-succession-neglect', revolt: 'break-revolt' };
    const cause = map[b.how] || ('break-policy-' + b.how);
    return { cause, detail: `break ${b.how} on ${b.other} (trust ${b.trust}, kept ${b.keptDays}d) at d${b.d}` };
  }
  if (seasoned.length < 3) {
    const fell = subs.filter(l => l[5] < 40).map(l => `${l[1]}:${l[5]}`).join(',');
    return { cause: 'trust-crater-below-seasoned', detail: `${seasoned.length}/3+ seasoned at loss; fell: ${fell || 'none'}` };
  }
  return { cause: 'unexplained', detail: `${seasoned.length} seasoned at loss, no window break` };
}

function main() {
  const armedLead = load('armed-leadfeast.json'), controlLead = load('control-leadfeast.json');
  const armedBelong = load('armed-belongfeast.json'), controlBelong = load('control-belongfeast.json');
  const bySeed = rows => { const m = new Map(); for (const r of rows) m.set(r.seed, r); return m; };
  const aL = bySeed(armedLead.rows), cL = bySeed(controlLead.rows);

  const events = []; // gate-crossing events on armed leadfeast runs
  const controlEvents = []; // same detection on control leadfeast runs (mechanism check)
  for (const [rows, sink, arm] of [[armedLead.rows, events, 'armed'], [controlLead.rows, controlEvents, 'control']]) {
    for (const row of rows) {
      if (!row.gate || !row.upkeep) continue;
      const weekly = weeklyPantry(row.gate.pantryDaily);
      const crossings = detectGateCrossings(weekly, TEND_GATE_KCAL);
      const recross = detectRecrossings(weekly, TEND_GATE_KCAL);
      for (const ev of crossings) {
        sink.push({ seed: row.seed, arm, week: ev.week, beforeKcal: ev.beforeKcal, afterKcal: ev.afterKcal,
          weekly, recrossWeeks: recross.filter(r => r.week > ev.week).map(r => r.week),
          row, days: row.days, endReason: row.endReason, nationalDay: row.nationalDay });
      }
    }
  }

  // per-event trust trajectories + attribution (armed events only for the bar)
  const TRUST_WIN = 4, DISS_WIN_WEEKS = 8;
  for (const ev of events) {
    const aRow = ev.row, cRow = cL.get(ev.seed);
    const aLinks = (aRow.upkeep || {}).links || [];
    const cLinks = ((cRow || {}).upkeep || {}).links || [];
    ev.armedOthers = activeOthers(aLinks, ev.week, 1);
    ev.controlOthers = cRow ? activeOthers(cLinks, ev.week, 1) : [];
    // MECHANISM ELIGIBILITY: the threshold mechanism is "tending STOPS" — it
    // requires an existing upkeep relationship (an active Haven-primary link
    // to tend). A pre-court crossing (no tendable link) is mechanism-inert
    // by construction: there is no tending to stop. Ineligible events are
    // detected and reported but do NOT count toward the DIAG-GO bar.
    ev.eligible = ev.armedOthers.length > 0;
    const aT = [], cT = [];
    for (let k = 0; k <= TRUST_WIN; k++) {
      aT.push(weeklyTrust(aLinks, ev.week + k, 1));
      cT.push(cRow ? weeklyTrust(cLinks, ev.week + k, 1) : null);
    }
    ev.armedTrust = aT.map(v => v == null ? null : +v.toFixed(1));
    ev.controlTrust = cT.map(v => v == null ? null : +v.toFixed(1));
    const pairedFull = aT[0] != null && aT[TRUST_WIN] != null && cT[0] != null && cT[TRUST_WIN] != null;
    // longest available window (up to 4w) for truncated reporting
    let kMax = 0;
    for (let k = 1; k <= TRUST_WIN; k++) {
      if (aT[k] != null && cT[k] != null) kMax = k; else break;
    }
    ev.pairedFull = pairedFull;
    ev.weeksUsed = kMax;
    ev.armedDelta = aT[kMax] != null && aT[0] != null ? +(aT[kMax] - aT[0]).toFixed(1) : null;
    ev.controlDelta = cT[kMax] != null && cT[0] != null ? +(cT[kMax] - cT[0]).toFixed(1) : null;
    ev.pairedDelta = (ev.armedDelta != null && ev.controlDelta != null) ? +(ev.armedDelta - ev.controlDelta).toFixed(1) : null;
    // attribution
    const u = aRow.upkeep || {};
    const lostEv = (u.natEvents || []).find(e => e.kind === 'lost' && e.d >= ev.week * 7 && e.d <= (ev.week + DISS_WIN_WEEKS) * 7);
    if (lostEv) {
      const cls = classifyPostGateLoss(aRow, lostEv);
      ev.attribution = 'dissolution:' + cls.cause;
      ev.attributionDetail = `nationalLive lost d${lostEv.d} (${cls.detail})`;
      ev.dissolution = { day: lostEv.d, cause: cls.cause, detail: cls.detail };
    } else if (ev.recrossWeeks.length && ev.recrossWeeks[0] <= ev.week + TRUST_WIN) {
      ev.attribution = 'gate-recrossed-transient';
      ev.attributionDetail = `pantry back above ${TEND_GATE_KCAL} at week ${ev.recrossWeeks[0]} (tending resumes)`;
    } else if ((aRow.days || 0) < (ev.week + 2) * 7) {
      ev.attribution = 'village-died-truncated';
      ev.attributionDetail = `village dead d${aRow.days} (${aRow.endReason}) inside the post-gate window`;
    } else if (!ev.armedOthers.length) {
      ev.attribution = 'no-tendable-link';
      ev.attributionDetail = 'no active Haven-primary link at the gate week (mechanism inapplicable)';
    } else if (ev.armedDelta != null && ev.armedDelta <= -10) {
      ev.attribution = 'trust-erosion-no-dissolution';
      ev.attributionDetail = `mean polity trust ${ev.armedTrust[0]} -> ${ev.armedTrust[ev.weeksUsed]} over ${ev.weeksUsed}w, realm held`;
    } else if (ev.armedDelta != null) {
      // trust stable or RISING post-gate (not eroding), realm held — the
      // mechanism's core prediction (erosion) is disconfirmed on this event.
      // (Taxonomy completion, not a re-score: the bar still judges the mean.)
      ev.attribution = 'trust-stable-or-rising';
      ev.attributionDetail = `mean polity trust ${ev.armedTrust[0]} -> ${ev.armedTrust[ev.weeksUsed]} over ${ev.weeksUsed}w (not eroding), realm held — mechanism disconfirmed on this event`;
    } else {
      ev.attribution = 'unexplained';
      ev.attributionDetail = `trust trajectory ${JSON.stringify(ev.armedTrust)} does not erode; no dissolution, no recross`;
    }
  }

  // ---- DIAG-GO evaluation (on ELIGIBLE events — see eligibility note above) ----
  const eligEvents = events.filter(e => e.eligible);
  const ineligEvents = events.filter(e => !e.eligible);
  const nEvents = eligEvents.length;
  const attributed = eligEvents.filter(e => e.attribution && e.attribution !== 'unexplained');
  const unexplained = eligEvents.filter(e => e.attribution === 'unexplained');
  const pairedFull = eligEvents.filter(e => e.pairedFull && e.pairedDelta != null);
  const meanPairedDelta = pairedFull.length
    ? +(pairedFull.reduce((t, e) => t + e.pairedDelta, 0) / pairedFull.length).toFixed(1) : null;
  const dissolutions = eligEvents.filter(e => e.dissolution);
  const dissAttributed = dissolutions.filter(e => e.dissolution.cause !== 'unexplained');

  const bar1 = nEvents >= 4 && attributed.length === nEvents;
  const bar2 = meanPairedDelta != null && meanPairedDelta <= -15;
  const bar3 = dissolutions.length === 0 ? 'vacuous' : (dissAttributed.length === dissolutions.length);
  const bar4 = unexplained.length === 0 && dissolutions.every(e => e.dissolution.cause !== 'unexplained');

  let verdict;
  if (nEvents < 4) verdict = 'DIAG-insufficient-data';
  else if (bar1 && bar2 && bar3 !== false && bar3 !== 'vacuous' || (bar1 && bar2 && bar3 === 'vacuous' && bar4)) verdict = 'DIAG-GO';
  // note: vacuous bar3 (no post-gate dissolutions at all) cannot satisfy "100%
  // post-gate realm-dissolution attribution" as evidence -> stays open unless
  // dissolutions exist and attribute. Keep the logic explicit below.
  else verdict = 'NO-GO';
  // explicit, readable verdict logic (overrides the compact expression above):
  if (nEvents < 4) verdict = 'DIAG-insufficient-data';
  else if (!bar1) verdict = 'NO-GO';
  else if (!bar2) verdict = 'NO-GO';
  else if (dissolutions.length === 0) verdict = 'NO-GO'; // trust erodes but nothing dissolves: mechanism unconfirmed
  else if (bar3 !== true || !bar4) verdict = 'NO-GO';
  else verdict = 'DIAG-GO';

  // ---- wall numbers (paired, armed / control, n=16) ----
  const wall = rows => {
    const n = rows.length;
    const ever = rows.filter(r => (r.nationalDay || 0) > 0).length;
    return {
      n,
      won: rows.filter(r => r.won).length,
      nationalEnd: rows.filter(r => r.national).length,
      nationalEver: ever,
      table: rows.filter(r => r.table).length,
      wave4: rows.filter(r => (r.maxWave || 1) >= 4).length,
      wave5: rows.filter(r => (r.maxWave || 1) >= 5).length,
      exiled: rows.filter(r => r.exiled).length,
      medianDays: median(rows.map(r => r.days || 0)),
      maxDays: Math.max(...rows.map(r => r.days || 0)),
    };
  };
  const armedAll = armedLead.rows.concat(armedBelong.rows);
  const controlAll = controlLead.rows.concat(controlBelong.rows);
  const wallArmed = wall(armedAll), wallControl = wall(controlAll);

  const summary = {
    meta: { dir: DIR, gate: TEND_GATE_KCAL, seeds: '8801-8808 paired reuse', policies: ['leadfeast', 'belongfeast'], days: 180,
      eligibility: 'event counts toward the bar only with >=1 active Haven-primary link at the gate week (tending must exist to stop)' },
    events: eligEvents.map(e => ({
      seed: e.seed, arm: e.arm, week: e.week, day: e.week * 7,
      beforeKcal: e.beforeKcal, afterKcal: e.afterKcal,
      armedOthers: e.armedOthers, controlOthers: e.controlOthers,
      armedTrust: e.armedTrust, controlTrust: e.controlTrust,
      pairedFull: e.pairedFull, weeksUsed: e.weeksUsed,
      armedDelta: e.armedDelta, controlDelta: e.controlDelta, pairedDelta: e.pairedDelta,
      attribution: e.attribution, attributionDetail: e.attributionDetail,
      dissolution: e.dissolution || null,
    })),
    ineligibleEvents: ineligEvents.map(e => ({ seed: e.seed, week: e.week, beforeKcal: e.beforeKcal, afterKcal: e.afterKcal, attribution: e.attribution })),
    controlEvents: controlEvents.map(e => ({ seed: e.seed, week: e.week, beforeKcal: e.beforeKcal, afterKcal: e.afterKcal })),
    bars: {
      bar1_events_ge_4_all_attributed: { value: `${attributed.length}/${nEvents}`, pass: bar1 },
      bar2_mean_paired_4w_trust_delta_le_neg15: { value: meanPairedDelta, n: pairedFull.length, pass: bar2 },
      bar3_postgate_dissolution_attribution_100: { value: `${dissAttributed.length}/${dissolutions.length}`, pass: bar3 },
      bar4_zero_unexplained: { value: unexplained.length, pass: bar4 },
    },
    verdict,
    wall: { armed: wallArmed, control: wallControl },
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(summary, null, 1));
  console.log(JSON.stringify({ verdict, nEvents, nIneligible: ineligEvents.length, meanPairedDelta, nPairedFull: pairedFull.length, dissolutions: dissolutions.length, unexplained: unexplained.length, wallArmed, wallControl }, null, 1));
  console.log('wrote ' + OUT);
  return summary;
}

function median(xs) {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

if (require.main === module) main();
module.exports = { main, weeklyTrust, classifyPostGateLoss };
