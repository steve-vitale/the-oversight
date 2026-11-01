#!/usr/bin/env node
// scripts/test-journey-establishment-r72-favor-goon-20261101.js — proof test
// for the r72 fix (r71 blank #1: favor-menu goon omission).
// r71 proved, code-grounded: buildMenu's favor branch (conversation.js, the
// `c.thread === 'want'` + favor-promised early return) returned the favor
// menu + dlg:subject + leave with NO goon continuer, while the endtopic
// branch and the general path both unshift goon whenever heldBeats is
// non-empty. Panel evidence: 6 QUEUED-NOT-OFFERED instances, all on favor
// menus; Elena 361's moodBeat ("They relax, a fraction. This is going
// well.") died unspoken at close. Invitations park via invitePending
// (deferred, not lost); moodBeats have no parking and are simply gone.
// FIX (one site): the favor branch unshifts goon when heldBeats is
// non-empty, mirroring the endtopic branch. The fix OFFERS the continuer;
// it does not force it — a player who still picks subject/leave loses
// the beat by design (one-beat turns, convoDropUnspoken).
// GREEN means: favor menu offers goon when a beat is held, taking goon
// voices the queued beat, the favor menu is unchanged when nothing is
// held, and the intentionally-narrow menus (trade decision, windingDown
// close) gain no goon. BEFORE the fix, A fails (verified by pre-fix run).
// Usage: node scripts/test-journey-establishment-r72-favor-goon-20261101.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const fails = [];
  const ok = (name, cond, detail) => {
    if (cond) console.log(`ok - ${name}`);
    else fails.push(`${name}: ${detail}`);
  };

  const { Game } = await loadGame({ seed: 372001, mode: 'r72-proof' });
  await setupGame(Game);
  const v = Game.state.village;
  const me = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== me);
  if (roster.length < 1) { console.error('construction invalid: roster too small'); process.exit(2); }
  const H = roster[0];
  const MOOD = 'They relax, a fraction. This is going well.';

  // Shared favor-sitting shape: thread want, favor promised, no question
  // hanging, not choosing a subject, not winding down.
  function favorSitting(held) {
    const c = Game.convoGet(H);
    c.active = true;
    c.transcript = c.transcript || [];
    c.thread = 'want';
    c.want = { id: 'ask_favor', favor: { vid: H, state: 'promised', kind: 'food_share' } };
    c.choosingSubject = false;
    c.pendingQ = null; c.reactiveQ = null; c.genericQ = null;
    c.windingDown = false; c.spokenBeat = null;
    c.pendingTrade = null; c.pendingHawk = null;
    c.spent = {};
    c.replyMenu = null;
    c.heldBeats = held;
    return c;
  }
  const ids = (menu) => (menu || []).map(ch => ch.id);

  // A. Favor menu WITH a held moodBeat offers goon, ahead of subject/leave.
  const cA = favorSitting([{ text: MOOD, moodBeat: true }]);
  const menuA = ids(Game.convoChoices(H));
  ok('A. favor menu offers goon when a beat is held',
    menuA.includes('goon'), `menu=${JSON.stringify(menuA)}`);
  ok('A2. goon precedes subject and leave on the favor menu',
    menuA.includes('goon') && menuA.indexOf('goon') < menuA.indexOf('dlg:subject') &&
    menuA.indexOf('goon') < menuA.indexOf('leave'), `menu=${JSON.stringify(menuA)}`);
  ok('A3. favor menu still carries the favor business',
    menuA.includes('dlg:favor_requirements'), `menu=${JSON.stringify(menuA)}`);

  // B. Taking goon voices the queued beat and drains it (one per turn).
  const resB = Game.convoTurn(H, 'goon');
  const spoken = (cA.transcript || []).map(t => String(t.text || '')).join('\n');
  ok('B. goon turn voices the queued moodBeat',
    spoken.includes('They relax, a fraction'), `transcript tail=${JSON.stringify(spoken.slice(-300))}`);
  ok('B2. heldBeats drains by one on a goon turn',
    (cA.heldBeats || []).length === 0, `held=${JSON.stringify(cA.heldBeats)}`);
  void resB;

  // C. Favor menu with NOTHING held is unchanged: no goon, favor business intact.
  favorSitting([]);
  const menuC = ids(Game.convoChoices(H));
  ok('C. favor menu with nothing held offers no goon',
    !menuC.includes('goon'), `menu=${JSON.stringify(menuC)}`);
  ok('C2. favor menu with nothing held keeps favor business + subject + leave',
    menuC.includes('dlg:favor_requirements') && menuC.includes('dlg:subject') &&
    menuC.includes('leave'), `menu=${JSON.stringify(menuC)}`);

  // D. Intentionally-narrow menus gain no goon (out-of-scope branches).
  const cD = favorSitting([{ text: MOOD, moodBeat: true }]);
  cD.thread = 'trade'; cD.pendingTrade = {};
  const menuD = ids(Game.convoChoices(H));
  ok('D. trade decision menu gains no goon even with a beat held',
    !menuD.includes('goon') && menuD.includes('trade_yes') && menuD.includes('trade_no'),
    `menu=${JSON.stringify(menuD)}`);
  const cE = favorSitting([{ text: MOOD, moodBeat: true }]);
  cE.windingDown = true;
  const menuE = ids(Game.convoChoices(H));
  ok('E. windingDown close menu gains no goon even with a beat held',
    !menuE.includes('goon') && menuE.includes('leave'), `menu=${JSON.stringify(menuE)}`);

  if (fails.length) {
    console.error(`\nFAIL (${fails.length}):`);
    for (const f of fails) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log('\nPASS: favor-goon proof (r72)');
}

main().catch(e => { console.error('proof crashed:', e && e.stack || e); process.exit(2); });
