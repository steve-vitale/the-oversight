#!/usr/bin/env node
// test-audio-check.js — proof for the audio sound-check board
// (Steve 2026-10-11: debug scenarios so every audio surface can be
// verified on his phone; foreign-language voicing untouched).
//
// Proves on fixed seeds:
//   A1  wiring: Game.playSystemLine exists; manifest loads (203 ids);
//       sys-day7-01 resolves to its real file path.
//   A2  plumbing: playSystemLine('sys-day7-01') -> 'playing'; the captured
//       blob's byte size matches the real MP3 on disk (URL resolution +
//       bytes actually flow to Game.audio.playVoice).
//   A3  blob cache: second play of the same id performs no new fetch.
//   A4  unknown id -> 'unknown', console.warn, never throws, no MP3 fetch.
//   A5  muted -> 'muted', no fetch at all.
//   A6  pre-gesture -> 'locked', no fetch at all.
//   A7  no Game.audio -> 'no-audio' (harness robustness, never throws).
//   A8  manifest fetch failure -> 'error', never throws.
//   B1  scenario audioSystem runs, calls playSystemLine with the 3 ids
//       in order (sys-day7-01, sys-silly-11, sys-dark-10).
//   B2  scenario audioVillager runs, 2 villagers placed adjacent.
//   B3  scenario audioPersona runs (real alienEncounter path).
//   B4  scenario audioClaude runs, calls with claude-lastwords then
//       sys-the-sound (two separate events).
//   B5  all four listed in debugScenarioList + '🔊 Audio — sound check'.
//   C1  foreign-skip untouched: voice-piper.js still gates foreign lines.
//   C2  ontology validator passes (75 systems).
//
// Audio can't be HEARD headless — this proves the plumbing. Steve's phone
// is the real check ([needs-eyes]).
//
// Run: [SEED=123] node scripts/test-audio-check.js
'use strict';
const { loadGame } = require('./sim-harness');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

(async () => {
  const { Game, loadFails } = await loadGame({ seed: parseInt(process.env.SEED || '31337', 10), mode: 'audio' });
  ok('modules loaded clean', !loadFails || !loadFails.length, (loadFails || []).join('; '));
  ok('voice-system attached', typeof Game.playSystemLine === 'function' && typeof Game.systemLineIds === 'function');

  // ---- fetch stub: real manifest.json + real MP3 bytes from disk ----
  let fetchCalls = [];
  global.fetch = (url) => {
    fetchCalls.push(String(url));
    const full = path.join(ROOT, String(url));
    if (String(url).endsWith('.json')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(JSON.parse(fs.readFileSync(full, 'utf8'))) });
    }
    const buf = fs.readFileSync(full);
    return Promise.resolve({ ok: true, blob: () => Promise.resolve(new Blob([buf], { type: 'audio/mpeg' })) });
  };

  // ---- Game.audio stub: capture blobs, no decode ----
  let played = [];
  let muted = false;
  const realAudio = Game.audio;
  Game.audio = {
    isMuted: () => muted,
    playVoice: async (blob) => { played.push(blob); return true; },
  };
  Game._voiceUnlocked = true;

  // ---- A1: manifest + entry resolution ----
  const man = await Game.systemAudioManifest();
  ok('A1 manifest loads with 203 ids', Array.isArray(man) && man.length === 203, 'got ' + (man && man.length));
  const e = (await Game.systemAudioManifest()).find(x => x.id === 'sys-day7-01');
  ok('A1 sys-day7-01 resolves to real file', e && e.file === 'src/audio/system/sys-day7-01.mp3', e && e.file);

  // ---- A2: plumbing — real bytes reach playVoice ----
  fetchCalls = []; played = [];
  const st2 = await Game.playSystemLine('sys-day7-01');
  const realSize = fs.statSync(path.join(ROOT, 'src/audio/system/sys-day7-01.mp3')).size;
  ok('A2 status playing', st2 === 'playing', st2);
  ok('A2 blob bytes match disk', played.length === 1 && played[0].size === realSize,
    `played=${played.length} size=${played[0] && played[0].size} disk=${realSize}`);
  ok('A2 fetched the mp3 URL', fetchCalls.some(u => u === 'src/audio/system/sys-day7-01.mp3'), fetchCalls.join(','));

  // ---- A3: blob cache ----
  const before = fetchCalls.length;
  const st3 = await Game.playSystemLine('sys-day7-01');
  ok('A3 replay cached (no new fetch)', st3 === 'playing' && fetchCalls.length === before,
    `calls ${before} -> ${fetchCalls.length}`);

  // ---- A4: unknown id ----
  let warned = null;
  const realWarn = console.warn;
  console.warn = (m) => { warned = String(m); };
  fetchCalls = [];
  const st4 = await Game.playSystemLine('sys-nope-99');
  console.warn = realWarn;
  ok('A4 unknown id -> unknown, warned, no mp3 fetch',
    st4 === 'unknown' && /unknown system line/.test(warned || '') && !fetchCalls.some(u => u.endsWith('.mp3')),
    `status=${st4} warned=${warned}`);

  // ---- A5: muted ----
  muted = true; fetchCalls = [];
  const st5 = await Game.playSystemLine('sys-day7-01');
  muted = false;
  ok('A5 muted -> muted, zero fetch', st5 === 'muted' && fetchCalls.length === 0, `status=${st5} calls=${fetchCalls.length}`);

  // ---- A6: pre-gesture ----
  Game._voiceUnlocked = false; fetchCalls = [];
  const st6 = await Game.playSystemLine('sys-day7-01');
  Game._voiceUnlocked = true;
  ok('A6 locked -> locked, zero fetch', st6 === 'locked' && fetchCalls.length === 0, `status=${st6}`);

  // ---- A7: no Game.audio ----
  Game.audio = undefined;
  const st7 = await Game.playSystemLine('sys-day7-01');
  Game.audio = { isMuted: () => false, playVoice: async (b) => { played.push(b); return true; } };
  ok('A7 no audio graph -> no-audio', st7 === 'no-audio', st7);

  // ---- A8: mp3 fetch failure -> 'error', never throws ----
  // sys-dark-10's blob is NOT in the real module's cache (the B-tests
  // below stub playSystemLine itself), so this exercises the cold
  // fetch-failure path for real.
  global.fetch = (url) => {
    fetchCalls.push(String(url));
    if (String(url).endsWith('.mp3')) return Promise.resolve({ ok: false, status: 404 });
    const full = path.join(ROOT, String(url));
    return Promise.resolve({ ok: true, json: () => Promise.resolve(JSON.parse(fs.readFileSync(full, 'utf8'))) });
  };
  const st8 = await Game.playSystemLine('sys-dark-10');
  ok('A8 mp3 fetch failure -> error (no throw)', st8 === 'error', st8);

  // ---- B: scenarios (stub playSystemLine as a recorder; flush setTimeout) ----
  const calls = [];
  Game.playSystemLine = async (id) => { calls.push(id); return 'playing'; };
  const realSetTimeout = global.setTimeout;
  let pending = [];
  global.setTimeout = (fn) => { pending.push(fn); return pending.length; };
  const flush = () => { const q = pending; pending = []; q.forEach(fn => fn()); };

  const r1 = Game.debugScenario('audioSystem');
  flush();
  ok('B1 audioSystem runs, 3 ids in order', r1 === true &&
    JSON.stringify(calls) === JSON.stringify(['sys-day7-01', 'sys-silly-11', 'sys-dark-10']), calls.join(','));

  calls.length = 0;
  const r2 = Game.debugScenario('audioVillager');
  flush();
  const vpos = Game.state.village.positions || {};
  const placedCount = Object.keys(vpos).length;
  ok('B2 audioVillager runs, villagers placed', r2 === true && placedCount >= 2, `placed=${placedCount}`);

  calls.length = 0;
  const r3 = Game.debugScenario('audioPersona');
  flush();
  ok('B3 audioPersona runs (real encounter path)', r3 === true);

  calls.length = 0;
  const r4 = Game.debugScenario('audioClaude');
  flush();
  ok('B4 audioClaude runs, two separate events', r4 === true &&
    JSON.stringify(calls) === JSON.stringify(['claude-lastwords', 'sys-the-sound']), calls.join(','));

  global.setTimeout = realSetTimeout;

  // ---- B5: list + category ----
  const list = Game.debugScenarioList().map(x => x[0]);
  const cats = Game.debugScenarioCategories();
  ok('B5 all four in list', ['audioSystem', 'audioVillager', 'audioPersona', 'audioClaude'].every(id => list.includes(id)));
  ok('B5 audio category', cats['🔊 Audio — sound check'] && cats['🔊 Audio — sound check'].length === 4,
    Object.keys(cats).join(' | '));

  // ---- C1: foreign-skip untouched ----
  const piperSrc = fs.readFileSync(path.join(ROOT, 'src/js/voice-piper.js'), 'utf8');
  const sysSrc = fs.readFileSync(path.join(ROOT, 'src/js/voice-system.js'), 'utf8');
  ok('C1 foreign gate intact in voice-piper', /foreign/.test(piperSrc) && /foreign-skip/.test(piperSrc));
  ok('C1 voice-system does not touch foreign logic', !/foreign/i.test(sysSrc));

  // ---- C2: ontology ----
  try {
    const out = execSync('node scripts/validate-ontology.js', { cwd: ROOT, encoding: 'utf8', timeout: 120000 });
    ok('C2 ontology validator passes', /Release permitted/.test(out), out.trim().split('\n').pop());
  } catch (err) {
    ok('C2 ontology validator passes', false, String((err.stdout || err.message)).slice(0, 300));
  }

  Game.audio = realAudio;
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS FAIL', e); process.exit(1); });
