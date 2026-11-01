#!/usr/bin/env node
// test-vet2mfg-a.js — proof test for the sim-vet2mfg-a wave-4 funnel
// instrument + analyzer. Synthetic funnel cases always run; corpus
// legs run when VET2MFG_EVID points at a per-seed dir (they re-derive
// the verdict gates from the judged corpus). Exit 1 on any failure.
//
// Usage: node scripts/test-vet2mfg-a.js
//        VET2MFG_EVID=evidence/2026-11-01/perseed-vet2mfg-a node scripts/test-vet2mfg-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const { analyzeSeed, analyzeBand, outcomeClass } = require('./vet2mfg-a-analyze');

let pass = 0, fail = 0, skipped = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL: ${name}${extra ? ' — ' + extra : ''}`); }
}
function seedBase(over) {
  return Object.assign({
    seed: 1, anchorCommit: 'test', endDay: 0, gameDays: 120, endReason: 'over',
    won: 0, national: 1, table: 0, maxWave: 4, endScaleRank: 'national',
    rows: [], spawns: [], fights: [], tbStarts: [], tbEnds: [], kills: [],
    tickDaily: [], vetRows: [], mfgRows: [], recorderErrs: 0, vetErrs: 0,
    mfgErrs: 0, captureErrs: 0, sayLines: [],
  }, over || {});
}

// outcomeClass unit checks.
check('outcome vKill -> killed', outcomeClass('wild', 'vKill') === 'killed');
check('outcome mFlee -> monsterFled', outcomeClass('wild', 'mFlee') === 'monsterFled');
check('outcome vFlee -> fled', outcomeClass('wild', 'vFlee') === 'fled');
check('outcome vDie -> lost', outcomeClass('wild', 'vDie') === 'lost');
check('outcome null -> unknown', outcomeClass('wild', null) === 'unknown');
check('player won -> killed-or-won', outcomeClass('player', null, 'won') === 'killed-or-won');
check('player routed -> monsterFled', outcomeClass('player', null, 'routed') === 'monsterFled');
check('player fled -> fled', outcomeClass('player', null, 'fled') === 'fled');
check('player lost -> lost', outcomeClass('player', null, 'lost') === 'lost');

// Case 1: full funnel, one wild kill, joined exactly.
{
  const o = seedBase({
    rows: [{ day: 49, uw: 3 }, { day: 50, uw: 4 }],
    spawns: [{ seq: 1, day: 51, type: 'algorithm', wave: 4 }],
    fights: [{ ch: 'wild', day: 52, seq: 1, type: 'algorithm', wave: 4, vid: 'v1', outcome: 'vKill', kills: [0] }],
    kills: [{ idx: 0, d: 52, mid: 'algorithm', w: 4, by: 'v1', via: 'wild', trick: null, src: 'wavekill', scholarVid: 's1' }],
    tickDaily: [{ day: 51, ticks: 2, w4monsters: 1, opps: 1, shelterBlocked: 0, restBlocked: 0, scholarTile: 0, rollSkipped: 0, availTotal: 1 }],
    vetRows: [{ day: 52, vet4: ['v1'], vet5: ['v1'], names: {} }],
  });
  const a = analyzeSeed(o);
  check('c1 unlockDay 50', a.unlockDay === 50, 'got ' + a.unlockDay);
  check('c1 firstSpawnDay 51', a.firstSpawnDay === 51);
  check('c1 spawnsPost 1', a.spawnsPost === 1);
  check('c1 fightsPost 1 wild', a.fightsPost === 1 && a.fightsByChannel.wild === 1);
  check('c1 killsPost 1', a.killsPost === 1);
  check('c1 orphans 0', a.orphans === 0);
  check('c1 unclassified 0', a.unclassifiedCount === 0);
  check('c1 leak one-kill-only', a.leak === 'one-kill-only', 'got ' + a.leak);
  check('c1 maxVet5 1', a.maxVet5 === 1);
  check('c1 tickPost opps 1', a.tickPost.opps === 1);
  check('c1 complete', a.complete === true);
}

// Case 2: spawned, shelter-blocked, never fought.
{
  const o = seedBase({
    rows: [{ day: 40, uw: 4 }],
    spawns: [{ seq: 1, day: 41, type: 'reunion', wave: 4 }],
    tickDaily: [{ day: 41, ticks: 3, w4monsters: 2, opps: 0, shelterBlocked: 2, restBlocked: 0, scholarTile: 0, rollSkipped: 0, availTotal: 0 }],
  });
  const a = analyzeSeed(o);
  check('c2 leak spawned-never-fought', a.leak === 'spawned-never-fought', 'got ' + a.leak);
  check('c2 shelterBlocked 2', a.tickPost.shelterBlocked === 2);
  check('c2 fights 0', a.fightsPost === 0);
  check('c2 unclassified 0', a.unclassifiedCount === 0);
}

// Case 3: orphan kill is UNCLASSIFIED.
{
  const o = seedBase({
    rows: [{ day: 30, uw: 4 }],
    kills: [{ idx: 0, d: 35, mid: 'audit', w: 4, by: 'v9', via: 'wild', trick: null, src: 'wavekill', scholarVid: 's1' }],
  });
  const a = analyzeSeed(o);
  check('c3 orphan counted', a.orphans === 1);
  check('c3 unclassified 1', a.unclassifiedCount === 1 && a.unclassified[0].kind === 'orphan-kill');
  check('c3 complete false', a.complete === false);
}

// Case 4: unknown-outcome fight is UNCLASSIFIED.
{
  const o = seedBase({
    rows: [{ day: 30, uw: 4 }],
    spawns: [{ seq: 1, day: 31, type: 'audit', wave: 4 }],
    fights: [{ ch: 'wild', day: 32, seq: 1, type: 'audit', wave: 4, vid: 'v1', outcome: null, kills: [] }],
  });
  const a = analyzeSeed(o);
  check('c4 unclassified 1 fight-outcome', a.unclassifiedCount === 1 && a.unclassified[0].kind === 'fight-outcome');
  check('c4 leak fought-no-kill', a.leak === 'fought-no-kill', 'got ' + a.leak);
}

// Case 5: player TB outcomes.
{
  const wonKill = seedBase({
    rows: [{ day: 30, uw: 4 }],
    tbStarts: [{ day: 31, fightSeq: 1, type: 'algorithm', wave: 4, refused: false }],
    tbEnds: [{ day: 31, fightSeq: 1, result: 'won', kills: [0] }],
    kills: [{ idx: 0, d: 31, mid: 'algorithm', w: 4, by: 's1', via: 'player', trick: null, src: 'wavekill', scholarVid: 's1' }],
  });
  const a = analyzeSeed(wonKill);
  check('c5a player won+kill = killed', a.fightsPost === 1 && a.fightsByOutcome.killed === 1, JSON.stringify(a.fightsByOutcome));
  check('c5a killsPost 1 scholar', a.killsPost === 1 && a.killsPostScholarAtCall === 1);
  check('c5a unclassified 0', a.unclassifiedCount === 0);

  const wonFled = seedBase({
    rows: [{ day: 30, uw: 4 }],
    tbStarts: [{ day: 31, fightSeq: 1, type: 'algorithm', wave: 4, refused: false }],
    tbEnds: [{ day: 31, fightSeq: 1, result: 'won', kills: [0] }],
    kills: [{ idx: 0, d: 31, mid: 'bulldozer', w: 1, by: 's1', via: 'player', trick: null, src: 'wavekill', scholarVid: 's1' }],
  });
  const b = analyzeSeed(wonFled);
  check('c5b player won, w4 fled = monsterFled', b.fightsByOutcome.monsterFled === 1, JSON.stringify(b.fightsByOutcome));
  check('c5b killsPost 0 (w1 kill excluded)', b.killsPost === 0);

  const wonEmpty = seedBase({
    rows: [{ day: 30, uw: 4 }],
    tbStarts: [{ day: 31, fightSeq: 1, type: 'algorithm', wave: 4, refused: false }],
    tbEnds: [{ day: 31, fightSeq: 1, result: 'won', kills: [] }],
  });
  const c = analyzeSeed(wonEmpty);
  check('c5c player won, no kills = won-nokill UNCLASSIFIED', c.unclassifiedCount === 1 && c.unclassified[0].cls === 'won-nokill');

  const lostPyrrhic = seedBase({
    rows: [{ day: 30, uw: 4 }],
    tbStarts: [{ day: 31, fightSeq: 1, type: 'algorithm', wave: 4, refused: false }],
    tbEnds: [{ day: 31, fightSeq: 1, result: 'lost', kills: [0] }],
    kills: [{ idx: 0, d: 31, mid: 'algorithm', w: 4, by: 's1', via: 'player', trick: null, src: 'pyrrhic', scholarVid: 's1' }],
  });
  const d = analyzeSeed(lostPyrrhic);
  check('c5d player lost+pyrrhic = lost outcome, kill counted', d.fightsByOutcome.lost === 1 && d.killsPost === 1 && d.killsBySrc.pyrrhic === 1, JSON.stringify(d.fightsByOutcome) + ' ' + JSON.stringify(d.killsBySrc));
  check('c5d unclassified 0', d.unclassifiedCount === 0);
}

// Case 6: pre-unlock stages stay separate.
{
  const o = seedBase({
    rows: [{ day: 49, uw: 3 }, { day: 60, uw: 4 }],
    spawns: [{ seq: 1, day: 55, type: 'algorithm', wave: 4 }],
    fights: [{ ch: 'wild', day: 56, seq: 1, type: 'algorithm', wave: 4, vid: 'v1', outcome: 'mFlee', kills: [] }],
  });
  const a = analyzeSeed(o);
  check('c6 pre spawn 1, post 0', a.spawnsPre === 1 && a.spawnsPost === 0);
  check('c6 pre fight 1, post 0', a.fightsPre === 1 && a.fightsPost === 0);
  check('c6 leak never-spawned (post)', a.leak === 'never-spawned', 'got ' + a.leak);
}

// Case 7: never unlocks.
{
  const o = seedBase({ rows: [{ day: 10, uw: 3 }], gameDays: 90 });
  const a = analyzeSeed(o);
  check('c7 unlockDay null', a.unlockDay === null);
  check('c7 leak no-unlock', a.leak === 'no-unlock');
  check('c7 window null', a.windowDays === null);
  check('c7 unclassified 0', a.unclassifiedCount === 0);
}

// Case 8: fight without spawn record is flagged.
{
  const o = seedBase({
    rows: [{ day: 30, uw: 4 }],
    fights: [{ ch: 'patrol', day: 32, seq: 9, type: 'audit', wave: 4, vid: 'v1', outcome: 'vFlee', kills: [] }],
  });
  const a = analyzeSeed(o);
  check('c8 fight-no-spawn flagged', a.unclassifiedCount === 1 && a.unclassified[0].kind === 'fight-no-spawn');
}

// Case 9: unresolved w4 start is flagged.
{
  const o = seedBase({
    rows: [{ day: 30, uw: 4 }],
    tbStarts: [{ day: 31, fightSeq: 1, type: 'algorithm', wave: 4, refused: false }],
    tbEnds: [],
  });
  const a = analyzeSeed(o);
  check('c9 unresolved-start flagged', a.unclassifiedCount === 1 && a.unclassified[0].kind === 'unresolved-start');
}

// Case 10: shelter episodes from daily rows.
{
  const o = seedBase({
    rows: [{ day: 30, uw: 4 }],
    mfgRows: [
      { day: 31, shelteredCount: 0 }, { day: 32, shelteredCount: 5 },
      { day: 33, shelteredCount: 9 }, { day: 34, shelteredCount: 0 },
      { day: 35, shelteredCount: 3 }, { day: 36, shelteredCount: 0 },
    ],
  });
  const a = analyzeSeed(o);
  check('c10 episodes 2', a.episodeCount === 2, 'got ' + a.episodeCount);
  check('c10 shelterDays 3', a.shelterDays === 3, 'got ' + a.shelterDays);
  check('c10 first episode max 9', a.episodes[0].max === 9);
}

// Case 11: refused starts are classified, never unresolved.
{
  const o = seedBase({
    rows: [{ day: 30, uw: 4 }],
    tbStarts: [
      { day: 31, fightSeq: 1, type: 'herald', wave: 4, worldWave: 4, refused: true, threw: null },
      { day: 32, fightSeq: 2, type: 'algorithm', wave: 4, worldWave: 4, refused: false, threw: null },
    ],
    tbEnds: [{ day: 32, fightSeq: 2, result: 'fled', kills: [] }],
  });
  const a = analyzeSeed(o);
  check('c11 refused excluded from unresolved', a.unclassifiedCount === 0, JSON.stringify(a.unclassified));
  check('c11 refusedW4 1 herald', a.refusedW4 === 1 && a.refusedByType.herald === 1);
  check('c11 player fled fight counted', a.fightsPost === 1 && a.fightsByOutcome.fled === 1);
}
// Case 12: pending-instantiated player fight flagged.
{
  const o = seedBase({
    rows: [{ day: 30, uw: 4 }],
    tbStarts: [{ day: 31, fightSeq: 1, type: 'strike', wave: 4, worldWave: null, refused: false }],
    tbEnds: [{ day: 31, fightSeq: 1, result: 'won', kills: [0] }],
    kills: [{ idx: 0, d: 31, mid: 'strike', w: 4, by: 's1', via: 'player', trick: null, src: 'wavekill', scholarVid: 's1' }],
  });
  const a = analyzeSeed(o);
  check('c12 pending-instantiated flagged', a.pendingInstantiatedFights === 1);
  check('c12 kill still counted', a.killsPost === 1);
}

// Corpus legs (only when VET2MFG_EVID is set).
const evidDir = process.env.VET2MFG_EVID || null;
if (evidDir && fs.existsSync(evidDir)) {
  const { seeds, pooled } = analyzeBand(evidDir);
  check('corpus: band non-empty', seeds.length >= 8, 'got ' + seeds.length);
  check('corpus: every seed has a funnel record', seeds.every(s => s.seed && s.leak), 'missing leak');
  check('corpus: pooled totals reconcile (spawns = pre + post per seed)',
    seeds.every(s => s.spawnsTotal === s.spawnsPost + s.spawnsPre));
  check('corpus: pooled fights reconcile',
    pooled.fightsPost === seeds.reduce((t, s) => t + s.fightsPost, 0));
  check('corpus: pooled kills reconcile',
    pooled.killsPost === seeds.reduce((t, s) => t + s.killsPost, 0));
  check('corpus: zero recorder errs on judged seeds',
    seeds.every(s => s.errs.wg === 0 && s.errs.vet === 0 && s.errs.mfg === 0 && s.errs.cap === 0),
    JSON.stringify(seeds.map(s => s.errs)));
  // The verdict gates re-derived from the corpus (reported, not asserted
  // as GO here — the evidence judges them; but the re-derivation itself
  // must agree with the analyzer's pooled counts).
  check('corpus: unclassified pooled = sum of per-seed',
    pooled.unclassified === seeds.reduce((t, s) => t + s.unclassifiedCount, 0));
  check('corpus: complete seeds = zero-unclassified seeds',
    pooled.complete === seeds.filter(s => s.unclassifiedCount === 0).length);
} else {
  skipped++;
  console.log('SKIP: corpus legs (VET2MFG_EVID unset or missing)');
}

console.log(`\ntest-vet2mfg-a: ${pass} passed, ${fail} failed, ${skipped} skipped`);
if (fail) process.exit(1);
