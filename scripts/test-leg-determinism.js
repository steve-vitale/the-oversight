#!/usr/bin/env node
// test-leg-determinism.js — proof for fixall-map slice 1b (design §D):
// a nomad leg is a PLACE, not a fresh random board. enterLeg() generates
// from a region seed (run seed + region id), so two entries to the same
// region in the same run produce the same ground.
// Bars (pre-registered evidence/2026-10-28/sim-fixall-map-prereg.md §1b):
//   1. two entries to the same region -> identical leg board signatures
//   2. different regions -> different leg seeds (sanity: not a constant)
//   3. BEFORE: two seedless genMap() boards differ (the old teleport)
//   4. road rules untouched: verified by diff, not re-tested here — but
//      the proof asserts enterLeg still sets state.region and leg status.
// HARNESS POSITIONING (documented, not a gameplay claim): the proof drives
// enterLeg directly with a hand-built road state (active, pending legs),
// because start() requires global rank + known kin — a full-road setup
// that would test the gate, not the generator. The second entry appends a
// fresh pending leg object because addLeg() dedupes one leg per region;
// the generator, not the itinerary dedupe, is what's under test.
// Uses the shared sim harness (loadGame + setupGame), never copied eval code.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const SEEDS = [7, 42, 99];
const failures = [];
const check = (cond, msg) => {
  if (!cond) failures.push(msg);
  else console.log('  ok: ' + msg);
};

function boardSig(Game) {
  const rows = [];
  for (let y = 0; y < 9; y++) {
    const row = [];
    for (let x = 0; x < 9; x++) {
      const t = Game.map.tiles[y][x];
      const w = t.wildlife ? Object.keys(t.wildlife).sort().join('+') : '';
      row.push(`${t.type}${t.blockFrom ? ':' + t.blockFrom.type : ''}${t.needsBridge ? ':B' : ''}:${t.stock}/${t.maxStock}:${w}`);
    }
    rows.push(row.join('|'));
  }
  return rows.join('\n');
}

async function runSeed(seed) {
  console.log(`\n=== seed ${seed} ===`);
  const { Game } = await loadGame({ seed, narration: false });
  await setupGame(Game, 'Columbus, Ohio');
  const regions = (Game.data && Game.data.regions || []).map(r => r.id).filter(Boolean);
  check(regions.length >= 2, `at least 2 region ids available (got ${regions.length})`);
  if (regions.length < 2) return;
  const [r1, r2] = regions;
  check(typeof Game.nomad === 'object' && typeof Game.nomad.enterLeg === 'function', 'Game.nomad.enterLeg exists');
  check(typeof Game.nomad.legSeedForRegion === 'function', 'Game.nomad.legSeedForRegion exists');
  if (typeof Game.nomad.legSeedForRegion !== 'function') return;

  // BAR 2 (sanity): the seed actually depends on the region.
  const s1 = Game.nomad.legSeedForRegion(r1), s2 = Game.nomad.legSeedForRegion(r2);
  check(s1 !== s2, `leg seeds differ by region (${s1} vs ${s2})`);
  check(Number.isInteger(s1) && s1 > 0, `leg seed is a positive int (${s1})`);

  // BAR 3 (BEFORE): the old seedless path is a fresh roll per entry.
  Game.genMap();
  const beforeA = boardSig(Game);
  Game.genMap();
  const beforeB = boardSig(Game);
  check(beforeA !== beforeB, 'BEFORE: two seedless genMap() boards differ (the old teleport)');

  // BAR 1 (AFTER): two enterLeg() entries to the same region, same ground.
  Game.state.road = { active: true, legs: [{ regionId: r1, status: 'pending' }], legIndex: -1, log: [], daysOnRoad: 0 };
  const ok1 = Game.nomad.enterLeg(0);
  check(!!ok1, 'first enterLeg succeeds');
  check(Game.state.region === r1, `enterLeg sets state.region to ${r1}`);
  check(Game.state.road.legs[0].status === 'active', 'first leg is active after entry');
  const sig1 = boardSig(Game);
  Game.nomad.departLeg();
  check(Game.state.road.legs[0].status === 'done', 'departLeg marks the leg done');
  Game.state.road.legs.push({ regionId: r1, status: 'pending' });
  const ok2 = Game.nomad.enterLeg(1);
  check(!!ok2, 'second enterLeg (same region) succeeds');
  const sig2 = boardSig(Game);
  check(sig1 === sig2, 'AFTER: two entries to the same region produce identical leg boards');
  if (sig1 !== sig2) {
    const a = sig1.split('\n'), b = sig2.split('\n');
    for (let i = 0; i < 9; i++) if (a[i] !== b[i]) console.log(`  diff row ${i}:\n    A: ${a[i]}\n    B: ${b[i]}`);
  }
  // Generator-level determinism: the same leg seed regenerates the board.
  Game.genMap(Game.nomad.legSeedForRegion(r1));
  const sig3 = boardSig(Game);
  check(sig3 === sig1, 'genMap(legSeed) regenerates the same leg board directly');
}

async function main() {
  for (const seed of SEEDS) {
    try { await runSeed(seed); } catch (e) { failures.push(`seed ${seed} threw: ${e && e.stack ? e.stack.split('\n').slice(0, 5).join(' | ') : e}`); }
  }
  console.log(`\n${failures.length ? 'FAIL' : 'PASS'}: ${failures.length} failure(s)`);
  for (const f of failures) console.log('  FAIL: ' + f);
  process.exit(failures.length ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
