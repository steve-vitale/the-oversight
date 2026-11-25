// homecraft-gate-driver-a.js — DIAG driver, arm sim-homecraft-gate-a
// (WHY DO THE 131 NEVER RECEIVE A BATCH? aidammo proved home-duty craft
// supplies 0.849 of ammo at wave-4+ entry, but 131 of 149 empty-quivered
// fighters never received a single batch in their whole life. This arm
// snapshots the home-duty craft gate daily — pile materials + at-home
// carriers — to separate "carriers rarely home" from "pile never holds
// materials". Single leg, no ctl/arm: this is a ledger, not a lever.)
// A clone of scripts/aidammo-driver-a.js (the ammo-provenance ledger +
// launch-funnel census instrument) PLUS the craft-gate snapshot (§1b of
// the prereg): driver-side wraps on villagerAmmoCraftDay /
// villagerPocketAmmo / villagerKillLoot / fieldFight + a daily snapshot
// reconcile. All wraps call the original exactly once and draw no RNG —
// pure reads + snapshot diffs. Production sources: starting-kit /
// home-duty / departure-craft / departure-pile-stones / loot / other
// (daily-diff catch-all). Transfers (stash<->carried) move FIFO provenance
// batches preserving the production source, so a home-duty batch stashed
// then pocketed still counts as home-duty at the meeting. aidFight grants
// no ammo: aid is an ENCOUNTER ORIGIN, not a production source.
//   Single leg: VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
//   SENSEEXPED=1 SPEARGATE=1 BOWOPEN=1 MODE=diag RUN=homecraft-gate-a.
//   The driver asserts all seven flags and stops otherwise.
// Policy: competent verbatim (scripts/policies/competent.js), 150d
// death-aware. Pilot band 110701-110708 (fresh — see prereg).
// Usage:
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 SPEARGATE=1 BOWOPEN=1 MODE=diag OUTDIR=perseed-homecraft-gate-a SEEDS=110701,110702 RUN=homecraft-gate-a node scripts/homecraft-gate-driver-a.js
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
const RUN = process.env.RUN || 'homecraft-gate-a';
const MODE = process.env.MODE || 'diag';
const OUTDIR = process.env.OUTDIR || ('perseed-homecraft-gate-a');
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
// BOWOPEN: sha of the file that carries the bow-staging mechanism +
// whether it is in it, so each corpus file self-describes the code it
// ran under. The flag itself is recorded per file below.
let GAME_SHA = 'unknown';
let BOWOPEN_PRESENT = false;
let SPEARGATE_PRESENT = false;
try {
  const gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  GAME_SHA = crypto.createHash('sha256').update(gameSrc).digest('hex').slice(0, 12);
  BOWOPEN_PRESENT = /BOWOPEN/.test(gameSrc) && /villagerStageBow/.test(gameSrc);
  SPEARGATE_PRESENT = /SPEARGATE/.test(gameSrc) && /villagerStageBow/.test(gameSrc) && /volleyWeaponOf/.test(gameSrc);
} catch (e) {}
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
// The host write flap (2026-11-19, this arm): file writes fail EPERM in
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
      if (line.indexOf('speargate-driver-a.js') !== -1) continue;
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
      if (file.indexOf('speargate-driver-a.js') !== -1) continue;
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


// ---- AIDAMMO LEDGER (sim-aidammo-a, prereg §1b) ----
// Driver-side ammo provenance. Per villager (roster + scholar), per ammo
// id, a FIFO provenance queue per location (carried / stashed):
// [{source, day, units}]. Production sources: 'starting-kit',
// 'home-duty', 'departure-craft', 'departure-pile-stones', 'loot',
// 'other' (daily-diff catch-all — any production the wraps do not name).
// Transfers move FIFO batches between locations preserving source.
// Spends consume FIFO from carried. All helpers are pure reads except
// the ledger object itself; no RNG is drawn anywhere here.
const AMMO_IDS = ['arrow', 'bolt', 'stone', 'fusion_cell'];
function ammoCountIn(list, ammoId) {
  let n = 0;
  try {
    for (const e of (list || [])) {
      const eid = (typeof e === 'string') ? e : (e && (e.itemId || e.id || e.material));
      if (eid === ammoId) n += (typeof e === 'string') ? 1 : (e.units || 1);
    }
  } catch (e) {}
  return n;
}
function ammoSnapVid(Game, vid) {
  try {
    const p = (Game.getPerson ? Game.getPerson(vid) : null);
    if (!p) return null;
    const o = {};
    for (const id of AMMO_IDS) o[id] = { carried: ammoCountIn(p.items || [], id), stashed: ammoCountIn(p.stashed || [], id) };
    return o;
  } catch (e) { return null; }
}
function ammoSnapAll(Game) {
  const out = {};
  try {
    const v = (Game.state || {}).village || {};
    const vids = ((v.roster || []).slice());
    if (Game.villagerId && vids.indexOf(Game.villagerId) === -1) vids.push(Game.villagerId);
    for (const vid of vids) { const sn = ammoSnapVid(Game, vid); if (sn) out[vid] = sn; }
  } catch (e) {}
  return out;
}
// ammoRangedKit(Game, vid): the bowopen lead read, factored for lead +
// allies — {rangedId, ammoId, ammoAtEntry}. Pure reads.
function ammoRangedKit(Game, vid) {
  try {
    const vp = (Game.getPerson ? Game.getPerson(vid) : null);
    const S = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
    if (!vp || !S.equipment || !S.equipment.rangedWeaponOf) return { rangedId: null, ammoId: null, ammoAtEntry: 0 };
    const rw = S.equipment.rangedWeaponOf(vp, Game.data.items);
    if (!rw) return { rangedId: null, ammoId: null, ammoAtEntry: 0 };
    const rangedId = rw.itemId || rw.id || null;
    const rdef = (Game.data.items || []).find(function (d) { return d.id === rangedId; });
    const ammoId = (rdef && rdef.weapon && rdef.weapon.ammo) || null;
    let ammoAtEntry = 0;
    if (ammoId) {
      for (let ai = 0; ai < (vp.items || []).length; ai++) {
        const ent = vp.items[ai];
        const eid = (typeof ent === 'string') ? ent : (ent && (ent.itemId || ent.id || ent.material));
        if (eid === ammoId) ammoAtEntry += (typeof ent === 'string') ? 1 : (ent.units || 1);
      }
    }
    return { rangedId: rangedId, ammoId: ammoId, ammoAtEntry: ammoAtEntry };
  } catch (e) { return { rangedId: null, ammoId: null, ammoAtEntry: 0 }; }
}
function createAmmoLedger() {
  return { events: [], other: [], unattributedSpend: [], transfers: [], spends: [],
    counters: { homeDutyBatches: 0, homeDutyCalls: 0, departureCalls: 0,
      departureCraftAttempts: 0, departureCraftOk: 0, departureStones: 0,
      departureStashMoved: 0, lootDrops: 0, lootAmmoDrops: 0 },
    prov: {}, lastSnap: {}, seq: 0 };
}
function provQueue(ledger, vid, ammoId, loc) {
  if (!ledger.prov[vid]) ledger.prov[vid] = {};
  if (!ledger.prov[vid][ammoId]) ledger.prov[vid][ammoId] = { carried: [], stashed: [] };
  return ledger.prov[vid][ammoId][loc];
}
function provShares(ledger, vid, ammoId, loc) {
  const q = provQueue(ledger, vid, ammoId, loc);
  const bySrc = {};
  for (const b of q) bySrc[b.source] = (bySrc[b.source] || 0) + b.units;
  return Object.keys(bySrc).sort().map(function (k) { return { source: k, units: bySrc[k] }; });
}
function provPush(ledger, vid, ammoId, loc, source, day, units) {
  if (!(units > 0)) return;
  provQueue(ledger, vid, ammoId, loc).push({ source: source, day: day, units: units });
  ledger.events.push({ seq: ++ledger.seq, day: day, kind: 'production', vid: vid, ammoId: ammoId, units: units, source: source, loc: loc });
}
function provTake(ledger, vid, ammoId, loc, units, day) {
  // Consume FIFO; returns [{source, units}]. Shortfall (spending more
  // than the ledger tracks) is recorded, never silently zeroed.
  const q = provQueue(ledger, vid, ammoId, loc);
  const shares = [];
  let left = units;
  while (left > 0 && q.length) {
    const b = q[0];
    const take = Math.min(b.units, left);
    b.units -= take; left -= take;
    shares.push({ source: b.source, units: take });
    if (b.units <= 0) q.shift();
  }
  if (left > 0) ledger.unattributedSpend.push({ seq: ++ledger.seq, day: day, vid: vid, ammoId: ammoId, units: left, loc: loc });
  return shares;
}
function provMove(ledger, vid, ammoId, fromLoc, toLoc, units, day) {
  if (!(units > 0) || fromLoc === toLoc) return [];
  const src = provQueue(ledger, vid, ammoId, fromLoc);
  const dst = provQueue(ledger, vid, ammoId, toLoc);
  const moved = [];
  let left = units;
  while (left > 0 && src.length) {
    const b = src[0];
    const take = Math.min(b.units, left);
    b.units -= take; left -= take;
    dst.push({ source: b.source, day: b.day, units: take });
    moved.push({ source: b.source, units: take });
    if (b.units <= 0) src.shift();
  }
  if (moved.length) ledger.transfers.push({ seq: ++ledger.seq, day: day, vid: vid, ammoId: ammoId, units: units - left, from: fromLoc, to: toLoc, sources: moved });
  return moved;
}
function ledgerRefreshVid(ledger, Game, vid) {
  const sn = ammoSnapVid(Game, vid);
  if (sn) ledger.lastSnap[vid] = sn;
}
function ledgerSeed(ledger, Game, day) {
  const snap = ammoSnapAll(Game);
  for (const vid of Object.keys(snap)) {
    for (const ammoId of AMMO_IDS) {
      const c = snap[vid][ammoId];
      if (c.carried > 0) provPush(ledger, vid, ammoId, 'carried', 'starting-kit', day, c.carried);
      if (c.stashed > 0) provPush(ledger, vid, ammoId, 'stashed', 'starting-kit', day, c.stashed);
    }
  }
  ledger.lastSnap = snap;
}
// ledgerDaily: reconcile today's snapshot against lastSnap. Production
// the wraps did not name lands as 'other' (never silently zero);
// location shifts move FIFO preserving source; unexplained losses are
// recorded as unattributed spends (a dead villager's ammo is labelled
// 'died', not unattributed). Called once per day from the policy-daily
// finally block, AFTER the wraps have already refreshed lastSnap for
// the vids they touched — so wrapped events are never double-counted.
function ledgerDaily(ledger, Game, day, errors) {
  try {
    const snap = ammoSnapAll(Game);
    for (const vid of Object.keys(snap)) {
      const prev = ledger.lastSnap[vid] || {};
      let dead = false;
      try { const p = Game.getPerson ? Game.getPerson(vid) : null; if (p && p.dead) dead = true; } catch (e) {}
      for (const ammoId of AMMO_IDS) {
        const pv = prev[ammoId] || { carried: 0, stashed: 0 };
        const nw = snap[vid][ammoId];
        let cD = nw.carried - pv.carried;
        let sD = nw.stashed - pv.stashed;
        // Net transfer first (equal total, location moved).
        if (cD > 0 && sD < 0) { const mv = Math.min(cD, -sD); provMove(ledger, vid, ammoId, 'stashed', 'carried', mv, day); cD -= mv; sD += mv; }
        else if (cD < 0 && sD > 0) { const mv = Math.min(-cD, sD); provMove(ledger, vid, ammoId, 'carried', 'stashed', mv, day); cD += mv; sD -= mv; }
        if (cD > 0) { provPush(ledger, vid, ammoId, 'carried', 'other', day, cD); ledger.other.push({ seq: ledger.seq, day: day, vid: vid, ammoId: ammoId, units: cD, loc: 'carried' }); }
        if (sD > 0) { provPush(ledger, vid, ammoId, 'stashed', 'other', day, sD); ledger.other.push({ seq: ledger.seq, day: day, vid: vid, ammoId: ammoId, units: sD, loc: 'stashed' }); }
        if (cD < 0) {
          if (dead) ledger.unattributedSpend.push({ seq: ++ledger.seq, day: day, vid: vid, ammoId: ammoId, units: -cD, loc: 'carried', reason: 'died' });
          else provTake(ledger, vid, ammoId, 'carried', -cD, day);
        }
        if (sD < 0) {
          if (dead) ledger.unattributedSpend.push({ seq: ++ledger.seq, day: day, vid: vid, ammoId: ammoId, units: -sD, loc: 'stashed', reason: 'died' });
          else provTake(ledger, vid, ammoId, 'stashed', -sD, day);
        }
      }
    }
    ledger.lastSnap = snap;
  } catch (e) { errors.push('ledger-daily: ' + String(e.message).slice(0, 80)); }
}
function summarizeProv(ledger) {
  const out = {};
  for (const vid of Object.keys(ledger.prov)) {
    out[vid] = {};
    for (const ammoId of Object.keys(ledger.prov[vid])) {
      out[vid][ammoId] = { carried: provShares(ledger, vid, ammoId, 'carried'), stashed: provShares(ledger, vid, ammoId, 'stashed') };
    }
  }
  return out;
}


// ---- HOMECRAFT GATE SNAPSHOT (sim-homecraft-gate-a, prereg §1b) ----
// Daily pile-material + at-home-carrier snapshot, taken inside the
// villagerAmmoCraftDay wrap: BEFORE the original call (the decision-time
// state) and AFTER it (attempted/made, read from the cooldown + ledger
// diffs). All reads are pure — no RNG, no game-state writes. The snapshot
// answers the aidammo §4 question: WHY do the 131 never-received fighters
// never get a batch — carriers rarely home, or pile never holds materials?
// Gate buckets (frozen, prereg §1c) are assigned by the ANALYZER from
// these rows; the driver records only the raw gate fields.
//   home: not away, alive (the duty's home definition, minus the scholar:
//     dutyHome = home && !isScholar — the duty never serves the scholar).
//   carriedAmmo: carried units of the matching ammo (< 5 = short).
//   cooldownActive: v.arrowCraftCd[vid] > day - 3 (an attempt in the last
//     3 days blocks a new one).
//   level: v.ammoCraft[vid][ammoId] (1 = blind 35%, >= 2 = learned 85%).
//   ownSufficient / pileSufficient / combinedSufficient: the recipe's
//     materials covered by own carried items alone / the camp pile alone /
//     the two together (the code's own-then-pile rule).
//   attempted: the cooldown was newly set to today by this call (the TRUE
//     attempt flag — the code sets arrowCraftCd exactly when an attempt
//     fires, i.e. after gates 1-7 pass).
//   madeBatch: a home-duty batch landed for this villager this call.
const GATE_MATS = ['stick', 'stone', 'fiber'];
function gateRecipes(Game) {
  const out = { arrow: null, bolt: null };
  try {
    const recipes = (Game.data && Game.data.recipes) || [];
    for (const r of recipes) {
      if (!r || (r.id !== 'arrow' && r.id !== 'bolt')) continue;
      out[r.id] = { materials: Object.assign({}, r.materials || {}), makesUnits: r.makesUnits || 1 };
    }
  } catch (e) {}
  return out;
}
function pileMats(Game) {
  const out = { stick: 0, stone: 0, fiber: 0 };
  try {
    const st = (Game.stashState ? Game.stashState() : null);
    const mats = (st && st.materials) || (((Game.state || {}).village || {}).stash || {}).materials || {};
    for (const m of GATE_MATS) out[m] = (mats[m] | 0);
  } catch (e) {}
  return out;
}
function gateDefOf(Game, id) {
  try { return ((Game.data && Game.data.items) || []).find(function (d) { return d && d.id === id; }) || null; } catch (e) { return null; }
}
function gateOwnMat(Game, p, mat) {
  // The villagerAmmoCraftDay isMatEntry rule, as a pure read: string
  // entries equal the material; e.material === mat; e.itemId === mat
  // when the def is not a weapon/armor.
  let n = 0;
  try {
    for (const e of (p.items || [])) {
      let is = false;
      if (typeof e === 'string') is = (e === mat);
      else if (e) {
        if (e.material === mat) is = true;
        else if (e.itemId === mat) { const d = gateDefOf(Game, mat); is = !(d && (d.weapon || d.armor)); }
      }
      if (is) n += (typeof e === 'string') ? 1 : (e.units || 1);
    }
  } catch (e2) {}
  return n;
}
function gateMatsSufficient(Game, p, pile, recipeMats) {
  // Returns {own, pile, combined}: each material covered by own / pile /
  // own+pile respectively. Null recipe => all false (no recipe = no craft).
  const res = { own: false, pile: false, combined: false };
  if (!recipeMats) return res;
  let ownOk = true, pileOk = true, combOk = true;
  for (const m of Object.keys(recipeMats)) {
    const need = recipeMats[m] | 0;
    const own = gateOwnMat(Game, p, m);
    const pl = (pile && pile[m]) | 0;
    if (own < need) ownOk = false;
    if (pl < need) pileOk = false;
    if (own + pl < need) combOk = false;
  }
  res.own = ownOk; res.pile = pileOk; res.combined = combOk;
  return res;
}
// gateSnapshotPre(Game, day): the decision-time gate state for every
// live roster bow/bolt carrier (ammoId arrow/bolt — slings and searcasters
// are NOT gate carriers: the duty has no recipe for stone/fusion_cell, so
// they are recorded nowhere here and classified (c1) by the analyzer from
// the encounter row itself). Ranged reads use ammoRangedKit (no autoEquip
// — the duty seats bows itself during the call; the post snapshot re-reads
// the weapon so a bow seated by the duty is not missed).
function gateSnapshotPre(Game, day) {
  const v = (Game.state || {}).village || {};
  const pile = pileMats(Game);
  const recipes = gateRecipes(Game);
  const cd = v.arrowCraftCd || {};
  const craftLv = v.ammoCraft || {};
  const away = v.away || {};
  const carriers = [];
  const roster = (v.roster || []).slice();
  for (const vid of roster) {
    try {
      let dead = false;
      try { const pp = Game.getPerson ? Game.getPerson(vid) : null; if (pp && pp.dead) dead = true; } catch (e2) {}
      if (dead) continue;
      const kit = ammoRangedKit(Game, vid);
      if (!kit.ammoId || (kit.ammoId !== 'arrow' && kit.ammoId !== 'bolt')) continue;
      const p = Game.getPerson ? Game.getPerson(vid) : null;
      if (!p) continue;
      const rec = recipes[kit.ammoId] || null;
      const suf = gateMatsSufficient(Game, p, pile, rec ? rec.materials : null);
      const isScholar = (vid === Game.villagerId);
      const home = !away[vid];
      carriers.push({ vid: vid, isScholar: isScholar, home: home, dutyHome: home && !isScholar,
        rangedId: kit.rangedId, rangedIdPost: null, ammoId: kit.ammoId,
        carriedAmmo: kit.ammoAtEntry | 0,
        cooldownActive: ((cd[vid] || -99) > day - 3), cooldownDay: (cd[vid] != null ? cd[vid] : null),
        level: (((craftLv[vid] || {})[kit.ammoId]) || 1),
        ownSufficient: suf.own, pileSufficient: suf.pile, combinedSufficient: suf.combined,
        recipePresent: !!rec, attempted: false, madeBatch: false });
    } catch (e) { /* one carrier's read never kills the snapshot */ }
  }
  return { day: day, pile: pile, carriers: carriers };
}
// gateSnapshotPost(Game, day, pre, gains): attach the attempt outcome to
// each pre row and return the finished day row. gains maps
// vid|ammoId -> units gained in this call (the wrap's ledger diff).
// attempted = the cooldown was newly set to today; madeBatch = a
// home-duty batch landed for this villager (gain > 0 for their ammo id).
// rangedIdPost re-reads the weapon after the duty's autoEquip.
function gateSnapshotPost(Game, day, pre, gains) {
  const v = (Game.state || {}).village || {};
  const cd = v.arrowCraftCd || {};
  for (const row of (pre.carriers || [])) {
    try {
      const kit = ammoRangedKit(Game, row.vid);
      row.rangedIdPost = kit.rangedId || null;
      row.attempted = ((cd[row.vid] == null ? -99 : cd[row.vid]) === day) && (row.cooldownDay !== day);
      const g = (gains || {})[row.vid + '|' + row.ammoId] || 0;
      row.madeBatch = g > 0;
    } catch (e) { /* leave the row as the pre snapshot read it */ }
  }
  return pre;
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
  // ---- AIDAMMO LEDGER: seed + wraps (prereg §1b) ----
  // Seed BEFORE any day runs: starting-kit provenance for every
  // carried/stashed ammo unit. Wraps call each original exactly once
  // and draw no RNG. Each wrap diffs before/after snapshots, applies
  // its production accounting, then refreshes lastSnap for the vids
  // it touched so the daily reconcile never double-counts.
  const ammoLedger = createAmmoLedger();
  try { ledgerSeed(ammoLedger, Game, gday(Game)); } catch (e) { errors.push('ledger-seed: ' + String(e.message).slice(0, 80)); }
  // ---- HOMECRAFT GATE SNAPSHOT: recipes (once) + daily rows ----
  const craftGateDays = [];
  let craftGateRecipes = null;
  try { craftGateRecipes = gateRecipes(Game); } catch (e) { errors.push('gate-recipes: ' + String(e.message).slice(0, 80)); }
  try {
    const origACD = Game.villagerAmmoCraftDay;
    if (typeof origACD === 'function') {
      Game.villagerAmmoCraftDay = function () {
        const before = ammoSnapAll(Game);
        let ret = 0;
        // HOMECRAFT GATE: decision-time snapshot BEFORE the call.
        let gatePre = null;
        const gateGains = {};
        try { gatePre = gateSnapshotPre(Game, gday(Game)); } catch (e) { errors.push('gate-pre: ' + String(e.message).slice(0, 80)); }
        try { ret = origACD.apply(this, arguments); }
        finally {
          try {
            ammoLedger.counters.homeDutyCalls++;
            ammoLedger.counters.homeDutyBatches += (ret | 0);
            const after = ammoSnapAll(Game);
            for (const vid of Object.keys(after)) {
              for (const ammoId of AMMO_IDS) {
                const b = before[vid] ? before[vid][ammoId] : { carried: 0, stashed: 0 };
                const a = after[vid][ammoId];
                const totGain = (a.carried + a.stashed) - (b.carried + b.stashed);
                if (totGain > 0) {
                  gateGains[vid + '|' + ammoId] = totGain;
                  // Home-duty craft lands in carried items; if the
                  // gain shows in the stash instead, honour the read.
                  if (a.carried - b.carried > 0) provPush(ammoLedger, vid, ammoId, 'carried', 'home-duty', gday(Game), a.carried - b.carried);
                  if (a.stashed - b.stashed > 0) provPush(ammoLedger, vid, ammoId, 'stashed', 'home-duty', gday(Game), a.stashed - b.stashed);
                }
              }
              ledgerRefreshVid(ammoLedger, Game, vid);
            }
          } catch (e) { errors.push('ledger-craftday: ' + String(e.message).slice(0, 80)); }
          // HOMECRAFT GATE: attach attempted/made to the pre rows.
          try { if (gatePre) craftGateDays.push(gateSnapshotPost(Game, gday(Game), gatePre, gateGains)); } catch (e) { errors.push('gate-post: ' + String(e.message).slice(0, 80)); }
        }
        return ret;
      };
    } else errors.push('ledger-craftday-wrap: not a function');
  } catch (e) { errors.push('ledger-craftday-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origPA = Game.villagerPocketAmmo;
    if (typeof origPA === 'function') {
      Game.villagerPocketAmmo = function (vid) {
        const before = ammoSnapVid(Game, vid);
        let out = { pocketed: 0, crafted: 0, craftedOk: false, ammoId: null };
        try { out = origPA.apply(this, arguments) || out; }
        finally {
          try {
            ammoLedger.counters.departureCalls++;
            const after = ammoSnapVid(Game, vid);
            const ammoId = out.ammoId;
            if (before && after && ammoId) {
              const b = before[ammoId], a = after[ammoId];
              const stashMoved = Math.max(0, b.stashed - a.stashed);
              const carriedGain = a.carried - b.carried;
              if (stashMoved > 0) {
                provMove(ammoLedger, vid, ammoId, 'stashed', 'carried', stashMoved, gday(Game));
                ammoLedger.counters.departureStashMoved += stashMoved;
              }
              const remainder = carriedGain - stashMoved;
              if (remainder > 0) {
                if (ammoId === 'stone') {
                  provPush(ammoLedger, vid, ammoId, 'carried', 'departure-pile-stones', gday(Game), remainder);
                  ammoLedger.counters.departureStones += remainder;
                } else if (out.craftedOk) {
                  provPush(ammoLedger, vid, ammoId, 'carried', 'departure-craft', gday(Game), remainder);
                } else {
                  provPush(ammoLedger, vid, ammoId, 'carried', 'other', gday(Game), remainder);
                  ammoLedger.other.push({ seq: ammoLedger.seq, day: gday(Game), vid: vid, ammoId: ammoId, units: remainder, loc: 'carried', note: 'pocket-unexplained' });
                }
              } else if (remainder < 0) {
                provTake(ammoLedger, vid, ammoId, 'carried', -remainder, gday(Game));
              }
              if (out.crafted) {
                ammoLedger.counters.departureCraftAttempts += (out.crafted | 0);
                if (out.craftedOk) ammoLedger.counters.departureCraftOk += 1;
              }
            }
            ledgerRefreshVid(ammoLedger, Game, vid);
          } catch (e) { errors.push('ledger-pocket: ' + String(e.message).slice(0, 80)); }
        }
        return out;
      };
    } else errors.push('ledger-pocket-wrap: not a function');
  } catch (e) { errors.push('ledger-pocket-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origKL = Game.villagerKillLoot;
    if (typeof origKL === 'function') {
      Game.villagerKillLoot = function (vid, mdef) {
        const before = ammoSnapVid(Game, vid);
        let dropId = null;
        try { dropId = origKL.apply(this, arguments); }
        finally {
          try {
            if (dropId) ammoLedger.counters.lootDrops++;
            const after = ammoSnapVid(Game, vid);
            if (before && after) {
              for (const ammoId of AMMO_IDS) {
                const gain = (after[ammoId].carried + after[ammoId].stashed) - (before[ammoId].carried + before[ammoId].stashed);
                if (gain > 0) {
                  if (after[ammoId].carried - before[ammoId].carried > 0) provPush(ammoLedger, vid, ammoId, 'carried', 'loot', gday(Game), after[ammoId].carried - before[ammoId].carried);
                  if (after[ammoId].stashed - before[ammoId].stashed > 0) provPush(ammoLedger, vid, ammoId, 'stashed', 'loot', gday(Game), after[ammoId].stashed - before[ammoId].stashed);
                  ammoLedger.counters.lootAmmoDrops++;
                }
              }
            }
            ledgerRefreshVid(ammoLedger, Game, vid);
          } catch (e) { errors.push('ledger-killloot: ' + String(e.message).slice(0, 80)); }
        }
        return dropId;
      };
    } else errors.push('ledger-killloot-wrap: not a function');
  } catch (e) { errors.push('ledger-killloot-wrap-install: ' + String(e.message).slice(0, 80)); }
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
        // AIDAMMO: pre-call provenance for the lead + allies, and
        // pre-call carried snapshots for the spend diff (every fight,
        // not just watched ones — a wave-1 volley spends arrows the
        // wave-4 ledger must not re-attribute).
        let ffPre = null;
        try {
          const allyList = ((opts && opts.allyVids) || []).slice();
          const leadKit = ammoRangedKit(this, vid);
          ffPre = { lead: { vid: vid, snap: ammoSnapVid(Game, vid), kit: leadKit,
            prov: leadKit.ammoId ? provShares(ammoLedger, vid, leadKit.ammoId, 'carried') : [] },
            allies: allyList.map(function (av) {
              const k = ammoRangedKit(Game, av);
              return { vid: av, snap: ammoSnapVid(Game, av), kit: k,
                prov: k.ammoId ? provShares(ammoLedger, av, k.ammoId, 'carried') : [], spent: null };
            }) };
        } catch (e) { errors.push('ledger-ff-pre: ' + String(e.message).slice(0, 80)); }
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
            // AIDAMMO: lead ammo provenance at entry (FIFO shares of
            // the carried units) + each ally's kit/provenance +
            // the lead's volley spend (filled post-call).
            ammoProv: ffPre ? ffPre.lead.prov : [],
            alliesAmmo: ffPre ? ffPre.allies.map(function (a) { return { vid: a.vid, rangedId: a.kit.rangedId, ammoId: a.kit.ammoId, ammoAtEntry: a.kit.ammoAtEntry, prov: a.prov, spent: null }; }) : [],
            volleySpend: null,
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
            // AIDAMMO: spend diff for the lead (volleySpend on the
            // row) — the allies' spends land on alliesAmmo[].spent.
            try {
              if (ffPre) {
                const spendFor = function (entry, isLead) {
                  const after = ammoSnapVid(Game, entry.vid);
                  if (!entry.snap || !after) return;
                  for (const ammoId of AMMO_IDS) {
                    const spent = entry.snap[ammoId].carried - after[ammoId].carried;
                    if (spent > 0) {
                      const shares = provTake(ammoLedger, entry.vid, ammoId, 'carried', spent, gday(Game));
                      const rec2 = { vid: entry.vid, ammoId: ammoId, units: spent, sources: shares };
                      ammoLedger.spends.push(Object.assign({ seq: ++ammoLedger.seq, day: gday(Game) }, rec2));
                      if (isLead) row.volleySpend = rec2;
                      else {
                        const slot = (row.alliesAmmo || []).find(function (x) { return x.vid === entry.vid; });
                        if (slot) slot.spent = rec2;
                      }
                    }
                  }
                  ledgerRefreshVid(ammoLedger, Game, entry.vid);
                };
                spendFor(ffPre.lead, true);
                for (const a of ffPre.allies) spendFor(a, false);
              }
            } catch (e) { errors.push('ledger-ff-spend: ' + String(e.message).slice(0, 80)); }
            v4encounters.push(row);
          }
        } catch (e) { errors.push('v4enc-log: ' + String(e.message).slice(0, 80)); }
        // AIDAMMO: non-watched fights spend ammo too — consume FIFO
        // here so the provenance queues stay honest for the next
        // wave-4 meeting. (Watched fights already diffed above.)
        try {
          if (!watch && ffPre) {
            const spendFor2 = function (entry) {
              const after = ammoSnapVid(Game, entry.vid);
              if (!entry.snap || !after) return;
              for (const ammoId of AMMO_IDS) {
                const spent = entry.snap[ammoId].carried - after[ammoId].carried;
                if (spent > 0) {
                  const shares = provTake(ammoLedger, entry.vid, ammoId, 'carried', spent, gday(Game));
                  ammoLedger.spends.push({ seq: ++ammoLedger.seq, day: gday(Game), vid: entry.vid, ammoId: ammoId, units: spent, sources: shares });
                }
              }
              ledgerRefreshVid(ammoLedger, Game, entry.vid);
            };
            spendFor2(ffPre.lead);
            for (const a of ffPre.allies) spendFor2(a);
          }
        } catch (e) { errors.push('ledger-ff-spend-unwatched: ' + String(e.message).slice(0, 80)); }
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
            // AIDAMMO: daily ledger reconcile (production the wraps
            // did not name lands as 'other'; transfers move FIFO).
            try { ledgerDaily(ammoLedger, Game, d, errors); } catch (e) { errors.push('ledger-daily-call: ' + String(e.message).slice(0, 80)); }
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
    seed: seed, arm: 'homecraft-gate-a', run: RUN, mode: MODE, leg: MODE,
    anchorCommit: ANCHOR, standingMarker: STANDING_MARKER,
    brainSha: BRAIN_SHA, carryPresent: CARRY_PRESENT,
    wiringSha: WIRING_SHA, sensePresent: SENSE_PRESENT,
    gameSha: GAME_SHA, bowopenPresent: BOWOPEN_PRESENT,
    speargatePresent: SPEARGATE_PRESENT, speargateOn: SPEARGATE_ON,
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
    // SPEARGATE gate-replication counters (sim-instrument-a, blank
    // #4): the per-departure spear-gate seen/passed counts for this
    // seed, read from the live village.bowOpen counters the game
    // code maintains inside villagerStageBow (src/js/game.js).
    // spearSeen = departures whose equipped ranged entry is a spear
    // (a melee weapon sitting in the ranged slot, carrying no ammo);
    // spearPassed = of those, the ones the gate passes over to the
    // sources (SPEARGATE on only — the gate read uses volleyWeaponOf
    // when on, rangedWeaponOf when off). One villagerStageBow call
    // = one departure gear-up. When staging never ran (BOWOPEN off
    // — the ctl leg), village.bowOpen is absent and both counters
    // are null (unobserved), never 0: a zero would claim the gate
    // saw nobody, which is unmeasured. When staging ran, a missing
    // key means zero seen (the game bumps the key only on sighting).
    spearSeen: (st.village && st.village.bowOpen) ? (st.village.bowOpen.spearSeen | 0) : null,
    spearPassed: (st.village && st.village.bowOpen) ? (st.village.bowOpen.spearPassed | 0) : null,
    // SPEARGATE: the per-vid staging map (bowopen §12 gap) — {vid: {day, source, itemId}}
    // so alreadyHad-with-a-spear can be cross-checked by item id.
    bowOpenByVid: (st.village && st.village.bowOpenByVid) ? JSON.parse(JSON.stringify(st.village.bowOpenByVid)) : null,
    // AIDAMMO LEDGER (prereg §1b): every ammo batch by production
    // source + the per-vid provenance queues at run end.
    ammoLedger: { events: ammoLedger.events, other: ammoLedger.other,
      unattributedSpend: ammoLedger.unattributedSpend, transfers: ammoLedger.transfers,
      spends: ammoLedger.spends, counters: ammoLedger.counters,
      finalProv: summarizeProv(ammoLedger) },
    ammoCraftLevels: (st.village && st.village.ammoCraft) ? JSON.parse(JSON.stringify(st.village.ammoCraft)) : null,
    // HOMECRAFT GATE (prereg §1b): daily pile + at-home-carrier rows.
    scholarId: Game.villagerId || null,
    craftGate: { recipes: craftGateRecipes, days: craftGateDays },
    vetSays: vetSays, sayCount: sayCount,
    instrumentErrors: (vf ? vf.t.instrumentErrors : []).concat(errors),
    deaths: deaths,
    samples: result.samples || null,
    v4seeds: v4seeds, v4departs: v4departs, v4gates: v4gates, v4encounters: v4encounters,
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
  if (MODE !== 'diag') { console.error('HOMECRAFT STOP: MODE must be diag (single-leg DIAG), got ' + JSON.stringify(MODE)); process.exit(2); }
  // The legs differ ONLY by ENV (BOWOPEN flag); the MODE label must
  // match the flag. ctl = BOWOPEN unset, arm = BOWOPEN=1. BOTH
  // legs run SPEARGATE=1 (the fixed gate ground — see prereg §0) +
  // SENSEEXPED=1 (the sense fix is the substrate).
  // Same code on disk both legs — no revert between legs. A leg/flag
  // mismatch is a loud stop, never a silent mislabel.
  if (!SENSE_PRESENT) { console.error('HOMECRAFT STOP: the SENSEEXPED launch-preference sense must be present in src/js/party-wiring.js (substrate).'); process.exit(2); }
  if (!SENSEEXPED_ON) { console.error('HOMECRAFT STOP: SENSEEXPED=1 required (substrate).'); process.exit(2); }
  if (!BOWOPEN_PRESENT) { console.error('HOMECRAFT STOP: the bow-staging mechanism (villagerStageBow) must be present in src/js/game.js.'); process.exit(2); }
  if (!BOWOPEN_ON) { console.error('HOMECRAFT STOP: BOWOPEN=1 required (substrate — same ground as the ammosupply pilot).'); process.exit(2); }
  if (!SPEARGATE_PRESENT) { console.error('HOMECRAFT STOP: the spear-gate fix (SPEARGATE + volleyWeaponOf in villagerStageBow) must be present in src/js/game.js (substrate).'); process.exit(2); }
  if (!SPEARGATE_ON) { console.error('HOMECRAFT STOP: SPEARGATE=1 required (fixed gate ground).'); process.exit(2); }
  if (process.env.VETREENGAGE !== '1') { console.error('HOMECRAFT STOP: VETREENGAGE=1 required (substrate).'); process.exit(2); }
  if (process.env.PARTYSIZE4 !== '1') { console.error('HOMECRAFT STOP: PARTYSIZE4=1 required (substrate).'); process.exit(2); }
  if (process.env.FLEEREPAIR2 !== '1') { console.error('HOMECRAFT STOP: FLEEREPAIR2=1 required (substrate).'); process.exit(2); }
  if (process.env.FIGHTALLY2 !== '1') { console.error('HOMECRAFT STOP: FIGHTALLY2=1 required (substrate).'); process.exit(2); }
  if (!SEEDS.length) { console.error('HOMECRAFT STOP: SEEDS required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-24', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'homecraft-gate-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('HOMECRAFT STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  let lostSeeds = [];
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'homecraft-gate-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
    const saved = writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    if (!saved) {
      lostSeeds.push(seed);
      console.error('HOMECRAFT STOP: could not write ' + path.relative(REPO, file) + ' after 10 min of retries (write flap?) — seed ' + seed + ' NOT saved; re-run this seed after the flap clears.');
    }
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, anchor: (out.anchorCommit || '').slice(0, 12),
      brainSha: out.brainSha, carryPresent: out.carryPresent,
      wiringSha: out.wiringSha, sensePresent: out.sensePresent,
      gameSha: out.gameSha, bowopenPresent: out.bowopenPresent,
      speargatePresent: out.speargatePresent, speargateOn: out.speargateOn,
      senseexpedOn: out.senseexpedOn, fightally2On: out.fightally2On,
      bowopenOn: out.bowopenOn,
      spearSeen: out.spearSeen, spearPassed: out.spearPassed,
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
      launchdefSkips: out.launchdefSkips.length,
      companionPool: out.companionPool.length,
      launchTrack: out.v4launchTrack ? out.v4launchTrack.length : 0,
      ledgerEvents: out.ammoLedger ? out.ammoLedger.events.length : null,
      ledgerOther: out.ammoLedger ? out.ammoLedger.other.length : null,
      ledgerUnattributed: out.ammoLedger ? out.ammoLedger.unattributedSpend.length : null,
      gateDays: out.craftGate ? out.craftGate.days.length : null,
      gateCarriers: out.craftGate ? out.craftGate.days.reduce(function (a, d) { return a + (d.carriers || []).length; }, 0) : null,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
  if (lostSeeds.length) {
    console.error('HOMECRAFT STOP: ' + lostSeeds.length + ' seed(s) NOT saved (' + lostSeeds.join(',') + ') — re-run them after the flap clears. Exit 4.');
    process.exitCode = 4;
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun, AMMO_IDS: AMMO_IDS, createAmmoLedger: createAmmoLedger, ammoSnapVid: ammoSnapVid, ammoSnapAll: ammoSnapAll, ammoRangedKit: ammoRangedKit, provPush: provPush, provTake: provTake, provMove: provMove, provShares: provShares, ledgerSeed: ledgerSeed, ledgerDaily: ledgerDaily, summarizeProv: summarizeProv, loadWave4Ids: loadWave4Ids, planIsWave4: planIsWave4, deriveLaunchBlock: deriveLaunchBlock, poolReplica: poolReplica, classifySeedPath: classifySeedPath, firstCallerFrame: firstCallerFrame, fightOrigin: fightOrigin, targetPersistence: targetPersistence, SEED_PATHS: SEED_PATHS, SEEDLAND: SEEDLAND, LAUNCHSURVIVE: LAUNCHSURVIVE, installSkipRecorder: installSkipRecorder, commitKindOf: commitKindOf, recoverMHpStart: recoverMHpStart, gateRecipes: gateRecipes, pileMats: pileMats, gateOwnMat: gateOwnMat, gateMatsSufficient: gateMatsSufficient, gateSnapshotPre: gateSnapshotPre, gateSnapshotPost: gateSnapshotPost, GATE_MATS: GATE_MATS };
