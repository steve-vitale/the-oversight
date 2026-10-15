#!/usr/bin/env node
'use strict';
// test-presubstrate-20261015.js — proof for the presubstrate instrument
// (flesh-out loop ARM 3, 2026-10-15, scale-onramp axis, sim-presubstrate,
// DIAGNOSTIC: no lever, no GO threshold).
//
// A read-only instrument is only trustworthy if base+instrument is
// trajectory-identical to plain base. Proves:
//   1. instrument exports + wraps (composition intact); optional gates
//      asserted off at load
//   2. SMOKE: layer-live markers honest, census live, runs complete
//   3. DET-GATE: plain-base vs census-base on 4 fresh seeds [151,262,373,484],
//      60d each — both-repeat design distinguishes an instrument leak from
//      the known timestamp-entropy issue (det-gate.js header)
//   4. census record honesty: a short census run records arc/rank/wave
//      samples, vest scan, table edges, and beats without throwing
const fails = [];
const passes = [];
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (cond) passes.push(name); else fails.push(name);
}

(async () => {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
    if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required (substrate).`); process.exit(2); }
  }
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';

  const PS = require('./presubstrate-20261015');
  check('exports withPresub', typeof PS.withPresub === 'function', '');
  check('exports newCensus/sampleDay', typeof PS.newCensus === 'function' && typeof PS.sampleDay === 'function', '');
  check('exports policyFor', typeof PS.policyFor === 'function', '');
  const TF = require('./policies/tribfloor');
  check('tribfloor base ids present', !!TF.leadfeast && !!TF.belongfeast, TF.leadfeast && TF.leadfeast.id);
  check('policyFor returns base ids', PS.policyFor('leadfeast').id === 'leadfeast' && PS.policyFor('belongfeast').id === 'belongfeast', '');
  check('optional gates unset', process.env.WAVE5REACH !== '1' && process.env.W3DRIVE !== '1' && process.env.SEATDRIVE !== '1', '');

  // --- 2. SMOKE ---
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  for (const policyId of ['belongfeast', 'leadfeast']) {
    const { Game } = await loadGame({ seed: 151, mode: `presubstrate-proof-smoke-${policyId}`, fullTelemetry: false });
    await setupGame(Game);
    let censusLive = null, dailyRan = false;
    const base = PS.policyFor(policyId);
    const policy = PS.withPresub(base, base.id + '-census', base.desc + ' [PROOF]');
    const oSetup = policy.setup;
    policy.setup = (G, ctx) => { if (oSetup) oSetup(G, ctx); censusLive = !!(ctx && ctx._presub); };
    const oDaily = policy.daily;
    policy.daily = (G, ctx) => { dailyRan = dailyRan || !!(ctx && ctx._presub); return oDaily(G, ctx); };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 15, sampleEvery: 30 }); });
    check(`${policyId}: census live`, censusLive === true, '');
    check(`${policyId}: census daily ran`, dailyRan === true, '');
    check(`${policyId}: 15d run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
  }

  // --- 3. DET-GATE: plain vs census on 4 fresh seeds, 60d, both-repeat ---
  const { dayHash } = require('./det-gate');
  async function runHashes(policy, seed, days) {
    const { Game } = await loadGame({ seed, mode: 'presubstrate-proof-det', fullTelemetry: false });
    await setupGame(Game);
    const hashes = [];
    const wrapped = Object.assign({}, policy);
    const base = policy.daily;
    wrapped.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base ? base(G, ctx) : undefined; };
    await quietLog(async () => { await runDays(Game, wrapped, { days, sampleEvery: 1 }); });
    return hashes.join('\n');
  }
  for (const seed of [151, 262, 373, 484]) {
    const plain = PS.policyFor('leadfeast');
    const census = PS.withPresub(PS.policyFor('leadfeast'), 'leadfeast-census', 'leadfeast [PROOF]');
    const hP1 = await runHashes(plain, seed, 60);
    const hP2 = await runHashes(plain, seed, 60);
    const hC1 = await runHashes(census, seed, 60);
    const hC2 = await runHashes(census, seed, 60);
    const plainStable = hP1 === hP2;
    const censusStable = hC1 === hC2;
    check(`seed ${seed}: plain-repeat stable`, plainStable, plainStable ? '' : 'known timestamp-entropy suspected');
    check(`seed ${seed}: census-repeat stable`, censusStable, censusStable ? '' : 'known timestamp-entropy suspected');
    check(`seed ${seed}: instrument trajectory-identical`, plainStable && censusStable && hP1 === hC1,
      (plainStable && censusStable) ? (hP1 === hC1 ? '' : 'INSTRUMENT LEAK') : 'seed unstable, skip');
  }

  // --- 4. census record honesty: short run samples everything ---
  {
    const { Game } = await loadGame({ seed: 151, mode: 'presubstrate-proof-honest', fullTelemetry: false });
    await setupGame(Game);
    let ctxOut = null;
    const base = PS.policyFor('belongfeast');
    const policy = PS.withPresub(base, base.id + '-census', base.desc + ' [PROOF]');
    const oSetup = policy.setup;
    policy.setup = (G, ctx) => { ctxOut = ctx; return oSetup(G, ctx); };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 30, sampleEvery: 30 }); });
    const C = ctxOut && ctxOut._presub;
    check('census store present', !!C, '');
    check('wave sampled (maxWave>=1)', !!(C && C.maxWave >= 1), `maxWave=${C && C.maxWave}`);
    check('vest scan ran without throwing', !!(C && C.vestHolders instanceof Set), `vests=${C && C.vestHolders.size}`);
    check('table edges tracked', !!(C && typeof C.invites === 'number' && typeof C.sittings === 'number'), `inv=${C && C.invites} sit=${C && C.sittings}`);
    check('say-capture installed (beats array)', !!(C && Array.isArray(C.beats)), `beats=${C && C.beats.length}`);
    check('arc fields present', !!(C && 'arc2Day' in C && 'arc4Day' in C), '');
    check('realm fields present', !!(C && 'realmDay' in C && 'realmShape' in C), '');
    check('run completes, 30d', !!(r && r.days >= 30), `days=${r && r.days}`);
    // wave-day ordering invariant: w3<=w4<=w5 whenever dated
    const ord = (!C.wave3Day || !C.wave4Day || C.wave3Day <= C.wave4Day) &&
                (!C.wave4Day || !C.wave5Day || C.wave4Day <= C.wave5Day) &&
                (!C.wave3Day || !C.wave5Day || C.wave3Day <= C.wave5Day);
    check('wave-day ordering invariant', ord, `w3=${C.wave3Day} w4=${C.wave4Day} w5=${C.wave5Day}`);
  }

  delete process.env.WINDEFER;
  console.log(`\npresubstrate proof: ${passes.length}/${passes.length + fails.length} GREEN`);
  if (fails.length) { console.error('PROOF FAILED: ' + fails.join(' | ')); process.exit(1); }
  console.log('proof green.');
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
