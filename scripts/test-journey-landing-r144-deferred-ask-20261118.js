#!/usr/bin/env node
'use strict';
// Proof: the r231 deferred-ask guard states the live ask, not the settled
// line (journey-landing r144, 2026-11-18; r143 metric review item 2).
// Panel shape: a villager's ask_favor want never got its favor (the
// opener was pre-empted, stage 0) while a LIVE need exists — and the
// favor ledger still holds an old SETTLED favor for them. Pressing
// "How can I help?" (dlg:help) used to answer "It's already handled.
// Thank you for asking." — burying the live ask under the dead favor
// (panel: 10 of 13 residual favorless sits pressed dlg:help into this
// branch, every one carrying a settled ledger favor while the want had
// none). The r231 guard (convo-dialogue.js dlg:help + convo-wants.js
// engageBeat deferred branch) skips the settled short-circuit when the
// want is favorless at stage 0 and a live need exists, and states the
// deferred ask instead.
// RED: with the guard removed (settled branch unconditional), the
// trigger case answers the settled line; the live ask never surfaces.
// GREEN: the trigger case states the live ask; the control (same
// staging, no live need) still answers the settled line honestly.
// Cases: (1) trigger — live food_share need (hunger 90) + settled
// ledger favor + favorless stage-0 ask_favor want; (2) control —
// same staging but the live need nulled (recent decline), so the
// settled answer is the honest one.
// Staging follows the r143 confront-stale proof: the pre-empted
// opener is staged as state (favorless stage-0 want), not replayed.
// Uses the shared harness (scripts/godpath/lib). Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

const SETTLED_LINE = "It's already handled. Thank you for asking.";
// The live food_share ask, as built by convoBuildFavor for a hungry
// villager — the deferred branch states it via the ask_favor opener.
const ASK_MARKERS = ['spare', 'hungr', 'food', 'eat', 'starv', 'going like this'];

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

const _usedSpeakers = new Set();
function freshSpeaker(Game, v) {
  const oldId = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== oldId && !_usedSpeakers.has(id));
  const speaker = roster.find(id => {
    try { return Game.commLevel(id).level === 'full'; } catch (e) { return false; }
  }) || roster[0];
  _usedSpeakers.add(speaker);
  v.trust = v.trust || {};
  v.trust[speaker] = 50;
  return speaker;
}

// Clear the pending opening question so dlg:help is in the menu.
function clearOpeningQ(Game, vid) {
  const menu = Game.convoChoices(vid).map(ch => ch.id);
  const ans = menu.find(id => id.indexOf('ans:') === 0);
  if (ans) Game.convoTurn(vid, ans);
}

function menuIds(Game, vid) {
  return Game.convoChoices(vid).map(ch => ch.id);
}

function themLines(Game, vid, prevLen) {
  const c = Game.convoGet(vid);
  return (c.transcript || []).slice(prevLen).filter(e => e.who === 'them').map(e => String(e.text)).join(' ');
}

async function main() {
  const Game = await K.load({ seed: 4242 });
  K.newRun(Game);
  const v = Game.state.village;
  v.needs = v.needs || {};

  // ---- (1) TRIGGER: live need + settled ledger favor, want favorless ----
  const s1 = freshSpeaker(Game, v);
  v.needs[s1] = { hunger: 0, fear: 0, social: 40, energy: 70 };
  const opened1 = Game.startConvo(s1);
  check('(1) sitting opens', !!(opened1 && !opened1.refused && !opened1.ended));
  // The opener speaks small talk (no live need yet, so ask_favor is not
  // picked and no food ask enters the no-repeat ledger).
  v.needs[s1].hunger = 90;
  const need1 = Game.convoFindFavorNeed(s1);
  check('(1) a live food_share need exists', !!(need1 && need1.kind === 'food_share'),
    JSON.stringify(need1));
  const picked1 = Game.convoSelectWant(s1);
  check('(1) the picker selects ask_favor on the live need', !!(picked1 && picked1.id === 'ask_favor' && picked1.def),
    JSON.stringify(picked1 && picked1.id));
  Game.convoStoreFavor({ id: 'fav-settled-1', vid: s1, kind: 'food_share', state: 'fulfilled', short: 'some food', line: '"Could you spare some food?"' });
  check('(1) the ledger holds a settled favor', Game.convoGetFavor(s1) && Game.convoGetFavor(s1).state === 'fulfilled');
  const c1 = Game.convoGet(s1);
  // The pre-empted opener, staged as state: the want never got its favor.
  c1.want = { id: 'ask_favor', def: picked1.def, stage: 0, fromSeed: false, seedNote: null, seedFavorId: null, seedQid: null };
  check('(1) the want is favorless at stage 0', c1.want.id === 'ask_favor' && !c1.want.favor && (c1.want.stage || 0) < 1);
  clearOpeningQ(Game, s1);
  check('(1) dlg:help is offered', menuIds(Game, s1).indexOf('dlg:help') >= 0,
    JSON.stringify(menuIds(Game, s1)));
  const prevLen1 = (c1.transcript || []).length;
  const r1 = Game.convoTurn(s1, 'dlg:help');
  const them1 = themLines(Game, s1, prevLen1);
  console.log('      (1) dlg:help line: ' + JSON.stringify(them1.slice(0, 160)));
  check('(1) the settled line does NOT fire (guard held)',
    them1.indexOf(SETTLED_LINE) < 0, them1.slice(0, 200));
  check('(1) the live ask is stated',
    ASK_MARKERS.some(m => them1.toLowerCase().indexOf(m) >= 0), them1.slice(0, 200));
  check('(1) the sitting continues', !!(r1 && !r1.ended));
  Game.endConvo(s1, 'done');

  // ---- (2) CONTROL: same staging, no live need -> settled line ----
  // The ask_favor def is a shared singleton (WANTS.ask_favor) — the def
  // captured in (1) is the same object the picker would hand this
  // speaker, so no second picker call is needed (the picker may rank
  // another want first for this speaker; the control is about dlg:help,
  // not the picker).
  // Find a speaker whose staged sitting offers dlg:help: some openers
  // (e.g. a volunteered secret) put the menu on a thread that hides the
  // want options, and such a sitting can never press dlg:help — the
  // panel's trigger case is, by definition, a sitting that offers it.
  let s2 = null, c2 = null;
  const roster2 = (v.roster || []).filter(id => id !== Game.villagerId && !_usedSpeakers.has(id));
  for (const cand of roster2) {
    v.trust = v.trust || {};
    v.trust[cand] = 50;
    v.needs[cand] = { hunger: 0, fear: 0, social: 40, energy: 70 };
    const opened = Game.startConvo(cand);
    if (!(opened && !opened.refused && !opened.ended)) { try { Game.endConvo(cand, 'done'); } catch (e) {} continue; }
    // Null the live need: declined recently, so they are not asking again.
    v.favorDeclined = v.favorDeclined || {};
    v.favorDeclined[cand] = Game.state.scholar.day || 0;
    Game.convoStoreFavor({ id: 'fav-settled-2', vid: cand, kind: 'food_share', state: 'fulfilled', short: 'some food', line: '"Could you spare some food?"' });
    const cc = Game.convoGet(cand);
    cc.want = { id: 'ask_favor', def: picked1.def, stage: 0, fromSeed: false, seedNote: null, seedFavorId: null, seedQid: null };
    clearOpeningQ(Game, cand);
    if (menuIds(Game, cand).indexOf('dlg:help') >= 0) { s2 = cand; c2 = cc; _usedSpeakers.add(cand); break; }
    try { Game.endConvo(cand, 'done'); } catch (e) {}
  }
  check('(2) found a sitting offering dlg:help', !!s2);
  check('(2) no live need remains', Game.convoFindFavorNeed(s2) == null,
    JSON.stringify(Game.convoFindFavorNeed(s2)));
  check('(2) the ledger holds a settled favor', Game.convoGetFavor(s2) && Game.convoGetFavor(s2).state === 'fulfilled');
  const prevLen2 = (c2.transcript || []).length;
  const r2 = Game.convoTurn(s2, 'dlg:help');
  const them2 = themLines(Game, s2, prevLen2);
  console.log('      (2) dlg:help line: ' + JSON.stringify(them2.slice(0, 160)));
  check('(2) the settled line fires when there is no live need',
    them2.indexOf(SETTLED_LINE) >= 0, them2.slice(0, 200));
  check('(2) the sitting continues', !!(r2 && !r2.ended));
  Game.endConvo(s2, 'done');

  console.log(`\nRESULT: ${pass} pass, 0 fail`);
}

main().catch(error => { console.error(error.stack); process.exitCode = 1; });
