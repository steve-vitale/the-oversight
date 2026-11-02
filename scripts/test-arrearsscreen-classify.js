#!/usr/bin/env node
// test-arrearsscreen-classify.js — unit proof for the arrears-only-block
// classifier (stub readiness objects, no game load).
'use strict';
const path = require('path');
const CLS = require(path.join(__dirname, 'arrearsscreen-classify-20261102'));

let fails = 0;
function check(name, cond) {
  if (!cond) { fails++; console.log('FAIL: ' + name); }
  else console.log('ok: ' + name);
}
function L(vid, trust, opinion, arrears, wouldRefuse) {
  return { villageId: vid, name: vid, trust: trust, opinion: opinion, arrears: arrears, wouldRefuse: wouldRefuse, quota: 2, contribution: wouldRefuse ? 0 : 2 };
}

// 1. Single arrears-only refuser -> blocked.
let c = CLS.classifyCheck({ ready: false, links: [L('A', 45, 11, 9750, true), L('B', 67, 25, 0, false)] });
check('single arrears-only blocked', c.blocked === true && c.blockKind === 'arrears-only' && c.blockers.length === 1 && c.blockers[0].arrears === 9750);
// 2. Multiple arrears-only refusers -> blocked, all listed.
c = CLS.classifyCheck({ ready: false, links: [L('A', 65, 22, 26000, true), L('B', 49, 26, 11000, true), L('C', 94, 44, 0, false)] });
check('multi arrears-only blocked', c.blocked === true && c.blockers.length === 2);
// 3. Mixed: one arrears-only + one trust refuser -> NOT blocked.
c = CLS.classifyCheck({ ready: false, links: [L('A', 45, 11, 9750, true), L('B', 20, 30, 0, true)] });
check('mixed trust not blocked', c.blocked === false && /trust/.test(c.blockKind));
// 4. Mixed: arrears link that ALSO fails trust (trust 20, arrears > 0) -> NOT solely-arrears.
c = CLS.classifyCheck({ ready: false, links: [L('A', 20, 30, 5000, true)] });
check('arrears+trust-fail not solely-arrears', c.blocked === false);
// 5. Mixed: arrears link that ALSO fails opinion (opinion -11, arrears > 0) -> NOT solely-arrears.
c = CLS.classifyCheck({ ready: false, links: [L('A', 50, -11, 5000, true)] });
check('arrears+opinion-fail not solely-arrears', c.blocked === false);
// 6. Boundary: trust 25, opinion -10, arrears > 0 IS solely-arrears (>=, >=).
c = CLS.classifyCheck({ ready: false, links: [L('A', 25, -10, 1, true)] });
check('boundary 25/-10 solely-arrears', c.blocked === true);
// 7. Boundary: trust 24 fails; opinion -11 fails (covered in 4/5, plus exact).
c = CLS.classifyCheck({ ready: false, links: [L('A', 24, 0, 5000, true)] });
check('boundary trust 24 not solely-arrears', c.blocked === false);
// 8. Ready row -> not blocked even with an arrears link present (cannot happen in-game, but classifier must not block on ready).
c = CLS.classifyCheck({ ready: true, links: [L('A', 45, 11, 9750, true)] });
check('ready never blocked', c.blocked === false && c.blockKind === 'ready');
// 9. Not ready, no refusing links -> not-ready-other, never blocked.
c = CLS.classifyCheck({ ready: false, links: [L('A', 67, 25, 0, false), L('B', 51, 15, 0, false)] });
check('no refusals not-ready-other', c.blocked === false && c.blockKind === 'not-ready-other');
// 10. Non-refusing links ignored: arrears 0 non-refusers + one sole refuser -> blocked.
c = CLS.classifyCheck({ ready: false, links: [L('A', 45, 11, 3000, true), L('B', 83, 35, 0, false), L('C', 47, 30, 0, false)] });
check('non-refusers ignored', c.blocked === true && c.blockers.length === 1);
// 11. Seed classification: blocked anywhere -> arrears-blocked.
check('seed arrears-blocked', CLS.classifySeed(
  [{ ready: false, links: [L('A', 67, 25, 0, false)] }, { ready: false, links: [L('A', 45, 11, 3000, true)] }], [], 2) === 'arrears-blocked');
// 12. Seed classification: no attempts -> no-herald-attempt; attempts but no rows -> no-check.
check('seed no-herald-attempt', CLS.classifySeed([], [], 0) === 'no-herald-attempt');
check('seed no-check', CLS.classifySeed([], [{ day: 90, reason: 'no same-day snapshot' }], 1) === 'no-check');
// 13. Seed classification: ready first check -> ready-at-first-check.
check('seed ready-at-first-check', CLS.classifySeed([{ ready: true, links: [] }], [], 1) === 'ready-at-first-check');
// 14. Seed classification: checks, never blocked, never ready -> blocked-other.
check('seed blocked-other', CLS.classifySeed([{ ready: false, links: [L('A', 20, 30, 0, true)] }], [], 1) === 'blocked-other');
// 15. firstBlockRow finds the first blocked row only.
const fb = CLS.firstBlockRow([{ ready: false, links: [L('A', 20, 30, 0, true)] }, { ready: false, links: [L('A', 45, 11, 3000, true)] }, { ready: false, links: [L('A', 45, 11, 4000, true)] }]);
check('firstBlockRow index 1', !!fb && fb.index === 1 && fb.row.links[0].arrears === 3000);
check('firstBlockRow none', CLS.firstBlockRow([{ ready: false, links: [L('A', 20, 30, 0, true)] }]) === null);

console.log(fails === 0 ? 'CLASSIFY UNIT: PASS (16 checks)' : 'CLASSIFY UNIT: FAIL (' + fails + ' failures)');
process.exit(fails === 0 ? 0 : 1);
