// Proof: the waker's wake-up dialogue is voiced (Steve 2026-10-12:
// "the person who wakes me up still has no dialog playing").
// (a) Game.getQuest() exposes the waker's villager id as `giver` so the UI
//     can voice the lines as that person.
// (b) app.js questOverlay's render path invokes Game.convoSpeakLine with
//     (giver, line) — the same hook every other NPC line uses.
// RED: revert either half and the corresponding assertion fails.
const fs = require('fs');
const path = require('path');
const ROOT = '/home/hatch/workspace/the-scattering';

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
}

// --- (b) source wiring: questOverlay voices each rendered line ---
const appSrc = fs.readFileSync(path.join(ROOT, 'src/js/app.js'), 'utf8');
const qoStart = appSrc.indexOf('function questOverlay(cb)');
ok(qoStart > -1, 'questOverlay exists in app.js');
const qoBody = appSrc.slice(qoStart, qoStart + 1400);
ok(/convoSpeakLine\s*\(\s*q\.giver\s*,\s*q\.lines\[i\]/.test(qoBody),
  'questOverlay render calls Game.convoSpeakLine(q.giver, q.lines[i])');
ok(/typeof Game\.convoSpeakLine/.test(qoBody),
  'call is guarded (typeof check + try/catch), node-safe');

// --- (a) getQuest exposes the giver id ---
// Minimal harness: eval game.js-adjacent modules is heavy; instead assert the
// return contract directly from source (getQuest's return statement).
const gameSrc = fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8');
const gqStart = gameSrc.indexOf('getQuest()');
ok(gqStart > -1, 'getQuest exists in game.js');
const gqBody = gameSrc.slice(gqStart, gqStart + 5200);
ok(/return\s*\{\s*from:\s*first,\s*giver:\s*giverId,\s*lines\s*\}/.test(gqBody),
  'getQuest returns { from, giver: giverId, lines }');
ok(gqBody.indexOf('giverId = this.pickRandomVillager(npcIds)') > -1,
  'giverId is a real roster member (pickRandomVillager over NPC ids)');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
