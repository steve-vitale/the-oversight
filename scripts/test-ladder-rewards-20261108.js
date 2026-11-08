#!/usr/bin/env node
// LADDER LEG 3 (2026-11-08, brief §b.8 + Q4): per-stage rewards.
// Q4 ruled the rewards are concrete grants from existing systems, NOT
// memberBenefits. The picks (documented in the run note):
//   Village (1)  -> a river trader arrives today (the trade panel's
//                   feed/trade/snub block appears; already-here counts).
//   Regional (2) -> a free shelter (+2 housing, no 10-wood cost).
//   National (3) -> a link with the best-known unlinked village
//                   (Haven primary, trust 30, 4000 kcal/wk); when no
//                   known unlinked village exists, a free shelter.
// Grants ride the ladderStageBeat wrap, land once per stage (recorded on
// progState().ladderRewards), and a 0->2 jump grants both missed stages.
'use strict';
const K = require('./godpath/lib'), T = K.reporter('ladder-rewards-20261108');
(async () => {
  const G = await K.load({ seed: 7 });
  let s, v, pg;
  function fresh() {
    K.newRun(G);
    s = G.state.scholar; v = G.state.village; pg = G.progState();
  }
  fresh();

  function resetXp() {
    const Ts = ['combat', 'field', 'social', 'craft', 'strange'];
    const pt = G.playerTracks();
    for (const t of Ts) pt[t].xp = 0;
    const roster = ((G.state.village || {}).roster || []);
    for (const vid of roster) {
      if (!vid || vid === G.villagerId) continue;
      const vp = G.vpOf ? G.vpOf(vid) : null;
      if (vp && vp.dead) continue;
      const x = G.npcXp(vid);
      for (const t of Ts) x[t] = 0;
    }
  }
  function resetLadderState() {
    resetXp();
    G.state.waveLedger = {}; G.state.feastLog = []; G.state.waveKillLog = [];
    try { G.deedState().contestsSurvived = 0; } catch (e) {}
    try { G.state.codex = { plants: {}, monsters: {}, animals: {}, recipes: {}, techniques: {}, skills: {} }; } catch (e) {}
    try { const ls = G.hierarchyState(); ls.length = 0; } catch (e) {}
    delete G.state._ladderPeakStage; delete G.state._ladderCapBeat;
    delete pg.ladderCapstone; delete pg.ladderRewards;
    delete pg._ladderBanked;
    const store = G._meta(); if (store) delete store.ladderBank;
  }
  function setLedger(wave, points) {
    G.state.waveLedger = G.state.waveLedger || {};
    G.state.waveLedger[wave] = { points, perType: {}, perTypeX: {} };
  }
  // 12 = Fight 6 (ledger 12) + Forage 6 (field 72).
  // 26 = Fight 15 (ledger 30) + Forage 11 (field 132).
  // 40 = Fight 24 (ledger 48) + Forage 16 (field 192).

  // ---- Village: the river trader arrives today ----
  resetLadderState(); setLedger(3, 12); G.playerTracks().field.xp = 72;
  T.ok('rigged 12 counted, Village live', G.villageLadder().stage === 1);
  T.ok('no trader before the beat', !s.riverTrader || s.riverTrader.day !== s.day);
  let granted = G.ladderGrantStageReward(1);
  T.ok('Village grant lands via the beat path', granted && granted.granted && granted.granted.some(g => g.stage === 1 && g.kind === 'trader'));
  T.ok('Village reward: a river trader arrives today', s.riverTrader && s.riverTrader.day === s.day && s.riverTrader.greeted === false);
  T.ok('Village reward recorded once', pg.ladderRewards && pg.ladderRewards[1] && pg.ladderRewards[1].kind === 'trader');
  const traderDay = s.riverTrader.day;
  granted = G.ladderGrantStageReward(1);
  T.ok('a second Village grant call grants nothing', granted && granted.granted && granted.granted.length === 0);
  T.ok('the trader is not re-summoned', s.riverTrader && s.riverTrader.day === traderDay);

  // ---- Regional: a 0->2 jump grants BOTH stages; shelter is free ----
  fresh(); resetLadderState(); setLedger(3, 30); G.playerTracks().field.xp = 132;
  T.ok('rigged 26 counted, Regional live', G.villageLadder().stage === 2);
  const housingBefore = G.mshipState().housing;
  granted = G.ladderStageBeat(2); // the real beat — the wrap grants
  T.ok('the beat fires and both missed stages grant', pg.ladderRewards && pg.ladderRewards[1] && pg.ladderRewards[2]);
  T.ok('Village reward still the trader (jump grants it too)', pg.ladderRewards[1].kind === 'trader' && s.riverTrader && s.riverTrader.day === s.day);
  T.ok('Regional reward: a free shelter', pg.ladderRewards[2].kind === 'shelter');
  T.ok('shelter grants +2 housing', G.mshipState().housing === housingBefore + 2);
  const housingAfter = G.mshipState().housing;
  G.ladderStageBeat(2);
  T.ok('a second Regional beat grants no second shelter', G.mshipState().housing === housingAfter && pg.ladderRewards[2].kind === 'shelter');

  // ---- National: a link with the best-known unlinked village ----
  fresh(); resetLadderState(); setLedger(3, 48); G.playerTracks().field.xp = 192;
  T.ok('rigged 40 counted, National live', G.villageLadder().stage === 3);
  // A fresh village knows no neighbor: make the first one known (generated)
  // and best-liked, so the reward's perception gate passes honestly.
  const ovs = G.state.otherVillages || [];
  if (ovs[0]) { ovs[0].generated = true; ovs[0].opinion = 90; }
  const known = ovs.filter(ov => ov && G.knowsVillage(ov));
  T.ok('rig has a known unlinked village', known.length > 0);
  const linksBefore = G.hierarchyState().length;
  granted = G.ladderStageBeat(3);
  T.ok('all three stages grant on a 0->3 jump', pg.ladderRewards && pg.ladderRewards[1] && pg.ladderRewards[2] && pg.ladderRewards[3]);
  T.ok('National reward: a link', pg.ladderRewards[3].kind === 'link');
  T.ok('one link forms', G.hierarchyState().length === linksBefore + 1);
  const link = G.hierarchyState()[G.hierarchyState().length - 1];
  T.ok('the link is Haven primary', link.primary === 'haven');
  T.ok('the link carries trust 30 and 4000 kcal/wk tribute', link.trust === 30 && link.tributeKcalPerWeek === 4000);
  T.ok('the link is with a village Haven knew', known.some(ov => (ov.id || ov) === link.subordinate));

  // ---- National fallback: no known unlinked village -> a shelter ----
  fresh(); resetLadderState(); setLedger(3, 48); G.playerTracks().field.xp = 192;
  G.state.otherVillages = [];
  const housing2 = G.mshipState().housing;
  G.ladderStageBeat(3);
  T.ok('National fallback: a shelter when no village is known', pg.ladderRewards[3] && pg.ladderRewards[3].kind === 'shelter-fallback');
  T.ok('fallback shelter grants +2 housing', G.mshipState().housing === housing2 + 4); // stage 2 shelter + stage 3 fallback
  G.ladderGrantStageReward(3);
  T.ok('a second National grant call grants nothing', G.mshipState().housing === housing2 + 4);

  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
