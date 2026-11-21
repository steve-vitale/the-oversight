// holdersupply-driver-a.js — BUILD driver, arm sim-holdersupply-a
// (finding #2628: HOLDER SUPPLY — a bigger cell bundle per gun).
// Clone of scripts/lendpool-driver-a.js (the gunrate-driver lineage:
// ammo census, grant wraps, near-miss recorder, `v4lendPool` counter,
// `v4lends` recorder — all kept verbatim). The ONLY game-code change
// under test is BIGBUNDLE in src/js/contests.js (searcaster contest
// prize bundles 6 fusion cells instead of 2, same recipient); the
// driver itself changes nothing about the game — it only records.
//   TWO legs (MODE=ctl|arm), identical seeds 107131-107138, 150d
//   death-aware, competent verbatim policy. BOTH legs run the landed
//   substrate GUNRATE=1 + CELLGATE=1 with LEND unset; the arm leg adds
//   BIGBUNDLE=1. The legs differ ONLY by bundle size.
//   Substrate env (both legs):
//   VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 +
//   SENSEEXPED=1 + BOWOPEN=1 + SPEARGATE=1.
//   The `v4lends` recorder must stay EMPTY on both legs (LEND off);
//   the `v4lendPool` counter re-verifies the pool on the fresh band.
// Usage (ctl):
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 MODE=ctl OUTDIR=perseed-holdersupply-a-ctl SEEDS=107131,107132,107133,107134,107135,107136,107137,107138 RUN=holdersupply-a node scripts/holdersupply-driver-a.js
// Usage (arm — adds BIGBUNDLE=1, OUTDIR perseed-holdersupply-a-arm):
//   ... GUNRATE=1 CELLGATE=1 BIGBUNDLE=1 MODE=arm OUTDIR=perseed-holdersupply-a-arm SEEDS=... RUN=holdersupply-a node scripts/holdersupply-driver-a.js
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
const RUN = process.env.RUN || 'holdersupply-a';
const MODE = process.env.MODE || 'ctl';
const OUTDIR = process.env.OUTDIR || ('perseed-holdersupply-a');
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
// (Substrate change vs bowopen-a: the old LAUNCHPARTY sense fix is NOT
// on master ebea87dfb — it was superseded by SENSEEXPED, landed as
// 97e78670d (sim-senseexped-b, finding #2583); LAUNCHPARTY appears
// nowhere in src/js/ on this base. This driver requires SENSEEXPED=1,
// the live master substrate, as fightcap-driver-b.js does.)
let WIRING_SHA = 'unknown';
let SENSE_PRESENT = false;
try {
  const wiringSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'party-wiring.js'), 'utf8');
  WIRING_SHA = crypto.createHash('sha256').update(wiringSrc).digest('hex').slice(0, 12);
  SENSE_PRESENT = wiringSrc.indexOf('SENSEEXPED') !== -1;
} catch (e) {}
const SENSEEXPED_ON = process.env.SENSEEXPED === '1';
const BOWOPEN_ON = process.env.BOWOPEN === '1';
// BOWOPEN: sha of the file that carries the bow-staging mechanism +
// whether it is in it, so each corpus file self-describes the code it
// ran under. The flag itself is recorded per file below.
let GAME_SHA = 'unknown';
let BOWOPEN_PRESENT = false;
try {
  const gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  GAME_SHA = crypto.createHash('sha256').update(gameSrc).digest('hex').slice(0, 12);
  BOWOPEN_PRESENT = /BOWOPEN/.test(gameSrc) && /villagerStageBow/.test(gameSrc);
} catch (e) {}
const FIGHTALLY2_ON = process.env.FIGHTALLY2 === '1';
const SPEARGATE_ON = process.env.SPEARGATE === '1';
const GUNRATE_ON = process.env.GUNRATE === '1';
const CELLGATE_ON = process.env.CELLGATE === '1';
const BIGBUNDLE_ON = process.env.BIGBUNDLE === '1';
const LEND_ON = process.env.LEND === '1';
// GUNRATE: sha of the files that carry the lever + whether it is in
// them, so each corpus file self-describes the code it ran under.
let GUNRATE_PRESENT = false;
try {
  const gameSrc2 = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  const contestsSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'contests.js'), 'utf8');
  GUNRATE_PRESENT = /GUNRATE/.test(gameSrc2) && /searcaster/.test(gameSrc2)
    && /GUNRATE/.test(contestsSrc) && /_gunRateFighter/.test(contestsSrc);
} catch (e) {}
// CELLGATE: the wave-gated volley must be in fieldFights.js, so each
// corpus file self-describes the code it ran under.
let CELLGATE_PRESENT = false;
try {
  const ffSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');
  CELLGATE_PRESENT = /CELLGATE/.test(ffSrc) && /holds the Searcaster/.test(ffSrc);
} catch (e) {}
// BIGBUNDLE: the 6-cell bundle must be in contests.js, so each
// corpus file self-describes the code it ran under.
let BIGBUNDLE_PRESENT = false;
try {
  const contestsSrc2 = fs.readFileSync(path.join(REPO, 'src', 'js', 'contests.js'), 'utf8');
  BIGBUNDLE_PRESENT = /BIGBUNDLE/.test(contestsSrc2) && /units: _bbOn \? 6 : 2/.test(contestsSrc2);
} catch (e) {}
// LEND: the gun lend must be in game.js, so each corpus file
// self-describes the code it ran under.
let LEND_PRESENT = false;
try {
  const gameSrc3 = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  LEND_PRESENT = /_lendSearcaster/.test(gameSrc3) && /_returnLentSearcaster/.test(gameSrc3)
    && /resolveWildMonsterEncounter/.test(gameSrc3);
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
      if (line.indexOf('launchparty-driver-b.js') !== -1) continue;
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
      if (file.indexOf('launchparty-driver-b.js') !== -1) continue;
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

// ---- FUSIONCELL helpers (module scope: the proof test requires them) ----
// Ammo taxonomy (src/data/items.json + src/data/recipes.json):
//   sling/phase_sling -> stone (pile, taken directly, cap 6)
//   crude_bow/bow/starfall_bow/apex_bow -> arrow (craft: stick 2 +
//     stone 1 + fiber 1, makes 5); crossbow -> bolt (stick 2 + stone 1,
//     makes 5); searcaster -> fusion_cell (NO recipe, NO pile source);
//   hunting_spear/fire_hardened_spear -> no weapon.ammo (volley never
//     fires; pocketAmmo returns immediately).
// The pocketAmmo wrap classifies each departure from PRE/POST reads
// only (the game function runs exactly once, untouched):
//   carriedBefore/carriedAfter: matching ammo in the pack.
//   stashBefore/stashAfter: matching ammo in the personal stash.
//   pileBefore/pileAfter: communal pile materials (copy).
//   out: the pocketAmmo return {pocketed, crafted, craftedOk, ammoId}.
//   matsSufficient: pile (pre) covers the recipe — computed from the
//     recipe, never guessed.
// classifyPocketAmmo(pre, out, carriedAfter): pure; returns
// { outcome, reason } where outcome is one of:
//   'no-ranged' (no ranged weapon at all — the wrap does not record
//     these rows), 'spear-no-ammo' (ranged weapon, no ammo id),
//   'already-full' (carried >= cap before the call),
//   'already-had' (carried > 0, nothing added, still > 0),
//   'stash' (topped up from own stash), 'pile-stone' (stones from
//     the pile), 'craft-ok' (departure craft succeeded),
//   'craft-failed' (attempt ran, roll lost — zero-ammo reason),
//   'no-materials' (no attempt: pile short of the recipe),
//   'no-source-kind' (fusion_cell et al: no recipe, no pile),
//   'craft-never-ran' (materials sufficient, no attempt —
//     instrument error if ever seen).
// `reason` is the zero-ammo failure reason (null on non-zero rows).
const AMMO_CAP = { stone: 6, arrow: 5, bolt: 5, fusion_cell: 5 };
function ammoCountOf(items, ammoId) {
  let n = 0;
  for (const e of (items || [])) {
    const eid = (typeof e === 'string') ? e : (e && (e.itemId || e.id || e.material));
    if (eid === ammoId) n += (typeof e === 'string') ? 1 : (e.units || 1);
  }
  return n;
}
function rangedKitOf(Game, person) {
  try {
    const S = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
    let rw = null;
    try { rw = (S.equipment && S.equipment.rangedWeaponOf) ? S.equipment.rangedWeaponOf(person, Game.data.items) : null; } catch (e) {}
    if (!rw) rw = (person.equipped || {}).ranged || null;
    if (!rw) return { rw: null, rwId: null, ammoId: null };
    const rwId = rw.itemId || rw.id || null;
    const def = (Game.data.items || []).find(function (d) { return d.id === rwId; });
    const ammoId = (def && def.weapon && def.weapon.ammo) || null;
    return { rw: rw, rwId: rwId, ammoId: ammoId };
  } catch (e) { return { rw: null, rwId: null, ammoId: null }; }
}
function pileMatsOf(Game) {
  try {
    const st = (Game.stashState) ? Game.stashState() : null;
    const mats = (st && st.materials) || {};
    const out = {};
    for (const k of ['stick', 'stone', 'fiber', 'vine', 'wood', 'branch']) out[k] = mats[k] || 0;
    return out;
  } catch (e) { return { stick: 0, stone: 0, fiber: 0, vine: 0, wood: 0, branch: 0 }; }
}
function recipeNeedsOf(Game, ammoId) {
  try {
    const recipe = (Game.data.recipes || []).find(function (r) { return r.id === ammoId; });
    if (!recipe || !recipe.materials) return null;
    return recipe.materials;
  } catch (e) { return null; }
}
function matsSufficient(mats, needs) {
  if (!needs) return false;
  for (const m of Object.keys(needs)) if ((mats[m] || 0) < needs[m]) return false;
  return true;
}
function classifyPocketAmmo(pre, out, carriedAfter) {
  // pre: { ammoId, carriedBefore, stashBefore, pileBefore, matsSufficient, cap }
  // out: pocketAmmo return { pocketed, crafted, craftedOk, ammoId }
  if (!pre.ammoId) return { outcome: 'spear-no-ammo', reason: 'spear-no-ammo' };
  const cap = pre.cap || 5;
  if (pre.carriedBefore >= cap) return { outcome: 'already-full', reason: null };
  if (carriedAfter > 0) {
    if (out && out.crafted === 1 && out.craftedOk) return { outcome: 'craft-ok', reason: null };
    if (out && out.pocketed > 0) {
      const stashDelta = (pre.stashBefore || 0) - (pre.stashAfter != null ? pre.stashAfter : pre.stashBefore || 0);
      if (stashDelta > 0) return { outcome: 'stash', reason: null };
      return { outcome: 'pile-stone', reason: null };
    }
    return { outcome: 'already-had', reason: null };
  }
  // carriedAfter === 0: a zero-ammo departure — name the reason.
  if (pre.ammoId !== 'arrow' && pre.ammoId !== 'bolt' && pre.ammoId !== 'stone') return { outcome: 'no-source-kind', reason: 'no-source-kind' };
  if (pre.ammoId === 'stone') return { outcome: 'no-materials', reason: 'no-materials' };
  if (out && out.crafted === 1) return { outcome: 'craft-failed', reason: 'craft-failed' };
  if (pre.matsSufficient) return { outcome: 'craft-never-ran', reason: 'craft-never-ran' };
  return { outcome: 'no-materials', reason: 'no-materials' };
}
// homeCraftMatsOk(Game, person, ammoId): the villagerAmmoCraftDay
// material check as a pure read — own carried materials (pack
// entries carrying a material key, the craft() matching rule) +
// the communal pile vs the recipe. Mirrors villager-build.js.
function homeCraftMatsOk(Game, person, ammoId) {
  try {
    const defs = Game.data.items || [];
    const defOf = function (id) { return defs.find(function (d) { return d.id === id; }) || null; };
    const needs = recipeNeedsOf(Game, ammoId);
    if (!needs) return false;
    const isMatEntry = function (e, mat) {
      if (typeof e === 'string') return e === mat;
      if (!e) return false;
      if (e.material === mat) return true;
      if (e.itemId === mat) { const d = defOf(mat); return !(d && (d.weapon || d.armor)); }
      return false;
    };
    const ownMat = function (mat) {
      let n = 0;
      for (const e of (person.items || [])) if (isMatEntry(e, mat)) n += (typeof e === 'string') ? 1 : (e.units || 1);
      return n;
    };
    const mats = pileMatsOf(Game);
    for (const m of Object.keys(needs)) if (ownMat(m) + (mats[m] || 0) < needs[m]) return false;
    return true;
  } catch (e) { return false; }
}
// classifyHomeDutyRow(s, attempted, success, day): the
// villagerAmmoCraftDay attribution as a pure function — mirrors the
// duty's own order (home filter, then the stocked skip, then the
// cooldown/materials gates). s: {carriedBefore, cdBefore, matsOk,
// away}. Returns the reason string, or null on success /
// already-stocked non-attempt (no failure to explain — the duty
// correctly skips a stocked carrier, so 'already-stocked' IS a
// reason value, recorded for the count, not an error).
//   'away' — the villager is not at home; the duty never serves them.
//   'already-stocked' — carried >= 5; the duty skips a full quiver.
//   'craft-failed' — an attempt ran and the roll lost.
//   'cooldown' — a previous attempt within 3 days.
//   'no-materials' — own + pile short of the recipe.
//   'not-attempted-unknown' — none of the above explains the skip
//     (instrument error if ever seen in volume).
function classifyHomeDutyRow(s, attempted, success, day) {
  if (s.away) return 'away';
  if ((s.carriedBefore | 0) >= 5) return 'already-stocked';
  if (attempted && success) return null;
  if (attempted && !success) return 'craft-failed';
  if (!attempted) {
    if (s.cdBefore != null && s.cdBefore > day - 3) return 'cooldown';
    if (!s.matsOk) return 'no-materials';
    return 'not-attempted-unknown';
  }
  return null;
}
// ---- FUSIONCELL v2: grant-side helpers (module scope: the proof
// test requires them) ----
// classifyGrantCaller(stack): the alienLootGrant caller taxonomy —
// the grant side of rollAlienLoot has four callers the v1 instrument
// never saw: contest prizes (_cxItemPrize, contests.js — tier 4 on
// extreme-risk + apex + 25%), show gifts (_showVillagerEnd via
// apWackyGift — tier <= 3, so no cells), trade (betrayal.js), and
// player kill loot (corpseForKill -> alienLootGrant(dropId,
// lootCorpse) -> corpse -> scholar-only _corpseTakeStack). Pure
// string match on the stack, never game state. Anything matching no
// rule is 'other' (the row carries its first caller frame for audit).
function classifyGrantCaller(stack) {
  const st = String(stack || '');
  if (st.indexOf('_cxItemPrize') !== -1) return 'contest-prize';
  if (st.indexOf('_showVillagerEnd') !== -1 || st.indexOf('apWackyGift') !== -1) return 'show-gift';
  if (st.indexOf('betrayal') !== -1) return 'trade';
  if (st.indexOf('corpseForKill') !== -1) return 'kill-loot-corpse';
  return 'other';
}
// grantRecipientOf(Game, toCorpse): where an alienLootGrant lands.
// toCorpse null -> the scholar's inventory. toCorpse with .items and
// an id that resolves via getPerson -> that villager's pack.
// toCorpse with .items but no person -> a corpse (kill loot stays
// with the body until the scholar takes it). Pure reads.
function grantRecipientOf(Game, toCorpse) {
  if (!toCorpse) return { toKind: 'scholar', toVid: null };
  if (toCorpse.items) {
    const id = toCorpse.id || null;
    let isPerson = false;
    try { isPerson = !!(id && Game.getPerson && Game.getPerson(id)); } catch (e) { isPerson = false; }
    if (isPerson) return { toKind: 'villager', toVid: id };
    return { toKind: 'corpse', toVid: id };
  }
  return { toKind: 'other', toVid: null };
}

// ammoCensusSnap(Game): one snapshot of the village's ammo state —
// every living roster villager's ranged kit + carried/stashed ammo,
// plus the communal pile recipe materials. Pure reads.
// FUSIONCELL: each row also carries the villager's fusion_cell
// counts (carried + stashed, regardless of weapon — a killer's loot
// lands in the pack whether or not they hold a searcaster), and the
// snapshot carries pileCells (communal pile materials + all four
// stash sections searched for fusion_cell entries) and scholarCells
// (the scholar's inventory cells + ranged kit — the scholar is a
// villager too, and a cell in their pack is a cell in the world).
function cellCountIn(items, cellId) { return ammoCountOf(items, cellId || 'fusion_cell'); }
// ARMED-HOLDER (kept from sim-presence-a): driver-side mirror of the game's armed-
// holder check (pure reads, no RNG, no writes) — a living villager
// with a searcaster in the equipped ranged slot, >= 1 fusion cell,
// health > 20. Used by the v4tickPresence recorder and the
// v4transfers detector. The game draft ALSO requires not-sheltered
// and not-post-flee-resting; the recorder applies those filters
// where the engine does (the tick candidate set).
function isArmedHolder(Game, vid) {
  try {
    const p = (Game.getPerson ? Game.getPerson(vid) : null);
    if (!p || p.dead) return false;
    const kit = rangedKitOf(Game, p);
    if (!kit.rw || kit.rwId !== 'searcaster') return false;
    if (ammoCountOf(p.items, 'fusion_cell') < 1) return false;
    const hp = (((Game.state || {}).village || {}).health || {})[vid];
    if (hp !== undefined && hp <= 20) return false;
    return true;
  } catch (e) { return false; }
}
// LEND-POOL COUNTER (sim-lendfix-a, finding #2628): lendPoolMoment
// (Game, vid, m, opts) — the pure-read evaluation of the lend's own
// conditions, WITHOUT lending and WITHOUT the LEND env gate, so the
// pool can be measured with the lend OFF. Returns null when the moment
// is not lendable, else { lendable: true, kind, from, lender } where
// kind is 'gun' (lead has no searcaster) or 'cells' (lead carries an
// empty searcaster), from is 'tile' | 'adjacent', lender is the picked
// holder (roster order, on-tile first, then adjacent). The condition
// list mirrors Game._lendSearcaster line for line: wave >= 4, not a
// raid, lead unarmed-or-empty, a living armed holder (searcaster +
// >= 1 fusion cell, roster villager, never the scholar, health > 20,
// not sheltered, not post-flee resting) in earshot (Chebyshev <= 1)
// who is NOT the lead. Zero Math.random() calls, zero game-state
// writes. Exported for the proof test (scripts/test-lendfix-a.js).
function lendPoolMoment(Game, vid, m, opts) {
  try {
    opts = opts || {};
    if (opts.raid) return null;
    if (!m || !m.id) return null;
    var mdef = null;
    try { mdef = (Game.data.monsters || []).find(function (x) { return x.id === m.id; }) || null; } catch (e) {}
    var wave = (mdef && mdef.wave) || 0;
    if (wave < 4) return null;
    if (m.tx == null || m.ty == null) return null;
    var bPerson = null;
    try { bPerson = Game.getPerson ? Game.getPerson(vid) : null; } catch (e) {}
    if (!bPerson || bPerson.dead) return null;
    var kit = rangedKitOf(Game, bPerson);
    var kind = null;
    if (kit.rwId === 'searcaster') {
      if (ammoCountOf(bPerson.items, 'fusion_cell') > 0) return null;
      kind = 'cells';
    } else {
      kind = 'gun';
    }
    var roster = ((Game.state || {}).village || {}).roster || [];
    var health = ((Game.state || {}).village || {}).health || {};
    var lender = null, from = null;
    for (var pass = 0; pass < 2 && !lender; pass++) {
      for (var ri = 0; ri < roster.length; ri++) {
        var hid = roster[ri];
        if (!hid || hid === vid || hid === Game.villagerId) continue;
        var hp = null;
        try { hp = Game.getPerson ? Game.getPerson(hid) : null; } catch (e) {}
        if (!hp || hp.dead) continue;
        var hh = health[hid];
        if (hh !== undefined && hh <= 20) continue;
        try { if (Game.isSheltered && Game.isSheltered(hid)) continue; } catch (e) {}
        try { if (Game.isPostFleeResting && Game.isPostFleeResting(hid)) continue; } catch (e) {}
        var node = null;
        try { node = Game.npcNode ? Game.npcNode(hid) : null; } catch (e) {}
        if (!node || node.nx == null || node.ny == null) continue;
        var dist = Math.max(Math.abs(node.nx - m.tx), Math.abs(node.ny - m.ty));
        if (dist > 1) continue;
        if ((pass === 0) !== (dist === 0)) continue;
        if (!isArmedHolder(Game, hid)) continue;
        lender = hid; from = (dist === 0) ? 'tile' : 'adjacent';
        break;
      }
    }
    if (!lender) return null;
    return { lendable: true, kind: kind, from: from, lender: lender };
  } catch (e) { return null; }
}
// NEAREST-HOLDER STATE (sim-lendpool-a, finding #2628):
// classifyHolderState (Game, hid) — where the holder is and what
// it is doing, in the prereg's FROZEN priority order (first match
// wins): sheltered > resting > low-health (<= 20) > on-expedition
// > away > at-home (Haven node + inside the hall) > in-camp
// (Haven node + outside on the grounds) > out-in-world (any other
// node, not on an expedition or away). 'dead' when the person
// record is dead; 'unknown' only when the node cannot be read.
// Staged in fixtures through the REAL verbs/methods
// (shelterVillagers, markPostFleeRest, agencyState().exped,
// village.away, npcSetNode/npcSetInside) — never a faked flag.
// Pure reads, zero Math.random() calls, zero game-state writes
// (npcInside only READS — it defaults an unset sub-state, the same
// read the game itself performs; agencyState only ensures its maps
// exist, as the game does on every call). Exported for the proof
// test (scripts/test-lendpool-a.js).
function classifyHolderState(Game, hid) {
  try {
    var p = null;
    try { p = Game.getPerson ? Game.getPerson(hid) : null; } catch (e) {}
    if (!p || p.dead) return 'dead';
    try { if (Game.isSheltered && Game.isSheltered(hid)) return 'sheltered'; } catch (e) {}
    try { if (Game.isPostFleeResting && Game.isPostFleeResting(hid)) return 'resting'; } catch (e) {}
    var health = ((Game.state || {}).village || {}).health || {};
    var hh = health[hid];
    if (hh !== undefined && hh <= 20) return 'low-health';
    try { var ag = Game.agencyState ? Game.agencyState() : null; if (ag && ag.exped && ag.exped[hid]) return 'on-expedition'; } catch (e) {}
    try { var away = ((Game.state || {}).village || {}).away || {}; if (away[hid]) return 'away'; } catch (e) {}
    var node = null;
    try { node = Game.npcNode ? Game.npcNode(hid) : null; } catch (e) {}
    if (!node || node.nx == null || node.ny == null) return 'unknown';
    var v = (Game.state || {}).village || {};
    var hx = (v.px != null ? v.px : 4), hy = (v.py != null ? v.py : 4);
    if (node.nx === hx && node.ny === hy) {
      try { if (Game.npcInside && Game.npcInside(hid)) return 'at-home'; } catch (e) {}
      return 'in-camp';
    }
    return 'out-in-world';
  } catch (e) { return 'unknown'; }
}
// NEAR-MISS MOMENT (sim-lendpool-a, finding #2628): nearMissMoment
// (Game, vid, m, opts) — the launch the lend would see, evaluated
// WITHOUT lending and WITHOUT the LEND env gate. Returns null when
// the launch is out of scope (below wave 4, no monster tile, dead
// lead), else { leadKind, wave, raid, livingHolderCount,
// nearestHolder, nearestDist, nearestState, nearestHealth,
// nearestCells, anyArmedEarshot, anyEligibleEarshot, lendable }.
// RAID launches (opts.raid) ARE evaluated and returned with
// raid: true and lendable: false — a raid is a real fight through
// the same choke point (havenGrowth calls resolveWildMonster-
// Encounter with {raid:true}), and the encounter recorder logs it,
// so the near-miss row must exist for the coverage join to match;
// the BREAKDOWN still excludes raids (the lend never fires at a
// raid — the lend's scope, not a measurement gap). PRE-PILOT
// CORRECTION (smoke seed 107111, before any judged sim): the
// first smoke showed 3 encounter rows with no near-miss row —
// all three are raid-routed fights (origin 'world-tick', the frame
// below fieldFight is resolveWildMonsterEncounter in both cases);
// the recorder had returned null for raids, so the coverage
// denominator counted fights the recorder never saw. The prereg
// text stays frozen; this correction is recorded in the evidence.
// A "holder" is a living roster villager OTHER than the lead (never
// A "holder" is a living roster villager OTHER than the lead (never
// the scholar) whose equipped ranged weapon is a searcaster carrying
// >= 1 fusion cell — the gun + cells, regardless of shelter / rest /
// health (those are the CLASSIFICATION, not the scan filter, so a
// sheltered holder in earshot still counts as armed-earshot but not
// as eligible-earshot). The lead is excluded from the scan: for an
// unarmed lead that matches lendPoolMoment; for a loaded lead it
// means the earshot flags read "ANOTHER armed holder is also in
// earshot", which is the interesting number (does the gun ever
// double up?). nearestDist is Chebyshev tiles from the holder's
// node to the monster tile; ties break in roster order. lendable is
// the lendPoolMoment verdict, for cross-check against v4lendPool.
// Zero Math.random() calls, zero game-state writes. Exported for
// the proof test (scripts/test-lendpool-a.js).
function nearMissMoment(Game, vid, m, opts) {
  try {
    opts = opts || {};
    if (!m || !m.id) return null;
    var mdef = null;
    try { mdef = (Game.data.monsters || []).find(function (x) { return x.id === m.id; }) || null; } catch (e) {}
    var wave = (mdef && mdef.wave) || 0;
    if (wave < 4) return null;
    if (m.tx == null || m.ty == null) return null;
    var bPerson = null;
    try { bPerson = Game.getPerson ? Game.getPerson(vid) : null; } catch (e) {}
    if (!bPerson || bPerson.dead) return null;
    var kit = rangedKitOf(Game, bPerson);
    var leadKind = null;
    if (kit.rwId === 'searcaster') {
      if (ammoCountOf(bPerson.items, 'fusion_cell') > 0) leadKind = 'loaded';
      else leadKind = 'cells';
    } else {
      leadKind = 'gun';
    }
    var roster = ((Game.state || {}).village || {}).roster || [];
    var health = ((Game.state || {}).village || {}).health || {};
    var best = null, bestDist = Infinity, livingCount = 0;
    var anyArmed = false, anyEligible = false;
    for (var ri = 0; ri < roster.length; ri++) {
      var hid = roster[ri];
      if (!hid || hid === vid || hid === Game.villagerId) continue;
      var hp = null;
      try { hp = Game.getPerson ? Game.getPerson(hid) : null; } catch (e) {}
      if (!hp || hp.dead) continue;
      var hkit = rangedKitOf(Game, hp);
      if (!hkit.rw || hkit.rwId !== 'searcaster') continue;
      if (ammoCountOf(hp.items, 'fusion_cell') < 1) continue;
      livingCount++;
      var node = null;
      try { node = Game.npcNode ? Game.npcNode(hid) : null; } catch (e) {}
      if (!node || node.nx == null || node.ny == null) continue;
      var dist = Math.max(Math.abs(node.nx - m.tx), Math.abs(node.ny - m.ty));
      var eligible = true;
      var hh = health[hid];
      if (hh !== undefined && hh <= 20) eligible = false;
      try { if (Game.isSheltered && Game.isSheltered(hid)) eligible = false; } catch (e) {}
      try { if (Game.isPostFleeResting && Game.isPostFleeResting(hid)) eligible = false; } catch (e) {}
      if (dist <= 1) {
        anyArmed = true;
        if (eligible) anyEligible = true;
      }
      if (dist < bestDist) {
        bestDist = dist;
        best = { hid: hid, dist: dist, health: (hh === undefined ? null : hh),
          cells: ammoCountOf(hp.items, 'fusion_cell') };
      }
    }
    var nearestState = best ? classifyHolderState(Game, best.hid) : 'no-living-holder';
    var lendable = null;
    try { lendable = lendPoolMoment(Game, vid, m, opts); } catch (e) { lendable = null; }
    return { leadKind: leadKind, wave: wave, raid: !!opts.raid, livingHolderCount: livingCount,
      nearestHolder: best ? best.hid : null,
      nearestDist: best ? best.dist : null,
      nearestState: nearestState,
      nearestHealth: best ? best.health : null,
      nearestCells: best ? best.cells : null,
      anyArmedEarshot: anyArmed, anyEligibleEarshot: anyEligible,
      lendable: !opts.raid && !!(lendable && lendable.lendable) };
  } catch (e) { return null; }
}
// GUN-HOLDER MAP (kept from sim-presence-a): the gun-holder map for one census snap
// (villager vids with rangedId 'searcaster' + whether the scholar's
// pack holds one). The v4transfers detector diffs it day over day.
function gunHoldersOf(Game, snap) {
  const holders = {};
  try {
    for (const row of (snap.census || [])) {
      if (row.rangedId === 'searcaster') holders[row.vid] = { cells: (row.cells | 0), stashCells: (row.cellsStash | 0) };
    }
  } catch (e) {}
  try {
    const inv = ((Game.state || {}).scholar || {}).inventory || [];
    for (const ent of inv) {
      const eid = (typeof ent === 'string') ? ent : (ent && (ent.itemId || ent.id));
      if (eid === 'searcaster') { holders['__scholar__'] = { cells: scholarCellsOf(Game), stashCells: 0 }; break; }
    }
  } catch (e) {}
  return holders;
}
function pileCellsOf(Game) {
  const out = { materials: 0, weapons: 0, armor: 0, tools: 0, medicine: 0, total: 0 };
  try {
    const st = (Game.stashState) ? Game.stashState() : null;
    if (!st) return out;
    out.materials = ((st.materials || {})['fusion_cell'] || 0);
    for (const sec of ['weapons', 'armor', 'tools', 'medicine']) {
      let n = 0;
      for (const e of (st[sec] || [])) {
        const eid = (typeof e === 'string') ? e : (e && (e.itemId || e.id || e.material));
        if (eid === 'fusion_cell') n += (typeof e === 'string') ? 1 : (e.units || 1);
      }
      out[sec] = n;
    }
    out.total = out.materials + out.weapons + out.armor + out.tools + out.medicine;
  } catch (e) {}
  return out;
}
function scholarCellsOf(Game) {
  const out = { cells: 0, rangedId: null, ammoId: null };
  try {
    const s = (Game.state || {}).scholar || {};
    out.cells = cellCountIn(s.inventory, 'fusion_cell');
    const person = (Game.getPerson && Game.villagerId) ? Game.getPerson(Game.villagerId) : null;
    if (person) { const kit = rangedKitOf(Game, person); out.rangedId = kit.rwId; out.ammoId = kit.ammoId; }
    else if (s.inventory) {
      for (const e of (s.inventory || [])) {
        if (e && typeof e === 'object' && e.equipped && e.itemId) {
          const def = (Game.data.items || []).find(function (d) { return d.id === e.itemId; });
          if (def && def.weapon && def.weapon.type === 'ranged') { out.rangedId = e.itemId; out.ammoId = def.weapon.ammo || null; break; }
        }
      }
    }
  } catch (e) {}
  return out;
}

// ---- PARTICIPATION helpers (module scope: the proof test requires them) ----
// classifyLeadRule(stack): WHO leads a wave-4+ fight, from the call
// stack at the fieldFight wrap — the lead is the `vid` the caller
// passes, so the caller IS the rule. Mirrors fightOrigin's frame
// walk (skip this driver's frames, the sim-harness, non-src/js
// frames, and the game's own fieldFight deed wrap in progression.js).
//   expedition-holder — villager-agency.js expeditionMonster: vid is
//     the expedition HOLDER (whoever launched the expedition leads).
//   world-tick — game.js resolveWildMonsterEncounter: the villager
//     the wild monster met. patrol — resolvePatrol: the patrol
//     leader. aid — aidFight: the aided villager. sortie-leader —
//     havenGrowth.js lingererSortie: the sortie leader (cornered).
//     alien-leader — alienPlayers.js. contest — contestEngine.js.
//     nomad — nomad-drive/wild.js. Anything else names its function
//     (other:<fn>) so a new call site is visible, never hidden;
//     only a stack with no readable caller is 'unclassified'.
function classifyLeadRule(stackOverride) {
  try {
    const st = stackOverride != null ? String(stackOverride) : (new Error().stack || '');
    const lines = st.split('\n').slice(1);
    for (const ln of lines) {
      const m = ln.match(/at\s+(?:[A-Za-z_$][\w$]*\.)?([A-Za-z_$][\w$]*)\s+\(([^)]+)\)/) ||
                ln.match(/at\s+([^\s(]+)\s+\(([^)]+)\)/);
      if (!m) continue;
      const fn = m[1] || '';
      const file = m[2] || '';
      if (file.indexOf('fusioncell-participation-driver-a.js') !== -1) continue;
      if (file.indexOf('sim-harness') !== -1) continue;
      if (file.indexOf('src/js/') === -1 && file.indexOf('src\\js\\') === -1) continue;
      if (fn === 'fieldFight') continue;
      if (fn === 'expeditionMonster') return 'expedition-holder';
      if (fn === 'resolveWildMonsterEncounter') return 'world-tick';
      if (fn === 'resolvePatrol') return 'patrol';
      if (fn === 'aidFight') return 'aid';
      if (fn === 'lingererSortie') return 'sortie-leader';
      if (file.indexOf('alienPlayers') !== -1) return 'alien-leader';
      if (file.indexOf('contestEngine') !== -1) return 'contest';
      if (file.indexOf('nomad') !== -1) return 'nomad';
      return 'other:' + fn;
    }
    return 'unclassified';
  } catch (e) { return 'unclassified'; }
}
// classifyFleeCause(rec): WHY a wave-4+ fight ended vFlee, as a pure
// function over the fight record's own fields. Order is load-bearing:
// fleeWise (the suburb leave / timer — a wise exit, not a rout) and
// the committed-finish floor line are checked before the hopeless
// flags, because the floor-flee branch also sets fleeHopeless when
// the trajectory was hopeless. fleeLearn marks the learn-withdrawal
// branch (round >= 3, not winning) — but the hopeless branch sets
// fleeLearn too when intent is 'learn', so learn-withdrawal requires
// fleeLearn WITHOUT fleeHopeless. Returns null for non-vFlee rows.
//   wise-leave | committed-finish-floor | learn-withdrawal |
//   hopeless-after-help | hopeless-alone | floor-hp | unclassified
function classifyFleeCause(rec) {
  if (!rec || rec.outcome !== 'vFlee') return null;
  if (rec.fleeWise) return 'wise-leave';
  try {
    for (const s of (rec.log || [])) {
      if (/Committed-finish floor/.test(String(s))) return 'committed-finish-floor';
    }
  } catch (e) {}
  if (rec.fleeLearn && !rec.fleeHopeless) return 'learn-withdrawal';
  if (rec.fleeHopeless) return (rec.calledHelp || rec.shoutRound != null) ? 'hopeless-after-help' : 'hopeless-alone';
  if (rec.fleeHpFrac != null) return 'floor-hp';
  return 'unclassified';
}
// leadContextOf(Game, vid): WHY this villager leads, as live reads at
// entry — on an expedition (same-target companions are the launch
// party), the win-plan stage/target/party that sent them. Pure reads.
// leadGearOf(Game, vid): the lead's flee inputs at entry — bravery XP
// and temperament (the vBreak inputs, same reads fieldFight uses)
// plus the gearOfReplica armed/armored/armorP/weaponB.
function leadContextOf(Game, vid) {
  const out = { onExped: false, expedTx: null, expedTy: null, expedCompanions: [],
    planStage: null, planTarget: null, planParty: [] };
  try {
    const a = (Game.agencyState && Game.agencyState()) || null;
    const ex = (a && a.exped) ? a.exped[vid] : null;
    if (ex) {
      out.onExped = true; out.expedTx = ex.tx; out.expedTy = ex.ty;
      for (const rid of Object.keys(a.exped || {})) {
        const e2 = a.exped[rid];
        if (rid !== vid && e2 && e2.tx === ex.tx && e2.ty === ex.ty) out.expedCompanions.push(rid);
      }
    }
  } catch (e) {}
  try {
    const plan = planOfGame(Game, vid);
    if (plan) {
      out.planStage = plan.stage || null; out.planTarget = plan.target || null;
      out.planParty = (plan.party || []).slice();
    }
  } catch (e) {}
  return out;
}
function leadGearOf(Game, vid) {
  const g = gearOfReplica(Game, vid);
  let bravery = 0, temper = 'steady';
  try { bravery = (((Game.agencyOf(vid) || {}).xp || {})[vid] || {}).bravery || 0; } catch (e) {}
  try { temper = (Game.npcTemper ? Game.npcTemper(vid) : null) || 'steady'; } catch (e) {}
  return { bravery: bravery, temper: temper, armed: g.armed, armored: g.armored,
    armorP: g.armorP, weaponB: g.weaponB };
}

function ammoCensusSnap(Game) {
  const rows = [];
  try {
    const v = (Game.state || {}).village || {};
    const roster = v.roster || [];
    const away = v.away || {};
    let agency = null;
    try { agency = (Game.agencyState && Game.agencyState()) || null; } catch (e) {}
    for (const vid of roster) {
      try {
        let p = null;
        try { p = Game.getPerson ? Game.getPerson(vid) : null; } catch (e) {}
        if (!p || p.dead) continue;
        const kit = rangedKitOf(Game, p);
        const ammo = kit.ammoId ? ammoCountOf(p.items, kit.ammoId) : 0;
        const stashAmmo = kit.ammoId ? ammoCountOf(p.stashed, kit.ammoId) : 0;
        rows.push({ vid: vid, rangedId: kit.rwId, ammoId: kit.ammoId, ammo: ammo,
          stashAmmo: stashAmmo, away: !!away[vid],
          exped: !!(agency && agency.exped && agency.exped[vid]),
          cells: cellCountIn(p.items, 'fusion_cell'),
          cellsStash: cellCountIn(p.stashed, 'fusion_cell') });
      } catch (e) {}
    }
  } catch (e) {}
  return { census: rows, pile: pileMatsOf(Game), pileCells: pileCellsOf(Game), scholarCells: scholarCellsOf(Game) };
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
  // ---- FUSIONCELL: ammo instrumentation (pure reads + driver-local
  // writes; every wrapped game function runs exactly once, untouched) ----
  const ammoDeparts = [];
  const ammoHomeCraft = [];
  const ammoLoot = [];
  const ammoPlayerCraft = [];
  const ammoCensus = [];
  const ammoPile = [];
  const cellPile = [];
  const grantEvents = [];
  const corpseTakeEvents = [];
  const contestPrizeEvents = [];
  let ammoBaseline = null;
  try {
    const origPocketAmmo = Game.villagerPocketAmmo;
    if (RECORDER_ON && typeof origPocketAmmo === 'function') {
      Game.villagerPocketAmmo = function (vid) {
        let pre = null;
        try {
          const person = this.getPerson ? this.getPerson(vid) : null;
          if (person && !person.dead) {
            const kit = rangedKitOf(this, person);
            if (kit.rw) {
              const needs = kit.ammoId ? recipeNeedsOf(this, kit.ammoId) : null;
              const pile = pileMatsOf(this);
              pre = { vid: vid, day: gday(Game), rangedId: kit.rwId, ammoId: kit.ammoId,
                carriedBefore: kit.ammoId ? ammoCountOf(person.items, kit.ammoId) : 0,
                stashBefore: kit.ammoId ? ammoCountOf(person.stashed, kit.ammoId) : 0,
                pileBefore: pile, pileStoneBefore: pile.stone || 0,
                matsSufficient: kit.ammoId ? matsSufficient(pile, needs) : false,
                cap: kit.ammoId ? (AMMO_CAP[kit.ammoId] || 5) : 5, site: 'other',
                planWave4: false, planTarget: null };
              try { const st = (new Error('fusioncell-caller')).stack || ''; pre.site = st.indexOf('startExpedition') !== -1 ? 'expedition' : (st.indexOf('resolvePatrol') !== -1 ? 'patrol' : 'other'); } catch (e) { pre.site = 'other'; }
              try { const plan = planOfGame(this, vid); pre.planWave4 = planIsWave4(this, plan); pre.planTarget = plan ? (plan.target || null) : null; } catch (e) {}
            }
          }
        } catch (e) { errors.push('ammo-pre: ' + String(e.message).slice(0, 80)); }
        const out = origPocketAmmo.apply(this, arguments);
        try {
          if (pre) {
            const person = this.getPerson ? this.getPerson(vid) : null;
            const carriedAfter = (person && pre.ammoId) ? ammoCountOf(person.items, pre.ammoId) : 0;
            const stashAfter = (person && pre.ammoId) ? ammoCountOf(person.stashed, pre.ammoId) : 0;
            pre.stashAfter = stashAfter;
            const cls = classifyPocketAmmo(pre, out, carriedAfter);
            ammoDeparts.push({ seq: nextSeq(), day: pre.day, vid: vid, site: pre.site,
              planWave4: !!pre.planWave4, planTarget: pre.planTarget || null,
              rangedId: pre.rangedId, ammoId: pre.ammoId,
              carriedBefore: pre.carriedBefore, carriedAfter: carriedAfter,
              stashBefore: pre.stashBefore, stashAfter: stashAfter,
              pocketed: (out && out.pocketed) || 0,
              crafted: (out && out.crafted) || 0,
              craftedOk: !!(out && out.craftedOk),
              pileStoneBefore: pre.pileStoneBefore, matsSufficient: pre.matsSufficient,
              outcome: cls.outcome, reason: cls.reason });
          }
        } catch (e) { errors.push('ammo-post: ' + String(e.message).slice(0, 80)); }
        return out;
      };
    } else if (RECORDER_ON) errors.push('villagerPocketAmmo-wrap: not a function');
  } catch (e) { errors.push('villagerPocketAmmo-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origAmmoDuty = Game.villagerAmmoCraftDay;
    if (RECORDER_ON && typeof origAmmoDuty === 'function') {
      Game.villagerAmmoCraftDay = function () {
        let pre = null;
        try {
          const v = (this.state || {}).village || {};
          const day = gday(Game);
          pre = { day: day, snap: {} };
          for (const vid of (v.roster || [])) {
            try {
              if (vid === this.villagerId) continue; // the duty never serves the scholar
              const p = this.getPerson ? this.getPerson(vid) : null;
              if (!p || p.dead) continue;
              const kit = rangedKitOf(this, p);
              if (!kit.rw || !kit.ammoId || (kit.ammoId !== 'arrow' && kit.ammoId !== 'bolt')) continue;
              const cd = (v.arrowCraftCd || {})[vid];
              pre.snap[vid] = { rangedId: kit.rwId, ammoId: kit.ammoId,
                carriedBefore: ammoCountOf(p.items, kit.ammoId),
                cdBefore: (cd == null ? null : cd),
                matsOk: homeCraftMatsOk(this, p, kit.ammoId),
                away: !!((v.away || {})[vid]) };
            } catch (e) {}
          }
        } catch (e) { errors.push('ammo-duty-pre: ' + String(e.message).slice(0, 80)); }
        const made = origAmmoDuty.apply(this, arguments);
        try {
          if (pre) {
            const v = (this.state || {}).village || {};
            for (const vid of Object.keys(pre.snap)) {
              const s = pre.snap[vid];
              let carriedAfter = s.carriedBefore, cdAfter = s.cdBefore;
              try { const p = this.getPerson ? this.getPerson(vid) : null; if (p) carriedAfter = ammoCountOf(p.items, s.ammoId); } catch (e) {}
              try { const cd = (v.arrowCraftCd || {})[vid]; cdAfter = (cd == null ? null : cd); } catch (e) {}
              const attempted = cdAfter !== s.cdBefore;
              const success = carriedAfter > s.carriedBefore;
              const reason = classifyHomeDutyRow(s, attempted, success, pre.day);
              ammoHomeCraft.push({ day: pre.day, vid: vid, rangedId: s.rangedId, ammoId: s.ammoId,
                carriedBefore: s.carriedBefore, carriedAfter: carriedAfter,
                attempted: attempted, success: success, reason: reason, away: !!s.away });
            }
          }
        } catch (e) { errors.push('ammo-duty-post: ' + String(e.message).slice(0, 80)); }
        return made;
      };
    } else if (RECORDER_ON) errors.push('villagerAmmoCraftDay-wrap: not a function');
  } catch (e) { errors.push('villagerAmmoCraftDay-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origKillLoot = Game.villagerKillLoot;
    if (RECORDER_ON && typeof origKillLoot === 'function') {
      Game.villagerKillLoot = function (vid, mdef) {
        const dropId = origKillLoot.apply(this, arguments);
        try {
          if (dropId) {
            const def = (this.data.items || []).find(function (d) { return d.id === dropId; });
            const isAmmo = ['arrow', 'bolt', 'stone', 'fusion_cell'].indexOf(dropId) !== -1;
            const isRanged = !!(def && def.weapon && def.weapon.ammo);
            if (isAmmo || isRanged) {
              ammoLoot.push({ day: gday(Game), vid: vid, mid: (mdef && mdef.id) || null,
                dropId: dropId, kind: isAmmo ? 'ammo' : 'ranged' });
            }
          }
        } catch (e) { errors.push('ammo-loot-log: ' + String(e.message).slice(0, 80)); }
        return dropId;
      };
    } else if (RECORDER_ON) errors.push('villagerKillLoot-wrap: not a function');
  } catch (e) { errors.push('villagerKillLoot-wrap-install: ' + String(e.message).slice(0, 80)); }
  // FUSIONCELL v2: the grant side of the loot table. alienLootGrant
  // is the single shared path for monster-kill loot AND contest/show
  // prizes AND trade (game.js header) — the v1 instrument wrapped
  // only villagerKillLoot and so could never see a contest prize, a
  // show gift, a trade, or a corpse grant. All three wraps are pure
  // reads + driver-local writes; every game function runs once.
  try {
    const origGrant = Game.alienLootGrant;
    if (RECORDER_ON && typeof origGrant === 'function') {
      Game.alienLootGrant = function (itemId, toCorpse) {
        const ret = origGrant.apply(this, arguments);
        try {
          const rec = grantRecipientOf(this, toCorpse);
          let caller = 'other', frame = null;
          try {
            const st = (new Error('fusioncell-grant-caller')).stack || '';
            caller = classifyGrantCaller(st);
            frame = firstCallerFrame(st);
          } catch (e) { frame = null; }
          grantEvents.push({ day: gday(Game), itemId: itemId || null,
            toKind: rec.toKind, toVid: rec.toVid, caller: caller, frame: frame });
        } catch (e) { errors.push('grant-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('alienLootGrant-wrap: not a function');
  } catch (e) { errors.push('alienLootGrant-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origPrize = Game._cxItemPrize;
    if (RECORDER_ON && typeof origPrize === 'function') {
      Game._cxItemPrize = function (ac, contest, who) {
        const ret = origPrize.apply(this, arguments);
        try {
          contestPrizeEvents.push({ day: gday(Game), who: who || null,
            contest: (contest && contest.id) || null, granted: !!ret });
        } catch (e) { errors.push('prize-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('_cxItemPrize-wrap: not a function');
  } catch (e) { errors.push('_cxItemPrize-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origTake = Game._corpseTakeStack;
    if (RECORDER_ON && typeof origTake === 'function') {
      Game._corpseTakeStack = function (c, it) {
        const ret = origTake.apply(this, arguments);
        try {
          corpseTakeEvents.push({ day: gday(Game),
            itemId: (it && (it.itemId || it.plantId)) || null, toKind: 'scholar' });
        } catch (e) { errors.push('corpse-take-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('_corpseTakeStack-wrap: not a function');
  } catch (e) { errors.push('_corpseTakeStack-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origCraft = Game.craft;
    if (RECORDER_ON && typeof origCraft === 'function') {
      Game.craft = function (recipeId) {
        const ret = origCraft.apply(this, arguments);
        try {
          // FUSIONCELL: log EVERY recipe call (not just arrow/bolt) —
          // a fusion_cell craft, or any new recipe, is visible; the
          // analyzer counts fusion_cell attempts (expected: 0, no
          // such recipe exists) beside the arrow/bolt baseline.
          ammoPlayerCraft.push({ day: gday(Game), vid: this.villagerId || null,
            recipeId: recipeId, ok: ret != null });
        } catch (e) { errors.push('ammo-craft-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('craft-wrap: not a function');
  } catch (e) { errors.push('craft-wrap-install: ' + String(e.message).slice(0, 80)); }
  try { const snap0 = ammoCensusSnap(Game); ammoBaseline = { day: gday(Game), census: snap0.census, pile: snap0.pile, pileCells: snap0.pileCells, scholarCells: snap0.scholarCells }; } catch (e) { errors.push('ammo-baseline: ' + String(e.message).slice(0, 80)); }
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
  // ---- PRESENCE-POOL (kept from sim-presence-a): tick-pool + transfer recorders ----
  // v4tickPresence: one row per wave-4+ world monster per
  // villagerMonsterTick call, recording the armed-holder pool the
  // draft could have drawn on (on-tile / adjacent / absent) — the
  // draft's contact pool, measured, not assumed. v4transfers: one
  // row per gun move / gun vanish the daily census diff can see
  // (finding #2624). Both pure reads + driver-local writes.
  const v4tickPresence = [];
  const v4transfers = [];
  // ---- LEND (sim-lend-a): the lend fired-rows ----
  // v4lends: one row per lend fire, from pure-read wraps on
  // Game._lendSearcaster (records the lend the lever itself made)
  // and Game._returnLentSearcaster (fills in the return outcome on
  // the matching row). The lend is counted from its OWN fired-row,
  // never inferred from corpus diffs (presence §12 finding). Both
  // wraps are pure reads + driver-local writes; the game functions
  // run exactly once, untouched.
  const v4lends = [];
  // ---- LEND-POOL (sim-lendfix-a, finding #2628): the lend-opportunity
  // pool counter — one row per lendable moment (see the
  // resolveWildMonsterEncounter wrap below). Pool rows carry their OWN
  // sequence (poolSeq), never the shared rowSeq — the counter must not
  // shift any other recorder's sequence, or the guardrail byte-identity
  // check would fail on sequence drift alone.
  const v4lendPool = [];
  let poolSeq = 0;
  // ---- NEAR-MISS (sim-lendpool-a, finding #2628): the diagnosis
  // recorder — one row per wave-4+ fight launch (see the
  // resolveWildMonsterEncounter wrap below). Own sequence
  // (nearSeq), never the shared rowSeq.
  const v4nearMiss = [];
  let nearSeq = 0;
  let prevGunHolders = null;
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
        // FUSIONCELL: partyCells — every participant's ranged kit +
        // cells at entry (pre-call read — the volley spends ammo, so
        // the post-call pack no longer shows what anyone opened
        // with). Participants: the fighter + the opts allies. Pure
        // reads, no RNG, no writes.
        let partyCells = null;
        try {
          partyCells = [];
          const seen = {};
          const pids = [vid].concat(((opts && opts.allyVids) || []).slice(0, 4));
          for (const pid of pids) {
            if (!pid || seen[pid]) continue;
            seen[pid] = true;
            try {
              const pp = (this.getPerson ? this.getPerson(pid) : null);
              if (!pp || pp.dead) { partyCells.push({ vid: pid, rangedId: null, ammoId: null, cells: 0, alive: false }); continue; }
              const pk = rangedKitOf(this, pp);
              partyCells.push({ vid: pid, rangedId: pk.rwId, ammoId: pk.ammoId,
                cells: cellCountIn(pp.items, 'fusion_cell'), alive: true });
            } catch (e2) { partyCells.push({ vid: pid, rangedId: null, ammoId: null, cells: 0, alive: false }); }
          }
        } catch (e) { partyCells = null; }
        // PARTICIPATION: lead rule + lead context + lead gear at entry
        // (pre-call reads — the volley spends ammo and the fight spends
        // HP, so the entry state is captured before origFF runs).
        let leadRule = null, leadContext = null, leadGear = null;
        try { leadRule = classifyLeadRule(); } catch (e) { leadRule = 'unclassified'; }
        try { leadContext = leadContextOf(this, vid); } catch (e) { leadContext = null; }
        try { leadGear = leadGearOf(this, vid); } catch (e) { leadGear = null; }
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
            // FUSIONCELL: partyCells (fighter + allies at entry).
            rangedId: rangedId, ammoAtEntry: ammoAtEntry, volley: null,
            partyCells: partyCells,
            // PARTICIPATION: who leads and why, the lead's flee inputs,
            // and the flee cause (classified post-call from the record).
            leadRule: leadRule, leadContext: leadContext, leadGear: leadGear,
            fleeCause: null, fleeHopeless: null, intent: null, intentWhy: null,
            everHopeless: null, everWinning: null, shoutRound: null,
            committedFinish: null, committedFinishKind: null, minHpFrac: null,
            allyTaken: null, ally2Taken: null, allyDealt: null, ally2Dealt: null,
            mHpLeft: null,
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
            // PARTICIPATION: the flee cause + the morale inputs, straight
            // from the fight record (the engine's own numbers).
            row.fleeCause = classifyFleeCause(rec);
            row.fleeHopeless = !!rec.fleeHopeless;
            row.intent = rec.intent || null; row.intentWhy = rec.intentWhy || null;
            row.everHopeless = !!rec.everHopeless; row.everWinning = !!rec.everWinning;
            row.shoutRound = (rec.shoutRound != null ? rec.shoutRound | 0 : null);
            row.committedFinish = !!rec.committedFinish; row.committedFinishKind = rec.committedFinishKind || null;
            row.minHpFrac = (rec.minHpFrac != null ? +rec.minHpFrac.toFixed(2) : null);
            row.allyTaken = rec.allyTaken | 0; row.ally2Taken = rec.ally2Taken | 0;
            row.allyDealt = rec.allyDealt | 0; row.ally2Dealt = rec.ally2Dealt | 0;
            row.mHpLeft = (rec.mHpLeft != null ? rec.mHpLeft | 0 : null);
            row.trickAfter = trickKnownOf(mdef.id);
            try { row.log = (rec.log || []).slice(0, 20).map(function (s) { return String(s).slice(0, 400); }); } catch (e) { row.log = []; }
            v4encounters.push(row);
          }
        } catch (e) { errors.push('v4enc-log: ' + String(e.message).slice(0, 80)); }
        return rec;
      };
    } else if (RECORDER_ON) errors.push('fieldFight-wrap: not a function');
  } catch (e) { errors.push('fieldFight-wrap-install: ' + String(e.message).slice(0, 80)); }
  // ---- PRESENCE-POOL (kept from sim-presence-a): tick-pool recorder ----
  // Wraps villagerMonsterTick with a pure-read pre-pass: for every
  // living wave-4+ world monster, record the armed-holder pool the
  // draft could draw on — holders on the monster's tile, holders on
  // adjacent tiles (earshot), and the size of the engine's candidate
  // set. The original runs exactly once, untouched, after the read;
  // the wrap adds no RNG and no game-state writes. A pool row with
  // no matching v4encounters row is a tick where the 0.5 coin flip
  // (or the player's-tile skip) meant no fight — the draft never had
  // a chance there. A pool row WITH a matching encounter row joins
  // on (day, mid): if the lead is the pooled holder the draft fired
  // (or the pick landed on them anyway); if the lead is someone else
  // while a holder was pooled, the draft MISSED on the arm leg.
  try {
    const origTick = Game.villagerMonsterTick;
    if (RECORDER_ON && typeof origTick === 'function') {
      Game.villagerMonsterTick = function () {
        try {
          const monsters = (typeof this.worldMonsters === 'function') ? this.worldMonsters() : [];
          const day = gday(Game);
          for (const m of monsters) {
            try {
              const def = (this.data.monsters || []).find(function (d) { return d.id === m.id; }) || {};
              if (((def.wave || 1) < 4)) continue;
              let ids = [];
              try {
                const v = (this.state || {}).village || {};
                ids = this.npcsOnNode(m.tx, m.ty).filter(function (id) {
                  return (v.roster || []).indexOf(id) !== -1
                    && !(this.isSheltered && this.isSheltered(id))
                    && !(this.isPostFleeResting && this.isPostFleeResting(id));
                }.bind(this));
              } catch (e) { ids = []; }
              const onTile = [];
              for (const id of ids) { try { if (isArmedHolder(this, id)) onTile.push(id); } catch (e) {} }
              const adjacent = [];
              try {
                const roster = ((this.state || {}).village || {}).roster || [];
                for (const id of roster) {
                  if (ids.indexOf(id) !== -1) continue;
                  if (!isArmedHolder(this, id)) continue;
                  let n = null;
                  try { n = this.npcNode ? this.npcNode(id) : null; } catch (e) { n = null; }
                  if (!n) continue;
                  if (Math.max(Math.abs(n.nx - m.tx), Math.abs(n.ny - m.ty)) <= 1) adjacent.push(id);
                }
              } catch (e) {}
              v4tickPresence.push({ seq: nextSeq(), day: day, mid: m.id, wave: (def.wave || 1),
                tx: m.tx, ty: m.ty, nOnTile: ids.length,
                onTile: onTile.slice(), adjacent: adjacent.slice(),
                holderPresent: (onTile.length + adjacent.length) > 0 });
            } catch (e) { errors.push('tick-presence-row: ' + String(e.message).slice(0, 80)); }
          }
        } catch (e) { errors.push('tick-presence-pre: ' + String(e.message).slice(0, 80)); }
        return origTick.apply(this, arguments);
      };
    } else if (RECORDER_ON) errors.push('villagerMonsterTick-wrap: not a function');
  } catch (e) { errors.push('villagerMonsterTick-wrap-install: ' + String(e.message).slice(0, 80)); }
  // ---- LEND (sim-lend-a): lend fired-row recorder ----
  // Wraps Game._lendSearcaster (records the lend the lever itself
  // made: day / monster / lender / borrower / kind / cells moved)
  // and Game._returnLentSearcaster (fills in the return outcome on
  // the latest matching open row: gun returned / cells returned /
  // lender + borrower alive at return). The return always follows
  // its lend inside the same fight call, so the latest open row
  // with the same lender + borrower + monster is the match. Both
  // wraps are pure reads + driver-local writes; the game functions
  // run exactly once, untouched; no RNG, no game-state writes.
  try {
    const origLend = Game._lendSearcaster;
    if (RECORDER_ON && typeof origLend === 'function') {
      Game._lendSearcaster = function (vid, m, mdef, opts) {
        const ret = origLend.apply(this, arguments);
        try {
          if (ret) {
            v4lends.push({ seq: nextSeq(), day: gday(Game), mid: (m && m.id) || (ret && ret.mid) || null,
              lender: ret.lender || null, borrower: ret.borrower || vid, kind: ret.kind || null,
              from: ret.from || null, cellsMoved: ret.cellsMoved | 0,
              gunReturned: null, cellsReturned: null, lenderAlive: null, borrowerAlive: null });
          }
        } catch (e) { errors.push('v4lend-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('lend-wrap: not a function');
  } catch (e) { errors.push('lend-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origReturn = Game._returnLentSearcaster;
    if (RECORDER_ON && typeof origReturn === 'function') {
      Game._returnLentSearcaster = function (lend) {
        const ret = origReturn.apply(this, arguments);
        try {
          if (ret) {
            for (let i = v4lends.length - 1; i >= 0; i--) {
              const row = v4lends[i];
              if (row.gunReturned !== null) continue;
              if (row.lender === ret.lender && row.borrower === ret.borrower && row.mid === ret.mid) {
                row.gunReturned = !!ret.gunReturned;
                row.cellsReturned = ret.cellsReturned | 0;
                row.lenderAlive = !!ret.lenderAlive;
                row.borrowerAlive = !!ret.borrowerAlive;
                break;
              }
            }
          }
        } catch (e) { errors.push('v4lend-return-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('lend-return-wrap: not a function');
  } catch (e) { errors.push('lend-return-wrap-install: ' + String(e.message).slice(0, 80)); }
  // ---- LEND-POOL (sim-lendfix-a): the lend-opportunity pool counter ----
  // ---- NEAR-MISS (sim-lendpool-a): the diagnosis recorder ----
  // Wraps Game.resolveWildMonsterEncounter: evaluates the lend's own
  // conditions at launch (lendPoolMoment — pure reads, no lend, no
  // draws) AND the near-miss launch (nearMissMoment — pure reads)
  // BEFORE the original runs, and records one v4lendPool row per
  // lendable moment plus one v4nearMiss row per wave-4+ launch whose
  // encounter then becomes a real fight (outcome vKill | mFlee |
  // vFlee | vDie). Evades, already-deads, avoids and null returns
  // are not fights and are not counted. The game function runs
  // exactly once, untouched.
  try {
    const origEncounter = Game.resolveWildMonsterEncounter;
    if (RECORDER_ON && typeof origEncounter === 'function') {
      Game.resolveWildMonsterEncounter = function (vid, m, opts) {
        let moment = null, near = null;
        try { moment = lendPoolMoment(Game, vid, m, opts); } catch (e) { errors.push('v4lendPool-eval-throw: ' + String(e && e.message || e).slice(0, 120)); }
        try { near = nearMissMoment(Game, vid, m, opts); } catch (e) { errors.push('v4nearMiss-eval-throw: ' + String(e && e.message || e).slice(0, 120)); }
        try {
          if (!near) {
            // Coverage diagnostic (sim-lendpool-a): a wave-4+ non-raid
            // launch the near-miss evaluation declined must say why,
            // or the coverage bar cannot tell a missed launch from an
            // out-of-scope one. Never fires on a normal decline
            // (raid / below wave 4) — only on in-scope declines.
            let wv = 0;
            try { const md = (Game.data.monsters || []).find(function (x) { return x.id === (m && m.id); }); wv = (md && md.wave) || 0; } catch (e2) {}
            if (wv >= 4 && !(opts && opts.raid)) {
              let why = 'unknown';
              try {
                const bp = Game.getPerson ? Game.getPerson(vid) : null;
                if (!bp || bp.dead) why = 'lead-dead';
                else if (m == null || m.id == null) why = 'no-monster';
                else if (m.tx == null || m.ty == null) why = 'no-tile';
                else why = 'eval-null';
              } catch (e2) { why = 'eval-throw:' + String(e2 && e2.message || e2).slice(0, 60); }
              errors.push('v4nearMiss-skip: day ' + gday(Game) + ' mid ' + ((m && m.id) || null) + ' lead ' + vid + ' wave ' + wv + ' why ' + why);
            }
          }
        } catch (e) { errors.push('v4nearMiss-skip-log: ' + String(e.message).slice(0, 80)); }
        const rec = origEncounter.apply(this, arguments);
        try {
          if (moment && moment.lendable && rec && ['vKill', 'mFlee', 'vFlee', 'vDie'].indexOf(rec.outcome) >= 0) {
            v4lendPool.push({ seq: ++poolSeq, day: gday(Game), mid: (m && m.id) || null,
              lead: vid, lender: moment.lender, kind: moment.kind, from: moment.from });
          }
        } catch (e) { errors.push('v4lendPool-log: ' + String(e.message).slice(0, 80)); }
        try {
          if (near && rec && ['vKill', 'mFlee', 'vFlee', 'vDie'].indexOf(rec.outcome) >= 0) {
            v4nearMiss.push({ seq: ++nearSeq, day: gday(Game), mid: (m && m.id) || null,
              wave: near.wave, lead: vid, leadKind: near.leadKind, raid: !!(opts && opts.raid),
              livingHolders: near.livingHolderCount, nearestHolder: near.nearestHolder,
              nearestDist: near.nearestDist, nearestState: near.nearestState,
              nearestHealth: near.nearestHealth, nearestCells: near.nearestCells,
              anyArmedEarshot: near.anyArmedEarshot, anyEligibleEarshot: near.anyEligibleEarshot,
              lendable: near.lendable });
          }
        } catch (e) { errors.push('v4nearMiss-log: ' + String(e.message).slice(0, 80)); }
        return rec;
      };
    } else if (RECORDER_ON) errors.push('holdersupply-wrap: not a function');
  } catch (e) { errors.push('holdersupply-wrap-install: ' + String(e.message).slice(0, 80)); }
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
            // FUSIONCELL: daily ammo census — every living roster
            // villager's ranged kit + ammo, plus the pile. Pure reads.
            // The same snapshot carries the cell census (per-row cells
            // + pileCells + scholarCells); cellPile rows hold the
            // pile/scholar half so the analyzer can read it without
            // joining census rows.
            if (RECORDER_ON) {
              try {
                const snap = ammoCensusSnap(Game);
                for (const row of snap.census) ammoCensus.push(Object.assign({ day: d }, row));
                ammoPile.push(Object.assign({ day: d }, snap.pile));
                cellPile.push(Object.assign({ day: d }, snap.pileCells, { scholar: snap.scholarCells }));
              } catch (e) { errors.push('ammo-census: ' + String(e.message).slice(0, 80)); }
            }
            // TRANSFERS (kept from sim-presence-a, finding #2624): gun-transfer
            // detector — diff today's gun-holder map against
            // yesterday's (first daily snapshot seeds the map). A new
            // holder while the old one no longer holds the gun is a
            // transfer; attribution comes from the same-day grant /
            // kill-loot / corpse-take events when one exists, else
            // 'unexplained'. A gun that leaves every known hand with
            // its last holder alive is a VANISH (the catalina_reyes
            // day-93 shape); a dead last holder explains the loss.
            // Pure reads + driver-local writes.
            if (RECORDER_ON) {
              try {
                const snapT = ammoCensusSnap(Game);
                const nowH = gunHoldersOf(Game, snapT);
                if (prevGunHolders === null) { prevGunHolders = nowH; }
                else {
                  const prevIds = Object.keys(prevGunHolders);
                  const nowIds = Object.keys(nowH);
                  for (const to of nowIds) {
                    if (prevGunHolders[to]) continue;
                    let from = null;
                    for (const p of prevIds) { if (!nowH[p]) { from = p; break; } }
                    let attribution = 'unexplained';
                    try {
                      const ge = grantEvents.find(function (e) { return e.day === d && e.itemId === 'searcaster' && e.toVid === to; });
                      if (ge) attribution = 'grant-' + (ge.caller || 'other');
                      else if (ammoLoot.some(function (e) { return e.day === d && e.vid === to && e.dropId === 'searcaster'; })) attribution = 'kill-loot';
                      else if (corpseTakeEvents.some(function (e) { return e.day === d && e.itemId === 'searcaster'; })) attribution = 'corpse-take';
                    } catch (e2) {}
                    v4transfers.push({ day: d, kind: from ? 'transfer' : 'new-holder', from: from, to: to, attribution: attribution });
                  }
                  for (const from of prevIds) {
                    if (nowH[from]) continue;
                    if (nowIds.length > 0) continue; // someone else holds it — covered by the arrival row
                    let dead = false;
                    try { if (from !== '__scholar__') { const pp = Game.getPerson ? Game.getPerson(from) : null; dead = !!(pp && pp.dead); } } catch (e2) {}
                    v4transfers.push({ day: d, kind: dead ? 'holder-died' : 'vanish', from: from, to: null, attribution: dead ? 'holder-died' : 'unexplained' });
                  }
                  prevGunHolders = nowH;
                }
              } catch (e) { errors.push('gun-transfer: ' + String(e.message).slice(0, 80)); }
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
    seed: seed, arm: 'holdersupply-a', run: RUN, mode: MODE, leg: MODE,
    anchorCommit: ANCHOR, standingMarker: STANDING_MARKER,
    brainSha: BRAIN_SHA, carryPresent: CARRY_PRESENT,
    wiringSha: WIRING_SHA, sensePresent: SENSE_PRESENT,
    gameSha: GAME_SHA, bowopenPresent: BOWOPEN_PRESENT,
    launchpartyOn: false, senseexpedOn: SENSEEXPED_ON, senseexpedPresent: SENSE_PRESENT, fightally2On: FIGHTALLY2_ON, speargateOn: SPEARGATE_ON, gunrateOn: GUNRATE_ON, gunratePresent: GUNRATE_PRESENT,
    cellgateOn: CELLGATE_ON, cellgatePresent: CELLGATE_PRESENT,
    bigbundleOn: BIGBUNDLE_ON, bigbundlePresent: BIGBUNDLE_PRESENT,
    lendOn: LEND_ON, lendPresent: LEND_PRESENT,
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
    // FUSIONCELL: departure ammo rows, home-duty rows, loot/craft
    // acquisition events, daily census + pile, day-0 baseline.
    ammoBaseline: ammoBaseline,
    ammoDeparts: ammoDeparts, ammoHomeCraft: ammoHomeCraft,
    ammoLoot: ammoLoot, ammoPlayerCraft: ammoPlayerCraft,
    ammoCensus: ammoCensus, ammoPile: ammoPile, cellPile: cellPile,
    grantEvents: grantEvents, corpseTakeEvents: corpseTakeEvents,
    contestPrizeEvents: contestPrizeEvents,
    vetSays: vetSays, sayCount: sayCount,
    instrumentErrors: (vf ? vf.t.instrumentErrors : []).concat(errors),
    deaths: deaths,
    samples: result.samples || null,
    v4seeds: v4seeds, v4departs: v4departs, v4gates: v4gates, v4encounters: v4encounters,
    v4tickPresence: v4tickPresence, v4transfers: v4transfers, v4lends: v4lends, v4lendPool: v4lendPool, v4nearMiss: v4nearMiss,
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
  // HOLDERSUPPLY: two legs (MODE=ctl|arm). The legs differ ONLY by
  // bundle size: ctl runs the 2-cell substrate bundle, arm adds
  // BIGBUNDLE=1 (6 cells). LEND stays OFF on both legs.
  if (MODE !== 'ctl' && MODE !== 'arm') { console.error('HOLDERSUPPLY STOP: MODE must be ctl or arm, got ' + JSON.stringify(MODE)); process.exit(2); }
  if (MODE === 'arm' && !BIGBUNDLE_ON) { console.error('HOLDERSUPPLY STOP: BIGBUNDLE=1 required on the arm leg.'); process.exit(2); }
  if (MODE === 'ctl' && BIGBUNDLE_ON) { console.error('HOLDERSUPPLY STOP: BIGBUNDLE must be unset on the control leg.'); process.exit(2); }
  if (!BIGBUNDLE_PRESENT) { console.error('HOLDERSUPPLY STOP: the BIGBUNDLE lever code (contests.js bundle units) must be present.'); process.exit(2); }
  if (!GUNRATE_ON) { console.error('LEND STOP: GUNRATE=1 required on both legs (rebuilt substrate).'); process.exit(2); }
  if (!CELLGATE_ON) { console.error('LEND STOP: CELLGATE=1 required on both legs (rebuilt substrate).'); process.exit(2); }
  // NO lend re-test in this arm: LEND must be unset.
  // Both legs measure the pool's near-miss (counter only); the lend stays OFF.
  if (LEND_ON) { console.error('LENDPOOL STOP: LEND must be unset — this arm diagnoses the pool with the lend OFF, it does not re-test the lend.'); process.exit(2); }
  if (process.env.PRESENCE === '1') { console.error('LEND STOP: PRESENCE must be unset on both legs (reverted lever — its code is absent from master).'); process.exit(2); }
  if (!GUNRATE_PRESENT) { console.error('LEND STOP: the GUNRATE lever code (game.js + contests.js) must be present.'); process.exit(2); }
  if (!CELLGATE_PRESENT) { console.error('LEND STOP: the CELLGATE gate code (fieldFights.js) must be present.'); process.exit(2); }
  if (!LEND_PRESENT) { console.error('LEND STOP: the LEND lever code (game.js _lendSearcaster + _returnLentSearcaster) must be present.'); process.exit(2); }
  // Substrate (this arm): BOWOPEN and SPEARGATE are SET on both
  // legs — the bow/spear mechanisms are live master substrate now,
  // and the two legs differ ONLY by the counter. A missing flag is a
  // loud stop, never a silent mislabel.
  if (!SENSE_PRESENT) { console.error('PARTICIPATION STOP: the SENSEEXPED sense code (party-wiring.js) must be present — the old LAUNCHPARTY sense fix is not a substitute.'); process.exit(2); }
  if (!SENSEEXPED_ON) { console.error('LEND STOP: SENSEEXPED=1 required (substrate — the expedition-sourced sense, on master).'); process.exit(2); }
  if (!BOWOPEN_ON) { console.error('LEND STOP: BOWOPEN=1 required on both legs (substrate).'); process.exit(2); }
  if (!SPEARGATE_ON) { console.error('LEND STOP: SPEARGATE=1 required on both legs (substrate).'); process.exit(2); }
  if (process.env.FUSIONCELL === '1') { console.error('LEND STOP: FUSIONCELL must be unset on both legs (reverted fix — never re-applied).'); process.exit(2); }
  if (process.env.SEARSUPPLY === '1') { console.error('LEND STOP: SEARSUPPLY must be unset on both legs (reverted lever — its code is absent from master).'); process.exit(2); }
  if (process.env.BOWCRAFT === '1') { console.error('LEND STOP: BOWCRAFT must be unset on both legs.'); process.exit(2); }
  if (process.env.VETREENGAGE !== '1') { console.error('PARTICIPATION STOP: VETREENGAGE=1 required (substrate) for every mode.'); process.exit(2); }
  if (process.env.PARTYSIZE4 !== '1') { console.error('PARTICIPATION STOP: PARTYSIZE4=1 required (substrate) for every mode.'); process.exit(2); }
  if (process.env.FLEEREPAIR2 !== '1') { console.error('PARTICIPATION STOP: FLEEREPAIR2=1 required (substrate) for every mode.'); process.exit(2); }
  if (process.env.FIGHTALLY2 !== '1') { console.error('PARTICIPATION STOP: FIGHTALLY2=1 required (substrate, both legs — the second seat must be able to join the fight).'); process.exit(2); }
  if (!SEEDS.length) { console.error('PARTICIPATION STOP: SEEDS required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-21', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'holdersupply-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('PARTICIPATION STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'holdersupply-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, anchor: (out.anchorCommit || '').slice(0, 12),
      brainSha: out.brainSha, carryPresent: out.carryPresent,
      wiringSha: out.wiringSha, sensePresent: out.sensePresent,
      gameSha: out.gameSha, bowopenPresent: out.bowopenPresent,
      senseexpedOn: out.senseexpedOn, senseexpedPresent: out.senseexpedPresent, fightally2On: out.fightally2On,
      bowopenOn: out.bowopenOn, speargateOn: out.speargateOn, gunrateOn: out.gunrateOn, gunratePresent: out.gunratePresent, cellgateOn: out.cellgateOn, cellgatePresent: out.cellgatePresent, bigbundleOn: out.bigbundleOn, bigbundlePresent: out.bigbundlePresent, lendOn: out.lendOn, lendPresent: out.lendPresent,
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
      v4gates: out.v4gates.length, v4encounters: out.v4encounters.length, v4tickPresence: out.v4tickPresence ? out.v4tickPresence.length : 0, v4transfers: out.v4transfers ? out.v4transfers.length : 0, v4lends: out.v4lends ? out.v4lends.length : 0, v4lendPool: out.v4lendPool ? out.v4lendPool.length : 0, v4nearMiss: out.v4nearMiss ? out.v4nearMiss.length : 0,
      dawnbidScores: out.dawnbidScores.length, dawnbidDeparts: out.dawnbidDeparts.length,
      dawnbidCensus: out.dawnbidCensus.length, dawnbidStarts: out.dawnbidStarts.length,
      launchdefSkips: out.launchdefSkips.length,
      companionPool: out.companionPool.length,
      launchTrack: out.v4launchTrack ? out.v4launchTrack.length : 0,
      ammoDeparts: out.ammoDeparts ? out.ammoDeparts.length : 0,
      ammoHomeCraft: out.ammoHomeCraft ? out.ammoHomeCraft.length : 0,
      ammoLoot: out.ammoLoot ? out.ammoLoot.length : 0,
      ammoPlayerCraft: out.ammoPlayerCraft ? out.ammoPlayerCraft.length : 0,
      ammoCensus: out.ammoCensus ? out.ammoCensus.length : 0,
      ammoPile: out.ammoPile ? out.ammoPile.length : 0,
      cellPile: out.cellPile ? out.cellPile.length : 0,
      grantEvents: out.grantEvents ? out.grantEvents.length : 0,
      corpseTakeEvents: out.corpseTakeEvents ? out.corpseTakeEvents.length : 0,
      contestPrizeEvents: out.contestPrizeEvents ? out.contestPrizeEvents.length : 0,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun, lendPoolMoment: lendPoolMoment, nearMissMoment: nearMissMoment, classifyHolderState: classifyHolderState, loadWave4Ids: loadWave4Ids, planIsWave4: planIsWave4, deriveLaunchBlock: deriveLaunchBlock, poolReplica: poolReplica, classifySeedPath: classifySeedPath, firstCallerFrame: firstCallerFrame, fightOrigin: fightOrigin, targetPersistence: targetPersistence, SEED_PATHS: SEED_PATHS, SEEDLAND: SEEDLAND, LAUNCHSURVIVE: LAUNCHSURVIVE, installSkipRecorder: installSkipRecorder, commitKindOf: commitKindOf, recoverMHpStart: recoverMHpStart, ammoCountOf: ammoCountOf, rangedKitOf: rangedKitOf, pileMatsOf: pileMatsOf, recipeNeedsOf: recipeNeedsOf, matsSufficient: matsSufficient, classifyPocketAmmo: classifyPocketAmmo, classifyHomeDutyRow: classifyHomeDutyRow, homeCraftMatsOk: homeCraftMatsOk, ammoCensusSnap: ammoCensusSnap, AMMO_CAP: AMMO_CAP, cellCountIn: cellCountIn, pileCellsOf: pileCellsOf, scholarCellsOf: scholarCellsOf, classifyGrantCaller: classifyGrantCaller, grantRecipientOf: grantRecipientOf, classifyLeadRule: classifyLeadRule, classifyFleeCause: classifyFleeCause, leadContextOf: leadContextOf, leadGearOf: leadGearOf, isArmedHolder: isArmedHolder, gunHoldersOf: gunHoldersOf };
