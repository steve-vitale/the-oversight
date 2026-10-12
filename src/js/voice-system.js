// @ontology
// system: voice-system
// description: Fixed System narrator voice lines (ElevenLabs, pre-generated MP3s in src/audio/system/). Game.playSystemLine(id) fetches the MP3 as a blob and plays it through the EXISTING Game.audio graph — same bus, same mute, same gesture unlock as Piper voice. Manifest fetched once and cached; audio blobs cached per id.
// provides:
//   - Game.playSystemLine(id)
//   - Game.systemLineEntry(id)
//   - Game.systemLineIds()
//   - Game.systemAudioManifest()
// rules:
//   - Never auto-play before a user gesture (code: Game._voiceUnlocked gate, same one-way latch as voice-piper).
//   - Mute silences System lines like every other audio (code: Game.audio.isMuted() gate; playVoice routes through the master gain).
//   - Unknown id warns and no-ops, never throws (code: playSystemLine 'unknown').
//   - New lines supersede: playVoice never queues speech behind speech, so callers stagger multi-line sequences themselves (code: app.js playVoice).
// consumes:
//   - Game.audio.playVoice(blob)
//   - Game.audio.isMuted()
//   - Game._voiceUnlocked
(function () {
  'use strict';
  // (module attach pattern: game.js publishes globalThis.Scattering.Game;
  // same as voice-piper.js — bare `Game` is in TDZ across eval'd modules.)
  const Game = (typeof globalThis !== 'undefined' && globalThis.Scattering || {}).Game || {};
  // SYSTEM VOICE (Steve 2026-10-11): fixed ElevenLabs lines for the System
  // narrator. Procedural villager/persona speech lives in voice-piper.js;
  // THIS module is the fixed-asset player. Nothing else in the game reads
  // src/audio/system yet — this is the first (and so far only) hook.
  var MANIFEST_URL = 'src/audio/system/manifest.json';
  var _manifest = null;
  var _manifestPromise = null;
  var _blobCache = {}; // id -> Blob, so replays never re-fetch

  function loadManifest() {
    if (_manifest) return Promise.resolve(_manifest);
    if (_manifestPromise) return _manifestPromise;
    _manifestPromise = fetch(MANIFEST_URL).then(function (r) {
      if (!r.ok) throw new Error('system voice manifest HTTP ' + r.status);
      return r.json();
    }).then(function (m) {
      _manifest = Array.isArray(m) ? m : [];
      buildTextIndex();
      return _manifest;
    }).catch(function (e) {
      _manifestPromise = null; // let a later call retry
      throw e;
    });
    return _manifestPromise;
  }

  // Exact game-text -> manifest id index. Built once the manifest loads.
  // Only exact matches ever voice: templated lines (names/numbers baked in
  // at runtime) have no twin and stay text-only, by design.
  var _textToId = null;
  function buildTextIndex() {
    var map = {};
    for (var i = 0; i < _manifest.length; i++) {
      var e = _manifest[i];
      if (e && e.id && e.text) map[e.text] = e.id;
    }
    _textToId = map;
  }

  function entryFor(id) {
    if (!_manifest) return null;
    for (var i = 0; i < _manifest.length; i++) {
      if (_manifest[i] && _manifest[i].id === id) return _manifest[i];
    }
    return null;
  }

  // playSystemLine(id): statuses 'muted' | 'locked' | 'no-audio' |
  // 'unknown' | 'error' | 'playing'. Fire-and-forget like convoSpeakLine;
  // the returned promise resolves to the status for tests and debug tools.
  async function playSystemLine(id) {
    try {
      if (Game.audio && typeof Game.audio.isMuted === 'function' && Game.audio.isMuted()) return 'muted';
      if (!Game._voiceUnlocked) return 'locked';
      if (!Game.audio || typeof Game.audio.playVoice !== 'function') return 'no-audio';
      var entry = entryFor(id);
      if (!entry) {
        try { await loadManifest(); } catch (e) { return 'error'; }
        entry = entryFor(id);
      }
      if (!entry || !entry.file) {
        try { console.warn('[voice-system] unknown system line: ' + id); } catch (e) {}
        return 'unknown';
      }
      var blob = _blobCache[id];
      if (!blob) {
        var resp = await fetch(entry.file);
        if (!resp.ok) return 'error';
        blob = await resp.blob();
        _blobCache[id] = blob;
      }
      var ok = await Game.audio.playVoice(blob);
      return ok ? 'playing' : 'error';
    } catch (e) {
      return 'error';
    }
  }

  Game.playSystemLine = playSystemLine;
  Game.systemLineEntry = function (id) { return entryFor(id); };
  Game.systemLineIds = function () {
    return (_manifest || []).map(function (e) { return e.id; });
  };
  Game.systemAudioManifest = loadManifest;
  // systemVoiceIdFor(text): exact game text -> manifest id, or null. Kicks
  // the manifest/index build on first call; returns null until it's ready.
  // Callers never block: the text always shows, the voice catches up.
  Game.systemVoiceIdFor = function (text) {
    if (!_manifest) loadManifest().catch(function () {});
    if (!_textToId || !text) return null;
    return _textToId[text] || null;
  };
  // preloadSystemVoice(): start the manifest fetch early (newGame) so the
  // text index is warm before the System's first line. Safe to call twice.
  Game.preloadSystemVoice = function () {
    loadManifest().catch(function () {});
  };
})();
