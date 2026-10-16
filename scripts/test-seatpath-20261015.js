#!/usr/bin/env node
'use strict';
// test-seatpath-20261015.js — proof for the seatpath funnel instrument
// (flesh-out loop, 2026-10-15, scale-onramp axis, sim-seatpath,
// DIAGNOSTIC: no lever, pre-registered GO = 100% attribution).
//
// A read-only instrument is only trustworthy if base+instrument is
// trajectory-identical to plain base. Proves:
//   1. instrument exports + wraps (composition intact); substrate gates
//      asserted at load
//   2. SMOKE: both policies drive 15d, funnel live, preview callable
//   3. DET-GATE: plain-base vs instrument-base on 4 seeds [163,274,385,496],
//      60d each — both-repeat design distinguishes an instrument leak from
//      the known timestamp-entropy issue (det-gate.js header)
//   4. funnel classifier honesty: synthetic Game stubs exercise every
//      attribution branch (never-offered x3, gate-blocked x3,
//      offered-but-never-invoked, not-open cases) — the attribution logic
//      the GO threshold rests on
//   5. ctx snapshot/diff honesty: snapCtx/diffSnap round-trip on a live ctx
const fails = [];
const passes = [];
function check(name, cond, detail) {
  console.log(`  ${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (cond) passes.push(name); else fails.push(name);
}

// Stub Game for classifier tests: pure state reads, no engine.
function stubGame(opts) {
  opts = opts || {};
  const alive = opts.alive !== false;
  return {
    villagerId: 'p_stub',
    getPerson: () => ({ dead: !alive }),
    state: { scholar: { day: opts.day || 0, exiled: !!opts.exiled, joinedVillage: !!opts.joined } },
    progState: () => ({ tableWaiting: !!opts.waiting, tableDone: !!opts.done }),
    tableSeat: () => ({ seat: opts.seat || 'lesser' }),
    tablePreview: () => (opts.preview === undefined ? { ready: true, seat: opts.seat || 'lesser', doors: ['a'], overtime: 0 } : opts.preview),
    playerAtHaven: () => !!opts.haven,
  };
}

(async () => {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY']) {
    if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required (substrate).`); process.exit(2); }
  }
  process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
  for (const k of ['WAVE5REACH', 'W3DRIVE', 'SEATDRIVE']) {
    if (process.env[k] === '1') { console.error(`PROOF STOP: ${k} must be UNSET on the pre-seat substrate.`); process.exit(2); }
  }

  const SP = require('./seatpath-20261015');
  check('exports withSeatPath', typeof SP.withSeatPath === 'function', '');
  check('exports newFunnel/sampleFunnel', typeof SP.newFunnel === 'function' && typeof SP.sampleFunnel === 'function', '');
  check('exports snapCtx/diffSnap/scholarAlive/policyFor', typeof SP.snapCtx === 'function' && typeof SP.diffSnap === 'function' && typeof SP.scholarAlive === 'function' && typeof SP.policyFor === 'function', '');
  const TF = require('./policies/tribfloor');
  check('tribfloor base ids present', !!TF.leadfeast && !!TF.belongfeast, '');
  check('policyFor returns base ids', SP.policyFor('leadfeast').id === 'leadfeast' && SP.policyFor('belongfeast').id === 'belongfeast', '');

  // --- 4. classifier honesty (synthetic — the attribution logic itself) ---
  let r;
  r = SP.sampleFunnel(stubGame({ waiting: false, day: 100 }));
  check('not-waiting -> null (not an open-invite dawn)', r === null, JSON.stringify(r));
  r = SP.sampleFunnel(stubGame({ waiting: true, done: true, day: 100 }));
  check('tableDone -> null', r === null, JSON.stringify(r));
  r = SP.sampleFunnel(stubGame({ waiting: true, day: 60, seat: 'lesser', preview: null }));
  check('waiting, preview null, day<90 -> never-offered:winDayFloor', r && r.cls === 'never-offered' && r.sub === 'winDayFloor', JSON.stringify(r));
  r = SP.sampleFunnel(stubGame({ waiting: true, day: 120, seat: 'none', preview: null }));
  check('waiting, preview null, seat none -> never-offered:no-seat', r && r.cls === 'never-offered' && r.sub === 'no-seat', JSON.stringify(r));
  r = SP.sampleFunnel(stubGame({ waiting: true, day: 120, seat: 'lesser', preview: { ready: false } }));
  check('preview !ready -> gate-blocked:preview-not-ready', r && r.cls === 'gate-blocked' && r.sub === 'preview-not-ready', JSON.stringify(r));
  r = SP.sampleFunnel(stubGame({ waiting: true, day: 120, seat: 'full', alive: false }));
  check('scholar dead -> gate-blocked:scholar-dead', r && r.cls === 'gate-blocked' && r.sub === 'scholar-dead', JSON.stringify(r && { cls: r.cls, sub: r.sub }));
  r = SP.sampleFunnel(stubGame({ waiting: true, day: 120, seat: 'lesser', exiled: true }));
  check('exiled -> gate-blocked:council-gate', r && r.cls === 'gate-blocked' && r.sub === 'council-gate', JSON.stringify(r && { cls: r.cls, sub: r.sub }));
  r = SP.sampleFunnel(stubGame({ waiting: true, day: 120, seat: 'full', haven: true }));
  check('offered: ready+alive+proposable -> offered-but-never-invoked', r && r.cls === 'offered-but-never-invoked' && r.sub === 'policy-has-no-seat-verb', JSON.stringify(r && { cls: r.cls, sub: r.sub }));
  check('offered record carries scholar context', !!(r && r.seat === 'full' && r.atHaven === true && r.scholarAlive === true), JSON.stringify(r && { seat: r.seat, haven: r.atHaven, alive: r.scholarAlive }));
  // every classifier output has the exact keys the analyzer reads
  const keys = ['day', 'cls', 'sub', 'seat', 'pvDoors', 'pvSeat', 'overtime', 'scholarAlive', 'atHaven', 'exiled', 'joinedVillage'];
  check('record key contract', r && keys.every(k => k in r), 'missing: ' + keys.filter(k => !(k in (r || {}))).join(','));

  // --- 5. snap/diff honesty ---
  {
    const ctx = { a: 1, b: 5, s: 'x', _seatpath: { dawns: [] }, o: {} };
    const before = SP.snapCtx(ctx);
    check('snapCtx picks numerics only', before.a === 1 && before.b === 5 && !('s' in before) && !('o' in before) && !('_seatpath' in before), JSON.stringify(before));
    ctx.a = 4; ctx.c = 2;
    const d = SP.diffSnap(before, SP.snapCtx(ctx));
    check('diffSnap deltas honest', d.a === 3 && d.c === 2 && !('b' in d), JSON.stringify(d));
  }

  // --- 2. SMOKE ---
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  for (const policyId of ['belongfeast', 'leadfeast']) {
    const { Game } = await loadGame({ seed: 163, mode: `seatpath-proof-smoke-${policyId}`, fullTelemetry: false });
    await setupGame(Game);
    let funnelLive = null, dailyRan = false;
    const base = SP.policyFor(policyId);
    const policy = SP.withSeatPath(base, base.id + '-seatpath', base.desc + ' [PROOF]');
    const oSetup = policy.setup;
    policy.setup = (G, ctx) => { if (oSetup) oSetup(G, ctx); funnelLive = !!(ctx && ctx._seatpath); };
    const oDaily = policy.daily;
    policy.daily = (G, ctx) => { dailyRan = dailyRan || !!(ctx && ctx._seatpath); return oDaily(G, ctx); };
    let rr = null;
    await quietLog(async () => { rr = await runDays(Game, policy, { days: 15, sampleEvery: 30 }); });
    check(`${policyId}: funnel live`, funnelLive === true, '');
    check(`${policyId}: funnel daily ran`, dailyRan === true, '');
    check(`${policyId}: 15d run completes`, !!(rr && rr.days >= 15), `days=${rr && rr.days}`);
    check(`${policyId}: tablePreview callable`, typeof Game.tablePreview === 'function', '');
  }

  // --- 3. DET-GATE: plain vs instrument on 4 seeds, 60d, both-repeat ---
  const { dayHash } = require('./det-gate');
  async function runHashes(policy, seed, days) {
    const { Game } = await loadGame({ seed, mode: 'seatpath-proof-det', fullTelemetry: false });
    await setupGame(Game);
    const hashes = [];
    const wrapped = Object.assign({}, policy);
    const base = policy.daily;
    wrapped.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base ? base(G, ctx) : undefined; };
    await quietLog(async () => { await runDays(Game, wrapped, { days, sampleEvery: 1 }); });
    return hashes.join('\n');
  }
  for (const seed of [163, 274, 385, 496]) {
    const plain = SP.policyFor('leadfeast');
    const instr = SP.withSeatPath(SP.policyFor('leadfeast'), 'leadfeast-seatpath', 'leadfeast [PROOF]');
    const hP1 = await runHashes(plain, seed, 60);
    const hP2 = await runHashes(plain, seed, 60);
    const hC1 = await runHashes(instr, seed, 60);
    const hC2 = await runHashes(instr, seed, 60);
    const plainStable = hP1 === hP2;
    const instrStable = hC1 === hC2;
    check(`seed ${seed}: plain-repeat stable`, plainStable, plainStable ? '' : 'known timestamp-entropy suspected');
    check(`seed ${seed}: instr-repeat stable`, instrStable, instrStable ? '' : 'known timestamp-entropy suspected');
    check(`seed ${seed}: instrument trajectory-identical`, plainStable && instrStable && hP1 === hC1,
      (plainStable && instrStable) ? (hP1 === hC1 ? '' : 'INSTRUMENT LEAK') : 'seed unstable, skip');
  }

  delete process.env.WINDEFER;
  console.log(`\nseatpath proof: ${passes.length}/${passes.length + fails.length} GREEN`);
  if (fails.length) { console.error('PROOF FAILED: ' + fails.join(' | ')); process.exit(1); }
  console.log('proof green.');
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
