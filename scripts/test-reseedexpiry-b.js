// test-reseedexpiry-b.js — proof test, arm sim-reseedexpiry-b.
// Proves, on staged fixtures (the 106084 shape: a hunt plan whose
// holder fought beside the killer, competent verbatim, full landed
// substrate, geared parties as a player would have at wave 4 — never
// a fresh un-geared solo scholar):
//   (a) the rumor-pool SNAPSHOT is a faithful replica of the real
//       commit-time pick: on every staged rumor shape, the replica's
//       poolN / firstPick agrees with the REAL winPlanCommitDeadTarget
//       outcome — poolN 0 iff the plan EXPIRES (with the fireside
//       beat), poolN >= 1 iff it RE-SEEEDS onto firstPick. The
//       replica never calls the real pick; the agreement is the
//       proof the survey's pool floor measures what the game does.
//   (b) the ported driver records rumorPool snapshots on depart rows
//       (both paths, all results) and the corpus self-describes the
//       flag + base; the panel build + compare run on the smoke
//       corpora; ALLYSLOT3=1 still refuses.
// §A is staged fixtures driving the real commit + the replica.
// The analyzer's own proof is its selftest
// (scripts/analyze-reseedexpiry-b.js --selftest, §G).
// Usage: node scripts/test-reseedexpiry-b.js
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(__dirname, 'analyze-reseedexpiry-b.js'));
const DRV = require(path.join(__dirname, 'reseedexpiry-driver-b.js'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}

// ---- §A REPLICA FIDELITY (staged fixtures, real commit) ----
globalThis.Scattering = globalThis.Scattering || {};
globalThis.Scattering.Game = globalThis.Scattering.Game || {};
globalThis.Scattering.equipment = {
  armorOf: function (person) { return (person && person._armorP) || 0; },
  weaponBonusOf: function (person) { return (person && person._weaponB) || 0; },
};
require(path.join(REPO, 'src', 'js', 'win-plan.js'));
const Game = globalThis.Scattering.Game;

const MONSTERS = [
  { id: 'herald', wave: 4 }, { id: 'spool', wave: 3 }, { id: 'reunion', wave: 4 },
  { id: 'editor', wave: 5 }, { id: 'eater', wave: 4 }, { id: 'audit', wave: 4 },
  { id: 'suburb', wave: 4 }, { id: 'bulldozer', wave: 1 },
];

function makePeople(spec) {
  const people = {};
  Object.keys(spec).forEach(function (vid) {
    const s = spec[vid];
    people[vid] = { id: vid, name: vid, dead: !!s.dead, _armorP: s.armorP || 0, _weaponB: s.weaponB || 0,
      items: s.items || [], node: s.node || null };
  });
  return people;
}
// Same 106084 shape as test-reseed-b.js reseedCtx, plus the
// rumor-shape options the expiry arm needs: seen (villageLastSeenDay),
// killLog additions, and the expired-plan staging.
// opts: slain, killLog, seen, fought, sightings, needWave, stage,
// target, expired (targetless + stamp).
function expiryCtx(o) {
  const opts = o || {};
  const people = makePeople({
    v1: { node: [5, 5], armorP: 10, weaponB: 5, items: [{ id: 'spear' }] },
    v2: { node: [5, 5], armorP: 10, weaponB: 5, items: [{ id: 'spear' }] },
  });
  const exped = {};
  const says = [];
  const plan = { stage: (opts.stage || 'hunt'), target: (opts.target === undefined ? 'herald' : opts.target),
    needWave: (opts.needWave == null ? 4 : opts.needWave),
    node: { nx: 4, ny: 5 }, party: [], sinceDay: 126, holdSinceDay: -1 };
  if (opts.expired) { plan.target = null; plan.reseedExpiryDay = 136; }
  const ctx = {
    villagerId: 'scholar1',
    data: { items: [{ id: 'spear', weapon: true }, { id: 'knife', weapon: true }], monsters: MONSTERS },
    state: {
      scholar: { day: 136 },
      _standingDeferBeat: {},
      villageSlain: (opts.slain == null ? { herald: 1 } : opts.slain),
      waveKillLog: (opts.killLog === undefined ? [{ by: 'rafael', w: 4, d: 126, mid: 'herald', via: 'agency' }] : opts.killLog),
      village: {
        px: 5, py: 5,
        roster: ['v1', 'v2'],
        trust: { v2: 20 },
        away: {}, sick: {}, health: { v1: 100, v2: 100 },
        winPlan: { v1: plan },
        winPlanStats: null,
        monsterSightings: { v1: (opts.sightings || []) },
      },
    },
    getPerson: function (vid) { return people[vid] || null; },
    vpOf: function (vid) { return people[vid] || null; },
    npcNode: function (vid) { const p = people[vid]; return p && p.node ? { nx: p.node[0], ny: p.node[1] } : null; },
    npcRangeProfile: function () { return 'wanderer'; },
    isEngaged: function () { return false; },
    npcMaxDist: function () { return 3; },
    agencyState: function () { return { exped: exped, know: { v1: { fought: (opts.fought || []) } } }; },
    companionRank: function (asker, ids) {
      return (ids || []).map(function (id) { return { id: id, s: 0 }; }).sort(function (a, b) { return String(a.id).localeCompare(String(b.id)); });
    },
    villagerGearUp: function () { return true; },
    tableActive: function () { return false; },
    waveUnlockReady: function () { return { ready: true, short: [] }; },
    villageKnowsTrick: function () { return true; },
    villagerFightAllies: function () { return []; },
    startExpedition: function (vid, hx, hy, announce, o2) { exped[vid] = { tx: o2.tx, ty: o2.ty, duration: o2.duration }; },
    say: function (line) { says.push(String(line)); },
    disp: function (vid) { return vid === 'v1' ? 'Brian' : vid; },
    monsterNoun: function (id) { return id; },
    articlePhrase: function (n) { return 'a ' + n; },
  };
  ctx.winPlanOf = function (vid) { return Game.winPlanOf.call(ctx, vid); };
  ctx.winPlanCommitDeadTarget = function (vid) { return Game.winPlanCommitDeadTarget.call(ctx, vid); };
  ctx.winPlanNoteSighting = function (mid) { return Game.winPlanNoteSighting.call(ctx, mid); };
  if (opts.seen) ctx.state.villageLastSeenDay = opts.seen;
  return { ctx: ctx, plan: plan, exped: exped, people: people, says: says };
}
function statsOf(ctx) {
  try { return Game.winPlanStats.call(ctx) || {}; } catch (e) { return {}; }
}
function armEnv() {
  process.env.PLANRESEED = '1';
  process.env.FLEEREPAIR2 = '1';
  delete process.env.VETREENGAGE; delete process.env.PARTYSIZE4;
}
function disarmEnv() {
  delete process.env.PLANRESEED; delete process.env.FLEEREPAIR2;
}
// One fidelity case: the replica is read BEFORE the real commit
// (the driver reads it before the departure call, same order), then
// the real commit runs and the two must agree.
function fidelityCase(name, opts, expect) {
  armEnv();
  if (opts.fleerepairOff) delete process.env.FLEEREPAIR2;
  const f = expiryCtx(opts);
  const snap = DRV.rumorPoolSnapshot(f.ctx, 'v1');
  const real = Game.winPlanCommitDeadTarget.call(f.ctx, 'v1');
  const st = statsOf(f.ctx);
  const snapOk = snap && snap.poolN === expect.poolN &&
    snap.firstPick === (expect.firstPick || null) &&
    snap.deadTarget === expect.deadTarget;
  let realOk = false;
  if (expect.outcome === 'expired') {
    realOk = real === 'expired' && f.plan.target === null && f.plan.stage === 'party' &&
      f.plan.reseedExpiryDay === 136 && (st.planExpiries || 0) === 1 &&
      f.says.length === 1 && /put down/.test(f.says[0] || '');
  } else if (expect.outcome === 'reseeded') {
    realOk = real === 'reseeded' && f.plan.target === expect.firstPick &&
      (st.planReseeds || 0) === 1 && f.says.length === 1;
  } else if (expect.outcome === 'held') {
    realOk = real === 'held' && f.plan.target === null && (st.planExpiries || 0) === 0 &&
      f.says.length === 0;
  } else if (expect.outcome === 'null') {
    realOk = real === null;
  }
  check('§A ' + name + ': replica poolN ' + (snap ? snap.poolN : 'null') +
    ' firstPick ' + (snap ? snap.firstPick : 'null') + ' deadTarget ' + (snap ? snap.deadTarget : 'null'),
    snapOk, snap);
  check('§A ' + name + ': real commit ' + real + ' agrees (' + expect.outcome + ')',
    realOk, JSON.stringify({ real: real, target: f.plan.target, stats: st, says: f.says }));
  disarmEnv();
  return { snap: snap, real: real };
}

// A1: no rumors anywhere -> pool 0, EXPIRED with the beat.
fidelityCase('A1 no rumors: pool 0, expired, beat fired',
  { fought: [], sightings: [] },
  { poolN: 0, firstPick: null, deadTarget: true, outcome: 'expired' });
// A2: fought rumor (reunion, wave 4) -> pool [reunion], RE-SEEDED onto it.
fidelityCase('A2 fought reunion: pool 1, reseeded to reunion',
  { fought: ['reunion'] },
  { poolN: 1, firstPick: 'reunion', deadTarget: true, outcome: 'reseeded' });
// A3: fire rumor below the wave floor (spool, wave 3 < needWave 4) -> pool 0, EXPIRED.
fidelityCase('A3 fire spool only (wave 3 < floor 4): pool 0, expired',
  { fought: [], seen: { spool: 130 } },
  { poolN: 0, firstPick: null, deadTarget: true, outcome: 'expired' });
// A4: fire rumor above the floor (editor, wave 5) -> pool [editor], RE-SEEDED.
fidelityCase('A4 fire editor (wave 5): pool 1, reseeded to editor',
  { fought: [], seen: { editor: 130 } },
  { poolN: 1, firstPick: 'editor', deadTarget: true, outcome: 'reseeded' });
// A5: the only other rumor is itself dead (eater slain d130, seen d130 same day) -> pool 0, EXPIRED.
fidelityCase('A5 only rumor is dead (eater slain+seen same day): pool 0, expired',
  { fought: [], slain: { herald: 1, eater: 1 },
    killLog: [{ by: 'rafael', w: 4, d: 126, mid: 'herald', via: 'agency' }, { by: 'x', w: 4, d: 130, mid: 'eater', via: 'agency' }],
    seen: { eater: 130 } },
  { poolN: 0, firstPick: null, deadTarget: true, outcome: 'expired' });
// A6: suburb as the only rumor, FLEEREPAIR2 on -> excluded -> pool 0, EXPIRED.
fidelityCase('A6 suburb only, FLEEREPAIR2 on: excluded, pool 0, expired',
  { fought: [], seen: { suburb: 130 } },
  { poolN: 0, firstPick: null, deadTarget: true, outcome: 'expired' });
// A6b: same, FLEEREPAIR2 off -> suburb IS a rumor -> RE-SEEDED onto it.
fidelityCase('A6b suburb only, FLEEREPAIR2 off: pool 1, reseeded to suburb',
  { fought: [], seen: { suburb: 130 }, fleerepairOff: true },
  { poolN: 1, firstPick: 'suburb', deadTarget: true, outcome: 'reseeded' });
// A7: wave-1-only fought species (bulldozer) -> below the floor -> pool 0, EXPIRED.
fidelityCase('A7 fought bulldozer only (wave 1): pool 0, expired',
  { fought: ['bulldozer'] },
  { poolN: 0, firstPick: null, deadTarget: true, outcome: 'expired' });
// A8: ordering — fought spool (below floor) + fire reunion d120 + editor d130
// -> pool [editor, reunion] (most recent fire first), firstPick editor, RE-SEEDED to editor.
fidelityCase('A8 fought spool + fire reunion d120 + editor d130: pool [editor, reunion], reseeded to editor',
  { fought: ['spool'], seen: { reunion: 120, editor: 130 } },
  { poolN: 2, firstPick: 'editor', deadTarget: true, outcome: 'reseeded' });
// A9: fight memory (audit d125) -> pool [audit], RE-SEEDED.
fidelityCase('A9 memory audit d125: pool 1, reseeded to audit',
  { fought: [], sightings: [{ mid: 'audit', day: 125, tx: 1, ty: 1 }] },
  { poolN: 1, firstPick: 'audit', deadTarget: true, outcome: 'reseeded' });
// A10: expired plan re-attempt, no rumor -> HELD, silent, no bump.
fidelityCase('A10 expired plan, no rumor: HELD silent',
  { fought: [], expired: true },
  { poolN: 0, firstPick: null, deadTarget: false, outcome: 'held' });
// A10b: expired plan re-attempt, rumor arrived -> RE-SEEDED.
fidelityCase('A10b expired plan, rumor arrived: reseeded to reunion',
  { fought: ['reunion'], expired: true },
  { poolN: 1, firstPick: 'reunion', deadTarget: false, outcome: 'reseeded' });
// A11: never-targeted plan (no stamp) -> untouched, commit null.
fidelityCase('A11 never-targeted plan: commit null, untouched',
  { fought: ['reunion'], target: null },
  { poolN: 1, firstPick: 'reunion', deadTarget: false, outcome: 'null' });
// A12: live target (nothing slain) -> commit null; replica says not dead.
fidelityCase('A12 live target (never slain): commit null, deadTarget false',
  { fought: [], slain: {}, killLog: [] },
  { poolN: 0, firstPick: null, deadTarget: false, outcome: 'null' });
// A13: same-day sighting does NOT re-open, but a LATER sighting does:
// herald slain d126, seen d130 -> live -> commit null; replica agrees.
// (The target itself is never a pool candidate, so poolN is 0 even
// though the herald is live — the pool counts RE-SEEDABLE rumors.)
fidelityCase('A13 post-kill sighting d130 re-opens herald: commit null, deadTarget false',
  { fought: [], seen: { herald: 130 } },
  { poolN: 0, firstPick: null, deadTarget: false, outcome: 'null' });
// A14: the replica's pool order is pick order — fought first, then
// memories, then fire: fought eater + memory audit + fire editor
// (all live, all >= floor) -> [eater, audit, editor], firstPick eater.
(function () {
  armEnv();
  const f = expiryCtx({ fought: ['eater'], sightings: [{ mid: 'audit', day: 125, tx: 1, ty: 1 }], seen: { editor: 130 } });
  const snap = DRV.rumorPoolSnapshot(f.ctx, 'v1');
  check('§A A14 pool order is fought, then memories, then fire: [eater, audit, editor]',
    snap && snap.poolN === 3 && snap.pool.join(',') === 'eater,audit,editor' && snap.firstPick === 'eater', snap);
  const real = Game.winPlanCommitDeadTarget.call(f.ctx, 'v1');
  check('§A A14 real commit reseeds onto the first pick (eater)',
    real === 'reseeded' && f.plan.target === 'eater', JSON.stringify({ real: real, target: f.plan.target }));
  disarmEnv();
})();
// A15: replica exports exist and the liveness helper agrees with the
// real rule on the dead/live shapes above.
check('§A driver exports rumorPoolSnapshot + rumorPoolDeadByType',
  typeof DRV.rumorPoolSnapshot === 'function' && typeof DRV.rumorPoolDeadByType === 'function', null);
(function () {
  armEnv();
  const dead = expiryCtx({});
  const live = expiryCtx({ seen: { herald: 130 } });
  check('§A liveness helper: slain+no-sighting-since = dead; post-kill sighting = live',
    DRV.rumorPoolDeadByType(dead.ctx, 'herald') === true &&
    DRV.rumorPoolDeadByType(live.ctx, 'herald') === false &&
    DRV.rumorPoolDeadByType(dead.ctx, 'never-seen') === false, null);
  disarmEnv();
})();

// ---- §B DRIVER SMOKE + PANEL (subprocess) ----
(function sectionB() {
  const { spawnSync } = require('child_process');
  const smokeDirCtl = 'perseed-reseedexpiry-b-smoke-ctl';
  const smokeDirArm = 'perseed-reseedexpiry-b-smoke-arm';
  const baseEnv = { SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1',
    FLEEREPAIR2: '1', FIGHTALLY2: '1', MODE: 'reseedexpiry', DAYS: '30',
    SEEDS: '106301' };
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', smokeDirCtl), { recursive: true, force: true }); } catch (e) {}
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', smokeDirArm), { recursive: true, force: true }); } catch (e) {}
  const envArm = Object.assign({}, process.env, baseEnv, { PLANRESEED: '1', RUN: 'reseedexpiry-b-106301-armed', OUTDIR: smokeDirArm });
  delete envArm.ALLYSLOT3; delete envArm.LAUNCHSURVIVE;
  const ra = spawnSync(process.execPath, [path.join(__dirname, 'reseedexpiry-driver-b.js')],
    { cwd: REPO, env: envArm, encoding: 'utf8', timeout: 600000 });
  check('§B armed driver smoke: exit 0 on one 30d seed', ra.status === 0, (ra.stderr || '').slice(0, 300));
  let dd = null;
  try { dd = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-20', smokeDirArm, 'reseedexpiry-b-s106301-reseedexpiry-b-106301-armed-reseedexpiry.json'), 'utf8')); } catch (e) {}
  check('§B armed driver smoke: corpus file written', !!dd, null);
  if (dd) {
    check('§B armed smoke: corpus self-describes the flag (planreseedFlag 1, leverPresent false)',
      dd.planreseedFlag === '1' && dd.leverPresent === false && dd.allyslot3Flag == null,
      { planreseedFlag: dd.planreseedFlag, leverPresent: dd.leverPresent });
    check('§B armed smoke: 0 instrument errors', (dd.instrumentErrors || []).length === 0, dd.instrumentErrors);
    check('§B armed smoke: winPlanStats carries planReseeds + planExpiries',
      dd.winPlanStats && ('planReseeds' in dd.winPlanStats) && ('planExpiries' in dd.winPlanStats),
      dd.winPlanStats ? Object.keys(dd.winPlanStats) : null);
    check('§B armed smoke: arm label is reseedexpiry-b', dd.arm === 'reseedexpiry-b', dd.arm);
    const departs = dd.v4departs || [];
    const withPool = departs.filter(function (x) { return x.rumorPool && typeof x.rumorPool.poolN === 'number' && typeof x.rumorPool.deadTarget === 'boolean'; });
    check('§B armed smoke: every v4departs row carries a rumorPool snapshot (' + withPool.length + '/' + departs.length + ' rows)',
      departs.length === 0 || withPool.length === departs.length, { rows: departs.length, withPool: withPool.length });
    const dawnRows = (dd.dawnbidDeparts || []).filter(function (x) { return x.rumorPool; });
    check('§B armed smoke: dawnbidDeparts rows carry rumorPool snapshots (' + dawnRows.length + ' rows)',
      (dd.dawnbidDeparts || []).length === 0 || dawnRows.length === (dd.dawnbidDeparts || []).length,
      { rows: (dd.dawnbidDeparts || []).length, withPool: dawnRows.length });
    const an = AN.analyzeFile(dd);
    check('§B armed smoke: analyzer reads the smoke corpus (launches ' + an.launches + ', gate mismatches ' + an.gateMismatch + ')',
      an.gateMismatch === 0, { launches: an.launches, gateMissing: an.gateMissing, gateMismatch: an.gateMismatch });
    const dc = AN.deadCommitsOf(dd);
    const pf = AN.poolFloorStats(dc);
    check('§B armed smoke: dead-commit + pool-floor functions run on the smoke corpus (dead commits ' + dc.length + ', floor min ' + pf.min + ')',
      Array.isArray(dc) && pf && typeof pf === 'object', { deadCommits: dc.length, poolFloor: pf });
  }
  // Control smoke (flag unset) + panel build + compare on the two smoke dirs.
  const envCtl = Object.assign({}, process.env, baseEnv, { RUN: 'reseedexpiry-b-106301-control', OUTDIR: smokeDirCtl });
  delete envCtl.ALLYSLOT3; delete envCtl.LAUNCHSURVIVE; delete envCtl.PLANRESEED;
  const rc = spawnSync(process.execPath, [path.join(__dirname, 'reseedexpiry-driver-b.js')],
    { cwd: REPO, env: envCtl, encoding: 'utf8', timeout: 600000 });
  check('§B control driver smoke: exit 0 on one 30d seed', rc.status === 0, (rc.stderr || '').slice(0, 300));
  let dc2 = null;
  try { dc2 = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-20', smokeDirCtl, 'reseedexpiry-b-s106301-reseedexpiry-b-106301-control-reseedexpiry.json'), 'utf8')); } catch (e) {}
  check('§B control smoke: corpus file written, flag null',
    !!dc2 && dc2.planreseedFlag == null, dc2 ? dc2.planreseedFlag : null);
  if (dc2 && dd) {
    const rb = spawnSync(process.execPath, [path.join(__dirname, 'build-reseedexpiry-b-panels.js'),
      '--before', path.join('evidence', '2026-11-20', smokeDirCtl),
      '--after', path.join('evidence', '2026-11-20', smokeDirArm),
      '--out', path.join('evidence', '2026-11-20', 'reseedexpiry-b-smoke-panel'),
      '--seeds', '106301', '--before-seeds', '106301',
      '--run-before', 'reseedexpiry-b-106301-control', '--run-after', 'reseedexpiry-b-106301-armed'],
    { cwd: REPO, encoding: 'utf8', timeout: 120000 });
    check('§B panel build on the two smoke corpora: exit 0', rb.status === 0, (rb.stderr || '').slice(0, 300));
    const rp = spawnSync(process.execPath, [path.join(__dirname, 'balance-panel.js'), 'compare',
      '--before', path.join('evidence', '2026-11-20', 'reseedexpiry-b-smoke-panel-before.json.gz'),
      '--after', path.join('evidence', '2026-11-20', 'reseedexpiry-b-smoke-panel-after.json.gz'),
      '--out', path.join('evidence', '2026-11-20', 'reseedexpiry-b-smoke-panel')],
    { cwd: REPO, encoding: 'utf8', timeout: 120000 });
    const panelMd = path.join(REPO, 'evidence', '2026-11-20', 'reseedexpiry-b-smoke-panel.md');
    check('§B balance-panel compare on the smoke panels: writes the .md (exit 0 or 2, decision printed)',
      (rp.status === 0 || rp.status === 2) && fs.existsSync(panelMd) && /review_required|no_material_signal|material_signal/.test(rp.stdout || ''),
      { status: rp.status, out: (rp.stdout || '').slice(0, 120), mdExists: fs.existsSync(panelMd) });
  }
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', smokeDirCtl), { recursive: true, force: true }); } catch (e) {}
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', smokeDirArm), { recursive: true, force: true }); } catch (e) {}
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', 'reseedexpiry-b-smoke-panel-before.json.gz'), { force: true }); } catch (e) {}
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', 'reseedexpiry-b-smoke-panel-after.json.gz'), { force: true }); } catch (e) {}
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', 'reseedexpiry-b-smoke-panel.md'), { force: true }); } catch (e) {}
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', 'reseedexpiry-b-smoke-panel.json'), { force: true }); } catch (e) {}

  // Guard: ALLYSLOT3=1 must refuse before any sim runs.
  const envGuard = Object.assign({}, process.env, baseEnv, { ALLYSLOT3: '1', DAYS: '1',
    RUN: 'reseedexpiry-guard', OUTDIR: 'perseed-reseedexpiry-b-guard' });
  const rg = spawnSync(process.execPath, [path.join(__dirname, 'reseedexpiry-driver-b.js')],
    { cwd: REPO, env: envGuard, encoding: 'utf8', timeout: 120000 });
  check('§B guard: ALLYSLOT3=1 refuses (exit 2, landed substrate only)',
    rg.status === 2 && /ALLYSLOT3 must be unset/.test(rg.stderr || ''), { status: rg.status, err: (rg.stderr || '').slice(0, 160) });
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', 'perseed-reseedexpiry-b-guard'), { recursive: true, force: true }); } catch (e) {}
})();

function finish() {
  console.log('test-reseedexpiry-b: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed === 0 ? 0 : 1);
}

// ---- §C LIVE 150d REPRODUCTION (seed 106081, the known re-seed pair) ----
// The reseed arm's armed 106081 produced exactly 2 re-seed commits
// (Frieda + Chantal, herald->reunion d119) and 0 expiries. This
// section replays that seed through the EXPIRY driver at the judged
// horizon and pins the pool snapshot against it: the dead commits
// must be found, their pools must be the reason no expiry fired,
// and the replica must agree with the game (0 disagreements).
(function sectionC() {
  const { spawnSync } = require('child_process');
  const smokeDir = 'perseed-reseedexpiry-b-smoke150';
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', smokeDir), { recursive: true, force: true }); } catch (e) {}
  const env = Object.assign({}, process.env,
    { SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1', FLEEREPAIR2: '1', FIGHTALLY2: '1',
      PLANRESEED: '1', MODE: 'reseedexpiry', DAYS: '150', SEEDS: '106081',
      RUN: 'reseedexpiry-b-smoke150', OUTDIR: smokeDir });
  delete env.ALLYSLOT3; delete env.LAUNCHSURVIVE;
  const r = spawnSync(process.execPath, [path.join(__dirname, 'reseedexpiry-driver-b.js')],
    { cwd: REPO, env: env, encoding: 'utf8', timeout: 600000 });
  check('§C 150d armed run on seed 106081: exit 0', r.status === 0, (r.stderr || '').slice(0, 300));
  let dd = null;
  try { dd = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-20', smokeDir, 'reseedexpiry-b-s106081-reseedexpiry-b-smoke150-reseedexpiry.json'), 'utf8')); } catch (e) {}
  check('§C 150d corpus written, 0 instrument errors', !!dd && (dd.instrumentErrors || []).length === 0, dd ? dd.instrumentErrors : null);
  if (dd) {
    check('§C game stats reproduce the reseed arm (planReseeds 2, planExpiries 0)',
      dd.winPlanStats && dd.winPlanStats.planReseeds === 2 && dd.winPlanStats.planExpiries === 0,
      dd.winPlanStats ? { planReseeds: dd.winPlanStats.planReseeds, planExpiries: dd.winPlanStats.planExpiries } : null);
    const dc = AN.deadCommitsOf(dd);
    check('§C deadCommitsOf finds the 106081 pair (2 dead commits, d119, herald, both holders)',
      dc.length === 2 && dc.every(function (c) { return c.day === 119 && c.target === 'herald'; }) &&
      dc.map(function (c) { return c.vid; }).sort().join(',') === 'chantal_mukendi,gen_l19ie5f',
      dc.map(function (c) { return c.day + ':' + c.vid + ':' + c.poolN; }));
    const pf = AN.poolFloorStats(dc);
    check('§C pool floor on the pair is min 7 (the reason no expiry fired: rumor-rich, not rumor-poor)',
      pf.min === 7 && pf.median === 7, pf);
    check('§C both dead commits re-seeded onto the replica firstPick (reunion)',
      dc.every(function (c) { return c.firstPick === 'reunion' && c.result === 'launch' && c.targetAfter === 'reunion'; }),
      dc.map(function (c) { return c.firstPick + '->' + c.targetAfter; }));
    const pd = AN.poolDisagreements(dd, dc);
    check('§C replica-vs-real disagreements 0 on the live pair', pd.length === 0, pd);
    const ex = AN.expiriesOf(dd);
    check('§C expiriesOf finds 0 on the pair (matches planExpiries 0)', ex.length === 0, ex);
    const an = AN.analyzeFile(dd);
    check('§C analyzer gate cross-check 0 mismatches on the live corpus',
      an.gateMismatch === 0 && an.gateMissing === 0, { missing: an.gateMissing, mismatch: an.gateMismatch });
  }
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', smokeDir), { recursive: true, force: true }); } catch (e) {}
  finish();
})();
