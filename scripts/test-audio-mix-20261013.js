#!/usr/bin/env node
// PROOF TEST (audio-mix 2026-10-13) — Steve: "the latest build still wasn't
// firing any audio that I could hear over the background music" + "Make sure
// volume is properly mixed." Also: the About section implied a 7-day game.
//
// What was wrong on build ee966411:
//   1. Footsteps peaked at 0.028–0.045 gain — inaudible on phone speakers
//      against the generative bed. In-game button taps fired NO sound at
//      all (the tap blip was wired only on the title screen).
//   2. Registry MP3s played via bare HTMLAudio — bypassing volume, mute,
//      and the master bus — and a failed play() returned early with NO
//      synth fallback (silent on 404/autoplay rejection).
//   3. Only uiSelect ducked the music bed.
// Fixes: audible SFX gains; global in-game tap blip (Game.uiBlip, 90ms
// debounce); MP3s routed through sfxBus via playFile() with synth fallback;
// ducking on MP3 SFX + horrorSting; About rewritten for the year-long saga.
// RED: PRISTINE=1 checks the assertions fail on the old code.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
let app, game;
if (process.env.PRISTINE) {
  const big = { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 };
  app = execFileSync('git', ['show', 'HEAD:src/js/app.js'], big);
  game = execFileSync('git', ['show', 'HEAD:src/js/game.js'], big);
} else {
  app = fs.readFileSync(path.join(ROOT, 'src/js/app.js'), 'utf8');
  game = fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8');
}

let pass = 0, fail = 0;
function check(name, cond) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; console.log('  FAIL: ' + name); }
}

// 1. Audible gains
const stepM = app.match(/soft: \[900, ([0-9.]+),/);
check('footstep soft peak >= 0.1', stepM && parseFloat(stepM[1]) >= 0.1);
const stoneM = app.match(/stone: \[2600, ([0-9.]+),/);
check('footstep stone peak >= 0.1', stoneM && parseFloat(stoneM[1]) >= 0.1);
check('uiSelect peak raised (>= 0.1)', /linearRampToValueAtTime\(0\.1[0-9]*, st \+ 0\.012\)/.test(app));

// 2. Global in-game tap blip
check('Game.uiBlip defined with debounce', /Game\.uiBlip = \(\) => \{[\s\S]{0,200}lastUiBlip < 90/.test(app));
check('document-level click capture on buttons',
  /document\.addEventListener\('click'[\s\S]{0,200}closest\('button'\)[\s\S]{0,80}Game\.uiBlip/.test(app));
check('title per-button wiring removed', !/querySelectorAll\('button, #b-notes/.test(app));
check('settings Done uses Game.uiBlip', /set-done[\s\S]{0,80}Game\.uiBlip\(\)/.test(app));

// 3. MP3 mixer routing + fallback
check('playFile exposed on Game.audio', /playFile\(file\) \{ return playFile\(file\); \}/.test(app));
check('playFile routes via MediaElementSource to sfxBus',
  /createMediaElementSource\(el\)[\s\S]{0,60}sfxBus/.test(app));
check('playFile rejects when muted', /function playFile\(file\) \{[\s\S]{0,200}if \(muted\) return Promise\.reject/.test(app));
check('audioEvent uses playFile with synth fallback',
  /self\.audio\.playFile\(reg\.file\)\.catch\(synth\)/.test(game));
check('no silent swallow (old catch(function () {}) gone)',
  !/played\.catch\(function \(\) \{\}\)/.test(game));

// 4. Ducking
check('duck() exposed on Game.audio', /duck\(\) \{ duckMusic\(\); \}/.test(app));
check('horrorSting ducks', /function horrorSting\(\)[\s\S]{0,600}duckMusic\(\);/.test(app));

// 5. About rewritten
check('About: no seven-days copy', !/seven days/.test(app));
check('About: year-long saga', /Fourteen endings\. One year\./.test(app));
check('About: no scattering:// URL', !/scattering:\/\/about/.test(app));

console.log(`\n${pass} passed, ${fail} failed${process.env.PRISTINE ? ' (PRISTINE — expect failures)' : ''}`);
process.exit(fail && !process.env.PRISTINE ? 1 : 0);
