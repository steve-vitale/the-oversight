// launchsilence-driver-a.js — DIAG recorder, arm sim-launchsilence-a
// (the 0815Z round's named next blank #2: THE LAUNCH FUNNEL'S SILENCE —
// 11/16 villages launch NOTHING on either leg of the homebody band.
// A copy of scripts/planignite-driver-20261116.js — the proven
// launchfunnel + planignite instrument (v4seeds / v4departs / v4gates /
// v4encounters / dawnbidScores / dawnbidDeparts / dawnbidCensus /
// dawnbidStarts / companionPool / v4creates / planCensus /
// havenTickCalls / tickGates / tickGateChecks / tickGateTotals /
// igniteCensus / igniteVillage) — with the deltas recorded in
// evidence/2026-11-23/sim-launchsilence-a-prereg.md:
//   1. Output evidence dir 2026-11-23 (EVIDENCE_DATE override).
//   2. Arm/run 'launchsilence-a', MODE ctl (single control leg).
//   3. Policy module scripts/policies/tableseat-nowait.js, layers OFF
//      (TABLESEATNOWAIT + LEANLINKRESCUE unset -> competent verbatim
//      by the modules' own det-gates); the CLI refuses to run if
//      either layer flag is '1'. All three policy shas recorded.
//   4. Anchor pin (launchfield section-6 fix): FROZEN_BASE below is
//      the frozen base literal — NEVER a run-time merge-base. The CLI
//      refuses to run unless run-time HEAD IS the frozen base.
//   5. NEW funnelStage stream: one row per seed-day (end-of-day pure
//      reads in the existing daily pass) — village alive/lost,
//      standing, unlockedWave, wave-4+ plans held, havenTick calls,
//      creations, depart attempts, launches, and `stage` = highest
//      funnel stage reached by end of that day (0 no-plan / 1
//      plan-exists / 2 plan-considered-at-dawn / 3 depart-attempted /
//      4 launched). Plus a funnelVillage end-of-run row per seed.
//   6. NEW deadTargetChecks stream: wrap of winPlanCommitDeadTarget
//      (pure read of its return + plan target before/after) so the
//      no-target stage is measured, not guessed.
//   7. The winPlanDepart wrap additionally records, read BEFORE the
//      call: stageBefore, holder gear (armed/armored), holder
//      launch-block (deriveLaunchBlock replica) — so a hold row
//      carries its cause inputs.
//   8. firstCallerFrame skip list gains this file.
//   9. Recorder env flag LAUNCHSILENCE_RECORDER (off skips the wraps
//      — determinism / neutrality leg).
// All wraps remain pure reads + driver-local writes; no game-state
// writes, no RNG. Substrate env (read by game code — the homebody
// band's substrate, frozen in the prereg):
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
//   BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1
// Usage:
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 MODE=ctl OUTDIR=perseed-launchsilence-a-ctl SEEDS=107517,107518,107519,107520,107521,107522,107523,107524 RUN=launchsilence-a node scripts/launchsilence-driver-a.js
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { tableseatNowait } = require(path.join(REPO, 'scripts', 'policies', 'tableseat-nowait'));
const VF = require(path.join(REPO, 'scripts', 'vetfirst-instrument-20261111'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'launchsilence-a';
const MODE = process.env.MODE || 'ctl';
const OUTDIR = process.env.OUTDIR || ('perseed-launchsilence-a-' + MODE);
const RECORDER_ON = process.env.LAUNCHSILENCE_RECORDER !== 'off';

if (MODE !== 'ctl') { console.error('LAUNCHSILENCE STOP: MODE must be ctl (single control leg), got ' + JSON.stringify(MODE)); process.exit(2); }
// Policy layers MUST be off (tableseat-nowait + leanlinkrescue default-off
// -> competent verbatim). The CLI refuses a layers-on run: that would
// measure a different funnel than the prereg froze.
if (process.env.TABLESEATNOWAIT === '1' || process.env.LEANLINKRESCUE === '1') { console.error('LAUNCHSILENCE STOP: TABLESEATNOWAIT/LEANLINKRESCUE must be unset (layers off -> competent verbatim).'); process.exit(2); }

// Wave-4 id set (frozen list from src/data/monsters.json, wave 4 —
// re-read live so the recorder refuses a stale roster silently).
const W4_IDS_FROZEN = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'];
function loadWave4Ids() {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    return list.filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
  } catch (e) { return W4_IDS_FROZEN.slice().sort(); }
}
const W4_SET = new Set(loadWave4Ids());
// Wave-4+ id set (wave 4 AND wave 5 — the funnel's plan scope is
// wave-4+, matching the homebody metric's launch scope).
const W4P_IDS_FROZEN = ['algorithm', 'audit', 'cancellation', 'congregation', 'eater', 'editor', 'eulogy', 'finale', 'finale_crew', 'finale_opening', 'herald', 'influencer', 'network_heart', 'network_limb', 'network_note', 'network_tower', 'nielsen', 'rerun', 'reunion', 'spoiler', 'strike', 'suburb', 'timeslot'];
function loadWave4pIds() {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    return list.filter(function (m) { return (m.wave | 0) >= 4; }).map(function (m) { return m.id; }).sort();
  } catch (e) { return W4P_IDS_FROZEN.slice().sort(); }
}
const W4P_SET = new Set(loadWave4pIds());
// planIsWave4p(Game, plan): the plan targets a wave-4+ species
// (needWave >= 4, or a target id in the wave-4+ roster).
function planIsWave4p(Game, plan) {
  if (!plan) return false;
  if ((plan.needWave | 0) >= 4) return true;
  return !!(plan.target && W4P_SET.has(plan.target));
}

const FROZEN_BASE = '34dc4dbc9a013e6163c32c662195d33ebbff383f';
// RE-FROZEN 2026-11-23 by the run coordinator after rebasing the arm
// onto master 7ade8d3bf: game code is byte-identical between the old
// frozen base fdd7042b8 and 7ade8d3bf (zero src/js diff), and the
// 16-seed control corpus + replays below were re-recorded on this
// head; the analysis reproduced exactly (see the re-freeze addendum
// in evidence/2026-11-23/sim-launchsilence-a.md).
let ANCHOR_HEAD = 'unknown';
try { ANCHOR_HEAD = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
const ANCHOR = FROZEN_BASE;
let POLICY_SHA = 'unknown';
let POLICY_SHAS = {};
try {
  const h = function (f) { return crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', f), 'utf8')).digest('hex').slice(0, 12); };
  POLICY_SHAS = { tableseatNowait: h('tableseat-nowait.js'), leanlinkrescue: h('leanlinkrescue.js'), competent: h('competent.js') };
  POLICY_SHA = POLICY_SHAS.tableseatNowait;
} catch (e) {}
let STANDING_MARKER = false;
try { STANDING_MARKER = fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8').indexOf('ROSTER CHECK') !== -1; } catch (e) {}

function sleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) {
    const t0 = process.hrtime.bigint();
    while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
  }
}
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 480; i++) {
    try {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, data);
        const back = fs.readFileSync(filePath, 'utf8');
        if (back.length !== data.length) throw new Error('readback length mismatch');
        return;
      }
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      return;
    } catch (e) {
      if (i === 479) { process.stdout.write('@@FALLBACK ' + filePath + '\n' + data + '\n'); return; }
      sleepMs(250);
    }
  }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function safe(fn, fallback) { try { const v = fn(); return v === undefined ? fallback : v; } catch (e) { return fallback; } }

// gearOfReplica(Game, vid): the win-plan gear read, replicated here as
// pure reads (win-plan.js gearOf is module-internal). Used ONLY to
// record the gate's / party's inputs — never to decide anything.
function gearOfReplica(Game, vid) {
  try {
    let person = null;
    try { if (Game.getPerson) person = Game.getPerson(vid); } catch (e) {}
    if (!person) { try { if (Game.vpOf) person = Game.vpOf(vid); } catch (e) {} }
    if (!person) return { armed: false, armored: false, armorP: 0, weaponB: 0 };
    const S = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
    const eq = S.equipment || null;
    const items = (Game.data && Game.data.items) || [];
    let armorP = 0, weaponB = 0;
    try { armorP = (eq && eq.armorOf) ? (eq.armorOf(person, items) || 0) : 0; } catch (e) {}
    try { weaponB = (eq && eq.weaponBonusOf) ? (eq.weaponBonusOf(person, items) || 0) : 0; } catch (e) {}
    let carriesWeapon = false;
    try {
      for (let i = 0; i < ((person.items || []).length); i++) {
        const ent = person.items[i] || {};
        const iid = ent.itemId || ent.id || ent;
        let def = null;
        for (let j = 0; j < items.length; j++) if (items[j] && items[j].id === iid) { def = items[j]; break; }
        if (def && def.weapon) { carriesWeapon = true; break; }
      }
    } catch (e) {}
    return { armed: !!(weaponB > 0 || carriesWeapon), armored: armorP > 0, armorP: armorP, weaponB: weaponB };
  } catch (e) { return { armed: false, armored: false, armorP: 0, weaponB: 0 }; }
}
function isWave3Killer(Game, vid) {
  try {
    const log = (Game.state && Game.state.waveKillLog) || [];
    for (let i = 0; i < log.length; i++) if (log[i] && log[i].by === vid && ((log[i].w | 0) >= 3)) return true;
  } catch (e) {}
  return false;
}

// ---- HAVENTICK helpers (module scope: the proof test requires them) ----
// The four winPlanSeedFromFight call sites (verified in this tree;
// line numbers drift daily, the call TEXT is the anchor):
//   world-tick  — src/js/game.js resolveWildMonsterEncounter, outcome
//                 'fled' (the re-landed 13-line VETPARTY block).
//   agency-evade — src/js/villager-agency.js expeditionMonster, outcome
//                 'evaded'.
//   agency-flee — src/js/villager-agency.js expeditionMonster, outcome
//                 'fled'.
//   gate-avoid  — src/js/win-plan.js winPlanFightGate, outcome 'avoided'.
// The outcome alone does NOT disambiguate: 'fled' is shared by the
// world-tick and agency-flee sites. The stack does: the world-tick
// caller is resolveWildMonsterEncounter, the agency caller is
// expeditionMonster in villager-agency.js, the gate caller is
// winPlanFightGate in win-plan.js. Anything that matches no rule is
// an explicit 'unknown-*' path (never a silent default) so the
// analyzer can name it as the reason an instance is unattributed.
// firstCallerFrame(stack): the first stack frame BELOW the wrap
// itself (the wrap's own frame + the Error-construction frame are
// skipped), truncated — recorded on the row so an unknown path can
// be audited by hand.
// classifySeedPath(outcome, stack): pure string match, no game state.
const SEED_PATHS = ['world-tick', 'agency-evade', 'agency-flee', 'gate-avoid'];
function firstCallerFrame(stack) {
  try {
    const lines = String(stack || '').split('\n').slice(1);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] || '';
      // Skip the wrap's own frame (this driver file, the
      // winPlanSeedFromFight assignment) and the Error frame.
      if (line.indexOf('haventick-driver-20261116.js') !== -1) continue;
      if (line.indexOf('planignite-driver-20261116.js') !== -1) continue;
      if (line.indexOf('launchsilence-driver-a.js') !== -1) continue;
      if (line.indexOf('haventick-caller') !== -1) continue;
      return line.trim().slice(0, 200);
    }
    return null;
  } catch (e) { return null; }
}
function classifySeedPath(outcome, stack) {
  const st = String(stack || '');
  const hasWorldTick = st.indexOf('resolveWildMonsterEncounter') !== -1;
  const hasAgency = st.indexOf('villager-agency') !== -1 || st.indexOf('expeditionMonster') !== -1;
  if (outcome === 'evaded') {
    if (hasAgency) return 'agency-evade';
    return 'unknown-evaded-no-agency-frame';
  }
  if (outcome === 'avoided') {
    if (st.indexOf('winPlanFightGate') !== -1 || st.indexOf('win-plan.js') !== -1) return 'gate-avoid';
    return 'unknown-avoided-no-gate-frame';
  }
  if (outcome === 'fled') {
    if (hasWorldTick) return 'world-tick';
    if (hasAgency) return 'agency-flee';
    return 'unknown-fled-no-caller';
  }
  return 'unknown-outcome:' + String(outcome);
}

// ---- HAVENTICK helpers (module scope: the proof test requires them) ----
// The six named plan creators (the five headline paths + winPlanOf,
// the launch companion-copy creator, recorded explicitly — never
// 'unknown'):
//   havenTick    — winPlanHavenTick created the plan (no seed call).
//   world-tick / agency-evade / agency-flee / gate-avoid — a
//                  winPlanSeedFromFight call that found no plan.
//   winPlanOf    — winPlanOf created the plan (launch companion).
const CREATORS = ['havenTick', 'world-tick', 'agency-evade', 'agency-flee', 'gate-avoid', 'winPlanOf'];
// classifyHavenSource(foughtN, slainN): pure function over the two
// engagement counts havenTick itself reads — 'lived' (the ranger
// personally fought a beast), 'heard' (the village has slain one),
// 'both', or the explicit 'unknown-haventick-no-engagement' (never
// expected: havenTick's creation branch requires engagement).
function classifyHavenSource(foughtN, slainN) {
  const f = (foughtN | 0) > 0, s = (slainN | 0) > 0;
  if (f && s) return 'both';
  if (f) return 'lived';
  if (s) return 'heard';
  return 'unknown-haventick-no-engagement';
}
function isNamedCreator(c) { return CREATORS.indexOf(c) !== -1; }

// ---- PLANIGNITE helpers (module scope: the proof test requires them) ----
// profileScoreParts(Game, vid): the npcRangeProfile score, recomputed
// from the same inputs WITHOUT writing the a.profiles cache — the
// game function caches on first call, and a recorder write to that
// cache is a state write that could perturb trajectories (a profile
// computed at census time with today's inputs would stick for the
// rest of the run where the game might have computed it later with
// different inputs). When a cached profile exists it is returned as
// the profile (exactly what the game itself would use); the score
// parts are still recomputed for the census explanation. Pure reads.
// profileOfReplica(Game, vid): the profile the game would use —
// cached value when present, else the inline computation.
// firstFailBucket(Game, vid, ctx): the agencyTick Layer-1 first-fail
// bucket for one roster villager, in the loop's code order
// (villager-agency.js agencyTick): player-skip / dead / engaged /
// onExped / notRanger (unless today's party_launch commit bypasses
// the profile gate — PROFILEGATE) / notAtHaven / night / indoor
// (unless a dawn-brain EXPEDITION commit) / trigger
// (npcTrigger 'expedition_launch') / reached. ctx = {hx, hy, day,
// night} read once per tick by the caller. A read that throws is
// bucketed 'instrument-error' (never silently mapped to a gate
// bucket); the one faithful exception is the loop's own swallowed
// throws: isEngaged throwing means the loop does NOT skip (its
// try/catch swallows and continues), and objOf/npcTrigger throwing
// means the loop does NOT block (its try/catch swallows and falls
// through to havenTick) — so those two replicate as pass, not error.
// classifyHavenCallOutcome(call): the outcome of one recorded
// havenTick call, from its recorded fields only:
// 'created' (a plan appeared), 'plan-exists' (one already did),
// 'profile-fail' (a non-ranger reached the call via the
// party_launch bypass), 'engagement-fail' (ranger, no lived and no
// heard), 'unexplained-call' (ranger + engaged + no plan + no
// creation — the code says this cannot happen).
const GATE_BUCKETS = ['player-skip', 'dead', 'engaged', 'onExped', 'notRanger', 'notAtHaven', 'night', 'indoor', 'trigger', 'reached', 'instrument-error'];
function profileScoreParts(Game, vid) {
  let temp = 'steady', goal = null, age = 35, apt = 0, potential = false;
  try { temp = Game.npcTemper ? (Game.npcTemper(vid) || 'steady') : 'steady'; } catch (e) {}
  try { goal = Game.npcGoal ? Game.npcGoal(vid) : null; } catch (e) {}
  try { const vp = Game.vpOf ? Game.vpOf(vid) : null; if (vp && vp.age != null) age = vp.age; } catch (e) {}
  try { apt = Game.npcRangingApt ? (Game.npcRangingApt(vid) || 0) : 0; } catch (e) {}
  try { const a = Game.agencyState ? Game.agencyState() : null; potential = !!(a && a.potential && a.potential[vid]); } catch (e) {}
  let score = 0;
  if (temp === 'bold' || temp === 'restless') score += 2;
  else if (temp === 'intense') score += 1;
  else if (temp === 'cautious' || temp === 'withdrawn') score -= 2;
  else if (temp === 'gentle') score -= 1;
  if (goal === 'explore') score += 2;
  else if (goal === 'prove' || goal === 'lead' || goal === 'escape') score += 1;
  else if (goal === 'heal' || goal === 'protect') score -= 1;
  if (age < 30) score += 1;
  else if (age > 55) score -= 2;
  else if (age > 45) score -= 1;
  score += apt;
  if (potential) score += 2;
  const computed = score >= 5 ? 'explorer' : score >= 2 ? 'wanderer' : score >= -1 ? 'forager' : 'homebody';
  let cached = null;
  try { const a = Game.agencyState ? Game.agencyState() : null; cached = (a && a.profiles) ? (a.profiles[vid] || null) : null; } catch (e) {}
  return { temper: temp, goal: goal, age: age, rangingApt: apt, potential: potential,
    score: score, computed: computed, cached: cached, profile: cached || computed };
}
function profileOfReplica(Game, vid) {
  try { return profileScoreParts(Game, vid).profile; } catch (e) { return null; }
}
function firstFailBucket(Game, vid, ctx) {
  try {
    if (vid === Game.villagerId) return 'player-skip';
    let dead = false;
    try { const p = Game.vpOf ? Game.vpOf(vid) : null; dead = !!(p && p.dead); } catch (e) { return 'instrument-error'; }
    if (dead) return 'dead';
    let engaged = false;
    try { engaged = !!(Game.isEngaged && Game.isEngaged(vid)); } catch (e) { engaged = false; }
    if (engaged) return 'engaged';
    let onExped = false;
    try { const a = Game.agencyState ? Game.agencyState() : null; onExped = !!(a && a.exped && a.exped[vid]); } catch (e) { return 'instrument-error'; }
    if (onExped) return 'onExped';
    let prof = null;
    try { prof = profileOfReplica(Game, vid); } catch (e) { return 'instrument-error'; }
    if (prof !== 'wanderer' && prof !== 'explorer') {
      let bypass = false;
      try {
        if (typeof Game.vbrainCommit === 'function') {
          const c = Game.vbrainCommit(vid);
          bypass = !!(c && c.day === ctx.day && c.winPlanAction === 'party_launch');
        }
      } catch (e) { return 'instrument-error'; }
      if (!bypass) return 'notRanger';
    }
    let node = null;
    try { node = Game.npcNode ? Game.npcNode(vid) : null; } catch (e) { return 'instrument-error'; }
    if (!node || node.nx !== ctx.hx || node.ny !== ctx.hy) return 'notAtHaven';
    if (ctx.night) return 'night';
    try {
      if (Game.objOf) {
        const oo = Game.objOf(vid);
        let brainExped = false;
        try {
          if (typeof Game.vbrainCommit === 'function') {
            const bc = Game.vbrainCommit(vid);
            brainExped = !!(bc && bc.kind === 'EXPEDITION' && bc.day === ctx.day);
          }
        } catch (e2) { brainExped = false; }
        if (oo && oo.indoor && oo.state === 'indoor' && !brainExped) return 'indoor';
      }
    } catch (e) { /* loop swallows objOf throws and falls through */ }
    try {
      if (Game.npcTrigger && Game.npcTrigger(vid, 'expedition_launch')) return 'trigger';
    } catch (e) { /* loop swallows npcTrigger throws and falls through */ }
    return 'reached';
  } catch (e) { return 'instrument-error'; }
}
function classifyHavenCallOutcome(call) {
  if (!call) return 'unexplained-call';
  if (call.created) return 'created';
  if (call.planBefore) return 'plan-exists';
  if (call.profile !== 'wanderer' && call.profile !== 'explorer') return 'profile-fail';
  if (!call.lived && !call.heard) return 'engagement-fail';
  return 'unexplained-call';
}

// ---- DAWNBID helpers (pure reads; NEVER call villagerHealCheck —
// it spends medicine) ----
// planIsWave4(Game, plan): the plan targets a wave-4+ species.
function planIsWave4(Game, plan) {
  if (!plan) return false;
  if ((plan.needWave | 0) >= 4) return true;
  return !!(plan.target && W4_SET.has(plan.target));
}
// usableMedicineExists(Game): a stash medicine entry with a healing
// dose left (mirrors the villagerHealCheck pharmacy read, without
// spending anything).
function usableMedicineExists(Game) {
  try {
    const st = (Game.stashState) ? Game.stashState() : null;
    const pile = (st && st.medicine) || [];
    const defs = {};
    (Game.data.items || []).forEach(function (i) { defs[i.id] = i; });
    for (let i = 0; i < pile.length; i++) {
      const e = pile[i];
      if ((e.units != null ? e.units : 1) <= 0 || (e.doses != null && e.doses <= 0)) continue;
      if (((defs[e.itemId || e.id] || {}).healAmount || 0) > 0) return true;
    }
  } catch (e) {}
  return false;
}
// hasCampHealer(Game, vid): a healer is present at the holder's camp
// (mirrors the villagerHealCheck healer fallback read).
function hasCampHealer(Game, vid) {
  try {
    let place = null;
    if (Game.campPeopleIds && Game.campPeopleIds('haven').indexOf(vid) !== -1) place = 'haven';
    else if (Game.campPeopleIds && Game.campPeopleIds().indexOf(vid) !== -1) place = 'here';
    if (place && Game.campHealerId && Game.campHealerId(place)) return true;
  } catch (e) {}
  return false;
}
// deriveLaunchBlock(Game, vid): the read-only launchability replica
// (winPlanDepart.launchParty's pure-read rule): 'sick' | 'range-0' |
// 'hurt-no-medicine-no-healer' | null (nothing blocks this villager).
// Returns 'unknown' only when the caller already knows the expedition
// failed but no read explains it — the analyzer counts those.
function deriveLaunchBlock(Game, vid) {
  try {
    if (((Game.state.village || {}).sick || {})[vid]) return 'sick';
  } catch (e) {}
  try { if (Game.npcMaxDist && Game.npcMaxDist(vid) < 1) return 'range-0'; } catch (e) {}
  try {
    const cur = (((Game.state.village || {}).health || {})[vid] !== undefined)
      ? ((Game.state.village || {}).health || {})[vid] : 100;
    if (cur < 70 && !usableMedicineExists(Game) && !hasCampHealer(Game, vid)) return 'hurt-no-medicine-no-healer';
  } catch (e) {}
  return null;
}

// ---- COMPANIONPOOL helpers (pure reads; NEVER call findCompanion —
// it is module-internal in both villager-brain.js and win-plan.js) ----
// poolReplica(Game, vid): replicates villager-brain.js:129
// findCompanion's eligibility loop as pure reads, in the brain loop's
// check order, against the Haven tile (hx, hy = village px/py,
// fallback 4,4 — the same values objTick passes into objPick).
// POOLMARGINALS EXTENSION: for each roster member the FULL profile is
// read FIRST — alive, away, trust (effective, undefined → 10),
// node, engaged, profile, onExped — each read in its own try/catch
// exactly as the original loop does; the first-fail order is then
// applied to those SAME effective values. So the counts/fails/eligible
// this returns are identical to companionpool's, and the new `members`
// array is two readings of one consistent snapshot, never a second
// snapshot. Each roster member is counted at its FIRST failing check,
// so the counts sum to rosterN. The ranked pick comes from the pure-read
// Game.companionRank (companion-score.js, OVE-54: no RNG, no writes);
// when it is missing or throws, the fallback is roster-first
// (elig[0]), exactly as findCompanion falls back. Returns null only
// when the village state itself is unreadable.
// Self/scholar members (the holder, the scholar) are never read for
// fields the original loop never read for them: their members entry
// carries firstFail only (profile/trust/node nulls, trust default 10).
// They are excluded from every marginal population, so the nulls are
// never counted as conditions.
function poolReplica(Game, vid) {
  try {
    const v = (Game.state || {}).village || null;
    if (!v) return null;
    const roster = v.roster || [];
    const trust = v.trust || {};
    const away = v.away || {};
    const hx = (v.px != null ? v.px : 4), hy = (v.py != null ? v.py : 4);
    const counts = { selfOrScholar: 0, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 0 };
    const fails = {};
    const eligible = [];
    const members = [];
    let agency = null;
    try { agency = (Game.agencyState && Game.agencyState()) || null; } catch (e) { agency = null; }
    for (let i = 0; i < roster.length; i++) {
      const cid = roster[i];
      if (!cid || cid === vid || cid === Game.villagerId) {
        counts.selfOrScholar++;
        if (cid) fails[cid] = 'selfOrScholar';
        members.push({ id: cid || null, profile: null, trust: 10, trustRaw: null, node: null,
          away: false, engaged: false, onExped: false, alive: true, firstFail: 'selfOrScholar' });
        continue;
      }
      // FULL PROFILE FIRST: every field the checks use, read for this
      // member regardless of which check fails first.
      let dead = false;
      try { const p = Game.getPerson ? Game.getPerson(cid) : null; dead = !!(p && p.dead); } catch (e) { dead = false; }
      const isAway = !!away[cid];
      const trustRaw = (trust[cid] === undefined ? null : trust[cid]);
      const t = (trustRaw === null ? 10 : trustRaw);
      let node = null;
      try { const n = Game.npcNode ? Game.npcNode(cid) : null; if (n) node = { nx: n.nx, ny: n.ny }; } catch (e) { node = null; }
      const atHaven = !!(node && node.nx === hx && node.ny === hy);
      let engaged = false;
      try { engaged = !!(Game.isEngaged && Game.isEngaged(cid)); } catch (e) { engaged = false; }
      let prof = null;
      try { prof = Game.npcRangeProfile ? Game.npcRangeProfile(cid) : null; } catch (e) { prof = null; }
      const onExped = !!(agency && agency.exped && agency.exped[cid]);
      // FIRST-FAIL ORDER (unchanged from companionpool): the brain
      // loop's check order, counting each member at its first failure.
      let firstFail = null;
      if (dead) { counts.dead++; firstFail = 'dead'; }
      else if (isAway) { counts.away++; firstFail = 'away'; }
      else if (t < 15) { counts.trustLow++; firstFail = 'trustLow'; }
      else if (!atHaven) { counts.notAtHaven++; firstFail = 'notAtHaven'; }
      else if (engaged) { counts.engaged++; firstFail = 'engaged'; }
      else if (prof !== 'wanderer' && prof !== 'explorer') { counts.notRanger++; firstFail = 'notRanger'; }
      else if (onExped) { counts.onExped++; firstFail = 'onExped'; }
      else { counts.eligible++; firstFail = 'eligible'; eligible.push(cid); }
      fails[cid] = firstFail;
      members.push({ id: cid, profile: prof, trust: t, trustRaw: trustRaw, node: node,
        away: isAway, engaged: engaged, onExped: onExped, alive: !dead, firstFail: firstFail });
    }
    let rankedOrder = [];
    let rankedPick = null;
    let rankedVia = 'roster-fallback';
    if (eligible.length) {
      try {
        if (Game.companionRank) {
          const ranked = Game.companionRank(vid, eligible.slice(), { context: 'party' }) || [];
          if (ranked.length && ranked[0] && ranked[0].id) {
            rankedOrder = ranked.map(function (r) { return { id: r.id, s: (r.s != null ? r.s : null) }; });
            rankedPick = ranked[0].id;
            rankedVia = 'companionRank';
          }
        }
      } catch (e) { rankedOrder = []; rankedPick = null; rankedVia = 'roster-fallback'; }
      if (!rankedPick) {
        rankedOrder = eligible.map(function (id) { return { id: id, s: null }; });
        rankedPick = eligible[0];
        rankedVia = 'roster-fallback';
      }
    }
    let holderProfile = null;
    try { holderProfile = Game.npcRangeProfile ? Game.npcRangeProfile(vid) : null; } catch (e) { holderProfile = null; }
    let holderNode = null;
    try { const hn = Game.npcNode ? Game.npcNode(vid) : null; if (hn) holderNode = { nx: hn.nx, ny: hn.ny }; } catch (e) { holderNode = null; }
    return { rosterN: roster.length, haven: { nx: hx, ny: hy }, holderProfile: holderProfile, holderNode: holderNode,
      counts: counts, fails: fails, eligible: eligible, rankedOrder: rankedOrder, rankedPick: rankedPick, rankedVia: rankedVia, members: members };
  } catch (e) { return null; }
}

const SAY_RE = /veteran|blooded|scarred|\belder\b|pack-leader|put down|killing blow|veteran kill|remember the name|MIRROR DRAFT|PRODUCERS|FINAL DRAFT|blood your fighters/i;

async function oneRun(seed) {
  const policy = tableseatNowait;
  const { Game } = await loadGame({ seed: seed, mode: 'haventick-' + MODE, fullTelemetry: false });
  const vetSays = [];
  let sayCount = 0;
  const errors = [];
  if (RECORDER_ON) try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') {
          sayCount++;
          if (SAY_RE.test(arg) && vetSays.length < 400) vetSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  await setupGame(Game);
  let vf = null;
  vf = VF.install(Game);
  let lastSnapDay = -1;
  let lastCtx = null;

  // ---- WAVE-4 PER-ENCOUNTER RECORDER ----
  // (inherited from the vetparty driver; skipped whole when the
  // recorder is off — determinism leg D2.)
  const v4encounters = [];
  const v4gates = [];
  const v4seeds = [];
  const v4departs = [];
  // ---- CREATION LEDGER (haventick extension) ----
  // v4creates: one row per observed plan creation (any creator).
  // planCensus: end-of-day snapshot of EVERY winPlan holder.
  const v4creates = [];
  const planCensus = [];
  // ---- DAWNBID CAPTURE ----
  const dawnbidScores = [];
  const dawnbidDeparts = [];
  const dawnbidCensus = [];
  const dawnbidStarts = [];
  // ---- COMPANIONPOOL CAPTURE ----
  const companionPool = [];
  // ---- PLANIGNITE IGNITION CAPTURE ----
  // havenTickCalls: EVERY winPlanHavenTick call (not just creations).
  // tickGates / tickGateChecks: the agencyTick Layer-1 gate replica
  // + per-tick validation. tickGateTotals: per-villager cumulative
  // first-fail buckets. igniteCensus / igniteVillage: end-of-day
  // ignition snapshots (same daily pass as planCensus).
  const havenTickCalls = [];
  const tickGates = [];
  const tickGateChecks = [];
  const tickGateTotals = {};
  const igniteCensus = [];
  const igniteVillage = [];
  // ---- LAUNCHSILENCE FUNNEL CAPTURE ----
  // funnelStage: one end-of-day row per seed-day (see the daily pass).
  // deadTargetChecks: every winPlanCommitDeadTarget call.
  const funnelStage = [];
  const deadTargetChecks = [];
  let cumHasPlan = false, cumConsidered = false, cumAttempted = false, cumLaunched = false;
  let firstLaunchDay = null, lostDay = null, maxStageSoFar = 0;
  let tickCounter = 0;
  let inAgencyTick = false;
  let firstSlainDay = null;
  const lastGateByVid = {};
  function waveOf(mdef) { try { return (mdef && mdef.wave) | 0; } catch (e) { return 0; } }
  function trickKnownOf(mid) { try { return !!(Game.villageKnowsTrick && Game.villageKnowsTrick(mid)); } catch (e) { return false; } }
  function planOf(vid) { try { const v = (Game.state || {}).village || {}; return (v.winPlan || {})[vid] || null; } catch (e) { return null; } }
  function needWaveOf() {
    try {
      const beat = (Game.state || {})._standingDeferBeat || {};
      if (beat[5] != null && Game.waveUnlockReady) { const r5 = Game.waveUnlockReady(5); if (r5 && (r5.short || []).indexOf('veterans') !== -1) return 4; }
      if (beat[4] != null && Game.waveUnlockReady) { const r4 = Game.waveUnlockReady(4); if (r4 && (r4.short || []).indexOf('veterans') !== -1) return 3; }
    } catch (e) {}
    return null;
  }
  function partyStats(party) {
    let killers = 0, armed = 0;
    for (const pid of (party || [])) {
      if (isWave3Killer(Game, pid)) killers++;
      if (gearOfReplica(Game, pid).armed) armed++;
    }
    return { killers: killers, armed: armed };
  }
  try {
    const origGate = Game.winPlanFightGate;
    if (RECORDER_ON && typeof origGate === 'function') {
      Game.winPlanFightGate = function (vid, mdef) {
        const ret = origGate.apply(this, arguments);
        try {
          const w = waveOf(mdef);
          if (w === 4 && mdef && mdef.id) {
            let sensed = [vid];
            try { const s = (typeof this.villagerFightAllies === 'function') ? (this.villagerFightAllies(vid) || []) : []; for (const x of s) if (sensed.indexOf(x) === -1) sensed.push(x); } catch (e) {}
            const gateParty = (ret && ret.party) ? ret.party.slice() : null;
            let allArmed = true, allArmored = true;
            const gear = {};
            const judged = gateParty || sensed;
            for (const p of judged) { const g = gearOfReplica(this, p); gear[p] = { armed: g.armed, armored: g.armored, armorP: g.armorP }; if (!g.armed) allArmed = false; if (!g.armored) allArmored = false; }
            const plan = planOf(vid);
            const row = { day: gday(Game), vid: vid, mid: mdef.id, wave: w,
              result: ret ? (ret.avoid ? 'avoid' : (ret.seek ? 'seek' : 'other')) : 'null',
              reason: (ret && ret.reason) || null,
              partySize: gateParty ? gateParty.length : sensed.length,
              sensedSize: sensed.length,
              countedSize: gateParty ? Math.max(0, gateParty.length - sensed.length) : 0,
              party: gateParty || sensed.slice(), sensed: sensed.slice(),
              allArmed: allArmed, allArmored: allArmored, gear: gear,
              trickKnown: trickKnownOf(mdef.id),
              planStage: plan ? plan.stage : null, planTarget: plan ? plan.target : null,
              planParty: plan && plan.party ? plan.party.slice() : [],
              needWave: needWaveOf() };
            v4gates.push(row);
            lastGateByVid[vid] = row;
          }
        } catch (e) { errors.push('v4gate-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('winPlanFightGate-wrap: not a function');
  } catch (e) { errors.push('winPlanFightGate-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origSeed = Game.winPlanSeedFromFight;
    if (RECORDER_ON && typeof origSeed === 'function') {
      Game.winPlanSeedFromFight = function (vid, mdef, outcome) {
        // HAVENTICK: classify the firing path BEFORE the call, from
        // the outcome + the caller's stack (the stack is a pure read;
        // the classification never touches game state or RNG).
        let seedPath = 'unknown-no-stack';
        let seedCaller = null;
        let planBefore = null;
        try {
          const st = (new Error('haventick-caller')).stack || '';
          seedCaller = firstCallerFrame(st);
          seedPath = classifySeedPath(outcome || null, st);
        } catch (e) { seedPath = 'unknown-stack-error'; }
        try { planBefore = planOf(vid); } catch (e) { planBefore = null; }
        const ret = origSeed.apply(this, arguments);
        try {
          const w = waveOf(mdef);
          if (w >= 3 && mdef && mdef.id) {
            const plan = planOf(vid);
            v4seeds.push({ day: gday(Game), vid: vid, mid: mdef.id, wave: w, outcome: outcome || null,
              path: seedPath, caller: seedCaller,
              planExistedBefore: !!planBefore,
              stageAfter: plan ? plan.stage : null, target: plan ? plan.target : null,
              node: plan && plan.node ? { nx: plan.node.nx, ny: plan.node.ny } : null });
            // CREATION LEDGER: the call created a plan (none existed
            // before). A refresh/retarget (plan existed) is NOT a
            // creation — it is listed in the episode's firings only.
            if (!planBefore && plan) {
              let prof = null;
              try { prof = this.npcRangeProfile ? this.npcRangeProfile(vid) : null; } catch (e) {}
              v4creates.push({ day: gday(Game), vid: vid, creator: seedPath, source: null,
                profile: prof, stageAfter: plan.stage || null, target: plan.target || null,
                needWave: (plan.needWave != null ? plan.needWave : null),
                foughtN: null, slainN: null, caller: seedCaller });
            }
          }
        } catch (e) { errors.push('v4seed-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('winPlanSeedFromFight-wrap: not a function');
  } catch (e) { errors.push('winPlanSeedFromFight-wrap-install: ' + String(e.message).slice(0, 80)); }
  // ---- CREATION LEDGER wraps: winPlanHavenTick + winPlanOf ----
  // Both wraps record a creation ONLY when the plan is absent before
  // the call and present after — a stage advance on an existing plan
  // is not a creation. Pure reads + driver-local writes, no RNG.
  try {
    const origHaven = Game.winPlanHavenTick;
    if (RECORDER_ON && typeof origHaven === 'function') {
      Game.winPlanHavenTick = function (vid, hx, hy) {
        // PLANIGNITE: record EVERY call, not just creations — the
        // gate question is which calls happen at all. planBefore /
        // foughtN / slainN are read before the call; created after.
        let planBefore = null;
        try { planBefore = planOf(vid); } catch (e) { planBefore = null; }
        let foughtN = 0, slainN = 0;
        try {
          const a = this.agencyState ? this.agencyState() : null;
          const kn = a && a.know ? a.know[vid] : null;
          foughtN = (kn && kn.fought) ? kn.fought.length : 0;
        } catch (e) {}
        try {
          const sl = (this.state && this.state.villageSlain) || {};
          for (const k in sl) if (sl[k] > 0) slainN++;
        } catch (e) {}
        let prof = null;
        try { prof = profileOfReplica(this, vid); } catch (e) {}
        let caller = null;
        try { caller = firstCallerFrame((new Error('haventick-caller')).stack || ''); } catch (e) {}
        const callTick = inAgencyTick ? tickCounter : null;
        if (callTick == null) errors.push('haventick-call-outside-agencyTick: day ' + gday(Game) + ' vid ' + vid);
        let ret = null;
        let threw = null;
        try { ret = origHaven.apply(this, arguments); }
        catch (e) { threw = e; }
        try {
          const plan = planOf(vid);
          const created = !planBefore && !!plan;
          const row = { tick: callTick, day: gday(Game), part: (Game.dayPart | 0), vid: vid,
            profile: prof, lived: foughtN > 0, heard: slainN > 0,
            foughtN: foughtN, slainN: slainN, planBefore: !!planBefore,
            created: created, outcome: null, caller: caller };
          row.outcome = classifyHavenCallOutcome(row);
          havenTickCalls.push(row);
          if (created) {
            v4creates.push({ day: gday(Game), vid: vid, creator: 'havenTick',
              source: classifyHavenSource(foughtN, slainN),
              profile: prof, stageAfter: plan.stage || null, target: plan.target || null,
              needWave: (plan.needWave != null ? plan.needWave : null),
              foughtN: foughtN, slainN: slainN, caller: caller });
          }
        } catch (e) { errors.push('v4haven-log: ' + String(e.message).slice(0, 80)); }
        if (threw) throw threw;
        return ret;
      };
    } else if (RECORDER_ON) errors.push('winPlanHavenTick-wrap: not a function');
  } catch (e) { errors.push('winPlanHavenTick-wrap-install: ' + String(e.message).slice(0, 80)); }
  // ---- PLANIGNITE: agencyTick Layer-1 gate replica ----
  // The wrap computes every roster villager's first-fail bucket
  // BEFORE the original runs (pure reads only), then compares the
  // predicted-reached list with the havenTickCalls actually recorded
  // during that tick. A predicted vid missing from the actual calls
  // is explained ONLY by an in-loop state change: an exped entry
  // that appeared during this tick (departed as someone's companion
  // before their own iteration — launchParty calls startExpedition
  // for the companion mid-tick) or a death during this tick.
  // Anything else is an unexplained mismatch (instrument error).
  try {
    const origAgencyTick = Game.agencyTick;
    if (RECORDER_ON && typeof origAgencyTick === 'function') {
      Game.agencyTick = function () {
        tickCounter++;
        const myTick = tickCounter;
        const day = gday(Game);
        const part = (Game.dayPart | 0);
        let over = false;
        try { over = !!this.over; } catch (e) {}
        let hx = 4, hy = 4;
        try { const v = (this.state || {}).village || {}; hx = (v.px != null ? v.px : 4); hy = (v.py != null ? v.py : 4); } catch (e) {}
        let night = false;
        try { night = !!(this.isNight && this.isNight()); } catch (e) {}
        let roster = [];
        try { roster = (((this.state || {}).village || {}).roster || []).slice(); } catch (e) {}
        const ctx = { hx: hx, hy: hy, day: day, night: night };
        const counts = {};
        for (const b of GATE_BUCKETS) counts[b] = 0;
        const predicted = [];
        const preExped = {};
        const preDead = {};
        try {
          const a = this.agencyState ? this.agencyState() : null;
          for (const rid of roster) {
            preExped[rid] = !!(a && a.exped && a.exped[rid]);
            let dead = false;
            try { const p = this.vpOf ? this.vpOf(rid) : null; dead = !!(p && p.dead); } catch (e) {}
            preDead[rid] = dead;
          }
        } catch (e) {}
        if (!over) {
          for (const rid of roster) {
            const bucket = firstFailBucket(this, rid, ctx);
            counts[bucket] = (counts[bucket] || 0) + 1;
            if (bucket === 'reached') predicted.push(rid);
            if (!tickGateTotals[rid]) tickGateTotals[rid] = {};
            tickGateTotals[rid][bucket] = (tickGateTotals[rid][bucket] || 0) + 1;
          }
        }
        tickGates.push({ tick: myTick, day: day, part: part, over: over, counts: counts, predicted: predicted.slice() });
        const ret = (function (self, args) {
          inAgencyTick = true;
          try { return origAgencyTick.apply(self, args); }
          finally { inAgencyTick = false; }
        })(this, arguments);
        try {
          const actual = havenTickCalls.filter(function (r) { return r.tick === myTick; }).map(function (r) { return r.vid; });
          const explained = [];
          const unexplained = [];
          const actualSet = {};
          for (const vid of actual) actualSet[vid] = true;
          for (const vid of predicted) {
            if (actualSet[vid]) continue;
            let reason = null;
            try {
              const a = this.agencyState ? this.agencyState() : null;
              const expedNow = !!(a && a.exped && a.exped[vid]);
              if (expedNow && !preExped[vid]) reason = 'mid-tick-exped';
            } catch (e) {}
            if (!reason) {
              try {
                const p = this.vpOf ? this.vpOf(vid) : null;
                const deadNow = !!(p && p.dead);
                if (deadNow && !preDead[vid]) reason = 'mid-tick-dead';
              } catch (e) {}
            }
            if (reason) explained.push({ vid: vid, reason: reason });
            else unexplained.push(vid);
          }
          for (const vid of actual) {
            if (predicted.indexOf(vid) === -1) unexplained.push(vid + ':actual-not-predicted');
          }
          tickGateChecks.push({ tick: myTick, day: day, part: part, predicted: predicted.slice(),
            actual: actual.slice(), match: unexplained.length === 0,
            explained: explained, unexplained: unexplained });
          if (unexplained.length) errors.push('tick-gate-mismatch: tick ' + myTick + ' day ' + day + ' unexplained ' + JSON.stringify(unexplained).slice(0, 200));
        } catch (e) { errors.push('tick-gate-check: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('agencyTick-wrap: not a function');
  } catch (e) { errors.push('agencyTick-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origWinPlanOf = Game.winPlanOf;
    if (RECORDER_ON && typeof origWinPlanOf === 'function') {
      Game.winPlanOf = function (vid) {
        let planBefore = null;
        try { planBefore = planOf(vid); } catch (e) { planBefore = null; }
        const ret = origWinPlanOf.apply(this, arguments);
        try {
          const plan = planOf(vid);
          if (!planBefore && plan) {
            let prof = null;
            try { prof = this.npcRangeProfile ? this.npcRangeProfile(vid) : null; } catch (e) {}
            let caller = null;
            try { caller = firstCallerFrame((new Error('haventick-caller')).stack || ''); } catch (e) {}
            v4creates.push({ day: gday(Game), vid: vid, creator: 'winPlanOf', source: null,
              profile: prof, stageAfter: plan.stage || null, target: plan.target || null,
              needWave: (plan.needWave != null ? plan.needWave : null),
              foughtN: null, slainN: null, caller: caller });
          }
        } catch (e) { errors.push('v4winplanof-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('winPlanOf-wrap: not a function');
  } catch (e) { errors.push('winPlanOf-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origDepart = Game.winPlanDepart;
    if (RECORDER_ON && typeof origDepart === 'function') {
      Game.winPlanDepart = function (vid, hx, hy, playerAtHaven) {
        // LAUNCHSILENCE: cause inputs read BEFORE the call (the call
        // may advance the stage / depart the holder, so post-call
        // reads would misattribute the hold).
        let planBeforeD = null, stageBefore = null, gearBefore = null, blockBefore = null;
        try { planBeforeD = planOf(vid); stageBefore = planBeforeD ? (planBeforeD.stage || null) : null; } catch (e) {}
        try { const g0 = gearOfReplica(this, vid); gearBefore = { armed: g0.armed, armored: g0.armored, armorP: g0.armorP }; } catch (e) {}
        try { blockBefore = deriveLaunchBlock(this, vid); } catch (e) { blockBefore = 'instrument-error'; }
        const ret = origDepart.apply(this, arguments);
        try {
          const plan = planOf(vid);
          // LAUNCHSILENCE: 'normal' returns are recorded too (wave-4+
          // plans only) — a wait-expiry / dead-target-expiry 'normal'
          // is a funnel outcome, not silence. For 'expired' the plan
          // is gone post-call, so the wave-4+ check uses planBeforeD.
          const recPlan = plan || planBeforeD;
          const recW4p = !!recPlan && planIsWave4p(Game, recPlan);
          if ((plan && (ret === 'hold' || ret === 'launch')) || (recW4p && ret === 'normal')) {
            const ps = partyStats((recPlan && recPlan.party) || []);
            v4departs.push({ day: gday(Game), vid: vid, source: 'winPlanDepart', result: ret, stage: plan ? plan.stage : stageBefore,
              stageBefore: stageBefore,
              holderArmed: gearBefore ? gearBefore.armed : null,
              holderArmored: gearBefore ? gearBefore.armored : null,
              holderBlock: blockBefore,
              target: recPlan ? (recPlan.target || null) : null, party: ((recPlan && recPlan.party) || []).slice(), partySize: ((recPlan && recPlan.party) || []).length + 1,
              partyKillers: ps.killers, partyArmed: ps.armed,
              targetWave: recPlan ? (recPlan.needWave || null) : null });
          }
        } catch (e) { errors.push('v4depart-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('winPlanDepart-wrap: not a function');
  } catch (e) { errors.push('winPlanDepart-wrap-install: ' + String(e.message).slice(0, 80)); }
  // ---- LAUNCHSILENCE: winPlanCommitDeadTarget wrap ----
  // Pure read of the return + plan target before/after. The
  // no-target stage is measured from these rows, not guessed.
  try {
    const origDeadTarget = Game.winPlanCommitDeadTarget;
    if (RECORDER_ON && typeof origDeadTarget === 'function') {
      Game.winPlanCommitDeadTarget = function (vid) {
        let targetBefore = null, planBefore2 = null;
        try { planBefore2 = planOf(vid); targetBefore = planBefore2 ? (planBefore2.target || null) : null; } catch (e) {}
        const ret = origDeadTarget.apply(this, arguments);
        try {
          const planAfter = planOf(vid);
          deadTargetChecks.push({ day: gday(Game), vid: vid, result: ret || null,
            targetBefore: targetBefore, targetAfter: planAfter ? (planAfter.target || null) : null,
            planGone: !planAfter });
        } catch (e) { errors.push('deadtarget-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('winPlanCommitDeadTarget-wrap: not a function');
  } catch (e) { errors.push('winPlanCommitDeadTarget-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origBrainDepart = Game.vbrainExecuteDepart;
    if (RECORDER_ON && typeof origBrainDepart === 'function') {
      Game.vbrainExecuteDepart = function (vid, hx, hy, playerAtHaven) {
        let commit = null;
        try { commit = (typeof this.vbrainCommit === 'function') ? this.vbrainCommit(vid) : null; } catch (e) {}
        // LAUNCHSILENCE FIX (2026-11-23 pilot v1): the plan MUST be
        // read BEFORE the call. The execute call consumes/transfers
        // the holder's plan — after a brain launch winPlanOf(vid)
        // returns a plan with target/needWave null (pilot seed
        // 107522 d45: the eater-plan launch was recorded with
        // target null / targetWave null and the analyzer counted 0
        // launches for a village whose party went out and fought).
        // Same pre-call discipline as the winPlanDepart wrap above.
        let planBefore = null;
        try { planBefore = planOf(vid); } catch (e) {}
        const ret = origBrainDepart.apply(this, arguments);
        try {
          const plan = planBefore;
          if ((ret === 'hold' || ret === 'launch') && commit && commit.winPlanAction) {
            const ps = partyStats(plan ? (plan.party || []) : []);
            v4departs.push({ day: gday(Game), vid: vid, result: ret, source: 'brain',
              winPlanAction: commit.winPlanAction, companion: commit.companion || null,
              companion2: commit.companion2 || null,
              stage: plan ? plan.stage : null, target: plan ? plan.target : null,
              party: (plan && plan.party) ? plan.party.slice() : [],
              partySize: plan && plan.party ? plan.party.length + 1 : 1,
              partyKillers: ps.killers, partyArmed: ps.armed,
              targetWave: plan ? (plan.needWave || null) : null });
          }
          // DAWNBID: extended depart row — expedition outcomes +
          // derived launch blockers, for every execute call where
          // the holder holds a wave-4 plan or the commit carries a
          // win-plan action (any result, including 'normal').
          try {
            const isW4 = planIsWave4(Game, plan);
            if (isW4 || (commit && commit.winPlanAction)) {
              let vidExped = false, compExped = null;
              try {
                const a = this.agencyState ? this.agencyState() : null;
                vidExped = !!(a && a.exped && a.exped[vid]);
                if (commit && commit.companion) compExped = !!(a && a.exped && a.exped[commit.companion]);
              } catch (e2) {}
              let vidBlock = null, companionBlock = null;
              if (commit && commit.winPlanAction === 'party_launch') {
                if (!vidExped) { const b = deriveLaunchBlock(Game, vid); vidBlock = b || 'unknown'; }
                if (commit.companion && compExped === false) { const b = deriveLaunchBlock(Game, commit.companion); companionBlock = b || 'unknown'; }
              }
              dawnbidDeparts.push({ day: gday(Game), vid: vid, source: 'brain', result: ret,
                winPlanAction: commit ? (commit.winPlanAction || null) : null,
                companion: commit ? (commit.companion || null) : null,
                vidExped: vidExped, companionExped: compExped,
                vidBlock: vidBlock, companionBlock: companionBlock,
                stage: plan ? plan.stage : null, target: plan ? plan.target : null,
                targetWave: plan ? (plan.needWave || null) : null,
                party: (plan && plan.party) ? plan.party.slice() : [] });
            }
          } catch (e) { errors.push('dawnbid-depart-log: ' + String(e.message).slice(0, 80)); }
        } catch (e) { errors.push('v4braindepart-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('vbrainExecuteDepart-wrap: not a function');
  } catch (e) { errors.push('vbrainExecuteDepart-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origFF = Game.fieldFight;
    if (RECORDER_ON && typeof origFF === 'function') {
      Game.fieldFight = function (vid, mdef, m, opts) {
        const w = waveOf(mdef);
        const watch = w === 4 && mdef && mdef.id;
        let row = null;
        if (watch) {
          const lg = lastGateByVid[vid] || null;
          row = { day: gday(Game), vid: vid, mid: mdef.id, wave: w,
            alliesN: (opts && opts.allies) | 0,
            allyVids: ((opts && opts.allyVids) || []).slice(0, 2),
            allyFromStart: !!(opts && opts.allyFromStart),
            gate: lg ? { result: lg.result, reason: lg.reason,
              partySize: lg.partySize, sensedSize: lg.sensedSize, countedSize: lg.countedSize,
              allArmed: lg.allArmed, allArmored: lg.allArmored, trickKnown: lg.trickKnown,
              planStage: lg.planStage, planTarget: lg.planTarget } : null,
            outcome: null, rounds: null, vTaken: null, mDealt: null,
            calledHelp: null, allyVid: null, fleeHpFrac: null,
            trickBefore: trickKnownOf(mdef.id), trickAfter: null, lines: [], log: [] };
        }
        let rec = null;
        try { rec = origFF.apply(this, arguments); }
        finally { if (watch) { /* row closed below */ } }
        try {
          if (watch && row && rec) {
            row.outcome = rec.outcome || null;
            row.rounds = rec.rounds | 0;
            row.vTaken = rec.vTaken | 0;
            row.mDealt = rec.mDealt | 0;
            row.calledHelp = !!rec.calledHelp;
            row.allyVid = rec.allyVid || null;
            row.fleeHpFrac = (rec.fleeHpFrac != null ? +rec.fleeHpFrac.toFixed(2) : null);
            row.trickAfter = trickKnownOf(mdef.id);
            try { row.log = (rec.log || []).slice(0, 20).map(function (s) { return String(s).slice(0, 400); }); } catch (e) { row.log = []; }
            v4encounters.push(row);
          }
        } catch (e) { errors.push('v4enc-log: ' + String(e.message).slice(0, 80)); }
        return rec;
      };
    } else if (RECORDER_ON) errors.push('fieldFight-wrap: not a function');
  } catch (e) { errors.push('fieldFight-wrap-install: ' + String(e.message).slice(0, 80)); }
  // ---- DAWNBID: startExpedition outcomes (supplementary) ----
  // Records, for a wave-4 plan holder, whether each startExpedition
  // call left an expedition standing. The depart-row derivation
  // (post-call exped checks) stays primary; this wrap names the
  // exact call that failed. Pure reads + driver-local writes.
  try {
    const origStartExp = Game.startExpedition;
    if (RECORDER_ON && typeof origStartExp === 'function') {
      Game.startExpedition = function (vid, hx, hy, announce, opts) {
        let before = null;
        try { before = planOf(vid); } catch (e) {}
        const watch = planIsWave4(Game, before);
        const ret = origStartExp.apply(this, arguments);
        try {
          if (watch) {
            let expedAfter = false;
            try { const a = this.agencyState ? this.agencyState() : null; expedAfter = !!(a && a.exped && a.exped[vid]); } catch (e2) {}
            dawnbidStarts.push({ day: gday(Game), vid: vid,
              directed: !!(opts && opts.tx != null && opts.ty != null),
              target: before ? (before.target || null) : null,
              stage: before ? (before.stage || null) : null,
              expedAfter: expedAfter });
          }
        } catch (e) { errors.push('dawnbid-start-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (!RECORDER_ON) { /* wraps off — determinism leg D2 */ }
    else errors.push('startExpedition-wrap: not a function');
  } catch (e) { errors.push('startExpedition-wrap-install: ' + String(e.message).slice(0, 80)); }
  // ---- DAWNBID: candidate-bid capture in the dawn scorer ----
  // Wraps vbrainScorePick (the Game method that receives the FULL
  // candidate list, win-plan extras included) and records, per
  // scoring call for a wave-4 plan holder (or any call carrying a
  // win-plan candidate): the bid list, the pick, the commit, and
  // the holder's plan + gear at scoring time. Pure reads: the
  // candidate projection is taken BEFORE the call; the commit/log
  // are read AFTER it. No state writes, no RNG.
  try {
    const origScore = Game.vbrainScorePick;
    if (RECORDER_ON && typeof origScore === 'function') {
      Game.vbrainScorePick = function (vid, cands, opts) {
        let candsProj = null;
        try {
          candsProj = (cands || []).map(function (c) {
            return c ? { kind: c.kind || null, w: (c.w != null ? c.w : null),
              winPlanAction: c.winPlanAction || null,
              companion: c.companion || null,
              vbrainSrc: c.vbrainSrc || null } : null;
          });
        } catch (e) { candsProj = null; }
        const ret = origScore.apply(this, arguments);
        try {
          const plan = planOf(vid);
          const hasWinPlanCand = (candsProj || []).some(function (c) { return c && c.winPlanAction; });
          if (planIsWave4(Game, plan) || hasWinPlanCand) {
            let commit = null;
            try { commit = (typeof this.vbrainCommit === 'function') ? this.vbrainCommit(vid) : null; } catch (e) {}
            let log = null;
            try { log = (typeof this.vbrainLastLog === 'function') ? this.vbrainLastLog(vid) : null; } catch (e) {}
            let logCands = null;
            try {
              logCands = (log && log.candidates) ? log.candidates.map(function (c) {
                return c ? { kind: c.kind || null, score: (c.score != null ? c.score : null),
                  winPlanAction: c.winPlanAction || null } : null;
              }) : null;
            } catch (e) { logCands = null; }
            const g = gearOfReplica(Game, vid);
            dawnbidScores.push({ day: gday(Game), part: (Game.dayPart | 0), vid: vid,
              cands: candsProj,
              pick: log ? { kind: log.pick || null, winPlanAction: log.winPlanAction || null,
                override: log.override || null, corePick: log.corePick || null } : null,
              logCands: logCands,
              commit: commit ? { kind: commit.kind || null,
                winPlanAction: commit.winPlanAction || null,
                companion: commit.companion || null } : null,
              plan: plan ? { stage: plan.stage || null, target: plan.target || null,
                needWave: (plan.needWave != null ? plan.needWave : null),
                party: (plan.party || []).slice() } : null,
              holderGear: { armed: g.armed, armored: g.armored } });
            // COMPANIONPOOL: one pool row per SCORED dawn (part 0) for
            // a wave-4+ plan holder. The bid companion (if any) is read
            // off the same candidate projection, so the analyzer can
            // check the replica's ranked pick against the real
            // findCompanion pick the scorer saw. Pure reads only.
            try {
              if (planIsWave4(Game, plan) && (Game.dayPart | 0) === 0) {
                const pool = poolReplica(Game, vid);
                if (pool) {
                  let bidCompanion = null;
                  try {
                    const launch = (candsProj || []).find(function (c) { return c && c.winPlanAction === 'party_launch'; });
                    bidCompanion = launch ? (launch.companion || null) : null;
                  } catch (e2) { bidCompanion = null; }
                  companionPool.push({ day: gday(Game), part: 0, vid: vid,
                    target: plan.target || null, stage: plan.stage || null,
                    holderProfile: pool.holderProfile, holderNode: pool.holderNode,
                    haven: pool.haven, rosterN: pool.rosterN,
                    counts: pool.counts, fails: pool.fails,
                    eligible: pool.eligible.slice(),
                    rankedOrder: pool.rankedOrder, rankedPick: pool.rankedPick,
                    rankedVia: pool.rankedVia, bidCompanion: bidCompanion,
                    agree: bidCompanion == null ? null : (pool.rankedPick === bidCompanion),
                    members: pool.members });
                } else {
                  errors.push('haventick-replica-null: day ' + gday(Game) + ' vid ' + vid);
                }
              }
            } catch (e) { errors.push('haventick-log: ' + String(e.message).slice(0, 80)); }
          }
        } catch (e) { errors.push('dawnbid-score-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (!RECORDER_ON) { /* wraps off — determinism leg D2 */ }
    else errors.push('vbrainScorePick-wrap: not a function');
  } catch (e) { errors.push('vbrainScorePick-wrap-install: ' + String(e.message).slice(0, 80)); }

  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      lastCtx = ctx;
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (vf && d !== lastSnapDay) {
            lastSnapDay = d;
            vf.snapshot();
            // DAWNBID census: one row per live wave-4 plan at end
            // of day (churn detection — stage/target/deletion diffs
            // day over day). Pure reads. HAVENTICK: the same pass
            // also pushes EVERY holder into planCensus (all targets
            // incl. null) — the independent denominator for the
            // creation-ledger check and the churn detector for
            // target-null episodes.
            if (RECORDER_ON) {
              try {
                const wp = ((Game.state || {}).village || {}).winPlan || {};
                for (const pvid of Object.keys(wp)) {
                  const pl = wp[pvid];
                  let alive = true;
                  try { const p = Game.getPerson ? Game.getPerson(pvid) : null; if (p && p.dead) alive = false; } catch (e) {}
                  let node = null;
                  try { const n = Game.npcNode ? Game.npcNode(pvid) : null; if (n) node = { nx: n.nx, ny: n.ny }; } catch (e) {}
                  let exped = false;
                  try { const a = Game.agencyState ? Game.agencyState() : null; exped = !!(a && a.exped && a.exped[pvid]); } catch (e) {}
                  let sick = false, health = 100;
                  try { sick = !!(((Game.state || {}).village || {}).sick || {})[pvid]; } catch (e) {}
                  try { const h = (((Game.state || {}).village || {}).health || {})[pvid]; if (h !== undefined) health = h; } catch (e) {}
                  const g = gearOfReplica(Game, pvid);
                  const censusRow = { day: d, vid: pvid, target: pl.target || null,
                    needWave: (pl.needWave != null ? pl.needWave : null),
                    stage: pl.stage || null, party: (pl.party || []).slice(),
                    holderAlive: alive, holderNode: node, holderExped: exped,
                    holderSick: sick, holderHealth: health,
                    holderGear: { armed: g.armed, armored: g.armored } };
                  planCensus.push(censusRow);
                  if (!planIsWave4(Game, pl)) continue;
                  dawnbidCensus.push(censusRow);
                }
              } catch (e) { errors.push('dawnbid-census: ' + String(e.message).slice(0, 80)); }
            }
            // PLANIGNITE: end-of-day ignition census — EVERY living
            // non-player roster villager with the profile inputs, so
            // the analyzer can name WHY a village has no ranger.
            if (RECORDER_ON) {
              try {
                const vill = (Game.state || {}).village || {};
                const roster = (vill.roster || []).slice();
                const hx = (vill.px != null ? vill.px : 4), hy = (vill.py != null ? vill.py : 4);
                const sl = (Game.state && Game.state.villageSlain) || {};
                let slainN = 0;
                for (const k in sl) if (sl[k] > 0) slainN++;
                if (slainN > 0 && firstSlainDay == null) firstSlainDay = d;
                let nRangers = 0, nRangersAtHaven = 0, nRangersOnExped = 0;
                let ag = null;
                try { ag = Game.agencyState ? Game.agencyState() : null; } catch (e) { ag = null; }
                for (const vid of roster) {
                  if (vid === Game.villagerId) continue;
                  let alive = true;
                  try { const p = Game.getPerson ? Game.getPerson(vid) : null; if (p && p.dead) alive = false; } catch (e) {}
                  if (!alive) continue;
                  let parts = null;
                  try { parts = profileScoreParts(Game, vid); } catch (e) { parts = null; }
                  const prof = parts ? parts.profile : null;
                  let node = null;
                  try { const n = Game.npcNode ? Game.npcNode(vid) : null; if (n) node = { nx: n.nx, ny: n.ny }; } catch (e) {}
                  const atHaven = !!(node && node.nx === hx && node.ny === hy);
                  const onExped = !!(ag && ag.exped && ag.exped[vid]);
                  let away = false;
                  try { away = !!(((Game.state || {}).village || {}).away || {})[vid]; } catch (e) {}
                  let engaged = false;
                  try { engaged = !!(Game.isEngaged && Game.isEngaged(vid)); } catch (e) {}
                  let foughtN = 0;
                  try { const kn = ag && ag.know ? ag.know[vid] : null; foughtN = (kn && kn.fought) ? kn.fought.length : 0; } catch (e) {}
                  const hasPlan = !!(((Game.state || {}).village || {}).winPlan || {})[vid];
                  if (prof === 'wanderer' || prof === 'explorer') {
                    nRangers++;
                    if (atHaven) nRangersAtHaven++;
                    if (onExped) nRangersOnExped++;
                  }
                  igniteCensus.push({ day: d, vid: vid, profile: prof,
                    temper: parts ? parts.temper : null, goal: parts ? parts.goal : null,
                    age: parts ? parts.age : null, rangingApt: parts ? parts.rangingApt : null,
                    potential: parts ? !!parts.potential : false, score: parts ? parts.score : null,
                    alive: alive, node: node, atHaven: atHaven, onExped: onExped,
                    away: away, engaged: engaged, foughtN: foughtN, hasPlan: hasPlan, slainN: slainN });
                }
                let callsToday = 0, createsToday = 0;
                for (const r of havenTickCalls) if (r.day === d) callsToday++;
                for (const c of v4creates) if (c.day === d) createsToday++;
                igniteVillage.push({ day: d, slainN: slainN, nRangers: nRangers,
                  nRangersAtHaven: nRangersAtHaven, nRangersOnExped: nRangersOnExped,
                  havenTickCallsToday: callsToday, creationsToday: createsToday,
                  firstSlainDay: firstSlainDay });
              } catch (e) { errors.push('ignite-census: ' + String(e.message).slice(0, 80)); }
            }
            // LAUNCHSILENCE: end-of-day funnel-stage row. Cumulative
            // stage by end of day: 0 no-plan / 1 plan-exists / 2
            // plan-considered-at-dawn / 3 depart-attempted / 4 launched.
            // "Considered" = a dawnbidScores row today carrying a
            // winPlanAction candidate for a wave-4+ plan holder.
            // "Attempted/launched" = v4departs rows today for wave-4+
            // plans (targetWave >= 4 or target in the wave-4+ roster).
            // PURITY: this block makes NO live standing/unlock calls.
            // villageStandingTotal() / unlockedWave() WRITE state
            // (the peak ratchet + release/hold beats), so calling
            // them daily would release waves on the recorder's read
            // and perturb the game (the D2 failure that caught this:
            // recorder-on 9 launches vs recorder-off 0 on the 30d
            // smoke seed). Standing is read via the pure
            // villageStanding() total (standingRaw, ungated); the
            // unlocked wave is replicated from pure reads only (day
            // floors + ledger points + the peak ratchet the game's
            // own calls maintain). The replica can lag the true
            // unlock by <1 day when the threshold is crossed after
            // the game's last own call of the day; the analyzer's
            // gate decision uses the end-of-run gated reads
            // (out.maxWave / out.standing), never this replica.
            if (RECORDER_ON) {
              try {
                let stRaw = null, peakWave = 0, uwReplica = 1, overNow = false, lostNow = false;
                try { const s = Game.villageStanding ? Game.villageStanding() : null; stRaw = s ? (s.total | 0) : null; } catch (e) {}
                try { peakWave = ((Game.state || {})._standingPeakWave | 0) || 0; } catch (e) {}
                try {
                  let d2f = 8, dNf = 25, barF = { 1: 5, 2: 5, 3: 4, 4: 3, 5: 2 };
                  try {
                    const cfg = (typeof Game.waveLedgerCfg === 'function') ? Game.waveLedgerCfg() : null;
                    if (cfg) { if (cfg.barsPerWave) barF = cfg.barsPerWave; if (cfg.wave2DayFloor != null) d2f = cfg.wave2DayFloor; if (cfg.dayFloor != null) dNf = cfg.dayFloor; }
                  } catch (e2) {}
                  const ptsF = function (w) { try { return (typeof Game.waveLedgerPoints === 'function') ? (Game.waveLedgerPoints(w) | 0) : 0; } catch (e2) { return 0; } };
                  let w4faced = false;
                  try { w4faced = (typeof Game.waveEngaged === 'function') ? Game.waveEngaged(4) > 0 : false; } catch (e2) {}
                  const w3f = d >= dNf && ptsF(2) >= ((barF[2] | 0) || 5);
                  uwReplica = 1;
                  if (d >= d2f && ptsF(1) >= ((barF[1] | 0) || 5)) uwReplica = 2;
                  if (w3f) uwReplica = 3;
                  if (w3f && peakWave >= 5 && w4faced) uwReplica = 5;
                  else if (w3f && peakWave >= 4) uwReplica = 4;
                } catch (e) { uwReplica = 1; }
                try { overNow = !!Game.over; } catch (e) {}
                try { lostNow = !!Game.villageLost; } catch (e) {}
                let nPlansW4 = 0, nPlansAny = 0;
                try {
                  const wp = ((Game.state || {}).village || {}).winPlan || {};
                  for (const k of Object.keys(wp)) { nPlansAny++; if (planIsWave4p(Game, wp[k])) nPlansW4++; }
                } catch (e) {}
                const isW4pDepart = function (r) {
                  if (!r) return false;
                  if ((r.targetWave | 0) >= 4) return true;
                  return !!(r.target && W4P_SET.has(r.target));
                };
                let callsT = 0, createsT = 0, attemptsT = 0, launchesT = 0, consideredT = false;
                for (const r of havenTickCalls) if (r.day === d) callsT++;
                for (const c of v4creates) {
                  if (c.day !== d) continue;
                  if ((c.needWave | 0) >= 4 || (c.target && W4P_SET.has(c.target))) createsT++;
                }
                for (const r of v4departs) {
                  if (r.day !== d || !isW4pDepart(r)) continue;
                  attemptsT++;
                  if (r.result === 'launch') launchesT++;
                }
                for (const r of dawnbidScores) {
                  if (r.day !== d || !r.plan || (r.plan.needWave | 0) < 4) continue;
                  const cands = r.cands || [];
                  for (let ci = 0; ci < cands.length; ci++) {
                    if (cands[ci] && cands[ci].winPlanAction) { consideredT = true; break; }
                  }
                  if (consideredT) break;
                }
                if (nPlansW4 > 0 || createsT > 0) cumHasPlan = true;
                if (consideredT) cumConsidered = true;
                if (attemptsT > 0) cumAttempted = true;
                if (launchesT > 0) {
                  cumLaunched = true;
                  if (firstLaunchDay == null) firstLaunchDay = d;
                }
                if (lostNow && lostDay == null) lostDay = d;
                const stage = cumLaunched ? 4 : cumAttempted ? 3 : cumConsidered ? 2 : cumHasPlan ? 1 : 0;
                if (stage > maxStageSoFar) maxStageSoFar = stage;
                funnelStage.push({ day: d, villageAlive: !overNow, villageLost: lostNow,
                  standingRaw: stRaw, standingPeakWave: peakWave, unlockedWave: uwReplica,
                  nPlansW4: nPlansW4, nPlansAny: nPlansAny,
                  havenTickCallsToday: callsT, creationsToday: createsT,
                  departAttemptsToday: attemptsT, launchesToday: launchesT,
                  consideredToday: consideredT, stage: stage, maxStage: maxStageSoFar });
              } catch (e) { errors.push('funnel-stage: ' + String(e.message).slice(0, 80)); }
            }
          }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 1 }); });
  try { if (vf) vf.snapshot(); } catch (e) {}
  try { if (vf) vf.uninstall(); } catch (e) { errors.push('uninstall-vf: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  let scaleRank = null, unlocked = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  let standing = null;
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  let pantryKcal = 0;
  try {
    pantryKcal = ((st.village || {}).pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) {}
  let ready4 = null, ready5 = null, ladderVets4 = null, winPlanStats = null;
  try { ready4 = Game.waveCombatReadiness ? Game.waveCombatReadiness(4) : null; } catch (e) { errors.push('ready4: ' + String(e.message).slice(0, 80)); }
  try { ready5 = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; } catch (e) { errors.push('ready5: ' + String(e.message).slice(0, 80)); }
  try { ladderVets4 = (typeof Game._ladderLivingVeterans === 'function') ? Game._ladderLivingVeterans(4) : null; } catch (e) { errors.push('ladderVets4: ' + String(e.message).slice(0, 80)); }
  try { winPlanStats = (typeof Game.winPlanStats === 'function') ? Game.winPlanStats() : null; } catch (e) { errors.push('winPlanStats: ' + String(e.message).slice(0, 80)); }

  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });

  const out = {
    seed: seed, arm: 'launchsilence-a', run: RUN, mode: MODE, leg: MODE,
    anchorCommit: ANCHOR, anchorHead: ANCHOR_HEAD, standingMarker: STANDING_MARKER,
    recorderOn: RECORDER_ON,
    policySha: POLICY_SHA, policyShas: POLICY_SHAS, policy: 'tableseat-nowait (layers off -> competent verbatim)',
    tableseatLayerOn: false, leanlinkLayerOn: false,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    ready4: ready4, ready5: ready5, ladderVets4: ladderVets4,
    winPlanStats: winPlanStats,
    vetSays: vetSays, sayCount: sayCount,
    instrumentErrors: (vf ? vf.t.instrumentErrors : []).concat(errors),
    deaths: deaths,
    samples: result.samples || null,
    v4seeds: v4seeds, v4departs: v4departs, v4gates: v4gates, v4encounters: v4encounters,
    dawnbidScores: dawnbidScores, dawnbidDeparts: dawnbidDeparts, dawnbidCensus: dawnbidCensus,
    dawnbidStarts: dawnbidStarts,
    companionPool: companionPool,
    v4creates: v4creates, planCensus: planCensus,
    havenTickCalls: havenTickCalls, tickGates: tickGates, tickGateChecks: tickGateChecks,
    tickGateTotals: tickGateTotals, igniteCensus: igniteCensus, igniteVillage: igniteVillage,
    funnelStage: funnelStage,
    // LAUNCHSILENCE FIX (2026-11-23 pilot v1): the loss can land in
    // the night phase after the last daily snapshot (pilot seeds
    // 107519/107522: villageLost true, no snapshot row caught it, so
    // lostDay stayed null). Fall back to the last simulated day —
    // an upper bound on the loss day, not the exact day.
    funnelVillage: { maxStage: maxStageSoFar, firstLaunchDay: firstLaunchDay, lostDay: lostDay != null ? lostDay : (Game.villageLost ? result.days : null) },
    deadTargetChecks: deadTargetChecks,
    wave4Ids: loadWave4Ids(),
  };
  if (vf) {
    out.killCalls = vf.t.killCalls;
    out.pyrrhicCalls = vf.t.pyrrhicCalls;
    out.casts = vf.t.casts;
    out.spawns = vf.t.spawns;
    out.fights = vf.t.fights;
    out.teleCounts = vf.t.teleCounts;
    out.teleRows = vf.t.teleRows;
    out.regDeaths = vf.t.deaths;
    out.daily = vf.t.daily;
    out.wrapLive = vf.t.wrapLive;
  }
  return out;
}

if (require.main === module) (async function () {
  if (!SEEDS.length) { console.error('LAUNCHSILENCE STOP: SEEDS required.'); process.exit(2); }
  if (ANCHOR_HEAD !== FROZEN_BASE) { console.error('LAUNCHSILENCE STOP: HEAD ' + ANCHOR_HEAD + ' is not the frozen base ' + FROZEN_BASE + ' (rebase + re-freeze first).'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', process.env.EVIDENCE_DATE || '2026-11-23', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'launchsilence-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('LAUNCHSILENCE STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'launchsilence-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, anchor: (out.anchorCommit || '').slice(0, 12),
      policySha: out.policySha, standingMarker: out.standingMarker,
      recorderOn: out.recorderOn,
      days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      endPantryKcal: out.endPantryKcal,
      killCalls: out.killCalls ? out.killCalls.length : null,
      snapshots: out.daily ? out.daily.length : null,
      vetSays: out.vetSays.length,
      deaths: out.deaths.length,
      v4seeds: out.v4seeds.length, v4departs: out.v4departs.length,
      v4gates: out.v4gates.length, v4encounters: out.v4encounters.length,
      dawnbidScores: out.dawnbidScores.length, dawnbidDeparts: out.dawnbidDeparts.length,
      dawnbidCensus: out.dawnbidCensus.length, dawnbidStarts: out.dawnbidStarts.length,
      companionPool: out.companionPool.length,
      v4creates: out.v4creates.length, planCensus: out.planCensus.length,
      havenTickCalls: out.havenTickCalls.length, tickGates: out.tickGates.length,
      tickGateChecks: out.tickGateChecks.length,
      tickGateMismatches: out.tickGateChecks.filter(function (c) { return !c.match; }).length,
      igniteCensus: out.igniteCensus.length, igniteVillage: out.igniteVillage.length,
      funnelStage: out.funnelStage.length, funnelMaxStage: out.funnelVillage.maxStage,
      firstLaunchDay: out.funnelVillage.firstLaunchDay, lostDay: out.funnelVillage.lostDay,
      deadTargetChecks: out.deadTargetChecks.length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun, loadWave4Ids: loadWave4Ids, loadWave4pIds: loadWave4pIds, planIsWave4: planIsWave4, planIsWave4p: planIsWave4p, deriveLaunchBlock: deriveLaunchBlock, poolReplica: poolReplica, classifySeedPath: classifySeedPath, firstCallerFrame: firstCallerFrame, SEED_PATHS: SEED_PATHS, classifyHavenSource: classifyHavenSource, isNamedCreator: isNamedCreator, CREATORS: CREATORS, GATE_BUCKETS: GATE_BUCKETS, profileScoreParts: profileScoreParts, profileOfReplica: profileOfReplica, firstFailBucket: firstFailBucket, classifyHavenCallOutcome: classifyHavenCallOutcome, FROZEN_BASE: FROZEN_BASE };
