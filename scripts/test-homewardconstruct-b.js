#!/usr/bin/env node
// test-homewardconstruct-b.js — proof for sim-homewardac-b.
// Prereg: evidence/2026-11-02/sim-homewardac-b-prereg.md.
// Census (proof, not judged evidence): route/hop parsing;
// episodes analyzer counts constructed A and C episodes exactly
// from fixture legs; construct analyzer reports integrity-ok
// and the armed-walkout-vetoed integrity failure; pilot bands
// outside the banned set; reused files unmodified; driver
// FATALs on a bad POLICY. Fixtures live in /tmp (never the repo).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const { parseRoute, parseHop } = require('./policies/competent-homewardconstruct-b');

const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
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
function walkoutHops(route) {
  const hops = [];
  let cur = { x: 4, y: 4 };
  for (const wp of route) { hops.push(hop(cur.x, cur.y, wp.x, wp.y, true)); cur = wp; }
  return hops;
}

// (a) route / hop parsing.
check('parseRoute A', JSON.stringify(parseRoute('5,4;6,4;7,4;7,3;7,2;7,1')) ===
  JSON.stringify([{ x: 5, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 }, { x: 7, y: 3 }, { x: 7, y: 2 }, { x: 7, y: 1 }]));
check('parseRoute C', parseRoute('4,5;4,6;4,7;4,8;3,8;2,8').length === 6);
check('parseHop C', JSON.stringify(parseHop('2,8>4,8')) === JSON.stringify({ from: { x: 2, y: 8 }, to: { x: 4, y: 8 } }));
check('parseHop bogus', parseHop('bogus') === null);

// Fixtures.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'homeconstruct-proof-'));
const aRoute = parseRoute('5,4;6,4;7,4;7,3;7,2;7,1');
const cRoute = parseRoute('4,5;4,6;4,7;4,8;3,8;2,8');
const aShadow = { seed: 69501, policy: 'construct-shadow', days: [homeDay(1), homeDay(2), homeDay(3), homeDay(4),
  day(5, { x: 4, y: 4 }, { x: 7, y: 1 }, false, walkoutHops(aRoute),
    { construct: { shape: 'A', loopDay: 5, kind: 'walkout', startPos: { x: 4, y: 4 },
      steps: aRoute.map((wp) => ({ to: wp, attempted: true, moved: true, reason: 'ok' })),
      posAfterForced: { x: 7, y: 1 }, attempt: null } })], sayLines: [] };
const aArmed = { seed: 69501, policy: 'construct-armed', days: [homeDay(1), homeDay(2), homeDay(3), homeDay(4),
  day(5, { x: 4, y: 4 }, { x: 7, y: 2 }, true,
    walkoutHops(aRoute).concat([hop(7, 1, 6, 1, false, { vetoed: true, homeward: true, originSimOk: true })]),
    { homewardVetoes: 1, vetoOriginPass: 1,
      construct: { shape: 'A', loopDay: 5, kind: 'walkout', startPos: { x: 4, y: 4 },
        steps: aRoute.map((wp) => ({ to: wp, attempted: true, moved: true, reason: 'ok' })),
        posAfterForced: { x: 7, y: 1 }, attempt: null } })], sayLines: [] };
const cShadow = { seed: 69601, policy: 'construct-shadow', days: [homeDay(1), homeDay(2), homeDay(3), homeDay(4),
  day(5, { x: 4, y: 4 }, { x: 2, y: 8 }, true, walkoutHops(cRoute),
    { construct: { shape: 'C', loopDay: 5, kind: 'walkout', startPos: { x: 4, y: 4 },
      steps: cRoute.map((wp) => ({ to: wp, attempted: true, moved: true, reason: 'ok' })),
      posAfterForced: { x: 2, y: 8 }, attempt: null } }),
  day(6, { x: 2, y: 8 }, { x: 2, y: 8 }, true, [hop(2, 8, 4, 8, false, { homeward: true })],
    { construct: { shape: 'C', loopDay: 6, kind: 'attempt', startPos: { x: 2, y: 8 }, steps: [],
      posAfterForced: { x: 2, y: 8 },
      attempt: { hop: '2,8>4,8', attempted: true, moved: false, reason: 'refused' } } })], sayLines: [] };
const cArmed = { seed: 69601, policy: 'construct-armed', days: [homeDay(1), homeDay(2), homeDay(3), homeDay(4),
  day(5, { x: 4, y: 4 }, { x: 2, y: 8 }, true, walkoutHops(cRoute),
    { construct: { shape: 'C', loopDay: 5, kind: 'walkout', startPos: { x: 4, y: 4 },
      steps: cRoute.map((wp) => ({ to: wp, attempted: true, moved: true, reason: 'ok' })),
      posAfterForced: { x: 2, y: 8 }, attempt: null } }),
  day(6, { x: 2, y: 8 }, { x: 2, y: 8 }, true, [hop(2, 8, 4, 8, false, { vetoed: true, homeward: true, originSimOk: true })],
    { homewardVetoes: 1, vetoOriginPass: 1,
      construct: { shape: 'C', loopDay: 6, kind: 'attempt', startPos: { x: 2, y: 8 }, steps: [],
        posAfterForced: { x: 2, y: 8 },
        attempt: { hop: '2,8>4,8', attempted: true, moved: false, reason: 'refused' } } })], sayLines: [] };
const aShadowVetoed = JSON.parse(JSON.stringify(aShadow));
const aArmedVetoed = JSON.parse(JSON.stringify(aArmed));
aArmedVetoed.days[4].construct.posAfterForced = { x: 6, y: 4 };
aArmedVetoed.days[4].construct.steps[2] = { to: { x: 7, y: 4 }, attempted: true, moved: false, reason: 'refused' };

function write(name, obj) {
  const f = path.join(tmp, name);
  fs.writeFileSync(f, JSON.stringify(obj) + '\n');
  return f;
}
const fAS = write('a-shadow.jsonl', aShadow), fAA = write('a-armed.jsonl', aArmed);
const fCS = write('c-shadow.jsonl', cShadow), fCA = write('c-armed.jsonl', cArmed);
const fAV = write('a-armed-vetoed.jsonl', aArmedVetoed);
function runAnalyzer(script, args) {
  try { return execFileSync(process.execPath, [path.join(ROOT, 'scripts', script)].concat(args), { encoding: 'utf8' }); }
  catch (e) { return (e.stdout || '') + '\n' + (e.stderr || ''); }
}
// (b) constructed A episode exactly.
const outA = runAnalyzer('analyze-homeward-shapes-b.js', ['--episodes', '--shadow', fAS, '--armed', fAA]);
check('episodes A episode', outA.includes('EPISODE-A seed=69501 days=5'), outA);
check('episodes A totals', outA.includes('EPISODES total=1 A=1 C=0'), outA);
// (c) constructed C episode exactly.
const outC = runAnalyzer('analyze-homeward-shapes-b.js', ['--episodes', '--shadow', fCS, '--armed', fCA]);
check('episodes C episode', outC.includes('EPISODE-C seed=69601 days=6'), outC);
check('episodes C totals', outC.includes('EPISODES total=1 A=0 C=1'), outC);
// (d) construct analyzer: integrity-ok + established, both shapes.
const outIA = runAnalyzer('analyze-homeconstruct-b.js', ['--identity', '--shadow', fAS, '--armed', fAA, '--shape', 'A']);
check('construct A integrity ok', outIA.includes('INTEGRITY seed=69501 shape=A OK established=true'), outIA);
check('construct A day1 identity', outIA.includes('DAY1-IDENTITY seed=69501 PASS'), outIA);
const outIC = runAnalyzer('analyze-homeconstruct-b.js', ['--identity', '--shadow', fCS, '--armed', fCA, '--shape', 'C']);
check('construct C integrity ok', outIC.includes('INTEGRITY seed=69601 shape=C OK established=true'), outIC);
// (d2) armed walk-out vetoed -> integrity FAIL, not an episode.
const outIV = runAnalyzer('analyze-homeconstruct-b.js', ['--identity', '--shadow', fAS, '--armed', fAV, '--shape', 'A']);
check('construct A vetoed-walkout integrity fail', outIV.includes('reason=armed-walkout-incomplete'), outIV);
// (e) pilot bands outside the banned set.
const banned = [[67001, 67008], [67101, 67108], [67201, 67208], [68001, 68008], [68201, 68208], [68701, 68708],
  [69101, 69108], [69201, 69208], [69301, 69308], [69401, 69408], [62801, 62808], [62001, 62016],
  [61901, 61916], [62301, 62301], [62401, 62401], [62501, 62501], [62601, 62601], [62701, 62701],
  [64001, 64708], [67105, 67105], [68001, 68001]];
const pilot = [];
for (let s = 69501; s <= 69508; s++) pilot.push(s);
for (let s = 69601; s <= 69608; s++) pilot.push(s);
const overlap = pilot.filter((s) => banned.some(([a, b]) => s >= a && s <= b));
check('pilot bands outside banned set', overlap.length === 0, 'overlap=' + overlap.join(','));
// (f) reused files unmodified.
let gitOut = '';
try { gitOut = execFileSync('git', ['status', '--porcelain', '--',
  'scripts/homext-abl-b-driver.js', 'scripts/analyze-homeward-shapes-b.js',
  'scripts/policies/competent-homewardstep-b.js', 'scripts/policies/competent.js'],
  { cwd: ROOT, encoding: 'utf8' }); } catch (e) { gitOut = 'ERROR'; }
check('reused files unmodified', gitOut.trim() === '', gitOut);
// (g) driver FATALs on a bad POLICY.
const drv = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'homeconstruct-b-driver.js')],
  { env: Object.assign({}, process.env, { POLICY: 'bogus' }), encoding: 'utf8' });
check('driver FATAL on bad POLICY', drv.status === 2, 'status=' + drv.status + ' ' + (drv.stderr || '').slice(0, 200));

console.log('homewardconstruct: ' + pass + ' PASS, ' + fail + ' FAIL');
process.exit(fail ? 1 : 0);
