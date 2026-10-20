// test-moot-broadcast-grammar-20261012.js — the System moot broadcast must
// use the right verb for the player: "YOU stand accused", not "YOU stands
// accused". Proof test for the journey-social r8 fix (betrayal.js callMoot).
// RED on pristine (the broadcast said "YOU stands accused"), green after.
// Usage: node scripts/test-moot-broadcast-grammar-20261012.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL ${name}` + (extra ? `: ${extra}` : '')); }
}

(async () => {
  const { Game, loadFails } = await loadGame({ seed: 424242 });
  if (loadFails && loadFails.length) console.log('LOAD FAILURES:\n' + loadFails.join('\n'));
  await setupGame(Game);

  const v = Game.state.village;
  const me = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== me);
  ok('roster has NPCs', roster.length >= 3);
  const accuser = roster[0], npcAccused = roster[1], npcAcc2 = roster[2];

  // capture System broadcast lines
  const sysLines = [];
  Game.sysSay = function (msg) { sysLines.push(String(msg)); };
  Game.say = function () {};
  Game.state.systemArrived = true;

  // --- 1. player-accused case: second person ---
  Game.recordCrime && Game.recordCrime('theft', { victim: accuser });
  const crimes = (Game.justiceState && Game.justiceState().crimes || []).filter(c => !c.caseId);
  const pc = Game.openPlayerCase(accuser, 'theft', crimes.slice(0, 1), false);
  ok('player case opened', !!pc);
  sysLines.length = 0;
  try { Game.callMoot(pc.id, accuser); } catch (e) { console.log('callMoot threw: ' + e.message); }
  const accused = sysLines.find(l => /accused/i.test(l));
  ok('broadcast names the accused', !!accused, sysLines.join(' | ').slice(0, 200));
  ok('player gets "YOU stand accused"', !!accused && /YOU stand accused/.test(accused), accused);
  ok('no "YOU stands accused"', !sysLines.some(l => /YOU stands accused/.test(l)));

  // --- 2. NPC-accused case: all accused named (r32 moot-naming fix) ---
  // The r8 fix's player grammar ("YOU stand accused") still holds; the NPC
  // assertion changed ON PURPOSE in r32: the trial judges every accused, so
  // the broadcast names them all with the plural verb ("X AND Y stand
  // accused"), not just accused[0] with "stands".
  const plot = { id: 'plot_grammartest', leader: npcAccused, accomplices: [npcAcc2], target: accuser, weakest: npcAcc2, witnesses: [] };
  const nc = Game.openCase(plot, 'murder');
  ok('npc case opened', !!nc);
  sysLines.length = 0;
  try { Game.callMoot(nc.id, accuser); } catch (e) { console.log('npc callMoot threw: ' + e.message); }
  const nAccused = sysLines.find(l => /accused/i.test(l));
  ok('npc broadcast exists', !!nAccused, sysLines.join(' | ').slice(0, 200));
  const tagOf = (id) => { try { return String(Game.whoTag(id)).toUpperCase(); } catch (e) { return '?'; } };
  ok('npc broadcast names the ringleader', !!nAccused && nAccused.includes(tagOf(npcAccused)), nAccused);
  ok('npc broadcast names the accomplice', !!nAccused && nAccused.includes(tagOf(npcAcc2)), nAccused);
  ok('plural accused take "stand accused"', !!nAccused && /stand accused/i.test(nAccused) && !/\bstands accused/i.test(nAccused) && !/YOU stand/.test(nAccused), nAccused);

  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
