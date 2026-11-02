#!/usr/bin/env node
// test-journey-social-r110-moot-recall.js — PROOF for the journey-social
// r110 blank: the conversation "Call a moot" choice re-offers after the
// moot is already in session, and re-picks speak "The moot is called"
// verbatim while the engine no-ops (callMoot is idempotent on c.trial).
// Observed in the wild in r110v1 seed 31103, days 13-15: moot, then
// "Say nothing" (letItLie -> status dormant, trial NOT cleared), then
// moot x3+ — the menu guard only hides the choice for open +
// awaitingPlayerVote, so a dormant case with a pending trial keeps
// offering a moot that can never re-convene.
// Fix (betrayal.js): (1) hide betrayal:moot: while cs.trial exists, any
// status; (2) when callMoot returns null the handler speaks an honest
// already-called line instead of "The moot is called."
// Usage: node scripts/test-journey-social-r110-moot-recall.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra || ''); }
}
const themLines = (Game, vid) =>
  Game.convoGet(vid).transcript.filter(e => e.who === 'them').map(e => String(e.text));
const choiceIds = (Game, vid) => (Game.convoChoices(vid) || []).map(x => String(x.id || ''));
// All pages: convoMenuPage paginates long menus, so a single page read can
// miss case actions. Walk menu:more until the page cycles back.
function allChoiceIds(Game, vid) {
  const seen = new Set();
  const pages = [];
  for (let i = 0; i < 12; i++) {
    const ids = choiceIds(Game, vid);
    pages.push(ids);
    for (const id of ids) seen.add(id);
    if (!ids.includes('menu:more')) break;
    const r = Game.convoNextMenu(vid);
    if (!r || !r.choices) break;
    if (i > 0 && choiceIds(Game, vid).join(',') === pages[0].join(',')) break;
  }
  return [...seen];
}
// Drive to a free-talk menu (opening questions/wants own their menus and
// filter case actions out) without touching the case choices.
function driveToCaseMenu(Game, vid, mootId, letlieId) {
  for (let t = 0; t < 16; t++) {
    const ids = allChoiceIds(Game, vid);
    if (ids.includes(mootId)) return true;
    const cur = choiceIds(Game, vid);
    let pick = cur.find(id => /^ans:/.test(id)) || cur.find(id => /^gq:/.test(id))
      || cur.find(id => /^dlg:/.test(id)) || cur.find(id => id === 'goon')
      || cur.find(id => id !== 'leave' && id !== 'silence' && id !== 'menu:more' && !id.startsWith('betrayal:'));
    if (!pick) return false;
    Game.convoTurn(vid, pick);
    const c = Game.convoGet(vid);
    if (!c || !c.active) return false;
  }
  return allChoiceIds(Game, vid).includes(mootId);
}

(async () => {
  const { Game } = await loadGame({ seed: 31103, mode: 'test-moot-recall' });
  await setupGame(Game);
  Game.say = () => {}; Game.sysSay = () => {}; Game.emit = () => {};
  const vids = Game.state.village.roster.filter(id => id !== Game.villagerId);
  const [leader, accomplice, target, partner] = vids;
  const plot = { id: 'plot-proof', leader, accomplices: [accomplice], target, weakest: accomplice, witnesses: [] };
  const c = Game.openCase(plot, 'ambush');
  c.knownToPlayer = true;
  console.log('T1: moot offered on a fresh open case, and calling it sets a trial');
  Game.startConvo(partner);
  const mootId = 'betrayal:moot:' + c.id;
  const letlieId = 'betrayal:letlie:' + c.id;
  ok(driveToCaseMenu(Game, partner, mootId, letlieId), 'reached a menu offering the moot choice', '');
  let ids = allChoiceIds(Game, partner);
  ok(ids.includes(mootId), 'moot choice offered pre-call', ids.filter(i => i.includes('moot')).join(','));
  ok(ids.includes(letlieId), 'letlie choice offered pre-call', '');
  Game.convoTurn(partner, mootId);
  const afterMoot = Game.getCase(c.id);
  ok(!!afterMoot.trial, 'trial set after first moot call', JSON.stringify(afterMoot.status));
  console.log('T2: after letItLie parks the case dormant, the moot choice is gone');
  Game.convoTurn(partner, letlieId);
  const parked = Game.getCase(c.id);
  ok(parked.status === 'dormant', 'letlie parks case dormant', parked.status);
  ok(!!parked.trial, 'trial survives letlie (the stale-trial shape)', '');
  ids = allChoiceIds(Game, partner);
  ok(!ids.includes(mootId), 'moot choice NOT re-offered with a pending trial', ids.filter(i => i.includes('moot')).join(','));
  console.log('T3: a direct re-call speaks honestly, never "The moot is called"');
  const before = themLines(Game, partner).length;
  try { Game.convoTurn(partner, mootId); } catch (e) { /* unoffered rejection is also honest */ }
  const spoken = themLines(Game, partner).slice(before);
  const lied = spoken.some(t => t.indexOf('The moot is called') !== -1);
  ok(!lied, 'no false "moot is called" line on re-call', JSON.stringify(spoken.slice(-2)));
  Game.endConvo(partner, 'left');
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
