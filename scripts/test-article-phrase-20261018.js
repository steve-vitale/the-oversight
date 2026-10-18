// test-article-phrase-20261018.js -- RED->GREEN proof for the double-article
// class fix (playtest deepening r18, 2026-10-18; backlog #542 from landing
// r22: Mara's line read "the The Loud Beast flesh").
//
// Class: callers compose "the " + monsterNoun()/monsterDisplayName() value.
// monsterNoun keeps proper/village names' casing ("The Loud Beast") while
// descriptors come back lowercase and article-free ("toad like a war drum");
// monsterDisplayName returns RAW values whose descriptors still carry their
// articles ("the toad like a war drum"). Blind "the "-prefixing produced:
//   "the The Loud Beast flesh"   (food.js testMonsterMeat, game.js experiment beat)
//   "the the toad like a war drum" / "the a dog-shaped silence"  (havenGrowth raid)
//   "fought the The Loud Beast"  (game.js/havenGrowth patrol summaries)
//   "The the toad like a war drum is dead" (party-formal split-team detail)
//
// The fix adds Game.articlePhrase(noun, cap): strip any leading article,
// then "the "+bare for lowercase descriptors, bare for proper-cased names,
// cap=true for sentence starts. RED: Game.articlePhrase is undefined.
// GREEN: all unit + integration assertions pass, no "the The "/"the the "/
// "The the " left in any produced line.
//
// Usage: node scripts/test-article-phrase-20261018.js
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

const NO_DOUBLE = /(^|[^A-Za-z])(the The|the the|The the|The The|the a |the an )([^A-Za-z]|$)/;

async function main() {
  const { Game } = await loadGame({ seed: 424242, mode: 'test-article-phrase-20261018' });
  await setupGame(Game);
  let fails = 0;
  const check = (name, fn) => {
    try { fn(); console.log('  PASS ' + name); }
    catch (e) { fails++; console.log('  FAIL ' + name + ' :: ' + (e && e.message)); }
  };

  // Give one monster a villager-invented proper name (the r22 case) and one a
  // system-true name with a leading "The" (The Redactor).
  if (!Game.state.codex) Game.state.codex = {};
  if (!Game.state.codex.monsters) Game.state.codex.monsters = {};
  Game.state.codex.monsters['hummice'] = { villageName: 'The Loud Beast' };
  Game.state.codex.monsters['redactor'] = { villageName: 'The Redactor' };

  check('helper exists', () => assert.strictEqual(typeof Game.articlePhrase, 'function', 'Game.articlePhrase missing'));

  // UNIT: monsterNoun-sourced values
  check('proper name bare mid-sentence', () =>
    assert.strictEqual(Game.articlePhrase(Game.monsterNoun('hummice')), 'The Loud Beast'));
  check('proper name bare sentence-start', () =>
    assert.strictEqual(Game.articlePhrase(Game.monsterNoun('hummice'), true), 'The Loud Beast'));
  check('descriptor gets the', () =>
    assert.strictEqual(Game.articlePhrase(Game.monsterNoun('gallowdeer')), 'the thing with headlights for eyes'));
  check('descriptor sentence-start', () =>
    assert.strictEqual(Game.articlePhrase(Game.monsterNoun('gallowdeer'), true), 'The thing with headlights for eyes'));
  // UNIT: monsterDisplayName-sourced (raw, article-carrying) values
  check('raw descriptor no double', () =>
    // monsterDisplayName returns the raw descriptor INCLUDING the comma
    // clause ("...eyes, standing too still") — articlePhrase composes the
    // article correctly; the comma-cut is monsterNoun's job. The contract
    // here is article hygiene only.
    assert.strictEqual(Game.articlePhrase(Game.monsterDisplayName('gallowdeer')), 'the thing with headlights for eyes, standing too still'));
  check('raw a-descriptor no double', () =>
    assert.strictEqual(Game.articlePhrase(Game.monsterDisplayName('hushwolf')), 'the dog-shaped silence at the treeline'));
  check('raw proper name bare', () =>
    assert.strictEqual(Game.articlePhrase(Game.monsterDisplayName('hummice'), true), 'The Loud Beast'));
  check('raw proper name bare, no cap', () =>
    assert.strictEqual(Game.articlePhrase(Game.monsterDisplayName('redactor')), 'The Redactor'));

  // FLESH PHRASES (the r22 line's class)
  check('flesh phrase proper name', () =>
    assert.strictEqual(Game.articlePhrase(Game.monsterNoun('hummice')) + ' flesh', 'The Loud Beast flesh'));
  check('flesh phrase descriptor', () =>
    assert.strictEqual(Game.articlePhrase(Game.monsterNoun('belltoad')) + ' flesh', 'the toad like a war drum flesh'));

  // INTEGRATION: the actual player testMonsterMeat say line with a
  // villager-named monster — the exact r22 finding.
  const said = [];
  const _say = Game.say;
  Game.say = function (...a) { said.push(String(a[0])); try { return _say.apply(this, a); } catch (e) { return a[0]; } };
  try {
    Game.state.scholar.inventory.push({
      foodKind: 'meat', edible: false, plantId: 'meat_hummice',
      name: 'The Loud Beast meat (raw)', kcalEach: 0, prep: 'raw'
    });
    const idx = Game.state.scholar.inventory.length - 1;
    said.length = 0;
    Game.testMonsterMeat(idx);
  } finally { Game.say = _say; }
  const fleshLine = said.find(s => /set aside time/i.test(s)) || '';
  check('testMonsterMeat line mentions the name', () => assert.ok(/Loud Beast/i.test(fleshLine), 'no monster name in: ' + fleshLine.slice(0, 120)));
  check('testMonsterMeat no double article', () => assert.ok(!NO_DOUBLE.test(fleshLine), 'DOUBLE ARTICLE: ' + fleshLine.slice(0, 140)));

  // INTEGRATION: villager experiment beat (the r17 H4 fireside line) via
  // the same composition path — direct phrase check on game.js's beat
  // requires a full experiment run; the helper contract covers it.
  check('experiment-beat phrase composes clean', () => {
    const tname = 'Mara';
    const mname = Game.monsterNoun('hummice');
    const mflesh = Game.articlePhrase(mname) + ' flesh';
    const line = `${tname} sets aside time with ${mflesh}.`;
    assert.ok(!NO_DOUBLE.test(line), line);
    assert.ok(/with The Loud Beast flesh/.test(line), line);
  });

  // REGRESSION (wild-caught 2026-10-18): the three new site-classes.
  check('contest keeps coined article', () =>
    assert.strictEqual(Game.articlePhrase('The Lottery'), 'The Lottery'));
  check('contest bare name stands (title convention)', () =>
    assert.strictEqual(Game.articlePhrase('Gauntlet'), 'Gauntlet'));
  check('plant the-descriptor not doubled', () =>
    assert.strictEqual(
      Game.articlePhrase('the giant tree with roots dropping from its branches like curtains'),
      'the giant tree with roots dropping from its branches like curtains'));
  check('teachChoreLine no double (novice tour)', () => {
    const line = Game.teachChoreLine('Gonzalo', { learner: null, plantName: 'the giant tree with roots dropping from its branches like curtains', need: 'novice', topic: 'plant' });
    assert.ok(!NO_DOUBLE.test(line), 'DOUBLE ARTICLE: ' + line.slice(0, 140));
    assert.ok(/through the giant tree/.test(line), 'lost the plant: ' + line.slice(0, 140));
  });
  check('haul-departure phrase composes clean', () => {
    const label = Game.monsterDisplayName ? Game.monsterDisplayName('hummice') : 'The Loud Beast';
    const line = `sets out for ${Game.articlePhrase(label)}. "Meat's meat. Back with it or not at all."`;
    assert.ok(!NO_DOUBLE.test(line), line);
  });
  check('counter-observed possessive composes clean', () => {
    // game.js discoverMonsterCounter first-sighting line
    const line = `You lived to tell it — ${Game.articlePhrase(Game.monsterDisplayName('redactor'))}'s moves are burned into your memory. (1/2)`;
    assert.ok(!NO_DOUBLE.test(line), line);
    assert.ok(/The Redactor's moves/.test(line), line);
  });
  check('fled-monster re-find composes clean', () => {
    const line = `You find it — ${Game.articlePhrase(Game.monsterNoun('hummice'))} didn't get far. It's still running scared.`;
    assert.ok(!NO_DOUBLE.test(line), line);
    assert.ok(/The Loud Beast didn't get far/.test(line), line);
  });

  console.log(fails === 0 ? '\nALL GREEN' : `\n${fails} FAILURES`);
  process.exit(fails === 0 ? 0 : 1);
}
main().catch(e => { console.error('HARNESS ERROR: ' + (e && e.stack || e)); process.exit(2); });
