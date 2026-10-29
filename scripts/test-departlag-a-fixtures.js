#!/usr/bin/env node
// scripts/test-departlag-a-fixtures.js — join-rule unit fixtures for
// sim-departlag-a, on synthetic traces. Every class reachable, the
// priority order (departure-before-next-pick, supersession-before
// later-death, death-day departure ambiguity) proven, and the
// huntDay key proven load-bearing. No game code, no corpus.
// Exit 0 only on full pass.
'use strict';
const { classifyPick } = require('./test-departlag-a');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log(`FAIL ${name}${extra ? ' :: ' + extra : ''}`); }
}
// Synthetic row builder: picks/departures/drops/deaths as the
// recorders shape them (part = global partCounter).
function row(o) {
  return { seed: 99999, days: 180,
    funnel: { picks: o.picks || [] },
    returns: { departures: o.deps || [], drops: o.drops || [] },
    deathsList: o.deaths || [] };
}
function pick(vid, day, part, mid, huntDay) {
  return { vid, day, part, chosen: { kind: 'HUNT', huntMid: mid, huntDay } };
}
function dep(vid, day, part, mid, huntDay) {
  return { vid, day, part, objective: { kind: 'HUNT', huntMid: mid, huntDay } };
}
const P = pick('v1', 10, 100, 'eulogy', 7);
// 1. Departed same-day, lag 0 parts, fresh.
let c = classifyPick(P, row({ deps: [dep('v1', 10, 100, 'eulogy', 7)] }));
check('departed-same-part', c.cls === 'DEPARTED' && c.lagDays === 0 && c.lagParts === 0 && c.ageAtDeparture === 3 && !c.staleAtDeparture, JSON.stringify(c));
// 2. Departed stale mirror of visjoin_115: pick age 3, dep age 5, lag 2d/8p, true drop.
c = classifyPick(pick('v1', 135, 536, 'eulogy', 132), row({ picks: [pick('v1', 135, 536, 'eulogy', 132), pick('v1', 138, 549, 'x', null)],
  deps: [dep('v1', 137, 544, 'eulogy', 132)], drops: [{ vid: 'v1', mid: 'eulogy', day: 137, part: 545, dropped: true }] }));
check('departed-stale-115-mirror', c.cls === 'DEPARTED' && c.lagDays === 2 && c.lagParts === 8 && c.ageAtPick === 3 && c.ageAtDeparture === 5 && c.staleAtDeparture && c.dropped, JSON.stringify(c));
// 3. Superseded by needs, same day, 3 parts (visjoin_113 mirror).
c = classifyPick(pick('v1', 135, 536, 'eulogy', 132), row({ picks: [pick('v1', 135, 536, 'eulogy', 132), { vid: 'v1', day: 135, part: 539, chosen: { kind: 'EAT' } }] }));
check('superseded-needs', c.cls === 'SUPERSEDED' && c.subKind === 'NEEDS' && c.lagDays === 0 && c.lagParts === 3, JSON.stringify(c));
// 4. Superseded by re-pick (same mid HUNT).
c = classifyPick(P, row({ picks: [P, pick('v1', 11, 105, 'eulogy', 7)] }));
check('superseded-repick', c.cls === 'SUPERSEDED' && c.subKind === 'RE-PICK', JSON.stringify(c));
// 5. Superseded by other-hunt.
c = classifyPick(P, row({ picks: [P, pick('v1', 11, 105, 'gallowdeer', 8)] }));
check('superseded-other-hunt', c.cls === 'SUPERSEDED' && c.subKind === 'OTHER-HUNT', JSON.stringify(c));
// 6. Superseded by other kind.
c = classifyPick(P, row({ picks: [P, { vid: 'v1', day: 12, part: 110, chosen: { kind: 'SEEK' } }] }));
check('superseded-other', c.cls === 'SUPERSEDED' && c.subKind === 'OTHER', JSON.stringify(c));
// 7. Died-holding, no later pick, no departure.
c = classifyPick(P, row({ deaths: [{ who: 'v1', day: 14, cause: 'the wild' }] }));
check('died-holding', c.cls === 'DIED-HOLDING' && c.deathDay === 14 && !c.sameDayAmbiguous, JSON.stringify(c));
// 8. Died-holding same-day flag (death day == pick day, no later pick).
c = classifyPick(P, row({ deaths: [{ who: 'v1', day: 10, cause: 'monster' }] }));
check('died-holding-sameday-flag', c.cls === 'DIED-HOLDING' && c.sameDayAmbiguous, JSON.stringify(c));
// 9. Held to horizon (nothing after the pick).
c = classifyPick(P, row({}));
check('held-to-horizon', c.cls === 'HELD-TO-HORIZON' && c.holdDays === 170, JSON.stringify(c));
// 10. Supersession outranks a later death.
c = classifyPick(P, row({ picks: [P, { vid: 'v1', day: 10, part: 103, chosen: { kind: 'EAT' } }], deaths: [{ who: 'v1', day: 20, cause: 'the wild' }] }));
check('supersession-outranks-death', c.cls === 'SUPERSEDED' && /later died d20/.test(c.sub), JSON.stringify(c));
// 11. A departure AFTER the next pick does not claim the pick.
c = classifyPick(P, row({ picks: [P, { vid: 'v1', day: 11, part: 105, chosen: { kind: 'WATER' } }], deps: [dep('v1', 12, 110, 'eulogy', 7)] }));
check('departure-after-next-pick-ignored', c.cls === 'SUPERSEDED', JSON.stringify(c));
// 12. huntDay key: departure for same mid but a different memory does not match.
c = classifyPick(P, row({ deps: [dep('v1', 11, 105, 'eulogy', 9)] }));
check('huntday-key', c.cls === 'HELD-TO-HORIZON', JSON.stringify(c));
// 13. Departure on the death day is UNKNOWN (day-granular ambiguity).
c = classifyPick(P, row({ deps: [dep('v1', 12, 110, 'eulogy', 7)], deaths: [{ who: 'v1', day: 12, cause: 'the wild' }] }));
check('death-day-departure-unknown', c.cls === 'UNKNOWN', JSON.stringify(c));
// 14. Death before a departure day (contradiction) is UNKNOWN, not departed.
c = classifyPick(P, row({ deps: [dep('v1', 12, 110, 'eulogy', 7)], deaths: [{ who: 'v1', day: 11, cause: 'the wild' }] }));
check('death-before-departure-unknown', c.cls === 'UNKNOWN', JSON.stringify(c));
// 15. Dropped=false lingering calls are not arrivals.
c = classifyPick(P, row({ deps: [dep('v1', 10, 101, 'eulogy', 7)], drops: [{ vid: 'v1', mid: 'eulogy', day: 10, part: 102, dropped: false }] }));
check('lingering-false-not-drop', c.cls === 'DEPARTED' && !c.dropped, JSON.stringify(c));
// 16. A drop for a different mid does not count.
c = classifyPick(P, row({ deps: [dep('v1', 10, 101, 'eulogy', 7)], drops: [{ vid: 'v1', mid: 'reunion', day: 10, part: 102, dropped: true }] }));
check('drop-mid-key', c.cls === 'DEPARTED' && !c.dropped, JSON.stringify(c));
// 17. Next pick for a DIFFERENT villager does not supersede.
c = classifyPick(P, row({ picks: [P, { vid: 'v2', day: 10, part: 101, chosen: { kind: 'EAT' } }], deps: [dep('v1', 11, 105, 'eulogy', 7)] }));
check('other-villager-pick-ignored', c.cls === 'DEPARTED', JSON.stringify(c));
// 18. Death of a different villager does not kill the hold.
c = classifyPick(P, row({ deaths: [{ who: 'v2', day: 11, cause: 'the wild' }] }));
check('other-villager-death-ignored', c.cls === 'HELD-TO-HORIZON', JSON.stringify(c));
console.log(`FIXTURES ${pass}/${pass + fail} ${fail === 0 ? 'PASS' : 'FAIL'}`);
process.exit(fail === 0 ? 0 : 1);
