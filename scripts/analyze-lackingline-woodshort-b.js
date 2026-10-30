#!/usr/bin/env node
// analyze-lackingline-woodshort-b.js — screen + ON census for
// sim-lackingline-woodshort-b (prereg:
// evidence/2026-10-29/sim-lackingline-woodshort-b-prereg.md).
// Phase 1: scan the 500-seed OFF screen for qualifiers (>= 1 OFF
// creek evening). Phase 3: full ON census over the qualifier bank
// IN SCREEN ORDER, deriving the staged seed (first qualifier with
// >= 1 wood-short still-refused ON creek evening) AFTER the census.
// No game code is changed.
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const ev = (p) => path.join(root, 'evidence', '2026-10-29', p);
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const SCREEN_DIR = ev('sim-lackingline-woodshort-b-corpus-screen-off');
const ON_DIR = ev('sim-lackingline-woodshort-b-corpus-on');
const GATE_SKIPS = ['wood-short', 'kcal-short', 'ticks-short'];

function creekEvenings(j) {
  return (j.evenings || []).filter((e) => {
    const w = e.woodcarry;
    return w && w.outcome === 'travel-refused' && w.bucket === 'creek';
  });
}
function dist(vals, floor) {
  const sorted = [...vals].sort((a, b) => a - b);
  return { min: sorted.length ? sorted[0] : null, max: sorted.length ? sorted[sorted.length - 1] : null,
    belowFloor: vals.filter((v) => v < floor).length,
    valuesBelowFloor: vals.filter((v) => v < floor).sort((a, b) => a - b),
    nextAboveFloor: sorted.find((v) => v >= floor) ?? null };
}

// ---- Phase 1: screen scan ----
const screenFiles = fs.readdirSync(SCREEN_DIR).filter((f) => f.endsWith('.json')).sort();
const screen = [];
let screenErrs = 0, screenUnclassified = 0, screenCreek = 0, day1Creek = 0;
const day1Outcomes = {};
for (const f of screenFiles) {
  const j = read(path.join(SCREEN_DIR, f));
  const ce = creekEvenings(j);
  const d1 = (j.evenings || []).find((e) => e.loopDay === 1);
  if (d1) {
    const key = d1.inside ? 'inside' : (ce.some((e) => e.loopDay === 1) ? 'creek-refused' : 'outside-other');
    day1Outcomes[key] = (day1Outcomes[key] || 0) + 1;
    if (ce.some((e) => e.loopDay === 1)) day1Creek++;
  }
  screenErrs += (j.woodcarryStore || {}).errs || 0;
  screenUnclassified += (j.woodcarryStore || {}).unclassified || 0;
  screenCreek += ce.length;
  screen.push({ seed: j.seed, endReason: j.endReason, daysAlive: j.daysAlive,
    creekEvenings: ce.length, creekDays: ce.map((e) => e.loopDay),
    errs: (j.woodcarryStore || {}).errs || 0, unclassified: (j.woodcarryStore || {}).unclassified || 0 });
}
const qualifiers = screen.filter((s) => s.creekEvenings >= 1).map((s) => s.seed);

// ---- Phase 3: ON census (only if ON legs exist) ----
const on = {};
let onCreek = 0, onStill = 0, onRescued = 0, onWoodShort = 0;
const onSkip = {}, woodVals = [], kcalVals = [], tickVals = [];
const carrySkips = {}; // skip reason -> [{seed, loopDay, woodBefore, pileBefore, kcal, sameDayCreek}]
let staged = null;
let offGuardEvenings = 0, offGuardHits = 0;
for (const s of qualifiers) {
  const onPath = path.join(ON_DIR, `woodcarry3-b-nighttravel-s${s}.json`);
  if (!fs.existsSync(onPath)) { on[s] = { missing: true }; continue; }
  const onJ = read(onPath);
  const ce = creekEvenings(onJ);
  const still = ce.filter((e) => !e.woodcarry.rescued);
  const rescued = ce.filter((e) => e.woodcarry.rescued);
  const skipCounts = {};
  for (const e of still) {
    const sk = (e.woodcarry.bridge && e.woodcarry.bridge.skip) || 'none';
    skipCounts[sk] = (skipCounts[sk] || 0) + 1;
  }
  // Carry-skip census from morning records attached to evening rows.
  const carryRows = [];
  for (const e of (onJ.evenings || [])) {
    const c = e.woodcarryCarry;
    if (!c || c.acted || c.skip === 'lever-off') continue;
    const sameDayCreek = ce.some((x) => x.loopDay === e.loopDay);
    const row = { seed: s, loopDay: e.loopDay, skip: c.skip, woodBefore: c.woodBefore ?? null,
      pileBefore: c.pileBefore ?? null, kcal: c.kcal ?? null, sameDayCreek };
    carryRows.push(row);
    carrySkips[c.skip] = carrySkips[c.skip] || [];
    carrySkips[c.skip].push(row);
  }
  on[s] = { seed: s, endReason: onJ.endReason, daysAlive: onJ.daysAlive,
    maxWaveUnlocked: onJ.maxWaveUnlocked, waveKills: onJ.waveKills,
    deaths: (onJ.deaths || []).length,
    errs: onJ.woodcarryStore.errs, unclassified: onJ.woodcarryStore.unclassified,
    creekEvenings: ce.length, stillRefused: still.length, rescued: rescued.length,
    skipCounts, carryRows,
    creekDetail: ce.map((e) => {
      const w = e.woodcarry, c = w.classification || {}, b = w.bridge || {};
      return { loopDay: e.loopDay, rescued: w.rescued, skip: b.skip || null,
        narration: w.narration || null, woodPlayer: c.woodPlayer,
        kcalLive: c.kcalLive, ticksToDayEnd: c.ticksToDayEnd,
        probeAgrees: c.probeAgrees, probeError: c.probeError,
        routeAroundError: c.routeAroundError, carry: e.woodcarryCarry || null };
    }) };
  onCreek += ce.length; onStill += still.length; onRescued += rescued.length;
  for (const [k, v] of Object.entries(skipCounts)) onSkip[k] = (onSkip[k] || 0) + v;
  onWoodShort += skipCounts['wood-short'] || 0;
  for (const d of on[s].creekDetail) { woodVals.push(d.woodPlayer); kcalVals.push(d.kcalLive); tickVals.push(d.ticksToDayEnd); }
  if (!staged) {
    const first = on[s].creekDetail.find((d) => !d.rescued && d.skip === 'wood-short');
    if (first) staged = { seed: s, loopDay: first.loopDay, skip: first.skip, narration: first.narration,
      woodPlayer: first.woodPlayer, kcalLive: first.kcalLive, ticksToDayEnd: first.ticksToDayEnd };
  }
  // OFF guard: qualifier's screen OFF evenings must contain no lever lacking-line.
  const offJ = read(path.join(SCREEN_DIR, `woodcarry3-b-nighttravel-s${s}.json`));
  for (const e of (offJ.evenings || [])) {
    offGuardEvenings++;
    for (const l of (e.eveningSayTail || [])) if (l.includes('No bridge')) offGuardHits++;
  }
}
const onSeeds = qualifiers.filter((s) => on[s] && !on[s].missing);
const census = {
  pinnedBase: 'd6723d3f39495b26cedcfd518997a99df98ec5fc',
  screenBand: '15000-15499', screenSeeds: screenFiles.length,
  screenCreekEvenings: screenCreek, screenErrs, screenUnclassified,
  day1CreekEvenings: day1Creek, day1Outcomes,
  qualifiers, qualifierCount: qualifiers.length,
  onSeedsRun: onSeeds.length,
  onCreekEvenings: onCreek, onStillRefused: onStill, onRescued: onRescued,
  onWoodShortStill: onWoodShort, onSkipCounts: onSkip,
  staged, perSeedScreen: screen, perSeedOn: onSeeds.map((s) => on[s]),
  gateDistributions: { wood: dist(woodVals, 4), kcal: dist(kcalVals, 60), ticks: dist(tickVals, 96) },
  carrySkipCensus: Object.fromEntries(Object.entries(carrySkips).map(([k, v]) => [k, { count: v.length, rows: v }])),
  offGuardEvenings, offGuardHits,
  totals: {
    onDeaths: onSeeds.reduce((a, s) => a + on[s].deaths, 0),
    onWaveKills: onSeeds.reduce((a, s) => a + Object.values(on[s].waveKills || {}).reduce((x, y) => x + y, 0), 0),
    waveReach: { wave1: onSeeds.filter((s) => on[s].maxWaveUnlocked >= 1).length,
      wave2: onSeeds.filter((s) => on[s].maxWaveUnlocked >= 2).length,
      wave3: onSeeds.filter((s) => on[s].maxWaveUnlocked >= 3).length,
      wave4: onSeeds.filter((s) => on[s].maxWaveUnlocked >= 4).length,
      wave5: onSeeds.filter((s) => on[s].maxWaveUnlocked >= 5).length },
    survived30: onSeeds.filter((s) => on[s].endReason === 'survived' && on[s].daysAlive === 30).length,
  },
};
const out = process.argv[2] || ev('sim-lackingline-woodshort-b-census.json');
fs.writeFileSync(out, JSON.stringify(census, null, 2) + '\n');
console.log(JSON.stringify({ screenSeeds: screenFiles.length, screenCreek, qualifiers: qualifiers.length,
  qualifierList: qualifiers, day1Creek, onSeedsRun: onSeeds.length, onCreek, onStill, onRescued,
  onSkip, onWoodShort, staged, offGuard: offGuardEvenings + '/' + offGuardHits }, null, 2));
