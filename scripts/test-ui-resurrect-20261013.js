#!/usr/bin/env node
// test-ui-resurrect-20261013.js — stash@{9} partial resurrection proof.
// Compact status chips + surroundings strip land; the combat strip stays dead
// per Steve's e4b0da42 kill. Static checks on app.js + CSS.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('ok: ' + name); }
  else { fail++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

const app = fs.readFileSync(path.join(ROOT, 'src/js/app.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'src/css/main.css'), 'utf8');

// Status chips
ok('statusBars uses statgrid chips', app.includes('<div class="statgrid">'));
ok('chip() helper defined', app.includes('function chip(icon, val, pct, low, title'));
ok('chips preserve feast/bank/contest', app.includes('contestRow + beatsRowHTML() + afflictionRow(st)'));
ok('pack chip stays clickable', app.includes("chip('🎒'") && app.includes("'pack'"));
ok('statgrid CSS present', css.includes('.statgrid'));
ok('statc low-state CSS present', css.includes('.statc.low'));

// Surroundings strip
ok('surroundHTML defined', app.includes('function surroundHTML(st'));
ok('surround merges epithet + perception', app.includes('ss-main') && app.includes('perceiveline'));
ok('surround toggle wired', app.includes('wireSurround()'));
ok('epithet line replaced by surroundHTML', !app.includes('ord-epithet">👁'));
ok('surround-strip CSS present', css.includes('.surround-strip'));

// Combat strip stays dead (Steve e4b0da42)
ok('combatStripHTML never called', !/[^a-zA-Z]combatStripHTML\(st\)/.test(app.replace('function combatStripHTML(st)', '')));
ok('no combatstrip CSS revived', !css.includes('.combatstrip'));
ok('no ord-combatstrip in live render',
  !app.split('function combatStripHTML')[0].includes('ord-combatstrip') &&
  !app.split('function combatStripHTML').slice(1).join('').includes('${combatStripHTML'));

// Context bar single-row
ok('contextbar single-row scroll CSS', css.includes('.contextbar') && css.includes('flex-wrap: nowrap'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
