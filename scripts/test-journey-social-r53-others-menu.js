#!/usr/bin/env node
// test-journey-social-r53-others-menu.js -- PROOF TEST (journey-social r53).
// r52's funnel finding: the subject menu lists only 1-2 fresh topics
// (freshCap) in def order (lately, you, fears, others, ...), so 'others'
// — the village's social life surfacing (bonds, rifts, deeds) — is buried
// whenever you/fears are fresh: 90.5% of natural conversations never offer
// it. The r53 fix exempts 'ask:others' from freshCap counting in BOTH menu
// loops (subject menu + regular topic assembly); topicCapMood still bounds
// the whole menu, so the menu grows by at most one slot and 'others' may
// displace one generic ask — the intended tradeoff.
// GREEN = with you+fears fresh and nothing said, the subject menu offers
// 'ask:others'. RED (pre-fix) = you+fears take the freshCap slots and
// 'others' is absent even though it is fresh and gated-open.
// Premise guard: the test needs a villager whose temperament is not a
// deflector (topicCap 2 would leave no room even post-fix) and whose
// mood is not tense; candidates failing the premise are skipped, and the
// test SKIPs (exit 2) only if NO candidate meets the premise.
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');
const { offers } = require('./lib/conversation-playtest');

function safe(fn, d) { try { return fn(); } catch (e) { return d; } }

async function main() {
  const { Game } = await loadGame({ seed: 777053, mode: 'social-r53-others-menu-proof' });
  await setupGame(Game);
  const sid = Game.villagerId;
  const roster = (Game.state.village.roster || []).filter(id => id !== sid);
  if (!roster.length) { console.log('SKIP: no villagers'); process.exit(2); }

  let premiseMet = false;
  let fails = 0;
  const fail = (m) => { console.log('FAIL: ' + m); fails++; };

  for (const vid of roster) {
    const temper = safe(() => Game.npcTemper(vid), '?');
    if (temper === 'withdrawn' || temper === 'prickly' || temper === 'restless') continue;
    Game.state.village.trust = Game.state.village.trust || {};
    Game.state.village.trust[vid] = 30; // opens you(30)/fears(25)/others(20) by trust
    safe(() => Game.startConvo(vid), null);
    const c = Game.convoGet(vid);
    if (!c || !c.active) continue;
    // Fresh-everything state: nothing said, nothing asked, no thread, no
    // pending question — the subject menu's t2fresh loop sees you, fears,
    // others, neighbors, ... all fresh, in def order.
    c.said = {};
    c.askedTopics = [];
    c.thread = null;
    c.depth = 0;
    c.choosingSubject = true;
    c.pendingQ = null;
    c.reactiveQ = null;
    c.genericQ = null;
    c.spokenBeat = null;
    c.windingDown = false;
    c.heldBeats = [];
    delete c.replyMenu;
    const menu = offers(Game, vid) || [];
    const ids = menu.map(ch => ch.id);
    // Premise: this candidate's menu actually surfaces the two fresh topics
    // ahead of 'others' (you + fears). Without that premise the assertion
    // about 'others' is meaningless for this villager.
    if (!ids.includes('ask:you') || !ids.includes('ask:fears')) continue;
    premiseMet = true;
    console.log('candidate', safe(() => Game.displayName(vid), vid), 'temper', temper,
      'menu:', ids.join(','));
    if (!ids.includes('ask:others')) fail('ask:others absent from subject menu with you+fears fresh (vid ' + vid + ')');
    break; // one premise-meeting candidate decides the test
  }

  if (!premiseMet) { console.log('SKIP: no candidate met the you+fears-fresh premise'); process.exit(2); }
  if (fails) { console.log('RED: ' + fails + ' failure(s)'); process.exit(1); }
  console.log('GREEN: ask:others surfaces in the subject menu past freshCap');
  process.exit(0);
}

main().catch(e => { console.error('ERROR', e && e.stack || e); process.exit(1); });
