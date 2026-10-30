#!/usr/bin/env node
// scripts/analyze-stalkertick-a.js — sim-stalkertick-a pure analyzer.
// Reads corpus JSON only; never touches game state. Derives, per seed,
// per world-monster instance: census series, monsterTurn events,
// removal events, fate, and the day-by-day tick path for the three
// judged chains carried from the coordinator assignment (verdicts
// NOT re-judged here). Usage:
//   node scripts/analyze-stalkertick-a.js [evidDir] [outJson]
// Defaults: evidence/2026-10-30/perseed-stalkertick-a and
// evidence/2026-10-30/sim-stalkertick-a-analysis.json. Tolerates a
// partial corpus (pilot): per-seed legs report present/missing, and
// completeness is false until 16/16 seeds are present.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const SEEDS = [];
for (let s = 75101; s <= 75116; s++) SEEDS.push(s);
const CHAINCLOSE_DIR = path.join(REPO, 'evidence', '2026-10-30', 'perseed-chainclose-a');

// Judged chains, carried verbatim from the coordinator assignment —
// this analyzer reports their tick paths; it does NOT re-judge them.
const JUDGED = [
  { seed: 75102, id: 'eulogy', hp: 853, lastSeenDay: 61, firstAbsentDay: 62, carried: 'LOSTSIGHT-REMOVE (sibling removal arm: removal seq 41, d62, lostSight=7 > 6, monsterTurn stack, no fight)' },
  { seed: 75116, id: 'suburb', hp: 1285, lastSeenDay: 158, firstAbsentDay: 159, carried: 'SCHOLAR-MELT via toll bridge (uid-proven 1285->960 draft)' },
  { seed: 75102, id: 'algorithm', hp: 959, lastSeenDay: 71, firstAbsentDay: 72, carried: 'SCHOLAR-MELT (EDGE) under same-day caveat' },
];

function medianOf(arr) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function stripRow(row) {
  const c = Object.assign({}, row);
  delete c.stalkertick;
  return c;
}

function classifyRemoval(ev) {
  if (!ev) return null;
  if (ev.inMonsterTurn && (ev.lostSight != null) && ev.lostSight >= 7) return 'LOSTSIGHT-REMOVE';
  return 'OTHER-REMOVE';
}

function isWildW4(t) {
  return t.wave === 4 && !t.titanEver && !t.lingeringEver;
}

// buildTraces(seed, snapshots, turns, removals): snapshots = tick census
// snapshots array [{day, scholarTile, monsters:[snap,...]}].
function buildTraces(seed, snapshots, turns, removals) {
  const byInst = new Map();
  const get = (inst, fallback) => {
    if (!byInst.has(inst)) {
      byInst.set(inst, {
        seed, inst, id: (fallback && fallback.id) || null, wave: (fallback && fallback.wave) || 1,
        titanEver: false, lingeringEver: false, veteranEver: false,
        snapshots: [], turns: [], removals: [],
      });
    }
    return byInst.get(inst);
  };
  const snapDays = [];
  for (const snap of (snapshots || [])) {
    snapDays.push(snap.day);
    for (const m of (snap.monsters || [])) {
      const t = get(m.inst, m);
      if (m.id != null) t.id = m.id;
      if (m.wave != null) t.wave = m.wave;
      if (m.titan) t.titanEver = true;
      if (m.lingering) t.lingeringEver = true;
      if (m.veteran) t.veteranEver = true;
      t.snapshots.push({ day: snap.day, tx: m.tx, ty: m.ty, mx: m.mx, my: m.my, hp: m.hp, maxHp: m.maxHp, lostSight: m.lostSight });
    }
  }
  for (const ev of (turns || [])) {
    const t = get(ev.inst, ev);
    if (ev.id != null) t.id = ev.id;
    if (ev.wave != null) t.wave = ev.wave;
    if (ev.titan) t.titanEver = true;
    if (ev.lingering) t.lingeringEver = true;
    t.turns.push(ev);
  }
  for (const ev of (removals || [])) {
    const t = get(ev.inst, ev);
    if (ev.id != null) t.id = ev.id;
    if (ev.wave != null) t.wave = ev.wave;
    if (ev.titan) t.titanEver = true;
    if (ev.lingering) t.lingeringEver = true;
    if (ev.veteran) t.veteranEver = true;
    t.removals.push(ev);
  }
  const finalDay = snapDays.length ? Math.max.apply(null, snapDays) : null;
  const out = [];
  for (const t of byInst.values()) {
    t.snapshots.sort((a, b) => a.day - b.day);
    t.turns.sort((a, b) => a.day - b.day);
    t.removals.sort((a, b) => a.day - b.day);
    t.firstSeenDay = t.snapshots.length ? t.snapshots[0].day : (t.turns.length ? t.turns[0].day : (t.removals.length ? t.removals[0].day : null));
    t.lastSeenDay = t.snapshots.length ? t.snapshots[t.snapshots.length - 1].day : null;
    t.firstAbsentDay = null;
    if (t.lastSeenDay != null && finalDay != null && t.lastSeenDay < finalDay) {
      // First census day after lastSeen on which the instance is absent.
      const presentDays = new Set(t.snapshots.map(s => s.day));
      for (const d of snapDays.slice().sort((a, b) => a - b)) {
        if (d > t.lastSeenDay && !presentDays.has(d)) { t.firstAbsentDay = d; break; }
      }
    }
    if (t.lastSeenDay != null && finalDay != null && t.lastSeenDay >= finalDay) t.fate = 'SURVIVED-TO-END';
    else if (t.removals.length) t.fate = classifyRemoval(t.removals[t.removals.length - 1]);
    else if (t.lastSeenDay != null) t.fate = 'NO-REMOVAL-EVENT';
    else t.fate = 'NEVER-CENSUSED';
    t.maxCensusLostSight = t.snapshots.reduce((m, s) => (s.lostSight != null ? Math.max(m, s.lostSight) : m), 0);
    t.maxTurnLostSight = t.turns.reduce((m, e) => Math.max(m, (e.lostSightAfter != null ? e.lostSightAfter : 0), (e.lostSightBefore != null ? e.lostSightBefore : 0)), 0);
    t.maxLostSight = Math.max(t.maxCensusLostSight, t.maxTurnLostSight);
    t.everTicked = t.maxLostSight > 0;
    out.push(t);
  }
  return out;
}

// tickPath(trace, windowLastDay): the day-by-day tick path over the
// census window firstSeenDay..windowLastDay (default: lastSeenDay),
// plus turn events in the same window. COMPLETE iff every census day
// in the window carries a non-null lostSight AND a removal fate has a
// removal event recorded.
function tickPath(trace, windowLastDay) {
  const end = (windowLastDay != null) ? windowLastDay : trace.lastSeenDay;
  const series = trace.snapshots.filter(s => s.day <= end);
  const turns = trace.turns.filter(e => e.day <= end);
  const reasons = [];
  for (const s of series) if (s.lostSight == null) reasons.push('null lostSight on census day ' + s.day);
  if ((trace.fate === 'LOSTSIGHT-REMOVE' || trace.fate === 'OTHER-REMOVE') && !trace.removals.length) reasons.push('removal fate with no removal event');
  return { series, turns, removals: trace.removals, complete: reasons.length === 0, reasons };
}

function matchJudged(traces, j) {
  const cands = traces.filter(t => t.seed === j.seed && t.id === j.id);
  const hpHit = cands.filter(t => t.snapshots.some(s => s.day <= j.lastSeenDay && s.hp === j.hp));
  const exact = hpHit.filter(t => t.firstAbsentDay === j.firstAbsentDay);
  if (exact.length === 1) return { status: 'EXACT', trace: exact[0] };
  if (exact.length > 1) return { status: 'AMBIGUOUS-EXACT', traces: exact.map(t => t.inst) };
  if (hpHit.length === 1) return { status: 'HP-ONLY', trace: hpHit[0] };
  if (hpHit.length > 1) return { status: 'AMBIGUOUS-HP', traces: hpHit.map(t => t.inst) };
  if (cands.length) return { status: 'NO-HP-MATCH', traces: cands.map(t => t.inst) };
  return { status: 'NONE', traces: [] };
}

function analyze(evidDir, chaincloseDir, outPath) {
  evidDir = evidDir || path.join(REPO, 'evidence', '2026-10-30', 'perseed-stalkertick-a');
  chaincloseDir = chaincloseDir || CHAINCLOSE_DIR;
  const perSeed = {};
  const allTraces = [];
  const wallRows = [];
  let substrateAll = true;
  for (const seed of SEEDS) {
    const rowPath = path.join(evidDir, `s${seed}-fresh.json`);
    const tickPath_ = path.join(evidDir, `tick-s${seed}.json`);
    const leg = { present: false, substrateRow: false, censusOk: false, stalkertickOk: false, recordersOk: false };
    if (!fs.existsSync(rowPath) || !fs.existsSync(tickPath_)) { perSeed[seed] = leg; substrateAll = false; continue; }
    leg.present = true;
    const row = JSON.parse(fs.readFileSync(rowPath, 'utf8'));
    const tick = JSON.parse(fs.readFileSync(tickPath_, 'utf8'));
    wallRows.push(row);
    try {
      const ccBytes = fs.readFileSync(path.join(chaincloseDir, `s${seed}-fresh.json`));
      const ownBytes = Buffer.from(JSON.stringify(stripRow(row), null, 1) + '\n', 'utf8');
      leg.substrateRow = ownBytes.equals(ccBytes);
    } catch (e) { leg.substrateRow = false; }
    if (!leg.substrateRow) substrateAll = false;
    const snapDays = (tick.snapshots || []).map(s => s.day);
    const sorted = snapDays.every((d, i) => i === 0 || d >= snapDays[i - 1]);
    const lastDay = snapDays.length ? snapDays[snapDays.length - 1] : null;
    leg.censusOk = sorted && lastDay !== null && Math.abs(lastDay - row.days) <= 1;
    const st = row.stalkertick || null;
    leg.stalkertickOk = !!(st && Array.isArray(st.turns) && Array.isArray(st.removals) && st.diag.errs === 0 && Object.values(st.diag.overflow || {}).every(v => (v | 0) === 0));
    const storeOk = (s) => s && Array.isArray(s.meetings) && s.diag.errs === 0 && Object.values(s.diag.overflow || {}).every(v => (v | 0) === 0);
    leg.recordersOk = row.days > 0 && storeOk(row.fieldparty) && storeOk(row.w4dpr) && storeOk(row.breakline)
      && (row.tilejoin === null || storeOk(row.tilejoin)) && storeOk(row.shoutrec) && storeOk(row.joinendlines);
    leg.snapshots = snapDays.length;
    leg.turns = st ? st.turns.length : 0;
    leg.removals = st ? st.removals.length : 0;
    const traces = buildTraces(seed, tick.snapshots, st ? st.turns : [], st ? st.removals : []);
    leg.instances = traces.length;
    leg.wildW4 = traces.filter(isWildW4).length;
    for (const t of traces) allTraces.push(t);
    perSeed[seed] = leg;
  }
  const wild = allTraces.filter(isWildW4);
  const lostsightRemovals = [];
  const otherRemovals = [];
  for (const t of allTraces) for (const ev of t.removals) {
    const cls = classifyRemoval(ev);
    (cls === 'LOSTSIGHT-REMOVE' ? lostsightRemovals : otherRemovals).push({ seed: t.seed, inst: t.inst, id: t.id, wave: t.wave, titan: t.titanEver, lingering: t.lingeringEver, day: ev.day, lostSight: ev.lostSight, inMonsterTurn: ev.inMonsterTurn, tbfightLive: ev.tbfightLive, hp: ev.hp, tile: [ev.tx, ev.ty] });
  }
  const wildLostsight = lostsightRemovals.filter(r => !r.titan && !r.lingering && r.wave === 4);
  const bucket = (t) => t.maxLostSight === 0 ? '0' : (t.maxLostSight <= 3 ? '1-3' : (t.maxLostSight <= 6 ? '4-6' : '7+'));
  const maxDist = { '0': 0, '1-3': 0, '4-6': 0, '7+': 0 };
  for (const t of wild) maxDist[bucket(t)]++;
  const band = {
    instances: allTraces.length,
    wildW4: wild.length,
    wildWithTurns: wild.filter(t => t.turns.length > 0).length,
    wildEverTicked: wild.filter(t => t.everTicked).length,
    wildMaxDist: maxDist,
    wildFates: {},
    turnEvents: allTraces.reduce((n, t) => n + t.turns.length, 0),
    removalEvents: allTraces.reduce((n, t) => n + t.removals.length, 0),
    lostsightRemovals: lostsightRemovals.length,
    wildLostsightRemovals: wildLostsight.length,
    otherRemovals: otherRemovals.length,
    noRemovalEventWild: wild.filter(t => t.fate === 'NO-REMOVAL-EVENT').length,
    survivedWild: wild.filter(t => t.fate === 'SURVIVED-TO-END').length,
  };
  for (const t of wild) band.wildFates[t.fate] = (band.wildFates[t.fate] || 0) + 1;
  // Judged chains: tick paths (verdicts carried, not re-judged).
  const judged = [];
  for (const j of JUDGED) {
    const traces = allTraces.filter(t => t.seed === j.seed);
    const m = matchJudged(traces, j);
    const entry = { chain: j, match: m.status, matchedInst: (m.trace && m.trace.inst) || null, matchedTraces: m.traces || null, carried: j.carried };
    if (m.trace) {
      const tp = tickPath(m.trace, j.lastSeenDay);
      entry.trace = {
        inst: m.trace.inst, id: m.trace.id, wave: m.trace.wave,
        firstSeenDay: m.trace.firstSeenDay, lastSeenDay: m.trace.lastSeenDay, firstAbsentDay: m.trace.firstAbsentDay,
        fate: m.trace.fate, maxLostSight: m.trace.maxLostSight,
        censusSeries: tp.series, turnEvents: tp.turns, removals: tp.removals,
        tickPathComplete: tp.complete, tickPathReasons: tp.reasons,
      };
    }
    judged.push(entry);
  }
  // Non-vanishing comparison set: wild w4 traces with fate
  // SURVIVED-TO-END or OTHER-REMOVE, sorted by (seed, inst), first 3
  // with any turn events preferred, then first 3 overall.
  const nonVan = wild.filter(t => t.fate === 'SURVIVED-TO-END' || t.fate === 'OTHER-REMOVE')
    .sort((a, b) => (a.seed - b.seed) || String(a.inst).localeCompare(String(b.inst)));
  const comparison = nonVan.slice(0, 3).map(t => {
    const tp = tickPath(t, t.lastSeenDay);
    return { seed: t.seed, inst: t.inst, id: t.id, fate: t.fate, firstSeenDay: t.firstSeenDay, lastSeenDay: t.lastSeenDay, firstAbsentDay: t.firstAbsentDay, maxLostSight: t.maxLostSight, nTurns: t.turns.length, censusSeries: tp.series, turnEvents: tp.turns, removals: t.removals };
  });
  const wall = {
    n: wallRows.length,
    won: wallRows.reduce((t, r) => t + r.won, 0),
    wonFull: wallRows.filter(r => r.won && r.tableState && r.tableState.seat === 'full').length,
    medianDays: medianOf(wallRows.map(r => r.days)),
    nationalEver: wallRows.reduce((t, r) => t + r.nationalEver, 0),
    nationalFinal: wallRows.reduce((t, r) => t + r.nationalFinal, 0),
    table: wallRows.reduce((t, r) => t + r.table, 0),
    entered: wallRows.reduce((t, r) => t + r.entered, 0),
    wave4: wallRows.filter(r => (r.waveReach || 1) >= 4).length,
    wave5: wallRows.filter(r => (r.waveReach || 1) >= 5).length,
    starvationTotal: wallRows.reduce((t, r) => t + r.starvationDeaths, 0),
    deathTotal: wallRows.reduce((t, r) => t + r.deathTotal, 0),
  };
  const completeness = Object.values(perSeed).every(l => l.present && l.censusOk && l.stalkertickOk && l.recordersOk);
  const coverage = judged.every(j => j.match === 'EXACT' || j.match === 'HP-ONLY') && judged.every(j => j.trace && j.trace.tickPathComplete);
  const result = {
    perSeed, substrateAll, completeness,
    traceCoverage: { judgedComplete: coverage, judged: judged.map(j => ({ seed: j.chain.seed, id: j.chain.id, match: j.match, complete: !!(j.trace && j.trace.tickPathComplete) })) },
    band, judged, comparison, wall,
    lostsightRemovals, wildLostsightRemovals: wildLostsight,
  };
  if (outPath) {
    try { fs.mkdirSync(path.dirname(outPath), { recursive: true }); fs.writeFileSync(outPath, JSON.stringify(result, null, 1) + '\n'); } catch (e) { console.log('ANALYZE-WRITE-FAIL ' + String((e && e.message) || e)); }
  }
  console.log(`ANALYZE seeds-present=${Object.values(perSeed).filter(l => l.present).length}/16 substrateAll=${substrateAll} completeness=${completeness}`);
  console.log(`BAND instances=${band.instances} wildW4=${band.wildW4} withTurns=${band.wildWithTurns} everTicked=${band.wildEverTicked} maxDist=${JSON.stringify(band.wildMaxDist)} fates=${JSON.stringify(band.wildFates)}`);
  console.log(`REMOVALS total=${band.removalEvents} lostsight=${band.lostsightRemovals} (wildW4=${band.wildLostsightRemovals}) other=${band.otherRemovals} noEventWild=${band.noRemovalEventWild} survivedWild=${band.survivedWild}`);
  for (const j of judged) console.log(`JUDGED s${j.chain.seed} ${j.chain.id} hp=${j.chain.hp} match=${j.match} inst=${j.matchedInst} fate=${j.trace ? j.trace.fate : '—'} maxLS=${j.trace ? j.trace.maxLostSight : '—'} complete=${j.trace ? j.trace.tickPathComplete : false} carried=${j.carried}`);
  console.log(`WALL won=${wall.won} (full=${wall.wonFull}) natEver=${wall.nationalEver} natFinal=${wall.nationalFinal} table=${wall.table} entered=${wall.entered} wave4=${wall.wave4} wave5=${wall.wave5} median=${wall.medianDays} starv=${wall.starvationTotal} deaths=${wall.deathTotal}`);
  return result;
}

function main() {
  const args = process.argv.slice(2);
  const evidDir = args[0] || path.join(REPO, 'evidence', '2026-10-30', 'perseed-stalkertick-a');
  const outPath = args[1] || path.join(REPO, 'evidence', '2026-10-30', 'sim-stalkertick-a-analysis.json');
  analyze(evidDir, CHAINCLOSE_DIR, outPath);
}
if (require.main === module) main();
module.exports = { buildTraces, classifyRemoval, tickPath, matchJudged, isWildW4, stripRow, medianOf, analyze, JUDGED, SEEDS };
