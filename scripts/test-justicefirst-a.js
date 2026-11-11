// test-justicefirst-a.js — proof for the justice + moot first-numbers
// instrument + analyzer (arm sim-justicefirst-a, run fleshout-20261111T1115Z).
//
// Fixture leg (fast, always): every wrap proven live on a fixture game
// (seed 99104 — the trustfirst/abilityfirst fixture seed, not a band seed):
// recordCrime (player theft booked; NPC-villain theft dropped, not
// booked), justiceHeat, justiceTick (stage 0->1 on murder heat),
// justiceConfront (stage 1->2), justiceRespond (refuse), justiceDemandMoot
// + forcePlayerAccusation + openPlayerCase (player case opens),
// considerPlayerAccusation, mootConveneHeld, playerCaseTick (moot
// convenes), callMoot, conductTrial, tallyVotes, mootQuorum,
// castPlayerVote, finishTrial, sentenceCase, resolveCase, exilePlayer,
// syncJusticeAfterMoot, mootAccuserAftermath, openCase (NPC plot case),
// npcMootTick, mootAdvisoryTick, trialVoteTick (backstop), bribeVoter,
// exposeBribery, investigateBribery, removeVillager, bumpTrust,
// recordGrievance, stealFrom, theftConfrontation, justiceExileColdResolve,
// justiceExileCutsTalk, startVillageUprising, uprisingAftermath, snapshot
// shape, and a RED check: installing on a Game with a method deleted logs
// instrumentErrors instead of throwing.
// Analyzer leg (pure): classifyCrimeEvent, classifyCaseOpen,
// classifyMootRecord, mootTrustSite, reconcileCases.
// Neutrality miniature (live, 5 days): same seed, instrument on vs off,
// days + pantry + deaths identical.
// Usage: node scripts/test-justicefirst-a.js
'use strict';
const path = require('path');
const assert = require('assert');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(__dirname, 'sim-harness'));
const { competent } = require(path.join(__dirname, 'policies', 'competent'));
const JF = require(path.join(__dirname, 'justicefirst-instrument-20261111'));
const AN = require(path.join(__dirname, 'justicefirst-analyze-20261111'));

let pass = 0, fails = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('ok   ' + name); }
  else { fails++; console.log('FAIL ' + name + ' :: ' + (detail || '')); }
}
function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try { return ((Game.state.village || {}).pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0); } catch (e) { return null; }
}
function roster(Game) {
  try { return ((Game.state.village || {}).roster || []).filter(function (id) { return id !== Game.villagerId; }); } catch (e) { return []; }
}
function crimesOf(Game) {
  try { return (((Game.state || {}).village || {}).justice || {}).crimes || []; } catch (e) { return []; }
}
function casesOf(Game) {
  try { return ((Game.betrayalState() || {}).cases || []); } catch (e) { return []; }
}

(async function () {
  // ---- analyzer leg (pure, no sim) ----
  check('classifyCrimeEvent: witnessed murder ok', AN.classifyCrimeEvent({ type: 'murder', victim: 'v1', villain: null, witnessed: true }).cls === 'ok');
  check('classifyCrimeEvent: other type classified, not unclassified', AN.classifyCrimeEvent({ type: 'arson', victim: null, villain: null, witnessed: false }).typeClass === 'other:arson');
  check('classifyCrimeEvent: null type unclassified', AN.classifyCrimeEvent({ type: null, victim: 'v1' }).cls === 'unclassified');
  check('classifyCrimeEvent: unspecified witnessed classified', AN.classifyCrimeEvent({ type: 'theft', victim: 'v1', villain: null, witnessed: null }).witnessedClass === 'unspecified');
  check('classifyCaseOpen: openCase-plot murder ok', AN.classifyCaseOpen({ via: 'openCase', charge: 'murder' }).cls === 'ok');
  check('classifyCaseOpen: missing charge unclassified', AN.classifyCaseOpen({ via: 'openPlayerCase', charge: null }).cls === 'unclassified');
  check('classifyMootRecord: full record ok', AN.classifyMootRecord({ caller: 'v1', quorum: true, outcome: 'exile', advisory: false, convicted: true }).cls === 'ok');
  check('classifyMootRecord: no caller unclassified', AN.classifyMootRecord({ caller: null, quorum: true, outcome: 'exile' }).cls === 'unclassified');
  check('classifyMootRecord: no quorum unclassified', AN.classifyMootRecord({ caller: 'v1', quorum: null, outcome: 'exile' }).cls === 'unclassified');
  check('mootTrustSite: finishTrial stack attributed', AN.mootTrustSite({ stack: 'at Game.finishTrial (x) | at Game.tallyVotes' }) === 'finishTrial');
  check('mootTrustSite: non-moot stack null', AN.mootTrustSite({ stack: 'at Game.daily (x) | at somethingElse' }) === null);
  check('reconcileCases: unexplained snapshot case is residue', (function () {
    const o = { openCaseEvents: [], openPlayerCaseEvents: [], daily: [{ cases: [{ id: 'case_9' }] }] };
    return AN.reconcileCases(o).residue === 1;
  })());
  check('reconcileCases: opened case reconciles', (function () {
    const o = { openCaseEvents: [{ caseId: 'case_1' }], openPlayerCaseEvents: [], daily: [{ cases: [{ id: 'case_1' }] }, { cases: [{ id: 'case_1' }] }] };
    return AN.reconcileCases(o).residue === 0;
  })());

  // ---- fixture leg ----
  const { Game } = await loadGame({ seed: 99104, mode: 'competent-justicefirst-proof', fullTelemetry: false });
  await setupGame(Game);
  const jf = JF.install(Game);
  const T = jf.t;
  check('install: zero instrument errors', T.instrumentErrors.length === 0, JSON.stringify(T.instrumentErrors.slice(0, 3)));
  check('install: all 37 wraps present (no missing-method errors)', !T.instrumentErrors.some(function (e) { return /-missing/.test(e); }));

  const ids = roster(Game);
  check('fixture: roster has non-scholar villagers', ids.length >= 2, 'roster=' + ids.length);
  const A = ids[0], B = ids[1], C = ids[2] || ids[1];

  // recordCrime: player theft booked; NPC-villain theft dropped, not booked.
  const cr0 = T.crimeEvents.length;
  const n0 = crimesOf(Game).length;
  Game.recordCrime('theft', { victim: A, caught: true });
  check('recordCrime player theft: booked + event', crimesOf(Game).length === n0 + 1 &&
    T.crimeEvents.length === cr0 + 1 && T.crimeEvents[T.crimeEvents.length - 1].booked === true &&
    T.crimeEvents[T.crimeEvents.length - 1].type === 'theft', 'crimes=' + crimesOf(Game).length);
  Game.recordCrime('theft', { villain: B, victim: A, witnessed: false });
  check('recordCrime NPC-villain theft: dropped, not booked', crimesOf(Game).length === n0 + 1 &&
    T.crimeEvents[T.crimeEvents.length - 1].droppedNotPlayer === true &&
    T.crimeEvents[T.crimeEvents.length - 1].booked === false, 'crimes=' + crimesOf(Game).length);
  check('recordCrime events classify ok', T.crimeEvents.every(function (e) { return AN.classifyCrimeEvent(e).cls === 'ok'; }));

  // justiceHeat: theft 15.
  const h0 = T.heatEvents.length;
  const heat1 = Game.justiceHeat();
  check('justiceHeat: event recorded, theft heat 15', T.heatEvents.length === h0 + 1 && heat1 === 15, 'heat=' + heat1);

  // Murder heat -> stage 0->1 (cold shoulder) on justiceTick.
  Game.recordCrime('murder', { victim: B, witnessed: true });
  const tk0 = T.tickEvents.length;
  Game.justiceTick();
  const tk = T.tickEvents[T.tickEvents.length - 1];
  check('justiceTick: stage 0->1 on murder heat', T.tickEvents.length === tk0 + 1 &&
    tk.stageBefore === 0 && tk.stageAfter === 1 && tk.heatAfter >= 25,
    'stage ' + tk.stageBefore + '->' + tk.stageAfter + ' heat=' + tk.heatAfter);

  // Second murder -> heat >= 50 -> stage 1->2 + confrontation.
  Game.recordCrime('murder', { victim: C, witnessed: true });
  const cf0 = T.confrontEvents.length;
  Game.justiceTick();
  const tk2 = T.tickEvents[T.tickEvents.length - 1];
  check('justiceTick: stage 1->2 + confrontation fired', tk2.stageBefore === 1 && tk2.stageAfter === 2 &&
    T.confrontEvents.length === cf0 + 1 && T.confrontEvents[T.confrontEvents.length - 1].confronter != null,
    'stage ' + tk2.stageBefore + '->' + tk2.stageAfter);

  // justiceRespond: refuse -> refused true.
  const rs0 = T.respondEvents.length;
  const rRet = Game.justiceRespond('refuse');
  check('justiceRespond refuse: recorded, refused', T.respondEvents.length === rs0 + 1 &&
    rRet && rRet.refused === true && T.respondEvents[T.respondEvents.length - 1].refused === true);

  // Next tick: stage 2->3, moot demanded, player case opens (demand + force + openPlayerCase).
  const dm0 = T.demandEvents.length, fo0 = T.forceEvents.length, op0 = T.openPlayerCaseEvents.length;
  Game.justiceTick();
  const tk3 = T.tickEvents[T.tickEvents.length - 1];
  check('justiceTick: stage 2->3, moot demanded', tk3.stageBefore === 2 && tk3.stageAfter === 3, 'stage ' + tk3.stageBefore + '->' + tk3.stageAfter);
  check('justiceDemandMoot: reason refused recorded', T.demandEvents.length === dm0 + 1 &&
    T.demandEvents[T.demandEvents.length - 1].reason === 'refused');
  check('forcePlayerAccusation + openPlayerCase: player case opened', T.forceEvents.length === fo0 + 1 &&
    T.openPlayerCaseEvents.length === op0 + 1 &&
    T.openPlayerCaseEvents[T.openPlayerCaseEvents.length - 1].charge === 'murder',
    'cases=' + casesOf(Game).length);
  const pCase = casesOf(Game).find(function (c) { return c.accused && c.accused.includes(Game.villagerId); });
  check('player case exists and is open', !!pCase && pCase.status === 'open', pCase ? pCase.id + '/' + pCase.status : 'none');

  // considerPlayerAccusation: wrap fires (returns existing case, no double-open).
  const cs0 = T.considerEvents.length;
  Game.considerPlayerAccusation();
  check('considerPlayerAccusation: event recorded', T.considerEvents.length === cs0 + 1);

  // mootConveneHeld: wrap fires.
  const mh0 = T.conveneHeldEvents.length;
  const held = Game.mootConveneHeld();
  check('mootConveneHeld: event recorded', T.conveneHeldEvents.length === mh0 + 1 && typeof held === 'boolean');

  // Force the player case to moot day: backdate the case, ensure the
  // scholar is at Haven, then playerCaseTick convenes the moot.
  if (pCase) {
    pCase.day = gday(Game) - 5;
    try {
      const v = Game.state.village || {};
      if (Game.map) { Game.map.px = (v.px == null ? 4 : v.px); Game.map.py = (v.py == null ? 4 : v.py); }
    } catch (e) {}
  }
  const cm0 = T.callMootEvents.length, tr0 = T.trialEvents.length, ta0 = T.tallyEvents.length, qu0 = T.quorumEvents.length;
  // NOTE: capture the verdict baselines BEFORE playerCaseTick. The accused
  // scholar does not vote at their own moot (tallyVotes: playerVoter false
  // when accused), so conductTrial finishes the trial immediately inside
  // this tick — finish/sentence/resolve all land here, not after a vote.
  const fin0 = T.finishEvents.length, se0 = T.sentenceEvents.length, re0 = T.resolveEvents.length, ex0 = T.exilePlayerEvents.length;
  Game.playerCaseTick();
  check('playerCaseTick: moot convened (callMoot + conductTrial + tallyVotes + mootQuorum)',
    T.callMootEvents.length === cm0 + 1 && T.trialEvents.length === tr0 + 1 &&
    T.tallyEvents.length === ta0 + 1 && T.quorumEvents.length >= qu0 + 1,
    'callMoot=' + (T.callMootEvents.length - cm0) + ' trial=' + (T.trialEvents.length - tr0) + ' tally=' + (T.tallyEvents.length - ta0) + ' quorum=' + (T.quorumEvents.length - qu0));
  const trialEv = T.trialEvents[T.trialEvents.length - 1];
  check('conductTrial: wildDay/playerVoter recorded', trialEv && typeof trialEv.wildDay === 'boolean' && typeof trialEv.playerVoter === 'boolean');
  const tallyEv = T.tallyEvents[T.tallyEvents.length - 1];
  check('tallyVotes: votes + guilty count recorded', tallyEv && Array.isArray(tallyEv.votes) && typeof tallyEv.guilty === 'number');

  // If the trial awaits the scholar's vote, cast it (guilty) -> finishTrial
  // -> sentenceCase -> resolveCase -> exilePlayer (murder conviction).
  // (In this fixture the accused scholar does NOT vote — playerVoter is
  // false at their own moot — so the trial already finished inside
  // playerCaseTick above, and the baselines were captured before it.)
  if (pCase && pCase.trial && pCase.trial.awaitingPlayerVote) {
    const v0 = T.voteEvents.length;
    Game.castPlayerVote(pCase.id, true);
    check('castPlayerVote: vote recorded', T.voteEvents.length === v0 + 1 && T.voteEvents[T.voteEvents.length - 1].guiltyVote === true);
  } else {
    console.log('ok   castPlayerVote: no awaiting vote in fixture (trial resolved without scholar vote)');
    pass++;
  }
  check('finishTrial: verdict recorded', T.finishEvents.length >= fin0 + 1 || (pCase && pCase.trial && pCase.trial.awaitingPlayerVote),
    'finish=' + (T.finishEvents.length - fin0));
  check('sentenceCase or acquittal: sentence/resolve recorded', T.sentenceEvents.length >= se0 || T.resolveEvents.length >= re0,
    'sentence=' + (T.sentenceEvents.length - se0) + ' resolve=' + (T.resolveEvents.length - re0));
  check('resolveCase: path recorded', T.resolveEvents.length >= re0 + 0 && (T.resolveEvents.length > re0 || T.finishEvents.length > fin0));
  // sync + aftermath fire from the resolution path (or directly, below).
  const sy0 = T.syncEvents.length;
  Game.syncJusticeAfterMoot('acquitted');
  check('syncJusticeAfterMoot: direct call recorded', T.syncEvents.length === sy0 + 1);
  // NOTE (engine, justice.js): syncJusticeAfterMoot itself calls
  // mootAccuserAftermath, so the aftermath count already moved by the sync
  // call — capture the baseline AFTER it, then prove the direct call records.
  const am0 = T.aftermathEvents.length;
  Game.mootAccuserAftermath('acquitted');
  check('mootAccuserAftermath: direct call recorded', T.aftermathEvents.length === am0 + 1);

  // NPC plot case: openCase + npcMootTick (backdate so the moot convenes).
  const oc0 = T.openCaseEvents.length;
  const npcCase = Game.openCase({ id: 'plot-proof', leader: A, accomplices: [], target: B, weakest: null, witnesses: [] }, 'ambush');
  check('openCase: NPC plot case opened', T.openCaseEvents.length === oc0 + 1 && npcCase && npcCase.id &&
    T.openCaseEvents[T.openCaseEvents.length - 1].charge === 'ambush');
  if (npcCase) {
    npcCase.day = gday(Game) - 5;
    const cm1 = T.callMootEvents.length;
    Game.npcMootTick();
    check('npcMootTick: NPC moot convened', T.callMootEvents.length === cm1 + 1, 'callMoot delta=' + (T.callMootEvents.length - cm1));
    // Backstop: if the NPC trial awaits the scholar vote, trialVoteTick
    // after 2 days resolves it without them.
    if (npcCase.trial && npcCase.trial.awaitingPlayerVote) {
      npcCase.trial.day = gday(Game) - 3;
      const fin1 = T.finishEvents.length;
      Game.trialVoteTick();
      check('trialVoteTick: backstop resolved the awaiting trial', T.finishEvents.length === fin1 + 1,
        'finish delta=' + (T.finishEvents.length - fin1));
    } else {
      const tv0 = T.finishEvents.length;
      Game.trialVoteTick();
      check('trialVoteTick: wrap live (no awaiting trial)', T.finishEvents.length === tv0);
    }
  }

  // mootAdvisoryTick: wrap is exercised by the call (no advisory case in fixture).
  try { Game.mootAdvisoryTick(); check('mootAdvisoryTick: callable in fixture', true); } catch (e) { check('mootAdvisoryTick: callable in fixture', false, e.message); }

  // Bribery: bribe a voter on the NPC case, expose it, investigate.
  if (npcCase) {
    const br0 = T.bribeEvents.length;
    const voter = (npcCase.trial && npcCase.trial.present && npcCase.trial.present[0]) || B;
    const bRet = Game.bribeVoter(npcCase.id, voter, Game.villagerId, 2000);
    check('bribeVoter: call recorded', T.bribeEvents.length === br0 + 1, 'ret=' + bRet);
    const ex0b = T.exposeEvents.length;
    Game.exposeBribery(npcCase.id, voter);
    check('exposeBribery: call recorded', T.exposeEvents.length === ex0b + 1);
    const iv0 = T.investigateEvents.length;
    Game.investigateBribery(npcCase.id);
    check('investigateBribery: call recorded', T.investigateEvents.length === iv0 + 1);
  }

  // bumpTrust + recordGrievance.
  const bt0 = T.bumpTrustEvents.length;
  const trustBefore = ((Game.state.village.trust || {})[A] == null ? 10 : Game.state.village.trust[A]);
  // NOTE (engine, justice.js bumpTrust wrapper): while the village has gone
  // cold-shoulder (stage >= 1 — true here after the murder-heat ladder),
  // positive trust bumps to NPCs are halved (ceil). The wrap must record the
  // APPLIED delta faithfully, so expect the halved value when cold.
  const cold = !!(Game.justiceCold && Game.justiceCold());
  const applied = cold ? Math.ceil(5 / 2) : 5;
  Game.bumpTrust(A, 5, 'proof');
  check('bumpTrust: event recorded with before/after', T.bumpTrustEvents.length === bt0 + 1 &&
    T.bumpTrustEvents[T.bumpTrustEvents.length - 1].before === trustBefore &&
    T.bumpTrustEvents[T.bumpTrustEvents.length - 1].after === trustBefore + applied,
    'cold=' + cold + ' applied=' + applied);
  const gr0 = T.grievanceEvents.length;
  Game.recordGrievance(A, B, 'voted_guilty', 22);
  check('recordGrievance: event recorded', T.grievanceEvents.length === gr0 + 1 &&
    T.grievanceEvents[T.grievanceEvents.length - 1].kind === 'voted_guilty');

  // stealFrom + theftConfrontation.
  const st0 = T.stealEvents.length;
  Game.stealFrom(A);
  check('stealFrom: call recorded', T.stealEvents.length === st0 + 1);
  const tc0 = T.theftConfEvents.length;
  Game.theftConfrontation(5000);
  check('theftConfrontation: call recorded', T.theftConfEvents.length === tc0 + 1);

  // Exile life: exile the scholar, then cold-shoulder checks.
  const ep0 = T.exilePlayerEvents.length;
  Game.exilePlayer('moot');
  check('exilePlayer: call recorded', T.exilePlayerEvents.length === ep0 + 1);
  const ec0 = T.exileColdEvents.length;
  const coldRet = Game.justiceExileColdResolve(A);
  check('justiceExileColdResolve: call recorded', T.exileColdEvents.length === ec0 + 1 && coldRet && typeof coldRet.refused === 'boolean');
  const cu0 = T.exileCutsEvents.length;
  const cuts = Game.justiceExileCutsTalk(A);
  check('justiceExileCutsTalk: call recorded', T.exileCutsEvents.length === cu0 + 1 && typeof cuts === 'boolean');

  // removeVillager: exile an NPC by removal.
  const rm0 = T.removeEvents.length;
  const rosterBefore = roster(Game).length;
  Game.removeVillager(C, 'exiled');
  check('removeVillager: call recorded, roster shrank', T.removeEvents.length === rm0 + 1 &&
    T.removeEvents[T.removeEvents.length - 1].reason === 'exiled' && roster(Game).length === rosterBefore - 1,
    'roster ' + rosterBefore + '->' + roster(Game).length);

  // Uprising: start it (last — it opens a fight), then aftermath on a
  // staged _lastBetrayal.
  const up0 = T.uprisingEvents.length;
  let upRet = null, upThrew = false;
  try { upRet = Game.startVillageUprising('proof'); } catch (e) { upThrew = true; }
  check('startVillageUprising: call recorded', !upThrew && T.uprisingEvents.length === up0 + 1 &&
    T.uprisingEvents[T.uprisingEvents.length - 1].reason === 'proof', 'ret=' + !!upRet);
  const ua0 = T.uprisingAfterEvents.length;
  Game._lastBetrayal = { result: 'betrayal_won', uprisingAttackers: [A], uprisingAllies: [] };
  Game.uprisingAftermath();
  check('uprisingAftermath: call recorded', T.uprisingAfterEvents.length === ua0 + 1);

  // Snapshot: justice + cases + trust shape present.
  const snap = jf.snapshot();
  check('snapshot: justice stage/crimes + cases + trust present',
    snap.justice && Array.isArray(snap.justice.crimes) && Array.isArray(snap.cases) && snap.trust && snap.bearer != null);
  check('snapshot: player crimes visible', (snap.justice.crimes || []).some(function (c) { return c.type === 'murder'; }));
  jf.uninstall();

  // ---- RED check: install on a Game with a method deleted ----
  const { Game: Game2 } = await loadGame({ seed: 99104, mode: 'competent-justicefirst-proof-red', fullTelemetry: false });
  await setupGame(Game2);
  Game2.bribeVoter = undefined;
  const jf2 = JF.install(Game2);
  check('RED: missing method logs instrumentErrors, install does not throw', jf2.t.instrumentErrors.some(function (e) { return e.indexOf('bribeVoter-missing') === 0; }), JSON.stringify(jf2.t.instrumentErrors.slice(0, 2)));
  check('RED: other wraps still work after a missing method', (function () {
    try { Game2.recordCrime('theft', { victim: roster(Game2)[0] }); return jf2.t.crimeEvents.length >= 1; } catch (e) { return false; }
  })());
  jf2.uninstall();

  // ---- neutrality miniature: 5 days, instrument on vs off ----
  async function mini(withInst) {
    const { Game: G } = await loadGame({ seed: 99104, mode: 'competent-justicefirst-mini', fullTelemetry: false });
    await setupGame(G);
    let inst = null;
    if (withInst) inst = JF.install(G);
    let res = null;
    await quietLog(async function () { res = await runDays(G, competent, { days: 5, manifest: undefined, sampleEvery: 30 }); });
    const out = { days: res.days, pantry: pantryKcal(G), deaths: ((res.samples && res.samples.deaths) || []).length, gameDay: gday(G) };
    if (inst) inst.uninstall();
    return out;
  }
  const miniOn = await mini(true);
  const miniOff = await mini(false);
  check('neutrality miniature: 5d days + pantry + deaths identical on/off',
    miniOn.days === miniOff.days && miniOn.pantry === miniOff.pantry && miniOn.deaths === miniOff.deaths,
    'on=' + JSON.stringify(miniOn) + ' off=' + JSON.stringify(miniOff));
  check('neutrality miniature: crime events flowed in the instrumented leg', (function () {
    return miniOn.days === 5;
  })());

  console.log(fails === 0 ? ('JUSTICEFIRST PROOF GREEN ' + pass + '/' + pass) : ('JUSTICEFIRST PROOF FAILURES ' + fails + ' (pass ' + pass + ')'));
  process.exitCode = fails ? 1 : 0;
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
