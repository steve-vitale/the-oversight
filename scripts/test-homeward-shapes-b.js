#!/usr/bin/env node
// test-homeward-shapes-b.js — proof for the sim-homeward-shapes-b
// episodes analyzer (prereg evidence/2026-11-02/
// sim-homeward-shapes-b-prereg.md, census section). Fixtures are
// driver-shaped records written to /tmp only. Asserts:
// (a) A episode: 2-day run with haven-prefix walk-out all-pass +
//     armed pass/veto groups as ONE episode;
// (b) A rejected when armed day-end fails; A rejected when a
//     walk-out hop fails (run rejected, no episode);
// (c) C episode exactly (mid-trip start, origin-passing veto,
//     shadow corroboration, both day-ends passing);
// (d) C-loose (shadow corroboration missing) counted loose,
//     never candidate;
// (e) A-precedence: a day meeting both shapes counts as A only;
// (f) veto E table counts disagree / hopExplains / agreeFail
//     exactly;
// (g) pilot band starts 69301 / 69401 are outside the banned
//     set and do not overlap any banned band;
// (h) reused driver/analyzer/policy files unmodified.
// Exit 0 = PASS, 1 = FAIL.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync, execFileSync } = require('child_process');

let failures = 0;
function check(name, cond, extra) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra !== undefined ? ' :: ' + extra : ''));
  if (!cond) failures++;
}
const HERE = __dirname;
const TOOL = path.join(HERE, 'analyze-homeward-shapes-b.js');
function hop(fx, fy, tx, ty, opts) {
  return Object.assign({ from: { x: fx, y: fy }, to: { x: tx, y: ty },
    simOk: true, directOk: true, via: 'direct', legs: 0, creditUsed: 0,
    vetoed: false, homeward: false, originSimOk: null, silent: false, shadow: false }, opts);
}
function dayRec(loopDay, opts) {
  return Object.assign({ loopDay, start: { pos: { x: 4, y: 4 }, haven: { x: 4, y: 4 } },
    end: { pos: { x: 7, y: 1 }, haven: { x: 4, y: 4 }, kcal: 1000, hydration: 100 },
    vetoes: 0, silentVetoes: 0, lateralPasses: 0, creditUses: 0, simChecks: 0,
    beyondUngenerated: 0, homewardVetoes: 0, vetoOriginPass: 0, vetoOriginFail: 0,
    outwardOnlyPasses: 0, hops: [], forages: [],
    dayEndReturnSim: { ok: true, via: 'home', directOk: true, legs: 0, reason: 'home' } }, opts);
}
function runTool(shadowDays, armedDays, seed) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'homeward-shapes-'));
  const sf = path.join(tmp, 'shadow.jsonl'), af = path.join(tmp, 'armed.jsonl');
  fs.writeFileSync(sf, JSON.stringify({ seed, policy: 'competent', days: shadowDays }) + '\n');
  fs.writeFileSync(af, JSON.stringify({ seed, policy: 'competent-homewardstep-b', days: armedDays }) + '\n');
  const out = execFileSync('node', [TOOL, '--episodes', '--shadow', sf, '--armed', af], { encoding: 'utf8' });
  fs.rmSync(tmp, { recursive: true, force: true });
  return out;
}
const W = [hop(4, 4, 6, 4), hop(6, 4, 7, 4), hop(7, 4, 7, 2), hop(7, 2, 7, 1)];
const vetoA = hop(7, 1, 6, 1, { simOk: false, homeward: true, vetoed: true, originSimOk: false });
const vetoC = hop(2, 8, 4, 8, { simOk: false, homeward: true, vetoed: true, originSimOk: true });

// (a) A episode: shadow days 5,6 fail; armed days 5,6 veto + pass. Day 5 walk-out prefix.
{
  const s5 = dayRec(5, { hops: W, dayEndReturnSim: { ok: false, via: null, directOk: false, legs: 4, reason: 'lateral-cap' } });
  const s6 = dayRec(6, { start: { pos: { x: 7, y: 1 }, haven: { x: 4, y: 4 } }, hops: [hop(7, 1, 6, 1, { simOk: false, homeward: true })], dayEndReturnSim: { ok: false, via: null, directOk: false, legs: 4, reason: 'lateral-cap' } });
  const a5 = dayRec(5, { hops: W.concat([vetoA]), homewardVetoes: 1, vetoOriginFail: 1, end: { pos: { x: 7, y: 2 }, haven: { x: 4, y: 4 }, kcal: 1140, hydration: 100 } });
  const a6 = dayRec(6, { start: { pos: { x: 7, y: 2 }, haven: { x: 4, y: 4 } }, hops: [hop(7, 2, 6, 2, { simOk: false, homeward: true, vetoed: true, originSimOk: true })], homewardVetoes: 1, vetoOriginPass: 1, end: { pos: { x: 7, y: 2 }, haven: { x: 4, y: 4 }, kcal: 0, hydration: 86 } });
  const out = runTool([s5, s6], [a5, a6], 69301);
  check('A 2-day run groups as ONE episode', /EPISODES total=1 A=1 C=0/.test(out), out.trim().split('\n').filter((l) => l.startsWith('EPISODE')).join(' | '));
}
// (b1) A rejected when armed day-end fails.
{
  const s5 = dayRec(5, { hops: W, dayEndReturnSim: { ok: false, via: null, directOk: false, legs: 4, reason: 'lateral-cap' } });
  const a5 = dayRec(5, { hops: W.concat([vetoA]), homewardVetoes: 1, vetoOriginFail: 1, dayEndReturnSim: { ok: false, via: null, directOk: false, legs: 4, reason: 'lateral-cap' } });
  const out = runTool([s5], [a5], 69302);
  check('A rejected when armed day-end fails', /EPISODES total=0/.test(out), out.trim().split('\n').pop());
}
// (b2) A rejected when a walk-out hop fails.
{
  const Wbad = [hop(4, 4, 6, 4), hop(6, 4, 7, 4), hop(7, 4, 7, 2), hop(7, 2, 7, 1, { simOk: false, directOk: false, via: null })];
  const s5 = dayRec(5, { hops: Wbad, dayEndReturnSim: { ok: false, via: null, directOk: false, legs: 4, reason: 'lateral-cap' } });
  const a5 = dayRec(5, { hops: W.concat([vetoA]), homewardVetoes: 1, vetoOriginFail: 1 });
  const out = runTool([s5], [a5], 69303);
  check('A rejected when walk-out hop fails', /EPISODES total=0/.test(out) && /A-RUN-REJECTED/.test(out), out.trim().split('\n').filter((l) => /EPISODES|A-RUN/.test(l)).join(' | '));
}
// (c) C episode exactly.
{
  const s8 = dayRec(8, { start: { pos: { x: 2, y: 8 }, haven: { x: 4, y: 4 } }, end: { pos: { x: 2, y: 8 }, haven: { x: 4, y: 4 }, kcal: 267, hydration: 95 },
    hops: [hop(2, 8, 4, 8, { simOk: false, homeward: true })] });
  const a8 = dayRec(8, { start: { pos: { x: 2, y: 8 }, haven: { x: 4, y: 4 } }, end: { pos: { x: 2, y: 8 }, haven: { x: 4, y: 4 }, kcal: 267, hydration: 95 },
    hops: [vetoC], homewardVetoes: 1, vetoOriginPass: 1 });
  const out = runTool([s8], [a8], 69401);
  check('C episode exactly', /EPISODES total=1 A=0 C=1/.test(out), out.trim().split('\n').filter((l) => l.startsWith('EPISODE')).join(' | '));
}
// (d) C-loose: shadow hop passes -> loose, never candidate.
{
  const s8 = dayRec(8, { start: { pos: { x: 2, y: 8 }, haven: { x: 4, y: 4 } }, end: { pos: { x: 2, y: 8 }, haven: { x: 4, y: 4 }, kcal: 267, hydration: 95 },
    hops: [hop(2, 8, 4, 8, { simOk: true, homeward: true })] });
  const a8 = dayRec(8, { start: { pos: { x: 2, y: 8 }, haven: { x: 4, y: 4 } }, end: { pos: { x: 2, y: 8 }, haven: { x: 4, y: 4 }, kcal: 267, hydration: 95 },
    hops: [vetoC], homewardVetoes: 1, vetoOriginPass: 1 });
  const out = runTool([s8], [a8], 69402);
  check('C-loose counted loose, never candidate', /EPISODES total=0/.test(out) && /cLooseDays=1/.test(out) && /C-LOOSE/.test(out), out.trim().split('\n').filter((l) => /EPISODES|C-LOOSE/.test(l)).join(' | '));
}
// (e) A-precedence: day meets A (shadow fail + armed pass/veto) AND C-like veto origin pass -> A only.
{
  const s5 = dayRec(5, { start: { pos: { x: 7, y: 2 }, haven: { x: 4, y: 4 } }, end: { pos: { x: 7, y: 2 }, haven: { x: 4, y: 4 }, kcal: 0, hydration: 86 },
    hops: W, dayEndReturnSim: { ok: false, via: null, directOk: false, legs: 4, reason: 'lateral-cap' } });
  // Note: start out + shadow fail + walk-out prefix cannot hold at once here (start != haven breaks the
  // prefix), so precedence is exercised via the day-level branch: shadow fail routes to A first; the
  // A run is then rejected on walk-out, and must NOT fall through to C. Expect 0 episodes, 0 C.
  const a5 = dayRec(5, { start: { pos: { x: 7, y: 2 }, haven: { x: 4, y: 4 } }, end: { pos: { x: 7, y: 2 }, haven: { x: 4, y: 4 }, kcal: 0, hydration: 86 },
    hops: [hop(7, 2, 6, 2, { simOk: false, homeward: true, vetoed: true, originSimOk: true })], homewardVetoes: 1, vetoOriginPass: 1 });
  const out = runTool([s5], [a5], 69304);
  check('A-precedence: shadow-fail day never falls through to C', /EPISODES total=0 A=0 C=0/.test(out), out.trim().split('\n').filter((l) => l.startsWith('EPISODES')).join(''));
}
// (f) Veto E table counts.
{
  const s5 = dayRec(5, { hops: W, dayEndReturnSim: { ok: false, via: null, directOk: false, legs: 4, reason: 'lateral-cap' } });
  const a5 = dayRec(5, { hops: [vetoA, hop(7, 1, 8, 1, { simOk: false, vetoed: true })], homewardVetoes: 1, vetoOriginFail: 1 });
  // vetoA: hopE=false, dayE=true (default) -> disagree + hopExplains. Non-homeward veto is not tabled.
  const a6 = dayRec(6, { hops: [hop(7, 2, 6, 2, { simOk: false, homeward: true, vetoed: true, originSimOk: true })], homewardVetoes: 1, vetoOriginPass: 1,
    dayEndReturnSim: { ok: false, via: null, directOk: false, legs: 4, reason: 'lateral-cap' } });
  const s6 = dayRec(6, { hops: [], dayEndReturnSim: { ok: false, via: null, directOk: false, legs: 4, reason: 'lateral-cap' } });
  const out = runTool([s5, s6], [a5, a6], 69305);
  check('veto E table counts disagree/hopExplains/agreeFail exactly',
    /VETO-TOTALS total=2 disagree=1 hopExplains=1 agreeFail=1/.test(out), out.trim().split('\n').filter((l) => l.startsWith('VETO-TOTALS')).join(''));
}
// (g) Pilot bands vs banned set.
{
  const pilot = [69301, 69401];
  const banned = [67001, 67101, 67201, 68001, 68201, 68701, 69101, 69201,
    62801, 62001, 62009, 61901, 61909, 62301, 62401, 62501, 62601, 62701,
    64001, 64101, 64201, 64301, 64401, 64501, 64601, 64701];
  const bannedSeeds = new Set();
  for (const b of banned) for (let s = b; s < b + 8; s++) bannedSeeds.add(s);
  const overlap = [];
  for (const b of pilot) for (let s = b; s < b + 8; s++) if (bannedSeeds.has(s)) overlap.push(s);
  check('pilot bands do not overlap any banned band', overlap.length === 0, 'overlap=' + JSON.stringify(overlap));
  check('pilot budget is exactly 2 bands', pilot.length === 2);
}
// (h) Reused instrument files unmodified.
{
  const reused = ['scripts/homext-abl-b-driver.js', 'scripts/analyze-homeward-substrate-b.js',
    'scripts/analyze-homext-abl-b.js', 'scripts/analyze-homeveto-screen-b.js',
    'scripts/policies/competent-homewardstep-b.js', 'scripts/policies/competent-homewardstep-outwardonly-b.js'];
  let status = '';
  try { status = execSync('git status --porcelain', { encoding: 'utf8', cwd: path.join(HERE, '..') }); } catch (e) { status = 'GIT-ERROR'; }
  const touched = reused.filter((f) => status.split('\n').some((l) => l.slice(3).trim() === f));
  check('reused driver/analyzer/policy files unmodified', touched.length === 0 && status !== 'GIT-ERROR',
    touched.length ? 'touched=' + touched.join(',') : 'status-clean-for-reused');
}

console.log(failures === 0 ? 'ALL PASS' : failures + ' FAILURES');
process.exit(failures === 0 ? 0 : 1);
