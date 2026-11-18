// test-partyquads-b.js — proof test, arm sim-partyquads-b.
// Proves, on synthetic fixtures and one live driver run (no corpus
// numbers): the brain-path quad bump in vbrainExecuteDepart sits in
// a `launched.length > 2` guard (NOT in the trio block — a trio
// launch must leave partyQuads at 0), the winPlanStats default is 0,
// and the winPlanStats accessor reaches the bump. Since the
// PARTYSIZE4 lever landed (sim-partysize4-b), the quad-fire leg
// (§5q) is LIVE: a dawn commit carrying a third companion launches
// all four on one target and bumps partyQuads to 1. What this test
// proves is the faithful extraction (same accessor, same guard shape
// as the HELD commit 035034c9f) plus the placement bound that keeps
// trios from being counted as quads, plus the depart-path quad bump
// the lever arm added (finding #2549). Negative control: §0 and the
// §5d default check fail on pre-fix code (no marker, no default, no
// bump line); the §6 driver leg fails too (MODE=arm requires
// BUMP_PRESENT).
// Fixture pattern follows test-partytrios-b.js §5 (hand-built ctx;
// the brain depart calls the winPlanStats accessor off `this`, so
// it is bound to the real one). The depart path's own partyTrios
// bump (win-plan.js) is guarded, not re-proved —
// test-winplandepart-b.js §5f/§5g owns it.
// Usage: node scripts/test-partyquads-b.js
'use strict';
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const REPO = path.join(__dirname, '..');

let passed = 0, failed = 0, skipped = 0;
const notes = [];
function check(name, cond, extra) {
  if (cond) { passed++; }
  else { failed++; notes.push('FAIL: ' + name + (extra ? ' — ' + extra : '')); console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}
function skip(name, why) { skipped++; notes.push('SKIP: ' + name + ' — ' + why); console.log('SKIP: ' + name + ' — ' + why); }
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// ---- §0 static: the bump exists where a quad launches, once ----
(function section0() {
  const brainSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
  const winplanSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
  check('§0 brain mirror carries the PARTYQUADS marker', brainSrc.indexOf('PARTYQUADS (sim-partyquads-b)') !== -1);
  check('§0 brain mirror bumps partyQuads through winPlanStats()',
    brainSrc.indexOf("_pq.partyQuads = (_pq.partyQuads || 0) + 1") !== -1);
  check('§0 brain mirror bumps partyQuads exactly once in the file',
    (brainSrc.match(/_pq\.partyQuads = \(_pq\.partyQuads \|\| 0\) \+ 1/g) || []).length === 1);
  check('§0 brain mirror bump sits inside a launched.length > 2 block',
    /if \(launched\.length > 2\) \{[\s\S]{0,2200}_pq\.partyQuads = \(_pq\.partyQuads \|\| 0\) \+ 1/.test(brainSrc));
  // Placement bound: the quad bump must NOT sit inside the trio
  // block — the text between `if (launched.length > 1) {` and the
  // trio bump must contain no _pq line (a trio counted as a quad
  // would be a misfire on every trio launch).
  check('§0 brain mirror bump does NOT sit inside the launched.length > 1 trio block',
    (function () {
      const i = brainSrc.indexOf('if (launched.length > 1) {');
      const j = brainSrc.indexOf('_pt.partyTrios = (_pt.partyTrios || 0) + 1');
      if (i === -1 || j === -1 || j < i) return false;
      return brainSrc.slice(i, j).indexOf('_pq.partyQuads') === -1;
    })());
  check('§0 win-plan.js defaults partyQuads to 0',
    winplanSrc.indexOf('partyTrios: 0, partyQuads: 0') !== -1);
  check('§0 win-plan.js null-guards partyQuads',
    winplanSrc.indexOf("if (v.winPlanStats.partyQuads == null) v.winPlanStats.partyQuads = 0;") !== -1);
  check('§0 depart path still bumps partyTrios (guard, owned by winplandepart-b)',
    winplanSrc.indexOf("bump(self, 'partyTrios')") !== -1);
  // PARTYSIZE4 (sim-partysize4-b, finding #2549): the depart path
  // now carries its own quad bump — the lever arm added it, so the
  // absence asserted here on the partyquads tip is superseded. The
  // placement bound is the same as the brain path: inside a
  // launched.length > 2 block, after the trio bump (a trio must
  // never bump it).
  check('§0 depart path bumps partyQuads (lever arm, finding #2549)',
    winplanSrc.indexOf("bump(self, 'partyQuads')") !== -1);
  check('§0 depart path quad bump sits inside a launched.length > 2 block',
    /if \(launched\.length > 2\) \{[\s\S]{0,600}bump\(self, 'partyQuads'\)/.test(winplanSrc));
  check('§0 writeCommit still carries companion2/3 (triodrought substrate)',
    brainSrc.indexOf('companion2: chosen.companion2') !== -1 && brainSrc.indexOf('companion3: chosen.companion3') !== -1);
  check('§0 no other src/js file mentions partyQuads',
    fs.readdirSync(path.join(REPO, 'src', 'js')).filter(function (f) { return f.endsWith('.js'); })
      .filter(function (f) { return ['win-plan.js', 'villager-brain.js'].indexOf(f) === -1; })
      .filter(function (f) { return fs.readFileSync(path.join(REPO, 'src', 'js', f), 'utf8').indexOf('partyQuads') !== -1; }).length === 0);
})();

// ---- §5 brain-quad units (synthetic fixtures, live module code) ----
(function section5() {
  process.env.VETREENGAGE = '1';
  globalThis.Scattering = globalThis.Scattering || {};
  globalThis.Scattering.Game = globalThis.Scattering.Game || {};
  globalThis.Scattering.equipment = {
    armorOf: function (person) { return (person && person._armorP) || 0; },
    weaponBonusOf: function (person) { return (person && person._weaponB) || 0; },
  };
  require(path.join(REPO, 'src', 'js', 'win-plan.js'));
  require(path.join(REPO, 'src', 'js', 'villager-brain.js'));
  const Game = globalThis.Scattering.Game;

  function makePeople(spec) {
    const people = {};
    Object.keys(spec).forEach(function (vid) {
      const s = spec[vid];
      people[vid] = { id: vid, name: vid, dead: !!s.dead, _armorP: s.armorP || 0, _weaponB: s.weaponB || 0,
        items: s.items || [], node: s.node || null };
    });
    return people;
  }
  function makeCtx(opts) {
    const o = opts || {};
    const people = o.people || {};
    const exped = o.exped || {};
    const ctx = {
      villagerId: 'scholar1',
      data: { items: [{ id: 'spear', weapon: true }, { id: 'knife', weapon: true }] },
      state: {
        scholar: { day: o.day || 60 },
        _standingDeferBeat: o.beat || {},
        village: {
          roster: o.roster || Object.keys(people),
          trust: o.trust || {},
          away: o.away || {},
          sick: o.sick || {},
          health: o.health || {},
          winPlan: o.winPlan || {},
          vbrain: o.vbrain || { commit: {}, perception: {}, logs: [], stats: { picks: 0, gates: 0, expeditions: 0, winPlan: 0 } },
        },
        waveKillLog: o.waveKillLog || [],
      },
      dayPart: 0,
      getPerson: function (vid) { return people[vid] || null; },
      vpOf: function (vid) { return people[vid] || null; },
      npcNode: function (vid) { const p = people[vid]; return p && p.node ? { nx: p.node[0], ny: p.node[1] } : null; },
      isEngaged: function () { return false; },
      npcMaxDist: function () { return 3; },
      npcRangeProfile: function (vid) { return ((o.profiles || {})[vid]) || 'wanderer'; },
      agencyState: function () { return { exped: exped, know: {} }; },
      companionRank: function (asker, ids) {
        return (ids || []).map(function (id) { return { id: id, s: 0 }; }).sort(function (a, b) { return String(a.id).localeCompare(String(b.id)); });
      },
      villagerGearUp: function () { return true; },
      winPlanSecondCompanion: Game.winPlanSecondCompanion,
      tableActive: function () { return false; },
      waveUnlockReady: function () { return { ready: true, short: [] }; },
      villageKnowsTrick: function (mid) { return (o.tricks || {})[mid] === true; },
      villagerFightAllies: function (vid) { return (o.allies || {})[vid] || []; },
      winPlanSeedFromFight: function () { return null; },
    };
    ctx._exped = exped;
    // The brain depart bumps partyQuads through the canonical
    // accessor — bind it the same way the recorder test bound the
    // partyQuads accessor (the brain path could not reach
    // win-plan.js's module-internal bump()).
    ctx.winPlanStats = function () { return Game.winPlanStats.call(ctx); };
    ctx.vbrainCommit = function (vid) {
      try { var c = ctx.state.village.vbrain.commit; return (c && c[vid]) || null; } catch (e) { return null; }
    };
    ctx.winPlanOf = function (vid) {
      var v = ctx.state.village;
      if (!v.winPlan[vid]) v.winPlan[vid] = { stage: 'gear', target: null, node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
      return v.winPlan[vid];
    };
    return ctx;
  }
  function brainCtx(o) {
    o = o || {};
    const exped = {};
    const people = makePeople({
      v1: { node: [5, 5] },
      v2: { node: [5, 5], weaponB: 5, items: [{ id: 'spear' }] },
      v3: { node: [5, 5], weaponB: 5, items: [{ id: 'spear' }] },
    });
    if (o.c3 !== undefined) people.v4 = { id: 'v4', name: 'v4', dead: false, _armorP: 0, _weaponB: 5, items: [{ id: 'spear' }], node: [5, 5] };
    const plan1 = { stage: 'party', target: 'reunion', needWave: 4, node: { nx: 3, ny: 3 }, party: [], sinceDay: 10, holdSinceDay: -1 };
    const plan2 = { stage: 'gear', target: null, node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
    const plan3 = { stage: 'gear', target: null, node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
    const plan4 = { stage: 'gear', target: null, node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
    const commit = { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'v2',
      companion2: (o.c2 === undefined ? 'v3' : o.c2), day: 60 };
    if (o.c3 !== undefined) commit.companion3 = o.c3;
    const winPlan = { v1: plan1, v2: plan2, v3: plan3 };
    if (o.c3 !== undefined) winPlan.v4 = plan4;
    const ctx = makeCtx({ people: people, exped: exped,
      winPlan: winPlan,
      vbrain: { commit: { v1: commit }, perception: {}, logs: [], stats: { picks: 0, gates: 0, expeditions: 0, winPlan: 0 } } });
    ctx.startExpedition = function (vid, hx, hy, announce, opts) {
      if (o.blockVid === vid) return; // blocked: no expedition starts
      exped[vid] = { tx: opts.tx, ty: opts.ty, duration: opts.duration };
    };
    return { ctx: ctx, plan1: plan1, exped: exped, commit: commit };
  }
  function stats(ctx) { return Game.winPlanStats.call(ctx) || {}; }
  function quads(ctx) { return stats(ctx).partyQuads; }
  function trios(ctx) { return stats(ctx).partyTrios; }

  // 5d-default. A fresh village initializes partyQuads to exactly 0
  // (raw value, not || 0 — this fails on pre-fix code, where the
  // field is undefined).
  (function () {
    const a = brainCtx({});
    check('§5d winPlanStats() initializes partyQuads to exactly 0 on a fresh village',
      quads(a.ctx) === 0, 'partyQuads=' + JSON.stringify(quads(a.ctx)));
  })();

  // 5d. Brain trio launch: holder + first + second companion walk
  // out, partyTrios bumps to 1, partyQuads stays 0 — the placement
  // bound. (Same fixture as partytrios §5d, now asserting the quad
  // counter does NOT fire on a trio.)
  (function () {
    const a = brainCtx({});
    const r = Game.vbrainExecuteDepart.call(a.ctx, 'v1', 5, 5, false);
    check('§5d brain trio mirror launches all three on one target',
      r === 'launch' && !!a.exped.v1 && !!a.exped.v2 && !!a.exped.v3 &&
      a.exped.v1.tx === a.exped.v2.tx && a.exped.v2.tx === a.exped.v3.tx &&
      a.plan1.stage === 'hunt' && a.plan1.party.length === 2 &&
      a.plan1.party.indexOf('v2') !== -1 && a.plan1.party.indexOf('v3') !== -1,
      JSON.stringify({ r: r, exped: Object.keys(a.exped), party: a.plan1.party }));
    check('§5d trio launch bumps partyTrios to 1 (sibling counter untouched)',
      trios(a.ctx) === 1, 'trios=' + trios(a.ctx));
    check('§5d trio launch leaves partyQuads at 0 (no misfire)',
      quads(a.ctx) === 0, 'quads=' + quads(a.ctx));
    // A second trio launch on a later day bumps trios to 2 and still
    // leaves quads at 0.
    a.ctx.state.scholar.day = 61;
    a.commit.day = 61;
    Object.keys(a.exped).forEach(function (k) { delete a.exped[k]; });
    const r2 = Game.vbrainExecuteDepart.call(a.ctx, 'v1', 5, 5, false);
    check('§5d a second trio launch bumps partyTrios to 2, partyQuads still 0',
      r2 === 'launch' && trios(a.ctx) === 2 && quads(a.ctx) === 0,
      JSON.stringify({ r: r2, trios: trios(a.ctx), quads: quads(a.ctx) }));
  })();

  // 5d-blocked. Blocked second companion falls back to a pair launch,
  // partyQuads stays 0.
  (function () {
    const b = brainCtx({ blockVid: 'v3' });
    const r = Game.vbrainExecuteDepart.call(b.ctx, 'v1', 5, 5, false);
    check('§5d blocked second companion falls back to a pair launch',
      r === 'launch' && !!b.exped.v1 && !!b.exped.v2 && !b.exped.v3 &&
      b.plan1.party.length === 1 && b.plan1.party[0] === 'v2',
      JSON.stringify({ r: r, exped: Object.keys(b.exped), party: b.plan1.party }));
    check('§5d blocked second companion leaves partyQuads at 0',
      quads(b.ctx) === 0, 'quads=' + quads(b.ctx));
  })();

  // 5d-noc2. Commit carries no second companion (genuine pick miss):
  // pair launch, no bump.
  (function () {
    const c = brainCtx({ c2: null });
    const r = Game.vbrainExecuteDepart.call(c.ctx, 'v1', 5, 5, false);
    check('§5d commit with no second companion launches a pair',
      r === 'launch' && !!c.exped.v1 && !!c.exped.v2 && !c.exped.v3 &&
      c.plan1.party.length === 1,
      JSON.stringify({ r: r, exped: Object.keys(c.exped), party: c.plan1.party }));
    check('§5d pair launch from a c2-null commit leaves partyQuads at 0',
      quads(c.ctx) === 0, 'quads=' + quads(c.ctx));
  })();

  // 5e. Off-mode: VETREENGAGE unset -> pair launch even with a free
  // second companion in the commit, partyQuads stays 0.
  (function () {
    delete process.env.VETREENGAGE;
    const d = brainCtx({});
    const r = Game.vbrainExecuteDepart.call(d.ctx, 'v1', 5, 5, false);
    check('§5e off-mode: no second companion launches, pair walks out',
      r === 'launch' && !!d.exped.v1 && !!d.exped.v2 && !d.exped.v3 &&
      d.plan1.party.length === 1,
      JSON.stringify({ r: r, exped: Object.keys(d.exped), party: d.plan1.party }));
    check('§5e off-mode leaves partyQuads at 0',
      quads(d.ctx) === 0, 'quads=' + quads(d.ctx));
    process.env.VETREENGAGE = '1';
  })();

  // 5q. QUAD-FIRE LEG — LIVE since the PARTYSIZE4 lever landed
  // (sim-partysize4-b). A dawn commit carrying a third companion
  // launches all four on one target, and the brain mirror bumps
  // partyQuads to 1 (trios stays 1 — the quad is also a trio-sized
  // launch, so both counters move). A blocked third companion falls
  // back to a trio launch with partyQuads at 0. This is the
  // observable effect the counter exists to count: a quad actually
  // launching and fighting, not a green assertion.
  (function () {
    process.env.PARTYSIZE4 = '1';
    const a = brainCtx({ c3: 'v4' });
    const r = Game.vbrainExecuteDepart.call(a.ctx, 'v1', 5, 5, false);
    check('§5q quad launch bumps partyQuads to 1 (live fixture)',
      r === 'launch' && !!a.exped.v1 && !!a.exped.v2 && !!a.exped.v3 && !!a.exped.v4 &&
      a.exped.v1.tx === a.exped.v2.tx && a.exped.v2.tx === a.exped.v3.tx && a.exped.v3.tx === a.exped.v4.tx &&
      a.plan1.stage === 'hunt' && a.plan1.party.length === 3 &&
      a.plan1.party.indexOf('v2') !== -1 && a.plan1.party.indexOf('v3') !== -1 && a.plan1.party.indexOf('v4') !== -1 &&
      quads(a.ctx) === 1 && trios(a.ctx) === 1,
      JSON.stringify({ r: r, exped: Object.keys(a.exped), party: a.plan1.party, quads: quads(a.ctx), trios: trios(a.ctx) }));
    const b = brainCtx({ c3: 'v4', blockVid: 'v4' });
    const r2 = Game.vbrainExecuteDepart.call(b.ctx, 'v1', 5, 5, false);
    check('§5q blocked third companion falls back to a trio launch, partyQuads 0',
      r2 === 'launch' && !!b.exped.v1 && !!b.exped.v2 && !!b.exped.v3 && !b.exped.v4 &&
      b.plan1.party.length === 2 && quads(b.ctx) === 0 && trios(b.ctx) === 1,
      JSON.stringify({ r: r2, exped: Object.keys(b.exped), party: b.plan1.party, quads: quads(b.ctx), trios: trios(b.ctx) }));
    delete process.env.PARTYSIZE4;
  })();
})();

// ---- §6 live driver leg: the adapted driver runs end to end ----
// (child process: one seed, 30d — proves the driver, not a judged sim.)
(function section6() {
  const detDir = 'perseed-partyquads-b-det';
  const dir = path.join(REPO, 'evidence', '2026-11-18', detDir);
  try {
    const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'partyquads-driver-b.js')], {
      cwd: REPO,
      env: Object.assign({}, process.env, { VETREENGAGE: '1', PARTYSIZE4: '1', FLEEREPAIR2: '1', SEEDS: '105001', DAYS: '30', MODE: 'arm', RUN: 'partyquads-b-det', OUTDIR: detDir }),
      encoding: 'utf8', timeout: 900000, maxBuffer: 64 * 1024 * 1024,
    });
    if (r.status !== 0) throw new Error('driver exit ' + r.status + ': ' + (r.stderr || r.stdout || '').slice(-2000));
    const f = JSON.parse(fs.readFileSync(path.join(dir, 'partyquads-b-s105001-partyquads-b-det-arm.json'), 'utf8'));
    check('§6 driver leg recorded (bumpPresent true, carryPresent true)',
      f.bumpPresent === true && f.carryPresent === true,
      JSON.stringify({ bump: f.bumpPresent, carry: f.carryPresent }));
    check('§6 driver leg has zero instrument errors',
      (f.instrumentErrors || []).length === 0, JSON.stringify((f.instrumentErrors || []).slice(0, 3)));
    check('§6 driver leg carries winPlanStats with partyQuads 0 (no misfire on a live leg)',
      f.winPlanStats != null && typeof f.winPlanStats === 'object' && f.winPlanStats.partyQuads === 0,
      JSON.stringify(f.winPlanStats));
  } catch (e) {
    check('§6 driver leg runs', false, String((e && e.message) || e).slice(0, 300));
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
  }
})();

// ---- §7 analyzer selftest ----
(function section7() {
  try {
    const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-partyquads-b.js'), '--selftest'], {
      cwd: REPO, encoding: 'utf8', timeout: 120000, maxBuffer: 16 * 1024 * 1024,
    });
    check('§7 analyzer --selftest passes', r.status === 0, (r.stdout || r.stderr || '').slice(-500));
  } catch (e) {
    check('§7 analyzer selftest runs', false, String((e && e.message) || e).slice(0, 300));
  }
})();

console.log('test-partyquads-b: ' + passed + ' passed, ' + failed + ' failed, ' + skipped + ' skipped');
if (notes.length) console.log(notes.join('\n'));
process.exit(failed ? 1 : 0);
