#!/usr/bin/env node
// test-titan-refusal-once-a-day-20261117.js — proof for the journey-scale
// r233 refusal-spam fix (Q6a, r232-owed).
//
// THE DEFECT (r232 + r233): a scholar camped at a titan's lair without a
// ready muster is refused on EVERY meeting, and every refusal says the
// same "You cannot face this alone" line aloud. r232's 103307 logged 41
// 'refused' outcomes (10 distinct days); r233's 103402 logged 10 refused
// on ONE day — ten hearings of the same line in a single day.
//
// THE FIX (src/js/titans.js, titanWrapCombat muster hard gate): the line
// is said ONCE per titan per day (a per-titan last-spoken day in titan
// state, saved with the run). The 'refused' outcome is still recorded on
// EVERY refusal — the log stays honest for the census; only the spoken
// line is deduped. The campaign-gate refusal (finale march order) is
// untouched: it fires in a narrow window with a varying reason, not the
// repeated muster line.
//
// RED (before): the second refusal on the same day says the line again.
// GREEN (after): the line is said once per titan per day; outcomes keep
// counting; a new day re-arms the line; a different titan has its own day.
//
// Usage: node scripts/test-titan-refusal-once-a-day-20261117.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; console.log('  FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

async function main() {
  const { Game } = await loadGame({ seed: 103402, mode: 'refusal-once-a-day-proof' });
  await setupGame(Game);

  const said = [];
  const osay = Game.say;
  Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return osay.call(this, t); };
  const refusalLines = () => said.filter(t => /cannot face this alone/i.test(t));
  const refusedOutcomes = (titan) => (((Game.state || {}).titans || {}).outcomes || [])
    .filter(o => o && o.outcome === 'refused' && (!titan || o.titan === titan));

  // The scholar day drives the dedupe (titanOutcomeDay reads it).
  Game.state.scholar = Game.state.scholar || {};
  Game.state.scholar.day = 40;
  // No muster anywhere: every titan refuses on the hard gate.
  check('gate control: herald muster not ready', Game.titanMusterReady('herald') === false);
  check('gate control: finale muster not ready', Game.titanMusterReady('finale') === false);

  // ---- day 40, titan 'finale': three refusals, one hearing ----
  const r1 = Game.startCombat('finale');
  check('1st refusal returns null (no fight)', r1 === null);
  check('1st refusal says the line', refusalLines().length === 1, 'said=' + refusalLines().length);
  check('1st refusal records the outcome', refusedOutcomes('finale').length === 1);
  check('1st refusal names the muster requirement', /allied blades/i.test(refusalLines()[0] || ''));
  const r2 = Game.startCombat('finale');
  check('2nd refusal same day returns null', r2 === null);
  check('2nd refusal records the outcome (log stays honest)', refusedOutcomes('finale').length === 2);
  check('2nd refusal does NOT say the line again', refusalLines().length === 1, 'said=' + refusalLines().length);
  const r3 = Game.startCombat('finale');
  check('3rd refusal same day returns null', r3 === null);
  check('3rd refusal records the outcome', refusedOutcomes('finale').length === 3);
  check('3rd refusal still one hearing', refusalLines().length === 1, 'said=' + refusalLines().length);
  check('refusal detail carries gate + have/need', refusedOutcomes('finale').every(o => o.detail && o.detail.gate === 'muster' && typeof o.detail.have === 'number' && typeof o.detail.need === 'number'));

  // ---- day 41: the line re-arms for a new day ----
  Game.state.scholar.day = 41;
  const r4 = Game.startCombat('finale');
  check('next-day refusal returns null', r4 === null);
  check('next-day refusal says the line again (once for the new day)', refusalLines().length === 2, 'said=' + refusalLines().length);
  check('next-day refusal records the outcome', refusedOutcomes('finale').length === 4);

  // ---- day 41, a DIFFERENT titan: its own once-a-day hearing ----
  const r5 = Game.startCombat('herald');
  check('other-titan refusal returns null', r5 === null);
  check('other-titan refusal says its own line once', refusalLines().length === 3, 'said=' + refusalLines().length);
  check('other-titan line names the Herald', /THE HERALD/i.test(refusalLines()[2] || ''));
  check('other-titan refusal records the outcome', refusedOutcomes('herald').length === 1);
  const r6 = Game.startCombat('herald');
  check('other-titan 2nd refusal same day returns null', r6 === null);
  check('other-titan 2nd refusal does NOT repeat the line', refusalLines().length === 3, 'said=' + refusalLines().length);
  check('other-titan outcomes keep counting', refusedOutcomes('herald').length === 2);

  // ---- the state record: per-titan last-spoken day ----
  const saidDay = ((Game.state || {}).titans || {}).refusalSaidDay || {};
  check('state records finale last-spoken day 41', saidDay.finale === 41, JSON.stringify(saidDay));
  check('state records herald last-spoken day 41', saidDay.herald === 41, JSON.stringify(saidDay));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch(e => { console.error(e && e.stack || e); process.exit(1); });
