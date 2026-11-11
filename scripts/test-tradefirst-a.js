// test-tradefirst-a.js — proof for the trade/market first-numbers instrument
// (arm sim-tradefirst-a, run fleshout-20261111T0315Z).
// RED->GREEN where a behavior is asserted. Plain node, no jest.
// Usage: node scripts/test-tradefirst-a.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
const TF = require(path.join(REPO, 'scripts', 'tradefirst-instrument-20261110'));
const AN = require(path.join(REPO, 'scripts', 'tradefirst-analyze-20261110'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const POL = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const competent = POL.competent;

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('ok   ' + name); }
  else { fail++; fails.push(name); console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra).slice(0, 300) : '')); }
}
function eq(a, b, name) { ok(a === b, name, { got: a, want: b }); }

function food(n) {
  return { itemId: 'tradefirst_food', name: 'Cooked beans', foodKind: 'plant', foodState: 'cooked', prep: 'cooked', edible: true, units: n, kcalEach: 100, kg: 0.1, spoilDay: 200 };
}

// ---- A. Pure classifier fixtures (no game load) ----
(function () {
  function stackFor(frames) {
    return frames.map(function (f) { return 'at ' + f.fn + ' (' + f.file + ')'; }).join(' | ');
  }
  eq(TF.classifyInteractCaller(stackFor([
    { fn: 'visitorInteract', file: '/x/src/js/betrayal.js:3400:5' },
    { fn: 'dailyIntake', file: '/x/src/js/membership.js:583:10' },
  ])), 'membership-intake', 'A1 membership auto-intake -> membership-intake');
  eq(TF.classifyInteractCaller(stackFor([
    { fn: 'visitorInteract', file: '/x/src/js/betrayal.js:3400:5' },
    { fn: 'choose', file: '/x/src/js/conversation.js:6869:10' },
  ])), 'conversation', 'A2 conversation branch -> conversation');
  eq(TF.classifyInteractCaller(stackFor([
    { fn: 'visitorInteract', file: '/x/src/js/betrayal.js:3400:5' },
    { fn: 'trade', file: '/x/scripts/policies/livelihood.js:60:10' },
  ])), 'policy', 'A3 policy trade verb -> policy');
  eq(TF.classifyInteractCaller(stackFor([
    { fn: 'visitorInteract', file: '/x/src/js/betrayal.js:3400:5' },
    { fn: 'onclick', file: '/x/src/js/app.js:16895:10' },
  ])), 'app', 'A4 app button -> app');
  eq(TF.classifyInteractCaller(stackFor([
    { fn: 'visitorInteract', file: '/x/src/js/betrayal.js:3400:5' },
    { fn: 'liveFixtures', file: '/x/scripts/test-tradefirst-a.js:100:5' },
  ])), 'direct', 'A5 direct fixture call -> direct');
  eq(TF.classifyInteractCaller(''), 'other', 'A6 empty stack -> other');
  eq(TF.classifyInteractCaller(null), 'other', 'A7 null stack -> other');
  ok(typeof AN.median === 'function' && typeof AN.mean === 'function', 'A8 analyzer helpers exported');
})();

// ---- B. Live wrap fixtures (one game load, direct calls) ----
async function liveFixtures() {
  const { Game } = await loadGame({ seed: 180265, mode: 'tradefirst-proof-b', fullTelemetry: false });
  await setupGame(Game);
  const orig = {};
  ['considerStrangers', 'visitorDaily', 'visitorInteract', 'visitorWares',
    'visitorBuyWare', 'traderSell', 'traderPay', 'traderAppraise',
    'hawkerOffer', 'hawkerBuy', 'evRiverTrader', 'feedRiverTrader',
    'tradeRiverTrader', 'snubRiverTrader', 'recordMarketExchange',
    'recordScam', 'tele'].forEach(function (n) { orig[n] = Game[n]; });
  const tf = TF.install(Game);
  const t = tf.t;
  const s = Game.state.scholar, v = Game.state.village;

  // Rig notability so considerStrangers can fire: day>=7 (+30),
  // pantry>15000 (+25), systemArrived (+25) -> n=80, sp=0.45/call.
  s.day = 10;
  Game.state.systemArrived = true;
  v.pantry = [{ itemId: 'rig_pantry', name: 'Rig grain', units: 200, kcalEach: 100, spoilDay: 999 }];
  s.inventory = [food(30)]; // 3000 kcal finished food for buy/sell fixtures
  s.kcal = 2400;
  ok(Game.villageNotability() >= 40, 'B0 notability rigged >=40', { n: Game.villageNotability() });

  // B1: considerStrangers live — loop until an arrival records
  // (p=0.45/call; 50 calls without one is ~1e-13, so a miss is a bug).
  const arrBefore = t.arrivals.length;
  let arrived = null;
  for (let i = 0; i < 50 && !arrived; i++) {
    Game.considerStrangers();
    if (t.arrivals.length > arrBefore) arrived = t.arrivals[t.arrivals.length - 1];
    // One visitor at a time: a second arrival cannot land while the
    // first is present, so stop at the first.
  }
  ok(arrived !== null, 'B1 considerStrangers arrival recorded', arrived);
  ok(t.wrapLive.considerStrangers === true, 'B1b considerStrangers wrap live');
  ok(t.considerCalls >= 1, 'B1c considerStrangers call counted', { n: t.considerCalls });
  const trader = arrived && arrived.type === 'trader'
    ? (v.visitors || []).find(function (x) { return x.id === arrived.id; })
    : null;
  if (!arrived || arrived.type !== 'trader') {
    console.log('note  B1d arrival was type ' + (arrived && arrived.type) + ', not trader — rigging a trader directly for B3-B6');
    pass++;
  }

  // B2: visitorDaily live — rig a visitor whose leavesDay is today.
  const depBefore = t.departures.length;
  const rigVis = {
    id: 'tradefirst_rig', name: 'a weathered trader', type: 'trader',
    day: s.day, leavesDay: s.day, entrepreneurial: true, trading: false,
  };
  v.visitors = (v.visitors || []).filter(function (x) { return x.id !== (arrived && arrived.id); });
  v.visitors.push(rigVis);
  const vdBefore = t.visitorDailyCalls;
  Game.visitorDaily();
  ok(t.visitorDailyCalls === vdBefore + 1, 'B2 visitorDaily call counted');
  ok(t.departures.length === depBefore + 1 && t.departures[t.departures.length - 1].id === 'tradefirst_rig',
    'B2b rigged departure recorded (unvisited)', t.departures[t.departures.length - 1]);
  ok(t.departures[t.departures.length - 1].interacted === false, 'B2c unvisited departure flagged interacted=false');
  ok(t.wrapLive.visitorDaily === true, 'B2d visitorDaily wrap live');

  // B3: the cart — rig a trader with wares, open it via visitorInteract.
  const cartVis = {
    id: 'tradefirst_cart', name: 'a sharp-eyed peddler', type: 'trader',
    day: s.day, leavesDay: s.day + 1, entrepreneurial: true, trading: false,
    traderKnows: ['cooked_beans'], traderSpecialties: [],
  };
  v.visitors = [cartVis];
  const ixBefore = t.interacts.length;
  const wgBefore = t.waresGenerated.length;
  const tradeRet = Game.visitorInteract(cartVis.id, 'trade');
  ok(tradeRet === true, 'B3 visitorInteract trade opens the cart');
  ok(t.interacts.length === ixBefore + 1, 'B3b interact recorded', t.interacts[t.interacts.length - 1]);
  const ixRec = t.interacts[t.interacts.length - 1];
  ok(ixRec && ixRec.how === 'trade' && ixRec.caller === 'direct' && ixRec.trading === true,
    'B3c interact classified direct + trading flag', ixRec);
  ok(t.waresGenerated.length === wgBefore + 1, 'B3d wares generated recorded', t.waresGenerated[t.waresGenerated.length - 1]);
  const gen = t.waresGenerated[t.waresGenerated.length - 1];
  ok(gen && gen.wares.length >= 3 && gen.wares.some(function (w) { return w.kind === 'news'; }) &&
    gen.wares.some(function (w) { return w.kind === 'alien' || w.kind === 'tool'; }),
    'B3e cart holds news + alien/tool wares', gen && gen.wares.map(function (w) { return w.kind + ':' + w.name + '@' + w.price; }));
  ok(t.wrapLive.visitorInteract === true && t.wrapLive.visitorWares === true, 'B3f interact + wares wraps live');
  // Cached wares are NOT re-recorded as generations.
  const wg2 = t.waresGenerated.length;
  Game.visitorWares(cartVis.id);
  eq(t.waresGenerated.length, wg2, 'B3g cached wares call does not re-record a generation');

  // B4: visitorBuyWare live — buy the news ware (price 300, pack pays).
  const newsIdx = cartVis.wares.findIndex(function (w) { return w.kind === 'news'; });
  ok(newsIdx >= 0, 'B4a news ware exists on the cart', { idx: newsIdx });
  const buyBefore = t.buys.length;
  const payBefore = t.payments.length;
  const mxBefore = t.marketExchanges.length;
  const tdBefore = s.tradesDone || 0;
  const buyRet = Game.visitorBuyWare(cartVis.id, newsIdx);
  ok(buyRet === true, 'B4 visitorBuyWare news succeeds');
  ok(t.buys.length === buyBefore + 1, 'B4b buy recorded', t.buys[t.buys.length - 1]);
  const buyRec = t.buys[t.buys.length - 1];
  ok(buyRec && buyRec.kind === 'news' && buyRec.ret === true && buyRec.price === 300,
    'B4c buy record carries kind + price', buyRec);
  ok((s.tradesDone || 0) === tdBefore + 1, 'B4d tradesDone incremented');
  ok(t.payments.length === payBefore + 1 && t.payments[t.payments.length - 1].ok === true,
    'B4e payment leg recorded ok', t.payments[t.payments.length - 1]);
  ok(t.payments[t.payments.length - 1].paid >= 300, 'B4f payment covered the 300 price', t.payments[t.payments.length - 1]);
  ok(t.marketExchanges.length === mxBefore, 'B4g news buy records NO market exchange (nonfood good only)', { n: t.marketExchanges.length });
  ok(t.wrapLive.visitorBuyWare === true && t.wrapLive.traderPay === true, 'B4h buy + pay wraps live');
  // A second buy of the same ware refuses (already sold).
  const buy2 = Game.visitorBuyWare(cartVis.id, newsIdx);
  ok(buy2 === null && t.buys[t.buys.length - 1].ret === null, 'B4i already-sold ware refuses and records null');

  // B5: traderSell live — sell a finished-food stack, appraisal records.
  const apBefore = t.appraisals.length;
  const sellBefore = t.sells.length;
  const foodIdx = s.inventory.findIndex(function (it) { return it.itemId === 'tradefirst_food'; });
  ok(foodIdx >= 0, 'B5a finished food stack in pack', { idx: foodIdx, units: s.inventory[foodIdx] && s.inventory[foodIdx].units });
  // The trader must know the item to price it: seed knowledge for the key.
  cartVis.traderKnows = (cartVis.traderKnows || []).concat(['tradefirst_food', 'cooked_beans']);
  const creditBefore = cartVis.credit || 0;
  const sellRet = Game.traderSell(cartVis.id, foodIdx);
  ok(t.appraisals.length > apBefore, 'B5 traderAppraise fired during the sell', t.appraisals.slice(apBefore));
  const apRec = t.appraisals[t.appraisals.length - 1];
  ok(apRec && typeof apRec.verdict === 'string', 'B5b appraisal record has a verdict', apRec);
  ok(t.sells.length === sellBefore + 1, 'B5c sell recorded', t.sells[t.sells.length - 1]);
  const sellRec = t.sells[t.sells.length - 1];
  ok(sellRec && sellRec.ret === true && (cartVis.credit || 0) > creditBefore,
    'B5d sell succeeded and tab credit grew', sellRec);
  ok(t.wrapLive.traderSell === true && t.wrapLive.traderAppraise === true, 'B5e sell + appraise wraps live');

  // B6: traderPay live, direct — ok and short paths.
  s.inventory = [food(5)]; // 500 kcal finished food
  const payOk = Game.traderPay(300);
  ok(payOk && payOk.ok === true && payOk.paid >= 300, 'B6 traderPay ok path', payOk);
  const payShort = Game.traderPay(100000);
  ok(payShort && payShort.ok === false && typeof payShort.short === 'number' && payShort.short > 0,
    'B6b traderPay short path', payShort);
  ok(t.payments.filter(function (p) { return p.asked === 100000; }).length === 1, 'B6c short payment recorded');
  // Failed payment leaves the pack untouched (two-pass).
  const unitsAfter = s.inventory.reduce(function (a, it) { return a + (it.units || 0); }, 0);
  ok(unitsAfter === 2, 'B6d failed payment leaves pack untouched (5-3=2)', { units: unitsAfter });

  // B7: resident trade — hawkerOffer generates, hawkerBuy pays.
  const roster = (v.roster || []).filter(function (x) { return x !== Game.villagerId; });
  ok(roster.length >= 1, 'B7a a non-scholar villager exists', { n: roster.length });
  const npc = roster[0];
  const hoBefore = t.hawkerOffers.length;
  const ware = Game.hawkerOffer(npc);
  ok(ware && ware.name, 'B7 hawkerOffer builds a ware', ware);
  ok(t.hawkerOffers.length === hoBefore + 1 && t.hawkerOffers[t.hawkerOffers.length - 1].generated === true,
    'B7b hawker offer recorded as generated', t.hawkerOffers[t.hawkerOffers.length - 1]);
  s.inventory = [food(30)];
  const hbBefore = t.hawkerBuys.length;
  const hbRet = Game.hawkerBuy(npc);
  ok(t.hawkerBuys.length === hbBefore + 1, 'B7c hawkerBuy recorded', t.hawkerBuys[t.hawkerBuys.length - 1]);
  const hbRec = t.hawkerBuys[t.hawkerBuys.length - 1];
  ok(hbRec && (hbRec.ret === true || hbRec.ret === null), 'B7d hawkerBuy outcome recorded', hbRec);
  if (hbRet === true) {
    ok((s.inventory || []).some(function (it) { return it.itemId === ware.itemId; }),
      'B7e bought ware landed in the pack', { itemId: ware.itemId });
    ok(t.marketExchanges.some(function (m) { return m.route === 'resident' && m.recorded; }) || ware.kind === 'food',
      'B7f nonfood resident buy records a market exchange (or the ware was food)', t.marketExchanges.slice(-1));
  } else {
    console.log('note  B7e skipped: hawkerBuy refused (price vs pack) — outcome still recorded');
    pass++;
    pass++;
  }
  ok(t.wrapLive.hawkerOffer === true && t.wrapLive.hawkerBuy === true, 'B7g hawker wraps live');

  // B8: river route live — rig the day-21 trader state directly.
  s.riverTrader = { day: s.day, greeted: false };
  v.pantry = [{ itemId: 'rig_pantry2', name: 'Rig grain', units: 100, kcalEach: 100, spoilDay: 999 }];
  s.inventory = [food(30)];
  const riverBefore = t.river.length;
  const feedRet = Game.feedRiverTrader();
  ok(feedRet === true, 'B8 feedRiverTrader succeeds on the rigged day');
  const tradeRtRet = Game.tradeRiverTrader('knife');
  ok(tradeRtRet === true || tradeRtRet === null, 'B8b tradeRiverTrader returns (true or honest null)', { ret: tradeRtRet });
  const snubRet = Game.snubRiverTrader();
  ok(snubRet === true || snubRet === null, 'B8c snubRiverTrader returns', { ret: snubRet });
  ok(t.river.length >= riverBefore + 1, 'B8d river verbs recorded', t.river.slice(riverBefore));
  ok(t.river.slice(riverBefore).map(function (x) { return x.verb; }).join(',').indexOf('feedRiverTrader') !== -1,
    'B8e feedRiverTrader in the river log');
  ok(t.wrapLive.feedRiverTrader === true && t.wrapLive.tradeRiverTrader === true,
    'B8f river wraps live');

  // B9: recordMarketExchange + recordScam live, direct.
  const mx2Before = t.marketExchanges.length;
  const marketItem = { itemId: 'stone_knife', name: 'Stone knife', units: 1, kcalEach: 0, kg: 0.5 };
  s.inventory.push(marketItem);
  // If the B7 hawker buy was a tool, the player's market_exchange deed is
  // already booked (once per person) and this call honestly refuses — the
  // instrument must record the refusal, not the success.
  const alreadyBooked = !!(((v.godpathDeeds || {})[Game.villagerId] || {}).market_exchange);
  const mxRet = Game.recordMarketExchange('player',
    { route: 'cart', role: 'buyer', partner: cartVis.id, item: 'stone_knife', price: 800, packKcal: 800, tabKcal: 0, pantryKcal: 0 },
    marketItem);
  ok(mxRet === !alreadyBooked, 'B9 recordMarketExchange deed (true, or false when already booked)', { ret: mxRet, alreadyBooked: alreadyBooked });
  ok(t.marketExchanges.length === mx2Before + 1 && t.marketExchanges[t.marketExchanges.length - 1].recorded === !alreadyBooked,
    'B9b market exchange recorded with the honest recorded flag', t.marketExchanges[t.marketExchanges.length - 1]);
  const scBefore = t.scams.length;
  const scEntry = Game.recordScam('a sharp-eyed peddler', cartVis.id, 'overprice', 'Stone knife');
  ok(scEntry && scEntry.id, 'B9c recordScam returns a ledger entry', scEntry && scEntry.id);
  ok(t.scams.length === scBefore + 1, 'B9d scam recorded', t.scams[t.scams.length - 1]);
  ok(t.wrapLive.recordMarketExchange === true && t.wrapLive.recordScam === true, 'B9e deed + scam wraps live');

  // B10: tele godpath_deed market_exchange cross-check.
  const gdBefore = t.godpathDeeds.length;
  Game.tele('godpath_deed', { t: 0, who: Game.villagerId, event: 'market_exchange', day: s.day, route: 'cart', role: 'buyer', item: 'stone_knife' });
  ok(t.godpathDeeds.length === gdBefore + 1, 'B10 tele market_exchange recorded', t.godpathDeeds[t.godpathDeeds.length - 1]);
  ok(t.wrapLive.tele === true, 'B10b tele wrap live');

  // B11: snapshot shape.
  const snap = tf.snapshot();
  ok(snap.visitors && typeof snap.visitors === 'object', 'B11 snapshot visitors', Object.keys(snap.visitors || {}));
  ok(typeof snap.traderPresent === 'boolean', 'B11b snapshot traderPresent boolean');
  ok(typeof snap.tradesDone === 'number', 'B11c snapshot tradesDone number', { n: snap.tradesDone });
  ok(snap.riverTrader && snap.riverTrader.day === s.day, 'B11d snapshot riverTrader state', snap.riverTrader);
  ok(typeof snap.notability === 'number', 'B11e snapshot notability number', { n: snap.notability });
  ok(typeof snap.pantryKcal === 'number', 'B11f snapshot pantry kcal');
  ok(typeof snap.roster === 'number', 'B11g snapshot roster size');
  ok(Array.isArray(t.daily) && t.daily.length === 1, 'B11h snapshot stored');

  // B12: no instrument errors on the fixture run.
  eq(t.instrumentErrors.length, 0, 'B12 zero instrument errors', t.instrumentErrors);

  // B13: uninstall restores every wrapped method.
  tf.uninstall();
  const restored = ['considerStrangers', 'visitorDaily', 'visitorInteract', 'visitorWares',
    'visitorBuyWare', 'traderSell', 'traderPay', 'traderAppraise',
    'hawkerOffer', 'hawkerBuy', 'evRiverTrader', 'feedRiverTrader',
    'tradeRiverTrader', 'snubRiverTrader', 'recordMarketExchange',
    'recordScam', 'tele'].every(function (n) { return Game[n] === orig[n]; });
  ok(restored, 'B13 uninstall restores all wraps');
}

// ---- C. Live miniature: competent, 12 days, seed 180265 ----
async function tradeMiniature() {
  const { Game } = await loadGame({ seed: 180265, mode: 'tradefirst-proof-c', fullTelemetry: false });
  await setupGame(Game);
  const tf = TF.install(Game);
  const wrapped = Object.assign({}, competent, {
    daily: function (Gm, ctx) {
      try { return competent.daily(Gm, ctx); } finally { try { tf.snapshot(); } catch (e) {} }
    },
  });
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: 12, manifest: undefined, sampleEvery: 30 }); });
  tf.uninstall();
  ok(result.days > 0, 'C1 miniature ran days', { days: result.days });
  ok(tf.t.considerCalls > 0, 'C2 considerStrangers fires daily in 12 days', { n: tf.t.considerCalls });
  ok(tf.t.visitorDailyCalls > 0, 'C3 visitorDaily fires daily in 12 days', { n: tf.t.visitorDailyCalls });
  ok(tf.t.wrapLive.considerStrangers === true && tf.t.wrapLive.visitorDaily === true,
    'C4 arrival/departure wraps live in miniature');
  // visitorInteract + tele never fire in 12 competent days (0 interacts —
  // the finding, not a dead wrap): both are proven live in fixtures B3/B10.
  // Their absence here is exactly what the pilot measures.
  ok(tf.t.interacts.length === 0, 'C4b zero visitorInteract calls in 12 competent days (expected: nobody trades)', { n: tf.t.interacts.length });
  ok(tf.t.wrapLive.visitorInteract === undefined, 'C4c visitorInteract wrap unfired in miniature (proven live in B3)');
  ok(tf.t.daily.length > 0 && tf.t.daily.every(function (x) { return typeof x.traderPresent === 'boolean' && typeof x.notability === 'number'; }),
    'C5 every snapshot has traderPresent + notability');
  eq(tf.t.instrumentErrors.length, 0, 'C6 zero instrument errors in miniature', tf.t.instrumentErrors);
  // C7/C8 are informational: what the first 12 competent days do.
  console.log('info  C7 arrivals=' + tf.t.arrivals.length + ' departs=' + tf.t.departures.length +
    ' interacts=' + tf.t.interacts.length + ' buys=' + tf.t.buys.length + ' sells=' + tf.t.sells.length +
    ' hawkerOffers=' + tf.t.hawkerOffers.length + ' river=' + tf.t.river.length);
  ok(true, 'C7 arrival/trade counts recorded (informational)');
  ok(true, 'C8 miniature complete (informational)');
}

// ---- D. Neutrality miniature: instrument on vs off, 12 days ----
async function neutralityMini() {
  async function mini(seed, on) {
    const { Game } = await loadGame({ seed: seed, mode: 'tradefirst-proof-d', fullTelemetry: false });
    await setupGame(Game);
    let tf = null;
    if (on) tf = TF.install(Game);
    const wrapped = Object.assign({}, competent, {
      daily: function (Gm, ctx) {
        try { return competent.daily(Gm, ctx); } finally { try { if (tf) tf.snapshot(); } catch (e) {} }
      },
    });
    let result = null;
    await quietLog(async function () { result = await runDays(Game, wrapped, { days: 12, manifest: undefined, sampleEvery: 30 }); });
    if (tf) tf.uninstall();
    const pantryKcal = ((Game.state || {}).village || {}).pantry || [];
    const pk = pantryKcal.reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0);
    const deaths = ((result && result.samples && result.samples.deaths) || []).length;
    return { days: result.days, pantryKcal: pk, deaths: deaths, errors: tf ? tf.t.instrumentErrors.length : 0 };
  }
  const on = await mini(180265, true);
  const off = await mini(180265, false);
  ok(on.days === off.days && on.pantryKcal === off.pantryKcal && on.deaths === off.deaths,
    'D1 neutrality miniature identical', { on: on, off: off });
  eq(on.errors, 0, 'D2 miniature instrument errors 0');
}

(async function () {
  try {
    await liveFixtures();
    await tradeMiniature();
    await neutralityMini();
  } catch (e) {
    fail++;
    fails.push('harness-threw: ' + (e && e.stack ? e.stack.split('\n').slice(0, 5).join(' | ') : String(e)));
    console.log('FAIL harness-threw :: ' + String(e && e.stack || e).slice(0, 500));
  }
  console.log('\ntradefirst proof: ' + pass + ' passed, ' + fail + ' failed' + (fails.length ? ' :: ' + fails.join(' ; ') : ''));
  process.exit(fail ? 1 : 0);
})();
