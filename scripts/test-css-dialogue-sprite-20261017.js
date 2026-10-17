#!/usr/bin/env node
// Proof: Steve phone 2026-10-17 — chat options clipped + tiny player sprite.
// 1. .dlg-choices inside the fixed-height narration box must SHRINK (flex 0 1
//    auto, min-height 0) so a tall option list scrolls internally instead of
//    being clipped mid-button by the box's overflow:hidden.
// 2. The generic 40px !important svg cap must NOT match the player cell, or it
//    defeats the player's cell-relative width:100%/height:100% sizing.
// 3. The grid cells keep fixed calc(100%/9) + aspect-ratio:1 sizing — sprite
//    content can never rescale the grid (Steve: "the grid at least should
//    stay still").
const fs = require('fs');
const path = require('path');
const css = fs.readFileSync(path.join(__dirname, '..', 'src', 'css', 'main.css'), 'utf8');
let pass = 0, fail = 0;
function ok(name, cond) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; console.log('  FAIL: ' + name); }
}
// 1. choices shrink inside the fixed 184px narration region
const choicesRule = css.match(/\.ord-narration \.dialogue-box \.dlg-choices \{([^}]*)\}/);
ok('dlg-choices has a dedicated rule in .ord-narration context', !!choicesRule);
if (choicesRule) {
  ok('dlg-choices flex allows shrink (0 1 auto)', /flex:\s*0\s+1\s+auto/.test(choicesRule[1]));
  ok('dlg-choices min-height:0 (can shrink below content)', /min-height:\s*0/.test(choicesRule[1]));
}
// the no-shrink group must no longer contain .dlg-choices
const noShrinkGroup = css.match(/\.ord-narration \.dialogue-box \.dlg-speaker,[\s\S]*?\{[^}]*\}/);
ok('no-shrink group no longer lists .dlg-choices',
  !!noShrinkGroup && !/\.dlg-choices/.test(noShrinkGroup[0]));
// the choices pane itself still scrolls
ok('.dlg-choices keeps overflow-y:auto', /\.dlg-choices \{[^}]*overflow-y:\s*auto/.test(css));
// 2. player excluded from the 40px auto-size svg cap
ok('40px svg cap excludes .me cells', /\.detail \.cell:not\(\.me\) \.vsprite svg/.test(css));
ok('player keeps width/height 100% svg rule',
  /\.cell\.me \.vtoken \.vsprite svg\.sprite \{[^}]*width:\s*100%[^}]*height:\s*100%/.test(css));
// 3. grid cells are fixed-size: content cannot rescale the grid
const cellRule = css.match(/^\.cell \{$/m) ? css.slice(css.indexOf('.cell {'), css.indexOf('.cell {') + 400) : '';
ok('.cell width is calc(100%/9)', /\.cell \{[^}]*width:\s*calc\(100%\s*\/\s*9\)/.test(css));
ok('.cell has aspect-ratio:1', /\.cell \{[^}]*aspect-ratio:\s*1/.test(css));
ok('.cell is flex:none (content cannot resize it)', /\.cell \{[^}]*flex:\s*none/.test(css));
console.log(fail === 0 ? `${pass} checks GREEN` : `${fail} checks FAILED`);
process.exit(fail === 0 ? 0 : 1);
