'use strict';
// OVE-175: additive events.godpath_deed_by_id bag on the balance observer.
// Channel int stays; typed IDs fill the bag; channel equals sum of known IDs.
const K = require('./lib'), B = require('../balance-panel'), T = K.reporter('godpath-deed-by-id-observer');
(async () => {
  const G = await K.load({ seed: 175 });
  K.newRun(G);
  const observer = B.install(G);
  G.tele('godpath_deed', { event: 'apex_hunt' });
  G.tele('godpath_deed', { event: 'apex_hunt' });
  G.tele('godpath_deed', { event: 'care_survived' });
  G.tele('godpath_deed', { event: 'outmatched_escape' });
  G.tele('godpath_deed', {}); // missing typed id
  G.tele('skill_taught_deed', { event: 'ignored_for_deed_bag' });
  const row = { deaths: {}, won: 0, entered: 0, table: 0, national: 0, gameDays: 1, endReason: 'prepared observer fixture' };
  const out = observer.finish(row);
  const bag = out.events.godpath_deed_by_id;
  const knownSum = Object.values(bag || {}).reduce((n, v) => n + v, 0);
  T.ok('channel int still counts every godpath_deed tele', out.events.godpath_deed === 5);
  T.ok('typed bag fills for known event ids', bag && bag.apex_hunt === 2 && bag.care_survived === 1 && bag.outmatched_escape === 1);
  T.ok('channel int matches sum of known ids plus missing-event count',
    out.events.godpath_deed === knownSum + (out.events.godpath_deed_missing_event || 0) &&
    out.events.godpath_deed_missing_event === 1 && knownSum === 4);
  T.ok('unrelated tele types do not enter the deed bag', !bag.ignored_for_deed_bag && out.events.skill_taught_deed === 1);
  T.ok('observer reports no acquisition errors from the tele wrap', !out.observerErrors.length);
  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
