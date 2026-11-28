#!/usr/bin/env node
// scripts/test-winflee-b.js — proof test, arm sim-winflee-b
// (WINNABLE-FLEE DIAG: is the flee call, vs damage, the binding wall
// at the kill line?).
//
// Proves the winnable-flee measurement chain:
//   §1. fleeBranchOf (the driver's branch tagger, pure): the six
//       branches from the engine's own log lines + the wise flag —
//       including the two traps: the floor flee carries
//       fleeHopeless=true (so the tag never reads that flag), and a
//       learn-intent fight can still end on the hopeless branch
//       (so the tag never reads fleeLearn alone).
//   §2. The analyzers' selftests (field race + classification —
//       including the frozen calibration case s112308 d146, rtk 3.63
//       vs rtd 9.9; TB turn-economy signals) — run in-process, no sim.
//   §3. A LIVE staged wave-4 expedition fight (same fixture shape
//       as the partydmg proof: a geared lead + a geared ally, never
//       a fresh un-geared solo scholar) records a w4dmgFights rich
//       row carrying the flee-classification fields — the same
//       shared helper (fleeClassFields) the v4encounters row uses,
//       so one code path serves both row types — with the branch tag
//       and the analyzer's class agreeing, the race computable from
//       the live row, and the guards provably off (fleeguardHold /
//       doorHold 0), so the pilot leg measures the unguarded
//       behavior on plain master.
// No build fixtures: this is a DIAG arm — no policy change, no
// src/js change, no game-code change.
//
// Usage: node scripts/test-winflee-b.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
const path = require('path');
const vm = require('vm');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const fieldDriver = require('./winflee-field-driver-b');
const fieldAnalyzer = require('./analyze-winflee-b');
const tbAnalyzer = require('./analyze-winflee-tb-b');

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

async function main() {
  // ---- §1. fleeBranchOf (pure) ----
  const B = fieldDriver.fleeBranchOf;
  check('driver exports fleeBranchOf + fleeClassFields + oneRun + installPartydmgRecorder',
    typeof B === 'function' && typeof fieldDriver.fleeClassFields === 'function' &&
    typeof fieldDriver.oneRun === 'function' &&
    typeof fieldDriver.installPartydmgRecorder === 'function');
  const L = function (lines) { return { log: lines }; };
  check('hopeless line -> hopeless',
    B(L(['Mara sees how this ends — and runs while running still works.']), 'vFlee') === 'hopeless');
  check('floor line -> floor',
    B(L(['Mara is past holding — they run while running still works.']), 'vFlee') === 'floor');
  check('floor line WITH fleeHopeless=true still -> floor (the fleeguard trap)',
    B({ log: ['Mara is past holding — they run while running still works.'], fleeHopeless: true }, 'vFlee') === 'floor');
  check('learn line -> learn',
    B(L(['Mara has seen enough — withdraws to report back. (Learn-first: not winnable, not worth the blood.)']), 'vFlee') === 'learn');
  check('learn-intent ending on the hopeless line WITH fleeLearn=true -> hopeless (never reads fleeLearn alone)',
    B({ log: ['Mara sees how this ends — and runs while running still works.'], fleeLearn: true }, 'vFlee') === 'hopeless');
  check('wise leave -> trick-leave',
    B({ log: ['Miles reads the sterile streets — you can\'t kill a suburb. They walk out.'], fleeWise: true }, 'vFlee') === 'trick-leave');
  check('committed-finish floor line -> committed-floor',
    B(L(['Mara is past holding even a finished fight — they run while running still works. (Committed-finish floor)']), 'vFlee') === 'committed-floor');
  check('vFlee with no known line -> other',
    B(L(['Something unremarkable happened.']), 'vFlee') === 'other');
  check('non-flee outcome with no line -> null',
    B(L(['The lead falls — the pack\'s coordination shatters.']), 'vKill') === null);
  check('empty log, vFlee -> other; empty log, vDie -> null',
    B({ log: [] }, 'vFlee') === 'other' && B({ log: [] }, 'vDie') === null);

  // ---- §2. Analyzer selftests (pure, in-process) ----
  let fieldSelf = false, tbSelf = false;
  try { fieldSelf = fieldAnalyzer.selftest() === true; } catch (e) { console.log('  FAIL field analyzer selftest threw: ' + e.message); }
  check('field analyzer selftest green', fieldSelf);
  try { tbSelf = tbAnalyzer.selftest() === true; } catch (e) { console.log('  FAIL TB analyzer selftest threw: ' + e.message); }
  check('TB analyzer selftest green', tbSelf);

  // ---- §3. LIVE staged wave-4 expedition fight ----
  // The diagnosis substrate: guards deliberately UNSET here (the
  // test deletes them from the ambient env so a stray export cannot
  // silently guard the fixture), substrate flags ON.
  delete process.env.FLEEGUARD; delete process.env.FLEEREPAIR3; delete process.env.DOORFLEE2;
  delete process.env.FIELDCAPDMG; delete process.env.RAGEFREE; delete process.env.FREESTRIKE;
  process.env.BOWOPEN = '1'; process.env.SPEARGATE = '1';
  process.env.VETREENGAGE = '1'; process.env.PARTYSIZE4 = '1';
  process.env.FLEEREPAIR2 = '1'; process.env.FIGHTALLY2 = '1';
  process.env.SENSEEXPED = '1';

  const { Game, loadFails } = await loadGame({ seed: 7, mode: 'winflee-b-unit' });
  if (loadFails && loadFails.length) { console.log('  FAIL module load: ' + loadFails.join('; ')); process.exitCode = 1; return; }
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  if (roster.length < 3) { console.log('  FAIL need 3+ NPCs, have ' + roster.length); process.exitCode = 1; return; }
  const vid = roster[0];
  const cid = roster[1];
  const p = personOf(Game, vid);
  const cp = personOf(Game, cid);
  const mdef = (id) => (Game.data.monsters || []).find(m => m.id === id);
  const eulogy = mdef('eulogy');
  check('eulogy is a wave-4 monster', !!eulogy && eulogy.wave === 4);

  const L2 = { spearDeparts: [], allStarts: [], expFights: [], spearTrack: [], w4dmgFights: [],
    v4departs: [], dawnbidDeparts: [], v4encounters: [], v4gates: [], open: {} };
  const recErrors = [];
  fieldDriver.installPartydmgRecorder(Game, L2, recErrors);
  check('recorder installs with no errors', recErrors.length === 0, JSON.stringify(recErrors));

  // Same ORIGIN NOTE as the partydmg proof: the driver reads the
  // caller from the stack, and only callers in src/js/ count — so
  // the test-local expeditionMonster is evaluated with a
  // src/js/villager-agency.js filename, producing the identical
  // stack signature the real caller has.
  globalThis.__winfleeTestGame = Game;
  const expeditionMonster = vm.runInThisContext(
    '(function expeditionMonster(v, m, opts) { return globalThis.__winfleeTestGame.fieldFight(v, m, null, opts); })',
    { filename: path.join(__dirname, '..', 'src', 'js', 'villager-agency.js') });

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

  const foughtRows = [];
  let fleeRow = null;
  for (let s = 0; s < 6 && (!fleeRow || foughtRows.length < 1); s++) {
    setHealth(Game, vid, 100); setHealth(Game, cid, 100);
    const before = L2.w4dmgFights.length;
    const rec = expeditionMonster(vid, eulogy, { rng: mulberry32(100 + s), allies: 1, allyVids: [cid] });
    const rows = L2.w4dmgFights.slice(before).filter(function (r) { return r.vid === vid && r.mid === 'eulogy'; });
    // Flat view: the rich row's own fields + the shared
    // fleeClass fields (the same object the v4encounters row
    // carries, from the same helper — one code path).
    for (const r of rows) {
      if ((r.rounds | 0) > 0) foughtRows.push({ row: Object.assign({}, r, r.fleeClass || {}), rec: rec });
    }
    const fr = rows.filter(function (r) { return r.outcome === 'vFlee'; })[0];
    if (fr) fleeRow = Object.assign({}, fr, fr.fleeClass || {});
  }
  check('live wave-4 expedition fights record w4dmgFights rich rows',
    foughtRows.length >= 1, 'rows=' + L2.w4dmgFights.length + ' fought=' + foughtRows.length);
  if (foughtRows.length) {
    const r0 = foughtRows[0].row;
    check('row carries the flee-classification fields (mHpLeft/vHpLeft/fleeHopeless/everWinning/everHopeless/minHpFrac)',
      typeof r0.mHpLeft === 'number' && typeof r0.vHpLeft === 'number' &&
      (r0.fleeHopeless === null || typeof r0.fleeHopeless === 'boolean') &&
      typeof r0.everWinning === 'boolean' && typeof r0.everHopeless === 'boolean' &&
      typeof r0.minHpFrac === 'number',
      JSON.stringify({ mHpLeft: r0.mHpLeft, vHpLeft: r0.vHpLeft, fleeHopeless: r0.fleeHopeless, everWinning: r0.everWinning, everHopeless: r0.everHopeless, minHpFrac: r0.minHpFrac }));
    check('row carries the P4-hypothetical fields (vTakenP4/vHpHypoLeft) + hold counters',
      typeof r0.vTakenP4 === 'number' && typeof r0.vHpHypoLeft === 'number' &&
      typeof r0.fleeguardHold === 'number' && typeof r0.doorHold === 'number',
      JSON.stringify({ vTakenP4: r0.vTakenP4, vHpHypoLeft: r0.vHpHypoLeft, fleeguardHold: r0.fleeguardHold, doorHold: r0.doorHold }));
    check('guards provably off on the diagnosis leg (fleeguardHold 0, doorHold 0)',
      r0.fleeguardHold === 0 && r0.doorHold === 0,
      JSON.stringify({ fleeguardHold: r0.fleeguardHold, doorHold: r0.doorHold }));
    const race0 = fieldAnalyzer.raceOf(r0);
    check('race arithmetic runs on the live row (rtk/rtd/winnable booleans)',
      (race0.rtk === null || typeof race0.rtk === 'number' || race0.rtk === Infinity) &&
      typeof race0.winnable === 'boolean',
      JSON.stringify(race0));
    const cls0 = fieldAnalyzer.classifyFlee(r0);
    check('analyzer classifies the live row (vKill/mFlee/F1-F8, never OTHER)',
      typeof cls0 === 'string' && cls0 !== 'OTHER' && cls0.indexOf('OTHER') !== 0,
      cls0 + ' outcome=' + r0.outcome + ' branch=' + r0.fleeBranch);
    check('live row: mHpLeft + mDealt reconciles with mHpStart on a fought non-kill',
      r0.outcome !== 'vKill' ? (r0.mHpStart === (r0.mHpLeft | 0) + (r0.mDealt | 0) && r0.mHpStart > 0) : true,
      JSON.stringify({ mHpStart: r0.mHpStart, mHpLeft: r0.mHpLeft, mDealt: r0.mDealt, outcome: r0.outcome }));
  }
  if (fleeRow) {
    check('live vFlee row carries a non-null branch tag',
      typeof fleeRow.fleeBranch === 'string' && fleeRow.fleeBranch.length > 0,
      'branch=' + fleeRow.fleeBranch + ' outcome=' + fleeRow.outcome);
    const clsF = fieldAnalyzer.classifyFlee(fleeRow);
    check('live vFlee row classifies to F1-F7 (branch + race agree)',
      /^F[1-7]$/.test(clsF), clsF + ' branch=' + fleeRow.fleeBranch);
  } else {
    console.log('  NOTE no vFlee row in 6 attempts — branch-tag-on-flee unproven live (unit §1 covers the tagger); fought rows still prove the fields.');
  }

  console.log('\n' + passed + ' passed, ' + failed + ' failed' + (fails.length ? ' — ' + fails.join('; ') : ''));
  if (failed) process.exitCode = 1;
}

main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
