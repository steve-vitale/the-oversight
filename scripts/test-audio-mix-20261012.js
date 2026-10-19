'use strict';
// Proof: SFX-vs-music mix (2026-10-12). Steve reported: background music
// plays, but button blips don't seem to fire over it. Root cause: the
// generative bed is continuous polyphony under an aggressive compressor
// (threshold -18dB, ratio 12:1) — a 120ms blip at a comparable peak gets
// masked and taps sound dead. Fix: uiSelect() now dips the music bus
// briefly (SFX priority duck) and the blip peak is raised 0.045 -> 0.065.
// Also new: a persisted player volume setting (oversight_vol, default 0.9)
// with setVolume/getVolume on the audio API and a title-screen slider.
//
// RED check: `git stash push src/js/app.js` (keep this file) and the duck
// + setVolume assertions FAIL; the blip-over-music guard still passes on
// old code (the blip fired before — it was just masked).
const fs = require('./lib/source-text');
const path = require('path');
const APP = path.resolve(__dirname, '..', 'src', 'js', 'app.js');

let pass = 0, fail = 0;
function ok(c, n) { if (c) pass++; else { fail++; console.log('  FAIL:', n); } }

// ---- minimal fake Web Audio: just enough to detect scheduled sound ----
class Param {
  constructor(v) { this.value = v; this._ev = []; this._in = []; }
  setValueAtTime(v, t) { this._ev.push([t, v]); this.value = v; }
  linearRampToValueAtTime(v, t) { this._ev.push([t, v]); }
  exponentialRampToValueAtTime(v, t) { this._ev.push([t, v]); }
  setTargetAtTime(v, t) { this._ev.push([t, v]); }
  cancelScheduledValues() {}
}
class FNode {
  constructor(ctx, kind) { this.ctx = ctx; this._kind = kind; this._dst = []; ctx._nodes.push(this); }
  connect(d) { if (d instanceof Param) d._in.push(this); else { this._dst.push(d); } return d; }
}
class FakeAC {
  constructor() {
    this.sampleRate = 22050; this.currentTime = 0; this.state = 'running';
    this._nodes = []; this._sources = []; FakeAC._all.push(this);
    this.destination = new FNode(this, 'dest');
  }
  createOscillator() {
    const o = new FNode(this, 'osc');
    o.frequency = new Param(440); o.detune = new Param(0);
    o.start = (t) => { o._start = t == null ? 0 : t; this._sources.push(o); };
    o.stop = (t) => { o._stop = t; };
    return o;
  }
  createGain() { const g = new FNode(this, 'gain'); g.gain = new Param(1); return g; }
  createBiquadFilter() {
    const f = new FNode(this, 'filter');
    f.frequency = new Param(350); f.Q = new Param(1); return f;
  }
  createBuffer(ch, len) { const d = new Float32Array(len); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; return { getChannelData: () => d }; }
  createBufferSource() {
    const s = new FNode(this, 'buf'); s.buffer = null; s.loop = false;
    s.start = (t) => { s._start = t == null ? 0 : t; this._sources.push(s); };
    s.stop = (t) => { s._stop = t; };
    return s;
  }
  createDynamicsCompressor() {
    const c = new FNode(this, 'comp');
    c.threshold = new Param(-18); c.knee = new Param(22); c.ratio = new Param(12);
    c.attack = new Param(0.003); c.release = new Param(0.25);
    return c;
  }
  createStereoPanner() { const p = new FNode(this, 'pan'); p.pan = new Param(0); return p; }
  createWaveShaper() { const w = new FNode(this, 'shaper'); w.curve = null; return w; }
  resume() { return Promise.resolve(); }
}
FakeAC._all = [];

// ---- localStorage stub (the IIFE guards with typeof checks) ----
function freshStore(seed) {
  const s = Object.assign({}, seed || {});
  global.localStorage = {
    getItem: (k) => (k in s ? s[k] : null),
    setItem: (k, v) => { s[k] = String(v); },
    removeItem: (k) => { delete s[k]; },
    _s: s,
  };
  return s;
}

function loadAPI() {
  const raw = fs.readFileSync(APP, 'utf8');
  const start = raw.indexOf('const CombatAudio = (() => {');
  const end = raw.indexOf('\n  })();\n', start);
  const src = raw.slice(start, end)
    .replace('const CombatAudio = (() => {', 'globalThis.__CA__ = (() => {')
    // reach into the closure for the test: expose the music scheduler tick
    // (injected before the API return — anything appended after it would
    // never run)
    .replace('\n    return {',
      '\n    globalThis.__MUTICK__ = (typeof muTick === "function" ? muTick : null);\n    return {')
    + '\n})();';
  FakeAC._all = [];
  global.setInterval = () => 1; global.clearInterval = () => {};
  global.window = { AudioContext: FakeAC, webkitAudioContext: FakeAC };
  delete global.__CA__; delete global.__MUTICK__;
  eval(src);
  return { api: global.__CA__, muTick: global.__MUTICK__ };
}
// the context only exists after the first API call runs ensure()
function curAC() { return FakeAC._all[FakeAC._all.length - 1]; }

function oscSources(ac) { return ac._sources.filter(s => s._kind === 'osc').length; }
// duckMusic is the only code that schedules gain VALUE 0.45 (other 0.45s
// in app.js are time offsets, the value slot of _ev entries)
function duckFired(ac) {
  for (const n of ac._nodes) {
    if (n._kind !== 'gain') continue;
    for (const ev of n.gain._ev) if (ev[1] === 0.45) return true;
  }
  return false;
}
// master = the gain node feeding the compressor
function masterGain(ac) {
  const comp = ac._nodes.find(n => n._kind === 'comp');
  const m = ac._nodes.find(n => n._kind === 'gain' && n._dst.indexOf(comp) >= 0);
  return m ? m.gain : null;
}

// ---- (a) blip fires over a real music bed ----
(function () {
  freshStore();
  const { api, muTick } = loadAPI();
  api.music('menu');
  const ac = curAC();
  ok(!!ac, 'audio context created');
  ok(typeof muTick === 'function', 'music scheduler reachable headless');
  muTick(); // drive one scheduler tick -> real bed sources
  const bedOsc = oscSources(ac);
  ok(bedOsc > 0, `music bed schedules sources headless (got ${bedOsc})`);
  api.uiSelect();
  const after = oscSources(ac);
  ok(after === bedOsc + 2, `uiSelect adds its 2-osc blip over the bed (${bedOsc} -> ${after})`);
  ok(duckFired(ac), 'uiSelect dips the music bus (SFX priority duck scheduled)');
})();

// ---- (b) volume setting ----
(function () {
  const store = freshStore();
  const { api } = loadAPI();
  ok(api.getVolume() === 0.9, `default volume is 0.9 (got ${api.getVolume()})`);
  ok(typeof api.setVolume === 'function', 'setVolume exists on the audio API');
  api.uiSelect(); // bring up the audio context (ensure) before probing gains
  api.setVolume(0.5);
  const ac = curAC();
  ok(api.getVolume() === 0.5, 'getVolume reflects setVolume(0.5)');
  const mg = masterGain(ac);
  ok(!!mg, 'master gain node found');
  const hit = mg && mg._ev.some(ev => ev[1] === 0.5);
  ok(hit, 'setVolume(0.5) schedules master gain toward 0.5');
  ok(store.oversight_vol === '0.5', `volume persists to localStorage (got ${store.oversight_vol})`);
  // persistence across a fresh load (new IIFE reads the store at boot)
  const again = loadAPI();
  ok(again.api.getVolume() === 0.5, 'volume survives a fresh audio boot');
  // clamping
  again.api.setVolume(7);
  ok(again.api.getVolume() === 1, 'setVolume clamps above 1');
  again.api.setVolume(-2);
  ok(again.api.getVolume() === 0, 'setVolume clamps below 0');
})();

console.log(`\n==== ${pass}/${pass + fail} checks passed ====`);
process.exit(fail ? 1 : 0);
