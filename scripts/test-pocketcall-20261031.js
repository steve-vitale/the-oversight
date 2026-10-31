#!/usr/bin/env node
// test-pocketcall-20261031.js — proof for sim-pocketcall-a.
// Fixture legs (pure classify + sensed functions, no band seeds) +
// static read-only scan of the instrument + live gate: the pocketcall
// sweep on NON-band seed 85901, 60d, staffing ON, run twice into /tmp
// (never into the repo) — byte-identical per-seed JSONs, zero errors.
// Band seeds never appear here, so proof runs are not judged sims.
// Usage: node scripts/test-pocketcall-20261031.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const { classifyFight, sensedContact } = require(path.join(REPO, 'scripts', 'pocketcall-diag-20261031'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log(`ok   ${name}`); }
  else { fail++; console.log(`FAIL ${name}${extra ? ' :: ' + extra : ''}`); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// ---- Leg 1: classifyFight priority order + fallbacks ----
check('classify: armed beats no-call history',
  classifyFight({ carriedNeeded: 3, pocketBefore: 0, departBefore: 0, wentBefore: 0 }).cls === 'ARMED');
check('classify: never-called (P0 D0)',
  classifyFight({ carriedNeeded: 0, pocketBefore: 0, departBefore: 0, wentBefore: 0 }).cls === 'NEVER-CALLED');
check('classify: never-departed (D>0 P0 W0)',
  (() => { const r = classifyFight({ carriedNeeded: 0, pocketBefore: 0, departBefore: 2, wentBefore: 0 }); return r.cls === 'NEVER-DEPARTED' && !r.anomaly; })());
check('classify: never-departed with W>0 is an anomaly',
  (() => { const r = classifyFight({ carriedNeeded: 0, pocketBefore: 0, departBefore: 2, wentBefore: 1 }); return r.cls === 'NEVER-DEPARTED' && r.anomaly; })());
check('classify: dry-at-home (P>0, node==haven)',
  classifyFight({ carriedNeeded: 0, pocketBefore: 1, departBefore: 1, wentBefore: 1,
    fighterNode: { nx: 4, ny: 4 }, havenNode: { nx: 4, ny: 4 } }).cls === 'DRY-AT-HOME');
check('classify: dry-at-fight (P>0, node!=haven)',
  classifyFight({ carriedNeeded: 0, pocketBefore: 1, departBefore: 1, wentBefore: 1,
    fighterNode: { nx: 6, ny: 4 }, havenNode: { nx: 4, ny: 4 } }).cls === 'DRY-AT-FIGHT');
check('classify: node-unknown + away -> dry-at-fight',
  (() => { const r = classifyFight({ carriedNeeded: 0, pocketBefore: 1, departBefore: 1, wentBefore: 1, away: true }); return r.cls === 'DRY-AT-FIGHT' && r.nodeUnknown; })());
check('classify: node-unknown + not away -> dry-at-home',
  (() => { const r = classifyFight({ carriedNeeded: 0, pocketBefore: 1, departBefore: 1, wentBefore: 1 }); return r.cls === 'DRY-AT-HOME' && r.nodeUnknown; })());
check('classify: classes are five distinct labels',
  eq(['ARMED', 'NEVER-CALLED', 'NEVER-DEPARTED', 'DRY-AT-HOME', 'DRY-AT-FIGHT'].sort(),
     [...new Set(['ARMED', 'NEVER-CALLED', 'NEVER-DEPARTED', 'DRY-AT-HOME', 'DRY-AT-FIGHT'])].sort()));

// ---- Leg 2: sensedContact channels ----
const base = { fighterNode: { nx: 4, ny: 4 }, scholarNode: { nx: 4, ny: 4 },
  fighterGrid: null, scholarGridRaw: null, crewIncludesVid: false, crewAliveOthers: [], partyIncludesVid: false };
check('sensed: C1 same node -> reachable',
  (() => { const s = sensedContact(base); return s.c1 && s.reachable; })());
check('sensed: different nodes, no other channel -> unreachable',
  (() => { const s = sensedContact(Object.assign({}, base, { fighterNode: { nx: 7, ny: 7 } })); return !s.reachable && !s.c1; })());
check('sensed: C2 grid adjacent same node -> reachable',
  (() => { const s = sensedContact(Object.assign({}, base, { fighterGrid: { mx: 5, my: 4 }, scholarGridRaw: { mx: 4, my: 4 } })); return s.c2 && s.reachable; })());
check('sensed: C2 grid distance 2 -> not reachable via C2',
  (() => { const s = sensedContact(Object.assign({}, base, { fighterNode: null, scholarNode: null, fighterGrid: { mx: 6, my: 4 }, scholarGridRaw: { mx: 4, my: 4 } })); return !s.c2 && !s.reachable; })());
check('sensed: C2 stale (nodes differ, grid adjacent) -> c2 false, c2Stale true',
  (() => { const s = sensedContact(Object.assign({}, base, { fighterNode: { nx: 7, ny: 7 }, fighterGrid: { mx: 5, my: 4 }, scholarGridRaw: { mx: 4, my: 4 } })); return !s.c2 && s.c2Stale && !s.reachable; })());
check('sensed: C2 scholar grid fallback 4,4 when raw null',
  (() => { const s = sensedContact(Object.assign({}, base, { fighterGrid: { mx: 4, my: 5 } })); return s.c2 && s.reachable; })());
check('sensed: C3 crew with living mate -> reachable',
  (() => { const s = sensedContact(Object.assign({}, base, { fighterNode: { nx: 7, ny: 7 }, scholarNode: { nx: 4, ny: 4 }, crewIncludesVid: true, crewAliveOthers: ['x'] })); return s.c3 && s.reachable; })());
check('sensed: C3 crew alone -> not reachable via C3',
  (() => { const s = sensedContact(Object.assign({}, base, { fighterNode: { nx: 7, ny: 7 }, scholarNode: { nx: 4, ny: 4 }, crewIncludesVid: true, crewAliveOthers: [] })); return !s.c3 && !s.reachable; })());
check('sensed: C4 party -> reachable',
  (() => { const s = sensedContact(Object.assign({}, base, { fighterNode: { nx: 7, ny: 7 }, scholarNode: { nx: 4, ny: 4 }, partyIncludesVid: true })); return s.c4 && s.reachable; })());
check('sensed: all channels absent -> unreachable, all false',
  (() => { const s = sensedContact(Object.assign({}, base, { fighterNode: { nx: 7, ny: 7 }, scholarNode: { nx: 4, ny: 4 } })); return !s.reachable && !s.c1 && !s.c2 && !s.c3 && !s.c4; })());
check('sensed: overlaps reported (C1+C3 both true)',
  (() => { const s = sensedContact(Object.assign({}, base, { crewIncludesVid: true, crewAliveOthers: ['x'] })); return s.c1 && s.c3 && s.reachable; })());

// ---- Leg 3: static read-only scan (de-commented source) ----
const src = fs.readFileSync(path.join(REPO, 'scripts', 'pocketcall-diag-20261031.js'), 'utf8');
const stripped = src.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').filter(l => !l.trim().startsWith('//')).join('\n');
const FORBIDDEN = ['stashState', 'agencyState', 'npcNode', 'npcInside', 'campPeopleIds',
  'partyMembers', 'ensureVillagerPositions', 'assignTask', 'Math.random', '.say(', 'bumpTrust', 'roster', 'getPerson'];
for (const bad of FORBIDDEN) {
  check(`scan: instrument never uses ${bad}`, stripped.indexOf(bad) === -1);
}
check('scan: instrument wraps only fieldFight/startExpedition/resolvePatrol',
  stripped.indexOf('Game.fieldFight = function') !== -1 &&
  stripped.indexOf("['startExpedition', 'resolvePatrol']") !== -1 &&
  stripped.indexOf('Game[kind] = function') !== -1 &&
  (stripped.match(/Game\[kind\] =/g) || []).length === 2); // wrap + uninstall restore
check('scan: sweep requires PCDIAG + DEADFALL_B=1',
  (() => { const sw = fs.readFileSync(path.join(REPO, 'scripts', 'pocketcall-sweep-20261031.js'), 'utf8');
    return sw.indexOf('PCDIAG') !== -1 && sw.indexOf("DEADFALL_B=1") !== -1; })());
check('scan: deadfall-b.js untouched by this arm (still the loop-B staffing layer)',
  (() => { const df = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'deadfall-b.js'), 'utf8');
    return df.indexOf('MAX_ATTEMPTS_PER_DAY') !== -1 && df.indexOf('WANT_DEADFALL') !== -1; })());

// ---- Leg 4: live gate — non-band seed 85901, 60d, staffing ON, twice, byte-identical ----
const env = Object.assign({}, process.env, { FEASTSCALE_R13: '1', TRIBFLOOR: '1', WINPURSUIT: '1',
  WINDEFER: '1', SEATDRIVE: '1', FULLSEAT: '1', AMMODIAG: '1', SUPPLYDIAG: '1', STICKFIBERDIAG: '1',
  PCDIAG: '1', DEADFALL_B: '1', SEEDS: '85901', ARM: 'census', DAYS: '60' });
const dirA = '/tmp/pc-proof-a', dirB = '/tmp/pc-proof-b';
try { execSync(`rm -rf ${dirA} ${dirB}`, { stdio: 'ignore' }); } catch (e) {}
let liveOk = true, liveDetail = '';
for (const [dir, label] of [[dirA, 'run1'], [dirB, 'run2']]) {
  const r = spawnSync('node', ['scripts/pocketcall-sweep-20261031.js'],
    { cwd: REPO, env: Object.assign({}, env, { EVID: dir }), encoding: 'utf8', timeout: 600000 });
  if (r.status !== 0) { liveOk = false; liveDetail += `${label} exit=${r.status} ${String((r.stderr || '') + (r.stdout || '')).slice(-500)}; `; }
}
let jA = null, jB = null;
try { jA = fs.readFileSync(path.join(dirA, 'census', 's85901.json'), 'utf8'); } catch (e) { liveOk = false; liveDetail += 'run1 JSON missing; '; }
try { jB = fs.readFileSync(path.join(dirB, 'census', 's85901.json'), 'utf8'); } catch (e) { liveOk = false; liveDetail += 'run2 JSON missing; '; }
check('live: sweep runs on non-band seed 85901 (60d, staffing ON)', liveOk, liveDetail);
if (jA && jB) {
  check('live: byte-identical re-run', jA === jB);
  const d = JSON.parse(jA);
  const errs = (d.instrumentErrors || []).length + (d.pcErrors || []).length +
    (d.supplyErrors || []).length + (d.stickfiberErrors || []).length;
  check('live: zero instrument errors', errs === 0, `errs=${errs}`);
  check('live: corpus valid (days>0, pc arrays present)',
    (d.gameDays || 0) > 0 && Array.isArray(d.pcFights) && Array.isArray(d.pcDepartures));
  check('live: staffing substrate active (deadfall ledger present)',
    typeof d.deadfallHauls === 'number');
  console.log(`     live detail: days=${d.gameDays} fights=${(d.fights || []).length} pcFights=${(d.pcFights || []).length} pcDeps=${(d.pcDepartures || []).length} hauls=${d.deadfallHauls}`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
