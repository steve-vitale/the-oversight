'use strict';
// test-journey-deepening-r104-pkeep-20261105.js -- proof for the r104
// unsettled-promise select (convo-wants.js convoSelectWant): a favor
// promised 15 days ago — repay seed long expired (7-day rule), favor
// rotted to 'broken' — must still be named at the next sitting, because
// the fix selects `repay` from the favor record itself. And a settled
// favor must NOT re-select repay (exactly-once naming); a live seed
// still wins over the record check.
//
// Usage: node scripts/test-journey-deepening-r104-pkeep-20261105.js
const K = require('./godpath/lib'), T = K.reporter('Deepening r104 P-KEEP');
(async () => {
  const G = await K.load({ seed: 94300 });
  function scene() {
    K.newRun(G);
    const v = G.state.village, s = G.state.scholar;
    const vid = v.roster.find(id => id !== G.villagerId && !G.getPerson(id).dead);
    G.map.px = v.px ?? 4; G.map.py = v.py ?? 4; s.mx = 4; s.my = 4; s.insideHaven = false;
    v.nodePos = { ...v.nodePos, [vid]: { nx: G.map.px, ny: G.map.py } };
    v.positions = { ...v.positions, [vid]: { mx: 4, my: 5 } };
    v.npcInside = { ...v.npcInside, [vid]: false }; v.away = {};
    v.promises = {};
    Object.assign(G.npcNeeds(vid), { hunger: 90, fear: 90, energy: 20 });
    v.health = v.health || {}; v.health[vid] = 40;
    return { v, s, vid };
  }
  function buildPromised(vid) {
    const favor = G.convoBuildFavor(vid, { kind: 'food_share', hunger: 90, health: 40, severity: 2, water: 0 });
    G.convoStoreFavor(favor);
    const c0 = G.convoFavorCommit(vid, favor);
    return { favor, committed: !!(c0 && c0.ok) };
  }

  // --- Case 1: BROKEN favor, seed expired 15 days on (the r100-r103 shape) ---
  {
    const { v, s, vid } = scene();
    const { favor, committed } = buildPromised(vid);
    T.ok('case1 commit creates a tracked promised favor', committed && favor.state === 'promised',
      JSON.stringify({ committed, state: favor.state }));
    // resolve() would plant this repay seed at endConvo, stamped today.
    G.convoPlantSeed(vid, { wantId: 'repay', note: favor.short + ' you promised', favorId: favor.id });
    s.day += 15;
    G.checkPromises();
    T.ok('case1 promise rotted to broken by day+15',
      v.promises[vid] && v.promises[vid].kept === 'broken' && favor.state === 'broken',
      JSON.stringify({ kept: v.promises[vid] && v.promises[vid].kept, state: favor.state }));
    T.ok('case1 repay seed expired after 15 days (the r100-r103 premise)',
      G.convoCheckSeeds(vid) === null,
      JSON.stringify((G.state.village.convoSeeds || {})[vid] || null));
    const sel = G.convoSelectWant(vid);
    T.ok('case1 broken favor with no live seed selects repay',
      sel && sel.id === 'repay', JSON.stringify(sel && sel.id));
    const opening = G.startConvo(vid);
    const line = (opening && opening.line) || '';
    T.ok('case1 opener names the broken promise',
      /You said you'd help with|Forget it/.test(line), line);
    T.ok('case1 speaking the opener settles the favor to acknowledged (exactly once)',
      favor.state === 'acknowledged', favor.state);
    const sel2 = G.convoSelectWant(vid);
    T.ok('case1 settled favor does not re-select repay',
      !sel2 || sel2.id !== 'repay', JSON.stringify(sel2 && sel2.id));
  }

  // --- Case 2: FULFILLED favor, no seed at all, 15 days on ---
  {
    const { v, s, vid } = scene();
    const { favor, committed } = buildPromised(vid);
    T.ok('case2 commit creates a tracked promised favor', committed && favor.state === 'promised',
      JSON.stringify({ committed, state: favor.state }));
    s.inventory = s.inventory || [];
    s.inventory.push({ id: 'favor-rations', name: 'Rations', units: 4, kcalEach: 500 });
    const done = G.convoPerformFavor(vid, favor);
    T.ok('case2 performing the favor fulfills it', done && done.ok && favor.state === 'fulfilled',
      JSON.stringify({ ok: done && done.ok, state: favor.state }));
    s.day += 15;
    T.ok('case2 no seed exists for the fulfilled favor', G.convoCheckSeeds(vid) === null, 'seed present');
    const sel = G.convoSelectWant(vid);
    T.ok('case2 fulfilled favor with no seed selects repay',
      sel && sel.id === 'repay', JSON.stringify(sel && sel.id));
    const opening = G.startConvo(vid);
    const line = (opening && opening.line) || '';
    T.ok('case2 opener thanks the player for keeping the promise',
      /You came through on|won't forget it/.test(line), line);
    T.ok('case2 speaking the opener settles the favor to thanked (exactly once)',
      favor.state === 'thanked', favor.state);
    const sel2 = G.convoSelectWant(vid);
    T.ok('case2 settled favor does not re-select repay',
      !sel2 || sel2.id !== 'repay', JSON.stringify(sel2 && sel2.id));
  }

  // --- Case 3 (control): a LIVE seed still wins over the record check ---
  {
    const { v, s, vid } = scene();
    const { favor, committed } = buildPromised(vid);
    T.ok('case3 commit creates a tracked promised favor', committed && favor.state === 'promised',
      JSON.stringify({ committed, state: favor.state }));
    G.convoPlantSeed(vid, { wantId: 'repay', note: favor.short + ' you promised', favorId: favor.id });
    s.day += 15;
    G.checkPromises();
    T.ok('case3 promise rotted to broken by day+15', favor.state === 'broken', favor.state);
    // A fresh curious-question seed, planted today: live unfinished business.
    G.convoPlantSeed(vid, { wantId: 'curious', note: 'a question', favorId: null });
    const sel = G.convoSelectWant(vid);
    T.ok('case3 live seed wins over the unsettled-promise record check',
      sel && sel.id === 'curious', JSON.stringify(sel && sel.id));
  }

  // --- Case 4 (control): an ASKED favor (never promised) never selects repay ---
  {
    const { v, s, vid } = scene();
    const favor = G.convoBuildFavor(vid, { kind: 'food_share', hunger: 90, health: 40, severity: 2, water: 0 });
    G.convoStoreFavor(favor);
    T.ok('case4 favor starts asked, never promised', favor.state === 'asked', favor.state);
    const sel = G.convoSelectWant(vid);
    T.ok('case4 asked favor does not select repay',
      !sel || sel.id !== 'repay', JSON.stringify(sel && sel.id));
  }

  // --- Case 5: STALE OPENER — fresh repay line run-ledger-blocked ---
  // (the r104 panel shape: seed 94301 day 80, "About repay — I keep
  // turning it over."). Block the fresh broken line by lodging its first
  // chunk in the run ledger, then open the sitting: the stale reframe
  // must name the promise in plain words, never the want id.
  {
    const { v, s, vid } = scene();
    const { favor, committed } = buildPromised(vid);
    T.ok('case5 commit creates a tracked promised favor', committed && favor.state === 'promised',
      JSON.stringify({ committed, state: favor.state }));
    G.convoPlantSeed(vid, { wantId: 'repay', note: favor.short + ' you promised', favorId: favor.id });
    s.day += 15;
    G.checkPromises();
    T.ok('case5 promise rotted to broken by day+15', favor.state === 'broken', favor.state);
    T.ok('case5 repay seed expired after 15 days', G.convoCheckSeeds(vid) === null, 'seed present');
    const sel = G.convoSelectWant(vid);
    T.ok('case5 broken favor with no live seed selects repay',
      sel && sel.id === 'repay', JSON.stringify(sel && sel.id));
    const fresh = G.convoWantOpener(vid, { id: 'repay', def: sel.def, fromSeed: false, seedFavorId: favor.id });
    T.ok('case5 fresh repay opener names the broken promise',
      fresh && fresh.line && /You said you'd help with/.test(fresh.line), fresh && fresh.line);
    // voiceLine returns repay lines unchanged inside an active convo, so
    // the raw first chunk is the block key startConvo will compute.
    const key = G.convoSplitBeats(fresh.line)[0].trim();
    G.convoRunLedger().push(key);
    const opening = G.startConvo(vid);
    const line = (opening && opening.line) || '';
    T.ok('case5 blocked fresh line falls to a stale reframe naming the promise',
      /About the food I needed|The food I needed/.test(line), line);
    T.ok('case5 stale reframe never leaks the engine want id',
      !/About repay/.test(line), line);
    T.ok('case5 speaking the stale reframe still settles the favor (exactly once)',
      favor.state === 'acknowledged', favor.state);
  }

  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
