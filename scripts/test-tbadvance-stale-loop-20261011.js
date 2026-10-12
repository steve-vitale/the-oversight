#!/usr/bin/env node
// PROOF: tbAdvance must not spin phantom rounds on a fight that ends mid-loop.
// (journey-scale r3 2026-10-11)
//
// The bug: tbAdvance captures `const f = this.tbfight` and loops on the stale
// `f`. tbEnd nulls this.tbfight — but the loop's exit check (tbEndCheck)
// reads this.tbfight (null → false), so a fight that ends mid-loop kept
// spinning: a player-death deer fight read 34 rounds instead of 5, walking
// the turn order on null fighters. Harness telemetry lied about fight length.
//
// The fix: re-check liveness (`!this.tbfight || this.tbfight !== f || f.over`)
// every loop iteration.
//
// Method: load the real game, start a real fight, stub tbMonsterTurn so the
// monster's first turn ends the fight via tbEnd (exactly what a player death
// does), then call tbAdvance and assert the round counter does not advance
// past the death round.

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let _s = 12345;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
});
global.localStorage = {
  _m: {},
  getItem(k) { return (k in this._m) ? this._m[k] : null; },
  setItem(k, v) { this._m[k] = String(v); },
  removeItem(k) { delete this._m[k]; },
};
global.window = global;
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
delete global.window;
const Game = globalThis.Scattering.Game;

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`  ok: ${name}`); }
  else { fail++; console.log(`  FAIL: ${name}${extra ? ' — ' + extra : ''}`); }
}

(async () => {
  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();

  // Start a real fight vs a weak monster.
  Game.startCombat('hummice');
  const f = Game.tbfight;
  check('fight started', !!f);
  if (!f) { console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); }
  const roundAtEntry = f.round;
  // Arrange: it is NOT the player's turn (so tbAdvance will run monster turns).
  // Stub the monster's turn to end the fight immediately — the player-death
  // shape: tbEnd nulls Game.tbfight mid-loop.
  const _mt = Game.tbMonsterTurn.bind(Game);
  let ended = false, roundWhenEnded = null;
  Game.tbMonsterTurn = function (c) {
    if (!ended) {
      ended = true;
      this.tbEnd('lost');
      roundWhenEnded = f.round;
      return;
    }
    return _mt(c);
  };
  // Silence the death narration for the probe.
  const _say = Game.say.bind(Game);
  Game.say = function () { return ''; };

  Game.tbAdvance();

  Game.say = _say;
  check('fight ended by the stubbed turn', f.over === true && f.result === 'lost');
  check('Game.tbfight cleared', Game.tbfight === null || Game.tbfight === undefined);
  check(
    'no phantom rounds after the mid-loop end',
    f.round === roundWhenEnded,
    `round advanced ${roundWhenEnded} -> ${f.round} after the fight ended`
  );

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROBE ERROR: ' + (e && e.stack || e)); process.exit(2); });
