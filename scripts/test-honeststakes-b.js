#!/usr/bin/env node
// test-honeststakes-b.js — the HONEST-STAKES LEDGER proof
// (arm sim-honeststakes-b, run fleshout-loop-b-20261109T1930Z, Loop B, axis
// scale-onramp / winnability chain. Small game-code build: the arena-lost
// path (_contestArenaAfter, 'lost') now writes the death into
// contestDeathsById with the same keying/counting as _contestDie, so the
// choice screen's "This one has killed N before" line tells the truth.
// Parent finding: evidence/2026-11-09/sim-arenadecomp-b.md, finding (b);
// prereg: evidence/2026-11-09/sim-honeststakes-b-prereg.md.
//
// Fixture legs (live harness, one loadGame): arena-lost writes the ledger;
// a second arena loss in the same contest accumulates; a re-entrant call on
// the same contest object does NOT double-count (ac._arenaDeathLedgered);
// a player-bearing phoenix link holding the death does NOT write (the fire
// holds it — tbEnd routes a held loss through here without playerDeath);
// a villager-bearing phoenix link does NOT block the write; won/fled
// outcomes do NOT write; the non-arena villager path (_cxKillContestant,
// reached via _contestDie's watch branch) still writes exactly once.
// The player _contestDie path itself is UNTOUCHED by the diff (same
// expression, copied) and has no live occurrence on this band, so no
// fixture re-proves it — recorded here, not hidden.
//
// Live legs (read the committed before/after corpora in
// evidence/2026-11-09/perseed-honeststakes-b/, skip-until-present like the
// foundation proof): before ledger {} on all 8 seeds; after ledger == the
// arenadecomp arena-death join per seed (band total 10); before/after
// fingerprints byte-identical on all 8 seeds (deaths/days/outcomes
// unchanged); every choice-screen record line in the after corpus tells
// the truth about prior arena deaths in that contest (joined on day +
// take order); the 43008 d28 Pit offer to Sal now reads "killed 1 before".
// Usage: node scripts/test-honeststakes-b.js
// Never run concurrent jest; use --cacheDirectory=/tmp/jest-cache-sim-honeststakes-b.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

let PASS = 0, FAIL = 0, SKIP = 0;
const FAILURES = [];
function check(name, cond, detail) {
  if (cond) { PASS++; console.log('PASS ' + name); }
  else { FAIL++; FAILURES.push(name); console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function skip(name, why) { SKIP++; console.log('SKIP ' + name + ' — ' + why); }

const BEFORE_DIR = path.join(REPO, 'evidence', '2026-11-09', 'perseed-honeststakes-b', 'before');
const AFTER_DIR = path.join(REPO, 'evidence', '2026-11-09', 'perseed-honeststakes-b', 'after');
const SEEDS = [43001, 43002, 43003, 43004, 43005, 43006, 43007, 43008];
// The arenadecomp arena-death join (evidence/2026-11-09/sim-arenadecomp-b.md),
// keyed by the contest ids the engine uses (pit / siege / gauntlet).
const EXPECTED_LEDGER = {
  43001: { pit: 1 },
  43002: {},
  43003: { siege: 1 },
  43004: { pit: 2, gauntlet: 1 },
  43005: { pit: 1 },
  43006: {},
  43007: { siege: 1 },
  43008: { pit: 3 },
};

function readCorpus(dir, seed) {
  const f = path.join(dir, `arenadecomp-b-winseek-s${seed}.json`);
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
function readBare(dir, seed) {
  const f = path.join(dir, `arenadecomp-b-bare-s${seed}.json`);
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
function readSense(leg) {
  const f = path.join(REPO, 'evidence', '2026-11-09', 'perseed-honeststakes-b', `sense-43008-${leg}.json`);
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
// The sweep's fingerprint, recomputed from a per-seed corpus (same fields,
// same order) — the neutrality comparison.
function fingerprint(c) {
  return {
    seed: c.seed, daysAlive: c.daysAlive, endReason: c.endReason, rank: c.rank,
    maxWave: Math.max.apply(null, c.waveReach), national: c.national,
    table: c.table, win: c.win, deathCauses: c.deathCauses,
    deathKeys: (c.deathRows || []).map(d => d.day + '|' + d.who + '|' + d.cause).sort(),
    finalPop: c.finalPop,
  };
}
const sameLedger = (a, b) => JSON.stringify(a || {}) === JSON.stringify(b || {});

// ---- fixture helpers (live harness) ----
function arenaAc(Game, contestId) {
  const ac = { contestId, participant: 'player', participants: ['player'],
    others: [], phase: 'arena', phaseIdx: 1, phases: [], variant: null,
    wounds: 0, arenaSuspended: false };
  const arc = { contestId, waveIdx: 0, waves: ['speedbump_turtle'] };
  Game.state.activeContest = ac;
  return { ac, arc };
}
function resetLedger(Game) {
  Game.state.contestDeathsById = {};
  Game.state.activeContest = null;
  try { delete Game.state.phoenixLink; } catch (e) {}
}

async function fixtures() {
  const { Game } = await loadGame({ seed: 43008, mode: 'honeststakes-b-fixture', fullTelemetry: false });
  await setupGame(Game);
  check('F0 harness: _contestArenaAfter exists', typeof Game._contestArenaAfter === 'function');
  check('F0 harness: contest pool resolves pit', (() => {
    try { return (Game.contestPool() || []).some(c => c.id === 'pit'); } catch (e) { return false; }
  })());

  // F1: arena-lost writes the ledger, keyed by contest id.
  resetLedger(Game);
  let f = arenaAc(Game, 'pit');
  let ret = null, threw = null;
  try { ret = Game._contestArenaAfter(f.arc, 'lost'); } catch (e) { threw = e; }
  check('F1 arena-lost writes the ledger (pit -> 1)', threw === null && sameLedger(Game.state.contestDeathsById, { pit: 1 }),
    threw ? 'threw: ' + threw.message : 'ledger=' + JSON.stringify(Game.state.contestDeathsById));
  check('F1 arena-lost returns the death outcome', ret && ret.done === true && ret.outcome === 'died',
    'ret=' + JSON.stringify(ret));

  // F2: a second arena loss in the same contest accumulates (fresh ac).
  resetLedger(Game);
  f = arenaAc(Game, 'pit');
  try { Game._contestArenaAfter(f.arc, 'lost'); } catch (e) { threw = e; }
  f = arenaAc(Game, 'pit');
  try { Game._contestArenaAfter(f.arc, 'lost'); } catch (e) { threw = e; }
  check('F2 second arena loss accumulates (pit -> 2)', threw === null && sameLedger(Game.state.contestDeathsById, { pit: 2 }),
    'ledger=' + JSON.stringify(Game.state.contestDeathsById));

  // F3: a re-entrant call on the SAME contest object does not double-count.
  resetLedger(Game);
  f = arenaAc(Game, 'pit');
  try { Game._contestArenaAfter(f.arc, 'lost'); } catch (e) { threw = e; }
  Game.state.activeContest = f.ac; // resume the same object, as a re-entrant call would
  try { Game._contestArenaAfter(f.arc, 'lost'); } catch (e) { threw = e; }
  check('F3 re-entrant same-ac call does not double-count (pit stays 1)', threw === null && sameLedger(Game.state.contestDeathsById, { pit: 1 }),
    'ledger=' + JSON.stringify(Game.state.contestDeathsById));

  // F4: a player-bearing phoenix link holding the death does NOT write.
  resetLedger(Game);
  Game.state.phoenixLink = { stage: 'choice', bearerIsPlayer: true, bearer: Game.villagerId, victim: Game.villagerId, deadline: 99 };
  f = arenaAc(Game, 'pit');
  try { Game._contestArenaAfter(f.arc, 'lost'); } catch (e) { threw = e; }
  check('F4 phoenix-held loss does not write the ledger (still {})', threw === null && sameLedger(Game.state.contestDeathsById, {}),
    'ledger=' + JSON.stringify(Game.state.contestDeathsById));
  // ...and once the link clears, the same loss WOULD write (the guard reads live state).
  try { delete Game.state.phoenixLink; } catch (e) {}
  Game.state.activeContest = f.ac;
  try { Game._contestArenaAfter(f.arc, 'lost'); } catch (e) { threw = e; }
  check('F4b link cleared: the loss writes (pit -> 1)', threw === null && sameLedger(Game.state.contestDeathsById, { pit: 1 }),
    'ledger=' + JSON.stringify(Game.state.contestDeathsById));

  // F5: a villager-bearing phoenix link does NOT block the player's death write.
  resetLedger(Game);
  Game.state.phoenixLink = { stage: 'choice', bearerIsPlayer: false, bearer: 'some-villager', victim: 'some-villager', deadline: 99 };
  f = arenaAc(Game, 'siege');
  try { Game._contestArenaAfter(f.arc, 'lost'); } catch (e) { threw = e; }
  check('F5 villager-bearing phoenix link does not block the write (siege -> 1)', threw === null && sameLedger(Game.state.contestDeathsById, { siege: 1 }),
    'ledger=' + JSON.stringify(Game.state.contestDeathsById));

  // F6: won / fled outcomes do NOT write the ledger.
  resetLedger(Game);
  f = arenaAc(Game, 'pit');
  try { Game._contestArenaAfter(f.arc, 'won'); } catch (e) { threw = e; }
  check('F6a arena-won does not write the ledger (still {})', threw === null && sameLedger(Game.state.contestDeathsById, {}),
    threw ? 'threw: ' + threw.message : 'ledger=' + JSON.stringify(Game.state.contestDeathsById));
  resetLedger(Game);
  f = arenaAc(Game, 'pit');
  try { Game._contestArenaAfter(f.arc, 'fled'); } catch (e) { threw = e; }
  check('F6b arena-fled does not write the ledger (still {})', threw === null && sameLedger(Game.state.contestDeathsById, {}),
    threw ? 'threw: ' + threw.message : 'ledger=' + JSON.stringify(Game.state.contestDeathsById));

  // F7: the non-arena villager path still writes exactly once.
  // _cxKillContestant directly: ledger +1 and the villager leaves the roster.
  resetLedger(Game);
  const roster = ((Game.state || {}).village || {}).roster || [];
  const victim = roster.find(id => id && id !== Game.villagerId) || null;
  if (!victim) { skip('F7 _cxKillContestant writes exactly once', 'no non-player villager on the roster'); }
  else {
    const before = roster.length;
    try { Game._cxKillContestant(victim, 'pit'); } catch (e) { threw = e; }
    const after = (((Game.state || {}).village || {}).roster || []).length;
    check('F7a _cxKillContestant writes the ledger (pit -> 1)', threw === null && sameLedger(Game.state.contestDeathsById, { pit: 1 }),
      threw ? 'threw: ' + threw.message : 'ledger=' + JSON.stringify(Game.state.contestDeathsById));
    check('F7b _cxKillContestant removes the villager from the roster', after === before - 1,
      'roster ' + before + ' -> ' + after);
    try { Game._cxKillContestant(victim, 'pit'); } catch (e) { threw = e; }
    check('F7c second kill of the same (already-removed) villager still counts once per call, ledger now 2 — documents per-call semantics, not a double-count',
      sameLedger(Game.state.contestDeathsById, { pit: 2 }),
      'ledger=' + JSON.stringify(Game.state.contestDeathsById));
  }

  // F8: the watch branch of _contestDie (villager dies on camera) writes
  // exactly once via _cxKillContestant and does not touch the player's ledger
  // entry — the non-arena path the arena fix must not disturb.
  resetLedger(Game);
  const roster2 = ((Game.state || {}).village || {}).roster || [];
  const victim2 = roster2.find(id => id && id !== Game.villagerId) || null;
  if (!victim2) { skip('F8 _contestDie watch branch writes exactly once', 'no non-player villager left on the roster'); }
  else {
    const ac = { contestId: 'gauntlet', participant: victim2, participants: [victim2, 'player'],
      others: [], phase: 'climax', phaseIdx: 2, phases: [], variant: null, wounds: 0 };
    Game.state.activeContest = ac;
    try { Game._contestDie(ac, 'The verdict came down hard.'); } catch (e) { threw = e; }
    check('F8 _contestDie watch branch writes exactly once (gauntlet -> 1)', threw === null && sameLedger(Game.state.contestDeathsById, { gauntlet: 1 }),
      threw ? 'threw: ' + threw.message : 'ledger=' + JSON.stringify(Game.state.contestDeathsById));
  }
}

// ---- live legs (before/after corpora) ----
function liveLegs() {
  const before = {}, after = {};
  let present = true;
  for (const s of SEEDS) {
    before[s] = readCorpus(BEFORE_DIR, s);
    after[s] = readCorpus(AFTER_DIR, s);
    if (!before[s] || !after[s]) present = false;
  }
  if (!present) {
    for (const s of SEEDS) {
      if (!before[s]) skip('L1 before ledger {} seed ' + s, 'before corpus not present');
      if (!after[s]) skip('L1 after ledger seed ' + s, 'after corpus not present');
    }
    return;
  }

  // L1: before {} everywhere; after == the arenadecomp join.
  for (const s of SEEDS) {
    check('L1a before ledger {} seed ' + s, sameLedger(before[s].contestDeathsById, {}),
      'before=' + JSON.stringify(before[s].contestDeathsById));
    check('L1b after ledger == join seed ' + s, sameLedger(after[s].contestDeathsById, EXPECTED_LEDGER[s]),
      'after=' + JSON.stringify(after[s].contestDeathsById) + ' expected=' + JSON.stringify(EXPECTED_LEDGER[s]));
  }
  const totalBefore = SEEDS.reduce((a, s) => a + Object.values(before[s].contestDeathsById || {}).reduce((x, y) => x + y, 0), 0);
  const totalAfter = SEEDS.reduce((a, s) => a + Object.values(after[s].contestDeathsById || {}).reduce((x, y) => x + y, 0), 0);
  check('L1c band ledger total 0 -> 10', totalBefore === 0 && totalAfter === 10,
    'before=' + totalBefore + ' after=' + totalAfter);
  // Sensitivity: the keys must be contest IDS, not names — a name-keyed
  // write ('The Pit') would fail the L1b equality, and this names it.
  const afterKeys = SEEDS.flatMap(s => Object.keys(after[s].contestDeathsById || {}));
  check('L1d ledger keys are contest ids (pit/siege/gauntlet), never names',
    afterKeys.every(k => ['pit', 'siege', 'gauntlet'].includes(k)) && !afterKeys.some(k => /The |Pit|Siege|Gauntlet/.test(k)),
    'keys=' + JSON.stringify([...new Set(afterKeys)]));
  // Sensitivity: totals must EQUAL the lost counts, not exceed them — a
  // write on won/fled (or a double-write) would inflate past the join.
  for (const s of SEEDS) {
    const lost = (after[s].arenaAfterEvents || []).filter(e => e.result === 'lost').length;
    const counted = Object.values(after[s].contestDeathsById || {}).reduce((x, y) => x + y, 0);
    check('L1e ledger total == arena-lost count seed ' + s, counted === lost,
      'counted=' + counted + ' lost=' + lost);
  }

  // L2: fingerprints byte-identical before/after, and recorded == bare in each leg.
  for (const s of SEEDS) {
    const fb = fingerprint(before[s]), fa = fingerprint(after[s]);
    check('L2a fingerprint identical before/after seed ' + s, JSON.stringify(fb) === JSON.stringify(fa),
      'before=' + JSON.stringify(fb) + ' after=' + JSON.stringify(fa));
    const bareB = readBare(BEFORE_DIR, s), bareA = readBare(AFTER_DIR, s);
    if (!bareB || !bareA) { skip('L2b bare==recorded seed ' + s, 'bare fingerprint not present'); continue; }
    check('L2b before recorded == before bare seed ' + s, JSON.stringify(fb) === JSON.stringify(bareB),
      'recorded=' + JSON.stringify(fb) + ' bare=' + JSON.stringify(bareB));
    check('L2c after recorded == after bare seed ' + s, JSON.stringify(fa) === JSON.stringify(bareA),
      'recorded=' + JSON.stringify(fa) + ' bare=' + JSON.stringify(bareA));
  }

  // L3: every choice-screen record line in the AFTER corpus tells the
  // truth about prior arena deaths in that contest. Join: record lines in
  // sysSayLines order, matched to the day's takes in order (both sequences
  // are time-ordered); a "killed N before" line must have N == the number
  // of lost arena events for that contest with day < line day; a "No one
  // has died" line must have 0.
  const REC_KILLED = /This one has killed (\d+) before\./;
  const REC_NONE = /No one has died in this one yet\./;
  let linesChecked = 0;
  const lineProblems = [];
  for (const s of SEEDS) {
    const c = after[s];
    const lines = c.sysSayLines || [];
    const takes = c.contestTakes || [];
    const losts = (c.arenaAfterEvents || []).filter(e => e.result === 'lost');
    // group takes by day, preserving order
    const takesByDay = {};
    for (const t of takes) { (takesByDay[t.day] = takesByDay[t.day] || []).push(t); }
    const seenByDay = {};
    for (const row of lines) {
      const mK = REC_KILLED.exec(row.line);
      const mN = REC_NONE.exec(row.line);
      if (!mK && !mN) continue;
      linesChecked++;
      const dayTakes = takesByDay[row.day] || [];
      const idx = (seenByDay[row.day] = (seenByDay[row.day] || 0));
      seenByDay[row.day]++;
      if (idx >= dayTakes.length) {
        lineProblems.push(`seed ${s} d${row.day}: record line with no matching take (idx ${idx} of ${dayTakes.length})`);
        continue;
      }
      const cid = dayTakes[idx].contestId;
      const prior = losts.filter(e => e.contestId === cid && e.day < row.day).length;
      if (mK) {
        const n = parseInt(mK[1], 10);
        if (n !== prior) lineProblems.push(`seed ${s} d${row.day} ${cid}: line says killed ${n}, prior arena deaths ${prior}`);
      } else if (prior !== 0) {
        lineProblems.push(`seed ${s} d${row.day} ${cid}: line says "No one has died" but ${prior} prior arena death(s)`);
      }
    }
  }
  check('L3 every after-corpus record line tells the truth (' + linesChecked + ' lines checked)',
    linesChecked > 0 && lineProblems.length === 0,
    lineProblems.length ? lineProblems.slice(0, 5).join(' | ') : 'no record lines found at all');
  // The named case, from the uncapped sense recorder
  // (scripts/sweep-honeststakes-sense-b.js): sysSayLines caps at 400, so
  // the d28 line never reaches the corpora — the sense files hold it.
  // 43008, Sal offered The Pit d28 — before it lied, after it tells the truth.
  const senseB = readSense('before'), senseA = readSense('after');
  if (!senseB || !senseA) {
    skip('L3b 43008 d28 before: "No one has died" (the lie)', 'sense file not present');
    skip('L3c 43008 d28 after: "killed 1 before" (Howard d21)', 'sense file not present');
    skip('L3d only the d28 line changes between sense legs', 'sense file not present');
  } else {
    const recLine = (r) => {
      const m = /This one has killed (\d+) before\.|No one has died in this one yet\./.exec(r.line);
      return m ? m[0] : null;
    };
    const b28 = (senseB.records || []).filter(r => r.day === 28).map(recLine);
    const a28 = (senseA.records || []).filter(r => r.day === 28).map(recLine);
    check('L3b 43008 d28 before: "No one has died" (the lie)',
      b28.some(l => l && /No one has died/.test(l)) && !b28.some(l => l && /has killed/.test(l)),
      'before d28 record lines: ' + JSON.stringify(b28));
    check('L3c 43008 d28 after: "killed 1 before" (Howard d21)',
      a28.some(l => l === 'This one has killed 1 before.'),
      'after d28 record lines: ' + JSON.stringify(a28));
    // The sense legs are a controlled pair: same offers, same days, same
    // contests — the d28 Pit line must be the ONLY record line that changes.
    const key = (r) => r.day + '|' + recLine(r);
    const beforeKeys = new Set((senseB.records || []).map(key));
    const afterKeys = new Set((senseA.records || []).map(key));
    const onlyDiff = [...beforeKeys].filter(k => !afterKeys.has(k)).concat([...afterKeys].filter(k => !beforeKeys.has(k)));
    check('L3d only the d28 Pit line changes between sense legs',
      onlyDiff.length === 2 && onlyDiff.some(k => k === '28|No one has died in this one yet.') && onlyDiff.some(k => k === '28|This one has killed 1 before.'),
      'differing lines: ' + JSON.stringify(onlyDiff));
    // Every after-sense record line tells the truth about prior arena
    // deaths in that contest (joined to the sweep after-corpus).
    const losts08 = (after[43008].arenaAfterEvents || []).filter(e => e.result === 'lost');
    const senseProblems = [];
    for (const r of (senseA.records || [])) {
      const take = (senseA.takes || []).find(t => t.day === r.day);
      if (!take) { senseProblems.push(`d${r.day}: record line with no take`); continue; }
      const prior = losts08.filter(e => e.contestId === take.contestId && e.day < r.day).length;
      const mK = /This one has killed (\d+) before\./.exec(r.line);
      if (mK && parseInt(mK[1], 10) !== prior) senseProblems.push(`d${r.day} ${take.contestId}: line says killed ${mK[1]}, prior ${prior}`);
      if (/No one has died in this one yet\./.test(r.line) && prior !== 0) senseProblems.push(`d${r.day} ${take.contestId}: line says "No one" but ${prior} prior`);
    }
    check('L3e every after-sense record line tells the truth (' + (senseA.records || []).length + ' lines)',
      senseProblems.length === 0, senseProblems.slice(0, 5).join(' | ') || 'no sense records found');
  }

  // L4: wall numbers — reported, and identical before/after (the fix moves no headline).
  const wall = (set) => {
    const days = SEEDS.map(s => set[s].daysAlive).sort((a, b) => a - b);
    return {
      national: SEEDS.filter(s => set[s].national).length,
      table: SEEDS.filter(s => set[s].table).length,
      wins: SEEDS.filter(s => set[s].win).length,
      wave4: SEEDS.filter(s => (set[s].waveReach || []).includes(4)).length,
      wave5: SEEDS.filter(s => (set[s].waveReach || []).includes(5)).length,
      medianDays: days[Math.floor(days.length / 2)],
      floorReach: SEEDS.filter(s => set[s].daysAlive >= 90).length,
    };
  };
  const wb = wall(before), wa = wall(after);
  console.log('WALL before: ' + JSON.stringify(wb));
  console.log('WALL after:  ' + JSON.stringify(wa));
  check('L4 wall numbers identical before/after', JSON.stringify(wb) === JSON.stringify(wa),
    'before=' + JSON.stringify(wb) + ' after=' + JSON.stringify(wa));
}

(async () => {
  try { await fixtures(); } catch (e) {
    FAIL++; FAILURES.push('fixtures crashed');
    console.log('FAIL fixtures crashed — ' + (e && e.stack ? e.stack.slice(0, 1200) : e));
  }
  try { liveLegs(); } catch (e) {
    FAIL++; FAILURES.push('live legs crashed');
    console.log('FAIL live legs crashed — ' + (e && e.stack ? e.stack.slice(0, 1200) : e));
  }
  console.log(`\ntest-honeststakes-b: ${PASS} passed, ${FAIL} failed, ${SKIP} skipped`);
  if (FAILURES.length) console.log('failures: ' + FAILURES.join(' | '));
  process.exit(FAIL ? 1 : 0);
})().catch(e => { console.error('TEST CRASH', e); process.exit(2); });
