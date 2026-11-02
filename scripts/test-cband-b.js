#!/usr/bin/env node
// test-cband-b.js — proof for sim-cband-b.
// Prereg: evidence/2026-11-02/sim-cband-b-prereg.md (committed
// BEFORE any judged leg).
// Census (proof, not judged evidence):
// (a) BFS routes from scripts/destfirst-b-screen.js equal the
// prereg route table for all 8 band destinations (proves the
// judged legs' route env reproduces the stage-2 trips);
// (b) scripts/analyze-cband-b.js on fixture legs in /tmp (never
// the repo): integrity-ok + established-band with strict false
// on an outward attempt veto (originSimOk null, the guard's
// actual behavior for outward vetoes); integrity-ok +
// established-strict true on a homeward attempt veto;
// start-mismatch failure; attempt-not-offered failure; shadow
// hop passing -> not established; REPRO failure; DAY1-IDENTITY
// failure;
// (c) reused files unmodified (driver, analyzers, policies,
// competent.js, src/js untouched by this arm).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { bfsRoute } = require('./destfirst-b-screen');

const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// (a) Prereg route table: [seed, screened origin, dest, route, stage2start].
const BAND = [
  [69702, '0,6', '0,7', '4,5;4,6;3,6;2,6;1,6;0,6', '0,6'],
  [69704, '0,7', '1,7', '4,5;4,6;4,7;3,7;2,7;1,7;0,7', '2,7'],
  [69706, '0,2', '0,1', '3,4;2,4;1,4;0,4;0,3;0,2', '1,1'],
  [69707, '7,3', '8,3', '5,4;6,4;7,4;7,3', '7,3'],
  [69709, '1,2', '1,1', '3,4;2,4;1,4;1,3;1,2', '1,2'],
  [69713, '7,4', '8,4', '5,4;6,4;7,4', '6,4'],
  [69714, '0,4', '0,3', '3,4;2,4;1,4;0,4', '1,4'],
  [69717, '0,4', '0,3', '3,4;2,4;1,4;0,4', '0,4'],
];
for (const [seed, origin, dest, route] of BAND) {
  const [ox, oy] = origin.split(',').map(Number);
  const got = bfsRoute({ x: 4, y: 4 }, { x: ox, y: oy }).map((p) => p.x + ',' + p.y).join(';');
  check('bfs route seed=' + seed + ' origin=' + origin, got === route, 'got ' + got);
  // Attempt hop is outward on every band trip (dest farther from
  // haven (4,4) than the actual day-6 start) — the structural
  // fact behind the prereg's established-strict note.
  const [dx, dy] = dest.split(',').map(Number);
  const [sx, sy] = BAND.find((b) => b[0] === seed)[4].split(',').map(Number);
  const dCur = Math.abs(sx - 4) + Math.abs(sy - 4);
  const dDest = Math.abs(dx - 4) + Math.abs(dy - 4);
  check('attempt outward seed=' + seed, dDest > dCur, 'dCur=' + dCur + ' dDest=' + dDest);
}

// (b) Analyzer on fixture legs.
function hop(fx, fy, tx, ty, simOk, extra) {
  return Object.assign({ from: { x: fx, y: fy }, to: { x: tx, y: ty }, simOk: !!simOk,
    directOk: true, via: null, legs: 0, creditUsed: 0, vetoed: false,
    homeward: false, originSimOk: null, silent: false, shadow: false }, extra || {});
}
function day(loopDay, startPos, endPos, endOk, hops, attempt, afterForced) {
  return { loopDay,
    start: { pos: startPos, haven: { x: 4, y: 4 }, over: false, day: loopDay, kcal: 2000, hydration: 80 },
    forages: [],
    end: { pos: endPos, haven: { x: 4, y: 4 }, over: false, day: loopDay, kcal: 1500, hydration: 80 },
    vetoes: 0, silentVetoes: 0, lateralPasses: 0, creditUses: 0, simChecks: 0,
    beyondUngenerated: 0, homewardVetoes: 0, vetoOriginPass: 0, vetoOriginFail: 0,
    hops, dayEndReturnSim: { ok: endOk, via: null, directOk: true, legs: 0, reason: null, creditUsed: 0, hops: 0, beyondUngenerated: 0 },
    construct: loopDay === 6
      ? { shape: 'C', loopDay: 6, kind: 'attempt', startPos, steps: [], posAfterForced: null, attempt }
      : (loopDay === 5 ? { shape: 'C', loopDay: 5, kind: 'walkout', startPos, steps: [], posAfterForced: afterForced || startPos, attempt: null } : null) };
}
function inst(seed, days) {
  return { seed, policy: 'construct-shadow', days: 30, daysAlive: 30, endReason: 'done', gameDays: 30, days };
}
function d1() { return day(1, { x: 4, y: 4 }, { x: 4, y: 4 }, true, [], null); }
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cband-proof-'));
function runAnalyzer(s, a, dest, origin, stage2start) {
  const sf = path.join(tmp, 's.jsonl'), af = path.join(tmp, 'a.jsonl');
  fs.writeFileSync(sf, JSON.stringify(s) + '\n');
  fs.writeFileSync(af, JSON.stringify(a) + '\n');
  return execFileSync('node', [path.join(ROOT, 'scripts', 'analyze-cband-b.js'),
    '--shadow', sf, '--armed', af, '--dest', dest, '--origin', origin, '--stage2start', stage2start],
    { encoding: 'utf8' });
}
const DEST = '0,7', ORIGIN = '0,6', S2 = '0,6';
// Fixture 1: integrity-ok, outward attempt veto -> band true, strict false.
{
  const att = { hop: '0,6>0,7', attempted: true, moved: false, reason: 'refused' };
  const s = inst(69702, [d1(), day(5, { x: 4, y: 4 }, { x: 0, y: 6 }, false, [], null, { x: 0, y: 6 }),
    day(6, { x: 0, y: 6 }, { x: 0, y: 6 }, false, [hop(0, 6, 0, 7, false)], att)]);
  const a = inst(69702, [d1(), day(5, { x: 4, y: 4 }, { x: 0, y: 6 }, false, [], null, { x: 0, y: 6 }),
    day(6, { x: 0, y: 6 }, { x: 0, y: 6 }, true, [hop(0, 6, 0, 7, false, { vetoed: true, homeward: false, originSimOk: null })], att)]);
  const out = runAnalyzer(s, a, DEST, ORIGIN, S2);
  check('analyzer ok+band outward veto', /INTEGRITY seed=69702 shape=C .* OK/.test(out) && /establishedBand=true establishedStrict=false/.test(out), out);
  check('analyzer repro pass', /REPRO seed=69702 .* PASS/.test(out), out);
}
// Fixture 2: integrity-ok, homeward attempt veto with origin pass -> strict true.
{
  const att = { hop: '2,8>4,8', attempted: true, moved: false, reason: 'refused' };
  const s = inst(69601, [d1(), day(5, { x: 4, y: 4 }, { x: 2, y: 8 }, true, [], null, { x: 2, y: 8 }),
    day(6, { x: 2, y: 8 }, { x: 2, y: 8 }, true, [hop(2, 8, 4, 8, false)], att)]);
  const a = inst(69601, [d1(), day(5, { x: 4, y: 4 }, { x: 2, y: 8 }, true, [], null, { x: 2, y: 8 }),
    day(6, { x: 2, y: 8 }, { x: 2, y: 8 }, true, [hop(2, 8, 4, 8, false, { vetoed: true, homeward: true, originSimOk: true })], att)]);
  const out = runAnalyzer(s, a, '4,8', '2,8', '2,8');
  check('analyzer ok+strict homeward veto', /establishedBand=true establishedStrict=true/.test(out), out);
}
// Fixture 3: start-mismatch failure.
{
  const att = { hop: '0,6>0,7', attempted: true, moved: false, reason: 'refused' };
  const s = inst(69702, [d1(), day(5, { x: 4, y: 4 }, { x: 0, y: 6 }, false, [], null, { x: 0, y: 6 }),
    day(6, { x: 0, y: 6 }, { x: 0, y: 6 }, false, [hop(0, 6, 0, 7, false)], att)]);
  const a = inst(69702, [d1(), day(5, { x: 4, y: 4 }, { x: 3, y: 6 }, true, [], null, { x: 3, y: 6 }),
    day(6, { x: 3, y: 6 }, { x: 3, y: 6 }, true, [], att)]);
  const out = runAnalyzer(s, a, DEST, ORIGIN, S2);
  check('analyzer start-mismatch', /FAIL reason=start-mismatch/.test(out) && /integrityOk=0/.test(out), out);
}
// Fixture 4: attempt-not-offered failure.
{
  const attS = { hop: '0,6>0,7', attempted: true, moved: false, reason: 'refused' };
  const attA = { hop: '0,6>0,7', attempted: false, moved: false, reason: 'not-offered' };
  const s = inst(69702, [d1(), day(5, { x: 4, y: 4 }, { x: 0, y: 6 }, false, [], null, { x: 0, y: 6 }),
    day(6, { x: 0, y: 6 }, { x: 0, y: 6 }, false, [hop(0, 6, 0, 7, false)], attS)]);
  const a = inst(69702, [d1(), day(5, { x: 4, y: 4 }, { x: 0, y: 6 }, false, [], null, { x: 0, y: 6 }),
    day(6, { x: 0, y: 6 }, { x: 0, y: 6 }, true, [], attA)]);
  const out = runAnalyzer(s, a, DEST, ORIGIN, S2);
  check('analyzer attempt-not-offered', /FAIL reason=attempt-not-offered/.test(out), out);
}
// Fixture 5: shadow hop passes -> integrity-ok but not established.
{
  const att = { hop: '0,6>0,7', attempted: true, moved: true, reason: 'ok' };
  const s = inst(69702, [d1(), day(5, { x: 4, y: 4 }, { x: 0, y: 6 }, true, [], null, { x: 0, y: 6 }),
    day(6, { x: 0, y: 6 }, { x: 0, y: 7 }, true, [hop(0, 6, 0, 7, true)], att)]);
  const a = inst(69702, [d1(), day(5, { x: 4, y: 4 }, { x: 0, y: 6 }, true, [], null, { x: 0, y: 6 }),
    day(6, { x: 0, y: 6 }, { x: 0, y: 7 }, true, [hop(0, 6, 0, 7, true)], att)]);
  const out = runAnalyzer(s, a, DEST, ORIGIN, S2);
  check('analyzer hop-pass not established', /OK/.test(out) && /establishedBand=false/.test(out), out);
}
// Fixture 6: REPRO failure (shadow day-6 start != stage-2 start).
{
  const att = { hop: '0,6>0,7', attempted: true, moved: false, reason: 'refused' };
  const s = inst(69702, [d1(), day(5, { x: 4, y: 4 }, { x: 0, y: 6 }, false, [], null, { x: 0, y: 6 }),
    day(6, { x: 2, y: 4 }, { x: 2, y: 4 }, true, [], att)]);
  const a = inst(69702, [d1(), day(5, { x: 4, y: 4 }, { x: 0, y: 6 }, false, [], null, { x: 0, y: 6 }),
    day(6, { x: 2, y: 4 }, { x: 2, y: 4 }, true, [], att)]);
  const out = runAnalyzer(s, a, DEST, ORIGIN, S2);
  check('analyzer repro fail', /REPRO seed=69702 .* FAIL/.test(out), out);
}
// Fixture 7: DAY1-IDENTITY failure (armed day-1 end differs).
{
  const att = { hop: '0,6>0,7', attempted: true, moved: false, reason: 'refused' };
  const d1a = day(1, { x: 4, y: 4 }, { x: 4, y: 3 }, true, [], null);
  const s = inst(69702, [d1(), day(5, { x: 4, y: 4 }, { x: 0, y: 6 }, false, [], null, { x: 0, y: 6 }),
    day(6, { x: 0, y: 6 }, { x: 0, y: 6 }, false, [hop(0, 6, 0, 7, false)], att)]);
  const a = inst(69702, [d1a, day(5, { x: 4, y: 4 }, { x: 0, y: 6 }, false, [], null, { x: 0, y: 6 }),
    day(6, { x: 0, y: 6 }, { x: 0, y: 6 }, true, [hop(0, 6, 0, 7, false, { vetoed: true })], att)]);
  const out = runAnalyzer(s, a, DEST, ORIGIN, S2);
  check('analyzer day1 identity fail', /DAY1-IDENTITY seed=69702 FAIL/.test(out), out);
}

// (c) Reused files unmodified.
const REUSED = ['scripts/analyze-homeward-shapes-b.js', 'scripts/homeconstruct-b-driver.js',
  'scripts/analyze-homeconstruct-b.js', 'scripts/analyze-destfirst-b.js',
  'scripts/destfirst-b-screen.js', 'scripts/destfirst-b-confirm.js',
  'scripts/policies/competent-homewardconstruct-b.js', 'scripts/policies/competent-homewardstep-b.js',
  'scripts/policies/competent.js', 'src/js'];
let gitOut = '';
try {
  gitOut = execFileSync('git', ['status', '--porcelain', '--'].concat(REUSED), { cwd: ROOT, encoding: 'utf8' });
} catch (e) { gitOut = 'ERROR ' + (e && e.message); }
check('reused files unmodified', gitOut.trim() === '', gitOut);

console.log('cband proof: ' + pass + ' pass, ' + fail + ' fail');
process.exit(fail ? 1 : 0);
