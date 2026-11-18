#!/usr/bin/env node
// test-expedroster-b.js — proof for arm sim-expedroster-b
// (DIAGNOSTIC/TOOLING: the daily st.exped snapshot instrument).
//
// WHAT IT PROVES:
//   1. SNAPSHOT ROUND-TRIP (fake Game): snapshotExpedRoster returns
//      one row per live st.exped entry with the target tile, legs,
//      duration, since-day/part, current node, and alive flag —
//      including node:null when the node read throws and alive:false
//      for a dead villager; [] when agency state is unreadable.
//   2. SNAPSHOT ROUND-TRIP (live staged Game): three villagers put on
//      REAL expeditions (Game.startExpedition, shared target 7,7,
//      duration 20) produce exactly three snapshot rows with tx=7,
//      ty=7, duration=20 and the staged nodes.
//   3. LAUNCH-FILTER FIXTURE: the analyzer's launchesForSeed filters
//      wave-3 hunts and merges same-day dupes (the launch-filter trap
//      — the trace's first run inflated 28 vs 3 by joining wave-3).
//   4. CLASSIFY FIXTURES: together-en-route vs destination-only vs
//      the unknown reasons, incl. the same-node/different-target
//      coincidence guard.
//   5. ANALYZER SELFTEST: scripts/analyze-expedroster-b.js --selftest
//      exits 0 (its own fixture suite).
//   6. DETERMINISM (recorder neutrality): the same seed run for 30
//      days with the recorder ON vs OFF in separate processes yields
//      identical structural fields (days, gameDays, endReason,
//      standing, maxWave, won, deaths) — the recorder (all wraps plus
//      the new daily snapshot) does not perturb the sim. The ON leg
//      must also carry roster rows (smoke: the recorder fires) and
//      zero instrument errors; the OFF leg carries none.
//
// Usage: node scripts/test-expedroster-b.js
// The determinism legs run two 30-day sims as child processes (never
// two harnesses in one node process). No repo writes: the child
// runner is ephemeral under os.tmpdir().
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const assert = require('assert');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const D = require('./expedroster-driver-b.js');
const A = require('./analyze-expedroster-b.js');

let n = 0;
function check(name, fn) { n++; fn(); console.log('ok ' + n + ' - ' + name); }

// --- 1. snapshot round-trip on a fake Game ---
check('snapshot: one row per live exped entry, fields carried', function () {
  const fake = {
    agencyState: function () {
      return { exped: {
        alice: { tx: 7, ty: 7, dist: 6, legs: 2, duration: 20, sinceDay: 48, sincePart: 0 },
        bob: { tx: 1, ty: 1, dist: 2, legs: 5, duration: 8, sinceDay: 50, sincePart: 2 },
      } };
    },
    npcNode: function (vid) { return vid === 'alice' ? { nx: 5, ny: 5 } : { nx: 2, ny: 2 }; },
    getPerson: function () { return { dead: false }; },
  };
  const rows = D.snapshotExpedRoster(fake, 52);
  assert.strictEqual(rows.length, 2);
  const a = rows.find(function (r) { return r.vid === 'alice'; });
  assert.deepStrictEqual(a, { day: 52, vid: 'alice', tx: 7, ty: 7, dist: 6, legs: 2, duration: 20, sinceDay: 48, sincePart: 0, node: { nx: 5, ny: 5 }, alive: true });
  const b = rows.find(function (r) { return r.vid === 'bob'; });
  assert.strictEqual(b.tx, 1);
  assert.strictEqual(b.legs, 5);
});
check('snapshot: node read throwing -> node null, row kept', function () {
  const fake = {
    agencyState: function () { return { exped: { alice: { tx: 7, ty: 7, legs: 0, duration: 20 } } }; },
    npcNode: function () { throw new Error('no node'); },
    getPerson: function () { return null; },
  };
  const rows = D.snapshotExpedRoster(fake, 52);
  assert.strictEqual(rows.length, 1);
  assert.strictEqual(rows[0].node, null);
  assert.strictEqual(rows[0].alive, true);
});
check('snapshot: dead villager -> alive false', function () {
  const fake = {
    agencyState: function () { return { exped: { alice: { tx: 7, ty: 7, legs: 0, duration: 20 } } }; },
    npcNode: function () { return { nx: 5, ny: 5 }; },
    getPerson: function () { return { dead: true }; },
  };
  const rows = D.snapshotExpedRoster(fake, 52);
  assert.strictEqual(rows[0].alive, false);
});
check('snapshot: no agency state -> [] (never a throw)', function () {
  assert.deepStrictEqual(D.snapshotExpedRoster({ agencyState: function () { return null; } }, 52), []);
  assert.deepStrictEqual(D.snapshotExpedRoster({}, 52), []);
});

// --- 3. launch-filter fixture ---
check('launchesForSeed: wave-3 filtered, wave-4 kept, same-day dupes merged', function () {
  const raw = { v4departs: [
    { result: 'launch', vid: 'a', day: 10, target: 'ad_break', targetWave: 3, party: ['b'], partySize: 2, source: 'brain' },
    { result: 'launch', vid: 'c', day: 10, target: 'audit', targetWave: 4, party: ['d'], partySize: 2, source: 'brain' },
    { result: 'launch', vid: 'c', day: 10, target: 'audit', targetWave: 4, party: ['e'], partySize: 4, source: 'winPlan' },
    { result: 'hold', vid: 'c', day: 11, target: 'audit', targetWave: 4, party: [], partySize: 1, source: 'brain' },
  ] };
  const ls = A.launchesForSeed(raw);
  assert.strictEqual(ls.length, 1);
  assert.strictEqual(ls[0].vid, 'c');
  assert.strictEqual(ls[0].partySize, 4);
  assert.deepStrictEqual(ls[0].party.slice().sort(), ['d', 'e']);
});

// --- 4. classify fixtures ---
const launch = { vid: 'h', day: 10, target: 'audit', targetWave: 4, party: ['c1', 'c2'], partySize: 3 };
check('classify: same node + same target -> together-en-route', function () {
  const rows = [
    { day: 10, vid: 'h', tx: 7, ty: 7, node: { nx: 5, ny: 5 } },
    { day: 10, vid: 'c1', tx: 7, ty: 7, node: { nx: 5, ny: 5 } },
    { day: 10, vid: 'c2', tx: 7, ty: 7, node: { nx: 4, ny: 5 } },
  ];
  const c = A.classifyExpedition(launch, rows);
  assert.strictEqual(c.verdict, 'together-en-route');
  assert.strictEqual(c.togetherDays.length, 1);
  assert.strictEqual(c.togetherDays[0].day, 10);
});
check('classify: same target, never same node -> destination-only', function () {
  const rows = [
    { day: 10, vid: 'h', tx: 7, ty: 7, node: { nx: 5, ny: 5 } },
    { day: 10, vid: 'c1', tx: 7, ty: 7, node: { nx: 3, ny: 5 } },
    { day: 11, vid: 'h', tx: 7, ty: 7, node: { nx: 6, ny: 6 } },
    { day: 11, vid: 'c1', tx: 7, ty: 7, node: { nx: 4, ny: 6 } },
  ];
  const c = A.classifyExpedition(launch, rows);
  assert.strictEqual(c.verdict, 'destination-only');
});
check('classify: same node, different target is coincidence, not together', function () {
  const rows = [
    { day: 10, vid: 'h', tx: 7, ty: 7, node: { nx: 5, ny: 5 } },
    { day: 10, vid: 'c1', tx: 1, ty: 1, node: { nx: 5, ny: 5 } },
  ];
  const c = A.classifyExpedition(launch, rows);
  assert.strictEqual(c.verdict, 'unknown-with-reason');
  assert.strictEqual(c.reason, 'no-shared-target');
});
check('classify: gapDays reports holes inside a span', function () {
  assert.deepStrictEqual(A.gapDays([{ day: 10 }, { day: 12 }]), [11]);
  assert.deepStrictEqual(A.gapDays([{ day: 10 }, { day: 11 }, { day: 12 }]), []);
});

// --- 5. analyzer selftest ---
check('analyzer --selftest exits 0', function () {
  execFileSync(process.execPath, [path.join(__dirname, 'analyze-expedroster-b.js'), '--selftest'], { stdio: 'pipe' });
});

// --- 2 + 6. live legs (async) ---
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

function pickThree(Game) {
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(function (id) { return id !== Game.villagerId; });
  const ok = [];
  for (const id of roster) {
    try { if (Game.npcMaxDist && Game.npcMaxDist(id) < 1) continue; } catch (e) {}
    try { if (Game.medicDutyHolder && Game.medicDutyHolder() === id) continue; } catch (e) {}
    try { if ((v.sick || {})[id]) continue; } catch (e) {}
    ok.push(id);
    if (ok.length >= 3) break;
  }
  if (ok.length < 3) { console.log('SKIP need 3+ launchable NPC roster, have ' + ok.length); process.exit(2); }
  return { fighter: ok[0], comp1: ok[1], comp2: ok[2] };
}

(async () => {
  delete process.env.LAUNCHPARTY;
  const loaded = await loadGame({ seed: 424242, mode: 'expedroster', fullTelemetry: false });
  const Game = loaded.Game;
  await setupGame(Game);
  const ids = pickThree(Game);
  const v = Game.state.village || {};
  v.health = v.health || {};
  v.health[ids.fighter] = 200; v.health[ids.comp1] = 100; v.health[ids.comp2] = 100;
  for (const id of [ids.fighter, ids.comp1, ids.comp2]) {
    Game.startExpedition(id, 4, 4, false, { tx: 7, ty: 7, duration: 20 });
  }
  const st = Game.agencyState ? Game.agencyState() : null;
  for (const id of [ids.fighter, ids.comp1, ids.comp2]) {
    const ex = st && st.exped ? st.exped[id] : null;
    if (!ex || ex.tx !== 7 || ex.ty !== 7) {
      console.log('SKIP startExpedition did not stand for ' + id + ' (duty/range/sick?)');
      process.exit(2);
    }
  }
  Game.npcSetNode(ids.fighter, 5, 5);
  Game.npcSetNode(ids.comp1, 0, 0);
  Game.npcSetNode(ids.comp2, 8, 8);
  const day = (Game.state.scholar || {}).day || 0;
  const rows = D.snapshotExpedRoster(Game, day);
  check('live: staged expeditions snapshot to 3 rows, shared target 7,7', function () {
    assert.strictEqual(rows.length, 3);
    for (const r of rows) {
      assert.strictEqual(r.tx, 7);
      assert.strictEqual(r.ty, 7);
      assert.strictEqual(r.duration, 20);
      assert.strictEqual(r.day, day);
      assert.strictEqual(r.alive, true);
    }
    const f = rows.find(function (r) { return r.vid === ids.fighter; });
    assert.deepStrictEqual(f.node, { nx: 5, ny: 5 });
    const c1 = rows.find(function (r) { return r.vid === ids.comp1; });
    assert.deepStrictEqual(c1.node, { nx: 0, ny: 0 });
  });

  // --- 6. determinism: recorder ON vs OFF, separate processes ---
  const runner = path.join(os.tmpdir(), 'expedroster-proof-runner-' + process.pid + '.js');
  fs.writeFileSync(runner, [
    "'use strict';",
    "const D = require(process.argv[2]);",
    "const seed = parseInt(process.argv[3], 10);",
    "D.oneRun(seed).then(function (o) {",
    "  console.log(JSON.stringify({ days: o.days, gameDays: o.gameDays, endReason: o.endReason,",
    "    standing: o.standing, maxWave: o.maxWave, won: o.won, deaths: o.deaths,",
    "    rosterRows: (o.v4expedRoster || []).length, departs: o.v4departs.length,",
    "    encounters: o.v4encounters.length, errors: o.instrumentErrors }));",
    "}).catch(function (e) { console.error(e.stack); process.exit(2); });",
    "",
  ].join('\n'));
  function runLeg(recorder) {
    const env = Object.assign({}, process.env, {
      DAYS: '30', MODE: 'exped', SEEDS: '104201',
      VETREENGAGE: '1', PARTYSIZE4: '1', FLEEREPAIR2: '1',
      EXPEDROSTER_RECORDER: recorder,
    });
    delete env.LAUNCHPARTY;
    delete env.FIGHTALLY2;
    const out = execFileSync(process.execPath,
      [runner, path.join(__dirname, 'expedroster-driver-b.js'), '104201'],
      { env: env, cwd: REPO, encoding: 'utf8', timeout: 600000 });
    return JSON.parse(out.trim().split('\n').pop());
  }
  let onLeg, offLeg;
  try {
    onLeg = runLeg('on');
    offLeg = runLeg('off');
  } finally {
    try { fs.unlinkSync(runner); } catch (e) {}
  }
  check('determinism: recorder ON vs OFF, structural fields identical', function () {
    assert.deepStrictEqual(
      { days: onLeg.days, gameDays: onLeg.gameDays, endReason: onLeg.endReason, standing: onLeg.standing, maxWave: onLeg.maxWave, won: onLeg.won, deaths: onLeg.deaths },
      { days: offLeg.days, gameDays: offLeg.gameDays, endReason: offLeg.endReason, standing: offLeg.standing, maxWave: offLeg.maxWave, won: offLeg.won, deaths: offLeg.deaths });
  });
  check('determinism: ON leg carries roster rows (recorder fires)', function () {
    assert.ok(onLeg.rosterRows > 0, 'expected roster rows, got ' + onLeg.rosterRows);
  });
  check('determinism: OFF leg carries no roster rows', function () {
    assert.strictEqual(offLeg.rosterRows, 0);
  });
  check('determinism: ON leg has zero instrument errors', function () {
    assert.deepStrictEqual(onLeg.errors, []);
  });

  console.log('test-expedroster-b: ' + n + '/' + n + ' green');
})().catch(function (e) { console.error('ERROR ' + (e && e.stack || e)); process.exit(2); });
