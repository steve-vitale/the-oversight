#!/usr/bin/env node
// test-alien-name-leak-20261012.js — PROOF: alien disease true names must never
// surface in player-facing narration (docs/DISEASES.md: "Diseases never announce
// their names — only symptoms"; alien diseases are never diagnosable, so their
// true names are unearned knowledge).
//
// BLANK (journey deepening r8, 2026-10-12): six say() strings named the alien
// disease outright — "Lemons engorge" fired 3x in live sim play (seed 71006),
// and "(eurika-sense: no ambush)" / "(East Nile: the flock warns you)" /
// "GRISTLEFIT:" tags would fire on ambush-foils, crow warnings, and the
// gristlefit damage bonus / lash-out. All six rewritten symptom-honest; the
// mechanical clarity ("no ambush", "+25% damage", "+N kcal") is kept.
//
// Checks:
//   A. STATIC: no say()/sysSay()/emit() call in src/js/*.js contains an alien
//      disease true name (case-insensitive).
//   B. BEHAVIORAL: with lemons applied, Game.eat() still narrates the engorge
//      ("drink deeper") but never says "Lemons".
//
// RED-verified: the static check run against pre-fix HEAD's src/js/game.js
// finds all six leaks (see run note); post-fix it finds zero.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ALIEN_NAMES = ['eurika', 'east nile', 'lemons', 'gristlefit', 'howlbelly', 'croakbelly', 'shellgut', 'witness maw', 'flockmind'];

let failures = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS' : 'FAIL') + ' | ' + name + (detail ? ' — ' + detail : ''));
  if (!cond) failures++;
}

// ---- A. static scan of narration calls ----
function narrationHits(jsText) {
  const hits = [];
  const lines = jsText.split('\n');
  // the FIRST string literal passed to say()/sysSay()/emit() — code identifiers
  // on the same line (hasStatus('scholar','gristlefit')) and ${} interpolations
  // (a kcal number, not a name) must not match.
  const CALL = /\b(say|sysSay|emit)\s*\(\s*(`(?:[^`\\]|\\.)*`|'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*")/;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const cix = line.indexOf('//');
    const code = cix >= 0 ? line.slice(0, cix) : line;
    const m = code.match(CALL);
    if (!m) continue;
    const str = m[2].replace(/\$\{[^}]*\}/g, '').toLowerCase();
    for (const nm of ALIEN_NAMES) {
      if (str.includes(nm)) hits.push({ line: i + 1, name: nm, text: line.trim().slice(0, 140) });
    }
  }
  return hits;
}
const jsFiles = fs.readdirSync(path.join(ROOT, 'src', 'js')).filter(f => f.endsWith('.js'));
let allHits = [];
for (const f of jsFiles) {
  const hits = narrationHits(fs.readFileSync(path.join(ROOT, 'src', 'js', f), 'utf8'));
  for (const h of hits) allHits.push({ file: f, ...h });
}
check('A. no alien true names in say()/sysSay()/emit() across src/js', allHits.length === 0,
  allHits.length ? JSON.stringify(allHits.slice(0, 6)) : `${jsFiles.length} files scanned`);

// ---- B. behavioral: lemons engorge narration ----
async function behavioral() {
  const { loadGame, setupGame } = require('./sim-harness');
  const { Game } = await loadGame({ seed: 424242, mode: 'test-alien-name-leak' });
  const said = [];
  const _say = Game.say;
  Game.say = function (...a) { said.push(String(a[0])); try { return _say.apply(this, a); } catch (e) { return a[0]; } };
  await setupGame(Game);
  Game.applyStatus('scholar', 'lemons', { source: 'test' });
  const s = Game.state.scholar;
  s.kcal = 0;
  s.inventory.push({ name: 'test tuber', kcalEach: 100, units: 3, plantId: 'tuber_test', edible: true, spoilDay: 99999 });
  const before = said.length;
  Game.eat();
  const newLines = said.slice(before);
  const engorgeFired = newLines.some(l => /drink deeper/i.test(l));
  const leak = newLines.filter(l => /lemons/i.test(l));
  check('B1. engorge still narrated after eating with lemons', engorgeFired,
    engorgeFired ? newLines.find(l => /drink deeper/i.test(l)).slice(0, 110) : 'no "drink deeper" line; got: ' + newLines.slice(0, 3).join(' | ').slice(0, 160));
  check('B2. no "Lemons" name in eat narration', leak.length === 0,
    leak.length ? leak[0].slice(0, 160) : `${newLines.length} eat lines clean`);
}

behavioral().then(() => {
  console.log(failures === 0 ? '\nALL GREEN' : `\n${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
}).catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
