'use strict';
// OVE-180: additive events.ability_*_by_id bags on the balance observer.
// Channel ints stay; typed IDs fill the bags; channel equals known + missing.
const K = require('./lib'), B = require('../balance-panel'), T = K.reporter('ability-used-by-id-observer');
(async () => {
  const G = await K.load({ seed: 180 });
  K.newRun(G);
  const observer = B.install(G);
  G.tele('ability_used', { id: 'rage', ok: true });
  G.tele('ability_used', { id: 'rage', ok: true });
  G.tele('ability_used', { id: 'green_thumb', ok: false });
  G.tele('ability_used', { ok: true }); // missing typed id
  G.tele('ability_granted', { id: 'war_cry', who: 'player' });
  G.tele('ability_granted', { id: 'villager_use', who: 'npc' });
  G.tele('ability_granted', { who: 'player' }); // missing typed id
  G.tele('ability_replaced', { out: 'rage', in: 'berserk', src: 'evolve' });
  G.tele('ability_replaced', { src: 'evolve' }); // missing typed ids
  G.tele('prize_ability_offer', { contest: 'show', ids: ['patient_aim', 'war_cry'] });
  G.tele('prize_ability_offer', { contest: 'show', ids: [] }); // missing typed ids
  G.tele('skill_used', { skill: 'ignored_for_ability_bags' });
  const row = { deaths: {}, won: 0, entered: 0, table: 0, national: 0, gameDays: 1, endReason: 'prepared observer fixture' };
  const out = observer.finish(row);
  const used = out.events.ability_used_by_id;
  const usedOk = out.events.ability_used_ok_by_id;
  const granted = out.events.ability_granted_by_id;
  const replaced = out.events.ability_replaced_by_id;
  const prizes = out.events.prize_ability_offer_by_id;
  const usedSum = Object.values(used || {}).reduce((n, v) => n + v, 0);
  const grantedSum = Object.values(granted || {}).reduce((n, v) => n + v, 0);
  T.ok('channel int still counts every ability_used tele', out.events.ability_used === 4);
  T.ok('ability_used bag + missing covers the channel',
    out.events.ability_used === usedSum + (out.events.ability_used_missing_id || 0) &&
    out.events.ability_used_missing_id === 1 && usedSum === 3 &&
    used.rage === 2 && used.green_thumb === 1);
  T.ok('ability_used_ok_by_id counts only ok fires with typed ids',
    usedOk && usedOk.rage === 2 && !usedOk.green_thumb && out.metrics.abilityAccepted === 3);
  T.ok('ability_granted bag retains typed ids including synthetic villager_use',
    out.events.ability_granted === 3 &&
    out.events.ability_granted === grantedSum + (out.events.ability_granted_missing_id || 0) &&
    out.events.ability_granted_missing_id === 1 &&
    granted.war_cry === 1 && granted.villager_use === 1);
  T.ok('ability_replaced / prize offer bags count typed ids; missing counters fire',
    out.events.ability_replaced === 2 && replaced && replaced.rage === 1 && replaced.berserk === 1 &&
    out.events.ability_replaced_missing_id === 1 &&
    out.events.prize_ability_offer === 2 && prizes && prizes.patient_aim === 1 && prizes.war_cry === 1 &&
    out.events.prize_ability_offer_missing_id === 1);
  T.ok('unrelated tele types do not enter ability bags',
    !used.ignored_for_ability_bags && !granted.ignored_for_ability_bags && out.events.skill_used === 1);
  T.ok('observer reports no acquisition errors from the tele wrap', !out.observerErrors.length);
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
