#!/usr/bin/env node
// test-mourning-multi-20261016.js — PROOF for journey-succession r16:
// the acute mourning topic named only the single last corpse — with 2-3
// fresh villager corpses the village grieved one at a time, and a later
// monster corpse displaced the dead entirely ("Since Dustboar died...").
// The fix: the event names every fresh VILLAGER corpse (dayDied within the
// 3-day acute window); monsters are never mourned by name.
// RED on pristine, GREEN post-fix.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL:', label); }
}

function villagerCorpses(Game, ids, day, cause) {
  return ids.map((vid, i) => {
    const ch = (Game.data.villagers || []).find(x => x.id === vid) || {};
    return { id: 'c_test_' + i, kind: 'villager', villagerId: vid,
      name: ch.name || ('Villager' + i), dayDied: day, cause: cause || 'a hushwolf' };
  });
}

(async () => {
  const { Game } = await loadGame({ seed: 9182, mode: 'test-mourning-multi' });
  await setupGame(Game);
  const v = Game.state.village;
  const day = (Game.state.scholar || {}).day || 0;
  const living = (v.roster || []).filter(id => id !== Game.villagerId);
  const talker = living[0];
  const dead3 = living.slice(1, 4);
  // knowledge-gated references: firstRef (first name if known, else descriptor)
  const deadNames = dead3.map(vid => { try { return Game.firstRef(vid) || vid; } catch (e) { return vid; } });

  // --- 1. three fresh villager corpses: all named ---
  Game.state.corpses = villagerCorpses(Game, dead3, day);
  v.grief = 3;
  let ev = Game.t2LatelyEvent(talker);
  ok(ev && ev.kind === 'mourning', '1: mourning event returned, got ' + JSON.stringify(ev && ev.kind));
  ok(ev && ev.names && ev.names.length === 3, '1: all three fresh dead named, got ' + JSON.stringify(ev && ev.names));
  ok(ev && ev.names && ev.name === ev.names[2], '1: ev.name is the most recent (mname fill), got ' + JSON.stringify(ev && ev.name));
  for (const n of deadNames) ok(ev && ev.names && ev.names.indexOf(n) >= 0, '1: contains ' + n);

  // --- 2. a later monster corpse does NOT displace the dead ---
  Game.state.corpses.push({ id: 'c_mon', kind: 'monster', name: 'Dustboar', dayDied: day, cause: 'combat' });
  ev = Game.t2LatelyEvent(talker);
  ok(ev && ev.kind === 'mourning', '2: still mourning with monster corpse present');
  ok(ev && ev.names && ev.names.length === 3 && !/dustboar/i.test(ev.names.join(' ')),
    '2: monster not mourned by name, got ' + JSON.stringify(ev && ev.names));

  // --- 3. single fresh corpse: old behavior preserved ---
  Game.state.corpses = villagerCorpses(Game, [dead3[0]], day);
  ev = Game.t2LatelyEvent(talker);
  ok(ev && ev.kind === 'mourning', '3: single corpse still mourning');
  ok(ev && ev.names && ev.names.length === 1 && ev.names[0] === deadNames[0],
    '3: single name preserved, got ' + JSON.stringify(ev && ev.names));

  // --- 4. stale corpses (4+ days) are not named ---
  Game.state.corpses = villagerCorpses(Game, dead3, day - 4);
  v.grief = 3;
  ev = Game.t2LatelyEvent(talker);
  ok(!ev || ev.kind !== 'mourning' || !(ev.names && ev.names.length),
    '4: stale corpses not named, got ' + JSON.stringify(ev && { kind: ev.kind, names: ev.names }));

  // --- 5. the rendered lines name every fresh dead villager ---
  Game.state.corpses = villagerCorpses(Game, dead3, day);
  v.grief = 3;
  ev = Game.t2LatelyEvent(talker);
  let genLines = [];
  try { genLines = Game.t2gen_lately(talker) || []; } catch (e) { genLines = ['threw:' + e.message]; }
  const flat = genLines.join(' | ');
  for (const n of deadNames) ok(flat.indexOf(n) >= 0, '5: rendered lines name ' + n + ' :: ' + flat.slice(0, 200));
  ok(!/dustboar/i.test(flat), '5: no monster in mourning lines');

  // --- 6. single-corpse lines unchanged (tone preserved) ---
  Game.state.corpses = villagerCorpses(Game, [dead3[0]], day);
  genLines = [];
  try { genLines = Game.t2gen_lately(talker) || []; } catch (e) { genLines = ['threw:' + e.message]; }
  ok(genLines.join(' | ').indexOf(deadNames[0]) >= 0, '6: single-corpse line names the dead :: ' + genLines.join(' | ').slice(0, 160));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
