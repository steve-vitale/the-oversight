// test-journey-deepening-r59-invitewrap-20261028.js -- PROOF TEST for the
// r59 invite-decision instrument (driver-only, zero src/js).
// Extracts the REAL wrap block from the r59 driver and runs it against a
// stub Game, asserting: (a) calls are recorded with day/kind/parties/
// chance/accept; (b) the wrapped return value is the original decision
// object, unaltered; (c) a Game without npcInviteDecision does not throw
// (wrap logs and leaves Game alone); (d) the r59 pickChoice is
// byte-identical to the r58 pickChoice (panel picker unchanged).
// Usage: node scripts/test-journey-deepening-r59-invitewrap-20261028.js
// Exit 0: all pass. Exit 1: any fail. Writes nothing.
'use strict';
const fs = require('fs');
const path = require('path');
const DRIVER = path.join(__dirname, 'journey-deepening-r59-20261028.js');
const DRIVER58 = path.join(__dirname, 'journey-deepening-r58-20261027.js');
let fail = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fail++; };
const src = fs.readFileSync(DRIVER, 'utf8');
check('driver contains R59 INVITE WRAP', src.includes('R59 INVITE WRAP'));
check('driver resets _inviteDecisions per seed', src.includes('_inviteDecisions = [];'));
check('driver carries inviteDecisions in seed JSON', (src.match(/inviteDecisions: _inviteDecisions/g) || []).length >= 2);
check('driver writes r59 outputs', src.includes('journey-deepening-r59-seed${seed}.json') && src.includes('journey-deepening-r59-transcript-'));
// extract wrap block: from the R59 comment to the R10 anchor
const start = src.indexOf('  // R59 INVITE WRAP');
const end = src.indexOf('  // R10 death-honesty', start);
if (start < 0 || end < 0 || end <= start) { console.log('FAIL wrap block extraction'); process.exit(1); }
const wrapCode = src.slice(start, end);
const runWrap = (game, day) => {
  const records = [];
  const factory = new Function('Game', 'gday', '_inviteDecisions', wrapCode + '\nreturn Game;');
  return { game: factory(game, () => day, records), records };
};
// (a)+(b): stub decision passes through and is recorded
{
  const orig = { chance: 74, accept: true, reasons: ['trust 60', 'warm temperament (+15)'] };
  const stub = { npcInviteDecision: (invitee, inviter, opts) => orig };
  const { game, records } = runWrap(stub, 53);
  const back = game.npcInviteDecision('vill_a', 'vill_b', { kind: 'lure' });
  check('(a) one lure call recorded with day/kind/parties/chance/accept', records.length === 1 && records[0].day === 53 && records[0].kind === 'lure' && records[0].invitee === 'vill_a' && records[0].inviter === 'vill_b' && records[0].chance === 74 && records[0].accept === true);
  check('(b) return value is the original decision object', back === orig);
}
// (c): missing method does not throw
{
  const stub = {};
  let threw = false;
  try { runWrap(stub, 10); } catch (e) { threw = true; }
  check('(c) Game without npcInviteDecision: no throw, method still absent', !threw && typeof stub.npcInviteDecision === 'undefined');
}
// (d): picker identical to r58
{
  const src58 = fs.readFileSync(DRIVER58, 'utf8');
  const pick = (s) => {
    const a = s.indexOf('function pickChoice(');
    const b = s.indexOf('\nconst CONVO_DAYS', a);
    if (a < 0 || b < 0) return null;
    return s.slice(a, b);
  };
  const p59 = pick(src), p58 = pick(src58);
  check('(d) pickChoice byte-identical to r58 (panel picker unchanged)', p59 !== null && p59 === p58);
}
process.exit(fail ? 1 : 0);
