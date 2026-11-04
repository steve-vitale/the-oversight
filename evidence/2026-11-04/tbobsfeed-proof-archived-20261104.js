// ARCHIVED 2026-11-04 — proof for the REVERTED TB-observation-feed lever (arm sim-tbobsfeed-a).
// Confirm band NO-GO (see evidence/2026-11-04/sim-tbobsfeed-a.md); the feed was reverted, so this
// file MUST NOT run as part of the suite — it tests deleted code. Kept here as the record of
// what was proven while the lever lived (14/14 on the armed code). Original: scripts/test-tbobsfeed-20261104.js
// test-tbobsfeed-20261104.js — proof for arm sim-tbobsfeed-a.
// Drives the REAL Game.tbEnd on synthetic TB fights (harness-loaded
// game, setupGame state) and asserts the TB-observation-feed lever:
//   1. a won TB fight feeds 1 observation for the fought kind;
//   2. the 2-observation threshold stays 2 (1 fed obs != known);
//   3. a second won fight completes the kind (2/2 -> villagerTricks);
//   4. a lost TB fight feeds nothing;
//   5. one won fight with 2 dead of one kind feeds 1, not 2 (no
//      double-feed per kind per fight);
//   6. an already-known kind feeds nothing (shared core no-op).
// Writes nothing into the repo.
// Usage: node scripts/test-tbobsfeed-20261104.js
'use strict';
const path = require('path');
const { loadGame, setupGame } = require(path.join(__dirname, 'sim-harness'));
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function mdefOf(Game, id) {
  const m = (Game.data.monsters || []).find(function (x) { return x && x.id === id; });
  if (!m) throw new Error('no mdef ' + id);
  return m;
}
function fight(Game, monsters, scholarAlive) {
  const fighters = [{ key: 'p', kind: 'player', alive: scholarAlive !== false, hp: scholarAlive !== false ? 80 : 0, maxHp: 100 }];
  monsters.forEach(function (spec, i) {
    fighters.push({ key: 'm_' + i, kind: 'monster', alive: false, hp: 0, maxHp: 900,
      mdef: mdefOf(Game, spec) });
  });
  return { fighters: fighters, round: 3, over: false, result: null };
}
async function fresh() {
  const { Game } = await loadGame({ seed: 99101, mode: 'tbobsfeed-proof', fullTelemetry: false });
  await setupGame(Game);
  const says = [];
  const teles = [];
  const origSay = Game.say;
  Game.say = function () {
    try { says.push(Array.prototype.slice.call(arguments).join(' ')); } catch (e) {}
    try { return origSay.apply(this, arguments); } catch (e) { return undefined; }
  };
  const origTele = Game.tele;
  Game.tele = function (type, data) {
    try { teles.push({ type: type, id: data && data.id, n: data && data.n }); } catch (e) {}
    try { return origTele.apply(this, arguments); } catch (e) { return undefined; }
  };
  Game.state.villageCounterObs = {};
  Game.state.villagerTricks = {};
  return { Game: Game, says: says, teles: teles };
}
function obs(Game, id) { return ((Game.state.villageCounterObs || {})[id] | 0); }

(async function () {
  // 1+2+3: won feeds, threshold stays 2, second won completes.
  let ctx = await fresh();
  let Game = ctx.Game;
  Game.tbfight = fight(Game, ['eulogy']);
  Game.tbEnd('won');
  check('won TB fight feeds 1 observation', obs(Game, 'eulogy') === 1, 'obs=' + obs(Game, 'eulogy'));
  check('threshold stays 2: not known after 1 obs', !Game.state.villagerTricks.eulogy && !Game.villageKnowsTrick('eulogy'));
  check('fed observation narrated as lived-to-tell-it',
    ctx.says.some(function (s) { return s.indexOf('lived to tell it') >= 0; }),
    ctx.says.slice(-3).join(' | '));
  check('fed observation fires counter_observed tele',
    ctx.teles.some(function (t) { return t.type === 'counter_observed' && t.id === 'eulogy' && t.n === 1; }),
    JSON.stringify(ctx.teles.filter(function (t) { return t.type === 'counter_observed'; })));
  Game.tbfight = fight(Game, ['eulogy']);
  Game.tbEnd('won');
  check('second won TB fight completes 2/2', obs(Game, 'eulogy') === 2, 'obs=' + obs(Game, 'eulogy'));
  check('kind known after 2 observations', !!Game.state.villagerTricks.eulogy && !!Game.villageKnowsTrick('eulogy'));
  check('discovery narrated as COUNTER LEARNED',
    ctx.says.some(function (s) { return s.indexOf('COUNTER LEARNED') >= 0 && s.indexOf('Contradict the narration') >= 0; }),
    ctx.says.slice(-2).join(' | '));

  // 4: lost feeds nothing (scholar alive variant isolates the result test;
  // the dead-scholar variant below covers the real lost shape).
  ctx = await fresh();
  Game = ctx.Game;
  Game.tbfight = fight(Game, ['eulogy']);
  Game.tbEnd('lost');
  check('lost TB fight (scholar alive) feeds nothing', obs(Game, 'eulogy') === 0, 'obs=' + obs(Game, 'eulogy'));
  ctx = await fresh();
  Game = ctx.Game;
  Game.tbfight = fight(Game, ['eulogy'], false);
  Game.tbEnd('lost');
  check('lost TB fight (scholar dead) feeds nothing', obs(Game, 'eulogy') === 0, 'obs=' + obs(Game, 'eulogy'));

  // 5: no double-feed per kind per fight.
  ctx = await fresh();
  Game = ctx.Game;
  Game.tbfight = fight(Game, ['eulogy', 'eulogy', 'audit']);
  Game.tbEnd('won');
  check('two dead of one kind feed 1, not 2', obs(Game, 'eulogy') === 1, 'obs=' + obs(Game, 'eulogy'));
  check('second kind in same fight feeds 1', obs(Game, 'audit') === 1, 'obs=' + obs(Game, 'audit'));

  // 6: already-known kind feeds nothing.
  ctx = await fresh();
  Game = ctx.Game;
  Game.state.villagerTricks.eulogy = true;
  Game.tbfight = fight(Game, ['eulogy']);
  Game.tbEnd('won');
  check('already-known kind feeds nothing', obs(Game, 'eulogy') === 0, 'obs=' + obs(Game, 'eulogy'));
  check('already-known kind fires no counter_observed tele',
    !ctx.teles.some(function (t) { return t.type === 'counter_observed' && t.id === 'eulogy'; }));

  // 7: existing fled channel unchanged (alive monster feeds; regression guard).
  ctx = await fresh();
  Game = ctx.Game;
  const fl = fight(Game, ['eulogy']);
  fl.fighters[1].alive = true; fl.fighters[1].hp = 400;
  Game.tbfight = fl;
  Game.tbEnd('fled');
  check('fled channel still feeds (regression guard)', obs(Game, 'eulogy') === 1, 'obs=' + obs(Game, 'eulogy'));

  console.log('tbobsfeed proof: ' + pass + ' pass, ' + fail + ' fail');
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.error('TBOBSFEED PROOF FATAL: ' + (e && e.stack || e)); process.exit(1); });
