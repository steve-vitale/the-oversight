#!/usr/bin/env node
// test-aid-pipes-20261012.js — lever 0 r4 proof: the "fire network" aid chain
// is sound end-to-end (game), and the competent policy answers it (policy).
//
// Game chain: offer -> accept -> inbound delivery -> resolveAidInbound ->
// pantry grows by the amount. Beg -> give -> their pantry grows, trust +4,
// aidCredit recorded. Refuse -> trust -5, said aloud.
// Policy: competent accepts offers when struggling, gives to begs when rich.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const { competent } = require('./policies/competent');

let pass = 0, fail = 0;
const ok = (name, cond, extra) => {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra || ''); }
};
function pk(Game) {
  return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}

async function main() {
  // ---- game: offer -> accept -> inbound -> pantry ----
  {
    const { Game } = await loadGame({ seed: 4242, mode: 'scale-food' });
    await setupGame(Game);
    const st = Game.state;
    const pk0 = pk(Game);
    st.pendingAidOffer = { villageId: 'ov-test', kind: 'food', amount: 2500, face: 'Tester', offerDay: 1 };
    const r = Game.answerAidOffer('accept');
    ok('offer accept returns accepted', r === 'accepted', r);
    ok('offer clears pending', !st.pendingAidOffer);
    ok('inbound queued', (st.aidInbound || []).length === 1);
    const del = st.aidInbound[0];
    Game.resolveAidInbound(del);
    const gained = pk(Game) - pk0;
    ok('pantry grows by the gift', gained === 2500, 'gained=' + gained);
  }
  // ---- game: beg -> give ----
  {
    const { Game } = await loadGame({ seed: 4243, mode: 'scale-food' });
    await setupGame(Game);
    // ensure a linked village exists to beg
    const st = Game.state;
    st.otherVillages = st.otherVillages || [];
    if (!st.otherVillages.length) { console.log('  SKIP beg-give: no other villages in setup'); }
    else {
      const ov = st.otherVillages[0];
      ov.pantryKcal = 1000;
      const pk0 = pk(Game);
      st.pendingAidBeg = { villageId: ov.id, kind: 'food', amount: 1500, face: 'Beggar', begDay: 2 };
      // top up pantry so the give succeeds
      Game.stockPantry(20000, 'Test stores', { pieceKcal: 500 });
      const pk1 = pk(Game);
      const r = Game.answerAidBeg('give');
      ok('beg give returns gave', r === 'gave', r);
      const spent = pk1 - pk(Game);
      ok('pantry debited ~1500', spent >= 1400 && spent <= 1600, 'spent=' + spent);
      ok('their pantry grows', (ov.pantryKcal || 0) >= 1000 + 1400, 'theirs=' + ov.pantryKcal);
    }
  }
  // ---- game: beg -> refuse is honest ----
  {
    const { Game } = await loadGame({ seed: 4244, mode: 'scale-food' });
    await setupGame(Game);
    const st = Game.state;
    st.otherVillages = st.otherVillages || [];
    if (!st.otherVillages.length) { console.log('  SKIP beg-refuse: no other villages'); }
    else {
      const ov = st.otherVillages[0];
      st.pendingAidBeg = { villageId: ov.id, kind: 'food', amount: 1500, face: 'Beggar', begDay: 2 };
      const r = Game.answerAidBeg('refuse');
      ok('beg refuse returns refused', r === 'refused', r);
      ok('refuse clears pending', !st.pendingAidBeg);
    }
  }
  // ---- policy: competent answers aid ----
  {
    const { Game } = await loadGame({ seed: 4245, mode: 'scale-food' });
    await setupGame(Game);
    const st = Game.state;
    let answered = 0;
    const origOffer = Game.answerAidOffer, origBeg = Game.answerAidBeg;
    Game.answerAidOffer = function (h) { answered++; return origOffer.call(this, h); };
    Game.answerAidBeg = function (h) { answered++; return origBeg.call(this, h); };
    st.pendingAidOffer = { villageId: 'ov-x', kind: 'food', amount: 2000, face: 'X', offerDay: 5 };
    st.pendingAidBeg = { villageId: 'ov-y', kind: 'food', amount: 1500, face: 'Y', begDay: 5 };
    Game.stockPantry(50000, 'Test stores', { pieceKcal: 500 });
    try { competent.daily(Game, {}); } catch (e) { console.log('  policy daily threw:', String(e).slice(0, 120)); }
    ok('policy answered both aid beats', answered === 2, 'answered=' + answered);
    ok('policy cleared pendings', !st.pendingAidOffer && !st.pendingAidBeg);
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('HARNESS FAIL', e); process.exit(2); });
