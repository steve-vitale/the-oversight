#!/usr/bin/env node
// test-crisis-naming-dead-20261021.js — PROOF for journey-crisis r37 (lane B).
//
// BLANK: monster-naming proposals outlived their proposers. The r37 sims
// caught the day after Rocco starved to death: "Have you heard what they're
// calling The Callback? Rocco is pushing 'Loud-Eyes'." — present-tense
// campaigning by a dead villager. The living debate; a dead villager's
// proposal stands in the vote count but must not render as present-tense.
//
// RED on pristine HEAD: the dead proposer's "is pushing" line renders.
// GREEN post-fix: dead proposers are filtered from the debate lines; living
// proposers still render; the proposals map itself is untouched (votes stand).
//
// Usage: node scripts/test-crisis-naming-dead-20261021.js
'use strict';
const { loadGame, setupGame, runDays, mulberry32 } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

let pass = 0, fail = 0;
function check(id, ok, detail) {
  if (ok) { pass++; console.log(`  [OK] ${id}`); }
  else { fail++; console.log(`  [FAIL] ${id}${detail ? ' — ' + detail : ''}`); }
}

async function main() {
  Math.random = mulberry32(9090);
  const { Game } = await loadGame({ seed: 9090, mode: 'naming-dead', fullTelemetry: false });
  Game.say = () => {};
  await setupGame(Game);
  await runDays(Game, oracleV2, { days: 6 });

  const v = Game.state.village;
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  const dead = roster[0], living = roster[1];
  const deadName = (() => { try { return Game.displayName(dead).split(' ')[0]; } catch (e) { return 'X'; } })();
  const livingName = (() => { try { return Game.displayName(living).split(' ')[0]; } catch (e) { return 'Y'; } })();

  // stage a live naming debate with proposals from both
  const mid = 'hushwolf';
  const e = Game.ensureMonsterEntry(mid);
  e.namingKicked = true;
  e.proposals[dead] = 'Loud-Eyes-Test';
  e.proposals[living] = 'Grim-Howler-Test';
  check('debate-active', Game.monsterNamingActive() === true, 'naming debate staged');

  // kill one proposer through the real damage pipeline (registerDeath alone
  // does not mark vp.dead; hurtVillager routes the full death pipeline)
  try { Game.hurtVillager(dead, 9999, 'monster', null); } catch (err) { check('kill-pipeline', false, String(err && err.message || err)); }
  let vpDead = null;
  try { vpDead = Game.vpOf(dead); } catch (err) {}
  check('proposer-dead', !!(vpDead && vpDead.dead), `vp.dead=${!!(vpDead && vpDead.dead)}`);

  // render the lately topic for a witness
  const witness = roster[2] || living;
  let lines = [];
  try { lines = Game.t2gen_lately(witness) || []; } catch (err) { check('topic-renders', false, String(err && err.message || err)); }
  const text = lines.join('\n');
  const isNaming = /calling|what to even CALL it/i.test(text);
  check('naming-topic-rendered', isNaming, lines.length ? lines[0].slice(0, 80) : '(no lines)');
  if (isNaming) {
    // name the dead proposer the way the topic does (firstRef), not the
    // knowledge-gated displayName fragment
    let deadRef = deadName;
    try { deadRef = Game.firstRef(dead) || deadName; } catch (err) {}
    check('dead-not-pushing', !new RegExp(deadRef.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ' is pushing').test(text),
      `no present-tense "${deadRef} is pushing"`);
    check('dead-proposal-not-named', !text.includes('Loud-Eyes-Test'),
      "dead proposer's proposal not campaigned in the debate");
    check('living-still-debates', text.includes('Grim-Howler-Test') || /nobody agrees|your vote/i.test(text),
      'living debate continues');
  }
  // the proposals map itself is untouched — votes stand
  check('proposals-intact', e.proposals[dead] === 'Loud-Eyes-Test' && e.proposals[living] === 'Grim-Howler-Test',
    'vote count unchanged by the rendering fix');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
