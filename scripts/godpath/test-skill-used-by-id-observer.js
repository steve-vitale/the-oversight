'use strict';
// OVE-184: additive events.skill_used_by_id bag on the balance observer.
// Channel int stays; typed skill IDs fill the bag; channel equals known + missing.
const K = require('./lib'), B = require('../balance-panel'), T = K.reporter('skill-used-by-id-observer');
(async () => {
  const G = await K.load({ seed: 184 });
  K.newRun(G);
  const observer = B.install(G);
  G.tele('skill_used', { vid: 'v1', skill: 'blood_trail', context: 'field_fight', outcome: 'win' });
  G.tele('skill_used', { vid: 'v1', skill: 'blood_trail', context: 'field_fight', outcome: 'win' });
  G.tele('skill_used', { vid: 'v2', skill: 'peacemaker', context: 'field_fight', outcome: 'flee' });
  G.tele('skill_used', { vid: 'v3', context: 'field_fight' }); // missing typed id
  G.tele('ability_used', { id: 'rage', ok: true });
  G.tele('ability_used', { id: 'ignored_for_skill_bag', ok: true });
  const row = { deaths: {}, won: 0, entered: 0, table: 0, national: 0, gameDays: 1, endReason: 'prepared observer fixture' };
  const out = observer.finish(row);
  const bag = out.events.skill_used_by_id;
  const knownSum = Object.values(bag || {}).reduce((n, v) => n + v, 0);
  T.ok('channel int still counts every skill_used tele', out.events.skill_used === 4);
  T.ok('typed bag fills for known skill ids', bag && bag.blood_trail === 2 && bag.peacemaker === 1);
  T.ok('channel int matches sum of known ids plus missing-id count',
    out.events.skill_used === knownSum + (out.events.skill_used_missing_id || 0) &&
    out.events.skill_used_missing_id === 1 && knownSum === 3);
  T.ok('unrelated ability_used tele does not enter the skill bag',
    !bag.rage && !bag.ignored_for_skill_bag && out.events.ability_used === 2);
  T.ok('observer reports no acquisition errors from the tele wrap', !out.observerErrors.length);
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
