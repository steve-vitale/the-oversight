#!/usr/bin/env node
// test-crisis-deathoncam-20261018.js — CRISIS LEG r23: THE DEATH ON CAMERA.
//
// Two staged proofs through the REAL contest-death choke points:
//   (A) VILLAGER death in a televised contest: drive Game._contestDie with
//       ac.participant = villager (the real watch-path death function).
//       Asserts blood-on-air fires via _cxKillContestant -> fireCrisis, the
//       beat line names the dead, roster removal is real, gossip seeds.
//   (B) BEARER death in a televised contest: drive Game._contestDie with
//       ac.participant = 'player' -> playerDeath('contest') -> succession.
//       Records what registers publicly (currently blood-on-air does NOT
//       fire — deliberate 2026-10-10; open design question 2026-10-12).
//       Asserts succession completes: new bearer, fallen roll, lineage.
//
// Usage: node scripts/test-crisis-deathoncam-20261018.js
// Output: JSON record to stdout; narrative to stderr. Exit 0 iff all
// assertions hold on all seeds. Seeds: 7, 42, 99 (crisis-proof convention).
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const SEEDS = [7, 42, 99];
const E = (s) => console.error(s);

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; E(`  PASS ${label}`); }
  else { fail++; E(`  FAIL ${label}`); }
}

function captureNarrative(Game) {
  const lines = [];
  const origSay = Game.say, origSys = Game.sysSay;
  Game.say = function (t) { try { lines.push('SAY: ' + t); } catch (e) {} return origSay ? origSay.call(this, t) : undefined; };
  Game.sysSay = function (t) { try { lines.push('SYS: ' + t); } catch (e) {} return origSys ? origSys.call(this, t) : undefined; };
  return { lines, restore() { Game.say = origSay; Game.sysSay = origSys; } };
}

function crises(Game) {
  try { return (Game.progState() || {}).crises || {}; } catch (e) { return {}; }
}

function bloodContest(Game) {
  try {
    const pool = Game.contestPool() || [];
    return pool.find(c => c.cat === 'blood') || null;
  } catch (e) { return null; }
}

async function runSeed(seed) {
  E(`## seed ${seed}`);
  const { Game } = await loadGame({ seed, narration: true });
  await setupGame(Game);
  const rec = { seed };

  const contest = bloodContest(Game);
  ok(!!contest, `blood contest found (${contest ? contest.name : 'none'})`);
  if (!contest) { rec.skipped = true; return rec; }

  const vids = (Game.npcIds() || []).filter(id => id !== Game.villagerId);
  ok(vids.length > 0, 'roster has non-player villagers');
  if (!vids.length) { rec.skipped = true; return rec; }
  const vid = vids[0];
  const vname = (() => { try { return Game.displayName(vid); } catch (e) { return vid; } })();
  const vfirst = String(vname).split(' ')[0];

  // ---- (A) villager death on camera ----
  const capA = captureNarrative(Game);
  // Mirror fireContest's show memory (r17): the grab plants lastContest;
  // the watch-death then runs the real choke point.
  try {
    Game.state.village.lastContest = { day: (Game.state.scholar || {}).day || 1, name: contest.name || contest.id, ids: [vid], died: [] };
  } catch (e) {}
  let acA = { participant: vid, contestId: contest.id, phase: 'x', phaseIdx: 0, phases: [], _refused: false };
  let resA = null;
  try { resA = Game._contestDie(acA, 'the staged arena'); } catch (e) { E('  _contestDie(villager) threw: ' + e.message); }
  capA.restore();

  const crA = crises(Game);
  ok(crA['blood-on-air'] === true, 'blood-on-air recorded in pg.crises (villager)');
  const beatLine = capA.lines.find(l => l.indexOf('BLOOD ON AIR') >= 0);
  ok(!!beatLine, 'beat line surfaced in narrative (villager)');
  ok(!!beatLine && beatLine.indexOf(vfirst) >= 0, `beat line names the dead (${vfirst})`);
  let stillMember = true;
  try { stillMember = Game.isMember(vid); } catch (e) {}
  ok(!stillMember, 'dead villager actually left the roster');
  let gossipSeeded = false;
  try { gossipSeeded = (Game.state.village.gossip || []).some(g => g.action === 'contest_died' && (g.dims || {}).who === vid); } catch (e) {}
  ok(gossipSeeded, 'contest_died gossip seeded for the dead villager');
  // SHOW-DEATH (r23 fix): the show memory records the dead; the lately
  // event is death-aware; the rendered lines grieve the outcome.
  let diedRecorded = false;
  try { diedRecorded = (Game.state.village.lastContest.died || []).indexOf(vid) >= 0; } catch (e) {}
  ok(diedRecorded, 'lastContest.died records the dead villager');
  const listener = vids[1];
  let evShow = null;
  try { evShow = Game.t2LatelyEvent(listener); } catch (e) {}
  ok(!!evShow && evShow.kind === 'show', 'listener latelyKind = show');
  ok(!!evShow && (evShow.died || []).indexOf(vid) >= 0, 'show event carries died');
  let showLines = [];
  try { showLines = Game.t2gen_lately(listener) || []; } catch (e) {}
  const showText = showLines.join(' | ');
  ok(/didn't come home|is gone|Not everyone came home/.test(showText), 'show lines grieve the death');
  ok(!/Came back like nothing happened/.test(showText), 'no "came back" line for the dead');
  E('  SHOW LINES: ' + showText.slice(0, 220));
  rec.villager = { name: vname, crisis: !!crA['blood-on-air'], beatFired: !!beatLine, rosterRemoved: !stillMember, gossip: gossipSeeded, showDeath: diedRecorded };

  // ---- (B) bearer death on camera ----
  const oldId = Game.villagerId;
  const oldName = (() => { try { return Game.displayName(oldId); } catch (e) { return oldId; } })();
  const capB = captureNarrative(Game);
  let resB = null;
  try {
    const acB = { participant: 'player', contestId: contest.id, phase: 'x', phaseIdx: 0, phases: [], _refused: false };
    resB = Game._contestDie(acB, 'the staged arena');
  } catch (e) { E('  _contestDie(player) threw: ' + e.message); }
  capB.restore();

  const newId = Game.villagerId;
  ok(newId !== oldId, `succession completed (bearer ${String(oldId).slice(0, 8)} -> ${String(newId).slice(0, 8)})`);
  ok(!Game.over, 'run continues after bearer contest death (mantle passed)');
  const crB = crises(Game);
  rec.bearerBloodOnAir = !!crB['blood-on-air'];
  E(`  NOTE bearer-death-on-camera: blood-on-air fired = ${!!crB['blood-on-air']} (villager-only trigger, deliberate 2026-10-10)`);
  let fallenEntry = null;
  try { fallenEntry = (Game.state.village.fallen || []).find(f => f.villagerId === oldId); } catch (e) {}
  ok(!!fallenEntry, 'fallen roll records the dead bearer');
  ok(!!fallenEntry && fallenEntry.cause === 'contest', `fallen cause = 'contest' (got ${fallenEntry ? fallenEntry.cause : 'none'})`);
  let lineageEntry = null;
  try { lineageEntry = (Game.lineage() || []).find(l => l.villagerId === oldId); } catch (e) {}
  ok(!!lineageEntry, 'lineage records the dead bearer');
  const deathSay = capB.lines.find(l => l.indexOf('is dead') >= 0 && l.indexOf(String(oldName).split(' ')[0]) >= 0);
  ok(!!deathSay, 'the death is said aloud (memorialized)');
  let playerGossip = false;
  try { playerGossip = (Game.state.village.gossip || []).some(g => g.action === 'contest_died'); } catch (e) {}
  E(`  NOTE bearer-death-on-camera: contest_died gossip seeded = ${playerGossip} (villager-only, deliberate)`);
  // The televised aspect: does ANY crisis/beat register that this death
  // happened ON CAMERA? Collect crisis keys fired during the bearer death.
  const crisesDuringB = Object.keys(crB).filter(k => !crA[k]);
  rec.bearer = {
    oldName, newBearer: newId, crisesDuringDeath: crisesDuringB,
    televisedAspectRegistered: crisesDuringB.length > 0,
    gossip: playerGossip,
  };
  E(`  NOTE bearer-death-on-camera: crises fired by the bearer death = [${crisesDuringB.join(', ') || 'none'}]`);

  rec.narrativeA = capA.lines.filter(l => /CRISIS|gone|bury|grave/i.test(l)).slice(0, 6);
  rec.narrativeB = capB.lines.filter(l => /dead|mantle|Codex|grave|CRISIS/i.test(l)).slice(0, 8);
  return rec;
}

(async () => {
  const recs = [];
  for (const seed of SEEDS) recs.push(await runSeed(seed));
  console.log(JSON.stringify({ pass, fail, seeds: recs }, null, 1));
  E(`\n== ${pass} pass / ${fail} fail ==`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(2); });
