#!/usr/bin/env node
// test-journey-social-r57-subject-relist.js -- PROOF / DIAGNOSTIC TEST (journey-social r57).
// r56's named candidate, tested at unit level: a discussed-and-unchanged
// 'others' state must appear in the SUBJECT menu's built list (the r54
// re-list), under clean constructed state. If it does, r56's wild
// residual (401 unexplained inBuilt=false same-pick probes) is NOT the
// re-list failing — it is pager-owns, fresh-capping, cache, or another
// build-time classification the driver flags must name. If it does not,
// the re-list itself is refuted and a fix is in scope for r57.
// Part 2 is CHARACTERIZATION only (never fails): a FRESH 'others' on a
// cap-2 villager (prickly/withdrawn/restless, topicCapMood 2) — the r53
// exemption lifts freshCap only, not topicCapMood, so a 3rd fresh topic
// (you, fears, then others in t2list order at trust 30) is expected to
// be capped out of the subject built list. Either outcome is recorded;
// the test's verdict is part 1 only.
// Premise (part 1): a villager with a deterministic 'close' pick (planted
// bond depth>=2, no grievances) so t2othersChanged is false; trust 30.
// SKIP (exit 2) only if no roster candidate meets the premise.
'use strict';
process.env.TRIBFLOOR = '1';
const { loadGame, setupGame } = require('./sim-harness');

function safe(fn, d) { try { return fn(); } catch (e) { return d; } }

// Subject-menu state: choosingSubject TRUE so buildMenu takes the subject
// early return (t2fresh -> asks -> t2discussed re-list) instead of the
// main-menu fallback. All owns-filters cleared (no pending/reactive/
// generic question, no windingDown, no closing beat).
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
  c.pendingTrade = null;
  c.pendingHawk = null;
  delete c.replyMenu;
  const page1 = (Game.convoChoices(vid) || []).map(ch => ch.id);
  const built = Object.keys(Game.convoGet(vid).offeredReplies || {});
  const pages = Game.convoGet(vid).menuPages || 1;
  return { page1, built, pages };
}

async function main() {
  const { Game } = await loadGame({ seed: 777057, mode: 'social-r57-subject-relist-proof' });
  await setupGame(Game);
  const sid = Game.villagerId;
  const roster = (Game.state.village.roster || []).filter(id => id !== sid);
  if (!roster.length) { console.log('SKIP: no villagers'); process.exit(2); }
  let fails = 0;
  const fail = (m) => { console.log('FAIL: ' + m); fails++; };

  // ---- Part 1: discussed-and-unchanged 'others' in the SUBJECT menu ----
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
    c.said = { 't2:others': ['"PLACEHOLDER-SERVED-LINE"'] };
    const livePick = safe(() => Game.t2pickOther(vid, { menuCheck: true }), null);
    if (!livePick || livePick.id !== oid || livePick.why !== 'close') continue;
    c.t2otherServed = { id: livePick.id, why: livePick.why };
    c.askedTopics = [];
    const freshNow = safe(() => Game.t2topicFresh(vid, 'others'), null);
    if (freshNow !== false) continue;
    const st = subjectState(Game, vid);
    part1Done = true;
    console.log('part1 candidate', safe(() => Game.displayName(vid), vid),
      'temper', temper, 'pages', st.pages, 'page1:', st.page1.join(','));
    console.log('part1 built:', st.built.join(','));
    if (!st.built.includes('ask:others')) fail('discussed-unchanged ask:others absent from subject-menu built list (r54 re-list refuted)');
    if (!st.page1.includes('ask:others')) console.log('NOTE: discussed-unchanged ask:others in built list but not page 1 (rank/paging, not construction)');
    try { Game.convoTurn(vid, 'leave'); } catch (e) {}
    break;
  }
  if (!part1Done) { console.log('SKIP: no candidate met the discussed-unchanged subject-menu premise'); process.exit(2); }

  // ---- Part 2: fresh-'others' cap characterization (never fails) ----
  let part2Done = false;
  for (const vid of roster) {
    const temper = safe(() => Game.npcTemper(vid), '?');
    if (!(temper === 'withdrawn' || temper === 'prickly' || temper === 'restless')) continue;
    Game.state.village.trust = Game.state.village.trust || {};
    Game.state.village.trust[vid] = 30;
    safe(() => Game.startConvo(vid), null);
    let c = Game.convoGet(vid);
    if (!c || !c.active) continue;
    c.said = {};
    delete c.t2otherServed;
    c.askedTopics = [];
    const freshNow = safe(() => Game.t2topicFresh(vid, 'others'), null);
    if (freshNow !== true) continue;
    // Fresh topics before 'others' in t2list order (driver-computed).
    let freshBefore = null;
    try {
      const tl = Game.topic2Asks(vid) || [];
      const freshIds = tl.filter(a => { try { return Game.t2topicFresh(vid, String(a.id).slice(4)); } catch (e) { return false; } }).map(a => a.id);
      freshBefore = freshIds.indexOf('ask:others');
    } catch (e) {}
    const st = subjectState(Game, vid);
    part2Done = true;
    console.log('part2 candidate', safe(() => Game.displayName(vid), vid),
      'temper', temper, 'topicCapMood 2 (cap-2 villager)', 'freshBeforeOthers', freshBefore,
      'builtHasOthers', st.built.includes('ask:others'), 'page1HasOthers', st.page1.includes('ask:others'));
    console.log('part2 built:', st.built.join(','));
    try { Game.convoTurn(vid, 'leave'); } catch (e) {}
    break;
  }
  if (!part2Done) console.log('part2 SKIP: no cap-2 candidate met the fresh premise (characterization only)');

  if (fails) { console.log('RED: ' + fails + ' failure(s)'); process.exit(1); }
  console.log('GREEN: discussed-unchanged ask:others surfaces on the subject menu (built list)');
  process.exit(0);
}

main().catch(e => { console.error('ERROR', e && e.stack || e); process.exit(1); });
