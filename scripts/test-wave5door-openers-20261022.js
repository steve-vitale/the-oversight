#!/usr/bin/env node
// test-wave5door-openers-20261022.js — proof for sim-wave5door-openers
// (DIAG, axis scale-onramp): the wave-5 DOOR-OPENERS census.
//
// RED→GREEN on:
//   (a) w5gates-lib attribute() (UNMODIFIED) on synthetic gate vectors:
//       all-met unlock, grandfathered unlock, live-demand unlock (end
//       state), unexplained unlock (NOT attributed), locked with binding
//       gate defer5, locked-unexplained (NOT attributed).
//   (b) the release-path classifier (wave5door-openers-classify-20261022,
//       PURE) on synthetic daily traces: live-demand open
//       (peakRecord5Day == w5Day), grandfathered open (bars fell after the
//       standing release, door opened later via the peak ratchet), locked
//       (no open), bar-release days, grandfathered-hold-open at end.
//   (c) DET parity: WS.install (killdisc v2 + windowreach window layer +
//       death capture) perturbs nothing — paired runs instrument-on vs
//       instrument-off, 40d, byte-identical day-hash sequences,
//       0 instrumentErrors.
//
// Instrument-only DIAG: zero src/js changes, zero scripts/policies changes.
// All Game construction goes through scripts/sim-harness.js (loadGame with
// a seeded PRNG). Never stub Game.save.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 \
//   node scripts/test-wave5door-openers-20261022.js
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const VCE = require(path.join(REPO, 'scripts', 'policies', 'vgearconfirm'));
const WS = require(path.join(REPO, 'scripts', 'instr-windowstay-20261021'));
const G5 = require(path.join(REPO, 'scripts', 'w5gates-lib')); // UNMODIFIED
const CL = require('./wave5door-openers-classify-20261022');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'VGEAR', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required.`); process.exit(2); }
}
if (!VCE.vgearOn()) { console.error('PROOF STOP: VGEAR layer off despite VGEAR=1.'); process.exit(2); }
if (!WS.instrumentOn()) { console.error('PROOF STOP: windowstay instrument off despite KILLDISC=1.'); process.exit(2); }

const PASS = [], FAIL = [];
function ok(name, cond, detail) {
  if (cond) PASS.push(name);
  else FAIL.push(name + (detail ? ' :: ' + detail : ''));
}

// ---------------------------------------------------------------------------
// (a) w5gates-lib attribute() on synthetic gate vectors.
function vBase() {
  return {
    day: 90, t5: 200,
    w3: { met: true },
    raw: 220, capped: 210, peak: 5,
    df4: { deferred: false, grandfathered: true },
    df5: { deferred: false, grandfathered: true },
    r4: { armored: 5, armed: 7, tricks: 5, veterans: 2, short: [], ready: true },
    r5: { armored: 5, armed: 7, tricks: 5, veterans: 2, short: [], ready: true },
    w4faced: 3,
    dist: {
      w3rung: { day: 0, l2: 0 }, 'stand-raw': { standing: 0 },
      'plenty-cap': { loss: 10 },
      defer4: { armor: 0, weapons: 0, tricks: 0, veterans: 0 },
      defer5: { armor: 0, weapons: 0, tricks: 0, veterans: 0 },
      w4faced: { types: 0 },
    },
    uw: 5,
  };
}
{
  const a = G5.attribute(vBase());
  ok('a1 all-met unlock attributed (live-demand end state)', a.attributed && a.outcome === 'unlocked' && a.why === 'all gates met', JSON.stringify(a));

  const g = vBase(); g.raw = 150; g.capped = 150; g.peak = 5; g.uw = 5;
  g.r5 = { armored: 1, armed: 2, tricks: 1, veterans: 0, short: ['armored', 'veterans'], ready: false };
  const ga = G5.attribute(g);
  ok('a2 grandfathered unlock attributed (standing fell, peak held)', ga.attributed && ga.outcome === 'unlocked' && /^grandfathered/.test(ga.why), JSON.stringify(ga));

  const u = vBase(); u.df5 = { deferred: true, grandfathered: false }; u.peak = 4; u.uw = 5;
  const ua = G5.attribute(u);
  ok('a3 unexplained unlock NOT attributed', !ua.attributed && /UNEXPLAINED/.test(ua.why), JSON.stringify(ua));

  const l = vBase(); l.uw = 4; l.peak = 4; l.raw = 220; l.capped = 210;
  l.df5 = { deferred: true, grandfathered: false };
  l.r5 = { armored: 1, armed: 2, tricks: 1, veterans: 0, short: ['armored', 'veterans'], ready: false };
  const la = G5.attribute(l);
  ok('a4 locked: binding gate is defer5', la.attributed && la.outcome === 'locked' && la.binding === 'defer5', JSON.stringify(la));

  const l4 = vBase(); l4.uw = 4; l4.peak = 4; l4.raw = 60; l4.capped = 60;
  l4.dist['stand-raw'] = { standing: 140 };
  const la4 = G5.attribute(l4);
  ok('a5 locked: binding gate is stand-raw (low standing)', la4.attributed && la4.binding === 'stand-raw', JSON.stringify(la4));

  const lx = vBase(); lx.uw = 3; // every gate reads met but door shut
  const lxa = G5.attribute(lx);
  ok('a6 locked-unexplained NOT attributed', !lxa.attributed && /UNEXPLAINED/.test(lxa.why), JSON.stringify(lxa));
}

// ---------------------------------------------------------------------------
// (b) release-path classifier on synthetic daily traces.
const DEM5 = { armored: 4, armed: 6, tricks: 3, veterans: 2 };
const DEM4 = { armored: 3, armed: 5, tricks: 3, veterans: 1 };
function traceDay(d, o) {
  return Object.assign({
    day: d, uw: 4, raw: 0, capped: 0, w4faced: 0,
    r4: { ready: false, armored: 0, armed: 0, tricks: 0, veterans: 0 },
    r5: { ready: false, armored: 0, armed: 0, tricks: 0, veterans: 0 },
  }, o || {});
}
{
  // b1: live-demand open — bars met d66, door opens d66.
  const tr = [];
  for (let d = 60; d <= 70; d++) {
    const met = d >= 66;
    tr.push(traceDay(d, {
      uw: d >= 66 ? 5 : 4, raw: met ? 220 : 150, capped: met ? 210 : 120, w4faced: d >= 60 ? 2 : 0,
      r4: { ready: true, armored: 4, armed: 6, tricks: 4, veterans: 1 },
      r5: met
        ? { ready: true, armored: 5, armed: 7, tricks: 4, veterans: 2 }
        : { ready: false, armored: 1, armed: 2, tricks: 1, veterans: 0 },
    }));
  }
  const c = CL.classifyOpenPath(tr, { t4: 100, t5: 200, demand4: DEM4, demand5: DEM5 });
  ok('b1 live-demand open: peakRecord5Day == w5Day', c.peakRecord5Day === 66 && c.w5Day === 66 && c.defer5OpenPath === 'live-demand', JSON.stringify(c));
  ok('b2 live-demand open: r5.ready true at door-open day', c.r5ReadyAtW5Day === true, JSON.stringify(c.r5ReadyAtW5Day));
  ok('b3 bar release days match demand crossing', c.barRelease5.armored === 66 && c.barRelease5.armed === 66 && c.barRelease5.tricks === 66 && c.barRelease5.veterans === 66, JSON.stringify(c.barRelease5));
}
{
  // b4: grandfathered open — standing released d60 (bars met), a veteran
  // dies d64 (bars fall), wave-4 faced only d66 → door opens d66 with
  // r5.ready=false, held open by the peak ratchet.
  const tr = [];
  for (let d = 58; d <= 70; d++) {
    const met = d >= 60 && d < 64;
    tr.push(traceDay(d, {
      uw: d >= 66 ? 5 : 4, raw: d >= 60 ? 220 : 150, capped: d >= 60 ? 210 : 120, w4faced: d >= 66 ? 1 : 0,
      r4: { ready: true, armored: 4, armed: 6, tricks: 4, veterans: 1 },
      r5: met
        ? { ready: true, armored: 5, armed: 7, tricks: 4, veterans: 2 }
        : { ready: false, armored: 1, armed: 2, tricks: 1, veterans: 0 },
    }));
  }
  const c = CL.classifyOpenPath(tr, { t4: 100, t5: 200, demand4: DEM4, demand5: DEM5 });
  ok('b4 grandfathered open: peakRecord5Day < w5Day', c.peakRecord5Day === 60 && c.w5Day === 66 && c.defer5OpenPath === 'grandfathered', JSON.stringify(c));
  ok('b5 grandfathered open: r5.ready false at door-open day', c.r5ReadyAtW5Day === false, JSON.stringify(c.r5ReadyAtW5Day));
  ok('b6 grandfathered-hold-open at end of trace', c.grandfatheredHoldOpen === true && c.endUw === 5, JSON.stringify({ g: c.grandfatheredHoldOpen, uw: c.endUw }));
}
{
  // b7: locked run — no open.
  const tr = [];
  for (let d = 60; d <= 70; d++) {
    tr.push(traceDay(d, { uw: 3, raw: 90, capped: 90, w4faced: 0 }));
  }
  const c = CL.classifyOpenPath(tr, { t4: 100, t5: 200, demand4: DEM4, demand5: DEM5 });
  ok('b7 locked run: defer5OpenPath=locked', c.defer5OpenPath === 'locked' && c.w5Day == null, JSON.stringify(c));
  ok('b8 locked run: no grandfathered-hold-open', c.grandfatheredHoldOpen === false, JSON.stringify(c.grandfatheredHoldOpen));
}

// ---------------------------------------------------------------------------
(async () => {
  // (c) DET parity: instrument-on vs instrument-off, 40d, byte-identical.
  {
    const SEED = 65428, DAYS = 40;
    async function oneRun(withInstrument) {
      const { Game } = await loadGame({ seed: SEED, mode: 'wave5door-openers-proof', fullTelemetry: false });
      const policy = VCE.armedFor('leadfeast');
      let t = null, uninstall = null;
      if (withInstrument) {
        t = { kills: [], engagements: [], fieldFights: [], spawns: [], tbOutcomes: {}, census: [], dmg: {}, instrumentErrors: [], window: [], deathRecs: [], fightStarts: [] };
        uninstall = WS.install(Game, t);
      }
      await setupGame(Game);
      const hashes = [];
      const wrapped = Object.assign({}, policy, {
        daily(Gm, ctx) { hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm)); return policy.daily(Gm, ctx); },
      });
      await quietLog(async () => { await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
      if (uninstall) try { uninstall(); } catch (e) {}
      return { hashes, nErr: t ? t.instrumentErrors.length : 0 };
    }
    const on = await oneRun(true);
    const off = await oneRun(false);
    const same = on.hashes.length === off.hashes.length && on.hashes.every((h, i) => h === off.hashes[i]);
    ok('c1 census-on vs census-off byte-identical 40d', same && on.hashes.length >= DAYS,
      `on=${on.hashes.length} off=${off.hashes.length} same=${same}`);
    ok('c2 det run has 0 instrumentErrors', on.nErr === 0, 'errs=' + on.nErr);
  }

  console.log(`\nwave5door-openers proof: ${PASS.length} passed, ${FAIL.length} failed`);
  for (const f of FAIL) console.log('FAIL ' + f);
  if (FAIL.length) process.exit(1);
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e.message); process.exit(1); });
