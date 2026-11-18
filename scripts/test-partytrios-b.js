// test-partytrios-b.js — proof test, arm sim-partytrios-b.
// Proves, on synthetic fixtures and one live driver run (no corpus
// numbers): the brain-path trio mirror in vbrainExecuteDepart bumps
// winPlanStats.partyTrios exactly once per launched trio, stays at 0
// when the second companion is blocked, when the commit carries none,
// and when VETREENGAGE is off — mirroring the partyQuads §5d/§5e
// shape from the HELD sim-partysize-recorder-b branch (commit
// 035034c9f), adapted to trios (companion3 launches on no path on
// this tip, so there is no quad leg here). The depart path's own
// partyTrios bump (win-plan.js) is guarded, not re-proved —
// test-winplandepart-b.js §5f/§5g owns it.
// Fixture pattern follows test-winplandepart-b.js / the recorder
// test-partysize-b.js §5 (hand-built ctx; the brain depart calls the
// winPlanStats accessor off `this`, so it is bound to the real one).
// Usage: node scripts/test-partytrios-b.js
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
function skip(name, why) { skipped++; notes.push('SKIP: ' + name + ' — ' + why); }
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// ---- §0 static: the bump exists where the trio launches, once ----
(function section0() {
  const brainSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
  const winplanSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
  check('§0 brain mirror carries the PARTYTRIOS marker', brainSrc.indexOf('PARTYTRIOS (sim-partytrios-b)') !== -1);
  check('§0 brain mirror bumps partyTrios through winPlanStats()',
    brainSrc.indexOf("_pt.partyTrios = (_pt.partyTrios || 0) + 1") !== -1);
  check('§0 brain mirror bumps partyTrios exactly once in the file',
    (brainSrc.match(/_pt\.partyTrios = \(_pt\.partyTrios \|\| 0\) \+ 1/g) || []).length === 1);
  check('§0 brain mirror bump sits inside the launched.length > 1 block',
    /if \(launched\.length > 1\) \{[\s\S]{0,1200}_pt\.partyTrios = \(_pt\.partyTrios \|\| 0\) \+ 1/.test(brainSrc));
  check('§0 depart path still bumps partyTrios (guard, owned by winplandepart-b)',
    winplanSrc.indexOf("bump(self, 'partyTrios')") !== -1);
  check('§0 writeCommit still carries companion2 (triodrought substrate)',
    brainSrc.indexOf('companion2: chosen.companion2') !== -1);
  check('§0 no other src/js file bumps partyTrios',
    fs.readdirSync(path.join(REPO, 'src', 'js')).filter(function (f) { return f.endsWith('.js'); })
      .filter(function (f) { return ['win-plan.js', 'villager-brain.js'].indexOf(f) === -1; })
      .filter(function (f) { return fs.readFileSync(path.join(REPO, 'src', 'js', f), 'utf8').indexOf('partyTrios') !== -1; }).length === 0);
})();

// ---- §5 brain-trio units (synthetic fixtures, live module code) ----
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
    // The brain depart bumps partyTrios through the canonical
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
    const plan1 = { stage: 'party', target: 'reunion', needWave: 4, node: { nx: 3, ny: 3 }, party: [], sinceDay: 10, holdSinceDay: -1 };
    const plan2 = { stage: 'gear', target: null, node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
    const plan3 = { stage: 'gear', target: null, node: null, party: [], sinceDay: 0, holdSinceDay: -1 };
    const commit = { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'v2',
      companion2: (o.c2 === undefined ? 'v3' : o.c2), day: 60 };
    const ctx = makeCtx({ people: people, exped: exped,
      winPlan: { v1: plan1, v2: plan2, v3: plan3 },
      vbrain: { commit: { v1: commit }, perception: {}, logs: [], stats: { picks: 0, gates: 0, expeditions: 0, winPlan: 0 } } });
    ctx.startExpedition = function (vid, hx, hy, announce, opts) {
      if (o.blockVid === vid) return; // blocked: no expedition starts
      exped[vid] = { tx: opts.tx, ty: opts.ty, duration: opts.duration };
    };
    return { ctx: ctx, plan1: plan1, exped: exped, commit: commit };
  }
  function trios(ctx) { return ((Game.winPlanStats.call(ctx) || {}).partyTrios || 0); }

  // 5d. Brain trio mirror: launches holder + first + second companion
  // on one target and bumps partyTrios exactly once.
  (function () {
    const a = brainCtx({});
    const r = Game.vbrainExecuteDepart.call(a.ctx, 'v1', 5, 5, false);
    check('§5d brain trio mirror launches all three on one target',
      r === 'launch' && !!a.exped.v1 && !!a.exped.v2 && !!a.exped.v3 &&
      a.exped.v1.tx === a.exped.v2.tx && a.exped.v2.tx === a.exped.v3.tx &&
      a.plan1.stage === 'hunt' && a.plan1.party.length === 2 &&
      a.plan1.party.indexOf('v2') !== -1 && a.plan1.party.indexOf('v3') !== -1,
      JSON.stringify({ r: r, exped: Object.keys(a.exped), party: a.plan1.party }));
    check('§5d brain trio mirror bumps partyTrios by 1',
      trios(a.ctx) === 1, 'trios=' + trios(a.ctx));
    check('§5d second companion plan is hunt-staged with holder + first companion',
      (function () { const p3 = a.ctx.winPlanOf('v3'); return p3.stage === 'hunt' && eq(p3.party, ['v1', 'v2']); })(),
      JSON.stringify(a.ctx.winPlanOf('v3')));
    // A second trio launch on a later day bumps to 2 — exactly once
    // per launch, no double count within one launch. (Clear the
    // expedition map first: the mirror early-returns 'launch' while
    // the holder is still out, as in live play.)
    a.ctx.state.scholar.day = 61;
    a.commit.day = 61;
    Object.keys(a.exped).forEach(function (k) { delete a.exped[k]; });
    const r2 = Game.vbrainExecuteDepart.call(a.ctx, 'v1', 5, 5, false);
    check('§5d a second trio launch bumps partyTrios to 2 (once per launch)',
      r2 === 'launch' && trios(a.ctx) === 2, JSON.stringify({ r: r2, trios: trios(a.ctx) }));
  })();

  // 5d-blocked. Blocked second companion falls back to a pair launch,
  // partyTrios stays 0.
  (function () {
    const b = brainCtx({ blockVid: 'v3' });
    const r = Game.vbrainExecuteDepart.call(b.ctx, 'v1', 5, 5, false);
    check('§5d blocked second companion falls back to a pair launch',
      r === 'launch' && !!b.exped.v1 && !!b.exped.v2 && !b.exped.v3 &&
      b.plan1.party.length === 1 && b.plan1.party[0] === 'v2',
      JSON.stringify({ r: r, exped: Object.keys(b.exped), party: b.plan1.party }));
    check('§5d blocked second companion leaves partyTrios at 0',
      trios(b.ctx) === 0, 'trios=' + trios(b.ctx));
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
    check('§5d pair launch from a c2-null commit leaves partyTrios at 0',
      trios(c.ctx) === 0, 'trios=' + trios(c.ctx));
  })();

  // 5e. Off-mode: VETREENGAGE unset -> pair launch even with a free
  // second companion in the commit, partyTrios stays 0.
  (function () {
    delete process.env.VETREENGAGE;
    const d = brainCtx({});
    const r = Game.vbrainExecuteDepart.call(d.ctx, 'v1', 5, 5, false);
    check('§5e off-mode: no second companion launches, pair walks out',
      r === 'launch' && !!d.exped.v1 && !!d.exped.v2 && !d.exped.v3 &&
      d.plan1.party.length === 1,
      JSON.stringify({ r: r, exped: Object.keys(d.exped), party: d.plan1.party }));
    check('§5e off-mode leaves partyTrios at 0',
      trios(d.ctx) === 0, 'trios=' + trios(d.ctx));
    process.env.VETREENGAGE = '1';
  })();
})();

// ---- §6 live driver leg: the adapted driver runs end to end ----
// (child process: one seed, 30d — proves the driver, not a judged sim.)
(function section6() {
  const detDir = 'perseed-partytrios-b-det';
  const dir = path.join(REPO, 'evidence', '2026-11-18', detDir);
  try {
    const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'partytrios-driver-b.js')], {
      cwd: REPO,
      env: Object.assign({}, process.env, { VETREENGAGE: '1', PARTYSIZE4: '1', FLEEREPAIR2: '1', SEEDS: '104011', DAYS: '30', MODE: 'arm', RUN: 'partytrios-b-det', OUTDIR: detDir }),
      encoding: 'utf8', timeout: 900000, maxBuffer: 64 * 1024 * 1024,
    });
    if (r.status !== 0) throw new Error('driver exit ' + r.status + ': ' + (r.stderr || r.stdout || '').slice(-2000));
    const f = JSON.parse(fs.readFileSync(path.join(dir, 'partytrios-b-s104011-partytrios-b-det-arm.json'), 'utf8'));
    check('§6 driver leg recorded (bumpPresent true, carryPresent true)',
      f.bumpPresent === true && f.carryPresent === true,
      JSON.stringify({ bump: f.bumpPresent, carry: f.carryPresent }));
    check('§6 driver leg has zero instrument errors',
      (f.instrumentErrors || []).length === 0, JSON.stringify((f.instrumentErrors || []).slice(0, 3)));
    check('§6 driver leg carries winPlanStats',
      f.winPlanStats != null && typeof f.winPlanStats === 'object',
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
    const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-partytrios-b.js'), '--selftest'], {
      cwd: REPO, encoding: 'utf8', timeout: 120000, maxBuffer: 16 * 1024 * 1024,
    });
    check('§7 analyzer --selftest passes', r.status === 0, (r.stdout || r.stderr || '').slice(-500));
  } catch (e) {
    check('§7 analyzer selftest runs', false, String((e && e.message) || e).slice(0, 300));
  }
})();

console.log('test-partytrios-b: ' + passed + ' passed, ' + failed + ' failed, ' + skipped + ' skipped');
if (notes.length) console.log(notes.join('\n'));
process.exit(failed ? 1 : 0);
