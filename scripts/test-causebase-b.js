#!/usr/bin/env node
// test-causebase-b.js — proof for scripts/analyze-causebase-b.js.
//
// Legs (each asserted, any failure exits non-zero naming the leg):
//   (1) synthetic corpus with known causes (monster + scholar deaths mixed
//       in) yields the exact expected kind-filtered table — sweep format
//       AND census format, in one corpus dir each.
//   (2) kind-mix negative control: a corpus of ONLY monster/scholar deaths
//       yields zero villager deaths, not a crash or a mislabel.
//   (3) raw-label preservation (no hidden normalization): labels that look
//       mergeable ('monster' vs 'choir toad'; 'combat' vs 'villager combat')
//       stay distinct with exact counts.
//   (4) determinism: re-running the analyzer on the same corpora is
//       byte-identical (synthetic corpus + one real corpus dir).
//   (5) refusal: unparseable JSON, a per-seed file without rows, a row
//       missing kind, a row missing the scholar flag, and a duplicate seed
//       each exit non-zero naming the problem; a summary file is listed
//       as skipped, not silently dropped.
//
// Synthetic corpora live in a temp dir (created + removed by this test);
// nothing is written into the repo.
'use strict';
const assert = require('assert');
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const HERE = __dirname;
const ANALYZER = path.join(HERE, 'analyze-causebase-b.js');
const REPO = path.dirname(HERE);

function run(args, opts) {
  return spawnSync(process.execPath, [ANALYZER].concat(args), {
    encoding: 'utf8',
    ...(opts || {}),
  });
}
function runOk(args) {
  const r = run(args);
  assert.strictEqual(r.status, 0, 'analyzer exited ' + r.status + ': ' + r.stderr);
  return JSON.parse(r.stdout);
}
function writeDir(root, name, files) {
  const d = path.join(root, name);
  fs.mkdirSync(d, { recursive: true });
  for (const [f, obj] of Object.entries(files)) {
    fs.writeFileSync(path.join(d, f), typeof obj === 'string' ? obj : JSON.stringify(obj));
  }
  return d;
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'causebase-b-test-'));
try {
  // ---- Leg 1: exact kind-filtered table, sweep format ----
  const sweep = writeDir(tmp, 'sweep', {
    's1.json': { seed: 1, policy: 'competent', deathRows: [
      { kind: 'villager', isPlayer: false, cause: 'starvation' },
      { kind: 'villager', isPlayer: false, cause: 'starvation' },
      { kind: 'villager', isPlayer: false, cause: 'monster' },
      { kind: 'person', isPlayer: false, cause: 'ambush' },
      { kind: 'villager', isPlayer: true, cause: 'the arena' },   // scholar: excluded
      { kind: 'monster', isPlayer: false, cause: 'villager combat' }, // monster: excluded
      { kind: 'monster', isPlayer: false, cause: 'combat' },          // monster: excluded
    ] },
    's2.json': { seed: 2, policy: 'competent', deathRows: [
      { kind: 'villager', isPlayer: false, cause: 'sickness' },
      { kind: 'person', isPlayer: false, cause: 'ambush' },
      { kind: 'animal', isPlayer: false, cause: 'combat' }, // animal: excluded
    ] },
  });
  const out1 = runOk([sweep]);
  assert.strictEqual(out1.mode, 'pool');
  assert.strictEqual(out1.rowsTotal, 10, 'leg1 rowsTotal');
  assert.strictEqual(out1.excludedByKind, 3, 'leg1 excludedByKind (2 monster + 1 animal)');
  assert.strictEqual(out1.excludedScholar, 1, 'leg1 excludedScholar');
  assert.strictEqual(out1.villagerDeaths, 6, 'leg1 villagerDeaths');
  assert.deepStrictEqual(out1.pooledCauses, {
    starvation: 2, monster: 1, ambush: 2, sickness: 1,
  }, 'leg1 pooled causes');
  console.log('leg1 sweep-format kind filter: PASS');

  // ---- Leg 1b: census format (deathcensus.deaths, player flag) ----
  const census = writeDir(tmp, 'census', {
    'c1.json': { seed: 7, policy: 'baseline', deathcensus: { deaths: [
      { day: 1, kind: 'monster', who: 'hushwolf', cause: 'villager combat', player: false },
      { day: 2, kind: 'villager', who: 'gen_x', cause: 'the arena', player: true },
      { day: 3, kind: 'villager', who: 'ursula', cause: 'monster', player: false },
      { day: 4, kind: 'person', who: 'gen_y', cause: 'ambush', player: false },
    ] } },
  });
  const out1b = runOk([census]);
  assert.strictEqual(out1b.rowsTotal, 4);
  assert.strictEqual(out1b.excludedByKind, 1);
  assert.strictEqual(out1b.excludedScholar, 1);
  assert.strictEqual(out1b.villagerDeaths, 2);
  assert.deepStrictEqual(out1b.pooledCauses, { monster: 1, ambush: 1 });
  console.log('leg1b census-format kind filter: PASS');

  // ---- Leg 2: monster/scholar-only negative control ----
  const neg = writeDir(tmp, 'neg', {
    'n1.json': { seed: 9, deathRows: [
      { kind: 'monster', isPlayer: false, cause: 'villager combat' },
      { kind: 'monster', isPlayer: false, cause: 'combat' },
      { kind: 'villager', isPlayer: true, cause: 'the arena' },
      { kind: 'villager', isPlayer: true, cause: 'starvation' },
    ] },
  });
  const out2 = runOk([neg]);
  assert.strictEqual(out2.villagerDeaths, 0, 'leg2 must be zero, not a crash or mislabel');
  assert.deepStrictEqual(out2.pooledCauses, {}, 'leg2 causes must be empty');
  console.log('leg2 monster/scholar-only negative control: PASS');

  // ---- Leg 3: raw-label preservation (no hidden normalization) ----
  const raw = writeDir(tmp, 'raw', {
    'r1.json': { seed: 11, deathRows: [
      { kind: 'villager', isPlayer: false, cause: 'monster' },
      { kind: 'villager', isPlayer: false, cause: 'choir toad' },
      { kind: 'villager', isPlayer: false, cause: 'combat' },
      { kind: 'villager', isPlayer: false, cause: 'villager combat' },
      { kind: 'villager', isPlayer: false, cause: 'choir toad' },
    ] },
  });
  const out3 = runOk([raw]);
  assert.deepStrictEqual(out3.pooledCauses, {
    monster: 1, 'choir toad': 2, combat: 1, 'villager combat': 1,
  }, 'leg3 labels must stay distinct');
  console.log('leg3 raw-label preservation: PASS');

  // ---- Leg 4: determinism (synthetic + one real corpus dir) ----
  const a = runOk([sweep]);
  const b = runOk([sweep]);
  assert.strictEqual(JSON.stringify(a), JSON.stringify(b), 'leg4 synthetic determinism');
  const realDir = path.join(REPO, 'evidence', '2026-10-24', 'awayration-size-b-corpus');
  const ra = run([realDir]);
  const rb = run([realDir]);
  assert.strictEqual(ra.status, 0, 'leg4 real-corpus run: ' + ra.stderr);
  assert.strictEqual(ra.stdout, rb.stdout, 'leg4 real-corpus byte-identical stdout');
  console.log('leg4 determinism (synthetic + real corpus): PASS');

  // ---- Leg 5: refusals + summary listing ----
  function expectFail(dir, needle, leg) {
    const r = run([dir]);
    assert.notStrictEqual(r.status, 0, leg + ' must exit non-zero');
    assert.ok(r.stderr.includes(needle), leg + ' stderr must name the problem; got: ' + r.stderr);
  }
  expectFail(writeDir(tmp, 'bad-json', { 'x.json': '{not json' }), 'unparseable', 'leg5a');
  expectFail(writeDir(tmp, 'no-rows', { 'x.json': { seed: 5, policy: 'competent' } }),
    'without per-death rows', 'leg5b');
  expectFail(writeDir(tmp, 'no-kind', { 'x.json': { seed: 5, deathRows: [{ isPlayer: false, cause: 'starvation' }] } }),
    'missing kind', 'leg5c');
  expectFail(writeDir(tmp, 'no-flag', { 'x.json': { seed: 5, deathRows: [{ kind: 'villager', cause: 'starvation' }] } }),
    'missing scholar flag', 'leg5d');
  expectFail(writeDir(tmp, 'dup-seed', {
    'a.json': { seed: 5, deathRows: [] },
    'b.json': { seed: 5, deathRows: [] },
  }), 'duplicate seed', 'leg5e');
  const withSummary = writeDir(tmp, 'summary', {
    's1.json': { seed: 3, deathRows: [{ kind: 'villager', isPlayer: false, cause: 'starvation' }] },
    'sweep-competent.json': { summary: true, files: 1 },
  });
  const out5 = runOk([withSummary]);
  assert.strictEqual(out5.corpora[0].filesSkipped.length, 1, 'leg5f summary must be listed');
  assert.strictEqual(out5.corpora[0].filesSkipped[0].file, 'sweep-competent.json');
  console.log('leg5 refusals + summary listing: PASS');

  console.log('test-causebase-b: ALL LEGS PASS');
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
