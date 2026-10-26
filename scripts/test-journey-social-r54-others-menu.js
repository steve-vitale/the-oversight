#!/usr/bin/env node
// test-journey-social-r54-others-menu.js -- PROOF TEST (journey-social r54).
// r53's diagnosis: the subject menu NEVER lists t2discussed, so a
// discussed-and-unchanged 'others' (67.8% of r53 menu-problem probe turns)
// can never surface; and fresh 'others' pages out because finish()
// ranks 'ask:others' last (rank 4) in paginated menus (32% of
// menu-problem turns, menuMore=true on ~90% of fresh cases).
// The r54 fix: (1) subject menu re-lists discussed-'others' after the
// asks loop ('others' only, not all discussed topics); (2) pager rank
// 'ask:others' joins the social-verbs band (rank 3, with gossip verbs).
// GREEN = in a discussed-and-unchanged 'others' state, the subject menu's
// built list AND page 1 both offer 'ask:others', and a real re-serving of
// the unchanged pick does not repeat the first serving's line verbatim
// (said-ledger, no-repeat contract). RED (pre-fix) = 'ask:others' absent
// from the built list entirely (and therefore from page 1).
// Premise: a villager with a deterministic 'close' pick (planted bond
// depth>=2, no grievances) so t2othersChanged is false; trust 30 opens
// you/fears/others/neighbors/advice/oldworld/skills. SKIP (exit 2) only if
// no roster candidate meets the premise.
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');
const { choose, reach } = require('./lib/conversation-playtest');

function safe(fn, d) { try { return fn(); } catch (e) { return d; } }

function subjectState(Game, vid) {
  const c = Game.convoGet(vid);
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
  const page1 = (Game.convoChoices(vid) || []).map(ch => ch.id);
  const built = Object.keys(Game.convoGet(vid).offeredReplies || {});
  const pages = Game.convoGet(vid).menuPages || 1;
  return { page1, built, pages };
}

async function main() {
  const { Game } = await loadGame({ seed: 777054, mode: 'social-r54-others-menu-proof' });
  await setupGame(Game);
  const sid = Game.villagerId;
  const roster = (Game.state.village.roster || []).filter(id => id !== sid);
  if (!roster.length) { console.log('SKIP: no villagers'); process.exit(2); }
  let fails = 0;
  const fail = (m) => { console.log('FAIL: ' + m); fails++; };

  // ---- Part 1: discussed-and-unchanged 'others' in the subject menu ----
  let part1Done = false;
  for (const vid of roster) {
    const temper = safe(() => Game.npcTemper(vid), '?');
    if (temper === 'withdrawn' || temper === 'prickly' || temper === 'restless') continue;
    Game.state.village.trust = Game.state.village.trust || {};
    Game.state.village.trust[vid] = 30;
    // Deterministic 'close' pick: plant a depth-2 bond to the first other
    // roster member (bond key order-independent in t2pickOther).
    const oid = roster.find(id => id !== vid);
    if (!oid) continue;
    Game.state.village.bonds = Game.state.village.bonds || {};
    Game.state.village.bonds[vid + '|' + oid] = { depth: 2, v: 1 };
    safe(() => Game.startConvo(vid), null);
    let c = Game.convoGet(vid);
    if (!c || !c.active) continue;
    // Discussed state, constructed after startConvo (which must not wipe
    // it — verified below): said + served pick matching the live pick.
    c.said = { 't2:others': ['"PLACEHOLDER-SERVED-LINE"'] };
    const livePick = safe(() => Game.t2pickOther(vid, { menuCheck: true }), null);
    if (!livePick || livePick.id !== oid || livePick.why !== 'close') continue;
    c.t2otherServed = { id: livePick.id, why: livePick.why };
    c.askedTopics = [];
    const st = subjectState(Game, vid);
    // Premise: the menu paginates (so page-1 placement is meaningful) and
    // the 'others' pick is genuinely unchanged (not fresh via re-offer).
    const freshNow = safe(() => Game.t2topicFresh(vid, 'others'), null);
    if (freshNow !== false) continue;
    if (st.pages <= 1) continue;
    part1Done = true;
    console.log('part1 candidate', safe(() => Game.displayName(vid), vid),
      'pages', st.pages, 'page1:', st.page1.join(','));
    console.log('part1 built:', st.built.join(','));
    if (!st.built.includes('ask:others')) fail('discussed-unchanged ask:others absent from subject-menu built list');
    if (!st.page1.includes('ask:others')) fail('discussed-unchanged ask:others absent from subject-menu page 1 (rank burial)');
    // End this convo cleanly before part 2 reuses the villager.
    try { Game.convoTurn(vid, 'leave'); } catch (e) {}
    break;
  }
  if (!part1Done) { console.log('SKIP: no candidate met the discussed-unchanged paginated premise'); process.exit(2); }

  // ---- Part 2: a real re-serving never repeats the first line ----
  // Fresh villager (no said 'others' yet), same deterministic bond plant.
  let part2Done = false;
  for (const vid of roster) {
    const temper = safe(() => Game.npcTemper(vid), '?');
    if (temper === 'withdrawn' || temper === 'prickly' || temper === 'restless') continue;
    Game.state.village.trust = Game.state.village.trust || {};
    Game.state.village.trust[vid] = 30;
    const oid = roster.find(id => id !== vid);
    if (!oid) continue;
    Game.state.village.bonds = Game.state.village.bonds || {};
    Game.state.village.bonds[vid + '|' + oid] = { depth: 2, v: 1 };
    safe(() => Game.startConvo(vid), null);
    let c = Game.convoGet(vid);
    if (!c || !c.active) continue;
    // Fresh 'others' state for this villager.
    c.said = {};
    c.askedTopics = [];
    delete c.t2otherServed;
    let first = null;
    try {
      // Settle the opener (NPC questions, subject steps) by real navigation,
      // then serve 'others' from whichever menu offers it.
      if (!reach(Game, vid, ['ask:others'])) continue;
      const before = (Game.convoGet(vid).transcript || []).length;
      choose(Game, vid, 'ask:others');
      const after = (Game.convoGet(vid).transcript || []).slice(before);
      first = after.map(e => (e && e.text) || String(e)).join('\n');
    } catch (e) { continue; }
    if (!first) continue;
    try { Game.convoTurn(vid, 'leave'); } catch (e) {}
    // Second conversation: 'others' is now discussed-and-unchanged; the
    // re-list (post-fix) must offer it, and serving it must not repeat.
    safe(() => Game.startConvo(vid), null);
    c = Game.convoGet(vid);
    if (!c || !c.active) continue;
    let second = null;
    try {
      if (!reach(Game, vid, ['ask:others'])) throw Error('Never offered ask:others');
      const before = (Game.convoGet(vid).transcript || []).length;
      choose(Game, vid, 'ask:others');
      const after = (Game.convoGet(vid).transcript || []).slice(before);
      second = after.map(e => (e && e.text) || String(e)).join('\n');
    } catch (e) {
      fail('re-serving discussed-unchanged ask:others never offered in second convo (' + e.message + ')');
      part2Done = true;
      break;
    }
    part2Done = true;
    console.log('part2 first-serving text:', JSON.stringify(first));
    console.log('part2 second-serving text:', JSON.stringify(second));
    if (!second) fail('second serving produced no transcript');
    else if (second === first) fail('second serving repeated the first serving verbatim');
    else if (first && second.indexOf(first) !== -1) fail('second serving contains the first serving verbatim');
    try { Game.convoTurn(vid, 'leave'); } catch (e) {}
    break;
  }
  if (!part2Done) { console.log('SKIP: no candidate completed the double-serving'); process.exit(2); }

  if (fails) { console.log('RED: ' + fails + ' failure(s)'); process.exit(1); }
  console.log('GREEN: discussed-unchanged ask:others surfaces (built + page 1) and re-serving never repeats');
  process.exit(0);
}

main().catch(e => { console.error('ERROR', e && e.stack || e); process.exit(1); });
