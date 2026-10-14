#!/usr/bin/env node
// Proof: journey landing r12 — week-1 trust ledger attribution + journal name line.
// RED on pristine HEAD (8 reasonless call sites + the "learned Ming's name (Ming)" stutter).
// GREEN after fix (all week-1 trust bumps carry reasons; line reads "learned their name (Ming).").
//
// Runs 3 seeds x 14 days of competent play via sim-harness, then:
//   (1) asserts ZERO tele 'trust' events with missing/'?' reason
//   (2) drives a real revealName and asserts the journal line has no name-stutter
const path = require('path');
const ROOT = '/home/hatch/workspace/worktrees/journey-landing';
const { loadGame, setupGame, driveFights, driveContests } = require(ROOT + '/scripts/sim-harness');
const { competent } = require(ROOT + '/scripts/policies/competent');

const SEEDS = [31, 32, 33];
let failures = [];
function fail(msg) { failures.push(msg); console.log('FAIL: ' + msg); }
function ok(msg) { console.log('ok: ' + msg); }

async function simDays(seed) {
  const lg = await loadGame({ seed, fullTelemetry: true });
  const Game = lg.Game;
  Game.genDetail = function () { return {}; };
  await setupGame(Game);
  const ctx = { policyId: 'proof-trust-ledger' };
  let loop = 0;
  const day0 = (Game.state.scholar || {}).day || 0;
  while (!Game.over && loop++ < 80) {
    const gd = (Game.state.scholar || {}).day || 0;
    if (gd >= day0 + 14) break;
    for (let p = 0; p < 3; p++) {
      competent.upkeep(Game, ctx); driveFights(Game, competent, ctx); driveContests(Game, competent, ctx);
      if (Game.over) break;
      Game.doAction('wait'); driveFights(Game, competent, ctx); driveContests(Game, competent, ctx);
      if (Game.over) break;
    }
    if (Game.over) break;
    competent.daily(Game, ctx); driveFights(Game, competent, ctx); driveContests(Game, competent, ctx);
    try { Game.sleep(); } catch (e) {}
  }
  return Game;
}

async function main() {
  // (1) trust ledger attribution across 3 seeds
  let totalTrust = 0, reasonless = [];
  for (const seed of SEEDS) {
    const Game = await simDays(seed);
    const events = (Game.state.telemetry || []).filter(e => e && e.type === 'trust');
    totalTrust += events.length;
    for (const e of events) {
      if (!e.reason || e.reason === '?') {
        reasonless.push({ seed, day: e.day, who: e.who, delta: e.delta });
      }
    }
  }
  if (reasonless.length === 0) ok(`(1) ${totalTrust} trust events across ${SEEDS.length} seeds, zero reasonless`);
  else fail(`(1) ${reasonless.length}/${totalTrust} trust events reasonless: ` + JSON.stringify(reasonless.slice(0, 8)));

  // (2) journal name-learn line: no stutter
  const lg = await loadGame({ seed: 31, fullTelemetry: true });
  const Game = lg.Game;
  Game.genDetail = function () { return {}; };
  await setupGame(Game);
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const vid = roster[0];
  // ensure the name is not yet known and journal has no entry for them
  try { delete (Game.state.village.knownNames || {})[vid]; } catch (e) {}
  try { delete ((Game.state.codex || {}).people || {})[vid]; } catch (e) {}
  const said = [];
  const _say = Game.say.bind(Game);
  Game.say = function (s) { said.push(String(s)); return _say(s); };
  Game.revealName(vid, 'intro');
  const journalLines = said.filter(s => s.includes('📓'));
  if (!journalLines.length) {
    fail('(2) no journal line fired on revealName');
  } else {
    const line = journalLines[journalLines.length - 1];
    console.log('    journal line: ' + line.slice(0, 120));
    if (/learned \S+'s name \([^)]+\)/.test(line)) fail(`(2) name stutter still present: ${line.slice(0, 100)}`);
    else if (/learned their name \(.+\)\./.test(line)) ok('(2) journal line clean: "learned their name (X)."');
    else fail(`(2) unexpected journal line shape: ${line.slice(0, 100)}`);
  }

  if (failures.length) { console.log(`\nPROOF RESULT: ${failures.length} FAILURES`); process.exit(1); }
  console.log('\nPROOF RESULT: ALL GREEN');
}

main().catch(e => { console.error('PROOF ERROR', e); process.exit(2); });
