// fibersupply-driver-a.js — DIAGNOSIS driver, arm sim-fibersupply-a
// (finding #2590, fiber supply: WHY the communal pile never has fiber
// when a departure tries to craft arrows. Read-only instrument — NO
// game-code change in this arm; the fix is a separate arm.)
// Substrate on BOTH legs: SPEARGATE (landed gate) + BOWOPEN (staging)
// + SENSEEXPED (sense fix), all landed on master faa5d65a9.
// DEPMAT / ROLL35 / AMMO are NOT on master (the ammo arm reverted
// them) and are UNSET on both legs — the diag measures the pile on
// live master substrate, upstream of any of them. BOWCRAFT is
// always-on in code (live ground).
// BOWKNOW (mentoring) and DEPARTSEE (departure-site seeing) are
// UNSET on both legs — knowledge seeding is proven non-binding and
// must not leak into this measurement. EVADEOBS is UNSET on both
// legs — the evade fix is proven and is NOT re-landed here, so the
// evade wall stands at its background rate (evade-on-a-served-
// quivered-bow is the NEXT arm, not this one).
// A copy of scripts/ammo-driver-a.js — the depmatRows + ammoRows
// recorders are UNCHANGED, plus the NEW fiber recorders (pure reads):
//   fiberCensus — one row per village-day (end of day): the pile
//     materials, pile arrows, scholar personal fiber, villagers'
//     personal fiber, the Game deadfall counters (_deadfallHauls /
//     _deadfallFiber / _deadfallSticks), the deadfall staffed count,
//     the trust level (open/closed — the contribute/skim switch).
//   fiberEvents — pile-fiber deltas per resolveOneAssignment call
//     (by task — the deadfall source), per npcBatchTurn (contribute
//     / skim), per villagerPocketAmmo call (the arrow-craft sink),
//     per villagerWeaponCraftDay / villagerArmorCraftDay call
//     (expected zero fiber — the proof that no other villager craft
//     touches it). Nonzero pile deltas only; re-entrancy-guarded so
//     a redirected assignment records one outer row.
//   fiberCrafts — scholar craft() calls on fiber recipes: personal
//     fiber spent vs pile fiber delta (the two fiber economies).
//   fiberSays — say-lines mentioning fiber (sense-test feed).
//   fiberStashLog — stashLog lines mentioning fiber (ledger view).
//   ammoRows gains pileAfter, so the arrow-craft sink is measured
//   per departure (pileBefore - pileAfter on the attempt).
// The corpus files carry wiringSha, gameSha, depmatPresent,
// roll35Present, ammoPresent (all three expected FALSE — the
// reverted arms are not in this tree), speargatePresent,
// speargateOn, bowopenPresent, bowopenOn, senseexpedOn so each file
// self-describes which code+flags it ran under.
// Legs: ctl = the judged leg; the determinism check is a one-seed
// re-run (RUN=fibersupply-a-rerun, same env, seed 111701) compared by
// the analyzer's --rerun fiber hash, NOT a second full leg — a diag
// changes no game code, so there is no before/after pair. main()
// asserts the MODE label matches the flags and stops otherwise — a
// leg/flag mismatch is a loud stop, never a silent mislabel.
// Policy: competent verbatim (scripts/policies/competent.js), 150d
// death-aware. Pilot band 111701-111708 (FRESH — see prereg
// evidence/2026-11-27/sim-fibersupply-a-prereg.md §4 for the
// freshness check). Re-run of the 2026-11-21 arm (band 107091-107098)
// with the home-craft wrap added (see installFiberWraps below).
// Usage:
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 MODE=ctl EVIDENCE_DATE=2026-11-27 OUTDIR=perseed-fibersupply-a SEEDS=111701,111702 RUN=fibersupply-a node scripts/fibersupply-driver-a.js
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 MODE=ctl EVIDENCE_DATE=2026-11-27 OUTDIR=perseed-fibersupply-a-rerun SEEDS=111701 RUN=fibersupply-a-rerun node scripts/fibersupply-driver-a.js
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const VF = require(path.join(REPO, 'scripts', 'vetfirst-instrument-20261111'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'fibersupply-a';
const MODE = process.env.MODE || 'vre';
const OUTDIR = process.env.OUTDIR || ('perseed-fibersupply-a-' + MODE);
const RECORDER_ON = process.env.LAUNCHPARTY_RECORDER !== 'off';
// SEEDLAND (sim-seedland-b): the fieldFight watch is wave >= 4
// (wave-5 encounters are recorded in v4encounters alongside wave-4)
// and each encounter row carries `origin`, read from the call stack
// at the wrap with the gatelever driver's fightOrigin taxonomy.
// LAUNCHPARTY: hard-on in this driver (SEEDLAND = true below), per prereg.
// Both additions are pure reads (no RNG, no game-state writes).
// LAUNCHSURVIVE (sim-launchsurvive-a): when LAUNCHSURVIVE=1 the
// per-day launch tracker runs (v4launchTrack rows — holder /
// companion nodes, last-known tile, target persistence; see
// recordLaunchTrack below) AND the SEEDLAND semantics apply even
// when SEEDLAND is unset, so a tracker run can never be
// misconfigured into an unjudgeable corpus. Flag unset = no tracker
// rows at all (no `v4launchTrack` key on the output).
const LAUNCHSURVIVE = process.env.LAUNCHSURVIVE === '1';
const SEEDLAND = true; // LAUNCHPARTY: SEEDLAND semantics hard-on (wave>=4 encounters + origin), per prereg.

// MODE is validated in main() (the CLI path) only, so the proof test
// can require this module in-process without setting MODE.

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

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
let POLICY_SHA = 'unknown';
try { POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8')).digest('hex').slice(0, 12); } catch (e) {}
// TRIODROUGHT: sha of the file that carries the lever, so each corpus
// file self-describes whether it ran with the writeCommit carry.
let BRAIN_SHA = 'unknown';
let CARRY_PRESENT = false;
try {
  const brainSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-brain.js'), 'utf8');
  BRAIN_SHA = crypto.createHash('sha256').update(brainSrc).digest('hex').slice(0, 12);
  CARRY_PRESENT = /companion2:\s*chosen\.companion2\s*\|\|\s*null/.test(brainSrc);
} catch (e) {}
// SENSEEXPED-SENSE: sha of the file that carries the sense fix + whether
// the launch preference is in it, so each corpus file self-describes the
// code it ran under. The flag itself is recorded per file below.
// (SENSEEXPED=1 is the LANDED successor of the old LAUNCHPARTY sense —
// same effect, better membership rule; see the prereg §0 correction.)
let WIRING_SHA = 'unknown';
let SENSE_PRESENT = false;
try {
  const wiringSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'party-wiring.js'), 'utf8');
  WIRING_SHA = crypto.createHash('sha256').update(wiringSrc).digest('hex').slice(0, 12);
  SENSE_PRESENT = /SENSEEXPED/.test(wiringSrc) && /exped/.test(wiringSrc) && /villagerFightAllies/.test(wiringSrc);
} catch (e) {}
const SENSEEXPED_ON = process.env.SENSEEXPED === '1';
const BOWOPEN_ON = process.env.BOWOPEN === '1';
const SPEARGATE_ON = process.env.SPEARGATE === '1';
const DEPMAT_ON = process.env.DEPMAT === '1';
const ROLL35_ON = process.env.ROLL35 === '1';
const BOWKNOW_ON = process.env.BOWKNOW === '1'; // must stay unset on both legs (prereg substrate)
// BOWOPEN: sha of the file that carries the bow-staging mechanism +
// whether it is in it, so each corpus file self-describes the code it
// ran under. The flag itself is recorded per file below.
// DEPMAT: the file that carries the seeing rule is game.js
// (villagerStageBow step 3), not villager-build.js — the presence
// check reads gameSrc below, next to the BOWOPEN/SPEARGATE checks.
let GAME_SHA = 'unknown';
let BOWOPEN_PRESENT = false;
let SPEARGATE_PRESENT = false;
let DEPMAT_PRESENT = false;
let ROLL35_PRESENT = false;
let AMMO_PRESENT = false;
try {
  const gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  GAME_SHA = crypto.createHash('sha256').update(gameSrc).digest('hex').slice(0, 12);
  BOWOPEN_PRESENT = /BOWOPEN/.test(gameSrc) && /villagerStageBow/.test(gameSrc);
  SPEARGATE_PRESENT = /SPEARGATE/.test(gameSrc) && /villagerStageBow/.test(gameSrc) && /volleyWeaponOf/.test(gameSrc);
  DEPMAT_PRESENT = /DEPMAT/.test(gameSrc) && /villagerStageBow/.test(gameSrc) && /weapon_craft_site/.test(gameSrc);
  ROLL35_PRESENT = /ROLL35/.test(gameSrc) && /villagerStageBow/.test(gameSrc) && /roll35Rate/.test(gameSrc);
  AMMO_PRESENT = /AMMO \(sim-ammo-a/.test(gameSrc) && /villagerPocketAmmo/.test(gameSrc);
} catch (e) {}
const AMMO_ON = process.env.AMMO === '1';
const FIGHTALLY2_ON = process.env.FIGHTALLY2 === '1';
let STANDING_MARKER = false;
try { STANDING_MARKER = fs.readFileSync(path.join(REPO, 'src', 'js', 'standing.js'), 'utf8').indexOf('ROSTER CHECK') !== -1; } catch (e) {}

function sleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) {
    const t0 = process.hrtime.bigint();
    while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
  }
}
// The host write flap (2026-11-20, this arm): file writes fail EPERM in
// minutes-long windows while the process keeps running. A failed
// process.stdout.write to a FILE raises an unhandled 'error' event on
// the SyncWriteStream and kills the whole run (ctl leg, seeds 105906-7:
// the @@FALLBACK dump itself threw EPERM and crashed node mid-leg).
// Swallow stream errors so a refused log/fallback write can never kill
// the sim — the per-seed corpus files are the source of truth and are
// verified after the run, never the log.
process.stdout.on('error', function () {});
process.stderr.on('error', function () {});
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 2400; i++) { // 2400 x 250ms = 10 min: ride out a flap window
    try {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, data);
        const back = fs.readFileSync(filePath, 'utf8');
        if (back.length !== data.length) throw new Error('readback length mismatch');
        return true;
      }
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      return true;
    } catch (e) {
      sleepMs(250);
    }
  }
  // No stdout fallback dump: during a flap the dump itself throws EPERM
  // on the log stream and kills the run (see header note). The sim is
  // deterministic per seed — a lost seed is re-run after the flap clears.
  return false;
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

// ---- SEEDPATHS helpers (module scope: the proof test requires them) ----
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
      if (line.indexOf('fibersupply-driver-a.js') !== -1) continue;
      if (line.indexOf('launchparty-caller') !== -1) continue;
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

// fightOrigin(stackOverride): the fieldFight caller, read from the
// call stack at the wrap — the same caller taxonomy as the gatelever
// driver's fightOrigin (`expedition` | `world-tick` | `patrol` |
// `aid` | `other:<fn>` | `unclassified`), skipping this driver's own
// frames (and the sim-harness + the game's own fieldFight deed wrap,
// which is not a caller). Pure read: no RNG, no game-state writes.
// Only used when SEEDLAND=1. stackOverride (a stack string) exists
// for the proof test's fixtures; production calls it with no args.
function fightOrigin(stackOverride) {
  try {
    const st = stackOverride != null ? String(stackOverride) : (new Error().stack || '');
    const lines = st.split('\n').slice(1);
    for (const ln of lines) {
      const m = ln.match(/at\s+(?:[A-Za-z_$][\w$]*\.)?([A-Za-z_$][\w$]*)\s+\(([^)]+)\)/) ||
                ln.match(/at\s+([^\s(]+)\s+\(([^)]+)\)/);
      if (!m) continue;
      const fn = m[1] || '';
      const file = m[2] || '';
      if (file.indexOf('fibersupply-driver-a.js') !== -1) continue;
      if (file.indexOf('sim-harness') !== -1) continue;
      if (file.indexOf('src/js/') === -1 && file.indexOf('src\\js\\') === -1) continue;
      // The game's own fieldFight deed wrap (progression.js) — not a
      // caller. Keep walking to the real caller below it.
      if (fn === 'fieldFight') continue;
      if (fn === 'expeditionMonster') return 'expedition';
      if (fn === 'resolveWildMonsterEncounter') return 'world-tick';
      if (fn === 'resolvePatrol') return 'patrol';
      if (fn === 'aidFight') return 'aid';
      return 'other:' + fn;
    }
    return 'unclassified';
  } catch (e) { return 'unclassified'; }
}

// targetPersistence(Game, target, tile): the live world-monster
// read for the launch tracker (sim-launchsurvive-a). Returns
// { nearDist, nearCount, aliveCount } for live world monsters of
// type `target` (m.id is the type id — game.js:27078 filters the
// same way) vs `tile` ({nx, ny}, node coords): nearDist is the
// minimum Chebyshev distance from any live target-type monster to
// the tile (null when no live monster of that type or no tile),
// nearCount is how many sit within Chebyshev distance <= 2 (the
// frozen persistence radius), aliveCount is how many of the type
// are alive anywhere. When the world-monster list itself is
// unreadable all three are null (explicit, never a silent zero).
// Pure read; never throws into the caller.
function targetPersistence(Game, target, tile) {
  try {
    if (!target) return { nearDist: null, nearCount: null, aliveCount: null };
    const list = (Game.worldMonsters && typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : null;
    if (!Array.isArray(list)) return { nearDist: null, nearCount: null, aliveCount: null };
    let aliveCount = 0, nearDist = null, nearCount = 0;
    for (const m of list) {
      if (!m || m.id !== target) continue;
      aliveCount++;
      if (!tile || tile.nx == null || tile.ny == null) continue;
      const dist = Math.max(Math.abs((m.tx | 0) - tile.nx), Math.abs((m.ty | 0) - tile.ny));
      if (nearDist == null || dist < nearDist) nearDist = dist;
      if (dist <= 2) nearCount++;
    }
    if (!tile || tile.nx == null || tile.ny == null) return { nearDist: null, nearCount: 0, aliveCount: aliveCount };
    return { nearDist: nearDist, nearCount: nearCount, aliveCount: aliveCount };
  } catch (e) { return { nearDist: null, nearCount: null, aliveCount: null }; }
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

// ---- FIBER helpers (sim-fibersupply-a, finding #2590) ----
// Pure reads, no RNG, no game-state writes. Exported for the proof
// test (scripts/test-fibersupply-a.js). The fiber ledger: every
// pile-fiber move is attributed to the call that made it — the
// assignment that resolved it, the batch turn that contributed or
// skimmed it, the departure that crafted with it, the scholar craft
// that spent personal fiber instead.
const FIBER_RE = /fiber/i;
function pileMats(Game) {
  try {
    const st = (Game.stashState) ? Game.stashState() : null;
    const mats = (st && st.materials) || {};
    const out = {};
    for (const k of Object.keys(mats)) out[k] = mats[k] | 0;
    return out;
  } catch (e) { return null; }
}
function pileArrows(Game) {
  try {
    const st = (Game.stashState) ? Game.stashState() : null;
    let n = 0;
    for (const w of ((st && st.weapons) || [])) {
      const wid = w && (w.itemId || w.id);
      if (wid === 'arrow') n += (w.units != null ? w.units : 1);
    }
    const mats = (st && st.materials) || {};
    if (mats.arrow) n += (mats.arrow | 0);
    return n;
  } catch (e) { return null; }
}
function personalFiber(Game) {
  // The two fiber economies, read separately: the scholar's personal
  // pack vs every villager's personal pack. The pile is pileMats().
  let scholar = null, villagers = 0, holders = 0;
  try {
    if (Game.materialCount) scholar = Game.materialCount('fiber') | 0;
    else {
      scholar = 0;
      for (const e of ((Game.state.scholar || {}).inventory || [])) if (e && e.material === 'fiber') scholar += (e.units || 1);
    }
  } catch (e) { scholar = null; }
  try {
    const roster = ((Game.state || {}).village || {}).roster || [];
    for (const vid of roster) {
      let n = 0;
      try {
        const p = Game.getPerson ? Game.getPerson(vid) : null;
        for (const e of ((p && p.items) || [])) {
          const eid = (typeof e === 'string') ? e : (e && (e.itemId || e.id || e.material));
          if (eid === 'fiber') n += (typeof e === 'string') ? 1 : (e.units || 1);
        }
      } catch (e2) {}
      if (n > 0) holders++;
      villagers += n;
    }
  } catch (e) {}
  return { scholar: scholar, villagers: villagers, villagerHolders: holders };
}
function fiberDelta(before, after) {
  // Per-material pile delta between two pileMats snapshots (null-safe).
  const out = {};
  const keys = {};
  if (before) for (const k of Object.keys(before)) keys[k] = true;
  if (after) for (const k of Object.keys(after)) keys[k] = true;
  for (const k of Object.keys(keys)) out[k] = ((after && after[k]) | 0) - ((before && before[k]) | 0);
  return out;
}
// installFiberWraps(Game, ctx, errors): installs the fiber ledger
// wraps. ctx carries { fiberCensus, fiberEvents, fiberCrafts,
// fiberSays, fiberStashLog, craftDayCalls }. Returns { uninstall }.
// Every wrapped call runs the original exactly once, untouched;
// recorder failures go to `errors`, never throw into the game.
// resolveOneAssignment is re-entrancy-guarded (throttle redirects
// recurse): only the outermost call snapshots and records, so one
// resolution is one ledger row, labeled with the outer task.
function installFiberWraps(Game, ctx, errors) {
  const origs = {};
  function wrapMethod(name, fn) {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { errors.push('fiber-wrap-missing: ' + name); return false; }
      origs[name] = orig;
      Game[name] = fn(orig);
      return true;
    } catch (e) { errors.push('fiber-wrap-install: ' + name + ': ' + String(e.message).slice(0, 80)); return false; }
  }
  let assignDepth = 0;
  wrapMethod('resolveOneAssignment', function (orig) {
    return function (vid, a) {
      if (assignDepth > 0) return orig.apply(this, arguments);
      let task = null, before = null;
      try { task = (a && a.task) || ((((Game.state || {}).village || {}).assignments || {})[vid] || {}).task || null; } catch (e) {}
      try { before = pileMats(Game); } catch (e) { before = null; }
      assignDepth++;
      let ret = null;
      try { ret = orig.apply(this, arguments); }
      finally {
        assignDepth--;
        try {
          const after = pileMats(Game);
          const d = fiberDelta(before, after);
          if ((d.fiber | 0) !== 0) {
            ctx.fiberEvents.push({ kind: 'assign', day: gday(Game), vid: vid, task: task,
              dFiber: d.fiber | 0, dStick: d.stick | 0, dStone: d.stone | 0,
              pileBefore: before, pileAfter: after });
          }
        } catch (e) { errors.push('fiber-assign-log: ' + String(e.message).slice(0, 80)); }
      }
      return ret;
    };
  });
  wrapMethod('npcBatchTurn', function (orig) {
    return function () {
      let before = null;
      try { before = pileMats(Game); } catch (e) { before = null; }
      const ret = orig.apply(this, arguments);
      try {
        const after = pileMats(Game);
        const d = fiberDelta(before, after);
        if ((d.fiber | 0) !== 0) {
          ctx.fiberEvents.push({ kind: 'batchTurn', day: gday(Game), vid: null, task: null,
            dFiber: d.fiber | 0, dStick: d.stick | 0, dStone: d.stone | 0,
            pileBefore: before, pileAfter: after });
        }
      } catch (e) { errors.push('fiber-batch-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  wrapMethod('villagerPocketAmmo', function (orig) {
    return function (vid) {
      let before = null;
      try { before = pileMats(Game); } catch (e) { before = null; }
      const ret = orig.apply(this, arguments);
      try {
        const after = pileMats(Game);
        const d = fiberDelta(before, after);
        if ((d.fiber | 0) !== 0 || (ret && ret.crafted === 1)) {
          ctx.fiberEvents.push({ kind: 'pocketAmmo', day: gday(Game), vid: vid, task: null,
            dFiber: d.fiber | 0, dStick: d.stick | 0, dStone: d.stone | 0,
            crafted: (ret && ret.crafted) | 0, craftedOk: !!(ret && ret.craftedOk),
            pileBefore: before, pileAfter: after });
        }
      } catch (e) { errors.push('fiber-pocket-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  wrapMethod('villagerWeaponCraftDay', function (orig) {
    return function () {
      try { ctx.craftDayCalls.weapon = (ctx.craftDayCalls.weapon || 0) + 1; } catch (e) {}
      let before = null;
      try { before = pileMats(Game); } catch (e) { before = null; }
      const ret = orig.apply(this, arguments);
      try {
        const after = pileMats(Game);
        const d = fiberDelta(before, after);
        if ((d.fiber | 0) !== 0) {
          ctx.fiberEvents.push({ kind: 'weaponCraftDay', day: gday(Game), vid: null, task: null,
            dFiber: d.fiber | 0, dStick: d.stick | 0, dStone: d.stone | 0,
            pileBefore: before, pileAfter: after });
        }
      } catch (e) { errors.push('fiber-weaponcraft-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  wrapMethod('villagerArmorCraftDay', function (orig) {
    return function () {
      try { ctx.craftDayCalls.armor = (ctx.craftDayCalls.armor || 0) + 1; } catch (e) {}
      let before = null;
      try { before = pileMats(Game); } catch (e) { before = null; }
      const ret = orig.apply(this, arguments);
      try {
        const after = pileMats(Game);
        const d = fiberDelta(before, after);
        if ((d.fiber | 0) !== 0) {
          ctx.fiberEvents.push({ kind: 'armorCraftDay', day: gday(Game), vid: null, task: null,
            dFiber: d.fiber | 0, dStick: d.stick | 0, dStone: d.stone | 0,
            pileBefore: before, pileAfter: after });
        }
      } catch (e) { errors.push('fiber-armorcraft-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  // NEW (2026-11-27 re-run): the HOME arrow-craft wrap. The Nov 21
  // instrument was wrap-blind here — its 155 home-craft fiber was
  // inferred from the stash ledger, not attributed. villagerAmmoCraftDay
  // runs once a day and iterates home villagers internally, so one row
  // per duty call: pile delta + the attempt count (vids whose
  // arrowCraftCd became today — the duty sets it exactly when it
  // attempts; a materials-skip sets no cooldown). Same pattern as the
  // weapon/armor craft-day wraps: original called exactly once, no RNG.
  wrapMethod('villagerAmmoCraftDay', function (orig) {
    return function () {
      try { ctx.craftDayCalls.home = (ctx.craftDayCalls.home || 0) + 1; } catch (e) {}
      let before = null, preCd = null;
      try { before = pileMats(Game); } catch (e) { before = null; }
      try { preCd = JSON.parse(JSON.stringify((((Game.state || {}).village || {}).arrowCraftCd) || {})); } catch (e) { preCd = null; }
      const ret = orig.apply(this, arguments);
      try {
        const after = pileMats(Game);
        const d = fiberDelta(before, after);
        let attempts = 0;
        try {
          const day = gday(Game);
          const cdNow = (((Game.state || {}).village || {}).arrowCraftCd) || {};
          for (const vid of Object.keys(cdNow)) if (cdNow[vid] === day && (!preCd || preCd[vid] !== day)) attempts++;
        } catch (e) {}
        if ((d.fiber | 0) !== 0 || attempts > 0) {
          ctx.fiberEvents.push({ kind: 'homeCraft', day: gday(Game), vid: null, task: null,
            dFiber: d.fiber | 0, dStick: d.stick | 0, dStone: d.stone | 0,
            attempts: attempts, batches: (ret | 0),
            pileBefore: before, pileAfter: after });
        }
      } catch (e) { errors.push('fiber-homecraft-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  wrapMethod('craft', function (orig) {
    return function (recipeId) {
      let pfBefore = null, persBefore = null, usesFiber = false;
      try {
        const rec = ((Game.data || {}).recipes || []).find(function (r) { return r && r.id === recipeId; }) || null;
        usesFiber = !!(rec && rec.materials && rec.materials.fiber);
      } catch (e) {}
      try { pfBefore = pileFiberOf(Game); } catch (e) { pfBefore = null; }
      try { persBefore = personalFiber(Game).scholar; } catch (e) { persBefore = null; }
      const ret = orig.apply(this, arguments);
      try {
        if (usesFiber) {
          const pfAfter = pileFiberOf(Game);
          const persAfter = personalFiber(Game).scholar;
          ctx.fiberCrafts.push({ day: gday(Game), recipe: recipeId,
            fiberSpentPersonal: ((persBefore == null || persAfter == null) ? null : (persBefore - persAfter)),
            pileFiberDelta: ((pfBefore == null || pfAfter == null) ? null : (pfAfter - pfBefore)),
            success: ret === true });
        }
      } catch (e) { errors.push('fiber-craft-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  wrapMethod('stashLog', function (orig) {
    return function (kind, what, qty, vid) {
      const ret = orig.apply(this, arguments);
      try {
        if (FIBER_RE.test(String(what || ''))) {
          ctx.fiberStashLog.push({ day: gday(Game), kind: kind, what: String(what), qty: qty, vid: vid || null });
        }
      } catch (e) { errors.push('fiber-stashlog-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  wrapMethod('say', function (orig) {
    return function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string' && FIBER_RE.test(arg) && ctx.fiberSays.length < 400) {
          ctx.fiberSays.push({ day: gday(Game), line: String(arg).slice(0, 600) });
        }
      } catch (e) { errors.push('fiber-say-log: ' + String(e.message).slice(0, 80)); }
      return orig.apply(this, arguments);
    };
  });
  return {
    uninstall: function () {
      for (const name of Object.keys(origs)) {
        try { Game[name] = origs[name]; } catch (e) {}
      }
    },
  };
}
function pileFiberOf(Game) {
  try { const m = pileMats(Game); return m ? (m.fiber | 0) : null; } catch (e) { return null; }
}

const SAY_RE = /veteran|blooded|scarred|\belder\b|pack-leader|put down|killing blow|veteran kill|remember the name|MIRROR DRAFT|PRODUCERS|FINAL DRAFT|blood your fighters/i;

// LAUNCHPARTY: monotonic row sequence (lets the analyzer join a launch
// depart row to the commit that authorized it) + commit-kind names.
// Copied verbatim from scripts/launchdef-driver-20261116.js.
let rowSeq = 0;
function nextSeq() { return ++rowSeq; }
function commitKindOf(commit) {
  if (!commit) return null;
  if (commit.part === 0) return 'dawn';
  if (commit.part === 1) return 'mid-day part-1';
  if (commit.part === 2) return 'mid-day part-2';
  return 'part-' + commit.part;
}

// LAUNCHPARTY-RECORDER (sim-partysize-recorder-b, finding #2488): the
// spawned monster HP, recovered AFTER the fight from the fight record.
// The pre-call capture (hpOf(m) || hpOf(mdef)) cannot work on the
// expedition path: villager-agency.js passes the monster DEF, whose
// hp is a RANGE ([950,1150]), so no spawned number exists before the
// call — fieldFights.js rolls it (lroll(hpDef)) into members[0].hp.
// After the call the record carries everything needed:
//   - fought, non-kill: mHpStart = rec.mHpLeft + rec.mDealt (the
//     monster's remaining HP plus everything dealt to it). Wave-4/5
//     monsters are pack-1, so mDealt is lead-only and the sum is
//     exact; the proof test cross-checks it against rec.mHpStart
//     (the CONTACTREC field) on live fixture fights.
//   - vKill: the kill's share is 1.0 by definition; exact spawned HP
//     is unrecoverable from the record (mHpLeft is 0 and the killing
//     blow may overkill), so mHpStart stays null and vKill is set —
//     the analyzer shares it at 1.0 and does not count it missing.
//   - no-contact (evade / alreadyDead, or rounds 0 with 0 dealt):
//     no monster ever spawned for the fight — mHpStart stays null,
//     correctly; the analyzer does not count these missing.
//   - otherwise (a record without the fields): fall back to the
//     pre-call live-instance read, if any.
// Pure: reads only, no RNG, no state writes. Exported for the proof
// test (scripts/test-launchparty-recorder-b.js).
function recoverMHpStart(rec, preHp) {
  var pre = (typeof preHp === 'number' && isFinite(preHp) && preHp > 0) ? preHp : null;
  if (!rec) return { mHpStart: pre, vKill: false, noContact: false };
  var rounds = rec.rounds | 0;
  var dealt = rec.mDealt | 0;
  var noContact = rec.outcome === 'evade' || rec.outcome === 'alreadyDead' || (rounds === 0 && dealt === 0);
  if (noContact) return { mHpStart: null, vKill: false, noContact: true };
  if (rec.outcome === 'vKill') return { mHpStart: null, vKill: true, noContact: false };
  if (rec.mHpLeft != null && rec.mDealt != null) {
    var v = Math.max(0, rec.mHpLeft) + Math.max(0, rec.mDealt);
    if (v > 0) return { mHpStart: v, vKill: false, noContact: false };
  }
  return { mHpStart: pre, vKill: false, noContact: false };
}

// LAUNCHPARTY: the agencyTick skip-reason recorder, copied verbatim
// from scripts/launchdef-driver-20261116.js (same code path oneRun
// uses). installSkipRecorder(Game, mode, errors, skips): wraps
// agencyTick + chains onto vbrainExecuteDepart; returns
// { skips, uninstall }. Pure reads + writes to the caller's skips
// array; the original tick runs exactly once, untouched.
// NOTE: mode is always passed as 'on' by this driver — the PROFILEGATE
// bypass is landed in this base, so profile can never veto a
// party_launch commit; a residual veto would surface as `other`.
function planOfGame(Game, vid) {
  try { const v = (Game.state || {}).village || {}; return (v.winPlan || {})[vid] || null; } catch (e) { return null; }
}
function installSkipRecorder(Game, mode, errors, skips) {
  let tickExecute = null;
  function skipSnapshot(vid) {
    const day = gday(Game);
    let commit = null;
    try { commit = (typeof Game.vbrainCommit === 'function') ? Game.vbrainCommit(vid) : null; } catch (e) {}
    if (!commit || commit.day !== day || commit.winPlanAction !== 'party_launch') return null;
    const plan = planOfGame(Game, vid);
    if (!planIsWave4(Game, plan)) return null;
    const snap = { vid: vid, day: day, part: (Game.dayPart | 0), target: plan.target || null,
      stage: plan.stage || null, party: (plan.party || []).slice(),
      commitKind: commitKindOf(commit), commitPart: (commit.part != null ? commit.part : null),
      leg: mode, profile: null, node: null, haven: null, exped: null, away: null,
      night: null, engaged: null, indoor: null, danger: null, dead: null };
    try { snap.profile = Game.npcRangeProfile ? Game.npcRangeProfile(vid) : null; } catch (e) {}
    try {
      const v = Game.state.village || {};
      const hx = (v.px != null ? v.px : 4), hy = (v.py != null ? v.py : 4);
      let n = null;
      try { n = Game.npcNode ? Game.npcNode(vid) : null; } catch (e) {}
      snap.node = n ? { nx: n.nx, ny: n.ny } : null;
      snap.haven = !!(n && n.nx === hx && n.ny === hy);
    } catch (e) {}
    try { const a = Game.agencyState ? Game.agencyState() : null; snap.exped = !!(a && a.exped && a.exped[vid]); } catch (e) {}
    try { snap.away = !!(((Game.state.village || {}).away || {})[vid]); } catch (e) {}
    try { snap.night = Game.isNight ? !!Game.isNight() : false; } catch (e) {}
    try { snap.engaged = Game.isEngaged ? !!Game.isEngaged(vid) : false; } catch (e) {}
    try {
      let dead = false;
      try { const p = Game.getPerson ? Game.getPerson(vid) : null; if (p && p.dead) dead = true; } catch (e2) {}
      snap.dead = dead;
    } catch (e) {}
    try {
      if (Game.objOf) {
        const oo = Game.objOf(vid);
        let brainExped = false;
        try { const bc = Game.vbrainCommit ? Game.vbrainCommit(vid) : null; brainExped = !!(bc && bc.kind === 'EXPEDITION' && bc.day === day); } catch (e2) {}
        snap.indoor = !!(oo && oo.indoor && oo.state === 'indoor' && !brainExped);
      } else snap.indoor = false;
    } catch (e) {}
    try { snap.danger = Game.npcTrigger ? !!Game.npcTrigger(vid, 'expedition_launch') : false; } catch (e) {}
    return snap;
  }
  function deriveSkipReason(snap, executeResult) {
    if (snap.dead) return 'holder-dead';
    if (snap.engaged) return 'engaged';
    if (snap.exped) return (snap.stage === 'hunt') ? 'away-on-expedition' : 'away-as-companion';
    if (mode === 'control' && snap.profile !== 'wanderer' && snap.profile !== 'explorer') return 'profile-gate-veto';
    if (!snap.haven) return 'not-at-haven';
    if (snap.night) return 'night';
    if (snap.indoor) return 'indoor-objective';
    if (snap.danger) return 'danger-gate';
    if (executeResult === 'normal') return 'execute-returned-normal';
    return 'other';
  }
  const origAgencyTick = Game.agencyTick;
  const origExecute = Game.vbrainExecuteDepart;
  let installedTick = false, installedExec = false;
  try {
    if (typeof origExecute === 'function') {
      Game.vbrainExecuteDepart = function (vid, hx, hy, announce) {
        const ret = origExecute.apply(this, arguments);
        try { if (tickExecute) tickExecute[vid] = ret; } catch (e) {}
        return ret;
      };
      installedExec = true;
    }
  } catch (e) { errors.push('launchparty-skip-exec-install: ' + String(e.message).slice(0, 80)); }
  try {
    if (typeof origAgencyTick === 'function') {
      Game.agencyTick = function () {
        let snaps = [];
        try {
          const wp = ((Game.state || {}).village || {}).winPlan || {};
          for (const pvid of Object.keys(wp)) {
            const sn = skipSnapshot(pvid);
            if (sn) snaps.push(sn);
          }
        } catch (e) { errors.push('launchparty-skip-snapshot: ' + String(e.message).slice(0, 80)); }
        tickExecute = {};
        let ret = null;
        try { ret = origAgencyTick.apply(this, arguments); }
        finally {
          try {
            const calls = tickExecute || {};
            tickExecute = null;
            for (const sn of snaps) {
              const res = calls[sn.vid];
              if (res === 'launch' || res === 'hold') continue; // depart row governs
              const reason = deriveSkipReason(sn, res);
              skips.push({ seq: nextSeq(), day: sn.day, part: sn.part, vid: sn.vid,
                target: sn.target, stage: sn.stage, party: sn.party,
                commitKind: sn.commitKind, commitPart: sn.commitPart, leg: mode,
                reason: reason, executeResult: (res != null ? res : null),
                raw: { profile: sn.profile, node: sn.node, haven: sn.haven,
                  exped: sn.exped, away: sn.away, night: sn.night,
                  engaged: sn.engaged, indoor: sn.indoor, danger: sn.danger,
                  dead: sn.dead } });
            }
          } catch (e) { errors.push('launchparty-skip-log: ' + String(e.message).slice(0, 80)); }
        }
        return ret;
      };
      installedTick = true;
    }
  } catch (e) { errors.push('agencyTick-wrap-install: ' + String(e.message).slice(0, 80)); }
  return {
    skips: skips,
    uninstall: function () {
      try { if (installedTick) Game.agencyTick = origAgencyTick; } catch (e) {}
      try { if (installedExec) Game.vbrainExecuteDepart = origExecute; } catch (e) {}
    },
  };
}

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'launchparty-' + MODE, fullTelemetry: false });
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
  // ---- DAWNBID CAPTURE ----
  const dawnbidScores = [];
  const dawnbidDeparts = [];
  const dawnbidCensus = [];
  const dawnbidStarts = [];
  // ---- LAUNCHPARTY: skip-reason rows ----
  const launchdefSkips = [];
  // ---- COMPANIONPOOL CAPTURE ----
  const companionPool = [];
  // ---- FIBER LEDGER (sim-fibersupply-a) ----
  // fiberCensus: one row per village-day (daily snapshot block).
  // fiberEvents / fiberCrafts / fiberSays / fiberStashLog: filled
  // by installFiberWraps (module scope). Skipped whole when the
  // recorder is off (determinism leg D2) — the arrays stay empty.
  const fiberCensus = [];
  const fiberEvents = [];
  const fiberCrafts = [];
  const fiberSays = [];
  const fiberStashLog = [];
  const fiberCtx = { fiberCensus: fiberCensus, fiberEvents: fiberEvents,
    fiberCrafts: fiberCrafts, fiberSays: fiberSays, fiberStashLog: fiberStashLog,
    craftDayCalls: { weapon: 0, armor: 0, home: 0 } };
  // ---- LAUNCHSURVIVE TRACKER (sim-launchsurvive-a) ----
  // One row per live wave-4 plan holder per day (recorded in the
  // daily snapshot block alongside dawnbidCensus). LAUNCHSURVIVE=1
  // only; flag unset = this array stays empty and no
  // `v4launchTrack` key is written on the output.
  const v4launchTrack = [];
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
          if (w >= 4 && mdef && mdef.id) { // LAUNCHPARTY: gate stage covers wave-4+ (was wave == 4)
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
        // SEEDPATHS: classify the firing path BEFORE the call, from
        // the outcome + the caller's stack (the stack is a pure read;
        // the classification never touches game state or RNG).
        let seedPath = 'unknown-no-stack';
        let seedCaller = null;
        try {
          const st = (new Error('launchparty-caller')).stack || '';
          seedCaller = firstCallerFrame(st);
          seedPath = classifySeedPath(outcome || null, st);
        } catch (e) { seedPath = 'unknown-stack-error'; }
        const ret = origSeed.apply(this, arguments);
        try {
          const w = waveOf(mdef);
          if (w >= 3 && mdef && mdef.id) {
            const plan = planOf(vid);
            v4seeds.push({ day: gday(Game), vid: vid, mid: mdef.id, wave: w, outcome: outcome || null,
              path: seedPath, caller: seedCaller, blocked: (ret == null),
              stageAfter: plan ? plan.stage : null, target: plan ? plan.target : null,
              node: plan && plan.node ? { nx: plan.node.nx, ny: plan.node.ny } : null });
          }
        } catch (e) { errors.push('v4seed-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('winPlanSeedFromFight-wrap: not a function');
  } catch (e) { errors.push('winPlanSeedFromFight-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origDepart = Game.winPlanDepart;
    if (RECORDER_ON && typeof origDepart === 'function') {
      Game.winPlanDepart = function (vid, hx, hy, playerAtHaven) {
        const ret = origDepart.apply(this, arguments);
        try {
          const plan = planOf(vid);
          if (plan && (ret === 'hold' || ret === 'launch')) {
            const ps = partyStats(plan.party || []);
            v4departs.push({ day: gday(Game), vid: vid, source: 'winPlanDepart', result: ret, stage: plan.stage,
              target: plan.target || null, party: (plan.party || []).slice(), partySize: (plan.party || []).length + 1,
              partyKillers: ps.killers, partyArmed: ps.armed,
              targetWave: plan.needWave || null });
          }
        } catch (e) { errors.push('v4depart-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('winPlanDepart-wrap: not a function');
  } catch (e) { errors.push('winPlanDepart-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origBrainDepart = Game.vbrainExecuteDepart;
    if (RECORDER_ON && typeof origBrainDepart === 'function') {
      Game.vbrainExecuteDepart = function (vid, hx, hy, playerAtHaven) {
        let commit = null;
        try { commit = (typeof this.vbrainCommit === 'function') ? this.vbrainCommit(vid) : null; } catch (e) {}
        const ret = origBrainDepart.apply(this, arguments);
        try {
          const plan = planOf(vid);
          if ((ret === 'hold' || ret === 'launch') && commit && commit.winPlanAction) {
            const ps = partyStats(plan ? (plan.party || []) : []);
            v4departs.push({ day: gday(Game), vid: vid, result: ret, source: 'brain',
              winPlanAction: commit.winPlanAction, companion: commit.companion || null,
              companion2: commit.companion2 || null,
              companion3: commit.companion3 || null,
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
              dawnbidDeparts.push({ seq: nextSeq(), day: gday(Game), vid: vid, source: 'brain', result: ret,
                winPlanAction: commit ? (commit.winPlanAction || null) : null,
                commitKind: commitKindOf(commit), commitPart: (commit && commit.part != null ? commit.part : null),
                companion: commit ? (commit.companion || null) : null,
                companion2: commit ? (commit.companion2 || null) : null,
                companion3: commit ? (commit.companion3 || null) : null,
                vidExped: vidExped, companionExped: compExped,
                vidBlock: vidBlock, companionBlock: companionBlock,
                stage: plan ? plan.stage : null, target: plan ? plan.target : null,
                party: (plan && plan.party) ? plan.party.slice() : [] });
            }
          } catch (e) { errors.push('dawnbid-depart-log: ' + String(e.message).slice(0, 80)); }
        } catch (e) { errors.push('v4braindepart-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('vbrainExecuteDepart-wrap: not a function');
  } catch (e) { errors.push('vbrainExecuteDepart-wrap-install: ' + String(e.message).slice(0, 80)); }
  // ---- DEPMAT RECORDER (sim-depmat-a) ----
  // A pure-read wrap of Game.villagerStageBow: per departure, the
  // crafter's lv[bow] AND lv[crude_bow] BEFORE the call vs AFTER
  // it, whether they depart with a win-plan party, whether a
  // party-mate's equipped bow is visible, the pile + own
  // branch/vine/wood at the attempt, depmatSite / siteMats from
  // the staging return, and the staging source after the call. The
  // wrap itself draws no RNG and writes no game state — it only
  // reads. The pile snapshot is read through the game's own
  // stashState() accessor (the craft itself reads it the same
  // way); the snapshot never changes a count.
  const depmatRows = [];
  try {
    const origStageBow = Game.villagerStageBow;
    if (RECORDER_ON && typeof origStageBow === 'function') {
      Game.villagerStageBow = function (vid) {
        let lvBefore = null, lvCrudeBefore = null, hasParty = false, partySize = 0, mateBowVisible = false, mateBowVid = null;
        let pileBefore = null, ownBefore = null;
        let spearHolder = false;
        try {
          const pp = Game.getPerson ? Game.getPerson(vid) : null;
          const S0 = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
          const defs0 = (Game.data && Game.data.items) || [];
          if (pp && S0.equipment && S0.equipment.rangedWeaponOf) {
            const rw0 = S0.equipment.rangedWeaponOf(pp, defs0);
            if (rw0) {
              const rid0 = rw0.itemId || rw0.id || null;
              const d0 = defs0.find(function (d) { return d.id === rid0; }) || null;
              spearHolder = !!(d0 && d0.weapon && !d0.weapon.ammo);
            }
          }
        } catch (e) { errors.push('depmat-spear: ' + String(e.message).slice(0, 80)); }
        try {
          const vv = (Game.state || {}).village || {};
          lvBefore = (((vv.weaponCraft || {})[vid] || {}).bow | 0);
          lvCrudeBefore = (((vv.weaponCraft || {})[vid] || {}).crude_bow | 0);
          // Pile + own materials at the attempt (the deficit profile):
          // pile through the game's own stashState() accessor; own
          // carried branch/vine/wood by the same material read the
          // craft uses (string entries count 1; material/itemId
          // entries count units, excluding weapons/armor).
          try {
            const st0 = (Game.stashState) ? Game.stashState() : null;
            const mats0 = (st0 && st0.materials) || {};
            pileBefore = { branch: (mats0.branch | 0), vine: (mats0.vine | 0), wood: (mats0.wood | 0) };
          } catch (e) { pileBefore = null; }
          try {
            const pp0 = Game.getPerson ? Game.getPerson(vid) : null;
            const defs0b = (Game.data && Game.data.items) || [];
            const defOf0 = function (id) { return defs0b.find(function (d) { return d.id === id; }) || null; };
            const own0 = { branch: 0, vine: 0, wood: 0 };
            for (const e of ((pp0 && pp0.items) || [])) {
              if (typeof e === 'string') { if (e === 'branch' || e === 'vine' || e === 'wood') own0[e] += 1; }
              else if (e && (e.material === 'branch' || e.material === 'vine' || e.material === 'wood')) own0[e.material] += (e.units || 1);
              else if (e && (e.itemId === 'branch' || e.itemId === 'vine' || e.itemId === 'wood')) {
                const dd = defOf0(e.itemId);
                if (!(dd && (dd.weapon || dd.armor))) own0[e.itemId] += (e.units || 1);
              }
            }
            ownBefore = own0;
          } catch (e) { ownBefore = null; }
          const plans = vv.winPlan || {};
          let party = null, holderVid = null;
          if (plans[vid] && Array.isArray(plans[vid].party)) { party = plans[vid].party; holderVid = vid; }
          else {
            for (const hvid of Object.keys(plans)) {
              const pl = plans[hvid] || {};
              if (Array.isArray(pl.party) && pl.party.indexOf(vid) !== -1) { party = pl.party; holderVid = hvid; break; }
            }
          }
          if (party) {
            hasParty = true;
            partySize = party.length + 1;
            const mates = [];
            if (holderVid && holderVid !== vid) mates.push(holderVid);
            for (const mid of party) if (mid !== vid && mates.indexOf(mid) === -1) mates.push(mid);
            const S = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
            const defs = (Game.data && Game.data.items) || [];
            for (const mid of mates) {
              try {
                const mp = Game.getPerson ? Game.getPerson(mid) : null;
                if (!mp || mp.dead) continue;
                if (S.equipment && S.equipment.volleyWeaponOf && S.equipment.volleyWeaponOf(mp, defs)) { mateBowVisible = true; mateBowVid = mid; break; }
              } catch (e) {}
            }
          }
        } catch (e) { errors.push('depmat-pre: ' + String(e.message).slice(0, 80)); }
        const ret = origStageBow.apply(this, arguments);
        try {
          const vv = (Game.state || {}).village || {};
          const lvAfter = (((vv.weaponCraft || {})[vid] || {}).bow | 0);
          const lvCrudeAfter = (((vv.weaponCraft || {})[vid] || {}).crude_bow | 0);
          const rec = (vv.bowOpenByVid || {})[vid] || null;
          depmatRows.push({ day: gday(Game), vid: vid,
            lvBowBefore: lvBefore, lvBowAfter: lvAfter,
            lvCrudeBefore: lvCrudeBefore, lvCrudeAfter: lvCrudeAfter,
            seeded: (lvBefore != null && lvBefore < 1 && lvAfter >= 1),
            spearHolder: spearHolder,
            hasParty: hasParty, partySize: partySize,
            mateBowVisible: mateBowVisible, mateBowVid: mateBowVid,
            pile: pileBefore, own: ownBefore,
            depmatSite: !!(ret && ret.depmatSite),
            siteMats: (ret && Array.isArray(ret.siteMats)) ? ret.siteMats.slice() : null,
            roll35Rate: (ret && ret.roll35Rate != null) ? ret.roll35Rate : null,
            source: rec ? rec.source : null, itemId: rec ? rec.itemId : null,
            staged: !!(ret && ret.staged), craftedOk: !!(ret && ret.craftedOk) });
        } catch (e) { errors.push('depmat-post: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('villagerStageBow-wrap: not a function');
  } catch (e) { errors.push('villagerStageBow-wrap-install: ' + String(e.message).slice(0, 80)); }
  // ---- AMMO RECORDER (sim-fibersupply-a) ----
  // A pure-read wrap of Game.villagerPocketAmmo: per departure, the
  // ammo the carrier leaves with. Reads before the call: the ranged
  // weapon + its ammo id, arrows already carried, own stashed ammo,
  // the pile stick/stone/fiber + pile arrow stock, the ammoCraft
  // level, and servedThisDepart (a bow staged this departure —
  // village.bowOpenByVid[vid] with day === today and source
  // crafted/fromStash/fromArmory; stageBow runs immediately before
  // pocketAmmo in startExpedition, so the read is fresh). After the
  // call: the return (pocketed / crafted / craftedOk / ammoId) and
  // the arrows carried after. The fail reason is derived from the
  // reads + return, never from a second call: no-ranged (no ranged
  // weapon at all), no-ammo-id (ranged weapon takes no ammo — a
  // spear), already-capped (carried >= cap before the call),
  // no-mats (arrow/bolt craft never ran: carried < cap and the pile
  // lacks a recipe material), craft-fail (the craft ran and the
  // roll failed), stock-draw (pocketed from stash/pile, no craft),
  // craft-ok, no-recipe (ammo kind with no pile recipe — never
  // invented), no-pile (stashState unreadable). The wrap draws no
  // RNG and writes no game state — it only reads.
  const ammoRows = [];
  try {
    const origPocket = Game.villagerPocketAmmo;
    if (RECORDER_ON && typeof origPocket === 'function') {
      Game.villagerPocketAmmo = function (vid) {
        const day = gday(Game);
        let rangedId = null, ammoId = null, carriedBefore = 0, stashedBefore = 0;
        let pileBefore = null, pileArrowsBefore = 0, ammoLvBefore = null, servedThisDepart = false;
        let servedSource = null, servedItemId = null;
        try {
          const pp = Game.getPerson ? Game.getPerson(vid) : null;
          const S0 = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
          const defs0 = (Game.data && Game.data.items) || [];
          if (pp && S0.equipment && S0.equipment.rangedWeaponOf) {
            const rw0 = S0.equipment.rangedWeaponOf(pp, defs0);
            if (rw0) {
              rangedId = rw0.itemId || rw0.id || null;
              const rd = defs0.find(function (d) { return d.id === rangedId; }) || null;
              ammoId = (rd && rd.weapon && rd.weapon.ammo) || null;
            }
          }
          if (pp && ammoId) {
            for (const e of (pp.items || [])) {
              const eid = (typeof e === 'string') ? e : (e && (e.itemId || e.id || e.material));
              if (eid === ammoId) carriedBefore += (typeof e === 'string') ? 1 : (e.units || 1);
            }
            for (const e of (pp.stashed || [])) {
              const eid = (typeof e === 'string') ? e : (e && (e.itemId || e.id || e.material));
              if (eid === ammoId) stashedBefore += (typeof e === 'string') ? 1 : (e.units || 1);
            }
          }
          try {
            const st0 = (Game.stashState) ? Game.stashState() : null;
            const mats0 = (st0 && st0.materials) || {};
            pileBefore = { stick: (mats0.stick | 0), stone: (mats0.stone | 0), fiber: (mats0.fiber | 0) };
            for (const w of ((st0 && st0.weapons) || [])) {
              const wid = w && (w.itemId || w.id);
              if (wid === 'arrow') pileArrowsBefore += (w.units != null ? w.units : 1);
            }
            if (mats0.arrow) pileArrowsBefore += (mats0.arrow | 0);
          } catch (e) { pileBefore = null; }
          try {
            const vv = (Game.state || {}).village || {};
            ammoLvBefore = ammoId ? ((((vv.ammoCraft || {})[vid] || {})[ammoId]) || 1) : null;
            const rec = (vv.bowOpenByVid || {})[vid] || null;
            if (rec && rec.day === day && (rec.source === 'crafted' || rec.source === 'fromStash' || rec.source === 'fromArmory')) {
              servedThisDepart = true; servedSource = rec.source; servedItemId = rec.itemId || null;
            }
          } catch (e) {}
        } catch (e) { errors.push('ammo-pre: ' + String(e.message).slice(0, 80)); }
        const ret = origPocket.apply(this, arguments);
        try {
          let carriedAfter = 0;
          // FIBER: pile after the call, so the arrow-craft sink is
          // measured per departure (pileBefore - pileAfter).
          let pileAfter = null, pileArrowsAfter = 0;
          try {
            const stA = (Game.stashState) ? Game.stashState() : null;
            const matsA = (stA && stA.materials) || {};
            pileAfter = { stick: (matsA.stick | 0), stone: (matsA.stone | 0), fiber: (matsA.fiber | 0) };
            for (const w of ((stA && stA.weapons) || [])) {
              const wid = w && (w.itemId || w.id);
              if (wid === 'arrow') pileArrowsAfter += (w.units != null ? w.units : 1);
            }
            if (matsA.arrow) pileArrowsAfter += (matsA.arrow | 0);
          } catch (e) { pileAfter = null; }
          try {
            const pp2 = Game.getPerson ? Game.getPerson(vid) : null;
            const aid = (ret && ret.ammoId) || ammoId;
            if (pp2 && aid) {
              for (const e of (pp2.items || [])) {
                const eid = (typeof e === 'string') ? e : (e && (e.itemId || e.id || e.material));
                if (eid === aid) carriedAfter += (typeof e === 'string') ? 1 : (e.units || 1);
              }
            }
          } catch (e) {}
          // Fail-reason derivation (reads + return only).
          let failReason = null;
          const cap = ((ret && ret.ammoId) || ammoId) === 'stone' ? 6 : 5;
          if (!rangedId) failReason = 'no-ranged';
          else if (!ammoId) failReason = 'no-ammo-id';
          else if (carriedBefore >= cap) failReason = 'already-capped';
          else if (ret && ret.crafted === 1 && ret.craftedOk) failReason = 'craft-ok';
          else if (ret && ret.crafted === 1 && !ret.craftedOk) failReason = 'craft-fail';
          else if (ret && (ret.pocketed | 0) > 0) failReason = 'stock-draw';
          else if (pileBefore == null) failReason = 'no-pile';
          else if (ammoId === 'arrow' || ammoId === 'bolt') failReason = 'no-mats';
          else failReason = 'no-recipe';
          ammoRows.push({ day: day, vid: vid,
            rangedId: rangedId, ammoId: (ret && ret.ammoId) || ammoId,
            servedThisDepart: servedThisDepart, servedSource: servedSource, servedItemId: servedItemId,
            carriedBefore: carriedBefore, carriedAfter: carriedAfter,
            stashedBefore: stashedBefore,
            pile: pileBefore, pileArrowsBefore: pileArrowsBefore,
            pileAfter: pileAfter, pileArrowsAfter: pileArrowsAfter,
            ammoLvBefore: ammoLvBefore,
            pocketed: (ret && ret.pocketed) | 0,
            crafted: (ret && ret.crafted) | 0,
            craftedOk: !!(ret && ret.craftedOk),
            ammoServed: !!(ret && ret.ammoServed),
            siteMats: (ret && Array.isArray(ret.siteMats)) ? ret.siteMats.slice() : null,
            ammoRate: (ret && ret.ammoRate != null) ? ret.ammoRate : null,
            failReason: failReason });
        } catch (e) { errors.push('ammo-post: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('villagerPocketAmmo-wrap: not a function');
  } catch (e) { errors.push('villagerPocketAmmo-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origFF = Game.fieldFight;
    if (RECORDER_ON && typeof origFF === 'function') {
      Game.fieldFight = function (vid, mdef, m, opts) {
        const w = waveOf(mdef);
        const watch = (SEEDLAND ? w >= 4 : w === 4) && mdef && mdef.id;
        let row = null;
        // Pre-call live-instance read ONLY (a fallback for records
        // without the post-call fields). On the expedition path the
        // monster DEF's hp is a RANGE, never a spawned number — the
        // spawned HP is recovered AFTER the call (recoverMHpStart).
        let preHp = null;
        try {
          var hpOf = function (o) { if (!o) return null; var v = (o.maxHp != null ? o.maxHp : o.hp); return (typeof v === 'number' && isFinite(v) && v > 0) ? v : null; };
          preHp = hpOf(m) || hpOf(mdef);
        } catch (e) {}
        // BOWOPEN: ranged kit at fight entry (pre-call read — the
        // volley spends ammo, so the post-call pack no longer shows
        // what the fighter opened with). Pure reads, no RNG, no writes.
        let rangedId = null, ammoAtEntry = 0;
        try {
          const vp = (this.getPerson ? this.getPerson(vid) : null);
          const S = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
          if (vp && S.equipment && S.equipment.rangedWeaponOf) {
            const rw = S.equipment.rangedWeaponOf(vp, this.data.items);
            if (rw) {
              rangedId = rw.itemId || rw.id || null;
              const rdef = (this.data.items || []).find(function (d) { return d.id === rangedId; });
              const ammoId = (rdef && rdef.weapon && rdef.weapon.ammo) || null;
              if (ammoId) {
                for (let ai = 0; ai < (vp.items || []).length; ai++) {
                  const ent = vp.items[ai];
                  const eid = (typeof ent === 'string') ? ent : (ent && (ent.itemId || ent.id || ent.material));
                  if (eid === ammoId) ammoAtEntry += (typeof ent === 'string') ? 1 : (ent.units || 1);
                }
              }
            }
          }
        } catch (e) {}
        if (watch) {
          const lg = lastGateByVid[vid] || null;
          row = { day: gday(Game), vid: vid, mid: mdef.id, wave: w,
            mHpStart: null, // recovered post-call from the fight record
            vKill: false,
            mHpStartRec: null, // diagnostic: CONTACTREC's rec.mHpStart
            alliesN: (opts && opts.allies) | 0,
            allyVids: ((opts && opts.allyVids) || []).slice(0, 2),
            allyFromStart: !!(opts && opts.allyFromStart),
            gate: lg ? { result: lg.result, reason: lg.reason,
              partySize: lg.partySize, sensedSize: lg.sensedSize, countedSize: lg.countedSize,
              allArmed: lg.allArmed, allArmored: lg.allArmored, trickKnown: lg.trickKnown,
              planStage: lg.planStage, planTarget: lg.planTarget } : null,
            outcome: null, rounds: null, vTaken: null, mDealt: null,
            calledHelp: null, allyVid: null, fleeHpFrac: null,
            fleeWise: null, fleeLearn: null,
            // BOWOPEN: ranged kit at entry + the opening volley itself
            // (rec.volley: shots/hits/dmg, null when no ranged kit).
            rangedId: rangedId, ammoAtEntry: ammoAtEntry, volley: null,
            trickBefore: trickKnownOf(mdef.id), trickAfter: null, lines: [], log: [] };
          // LAUNCHPARTY: SEEDLAND hard-on — every encounter row
          // carries `origin` (expedition / world-tick / patrol /
          // aid / other:<fn> / unclassified), read from the call
          // stack at the wrap.
          if (SEEDLAND) row.origin = fightOrigin();
        }
        let rec = null;
        try { rec = origFF.apply(this, arguments); }
        finally { if (watch) { /* row closed below */ } }
        try {
          if (watch && row && rec) {
            // RECORDER REPAIR (finding #2488): spawned HP recovered
            // AFTER the call from the fight record — the agency path
            // passes a DEF (hp range), so no pre-call number exists.
            var recov = recoverMHpStart(rec, preHp);
            row.mHpStart = recov.mHpStart;
            row.vKill = !!recov.vKill;
            try { row.mHpStartRec = (typeof rec.mHpStart === 'number' && isFinite(rec.mHpStart)) ? rec.mHpStart : null; } catch (e) {}
            row.outcome = rec.outcome || null;
            row.rounds = rec.rounds | 0;
            row.vTaken = rec.vTaken | 0;
            row.mDealt = rec.mDealt | 0;
            // BOWOPEN: the opening volley, straight from the fight
            // record (the field engine's own numbers — never snapshots).
            try { row.volley = (rec.volley && typeof rec.volley.shots === 'number') ? { shots: rec.volley.shots | 0, hits: rec.volley.hits | 0, dmg: rec.volley.dmg | 0, ammoLeft: (rec.volley.ammoLeft != null ? rec.volley.ammoLeft | 0 : null) } : null; } catch (e) { row.volley = null; }
            row.calledHelp = !!rec.calledHelp;
            row.allyVid = rec.allyVid || null;
            row.ally2Vid = rec.ally2Vid || null; // SENSE: the fight's second joiner (old driver: allyVid only)
            row.fleeHpFrac = (rec.fleeHpFrac != null ? +rec.fleeHpFrac.toFixed(2) : null);
            row.fleeWise = !!rec.fleeWise;
            row.fleeLearn = !!rec.fleeLearn;
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
              companion2: c.companion2 || null,
              companion3: c.companion3 || null,
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
                companion: commit.companion || null,
                companion2: commit.companion2 || null,
                companion3: commit.companion3 || null } : null,
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
                  errors.push('launchparty-replica-null: day ' + gday(Game) + ' vid ' + vid);
                }
              }
            } catch (e) { errors.push('launchparty-log: ' + String(e.message).slice(0, 80)); }
          }
        } catch (e) { errors.push('dawnbid-score-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (!RECORDER_ON) { /* wraps off — determinism leg D2 */ }
    else errors.push('vbrainScorePick-wrap: not a function');
  } catch (e) { errors.push('vbrainScorePick-wrap-install: ' + String(e.message).slice(0, 80)); }
  // LAUNCHPARTY: install the agencyTick skip-reason recorder (shared
  // game). Skipped whole when the recorder is off (D2). Mode 'on':
  // the PROFILEGATE bypass is landed in this base.
  let skipRec = null;
  if (RECORDER_ON) { try { skipRec = installSkipRecorder(Game, 'on', errors, launchdefSkips); } catch (e) { errors.push('launchparty-skip-install: ' + String(e.message).slice(0, 80)); } }
  // FIBER: install the ledger wraps (pure reads; the originals run
  // exactly once). Installed after the skip recorder so the say-wrap
  // chains onto the vetSays wrap above.
  let fiberRec = null;
  if (RECORDER_ON) { try { fiberRec = installFiberWraps(Game, fiberCtx, errors); } catch (e) { errors.push('fiber-install: ' + String(e.message).slice(0, 80)); } }

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
            // day over day). Pure reads.
            if (RECORDER_ON) {
              try {
                const wp = ((Game.state || {}).village || {}).winPlan || {};
                for (const pvid of Object.keys(wp)) {
                  const pl = wp[pvid];
                  if (!planIsWave4(Game, pl)) continue;
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
                  dawnbidCensus.push({ day: d, vid: pvid, target: pl.target || null,
                    needWave: (pl.needWave != null ? pl.needWave : null),
                    stage: pl.stage || null, party: (pl.party || []).slice(),
                    holderAlive: alive, holderNode: node, holderExped: exped,
                    holderSick: sick, holderHealth: health,
                    holderGear: { armed: g.armed, armored: g.armored } });
                }
              } catch (e) { errors.push('dawnbid-census: ' + String(e.message).slice(0, 80)); }
            }
            // LAUNCHSURVIVE tracker: one row per live wave-4 plan
            // holder per day — holder/companion nodes, last-known
            // tile, target persistence. Same population + cadence
            // as the census (end of day). Pure reads.
            if (RECORDER_ON && LAUNCHSURVIVE) {
              try {
                const wp = ((Game.state || {}).village || {}).winPlan || {};
                const vil = (Game.state || {}).village || {};
                const hx = (vil.px != null ? vil.px : 4), hy = (vil.py != null ? vil.py : 4);
                const sightings = vil.monsterSightings || {};
                for (const pvid of Object.keys(wp)) {
                  const pl = wp[pvid];
                  if (!planIsWave4(Game, pl)) continue;
                  let alive = true;
                  try { const p = Game.getPerson ? Game.getPerson(pvid) : null; if (p && p.dead) alive = false; } catch (e) {}
                  let node = null;
                  try { const n = Game.npcNode ? Game.npcNode(pvid) : null; if (n) node = { nx: n.nx, ny: n.ny }; } catch (e) {}
                  let exped = false;
                  try { const a = Game.agencyState ? Game.agencyState() : null; exped = !!(a && a.exped && a.exped[pvid]); } catch (e) {}
                  let sick = false, health = 100;
                  try { sick = !!((vil.sick || {})[pvid]); } catch (e) {}
                  try { const h = (vil.health || {})[pvid]; if (h !== undefined) health = h; } catch (e) {}
                  const partyNodes = {};
                  try {
                    for (const pid of (pl.party || [])) {
                      let pn = null;
                      try { const n = Game.npcNode ? Game.npcNode(pid) : null; if (n) pn = { nx: n.nx, ny: n.ny }; } catch (e) {}
                      partyNodes[pid] = pn;
                    }
                  } catch (e) { errors.push('launch-track-partynodes: ' + String(e.message).slice(0, 80)); }
                  let planNode = null;
                  try { if (pl.node) planNode = { nx: pl.node.nx, ny: pl.node.ny }; } catch (e) {}
                  let sightingTile = null;
                  try {
                    const list = sightings[pvid] || [];
                    for (let i = list.length - 1; i >= 0; i--) {
                      const s = list[i];
                      if (s && s.mid === pl.target) { sightingTile = { tx: s.tx, ty: s.ty, day: s.day }; break; }
                    }
                  } catch (e) {}
                  let lastKnownTile = null, lastKnownSource = null;
                  if (sightingTile) { lastKnownTile = { nx: sightingTile.tx, ny: sightingTile.ty }; lastKnownSource = 'sighting'; }
                  else if (planNode) { lastKnownTile = planNode; lastKnownSource = 'planNode'; }
                  const tp = targetPersistence(Game, pl.target, lastKnownTile);
                  v4launchTrack.push({ day: d, vid: pvid, target: pl.target || null,
                    needWave: (pl.needWave != null ? pl.needWave : null),
                    stage: pl.stage || null, party: (pl.party || []).slice(),
                    holderAlive: alive, holderNode: node, holderExped: exped,
                    holderSick: sick, holderHealth: health,
                    haven: { nx: hx, ny: hy },
                    partyNodes: partyNodes, planNode: planNode,
                    sightingTile: sightingTile,
                    lastKnownTile: lastKnownTile, lastKnownSource: lastKnownSource,
                    targetNearDist: tp.nearDist, targetNearCount: tp.nearCount,
                    targetAliveCount: tp.aliveCount });
                }
              } catch (e) { errors.push('launch-track: ' + String(e.message).slice(0, 80)); }
            }
            // FIBER census: one row per village-day (end of day) —
            // the pile, the two personal fiber economies, the
            // deadfall counters, the deadfall staffing level, the
            // trust level (the contribute/skim switch). Pure reads.
            if (RECORDER_ON) {
              try {
                const vil = (Game.state || {}).village || {};
                const pf = personalFiber(Game);
                let trustLevel = null;
                try { trustLevel = Game.villageTrustLevel ? Game.villageTrustLevel() : null; } catch (e) {}
                let deadfallStaffed = 0;
                try {
                  const asg = vil.assignments || {};
                  for (const k of Object.keys(asg)) if (asg[k] && asg[k].task === 'deadfall') deadfallStaffed++;
                } catch (e) {}
                fiberCensus.push({ day: d,
                  pile: pileMats(Game), pileArrows: pileArrows(Game),
                  scholarFiber: pf.scholar, villagersFiber: pf.villagers,
                  villagerFiberHolders: pf.villagerHolders,
                  deadfallHauls: Game._deadfallHauls || 0,
                  deadfallFiber: Game._deadfallFiber || 0,
                  deadfallSticks: Game._deadfallSticks || 0,
                  deadfallStaffed: deadfallStaffed,
                  trustLevel: trustLevel,
                  rosterN: (vil.roster || []).length });
              } catch (e) { errors.push('fiber-census: ' + String(e.message).slice(0, 80)); }
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
  try { if (fiberRec) fiberRec.uninstall(); } catch (e) { errors.push('uninstall-fiber: ' + String(e.message).slice(0, 80)); }

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
    seed: seed, arm: 'fibersupply-a', run: RUN, mode: MODE, leg: MODE,
    anchorCommit: ANCHOR, standingMarker: STANDING_MARKER,
    brainSha: BRAIN_SHA, carryPresent: CARRY_PRESENT,
    wiringSha: WIRING_SHA, sensePresent: SENSE_PRESENT,
    gameSha: GAME_SHA, bowopenPresent: BOWOPEN_PRESENT,
    speargatePresent: SPEARGATE_PRESENT, speargateOn: SPEARGATE_ON,
    depmatPresent: DEPMAT_PRESENT, depmatOn: DEPMAT_ON,
    roll35Present: ROLL35_PRESENT, roll35On: ROLL35_ON,
    ammoPresent: AMMO_PRESENT, ammoOn: AMMO_ON,
    bowknowOn: BOWKNOW_ON,
    senseexpedOn: SENSEEXPED_ON, fightally2On: FIGHTALLY2_ON,
    bowopenOn: BOWOPEN_ON,
    recorderOn: RECORDER_ON,
    policySha: POLICY_SHA, policy: 'competent',
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    ready4: ready4, ready5: ready5, ladderVets4: ladderVets4,
    winPlanStats: winPlanStats,
    // BOWOPEN: launch gear-up staging counters (village.bowOpen) +
    // how many distinct villagers were staged — the mechanism
    // section's denominators, read from live state at run end.
    bowOpen: (st.village && st.village.bowOpen) ? JSON.parse(JSON.stringify(st.village.bowOpen)) : null,
    bowOpenStagedVids: (st.village && st.village.bowOpenByVid) ? Object.keys(st.village.bowOpenByVid).length : 0,
    // SPEARGATE: the per-vid staging map (bowopen §12 gap) — {vid: {day, source, itemId}}
    // so alreadyHad-with-a-spear can be cross-checked by item id.
    bowOpenByVid: (st.village && st.village.bowOpenByVid) ? JSON.parse(JSON.stringify(st.village.bowOpenByVid)) : null,
    vetSays: vetSays, sayCount: sayCount,
    instrumentErrors: (vf ? vf.t.instrumentErrors : []).concat(errors),
    deaths: deaths,
    samples: result.samples || null,
    v4seeds: v4seeds, v4departs: v4departs, v4gates: v4gates, v4encounters: v4encounters,
    depmatRows: depmatRows,
    ammoRows: ammoRows,
    fiberCensus: fiberCensus, fiberEvents: fiberEvents,
    fiberCrafts: fiberCrafts, fiberSays: fiberSays,
    fiberStashLog: fiberStashLog, fiberCraftDayCalls: fiberCtx.craftDayCalls,
    dawnbidScores: dawnbidScores, dawnbidDeparts: dawnbidDeparts, dawnbidCensus: dawnbidCensus,
    dawnbidStarts: dawnbidStarts, launchdefSkips: launchdefSkips,
    companionPool: companionPool,
    wave4Ids: loadWave4Ids(),
  };
  // LAUNCHSURVIVE=1 only: the launch tracker array + flag. Flag
  // unset = no `v4launchTrack` key at all (the seedland no-origin-
  // key pattern), so flag-unset corpora stay byte-identical to
  // seedpaths/seedland output.
  if (LAUNCHSURVIVE) { out.v4launchTrack = v4launchTrack; out.launchTrackOn = true; }
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
  if (MODE !== 'ctl' && MODE !== 'rep') { console.error('FIBERSUPPLY STOP: MODE must be ctl|rep, got ' + JSON.stringify(MODE)); process.exit(2); }
  // The legs differ in NOTHING but the MODE label: ctl = the judged
  // leg, rep = an identical-code re-run (the §15 compare is a
  // determinism/reproducibility compare, not a before/after judgment
  // — a diag changes no game code). BOTH legs run BOWOPEN=1 (the
  // staging mechanism) + SENSEEXPED=1 (the sense fix) + SPEARGATE=1
  // (the landed gate) — the substrate on master. DEPMAT / ROLL35 /
  // AMMO are NOT on master (reverted by the ammo arm) and must be
  // UNSET on both legs; their presence flags are recorded on the
  // corpus and expected FALSE.
  // Same code on disk both legs — no revert between legs. A leg/flag
  // mismatch is a loud stop, never a silent mislabel.
  if (!SENSE_PRESENT) { console.error('FIBERSUPPLY STOP: the SENSEEXPED launch-preference sense must be present in src/js/party-wiring.js (substrate).'); process.exit(2); }
  if (!SENSEEXPED_ON) { console.error('FIBERSUPPLY STOP: SENSEEXPED=1 required on BOTH legs (substrate).'); process.exit(2); }
  if (!BOWOPEN_PRESENT) { console.error('FIBERSUPPLY STOP: the bow-staging mechanism (villagerStageBow) must be present in src/js/game.js (substrate).'); process.exit(2); }
  if (!BOWOPEN_ON) { console.error('FIBERSUPPLY STOP: BOWOPEN=1 required on BOTH legs (substrate — the staging mechanism).'); process.exit(2); }
  if (!SPEARGATE_PRESENT) { console.error('FIBERSUPPLY STOP: the spear-gate fix (SPEARGATE + volleyWeaponOf in villagerStageBow) must be present in src/js/game.js.'); process.exit(2); }
  if (!SPEARGATE_ON) { console.error('FIBERSUPPLY STOP: SPEARGATE=1 required on BOTH legs (substrate — the landed gate).'); process.exit(2); }
  if (DEPMAT_PRESENT) { console.error('FIBERSUPPLY STOP: the trailhead-bundle rule (DEPMAT) must NOT be present in src/js/game.js on this base (reverted by sim-ammo-a).'); process.exit(2); }
  if (ROLL35_PRESENT) { console.error('FIBERSUPPLY STOP: the learned first-make rate (ROLL35) must NOT be present in src/js/game.js on this base (reverted by sim-ammo-a).'); process.exit(2); }
  if (AMMO_PRESENT) { console.error('FIBERSUPPLY STOP: the served-bow quiver rule (AMMO) must NOT be present in src/js/game.js on this base (reverted by sim-ammo-a).'); process.exit(2); }
  if (DEPMAT_ON) { console.error('FIBERSUPPLY STOP: DEPMAT must be unset on BOTH legs (not on master).'); process.exit(2); }
  if (ROLL35_ON) { console.error('FIBERSUPPLY STOP: ROLL35 must be unset on BOTH legs (not on master).'); process.exit(2); }
  if (AMMO_ON) { console.error('FIBERSUPPLY STOP: AMMO must be unset on BOTH legs (not on master).'); process.exit(2); }
  if (process.env.EVADEOBS === '1') { console.error('FIBERSUPPLY STOP: EVADEOBS must be unset on BOTH legs (prereg substrate — the evade fix is proven, not re-tested).'); process.exit(2); }
  if (BOWKNOW_ON) { console.error('FIBERSUPPLY STOP: BOWKNOW must be unset on BOTH legs (prereg substrate — mentoring must not leak into this measurement).'); process.exit(2); }
  if (process.env.DEPARTSEE === '1') { console.error('FIBERSUPPLY STOP: DEPARTSEE must be unset on BOTH legs (prereg substrate — departure-site seeing is proven non-binding and must not leak into this measurement).'); process.exit(2); }
  if (process.env.VETREENGAGE !== '1') { console.error('FIBERSUPPLY STOP: VETREENGAGE=1 required (substrate) for every mode.'); process.exit(2); }
  if (process.env.PARTYSIZE4 !== '1') { console.error('FIBERSUPPLY STOP: PARTYSIZE4=1 required (substrate) for every mode.'); process.exit(2); }
  if (process.env.FLEEREPAIR2 !== '1') { console.error('FIBERSUPPLY STOP: FLEEREPAIR2=1 required (substrate) for every mode.'); process.exit(2); }
  if (process.env.FIGHTALLY2 !== '1') { console.error('FIBERSUPPLY STOP: FIGHTALLY2=1 required (substrate, both legs — the second seat must be able to join the fight).'); process.exit(2); }
  if (!SEEDS.length) { console.error('FIBERSUPPLY STOP: SEEDS required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', process.env.EVIDENCE_DATE || '2026-11-27', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'fibersupply-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('FIBERSUPPLY STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  let lostSeeds = [];
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'fibersupply-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
    const saved = writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    if (!saved) {
      lostSeeds.push(seed);
      console.error('FIBERSUPPLY STOP: could not write ' + path.relative(REPO, file) + ' after 10 min of retries (write flap?) — seed ' + seed + ' NOT saved; re-run this seed after the flap clears.');
    }
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, anchor: (out.anchorCommit || '').slice(0, 12),
      brainSha: out.brainSha, carryPresent: out.carryPresent,
      wiringSha: out.wiringSha, sensePresent: out.sensePresent,
      gameSha: out.gameSha, bowopenPresent: out.bowopenPresent,
      speargatePresent: out.speargatePresent, speargateOn: out.speargateOn,
      depmatPresent: out.depmatPresent, depmatOn: out.depmatOn,
      roll35Present: out.roll35Present, roll35On: out.roll35On,
      ammoPresent: out.ammoPresent, ammoOn: out.ammoOn,
      bowknowOn: out.bowknowOn,
      senseexpedOn: out.senseexpedOn, fightally2On: out.fightally2On,
      bowopenOn: out.bowopenOn,
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
      depmatRows: out.depmatRows ? out.depmatRows.length : null,
      ammoRows: out.ammoRows ? out.ammoRows.length : null,
      fiberCensus: out.fiberCensus ? out.fiberCensus.length : null,
      fiberEvents: out.fiberEvents ? out.fiberEvents.length : null,
      fiberCrafts: out.fiberCrafts ? out.fiberCrafts.length : null,
      fiberSays: out.fiberSays ? out.fiberSays.length : null,
      fiberStashLog: out.fiberStashLog ? out.fiberStashLog.length : null,
      dawnbidScores: out.dawnbidScores.length, dawnbidDeparts: out.dawnbidDeparts.length,
      dawnbidCensus: out.dawnbidCensus.length, dawnbidStarts: out.dawnbidStarts.length,
      launchdefSkips: out.launchdefSkips.length,
      companionPool: out.companionPool.length,
      launchTrack: out.v4launchTrack ? out.v4launchTrack.length : 0,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
  if (lostSeeds.length) {
    console.error('FIBERSUPPLY STOP: ' + lostSeeds.length + ' seed(s) NOT saved (' + lostSeeds.join(',') + ') — re-run them after the flap clears. Exit 4.');
    process.exitCode = 4;
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun, loadWave4Ids: loadWave4Ids, planIsWave4: planIsWave4, deriveLaunchBlock: deriveLaunchBlock, poolReplica: poolReplica, classifySeedPath: classifySeedPath, firstCallerFrame: firstCallerFrame, fightOrigin: fightOrigin, targetPersistence: targetPersistence, SEED_PATHS: SEED_PATHS, SEEDLAND: SEEDLAND, LAUNCHSURVIVE: LAUNCHSURVIVE, installSkipRecorder: installSkipRecorder, commitKindOf: commitKindOf, recoverMHpStart: recoverMHpStart, pileMats: pileMats, pileArrows: pileArrows, personalFiber: personalFiber, fiberDelta: fiberDelta, installFiberWraps: installFiberWraps, FIBER_RE: FIBER_RE };
