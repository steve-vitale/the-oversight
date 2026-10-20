// @ontology
// system: voice-piper
// description: Spoken villager dialogue via Piper TTS (open-source neural TTS, MIT voices). Piper runs in-browser through @mintplex-labs/piper-tts-web (ONNX Runtime Web + espeak-ng WASM); voice models are lazy-loaded packs cached in Origin Private File System, never in the base bundle. Each generated villager gets a deterministic voice profile from their person record (sex/age/temperament + id hash) so the same villager always sounds like themselves. Web Speech API is the fallback when packs aren't cached yet. Playback routes through the existing Game.audio graph (one unlock flow, one mute). Foreign-language lines are never voiced ("if you don't know, it doesn't show").
// provides:
//   - Game.VOICE_PACKS
//   - Game.voiceProfileFor(person)
//   - Game.voiceEnabled()
//   - Game.setVoiceEnabled(b)
//   - Game.voicePackStatus()
//   - Game.ensureVoicePack(packId, onProgress)
//   - Game.ensureVoicePacks(onProgress)
//   - Game.refreshVoiceCache()
//   - Game.voiceVerifyIds()
//   - Game.convoSpeakLine(vid, text, opts)
//   - Game.voiceStop()
//   - Game.voiceCleanText(text)
// rules:
//   - Never auto-play before a user gesture (code: Game._voiceUnlocked flips on first pointerdown/keydown; convoSpeakLine returns 'locked' before).
//   - Mute silences voice like every other audio (code: convoSpeakLine checks Game.audio.isMuted(); playVoice routes through the master gain).
//   - Voice packs are lazy: per-speaker, on demand, cached in OPFS; the base PWA never ships them (code: ensureVoicePack + voicePackStatus; index.html ships no model files).
//   - The 'system' voice is a reserved seam, never synthesized here (code: Game.SYSTEM_VOICE_SEAM; ElevenLabs build-time asset, Claptrap-like per Steve 2026-10-11).
//   - voiceProfileFor is pure and deterministic: same person record -> identical profile, no audio needed (code: hashStr of id+name; no Math.random, no I/O).
(function () {
  'use strict';
  const Game = (typeof globalThis !== 'undefined' && globalThis.Scattering || {}).Game || {};
  // (module attach pattern: game.js publishes globalThis.Scattering.Game;
  // satellite modules bind it locally — bare `Game` is block-scoped in
  // game.js and invisible here.)

  // ---- Pack registry -------------------------------------------------------
  // Voice IDs are rhasspy/piper-voices en_US IDs (MIT). Verified against the
  // piper-voices repo layout; Game.voiceVerifyIds() double-checks them against
  // the piper-tts-web voice catalog on the actual device.
  // approxMB: medium-quality .onnx is ~60MB; packs lazy-load so this never
  // touches the base bundle.
  var VOICE_PACKS = {
    'm-young': { voiceId: 'en_US-ryan-medium',     label: 'young man',   sex: 'm', ageBand: 'young', approxMB: 63 },
    'm-old':   { voiceId: 'en_US-lessac-medium',   label: 'older man',   sex: 'm', ageBand: 'old',   approxMB: 63 },
    'f-young': { voiceId: 'en_US-amy-medium',      label: 'young woman', sex: 'f', ageBand: 'young', approxMB: 63 },
    'f-old':   { voiceId: 'en_US-kristin-medium',  label: 'older woman', sex: 'f', ageBand: 'old',   approxMB: 63 },
  };
  // SYSTEM VOICE SEAM (Steve 2026-10-11): the System gets a FIXED signature
  // voice generated at build time via ElevenLabs — Claptrap-like, more
  // unhinged/unstable — shipped as static audio. This slot is reserved here so
  // the dialogue layer has exactly one place to route System lines when the
  // asset lands. Never run through Piper, never synthesized at runtime.
  // COST RULE (Steve 2026-10-11): curate and approve ALL System lines for
  // quality/funniness BEFORE generating — never regenerate paid lines.
  var SYSTEM_VOICE_SEAM = {
    kind: 'elevenlabs-build-asset', status: 'pending',
    direction: 'claptrap-like, more unhinged/unstable',
  };
  Game.VOICE_PACKS = VOICE_PACKS;
  Game.SYSTEM_VOICE_SEAM = SYSTEM_VOICE_SEAM;

  // piper-tts-web: ES-module only, frontend only. Pinned; loaded lazily via
  // dynamic import so the base bundle never pays for it. If the import fails
  // (offline, CDN hiccup) every path falls back to Web Speech API.
  // FOLLOW-UP (not this prototype): vendor the ort + espeak-ng WASM runtime
  // locally so synthesis works fully offline; the lib supports local WASM
  // paths. Voice MODELS already cache in OPFS after first download.
  var PIPER_TTS_URL = 'https://esm.sh/@mintplex-labs/piper-tts-web@1.0.4';

  // ---- Pure helpers ---------------------------------------------------------
  function hashStr(s) {
    var h = 2166136261 >>> 0;
    s = String(s);
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
  function lsGet(k) { try { return (typeof localStorage !== 'undefined') ? localStorage.getItem(k) : null; } catch (e) { return null; } }
  function lsSet(k, v) { try { if (typeof localStorage !== 'undefined') localStorage.setItem(k, v); } catch (e) {} }

  // voiceProfileFor(person): deterministic voice identity from the person
  // record. Class = sex x ageBand (<35 young, else old); pitch/rate = small
  // identity jitter from an id+name hash plus temperament nudges. Pure:
  // no audio, no network, no Math.random — safe to call anywhere, trivially
  // unit-testable.
  function voiceProfileFor(person) {
    var p = person || {};
    var gender = p.gender;
    if (gender !== 'm' && gender !== 'f') {
      gender = p.pro === 'she' ? 'f' : (p.pro === 'he' ? 'm' : null);
    }
    var age = (typeof p.age === 'number' && isFinite(p.age)) ? p.age : 30;
    var temper = String(((p.personality || {}).temperament) || 'steady').toLowerCase();
    var h = hashStr(String(p.id == null ? '' : p.id) + '|' + String(p.name || ''));
    var sexClass = gender === 'f' ? 'f' : (gender === 'm' ? 'm' : ((h & 1) ? 'f' : 'm'));
    var ageBand = age < 35 ? 'young' : 'old';
    var packId = sexClass + '-' + ageBand;
    var pack = VOICE_PACKS[packId] || VOICE_PACKS['m-young'];
    var pitch = 1 + (((h % 1000) / 1000) - 0.5) * 0.10 + (ageBand === 'old' ? -0.03 : 0.02);
    var rate = 1 + ((((h >>> 7) % 1000) / 1000) - 0.5) * 0.12;
    if (['intense', 'restless', 'fidgety', 'mischievous'].indexOf(temper) !== -1) rate += 0.05;
    else if (['gentle', 'stoic', 'withdrawn', 'laconic'].indexOf(temper) !== -1) rate -= 0.04;
    return {
      packId: packId,
      voiceId: pack.voiceId,
      pitch: Math.round(clamp(pitch, 0.90, 1.12) * 100) / 100,
      rate: Math.round(clamp(rate, 0.88, 1.15) * 100) / 100,
      ageBand: ageBand,
      sexClass: sexClass,
    };
  }
  Game.voiceProfileFor = voiceProfileFor;

  // voiceCleanText: what the TTS engine may hear. Emoji and markdown never
  // reach the voice; beats are already short, but cap defensively.
  function voiceCleanText(text, speechOnly) {
    var t = String(text == null ? '' : text);
    // Narration stays on screen. Both voice backends get only complete
    // quoted speech, through the same boundary.
    if (speechOnly) {
      var spans = [], quote;
      var quoted = /"([^"]+)"|“([^”]+)”/g;
      while ((quote = quoted.exec(t))) spans.push(quote[1] || quote[2]);
      t = spans.join(' ');
    }
    try { t = t.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/gu, ''); }
    catch (e) { t = t.replace(/[^\u0000-\uFFFF]/g, ''); }
    t = t.replace(/[*_~`#]/g, '').replace(/\s+/g, ' ').trim();
    if (t.length > 400) t = t.slice(0, 397) + '…';
    return t;
  }
  Game.voiceCleanText = voiceCleanText;

  // ---- Settings --------------------------------------------------------------
  var LS_KEY = 'oversight_voice';
  Game._voicePacksCached = false;
  Game._voiceUnlocked = false;

  function voiceEnabled() {
    var v = lsGet(LS_KEY);
    if (v === '1') return true;
    if (v === '0') return false;
    // Unset: on once packs are cached, off before. Never surprises the
    // player with a download they didn't ask for.
    return !!Game._voicePacksCached;
  }
  function setVoiceEnabled(b) {
    lsSet(LS_KEY, b ? '1' : '0');
    if (!b) { try { Game.voiceStop(); } catch (e) {} }
    // Enabling does NOT bulk-download: packs lazy-load per speaker on first
    // use (tens of MB each). The toggle in settings can offer a manual
    // "download all voices" via Game.ensureVoicePacks().
    try { paintVoiceToggle(); } catch (e) {}
    return !!b;
  }
  Game.voiceEnabled = voiceEnabled;
  Game.setVoiceEnabled = setVoiceEnabled;

  // Gesture unlock: iOS Safari will not play audio before a user gesture.
  // One-way latch, same posture as the Web Audio unlock ("iOS unlock rides
  // first gesture"). Never auto-play before this flips.
  function unlockVoice() { Game._voiceUnlocked = true; }
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('pointerdown', unlockVoice);
    window.addEventListener('keydown', unlockVoice);
  }

  // ---- Piper loader + pack bookkeeping ----------------------------------------
  var _ttsPromise = null;
  var _cachedIds = [];   // voiceIds in OPFS (refreshed by refreshVoiceCache)
  var _dlState = {};     // packId -> {status, loaded, total} while downloading

  function loadTts() {
    if (Game._voiceTts) return Promise.resolve(Game._voiceTts); // test seam
    // Real-browser check: the node sim harness evals with window=global but
    // no document — never attempt a network import there.
    if (typeof window === 'undefined' || typeof window.document === 'undefined') {
      return Promise.reject(new Error('no browser'));
    }
    if (!_ttsPromise) {
      _ttsPromise = import(PIPER_TTS_URL).catch(function (e) { _ttsPromise = null; throw e; });
    }
    return _ttsPromise;
  }

  function refreshVoiceCache() {
    return loadTts().then(function (tts) { return tts.stored(); }).then(function (stored) {
      _cachedIds = stored || [];
      var any = Object.keys(VOICE_PACKS).some(function (pid) {
        return _cachedIds.indexOf(VOICE_PACKS[pid].voiceId) !== -1;
      });
      Game._voicePacksCached = any;
      try { paintVoiceToggle(); } catch (e) {}
      return _cachedIds;
    }).catch(function () { return []; });
  }
  function voicePackStatus() {
    var out = {};
    Object.keys(VOICE_PACKS).forEach(function (pid) {
      out[pid] = _dlState[pid] ? 'downloading'
        : (_cachedIds.indexOf(VOICE_PACKS[pid].voiceId) !== -1 ? 'cached' : 'missing');
    });
    return out;
  }
  function ensureVoicePack(packId, onProgress) {
    var pack = VOICE_PACKS[packId];
    if (!pack) return Promise.reject(new Error('unknown voice pack: ' + packId));
    return loadTts().then(function (tts) {
      _dlState[packId] = { status: 'downloading', loaded: 0, total: 0 };
      var done = function (fn) { return function () { delete _dlState[packId]; return fn.apply(null, arguments); }; };
      return tts.download(pack.voiceId, function (p) {
        _dlState[packId] = { status: 'downloading', loaded: (p && p.loaded) || 0, total: (p && p.total) || 0 };
        if (onProgress) { try { onProgress(packId, p); } catch (e) {} }
      }).then(done(function () { return refreshVoiceCache(); }), done(function (e) { throw e; }));
    });
  }
  function ensureVoicePacks(onProgress) {
    var chain = Promise.resolve();
    Object.keys(VOICE_PACKS).forEach(function (pid) {
      chain = chain.then(function () { return ensureVoicePack(pid, onProgress); });
    });
    return chain;
  }
  // voiceVerifyIds: compare the registry against the library's live catalog.
  // Run on-device (needs the lib loaded); reports mismatches instead of
  // silently falling back forever.
  function voiceVerifyIds() {
    return loadTts().then(function (tts) {
      if (typeof tts.voices !== 'function') return { ok: false, reason: 'no voices() catalog' };
      return tts.voices().then(function (list) {
        var keys = {};
        (list || []).forEach(function (v) {
          var k = (v && v.key) || v;
          if (k) keys[String(k)] = true;
        });
        var missing = [];
        Object.keys(VOICE_PACKS).forEach(function (pid) {
          if (!keys[VOICE_PACKS[pid].voiceId]) missing.push(pid + ':' + VOICE_PACKS[pid].voiceId);
        });
        return { ok: missing.length === 0, missing: missing };
      });
    });
  }
  Game.voicePackStatus = voicePackStatus;
  Game.ensureVoicePack = ensureVoicePack;
  Game.ensureVoicePacks = ensureVoicePacks;
  Game.refreshVoiceCache = refreshVoiceCache;
  Game.voiceVerifyIds = voiceVerifyIds;

  // ---- Speech ------------------------------------------------------------------
  var _piperSeq = 0; // supersede token: a new line cancels in-flight synthesis

  function pickDeviceVoice(sexClass) {
    try {
      if (typeof speechSynthesis === 'undefined') return null;
      var vs = speechSynthesis.getVoices() || [];
      if (!vs.length) return null;
      var en = vs.filter(function (v) { return /^en/i.test(v.lang || ''); });
      var pool = en.length ? en : vs;
      var want = sexClass === 'f' ? /female|samantha|zira|karen|moira|tessa|jenny/i
                                  : /male|daniel|david|alex|fred|aaron|guy/i;
      for (var i = 0; i < pool.length; i++) { if (want.test(pool[i].name || '')) return pool[i]; }
      return pool[0] || null;
    } catch (e) { return null; }
  }

  function speakFallback(text, profile) {
    try {
      if (typeof speechSynthesis === 'undefined' || typeof SpeechSynthesisUtterance === 'undefined') return 'no-synth';
      try { speechSynthesis.cancel(); } catch (e) {}
      var u = new SpeechSynthesisUtterance(text);
      var v = pickDeviceVoice(profile.sexClass);
      if (v) u.voice = v;
      u.pitch = profile.pitch;
      u.rate = profile.rate;
      speechSynthesis.speak(u);
      return 'fallback';
    } catch (e) { return 'error'; }
  }

  function speakPiper(text, profile) {
    var mySeq = ++_piperSeq;
    loadTts().then(function (tts) {
      if (mySeq !== _piperSeq) return 'superseded';
      // piper-tts-web predict: {text, voiceId} -> WAV blob. Pitch/rate ride
      // on playback (Game.audio.playVoice), since the predict API exposes
      // no prosody knobs — the 4 class models carry the voice identity.
      return tts.predict({ text: text, voiceId: profile.voiceId });
    }).then(function (wav) {
      if (mySeq !== _piperSeq || !wav) return;
      if (Game.audio && typeof Game.audio.playVoice === 'function') {
        Game.audio.playVoice(wav, { pitch: profile.pitch });
      } else if (typeof Audio !== 'undefined') {
        // No game audio graph (shouldn't happen in-app): best effort.
        try { var a = new Audio(URL.createObjectURL(wav)); a.playbackRate = profile.pitch; a.play(); } catch (e) {}
      }
    }).catch(function () {
      if (mySeq === _piperSeq) speakFallback(text, profile);
    });
  }

  function voiceStop() {
    _piperSeq++; // orphan in-flight synthesis
    try { if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel(); } catch (e) {}
    try { if (Game.audio && typeof Game.audio.stopVoice === 'function') Game.audio.stopVoice(); } catch (e) {}
  }
  Game.voiceStop = voiceStop;

  // convoSpeakLine(vid, text, opts): THE hook — called from sayLine() for
  // every NPC beat pushed to the dialogue transcript. Synchronous gate
  // checks return a status string (unit-testable); actual speech is
  // fire-and-forget. Statuses: off | muted | locked | empty | foreign-skip |
  // speaking-piper | speaking-fallback | error.
  function convoSpeakLine(vid, text, opts) {
    try {
      // apSpeak supplies an explicitly spoken persona line, already rendered
      // inside quotes by its call sites. NPC transcript text mixes narration.
      var t = voiceCleanText(text, !(opts && opts.persona));
      if (!t) return 'empty';
      if (!voiceEnabled()) return 'off';
      if (Game.audio && Game.audio.isMuted && Game.audio.isMuted()) return 'muted';
      if (!Game._voiceUnlocked) return 'locked';
      if (opts && opts.foreign) return 'foreign-skip';
      var person = (opts && opts.persona) || ((typeof Game.vpOf === 'function') ? Game.vpOf(vid) : {});
      var profile = voiceProfileFor(person);
      var pack = VOICE_PACKS[profile.packId];
      if (_cachedIds.indexOf(pack.voiceId) !== -1) {
        speakPiper(t, profile);
        return 'speaking-piper';
      }
      // Pack not cached: fetch this speaker's pack in the background for
      // next time, talk now through the device voice.
      ensureVoicePack(profile.packId).catch(function () {});
      speakFallback(t, profile);
      return 'speaking-fallback';
    } catch (e) { return 'error'; }
  }
  Game.convoSpeakLine = convoSpeakLine;

  // ---- Settings toggle paint (app.js owns the DOM; this is the painter) --------
  function paintVoiceToggle() {
    try {
      if (typeof document === 'undefined') return;
      var el = document.getElementById('b-voice');
      if (!el) return;
      var on = voiceEnabled();
      el.textContent = '🗣️';
      el.style.opacity = on ? '0.9' : '0.25';
      var st = voicePackStatus();
      var n = Object.keys(st).filter(function (k) { return st[k] === 'cached'; }).length;
      el.title = on ? ('voiced dialogue on (' + n + '/4 voice packs cached)') : 'voiced dialogue off — tap to enable';
    } catch (e) {}
  }
  Game.paintVoiceToggle = paintVoiceToggle;

  // Boot probe: learn which packs are already in OPFS (silent, async).
  // Real browsers only — the node sim harness evals with window=global and
  // no document, and must never attempt a network import at load.
  if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
    try { refreshVoiceCache().catch(function () {}); } catch (e) {}
  }
})();
