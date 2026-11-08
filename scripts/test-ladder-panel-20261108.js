#!/usr/bin/env node
// LADDER LEG 3 (2026-11-08, brief §b.7/b.10): the Haven panel ladder bar.
// Node DOM-stub proof, following the scripts/godpath/test-feast-host-food.js
// precedent: panelHaven is sliced out of src/js/app.js and called with the
// real Game + a status snapshot. This proves the bar renders with the right
// contents for each ladder state — it does NOT prove a finger can tap it on
// a phone (P5 human check at 390x844 is leg 4's, per the prereg).
// The button wiring (data-ladder-buyout / data-ladder-capstone /
// data-ladder-cashout) lives in the same file's wiring block; the handlers
// call the engine functions proven by test-ladder-bundle (leg 2),
// test-ladder-cashout and test-ladder-rewards (leg 3).
'use strict';
const K = require('./godpath/lib'), T = K.reporter('ladder-panel-20261108');
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

  // Slice panelHaven (with its two helpers) out of app.js, as the feast
  // test slices renderFeastInline. esc is String here, as there.
  const app = K.readSrc('src/js/app.js').replace(/\r\n/g, '\n');
  const from = app.indexOf('  function sleepHintHTML()'), to = app.indexOf('  function panelNode(');
  T.ok('panelHaven slice found in app.js', from >= 0 && to > from);
  const panelHaven = new Function('Game', 'esc', app.slice(from, to) + '\nreturn panelHaven;')(G, String);
  // The harness slims Game.status() for sim speed; the full builder
  // survives as Game._fullStatus (sim-harness.js) — the panel needs it.
  const render = () => panelHaven(G._fullStatus.call(G));

  // ---- Unranked: the bar always shows, buy-out offered, no cash-out ----
  resetLadderState();
  let html = render();
  T.ok('bar renders at Unranked', /Standing ladder — Unranked/.test(html));
  T.ok('bar shows the Village threshold', /0\/12 to Village Standing/.test(html));
  T.ok('bar shows the shortfall', /Short 12/.test(html));
  T.ok('bar shows per-track counts', /Fight 0/.test(html) && /Forage 0/.test(html));
  T.ok('buy-out button renders with the 8,000 kcal price', /data-ladder-buyout/.test(html) && /8,000 kcal/.test(html));
  T.ok('no cash-out button below Regional peak', !/data-ladder-cashout/.test(html));
  T.ok('no capstone button when none is ready', !/data-ladder-capstone/.test(html));

  // ---- Capped track is marked in the bar ----
  resetLadderState(); setLedger(3, 30); // Fight 15 alone
  html = render();
  T.ok('capped track is marked Fight 15 → 7 · capped', /Fight 15 → 7 · capped/.test(html));
  T.ok('capped village still short of Village', /Short 5/.test(html));

  // ---- Regional peak: the cash-out button appears ----
  resetLadderState(); setLedger(3, 30); G.playerTracks().field.xp = 132; // 26 counted
  G.ladderTick(); // records the Regional peak
  html = render();
  T.ok('bar names Regional Standing', /Standing ladder — Regional Standing/.test(html));
  T.ok('cash-out button appears at Regional peak', /data-ladder-cashout/.test(html) && /End the run as a Respected Village/.test(html));

  // ---- Capstone ready: the delivery button appears ----
  resetLadderState(); setLedger(3, 48); G.playerTracks().field.xp = 192; // 40 counted, National
  G.state.feastLog.push({ day: s.day || 1, quality: 0, bundle: true, bundleStage: 0, buyout: true });
  T.ok('feast embassy reads ready for the rig', G.ladderCapstoneReady('feast_embassy').ready === true);
  html = render();
  T.ok('capstone button appears when ready', /data-ladder-capstone="feast_embassy"/.test(html));
  // r111 consistency: at National the bar must not repeat the stage name
  // ("National Standing: National Standing reached" — the same duplication
  // journey scale r111 fixed in ladderLine).
  T.ok('National bar reads "National Standing: reached"', /Standing ladder — National Standing:<\/b> reached/.test(html));
  T.ok('National bar never repeats the stage name', !/National Standing: National Standing/.test(html));

  // ---- Buy-out hidden once this stage banked its bundle ----
  resetLadderState();
  G.state.feastLog.push({ day: s.day || 1, quality: 0, bundle: true, bundleStage: 0, buyout: true });
  html = render();
  T.ok('buy-out button hides when the stage already banked its bundle', !/data-ladder-buyout/.test(html));

  // ---- Banked head start is named in the bar ----
  fresh(); resetLadderState(); setLedger(3, 30); G.playerTracks().field.xp = 132;
  G.ladderBankPoints('lost'); // banks 26 in the meta store
  fresh(); // new village; the meta store persists
  resetXp();
  G.state.waveLedger = {}; G.state.feastLog = []; G.state.waveKillLog = [];
  html = render();
  T.ok('banked head start is named in the bar', /\+6 from the last village/.test(html));
  T.ok('banked village counts 6 toward Village', /6\/12 to Village Standing/.test(html));

  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
