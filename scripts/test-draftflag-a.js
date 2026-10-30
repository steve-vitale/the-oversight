#!/usr/bin/env node
// scripts/test-draftflag-a.js — sim-draftflag-a fixture + determinism +
// substrate-identity proof. DIAG ONLY: synthetic recorder checks +
// scratch re-runs; never game state, never the corpus (reads only).
// Usage:
//   node scripts/test-draftflag-a.js
//     (fixtures; prints FIXTURES-PASS / FIXTURES-FAIL, exit code)
//   node scripts/test-draftflag-a.js --substrate <seed>
//     (runs that seed into a scratch EVID dir via sweep-draftflag-a.js
//      --one, diffs the row MINUS additive fields (draftflag,
//      scholarmelt, removal) byte-for-byte against chainclose's row,
//      prints the verdict, removes scratch afterwards.)
//   node scripts/test-draftflag-a.js --determinism <seed>
//     (re-runs that seed into a scratch EVID dir, diffs the row JSON
//      AND the census JSON byte-for-byte against the corpus, prints
//      the verdict, removes scratch afterwards. Scratch lives under
//      evidence/ (never /tmp) and is removed in a finally block, pass
//      or fail — never process.exit() inside try.)
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { stripDraftflag, tollExpected, isTollDrop, targetVerdict, tbEndSecondary } = require('./analyze-draftflag-a');
const { layerOn, newStore, installDraftflagDiag } = require('./policies/draftflag-diag');

let checks = 0, fails = 0;
function check(name, cond) {
  checks++;
  if (!cond) { fails++; console.log(`FAIL: ${name}`); }
}
function eq(name, a, b) { check(`${name} (got ${JSON.stringify(a)} want ${JSON.stringify(b)})`, a === b); }

// --- toll math (maxHp rule, not current-hp rule) ---
{
  eq('tollExpected 1300', tollExpected(1300), 325);
  eq('tollExpected 1100', tollExpected(1100), 275);
  eq('tollExpected rounding', tollExpected(1001), 250);
  eq('isTollDrop exact wounded', isTollDrop({ hp: 1285, maxHp: 1300, tx: 6, ty: 4 }, { hp: 960, maxHp: 1300, tx: 4, ty: 4 }), true);
  eq('isTollDrop exact full', isTollDrop({ hp: 1100, maxHp: 1100, tx: 3, ty: 4 }, { hp: 825, maxHp: 1100, tx: 4, ty: 4 }), true);
  eq('isTollDrop wrong amount', isTollDrop({ hp: 1285, maxHp: 1300, tx: 6, ty: 4 }, { hp: 950, maxHp: 1300, tx: 4, ty: 4 }), false);
  eq('isTollDrop wrong tile', isTollDrop({ hp: 1285, maxHp: 1300, tx: 6, ty: 4 }, { hp: 960, maxHp: 1300, tx: 5, ty: 4 }), false);
  eq('isTollDrop no drop', isTollDrop({ hp: 960, maxHp: 1300, tx: 4, ty: 4 }, { hp: 960, maxHp: 1300, tx: 4, ty: 4 }), false);
  eq('isTollDrop heal not drop', isTollDrop({ hp: 900, maxHp: 1300, tx: 4, ty: 4 }, { hp: 960, maxHp: 1300, tx: 4, ty: 4 }), false);
}

// --- recorder: synthetic havenRaidTick diff ---
function fakeGame(monsters, opts) {
  opts = opts || {};
  const village = { px: 4, py: 4, lastRaidDay: 0 };
  const Game = {
    state: { scholar: { day: opts.day || 132 }, village },
    data: { monsters: [] },
    _wms: monsters,
    worldMonsters() { return this._wms.slice(); },
    havenTier() { return opts.tier || 2; },
    pantryKcalLive() { return 20000; },
    monsterAt(tx, ty) { return this._wms.find(m => m.tx === tx && m.ty === ty) || null; },
    havenRaidTick: opts.raidFn,
    tbfight: opts.tbfight || null,
    tbEnd: opts.tbEndFn || function () {},
  };
  return Game;
}
{
  // Palisade raid: nearest monster drafted + tolled + lingered (undefended).
  process.env.DRAFTFLAG = '1';
  const mA = { id: 'audit', hp: 1100, maxHp: 1100, tx: 3, ty: 4, lingering: false, raidBorn: false, titan: false };
  const mB = { id: 'deer', hp: 50, maxHp: 50, tx: 8, ty: 8, lingering: false, raidBorn: false, titan: false };
  const Game = fakeGame([mA, mB], { day: 132, raidFn() {
    mA.raidBorn = true; mA.tx = 4; mA.ty = 4;
    mA.hp = Math.max(1, mA.hp - Math.round(mA.maxHp * 0.25));
    mA.lingering = true;
    Game.state.village.lastRaidDay = 132;
    return true;
  } });
  const store = newStore();
  const uidMap = new Map(); let next = 1;
  const uidFn = (m) => { if (!uidMap.has(m)) uidMap.set(m, next++); return uidMap.get(m); };
  installDraftflagDiag(Game, store, uidFn);
  const ret = Game.havenRaidTick();
  eq('raid ret passthrough', ret, true);
  eq('raid events 1', store.events.length, 1);
  const ev = store.events[0];
  eq('raid event type', ev.type, 'raid');
  eq('raid event fired', ev.fired, true);
  eq('raid event day', ev.day, 132);
  eq('raid palisade true', ev.beforeCtx.palisade, true);
  eq('raid drafts 1', ev.drafts.length, 1);
  const d = ev.drafts[0];
  eq('draft id', d.id, 'audit');
  eq('draft hpBefore', d.hpBefore, 1100);
  eq('draft hpAfter', d.hpAfter, 825);
  eq('draft toll', d.toll, 275);
  eq('draft tollExpected', d.tollExpected, 275);
  eq('draft tollExact', d.tollExact, true);
  eq('draft tileAfter', d.txAfter + ',' + d.tyAfter, '4,4');
  eq('draft lingering flip', d.lingeringBefore + '->' + d.lingeringAfter, 'false->true');
  eq('draft raidBorn flip', d.raidBornBefore + '->' + d.raidBornAfter, 'false->true');
  eq('draft uid shared', d.uid, uidFn(mA));
  eq('raidFired counter', store.raidFired, 1);
  // Unfired call: counted, no event.
  const Game2 = fakeGame([mB], { day: 133, raidFn() { return false; } });
  const store2 = newStore();
  installDraftflagDiag(Game2, store2, uidFn);
  Game2.havenRaidTick();
  eq('unfired calls counted', store2.raidCalls, 1);
  eq('unfired no event', store2.events.length, 0);
  eq('unfired raidFired 0', store2.raidFired, 0);
  // No-palisade raid: tollExpected 0, no hp change, tile + raidBorn only.
  const mC = { id: 'suburb', hp: 1285, maxHp: 1300, tx: 6, ty: 4, lingering: false, raidBorn: false, titan: false };
  const Game3 = fakeGame([mC], { day: 158, tier: 1, raidFn() {
    mC.raidBorn = true; mC.tx = 4; mC.ty = 4; mC.lingering = true;
    return true;
  } });
  const store3 = newStore();
  installDraftflagDiag(Game3, store3, uidFn);
  Game3.havenRaidTick();
  const d3 = store3.events[0].drafts[0];
  eq('no-palisade tollExpected 0', d3.tollExpected, 0);
  eq('no-palisade tollExact', d3.tollExact, true);
  eq('no-palisade hp unchanged', d3.hpBefore + '->' + d3.hpAfter, '1285->1285');
  // Defended raider: toll + fight damage in one call -> tollExact false
  // (the analyzer must NOT call this a clean toll row).
  const mD = { id: 'audit', hp: 1100, maxHp: 1100, tx: 3, ty: 4, lingering: false, raidBorn: false, titan: false };
  const Game4 = fakeGame([mD], { day: 140, raidFn() {
    mD.raidBorn = true; mD.tx = 4; mD.ty = 4;
    mD.hp = Math.max(1, mD.hp - Math.round(mD.maxHp * 0.25));
    mD.hp -= 40; // defender fight damage in the same call
    return true;
  } });
  const store4 = newStore();
  installDraftflagDiag(Game4, store4, uidFn);
  Game4.havenRaidTick();
  const d4 = store4.events[0].drafts[0];
  eq('defended toll not exact', d4.tollExact, false);
  eq('defended toll total', d4.toll, 315);
  // Engine throw is recorded and rethrown unchanged.
  const Game5 = fakeGame([], { day: 150, raidFn() { throw new Error('boom-test'); } });
  const store5 = newStore();
  installDraftflagDiag(Game5, store5, uidFn);
  let threw = false;
  try { Game5.havenRaidTick(); } catch (e) { threw = (e.message === 'boom-test'); }
  check('raid throw rethrown', threw);
  eq('raid throw event', store5.events.length, 1);
  eq('raid throw flag', store5.events[0].threw, true);
  // DRAFTFLAG unset: no wraps installed.
  delete process.env.DRAFTFLAG;
  const Game6 = fakeGame([mB], { day: 160, raidFn() { return true; } });
  const store6 = newStore();
  const before6 = Game6.havenRaidTick;
  installDraftflagDiag(Game6, store6, uidFn);
  // layerOn is false, but install itself does not gate: the SWEEP gates
  // on layerOn. Document the contract instead: install with the flag
  // unset still wraps (sweep never calls it then). No assertion here
  // beyond the layerOn predicate itself.
  eq('layerOn false when unset', layerOn(), false);
  process.env.DRAFTFLAG = '1';
  eq('layerOn true when set', layerOn(), true);
  void before6;
}

// --- recorder: synthetic tbEnd guard capture ---
{
  const origin = { id: 'suburb', hp: 960, maxHp: 1300, tx: 4, ty: 4, lingering: true, raidBorn: true, titan: false };
  const blocker = { id: 'audit', hp: 825, maxHp: 1100, tx: 4, ty: 4, lingering: true, raidBorn: true, titan: false };
  // Occupied: fake tbEnd refuses to restore (guard).
  const Game = fakeGame([blocker], { day: 159, tbfight: { worldOrigin: origin, over: false },
    tbEndFn(result) { /* guard: monsterAt(4,4) = blocker -> no push */ } });
  const store = newStore();
  const uidMap = new Map(); let next = 101;
  const uidFn = (m) => { if (!uidMap.has(m)) uidMap.set(m, next++); return uidMap.get(m); };
  installDraftflagDiag(Game, store, uidFn);
  Game.tbEnd('lost');
  eq('tbend events 1', store.events.length, 1);
  const e = store.events[0];
  eq('tbend type', e.type, 'tbend');
  eq('tbend result', e.result, 'lost');
  eq('tbend occupantBefore id', e.occupantBefore && e.occupantBefore.id, 'audit');
  eq('tbend restored false', e.restored, false);
  eq('tbend origin hp', e.origin.hp, 960);
  // Unoccupied: fake tbEnd restores.
  const origin2 = { id: 'suburb', hp: 960, maxHp: 1300, tx: 4, ty: 4, lingering: true, raidBorn: true, titan: false };
  const Game2 = fakeGame([], { day: 159, tbfight: { worldOrigin: origin2, over: false },
    tbEndFn(result) { Game2._wms.push(origin2); } });
  const store2 = newStore();
  installDraftflagDiag(Game2, store2, uidFn);
  Game2.tbEnd('lost');
  const e2 = store2.events[0];
  eq('tbend unoccupied occupant null', e2.occupantBefore, null);
  eq('tbend unoccupied restored', e2.restored, true);
  // No worldOrigin: counted, no event.
  const Game3 = fakeGame([], { day: 159, tbfight: { over: false }, tbEndFn() {} });
  const store3 = newStore();
  installDraftflagDiag(Game3, store3, uidFn);
  Game3.tbEnd('won');
  eq('tbend no-origin total', store3.tbEndTotal, 1);
  eq('tbend no-origin withOrigin', store3.tbEndWithOrigin, 0);
  eq('tbend no-origin events', store3.events.length, 0);
}

// --- analyzer: target verdict on a synthetic corpus ---
{
  const seedData = {
    row: {
      removal: { events: [
        { type: 'spawn', seq: 49, day: 140, monster: { id: 'suburb', uid: 29, hp: 1300, maxHp: 1300 } },
        { type: 'removal', seq: 59, day: 159, monster: { id: 'suburb', uid: 29, hp: 960, maxHp: 1300, tx: 4, ty: 4, lingering: true } },
      ] },
      draftflag: { events: [
        { type: 'raid', seq: 7, day: 158, fired: true, beforeCtx: { palisade: true, haven: { hx: 4, hy: 4 } },
          drafts: [{ uid: 29, id: 'suburb', hpBefore: 1285, hpAfter: 960, maxHp: 1300, toll: 325, tollExpected: 325, tollExact: true,
            txBefore: 6, tyBefore: 4, txAfter: 4, tyAfter: 4, lingeringBefore: false, lingeringAfter: true, raidBornBefore: false, raidBornAfter: true }] },
      ] },
      scholarmelt: { meetings: [
        { fightSeq: 23, dayStart: 159, result: 'lost', lift: { id: 'suburb', hp: 960, lingering: true }, restoredIdentity: false, restoredHp: null },
      ] },
    },
    census: { seed: 75116, snapshots: [
      { day: 158, monsters: [{ uid: 29, id: 'suburb', tx: 6, ty: 4, hp: 1285, maxHp: 1300, wave: 4, lingering: false, titan: false }] },
      { day: 159, monsters: [] },
    ] },
  };
  const v = targetVerdict(seedData, { seed: 75116, id: 'suburb', removalUid: 29, spawnDay: 140, spawnHp: 1300, spawnMaxHp: 1300, preHp: 1285, postHp: 960 });
  eq('synthetic target verdict', v.verdict, 'DATED');
  eq('synthetic target uid', v.resolvedUid, 29);
  eq('synthetic target palisade', v.palisadeConfirmed, true);
  eq('synthetic target toll', v.tollConfirmed, true);
  eq('synthetic target draft day', v.judged[0].day, 158);
  const sec = tbEndSecondary(seedData, { uid: 29, id: 'suburb', liftHp: 960, dayLo: 158, dayHi: 160 });
  eq('synthetic secondary fight', sec.fights.length, 1);
  eq('synthetic secondary fightSeq', sec.fights[0].fightSeq, 23);
  // No draft event -> UNMEASURED, not a guessed date.
  const seedData2 = JSON.parse(JSON.stringify(seedData));
  seedData2.row.draftflag.events = [];
  const v2 = targetVerdict(seedData2, { seed: 75116, id: 'suburb', removalUid: 29, spawnDay: 140, spawnHp: 1300, spawnMaxHp: 1300, preHp: 1285, postHp: 960 });
  eq('no-draft UNMEASURED', v2.verdict, 'UNMEASURED');
  check('no-draft names hook', (v2.reason || '').indexOf('havenRaidTick') >= 0);
  // Palisade false with a toll-shaped drop -> NOT confirmed (refutation path).
  const seedData3 = JSON.parse(JSON.stringify(seedData));
  seedData3.row.draftflag.events[0].beforeCtx.palisade = false;
  seedData3.row.draftflag.events[0].drafts[0].tollExpected = 0;
  seedData3.row.draftflag.events[0].drafts[0].tollExact = false;
  const v3 = targetVerdict(seedData3, { seed: 75116, id: 'suburb', removalUid: 29, spawnDay: 140, spawnHp: 1300, spawnMaxHp: 1300, preHp: 1285, postHp: 960 });
  check('palisade-false not DATED', v3.verdict !== 'DATED');
}

// --- stripDraftflag: row minus all three additive fields ---
{
  const row = { a: 1, removal: { events: [] }, scholarmelt: { meetings: [] }, draftflag: { events: [] }, b: 2 };
  const stripped = stripDraftflag(row);
  eq('strip drops all three', JSON.stringify(Object.keys(stripped)), JSON.stringify(['a', 'b']));
}

function runSweepOne(seed, evidDir) {
  const env = Object.assign({}, process.env, { EVID: evidDir });
  execFileSync('node', [path.join(REPO, 'scripts', 'sweep-draftflag-a.js'), '--one', String(seed)], { env, stdio: 'pipe', timeout: 900000 });
}

function scratchMode(mode, seed) {
  const scratch = path.join(REPO, 'evidence', '2026-10-30', `perseed-draftflag-a-${mode}-${seed}`);
  let pass = false;
  try {
    fs.rmSync(scratch, { recursive: true, force: true });
    runSweepOne(seed, scratch);
    if (mode === 'substrate') {
      const chainclose = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-10-30', 'perseed-chainclose-a', `s${seed}-fresh.json`), 'utf8'));
      const mine = JSON.parse(fs.readFileSync(path.join(scratch, `s${seed}-fresh.json`), 'utf8'));
      const same = JSON.stringify(stripDraftflag(mine)) === JSON.stringify(chainclose);
      console.log(`SUBSTRATE seed=${seed} row-minus-additive=${same ? 'IDENTICAL' : 'DIFFERS'}`);
      if (!same) {
        const a = stripDraftflag(mine), b = chainclose;
        const keys = new Set(Object.keys(a).concat(Object.keys(b)));
        for (const k of keys) if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) console.log(`  DIFF-KEY ${k}`);
      }
      pass = same;
    } else {
      const corpusDir = path.join(REPO, 'evidence', '2026-10-30', 'perseed-draftflag-a');
      const rowSame = fs.readFileSync(path.join(scratch, `s${seed}-fresh.json`)).equals(fs.readFileSync(path.join(corpusDir, `s${seed}-fresh.json`)));
      const cenSame = fs.readFileSync(path.join(scratch, `census-s${seed}.json`)).equals(fs.readFileSync(path.join(corpusDir, `census-s${seed}.json`)));
      console.log(`DETERMINISM seed=${seed} row=${rowSame ? 'IDENTICAL' : 'DIFFERS'} census=${cenSame ? 'IDENTICAL' : 'DIFFERS'}`);
      pass = rowSame && cenSame;
    }
  } catch (e) {
    console.log(`${mode.toUpperCase()}-FAIL`, String((e && e.message) || e).slice(0, 300));
    pass = false;
  } finally {
    // Exit only AFTER the finally has run (removal lesson: exit inside
    // try skips finally and strands the scratch dir).
    try { fs.rmSync(scratch, { recursive: true, force: true }); } catch (e) {}
  }
  console.log(pass ? `${mode.toUpperCase()}-PASS` : `${mode.toUpperCase()}-FAIL`);
  process.exit(pass ? 0 : 1);
}

function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--substrate') { scratchMode('substrate', parseInt(args[1], 10) || 75102); return; }
  if (args[0] === '--determinism') { scratchMode('determinism', parseInt(args[1], 10) || 75102); return; }
  console.log(fails === 0 ? `FIXTURES-PASS ${checks}/${checks}` : `FIXTURES-FAIL ${checks - fails}/${checks} (${fails} failed)`);
  process.exit(fails === 0 ? 0 : 1);
}
if (require.main === module) main();
