#!/usr/bin/env node
// test-titan-refusal-have-counts-haven-20261119.js — proof for the
// journey-deepening r243 F2 fix (r238-owed).
//
// THE DEFECT (r238 F2): the titan fight wrapper's refusal counted ALLIED
// blades only — `muster.allies.length`, raw, duplicates and the dead
// included, Haven excluded — while the hard gate counts unique living
// allies + committed Haven blades. On r238 seeds 104806/104807 the line
// said "you have 6" on 14 refusals each while the muster genuinely stood
// at 9 (6 allies + 3 Haven). A player counting 9 blades hears 6 — the
// spoken number contradicts the world, and the muster decision it informs
// is made on a lie.
//
// THE FIX (src/js/titans.js): one shared helper, titanMusterBladeCount,
// read by BOTH the hard gate (titanMusterReady) and the refusal's spoken
// `have` (and the recorded outcome detail). The gate and the line cannot
// drift again.
//
// RED (before): a 6-ally + 3-Haven muster is refused with "you have 6".
// GREEN (after): the same muster is refused with "you have 9"; the
// recorded outcome detail agrees (have 9, need 10); a duplicate ally
// entry does not inflate the count; with no Haven blades the line still
// says the true ally count; at 10 blades the gate reads ready.
//
// Usage: node scripts/test-titan-refusal-have-counts-haven-20261119.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; console.log('  FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}
function haveOf(line) {
  const m = /\(you have (\d+)\)/.exec(line || '');
  return m ? parseInt(m[1], 10) : null;
}

async function main() {
  const { Game } = await loadGame({ seed: 105099, mode: 'refusal-have-counts-haven-proof' });
  await setupGame(Game);

  const said = [];
  const osay = Game.say;
  Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return osay.call(this, t); };
  const refusalLines = () => said.filter(t => /cannot face this alone/i.test(t));
  const refusedOutcomes = () => (((Game.state || {}).titans || {}).outcomes || [])
    .filter(o => o && o.outcome === 'refused' && o.titan === 'herald');

  // Stage the muster: allies live in linked villages (no link records in
  // this harness game, so _otherVillage returns nothing and the liveness
  // filter keeps them); Haven blades must sit on the Haven roster and
  // must not be the scholar (titanHavenBlades excludes the scholar).
  const st = (Game.state.titans = Game.state.titans || { omens: {}, musters: {}, slain: {}, cast: null });
  st.musters = st.musters || {};
  const roster = ((Game.state.village = Game.state.village || {}).roster = (Game.state.village || {}).roster || []);
  ['hv-1', 'hv-2', 'hv-3'].forEach(v => { if (roster.indexOf(v) < 0) roster.push(v); });
  check('scholar is not one of the staged Haven blades', ['hv-1', 'hv-2', 'hv-3'].indexOf(Game.villagerId) < 0);

  function stage(allies, haven) {
    st.musters.herald = { allies: allies, haven: haven };
  }
  const ally = (vid, extra) => Object.assign({ vid: vid, villageId: 'v-out-1' }, extra || {});
  const havenBlade = vid => ({ vid: vid });

  // ---- day 40: 6 unique allies + 3 Haven = 9 of 10 — refused, says 9 ----
  Game.state.scholar = Game.state.scholar || {};
  Game.state.scholar.day = 40;
  stage(['a1', 'a2', 'a3', 'a4', 'a5', 'a6'].map(v => ally(v)),
        ['hv-1', 'hv-2', 'hv-3'].map(havenBlade));
  check('gate control: 9-blade muster not ready', Game.titanMusterReady('herald') === false);
  const r1 = Game.startCombat('herald');
  check('6+3 refusal returns null (no fight)', r1 === null);
  check('6+3 refusal says the line once', refusalLines().length === 1, 'said=' + refusalLines().length);
  check('6+3 refusal says "you have 9"', haveOf(refusalLines()[0]) === 9, refusalLines()[0] || '(no line)');
  check('6+3 refusal records have 9 / need 10',
    refusedOutcomes().length === 1 && refusedOutcomes()[0].detail.have === 9 && refusedOutcomes()[0].detail.need === 10,
    JSON.stringify((refusedOutcomes()[0] || {}).detail));

  // ---- day 41: 6 allies + 0 Haven = 6 — control, no inflation ----
  Game.state.scholar.day = 41;
  stage(['a1', 'a2', 'a3', 'a4', 'a5', 'a6'].map(v => ally(v)), []);
  check('gate control: 6-blade muster not ready', Game.titanMusterReady('herald') === false);
  const r2 = Game.startCombat('herald');
  check('6+0 refusal returns null', r2 === null);
  check('6+0 refusal says "you have 6"', haveOf(refusalLines()[1]) === 6, refusalLines()[1] || '(no line)');
  check('6+0 refusal records have 6',
    refusedOutcomes().length === 2 && refusedOutcomes()[1].detail.have === 6,
    JSON.stringify((refusedOutcomes()[1] || {}).detail));

  // ---- day 42: 7 raw ally entries (1 duplicate) + 3 Haven = 9, not 10 ----
  Game.state.scholar.day = 42;
  stage(['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a1'].map(v => ally(v)),
        ['hv-1', 'hv-2', 'hv-3'].map(havenBlade));
  check('gate control: duplicate ally does not inflate the gate', Game.titanMusterReady('herald') === false);
  const r3 = Game.startCombat('herald');
  check('dup refusal returns null', r3 === null);
  check('dup refusal says "you have 9" (deduped)', haveOf(refusalLines()[2]) === 9, refusalLines()[2] || '(no line)');
  check('dup refusal records have 9',
    refusedOutcomes().length === 3 && refusedOutcomes()[2].detail.have === 9,
    JSON.stringify((refusedOutcomes()[2] || {}).detail));

  // ---- day 43: 7 unique allies + 3 Haven = 10 — the gate reads ready ----
  Game.state.scholar.day = 43;
  stage(['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7'].map(v => ally(v)),
        ['hv-1', 'hv-2', 'hv-3'].map(havenBlade));
  check('gate control: 10-blade muster IS ready', Game.titanMusterReady('herald') === true);
  // (No startCombat here: a ready muster starts a real blow-by-blow
  // fight. The gate agreement at the boundary is the helper itself —
  // the same count the refusal speaks.)

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
