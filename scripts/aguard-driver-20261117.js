// aguard-driver-20261117.js — JUDGED driver, arm sim-aguard-a
// (FICTION GUARD: the firstNameOf shared guard (finding #2509) —
// guard-on vs guard-off on identical seeds, same band/flags).
// A copy of scripts/aguard-driver-20261117.js (itself a copy of scripts/homebodyvoice-driver-20261117.js, itself a copy of
// scripts/profilegate-driver-20261117.js — the vetfirst T-class
// instrument: v4seeds with seed-path classification, v4departs,
// v4gates, v4encounters with origin, dawnbidScores / dawnbidDeparts /
// dawnbidCensus / dawnbidStarts, companionPool with the members
// extension, plus the agencyTick skip-reason recorder (launchdefSkips)
// and the commitKind + monotonic seq on dawnbidDeparts rows). Deltas
// from the homebodyvoice copy (all recorded in the prereg):
//   1. Names: aguard-a / perseed-aguard-a-<leg> /
//      aguard-a-s<seed>-aguard-a-<leg>.json; loadGame
//      mode 'aguard-' + MODE. arm field 'aguard-a'.
//   2. Say-wrap ALSO captures every line matching the bare-"A"
//      detector (BARE_A_RE) into bareALines — the detector covers
//      every bare-"A" position in both voice lines (subject, object,
//      second clause); real first names are never "A", so a match
//      can only be a bare-"A" name. Keeps the homebodyLines capture
//      matching /never leaves Haven/ (both voice lines) and the
//      holderLines capture matching /stays home\./, so voice-line
//      counts are comparable across legs. The profilegate SAY_RE
//      veteran filter would NOT capture either line.
//   3. Score wrap ALSO records a blockedPicks row per committed
//      party_launch pick: {day, part, vid, companion, maxD, holderMaxD,
//      holderFirst, compFirst} read from Game.vbrainCommit(vid) +
//      Game.npcMaxDist(companion) + Game.npcMaxDist(vid) +
//      Game.displayName — so every line firing can be matched to the
//      exact blocked pick (by day + names).
//   4. Legs: TWO legs (on: guard in place; off: guard temporarily
//      reverted — firstNameOf restored to its base text, byte-restored
//      after, sha256-verified — the holdervoice-b no-line control
//      pattern). Both legs VETREENGAGE=1, PROFILEGATE=1, recorder ON.
//      MODE must be 'on' or 'off'.
//   5. Skip recorder installed with mode 'on' as in the homebodyvoice
//      copy (the PROFILEGATE bypass is NOT landed in this base — it is
//      re-applied in the worktree only for measurement, env-gated, and
//      reverted before commit; the recorder mode is about the depart
//      bypass, which IS landed).
// Policy: competent verbatim (scripts/policies/competent.js), 150d
// death-aware. Two legs on the frozen band, differing ONLY by the
// firstNameOf guard in src/.
//   on  : VETREENGAGE=1, PROFILEGATE=1,    recorder ON  (guard on)
//   off : VETREENGAGE=1, PROFILEGATE=1,    recorder ON  (guard off)
// All recorder wraps are pure reads plus writes to driver-local
// arrays — no game-state writes, no RNG. PROFILEGATE_RECORDER=off
// skips installing the wraps (determinism leg D2).
// Usage:
//   VETREENGAGE=1 PROFILEGATE=1 MODE=on OUTDIR=perseed-aguard-a-on SEEDS=103461,103462 RUN=aguard-a node scripts/aguard-driver-20261117.js
//   VETREENGAGE=1 PROFILEGATE=1 MODE=off OUTDIR=perseed-aguard-a-off SEEDS=103461,103462 RUN=aguard-a node scripts/aguard-driver-20261117.js
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
const RUN = process.env.RUN || 'aguard-a';
const MODE = process.env.MODE || 'on';
const OUTDIR = process.env.OUTDIR || ('perseed-aguard-a-' + MODE);
const RECORDER_ON = process.env.PROFILEGATE_RECORDER !== 'off';
// SEEDLAND (sim-seedland-b): the fieldFight watch is wave >= 4
// (wave-5 encounters are recorded in v4encounters alongside wave-4)
// and each encounter row carries `origin`, read from the call stack
// at the wrap with the gatelever driver's fightOrigin taxonomy.
// SEEDLAND semantics hard-on in this driver (SEEDLAND = true below),
// per prereg. Both additions are pure reads (no RNG, no game-state writes).
// LAUNCHSURVIVE (sim-launchsurvive-a): when LAUNCHSURVIVE=1 the
// per-day launch tracker runs (v4launchTrack rows — holder /
// companion nodes, last-known tile, target persistence; see
// recordLaunchTrack below) AND the SEEDLAND semantics apply even
// when SEEDLAND is unset, so a tracker run can never be
// misconfigured into an unjudgeable corpus. Flag unset = no tracker
// rows at all (no `v4launchTrack` key on the output).
const LAUNCHSURVIVE = process.env.LAUNCHSURVIVE === '1';
const SEEDLAND = true; // PROFILEGATE: SEEDLAND semantics hard-on (wave>=4 encounters + origin), per prereg.

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
      if (line.indexOf('aguard-driver-20261117.js') !== -1) continue;
      if (line.indexOf('aguard-caller') !== -1) continue;
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
      if (file.indexOf('aguard-driver-20261117.js') !== -1) continue;
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
// PROFILEGATE (sim-profilegate-b): the replica mirrors the leg's gate —
// when PROFILEGATE=1 the profile first-fail is skipped, exactly as the
// widened findCompanion twins skip it. Read live per call (not at module
// load) so one required module serves both legs across child processes.
function poolReplica(Game, vid) {
  const profileGateOpen = (typeof process !== 'undefined' && process.env && process.env.PROFILEGATE === '1');
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
      else if (!profileGateOpen && prof !== 'wanderer' && prof !== 'explorer') { counts.notRanger++; firstFail = 'notRanger'; }
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
      profileGateOpen: profileGateOpen,
      counts: counts, fails: fails, eligible: eligible, rankedOrder: rankedOrder, rankedPick: rankedPick, rankedVia: rankedVia, members: members };
  } catch (e) { return null; }
}

const SAY_RE = /veteran|blooded|scarred|\belder\b|pack-leader|put down|killing blow|veteran kill|remember the name|MIRROR DRAFT|PRODUCERS|FINAL DRAFT|blood your fighters/i;
// BARE_A_RE (sim-aguard-a): every bare-"A" position in the two voice
// lines — "A asked …" / "A meant …" (subject), "with A —" (object),
// "but A never …" / "so A stays …" (second clause). Real first
// names are never "A" (characterGen.json), so a match is a bare-"A"
// name, never a false positive on a real name.
const BARE_A_RE = /(^A (asked|meant) )|( with A —)|(but A never)|(so A stays)/;
const HOMEBODY_RE = /never leaves Haven/; // both voice lines match this (companion + holder)
const HOLDER_RE = /stays home\./; // the holder-voice line's distinctive ending

// PROFILEGATE: monotonic row sequence (lets the analyzer join a launch
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

// PROFILEGATE: the agencyTick skip-reason recorder, copied verbatim
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
  } catch (e) { errors.push('aguard-skip-exec-install: ' + String(e.message).slice(0, 80)); }
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
        } catch (e) { errors.push('aguard-skip-snapshot: ' + String(e.message).slice(0, 80)); }
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
          } catch (e) { errors.push('aguard-skip-log: ' + String(e.message).slice(0, 80)); }
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
  const { Game } = await loadGame({ seed: seed, mode: 'aguard-' + MODE, fullTelemetry: false });
  const vetSays = [];
  const homebodyLines = []; // every Game.say line matching HOMEBODY_RE, with day (both voice lines)
  const holderLines = []; // every Game.say line matching HOLDER_RE, with day (holder line only)
  const bareALines = []; // every Game.say line matching BARE_A_RE, with day (expect 0 on both legs)
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
          if (HOMEBODY_RE.test(arg)) homebodyLines.push({ day: gday(Game), line: String(arg).slice(0, 600) });
          if (HOLDER_RE.test(arg)) holderLines.push({ day: gday(Game), line: String(arg).slice(0, 600) });
          if (BARE_A_RE.test(arg)) bareALines.push({ day: gday(Game), line: String(arg).slice(0, 600) });
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
  const blockedPicks = []; // one row per committed party_launch pick, with the companion's maxD + the holder's holderMaxD
  const dawnbidDeparts = [];
  const dawnbidCensus = [];
  const dawnbidStarts = [];
  // ---- PROFILEGATE: skip-reason rows ----
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
          if (w >= 4 && mdef && mdef.id) { // PROFILEGATE: gate stage covers wave-4+ (was wave == 4)
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
          const st = (new Error('aguard-caller')).stack || '';
          seedCaller = firstCallerFrame(st);
          seedPath = classifySeedPath(outcome || null, st);
        } catch (e) { seedPath = 'unknown-stack-error'; }
        const ret = origSeed.apply(this, arguments);
        try {
          const w = waveOf(mdef);
          if (w >= 3 && mdef && mdef.id) {
            const plan = planOf(vid);
            v4seeds.push({ day: gday(Game), vid: vid, mid: mdef.id, wave: w, outcome: outcome || null,
              path: seedPath, caller: seedCaller,
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
          // PROFILEGATE: SEEDLAND hard-on — every encounter row
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
            // AGUARD (from holdervoice): one row per committed party_launch pick,
            // with the companion's max range — so every fiction-line
            // firing can be matched to the exact blocked pick that
            // caused it. Pure reads.
            try {
              if (commit && commit.winPlanAction === 'party_launch' && commit.companion) {
                var _hbMaxD = null;
                try { _hbMaxD = (typeof this.npcMaxDist === 'function') ? this.npcMaxDist(commit.companion) : null; } catch (e3) {}
                var _hdMaxD = null;
                try { _hdMaxD = (typeof this.npcMaxDist === 'function') ? this.npcMaxDist(vid) : null; } catch (e3b) {}
                var _hbHF = null, _hbCF = null;
                try { _hbHF = (typeof this.displayName === 'function') ? String(this.displayName(vid) || '').split(' ')[0] : null; } catch (e4) {}
                try { _hbCF = (typeof this.displayName === 'function') ? String(this.displayName(commit.companion) || '').split(' ')[0] : null; } catch (e5) {}
                blockedPicks.push({ day: gday(Game), part: (Game.dayPart | 0), vid: vid,
                  companion: commit.companion, maxD: _hbMaxD, holderMaxD: _hdMaxD,
                  holderFirst: _hbHF || vid, compFirst: _hbCF || commit.companion });
              }
            } catch (e) { errors.push('aguard-blockedpick: ' + String(e.message).slice(0, 80)); }
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
                    profileGateOpen: !!pool.profileGateOpen,
                    haven: pool.haven, rosterN: pool.rosterN,
                    counts: pool.counts, fails: pool.fails,
                    eligible: pool.eligible.slice(),
                    rankedOrder: pool.rankedOrder, rankedPick: pool.rankedPick,
                    rankedVia: pool.rankedVia, bidCompanion: bidCompanion,
                    agree: bidCompanion == null ? null : (pool.rankedPick === bidCompanion),
                    members: pool.members });
                } else {
                  errors.push('aguard-replica-null: day ' + gday(Game) + ' vid ' + vid);
                }
              }
            } catch (e) { errors.push('aguard-log: ' + String(e.message).slice(0, 80)); }
          }
        } catch (e) { errors.push('dawnbid-score-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (!RECORDER_ON) { /* wraps off — determinism leg D2 */ }
    else errors.push('vbrainScorePick-wrap: not a function');
  } catch (e) { errors.push('vbrainScorePick-wrap-install: ' + String(e.message).slice(0, 80)); }
  // PROFILEGATE: install the agencyTick skip-reason recorder (shared
  // game). Skipped whole when the recorder is off (D2). Mode 'on':
  // the PROFILEGATE bypass is landed in this base.
  let skipRec = null;
  if (RECORDER_ON) { try { skipRec = installSkipRecorder(Game, 'on', errors, launchdefSkips); } catch (e) { errors.push('aguard-skip-install: ' + String(e.message).slice(0, 80)); } }

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
    seed: seed, arm: 'aguard-a', run: RUN, mode: MODE, leg: MODE,
    anchorCommit: ANCHOR, standingMarker: STANDING_MARKER,
    recorderOn: RECORDER_ON,
    policySha: POLICY_SHA, policy: 'competent',
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    ready4: ready4, ready5: ready5, ladderVets4: ladderVets4,
    winPlanStats: winPlanStats,
    vetSays: vetSays, sayCount: sayCount,
    homebodyLines: homebodyLines, holderLines: holderLines, bareALines: bareALines, blockedPicks: blockedPicks,
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
  if (MODE !== 'on' && MODE !== 'off') { console.error('AGUARD STOP: MODE must be on or off, got ' + JSON.stringify(MODE)); process.exit(2); }
  if (!SEEDS.length) { console.error('AGUARD STOP: SEEDS required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-17', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'aguard-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('AGUARD STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'aguard-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
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
      homebodyLines: out.homebodyLines.length,
      holderLines: out.holderLines.length,
      bareALines: out.bareALines.length,
      blockedPicks: out.blockedPicks.length,
      deaths: out.deaths.length,
      v4seeds: out.v4seeds.length, v4departs: out.v4departs.length,
      v4gates: out.v4gates.length, v4encounters: out.v4encounters.length,
      dawnbidScores: out.dawnbidScores.length, dawnbidDeparts: out.dawnbidDeparts.length,
      dawnbidCensus: out.dawnbidCensus.length, dawnbidStarts: out.dawnbidStarts.length,
      launchdefSkips: out.launchdefSkips.length,
      companionPool: out.companionPool.length,
      launchTrack: out.v4launchTrack ? out.v4launchTrack.length : 0,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun, loadWave4Ids: loadWave4Ids, planIsWave4: planIsWave4, deriveLaunchBlock: deriveLaunchBlock, poolReplica: poolReplica, classifySeedPath: classifySeedPath, firstCallerFrame: firstCallerFrame, fightOrigin: fightOrigin, targetPersistence: targetPersistence, SEED_PATHS: SEED_PATHS, SEEDLAND: SEEDLAND, LAUNCHSURVIVE: LAUNCHSURVIVE, installSkipRecorder: installSkipRecorder, commitKindOf: commitKindOf };
