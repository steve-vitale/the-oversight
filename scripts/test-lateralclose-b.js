#!/usr/bin/env node
// test-lateralclose-b.js — proof for sim-lateralclose-b (2026-11-02).
// Covers: analyzer fixtures (p0Index, primarySet, classifyDiff
// classes, snapshotEqual), live probeAll structure on one real
// game load, and a reused-files-unmodified check (zero edits
// to game code, competent, the homewardstep policy, the
// sim harness, or any destfirst/atimescale instrument).
// Writes fixtures to /tmp only; never writes into the repo.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync, execFileSync } = require('child_process');
const assert = require('assert');
const HERE = path.dirname(__filename);
const ANALYZER = path.join(HERE, 'lateralclose-b-analyze.js');
const PROBE = path.join(HERE, 'lateralclose-b-probe.js');
const { classifyDiff, p0Index, primarySet, snapshotEqual, readProbes } = require(ANALYZER);

function tile(o) {
  return Object.assign({ type: 'meadow', stock: 3, maxStock: 5, vigor: 100,
    pressure: 0, revealed: true, blockFrom: null, bridged: false,
    needsBridge: false, bridgeFrom: null }, o || {});
}
function probe(gameDay, emap, board, opts) {
  const o = opts || {};
  return { seed: 69899, probeIndex: o.probeIndex || 0, gameDay,
    scholarPos: o.scholarPos || { x: 4, y: 4 }, over: false, villageLost: false,
    haven: { x: 4, y: 4 }, swimmer: false, maxWaveUnlocked: 1,
    map: { board: board || {}, beyond: o.beyond || {} }, emap: emap || {} };
}
function e(ok, directOk, via, legs, path) {
  return { ok, directOk, via: via || null, legs: legs || 0, reason: ok ? null : 'lateral-cap',
    lateralPath: path || [] };
}
let n = 0;

// 1. p0Index: first probe with gameDay >= 5.
{
  const probes = [probe(1, {}), probe(3, {}), probe(5, {}), probe(6, {})];
  assert.strictEqual(p0Index(probes), 2, 'p0Index picks gameDay 5');
  assert.strictEqual(p0Index([probe(1, {}), probe(2, {})]), -1, 'p0Index -1 when no day>=5');
  n++;
}
// 2. primarySet: ok && !directOk only.
{
  const emap = { '6,2': e(true, false, 'lateral', 1, ['6,2', '5,2']),
    '0,0': e(true, true, 'direct', 0, []), '1,1': e(false, false, null, 4, ['1,1']),
    '2,2': e(true, false, 'lateral', 2, ['2,2', '2,3', '3,3']) };
  const prim = primarySet([probe(5, emap)], 0);
  assert.deepStrictEqual(prim, ['2,2', '6,2'], 'primarySet sorts A-LAT tiles');
  n++;
}
// 3. classifyDiff: one change per class, nothing else.
{
  const b0 = { '6,2': tile(), '5,2': tile({ stock: 2 }), '0,1': tile({ revealed: false }),
    '3,3': tile(), '4,4': tile({ type: 'haven' }) };
  const b1 = { '6,2': tile(), '5,2': tile({ stock: 0 }), '0,1': tile({ revealed: true }),
    '3,3': tile({ blockFrom: { dx: 1, dy: 0, type: 'rubble' } }), '4,4': tile({ type: 'haven' }) };
  const pre = probe(5, {}, b0, { beyond: { '9,4': tile({ type: 'meadow' }) } });
  const post = probe(6, {}, b1, { beyond: { '9,4': tile({ type: 'meadow' }), '-1,4': tile({ type: 'grove' }) } });
  post.haven = { x: 4, y: 4 };
  const d = classifyDiff(pre, post);
  assert.deepStrictEqual(Object.keys(d.stock), ['5,2'], 'stock class');
  assert.strictEqual(d.stock['5,2'], 0, 'stock post value');
  assert.deepStrictEqual(Object.keys(d.revealed), ['0,1'], 'revealed class');
  assert.deepStrictEqual(Object.keys(d.terrain), ['3,3'], 'terrain class');
  assert.deepStrictEqual(d.terrain['3,3'].blockFrom, { dx: 1, dy: 0, type: 'rubble' }, 'terrain post blockFrom');
  assert.deepStrictEqual(Object.keys(d.beyond), ['-1,4'], 'beyond class = generated only');
  assert.strictEqual(d.haven, null, 'haven unchanged');
  assert.strictEqual(d.swimmerChanged, false, 'swimmer unchanged');
  n++;
}
// 4. classifyDiff: haven move + swimmer change flagged.
{
  const pre = probe(5, {}, { '4,4': tile({ type: 'haven' }) });
  const post = probe(6, {}, { '4,4': tile({ type: 'haven' }) });
  post.haven = { x: 5, y: 4 }; post.swimmer = true;
  const d = classifyDiff(pre, post);
  assert.deepStrictEqual(d.haven, { x: 5, y: 4 }, 'haven move flagged');
  assert.strictEqual(d.swimmerChanged, true, 'swimmer change flagged');
  n++;
}
// 5. classifyDiff: bridge built + type change counted via terrain.
{
  const pre = probe(5, {}, { '2,2': tile({ type: 'creek', needsBridge: true }) });
  const post = probe(6, {}, { '2,2': tile({ type: 'creek', needsBridge: true, bridged: true }) });
  const d = classifyDiff(pre, post);
  assert.deepStrictEqual(Object.keys(d.terrain), ['2,2'], 'bridge build is a terrain change');
  assert.strictEqual(d.terrain['2,2'].bridged, true, 'bridged post value');
  n++;
}
// 6. snapshotEqual: identical true, any E-input change false.
{
  const a = probe(5, { '6,2': e(true, false, 'lateral', 1, ['6,2']) }, { '6,2': tile() });
  const b = JSON.parse(JSON.stringify(a));
  assert.strictEqual(snapshotEqual(a, b), true, 'identical snapshots equal');
  b.map.board['6,2'].stock = 0;
  assert.strictEqual(snapshotEqual(a, b), false, 'stock change breaks equality');
  const c = JSON.parse(JSON.stringify(a));
  c.emap['6,2'] = e(false, false, null, 4, ['6,2']);
  assert.strictEqual(snapshotEqual(a, c), false, 'emap change breaks equality');
  n++;
}
// 7. --flips mode on fixtures: one primary flip, one secondary,
//    no promotion of the secondary to a flip.
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lateralclose-test-'));
  const b = { '6,2': tile(), '5,2': tile({ stock: 2 }), '0,0': tile() };
  const emap5 = { '6,2': e(true, false, 'lateral', 1, ['6,2', '5,2']),
    '0,0': e(true, true, 'direct', 0, []), '5,2': e(true, true, 'direct', 0, []) };
  const emap6 = { '6,2': e(false, false, null, 4, ['6,2']),
    '0,0': e(true, false, 'lateral', 1, ['0,0', '0,1']), '5,2': e(true, true, 'direct', 0, []) };
  const b6 = { '6,2': tile(), '5,2': tile({ stock: 0 }), '0,0': tile() };
  const lines = [
    JSON.stringify(probe(5, emap5, b, { probeIndex: 4 })),
    JSON.stringify(probe(6, emap6, b6, { probeIndex: 5 })),
  ];
  const f = path.join(tmp, 'probe-69899.jsonl');
  fs.writeFileSync(f, lines.join('\n') + '\n');
  const out = execFileSync('node', [ANALYZER, '--flips', f], { encoding: 'utf8' });
  const flipLines = out.split('\n').filter((l) => l.startsWith('FLIP '));
  assert.strictEqual(flipLines.length, 1, 'exactly one primary flip: ' + out);
  assert(/tile=6,2/.test(flipLines[0]), 'flip is the A-LAT tile: ' + flipLines[0]);
  const secLines = out.split('\n').filter((l) => l.startsWith('SECONDARY '));
  assert.strictEqual(secLines.length, 1, 'one secondary transition: ' + out);
  assert(/tile=0,0/.test(secLines[0]), 'secondary is the direct->lateral tile');
  const summary = out.split('\n').find((l) => l.startsWith('SUMMARY '));
  assert(summary && JSON.parse(summary.slice('SUMMARY '.length)).totalFlips === 1, 'summary counts 1 flip');
  n++;
}
// 8. --check-sense: identical files pass, changed file fails.
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lateralclose-test-'));
  const rec = probe(5, { '6,2': e(true, false, 'lateral', 1, ['6,2']) }, { '6,2': tile() });
  const f1 = path.join(tmp, 'a.jsonl'), f2 = path.join(tmp, 'b.jsonl');
  fs.writeFileSync(f1, JSON.stringify(rec) + '\n');
  fs.writeFileSync(f2, JSON.stringify(rec) + '\n');
  let out = execFileSync('node', [ANALYZER, '--check-sense', f1, f2], { encoding: 'utf8' });
  assert(/SENSE-CHECK PASS/.test(out), 'sense check passes on identical: ' + out);
  const rec2 = JSON.parse(JSON.stringify(rec)); rec2.map.board['6,2'].stock = 0;
  fs.writeFileSync(f2, JSON.stringify(rec2) + '\n');
  out = execFileSync('node', [ANALYZER, '--check-sense', f1, f2], { encoding: 'utf8' });
  assert(/SENSE-CHECK FAIL/.test(out), 'sense check fails on changed: ' + out);
  n++;
}
// 9. Live probeAll structure on one real game load (single
//    harness instance; no repo writes).
{
  (async () => {
    const { loadGame, setupGame } = require('./sim-harness');
    const { probeAll } = require(PROBE);
    const { Game } = await loadGame({ seed: 69899, mode: 'lateralclose-b', fullTelemetry: false });
    await setupGame(Game);
    const emap = probeAll(Game, 4, 4);
    assert.strictEqual(Object.keys(emap).length, 81, 'probeAll covers 81 tiles');
    for (const [k, v] of Object.entries(emap)) {
      assert(!v.error, 'no probe error on ' + k + ': ' + (v.error || ''));
      if (v.via === 'direct') { assert.strictEqual(v.legs, 0, 'direct legs 0 on ' + k); assert.deepStrictEqual(v.lateralPath, [], 'direct path empty on ' + k); }
      if (v.via === 'lateral') { assert(v.legs >= 1, 'lateral legs>=1 on ' + k); assert.strictEqual(v.lateralPath.length, v.legs + 1, 'lateral path length on ' + k); }
      if (v.ok === false) assert.strictEqual(v.via, null, 'pocket has no via on ' + k);
    }
    const havenE = emap['4,4'];
    assert(havenE.ok === true && havenE.directOk === true, 'haven escapes directly');
    n++; // 9. live probeAll
    // 10. Reused-files-unmodified check.
    const protectedPaths = ['src/js', 'scripts/policies', 'scripts/sim-harness.js',
      'scripts/destfirst-b-screen.js', 'scripts/analyze-destfirst-b.js',
      'scripts/destfirst-b-confirm.js', 'scripts/atimescale-b-analyze.js',
      'scripts/test-destfirst-b.js', 'scripts/test-atimescale-b.js'];
    const changed = execSync('git diff HEAD --name-only -- ' + protectedPaths.join(' '), { encoding: 'utf8', cwd: HERE + '/..' }).trim();
    const staged = execSync('git diff --cached --name-only -- ' + protectedPaths.join(' '), { encoding: 'utf8', cwd: HERE + '/..' }).trim();
    assert(!changed && !staged, 'reused files modified: ' + (changed || staged));
    n++;
    console.log('test-lateralclose-b: ' + n + '/' + n + ' checks passed (8 fixture groups + live probeAll + reused-files-unmodified)');
  })().catch((e) => { console.error('LIVE PROBE FAILED', e); process.exit(1); });
}
