#!/usr/bin/env node
// test-voice-piper-20261011.js — proof for the Piper TTS voice prototype
// (Steve 2026-10-11: spoken villager dialogue; male/female x young/old voice
// classes; deterministic voice profile per generated person).
//
// Proves on fixed seeds:
//   V1  determinism: same person record -> byte-identical profile, 50 calls
//   V2  class coverage: m/f x young/old -> 4 distinct packIds AND 4 distinct
//       voiceIds (no two classes share a model)
//   V3  age boundary: 34 -> young, 35 -> old
//   V4  sex fallback: gender null + pro 'they' -> deterministic, stable;
//       explicit 'm'/'f' respected
//   V5  ranges: pitch in [0.90,1.12], rate in [0.88,1.15]
//   V6  identity jitter: two villagers, same age/sex -> same packId but
//       different pitch/rate (they don't sound like the same person)
//   V7  voiceCleanText: emoji stripped, markdown stripped, length capped
//   V8  gates: default node env -> 'off'; packs-cached + no gesture -> 'locked'
//   V9  pack bookkeeping: mock tts.stored() drives voicePackStatus() and the
//       default-on-once-cached rule
//   V10 voiceVerifyIds: registry checked against the live catalog, mismatch
//       reported (not silent)
//   V11 foreign-skip: foreign-flagged beats are never voiced
//   V12 empty: blank text -> 'empty'
//   V13 muted: Game.audio.isMuted() true -> 'muted'
//   V14 hook wired: sayLine() calls convoSpeakLine (source check)
//   V15 fallback path: pack missing -> 'speaking-fallback' (device voice);
//       pack cached + mock tts -> 'speaking-piper'
//
// Run: [SEED=123] node scripts/test-voice-piper-20261011.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');
const fs = require('fs');
const path = require('path');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const mk = (o) => Object.assign({ id: 'gen_x', name: 'Test Person', age: 30, gender: 'm', pro: 'he', personality: { temperament: 'steady' } }, o);

(async () => {
  const { Game, loadFails } = await loadGame({ seed: parseInt(process.env.SEED || '31337', 10), mode: 'voice' });
  ok('modules loaded clean', !loadFails || !loadFails.length, (loadFails || []).join('; '));
  ok('voice-piper attached', typeof Game.voiceProfileFor === 'function' && typeof Game.convoSpeakLine === 'function');
  await setupGame(Game);

  // ---- V1 determinism ----
  const p1 = mk({ id: 'gen_aaa', name: 'Mara Voss', age: 44, gender: 'f', personality: { temperament: 'intense' } });
  const first = Game.voiceProfileFor(p1);
  let stable = true;
  for (let i = 0; i < 50; i++) { if (!eq(Game.voiceProfileFor(p1), first)) { stable = false; break; } }
  ok('V1 same person -> identical profile x50', stable, JSON.stringify(first));

  // ---- V2 class coverage ----
  const classes = [
    mk({ id: 'a', name: 'A', age: 22, gender: 'm' }),
    mk({ id: 'b', name: 'B', age: 61, gender: 'm' }),
    mk({ id: 'c', name: 'C', age: 25, gender: 'f' }),
    mk({ id: 'd', name: 'D', age: 58, gender: 'f' }),
  ].map(p => Game.voiceProfileFor(p));
  const packIds = classes.map(c => c.packId);
  const voiceIds = classes.map(c => c.voiceId);
  ok('V2 four classes -> four packIds', eq(packIds.slice().sort(), ['f-old', 'f-young', 'm-old', 'm-young']), packIds.join(','));
  ok('V2 four classes -> four distinct voiceIds', new Set(voiceIds).size === 4, voiceIds.join(','));
  ok('V2 young/old split correct', classes[0].ageBand === 'young' && classes[1].ageBand === 'old' && classes[2].ageBand === 'young' && classes[3].ageBand === 'old');

  // ---- V3 age boundary ----
  ok('V3 age 34 -> young', Game.voiceProfileFor(mk({ age: 34 })).ageBand === 'young');
  ok('V3 age 35 -> old', Game.voiceProfileFor(mk({ age: 35 })).ageBand === 'old');

  // ---- V4 sex fallback ----
  const nb1 = Game.voiceProfileFor(mk({ gender: null, pro: 'they', id: 'gen_nb', name: 'Alex Roe' }));
  const nb2 = Game.voiceProfileFor(mk({ gender: null, pro: 'they', id: 'gen_nb', name: 'Alex Roe' }));
  ok('V4 unknown gender -> deterministic pick', eq(nb1, nb2) && (nb1.sexClass === 'm' || nb1.sexClass === 'f'));
  ok('V4 explicit gender respected', Game.voiceProfileFor(mk({ gender: 'f', pro: 'he' })).sexClass === 'f');

  // ---- V5 ranges ----
  let inRange = true;
  for (let i = 0; i < 200; i++) {
    const pr = Game.voiceProfileFor(mk({ id: 'g' + i, name: 'N' + i, age: 18 + (i % 50), gender: i % 2 ? 'm' : 'f' }));
    if (pr.pitch < 0.90 || pr.pitch > 1.12 || pr.rate < 0.88 || pr.rate > 1.15) { inRange = false; break; }
  }
  ok('V5 pitch/rate in documented ranges x200', inRange);

  // ---- V6 identity jitter ----
  const j1 = Game.voiceProfileFor(mk({ id: 'gen_j1', name: 'Jon Hale', age: 40, gender: 'm' }));
  const j2 = Game.voiceProfileFor(mk({ id: 'gen_j2', name: 'Pete Marl', age: 40, gender: 'm' }));
  ok('V6 same class, different people -> same pack, different voice',
    j1.packId === j2.packId && (j1.pitch !== j2.pitch || j1.rate !== j2.rate),
    JSON.stringify([j1, j2]));

  // ---- V7 clean text ----
  ok('V7 emoji stripped', Game.voiceCleanText('Hello 👋 world 🌾') === 'Hello world');
  ok('V7 markdown stripped', Game.voiceCleanText('**bold** *it* `code`') === 'bold it code');
  const long = Game.voiceCleanText('x'.repeat(500));
  ok('V7 length capped at 400', long.length <= 400, String(long.length));

  // ---- V8 gates ----
  Game._voicePacksCached = false; Game._voiceUnlocked = false; Game._voiceTts = null;
  delete Game.audio;
  ok('V8 default (nothing cached) -> off', Game.convoSpeakLine('gen_aaa', 'hello there') === 'off');
  Game._voicePacksCached = true;
  ok('V8 cached but no gesture -> locked', Game.convoSpeakLine('gen_aaa', 'hello there') === 'locked');

  // ---- V15 fallback vs piper path (needs unlocked + enabled) ----
  Game._voiceUnlocked = true;
  Game._voiceTts = { stored: async () => [], download: async () => { throw new Error('offline'); } };
  const st15a = Game.convoSpeakLine('gen_aaa', 'hello there');
  ok('V15 pack missing -> speaking-fallback', st15a === 'speaking-fallback', st15a);
  Game._voiceTts = {
    stored: async () => ['en_US-ryan-medium'],
    download: async () => {},
    predict: async () => null,
    voices: async () => [],
  };
  await Game.refreshVoiceCache();
  // use a REAL roster villager so vpOf resolves (convoSpeakLine looks the
  // person up by vid — a fake id yields the empty-person default profile)
  const rosterV = ((Game.state.village || {}).roster || []).filter(id => id !== Game.villagerId);
  const testVid = rosterV[0];
  const testVp = Game.vpOf(testVid);
  testVp.age = 22; testVp.gender = 'm'; testVp.pro = 'he';
  const profMY = Game.voiceProfileFor(testVp);
  ok('V15 sanity: young male maps to cached ryan pack', profMY.packId === 'm-young' && profMY.voiceId === 'en_US-ryan-medium');
  const st15b = Game.convoSpeakLine(testVid, 'hello there');
  ok('V15 pack cached -> speaking-piper', st15b === 'speaking-piper', st15b);

  // ---- V9 pack bookkeeping ----
  Game._voiceTts = { stored: async () => ['en_US-amy-medium'], download: async () => {} };
  await Game.refreshVoiceCache();
  const st9 = Game.voicePackStatus();
  ok('V9 cached pack reported cached', st9['f-young'] === 'cached', JSON.stringify(st9));
  ok('V9 missing packs reported missing', st9['m-young'] === 'missing' && st9['m-old'] === 'missing' && st9['f-old'] === 'missing');
  ok('V9 default-on-once-cached rule', Game._voicePacksCached === true);

  // ---- V10 verify ids ----
  Game._voiceTts = {
    stored: async () => [],
    voices: async () => [{ key: 'en_US-ryan-medium' }, { key: 'en_US-lessac-medium' }, { key: 'en_US-amy-medium' }, { key: 'en_US-kristin-medium' }],
  };
  const v10a = await Game.voiceVerifyIds();
  ok('V10 all ids resolve -> ok', v10a.ok === true, JSON.stringify(v10a));
  Game._voiceTts.voices = async () => [{ key: 'en_US-ryan-medium' }];
  const v10b = await Game.voiceVerifyIds();
  ok('V10 mismatch reported, not silent', v10b.ok === false && v10b.missing.length === 3, JSON.stringify(v10b));

  // ---- V11/V12/V13 gates ----
  Game._voicePacksCached = true; Game._voiceUnlocked = true; Game._voiceTts = { stored: async () => [] };
  delete Game.audio;
  ok('V11 foreign beat never voiced', Game.convoSpeakLine('gen_aaa', 'bonjour', { foreign: 'french' }) === 'foreign-skip');
  ok('V12 blank text -> empty', Game.convoSpeakLine('gen_aaa', '   ') === 'empty');
  Game.audio = { isMuted: () => true };
  ok('V13 muted -> muted', Game.convoSpeakLine('gen_aaa', 'hello') === 'muted');
  delete Game.audio;

  // ---- V14 hook wired ----
  const convSrc = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'conversation.js'), 'utf8');
  ok('V14 sayLine() calls convoSpeakLine', convSrc.includes('this.convoSpeakLine(vid, chunk, opts)'));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
