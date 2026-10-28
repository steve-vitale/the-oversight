#!/usr/bin/env node
// test-r65-transcript-diff-20261028.js -- journey-landing r65 proof.
// R64's DOCUMENTED GAP #1: the driver prints only r.line per turn, so a
// beat appended to the transcript while a menu is built never reaches the
// saved transcript. The concrete instance: the r64 case-framing line, spoken
// by betrayalCaseFrame inside the convoMenuPage wrap while convoTurn builds
// its returned choices — after the turn's spoken line, before the driver
// prints r.line. The driver never re-reads the transcript mid-sitting.
// R65 FIX (driver-only, zero src/js): after every convoTurn and after
// endConvo, diff the sitting transcript against lines already printed via
// sayThem (quote-normalized, as the verbatim scan normalizes) and print
// each unprinted THEM entry via sayThem, prefixed TRANSCRIPT-DIFF.
// This test proves, on the real engine (shared sim harness):
//   (a) OLD driver logic (opener lines + r.line only) leaves the framing
//       line unprinted on a turn whose returned menu first offers case
//       actions — the gap, reproduced, not asserted away;
//   (b) NEW diff logic prints that framing line exactly once, after the
//       turn line, with no duplicate of r.line or opener beats;
//   (c) the opener path (r48) already prints framing, so the diff there
//       yields nothing — no double-print;
//   (d) a no-case sitting yields no framing from the diff;
//   (e) the r65 driver file actually contains the diff + both call sites
//       (wiring check: definition, after-turn call, after-endConvo call).
'use strict';
process.env.TRIBFLOOR = '1';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS', name); }
  else { fail++; console.log('  FAIL', name, extra ? '-- ' + extra : ''); }
}
const CASE_ACT = (id) => typeof id === 'string' &&
  /^(betrayal:(site|witnesses|investigate|moot|letlie|expose):)/.test(id);
const stripQ = (x) => String(x || '').trim().replace(/^"+|"+$/g, '').trim();
const themOf = (transcript) => (transcript || [])
  .filter(e => e && e.who === 'them').map(e => String(e.text || ''));
// The r65 diff algorithm, copied exactly from the driver (same
// normalization, same printed-set rule): given already-printed lines and a
// transcript slice, return the unprinted THEM entries in order.
function diffLines(printed, transcript, exclude) {
  const seen = new Set(printed.map(stripQ));
  if (exclude) seen.add(stripQ(exclude));
  const out = [];
  for (const t of themOf(transcript)) {
    if (!t.trim() || seen.has(stripQ(t))) continue;
    seen.add(stripQ(t));
    out.push(t);
  }
  return out;
}
function settle(Game, vid) {
  for (let i = 0; i < 8; i++) {
    const c = Game.convoGet(vid);
    if (!c.pendingQ && !c.reactiveQ && !c.genericQ) break;
    const ch = Game.convoChoices(vid).find(x => /^(ans:|react:|gq:)/.test(x.id));
    if (!ch) break;
    Game.convoTurn(vid, ch.id);
  }
}

(async () => {
  const { Game } = await loadGame({ seed: 7782, mode: 'test-r65-transcript-diff' });
  await setupGame(Game);
  Game.say = () => {}; Game.sysSay = () => {}; Game.emit = () => {};
  const me = Game.villagerId;
  const vids = (Game.state.village.roster || []).filter(id => id !== me);
  const [v1, v2, v3] = vids;
  const tname2 = Game.disp(v2);
  const bs = Game.betrayalState();

  // Shape MID: case becomes known, then a turn's returned menu first
  // offers case actions (the 682 d11 wild shape, via the turn path).
  bs.cases.push({ id: 'pcase65', playerRole: 'bystander', status: 'open',
    target: v2, charge: 'murder', accused: [v3], knownToPlayer: false,
    siteExamined: false, witnessesNamed: false, foundBribes: [] });
  const r0 = Game.startConvo(v1);
  settle(Game, v1);
  const openerPrinted = themOf((Game.convoGet(v1).transcript || []));
  const preIds = Game.convoChoices(v1).map(c => c.id);
  ok('MID1 before reveal: no case actions', !preIds.some(CASE_ACT));
  bs.cases[0].knownToPlayer = true;
  // Take a BLIND content turn ('agree') WITHOUT reading the menu first:
  // reading the menu would itself fire the first-framing (the r64 B
  // menu-read shape) and consume it. The driver reads its menus from the
  // previous turn's return, so the true driver shape is a turn whose OWN
  // returned menu first offers case actions — framing appended after the
  // turn line, inside the returned transcript slice.
  const r = Game.convoTurn(v1, 'agree');
  ok('MID2 blind agree turn returned a line', !!r && typeof r.line === 'string',
    'got: ' + JSON.stringify(r && r.line));
  ok('MID3 turn returned', !!r && typeof r.line === 'string');
  const retIds = r ? (r.choices || []).map(c => c.id) : [];
  ok('MID4 returned menu offers case actions', retIds.some(CASE_ACT),
    'got: ' + retIds.slice(0, 8).join(','));
  const retThem = r ? themOf(r.transcript) : [];
  const framing = retThem.filter(t => t.includes('murder') && t.includes(tname2));
  ok('MID5 framing line IS in returned transcript', framing.length === 1,
    'them: ' + retThem.map(s => s.slice(0, 70)).join(' | '));
  // (a) OLD driver logic: opener lines + r.line only.
  const oldPrinted = openerPrinted.concat(r ? [String(r.line || '')] : []);
  ok('MID6a OLD driver leaves framing unprinted (gap reproduced)',
    !oldPrinted.some(t => t.includes('murder') && t.includes(tname2)),
    'old printed: ' + oldPrinted.map(s => s.slice(0, 60)).join(' | '));
  ok('MID6b turn line itself is not the framing line',
    !(String(r.line || '').includes('murder') && String(r.line || '').includes(tname2)));
  // (b) NEW diff logic over the same returned transcript.
  const diff = diffLines(oldPrinted, r.transcript);
  ok('MID7 diff prints framing exactly once',
    diff.filter(t => t.includes('murder') && t.includes(tname2)).length === 1,
    'diff: ' + diff.map(s => s.slice(0, 70)).join(' | '));
  ok('MID8 diff never duplicates r.line or opener beats',
    !diff.some(t => stripQ(t) === stripQ(r.line)) &&
    !diff.some(t => openerPrinted.map(stripQ).includes(stripQ(t))),
    'diff: ' + diff.map(s => s.slice(0, 60)).join(' | '));
  const newPrinted = oldPrinted.concat(diff);
  const frameLine = diff.find(t => t.includes('murder') && t.includes(tname2));
  ok('MID9 framing prints after the turn line in printed order',
    !!frameLine && newPrinted.lastIndexOf(frameLine) > newPrinted.lastIndexOf(String(r.line || '')),
    'printed tail: ' + newPrinted.slice(-3).map(s => s.slice(0, 60)).join(' | '));
  Game.endConvo(v1, 'left');

  // Shape OPEN: opening menu already offers case actions (680 d11 shape).
  // The r48 opener loop prints every startConvo THEM entry, so the diff
  // over the opening transcript must yield nothing.
  bs.cases.length = 0;
  bs.cases.push({ id: 'pcase65b', playerRole: 'juror', status: 'open',
    target: v1, charge: 'ambush', accused: [v2], knownToPlayer: true,
    siteExamined: false, witnessesNamed: false, foundBribes: [] });
  const r0b = Game.startConvo(v1);
  settle(Game, v1);
  const openThem = themOf(Game.convoGet(v1).transcript || []);
  ok('OPEN1 framing in opening transcript (partner is target, first-person)',
    openThem.some(t => t.includes('ambush') && t.includes('against me')),
    'open them: ' + openThem.map(s => s.slice(0, 60)).join(' | '));
  const openDiff = diffLines(openThem, Game.convoGet(v1).transcript || []);
  ok('OPEN2 diff over opener-printed transcript is empty (no double-print)',
    openDiff.length === 0, 'diff: ' + openDiff.map(s => s.slice(0, 60)).join(' | '));
  Game.endConvo(v1, 'left');

  // Shape NOCASE: no case at all — diff yields no framing anywhere.
  bs.cases.length = 0;
  Game.startConvo(v3);
  settle(Game, v3);
  const ncMenu = Game.convoChoices(v3);
  const ncPick = ncMenu.find(c => c && c.id !== 'leave' && c.id !== 'silence');
  const ncPrinted = themOf(Game.convoGet(v3).transcript || []);
  const ncR = ncPick ? Game.convoTurn(v3, ncPick.id) : null;
  const ncOld = ncPrinted.concat(ncR ? [String(ncR.line || '')] : []);
  const ncDiff = ncR ? diffLines(ncOld, ncR.transcript) : [];
  ok('NOCASE diff contains no framing line',
    !ncDiff.some(t => /matter of the|settled the/.test(t)),
    'diff: ' + ncDiff.map(s => s.slice(0, 60)).join(' | '));
  Game.endConvo(v3, 'left');

  // Shape CLOSE: endConvo appends closing beats; the closing line itself
  // is already logged by the driver ("closing line:"), so the post-endConvo
  // diff must exclude it while still surfacing any further closing beat.
  Game.startConvo(v3);
  settle(Game, v3);
  const clPrinted = themOf(Game.convoGet(v3).transcript || []);
  const clR = Game.convoTurn(v3, 'agree');
  const clOld = clPrinted.concat(clR ? [String(clR.line || '')] : []);
  const clEnd = Game.endConvo(v3, 'left');
  const clDiff = diffLines(clOld, Game.convoGet(v3).transcript || [],
    clEnd && clEnd.line);
  ok('CLOSE diff never duplicates the logged closing line',
    !(clEnd && clEnd.line) || !clDiff.some(t => stripQ(t) === stripQ(clEnd.line)),
    'closing: ' + JSON.stringify(clEnd && clEnd.line) + ' diff: ' +
    clDiff.map(x => x.slice(0, 60)).join(' | '));

  // (e) Wiring: the r65 driver file contains the instrument + call sites.
  const driver = fs.readFileSync(
    path.join(__dirname, 'journey-landing-r65-20261028.js'), 'utf8');
  ok('WIRE1 driver defines printTranscriptDiff',
    /const printTranscriptDiff = \(excludeLine\) =>/.test(driver));
  ok('WIRE2 driver calls diff after sayThem(r.line)',
    /sayThem\(r\.line\);\s*\n\s*printTranscriptDiff\(\)/.test(driver));
  ok('WIRE3 driver calls diff after endConvo, excluding the closing line',
    /printTranscriptDiff\(endR && endR\.line\); \/\/ R65: closing beats/.test(driver));
  ok('WIRE4 driver marks diff lines TRANSCRIPT-DIFF',
    /log\('TRANSCRIPT-DIFF:'\)/.test(driver));

  console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e && e.stack || e); process.exit(2); });
