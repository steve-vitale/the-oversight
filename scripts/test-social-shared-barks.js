// REPRO (bug class: shared bark pools): identical lines repeat across
// DIFFERENT speakers in one scene because pools are shared globally.
//  (a) hostile attack barks (src/js/party.js:841-846): 3 verbs via
//      pickFresh(verbs, 'humanRetaliate') — one global key, so 4 uprising
//      attackers all cycle the same 3 lines in one fight.
//  (b) askAboutCase fallbacks (src/js/betrayal.js:2244-2248): 3-line pick()
//      pool — asking 6 villagers about your case yields the same "Honestly?"
//      line from 3 different people.
// The codebase already has the fix pattern (convoPick/convoPickCycle with
// per-vid keys); these two spots don't use it.
// Expected: no identical line spoken by 2+ different villagers in one scene.
// Usage: node scripts/test-social-shared-barks.js
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const K = require('./godpath/lib');
let Game;
let sayLog = [];
let fail = 0;

// same line (minus the speaker tag) spoken by 2+ distinct speakers?
function crossSpeakerRepeats(lines) {
  const byLine = {};
  for (const l of lines) {
    // strip leading "🔪 Name " / "Name: " speaker tags
    const body = String(l).replace(/^🔪?\s*[^:]{2,60}?:?\s*(swings|lashes|fights)/, '$1')
      .replace(/^"?(Honestly\?[^"]*|I hear the fire[^"]*|Nobody tells me[^"]*).*/, '$1');
    byLine[body] = byLine[body] || new Set();
    const spk = (String(l).match(/^🔪?\s*([^:]{2,40}?)(?:\s+(?:swings|lashes|fights)|:)/) || [])[1];
    if (spk) byLine[body].add(spk.trim());
  }
  return Object.entries(byLine).filter(([b, s]) => b.length > 40 && s.size > 1);
}

(async () => {
  Game = await K.load({ seed: 20261006 });
  Game.say = (t) => { sayLog.push(String(t)); };

  // (a) uprising attack barks
  Game.debugScenario('uprising');
  sayLog = [];
  let guard = 0;
  while (Game.tbfight && !Game.tbfight.over && guard < 25) {
    guard++;
    if (Game.tbIsPlayerTurn()) Game.tbPlayerEndTurn();
    else { try { Game.tbAdvance(); } catch (e) { break; } }
  }
  const barkLines = sayLog.filter(l => /^🔪/.test(l) && /swings wildly|lashes out|cornered animal/.test(l));
  const repsA = crossSpeakerRepeats(barkLines);
  console.log(`(a) uprising attack barks: ${barkLines.length} barks, cross-speaker repeats: ${repsA.length}`);
  repsA.slice(0, 3).forEach(([b, s]) => console.log('    x' + s.size + ' speakers: "' + b.slice(0, 70) + '..."'));
  if (repsA.length) { console.log('FAIL (a): identical attack bark from multiple attackers'); fail++; }
  else console.log('ok (a)');

  // (b) askAboutCase fallbacks
  Game.debugScenario('mootAccused');
  sayLog = [];
  const c = (Game.betrayalState().cases || []).find(x => x.playerRole === 'accused');
  for (const vid of Game.npcIds().slice(0, 6)) { try { Game.askAboutCase(c.id, vid); } catch (e) {} }
  const heard = sayLog.filter(l => /Honestly\?|I hear the fire|Nobody tells me/.test(l));
  const seen = {};
  for (const l of heard) { const k = l.replace(/^.*?(Honestly\?|I hear the fire|Nobody tells me).*$/, '$1'); seen[k] = (seen[k] || 0) + 1; }
  const repsB = Object.entries(seen).filter(([, n]) => n > 1);
  console.log(`(b) askAboutCase fallbacks: ${heard.length} lines, repeated templates: ${repsB.length}`);
  repsB.slice(0, 3).forEach(([k, n]) => console.log(`    x${n}: "${k}..."`));
  if (repsB.length) { console.log('FAIL (b): identical fallback line from multiple villagers'); fail++; }
  else console.log('ok (b)');

  console.log(fail ? `\n${fail} FAILURES` : '\nALL PASS');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('CRASH:', e.message); process.exit(2); });
