// scripts/test-journey-scale-r40-want.js — journey-scale r40 proof test.
// Static: the r40 driver carries the subject-first variant and a mode-split
// EVIDIR; the r40 analyzer carries the WANT section and the tightened
// TABLE-VOICED filter (pellet + feast decoys excluded).
// Functional: the analyzer runs on a synthetic EVIDIR (tmpdir fixtures, not
// the repo) and must (a) report subjectPicked/aliveWantPicked/wantLexiconHits
// correctly for a subject-first seek_taken transcript vs a control ask_favor
// treadmill transcript, and (b) count exactly 1 TABLE-VOICED line when the
// capture holds one true table line plus both decoy lines.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const assert = require('assert');
const ROOT = path.join(__dirname, '..');
const driver = fs.readFileSync(path.join(ROOT, 'scripts', 'journey-scale-r40-20261026.js'), 'utf8');
const analyzer = fs.readFileSync(path.join(ROOT, 'scripts', 'analyze-scale-r40-20261026.js'), 'utf8');
// Static contract.
assert(driver.includes("SUBJECT_FIRST && turn === 0"), 'driver: subject-first guard missing');
assert(driver.includes("dlg:subject"), 'driver: dlg:subject guard missing');
assert(driver.includes("journey-scale-r40-' + (SUBJECT_FIRST ? 'subject' : 'control')"), 'driver: mode-split EVIDIR missing');
assert(driver.includes("picker: ${SUBJECT_FIRST ? 'subject-first' : 'control'}"), 'driver: picker header missing');
assert(analyzer.includes('WANT ${tf}'), 'analyzer: WANT section missing');
assert(analyzer.includes('does not come out|burns hotter'), 'analyzer: tightened filter exclusions missing');
// Synthetic EVIDIR.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'journey-scale-r40-proof-'));
const census = { seed: 99901, day: 181, over: false, popAlive: 3, popTotal: 3,
  scaleRank: 'regional', nationalDay: null, globalDay: null, villageTotal: 0,
  villageKnownEnd: 0, proposedLead: 0, proposedPeer: 0, pilgrimages: 4,
  climbStudies: 0, courtPoorDays: 0, pilgrimagesPoor: 0, proposedPeerPoor: 0,
  pantryKcal: 1000, nationalLive: false, links: [], villageWatch: [],
  hungerWatch: [], trustWatch: [], trustEvents: [], trustSetLog: [],
  tableWatch: [], betrayWatch: [], betraySubjects: {}, deathLog: [] };
fs.writeFileSync(path.join(dir, 'journey-scale-r40-trust-99901.json'), JSON.stringify({ census }, null, 1));
fs.writeFileSync(path.join(dir, 'journey-scale-r40-capture-99901.txt'), [
  'The table is being set — a lesser seat, priced for what you built.',
  'It does not come out — the pellet hums where the fire should be.',
  'Arc IV burns hotter, fed on the feast surge.',
].join('\n'));
fs.writeFileSync(path.join(dir, 'journey-scale-r40-transcript-99901-day90.txt'), [
  '=== seed 99901 day 90 — conversation with Testy (gen_test) ===',
  'occupation=florist temperament=dry trust=73 dead=false',
  'want: seek_taken (stage 0)',
  'picker: subject-first',
  '',
  'THEM: "I don\'t know what to do with my hands today."',
  '(turn0 choices: dlg:comfort, dlg:subject, leave)',
  'YOU: [dlg:subject] "Can I ask you something else?"',
  'THEM: "Have you heard anything? About the taken. The pods. Anything at all."',
  'YOU: [alive:want:seek_taken] (listen)',
  'THEM: "Hassan headed out to forage."',
  'closing line: "Thanks for listening."',
].join('\n'));
fs.writeFileSync(path.join(dir, 'journey-scale-r40-transcript-99901-day120.txt'), [
  '=== seed 99901 day 120 — conversation with Testy2 (gen_test2) ===',
  'occupation=mechanic temperament=anxious trust=90 dead=false',
  'want: ask_favor (stage 2)',
  'picker: control',
  '',
  'THEM: "Today\'s just heavy."',
  '(turn0 choices: dlg:comfort, dlg:subject, leave)',
  'YOU: [dlg:comfort] "Are you okay?"',
  'THEM: "You\'re kind."',
  'YOU: [ask:gossip] "Any good gossip?"',
  'THEM: "Yuki headed out to check the snares."',
  'YOU: [dlg:more] "Tell me more."',
  'THEM: "Mara headed out to check the snares."',
  'closing line: "Sorry. I need a minute."',
].join('\n'));
const out = execFileSync('node', [path.join(ROOT, 'scripts', 'analyze-scale-r40-20261026.js'), dir], { encoding: 'utf8' });
const want90 = out.split('\n').find(l => l.includes('WANT journey-scale-r40-transcript-99901-day90'));
const want120 = out.split('\n').find(l => l.includes('WANT journey-scale-r40-transcript-99901-day120'));
assert(want90, 'analyzer: no WANT line for day90 transcript\n' + out);
assert(want120, 'analyzer: no WANT line for day120 transcript\n' + out);
assert(/subjectPicked=true/.test(want90), 'subject transcript must report subjectPicked=true: ' + want90);
assert(/aliveWantPicked=true/.test(want90), 'subject transcript must report aliveWantPicked=true: ' + want90);
assert(/wantLexiconHits=[1-9]/.test(want90), 'subject transcript must hit seek_taken lexicon: ' + want90);
assert(/subjectPicked=false/.test(want120), 'control transcript must report subjectPicked=false: ' + want120);
assert(/gossipTHEM=2\/4/.test(want120), 'control transcript must count 2 gossip THEM lines of 4: ' + want120);
assert(/wantLexiconHits=0/.test(want120), 'control treadmill transcript must hit ask_favor lexicon 0 times: ' + want120);
const voiced = out.match(/TABLE-VOICED lines=(\d+)/);
assert(voiced && voiced[1] === '1', 'tightened filter must count exactly 1 table line (decoys excluded), got: ' + (voiced && voiced[0]));
console.log('test-journey-scale-r40-want: PASS (static + synthetic-EVIDIR functional)');
