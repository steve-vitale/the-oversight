#!/usr/bin/env node
// PROOF TEST: gavel confess fires ONCE per trial (sim-gavelconfess-a, 2026-10-25).
// Bug (sim-scale-onramp-round-1531 side audit): villagerTrickAction's gavel
// gate checked only an active trial, never the fired flag rec.trickConfess,
// so a trial stretched by a stunned/skipped verdict round confessed again
// (another rec.trickConfess=1, another state.gavelConfessions increment,
// another "confesses first" line) for the same trial. Neighbour gates do
// read their flags (callback: !rec.trickMourned, ad_break:
// !rec.trickUnwatched) — gavel was the outlier.
// Scenarios (SEED env, default 1):
//   S1 fired-flag refusal: trial active + rec.trickConfess=1 -> NOT confess.
//   S2 first confess: trial active + rec.trickConfess=0 -> confess.
//   S3 new trial after a consumed verdict: verdict halves damage AND clears
//      the flag, then the gate offers confess again for the NEW trial
//      (per-trial gate, not a per-fight lockout).
//   P  player gate in real tactical fights: first confess succeeds and
//      the verdict falls lighter; in a second live trial with the
//      confessed flag staged, the repeat attempt is refused with
//      "You already confessed." (Live flow alone cannot reach the flag:
//      the first confess spends the turn and the verdict clears the
//      trial — so the flag is staged to isolate the refusal.)
//   V  verdict math anchor: plain verdict vs confessed verdict on the
//      deterministic lroll (r)=>r[0] anchor — confessed is exactly half.
// Before the fix S1 goes RED (gate returns confess with the flag set).
// After the fix all scenarios go GREEN and S2/S3/V/P are unchanged.
// Sim-harness rules: seeded BEFORE eval (harness), full src/js list via
// the harness, no Game.save stub. Writes nothing into the repo.
'use strict';
const H = require('./sim-harness.js');
const SEED = parseInt(process.env.SEED || '1', 10);

let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
};
function mkrec() { return { log: [], trickLog: [], mDealt: 0, vTaken: 0 }; }

(async () => {
  const { Game, loadFails } = await H.loadGame({ seed: SEED });
  if (loadFails.length) console.log('LOAD FAILS:', loadFails.join('; '));
  await H.setupGame(Game);
  console.log('== GAVEL-CONFESS-ONCE PROOF, SEED ' + SEED + ' ==');

  const gavelDef = (Game.data.monsters || []).find(m => m.id === 'gavel');
  ok('gavel monster def exists', !!gavelDef);
  Game.state.villagerTricks = Game.state.villagerTricks || {};
  Game.state.villagerTricks.gavel = true;

  function gate(rec, round) {
    const members = [{ sigG: { trial: { crime: 'COUNT ONE' } }, sigR: {} }];
    return Game.villagerTrickAction('player', gavelDef,
      { round: round || 2, vHp: 100, vHpMax: 100, lead: { hp: 50 }, rec: rec, vp: {}, members: members });
  }

  // ---- S2 first (baseline behaviour, must survive the fix) ----
  console.log('-- S2 first confess --');
  const recFirst = mkrec();
  const first = gate(recFirst, 2);
  ok('S2: first confess offered', first && first.type === 'confess' && first.why === 'gavel-confess',
    JSON.stringify(first));

  // ---- S1 the bug: flag already fired in this trial ----
  console.log('-- S1 repeat confess, flag fired --');
  const recFired = mkrec();
  recFired.trickConfess = 1;
  const repeat = gate(recFired, 3);
  ok('S1: repeat confess refused while flag fired', !repeat || repeat.type !== 'confess',
    'gate returned ' + JSON.stringify(repeat));

  // ---- V verdict math + flag consumption (real sigFieldMonster) ----
  console.log('-- V verdict halves + consumes flag --');
  const lroll = (r) => r[0];
  const plainMember = { sigG: { trial: { crime: 'COUNT ONE' }, cool: 0 } };
  const plainRec = mkrec(); const plainCtx = { vHp: 500, wb: 5 };
  Game.sigFieldMonster(gavelDef, plainMember, plainCtx,
    { vid: 'v_1', vName: 'Yara', mName: 'Gavel', round: 5, RR: Math.random, lroll: lroll }, plainRec);
  const plainDmg = 500 - plainCtx.vHp;
  const confMember = { sigG: { trial: { crime: 'COUNT ONE' }, cool: 0 } };
  const confRec = mkrec(); confRec.trickConfess = 1;
  const confCtx = { vHp: 500, wb: 5 };
  Game.sigFieldMonster(gavelDef, confMember, confCtx,
    { vid: 'v_1', vName: 'Yara', mName: 'Gavel', round: 5, RR: Math.random, lroll: lroll }, confRec);
  const confDmg = 500 - confCtx.vHp;
  ok('V: confessed verdict is half the plain verdict', confDmg === Math.floor(plainDmg / 2),
    'plain=' + plainDmg + ' confessed=' + confDmg);
  ok('V: verdict consumes the flag', confRec.trickConfess === 0, 'flag=' + confRec.trickConfess);
  ok('V: trial clears after the verdict', !confMember.sigG.trial);
  ok('V: lighter-verdict line narrated', confRec.log.join(' ').includes('LIGHTER'));

  // ---- S3 new trial after a consumed verdict ----
  console.log('-- S3 new trial after consumed verdict --');
  const again = gate(confRec, 6);
  ok('S3: confess offered again for a NEW trial', again && again.type === 'confess',
    JSON.stringify(again));

  // ---- P player gate in real tactical fights ----
  // NOTE (why two fights): a live first confess spends the turn and the
  // monster's verdict then clears the trial, so a live second attempt
  // can never reach the confessed flag — the player path cannot
  // double-confess in live flow. Fight B therefore stages exactly the
  // flag the gate reads (trial.confessed = true) inside a fresh live
  // trial, isolating the refusal the gate exists to give.
  console.log('-- P player path, real fights --');
  Game.fireCrisis = () => {};
  const said = [];
  Game.say = (t) => { said.push(String(t)); };
  const scholar = Game.state.scholar;
  scholar.health = 9000; scholar.mx = 4; scholar.my = 4;
  scholar.equipped = { melee: { itemId: 'fire_hardened_spear', name: 'spear' } };
  Game.recordMoment('Stole extra rations from the pantry.');
  const gavelOf = () => Game.tbfight && Game.tbfight.fighters.find(x => x.mdef && x.mdef.id === 'gavel');
  function endTurn() {
    if (!Game.tbfight || Game.tbfight.over) return;
    if (!Game.tbIsPlayerTurn()) return;
    const p = Game.tbFighter('p');
    if (!p) return;
    p.moveLeft = 0; p.acted = true;
    Game.tbAfterPlayerAction();
  }
  function driveToTrial() {
    let guard = 0, m = gavelOf();
    while (Game.tbfight && !Game.tbfight.over && guard++ < 20 && !(m && m.sigG && m.sigG.trial)) {
      if (Game.tbIsPlayerTurn()) { const mm = gavelOf(); if (mm) Game.tbPlayerStrike(mm.key); }
      endTurn();
      m = gavelOf();
    }
    return m;
  }
  // Fight A: first confess succeeds, verdict falls lighter.
  Game.startCombat('gavel');
  let m = driveToTrial();
  ok('P: trial opens in a real fight', !!(m && m.sigG && m.sigG.trial));
  let firstOk = false, firstLine = false, lighterLine = false;
  if (Game.tbIsPlayerTurn() && m && m.sigG && m.sigG.trial) {
    said.length = 0;
    firstOk = Game.tbPlayerGavelConfess();
    firstLine = said.some(t => /confess first/i.test(t));
    lighterLine = said.some(t => /falls lighter/i.test(t));
  }
  ok('P: first confess succeeds', firstOk === true);
  ok('P: first confess narrated', firstLine, said.join(' | ').slice(0, 200));
  ok('P: verdict falls lighter after confess', lighterLine, said.join(' | ').slice(0, 300));
  if (Game.tbfight) { Game.tbfight.over = true; Game.tbfight.result = 'abandoned'; }
  // Fight B: staged confessed flag inside a fresh live trial.
  scholar.health = 9000; scholar.mx = 4; scholar.my = 4;
  Game.startCombat('gavel');
  m = driveToTrial();
  ok('P: second trial opens', !!(m && m.sigG && m.sigG.trial));
  let secondOk = null, refusalLine = false;
  if (Game.tbIsPlayerTurn() && m && m.sigG && m.sigG.trial) {
    m.sigG.trial.confessed = true;
    said.length = 0;
    secondOk = Game.tbPlayerGavelConfess();
    refusalLine = said.some(t => /already confessed/i.test(t));
  }
  ok('P: second confess in the same trial refused', secondOk === false, 'returned ' + secondOk);
  ok('P: refusal reads as a ruling, not a system error', refusalLine, said.join(' | ').slice(0, 200));
  if (Game.tbfight) { Game.tbfight.over = true; Game.tbfight.result = 'abandoned'; }

  console.log('== RESULT seed=' + SEED + ' pass=' + pass + ' fail=' + fail + ' ==');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.log('CRASH: ' + (e && e.stack || e)); process.exit(2); });
