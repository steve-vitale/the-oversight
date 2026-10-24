#!/usr/bin/env node
// test-trustbuffer.js — proof gates for the TRUSTBUFFER=1 depth lever
// (sim-trustbuffer, flesh-out loop, run fleshout-20261023T2217Z, axis
// scale-onramp; claims sim-findings.md #857). GREEN before the sweep.
//
// E1 env-gate: checkEnv() rejects wrong substrates (exit 2), accepts the
//    four legal ARM x POLICY combos with LINKFORM=2 (control|armed x
//    leadfeast|belongfeast); rejects TRUSTBUFFER set on control and unset
//    on armed.
// E2 control legs: policyFor() = LF.linkformArmedFor() /
//    OCR.linkformBelongArmedFor() with LINKFORM=2, TRUSTBUFFER unset (the
//    overcourt-restage armed leg — ONE DELTA ONLY vs the armed leg).
// E3 armed legs: TB.trustbufferArmedFor() / TB.trustbufferBelongArmedFor(),
//    ids trustbuffer-armorvillage / trustbufferbelong-armorvillage,
//    LINKFORM=2 + TRUSTBUFFER=1.
// E4 delegation det-gate: TRUSTBUFFER unset -> trustbuffer.daily delegates
//    to linkform.daily (mock-counted, not behavior-guessed);
//    trustbufferBelong.daily -> linkformBelong.daily.
// E5 mechanism RED->GREEN: mock subordinate link at trust 47, pantry
//    15,000 (below the control's 20000 gate) — control does NOT tend, the
//    TRUSTBUFFER=1 armed leg DOES (one tendLink call). This is the delta.
// E6 band ceiling: trust 70, pantry 15,000 -> neither arm tends (armed
//    skips >= 58; control's loop skips at the 20000 gate).
// E7 survival floor: trust 30, pantry 3,000 (below floor + 1500) -> armed
//    does NOT tend (starvation guardrail by design).
// E8 dedup composition: pantry 60,000, trust 47 -> buffer tend fires once,
//    linkformCourtship's own loop skips the already-tended link (exactly
//    one tendLink call total — one delta, not two).
// E9 band arithmetic pin: 58 - 8 = 50 >= 40 (seasoned holds through a
//    funeral); 47 - 8 = 39 < 40 (the control band dissolves). The design's
//    arithmetic, as a pure assertion.
// E10 analyzer fixtures (REVISED classifier): -136 after formation counts
//    as dissolution (RED pin vs the old exact--102 classifier); +102/+122
//    open the post-formation window; +34 seasoning does not; -102 with no
//    formation = 0.
// E11 det-gate: identical analyzer input -> byte-identical output.
// E12 mechanism engagement head-to-head: 60d on seed 69001, identical
//    seeds, control vs armed — armed fires buffer tends (delta engages on
//    a real seed); trust means reported as evidence.
//
// Usage (pinned substrate):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 \
//   ARMORYDRIVE=1 ARMORVILLAGE=1 LINKFORM=2 node scripts/test-trustbuffer.js
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
  SEATDRIVE: '0', KILLDISC: '1', ARMORYDRIVE: '1', ARMORVILLAGE: '1', LINKFORM: '2',
})) if (!(k in process.env)) process.env[k] = v;

const SWEEP = path.join(REPO, 'scripts', 'trustbuffer-sweep.js');
function gateRun(env) {
  const out = spawnSync(process.execPath,
    ['-e', "require(process.argv[1]); console.log('loaded');", SWEEP],
    { env: Object.assign({}, process.env, env), timeout: 60000, encoding: 'utf8' });
  return out.status;
}
function probePolicy(env) {
  const out = spawnSync(process.execPath, ['-e',
    "const S=require(process.argv[1]);const p=S.policyFor();console.log(JSON.stringify({id:p.id,tag:S.policyTag(),lf:process.env.LINKFORM||'(unset)',tb:process.env.TRUSTBUFFER||'(unset)'}));",
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
ok('E1e rejects LINKFORM unset', gateRun({ ARM: 'control', POLICY: 'leadfeast', LINKFORM: '' }) === 2);
ok('E1f rejects TRUSTBUFFER on control', gateRun({ ARM: 'control', POLICY: 'leadfeast', TRUSTBUFFER: '1' }) === 2);
ok('E1g rejects TRUSTBUFFER unset on armed', gateRun({ ARM: 'armed', POLICY: 'leadfeast', TRUSTBUFFER: '' }) === 2);
ok('E1h accepts control-leadfeast', gateRun({ ARM: 'control', POLICY: 'leadfeast' }) === 0);
ok('E1i accepts armed-leadfeast + TRUSTBUFFER=1', gateRun({ ARM: 'armed', POLICY: 'leadfeast', TRUSTBUFFER: '1' }) === 0);
ok('E1j accepts control-belongfeast', gateRun({ ARM: 'control', POLICY: 'belongfeast' }) === 0);
ok('E1k accepts armed-belongfeast + TRUSTBUFFER=1', gateRun({ ARM: 'armed', POLICY: 'belongfeast', TRUSTBUFFER: '1' }) === 0);

// --- E2/E3: policy composition -----------------------------------------------
let r = probePolicy({ ARM: 'control', POLICY: 'leadfeast' });
ok('E2a control-leadfeast = linkform-armed chain, TRUSTBUFFER unset',
  r.id === 'linkform-armorvillage' && r.lf === '2' && r.tb === '(unset)', JSON.stringify(r));
r = probePolicy({ ARM: 'control', POLICY: 'belongfeast' });
ok('E2b control-belongfeast = linkformbelong-armed chain, TRUSTBUFFER unset',
  r.id === 'linkformbelong-armorvillage' && r.lf === '2' && r.tb === '(unset)', JSON.stringify(r));
r = probePolicy({ ARM: 'armed', POLICY: 'leadfeast', TRUSTBUFFER: '1' });
ok('E3a armed-leadfeast = trustbuffer-armed chain, LINKFORM=2 + TRUSTBUFFER=1',
  r.id === 'trustbuffer-armorvillage' && r.lf === '2' && r.tb === '1', JSON.stringify(r));
r = probePolicy({ ARM: 'armed', POLICY: 'belongfeast', TRUSTBUFFER: '1' });
ok('E3b armed-belongfeast = trustbufferbelong-armed chain, LINKFORM=2 + TRUSTBUFFER=1',
  r.id === 'trustbufferbelong-armorvillage' && r.lf === '2' && r.tb === '1', JSON.stringify(r));

// --- E4: delegation det-gate ---------------------------------------------------
// Patch the linkform bases BEFORE requiring trustbuffer (it destructures at load).
const LF = require(path.join(REPO, 'scripts', 'policies', 'linkform'));
const OCR = require(path.join(REPO, 'scripts', 'policies', 'overcourtrestage'));
const CP = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const realLinkformDaily = LF.linkform.daily;
const realLinkformBelongDaily = OCR.linkformBelong.daily;
const realCompDaily = CP.competent.daily;
let linkformCalls = 0, linkformBelongCalls = 0, compCalls = 0;
LF.linkform.daily = function () { linkformCalls++; return null; };
OCR.linkformBelong.daily = function () { linkformBelongCalls++; return null; };
CP.competent.daily = function () { compCalls++; return null; };
const TB = require(path.join(REPO, 'scripts', 'policies', 'trustbuffer'));

function mockGame(o) {
  // Simulates the engine's tendLink contract: once per week (tendedWeek),
  // refused during mourning (no tendedWeek stamp), +8 trust otherwise.
  o = o || {};
  const calls = [];
  const day = o.day != null ? o.day : 30;
  const week = Math.floor(day / 7);
  const links = (o.links || []).map(l => Object.assign({}, l));
  return {
    calls, links,
    state: {
      scholar: { day },
      village: {
        pantry: [{ kcalEach: 1000, units: o.pantryUnits != null ? o.pantryUnits : 60 }],
        roster: new Array(12).fill(0).map((_, i) => ({ id: 'v' + i })),
        burnHistory: [],
      },
      otherVillages: [{ id: 'v1', name: 'V1' }, { id: 'v2', name: 'V2' }],
      pendingCounter: null, pendingAccord: null, pendingNational: null, pendingGlobal: null,
    },
    hierarchyState: () => links,
    knowsVillage: () => true,
    linkWith: () => null,
    proposeLink: (id) => { calls.push(['proposeLink', id]); return null; },
    tendLink: (id) => {
      const link = links.find(l => l.id === id);
      calls.push(['tendLink', id, (link && link.trust) || 0]);
      if (!link) return 0;
      if (link.tendedWeek === week) return 0;
      if ((link.mourningUntil || 0) > day) return 0; // grief is not bought off
      link.tendedWeek = week;
      link.trust = Math.min(100, (link.trust || 0) + 8);
      return 1500;
    },
    _week: () => week,
  };
}
const subLink = (trust, extra) => Object.assign({
  id: 'l1', status: 'active', primary: 'haven', subordinate: 'v1',
  trust, tendedWeek: -1, day: 0,
}, extra || {});

try {
  process.env.LINKFORM = '2';
  delete process.env.TRUSTBUFFER;
  linkformCalls = 0; linkformBelongCalls = 0; compCalls = 0;
  TB.trustbuffer.daily(mockGame(), {});
  ok('E4a TRUSTBUFFER unset: trustbuffer.daily delegates to linkform.daily',
    linkformCalls === 1 && compCalls === 0, `linkform=${linkformCalls} comp=${compCalls}`);

  linkformCalls = 0; linkformBelongCalls = 0; compCalls = 0;
  TB.trustbufferBelong.daily(mockGame(), {});
  ok('E4b TRUSTBUFFER unset: trustbufferBelong.daily delegates to linkformBelong.daily',
    linkformBelongCalls === 1 && compCalls === 0, `linkformBelong=${linkformBelongCalls} comp=${compCalls}`);

  process.env.TRUSTBUFFER = '1';
  linkformCalls = 0; linkformBelongCalls = 0; compCalls = 0;
  const gArmed = mockGame({ links: [subLink(70)] }); // above the band: no buffer tend
  TB.trustbuffer.daily(gArmed, {});
  ok('E4c TRUSTBUFFER=1 + LINKFORM=2: runs competent.daily + courtship, NOT linkform.daily',
    compCalls === 1 && linkformCalls === 0, `comp=${compCalls} linkform=${linkformCalls}`);
} finally {
  LF.linkform.daily = realLinkformDaily;
  OCR.linkformBelong.daily = realLinkformBelongDaily;
  CP.competent.daily = realCompDaily;
  delete process.env.TRUSTBUFFER;
}

// --- E5/E6/E7/E8: the tending rule ----------------------------------------------
function bufferCalls(o) {
  // calls trustbufferTend directly (unit precision), returns tendLink calls
  const g = mockGame(o);
  const ctx = {};
  process.env.TRUSTBUFFER = '1';
  try { TB.trustbufferTend(g, ctx); } finally { delete process.env.TRUSTBUFFER; }
  return { tendCalls: g.calls.filter(c => c[0] === 'tendLink'), ctx, links: g.links };
}

{
  // E5: trust 47, pantry 15,000 (60 units x 1000 = 60,000... no — pantryUnits
  // is units of 1000-kcal items; use 15 units = 15,000 kcal, below the
  // control's 20000 gate, above the buffer floor ~13,500)
  const r47 = bufferCalls({ links: [subLink(47)], pantryUnits: 15 });
  ok('E5 RED->GREEN: buffer tends a trust-47 link the control skips (pantry 15k < 20000 gate)',
    r47.tendCalls.length === 1 && r47.ctx.trustbufferTended === 1 && r47.links[0].trust === 55,
    `tendCalls=${r47.tendCalls.length} trust=${r47.links[0].trust}`);

  // E6: trust 70 (>= 58 band), pantry 15,000 -> no buffer tend
  const r70 = bufferCalls({ links: [subLink(70)], pantryUnits: 15 });
  ok('E6 above the band (trust 70): no buffer tend',
    r70.tendCalls.length === 0 && (r70.ctx.trustbufferTended | 0) === 0,
    `tendCalls=${r70.tendCalls.length}`);

  // E7: trust 30, pantry 3,000 (below floor + 1500) -> no tend (starvation guardrail)
  const r30 = bufferCalls({ links: [subLink(30)], pantryUnits: 3 });
  ok('E7 survival floor: trust-30 link, pantry 3k -> no tend (never tends into the last half-day)',
    r30.tendCalls.length === 0, `tendCalls=${r30.tendCalls.length} floor=${TB.trustbufferFloor(mockGame({}))}`);

  // E8: pantry 60,000 (above the control gate), trust 47 -> buffer tend fires
  // once, and linkformCourtship's own loop skips the already-tended link
  // (engine dedup) — one tendLink call total through the full courtship.
  process.env.LINKFORM = '2'; process.env.TRUSTBUFFER = '1';
  const g = mockGame({ links: [subLink(47)], pantryUnits: 60, day: 30 });
  const ctx = {};
  try { TB.trustbufferCourtship(g, ctx, 2); } finally { process.env.LINKFORM = '2'; delete process.env.TRUSTBUFFER; }
  const tc = g.calls.filter(c => c[0] === 'tendLink');
  ok('E8 dedup: full courtship, pantry 60k, trust 47 -> exactly one tendLink call (buffer first, shared loop skips)',
    tc.length === 1 && (ctx.trustbufferTended | 0) === 1 && (ctx.tended | 0) === 0,
    `tendCalls=${tc.length} buffer=${ctx.trustbufferTended | 0} loop=${ctx.tended | 0}`);
}

// --- E9: band arithmetic ----------------------------------------------------------
ok('E9a band math: 58 - 8 = 50 >= 40 (seasoned holds through a funeral)',
  TB.TRUSTBUFFER_BAND - 8 >= 40, `band=${TB.TRUSTBUFFER_BAND}`);
ok('E9b control-band math: 47 - 8 = 39 < 40 (the 40-48 band dissolves)',
  47 - 8 < 40);

// --- E10: analyzer fixtures (REVISED classifier) ------------------------------------
const AN = require(path.join(REPO, 'scripts', 'trustbuffer-analyze'));

function synthRow(dipSteps, endDip) {
  const window = [{ day: 0, raw: 0 }];
  let raw = 0;
  for (const s of dipSteps) { raw += s.step; window.push({ day: s.day, raw }); }
  return {
    seed: 1, arm: 'control', policy: 'leadfeast', gameDays: 180,
    deaths: {}, gateVector: { dip: endDip }, dipSteps, window,
    tended: 0, bufferTended: 0,
  };
}
const step = (day, s) => ({ day, step: s });

let a1 = AN.analyzeRun(synthRow([step(60, 102), step(90, -102)], 0));
ok('E10a +102 then -102 = 1 post-formation dissolution', a1.postFormDiss === 1 && a1.firstForm === 60);

let a2 = AN.analyzeRun(synthRow([step(60, 102), step(111, -136)], -34));
ok('E10b REVISED: +102 then -136 = 1 dissolution (the full-polity collapse the old classifier missed)',
  a2.postFormDiss === 1, `postFormDiss=${a2.postFormDiss} days=${JSON.stringify(a2.postFormDissDays)}`);

function oldClassify(stepV) { // the overcourt-restage pre-review classifier: exact -102 only
  return stepV === -102 ? 'dissolution' : 'other';
}
ok('E10c RED pin: old exact--102 classifier misses the -136',
  oldClassify(-136) !== 'dissolution', `old=${oldClassify(-136)}`);

let a3 = AN.analyzeRun(synthRow([step(50, 34), step(60, 102), step(90, -102)], 34));
ok('E10d +34 seasoning before formation: window opens at formation, 1 post-form',
  a3.postFormDiss === 1 && a3.firstForm === 60);

let a4 = AN.analyzeRun(synthRow([step(50, 34), step(90, -102)], -68));
ok('E10e +34 seasoning, then -102, NO formation -> 0 post-formation',
  a4.postFormDiss === 0 && a4.firstForm === null);

let a5 = AN.analyzeRun(synthRow([step(90, -102)], -102));
ok('E10f -102 with no formation = 0 post-formation', a5.postFormDiss === 0 && a5.firstForm === null);

let a6 = AN.analyzeRun(synthRow([step(60, 122), step(95, -170)], -48));
ok('E10g +122 feast bundle opens the window; -170 5-link collapse counts',
  a6.firstForm === 60 && a6.postFormDiss === 1);

// --- E11: det-gate ------------------------------------------------------------------
const detRow = synthRow([step(60, 102), step(75, 34), step(90, -136)], 0);
const b1 = JSON.stringify(AN.analyzeRun(detRow));
const b2 = JSON.stringify(AN.analyzeRun(JSON.parse(JSON.stringify(detRow))));
ok('E11 identical input -> byte-identical analyzer output', b1 === b2);

// --- E12: mechanism engagement head-to-head (60d, seed 69001, identical seeds) -------
async function headToHead() {
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const results = {};
  for (const arm of ['control', 'armed']) {
    if (arm === 'control') { delete process.env.TRUSTBUFFER; }
    else { process.env.TRUSTBUFFER = '1'; }
    process.env.LINKFORM = '2';
    const policy = arm === 'control' ? LF.linkformArmedFor() : TB.trustbufferArmedFor();
    const { Game } = await loadGame({ seed: 69001, mode: 'trustbuffer-e12', fullTelemetry: false });
    await setupGame(Game);
    let lastCtx = null;
    const wrapped = Object.assign({}, policy, {
      daily(Gm, ctx) { lastCtx = ctx; return policy.daily(Gm, ctx); },
    });
    await quietLog(async () => { await runDays(Game, wrapped, { days: 60, manifest: undefined, sampleEvery: 30 }); });
    const links = Game.hierarchyState().filter(l => l && l.status === 'active' && l.primary === 'haven');
    const meanTrust = links.length ? links.reduce((a, l) => a + (l.trust || 0), 0) / links.length : null;
    results[arm] = {
      bufferTended: (lastCtx && lastCtx.trustbufferTended) | 0,
      tended: (lastCtx && lastCtx.tended) | 0,
      nSubLinks: links.length,
      meanTrust: meanTrust == null ? null : Math.round(meanTrust * 10) / 10,
    };
    console.log(`    E12 ${arm}: bufferTended=${results[arm].bufferTended} tended=${results[arm].tended} subLinks=${results[arm].nSubLinks} meanTrust=${results[arm].meanTrust}`);
  }
  delete process.env.TRUSTBUFFER;
  return results;
}

(async () => {
  try {
    const hh = await headToHead();
    ok('E12a delta engages on a real seed: armed bufferTended > 0, control bufferTended = 0',
      hh.armed.bufferTended > 0 && hh.control.bufferTended === 0,
      `control=${hh.control.bufferTended} armed=${hh.armed.bufferTended}`);
    // trust means are evidence, not a gate (funeral RNG on one seed) — print for the record.
    console.log(`    E12b evidence: mean subordinate trust at d60 — control ${hh.control.meanTrust} (n=${hh.control.nSubLinks}), armed ${hh.armed.meanTrust} (n=${hh.armed.nSubLinks})`);
  } catch (e) {
    ok('E12 head-to-head ran without instrument errors', false, String((e && e.message) || e));
  }
  console.log(`\n${PASS.length} passed, ${FAIL.length} failed`);
  if (FAIL.length) { console.log('FAILED: ' + FAIL.join('; ')); process.exit(1); }
})().catch(e => { console.error(e && e.stack || e); process.exit(1); });
