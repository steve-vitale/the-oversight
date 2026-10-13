#!/usr/bin/env node
// PROOF TEST (settings-menu 2026-10-13) — Steve: "we need a traditional
// settings menu instead" (of the volume bar), "accessible both in and out
// of game."
//
// Contract checks on src/js/app.js (no layout engine in this VM — headless
// Chromium hangs; visual pass at 390x844 is [needs-eyes] after ship):
//   1. openSettings/closeSettings exist; sheet has Sound section (volume
//      slider + mute toggle) and Voice section (voiced-dialogue toggle).
//   2. Title footer: single gear button (b-settings); the scattered
//      b-sound / b-vol slider / b-voice icons are GONE.
//   3. In-game lower menu: settings gear button present and wired.
//   4. Overlay is body-level (works out of game AND in game), closes via
//      Done and backdrop tap.
// RED: run with PRISTINE=1 to check the assertions fail on the old code.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
let src;
if (process.env.PRISTINE) {
  src = execFileSync('git', ['show', 'HEAD:src/js/app.js'], { cwd: ROOT, encoding: 'utf8' });
} else {
  src = fs.readFileSync(path.join(ROOT, 'src/js/app.js'), 'utf8');
}

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; console.log('  FAIL: ' + name); }
}

// 1. Sheet exists with the right sections and controls
check('openSettings defined', /function openSettings\(\)/.test(src));
check('closeSettings defined', /function closeSettings\(\)/.test(src));
check('Sound section header', />(Sound)<\/div>/.test(src) || /text-transform:uppercase[^>]*>Sound/.test(src));
check('volume slider in sheet (set-vol)', /id="set-vol"/.test(src));
check('mute toggle in sheet (set-muterow)', /id="set-muterow"/.test(src));
check('voice toggle in sheet (set-voicerow)', /id="set-voicerow"/.test(src));
check('Done button closes', /id="set-done"/.test(src));
check('backdrop tap closes (e.target === ov)', /e\.target === ov\) closeSettings/.test(src));
check('overlay is body-level (document.body.appendChild)', /document\.body\.appendChild\(ov\)/.test(src));
check('slider drives Game.audio.setVolume', /set-vol[\s\S]{0,400}Game\.audio\.setVolume/.test(src));
check('mute row drives Game.audio.toggleMute', /set-muterow[\s\S]{0,300}Game\.audio\.toggleMute/.test(src));
check('voice row drives Game.setVoiceEnabled', /set-voicerow[\s\S]{0,300}Game\.setVoiceEnabled/.test(src));

// 2. Title footer: gear in, scattered icons out
check('title footer has gear button (b-settings)', /id=\\"b-settings\\"/.test(src) || /id="b-settings"/.test(src));
check('gear wired to openSettings', /b-settings[\s\S]{0,200}openSettings/.test(src));
check('old sound icon GONE (b-sound)', !/id=\\"b-sound\\"/.test(src) && !/id="b-sound"/.test(src));
check('old volume bar GONE (b-vol)', !/id=\\"b-vol\\"/.test(src) && !/id="b-vol"/.test(src));
check('old voice icon GONE (b-voice)', !/id=\\"b-voice\\"/.test(src) && !/id="b-voice"/.test(src));

// 3. In-game lower menu
check('lower menu has settings gear', /data-lm=\\"settings\\"/.test(src) || /data-lm="settings"/.test(src));
check('lower menu wiring opens settings', /a === 'settings'\) \{ try \{ openSettings/.test(src));

// 4. No stale references to removed elements
check('no getElementById(b-sound)', !/getElementById\('b-sound'\)/.test(src));
check('no getElementById(b-vol)', !/getElementById\('b-vol'\)/.test(src));
check('no getElementById(b-voice)', !/getElementById\('b-voice'\)/.test(src));

console.log(`\n${pass} passed, ${fail} failed${process.env.PRISTINE ? ' (PRISTINE — expect failures)' : ''}`);
process.exit(fail && !process.env.PRISTINE ? 1 : 0);
