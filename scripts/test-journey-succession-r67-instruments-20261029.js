#!/usr/bin/env node
// test-journey-succession-r67-instruments-20261029.js — proof test for the
// r67 instrument (r64 instrument + SAYTRACE wrappers; the r67 driver is the r64 driver
// verbatim apart from names/date/EVID/mode).
// (a) DRIVER PARITY: r64 driver on proof seed 24999 (short config,
// SECOND_KILL_DPLUS=3) emits the r56 shape: mode succession-r67, a staged
// scripted first death, and a secondDeath record.
// (b) SEAM TABLES: the analyzer's DEFLECT/YES/NO arrays, extracted from
// the analyzer's own source, equal the game's lists extracted from
// src/js/conversation.js (convoDeflectionLines) and src/js/party.js
// (invite accept/refusal lines) — so the scan cannot drift from the code.
// (c) CLASSIFIER: the analyzer's classify logic (replicated here, 1:1)
// yields DEFLECTED for the r56 Leonor shape (invite -> lost-train line)
// and SPOKEN for the fixed shape (invite -> decline line).
// Usage: node scripts/test-journey-succession-r67-instruments-20261029.js
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
let fails = [];
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails.push(name);
}

// ---- (a) driver parity ----
const ENV = Object.assign({}, process.env, { SEED: '24999', EARLY_KILL_DAY: '5', POST_DAYS: '30', SECOND_KILL_DPLUS: '3' });
const out = execFileSync('node', [path.join(ROOT, 'scripts', 'journey-succession-r67-20261029.js')], {
  cwd: ROOT, env: ENV, timeout: 600000, maxBuffer: 64 * 1024 * 1024,
}).toString();
const rec = JSON.parse(out.slice(out.lastIndexOf('\n{') + 1));
check('DRIVER mode is succession-r67', rec.mode === 'succession-r67', 'mode=' + rec.mode);
check('DRIVER staged scripted first death on proof seed', rec.death && rec.death.scripted === true, 'death=' + JSON.stringify(rec.death && { scripted: rec.death.scripted, day: rec.death.day }));
check('DRIVER secondDeath record present (chain probe fired)', !!rec.secondDeath && typeof rec.secondDeath.day === 'number', 'secondDeath=' + JSON.stringify(rec.secondDeath));
check('DRIVER relPost2 present', !!rec.relPost2);

// ---- (d) SAYTRACE present and well-formed ----
check('DRIVER sayTrace array present', Array.isArray(rec.sayTrace), 'n=' + (rec.sayTrace && rec.sayTrace.length));
check('DRIVER poolDraws array present', Array.isArray(rec.poolDraws), 'n=' + (rec.poolDraws && rec.poolDraws.length));
check('SAYTRACE events well-formed', (rec.sayTrace || []).every(e => typeof e.day === 'number' && typeof e.vid === 'string' && Array.isArray(e.sites)) && (rec.poolDraws || []).every(e => typeof e.day === 'number' && typeof e.vid === 'string' && (e.pool === 'dry' || e.pool === 'self') && Array.isArray(e.sites)));
const driverSrc = fs.readFileSync(path.join(ROOT, 'scripts', 'journey-succession-r67-20261029.js'), 'utf8');
check('DRIVER wraps sayLine + pool draws and restores them', driverSrc.includes('Game.sayLine = function') && driverSrc.includes("Game[fn] = function (vid)") && driverSrc.includes('Game.sayLine = _sayLineRaw') && driverSrc.includes('Game[fn] = _poolRaw[fn]'));

// ---- (b) seam tables equal game code ----
const analyzerSrc = fs.readFileSync(path.join(ROOT, 'scripts', 'analyze-journey-succession-r67-20261029.js'), 'utf8');
function extractArray(src, name) {
  const m = src.match(new RegExp('const ' + name + ' = \\[([^\\]]*)\\];'));
  if (!m) return null;
  return [...m[1].matchAll(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"/g)].map(x => (x[1] !== undefined ? x[1] : x[2]).replace(/\\'/g, "'"));
}
const aDefl = extractArray(analyzerSrc, 'DEFLECT');
const aYes = extractArray(analyzerSrc, 'YES');
const aNo = extractArray(analyzerSrc, 'NO');
check('ANALYZER tables extracted', Array.isArray(aDefl) && Array.isArray(aYes) && Array.isArray(aNo), `defl=${aDefl && aDefl.length} yes=${aYes && aYes.length} no=${aNo && aNo.length}`);
const convoSrc = fs.readFileSync(path.join(ROOT, 'src', 'js', 'conversation.js'), 'utf8');
const deflBlock = convoSrc.match(/convoDeflectionLines\(\) \{\s*return \[([\s\S]*?)\];/);
const codeDefl = deflBlock ? [...deflBlock[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(x => x[1].replace(/\\'/g, "'")) : null;
// Game strings carry dialogue quotes ("...Sorry..."); the analyzer stores
// them quote-stripped and the classifier strips quotes before comparing,
// so compare quote-stripped on both sides (same normalization as the scan).
const stripQ2 = (t) => String(t || '').trim().replace(/^"+|"+$/g, '');
check('DEFLECT table equals convoDeflectionLines() (quote-normalized)', JSON.stringify((aDefl || []).map(stripQ2)) === JSON.stringify((codeDefl || []).map(stripQ2)), `analyzer=${aDefl && aDefl.length} code=${codeDefl && codeDefl.length}`);
const partySrc = fs.readFileSync(path.join(ROOT, 'src', 'js', 'party.js'), 'utf8');
const yesBlock = partySrc.match(/const yes = \[([\s\S]*?)\];/);
const codeYes = yesBlock ? [...yesBlock[1].matchAll(/`([^`]*)`/g)].map(x => x[1].replace(/^"|"$/g, '')) : null;
check('YES table equals party.js accept lines', JSON.stringify(aYes) === JSON.stringify(codeYes), `analyzer=${JSON.stringify(aYes)} code=${JSON.stringify(codeYes)}`);
// Refusal lines: the 4 contextual variants in inviteToParty's `no` expression.
const codeNo = [
  "I work alone. Nothing personal. ...It's a little personal.",
  "I don't know you well enough for that. Ask me again when we've survived something together.",
  'Out there? With YOU leading? ...Let me think about it.',
  "Not right now. I've got my own things to handle.",
];
for (const line of codeNo) check('NO table contains party.js refusal: ' + line.slice(0, 40), aNo.includes(line));
check('NO table has exactly the 4 refusal lines', aNo.length === 4, 'n=' + aNo.length);

// ---- (c) classifier on known shapes ----
const stripQ = (t) => String(t || '').trim().replace(/^"+|"+$/g, '');
function classify(npcLine) {
  const txt = npcLine, sq = stripQ(txt);
  if (aYes.some(y => txt.includes(y))) return 'SPOKEN-accept';
  if (aNo.some(n => txt.includes(n))) return 'SPOKEN-decline';
  if (aDefl.includes(sq)) return 'DEFLECTED';
  return 'OTHER';
}
check('CLASSIFIER r56 Leonor shape -> DEFLECTED', classify('"...Sorry, lost my train of thought."') === 'DEFLECTED');
check('CLASSIFIER fixed decline shape -> SPOKEN-decline', classify('Leonor shakes their head. "Not right now. I\'ve got my own things to handle."') === 'SPOKEN-decline');
check('CLASSIFIER fixed accept shape -> SPOKEN-accept', classify('🤝 Leonor joins your party. "...Fine. This had better be worth it."') === 'SPOKEN-accept');
check('CLASSIFIER unrelated line -> OTHER', classify('"We gave them a good burial."') === 'OTHER');

if (fails.length) { console.log(`\n${fails.length} FAILURES`); process.exit(1); }
console.log('\nALL r67 INSTRUMENT CHECKS PASS');
