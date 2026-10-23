#!/usr/bin/env node
// test-vetbench-20261022.js — proof for scripts/policies/vetbench.js
// (flesh-out loop, 2026-10-22, run fleshout-20261022T1915Z, arm
// sim-vetbench, axis scale-onramp).
//
// RED->GREEN on the veteran-bench design + det-gates + D2 + engagement.
// Composition honesty is proved BEFORE any sweep; any gate failure =
// FAIL LOUDLY, no sweep.
//
// SUBSTRATE (pinned, the non-seat long substrate):
//   control  = VB.substrateFor(base) = AD.armedFor(base) (armorydrive
//              stack, ARMORYDRIVE=1, VETBENCH unset)
//   vetbench = VB.armedFor(base)     (withVetBench OUTSIDE the same
//              stack, VETBENCH=1)
// Env (asserted up front): FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
//   WINDEFER=1 SEATDRIVE=0 KILLDISC=1. ARMORYDRIVE=1 always (the stack
//   needs it); VETBENCH toggled per gate.
//
// Gates:
//   E0 module shape (exports, normBase, vbOn, substrateFor/armedFor id tags).
//   E1 DET: VETBENCH unset -> armedFor trajectories byte-identical to
//      substrateFor (2 seeds x 60d) — "VETBENCH-off reproduces control".
//   E2 env-gate: vbOn reads VETBENCH exactly.
//   E3 synthetic RED->GREEN on the wrapper logic (fake base policy, stubbed
//      Game reads):
//      E3a window-live fixtures (filled+shut=live; unfilled / open /
//          read-error = not live);
//      E3b vbVetVids: 2 wave-4+ killers found; dead excluded; scholar
//          excluded; non-killer excluded;
//      E3c benching FIRES on a live window (shelterVillagers called with
//          the eligible veterans; base daily called; engagement counters
//          set; bench beat said once per vid);
//      E3d window not live -> releases previously-benched vids (release
//          beat said; vbMine emptied);
//      E3e gate off = zero counters, base called;
//      E3f muster-active no-release (v.shelterMustered set -> no release,
//          vbMine retained, muster-held counted);
//      E3g scholar-becomes-benched-veteran released from the bench.
//   E4 180d VETBENCH=1 run completes on the real stack + deterministic
//      re-run (D2), KILLDISC v2 installed (the sweep's exact config).
//   E5 ENGAGEMENT: on the real stack, find a live window (adaptive scan
//      over known window configs) and prove the benching newly shelters
//      >=1 veteran on a live-window day — the pre-registered engagement
//      predicate, demonstrated, not just asserted.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//        KILLDISC=1 ARMORYDRIVE=1 VETBENCH=1 node scripts/test-vetbench-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
if (!fs.existsSync(path.join(REPO, 'scripts', 'policies', 'vetbench.js'))) {
  console.error('RED: scripts/policies/vetbench.js missing.');
  process.exit(1);
}

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`GATE STOP: ${k}=1 required (non-seat substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('GATE STOP: SEATDRIVE=0 required (non-seat substrate).'); process.exit(2); }
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'VGEARBEATS', 'TWOVETS', 'VGEAR', 'WAVE4ENGAGE', 'VETWINDOW']) {
  if (k in process.env) { console.error(`GATE STOP: ${k} must be unset (pinned substrate, nothing else).`); process.exit(2); }
}
if (process.env.ARMORYDRIVE !== '1') { console.error('GATE STOP: ARMORYDRIVE=1 required (the stack needs it).'); process.exit(2); }

const VB = require('./policies/vetbench');
const AD = require('./policies/armorydrive');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const KD = require('./killdisc-instrument-20261021');
const { execSync } = require('child_process');

const DET_ENV = () => Object.assign({}, process.env);
function detRun(seed, pol, base, days, vbOn) {
  const env = DET_ENV();
  if (vbOn) env.VETBENCH = '1'; else delete env.VETBENCH;
  const out = execSync(
    `node ${path.join(REPO, 'scripts', 'det-vetbench-20261022.js')} ${seed} ${pol} ${base} ${days}`,
    { cwd: REPO, env, encoding: 'utf8', timeout: 900000 });
  const m = out.trim().split(/\s+/);
  return { digest: m[0], days: parseInt(m[1], 10) };
}

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS', name); }
  else { fail++; console.log('FAIL', name, extra === undefined ? '' : String(extra).slice(0, 500)); }
}
function setVB(on) { if (on) process.env.VETBENCH = '1'; else delete process.env.VETBENCH; }

function fakeBase() {
  return {
    id: 'fake-base', desc: 'test double',
    daily(Game, ctx) { ctx.baseDailyCalled = (ctx.baseDailyCalled || 0) + 1; },
  };
}
function windowStubs(Game, veterans, uw) {
  Game.waveCombatReadiness = (w) => w === 5
    ? { veterans, demand: { veterans: 2 }, short: veterans >= 2 ? [] : ['veterans'] }
    : { veterans: 0, demand: {}, short: [] };
  Game.unlockedWave = () => uw;
}
// Synthetic village: two wave-4+ killers (vetA, vetB), one dead killer
// (vetDead), one non-killer (rookie); vetS is the scholar (also a killer).
function villageStubs(Game, opts) {
  opts = opts || {};
  const scholar = opts.scholar || 'vetS';
  const roster = ['vetA', 'vetB', 'vetDead', 'rookie', scholar];
  const dead = { vetDead: true };
  Game.villagerId = scholar;
  Game.state = Game.state || {};
  Game.state.village = {
    roster: roster.slice(),
    health: { vetA: 90, vetB: 80, rookie: 100 },
    away: {},
    sheltered: Object.assign({}, opts.sheltered || {}),
  };
  if (opts.musterActive) Game.state.village.shelterMustered = { since: 5, threat: 'x' };
  Game.state.waveKillLog = [
    { by: 'vetA', w: 4, d: 90 }, { by: 'vetA', w: 5, d: 95 },
    { by: 'vetB', w: 4, d: 92 },
    { by: 'vetDead', w: 4, d: 80 },
    { by: scholar, w: 4, d: 88 },
    { by: 'vetA', w: 2, d: 40 },
  ];
  Game.vpOf = (vid) => ({ id: vid, dead: !!dead[vid] });
  const sheltered = Game.state.village.sheltered;
  const calls = { shelter: [], release: [], said: [] };
  Game.isSheltered = (vid) => !!sheltered[vid];
  Game.shelterVillagers = (vids, o) => {
    calls.shelter.push(vids.slice());
    let n = 0;
    for (const vid of (vids || [])) {
      if (vid === Game.villagerId || sheltered[vid]) continue;
      sheltered[vid] = { since: 100, reason: (o && o.reason) || 'test' };
      n++;
    }
    return n;
  };
  Game.releaseShelter = (vids) => {
    calls.release.push((vids || []).slice());
    for (const vid of (vids || [])) delete sheltered[vid];
    return (vids || []).length;
  };
  Game.displayName = (vid) => ({ vetA: 'Asha', vetB: 'Bram', rookie: 'Rook', vetS: 'Scholar' }[vid] || vid);
  Game.say = (s) => { calls.said.push(String(s)); };
  return calls;
}
async function realGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'vetbench-test', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}
(async () => {
  // E0: shape.
  check('E0a: exports', ['vbOn', 'vbWindowLive', 'vbIsLiving', 'vbVetVids',
    'vbDraftEligible', 'withVetBench', 'normBase', 'substrateFor', 'armedFor']
    .every(k => typeof VB[k] === 'function'));
  check('E0b: normBase', VB.normBase('lead') === 'leadfeast' && VB.normBase('belongfeast') === 'belongfeast');
  check('E0c: armedFor id tag', String(VB.armedFor('leadfeast').id || '').indexOf('vetbench') >= 0);
  check('E0d: substrateFor is the armorydrive stack (same id tag, not the vetbench wrapper)',
    VB.substrateFor('leadfeast').id === AD.armedFor('leadfeast').id &&
    VB.substrateFor('belongfeast').id === AD.armedFor('belongfeast').id &&
    String(VB.substrateFor('leadfeast').id).indexOf('vetbench') < 0);
  check('E0e: vbOn reads VETBENCH', (() => { setVB(false); const a = VB.vbOn(); setVB(true); const b = VB.vbOn(); return a === false && b === true; })());

  // E1: VETBENCH-off vetbench == control byte-identical (60d x2).
  // Separate processes per trajectory (harness rule: never two harnesses
  // in one node process — shared state).
  setVB(true);
  const e1a1 = detRun(65411, 'armed', 'leadfeast', 60, false);
  const e1a2 = detRun(65411, 'control', 'leadfeast', 60, false);
  check('E1a: VETBENCH-off vetbench(leadfeast) == control byte-identical (s65411 60d)',
    e1a1.digest === e1a2.digest && e1a1.days > 0, 'days ' + e1a1.days + ' vs ' + e1a2.days);
  const e1b1 = detRun(65412, 'armed', 'belongfeast', 60, false);
  const e1b2 = detRun(65412, 'control', 'belongfeast', 60, false);
  check('E1b: VETBENCH-off vetbench(belongfeast) == control byte-identical (s65412 60d)',
    e1b1.digest === e1b2.digest && e1b1.days > 0);

  // E3: synthetic wrapper logic.

  // E3: synthetic wrapper logic.
  setVB(true);
  {
    const G = await realGame(65413);
    windowStubs(G, 2, 4);
    check('E3a1: window live when bar filled + door shut', VB.vbWindowLive(G) === true);
    windowStubs(G, 1, 4);
    check('E3a2: window NOT live when bar unfilled', VB.vbWindowLive(G) === false);
    windowStubs(G, 2, 5);
    check('E3a3: window NOT live when door open', VB.vbWindowLive(G) === false);
    G.waveCombatReadiness = () => { throw new Error('boom'); };
    G.unlockedWave = () => 4;
    check('E3a4: window NOT live on read error (fail closed)', VB.vbWindowLive(G) === false);
  }
  {
    // E3b: the benching set.
    const G = await realGame(65414);
    windowStubs(G, 2, 4);
    villageStubs(G, {});
    const vets = VB.vbVetVids(G).sort();
    check('E3b1: benching set = the 2 living non-scholar wave-4+ killers',
      JSON.stringify(vets) === JSON.stringify(['vetA', 'vetB']), JSON.stringify(vets));
    check('E3b2: draft-eligible reads the draft rules',
      VB.vbDraftEligible(G, 'vetA') === true);
    G.state.village.away = { vetB: true };
    check('E3b3: away veteran not draft-eligible', VB.vbDraftEligible(G, 'vetB') === false);
    G.state.village.away = {};
    G.state.village.sheltered.vetA = { since: 1, reason: 'muster' };
    check('E3b4: already-sheltered veteran not draft-eligible (muster owns them)',
      VB.vbDraftEligible(G, 'vetA') === false);
  }
  {
    // E3c: benching FIRES on a live window.
    const G = await realGame(65415);
    windowStubs(G, 2, 4);
    const calls = villageStubs(G, {});
    const ctx = {};
    const P = VB.withVetBench(fakeBase(), 't', 't');
    P.daily(G, ctx);
    check('E3c1: base daily called (never preempted)', (ctx.baseDailyCalled | 0) === 1);
    check('E3c2: shelterVillagers called with the eligible veterans',
      calls.shelter.length === 1 && JSON.stringify(calls.shelter[0].sort()) === JSON.stringify(['vetA', 'vetB']),
      JSON.stringify(calls.shelter));
    check('E3c3: engagement counters set',
      (ctx.vbWindowDays | 0) === 1 && (ctx.vbBenched | 0) === 2 && ctx.vbEngaged === true,
      'windowDays=' + ctx.vbWindowDays + ' benched=' + ctx.vbBenched);
    check('E3c4: bench beat said once per vid (protective, chafing)',
      calls.said.length === 2 && /bench/.test(calls.said[0]) && /chafes/.test(calls.said[0]),
      calls.said.join(' || ').slice(0, 300));
    const ctx2 = ctx;
    P.daily(G, ctx2); // second live day: no double-shelter, no double-beat
    check('E3c5: no double-shelter / no double-beat on later window days',
      calls.shelter.length === 1 && calls.said.length === 2 && (ctx2.vbBenched | 0) === 2);
  }
  {
    // E3d: window not live -> stand the bench down.
    const G = await realGame(65416);
    windowStubs(G, 1, 4); // bar dropped: window closed
    const calls = villageStubs(G, { sheltered: { vetA: { since: 100, reason: 'vetbench' } } });
    const ctx = { vbMine: ['vetA'], vbSaid: { vetA: true } };
    const P = VB.withVetBench(fakeBase(), 't', 't');
    P.daily(G, ctx);
    check('E3d1: releaseShelter called for the benched vid',
      calls.release.length === 1 && JSON.stringify(calls.release[0]) === JSON.stringify(['vetA']),
      JSON.stringify(calls.release));
    check('E3d2: vbMine emptied, release counted, stand-down beat said',
      ctx.vbMine.length === 0 && (ctx.vbReleased | 0) === 1 && calls.said.length === 1 && /stand/.test(calls.said[0]));
  }
  {
    // E3e: gate off = zero counters, base called.
    setVB(false);
    const G = await realGame(65417);
    windowStubs(G, 2, 4);
    villageStubs(G, {});
    const ctx = {};
    const P = VB.withVetBench(fakeBase(), 't', 't');
    P.daily(G, ctx);
    check('E3e1: gate off delegates to base', (ctx.baseDailyCalled | 0) === 1);
    check('E3e2: gate off = zero bench counters',
      ctx.vbWindowDays === undefined && ctx.vbBenched === undefined && ctx.vbMine === undefined);
    setVB(true);
  }
  {
    // E3f: muster-active no-release.
    const G = await realGame(65418);
    windowStubs(G, 1, 4);
    const calls = villageStubs(G, { musterActive: true, sheltered: { vetA: { since: 100, reason: 'vetbench' } } });
    const ctx = { vbMine: ['vetA'], vbSaid: {} };
    const P = VB.withVetBench(fakeBase(), 't', 't');
    P.daily(G, ctx);
    check('E3f1: muster-active -> no release (the muster owns them)',
      calls.release.length === 0 && ctx.vbMine.length === 1 && (ctx.vbMineMusterHeld | 0) === 1);
  }
  {
    // E3g: a benched veteran who becomes the scholar is released.
    const G = await realGame(65419);
    windowStubs(G, 2, 4);
    const calls = villageStubs(G, { scholar: 'rookie', sheltered: { vetA: { since: 100, reason: 'vetbench' } } });
    // vetA was benched; the mantle passes to vetA mid-window.
    G.villagerId = 'vetA';
    const ctx = { vbMine: ['vetA'], vbSaid: { vetA: true } };
    const P = VB.withVetBench(fakeBase(), 't', 't');
    P.daily(G, ctx);
    check('E3g1: benched vid who becomes scholar is released from the bench',
      calls.release.length === 1 && calls.release[0].indexOf('vetA') >= 0 &&
      ctx.vbMine.indexOf('vetA') < 0, JSON.stringify(calls.release));
  }

  // E4: 180d VETBENCH=1 run + D2 (separate processes — the harness rule).
  // Death-aware: the run may end before day 180; the gate is completion +
  // byte-identity, not the horizon.
  setVB(true);
  const e4a = detRun(65421, 'armed', 'leadfeast', 180, true);
  const e4b = detRun(65421, 'armed', 'leadfeast', 180, true);
  check('E4: 180d VETBENCH=1 run completes + D2 byte-identical',
    e4a.digest === e4b.digest && e4a.days > 0, 'days ' + e4a.days + ' vs ' + e4b.days);

  // E5: ENGAGEMENT on the real stack — adaptive scan for a live window.
  // Scans ALL listed configs (no early break): a live window whose
  // veterans are already game-muster-sheltered (shelterMustered auto-
  // muster, src/js/shelter.js) has nothing for the bench to do — the
  // gate's predicate is a window day where the bench NEWLY shelters.
  const e5scans = [];
  for (const [seed, base] of [[65477, 'leadfeast'], [65477, 'belongfeast'], [65475, 'leadfeast'], [65475, 'belongfeast']]) {
    setVB(true);
    const { Game } = await loadGame({ seed, mode: 'vetbench-e5', fullTelemetry: false });
    const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
    const uninstall = KD.install(Game, t);
    await setupGame(Game);
    let benched = 0, windowDays = 0, engagedFlag = false, anatomy = null, musterCovered = 0;
    let musterActiveWindowDays = 0;
    const oDaily = VB.armedFor(base).daily;
    const policy = Object.assign({}, VB.armedFor(base), {
      daily(G, ctx) {
        if (oDaily) { try { oDaily(G, ctx); } catch (e) {} }
        try {
          benched = Math.max(benched, ctx.vbBenched | 0);
          windowDays = Math.max(windowDays, ctx.vbWindowDays | 0);
          musterCovered = Math.max(musterCovered, ctx.vbMusterCovered | 0);
          if (ctx.vbEngaged) engagedFlag = true;
          if (ctx.vbWindowAnatomy) anatomy = ctx.vbWindowAnatomy;
          try {
            const v = (G.state || {}).village || {};
            if (VB.vbWindowLive(G) && v.shelterMustered) musterActiveWindowDays++;
          } catch (e) {}
        } catch (e) {}
      },
    });
    await quietLog(async () => { await runDays(Game, policy, { days: 180, sampleEvery: 30 }); });
    if (uninstall) { try { uninstall(); } catch (e) {} }
    if (t.instrumentErrors.length) throw new Error('instrument errors: ' + t.instrumentErrors.join('; '));
    const rec = { seed, base, windowDays, benched, engagedFlag, musterCovered, musterActiveWindowDays };
    e5scans.push(rec);
    console.log(`  E5 scan seed=${seed} base=${base}: windowDays=${windowDays} benched=${benched} engaged=${engagedFlag} musterCovered=${musterCovered} musterActiveWindowDays=${musterActiveWindowDays}`);
  }
  const engaged = e5scans.find(r => r.engagedFlag && r.benched >= 1) || null;
  const anyWindow = e5scans.find(r => r.windowDays > 0) || null;
  check('E5a: a live window was found on the real stack (anchor ' +
    (() => { try { return require('child_process').execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim().slice(0, 12); } catch (e) { return '?'; } })() + ')',
    anyWindow !== null && anyWindow.windowDays > 0, JSON.stringify(anyWindow));
  if (engaged) {
    check('E5b: benching ENGAGED on the live window (newly sheltered >=1 veteran)',
      engaged.engagedFlag === true && engaged.benched >= 1, JSON.stringify(engaged));
  } else {
    check('E5b: benching ENGAGED on the live window (newly sheltered >=1 veteran)',
      false, 'scans: ' + JSON.stringify(e5scans));
  }

  console.log(`\nvetbench proof: ${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', e && e.stack || e); process.exit(1); });
