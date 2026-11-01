'use strict';
const K = require('./godpath/lib');
const { install } = require('./character-decisions-observer');
const T = K.reporter('character decision observer');
(async () => {
  const Game = await K.load({ seed: 42 });
  const observer = install(Game);
  K.newRun(Game);
  const first = observer.report();
  T.ok('records the starting person before a later action query', first.bodies.length === 1 && first.bodies[0].bearer === Game.villagerId);
  const stored = JSON.stringify(first.bodies[0].abilities);
  K.giveAbility(Game, 'green_thumb', { force: true });
  T.ok('initial kit remains a snapshot when later abilities change', JSON.stringify(first.bodies[0].abilities) === stored);
  const before = JSON.stringify(Game.state), available = Game.activatableAbilities();
  T.ok('query result stays an array', Array.isArray(available));
  T.ok('observing availability does not change save state', JSON.stringify(Game.state) === before);
  T.ok('real runtime observations have no errors', observer.report().errors.length === 0);
  const old = Game.villagerId;
  Game.playerDeath('prepared observer contract test');
  const succession = observer.report();
  T.ok('real death changes the bearer', Game.villagerId !== old);
  T.ok('real succession produces exactly one incoming body', succession.bodies.length === 2 && succession.handoffs.length === 1);
  T.ok('incoming snapshot is their imported kit', JSON.stringify(succession.bodies[1].abilities) === JSON.stringify(succession.handoffs[0].after.abilities));

  // Contract probes: real methods may nest, return undefined, throw, or expose
  // an unserializable observation. The observer must preserve those semantics.
  const state = { scholar: { day: 1, dayTicks: 0, kcal: 1200, health: 100, abilities: [], tracks: {}, equipped: {} }, village: {} };
  let queries = 0, calls = 0;
  const probe = { state, villagerId: 'one',
    newGame() { return 17; },
    activatableAbilities() { queries++; return [{ abilityId: 'green_thumb', actionId: 'cultivate', available: true, combat: false }]; },
    cultivateGarden() { calls++; return true; },
    useAbility() { return this.cultivateGarden(); },
    craft() { calls++; },
    mantleBecome(oldId, newId) { calls++; this.villagerId = newId; return true; },
    tbPlayerStrike() { throw Error('actual failure'); },
  };
  const audit = install(probe);
  T.ok('install makes no gameplay queries', queries === 0 && calls === 0);
  T.ok('original return values survive', probe.newGame() === 17 && probe.useAbility('green_thumb', 'cultivate') === true);
  probe.craft('bow');
  probe.activatableAbilities();
  const report = audit.report();
  T.ok('nested cultivation is one root decision and one nested call', report.calls[0].parent === null && report.calls[1].parent === report.calls[0].index);
  T.ok('undefined result remains unknown', report.calls[2].returned === 'unknown');
  T.ok('field opportunities stay field opportunities', report.bodies[0].opportunities['green_thumb.cultivate'].combat === false);
  let caught = false;
  try { probe.tbPlayerStrike(); } catch (e) { caught = e.message === 'actual failure'; }
  T.ok('real method exceptions propagate unchanged', caught);
  probe.craft('bow');
  T.ok('a throw restores nesting for the next decision', audit.report().calls.at(-1).parent === null);
  state.village = { roster: ['two'], rosterChars: { two: { goal: 'heal' } }, npcAbilities: { two: ['mending_hands'] } };
  probe.mantleBecome('one', 'two');
  T.ok('keyed roster is read without changing mantle execution', probe.villagerId === 'two' && audit.report().handoffs[0].before.goal === 'heal');
  state.scholar.abilities = []; state.scholar.abilities.push(state.scholar.abilities);
  probe.villagerId = 'three'; // force a fresh snapshot of the invalid observation
  const n = calls;
  T.ok('an observation error cannot skip the real action', probe.cultivateGarden() === true && calls === n + 1);
  T.ok('observation errors stay visible', audit.report().errors.length > 0);
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
