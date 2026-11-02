#!/usr/bin/env node
// test-destfirst-b.js — proof for sim-destfirst-b.
// Prereg: evidence/2026-11-02/sim-destfirst-b-prereg.md.
// Census (proof, not judged evidence): screener classification
// (A-LAT / A-POCKET / C-PAIR from fixture E-maps); BFS route
// shape (adjacent steps, endpoints, determinism); generalized
// analyzer on fixture legs (A ok+established, A vetoed-walkout
// failure, C ok+established, C attempt-not-offered failure —
// with NON-homewardac destinations, proving no hardcoding);
// screening band outside the banned set; reused files
// unmodified. Fixtures live in /tmp (never the repo).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { classifyState, bfsRoute } = require('./destfirst-b-screen');

const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

// (a) screener classification from a fixture E-map.
const emap = {
  '4,4': { ok: true, directOk: true, via: 'direct', legs: 0, reason: null },
  '5,4': { ok: true, directOk: false, via: 'lateral', legs: 1, reason: null },
  '6,4': { ok: false, directOk: false, via: null, legs: 4, reason: 'lateral-cap' },
  '5,5': { ok: true, directOk: true, via: 'direct', legs: 0, reason: null },
  '9,9': { error: 'boom' },
};
const cls = classifyState(emap);
check('classify aLat', JSON.stringify(cls.aLat) === JSON.stringify(['5,4']), JSON.stringify(cls.aLat));
check('classify aPocket', JSON.stringify(cls.aPocket) === JSON.stringify(['6,4']), JSON.stringify(cls.aPocket));
check('classify cPairs', cls.cPairs.some((p) => p.origin === '5,4' && p.dest === '6,4') &&
  !cls.cPairs.some((p) => p.dest === '5,4'), JSON.stringify(cls.cPairs));
check('classify skips error tiles', !cls.aLat.includes('9,9') && !cls.aPocket.includes('9,9'));

// (b) BFS route shape.
const route = bfsRoute({ x: 4, y: 4 }, { x: 7, y: 1 });
check('bfs length manhattan', route.length === 6, JSON.stringify(route));
check('bfs endpoints+adjacent', route[route.length - 1].x === 7 && route[route.length - 1].y === 1 &&
  route.every((p, i) => {
    const prev = i === 0 ? { x: 4, y: 4 } : route[i - 1];
    return Math.abs(p.x - prev.x) + Math.abs(p.y - prev.y) === 1;
  }), JSON.stringify(route));
check('bfs deterministic', JSON.stringify(bfsRoute({ x: 4, y: 4 }, { x: 7, y: 1 })) === JSON.stringify(route));
check('bfs same-tile empty', bfsRoute({ x: 4, y: 4 }, { x: 4, y: 4 }).length === 0);

// (c) generalized analyzer on fixture legs (generic destinations).
function hop(fx, fy, tx, ty, simOk, extra) {
  return Object.assign({ from: { x: fx, y: fy }, to: { x: tx, y: ty }, simOk: !!simOk,
    directOk: true, via: null, legs: 0, creditUsed: 0, vetoed: false,
    homeward: false, originSimOk: null, silent: false, shadow: false }, extra || {});
}
function day(loopDay, startPos, endPos, endOk, hops, extra) {
  return Object.assign({ loopDay, start: { pos: startPos, haven: { x: 4, y: 4 }, over: false, day: loopDay, kcal: 2000, hydration: 80 },
    forages: [], end: { pos: endPos, haven: { x: 4, y: 4 }, over: false, day: loopDay, kcal: 1500, hydration: 80 },
    vetoes: 0, silentVetoes: 0, lateralPasses: 0, creditUses: 0, simChecks: 0, beyondUngenerated: 0,
    homewardVetoes: 0, vetoOriginPass: 0, vetoOriginFail: 0, hops: hops || [],
    dayEndReturnSim: { ok: endOk, via: endOk ? 'direct' : null, directOk: endOk, legs: 0, reason: null, creditUsed: 0, hops: 0, beyondUngenerated: 0 },
    construct: null }, extra || {});
}
function homeDay(loopDay) {
  return day(loopDay, { x: 4, y: 4 }, { x: 4, y: 4 }, true, []);
}
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'destfirst-proof-'));
function write(name, obj) {
  const f = path.join(tmp, name);
  fs.writeFileSync(f, JSON.stringify(obj) + '\n');
  return f;
}
function runAnalyzer(args) {
  try { return execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'analyze-destfirst-b.js')].concat(args), { encoding: 'utf8' }); }
  catch (e) { return (e.stdout || '') + '\n' + (e.stderr || ''); }
}
// A fixtures, destination (6,4) — NOT the homewardac (7,1).
const aWalkHops = [hop(4, 4, 5, 4, true), hop(5, 4, 6, 4, true)];
const aShadow = { seed: 69701, policy: 'construct-shadow', days: [homeDay(1), homeDay(2), homeDay(3), homeDay(4),
  day(5, { x: 4, y: 4 }, { x: 6, y: 4 }, false, aWalkHops,
    { construct: { shape: 'A', loopDay: 5, kind: 'walkout', startPos: { x: 4, y: 4 },
      steps: [{ to: { x: 5, y: 4 }, attempted: true, moved: true, reason: 'ok' }, { to: { x: 6, y: 4 }, attempted: true, moved: true, reason: 'ok' }],
      posAfterForced: { x: 6, y: 4 }, attempt: null } })], sayLines: [] };
const aArmed = { seed: 69701, policy: 'construct-armed', days: [homeDay(1), homeDay(2), homeDay(3), homeDay(4),
  day(5, { x: 4, y: 4 }, { x: 5, y: 4 }, true,
    aWalkHops.concat([hop(6, 4, 5, 4, false, { vetoed: true, homeward: true, originSimOk: true })]),
    { homewardVetoes: 1, vetoOriginPass: 1,
      construct: { shape: 'A', loopDay: 5, kind: 'walkout', startPos: { x: 4, y: 4 },
        steps: [{ to: { x: 5, y: 4 }, attempted: true, moved: true, reason: 'ok' }, { to: { x: 6, y: 4 }, attempted: true, moved: true, reason: 'ok' }],
        posAfterForced: { x: 6, y: 4 }, attempt: null } })], sayLines: [] };
const aArmedVetoed = JSON.parse(JSON.stringify(aArmed));
aArmedVetoed.days[4].construct.posAfterForced = { x: 5, y: 4 };
// C fixtures, destination (3,6) — NOT the homewardac (4,8).
const cShadow = { seed: 69702, policy: 'construct-shadow', days: [homeDay(1), homeDay(2), homeDay(3), homeDay(4),
  day(5, { x: 4, y: 4 }, { x: 2, y: 6 }, true, [],
    { construct: { shape: 'C', loopDay: 5, kind: 'walkout', startPos: { x: 4, y: 4 }, steps: [],
      posAfterForced: { x: 2, y: 6 }, attempt: null } }),
  day(6, { x: 2, y: 6 }, { x: 2, y: 6 }, true, [hop(2, 6, 3, 6, false, { homeward: true })],
    { construct: { shape: 'C', loopDay: 6, kind: 'attempt', startPos: { x: 2, y: 6 }, steps: [],
      posAfterForced: { x: 2, y: 6 },
      attempt: { hop: '2,6>3,6', attempted: true, moved: false, reason: 'refused' } } })], sayLines: [] };
const cArmed = { seed: 69702, policy: 'construct-armed', days: [homeDay(1), homeDay(2), homeDay(3), homeDay(4),
  day(5, { x: 4, y: 4 }, { x: 2, y: 6 }, true, [],
    { construct: { shape: 'C', loopDay: 5, kind: 'walkout', startPos: { x: 4, y: 4 }, steps: [],
      posAfterForced: { x: 2, y: 6 }, attempt: null } }),
  day(6, { x: 2, y: 6 }, { x: 2, y: 6 }, true, [hop(2, 6, 3, 6, false, { vetoed: true, homeward: true, originSimOk: true })],
    { homewardVetoes: 1, vetoOriginPass: 1,
      construct: { shape: 'C', loopDay: 6, kind: 'attempt', startPos: { x: 2, y: 6 }, steps: [],
        posAfterForced: { x: 2, y: 6 },
        attempt: { hop: '2,6>3,6', attempted: true, moved: false, reason: 'refused' } } })], sayLines: [] };
const cArmedNoAttempt = JSON.parse(JSON.stringify(cArmed));
cArmedNoAttempt.days[5].construct.attempt = { hop: '2,6>3,6', attempted: false, moved: false, reason: 'not-offered' };

const fAS = write('a-shadow.jsonl', aShadow), fAA = write('a-armed.jsonl', aArmed);
const fAV = write('a-armed-vetoed.jsonl', aArmedVetoed);
const fCS = write('c-shadow.jsonl', cShadow), fCA = write('c-armed.jsonl', cArmed);
const fCN = write('c-armed-noattempt.jsonl', cArmedNoAttempt);
const outA = runAnalyzer(['--shadow', fAS, '--armed', fAA, '--shape', 'A', '--dest', '6,4']);
check('analyzer A integrity ok+established', outA.includes('INTEGRITY seed=69701 shape=A dest=6,4 OK established=true'), outA);
check('analyzer A walkOutEallPass', outA.includes('walkOutEallPass=true'), outA);
check('analyzer A day1 identity', outA.includes('DAY1-IDENTITY seed=69701 PASS'), outA);
const outAV = runAnalyzer(['--shadow', fAS, '--armed', fAV, '--shape', 'A', '--dest', '6,4']);
check('analyzer A vetoed-walkout fail', outAV.includes('reason=armed-walkout-incomplete'), outAV);
const outC = runAnalyzer(['--shadow', fCS, '--armed', fCA, '--shape', 'C', '--dest', '3,6']);
check('analyzer C integrity ok+established', outC.includes('INTEGRITY seed=69702 shape=C dest=3,6 OK established=true'), outC);
check('analyzer C armed origin pass', outC.includes('armedVetoOriginSimOk=true'), outC);
const outCN = runAnalyzer(['--shadow', fCS, '--armed', fCN, '--shape', 'C', '--dest', '3,6']);
check('analyzer C attempt-not-offered fail', outCN.includes('reason=attempt-not-offered'), outCN);

// (c2) stage-2 confirmation checker on fixture legs.
function runChecker(args) {
  try { return execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'destfirst-b-confirm.js')].concat(args), { encoding: 'utf8' }); }
  catch (e) { return (e.stdout || '') + '\n' + (e.stderr || ''); }
}
const outCA = runChecker(['--file', fAS, '--shape', 'A', '--dest', '6,4']);
check('confirm A true', outCA.includes('confirmed=true') && outCA.includes('walkOutEallPass=true') && outCA.includes('dayEndOk=false'), outCA);
const aShadowPassing = JSON.parse(JSON.stringify(aShadow));
aShadowPassing.days[4].dayEndReturnSim.ok = true;
const fAP = write('a-shadow-passing.jsonl', aShadowPassing);
const outCAP = runChecker(['--file', fAP, '--shape', 'A', '--dest', '6,4']);
check('confirm A false when day-end passes', outCAP.includes('confirmed=false'), outCAP);
const outCC = runChecker(['--file', fCS, '--shape', 'C', '--dest', '3,6']);
check('confirm C true', outCC.includes('confirmed=true') && outCC.includes('hopSimOk=false'), outCC);
const cShadowPassing = JSON.parse(JSON.stringify(cShadow));
cShadowPassing.days[5].hops[0].simOk = true;
const fCP = write('c-shadow-passing.jsonl', cShadowPassing);
const outCCP = runChecker(['--file', fCP, '--shape', 'C', '--dest', '3,6']);
check('confirm C false when hop passes', outCCP.includes('confirmed=false'), outCCP);

// (d) screening band outside the banned set (homewardac list +
// shapes-b pilot bands + prototypes + 695/696 bands).
const banned = [[67001, 67008], [67101, 67108], [67201, 67208], [68001, 68008], [68201, 68208], [68701, 68708],
  [69101, 69108], [69201, 69208], [69301, 69308], [69401, 69408], [62801, 62808], [62001, 62016],
  [61901, 61916], [62301, 62301], [62401, 62401], [62501, 62501], [62601, 62601], [62701, 62701],
  [64001, 64708], [67105, 67105], [68001, 68001], [69501, 69508], [69601, 69608], [76701, 76712]];
const screen = [];
for (let s = 69701; s <= 69740; s++) screen.push(s);
const overlap = screen.filter((s) => banned.some(([a, b]) => s >= a && s <= b));
check('screening band outside banned set', overlap.length === 0, 'overlap=' + overlap.join(','));

// (e) reused files unmodified.
let gitOut = '';
try {
  gitOut = execFileSync('git', ['status', '--porcelain', '--',
    'scripts/policies/competent-homewardconstruct-b.js', 'scripts/homeconstruct-b-driver.js',
    'scripts/analyze-homeconstruct-b.js', 'scripts/analyze-homeward-shapes-b.js',
    'scripts/policies/competent-homewardstep-b.js', 'scripts/policies/competent.js',
    'scripts/homext-abl-b-driver.js'],
    { cwd: ROOT, encoding: 'utf8' });
} catch (e) { gitOut = 'ERROR'; }
check('reused files unmodified', gitOut.trim() === '', gitOut);

console.log('destfirst: ' + pass + ' PASS, ' + fail + ' FAIL');
process.exit(fail ? 1 : 0);
