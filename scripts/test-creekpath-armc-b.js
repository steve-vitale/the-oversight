#!/usr/bin/env node
// test-creekpath-armc-b.js — proof for creekpath Arm C (standing go-home
// rule) BEFORE any judged after-run. Prereg:
// evidence/2026-10-29/sim-creekpath-armc-b-prereg.md.
// 1. Placement behavior (fresh game, player placed at an away tile):
//    C-gate OFF -> goHomeStanding moves nothing and banks nothing, even
//    with the Arm B gate ON (the before-leg config).
//    C-gate ON (+ Arm B gate ON) -> reaches haven on a clear hop, reaches
//    haven via detour when the probe's BFS route exists, moves nothing
//    when no route exists; fires nothing when already at haven or inside
//    a tent.
// 2. Determinism + gate-off neutrality: the banked C-gate-off before-pilot
//    corpus reproduces the Arm B after-pilot corpus evening probes exactly
//    (probe + tile + map coords per evening per seed).
// Usage: node scripts/test-creekpath-armc-b.js [before-pilot-dir]
// The before-pilot corpus must already exist (it is banked before any
// judged after spend); this script only compares, never traces.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');
const { directHopBlockage, bfsRouteAround } = require('./creekpath-probe-b');
const competent = require('./policies/competent');

let failures = 0;
function check(name, cond, extra) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra !== undefined ? ' :: ' + extra : ''));
  if (!cond) failures++;
}

function havenOf(Game) {
  const v = (Game.state || {}).village || {};
  const hx = (v.px === undefined ? 4 : v.px), hy = (v.py === undefined ? 4 : v.py);
  let type = null;
  try { const t = Game.tileAt(hx, hy); type = t ? (t.type || null) : null; } catch (e) {}
  return { hx, hy, type };
}

async function placementCase(seed, sx, sy, label) {
  const { Game } = await loadGame({ seed, mode: 'creekpath-armc-proof', fullTelemetry: false });
  await setupGame(Game);
  const { hx, hy, type } = havenOf(Game);
  console.log(`${label}: haven=(${hx},${hy}) type=${type}`);
  check(`${label} haven tile is haven on fresh map`, type === 'haven');
  Game.map.px = sx; Game.map.py = sy;
  const probe = directHopBlockage(Game, hx, hy);
  const route = bfsRouteAround(Game, hx, hy);
  console.log(`${label}: from (${sx},${sy}) probe=${JSON.stringify(probe)} route=${route && route.path ? 'len ' + route.length : 'none'}`);
  // C-gate OFF, Arm B gate ON (the before-leg config): no movement, no banking.
  process.env.COMPETENT_TRIPHOME_ROUTE_AROUND = '1';
  delete process.env.COMPETENT_STANDING_HOME;
  Game.map.px = sx; Game.map.py = sy;
  const ctxOff = {};
  const dOff = competent.goHomeStanding(Game, ctxOff);
  check(`${label} C-off goHomeStanding moves nothing`, Game.map.px === sx && Game.map.py === sy, `at (${Game.map.px},${Game.map.py}) ret=${dOff} ctx=${JSON.stringify(ctxOff)}`);
  check(`${label} C-off goHomeStanding banks nothing`, !ctxOff.standingHomeDays && !ctxOff.standingHomeDetours);
  // C-gate ON (+ Arm B gate ON): behavior consistent with the probe.
  process.env.COMPETENT_STANDING_HOME = '1';
  Game.map.px = sx; Game.map.py = sy;
  try { Game.state.scholar.insideTent = false; } catch (e) {}
  const ctxOn = {};
  const dOn = competent.goHomeStanding(Game, ctxOn);
  if (!probe || (route && route.path)) {
    check(`${label} C-on goHomeStanding reaches haven`, Game.map.px === hx && Game.map.py === hy, `at (${Game.map.px},${Game.map.py}) detours=${dOn} ctx=${JSON.stringify(ctxOn)}`);
    check(`${label} C-on goHomeStanding banks a fired day`, ctxOn.standingHomeDays === 1, `ctx=${JSON.stringify(ctxOn)}`);
    if (probe && route && route.path) check(`${label} C-on goHomeStanding actually detoured (>=1 step)`, dOn >= 1, `detours=${dOn}`);
  } else {
    check(`${label} C-on goHomeStanding moves nothing with no route`, Game.map.px === sx && Game.map.py === sy, `detours=${dOn}`);
  }
  // Already at haven: fires nothing.
  Game.map.px = hx; Game.map.py = hy;
  const ctxHome = {};
  competent.goHomeStanding(Game, ctxHome);
  check(`${label} C-on goHomeStanding fires nothing at haven`, !ctxHome.standingHomeDays, `ctx=${JSON.stringify(ctxHome)}`);
  // Inside a tent away: fires nothing.
  Game.map.px = sx; Game.map.py = sy;
  try { Game.state.scholar.insideTent = true; } catch (e) {}
  const ctxTent = {};
  competent.goHomeStanding(Game, ctxTent);
  check(`${label} C-on goHomeStanding fires nothing inside a tent`, Game.map.px === sx && Game.map.py === sy && !ctxTent.standingHomeDays, `at (${Game.map.px},${Game.map.py}) ctx=${JSON.stringify(ctxTent)}`);
  try { Game.state.scholar.insideTent = false; } catch (e) {}
  delete process.env.COMPETENT_STANDING_HOME;
  delete process.env.COMPETENT_TRIPHOME_ROUTE_AROUND;
}

async function main() {
  check('competent exports goHomeStanding (Arm C helper)', typeof competent.goHomeStanding === 'function');
  // 10757 index-adjacent tile (3,3); 10752 strand tile (1,4) per Arm B corpus.
  await placementCase(10757, 3, 3, '10757 (3,3)->haven');
  await placementCase(10752, 1, 4, '10752 (1,4)->haven');
  // Gate-off neutrality: banked before-pilot corpus vs Arm B after-pilot corpus.
  const beforeDir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-29', 'sim-creekpath-armc-b-corpus-before-pilot');
  const armBDir = path.join(__dirname, '..', 'evidence', '2026-10-28', 'sim-creekpath-armb-b-corpus-after-pilot');
  const seq = (rec) => (rec.evenings || []).map((e) => e.probe + '@' + e.mapPx + ',' + e.mapPy + ':' + e.tile).join('|');
  let allMatch = true;
  for (const f of fs.readdirSync(armBDir).filter((x) => x.endsWith('.json')).sort()) {
    const seed = f.match(/s(\d+)\.json/)[1];
    const armB = JSON.parse(fs.readFileSync(path.join(armBDir, f), 'utf8'));
    const mine = path.join(beforeDir, 'creekpath-b-competent-s' + seed + '.json');
    if (!fs.existsSync(mine)) { console.log('FAIL neutrality seed ' + seed + ': before-pilot corpus missing ' + mine); allMatch = false; continue; }
    const fresh = JSON.parse(fs.readFileSync(mine, 'utf8'));
    const ok = seq(fresh) === seq(armB);
    console.log((ok ? 'PASS' : 'FAIL') + ' neutrality seed ' + seed + ' (before-pilot reproduces Arm B after-pilot probes)' +
      ' :: fresh refused=' + fresh.evenings.filter((e) => e.probe === 'refused').length +
      ' armB refused=' + armB.evenings.filter((e) => e.probe === 'refused').length);
    if (!ok) {
      allMatch = false;
      const fe = fresh.evenings, ae = armB.evenings;
      for (let i = 0; i < Math.max(fe.length, ae.length); i++) {
        const a = fe[i] ? fe[i].probe + '@' + fe[i].mapPx + ',' + fe[i].mapPy : '—';
        const b = ae[i] ? ae[i].probe + '@' + ae[i].mapPx + ',' + ae[i].mapPy : '—';
        if (a !== b) console.log('    first diff evening ' + (i + 1) + ': fresh=' + a + ' armB=' + b);
      }
    }
  }
  check('gate-off before-pilot reproduces Arm B after-pilot corpus exactly', allMatch);
  console.log(failures === 0 ? 'PROOF-GREEN' : 'PROOF-RED ' + failures + ' failures');
  process.exit(failures === 0 ? 0 : 1);
}
main().catch((e) => { console.error('FATAL', e && (e.stack || e.message)); process.exit(1); });
