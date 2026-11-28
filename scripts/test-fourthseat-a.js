// scripts/test-fourthseat-a.js — proof test, arm sim-fourthseat-a (DIAG).
//
// Proves the fourthseat measurement chain on a LIVE loaded game:
//   1. A staged wave-4 expedition fight records a RICH w4fights
//      row through the exact wraps oneRun runs: entry (lead,
//      allyVids passed FULL, allies, allyFromStart, origin from
//      the call stack), the 4th-companion snapshot at fight time
//      (expedition companions, winPlan.party, pinned quad, scholar
//      party, living roster, sense re-read), and post-call the
//      fight record itself (outcome, rounds, per-seat dealt
//      tallies, ally vids + join flags, shout rounds, full log,
//      roundsDetail, recovered mHpStart).
//   2. The analyzer classifies the LIVE row: fought, seats
//      present, arrival rounds (door 0 / shout round, log
//      cross-checked), per-seat damage reconciled three ways
//      (row arithmetic, roundsDetail sums, log strike parse with
//      the proven speardmg parser), blocker from the frozen
//      taxonomy — 0 problems on the fixture fight.
//   3. The sense ledger records the villagerFightAllies call the
//      snapshot makes, and on plain master (NO env flags set in
//      this test) no sense call ever returns more than 2 ids —
//      the cap, measured live.
//   4. The analyzer selftest fixtures (21 checks) run in-process
//      as the classification contract.
//
// Fixture (encounter-gear rule, Steve 2026-11-13): a geared wave-4
// hunter as the launch leaves them — a spear with a geared ally,
// never a fresh un-geared solo scholar. The lead fights at full HP
// so they survive to the round-2 morale eval, where the hopeless
// shout fires and the ally joins — the arrival logic needs a joined
// ally to prove itself live.
//
// ORIGIN NOTE: the driver's fightOrigin reads the CALLER from the
// stack (the real caller is expeditionMonster in
// villager-agency.js, and only callers in src/js/ count). A fresh
// setupGame village has not unlocked wave 4, so the real
// expeditionMonster cannot draw one; the test therefore calls
// fieldFight through a function NAMED expeditionMonster evaluated
// with a src/js/villager-agency.js filename (vm.runInThisContext —
// see the call site below), which produces the identical stack
// signature the classifier reads. It exercises the exact wrap code
// oneRun runs, with a real wave-4 mdef and real geared villagers —
// the name + file are the interface, documented here, not a silent
// fake.
//
// Usage: node scripts/test-fourthseat-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
const path = require('path');
const vm = require('vm');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const fourthseat = require('./fourthseat-driver-a');
const { classifyFight, seatDealt, parseArrivalLines } = require('./analyze-fourthseat-a');

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function personOf(Game, vid) {
  try { if (Game.getPerson) { const p = Game.getPerson(vid); if (p) return p; } } catch (e) {}
  return ((Game.data.villagers || []).find(x => x.id === vid) || {});
}
function setHealth(Game, vid, hp) {
  (Game.state.village.health = Game.state.village.health || {})[vid] = hp;
}
function resetVillager(Game, p) {
  p.items = []; p.equipped = {}; p.stashed = [];
}
function stageKit(p, keepIds) {
  const idOf = function (e) { return (typeof e === 'string') ? e : (e && (e.itemId || e.id)); };
  p.items = (p.items || []).filter(function (e) { return keepIds.indexOf(idOf(e)) !== -1; });
  try {
    if (p.equipped) {
      for (const slot of ['melee', 'weapon', 'ranged']) {
        const ent = p.equipped[slot];
        if (ent && keepIds.indexOf(ent.itemId || ent.id) === -1) p.equipped[slot] = null;
      }
    }
  } catch (e) {}
}

async function oneSeed(seed) {
  const { Game, loadFails } = await loadGame({ seed: seed, mode: 'fourthseat-unit' });
  if (loadFails && loadFails.length) { check('seed ' + seed + ' module load', false, loadFails.join('; ')); return null; }
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  if (roster.length < 3) { check('seed ' + seed + ' need 3+ NPCs', false, 'have ' + roster.length); return null; }
  const vid = roster[0];
  const cid = roster[1];
  const p = personOf(Game, vid);
  const cp = personOf(Game, cid);
  const mdef = (id) => (Game.data.monsters || []).find(m => m.id === id);
  const eulogy = mdef('eulogy');
  check('seed ' + seed + ': eulogy is a wave-4 monster', !!eulogy && eulogy.wave === 4);
  console.log('seed ' + seed + ': holder=' + vid + ' companion=' + cid + ' roster=' + roster.length);

  // NO env flags are set in this test — plain master, by design.
  // (The driver main() loud-stops on any flag; the recorder itself
  // records the flag state on the corpus.)
  check('seed ' + seed + ': no lever flags set (plain master)',
    fourthseat.FLAG_VARS.every(function (v) { return process.env[v] !== '1'; }));

  // Install the exact recorder oneRun runs.
  const L = { w4fights: [], senseCalls: [], departs: [], planCensus: [] };
  const recErrors = [];
  const rec = fourthseat.installFourthseatRecorder(Game, L, recErrors);
  check('seed ' + seed + ': recorder installs with no errors', recErrors.length === 0, JSON.stringify(recErrors));

  globalThis.__fourthseatTestGame = Game;
  const expeditionMonster = vm.runInThisContext(
    '(function expeditionMonster(v, m, opts) { return globalThis.__fourthseatTestGame.fieldFight(v, m, null, opts); })',
    { filename: path.join(__dirname, '..', 'src', 'js', 'villager-agency.js') });

  // Stage: spear lead + machete ally. The lead fights at full HP
  // (100) so they survive to the round-2 morale eval, where the
  // hopeless shout fires and the ally joins — the arrival logic
  // needs a joined ally to prove itself live. (At 40 HP the lead
  // dies in round 1 before any morale eval: the first probe shape.)
  resetVillager(Game, p);
  p.items = [{ itemId: 'hunting_spear', units: 1 }];
  Game.villagerGearUp(vid, true);
  stageKit(p, ['hunting_spear']);
  setHealth(Game, vid, 100);
  resetVillager(Game, cp);
  cp.items = [{ itemId: 'machete', units: 1 }];
  Game.villagerGearUp(cid, true);
  stageKit(cp, ['machete']);
  setHealth(Game, cid, 100);
  // Trust high + same node, so the sense SHOULD return the ally
  // when it is re-read at fight time (the sense rule, tested live).
  try { ((Game.state.village.trust = Game.state.village.trust || {}))[cid] = 80; } catch (e) {}
  let leadNode = null, allyNode = null;
  try { leadNode = Game.npcNode ? Game.npcNode(vid) : null; } catch (e) {}
  try { allyNode = Game.npcNode ? Game.npcNode(cid) : null; } catch (e) {}
  const sameNode = !!(leadNode && allyNode && leadNode.nx === allyNode.nx && leadNode.ny === allyNode.ny);

  let row = null, recFight = null;
  let firstFought = null, firstFoughtRec = null;
  for (let s = 0; s < 6 && !row; s++) {
    setHealth(Game, vid, 100); setHealth(Game, cid, 100);
    const before = L.w4fights.length;
    const thisRec = expeditionMonster(vid, eulogy, { rng: mulberry32(100 + s), allies: 1, allyVids: [cid] });
    const rows = L.w4fights.slice(before).filter(function (r) { return r.vid === vid && r.mid === 'eulogy'; });
    if (rows.length && (rows[0].rounds | 0) > 0) {
      if (!firstFought) { firstFought = rows[0]; firstFoughtRec = thisRec; }
      // Prefer a row where the ally actually joined AND the party
      // dealt damage (arrival + damage logic both need proof);
      // fall back to the first fought row if no attempt joins.
      // (The Eulogy's narration trick can eat a whole fight's
      // strikes — a 0-damage joined row proves the arrival but not
      // the damage split, so it is not preferred.)
      if (rows[0].allyVid && (rows[0].mDealt | 0) > 0) { row = rows[0]; recFight = thisRec; break; }
    }
  }
  if (!row) { row = firstFought; recFight = firstFoughtRec; }
  check('seed ' + seed + ': a live wave-4 expedition fight records a rich w4fights row',
    !!row, 'rows=' + L.w4fights.length + ' rec=' + JSON.stringify(recFight && { outcome: recFight.outcome, rounds: recFight.rounds }));
  if (!row) { try { rec.uninstall(); } catch (e) {} return null; }

  check('seed ' + seed + ': rich row origin expedition, wave 4, eulogy',
    row.origin === 'expedition' && row.wave === 4 && row.mid === 'eulogy',
    JSON.stringify({ o: row.origin, w: row.wave, m: row.mid }));
  check('seed ' + seed + ': allyVids passed FULL pre-slice (no truncation at record time)',
    Array.isArray(row.allyVidsPassed) && row.allyVidsPassed.length === 1 && row.allyVidsPassed[0] === cid,
    JSON.stringify(row.allyVidsPassed));
  check('seed ' + seed + ': snapshot present with all four layers',
    !!row.snap && Array.isArray(row.snap.expedCompanions) && Array.isArray(row.snap.planParty) &&
    Array.isArray(row.snap.pinnedQuad) && row.snap.rosterN != null && row.snap.livingN != null &&
    row.snap.senseN != null,
    JSON.stringify(row.snap));
  check('seed ' + seed + ': snapshot sense re-read agrees with the ledger (same call logged)',
    L.senseCalls.some(function (s) { return s.vid === vid && s.day === row.day && JSON.stringify(s.returned) === JSON.stringify(row.snap.senseReturned); }),
    'senseCalls=' + L.senseCalls.length + ' snapSense=' + JSON.stringify(row.snap.senseReturned));
  check('seed ' + seed + ': per-seat tallies split mDealt (lead + ally1 + ally2 + ally3 = total)',
    row.leadDealt + row.ally1Dealt + row.ally2Dealt + row.ally3Dealt === row.mDealt &&
    row.leadDealt >= 0 && row.ally1Dealt >= 0 && row.ally2Dealt >= 0 && row.ally3Dealt >= 0,
    JSON.stringify({ lead: row.leadDealt, a1: row.ally1Dealt, a2: row.ally2Dealt, a3: row.ally3Dealt, total: row.mDealt }));
  check('seed ' + seed + ': mHpStart recovered on a fought non-kill (mHpLeft + mDealt)',
    row.outcome !== 'vKill' ? (row.mHpStart === (recFight.mHpLeft | 0) + (recFight.mDealt | 0) && row.mHpStart > 0) : (row.mHpStart === null),
    JSON.stringify({ mHpStart: row.mHpStart, mHpLeft: recFight.mHpLeft, mDealt: recFight.mDealt, outcome: row.outcome }));
  check('seed ' + seed + ': full fight log stored (strike lines present)',
    Array.isArray(row.log) && row.log.some(function (l) { return /strikes for \d+/.test(String(l)); }),
    (row.log || []).slice(0, 3).join(' | '));

  // The analyzer classifies the LIVE row.
  const c = classifyFight(row);
  check('seed ' + seed + ': analyzer classifies the live row (fought, seats, blocker)',
    !!c, 'null classification');
  if (c) {
    check('seed ' + seed + ': live row seats present = 1 + joined allies (ally3 never)',
      c.seatsPresent >= 1 && c.seatsPresent <= 2,
      'seats=' + c.seatsPresent + ' allyVid=' + row.allyVid + ' ally2Vid=' + row.ally2Vid);
    check('seed ' + seed + ': live row blocker is a frozen-taxonomy value',
      ['no-4th-companion', 'sense-cap-2', 'call-site-cap', 'engine-slice-2',
        'fight-ended-first', 'call-in-never-reached', 'seat-present'].indexOf(c.blocker) !== -1,
      c.blocker);
    check('seed ' + seed + ': live row rdResidual 0 (engine per-round accounting agrees)',
      c.rdResidual === 0, 'rdResidual=' + c.rdResidual);
    check('seed ' + seed + ': live row logResidual 0 (log strike parse agrees)',
      c.logResidual === 0, 'logResidual=' + c.logResidual + ' problems=' + JSON.stringify(c.problems));
    check('seed ' + seed + ': live row classified with 0 problems (GO bar shape)',
      !c.unclassified, JSON.stringify(c.problems));
    if (row.allyVid) {
      check('seed ' + seed + ': joined ally has a known arrival round (door 0 or shout round)',
        c.arrival.ally1 != null && (c.arrival.ally1 === 0 || c.arrival.ally1 === row.shoutRound),
        JSON.stringify(c.arrival));
    } else {
      console.log('  (seed ' + seed + ': ally never joined — arrival check vacuous on this row)');
    }
  }

  // The sense ledger: every call on plain master returns ≤ 2.
  check('seed ' + seed + ': sense ledger recorded calls',
    L.senseCalls.length >= 1, 'calls=' + L.senseCalls.length);
  const maxSense = L.senseCalls.reduce(function (a, s) { return Math.max(a, s.returnedN | 0); }, 0);
  check('seed ' + seed + ': no sense call returns more than 2 ids (plain-master cap, live)',
    maxSense <= 2, 'max=' + maxSense);
  if (sameNode) {
    check('seed ' + seed + ': same-node high-trust ally IS returned by the sense',
      (row.snap.senseReturned || []).indexOf(cid) !== -1,
      'sense=' + JSON.stringify(row.snap.senseReturned) + ' leadNode=' + JSON.stringify(leadNode) + ' allyNode=' + JSON.stringify(allyNode));
  } else {
    console.log('  (seed ' + seed + ': lead/ally on different nodes — same-node sense check vacuous)');
  }
  check('seed ' + seed + ': recorder left no instrument errors', recErrors.length === 0, JSON.stringify(recErrors));
  try { rec.uninstall(); } catch (e) {}
  return { seed: seed, row: row, classified: c };
}

async function main() {
  // The analyzer selftest is the classification contract — run it
  // in-process first (21 checks), then the live staged fights on
  // three seeds (measurement §3: seeded proofs, ≥3 seeds).
  console.log('— analyzer selftest (in-process) —');
  const { execSync } = require('child_process');
  try {
    const out = execSync('node ' + path.join(__dirname, 'analyze-fourthseat-a.js') + ' --selftest', { encoding: 'utf8' });
    console.log(out.trim());
    const m = /(\d+) passed, (\d+) failed/.exec(out);
    if (m) { passed += parseInt(m[1], 10); failed += parseInt(m[2], 10); if (parseInt(m[2], 10)) fails.push('analyzer selftest'); }
  } catch (e) {
    console.log('  FAIL analyzer selftest threw');
    failed++; fails.push('analyzer selftest threw');
  }
  console.log('— live staged fights (seeds 7, 42, 99) —');
  for (const seed of [7, 42, 99]) {
    await oneSeed(seed);
  }
  check('driver exports oneRun + installFourthseatRecorder + snapshot helpers',
    typeof fourthseat.oneRun === 'function' &&
    typeof fourthseat.installFourthseatRecorder === 'function' &&
    typeof fourthseat.fourthseatSnapshot === 'function' &&
    typeof fourthseat.expeditionCompanions === 'function' &&
    typeof fourthseat.fightOrigin === 'function');
  check('driver flag list covers all eight lever flags',
    ['VETREENGAGE', 'PARTYSIZE4', 'FIGHTALLY2', 'ALLYSLOT3', 'SENSEEXPED', 'FLEEREPAIR2', 'DMGPIN', 'PINQUAD']
      .every(function (v) { return fourthseat.FLAG_VARS.indexOf(v) !== -1; }));
  console.log('test-fourthseat-a: ' + passed + ' passed, ' + failed + ' failed' + (failed ? ' — ' + fails.join('; ') : ''));
  process.exitCode = failed ? 1 : 0;
}

main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
