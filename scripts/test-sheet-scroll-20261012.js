// Proof: sheet scroll containment + chat readability CSS contract.
// Steve 2026-10-12: bottom sheet item cut off on mobile (no scroll);
// chat hard to read on mobile (two surfaces).
// Parses src/css/main.css and asserts the declarations that make
// choice-heavy sheets scroll internally instead of clipping below the fold,
// and that chat typography meets the readability floor.
const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'src', 'css', 'main.css');
const raw = fs.readFileSync(cssPath, 'utf8');
// strip comments
const css = raw.replace(/\/\*[\s\S]*?\*\//g, '');

// collect all rules: selector -> array of declaration maps (in source order)
const rules = [];
const re = /([^{}]+)\{([^{}]*)\}/g;
let m;
while ((m = re.exec(css))) {
  const sel = m[1].trim().replace(/\s+/g, ' ');
  const decls = {};
  for (const part of m[2].split(';')) {
    const i = part.indexOf(':');
    if (i < 0) continue;
    decls[part.slice(0, i).trim().toLowerCase()] = part.slice(i + 1).trim().toLowerCase();
  }
  rules.push({ sel, decls });
}
const bySel = s => rules.filter(r => r.sel === s);

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}
function lastDecl(s, prop) {
  const rs = bySel(s);
  for (let i = rs.length - 1; i >= 0; i--) if (rs[i].decls[prop] !== undefined) return rs[i].decls[prop];
  return undefined;
}
function shrinkOf(s) {
  const f = lastDecl(s, 'flex');
  if (f) {
    // flex: <grow> <shrink> <basis>
    const parts = f.split(/\s+/);
    if (parts.length >= 2 && /^\d/.test(parts[1])) return parseFloat(parts[1]);
    return 1; // flex: 1 etc.
  }
  const fs2 = lastDecl(s, 'flex-shrink');
  return fs2 === undefined ? 1 : parseFloat(fs2);
}

console.log('sheet scroll containment:');
// 1. .sheet is a capped flex column
check('.sheet display:flex column', lastDecl('.sheet', 'display') === 'flex' &&
  lastDecl('.sheet', 'flex-direction') === 'column');
check('.sheet max-height 82vh', (lastDecl('.sheet', 'max-height') || '').includes('82vh'));
// 2. .sheet-body can shrink and scrolls
check('.sheet-body overflow-y:auto', (lastDecl('.sheet-body', 'overflow-y') || '').includes('auto'));
check('.sheet-body min-height:0', lastDecl('.sheet-body', 'min-height') === '0');
check('.sheet-body flex-shrink != 0', shrinkOf('.sheet-body') !== 0,
  'flex-shrink=' + shrinkOf('.sheet-body'));
// 3. .sheet-btns: THE BUG — must be shrinkable + scrollable, never flex-shrink:0
check('.sheet-btns overflow-y:auto', (lastDecl('.sheet-btns', 'overflow-y') || '').includes('auto'));
check('.sheet-btns min-height:0', lastDecl('.sheet-btns', 'min-height') === '0');
check('.sheet-btns flex-shrink != 0 (was the cut-off bug)', shrinkOf('.sheet-btns') !== 0,
  'flex-shrink=' + shrinkOf('.sheet-btns'));
// 4. no rule reintroduces flex-shrink:0 on .sheet-btns
// (flex: 0 1 auto is fine — the 0 there is flex-GROW, shrink is the 2nd value)
function shrinkDeclZero(decls) {
  if (decls['flex-shrink'] === '0') return true;
  const f = decls['flex'] || '';
  const parts = f.split(/\s+/);
  return parts.length >= 2 && /^\d/.test(parts[1]) && parseFloat(parts[1]) === 0;
}
const bad = bySel('.sheet-btns').filter(r => shrinkDeclZero(r.decls));
check('no .sheet-btns rule sets flex-shrink:0', bad.length === 0, bad.length + ' bad rule(s)');
// 5. button area capped so a huge list can't starve head+body
const mh = lastDecl('.sheet-btns', 'max-height') || '';
check('.sheet-btns has max-height cap', /vh$/.test(mh), 'max-height=' + (mh || '(none)'));

console.log('chat readability:');
const px = v => parseFloat(v);
check('.chat-bubble font-size >= 17px', px(lastDecl('.chat-bubble', 'font-size')) >= 17,
  lastDecl('.chat-bubble', 'font-size'));
check('.chat-bubble line-height >= 1.6', parseFloat(lastDecl('.chat-bubble', 'line-height')) >= 1.6,
  lastDecl('.chat-bubble', 'line-height'));
check('.chat-name opacity >= 0.75', parseFloat(lastDecl('.chat-name', 'opacity')) >= 0.75,
  lastDecl('.chat-name', 'opacity'));
check('.chat-narr .narr opacity >= 0.75', parseFloat(lastDecl('.chat-narr .narr', 'opacity')) >= 0.75,
  lastDecl('.chat-narr .narr', 'opacity'));
check('.dialogue-box font-size >= 16px', px(lastDecl('.dialogue-box', 'font-size')) >= 16,
  lastDecl('.dialogue-box', 'font-size'));
check('.dialogue-box line-height >= 1.55', parseFloat(lastDecl('.dialogue-box', 'line-height')) >= 1.55,
  lastDecl('.dialogue-box', 'line-height'));
check('.dlg-speaker font-size >= 14px', px(lastDecl('.dlg-speaker', 'font-size')) >= 14,
  lastDecl('.dlg-speaker', 'font-size'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
