#!/usr/bin/env node
// TEST (journey-endgame r131): Turncoat narration varies across repeat uses.
// The r131 pilot's 89701 Reunion fight used Turncoat 5 times in one fight
// and printed the same line verbatim 5 times — robotic on repeat. The fix
// rotates the opener per fight (mechanics untouched: same two targets,
// same 2 rounds, same mechanical tail). RED before the fix: all 5 lines
// identical. GREEN after: first three uses all distinct, tail intact,
// mechanics identical every use, fresh fight restarts the rotation.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let sayLog = [];
const Game = {
  data: { abilities: [] },
  state: { scholar: { kcal: 2000, health: 100, abilities: [] }, codex: {}, village: {} },
  tbfight: null,
  say: function (msg) { sayLog.push(msg); },
  encSubject: function (m) { return m.name || 'it'; },
};
global.window = undefined;
const _g = { Scattering: { Game: Game } };
const src = fs.readFileSync(path.join(ROOT, 'src/js/abilityActions.js'), 'utf8');
const moduleSrc = src.replace(
  "})(typeof window !== 'undefined' ? window : global);",
  '})(_g);'
);
new Function('_g', moduleSrc)(_g);
const IMPLS = _g.AbilityActionImpls;
if (!IMPLS || typeof IMPLS['turncoat.persuade'] !== 'function') {
  console.log('FAIL ability table missing turncoat.persuade');
  process.exit(1);
}

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

function freshFight() {
  return {
    fighters: [
      { key: 'm_0', kind: 'monster', name: 'Reunion 1', alive: true, fled: false },
      { key: 'm_1', kind: 'monster', name: 'Reunion 2', alive: true, fled: false },
    ],
  };
}

Game.tbfight = freshFight();
sayLog = [];
const results = [];
for (let i = 0; i < 5; i++) {
  const r = IMPLS['turncoat.persuade'](Game, null);
  results.push(r);
  const f = Game.tbfight;
  results[i] = { ok: r, aT: f.fighters[0]._turncoatTarget, bT: f.fighters[1]._turncoatTarget,
    aR: f.fighters[0]._turncoatRounds, bR: f.fighters[1]._turncoatRounds };
}
check('5 uses all succeed', results.every(x => x.ok === true));
check('mechanics identical every use (targets + 2 rounds)',
  results.every(x => x.aT === 'm_1' && x.bT === 'm_0' && x.aR === 2 && x.bR === 2),
  JSON.stringify(results));
check('mechanical tail intact on every line',
  sayLog.every(l => l.indexOf('believe you — for 2 rounds, anyway. (Turncoat: they fight each other.)') >= 0),
  sayLog[0]);
const openers = sayLog.map(l => l.split('Reunion 1')[0]);
check('first three uses all distinct openers',
  new Set(openers.slice(0, 3)).size === 3,
  JSON.stringify(openers));
check('5 uses not all identical',
  new Set(sayLog).size > 1,
  'all 5 lines identical — the r131 complaint, unfixed');

// Fresh fight restarts the rotation (deterministic, no RNG stream touched).
Game.tbfight = freshFight();
sayLog = [];
IMPLS['turncoat.persuade'](Game, null);
check('fresh fight restarts at the first opener', sayLog[0].split('Reunion 1')[0] === openers[0],
  sayLog[0] + ' vs ' + openers[0]);

// Refusal path unchanged with fewer than 2 live monsters.
Game.tbfight = { fighters: [{ key: 'm_0', kind: 'monster', name: 'Solo', alive: true, fled: false }] };
sayLog = [];
const rr = IMPLS['turncoat.persuade'](Game, null);
check('refusal unchanged with <2 live monsters',
  rr === false && sayLog[0] === 'You need at least two monsters to turn against each other. (Turncoat: needs 2+.)',
  sayLog[0]);

console.log(`turncoat-lines-r131: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
