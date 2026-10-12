// test-system-voice-wiring-20261012.js — System voice pipe proof.
// BEFORE: Game.playSystemLine existed but had ZERO non-debug call sites —
// the 203 ElevenLabs MP3s were a dead pipe. AFTER: sysSay() resolves the
// exact line text to a manifest id and fires playSystemLine fire-and-forget.
//
// NOTE: sim-harness stubs G.sysSay/G.say to no-ops for sims, so this test
// re-evals game.js + voice-system.js afterwards to get the REAL methods.
//
// GREEN: sysSay(manifestText) -> playSystemLine(id) once, text still shown;
// unknown text -> silent, text shown; real playSystemLine -> 'playing'.
// RED: sysSay with no voice infra attached -> no throw, no voice (dead pipe).
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const { loadGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL:', name); }
}

(async () => {
  const manifestRaw = fs.readFileSync(path.join(ROOT, 'src/audio/system/manifest.json'), 'utf8');
  const manifest = JSON.parse(manifestRaw);
  ok(Array.isArray(manifest) && manifest.length > 100, 'manifest loads (' + manifest.length + ' entries)');
  const entry = manifest.find(e => e && e.id && e.text && e.kind === 'inventory') || manifest[0];

  // Seed the harness env (RNG, module order) — then re-eval the two modules
  // under test to recover the REAL sysSay (harness stubs it silent).
  await loadGame({ seed: 777, mode: 'sysvoice-proof', fullTelemetry: false });

  // fetch stub AFTER loadGame (the harness installs its own): manifest from
  // disk, fake bytes for mp3s.
  global.fetch = async (url) => {
    const u = String(url);
    if (u.indexOf('manifest.json') !== -1)
      return new Response(manifestRaw, { headers: { 'content-type': 'application/json' } });
    return new Response(Buffer.alloc(16));
  };

  eval(fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8'));
  eval(fs.readFileSync(path.join(ROOT, 'src/js/voice-system.js'), 'utf8'));
  const G = globalThis.Scattering.Game;
  ok(typeof G.sysSay === 'function', 'real sysSay recovered');
  ok(typeof G.systemVoiceIdFor === 'function', 'systemVoiceIdFor attached');
  ok(typeof G.playSystemLine === 'function', 'playSystemLine attached');

  // warm the text index
  await G.systemAudioManifest();
  ok(G.systemVoiceIdFor(entry.text) === entry.id, 'exact text -> manifest id');
  ok(G.systemVoiceIdFor('no such line anywhere') === null, 'unknown text -> null');

  // --- RED: dead pipe. sysSay with no voice infra: silent, safe, text shown.
  const redSaid = [], redPlayed = [];
  const redCtx = { state: { systemArrived: true }, say(t) { redSaid.push(String(t)); } };
  let threw = false;
  try { G.sysSay.call(redCtx, entry.text); } catch (e) { threw = true; }
  ok(!threw, 'RED: sysSay does not throw without voice infra');
  ok(redPlayed.length === 0, 'RED: no voice without wiring (dead pipe reproduced)');
  ok(redSaid.some(t => t.indexOf(entry.text.slice(0, 30)) !== -1), 'RED: text shown without wiring');

  // --- GREEN: wired context.
  const said = [], playedIds = [];
  const ctx = {
    state: { systemArrived: true },
    say(t) { said.push(String(t)); },
    systemVoiceIdFor: G.systemVoiceIdFor,
    playSystemLine: async function (id) { playedIds.push(id); return 'playing'; },
  };
  G.sysSay.call(ctx, entry.text);
  ok(playedIds.length === 1 && playedIds[0] === entry.id,
    'GREEN: sysSay(known line) -> playSystemLine(' + entry.id + ')');
  ok(said.some(t => t.indexOf('📺 SYSTEM:') !== -1 && t.indexOf(entry.text.slice(0, 30)) !== -1),
    'GREEN: text still shown for known line');

  G.sysSay.call(ctx, 'a line with no mp3 twin whatsoever');
  ok(playedIds.length === 1, 'GREEN: unknown line stays silent');
  ok(said.some(t => t.indexOf('a line with no mp3 twin') !== -1), 'GREEN: unknown line text shown');

  // pre-System: sysSay says nothing at all (unchanged behavior)
  const preSaid = [];
  const preCtx = {
    state: { systemArrived: false }, say(t) { preSaid.push(String(t)); },
    systemVoiceIdFor: G.systemVoiceIdFor,
    playSystemLine: async function (id) { playedIds.push(id); return 'playing'; },
  };
  G.sysSay.call(preCtx, entry.text);
  ok(preSaid.length === 0 && playedIds.length === 1, 'GREEN: pre-System sysSay silent (unchanged)');

  // --- real playSystemLine end-to-end (fetch stub serves fake mp3 bytes)
  G._voiceUnlocked = true;
  const blobs = [];
  G.audio = { isMuted: () => false, playVoice: async (b) => { blobs.push(b); return true; } };
  const status = await G.playSystemLine(entry.id);
  ok(status === 'playing', 'real playSystemLine -> playing (got ' + status + ')');
  ok(blobs.length === 1, 'real playSystemLine fetched the mp3 blob');
  ok(await G.playSystemLine('no-such-id') === 'unknown', 'unknown id -> unknown, no throw');

  console.log(pass + '/' + (pass + fail) + ' green');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
