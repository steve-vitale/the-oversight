#!/usr/bin/env node
// test-grapevine-r39-20261022.js -- PROOF TEST (journey-social r39, THE GRAPEVINE).
//
// BLANK 1 (H2): recordDeed seeded NPC-deed gossip heard-less AND who-less —
// born dead on both counts. spreadGossip only iterates g.heard as tellers and
// askAbout only serves gossip the speaker has heard, so a heard-less entry
// could never travel. Measured in the r39 pilot (warm-competent, seeds
// 3601-3604): 255 deed entries born heard-less, 0 ever gained a hearer.
// And who-less gossip is the PLAYER channel: the fallback render says
// "word is YOU stood your ground out there" and spreadGossip pays the rep to
// the HEARER — an NPC's monster kill would credit the player.
// FIX (villager-agency.js recordDeed): the doer tells it themself plus one
// witness (same pattern as departure/return gossip), and dims.who names the
// doer so rep and rendering attribute the deed correctly.
//
// BLANK 2 (salience): askAbout's aboutOther class was pure recency, so a hot
// reputation rumor always lost the first serve to same-day water-trip news.
// Measured: a 5-hearer stingy rumor (distortion 4) never won the first serve
// across 4 pilot runs; a probe showed even 4 "tell me more"s couldn't reach
// it under departure/return churn. The rumor had no audible return path to
// its author — fragments tease ("X telling Y about Z") but never deliver
// content.
// FIX (game.js askAbout): reputation rumors (the 5 rumor verbs) outrank
// routine news within "about other people" — freshest-first within each
// class; the walk-down still reaches the rest. Implements the salience
// comment's own promise: "rumors about other people, then the freshest
// remaining word."
//
// BEFORE (r39 pilot corpus, evidence/2026-10-22/social-r39-*):
//   F1: 255 deed entries born heard-less, 0 gained a hearer (4/4 runs).
//   Salience: 12 gossip convos, 0 served a reputation rumor; probe (seed
//   3601 d3): 5 hearers knew the stingy rumor, all 5 served departures or
//   knack lines first, and 4 walk-down steps still served departures/returns.
// AFTER (this test): deed gossip travels with correct attribution; the rumor
// verb outranks fresher news.
//
// Usage: node scripts/test-grapevine-r39-20261022.js
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');
const safe = (fn, d) => { try { return fn(); } catch (e) { return d; } };

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

async function main() {
  const { Game } = await loadGame({ seed: 777, mode: 'grapevine-proof' });
  await setupGame(Game);
  const v = Game.state.village;
  const sid = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== sid && !safe(() => Game.getPerson(id).dead, true));
  const doer = roster[0], wit = roster[1], hearer = roster[2];
  const dname = Game.displayName(doer);

  console.log('PART 1: deed gossip travels and attributes to the doer');
  const repBefore = safe(() => (Game.repOf(doer) || {}).brave || 0, 0);
  const repHearerBefore = safe(() => (Game.repOf(hearer) || {}).brave || 0, 0);
  Game.recordDeed(doer, 'monster_kill', `${dname} killed a ridge deer and walked home.`, 10);
  const deed = (v.gossip || []).find(g => g.action === 'deed');
  check('deed gossip seeded', !!deed);
  check('deed gossip has hearers at seed (not born dead)', deed && (deed.heard || []).length >= 1,
    `heard=${deed && (deed.heard || []).length}`);
  check('deed gossip names the doer (dims.who)', deed && ((deed.dims || {}).who === doer));
  check('doer is among the first hearers (tells it themself)', deed && (deed.heard || []).includes(doer));
  const heard0 = (deed.heard || []).length;
  for (let i = 0; i < 6; i++) { try { Game.spreadGossip(); } catch (e) {} }
  check('deed gossip travels (heard grows past seed witnesses)', (deed.heard || []).length > heard0,
    `heard ${heard0} -> ${(deed.heard || []).length}`);
  const repAfter = safe(() => (Game.repOf(doer) || {}).brave || 0, 0);
  check('doer\'s brave rep increased (rep lands on the doer)', repAfter > repBefore,
    `brave ${repBefore} -> ${repAfter}`);
  const repHearerAfter = safe(() => (Game.repOf(hearer) || {}).brave || 0, 0);
  check('a mere hearer\'s brave rep did NOT inflate', repHearerAfter === repHearerBefore,
    `hearer brave ${repHearerBefore} -> ${repHearerAfter}`);

  // Render: with only the deed gossip in the pool, askAbout must attribute
  // the deed to the doer — never "word is YOU...".
  v.gossip = (v.gossip || []).filter(g => g === deed);
  const said = [];
  const origSay = Game.say;
  Game.say = (m) => { said.push(String(m)); };
  let res = null;
  try { res = Game.askAbout(hearer, 'gossip', { inConvo: true, skipSigs: [] }); } catch (e) { res = { error: e.message }; }
  Game.say = origSay;
  const line = said.join(' ');
  check('deed gossip served in conversation', !!(res && res.gossip && res.gossip.action === 'deed'),
    `sig=${res && res.gossipSig}`);
  check('render names the doer', line.includes(dname), line.slice(0, 140));
  check('render does NOT credit the player ("you")', !/word is you( |$|')/i.test(line) && !/you stood your ground/i.test(line),
    line.slice(0, 140));

  console.log('PART 2: reputation rumor outranks fresher routine news');
  // Fresh world slice: wipe gossip, seed a stingy rumor (older) then a
  // fresher departure, both heard by the same villager.
  v.gossip = [];
  const subj = roster[3], newsSubj = roster[4];
  const sname = Game.displayName(subj);
  Game.spreadRumor(subj, 'stingy', hearer);
  Game.state.scholar.day += 1; // departure is strictly fresher
  Game.seedGossip('departure', { who: newsSubj, purpose: 'water' }, [hearer]);
  const said2 = [];
  Game.say = (m) => { said2.push(String(m)); };
  const served = [];
  const skip = [];
  for (let i = 0; i < 4 && served.filter(s => /^gossip:/.test(s)).length < 2; i++) {
    let r2 = null;
    try { r2 = Game.askAbout(hearer, 'gossip', { inConvo: true, skipSigs: skip }); } catch (e) { break; }
    if (r2 && r2.gossipSig) { skip.push(r2.gossipSig); served.push(r2.gossipSig); }
    else break;
  }
  Game.say = origSay;
  const firstGossip = served.find(s => /^gossip:/.test(s));
  check('a gossip entry was served', !!firstGossip, `served=[${served.join(', ')}]`);
  check('the FIRST gossip served is the stingy rumor, not the fresher departure',
    !!firstGossip && /gossip:stingy\|/.test(firstGossip), `first=${firstGossip}`);
  const rumorLine = said2.join(' ');
  check('rumor render attributes to the subject', rumorLine.includes(sname) || /holding back/.test(rumorLine),
    rumorLine.slice(0, 160));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF CRASH:', e.stack); process.exit(2); });
