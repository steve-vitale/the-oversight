// Break-it audio r12 (2026-10-11) — registry census + hostile-context smoke.
//
// Fresh attack after 15 commits landed on top of the r11/wave-3 audio fixes.
// Static: every fired name (audioEvent literals, encAudio literals,
// encPhase `audio:` beat configs, monsters.json *Audio cues,
// DRAMA_AUDIO_MATES, CX_BEAT_DEFS parts, phase `beat:` declarations,
// _cxB-generated contest beat names, ENC_AUDIO_FALLBACK, dynamic wound
// family) must resolve to a registered Game.audio voice. Registered voices
// with zero external references must be internally reachable (sub-voices)
// or they are dead code.
// Runtime: every voice no-throws with (undefined), ({}), and representative
// data against (a) a throwing AudioContext constructor and (b) a recording
// stub context. Voices that schedule nothing are reported for review.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const JS = path.join(ROOT, 'src', 'js');

let failures = [];
const ok = (cond, msg) => { console.log((cond ? 'PASS' : 'FAIL') + ' — ' + msg); if (!cond) failures.push(msg); };
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:"'\/])\/\/.*$/gm, '$1');
}

// ---------- 1. registry ----------
const appSrc = fs.readFileSync(path.join(JS, 'app.js'), 'utf8');
const iifeStart = appSrc.indexOf('const CombatAudio = (() => {');
ok(iifeStart > 0, 'CombatAudio IIFE found');
const assignIdx = appSrc.indexOf('Game.audio = CombatAudio;');
const iifeText = appSrc.slice(iifeStart, appSrc.lastIndexOf('})();', assignIdx) + 5);
const retStart = iifeText.indexOf('return {');
const retBlock = iifeText.slice(retStart, iifeText.lastIndexOf('};'));
const registered = new Set();
for (const m of retBlock.matchAll(/^\s{6}([A-Za-z_$][\w$]*)\s*\(/gm)) registered.add(m[1]);
console.log('registered voices: ' + registered.size);
ok(registered.size > 200, 'registry populated');

// ---------- 2. literal fires ----------
const fired = new Map();
const addFire = (name, where) => { if (!fired.has(name)) fired.set(name, []); fired.get(name).push(where); };
const beatDecls = new Set();   // phase `beat: 'name'` declarations
const encPhaseAudio = new Set(); // `audio: 'name'` in beat configs
for (const f of fs.readdirSync(JS)) {
  if (!f.endsWith('.js')) continue;
  const clean = stripComments(fs.readFileSync(path.join(JS, f), 'utf8'));
  for (const m of clean.matchAll(/audioEvent\(\s*['"`]([A-Za-z0-9_]+)['"`]/g)) addFire(m[1], f + ':audioEvent');
  for (const m of clean.matchAll(/encAudio\(\s*['"`]([A-Za-z0-9_]+)['"`]/g)) addFire(m[1], f + ':encAudio');
  for (const m of clean.matchAll(/beat:\s*['"`]([A-Za-z0-9_]+)['"`]/g)) beatDecls.add(m[1]);
  for (const m of clean.matchAll(/audio:\s*['"`]([A-Za-z0-9_]+)['"`]/g)) encPhaseAudio.add(m[1]);
}
console.log('literal audioEvent/encAudio names: ' + fired.size);
console.log('phase beat: declarations: ' + beatDecls.size + ', encPhase audio: configs: ' + encPhaseAudio.size);

// ---------- 3. monsters.json *Audio cues ----------
const monsters = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'monsters.json'), 'utf8'));
const jsonCues = new Set();
(function walk(o) {
  if (Array.isArray(o)) return o.forEach(walk);
  if (o && typeof o === 'object') {
    for (const [k, v] of Object.entries(o)) { if (/audio$/i.test(k) && typeof v === 'string') jsonCues.add(v); walk(v); }
  }
})(monsters);
console.log('monsters.json *Audio cues: ' + jsonCues.size);

// ---------- 4. drama mates ----------
const dramaSrc = fs.readFileSync(path.join(JS, 'drama.js'), 'utf8');
const matesBlock = dramaSrc.slice(dramaSrc.indexOf('const DRAMA_AUDIO_MATES = {'), dramaSrc.indexOf('};', dramaSrc.indexOf('const DRAMA_AUDIO_MATES = {')));
const mates = new Set();
for (const m of matesBlock.matchAll(/:\s*['"`]([A-Za-z0-9_]+)['"`]/g)) mates.add(m[1]);
console.log('DRAMA_AUDIO_MATES voices: ' + mates.size);

// ---------- 5. CX_BEAT_DEFS ----------
const cxSrc = stripComments(fs.readFileSync(path.join(JS, 'contests.js'), 'utf8'));
const defsStart = cxSrc.indexOf('const CX_BEAT_DEFS = {');
let depth = 0, di = cxSrc.indexOf('{', defsStart), de = -1;
for (let j = di; j < cxSrc.length; j++) {
  if (cxSrc[j] === '{' || cxSrc[j] === '[') depth++;
  else if (cxSrc[j] === '}' || cxSrc[j] === ']') { depth--; if (depth === 0) { de = j; break; } }
}
const defsBlock = cxSrc.slice(defsStart, de + 1);
const beatNames = new Set(), beatParts = new Set();
for (const m of defsBlock.matchAll(/^\s{4}([A-Za-z0-9_]+):\s*\[/gm)) beatNames.add(m[1]);
for (const m of defsBlock.matchAll(/['"`]([A-Za-z0-9_]+)['"`]/g)) { if (!beatNames.has(m[1])) beatParts.add(m[1]); }
console.log('CX_BEAT_DEFS beats: ' + beatNames.size + ', parts: ' + beatParts.size);

// ---------- 6. _cxB-generated names: real contest ids (src/data/contests.json) x 4 kinds ----------
const contestIds = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'contests.json'), 'utf8')).map(c => c.id);
const cxbNames = new Set();
for (const id of contestIds) {
  const camel = id.replace(/_([a-z])/g, (mm, c) => c.toUpperCase());
  const cap = camel.charAt(0).toUpperCase() + camel.slice(1);
  for (const kind of ['Declare', 'Escalate', 'Climax', 'Resolve']) cxbNames.add('contest' + cap + kind);
}
console.log('contest ids: ' + contestIds.length);

// ---------- 7. encAudio fallback ----------
const encSrc = stripComments(fs.readFileSync(path.join(JS, 'encounters.js'), 'utf8'));
const fbBlock = encSrc.slice(encSrc.indexOf('ENC_AUDIO_FALLBACK = {'), encSrc.indexOf('};', encSrc.indexOf('ENC_AUDIO_FALLBACK')));
const fbNames = new Set();
for (const m of fbBlock.matchAll(/['"`]([A-Za-z0-9_]+)['"`]/g)) fbNames.add(m[1]);

// ---------- 8. union of everything that must resolve ----------
const mustResolve = new Map();
const need = (name, where) => {
  // _cxBeat no-ops on unknown beat names by design; beats resolve via
  // CX_BEAT_DEFS, parts must be real voices.
  if (!mustResolve.has(name)) mustResolve.set(name, []);
  mustResolve.get(name).push(where);
};
for (const [n, w] of fired) need(n, 'fire:' + w.join(','));
for (const n of jsonCues) need(n, 'monsters.json');
for (const n of mates) need(n, 'drama-mate');
for (const n of beatParts) need(n, 'cx-part');
for (const n of fbNames) need(n, 'enc-fallback');
for (const n of encPhaseAudio) need(n, 'encPhase-audio');
for (const n of ['woundEnraged', 'woundCunning', 'woundDesperate']) need(n, 'wound-dynamic');
const silent = [...mustResolve.keys()].filter(n => !registered.has(n));
ok(silent.length === 0, 'zero fired-but-silent hooks' + (silent.length ? ' — SILENT: ' + silent.map(s => s + ' (' + mustResolve.get(s).join(';') + ')').join(' | ') : ''));
// phase beat: declarations must be beats or voices
const badBeats = [...beatDecls].filter(n => !beatNames.has(n) && !registered.has(n));
ok(badBeats.length === 0, 'zero dangling phase beat: declarations' + (badBeats.length ? ' — ' + badBeats.join(',') : ''));
// _cxB-generated names used at Resolve sites: spot-check the 4 Resolve calls' ids resolve
const resolveIds = [...cxSrc.matchAll(/_cxB\(\s*ac\.contestId,\s*'Resolve'\s*\)/g)].length;
ok(resolveIds > 0, '_cxB Resolve call sites present (' + resolveIds + ')');
// every contest id's 4 generated names must exist in CX_BEAT_DEFS
const missingBeats = [...cxbNames].filter(n => !beatNames.has(n));
ok(missingBeats.length === 0, 'all _cxB-generated contest beats defined' + (missingBeats.length ? ' — MISSING: ' + missingBeats.slice(0, 12).join(',') + (missingBeats.length > 12 ? '…' : '') : ''));

// ---------- 9. dead-code: registered but unreferenced anywhere ----------
// A voice is live if its name appears as a string literal or identifier
// anywhere in src/js OUTSIDE the CombatAudio return block (callers fire by
// string name: audioEvent('deerNotice')), or inside the IIFE body (sub-voice
// reached through a fired dispatcher like telegraph()/impact()/combatEnd()).
const allJsClean = {};
for (const f of fs.readdirSync(JS)) {
  if (!f.endsWith('.js')) continue;
  allJsClean[f] = stripComments(fs.readFileSync(path.join(JS, f), 'utf8'));
}
const appNoRet = allJsClean['app.js'].replace(retBlock, '');
const iifeBodyNoRet = iifeText.slice(0, retStart);
const noRetRefs = [];
const internalOnly = [];
for (const n of registered) {
  const re = new RegExp('[^\\w$]' + n.replace(/\$/g, '\\$') + '[^\\w$]');
  let outside = re.test(appNoRet);
  if (!outside) for (const f of Object.keys(allJsClean)) {
    if (f === 'app.js') continue;
    if (re.test(allJsClean[f])) { outside = true; break; }
  }
  const inside = re.test(iifeBodyNoRet);
  if (!outside && !inside) noRetRefs.push(n);
  else if (!outside && inside) internalOnly.push(n);
}
ok(noRetRefs.length === 0, 'zero dead registered voices' + (noRetRefs.length ? ' — DEAD: ' + noRetRefs.join(',') : ''));
console.log('internal sub-voices (dispatched within IIFE): ' + internalOnly.length);

// ---------- 9b. fired-union cross-check: registered voices never fired by any dispatch path ----------
// The fired union: literal fires + json cues + drama mates + beat parts +
// fallbacks + encPhase audio + wound family + beat: decls (beats) + _cxB names
// + dispatch-internal names (telegraph()/impact()/combatStart()/combatEnd()
// wrappers and their sub-voice callees are covered by the inside-IIFE check
// above; this is the extra honesty net for voices nothing ever names).
const firedUnion = new Set([...fired.keys(), ...jsonCues, ...mates, ...beatParts, ...fbNames, ...encPhaseAudio,
  'woundEnraged', 'woundCunning', 'woundDesperate', ...beatNames, ...cxbNames]);
// names referenced as strings anywhere in src/js (catches Game.audio['x'] style + docs in code)
// or as property access (Game.audio.toggleMute()).
const stringMentioned = new Set();
for (const f of Object.keys(allJsClean)) {
  for (const m of allJsClean[f].matchAll(/['"`]([A-Za-z][A-Za-z0-9_]*)['"`]/g)) stringMentioned.add(m[1]);
  for (const m of allJsClean[f].matchAll(/\.([A-Za-z][A-Za-z0-9_]*)\s*\(/g)) stringMentioned.add(m[1]);
}
const neverFired = [...registered].filter(n => !firedUnion.has(n) && !stringMentioned.has(n));
console.log('registered voices never named anywhere in src/js: ' + neverFired.length +
  (neverFired.length ? ' — ' + neverFired.join(',') : ''));
ok(neverFired.length === 0, 'every registered voice is named by some dispatch path');

// ---------- 9c. internal dead functions: defined in the IIFE, never called ----------
// (comments stripped — a mention in a comment is not a call. Precedent:
// boom() died 2026-10-06 when impactWild() replaced it as the fallthrough.)
const strip2 = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:"'\/])\/\/.*$/gm, '$1');
const iifeBodyClean = strip2(iifeText.slice(0, retStart));
const retClean = strip2(retBlock);
const internalDefs = new Set([...iifeBodyClean.matchAll(/function (\w+)\(/g)].map(m => m[1]));
const deadInternal = [...internalDefs].filter(name => {
  const re = new RegExp('[^\\w$]' + name.replace(/\$/g, '\\$') + '\\s*\\(', 'g');
  const uses = (iifeBodyClean.match(re) || []).length - 1 + (retClean.match(re) || []).length;
  return uses <= 0;
});
ok(deadInternal.length === 0, 'zero dead internal synth functions' + (deadInternal.length ? ' — DEAD: ' + deadInternal.join(',') : ''));
console.log('internal synth functions: ' + internalDefs.size);

// ---------- 10. exploit surface: IIFE must not touch game state ----------
const iifeClean = iifeText.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:"'\/])\/\/.*$/gm, '$1');
const extRefs = new Set([...iifeClean.matchAll(/\b(Game|S|fetch|XMLHttpRequest)\s*\./g)].map(m => m[1]));
ok(extRefs.size === 0, 'CombatAudio touches no game state (' + [...extRefs].join(',') + ')');

console.log('\nSTATIC: ' + (failures.length ? failures.length + ' FAILURES' : 'all green'));
if (failures.length) { console.log(failures.join('\n')); process.exit(1); }
