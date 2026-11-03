// test-arrears-clearing.js — proof for the arrears-clearing verb (gap-arrears,
// 2026-11-02): Haven-head tribute arrears never cleared, and no back-payment
// verb existed. The weekly tick only ever settled the CURRENT week's tribute;
// a subordinate's arrears sat on the ledger forever, even across fat-pantry
// weeks, and re-linking inherited them (debts survive the break).
//
// The verb (hierarchy.js): two played choices on a Haven-primary link —
//   Game.callInArrears(linkId) — call the old debt due. Later weekly ticks
//     take back-payment from the subordinate's own pantry AFTER that week's
//     tribute, week by week, until the ledger is clean. Real food, never
//     minted; the national x1.25 routing applies exactly as it does to
//     weekly tribute. Full settlement: trust +3 (the payTribute full-week
//     number, via _trustGain, so mourning still chokes gains).
//   Game.forgiveArrears(linkId) — wipe the ledger as mercy. Cost: the food
//     forgone, said aloud with the amount. Trust +6 via _trustGain.
// Both are wired into the Haven panel (app.js) next to Send grain, shown
// only while arrears > 0 on a Haven-primary link, and both are blocked
// for exiled / joined-away answerers like tendLink.
//
// Proof shape: identical scenarios, before/after. The BEFORE run (a small
// /tmp check against the unmodified tree, same fixture) shows: no verb
// exists (typeof undefined) and arrears never moves across a fat-pantry
// tick. The AFTER run (this file) shows the verb clearing arrears with
// the documented consequences, and the no-verb control still stuck — the
// verb is the mechanism, not an auto-clear.
//
// Fixture isolation, stated plainly: _linkedVillageWeek (the subordinate's
// own week sim, unseeded rolls in the harness) is stubbed to a no-op so
// the pantry numbers the collection reads are exact. The collection
// itself — debit their pantry, deposit into Haven's pantry, reduce
// arrears — is the real engine path, driven by the real linkTick.
//
// Usage: node scripts/test-arrears-clearing.js
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('arrears-clearing');

function pantryKcal(Game) {
  return (Game.state.village.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}
// One scenario: a fresh run, one Haven-primary link, arrears set by hand
// (how arrears got there — thin weeks — is already covered by
// test-hierarchy.js §4; this proof is about clearing them).
function scenario(Game, said, arrears, subPantry) {
  K.newRun(Game);
  Game.recordMoment = () => {};
  Game.ledgerAdd = () => {};
  said.length = 0;
  Game.state.scholar.day = 10;
  Game.state.nationalLive = false;
  Game.state.village.pantry = [];
  Game.state.otherVillages = [{
    id: 'vtest', name: 'Test Village', opinion: 40,
    roster: [{ id: 'spk', name: 'Speaker', alive: true }],
    pantryKcal: subPantry, x: 4, y: 4,
  }];
  const link = {
    id: 'link_arrears', primary: 'haven', subordinate: 'vtest',
    status: 'active', trust: 30, tributeKcalPerWeek: 2000,
    tributePaidWeek: -1, arrears: arrears, history: [],
    day: 10, pendingDemand: null,
    theirSpeaker: { id: 'spk', name: 'Speaker' },
  };
  Game.hierarchyState = () => [link];
  Game._linkedVillageWeek = () => {};
  return link;
}
function tick(Game) {
  Game.state.scholar.day = 14;
  Game.mshipState().lastLinkWeek = -99;
  Game.linkTick();
}

(async () => {
  const Game = await K.load({ seed: 20261102 });
  const said = K.captureSays(Game);

  T.ok('verbs exist', typeof Game.callInArrears === 'function' && typeof Game.forgiveArrears === 'function');

  T.section('1. guards');
  let link = scenario(Game, said, 0, 9000);
  T.ok('call with no arrears refuses', Game.callInArrears(link.id) === 0 && !link.arrearsCalled);
  T.ok('forgive with no arrears refuses', Game.forgiveArrears(link.id) === 0 && link.arrears === 0);
  T.ok('unknown link refuses', Game.callInArrears('nope') === null && Game.forgiveArrears('nope') === null);
  link = scenario(Game, said, 1000, 9000);
  link.primary = 'vtest'; link.subordinate = 'haven';
  T.ok('subordinate-direction link refuses both verbs',
    Game.callInArrears(link.id) === null && Game.forgiveArrears(link.id) === null && link.arrears === 1000);

  T.section('2. no-verb control: fat pantry, no call — arrears NEVER clears');
  link = scenario(Game, said, 3000, 9000);
  tick(Game);
  T.ok('control: arrears unchanged without the verb', link.arrears === 3000, 'arrears=' + link.arrears);
  T.ok('control: weekly tribute still arrived (2000)', pantryKcal(Game) === 2000, 'pantry=' + pantryKcal(Game));
  T.ok('control: weekly full payment still earns +1 trust', link.trust === 31, 'trust=' + link.trust);

  T.section('3. call-in, fat pantry: weekly tribute first, then the whole old debt');
  link = scenario(Game, said, 3000, 9000);
  T.ok('call-in stages', Game.callInArrears(link.id) === true && link.arrearsCalled === true);
  T.ok('call-in twice refuses (already out)', Game.callInArrears(link.id) === 0);
  tick(Game);
  T.ok('call-in: arrears cleared in full', link.arrears === 0, 'arrears=' + link.arrears);
  T.ok('call-in: flag clears with the debt', link.arrearsCalled === false);
  T.ok('call-in: subordinate pantry paid weekly + arrears (9000-2000-3000)',
    Game.state.otherVillages[0].pantryKcal === 4000, 'subPantry=' + Game.state.otherVillages[0].pantryKcal);
  T.ok('call-in: Haven pantry holds weekly + back-payment (5000)', pantryKcal(Game) === 5000, 'pantry=' + pantryKcal(Game));
  T.ok('call-in: trust weekly +1 and settlement +3 (30->34)', link.trust === 34, 'trust=' + link.trust);
  T.ok('call-in: settlement said aloud', said.some(t => /old debt|ledger is clean/.test(t)));

  T.section('4. call-in, thin pantry: partial back-payment; the debt waits');
  link = scenario(Game, said, 3000, 2500);
  Game.callInArrears(link.id);
  tick(Game);
  T.ok('partial: arrears reduced by what their fields could spare (3000->2500)',
    link.arrears === 2500, 'arrears=' + link.arrears);
  T.ok('partial: call stays out until clean', link.arrearsCalled === true);
  T.ok('partial: Haven pantry holds weekly + partial (2500)', pantryKcal(Game) === 2500, 'pantry=' + pantryKcal(Game));
  T.ok('partial: no trust penalty for trying (weekly +1 only, 30->31)', link.trust === 31, 'trust=' + link.trust);

  T.section('5. call-in, empty pantry: nothing to take; the debt waits');
  link = scenario(Game, said, 3000, 0);
  Game.callInArrears(link.id);
  tick(Game);
  T.ok('empty: weekly shortfall still accrues as before (3000+2000)', link.arrears === 5000, 'arrears=' + link.arrears);
  T.ok('empty: call stays out', link.arrearsCalled === true);
  T.ok('empty: said aloud', said.some(t => /old debt|empty/.test(t)));

  T.section('6. forgive: the ledger wiped as mercy; cost is the food forgone');
  link = scenario(Game, said, 4000, 9000);
  const forgiven = Game.forgiveArrears(link.id);
  T.ok('forgive: returns the amount forgiven', forgiven === 4000, 'returned=' + forgiven);
  T.ok('forgive: arrears zero', link.arrears === 0);
  T.ok('forgive: trust +6 (30->36)', link.trust === 36, 'trust=' + link.trust);
  T.ok('forgive: amount said aloud', said.some(t => /4,000/.test(t)));

  T.section('7. forgive during mourning: debt still forgives; trust gain waits');
  link = scenario(Game, said, 4000, 9000);
  link.mourningUntil = 99;
  Game.forgiveArrears(link.id);
  T.ok('mourning forgive: arrears zero anyway', link.arrears === 0);
  T.ok('mourning forgive: trust gain choked (stays 30)', link.trust === 30, 'trust=' + link.trust);

  T.section('8. UI wiring: the Haven panel offers both verbs on arrears links');
  const fs = require('fs');
  const path = require('path');
  const appSrc = fs.readFileSync(path.join(__dirname, '..', 'src/js/app.js'), 'utf8');
  T.ok('ui: call button rendered', appSrc.indexOf('data-link-arrears-call') >= 0);
  T.ok('ui: forgive button rendered', appSrc.indexOf('data-link-arrears-forgive') >= 0);
  T.ok('ui: call wired', appSrc.indexOf('Game.callInArrears') >= 0);
  T.ok('ui: forgive wired', appSrc.indexOf('Game.forgiveArrears') >= 0);

  T.done();
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });
