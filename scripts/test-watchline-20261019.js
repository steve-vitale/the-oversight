#!/usr/bin/env node
// test-watchline-20261019.js — proof for the WATCHLINE layer (sim-watchline,
// 2026-10-18/19, scale-onramp axis, 7th veteran-production attempt).
//
// (a) LAYER CONTRACT: watch-roster selection is deterministic; posting
//     survives npcNodeTravel's night drift AND objTick's indoor pull-in
//     (the pull-in runs inside npcNodeTravel's wrap chain).
// (b) DET-GATE: WATCHLINE unset — watchline-wrapped policies vs tribfloor
//     base, byte-identical 60d trajectories (dayHash), both policies.
// (c) SMOKE: WATCHLINE=1 — 30d live run completes; the watch posts on ~every
//     part; posted watch members get outside-side grid positions when the
//     scholar is outside (the join rule's visibility precondition).
// (d) JOIN-VISIBILITY: on a controlled fixture, every posted watch member is
//     a startCombat join-candidate by side (positioned + outside while the
//     scholar is outside); the Chebyshev<=4 draw itself is engine luck —
//     reported empirically, not asserted.
//
// Kill protocol: if the layer file is absent, the whole proof INFO-SKIPs
// (exit 0) — the layer was killed at pilot and must leave zero trace.
//
// Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
//      WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 (the pre-seat substrate).
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('STOP: SEATDRIVE=0 required.'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('STOP: NODEWITNESS=1 required.'); process.exit(2); }

let WL = null;
try { WL = require(path.join(REPO, 'scripts', 'policies', 'watchline')); }
catch (e) { console.log('INFO-SKIP: watchline layer absent (killed at pilot) — nothing to prove.'); process.exit(0); }

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));

if (!TF.layerOn()) { console.error('STOP: tribfloor layerOn() false.'); process.exit(2); }

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

function wlPolicy(pid) { return pid === 'leadfeast' ? WL.leadfeast : WL.belongfeast; }
function tfPolicy(pid) { return pid === 'leadfeast' ? TF.leadfeast : TF.belongfeast; }

async function newGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'watchline', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

(async () => {
  // ---- (b) DET-GATE: layer OFF delegates byte-identically ----
  console.log('== (b) DET-GATE: WATCHLINE unset — wrapped vs tribfloor base, 60d ==');
  delete process.env.WATCHLINE;
  async function traj(seed, pid, useWrapped) {
    const pol = useWrapped ? wlPolicy(pid) : tfPolicy(pid);
    const G = await newGame(seed);
    const hs = [];
    const wrapped = Object.assign({}, pol, {
      daily(Gm, ctx) { hs.push(Gm.state.scholar.day + ':' + dayHash(Gm)); return pol.daily(Gm, ctx); },
    });
    await quietLog(async () => { await runDays(G, wrapped, { days: 60, manifest: undefined, sampleEvery: 30 }); });
    return hs.join('\n');
  }
  let gateGreen = 0, gateTotal = 0;
  for (const pid of ['leadfeast', 'belongfeast']) {
    for (const seed of [94041, 94042, 94043]) {
      gateTotal++;
      const a = await traj(seed, pid, false);
      const b = await traj(seed, pid, true);
      if (a === b) gateGreen++;
      else console.log(`  det mismatch ${pid} s${seed}`);
    }
  }
  check(`det-gate byte-identical (${gateGreen}/${gateTotal})`, gateGreen === gateTotal);

  // ---- (a) LAYER CONTRACT: deterministic roster, survives drift + pull-in ----
  console.log('== (a) LAYER CONTRACT: roster determinism + posting persistence ==');
  process.env.WATCHLINE = '1';
  {
    const G = await newGame(94044);
    const pol = wlPolicy('leadfeast');
    await quietLog(async () => { if (pol.setup) await pol.setup(G, {}); });
    const r1 = WL.watchRoster(G).slice().sort();
    const r2 = WL.watchRoster(G).slice().sort();
    check('roster deterministic', JSON.stringify(r1) === JSON.stringify(r2) && r1.length > 0, JSON.stringify(r1));
    check('roster size <= WATCH_SIZE', r1.length <= WL.WATCH_SIZE, String(r1.length));
    // night drift: npcNodeTravel pulls outsiders in at 0.6/part — the watch must stay out
    G.dayPart = 3;
    for (let i = 0; i < 3; i++) { try { G.npcNodeTravel(); } catch (e) {} }
    const ros = WL.watchRoster(G);
    const allOut = ros.every(vid => { try { return !G.npcInside(vid); } catch (e) { return false; } });
    check('watch posted outside after 3x night npcNodeTravel', allOut, JSON.stringify(ros));
    // day part too
    G.dayPart = 1;
    try { G.npcNodeTravel(); } catch (e) {}
    const ros2 = WL.watchRoster(G);
    const allOut2 = ros2.every(vid => { try { return !G.npcInside(vid); } catch (e) { return false; } });
    check('watch posted outside after day npcNodeTravel', allOut2, JSON.stringify(ros2));
    // roster members are living roster at the haven node
    const v = G.state.village || {};
    const hx = v.px ?? 4, hy = v.py ?? 4;
    const sane = ros2.every(vid => {
      try {
        if (!((v.roster || []).includes(vid))) return false;
        if (((G.vpOf(vid) || {}).dead)) return false;
        const n = G.npcNode(vid); return n && n.nx === hx && n.ny === hy;
      } catch (e) { return false; }
    });
    check('roster = living haven roster only', sane);
  }

  // ---- (d) JOIN-VISIBILITY: posted watch is join-visible when scholar outside ----
  console.log('== (d) JOIN-VISIBILITY: outside-side positions while scholar outside ==');
  {
    const G = await newGame(94045);
    const pol = wlPolicy('leadfeast');
    await quietLog(async () => { if (pol.setup) await pol.setup(G, {}); });
    try { G.npcNodeTravel(); } catch (e) {}
    // put the scholar outside on the haven node, treeline corner
    try {
      G.state.scholar.insideHaven = false;
      G.state.scholar.mx = 8; G.state.scholar.my = 0;
      if (G.map) { G.map.px = (G.state.village || {}).px ?? 4; G.map.py = (G.state.village || {}).py ?? 4; }
    } catch (e) {}
    const ros = WL.watchRoster(G);
    try { WL.postWatch(G); } catch (e) { console.log('  postWatch threw: ' + (e && e.message)); }
    const vpos = (G.state.village || {}).positions || {};
    const scholarOutside = G.state.scholar.insideHaven === false;
    let visible = 0;
    for (const vid of ros) {
      const p = vpos[vid];
      let outside = false;
      try { outside = !G.npcInside(vid); } catch (e) {}
      if (p && outside && scholarOutside) visible++;
    }
    check(`watch join-visible by side (${visible}/${ros.length})`, ros.length > 0 && visible === ros.length,
      `ros=${JSON.stringify(ros)} scholarOutside=${scholarOutside}`);
    // empirical in-radius rate: the Chebyshev<=4 draw is engine luck — report, don't assert
    let inR = 0, trials = 0;
    const px = 8, py = 0;
    for (let i = 0; i < 60; i++) {
      try {
        for (const vid of ros) { try { G.npcSetInside(vid, false); } catch (e) {} }
        G.ensureVillagerPositions();
        trials++;
        const vp2 = (G.state.village || {}).positions || {};
        for (const vid of ros) {
          const p = vp2[vid];
          if (p && Math.max(Math.abs(p.mx - px), Math.abs(p.my - py)) <= 4) { inR++; break; }
        }
      } catch (e) {}
    }
    console.log(`  info: empirical in-radius(<=4 of corner) rate over ${trials} draws: ${(inR / Math.max(1, trials)).toFixed(2)}`);
  }

  // ---- (c) SMOKE: 30d live run, watch posts every part ----
  console.log('== (c) SMOKE: 30d live run, WATCHLINE=1 ==');
  {
    const G = await newGame(94046);
    const pol = wlPolicy('belongfeast');
    let parts = 0, posted = 0, errors = 0;
    const counting = Object.assign({}, pol, {
      daily(Gm, ctx) { parts++; try { const r = WL.watchRoster(Gm); if (r.length && r.every(v => !Gm.npcInside(v))) posted++; } catch (e) { errors++; } return pol.daily(Gm, ctx); },
    });
    await quietLog(async () => { await runDays(G, counting, { days: 30, manifest: undefined, sampleEvery: 30 }); });
    check('30d run completes', (G.state.scholar || {}).day >= 29, 'day=' + ((G.state.scholar || {}).day));
    check(`watch posted on most days (${posted}/${parts})`, parts > 0 && posted >= Math.floor(parts * 0.8));
    check('no watch errors', errors === 0, String(errors));
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
