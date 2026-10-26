#!/usr/bin/env node
// scripts/test-deedtest-a.js — sim-deedtest-a proof tests
// (policy determinism + deed-attribution analyzer proofs).
// UNIT ONLY (fake Game objects, synthetic recorder stores) —
// no harness, no repo writes. The live det-gate lives in
// scripts/test-deedtest-sweep.js --detgate (real game, one
// seed, policy-off == plain tableseat-nowait).
'use strict';
const { layerOn, newStore, installDeedtestDiag, analyzeDeed, snapFaced } = require('./policies/deedtest-diag');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

// --- 1. Layer gate: default OFF, '1' ON, anything else OFF.
delete process.env.DEEDTEST;
check('layer off by default', layerOn() === false);
process.env.DEEDTEST = '1';
check('layer on at 1', layerOn() === true);
process.env.DEEDTEST = 'yes';
check('layer off at non-1', layerOn() === false);
delete process.env.DEEDTEST;

// --- 2. Fake Game: recordDeedFight first-fight-wins, pure reads.
function fakeGame() {
  const scholar = { day: 115, prog: { deeds: { wavesFaced: {} } } };
  const G = {
    state: { scholar: scholar },
    data: { monsters: [{ id: 'strike', wave: 4 }, { id: 'bulldozer', wave: 1 }] },
    recordDeedFight(mid) {
      const d = this.state.scholar.prog.deeds;
      if (!d.wavesFaced[mid]) d.wavesFaced[mid] = (this.data.monsters.find(m => m.id === mid) || {}).wave || 1;
    },
    recordWaveKill(mid, by, via) { this.recordDeedFight(mid); },
  };
  return G;
}
{
  const G = fakeGame();
  const st = newStore();
  installDeedtestDiag(G, st);
  check('deedtest installs', st.installed === true);
  G.recordDeedFight('strike');
  check('first deed event added', st.events.length === 1 && st.events[0].added === true && st.events[0].monsterId === 'strike' && st.events[0].wave === 4);
  check('deed event day', st.events[0].day === 115);
  G.recordDeedFight('strike');
  check('second deed event deduped (wasPresent, not added)', st.events.length === 2 && st.events[1].wasPresent === true && st.events[1].added === false);
  G.state.scholar.day = 120;
  G.recordWaveKill('bulldozer', 'elif_demir', 'player');
  check('kill row records via + addedDuringKill', st.kills.length === 1 && st.kills[0].via === 'player' && st.kills[0].addedDuringKill === true);
  check('snapFaced pure read', JSON.stringify(snapFaced(G)) === JSON.stringify({ strike: 4, bulldozer: 1 }));
  // The recorder must not have created state: deeds already
  // existed in the fake; check no other keys were added.
  check('recorder wrote no game state keys', Object.keys(G.state.scholar.prog.deeds).join(',') === 'wavesFaced');
}

// --- 3. analyzeDeed: faced vs world-bump both add; drive-off adds none.
// Synthetic deed events: strike added day 115 (faced fight);
// a world-bump-only monster added day 120; a driven-off monster
// never added. TB kills are synthetic nwk-shaped stores —
// analyzeDeed rebuilds them via nonworldkill's analyzer, so
// build them through that analyzer's real shape: starts/ends
// with fightIds and log deltas.
const { analyzeNonworldkill } = require('./policies/nonworldkill-diag');
function syntheticNwk() {
  // Two TB fights: fight f1 = faced draw strike day 115 (kill
  // day 115), fight f2 = world-bump strike... use distinct
  // monsters to keep the join clean: f1 strike (faced),
  // f2 mirror_stag (world-bump). classifyStart needs stack
  // names: feast-draw via feastDraw+mid match; world-bump
  // via stack containing monsterTurn.
  return {
    starts: [
      { day: 115, arg: 'strike', mid: 'strike', wave: 4, tableTrial: false, refused: false, threw: null,
        fightId: 'f1', origin: 'null-origin', pendingEncounter: true, pendingMonsterId: 'strike',
        pendingInTent: false, feastDraw: { monsterId: 'strike', veteran: false, day: 115 },
        tentBreach: false, arenaContest: null, activeContestArena: false, doorFled: null,
        stack: 'faceFeastDraw,driveContestsImpl', stackLines: [] },
      { day: 120, arg: null, mid: 'mirror_stag', wave: 4, tableTrial: false, refused: false, threw: null,
        fightId: 'f2', origin: 'world-origin', pendingEncounter: false, pendingMonsterId: null,
        pendingInTent: false, feastDraw: null, tentBreach: false, arenaContest: null,
        activeContestArena: false, doorFled: null,
        stack: 'monsterTurn,driveContestsImpl', stackLines: [] },
    ],
    ends: [
      { day: 115, fightId: 'f1', result: 'win', newLog: [{ d: 115, mid: 'strike', w: 4, by: 'elif_demir', via: 'player' }] },
      { day: 120, fightId: 'f2', result: 'win', newLog: [{ d: 120, mid: 'mirror_stag', w: 4, by: 'elif_demir', via: 'player' }] },
    ],
    diag: { errs: 0, errors: [], overflow: {}, installed: true },
  };
}
{
  const nwk = syntheticNwk();
  const nwkAn = analyzeNonworldkill(nwk);
  check('synthetic nwk: faced door', nwkAn.tbKills[0] && nwkAn.tbKills[0].door === 'feast-draw', JSON.stringify(nwkAn.tbKills.map(k => k.door)));
  check('synthetic nwk: world-bump door', nwkAn.tbKills[1] && nwkAn.tbKills[1].door === 'world-bump', JSON.stringify(nwkAn.tbKills.map(k => k.door)));
  const deed = {
    events: [
      { day: 115, monsterId: 'strike', wave: 4, wasPresent: false, added: true, stack: 'startCombat', stackLines: [] },
      { day: 120, monsterId: 'mirror_stag', wave: 4, wasPresent: false, added: true, stack: 'startCombat', stackLines: [] },
    ],
    kills: [],
    diag: { errs: 0, errors: [], overflow: {}, installed: true },
  };
  const an = analyzeDeed(deed, nwk, []);
  check('faced kill deed added-at-this-fight', an.tbKillDeeds[0] && an.tbKillDeeds[0].deedStatus === 'added-at-this-fight', JSON.stringify(an.tbKillDeeds.map(k => k.deedStatus)));
  check('world-bump kill deed added-at-this-fight too (shared counter)', an.tbKillDeeds[1] && an.tbKillDeeds[1].deedStatus === 'added-at-this-fight', JSON.stringify(an.tbKillDeeds.map(k => k.deedStatus)));
  // A second strike kill later must read already-before.
  const nwk2 = syntheticNwk();
  nwk2.starts[1].day = 130; nwk2.starts[1].mid = 'strike'; nwk2.starts[1].feastDraw = null;
  nwk2.starts[1].stack = 'monsterTurn,driveContestsImpl'; nwk2.starts[1].arg = null;
  nwk2.ends[1].day = 130; nwk2.ends[1].newLog = [{ d: 130, mid: 'strike', w: 4, by: 'elif_demir', via: 'player' }];
  const an2 = analyzeDeed(deed, nwk2, []);
  check('repeat kill of known monster reads already-before', an2.tbKillDeeds[1] && an2.tbKillDeeds[1].deedStatus === 'already-before', JSON.stringify(an2.tbKillDeeds.map(k => k.deedStatus)));
  // Driven-off monster: no deed event at all.
  const an3 = analyzeDeed(deed, nwk, [{ d: 115, mid: 'herald', w: 4, by: 'x', via: 'player' }]);
  check('field kill with no deed event reads never', an3.fieldKills[0] && an3.fieldKills[0].deedStatus === 'never');
}

console.log(`\ntest-deedtest-a: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
