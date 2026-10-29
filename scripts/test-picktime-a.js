#!/usr/bin/env node
// scripts/test-picktime-a.js — sim-picktime-a joint analyzer.
// DIAG ONLY. PURE READS over the picktime corpus
// (evidence/2026-10-29/perseed-picktime-a/, seeds 75101-75108)
// + the funnel-a corpus for the neutrality leg + src/data/
// monsters.json wave lookup. No game code, no policy, no RNG.
//
// The join, per the committed prereg
// (evidence/2026-10-29/sim-picktime-a-prereg.md):
//   DEPARTLAG CLASS: classifyPick imported VERBATIM from
//     scripts/test-departlag-a.js (earliest of matching
//     departure, next recorded pick, villager death; a
//     departure on the death day itself is UNKNOWN). Never
//     copied, never re-implemented here.
//   VERDICT TERMINAL: departhold evaluations in the pick's
//     window (part in [pick.part, first-later-pick part),
//     same vid, same huntMid AND same huntDay in pre or
//     post). OVERWRITTEN-BY-VERDICT if any window
//     evaluation has action 'overwritten'; else
//     DEPARTED-PICK-LINKED if the departlag class is
//     DEPARTED; else the departlag class carried through.
//   CORRECTED LINK RULE (holdsjoin-a flagged defect, fixed
//     here, not copied): a linked departure must require
//     objective kind HUNT and matching huntDay — a
//     huntMid-only rule over-links non-HUNT departures
//     (the hunthold-on GUARD case). The diagnostic counts
//     picks where the huntMid-only rule would link a
//     non-HUNT departure the corrected rule rejects.
//   DAYPART STAMPS: pick dayPart (funnel pick) and
//     departure dayPart (returns departure) are reported
//     verbatim. No dayPart-to-day conversion is computed:
//     the observed dayPart range is not a documented
//     parts-per-day constant, so lag is judged in days +
//     counter-parts (the departlag scale) with dayPart
//     stamps alongside.
//   DEPARTURE-ONLY COMPARISON: for each DEPARTED primary
//     pick, the reading a returns-departures-only census
//     could give (departure day/dayPart, memory age at
//     departure, nothing about the pick) is printed next
//     to the pick-joined reading (pick day/dayPart, pick
//     age, lag days/parts, departure age). Non-departed
//     picks are counted as INVISIBLE to departure-only:
//     no departure record exists for them at all.
//
// Usage:
//   node scripts/test-picktime-a.js [--evid <dir>] [--ref <dir>]
//     [--out <json>]
// Exit 0 only when legs 1 (validity), 2 (join completeness)
// and 4b (funnel-a channel neutrality) pass; determinism and
// sense are separate scripts (see evidence), exactly as in
// the departlag-a pattern. The JSON is written regardless.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS = [75101, 75102, 75103, 75104, 75105, 75106, 75107, 75108];
const { classifyPick } = require('./test-departlag-a');

const WAVES = {};
try {
  const defs = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
  const list = Array.isArray(defs) ? defs : (defs.monsters || []);
  for (const d of list) if (d && d.id) WAVES[d.id] = (d.wave | 0);
} catch (e) { /* surfaces as unknownWave below */ }
function waveOf(mid) { return Object.prototype.hasOwnProperty.call(WAVES, mid) ? WAVES[mid] : null; }

function dedupeDanger(e) {
  const seen = new Set(), out = [];
  for (const v of (e.danger || [])) {
    const k = [v.vid, v.tx, v.ty, v.score, v.verdict].join('|');
    if (!seen.has(k)) { seen.add(k); out.push(v); }
  }
  return out;
}
function picksFor(row, vid) {
  return (((row.funnel || {}).picks || []).filter(p => p.vid === vid))
    .sort((a, b) => (a.part | 0) - (b.part | 0));
}
function evalsInWindow(row, pick, firstLater) {
  const mid = pick.chosen.huntMid, huntDay = pick.chosen.huntDay;
  return (((row.departhold || {}).evaluations || [])
    .filter(e => e.vid === pick.vid && (e.part | 0) >= (pick.part | 0)
      && (!firstLater || (e.part | 0) < (firstLater.part | 0))
      && (((e.pre || {}).huntMid === mid && (e.pre || {}).huntDay === huntDay)
        || ((e.post || {}).huntMid === mid && (e.post || {}).huntDay === huntDay)))
    .sort((a, b) => (a.part | 0) - (b.part | 0)));
}
function depRecordFor(row, pick, firstLater) {
  const mid = pick.chosen.huntMid, huntDay = pick.chosen.huntDay;
  const cands = (((row.returns || {}).departures || [])
    .filter(d => d.vid === pick.vid && d.objective && d.objective.kind === 'HUNT'
      && d.objective.huntMid === mid && d.objective.huntDay === huntDay
      && (d.part | 0) >= (pick.part | 0)
      && (!firstLater || (d.part | 0) < (firstLater.part | 0)))
    .sort((a, b) => (a.part | 0) - (b.part | 0)));
  return cands[0] || null;
}
// Diagnostic: what a huntMid-only link rule would (wrongly) link.
function correctedLinkCheck(row, pick, firstLater) {
  const mid = pick.chosen.huntMid;
  const cands = (((row.returns || {}).departures || [])
    .filter(d => d.vid === pick.vid && d.objective && d.objective.huntMid === mid
      && (d.part | 0) >= (pick.part | 0)
      && (!firstLater || (d.part | 0) < (firstLater.part | 0)))
    .sort((a, b) => (a.part | 0) - (b.part | 0)));
  const corrected = depRecordFor(row, pick, firstLater);
  const overlink = cands.filter(d => d.objective.kind !== 'HUNT'
    || d.objective.huntDay !== pick.chosen.huntDay)
    .filter(d => !corrected || (d.part | 0) < (corrected.part | 0));
  return { huntMidOnlyFirst: cands[0] || null, corrected,
    overlinkCandidates: overlink };
}

function joinPick(row, pick) {
  const lag = classifyPick(pick, row);
  const picks = picksFor(row, pick.vid);
  const firstLater = picks.filter(p => (p.part | 0) > (pick.part | 0))[0] || null;
  const windowed = evalsInWindow(row, pick, firstLater);
  const overwrite = windowed.filter(e => e.action === 'overwritten')[0] || null;
  const dg = overwrite ? (dedupeDanger(overwrite)[0] || null) : null;
  const depRec = (lag.cls === 'DEPARTED' || lag.cls === 'UNKNOWN') ? depRecordFor(row, pick, firstLater) : null;
  const depEval = windowed.filter(e => e.action === 'departed')[0] || null;
  let joinedCls;
  if (overwrite) joinedCls = 'OVERWRITTEN-BY-VERDICT';
  else if (lag.cls === 'DEPARTED') joinedCls = 'DEPARTED-PICK-LINKED';
  else joinedCls = lag.cls;
  const link = correctedLinkCheck(row, pick, firstLater);
  return {
    seed: row.seed, vid: pick.vid, mid: pick.chosen.huntMid,
    wave: waveOf(pick.chosen.huntMid), huntDay: pick.chosen.huntDay,
    pickDay: pick.day, pickPart: pick.part, pickDayPart: pick.dayPart,
    ageAtPick: (pick.day | 0) - (pick.chosen.huntDay | 0),
    lagCls: lag.cls, lagSubKind: lag.subKind || null,
    lagDays: lag.lagDays != null ? lag.lagDays : null,
    lagParts: lag.lagParts != null ? lag.lagParts : null,
    depDay: lag.depDay != null ? lag.depDay : (depRec ? depRec.day : null),
    depPart: lag.depPart != null ? lag.depPart : (depRec ? depRec.part : null),
    depDayPart: depRec ? depRec.dayPart : null,
    ageAtDeparture: lag.ageAtDeparture != null ? lag.ageAtDeparture : null,
    staleAtDeparture: lag.staleAtDeparture != null ? lag.staleAtDeparture : null,
    dropped: lag.dropped != null ? lag.dropped : null,
    dropDay: lag.dropDay != null ? lag.dropDay : null,
    joinedCls, neverChecked: windowed.length === 0,
    evalCount: windowed.length,
    evalActions: windowed.map(e => e.action),
    overwrite: overwrite ? { part: overwrite.part, day: overwrite.day, dayPart: overwrite.dayPart,
      verdict: dg ? dg.verdict : null, score: dg ? dg.score : null, sub: overwrite.sub } : null,
    departedEval: depEval ? { part: depEval.part, day: depEval.day, dayPart: depEval.dayPart,
      partMatchesDep: depRec ? ((depEval.part | 0) === (depRec.part | 0)) : null } : null,
    reclassified: lag.cls === 'SUPERSEDED' && joinedCls === 'OVERWRITTEN-BY-VERDICT',
    overlinkCandidates: link.overlinkCandidates.map(d => ({ kind: d.objective.kind,
      huntMid: d.objective.huntMid, huntDay: d.objective.huntDay, day: d.day, part: d.part })),
    lagSub: lag.sub,
  };
}

function summarizeJoined(list) {
  const by = {};
  for (const c of list) by[c.joinedCls] = (by[c.joinedCls] || 0) + 1;
  const dep = list.filter(c => c.joinedCls === 'DEPARTED-PICK-LINKED');
  const sup = list.filter(c => c.joinedCls === 'SUPERSEDED');
  const sorted = a => a.slice().sort((x, y) => x - y);
  const quartiles = (arr) => {
    if (!arr.length) return { n: 0, values: [], median: null, q1: null, q3: null };
    const s = sorted(arr);
    const q = p => s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))];
    return { n: s.length, values: s, median: q(0.5), q1: q(0.25), q3: q(0.75) };
  };
  const supByKind = {};
  for (const c of sup) supByKind[c.lagSubKind] = (supByKind[c.lagSubKind] || 0) + 1;
  return { n: list.length, by,
    departed: { lagDays: quartiles(dep.map(c => c.lagDays)),
      lagParts: quartiles(dep.map(c => c.lagParts)),
      ageAtPick: quartiles(dep.map(c => c.ageAtPick)),
      ageAtDeparture: quartiles(dep.map(c => c.ageAtDeparture)),
      staleCount: dep.filter(c => c.staleAtDeparture).length,
      droppedCount: dep.filter(c => c.dropped).length,
      depDayParts: dep.map(c => c.depDayPart), pickDayParts: dep.map(c => c.pickDayPart) },
    superseded: { bySubKind: supByKind,
      lagDays: quartiles(sup.map(c => c.lagDays)), lagParts: quartiles(sup.map(c => c.lagParts)) },
    overwritten: list.filter(c => c.joinedCls === 'OVERWRITTEN-BY-VERDICT').length,
    reclassified: list.filter(c => c.reclassified).length,
    neverChecked: list.filter(c => c.neverChecked).length,
    overlinkTotal: list.reduce((t, c) => t + c.overlinkCandidates.length, 0),
    unknown: list.filter(c => c.joinedCls === 'UNKNOWN').length };
}

function main() {
  const args = process.argv.slice(2);
  const get = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
  const evidDir = get('--evid') || path.join(REPO, 'evidence', '2026-10-29', 'perseed-picktime-a');
  const refDir = get('--ref') || path.join(REPO, 'evidence', '2026-10-29', 'perseed-funnel-a');
  const outPath = get('--out');
  const rows = [], refRows = {}, problems = [];
  for (const seed of SEEDS) {
    const fn = path.join(evidDir, `s${seed}-fresh.json`);
    if (!fs.existsSync(fn)) { problems.push(`missing row s${seed}`); continue; }
    rows.push(JSON.parse(fs.readFileSync(fn, 'utf8')));
    const rf = path.join(refDir, `s${seed}-fresh.json`);
    if (fs.existsSync(rf)) refRows[seed] = JSON.parse(fs.readFileSync(rf, 'utf8'));
  }
  // LEG 1 — corpus validity.
  const validity = rows.length === SEEDS.length && rows.every(r => r.days > 0
    && r.fieldparty && Array.isArray(r.fieldparty.meetings) && r.fieldparty.diag.errs === 0
    && Object.values(r.fieldparty.diag.overflow || {}).every(v => (v | 0) === 0) && r.fieldparty.diag.installed === true
    && r.returns && Array.isArray(r.returns.meetings) && r.returns.diag.errs === 0
    && Object.values(r.returns.diag.overflow || {}).every(v => (v | 0) === 0) && r.returns.diag.installed === true
    && r.funnel && Array.isArray(r.funnel.picks) && Array.isArray(r.funnel.notes) && r.funnel.diag.errs === 0
    && Object.values(r.funnel.diag.overflow || {}).every(v => (v | 0) === 0) && r.funnel.diag.installed === true
    && r.departhold && Array.isArray(r.departhold.evaluations) && r.departhold.diag.errs === 0
    && Object.values(r.departhold.diag.overflow || {}).every(v => (v | 0) === 0) && r.departhold.diag.installed === true);
  // LEG 4b — funnel-a channel neutrality (departhold excluded: no counterpart).
  const neuDiffs = [];
  const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  for (const r of rows) {
    const ref = refRows[r.seed];
    if (!ref) { neuDiffs.push(`s${r.seed}: no ref row`); continue; }
    for (const [sec, key] of [['fieldparty', 'meetings'], ['returns', 'meetings'], ['returns', 'departures'], ['returns', 'drops'], ['funnel', 'picks'], ['funnel', 'notes']]) {
      if (!eq((r[sec] || {})[key], (ref[sec] || {})[key])) neuDiffs.push(`s${r.seed}: ${sec}.${key} differs`);
    }
    for (const f of ['won', 'waveReach', 'nationalEver', 'nationalFinal', 'table', 'entered', 'days', 'deathTotal', 'starvationDeaths']) {
      if (r[f] !== ref[f]) neuDiffs.push(`s${r.seed}: field ${f} ${r[f]} vs ref ${ref[f]}`);
    }
  }
  const judgedA = [];
  for (const r of rows) for (const m of ((r.fieldparty || {}).meetings || [])) {
    if ((m.wave | 0) === 4 && m.channel === 'field' && ['resolve', 'patrol', 'aid'].indexOf(m.caller) >= 0 && !(m.leader && m.leader.isScholar)) judgedA.push(m);
  }
  const wall = { won: rows.reduce((t, r) => t + r.won, 0),
    wonFull: rows.filter(r => r.won && r.tableState && r.tableState.seat === 'full').length,
    nationalEver: rows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: rows.reduce((t, r) => t + r.nationalFinal, 0),
    table: rows.reduce((t, r) => t + r.table, 0),
    entered: rows.reduce((t, r) => t + r.entered, 0),
    wave4: rows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: rows.filter(r => (r.waveReach || 1) >= 5).length,
    medianDays: (() => { const s = rows.map(r => r.days).sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; })(),
    deaths: rows.reduce((t, r) => t + r.deathTotal, 0), starvation: rows.reduce((t, r) => t + r.starvationDeaths, 0),
    judgedA: judgedA.length,
    huntDepartures: rows.reduce((t, r) => t + ((r.returns || {}).departures || []).filter(d => d.objective && d.objective.kind === 'HUNT').length, 0),
    huntTrueDrops: rows.reduce((t, r) => t + ((r.returns || {}).drops || []).filter(d => d.dropped === true).length, 0) };
  const primary = [], secondary = [], unknownWave = [];
  for (const r of rows) {
    for (const p of ((r.funnel || {}).picks || [])) {
      if (!p.chosen || p.chosen.kind !== 'HUNT' || !p.chosen.huntMid) continue;
      const w = waveOf(p.chosen.huntMid);
      if (w === null) { unknownWave.push(`${r.seed}:${p.vid}:${p.chosen.huntMid}`); continue; }
      const c = joinPick(r, p);
      secondary.push(c);
      if (w === 4) primary.push(c);
    }
  }
  const primSum = summarizeJoined(primary), secSum = summarizeJoined(secondary);
  // Departure-only comparison for DEPARTED primary picks.
  const depOnlyComparison = primary.filter(c => c.joinedCls === 'DEPARTED-PICK-LINKED').map(c => ({
    seed: c.seed, vid: c.vid, mid: c.mid, huntDay: c.huntDay,
    departureOnly: { depDay: c.depDay, depDayPart: c.depDayPart, ageAtDeparture: c.ageAtDeparture,
      pickDay: null, pickAge: null, lagDays: null, lagParts: null },
    pickJoined: { pickDay: c.pickDay, pickDayPart: c.pickDayPart, ageAtPick: c.ageAtPick,
      lagDays: c.lagDays, lagParts: c.lagParts, depDay: c.depDay, depDayPart: c.depDayPart,
      ageAtDeparture: c.ageAtDeparture },
    departureOnlyMinusPickAge: (c.ageAtDeparture != null && c.ageAtPick != null) ? c.ageAtDeparture - c.ageAtPick : null,
  }));
  const invisibleToDepartureOnly = primary.filter(c => c.joinedCls !== 'DEPARTED-PICK-LINKED').length;
  const legs = {
    validity: validity,
    joinCompleteness: primSum.unknown <= 1,
    neutralityFunnelA: neuDiffs.length === 0,
    determinismNote: 'checked separately (seed 75106 scratch re-run, cmp)',
    senseNote: 'checked separately (scripts/test-picktime-a-sense.js)',
  };
  const go = legs.validity && legs.joinCompleteness && legs.neutralityFunnelA;
  const out = { rows: rows.length, problems, wall, neuDiffs, legs,
    primary: primSum, primaryPicks: primary, secondary: secSum, secondaryPicks: secondary,
    unknownWave, depOnlyComparison, invisibleToDepartureOnly };
  if (outPath) fs.writeFileSync(outPath, JSON.stringify(out, null, 1) + '\n');
  console.log('=== sim-picktime-a pick-time join ===');
  console.log(`rows=${rows.length}/8 problems=${problems.length ? problems.join(';') : 'none'}`);
  console.log(`WALL: won=${wall.won} (full=${wall.wonFull}) natEver=${wall.nationalEver} natFinal=${wall.nationalFinal} table=${wall.table} entered=${wall.entered} wave4=${wall.wave4} wave5=${wall.wave5} median=${wall.medianDays} deaths=${wall.deaths} starv=${wall.starvation} judgedA=${wall.judgedA} huntDep=${wall.huntDepartures} huntTrueDrops=${wall.huntTrueDrops}`);
  if (neuDiffs.length) console.log(`NEUTRALITY-DIFFS (${neuDiffs.length}): ${neuDiffs.slice(0, 20).join('; ')}`);
  console.log(`PRIMARY (wave-4 HUNT picks): n=${primSum.n} by=${JSON.stringify(primSum.by)} unknown=${primSum.unknown} unknownWave=${unknownWave.length}`);
  console.log(`  departed lagDays=${JSON.stringify(primSum.departed.lagDays)} lagParts=${JSON.stringify(primSum.departed.lagParts)} ageAtPick=${JSON.stringify(primSum.departed.ageAtPick)} ageAtDeparture=${JSON.stringify(primSum.departed.ageAtDeparture)} stale=${primSum.departed.staleCount} dropped=${primSum.departed.droppedCount} depDayParts=${JSON.stringify(primSum.departed.depDayParts)} pickDayParts=${JSON.stringify(primSum.departed.pickDayParts)}`);
  console.log(`  superseded bySubKind=${JSON.stringify(primSum.superseded.bySubKind)} lagDays=${JSON.stringify(primSum.superseded.lagDays)}`);
  console.log(`  overwritten=${primSum.overwritten} reclassified=${primSum.reclassified} neverChecked=${primSum.neverChecked} overlinkTotal=${primSum.overlinkTotal} invisibleToDepartureOnly=${invisibleToDepartureOnly}`);
  console.log(`SECONDARY (all HUNT picks by w4-memory holders): n=${secSum.n} by=${JSON.stringify(secSum.by)} unknown=${secSum.unknown}`);
  console.log(`  departed lagDays=${JSON.stringify(secSum.departed.lagDays)} stale=${secSum.departed.staleCount} dropped=${secSum.departed.droppedCount} overwritten=${secSum.overwritten} reclassified=${secSum.reclassified} neverChecked=${secSum.neverChecked} overlinkTotal=${secSum.overlinkTotal}`);
  for (const c of depOnlyComparison) console.log(`  DEP-ONLY-VS-JOINED s${c.seed} ${c.vid} ${c.mid}: departure-only age=${c.departureOnly.ageAtDeparture} (d${c.departureOnly.depDay} dp${c.departureOnly.depDayPart}) vs joined pick age=${c.pickJoined.ageAtPick} (d${c.pickJoined.pickDay} dp${c.pickJoined.pickDayPart}) lag=${c.pickJoined.lagDays}d/${c.pickJoined.lagParts}p, diff=${c.departureOnlyMinusPickAge}d`);
  console.log(`LEGS: validity=${legs.validity ? 'PASS' : 'FAIL'} joinCompleteness=${legs.joinCompleteness ? 'PASS' : 'FAIL'} neutralityFunnelA=${legs.neutralityFunnelA ? 'PASS' : 'FAIL'} (determinism/sense separate)`);
  if (!go) { console.log('PICKTIME-LEGS: FAIL'); process.exit(1); }
  console.log('PICKTIME-LEGS: PASS (validity + join + neutrality; determinism/sense separate)');
}
if (require.main === module) main();
module.exports = { joinPick, evalsInWindow, depRecordFor, correctedLinkCheck, summarizeJoined, SEEDS };
