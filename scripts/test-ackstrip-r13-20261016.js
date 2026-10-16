// test-ackstrip-r13-20261016.js — proof for the deepening-r13 ack-strip fix.
//
// RED (pre-fix): convoNoteBeat notes the FULL voiced line as the thread
//   snippet — including thinking-aloud preamble chunks ("Huh. Let me think
//   about that.", t2changeLine "You asked me that before..."). The resume
//   opener then quotes them back as the "memory" of the topic — a stitched
//   fragment of fillers before the content (transcript-caught on
//   8607-day60: 'Huh. Let me think about that." "You asked me that
//   before. It's a different question now." "The Witness. They…' as the
//   memory of "what's been happening").
// GREEN (post-fix): the snippet is the content chunk only.
// Run: node scripts/test-ackstrip-r13-20261016.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 8607, mode: 'test-ackstrip' });
  await setupGame(Game);
  const vid = 'ackstrip_probe';
  let fails = 0;
  const ok = (cond, msg) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + msg); if (!cond) fails++; };

  // The 8607-day60 case: lately line with two preamble chunks + content.
  const line = '"Huh. Let me think about that." "You asked me that before. It\'s a different question now." "The Witness. They took Barbara — on the screens."';
  Game.convoNoteBeat(vid, 'lately', line);
  let c = Game.convoGet(vid);
  let snip = (c.threadLog[c.threadLog.length - 1] || {}).snippet || '';
  console.log('  snippet: ' + JSON.stringify(snip));
  ok(!/Huh\. Let me think/.test(snip), 'topic ack stripped from snippet');
  ok(!/different question now/.test(snip), 't2changeLine stripped from snippet');
  ok(/The Witness/.test(snip), 'content chunk kept in snippet');

  // Single-chunk lines are noted whole.
  Game.convoNoteBeat(vid, 'gossip', '"Did you hear? Lauren just walked away."');
  c = Game.convoGet(vid);
  snip = (c.threadLog[c.threadLog.length - 1] || {}).snippet || '';
  ok(/Lauren just walked away/.test(snip), 'single-chunk line noted whole');

  // Narration lines are untouched (no false strip of "So.").
  Game.convoNoteBeat(vid, 'mood', '"So." They look at the fire for a moment.');
  c = Game.convoGet(vid);
  snip = (c.threadLog[c.threadLog.length - 1] || {}).snippet || '';
  ok(/^So\./.test(snip), 'non-ack first chunk keeps the line whole');

  // The exact gossip-ack variant from transcripts.
  Game.convoNoteBeat(vid, 'gossip2', '"You want to know about that? Okay." "Chantal is back. Walked in like they\'d never left."');
  c = Game.convoGet(vid);
  snip = (c.threadLog[c.threadLog.length - 1] || {}).snippet || '';
  ok(!/You want to know about that/.test(snip) && /Chantal is back/.test(snip), 'gossip ack stripped, gossip kept');

  console.log(fails ? `\n${fails} FAILURES` : '\nALL GREEN');
  process.exit(fails ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
