// test-journey-deepening-r88-instruments-20261103.js -- PROOF TEST for the
// r88 deepening instruments (driver-only, zero src/js). Static marker checks
// on the r88 driver + scanTranscript fixtures on synthetic transcript text.
// Usage: node scripts/test-journey-deepening-r88-instruments-20261103.js
// Exit 0: all pass. Exit 1: any fail. Writes nothing.
'use strict';
const fs = require('fs');
const path = require('path');
const DRIVER = path.join(__dirname, 'journey-deepening-r88-20261103.js');
const ANALYZER = path.join(__dirname, 'analyze-journey-deepening-r88-20261103.js');
let fail = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fail++; };
const src = fs.readFileSync(DRIVER, 'utf8');
check('(a) driver carries r88 outputs + prereg + offered logging',
  src.includes('journey-deepening-r88-seed${seed}.json') &&
  src.includes('journey-deepening-r88-transcript-') &&
  src.includes('journey-deepening-r88-prereg.md') &&
  src.includes('(offered=') &&
  src.includes('resolution=${w.resolution') &&
  src.includes('shipFights') && src.includes('runConversation'));
check('(a2) no r87 output filenames left',
  !src.includes('journey-deepening-r87-seed') && !src.includes('journey-deepening-r87-transcript-'));
check('(a3) seeds 93101-93104 + EVIDIR 2026-11-03',
  src.includes('[93101, 93102, 93103, 93104]') && src.includes("'evidence', '2026-11-03'"));
check('(a4) picker still engage-first with dlg:commit (the loop-finding picker)',
  src.includes("'dlg:commit'") && src.includes('function pickChoice'));
const anaSrc = fs.readFileSync(ANALYZER, 'utf8');
check('(b) analyzer exports scanTranscript + reads r88 files',
  anaSrc.includes('module.exports = { scanTranscript }') && anaSrc.includes('journey-deepening-r88-transcript-') &&
  anaSrc.includes('journey-deepening-r88-seed'));
const { scanTranscript } = require(ANALYZER);
const clean = [
  '=== seed 93101 day 45 — conversation with Ada (v1) ===',
  'want: ask_favor (stage 2)',
  'THEM: "I need help with the snares."',
  '(offered=dlg:help,dlg:commit,leave)',
  'YOU: [dlg:help] "How can I help?"',
  'THEM: "Like I said -- I could really use the help."',
  '(want=ask_favor stage=2 resolution=none)',
  '(offered=dlg:commit,leave)',
  'YOU: [dlg:commit] "I\'ll do it."',
  'THEM: "Thank you. Seriously — thank you."',
  '(want=ask_favor stage=3 resolution=promised)',
  'YOU: (leave)',
  'want final: id=ask_favor stage=3 resolution=promised',
].join('\n');
const sc = scanTranscript(clean);
check('(c) clean transcript: no loop, no reoffer, 1 commit press, 0 refused',
  !sc.loop && !sc.reofferAfterRefusal && sc.commitPresses === 1 && sc.refusedCommits === 0,
  JSON.stringify(sc));
const loopy = [
  'THEM: "That night is over."',
  '(offered=dlg:commit,leave)',
  'YOU: [dlg:commit] "I\'ll do it."',
  'THEM: "That night is over."',
  '(want=ask_favor stage=2 resolution=none)',
  '(offered=dlg:commit,leave)',
  'YOU: [dlg:commit] "I\'ll do it."',
  'THEM: "That night is over."',
  '(want=ask_favor stage=2 resolution=none)',
  'want final: id=ask_favor stage=2 resolution=none',
].join('\n');
const sl = scanTranscript(loopy);
check('(d) verbatim loop transcript: loop flagged, maxRepeat 3',
  sl.loop && sl.maxRepeat === 3 && sl.refusedCommits === 2, JSON.stringify(sl));
const reoffer = [
  'THEM: "That night is over."',
  '(offered=dlg:commit,leave)',
  'YOU: [dlg:commit] "I\'ll do it."',
  'THEM: "That night is over."',
  '(want=ask_favor stage=3 resolution=stated)',
  '(offered=dlg:commit,leave)',
  'YOU: [dlg:commit] "I\'ll do it."',
  'THEM: "I know — you already said. I\'m counting on it."',
  '(want=ask_favor stage=3 resolution=stated)',
  'want final: id=ask_favor stage=3 resolution=stated',
].join('\n');
const sr = scanTranscript(reoffer);
check('(e) refused commit + later re-offer: reoffer flagged, refused 1',
  sr.reofferAfterRefusal && sr.refusedCommits === 1 && !sr.loop, JSON.stringify(sr));
const refusedNoReoffer = [
  'THEM: "That night is over."',
  '(offered=dlg:commit,leave)',
  'YOU: [dlg:commit] "I\'ll do it."',
  'THEM: "That night is over."',
  '(want=ask_favor stage=3 resolution=stated)',
  '(offered=dlg:more,leave)',
  'YOU: [dlg:more] "Tell me more."',
  'THEM: "More, then."',
  '(want=ask_favor stage=3 resolution=stated)',
  'want final: id=ask_favor stage=3 resolution=stated',
].join('\n');
const sn = scanTranscript(refusedNoReoffer);
check('(f) refused commit with no re-offer: refused counted, no reoffer flag',
  !sn.reofferAfterRefusal && sn.refusedCommits === 1 && !sn.loop, JSON.stringify(sn));
console.log(fail === 0 ? 'ALL PASS' : fail + ' FAILURES');
process.exit(fail === 0 ? 0 : 1);
