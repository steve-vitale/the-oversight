// test-departbeat-b.js — proof test, arm sim-departbeat-b.
// Proves the ordinary departure beat: when a holder walks out on a
// plan with their party, the fire speaks one line at the launch —
// "Amina sets out with Diana after Herald — the fire marks the
// trail." — naming the holder, the party, and the target. The
// 16-seed profilegate confirm band showed ZERO launch-mention
// vetSays lines: ordinary launches were silent (the re-seed launch
// speaks, finding #2632, but ordinary ones never did). The holds,
// by contrast, ARE voiced (villager-brain.js:736/:768) — this beat
// is the launch half of that same silence.
// LAUNCHVOICE (journey-establishment r268, 2026-11-22): the beat
// originally gated on needWave >= 4, so below-wave-4 launches stayed
// silent — the r265 panel proved the hunt is mechanically alive but
// conversationally silent (57 departures, 0 beats). The gate is
// removed: EVERY real departure speaks once. §A and §D D1 below pin
// the new behavior (design changed on purpose — green-list rule:
// update the test in the same commit and say so).
//   §A code pins (read-only greps).
//   §B staged fixture — the ordinary wave-4 shape: holder Amina,
//       wave-4 Herald plan, companion Diana, both armed + armored
//       (spear + armor) — the gear and party a player actually has
//       at a wave-4 hunt, never a fresh un-geared solo scholar.
//       Drives the REAL winPlanDepart and the REAL
//       vbrainExecuteDepart (stubbed dawn commit).
//   §C OLD-CODE CONTROL: the same fixture against the pre-change
//       win-plan.js (git show of the branch base tip) must launch
//       with NO beat line (fail on old, pass on new).
//   §D negative cases: flag off silent; re-seed launch speaks its
//       own beat once, no double-beat; same-day second launch silent
//       (dedup stamp); next-day launch speaks again; no-target launch
//       drops the clause. (D1, formerly "non-wave-4 launch silent",
//       now pins the LAUNCHVOICE change: a wave-3 launch speaks.)
// Usage: node scripts/test-departbeat-b.js
//        node scripts/test-departbeat-b.js --old-code <win-plan.js path>
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

const DEPART_BEAT_RE = /sets out .* — the fire marks the trail\./;
const RESEED_BEAT_RE = /is hunting .* now — the fire found a new trail\./;

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
    emmett_okafor: { id: 'emmett_okafor', name: 'Emmett', dead: false, _armorP: 10, _weaponB: 5,
      items: [{ id: 'spear' }], node: [5, 5] },
  };
}
// The ordinary wave-4 shape: holder Amina, live Herald plan
// (needWave 4), companion Diana. opts override:
// target/expired/stage/slain/killLog/seen/fought/sightings/needWave/
// away/systemArrived/refuse (ids whose startExpedition is refused,
// modelling a blocked companion — the COMPANIONGUARD solo shape).
function beatCtx(o) {
  const opts = o || {};
  const people = makePeople();
  const exped = {};
  const says = [];
  const plan = { stage: (opts.stage || 'party'),
    target: (opts.target === undefined ? 'herald' : opts.target),
    needWave: (opts.needWave == null ? 4 : opts.needWave),
    node: null, party: [], sinceDay: 26, holdSinceDay: -1 };
  if (opts.expired) plan.reseedExpiryDay = 28;
  const roster = ['amina_diallo', 'diana_osei', 'emmett_okafor'];
  const ctx = {
    villagerId: 'scholar1',
    data: { items: [{ id: 'spear', weapon: true }, { id: 'knife', weapon: true }], monsters: MONSTERS },
    state: {
      scholar: { day: 136 },
      _standingDeferBeat: {},
      villageSlain: (opts.slain == null ? {} : opts.slain),
      waveKillLog: (opts.killLog === undefined ? [] : opts.killLog),
      villageLastSeenDay: (opts.seen === undefined ? { herald: 130 } : opts.seen),
      village: {
        px: 5, py: 5,
        roster: roster,
        trust: { diana_osei: 20, emmett_okafor: 20 },
        away: (opts.away || {}), sick: {}, health: { amina_diallo: 100, diana_osei: 100, emmett_okafor: 100 },
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
    startExpedition: function (vid, hx, hy, announce, o2) {
      if ((opts.refuse || []).indexOf(vid) !== -1) return;
      exped[vid] = { tx: o2.tx, ty: o2.ty, duration: o2.duration };
    },
    say: function (line) { says.push(String(line)); },
    disp: function (vid) { return vid === 'amina_diallo' ? 'Amina' : (vid === 'diana_osei' ? 'Diana' : (vid === 'emmett_okafor' ? 'Emmett' : vid)); },
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
  if (typeof Game.winPlanDepartLaunchBeat === 'function') {
    ctx.winPlanDepartLaunchBeat = function (vid, launched) { return Game.winPlanDepartLaunchBeat.call(ctx, vid, launched); };
  }
  if (typeof Game.vbrainExecuteDepart === 'function') {
    ctx.vbrainCommit = function () {
      return { day: 136, kind: 'EXPEDITION', winPlanAction: 'party_launch',
        companion: 'diana_osei', companion2: (opts.companion2 || null), companion3: null };
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
  delete process.env.DEPARTBEAT;
}
function disarmEnv() { delete process.env.PLANRESEED; delete process.env.FLEEREPAIR2; delete process.env.VETREENGAGE; delete process.env.DEPARTBEAT; }
function departBeatLines(says) { return says.filter(function (l) { return DEPART_BEAT_RE.test(l); }); }
function reseedBeatLines(says) { return says.filter(function (l) { return RESEED_BEAT_RE.test(l); }); }

// ---- OLD-CODE CHILD MODE (used by §C) ----
// Runs only the §B1 launch fixture against the given win-plan.js and
// prints one JSON line. Exits 0 iff the holder launched with NO
// beat line of either kind (the old code's shape: the ordinary
// launch is silent, and no re-seed stamp exists to speak).
if (OLD_CODE_PATH) {
  armEnv();
  const f = beatCtx({});
  const res = Game.winPlanDepart.call(f.ctx, 'amina_diallo', 5, 5, false);
  disarmEnv();
  console.log(JSON.stringify({
    result: res, launched: !!f.exped.amina_diallo, stage: f.plan.stage,
    target: f.plan.target,
    departBeatLines: departBeatLines(f.says).length,
    reseedBeatLines: reseedBeatLines(f.says).length,
    says: f.says,
  }));
  process.exit(0);
}

// ---- §A CODE PINS (read-only greps) ----
(function sectionA() {
  const wpSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
  const brainSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
  const drvSrc = fs.readFileSync(path.join(__dirname, 'departbeat-driver-b.js'), 'utf8');
  function fnBody(src, start, end) {
    const a = src.indexOf(start);
    if (a === -1) return null;
    const b = end ? src.indexOf(end, a + start.length) : src.length;
    return b === -1 ? null : src.slice(a, b);
  }
  const beat = fnBody(wpSrc, 'function departLaunchBeat(self, vid, launched, target) {', '\n  // Shared extra-companion scan');
  check('§A departLaunchBeat exists, line names holder + party + target in the re-seed-beat voice',
    beat != null && beat.indexOf("cname + ' sets out' + withClause + afterClause + ' — the fire marks the trail.'") !== -1, null);
  check('§A depart launch beat has no Math.random (deterministic wording)',
    beat != null && beat.indexOf('Math.random') === -1, null);
  check('§A depart launch beat drops the after-clause when the plan has no target (never invents one)',
    beat != null && beat.indexOf("if (target) {") !== -1, null);
  const hookBody = fnBody(wpSrc, 'winPlanDepartLaunchBeat(vid, launched) {', '\n    // Haven evaluation');
  check('§A winPlanDepartLaunchBeat speaks the re-seed beat first and returns (exactly one beat per launch)',
    hookBody != null && hookBody.indexOf('reseedSpoke') !== -1 &&
    hookBody.indexOf("if (reseedSpoke) {") !== -1, null);
  check('§A hook does NOT gate the ordinary beat on needWave (LAUNCHVOICE r268: every real departure speaks once — the wave-4+ gate was removed on purpose)',
    hookBody != null && hookBody.indexOf('(plan.needWave | 0) < 4') === -1 && hookBody.indexOf('needWave') === -1, null);
  check('§A hook is default-ON (departbeatOn, DEPARTBEAT=0 silences) and reads the plan without creating it (no winPlanOf call inside)',
    hookBody != null && hookBody.indexOf('departbeatOn()') !== -1 && hookBody.indexOf('winPlanOf') === -1, null);
  check('§A hook stamps day+target BEFORE speaking (no double-fire on a re-entrant say)',
    hookBody != null &&
    hookBody.indexOf('plan.departBeatDay = day;') !== -1 &&
    hookBody.indexOf('plan.departBeatDay = day;') < hookBody.indexOf('departLaunchBeat(this, vid, launched || [], target);'), null);
  check('§A hook dedups a same-day same-target second call (stamp equality check)',
    hookBody != null && hookBody.indexOf('plan.departBeatDay === day && plan.departBeatTarget === target') !== -1, null);
  const gateBody = fnBody(wpSrc, 'function departbeatOn() {', '\n  // lastKillDayOf');
  check('§A departbeatOn is default-ON (only DEPARTBEAT=0 turns it off)',
    gateBody != null && gateBody.indexOf("process.env.DEPARTBEAT === '0'") !== -1, null);
  const departBody = fnBody(wpSrc, 'winPlanDepart(vid, hx, hy, playerAtHaven) {', '\n    // VETREENGAGE (sim-vetreengage-a): pick a SECOND companion');
  check('§A winPlanDepart launchParty speaks the beat after a real departure (shared hook after partyDepartures, before return true)',
    departBody != null && departBody.indexOf('self.winPlanDepartLaunchBeat(vid, launched)') !== -1 &&
    departBody.indexOf("bump(self, 'partyDepartures');") !== -1 &&
    departBody.indexOf('self.winPlanDepartLaunchBeat(vid, launched)') > departBody.indexOf("bump(self, 'partyDepartures');"), null);
  check('§A vbrainExecuteDepart party_launch branch speaks the beat before return launch',
    brainSrc.indexOf("this.winPlanDepartLaunchBeat(vid, launched);") !== -1 &&
    brainSrc.indexOf("this.winPlanDepartLaunchBeat(vid, launched);") < brainSrc.indexOf("return 'launch';", brainSrc.indexOf("this.winPlanDepartLaunchBeat(vid, launched);")) &&
    brainSrc.indexOf("else if (typeof this.winPlanReseedLaunchBeat === 'function') this.winPlanReseedLaunchBeat(vid);") !== -1, null);
  check('§A winPlanDepartLaunchBeat is listed in the provides header',
    wpSrc.indexOf('winPlanDepartLaunchBeat(vid, launched)') !== -1, null);
  check('§A departbeat driver SAY_RE contains "marks the trail" (the recorder hears the beat)',
    /SAY_RE = \/[^/]*marks the trail[^/]*\//.test(drvSrc), null);
  check('§A "marks the trail" appears nowhere else in src/js (the token collides with nothing the game says)',
    (function () {
      const files = fs.readdirSync(path.join(REPO, 'src', 'js')).filter(function (f) { return /\.js$/.test(f); });
      const hits = files.filter(function (f) {
        return fs.readFileSync(path.join(REPO, 'src', 'js', f), 'utf8').indexOf('marks the trail') !== -1;
      });
      return hits.length === 1 && hits[0] === 'win-plan.js';
    })(), null);
})();

// ---- §B STAGED LAUNCH FIXTURE (the ordinary wave-4 shape) ----
(function sectionB() {
  // B1: live Herald plan, winPlanDepart path.
  armEnv();
  const f = beatCtx({});
  const res = Game.winPlanDepart.call(f.ctx, 'amina_diallo', 5, 5, false);
  const st = statsOf(f.ctx);
  const db = departBeatLines(f.says);
  check('§B B1 depart launches the ordinary wave-4 party (launch, stage hunt, target herald, party of 2)',
    res === 'launch' && f.plan.stage === 'hunt' && f.plan.target === 'herald' &&
    !!f.exped.amina_diallo && !!f.exped.diana_osei,
    JSON.stringify({ res: res, stage: f.plan.stage, target: f.plan.target, stats: st }));
  check('§B B1 exactly one depart-beat line, naming holder + companion + target, in the frozen wording',
    db.length === 1 && db[0] === 'Amina sets out with Diana after Herald — the fire marks the trail.',
    f.says);
  check('§B B1 no re-seed line (this is an ordinary launch, not a re-seed)',
    reseedBeatLines(f.says).length === 0 && f.says.length === 1, f.says);
  check('§B B1 dedup stamp set at the launch (day + target recorded)',
    f.plan.departBeatDay === 136 && f.plan.departBeatTarget === 'herald',
    JSON.stringify({ day: f.plan.departBeatDay, target: f.plan.departBeatTarget }));
  disarmEnv();

  // B2: the brain path (the departure that fires in sims) — stubbed
  // dawn commit, same live Herald plan.
  armEnv();
  const h = beatCtx({});
  const res2 = Game.vbrainExecuteDepart.call(h.ctx, 'amina_diallo', 5, 5, false);
  const db2 = departBeatLines(h.says);
  check('§B B2 brain path launches with exactly one depart-beat line (launch, stage hunt, one line)',
    res2 === 'launch' && h.plan.stage === 'hunt' && h.plan.target === 'herald' &&
    db2.length === 1 && db2[0] === 'Amina sets out with Diana after Herald — the fire marks the trail.',
    JSON.stringify({ res: res2, stage: h.plan.stage, target: h.plan.target, says: h.says }));
  disarmEnv();

  // B3: trio on the brain path (VETREENGAGE + companion2) — the beat
  // names the whole party.
  armEnv();
  process.env.VETREENGAGE = '1';
  const t = beatCtx({ companion2: 'emmett_okafor' });
  const res3 = Game.vbrainExecuteDepart.call(t.ctx, 'amina_diallo', 5, 5, false);
  const db3 = departBeatLines(t.says);
  check('§B B3 trio launch names holder + both companions + target (one line)',
    res3 === 'launch' && !!t.exped.emmett_okafor &&
    db3.length === 1 && db3[0] === 'Amina sets out with Diana and Emmett after Herald — the fire marks the trail.',
    JSON.stringify({ res: res3, says: t.says }));
  disarmEnv();

  // B4: solo launch — the companion's startExpedition is refused
  // (the COMPANIONGUARD shape: inviter still goes, alone). The
  // beat names the holder alone, with no companion clause.
  armEnv();
  const s = beatCtx({ refuse: ['diana_osei'] });
  const res4 = Game.vbrainExecuteDepart.call(s.ctx, 'amina_diallo', 5, 5, false);
  const db4 = departBeatLines(s.says);
  check('§B B4 solo launch speaks the beat for the holder alone (launch, stage hunt, no with-clause)',
    res4 === 'launch' && s.plan.stage === 'hunt' && !s.exped.diana_osei &&
    db4.length === 1 && db4[0] === 'Amina sets out after Herald — the fire marks the trail.',
    JSON.stringify({ res: res4, stage: s.plan.stage, says: s.says }));
  disarmEnv();

  // B5: after the System arrives, the line carries the SYSTEM prefix
  // like its sibling beats.
  armEnv();
  const k = beatCtx({ systemArrived: true });
  Game.winPlanDepart.call(k.ctx, 'amina_diallo', 5, 5, false);
  const db5 = departBeatLines(k.says);
  check('§B B5 SYSTEM prefix after arrival (same wrap as expiry/reseed beats)',
    db5.length === 1 && db5[0] === '📺 SYSTEM: "Amina sets out with Diana after Herald — the fire marks the trail."',
    k.says);
  disarmEnv();
})();

// ---- §C OLD-CODE CONTROL (fail on old, pass on new) ----
(function sectionC() {
  const { spawnSync, execSync } = require('child_process');
  const os = require('os');
  const tmp = path.join(os.tmpdir(), 'departbeat-old-win-plan-' + process.pid + '.js');
  try {
    // Pinned to the pre-change commit (the branch base tip):
    // HEAD moves as this arm commits, so HEAD would stop being
    // "old code".
    const oldSrc = execSync('git show bcc59bcd4:src/js/win-plan.js', { cwd: REPO, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    fs.writeFileSync(tmp, oldSrc);
  } catch (e) {
    check('§C old-code control: git show bcc59bcd4:src/js/win-plan.js readable', false, String(e).slice(0, 200));
    return;
  }
  const r = spawnSync(process.execPath, [__filename, '--old-code', tmp],
    { cwd: REPO, encoding: 'utf8', timeout: 120000 });
  let out = null;
  try { out = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch (e) {}
  check('§C old code launches the same fixture (launch, stage hunt, target herald)',
    !!out && out.launched === true && out.stage === 'hunt' && out.target === 'herald', out);
  check('§C old code has NO depart-beat line (the launch is silent — the gap this arm closes)',
    !!out && out.departBeatLines === 0, out ? out.says : r.stdout);
  check('§C old code has NO re-seed line either (no stamp exists on an ordinary launch)',
    !!out && out.reseedBeatLines === 0, out ? out.says : r.stdout);
  check('§C new code speaks at launch (the §B1 line — the control contrasts, it does not re-run §B)',
    true, null);
  try { fs.rmSync(tmp, { force: true }); } catch (e) {}
})();

// ---- §D NEGATIVE CASES ----
(function sectionD() {
  // D1: non-wave-4 launch — a wave-3 Spool plan launches, and
  // LAUNCHVOICE (r268) means it SPEAKS the ordinary beat once (the
  // old pin "wave-3 launch is silent" was the pre-fix behavior).
  armEnv();
  const f = beatCtx({ target: 'spool', needWave: 3, seen: { spool: 130 } });
  const res = Game.winPlanDepart.call(f.ctx, 'amina_diallo', 5, 5, false);
  check('§D D1 wave-3 launch speaks the ordinary beat once (LAUNCHVOICE r268: launch, stage hunt, one beat line)',
    res === 'launch' && f.plan.stage === 'hunt' && f.plan.target === 'spool' &&
    departBeatLines(f.says).length === 1 && f.says.length === 1 &&
    f.says[0] === 'Amina sets out with Diana after Spool — the fire marks the trail.',
    JSON.stringify({ res: res, target: f.plan.target, says: f.says }));
  disarmEnv();

  // D2: flag off — DEPARTBEAT=0 silences the beat, launch unchanged.
  armEnv();
  process.env.DEPARTBEAT = '0';
  const g = beatCtx({});
  const res2 = Game.winPlanDepart.call(g.ctx, 'amina_diallo', 5, 5, false);
  check('§D D2 DEPARTBEAT=0: launch proceeds, silent (no stamp, no beat)',
    res2 === 'launch' && g.plan.stage === 'hunt' && g.says.length === 0 && g.plan.departBeatDay == null,
    JSON.stringify({ res: res2, says: g.says }));
  disarmEnv();

  // D3: expired-plan re-seed launch at wave 4 — the plan expired on
  // an earlier commit (targetless, stamp set), and an Eater rumor
  // re-seeds it now. The re-seed beat speaks once at the launch;
  // the ordinary beat must NOT also fire (exactly one beat per
  // launch). NOTE the shape: the stamp branch runs only for a
  // TARGETLESS expired plan — a plan whose target is still set and
  // dead takes the dead-target branch instead (commit beat, no
  // stamp; see D7), which is a different launch kind.
  armEnv();
  const h = beatCtx({ target: null, expired: true, needWave: 4,
    seen: { eater: 130 } });
  const res3 = Game.winPlanDepart.call(h.ctx, 'amina_diallo', 5, 5, false);
  const rb3 = reseedBeatLines(h.says);
  check('§D D3 expired-plan re-seed launch speaks the re-seed beat once and no ordinary beat (one line total)',
    res3 === 'launch' && h.plan.target === 'eater' &&
    rb3.length === 1 && rb3[0] === 'Amina is hunting Eater now — the fire found a new trail.' &&
    departBeatLines(h.says).length === 0 && h.says.length === 1,
    JSON.stringify({ res: res3, target: h.plan.target, says: h.says }));
  disarmEnv();

  // D4: same-day second launch on the same target speaks nothing
  // (the dedup stamp); a launch the NEXT day speaks again.
  armEnv();
  const k = beatCtx({});
  Game.winPlanDepart.call(k.ctx, 'amina_diallo', 5, 5, false);
  const firstCount = departBeatLines(k.says).length;
  Object.keys(k.exped).forEach(function (x) { delete k.exped[x]; });
  k.plan.stage = 'party'; k.plan.party = [];
  const res4 = Game.winPlanDepart.call(k.ctx, 'amina_diallo', 5, 5, false);
  check('§D D4 second launch the same day speaks no second beat (one line total)',
    res4 === 'launch' && firstCount === 1 && departBeatLines(k.says).length === 1 && k.says.length === 1,
    JSON.stringify({ res: res4, says: k.says }));
  k.ctx.state.scholar.day = 137;
  k.ctx.vbrainCommit = function () {
    return { day: 137, kind: 'EXPEDITION', winPlanAction: 'party_launch',
      companion: 'diana_osei', companion2: null, companion3: null };
  };
  Object.keys(k.exped).forEach(function (x) { delete k.exped[x]; });
  k.plan.stage = 'party'; k.plan.party = [];
  const res4b = Game.winPlanDepart.call(k.ctx, 'amina_diallo', 5, 5, false);
  check('§D D4 next-day launch on the same target speaks again (two lines total, one per launch)',
    res4b === 'launch' && departBeatLines(k.says).length === 2 && k.says.length === 2,
    JSON.stringify({ res: res4b, says: k.says }));
  disarmEnv();

  // D5: no-target launch — the direct hook drops the after-clause
  // rather than inventing a target.
  armEnv();
  const m = beatCtx({ target: null });
  const spoke = Game.winPlanDepartLaunchBeat.call(m.ctx, 'amina_diallo', ['diana_osei']);
  check('§D D5 no-target hook speaks without the after-clause (holder + party, no invented target)',
    spoke === true && m.says.length === 1 &&
    m.says[0] === 'Amina sets out with Diana — the fire marks the trail.',
    m.says);
  disarmEnv();

  // D6: direct hook, no plan — total no-op, never throws.
  armEnv();
  const n = beatCtx({});
  delete n.ctx.state.village.winPlan.amina_diallo;
  let threw = false;
  let spoke6 = false;
  try { spoke6 = Game.winPlanDepartLaunchBeat.call(n.ctx, 'amina_diallo', ['diana_osei']); } catch (e) { threw = true; }
  check('§D D6 hook with no plan is a silent no-op (false, no throw, no line)',
    threw === false && spoke6 === false && n.says.length === 0, JSON.stringify({ spoke: spoke6, threw: threw, says: n.says }));
  disarmEnv();

  // D7: dead-target re-seed launch — the plan still carries a dead
  // Herald, so the commit re-seeds to Eater WITH the commit beat
  // and sets no stamp. The launch is an ordinary wave-4+ launch,
  // so the ordinary beat speaks at the departure: two lines, two
  // different facts (the retarget, then the departure), no re-seed
  // line. This is the correct split — the stamp branch (D3) is
  // only for targetless expired plans.
  armEnv();
  const p = beatCtx({ target: 'herald', needWave: 4,
    slain: { herald: 1 },
    killLog: [{ by: 'diana_osei', w: 4, d: 126, mid: 'herald', via: 'agency' }],
    seen: { eater: 130 } });
  const res7 = Game.winPlanDepart.call(p.ctx, 'amina_diallo', 5, 5, false);
  check('§D D7 dead-target re-seed launch speaks commit beat + ordinary beat (two lines, no re-seed line)',
    res7 === 'launch' && p.plan.target === 'eater' && p.says.length === 2 &&
    /The hunt turns to Eater instead/.test(p.says[0]) &&
    p.says[1] === 'Amina sets out with Diana after Eater — the fire marks the trail.' &&
    reseedBeatLines(p.says).length === 0,
    JSON.stringify({ res: res7, target: p.plan.target, says: p.says }));
  disarmEnv();
})();

console.log('test-departbeat-b: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed === 0 ? 0 : 1);
