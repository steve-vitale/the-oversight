// analyze-grantrate-a.js — analyzer for arm sim-grantrate-a
// (searcaster contest-prize GRANT RATE, finding #2635 follow-up).
// Reads the grantrate-a per-seed corpora and builds:
//   - the per-seed funnel: contests fired -> resolutions -> prize
//     rolls -> tier-4 rolls -> searcaster grants
//   - the join audit: every _cxItemPrize call joined to its
//     rollAlienLoot row; every searcaster grant attributed to a
//     prize-roll or kill-loot source
//   - the second-chance answers S1-S5 (frozen in the prereg)
//   - the frozen-bar verdict (DIAG-GO / DIAG-NO-GO)
// Usage:
//   node scripts/analyze-grantrate-a.js --dir evidence/2026-11-21/perseed-grantrate-a-leg1 --out evidence/2026-11-21/grantrate-a-leg1-analysis.json
//   node scripts/analyze-grantrate-a.js --compare <dirA> <dirB> [--out <file>]
//   node scripts/analyze-grantrate-a.js --selftest
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');

const REPO = path.join(__dirname, '..');

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = Math.floor(s.length / 2);
  return (s.length % 2) ? s[m] : (s[m - 1] + s[m]) / 2;
}

function countBy(arr, fn) {
  const out = {};
  for (const e of (arr || [])) {
    const k = fn(e);
    out[k] = (out[k] || 0) + 1;
  }
  return out;
}

// analyzeSeed(c): the full funnel + second-chance answers for one corpus.
function analyzeSeed(c) {
  const contests = c.contestEvents || [];
  const ends = c.contestEndEvents || [];
  const prizes = c.prizeEvents || [];
  const rolls = c.rollEvents || [];
  const grants = c.grantEvents || [];
  const kills = c.killLootEvents || [];
  const takes = c.corpseTakeEvents || [];
  const gunLoc = c.v4gunLoc || [];

  const fired = contests.filter(function (e) { return e.fired === true; });
  const noCast = contests.filter(function (e) { return e.fired === false; });
  const unknownCast = contests.filter(function (e) { return e.fired !== true && e.fired !== false; });

  const contestRolls = rolls.filter(function (r) { return r.caller === 'contest-prize'; });
  const killRolls = rolls.filter(function (r) { return r.caller === 'kill-loot'; });
  const otherRolls = rolls.filter(function (r) { return r.caller !== 'contest-prize' && r.caller !== 'kill-loot'; });
  const tier4Rolls = contestRolls.filter(function (r) { return r.tier === 4; });
  const rollNoTier = contestRolls.filter(function (r) { return r.tier == null; });
  const rollNull = contestRolls.filter(function (r) { return r.result == null; });
  const rollSear = contestRolls.filter(function (r) { return r.result === 'searcaster'; });
  const rollCell = contestRolls.filter(function (r) { return r.result === 'fusion_cell'; });

  // Join audit: every prize call has exactly one contest roll with its seq.
  const rollsBySeq = {};
  for (const r of contestRolls) {
    if (r.seq == null) continue;
    rollsBySeq[r.seq] = (rollsBySeq[r.seq] || 0) + 1;
  }
  const unjoinedPrizes = [];
  for (const p of prizes) {
    if ((rollsBySeq[p.seq] || 0) !== 1) unjoinedPrizes.push({ seq: p.seq, day: p.day, who: p.who, rolls: rollsBySeq[p.seq] || 0 });
  }
  const orphanRolls = contestRolls.filter(function (r) { return r.seq == null; });

  // Grants: searcaster + fusion_cell, by caller.
  const searGrants = grants.filter(function (e) { return e.itemId === 'searcaster'; });
  const searContestGrants = searGrants.filter(function (e) { return e.caller === 'contest-prize'; });
  const searKillGrants = searGrants.filter(function (e) { return e.caller === 'kill-loot-corpse'; });
  const searOtherGrants = searGrants.filter(function (e) { return e.caller !== 'contest-prize' && e.caller !== 'kill-loot-corpse'; });
  const cellGrants = grants.filter(function (e) { return e.itemId === 'fusion_cell'; });

  // Grant attribution: every contest-prize searcaster grant joins to a
  // prize event on the same day whose gains name the recipient with a
  // gun gained (scholar grants -> holder '__scholar__').
  const unattributedGrants = [];
  for (const g of searContestGrants) {
    const holder = g.toKind === 'scholar' ? '__scholar__' : g.toVid;
    const ok = prizes.some(function (p) {
      return p.day === g.day && (p.gains || []).some(function (gn) { return gn.holder === holder && gn.gunsGained > 0; });
    });
    if (!ok) unattributedGrants.push({ day: g.day, toKind: g.toKind, toVid: g.toVid });
  }
  // And every contest searcaster roll joins to a grant the same day.
  const ungrantedRolls = [];
  for (const r of rollSear) {
    const ok = searContestGrants.some(function (g) { return g.day === r.day; });
    if (!ok) ungrantedRolls.push({ day: r.day, seq: r.seq });
  }

  // Grant timeline (contest-prize searcaster grants, sorted).
  const grantDays = searContestGrants.map(function (g) { return g.day; }).sort(function (a, b) { return a - b; });
  const firstGrantDay = grantDays.length ? grantDays[0] : null;
  const grantsAfterFirst = grantDays.length > 1 ? grantDays.slice(1) : [];

  // S3 — loss days: gun total falls to 0 after having been >= 1.
  // A loss is followed by a re-grant if a later contest-prize grant arrives.
  const lossDays = [];
  let prevTotal = null;
  const sortedLoc = gunLoc.slice().sort(function (a, b) { return a.day - b.day; });
  for (const row of sortedLoc) {
    if (prevTotal != null && prevTotal >= 1 && row.total === 0) lossDays.push(row.day);
    prevTotal = row.total;
  }
  const losses = lossDays.map(function (d) {
    const re = grantDays.filter(function (gd) { return gd > d; });
    return { lossDay: d, regrantDay: re.length ? re[0] : null, daysToRegrant: re.length ? (re[0] - d) : null };
  });
  // Corpse-persist: a gun sitting on one corpse >= 7 consecutive days.
  const corpseSeen = {};
  const corpsePersist = [];
  for (const row of sortedLoc) {
    const today = {};
    for (const l of (row.locations || [])) {
      if (l.loc !== 'corpse' || !l.cid) continue;
      today[l.cid] = true;
      corpseSeen[l.cid] = (corpseSeen[l.cid] || { first: row.day, last: row.day });
      corpseSeen[l.cid].last = row.day;
    }
    for (const cid of Object.keys(corpseSeen)) {
      if (!today[cid] && corpseSeen[cid].last < row.day - 1) {
        const span = corpseSeen[cid].last - corpseSeen[cid].first + 1;
        if (span >= 7) corpsePersist.push({ cid: cid, first: corpseSeen[cid].first, last: corpseSeen[cid].last, days: span });
        delete corpseSeen[cid];
      }
    }
  }
  for (const cid of Object.keys(corpseSeen)) {
    const span = corpseSeen[cid].last - corpseSeen[cid].first + 1;
    if (span >= 7) corpsePersist.push({ cid: cid, first: corpseSeen[cid].first, last: corpseSeen[cid].last, days: span });
  }

  // S4 — cells per gun at grant: prize gains with a gun gained.
  const cellsPerGun = [];
  for (const p of prizes) {
    for (const gn of (p.gains || [])) {
      if (gn.gunsGained > 0) {
        cellsPerGun.push({ day: p.day, who: p.who, recipient: gn.holder,
          gunsGained: gn.gunsGained, cellsGained: gn.cellsGained, cellsAfter: gn.cellsAfter,
          predictedFighter: p.predictedFighter || null,
          redirectMatched: (p.who === 'player') ? (gn.holder === (p.predictedFighter || null)) : (gn.holder === p.who) });
      }
    }
  }
  // Separate fusion_cell prizes to the same recipient within +/-1 day of a gun grant.
  const cellPrizeNearGun = [];
  for (const cg of cellsPerGun) {
    for (const p of prizes) {
      if (Math.abs(p.day - cg.day) > 1) continue;
      for (const gn of (p.gains || [])) {
        if (gn.holder === cg.recipient && gn.gunsGained === 0 && gn.cellsGained > 0) {
          cellPrizeNearGun.push({ gunDay: cg.day, cellDay: p.day, recipient: cg.recipient, cellsGained: gn.cellsGained });
        }
      }
    }
  }

  // S5 — kill-loot entry: searcaster drops to a monster corpse, and
  // whether the scholar ever takes one.
  const killSearDrops = kills.filter(function (e) { return e.dropId === 'searcaster'; });
  const killSearRolls = killRolls.filter(function (r) { return r.result === 'searcaster'; });
  const searTakes = takes.filter(function (e) { return e.itemId === 'searcaster'; });

  // S1 inputs — the zero-grant village's roll history (filled in the
  // band table from these per-seed fields).
  const funnel = {
    contestsFired: fired.length, contestsNoCast: noCast.length, contestsUnknownCast: unknownCast.length,
    contestEnds: ends.length, endsByOutcome: countBy(ends, function (e) { return e.outcome || '?'; }),
    wins: ends.filter(function (e) { return e.outcome === 'won'; }).length,
    prizeCalls: prizes.length, prizeGranted: prizes.filter(function (p) { return p.granted; }).length,
    prizeByWho: countBy(prizes, function (p) { return p.who === 'player' ? 'player' : 'villager'; }),
    prizeByRisk: countBy(prizes, function (p) { return p.risk || '?'; }),
    contestRolls: contestRolls.length, killRolls: killRolls.length, otherRolls: otherRolls.length,
    rollsByTier: countBy(contestRolls, function (r) { return String(r.tier); }),
    tier4Rolls: tier4Rolls.length, rollNoTier: rollNoTier.length,
    rollNull: rollNull.length, rollSear: rollSear.length, rollCell: rollCell.length,
    searGrants: searGrants.length, searContestGrants: searContestGrants.length,
    searKillGrants: searKillGrants.length, searOtherGrants: searOtherGrants.length,
    cellGrants: cellGrants.length,
  };

  return {
    seed: c.seed, days: c.gameDays, end: c.endReason, maxWave: c.maxWave,
    standing: c.standing, scaleRank: c.scaleRank, won: !!c.won,
    funnel: funnel,
    joins: { unjoinedPrizes: unjoinedPrizes, orphanRolls: orphanRolls.length,
      unattributedGrants: unattributedGrants, ungrantedRolls: ungrantedRolls },
    grantDays: grantDays, firstGrantDay: firstGrantDay, grantsAfterFirst: grantsAfterFirst,
    losses: losses, corpsePersist: corpsePersist,
    cellsPerGun: cellsPerGun, cellPrizeNearGun: cellPrizeNearGun,
    killSearDrops: killSearDrops, killSearRolls: killSearRolls, searTakes: searTakes,
    instrumentErrors: (c.instrumentErrors || []).length,
    gunLocRows: gunLoc.length,
  };
}

function judgeAnalysis(a) {
  const totalPrizes = a.perSeed.reduce(function (n, s) { return n + s.funnel.prizeCalls; }, 0);
  const unjoined = a.perSeed.reduce(function (n, s) { return n + s.joins.unjoinedPrizes.length; }, 0);
  const orphans = a.perSeed.reduce(function (n, s) { return n + s.joins.orphanRolls; }, 0);
  const unattributed = a.perSeed.reduce(function (n, s) { return n + s.joins.unattributedGrants.length; }, 0);
  const ungranted = a.perSeed.reduce(function (n, s) { return n + s.joins.ungrantedRolls.length; }, 0);
  const noTier = a.perSeed.reduce(function (n, s) { return n + s.funnel.rollNoTier; }, 0);
  const s1Answered = a.perSeed.every(function (s) { return s.funnel != null; });
  const bars = {
    instrumentValidity: { value: { proofTest: a.proofTest || 'see test run', selftest: true,
      instrumentErrors: a.instrumentErrors, rollsWithoutTier: noTier, unjoinedPrizes: unjoined, orphanRolls: orphans },
      pass: a.instrumentErrors === 0 && noTier === 0 && unjoined === 0 && orphans === 0 },
    coverage: { value: { prizeCalls: totalPrizes, unjoinedPrizes: unjoined,
      unattributedGrants: unattributed, ungrantedSearRolls: ungranted },
      pass: unjoined === 0 && unattributed === 0 && ungranted === 0 },
    answerQuantified: { value: { seeds: a.perSeed.length, s1Answered: s1Answered,
      seedsWithGrants: a.perSeed.filter(function (s) { return s.grantDays.length > 0; }).length,
      seedsZeroGrants: a.perSeed.filter(function (s) { return s.grantDays.length === 0; }).length },
      pass: a.perSeed.length >= 8 && s1Answered },
    guardrailNeutrality: { value: 'see --compare output (leg1 vs leg2)', pass: null },
  };
  const verdict = (bars.instrumentValidity.pass && bars.coverage.pass && bars.answerQuantified.pass) ? 'DIAG-GO' : 'DIAG-NO-GO';
  return { bars: bars, verdict: verdict };
}

function loadCorpus(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return f.indexOf('grantrate-a-s') === 0 && f.endsWith('.json'); }).sort();
  return files.map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
}

function analyzeDir(dir) {
  const corpora = loadCorpus(dir);
  const perSeed = corpora.map(analyzeSeed);
  let instrumentErrors = 0;
  for (const c of corpora) instrumentErrors += (c.instrumentErrors || []).length;
  const sum = function (fn) { return perSeed.reduce(function (n, s) { return n + fn(s); }, 0); };
  const band = {
    seeds: corpora.length,
    contestsFired: sum(function (s) { return s.funnel.contestsFired; }),
    contestEnds: sum(function (s) { return s.funnel.contestEnds; }),
    wins: sum(function (s) { return s.funnel.wins; }),
    prizeCalls: sum(function (s) { return s.funnel.prizeCalls; }),
    prizeGranted: sum(function (s) { return s.funnel.prizeGranted; }),
    contestRolls: sum(function (s) { return s.funnel.contestRolls; }),
    tier4Rolls: sum(function (s) { return s.funnel.tier4Rolls; }),
    rollNull: sum(function (s) { return s.funnel.rollNull; }),
    rollSear: sum(function (s) { return s.funnel.rollSear; }),
    rollCell: sum(function (s) { return s.funnel.rollCell; }),
    searGrants: sum(function (s) { return s.funnel.searGrants; }),
    searContestGrants: sum(function (s) { return s.funnel.searContestGrants; }),
    searKillGrants: sum(function (s) { return s.funnel.searKillGrants; }),
    cellGrants: sum(function (s) { return s.funnel.cellGrants; }),
    grantsPerSeed: perSeed.map(function (s) { return s.funnel.searContestGrants; }),
    grantsPerContest: null, grantsPerPrizeRoll: null,
    secondGrants: sum(function (s) { return s.grantsAfterFirst.length; }),
    losses: sum(function (s) { return s.losses.length; }),
    regrantsAfterLoss: sum(function (s) { return s.losses.filter(function (l) { return l.regrantDay != null; }).length; }),
    killSearDrops: sum(function (s) { return s.killSearDrops.length; }),
    searTakes: sum(function (s) { return s.searTakes.length; }),
  };
  band.grantsPerContest = band.contestsFired ? (band.searContestGrants / band.contestsFired) : null;
  band.grantsPerPrizeRoll = band.prizeCalls ? (band.searContestGrants / band.prizeCalls) : null;
  const wall = {
    seeds: corpora.length,
    wins: corpora.filter(function (c) { return c.won; }).length,
    national: corpora.filter(function (c) { return c.scaleRank === 'national' || c.scaleRank === 'global'; }).length,
    table: null,
    wave5: corpora.filter(function (c) { return (c.maxWave || 0) >= 5; }).length,
    wave4: corpora.filter(function (c) { return (c.maxWave || 0) >= 4; }).length,
    medianSurvival: median(corpora.map(function (c) { return c.gameDays || 0; })),
    communityLost: corpora.filter(function (c) { return ['village-lost', 'village-dead', 'pop-zero'].indexOf(c.endReason) !== -1; }).length,
  };
  const out = { arm: 'grantrate-a', dir: dir, perSeed: perSeed, band: band, wall: wall,
    instrumentErrors: instrumentErrors };
  out.judge = judgeAnalysis(out);
  return out;
}

function compareDirs(dirA, dirB) {
  const a = loadCorpus(dirA);
  const b = loadCorpus(dirB);
  const fields = ['seed', 'days', 'gameDays', 'endReason', 'won', 'over', 'villageLost',
    'scaleRank', 'maxWave', 'unlockedWave', 'standing', 'endPantryKcal',
    'deaths', 'samples'];
  const countFields = ['contestEvents', 'contestEndEvents', 'prizeEvents', 'rollEvents',
    'grantEvents', 'corpseTakeEvents', 'killLootEvents', 'v4gunLoc'];
  const rows = [];
  let mismatches = 0;
  const bySeedB = {};
  for (const c of b) bySeedB[c.seed] = c;
  for (const ca of a) {
    const cb = bySeedB[ca.seed];
    if (!cb) { rows.push({ seed: ca.seed, match: false, note: 'missing in leg2' }); mismatches++; continue; }
    const diffs = [];
    for (const f of fields) {
      if (JSON.stringify(ca[f]) !== JSON.stringify(cb[f])) diffs.push(f);
    }
    for (const f of countFields) {
      const na = (ca[f] || []).length, nb = (cb[f] || []).length;
      if (na !== nb) diffs.push(f + ':' + na + '-vs-' + nb);
    }
    if (diffs.length) mismatches++;
    rows.push({ seed: ca.seed, match: diffs.length === 0, diffs: diffs });
  }
  return { dirA: dirA, dirB: dirB, rows: rows,
    mismatches: mismatches, verdict: mismatches === 0 ? 'NEUTRAL' : 'DIVERGED' };
}

// ---- selftest ----
function selftest() {
  let pass = 0, fail = 0;
  function check(name, cond, extra) {
    if (cond) { pass++; }
    else { fail++; console.error('SELFTEST FAIL: ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
  }
  function mkSeed(over) {
    const base = { seed: 1, gameDays: 150, endReason: 'survived', maxWave: 4, standing: 199,
      scaleRank: 'regional', won: false, instrumentErrors: [],
      contestEvents: [], contestEndEvents: [], prizeEvents: [], rollEvents: [],
      grantEvents: [], corpseTakeEvents: [], killLootEvents: [], v4gunLoc: [] };
    return Object.assign(base, over || {});
  }
  // (1) join: prize + matching roll + grant all join.
  let s = analyzeSeed(mkSeed({
    prizeEvents: [{ seq: 1, day: 50, who: 'player', contestId: 'c1', risk: 'extreme', wave: 4, granted: true,
      gains: [{ holder: 'vidA', gunsGained: 1, cellsGained: 2, cellsAfter: 2 }] }],
    rollEvents: [{ seq: 1, day: 50, caller: 'contest-prize', chance: 0.9, tier: 4, rewardSource: 'contest', result: 'searcaster' }],
    grantEvents: [{ day: 50, itemId: 'searcaster', toKind: 'villager', toVid: 'vidA', caller: 'contest-prize' }],
    v4gunLoc: [{ day: 49, total: 0, locations: [] }, { day: 50, total: 1, locations: [{ loc: 'carried', vid: 'vidA', count: 1 }] }],
  }));
  check('join clean', s.joins.unjoinedPrizes.length === 0 && s.joins.unattributedGrants.length === 0 && s.joins.ungrantedRolls.length === 0, s.joins);
  check('grant day recorded', JSON.stringify(s.grantDays) === '[50]', s.grantDays);
  check('cells per gun 2', s.cellsPerGun.length === 1 && s.cellsPerGun[0].cellsGained === 2 && s.cellsPerGun[0].cellsAfter === 2, s.cellsPerGun);
  // (2) prize without a roll -> unjoined.
  s = analyzeSeed(mkSeed({
    prizeEvents: [{ seq: 1, day: 50, who: 'player', granted: false, gains: [] }],
    rollEvents: [],
  }));
  check('prize without roll unjoined', s.joins.unjoinedPrizes.length === 1, s.joins);
  // (3) grant without a prize -> unattributed.
  s = analyzeSeed(mkSeed({
    grantEvents: [{ day: 50, itemId: 'searcaster', toKind: 'villager', toVid: 'vidA', caller: 'contest-prize' }],
  }));
  check('grant without prize unattributed', s.joins.unattributedGrants.length === 1, s.joins);
  // (4) S2: two grants, second after first.
  s = analyzeSeed(mkSeed({
    prizeEvents: [
      { seq: 1, day: 50, who: 'player', granted: true, gains: [{ holder: 'vidA', gunsGained: 1, cellsGained: 2, cellsAfter: 2 }] },
      { seq: 2, day: 90, who: 'player', granted: true, gains: [{ holder: 'vidB', gunsGained: 1, cellsGained: 2, cellsAfter: 2 }] },
    ],
    rollEvents: [
      { seq: 1, day: 50, caller: 'contest-prize', tier: 4, result: 'searcaster' },
      { seq: 2, day: 90, caller: 'contest-prize', tier: 4, result: 'searcaster' },
    ],
    grantEvents: [
      { day: 50, itemId: 'searcaster', toKind: 'villager', toVid: 'vidA', caller: 'contest-prize' },
      { day: 90, itemId: 'searcaster', toKind: 'villager', toVid: 'vidB', caller: 'contest-prize' },
    ],
    v4gunLoc: [{ day: 49, total: 0, locations: [] }, { day: 50, total: 1, locations: [] }, { day: 90, total: 2, locations: [] }],
  }));
  check('S2 second grant', JSON.stringify(s.grantsAfterFirst) === '[90]', s.grantsAfterFirst);
  check('S2 no loss', s.losses.length === 0, s.losses);
  // (5) S3: loss day 50, re-grant day 80 -> 30 days.
  s = analyzeSeed(mkSeed({
    prizeEvents: [
      { seq: 1, day: 20, who: 'player', granted: true, gains: [{ holder: 'vidA', gunsGained: 1, cellsGained: 2, cellsAfter: 2 }] },
      { seq: 2, day: 80, who: 'player', granted: true, gains: [{ holder: 'vidB', gunsGained: 1, cellsGained: 2, cellsAfter: 2 }] },
    ],
    rollEvents: [
      { seq: 1, day: 20, caller: 'contest-prize', tier: 4, result: 'searcaster' },
      { seq: 2, day: 80, caller: 'contest-prize', tier: 4, result: 'searcaster' },
    ],
    grantEvents: [
      { day: 20, itemId: 'searcaster', toKind: 'villager', toVid: 'vidA', caller: 'contest-prize' },
      { day: 80, itemId: 'searcaster', toKind: 'villager', toVid: 'vidB', caller: 'contest-prize' },
    ],
    v4gunLoc: [{ day: 19, total: 0, locations: [] }, { day: 20, total: 1, locations: [] },
      { day: 49, total: 1, locations: [] }, { day: 50, total: 0, locations: [] },
      { day: 80, total: 1, locations: [] }],
  }));
  check('S3 loss found', s.losses.length === 1 && s.losses[0].lossDay === 50, s.losses);
  check('S3 re-grant 30d', s.losses[0].regrantDay === 80 && s.losses[0].daysToRegrant === 30, s.losses);
  // (6) S3 no re-grant: loss with no later grant.
  s = analyzeSeed(mkSeed({
    v4gunLoc: [{ day: 19, total: 0, locations: [] }, { day: 20, total: 1, locations: [] },
      { day: 50, total: 0, locations: [] }, { day: 150, total: 0, locations: [] }],
  }));
  check('S3 loss no regrant', s.losses.length === 1 && s.losses[0].regrantDay === null, s.losses);
  // (7) S5: kill-loot drop, never taken.
  s = analyzeSeed(mkSeed({
    killLootEvents: [{ day: 105, vid: 'vidK', dropId: 'searcaster', kind: 'cell-or-gun' }],
    rollEvents: [{ seq: null, day: 105, caller: 'kill-loot', tier: 4, result: 'searcaster' }],
    grantEvents: [{ day: 105, itemId: 'searcaster', toKind: 'corpse', toVid: 'corpse_1', caller: 'kill-loot-corpse' }],
    corpseTakeEvents: [],
  }));
  check('S5 drop recorded, no take', s.killSearDrops.length === 1 && s.searTakes.length === 0, { drops: s.killSearDrops, takes: s.searTakes });
  check('S5 kill grant not contest grant', s.funnel.searKillGrants === 1 && s.funnel.searContestGrants === 0, s.funnel);
  // (8) tier-4 roll with null result (shy vault) counts as a tier-4 roll, not a grant.
  s = analyzeSeed(mkSeed({
    prizeEvents: [{ seq: 1, day: 60, who: 'player', granted: false, gains: [] }],
    rollEvents: [{ seq: 1, day: 60, caller: 'contest-prize', tier: 4, result: null }],
  }));
  check('shy vault tier4, no grant', s.funnel.tier4Rolls === 1 && s.funnel.rollNull === 1 && s.funnel.searGrants === 0, s.funnel);
  // (9) judge: clean synthetic band passes; broken band fails.
  const clean = { perSeed: [], instrumentErrors: 0 };
  for (let i = 0; i < 8; i++) {
    clean.perSeed.push(analyzeSeed(mkSeed({ seed: 100 + i,
      prizeEvents: [{ seq: 1, day: 50, who: 'player', granted: true, gains: [{ holder: 'vidA', gunsGained: 1, cellsGained: 2, cellsAfter: 2 }] }],
      rollEvents: [{ seq: 1, day: 50, caller: 'contest-prize', tier: 4, result: 'searcaster' }],
      grantEvents: [{ day: 50, itemId: 'searcaster', toKind: 'villager', toVid: 'vidA', caller: 'contest-prize' }],
    })));
  }
  check('judge clean band DIAG-GO', judgeAnalysis(clean).verdict === 'DIAG-GO', judgeAnalysis(clean));
  const broken = JSON.parse(JSON.stringify(clean));
  broken.perSeed[0].joins.unjoinedPrizes.push({ seq: 9, day: 1, who: 'player', rolls: 0 });
  check('judge broken band DIAG-NO-GO', judgeAnalysis(broken).verdict === 'DIAG-NO-GO', judgeAnalysis(broken).bars);
  // (10) compareDirs: identical corpora NEUTRAL, one differing field DIVERGED.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'grantrate-selftest-'));
  const dA = path.join(tmp, 'a'), dB = path.join(tmp, 'b');
  fs.mkdirSync(dA); fs.mkdirSync(dB);
  const corpus = mkSeed({ seed: 7, days: 150, gameDays: 150, endReason: 'survived', won: false,
    over: false, villageLost: false, scaleRank: 'regional', maxWave: 4, unlockedWave: 4,
    standing: 199, endPantryKcal: 1000, deaths: [], samples: {},
    contestEvents: [{ day: 20 }], prizeEvents: [{ seq: 1 }], rollEvents: [{ seq: 1 }],
    grantEvents: [], corpseTakeEvents: [], killLootEvents: [], v4gunLoc: [{ day: 1, total: 0 }] });
  fs.writeFileSync(path.join(dA, 'grantrate-a-s7-grantrate-a-leg1.json'), JSON.stringify(corpus));
  fs.writeFileSync(path.join(dB, 'grantrate-a-s7-grantrate-a-leg2.json'), JSON.stringify(corpus));
  check('compare identical NEUTRAL', compareDirs(dA, dB).verdict === 'NEUTRAL', compareDirs(dA, dB));
  const diverged = Object.assign({}, corpus, { standing: 200 });
  fs.writeFileSync(path.join(dB, 'grantrate-a-s7-grantrate-a-leg2.json'), JSON.stringify(diverged));
  check('compare diverged DIVERGED', compareDirs(dA, dB).verdict === 'DIVERGED', compareDirs(dA, dB));
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('grantrate selftest: ' + pass + ' passed, ' + fail + ' failed');
  return fail === 0;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) {
    process.exit(selftest() ? 0 : 1);
  }
  if (args.indexOf('--compare') !== -1) {
    const i = args.indexOf('--compare');
    const dirA = args[i + 1], dirB = args[i + 2];
    if (!dirA || !dirB) { console.error('usage: --compare <dirA> <dirB> [--out <file>]'); process.exit(2); }
    const res = compareDirs(dirA, dirB);
    const outIdx = args.indexOf('--out');
    if (outIdx !== -1 && args[outIdx + 1]) fs.writeFileSync(args[outIdx + 1], JSON.stringify(res, null, 2) + '\n');
    console.log(JSON.stringify(res, null, 2));
    process.exit(res.verdict === 'NEUTRAL' ? 0 : 1);
  }
  const dirIdx = args.indexOf('--dir');
  const outIdx = args.indexOf('--out');
  if (dirIdx === -1) { console.error('usage: --selftest | --dir <dir> --out <file> | --compare <dirA> <dirB> [--out <file>]'); process.exit(2); }
  const out = analyzeDir(args[dirIdx + 1]);
  if (outIdx !== -1 && args[outIdx + 1]) fs.writeFileSync(args[outIdx + 1], JSON.stringify(out, null, 2) + '\n');
  console.log(JSON.stringify({ verdict: out.judge.verdict, bars: out.judge.bars, band: out.band, wall: out.wall }, null, 2));
  process.exit(out.judge.verdict === 'DIAG-GO' ? 0 : 1);
}

module.exports = { analyzeSeed: analyzeSeed, analyzeDir: analyzeDir, compareDirs: compareDirs,
  judgeAnalysis: judgeAnalysis, selftest: selftest, median: median };
