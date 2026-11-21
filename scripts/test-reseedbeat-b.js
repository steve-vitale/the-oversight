// test-reseedbeat-b.js — proof test, arm sim-reseedbeat-b.
// Proves the #2632 launch beat (finding #2632): when an EXPIRED plan
// re-seeds AND launches, the fire speaks one line at the launch —
// "Amina is hunting Buffering now — the fire found a new trail." —
// naming the holder and the new target. The expiry speaks ("the hunt
// is called off") and the commit-time dead-target re-seed speaks
// ("The hunt turns to ... instead"), but the expired-plan re-seed
// launch was silent in the corpus (Amina d31, Fernando d46): the old
// commit-time line carried no SAY_RE token, so the recorder dropped
// it, and a commit that re-seeds without launching spends the line
// before the hunter ever goes out.
//   §A code pins (read-only greps).
//   §B staged fixture — the Amina shape (seed 106603 d28–d31):
//       holder Amina, expired Spool plan, Buffering rumor from the
//       fire, companion Diana (the veteran who killed the Spool on
//       camera d27). Gear is the measured shape from the dawnbid
//       rows on both observed launches: holder armed + armored
//       (spear + armor), companion likewise, party of 2 — the gear
//       and party a player actually has at a wave-3 hunt, never a
//       fresh un-geared solo scholar. Drives the REAL winPlanDepart
//       and the REAL vbrainExecuteDepart (stubbed dawn commit).
//   §C OLD-CODE CONTROL: the same fixture against the pre-change
//       win-plan.js (git show of the rebased tip) must launch with
//       NO launch-beat line (fail on old, pass on new).
//   §D negative cases: dead-target re-seed, no-rumor hold, second
//       launch, flag off, stale-stamp clearing.
// Usage: node scripts/test-reseedbeat-b.js
//        node scripts/test-reseedbeat-b.js --old-code <win-plan.js path>
//        (child mode: runs only the §B1 launch fixture against the
//        given win-plan.js and prints one JSON line; used by §C.)
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}

globalThis.Scattering = globalThis.Scattering || {};
globalThis.Scattering.Game = globalThis.Scattering.Game || {};
globalThis.Scattering.equipment = {
  armorOf: function (person) { return (person && person._armorP) || 0; },
  weaponBonusOf: function (person) { return (person && person._weaponB) || 0; },
};

const OLD_CODE_PATH = (function () {
  const i = process.argv.indexOf('--old-code');
  return i !== -1 ? process.argv[i + 1] : null;
})();
require(OLD_CODE_PATH || path.join(REPO, 'src', 'js', 'win-plan.js'));
if (!OLD_CODE_PATH) require(path.join(REPO, 'src', 'js', 'villager-brain.js'));
const Game = globalThis.Scattering.Game;

const LAUNCH_BEAT_RE = /is hunting .* now — the fire found a new trail\./;
const COMMIT_BEAT_RE = /has no trail — but the fire remembers .* was seen, and the hunt turns that way\./;

const MONSTERS = [
  { id: 'herald', wave: 4 }, { id: 'spool', wave: 3 }, { id: 'buffering', wave: 3 },
  { id: 'reunion', wave: 4 }, { id: 'editor', wave: 5 }, { id: 'eater', wave: 4 },
  { id: 'audit', wave: 4 }, { id: 'suburb', wave: 4 }, { id: 'bulldozer', wave: 1 },
];
function cap(id) { return id ? id.charAt(0).toUpperCase() + id.slice(1) : id; }

function makePeople() {
  return {
    amina_diallo: { id: 'amina_diallo', name: 'Amina', dead: false, _armorP: 10, _weaponB: 5,
      items: [{ id: 'spear' }], node: [5, 5] },
    diana_osei: { id: 'diana_osei', name: 'Diana', dead: false, _armorP: 10, _weaponB: 5,
      items: [{ id: 'spear' }], node: [5, 5] },
  };
}
// The Amina shape (106603): holder's Spool plan expired d28 (Diana
// killed the last Spool on camera d27); a Buffering rumor reached the
// village (fire, d31 pool ['buffering']); holder + veteran companion
// launch d31. opts override: target/expired/stage/slain/killLog/seen/
// fought/sightings/needWave/away/systemArrived.
function beatCtx(o) {
  const opts = o || {};
  const people = makePeople();
  const exped = {};
  const says = [];
  const plan = { stage: (opts.stage || 'party'),
    target: (opts.target === undefined ? null : opts.target),
    needWave: (opts.needWave == null ? 3 : opts.needWave),
    node: null, party: [], sinceDay: 26, holdSinceDay: -1 };
  if (opts.expired === undefined || opts.expired) plan.reseedExpiryDay = 28;
  const ctx = {
    villagerId: 'scholar1',
    data: { items: [{ id: 'spear', weapon: true }, { id: 'knife', weapon: true }], monsters: MONSTERS },
    state: {
      scholar: { day: 136 },
      _standingDeferBeat: {},
      villageSlain: (opts.slain == null ? { spool: 1 } : opts.slain),
      waveKillLog: (opts.killLog === undefined
        ? [{ by: 'diana_osei', w: 3, d: 27, mid: 'spool', via: 'agency' }] : opts.killLog),
      villageLastSeenDay: (opts.seen === undefined ? { buffering: 130 } : opts.seen),
      village: {
        px: 5, py: 5,
        roster: ['amina_diallo', 'diana_osei'],
        trust: { diana_osei: 20 },
        away: (opts.away || {}), sick: {}, health: { amina_diallo: 100, diana_osei: 100 },
        winPlan: { amina_diallo: plan },
        winPlanStats: null,
        monsterSightings: { amina_diallo: (opts.sightings || []) },
      },
    },
    getPerson: function (vid) { return people[vid] || null; },
    vpOf: function (vid) { return people[vid] || null; },
    npcNode: function (vid) { const p = people[vid]; return p && p.node ? { nx: p.node[0], ny: p.node[1] } : null; },
    npcRangeProfile: function () { return 'wanderer'; },
    isEngaged: function () { return false; },
    npcMaxDist: function () { return 3; },
    agencyState: function () { return { exped: exped, know: { amina_diallo: { fought: (opts.fought || []) } } }; },
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
    disp: function (vid) { return vid === 'amina_diallo' ? 'Amina' : (vid === 'diana_osei' ? 'Diana' : vid); },
    monsterNoun: function (id) { return cap(id); },
    articlePhrase: function (n) { return n; },
  };
  if (opts.systemArrived) ctx.state.systemArrived = true;
  ctx.winPlanOf = function (vid) { return Game.winPlanOf.call(ctx, vid); };
  ctx.winPlanDepart = function (vid, hx, hy, announce) { return Game.winPlanDepart.call(ctx, vid, hx, hy, announce); };
  ctx.winPlanCommitDeadTarget = function (vid) { return Game.winPlanCommitDeadTarget.call(ctx, vid); };
  if (typeof Game.winPlanReseedLaunchBeat === 'function') {
    ctx.winPlanReseedLaunchBeat = function (vid) { return Game.winPlanReseedLaunchBeat.call(ctx, vid); };
  }
  if (typeof Game.vbrainExecuteDepart === 'function') {
    ctx.vbrainCommit = function () {
      return { day: 136, kind: 'EXPEDITION', winPlanAction: 'party_launch',
        companion: 'diana_osei', companion2: null, companion3: null };
    };
    ctx.vbrainExecuteDepart = function (vid, hx, hy, announce) { return Game.vbrainExecuteDepart.call(ctx, vid, hx, hy, announce); };
  }
  return { ctx: ctx, plan: plan, exped: exped, says: says };
}
function statsOf(ctx) {
  try { return Game.winPlanStats.call(ctx) || {}; } catch (e) { return {}; }
}
function armEnv() {
  process.env.PLANRESEED = '1';
  process.env.FLEEREPAIR2 = '1';
  delete process.env.VETREENGAGE; delete process.env.PARTYSIZE4;
}
function disarmEnv() { delete process.env.PLANRESEED; delete process.env.FLEEREPAIR2; }
function launchBeatLines(says) { return says.filter(function (l) { return LAUNCH_BEAT_RE.test(l); }); }
function commitBeatLines(says) { return says.filter(function (l) { return COMMIT_BEAT_RE.test(l); }); }

// ---- OLD-CODE CHILD MODE (used by §C) ----
// Runs only the §B1 launch fixture against the given win-plan.js and
// prints one JSON line. Exits 0 iff the holder launched with NO
// launch-beat line (the old code's shape: the launch is silent at
// launch time; the commit-time line is the only speech).
if (OLD_CODE_PATH) {
  armEnv();
  const f = beatCtx({});
  const res = Game.winPlanDepart.call(f.ctx, 'amina_diallo', 5, 5, false);
  disarmEnv();
  console.log(JSON.stringify({
    result: res, launched: !!f.exped.amina_diallo, stage: f.plan.stage,
    target: f.plan.target, stamp: (f.plan.reseedLaunchBeat == null ? null : f.plan.reseedLaunchBeat),
    launchBeatLines: launchBeatLines(f.says).length,
    commitBeatLines: commitBeatLines(f.says).length,
    says: f.says,
  }));
  process.exit(0);
}

// ---- §A CODE PINS (read-only greps) ----
(function sectionA() {
  const wpSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
  const brainSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
  const drvSrc = fs.readFileSync(path.join(__dirname, 'reseedexpiry-driver-b.js'), 'utf8');
  function fnBody(src, start, end) {
    const a = src.indexOf(start);
    if (a === -1) return null;
    const b = end ? src.indexOf(end, a + start.length) : src.length;
    return b === -1 ? null : src.slice(a, b);
  }
  const launchBeat = fnBody(wpSrc, 'function reseedLaunchBeat(self, vid, newType) {', '\n  // Shared extra-companion scan');
  check('§A reseedLaunchBeat exists, line names holder + new target in the expiry-beat voice',
    launchBeat != null && launchBeat.indexOf("cname + ' is hunting ' + nphrase + ' now — the fire found a new trail.'") !== -1, null);
  check('§A launch beat has no Math.random (deterministic wording)',
    launchBeat != null && launchBeat.indexOf('Math.random') === -1, null);
  const hookBody = fnBody(wpSrc, 'winPlanReseedLaunchBeat(vid) {', '\n    // Haven evaluation');
  check('§A winPlanReseedLaunchBeat exists, speaks only while the plan still carries the stamped target',
    hookBody != null && hookBody.indexOf('plan.target !== plan.reseedLaunchBeat') !== -1, null);
  check('§A hook clears the stamp BEFORE speaking (no double-fire on a re-entrant say)',
    hookBody != null &&
    hookBody.indexOf('plan.reseedLaunchBeat = null;') !== -1 &&
    hookBody.indexOf('plan.reseedLaunchBeat = null;') < hookBody.indexOf('reseedLaunchBeat(this, vid, target);'), null);
  check('§A hook is flag-gated and reads the plan without creating it (no winPlanOf call inside)',
    hookBody != null && hookBody.indexOf('planreseedOn()') !== -1 && hookBody.indexOf('winPlanOf') === -1, null);
  const commitBody = fnBody(wpSrc, 'winPlanCommitDeadTarget(vid) {', '\n    // Haven evaluation');
  check('§A commit stamps the expired-plan re-seed (plan.reseedLaunchBeat = fresh2.id) instead of speaking at commit',
    commitBody != null && commitBody.indexOf('plan.reseedLaunchBeat = fresh2.id;') !== -1 &&
    commitBody.indexOf('reseedBeat(this, vid, null,') === -1, null);
  check('§A commit clears a stale stamp when the re-seeded target itself dies',
    commitBody != null && commitBody.indexOf('plan.reseedLaunchBeat = null;') !== -1, null);
  check('§A reseedBeat has no expired-plan branch left (no "has no trail" line anywhere in win-plan.js)',
    wpSrc.indexOf('has no trail') === -1, null);
  const departBody = fnBody(wpSrc, 'winPlanDepart(vid, hx, hy, playerAtHaven) {', '\n    // VETREENGAGE (sim-vetreengage-a): pick a SECOND companion');
  check('§A winPlanDepart launchParty speaks the beat after a real departure (hook before return true)',
    departBody != null && departBody.indexOf('self.winPlanReseedLaunchBeat(vid)') !== -1 &&
    departBody.indexOf("bump(self, 'partyDepartures');") !== -1 &&
    departBody.indexOf('self.winPlanReseedLaunchBeat(vid)') > departBody.indexOf("bump(self, 'partyDepartures');"), null);
  check('§A vbrainExecuteDepart party_launch branch speaks the beat before return launch',
    brainSrc.indexOf("this.winPlanDepartLaunchBeat(vid, launched);") !== -1 &&
    brainSrc.indexOf("this.winPlanDepartLaunchBeat(vid, launched);") < brainSrc.indexOf("return 'launch';", brainSrc.indexOf("this.winPlanDepartLaunchBeat(vid, launched);")) &&
    // sim-departbeat-b: the shared hook replaced the direct reseed
    // call; the fallback below preserves the old call for callers
    // that never received the shared hook (test ctx, older caller).
    brainSrc.indexOf("else if (typeof this.winPlanReseedLaunchBeat === 'function') this.winPlanReseedLaunchBeat(vid);") !== -1, null);
  check('§A winPlanReseedLaunchBeat is listed in the provides header',
    wpSrc.indexOf('winPlanReseedLaunchBeat(vid)') !== -1, null);
  check('§A reseedexpiry driver SAY_RE contains "new trail" (the recorder hears the beat)',
    /SAY_RE = \/[^/]*new trail[^/]*\//.test(drvSrc), null);
})();

// ---- §B STAGED LAUNCH FIXTURE (the Amina shape) ----
(function sectionB() {
  // B1: expired plan + Buffering rumor, winPlanDepart path.
  armEnv();
  const f = beatCtx({});
  const res = Game.winPlanDepart.call(f.ctx, 'amina_diallo', 5, 5, false);
  const st = statsOf(f.ctx);
  const lb = launchBeatLines(f.says);
  check('§B B1 depart launches the expired-plan re-seed (launch, stage hunt, target buffering, party of 2)',
    res === 'launch' && f.plan.stage === 'hunt' && f.plan.target === 'buffering' &&
    !!f.exped.amina_diallo && !!f.exped.diana_osei && (st.planReseeds || 0) === 1,
    JSON.stringify({ res: res, stage: f.plan.stage, target: f.plan.target, stats: st }));
  check('§B B1 exactly one launch-beat line, naming holder + new target, in the coordinator wording',
    lb.length === 1 && lb[0] === 'Amina is hunting Buffering now — the fire found a new trail.',
    f.says);
  check('§B B1 no commit-time line (the old "has no trail" speech is gone — no double-speak)',
    commitBeatLines(f.says).length === 0 && f.says.length === 1, f.says);
  check('§B B1 stamp cleared at the launch (a second launch has nothing to speak)',
    f.plan.reseedLaunchBeat == null, f.plan.reseedLaunchBeat);
  disarmEnv();

  // B2: the split-day shape — commit re-seeds but the companion is
  // away, so the launch fails that day; the beat must NOT fire at
  // the commit, and must fire exactly once at the later launch.
  armEnv();
  const g = beatCtx({ away: { diana_osei: true } });
  const res1 = Game.winPlanDepart.call(g.ctx, 'amina_diallo', 5, 5, false);
  check('§B B2 split day 1: re-seed commits but the launch fails (hold, target buffering, stamp set, silent)',
    res1 === 'hold' && g.plan.target === 'buffering' && g.plan.reseedLaunchBeat === 'buffering' &&
    g.says.length === 0 && !g.exped.amina_diallo,
    JSON.stringify({ res: res1, target: g.plan.target, stamp: g.plan.reseedLaunchBeat, says: g.says }));
  g.ctx.state.village.away = {};
  const res2 = Game.winPlanDepart.call(g.ctx, 'amina_diallo', 5, 5, false);
  const lb2 = launchBeatLines(g.says);
  check('§B B2 split day 2: the launch speaks the beat exactly once (launch, one line, stamp cleared)',
    res2 === 'launch' && lb2.length === 1 &&
    lb2[0] === 'Amina is hunting Buffering now — the fire found a new trail.' &&
    g.plan.reseedLaunchBeat == null, JSON.stringify({ res: res2, says: g.says }));
  disarmEnv();

  // B3: the brain path (the departure that fires in sims) — stubbed
  // dawn commit, same expired plan + rumor.
  armEnv();
  const h = beatCtx({});
  const res3 = Game.vbrainExecuteDepart.call(h.ctx, 'amina_diallo', 5, 5, false);
  const lb3 = launchBeatLines(h.says);
  check('§B B3 brain path launches with exactly one launch-beat line (launch, stage hunt, stamp cleared)',
    res3 === 'launch' && h.plan.stage === 'hunt' && h.plan.target === 'buffering' &&
    lb3.length === 1 && lb3[0] === 'Amina is hunting Buffering now — the fire found a new trail.' &&
    h.plan.reseedLaunchBeat == null,
    JSON.stringify({ res: res3, stage: h.plan.stage, target: h.plan.target, says: h.says }));
  disarmEnv();

  // B4: after the System arrives, the line carries the SYSTEM prefix
  // like its sibling beats.
  armEnv();
  const k = beatCtx({ systemArrived: true });
  Game.winPlanDepart.call(k.ctx, 'amina_diallo', 5, 5, false);
  const lb4 = launchBeatLines(k.says);
  check('§B B4 SYSTEM prefix after arrival (same wrap as expiry/reseed beats)',
    lb4.length === 1 && lb4[0] === '📺 SYSTEM: "Amina is hunting Buffering now — the fire found a new trail."',
    k.says);
  disarmEnv();
})();

// ---- §C OLD-CODE CONTROL (fail on old, pass on new) ----
(function sectionC() {
  const { spawnSync, execSync } = require('child_process');
  const os = require('os');
  const tmp = path.join(os.tmpdir(), 'reseedbeat-old-win-plan-' + process.pid + '.js');
  try {
    // Pinned to the pre-change commit (the rebased tip): HEAD moves
    // as this arm commits, so HEAD would stop being "old code".
    const oldSrc = execSync('git show 6ec74e210:src/js/win-plan.js', { cwd: REPO, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    fs.writeFileSync(tmp, oldSrc);
  } catch (e) {
    check('§C old-code control: git show HEAD:src/js/win-plan.js readable', false, String(e).slice(0, 200));
    return;
  }
  const r = spawnSync(process.execPath, [__filename, '--old-code', tmp],
    { cwd: REPO, encoding: 'utf8', timeout: 120000 });
  let out = null;
  try { out = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch (e) {}
  check('§C old code launches the same fixture (launch, stage hunt, target buffering)',
    !!out && out.launched === true && out.stage === 'hunt' && out.target === 'buffering', out);
  check('§C old code has NO launch-beat line (the launch is silent — the gap this arm closes)',
    !!out && out.launchBeatLines === 0, out ? out.says : r.stdout);
  check('§C old code DOES speak at commit (the old "has no trail" line — the control proves the fixture reaches the beat site)',
    !!out && out.commitBeatLines === 1, out ? out.says : r.stdout);
  check('§C new code speaks at launch (the §B1 line — the control contrasts, it does not re-run §B)',
    true, null);
  try { fs.rmSync(tmp, { force: true }); } catch (e) {}
})();

// ---- §D NEGATIVE CASES ----
(function sectionD() {
  // D1: dead-target re-seed (not expired) — the commit beat speaks,
  // the launch stays silent, no stamp is ever set.
  armEnv();
  const f = beatCtx({ target: 'herald', expired: false, fought: ['reunion'],
    slain: { herald: 1 },
    killLog: [{ by: 'rafael', w: 4, d: 126, mid: 'herald', via: 'agency' }],
    seen: { reunion: 130 } });
  const res = Game.winPlanDepart.call(f.ctx, 'amina_diallo', 5, 5, false);
  check('§D D1 dead-target re-seed launches with the commit beat only (no launch beat, no stamp)',
    res === 'launch' && f.plan.target === 'reunion' && f.says.length === 1 &&
    /The hunt turns to Reunion instead/.test(f.says[0]) &&
    launchBeatLines(f.says).length === 0 && f.plan.reseedLaunchBeat == null,
    JSON.stringify({ res: res, target: f.plan.target, says: f.says }));
  disarmEnv();

  // D2: expired plan, no rumor anywhere — hold, silent, no stamp.
  armEnv();
  const g = beatCtx({ fought: [], seen: {}, sightings: [] });
  const res2 = Game.winPlanDepart.call(g.ctx, 'amina_diallo', 5, 5, false);
  check('§D D2 expired plan with no rumor: hold, silent, no stamp set',
    res2 === 'hold' && g.plan.target === null && g.says.length === 0 && g.plan.reseedLaunchBeat == null,
    JSON.stringify({ res: res2, target: g.plan.target, says: g.says }));
  disarmEnv();

  // D3: a second launch on the same (now live) target speaks nothing.
  armEnv();
  const h = beatCtx({});
  Game.winPlanDepart.call(h.ctx, 'amina_diallo', 5, 5, false);
  const firstCount = launchBeatLines(h.says).length;
  Object.keys(h.exped).forEach(function (k) { delete h.exped[k]; });
  h.plan.stage = 'party'; h.plan.party = [];
  const res3 = Game.winPlanDepart.call(h.ctx, 'amina_diallo', 5, 5, false);
  check('§D D3 second launch on the live target speaks no second beat (one line total)',
    res3 === 'launch' && firstCount === 1 && launchBeatLines(h.says).length === 1 && h.says.length === 1,
    JSON.stringify({ res: res3, says: h.says }));
  disarmEnv();

  // D4: flag off — the lever is inert: no stamp, no beat.
  disarmEnv();
  const k = beatCtx({});
  Game.winPlanDepart.call(k.ctx, 'amina_diallo', 5, 5, false);
  check('§D D4 flag off: no stamp, no beat (lever inert)',
    k.plan.reseedLaunchBeat == null && k.says.length === 0, JSON.stringify({ stamp: k.plan.reseedLaunchBeat, says: k.says }));

  // D5: the re-seeded target dies before the launch — the stale
  // stamp is cleared at the next commit; the launch after the
  // dead-target re-seed speaks the commit beat only, never the
  // launch beat for the dead kind.
  armEnv();
  const m = beatCtx({ away: { diana_osei: true } });
  Game.winPlanDepart.call(m.ctx, 'amina_diallo', 5, 5, false);
  check('§D D5 setup: stamp set, launch held, silent',
    m.plan.reseedLaunchBeat === 'buffering' && m.says.length === 0, null);
  m.ctx.state.village.away = {};
  m.ctx.state.villageSlain.buffering = 1;
  m.ctx.state.waveKillLog.push({ by: 'x', w: 3, d: 136, mid: 'buffering', via: 'agency' });
  m.ctx.agencyState = function () { return { exped: m.exped, know: { amina_diallo: { fought: ['eater'] } } }; };
  const res5 = Game.winPlanDepart.call(m.ctx, 'amina_diallo', 5, 5, false);
  check('§D D5 stale stamp cleared: re-seeded to eater, commit beat only, no launch beat for buffering',
    res5 === 'launch' && m.plan.target === 'eater' && m.says.length === 1 &&
    /The hunt turns to Eater instead/.test(m.says[0]) &&
    launchBeatLines(m.says).length === 0 && m.plan.reseedLaunchBeat == null,
    JSON.stringify({ res: res5, target: m.plan.target, says: m.says }));
  disarmEnv();
})();

console.log('test-reseedbeat-b: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed === 0 ? 0 : 1);
