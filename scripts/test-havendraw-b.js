#!/usr/bin/env node
// test-havendraw-b.js — sim-havendraw-b instrument proof.
//
// Gates:
//   E0 shape — module loads; exports installHavendraw/classifyOrigin/
//     classifyVOrigin/HDNS; no src/js touched (namespace check).
//   E1 synthetic RED->GREEN — the origin classifier: RED shows the naive
//     atHaven-only probe (the restraint DIAG's w4ctx level) cannot separate
//     feastdraw from raidreach; GREEN shows classifyOrigin separates every
//     origin class from synthetic marker/state rows.
//   E2 determinism — same seed twice with instruments installed ->
//     byte-identical run digests (instrument is deterministic).
//   E3 off-gate — instrument ON vs OFF, same seed -> identical trajectory
//     digests (instrument is read-only / RNG-neutral; a wrap that drew RNG
//     or mutated state would diverge).
//   E4 live schema — 60d instrumented run: every record table has the
//     pre-registered schema fields; instrumentErrors empty.
//
// Usage env (pinned substrate, matches the census sweep):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   ARMORYDRIVE=1 KILLDISC=1 node scripts/test-havendraw-b.js
'use strict';
const path = require('path');
const crypto = require('crypto');
const REPO = process.env.REPO || path.join(__dirname, '..');
const HD = require(path.join(REPO, 'scripts', 'diag-havendraw-b'));
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('  ok: ' + label); }
  else { fail++; console.log('  FAIL: ' + label); }
}

function digestOf(Game) {
  const st = Game.state || {};
  const canon = {
    day: (st.scholar || {}).day || 0,
    pop: ((st.village || {}).roster || []).length,
    wkl: (st.waveKillLog || []).length,
    kills: ((st.waveKillLog || []).map(e => [e.d, e.mid, e.by, e.w].join(':')).join('|')),
    deaths: (st.telemetry || []).filter(t => t.type === 'death').length,
    standing: (function () { try { return Game.villageStandingTotal ? Game.villageStandingTotal() : 0; } catch (e) { return 0; } })(),
    maxWave: (function () { try { return Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { return 1; } })(),
  };
  return crypto.createHash('sha256').update(JSON.stringify(canon)).digest('hex');
}

async function runOnce(seed, days, withInst) {
  const { Game } = await loadGame({ seed, mode: 'havendraw-proof', fullTelemetry: false });
  let hd = null;
  if (withInst) hd = HD.installHavendraw(Game);
  const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
  const policy = AD.armedFor(AD.normBase('lead'));
  await setupGame(Game);
  await quietLog(async () => { await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 30 }); });
  const d = digestOf(Game);
  const T = hd ? hd.T : null;
  if (hd) hd.uninstall();
  return { digest: d, T, days: (Game.state.scholar || {}).day || 0 };
}

(async () => {
  console.log('E0 shape');
  ok(HD.HDNS === 'havendraw', 'namespace is havendraw');
  ok(typeof HD.installHavendraw === 'function', 'installHavendraw exported');
  ok(typeof HD.classifyOrigin === 'function', 'classifyOrigin exported');
  ok(typeof HD.classifyVOrigin === 'function', 'classifyVOrigin exported');
  ok(!/src\/js/.test(require('fs').readFileSync(path.join(REPO, 'scripts', 'diag-havendraw-b.js'), 'utf8').split('\n').filter(l => /require\(/.test(l)).join('')), 'instrument requires no src/js files');

  console.log('E1 synthetic RED->GREEN (origin classifier)');
  // RED: the naive atHaven-only probe (restraint DIAG's w4ctx fidelity) —
  // two haven fights, one feast draw, one raid reach: indistinguishable.
  const naive = (row) => (row.atHaven ? 'at-haven' : 'field');
  const redRows = [
    { mid: 'eater', atHaven: true, feastDraw: true, raidReach: false },
    { mid: 'audit', atHaven: true, feastDraw: false, raidReach: true },
  ];
  ok(naive(redRows[0]) === naive(redRows[1]), 'RED: naive probe cannot separate feastdraw from raidreach (both at-haven)');
  // GREEN: classifyOrigin separates them, plus the full matrix.
  const C = HD.classifyOrigin;
  ok(C({ mid: 'eater', feastDrawMid: 'eater' }) === 'feastdraw', 'GREEN: feastDrawMid match -> feastdraw');
  ok(C({ mid: 'eater', markFaceDraw: true }) === 'feastdraw', 'GREEN: markFaceDraw -> feastdraw');
  ok(C({ mid: 'audit', raidReachMid: 'audit', pendingEncounter: true, pendingMonsterId: 'audit' }) === 'raidreach', 'GREEN: raidReachMid match (pending live) -> raidreach');
  ok(C({ mid: 'the_strike', raidReachMid: 'audit' }) === 'field', 'GREEN: raidReachMid mismatch falls through');
  ok(C({ mid: 'x', markTrap: true }) === 'trap', 'GREEN: markTrap -> trap');
  ok(C({ mid: 'x', markReengage: true }) === 'reengage', 'GREEN: markReengage -> reengage');
  ok(C({ mid: 'x', pendingInTent: true }) === 'tent', 'GREEN: pendingInTent -> tent');
  ok(C({ mid: 'x', pendingEncounter: true, pendingMonsterId: 'x' }) === 'pending-other', 'GREEN: live pending -> pending-other');
  ok(C({ mid: 'x', pendingEncounter: true, pendingMonsterId: 'y' }) === 'field', 'GREEN: pending id mismatch -> field');
  ok(C({ mid: 'x' }) === 'field', 'GREEN: bare row -> field');
  ok(C(null) === 'field', 'GREEN: null ctx -> field');
  const V = HD.classifyVOrigin;
  ok(V({ raid: true }) === 'raiddefense', 'GREEN: opts.raid -> raiddefense');
  ok(V({ lingering: true }) === 'lingerer', 'GREEN: lingering -> lingerer');
  ok(V({ distHaven: 0 }) === 'havengrounds', 'GREEN: distHaven 0 -> havengrounds');
  ok(V({ distHaven: 1 }) === 'havengrounds', 'GREEN: distHaven 1 -> havengrounds');
  ok(V({ distHaven: 2 }) === 'field', 'GREEN: distHaven 2 -> field');
  ok(V({}) === 'field', 'GREEN: bare vctx -> field');

  console.log('E2 determinism (same seed twice, instruments on)');
  const a = await runOnce(65811, 60, true);
  const b = await runOnce(65811, 60, true);
  ok(a.digest === b.digest, `byte-identical digests on instrumented path (${a.digest.slice(0, 12)})`);

  console.log('E3 off-gate (instrument ON vs OFF, same seed)');
  const c = await runOnce(65812, 60, false);
  const d2 = await runOnce(65812, 60, true);
  ok(c.digest === d2.digest, `instrument does not perturb trajectories (${c.digest.slice(0, 12)})`);

  console.log('E4 live schema (60d instrumented run)');
  const T = d2.T;
  ok(T && Array.isArray(T.fights) && Array.isArray(T.ends) && Array.isArray(T.vfights)
    && Array.isArray(T.raids) && Array.isArray(T.musters) && Array.isArray(T.draws), 'all six record tables present');
  const req = { fights: ['day', 'mid', 'wave', 'atHaven', 'feasted', 'origin', 'party'],
    ends: ['day', 'result', 'perFighter', 'compDmg'],
    vfights: ['day', 'vid', 'mid', 'wave', 'origin', 'outcome'],
    raids: ['day', 'fired', 'raiders', 'palisade'],
    musters: ['day', 'kind'],
    draws: ['day', 'kind'] };
  let schemaOk = true;
  for (const k of Object.keys(req)) {
    for (const row of (T[k] || [])) for (const f of req[k]) { if (!(f in row)) { schemaOk = false; } }
  }
  ok(schemaOk, 'every row carries its pre-registered schema fields');
  ok(T.instrumentErrors.length === 0, `instrumentErrors empty (got ${T.instrumentErrors.length})`);
  const origins = new Set((T.fights || []).map(f => f.origin));
  ok(origins.size >= 1 || T.fights.length === 0, `origin classes observed live: ${[...origins].join(',') || '(no fights in 60d)'}`);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH:', (e && e.stack) || e); process.exit(1); });
