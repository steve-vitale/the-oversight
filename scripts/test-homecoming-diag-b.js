#!/usr/bin/env node
// test-homecoming-diag-b.js — proof test for the sim-homecoming-diag-b DIAG
// (loop B, run fleshout-loop-b-20261023T1241Z). MEASUREMENT ONLY.
//
// Proves, BEFORE the full sweep:
//   1. env substrate asserted (FEASTSCALE_R13=1, SEATDRIVE=0)
//   2. both lever hooks byte-identical to their landing commits
//      (test-plentydepri-b.js + test-depositgate-b.js re-run GREEN)
//   3. pilot (2 seeds x 4 cells x leadfeast): the homecoming sub-channel
//      identities hold per seed:
//        (a) hc.deposit == glutChannels.scholarHomecoming (the choke-point
//            channel inflow — the instrument's own taxonomy)
//        (b) hc.brought == hc.kept + hc.deposit + hc.spoiled (decision
//            identity; capStranded is a kept subset, keepRaise a kept subset)
//   4. determinism: the IDENTICAL instrument run twice on one config
//      reproduces every hc + shared field exactly
//   5. corpus reproduction: the identical instrument on seed 9250/pd0dg0/
//      leadfeast reproduces the easingchannels corpus shared fields exactly
//      (observer-effect lesson: only the identical instrument reproduces)
//
// Exit 0 = ALL GREEN. Any failure = loud, with the failing check named.
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SWEEP = path.join(__dirname, 'sweep-homecoming-diag-b.js');
const CORPUS = path.join(ROOT, 'evidence', '2026-10-23', 'perseed-homecoming-diag-b');
const EC_CORPUS = path.join(ROOT, 'evidence', '2026-10-23', 'easingchannels-b-corpus');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

function runSweep(env) {
  const scratch = '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-homecoming-diag-b';
  try { fs.mkdirSync(scratch, { recursive: true }); } catch (e) {}
  const e = Object.assign({}, process.env, {
    FEASTSCALE_R13: '1', SEATDRIVE: '0',
    DAYS: '100', OUT: path.join(scratch, 'proof-' + env.CELL + '-' + env.POLICY + '.json'),
  }, env);
  const out = execFileSync('node', [SWEEP], { env: e, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return out;
}

function readPerSeed(cell, policy, seed) {
  const p = path.join(CORPUS, `homecoming-diag-b-${cell}-${policy}-s${seed}.json`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

(async () => {
  // ---- 1. env ----
  check('env FEASTSCALE_R13=1', process.env.FEASTSCALE_R13 === '1');
  check('env SEATDRIVE=0', process.env.SEATDRIVE === '0');
  if (process.env.FEASTSCALE_R13 !== '1' || process.env.SEATDRIVE !== '0') {
    console.log('FATAL: set FEASTSCALE_R13=1 SEATDRIVE=0'); process.exit(2);
  }

  // ---- 2. hook byte-identity (prior proofs re-run GREEN) ----
  try {
    execFileSync('node', [path.join(__dirname, 'test-plentydepri-b.js')], { encoding: 'utf8', stdio: 'pipe' });
    check('plentydepri proof re-run GREEN', true);
  } catch (e) { check('plentydepri proof re-run GREEN', false, (e.message || '').slice(0, 200)); }
  try {
    execFileSync('node', [path.join(__dirname, 'test-depositgate-b.js')], { encoding: 'utf8', stdio: 'pipe' });
    check('depositgate proof re-run GREEN', true);
  } catch (e) { check('depositgate proof re-run GREEN', false, (e.message || '').slice(0, 200)); }

  // ---- 3. pilot: 2 seeds x 4 cells x leadfeast ----
  const cells = ['pd0dg0', 'pd0dg1', 'pd1dg0', 'pd1dg1'];
  for (const cell of cells) {
    const pd = cell.startsWith('pd1') ? '1' : '0';
    const dg = cell.endsWith('dg1') ? '1' : '0';
    runSweep({ CELL: cell, POLICY: 'leadfeast', PLENTYDEPRI: pd, DEPOSITGATE: dg, SEEDS: '92801,92802' });
    for (const s of [92801, 92802]) {
      const r = readPerSeed(cell, 'leadfeast', s);
      const hc = r.extra.hc;
      check(`${cell}/leadfeast/s${s} channel identity (hc.deposit==scholarHomecoming)`,
        hc.deposit === r.glutChannels.scholarHomecoming,
        `hc.deposit=${hc.deposit} channel=${r.glutChannels.scholarHomecoming}`);
      check(`${cell}/leadfeast/s${s} decision identity (brought==kept+deposit+spoiled)`,
        hc.brought === hc.kept + hc.deposit + hc.spoiled,
        `brought=${hc.brought} kept=${hc.kept} deposit=${hc.deposit} spoiled=${hc.spoiled}`);
      check(`${cell}/leadfeast/s${s} keepRaise subset of kept`,
        hc.keepRaise <= hc.kept, `keepRaise=${hc.keepRaise} kept=${hc.kept}`);
      check(`${cell}/leadfeast/s${s} keepRaise==0 on DG=0`,
        dg === '1' || hc.keepRaise === 0, `keepRaise=${hc.keepRaise} dg=${dg}`);
      check(`${cell}/leadfeast/s${s} hc fields present`,
        hc.decisions != null && hc.broughtPerDecision != null && r.extra.scholarPackEaten != null);
    }
  }

  // ---- 4. determinism: identical instrument twice ----
  runSweep({ CELL: 'pd0dg0', POLICY: 'leadfeast', PLENTYDEPRI: '0', DEPOSITGATE: '0', SEEDS: '92801' });
  const a = readPerSeed('pd0dg0', 'leadfeast', 92801);
  runSweep({ CELL: 'pd0dg0', POLICY: 'leadfeast', PLENTYDEPRI: '0', DEPOSITGATE: '0', SEEDS: '92801' });
  const b = readPerSeed('pd0dg0', 'leadfeast', 92801);
  const fields = ['rotFreshKcal', 'rotPreservedKcal', 'depriKcal', 'easedKcal', 'daysAlive', 'villageDays'];
  let detOk = true, detDetail = '';
  for (const f of fields) if (a[f] !== b[f]) { detOk = false; detDetail += `${f}:${a[f]}!=${b[f]} `; }
  const hcf = ['decisions', 'brought', 'kept', 'deposit', 'spoiled', 'capStranded', 'keepRaise',
    'glutBrought', 'glutKept', 'glutDeposit', 'glutKeepRaise'];
  for (const f of hcf) if (a.extra.hc[f] !== b.extra.hc[f]) { detOk = false; detDetail += `hc.${f}:${a.extra.hc[f]}!=${b.extra.hc[f]} `; }
  const ef = ['funnelShareGlut', 'awayWildGlut', 'glutDays', 'attribution', 'rot100d'];
  for (const f of ef) if (a.extra[f] !== b.extra[f]) { detOk = false; detDetail += `extra.${f}:${a.extra[f]}!=${b.extra[f]} `; }
  check('determinism: identical instrument reproduces all hc+shared fields', detOk, detDetail.trim());

  // ---- 5. corpus reproduction: easingchannels corpus, seed 9250/pd0dg0/leadfeast ----
  runSweep({ CELL: 'pd0dg0', POLICY: 'leadfeast', PLENTYDEPRI: '0', DEPOSITGATE: '0', SEEDS: '9250' });
  const mine = readPerSeed('pd0dg0', 'leadfeast', 9250);
  const ec = JSON.parse(fs.readFileSync(path.join(EC_CORPUS, 'easingchannels-b-pd0dg0-leadfeast-s9250.json'), 'utf8'));
  let corpOk = true, corpDetail = '';
  for (const f of ['rotFreshKcal', 'rotPreservedKcal', 'depriKcal', 'easedKcal']) {
    if (mine[f] !== ec[f]) { corpOk = false; corpDetail += `${f}:${mine[f]}!=${ec[f]} `; }
  }
  for (const f of ['funnelShareGlut', 'awayWildGlut', 'glutDays', 'attribution', 'rot100d']) {
    if (mine.extra[f] !== ec.extra[f]) { corpOk = false; corpDetail += `extra.${f}:${mine.extra[f]}!=${ec.extra[f]} `; }
  }
  for (const ch of ['funnelShare', 'scholarHomecoming', 'tributeDeposit', 'awayReturn', 'ambientBighaul', 'other']) {
    if (mine.glutChannels[ch] !== ec.glutChannels[ch]) { corpOk = false; corpDetail += `glutChannels.${ch}:${mine.glutChannels[ch]}!=${ec.glutChannels[ch]} `; }
  }
  check('corpus reproduction: identical instrument reproduces easingchannels corpus (s9250/pd0dg0/leadfeast)', corpOk, corpDetail.trim());
  // clean the corpus-repro seed (not part of the 92801+ design)
  try { fs.unlinkSync(path.join(CORPUS, 'homecoming-diag-b-pd0dg0-leadfeast-s9250.json')); } catch (e) {}

  console.log(`\n${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH', e && e.stack ? e.stack : e); process.exit(2); });
