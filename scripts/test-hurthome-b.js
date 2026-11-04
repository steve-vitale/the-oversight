'use strict';
// test-hurthome-b.js — proof for scripts/hurthome-b-lib.js (pure case
// logic for sim-hurthome-fix-b). No game load, no RNG: fixtures only.
// Run: node scripts/test-hurthome-b.js
const lib = require('./hurthome-b-lib');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass += 1; console.log('ok - ' + name); }
  else { fail += 1; console.log('FAIL - ' + name + (extra ? ' :: ' + extra : '')); }
}
const aw = (purpose) => ({ sinceDay: 10, sincePart: 1, purpose, duration: 20 });

{ // open on hurt-while-away; repeat hurt counts, no second case
  const open = new Map();
  const r1 = lib.hurtStep(open, 'v1', 10, 2, aw('expedition'), 5, { source: 'hurtVillager', cause: 'monster' });
  check('hurt-while-away opens a case', r1.action === 'opened' && r1.case.hpAtEvent === 5 && r1.case.source === 'hurtVillager');
  const r2 = lib.hurtStep(open, 'v1', 10, 3, aw('expedition'), 3, { source: 'hurtVillager', cause: 'monster' });
  check('repeat hurt on open case counts, opens nothing', r2.action === 'counted' && open.size === 1 && r2.case.hurtCount === 2 && r2.case.hpAtEvent === 5);
}
{ // not away / healthy / lethal open nothing
  const open = new Map();
  check('no away record opens nothing', lib.hurtStep(open, 'v1', 10, 2, null, 5, {}).action === 'none');
  check('healthy hp opens nothing', lib.hurtStep(open, 'v1', 10, 2, aw('forage'), 8, {}).action === 'none');
  check('hp 0 opens nothing (deaths close, never open)', lib.hurtStep(open, 'v1', 10, 2, aw('forage'), 0, {}).action === 'none');
  check('hp 1 opens, hp 7 opens', lib.hurtStep(open, 'v2', 10, 2, aw('forage'), 1, {}).action === 'opened'
    && lib.hurtStep(open, 'v3', 10, 2, aw('forage'), 7, {}).action === 'opened');
}
{ // return outcomes by pre-travel hp
  const open = new Map();
  lib.hurtStep(open, 'v1', 10, 1, aw('guard'), 4, {});
  const c = lib.closeReturned(open, 'v1', 10, 2, 4, null);
  check('return while hurt closes returned-hurt', c && c.outcome === 'returned-hurt' && lib.latencyParts(c) === 1);
  lib.hurtStep(open, 'v2', 10, 1, aw('guard'), 4, {});
  const c2 = lib.closeReturned(open, 'v2', 12, 0, 50, null);
  check('return after healing closes returned-healed', c2 && c2.outcome === 'returned-healed' && lib.latencyParts(c2) === 7);
  lib.hurtStep(open, 'v3', 10, 1, aw('guard'), 4, {});
  const c3 = lib.closeReturned(open, 'v3', 10, 2, null, null);
  check('return with missing pre-hp closes returned-unknown', c3 && c3.outcome === 'returned-unknown');
}
{ // died / healed-away / censored / tripKey change
  const open = new Map();
  lib.hurtStep(open, 'v1', 10, 1, aw('expedition'), 6, {});
  const d = lib.closeDied(open, 'v1', 10, 3, 'monster', null);
  check('death closes died with cause', d && d.outcome === 'died' && d.deathCause === 'monster' && lib.latencyParts(d) === 2);
  lib.hurtStep(open, 'v2', 10, 1, aw('forage'), 6, {});
  const h = lib.closeHealed(open, 'v2', 11, 0, 40);
  check('heal while away closes healed-away', h && h.outcome === 'healed-away' && h.lastHp === 40);
  lib.hurtStep(open, 'v3', 10, 1, aw('visit'), 6, {});
  const rest = lib.closeCensored(open, 12, 2);
  check('run end censors still-open cases', rest.length === 1 && rest[0].outcome === 'censored');
  const open2 = new Map();
  lib.hurtStep(open2, 'v4', 10, 1, aw('forage'), 6, {});
  const r = lib.hurtStep(open2, 'v4', 11, 0, { sinceDay: 11, sincePart: 0, purpose: 'hunt', duration: 8 }, 5, {});
  check('tripKey change censors old case and opens new', r.action === 'opened' && r.case.purpose === 'hunt' && open2.size === 1);
}
{ // latency across day roll; median pooled (not median-of-medians)
  const c = { eventDay: 10, eventPart: 3, closeDay: 11, closePart: 0 };
  check('latency across day roll is 1 part', lib.latencyParts(c) === 1);
  check('median odd', lib.median([5, 1, 3]) === 3);
  check('median even averages', lib.median([0, 1, 2, 9]) === 1.5);
  check('median empty is null', lib.median([]) === null);
  check('latency null without close', lib.latencyParts({ eventDay: 10, eventPart: 1 }) === null);
}
{ // walk-outs are cases too (split happens in the analyzer, not here)
  const open = new Map();
  const r = lib.hurtStep(open, 'v1', 10, 2, aw('leave'), 2, { source: 'hurtVillager', cause: 'monster' });
  check('leave-purpose hurt still opens a case (split downstream)', r.action === 'opened' && r.case.purpose === 'leave');
}
{ // lib mutates only caller-owned maps; no RNG read (deterministic rerun)
  const open = new Map();
  lib.hurtStep(open, 'v1', 10, 2, aw('forage'), 5, {});
  const snap = JSON.stringify([...open.values()]);
  lib.hurtStep(open, 'v1', 10, 3, aw('forage'), 4, {});
  check('repeat hurt does not rewrite event fields', JSON.parse(snap)[0].hpAtEvent === 5);
}

console.log(`test-hurthome-b: ${pass}/${pass + fail} green`);
if (fail) process.exit(1);
