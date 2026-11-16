// analyze-awayhaven-b.js — classifier for arm sim-awayhaven-b (DIAG).
// Resolves the 18 away-while-at-Haven member-dawn rows (9 distinct
// members) from the poolmarginals instrument leg: per-member day-by-day
// away flag + node + activity traces, one frozen class each.
// Requires the poolmarginals analyzer (not copied): reuses its
// classifyMarginals (pool-row validity + the agree check) and
// summarizeMarginals (wall numbers), then classifies from the raw
// pool rows' members arrays joined to the classified dawns and the
// driver's awayTrace daily snapshots.
// Frozen definitions: evidence/2026-11-16/sim-awayhaven-b-prereg.md.
// Classes: (a) linger-after-return, (b) non-spatial absence,
// (c) recorder / node-read artifact, (d) other-with-evidence.
// UNRESOLVED is counted separately and must name the missing hook.
// Usage:
//   node scripts/analyze-awayhaven-b.js <instrumentDir> [controlDir]
// Writes evidence/2026-11-16/awayhaven-b-analysis.json. Exits 0 iff
// every instrument-leg flagged member is classified (a)-(d),
// UNRESOLVED is 0 or fully hook-named, all files parse, and no
// instrument errors.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const PM = require(path.join(REPO, 'scripts', 'analyze-poolmarginals-b.js'));

const W4_IDS_FROZEN = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'];
const W4_SET = new Set(W4_IDS_FROZEN);

function loadDir(dir) {
  const out = {};
  const files = fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort();
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[j.seed] = j;
  }
  return { bySeed: out, files: files };
}
function round(x, n) { return Math.round(x * Math.pow(10, n)) / Math.pow(10, n); }
function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function atHaven(node, haven) {
  return !!(node && haven && node.nx === haven.nx && node.ny === haven.ny);
}

// extractFlagged(j): distinct members flagged away while their node
// reads Haven, over the marginal-classified dawns only (the same
// denominator the poolmarginals marginal table uses). Returns a list
// of {seed, id, name, profile, engaged, onExped, trust, flagDays,
// flagRows} where flagDays are the dawn days and flagRows carry the
// pool row context (holder vid, target, node) per flag day.
function extractFlagged(j) {
  const base = PM.classifyMarginals(j);
  const byKey = {};
  for (const r of (j.companionPool || [])) {
    if (r && r.vid != null && r.day != null) byKey[r.vid + '|' + r.day + '|' + (r.target || '')] = r;
  }
  const found = {};
  for (const dawn of base.poolDawns) {
    if (!dawn.marginalClassified) continue;
    const row = byKey[dawn.vid + '|' + dawn.day + '|' + (dawn.target || '')] || null;
    if (!row || !Array.isArray(row.members)) continue;
    for (const m of row.members) {
      if (!m || m.firstFail !== 'away' || m.away !== true) continue;
      if (!atHaven(m.node, row.haven)) continue;
      const key = j.seed + '|' + m.id;
      if (!found[key]) {
        found[key] = { seed: j.seed, id: m.id, name: null, profile: m.profile,
          engaged: m.engaged, onExped: m.onExped, trust: m.trust,
          flagDays: [], flagRows: [] };
      }
      found[key].flagDays.push(dawn.day);
      found[key].flagRows.push({ day: dawn.day, holderVid: dawn.vid, target: dawn.target,
        node: m.node, profile: m.profile, engaged: m.engaged, onExped: m.onExped, trust: m.trust });
    }
  }
  const list = Object.values(found);
  for (const f of list) {
    f.flagDays.sort(function (a, b) { return a - b; });
    f.flagRows.sort(function (a, b) { return a.day - b.day; });
  }
  return { classified: base, flagged: list };
}

// buildTrace(j, memberId): the member's full awayTrace series, sorted
// by day. The trace is end-of-day state; the pool row is dawn state,
// so a flag day's trace row may already show a same-day return — the
// classifier reads the spell, not a single row.
function buildTrace(j, memberId) {
  const rows = ((j.awayTrace || []).filter(function (r) { return r && r.id === memberId; }));
  rows.sort(function (a, b) { return a.day - b.day; });
  return rows;
}

// classifyMember(rows, flagDays, haven): the frozen classification,
// read per TRIP, not per spell. A spell (a maximal run of away===true
// trace days) merges back-to-back trips — a new away record is a new
// trip even when the days are adjacent — and it compares a dawn pool
// read against end-of-day trace rows, which is the wrong clock: the
// pool reads at part 0 (dawn scoring, after the base travel pass),
// the trace snapshots at end of day. The trip is identified by the
// away record itself (sinceDay/sincePart/purpose/nx,ny); each flag
// day is evaluated against the trip live at that dawn:
//   (a) linger-after-return — the trip's node left Haven, came back
//       on arrival day A, and a flag day falls >= A+1 while the trip
//       is still live at dawn (flag day <= trip end + 1).
//   (b) non-spatial absence — the trip's destination IS Haven and
//       the node never left Haven during the trip (expedition to the
//       Haven tile / objective departure to a Haven target).
//   (c) recorder / node-read artifact — NO trip covers a flag day
//       and the trace is complete there (the pool row disagrees with
//       the daily record), OR the flag day falls strictly inside a
//       trip whose node is off-Haven on every trace day through it
//       with no arrival yet (no return walk is possible inside a
//       continuous trip, so no code path puts the dawn node at Haven).
//   (d) other, with evidence — return-day (the flag day IS the
//       arrival day: the return walk lands at dawn and the away
//       clock expires later that day), departure-part flicker (the
//       flag day is the trip's first day: departed at dawn and the
//       at-site meander stepped the node onto Haven before the dawn
//       scoring), or departure-recorded-never-moved (node Haven on
//       every trip day though the record points off-Haven).
//   UNRESOLVED — the trace cannot decide; missingHook names what
//   would decide it (including flag days split across mechanisms).
function classifyMember(rows, flagDays, haven) {
  const firstFlag = flagDays[0];
  const lastFlag = flagDays[flagDays.length - 1];
  const defaultStart = firstFlag - 5;
  const defaultEnd = lastFlag + 5;
  if (!rows.length) {
    return { cls: 'UNRESOLVED', missingHook: 'no awayTrace rows for this member at all',
      evidence: 'trace series empty; cannot tell whether the member was away, at Haven, or neither',
      window: { start: defaultStart, end: defaultEnd, widened: false }, spell: null, details: {} };
  }
  const byDay = {};
  for (const r of rows) byDay[r.day] = r;
  // Trace completeness on the flag days.
  const missingFlagDays = flagDays.filter(function (d) { return !byDay[d]; });
  if (missingFlagDays.length) {
    return { cls: 'UNRESOLVED', missingHook: 'awayTrace gap on flag day(s) ' + missingFlagDays.join(','),
      evidence: 'no trace row on the flagged dawn(s); the trip boundaries cannot be read',
      window: { start: defaultStart, end: defaultEnd, widened: false }, spell: null, details: { missingFlagDays: missingFlagDays } };
  }
  // TRIPS: away===true trace rows grouped by away-record identity
  // (sinceDay/sincePart/purpose/nx,ny). A new identity is a new trip
  // even when the days are adjacent; a missing trace day does not
  // split a trip — the record identity is the key, not adjacency.
  function tripKey(r) {
    const a = r.awayRaw || {};
    if (a && a.sinceDay != null) return [a.sinceDay, a.sincePart, a.purpose, a.nx, a.ny].join('/');
    const e = r.exped || {};
    if (e && e.sinceDay != null) return ['exped', e.sinceDay, e.sincePart, e.tx, e.ty].join('/');
    return 'unknown/' + r.day;
  }
  const trips = [];
  let curTrip = null;
  for (const r of rows) {
    if (r.away !== true) { curTrip = null; continue; }
    const k = tripKey(r);
    if (!curTrip || curTrip.key !== k) {
      curTrip = { key: k, start: r.day, end: r.day, days: [r.day], rec: r.awayRaw || null };
      trips.push(curTrip);
    } else { curTrip.end = r.day; curTrip.days.push(r.day); }
  }
  // The trip live at a flag day's dawn: the trip whose trace span
  // holds the day, or ends the day before it (return-day: away at
  // dawn, cleared during the day). When two trips touch the day, the
  // dawn departure (sinceDay == day, sincePart == 0) wins — a part-0
  // departure overwrites the record before the dawn scoring runs.
  function coveringTrip(d) {
    const cands = trips.filter(function (t) { return d >= t.start && d <= t.end + 1; });
    if (!cands.length) return null;
    if (cands.length === 1) return cands[0];
    const dawn = cands.find(function (t) { return t.rec && t.rec.sinceDay === d && (t.rec.sincePart | 0) === 0; });
    return dawn || cands[0];
  }
  // Per-trip trajectory facts. arrivalDay is the first trip day the
  // node reads Haven AFTER off-Haven days; it can also land the
  // morning after the last away day (return walk at dawn, clock
  // expiring later that day), read off the next trace row.
  function tripFacts(t) {
    const trows = rows.filter(function (r) { return r.day >= t.start && r.day <= t.end; });
    let everOff = false, arrivalDay = null;
    for (const r of trows) {
      const off = r.node && !atHaven(r.node, haven);
      if (off) everOff = true;
      if (arrivalDay == null && everOff && r.node && atHaven(r.node, haven)) arrivalDay = r.day;
    }
    if (arrivalDay == null && everOff) {
      const after = byDay[t.end + 1];
      if (after && after.away !== true && after.node && atHaven(after.node, haven)) arrivalDay = t.end + 1;
    }
    const rec = t.rec || {};
    const destHaven = rec.nx != null && rec.ny != null && rec.nx === haven.nx && rec.ny === haven.ny;
    let expedFirstDay = null, expedLastDay = null, expedDestHaven = false;
    for (const r of trows) {
      if (r.exped) {
        if (expedFirstDay == null) expedFirstDay = r.day;
        expedLastDay = r.day;
        if (r.exped.tx === haven.nx && r.exped.ty === haven.ny) expedDestHaven = true;
      }
    }
    return { trows: trows, everOff: everOff, arrivalDay: arrivalDay,
      destHaven: destHaven, expedDestHaven: expedDestHaven,
      expedFirstDay: expedFirstDay, expedLastDay: expedLastDay };
  }
  // Return-clock reading at a flag day's dawn, from the away record:
  // partsAway = (day - sinceDay)*4 + (0 - sincePart); the flag is
  // live while partsAway < duration (game.js npcNodeTravel).
  function clockAtDawn(t, d) {
    const rec = t.rec || {};
    if (rec.sinceDay == null || rec.duration == null) return null;
    const parts = (d - rec.sinceDay) * 4 + (0 - (rec.sincePart | 0));
    return { parts: parts, duration: rec.duration, expired: parts >= rec.duration };
  }
  // Classify one flag day against its covering trip.
  function classifyFlagDay(d) {
    const t = coveringTrip(d);
    if (!t) {
      return { cls: '(c)', mechanism: 'no-trip',
        evidence: 'pool row flags the member away-at-Haven at dawn of day ' + d +
          ' but no away trip covers that dawn in the daily trace (away=false on the flag day and the ' +
          'nearest trips are ' + JSON.stringify(trips.map(function (x) { return [x.start, x.end]; })) +
          '); the pool row and the daily record disagree' };
    }
    const f = tripFacts(t);
    const rec = t.rec || {};
    const flagRow = byDay[d];
    const purpose = rec.purpose || (flagRow && flagRow.exped ? 'expedition' : 'unknown');
    const tripName = 'trip ' + t.start + '-' + t.end + ' (' + purpose + ' ->(' +
      (rec.nx != null ? rec.nx + ',' + rec.ny : '?,?') + '), since ' + rec.sinceDay + '/' + (rec.sincePart | 0) + ', dur ' + rec.duration + ')';
    // (b) non-spatial absence: the trip's destination IS Haven and
    // the node never left Haven during the trip.
    if ((f.destHaven || f.expedDestHaven) && !f.everOff) {
      return { cls: '(b)', mechanism: 'to-haven',
        evidence: 'node never left Haven during ' + tripName + '; the trip destination IS Haven (' +
          (f.expedDestHaven ? 'expedition tx,ty=' + haven.nx + ',' + haven.ny : 'away nx,ny=' + rec.nx + ',' + rec.ny) +
          ') — the flag marks a trip whose destination is home, not a spatial absence' };
    }
    // (a) linger-after-return: arrived home, flag >=1 day after the
    // arrival, trip still live at dawn (flag day <= trip end + 1).
    if (f.arrivalDay != null && d >= f.arrivalDay + 1 && d <= t.end + 1) {
      return { cls: '(a)', mechanism: 'linger',
        evidence: 'node left Haven during ' + tripName + ', walked back to Haven on day ' + f.arrivalDay +
          ', and the flag was still set at dawn of day ' + d + ' — ' + (d - f.arrivalDay) +
          ' day(s) after the return' };
    }
    // (d) return-day: the flag day IS the arrival day.
    if (f.arrivalDay != null && d === f.arrivalDay) {
      const ck = clockAtDawn(t, d);
      const clockNote = ck ? (' at dawn the clock read ' + ck.parts + ' parts against a duration of ' + ck.duration +
        (ck.expired ? ' (expired — the flag should already have cleared)' : ' (unexpired — the flag was still live)')) : '';
      return { cls: '(d)', mechanism: 'return-day',
        evidence: 'flag day ' + d + ' is the return day itself: the return walk put the node on Haven at dawn of ' + tripName +
          ' (node off-Haven on day ' + (f.arrivalDay - 1) + ', Haven from day ' + f.arrivalDay + ')' + clockNote +
          '; the frozen (a) rule (flag >=1 day after the return) does not fire — the dawn scoring sits in the window between the walk home and the clock expiring' };
    }
    // (d) departure-part flicker: the flag day is the trip's first
    // day — departed at dawn, and the at-site meander stepped the
    // node onto Haven before the dawn scoring.
    if (d === t.start && rec.sinceDay === d && !f.destHaven && !f.expedDestHaven &&
        flagRow && flagRow.node && rec.nx != null && flagRow.node.nx === rec.nx && flagRow.node.ny === rec.ny) {
      const comp = (flagRow.objective && flagRow.objective.companion) || null;
      return { cls: '(d)', mechanism: 'departure-flicker',
        evidence: 'flag day ' + d + ' is the departure day of ' + tripName +
          (comp ? ' (guard companion ' + comp + ')' : '') +
          ': the member departed at dawn (objDepart sets the node to the target, villager-objectives.js:1383) and the same travel pass then ran objAwayStep on the member\'s own roster turn — already at the post, the at-site meander (villager-objectives.js:1684, 50% when partsLeft>1) stepped the node onto Haven before the dawn scoring (objTick runs after the base travel, villager-objectives.js:2289); by end of day ' + d + ' the node is back at the post (' + rec.nx + ',' + rec.ny + ')' };
    }
    // (d) departure recorded but the node never moved.
    if (!f.everOff && !f.destHaven && !f.expedDestHaven) {
      return { cls: '(d)', mechanism: 'never-moved',
        evidence: 'node never left Haven during ' + tripName + ' yet the away record points off-Haven (nx,ny=' +
          rec.nx + ',' + rec.ny + ', purpose ' + (rec.purpose || 'unknown') + ') — the departure was recorded but the member never moved in any end-of-day read' };
    }
    // (c) node-read: the flag day falls strictly inside the trip, the
    // node is off-Haven on every trace day through it, and there is no
    // arrival yet — no code path puts the dawn node at Haven inside a
    // continuous trip (the return walk ends the trip; the at-site
    // meander steps only to adjacent tiles).
    if (d > t.start && d <= t.end && flagRow && flagRow.node && !atHaven(flagRow.node, haven) && (f.arrivalDay == null || f.arrivalDay > d)) {
      return { cls: '(c)', mechanism: 'node-read',
        evidence: 'trace shows the node off-Haven for the whole of ' + tripName + ' through flag day ' + d +
          ' (node ' + flagRow.node.nx + ',' + flagRow.node.ny + ' on the flag day itself) with no arrival yet — no code path puts the dawn node at Haven inside a continuous trip, so the pool row\'s Haven read disagrees with the daily record' };
    }
    return { cls: 'UNRESOLVED', mechanism: 'no-branch',
      missingHook: 'flag day ' + d + ' against ' + tripName + ': no (a)-(d) branch matched (arrivalDay=' + f.arrivalDay + ', everOff=' + f.everOff + ', destHaven=' + f.destHaven + '); need a part-level probe of the dawn pass',
      evidence: 'trace shape falls outside (a)-(d) as implemented for flag day ' + d };
  }
  const perDay = flagDays.map(function (d) {
    const r = classifyFlagDay(d);
    return { day: d, cls: r.cls, mechanism: r.mechanism, evidence: r.evidence, missingHook: r.missingHook || null };
  });
  const coveringTrips = [];
  for (const d of flagDays) {
    const t = coveringTrip(d);
    if (t && coveringTrips.indexOf(t) === -1) coveringTrips.push(t);
  }
  const firstTrip = coveringTrips[0] || null;
  const spell = firstTrip ? [firstTrip.start, firstTrip.end] : null;
  // Window: default ±5, widened to cover every covering trip.
  let wStart = defaultStart, wEnd = defaultEnd, widened = false, widenNote = null;
  for (const t of coveringTrips) {
    if (t.start < wStart) { wStart = t.start; widened = true; }
    if (t.end > wEnd) { wEnd = t.end; widened = true; }
  }
  if (widened) widenNote = 'window widened to cover the away trip(s) ' + coveringTrips.map(function (t) { return t.start + '-' + t.end; }).join(', ');
  const window = { start: wStart, end: wEnd, widened: widened, widenNote: widenNote };
  // Details (the keys the proof test reads are kept, plus the trip
  // decomposition so the evidence can name the covering trip).
  let returnDay = null;
  if (coveringTrips.length) {
    const lastEnd = coveringTrips[coveringTrips.length - 1].end;
    for (const r of rows) {
      if (r.day > lastEnd && r.away !== true) { returnDay = r.day; break; }
    }
  }
  const firstFacts = firstTrip ? tripFacts(firstTrip) : null;
  const graceDays = flagDays.filter(function (d) {
    return coveringTrips.some(function (t) { return d === t.end + 1; });
  });
  const flagInside = flagDays.find(function (d) { const t = coveringTrip(d); return t && d >= t.start && d <= t.end; });
  const flagRowForDetails = flagInside != null ? byDay[flagInside] : (firstTrip ? byDay[firstTrip.end] : null);
  let expedVanished = false;
  for (const t of coveringTrips) {
    const tf = tripFacts(t);
    if (tf.expedFirstDay != null) {
      const onFlag = flagDays.some(function (d) { const r = byDay[d]; return r && r.exped; });
      if (!onFlag) expedVanished = true;
    }
  }
  const details = {
    trips: trips.map(function (t) { return { start: t.start, end: t.end, key: t.key,
      purpose: (t.rec || {}).purpose || null, target: (t.rec && t.rec.nx != null) ? [t.rec.nx, t.rec.ny] : null,
      sinceDay: (t.rec || {}).sinceDay, sincePart: (t.rec || {}).sincePart, duration: (t.rec || {}).duration }; }),
    coveringTrips: coveringTrips.map(function (t) { return [t.start, t.end]; }),
    perDay: perDay,
    spell: spell,
    otherCoveringSpells: coveringTrips.slice(1).map(function (t) { return [t.start, t.end]; }),
    graceDays: graceDays,
    returnDay: returnDay,
    everOffHaven: firstFacts ? firstFacts.everOff : null,
    nodeReturnDay: firstFacts ? firstFacts.arrivalDay : null,
    awayRec: firstTrip ? (firstTrip.rec || null) : null,
    expedOnFlagDay: (flagRowForDetails && flagRowForDetails.exped) || null,
    objectiveOnFlagDay: (flagRowForDetails && flagRowForDetails.objective) || null,
    expedRange: (firstFacts && firstFacts.expedFirstDay != null) ? [firstFacts.expedFirstDay, firstFacts.expedLastDay] : null,
    expedVanished: expedVanished,
    flagDays: flagDays.slice(),
  };
  const classes = Array.from(new Set(perDay.map(function (p) { return p.cls; })));
  if (classes.length === 1 && classes[0] !== 'UNRESOLVED') {
    return { cls: classes[0],
      evidence: perDay.map(function (p) { return 'day ' + p.day + ': ' + p.evidence; }).join(' | '),
      window: window, spell: spell, details: details };
  }
  if (classes.length === 1) {
    const p0 = perDay[0];
    return { cls: 'UNRESOLVED', missingHook: p0.missingHook,
      evidence: p0.evidence, window: window, spell: spell, details: details };
  }
  return { cls: 'UNRESOLVED',
    missingHook: 'flag days split across mechanisms: ' + perDay.map(function (p) { return p.day + '->' + p.cls + '/' + p.mechanism; }).join(', ') + '; need a per-trip ruling for the split',
    evidence: 'flag days do not share one mechanism: ' + perDay.map(function (p) { return 'day ' + p.day + ': ' + p.evidence; }).join(' | '),
    window: window, spell: spell, details: details };
}
// classifyLeg(rawLeg): extract + classify every flagged member on a
// leg. rawLeg: {bySeed: raw per-seed JSON, files} — extractFlagged
// classifies each seed internally exactly once; never pre-classify
// the leg (classifyMarginals' output drops the raw arrays, so a
// second classification would see no pool rows at all).
function classifyLeg(rawLeg) {
  const flagged = [];
  let flagRows = 0;
  for (const k of Object.keys(rawLeg.bySeed).sort()) {
    const j = rawLeg.bySeed[k];
    const ext = extractFlagged(j);
    for (const f of ext.flagged) {
      flagRows += f.flagDays.length;
      const rows = buildTrace(j, f.id);
      const haven = (rows.length && rows[0].haven) || { nx: 4, ny: 4 };
      // Name from the trace (displayName); fall back to the id.
      const named = rows.find(function (r) { return r.name; });
      if (named) f.name = named.name;
      const c = classifyMember(rows, f.flagDays, haven);
      flagged.push(Object.assign({}, f, { classification: c.cls, evidence: c.evidence,
        window: c.window, spell: c.spell, details: c.details,
        missingHook: c.missingHook || null,
        traceRows: rows.filter(function (r) { return r.day >= c.window.start && r.day <= c.window.end; }) }));
    }
  }
  const counts = { '(a)': 0, '(b)': 0, '(c)': 0, '(d)': 0, UNRESOLVED: 0 };
  for (const f of flagged) counts[f.classification] = (counts[f.classification] || 0) + 1;
  return { flagged: flagged, flagRows: flagRows, counts: counts,
    classifiedShare: flagged.length ? round(flagged.filter(function (f) { return f.classification !== 'UNRESOLVED'; }).length / flagged.length, 4) : null,
    unresolved: flagged.filter(function (f) { return f.classification === 'UNRESOLVED'; }).length };
}

function summarizeLeg(rawLeg) {
  // The marginal summary needs classified per-seed objects; the
  // wave-4 fight / death counts need the RAW per-seed JSONs (the
  // classified objects drop v4encounters/deaths). Build both.
  const clsLeg = { bySeed: {}, files: rawLeg.files };
  for (const k of Object.keys(rawLeg.bySeed)) clsLeg.bySeed[k] = PM.classifyMarginals(rawLeg.bySeed[k]);
  const summary = PM.summarizeMarginals(clsLeg);
  const seeds = Object.keys(rawLeg.bySeed).sort().map(function (k) { return rawLeg.bySeed[k]; });
  let w4kills = 0, w4fights = 0, w4flees = 0, w4deaths = 0, w4evades = 0, deaths = 0;
  const deathKinds = {};
  for (const s of seeds) {
    for (const e of (s.v4encounters || [])) {
      w4fights++;
      if (e.outcome === 'vKill') w4kills++;
      else if (e.outcome === 'vFlee') w4flees++;
      else if (e.outcome === 'vDie') w4deaths++;
      else if (e.outcome === 'evade') w4evades++;
    }
    deaths += (s.deaths || []).length;
    for (const d of (s.deaths || [])) deathKinds[d.kind || 'unknown'] = (deathKinds[d.kind || 'unknown'] || 0) + 1;
  }
  return Object.assign({}, summary, { wave4Kills: w4kills, wave4Fights: w4fights,
    wave4Flees: w4flees, wave4Deaths: w4deaths, wave4Evades: w4evades,
    deaths: deaths, deathKinds: deathKinds });
}

function main() {
  const instrumentDir = process.argv[2];
  const controlDir = process.argv[3] || null;
  if (!instrumentDir) { console.error('AWAYHAVEN ANALYZE STOP: instrumentDir required.'); process.exit(2); }
  let liveW4 = null;
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    liveW4 = list.filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
  } catch (e) {}
  const frozenSorted = W4_IDS_FROZEN.slice().sort();
  const w4Match = liveW4 && JSON.stringify(liveW4) === JSON.stringify(frozenSorted);

  const inst = loadDir(instrumentDir);
  const instClass = classifyLeg(inst);
  const instSummary = summarizeLeg(inst);
  let ctrlClass = null, ctrlSummary = null;
  if (controlDir) {
    const ctrl = loadDir(controlDir);
    ctrlClass = classifyLeg(ctrl);
    ctrlSummary = summarizeLeg(ctrl);
  }
  const instErrors = instSummary.firstFail.perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0);
  const ctrlErrors = ctrlSummary ? ctrlSummary.firstFail.perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0) : 0;
  const unresolvedNamed = instClass.flagged.filter(function (f) { return f.classification === 'UNRESOLVED'; })
    .every(function (f) { return !!f.missingHook; });
  const bar1 = instClass.flagged.length > 0 && instClass.classifiedShare === 1 && unresolvedNamed;
  const bar2 = inst.files.length === 8 && (!ctrlSummary || ctrlSummary.firstFail.files === 8);
  const bar3 = instErrors === 0 && ctrlErrors === 0;

  const out = {
    arm: 'awayhaven-b', run: 'awayhaven-b',
    instrumentDir: path.basename(instrumentDir), controlDir: controlDir ? path.basename(controlDir) : null,
    wave4IdsMatch: !!w4Match, wave4IdsLive: liveW4, wave4IdsFrozen: frozenSorted,
    instrument: { summary: instSummary, classification: instClass },
    control: ctrlSummary ? { summary: ctrlSummary, classification: ctrlClass } : null,
    bars: {
      classification: { pass: bar1, flaggedMembers: instClass.flagged.length, flagRows: instClass.flagRows,
        classifiedShare: instClass.classifiedShare, unresolved: instClass.unresolved,
        unresolvedAllNamed: unresolvedNamed, counts: instClass.counts },
      corpus: { pass: bar2, instrumentFiles: inst.files.length, controlFiles: ctrlSummary ? ctrlSummary.firstFail.files : null },
      instrumentErrors: { pass: bar3, instrument: instErrors, control: ctrlErrors },
    },
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-16', 'awayhaven-b-analysis.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');

  console.log('=== awayhaven-b classification (instrument leg) ===');
  console.log('flagged members: ' + instClass.flagged.length + '  flag rows: ' + instClass.flagRows +
    '  classified share: ' + instClass.classifiedShare + '  unresolved: ' + instClass.unresolved);
  console.log('counts: ' + JSON.stringify(instClass.counts));
  for (const f of instClass.flagged) {
    console.log('  seed ' + f.seed + ' ' + f.id + ' (' + (f.name || '?') + ', ' + f.profile +
      ', flag days ' + f.flagDays.join(',') + ') -> ' + f.classification +
      (f.window && f.window.widened ? ' [window widened]' : ''));
  }
  console.log('wall (instrument): ' + JSON.stringify(instSummary.wall) + '  medianSurvival: ' + instSummary.medianSurvival +
    '  wave4Kills: ' + instSummary.wave4Kills + '/' + instSummary.wave4Fights + ' fights  deaths: ' + instSummary.deaths);
  if (ctrlSummary) {
    console.log('--- control leg ---');
    console.log('flagged members: ' + ctrlClass.flagged.length + '  flag rows: ' + ctrlClass.flagRows +
      '  counts: ' + JSON.stringify(ctrlClass.counts));
    for (const f of ctrlClass.flagged) {
      console.log('  seed ' + f.seed + ' ' + f.id + ' (' + (f.name || '?') + ', ' + f.profile +
        ', flag days ' + f.flagDays.join(',') + ') -> ' + f.classification);
    }
    console.log('wall (control): ' + JSON.stringify(ctrlSummary.wall) + '  medianSurvival: ' + ctrlSummary.medianSurvival +
      '  wave4Kills: ' + ctrlSummary.wave4Kills + '/' + ctrlSummary.wave4Fights + ' fights  deaths: ' + ctrlSummary.deaths);
  }
  console.log('bars: classification=' + (bar1 ? 'PASS' : 'FAIL') +
    ' corpus=' + (bar2 ? 'PASS' : 'FAIL') + ' instrumentErrors=' + (bar3 ? 'PASS' : 'FAIL') +
    ' wave4Ids=' + (w4Match ? 'MATCH' : 'MISMATCH'));
  console.log('analysis: ' + path.relative(REPO, outFile));
  if (!bar1 || !bar2 || !bar3 || !w4Match) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { extractFlagged: extractFlagged, buildTrace: buildTrace,
  classifyMember: classifyMember, classifyLeg: classifyLeg, summarizeLeg: summarizeLeg };

