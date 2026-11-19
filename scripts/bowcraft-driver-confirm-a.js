// bowcraft-driver-confirm-a.js — CONFIRM driver, arm sim-bowcraft-confirm-a
// (clone of scripts/bowcraft-driver-a.js; the BOWCRAFT fix is LANDED on
// master as ef1c81094 — this driver only MEASURES it, on the fresh band.
// The recorder, flags and substrate are unchanged from the pilot.)
// (THE BOW-CRAFT VERB NEVER FIRES — finding #2597, the bowsource-a
// follow-up. The bowsource diag proved the home craft duty
// villagerWeaponCraftDay fired 0 times in 90 eligible-villager-days:
// weaponless-only + knowledge seeded only by handling a finished bow.
// This driver measures the FIX before/after on identical seeds:
// BOWCRAFT=1 serves ranged-less villagers (a spear in the ranged slot
// is not a ranged weapon) and seeds bow knowledge from SEEING an
// equipped bow at home.)
// A copy of scripts/bowcraft-driver-a.js's parent,
// scripts/bowsource-driver-a.js (itself a copy of
// scripts/bowopen-driver-a.js, the unified launch-funnel census
// instrument: v4seeds with seed-path classification, v4departs,
// v4gates, v4encounters with origin, dawnbidScores / dawnbidDeparts /
// dawnbidCensus / dawnbidStarts, companionPool, agencyTick skip-reason
// recorder) — the recorder is UNCHANGED except the added volley /
// ranged-at-entry capture on the encounter row (rec.volley +
// pre-call ranged weapon + ammo), PLUS the bow-supply recorder:
//   - tele wrap: weapon_craft / villager_gear / ammo_craft events
//   - villagerKillLoot wrap: every kill-loot drop
//   - daily bow census: holdings / stash / pile / materials /
//     knowledge / craft eligibility, per villager — PLUS the
//     ranged-less counts (nRangedlessKnowsBow: alive villagers
//     with no volley weapon equipped or carried who know a bow
//     recipe; nSpearArmedKnowsBow: the spear-in-slot subset who
//     know one). The old weaponless counts stay for comparability.
//   - day-1 baseline census (starting gear)
//   - all-departures startExpedition wrap: the departing fighter's
//     volley status + the source check at that moment (own stash /
//     armory pile / craftable from known recipe + reachable
//     materials, read live from recipes.json)
//   TWO legs (MODE=ctl|arm): ctl runs BOWCRAFT unset (the old duty,
//   byte-identical); arm runs BOWCRAFT=1 (the fix). BOWOPEN unset,
//   SPEARGATE unset on both legs — the staging mechanism never fires.
//   Substrate env (all LANDED on master 17bb496df):
//   VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 +
//   SENSEEXPED=1. SENSEEXPED is the landed successor to the bowopen
//   band's HELD LAUNCHPARTY sense fix (sim-senseexped-b, finding
//   #2583, commit 97e78670d): the same job — the party that set out
//   together answers first — read from the LIVE expedition instead
//   of winPlan[vid].party. LAUNCHPARTY appears nowhere in src/js on
//   this master (the flag is dead); the driver runs the landed
//   successor, not a HELD cherry-pick. main() asserts the MODE
//   label matches the flags and stops otherwise — a leg/flag
//   mismatch is a loud stop, never a silent mislabel. The corpus
//   files also carry wiringSha (sha256 of src/js/party-wiring.js),
//   gameSha (sha256 of src/js/game.js), buildSha (sha256 of
//   src/js/villager-build.js), bowopenPresent, bowcraftPresent,
//   senseexpedOn, bowopenOn and bowcraftOn so each file
//   self-describes which code+flags it ran under.
// Policy: competent verbatim (scripts/policies/competent.js), 150d
// death-aware. CONFIRM band 107011-107018 (FRESH — designated by the
// pilot prereg; freshness re-verified in the confirm prereg before
// any judged sim: naming-only hits, 0 judged corpora).
// Usage (ctl leg):
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 MODE=ctl OUTDIR=perseed-bowcraft-confirm-a-ctl SEEDS=107011,107012 RUN=bowcraft-confirm-a node scripts/bowcraft-driver-confirm-a.js
// Usage (arm leg — same, plus BOWCRAFT=1 and MODE=arm):
//   VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWCRAFT=1 MODE=arm OUTDIR=perseed-bowcraft-confirm-a-arm SEEDS=107011,107012 RUN=bowcraft-confirm-a node scripts/bowcraft-driver-confirm-a.js
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
const RUN = process.env.RUN || 'bowcraft-confirm-a';
const MODE = process.env.MODE || 'obs';
const OUTDIR = process.env.OUTDIR || ('perseed-bowcraft-confirm-a-' + MODE);
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
// SENSEEXPED: sha of the file that carries the sense fix + whether
// the launch preference is in it, so each corpus file self-describes
// the code it ran under. The flag itself is recorded per file below.
// (SENSEEXPED is the LANDED successor to the bowopen band's HELD
// LAUNCHPARTY sense fix — same job, read from the live expedition;
// see the driver header.)
let WIRING_SHA = 'unknown';
let SENSEEXPED_PRESENT = false;
try {
  const wiringSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'party-wiring.js'), 'utf8');
  WIRING_SHA = crypto.createHash('sha256').update(wiringSrc).digest('hex').slice(0, 12);
  SENSEEXPED_PRESENT = /SENSEEXPED/.test(wiringSrc) && /agencyState/.test(wiringSrc) && /exped/.test(wiringSrc);
} catch (e) {}
const LAUNCHPARTY_ON = process.env.LAUNCHPARTY === '1';
const SENSEEXPED_ON = process.env.SENSEEXPED === '1';
const BOWOPEN_ON = process.env.BOWOPEN === '1';
const BOWCRAFT_ON = true; // TURNED ON 2026-11-19 (1815Z adoption): the duty is
// always on; the env flag is a no-op. Corpora self-describe the duty as on.
// BOWCRAFT: sha of the file that carries the bow-craft fix +
// whether the gate is in it, so each corpus file self-describes
// the code it ran under. The flag itself is recorded per file below.
let BUILD_SHA = 'unknown';
let BOWCRAFT_PRESENT = false;
try {
  const buildSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-build.js'), 'utf8');
  BUILD_SHA = crypto.createHash('sha256').update(buildSrc).digest('hex').slice(0, 12);
  BOWCRAFT_PRESENT = /BOWCRAFT/.test(buildSrc) && /villagerWeaponCraftDay/.test(buildSrc);
} catch (e) {}
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

// ---- BOWSUPPLY pure helpers (module scope: the proof test
// requires them) ----
// RANGED_FROZEN: the 8 ranged weapons in src/data/items.json
// (re-read live in the driver; this list is the fallback when the
// data read fails, so the recorder refuses a stale roster silently
// instead of misclassifying). BOW_RECIPE_FROZEN: the bow /
// crude_bow recipes from src/data/recipes.json (same fallback rule).
const RANGED_FROZEN = ['sling', 'crude_bow', 'bow', 'crossbow', 'phase_sling', 'starfall_bow', 'searcaster', 'apex_bow'];
const BOW_RECIPE_FROZEN = { bow: { wood: 1, vine: 2 }, crude_bow: { branch: 1, vine: 1 } };
function defOfId(defs, id) {
  try { for (let i = 0; i < (defs || []).length; i++) if (defs[i] && defs[i].id === id) return defs[i]; } catch (e) {}
  return null;
}
function isVolleyDef(def) { return !!(def && def.weapon && def.weapon.ammo); }
function isRangedDef(def) { return !!(def && def.weapon && def.weapon.type === 'ranged'); }
// hasMats(mats, need): every material in `need` is covered by `mats`
// (missing keys read as 0). Pure.
function hasMats(mats, need) {
  try {
    for (const k of Object.keys(need || {})) if (((mats || {})[k] || 0) < (need[k] || 0)) return false;
    return true;
  } catch (e) { return false; }
}
// craftableBow(knowsBow, knowsCrude, ownMats, pileMats, recipes):
// the departure-craft source check as a pure function — the
// stageBow craft leg's rule (shared v.weaponCraft record, no
// knowledge → no attempt; materials own-carried first, then the
// communal pile). `recipes` is {bow: {...}, crude_bow: {...}} read
// live from Game.data.recipes, or null → the frozen recipes.
// Returns {bow, crude, any}: bow = knows bow + mats for bow,
// crude = knows crude_bow + mats for crude_bow.
function craftableBow(knowsBow, knowsCrude, ownMats, pileMats, recipes) {
  const rec = recipes || BOW_RECIPE_FROZEN;
  const combined = {};
  try {
    for (const k of Object.keys(ownMats || {})) combined[k] = (combined[k] || 0) + (ownMats[k] || 0);
    for (const k of Object.keys(pileMats || {})) combined[k] = (combined[k] || 0) + (pileMats[k] || 0);
  } catch (e) {}
  const bow = !!knowsBow && !!rec.bow && hasMats(combined, rec.bow);
  const crude = !!knowsCrude && !!rec.crude_bow && hasMats(combined, rec.crude_bow);
  return { bow: bow, crude: crude, any: bow || crude };
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
  // ---- LAUNCHSURVIVE TRACKER (sim-launchsurvive-a) ----
  // One row per live wave-4 plan holder per day (recorded in the
  // daily snapshot block alongside dawnbidCensus). LAUNCHSURVIVE=1
  // only; flag unset = this array stays empty and no
  // `v4launchTrack` key is written on the output.
  const v4launchTrack = [];
  const lastGateByVid = {};
  // ---- BOWSUPPLY RECORDER (sim-bowcraft-a, finding #2592) ----
  // Pure reads + driver-local writes; no RNG, no game-state writes.
  //   bowEvents: tele weapon_craft / villager_gear / ammo_craft rows
  //     (weapon_craft fires ONLY from the home duty here — the
  //     stageBow craft leg is BOWOPEN-gated, off in this diag).
  //   bowKills: villagerKillLoot calls (every drop, bow or not —
  //     the analyzer filters to the bow set).
  //   bowCensus: one row per day (end of day, beside vf.snapshot):
  //     per-villager volley-capable holdings / personal stash /
  //     spears, the stash weapons pile, pile materials, bow
  //     knowledge, and craft eligibility counts.
  //   bowDeparts: EVERY startExpedition departure (post-call read:
  //     what the fighter actually departs holding) — volley status
  //     + the source check at that moment.
  //   bowBaseline: the census row taken after setupGame, before
  //     runDays — the starting-gear reference.
  const bowEvents = [];
  const bowKills = [];
  const bowCensus = [];
  const bowDeparts = [];
  let bowBaseline = null;
  const idOfEntry = function (e) { return (typeof e === 'string') ? e : (e && (e.itemId || e.id)); };
  function bowLiveData() {
    const defs = (Game.data && Game.data.items) || [];
    const recipes = {};
    try {
      for (const r of (Game.data.recipes || [])) {
        if (r && (r.id === 'bow' || r.id === 'crude_bow') && r.materials) recipes[r.id] = r.materials;
      }
    } catch (e) {}
    if (!recipes.bow) recipes.bow = BOW_RECIPE_FROZEN.bow;
    if (!recipes.crude_bow) recipes.crude_bow = BOW_RECIPE_FROZEN.crude_bow;
    return { defs: defs, recipes: recipes };
  }
  // personRanged(Game, vid): the villager's volley-capable kit as
  // pure reads — equipped volley weapon (ammo-bearing, never the
  // spear in the slot), equipped slot entry, carried + stashed
  // volley-capable weapons, and held spears (melee, range 2).
  function personRanged(vid) {
    const out = { equippedVolley: null, equippedSlot: null, spearInSlot: false, carried: [], stashed: [], spears: [] };
    try {
      const p = Game.getPerson ? Game.getPerson(vid) : null;
      if (!p) return out;
      const ld = bowLiveData();
      const S = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
      let slotRw = null;
      try { slotRw = (S.equipment && S.equipment.rangedWeaponOf) ? S.equipment.rangedWeaponOf(p, ld.defs) : null; } catch (e) {}
      if (slotRw) {
        const sid = idOfEntry(slotRw);
        out.equippedSlot = sid;
        const sdef = defOfId(ld.defs, sid);
        if (sdef && sdef.weapon && sdef.weapon.ammo) out.equippedVolley = sid;
        else if (sdef && sdef.weapon && sdef.weapon.type === 'melee' && (sdef.weapon.range | 0) === 2) out.spearInSlot = true;
      }
      if (!out.equippedVolley && S.equipment && S.equipment.volleyWeaponOf) {
        try { const vw = S.equipment.volleyWeaponOf(p, ld.defs); if (vw) out.equippedVolley = idOfEntry(vw); } catch (e) {}
      }
      for (const e of (p.items || [])) {
        const id = idOfEntry(e);
        if (!id) continue;
        const d = defOfId(ld.defs, id);
        if (isVolleyDef(d) && out.carried.indexOf(id) === -1) out.carried.push(id);
        if (d && d.weapon && d.weapon.type === 'melee' && (d.weapon.range | 0) === 2 && out.spears.indexOf(id) === -1) out.spears.push(id);
      }
      for (const e of (p.stashed || [])) {
        const id = idOfEntry(e);
        if (!id) continue;
        const d = defOfId(ld.defs, id);
        if (isVolleyDef(d) && out.stashed.indexOf(id) === -1) out.stashed.push(id);
      }
    } catch (e) { errors.push('bowcraft-personRanged: ' + String(e.message).slice(0, 80)); }
    return out;
  }
  // weaponlessOf(Game, vid): the home duty's WEAPONLESS check —
  // no weapon bonus in either hand and no weapon in the pack.
  function weaponlessOf(vid) {
    try {
      const p = Game.getPerson ? Game.getPerson(vid) : null;
      if (!p) return false;
      const ld = bowLiveData();
      const S = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
      let wb = 0;
      try { wb = (S.equipment && S.equipment.weaponBonusOf) ? (S.equipment.weaponBonusOf(p, ld.defs, 'melee') || 0) + (S.equipment.weaponBonusOf(p, ld.defs, 'ranged') || 0) : 0; } catch (e) {}
      if (wb > 0) return false;
      for (const e of (p.items || [])) {
        const d = defOfId(ld.defs, idOfEntry(e));
        if (d && d.weapon) return false;
      }
      return true;
    } catch (e) { return false; }
  }
  // ownMatsOf(vid): the villager's own carried materials, by the
  // duty's isMatEntry rule (string match, e.material, or a non-gear
  // e.itemId). Pure read.
  function ownMatsOf(vid) {
    const out = {};
    try {
      const p = Game.getPerson ? Game.getPerson(vid) : null;
      if (!p) return out;
      const ld = bowLiveData();
      for (const e of (p.items || [])) {
        let mat = null;
        if (typeof e === 'string') mat = e;
        else if (e && e.material) mat = e.material;
        else if (e && e.itemId) { const d = defOfId(ld.defs, e.itemId); if (!(d && (d.weapon || d.armor))) mat = e.itemId; }
        if (mat) out[mat] = (out[mat] || 0) + ((typeof e === 'string') ? 1 : (e.units || 1));
      }
    } catch (e2) {}
    return out;
  }
  function pileMatsOf() {
    const out = {};
    try {
      const st = (Game.stashState) ? Game.stashState() : null;
      const mats = (st && st.materials) || {};
      for (const k of Object.keys(mats)) out[k] = mats[k] || 0;
    } catch (e) {}
    return out;
  }
  function pileWeaponsOf() {
    const out = {};
    try {
      const st = (Game.stashState) ? Game.stashState() : null;
      const pile = (st && st.weapons) || [];
      for (const e of pile) {
        const id = (e && (e.itemId || e.id)) || null;
        if (id) out[id] = (out[id] || 0) + ((e.units != null ? e.units : 1));
      }
    } catch (e) {}
    return out;
  }
  // bowCensusRow(): the daily village bow census. One row per day;
  // the analyzer walks these in day order and diffs holdings to
  // find acquisitions. Pure reads.
  function bowCensusRow() {
    const day = gday(Game);
    const v = (Game.state || {}).village || {};
    const roster = (v.roster || []).slice();
    const held = {}, stashed = {}, heldSpears = {}, knows = {};
    let nWeaponless = 0, nWeaponlessKnowsBow = 0, nArmedKnowsBow = 0, nKnowsBow = 0;
    let nRangedlessKnowsBow = 0, nSpearArmedKnowsBow = 0;
    let villageBowTotal = 0;
    const wc = v.weaponCraft || {};
    for (const vid of roster) {
      let alive = true;
      try { const p = Game.getPerson ? Game.getPerson(vid) : null; if (p && p.dead) alive = false; } catch (e) {}
      if (!alive) continue;
      const pr = personRanged(vid);
      const union = [];
      for (const id of pr.carried) if (union.indexOf(id) === -1) union.push(id);
      if (pr.equippedVolley && union.indexOf(pr.equippedVolley) === -1) union.push(pr.equippedVolley);
      if (union.length) held[vid] = union;
      if (pr.stashed.length) stashed[vid] = pr.stashed.slice();
      if (pr.spears.length) heldSpears[vid] = pr.spears.slice();
      villageBowTotal += union.length + pr.stashed.length;
      const lv = wc[vid] || {};
      const kb = (lv.bow | 0), kc = (lv.crude_bow | 0);
      knows[vid] = { bow: kb, crude_bow: kc };
      const knowsBow = kb >= 1 || kc >= 1;
      if (knowsBow) nKnowsBow++;
      const wl = weaponlessOf(vid);
      if (wl) {
        nWeaponless++;
        if (knowsBow) nWeaponlessKnowsBow++;
      } else if (knowsBow) nArmedKnowsBow++;
      // BOWCRAFT denominator: ranged-less = no volley weapon
      // equipped and none carried in pack (a spear in the ranged
      // slot is not a volley weapon — pr.carried lists volley defs
      // only, and pr.equippedVolley is the ammo-bearing equipped
      // ranged weapon). The spear-armed subset is the population
      // the old duty skipped that the fix serves.
      const rangedless = !pr.equippedVolley && pr.carried.length === 0;
      if (rangedless && knowsBow) nRangedlessKnowsBow++;
      if (pr.spearInSlot && knowsBow) nSpearArmedKnowsBow++;
    }
    const pileW = pileWeaponsOf();
    const ld = bowLiveData();
    for (const id of Object.keys(pileW)) {
      if (isVolleyDef(defOfId(ld.defs, id))) villageBowTotal += pileW[id];
    }
    return { day: day, roster: roster, held: held, stashed: stashed, heldSpears: heldSpears,
      stashWeapons: pileW, mats: pileMatsOf(), knows: knows,
      nWeaponless: nWeaponless, nWeaponlessKnowsBow: nWeaponlessKnowsBow,
      nArmedKnowsBow: nArmedKnowsBow, nKnowsBow: nKnowsBow,
      nRangedlessKnowsBow: nRangedlessKnowsBow, nSpearArmedKnowsBow: nSpearArmedKnowsBow,
      villageBowTotal: villageBowTotal };
  }
  // departureSourceRow(vid): the bowless-departure row, read AFTER
  // startExpedition returns (what the fighter actually departs
  // holding, after gear-up). The source check mirrors stageBow's
  // honest sources as pure reads: own stashed volley-capable
  // weapon, armory-pile volley-capable weapon, craftable from the
  // shared knowledge record + reachable materials (live recipes).
  function departureSourceRow(vid, plan) {
    const day = gday(Game);
    const pr = personRanged(vid);
    const ld = bowLiveData();
    const hasVolley = !!pr.equippedVolley || pr.carried.some(function (id) { return isVolleyDef(defOfId(ld.defs, id)); });
    const ownStashBow = pr.stashed.length > 0;
    const pileW = pileWeaponsOf();
    let armoryBow = false;
    for (const id of Object.keys(pileW)) {
      if (pileW[id] > 0 && isVolleyDef(defOfId(ld.defs, id))) { armoryBow = true; break; }
    }
    const v = (Game.state || {}).village || {};
    const lv = ((v.weaponCraft || {})[vid]) || {};
    const knowsBow = (lv.bow | 0) >= 1, knowsCrude = (lv.crude_bow | 0) >= 1;
    const craft = craftableBow(knowsBow, knowsCrude, ownMatsOf(vid), pileMatsOf(), ld.recipes);
    return { day: day, vid: vid, wave4Plan: !!plan,
      target: plan ? (plan.target || null) : null, stage: plan ? (plan.stage || null) : null,
      party: plan && plan.party ? plan.party.slice() : [],
      rangedId: pr.equippedVolley || (pr.carried[0] || null),
      equippedSlot: pr.equippedSlot, hasVolley: hasVolley,
      spearInSlot: pr.spearInSlot, carriedRanged: pr.carried.slice(),
      ownStashBow: ownStashBow, armoryBow: armoryBow,
      knowsBow: knowsBow, knowsCrude: knowsCrude,
      craftableBow: craft.bow, craftableCrude: craft.crude, craftableAny: craft.any,
      couldSource: ownStashBow || armoryBow || craft.any };
  }
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
  // ---- BOWSUPPLY: tele + kill-loot wraps ----
  // tele: capture weapon_craft / villager_gear / ammo_craft rows.
  // Installed AFTER VF.install (above), so the call chains through
  // the vetfirst tele wrap — its counts/rows are preserved. Pure
  // record + pass-through, no RNG, no state writes.
  try {
    const origTele = Game.tele;
    if (RECORDER_ON && typeof origTele === 'function') {
      Game.tele = function (type, data) {
        try {
          if (type === 'weapon_craft' || type === 'villager_gear' || type === 'ammo_craft') {
            bowEvents.push({ day: gday(Game), type: type,
              vid: (data && data.vid) || null,
              item: (data && data.item) || null,
              ok: (data && data.ok != null) ? !!data.ok : null,
              via: (data && data.via) || null,
              from: (data && data.from) || null });
          }
        } catch (e) { errors.push('bowcraft-tele-log: ' + String(e.message).slice(0, 80)); }
        return origTele.apply(this, arguments);
      };
    } else if (RECORDER_ON) errors.push('bowcraft-tele-wrap: not a function');
  } catch (e) { errors.push('bowcraft-tele-wrap-install: ' + String(e.message).slice(0, 80)); }
  // villagerKillLoot: every kill-loot drop (bow or not — the
  // analyzer filters to the bow set). Pure record + pass-through.
  try {
    const origKillLoot = Game.villagerKillLoot;
    if (RECORDER_ON && typeof origKillLoot === 'function') {
      Game.villagerKillLoot = function (vid, mdef) {
        const drop = origKillLoot.apply(this, arguments);
        try {
          bowKills.push({ day: gday(Game), vid: vid,
            mid: (mdef && mdef.id) || null, wave: (mdef && mdef.wave) | 0,
            dropId: drop || null });
        } catch (e) { errors.push('bowcraft-killloot-log: ' + String(e.message).slice(0, 80)); }
        return drop;
      };
    } else if (RECORDER_ON) errors.push('bowcraft-killloot-wrap: not a function');
  } catch (e) { errors.push('bowcraft-killloot-wrap-install: ' + String(e.message).slice(0, 80)); }
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
          let expedAfter = false;
          try { const a = this.agencyState ? this.agencyState() : null; expedAfter = !!(a && a.exped && a.exped[vid]); } catch (e2) {}
          if (watch) {
            dawnbidStarts.push({ day: gday(Game), vid: vid,
              directed: !!(opts && opts.tx != null && opts.ty != null),
              target: before ? (before.target || null) : null,
              stage: before ? (before.stage || null) : null,
              expedAfter: expedAfter });
          }
          // BOWSUPPLY: every real departure (an expedition stands
          // after the call) gets its fighter-volley + source row —
          // the post-call read, so gear-up's own-stash/armory
          // takes are already reflected in what they hold.
          if (expedAfter) {
            try { bowDeparts.push(departureSourceRow(vid, before)); }
            catch (e3) { errors.push('bowcraft-depart-log: ' + String(e.message).slice(0, 80)); }
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
            // BOWSUPPLY: daily bow census (end of day, beside the
            // dawnbid census below). Pure reads.
            if (RECORDER_ON) {
              try { bowCensus.push(bowCensusRow()); } catch (e) { errors.push('bowcraft-census: ' + String(e.message).slice(0, 80)); }
            }
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
          }
        } catch (e) { errors.push('snapshot: ' + String(e.message).slice(0, 80)); }
      }
    },
  });

  // BOWSUPPLY: day-1 baseline census (the starting-gear reference)
  // — after setupGame, before runDays.
  if (RECORDER_ON) { try { bowBaseline = bowCensusRow(); } catch (e) { errors.push('bowcraft-baseline: ' + String(e.message).slice(0, 80)); } }

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
    seed: seed, arm: 'bowcraft-confirm-a', run: RUN, mode: MODE, leg: MODE,
    anchorCommit: ANCHOR, standingMarker: STANDING_MARKER,
    brainSha: BRAIN_SHA, carryPresent: CARRY_PRESENT,
    wiringSha: WIRING_SHA, sensePresent: SENSEEXPED_PRESENT,
    gameSha: GAME_SHA, bowopenPresent: BOWOPEN_PRESENT,
    buildSha: BUILD_SHA, bowcraftPresent: BOWCRAFT_PRESENT,
    launchpartyOn: LAUNCHPARTY_ON, senseexpedOn: SENSEEXPED_ON, senseexpedPresent: SENSEEXPED_PRESENT,
    fightally2On: FIGHTALLY2_ON,
    bowopenOn: BOWOPEN_ON, bowcraftOn: BOWCRAFT_ON,
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
    // BOWOPEN is unset on both legs here, so these stay null / 0 —
    // the null itself is the flag-off proof.
    bowOpen: (st.village && st.village.bowOpen) ? JSON.parse(JSON.stringify(st.village.bowOpen)) : null,
    bowOpenStagedVids: (st.village && st.village.bowOpenByVid) ? Object.keys(st.village.bowOpenByVid).length : 0,
    // BOWSUPPLY: the supply-chain recorder's rows (see the
    // recorder block in oneRun). bowBaseline is the day-1 census
    // (starting gear); bowCensus is one row per day.
    bowSupplyRecorder: RECORDER_ON,
    bowBaseline: bowBaseline,
    bowEvents: bowEvents, bowKills: bowKills,
    bowCensus: bowCensus, bowDeparts: bowDeparts,
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
  if (MODE !== 'ctl' && MODE !== 'arm') { console.error('BOWCRAFT STOP: MODE must be ctl or arm, got ' + JSON.stringify(MODE)); process.exit(2); }
  // Two legs, one flag difference: ctl runs BOWCRAFT unset (the old
  // duty, byte-identical); arm runs BOWCRAFT=1 (the fix). BOWOPEN
  // unset AND SPEARGATE unset on both legs — the staging mechanism
  // never fires. Substrate env is otherwise the bowsource leg's, with
  // SENSEEXPED (landed successor) in place of LAUNCHPARTY (dead flag
  // on this master — appears nowhere in src/js).
  if (!BOWCRAFT_PRESENT) { console.error('BOWCRAFT STOP: the bow-craft fix (BOWCRAFT) must be present in src/js/villager-build.js.'); process.exit(2); }
  if (MODE === 'ctl') { console.error('BOWCRAFT STOP: the ctl leg is retired — the duty is always on since the 2026-11-19 turn-on; there is no control leg anymore.'); process.exit(2); }
  if (!SENSEEXPED_PRESENT) { console.error('BOWCRAFT STOP: the launch-preference sense (SENSEEXPED) must be present in src/js/party-wiring.js (substrate).'); process.exit(2); }
  if (!SENSEEXPED_ON) { console.error('BOWCRAFT STOP: SENSEEXPED=1 required (substrate).'); process.exit(2); }
  if (LAUNCHPARTY_ON) { console.error('BOWCRAFT STOP: LAUNCHPARTY must be unset (dead flag on this master; SENSEEXPED is its landed successor).'); process.exit(2); }
  if (BOWOPEN_ON) { console.error('BOWCRAFT STOP: BOWOPEN must be unset on both legs (the staging mechanism never fires).'); process.exit(2); }
  if (process.env.SPEARGATE === '1') { console.error('BOWCRAFT STOP: SPEARGATE must be unset on both legs.'); process.exit(2); }
  if (process.env.VETREENGAGE !== '1') { console.error('BOWCRAFT STOP: VETREENGAGE=1 required (substrate) for every mode.'); process.exit(2); }
  if (process.env.PARTYSIZE4 !== '1') { console.error('BOWCRAFT STOP: PARTYSIZE4=1 required (substrate) for every mode.'); process.exit(2); }
  if (process.env.FLEEREPAIR2 !== '1') { console.error('BOWCRAFT STOP: FLEEREPAIR2=1 required (substrate) for every mode.'); process.exit(2); }
  if (process.env.FIGHTALLY2 !== '1') { console.error('BOWCRAFT STOP: FIGHTALLY2=1 required (substrate — the second seat must be able to join the fight).'); process.exit(2); }
  if (!SEEDS.length) { console.error('BOWCRAFT STOP: SEEDS required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-19', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'bowcraft-confirm-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('BOWCRAFT STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'bowcraft-confirm-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, anchor: (out.anchorCommit || '').slice(0, 12),
      brainSha: out.brainSha, carryPresent: out.carryPresent,
      wiringSha: out.wiringSha, sensePresent: out.sensePresent,
      gameSha: out.gameSha, bowopenPresent: out.bowopenPresent,
      buildSha: out.buildSha, bowcraftPresent: out.bowcraftPresent,
      launchpartyOn: out.launchpartyOn, senseexpedOn: out.senseexpedOn, senseexpedPresent: out.senseexpedPresent,
      fightally2On: out.fightally2On,
      bowopenOn: out.bowopenOn, bowcraftOn: out.bowcraftOn,
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
      bowEvents: out.bowEvents ? out.bowEvents.length : 0,
      bowKills: out.bowKills ? out.bowKills.length : 0,
      bowCensus: out.bowCensus ? out.bowCensus.length : 0,
      bowDeparts: out.bowDeparts ? out.bowDeparts.length : 0,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun, loadWave4Ids: loadWave4Ids, planIsWave4: planIsWave4, deriveLaunchBlock: deriveLaunchBlock, poolReplica: poolReplica, classifySeedPath: classifySeedPath, firstCallerFrame: firstCallerFrame, fightOrigin: fightOrigin, targetPersistence: targetPersistence, SEED_PATHS: SEED_PATHS, SEEDLAND: SEEDLAND, LAUNCHSURVIVE: LAUNCHSURVIVE, installSkipRecorder: installSkipRecorder, commitKindOf: commitKindOf, recoverMHpStart: recoverMHpStart, RANGED_FROZEN: RANGED_FROZEN, BOW_RECIPE_FROZEN: BOW_RECIPE_FROZEN, defOfId: defOfId, isVolleyDef: isVolleyDef, isRangedDef: isRangedDef, hasMats: hasMats, craftableBow: craftableBow };
