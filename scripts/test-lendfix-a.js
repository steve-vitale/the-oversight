#!/usr/bin/env node
// scripts/test-lendfix-a.js — proof test, arm sim-lendfix-a
// (finding #2629: the borrower-death sink — the lent gun was lost
// when the borrower died; finding #2628: the lend-opportunity pool
// counter). The return fix, env-gated LEND=1; unset = the old fight:
// (a) PRIMARY — the dead-borrower return through a REAL
//     resolveWildMonsterEncounter (not a stubbed fight, not a faked
//     `dead` flag), 3/3 cases: (i) borrower dies round 1, (ii)
//     borrower dies mid-fight (round >= 2), (iii) borrower survives.
//     In every case the gun is back in the living lender's items by
//     entry-object identity, re-seated, with the unspent lent cells,
//     and NOT duplicated (not in the borrower's items, no corpse
//     holds it). The probe behind the fix (evidence §5): the field
//     engine never strips the gun — it survives in the dead
//     borrower's person record, and the old return never looked
//     there (roster-scoped reads go blind the moment the borrower
//     leaves the roster);
// (b) the pool counter — lendPoolMoment evaluates the lend's own
//     conditions WITHOUT lending and WITHOUT the LEND env gate, so
//     the pool can be measured with the lend OFF: lendable gun /
//     lendable cells / lead loaded / no holder / holder is the lead
//     / holder dead / wave-1 / raid / hurt holder — all pure reads,
//     zero draws;
// (c) the analyzer --selftest covers the pool + guardrail judge
//     shapes (GO, NO-GO per bar incl. the 0-moment pool and the
//     SUBSTRATE guardrail kind).
//
// Encounter-gear fixture throughout: a geared villager fighter
// with a party, never a fresh un-geared solo scholar.
//
// Usage: node scripts/test-lendfix-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo; prints PASS/FAIL lines to stdout.
// Harness: shared sim-harness (seeded Math.random BEFORE eval, full
// src/js list in index.html order minus DOM-only files).
'use strict';
const path = require('path');
const { execFileSync } = require('child_process');
const { loadGame, setupGame, quietLog } = require('./sim-harness');
const { ammoCountOf, rangedKitOf, lendPoolMoment } = require('./lendfix-driver-a');
const REPO = path.join(__dirname, '..');

let passed = 0, failed = 0;
const fails = [];
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; fails.push(name); console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function personOf(Game, vid) {
  try { if (Game.getPerson) { const p = Game.getPerson(vid); if (p) return p; } } catch (e) {}
  return ((Game.data.villagers || []).find(x => x.id === vid) ||
    (Game.data.background_survivors || []).find(x => x.id === vid) || {});
}
function resetVillager(Game, p) {
  p.items = []; p.equipped = {}; p.stashed = [];
  try { Game.state.village.ammoCraft = Game.state.village.ammoCraft || {}; delete Game.state.village.ammoCraft[p.id]; } catch (e) {}
  try { Game.state.village.arrowCraftCd = Game.state.village.arrowCraftCd || {}; delete Game.state.village.arrowCraftCd[p.id]; } catch (e) {}
}
function withDraws(draws, fn) {
  const saved = Math.random;
  let di = 0;
  Math.random = function () { const v = draws[di % draws.length]; di++; return v; };
  try { return { out: fn(), used: di }; }
  finally { Math.random = saved; }
}
function setFlag(name, on) { if (on) process.env[name] = '1'; else delete process.env[name]; }
function setLend(on) { setFlag('LEND', on); }
function firstNameOf(p) { return p && p.name ? String(p.name).split(' ')[0] : 'Someone'; }
function corpseHoldsGun(Game, gunEntry) {
  try {
    for (const c of (Game.corpses ? Game.corpses() : [])) {
      if ((c.items || []).indexOf(gunEntry) !== -1) return true;
    }
  } catch (e) {}
  return false;
}

// One fresh game, staged for a real encounter: the borrower (bow,
// 5 arrows) on the monster tile, the lender (searcaster + 2 cells)
// in earshot, two more roster villagers on the tile as party.
// Returns the bundle the assertions read from.
async function freshEncounter(seed, borrowerHp, lenderNode) {
  const { Game } = await loadGame({ seed: seed, mode: 'lendfix-unit' });
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const borrower = roster[0], lender = roster[1], plainB = roster[2], lender2 = roster[3];
  const pBorrower = personOf(Game, borrower), pLender = personOf(Game, lender),
    pB = personOf(Game, plainB), pL2 = personOf(Game, lender2);
  setLend(true); setFlag('CELLGATE', true); setFlag('GUNRATE', true);
  const MTX = 5, MTY = 5;
  function armHolder(p, vid, cells) {
    resetVillager(Game, p);
    p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 }];
    if (cells > 0) p.items.push({ itemId: 'fusion_cell', name: 'Fusion cell', units: cells, kg: 0.4 });
    Game.villagerGearUp(vid, true);
  }
  function armBorrowerBow(p, vid) {
    resetVillager(Game, p);
    p.items = [{ itemId: 'crude_bow', name: 'Crude bow', units: 1, kg: 1.0 },
      { itemId: 'arrow', name: 'Arrow', units: 5, kg: 0.1 }];
    Game.villagerGearUp(vid, true);
  }
  armBorrowerBow(pBorrower, borrower);
  armHolder(pLender, lender, 2);
  resetVillager(Game, pB); resetVillager(Game, pL2);
  Game.npcSetNode(borrower, MTX, MTY);
  Game.npcSetNode(lender, lenderNode[0], lenderNode[1]);
  Game.npcSetNode(plainB, MTX, MTY);
  Game.npcSetNode(lender2, MTX, MTY);
  Game.state.village.health = Game.state.village.health || {};
  Game.state.village.health[borrower] = borrowerHp;
  Game.state.village.health[lender] = 100;
  const gunEntry = pLender.items.find(function (e) { return (e.itemId || e.id) === 'searcaster'; });
  return { Game: Game, roster: roster, borrower: borrower, lender: lender,
    pBorrower: pBorrower, pLender: pLender, gunEntry: gunEntry, MTX: MTX, MTY: MTY };
}

// The shared "gun home" assertions: the same entry object is back in
// the living lender's items and re-seated, the unspent lent cells came
// back, and the gun is NOT duplicated anywhere.
function checkGunHome(b, rec, label) {
  const Game = b.Game;
  check(label + ': gun back in the living lender\'s items BY ENTRY IDENTITY',
    b.pLender.items.indexOf(b.gunEntry) !== -1,
    'lender items=' + JSON.stringify(b.pLender.items.map(function (e) { return e.itemId || e.id; })));
  check(label + ': lender re-seated with the searcaster',
    rangedKitOf(Game, b.pLender).rwId === 'searcaster',
    JSON.stringify(rangedKitOf(Game, b.pLender)));
  const ammoLeft = rec && rec.volley && rec.volley.ammoLeft != null ? (rec.volley.ammoLeft | 0) : null;
  const lenderCells = ammoCountOf(b.pLender.items, 'fusion_cell');
  const borrowerCells = ammoCountOf(b.pBorrower.items, 'fusion_cell');
  check(label + ': unspent lent cells back with the lender, none left on the borrower',
    borrowerCells === 0 && (ammoLeft === null ? lenderCells <= 2 : lenderCells === ammoLeft),
    'lenderCells=' + lenderCells + ' borrowerCells=' + borrowerCells + ' ammoLeft=' + ammoLeft +
    ' volley=' + JSON.stringify(rec && rec.volley));
  check(label + ': gun NOT duplicated (not in borrower items, no corpse holds it)',
    b.pBorrower.items.indexOf(b.gunEntry) === -1 && !corpseHoldsGun(Game, b.gunEntry),
    'borrower items=' + JSON.stringify(b.pBorrower.items.map(function (e) { return e.itemId || e.id; })) +
    ' corpses=' + ((Game.corpses ? Game.corpses().length : 0)));
  check(label + ': lender alive after the fight',
    !b.pLender.dead && ((Game.state.village.health || {})[b.lender] || 0) > 0,
    'lender dead=' + b.pLender.dead + ' hp=' + ((Game.state.village.health || {})[b.lender]));
}

async function main() {
  // ---- 1. live data agreement ----
  const { Game: g0 } = await loadGame({ seed: 7, mode: 'lendfix-unit' });
  await quietLog(async () => { await setupGame(g0); });
  const algorithm = (g0.data.monsters || []).find(function (m) { return m.id === 'algorithm'; });
  const eulogy = (g0.data.monsters || []).find(function (m) { return m.id === 'eulogy'; });
  const moth = (g0.data.monsters || []).find(function (m) { return m.id === 'mirrormoth'; });
  check('algorithm fixture is wave 4', algorithm && (algorithm.wave || 1) === 4, JSON.stringify(algorithm && algorithm.wave));
  check('eulogy fixture is wave 4', eulogy && (eulogy.wave || 1) === 4, JSON.stringify(eulogy && eulogy.wave));
  check('mirrormoth fixture is wave 1', moth && (moth.wave || 1) === 1, JSON.stringify(moth && moth.wave));
  check('lend helper exists on Game', typeof g0._lendSearcaster === 'function');
  check('return helper exists on Game', typeof g0._returnLentSearcaster === 'function');
  check('pool helper exported by the lendfix driver', typeof lendPoolMoment === 'function');

  // ---- 2. PRIMARY: dead-borrower return through a REAL encounter ----
  // (i) borrower dies round 1: seed 7, HP 10, wave-4 algorithm.
  let b = await freshEncounter(7, 10, [6, 5]);
  let rec = b.Game.resolveWildMonsterEncounter(b.borrower, { id: 'algorithm', tx: b.MTX, ty: b.MTY }, {});
  check('(i) round-1 death: outcome vDie, rounds 1',
    rec && rec.outcome === 'vDie' && rec.rounds === 1,
    JSON.stringify(rec && { outcome: rec.outcome, rounds: rec.rounds }));
  check('(i) round-1 death: the borrower is dead after settlement',
    b.pBorrower.dead === true && ((b.Game.state.village.health || {})[b.borrower] || 0) <= 0,
    'dead=' + b.pBorrower.dead + ' hp=' + ((b.Game.state.village.health || {})[b.borrower]));
  check('(i) round-1 death: the lend line opens the fight record',
    rec && rec.log && /presses the Searcaster into/.test(String(rec.log[0])),
    JSON.stringify(rec && rec.log && rec.log[0]));
  check('(i) round-1 death: the return line is the handover — the return runs in the try/finally BEFORE the death settlement, so the borrower is still alive at return time (the fall is recorded by the settlement right after; the "falls — takes back" wording only fires when the borrower is already dead at return time, proven by test-lend-a (l))',
    rec && rec.log && /hands the Searcaster back to/.test(String(rec.log[rec.log.length - 1])),
    JSON.stringify(rec && rec.log && rec.log[rec.log.length - 1]));
  checkGunHome(b, rec, '(i) round-1 death');

  // (ii) borrower dies mid-fight (round >= 2): sweep HP x seeds in
  // fresh games until a vDie with rounds >= 2 lands, then assert on
  // that producing game. Wave-4 monsters one-shot a low-HP lead in
  // round 1 (HP <= 40 dies, HP 50-60 flees), so the sweep runs HP
  // 70-100: the lead survives round 1, stands their ground, and
  // dies in round 2 (algorithm seed 7 HP 90 in the probe). The
  // producing (seed, HP) is printed — it is part of the proof, not
  // a tunable.
  let mid = null;
  const sweep = [];
  for (const seed of [7, 8, 9]) {
    for (const hp of [70, 80, 90, 100]) {
      const bb = await freshEncounter(seed, hp, [6, 5]);
      const rr = bb.Game.resolveWildMonsterEncounter(bb.borrower, { id: 'algorithm', tx: bb.MTX, ty: bb.MTY }, {});
      sweep.push(seed + '/hp' + hp + ':' + (rr && rr.outcome) + '/r' + (rr && rr.rounds));
      if (rr && rr.outcome === 'vDie' && (rr.rounds | 0) >= 2) { mid = { b: bb, rec: rr, seed: seed, hp: hp }; break; }
    }
    if (mid) break;
  }
  console.log('  mid-fight sweep: ' + sweep.join(' '));
  check('(ii) mid-fight death: a vDie with rounds >= 2 was found in the sweep',
    mid !== null, mid ? ('seed ' + mid.seed + ' hp ' + mid.hp + ' rounds ' + mid.rec.rounds) : 'none in [7,8,9] x [70,80,90,100]');
  if (mid) {
    console.log('  mid-fight death produced by seed ' + mid.seed + ', borrower HP ' + mid.hp + ', rounds ' + mid.rec.rounds);
    check('(ii) mid-fight death: the borrower is dead after settlement',
      mid.b.pBorrower.dead === true,
      'dead=' + mid.b.pBorrower.dead);
    check('(ii) mid-fight death: the return line is the handover (same finally-before-settlement ordering as (i))',
      mid.rec && mid.rec.log && /hands the Searcaster back to/.test(String(mid.rec.log[mid.rec.log.length - 1])),
      JSON.stringify(mid.rec && mid.rec.log && mid.rec.log[mid.rec.log.length - 1]));
    checkGunHome(mid.b, mid.rec, '(ii) mid-fight death');
  } else {
    for (let i = 0; i < 5; i++) check('(ii) mid-fight death assertion ' + (i + 1) + '/5 (no producing game)', false, 'sweep found no vDie rounds>=2');
  }

  // (iii) borrower survives: seed 7, HP 100, wave-4 eulogy.
  b = await freshEncounter(7, 100, [5, 5]);
  rec = b.Game.resolveWildMonsterEncounter(b.borrower, { id: 'eulogy', tx: b.MTX, ty: b.MTY }, {});
  check('(iii) survivor: outcome is not vDie and the borrower lives',
    rec && rec.outcome !== 'vDie' && !b.pBorrower.dead && ((b.Game.state.village.health || {})[b.borrower] || 0) > 0,
    JSON.stringify(rec && { outcome: rec.outcome, rounds: rec.rounds }) + ' dead=' + b.pBorrower.dead);
  check('(iii) survivor: the borrower re-equips their own bow',
    rangedKitOf(b.Game, b.pBorrower).rwId === 'crude_bow',
    JSON.stringify(rangedKitOf(b.Game, b.pBorrower)));
  check('(iii) survivor: the return line is the handover',
    rec && rec.log && /hands the Searcaster back to/.test(String(rec.log[rec.log.length - 1])),
    JSON.stringify(rec && rec.log && rec.log[rec.log.length - 1]));
  checkGunHome(b, rec, '(iii) survivor');
  setLend(false); setFlag('CELLGATE', false); setFlag('GUNRATE', false);

  // ---- 3. the pool counter (LEND unset — the counter measures, it never lends) ----
  const { Game } = await loadGame({ seed: 7, mode: 'lendfix-unit' });
  await quietLog(async () => { await setupGame(Game); });
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const borrower = roster[0], lender = roster[1], plainB = roster[2], lender2 = roster[3];
  const pBorrower = personOf(Game, borrower), pLender = personOf(Game, lender),
    pB = personOf(Game, plainB), pL2 = personOf(Game, lender2);
  const MTX = 5, MTY = 5;
  const m4 = { id: 'eulogy', tx: MTX, ty: MTY };
  const m1 = { id: 'mirrormoth', tx: MTX, ty: MTY };
  function armHolder(p, vid, cells) {
    resetVillager(Game, p);
    p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 }];
    if (cells > 0) p.items.push({ itemId: 'fusion_cell', name: 'Fusion cell', units: cells, kg: 0.4 });
    Game.villagerGearUp(vid, true);
  }
  function armBorrowerBow(p, vid) {
    resetVillager(Game, p);
    p.items = [{ itemId: 'crude_bow', name: 'Crude bow', units: 1, kg: 1.0 },
      { itemId: 'arrow', name: 'Arrow', units: 5, kg: 0.1 }];
    Game.villagerGearUp(vid, true);
  }
  function armBorrowerEmptyGun(p, vid) {
    resetVillager(Game, p);
    p.items = [{ itemId: 'searcaster', name: 'Searcaster', units: 1, kg: 1.0 }];
    Game.villagerGearUp(vid, true);
  }
  function setHp(vid, hp) {
    Game.state.village.health = Game.state.village.health || {};
    if (hp === null) delete Game.state.village.health[vid];
    else Game.state.village.health[vid] = hp;
  }
  function placeAll() {
    Game.npcSetNode(borrower, MTX, MTY);
    Game.npcSetNode(lender, MTX, MTY);
    Game.npcSetNode(plainB, MTX, MTY);
    Game.npcSetNode(lender2, MTX, MTY);
  }
  setLend(false);
  // (a) lendable gun moment: lead with a bow, holder adjacent armed.
  armBorrowerBow(pBorrower, borrower);
  armHolder(pLender, lender, 2);
  resetVillager(Game, pB); resetVillager(Game, pL2);
  Game.npcSetNode(borrower, MTX, MTY);
  Game.npcSetNode(lender, MTX + 1, MTY);
  let r = withDraws([0.5], function () { return lendPoolMoment(Game, borrower, m4, {}); });
  check('pool (a): lendable gun moment, adjacent, 0 draws',
    r.out && r.out.lendable === true && r.out.kind === 'gun' && r.out.from === 'adjacent' && r.out.lender === lender && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);
  check('pool (a2): the moment is a pure read — nothing moved',
    rangedKitOf(Game, pLender).rwId === 'searcaster' && rangedKitOf(Game, pBorrower).rwId === 'crude_bow' &&
    ammoCountOf(pLender.items, 'fusion_cell') === 2 && ammoCountOf(pBorrower.items, 'fusion_cell') === 0,
    'lender=' + JSON.stringify(rangedKitOf(Game, pLender)) + ' borrower=' + JSON.stringify(rangedKitOf(Game, pBorrower)));
  // (b) lendable cells moment: lead carries an EMPTY searcaster, holder on-tile.
  armBorrowerEmptyGun(pBorrower, borrower);
  armHolder(pLender, lender, 2);
  placeAll();
  r = withDraws([0.5], function () { return lendPoolMoment(Game, borrower, m4, {}); });
  check('pool (b): lendable cells moment, on-tile, 0 draws',
    r.out && r.out.lendable === true && r.out.kind === 'cells' && r.out.from === 'tile' && r.out.lender === lender && r.used === 0,
    JSON.stringify(r.out) + ' draws=' + r.used);
  // (c) lead already carries a LOADED searcaster: null.
  armHolder(pBorrower, borrower, 2);
  armHolder(pLender, lender, 2);
  r = withDraws([0.5], function () { return lendPoolMoment(Game, borrower, m4, {}); });
  check('pool (c): loaded lead -> null', r.out === null && r.used === 0,
    'moment=' + JSON.stringify(r.out) + ' draws=' + r.used);
  // (d) no armed holder anywhere near: null.
  armBorrowerBow(pBorrower, borrower);
  resetVillager(Game, pLender);
  r = withDraws([0.5], function () { return lendPoolMoment(Game, borrower, m4, {}); });
  check('pool (d): no holder -> null', r.out === null && r.used === 0,
    'moment=' + JSON.stringify(r.out) + ' draws=' + r.used);
  // (e) the only armed holder IS the lead: null.
  armHolder(pBorrower, borrower, 2);
  resetVillager(Game, pLender);
  r = withDraws([0.5], function () { return lendPoolMoment(Game, borrower, m4, {}); });
  check('pool (e): holder is the lead -> null', r.out === null && r.used === 0,
    'moment=' + JSON.stringify(r.out) + ' draws=' + r.used);
  // (f) the holder is dead: null.
  armBorrowerBow(pBorrower, borrower);
  armHolder(pLender, lender, 2);
  placeAll();
  pLender.dead = true;
  r = withDraws([0.5], function () { return lendPoolMoment(Game, borrower, m4, {}); });
  check('pool (f): dead holder -> null', r.out === null && r.used === 0,
    'moment=' + JSON.stringify(r.out) + ' draws=' + r.used);
  pLender.dead = false;
  // (g) below wave 4: null.
  r = withDraws([0.5], function () { return lendPoolMoment(Game, borrower, m1, {}); });
  check('pool (g): wave-1 beast -> null', r.out === null && r.used === 0,
    'moment=' + JSON.stringify(r.out) + ' draws=' + r.used);
  // (h) raids never count: null.
  r = withDraws([0.5], function () { return lendPoolMoment(Game, borrower, m4, { raid: true }); });
  check('pool (h): raid -> null', r.out === null && r.used === 0,
    'moment=' + JSON.stringify(r.out) + ' draws=' + r.used);
  // (i) a badly hurt holder (HP <= 20) does not count: null.
  setHp(lender, 15);
  r = withDraws([0.5], function () { return lendPoolMoment(Game, borrower, m4, {}); });
  check('pool (i): HP-15 holder -> null', r.out === null && r.used === 0,
    'moment=' + JSON.stringify(r.out) + ' draws=' + r.used);
  setHp(lender, null);

  // ---- 4. analyzer selftest (pool + guardrail judge shapes) ----
  console.log('\n=== Analyzer selftest (analyze-lendfix-a --selftest) ===');
  let anaSelf = null, anaCount = null;
  try {
    const anaOut = execFileSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-lendfix-a.js'), '--selftest'],
      { encoding: 'utf8', timeout: 120000, maxBuffer: 16 * 1024 * 1024, env: process.env });
    console.log('  ' + anaOut.trim().split('\n').filter(Boolean).pop());
    const m = /(\d+) passed, 0 failed/.exec(anaOut);
    anaCount = m ? parseInt(m[1], 10) : null;
    anaSelf = anaCount != null && anaCount >= 60;
  } catch (e) {
    console.log('  (analyzer selftest failed: ' + (e && e.message) + ')');
  }
  check('analyzer selftest passes (>= 60 passed, 0 failed — incl. the pool / guardrail judge)', anaSelf === true, anaCount === null ? 'no output' : 'passed=' + anaCount);

  console.log('LENDFIX_FAILS ' + failed + (fails.length ? ' ' + fails.join(',') : ''));
  console.log('LENDFIX_PASSED ' + passed + '/' + (passed + failed));
  if (failed) process.exitCode = 1;
}

main().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });
