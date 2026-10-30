#!/usr/bin/env node
// analyze-lackingline4-on-b.js — full ON census for sim-lackingline4-b
// (prereg: evidence/2026-10-29/sim-lackingline4-b-prereg.md, Phase 3).
// Reads the fresh pinned-base OFF + ON corpora for the fixed 13-seed
// bank IN BANK ORDER and writes a census JSON. The staged seed is
// DERIVED here (first banked seed with >= 1 gate-skip still-refused
// ON creek evening; judged evening = its first such evening) —
// never named before this census runs. No game code is changed.
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const ev = (p) => path.join(root, 'evidence', '2026-10-29', p);
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const BANK = [13421, 13473, 13480, 13556, 13592, 13703, 13714, 13869, 13899, 14041, 14089, 14125, 14137];
const GATE_SKIPS = ['wood-short', 'kcal-short', 'ticks-short'];
function creekEvenings(j) {
  return j.evenings.filter((e) => {
    const w = e.woodcarry;
    return w && w.outcome === 'travel-refused' && w.bucket === 'creek';
  });
}
function summarize(j) {
  const ce = creekEvenings(j);
  const still = ce.filter((e) => !e.woodcarry.rescued);
  const rescued = ce.filter((e) => e.woodcarry.rescued);
  const skipCounts = {};
  for (const e of still) {
    const s = (e.woodcarry.bridge && e.woodcarry.bridge.skip) || 'none';
    skipCounts[s] = (skipCounts[s] || 0) + 1;
  }
  return {
    seed: j.seed, endReason: j.endReason, daysAlive: j.daysAlive,
    maxWaveUnlocked: j.maxWaveUnlocked, waveKills: j.waveKills,
    deaths: (j.deaths || []).length,
    errs: j.woodcarryStore.errs, unclassified: j.woodcarryStore.unclassified,
    creekEvenings: ce.length, stillRefused: still.length, rescued: rescued.length,
    skipCounts,
    creekDetail: ce.map((e) => {
      const w = e.woodcarry, c = w.classification || {}, b = w.bridge || {};
      return { loopDay: e.loopDay, rescued: w.rescued, skip: b.skip || null,
        narration: w.narration || null, woodPlayer: c.woodPlayer,
        kcalLive: c.kcalLive, ticksToDayEnd: c.ticksToDayEnd,
        probeAgrees: c.probeAgrees, probeError: c.probeError,
        routeAroundError: c.routeAroundError, carry: e.woodcarryCarry || null };
    }),
  };
}
const on = {}, off = {};
let onCreek = 0, onStill = 0, onRescued = 0, offCreek = 0;
const onSkip = {}, woodVals = [], kcalVals = [], tickVals = [];
let staged = null;
for (const s of BANK) {
  const onJ = read(ev(`sim-lackingline4-b-corpus-on/woodcarry3-b-nighttravel-s${s}.json`));
  const offJ = read(ev(`sim-lackingline4-b-corpus-off/woodcarry3-b-nighttravel-s${s}.json`));
  on[s] = summarize(onJ); off[s] = summarize(offJ);
  onCreek += on[s].creekEvenings; onStill += on[s].stillRefused; onRescued += on[s].rescued;
  offCreek += off[s].creekEvenings;
  for (const [k, v] of Object.entries(on[s].skipCounts)) onSkip[k] = (onSkip[k] || 0) + v;
  for (const d of on[s].creekDetail) { woodVals.push(d.woodPlayer); kcalVals.push(d.kcalLive); tickVals.push(d.ticksToDayEnd); }
  if (!staged) {
    const first = on[s].creekDetail.find((d) => !d.rescued && GATE_SKIPS.includes(d.skip));
    if (first) staged = { seed: s, loopDay: first.loopDay, skip: first.skip, narration: first.narration,
      woodPlayer: first.woodPlayer, kcalLive: first.kcalLive, ticksToDayEnd: first.ticksToDayEnd };
  }
}
// Ticks-short sub-table: new-base OFF ticks-short evenings vs new-base ON outcome on same loop-days.
const ticksShortSub = [];
for (const s of BANK) {
  const offJ = read(ev(`sim-lackingline4-b-corpus-off/woodcarry3-b-nighttravel-s${s}.json`));
  const onJ = read(ev(`sim-lackingline4-b-corpus-on/woodcarry3-b-nighttravel-s${s}.json`));
  for (const e of creekEvenings(offJ)) {
    const c = e.woodcarry.classification || {};
    if (!(c.ticksToDayEnd < 96)) continue;
    const onE = onJ.evenings.find((x) => x.loopDay === e.loopDay);
    const onW = onE && onE.woodcarry;
    ticksShortSub.push({ seed: s, loopDay: e.loopDay,
      offTicks: c.ticksToDayEnd, offKcal: c.kcalLive, offWood: c.woodPlayer,
      onOutcome: onE ? onE.eveningOutcome : null,
      onCreek: !!onW, onRescued: onW ? onW.rescued : null,
      onSkip: onW && onW.bridge ? onW.bridge.skip : null,
      onTicks: onW ? (onW.classification || {}).ticksToDayEnd : null,
      onKcal: onW ? (onW.classification || {}).kcalLive : null,
      onWood: onW ? (onW.classification || {}).woodPlayer : null,
      onCarry: onE ? onE.woodcarryCarry : null });
  }
}
// OFF guard: lever lacking-lines over fresh OFF evening say tails.
let offEvenings = 0, offHits = 0;
for (const s of BANK) {
  const offJ = read(ev(`sim-lackingline4-b-corpus-off/woodcarry3-b-nighttravel-s${s}.json`));
  for (const e of offJ.evenings) {
    offEvenings++;
    for (const l of (e.eveningSayTail || [])) if (l.includes('No bridge')) offHits++;
  }
}
function dist(vals, floor) {
  const sorted = [...vals].sort((a, b) => a - b);
  return { min: sorted[0], max: sorted[sorted.length - 1],
    belowFloor: vals.filter((v) => v < floor).length,
    valuesBelowFloor: vals.filter((v) => v < floor).sort((a, b) => a - b),
    nextAboveFloor: sorted.find((v) => v >= floor) ?? null };
}
const census = {
  pinnedBase: '60cfe8fe1ed5d5dc53e75163a5a17e2c8c003479',
  bank: BANK, bankSize: BANK.length,
  onCreekEvenings: onCreek, onStillRefused: onStill, onRescued: onRescued,
  onSkipCounts: onSkip, offCreekEvenings: offCreek,
  offGuardEvenings: offEvenings, offGuardHits: offHits,
  staged, perSeedOn: BANK.map((s) => on[s]), perSeedOff: BANK.map((s) => off[s]),
  gateDistributions: { wood: dist(woodVals, 4), kcal: dist(kcalVals, 60), ticks: dist(tickVals, 96) },
  ticksShortSub,
  totals: {
    onDeaths: BANK.reduce((a, s) => a + on[s].deaths, 0),
    onVillagerDeaths: BANK.reduce((a, s) => a + (read(ev(`sim-lackingline4-b-corpus-on/woodcarry3-b-nighttravel-s${s}.json`)).deaths || []).filter((d) => d.kind === 'villager' || d.kind === 'person').length, 0),
    onMonsterDeaths: BANK.reduce((a, s) => a + (read(ev(`sim-lackingline4-b-corpus-on/woodcarry3-b-nighttravel-s${s}.json`)).deaths || []).filter((d) => d.kind === 'monster').length, 0),
    onWaveKills: BANK.reduce((a, s) => a + Object.values(on[s].waveKills || {}).reduce((x, y) => x + y, 0), 0),
    waveReach: { wave1: BANK.filter((s) => on[s].maxWaveUnlocked >= 1).length,
      wave2: BANK.filter((s) => on[s].maxWaveUnlocked >= 2).length,
      wave3: BANK.filter((s) => on[s].maxWaveUnlocked >= 3).length,
      wave4: BANK.filter((s) => on[s].maxWaveUnlocked >= 4).length,
      wave5: BANK.filter((s) => on[s].maxWaveUnlocked >= 5).length },
    survived30: BANK.filter((s) => on[s].endReason === 'survived' && on[s].daysAlive === 30).length,
  },
};
const out = process.argv[2] || ev('sim-lackingline4-b-on-census.json');
fs.writeFileSync(out, JSON.stringify(census, null, 2) + '\n');
console.log(JSON.stringify({ staged: census.staged, onCreek, onStill, onRescued, onSkip, offCreek, offGuard: offEvenings + '/' + offHits }, null, 2));
