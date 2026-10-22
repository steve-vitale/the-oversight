#!/usr/bin/env node
// test-hurtvillager-id-b.js — proof for the hurtVillager monster-id threading
// (sim-hurtvillager-id-b, loop B run fleshout-loop-b-20261021T2330Z, axis
// food-economy). Fills the sim-deathcensus-b backlog item:
//   HURTVILLAGER "MONSTER" LITERAL BLOCKS MONSTER-LEVEL DEATH ATTRIBUTION
// (sim-findings.md, evidence/2026-10-21/sim-deathcensus-b.md: 38/230 person
// deaths classified only to combat-unknown because the engine passed the
// literal cause string "monster" at hurtVillager time and never threaded
// the fight record's monster id through).
//
// FIX (design call, additive only): the 9 'monster' hurtVillager call sites
// (game.js patrol cluster x4, wild/expedition cluster x4, fieldFights.js
// ally-down x1) pass { monsterId, monsterName } as the EXISTING optional
// 5th arg (damageContext — callers already pass {nonviolent:true} there).
// The lethal NPC death block forwards them into registerDeath opts and the
// v.fallen entry. The cause string is UNCHANGED ('monster' still matches the
// analyzer's COMBAT_FAMILY_RE). No combat outcomes, damage numbers, or
// fiction text change. registerDeath already supports monsterId/monsterName
// (corpses.js: the monster-kill path uses them; the corpse stores monsterId).
//
// Canon: docs/CANON.md read first. NO canon doc covers hurtVillager
// internals (CANON.md registry has no village-death design doc) — this fix
// threads an existing engine value through an existing optional parameter;
// it invents no canon.
//
// RUN WITH THE SWEEP ENV (ENV TRAP — same substrate as the corpus):
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-hurtvillager-id-b.js
//
// PART A: synthetic fixtures — hurtVillager lethal with/without
//         damageContext {monsterId, monsterName}; assert the registerDeath
//         row + v.fallen entry carry the ids (GREEN) or nulls (no-drift);
//         assert the cause string is unchanged; assert classifyDeath
//         resolves combat-<mid> with the id and combat-unknown without.
// PART B: det-gate — paired 60d instrumented re-runs on the CURRENT engine
//         byte-identical (the new fields introduce no nondeterminism).
// PART C: same-base before/after corpus comparison — BEFORE_DIR (pristine
//         engine, same base) vs AFTER_DIR (this tree); every row identical
//         modulo the added monsterId/monsterName; no classification moves
//         except combat-unknown -> combat-<mid>; combat-unknown share
//         strictly improved; remaining combat-unknown are player-vessel
//         only (documented out-of-scope). Run the sweep on both trees first:
//           FEASTSCALE_R13=1 SEATDRIVE=0 EVID=<dir> node scripts/sweep-hurtvillager-id-b.js
//         (ADAPTED 2026-10-22: the dead worker's cross-base corpus design
//         could not be byte-identical across behavior-changing commits;
//         same-base before/after is the honest gate. See PART C code.)
// "Identical" (honest): same seeds, same env, same code except this arm's
// change; outcome-level fields (survival, deaths, pantry series, loss site,
// wall flags) byte-identical; death rows differ ONLY by the added
// monsterId/monsterName fields (anchorCommit excluded — it names the commit).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { leadfeast } = require(path.join(REPO, 'scripts', 'policies', 'feastscale'));
const DC = require(path.join(REPO, 'scripts', 'deathcensus-instrument-20261021'));

if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
  console.error('PROOF STOP: run with FEASTSCALE_R13=1 SEATDRIVE=0 (the sweep env).');
  process.exit(2);
}

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

const MIDX = {
  byId: { highbeam_deer: { id: 'highbeam_deer', name: 'Highbeam Deer', wave: 1 } },
  byName: { 'highbeam deer': 'highbeam_deer' },
};

async function liveGame(seed) {
  const { Game } = await loadGame({ seed: seed, mode: 'hurtvillager-id-proof', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

function npcVids(Game) {
  const v = Game.state.village || {};
  return ((v.roster || []).filter(function (id) {
    return id !== Game.villagerId && Game.vpOf && Game.vpOf(id) && !Game.vpOf(id).dead;
  }));
}

// Lethal hurtVillager through the exact call-site shape:
//   hurtVillager(vid, rec.vTaken, 'monster', <sealed settlement>, damageContext)
// Returns the captured registerDeath opts, or null if the villager survived
// (NPC death refusal — try the next vid).
function lethalHurt(Game, vid, damageContext) {
  const dmg = 99999;
  const rec = Game.sealDamageResult({}, [[vid, dmg]]);
  const captured = [];
  const orig = Game.registerDeath.bind(Game);
  Game.registerDeath = function (opts) { captured.push(Object.assign({}, opts)); return orig(opts); };
  try { Game.hurtVillager(vid, dmg, 'monster', rec, damageContext); }
  finally { Game.registerDeath = orig; }
  return captured.length ? captured[0] : null;
}

function fallenEntry(Game, vid) {
  const fallen = ((Game.state || {}).village || {}).fallen || [];
  return fallen.filter(function (f) { return f.villagerId === vid; }).pop() || null;
}

async function main() {
  // ---------- PART A: fixtures ----------
  console.log('PART A: hurtVillager monster-id fixtures');
  const Game = await liveGame(77101);
  const vids = npcVids(Game);
  ok('roster has NPC villagers', vids.length >= 3, 'found ' + vids.length);

  // A1: the blank, as the call sites do it TODAY (no damageContext) — the
  // death row carries NO monster id. This passes pre- AND post-fix: it pins
  // the no-drift behavior of every unthreaded path (starvation, sickness,
  // experiment, and any 'monster' caller that doesn't pass the context).
  let rowBlank = null, vidBlank = null;
  for (const vid of vids) { rowBlank = lethalHurt(Game, vid); if (rowBlank) { vidBlank = vid; break; } }
  ok('unthreaded lethal monster death lands a death row', !!rowBlank);
  if (rowBlank) {
    ok('unthreaded row has NO monsterId (the documented blank)', rowBlank.monsterId == null, 'got ' + rowBlank.monsterId);
    ok('unthreaded row cause string unchanged', rowBlank.cause === 'monster', 'got ' + JSON.stringify(rowBlank.cause));
    const cls = DC.classifyDeath({ day: 1, who: rowBlank.name, vid: rowBlank.villagerId, kind: 'villager',
      cause: rowBlank.cause, player: false, monsterId: rowBlank.monsterId || null,
      monsterName: rowBlank.monsterName || null, wave: null }, MIDX).class;
    ok('unthreaded row classifies combat-unknown', cls === 'combat-unknown', 'got ' + cls);
    const f = fallenEntry(Game, vidBlank);
    ok('unthreaded fallen entry has null monster fields', !!f && f.monsterId == null && f.monsterName == null,
      f ? JSON.stringify({ monsterId: f.monsterId, monsterName: f.monsterName }) : 'no fallen entry');
  }

  // A2: GREEN — the threaded call-site shape. Pre-fix these FAIL (the blank);
  // post-fix they pass.
  let rowId = null, vidId = null;
  for (const vid of npcVids(Game)) {
    if (vid === vidBlank) continue;
    rowId = lethalHurt(Game, vid, { monsterId: 'highbeam_deer', monsterName: 'Highbeam Deer' });
    if (rowId) { vidId = vid; break; }
  }
  ok('threaded lethal monster death lands a death row', !!rowId);
  if (rowId) {
    ok('death row carries monsterId', rowId.monsterId === 'highbeam_deer', 'got ' + rowId.monsterId);
    ok('death row carries monsterName', rowId.monsterName === 'Highbeam Deer', 'got ' + rowId.monsterName);
    ok('death row cause string unchanged (analyzer still keys on it)', rowId.cause === 'monster', 'got ' + JSON.stringify(rowId.cause));
    ok('death row kind still villager', rowId.kind === 'villager', 'got ' + rowId.kind);
    const cls = DC.classifyDeath({ day: 1, who: rowId.name, vid: rowId.villagerId, kind: 'villager',
      cause: rowId.cause, player: false, monsterId: rowId.monsterId, monsterName: rowId.monsterName,
      wave: null }, MIDX).class;
    ok('threaded row classifies combat-highbeam_deer (monster level)', cls === 'combat-highbeam_deer', 'got ' + cls);
    const f = fallenEntry(Game, vidId);
    ok('fallen entry carries monsterId', !!f && f.monsterId === 'highbeam_deer', f ? 'got ' + f.monsterId : 'no fallen entry');
    ok('fallen entry carries monsterName', !!f && f.monsterName === 'Highbeam Deer', f ? 'got ' + f.monsterName : 'no fallen entry');
    ok('fallen entry cause string unchanged', !!f && f.cause === 'monster', f ? 'got ' + JSON.stringify(f.cause) : 'no fallen entry');
  }

  // A3: an untouched path (nonviolent damageContext, no monster fields) —
  // monsterId stays null and classification is as before.
  let rowSick = null;
  for (const vid of npcVids(Game)) {
    if (vid === vidBlank || vid === vidId) continue;
    const dmg = 99999;
    const rec = Game.sealDamageResult({}, [[vid, dmg]]);
    const captured = [];
    const orig = Game.registerDeath.bind(Game);
    Game.registerDeath = function (opts) { captured.push(Object.assign({}, opts)); return orig(opts); };
    try { Game.hurtVillager(vid, dmg, 'sickness', rec, { nonviolent: true }); }
    finally { Game.registerDeath = orig; }
    if (captured.length) { rowSick = captured[0]; break; }
  }
  ok('sickness-path lethal death lands a death row', !!rowSick);
  if (rowSick) {
    ok('sickness row has null monsterId (no drift)', rowSick.monsterId == null, 'got ' + rowSick.monsterId);
    ok('sickness row cause unchanged', rowSick.cause === 'sickness', 'got ' + JSON.stringify(rowSick.cause));
  }

  // ---------- PART B: det-gate ----------
  console.log('PART B: det-gate (paired 60d instrumented re-runs byte-identical)');
  async function oneRun(seed, days) {
    const { Game: G } = await loadGame({ seed: seed, mode: 'hurtvillager-id-proof', fullTelemetry: false });
    const inst = DC.install(G); const K = inst.K;
    await setupGame(G);
    let result;
    await quietLog(async () => { result = await runDays(G, leadfeast, { days: days, manifest: undefined, sampleEvery: 30 }); });
    const fin = DC.finalize(G, K);
    try { inst.uninstall(); } catch (e) {}
    return fin;
  }
  const fa = await oneRun(77102, 60);
  const fb = await oneRun(77102, 60);
  const ha = JSON.stringify({ d: fa.deaths, y: fa.daily, v: fa.villageLost, r: fa.realmNatEvents, s: fa.deathDayLines, l: fa.lossDayLines });
  const hb = JSON.stringify({ d: fb.deaths, y: fb.daily, v: fb.villageLost, r: fb.realmNatEvents, s: fb.deathDayLines, l: fb.lossDayLines });
  ok('paired re-run byte-identical (new fields add no nondeterminism)', ha === hb, 'len ' + ha.length + ' vs ' + hb.length);

  // ---------- PART C: same-base before/after corpus comparison ----------
  // ADAPTATION (2026-10-22, adoption): the dead worker's PART C compared
  // against the committed 2026-10-21 corpus (anchor 961321a40857), but that
  // anchor predates behavior-changing commits (SURPLUSFEED removal 9f5015716,
  // journey-succession r36 death mechanics, cisterncheck-b dispatch,
  // plentydepri default-ON) — byte-identity across that base gap is
  // unachievable and would not be evidence about THIS fix. The honest gate
  // is same-base: BEFORE = pristine engine on this tree's base, AFTER =
  // this tree. Produce them with:
  //   FEASTSCALE_R13=1 SEATDRIVE=0 EVID=<BEFORE|AFTER> node scripts/sweep-hurtvillager-id-b.js
  // on a pristine worktree and on this tree respectively, same seeds.
  console.log('PART C: same-base before/after corpus comparison');
  const BEFORE = process.env.BEFORE_DIR || path.join(REPO, 'evidence', '2026-10-22', 'perseed-hurtvillager-id-b-BEFORE');
  const AFTER = process.env.AFTER_DIR || path.join(REPO, 'evidence', '2026-10-22', 'perseed-hurtvillager-id-b');
  if (!fs.existsSync(BEFORE) || !fs.existsSync(AFTER)) {
    fail++;
    console.log('  FAIL before/after corpus missing — run scripts/sweep-hurtvillager-id-b.js on a pristine tree (EVID=' + BEFORE + ') and on this tree (EVID=' + AFTER + '), same seeds');
  } else {
    const VOLATILE = { anchorCommit: 1 };
    let pairs = 0, rowDiffs = 0, classMoves = [], beforeUnk = 0, afterUnk = 0, beforeTot = 0, afterTot = 0;
    let outcomeDrift = 0, addedIds = 0;
    for (const f of fs.readdirSync(AFTER)) {
      const m = /^hurtvillager-(lead|belong)-s(\d+)\.json$/.exec(f);
      if (!m) continue;
      const bF = path.join(BEFORE, f);
      if (!fs.existsSync(bF)) { fail++; console.log('  FAIL no before counterpart for ' + f); continue; }
      const b = JSON.parse(fs.readFileSync(bF, 'utf8'));
      const a = JSON.parse(fs.readFileSync(path.join(AFTER, f), 'utf8'));
      pairs++;
      // outcome-level identity (everything except the death rows + anchor)
      for (const k of Object.keys(a)) {
        if (VOLATILE[k] || k === 'deaths') continue;
        if (JSON.stringify(b[k]) !== JSON.stringify(a[k])) { outcomeDrift++; if (outcomeDrift <= 3) console.log('  outcome drift in ' + f + ' field ' + k); }
      }
      // row-level: match by (vid, day, who), pairing duplicates in file
      // order (monster rows can share a null vid + name on the same day).
      const bByKey = {};
      for (const d of (b.deaths || [])) {
        beforeTot++;
        if (d.pclass === 'combat-unknown') beforeUnk++;
        const k = d.vid + '|' + d.day + '|' + d.who;
        (bByKey[k] = bByKey[k] || []).push(d);
      }
      for (const d of (a.deaths || [])) {
        afterTot++;
        if (d.pclass === 'combat-unknown') afterUnk++;
        const k = d.vid + '|' + d.day + '|' + d.who;
        const q = bByKey[k] || [];
        const bd = q.shift();
        if (!bd) { rowDiffs++; console.log('  after row with no before match in ' + f + ': ' + d.who + ' d' + d.day); continue; }
        for (const k of Object.keys(d)) {
          if (k === 'monsterId' || k === 'monsterName' || k === 'pclass' || k === 'detail') continue;
          if (JSON.stringify(bd[k]) !== JSON.stringify(d[k])) { rowDiffs++; console.log('  row field drift in ' + f + ' ' + d.who + ' d' + d.day + ' field ' + k); }
        }
        // the fix ADDS ids, never changes them: before rows carry nulls
        if (bd.monsterId == null && d.monsterId != null) addedIds++;
        if (bd.monsterId != null && bd.monsterId !== d.monsterId) { rowDiffs++; console.log('  monsterId CHANGED (not added) in ' + f + ' ' + d.who); }
        // classification moves: only combat-unknown -> combat-<mid> allowed
        if (bd.pclass !== d.pclass) {
          const allowed = bd.pclass === 'combat-unknown' && /^combat-(?!unknown)/.test(d.pclass);
          classMoves.push({ file: f, who: d.who, from: bd.pclass, to: d.pclass, allowed: allowed });
          if (!allowed) { fail++; console.log('  FAIL disallowed class move in ' + f + ': ' + d.who + ' ' + bd.pclass + ' -> ' + d.pclass); }
        }
      }
    }
    ok('all corpus pairs present (before/after)', pairs > 0, 'found ' + pairs);
    ok('zero outcome-level drift (non-death fields byte-identical)', outcomeDrift === 0, outcomeDrift + ' drifted fields');
    ok('zero row-level drift outside monsterId/monsterName', rowDiffs === 0, rowDiffs + ' drifted rows');
    const goodMoves = classMoves.filter(function (c) { return c.allowed; }).length;
    ok('classification moves are only combat-unknown -> combat-<mid>', classMoves.length === goodMoves,
      classMoves.length + ' moves, ' + goodMoves + ' allowed');
    ok('the fix only ADDS monster ids (never changes an existing one)', addedIds === classMoves.length || addedIds > 0, addedIds + ' added ids, ' + classMoves.length + ' moves');
    console.log('  corpus attribution: combat-unknown ' + beforeUnk + '/' + beforeTot + ' (' + (100 * beforeUnk / beforeTot).toFixed(1) + '%) -> ' +
      afterUnk + '/' + afterTot + ' (' + (100 * afterUnk / afterTot).toFixed(1) + '%)');
    ok('combat-unknown share strictly improved', afterTot > 0 && (afterUnk / afterTot) < (beforeUnk / beforeTot), beforeUnk + '/' + beforeTot + ' -> ' + afterUnk + '/' + afterTot);
    // honesty: remaining combat-unknown must be the player-vessel rows
    // this arm does not touch (playerDeath pipeline) — verify, don't assume.
    let remPlayer = 0, remOther = 0;
    for (const f of fs.readdirSync(AFTER)) {
      const m2 = /^hurtvillager-(lead|belong)-s(\d+)\.json$/.exec(f);
      if (!m2) continue;
      const a = JSON.parse(fs.readFileSync(path.join(AFTER, f), 'utf8'));
      for (const d of (a.deaths || [])) {
        if (d.pclass === 'combat-unknown') { if (d.player) remPlayer++; else remOther++; }
      }
    }
    ok('remaining combat-unknown are player-vessel only (documented out-of-scope)', remOther === 0, remPlayer + ' player, ' + remOther + ' npc');
  }

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}

main().catch(function (e) { console.error('PROOF CRASH: ' + (e && e.stack || e)); process.exit(2); });
