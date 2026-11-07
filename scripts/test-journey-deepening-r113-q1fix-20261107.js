// Proof for the r113 Q1 driver fix (scholar-facing bond/link requests):
// liveRequestHolders selection + pickChoice bond/link answering.
// Driver-only (zero src/js). Run: node scripts/test-journey-deepening-r113-q1fix-20261107.js
// Exit 0 = all pass.
'use strict';
const D = require('./journey-deepening-r113-20261107.js');

let pass = 0, fail = 0;
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function C(id) { return { id }; }

// ---- liveRequestHolders (pure) ----
{
  const v = { talkRequests: {
    v_bond: { day: 10, bondProposal: true, linkRaise: false, delivered: false },
    v_link_early: { day: 9, bondProposal: false, linkRaise: true, delivered: false },
    v_link_late: { day: 11, bondProposal: false, linkRaise: true, delivered: false },
    v_plain: { day: 10, bondProposal: false, linkRaise: false, delivered: false },
    v_expired: { day: 7, bondProposal: true, linkRaise: false, delivered: false },
    v_future: { day: 13, bondProposal: true, linkRaise: false, delivered: false },
  }, linkRaises: {
    v_link_early: { day: 9, villageId: 'village_0' },
    v_link_late: { day: 11, villageId: 'village_1' },
  } };
  const r = D.liveRequestHolders(v, 11);
  ok('Q1FIX (1) bond before link even when the link staged earlier',
    r.length === 3 && r[0].vid === 'v_bond' && r[0].kind === 'bond', JSON.stringify(r));
  ok('Q1FIX (1) links in staged order after the bond',
    r[1].vid === 'v_link_early' && r[2].vid === 'v_link_late', JSON.stringify(r));
  ok('Q1FIX (1) link village read from the linkRaises map',
    r[1].village === 'village_0' && r[2].village === 'village_1', JSON.stringify(r));
  ok('Q1FIX (1) plain talk request excluded', !r.some(x => x.vid === 'v_plain'), JSON.stringify(r));
  ok('Q1FIX (1) expired (day-3) and future stagings excluded',
    !r.some(x => x.vid === 'v_expired' || x.vid === 'v_future'), JSON.stringify(r));
}
{
  // Live-window edge: stagedDay+2 is live, stagedDay+3 is expired.
  const v = { talkRequests: { v_a: { day: 10, bondProposal: true, linkRaise: false } }, linkRaises: {} };
  ok('Q1FIX (2) stagedDay+2 is live', D.liveRequestHolders(v, 12).length === 1, JSON.stringify(D.liveRequestHolders(v, 12)));
  ok('Q1FIX (2) stagedDay+3 is expired', D.liveRequestHolders(v, 13).length === 0, JSON.stringify(D.liveRequestHolders(v, 13)));
}
{
  ok('Q1FIX (3) missing talkRequests -> []', D.liveRequestHolders({}, 10).length === 0);
  ok('Q1FIX (3) null village -> []', D.liveRequestHolders(null, 10).length === 0);
}

// ---- pickChoice bond/link answering ----
// The alternation index is shared across bond/link sittings and persists
// across beginSitting() calls (module state, like the betrayal index).
// Sequence across the sittings below: accept, decline, accept, decline.
{
  D.beginSitting();
  const c1 = D.pickChoice([C('bond:accept'), C('bond:decline'), C('ask_about:food')], 0);
  ok('Q1FIX (4) first bond sitting accepts', c1 && c1.id === 'bond:accept', JSON.stringify(c1));
  // Later turns in the same sitting use the normal picker (no second ask).
  const c1b = D.pickChoice([C('bond:accept'), C('dlg:help')], 1);
  ok('Q1FIX (4) bond ask answered at most once per sitting', c1b && c1b.id === 'dlg:help', JSON.stringify(c1b));
}
{
  D.beginSitting();
  const c2 = D.pickChoice([C('bond:accept'), C('bond:decline'), C('ask_about:food')], 0);
  ok('Q1FIX (5) second bond sitting declines', c2 && c2.id === 'bond:decline', JSON.stringify(c2));
}
{
  D.beginSitting();
  const c3 = D.pickChoice([C('link:accept'), C('link:decline'), C('ask_about:food')], 0);
  ok('Q1FIX (6) link-only sitting accepts (shared index, third sitting)', c3 && c3.id === 'link:accept', JSON.stringify(c3));
}
{
  D.beginSitting();
  const c4 = D.pickChoice([C('link:accept'), C('link:decline')], 0);
  ok('Q1FIX (7) fourth sitting declines the link', c4 && c4.id === 'link:decline', JSON.stringify(c4));
}
{
  // Betrayal outranks bond on the first turn; the bond ask is still
  // answerable later in the same sitting (independent taken-flags).
  D.beginSitting();
  const c5 = D.pickChoice([C('betrayal:accept'), C('betrayal:decline'), C('bond:accept'), C('bond:decline')], 0);
  ok('Q1FIX (8) betrayal outranks bond on the first turn', c5 && c5.id === 'betrayal:accept', JSON.stringify(c5));
  const c5b = D.pickChoice([C('bond:accept'), C('bond:decline')], 1);
  ok('Q1FIX (8) bond ask still answered later in the same sitting', c5b && (c5b.id === 'bond:accept' || c5b.id === 'bond:decline'), JSON.stringify(c5b));
}
{
  // Decline mode with no decline choice offered falls back to accept
  // (mirrors the betrayal block). The shared index is now odd after the
  // sittings above, so this sitting is decline-mode.
  D.beginSitting();
  const c6 = D.pickChoice([C('bond:accept'), C('ask_about:food')], 0);
  ok('Q1FIX (9) decline mode without a decline choice falls back to accept', c6 && c6.id === 'bond:accept', JSON.stringify(c6));
}
{
  // Bond before link when both are offered.
  D.beginSitting();
  const c7 = D.pickChoice([C('link:accept'), C('bond:accept'), C('bond:decline'), C('link:decline')], 0);
  ok('Q1FIX (10) bond preferred over link when both offered', c7 && c7.id.indexOf('bond:') === 0, JSON.stringify(c7));
}

console.log(`\nR113 Q1-fix proof: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
