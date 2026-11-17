// test-nightcarry-a.js — proof for arm sim-nightcarry-a (BUILD lever:
// carry a part-2 party_launch commit across the night tick).
// Proves, on synthetic fixtures and live in-memory runs (no corpus
// numbers): the NIGHTCARRY gate text is present in villager-brain.js,
// the profile-gate bypass is untouched, the vetparty seed call is NOT
// re-landed (only the VETREENGAGE env-gated call exists in game.js),
// the game-code diff is villager-brain.js only, the wave-4 id set
// matches the data, the driver wraps/defines the recorder surface,
// the classifier joins a carried launch to its carry row, and — the
// OBSERVABLE effect, in live child probes (one loadGame per process):
// a part-2 party_launch commit that dies at the night tick is
// re-issued at the next dawn with the SAME holder + companion
// (never re-picked) and launches with a carried departure line —
// while the identical probe with NIGHTCARRY unset shows the commit
// DYING (old-code-fails control), a companion made away before dawn
// refuses the carry, and a hunt-stage plan is never carried.
// Encounter gear (Steve 2026-11-13): the probe stages a geared
// holder + geared companion (fire-hardened spear + hide armor — the
// mid-build set from the MONSTER-WAVES sim anchor), never a fresh
// un-geared solo scholar.
// Usage:
//   node scripts/test-nightcarry-a.js            (NIGHTCARRY lever ON)
//   NIGHTCARRY_PROBE=armed node scripts/test-nightcarry-a.js   (probe child: armed)
//   NIGHTCARRY_PROBE=off node scripts/test-nightcarry-a.js     (probe child: control)
//   NIGHTCARRY_PROBE=bound node scripts/test-nightcarry-a.js   (probe child: companion away)
//   NIGHTCARRY_PROBE=hunt node scripts/test-nightcarry-a.js    (probe child: hunt-stage plan)
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const PROBE_MODE = process.env.NIGHTCARRY_PROBE || null;

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL: ' + name + (detail ? ' — ' + detail : '')); }
}
function gitStatus(dir) {
  try {
    return execSync('git status --porcelain -- ' + dir, { cwd: REPO }).toString().trim();
  } catch (e) { return 'GIT-UNAVAILABLE'; }
}

// ---------- Probe child: one live game, one carry scenario ----------
async function probeChild() {
  const mode = PROBE_MODE; // 'armed' | 'off' | 'bound' | 'hunt'
  if (mode === 'armed' || mode === 'bound' || mode === 'hunt') process.env.NIGHTCARRY = '1';
  else delete process.env.NIGHTCARRY;
  const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { Game } = await loadGame({ seed: 777001, mode: 'nightcarry-probe-' + mode, fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village;
  const hx = (v.px != null ? v.px : 4), hy = (v.py != null ? v.py : 4);
  const today = ((Game.state.scholar || {}).day || 0);
  const obs = { mode: mode, seed: 777001, day0: today };
  function atHaven(rid) {
    try { const n = Game.npcNode(rid); return !!(n && n.nx === hx && n.ny === hy); } catch (e) { return false; }
  }
  function dangerOff(rid) {
    try { return !Game.npcTrigger(rid, 'expedition_launch'); } catch (e) { return true; }
  }
  function gearOf(vid) {
    try {
      const person = Game.getPerson ? Game.getPerson(vid) : null;
      const S = globalThis.Scattering || {};
      const eq = S.equipment || null;
      const items = Game.data ? Game.data.items : [];
      const armorP = (eq && eq.armorOf) ? (eq.armorOf(person, items) || 0) : 0;
      const weaponB = (eq && eq.weaponBonusOf) ? ((eq.weaponBonusOf(person, items, 'melee') || 0) + (eq.weaponBonusOf(person, items, 'ranged') || 0)) : 0;
      return { armed: weaponB > 0, armored: armorP > 0, armorP: armorP, weaponB: weaponB };
    } catch (e) { return { armed: false, armored: false, armorP: 0, weaponB: 0 }; }
  }
  // Encounter gear: fire-hardened spear + hide armor, granted as
  // fixture items, then auto-equipped through the game's own path.
  function gearUpFixture(vid) {
    try {
      const person = Game.getPerson ? Game.getPerson(vid) : null;
      if (!person) return;
      person.items = person.items || [];
      if (person.items.indexOf('fire_hardened_spear') === -1) person.items.push('fire_hardened_spear');
      if (person.items.indexOf('hide_armor') === -1) person.items.push('hide_armor');
      const S = globalThis.Scattering || {};
      if (S.equipment && S.equipment.autoEquip) S.equipment.autoEquip(person, Game.data.items);
      if (Game.villagerGearUp) Game.villagerGearUp(vid, false);
    } catch (e) {}
  }
  let holder = null;
  for (const rid of (v.roster || [])) {
    if (rid === Game.villagerId) continue;
    let prof = null; try { prof = Game.npcRangeProfile(rid); } catch (e) {}
    if (prof !== 'wanderer' && prof !== 'explorer') continue;
    if (!atHaven(rid)) continue;
    try { if (Game.isEngaged && Game.isEngaged(rid)) continue; } catch (e) {}
    if (((v.away || {})[rid])) continue;
    if (!dangerOff(rid)) continue;
    holder = rid; break;
  }
  obs.holder = holder;
  if (!holder) { console.log(JSON.stringify(obs)); return; }
  let companion = null, trustStaged = false;
  for (const rid of (v.roster || [])) {
    if (rid === Game.villagerId || rid === holder) continue;
    let prof = null; try { prof = Game.npcRangeProfile(rid); } catch (e) {}
    if (prof !== 'wanderer' && prof !== 'explorer') continue;
    if (!atHaven(rid)) continue;
    try { if (Game.isEngaged && Game.isEngaged(rid)) continue; } catch (e) {}
    if (((v.away || {})[rid])) continue;
    const trust = ((v.trust || {})[rid] === undefined) ? 10 : v.trust[rid];
    if (trust < 15) continue;
    companion = rid; break;
  }
  if (!companion) {
    for (const rid of (v.roster || [])) {
      if (rid === Game.villagerId || rid === holder) continue;
      let prof = null; try { prof = Game.npcRangeProfile(rid); } catch (e) {}
      if (prof !== 'wanderer' && prof !== 'explorer') continue;
      if (!atHaven(rid)) continue;
      companion = rid;
      v.trust = v.trust || {}; v.trust[rid] = 50; trustStaged = true;
      break;
    }
  }
  obs.companion = companion; obs.trustStaged = trustStaged;
  if (!companion) { console.log(JSON.stringify(obs)); return; }
  gearUpFixture(holder); gearUpFixture(companion);
  obs.holderGear = gearOf(holder); obs.companionGear = gearOf(companion);
  // Capture say lines for the carried departure line.
  const said = [];
  const origSay = Game.say;
  try {
    Game.say = function () {
      try { if (typeof arguments[0] === 'string') said.push(String(arguments[0])); } catch (e) {}
      return origSay.apply(this, arguments);
    };
  } catch (e) {}
  // Wave-4 plan at party stage (hunt stage for the 'hunt' variant).
  v.winPlan = v.winPlan || {};
  v.winPlan[holder] = { stage: (mode === 'hunt' ? 'hunt' : 'party'), target: 'strike', needWave: 4, party: [], sinceDay: today, holdSinceDay: -1 };
  // Write the part-2 commit through the REAL scorer (win-plan
  // override, no core candidates — the override picks party_launch).
  Game.dayPart = 2;
  let picked = null;
  try {
    picked = Game.vbrainScorePick(holder,
      [{ kind: 'EXPEDITION', w: 5.0, vbrainSrc: 'win_plan', winPlanAction: 'party_launch', companion: companion }],
      { rng: function () { return 0.5; } });
  } catch (e) { obs.scorePickError = String(e && e.message); }
  let commit = null;
  try { commit = Game.vbrainCommit ? Game.vbrainCommit(holder) : null; } catch (e) {}
  obs.commitPart2 = commit ? { day: commit.day, part: commit.part, kind: commit.kind, winPlanAction: commit.winPlanAction, companion: commit.companion } : null;
  obs.pickedKind = picked ? picked.kind : null;
  // Night tick: part 3 agencyTick must NOT depart anyone.
  Game.dayPart = 3;
  try { Game.agencyTick(); } catch (e) { obs.nightTickError = String(e && e.message); }
  let expedAfterNight = false;
  try { const a = Game.agencyState ? Game.agencyState() : null; expedAfterNight = !!(a && a.exped && (a.exped[holder] || a.exped[companion])); } catch (e) {}
  obs.nightLaunched = expedAfterNight;
  // Bound variant: the companion goes away before dawn.
  if (mode === 'bound') {
    try {
      const a = Game.agencyState ? Game.agencyState() : null;
      if (a) a.exped[companion] = { tx: 6, ty: 6, dist: 2, legs: 0, sinceDay: today, sincePart: 3, duration: 12, finds: [], encounters: [] };
      v.away = v.away || {};
      v.away[companion] = { nx: 6, ny: 6, purpose: 'expedition' };
    } catch (e) {}
  }
  // Next dawn: score with CORE-ONLY candidates (no win-plan bid) —
  // a carried commit must win anyway; a fresh pick must NOT.
  const day1 = today + 1;
  try { Game.state.scholar.day = day1; } catch (e) {}
  Game.dayPart = 0;
  let dawnPick = null;
  try {
    dawnPick = Game.vbrainScorePick(holder,
      [{ kind: 'FORAGE', w: 9.0 }, { kind: 'HAVEN_CHORE', w: 1.0, chore: 'fire' }],
      { rng: function () { return 0.5; } });
  } catch (e) { obs.dawnScoreError = String(e && e.message); }
  let commitDawn = null, lastLog = null;
  try { commitDawn = Game.vbrainCommit ? Game.vbrainCommit(holder) : null; } catch (e) {}
  try { lastLog = Game.vbrainLastLog ? Game.vbrainLastLog(holder) : null; } catch (e) {}
  obs.dawnPickKind = dawnPick ? dawnPick.kind : null;
  obs.commitDawn = commitDawn ? { day: commitDawn.day, part: commitDawn.part, kind: commitDawn.kind, winPlanAction: commitDawn.winPlanAction, companion: commitDawn.companion, carried: !!commitDawn.carried, carriedFrom: commitDawn.carriedFrom != null ? commitDawn.carriedFrom : null, carriedFromPart: commitDawn.carriedFromPart != null ? commitDawn.carriedFromPart : null } : null;
  obs.lastLogMode = lastLog ? (lastLog.mode || null) : null;
  obs.lastLogOverride = lastLog ? (lastLog.override || null) : null;
  // Daytime tick: part 1 agencyTick. Player at Haven so the
  // departure is announced.
  try { if (!Game.map) Game.map = {}; Game.map.px = hx; Game.map.py = hy; } catch (e) {}
  try { obs.playerAtHaven = (Game.map.px === hx && Game.map.py === hy); } catch (e) { obs.playerAtHaven = false; }
  Game.dayPart = 1;
  try { Game.agencyTick(); } catch (e) { obs.launchTickError = String(e && e.message); }
  let holderExped = false, compExped = false;
  try {
    const a = Game.agencyState ? Game.agencyState() : null;
    holderExped = !!(a && a.exped && a.exped[holder]);
    compExped = !!(a && a.exped && a.exped[companion]);
  } catch (e) {}
  obs.launchHolderExped = holderExped; obs.launchCompanionExped = compExped;
  obs.planStageAfter = v.winPlan[holder] ? v.winPlan[holder].stage : null;
  obs.carriedLine = said.some(function (s) { return /yesterday's plan/i.test(s); });
  obs.carriedLines = said.filter(function (s) { return /yesterday's plan/i.test(s); }).slice(0, 2);
  console.log(JSON.stringify(obs));
}

if (PROBE_MODE) {
  probeChild().catch(function (e) { console.error(e.stack); process.exit(1); });
  return;
}

// ---------- 1. Static ----------
console.log('== static ==');
const brainJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
check('NIGHTCARRY gate present (nightcarryOn + env check)', brainJs.indexOf('function nightcarryOn') !== -1 && brainJs.indexOf("process.env.NIGHTCARRY === '1'") !== -1);
check('carry hook present in vbrainScorePick (night_carry override)', brainJs.indexOf("override: 'night_carry'") !== -1 && brainJs.indexOf('carriedFrom') !== -1);
check('carried departure line present (yesterday\'s plan)', brainJs.indexOf("yesterday\\'s plan") !== -1);
check('writeCommit persists carried fields', brainJs.indexOf('carried: !!chosen.carried') !== -1);
check('carry is one-night-only (never carry a carried commit)', brainJs.indexOf('!_nc0.carried') !== -1);
check('carry is party-stage-only', brainJs.indexOf("_ncPlan.stage === 'party'") !== -1);
const agencyJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-agency.js'), 'utf8');
check('profile-gate bypass untouched (launchdef text intact)',
  agencyJs.indexOf('PROFILEGATE (sim-profilegate-a)') !== -1 &&
  agencyJs.indexOf("winPlanAction === 'party_launch'") !== -1);
const gameJs = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
const seedCallHits = (gameJs.match(/winPlanSeedFromFight\(vid, mdef, 'fled'\)/g) || []).length;
let seedCallGated = false;
try {
  const idx = gameJs.indexOf("winPlanSeedFromFight(vid, mdef, 'fled')");
  seedCallGated = idx !== -1 && gameJs.slice(Math.max(0, idx - 600), idx).indexOf("VETREENGAGE === '1'") !== -1;
} catch (e) {}
check('vetparty seed call NOT re-landed (exactly 1 fled seed call, inside the VETREENGAGE env gate)',
  seedCallHits === 1 && seedCallGated, 'hits=' + seedCallHits + ' gated=' + seedCallGated);
check('no un-gated VETPARTY seed block in game.js', gameJs.indexOf('VETPARTY (sim-vetparty-a)') === -1);
const srcStatus = gitStatus('src').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
const srcOk = srcStatus.every(function (s) { return /src\/js\/villager-brain\.js$/.test(s); });
check('game-code worktree diff is villager-brain.js only (src status: ' + JSON.stringify(srcStatus) + ')', srcOk);
const scriptsStatus = gitStatus('scripts').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
const scriptsOk = scriptsStatus.every(function (s) { return /scripts\/[a-z-]*nightcarry-[a-z0-9.-]+\.js$/.test(s); });
check('scripts worktree diff is nightcarry-* files only (' + JSON.stringify(scriptsStatus) + ')', scriptsOk);
const driverSrc = fs.readFileSync(path.join(REPO, 'scripts', 'nightcarry-driver-20261117.js'), 'utf8');
for (const w of ['vbrainScorePick', 'vbrainExecuteDepart', 'winPlanSeedFromFight', 'startExpedition', 'agencyTick', 'installSkipRecorder', 'dawnbidScores', 'dawnbidDeparts', 'dawnbidCensus', 'dawnbidStarts', 'nightcarrySkips', 'nightcarryCarries', 'commitKindOf', 'competent']) {
  check('driver wraps/defines ' + w, driverSrc.indexOf(w) !== -1);
}
check('driver has NIGHTCARRY_RECORDER off-switch', driverSrc.indexOf('NIGHTCARRY_RECORDER') !== -1);
check('driver refuses to overwrite per-seed files', driverSrc.indexOf('refusing to overwrite') !== -1);
check('driver sets NIGHTCARRY per leg (control OFF, on = 1)', driverSrc.indexOf("process.env.NIGHTCARRY = (MODE === 'on' ? '1' : '0')") !== -1);
check('driver records carried flags on depart rows', driverSrc.indexOf('carried: !!commit.carried') !== -1);
// Wave-4 id set matches the data exactly.
const rawMon = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const liveW4 = (rawMon.monsters || rawMon).filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
const frozenW4 = ['algorithm', 'audit', 'congregation', 'eater', 'eulogy', 'herald', 'influencer', 'reunion', 'strike', 'suburb'];
check('wave-4 id set matches the data', JSON.stringify(liveW4) === JSON.stringify(frozenW4), 'live=' + JSON.stringify(liveW4));

// ---------- 2. Classifier: carried-launch join (fixture level) ----------
console.log('== classifier fixtures ==');
const ANALYZE = require(path.join(REPO, 'scripts', 'analyze-nightcarry-a.js'));
function fakeSeed(o) {
  return {
    seed: o.seed, days: 150, gameDays: 150, endReason: 'survived', standing: 120, scaleRank: 'regional',
    won: false, maxWave: 4, villageLost: false, instrumentErrors: [],
    deaths: [], daily: [{ day: 150, waveKillLog: [], roster: [] }],
    v4seeds: [{ day: 50, vid: o.holder, mid: 'strike', wave: 4, outcome: 'fled', stageAfter: 'party', target: 'strike', node: { nx: 4, ny: 4 } }],
    dawnbidScores: [
      { seq: 1, day: 50, part: 0, vid: o.holder, cands: [{ kind: 'EXPEDITION', w: 5, winPlanAction: 'party_launch', companion: o.companion }], pick: { kind: 'EXPEDITION', winPlanAction: 'party_launch', override: 'win_plan:party_launch', corePick: 'HAVEN_CHORE' }, logCands: [{ kind: 'EXPEDITION', score: 5, winPlanAction: 'party_launch' }], commit: { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: o.companion }, plan: { stage: 'party', target: 'strike', needWave: 4, party: [] }, holderGear: { armed: true, armored: true } },
      { seq: 2, day: o.launchDay, part: 0, vid: o.holder, cands: [{ kind: 'FORAGE', w: 9 }], pick: { kind: 'EXPEDITION', winPlanAction: 'party_launch', override: 'night_carry', corePick: 'FORAGE', mode: 'carry' }, logCands: [{ kind: 'EXPEDITION', score: 1, winPlanAction: 'party_launch' }], commit: { kind: 'EXPEDITION', winPlanAction: 'party_launch', companion: o.companion, carried: o.carried, carriedFrom: o.carried ? o.launchDay - 1 : null, carriedFromPart: o.carried ? 2 : null }, plan: { stage: 'party', target: 'strike', needWave: 4, party: [] }, holderGear: { armed: true, armored: true } },
    ],
    dawnbidDeparts: [
      { seq: 3, day: o.launchDay, vid: o.holder, source: 'brain', result: 'launch', winPlanAction: 'party_launch', commitKind: 'dawn', commitPart: 0, carried: o.carried, carriedFrom: o.carried ? o.launchDay - 1 : null, companion: o.companion, vidExped: true, companionExped: true, vidBlock: null, companionBlock: null, stage: 'hunt', target: 'strike', party: [o.companion] },
    ],
    dawnbidCensus: [{ day: 150, vid: o.holder, target: 'strike', needWave: 4, stage: 'hunt', party: [o.companion], holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false, holderSick: false, holderHealth: 100, holderGear: { armed: true, armored: true } }],
    dawnbidStarts: [],
    nightcarrySkips: [],
    nightcarryCarries: o.carried ? [{ seq: 4, day: o.launchDay, part: 0, vid: o.holder, companion: o.companion, carriedFrom: o.launchDay - 1, carriedFromPart: 2, plan: { stage: 'party', target: 'strike' } }] : [],
    v4departs: [], v4gates: [], v4encounters: [],
  };
}
const fxCarried = ANALYZE.classifySeed(fakeSeed({ seed: 103101, holder: 'ana_test', companion: 'ben_test', launchDay: 60, carried: true }));
const fxFresh = ANALYZE.classifySeed(fakeSeed({ seed: 103102, holder: 'ana_test', companion: 'ben_test', launchDay: 60, carried: false }));
check('classifier: carried launch is launched with :carried sub', fxCarried.instances.length === 1 && fxCarried.instances[0].bucket === 'launched' && /:carried$/.test(fxCarried.instances[0].sub || ''), 'got ' + JSON.stringify(fxCarried.instances.map(function (x) { return [x.bucket, x.sub]; })));
check('classifier: carried launch counts carriedDays=1, carriedLaunches=1', fxCarried.instances[0].carriedDays === 1 && fxCarried.instances[0].carriedLaunches === 1 && fxCarried.instances[0].carriedFromPart2 === 1, JSON.stringify({ d: fxCarried.instances[0].carriedDays, l: fxCarried.instances[0].carriedLaunches, p2: fxCarried.instances[0].carriedFromPart2 }));
check('classifier: fresh launch is launched without :carried sub', fxFresh.instances.length === 1 && fxFresh.instances[0].bucket === 'launched' && !/:carried$/.test(fxFresh.instances[0].sub || ''), 'got ' + JSON.stringify(fxFresh.instances.map(function (x) { return [x.bucket, x.sub]; })));
check('classifier: fresh launch counts carriedDays=0, carriedLaunches=0', fxFresh.instances[0].carriedDays === 0 && fxFresh.instances[0].carriedLaunches === 0);
(function () {
  const leg = { bySeed: { 103101: fxCarried }, files: ['a.json'] };
  const sum = ANALYZE.summarize(leg);
  check('summarize returns files as a count (not an array)', sum.files === 1, 'got ' + JSON.stringify(sum.files));
  check('summarize carries carry totals (carried=1, launched=1, conversion=1)', sum.carried === 1 && sum.carriedLaunched === 1 && sum.carryConversion === 1, JSON.stringify({ c: sum.carried, l: sum.carriedLaunched, conv: sum.carryConversion }));
})();

// ---------- 3. Live probes (child processes, one loadGame each) ----------
console.log('== live probes ==');
function runProbe(mode) {
  const env = Object.assign({}, process.env, { NIGHTCARRY_PROBE: mode });
  delete env.NIGHTCARRY;
  const out = execFileSync('node', [path.join(REPO, 'scripts', 'test-nightcarry-a.js')], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out.trim().split('\n').pop());
}
const armed = runProbe('armed');
const off = runProbe('off');
const bound = runProbe('bound');
const hunt = runProbe('hunt');
function probeOk(o) {
  return !!(o && o.holder && o.companion && o.commitPart2 && o.commitPart2.winPlanAction === 'party_launch' && o.commitPart2.part === 2);
}
check('probe fixtures staged (holder + companion + part-2 commit, all modes)',
  probeOk(armed) && probeOk(off) && probeOk(bound) && probeOk(hunt),
  JSON.stringify({ armed: armed.commitPart2, off: off.commitPart2, bound: bound.commitPart2, hunt: hunt.commitPart2 }));
check('probe fixtures are encounter-geared (holder + companion armed + armored)',
  armed.holderGear && armed.holderGear.armed && armed.holderGear.armored && armed.companionGear && armed.companionGear.armed && armed.companionGear.armored,
  JSON.stringify({ h: armed.holderGear, c: armed.companionGear }));
check('probe fixtures agree across modes (same holder, companion, commit day)',
  armed.holder === off.holder && armed.companion === off.companion && armed.commitPart2.day === off.commitPart2.day,
  JSON.stringify({ armed: [armed.holder, armed.companion, armed.commitPart2.day], off: [off.holder, off.companion, off.commitPart2.day] }));
check('night tick: no launch in EITHER leg (commit dies at night in both)',
  armed.nightLaunched === false && off.nightLaunched === false,
  JSON.stringify({ armed: armed.nightLaunched, off: off.nightLaunched }));
// ARMED: the carry.
check('armed dawn: the SAME commit is re-issued (carried, same companion, carriedFrom=yesterday)',
  armed.commitDawn && armed.commitDawn.carried === true && armed.commitDawn.companion === armed.companion &&
  armed.commitDawn.carriedFrom === armed.day0 && armed.commitDawn.carriedFromPart === 2 &&
  armed.commitDawn.winPlanAction === 'party_launch',
  JSON.stringify(armed.commitDawn));
check('armed dawn: the pick is the carried EXPEDITION, not the fresh FORAGE (no re-roll)',
  armed.dawnPickKind === 'EXPEDITION' && armed.lastLogMode === 'carry' && armed.lastLogOverride === 'night_carry',
  JSON.stringify({ pick: armed.dawnPickKind, mode: armed.lastLogMode, override: armed.lastLogOverride }));
check('armed launch: BOTH expeditions started, plan at hunt',
  armed.launchHolderExped === true && armed.launchCompanionExped === true && armed.planStageAfter === 'hunt',
  JSON.stringify({ h: armed.launchHolderExped, c: armed.launchCompanionExped, stage: armed.planStageAfter }));
check('armed launch: the carried departure line reads as yesterday\'s plan',
  armed.carriedLine === true, JSON.stringify(armed.carriedLines));
// OFF: old-code-fails control — the SAME probe, the commit dies.
check('OFF dawn: NO carry — a fresh FORAGE pick overwrites the dead commit',
  off.commitDawn && off.commitDawn.carried !== true && off.dawnPickKind === 'FORAGE' && off.lastLogMode !== 'carry',
  JSON.stringify({ pick: off.dawnPickKind, mode: off.lastLogMode, commit: off.commitDawn }));
check('OFF launch: no departure at the daytime tick (the commit died at night)',
  off.launchHolderExped === false && off.launchCompanionExped === false,
  JSON.stringify({ h: off.launchHolderExped, c: off.launchCompanionExped }));
check('OFF launch: no carried departure line', off.carriedLine === false);
// BOUND: companion away before dawn refuses the carry.
check('BOUND dawn: NO carry when the committed companion is away',
  bound.commitDawn && bound.commitDawn.carried !== true && bound.dawnPickKind === 'FORAGE',
  JSON.stringify({ pick: bound.dawnPickKind, commit: bound.commitDawn }));
// HUNT: a hunt-stage plan is never carried.
check('HUNT dawn: NO carry for a hunt-stage plan',
  hunt.commitDawn && hunt.commitDawn.carried !== true && hunt.dawnPickKind === 'FORAGE',
  JSON.stringify({ pick: hunt.dawnPickKind, commit: hunt.commitDawn }));

// ---------- 4. Live driver run (5d, seed 103101, control leg) ----------
console.log('== live driver run ==');
async function liveRuns() {
  process.env.DAYS = '5';
  delete require.cache[require.resolve(path.join(REPO, 'scripts', 'nightcarry-driver-20261117.js'))];
  const driver = require(path.join(REPO, 'scripts', 'nightcarry-driver-20261117.js'));
  const out = await driver.oneRun(103101);
  check('live run completes with 0 instrument errors', out.instrumentErrors.length === 0, JSON.stringify(out.instrumentErrors.slice(0, 3)));
  check('live run carries dawnbid arrays', Array.isArray(out.dawnbidScores) && Array.isArray(out.dawnbidDeparts) && Array.isArray(out.dawnbidCensus) && Array.isArray(out.dawnbidStarts));
  check('live run carries nightcarrySkips array', Array.isArray(out.nightcarrySkips));
  check('live run carries nightcarryCarries array', Array.isArray(out.nightcarryCarries));
  check('live run carries carriedSays array', Array.isArray(out.carriedSays));
  check('live run carries v4 arrays', Array.isArray(out.v4seeds) && Array.isArray(out.v4departs) && Array.isArray(out.v4gates) && Array.isArray(out.v4encounters));
  check('live run policy is competent', out.policy === 'competent', 'got ' + out.policy);
  const expPolicySha = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8')).digest('hex').slice(0, 12);
  check('live run policy sha is competent.js', out.policySha === expPolicySha, 'got ' + out.policySha + ' expected ' + expPolicySha);
  check('live run NIGHTCARRY is OFF on the control leg', process.env.NIGHTCARRY === '0', 'got ' + process.env.NIGHTCARRY);
  const KNOWN_SKIP = ['holder-dead', 'engaged', 'away-as-companion', 'away-on-expedition', 'profile-gate-veto', 'not-at-haven', 'night', 'indoor-objective', 'danger-gate', 'execute-returned-normal', 'other'];
  const badSkip = (out.nightcarrySkips || []).find(function (r) { return !(r && typeof r.day === 'number' && typeof r.part === 'number' && r.vid && r.target && KNOWN_SKIP.indexOf(r.reason) !== -1 && r.raw && typeof r.raw === 'object'); });
  check('skip rows have their shape + a known reason', !badSkip, badSkip ? JSON.stringify(badSkip).slice(0, 200) : '');
  const badScore = (out.dawnbidScores || []).find(function (r) { return !(r && typeof r.day === 'number' && typeof r.part === 'number' && r.vid && Array.isArray(r.cands) && r.plan !== undefined); });
  check('score rows have their shape', !badScore, badScore ? JSON.stringify(badScore).slice(0, 200) : '');
  const badDepart = (out.dawnbidDeparts || []).find(function (r) { return !(r && typeof r.day === 'number' && r.vid && ('vidExped' in r) && ('companionExped' in r) && ('carried' in r)); });
  check('depart rows have their shape + carried flag', !badDepart, badDepart ? JSON.stringify(badDepart).slice(0, 200) : '');
  return out;
}

// ---------- 5. Determinism legs D1 + D2 (30d, seed 103101) ----------
console.log('== determinism legs D1/D2 ==');
function childFingerprint(envExtra) {
  const env = Object.assign({}, process.env, { DAYS: '30' }, envExtra || {});
  delete env.NIGHTCARRY_PROBE;
  const script = "const d=require('./scripts/nightcarry-driver-20261117.js');" +
    "d.oneRun(103101).then(function(o){" +
    "const fp={deaths:o.deaths,days:o.days,gameDays:o.gameDays,endReason:o.endReason,standing:o.standing,scaleRank:o.scaleRank,won:o.won,maxWave:o.maxWave,daily:o.daily};" +
    "console.log(JSON.stringify({fp:fp,full:o}));" +
    "}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const out = execFileSync('node', ['-e', script], { cwd: REPO, env: env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return JSON.parse(out.trim());
}
async function determinism() {
  const a = childFingerprint({});
  const b = childFingerprint({});
  check('D1 repeatability: identical full corpus, recorder ON twice (30d)',
    JSON.stringify(a.full) === JSON.stringify(b.full));
  const off = childFingerprint({ NIGHTCARRY_RECORDER: 'off' });
  check('D2 wrap neutrality: identical trajectories, recorder ON vs OFF (30d)',
    JSON.stringify(a.fp) === JSON.stringify(off.fp),
    'on=' + JSON.stringify(a.fp).slice(0, 200) + ' off=' + JSON.stringify(off.fp).slice(0, 200));
  check('D2 recorder-off run carries empty dawnbid/v4 arrays',
    (off.full.dawnbidScores || []).length === 0 && (off.full.v4seeds || []).length === 0 &&
    (off.full.dawnbidCensus || []).length === 0 && (off.full.nightcarrySkips || []).length === 0);
  check('D2 recorder-off run has 0 instrument errors', (off.full.instrumentErrors || []).length === 0);
}

(async function () {
  try { await liveRuns(); } catch (e) { check('live driver run completes', false, String(e && e.stack || e).slice(0, 300)); }
  try { await determinism(); } catch (e) { check('determinism legs complete', false, String(e && e.stack || e).slice(0, 300)); }
  console.log('== result: ' + pass + ' passed, ' + fail + ' failed ==');
  if (fail) { console.log('failures:\n' + failures.map(function (f) { return '  - ' + f; }).join('\n')); process.exitCode = 1; }
})().catch(function (e) { console.error(e.stack); process.exit(1); });
