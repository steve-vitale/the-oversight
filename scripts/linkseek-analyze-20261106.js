// linkseek-analyze-20261106.js — link-seeking probe analyzer
// (arm sim-linkseek-b). Reads the pilot per-seed JSONs, classifies
// each seed (never-met / never-accepted / knowledge / acceptance /
// seasoning hold), judges the prereg GO bar + guards, and prints
// the wall numbers per leg. Writes a summary JSON next to the
// per-seed files.
// Usage:
//   RUN=linkseek-pilot node scripts/linkseek-analyze-20261106.js
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = process.env.REPO || path.join(__dirname, '..');
const RUN = process.env.RUN || 'linkseek-pilot';
const dir = path.join(REPO, 'evidence', '2026-11-06', 'perseed-linkseek-b');

function load(seed, leg) {
  const f = path.join(dir, 'linkseek-s' + seed + '-' + leg + '-' + RUN + '.json');
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}

function maxOf(daily, fn) {
  let m = null;
  for (const s of daily) { const v = fn(s); if (v != null && (m == null || v > m)) m = v; }
  return m;
}

function linkEvents(daily) {
  // Formation / seasoning / dissolution derived from snapshot
  // transitions on the link roll (keyed link identity).
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
    const maxGenerated = maxOf(d, s => (s.knowledge || {}).generatedCount) || 0;
    const maxLore = maxOf(d, s => (s.knowledge || {}).loreCount) || 0;
    const proposes = (rec.courtLog || []).filter(e => e.kind === 'propose');
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
      maxKnown: maxKnown, firstKnownDay: firstKnownDay, maxGenerated: maxGenerated, maxLore: maxLore,
      proposeCalls: rec.proposeCalls, proposes: proposes.length, proposeOutcomes: proposeOutcomes,
      travels: travels, studies: studies, counterAnswers: counterAnswers,
      formed: formed, seasoned: seasoned, dissolved: dissolved,
      linkEvents: le.events,
      readyDays: (function () { let n = 0; for (const s of d) { if (s.readiness5 && s.readiness5.ready) n++; } return n; })(),
      endReady: r5.ready, endVets: (r5.veterans || {}).have,
      ledger4: (lastLedger4 == null ? null : lastLedger4),
      waveKillLogEntries: rec.waveKillLogEntries,
      snapshots: d.length, instrumentErrors: (rec.instrumentErrors || []).length,
    };
  }

  // Baseline classification (prereg rules).
  const b = out.baseline;
  out.baselineClass = classifyBaseline(b);
  // Armed blocker (prereg rules).
  const a = out.armed;
  out.armedClass = classifyArmed(a);
  return out;
}

function classifyBaseline(b) {
  return (b.maxKnown === 0) ? 'never-met' : 'never-accepted';
}

function classifyArmed(a) {
  if (a.seasoned >= 1 && a.peakDiplo > 0) return 'seasoned-link';
  if (a.maxKnown === 0) return 'knowledge-blocked';
  if (a.proposes >= 1 && a.formed === 0) return 'acceptance-blocked';
  if (a.formed >= 1 && a.seasoned === 0) return 'seasoning-blocked';
  if (a.formed >= 1 && a.seasoned >= 1) return 'seasoned-no-diplo';
  return 'no-proposal-despite-known';
}

function median(xs) {
  const s = xs.slice().sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : null;
}

function main() {
const SEEDS = [56001, 56002, 56003, 56004, 56005, 56006, 56007, 56008];
const rows = SEEDS.map(analyzeSeed);

const baseDays = rows.map(r => r.baseline.days);
const armedDays = rows.map(r => r.armed.days);
const baseLedger4 = rows.reduce((t, r) => t + (r.baseline.ledger4 || 0), 0);
const armedLedger4 = rows.reduce((t, r) => t + (r.armed.ledger4 || 0), 0);
const goSeeds = rows.filter(r => r.armed.seasoned >= 1 && r.armed.peakDiplo > 0);
const go = goSeeds.length >= 2;
const guardSurvival = median(armedDays) >= 0.8 * median(baseDays);
const guardKills = (baseLedger4 === 0) ? 'vacuous' : (armedLedger4 >= 0.5 * baseLedger4);

const summary = {
  run: RUN,
  goClause1: { seasonedOnGe2: goSeeds.length, seeds: goSeeds.map(r => r.seed), pass: go },
  guards: {
    medianSurvivalBaseline: median(baseDays), medianSurvivalArmed: median(armedDays),
    survivalRatio: median(baseDays) ? +(median(armedDays) / median(baseDays)).toFixed(2) : null,
    pass: guardSurvival,
    ledger4BaselineTotal: baseLedger4, ledger4ArmedTotal: armedLedger4,
    killsGuard: guardKills,
  },
  verdict: (go && guardSurvival && guardKills !== false) ? 'GO' : 'NO-GO',
  wall: {},
  rows: rows,
};
for (const leg of ['baseline', 'armed']) {
  summary.wall[leg] = {
    wins: rows.filter(r => r[leg].won).length,
    national: rows.filter(r => r[leg].scaleRank === 'national').length,
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
    seed: r.seed, baseClass: r.baselineClass, armedClass: r.armedClass,
    base: { days: r.baseline.days, maxKnown: r.baseline.maxKnown, firstKnown: r.baseline.firstKnownDay, proposeCalls: r.baseline.proposeCalls, formed: r.baseline.formed, peakDiplo: r.baseline.peakDiplo, peakGated: r.baseline.peakGated, ledger4: r.baseline.ledger4 },
    armed: { days: r.armed.days, maxKnown: r.armed.maxKnown, firstKnown: r.armed.firstKnownDay, proposes: r.armed.proposes, outcomes: r.armed.proposeOutcomes, travels: r.armed.travels, studies: r.armed.studies, formed: r.armed.formed, seasoned: r.armed.seasoned, dissolved: r.armed.dissolved, peakDiplo: r.armed.peakDiplo, peakGated: r.armed.peakGated, ledger4: r.armed.ledger4 },
  }));
}
console.log('## verdict');
console.log(JSON.stringify({ verdict: summary.verdict, goSeeds: goSeeds.map(r => r.seed), guards: summary.guards, wall: summary.wall }, null, 2));

const sumFile = path.join(dir, 'linkseek-analysis-' + RUN + '.json');
fs.writeFileSync(sumFile, JSON.stringify(summary, null, 2) + '\n');
console.log('wrote ' + path.relative(REPO, sumFile));
}

if (require.main === module) main();
module.exports = { linkEvents: linkEvents, classifyBaseline: classifyBaseline, classifyArmed: classifyArmed, median: median };
