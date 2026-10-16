#!/usr/bin/env node
'use strict';
const K = require('./lib'), T = K.reporter('haggle-commerce');
(async () => {
  const G = await K.load({ seed: 7 }); let s, v, npc, vis;
  const food = n => ({ itemId: 'haggle_food', name: 'Cooked beans', foodKind: 'plant', foodState: 'cooked', prep: 'cooked', edible: true, units: n, kcalEach: 100, kg: 0.1, spoilDay: 200 });
  function fresh(haggle = true) {
    G.tbfight = null; G.over = false; K.newRun(G); s = G.state.scholar; v = G.state.village;
    G.state.systemArrived = true; s.day = 85; s.dayTicks = 80; s.kcal = 2400; s.abilities = [];
    s.inventory = [food(10)]; G.playerTracks().social = { xp: 0, level: 0 };
    npc = v.roster.find(id => id !== G.villagerId);
    vis = { id: 'haggle_trader', name: 'Nora', type: 'trader', entrepreneurial: true, trading: true, credit: 0, wares: [{ kind: 'tool', itemId: 'stone_knife', name: 'Stone knife', price: 800, blurb: 'Good steel.' }] };
    v.visitors = [vis]; if (haggle) K.giveAbility(G, 'haggle');
  }
  const units = () => s.inventory.find(i => i.itemId === 'haggle_food')?.units || 0;
  const xp = () => G.playerTracks().social.xp;
  fresh(); T.ok('the actual held modifier already prices 800 at 600', G.modTarget('trade.price_mult', 800, {}) === 600);
  let html = G.visitorHtml();
  T.ok('the public cart displays the effective Haggle quote', /600 kcal/.test(html) && !/800 kcal/.test(html));
  T.ok('repeat display does not compound a stored ware price', html === G.visitorHtml() && vis.wares[0].price === 800);
  T.ok('real cart purchase pays six units and delivers the tool', G.visitorBuyWare(vis.id, 0) && units() === 4 && s.inventory.some(i => i.itemId === 'stone_knife'));
  T.ok('the completed discounted purchase retains daily practice', xp() === 1);
  fresh(false); G.visitorBuyWare(vis.id, 0);
  T.ok('ordinary buyers still pay the original eight units', units() === 2);
  fresh(); vis.confrontDiscount = 0.5; html = G.visitorHtml(); G.visitorBuyWare(vis.id, 0);
  T.ok('existing confrontation discount composes with Haggle in quote and payment', /300 kcal/.test(html) && units() === 7);
  fresh(); vis.credit = 500; G.visitorBuyWare(vis.id, 0);
  T.ok('tab pays first, with only the discounted remainder in food', vis.credit === 0 && units() === 9 && xp() === 1);
  fresh(false); vis.credit = 800; s.inventory = []; const paid = G.visitorBuyWare(vis.id, 0);
  T.ok('a fully funded old tab is paid practice, not a free gift', paid && vis.credit === 0 && xp() === 1);
  fresh(); vis.credit = 300; s.inventory = [food(2)]; const lines = K.captureSays(G); let failed;
  try { failed = G.visitorBuyWare(vis.id, 0); } finally { lines.restore(); }
  T.ok('failed discounted payment restores the tab and food without XP', !failed && vis.credit === 300 && units() === 2 && !vis.wares[0].sold && xp() === 0);
  T.ok('refusal explains the actual 600 quote and 100 shortfall', lines.some(t => /600 kcal/.test(t) && /100 short/.test(t)));
  fresh(); vis.wares[0].price = 0; G.visitorBuyWare(vis.id, 0);
  T.ok('free wares stay free and grant no practice', units() === 10 && xp() === 0);
  fresh(); v.hawkerStock = { [npc]: { ...vis.wares[0], sold: false } }; const baseXp = G.npcXp(npc).social; G.hawkerBuy(npc);
  T.ok('a real resident hawker also honors the buyer Haggle', units() === 4 && v.hawkerStock[npc].sold && v.hawkerStock[npc].price === 800);
  T.ok('buyer and resident seller retain equal practice under the discount', xp() === 1 && G.npcXp(npc).social === baseXp + 1);
  fresh(false); v.npcAbilities = { [npc]: ['haggle'] }; v.hawkerStock = { [npc]: { ...vis.wares[0], sold: false } }; G.hawkerBuy(npc);
  T.ok('a seller own Haggle does not grant the buyer their power', units() === 2);
  fresh(); v.hawkerStock = { [npc]: { ...vis.wares[0], sold: false } };
  G.talkTo(npc); const quoted = G.convoTurn(npc, 'hawker');
  T.ok('actual conversation quotes the same discounted resident ware', /600 kcal/.test(quoted.line) && v.hawkerStock[npc].price === 800);
  const accepted = G.convoTurn(npc, 'hawker_yes');
  T.ok('accepting that spoken deal pays its quote and delivers the knife', /deal is done/.test(accepted.line) && units() === 4 && s.inventory.some(i => i.itemId === 'stone_knife'));
  fresh(false); vis.confrontDiscount = 0.5; html = G.visitorHtml(); G.visitorBuyWare(vis.id, 0);
  T.ok('confrontation alone retains its original quote and payment', /400 kcal/.test(html) && units() === 6);
  fresh(); vis.wares[0].scam = { kind: 'overprice', truePrice: 400 }; G.visitorBuyWare(vis.id, 0);
  const receipt = (v.scamLedger || []).find(e => e.id === vis.wares[0].scam.ledgerId);
  T.ok('scam receipt records the real discounted quote', receipt && receipt.paid === 600);
  fresh(); s.riverTrader = { day: s.day }; v.pantry = []; const u = units(); G.tradeRiverTrader('knife');
  T.ok('the existing river trade keeps its working 25 percent discount', u - units() === 3);
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
