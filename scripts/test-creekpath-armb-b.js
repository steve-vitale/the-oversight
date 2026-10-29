#!/usr/bin/env node
// test-creekpath-armb-b.js — proof for creekpath Arm B (route-around-aware
// trip returns) BEFORE any judged after-run. Seeds 10757 + 10767.
// 1. Placement behavior (fresh game, player placed at the strand tile):
//    gate-off walkHome stops dead at the refused hop (old behavior);
//    gate-on walkHome reaches haven via the engine-clean detour when the
//    probe's BFS route exists, and moves nothing when no route exists.
// 2. Determinism + gate-off neutrality: a gate-off trace of 10757
//    reproduces the 2255Z before-corpus evening probes exactly (spawned
//    as a child process into a scratch dir that this script deletes).
// 3. 10767 placement: probe the hop from its strand tile (5,3) to haven
//    and assert walkHome behavior consistent with the probe (reaches home
//    iff a BFS route exists). If the fresh-map hop is clear, that is
//    recorded, not forced.
// Usage: node scripts/test-creekpath-armb-b.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
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
  check('competent exports walkHome (Arm B helper)', typeof competent.walkHome === 'function');
  // Seed 10757 index case: (3,3) -> haven (4,4), creek at (3,4).
  {
    const { Game } = await loadGame({ seed: 10757, mode: 'creekpath-armb-proof', fullTelemetry: false });
    await setupGame(Game);
    placementCase(Game, 3, 3, 4, 4, '10757 (3,3)->haven');
  }
  // Seed 10767 strand tile (5,3) -> haven (4,4), per 2255Z evidence.
  {
    const { Game } = await loadGame({ seed: 10767, mode: 'creekpath-armb-proof', fullTelemetry: false });
    await setupGame(Game);
    placementCase(Game, 5, 3, 4, 4, '10767 (5,3)->haven');
  }
  // Determinism + gate-off neutrality: spawned gate-off trace of 10757
  // must reproduce the 2255Z before-corpus evening probes exactly.
  const scratch = path.join(__dirname, '..', '.creekpath-armb-proof');
  try {
    const env = Object.assign({}, process.env, {
      COMPETENT_FEAST: '0', SEATDRIVE: '0', PLENTYDEPRI: '0', DEPOSITGATE: '1',
      GRANT_THIEF: '1', POLICY: 'competent', SEEDS: '10757', DAYS: '30',
      OUTDIR: scratch,
    });
    delete env.COMPETENT_TRIPHOME_ROUTE_AROUND;
    delete env.COMPETENT_ROUTE_AROUND;
    execSync('node scripts/creekpath-trace-b.js', { cwd: path.join(__dirname, '..'), env, stdio: 'pipe', timeout: 300000 });
    const fresh = JSON.parse(fs.readFileSync(path.join(scratch, 'creekpath-b-competent-s10757.json'), 'utf8'));
    const old = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'evidence', '2026-10-28', 'sim-creekpath-b-corpus-competent-thief', 'creekpath-b-competent-s10757.json'), 'utf8'));
    const probeSeq = (rec) => (rec.evenings || []).map((e) => e.probe + '@' + e.mapPx + ',' + e.mapPy).join('|');
    check('gate-off trace reproduces 2255Z before-corpus evening probes (10757)', probeSeq(fresh) === probeSeq(old),
      'fresh refused=' + fresh.evenings.filter((e) => e.probe === 'refused').length + ' old refused=' + old.evenings.filter((e) => e.probe === 'refused').length);
  } finally {
    try { fs.rmSync(scratch, { recursive: true, force: true }); } catch (e) {}
  }
  console.log(failures === 0 ? 'PROOF-GREEN' : 'PROOF-RED ' + failures + ' failures');
  process.exit(failures === 0 ? 0 : 1);
}
main().catch((e) => { console.error('FATAL', e && (e.stack || e.message)); process.exit(1); });
