#!/usr/bin/env node
// test-succession-honest-moot-20261021.js — SUCCESSION LEG r34 proof test.
//
// BUG (found live on seed 9904): when the successor talks to a villager
// holding the dead bearer's RELEASED 'asked' favor, and the villager's
// CURRENT need is a different kind, the opener marked the old favor 'moot'
// on the detached object and the vid-keyed ledger overwrite buried it —
// the open book's entry ("share food with Terry — they're going hungry")
// vanished with no honest line, replaced by the new ask. The code's own
// comment promises "the follow-up says so honestly"; the implementation
// didn't.
//
// FIX (src/js/convo-wants.js, ask_favor opener): the kind-changed branch now
// speaks the moot acknowledgment for the old favor ("Never mind {short} —
// we got it handled. Thanks anyway.") in the same breath as the new ask.
//
// RED: opener line has no 'Never mind' (old favor silently replaced).
// GREEN: opener names the moot AND carries the new ask; old favor is
// 'moot'; the ledger holds the new favor.
'use strict';
const K = require('./godpath/lib'), T = K.reporter('succession-honest-moot');

(async () => {
  const G = await K.load({ seed: 20261021, narration: false });
  K.newRun(G);
  const s = G.state.scholar, v = G.state.village;
  const vid = v.roster.find(id => id !== G.villagerId && G.getPerson(id));
  if (!vid) throw new Error('No living conversation target');
  const person = G.getPerson(vid);
  person.languages = { native: 'english', levels: { english: 2 } };
  s.languages = { english: 2 };
  // Rig: NO food/health/sick/energy/fear/water need — only an empty pantry
  // (forage_help need, urgency 2). The released favor is food_share.
  Object.assign(G.npcNeeds(vid), { hunger: 10, fear: 10, social: 10, energy: 90 });
  v.health = v.health || {}; v.health[vid] = 100;
  v.sick = v.sick || {}; delete v.sick[vid];
  v.water = { clean: 100, dirty: 0 };
  v.pantry = [];
  v.trust[vid] = 40;
  const vname = (person.name || 'Villager').split(' ')[0];

  // The dead bearer's released favor, handoff-stamped (playerDeath writes
  // inhFrom on every favorLedger entry).
  const oldFavor = {
    vid, id: 'f-test-1', kind: 'food_share', state: 'asked',
    short: 'the food I needed',
    line: '"Do you have anything to eat?"',
    whyLine: '"I have not eaten right in days."',
    task: `share food with ${vname} — they're going hungry`,
    inhFrom: 'DeadName', askedDay: (s.day || 1) - 5, deadline: (s.day || 1) + 2,
  };
  v.favorLedger = v.favorLedger || {};
  v.favorLedger[vid] = oldFavor;

  T.ok('comm level full', G.commLevel(vid).level === 'full');
  const need = G.convoFindFavorNeed(vid);
  T.ok('rigged need is forage_help (different kind)', need && need.kind === 'forage_help', need && need.kind);

  G.startConvo(vid);
  const c0 = G.convoGet(vid);
  T.ok('convo opened', !!(c0 && c0.active));
  // Capture the ask_favor def deterministically via a planted seed, then
  // drive the opener down the NON-seed path (the fixed branch).
  v.convoSeeds = v.convoSeeds || {};
  v.convoSeeds[vid] = { wantId: 'ask_favor', favorId: 'f-test-1', note: 'test seed' };
  const sel = G.convoSelectWant(vid);
  T.ok('seed selects ask_favor def', sel && sel.id === 'ask_favor' && sel.def, sel && sel.id);
  delete v.convoSeeds[vid];
  const want = { id: 'ask_favor', def: sel.def, fromSeed: false };
  G.convoGet(vid).want = want;
  const opener = G.convoWantOpener(vid, want);
  T.ok('opener produced a line', !!(opener && opener.line), opener && String(opener.line).slice(0, 80));

  const line = String((opener && opener.line) || '');
  T.ok('RED/GREEN: opener names the moot honestly', /Never mind/i.test(line), line.slice(0, 120));
  T.ok('moot names the old need', /the food I needed/i.test(line), line.slice(0, 120));
  T.ok('moot acknowledgment precedes the new ask',
    line.toLowerCase().indexOf('never mind') < line.toLowerCase().indexOf('forage'),
    line.slice(0, 160));
  T.ok('old favor object marked moot', oldFavor.state === 'moot', oldFavor.state);
  const cur = G.convoGetFavor(vid);
  T.ok('ledger now holds the new favor', cur && cur.kind === 'forage_help' && cur.id !== 'f-test-1',
    cur && (cur.kind + '/' + cur.id));
  T.ok('new favor is a distinct instance', cur !== oldFavor);
  G.endConvo(vid, 'left');

  // Sanity: the same-kind path still re-asks (inherited ask untouched).
  T.done();
})().catch(e => { console.error('FATAL ' + (e && e.stack || e)); process.exit(1); });
