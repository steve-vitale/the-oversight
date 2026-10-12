#!/usr/bin/env node
// test-teachchore-lines-r5.js — proof test for longsim agency r5 (2026-10-12).
//
// The teach-chore spoken line (villager-objectives.js teachChoreLine) varies
// off the lesson's NEED (wound/hunger/novice/general) and uses firstRef for
// both refs (no bare-"A person, maybe 60s" stage-voice). Pure string building,
// no RNG — narration-only.
//
// RED CHECK: against the pre-dial code, Game.teachChoreLine does not exist,
// so every assertion fails. GREEN: all four need variants + fallbacks pass.
'use strict';
const assert = require('assert');
const { loadGame, setupGame } = require('./sim-harness');

(async () => {
  const { Game } = await loadGame({ seed: 42, mode: 'competent', fullTelemetry: false });
  await setupGame(Game);

  assert(typeof Game.teachChoreLine === 'function', 'teachChoreLine must exist on Game');

  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  assert(roster.length >= 1, 'need at least one villager');
  const learner = roster[0];
  const teacher = roster[1] || roster[0];

  const tnm = (Game.firstRef ? Game.firstRef(teacher) : 'TestTeacher');
  const mk = (need, plantName) => ({ taught: true, learner, plant: 'wild_onion', plantName, need });

  const cases = [
    ['wound',  'a low woodland plant with a whorl of compound leaves', 'which leaves to press on a wound'],
    ['hunger', 'Wild Onion', 'where it grows, what\'s safe to eat'],
    ['novice', 'a thorny bush with dark berries', 'beginner\'s tour'],
    [null,     'a tree with orange fruit, soft when ripe', 'leaf, stem, smell'],
  ];
  const lines = {};
  for (const [need, plantName, clause] of cases) {
    const line = Game.teachChoreLine(tnm, mk(need, plantName));
    lines[need] = line;
    assert(line.startsWith('📖 '), `line must carry the 📖 tag: ${line}`);
    assert(line.includes(clause), `need=${need}: line must include "${clause}": ${line}`);
    // SENSE: no bare-"A man/woman/person, maybe 60s" stage voice anywhere
    assert(!/A (man|woman|person), maybe/.test(line), `need=${need}: no bare descriptor voice: ${line}`);
  }
  // the four variants must actually differ (not one template)
  const uniq = new Set(cases.map(([need]) => lines[need].split('—').slice(1).join('—').trim()));
  assert(uniq.size === 4, 'four distinct line endings expected, got ' + uniq.size);

  // fallbacks: unknown need string -> general template; missing plantName -> default
  const genLine = Game.teachChoreLine(tnm, { taught: true, learner, plantName: null, need: 'bogus' });
  assert(genLine.includes('leaf, stem, smell'), 'unknown need must fall back to general: ' + genLine);
  assert(genLine.includes('something from the wild'), 'missing plantName must fall back: ' + genLine);
  const noLearner = Game.teachChoreLine(tnm, { taught: true, learner: null, plantName: 'Wild Onion', need: 'hunger' });
  assert(noLearner.includes('someone'), 'missing learner must fall back to someone: ' + noLearner);

  console.log('OK test-teachchore-lines-r5: all assertions passed');
  console.log('  wound : ' + lines['wound']);
  console.log('  hunger: ' + lines['hunger']);
  console.log('  novice: ' + lines['novice']);
  console.log('  general: ' + lines[null]);
})();
