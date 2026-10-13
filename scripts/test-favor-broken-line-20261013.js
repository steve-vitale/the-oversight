#!/usr/bin/env node
// Proof: the broken-favor resolution line names the task in the NPC's own
// short form and gives them a reaction — no double silence.
// BUG (journey establishment 2026-10-13): checkPromises' broken branch said
//   "Maricela doesn't say anything. But about \"help Maricela with their
//    injury\" — silence. Promises rot. (-15 trust)"
// — "doesn't say anything" + "— silence" in one breath, and the ledger's
// third-person favorTask instead of the NPC-voiced short ("this wound").
// FIX: "Maricela won't meet your eye. You said you'd help with this wound —
//   and it never happened. Promises rot. (-15 trust)"
//
// RED (before fix): line contains "doesn't say anything" and "silence",
//   and names the third-person favorTask.
// GREEN (after fix): line uses favor.short, no double silence.
//
// Usage: node scripts/test-favor-broken-line-20261013.js
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const lg = await loadGame({ seed: 4242 });
  const Game = lg.Game;
  Game.genDetail = function () { return {}; };
  await setupGame(Game);
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  if (!roster.length) { console.log('FAIL: empty roster'); process.exit(2); }
  const vid = roster[0];
  const day = (Game.state.scholar || {}).day || 1;

  // Plant a promised favor with a short form + a stale promise entry, then
  // run checkPromises with a non-matching kind so the deadline path fires.
  const favor = {
    id: 'favor-test-1', vid, kind: 'injury',
    task: 'help Testy with their injury', short: 'this wound',
    state: 'promised', askedDay: day,
  };
  try { Game.convoStoreFavor(favor); } catch (e) { console.log('FAIL: convoStoreFavor missing: ' + e.message); process.exit(2); }
  v.promises = v.promises || {};
  v.promises[vid] = {
    favorId: favor.id, favorTask: favor.task, favorDeadline: day - 1, // already expired
    day: day - 5, goal: 'heal', kept: false,
  };
  const said = [];
  const _say = Game.say.bind(Game);
  Game.say = function (s) { said.push(String(s)); return _say(s); };
  try { Game.checkPromises('__no_such_kind__', vid, {}); } catch (e) { console.log('FAIL: checkPromises threw: ' + e.message); process.exit(2); }
  const line = said.find(s => /Promises rot/.test(s));
  console.log('line: ' + (line || '(none)'));
  let ok = true;
  const checks = [
    ['line fired', !!line],
    ['uses the NPC-voiced short form', !!line && /this wound/.test(line)],
    ['no third-person ledger task', !!line && !/help Testy with their injury/.test(line)],
    ['no double silence', !!line && !(/doesn.t say anything/i.test(line) && /— silence/.test(line))],
    ['names the consequence', !!line && /-15 trust/.test(line)],
  ];
  for (const [name, pass] of checks) { console.log((pass ? '  ok  ' : '  FAIL') + ' ' + name); if (!pass) ok = false; }
  console.log(ok ? 'PASS' : 'FAIL');
  process.exit(ok ? 0 : 1);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
