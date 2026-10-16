// Proof: resume opener never quotes another resume opener (r18).
// ROOT CAUSE (journey-landing r18, seed-64 probe day 14): Henry's resume
// opener nested scaffolding inside scaffolding:
//   "We never finished talking about what's been happening — we wandered
//    off it. 'We never finished talking about what's been happening — we
//    wandered off it. 'We never finished talking about…' …"
// The thread's snippet (its "last NPC beat") was itself a resume opener
// from an earlier sitting — planted honestly by convoThreadOpen, then
// quoted as "memory" by convoResumeOpener. A resume opener quoting
// another resume opener is never honest memory.
// FIX (src/js/conversation.js, convoResumeOpener): skip the snippet quote
// when the snippet is itself a resume opener (matches /never (did )?finish
// talking about/i — the template's signature phrase). The thread still
// resumes (label + whyLine); only the nested quote is dropped.
// RED: the resume line contains the phrase twice (outer + nested quote).
// GREEN: exactly once (outer only).
'use strict';
const { loadGame, setupGame } = require('./sim-harness.js');

async function main() {
  const { Game: G } = await loadGame({ seed: 64 });
  await setupGame(G);
  const assert = require('assert');
  const v = G.state.village;
  const vid = (v.roster && v.roster[0] && v.roster[0].id) || (v.roster && v.roster[0]);
  assert(vid, 'need a villager id');
  v.trust = v.trust || {};
  v.trust[vid] = 20; // resume gate needs trust >= 15

  let pass = 0, fail = 0;
  const check = (cond, msg) => {
    if (cond) { pass++; }
    else { fail++; console.error('FAIL: ' + msg); }
  };

  // Plant a thread whose "last beat" snippet is itself a resume opener —
  // the seed-64 probe's exact situation.
  const nestedSnippet = "We never finished talking about what's been happening \u2014 we wandered off it.";
  G.convoThreadOpen(vid, 'test-resume', "what's been happening", 'changed the subject', nestedSnippet);
  const open = G.convoOpenThreads(vid);
  check(open.some(o => o.tid === 'test-resume'), 'thread planted with structural snippet');

  // Force the resume past its 0.65 random gate.
  let res = null;
  for (let i = 0; i < 100 && !res; i++) {
    try { G.convoGet(vid)._resumedOnce = false; } catch (e) {}
    res = G.convoResumeOpener(vid);
  }
  check(res && res.line, 'resume opener fired');
  if (res && res.line) {
    const hits = (res.line.match(/never (did )?finish(ed)? talking about/gi) || []).length;
    check(hits === 1,
      `no nested resume quote (phrase occurs ${hits}x, want 1): ${res.line.slice(0, 200)}`);
    check(/wandered off it/i.test(res.line), 'outer opener still names why (wandered off it)');
  }

  // Control: a normal content snippet is still quoted (the memory-quote
  // feature from deepening r11 keeps working).
  try { G.convoGet(vid)._resumedOnce = false; } catch (e) {}
  // clear the test thread so the control plants fresh
  try {
    const L = G.convoTopicLedger(vid);
    L.open = (L.open || []).filter(o => o.tid !== 'test-resume');
  } catch (e) {}
  G.convoThreadOpen(vid, 'test-resume2', 'the creek run', 'changed the subject',
    'We hauled twelve liters before the light went.');
  let res2 = null;
  for (let i = 0; i < 100 && !res2; i++) {
    try { G.convoGet(vid)._resumedOnce = false; } catch (e) {}
    const r = G.convoResumeOpener(vid);
    if (r && r.thread === 'test-resume2') res2 = r;
  }
  check(res2 && /twelve liters/i.test(res2.line),
    'real content snippet still quoted: ' + (res2 ? res2.line.slice(0, 160) : 'NO RESUME'));

  console.log(`\nresume-nesting r18: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
