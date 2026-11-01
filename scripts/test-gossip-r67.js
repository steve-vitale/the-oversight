// scripts/test-gossip-r67.js — proof test for the r67 gossip near-duplicate
// analyzer (pure; no engine input). Covers: the r66 Henrique pair flags as
// a NEAR FALLBACK pair; distinct lines do not flag; exact repeats flag as
// EXACT; voice-open stripping does not create false matches across
// different cores.
const assert = require('assert');
const { normalizeLine, analyzeTranscript, FALLBACK_CORE } = require('./analyze-journey-scale-r67-gossip-20261101');

let n = 0;
function check(name, cond) { n += 1; assert.ok(cond, name); console.log('ok ' + n + ' - ' + name); }

// 1. Henrique r66 pair normalizes to the same fallback core.
const open = 'The way I read it — Word is you\'re doing right by people. Keep it up.';
const close = 'Word is you\'re doing right by people. Keep it up. That\'s my read.';
check('henrique open normalizes to fallback core', normalizeLine(open) === FALLBACK_CORE);
check('henrique close normalizes to fallback core', normalizeLine(close) === FALLBACK_CORE);

// 2. Full-transcript analysis flags exactly one NEAR FALLBACK pair.
const tx = [
  '=== seed 85003 day 120 — conversation with Henrique (visjoin_118) ===',
  'THEM: "It\'s quiet today. Wrong kind of quiet."',
  'YOU: [dlg:comfort] "Hey — you alright?"',
  'THEM: "Heh. Nobody\'s asked me that in a while. ...I\'m alright. Getting there."',
  'YOU: [ask:gossip] "What\'s the word around the fire?"',
  'THEM: "You want to know about that? Okay." "Dulat? A Dentist, back before. Solid person. Funny how that works."',
  'YOU: [dlg:more] "Go on."',
  'THEM: "Okay, okay — Chloe headed out to haul something back."',
  'YOU: [dlg:react] (listen)',
  'THEM: "The way I read it — Word is you\'re doing right by people. Keep it up."',
  'YOU: [dlg:more] "Go on."',
  'THEM: "Word is you\'re doing right by people. Keep it up. That\'s my read."',
  'YOU: [dlg:react] (listen)',
  'THEM: "Moving! But — good talk! More later!"',
].join('\n');
const r = analyzeTranscript(tx);
check('henrique transcript: 1 pair', r.pairs.length === 1);
check('henrique pair is NEAR', r.pairs[0].kind === 'NEAR');
check('henrique pair is FALLBACK', r.pairs[0].fallback === true);
check('henrique pair distance 1', r.pairs[0].distance === 1);

// 3. Distinct lines do not flag.
const tx2 = [
  'THEM: "Word is you\'ve been sharing. Giving freely, no questions asked."',
  'THEM: "Word is you stood your ground out there."',
].join('\n');
check('distinct gossip lines: 0 pairs', analyzeTranscript(tx2).pairs.length === 0);

// 4. Exact repeats flag as EXACT, not NEAR.
const tx3 = [
  'THEM: "Quiet lately. Too quiet, maybe."',
  'THEM: "Quiet lately. Too quiet, maybe."',
].join('\n');
const r3 = analyzeTranscript(tx3);
check('exact repeat: 1 pair', r3.pairs.length === 1);
check('exact repeat kind EXACT', r3.pairs[0].kind === 'EXACT');
check('exact repeat not fallback', r3.pairs[0].fallback === false);

// 5. Different cores sharing an open draw do not match.
const tx4 = [
  'THEM: "The way I read it — Word is you told it straight."',
  'THEM: "The way I read it — Word is people can count on you."',
].join('\n');
check('different cores with same open: 0 pairs', analyzeTranscript(tx4).pairs.length === 0);

console.log(n + ' checks passed');
