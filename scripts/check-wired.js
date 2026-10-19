#!/usr/bin/env node
// scripts/check-wired.js — "built but never connected" detector.
//
// The repeat failure in this codebase: a feature is written + proven by a
// script, but nothing in src/ ever calls it (godhood capstones 10-13,
// npcGrantAbility 10-09, onPathLived/godpaths 10-14). This lists functions
// defined in the given src files that have NO reference anywhere in src/
// other than their own definition.
//
//   node scripts/check-wired.js src/js/godpath.js src/js/buildarounds.js
//   node scripts/check-wired.js --strict src/js/godpath.js   # exit 1 if any
//
// Exempt a deliberate entry point (UI-only, debug, data hook called by name)
// by putting `// wired-exempt: <reason>` on its definition line.
// Heuristic, not a parser: false negatives are possible (a name that also
// is shared by unrelated code can count as a reference). Comments and a
// defining module's own export list never prove a caller. Runtime proof is
// still required: a data reference alone does not establish useful execution.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = process.env.CHECK_WIRED_ROOT || path.join(__dirname, '..');

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const files = args.filter(a => !a.startsWith('--'));
if (!files.length) { console.log('usage: check-wired.js [--strict] <src files...>'); process.exit(2); }

function walk(d, out) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out); else if (p.endsWith('.js')) out.push(p);
  }
  return out;
}
const dataDir = path.join(ROOT, 'src/data');
const dataFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.json')).map(f => path.join(dataDir, f));
const srcFiles = walk(path.join(ROOT, 'src/js'), []).concat([path.join(ROOT, 'index.html')], dataFiles);
function commentless(txt) {
  return txt.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:'"\\])\/\/[^\n]*/g, '$1');
}
function selfText(txt) {
  return commentless(txt).replace(/(?:[\w$]+\.)*[\w$]+\s*=\s*\{[\s\w$,:]*\}/g, ' ');
}
const corpus = srcFiles.map(f => {
  const txt = fs.readFileSync(f, 'utf8');
  return { f, txt: commentless(txt), self: selfText(txt) };
});

// Definitions: `name: function`, `name(args) {` (method shorthand), `function name(`.
const DEF_RES = [
  /^\s*([A-Za-z_$][\w$]*)\s*:\s*(?:async\s+)?function\b/,
  /^\s{2,8}(?:async\s+)?([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{\s*(?:\/\/.*)?$/,
  /^\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/,
];
const SKIP = new Set(['if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'constructor']);

let unwired = 0;
for (const rel of files) {
  const abs = path.resolve(ROOT, rel);
  const lines = fs.readFileSync(abs, 'utf8').split('\n');
  const found = [];
  lines.forEach((ln, i) => {
    if (/wired-exempt/.test(ln)) return;
    for (const re of DEF_RES) {
      const m = ln.match(re);
      if (m && !SKIP.has(m[1])) { found.push({ name: m[1], line: i + 1 }); break; }
    }
  });
  const dead = [];
  for (const d of found) {
    const re = new RegExp('\\b' + d.name.replace(/\$/g, '\\$') + '\\b', 'g');
    let refs = 0;
    for (const { f, txt, self } of corpus) {
      const n = ((f === abs ? self : txt).match(re) || []).length;
      refs += f === abs ? n - 1 : n; // minus the definition itself
    }
    if (refs <= 0) dead.push(d);
  }
  unwired += dead.length;
  console.log(`${rel}: ${found.length} functions, ${dead.length} with no caller in src/`);
  for (const d of dead) console.log(`  UNWIRED ${d.name}  (${rel}:${d.line})`);
}
console.log(`\ncheck-wired: ${unwired} unwired`);
process.exitCode = strict && unwired ? 1 : 0;
