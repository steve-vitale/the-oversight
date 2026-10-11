// PROOF: alien persona combat dialogue is voiced via the Piper hook (2026-10-11).
// Personas aren't villagers, so Game.vpOf can't resolve them — alienPlayers.js
// builds a stable person-like record per persona (apVoiceRecord) and routes
// every spoken persona line through Game.convoSpeakLine via apSpeak.
// Gates (mute/toggle/unlock/foreign) are reused from convoSpeakLine, not reimplemented.
// Knowledge-gating is preserved: apSpeak only ever voices what the caller already showed.
//
//   node scripts/test-voice-personas.js   (SEED=... to vary)
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const SEED = parseInt(process.env.SEED || '20261011', 10);
Math.random = mulberry32(SEED); // seeded BEFORE eval (modules capture it at load)
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
// fake localStorage for voice-piper's LS_KEY toggle
const _ls = {};
global.localStorage = { getItem: (k) => (k in _ls ? _ls[k] : null), setItem: (k, v) => { _ls[k] = String(v); }, removeItem: (k) => { delete _ls[k]; } };
const order = execSync('grep -o "src/js/[a-zA-Z0-9-]*\\.js" index.html', { cwd: ROOT }).toString().split('\n')
  .map(s => s.split('?')[0])
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global;
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
order.forEach(f => { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;

// persona data (data-driven in-game via this.data.alienPlayers)
Game.data = Game.data || {};
Game.data.alienPlayers = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/alienPlayers.json'), 'utf8'));
// neutralize heavy state reads; knowledge gate driven explicitly per-test
Game.say = function () { return ''; };

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function deq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

const PIDS = ['vex_marlowe', 'countess_sable', 'rax_dentist', 'pip_quindle', 'sarge', 'dr_fenwick', 'wren', 'old_tam'];

// ---- A. voice cast: every persona has a fixed, characterful record ----
PIDS.forEach(pid => {
  ok('cast entry for ' + pid, !!(Game.apVoiceCast && Game.apVoiceCast[pid]));
});
const EXPECT = {
  vex_marlowe: ['f', 38], countess_sable: ['f', 54], rax_dentist: ['m', 58],
  pip_quindle: ['m', 24], sarge: ['m', 61], dr_fenwick: ['m', 47],
  wren: ['f', 22], old_tam: ['m', 71],
};
PIDS.forEach(pid => {
  const c = Game.apVoiceCast[pid];
  ok(pid + ' cast = ' + EXPECT[pid][0] + '/' + EXPECT[pid][1],
    c.gender === EXPECT[pid][0] && c.age === EXPECT[pid][1] && typeof c.temperament === 'string');
});

// ---- B. stability: same persona -> identical record + profile across calls ----
PIDS.forEach(pid => {
  const r1 = Game.apVoiceRecord(pid), r2 = Game.apVoiceRecord(pid);
  ok(pid + ' record stable', deq(r1, r2) && r1.id === 'ap:' + pid);
  const p1 = Game.voiceProfileFor(r1), p2 = Game.voiceProfileFor(r2);
  ok(pid + ' voice profile stable', deq(p1, p2) && !!Game.VOICE_PACKS[p1.packId]);
});
ok('rax reads older/menacing (m-old pack)', Game.voiceProfileFor(Game.apVoiceRecord('rax_dentist')).packId === 'm-old');
ok('fenwick reads clinical (m band, even rate)', Game.voiceProfileFor(Game.apVoiceRecord('dr_fenwick')).sexClass === 'm');
ok('pip reads young (m-young pack)', Game.voiceProfileFor(Game.apVoiceRecord('pip_quindle')).packId === 'm-young');
ok('wren reads young (f-young pack)', Game.voiceProfileFor(Game.apVoiceRecord('wren')).packId === 'f-young');
ok('unknown pid -> null record', Game.apVoiceRecord('nope') === null);

// ---- C. routing: every spoken line goes through the hook ----
// capture hook
const calls = [];
const realHook = Game.convoSpeakLine;
Game.convoSpeakLine = function (vid, text, opts) {
  calls.push({ vid, text, opts });
  return 'speaking-fallback';
};
Game.setVoiceEnabled(true);
Game._voiceUnlocked = true;
Game.audio = { isMuted: () => false };
Game.apKnowsAlien = () => true; // known: lines are shown, so they may be voiced

const SITUATIONS = ['onHit', 'onHurt', 'onWinning', 'onLosing', 'unhinged'];
const COMBAT_PIDS = PIDS.filter(pid => {
  const p = Game.apPersona(pid);
  return !!(p && p.combatLines);
});
ok('wren has no combatLines (benevolent non-fighter) — silence is data-honest',
  !COMBAT_PIDS.includes('wren'));
COMBAT_PIDS.forEach(pid => {
  SITUATIONS.forEach(sit => {
    calls.length = 0;
    const r = Game.apSayCombat(pid, sit, 1.0); // chance 1: deterministic
    const c = calls[0];
    ok('apSayCombat ' + pid + '/' + sit + ' voiced',
      r === true && !!c && c.vid === 'ap:' + pid && typeof c.text === 'string' && c.text.length > 0 &&
      c.opts && c.opts.persona && c.opts.persona.id === 'ap:' + pid,
      'ret=' + r + ' calls=' + calls.length);
  });
});
// taunt
calls.length = 0;
const _mr = Math.random; Math.random = () => 0; // force the 0.35 gate
Game.apPilotTaunt('vex_marlowe');
Math.random = _mr;
ok('apPilotTaunt voiced', calls.length === 1 && calls[0].vid === 'ap:vex_marlowe');
// group banter (known team)
calls.length = 0;
Game.apGroupBanter(['vex_marlowe', 'countess_sable']);
ok('group banter vex+sable voiced x2', calls.length === 2 &&
  calls[0].vid === 'ap:vex_marlowe' && calls[1].vid === 'ap:countess_sable',
  'calls=' + calls.length);
calls.length = 0;
Game.apGroupBanter(['sarge', 'pip_quindle']);
ok('group banter sarge+pip voiced x2', calls.length === 2 &&
  calls[0].vid === 'ap:sarge' && calls[1].vid === 'ap:pip_quindle');
// enrage / retreat lines live behind apWealthStance (heavy); verify the
// callsite wiring statically instead (see section F).

// ---- D. gates respected (real convoSpeakLine restored) ----
Game.convoSpeakLine = realHook;
Game.setVoiceEnabled(false);
ok('voice toggle off -> apSpeak returns off, no speech', Game.apSpeak('sarge', 'Formation.') === 'off');
Game.setVoiceEnabled(true);
Game.audio = { isMuted: () => true };
ok('muted -> apSpeak returns muted', Game.apSpeak('sarge', 'Formation.') === 'muted');
Game.audio = { isMuted: () => false };
Game._voiceUnlocked = false;
ok('locked (pre-gesture) -> apSpeak returns locked', Game.apSpeak('sarge', 'Formation.') === 'locked');
Game._voiceUnlocked = true;
ok('foreign-skip respected', Game.convoSpeakLine('ap:sarge', 'Hola', { persona: Game.apVoiceRecord('sarge'), foreign: true }) === 'foreign-skip');
const _hook = Game.convoSpeakLine;
Game.convoSpeakLine = undefined;
ok('no hook (module absent) -> no-hook, no crash', Game.apSpeak('sarge', 'Formation.') === 'no-hook');
Game.convoSpeakLine = _hook;
ok('empty text -> empty', Game.apSpeak('sarge', '') === 'empty');
ok('unknown pid -> no-persona', Game.apSpeak('nope', 'hi') === 'no-persona');

// ---- E. knowledge gate preserved: unrevealed personas stay silent ----
Game.apKnowsAlien = () => false;
const calls2 = [];
Game.convoSpeakLine = function (vid, text, opts) { calls2.push({ vid, text }); return 'speaking-fallback'; };
const r2 = Game.apSayCombat('vex_marlowe', 'onHit', 1.0);
ok('unrevealed: apSayCombat returns false, no voice', r2 === false && calls2.length === 0);
Game.apGroupBanter(['vex_marlowe', 'countess_sable']); // pre-reveal: anonymous text only
ok('pre-reveal group banter: text shown, voice silent', calls2.length === 0);
Game.convoSpeakLine = realHook;

// ---- F. static: every spoken-dialogue say-site is followed by apSpeak ----
// (death narration "goes still" is intentionally unvoiced — the dead don't speak)
const src = fs.readFileSync(path.join(ROOT, 'src/js/alienPlayers.js'), 'utf8').split('\n');
const problems = [];
src.forEach((ln, i) => {
  if (/this\.say\('🎭/.test(ln)) {
    const isDeath = /goes still|Whoever they were wearing/.test(ln);
    const window = src.slice(Math.max(0, i - 8), i + 3).join('\n');
    const preReveal = /PRE-REVEAL/.test(window);
    const voiced = /this\.apSpeak\(/.test(ln) || /this\.apSpeak\(/.test(src[i + 1] || '') || /this\.apSpeak\(/.test(src[i + 2] || '');
    if (!isDeath && !preReveal && !voiced) problems.push((i + 1) + ': ' + ln.trim().slice(0, 70));
  }
});
ok('all spoken persona say-sites wired to apSpeak', problems.length === 0, problems.join(' | '));

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
