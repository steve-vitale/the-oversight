#!/usr/bin/env node
// Prepared pantry/guests, actual feast calls; not natural access evidence.
'use strict';
const K = require('./lib'), T = K.reporter('feast-host-food');
(async () => {
  const G = await K.load({ seed: Number(process.env.SEED || 7) });
  let s, v, me, guests, producer;
  const near = (a, b) => Math.abs(a - b) < 1e-8;
  const receipt = who => v.harvestIntake?.[s.day]?.[who || me]?.routes.feast;
  function fresh() {
    K.newRun(G); s = G.state.scholar; v = G.state.village;
    s.day = 85; s.kcal = 1000; s.insideHaven = true;
    G.map.px = v.px ?? 4; G.map.py = v.py ?? 4;
    me = G.villagerId; guests = v.roster.filter(id => id !== me); producer = guests[1];
    v.pantry = [{ name: 'Harvest', units: 40, kcalEach: 500, spoilDay: 9999, kg: 0.1, safe: true, harvestShares: { [producer]: 1 } }];
    v.sick = {}; v.health = {}; v.away = {};
    for (const id of guests) { v.trust[id] = 80; G.npcNeeds(id).hunger = 60; }
  }
  fresh(); const initialPantry = G.pantryKcal(), first = G.hostFeast({ guests: [guests[0]] });
  T.ok('a real two-person feast nourishes the host from the paid half share', first?.ok && s.kcal === 1750 && receipt()?.kcal === 750 && receipt()?.nourishment === 750);
  T.ok('consumed host and guest portions conserve the actual pantry draw', near(receipt().kcal + receipt(guests[0]).kcal, initialPantry - G.pantryKcal()));
  T.ok('guest hunger relief stays at thirty', G.npcNeeds(guests[0]).hunger === 30);
  T.ok('the host meal retains the original harvester identity', v.harvestIntake[s.day][me].harvestNourishment[producer] === 750 && !v.harvestIntake[s.day][me].harvestNourishment[me]);
  const app = K.readSrc('src/js/app.js').replace(/\r\n/g, '\n');
  const from = app.indexOf('  function renderFeastInline('), to = app.indexOf('  function panelHaven(', from);
  const render = new Function('Game', 'esc', 'inlineHead', 'wireInlineX', 'refresh', app.slice(from, to) + '\nreturn renderFeastInline;')(G, String, String, () => {}, () => { throw Error('Completed report unexpectedly refreshed'); });
  const slot = { innerHTML: '', querySelector: () => null, querySelectorAll: () => [] };
  render(slot, { result: first });
  T.ok('the actual completed feast renderer keeps its paid report despite the same-day entry guard', /On the table:/.test(slot.innerHTML) && /Showed up:/.test(slot.innerHTML));
  const guestLabel = String(G.displayName(guests[0]));
  T.ok('unknown feast guests retain their whole public description instead of just A', !/^an? /i.test(guestLabel) || slot.innerHTML.includes(guestLabel));
  const paid = G.pantryKcal(), calories = s.kcal;
  T.ok('a repeated same-day feast neither charges nor feeds again', !G.hostFeast({ guests: [guests[0]] }).ok && G.pantryKcal() === paid && s.kcal === calories);

  fresh(); s.kcal = G.kcalCap() - 100; G.hostFeast({ guests: [guests[0]] });
  T.ok('reserve capacity clips nourishment while the whole serving is consumed', s.kcal === G.kcalCap() && receipt()?.kcal === 750 && receipt()?.nourishment === 100);
  fresh(); s.kcal = G.kcalCap(); G.hostFeast({ guests: [guests[0]] });
  T.ok('a full host receives no extra reserve from the paid serving', s.kcal === G.kcalCap() && receipt()?.kcal === 750 && receipt()?.nourishment === 0);
  fresh(); s.kcal = 0; G.hostFeast({ guests: [guests[0]] });
  T.ok('an empty host can eat ordinary paid food without an ability hunger gate', s.kcal === 750 && receipt()?.nourishment === 750);

  fresh(); G.hostFeast({ guests: guests.slice(0, 3) });
  T.ok('whole-unit overdraw uses the real two-thousand-calorie meal, not nominal sixteen hundred', G.pantryKcal() === 18000 && receipt()?.kcal === 500 && s.kcal === 1500);
  fresh(); const shared = guests.slice(0, 3); G.hostFeast({ guests: shared });
  T.ok('each larger-feast guest receives only the hunger relief their actual500kcal share pays', shared.every(id => G.npcNeeds(id).hunger === 40 && receipt(id)?.kcal === 500 && receipt(id)?.nourishment === 500));
  fresh(); v.health[guests[1]] = 10; G.hostFeast({ guests: guests.slice(0, 2) });
  T.ok('an absent sick invitee does not divide the actual diners serving', s.kcal === 1750 && receipt()?.kcal === 750 && !receipt(guests[1]));
  fresh(); v.health[guests[0]] = 10;
  T.ok('no attendees means no meal or pantry charge', !G.hostFeast({ guests: [guests[0]] }).ok && s.kcal === 1000 && G.pantryKcal() === 20000 && !v.harvestIntake);
  fresh(); v.pantry[0].units = 1;
  T.ok('insufficient food cannot nourish the host', !G.hostFeast({ guests: [guests[0]] }).ok && s.kcal === 1000 && G.pantryKcal() === 500 && !v.harvestIntake);

  fresh(); K.giveAbility(G, 'fusion_reactor'); s.fusionReactor = { installed: true, online: true };
  T.ok('fixture has a real online reactor', G.fusionReactorOnline());
  G.hostFeast({ guests: [guests[0]] });
  T.ok('an online reactor host consumes no credited food or reserve gain', s.kcal === 1000 && !receipt() && receipt(guests[0])?.kcal === 750);
  fresh(); K.giveAbility(G, 'fusion_reactor'); s.fusionReactor = { installed: true, online: false };
  G.hostFeast({ guests: [guests[0]] });
  T.ok('an offline reactor host can eat their actual serving', !G.fusionReactorOnline() && s.kcal === 1750 && receipt()?.nourishment === 750);
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
