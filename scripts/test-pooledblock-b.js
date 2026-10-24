#!/usr/bin/env node
// test-pooledblock-b.js — proof gates for sim-pooledblock-b (MEASUREMENT ONLY).
// Gates (all must PASS before the 128-config sweep):
//   C1  seed-freshness: 92831-92846 appear as "seed" fields in NO existing corpus
//       and in NO scripts/*.js.
//   C2  determinism: one block-3 pilot config run twice -> byte-identical
//       per-seed JSON (minus timing).
//   C3  corpus repro (pooling-legitimacy): 2 block-2 configs + 1 block-1 config
//       re-run on current master must byte-reproduce the corpus hc + glut
//       fields (per the pre-registered contingency in sim-pooledblock-b.md).
//   C4  identity: hc.deposit === channelScholarHomecoming on every pilot seed.
// Usage: node scripts/test-pooledblock-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SEEDS = []; for (let s = 92831; s <= 92846; s++) SEEDS.push(s);
const SCRATCH = path.join(os.homedir(), 'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-pooledblock-b/proof');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

function stripMs(x) {
  if (Array.isArray(x)) return x.map(stripMs);
  if (x && typeof x === 'object') {
    const o = {};
    for (const [k, v] of Object.entries(x)) if (k !== 'ms') o[k] = stripMs(v);
    return o;
  }
  return x;
}

function runSweep(cell, policy, seed, outdir) {
  fs.mkdirSync(outdir, { recursive: true });
  const pd = cell.startsWith('pd1') ? '1' : '0';
  const dg = cell.endsWith('dg1') ? '1' : '0';
  const r = spawnSync('node', [path.join(__dirname, 'sweep-pooledblock-b.js')], {
    env: Object.assign({}, process.env, {
      FEASTSCALE_R13: '1', SEATDRIVE: '0',
      PLENTYDEPRI: pd, DEPOSITGATE: dg,
      CELL: cell, POLICY: policy, SEEDS: String(seed), DAYS: '100',
      PERSEED_DIR: outdir, OUT: path.join(outdir, 'sweep.json'),
    }),
    encoding: 'utf8', timeout: 20 * 60 * 1000,
  });
  return r;
}
function readPerseeed(outdir, cell, policy, seed) {
  const p = path.join(outdir, `pooledblock-b-${cell}-${policy}-s${seed}.json`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

// ---- C1: freshness gate ----
(function c1() {
  const hits = [];
  const corpusRoots = [];
  for (const d of fs.readdirSync(path.join(ROOT, 'evidence'))) {
    if (!/^2026-10-/.test(d)) continue;
    const full = path.join(ROOT, 'evidence', d);
    for (const sub of fs.readdirSync(full)) {
      if (/^(perseed|journey-perseed)/.test(sub)) corpusRoots.push(path.join(full, sub));
    }
  }
  const seedRe = /"seed"\s*:\s*(\d+)/g;
  for (const root of corpusRoots) {
    let files;
    try { files = fs.readdirSync(root).filter(f => f.endsWith('.json')); } catch (e) { continue; }
    for (const f of files) {
      let txt;
      try { txt = fs.readFileSync(path.join(root, f), 'utf8'); } catch (e) { continue; }
      let m;
      while ((m = seedRe.exec(txt))) {
        const n = +m[1];
        if (n >= 92831 && n <= 92846) hits.push(root + '/' + f + ':' + n);
      }
    }
  }
  // scripts scan — exclude this run's own pooledblock-* scripts (they legitimately
  // name the pre-registered block; the gate is about PRE-EXISTING references)
  const scrRe = /928(3[1-9]|4[0-6])/;
  for (const f of fs.readdirSync(path.join(ROOT, 'scripts')).filter(f => f.endsWith('.js') && !/pooledblock/.test(f))) {
    let txt;
    try { txt = fs.readFileSync(path.join(ROOT, 'scripts', f), 'utf8'); } catch (e) { continue; }
    if (scrRe.test(txt)) hits.push('scripts/' + f);
  }
  check('C1 freshness: 92831-92846 in no existing corpus or script', hits.length === 0, hits.slice(0, 5).join(' | '));
  console.log('   corpus roots scanned: ' + corpusRoots.length);
})();

// ---- C2/C3/C4: sweep-based gates ----
const sweeps = [
  { gate: 'C2', cell: 'pd0dg0', policy: 'belongfeast', seed: 92831, repeat: true },   // determinism
  { gate: 'C3b2', cell: 'pd0dg0', policy: 'belongfeast', seed: 92801, corpus: 'perseed-homecoming-diag-b', cname: 'homecoming-diag-b' },
  { gate: 'C3b2', cell: 'pd1dg0', policy: 'belongfeast', seed: 92801, corpus: 'perseed-homecoming-diag-b', cname: 'homecoming-diag-b' },
  { gate: 'C3b1', cell: 'pd0dg0', policy: 'belongfeast', seed: 9250, corpus: 'easingchannels-b-corpus', cname: 'easingchannels-b' },
];
const corpusJson = {};
for (const t of sweeps) {
  const dir = path.join(SCRATCH, t.gate + '-' + t.cell + '-' + t.policy + '-s' + t.seed);
  console.log(`-- running sweep ${t.gate} ${t.cell}/${t.policy}/s${t.seed} ...`);
  const r = runSweep(t.cell, t.policy, t.seed, dir);
  check(t.gate + ` sweep exit 0 (${t.cell}/${t.policy}/s${t.seed})`, r.status === 0, r.status !== 0 ? (r.stderr || '').slice(-400) : null);
  if (r.status !== 0) continue;
  const j1 = readPerseeed(dir, t.cell, t.policy, t.seed);
  // C4 identity on every pilot seed
  if (t.gate === 'C2' || true) {
    const id = j1.extra && j1.extra.hc && j1.extra.hc.deposit === j1.extra.hc.channelScholarHomecoming;
    check('C4 identity hc.deposit===channel (' + t.gate + '/' + t.cell + '/' + t.policy + '/s' + t.seed + ')', id,
      JSON.stringify({ deposit: j1.extra.hc.deposit, channel: j1.extra.hc.channelScholarHomecoming }));
  }
  if (t.gate === 'C2' && t.repeat) {
    const dir2 = dir + '-rerun';
    console.log('-- re-running for determinism ...');
    const r2 = runSweep(t.cell, t.policy, t.seed, dir2);
    check('C2 rerun exit 0', r2.status === 0);
    if (r2.status === 0) {
      const j2 = readPerseeed(dir2, t.cell, t.policy, t.seed);
      const same = JSON.stringify(stripMs(j1)) === JSON.stringify(stripMs(j2));
      check('C2 determinism: identical per-seed JSON across runs', same);
    }
  }
  if (t.corpus) {
    const cp = path.join(ROOT, 'evidence', '2026-10-23', t.corpus, `${t.cname}-${t.cell}-${t.policy}-s${t.seed}.json`);
    let cj;
    try { cj = JSON.parse(fs.readFileSync(cp, 'utf8')); }
    catch (e) { check('C3 corpus file exists ' + t.gate, false, cp); continue; }
    corpusJson[t.gate + t.seed + t.cell] = cj;
    // compare the pooling-relevant fields: hc sub-channels (when present),
    // glutChannels, glutInflowByChannel, glutDays
    const fields = ['glutChannels', 'glutDays'];
    const mine = { glutChannels: j1.glutChannels, glutDays: j1.extra.glutDays, gic: j1.extra.glutInflowByChannel };
    const theirs = { glutChannels: cj.glutChannels, glutDays: cj.extra.glutDays, gic: cj.extra.glutInflowByChannel };
    let same = JSON.stringify(mine) === JSON.stringify(theirs);
    check(`C3 ${t.gate}: master reproduces corpus glut fields (${t.cell}/${t.policy}/s${t.seed})`, same,
      same ? null : JSON.stringify({ mine, theirs }).slice(0, 600));
    if (j1.extra.hc && cj.extra && cj.extra.hc) {
      const mhc = {}, chc = {};
      for (const k of ['brought', 'kept', 'deposit', 'spoiled', 'capStranded', 'keepRaise', 'decisions']) {
        mhc[k] = j1.extra.hc[k]; chc[k] = cj.extra.hc[k];
      }
      const hsame = JSON.stringify(mhc) === JSON.stringify(chc);
      check(`C3 ${t.gate}: master reproduces corpus hc fields (${t.cell}/${t.policy}/s${t.seed})`, hsame,
        hsame ? null : JSON.stringify({ mhc, chc }));
    } else {
      console.log('   (no hc fields on one side — glut comparison stands)');
    }
  }
}

console.log(`\n${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
