#!/usr/bin/env node
// test-return-ghost-guard-20261030.js — proof for the journey-endgame r74
// ghost-return blank (r74 88972: Alaa died d123, "Felix is back with Alaa"
// fired d124 — the visit companion is snapshotted at departure, so a
// companion who dies out on the trip is still named on the return).
//
// BEFORE: objReturnEffect('visit') names the dead companion and bonds the
// returner to them.
// AFTER: a dead companion's clause is dropped — "X is back." — and no bond
// is struck with the dead; a living companion still reads "X is back with Y."
// Narration + bond guard only: trip logic, departure, and the return event
// itself are untouched.
//
// Usage: node scripts/test-return-ghost-guard-20261030.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

function fail(msg) { console.error('FAIL: ' + msg); process.exit(1); }
function ok(msg) { console.log('ok: ' + msg); }

async function main() {
  const { Game } = await loadGame({ seed: 4242, mode: 'return-ghost-proof' });
  await setupGame(Game);
  if (typeof Game.objReturnEffect !== 'function') fail('setup: objReturnEffect missing');
  const roster = ((Game.state || {}).village || {}).roster || [];
  if (roster.length < 2) fail('setup: need >=2 roster villagers, got ' + roster.length);
  const ret = roster[0], comp = roster[1];
  const retName = Game.displayName(ret);
  const compName = Game.displayName(comp);
  // Player at haven so the return line is voiced.
  const v = Game.state.village;
  try { Game.map.px = (v.px ?? 4); Game.map.py = (v.py ?? 4); } catch (e) {}

  const lines = [];
  const osay = Game.say;
  Game.say = function (t) { try { lines.push(String(t)); } catch (e) {} return osay.call(this, t); };
  const returnLines = () => lines.filter(t => t.indexOf(' is back') >= 0);

  const setDead = (vid, dead) => {
    try { const p = Game.getPerson ? Game.getPerson(vid) : null; if (p) p.dead = dead; } catch (e) {}
    try { const vp = Game.vpOf ? Game.vpOf(vid) : null; if (vp) vp.dead = dead; } catch (e) {}
  };

  // ---- Case A: living companion — clause present, as before ----
  setDead(comp, false);
  Game.objOf(ret).companion = comp;
  lines.length = 0;
  Game.objReturnEffect(ret, 'visit');
  const lineA = returnLines();
  if (lineA.length < 1) fail('case A: no return line voiced');
  if (lineA[0].indexOf(' with ' + compName) < 0) fail('case A: living companion clause lost: ' + lineA[0]);
  ok('case A (living companion): "is back with ' + compName + '" intact');

  // ---- Case B: dead companion — clause dropped, no ghost ----
  setDead(comp, true);
  Game.objOf(ret).companion = comp;
  lines.length = 0;
  Game.objReturnEffect(ret, 'visit');
  const lineB = returnLines();
  if (lineB.length < 1) fail('case B: no return line voiced (the return itself must still be news)');
  if (lineB[0].indexOf(compName) >= 0) fail('case B: dead companion still named on the return: ' + lineB[0]);
  if (!/is back\./.test(lineB[0])) fail('case B: return line malformed without the clause: ' + lineB[0]);
  ok('case B (dead companion): return voiced without the ghost clause: ' + lineB[0]);

  // ---- Case C: companion revived in the record (guard is state, not fate) ----
  setDead(comp, false);
  Game.objOf(ret).companion = comp;
  lines.length = 0;
  Game.objReturnEffect(ret, 'visit');
  if (returnLines().length < 1 || returnLines()[0].indexOf(' with ' + compName) < 0) {
    fail('case C: living companion clause did not return after un-dead');
  }
  ok('case C: guard follows the record, not a one-way latch');

  console.log('\nPASS: return ghost guard (dead companion unnamed, living companion named)');
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
