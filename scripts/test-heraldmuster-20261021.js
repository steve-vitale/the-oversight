#!/usr/bin/env node
// test-heraldmuster-20261021.js — proof for scripts/policies/heraldmuster.js
// and scripts/heraldmuster-instrument-20261021.js (flesh-out loop,
// 2026-10-21, arm sim-heraldmuster, axis scale-onramp, killdisc finding 3).
//
// RED->GREEN on the composition + det-gates + engagement gate + D2 real-sweep
// gate. Composition honesty is proved BEFORE any sweep; any gate failure =
// FAIL LOUDLY, no sweep.
//
// SUBSTRATE (pinned, the winning substrate from sim-fullseat, 13/16 wins):
//   control = HM.seatStackFor(base)  (seatdrive's prebuilt leadseat/belongseat
//             = withSeatDrive(withWinDefer(TF leadfeast/belongfeast)))
//   armed   = HM.armedFor(base)       (withHeraldMuster OUTSIDE the stack)
// Env (asserted up front — the Usage header): FEASTSCALE_R13=1 TRIBFLOOR=1
//   WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 HERALDCENSUS=1. HERALDMUSTER toggled
//   per gate.
//
// Gates:
//   E0 composition shape (exports, id tags, normBase, layerOn).
//   E1 det-gate: HERALDMUSTER unset -> armedFor trajectories byte-identical
//      to seatStackFor (2 seeds x 60d) — the "off reproduces control"
//      claim, proved on the winning substrate.
//   E2 instrument det-gate: HERALDCENSUS unset -> install never called;
//      with HERALDCENSUS=1 the instrument is read-only: a wrapped 30d run
//      is byte-identical to an unwrapped one.
//   E3 layer ACTS on a fixture (two trusted active links + located omen):
//      the call answers 6+6 blades, the two-tap commit sends Haven's own,
//      titanMusterReady('herald') flips true — said aloud (sense check).
//      And: no omen/links -> the layer does nothing harmful; re-driving a
//      ready muster does not re-sound (refusals cost trust — never burned).
//   E4 engagement gate (the instrument's attribution): F1 — fresh game, no
//      muster: startCombat('herald') is REFUSED (null), instrument verdict
//      'refused', 0 unexplained. F2 — fixture gate-ready muster: the real
//      startCombat('herald') is ACCEPTED (a fight starts), verdict
//      'accepted', 0 unexplained.
//   D2 real-sweep gate: 180d armed run per policy completes, deterministic
//      re-run (the sweep's per-seed JSONs are reproducible).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 HERALDCENSUS=1 \
//   node scripts/test-heraldmuster-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
if (!fs.existsSync(path.join(REPO, 'scripts', 'policies', 'heraldmuster.js'))) {
  console.error('RED: scripts/policies/heraldmuster.js missing.');
  process.exit(1);
}
if (!fs.existsSync(path.join(REPO, 'scripts', 'heraldmuster-instrument-20261021.js'))) {
  console.error('RED: scripts/heraldmuster-instrument-20261021.js missing.');
  process.exit(1);
}

// ---- env-gate (the Usage header, asserted up front) ----
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'HERALDCENSUS']) {
  if (process.env[k] !== '1') { console.error(`GATE STOP: ${k}=1 is required (winning substrate + census).`); process.exit(2); }
}
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT', 'VETREL', 'REPOSITION', 'VGEARBEATS']) {
  if (k in process.env) { console.error(`GATE STOP: ${k} must be unset (winning substrate is the pinned one, nothing else).`); process.exit(2); }
}

const HM = require('./policies/heraldmuster');
const HMI = require('./heraldmuster-instrument-20261021');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS', name); }
  else { fail++; console.log('FAIL', name, extra === undefined ? '' : String(extra).slice(0, 400)); }
}

async function trajectory(seed, policyObj, days, instrument) {
  const { Game } = await loadGame({ seed, mode: 'heraldmuster-det', fullTelemetry: false });
  const t = { heraldEngagements: [], instrumentErrors: [] };
  const uninstall = instrument ? HMI.install(Game, t) : null;
  await setupGame(Game);
  const hs = [];
  const oDaily = policyObj.daily;
  const policy = Object.assign({}, policyObj, {
    daily(G, ctx) {
      if (oDaily) { try { oDaily(G, ctx); } catch (e) {} }
      try { hs.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
    },
  });
  await quietLog(async () => { await runDays(Game, policy, { days: days || 60, sampleEvery: 30 }); });
  if (uninstall) { try { uninstall(); } catch (e) {} }
  return hs.join('|');
}

// Fixture: two trusted active links + located herald omen (the honest
// player-path setup, same shape as test-main67-titan-standdown).
function fixtureCoalition(Game) {
  const mk = (vid, nm) => ({
    id: vid, name: nm, opinion: 20,
    roster: [
      { id: vid + '_spk', name: 'Speaker ' + nm, alive: true },
      { id: vid + '_f1', name: nm + ' One', alive: true },
      { id: vid + '_f2', name: nm + ' Two', alive: true },
      { id: vid + '_f3', name: nm + ' Three', alive: true },
      { id: vid + '_f4', name: nm + ' Four', alive: true },
      { id: vid + '_f5', name: nm + ' Five', alive: true },
      { id: vid + '_f6', name: nm + ' Six', alive: true },
    ],
  });
  Game.state.otherVillages = [mk('ashford', 'Ashford'), mk('birch', 'Birch')];
  const link = (vid) => ({ id: 'link-' + vid, primary: 'haven', subordinate: vid, status: 'active', trust: 75,
    theirSpeaker: { id: vid + '_spk', name: 'Speaker' }, arrears: 0 });
  Game.mshipState = () => ({ links: [link('ashford'), link('birch')] });
  Game.state.scholar.day = 100;
  Game._titanTest.titanState().omens.herald = { stage: 2, day: 95, warned: {} };
}

async function main() {
  // ---- E0: composition shape ----
  check('E0 exports', ['layerOn', 'withHeraldMuster', 'normBase', 'seatStackFor', 'armedFor', 'driveMuster'].every(k => typeof HM[k] === 'function'));
  check('E0 normBase', HM.normBase('lead') === 'leadfeast' && HM.normBase('belongfeast') === 'belongfeast');
  check('E0 id tags', HM.armedFor('leadfeast').id === 'lead-heraldmuster' && HM.armedFor('belongfeast').id === 'belong-heraldmuster');
  check('E0 layerOn gate', (delete process.env.HERALDMUSTER, HM.layerOn() === false) && (process.env.HERALDMUSTER = '1', HM.layerOn() === true));
  delete process.env.HERALDMUSTER;
  check('E0 instrument exports', typeof HMI.install === 'function' && typeof HMI.census === 'function' && HMI.instrumentOn() === true);

  // ---- E1: det-gate (HERALDMUSTER unset ≡ control) ----
  for (const seed of [64811, 64812]) {
    const a = await trajectory(seed, HM.armedFor('leadfeast'), 60, false);
    const b = await trajectory(seed, HM.seatStackFor('leadfeast'), 60, false);
    check('E1 det-gate off≡control s' + seed, a === b, 'hash lens differ');
  }

  // ---- E2: instrument is read-only ----
  {
    const a = await trajectory(64813, HM.seatStackFor('belongfeast'), 30, false);
    const b = await trajectory(64813, HM.seatStackFor('belongfeast'), 30, true);
    check('E2 instrument read-only (wrapped≡unwrapped)', a === b);
  }

  // ---- E3: the layer acts on a real coalition fixture ----
  {
    const { Game } = await loadGame({ seed: 64814, mode: 'heraldmuster-e3', fullTelemetry: false });
    await setupGame(Game);
    const said = [];
    const osay = Game.say;
    Game.say = function (t) { try { said.push(String(t)); } catch (e) {} return osay.call(this, t); };
    fixtureCoalition(Game);
    const ctx = {};
    HM.driveMuster(Game, ctx);
    const ms = Game.titanMusterState('herald');
    const allies = (ms && ms.allies) || [];
    const havenN = (ms && Game.titanHavenBlades) ? Game.titanHavenBlades(ms).length : 0;
    check('E3 call answers 12 trusted blades (6+6)', allies.length >= 12, 'allies=' + allies.length);
    check('E3 commit sends Haven blades (two-tap)', havenN >= 1, 'haven=' + havenN);
    check('E3 gate flips ready', Game.titanMusterReady('herald') === true,
      'ready=' + Game.titanMusterReady('herald') + ' allies=' + allies.length + ' haven=' + havenN);
    check('E3 the call is said aloud', said.some(t => /THE CALL GOES OUT/.test(t)));
    check('E3 the commit is said aloud', said.some(t => /Haven commits its own/.test(t)));
    check('E3 sounded once', ctx.hmSoundAttempts === 1, 'attempts=' + ctx.hmSoundAttempts);
    // re-drive: must not re-sound (refusals cost trust — never burned), ready day recorded
    said.length = 0;
    HM.driveMuster(Game, ctx);
    check('E3 re-drive does not re-sound', ctx.hmSoundAttempts === 1);
    check('E3 ready day recorded', typeof ctx.hmReadyDay === 'number');
    Game.say = osay;
  }

  // ---- E3b: no omen/links -> the layer does nothing harmful ----
  {
    const { Game } = await loadGame({ seed: 64815, mode: 'heraldmuster-e3b', fullTelemetry: false });
    await setupGame(Game);
    const ctx = {};
    HM.driveMuster(Game, ctx);
    check('E3b no coalition -> no muster', Game.titanMusterState('herald') === null);
    check('E3b no errors', (ctx.hmDriveError | 0) === 0 && (ctx.hmSoundError | 0) === 0 && (ctx.hmCommitError | 0) === 0);
  }

  // ---- E4: engagement gate (refused / accepted attribution) ----
  {
    // F1: fresh game, no muster — the gate refuses.
    const g1 = await loadGame({ seed: 64816, mode: 'heraldmuster-e4f1', fullTelemetry: false });
    await setupGame(g1.Game);
    const t1 = { heraldEngagements: [], instrumentErrors: [] };
    const un1 = HMI.install(g1.Game, t1);
    const r1 = g1.Game.startCombat('herald');
    un1();
    check('F1 no muster -> startCombat returns null (refused, no fight)', r1 === null, 'r=' + r1);
    check('F1 instrument verdict refused', t1.heraldEngagements.length === 1 && t1.heraldEngagements[0].verdict === 'refused',
      JSON.stringify(t1.heraldEngagements.map(e => e.verdict)));
    check('F1 0 unexplained', t1.heraldEngagements.every(e => e.verdict !== 'unexplained') && t1.instrumentErrors.length === 0);
  }
  {
    // F2: gate-ready muster via the real verbs — the gate accepts.
    const g2 = await loadGame({ seed: 64817, mode: 'heraldmuster-e4f2', fullTelemetry: false });
    await setupGame(g2.Game);
    fixtureCoalition(g2.Game);
    const ctx = {};
    HM.driveMuster(g2.Game, ctx);
    check('F2 fixture muster is gate-ready', g2.Game.titanMusterReady('herald') === true);
    const t2 = { heraldEngagements: [], instrumentErrors: [] };
    const un2 = HMI.install(g2.Game, t2);
    const r2 = g2.Game.startCombat('herald');
    un2();
    check('F2 gate-ready -> startCombat starts a fight (accepted)', r2 !== null && r2 !== undefined,
      'r=' + (r2 === null ? 'null' : typeof r2));
    check('F2 instrument verdict accepted', t2.heraldEngagements.length === 1 && t2.heraldEngagements[0].verdict === 'accepted',
      JSON.stringify(t2.heraldEngagements.map(e => e.verdict)));
    check('F2 0 unexplained', t2.heraldEngagements.every(e => e.verdict !== 'unexplained') && t2.instrumentErrors.length === 0);
  }

  // ---- D2: real-sweep gate (180d armed run per policy completes, deterministic) ----
  for (const [base, seed] of [['leadfeast', 64818], ['belongfeast', 64819]]) {
    process.env.HERALDMUSTER = '1';
    const a = await trajectory(seed, HM.armedFor(base), 180, true);
    const b = await trajectory(seed, HM.armedFor(base), 180, true);
    delete process.env.HERALDMUSTER;
    check('D2 180d armed ' + base + ' completes + deterministic re-run', a.length > 0 && a === b);
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });
