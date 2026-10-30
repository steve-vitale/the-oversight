#!/usr/bin/env node
// w4party-analyze-20261030.js — analyzer for sim-w4party-a.
//
// Reads per-seed JSONs (dir arg, default
// evidence/2026-10-30/perseed-w4party/leadfeast), classifies every
// wave-4 field meeting per the prereg, contrasts scholar TB party
// composition, and prints wall numbers. Writes analysis.json next
// to the inputs (deterministic from inputs) when --write is passed.
//
// Usage: node scripts/w4party-analyze-20261030.js [dir] [--write]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const dir = process.argv[2] && !process.argv[2].startsWith('--')
  ? process.argv[2] : path.join(REPO, 'evidence', '2026-10-30', 'perseed-w4party', 'leadfeast');
const WRITE = process.argv.includes('--write');

function classify(m) {
  if (!m.snap || !m.offered) return 'UNCLASSIFIED';
  const same = (m.snap.sameNode || []).length;
  const adj = (m.snap.adjacent || []).length;
  const w2 = (m.snap.within2 || []).length;
  const offered = (m.offered.allies | 0);
  if (m.calledHelp) {
    if (m.outcome === 'vFlee' || m.outcome === 'vDie') return 'JOIN-TOO-LATE';
    if (m.outcome === 'vKill' || m.outcome === 'mFlee') return 'JOINED';
    return 'JOINED-OTHER';
  }
  if (same > 0 || adj > 0 || offered > 0) return 'NEARBY-NEVER-JOIN';
  if (w2 > 0) return 'PERIPHERY';
  return 'SOLO';
}

const files = fs.readdirSync(dir).filter(f => /^s\d+\.json$/.test(f)).sort();
const seeds = [];
const meetings = [];
const tbStarted = [];
let national = 0, table = 0, won = 0, w4 = 0, w5 = 0;
const gameDays = [];
const outcomes = {};
const patterns = {};
const byCaller = {};
let offeredColocated = 0, offeredTotal = 0, offeredUnknown = 0;
let shoutRounds = [];
let companionCounts = [];
let formalSizes = [];
let overlapCounts = [];
let tbWins = 0, tbLosses = 0;

for (const f of files) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  seeds.push(j.seed);
  national += j.national | 0; table += j.table | 0; won += j.won | 0;
  w4 += j.wave4 | 0; w5 += j.wave5 | 0;
  gameDays.push(j.gameDays | 0);
  for (const m of (j.meetings || [])) {
    const mm = Object.assign({ seed: j.seed }, m);
    mm.pattern = classify(mm);
    meetings.push(mm);
    outcomes[mm.outcome] = (outcomes[mm.outcome] || 0) + 1;
    patterns[mm.pattern] = (patterns[mm.pattern] || 0) + 1;
    byCaller[mm.caller] = (byCaller[mm.caller] || 0) + 1;
    if (mm.calledHelp && mm.shoutRound != null) shoutRounds.push(mm.shoutRound);
    // Offered-vs-colocated: distance of each named allyVid at entry.
    if (mm.snap && mm.offered) {
      const dist = {};
      for (const b of ['sameNode', 'adjacent', 'within2', 'farther'])
        for (const e of (mm.snap[b] || [])) dist[e.vid] = e.d;
      for (const av of (mm.offered.allyVids || [])) {
        offeredTotal++;
        if (dist[av] === undefined) offeredUnknown++;
        else if (dist[av] <= 2) offeredColocated++;
      }
    }
  }
  for (const x of (j.tbFights || [])) {
    if (!x.started) continue;
    const xx = Object.assign({ seed: j.seed }, x);
    tbStarted.push(xx);
    companionCounts.push((xx.companions || []).length);
    formalSizes.push(xx.formalPartySize | 0);
    const formal = new Set(xx.formalParty || []);
    overlapCounts.push((xx.companions || []).filter(c => formal.has(c.vid)).length);
    if (xx.end === 'won' || xx.end === 'victory') tbWins++;
    else if (xx.end) tbLosses++;
  }
}

meetings.sort((a, b) => (a.seed - b.seed) || (a.day - b.day));
tbStarted.sort((a, b) => (a.seed - b.seed) || (a.day - b.day));
gameDays.sort((a, b) => a - b);
const median = gameDays.length ? gameDays[Math.floor(gameDays.length / 2)] : 0;
const classified = meetings.filter(m => m.pattern !== 'UNCLASSIFIED').length;
const coverage = meetings.length ? classified / meetings.length : 0;
const ranked = Object.entries(patterns).filter(([k]) => k !== 'UNCLASSIFIED')
  .sort((a, b) => b[1] - a[1]);
const leader = ranked[0] || ['none', 0];
const runner = ranked[1] || ['none', 0];
const binding = (meetings.length && leader[1] > 0 && leader[1] >= 2 * Math.max(runner[1], 1) && runner[1] > 0)
  ? leader[0] : (meetings.length && runner[1] === 0 && leader[1] > 0 ? leader[0] : 'SPLIT');
const mean = (arr) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 'n/a';
const shoutSorted = shoutRounds.slice().sort((a, b) => a - b);
const shoutMedian = shoutSorted.length ? shoutSorted[Math.floor(shoutSorted.length / 2)] : null;

console.log(`seeds: ${seeds.length} (${seeds.join(',')})`);
console.log(`WALL: national=${national}/${seeds.length} table=${table}/${seeds.length} wins=${won}/${seeds.length} wave4=${w4}/${seeds.length} wave5=${w5}/${seeds.length} medianSurvival=${median}d max=${gameDays[gameDays.length - 1] || 0}d`);
console.log(`MEETINGS: total=${meetings.length} classified=${classified} coverage=${(coverage * 100).toFixed(0)}%`);
console.log(`OUTCOMES: ${JSON.stringify(outcomes)}`);
console.log(`CALLERS: ${JSON.stringify(byCaller)}`);
console.log(`PATTERNS: ${JSON.stringify(patterns)}`);
console.log(`BINDING: ${binding} (leader ${leader[0]}=${leader[1]}, runner ${runner[0]}=${runner[1]}, needs >=2:1)`);
console.log(`OFFERED: namedAllyVids=${offeredTotal} colocated(d<=2)=${offeredColocated} unknown=${offeredUnknown}`);
console.log(`JOINS: calledHelp=${meetings.filter(m => m.calledHelp).length} shoutRoundMedian=${shoutMedian} shoutRounds=[${shoutRounds.join(',')}]`);
console.log(`TB: started=${tbStarted.length} companionsMean=${mean(companionCounts)} formalPartyMean=${mean(formalSizes)} overlapMean=${mean(overlapCounts)} endWon~${tbWins} endOther~${tbLosses}`);
console.log(`TB companion distribution: ${JSON.stringify(companionCounts.reduce((a, n) => { a[n] = (a[n] || 0) + 1; return a; }, {}))}`);
console.log(`TB formal-party-size distribution: ${JSON.stringify(formalSizes.reduce((a, n) => { a[n] = (a[n] || 0) + 1; return a; }, {}))}`);
for (const m of meetings) {
  const s = m.snap || {};
  console.log(`  M s${m.seed} d${m.day} ${m.caller} ${m.vid} vs ${m.mid} -> ${m.outcome} rounds=${m.rounds} pattern=${m.pattern} partySize=${m.partySize} offered=${m.offered ? m.offered.allies : '?'} allyVids=${m.offered ? m.offered.allyVids.join(',') : '?'} calledHelp=${m.calledHelp} ally=${m.allyVid || '-'} shoutR=${m.shoutRound} same=${(s.sameNode || []).length} adj=${(s.adjacent || []).length} w2=${(s.within2 || []).length} crew=${(s.crewOutdoor || []).length} fighterTask=${s.fighterTask || '-'}`);
}
for (const x of tbStarted) {
  console.log(`  TB s${x.seed} d${x.day} ${x.mid} companions=${(x.companions || []).length} [${(x.companions || []).map(c => c.vid).join(',')}] formal=${x.formalPartySize} overlap=${(x.companions || []).filter(c => (x.formalParty || []).includes(c.vid)).length} end=${x.end || '?'}`);
}

if (WRITE) {
  const out = { seeds, wall: { national, table, won, w4, w5, medianSurvival: median },
    meetingsTotal: meetings.length, classified, coverage, outcomes, callers: byCaller,
    patterns, binding, leader, runner,
    offered: { total: offeredTotal, colocated: offeredColocated, unknown: offeredUnknown },
    joins: { calledHelp: meetings.filter(m => m.calledHelp).length, shoutMedian, shoutRounds },
    tb: { started: tbStarted.length, companionMean: mean(companionCounts), formalMean: mean(formalSizes), overlapMean: mean(overlapCounts) },
    meetings: meetings.map(m => { const c = Object.assign({}, m); delete c.logTail; return c; }) };
  fs.writeFileSync(path.join(dir, 'analysis.json'), JSON.stringify(out, null, 1) + '\n');
  console.log('wrote analysis.json (logTail stripped)');
}
