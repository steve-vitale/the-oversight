#!/usr/bin/env node
// test-raidname-fix-b.js — proof for sim-raidname-fix-b
// (prereg: evidence/2026-10-30/sim-raidname-fix-b-prereg.md,
// as amended BEFORE any after-leg judging).
//
// Fixture probes (harness, one fresh game per probe via
// scripts/sim-harness.js — never copied eval boilerplate):
//   P1 genuine raid pending (live Face-it path: pending live
//      at entry, startCombat() no-arg) -> line FIRES,
//      shadow consumed.
//   P2 staged-B1 shape (raidBorn tile entity + non-raid
//      pending, same species) -> line ABSENT (the fix).
//   P3 direct tile fight vs raidBorn entity, no pending
//      -> line FIRES (genuine (b) preserved).
//   P4 A1 orphan sequence: raid pending + shadow, then a
//      MISMATCH fight (bump, mid != pending id) clears the
//      shadow; a later non-raid pending of the same species
//      then resolves -> line ABSENT both times.
//   P5 contest-arena fight (state.arenaContest live) vs a
//      same-species raidBorn tile entity -> line ABSENT.
//   P6 exile with live pending+shadow -> shadow null.
//   P7 succession (playerDeath) with live pending+shadow
//      -> shadow null.
//   P8 genuine raid pending resolved by explicit arg
//      (startCombat(mid) with pending live + shadow match)
//      -> line FIRES (guards against over-gating (a)).
// Corpus judgement (--corpus AFTER-ON --base-corpus
// AFTER-OFF --before-corpus BEFORE-ON --before-off
// BEFORE-OFF --analysis AFTER-ANALYSIS):
//   after leg: stagedConfigs >= 8, misfires == 0,
//   unclassified == 0, detMismatches empty;
//   before leg re-check: stagedConfigs >= 8, rate >= 0.75;
//   neutrality: OFF fight sequences (kind/species/
//   raidLineFired) identical before vs after per seed,
//   total OFF raid lines identical.
// Exit 0 = all green. SKIPs are reported, never passes.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');
const { analyze } = require('./analyze-raidname-b1-b');

let pass = 0, fail = 0, skip = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  PASS ' + label); }
  else { fail++; console.log('  FAIL ' + label); }
}
const RAID_LINE = 'This one came with the raid on Haven';

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'raidname-proof', fullTelemetry: true });
  await setupGame(Game);
  await runDays(Game, oracleV2, { days: 10 });
  const v = Game.state.village || {};
  const hx = v.px ?? 4, hy = v.py ?? 4;
  try { Game.map.px = hx; Game.map.py = hy; } catch (e) {}
  try { if (!Game.playerAtHaven()) Game.travelTo(hx, hy); } catch (e) {}
  return { Game, hx, hy };
}
function clearTileMonsters(Game, hx, hy) {
  try {
    const wms = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
    for (const m of wms.filter((m) => m && m.tx === hx && m.ty === hy)) {
      try { Game.removeWorldMonster(m); } catch (e) {}
    }
  } catch (e) {}
}
function startCombatCapture(Game, mid) {
  const lines = [];
  const orig = Game.say;
  Game.say = function (...a) { try { lines.push(String(a[0] || '')); } catch (e) {} return orig.apply(this, a); };
  let err = null;
  try { if (mid === undefined) Game.startCombat(); else Game.startCombat(mid); } catch (e) { err = String(e && e.message); }
  Game.say = orig;
  return { lines, err };
}
function endFight(Game) {
  try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd && Game.tbEnd('fled'); } catch (e) {}
}
function lineFired(r) { return r.lines.some((l) => l.includes(RAID_LINE)); }

async function fixtures() {
  console.log('P1: genuine raid pending, live Face-it path');
  {
    const { Game, hx, hy } = await freshGame(515021);
    clearTileMonsters(Game, hx, hy);
    Game.pendingEncounter = true; Game.pendingMonsterId = 'bulldozer';
    Game.raidPendingMonsterId = 'bulldozer';
    const r = startCombatCapture(Game, undefined);
    ok(!r.err, 'P1 runs (err=' + r.err + ')');
    ok(lineFired(r), 'P1 raid line FIRES for the genuine raid pending');
    ok(Game.raidPendingMonsterId === null || Game.raidPendingMonsterId === undefined, 'P1 shadow consumed');
  }
  console.log('P2: staged-B1 shape (raidBorn tile + non-raid pending, same species)');
  {
    const { Game, hx, hy } = await freshGame(515022);
    clearTileMonsters(Game, hx, hy);
    const m = Game.spawnWorldMonster({ id: 'bulldozer' }, hx, hy, {});
    m.raidBorn = true;
    try { Game.syncMonsterAlias(); } catch (e) {}
    ok((Game.playerMonster() || {}).id === 'bulldozer', 'P2 precondition: tile monster is the staged bulldozer');
    Game.pendingEncounter = true; Game.pendingMonsterId = 'bulldozer';
    Game.raidPendingMonsterId = null;
    const r = startCombatCapture(Game, undefined);
    ok(!r.err, 'P2 runs (err=' + r.err + ')');
    ok(!lineFired(r), 'P2 raid line ABSENT for the non-raid pending (fix works)');
  }
  console.log('P3: direct tile fight vs raidBorn entity, no pending');
  {
    const { Game, hx, hy } = await freshGame(515023);
    clearTileMonsters(Game, hx, hy);
    const m = Game.spawnWorldMonster({ id: 'bulldozer' }, hx, hy, {});
    m.raidBorn = true;
    try { Game.syncMonsterAlias(); } catch (e) {}
    const r = startCombatCapture(Game, 'bulldozer');
    ok(!r.err, 'P3 runs (err=' + r.err + ')');
    ok(lineFired(r), 'P3 raid line FIRES for the direct tile fight (genuine (b) preserved)');
  }
  console.log('P4: A1 orphan sequence (mismatch fight, then same-species non-raid pending)');
  {
    const { Game, hx, hy } = await freshGame(515024);
    clearTileMonsters(Game, hx, hy);
    Game.pendingEncounter = true; Game.pendingMonsterId = 'bulldozer';
    Game.raidPendingMonsterId = 'bulldozer';
    const r1 = startCombatCapture(Game, 'hummice');
    ok(!r1.err, 'P4 mismatch fight runs (err=' + r1.err + ')');
    ok(!lineFired(r1), 'P4 mismatch fight carries no raid line');
    ok(Game.raidPendingMonsterId === null || Game.raidPendingMonsterId === undefined, 'P4 shadow cleared by the mismatch fight (consume-or-clear)');
    endFight(Game);
    Game.pendingEncounter = true; Game.pendingMonsterId = 'bulldozer';
    const r2 = startCombatCapture(Game, undefined);
    ok(!r2.err, 'P4 later non-raid pending resolves (err=' + r2.err + ')');
    ok(!lineFired(r2), 'P4 later same-species non-raid fight carries NO raid line (orphan closed)');
  }
  console.log('P5: contest-arena fight vs same-species raidBorn tile entity');
  {
    const { Game, hx, hy } = await freshGame(515025);
    clearTileMonsters(Game, hx, hy);
    const m = Game.spawnWorldMonster({ id: 'bulldozer' }, hx, hy, {});
    m.raidBorn = true;
    try { Game.syncMonsterAlias(); } catch (e) {}
    Game.state.arenaContest = { contestId: 'proof', waves: ['bulldozer'], waveIdx: 0 };
    const r = startCombatCapture(Game, 'bulldozer');
    ok(!r.err, 'P5 runs (err=' + r.err + ')');
    ok(!lineFired(r), 'P5 raid line ABSENT for the contest-arena beast');
    try { Game.state.arenaContest = null; } catch (e) {}
  }
  console.log('P6: exile with live pending+shadow');
  {
    const { Game } = await freshGame(515026);
    Game.pendingEncounter = true; Game.pendingMonsterId = 'bulldozer';
    Game.raidPendingMonsterId = 'bulldozer';
    let err = null;
    try { Game.exilePlayer('moot'); } catch (e) { err = String(e && e.message); }
    ok(!err, 'P6 exile runs (err=' + err + ')');
    ok(Game.raidPendingMonsterId === null || Game.raidPendingMonsterId === undefined, 'P6 shadow cleared by exile');
    ok(!Game.pendingEncounter, 'P6 pending cleared by exile (pre-existing)');
  }
  console.log('P7: succession (playerDeath) with live pending+shadow');
  {
    const { Game } = await freshGame(515027);
    Game.pendingEncounter = true; Game.pendingMonsterId = 'bulldozer';
    Game.raidPendingMonsterId = 'bulldozer';
    let err = null;
    try { Game.playerDeath('the wild'); } catch (e) { err = String(e && e.message); }
    ok(!err, 'P7 succession runs (err=' + err + ')');
    ok(Game.raidPendingMonsterId === null || Game.raidPendingMonsterId === undefined, 'P7 shadow cleared by succession');
    ok(!Game.pendingEncounter, 'P7 pending cleared by succession (pre-existing)');
  }
  console.log('P8: genuine raid pending, explicit-arg resolution');
  {
    const { Game, hx, hy } = await freshGame(515028);
    clearTileMonsters(Game, hx, hy);
    Game.pendingEncounter = true; Game.pendingMonsterId = 'bulldozer';
    Game.raidPendingMonsterId = 'bulldozer';
    const r = startCombatCapture(Game, 'bulldozer');
    ok(!r.err, 'P8 runs (err=' + r.err + ')');
    ok(lineFired(r), 'P8 raid line FIRES for the explicit-arg genuine resolution (no over-gating)');
    ok(Game.raidPendingMonsterId === null || Game.raidPendingMonsterId === undefined, 'P8 shadow consumed');
  }
}

function fightSig(f) {
  return [f.kind || null, f.fightSpecies || null, !!f.raidLineFired].join('|');
}
function loadCorpus(dir) {
  const out = {};
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir).sort()) {
    if (!name.endsWith('.json')) continue;
    const inst = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
    out[inst.seed] = inst;
  }
  return out;
}

async function main() {
  const args = process.argv.slice(2);
  const get = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null; };
  const corpus = get('--corpus'), baseCorpus = get('--base-corpus');
  const beforeCorpus = get('--before-corpus'), beforeOff = get('--before-off');
  const analysisFile = get('--analysis');
  await fixtures();
  if (corpus && baseCorpus) {
    console.log('CORPUS: after-leg judgement');
    const res = analyze(corpus, baseCorpus);
    if (analysisFile) {
      const disk = JSON.parse(fs.readFileSync(analysisFile, 'utf8'));
      ok(disk.stagedConfigs === res.stagedConfigs && disk.misfires === res.misfires, 'CORPUS analyzer file matches recomputation');
    }
    ok(res.stagedConfigs >= 8, 'CORPUS after stagedConfigs >= 8 (got ' + res.stagedConfigs + ')');
    ok(res.misfires === 0, 'CORPUS after misfires == 0 (got ' + res.misfires + ')');
    ok(res.unclassified === 0, 'CORPUS after unclassified == 0 (got ' + res.unclassified + ')');
    ok(!res.detMismatches.length, 'CORPUS after determinism clean (mismatches: ' + res.detMismatches.join(',') + ')');
    if (beforeCorpus && beforeOff) {
      console.log('CORPUS: before-leg re-check + OFF neutrality');
      const bres = analyze(beforeCorpus, beforeOff);
      ok(bres.stagedConfigs >= 8, 'CORPUS before stagedConfigs >= 8 (got ' + bres.stagedConfigs + ')');
      ok(bres.misfireRate >= 0.75, 'CORPUS before misfire rate >= 0.75 (got ' + bres.misfireRate + ')');
      const afterOff = loadCorpus(baseCorpus), befOff = loadCorpus(beforeOff);
      let sigDiffs = 0, lineTotalAfter = 0, lineTotalBefore = 0;
      for (const seed of Object.keys(befOff).map(Number).sort((a, b) => a - b)) {
        const a = (afterOff[seed] || {}).fights || [], b = (befOff[seed] || {}).fights || [];
        const as = a.map(fightSig), bs = b.map(fightSig);
        if (as.length !== bs.length || as.some((s, i) => s !== bs[i])) sigDiffs++;
        lineTotalAfter += a.filter((f) => f.raidLineFired).length;
        lineTotalBefore += b.filter((f) => f.raidLineFired).length;
      }
      ok(sigDiffs === 0, 'NEUTRALITY OFF fight sequences identical before vs after (diff seeds: ' + sigDiffs + ')');
      ok(lineTotalAfter === lineTotalBefore, 'NEUTRALITY OFF raid-line totals identical (' + lineTotalBefore + ' -> ' + lineTotalAfter + ')');
    }
  } else {
    skip++;
    console.log('  SKIP corpus judgement (no --corpus/--base-corpus given)');
  }
  console.log('RESULT pass=' + pass + ' fail=' + fail + ' skip=' + skip);
  if (fail) process.exit(1);
}
main().catch((e) => { console.error('PROOF CRASH', e && (e.stack || e)); process.exit(2); });
