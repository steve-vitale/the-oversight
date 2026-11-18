// test-winplandepart-b.js — proof test, arm sim-winplandepart-b.
// Proves, on synthetic fixtures and one live child-process run (no
// corpus numbers): the win-plan depart path's launch-time re-pick of
// the second companion — trio launch + partyTrios bump, pair fallback
// when the second companion is blocked or the flag is off, hold when
// no first companion exists — and that the BRAINOFF staging routes
// agencyTick through winPlanDepart (depart calls > 0, brain calls 0).
// Also proves the gate in code: vbrainOwnsDawn() returns true
// unconditionally, so the depart path is unreachable in live play
// and only the BRAINOFF override stages it.
// Usage: node scripts/test-winplandepart-b.js
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

// ---- §0 static: the gate + the path exist in code ----
(function section0() {
  const agencySrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-agency.js'), 'utf8');
  const brainSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
  const winplanSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
  check('§0 win-plan.js carries winPlanDepart', winplanSrc.indexOf('winPlanDepart(vid, hx, hy, playerAtHaven)') !== -1);
  check('§0 win-plan.js carries the launch-time second-companion re-pick',
    winplanSrc.indexOf('self.winPlanSecondCompanion ? self.winPlanSecondCompanion(vid, hx, hy, cid) : null') !== -1);
  check('§0 win-plan.js bumps partyTrios on a trio depart', winplanSrc.indexOf("bump(self, 'partyTrios')") !== -1);
  check('§0 vbrainOwnsDawn returns true unconditionally (the gate)',
    /vbrainOwnsDawn:\s*function\s*\(\)\s*\{\s*return true;\s*\}/.test(brainSrc));
  check('§0 agencyTick calls winPlanDepart only when the brain does NOT own dawn',
    agencySrc.indexOf('no winPlanDepart re-decide') !== -1 &&
    agencySrc.indexOf('if (this.winPlanDepart)') !== -1);
  check('§0 no env flag flips vbrainOwnsDawn (grep the brain module)',
    brainSrc.indexOf('vbrainOwnsDawn') !== -1 &&
    !/vbrainOwnsDawn[^}]{0,200}process\.env/.test(brainSrc));
})();

// ---- §5 depart-path units (synthetic fixtures, live module code) ----
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
  function departCtx(o) {
    // Shared staged scene: v1 holds a wave-4 party plan at Haven (5,5)
    // with node (3,3); v2 is the first companion (wanderer, armed);
    // v3 is the wave-3 killer second companion (armed); v4 is armed
    // but NOT at Haven (excluded from both picks).
    const people = makePeople({
      v1: { node: [5, 5] },
      v2: { node: [5, 5], weaponB: 5, items: [{ id: 'spear' }] },
      v3: { node: [5, 5], weaponB: 5, items: [{ id: 'spear' }] },
      v4: { node: [1, 1], weaponB: 5, items: [{ id: 'spear' }] },
    });
    const plan1 = { stage: 'party', target: 'reunion', needWave: 4, node: { nx: 3, ny: 3 }, party: [], sinceDay: 10, holdSinceDay: -1 };
    const exped = {};
    const ctx = makeCtx({ people: people, exped: exped,
      trust: { v2: 20, v3: 20, v4: 20 },
      waveKillLog: [{ by: 'v3', w: 3, d: 10, mid: 'redactor', via: 'wild' }],
      winPlan: { v1: plan1 } });
    ctx.startExpedition = function (vid, hx, hy, announce, opts) {
      if (o && o.blockVid === vid) return; // blocked: no expedition starts
      exped[vid] = { tx: opts.tx, ty: opts.ty, duration: opts.duration };
    };
    return { ctx: ctx, plan1: plan1, exped: exped };
  }

  // 5f. Depart path launches the trio on one shared target + bumps partyTrios.
  (function () {
    const a = departCtx({});
    const r = Game.winPlanDepart.call(a.ctx, 'v1', 5, 5, false);
    const stats = a.ctx.state.village.winPlanStats || {};
    check('§5f depart path launches holder + first + second companion on one target',
      r === 'launch' && !!a.exped.v1 && !!a.exped.v2 && !!a.exped.v3 &&
      a.exped.v1.tx === 3 && a.exped.v1.ty === 3 &&
      a.exped.v1.tx === a.exped.v2.tx && a.exped.v2.tx === a.exped.v3.tx &&
      a.plan1.stage === 'hunt' && a.plan1.party.length === 2 &&
      a.plan1.party.indexOf('v2') !== -1 && a.plan1.party.indexOf('v3') !== -1,
      JSON.stringify({ r: r, exped: Object.keys(a.exped), party: a.plan1.party, stage: a.plan1.stage }));
    check('§5f trio depart bumps partyTrios by 1 (and records the departure)',
      stats.partyTrios === 1 && stats.partyDepartures === 1,
      JSON.stringify(stats));
    check('§5f second companion plan is hunt-staged with the holder + first companion',
      (function () { const p3 = a.ctx.winPlanOf('v3'); return p3.stage === 'hunt' && eq(p3.party, ['v1', 'v2']); })(),
      JSON.stringify(a.ctx.winPlanOf('v3')));
  })();

  // 5g. Blocked second companion falls back to a pair launch, no trio bump.
  (function () {
    const b = departCtx({ blockVid: 'v3' });
    const r = Game.winPlanDepart.call(b.ctx, 'v1', 5, 5, false);
    const stats = b.ctx.state.village.winPlanStats || {};
    check('§5g blocked second companion falls back to a pair launch',
      r === 'launch' && !!b.exped.v1 && !!b.exped.v2 && !b.exped.v3 &&
      b.plan1.party.length === 1 && b.plan1.party[0] === 'v2',
      JSON.stringify({ r: r, exped: Object.keys(b.exped), party: b.plan1.party }));
    check('§5g pair launch does NOT bump partyTrios',
      (stats.partyTrios || 0) === 0 && stats.partyDepartures === 1,
      JSON.stringify(stats));
  })();

  // 5h. Off-mode: VETREENGAGE unset -> pair launch even with a free killer.
  (function () {
    delete process.env.VETREENGAGE;
    const c = departCtx({});
    const r = Game.winPlanDepart.call(c.ctx, 'v1', 5, 5, false);
    const stats = c.ctx.state.village.winPlanStats || {};
    check('§5h off-mode: no second companion picked, pair launches',
      r === 'launch' && !!c.exped.v1 && !!c.exped.v2 && !c.exped.v3 &&
      c.plan1.party.length === 1 && (stats.partyTrios || 0) === 0,
      JSON.stringify({ r: r, exped: Object.keys(c.exped), party: c.plan1.party, trios: stats.partyTrios }));
    process.env.VETREENGAGE = '1';
  })();

  // 5i. No first companion at Haven -> hold (party wait), nobody leaves.
  (function () {
    const people = makePeople({
      v1: { node: [5, 5] },
      v2: { node: [1, 1], weaponB: 5, items: [{ id: 'spear' }] },
      v3: { node: [1, 1], weaponB: 5, items: [{ id: 'spear' }] },
    });
    const plan1 = { stage: 'party', target: 'reunion', needWave: 4, node: { nx: 3, ny: 3 }, party: [], sinceDay: 10, holdSinceDay: -1 };
    const exped = {};
    const ctx = makeCtx({ people: people, exped: exped,
      trust: { v2: 20, v3: 20 },
      waveKillLog: [{ by: 'v3', w: 3, d: 10, mid: 'redactor', via: 'wild' }],
      winPlan: { v1: plan1 }, day: 60 });
    ctx.startExpedition = function (vid, hx, hy, announce, opts) { exped[vid] = { tx: opts.tx, ty: opts.ty, duration: opts.duration }; };
    const r = Game.winPlanDepart.call(ctx, 'v1', 5, 5, false);
    const stats = ctx.state.village.winPlanStats || {};
    check('§5i no companion at Haven -> hold, nobody departs',
      r === 'hold' && Object.keys(exped).length === 0 && plan1.party.length === 0 &&
      (stats.partyWaits || 0) === 1,
      JSON.stringify({ r: r, exped: Object.keys(exped), waits: stats.partyWaits }));
  })();
})();

// ---- §6 routing: BRAINOFF override sends agencyTick through winPlanDepart ----
// (child process: one seed, 30d — the driver is the instrument; this
// section proves the staging routes, it is not a judged sim.)
(function section6() {
  const detDir = 'perseed-winplandepart-b-det';
  const dir = path.join(REPO, 'evidence', '2026-11-18', detDir);
  try {
    const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'winplandepart-driver-b.js')], {
      cwd: REPO,
      env: Object.assign({}, process.env, { VETREENGAGE: '1', PARTYSIZE4: '1', FLEEREPAIR2: '1', SEEDS: '104021', DAYS: '30', MODE: 'brainoff', RUN: 'winplandepart-b-det', OUTDIR: detDir }),
      encoding: 'utf8', timeout: 600000, maxBuffer: 64 * 1024 * 1024,
    });
    if (r.status !== 0) throw new Error('driver exit ' + r.status + ': ' + (r.stderr || r.stdout || '').slice(-2000));
    const f = JSON.parse(fs.readFileSync(path.join(dir, 'winplandepart-b-s104021-winplandepart-b-det-brainoff.json'), 'utf8'));
    check('§6 BRAINOFF staging recorded (brainOff true, override asserted)',
      f.brainOff === true && f.brainOwnsDawn === false, JSON.stringify({ brainOff: f.brainOff, owns: f.brainOwnsDawn }));
    check('§6 agencyTick routes through winPlanDepart (depart calls > 0 in 30d)',
      (f.departCalls || []).length > 0, 'departCalls=' + (f.departCalls || []).length);
    check('§6 brain path is never executed on the staged leg (brain calls 0)',
      (f.brainCalls || []).length === 0, 'brainCalls=' + (f.brainCalls || []).length);
    check('§6 staged run has zero instrument errors',
      (f.instrumentErrors || []).length === 0, JSON.stringify((f.instrumentErrors || []).slice(0, 3)));
  } catch (e) {
    check('§6 routing leg runs', false, String((e && e.message) || e).slice(0, 300));
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}
  }
})();

// ---- §7 analyzer selftest ----
(function section7() {
  try {
    const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'analyze-winplandepart-b.js'), '--selftest'], {
      cwd: REPO, encoding: 'utf8', timeout: 120000, maxBuffer: 16 * 1024 * 1024,
    });
    check('§7 analyzer --selftest passes', r.status === 0, (r.stdout || r.stderr || '').slice(-500));
  } catch (e) {
    check('§7 analyzer selftest runs', false, String((e && e.message) || e).slice(0, 300));
  }
})();

console.log('test-winplandepart-b: ' + passed + ' passed, ' + failed + ' failed, ' + skipped + ' skipped');
if (notes.length) console.log(notes.join('\n'));
process.exit(failed ? 1 : 0);
