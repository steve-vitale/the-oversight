// test-wave45-audio-registry-20261012.js — every audioEvent name fired by
// sigW4.js / sigW5.js / finale-campaign.js resolves to a registered
// Game.audio voice. (2026-10-12: 45 fired-but-unregistered — all silent.)
// Static check: fired names vs the CombatAudio public API in app.js.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

let pass = 0, fail = 0;
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL:', name); }
}

const app = fs.readFileSync(path.join(ROOT, 'src/js/app.js'), 'utf8');
// public API: entries like "      name(...) {" or "      name(d) {" inside the return block
const apiStart = app.indexOf('    return {');
const api = app.slice(apiStart);
const registered = new Set();
for (const m of api.matchAll(/^\s{6}([a-zA-Z][a-zA-Z0-9]*)\s*\([^)]*\)\s*\{/gm)) {
  registered.add(m[1]);
}
ok(registered.size > 200, 'registry parsed (' + registered.size + ' voices)');

const fired = new Set();
for (const f of ['src/js/sigW4.js', 'src/js/sigW5.js', 'src/js/finale-campaign.js']) {
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  for (const m of src.matchAll(/audioEvent\('([a-zA-Z0-9]+)'/g)) fired.add(m[1]);
}
ok(fired.size === 45, 'fired names collected (' + fired.size + ')');

const missing = [...fired].filter(n => !registered.has(n));
ok(missing.length === 0, 'all fired names resolve' + (missing.length ? ': ' + missing.join(',') : ''));

// new signature voices are real functions, not just API aliases
const synthFns = ['focusGroupMurmur', 'congInvite', 'congGeas', 'congAbsolve',
  'strikeShutdown', 'suburbHum', 'eulogyVerse', 'algorithmTick', 'eaterGorge',
  'heraldTrumpet', 'cxDescend', 'cxOffScript', 'cxRenewed', 'edCut', 'edJam',
  'edContradict', 'rrClap', 'spSpoil', 'tsTick', 'fiTitleCard', 'fiSacrifice',
  'villagerDeath', 'playerDeathSting'];
for (const fn of synthFns) {
  ok(new RegExp('function ' + fn + '\\(\\)').test(app), 'synth defined: ' + fn);
}

console.log(pass + '/' + (pass + fail) + ' green');
process.exit(fail ? 1 : 0);
