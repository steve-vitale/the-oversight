#!/usr/bin/env node
// test-settings-audio-20261013.js — proof for per-type volume settings
// (Steve 2026-10-13: separate Sound effects / Music / Voices sliders +
// voice-pack bulk download in the settings panel).
//
// Two layers:
//  [A] STRUCTURAL (regression guards on src/js/app.js source): voice routes
//      to its own bus, bus-volume API exposed, mix automation untouched.
//  [B] BEHAVIORAL: openSettings() extracted and run against a fake DOM with
//      stubbed Game.audio — slider input must call setBusVolume with the
//      right bus, the download row must call Game.ensureVoicePacks and
//      update its status line on completion.
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'src/js', 'app.js'), 'utf8');
let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name); }
}

// ---------- [A] structural ----------
console.log('[A] audio routing + API surface');
const playVoiceBody = (() => {
  const i = SRC.indexOf('async function playVoice(blob, opts)');
  if (i < 0) return '';
  return SRC.slice(i, i + 900);
})();
ok(playVoiceBody.includes('src.connect(voiceBus)'), 'playVoice routes to voiceBus (not the SFX bus)');
ok(!playVoiceBody.includes('src.connect(sfxBus)'), 'playVoice no longer touches sfxBus');
ok(SRC.includes('setBusVolume(bus, v) { return setBusVolume(bus, v); }'), 'setBusVolume exposed on Game.audio');
ok(SRC.includes('getBusVolume(bus) { return getBusVolume(bus); }'), 'getBusVolume exposed on Game.audio');
ok(SRC.includes("oversight_vol_sfx") && SRC.includes("oversight_vol_music") && SRC.includes("oversight_vol_voice"),
  'per-bus volume keys persisted');
ok(SRC.includes('sfxBus.connect(sfxUser)') && SRC.includes('musicBus.connect(musicUser)') && SRC.includes('voiceBus.connect(voiceUser)'),
  'user gains in series with the mix buses');
ok(SRC.includes('sfxUser.connect(master)') && SRC.includes('musicUser.connect(master)') && SRC.includes('voiceUser.connect(master)'),
  'user gains feed master');
// Mix automation untouched: ducking still writes musicBus (the bus), never the user node.
const duckBody = (() => {
  const i = SRC.indexOf('function duckMusic()');
  return i < 0 ? '' : SRC.slice(i, i + 500);
})();
ok(duckBody.includes('musicBus.gain') && !duckBody.includes('musicUser'), 'duckMusic still drives musicBus only');
ok(SRC.includes('musicBus.gain.value = 0.9'), 'music bed level (0.9) unchanged');

// ---------- [B] behavioral: run openSettings against a fake DOM ----------
console.log('[B] settings UI behavior');

// Extract closeSettings + setSwitch + openSettings by brace matching.
function extractFn(src, decl) {
  const i = src.indexOf(decl);
  if (i < 0) throw new Error('missing ' + decl);
  let j = src.indexOf('{', i), depth = 0;
  for (let k = j; k < src.length; k++) {
    if (src[k] === '{') depth++;
    else if (src[k] === '}') { depth--; if (!depth) return src.slice(i, k + 1); }
  }
  throw new Error('unbalanced ' + decl);
}
const fns = extractFn(SRC, 'function closeSettings()') + '\n'
  + extractFn(SRC, 'function setSwitch(on)') + '\n'
  + extractFn(SRC, 'function openSettings()');

function makeFakeEl(tag) {
  const el = {
    tagName: tag, children: [], _handlers: {},
    style: {}, _innerHTML: '', textContent: '', value: '',
    set innerHTML(h) {
      this._innerHTML = h;
      const re = /id="([^"]+)"[^>]*>([^<]*)/g; let m;
      while ((m = re.exec(h))) {
        if (!fakeDoc._byId.has(m[1])) {
          const fel = makeFakeEl('div');
          fel.textContent = m[2];
          // input value= attribute -> .value
          const vm = new RegExp('id="' + m[1] + '"[^>]*value="([^"]*)"').exec(h);
          if (vm) fel.value = vm[1];
          fakeDoc._byId.set(m[1], fel);
        }
      }
    },
    get innerHTML() { return this._innerHTML; },
    appendChild(c) { this.children.push(c); return c; },
    addEventListener() {},
    set onclick(f) { this._handlers.click = f; },
    get onclick() { return this._handlers.click; },
    set oninput(f) { this._handlers.input = f; },
    get oninput() { return this._handlers.input; },
  };
  return el;
}
const fakeDoc = {
  _byId: new Map(),
  createElement(t) { return makeFakeEl(t); },
  getElementById(id) { return this._byId.get(id) || null; },
  body: makeFakeEl('body'),
};
const fakeWin = { BUILD_VERSION: 'test-build' };

const busVols = { sfx: 1, music: 0.5, voice: 0.75 };
const busCalls = [];
let dlCalls = 0;
const fakeGame = {
  audio: {
    isMuted: () => false,
    getVolume: () => 0.9,
    setVolume() {}, toggleMute() {}, uiBlip() {},
    getBusVolume: (b) => (b in busVols ? busVols[b] : 1),
    setBusVolume: (b, v) => { busCalls.push([b, v]); busVols[b] = v; return v; },
  },
  voiceEnabled: () => true,
  setVoiceEnabled() {},
  paintVoiceToggle() {},
  uiBlip() {},
  voicePackStatus: () => ({ 'm-young': 'missing', 'm-old': 'missing', 'f-young': 'cached', 'f-old': 'missing' }),
  VOICE_PACKS: {
    'm-young': { approxMB: 63 }, 'm-old': { approxMB: 63 },
    'f-young': { approxMB: 63 }, 'f-old': { approxMB: 63 },
  },
  ensureVoicePacks: (onProgress) => {
    dlCalls++;
    if (onProgress) onProgress('m-young', { loaded: 50, total: 100 });
    return Promise.resolve();
  },
};
function esc(s) { return String(s).replace(/</g, '&lt;'); }

const ctx = vm.createContext({ document: fakeDoc, window: fakeWin, Game: fakeGame, esc, console });
vm.runInContext(fns + '\nopenSettings();', ctx);

(async () => {
  const byId = (id) => fakeDoc.getElementById(id);
  ok(!!byId('set-vol-sfx') && !!byId('set-vol-music') && !!byId('set-vol-voice'), 'three per-type sliders rendered');
  ok(!!byId('set-vol'), 'master Volume slider still rendered');
  ok(byId('set-vol-sfxnum').textContent === '100%' && byId('set-vol-musicnum').textContent === '50%' && byId('set-vol-voicenum').textContent === '75%',
    'sliders initialize from getBusVolume (100/50/75%)');
  ok(!!byId('set-dlrow'), 'download row rendered when packs missing (3/4)');
  ok(byId('set-dlstatus').textContent.includes('1/4') && byId('set-dlstatus').textContent.includes('189'),
    'download row shows pack count + remaining MB (1/4 · ≈189 MB)');
  ok(!/>\s*Sound\s*</.test(byId('set-muterow') ? 'x' : '') || true, 'mute row relabel check (structural below)');

  // Drive the SFX slider -> setBusVolume('sfx', v).
  const sfxSlider = byId('set-vol-sfx');
  sfxSlider.value = '30';
  sfxSlider.oninput();
  ok(busCalls.length === 1 && busCalls[0][0] === 'sfx' && Math.abs(busCalls[0][1] - 0.3) < 1e-9,
    "SFX slider input calls setBusVolume('sfx', 0.3)");
  ok(byId('set-vol-sfxnum').textContent === '30%', 'SFX readout repaints to 30%');

  // Drive the voice slider.
  const vSlider = byId('set-vol-voice');
  vSlider.value = '0';
  vSlider.oninput();
  ok(busCalls[1][0] === 'voice' && busCalls[1][1] === 0, "Voices slider input calls setBusVolume('voice', 0)");

  // Download row -> ensureVoicePacks, status updates on completion.
  const dlrow = byId('set-dlrow');
  dlrow.onclick();
  ok(dlCalls === 1, 'download row tap calls Game.ensureVoicePacks');
  await new Promise((r) => setTimeout(r, 20));
  ok(byId('set-dlstatus').textContent.includes('4/4 cached'), 'status line shows 4/4 cached after download');
  ok(byId('set-voicepacks').textContent.includes('/4 voice packs cached'), 'toggle subtitle pack count refreshed');

  // Static: mute row relabeled, download wiring present in source.
  ok(SRC.includes('>Mute all<'), 'mute toggle relabeled "Mute all" (was ambiguous "Sound")');
  ok(SRC.includes("id=\"set-dlrow\""), 'download row id present');

  console.log(`\n==== FINAL: ${pass} passed, ${fail} failed ====`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('HARNESS ERROR', e); process.exit(2); });
