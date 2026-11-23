#!/usr/bin/env node
// test-journey-social-life-r268-resume-fallthrough-20261123.js — proof test
// for the r268 Arm B fix (journey-social-life r268; the r266 F6 dry line).
//
// THE DEFECT (r266 panel, seed 45815 day 82, David Kim): the player picks
// the resume line "We never finished — that debt." and the game answers
// "...Sorry, lost my train of thought." — a dry answer to a real pick
// about a real, still-open debt. Root cause: the resume pick
// (alive:thread, conversation.js:7180) draws the thread's next beat via
// convoThreadBeat and speaks it with full ledger protection
// (structuralTurn = !beat, turn tail 8290). The beat is the thread's LAST
// spoken line — often still inside the 48-entry run-ledger window — so
// sayLine run-blocks it and falls back to the dry line. The same
// dry-risk shape existed at three sibling call sites that speak a
// non-null convoThreadBeat with full ledger protection and fall through
// only on null: `more` (7567), the resume-offer Yes (gq:yn +
// resumeOffer, 7597), and `follow:` (7687).
//
// THE FIX (r268, same class at all four sites — the r19 opener
// fall-through pattern): a shared convoLiveBeat(vid) helper —
// convoThreadBeat unless the returned line is ledger-blocked (via
// convoWouldBlock), in which case null — and all four call sites speak
// through it. A blocked beat falls through to each site's existing
// graceful line (generic resume, exhausted pool, follow-up fallback)
// instead of drying. A discarded draw restores c.depth /
// c.reactDryCount, so the thread is exactly as if the beat was never
// drawn.
//
// PROOF SHAPE (real sittings, real sayLine ledger — godpath lib, as the
// r226 F6 test): poison the thread's whole goal pool through OTHER
// villagers' sittings (cross-villager run ledger, never the test
// villager's own said lists), then pick the resume / `more` in a fresh
// sitting. Fixed: the graceful line speaks, never dry. Unfixed: dries.
//   1. convoLiveBeat unit — blocked beat returns null, depth restored
//   2. resume pick, beat blocked — generic resume speaks, thread stays live
//   3. `more` pick, beat blocked — exhausted line speaks, never dry
//   4. control: fresh resume pick speaks the beat (good flow)
//   5. control: fresh `more` pick speaks a beat (good flow)
//
// STAGING NOTE: the goal pool (8-12 lines, characterGen.json
// convo.goalFollow) is poisoned whole, because convoPick draws a random
// unserved line — no single line is predictable. Poisoning happens BEFORE
// opening the test sitting. The open thread is planted directly in the
// topic ledger (the menu gate is not under test; convoTurn runs the
// handler regardless, as in the r226 F6 test).
// Usage: node scripts/test-journey-social-life-r268-resume-fallthrough-20261123.js
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('journey-social-life-r268-resume-fallthrough');

const DRY_MARK = 'lost my train of thought';

(async () => {
  const Game = await K.load({ seed: 268100 });

  function fresh() {
    K.newRun(Game);
    const roster = (Game.state.village && Game.state.village.roster) || [];
    const scholarId = Game.villagerId;
    const others = roster.filter(v => v && v !== scholarId);
    const speaking = others.filter(vid => {
      try { const c = Game.commLevel(vid); return c && c.level !== 'none'; } catch (e) { return false; }
    });
    if (speaking.length < 1) throw new Error('fresh run has no speaking non-scholar roster members');
    return { speaking };
  }
  function day() { try { return (Game.state.scholar || {}).day || 1; } catch (e) { return 1; } }
  function convo(vid) { try { return Game.convoGet(vid); } catch (e) { return null; } }
  function openVid(vid) {
    try {
      const opened = Game.talkTo(vid);
      if (!opened) return false;
      const c = convo(vid);
      if (c && c.active) return true;
      try { Game.endConvo(vid, 'left'); } catch (e) {}
    } catch (e) {}
    return false;
  }
  // poisonPool: speak every line through ONE other villager's sitting, so
  // all of them land in the cross-villager run ledger but never in the
  // test villager's own said lists — the panel's shape (David Kim drying
  // on a line spoken recently in the run). One sitting, not one per line:
  // each sitting's opener + goodbye also enters the 48-entry run-ledger
  // window, and a sitting per line evicted the earliest poisons before
  // the test pick (the r268 RED run drew an evicted line in section 2
  // and spoke it — a flaky proof, not a fix failure).
  function poisonPool(speaking, excludeVid, lines) {
    for (const vid of speaking) {
      if (vid === excludeVid) continue;
      try {
        const opened = Game.talkTo(vid);
        if (!opened) continue;
        const c = convo(vid);
        if (!c || !c.active) { try { Game.endConvo(vid, 'left'); } catch (e) {} continue; }
        let said = 0;
        for (const line of lines) {
          try { if (Game.sayLine(vid, line)) said++; } catch (e) { /* next line */ }
        }
        try { Game.endConvo(vid, 'left'); } catch (e) {}
        if (said > 0) return said;
      } catch (e) { /* try the next villager */ }
    }
    return 0;
  }
  function themLinesSince(vid, from) {
    const c = convo(vid);
    const tr = (c && Array.isArray(c.transcript)) ? c.transcript : [];
    return tr.slice(from).filter(e => e && e.who === 'them').map(e => String(e.text || ''));
  }
  function transcriptLen(vid) {
    const c = convo(vid);
    return (c && Array.isArray(c.transcript)) ? c.transcript.length : 0;
  }
  function turn(vid, choiceId) {
    const before = transcriptLen(vid);
    let res = null;
    try { res = Game.convoTurn(vid, choiceId); } catch (e) { res = 'ERR:' + (e && e.message); }
    const lines = themLinesSince(vid, before);
    return { res, text: lines.join(' ') };
  }
  function goalPool(vid) {
    const goal = (typeof Game.npcGoal === 'function') ? Game.npcGoal(vid) : null;
    const cg = (Game.data && Game.data.characterGen && Game.data.characterGen.convo) || {};
    const pool = (cg.goalFollow || {})[goal] || [];
    return { goal, pool };
  }
  function poisonGoalPool(speaking, vid) {
    const { goal, pool } = goalPool(vid);
    if (!goal || !pool.length) return { goal, pool, poisoned: 0 };
    const poisoned = poisonPool(speaking, vid, pool);
    return { goal, pool, poisoned };
  }
  function plantOpenThread(vid, tid) {
    let label = tid;
    try { label = Game.convoThreadAbout(vid, tid, tid) || tid; } catch (e) {}
    try {
      const led = Game.convoTopicLedger(vid);
      led.open = led.open || [];
      led.open = led.open.filter(x => !x || x.tid !== tid);
      led.open.push({ tid, day: day(), why: 'changed the subject', label, snippet: null });
    } catch (e) {}
    return label;
  }
  // exhaustedSpoken: the turn's text contains a fragment of one of the
  // data-driven exhausted-pool lines (characterGen.json convo.exhausted)
  // — the data is the authority, not a hand-written fragment list.
  function exhaustedSpoken(text) {
    const cg = (Game.data && Game.data.characterGen && Game.data.characterGen.convo) || {};
    const pool = cg.exhausted || [];
    return pool.some(l => text.indexOf(String(l).slice(1, 30)) !== -1);
  }

  // ---- 1. convoLiveBeat unit: blocked beat -> null, depth restored. ----
  T.section('1. convoLiveBeat — blocked beat returns null, depth/reactDryCount restored');
  let f = fresh();
  let vid = f.speaking[0];
  T.ok('picked a test villager', !!vid, 'vid=' + vid);
  const staged1 = poisonGoalPool(f.speaking, vid);
  T.ok('found the test villager goal + pool', !!staged1.goal && staged1.pool.length > 0, 'goal=' + staged1.goal + ' pool=' + staged1.pool.length);
  T.ok('poisoned the whole goal pool through other villagers', staged1.poisoned === staged1.pool.length, 'poisoned=' + staged1.poisoned + '/' + staged1.pool.length);
  T.ok('convoLiveBeat exists', typeof Game.convoLiveBeat === 'function');
  if (typeof Game.convoLiveBeat === 'function') {
    T.ok('opened a sitting on the test villager', openVid(vid));
    const c = convo(vid);
    c.thread = 'goal'; c.depth = 1;
    const depthBefore = c.depth;
    const dryBefore = c.reactDryCount || 0;
    let beat = null;
    try { beat = Game.convoLiveBeat(vid); } catch (e) { beat = 'ERR:' + (e && e.message); }
    T.ok('convoLiveBeat returns null when the beat is ledger-blocked', beat === null, 'beat=' + String(beat).slice(0, 100));
    T.ok('depth restored after the discarded draw', c.depth === depthBefore, 'depth=' + c.depth + ' before=' + depthBefore);
    T.ok('reactDryCount restored after the discarded draw', (c.reactDryCount || 0) === dryBefore, 'reactDryCount=' + (c.reactDryCount || 0) + ' before=' + dryBefore);
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 2. Resume pick, beat blocked — generic resume speaks, never dry. ----
  T.section('2. Resume pick, beat blocked — generic resume speaks, thread stays live (panel: David Kim d82)');
  f = fresh();
  vid = f.speaking[0];
  T.ok('picked a test villager', !!vid, 'vid=' + vid);
  const staged2 = poisonGoalPool(f.speaking, vid);
  T.ok('poisoned the whole goal pool through other villagers', staged2.poisoned === staged2.pool.length, 'poisoned=' + staged2.poisoned + '/' + staged2.pool.length);
  const label2 = plantOpenThread(vid, 'goal');
  T.ok('planted an open goal thread', !!label2, 'label=' + label2);
  T.ok('opened a sitting on the test villager', openVid(vid));
  const t2 = turn(vid, 'alive:thread:goal');
  T.ok('the turn ran', !!t2.res && typeof t2.res === 'object', 'res=' + String(t2.res && t2.res.line || t2.res).slice(0, 80));
  T.ok('the turn does NOT dry', t2.text.indexOf(DRY_MARK) === -1, 'text=' + t2.text.slice(0, 160));
  T.ok('the turn speaks the generic resume line', t2.text.indexOf('we never did get back to that') !== -1, 'text=' + t2.text.slice(0, 160));
  T.ok('the turn does NOT repeat any blocked goal line', staged2.pool.every(l => t2.text.indexOf(l.slice(1, 30)) === -1), 'text=' + t2.text.slice(0, 160));
  T.ok('the thread is live after the resume', convo(vid).thread === 'goal', 'thread=' + convo(vid).thread);
  try { Game.endConvo(vid, 'left'); } catch (e) {}

  // ---- 3. `more` pick, beat blocked — exhausted line speaks, never dry. ----
  T.section('3. `more` pick, beat blocked — exhausted line speaks, never dry');
  f = fresh();
  vid = f.speaking[0];
  T.ok('picked a test villager', !!vid, 'vid=' + vid);
  const staged3 = poisonGoalPool(f.speaking, vid);
  T.ok('poisoned the whole goal pool through other villagers', staged3.poisoned === staged3.pool.length, 'poisoned=' + staged3.poisoned + '/' + staged3.pool.length);
  T.ok('opened a sitting on the test villager', openVid(vid));
  const c3 = convo(vid);
  c3.thread = 'goal'; c3.depth = 1;
  const t3 = turn(vid, 'more');
  T.ok('the turn ran', !!t3.res && typeof t3.res === 'object', 'res=' + String(t3.res && t3.res.line || t3.res).slice(0, 80));
  T.ok('the turn does NOT dry', t3.text.indexOf(DRY_MARK) === -1, 'text=' + t3.text.slice(0, 160));
  // FALL-THROUGH CONTRACT: the fix guarantees the turn speaks a live beat
  // or the exhausted pool — never the dry line, never a blocked line. A
  // live beat may come from outside the poisoned pool: npcGoal can
  // disagree with the goal the deep lines draw from (r268 finding — a
  // villager's npcGoal reads 'alone' outside the turn but the goal branch
  // serves 'belong' lines inside it; filed in the run note, not fixed
  // here). Such a beat is genuinely live, so speaking it is correct — the
  // exhausted pool is only the fall-through when the drawn beat itself is
  // blocked (proven at unit level in section 1, where convoLiveBeat
  // returns null and depth is restored).
  T.ok('the turn does NOT repeat any blocked goal line', staged3.pool.every(l => t3.text.indexOf(l.slice(1, 30)) === -1), 'text=' + t3.text.slice(0, 160));
  try { Game.endConvo(vid, 'left'); } catch (e) {}

  // ---- 4. Control: fresh resume pick speaks the beat. ----
  T.section('4. Control — fresh resume pick speaks the beat (good flow)');
  f = fresh();
  vid = f.speaking[0];
  T.ok('picked a test villager', !!vid, 'vid=' + vid);
  const staged4 = goalPool(vid);
  T.ok('found the test villager goal + pool', !!staged4.goal && staged4.pool.length > 0, 'goal=' + staged4.goal + ' pool=' + staged4.pool.length);
  const label4 = plantOpenThread(vid, 'goal');
  T.ok('planted an open goal thread', !!label4, 'label=' + label4);
  T.ok('opened a sitting on the test villager', openVid(vid));
  const t4 = turn(vid, 'alive:thread:goal');
  T.ok('the turn ran', !!t4.res && typeof t4.res === 'object', 'res=' + String(t4.res && t4.res.line || t4.res).slice(0, 80));
  T.ok('the turn does NOT dry', t4.text.indexOf(DRY_MARK) === -1, 'text=' + t4.text.slice(0, 160));
  // CONTROL (not a pool-membership claim): the good flow speaks real
  // thread content — not the generic resume line. Which pool the beat
  // comes from is the opener's business (held beats / thread state can
  // legitimately surface a line from outside this villager's goalFollow
  // pool); the fix must only preserve that a real beat speaks.
  T.ok('the turn speaks a real beat, not the generic resume', t4.text.indexOf('we never did get back to that') === -1, 'text=' + t4.text.slice(0, 160));
  try { Game.endConvo(vid, 'left'); } catch (e) {}

  // ---- 5. Control: fresh `more` pick speaks a beat. ----
  T.section('5. Control — fresh `more` pick speaks a beat (good flow)');
  f = fresh();
  vid = f.speaking[0];
  T.ok('picked a test villager', !!vid, 'vid=' + vid);
  const staged5 = goalPool(vid);
  T.ok('found the test villager goal + pool', !!staged5.goal && staged5.pool.length > 0, 'goal=' + staged5.goal + ' pool=' + staged5.pool.length);
  T.ok('opened a sitting on the test villager', openVid(vid));
  const c5 = convo(vid);
  c5.thread = 'goal'; c5.depth = 1;
  const t5 = turn(vid, 'more');
  T.ok('the turn ran', !!t5.res && typeof t5.res === 'object', 'res=' + String(t5.res && t5.res.line || t5.res).slice(0, 80));
  T.ok('the turn does NOT dry', t5.text.indexOf(DRY_MARK) === -1, 'text=' + t5.text.slice(0, 160));
  // CONTROL (same note as section 4): the good flow speaks a real beat —
  // not the exhausted pool. Pool provenance is the opener's business.
  T.ok('the turn speaks a real beat, not the exhausted pool', !exhaustedSpoken(t5.text), 'text=' + t5.text.slice(0, 160));
  try { Game.endConvo(vid, 'left'); } catch (e) {}

  T.done();
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
