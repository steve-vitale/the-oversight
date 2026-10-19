#!/usr/bin/env node
// test-titan-standdown-20261019.js — proof for the journey-endgame r20 blank fill.
//
// THE BLANK (r19's sharpest): once the call was sounded and Haven committed,
// there was NO player verb to release the muster (titanSelfActions offered
// council/call/commit only; titanReleaseCommitted fired only on
// victory/defeat). An unfillable muster = permanent 1000 kcal/blade/day bleed
// + unanswered-titan escalation every 5 days, with no player agency — a death
// spiral you could watch but not stop.
//
// THE FIX: `titan:standdown:<tid>` — breaks the muster: Haven's committed come
// home (titanReleaseCommitted), the upkeep bleed stops, answering fires walk
// home thinner (trust -5 each, said aloud). The omen stays located (stage 2)
// and escalation stays unanswered — retreat is not resolution; the call can
// be sounded again later.
//
// RED (before): titanSelfActions lists no standdown action; titanSelfDo
// returns null for it; an unfillable muster bleeds forever.
// GREEN (after): the action exists and fires; muster is null; committed are
// released; trust costs land; ledger records 'standdown:<tid>'.
//
// Usage: node scripts/test-titan-standdown-20261019.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; console.log('  FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

async function main() {
  const { Game } = await loadGame({ seed: 8991, mode: 'standdown-proof' });
  await setupGame(Game);

  const said = [];
  const osay = Game.say;
  Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return osay.call(this, t); };
  const ledger = [];
  Game.ledgerAdd = function (k, v) { ledger.push(k + ':' + v); };
  Game.recordMoment = function () {};

  // ---- fixture: one answering ally, one located titan ----
  Game.state.otherVillages = [
    { id: 'ashford', name: 'Ashford', opinion: 30, roster: [
      { id: 'ash_speaker', name: 'Mara Voss', alive: true },
      { id: 'ash_fighter', name: 'Tomm Rill', alive: true },
    ]},
  ];
  const linkAsh = { primary: 'haven', subordinate: 'ashford', status: 'active', trust: 60,
    theirSpeaker: { id: 'ash_speaker', name: 'Mara Voss' }, arrears: 0 };
  Game.mshipState = () => ({ links: [linkAsh] });
  Game.state.scholar.day = 100;
  // located omen, set directly (deterministic; titanOmen() would create it)
  Game._titanTest.titanState().omens.herald = { stage: 2, day: 95, warned: {} };

  // ---- 1. gating: no muster, no standdown verb (nothing to break) ----
  const acts0 = Game.titanSelfActions();
  check('no standdown action before any muster stands',
    !acts0.some(function (a) { return a.id === 'titan:standdown:herald'; }),
    'actions: ' + acts0.map(function (a) { return a.id; }).join(','));

  // ---- 2. honest player path: council -> call -> commit ----
  said.length = 0;
  Game.titanWarCouncil('herald');
  check('war council voices the ally', said.some(function (t) { return /Mara Voss/.test(t); }),
    said.join(' | ').slice(0, 200));
  const muster0 = Game.soundTitanCall('herald');
  check('call creates the muster', !!muster0 && !!Game._titanTest.titanState().musters.herald);
  check('ashford answers (trust 60, opinion 30)', (muster0.allies || []).length >= 2,
    'allies=' + (muster0.allies || []).length);
  Game.titanCommitOwn('herald'); // first tap: names volunteers, states cost
  const r2 = Game.titanCommitOwn('herald'); // second tap: they march
  const st = Game._titanTest.titanState();
  const havenN = (st.musters.herald.haven || []).length;
  const committed = Object.keys((Game.state.village || {}).titanCommitted || {});
  check('haven commits blades (two taps)', havenN >= 1 && r2 && committed.length === havenN,
    'haven=' + havenN + ' committed=' + committed.length);
  const beforeTrust = linkAsh.trust;

  // ---- 2b. haven-only musters eat too (r20 upkeep fix) ----
  // The commit verb promises "eat from your stores (1000 kcal/day each)" —
  // the old `!muster.allies.length` early-return silently exempted
  // haven-only musters. Probe with a stubbed-empty pack (deterministic).
  const savedAllies = (st.musters.herald.allies || []).slice();
  const savedSpend = Game.playerPackSpend;
  st.musters.herald.allies = [];
  delete st.musters.herald.lastUpkeep;
  Game.playerPackSpend = function () { return 0; };
  said.length = 0;
  Game._titanTest.titanMusterUpkeep(Game.state.scholar.day);
  check('haven-only muster is charged honestly (3 blades = 3,000 kcal)',
    said.some(function (t) { return /muster is hungry/i.test(t) && /of 3,000 kcal fed/.test(t); }),
    said.join(' | ').slice(0, 200));
  st.musters.herald.allies = savedAllies;
  delete st.musters.herald.lastUpkeep;
  Game.playerPackSpend = savedSpend;

  // ---- 1b. the verb appears once a muster stands ----
  const acts = Game.titanSelfActions();
  const sd = acts.filter(function (a) { return a.id === 'titan:standdown:herald'; });
  check('standdown action listed once the muster stands', sd.length === 1,
    'actions: ' + acts.map(function (a) { return a.id; }).join(','));
  check('hint names the cost honestly', sd.length === 1 && /trust/.test(sd[0].hint) && /come home/.test(sd[0].hint),
    sd.length ? sd[0].hint : 'no action');

  // ---- 3. stand down: the verb fires ----
  said.length = 0;
  const res = Game.titanSelfDo('titan:standdown:herald');
  check('titanSelfDo dispatches standdown', res === true, 'returned ' + JSON.stringify(res));
  check('said aloud with the muster breaking', said.some(function (t) { return /MUSTER BREAKS/.test(t); }),
    said.join(' | ').slice(0, 300));
  check('muster is gone', st.musters.herald === null || st.musters.herald === undefined);
  check("haven's committed are released (workforce returns)",
    Object.keys((Game.state.village || {}).titanCommitted || {}).length === 0);
  check('answering link pays trust -5', linkAsh.trust === beforeTrust - 5,
    'trust ' + beforeTrust + ' -> ' + linkAsh.trust);
  check('ledger records the standdown', ledger.indexOf('titan:standdown:herald') >= 0,
    ledger.join(','));

  // ---- 4. retreat is not resolution ----
  check('omen stays located (stage 2)', st.omens.herald.stage === 2,
    'stage=' + st.omens.herald.stage);
  said.length = 0;
  Game._titanTest.titanMusterUpkeep(Game.state.scholar.day);
  check('upkeep no longer charges a broken muster',
    !said.some(function (t) { return /muster is hungry/i.test(t); }),
    said.join(' | ').slice(0, 200));

  // ---- 5. the call can be sounded again later ----
  const muster1 = Game.soundTitanCall('herald');
  check('re-call re-creates the muster', !!muster1 && !!st.musters.herald);
  const acts2 = Game.titanSelfActions();
  check('standdown still offered on the new muster',
    acts2.some(function (a) { return a.id === 'titan:standdown:herald'; }));

  // ---- 6. no muster -> honest nothing ----
  st.musters.herald = null;
  said.length = 0;
  const res2 = Game.titanSelfDo('titan:standdown:herald');
  check('standdown with no muster says so honestly', res2 === null &&
    said.some(function (t) { return /nothing to stand down/i.test(t); }),
    said.join(' | ').slice(0, 200));

  console.log(pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}

main().catch(function (e) { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
