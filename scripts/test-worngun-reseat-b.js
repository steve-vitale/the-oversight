// test-worngun-reseat-b.js — arm sim-worngun-reseat-b: a worn-only gun
// must survive the next re-seat of its slot.
//
// THE DEFECT (sim-guntransfer-b §4, finding sim-findings.md): mantleBecome
// seats the successor's worn gun worn-only on the scholar (equipped.ranged,
// no inventory entry behind it). The next re-seat of the ranged slot
// destroyed it with no event, no narration, no corpse — proven on the
// replay band s107756 d44 and s107751 d151.
//
// VERIFIED MECHANISM (prereg §0, probes /tmp/worngun/probe2–probe5.js):
// the destroyer is NOT autoEquip (it never runs on the scholar) but
// contestChoose's d.grantWeapon branch (contests.js): the arena
// "choose your weapon" grant seats the granted weapon directly in
// scholar.equipped[wslot], overwriting the slot without returning the
// displaced piece to the pack (the #806 return Game.equip performs).
//
// THE FIX: grantWeapon returns the displaced entry to scholar.inventory
// (#806 shape: itemId, name, units, kcalEach 0, kg 0.5, bonded +
// alienLoot flags carried).
//
//   node scripts/test-worngun-reseat-b.js
//     T0 staging sanity, T1 ranged re-seat returns the gun, T2 a melee
//     grant leaves the ranged gun alone, T3 a carried (not worn) gun is
//     untouched, T4 bonded flags survive the return.
// Must FAIL on old code (T1/T4: pack searcaster count 0) and PASS on new.
// Reads only the harness in-memory; never writes into the repo.
// Usage: node scripts/test-worngun-reseat-b.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log('PASS ' + name);
  else { failures++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

function scholar(Game) { return (Game.state && Game.state.scholar) || {}; }
function countInPack(Game, id) {
  return (scholar(Game).inventory || []).filter(function (it) { return (it && (it.itemId || it.id)) === id; }).length;
}
function packEntry(Game, id) {
  return (scholar(Game).inventory || []).find(function (it) { return (it && (it.itemId || it.id)) === id; }) || null;
}
function rangedId(Game) {
  const e = (scholar(Game).equipped || {}).ranged;
  return (e && (e.itemId || e.id)) || null;
}
function meleeId(Game) {
  const e = (scholar(Game).equipped || {}).melee;
  return (e && (e.itemId || e.id)) || null;
}
// Stage the mantleBecome outcome: a worn-only gun on the scholar.
function stageWornGun(Game, extra) {
  const s = scholar(Game);
  s.inventory = (s.inventory || []).filter(function (it) { return (it && (it.itemId || it.id)) !== 'searcaster'; });
  s.equipped = s.equipped || {};
  s.equipped.ranged = Object.assign({ itemId: 'searcaster', name: 'Searcaster' }, extra || {});
}
// Stage a one-choice contest whose choice grants a weapon, then take it.
function takeGrantWeapon(Game, weaponId) {
  Game.state.activeContest = {
    contestId: 'worngun-probe', kind: 'contest', phaseIdx: 0,
    phases: [{ choices: [{ label: 'Take it', do: { grantWeapon: weaponId }, next: 'WIN' }] }],
  };
  return Game.contestChoose(0);
}

(async function () {
  const { Game } = await loadGame({ seed: 7, mode: 'worngun-reseat-test', fullTelemetry: false });
  await setupGame(Game);
  const s = scholar(Game);
  s.health = Math.max(s.health || 100, 100);

  // T0 — staging sanity: the worn-only state itself (equipped gun, empty pack).
  stageWornGun(Game);
  check('T0 staging: worn-only gun (equipped searcaster, pack 0)',
    rangedId(Game) === 'searcaster' && countInPack(Game, 'searcaster') === 0,
    'ranged=' + rangedId(Game) + ' pack=' + countInPack(Game, 'searcaster'));

  // T1 — the defect: a better ranged arrival must return the gun to the pack.
  stageWornGun(Game);
  takeGrantWeapon(Game, 'hunting_spear');
  check('T1 ranged re-seat returns the worn gun to the pack',
    rangedId(Game) === 'hunting_spear' && countInPack(Game, 'searcaster') === 1,
    'ranged=' + rangedId(Game) + ' packSear=' + countInPack(Game, 'searcaster'));
  check('T1b granted spear is seated (not lost)',
    rangedId(Game) === 'hunting_spear',
    'ranged=' + rangedId(Game));

  // T2 — a melee grant must leave the ranged gun exactly where it was.
  stageWornGun(Game);
  takeGrantWeapon(Game, 'stone_knife');
  check('T2 melee grant leaves the worn ranged gun alone',
    rangedId(Game) === 'searcaster' && meleeId(Game) === 'stone_knife' && countInPack(Game, 'searcaster') === 0,
    'ranged=' + rangedId(Game) + ' melee=' + meleeId(Game) + ' packSear=' + countInPack(Game, 'searcaster'));

  // T3 — a gun carried in the pack (not worn) is untouched by a ranged grant.
  stageWornGun(Game);
  s.equipped.ranged = { itemId: 'crude_bow', name: 'Crude bow' };
  s.inventory = s.inventory || [];
  s.inventory.push({ itemId: 'searcaster', name: 'Searcaster', units: 1, kcalEach: 0, kg: 0.5 });
  takeGrantWeapon(Game, 'hunting_spear');
  check('T3 carried gun survives a ranged grant (still exactly 1 in pack)',
    rangedId(Game) === 'hunting_spear' && countInPack(Game, 'searcaster') === 1,
    'ranged=' + rangedId(Game) + ' packSear=' + countInPack(Game, 'searcaster'));

  // T4 — bonded flags travel with the returned gun (#806 shape).
  stageWornGun(Game, { bonded: true, bond: 5, bondOffered: [], enhancements: [] });
  takeGrantWeapon(Game, 'hunting_spear');
  const back = packEntry(Game, 'searcaster');
  check('T4 returned gun keeps its bonded flag',
    !!back && back.bonded === true && (back.bond || 0) === 5,
    'entry=' + JSON.stringify(back));

  console.log(failures === 0 ? 'ALL PASS (5 checks)' : failures + ' FAILURES');
  process.exit(failures === 0 ? 0 : 1);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
