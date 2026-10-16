#!/usr/bin/env node
// Proof test: resume/repair filler-loop fix (journey-social r17 2026-10-15).
//
// r17's pilot (6 runs x 60d, 3,364 conversations, 12 full transcripts read)
// found the resume/repair machinery manufacturing filler loops:
//   (1) dry-line deflections ("...Sorry, lost my train of thought.") were
//       recorded as thread content via the sayLine->convoNoteSpokenBeat hook
//       AND the convoTurn tail, becoming the thread's "last beat";
//   (2) the resume opener then QUOTED them as the unfinished topic:
//       "We never finished talking about what's been happening — we
//       wandered off it. 'Hm. Never mind — go on.'";
//   (3) generic resume/repair beats ("About that favor — yeah, we never did
//       get back to that.") were no-repeat-blocked across villagers/sittings
//       (labels are generic by design), collapsing into more deflections;
//   (4) snippet-less ghost threads planted "unfinished business" from nothing.
//
// The fix (src/js/conversation.js):
//   A. sayLine no longer feeds fallback (dry/self-repeat) chunks to the
//      thread-beat hook, and the convoTurn tail skips ledgering a blocked
//      turn (c._sayFellBack).
//   B. Resume openers, recap lines and generic thread-resume responses are
//      STRUCTURAL beats (opts.structural / turn flag) — exempt from the
//      run-ledger block, still guarded per-sitting.
//   C. convoResumeOpener never quotes a deflection snippet (defense in
//      depth for threads planted before the fix).
//   D. convoThreadOpen refuses snippet-less plants (no content, no plant).
//
// RED (pre-fix): A/B/C/D all fail. GREEN (post-fix): all pass.
// Usage: SEED=45 node scripts/test-resume-repair-r17-20261015.js
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '45', 10);
let pass = 0, fail = 0;
const ok = (cond, label) => {
  if (cond) { pass++; console.log('  PASS: ' + label); }
  else { fail++; console.log('  FAIL: ' + label); }
};

function lastNpcLine(Game, vid) {
  try {
    const tr = (Game.convoGet(vid) || {}).transcript || [];
    for (let i = tr.length - 1; i >= 0; i--) {
      if (tr[i].who !== 'you' && tr[i].text) return String(tr[i].text);
    }
  } catch (e) {}
  return '';
}
// Local copy of the deflection pools (kept in sync with
// convoDeflectionLines in src/js/conversation.js). The test must not depend
// on the game's detector existing — pre-fix it doesn't, and RED must show
// as assertion failures, not throws.
const DEFL = [
  '"...Sorry, lost my train of thought."',
  '"Hm. Never mind — go on."',
  '"...Actually, forget it."',
  '"...Where was I? Gone. Ask me something else."',
  '"Huh. That went clean out of my head."',
  '"...No, it\'s not coming back. What were you saying?"',
  '"Lost it. The thought, I mean. Go on."',
  '"...Sorry — that one slipped away from me."',
  '"Eh. Wasn\'t important. Probably."',
  '"I just said — did you miss it?"',
  '"I just told you — what else is on your mind?"',
  '"We\'ve covered this one. Ask me something else."',
];
function isDefl(text) {
  const t = String(text == null ? '' : text).trim().replace(/^"+|"+$/g, '');
  return DEFL.some(d => d.replace(/^"+|"+$/g, '') === t);
}

async function main() {
  const lg = await loadGame({ seed: SEED, fullTelemetry: true });
  const Game = lg.Game;
  await setupGame(Game);
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  if (roster.length < 4) { console.log('  FAIL: need 4+ villagers'); process.exit(1); }
  // trust high so the resume opener's trust gate passes
  for (const id of roster) { try { (v.trust = v.trust || {})[id] = 60; } catch (e) {} }

  // ---- A. fallback dry lines are not ledgered as thread beats ----
  {
    const vid = roster[0];
    Game.startConvo(vid);
    const T = (Game.convoGet(vid) || {}).thread || 'small';
    const dry1 = Game.convoDryLine(vid);           // consumes dry #1
    Game.convoRunLedger().push(String(dry1).trim()); // force a run-block
    Game.sayLine(vid, dry1);                        // run-blocked -> dry #2
    const spoken = lastNpcLine(Game, vid);
    const snip = Game.convoLastThreadSnippet(vid, T);
    console.log(`  A: thread=${T} spoken=${spoken.slice(0, 50)} snippet=${String(snip).slice(0, 50)}`);
    ok(isDefl(spoken), 'A1: the blocked turn spoke a dry deflection');
    ok(!isDefl(snip), 'A2: the deflection was NOT ledgered as the thread beat');
    Game.endConvo(vid, 'done');
  }

  // ---- B. resume opener never quotes a deflection snippet ----
  {
    const vid = roster[1];
    // simulate a pre-fix planted thread carrying a deflection snippet
    Game.convoThreadOpen(vid, 'lately', "what's been happening", 'changed the subject',
      '"...Sorry, lost my train of thought."');
    const realRandom = Math.random;
    Math.random = () => 0.1; // pass the resume opener's 0.65 gate deterministically
    let opener = '';
    try {
      Game.startConvo(vid);
      opener = lastNpcLine(Game, vid);
    } finally { Math.random = realRandom; }
    console.log(`  B: opener=${opener.slice(0, 120)}`);
    ok(opener.indexOf('never finished talking about') !== -1 || opener.indexOf('never did finish') !== -1,
      'B1: the resume opener fired for the planted thread');
    ok(opener.indexOf('lost my train of thought') === -1,
      'B2: the opener did NOT quote the deflection as the "memory"');
    Game.endConvo(vid, 'done');
  }

  // ---- C. structural beats skip the run-ledger block ----
  {
    const vid = roster[2];
    const resumeLine = '"About that favor — yeah, we never did get back to that."';
    Game.convoRunLedger().push(resumeLine.trim()); // another villager "said" it
    Game.startConvo(vid);
    Game.sayLine(vid, resumeLine, { structural: true });
    const spoken = lastNpcLine(Game, vid);
    console.log(`  C: spoken=${spoken.slice(0, 80)}`);
    ok(spoken === resumeLine, 'C1: structural resume beat spoken verbatim, not deflected');
    ok(!isDefl(spoken), 'C2: no dry-line fallback');
    // and a NON-structural identical beat still blocks (defect-7 protection kept)
    Game.startConvo(vid);
    Game.sayLine(vid, resumeLine);
    const spoken2 = lastNpcLine(Game, vid);
    ok(spoken2 !== resumeLine, 'C3: non-structural repeat still no-repeat-blocked');
    Game.endConvo(vid, 'done');
  }

  // ---- D. snippet-less ghost threads do not plant ----
  {
    const vid = roster[3];
    Game.convoThreadOpen(vid, 'lately', "what's been happening", 'changed the subject', null);
    const open = Game.convoOpenThreads(vid);
    ok(!open.some(o => o.tid === 'lately'), 'D1: snippet-less thread is not planted');
    // a thread WITH a real beat still plants
    Game.convoThreadOpen(vid, 'lately', "what's been happening", 'changed the subject',
      '"Have you seen the sick row? Two down with it."');
    const open2 = Game.convoOpenThreads(vid);
    ok(open2.some(o => o.tid === 'lately'), 'D2: thread with a real beat still plants');
  }

  // the game's detector (post-fix) agrees with the local list
  if (typeof Game.convoIsDeflectionLine === 'function') {
    const agree = DEFL.every(d => Game.convoIsDeflectionLine(d)) &&
      !Game.convoIsDeflectionLine('"Have you seen the sick row? Two down with it."');
    ok(agree, 'X: game detector matches the deflection list (and rejects real content)');
  } else {
    console.log('  SKIP X: no game detector (pre-fix)');
  }

  console.log(`\n${pass} passed, ${fail} failed (seed ${SEED})`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('ERROR: ' + (e && e.stack || e)); process.exit(1); });
