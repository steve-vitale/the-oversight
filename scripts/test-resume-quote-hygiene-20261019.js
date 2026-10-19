#!/usr/bin/env node
// test-resume-quote-hygiene-20261019.js — PROOF for journey-landing r25:
// thread-resume memory quotes must not nest double quotes.
//
// Transcript-caught (seed 95, day 14, Nino): the thread-resume opener
// rendered as:
//   "What? We never finished talking about how you slept — we left it
//    mid-thought. 'They go still. "So it's not just me. Good. That's...
//    good to know. Bad, but good.'"
// The snippet's INNER double quotes survived the leading/trailing strip and
// nested unescaped inside the opener's double quotes — garbled stitching.
//
// FIX (conversation.js convoResumeOpener): strip ALL double quotes from the
// snippet before wrapping it in single quotes. The memory reads clean
// without the inner marks: 'They go still. So it's not just me. Good.'
//
// RED: pre-fix tree -> the opener line contains a nested '"..."' span.
// GREEN: fix -> no double quote survives inside the opener line.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const SEED = parseInt(process.env.SEED || '9201', 10);
let pass = 0, fail = 0;
function ok(cond, name) { if (cond) pass++; else { fail++; console.error('FAIL:', name); } }

// count double-quote characters in a string
function dq(s) { return (String(s).match(/"/g) || []).length; }

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'resume-quote-hygiene-proof' });
  await setupGame(Game);
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  ok(roster.length > 0, 'roster non-empty');
  const vid = roster[0];

  // plant an open thread with a snippet carrying INNER double quotes,
  // mirroring the transcript-caught case
  const L = Game.convoTopicLedger(vid);
  L.open = (L.open || []).filter(o => o.tid !== 'testquote');
  L.open.push({
    tid: 'testquote',
    label: 'how you slept',
    day: (Game.state.scholar || {}).day || 1,
    why: 'unfinished business',
    snippet: 'They go still. "So it\'s not just me. Good. That\'s good to know."',
  });
  v.trust = v.trust || {};
  v.trust[vid] = 50; // resume gate needs trust >= 15
  // clear gates that would suppress the resume
  try { delete (v.convoSeeds || {})[vid]; } catch (e) {}
  try { delete (v.talkRequests || {})[vid]; } catch (e) {}

  // convoResumeOpener has a 0.65 random pass gate — retry until it fires
  let res = null;
  for (let i = 0; i < 40 && !res; i++) {
    try {
      const c = Game.convoGet(vid);
      if (c) c._resumedOnce = false;
      res = Game.convoResumeOpener(vid);
    } catch (e) { /* retry */ }
  }
  ok(res && res.line, 'resume opener fired');
  const line = res ? String(res.line) : '';
  console.log('   opener: ' + line.slice(0, 200));

  // the opener is wrapped in exactly one pair of double quotes (open+close);
  // any MORE means inner quotes survived and nested
  ok(dq(line) === 2, `opener has exactly 2 double quotes (open/close), got ${dq(line)}`);
  ok(!/\"[^\"]*\"[^\"]*\"/.test(line), 'no nested double-quote span in opener');
  ok(/how you slept/i.test(line), 'thread label present');
  ok(/They go still/i.test(line), 'snippet memory present (quotes stripped, words kept)');
  ok(/So it's not just me/i.test(line), 'snippet inner content preserved');

  // control: a snippet with no inner quotes renders identically to before
  const L2 = Game.convoTopicLedger(vid);
  L2.open = (L2.open || []).filter(o => o.tid !== 'testquote2');
  L2.open.push({
    tid: 'testquote2', label: 'the cold nights', day: (Game.state.scholar || {}).day || 1,
    why: 'unfinished business', snippet: 'We should bank the fire better.',
  });
  let res2 = null;
  for (let i = 0; i < 40 && !res2; i++) {
    try {
      const c = Game.convoGet(vid);
      if (c) c._resumedOnce = false;
      res2 = Game.convoResumeOpener(vid);
      if (res2 && res2.thread !== 'testquote2') res2 = null;
    } catch (e) { /* retry */ }
  }
  ok(res2 && res2.line, 'control opener fired');
  const line2 = res2 ? String(res2.line) : '';
  ok(dq(line2) === 2, `control opener has exactly 2 double quotes, got ${dq(line2)}`);
  ok(/'We should bank the fire better\.'/.test(line2), 'plain snippet still single-quoted: ' + line2.slice(0, 160));

  console.log(`\nresume-quote-hygiene: ${pass} pass, ${fail} fail (seed ${SEED})`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(2); });
