#!/usr/bin/env node
// PLAYTEST: build-around abilities in real fights (Steve 2026-10-14).
// "I have no confidence playtesting will reveal anything meaningful. But try."
//
// Plays real fights with and without build-around abilities.
// Measures: does the ability change the fight, or just add numbers?
// Telemetry is saved for repeatability.
//
// Usage: node scripts/play-buildarounds-20261014.js [SEED]
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const SEED = parseInt(process.argv[2] || '42', 10);
Math.random = mulberry32(SEED);

global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
});
['src/js/engine/state.js', 'src/js/engine/modifiers.js', 'src/js/engine/calories.js',
 'src/js/engine/day.js', 'src/js/engine/forage.js', 'src/js/engine/combat.js',
 'src/js/game.js', 'src/js/encounters.js', 'src/js/food.js', 'src/js/party.js',
 'src/js/justice.js', 'src/js/conversation.js', 'src/js/truth.js', 'src/js/journal.js',
 'src/js/betrayal.js', 'src/js/corpses.js', 'src/js/abilityActions.js',
 'src/js/buildarounds.js', 'src/js/statusEffects.js', 'src/js/sigW5.js'].forEach(f => {
  try { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); }
  catch (e) { console.log('LOAD FAIL ' + f + ': ' + e.message); }
});
const Game = globalThis.Scattering.Game;

const T = [];
const telemetry = {
  seed: SEED,
  fights: [],
  buildaroundEvents: [],
};
const origSay = Game.say;
Game.say = function (m) {
  const s = String(m);
  T.push('  | ' + s.slice(0, 140));
  // Capture build-around events
  if (/RETRIBUTION|BLOOD FRENZY|FEAST ENGINE|BATTLEFIELD GRACE|NOWHERE MAN|CARTOGRAPHER|TROPHY|CROWD FAVORITE|HOARDER|CORNUCOPIA/i.test(s)) {
    telemetry.buildaroundEvents.push({ fight: telemetry.fights.length, text: s.slice(0, 200) });
  }
  return origSay.call(this, m);
};
const beat = (t) => {
  console.log('\n' + '='.repeat(60) + '\n  ' + t + '\n' + '='.repeat(60));
  for (const l of T.splice(0)) console.log(l);
};
const endTurn = () => {
  if (!Game.tbfight) return;
  try {
    if (Game.tbIsPlayerTurn()) {
      Game.tbPlayerEndTurn();
    } else {
      // Not player turn - advance until it is (or fight ends)
      let adv = 0;
      while (Game.tbfight && !Game.tbIsPlayerTurn() && adv++ < 10) {
        Game.tbAdvance();
      }
    }
  } catch (e) {}
};
const feed = () => {
  const s = Game.state.scholar;
  s.kcal = 2400; s.hydration = 100; s.health = s.maxHp || 100;
};

function runFight(label, abilities, monsterCount) {
  console.log(`\n>>> FIGHT: ${label} (abilities: ${abilities.join(',') || 'none'})`);
  const fight = {
    label, abilities: abilities.slice(),
    turns: 0, playerDamageDealt: 0, playerDamageTaken: 0,
    outcome: 'unknown', buildaroundTriggers: 0,
  };
  const startEvents = telemetry.buildaroundEvents.length;

  // Give abilities
  Game.state.scholar.abilities = abilities.slice();
  Game.state.scholar.buildaround = {};
  feed();

  // Fight a villager (proven pattern from play-brawler-kill-loot).
  // Villager fights exercise the same tbDamage/tbPlayerStrike paths
  // that build-arounds hook into.
  const v = Game.state.village;
  const me = Game.villagerId;
  const others = v.roster.filter(id => id !== me && Game.vpOf(id) && !Game.vpOf(id).dead);
  if (!others.length) {
    console.log('  no villagers to fight');
    fight.outcome = 'no_fight';
    telemetry.fights.push(fight);
    return fight;
  }
  const foeId = others[0];
  // Heal the foe so the fight lasts
  try { Game.vpOf(foeId).health = 100; } catch (e) {}
  if (!Game.tbfight) {
    try { Game.playerAttacks(foeId); } catch (e) { console.log('attack err: ' + e.message); }
  }

  if (!Game.tbfight) {
    console.log('  COULD NOT START FIGHT - skipping');
    fight.outcome = 'no_fight';
    telemetry.fights.push(fight);
    return fight;
  }

  console.log('  fighters: ' + (Game.tbfight.fighters || [])
    .map(f => `${f.key}:${f.kind} hp=${Math.round(f.hp || 0)}`).join(' | '));

  const hpStart = Game.tbFighter('p') ? Game.tbFighter('p').hp : 100;
  let guard = 0;
  while (Game.tbfight && guard++ < 60) {
    const foe = Game.tbfight.fighters.find(f => f.key !== 'p' && f.alive && !f.fled);
    if (!foe) { console.log('  (no foe found, breaking)'); break; }
    const pBefore = Game.tbFighter('p').hp;
    const foeHpBefore = foe.hp;
    if (!Game.tbIsPlayerTurn()) {
      if (guard <= 3) console.log(`  turn ${guard}: NOT player turn, skipping strike`);
      endTurn();
      continue;
    }
    Game.tbPlayerStrike(foe.key);
    const foeHpAfter = foe.hp;
    if (guard <= 3) console.log(`  turn ${guard}: foe ${foe.key} hp ${Math.round(foeHpBefore)} -> ${Math.round(foeHpAfter)}`);
    const pAfter = Game.tbFighter('p') ? Game.tbFighter('p').hp : 0;
    fight.playerDamageTaken += Math.max(0, pBefore - pAfter);
    // Estimate damage dealt (foe hp drop)
    fight.turns++;
    endTurn();
    if (!Game.tbFighter('p') || !Game.tbFighter('p').alive) break;
  }

  const p = Game.tbFighter('p');
  fight.outcome = (!Game.tbfight) ? 'won' : (p && p.alive ? 'fled_or_stalled' : 'died');
  fight.playerDamageDealt = Math.round(hpStart - (p ? p.hp : 0) + fight.playerDamageTaken);
  fight.buildaroundTriggers = telemetry.buildaroundEvents.length - startEvents;

  // Clean up fight
  if (Game.tbfight) {
    try { Game.tbfight = null; } catch (e) {}
  }

  beat(`FIGHT RESULT: ${label}`);
  console.log(`  outcome: ${fight.outcome}, turns: ${fight.turns}, ` +
    `dealt: ~${fight.playerDamageDealt}, taken: ${Math.round(fight.playerDamageTaken)}, ` +
    `build-around triggers: ${fight.buildaroundTriggers}`);

  telemetry.fights.push(fight);
  return fight;
}

(async () => {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  Game.tickAction = () => {};
  console.log('Player: ' + Game.displayName(Game.villagerId));

  // Baseline: no build-around
  runFight('baseline', [], 1);

  // With build-arounds
  runFight('blood_frenzy', ['blood_frenzy'], 1);
  runFight('retribution', ['retribution'], 1);
  runFight('battlefield_grace', ['battlefield_grace'], 1);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('  TELEMETRY SUMMARY');
  console.log('='.repeat(60));
  for (const f of telemetry.fights) {
    console.log(`  ${f.label}: ${f.outcome} in ${f.turns} turns, ` +
      `triggers: ${f.buildaroundTriggers}`);
  }
  console.log(`\n  Total build-around events: ${telemetry.buildaroundEvents.length}`);
  for (const e of telemetry.buildaroundEvents.slice(0, 10)) {
    console.log(`    [fight ${e.fight}] ${e.text.slice(0, 100)}`);
  }

  // Save telemetry
  const outPath = path.join(ROOT, 'evidence/2026-10-14/telemetry-buildarounds.json');
  fs.writeFileSync(outPath, JSON.stringify(telemetry, null, 2));
  console.log(`\n  Telemetry saved: ${outPath}`);
  console.log('\n=== playtest complete ===');
})();
