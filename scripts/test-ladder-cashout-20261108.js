#!/usr/bin/env node
// LADDER LEG 3 (2026-11-08, brief §b.10/b.11): the Respected Village
// cash-out and the banked-points store.
// Cash-out: offered at peak >= Regional, records the respected-village
// ending (table frame, NOT the mt-table achievement — the run never sat),
// banks the village's counted points, ends the run.
// Bank: REPLACE (the most recent fallen/cashed-out village only). The
// read side adds at most 6 toward the NEXT village's Village stage only;
// Regional/National ignore it; wave Standing is never banked. The bank
// is spent (cleared) the moment the new village's peak reaches Village.
// Also: the tribute scholar-readiness fix (leg-1 follow-up).
'use strict';
const K = require('./godpath/lib'), T = K.reporter('ladder-cashout-20261108');
(async () => {
  const G = await K.load({ seed: 7 });
  let s, v, pg;
  function fresh() {
    K.newRun(G);
    s = G.state.scholar; v = G.state.village; pg = G.progState();
  }
  fresh();
  const says = K.captureSays(G);
  const meta = () => G._meta();

  // ---- shared rig (leg-1 cap test pattern) ----
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
  function resetLadderLive() {
    // Zero the LIVE ladder only — the meta bank is left alone (the new
    // village's read side needs it).
    resetXp();
    G.state.waveLedger = {}; G.state.feastLog = []; G.state.waveKillLog = [];
    try { G.deedState().contestsSurvived = 0; } catch (e) {}
    try { G.state.codex = { plants: {}, monsters: {}, animals: {}, recipes: {}, techniques: {}, skills: {} }; } catch (e) {}
    try { const ls = G.hierarchyState(); ls.length = 0; } catch (e) {}
    delete G.state._ladderPeakStage; delete G.state._ladderCapBeat;
    delete pg.ladderCapstone; delete pg.ladderRewards;
    delete pg._ladderBanked;
  }
  function resetLadderState() {
    resetLadderLive();
    const store = meta(); if (store) delete store.ladderBank;
  }
  function setLedger(wave, points) {
    G.state.waveLedger = G.state.waveLedger || {};
    G.state.waveLedger[wave] = { points, perType: {}, perTypeX: {} };
  }
  // 26 counted = Fight 15 (ledger 30) + Forage 11 (field 132).
  // 12 counted = Fight 6 (ledger 12) + Forage 6 (field 72).
  // 6 counted = Fight 3 (ledger 6) + Forage 3 (field 36).
  // 40 counted = Fight 24 (ledger 48) + Forage 16 (field 192).
  function rigCounted(n) {
    if (n === 26) { setLedger(3, 30); G.playerTracks().field.xp = 132; }
    else if (n === 12) { setLedger(3, 12); G.playerTracks().field.xp = 72; }
    else if (n === 6) { setLedger(3, 6); G.playerTracks().field.xp = 36; }
    else if (n === 40) { setLedger(3, 48); G.playerTracks().field.xp = 192; }
    else if (n === 20) { setLedger(3, 30); G.playerTracks().field.xp = 60; }
    else throw Error('rigCounted: unsupported ' + n);
  }

  // ---- L3-4a: cash-out refuses below Regional peak ----
  resetLadderState();
  T.ok('ladderCashOut exists', typeof G.ladderCashOut === 'function');
  let r = G.ladderCashOut();
  T.ok('cash-out refused at stage 0 (stage-short)', r && !r.ok && r.why === 'stage-short');
  T.ok('refused cash-out leaves the run alive', !G.over && !G.won);
  T.ok('refused cash-out banks nothing', !meta().ladderBank);

  // ---- L3-4b: cash-out at Regional records the ending and banks ----
  resetLadderState(); rigCounted(26);
  T.ok('rigged 26 counted, Regional live', G.villageLadder().counted === 26 && G.villageLadder().stage === 2);
  G.ladderTick(); // records the peak (2) and fires the stage beats
  T.ok('peak recorded as Regional', G.villageLadder().peakStage === 2);
  says.length = 0;
  r = G.ladderCashOut();
  T.ok('cash-out succeeds at Regional peak', r && r.ok && r.kind === 'respected-village' && r.banked === 26 && r.peak === 2);
  T.ok('cash-out ends the run, won', G.over === true && G.won === true);
  T.ok('cash-out records the cashed-out marker', pg.ladderCashedOut && pg.ladderCashedOut.peak === 2 && pg.ladderCashedOut.banked === 26);
  const st = meta();
  T.ok('cash-out banks the village\'s counted points', st.ladderBank && st.ladderBank.points === 26 && st.ladderBank.kind === 'cashout');
  T.ok('cash-out writes the respected-village table frame', st.table && st.table.frames && st.table.frames['respected-village'] === 1);
  T.ok('cash-out does NOT unlock the table achievement (the run never sat)', !(st.unlocked && st.unlocked['mt-table']));
  T.ok('cash-out says the ending aloud', says.some(x => /never took the seat/i.test(x)));

  // ---- L3-5a: the next village sees at most 6 banked points ----
  fresh(); // meta store persists across newRun in-process
  T.ok('bank survives into the next village', meta().ladderBank && meta().ladderBank.points === 26);
  resetLadderLive();
  let L = G.villageLadder();
  T.ok('a fresh village with 0 live counted sees 6 banked (capped)', L.counted === 6 && L.detail.bankedHeadStart === 6);
  T.ok('ladderBankedHeadStart caps at 6', G.ladderBankedHeadStart() === 6);
  T.ok('6 banked alone does not open Village', L.stage === 0);
  rigCounted(6); // live 6 + bank 6 = 12 counted
  L = G.villageLadder();
  T.ok('live 6 + bank 6 = 12 counted', L.counted === 12);
  T.ok('the bank opens Village at 6 live', L.stage === 1);
  T.ok('the bank is NOT spent by opening Village on banked points (live peak still 0)', !!(meta().ladderBank && meta().ladderBank.points === 26));
  rigCounted(12); // live 12: the live peak reaches Village — the bank is spent
  L = G.villageLadder();
  T.ok('live 12 alone counts 12 (bank spent at live Village peak)', L.counted === 12 && L.stage === 1 && !meta().ladderBank);

  // ---- L3-5b: Regional/National ignore the bank; it is spent at Village ----
  resetLadderLive(); rigCounted(20); // live 20, stage 1
  G.ladderTick(); // peak reaches Village — the bank must be spent
  L = G.villageLadder();
  T.ok('live 20 at Village peak: counted stays 20 (bank ignored)', L.counted === 20 && L.stage === 1);
  T.ok('the bank is spent (cleared) once the village reaches Village peak', !meta().ladderBank);
  T.ok('no head start after the bank is spent', G.ladderBankedHeadStart() === 0);

  // ---- L3-5c: the bank REPLACES, never accumulates ----
  fresh(); resetLadderState(); rigCounted(26);
  r = G.ladderBankPoints('lost');
  T.ok('first fall banks 26', r && r.ok && r.banked === 26 && meta().ladderBank.points === 26);
  r = G.ladderBankPoints('lost');
  T.ok('banking twice in one run is idempotent', r && r.ok && r.banked === 26 && meta().ladderBank.points === 26);
  fresh(); resetLadderLive(); rigCounted(12);
  r = G.ladderBankPoints('lost');
  T.ok('the next fall REPLACES the bank (12, not 38)', r && r.ok && r.banked === 12 && meta().ladderBank.points === 12);
  T.ok('the bank never ratchets through the head start', G.villageLadder().counted === 12);

  // ---- L3-5d: a real game-over banks; a won run and a live run do not ----
  fresh(); resetLadderState(); rigCounted(26);
  G.over = true; G.villageLost = true; G.won = false;
  G.wipe(); // the real wipe — the metaProgression wrap banks on loss
  T.ok('game-over wipe banks the counted points', meta().ladderBank && meta().ladderBank.points === 26 && meta().ladderBank.kind === 'lost');
  fresh(); resetLadderLive(); rigCounted(12);
  G.over = true; G.villageLost = false; G.won = true;
  G.wipe();
  T.ok('a won run does not re-bank', meta().ladderBank && meta().ladderBank.points === 26);
  G.over = false; G.won = false;
  G.wipe();
  T.ok('a live run\'s wipe does not bank', meta().ladderBank && meta().ladderBank.points === 26);

  // ---- L3-6 (UPDATED sim-scholarcount-a, Steve RULED 2026-11-10): tribute
  // readiness counts the scholar (the bar measures the village's
  // strength); delivery still pays non-scholar veterans only (the
  // payment measures who can leave), so scholar + 1 villager reads
  // ready here and delivery honestly refuses. ----
  fresh(); resetLadderState();
  const me = G.villagerId;
  const others = v.roster.filter(id => id && id !== me);
  const A = others[0], B = others[1];
  T.ok('rig has two living non-scholar villagers', !!(A && B) && !(G.vpOf(A) || {}).dead && !(G.vpOf(B) || {}).dead);
  G.state.waveKillLog = [{ by: me, w: 4 }, { by: A, w: 4 }];
  let ready = G.ladderCapstoneReady('military_tribute');
  T.ok('scholar-veteran + 1 villager reads ready (ruling: scholar counts; payable 1)', ready && ready.ready && ready.veterans === 2 && ready.payable === 1);
  r = G.ladderDeliverCapstone('military_tribute');
  T.ok('delivery still refuses with veterans-short (payable 1), records nothing', r && !r.ok && r.reason === 'veterans-short' && !pg.ladderCapstone);
  G.state.waveKillLog = [{ by: A, w: 4 }, { by: B, w: 4 }];
  ready = G.ladderCapstoneReady('military_tribute');
  T.ok('2 non-scholar veterans reads ready', ready && ready.ready && ready.veterans === 2);

  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
