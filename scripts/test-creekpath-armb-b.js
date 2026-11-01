#!/usr/bin/env node
// test-creekpath-armb-b.js — proof for creekpath Arm B (route-around-aware
// trip returns) BEFORE any judged after-run. Seeds 10757 + 10767.
// 1. Placement behavior (fresh game, player placed at the strand tile):
//    gate-off walkHome stops dead at the refused hop (old behavior);
//    gate-on walkHome reaches haven via the engine-clean detour when the
//    probe's BFS route exists, and moves nothing when no route exists.
// 2. Current default-gate neutrality: two full independent replays, flag
//    absent versus explicitly disabled, must match every recorded field.
//    The 2255Z corpus is historical after Game/controller changes, not a
//    current trajectory oracle. No old source identity is relabelled.
// 3. 10767 placement: probe the hop from its strand tile (5,3) to haven
//    and assert walkHome behavior consistent with the probe (reaches home
//    iff a BFS route exists). If the fresh-map hop is clear, that is
//    recorded, not forced.
// Usage: node scripts/test-creekpath-armb-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const assert = require('assert/strict');
const os = require('os');
const { loadGame, setupGame } = require('./sim-harness');
const { directHopBlockage, bfsRouteAround } = require('./creekpath-probe-b');
const competent = require('./policies/competent');

let failures = 0;
function check(name, cond, extra) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra !== undefined ? ' :: ' + extra : ''));
  if (!cond) failures++;
}

function placementCase(Game, sx, sy, hx, hy, label) {
  Game.map.px = sx; Game.map.py = sy;
  const probe = directHopBlockage(Game, hx, hy);
  const route = bfsRouteAround(Game, hx, hy);
  console.log(`${label}: probe=${JSON.stringify(probe)} route=${route && route.path ? 'len ' + route.length : 'none'}`);
  // Gate OFF: old behavior — stops dead on a refused hop.
  delete process.env.COMPETENT_TRIPHOME_ROUTE_AROUND;
  Game.map.px = sx; Game.map.py = sy;
  const dOff = competent.walkHome(Game, hx, hy);
  if (probe) {
    check(`${label} gate-off walkHome stops dead at refused hop`, Game.map.px === sx && Game.map.py === sy, `at (${Game.map.px},${Game.map.py}) detours=${dOff}`);
  } else {
    check(`${label} gate-off walkHome reaches home on clear hop`, Game.map.px === hx && Game.map.py === hy);
  }
  // Gate ON: detour when a route exists, nothing when none exists.
  process.env.COMPETENT_TRIPHOME_ROUTE_AROUND = '1';
  Game.map.px = sx; Game.map.py = sy;
  const dOn = competent.walkHome(Game, hx, hy);
  if (probe && route && route.path) {
    check(`${label} gate-on walkHome reaches haven via detour`, Game.map.px === hx && Game.map.py === hy, `detours=${dOn}`);
    check(`${label} gate-on walkHome actually detoured (>=1 route step)`, dOn >= 1, `detours=${dOn}`);
  } else if (probe && !(route && route.path)) {
    check(`${label} gate-on walkHome moves nothing with no route`, Game.map.px === sx && Game.map.py === sy, `detours=${dOn}`);
  } else {
    check(`${label} gate-on walkHome reaches home on clear hop`, Game.map.px === hx && Game.map.py === hy);
  }
  delete process.env.COMPETENT_TRIPHOME_ROUTE_AROUND;
}

async function main() {
  if (process.argv[2] === 'placement') {
    const seed = Number(process.argv[3]);
    assert([10757, 10767].includes(seed));
    const { Game } = await loadGame({ seed, mode: 'creekpath-armb-proof', fullTelemetry: false });
    await setupGame(Game);
    const sx = seed === 10757 ? 3 : 5;
    placementCase(Game, sx, 3, 4, 4, seed + ' (' + sx + ',3)->haven');
    process.exitCode = failures ? 1 : 0;
    return;
  }
  check('competent exports walkHome (Arm B helper)', typeof competent.walkHome === 'function');
  const root = path.join(__dirname, '..');
  function child(args, env) {
    const r = spawnSync(process.execPath, [...process.execArgv, ...args], {
      cwd: root, env, encoding: 'utf8', timeout: 300000, maxBuffer: 8 * 1024 * 1024,
    });
    if (r.stdout) process.stdout.write(r.stdout);
    if (r.stderr) process.stderr.write(r.stderr);
    assert.equal(r.status, 0, 'child failed: ' + args.join(' ') + ' ' + (r.error?.message || ''));
  }
  // One harness per process, including both prepared placement cases.
  for (const seed of [10757, 10767]) child([__filename, 'placement', String(seed)], process.env);
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'oversight-creekpath-armb-'));
  const resolved = fs.realpathSync(scratch), tempRoot = fs.realpathSync(os.tmpdir());
  assert.equal(path.dirname(resolved), tempRoot);
  assert(path.basename(resolved).startsWith('oversight-creekpath-armb-'));
  try {
    const rows = [];
    for (const mode of ['absent', 'disabled']) {
      const env = { ...process.env, COMPETENT_FEAST: '0', SEATDRIVE: '0', PLENTYDEPRI: '0',
        DEPOSITGATE: '1', GRANT_THIEF: '1', POLICY: 'competent', SEEDS: '10757', DAYS: '30',
        OUTDIR: path.join(scratch, mode) };
      delete env.COMPETENT_ROUTE_AROUND;
      if (mode === 'absent') delete env.COMPETENT_TRIPHOME_ROUTE_AROUND;
      else env.COMPETENT_TRIPHOME_ROUTE_AROUND = '0';
      child(['scripts/creekpath-trace-b.js'], env);
      rows.push(JSON.parse(fs.readFileSync(path.join(env.OUTDIR, 'creekpath-b-competent-s10757.json'), 'utf8')));
    }
    assert.deepEqual(rows[0], rows[1], 'default and explicitly disabled gate changed the complete current replay');
    check('current absent/disabled gate replays match every recorded field', true);
  } finally {
    // Only the verified, newly created direct child of the system temp root.
    assert.equal(fs.realpathSync(scratch), resolved);
    fs.rmSync(resolved, { recursive: true });
  }
  console.log(failures === 0 ? 'PROOF-GREEN' : 'PROOF-RED ' + failures + ' failures');
  process.exitCode = failures ? 1 : 0;
}
main().catch(e => { console.error('FATAL', e.stack || e.message); process.exitCode = 1; });
