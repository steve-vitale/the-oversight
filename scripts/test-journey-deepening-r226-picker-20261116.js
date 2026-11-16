// test-journey-deepening-r226-picker-20261116.js -- R226 picker proof
// (runs the REAL r226 driver picker on synthetic menus; no game needed).
// The lecture wart (r222 day-80 Onni, r226 day-80 Merna): a grieving
// villager's sitting becomes 3-6 agency picks in a row because
// agency:ask_field / ask_expedition are always offered and rank high in
// ENGAGE. The fix caps agency picks at 2 per sitting (total): after 2,
// those ids drop out of the ENGAGE pass for the rest of the sitting.
// (P1) 3rd agency pick is refused (leave instead). (P2) After the cap
// the picker reaches the sitting's want (mourning) instead of lecturing.
// (P3) The cap resets per sitting (beginSitting). (P4) Both agency ids
// share one cap. (P5) Below the cap the picker is unchanged.
'use strict';
const path = require('path');
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function freshDriver() {
  const p = require.resolve('./journey-deepening-r226-20261116.js');
  delete require.cache[p];
  return require(p);
}
const FIELD = { id: 'agency:ask_field' };
const EXPED = { id: 'agency:ask_expedition' };
const LEAVE = { id: 'leave' };
const MOURN = { id: 'alive:event:mourning' };
function menu() { return [Object.assign({}, FIELD), Object.assign({}, LEAVE)]; }

// (P1) 3rd agency pick refused.
{
  const D = freshDriver();
  D.beginSitting();
  const p1 = D.pickChoice(menu(), 0);
  const p2 = D.pickChoice(menu(), 1);
  const p3 = D.pickChoice(menu(), 2);
  ok('(P1) agency cap: 1st + 2nd agency taken, 3rd refused (leave)',
    p1 && p1.id === 'agency:ask_field' && p2 && p2.id === 'agency:ask_field' &&
    p3 && p3.id === 'leave',
    JSON.stringify([p1 && p1.id, p2 && p2.id, p3 && p3.id]));
}
// (P2) After the cap the picker reaches the want (mourning).
{
  const D = freshDriver();
  D.beginSitting();
  D.pickChoice(menu(), 0);
  D.pickChoice(menu(), 1);
  const p3 = D.pickChoice([Object.assign({}, FIELD), Object.assign({}, MOURN), Object.assign({}, LEAVE)], 2);
  ok('(P2) after cap: picker takes mourning, not a 3rd agency pick',
    p3 && p3.id === 'alive:event:mourning',
    JSON.stringify(p3 && p3.id));
}
// (P3) Cap resets per sitting.
{
  const D = freshDriver();
  D.beginSitting();
  D.pickChoice(menu(), 0);
  D.pickChoice(menu(), 1);
  D.beginSitting();
  const p1 = D.pickChoice(menu(), 0);
  ok('(P3) cap resets: agency offered again after beginSitting',
    p1 && p1.id === 'agency:ask_field',
    JSON.stringify(p1 && p1.id));
}
// (P4) Both agency ids share one cap.
{
  const D = freshDriver();
  D.beginSitting();
  const p1 = D.pickChoice([Object.assign({}, EXPED), Object.assign({}, LEAVE)], 0);
  const p2 = D.pickChoice(menu(), 1);
  const p3 = D.pickChoice([Object.assign({}, EXPED), Object.assign({}, LEAVE)], 2);
  ok('(P4) shared cap: expedition + field = 2, 3rd agency refused',
    p1 && p1.id === 'agency:ask_expedition' && p2 && p2.id === 'agency:ask_field' &&
    p3 && p3.id === 'leave',
    JSON.stringify([p1 && p1.id, p2 && p2.id, p3 && p3.id]));
}
// (P5) Below the cap the picker is unchanged.
{
  const D = freshDriver();
  D.beginSitting();
  D.pickChoice(menu(), 0);
  const p2 = D.pickChoice([Object.assign({}, EXPED), Object.assign({}, LEAVE)], 1);
  ok('(P5) below cap: 2nd agency pick still taken',
    p2 && p2.id === 'agency:ask_expedition',
    JSON.stringify(p2 && p2.id));
}
console.log(`r226 picker proof: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
