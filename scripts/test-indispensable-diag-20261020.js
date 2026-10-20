#!/usr/bin/env node
// test-indispensable-diag-20261020.js — proof for the indispensable-gate
// DIAG instrument (sim-indispensable, 2026-10-20, flesh-out loop).
//
// Proves, BEFORE the sweep spends seeds:
//   T1: substrate guard fires without INDISPDIAG=1 (exit 2).
//   T2: SMOKE mode runs green (exit 0, seat fields recorded).
//   T3: DET mode runs green (layers-ON twice byte-identical, exit 0).
//   T4: DG.snapGate reads the engine's REAL gate fields on real state
//       (seat string, gate w1..w5/contests/crises/stage/foodDeeds, indisp
//       why-string, ledger score) — in-process harness, no writes.
//   T5: the recorder is read-only: INDISPDIAG=1 vs unset produce
//       byte-identical trajectories on the same seed (dayHash series
//       equal — the layer draws no RNG and writes no game state).
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');
const assert = require('assert');

const PROBE = path.join(__dirname, 'probe-indispensable-diag-20261020.js');
const BASE_ENV = {
  FEASTSCALE_R13: '1', TRIBFLOOR: '1', SUCCGRACE: '1', RAIDDENSITY: '1',
  WINPURSUIT: '1', WINDEFER: '1', SEATDRIVE: '1', NODEWITNESS: '1',
  KILLDISC: '1', TABLEPATHDRIVER: '1', RELAYDARK: '1', INDISPDIAG: '1',
};
function run(env, extra) {
  const e = Object.assign({}, process.env, BASE_ENV, extra || {});
  try {
    const out = execFileSync('node', [PROBE], { env: e, encoding: 'utf8', timeout: 600000, maxBuffer: 64 * 1024 * 1024 });
    return { code: 0, out };
  } catch (err) {
    return { code: err.status || 1, out: String((err.stdout || '') + (err.stderr || '')) };
  }
}

async function main() {
  const results = [];
  const check = (name, cond, extra) => {
    results.push([cond ? 'PASS' : 'FAIL', name, extra || '']);
    console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' — ' + extra : ''}`);
  };

  // T1: guard fires without INDISPDIAG.
  {
    const r = run({}, { INDISPDIAG: undefined, SMOKE: '1', ONLY: 'leadfeast', SEEDS: '64201', DAYS: '30' });
    // execFileSync env: setting undefined deletes it from env (node keeps it as undefined -> removed).
    check('T1 guard-fires-without-INDISPDIAG', r.code === 2, `exit=${r.code}`);
  }

  // T2: SMOKE green.
  {
    const r = run({}, { SMOKE: '1', ONLY: 'leadfeast', SEEDS: '64201', DAYS: '30' });
    check('T2 smoke-green', r.code === 0 && /seat=(none|lesser|full)/.test(r.out), `exit=${r.code}`);
  }

  // T3: DET green.
  {
    const r = run({}, { DET: '1', ONLY: 'leadfeast', SEEDS: '64201,64202' });
    check('T3 det-green', r.code === 0 && /DET: 2 pass, 0 fail/.test(r.out), `exit=${r.code}`);
  }

  // T4: snapGate reads real engine fields on real state (in-process).
  {
    const { loadGame, setupGame, quietLog } = require('./sim-harness');
    const DG = require('./policies/indispensable-diag');
    const { Game } = await loadGame({ seed: 64201, mode: 'posttable', fullTelemetry: false });
    await setupGame(Game);
    let s;
    await quietLog(async () => { s = DG.snapGate(Game); });
    let ok = true, note = '';
    try {
      assert.strictEqual(typeof s.seat, 'string');
      assert.ok(s.gate, 'gate present');
      assert.strictEqual(typeof s.gate.w5, 'number');
      assert.strictEqual(typeof s.gate.foodDeeds, 'boolean');
      assert.ok(s.indisp, 'indisp present');
      assert.strictEqual(typeof s.indisp.why, 'string');
      assert.strictEqual(typeof s.ledger.score, 'number');
      note = `seat=${s.seat} indispWhy="${s.indisp.why.slice(0, 60)}..."`;
    } catch (e) { ok = false; note = e.message; }
    check('T4 snapGate-real-fields', ok, note);
  }

  // T5: read-only — INDISPDIAG=1 vs unset, identical trajectories.
  // (The sweep-mode probe writes JSONs; use SMOKE with DAYS=60 and
  // compare the printed hash-free fields plus a detached run that dumps
  // dayHash series. Cheaper: DET already proved ON-twice identical; this
  // proves OFF-side delegation matches. Run probe DET with INDISPDIAG=1
  // (done in T3); here run SMOKE twice with INDISPDIAG toggled and
  // compare seat/day fields — the driver's own DET (pilot) pinned the
  // inner stack, so any delta would be the recorder's.)
  {
    const a = run({}, { SMOKE: '1', ONLY: 'leadfeast', SEEDS: '64201', DAYS: '60' });
    const e2 = Object.assign({}, process.env, BASE_ENV);
    delete e2.INDISPDIAG;
    let b;
    try {
      // probe guard requires INDISPDIAG=1 — so instead compare via a
      // one-shot node snippet that runs the same 60d through runDays
      // with the diag layer ON vs OFF and compares dayHash series.
      const snippet = `
        const TF = require('./policies/tribfloor');
        const WD = require('./policies/windefer');
        const SD = require('./policies/seatdrive');
        const TPD = require('./policies/tablepathdriver');
        const RD = require('./policies/relaydark');
        const DG = require('./policies/indispensable-diag');
        const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
        const { dayHash } = require('./det-gate');
        (async () => {
          const out = [];
          for (const on of [true, false]) {
            if (on) process.env.INDISPDIAG = '1'; else delete process.env.INDISPDIAG;
            const rd = RD.withRelayDark(TF.leadfeast, 'x-rd', 'x', { active: false });
            const wd = WD.withWinDefer(rd, 'x-wd', 'x');
            const sd = SD.withSeatDrive(wd, 'x-sd', 'x');
            const tp = TPD.withTablePathDriver(sd, 'x-tp', 'x', { door: 'feared', trial: false });
            const pol = DG.withIndispDiag(tp, 'x-dg', 'x');
            const { Game } = await loadGame({ seed: 64201, mode: 'posttable', fullTelemetry: false });
            await setupGame(Game);
            const hashes = [];
            const orig = pol.daily;
            pol.daily = (G, ctx) => { const r = orig(G, ctx); try { hashes.push(dayHash(G)); } catch (e) {} return r; };
            await quietLog(async () => { await runDays(Game, pol, { days: 60, manifest: undefined, sampleEvery: 1 }); });
            out.push(hashes.join('|'));
          }
          console.log(out[0] === out[1] ? 'IDENTICAL' : 'DIVERGED');
        })().catch(e => { console.error('FATAL', e.message); process.exit(1); });
      `;
      const bo = execFileSync('node', ['-e', snippet], {
        env: e2, encoding: 'utf8', timeout: 600000, maxBuffer: 64 * 1024 * 1024, cwd: __dirname,
      });
      b = { code: 0, out: bo };
    } catch (err) { b = { code: 1, out: String(err.stdout || '') + String(err.stderr || '') }; }
    check('T5 recorder-read-only', b.code === 0 && /IDENTICAL/.test(b.out), b.code === 0 ? b.out.trim() : b.out.slice(-300));
  }

  const fails = results.filter(r => r[0] === 'FAIL').length;
  console.log(`\n${results.length - fails}/${results.length} pass`);
  if (fails) process.exit(3);
}
main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
