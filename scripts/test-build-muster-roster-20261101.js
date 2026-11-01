#!/usr/bin/env node
// test-build-muster-roster-20261101.js — PROOF for build-muster-roster.
// Mechanism under test (Loop A freeface arm, 2026-11-01): linked villages
// that were never visited carry NO roster field — a roster is only
// generated when a village is catch-up-simmed on approach — so trusted
// quota-6 allies send nobody when the muster call goes out.
//   BEFORE (current master): an unvisited linked village answers 0.
//   AFTER (fix): the call is itself the contact (a heard signal the
//     allies answer), so the village answers with REAL PEOPLE generated
//     through the call — quota 6 per trusted village.
// Fixture (no freeface panel re-run; synthetic, deterministic shape):
//   Stonebridge + Thornfield: linked, trusted (trust 80, opinion 20),
//     population 20, NO roster field (never visited).
//   Emberhold: linked, trusted, VISITED (explicit 8-adult roster) — control.
//   Refusals: linked, trust 10 — must still refuse (refusal path untouched).
// Expectations: Stonebridge 6, Thornfield 6, Emberhold 6, Refusals 0,
//   allied total 18, ceiling (allied + up to 3 Haven commits) 21 vs need 10.
//   Before the fix the same fixture yields allied 6, ceiling 9/10.
// Also asserts: responders are named living adults now on the village's
// roster; link count unchanged (link creation untouched); no new link.
// Usage: MUSTER_REPO=<repo> node test-build-muster-roster-20261101.js [seed...]
//   Defaults to seeds 90111 90112 90113. Exit non-zero on any failed assert.
'use strict';
const path = require('path');
const assert = require('assert');
const REPO = process.env.MUSTER_REPO || path.join(__dirname, '..');
const { loadGame, setupGame, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));

function adultRoster(prefix, n) {
  const out = [];
  for (let i = 0; i < n; i++) out.push({ id: prefix + '_p' + i, name: 'Ember ' + i, age: 30, alive: true, health: 100, partner: null, children: [] });
  return out;
}

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  // Fixture: replace the world's villages + links wholesale.
  Game.state.otherVillages = [
    { id: 'v_stone', name: 'Stonebridge', population: 20, opinion: 20, day: 0 },
    { id: 'v_thorn', name: 'Thornfield', population: 20, opinion: 20, day: 0 },
    { id: 'v_ember', name: 'Emberhold', population: 12, opinion: 20, day: 40, roster: adultRoster('v_ember', 8) },
    { id: 'v_refuse', name: 'Refusals', population: 20, opinion: 0, day: 0 },
  ];
  // Sanity: the unvisited pair really carries NO roster field (the bug shape).
  assert.strictEqual('roster' in Game.state.otherVillages[0], false, 'seed ' + seed + ': Stonebridge must start roster-less');
  assert.strictEqual('roster' in Game.state.otherVillages[1], false, 'seed ' + seed + ': Thornfield must start roster-less');
  const m = Game.mshipState();
  m.links = [
    { id: 'link_stone', primary: 'haven', subordinate: 'v_stone', trust: 80, arrears: 0, history: [], status: 'active', theirSpeaker: null },
    { id: 'link_thorn', primary: 'haven', subordinate: 'v_thorn', trust: 80, arrears: 0, history: [], status: 'active', theirSpeaker: null },
    { id: 'link_ember', primary: 'haven', subordinate: 'v_ember', trust: 80, arrears: 0, history: [], status: 'active', theirSpeaker: { id: 'v_ember_p0', name: 'Ember 0' } },
    { id: 'link_refuse', primary: 'haven', subordinate: 'v_refuse', trust: 10, arrears: 0, history: [], status: 'active', theirSpeaker: null },
  ];
  const linksBefore = m.links.length;
  let muster;
  await quietLog(async () => { muster = Game.soundTitanCall('herald'); });
  assert.ok(muster, 'seed ' + seed + ': soundTitanCall must return a muster');
  const per = {};
  (muster.allies || []).forEach(function (a) { per[a.villageId] = (per[a.villageId] || 0) + 1; });
  const allied = (muster.allies || []).length;
  const ceiling = allied + 3; // Haven's own commit cap (titanCommitOwn: up to 3)
  // Responders from the unvisited pair must be real people on a roster now.
  ['v_stone', 'v_thorn'].forEach(function (vid) {
    const ov = Game._otherVillage(vid);
    const mine = (muster.allies || []).filter(function (a) { return a.villageId === vid; });
    mine.forEach(function (a) {
      const person = (ov.roster || []).find(function (r) { return r.id === a.vid; });
      assert.ok(person, 'seed ' + seed + ': ally ' + a.vid + ' must exist on ' + vid + ' roster');
      assert.ok(person.alive && (person.age == null || person.age >= 18), 'seed ' + seed + ': ally ' + a.vid + ' must be a living adult');
      assert.ok(a.name && a.name !== 'a fighter', 'seed ' + seed + ': ally ' + a.vid + ' must be named');
    });
  });
  assert.strictEqual(m.links.length, linksBefore, 'seed ' + seed + ': call must not create links');
  console.log(JSON.stringify({ seed, perVillage: per, allied, ceiling, need: 10, musterReady: ceiling >= 10 }));
  // Judged assertions (the fix's contract).
  assert.strictEqual(per.v_stone || 0, 6, 'seed ' + seed + ': Stonebridge (unvisited, trusted) must answer 6');
  assert.strictEqual(per.v_thorn || 0, 6, 'seed ' + seed + ': Thornfield (unvisited, trusted) must answer 6');
  assert.strictEqual(per.v_ember || 0, 6, 'seed ' + seed + ': Emberhold (visited control) must answer 6');
  assert.strictEqual(per.v_refuse || 0, 0, 'seed ' + seed + ': low-trust village must still refuse');
  assert.strictEqual(allied, 18, 'seed ' + seed + ': allied total must be 18');
  assert.ok(ceiling >= 10, 'seed ' + seed + ': ceiling must reach the 10-blade need');
  return { seed, perVillage: per, allied, ceiling };
}

(async () => {
  const seeds = process.argv.slice(2).map(Number).filter(Boolean);
  const list = seeds.length ? seeds : [90111, 90112, 90113];
  const results = [];
  for (const s of list) results.push(await runSeed(s));
  console.log('ALL test-build-muster-roster PASS: ' + JSON.stringify(results));
})().catch(function (e) { console.error('FAIL test-build-muster-roster: ' + (e && e.stack || e)); process.exit(1); });
