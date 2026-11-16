// killfail-driver-20261116.js — JUDGED driver, arm sim-killfail-a
// (DIAG: why launched wave-4 parties get 0 kills — decompose EVERY
// launched wave-4+ party fight: party size at contact, trick known,
// ammo state of each ranged carrier, gear, HP at entry, outcome,
// damage dealt, rounds fought; rank the failure modes).
// The rumorplan driver adapted, not rebuilt — same vetfirst T-class
// instrument, same WAVE-4 PER-ENCOUNTER RECORDER, same DAWNBID
// CAPTURE, same SEEDATTACH CAPTURE, same RUMORPLAN CAPTURE (launch
// rows + target diffs), PLUS the KILLFAIL CAPTURE: one row per
// fieldFight vs a wave-4 or wave-5 monster, with the pre-fight
// snapshot (ammo class + armor P + weapon bonus + HP at entry, for
// the fighter and each ally at contact) taken BEFORE the call and
// the close fields (outcome, rounds, mDealt, allyDealt, vTaken,
// vHpLeft, mHpLeft, fleeHpFrac, volley, log) taken from the returned
// record AFTER the call. The ammo classifier (classifyFighter) is
// copied VERBATIM from the ammocensus driver — no re-derivation.
// Policy: competent verbatim OR tableseat-nowait, selected by LEG
// env (default tableseat-nowait for this arm); 150d death-aware.
// Env for a REAL tableseat-nowait run: TABLESEATNOWAIT=1
// LEANLINKRESCUE=1 (default env collapses to competent — see the
// 0446Z coordinator evidence). All recorder wraps are pure reads
// plus writes to driver-local arrays — no game-state writes, no RNG.
// KILLFAIL_RECORDER=off skips installing the wraps (determinism leg
// D2). Errors are REPORTED into instrumentErrors (named, not swallowed).
// RECORDER ROWS (per seed): every rumorplan row (v4encounters /
// v4gates / v4seeds / v4departs, dawnbidScores / dawnbidDeparts /
// dawnbidCensus / dawnbidStarts, seedattachBounces /
// seedattachCreations / seedattachLaunches / seedattachCensus,
// rumorplanLaunches / rumorplanTargetDiffs) PLUS killfailFights:
// one row per fieldFight vs a wave-4/5 monster (see the frozen fight
// fields in evidence/2026-11-16/sim-killfail-a-prereg.md). The
// analyzer joins killfailFights to rumorplanLaunches via trip
// windows; the driver records the fight, the analyzer does the join.
// Usage:
//   TABLESEATNOWAIT=1 LEANLINKRESCUE=1 LEG=tableseat-nowait OUTDIR=perseed-killfail-a-main SEEDS=102041,102042 RUN=killfail-a node scripts/killfail-driver-20261116.js
//   TABLESEATNOWAIT=1 LEANLINKRESCUE=1 LEG=tableseat-nowait OUTDIR=perseed-killfail-a-replication SEEDS=102041,102042 RUN=killfail-a node scripts/killfail-driver-20261116.js
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));
const { tableseatNowait } = require(path.join(REPO, 'scripts', 'policies', 'tableseat-nowait'));
const VF = require(path.join(REPO, 'scripts', 'vetfirst-instrument-20261111'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'killfail-a';
const LEG = process.env.LEG || 'tableseat-nowait';
const OUTDIR = process.env.OUTDIR || ('perseed-killfail-a-' + LEG);
const RECORDER_ON = process.env.KILLFAIL_RECORDER !== 'off';

if (LEG !== 'competent' && LEG !== 'tableseat-nowait') { console.error('KILLFAIL STOP: LEG must be competent|tableseat-nowait, got ' + JSON.stringify(LEG)); process.exit(2); }
const POLICY = LEG === 'tableseat-nowait' ? tableseatNowait : competent;
const POLICY_FILE = LEG === 'tableseat-nowait' ? 'tableseat-nowait.js' : 'competent.js';

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
// Wave-5 id set (frozen list from src/data/monsters.json, wave 5).
const W5_IDS_FROZEN = ['cancellation', 'editor', 'finale', 'finale_crew', 'finale_opening', 'network_note', 'nielsen', 'rerun', 'spoiler', 'timeslot'];
function loadWave5Ids() {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    return list.filter(function (m) { return m.wave === 5; }).map(function (m) { return m.id; }).sort();
  } catch (e) { return W5_IDS_FROZEN.slice().sort(); }
}

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
let POLICY_SHA = 'unknown';
try { POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', POLICY_FILE), 'utf8')).digest('hex').slice(0, 12); } catch (e) { console.error('KILLFAIL STOP: cannot read policy file ' + POLICY_FILE + ': ' + String(e.message)); process.exit(2); }
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

// ---- ammo census classifier (pure reads) ----
// itemDef lookup over Game.data.items.
function defOf(Game, id) {
  try {
    const items = (Game.data && Game.data.items) || [];
    for (let i = 0; i < items.length; i++) if (items[i] && items[i].id === id) return items[i];
  } catch (e) {}
  return null;
}
function entryId(ent) {
  if (typeof ent === 'string') return ent;
  if (!ent) return null;
  return ent.itemId || ent.id || null;
}
function entryMaterial(ent) {
  if (!ent || typeof ent === 'string') return null;
  return ent.material || null;
}
function entryUnits(ent) {
  if (!ent) return 0;
  if (typeof ent === 'string') return 1;
  return ent.units || 1;
}
// All ammo ids known to the data: every weapon.ammo value plus every
// def with class 'ammo'.
function ammoIdSet(Game) {
  const set = {};
  try {
    const items = (Game.data && Game.data.items) || [];
    for (let i = 0; i < items.length; i++) {
      const d = items[i];
      if (!d) continue;
      if (d.weapon && d.weapon.ammo) set[d.weapon.ammo] = true;
      if (d.class === 'ammo') set[d.id] = true;
    }
  } catch (e) {}
  return set;
}
function countAmmo(Game, person, ammoId) {
  let n = 0;
  try {
    const items = person.items || [];
    for (let i = 0; i < items.length; i++) {
      const ent = items[i];
      if (entryId(ent) === ammoId || entryMaterial(ent) === ammoId) n += entryUnits(ent);
    }
  } catch (e) {}
  return n;
}
// gearOf replica (win-plan.js): armed iff melee weapon bonus > 0 OR
// carries any item with def.weapon. weaponBonusOf with no slot reads
// the MELEE slot only — replicated exactly.
function gateArmedOf(Game, person) {
  try {
    const eq = (person && person.equipped) || {};
    const meleeEnt = eq.melee || eq.weapon || null;
    let weaponB = 0;
    if (meleeEnt) {
      const d = defOf(Game, entryId(meleeEnt));
      weaponB = (d && d.weapon && d.weapon.bonus) || 0;
    }
    let carriesWeapon = false;
    const items = person.items || [];
    for (let i = 0; i < items.length; i++) {
      const d = defOf(Game, entryId(items[i]));
      if (d && d.weapon) { carriesWeapon = true; break; }
    }
    return { armed: !!(weaponB > 0 || carriesWeapon), weaponB: weaponB, carriesWeapon: carriesWeapon };
  } catch (e) { return { armed: false, weaponB: 0, carriesWeapon: false, error: String(e.message).slice(0, 60) }; }
}

// classifyFighter(Game, vid): the frozen classification. Pure reads.
// Returns {vid, name, class, gateArmed, effectivelyArmed,
// rangedWeapon, ammoNeed, ammoN, otherAmmoN, meleeWeapon,
// spearInRangedSlot, carriesRangedUnequipped, error}.
function classifyFighter(Game, vid) {
  const out = { vid: vid, name: null, class: 'unclassified', gateArmed: false,
    effectivelyArmed: false, rangedWeapon: null, ammoNeed: null, ammoN: 0,
    otherAmmoN: 0, meleeWeapon: null, spearInRangedSlot: false,
    carriesRangedUnequipped: null, error: null };
  try {
    let person = null;
    try { if (Game.getPerson) person = Game.getPerson(vid); } catch (e) {}
    if (!person) { try { if (Game.vpOf) person = Game.vpOf(vid); } catch (e) {} }
    if (!person) { out.error = 'no-person'; return out; }
    out.name = person.name || person.displayName || null;
    const eq = person.equipped || {};
    const ammoIds = ammoIdSet(Game);
    // Equipped ranged entry: a REAL ranged weapon has weapon.type
    // 'ranged' AND a weapon.ammo field. A spear in the ranged slot
    // (melee type, range 2, no ammo) is recorded, not counted.
    let rangedEnt = eq.ranged || null;
    let rangedDef = rangedEnt ? defOf(Game, entryId(rangedEnt)) : null;
    if (rangedDef && rangedDef.weapon && rangedDef.weapon.type === 'ranged' && rangedDef.weapon.ammo) {
      out.rangedWeapon = rangedDef.id;
      out.ammoNeed = rangedDef.weapon.ammo;
      out.ammoN = countAmmo(Game, person, rangedDef.weapon.ammo);
    } else if (rangedDef && rangedDef.weapon) {
      out.spearInRangedSlot = true;
      out.meleeWeapon = rangedDef.id;
    } else if (rangedEnt) {
      out.error = 'ranged-entry-no-def';
    }
    // Melee: equipped melee slot, else any carried melee-type weapon.
    if (!out.meleeWeapon) {
      const meleeEnt = eq.melee || eq.weapon || null;
      const meleeDef = meleeEnt ? defOf(Game, entryId(meleeEnt)) : null;
      if (meleeDef && meleeDef.weapon) out.meleeWeapon = meleeDef.id;
    }
    if (!out.meleeWeapon) {
      const items = person.items || [];
      for (let i = 0; i < items.length; i++) {
        const d = defOf(Game, entryId(items[i]));
        if (d && d.weapon && d.weapon.type !== 'ranged') { out.meleeWeapon = d.id; break; }
      }
    }
    // Carried-but-unequipped ranged weapon (gate counts pack weapons
    // as armed; the volley cannot fire them).
    const items = person.items || [];
    for (let i = 0; i < items.length; i++) {
      const d = defOf(Game, entryId(items[i]));
      if (d && d.weapon && d.weapon.type === 'ranged' && d.weapon.ammo && d.id !== out.rangedWeapon) {
        out.carriesRangedUnequipped = { id: d.id, ammoNeed: d.weapon.ammo, ammoN: countAmmo(Game, person, d.weapon.ammo) };
        break;
      }
    }
    // Other ammo on hand (the wrong-ammo shape): units of any ammo
    // id/class that is NOT the equipped weapon's need.
    let other = 0;
    for (let i = 0; i < items.length; i++) {
      const ent = items[i];
      const eid = entryId(ent);
      const mat = entryMaterial(ent);
      const d = eid ? defOf(Game, eid) : null;
      const isAmmo = !!(ammoIds[eid] || ammoIds[mat] || (d && d.class === 'ammo'));
      if (!isAmmo) continue;
      if (eid === out.ammoNeed || mat === out.ammoNeed) continue;
      other += entryUnits(ent);
    }
    out.otherAmmoN = other;
    // Gate-armed (replica) and effectively-armed (ammo-aware).
    const g = gateArmedOf(Game, person);
    out.gateArmed = !!g.armed;
    if (g.error) out.error = out.error || g.error;
    out.effectivelyArmed = !!(out.meleeWeapon || (out.rangedWeapon && out.ammoN >= 1));
    // Class.
    if (out.rangedWeapon) {
      out.class = out.ammoN >= 1 ? 'armed-with-ammo' : 'armed-no-ammo';
    } else {
      out.class = 'unarmed';
    }
    if (out.error) out.class = 'unclassified';
    return out;
  } catch (e) {
    out.error = String(e.message).slice(0, 80);
    out.class = 'unclassified';
    return out;
  }
}


// hpAtEntry(Game, vid): fighter HP at contact, pure reads — the
// village health map first, then the person record, then the
// scholar record. Null when no read lands (the analyzer names the
// fight unclassified rather than inventing a number).
function hpAtEntry(Game, vid) {
  try { const h = (((Game.state || {}).village || {}).health || {})[vid]; if (h !== undefined && h !== null) return h | 0; } catch (e) {}
  try { const p = Game.getPerson ? Game.getPerson(vid) : null; if (p) { if (p.hp != null) return p.hp | 0; if (p.health != null) return p.health | 0; } } catch (e) {}
  try { const s = (Game.state || {}).scholar || {}; if (vid === 'scholar' && s.hp != null) return s.hp | 0; } catch (e) {}
  return null;
}
// memberSnap(Game, vid): the frozen per-person fight record — the
// ammocensus ammo class + armor P / weapon bonus (gearOfReplica) +
// HP at entry. Pure reads.
function memberSnap(Game, vid) {
  const c = classifyFighter(Game, vid);
  try { const g = gearOfReplica(Game, vid); c.armorP = g.armorP; c.weaponB = g.weaponB; } catch (e) { c.armorP = null; c.weaponB = null; }
  c.hpEntry = hpAtEntry(Game, vid);
  return c;
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

const SAY_RE = /veteran|blooded|scarred|\belder\b|pack-leader|put down|killing blow|veteran kill|remember the name|MIRROR DRAFT|PRODUCERS|FINAL DRAFT|blood your fighters/i;

async function oneRun(seed) {
  const policy = POLICY;
  const { Game } = await loadGame({ seed: seed, mode: 'killfail-' + LEG, fullTelemetry: false });
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
  // ---- DAWNBID CAPTURE (inherited) ----
  const dawnbidScores = [];
  const dawnbidDeparts = [];
  const dawnbidCensus = [];
  const dawnbidStarts = [];
  // ---- SEEDATTACH CAPTURE ----
  const seedattachBounces = [];
  const seedattachCreations = [];
  const seedattachLaunches = [];
  const seedattachCensus = [];
  // ---- RUMORPLAN CAPTURE ----
  // rumorplanLaunches: one row PER PARTICIPANT per depart call that
  // returns 'launch' (inviter + each companion), with the
  // participant's plan stage/target/needWave/node/party BEFORE and
  // AFTER the call — the before-state proves whether a rumor-born
  // plan acquired its target before launching. rumorplanTargetDiffs:
  // day-over-day target changes found by the daily census diff
  // (the companion copy win-plan.js:439 sets targets without a seed
  // call, so bounces alone cannot name every acquisition day).
  // prevPlanTarget: driver-local vid -> {target, stage} map for the
  // diff; pure reads + driver-local writes only.
  const rumorplanLaunches = [];
  const rumorplanTargetDiffs = [];
  const killfailFights = [];
  const prevPlanTarget = {};
  const lastGateByVid = {};
  // engagementReads(Game, vid): the winPlanHavenTick engagement inputs
  // as pure reads — species the villager personally fought
  // (know.fought) and the village's total slain count (fire talk).
  function engagementReads(Game, vid) {
    let fought = [];
    try {
      const a = Game.agencyState ? Game.agencyState() : null;
      const kn = a && a.know ? a.know[vid] : null;
      if (kn && kn.fought) fought = kn.fought.slice(0, 20);
    } catch (e) {}
    let slainTotal = 0;
    try {
      const sl = (Game.state && Game.state.villageSlain) || {};
      for (const k in sl) slainTotal += (sl[k] | 0);
    } catch (e) {}
    return { fought: fought, villageSlainTotal: slainTotal };
  }
  // creatorSite(): first stack frame outside this driver file, as
  // basename:line — names the code site that created a plan via a
  // lazy winPlanOf read. Captured ONLY on creation transitions.
  function creatorSite() {
    try {
      const stack = (new Error().stack || '').split('\n').slice(2);
      for (const line of stack) {
        if (line.indexOf('rumorplan-driver') !== -1) continue;
        const m = line.match(/([A-Za-z0-9_.-]+\.js):(\d+)/);
        if (m) return m[1] + ':' + m[2];
      }
    } catch (e) {}
    return null;
  }
  function planSnap(p) {
    if (!p) return null;
    return { stage: p.stage || null, target: p.target || null,
      needWave: (p.needWave != null ? p.needWave : null),
      node: p.node ? { nx: p.node.nx, ny: p.node.ny } : null,
      sinceDay: (p.sinceDay != null ? p.sinceDay : null),
      party: (p.party || []).slice() };
  }
  // snapAllPlans(): shallow snapshot of the whole winPlan map
  // (vid -> planSnap) — taken BEFORE a depart call so every
  // participant's before-state is known even though the companion
  // is picked dynamically inside the call (findCompanion).
  function snapAllPlans() {
    const out = {};
    try {
      const wp = ((Game.state || {}).village || {}).winPlan || {};
      for (const vid of Object.keys(wp)) out[vid] = planSnap(wp[vid]);
    } catch (e) { errors.push('rumorplan-snapall: ' + String(e.message).slice(0, 80)); }
    return out;
  }
  // recordRumorLaunch(beforeMap, expedBefore, inviterVid, pathName,
  // extraCompanions): after a depart call returned 'launch', one
  // rumorplan row per participant (inviter + each companion in the
  // post-call party or the dawn commit), with before/after plan
  // snapshots AND before/after expedition states. A row is recorded
  // ONLY when the call STARTED the inviter's expedition
  // (exped false -> true) or the expedition state could not be read
  // (fail-open, flagged 'unknown'): both depart paths return
  // 'launch' again on later days for a villager already out
  // (villager-brain.js early return; launchParty's exped check
  // passes when already exped), and counting those repeats as
  // launches would inflate the launch share. Pure reads.
  function expedMap() {
    const out = {};
    try {
      const a = Game.agencyState ? Game.agencyState() : null;
      const ex = (a && a.exped) || {};
      for (const vid of Object.keys(ex)) if (ex[vid]) out[vid] = true;
    } catch (e) {}
    return out;
  }
  function recordRumorLaunch(beforeMap, expedBefore, inviterVid, pathName, extraCompanions) {
    try {
      const expedAfter = expedMap();
      const inviterStarted = !expedBefore[inviterVid] && !!expedAfter[inviterVid];
      const expedUnreadable = Object.keys(expedBefore).length === 0 && Object.keys(expedAfter).length === 0;
      if (!inviterStarted && !expedUnreadable) return;
      const afterPlan = planOf(inviterVid);
      const parts = [inviterVid];
      const seen = {};
      seen[inviterVid] = true;
      if (afterPlan && afterPlan.party) {
        for (const c of afterPlan.party) if (c && !seen[c]) { seen[c] = true; parts.push(c); }
      }
      for (const c of (extraCompanions || [])) if (c && !seen[c]) { seen[c] = true; parts.push(c); }
      for (const pid of parts) {
        const before = beforeMap[pid] || null;
        const after = planSnap(planOf(pid));
        // Skip participants with no plan on either side of the call
        // (a launch without a plan belongs to no plan instance).
        if (!before && !after) continue;
        rumorplanLaunches.push({ day: gday(Game), vid: pid,
          role: pid === inviterVid ? 'inviter' : 'companion',
          path: pathName, inviter: inviterVid,
          companion: pid === inviterVid ? ((after && after.party && after.party[0]) || null) : null,
          expedStart: expedUnreadable ? 'unknown' : (inviterStarted ? 'yes' : 'no'),
          expedBefore: !!expedBefore[pid], expedAfter: !!expedAfter[pid],
          stageBefore: before ? before.stage : null,
          targetBefore: before ? before.target : null,
          needWaveBefore: before ? before.needWave : null,
          nodeBefore: before ? before.node : null,
          partyBefore: before ? before.party : [],
          stageAfter: after ? after.stage : null,
          targetAfter: after ? after.target : null,
          needWaveAfter: after ? after.needWave : null,
          nodeAfter: after ? after.node : null,
          partyAfter: after ? after.party : [] });
      }
    } catch (e) { errors.push('rumorplan-launch-log: ' + String(e.message).slice(0, 80)); }
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
        // SEEDATTACH: BEFORE-state first — the dawnbid recorder kept
        // after-state only, which cannot prove a bounce.
        let before = null;
        try { before = planSnap(planOf(vid)); } catch (e) { errors.push('seedattach-seed-before: ' + String(e.message).slice(0, 80)); }
        const ret = origSeed.apply(this, arguments);
        try {
          const w = waveOf(mdef);
          if (w >= 3 && mdef && mdef.id) {
            const plan = planOf(vid);
            v4seeds.push({ day: gday(Game), vid: vid, mid: mdef.id, wave: w, outcome: outcome || null,
              stageAfter: plan ? plan.stage : null, target: plan ? plan.target : null,
              node: plan && plan.node ? { nx: plan.node.nx, ny: plan.node.ny } : null });
            const after = planSnap(plan);
            const foughtAtBounce = engagementReads(Game, vid).fought;
            seedattachBounces.push({ day: gday(Game), vid: vid, mid: mdef.id, wave: w, outcome: outcome || null,
              stageBefore: before ? before.stage : null, targetBefore: before ? before.target : null,
              nodeBefore: before ? before.node : null,
              stageAfter: after ? after.stage : null, targetAfter: after ? after.target : null,
              nodeAfter: after ? after.node : null,
              planSinceDay: after ? after.sinceDay : (before ? before.sinceDay : null),
              planParty: after ? after.party : (before ? before.party : []),
              foughtAtBounce: foughtAtBounce });
          }
        } catch (e) { errors.push('v4seed-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('winPlanSeedFromFight-wrap: not a function');
  } catch (e) { errors.push('winPlanSeedFromFight-wrap-install: ' + String(e.message).slice(0, 80)); }
  // ---- SEEDATTACH: plan-creation capture ----
  // Wraps winPlanOf (lazy create — also called as a read by the brain)
  // and winPlanHavenTick (engagement creation). Records ONLY the
  // null → exists transition, with the creator site + engagement reads
  // at that moment. Pure reads + driver-local writes.
  try {
    const origPlanOf = Game.winPlanOf;
    if (RECORDER_ON && typeof origPlanOf === 'function') {
      Game.winPlanOf = function (vid) {
        let before = null;
        try { before = planOf(vid); } catch (e) { errors.push('seedattach-planof-before: ' + String(e.message).slice(0, 80)); }
        const ret = origPlanOf.apply(this, arguments);
        try {
          if (!before && ret) {
            const eng = engagementReads(Game, vid);
            seedattachCreations.push({ day: gday(Game), vid: vid, createdBy: 'winPlanOf',
              creatorSite: creatorSite(), fought: eng.fought, villageSlainTotal: eng.villageSlainTotal,
              stageAtCreation: ret.stage || null, targetAtCreation: ret.target || null });
          }
        } catch (e) { errors.push('seedattach-planof-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('winPlanOf-wrap: not a function');
  } catch (e) { errors.push('winPlanOf-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origHavenTick = Game.winPlanHavenTick;
    if (RECORDER_ON && typeof origHavenTick === 'function') {
      Game.winPlanHavenTick = function (vid, hx, hy) {
        let before = null;
        try { before = planOf(vid); } catch (e) { errors.push('seedattach-haventick-before: ' + String(e.message).slice(0, 80)); }
        const ret = origHavenTick.apply(this, arguments);
        try {
          if (!before && ret) {
            const eng = engagementReads(Game, vid);
            seedattachCreations.push({ day: gday(Game), vid: vid, createdBy: 'winPlanHavenTick',
              creatorSite: 'win-plan.js:winPlanHavenTick', fought: eng.fought, villageSlainTotal: eng.villageSlainTotal,
              stageAtCreation: ret.stage || null, targetAtCreation: ret.target || null });
          }
        } catch (e) { errors.push('seedattach-haventick-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('winPlanHavenTick-wrap: not a function');
  } catch (e) { errors.push('winPlanHavenTick-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origDepart = Game.winPlanDepart;
    if (RECORDER_ON && typeof origDepart === 'function') {
      Game.winPlanDepart = function (vid, hx, hy, playerAtHaven) {
        // SEEDATTACH: inviter target BEFORE the launch (the companion
        // copy at win-plan.js:439 carries this value, null included).
        let beforePlan = null;
        try { beforePlan = planSnap(planOf(vid)); } catch (e) { errors.push('seedattach-depart-before: ' + String(e.message).slice(0, 80)); }
        // RUMORPLAN: whole-map before-snapshot — the companion is
        // picked dynamically inside launchParty, so its before-state
        // is only recoverable from a pre-call snapshot. Plus the
        // pre-call expedition map: only a call that STARTS the
        // expedition is a launch (see recordRumorLaunch).
        let beforeMap = null, expedBefore = null;
        try { beforeMap = snapAllPlans(); } catch (e) { errors.push('rumorplan-depart-snap: ' + String(e.message).slice(0, 80)); }
        try { expedBefore = expedMap(); } catch (e) { errors.push('rumorplan-depart-exped: ' + String(e.message).slice(0, 80)); }
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
          // SEEDATTACH launch row (win-plan path).
          if (ret === 'launch' && plan && (plan.party || []).length) {
            const comp = plan.party[0];
            let compAfter = null;
            try { compAfter = planSnap(planOf(comp)); } catch (e) {}
            seedattachLaunches.push({ day: gday(Game), vid: vid, path: 'winplan', result: ret,
              inviterTargetBefore: beforePlan ? beforePlan.target : null,
              companion: comp, companionTargetBefore: null,
              companionTargetAfter: compAfter ? compAfter.target : null });
          }
          // RUMORPLAN launch rows (win-plan path): one per participant.
          if (ret === 'launch' && beforeMap && expedBefore) recordRumorLaunch(beforeMap, expedBefore, vid, 'winplan', []);
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
        // SEEDATTACH: before-state for both launch parties (the brain
        // mirror at villager-brain.js:1047-1049 sets stage hunt WITHOUT
        // copying the target — the companion keeps its before-target).
        let beforePlan = null, companionBeforePlan = null;
        try { beforePlan = planSnap(planOf(vid)); } catch (e) { errors.push('seedattach-braindepart-before: ' + String(e.message).slice(0, 80)); }
        try { if (commit && commit.companion) companionBeforePlan = planSnap(planOf(commit.companion)); } catch (e) {}
        // RUMORPLAN: whole-map before-snapshot (covers companion2 and
        // any party member the post-call plan names) + pre-call
        // expedition map (only a call that STARTS the expedition is
        // a launch — the brain returns 'launch' again for a villager
        // already out).
        let beforeMap = null, expedBefore = null;
        try { beforeMap = snapAllPlans(); } catch (e) { errors.push('rumorplan-braindepart-snap: ' + String(e.message).slice(0, 80)); }
        try { expedBefore = expedMap(); } catch (e) { errors.push('rumorplan-braindepart-exped: ' + String(e.message).slice(0, 80)); }
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
              dawnbidDeparts.push({ day: gday(Game), vid: vid, source: 'brain', result: ret,
                winPlanAction: commit ? (commit.winPlanAction || null) : null,
                companion: commit ? (commit.companion || null) : null,
                vidExped: vidExped, companionExped: compExped,
                vidBlock: vidBlock, companionBlock: companionBlock,
                stage: plan ? plan.stage : null, target: plan ? plan.target : null,
                party: (plan && plan.party) ? plan.party.slice() : [] });
            }
          } catch (e) { errors.push('dawnbid-depart-log: ' + String(e.message).slice(0, 80)); }
          // SEEDATTACH launch row (brain path): the companion's target
          // is its BEFORE-target — the mirror never copies.
          try {
            if (ret === 'launch' && commit && commit.winPlanAction === 'party_launch' && commit.companion) {
              let compAfter = null;
              try { compAfter = planSnap(planOf(commit.companion)); } catch (e2) {}
              seedattachLaunches.push({ day: gday(Game), vid: vid, path: 'brain', result: ret,
                inviterTargetBefore: beforePlan ? beforePlan.target : null,
                companion: commit.companion,
                companionTargetBefore: companionBeforePlan ? companionBeforePlan.target : null,
                companionTargetAfter: compAfter ? compAfter.target : null });
            }
          } catch (e) { errors.push('seedattach-brainlaunch-log: ' + String(e.message).slice(0, 80)); }
          // RUMORPLAN launch rows (brain path): one per participant.
          // The mirror only launches on a party_launch commit; record
          // on any 'launch' result so a mid-day refresh launch is
          // counted the same as a dawn one (any-commit definition).
          // recordRumorLaunch itself gates on the expedition start.
          try {
            if (ret === 'launch' && beforeMap && expedBefore) {
              const extras = [];
              if (commit && commit.companion) extras.push(commit.companion);
              if (commit && commit.companion2) extras.push(commit.companion2);
              recordRumorLaunch(beforeMap, expedBefore, vid, 'brain', extras);
            }
          } catch (e) { errors.push('rumorplan-brainlaunch-log: ' + String(e.message).slice(0, 80)); }
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
        const watchKf = (w === 4 || w === 5) && mdef && mdef.id;
        let row = null;
        let kfRow = null;
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
        if (watchKf) {
          let fighterPre = null, alliesPre = [];
          try { fighterPre = memberSnap(Game, vid); } catch (e) { fighterPre = { vid: vid, class: 'unclassified', error: String(e.message).slice(0, 60) }; }
          try {
            const av = ((opts && opts.allyVids) || []).slice(0, 2);
            for (let k = 0; k < av.length; k++) alliesPre.push(memberSnap(Game, av[k]));
          } catch (e) { errors.push('killfail-ally-pre: ' + String(e.message).slice(0, 80)); }
          const lg = lastGateByVid[vid] || null;
          let mHpEntry = null, mdefHp = null;
          try { mdefHp = (mdef && mdef.hp != null) ? (Array.isArray(mdef.hp) ? mdef.hp.slice(0, 2) : (mdef.hp | 0)) : null; } catch (e) {}
          try { mHpEntry = (m && m.hp != null) ? (m.hp | 0) : (typeof mdefHp === 'number' ? mdefHp : null); } catch (e) { mHpEntry = (typeof mdefHp === 'number' ? mdefHp : null); }
          kfRow = { day: gday(Game), vid: vid, mid: mdef.id, wave: w,
            alliesN: (opts && opts.allies) | 0,
            allyVids: ((opts && opts.allyVids) || []).slice(0, 2),
            allyFromStart: !!(opts && opts.allyFromStart),
            gate: lg ? { result: lg.result, reason: lg.reason,
              partySize: lg.partySize, sensedSize: lg.sensedSize, countedSize: lg.countedSize,
              allArmed: lg.allArmed, allArmored: lg.allArmored, trickKnown: lg.trickKnown,
              planStage: lg.planStage, planTarget: lg.planTarget } : null,
            trickBefore: trickKnownOf(mdef.id), trickAfter: null,
            fighter: fighterPre, allies: alliesPre, calledAlly: null,
            mHpEntry: mHpEntry, mdefHp: mdefHp, mHpLeft: null,
            outcome: null, rounds: null, vTaken: null, mDealt: null, allyDealt: null,
            vHpLeft: null, calledHelp: null, allyVid: null, fleeHpFrac: null,
            volley: null, log: [] };
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
        try {
          if (watchKf && kfRow && rec) {
            kfRow.outcome = rec.outcome || null;
            kfRow.rounds = rec.rounds | 0;
            kfRow.vTaken = rec.vTaken | 0;
            kfRow.mDealt = rec.mDealt | 0;
            kfRow.allyDealt = (rec.allyDealt != null ? rec.allyDealt | 0 : null);
            kfRow.vHpLeft = (rec.vHpLeft != null ? rec.vHpLeft | 0 : null);
            kfRow.mHpLeft = (rec.mHpLeft != null ? rec.mHpLeft | 0 : null);
            kfRow.calledHelp = !!rec.calledHelp;
            kfRow.allyVid = rec.allyVid || null;
            kfRow.fleeHpFrac = (rec.fleeHpFrac != null ? +rec.fleeHpFrac.toFixed(2) : null);
            kfRow.trickAfter = trickKnownOf(mdef.id);
            try { kfRow.volley = rec.volley ? { shots: rec.volley.shots | 0, hits: rec.volley.hits | 0, dmg: rec.volley.dmg | 0, ammoLeft: rec.volley.ammoLeft } : null; } catch (e) { kfRow.volley = null; }
            try { kfRow.log = (rec.log || []).slice(0, 20).map(function (s) { return String(s).slice(0, 400); }); } catch (e) { kfRow.log = []; }
            if (kfRow.calledHelp && kfRow.allyVid) {
              try { kfRow.calledAlly = memberSnap(Game, kfRow.allyVid); } catch (e) { kfRow.calledAlly = { vid: kfRow.allyVid, class: 'unclassified', error: String(e.message).slice(0, 60) }; }
            }
            killfailFights.push(kfRow);
          } else if (watchKf) {
            errors.push('killfail-log: fieldFight returned no record for ' + String(mdef && mdef.id));
          }
        } catch (e) { errors.push('killfail-log: ' + String(e.message).slice(0, 80)); }
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
            // SEEDATTACH census: one row per live winPlan entry at end
            // of day — EVERY plan, not just wave-4 (target-null plans
            // have needWave unset, so the wave-4 filter misses them).
            // Pure reads. This is the epoch / seeded-then-lost evidence.
            if (RECORDER_ON) {
              try {
                const wpAll = ((Game.state || {}).village || {}).winPlan || {};
                for (const pvid of Object.keys(wpAll)) {
                  const pl = wpAll[pvid];
                  let alive = true;
                  try { const p = Game.getPerson ? Game.getPerson(pvid) : null; if (p && p.dead) alive = false; } catch (e) {}
                  let node = null;
                  try { const n = Game.npcNode ? Game.npcNode(pvid) : null; if (n) node = { nx: n.nx, ny: n.ny }; } catch (e) {}
                  let exped = false;
                  try { const a = Game.agencyState ? Game.agencyState() : null; exped = !!(a && a.exped && a.exped[pvid]); } catch (e) {}
                  let sick = false, health = 100;
                  try { sick = !!(((Game.state || {}).village || {}).sick || {})[pvid]; } catch (e) {}
                  try { const h = (((Game.state || {}).village || {}).health || {})[pvid]; if (h !== undefined) health = h; } catch (e) {}
                  seedattachCensus.push({ day: d, vid: pvid, target: pl.target || null,
                    needWave: (pl.needWave != null ? pl.needWave : null),
                    stage: pl.stage || null, party: (pl.party || []).slice(),
                    sinceDay: (pl.sinceDay != null ? pl.sinceDay : null),
                    node: pl.node ? { nx: pl.node.nx, ny: pl.node.ny } : null,
                    holderAlive: alive, holderNode: node, holderExped: exped,
                    holderSick: sick, holderHealth: health });
                }
              } catch (e) { errors.push('seedattach-census: ' + String(e.message).slice(0, 80)); }
              // RUMORPLAN target-diff: day-over-day target changes
              // for every live plan (the companion copy sets targets
              // without a seed call, so bounces alone cannot name
              // every acquisition day). Compared against the
              // driver-local prevPlanTarget map, then the map is
              // updated. Pure reads + driver-local writes.
              try {
                const wpAll2 = ((Game.state || {}).village || {}).winPlan || {};
                for (const pvid of Object.keys(wpAll2)) {
                  const pl = wpAll2[pvid];
                  const cur = pl.target || null;
                  const prev = prevPlanTarget[pvid];
                  if (prev && prev.target !== cur) {
                    rumorplanTargetDiffs.push({ day: d, vid: pvid,
                      from: prev.target, to: cur,
                      stage: pl.stage || null, source: 'census-diff' });
                  }
                  prevPlanTarget[pvid] = { target: cur, stage: pl.stage || null };
                }
                for (const pvid of Object.keys(prevPlanTarget)) {
                  if (!wpAll2[pvid]) delete prevPlanTarget[pvid];
                }
              } catch (e) { errors.push('rumorplan-targetdiff: ' + String(e.message).slice(0, 80)); }
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
    seed: seed, arm: 'killfail-a', run: RUN, mode: LEG, leg: LEG,
    anchorCommit: ANCHOR, standingMarker: STANDING_MARKER,
    recorderOn: RECORDER_ON,
    policySha: POLICY_SHA, policy: LEG,
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
    seedattachBounces: seedattachBounces, seedattachCreations: seedattachCreations,
    seedattachLaunches: seedattachLaunches, seedattachCensus: seedattachCensus,
    rumorplanLaunches: rumorplanLaunches, rumorplanTargetDiffs: rumorplanTargetDiffs,
    killfailFights: killfailFights,
    wave4Ids: loadWave4Ids(), wave5Ids: loadWave5Ids(),
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
  if (!SEEDS.length) { console.error('KILLFAIL STOP: SEEDS required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-16', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'killfail-a-s' + seed + '-' + RUN + '-' + LEG + '.json');
    if (fs.existsSync(file)) { console.error('KILLFAIL STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'killfail-a-s' + seed + '-' + RUN + '-' + LEG + '.json');
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
      seedattachBounces: out.seedattachBounces.length, seedattachCreations: out.seedattachCreations.length,
      seedattachLaunches: out.seedattachLaunches.length, seedattachCensus: out.seedattachCensus.length,
      rumorplanLaunches: out.rumorplanLaunches.length, rumorplanTargetDiffs: out.rumorplanTargetDiffs.length,
      killfailFights: out.killfailFights.length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun, loadWave4Ids: loadWave4Ids, loadWave5Ids: loadWave5Ids, planIsWave4: planIsWave4, deriveLaunchBlock: deriveLaunchBlock };
