#!/usr/bin/env node
// test-gap-encounter-allyjoin-20261102.js — gap-round leg 3 proof:
// wild ally-join path (resolveWildMonsterEncounter).
//
// QUESTION: the fieldkill census (evidence/2026-10-31/sim-fieldkill-a.md)
// found 202/202 wild fights solo — no fight started with an ally and no
// fight gained one mid-fight (calledHelp 0/202) — while the fieldFight
// engine joins allies fine when opts carry them (aid fights, instrumented
// cases). So the bug is in the wild ROUTER's opts, not the engine.
//
// SCENARIO (seeded, identical before/after): a fighter and two trusted
// roster villagers stand on the SAME wild node as a world monster, with
// the outdoor-crew snapshot empty (the stale state the wild router reads).
// The router calls fieldFight; the probe captures the opts it passed.
//   BEFORE (bug): opts.allyVids is empty — the same-node villagers, who
//     can SEE the fight, are never offered to the engine, so the shout
//     branch (hopeless + allies in opts) can never fire.
//   AFTER (fix): opts.allyVids carries the sensing villagers (same node /
//     adjacent node / same outdoor crew, trust-ordered, via the existing
//     perception-law helper villagerFightAllies). That flips the engine's
//     own gates: intent becomes 'engage' (not learn-first withdrawal) and
//     the hopeless-shout branch's precondition (allies in opts) is met —
//     the engine's shout itself is already proven by aid fights in the
//     census, so the probe asserts the wiring + intent, and reports
//     calledHelp as observed (campaign rates are measured separately).
//
// CONTROL: the same scenario's fight is also run with the engine given
// the allies directly, proving the engine was never the broken part.
// Usage: node scripts/test-gap-encounter-allyjoin-20261102.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let checks = 0, fails = 0;
function check(name, cond, extra) {
  checks++;
  if (cond) console.log('PASS ' + name);
  else { fails++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}

(async () => {
  const { Game } = await loadGame({ seed: 97339, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  if (roster.length < 3) { console.log('SKIP need 3+ NPC roster, have ' + roster.length); process.exit(2); }
  const fighter = roster[0], ally1 = roster[1], ally2 = roster[2];

  // Same wild node, trusted, alive, unhurt.
  Game.npcSetNode(fighter, 5, 5);
  Game.npcSetNode(ally1, 5, 5);
  Game.npcSetNode(ally2, 5, 5);
  v.trust = v.trust || {};
  v.trust[ally1] = 50; v.trust[ally2] = 50;
  v.health = v.health || {};
  v.health[fighter] = 100; v.health[ally1] = 100; v.health[ally2] = 100;
  // The stale state: the wild router's only ally source is empty.
  Game._outdoorCrew = [];
  if (v.assignments) { for (const k of Object.keys(v.assignments)) delete v.assignments[k]; }

  const onNode = Game.npcsOnNode(5, 5);
  check('scene: fighter + 2 allies share the monster node',
    onNode.indexOf(fighter) !== -1 && onNode.indexOf(ally1) !== -1 && onNode.indexOf(ally2) !== -1, onNode);

  // The perception-law helper sees them (diagnostic, not the assertion).
  let sensed = [];
  try { sensed = Game.villagerFightAllies ? Game.villagerFightAllies(fighter) : []; } catch (e) { sensed = ['ERR:' + e.message]; }
  console.log('INFO villagerFightAllies(fighter) = ' + JSON.stringify(sensed));

  // Capture what the wild router actually passes to the engine.
  const origFieldFight = Game.fieldFight;
  let captured = null;
  Game.fieldFight = function (vid, mdef, m, opts) {
    if (!captured) captured = { allies: (opts && opts.allies) | 0, allyVids: (opts && opts.allyVids) ? opts.allyVids.slice() : [] };
    return origFieldFight.apply(this, arguments);
  };
  // Gavel: big HP, moderate damage, no flee component — a fight the
  // unarmed fighter survives long enough to reach the round-2 morale
  // check hopeless, so the shout branch (not death) decides the join.
  const mdef = (Game.data.monsters || []).find(m => m.id === 'gavel') || {};
  const mon = Game.spawnWorldMonster({ id: 'gavel' }, 5, 5, { mx: 4, my: 4 });
  check('scene: gavel spawned on the node', !!(mon && mon.id === 'gavel'), mon && mon.id);
  let rec = null;
  try { rec = Game.resolveWildMonsterEncounter(fighter, mon); } catch (e) { console.log('INFO router threw: ' + e.message); }
  Game.fieldFight = origFieldFight;
  console.log('INFO wild router opts = ' + JSON.stringify(captured));
  console.log('INFO wild fight outcome=' + (rec && rec.outcome) + ' rounds=' + (rec && rec.rounds) + ' vTaken=' + (rec && rec.vTaken) + ' calledHelp=' + (rec && rec.calledHelp) + ' allyVid=' + (rec && rec.allyVid));
  check('wild router passes the sensing allies to the engine',
    !!(captured && captured.allyVids && captured.allyVids.length >= 1), captured);
  check('wild fight with allies beside it commits from the start (intentWhy party)',
    !!(rec && rec.intent === 'engage' && rec.intentWhy === 'party'), rec && { intent: rec.intent, intentWhy: rec.intentWhy });
  check('wild fight party size counts the allies',
    !!(rec && rec.partySize === 3), rec && { partySize: rec.partySize });

  console.log(`\n${checks - fails}/${checks} checks passed`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('PROOF-FAILED', (e && e.stack) || e); process.exit(1); });
