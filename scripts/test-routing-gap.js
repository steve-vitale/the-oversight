#!/usr/bin/env node
// test-routing-gap.js — Triage A4-routing proof for sim-routing-gap
// (2026-10-27, gap-closure item: villagers routed to known monsters).
//
// Deterministic scenario proof, run with the shared harness:
//   node scripts/test-routing-gap.js
//
// What it proves, in plain words:
//   1. NEGATIVE CONTROL: with a living monster sitting on a tile that no
//      villager has fought on, no villager is ever offered a hunt errand
//      to that tile — however many errands are picked. Unknown monsters
//      are never routed to.
//   2. POSITIVE: once one villager has a fresh fight memory for that
//      tile (recorded through the same helper the wild-fight path uses),
//      that villager can be offered a hunt errand back to that tile.
//   3. ARMED GATE: the same villager without a weapon is never offered
//      the hunt, however many errands are picked.
//   4. STALE GATE: a fight memory older than 3 days never offers a hunt.
//   5. DROP: a checked-and-gone memory can be dropped from the store.
//
// No fight, spawn, stat, or wave rule is exercised here beyond placing
// one world monster on a tile; the hunt offer itself is the behaviour
// under test. The panel (scripts/sim-routing-panel.js) proves the same
// rule in full runs, including real fight memories and departures.
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));

let failures = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (detail ? ' — ' + detail : ''));
  if (!ok) failures++;
}
const LOTTERY_KINDS = ['FORAGE', 'WATER', 'TRAPS', 'VISIT', 'EXPLORE', 'HAUL', 'SEEK', 'HAVEN_CHORE'];

async function main() {
  const { Game, loadFails } = await loadGame({ seed: 42, mode: 'routing-gap', fullTelemetry: false });
  check('harness loads clean', !(loadFails && loadFails.length), loadFails ? loadFails.join('; ') : 'no load failures');
  await setupGame(Game);
  const v = Game.state.village || {};
  const hx = (v.px !== undefined && v.px !== null) ? v.px : 4;
  const hy = (v.py !== undefined && v.py !== null) ? v.py : 4;
  const day = ((Game.state || {}).scholar || {}).day || 0;

  // A weapon to arm the test villager with (equipped OR carried counts).
  const weaponDef = (Game.data.items || []).find(d => d && d.weapon);
  check('a weapon item exists in data', !!weaponDef, weaponDef ? weaponDef.id : 'none found');
  if (!weaponDef) { console.log('ABORT: no weapon def'); process.exit(1); }

  // Pick a test villager: alive, not the player, roams at least 1 tile,
  // not set on leaving. Arm them.
  let vid = null;
  for (const rid of (v.roster || [])) {
    if (rid === Game.villagerId) continue;
    let vp = null; try { vp = Game.vpOf(rid); } catch (e) {}
    if (!vp || vp.dead) continue;
    let goal = null; try { goal = Game.npcGoal(rid); } catch (e) {}
    if (goal === 'escape') continue;
    let maxD = 0; try { maxD = Game.npcMaxDist(rid); } catch (e) {}
    if (maxD < 1) continue;
    vid = rid; break;
  }
  check('a roaming test villager exists', !!vid, vid || 'none');
  if (!vid) { console.log('ABORT: no test villager'); process.exit(1); }
  const vp = Game.vpOf(vid);
  vp.equipped = vp.equipped || {};
  vp.equipped.melee = { itemId: weaponDef.id };
  vp.items = vp.items || [];
  if (!vp.items.some(e => (e && (e.itemId || e.id)) === weaponDef.id)) vp.items.push({ itemId: weaponDef.id });
  try { const nn = Game.npcNeeds(vid); if (nn) { nn.energy = 80; nn.hunger = 20; } } catch (e) {}

  // Place one living world monster on an adjacent, non-safe tile.
  const mdef = (Game.data.monsters || []).find(m => m && (m.wave === 1 || m.wave === undefined)) || (Game.data.monsters || [])[0];
  check('a monster def exists', !!mdef, mdef ? mdef.id : 'none');
  let mtx = null, mty = null;
  for (const d of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
    const tx = hx + d[0], ty = hy + d[1];
    if (tx < 0 || tx > 8 || ty < 0 || ty > 8) continue;
    let safe = false; try { safe = !!(Game.isSafeTile && Game.isSafeTile(tx, ty)); } catch (e) {}
    if (safe) continue;
    if (Game.monsterAt && Game.monsterAt(tx, ty)) continue;
    mtx = tx; mty = ty; break;
  }
  check('an adjacent non-safe tile exists for the monster', mtx !== null, mtx !== null ? (mtx + ',' + mty) : 'none');
  const mon = Game.spawnWorldMonster(mdef, mtx, mty, {});
  check('monster placed on its tile', !!(Game.monsterAt && Game.monsterAt(mtx, mty)), 'monsterAt=' + (Game.monsterAt(mtx, mty) ? Game.monsterAt(mtx, mty).id : 'null'));

  function pickMany(n) {
    let lottery = 0, hunts = 0, huntsToMonster = 0, firstHunt = null;
    for (let i = 0; i < n; i++) {
      let o = null;
      try { o = Game.objPick(vid, hx, hy); } catch (e) { check('objPick does not throw', false, String(e && e.message)); return null; }
      if (!o) continue;
      if (LOTTERY_KINDS.indexOf(o.kind) >= 0) lottery++;
      if (o.kind === 'HUNT') {
        hunts++;
        if (o.tx === mtx && o.ty === mty && o.huntMid === mdef.id) { huntsToMonster++; if (!firstHunt) firstHunt = { huntMid: o.huntMid, huntTx: o.huntTx, huntTy: o.huntTy, tx: o.tx, ty: o.ty }; }
      }
      // Keep the villager's needs out of the body-first early gates.
      try { const nn = Game.npcNeeds(vid); if (nn) { nn.energy = 80; nn.hunger = 20; } } catch (e) {}
    }
    return { lottery, hunts, huntsToMonster, firstHunt };
  }

  // 1. NEGATIVE CONTROL — no fight memory anywhere yet.
  const neg = pickMany(300);
  check('negative: errand picks reached the lottery', neg && neg.lottery > 50, neg ? ('lottery=' + neg.lottery) : 'no result');
  check('negative: no hunt offered to the unknown monster tile', neg && neg.huntsToMonster === 0, neg ? ('huntsToMonster=' + neg.huntsToMonster + ' hunts=' + neg.hunts) : 'no result');
  check('negative: no hunt offered at all without any memory', neg && neg.hunts === 0, neg ? ('hunts=' + neg.hunts) : 'no result');

  // 2. POSITIVE — plant a fresh fight memory for this villager only.
  let noted = null;
  try { noted = Game.objNoteMonsterSighting(vid, mdef.id, mtx, mty); } catch (e) { check('objNoteMonsterSighting exists and runs', false, String(e && e.message)); }
  check('positive: fight memory recorded', !!(noted && noted.mid === mdef.id && noted.tx === mtx && noted.ty === mty), noted ? JSON.stringify(noted) : 'none');
  const pos = pickMany(300);
  check('positive: errand picks reached the lottery', pos && pos.lottery > 50, pos ? ('lottery=' + pos.lottery) : 'no result');
  check('positive: a hunt is offered back to the remembered tile', pos && pos.huntsToMonster >= 1, pos ? ('huntsToMonster=' + pos.huntsToMonster + ' hunts=' + pos.hunts) : 'no result');
  if (pos && pos.firstHunt) {
    check('positive: hunt carries its memory provenance', pos.firstHunt.huntMid === mdef.id && pos.firstHunt.huntTx === mtx && pos.firstHunt.huntTy === mty,
      'huntMid=' + pos.firstHunt.huntMid + ' huntTx=' + pos.firstHunt.huntTx + ' huntTy=' + pos.firstHunt.huntTy);
  }

  // 3. ARMED GATE — same villager, weapon taken away.
  vp.equipped = {};
  vp.items = [];
  const unarmed = pickMany(200);
  check('armed gate: errand picks reached the lottery', unarmed && unarmed.lottery > 50, unarmed ? ('lottery=' + unarmed.lottery) : 'no result');
  check('armed gate: no hunt offered without a weapon', unarmed && unarmed.hunts === 0, unarmed ? ('hunts=' + unarmed.hunts) : 'no result');

  // 4. STALE GATE — re-arm, age the memory past 3 days.
  vp.equipped = { melee: { itemId: weaponDef.id } };
  vp.items = [{ itemId: weaponDef.id }];
  try {
    const list = ((Game.state.village.monsterSightings || {})[vid] || []);
    for (const s of list) { if (s.mid === mdef.id && s.tx === mtx && s.ty === mty) s.day = day - 10; }
  } catch (e) {}
  const stale = pickMany(200);
  check('stale gate: errand picks reached the lottery', stale && stale.lottery > 50, stale ? ('lottery=' + stale.lottery) : 'no result');
  check('stale gate: no hunt offered on a 10-day-old memory', stale && stale.hunts === 0, stale ? ('hunts=' + stale.hunts) : 'no result');

  // 5. DROP — the memory can be removed once checked.
  let dropped = false;
  try { dropped = Game.objDropMonsterSighting(vid, mdef.id, mtx, mty); } catch (e) {}
  let remaining = -1;
  try { remaining = ((Game.state.village.monsterSightings || {})[vid] || []).filter(s => s.mid === mdef.id && s.tx === mtx && s.ty === mty).length; } catch (e) {}
  check('drop: checked memory removed from the store', dropped === true && remaining === 0, 'dropped=' + dropped + ' remaining=' + remaining);

  console.log(failures === 0 ? 'ALL ROUTING-GAP CHECKS PASSED' : (failures + ' ROUTING-GAP CHECK(S) FAILED'));
  process.exit(failures === 0 ? 0 : 1);
}
main().catch(e => { console.error('test-routing-gap FAILED: ' + (e && e.stack || e)); process.exit(1); });
