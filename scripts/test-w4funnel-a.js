#!/usr/bin/env node
// scripts/test-w4funnel-a.js — unit proof for analyzeW4funnel
// (sim-w4funnel-a, DIAG ONLY). Synthetic rows only, no harness.
// Drives every analyzer branch the DIAG-GO verdict depends on:
// outcome precedence (still-present beats removal, re-appearance
// cancels exit), pending-in-fight, vanished, fled-record, melt,
// all four kill classes, log match/mismatch both directions,
// living-vs-cumulative series + divergence, killer end statuses,
// raid-pool trace, and the join-gap classes.
'use strict';
const { analyzeW4funnel, mapOutcomeKind } = require('./test-w4funnel-diag');
let pass = 0, fail = 0;
function eq(name, got, want) {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + ' got=' + g + ' want=' + w); }
}
eq('map player kill', mapOutcomeKind('player-fight-kill'), 'killed-by-player-fight');
eq('map villager kill', mapOutcomeKind('villager-fight-kill'), 'killed-by-villager-fight');
eq('map defender kill', mapOutcomeKind('raid-defense-kill'), 'killed-by-defender-fight');
eq('map aid kill', mapOutcomeKind('aid-crisis-kill'), 'killed-other-cause');
eq('map departure', mapOutcomeKind('monsterTurn-departure'), 'departed');
eq('map fled', mapOutcomeKind('fled-record'), 'fled-record');
eq('map melt', mapOutcomeKind('player-fight-melt'), 'melted');
eq('map unclassified', mapOutcomeKind('unclassified'), 'unknown');
eq('map other-named', mapOutcomeKind('other-named:foo'), 'unknown');
eq('map null', mapOutcomeKind(null), 'unknown');

// Synthetic row: 6 arrivals.
//  seq 1: killed by player fight, log-matched, killer living scholar.
//  seq 2: killed by villager fight, log-matched, killer dead.
//  seq 3: departed after 1 survived fight (resolve mFlee).
//  seq 4: melted by player fight (tbEnd lost), never log-matched.
//  seq 5: removal says departed BUT final-present -> still-present.
//  seq 6: no removal, not present, pending lift -> pending-in-fight.
//  seq 7: fled-record (its own fate, never a kill).
//  seq 8: untagged birth (seq null) -> untagged, not in arrivals.
const row = {
  seed: 99999, days: 100, endReason: 'survived', won: 0, waveReach: 4, nationalEver: 1,
  spawnsrc: {
    spawns: [
      { day: 10, seq: 1, src: 'tile-entry', type: 'eulogy', wave: 4 },
      { day: 20, seq: 2, src: 'scripted-titan', type: 'audit', wave: 4 },
      { day: 30, seq: 3, src: 'maintain', type: 'suburb', wave: 4 },
      { day: 40, seq: 4, src: 'tile-entry', type: 'strike', wave: 4 },
      { day: 50, seq: 5, src: 'tile-entry', type: 'reunion', wave: 4 },
      { day: 60, seq: 6, src: 'tile-entry', type: 'algorithm', wave: 4 },
      { day: 70, seq: 7, src: 'fled-recovery', type: 'influencer', wave: 4 },
    ],
    raids: [
      { day: 11, pool: [{ seq: 1, src: 'tile-entry', type: 'eulogy', wave: 4 }] },
      { day: 99, pool: [{ seq: 999, src: 'tile-entry', type: 'eulogy', wave: 4 }] },
    ],
  },
  oldcore: {
    births: [
      { day: 10, seq: 1, src: 'tile-entry', type: 'eulogy', wave: 4 },
      { day: 20, seq: 2, src: 'scripted-titan', type: 'audit', wave: 4 },
      { day: 30, seq: 3, src: 'maintain', type: 'suburb', wave: 4 },
      { day: 40, seq: 4, src: 'tile-entry', type: 'strike', wave: 4 },
      { day: 50, seq: 5, src: 'tile-entry', type: 'reunion', wave: 4 },
      { day: 60, seq: 6, src: 'tile-entry', type: 'algorithm', wave: 4 },
      { day: 70, seq: 7, src: 'fled-recovery', type: 'influencer', wave: 4 },
      { day: 80, seq: null, src: 'tile-entry', type: 'eater', wave: 4 },
    ],
    removals: [
      { day: 12, seq: 1, type: 'eulogy', wave: 4, kind: 'player-fight-kill' },
      { day: 22, seq: 2, type: 'audit', wave: 4, kind: 'villager-fight-kill' },
      { day: 33, seq: 3, type: 'suburb', wave: 4, kind: 'monsterTurn-departure' },
      { day: 42, seq: 4, type: 'strike', wave: 4, kind: 'player-fight-melt' },
      { day: 52, seq: 5, type: 'reunion', wave: 4, kind: 'monsterTurn-departure' },
      { day: 72, seq: 7, type: 'influencer', wave: 4, kind: 'fled-record' },
    ],
    tbEnds: [
      { day: 12, result: 'won', seq: 1, type: 'eulogy', wave: 4, kind: 'player-fight-kill' },
      { day: 42, result: 'lost', seq: 4, type: 'strike', wave: 4, kind: 'player-fight-melt' },
    ],
    snapshots: [{ day: 90, present: [{ seq: 5, type: 'reunion', wave: 4 }] }],
    finalPresent: [{ seq: 5, src: 'tile-entry', type: 'reunion', wave: 4, hp: 900 }],
    pendingLifts: [{ seq: 6, type: 'algorithm', day: 95 }],
  },
  defwound: {
    resolveFights: [
      { day: 31, seq: 3, mid: 'suburb', wave: 4, outcome: 'mFlee', rounds: 2 },
      { day: 21, seq: 2, mid: 'audit', wave: 4, outcome: 'vKill', rounds: 3 },
    ],
  },
  raftdraft: {
    logEntries: [
      { d: 12, mid: 'eulogy', w: 4, by: 'scholar1', via: 'player' },
      { d: 22, mid: 'audit', w: 4, by: 'vill1', via: 'wild' },
      { d: 50, mid: 'eulogy', w: 4, by: 'ghost', via: 'contest' },
    ],
  },
  w5births: {
    days: [
      { day: 10, rd5: { veterans: 0 } },
      { day: 15, rd5: { veterans: 1 } },
      { day: 15, rd5: { veterans: 1 } },
      { day: 25, rd5: { veterans: 1 } },
    ],
  },
  killerStatus: {
    scholarId: 'scholar1',
    killers: [
      { vid: 'scholar1', kills4: 1, isScholar: true, gateLiving: true },
      { vid: 'vill1', kills4: 1, isScholar: false, vpFound: true, vpDead: true, gateLiving: false },
    ],
  },
};
const a = analyzeW4funnel(row);
eq('arrivals', a.arrivals, 7);
eq('untagged', a.untaggedCount, 1);
eq('outcomes', a.outcomeCounts, {
  'killed-by-player-fight': 1, 'killed-by-villager-fight': 1, departed: 1,
  melted: 1, 'still-present': 1, 'pending-in-fight': 1, 'fled-record': 1,
});
eq('known', a.knownCount, 6);
eq('unknown', a.unknownCount, 1);
eq('classified share', a.classifiedShare, 6 / 7);
eq('fought', a.foughtCount, 4);
eq('never fought', a.neverFought, 3);
eq('fought not killed', a.foughtNotKilled, 2);
eq('killed', a.killed, 2);
eq('kills log-matched', a.killsWithLogMatch, 2);
eq('log without arrival', a.logWithoutArrival.length, 1);
eq('log w5plus', a.logW5plus, 0);
eq('seq5 still-present beats removal', a.detail.find(d => d.seq === 5).outcome, 'still-present');
eq('seq6 pending', a.detail.find(d => d.seq === 6).outcome, 'pending-in-fight');
eq('seq7 fled-record', a.detail.find(d => d.seq === 7).outcome, 'fled-record');
eq('seq3 fought survived', a.detail.find(d => d.seq === 3).fought, true);
eq('fled-recovery count', a.fledRecoveryArrivals, 1);
eq('fresh arrivals', a.freshArrivals, 6);
eq('living days >=1', a.livingDays1, 2);
eq('living days >=2', a.livingDays2, 0);
eq('max living', a.maxLiving, 1);
eq('max cumulative (series days only)', a.maxCumulative, 2);
eq('max divergence (series days only)', a.maxDivergence, 1);
eq('cumulative through end day', a.cumulativeThroughEnd, 3);
eq('end divergence snapshot', a.endDivergenceSnapshot, 2);
eq('dup days', a.dupDays, 1);
eq('dup disagreements', a.dupDisagreements, 0);
eq('living killers at end', a.livingKillersAtEnd, 1);
eq('dead killers at end', a.deadKillersAtEnd, 1);
eq('pool w4', a.poolW4, 2);
eq('pool traced', a.poolTraced, 1);
eq('pool untraced', a.poolUntraced, 1);
eq('largest stage', a.largestStage.stage, 'never-fought');

// Vanished + re-appearance-cancels-exit + unclassified removal.
const row2 = {
  seed: 99998, days: 50, endReason: 'survived', won: 0, waveReach: 4, nationalEver: 0,
  spawnsrc: { spawns: [
    { day: 5, seq: 11, src: 'tile-entry', type: 'eulogy', wave: 4 },
    { day: 6, seq: 12, src: 'tile-entry', type: 'audit', wave: 4 },
    { day: 7, seq: 13, src: 'tile-entry', type: 'suburb', wave: 4 },
  ], raids: [] },
  oldcore: {
    births: [
      { day: 5, seq: 11, src: 'tile-entry', type: 'eulogy', wave: 4 },
      { day: 6, seq: 12, src: 'tile-entry', type: 'audit', wave: 4 },
      { day: 7, seq: 13, src: 'tile-entry', type: 'suburb', wave: 4 },
    ],
    removals: [
      { day: 8, seq: 12, type: 'audit', wave: 4, kind: 'unclassified' },
      { day: 9, seq: 13, type: 'suburb', wave: 4, kind: 'monsterTurn-departure' },
    ],
    tbEnds: [], snapshots: [{ day: 20, present: [{ seq: 13, type: 'suburb', wave: 4 }] }],
    finalPresent: [], pendingLifts: [],
  },
  defwound: { resolveFights: [] },
  raftdraft: { logEntries: [] },
  w5births: { days: [{ day: 5, rd5: { veterans: 0 } }] },
  killerStatus: { scholarId: 's', killers: [] },
};
const b = analyzeW4funnel(row2);
eq('vanished unknown', b.detail.find(d => d.seq === 11).outcome, 'unknown');
eq('unclassified unknown', b.detail.find(d => d.seq === 12).outcome, 'unknown');
eq('re-appearance still-present', b.detail.find(d => d.seq === 13).outcome, 'still-present');
eq('row2 known', b.knownCount, 1);
console.log(`\ntest-w4funnel-a: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
