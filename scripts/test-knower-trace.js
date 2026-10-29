#!/usr/bin/env node
// test-knower-trace.js — knower-trace AUDIT proof (build-map, 2026-10-29).
// Question: does proposeLink/proposeAlliance trace to a SPECIFIC knower,
// or to village-level omniscience? No game code is changed by this script.
// Bars: see evidence/2026-10-29/build-map-knower-arrivals-prereg.md §1.
// Uses the shared sim harness (loadGame + setupGame), never copied eval code.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const SEEDS = [7, 42, 99];
const failures = [];
const skips = [];
const check = (cond, msg) => {
  if (!cond) failures.push(msg);
  else console.log('  ok: ' + msg);
};
const skip = (msg) => { skips.push(msg); console.log('  SKIP: ' + msg); };

function bfsPath(Game, from, isGoal, passable, bounds) {
  const key = (x, y) => x + ',' + y;
  const prev = new Map([[key(from.x, from.y), null]]);
  const q = [from];
  while (q.length) {
    const cur = q.shift();
    if (isGoal(cur)) {
      const path = [cur];
      let k = key(cur.x, cur.y);
      while (prev.get(k)) { path.unshift(prev.get(k)); k = key(path[0].x, path[0].y); }
      return path;
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cur.x + dx, ny = cur.y + dy;
      if (nx < bounds.x0 || nx > bounds.x1 || ny < bounds.y0 || ny > bounds.y1) continue;
      if (prev.has(key(nx, ny))) continue;
      if (!passable(cur, nx, ny)) continue;
      prev.set(key(nx, ny), cur);
      q.push({ x: nx, y: ny });
    }
  }
  return null;
}

// True iff ANY per-villager village-knowledge store exists on the village.
function anyPerVillagerVillageStore(Game) {
  const v = Game.state.village || {};
  for (const k of ['villageKnowledge', 'knownVillages', 'heardVillages', 'villageKnownBy']) {
    if (v[k] !== undefined) return k;
  }
  return null;
}

async function runSeed(seed) {
  console.log(`\n=== seed ${seed} ===`);
  const { Game } = await loadGame({ seed, narration: true });
  const lines = [];
  const realSay = Game.say;
  Game.say = function (...a) { lines.push(a.join(' ')); try { return realSay.apply(this, a); } catch (e) { return null; } };
  const saySince = (n) => lines.slice(n).join(' ');
  await setupGame(Game, 'Columbus, Ohio');

  const ovs = (Game.state.otherVillages || []).filter(v => v && v.id !== 'haven');
  check(ovs.length >= 2, `otherVillages present (${ovs.length})`);
  if (ovs.length < 2) return;
  const [A, B, C] = [ovs[0], ovs[1], ovs[2] || null];

  // K0: initial state — nothing known.
  for (const v of ovs) {
    check(v.generated === false && !v.rumored && !Game.knowsVillage(v),
      `K0 initial: ${v.id} generated=false rumored=falsy knows=false`);
  }

  // K1: gate holds for link/alliance on an unknown village (A, still unknown).
  let m = lines.length;
  const linkRes = Game.proposeLink(A.id, { asSubordinate: true, tributeKcalPerWeek: 4000 });
  check(linkRes === null && /don't know them well enough/.test(saySince(m)),
    `K1 proposeLink unknown -> knowledge refusal (got ${JSON.stringify(linkRes)})`);
  m = lines.length;
  const allyRes = Game.proposeAlliance(A.id);
  check(allyRes === null && /don't know them well enough/.test(saySince(m)),
    `K1 proposeAlliance unknown -> knowledge refusal (got ${JSON.stringify(allyRes)})`);

  // K2: rumor acquisition — drive the REAL roll until it fires for A.
  let fired = false;
  for (let i = 0; i < 2000 && !fired; i++) {
    try { fired = !!Game.maybeVillageRumor(A); } catch (e) { break; }
  }
  check(fired, 'K2 rumor roll fired for A within 2000 calls');
  if (fired) {
    check(A.rumored === true, 'K2 A.rumored=true after rumor');
    check(typeof A.rumorDay === 'number', `K2 A.rumorDay recorded (${A.rumorDay})`);
    const q = (Game.state.scholar.rumors || []).filter(r => r.villageId === A.id);
    check(q.length >= 1, `K2 scholar.rumors entry for A (${q.length})`);
    check(q.length === 0 || !q[0].teller, 'K2 rumor entry names NO teller (anonymous "traveler")');
    // THE LEAK: gate passes, no knower anywhere.
    const store = anyPerVillagerVillageStore(Game);
    check(store === null, 'K2 no per-villager village-knowledge store exists');
    check(Game.knowsVillage.length === 1, `K2 knowsVillage takes no knower arg (length=${Game.knowsVillage.length})`);
    check(Game.knowsVillage(A) === true, 'K2 LEAK: gate passes for the whole village on one anonymous rumor');
  }

  // K3: visit acquisition — walk (real travelTo steps) adjacent to A, then proximity hook.
  const homePassable = (from, nx, ny) => {
    if (Game.monsterAt && Game.monsterAt(nx, ny)) return false;
    try { return !Game.travelBlockage(nx, ny, from.x, from.y); } catch (e) { return false; }
  };
  const genBefore = A.generated;
  const nearA = p => Math.abs(p.x - A.x) + Math.abs(p.y - A.y) <= 2;
  const path = bfsPath(Game, { x: Game.map.px, y: Game.map.py }, nearA, homePassable, { x0: 0, x1: 8, y0: 0, y1: 8 });
  if (!path) {
    skip(`K3 no BFS path to within 2 of ${A.id}`);
  } else {
    let combated = false;
    for (let i = 1; i < path.length; i++) {
      Game.travelTo(path[i].x, path[i].y);
      if (Game.inCombat && Game.inCombat()) { combated = true; break; }
    }
    if (combated) {
      skip('K3 combat engaged on the walk to A');
    } else {
      try { Game.checkVillageProximity(); } catch (e) {}
      check(genBefore === false && A.generated === true,
        `K3 visit flips generated false->true (was ${genBefore}, now ${A.generated})`);
      check(anyPerVillagerVillageStore(Game) === null,
        'K3 LEAK: visit knowledge still has no per-knower record');
    }
  }

  // K4: peer bypass on an UNKNOWN village (B; A is now known, so B must be fresh).
  if (B.generated || B.rumored) {
    skip(`K4 B already known (generated=${B.generated} rumored=${B.rumored})`);
  } else {
    try { Game._nudgeOpinion(B.id, 15, 'proof'); } catch (e) {}
    m = lines.length;
    let peerRes = null, peerErr = null;
    try { peerRes = Game.proposeCovenant(B.id); } catch (e) { peerErr = e.message; }
    const said = saySince(m);
    check(peerErr === null && !/don't know them well enough/.test(said),
      `K4 LEAK: proposeCovenant on unknown village reaches courtship, not knowledge refusal (res=${JSON.stringify(peerRes)} said=${JSON.stringify(said.slice(0, 120))})`);
  }

  // K5: raid ungated by design — on an unknown, unlinked village (C, else B if unlinked).
  let raidTarget = C;
  if (!raidTarget || raidTarget.generated || raidTarget.rumored) raidTarget = null;
  if (raidTarget && Game.linkWith && Game.linkWith(raidTarget.id)) raidTarget = null;
  if (!raidTarget) {
    skip('K5 no unknown unlinked village left for a raid target');
  } else {
    m = lines.length;
    let raidRes = null;
    try { raidRes = Game.raidVillage(raidTarget.id); } catch (e) { raidRes = 'ERR:' + e.message; }
    const pending = !!(Game.state.pendingRaid && Game.state.pendingRaid.target === raidTarget.id);
    const said = saySince(m);
    if (pending) {
      check(true, `K5 CONFIRMED-BY-DESIGN: raidVillage musters on unknown village ${raidTarget.id}`);
    } else if (/don't know them well enough/.test(said)) {
      failures.push(`K5 raid unexpectedly knowledge-gated on ${raidTarget.id}`);
    } else {
      skip(`K5 raid did not muster (${JSON.stringify(raidRes)} said=${JSON.stringify(said.slice(0, 120))}) — muster-gated, not knowledge-gated`);
    }
  }

  // K6: region registry, same class.
  try {
    const regs = Game.state.world && Game.state.world.regions;
    const defs = Game.data.regions || [];
    const fresh = defs.find(r => regs && regs[r.id] && !regs[r.id].known) || null;
    if (!fresh) {
      skip('K6 no unknown region found');
    } else {
      const before = regs[fresh.id];
      const ok = Game.hearOfRegion(fresh.id, 'proof');
      const after = regs[fresh.id];
      check(ok === true && after.known === true, `K6 hearOfRegion sets known for ${fresh.id}`);
      check(after.heardWhy === 'proof' && typeof after.heardDay === 'number',
        `K6 region provenance: why=${after.heardWhy} day=${after.heardDay}`);
      check(after.knower === undefined && after.toldBy === undefined && before.knower === undefined,
        'K6 LEAK: region entry stores NO knower/toldBy');
    }
  } catch (e) {
    failures.push('K6 threw: ' + e.message);
  }
}

(async () => {
  for (const s of SEEDS) await runSeed(s);
  console.log(`\nknower-trace: failures=${failures.length} skips=${skips.length}`);
  if (failures.length) { for (const f of failures) console.log('FAIL: ' + f); process.exit(1); }
  console.log('KNOWER-TRACE AUDIT PROOF: PASS (leaks K2/K3/K4/K6 demonstrated as designed; K1 gate holds; K5 confirmed-by-design)');
  process.exit(0);
})().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(2); });
