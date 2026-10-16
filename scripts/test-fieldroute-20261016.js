#!/usr/bin/env node
'use strict';
// test-fieldroute-20261016.js — proof for the fieldroute layer
// (sim-fieldroute, 2026-10-16, scale-onramp axis).
//
// PROVES:
//   1. UNIT (synthetic contexts, RED→GREEN): the routing decision on
//      known inputs — cold pass-through, memory divert, 14d decay
//      boundary, pantry gate (village tier, not scholar kcal), haven
//      exception, forced/in-fight pass, live-apex recording, deterministic
//      tie-breaks, no Math.random draws, startCombat engagement counting.
//      RED = the same assertions run with the layer OFF (FIELDROUTE unset)
//      through withFieldRoute: no diversion happens (the test is sensitive
//      to the layer's presence). GREEN = FIELDROUTE=1: diversions happen.
//   2. DET-GATE: FIELDROUTE unset, withFieldRoute(base) vs base —
//      trajectory-identical on identical seeds (4 pairs x 40d, both-repeat:
//      plain-repeat + layered-repeat + plain==layered, ends agree).
//   3. SMOKE: 15d x 2 policies, FIELDROUTE=1 — runs complete, layer live,
//      live-fire: a real injected wave-4 apex is sighted by the perception
//      scan and its tile diverts.
//   4. SUBSTRATE GUARD: the sweep refuses to run without the pre-seat
//      substrate env (mirrors fieldfightsrc's gate).
//
// Node harness rules: full src/js list in index.html order via sim-harness
// (minus DOM-only files); Math.random seeded BEFORE eval; never stub
// Game.save; --cacheDirectory=/tmp/jest-cache-fieldroute for any jest.
const assert = require('assert');
// KILL PROTOCOL (2026-10-16: pilot NO-GO): the layer file is deleted; the
// proof INFO-SKIPs every part instead of crashing on the missing require.
const FR_PATH = (() => { try { return require.resolve('./policies/fieldroute'); } catch (e) { return null; } })();
const FR = FR_PATH ? require(FR_PATH) : null;
function skipIfLayerGone(part) {
  if (!FR) { console.log(`  SKIP ${part} (layer deleted per kill protocol — scripts/policies/fieldroute absent)`); return true; }
  return false;
}
const TF = require('./policies/tribfloor');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

// ---------------------------------------------------------------------
// Synthetic Game stub for the pure-function units.
function stubGame(o) {
  o = o || {};
  const monsters = o.monsters || []; // [{id, x, y}]
  const G = {
    state: { scholar: { day: o.day != null ? o.day : 10 } },
    map: { px: o.px != null ? o.px : 4, py: o.py != null ? o.py : 4 },
    data: { monsters: o.defs || [{ id: 'eater', wave: 4 }, { id: 'audit', wave: 4 }, { id: 'bulldozer', wave: 1 }] },
    tbfight: o.tbfight || null,
    monsterAt(x, y) {
      const m = monsters.find(m => m.x === x && m.y === y);
      return m ? { id: m.id, tx: x, ty: y } : null;
    },
    travelTargets() { return (o.targets || []).map(t => ({ x: t[0], y: t[1], d: t[2] || 1 })); },
    villageFoodTier() { return o.tier || 'secure'; },
    say(msg) { G._said = (G._said || []); G._said.push(msg); },
    travelTo(x, y) { G.map.px = x; G.map.py = y; return { moved: true }; },
    startCombat() { return { ok: true }; },
    pendingMonsterId: null,
    playerAtHaven() { return !!G._atHaven; },
  };
  G._atHaven = !!(o.atHaven);
  return G;
}
function ctxWithMem(entries) {
  const ctx = {};
  ctx._frMem = (entries || []).map(e => ({ x: e[0], y: e[1], day: e[2], wave: e[3] || 4, mid: e[4] || 'eater' }));
  return ctx;
}

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// ---------------------------------------------------------------------
// UNIT: the routing decision on synthetic contexts.
function units() {
  console.log('UNIT: synthetic routing decisions');
  if (skipIfLayerGone('UNIT')) return;
  // 1. cold tile → pass
  {
    const G = stubGame({ targets: [[5, 5, 2], [5, 6, 3]] });
    const r = FR.routeTravel(G, ctxWithMem([]), 5, 5);
    check('cold tile passes through', r.action === 'pass' && r.why === 'cold' && r.to.x === 5 && r.to.y === 5, JSON.stringify(r));
  }
  // 2. fresh memory sighting → divert to nearest non-hot tile
  {
    const G = stubGame({ targets: [[5, 5, 2], [5, 6, 3], [6, 5, 3]] });
    const r = FR.routeTravel(G, ctxWithMem([[5, 5, 10]]), 5, 5);
    check('sighted node diverts', r.action === 'divert' && !(r.to.x === 5 && r.to.y === 5), JSON.stringify(r));
    check('divert keeps the mission (nearest to goal)', r.to.x === 5 && r.to.y === 6, JSON.stringify(r.to));
    check('hot reason carried', r.hot && r.hot.why === 'memory' && r.hot.mid === 'eater', JSON.stringify(r.hot));
  }
  // 3. decay boundary: 14d old = hot, 15d old = cold
  {
    const G = stubGame({ day: 24, targets: [[5, 5, 2], [5, 6, 3]] });
    const r14 = FR.routeTravel(G, ctxWithMem([[5, 5, 10]]), 5, 5); // 24-10=14
    const r15 = FR.routeTravel(G, ctxWithMem([[5, 5, 9]]), 5, 5);  // 24-9=15
    check('14d-old sighting still hot', r14.action === 'divert', JSON.stringify(r14));
    check('15d-old sighting decayed (cold)', r15.action === 'pass' && r15.why === 'cold', JSON.stringify(r15));
  }
  // 4. pantry gate: tight/starving pass (village tier, not scholar kcal)
  {
    const tts = [[5, 5, 2], [5, 6, 3]];
    const rt = FR.routeTravel(stubGame({ tier: 'tight', targets: tts }), ctxWithMem([[5, 5, 10]]), 5, 5);
    const rs = FR.routeTravel(stubGame({ tier: 'starving', targets: tts }), ctxWithMem([[5, 5, 10]]), 5, 5);
    const ra = FR.routeTravel(stubGame({ tier: 'abundant', targets: tts }), ctxWithMem([[5, 5, 10]]), 5, 5);
    check('tight pantry blocks diversion', rt.action === 'pass' && rt.why === 'pantry', JSON.stringify(rt));
    check('starving pantry blocks diversion', rs.action === 'pass' && rs.why === 'pantry', JSON.stringify(rs));
    check('abundant pantry diverts', ra.action === 'divert', JSON.stringify(ra));
  }
  // 5. haven exception: (4,4) never diverted
  {
    const G = stubGame({ px: 4, py: 5, targets: [[4, 4, 1], [3, 4, 2]] });
    const r = FR.routeTravel(G, ctxWithMem([[4, 4, 10]]), 4, 4);
    check('haven destination never diverted', r.action === 'pass' && r.why === 'haven', JSON.stringify(r));
  }
  // 6. forced / in-fight pass
  {
    const G = stubGame({ targets: [[5, 5, 2], [5, 6, 3]] });
    const rf = FR.routeTravel(G, ctxWithMem([[5, 5, 10]]), 5, 5, true);
    const rc = FR.routeTravel(G, ctxWithMem([[5, 5, 10]]), 5, 5, false, true);
    const G2 = stubGame({ tbfight: { over: false }, targets: [[5, 5, 2], [5, 6, 3]] });
    const ri = FR.routeTravel(G2, ctxWithMem([[5, 5, 10]]), 5, 5);
    check('forced crossing passes', rf.action === 'pass' && rf.why === 'forced', JSON.stringify(rf));
    check('combatExit passes', rc.action === 'pass' && rc.why === 'forced', JSON.stringify(rc));
    check('in-fight travel passes', ri.action === 'pass' && ri.why === 'in-fight', JSON.stringify(ri));
  }
  // 7. live apex on the tile: hot + recorded into memory
  {
    const G = stubGame({ monsters: [{ id: 'eater', x: 6, y: 6 }], targets: [[6, 6, 2], [6, 7, 3]] });
    const ctx = ctxWithMem([]);
    const h = FR.hotAt(G, ctx, 6, 6);
    check('live wave-4 apex is hot', !!h && h.why === 'live' && h.wave === 4, JSON.stringify(h));
    check('live sighting recorded to memory', ctx._frMem.some(s => s.x === 6 && s.y === 6 && s.mid === 'eater'));
    // wave-1 on the tile is not apex-hot
    const G1 = stubGame({ monsters: [{ id: 'bulldozer', x: 7, y: 7 }], targets: [[7, 7, 2]] });
    const h1 = FR.hotAt(G1, ctxWithMem([]), 7, 7);
    check('wave-1 monster is not apex-hot', h1 === null, JSON.stringify(h1));
  }
  // 8. determinism: identical state → identical decision; no Math.random draws
  {
    const mk = () => stubGame({ targets: [[5, 5, 2], [5, 6, 3], [6, 5, 3], [4, 5, 3]] });
    const r1 = FR.routeTravel(mk(), ctxWithMem([[5, 5, 10], [6, 5, 8]]), 5, 5);
    const r2 = FR.routeTravel(mk(), ctxWithMem([[5, 5, 10], [6, 5, 8]]), 5, 5);
    check('identical state → identical decision', JSON.stringify(r1) === JSON.stringify(r2));
    const realRandom = Math.random;
    Math.random = () => { throw new Error('RNG draw in routing layer'); };
    let rngOk = true;
    try {
      FR.routeTravel(mk(), ctxWithMem([[5, 5, 10]]), 5, 5);
      FR.recordSightings(mk(), ctxWithMem([]));
      FR.pickDivert(mk(), ctxWithMem([[5, 5, 10]]), 5, 5);
    } catch (e) { rngOk = false; }
    Math.random = realRandom;
    check('no Math.random draws in the layer', rngOk);
  }
  // 9. recordSightings: perception scan records wave-4/5 within d<=3 only
  {
    const G = stubGame({ px: 4, py: 4, monsters: [{ id: 'eater', x: 5, y: 5 }, { id: 'bulldozer', x: 5, y: 4 }, { id: 'audit', x: 8, y: 8 }] });
    const ctx = ctxWithMem([]);
    const n = FR.recordSightings(G, ctx);
    check('scan records nearby apex', n === 1 && ctx._frMem.some(s => s.x === 5 && s.y === 5 && s.mid === 'eater'), `n=${n} mem=${JSON.stringify(ctx._frMem)}`);
    check('scan ignores wave-1', !ctx._frMem.some(s => s.mid === 'bulldozer'));
    check('scan ignores beyond perception (d>3)', !ctx._frMem.some(s => s.x === 8 && s.y === 8));
  }
  // 10. startCombat wrap: counts wave-4/5 scholar engagements, restores cleanly
  {
    const G = stubGame({});
    const ctx = {};
    const origS = G.startCombat, origT = G.travelTo;
    const restore = FR.gateVerbs(G, ctx);
    G.startCombat('eater');
    G.startCombat('bulldozer');
    check('apex engagements counted (wave>=4 only)', ctx.frApexEngagements === 1, `got ${ctx.frApexEngagements}`);
    check('field engagements counted when away from haven', ctx.frApexFieldEngagements === 1, `got ${ctx.frApexFieldEngagements}`);
    G._atHaven = true; // a haven raid's apex: engagement yes, field no
    G.startCombat('audit');
    check('haven apex: engagement counted', ctx.frApexEngagements === 2, `got ${ctx.frApexEngagements}`);
    check('haven apex: not a field engagement', ctx.frApexFieldEngagements === 1, `got ${ctx.frApexFieldEngagements}`);
    restore();
    check('gateVerbs restores startCombat', G.startCombat === origS);
    check('gateVerbs restores travelTo', G.travelTo === origT);
  }
  // 11. no alternative → pass (routing never strands)
  {
    const G = stubGame({ targets: [[5, 5, 2]] }); // only the hot tile reachable
    const ctx = ctxWithMem([[5, 5, 10]]);
    const r = FR.routeTravel(G, ctx, 5, 5);
    check('no alternative → pass (never strand)', r.action === 'pass' && r.why === 'no-alt', JSON.stringify(r));
  }
}

// ---------------------------------------------------------------------
// RED→GREEN: the composition. Same scripted hot scenario through
// withFieldRoute(base).daily — FIELDROUTE unset (RED: no diversion, the
// test's diversion assertion FAILS) vs FIELDROUTE=1 (GREEN: diverted).
function scriptedBase() {
  return {
    id: 'fake-hotwalk',
    daily(Game, ctx) { Game.travelTo(5, 5); }, // the base walks straight onto the hot tile
  };
}
function redGreen() {
  console.log('RED→GREEN: composition sensitivity');
  if (skipIfLayerGone('RED→GREEN')) return;
  const mkGame = () => {
    const G = stubGame({ px: 4, py: 4, targets: [[5, 5, 2], [5, 6, 3]], tier: 'secure' });
    return G;
  };
  // RED: layer off — the base walks onto the hot tile, no diversion.
  delete process.env.FIELDROUTE;
  {
    const G = mkGame();
    const ctx = ctxWithMem([[5, 5, 10]]);
    const p = FR.withFieldRoute(scriptedBase(), 'fake', 'fake');
    p.daily(G, ctx);
    const diverted = !(G.map.px === 5 && G.map.py === 5);
    check('RED: layer off → no diversion (walks onto hot tile)', !diverted && (ctx.frDiverted | 0) === 0,
      `at=(${G.map.px},${G.map.py}) frDiverted=${ctx.frDiverted | 0}`);
  }
  // GREEN: layer on — the same scenario diverts.
  process.env.FIELDROUTE = '1';
  {
    const G = mkGame();
    const ctx = ctxWithMem([[5, 5, 10]]);
    const p = FR.withFieldRoute(scriptedBase(), 'fake', 'fake');
    p.daily(G, ctx);
    const diverted = !(G.map.px === 5 && G.map.py === 5);
    check('GREEN: layer on → diverted around hot tile', diverted && (ctx.frDiverted | 0) === 1,
      `at=(${G.map.px},${G.map.py}) frDiverted=${ctx.frDiverted | 0}`);
    check('GREEN: honest beat said aloud', (G._said || []).length === 1, `said=${JSON.stringify(G._said)}`);
  }
  delete process.env.FIELDROUTE;
}

// ---------------------------------------------------------------------
// DET-GATE: FIELDROUTE unset — withFieldRoute(base) vs base, 4 pairs x 40d,
// both-repeat, trajectory-identical.
async function runHashes(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'fr-det', fullTelemetry: false });
  await setupGame(Game);
  const hashes = [];
  const wrapped = Object.assign({}, policy);
  const base = policy.daily;
  wrapped.daily = (G, ctx) => { hashes.push(Game.state.scholar.day + ':' + dayHash(Game)); return base ? base(G, ctx) : undefined; };
  let r = null;
  await quietLog(async () => { r = await runDays(Game, wrapped, { days, sampleEvery: 1 }); });
  return { h: hashes.join('\n'), endReason: r && r.endReason, days: r && r.days };
}
async function detGate() {
  console.log('DET-GATE: FIELDROUTE unset — layered vs base trajectory-identical');
  if (skipIfLayerGone('DET-GATE')) return;
  delete process.env.FIELDROUTE;
  const pairs = [['leadfeast', 391], ['leadfeast', 402], ['belongfeast', 391], ['belongfeast', 402]];
  const days = 40;
  let green = 0;
  for (const [pid, seed] of pairs) {
    const plain = pid === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
    const layered = pid === 'leadfeast' ? FR.leadfeast : FR.belongfeast;
    const p1 = await runHashes(plain, seed, days);
    const p2 = await runHashes(plain, seed, days);
    const c1 = await runHashes(layered, seed, days);
    const c2 = await runHashes(layered, seed, days);
    const ok = p1.h === p2.h && c1.h === c2.h && p1.h === c1.h && p1.endReason === c1.endReason;
    if (ok) green++;
    console.log(`  ${pid} s${seed}: plain-stable=${p1.h === p2.h} layered-stable=${c1.h === c2.h} ` +
      `layered-identical=${p1.h === c1.h} ends=${p1.endReason}/${c1.endReason} ${ok ? 'PASS' : 'FAIL'}`);
  }
  console.log(`DET-GATE: ${green}/${pairs.length} identical.`);
  if (green < pairs.length) { console.error('DET GATE FAILED.'); process.exit(4); }
}

// ---------------------------------------------------------------------
// SMOKE: 15d x 2 policies, FIELDROUTE=1 — runs complete, layer live,
// live-fire apex sighting + divert on the real engine.
async function smokeGate() {
  console.log('SMOKE: 15d x 2 policies, FIELDROUTE=1');
  if (skipIfLayerGone('SMOKE')) return;
  process.env.FIELDROUTE = '1';
  for (const pid of ['leadfeast', 'belongfeast']) {
    const policy = pid === 'leadfeast' ? FR.leadfeast : FR.belongfeast;
    const { Game } = await loadGame({ seed: 391, mode: 'fr-smoke', fullTelemetry: false });
    await setupGame(Game);
    let runCtx = null;
    const oSetup = policy.setup;
    policy.setup = (G, ctx) => { runCtx = ctx; return oSetup ? oSetup(G, ctx) : undefined; };
    let r = null;
    await quietLog(async () => { r = await runDays(Game, policy, { days: 15, sampleEvery: 30 }); });
    check(`[${pid}] 15d run completes`, !!(r && r.days >= 15), `days=${r && r.days}`);
    check(`[${pid}] layer memory live`, !!(runCtx && Array.isArray(runCtx._frMem)), '');
    // Live-fire: inject a real wave-4 apex next to the scholar, scan, route.
    // Find an empty adjacent tile first (one monster per tile — never stack).
    const px = Game.map.px, py = Game.map.py;
    let tx = -1, ty = -1;
    for (let dd = 1; dd <= 2 && tx < 0; dd++)
      for (let yy = 0; yy < 9 && tx < 0; yy++) for (let xx = 0; xx < 9 && tx < 0; xx++) {
        if (Math.abs(xx - px) + Math.abs(yy - py) !== dd) continue;
        let occ = null;
        try { occ = Game.monsterAt(xx, yy); } catch (e) {}
        if (!occ) { tx = xx; ty = yy; }
      }
    check(`[${pid}] live-fire: empty adjacent tile found`, tx >= 0, `at=(${px},${py})`);
    if (tx >= 0) {
      try { Game.spawnWorldMonster('eater', tx, ty, { mx: 4, my: 4 }); } catch (e) {}
      const before = (runCtx._frMem || []).length;
      const n = FR.recordSightings(Game, runCtx);
      const seen = (runCtx._frMem || []).some(s => s.x === tx && s.y === ty && s.mid === 'eater');
      check(`[${pid}] live-fire: injected apex sighted`, seen, `n=${n} mem=${before}->${(runCtx._frMem || []).length}`);
      const hot = FR.hotAt(Game, runCtx, tx, ty);
      check(`[${pid}] live-fire: injected tile is hot`, !!hot && hot.wave === 4, JSON.stringify(hot && hot.why));
    }
  }
  delete process.env.FIELDROUTE;
  console.log('SMOKE GATE done.');
}

// ---------------------------------------------------------------------
// Substrate guard (mirrors fieldfightsrc): refuse without the pre-seat stack.
function substrateGuard() {
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
    if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 is required (substrate).`); process.exit(2); }
  }
  if (process.env.SEATDRIVE === '1') { console.error('STOP: SEATDRIVE must not be 1 (pre-seat substrate).'); process.exit(2); }
  if (process.env.WAVE5REACH === '1' || process.env.W3DRIVE === '1') { console.error('STOP: sibling levers must be off.'); process.exit(2); }
  if (!TF.layerOn()) { console.error('STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }
}

(async () => {
  const mode = process.env.MODE || 'units';
  if (mode === 'units') { units(); redGreen(); }
  else if (mode === 'det') { substrateGuard(); await detGate(); }
  else if (mode === 'smoke') { substrateGuard(); await smokeGate(); }
  else { console.error('unknown MODE'); process.exit(2); }
  console.log(`\n${pass} pass, ${fail} fail.`);
  if (fail) process.exit(1);
})().catch(e => { console.error('PROOF CRASH:', e); process.exit(2); });
