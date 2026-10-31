#!/usr/bin/env node
// w4join-analyze-20261031.js — analyzer for sim-w4join-a.
//
// Reads per-seed JSONs (dir arg, default
// evidence/2026-10-31/perseed-w4join/base/leadfeast), classifies
// every wave-4 field meeting per the prereg (JOIN RATE against the
// co-presence denominator), reports the cost bar inputs (starvation
// deaths, median survival), and prints wall numbers. Writes
// analysis.json next to the inputs (deterministic from inputs)
// when --write is passed.
//
// Usage: node scripts/w4join-analyze-20261031.js [dir] [--write]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const dir = process.argv[2] && !process.argv[2].startsWith('--')
  ? process.argv[2] : path.join(REPO, 'evidence', '2026-10-31', 'perseed-w4join', 'base', 'leadfeast');
const WRITE = process.argv.includes('--write');

function coPresent(m) {
  // Non-defaulted same-node + adjacent entries from the instrument
  // snapshot. Defaulted entries are NOT co-presence (unknown
  // position is not presence) — they are counted separately.
  const s = m.snap || {};
  const all = [].concat(s.sameNode || [], s.adjacent || []);
  const real = all.filter(e => !e.defaulted);
  const def = all.filter(e => e.defaulted);
  return { exists: real.length > 0, n: real.length, maxTrust: real.length ? Math.max.apply(null, real.map(e => e.trust)) : null, defaultedN: def.length, entries: real };
}

function classify(m) {
  if (!m.snap || !m.offered) return 'UNCLASSIFIED';
  const cp = coPresent(m);
  const joined = !!(m.calledHelp && m.allyVid);
  if (joined) {
    if (m.outcome === 'vKill' || m.outcome === 'mFlee') return 'JOINED-WIN';
    if (m.outcome === 'vFlee' || m.outcome === 'vDie') return 'JOINED-LOST';
    return 'JOINED-OTHER';
  }
  if (cp.exists) return 'NEARBY-NEVER-JOIN';
  if ((m.snap.within2 || []).filter(e => !e.defaulted).length > 0) return 'PERIPHERY';
  return 'SOLO';
}

const files = fs.readdirSync(dir).filter(f => /^s\d+\.json$/.test(f)).sort();
const seeds = [];
const meetings = [];
let national = 0, table = 0, won = 0, w4 = 0, w5 = 0;
const gameDays = [];
const outcomes = {};
const patterns = {};
const byCaller = {};
const perSeed = {};
let starvDeaths = 0, villDeaths = 0, instrErrs = 0;
let offeredBad = 0, offeredTotal = 0;

for (const f of files) {
  const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  seeds.push(j.seed);
  national += j.national | 0; table += j.table | 0; won += j.won | 0;
  w4 += j.wave4 | 0; w5 += j.wave5 | 0;
  gameDays.push(j.gameDays | 0);
  instrErrs += (j.instrumentErrors || []).length;
  let sStarv = 0, sVill = 0;
  for (const d of (j.deaths || [])) {
    const isVill = (d.kind === 'villager' || d.kind === 'person');
    if (isVill) { sVill++; if (/starv|hunger/i.test(d.cause || '')) sStarv++; }
  }
  starvDeaths += sStarv; villDeaths += sVill;
  perSeed[j.seed] = { ff4: (j.meetings || []).length, starv: sStarv, vill: sVill, days: j.gameDays | 0 };
  for (const m of (j.meetings || [])) {
    const mm = Object.assign({ seed: j.seed }, m);
    mm.pattern = classify(mm);
    mm.coPresent = coPresent(mm);
    meetings.push(mm);
    outcomes[mm.outcome] = (outcomes[mm.outcome] || 0) + 1;
    patterns[mm.pattern] = (patterns[mm.pattern] || 0) + 1;
    byCaller[mm.caller] = (byCaller[mm.caller] || 0) + 1;
    // Perception agreement: every offered vid must be d<=1 in snapshot.
    if (mm.snap && mm.offered) {
      const dist = {};
      for (const b of ['sameNode', 'adjacent', 'within2', 'farther'])
        for (const e of (mm.snap[b] || [])) if (!e.defaulted) dist[e.vid] = e.d;
      for (const av of (mm.offered.allyVids || [])) {
        offeredTotal++;
        if (dist[av] === undefined || dist[av] > 1) offeredBad++;
      }
    }
  }
}

meetings.sort((a, b) => (a.seed - b.seed) || (a.day - b.day));
gameDays.sort((a, b) => a - b);
const median = gameDays.length ? gameDays[Math.floor(gameDays.length / 2)] : 0;
const coMeetings = meetings.filter(m => m.coPresent.exists);
const joined = meetings.filter(m => m.calledHelp && m.allyVid);
const joinedCo = coMeetings.filter(m => m.calledHelp && m.allyVid);
const floorExcluded = coMeetings.filter(m => !m.calledHelp && m.coPresent.maxTrust !== null && m.coPresent.maxTrust < 15);
const kills = meetings.filter(m => m.outcome === 'vKill');
// NOTE: the reused w4party instrument does not capture rec.allyDealt
// numerically; ally contribution is judged from log tails in
// sense-testing, never from this sum (which would read 0 spuriously).
const joinRate = coMeetings.length ? (joinedCo.length / coMeetings.length) : null;

console.log(`seeds: ${seeds.length} (${seeds.join(',')})`);
console.log(`WALL: national=${national}/${seeds.length} table=${table}/${seeds.length} wins=${won}/${seeds.length} wave4=${w4}/${seeds.length} wave5=${w5}/${seeds.length} medianSurvival=${median}d max=${gameDays[gameDays.length - 1] || 0}d`);
console.log(`MEETINGS: total=${meetings.length} coPresent=${coMeetings.length} joined=${joined.length} joinedCoPresent=${joinedCo.length} JOINRATE=${joinRate === null ? 'n/a' : (joinRate * 100).toFixed(1) + '%'} kills=${kills.length} floorExcluded=${floorExcluded.length}`);
console.log(`OUTCOMES: ${JSON.stringify(outcomes)}`);
console.log(`CALLERS: ${JSON.stringify(byCaller)}`);
console.log(`PATTERNS: ${JSON.stringify(patterns)}`);
console.log(`COST: starvDeaths=${starvDeaths} villDeaths=${villDeaths} instrErrs=${instrErrs} offeredTotal=${offeredTotal} offeredNotCoPresent=${offeredBad}`);
console.log(`PERSEED: ${JSON.stringify(perSeed)}`);
for (const m of meetings) {
  const s = m.snap || {};
  console.log(`  M s${m.seed} d${m.day} ${m.caller} ${m.vid} vs ${m.mid} -> ${m.outcome} rounds=${m.rounds} pattern=${m.pattern} partySize=${m.partySize} offered=${m.offered ? m.offered.allies : '?'} fromStart=${m.offered ? !!m.offered.allyFromStart : '?'} allyVids=${m.offered ? m.offered.allyVids.join(',') : '?'} calledHelp=${m.calledHelp} ally=${m.allyVid || '-'} coPresent=${m.coPresent.n} maxTrust=${m.coPresent.maxTrust} same=${(s.sameNode || []).length} adj=${(s.adjacent || []).length} w2=${(s.within2 || []).length} mDealt=${m.mDealt} vTaken=${m.vTaken}`);
}

if (WRITE) {
  const out = { seeds, wall: { national, table, won, w4, w5, medianSurvival: median },
    meetingsTotal: meetings.length, coPresent: coMeetings.length, joined: joined.length,
    joinedCoPresent: joinedCo.length, joinRate, kills: kills.length,
    floorExcluded: floorExcluded.length, outcomes, callers: byCaller, patterns,
    cost: { starvDeaths, villDeaths, instrErrs }, offered: { total: offeredTotal, notCoPresent: offeredBad },
    perSeed,
    meetings: meetings.map(m => { const c = Object.assign({}, m); delete c.logTail; return c; }) };
  fs.writeFileSync(path.join(dir, 'analysis.json'), JSON.stringify(out, null, 1) + '\n');
  console.log('wrote analysis.json (logTail stripped)');
}
