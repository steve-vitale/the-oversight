#!/usr/bin/env node
// PROOF: addHealth killing the player mid-fight ends the fight (no zombie).
// journey-scale r2 (2026-10-11). RED->GREEN against src/js/game.js.
//
// The bug: addHealth(-X) in combat clamped hp to 0 but never set
// alive=false. tbEndCheck only looks at !p.alive, so it saw a living corpse
// and the fight spun forever — seed 271828: 113,401 rounds vs a
// speedbump_turtle with a 0-HP "alive" player; the day never advanced and
// the run bricked. Disease ticks (corpses.js), ability costs, and signature
// damage all route through addHealth, so any of them could zombie a fight.
//
// Fix: addHealth marks the fighter dead at hp<=0 (like tbDamage), says
// "You go down.", and the death flows through the normal pipeline
// (maybeCheatDeath -> tbEnd('lost') -> playerDeath -> mantle).
//
// Usage: node scripts/test-zombie-fight-20261011.js   (exit 1 on any FAIL)

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let _s = 0;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
function resetRng(seed) { _s = seed >>> 0; }
global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
});
global.localStorage = {
  _m: {},
  getItem(k) { return (k in this._m) ? this._m[k] : null; },
  setItem(k, v) { this._m[k] = String(v); },
  removeItem(k) { delete this._m[k]; },
};
global.window = global; // stub for eval phase only
const files = [
  'src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js',
  'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js',
  'src/js/game.js', 'src/js/encounters.js', 'src/js/conversation.js',
  'src/js/convo-mood.js', 'src/js/convoTopics.js', 'src/js/convo-wants.js',
  'src/js/convo-dialogue.js', 'src/js/convo-beats.js', 'src/js/convo-scene.js',
  'src/js/examine.js', 'src/js/equipment.js', 'src/js/journal.js',
  'src/js/party.js', 'src/js/party-formal.js', 'src/js/truth.js',
  'src/js/contests.js', 'src/js/broadcast.js', 'src/js/contestEngine.js',
  'src/js/alienPlayers.js', 'src/js/storage.js', 'src/js/perceive.js',
  'src/js/carexplore.js', 'src/js/justice.js', 'src/js/food.js',
  'src/js/betrayal.js', 'src/js/corpses.js', 'src/js/corruption.js',
  'src/js/lifeseed.js', 'src/js/progression.js', 'src/js/waveLedger.js',
  'src/js/feastBuff.js', 'src/js/ledger.js', 'src/js/abilityActions.js',
  'src/js/monsterBehaviors.js', 'src/js/partyTactics.js',
  'src/js/sigW3a.js', 'src/js/statusEffects.js', 'src/js/sigW3b.js',
  'src/js/metaProgression.js', 'src/js/sigW3c.js',
  'src/js/villager-agency.js', 'src/js/fieldFights.js',
  'src/js/villager-objectives.js', 'src/js/codex-people.js',
  'src/js/membership.js', 'src/js/havenGrowth.js', 'src/js/hierarchy.js',
  'src/js/comms.js', 'src/js/safetynets.js', 'src/js/villageAgency.js',
  'src/js/debug-scenarios.js', 'src/js/build.js',
];
for (const f of files) { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
delete global.window; // sync headless path from here on
const Game = globalThis.Scattering.Game;

let passes = 0, fails = 0;
function check(name, cond, detail) {
  if (cond) { passes++; console.log('PASS: ' + name); }
  else { fails++; console.log('FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}

async function main() {
  resetRng(271828);
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();

  const said = [];
  const _say = Game.say;
  Game.say = function (...a) { said.push(String(a[0])); try { return _say.apply(this, a); } catch (e) { return a[0]; } };

  Game.startCombat('speedbump_turtle');
  const f = Game.tbfight;
  check('Z0 turtle fight starts', !!f && !f.over);
  if (!f || f.over) { console.log('BLOCKED: no fight'); process.exit(2); }
  const p = Game.tbFighter('p');
  const bearerBefore = Game.villagerId;

  // wound the player to 5 hp through the normal damage path (alive)
  Game.tbDamage('p', Math.max(1, (p.hp || 100) - 5), 'test', 'm_0');
  check('Z1 player wounded but alive', p.hp === 5 && p.alive === true, 'hp=' + p.hp + ' alive=' + p.alive);

  // the killing blow comes through addHealth (disease tick / ability cost /
  // signature damage all route here, not through tbDamage)
  said.length = 0;
  Game.addHealth(-9999);
  check('Z2 addHealth to 0 marks the fighter dead', p.alive === false, 'hp=' + p.hp + ' alive=' + p.alive);
  check('Z3 the fall is said aloud', said.some(s => /go down/i.test(s)), 'said: ' + JSON.stringify(said.slice(0, 2)));

  // the death must flow through the normal pipeline: fight ends (lost),
  // the mantle passes (village-as-protagonist) or the run ends — but the
  // fight NEVER spins on.
  const fightGone = !Game.tbfight || Game.tbfight.over;
  check('Z4 the fight ends (no zombie)', fightGone, 'tbfight=' + (Game.tbfight ? 'still live, over=' + Game.tbfight.over : 'null'));
  const mantlePassed = Game.villagerId !== bearerBefore;
  check('Z5 death resolves (mantle passes or run over)', Game.over || mantlePassed,
    'over=' + Game.over + ' bearerChanged=' + mantlePassed);

  // sanity: healing still works and never kills
  const p2alive = (Game.tbfight ? Game.tbFighter('p') : null);
  void p2alive;
  Game.state.scholar.health = 50;
  const h = Game.addHealth(20);
  check('Z6 healing still works', h === 70, 'health=' + h);

  // ---- the status-effect tick path (the actual 271828 killer) ----
  // A fresh fight; wound to 5 via tbDamage, then tick down to 0 through
  // tickStatuses with a combat-scope hp tick.
  Game.startCombat('speedbump_turtle');
  const f2 = Game.tbfight;
  check('Z7 second turtle fight starts', !!f2 && !f2.over);
  const p2 = Game.tbFighter('p');
  Game.tbDamage('p', Math.max(1, (p2.hp || 100) - 5), 'test', 'm_0');
  // plant a per-turn hp tick on the fighter and run it
  p2.statuses = p2.statuses || [];
  // find a real tick def id with per-turn hp damage; fall back to direct call
  let tickId = null;
  try {
    const statuses = ((Game.data || {}).statusEffects || {}).statuses || {};
    for (const id of Object.keys(statuses)) {
      const def = statuses[id];
      if (def && def.tick && def.tick.per === 'turn' && (def.tick.hp || 0) > 0) { tickId = id; break; }
    }
  } catch (e) {}
  if (tickId) {
    p2.statuses.push({ id: tickId, turnsLeft: 99, stacks: 99 });
    const hpBefore = p2.hp;
    try { Game.tickStatuses(p2, 'combat'); } catch (e) { console.log('tickStatuses threw: ' + (e && e.message)); }
    check('Z8 status tick can drop the fighter', p2.hp < hpBefore, 'hp ' + hpBefore + ' -> ' + p2.hp);
    if (p2.hp <= 0) {
      check('Z9 tick to 0 marks the fighter dead (no zombie)', p2.alive === false, 'hp=' + p2.hp + ' alive=' + p2.alive);
      check('Z10 tick-death ends the fight', !Game.tbfight || Game.tbfight.over, 'tbfight=' + (Game.tbfight ? 'live' : 'null'));
    } else {
      console.log('NOTE: tick did not reach 0 hp this seed (hp=' + p2.hp + ') — Z9/Z10 skipped');
    }
  } else {
    console.log('NOTE: no per-turn hp tick def found — Z8/Z9/Z10 skipped');
  }

  // ---- safety net: a fighter at 0 HP / alive=true is corrected by tbEndCheck ----
  Game.startCombat('speedbump_turtle');
  const f3 = Game.tbfight;
  if (f3 && !f3.over) {
    const p3 = Game.tbFighter('p');
    p3.hp = 0; p3.alive = true; // simulate any missed damage site
    const r = Game.tbEndCheck();
    check('Z11 safety net marks the 0-HP fighter dead', p3.alive === false, 'alive=' + p3.alive);
    check('Z12 safety net ends the fight', r === true && (!Game.tbfight || Game.tbfight.over), 'tbEndCheck=' + r);
  } else {
    console.log('NOTE: third fight did not start — Z11/Z12 skipped');
  }

  console.log('\n' + passes + ' passed, ' + fails + ' failed');
  process.exit(fails ? 1 : 0);
}
main().catch(e => { console.error('PROOF ERROR:', e); process.exit(2); });
