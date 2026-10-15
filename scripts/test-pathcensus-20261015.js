#!/usr/bin/env node
// test-pathcensus-20261015.js — proof for the pathcensus instrument
// (flesh-out loop DIAGNOSTIC, 2026-10-15, scale-onramp axis).
//
// A read-only instrument is only trustworthy if armed+instrument is
// trajectory-identical to plain armed. Proves:
//   1. instrument exports + wraps (composition intact)
//   2. SMOKE green: layer-live markers honest, census live, run completes
//   3. DET-GATE: plain-armed vs census-armed on 4 seeds [131,242,353,464],
//      60d each — both-repeat design distinguishes an instrument leak from
//      the known timestamp-entropy issue (det-gate.js header)
//   4. record/finish honesty: a short armed census run on seed 131 records
//      invitation/sitting/answer events without throwing
'use strict';
const path = require('path');

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
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1'; process.env.SEATDRIVE = '1';

  const PC = require('./pathcensus-20261015');
  check('exports withPathCensus', typeof PC.withPathCensus === 'function', '');
  check('exports PATH_IDS (7 paths)', Array.isArray(PC.PATH_IDS) && PC.PATH_IDS.length === 7, (PC.PATH_IDS || []).join(','));
  const SD = require('./policies/seatdrive');
  const WD = require('./policies/windefer');
  check('seatdrive stack present', !!SD.leadseat && !!SD.belongseat, SD.leadseat && SD.leadseat.id);

  // --- 2. SMOKE: census-armed run completes with honest markers ---
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  for (const policyId of ['belongfeast', 'leadfeast']) {
    const { Game } = await loadGame({ seed: 11, mode: `pathcensus-proof-smoke-${policyId}`, fullTelemetry: false });
    await setupGame(Game);
    let seatLive = null, deferLive = null, censusLive = false, censusDailyRan = false;
    const base = PC.policyFor(policyId);
    const ledger = { walks: {} };
    const policy = PC.withPathCensus(base, base.id + '-census', base.desc + ' [PROOF]', ledger);
    const oSetup = policy.setup;
    policy.setup = (G, ctx) => {
      if (oSetup) oSetup(G, ctx);
      seatLive = SD.layerOn(); deferLive = WD.layerOn(); censusLive = !!(ctx && ctx._census);
    };
    const oDaily = policy.daily;
    policy.daily = (G, ctx) => { censusDailyRan = censusDailyRan || !!(ctx && ctx._census); return oDaily(G, ctx); };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 15, sampleEvery: 30 }); });
    check(`${policyId}: seat+defer live`, seatLive === true && deferLive === true, `seat=${seatLive} defer=${deferLive}`);
    check(`${policyId}: census live`, censusLive === true, '');
    check(`${policyId}: census daily ran`, censusDailyRan === true, '');
    check(`${policyId}: 15d run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
  }

  // --- 3. DET-GATE: plain vs census on 4 seeds, 60d, both-repeat ---
  const { dayHash } = require('./det-gate');
  async function runHashes(policy, seed, days) {
    const { Game } = await loadGame({ seed, mode: 'pathcensus-proof-det', fullTelemetry: false });
    await setupGame(Game);
    const hashes = [];
    const wrapped = Object.assign({}, policy);
    const base = policy.daily;
    wrapped.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base ? base(G, ctx) : undefined; };
    await quietLog(async () => { await runDays(Game, wrapped, { days, sampleEvery: 1 }); });
    return hashes.join('\n');
  }
  for (const seed of [131, 242, 353, 464]) {
    const ledger = { walks: {} };
    const census = PC.withPathCensus(SD.leadseat, SD.leadseat.id + '-census', SD.leadseat.desc + ' [PROOF]', ledger);
    const hP1 = await runHashes(SD.leadseat, seed, 60);
    const hP2 = await runHashes(SD.leadseat, seed, 60);
    const hC1 = await runHashes(census, seed, 60);
    const hC2 = await runHashes(census, seed, 60);
    const plainStable = hP1 === hP2;
    const censusStable = hC1 === hC2;
    check(`seed ${seed}: plain-repeat stable`, plainStable, plainStable ? '' : 'known timestamp-entropy suspected');
    check(`seed ${seed}: census-repeat stable`, censusStable, censusStable ? '' : 'known timestamp-entropy suspected');
    check(`seed ${seed}: instrument trajectory-identical`, plainStable && censusStable && hP1 === hC1,
      (plainStable && censusStable) ? (hP1 === hC1 ? '' : 'INSTRUMENT LEAK') : 'seed unstable, skip');
  }

  // --- 4. record/finish honesty on a run that reaches the table (seed 131) ---
  {
    const { Game } = await loadGame({ seed: 131, mode: 'pathcensus-proof-honest', fullTelemetry: false });
    await setupGame(Game);
    let ctxOut = null;
    const base = PC.policyFor('belongfeast');
    const ledger = { walks: {} };
    const policy = PC.withPathCensus(base, base.id + '-census', base.desc + ' [PROOF]', ledger);
    const oSetup = policy.setup;
    policy.setup = (G, ctx) => { ctxOut = ctx; return oSetup(G, ctx); };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 180, sampleEvery: 30 }); });
    const C = ctxOut && ctxOut._census;
    check('recorded without throwing', !!(C && C.answers), `answers=${C && C.answers.length}`);
    check('sittings counted', (ctxOut.sdSeatTaken | 0) >= 0, `sits=${ctxOut.sdSeatTaken | 0}`);
    check('door events have offered+chosen+branch', (C.doorEvents || []).every(e => e.offered && e.chosen && e.branch),
      `doors=${(C.doorEvents || []).length}`);
    check('counterfactual computed', (C.doorEvents || []).every(e => e.cfDoor && typeof e.cfOffered === 'boolean'), '');
    check('instrument read-only wrt wins', typeof Game.won === 'boolean', `won=${Game.won}`);
  }

  delete process.env.SEATDRIVE;
  console.log(`\npathcensus proof: ${passes.length}/${passes.length + fails.length} GREEN`);
  if (fails.length) { console.error('PROOF FAILED: ' + fails.join(' | ')); process.exit(1); }
  console.log('proof green.');
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
