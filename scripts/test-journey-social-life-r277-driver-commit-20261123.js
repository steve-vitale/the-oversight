// test-journey-social-life-r277-driver-commit-20261123.js — r277 Arm A proof.
// The journey driver never pressed dlg:commit: in the standard favor menu
// [favor_requirements, commit, ...] its fallback took favor_requirements
// (first, never spent) forever — 198 offers, 0 presses on the r277 probe
// seed 45829; no outing was ever promised (r268: 0 attempts). The fix
// extracts the pick priority into pickConversationChoice (helpers) with a
// commit rule: press dlg:commit when offered on a joint-outing favor
// (forage_help / water_haul — the kinds the dawn arms can keep), after
// answering questions and hearing the ask, before the generic fallback.
// RED: pickConversationChoice does not exist (require fails).
// GREEN: all fixtures pick as specified.
'use strict';
const assert = require('assert');
const { pickConversationChoice } = require('./journey-social-r226-helpers');

const FAVOR_MENU = [
  { id: 'dlg:favor_requirements', text: 'Why can’t I do this now?' },
  { id: 'dlg:commit', text: '“I’ll come back to help.”' },
  { id: 'dlg:cant', text: '“I can’t right now.”' },
  { id: 'dlg:subject', text: 'Something else' },
  { id: 'leave', text: 'Leave' },
  { id: 'silence', text: '...' },
];
const FAVOR_MENU_WITH_DETAILS = [
  { id: 'dlg:favor_requirements', text: 'Why can’t I do this now?' },
  { id: 'dlg:commit', text: '“I’ll come back to help.”' },
  { id: 'dlg:details', text: '“Tell me why you need this.”' },
  { id: 'dlg:cant', text: '“I can’t right now.”' },
  { id: 'dlg:subject', text: 'Something else' },
  { id: 'leave', text: 'Leave' },
  { id: 'silence', text: '...' },
];
const GENERIC_MENU = [
  { id: 'dlg:commit', text: '“I’ll do it.”' },
  { id: 'dlg:cant', text: '“Actually — I can’t.”' },
];

let n = 0;
function check(name, got, want) {
  n++;
  assert.strictEqual(got && got.id, want, `${name}: picked ${got && got.id}, want ${want}`);
  console.log(`ok ${n} - ${name}`);
}

// 1. The defect, verbatim: favor menu, outing favor, details already heard
// (not offered) — the old driver looped on favor_requirements forever.
check('forage_help favor menu commits',
  pickConversationChoice(FAVOR_MENU, { favorKind: 'forage_help' }), 'dlg:commit');
check('water_haul favor menu commits',
  pickConversationChoice(FAVOR_MENU, { favorKind: 'water_haul' }), 'dlg:commit');
// 2. Hear the ask first: details offered → details wins over commit.
check('details offered before commit',
  pickConversationChoice(FAVOR_MENU_WITH_DETAILS, { favorKind: 'forage_help' }), 'dlg:details');
// 3. Scope: a stay_close favor keeps the OLD behavior (no commit rule for
// kinds the driver cannot keep via the dawn arms).
check('stay_close favor does not commit',
  pickConversationChoice(FAVOR_MENU, { favorKind: 'stay_close' }), 'dlg:favor_requirements');
// 4. No favor kind at all (generic want menu) — commit is first anyway,
// fallback reaches it; behavior unchanged.
check('generic commit menu still commits',
  pickConversationChoice(GENERIC_MENU, {}), 'dlg:commit');
// 5. Answer their question first, even when commit is offered.
check('question beats commit',
  pickConversationChoice(
    [{ id: 'gq:origin', text: 'Where are you from?' }, ...FAVOR_MENU],
    { favorKind: 'forage_help' }), 'gq:origin');
// 6. Exit signal: the NPC is leaving — bye wins over commit.
check('exit signal beats commit',
  pickConversationChoice(FAVOR_MENU, { favorKind: 'forage_help', lastNPCText: 'I should get back to it — but this was nice.' }), 'leave');
// 7. No commit offered — the old fallback stands (requirements first).
check('no commit offered falls back to requirements',
  pickConversationChoice(FAVOR_MENU.filter(c => c.id !== 'dlg:commit'), { favorKind: 'forage_help' }), 'dlg:favor_requirements');
// 8. Empty menu — null, never a crash.
assert.strictEqual(pickConversationChoice([], { favorKind: 'forage_help' }), null);
n++;
console.log(`ok ${n} - empty menu returns null`);
console.log(`PASS ${n}/${n} driver-commit fixtures`);
