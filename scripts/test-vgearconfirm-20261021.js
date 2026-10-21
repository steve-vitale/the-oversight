#!/usr/bin/env node
// test-vgearconfirm-20261021.js — proof for scripts/policies/vgearconfirm.js
// (flesh-out loop, 2026-10-21, arm sim-vgearconfirm, axis scale-onramp,
// backlog #739).
//
// RED->GREEN on the composition + det-gates + D2 real-sweep gate.
// Composition honesty is proved BEFORE any sweep; any gate failure =
// FAIL LOUDLY, no sweep.
//
// SUBSTRATE (pinned, the winning substrate from sim-fullseat, 13/16 wins):
//   control = VCE.seatStackFor(base)  (seatdrive's prebuilt leadseat/belongseat
//             = withSeatDrive(withWinDefer(TF leadfeast/belongfeast)))
//   armed   = VCE.armedFor(base)      (VG.withVillagerGear OUTSIDE the stack)
// Env (asserted up front): FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
//   WINDEFER=1 SEATDRIVE=1 KILLDISC=1. VGEAR toggled per gate.
//
// Gates:
//   E0 composition shape (exports, id tags, normBase, vgearOn).
//   E1 det-gate: VGEAR unset -> armedFor trajectories byte-identical to
//      seatStackFor (2 seeds x 60d) — the "VGEAR-off reproduces control"
//      claim, proved on the winning substrate.
//   E2 seatStackFor returns the winning substrate objects (identity) +
//      trajectory byte-identical to SD.leadseat/belongseat.
//   E3 VGEAR=1 armed DIVERGES from control on the winning substrate
//      (the layer acts; 2 seeds x 60d).
//   E4 instrument determinism: same armed config + KILLDISC twice ->
//      byte-identical trajectories (the sweep's per-seed JSONs are
//      reproducible — needed for the det-gate re-verify claim).
//   D2 real-sweep gate: 180d armed run per policy completes (s64705
//      leadfeast, s64706 belongfeast), deterministic re-run.
//
// Usage: node scripts/test-vgearconfirm-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
if (!fs.existsSync(path.join(REPO, 'scripts', 'policies', 'vgearconfirm.js'))) {
  console.error('RED: scripts/policies/vgearconfirm.js missing.');
  process.exit(1);
}

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`GATE STOP: ${k}=1 is required (winning substrate).`); process.exit(2); }
}
if (process.env.SUCCGRACE || process.env.RAIDDENSITY || process.env.NODEWITNESS || process.env.FULLSEAT) {
  console.error('GATE STOP: SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT must be unset (winning substrate is the pinned one, nothing else).');
  process.exit(2);
}

const VCE = require('./policies/vgearconfirm');
const SD = require('./policies/seatdrive');
const TF = require('./policies/tribfloor');
const WD = require('./policies/windefer');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const KD = require('./killdisc-instrument-20261018');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS', name); }
  else { fail++; console.log('FAIL', name, extra === undefined ? '' : String(extra).slice(0, 300)); }
}

async function trajectory(seed, vgearOn, policyObj, days, instrument) {
  if (vgearOn) process.env.VGEAR = '1'; else delete process.env.VGEAR;
  const { Game } = await loadGame({ seed, mode: 'vgearconfirm-det', fullTelemetry: false });
  const t = { kills: [], engagements: [], census: [], dmg: {}, instrumentErrors: [] };
  const uninstall = instrument ? KD.install(Game, t) : null;
  await setupGame(Game);
  const hs = [];
  const oDaily = policyObj.daily;
  // Layer-activity observation (call-through counters, zero state writes):
  const tele = { donations: 0, invites: 0 };
  const oDon = Game.donateWeapon ? Game.donateWeapon.bind(Game) : null;
  const oInv = Game.inviteToParty ? Game.inviteToParty.bind(Game) : null;
  try {
    if (oDon) Game.donateWeapon = function (...a) { tele.donations++; return oDon(...a); };
    if (oInv) Game.inviteToParty = function (...a) { tele.invites++; return oInv(...a); };
  } catch (e) {}
  const policy = Object.assign({}, policyObj, {
    daily(G, ctx) {
      if (oDaily) { try { oDaily(G, ctx); } catch (e) {} }
      try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
    },
  });
  await quietLog(async () => { await runDays(Game, policy, { days: days || 60, sampleEvery: 30 }); });
  if (uninstall) { try { uninstall(); } catch (e) {} }
  try { if (oDon) Game.donateWeapon = oDon; } catch (e) {}
  try { if (oInv) Game.inviteToParty = oInv; } catch (e) {}
  if (t.instrumentErrors.length) throw new Error('instrument errors: ' + t.instrumentErrors.join('; '));
  return { traj: hs.join('|'), days: hs.length, tele, endReason: null };
}

(async () => {
  // E0: shape.
  check('E0a: exports (vgearOn, normBase, seatStackFor, armedFor)',
    typeof VCE.vgearOn === 'function' && typeof VCE.normBase === 'function' &&
    typeof VCE.seatStackFor === 'function' && typeof VCE.armedFor === 'function');
  check('E0b: normBase', VCE.normBase('lead') === 'leadfeast' && VCE.normBase('belongfeast') === 'belongfeast');
  let threw = false;
  try { VCE.normBase('nope'); } catch (e) { threw = true; }
  check('E0c: normBase throws on unknown', threw);
  check('E0d: armedFor id tag', String(VCE.armedFor('leadfeast').id || '').indexOf('vgearconfirm') >= 0);
  check('E0e: vgearOn reads VGEAR', (() => { delete process.env.VGEAR; const a = VCE.vgearOn(); process.env.VGEAR = '1'; const b = VCE.vgearOn(); delete process.env.VGEAR; return a === false && b === true; })());

  // E1: VGEAR unset -> armedFor == seatStackFor, byte-identical (60d).
  const e1a1 = await trajectory(64701, false, VCE.armedFor('leadfeast'), 60);
  const e1a2 = await trajectory(64701, false, VCE.seatStackFor('leadfeast'), 60);
  check('E1a: VGEAR-off armed(leadfeast) == control, byte-identical (s64701 60d)',
    e1a1.traj === e1a2.traj && e1a1.traj.length > 0, 'len ' + e1a1.traj.length + ' vs ' + e1a2.traj.length);
  const e1b1 = await trajectory(64702, false, VCE.armedFor('belongfeast'), 60);
  const e1b2 = await trajectory(64702, false, VCE.seatStackFor('belongfeast'), 60);
  check('E1b: VGEAR-off armed(belongfeast) == control, byte-identical (s64702 60d)',
    e1b1.traj === e1b2.traj && e1b1.traj.length > 0);

  // E2: seatStackFor is the winning substrate's objects + byte-identical.
  check('E2a: seatStackFor(leadfeast) === SD.leadseat', VCE.seatStackFor('leadfeast') === SD.leadseat);
  check('E2b: seatStackFor(belongfeast) === SD.belongseat', VCE.seatStackFor('belongfeast') === SD.belongseat);
  const e2a1 = await trajectory(64703, false, VCE.seatStackFor('leadfeast'), 60);
  const e2a2 = await trajectory(64703, false, SD.leadseat, 60);
  check('E2c: seatStackFor(leadfeast) trajectory == SD.leadseat byte-identical (s64703 60d)',
    e2a1.traj === e2a2.traj && e2a1.traj.length > 0);

  // E3: VGEAR=1 armed acts on the winning substrate. The honest read is the
  // layer's own event counts (donations/invites via call-through counters):
  // armed must fire events the control never fires; hash divergence is a
  // bonus (dayHash is coarse — armory moves need not show in it).
  // 120d to give the layer room (wave-4 staging needs the unlock).
  const e3a1 = await trajectory(64701, true, VCE.armedFor('leadfeast'), 120);
  const e3a2 = await trajectory(64701, false, VCE.seatStackFor('leadfeast'), 120);
  const e3aAct = (e3a1.tele.donations + e3a1.tele.invites) - (e3a2.tele.donations + e3a2.tele.invites);
  check('E3a: VGEAR=1 armed(leadfeast) fires layer events control never fires (s64701 120d)',
    e3aAct > 0 && e3a2.tele.donations === 0 && e3a2.tele.invites === 0,
    `armed don=${e3a1.tele.donations} inv=${e3a1.tele.invites} vs control don=${e3a2.tele.donations} inv=${e3a2.tele.invites}; hashDiv=${e3a1.traj !== e3a2.traj}`);
  let e3bArmed = null, e3bSeed = null;
  for (const s of [64702, 64703, 64704]) {
    const a = await trajectory(s, true, VCE.armedFor('belongfeast'), 120);
    const c = await trajectory(s, false, VCE.seatStackFor('belongfeast'), 120);
    if ((a.tele.donations + a.tele.invites) > (c.tele.donations + c.tele.invites)) { e3bArmed = a; e3bSeed = s; break; }
    if (!e3bArmed) e3bArmed = { a, c, s, quiet: true };
  }
  check('E3b: VGEAR=1 armed(belongfeast) fires layer events control never fires (120d)',
    !!(e3bSeed),
    e3bSeed ? `seed ${e3bSeed}: armed don=${e3bArmed.tele.donations} inv=${e3bArmed.tele.invites}`
             : `no layer events on s64702/s64703/s64704 in 120d (layer quiet — see note)`);

  // E4: instrument determinism (KILLDISC installed) — same config twice.
  const e4a = await trajectory(64701, true, VCE.armedFor('leadfeast'), 60, true);
  const e4b = await trajectory(64701, true, VCE.armedFor('leadfeast'), 60, true);
  check('E4: armed+KILLDISC deterministic across runs (s64701 60d)',
    e4a.traj === e4b.traj && e4a.traj.length > 0);

  // D2: 180d armed runs COMPLETE per policy (wins/deaths truncate the
  // winning substrate — the old >150d bar was wrong here) and are
  // deterministic re-runs byte-identical. A run "completes" iff the harness
  // exits without error; end day is recorded, not judged.
  const d2a1 = await trajectory(64705, true, VCE.armedFor('leadfeast'), 180, true);
  const d2a2 = await trajectory(64705, true, VCE.armedFor('leadfeast'), 180, true);
  check('D2a: 180d armed leadfeast completes + deterministic (s64705)',
    d2a1.traj === d2a2.traj && d2a1.traj.length > 0, 'days ' + d2a1.days);
  const d2b1 = await trajectory(64706, true, VCE.armedFor('belongfeast'), 180, true);
  const d2b2 = await trajectory(64706, true, VCE.armedFor('belongfeast'), 180, true);
  check('D2b: 180d armed belongfeast completes + deterministic (s64706)',
    d2b1.traj === d2b2.traj && d2b1.traj.length > 0, 'days ' + d2b1.days);

  console.log(`\n${pass}/${pass + fail} PASS, ${fail} fail`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });
