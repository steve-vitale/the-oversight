// test-ui-infobar-card-20261014.js — Steve phone report 2026-10-14:
// "Bunch of clashing stuff in the info bar. Part of person chat action card
// needs to be scrolled and it's partially covered. Feels clunky."
//
// Verifies the CSS fixes in src/css/main.css:
// (1) INFO BAR: .ord-status children (.statgrid, .statrow) each span full
//     width on mobile — the 2-col grid squeezed the wave ledger beside the
//     stat chips, colliding text.
// (2) PERSON CARD: .ord-narration .inlinecard uses definite height:100% with
//     no vertical margin — contained in the 184px region, never sliding under
//     the info bar. Sticky header/buttons keep actions reachable.
const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'src', 'css', 'main.css');
const css = fs.readFileSync(cssPath, 'utf8');

let pass = 0, fail = 0;
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('PASS', name); }
  else { fail++; console.log('FAIL', name, detail || ''); }
}

// extract the @media (max-width: 899px) block
function mediaBlock(query) {
  const start = css.indexOf(query);
  if (start < 0) return '';
  let depth = 0; const i = css.indexOf('{', start);
  for (let j = i; j < css.length; j++) {
    if (css[j] === '{') depth++;
    else if (css[j] === '}') { depth--; if (depth === 0) return css.slice(start, j + 1); }
  }
  return '';
}
const mobile = mediaBlock('@media (max-width: 899px)');
ok(mobile.length > 0, 'mobile media block exists');

// (1a) statgrid spans full width of the ord-status grid
ok(/\.ord-status\s*>\s*\.statgrid\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/.test(mobile),
   'statgrid spans full width on mobile');
// (1b) beat rows (wave ledger etc.) span full width
ok(/\.ord-status\s*>\s*\.statrow\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/.test(mobile),
   'statrow spans full width on mobile');
// (1c) statrow has breathing room (it was completely unstyled)
ok(/\.ord-status\s*>\s*\.statrow\s*\{[^}]*font-size:\s*12px/.test(mobile),
   'statrow has readable styling');

// (2a) person card: definite height + no vertical margin + border-box
const cardRule = css.match(/\.ord-narration\s+\.inlinecard\s*\{([^}]*)\}/);
ok(!!cardRule, 'person card containment rule exists');
if (cardRule) {
  const body = cardRule[1];
  ok(/height:\s*100%/.test(body), 'card height:100% (definite, scroll container forms)');
  ok(/margin:\s*0/.test(body), 'card margin:0 (no overflow past region)');
  ok(/overflow-y:\s*auto/.test(body), 'card scrolls internally');
  ok(/box-sizing:\s*border-box/.test(body), 'card border-box (padding inside 184px)');
}
// (2b) sticky header + sticky action buttons still in place
ok(/\.ord-narration\s+\.inlinecard\s+\.inline-head\s*\{[^}]*position:\s*sticky[^}]*top:\s*0/.test(css),
   'card header sticky top');
ok(/\.ord-narration\s+\.inlinecard\s+\.inline-btns\s*\{[^}]*position:\s*sticky[^}]*bottom:\s*0/.test(css),
   'card action buttons sticky bottom');
// (2c) narration region still fixed height (layout stability)
ok(/\.ord-narration\s*\{[^}]*height:\s*184px/.test(css),
   'narration region fixed 184px');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
