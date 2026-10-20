#!/usr/bin/env node
// test-vgearseat-20261020.js — sim-vgearseat proof (flesh-out loop,
// 2026-10-20, run fleshout-20261020T2145Z, arm sim-vgearseat, axis
// scale-onramp).
//
// COMPOSITION HONESTY FIRST: this arm composes the proven VGEAR channel onto
// the SEATDRIVE default-on substrate. Before any sweep, the proof pins:
//   E1: VGEAR=1 + SEATDRIVE=0 delegates byte-identically to the vgear pilot's
//       SEATDRIVE=0 armed substrate (the exact stackFor from
//       scripts/sweep-villagergear-20261020.js, rebuilt inline below).
//   E2: VGEAR unset + SEATDRIVE unset = the pure seat stack byte-identical
//       (this module's inner stack vs seatdrive.js's prebuilt
//       leadseat/belongseat — the winning 10/16 substrate objects).
//   E3: gate-off purity inside the module (VGEAR unset: armed obj == inner stack).
//   E4: gate-on liveness (VGEAR=1 armed diverges from control — the layer acts).
//   D2: real-sweep gate — 180d armed run per policy completes, deterministic
//       re-run.
// If any composition gate fails, the composition is NOT "fixed" — the arm
// FAILS LOUDLY and stops (per the brief).
//
// Canon: docs/CANON.md, docs/MONSTER-WAVES.md.
// Substrate env (set in-process for the D-gates): FEASTSCALE_R13=1
//   TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1
//   NODEWITNESS=1 (VETREL/REPOSITION unset -> inert; SEATDRIVE and VGEAR
//   toggled per gate).
//
// Usage: node scripts/test-vgearseat-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');

// KILL-PROTOCOL INFO-SKIP: if the layer is deleted (VGEARSEAT_KILLED=1 set by
// the coordinator after a killed arm), this proof exits green with an
// INFO-SKIP instead of FATAL-ing. Without the layer and without the flag,
// absence is RED (exit 1).
if (!fs.existsSync(path.join(__dirname, 'policies', 'vgearseat.js'))) {
  if (process.env.VGEARSEAT_KILLED === '1') {
    console.log('INFO-SKIP: vgearseat layer deleted per kill protocol (sim-vgearseat NO-GO) — proof not applicable.');
    process.exit(0);
  }
  console.error('RED: scripts/policies/vgearseat.js missing and VGEARSEAT_KILLED not set.');
  process.exit(1);
}

const VSE = require('./policies/vgearseat');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// E0: composition shape.
{
  check('E0a: module exports seatStackFor', typeof VSE.seatStackFor === 'function');
  check('E0b: module exports armedFor', typeof VSE.armedFor === 'function');
  check('E0c: control id carries no vgear mark',
    /leadfeast-windefer$/.test(VSE.seatStackFor('leadfeast').id));
  check('E0d: armed id carries the vgear mark',
    /leadfeast-vgear$/.test(VSE.armedFor('leadfeast').id));
  check('E0e: both bases present',
    typeof VSE.seatStackFor('belongfeast').daily === 'function' &&
    typeof VSE.armedFor('belongfeast').daily === 'function');
}

// E1–E4, D2: real-harness gates.
(async () => {
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { dayHash } = require('./det-gate');
  const TF = require('./policies/tribfloor');
  const RP = require('./policies/reposition');
  const VR = require('./policies/vetrel');
  const WD = require('./policies/windefer');
  const SD = require('./policies/seatdrive');
  const VG = require('./policies/villagergear');

  // Substrate env for the gates (mirrors the sweep's loud-fail gates).
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS']) process.env[k] = '1';
  delete process.env.VETREL; delete process.env.REPOSITION;

  // The vgear pilot's armed substrate, rebuilt inline from
  // scripts/sweep-villagergear-20261020.js stackFor (the exact composition
  // the E1 gate must be byte-identical to under VGEAR=1 + SEATDRIVE=0).
  function pilotStackFor(base, tag) {
    const r = RP.withReposition(base, tag + '-reposition', tag + ' reposition');
    const v = VR.withVetrel(r, tag + '-vetrel', tag + ' vetrel');
    const w = WD.withWinDefer(v, tag + '-windefer', tag + ' windefer');
    const s = SD.withSeatDrive(w, tag + '-windefer', tag + '-windefer + seatdrive');
    return VG.withVillagerGear(s, tag + '-vgear', tag + ' + villagergear');
  }

  async function trajectory(seed, env, policyObj, days) {
    if (env.VGEAR) process.env.VGEAR = '1'; else delete process.env.VGEAR;
    if (env.SEATDRIVE === '0') process.env.SEATDRIVE = '0'; else delete process.env.SEATDRIVE;
    const { Game } = await loadGame({ seed, mode: 'vgearseat-det', fullTelemetry: false });
    await setupGame(Game);
    const hs = [];
    const oDaily = policyObj.daily;
    const policy = Object.assign({}, policyObj, {
      daily(G, ctx) { if (oDaily) { try { oDaily(G, ctx); } catch (e) {} } try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {} },
    });
    await quietLog(async () => { await runDays(Game, policy, { days: days || 60, sampleEvery: 30 }); });
    return hs.join('|');
  }

  const E1ENV = { VGEAR: '1', SEATDRIVE: '0' };
  // E1: VGEAR=1 + SEATDRIVE=0 == the vgear pilot's SEATDRIVE=0 substrate.
  const e1a1 = await trajectory(64301, E1ENV, VSE.armedFor('leadfeast'));
  const e1a2 = await trajectory(64301, E1ENV, pilotStackFor(TF.leadfeast, 'leadfeast'));
  check('E1a: VGEAR=1+SEATDRIVE=0 armed(leadfeast) == vgear pilot SEATDRIVE=0 substrate (s64301)',
    e1a1 === e1a2 && e1a1.length > 0, `len=${e1a1.length}`);
  const e1b1 = await trajectory(64302, E1ENV, VSE.armedFor('belongfeast'));
  const e1b2 = await trajectory(64302, E1ENV, pilotStackFor(TF.belongfeast, 'belongfeast'));
  check('E1b: VGEAR=1+SEATDRIVE=0 armed(belongfeast) == vgear pilot SEATDRIVE=0 substrate (s64302)',
    e1b1 === e1b2 && e1b1.length > 0, `len=${e1b1.length}`);

  // E2: VGEAR unset + SEATDRIVE unset == the pure seat stack (the winning
  // 10/16 substrate's own prebuilt objects).
  const e2a1 = await trajectory(64301, {}, VSE.seatStackFor('leadfeast'));
  const e2a2 = await trajectory(64301, {}, SD.leadseat);
  check('E2a: VGEAR unset+SEATDRIVE unset control(leadfeast) == prebuilt leadseat (s64301)',
    e2a1 === e2a2 && e2a1.length > 0, `len=${e2a1.length}`);
  const e2b1 = await trajectory(64302, {}, VSE.seatStackFor('belongfeast'));
  const e2b2 = await trajectory(64302, {}, SD.belongseat);
  check('E2b: VGEAR unset+SEATDRIVE unset control(belongfeast) == prebuilt belongseat (s64302)',
    e2b1 === e2b2 && e2b1.length > 0, `len=${e2b1.length}`);

  // E3: gate-off purity inside the module — VGEAR unset: armed obj == inner stack.
  const e3a1 = await trajectory(64301, {}, VSE.armedFor('leadfeast'));
  const e3a2 = await trajectory(64301, {}, VSE.seatStackFor('leadfeast'));
  check('E3: VGEAR unset armed obj byte-identical to inner stack (s64301)',
    e3a1 === e3a2 && e3a1.length > 0, `len=${e3a1.length}`);

  // E4: gate-on liveness — VGEAR=1 armed diverges from control (the layer acts).
  const e4on = await trajectory(64301, { VGEAR: '1' }, VSE.armedFor('leadfeast'));
  const e4off = await trajectory(64301, {}, VSE.seatStackFor('leadfeast'));
  check('E4: VGEAR=1 armed diverges from control on the seat substrate (s64301)',
    e4on !== e4off && e4on.length > 0 && e4off.length > 0, `on=${e4on.length} off=${e4off.length}`);

  // D2: real-sweep gate — 180d armed run per policy completes, deterministic re-run.
  for (const base of ['leadfeast', 'belongfeast']) {
    process.env.VGEAR = '1'; delete process.env.SEATDRIVE;
    const pol = VSE.armedFor(base);
    const { Game } = await loadGame({ seed: 64301, mode: 'vgearseat-sweep', fullTelemetry: false });
    await setupGame(Game);
    let result = null;
    await quietLog(async () => { result = await runDays(Game, pol, { days: 180, sampleEvery: 30 }); });
    const { Game: Game2 } = await loadGame({ seed: 64301, mode: 'vgearseat-sweep', fullTelemetry: false });
    await setupGame(Game2);
    let result2 = null;
    await quietLog(async () => { result2 = await runDays(Game2, pol, { days: 180, sampleEvery: 30 }); });
    const same = (result.days === result2.days) && (result.endReason === result2.endReason);
    check(`D2: 180d armed ${base} s64301 completes, deterministic`,
      !!result && !!result2 && same,
      `days=${result && result.days}/${result2 && result2.days} end=${result && result.endReason}`);
    delete process.env.VGEAR;
  }

  console.log(`\n${pass} pass, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });
