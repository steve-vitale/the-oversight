// test-senseexped-b.js — proof test + staged harness probe, arm
// sim-senseexped-b (finding #2583).
//
// The probe (step 1 of the brief): executes the REAL villagerFightAllies
// against a STAGED live expedition — exped records in the exact shape
// startExpedition writes ({tx, ty, sinceDay, sincePart, ...}) plus a
// DECAYED plan.party (the d112/d69/d82 shapes from the two DIAG arms:
// re-launch overwrite, companion's expedition ended, death purge) —
// and shows the old code fails the fixture (returns the adjacent
// strangers, not the party that set out together) while the new code
// passes it (returns the trio from the expedition itself). No
// hand-built sense: the function under test is the shipped one in
// src/js/party-wiring.js. Membership needs no plan at all (§2).
//
// Fixture (encounter-gear rule, Steve 2026-11-13): the staged villagers
// are a geared wave-4 hunting party as the launch leaves them — holder
// + three launch companions, armed and armored, on one shared target —
// not a fresh un-geared solo fighter. The sense itself reads no gear;
// the pilot's driver stages the geared fight through the competent
// policy (see the prereg).
//
// Usage: node scripts/test-senseexped-b.js
//   RUN_DETERMINISM=1 node scripts/test-senseexped-b.js  (also runs §8:
//   driver determinism — pilot seed, 60d, twice; slow, run after the
//   pilot legs so it does not contend for CPU)
// Exit 0 = all checks pass (post-fix behavior). On pre-fix code §1
// fails: the sense returns [s1, s2], the adjacent strangers — that
// failure IS the reproduction of finding #2583.
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');

let passed = 0, failed = 0, skipped = 0;
function check(name, cond, extra) {
  if (cond) { passed++; }
  else { failed++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// ---- load party-wiring onto a bare Game object (same pattern as
// test-launchparty-sense-a.js: fake ctx, real module) ----
globalThis.Scattering = globalThis.Scattering || {};
globalThis.Scattering.Game = globalThis.Scattering.Game || {};
require(path.join(REPO, 'src', 'js', 'party-wiring.js'));
const Game = globalThis.Scattering.Game;

const wiringSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'party-wiring.js'), 'utf8');

// ---- fixture: a launched party + two adjacent strangers ----
// h1 holder, c1/c2/c3 launch companions (far nodes, same expedition
// target), s1/s2 strangers (adjacent nodes, high trust, no expedition).
// Trust: c1 40, c2 30, c3 35, s1 50, s2 45 — strangers out-trust the
// companions, so any trust-ordered sense without the launch preference
// picks them. The plan party is DECAYED by default (['c1'] only — the
// d112 re-launch overwrite: the fighter re-launched as a pair, so the
// plan no longer names c2/c3 even though they are still out with him).
function exp(tx, ty, sinceDay, sincePart) {
  return { tx: tx, ty: ty, dist: 4, legs: 1, sinceDay: sinceDay, sincePart: (sincePart == null ? 0 : sincePart), duration: 12, finds: [], encounters: [] };
}
function makeCtx(opts) {
  const o = opts || {};
  const nodes = o.nodes || { h1: [5, 5], c1: [1, 1], c2: [8, 8], c3: [1, 8], s1: [5, 6], s2: [6, 5] };
  const people = {};
  ['h1', 'c1', 'c2', 'c3', 's1', 's2'].forEach(function (vid) {
    people[vid] = { id: vid, name: vid, dead: !!(o.dead || {})[vid],
      node: nodes[vid] ? [nodes[vid][0], nodes[vid][1]] : null };
  });
  const exped = o.exped || {
    h1: exp(3, 3, 60), c1: exp(3, 3, 60), c2: exp(3, 3, 60), c3: exp(3, 3, 60),
  };
  const ctx = {
    villagerId: 'scholar1',
    _outdoorCrew: o.crew || [],
    state: {
      scholar: { day: 60 },
      village: {
        roster: ['h1', 'c1', 'c2', 'c3', 's1', 's2'],
        trust: o.trust || { c1: 40, c2: 30, c3: 35, s1: 50, s2: 45 },
        assignments: o.assignments || {},
        winPlan: (o.winPlan === undefined) ? { h1: { stage: 'hunt', target: 'audit', needWave: 4, party: ['c1'] } } : o.winPlan,
      },
    },
    vpOf: function (vid) { return people[vid] || null; },
    npcNode: function (vid) { const p = people[vid]; return p && p.node ? { nx: p.node[0], ny: p.node[1] } : null; },
    agencyState: function () { return { exped: exped }; },
  };
  ctx._exped = exped;
  return ctx;
}
function sense(ctx, vid) {
  return Game.villagerFightAllies.call(ctx, vid) || [];
}
function withFlag(fn) {
  process.env.SENSEEXPED = '1';
  try { return fn(); } finally { delete process.env.SENSEEXPED; }
}

// ---- §0 static: the launch branch is SENSEEXPED-gated and reads the
// ---- expedition, not the plan party ----
(function section0() {
  check('§0 party-wiring reads the SENSEEXPED env gate', /SENSEEXPED/.test(wiringSrc) && /process\.env/.test(wiringSrc));
  check('§0 launch branch iterates agencyState().exped entries', /for \(var rid2 in exped\)/.test(wiringSrc) && /agencyState/.test(wiringSrc));
  check('§0 launch branch orders by expedition start (sinceDay)', /sinceDay/.test(wiringSrc));
  check('§0 no plan.party variable feeds the launch list', !/\bplan0\b/.test(wiringSrc));
})();

// ---- §1 THE PROBE: staged live expedition, plan party decayed ----
// Pre-fix this FAILS (sense returns [s1, s2], the adjacent strangers —
// finding #2583 reproduced). Post-fix it passes ([c1, c2] from the
// expedition, even though the plan names only c1).
(function section1() {
  const got = withFlag(function () { return sense(makeCtx({}), 'h1'); });
  check('§1 probe: decayed plan, expedition trio sensed ([c1, c2])',
    eq(got, ['c1', 'c2']), JSON.stringify(got));
  delete process.env.SENSEEXPED;
  const old = sense(makeCtx({}), 'h1');
  check('§1 old code fails the fixture (returns the strangers [s1, s2])',
    eq(old, ['s1', 's2']), JSON.stringify(old));
})();

// ---- §2 membership needs no plan at all ----
// winPlan is empty — the plan-sourced branch could not even run —
// but the expedition is live, so the sense still returns the trio.
(function section2() {
  const got = withFlag(function () { return sense(makeCtx({ winPlan: {} }), 'h1'); });
  check('§2 no plan at all: expedition trio still sensed ([c1, c2])',
    eq(got, ['c1', 'c2']), JSON.stringify(got));
})();

// ---- §3 companion-as-fighter (the E3 shape: a companion meets the beast) ----
// The fighter's expedition companions are the holder + the other
// companions. All four set out the same day and part, so the
// start-order tiebreak is rid order (c2 < c3 < h1) and the sense
// returns the first two — any two of the expedition are the party.
(function section3() {
  const got = withFlag(function () {
    return sense(makeCtx({ nodes: { h1: [1, 1], c1: [5, 5], c2: [8, 8], c3: [1, 8], s1: [5, 6], s2: [6, 5] } }), 'c1');
  });
  check('§3 companion fighter senses the rest of her expedition ([c2, c3])',
    eq(got, ['c2', 'c3']), JSON.stringify(got));
})();

// ---- §4 launch member below the trust floor still answers ----
// The pick enforced trust >= 15 at launch; the expedition itself is
// the commitment — the gate counts co-tasked members with no trust
// check either, so the sense and the gate agree. A non-launch
// stranger below the floor still does not answer (§6 covers the
// fallback seat, which is trust-gated).
(function section4() {
  const got = withFlag(function () { return sense(makeCtx({ trust: { c1: 10, c2: 30, c3: 35, s1: 50, s2: 45 } }), 'h1'); });
  check('§4 launch companion below the trust floor still answers ([c1, c2])',
    eq(got, ['c1', 'c2']), JSON.stringify(got));
})();

// ---- §5 same-target rule: a companion on a DIFFERENT expedition
// ---- does not count; the seat goes to the next same-target companion ----
(function section5() {
  const got = withFlag(function () {
    return sense(makeCtx({ exped: {
      h1: exp(3, 3, 60), c1: exp(3, 3, 60), c2: exp(7, 7, 60), c3: exp(3, 3, 60),
    } }), 'h1');
  });
  check('§5 off-target companion excluded, next on-target companion takes the seat ([c1, c3])',
    eq(got, ['c1', 'c3']), JSON.stringify(got));
})();

// ---- §6 dead + returned-home companions are not returned ----
// c2 died (d82 shape) and c3's expedition ended (d69 shape: home,
// no exped entry) while the STALE plan still lists all three — the
// sense must read the live expedition, not the stale plan. The second
// seat falls back to the earshot sense (s1, trust-gated as before).
(function section6() {
  const got = withFlag(function () {
    return sense(makeCtx({
      dead: { c2: true },
      exped: { h1: exp(3, 3, 60), c1: exp(3, 3, 60) },
      winPlan: { h1: { stage: 'hunt', target: 'audit', needWave: 4, party: ['c1', 'c2', 'c3'] } },
    }), 'h1');
  });
  check('§6 dead + returned-home excluded despite the stale plan ([c1, s1])',
    eq(got, ['c1', 's1']), JSON.stringify(got));
})();

// ---- §7 expedition-start order: the earliest departure answers first ----
// c2 set out on day 58, c1/c3 on day 60 — the sense returns the
// earliest first, not roster or plan order.
(function section7() {
  const got = withFlag(function () {
    return sense(makeCtx({ exped: {
      h1: exp(3, 3, 58), c1: exp(3, 3, 60), c2: exp(3, 3, 58), c3: exp(3, 3, 60),
    } }), 'h1');
  });
  check('§7 earliest departure answers first ([c2, c1])',
    eq(got, ['c2', 'c1']), JSON.stringify(got));
})();

// ---- §8 driver determinism (RUN_DETERMINISM=1 only) ----
// Pilot seed 104758, 60d, MODE=ctl, twice; the per-seed JSONs must
// agree except anchorCommit. Spawns the driver as a child process
// with OUTDIR under /tmp (throwaway proof artifacts, never judged
// corpora — judged corpora live under evidence/).
(function section8() {
  if (process.env.RUN_DETERMINISM !== '1') { skipped++; console.log('SKIP: §8 driver determinism (set RUN_DETERMINISM=1)'); return; }
  const cp = require('child_process');
  const os = require('os');
  const dirA = fs.mkdtempSync(path.join(os.tmpdir(), 'senseexped-det-a-'));
  const dirB = fs.mkdtempSync(path.join(os.tmpdir(), 'senseexped-det-b-'));
  const env = Object.assign({}, process.env, {
    PARTYSIZE4: '1', VETREENGAGE: '1', FLEEREPAIR2: '1', FIGHTALLY2: '1',
    MODE: 'ctl', SEEDS: '104758', RUN: 'senseexped-b', DAYS: '60',
  });
  function runOnce(outdir) {
    const e = Object.assign({}, env, { OUTDIR: outdir });
    const r = cp.spawnSync(process.execPath, [path.join(REPO, 'scripts', 'senseexped-driver-b.js')], { env: e, encoding: 'utf8', timeout: 600000 });
    return r;
  }
  const ra = runOnce(dirA);
  const rb = runOnce(dirB);
  check('§8 determinism run A exits 0', ra.status === 0, 'status ' + ra.status + ' ' + (ra.stderr || '').slice(0, 200));
  check('§8 determinism run B exits 0', rb.status === 0, 'status ' + rb.status + ' ' + (rb.stderr || '').slice(0, 200));
  if (ra.status === 0 && rb.status === 0) {
    const fa = path.join(dirA, 'senseexped-b-s104758-senseexped-b-ctl.json');
    const fb = path.join(dirB, 'senseexped-b-s104758-senseexped-b-ctl.json');
    const ja = JSON.parse(fs.readFileSync(fa, 'utf8'));
    const jb = JSON.parse(fs.readFileSync(fb, 'utf8'));
    delete ja.anchorCommit; delete jb.anchorCommit;
    check('§8 pilot seed 60d twice: per-seed JSON identical except anchorCommit',
      JSON.stringify(ja) === JSON.stringify(jb));
  }
})();

console.log('test-senseexped-b: ' + passed + ' passed, ' + failed + ' failed' + (skipped ? ', ' + skipped + ' skipped' : ''));
process.exit(failed ? 1 : 0);
