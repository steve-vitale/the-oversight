#!/usr/bin/env node
// wave4census-sweep-20261017.js — READ-ONLY wave-4 readiness census sweep
// (flesh-out loop DIAGNOSTIC, 2026-10-17, scale-onramp axis, sim-wave4census).
//
// Re-runs the wincensus-c substrate/seeds on the NON-WINNING runs (34) with a
// read-only readiness instrument attached: once per day, the engine's OWN
// readiness reader (Game.waveUnlockReady(4)) + Game.villageStanding() are
// sampled. Zero src/js changes, zero scripts/policies changes — the
// instrument is pure reads (no RNG draws, no state writes). The det-gate in
// scripts/test-wave4census-20261017.js proves byte-identical trajectories
// with the instrument attached vs bare.
//
// Substrate (identical to sim-wincensus-c, asserted at startup):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1
//   ALLOWGATE2 unset (landed layer default-OFF, stays OFF)
//   control: SEATDRIVE=0 EXPLICIT (default-ON since 2026-10-16; unset would drive)
//   armed:   SEATDRIVE=1
// Policies: SD.leadseat / SD.belongseat from scripts/policies/seatdrive
// (the exact policyFor mapping of the wincensus sweep).
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 \
//     node scripts/wave4census-sweep-20261017.js
// Targeted re-runs: SEEDS="51977,610043" ONLY="leadfeast,control;belongfeast,armed"
// Det-gate bare mode: WAVE4CENSUS_BARE=1 (instrument disabled — same trajectories).
//
// Exports runWave4census(seed, policyId, side, opts) for the proof test.
'use strict';
const fs = require('fs');
const path = require('path');
const SD = require('./policies/seatdrive');
const WD = require('./policies/windefer');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');
const { sampleReadiness } = require('./wave4census-lib-20261017');

// The 34 non-winning wincensus-c runs (from perseed-wincensus-c/, wins=0).
// Re-running ONLY these: the 30 armed wins truncate at the win (maxWave=3),
// so their wave-4 readiness is moot — the standing wall gap is on non-wins.
const NONWINNERS = [
  ['B', 'belongfeast', 'armed', 1940809], ['B', 'leadfeast', 'armed', 1940809],
  ['A', 'belongfeast', 'control', 1060511], ['A', 'belongfeast', 'control', 1170103],
  ['A', 'belongfeast', 'control', 1280207], ['A', 'belongfeast', 'control', 51977],
  ['A', 'belongfeast', 'control', 610043], ['A', 'belongfeast', 'control', 730111],
  ['A', 'belongfeast', 'control', 840217], ['A', 'belongfeast', 'control', 950303],
  ['B', 'belongfeast', 'control', 1390319], ['B', 'belongfeast', 'control', 1500427],
  ['B', 'belongfeast', 'control', 1610521], ['B', 'belongfeast', 'control', 1720609],
  ['B', 'belongfeast', 'control', 1830703], ['B', 'belongfeast', 'control', 1940809],
  ['B', 'belongfeast', 'control', 2050913], ['B', 'belongfeast', 'control', 2161013],
  ['A', 'leadfeast', 'control', 1060511], ['A', 'leadfeast', 'control', 1170103],
  ['A', 'leadfeast', 'control', 1280207], ['A', 'leadfeast', 'control', 51977],
  ['A', 'leadfeast', 'control', 610043], ['A', 'leadfeast', 'control', 730111],
  ['A', 'leadfeast', 'control', 840217], ['A', 'leadfeast', 'control', 950303],
  ['B', 'leadfeast', 'control', 1390319], ['B', 'leadfeast', 'control', 1500427],
  ['B', 'leadfeast', 'control', 1610521], ['B', 'leadfeast', 'control', 1720609],
  ['B', 'leadfeast', 'control', 1830703], ['B', 'leadfeast', 'control', 1940809],
  ['B', 'leadfeast', 'control', 2050913], ['B', 'leadfeast', 'control', 2161013],
];

const DAYS = 180;
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-wave4census');

// assertSubstrate(): the wincensus-c substrate, asserted up front (#312 lesson).
// Called per-run (also from the proof test) and once at sweep startup.
function assertSubstrate() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
    if (process.env[k] !== '1') throw new Error(`SUBSTRATE STOP: ${k}=1 is required (wincensus-c substrate).`);
  }
  if (process.env.ALLOWGATE2 === '1')
    throw new Error('SUBSTRATE STOP: ALLOWGATE2=1 — substrate moved; STOP, do not rescore, report to coordinator.');
}

function policyFor(policyId) {
  return policyId === 'leadfeast' ? SD.leadseat : SD.belongseat;
}

async function runWave4census(seed, policyId, side, opts) {
  opts = opts || {};
  assertSubstrate();
  const armed = side === 'armed';
  const instrumented = opts.instrumented !== false && process.env.WAVE4CENSUS_BARE !== '1';
  process.env.WINPURSUIT = '1';
  process.env.WINDEFER = '1';
  process.env.SEATDRIVE = armed ? '1' : '0'; // EXPLICIT both sides
  const base = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: `wave4census-${side}`, fullTelemetry: false });
  await setupGame(Game);
  let seatLive = null, deferLive = null;
  const policy = Object.assign({}, base);
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    seatLive = SD.layerOn(); deferLive = WD.layerOn();
    if (oSetup) return oSetup(G, ctx);
  };
  const hashes = [];
  const snaps = [];
  let instrumentErrors = 0;
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try { hashes.push(G.state.scholar.day + ':' + dayHash(G)); } catch (e) {}
    if (instrumented) {
      try {
        const s = sampleReadiness(G);
        instrumentErrors += (s.err | 0);
        snaps.push(s);
      } catch (e) { instrumentErrors++; }
    }
    return r;
  };
  const days = opts.days || DAYS;
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 30 }); });
  if (seatLive !== armed || deferLive !== true)
    throw new Error(`layer-live marker mismatch: side=${side} seat=${seatLive} defer=${deferLive}`);
  const out = {
    seed, policyId, side, instrumented,
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    wins: Game.won ? 1 : 0, maxWaveUnlocked: result.maxWaveUnlocked || 1,
    instrumentErrors, snaps,
  };
  if (opts.writeJson !== false) {
    fs.mkdirSync(EVID, { recursive: true });
    fs.writeFileSync(path.join(EVID, `wave4census-${policyId}-${side}-s${seed}.json`), JSON.stringify(out));
  }
  console.log(`  [${side} ${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} ` +
    `wave=${out.maxWaveUnlocked} wins=${out.wins} snaps=${snaps.length} instrErr=${instrumentErrors}`);
  return { hashes, snaps, instrumentErrors, gameDays: out.gameDays, endReason: out.endReason,
    wins: out.wins, maxWaveUnlocked: out.maxWaveUnlocked };
}

(async () => {
  if (require.main !== module) return; // required by the proof test: export only
  try { assertSubstrate(); } catch (e) { console.error(e.message); process.exit(2); }
  let only = null;
  if (process.env.ONLY) {
    only = new Set();
    for (const part of String(process.env.ONLY).split(';')) {
      const [p, s] = part.split(',').map(x => x.trim());
      if (p && s) only.add(p + '|' + s);
    }
  }
  const match = (p, s) => !only || only.has(p + '|' + s);
  let seedList = NONWINNERS.slice();
  if (process.env.SEEDS) {
    const want = new Set(process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)));
    seedList = seedList.filter(([,, , sd]) => want.has(sd));
  }
  seedList = seedList.filter(([, p, s]) => match(p, s));
  console.log(`wave4census: ${seedList.length} non-winning runs, instrumented=${process.env.WAVE4CENSUS_BARE !== '1'}`);
  for (const [set, policyId, side, seed] of seedList) {
    await runWave4census(seed, policyId, side, { set });
  }
  console.log('wave4census sweep complete.');
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = { runWave4census, assertSubstrate, NONWINNERS };
