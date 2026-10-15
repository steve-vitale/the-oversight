#!/usr/bin/env node
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('resumed-bot');
(async () => {
  const G = await K.load({ seed: 42 }); K.newRun(G);
  const C = require('./policies/competent'), cap = require('./policies/capable');
  const s = G.state.scholar, v = G.state.village, ctx = {};
  const vid = v.roster.find(id => id !== G.villagerId);
  G.state.systemArrived = true; s.day = 100; s.kcal = 4000;
  // Cook before donating. A hot hearth and actual cleaned meat enter the
  // real cookAll path, which awards the craft deed.
  G.map.px = 4; G.map.py = 4; G.location = 'haven';
  v.fire = 100;
  s.inventory.push({ id: 'probe_meat', name: 'Cleaned rabbit', foodKind: 'meat', foodState: 'cleaned', kcal: 400, kg: 0.4, units: 1 });
  const cooked = C.cookHaul(G, ctx);
  T.ok('the bot cooks cleaned food before donating the haul', cooked === 1 && ctx.cookHaul === 1);
  T.ok('cooking is limited to one batch per day', C.cookHaul(G, ctx) === 0);
  K.giveAbility(G, 'field_medicine', { level: 2 });
  v.sick = { [vid]: { daysLeft: 5, severity: 2 } };
  const k = s.kcal; C.treatSick(G, ctx);
  T.ok('the bot uses trained hands on a sick villager', ctx.treated === 1 && v.sick[vid].daysLeft === 3 && s.kcal === k - 150);
  T.ok('treatment is limited to one per day', C.treatSick(G, ctx) === 0);
  process.env.COMPETENT_TALK_SKILLS = '1';
  const choices = [{ id: 'ask', label: 'Ask' }, { id: 'skill_learn:tracking', label: 'Teach me tracking' }];
  T.ok('the bot takes an offered skill lesson', C.pickTalkChoice(choices, {}, G).id === 'skill_learn:tracking');
  process.env.COMPETENT_DETECTIVE = '1';
  const doubt = G.addDoubt(vid, 'observation', 'A witnessed contradiction', ['one', 'two'], { eventBacked: true });
  const confrontation = { id: 'confront:' + doubt.id, label: 'Ask about the evidence' };
  T.ok('the detective habit follows earned evidence from the journal', C.pickTalkChoice([choices[0], confrontation], {}, G) === confrontation);
  doubt.resolved = true;
  T.ok('resolved doubts do not drive accusations', C.pickTalkChoice([choices[0], confrontation], {}, G) === choices[0]);
  delete process.env.COMPETENT_TALK_SKILLS; delete process.env.COMPETENT_DETECTIVE;
  s.godhood = { active: ['living_garden'] }; G.tbfight = null;
  G.npcNeeds(vid).hunger = 70; s.kcal = 2000;
  cap.godDay(G, ctx);
  T.ok('the capable bot uses its daily god action through useAbility', G.npcNeeds(vid).hunger === 0 && ctx.capGodDayUses === 1 && s.kcal === 1800);
  s.godhood = { active: ['apex_predator'] }; s.kcal = 3000;
  K.fight(G, 'hushwolf', { px: 2, py: 4, mx: 6, my: 4 });
  const f = G.tbfight, p = G.tbFighter('p'); f.turn = f.order.indexOf('p');
  cap.capable.fight(G, {});
  T.ok('the capable bot casts its combat god verb', f._gv && f._gv.terms && s.kcal <= 2880);
  T.done();
})().catch(e => { console.error(e); process.exitCode = 1; });
