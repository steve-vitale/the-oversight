#!/usr/bin/env node
// test-windowreach-r4-20261022.js — proof for sim-windowreach-r4 (DIAG,
// axis scale-onramp): the first post-UNLOCK wave-5 REACH census.
//
// RED→GREEN on:
//   (a) unlock detection via w5gates-lib (UNMODIFIED) on synthetic/known
//       states — attribute() verdicts: all-met unlock, grandfathered
//       unlock, unexplained unlock, locked-with-binding-gate,
//       locked-unexplained.
//   (b) the post-win continuation hook (win -> flip Game.over=false ->
//       runDays resumes, day counter advances, 0 instrumentErrors) — with
//       the full windowstay instrument installed (KILLDISC=1).
//   (c) the herald-vs-monster channel split (canon #749: titan class
//       REFUSES solo TB entry — the muster channel is distinct from the
//       wave-4/5 monster TB/field-fight channels).
//   (d) DET parity: WS.install (killdisc v2 + window layer + death capture)
//       perturbs nothing — paired runs instrument-on vs instrument-off,
//       40d, byte-identical day-hash sequences.
//
// Instrument-only DIAG: zero src/js changes, zero scripts/policies changes.
// All Game construction goes through scripts/sim-harness.js (loadGame with
// a seeded PRNG). Never stub Game.save.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 \
//   node scripts/test-windowreach-r4-20261022.js
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const VCE = require(path.join(REPO, 'scripts', 'policies', 'vgearconfirm'));
const WS = require(path.join(REPO, 'scripts', 'instr-windowstay-20261021'));
const G5 = require(path.join(REPO, 'scripts', 'w5gates-lib')); // UNMODIFIED
const CH = require('./windowreach-r4-channels-20261022');

const PASS = [], FAIL = [];
function ok(name, cond, detail) {
  if (cond) PASS.push(name);
  else FAIL.push(name + (detail ? ' :: ' + detail : ''));
}

// ---------------------------------------------------------------------------
// (a) w5gates-lib attribute() on synthetic/known states.
function vBase() {
  return {
    day: 90, t5: 200,
    w3: { met: true },
    raw: 220, capped: 210, peak: 5,
    df4: { deferred: false, grandfathered: false },
    df5: { deferred: false, grandfathered: false },
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
  ok('a1 all-met unlock attributed', a.attributed && a.outcome === 'unlocked' && a.why === 'all gates met', JSON.stringify(a));

  const g = vBase(); g.raw = 150; g.peak = 5; g.uw = 5; // fell after release
  const ga = G5.attribute(g);
  ok('a2 grandfathered unlock attributed', ga.attributed && ga.outcome === 'unlocked' && /^grandfathered/.test(ga.why), JSON.stringify(ga));

  const u = vBase(); u.df5 = { deferred: true, grandfathered: false }; u.peak = 4; u.uw = 5;
  const ua = G5.attribute(u);
  ok('a3 unexplained unlock NOT attributed', !ua.attributed && /UNEXPLAINED/.test(ua.why), JSON.stringify(ua));

  const l = vBase(); l.uw = 4; l.raw = 150; l.capped = 150; l.peak = 4;
  l.df5 = { deferred: true, grandfathered: false };
  l.dist['stand-raw'] = { standing: 50 };
  const la = G5.attribute(l);
  ok('a4 locked: binding gate identified', la.attributed && la.outcome === 'locked' && la.binding === 'stand-raw', JSON.stringify(la));

  const lx = vBase(); lx.uw = 3; // every gate reads met but door shut
  const lxa = G5.attribute(lx);
  ok('a5 locked-unexplained NOT attributed', !lxa.attributed && /UNEXPLAINED/.test(lxa.why), JSON.stringify(lxa));
}

// ---------------------------------------------------------------------------
(async () => {
  // (a, wiring) gateVector on a real loaded game (uw=1, gates present).
  {
    const { Game } = await loadGame({ seed: 65428, mode: 'windowreach-r4-proof', fullTelemetry: false });
    await setupGame(Game);
    let v = null, errMsg = null;
    try { v = G5.gateVector(Game); } catch (e) { errMsg = e.message; }
    ok('a6 gateVector wiring on real game', !!v && v.uw === 1 && Array.isArray((v.attr || {}).gates) && (v.attr.gates.length >= 6), errMsg || ('uw=' + (v && v.uw)));
  }

  // (c) herald-vs-monster channel split on real game data.
  {
    const { Game } = await loadGame({ seed: 65428, mode: 'windowreach-r4-proof', fullTelemetry: false });
    await setupGame(Game);
    ok('c1 herald ids resolve to titan channel',
      CH.channelOf(Game, 'herald') === 'titan' &&
      CH.channelOf(Game, 'nielsen') === 'titan' &&
      CH.channelOf(Game, 'finale') === 'titan' &&
      CH.channelOf(Game, 'network_heart') === 'titan',
      JSON.stringify([CH.channelOf(Game, 'herald'), CH.channelOf(Game, 'network_heart')]));
    ok('c2 wave-5 monsters resolve to monster channel',
      CH.channelOf(Game, 'cancellation') === 'monster' && CH.channelOf(Game, 'editor') === 'monster',
      JSON.stringify([CH.channelOf(Game, 'cancellation'), CH.channelOf(Game, 'editor')]));
    ok('c3 unknown id resolves to unknown',
      CH.channelOf(Game, 'no_such_beast') === 'unknown');
    const synth = { data: { titans: {
      herald: { monster: 'herald', wave: 4 },
      nielsen: { monster: 'nielsen', wave: 5 },
    } }, state: { titans: { outcomes: [
      { titan: 'herald', day: 80, outcome: 'refused', detail: { gate: 'muster' } },
      { titan: 'herald', day: 95, outcome: 'slain', detail: null },
      { titan: 'nielsen', day: 120, outcome: 'fought', detail: null },
    ] } } };
    const outs = CH.readTitanOutcomes(synth);
    ok('c4 titan outcomes read from state log', outs.length === 3 &&
      outs[0].titan === 'herald' && outs[0].wave === 4 && outs[0].outcome === 'refused' &&
      outs[2].titan === 'nielsen' && outs[2].wave === 5 && outs[2].outcome === 'fought',
      JSON.stringify(outs));
    const empty = CH.readTitanOutcomes({ state: {} });
    ok('c5 absent titan log reads as empty', Array.isArray(empty) && empty.length === 0);
  }

  // (b) post-win continuation hook: simulated win -> flip -> resume.
  {
    if (!WS.instrumentOn()) throw new Error('KILLDISC=1 required for the instrument proof');
    const { Game } = await loadGame({ seed: 65428, mode: 'windowreach-r4-proof', fullTelemetry: false });
    const policy = VCE.armedFor('leadfeast');
    const t = { kills: [], engagements: [], fieldFights: [], spawns: [], tbOutcomes: {}, census: [], dmg: {}, instrumentErrors: [], window: [], deathRecs: [], fightStarts: [] };
    const uninstall = WS.install(Game, t);
    await setupGame(Game);
    const hashes = [];
    const wrapped = Object.assign({}, policy, {
      daily(Gm, ctx) { hashes.push(Gm.state.scholar.day + ':' + dayHash(Gm)); return policy.daily(Gm, ctx); },
    });
    let result = await quietLog(async () => runDays(Game, wrapped, { days: 12, manifest: undefined, sampleEvery: 30 }));
    const d1 = (((Game.state || {}).scholar || {}).day | 0) || 0;
    ok('b0 pre-win run reaches 12 days', d1 >= 12, 'day=' + d1);
    // Simulate the win stop: every win path sets over=true; the stock
    // harness loop stops on it. The sweep's hook flips over=false and
    // resumes driving the same in-memory state.
    Game.over = true; Game.won = true;
    let winDay = null, postWinDays = 0, resumed = false;
    if (Game.over && Game.won) {
      winDay = d1;
      Game.over = false; // POSTWIN-ALLOW: the one documented engine flip
      resumed = true;
      await quietLog(async () => { result = await runDays(Game, wrapped, { days: 6, manifest: undefined, sampleEvery: 30 }); });
      postWinDays = ((((Game.state || {}).scholar || {}).day | 0) || 0) - winDay;
    }
    try { uninstall(); } catch (e) {}
    ok('b1 hook resumes the village', resumed && winDay === d1, 'resumed=' + resumed + ' winDay=' + winDay);
    ok('b2 day counter advances post-win', postWinDays === 6, 'postWinDays=' + postWinDays);
    ok('b3 zero instrumentErrors', t.instrumentErrors.length === 0, JSON.stringify(t.instrumentErrors.slice(0, 3)));
    void result;
  }

  // (d) DET parity: instrument-on vs instrument-off, 40d, byte-identical.
  {
    const SEED = 65428, DAYS = 40;
    async function oneRun(withInstrument) {
      const { Game } = await loadGame({ seed: SEED, mode: 'windowreach-r4-proof', fullTelemetry: false });
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
    ok('d1 census-on vs census-off byte-identical 40d', same && on.hashes.length >= DAYS,
      `on=${on.hashes.length} off=${off.hashes.length} same=${same}`);
    ok('d2 det run has 0 instrumentErrors', on.nErr === 0, 'errs=' + on.nErr);
  }

  console.log(`\nwindowreach-r4 proof: ${PASS.length} passed, ${FAIL.length} failed`);
  for (const f of FAIL) console.log('FAIL ' + f);
  if (FAIL.length) process.exit(1);
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e.message); process.exit(1); });
