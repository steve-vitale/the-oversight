#!/usr/bin/env node
// test-convo-exit-secret-gate-20261119.js — proof for the journey-deepening
// r244 F8 fix (r238-owed, carried by r243).
//
// THE DEFECT (r238 F8): "This stays between us, right? Right." closed a
// sitting where NOTHING was confided (Ellie 104806 d60, cautious
// temperament exit pool). The line implies a confidence was shared; in
// that sitting none was. A villager implying a secret that never happened
// is a spoken lie about the shared history — the exact class the
// sense-testing law forbids.
//
// THE FIX (src/js/conversation.js, endConvo): filter that line out of the
// exit pool unless c.secretShared is true (set only when the villager
// volunteers a secret as the opener, conversation.js:3793). Data
// untouched — the line stays in the cautious pool for sittings where a
// secret WAS shared. The filter never empties the pool.
//
// METHOD: drive the real endConvo on a cautious villager through full
// sittings (startConvo -> endConvo('natural')). convoPickCycle serves
// every pool line exactly once per cycle, so N sittings past a full cycle
// is a deterministic probe, not a sample:
//   Case A (no secret): 16 sittings, secretShared false — the line must
//     NEVER appear; >=6 distinct other exit lines must be served (the
//     pool still cycles, it did not collapse to one line).
//   Case B (secret shared): fresh said-ledger, secretShared true — the
//     line MUST appear within 16 sittings (it is still in the pool).
//   Case C (data guard): characterGen.json carries the line in exactly
//     one exit pool (cautious) — the fix's assumption, pinned so a data
//     move cannot silently strand or spread it.
//
// RED (before): Case A fails — the line appears within the first cycle.
// GREEN (after): Case A 0 hits, Case B >= 1 hit, Case C 1 pool.
// RNG is seeded by loadGame (mulberry32 BEFORE eval) — deterministic.
//
// Usage: node scripts/test-convo-exit-secret-gate-20261119.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const fs = require('fs');
const path = require('path');

const CONFIDE = '"This stays between us, right? Right."';
const SITTINGS = 16;

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; console.log('  FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

async function main() {
  const { Game } = await loadGame({ seed: 105099, mode: 'exit-secret-gate-proof' });
  await setupGame(Game);
  Game.say = () => {}; Game.sysSay = () => {}; Game.emit = () => {};

  const vids = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  if (!vids.length) throw new Error('no villager in roster');

  // Find (or force) a cautious villager in a neutral mood, low trust so
  // the voice tier is 'new' (no close-tier shorthand pool to muddy the
  // cycle) and the secret opener cannot fire (needs trust >= 40).
  let vid = null;
  for (const id of vids) {
    try {
      const mood = (typeof Game.npcMood === 'function') ? Game.npcMood(id) : 'neutral';
      if ((mood === 'grieving' || mood === 'scared')) continue;
      if (Game.npcTemper(id) === 'cautious') { vid = id; break; }
    } catch (e) {}
  }
  if (!vid) {
    vid = vids[0];
    try {
      const p = Game.state.village.people ? Game.state.village.people[vid] : null;
      const person = (typeof Game.person === 'function') ? Game.person(vid) : p;
      if (person) {
        person.personality = person.personality || {};
        person.personality.temperament = 'cautious';
      }
    } catch (e) {}
  }
  check('test villager reads cautious', Game.npcTemper(vid) === 'cautious', 'temper=' + Game.npcTemper(vid));
  try { Game.state.village.trust[vid] = 10; } catch (e) {}
  check('voice tier is new (no shorthand pool)', (typeof Game.convoVoiceTier === 'function' ? Game.convoVoiceTier(vid) : 'new') === 'new',
    'tier=' + (typeof Game.convoVoiceTier === 'function' ? Game.convoVoiceTier(vid) : '?'));

  function runSitting(secretShared) {
    Game.startConvo(vid);
    const c = Game.convoGet(vid);
    if (!c || !c.active) return { line: null, active: false };
    if (secretShared) c.secretShared = true;
    else c.secretShared = false;
    const r = Game.endConvo(vid, 'natural');
    return { line: (r && typeof r.line === 'string') ? r.line : null, active: true };
  }

  // ---- Case A: no secret shared — the line must never close a sitting ----
  const linesA = [];
  let nullsA = 0;
  for (let i = 0; i < SITTINGS; i++) {
    const s = runSitting(false);
    if (!s.active || s.line == null) { nullsA++; continue; }
    linesA.push(s.line);
  }
  const hitsA = linesA.filter(l => l === CONFIDE).length;
  check('A: 16 sittings all produced an exit line', nullsA === 0, 'nulls=' + nullsA + ' lines=' + linesA.length);
  check('A: confide line never closes a secret-less sitting', hitsA === 0, 'hits=' + hitsA);
  const distinctA = new Set(linesA).size;
  check('A: exit pool still cycles (>=6 distinct lines)', distinctA >= 6, 'distinct=' + distinctA);
  check('A: no secret was shared in any sitting', (() => { try { return !Game.convoGet(vid).secretShared; } catch (e) { return false; } })());

  // ---- Case B: secret shared — the line must still be reachable ----
  try { Game.convoGet(vid).said = {}; } catch (e) {}
  const linesB = [];
  let nullsB = 0;
  for (let i = 0; i < SITTINGS; i++) {
    const s = runSitting(true);
    if (!s.active || s.line == null) { nullsB++; continue; }
    linesB.push(s.line);
  }
  const hitsB = linesB.filter(l => l === CONFIDE).length;
  check('B: 16 sittings all produced an exit line', nullsB === 0, 'nulls=' + nullsB + ' lines=' + linesB.length);
  check('B: confide line DOES close a sitting where a secret was shared', hitsB >= 1, 'hits=' + hitsB);

  // ---- Case C: data guard — the line lives in exactly one exit pool ----
  let poolsWithLine = [];
  try {
    const cg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'characterGen.json'), 'utf8'));
    const exits = ((cg || {}).convo || {}).exits || {};
    poolsWithLine = Object.keys(exits).filter(k => (exits[k] || []).indexOf(CONFIDE) >= 0);
  } catch (e) { poolsWithLine = ['read-error:' + String(e && e.message || e)]; }
  check('C: confide line lives in exactly one exit pool (cautious)', poolsWithLine.length === 1 && poolsWithLine[0] === 'cautious',
    'pools=' + JSON.stringify(poolsWithLine));

  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail) { console.log('RED: the confide line can close a sitting with no secret shared'); process.exit(1); }
  console.log('GREEN: the confide line only closes sittings where a secret was shared');
}
main().catch(e => { console.error('FATAL', e); process.exit(2); });
