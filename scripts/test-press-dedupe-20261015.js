#!/usr/bin/env node
// test-press-dedupe-20261015.js — journey establishment r5.
//
// QUESTION (r5 people-check): the betrayal menu offered two IDENTICAL press
// options — [betrayal:press:case_9:vid] and [betrayal:press:case_11:vid],
// both labeled "Walk me through that night again. Slowly. (press Anh)" —
// when the same villager is accused in two open cases. The player cannot
// tell them apart (transcript-caught: Anh d25 s124, Klymentiy d31 s124).
//
// RED: two open cases accusing the same villager produce two press options
// with identical labels. GREEN: the labels name the charge, so each option
// is distinguishable ("(press Anh — the theft case)").
//
// Canon: docs/CONVERSATIONS.md. Steve's bar: no static menus — every
// option must make contextual sense.
//
// Run: node scripts/test-press-dedupe-20261015.js
//      SEED=61 node scripts/test-press-dedupe-20261015.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const SEEDS = (process.env.SEED ? [parseInt(process.env.SEED, 10)] : [61, 82, 103]);

let pass = 0, fail = 0;
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

async function runSeed(seed) {
  console.log(`\n### seed ${seed}`);
  const { Game } = await loadGame({ seed });
  await setupGame(Game);

  const vid = (Game.state.village.roster || []).find(id => id !== Game.villagerId);
  ok(!!vid, 'fixture: villager found');

  // two open cases, same accused, different charges
  const bs = Game.betrayalState();
  bs.cases = [];
  bs.seq = 0;
  for (const charge of ['theft', 'assault']) {
    bs.seq++;
    bs.cases.push({
      id: 'case_' + bs.seq, plotId: 'plot_test', charge,
      day: 1, accused: [vid], target: 'someone_else', weakest: vid,
      belief: {}, evidence: [], bribes: [], exposedBribes: [],
      inconsistencies: [{ found: false, claims: { [vid]: true } }],
      status: 'open', flipped: null, knownToPlayer: true, playerRole: 'bystander',
    });
  }

  let menu = [];
  try { menu = Game.betrayalChoices ? Game.betrayalChoices(vid) : []; }
  catch (e) {
    // menu builder entry point may differ; fall back to convoChoices
    try {
      Game.talkTo(vid);
      menu = Game.convoChoices(vid) || [];
      Game.endConvo(vid, 'left');
    } catch (e2) { console.log('menu build threw: ' + e2.message); }
  }
  const presses = menu.filter(o => String(o.id).startsWith('betrayal:press:'));
  console.log('  press options: ' + JSON.stringify(presses.map(o => o.id + ' :: ' + o.label)));
  ok(presses.length === 2, 'two press options offered (one per case)', `got ${presses.length}`);
  const labels = presses.map(o => String(o.label));
  const distinct = new Set(labels).size === labels.length;
  ok(distinct, 'press labels are distinguishable by charge',
    `labels: ${JSON.stringify(labels)}`);
  ok(labels.every(l => /theft|assault/i.test(l)), 'each press label names its charge');
}

(async () => {
  for (const s of SEEDS) await runSeed(s);
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
