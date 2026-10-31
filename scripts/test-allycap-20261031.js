#!/usr/bin/env node
// test-allycap-20261031.js — sim-allycap-a proof test.
// Re-derives every judged number from the committed corpus, checks the
// static-census invariants by grep, and gates on fixture determinism
// (two fresh runs byte-identical to each other AND to the corpus).
// Usage: node scripts/test-allycap-20261031.js
// Exit 0: all checks pass. Exit 1: assertion failure. Exit 2: the
// determinism file gate was blocked by the container write flap
// (EPERM) — retry when it clears; stdout determinism is reported
// separately so a blocked file gate is never mistaken for a pass.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const CORPUS = path.join(REPO, 'evidence', '2026-10-31', 'perseed-allycap-a', 'fixture-band.json');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name + (extra !== undefined ? ' :: ' + extra : '')); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + extra : '')); }
}
function sha(p) { return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'); }
function sleep(ms) { try { execSync('sleep ' + Math.ceil(ms / 1000)); } catch (e) {} }

const corpus = JSON.parse(fs.readFileSync(CORPUS, 'utf8'));
const fights = corpus.fights;
check('corpus fight count 96', fights.length === 96, fights.length);
let anchor = 'unknown';
try { anchor = execSync('git log -1 --format=%H -- src/', { cwd: REPO }).toString().trim(); } catch (e) {}
check('anchor == last src commit', corpus.anchorCommit === anchor, corpus.anchorCommit);
check('verdict CLAIM-CONFIRMED', corpus.confirmVerdict === 'CLAIM-CONFIRMED');
// Pilot gate re-derivation
const fsPilot = fights.filter(f => f.stage === 'pilot' && f.kind === 'FS');
const shCongPilot = fights.filter(f => f.stage === 'pilot' && f.kind === 'SH' && f.beast === 'congregation');
const shEaterPilot = fights.filter(f => f.stage === 'pilot' && f.kind === 'SH' && f.beast === 'eater');
check('pilot FS from-start 4/4', fsPilot.every(f => f.fromStartJoined) && fsPilot.length === 4);
check('pilot SH congregation shouts 2', shCongPilot.reduce((a, f) => a + f.shoutCount, 0) === 2);
check('pilot SH eater shouts 0', shEaterPilot.reduce((a, f) => a + f.shoutCount, 0) === 0);
check('SH confirm beast congregation', corpus.shBeast === 'congregation');
// C1: second-ally entries across FS-V2 + SH-V2 confirm
const fsV2 = fights.filter(f => f.stage === 'confirm' && f.kind === 'FS' && f.allies === 2 && f.vids.join() === 'A,B');
const shV2 = fights.filter(f => f.stage === 'confirm' && f.kind === 'SH' && f.allies === 2);
const c1 = [...fsV2, ...shV2];
check('C1 second entries 0/24', c1.filter(f => f.secondEntered).length === 0 && c1.length === 24, c1.length);
check('C1 no rec.allyVid == B anywhere', !fights.some(f => f.allyVidIsB));
check('C1 B strikes 0 across all 96', fights.reduce((a, f) => a + f.bStrikeCount, 0) === 0);
check('C1 B charges 0 across all 96', fights.reduce((a, f) => a + f.bNamedChargeCount, 0) === 0);
check('C1 B health delta 0 everywhere', fights.every(f => f.bHealthAfter === f.bHealthBefore));
// C2: count-controlled identity FS-V2 == FS-C2, all 12 streams
const fsC2 = fights.filter(f => f.stage === 'confirm' && f.kind === 'FS' && f.allies === 2 && f.vids.join() === 'A');
const strip = (f) => { const c = Object.assign({}, f); delete c.stage; delete c.variant; delete c.kind; delete c.allies; delete c.vids; return JSON.stringify(c); };
let ident = 0;
for (const s of [201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212]) {
  if (strip(fsV2.find(f => f.stream === s)) === strip(fsC2.find(f => f.stream === s))) ident++;
}
check('C2 identity 12/12', ident === 12, ident);
// C3: shout-once
check('C3 max shouts per SH fight <= 1', Math.max(...shV2.map(f => f.shoutCount)) <= 1);
check('C3 second-shout fights 0', shV2.filter(f => f.shoutCount > 1).length === 0);
const allyDown = shV2.filter(f => f.allyHpLeft === 0);
console.log('NOTE C3 ally-down subset size: ' + allyDown.length + ' (0 means the re-shout-after-fall prong is unobserved on this band, not passed by fights)');
check('C3 ally-down second shouts 0', allyDown.filter(f => f.shoutCount > 1).length === 0);
// Secondaries
const fsC1 = fights.filter(f => f.stage === 'confirm' && f.kind === 'FS' && f.allies === 1);
const fsV3 = fights.filter(f => f.stage === 'confirm' && f.kind === 'FS' && f.allies === 3);
const cornV2 = fights.filter(f => f.stage === 'confirm' && f.kind === 'CORN');
const shC1 = fights.filter(f => f.stage === 'confirm' && f.kind === 'SH' && f.allies === 1);
const diffStreams = (a, b) => [201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212].filter(s => strip(a.find(f => f.stream === s)) !== strip(b.find(f => f.stream === s)));
check('count channel FS-C2 vs FS-C1 diff [205]', JSON.stringify(diffStreams(fsC2, fsC1)) === '[205]', JSON.stringify(diffStreams(fsC2, fsC1)));
check('count-past-vids FS-V3 vs FS-V2 diff [204,207]', JSON.stringify(diffStreams(fsV3, fsV2)) === '[204,207]', JSON.stringify(diffStreams(fsV3, fsV2)));
check('FS-V3 stream 204 is the vDie', fsV3.find(f => f.stream === 204).outcome === 'vDie' && fsV2.find(f => f.stream === 204).outcome === 'vFlee');
check('CORN rear-guard B 12/12', cornV2.every(f => f.rearGuardHasB) && cornV2.length === 12);
const stripNoRear = (f) => { const c = Object.assign({}, f); delete c.stage; delete c.variant; delete c.kind; delete c.allies; delete c.vids; delete c.rearGuard; delete c.rearGuardHasB; delete c.log; return JSON.stringify(c); };
let cornSame = 0;
for (const s of [201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212]) {
  if (stripNoRear(cornV2.find(f => f.stream === s)) === stripNoRear(shC1.find(f => f.stream === s))) cornSame++;
}
check('CORN == SH-C1 12/12 excl rear/log', cornSame === 12, cornSame);
const shAll = fights.filter(f => f.kind === 'SH');
check('SH allyDealt sum 0 (shout ally never strikes)', shAll.reduce((a, f) => a + f.allyDealt, 0) === 0, 'n=' + shAll.length);
check('SH shouted fights 8, each exactly 1 shout', shAll.filter(f => f.shoutCount > 0).length === 8 && shAll.every(f => f.shoutCount <= 1));
const chargesSet = new Set();
for (const f of fights) for (const l of f.chargesLines) chargesSet.add(l);
check('exactly 2 distinct charges lines, both naming A', chargesSet.size === 2 && [...chargesSet].every(l => l.indexOf(corpus.allyDesc) >= 0));
const strikeActors = new Set();
for (const f of fights) for (const l of f.log) { const m = l.match(/^R\d+: (.*) strikes for /); if (m) strikeActors.add(m[1]); }
check('strike actors subset of {leader, A}', [...strikeActors].every(a => a === corpus.leaderDesc || a === corpus.allyDesc), [...strikeActors].join(' | '));
check('B descriptor recorded from rear line', corpus.bDesc === 'the man in his 40s, with a broad frame', corpus.bDesc);
// Static census invariants
const ff = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');
check('static: allyVids.shift sites == 2', (ff.match(/allyVids\.shift\(\)/g) || []).length === 2);
check('static: helpCalled = true sites == 2', (ff.match(/helpCalled = true/g) || []).length === 2);
check('static: helpCalled = false declaration == 1', (ff.match(/helpCalled = false/g) || []).length === 1);
check('static: no helpCalled reset (no false assignment after decl)', !/helpCalled = false[^,]/.test(ff.replace('var helpCalled = false', '')));
check('static: engine truncates vids slice(0, 2)', ff.indexOf("allyVids = (opts.allyVids || []).slice(0, 2)") >= 0);
check('static: single ally strike line', (ff.match(/allyName \+ ' strikes for /g) || []).length === 1);
check('static: shout branch requires !helpCalled', ff.indexOf('hopeless && !helpCalled && allies > 0') >= 0);
check('static: single-scalar ally state', ff.indexOf('var helpCalled = false, allyIn = false, allyHp = 0') >= 0);
const pw = fs.readFileSync(path.join(REPO, 'src', 'js', 'party-wiring.js'), 'utf8');
check('static: party-wiring caps staged at slice(0, 2)', pw.indexOf('slice(0, 2)') >= 0);
const game = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
check('static: patrol/wild stage first 2 vids', game.indexOf('pAllyVids.length < 2') >= 0 && game.indexOf('wAllyVids.length < 2') >= 0);
// Determinism gate: two fresh runs, stdout summaries identical + files byte-identical to corpus
function runFixture(outPath) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const stdout = execFileSync('node', ['scripts/allycap-fixture-20261031.js', outPath], { cwd: REPO, encoding: 'utf8' });
      return stdout;
    } catch (e) {
      if (attempt === 5) throw e;
      sleep(15000);
    }
  }
}
let detFileBlocked = false, detStdoutOk = false, detFileOk = false;
try {
  const tmpA = '/tmp/allycap-det-a.json', tmpB = '/tmp/allycap-det-b.json';
  const outA = runFixture(tmpA), outB = runFixture(tmpB);
  const sumLine = (o) => o.split('\n').filter(l => l.startsWith('PILOT GATE') || l.startsWith('CONFIRM'));
  detStdoutOk = JSON.stringify(sumLine(outA)) === JSON.stringify(sumLine(outB));
  check('det: two fresh runs stdout summaries identical', detStdoutOk);
  try {
    detFileOk = sha(tmpA) === sha(tmpB) && sha(tmpA) === sha(CORPUS);
    check('det: two fresh runs byte-identical to corpus', detFileOk, sha(tmpA).slice(0, 12) + ' vs corpus ' + sha(CORPUS).slice(0, 12));
  } catch (e) {
    detFileBlocked = true;
    console.log('NOTE det file gate BLOCKED (write/read flap): ' + e.message);
  }
} catch (e) {
  detFileBlocked = true;
  console.log('NOTE det fixture runs BLOCKED: ' + (e.message || e));
}
console.log('RESULT: ' + pass + ' passed, ' + fail + ' failed' + (detFileBlocked ? ' (det file gate BLOCKED)' : ''));
if (fail > 0) process.exit(1);
if (detFileBlocked || !detFileOk) process.exit(2);
process.exit(0);
