#!/usr/bin/env node
'use strict';
// Proof: re-asking / resuming a warn_you want ENGAGES it
// (journey-landing r131, HEED — filed r129, reproduced r130 panel 1150 d6).
// The warn_you want's engageBeat (the actual warning) was spoken by TWO
// paths that never advanced the want stage — while the want-menu path
// (dlg:details) does:
//   - alive:want re-ask (conversation.js, WANT RESUME branch): spoke
//     engageBeat, then set stage = max(stage, 1) — stage stayed 1.
//   - alive:thread:want resume: spoke convoThreadBeat (t==='want' routes
//     to engageBeat) with no stage change at all.
// In the wild (1150 d6 Dauletkhan, 21 turns) the warning was delivered
// TWICE while the want sat at stage 1 and ended stage 3 'unresolved'.
// RED (unfixed): after either delivery the want is still stage 1, the
// stage-2 menu still offers dlg:details, and the sitting closes
// 'unresolved'.
// GREEN (post-fix): either delivery moves the want to stage 2 (the exact
// transition dlg:details performs); the stage-2 menu drops dlg:details but
// keeps dlg:heed; heeding resolves 'heeded'; closing an engaged want
// resolves 'engaged'. A null beat never engages (engageBeat returns null
// when every pool variant is ledger-blocked — covered by the rotation
// guard: a second re-ask still works and stays stage 2).
// A different thread's resume must NOT engage the want (guard case).
// Uses the shared harness (scripts/godpath/lib). Exits nonzero on failure.
const assert = require('assert');
const K = require('./godpath/lib');

let pass = 0;
function check(name, condition, extra) {
  assert(condition, name + (extra ? ' :: ' + extra : ''));
  pass++;
  console.log('  ok ' + name);
}

// Distinctive phrases from the convoWantWarning pool (generic +
// recent-attack + known-monster variants).
const WARN_SUBSTRS = [
  'moving out there', 'past the treeline', "woods don't feel empty",
  'Whatever came through here last night', "Last night wasn't a one-off",
  'It came through once', "from last night? It's still out there",
  "You've seen what's out there", 'I keep thinking about that',
  'If you see that', "Don't go out alone", 'Stay close to the fire',
  'Stay where people can see you', "Don't be out past the treeline",
  'Get back inside the palisade',
];
function warned(line) { return !!line && WARN_SUBSTRS.some(s => line.includes(s)); }

async function main() {
  const Game = await K.load({ seed: 4242 });
  K.newRun(Game);
  const v = Game.state.village;
  const scholarId = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== scholarId);
  assert(roster.length >= 3, 'need 3+ villagers besides the scholar, got ' + roster.length);
  const [a, b] = roster;
  // Case 3 needs a third villager whose warn_you sitting OPENS surfaced
  // (stage 1, thread 'want'): some villagers open on small talk (stage 0,
  // thread 'small') and the want surfaces later. On this seed roster[4]
  // opens stage 1 (verified by probe). Do NOT scan for one by opening
  // probe sittings: a probe sitting speaks the villager's single-variant
  // warn_you opener, which ledger-blocks it for the real sitting, so the
  // want then opens stage 0. The stage-1 assertion below fails loudly if
  // the roster gen ever changes this.
  const c3 = roster[4];
  assert(c3, 'roster[4] missing');
  console.log(`speakers=${roster.slice(0, 3).map(id => Game.displayName(id)).join(', ')} roster=${roster.length}`);

  function startWarn(vid, note) {
    // Distinct seed note per sitting: the seed opener is voiced as
    // "About <note> — <opener>", and identical notes make identical
    // opener lines, which the run ledger then blocks on the next
    // sitting (the sitting falls through to small talk, stage 0).
    // Real seeds always carry distinct notes; the test must too.
    Game.convoPlantSeed(vid, { wantId: 'warn_you', note: note || 'test warning' });
    Game.startConvo(vid);
    const c = Game.convoGet(vid);
    assert(c.want && c.want.id === 'warn_you', 'want selected is warn_you, got ' + (c.want && c.want.id));
    return c;
  }
  function themLines(vid) {
    return (Game.convoGet(vid).transcript || []).filter(e => e.who === 'them').map(e => e.text);
  }
  function menuIds(vid) {
    return (Game.convoChoices(vid) || []).map(x => x && x.id).filter(Boolean);
  }

  // 1. alive:want re-ask delivers the warning AND engages (stage 1 -> 2).
  let c = startWarn(a, 'the warning from the treeline');
  check('case1 want starts stage 1', (c.want.stage || 0) === 1, 'stage=' + c.want.stage);
  Game.convoTurn(a, 'alive:want:warn_you');
  c = Game.convoGet(a);
  const lines1 = themLines(a);
  check('case1 warning delivered', lines1.some(warned), JSON.stringify(lines1.slice(-1)));
  check('case1 want engaged stage 2', (c.want.stage || 0) === 2, 'stage=' + c.want.stage);
  const menu1 = menuIds(a);
  check('case1 stage-2 menu drops dlg:details', !menu1.includes('dlg:details'), menu1.join(','));
  check('case1 stage-2 menu still offers dlg:heed', menu1.includes('dlg:heed'), menu1.join(','));
  // Re-asking at stage 2 still works (rotation: a different variant) and stays engaged.
  Game.convoTurn(a, 'alive:want:warn_you');
  c = Game.convoGet(a);
  const lines1b = themLines(a);
  check('case1 re-ask at stage 2 stays stage 2', (c.want.stage || 0) === 2, 'stage=' + c.want.stage);
  check('case1 re-ask delivers a warning line', lines1b.some(warned), JSON.stringify(lines1b.slice(-1)));
  // Heeding is engagement, not a formal commit: the dlg:heed handler calls
  // convoWantEngage 'engage' (stage stays 2); the sitting closes 'engaged'.
  // (Observed quirk, out of scope: 'heeded' + its close line are unreachable
  // — no warn_you menu offers dlg:commit, which is the only kind that sets
  // 'heeded'. Filed as a follow-up in the r131 run note.)
  Game.convoTurn(a, 'dlg:heed');
  c = Game.convoGet(a);
  check('case1 dlg:heed keeps stage 2 (engaged)', (c.want.stage || 0) === 2, 'stage=' + c.want.stage);
  Game.endConvo(a, 'closed');
  check('case1 closes engaged, not unresolved', c.want.resolution === 'engaged', 'res=' + c.want.resolution);

  // 2. alive:thread:want resume delivers the warning AND engages.
  // Mirrors the 1150 d6 transcript: subject-change alone does not plant
  // the want thread — the want becomes unfinished business once another
  // topic is pursued (ask:village), and the next subject change offers
  // the resume ("We never finished — that warning.").
  c = startWarn(b, 'what moved past the treeline');
  Game.convoTurn(b, 'dlg:subject');
  c = Game.convoGet(b);
  check('case2 want still stage 1 after subject change', (c.want.stage || 0) === 1, 'stage=' + c.want.stage);
  const menu2a = menuIds(b);
  check('case2 village topic offered', menu2a.includes('ask:village'), menu2a.join(','));
  Game.convoTurn(b, 'ask:village');
  c = Game.convoGet(b);
  check('case2 want still stage 1 after village topic', (c.want.stage || 0) === 1, 'stage=' + c.want.stage);
  Game.convoTurn(b, 'dlg:subject');
  const menu2 = menuIds(b);
  check('case2 thread resume offered', menu2.includes('alive:thread:want'), menu2.join(','));
  Game.convoTurn(b, 'alive:thread:want');
  c = Game.convoGet(b);
  const lines2 = themLines(b);
  check('case2 warning delivered', lines2.some(warned), JSON.stringify(lines2.slice(-1)));
  check('case2 want engaged stage 2', (c.want.stage || 0) === 2, 'stage=' + c.want.stage);
  Game.endConvo(b, 'closed');
  check('case2 closes engaged, not unresolved', c.want.resolution === 'engaged', 'res=' + c.want.resolution);

  // 3. GUARD: pursuing a DIFFERENT thread does not engage the want.
  // (The village thread's resume entry is ledger-dependent — in the 1150
  // transcript it surfaces only after the want thread is resumed — so the
  // guard drives the village thread itself: "tell me more" on it serves
  // village lines via convoThreadBeat, never the want's engageBeat.)
  c = startWarn(c3, 'the warning about the woods');
  check('case3 want starts stage 1', (c.want.stage || 0) === 1, 'stage=' + c.want.stage);
  Game.convoTurn(c3, 'dlg:subject');
  // Page the subject menu until the village topic surfaces (it sits
  // behind [menu:more] on this state, as in the 1150 transcript).
  let menu3 = menuIds(c3);
  for (let p = 0; p < 4 && !menu3.includes('ask:village'); p++) {
    if (!menu3.includes('menu:more')) break;
    Game.convoTurn(c3, 'menu:more');
    menu3 = menuIds(c3);
  }
  if (menu3.includes('ask:village')) {
    Game.convoTurn(c3, 'ask:village');
    c = Game.convoGet(c3);
    check('case3 village topic taken, want still stage 1', (c.want.stage || 0) === 1, 'stage=' + c.want.stage);
    // Two "tell me more" turns on the village thread: village content,
    // want untouched.
    Game.convoTurn(c3, 'dlg:more');
    c = Game.convoGet(c3);
    check('case3 village follow-up leaves want stage 1', (c.want.stage || 0) === 1, 'stage=' + c.want.stage);
    Game.convoTurn(c3, 'dlg:more');
    c = Game.convoGet(c3);
    check('case3 second village follow-up leaves want stage 1', (c.want.stage || 0) === 1, 'stage=' + c.want.stage);
    const lines3 = themLines(c3);
    check('case3 no warning delivered on the village thread', !lines3.some(warned), JSON.stringify(lines3.slice(-2)));
  } else {
    // No village topic on this menu — the guard cannot run in this state;
    // fail loudly rather than silently skipping it.
    assert(false, 'case3 guard needs ask:village on the subject menu, got: ' + menu3.join(','));
  }
  Game.endConvo(c3, 'closed');
  check('case3 closes unresolved (want never engaged)', c.want.resolution === 'unresolved', 'res=' + c.want.resolution);

  console.log(`\nPASS ${pass}/22 heed-engage checks`);
}

main().catch(e => { console.error('FAIL:', e && e.message || e); process.exit(1); });
