#!/usr/bin/env node
// test-overcourtrestage.js — proof gates for the LINKFORM=2 overcourt confirm
// (sim-overcourt-restage, flesh-out loop, run fleshout-20261023T2015Z, axis
// scale-onramp). GREEN before the sweep.
//
// E1 env-gate: checkEnv() rejects wrong substrates (exit 2), accepts the four
//    legal ARM x POLICY combos (control|armed x leadfeast|belongfeast).
// E2 control leg: policyFor() = AV.armedFor(policy) with LINKFORM deleted
//    (ONE DELTA ONLY vs the armed leg).
// E3 armed leadfeast: LF.linkformArmedFor() (the pilot's proven armed shape),
//    id linkform-armorvillage, LINKFORM=2.
// E4 armed belongfeast: OCR.linkformBelongArmedFor(), id
//    linkformbelong-armorvillage, LINKFORM=2.
// E5 linkformBelong.daily: mode 0 delegates to belongseek.daily (gate off =
//    pure delegation); mode 2 = competent.daily + linkformCourtship and does
//    NOT call belongseek.daily (the road courtship is REPLACED by the
//    overcourt layer, same as linkform.daily at mode 2). LINKFORM=1 (killed
//    cadence) behaves as mode 0.
// E6 RED->GREEN analyzer fixtures: synthetic windowstay trajectories through
//    analyzeRun pin the sim-links-diag metric-review caveat — a +34
//    single-link seasoning does NOT open the post-formation window; only a
//    +102/+122 formation does. F4 is the fixture that goes RED against the
//    naive "any positive dip step opens the window" classifier (shown in the
//    test) and GREEN against the real one: that is what drove the
//    firstForm logic.
// E7 det-gate: identical analyzer input -> byte-identical output.
//
// Usage (pinned substrate):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 \
//   ARMORYDRIVE=1 ARMORVILLAGE=1 node scripts/test-overcourtrestage.js
'use strict';
const { spawnSync } = require('child_process');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const PASS = [], FAIL = [];
function ok(name, cond, extra) {
  (cond ? PASS : FAIL).push(name);
  console.log((cond ? 'ok   ' : 'FAIL ') + name + (extra ? ' — ' + extra : ''));
}

// Pinned substrate defaults; negative E1 cases override the specific var.
for (const [k, v] of Object.entries({
  FEASTSCALE_R13: '1', TRIBFLOOR: '1', WINPURSUIT: '1', WINDEFER: '1',
  SEATDRIVE: '0', KILLDISC: '1', ARMORYDRIVE: '1', ARMORVILLAGE: '1',
})) if (!(k in process.env)) process.env[k] = v;

const SWEEP = path.join(REPO, 'scripts', 'overcourtrestage-sweep.js');
function gateRun(env) {
  const out = spawnSync(process.execPath,
    ['-e', "require(process.argv[1]); console.log('loaded');", SWEEP],
    { env: Object.assign({}, process.env, env), timeout: 60000, encoding: 'utf8' });
  return out.status;
}
function probePolicy(env) {
  const out = spawnSync(process.execPath, ['-e',
    "const S=require(process.argv[1]);const p=S.policyFor();console.log(JSON.stringify({id:p.id,tag:S.policyTag(),lf:process.env.LINKFORM||'(unset)'}));",
    SWEEP],
    { env: Object.assign({}, process.env, env), timeout: 60000, encoding: 'utf8' });
  if (out.status !== 0) return { error: out.stderr.trim().split('\n').pop() };
  try { return JSON.parse(out.stdout.trim()); } catch (e) { return { error: 'parse: ' + out.stdout }; }
}

// --- E1: env gate -----------------------------------------------------------
ok('E1a rejects bad ARM', gateRun({ ARM: 'nope', POLICY: 'leadfeast' }) === 2);
ok('E1b rejects bad POLICY', gateRun({ ARM: 'control', POLICY: 'nope' }) === 2);
ok('E1c rejects missing KILLDISC', gateRun({ ARM: 'control', POLICY: 'leadfeast', KILLDISC: '0' }) === 2);
ok('E1d rejects SUCCGRACE set', gateRun({ ARM: 'armed', POLICY: 'belongfeast', SUCCGRACE: '1' }) === 2);
ok('E1e accepts control-leadfeast', gateRun({ ARM: 'control', POLICY: 'leadfeast' }) === 0);
ok('E1f accepts armed-leadfeast', gateRun({ ARM: 'armed', POLICY: 'leadfeast' }) === 0);
ok('E1g accepts control-belongfeast', gateRun({ ARM: 'control', POLICY: 'belongfeast' }) === 0);
ok('E1h accepts armed-belongfeast', gateRun({ ARM: 'armed', POLICY: 'belongfeast' }) === 0);

// --- E2/E3/E4: policy composition --------------------------------------------
let r = probePolicy({ ARM: 'control', POLICY: 'leadfeast' });
ok('E2 control-leadfeast = AV.armedFor lead chain, LINKFORM unset',
  r.id === 'lead-armorvillage' && r.lf === '(unset)', JSON.stringify(r));
r = probePolicy({ ARM: 'control', POLICY: 'belongfeast' });
ok('E2b control-belongfeast = AV.armedFor belong chain, LINKFORM unset',
  r.id === 'belong-armorvillage' && r.lf === '(unset)', JSON.stringify(r));
r = probePolicy({ ARM: 'armed', POLICY: 'leadfeast' });
ok('E3 armed-leadfeast = pilot-proven linkform-armed shape, LINKFORM=2',
  r.id === 'linkform-armorvillage' && r.lf === '2', JSON.stringify(r));
r = probePolicy({ ARM: 'armed', POLICY: 'belongfeast' });
ok('E4 armed-belongfeast = linkformbelong-armed shape, LINKFORM=2',
  r.id === 'linkformbelong-armorvillage' && r.lf === '2', JSON.stringify(r));

// --- E5: linkformBelong.daily shape ------------------------------------------
// Patch road bases BEFORE requiring overcourtrestage (it destructures at load).
const BS = require(path.join(REPO, 'scripts', 'policies', 'belongseek'));
const CP = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const realBelong = BS.belongseek.daily;
const realComp = CP.competent.daily;
let belongCalls = 0, compCalls = 0;
BS.belongseek.daily = function () { belongCalls++; return null; };
CP.competent.daily = function () { compCalls++; return null; };
const OCR = require(path.join(REPO, 'scripts', 'policies', 'overcourtrestage'));

function mockGame(o) {
  o = o || {};
  const calls = [];
  const day = o.day != null ? o.day : 30;
  return {
    calls,
    state: {
      scholar: { day },
      village: { pantry: [{ kcalEach: 1000, units: 60 }] },
      otherVillages: [{ id: 'v1', name: 'V1' }, { id: 'v2', name: 'V2' }],
      pendingCounter: null, pendingAccord: null, pendingNational: null, pendingGlobal: null,
    },
    hierarchyState: () => [],
    knowsVillage: () => true,
    linkWith: () => null,
    proposeLink: (id) => { calls.push(['proposeLink', id]); return null; },
    tendLink: (id) => { calls.push(['tendLink', id]); },
    _week: () => Math.floor(day / 7),
  };
}

try {
  delete process.env.LINKFORM;
  belongCalls = 0; compCalls = 0;
  OCR.linkformBelong.daily(mockGame(), {});
  ok('E5a mode 0 delegates to belongseek.daily', belongCalls === 1 && compCalls === 0,
    `belong=${belongCalls} comp=${compCalls}`);

  process.env.LINKFORM = '1'; // killed cadence: inert, like off
  belongCalls = 0; compCalls = 0;
  OCR.linkformBelong.daily(mockGame(), {});
  ok('E5b LINKFORM=1 (killed) delegates to belongseek.daily', belongCalls === 1 && compCalls === 0,
    `belong=${belongCalls} comp=${compCalls}`);

  process.env.LINKFORM = '2';
  belongCalls = 0; compCalls = 0;
  const g = mockGame({ day: 30 });
  OCR.linkformBelong.daily(g, {});
  const proposed = g.calls.filter(c => c[0] === 'proposeLink').length;
  ok('E5c mode 2 runs competent.daily + linkformCourtship, NOT belongseek',
    compCalls === 1 && belongCalls === 0 && proposed === 1,
    `comp=${compCalls} belong=${belongCalls} proposed=${proposed}`);
} finally {
  BS.belongseek.daily = realBelong;
  CP.competent.daily = realComp;
  delete process.env.LINKFORM;
}

// --- E6: RED->GREEN analyzer fixtures -----------------------------------------
const AN = require(path.join(REPO, 'scripts', 'overcourtrestage-analyze'));

function synthRow(dipSteps, endDip) {
  // minimal row: dipSteps + window scaffold + gateVector.dip
  const window = [{ day: 0, raw: 0 }];
  let raw = 0;
  for (const s of dipSteps) { raw += s.step; window.push({ day: s.day, raw }); }
  return {
    seed: 1, arm: 'control', policy: 'leadfeast', gameDays: 180,
    deaths: {}, gateVector: { dip: endDip }, dipSteps, window,
  };
}
const step = (day, s) => ({ day, step: s });

// F1: formation then dissolution -> 1 post-formation dissolution
let a1 = AN.analyzeRun(synthRow([step(60, 102), step(90, -102)], 0));
ok('E6a +102 then -102 = 1 post-formation dissolution', a1.postFormDiss === 1 && a1.firstForm === 60);

// F2: dissolution with NO formation -> not post-formation (0)
let a2 = AN.analyzeRun(synthRow([step(90, -102)], -102));
ok('E6b -102 with no formation = 0 post-formation', a2.postFormDiss === 0 && a2.firstForm === null);

// F3: +34 seasoning, then formation, then dissolution -> 1 (seasoning does
// not open the window, the formation does)
let a3 = AN.analyzeRun(synthRow([step(50, 34), step(60, 102), step(90, -102)], 34));
ok('E6c +34 seasoning before formation: window opens at formation, 1 post-form',
  a3.postFormDiss === 1 && a3.firstForm === 60);

// F4: the metric-review caveat — +34 seasoning, then -102, NO formation ->
// 0. RED against the naive "any positive dip step opens the window"
// classifier, GREEN here. Demonstrate both:
let a4 = AN.analyzeRun(synthRow([step(50, 34), step(90, -102)], -68));
function naivePostForm(row) {
  const anyPos = (row.dipSteps || []).find(s => s.step > 0);
  if (!anyPos) return 0;
  return (row.dipSteps || []).filter(s => s.step === -102 && s.day >= anyPos.day).length;
}
const naive4 = naivePostForm(synthRow([step(50, 34), step(90, -102)], -68));
ok('E6d RED pin: naive classifier counts the seasoning as formation (would be wrong)',
  naive4 === 1, `naive=${naive4}`);
ok('E6e GREEN: real classifier = 0 post-formation (seasoning is not formation)',
  a4.postFormDiss === 0 && a4.firstForm === null);

// F5: +122 feast bundle classifies as formation
let a5 = AN.analyzeRun(synthRow([step(60, 122)], 122));
ok('E6f +122 bundle = formation', a5.steps[0].cls === 'formation' && a5.firstForm === 60);

// F6: non-34-multiple step is named as a war/feast composite (the DIAG's
// rule, sim-links-diag E6) — not a dip event, never opens the window
let a6 = AN.analyzeRun(synthRow([step(60, 50)], 50));
ok('E6g +50 named war-composite (not a dip event, loud-not-silent)',
  a6.steps[0].cls === 'war-composite' && a6.firstForm === null && a6.postFormDiss === 0);

// --- E7: det-gate ---------------------------------------------------------------
const detRow = synthRow([step(60, 102), step(75, 34), step(90, -102)], 34);
const b1 = JSON.stringify(AN.analyzeRun(detRow));
const b2 = JSON.stringify(AN.analyzeRun(JSON.parse(JSON.stringify(detRow))));
ok('E7 identical input -> byte-identical analyzer output', b1 === b2);

// --- summary --------------------------------------------------------------------
console.log(`\n${PASS.length} passed, ${FAIL.length} failed`);
if (FAIL.length) { console.log('FAILED: ' + FAIL.join('; ')); process.exit(1); }
