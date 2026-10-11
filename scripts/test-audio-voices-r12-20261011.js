// Break-it audio r12 (2026-10-11) — runtime hostile smoke.
//
// Extracts the CombatAudio IIFE and evals it in node with stub DOM/audio.
// For EVERY registered voice:
//   1. throwing-AudioContext constructor -> must no-throw (blocked-audio path)
//   2. recording stub context, called with (undefined), ({}), and a rich data
//      object -> must no-throw; node/interval scheduling is recorded.
// Reports voices that schedule ZERO audio nodes (registered-but-silent is a
// subtler honesty bug than fired-but-unregistered) and voices that start
// sustained handles (setInterval / returned {stop}) for the stop-path audit.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const appSrc = fs.readFileSync(path.join(ROOT, 'src', 'js', 'app.js'), 'utf8');
const iifeStart = appSrc.indexOf('const CombatAudio = (() => {');
const assignIdx = appSrc.indexOf('Game.audio = CombatAudio;');
const iifeText = appSrc.slice(iifeStart, appSrc.lastIndexOf('})();', assignIdx) + 5);

let failures = [];
const ok = (cond, msg) => { console.log((cond ? 'PASS' : 'FAIL') + ' — ' + msg); if (!cond) failures.push(msg); };

function makeStub(rec) {
  const node = (kind) => ({
    kind,
    connect() {}, disconnect() {},
    start(when) { rec.starts.push(kind); },
    stop(when) { rec.stops.push(kind); },
    setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {},
    cancelScheduledValues() {},
    frequency: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} },
    gain: { value: 1, setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {}, cancelScheduledValues() {} },
    playbackRate: { value: 1 },
    type: '', buffer: null, loop: false,
  });
  const param = () => ({ value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {}, setTargetAtTime() {} });
  return {
    state: 'running',
    sampleRate: 44100,
    currentTime: 100,
    destination: {},
    resume() { rec.resumes++; return Promise.resolve(); },
    createWaveShaper() { rec.nodes.push('shaper'); const n = node('shaper'); n.curve = null; n.oversample = ''; return n; },
    createOscillator() { rec.nodes.push('osc'); return Object.assign(node('osc'), { frequency: param() }); },
    createGain() { rec.nodes.push('gain'); const n = node('gain'); n.gain = param(); return n; },
    createBiquadFilter() { rec.nodes.push('filter'); const n = node('filter'); n.frequency = param(); n.Q = param(); return n; },
    createBuffer(ch, len, rate) { rec.nodes.push('buffer'); return { getChannelData() { return new Float32Array(len); } }; },
    createBufferSource() { rec.nodes.push('bufSrc'); return node('bufSrc'); },
    createDynamicsCompressor() {
      rec.nodes.push('comp');
      const n = node('comp');
      n.threshold = param(); n.knee = param(); n.ratio = param(); n.attack = param(); n.release = param();
      return n;
    },
  };
}

function loadAudio(audioCtor, timers) {
  const t = timers || { setInterval, clearInterval, setTimeout, clearTimeout };
  const sandbox = {
    window: {},
    document: { getElementById: () => null, createElement: () => ({ classList: { remove() {}, add() {} }, style: {} }), body: { appendChild() {} } },
    localStorage: { _s: {}, getItem(k) { return this._s[k] || null; }, setItem(k, v) { this._s[k] = String(v); } },
    setInterval: t.setInterval, clearInterval: t.clearInterval, setTimeout: t.setTimeout, clearTimeout: t.clearTimeout,
    Math, Promise, Float32Array,
  };
  sandbox.window.AudioContext = audioCtor;
  sandbox.window.webkitAudioContext = undefined;
  sandbox.globalThis = sandbox;
  const fn = new Function('window', 'document', 'localStorage', 'setInterval', 'clearInterval',
    'setTimeout', 'clearTimeout', 'Math', 'Promise', 'Float32Array',
    iifeText + '\nreturn CombatAudio;');
  return fn(sandbox.window, sandbox.document, sandbox.localStorage, t.setInterval, t.clearInterval,
    t.setTimeout, t.clearTimeout, Math, Promise, Float32Array);
}

const RICH = { pattern: 'beam', beat: 3, downbeat: 1, kind: 'slots', bpm: 72, quiet: true, drama: 'secret', vol: 0.5, dur: 1.2, freq: 440 };

// ---- mode A: throwing constructor (blocked audio) ----
const throwing = function () { throw new Error('blocked'); };
const audioA = loadAudio(throwing);
const namesA = Object.keys(audioA);
ok(namesA.length > 200, 'registry exposes ' + namesA.length + ' voices (blocked mode)');
let throwFails = [];
for (const n of namesA) {
  for (const arg of [undefined, {}, RICH]) {
    try { audioA[n](arg); } catch (e) { throwFails.push(n + '(' + JSON.stringify(arg === undefined ? 'undef' : (arg === RICH ? 'rich' : '{}')) + '): ' + e.message); }
  }
}
ok(throwFails.length === 0, 'no-throw with blocked AudioContext' + (throwFails.length ? '\n  ' + throwFails.slice(0, 10).join('\n  ') : ''));

// ---- mode B: recording stub ----
const rec = { nodes: [], starts: [], stops: [], resumes: 0 };
const perVoice = {};
for (const n of Object.keys(audioA)) {
  const r = { nodes: 0, starts: 0, intervals: 0, timeouts: 0, threw: null, ret: undefined };
  let iv = 0, to = 0;
  const timers = {
    setInterval: (...a) => { iv++; return setInterval(...a); },
    clearInterval: (...a) => clearInterval(...a),
    setTimeout: (...a) => { to++; return setTimeout(...a); },
    clearTimeout: (...a) => clearTimeout(...a),
  };
  const inst = loadAudio(function () { return makeStub(rec); }, timers);
  const before = { nodes: rec.nodes.length, starts: rec.starts.length };
  for (const arg of [undefined, {}, RICH]) {
    try { r.ret = inst[n](arg); }
    catch (e) { r.threw = (r.threw ? r.threw + ' | ' : '') + e.message; }
  }
  // cleanup sustained handles this voice may have started
  try { if (typeof inst.heartbeatStop === 'function') inst.heartbeatStop(); } catch (e) {}
  try { if (typeof inst.combatEnd === 'function') inst.combatEnd(); } catch (e) {}
  try { if (r.ret && typeof r.ret.stop === 'function') r.ret.stop(); } catch (e) {}
  r.nodes = rec.nodes.length - before.nodes;
  r.starts = rec.starts.length - before.starts;
  r.intervals = iv; r.timeouts = to;
  perVoice[n] = r;
}
const threwB = Object.entries(perVoice).filter(([, r]) => r.threw);
ok(threwB.length === 0, 'no-throw with live stub context (undef/{}/rich)' +
  (threwB.length ? '\n  ' + threwB.slice(0, 10).map(([n, r]) => n + ': ' + r.threw).join('\n  ') : ''));

const silent = Object.entries(perVoice).filter(([, r]) => r.starts === 0 && r.intervals === 0);
console.log('\nvoices scheduling zero audio nodes (' + silent.length + '):');
for (const [n] of silent) console.log('  - ' + n);
const sustained = Object.entries(perVoice).filter(([, r]) => r.intervals > 0 || r.timeouts > 0);
console.log('\nvoices starting sustained handles:');
for (const [n, r] of sustained) console.log('  - ' + n + ' intervals=' + r.intervals + ' timeouts=' + r.timeouts +
  ' ret=' + (r.ret && typeof r.ret === 'object' ? Object.keys(r.ret).join(',') : typeof r.ret));

console.log('\nRUNTIME: ' + (failures.length ? failures.length + ' FAILURES' : 'all green'));
if (failures.length) process.exit(1);
