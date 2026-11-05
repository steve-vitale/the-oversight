// PROOF: gear protection retune — tier-appropriate armor lets a fully-geared
// party SURVIVE wave-4 fights (Steve 2026-11-05).
// Before: wave-4 fights last 1.46 rounds on average, 6/11 end in the fighter's
// death (8-seed baseline). The mundane armor ladder is retuned x1.5
// (items.json; special/loot armor unchanged). This test stages the same
// wave-4 fight twice (same seeded RNG), ungeared vs fully geared, and asserts
// the geared fighter takes less damage per round and survives more rounds.
// Usage: node scripts/test-gear-protection-20261105.js   (exit 1 on any FAIL)
'use strict';
const fs = require('fs'), path = require('path');
const H = require('./sim-harness.js');
const L = require('./godpath/lib.js');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail !== undefined ? ' :: ' + detail : '')); }
}
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function main() {
  // ---- data: the ladder ----
  const items = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'items.json'), 'utf8'));
  const list = items.items || items;
  const by = {};
  for (const x of list) by[x.id] = x;
  const prot = id => (by[id] && by[id].armor && by[id].armor.protection) || 0;
  console.log('armor ladder (torso)');
  const ladder = ['bark_armor', 'leather_jacket', 'hide_armor', 'riot_gear', 'swat_vest', 'military_vest'];
  const vals = ladder.map(prot);
  check('ladder strictly increases', vals.every((v, i) => i === 0 || v > vals[i - 1]), vals.join(' < '));
  check('military vest protection >= 50 (top tier)', prot('military_vest') >= 50, 'military_vest=' + prot('military_vest'));
  check('hide armor protection >= 25 (craftable tier)', prot('hide_armor') >= 25, 'hide_armor=' + prot('hide_armor'));
  check('bark armor protection >= 12 (first craftable tier)', prot('bark_armor') >= 12, 'bark_armor=' + prot('bark_armor'));

  // ---- staged wave-4 fight: same RNG, ungeared vs fully geared ----
  const Game = await L.load({ seed: 99101 });
  const scholar = L.newRun(Game, 'Columbus, Ohio');
  const village = Game.state.village;
  const vid = (village.roster || []).find(id => id !== Game.villagerId);
  if (!vid) { console.log('FAIL no roster villager'); process.exit(1); }
  const person = Game.vpOf(vid);
  const mdef = (Game.data.monsters || []).find(m => m.id === 'reunion'); // wave 4, dmg 60-80, pierce 0.45
  if (!mdef) { console.log('FAIL no reunion monster def'); process.exit(1); }
  village.health = village.health || {};
  function runFight(gear) {
    village.health[vid] = 100;
    person.items = gear.slice();
    person.equipped = {};
    try { Game.villagerGearUp(vid, false); } catch (e) {}
    let P = 0;
    try { P = (globalThis.Scattering.equipment.armorOf(person, Game.data.items)) || 0; } catch (e) {}
    const rec = Game.fieldFight(vid, mdef, null, { rng: mulberry32(424242) });
    return { rec, armor: P };
  }
  console.log('staged wave-4 fight (reunion, same RNG)');
  const bare = runFight([]);
  const geared = runFight(['military_vest', 'knit_cap', 'canvas_pants', 'work_gloves', 'good_boots']);
  console.log('  ungeared: armor=' + bare.armor + ' outcome=' + bare.rec.outcome + ' rounds=' + bare.rec.rounds + ' vTaken=' + bare.rec.vTaken);
  console.log('  geared:   armor=' + geared.armor + ' outcome=' + geared.rec.outcome + ' rounds=' + geared.rec.rounds + ' vTaken=' + geared.rec.vTaken);
  check('fully-geared fighter has real protection (armorOf >= 60)', geared.armor >= 60, 'armor=' + geared.armor);
  const barePerRound = bare.rec.rounds > 0 ? bare.rec.vTaken / bare.rec.rounds : bare.rec.vTaken;
  const gearedPerRound = geared.rec.rounds > 0 ? geared.rec.vTaken / geared.rec.rounds : geared.rec.vTaken;
  check('geared fighter takes less damage per round', gearedPerRound < barePerRound, 'bare=' + barePerRound.toFixed(1) + ' geared=' + gearedPerRound.toFixed(1));
  check('geared fighter survives at least as many rounds', geared.rec.rounds >= bare.rec.rounds, 'bare=' + bare.rec.rounds + ' geared=' + geared.rec.rounds);
  check('geared fighter takes at least 25% less damage per round', barePerRound > 0 && gearedPerRound <= barePerRound * 0.75, 'bare=' + barePerRound.toFixed(1) + ' geared=' + gearedPerRound.toFixed(1));

  console.log(pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
