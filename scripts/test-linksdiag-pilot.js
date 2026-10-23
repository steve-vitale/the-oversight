#!/usr/bin/env node
// test-linksdiag-pilot.js — proof gates for the sim-links-diag lever pilot
// (flesh-out loop, run fleshout-20261023T1015Z, axis scale-onramp).
// GREEN before the sweep.
//
// E1 env-gate: checkEnv() rejects wrong substrates (exit 2), accepts the
//    three legal arms (baseline|cadence|overcourt).
// E2 default-off: LINKFORM unset → linkform.daily delegates to leadcourt.daily
//    (the identical code path — spied).
// E3 LINKFORM=1 KILLED: the 2026-10-23 pilot NO-GO'd cadence (wrong lever —
//    backfired). Killed arms leave no trace: LINKFORM=1 now delegates to
//    leadcourt exactly like unset.
// E4 LINKFORM=2 overcourt: still proposes at 3 subs (base stops), stops at 5.
// E5 chain: linkformArmedFor() builds the full census-identical chain with
//    the linkform base; policy id is linkform-armorvillage.
// E6 dip-step classifier: synthetic windows classify +102/+122/-102 as dip
//    events and +45/+50/+70 as war/feast composites (the DIAG's rule).
// E7 anchor: diag-linksdiag-pilot's ANCHOR equals `git rev-parse HEAD`
//    at module load (finding #793).
//
// Usage (pinned substrate):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 \
//   ARMORYDRIVE=1 ARMORVILLAGE=1 node scripts/test-linksdiag-pilot.js
'use strict';
const { spawnSync, execSync } = require('child_process');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const PASS = [], FAIL = [];
function ok(name, cond, extra) {
  (cond ? PASS : FAIL).push(name);
  console.log((cond ? 'ok   ' : 'FAIL ') + name + (extra ? ' — ' + extra : ''));
}

// Pinned substrate defaults (the pilot's substrate); negative E1 cases
// override the specific var under test.
for (const [k, v] of Object.entries({
  FEASTSCALE_R13: '1', TRIBFLOOR: '1', WINPURSUIT: '1', WINDEFER: '1',
  SEATDRIVE: '0', KILLDISC: '1', ARMORYDRIVE: '1', ARMORVILLAGE: '1',
})) if (!(k in process.env)) process.env[k] = v;

const SWEEP = path.join(REPO, 'scripts', 'diag-linksdiag-pilot.js');
function gateRun(env) {
  const out = spawnSync(process.execPath,
    ['-e', "require(process.argv[1]); console.log('loaded');", SWEEP],
    { env: Object.assign({}, process.env, env), timeout: 60000, encoding: 'utf8' });
  return out.status;
}

// --- E1: env gate -----------------------------------------------------------
ok('E1a rejects bad ARM', gateRun({ ARM: 'nope' }) === 2);
ok('E1b rejects missing KILLDISC', gateRun({ ARM: 'baseline', KILLDISC: '0' }) === 2);
ok('E1c rejects SUCCGRACE set', gateRun({ ARM: 'baseline', SUCCGRACE: '1' }) === 2);
ok('E1d accepts baseline', gateRun({ ARM: 'baseline' }) === 0);
ok('E1e accepts cadence', gateRun({ ARM: 'cadence' }) === 0);
ok('E1f accepts overcourt', gateRun({ ARM: 'overcourt' }) === 0);

// --- mock Game ---------------------------------------------------------------
function mockGame(o) {
  o = o || {};
  const calls = [];
  const links = o.links || [];
  const villages = o.villages || [{ id: 'v1', name: 'V1' }, { id: 'v2', name: 'V2' }];
  const day = o.day != null ? o.day : 30;
  const g = {
    calls,
    state: {
      scholar: { day },
      village: { pantry: [{ kcalEach: 1000, units: o.pantryUnits != null ? o.pantryUnits : 50 }] },
      otherVillages: villages,
      pendingCounter: o.pendingCounter || null,
      pendingAccord: null, pendingNational: null, pendingGlobal: null,
    },
    hierarchyState: () => links,
    knowsVillage: () => true,
    linkWith: () => null,
    proposeLink: (id) => { calls.push(['proposeLink', id]); return null; },
    tendLink: (id) => { calls.push(['tendLink', id]); },
    answerCounter: (how) => { calls.push(['answerCounter', how]); return null; },
    answerAccord: (how) => { calls.push(['answerAccord', how]); },
    _week: () => Math.floor(day / 7),
  };
  return g;
}

const LC = require(path.join(REPO, 'scripts', 'policies', 'leadcourt'));
const LF = require(path.join(REPO, 'scripts', 'policies', 'linkform'));
const realDaily = LC.leadcourt.daily;

// --- E2: default-off delegation ----------------------------------------------
delete process.env.LINKFORM;
let delegated = 0;
LC.leadcourt.daily = function () { delegated++; return null; };
try {
  LF.linkform.daily(mockGame({ day: 40 }), {});
  ok('E2 default-off delegates to leadcourt.daily', delegated === 1, `delegated=${delegated}`);
  ok('E2 linkformMode() is 0 when unset', LF.linkformMode() === 0);
} finally { LC.leadcourt.daily = realDaily; }

// --- E3: LINKFORM=1 KILLED — now inert (delegates like off) -------------------
// The 2026-10-23 pilot NO-GO'd the cadence arm (wrong lever: backfired —
// 6 vs 7 formations, starvation 6 vs 2, dissolutions 4 vs 1). Killed arms
// leave no trace: LINKFORM=1 behaves exactly as unset.
process.env.LINKFORM = '1';
ok('E3 linkformMode() is 0 for killed mode 1', LF.linkformMode() === 0);
{
  let delegated = 0;
  LC.leadcourt.daily = function () { delegated++; return null; };
  try {
    LF.linkform.daily(mockGame({ day: 15 }), {});
    ok('E3b LINKFORM=1 delegates to leadcourt.daily (no cadence)', delegated === 1, `delegated=${delegated}`);
  } finally { LC.leadcourt.daily = realDaily; }
}

// --- E4: LINKFORM=2 overcourt --------------------------------------------------
process.env.LINKFORM = '2';
ok('E4 linkformMode() is 2', LF.linkformMode() === 2);
function subLinks(n) {
  const ls = [];
  for (let i = 0; i < n; i++) ls.push({ id: 'l' + i, status: 'active', primary: 'haven', subordinate: 'vx' + i });
  return ls;
}
{
  const g = mockGame({ day: 40, links: subLinks(3) });
  LF.linkformCourtship(g, {}, 2);
  ok('E4a still proposes at 3 subs (base stops)', g.calls.some(c => c[0] === 'proposeLink'));
}
{
  const g = mockGame({ day: 40, links: subLinks(5) });
  LF.linkformCourtship(g, {}, 2);
  ok('E4b stops at 5 subs', !g.calls.some(c => c[0] === 'proposeLink'));
}
{
  // mode 2 keeps the base propose-from day and cadence
  const g = mockGame({ day: 15, links: [] });
  LF.linkformCourtship(g, {}, 2);
  ok('E4c mode 2 still waits for day 25', !g.calls.some(c => c[0] === 'proposeLink'));
  const g2 = mockGame({ day: 30, links: [] });
  LF.linkformCourtship(g2, {}, 2);
  ok('E4d mode 2 one proposal per day', g2.calls.filter(c => c[0] === 'proposeLink').length === 1);
}
delete process.env.LINKFORM;

// --- E5: chain builder ---------------------------------------------------------
{
  for (const [k, v] of Object.entries({ FEASTSCALE_R13: '1', TRIBFLOOR: '1', WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '0', ARMORYDRIVE: '1', ARMORVILLAGE: '1' })) process.env[k] = v;
  const p = LF.linkformArmedFor();
  ok('E5a chain builds with linkform base', !!p && typeof p.daily === 'function');
  ok('E5b policy id is linkform-armorvillage', p.id === 'linkform-armorvillage', p.id);
  const AV = require(path.join(REPO, 'scripts', 'policies', 'armorvillage'));
  const base = AV.armedFor('leadfeast');
  ok('E5c census chain still builds (untouched)', !!base && base.id === 'lead-armorvillage', base.id);
}

// --- E6: dip-step classifier ----------------------------------------------------
function dipStepsOf(window) {
  const out = [];
  for (let i = 1; i < window.length; i++) {
    const x = (window[i].raw | 0) - (window[i - 1].raw | 0);
    if (Math.abs(x) >= 102) out.push({ day: window[i].day, step: x });
  }
  return out;
}
{
  const w = [
    { day: 1, raw: 40 }, { day: 2, raw: 60 },   // +20 feast: ignored
    { day: 3, raw: 162 },                        // +102 dip formation
    { day: 4, raw: 207 },                        // +45 war+feast: ignored
    { day: 5, raw: 329 },                        // +122 dip+feast bundle
    { day: 6, raw: 227 },                        // -102 dissolution
    { day: 7, raw: 297 },                        // +70 war composite: ignored
  ];
  const got = dipStepsOf(w);
  const want = [{ day: 3, step: 102 }, { day: 5, step: 122 }, { day: 6, step: -102 }];
  ok('E6 dip-step classifier', JSON.stringify(got) === JSON.stringify(want), JSON.stringify(got));
}

// --- E7: anchor ------------------------------------------------------------------
{
  const D = require(SWEEP);
  const head = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12);
  ok('E7 ANCHOR matches HEAD', D.ANCHOR === head, `${D.ANCHOR} vs ${head}`);
}

console.log(`\n${PASS.length} passed, ${FAIL.length} failed`);
process.exit(FAIL.length ? 1 : 0);
