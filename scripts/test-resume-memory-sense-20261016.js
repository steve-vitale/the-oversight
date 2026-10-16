// test-resume-memory-sense-20261016.js — journey-scale r2 (people lens):
// show-memory in talk: does the resume opener's quoted "memory" read as a
// person remembering, or as a pasted snippet dump?
//
// SENSE CHECK (not a strict assertion suite): plants a thread the way the
// engine does (mid-thread walk-away with an ack-prefixed NPC line, as the
// r13 RED case produced), then emits the resume opener and prints it for
// human reading. Hard asserts guard only the mechanical bar: the quoted
// memory contains the content and none of the ack fillers.
// Run: node scripts/test-resume-memory-sense-20261016.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

async function main() {
  const { Game } = await loadGame({ seed: 8401, mode: 'test-resume-memory-sense' });
  await setupGame(Game);
  const vid = 'resume_probe';
  // convoResumeOpener needs trust >= 15 for the villager.
  try { (Game.state.village.trust = Game.state.village.trust || {})[vid] = 90; } catch (e) {}
  let fails = 0;
  const ok = (cond, msg) => { console.log((cond ? 'PASS' : 'FAIL') + ' ' + msg); if (!cond) fails++; };

  // Drive the ENGINE's plant path: the NPC speaks (beat noted), an exchange
  // happens, then the player walks away mid-thread. This is how open
  // threads get planted with their memory snippet + ledger backing.
  const line = '"Huh. Let me think about that." "Henry? An emergency dispatcher, back before. Solid person."';
  Game.convoNoteBeat(vid, 'gossip', line);
  const c = Game.convoGet(vid);
  c.exchanges = 1;
  c.thread = 'gossip';
  c.depth = 1;
  const log = (c.threadLog || []).filter(e => e.thread === 'gossip');
  const snip = (log[log.length - 1] || {}).snippet || '';
  console.log('  snippet noted: ' + JSON.stringify(snip));
  ok(/Henry/.test(snip), 'snippet holds the content');
  ok(!/Huh\. Let me think/.test(snip), 'snippet drops the ack filler');

  Game.convoPlantOpenThread(vid, 'left');
  // convoResumeOpener has a Math.random()>0.65 skip; retry a few times like
  // the engine's own cadence would.
  let o = null;
  for (let i = 0; i < 8 && !o; i++) o = Game.convoResumeOpener(vid);
  console.log('  resume opener: ' + (o && o.line));
  ok(!!(o && o.line), 'resume opener emitted');
  if (o && o.line) {
    ok(!/Huh\. Let me think/.test(o.line), 'opener quotes no ack filler');
    ok(/Henry/.test(o.line), 'opener quotes the content memory');
  }
  console.log('\nSENSE: read the resume opener above. Does it read as a person');
  console.log('remembering a conversation — or as a pasted snippet dump?');
  console.log(fails ? `\n${fails} MECHANICAL FAILURES` : '\nALL GREEN (mechanical)');
  process.exit(fails ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
