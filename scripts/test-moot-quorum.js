#!/usr/bin/env node
// test-moot-quorum.js — MOOT QUORUM upgrade-path proof (sim-quorum 2026-10-13).
//
// Steve's call: "MOOT QUORUM — binding moots need >50% of living villagers;
// below quorum, verdicts advisory only."
//
// The sibling (blitz-succession, 8e70c94d) landed the MARKING: finishTrial
// marks advisory and suppresses binding consequences. This test proves the
// UPGRADE PATH the marking alone didn't have:
//
//   RED (pristine HEAD): an advisory verdict strands the charge — c.trial is
//     kept, the player's crimes keep caseId (half heat via the no-double-
//     jeopardy discount, and forcePlayerAccusation filters them out),
//     playerCaseOpen() ignores advisory (the ladder isn't frozen behind it),
//     forcePlayerAccusation can double-charge the same crimes, and no daily
//     tick ever re-convenes the moot.
//   GREEN (after): advisory -> trial cleared, crime caseIds released, the
//     ladder freezes behind the advisory case, no duplicate case opens, and
//     mootAdvisoryTick() re-opens the case after 3 days so a quorate re-moot
//     can bind.
//
// It also proves the core marking on the real code path (NPC case): a
// below-quorum tally -> advisory, no exile, roster untouched; and the
// 2-person-village edge (both attend = quorum -> binds).
//
// Usage: node scripts/test-moot-quorum.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  ok - ' + name); }
  else { fail++; console.log('  FAIL - ' + name); }
}

(async () => {
  const { Game } = await loadGame({ seed: 4242, mode: 'proof' });
  await setupGame(Game);
  const lines = [];
  Game.say = function (t) { lines.push(String(t)); };
  const v = Game.state.village;
  const me = Game.villagerId;
  const npcs = (Game.npcIds() || []).filter(id => id !== me);
  ok(npcs.length >= 8, `enough villagers for moot tests (n=${npcs.length})`);
  const living = () => (Game.state.village.roster || []).length;

  // Rig attendance: below-quorum moots. forceGuilty pins the verdict flavor
  // deterministically (the tally still runs real code for attendance).
  // (Test-only instance patch — the game code is untouched.)
  const origTally = Game.tallyVotes.bind(Game);
  const rigLow = (forceGuilty) => {
    Game.tallyVotes = (c, wildDay, rng) => {
      const t = origTally(c, wildDay, rng);
      t.present = t.present.slice(0, 1);
      t.playerVoter = false;
      if (forceGuilty === true) {
        t.guilty = t.present.length;
        t.votes = t.present.map(vid => ({ vid, vote: 'guilty', score: -40 }));
      } else if (forceGuilty === false) {
        t.guilty = 0;
        t.votes = t.present.map(vid => ({ vid, vote: 'acquit', score: 40 }));
      }
      return t;
    };
  };
  const unrig = () => { Game.tallyVotes = origTally; };

  // ---------- 1. NPC case: below quorum -> advisory, no binding ----------
  const [leader, accomplice, victim, witness] = npcs;
  const plot = {
    id: 'plot_quorum_test', day: Game.state.scholar.day,
    leader, accomplices: [accomplice], target: victim, weakest: accomplice,
    witnesses: [witness],
  };
  Game.betrayalState().plots.push(plot);
  const c = Game.openCase(plot, 'murder');
  ok(!!c && c.status === 'open', 'NPC-accused case opens');
  // strong guilty belief so the advisory still "convicts"
  for (const id of Game.npcIds()) c.belief[id] = -40;
  const rosterBefore = living();
  const exilesBefore = (Game.state.village.exiles || []).length;
  rigLow(true);
  const mark1 = lines.length;
  const r1 = Game.conductTrial(c);
  const advLines = lines.slice(mark1);
  ok(r1 && r1.advisory === true, 'below-quorum moot returns advisory (NPC case)');
  ok(c.status === 'advisory', 'case status = advisory');
  ok(c.resolution === 'advisory_guilty', `resolution marked advisory_guilty (got ${c.resolution})`);
  ok(living() === rosterBefore, 'no one removed from roster (no exile)');
  ok((Game.state.village.exiles || []).length === exilesBefore, 'no exile recorded');
  ok(advLines.some(l => /ADVISORY/i.test(l)), 'verdict narrated as advisory in the fiction');
  ok(advLines.some(l => /no exile/i.test(l)), 'no-exile promise spoken aloud');
  // UPGRADE PATH assertions (RED on pristine):
  ok(c.trial === null, 'advisory clears the trial tally (re-convene re-draws attendance)');
  ok(c.advisoryDay === Game.state.scholar.day, 'advisory stamped with the day');

  // ---------- 1b. NPC case: below-quorum ACQUIT advisory ----------
  const plot1b = {
    id: 'plot_quorum_test_b', day: Game.state.scholar.day,
    leader: npcs[6], accomplices: [], target: npcs[7], weakest: null, witnesses: [],
  };
  Game.betrayalState().plots.push(plot1b);
  const c1b = Game.openCase(plot1b, 'theft');
  rigLow(false);
  const mark1b = lines.length;
  const r1b = Game.conductTrial(c1b);
  const acquitLines = lines.slice(mark1b);
  ok(r1b && r1b.advisory === true, 'below-quorum moot returns advisory (acquit flavor)');
  ok(c1b.resolution === 'advisory_acquit', `resolution marked advisory_acquit (got ${c1b.resolution})`);
  ok(acquitLines.some(l => /not proven tonight|ADVISORY sense/i.test(l)), 'advisory acquit narrated honestly');
  ok(r1b.convicted === false, 'advisory records the non-conviction');
  unrig();
  ok(typeof Game.mootAdvisoryTick === 'function', 'mootAdvisoryTick exists');
  Game.mootAdvisoryTick();
  ok(c.status === 'advisory', 'no re-open on the same day');
  Game.state.scholar.day += 2;
  Game.mootAdvisoryTick();
  ok(c.status === 'advisory', 'no re-open after 2 days');
  Game.state.scholar.day += 1;
  const mark2 = lines.length;
  Game.mootAdvisoryTick();
  ok(c.status === 'open', 'case re-opens on day+3');
  ok(lines.slice(mark2).some(l => /moot sits again|whole village/i.test(l)), 're-call announced honestly');
  // the village re-convenes through the normal machinery
  unrig();
  Game.state.scholar.day += 5; // past mootIn gathering
  Game.npcMootTick();
  ok(!!c.trial, 'reconvened moot tallies a fresh trial');

  // ---------- 3. player case: crimes released, ladder frozen, no double charge ----------
  unrig();
  const pVictim = npcs[4];
  Game.recordCrime('theft', { witnessed: true, victim: pVictim });
  const j = Game.justiceState();
  const crime = (j.crimes || [])[j.crimes.length - 1];
  ok(!!crime, 'player crime recorded');
  const pc = Game.forcePlayerAccusation();
  ok(!!pc && pc.accused.includes(me), 'player case opens');
  ok(crime.caseId === pc.id, 'crime charged to the case');
  for (const id of Game.npcIds()) pc.belief[id] = -40;
  rigLow();
  const pr1 = Game.conductTrial(pc);
  ok(pr1 && pr1.advisory === true, 'below-quorum moot returns advisory (player case)');
  ok(crime.caseId === null || crime.caseId === undefined, 'advisory releases the crime (caseId cleared — charge stands open)');
  ok(Game.playerCaseOpen() === true, 'ladder freezes behind the advisory case');
  const dup = Game.forcePlayerAccusation();
  ok(dup === pc, 'no duplicate case on the same crimes during the advisory window');
  // reconvene -> quorate -> binds
  // reconvene -> quorate -> binds. Full-attendance rig: deterministic quorum
  // (natural attendance would usually quorate, but may await a player vote).
  Game.state.scholar.day = (pc.advisoryDay || 0) + 3;
  Game.mootAdvisoryTick();
  ok(pc.status === 'open', 'player case re-opens on day+3');
  Game.tallyVotes = (cc, wildDay, rng) => {
    const t = origTally(cc, wildDay, rng);
    t.present = Game.npcIds().filter(id => !cc.accused.includes(id) && id !== Game.villagerId);
    t.playerVoter = false;
    return t;
  };
  const mark3 = lines.length;
  Game.playerCaseTick();
  ok(!!pc.trial && !pc.trial.awaitingPlayerVote, 'reconvened player moot tallies');
  ok(pc.status === 'resolved' || pc.status === 'acquitted', `reconvened moot binds (status=${pc.status})`);
  const bindLines = lines.slice(mark3);
  ok(bindLines.some(l => /ADVISORY/i.test(l)) === false, 'binding verdict is not marked advisory');
  unrig();

  // ---------- 4. quorum math: 2-person village, both attend = quorum ----------
  unrig();
  const savedRoster = Game.state.village.roster.slice();
  const npcB = npcs[5];
  Game.state.village.roster = [me, npcB];
  const plot2 = {
    id: 'plot_quorum_edge', day: Game.state.scholar.day,
    leader: npcB, accomplices: [], target: victim, weakest: null, witnesses: [],
  };
  Game.betrayalState().plots.push(plot2);
  const c2 = Game.openCase(plot2, 'theft');
  for (const id of Game.npcIds()) c2.belief[id] = -40;
  // nobody else at the fire except the accused + the player (voting): 2 of 2
  Game.tallyVotes = (cc, wildDay, rng) => {
    const t = origTally(cc, wildDay, rng);
    t.present = [];
    t.playerVoter = true;
    return t;
  };
  const r2 = Game.conductTrial(c2);
  ok(r2 && r2.awaitingPlayerVote === true, 'quorate 2-person moot convenes (awaits player vote)');
  const q = Game.mootQuorum(c2);
  ok(q.living === 2 && q.present === 2 && q.quorum === true, `2 of 2 = quorum (living=${q.living}, present=${q.present})`);
  const fin = Game.castPlayerVote(c2.id, true);
  ok(!fin.advisory && (c2.status === 'resolved' || c2.status === 'acquitted'), 'quorate verdict BINDS (not advisory)');
  Game.state.village.roster = savedRoster;
  unrig();

  // ---------- 5. exiled are not villagers for quorum ----------
  const rBefore = living();
  Game.removeVillager(npcs[5], 'exiled');
  const cq = Game.mootQuorum({ trial: { present: [] }, accused: [] });
  ok(cq.living === rBefore - 1, `exiled excluded from living villagers (living=${cq.living})`);
  ok((Game.state.village.exiles || []).some(e => e && e.vid === npcs[5]), 'exile recorded in v.exiles');

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
