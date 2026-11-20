#!/usr/bin/env node
// test-antler-thrash-the-the-20261119.js — proof for the journey-crisis
// r253 "The The" regression (r249 fix, 26772ac93).
//
// THE DEFECT (panel seed 14563): "The The Bright Bastard thrashes its
// antlers at you — getting close has a price." The village had named the
// gallowdeer "The Bright Bastard" (a villageName, a proper name carrying
// its own article), monsterNoun returns it whole, and tbAntlerThrash
// composes "The " + mn blindly — guarding only the "something" case. The
// call-site comment already says "never 'The the ...'" but the code only
// guards "something"; the articlePhrase class fix (playtest deepening r18,
// #542) exists and the sibling sites (patrol 8366, 24346, witness 35331)
// already use it. This site was missed.
//
// THE FIX (src/js/game.js, tbAntlerThrash): compose the thrash line via
// articlePhrase(mn, true) — proper-cased names stand bare ("The Bright
// Bastard thrashes..."), lowercase descriptors take "The " ("The thing
// with headlights for eyes thrashes..."). The damage label keeps mn whole
// ("The Bright Bastard's antlers" reads right).
//
// RED (before): the "The Bright Bastard" case says "The The Bright
// Bastard..." (1 fail). GREEN (after): all cases read clean (5/5).
//
// Usage: node scripts/test-antler-thrash-the-the-20261119.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; console.log('  FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

async function main() {
  const { Game } = await loadGame({ seed: 14563, mode: 'antler-thrash-the-the-proof' });
  await setupGame(Game);

  const said = [];
  const osay = Game.say;
  Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return osay.call(this, t); };
  const dmgCalls = [];
  Game.tbDamage = function (key, d, src, byKey) { dmgCalls.push({ key: key, d: d, src: src, byKey: byKey }); return true; };

  Game.state.codex = Game.state.codex || {};
  Game.state.codex.monsters = Game.state.codex.monsters || {};

  function stageThrash(villageName) {
    if (villageName) Game.state.codex.monsters.gallowdeer = { villageName: villageName };
    else delete Game.state.codex.monsters.gallowdeer;
    said.length = 0;
    dmgCalls.length = 0;
    const m = {
      kind: 'monster', key: 'm_0', monsterId: 'gallowdeer',
      name: villageName || 'Gallowdeer', mx: 4, my: 4, alive: true,
    };
    const p = { kind: 'player', key: 'p', name: 'Scholar', mx: 5, my: 4, alive: true, hp: 100, maxHp: 100 };
    Game.tbfight = { fighters: [m, p], over: false };
    const hit = Game.tbAntlerThrash(m);
    return { hit: hit, lines: said.slice(), dmg: dmgCalls.slice() };
  }

  // ---- A: village name carrying its own article (the panel case) ----
  check('staging: monsterNoun is the village name whole',
    Game.monsterNoun('gallowdeer') === 'thing with headlights for eyes' ||
    (Game.state.codex.monsters.gallowdeer = { villageName: 'The Bright Bastard' },
     Game.monsterNoun('gallowdeer') === 'The Bright Bastard'));
  const a = stageThrash('The Bright Bastard');
  check('thrash hits the adjacent player', a.hit === true);
  check('no "The The" in any thrash line',
    !a.lines.some(l => /The The/.test(l)), JSON.stringify(a.lines));
  check('line reads "The Bright Bastard thrashes its antlers at you"',
    a.lines.some(l => l === 'The Bright Bastard thrashes its antlers at you — getting close has a price.'),
    JSON.stringify(a.lines));
  check('damage label keeps the name whole',
    a.dmg.length === 1 && a.dmg[0].src === "The Bright Bastard's antlers",
    JSON.stringify(a.dmg));

  // ---- B: unnamed descriptor (control — must not regress) ----
  const b = stageThrash(null);
  check('descriptor case still reads "The thing with headlights for eyes thrashes..."',
    b.lines.some(l => l === 'The thing with headlights for eyes thrashes its antlers at you — getting close has a price.'),
    JSON.stringify(b.lines));

  // ---- C: proper village name WITHOUT "The" (must stay bare) ----
  const c = stageThrash('Headlight Harry');
  check('bare proper name reads "Headlight Harry thrashes..." (no "The Headlight Harry")',
    c.lines.some(l => l === 'Headlight Harry thrashes its antlers at you — getting close has a price.'),
    JSON.stringify(c.lines));

  console.log(fail ? `\nRESULT: FAIL (${fail} failed, ${pass} passed)` : `\nRESULT: PASS (${pass} passed)`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('HARNESS ERROR: ' + (e && e.stack || e)); process.exit(2); });
