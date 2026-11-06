// proposefirst-analyze-20261106.js — propose-first probe analyzer
// (arm sim-proposefirst-b). Reads the pilot per-seed JSONs, derives
// first-proposal day + first-known -> first-propose lag per village,
// judges the prereg GO bar + guards, and prints the wall numbers
// per leg. Writes a summary JSON next to the per-seed files.
// The comparison is linkseek (baseline leg) vs proposefirst (armed
// leg) on IDENTICAL seeds — a policy-vs-policy matched-seed paired
// comparison (linkseek precedent), not a balanced-panel flag flip.
// Usage:
//   RUN=proposefirst-pilot SEEDS=65001,65002 node scripts/proposefirst-analyze-20261106.js
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = process.env.REPO || path.join(__dirname, '..');
const RUN = process.env.RUN || 'proposefirst-pilot';
const dir = path.join(REPO, 'evidence', '2026-11-06', 'perseed-proposefirst-b');

function load(seed, leg) {
  const f = path.join(dir, 'proposefirst-s' + seed + '-' + leg + '-' + RUN + '.json');
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

function maxOf(daily, fn) {
  let m = null;
  for (const s of daily) { const v = fn(s); if (v != null && (m == null || v > m)) m = v; }
  return m;
}

function linkEvents(daily) {
  // Formation / seasoning / dissolution derived from snapshot
  // transitions on the link roll (keyed link identity). Verbatim
  // from linkseek-analyze-20261106.js.
  const seen = {};
  const evs = [];
  for (const s of daily) {
    const keys = {};
    for (const l of (s.links || [])) {
      keys[l.key] = l;
      if (!seen[l.key]) {
        seen[l.key] = { firstDay: s.day, link: l };
        evs.push({ day: s.day, kind: 'formed', key: l.key, other: l.other, trust: l.trust });
      }
      if (l.seasoned && seen[l.key] && !seen[l.key].seasonedDay) {
        seen[l.key].seasonedDay = s.day;
        evs.push({ day: s.day, kind: 'seasoned', key: l.key, other: l.other, trust: l.trust });
      }
    }
    for (const k of Object.keys(seen)) {
      if (!keys[k] && !seen[k].goneDay) {
        seen[k].goneDay = s.day;
        evs.push({ day: s.day, kind: 'dissolved-or-inactive', key: k, other: seen[k].link.other });
      }
    }
  }
  return { events: evs, seen: seen };
}

// Per-village first-known day from the knowledge roll (first
// snapshot where the village's known flag is true), joined to the
// first propose targeting that village from the court log. Null
// lag means proposed never / known never.
function villageLags(rec) {
  const d = rec.daily || [];
  const firstKnown = {};
  for (const s of d) {
    for (const v of (((s.knowledge || {}).villages) || [])) {
      if (v.known && firstKnown[v.id] == null) firstKnown[v.id] = s.day;
    }
  }
  const firstPropose = {};
  for (const e of (rec.courtLog || [])) {
    if (e.kind === 'propose' && e.target && firstPropose[e.target] == null) firstPropose[e.target] = e.day;
  }
  const rows = [];
  for (const id of Object.keys(firstKnown)) {
    rows.push({ village: id, firstKnownDay: firstKnown[id], firstProposeDay: (firstPropose[id] == null ? null : firstPropose[id]), lag: (firstPropose[id] == null ? null : firstPropose[id] - firstKnown[id]) });
  }
  return rows;
}

function analyzeSeed(seed) {
  const base = load(seed, 'baseline');
  const armed = load(seed, 'armed');
  const out = { seed: seed };

  for (const [name, rec] of [['baseline', base], ['armed', armed]]) {
    const d = rec.daily || [];
    const last = d[d.length - 1] || {};
    const le = linkEvents(d);
    const formed = le.events.filter(e => e.kind === 'formed').length;
    const seasoned = le.events.filter(e => e.kind === 'seasoned').length;
    const dissolved = le.events.filter(e => e.kind === 'dissolved-or-inactive').length;
    const peak = { gated: maxOf(d, s => s.gated), raw: maxOf(d, s => (s.standing || {}).total), diplo: maxOf(d, s => (s.standing || {}).diplomacy) };
    const maxKnown = maxOf(d, s => (s.knowledge || {}).knownCount) || 0;
    const firstKnownDay = (function () {
      for (const s of d) { if (((s.knowledge || {}).knownCount || 0) > 0) return s.day; }
      return null;
    })();
    const proposes = (rec.courtLog || []).filter(e => e.kind === 'propose');
    const firstProposeDay = proposes.length ? proposes[0].day : null;
    const proposeOutcomes = {};
    for (const p of proposes) proposeOutcomes[p.outcome] = (proposeOutcomes[p.outcome] || 0) + 1;
    const travels = (rec.courtLog || []).filter(e => e.kind === 'travel').length;
    const studies = (rec.courtLog || []).filter(e => e.kind === 'study').length;
    const counterAnswers = (rec.courtLog || []).filter(e => e.kind === 'counter-answer').length;
    const lastLedger4 = (last.ledger || {})[4];
    const r5 = last.readiness5 || {};
    out[name] = {
      days: rec.days, endReason: rec.endReason, won: !!rec.won, over: !!rec.over,
      scaleRank: rec.scaleRank, maxWave: rec.maxWave, unlockedWave: rec.unlockedWave,
      w4faced: !!rec.w4faced, endGated: last.gated, endRaw: (last.standing || {}).total,
      peakGated: peak.gated, peakRaw: peak.raw, peakDiplo: peak.diplo,
      maxKnown: maxKnown, firstKnownDay: firstKnownDay,
      proposeCalls: rec.proposeCalls, proposes: proposes.length, proposeOutcomes: proposeOutcomes,
      firstProposeDay: firstProposeDay,
      firstProposeLag: (firstProposeDay == null || firstKnownDay == null) ? null : firstProposeDay - firstKnownDay,
      villageLags: villageLags(rec),
      travels: travels, studies: studies, counterAnswers: counterAnswers,
      formed: formed, seasoned: seasoned, dissolved: dissolved,
      linkEvents: le.events,
      readyDays: (function () { let n = 0; for (const s of d) { if (s.readiness5 && s.readiness5.ready) n++; } return n; })(),
      endReady: r5.ready, endVets: (typeof r5.veterans === 'number' ? r5.veterans : null),
      ledger4: (lastLedger4 == null ? null : lastLedger4),
      waveKillLogEntries: rec.waveKillLogEntries,
      snapshots: d.length, instrumentErrors: (rec.instrumentErrors || []).length,
    };
  }
  return out;
}

function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : null;
}

function main() {
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }).filter(Number.isFinite) : []);
if (!SEEDS.length) { console.error('PROPOSEFIRST ANALYZE STOP: SEEDS required.'); process.exit(2); }
const rows = SEEDS.map(analyzeSeed);

const baseDays = rows.map(r => r.baseline.days);
const armedDays = rows.map(r => r.armed.days);
const baseLedger4 = rows.reduce((t, r) => t + (r.baseline.ledger4 || 0), 0);
const armedLedger4 = rows.reduce((t, r) => t + (r.armed.ledger4 || 0), 0);
const baseSeasoned = rows.reduce((t, r) => t + (r.baseline.seasoned || 0), 0);
const armedSeasoned = rows.reduce((t, r) => t + (r.armed.seasoned || 0), 0);
const baseFirstProp = rows.map(r => r.baseline.firstProposeDay).filter(function (v) { return v != null; });
const armedFirstProp = rows.map(r => r.armed.firstProposeDay).filter(function (v) { return v != null; });
const medBaseFirst = median(baseFirstProp);
const medArmedFirst = median(armedFirstProp);
const firstPropGain = (medBaseFirst != null && medArmedFirst != null) ? medBaseFirst - medArmedFirst : null;
const goEarly = (firstPropGain != null && firstPropGain >= 7);
const goSeasoned = armedSeasoned >= baseSeasoned;
const guardSurvival = median(armedDays) >= 0.8 * median(baseDays);
const guardKills = (baseLedger4 === 0) ? 'vacuous' : (armedLedger4 >= 0.5 * baseLedger4);

const summary = {
  run: RUN,
  goClauseEarly: { medianFirstProposeBaseline: medBaseFirst, medianFirstProposeArmed: medArmedFirst, gainDays: firstPropGain, barDays: 7, pass: goEarly },
  goClauseSeasoned: { seasonedBaselineTotal: baseSeasoned, seasonedArmedTotal: armedSeasoned, pass: goSeasoned },
  guards: {
    medianSurvivalBaseline: median(baseDays), medianSurvivalArmed: median(armedDays),
    survivalRatio: median(baseDays) ? +(median(armedDays) / median(baseDays)).toFixed(2) : null,
    pass: guardSurvival,
    ledger4BaselineTotal: baseLedger4, ledger4ArmedTotal: armedLedger4,
    killsGuard: guardKills,
  },
  verdict: (goEarly && goSeasoned && guardSurvival && guardKills !== false) ? 'GO' : 'NO-GO',
  wall: {},
  rows: rows,
};
for (const leg of ['baseline', 'armed']) {
  summary.wall[leg] = {
    wins: rows.filter(r => r[leg].won).length,
    national: rows.filter(r => r[leg].scaleRank === 'national' || r[leg].scaleRank === 'global').length,
    global: rows.filter(r => r[leg].scaleRank === 'global').length,
    table: rows.filter(r => r[leg].scaleRank === 'table').length,
    wave4unlock: rows.filter(r => (r[leg].maxWave || 1) >= 4).length,
    wave4faced: rows.filter(r => r[leg].w4faced).length,
    wave5unlock: rows.filter(r => (r[leg].maxWave || 1) >= 5).length,
    medianDays: median(rows.map(r => r[leg].days)),
    survivors: rows.filter(r => r[leg].days >= 150).length,
  };
}

console.log('## per-seed');
for (const r of rows) {
  console.log(JSON.stringify({
    seed: r.seed,
    base: { days: r.baseline.days, maxKnown: r.baseline.maxKnown, firstKnown: r.baseline.firstKnownDay, firstPropose: r.baseline.firstProposeDay, lag: r.baseline.firstProposeLag, proposes: r.baseline.proposes, outcomes: r.baseline.proposeOutcomes, travels: r.baseline.travels, studies: r.baseline.studies, formed: r.baseline.formed, seasoned: r.baseline.seasoned, dissolved: r.baseline.dissolved, peakDiplo: r.baseline.peakDiplo, peakGated: r.baseline.peakGated, ledger4: r.baseline.ledger4 },
    armed: { days: r.armed.days, maxKnown: r.armed.maxKnown, firstKnown: r.armed.firstKnownDay, firstPropose: r.armed.firstProposeDay, lag: r.armed.firstProposeLag, proposes: r.armed.proposes, outcomes: r.armed.proposeOutcomes, travels: r.armed.travels, studies: r.armed.studies, formed: r.armed.formed, seasoned: r.armed.seasoned, dissolved: r.armed.dissolved, peakDiplo: r.armed.peakDiplo, peakGated: r.armed.peakGated, ledger4: r.armed.ledger4 },
  }));
}
console.log('## village lags (first-known -> first-propose, per village)');
for (const r of rows) {
  console.log(JSON.stringify({ seed: r.seed, baseline: r.baseline.villageLags, armed: r.armed.villageLags }));
}
console.log('## verdict');
console.log(JSON.stringify({ verdict: summary.verdict, goClauseEarly: summary.goClauseEarly, goClauseSeasoned: summary.goClauseSeasoned, guards: summary.guards, wall: summary.wall }, null, 2));

const sumFile = path.join(dir, 'proposefirst-analysis-' + RUN + '.json');
fs.writeFileSync(sumFile, JSON.stringify(summary, null, 2) + '\n');
console.log('wrote ' + path.relative(REPO, sumFile));
}

if (require.main === module) main();
module.exports = { linkEvents: linkEvents, villageLags: villageLags, median: median };
