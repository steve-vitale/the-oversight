// test-reseed-b.js — proof test, arm sim-reseed-b.
// Proves, on staged fixtures (the 106084 shape: a hunt plan whose
// holder fought beside the killer, competent verbatim, full landed
// substrate, geared parties as a player would have at wave 4 — never
// a fresh un-geared solo scholar):
//   (a) the commit-time check re-seeds a dead target from rumors the
//       holder has actually heard (fought species, fight memories,
//       village sightings — never the global roster) and launches on
//       the NEW live target; with no live rumor the plan EXPIRES
//       (dissolves with a fireside beat) and the caller returns
//       'normal'; an expired plan holds silently on later commits
//       until a rumor (or a lived fight) re-seeds it;
//   (b) the liveness rule: slain + dated kill with no sighting since
//       is dead; a post-kill sighting re-opens the type; a same-day
//       sighting does not; never slain, or slain with no dated kill,
//       fails open;
//   (c) the re-seed pick: fought-species first, wave floor enforced,
//       suburb excluded, dead candidates skipped, flag off is a
//       no-op everywhere; never-targeted plans are untouched;
//   (d) the sighting stamp: flag on stamps, flag off stamps nothing,
//       fieldFight stamps on live contact only (never alreadyDead).
// §A is read-only greps of src/js/win-plan.js, villager-brain.js and
// fieldFights.js. §B–§F drive staged fixtures; the brain path is
// driven through vbrainExecuteDepart with a staged dawn commit.
// Usage: node scripts/test-reseed-b.js
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(__dirname, 'analyze-reseed-b.js'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}

// ---- §A CODE PINS ----
const wpSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'win-plan.js'), 'utf8');
const brSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
const ffSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');
function fnBody(src, startMarker, endMarker) {
  const i = src.indexOf(startMarker);
  if (i === -1) return null;
  const j = endMarker ? src.indexOf(endMarker, i + startMarker.length) : src.length;
  return src.slice(i, j === -1 ? src.length : j);
}
const commitBody = fnBody(wpSrc, 'winPlanCommitDeadTarget(vid) {', '\n    // Haven evaluation:');
check('§A winPlanCommitDeadTarget exists in win-plan.js', commitBody != null && commitBody.length > 500, commitBody ? commitBody.length : null);
if (commitBody) {
  check('§A commit check is flag-gated first (planreseedOn, no state read when off)',
    commitBody.indexOf('if (!planreseedOn()) return null;') !== -1, null);
  check('§A commit check reads the plan WITHOUT creating it (no winPlanOf call inside)',
    commitBody.indexOf('winPlanOf') === -1 && commitBody.indexOf('!v.winPlan[vid]') !== -1, null);
  check('§A commit check re-seeds (retarget + node clear + bump planReseeds + beat)',
    commitBody.indexOf('plan.target = fresh.id') !== -1 && commitBody.indexOf('plan.node = null') !== -1 &&
    commitBody.indexOf("bump(this, 'planReseeds')") !== -1 && commitBody.indexOf('reseedBeat(this, vid, oldType, fresh.id)') !== -1, null);
  check('§A commit check expires (dissolve + stamp reseedExpiryDay + bump planExpiries + beat)',
    commitBody.indexOf('plan.target = null') !== -1 && commitBody.indexOf('plan.reseedExpiryDay = day') !== -1 &&
    commitBody.indexOf("bump(this, 'planExpiries')") !== -1 && commitBody.indexOf('expiryBeat(this, vid, oldType)') !== -1, null);
  check('§A commit check returns expired / held / reseeded / null',
    commitBody.indexOf("return 'expired';") !== -1 && commitBody.indexOf("return 'held';") !== -1 &&
    commitBody.indexOf("return 'reseeded';") !== -1 && commitBody.indexOf('return null;') !== -1, null);
  check('§A commit check leaves never-targeted plans alone (stamp null -> null)',
    commitBody.indexOf('if (plan.reseedExpiryDay == null) return null;') !== -1, null);
}
check('§A winPlanCommitDeadTarget is listed in the provides header',
  wpSrc.indexOf('winPlanCommitDeadTarget(vid)') !== -1 && wpSrc.slice(0, wpSrc.indexOf('winPlanCommitDeadTarget(vid)')).indexOf('provides:') !== -1, null);
check('§A plan.target = null occurs exactly once in win-plan.js (the expiry branch only)',
  (wpSrc.match(/plan\.target = null/g) || []).length === 1, (wpSrc.match(/plan\.target = null/g) || []).length);
check('§A planReseeds + planExpiries are initialized in winPlanStats',
  wpSrc.indexOf('planReseeds: 0') !== -1 && wpSrc.indexOf('planExpiries: 0') !== -1, null);
check('§A liveness rule reads villageSlain + dated kill + sighting stamp',
  wpSrc.indexOf('villageSlain') !== -1 && wpSrc.indexOf('lastKillDayOf') !== -1 &&
  wpSrc.indexOf('villageLastSeenDay') !== -1, null);
check('§A sighting after the kill day re-opens (seenDay > killDay)',
  wpSrc.indexOf('seenDay != null && seenDay > killDay') !== -1, null);
check('§A winPlanNoteSighting exists and is flag-gated',
  wpSrc.indexOf('winPlanNoteSighting(mid)') !== -1 && wpSrc.indexOf('if (!planreseedOn()) return null;') !== -1, null);
check('§A winPlanNoteSighting is listed in the provides header',
  wpSrc.indexOf('winPlanNoteSighting(mid)') !== -1 && wpSrc.slice(0, wpSrc.indexOf('winPlanNoteSighting(mid)')).indexOf('provides:') !== -1, null);
// No Math.random in the new code path: the pick, the commit check, both
// beats, the stamp, and the liveness rule are all deterministic.
(function () {
  const bodies = [
    fnBody(wpSrc, 'function planReseedPick(self, vid, plan) {', '\n  // reseedBeat'),
    fnBody(wpSrc, 'function reseedBeat(self, vid, oldType, newType) {', '\n  // expiryBeat'),
    fnBody(wpSrc, 'function expiryBeat(self, vid, oldType) {', '\n  // Shared extra-companion scan'),
    fnBody(wpSrc, 'function planTargetDeadByType(self, type) {', '\n  // monsterWaveOf'),
    commitBody,
  ];
  const bad = bodies.filter(function (b) { return b == null || b.indexOf('Math.random') !== -1; });
  check('§A no Math.random in the new code path (pick, beats, liveness, commit)',
    bad.length === 0, bad.length);
})();
check('§A re-seed beat names the holder + both types and contains "put down"',
  wpSrc.indexOf("but the fire says that kind is already put down") !== -1, null);
check('§A expiry beat names the holder + the type and contains "put down"',
  wpSrc.indexOf("but the fire says that kind is already put down, and no one has seen another trail") !== -1, null);
// Untouched surfaces: the lever never reaches the note-kill, the fight
// gate, the dawn bid, or the fight-seed.
(function () {
  const killBody = fnBody(wpSrc, 'winPlanNoteKill(vid, mdef) {', '\n    // SIGHTING STAMP');
  const gateBody = fnBody(wpSrc, 'winPlanFightGate(vid, mdef) {', '\n    // VETREENGAGE (sim-vetreengage-a): pick a SECOND companion');
  const seedBody = fnBody(wpSrc, 'winPlanSeedFromFight(vid, mdef, outcome) {', '\n    // A fight that started with a plan party');
  const candsBody = fnBody(brSrc, 'function winPlanCands(self, vid, hx, hy) {', '\n  // Agency\'s old explorer/wanderer chance roll');
  const bad = [];
  if (!killBody || /reseed/i.test(killBody)) bad.push('noteKill');
  if (!gateBody || /reseed/i.test(gateBody)) bad.push('fightGate');
  if (!seedBody || /reseed/i.test(seedBody)) bad.push('seedFromFight');
  if (!candsBody || /reseed/i.test(candsBody)) bad.push('winPlanCands');
  check('§A winPlanNoteKill / winPlanFightGate / winPlanSeedFromFight / winPlanCands untouched (no reseed reference)',
    bad.length === 0, bad);
})();
// winPlanDepart hook: after the gear advance, before the stage launch block.
const departBody = fnBody(wpSrc, 'winPlanDepart(vid, hx, hy, playerAtHaven) {', '\n    // VETREENGAGE (sim-vetreengage-a): pick a SECOND companion');
check('§A winPlanDepart found', departBody != null && departBody.length > 1000, departBody ? departBody.length : null);
if (departBody) {
  check('§A winPlanDepart calls the commit check before any launch',
    departBody.indexOf('winPlanCommitDeadTarget(vid)') !== -1, null);
  check('§A winPlanDepart maps expired -> normal and held -> hold',
    /winPlanCommitDeadTarget[\s\S]{0,400}if \(_rs === 'expired'\) return 'normal';/.test(departBody) &&
    /winPlanCommitDeadTarget[\s\S]{0,600}if \(_rs === 'held'\) return 'hold';/.test(departBody), null);
}
// Brain hook: party_launch branch calls the check before any startExpedition.
const brainDepartBody = fnBody(brSrc, "vbrainExecuteDepart: function (vid, hx, hy, announce) {", '\n  };\n  Object.assign(G, methods);');
check('§A vbrainExecuteDepart found', brainDepartBody != null && brainDepartBody.length > 1000, brainDepartBody ? brainDepartBody.length : null);
if (brainDepartBody) {
  const launchBranch = fnBody(brainDepartBody, "if (c.winPlanAction === 'party_launch' && c.companion", "this.startExpedition(vid, hx, hy, announce, opts);");
  check('§A brain party_launch branch calls the commit check before any startExpedition',
    launchBranch != null && launchBranch.indexOf('winPlanCommitDeadTarget(vid)') !== -1, null);
  check('§A brain maps expired -> normal and held -> hold',
    launchBranch != null && launchBranch.indexOf("if (_rs === 'expired') return 'normal';") !== -1 &&
    launchBranch.indexOf("if (_rs === 'held') return 'hold';") !== -1, null);
}
// fieldFight stamp call sites: the evade early return + the final return.
const alreadyDeadBlock = fnBody(ffSrc, "rec.outcome = 'alreadyDead';", "return rec;");
check('§A alreadyDead block never stamps a sighting (a corpse is not a sighting)',
  alreadyDeadBlock != null && alreadyDeadBlock.indexOf('winPlanNoteSighting') === -1, null);
const evadeBlock = fnBody(ffSrc, "rec.outcome = 'evade';", "return rec;");
check('§A evade return stamps the sighting (saw it alive)',
  evadeBlock != null && evadeBlock.indexOf('winPlanNoteSighting') !== -1, null);
check('§A final return stamps the sighting (contact fight)',
  /winPlanNoteSighting\(mdef && mdef\.id\)[\s\S]{0,200}return _sealed;/.test(ffSrc), null);
check('§A fieldFight calls winPlanNoteSighting exactly twice (evade + final)',
  (ffSrc.match(/winPlanNoteSighting\(mdef && mdef\.id\)/g) || []).length === 2, null);
check('§A stamp call sites are flag-gated (the method no-ops with PLANRESEED unset)',
  wpSrc.indexOf('if (!planreseedOn()) return null;') !== -1, null);

// ---- §B FIXTURE TESTS (fake ctx, vetreengage pattern) ----
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
// The 106084 shape, staged like the encounter: holder v1 fought
// beside the killer on d126 (fled a herald in the morning; Rafael
// killed one that afternoon), holds a hunt plan on the herald, and
// departs at dawn d136. Companion v2 is geared, trusted, at Haven.
// opts: slain (villageSlain map), killLog (waveKillLog array),
// seen (villageLastSeenDay map), fought (know[vid].fought list),
// sightings (monsterSightings[vid] list), needWave, stage, target.
function reseedCtx(o) {
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
  delete process.env.VETREENGAGE; delete process.env.PARTYSIZE4;
}

// B1: flag ON, dead herald + a fought rumor (reunion, wave 4) ->
// RE-SEEDED and launched on the reunion (not the herald).
(function () {
  armEnv();
  const f = reseedCtx({ fought: ['reunion'] });
  const r = Game.winPlanDepart.call(f.ctx, 'v1', 5, 5, false);
  check('§B1 armed + rumor: dead-target departure LAUNCHES on the re-seeded target',
    r === 'launch', 'r=' + r);
  check('§B1 armed + rumor: plan retargeted to reunion, node cleared, stage hunt',
    f.plan.target === 'reunion' && f.plan.needWave === 4 && f.plan.node === null && f.plan.stage === 'hunt',
    JSON.stringify({ target: f.plan.target, needWave: f.plan.needWave, node: f.plan.node, stage: f.plan.stage }));
  check('§B1 armed + rumor: holder + companion depart',
    !!f.exped.v1 && !!f.exped.v2, JSON.stringify(f.exped));
  check('§B1 armed + rumor: planReseeds bumped to 1, planExpiries 0',
    statsOf(f.ctx).planReseeds === 1 && (statsOf(f.ctx).planExpiries || 0) === 0, JSON.stringify(statsOf(f.ctx)));
  check('§B1 armed + rumor: exactly one re-seed beat, naming Brian + the reunion + "put down"',
    f.says.length === 1 && f.says[0].indexOf('Brian') !== -1 && f.says[0].indexOf('reunion') !== -1 &&
    f.says[0].indexOf('put down') !== -1, f.says);
  delete process.env.PLANRESEED;
})();

// B2: flag ON, dead herald + NO rumor anywhere -> EXPIRED, 'normal',
// nobody departs, expiry beat once.
(function () {
  armEnv();
  const f = reseedCtx({ fought: [], sightings: [] });
  const r = Game.winPlanDepart.call(f.ctx, 'v1', 5, 5, false);
  check('§B2 armed + no rumor: dead-target departure returns normal (plan expired, day proceeds)',
    r === 'normal', 'r=' + r);
  check('§B2 armed + no rumor: plan expires to party, target/node cleared, party emptied, stamp set',
    f.plan.stage === 'party' && f.plan.target === null && f.plan.node === null && f.plan.party.length === 0 &&
    f.plan.reseedExpiryDay === 136,
    JSON.stringify({ stage: f.plan.stage, target: f.plan.target, node: f.plan.node, party: f.plan.party, stamp: f.plan.reseedExpiryDay }));
  check('§B2 armed + no rumor: nobody departs (no expedition started)',
    Object.keys(f.exped).length === 0, JSON.stringify(Object.keys(f.exped)));
  check('§B2 armed + no rumor: planExpiries bumped to 1, planReseeds 0',
    statsOf(f.ctx).planExpiries === 1 && (statsOf(f.ctx).planReseeds || 0) === 0, JSON.stringify(statsOf(f.ctx)));
  check('§B2 armed + no rumor: exactly one expiry beat, naming Brian + "put down" + "called off"',
    f.says.length === 1 && f.says[0].indexOf('Brian') !== -1 && f.says[0].indexOf('put down') !== -1 &&
    f.says[0].indexOf('called off') !== -1, f.says);
  delete process.env.PLANRESEED;
})();

// B3: flag ON, post-kill sighting d130 (AFTER the d126 kill) -> the
// herald lives again: LAUNCH on the herald, no re-seed, no expiry.
(function () {
  armEnv();
  const f = reseedCtx({ seen: { herald: 130 }, fought: ['reunion'] });
  const r = Game.winPlanDepart.call(f.ctx, 'v1', 5, 5, false);
  check('§B3 armed + post-kill sighting d130: launch proceeds on the herald (type lives again)',
    r === 'launch', 'r=' + r);
  check('§B3 armed + post-kill sighting: plan keeps the herald target, no stats bumped',
    f.plan.target === 'herald' && f.plan.stage === 'hunt' &&
    (statsOf(f.ctx).planReseeds || 0) === 0 && (statsOf(f.ctx).planExpiries || 0) === 0,
    JSON.stringify({ target: f.plan.target, stage: f.plan.stage, stats: statsOf(f.ctx) }));
  check('§B3 armed + post-kill sighting: no beat (nothing happened)',
    f.says.length === 0, f.says);
  delete process.env.PLANRESEED;
})();

// B4: flag ON, same-day sighting d126 == kill day -> BLOCKED (day
// granularity cannot order it): expires, since no rumor is staged.
(function () {
  armEnv();
  const f = reseedCtx({ seen: { herald: 126 }, fought: [] });
  const r = Game.winPlanDepart.call(f.ctx, 'v1', 5, 5, false);
  check('§B4 armed + same-day sighting d126: expires (day granularity cannot order it)',
    r === 'normal' && f.plan.stage === 'party' && f.plan.target === null,
    JSON.stringify({ r: r, stage: f.plan.stage, target: f.plan.target }));
  delete process.env.PLANRESEED;
})();

// B5: flag ON, never slain -> LAUNCH (nothing to re-seed).
(function () {
  armEnv();
  const f = reseedCtx({ slain: { herald: 0 }, killLog: [], fought: ['reunion'] });
  const r = Game.winPlanDepart.call(f.ctx, 'v1', 5, 5, false);
  check('§B5 armed + never slain: launch proceeds on the herald', r === 'launch', 'r=' + r);
  check('§B5 armed + never slain: no stats bumped, no beat',
    (statsOf(f.ctx).planReseeds || 0) === 0 && (statsOf(f.ctx).planExpiries || 0) === 0 && f.says.length === 0,
    JSON.stringify({ stats: statsOf(f.ctx), says: f.says }));
  delete process.env.PLANRESEED;
})();

// B6: flag ON, slain 1 but NO dated kill in waveKillLog -> LAUNCH
// (fail open: an undated kill cannot prove the type died).
(function () {
  armEnv();
  const f = reseedCtx({ killLog: [], fought: ['reunion'] });
  const r = Game.winPlanDepart.call(f.ctx, 'v1', 5, 5, false);
  check('§B6 armed + slain but undated kill: launch proceeds (fail open)', r === 'launch', 'r=' + r);
  delete process.env.PLANRESEED;
})();

// B7: flag OFF, same dead-target fixture + rumor -> LAUNCH on the
// herald (old behavior: the lever is inert with the flag unset).
(function () {
  delete process.env.PLANRESEED;
  const f = reseedCtx({ fought: ['reunion'] });
  const r = Game.winPlanDepart.call(f.ctx, 'v1', 5, 5, false);
  check('§B7 unarmed: same dead-target fixture LAUNCHES on the herald (old behavior)',
    r === 'launch', 'r=' + r);
  check('§B7 unarmed: plan stays hunt on the herald, no stats, no beat',
    f.plan.stage === 'hunt' && f.plan.target === 'herald' &&
    (statsOf(f.ctx).planReseeds || 0) === 0 && (statsOf(f.ctx).planExpiries || 0) === 0 && f.says.length === 0,
    JSON.stringify({ stage: f.plan.stage, target: f.plan.target, stats: statsOf(f.ctx), says: f.says }));
})();

// B8: flag ON, NEVER-TARGETED plan (stage party, target null, no
// stamp) -> untouched: launches targetless as before (the village's
// normal wandering shape — this lever never touches it).
(function () {
  armEnv();
  const f = reseedCtx({ stage: 'party', target: null, fought: ['reunion'] });
  const r = Game.winPlanDepart.call(f.ctx, 'v1', 5, 5, false);
  check('§B8 armed + never-targeted plan: LAUNCHES targetless (untouched by the lever)',
    r === 'launch', 'r=' + r);
  check('§B8 armed + never-targeted plan: still targetless, no stats, no beat',
    f.plan.target === null && (statsOf(f.ctx).planReseeds || 0) === 0 &&
    (statsOf(f.ctx).planExpiries || 0) === 0 && f.says.length === 0,
    JSON.stringify({ target: f.plan.target, stats: statsOf(f.ctx), says: f.says }));
  delete process.env.PLANRESEED;
})();

// ---- §C COMMIT-METHOD UNIT TESTS ----
(function () {
  armEnv();
  // C1: expired plan + no rumor -> 'held', silent, no bump, plan unchanged.
  // The fixture stages the plan the way the expiry branch produces it
  // (stage 'party', target null, stamp set) — reseedCtx's default
  // stage is 'hunt', which an expired plan never has.
  const f = reseedCtx({ expired: true, stage: 'party', fought: [], sightings: [] });
  const r = Game.winPlanCommitDeadTarget.call(f.ctx, 'v1');
  check("§C1 expired + no rumor: commit returns 'held'",
    r === 'held', 'r=' + r);
  check('§C1 expired + no rumor: silent (no beat), no bump, plan stays party/targetless',
    f.says.length === 0 && (statsOf(f.ctx).planReseeds || 0) === 0 &&
    (statsOf(f.ctx).planExpiries || 0) === 0 && f.plan.stage === 'party' && f.plan.target === null,
    JSON.stringify({ says: f.says, stats: statsOf(f.ctx), stage: f.plan.stage, target: f.plan.target }));
  // C2: same expired plan, now a rumor arrives -> 'reseeded'.
  f.ctx.agencyState = function () { return { exped: f.exped, know: { v1: { fought: ['eater'] } } }; };
  const r2 = Game.winPlanCommitDeadTarget.call(f.ctx, 'v1');
  check("§C2 expired + new rumor: commit returns 'reseeded'",
    r2 === 'reseeded', 'r2=' + r2);
  check('§C2 expired + new rumor: plan retargeted to eater, stamp cleared, reseed beat once',
    f.plan.target === 'eater' && f.plan.reseedExpiryDay == null &&
    statsOf(f.ctx).planReseeds === 1 && f.says.length === 1 && f.says[0].indexOf('eater') !== -1,
    JSON.stringify({ target: f.plan.target, stamp: f.plan.reseedExpiryDay, stats: statsOf(f.ctx), says: f.says }));
  // C3: no plan -> null, creates no plan entry (the check must never
  // ignite the plan system).
  const g = reseedCtx({ fought: ['reunion'] });
  delete g.ctx.state.village.winPlan.v9;
  const r3 = Game.winPlanCommitDeadTarget.call(g.ctx, 'v9');
  check("§C3 no plan: commit returns null and creates no plan entry for v9",
    r3 === null && !g.ctx.state.village.winPlan.v9, JSON.stringify({ r: r3, hasV9: !!g.ctx.state.village.winPlan.v9 }));
  // C4: flag off -> null everywhere, plan untouched.
  delete process.env.PLANRESEED;
  const h = reseedCtx({ fought: ['reunion'] });
  const r4 = Game.winPlanCommitDeadTarget.call(h.ctx, 'v1');
  check('§C4 flag off: commit returns null, plan untouched',
    r4 === null && h.plan.target === 'herald' && h.plan.stage === 'hunt',
    JSON.stringify({ r: r4, target: h.plan.target, stage: h.plan.stage }));
})();

// ---- §D RE-SEED PICK TESTS (through the commit method) ----
(function () {
  armEnv();
  function pickCase(name, opts, wantTarget, wantNull) {
    const f = reseedCtx(opts);
    const r = Game.winPlanCommitDeadTarget.call(f.ctx, 'v1');
    if (wantTarget) {
      check('§D ' + name + ': re-seeded onto ' + wantTarget,
        r === 'reseeded' && f.plan.target === wantTarget,
        JSON.stringify({ r: r, target: f.plan.target }));
    } else {
      check('§D ' + name + ': ' + (wantNull || 'expired (no live rumor)'),
        r === 'expired' && f.plan.target === null,
        JSON.stringify({ r: r, target: f.plan.target }));
    }
  }
  // D1: fought species beats sightings (eater fought, audit merely seen).
  pickCase('fought beats sightings', { fought: ['eater'], sightings: [{ mid: 'audit', tx: 1, ty: 1, day: 130, part: 0 }] }, 'eater');
  // D2: most recent fought species wins (list order: oldest first).
  pickCase('most recent fought wins', { fought: ['spool', 'eater'] }, 'eater');
  // D3: wave floor — a wave-3 fought species does NOT re-seed a
  // needWave-4 plan; the wave-4 sighting does.
  pickCase('wave floor + sighting fallback', { fought: ['spool'], sightings: [{ mid: 'audit', tx: 1, ty: 1, day: 130, part: 0 }] }, 'audit');
  // D4: wave floor with nothing above it -> expired.
  pickCase('wave floor with no wave-4 rumor', { fought: ['spool'], sightings: [] });
  // D5: needWave 3 + wave-3 fought species -> re-seeds (floor is 3).
  pickCase('needWave-3 plan takes a wave-3 rumor', { needWave: 3, fought: ['spool'] }, 'spool');
  // D6: the dead target itself is skipped even when fought.
  pickCase('dead target skipped', { fought: ['herald'], sightings: [{ mid: 'eater', tx: 1, ty: 1, day: 130, part: 0 }] }, 'eater');
  // D7: suburb excluded (leave-counter species), eater picked instead.
  // The exclusion fires when FLEEREPAIR2=1 (the judged substrate), so
  // the case runs under that flag — the pick itself reads process.env.
  process.env.FLEEREPAIR2 = '1';
  pickCase('suburb excluded', { fought: ['suburb'], sightings: [{ mid: 'eater', tx: 1, ty: 1, day: 130, part: 0 }] }, 'eater');
  delete process.env.FLEEREPAIR2;
  // D8: village fire knowledge only (no personal fought/sighting) ->
  // the seen-alive type is picked.
  pickCase('village sighting fallback', { fought: [], sightings: [], seen: { eater: 130 } }, 'eater');
  // D9: a candidate that is itself dead (slain, no sighting since)
  // is skipped -> expired.
  pickCase('dead candidate skipped', { fought: ['eater'], slain: { herald: 1, eater: 1 },
    killLog: [{ by: 'rafael', w: 4, d: 126, mid: 'herald', via: 'agency' }, { by: 'v1', w: 4, d: 120, mid: 'eater', via: 'agency' }] });
  // D10: a candidate slain long ago but seen since is live again.
  pickCase('slain-but-seen candidate lives', { fought: ['eater'], slain: { herald: 1, eater: 1 },
    killLog: [{ by: 'rafael', w: 4, d: 126, mid: 'herald', via: 'agency' }, { by: 'v1', w: 4, d: 120, mid: 'eater', via: 'agency' }],
    seen: { eater: 130 } }, 'eater');
  delete process.env.PLANRESEED;
})();

// ---- §E BRAIN-PATH FIXTURES ----
require(path.join(REPO, 'src', 'js', 'villager-brain.js'));
function brainCtx(o) {
  const f = reseedCtx(o);
  const ctx = f.ctx;
  ctx.state.village.vbrain = { commit: { v1: { day: 136, part: 0, kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: 'v2' } }, perception: {}, logs: [], stats: { picks: 0, gates: 0, expeditions: 0, winPlan: 0 } };
  ctx.vbrainCommit = function (vid) { return Game.vbrainCommit.call(ctx, vid); };
  ctx.winPlanStats = function () { return Game.winPlanStats.call(ctx); };
  return f;
}
(function () {
  // E1: flag ON, dead target + rumor -> LAUNCH on the re-seeded target
  // through the brain (the path that actually fires in sims).
  armEnv();
  const f = brainCtx({ fought: ['reunion'] });
  const r = Game.vbrainExecuteDepart.call(f.ctx, 'v1', 5, 5, false);
  check('§E1 armed brain + rumor: dead-target party_launch LAUNCHES on the reunion',
    r === 'launch', 'r=' + r);
  check('§E1 armed brain + rumor: plan retargeted to reunion, stage hunt, both depart',
    f.plan.target === 'reunion' && f.plan.stage === 'hunt' && !!f.exped.v1 && !!f.exped.v2,
    JSON.stringify({ target: f.plan.target, stage: f.plan.stage, exped: f.exped }));
  check('§E1 armed brain + rumor: planReseeds 1, one beat',
    statsOf(f.ctx).planReseeds === 1 && f.says.length === 1, JSON.stringify({ stats: statsOf(f.ctx), says: f.says }));
  delete process.env.PLANRESEED;
  // E2: flag ON, dead target + no rumor -> 'normal', expired, nobody departs.
  armEnv();
  const g = brainCtx({ fought: [], sightings: [] });
  const r2 = Game.vbrainExecuteDepart.call(g.ctx, 'v1', 5, 5, false);
  check("§E2 armed brain + no rumor: party_launch returns normal (plan expired)",
    r2 === 'normal', 'r2=' + r2);
  check('§E2 armed brain + no rumor: plan expired to party/targetless/stamped, nobody departs',
    g.plan.stage === 'party' && g.plan.target === null && g.plan.reseedExpiryDay === 136 &&
    Object.keys(g.exped).length === 0,
    JSON.stringify({ stage: g.plan.stage, target: g.plan.target, stamp: g.plan.reseedExpiryDay, exped: g.exped }));
  check('§E2 armed brain + no rumor: planExpiries 1',
    statsOf(g.ctx).planExpiries === 1, JSON.stringify(statsOf(g.ctx)));
  // E3: same expired holder, later commit the same day -> 'hold' (silent).
  const r3 = Game.vbrainExecuteDepart.call(g.ctx, 'v1', 5, 5, false);
  check("§E3 expired brain, later same-day commit: returns hold (silent)",
    r3 === 'hold', 'r3=' + r3);
  check('§E3 expired brain: still silent, no second bump, nobody departs',
    g.says.length === 1 && (statsOf(g.ctx).planExpiries || 0) === 1 && Object.keys(g.exped).length === 0,
    JSON.stringify({ says: g.says, stats: statsOf(g.ctx), exped: g.exped }));
  delete process.env.PLANRESEED;
  // E4: flag OFF, same dead-target fixture + rumor -> LAUNCH on the herald.
  const h = brainCtx({ fought: ['reunion'] });
  const r4 = Game.vbrainExecuteDepart.call(h.ctx, 'v1', 5, 5, false);
  check('§E4 unarmed brain: same dead-target fixture LAUNCHES on the herald (old behavior)',
    r4 === 'launch', 'r4=' + r4);
  check('§E4 unarmed brain: plan stays hunt on the herald, no stats, no beat',
    h.plan.stage === 'hunt' && h.plan.target === 'herald' &&
    (statsOf(h.ctx).planReseeds || 0) === 0 && (statsOf(h.ctx).planExpiries || 0) === 0 && h.says.length === 0,
    JSON.stringify({ stage: h.plan.stage, target: h.plan.target, stats: statsOf(h.ctx), says: h.says }));
})();

// ---- §F STAMP METHOD TESTS ----
(function () {
  armEnv();
  const f = reseedCtx({});
  const stamped = Game.winPlanNoteSighting.call(f.ctx, 'herald');
  check('§F stamp: flag on stamps villageLastSeenDay.herald = 136',
    stamped === 136 && f.ctx.state.villageLastSeenDay.herald === 136,
    JSON.stringify({ stamped: stamped, seen: f.ctx.state.villageLastSeenDay }));
  delete process.env.PLANRESEED;
  const g = reseedCtx({});
  const stamped2 = Game.winPlanNoteSighting.call(g.ctx, 'herald');
  check('§F stamp: flag off stamps nothing (no villageLastSeenDay written)',
    stamped2 === null && !('villageLastSeenDay' in g.ctx.state),
    JSON.stringify({ stamped: stamped2, hasKey: ('villageLastSeenDay' in g.ctx.state) }));
})();

// ---- §C DRIVER SMOKE + PANEL (subprocess) ----
(function sectionC() {
  const { spawnSync } = require('child_process');
  const smokeDirCtl = 'perseed-reseed-b-smoke-ctl';
  const smokeDirArm = 'perseed-reseed-b-smoke-arm';
  const baseEnv = { SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1',
    FLEEREPAIR2: '1', FIGHTALLY2: '1', MODE: 'reseed', DAYS: '30',
    SEEDS: '106081' };
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', smokeDirCtl), { recursive: true, force: true }); } catch (e) {}
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', smokeDirArm), { recursive: true, force: true }); } catch (e) {}
  // Armed smoke. RUN names are the judged leg names (control/armed)
  // so the panel builder's fixed nameFns find the smoke files; the
  // OUTDIRs keep the smoke corpora separate from the judged ones.
  const envArm = Object.assign({}, process.env, baseEnv, { PLANRESEED: '1', RUN: 'reseed-b-armed', OUTDIR: smokeDirArm });
  delete envArm.ALLYSLOT3; delete envArm.LAUNCHSURVIVE;
  const ra = spawnSync(process.execPath, [path.join(__dirname, 'reseed-driver-b.js')],
    { cwd: REPO, env: envArm, encoding: 'utf8', timeout: 600000 });
  check('§C armed driver smoke: exit 0 on one 30d seed', ra.status === 0, (ra.stderr || '').slice(0, 300));
  let dd = null;
  try { dd = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-20', smokeDirArm, 'reseed-b-s106081-reseed-b-armed-reseed.json'), 'utf8')); } catch (e) {}
  check('§C armed driver smoke: corpus file written', !!dd, null);
  if (dd) {
    check('§C armed smoke: corpus self-describes the flag (planreseedFlag 1, leverPresent false)',
      dd.planreseedFlag === '1' && dd.leverPresent === false && dd.allyslot3Flag == null,
      { planreseedFlag: dd.planreseedFlag, leverPresent: dd.leverPresent });
    check('§C armed smoke: 0 instrument errors', (dd.instrumentErrors || []).length === 0, dd.instrumentErrors);
    check('§C armed smoke: winPlanStats carries planReseeds + planExpiries',
      dd.winPlanStats && ('planReseeds' in dd.winPlanStats) && ('planExpiries' in dd.winPlanStats),
      dd.winPlanStats ? Object.keys(dd.winPlanStats) : null);
    check('§C armed smoke: arm label is reseed-b', dd.arm === 'reseed-b', dd.arm);
    const launches = (dd.v4departs || []).filter(function (x) { return x.result === 'launch'; });
    const gateKeys = ['stageBefore', 'targetBefore', 'node', 'sinceDay', 'villageSlain',
      'lastFightDay', 'lastFightKill', 'lastFightOutcome', 'daysSinceLastFight',
      'lastSightingDay', 'daysSinceLastSighting'];
    const gatesOk = launches.every(function (x) {
      return x.gate && gateKeys.every(function (k) { return k in x.gate; });
    });
    check('§C armed smoke: every launch row carries a complete gate snapshot (' + launches.length + ' launches in 30d)',
      gatesOk, launches.length);
    const an = AN.analyzeFile(dd);
    check('§C armed smoke: analyzer reads the smoke corpus (launches ' + an.launches + ', gate mismatches ' + an.gateMismatch + ')',
      an.gateMismatch === 0, { launches: an.launches, gateMissing: an.gateMissing, gateMismatch: an.gateMismatch });
  }
  // Control smoke (flag unset) + panel build + compare on the two smoke dirs.
  const envCtl = Object.assign({}, process.env, baseEnv, { RUN: 'reseed-b-control', OUTDIR: smokeDirCtl });
  delete envCtl.ALLYSLOT3; delete envCtl.LAUNCHSURVIVE; delete envCtl.PLANRESEED;
  const rc = spawnSync(process.execPath, [path.join(__dirname, 'reseed-driver-b.js')],
    { cwd: REPO, env: envCtl, encoding: 'utf8', timeout: 600000 });
  check('§C control driver smoke: exit 0 on one 30d seed', rc.status === 0, (rc.stderr || '').slice(0, 300));
  let dc = null;
  try { dc = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-20', smokeDirCtl, 'reseed-b-s106081-reseed-b-control-reseed.json'), 'utf8')); } catch (e) {}
  check('§C control smoke: corpus file written, flag null',
    !!dc && dc.planreseedFlag == null, dc ? dc.planreseedFlag : null);
  if (dc && dd) {
    const rb = spawnSync(process.execPath, [path.join(__dirname, 'build-reseed-b-panels.js'),
      '--before', path.join('evidence', '2026-11-20', smokeDirCtl),
      '--after', path.join('evidence', '2026-11-20', smokeDirArm),
      '--out', path.join('evidence', '2026-11-20', 'reseed-b-smoke-panel'),
      '--seeds', '106081', '--before-seeds', '106081'],
    { cwd: REPO, encoding: 'utf8', timeout: 120000 });
    check('§C panel build on the two smoke corpora: exit 0', rb.status === 0, (rb.stderr || '').slice(0, 300));
    const rp = spawnSync(process.execPath, [path.join(__dirname, 'balance-panel.js'), 'compare',
      '--before', path.join('evidence', '2026-11-20', 'reseed-b-smoke-panel-before.json.gz'),
      '--after', path.join('evidence', '2026-11-20', 'reseed-b-smoke-panel-after.json.gz'),
      '--out', path.join('evidence', '2026-11-20', 'reseed-b-smoke-panel')],
    { cwd: REPO, encoding: 'utf8', timeout: 120000 });
    // balance-panel compare exits 2 unless the decision is
    // 'no_material_signal' — a review_required decision is a
    // successful compare, not a failure. Assert the .md is written
    // and a decision is printed.
    const panelMd = path.join(REPO, 'evidence', '2026-11-20', 'reseed-b-smoke-panel.md');
    check('§C balance-panel compare on the smoke panels: writes the .md (exit 0 or 2, decision printed)',
      (rp.status === 0 || rp.status === 2) && fs.existsSync(panelMd) && /review_required|no_material_signal|material_signal/.test(rp.stdout || ''),
      { status: rp.status, out: (rp.stdout || '').slice(0, 120), mdExists: fs.existsSync(panelMd) });
  }
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', smokeDirCtl), { recursive: true, force: true }); } catch (e) {}
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', smokeDirArm), { recursive: true, force: true }); } catch (e) {}
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', 'reseed-b-smoke-panel-before.json.gz'), { force: true }); } catch (e) {}
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', 'reseed-b-smoke-panel-after.json.gz'), { force: true }); } catch (e) {}
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', 'reseed-b-smoke-panel.md'), { force: true }); } catch (e) {}
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', 'reseed-b-smoke-panel.json'), { force: true }); } catch (e) {}

  // Guard: ALLYSLOT3=1 must refuse before any sim runs.
  const envGuard = Object.assign({}, process.env, baseEnv, { ALLYSLOT3: '1', DAYS: '1',
    RUN: 'reseed-guard', OUTDIR: 'perseed-reseed-b-guard' });
  const rg = spawnSync(process.execPath, [path.join(__dirname, 'reseed-driver-b.js')],
    { cwd: REPO, env: envGuard, encoding: 'utf8', timeout: 120000 });
  check('§C guard: ALLYSLOT3=1 refuses (exit 2, landed substrate only)',
    rg.status === 2 && /ALLYSLOT3 must be unset/.test(rg.stderr || ''), { status: rg.status, err: (rg.stderr || '').slice(0, 160) });
  try { fs.rmSync(path.join(REPO, 'evidence', '2026-11-20', 'perseed-reseed-b-guard'), { recursive: true, force: true }); } catch (e) {}
})();

// ---- §D LIVE FIELD-FIGHT STAMP (sim-harness, one real fight) ----
(async function sectionD() {
  let harness = null;
  try { harness = require(path.join(REPO, 'scripts', 'sim-harness')); } catch (e) {
    check('§D live stamp: sim-harness loads', false, String(e.message)); finish(); return;
  }
  try {
    process.env.PLANRESEED = '1';
    const { Game: LG } = await harness.loadGame({ seed: 106084, mode: 'reseed-test', fullTelemetry: false });
    await harness.setupGame(LG);
    const day0 = ((LG.state || {}).scholar || {}).day || 0;
    const herald = (LG.data.monsters || []).find(function (m) { return m.id === 'herald'; });
    check('§D live stamp: herald def exists', !!herald, null);
    const roster = ((LG.state || {}).village || {}).roster || [];
    const vid = roster.find(function (id) { return id && id !== LG.villagerId; });
    check('§D live stamp: a villager exists to fight', !!vid, 'roster=' + roster.length);
    if (herald && vid) {
      let rec = null;
      try { rec = LG.fieldFight(vid, herald, null, {}); } catch (e) { rec = null; }
      check('§D live stamp: fieldFight returns a record', !!rec && !!rec.outcome, rec ? rec.outcome : null);
      const seen = ((LG.state || {}).villageLastSeenDay || {}).herald;
      check('§D live stamp: flag on stamps villageLastSeenDay.herald = today (' + day0 + ')',
        seen === day0, JSON.stringify({ seen: seen, day: day0, outcome: rec && rec.outcome }));
    }
  } catch (e) {
    check('§D live stamp: live fight runs without throwing', false, String((e && e.message) || e).slice(0, 300));
  } finally {
    delete process.env.PLANRESEED;
    // Off-mode: a second loaded game must stamp nothing.
    try {
      const { Game: LG2 } = await harness.loadGame({ seed: 106084, mode: 'reseed-test-off', fullTelemetry: false });
      await harness.setupGame(LG2);
      const herald2 = (LG2.data.monsters || []).find(function (m) { return m.id === 'herald'; });
      const roster2 = ((LG2.state || {}).village || {}).roster || [];
      const vid2 = roster2.find(function (id) { return id && id !== LG2.villagerId; });
      if (herald2 && vid2) {
        try { LG2.fieldFight(vid2, herald2, null, {}); } catch (e2) {}
        check('§D live stamp: flag off stamps nothing (no villageLastSeenDay key)',
          !('villageLastSeenDay' in (LG2.state || {})),
          JSON.stringify({ hasKey: ('villageLastSeenDay' in (LG2.state || {})) }));
      } else {
        check('§D live stamp: off-mode fixture has a fighter', false, null);
      }
    } catch (e) {
      check('§D live stamp: off-mode run loads', false, String((e && e.message) || e).slice(0, 300));
    }
    finish();
  }
})();

function finish() {
  console.log('test-reseed-b: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed === 0 ? 0 : 1);
}
