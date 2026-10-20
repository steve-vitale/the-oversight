#!/usr/bin/env node
// test-moot-names-all-accused-20261020.js -- PROOF TEST (journey-social r32).
// M3: the post-System moot broadcast named only accused[0] while the trial
// judges ALL the accused (sentenceCase/resolveCase apply to every accused).
// Transcript proof (journey-social r32, seed 3006): case_2 accused Carmela,
// Regina, Howard — broadcast said "TONIGHT: CARMELA stands accused"; case_4
// accused Luis, Wei, Carmela — "TONIGHT: LUIS stands accused". Accomplices
// judged unnamed.
// GREEN: the broadcast names every accused ("CARMELA, REGINA, AND HOWARD
// stand accused"). Single-accused and player-accused grammar preserved
// ("X stands accused" / "YOU stand accused").
// RED (pre-fix): broadcast names only accused[0].
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');
const safe = (fn, d) => { try { return fn(); } catch (e) { return d; } };

async function broadcastFor(Game, accusedIds) {
  const roster = (Game.state.village.roster || []).filter(id => !accusedIds.includes(id));
  const target = roster.find(id => id !== Game.villagerId) || Game.villagerId;
  const plot = { id: 'plot_proof', leader: accusedIds[0], accomplices: accusedIds.slice(1), target, witnesses: [] };
  const c = Game.openCase(plot, 'ambush');
  Game.state.systemArrived = true;
  const said = [];
  const orig = Game.sysSay;
  Game.sysSay = function (m) { said.push(String(m)); };
  try { Game.callMoot(c.id, Game.villagerId); } finally { Game.sysSay = orig; }
  return said.find(m => /stands? accused/i.test(m)) || '(none)';
}

async function main() {
  let fails = 0;
  const fail = (m) => { console.log('FAIL: ' + m); fails++; };

  const { Game } = await loadGame({ seed: 424242, mode: 'moot-naming-proof' });
  await setupGame(Game);
  const npcs = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  if (npcs.length < 3) { console.log('SKIP: need 3+ NPCs'); process.exit(2); }
  const tag = (id) => { try { return String(Game.whoTag(id)).toUpperCase(); } catch (e) { return '?'; } };

  // 1. Three accused: ALL must be named.
  const line3 = await broadcastFor(Game, npcs.slice(0, 3));
  console.log('3-accused broadcast:', line3);
  for (const id of npcs.slice(0, 3)) {
    if (!line3.includes(tag(id))) fail(`accused ${tag(id)} not named in broadcast`);
  }
  if (!/stand accused/i.test(line3)) fail('missing "stand accused"');
  if (/\bstands accused/i.test(line3)) fail('plural accused must take "stand", not "stands"');

  // 2. Single accused: unchanged grammar.
  const line1 = await broadcastFor(Game, npcs.slice(0, 1));
  console.log('1-accused broadcast:', line1);
  if (!line1.includes(tag(npcs[0]))) fail('single accused not named');
  if (!/\bstands accused/i.test(line1)) fail('single accused must take "stands"');

  // 3. Player among the accused: YOU named, grammar right.
  const lineP = await broadcastFor(Game, [npcs[0], Game.villagerId]);
  console.log('player-accused broadcast:', lineP);
  if (!/YOU/.test(lineP)) fail('player not named as YOU');
  if (!lineP.includes(tag(npcs[0]))) fail('co-accused NPC not named');
  if (!/stand accused/i.test(lineP) || /\bstands accused/i.test(lineP)) fail('plural must take "stand"');

  console.log(fails ? `RESULT: ${fails} FAILURES` : 'RESULT: GREEN — broadcast names every accused');
  process.exit(fails ? 1 : 0);
}

main().catch(e => { console.error('ERROR:', e && e.stack || e); process.exit(1); });
