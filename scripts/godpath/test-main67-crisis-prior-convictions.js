#!/usr/bin/env node
// test-crisis-prior-convictions-20261019.js — CRISIS LEG r29 (lane B).
//
// Blank 1: the moot is amnesiac about its own verdicts. initPlayerCaseBelief
// and initBelief seed every case at the same base no matter how many times
// the accused was already convicted — seed 42's six-time murderer skated
// five trials (avgBelief -4.14 / +2.43, never under the -5 exile bar).
// Fix: countPriorConvictions — each resolved weregild for the same charge
// (or same violence class) seeds belief -15 colder ("convicted and still
// doing it"). Acquittals don't count; schism/cold_war aren't convictions.
//
// Blank 2: the moot accusation line was a single template, repeated verbatim
// across back-to-back moots (seed 42: four identical "stands up at the fire,
// pointing" lines). Fix: three accusation openers, picked per case.
//
// RED on pristine: the belief deltas are 0 and all accusation lines identical.
// GREEN after fix: deltas are -15 per prior; accusation lines vary.
// Usage: node scripts/test-crisis-prior-convictions-20261019.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('../sim-harness');

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; } else { fail++; console.error('FAIL: ' + msg); } };
const E = (s) => console.error(s);

function avgBeliefOf(Game, c) {
  try { return Game.avgBelief(c); } catch (e) { return null; }
}
function mkPlayerCase(Game, accuser, charge) {
  return { id: 't_' + Math.floor(Math.random() * 1e9), charge: charge || 'murder', accuser, accused: [Game.villagerId], belief: {} };
}

(async () => {
  const { Game } = await loadGame({ seed: 7, mode: 'prior-convictions' });
  await setupGame(Game);
  const me = Game.villagerId;
  const npcs = Game.npcIds().filter(id => id !== me);
  const accuser = npcs[0];
  const bs = Game.betrayalState();

  E('== Part A: player lane — prior convictions weigh the case ==');
  // baseline: no priors
  const c0 = mkPlayerCase(Game, accuser, 'murder');
  Game.initPlayerCaseBelief(c0);
  const base = avgBeliefOf(Game, c0);
  E('  baseline avgBelief (murder, no priors): ' + base);
  ok(typeof base === 'number', 'A0 baseline belief is a number');

  // stage one resolved weregild murder conviction against the player
  bs.cases.push({ id: 'case_prior1', charge: 'murder', accused: [me], status: 'resolved', resolution: 'weregild' });
  const c1 = mkPlayerCase(Game, accuser, 'murder');
  Game.initPlayerCaseBelief(c1);
  const one = avgBeliefOf(Game, c1);
  E('  avgBelief with 1 prior murder weregild: ' + one + ' (delta ' + (one - base) + ')');
  ok(Math.abs((one - base) - (-15)) < 0.6, 'A1 one prior conviction: delta -15 (got ' + (one - base).toFixed(2) + ')');

  // second prior -> -30 total
  bs.cases.push({ id: 'case_prior2', charge: 'murder', accused: [me], status: 'resolved', resolution: 'weregild' });
  const c2 = mkPlayerCase(Game, accuser, 'murder');
  Game.initPlayerCaseBelief(c2);
  const two = avgBeliefOf(Game, c2);
  E('  avgBelief with 2 priors: ' + two + ' (delta ' + (two - base) + ')');
  ok(Math.abs((two - base) - (-30)) < 0.6, 'A2 two priors: delta -30 (got ' + (two - base).toFixed(2) + ')');

  // an acquittal doesn't count
  bs.cases.push({ id: 'case_acq', charge: 'murder', accused: [me], status: 'resolved', resolution: 'acquitted' });
  const c3 = mkPlayerCase(Game, accuser, 'murder');
  Game.initPlayerCaseBelief(c3);
  const three = avgBeliefOf(Game, c3);
  ok(Math.abs(three - two) < 0.01, 'A3 acquittal adds nothing (delta ' + (three - two).toFixed(2) + ')');

  // a theft weregild doesn't chill a murder case (different class)
  bs.cases.push({ id: 'case_theft', charge: 'theft', accused: [me], status: 'resolved', resolution: 'weregild' });
  const c4 = mkPlayerCase(Game, accuser, 'murder');
  Game.initPlayerCaseBelief(c4);
  const four = avgBeliefOf(Game, c4);
  ok(Math.abs(four - two) < 0.01, 'A4 theft prior does not chill murder case (delta ' + (four - two).toFixed(2) + ')');

  // violence-class crossover: an assault weregild DOES chill a murder case
  bs.cases.push({ id: 'case_assault', charge: 'assault', accused: [me], status: 'resolved', resolution: 'weregild' });
  const c5 = mkPlayerCase(Game, accuser, 'murder');
  Game.initPlayerCaseBelief(c5);
  const five = avgBeliefOf(Game, c5);
  ok(Math.abs((five - two) - (-15)) < 0.6, 'A5 assault prior chills murder case: delta -15 (got ' + (five - two).toFixed(2) + ')');

  // open (unresolved) cases don't count
  bs.cases.push({ id: 'case_open', charge: 'murder', accused: [me], status: 'open', resolution: null });
  const c6 = mkPlayerCase(Game, accuser, 'murder');
  Game.initPlayerCaseBelief(c6);
  const six = avgBeliefOf(Game, c6);
  ok(Math.abs(six - five) < 0.01, 'A6 open case adds nothing (delta ' + (six - five).toFixed(2) + ')');

  E('== Part B: NPC lane — initBelief remembers too ==');
  const npcA = npcs[1], npcB = npcs[2];
  const mkNpcCase = () => ({ id: 'n_' + Math.floor(Math.random() * 1e9), plotId: null, charge: 'murder', accused: [npcA], target: me, belief: {} });
  const n0 = mkNpcCase();
  Game.initBelief(n0);
  const nbase = avgBeliefOf(Game, n0);
  E('  NPC baseline avgBelief: ' + nbase);
  bs.cases.push({ id: 'case_npc1', charge: 'murder', accused: [npcA], status: 'resolved', resolution: 'weregild' });
  const n1 = mkNpcCase();
  Game.initBelief(n1);
  const none_ = avgBeliefOf(Game, n1);
  E('  NPC avgBelief with 1 prior: ' + none_ + ' (delta ' + (none_ - nbase) + ')');
  ok(Math.abs((none_ - nbase) - (-15)) < 0.6, 'B1 NPC prior conviction: delta -15 (got ' + (none_ - nbase).toFixed(2) + ')');
  // a different NPC's record doesn't chill this accused
  bs.cases.push({ id: 'case_npc2', charge: 'murder', accused: [npcB], status: 'resolved', resolution: 'weregild' });
  const n2 = mkNpcCase();
  Game.initBelief(n2);
  const ntwo = avgBeliefOf(Game, n2);
  ok(Math.abs(ntwo - none_) < 0.01, 'B2 other NPC record does not chill (delta ' + (ntwo - none_).toFixed(2) + ')');

  E('== Part C: accusation openers vary ==');
  const said = [];
  const _say = Game.say.bind(Game);
  Game.say = function (t) { said.push(String(t)); return _say(t); };
  const accOpeners = [];
  // same accuser every time, compare only the opener (before "Heads turn"):
  // mootIn varies 2-3 days even on pristine, so the tail can't discriminate.
  for (let i = 0; i < 6; i++) {
    said.length = 0;
    try { Game.openPlayerCase(accuser, 'murder', [], false); } catch (e) { E('  openPlayerCase threw: ' + e.message); }
    const hit = said.find(t => /Heads turn/.test(t));
    if (hit) accOpeners.push(hit.split('Heads turn')[0]);
  }
  Game.say = _say;
  const distinct = new Set(accOpeners).size;
  E('  accusation openers captured: ' + accOpeners.length + ', distinct: ' + distinct);
  accOpeners.slice(0, 3).forEach((l, i) => E('  [' + i + '] ' + l.slice(0, 100) + '...'));
  ok(accOpeners.length >= 5, 'C1 captured accusation openers (' + accOpeners.length + ')');
  ok(distinct >= 2, 'C2 accusation openers vary (distinct=' + distinct + ', need >=2)');
  // C3 (sense): the murder chargeLine already says "said plain" — no variant
  // may repeat it (was: "...said plain. Said plain, in front of everyone.").
  const dupSaid = accOpeners.filter(l => /said plain/i.test(l) && (l.match(/said plain/gi) || []).length > 1);
  ok(dupSaid.length === 0, 'C3 no "said plain" duplication in murder openers' +
    (dupSaid.length ? ' (got: ' + dupSaid[0].slice(0, 80) + '...)' : ''));

  E(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
