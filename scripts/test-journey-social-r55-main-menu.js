#!/usr/bin/env node
// test-journey-social-r55-main-menu.js -- PROOF TEST (journey-social r55).
// r54's split verdict: subject-menu offers moved (96.3% -> 59.1% no-offer)
// but late unsteered PICKS did not (0/0/1/0), because natural picks flow
// through the MAIN menu, and the main menu still caps discussed-'others'
// behind asks: the off-thread fallback fills t2fresh then asks up to
// topicCapMood (5), so the t2discussed loop never fires for 'others' late
// in a run — even though MAXC is 7 and view slots sit empty.
// The r55 fix: the main-menu t2discussed loop exempts 'ask:others' from
// the topicsAdded cap ('others' ONLY, still bounded by MAXC and the
// threadAsk exclusion, never while it IS the current thread), mirroring
// the r53 fresh exemption and the r54 subject-menu re-list.
// GREEN = in a discussed-and-unchanged 'others' state, the MAIN menu's
// built list AND page 1 both offer 'ask:others', and a real double-serving
// never repeats the first serving's line verbatim (said-ledger contract,
// carried from r54). RED (pre-fix) = 'ask:others' absent from the main-menu
// built list entirely (the cap), and therefore from page 1.
// Premise: a villager with a deterministic 'close' pick (planted bond
// depth>=2, no grievances) so t2othersChanged is false; trust 30 opens
// you/fears/others/neighbors/advice/oldworld/skills. SKIP (exit 2) only if
// no roster candidate meets the premise.
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');
const { choose, reach } = require('./lib/conversation-playtest');

function safe(fn, d) { try { return fn(); } catch (e) { return d; } }

// Main-menu state: same constructed state as r54's subjectState, but with
// choosingSubject FALSE so buildMenu takes the off-thread fallback path
// (t2fresh -> asks -> t2discussed) instead of the subject-menu early return.
function mainState(Game, vid) {
  const c = Game.convoGet(vid);
  c.thread = null;
  c.depth = 0;
  c.choosingSubject = false;
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
  const { Game } = await loadGame({ seed: 777054, mode: 'social-r55-main-menu-proof' });
  await setupGame(Game);
  const sid = Game.villagerId;
  const roster = (Game.state.village.roster || []).filter(id => id !== sid);
  if (!roster.length) { console.log('SKIP: no villagers'); process.exit(2); }
  let fails = 0;
  const fail = (m) => { console.log('FAIL: ' + m); fails++; };

  // ---- Part 1: discussed-and-unchanged 'others' in the MAIN menu ----
  let part1Done = false;
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
    // Discussed state, constructed after startConvo (which must not wipe
    // it — verified below): said + served pick matching the live pick.
    c.said = { 't2:others': ['"PLACEHOLDER-SERVED-LINE"'] };
    const livePick = safe(() => Game.t2pickOther(vid, { menuCheck: true }), null);
    if (!livePick || livePick.id !== oid || livePick.why !== 'close') continue;
    c.t2otherServed = { id: livePick.id, why: livePick.why };
    c.askedTopics = [];
    const st = mainState(Game, vid);
    // Premise: the menu paginates (so page-1 placement is meaningful) and
    // the 'others' pick is genuinely unchanged (not fresh via re-offer).
    const freshNow = safe(() => Game.t2topicFresh(vid, 'others'), null);
    if (freshNow !== false) continue;
    // Premise: we are on the fallback main-menu path AND the asks filled
    // the topic budget (so pre-fix the discussed loop is capped — without
    // this, a pre-fix GREEN would prove nothing about the cap).
    const asksFilled = st.built.includes('ask:personal') && st.built.includes('ask:gossip') && st.built.includes('ask:spread_rumor');
    if (!asksFilled) continue;
    if (st.pages <= 1) continue;
    part1Done = true;
    console.log('part1 candidate', safe(() => Game.displayName(vid), vid),
      'pages', st.pages, 'page1:', st.page1.join(','));
    console.log('part1 built:', st.built.join(','));
    if (!st.built.includes('ask:others')) fail('discussed-unchanged ask:others absent from main-menu built list (topic-cap starvation)');
    if (!st.page1.includes('ask:others')) fail('discussed-unchanged ask:others absent from main-menu page 1 (rank burial)');
    try { Game.convoTurn(vid, 'leave'); } catch (e) {}
    break;
  }
  if (!part1Done) { console.log('SKIP: no candidate met the discussed-unchanged paginated main-menu premise'); process.exit(2); }

  // ---- Part 2: a real re-serving never repeats the first line ----
  // Carried from r54 unchanged: the said-ledger contract must hold under
  // the new menu surface too. Fresh villager (no said 'others' yet), same
  // deterministic bond plant.
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
    c.said = {};
    c.askedTopics = [];
    delete c.t2otherServed;
    let first = null;
    try {
      if (!reach(Game, vid, ['ask:others'])) continue;
      const before = (Game.convoGet(vid).transcript || []).length;
      choose(Game, vid, 'ask:others');
      const after = (Game.convoGet(vid).transcript || []).slice(before);
      first = after.map(e => (e && e.text) || String(e)).join('\n');
    } catch (e) { continue; }
    if (!first) continue;
    try { Game.convoTurn(vid, 'leave'); } catch (e) {}
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
  console.log('GREEN: discussed-unchanged ask:others surfaces on the main menu (built + page 1) and re-serving never repeats');
  process.exit(0);
}

main().catch(e => { console.error('ERROR', e && e.stack || e); process.exit(1); });
