// gatehorizon-driver-b.js — STAGED-HORIZON driver, arm sim-gatehorizon-b
// (the leader-projection gate's 150-DAY HORIZON judge, after doorstage-b
// JUDGED D1 and named the horizon as what it does NOT show).
//
// WHAT IT DOES: for each seed in the band, it runs ONE 150-day
// capable-policy sim per leg (control gate OFF, armed LEADERPROJ=1),
// stages ONE pool door mid-run (the doorstage pattern — geared pinned
// quad, staged leader HP, single-monster pool, real expeditionMonster
// door-open decision), then continues the sim to the horizon and
// measures downstream armed-vs-control deltas (pool-door leader deaths,
// wave-4 kills, survival). The staged door is injected at the first
// 10-day chunk boundary where the village is alive AND wave 4 is
// unlocked AND a stageable quad exists (cap day 120); otherwise the
// seed is unscored with its reason.
//
// COMPOSITION (not a harness change): the day loop is chunked
// runDays(Game, capable, {days: 10}) on the same Game. runDays re-seeds
// the policy RNG per call, so the policy stream restarts at each chunk
// boundary — identically on both legs (same seed, same pre-staging
// trajectory, same staging chunk), so the comparison stays matched.
// The determinism proof (M3m) is chunked-vs-chunked, never
// chunked-vs-single.
//
// DOOR-10 FIX (frozen in the prereg): hide_armor + hunting_spear are
// placed INTO each quad member's pack before startExpedition, so the
// expedition's own villagerGearUp/autoEquip can re-select them (the
// doorstage failure was that the issued kit was never in the pack).
// Pre-check AFTER startExpedition (the at-door point): every member on
// an expedition, pinned trio present, every member armed AND armored
// (the winPlanOutmatched gearOf rule). A failing member is replaced
// from spares (up to 3 tries); if staging still cannot satisfy the
// pre-check the seed is unscored 'unstageable'.
//
// DEATH CAPTURE: the driver installs its own Game.tele wrapper for the
// whole seed-run (chunks + staging window) with the harness's lazy
// player-flag repair pattern, so staged-door deaths between chunks are
// captured exactly like day-loop deaths. runDays wraps it per chunk and
// restores it after — one capture path, no dedupe.
//
// Usage (control):
//   SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 LAUNCHSURVIVE=1 ALLYSLOT3=1 PINQUAD=1 DMGPIN=1 DOORFLEE2=1 HYPOFLOOR=1 HPGATE=1 LEG=control EVIDENCE_DATE=2026-11-23 CORPUS_PREFIX=gatehorizon-b RUN=gatehorizon-b OUTDIR=perseed-gatehorizon-b-control SEEDS=109101,109102 BAND_START=109101 node scripts/gatehorizon-driver-b.js
// Usage (armed — add LEADERPROJ=1, OUTDIR=perseed-gatehorizon-b-armed, LEG=armed).
// SEEDS=109101 runs a subset (smoke only — judged legs run the full band).
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { capable } = require(path.join(REPO, 'scripts', 'policies', 'capable'));

const LEG = process.env.LEG || 'control';
const EVIDENCE_DATE = process.env.EVIDENCE_DATE || '2026-11-23';
const CORPUS_PREFIX = process.env.CORPUS_PREFIX || 'gatehorizon-b';
const RUN = process.env.RUN || 'gatehorizon-b';
const OUTDIR = process.env.OUTDIR || ('perseed-gatehorizon-b-' + LEG);
const SPEC_PATH = process.env.DOOR_SPEC || path.join(REPO, 'evidence', EVIDENCE_DATE, 'gatehorizon-b-spec.json');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : [109101]);
const BAND_START = parseInt(process.env.BAND_START || '109101', 10);
const HORIZON_DAYS = parseInt(process.env.HORIZON_DAYS || '150', 10);
const CHUNK_DAYS = parseInt(process.env.CHUNK_DAYS || '10', 10);
const STAGE_CAP_DAY = parseInt(process.env.STAGE_CAP_DAY || '120', 10);
const MAX_CALLS = 30;
const MAX_REPLACE_TRIES = 3;

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
let POLICY_SHA = 'unknown';
let BASE_POLICY_SHA = 'unknown';
try { POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'capable.js'), 'utf8')).digest('hex'); } catch (e) {}
try { BASE_POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8')).digest('hex'); } catch (e) {}
let SLOT_PRESENT = false;
let PIN_PRESENT = false;
let SENSE_PRESENT = false;
let PROJ_PRESENT = false;
let LOG_PRESENT = false;
try {
  const ffSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'fieldFights.js'), 'utf8');
  const pwSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'party-wiring.js'), 'utf8');
  const gameSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'game.js'), 'utf8');
  SLOT_PRESENT = ffSrc.indexOf('ally3Vid') !== -1 &&
    ffSrc.indexOf('shouts a third time!') !== -1 &&
    pwSrc.indexOf('ALLYSLOT3') !== -1 &&
    gameSrc.indexOf('ALLYSLOT3') !== -1;
  const agSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'villager-agency.js'), 'utf8');
  PIN_PRESENT = agSrc.indexOf('pinQuadParty') !== -1 &&
    agSrc.indexOf('pinnedQuadAllies') !== -1 &&
    agSrc.indexOf('PINQUAD') !== -1 &&
    pwSrc.indexOf('PINQUAD') !== -1;
  PROJ_PRESENT = agSrc.indexOf('LEADERPROJ') !== -1 && agSrc.indexOf('_lpProj <= 25') !== -1;
  LOG_PRESENT = agSrc.indexOf('gateAvoids') !== -1 && agSrc.indexOf("kind: 'proj'") !== -1;
  SENSE_PRESENT = pwSrc.indexOf('SENSEEXPED') !== -1;
} catch (e) {}

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
function isDead(Game, vid) {
  try { const p = Game.getPerson ? Game.getPerson(vid) : null; if (p) return !!p.dead; } catch (e) {}
  try { const p = Game.vpOf ? Game.vpOf(vid) : null; if (p) return !!p.dead; } catch (e) {}
  return false;
}
function trickKnownOf(Game, mid) { try { return !!(Game.villageKnowsTrick && Game.villageKnowsTrick(mid)); } catch (e) { return false; } }

// LAUNCHPARTY (copied from scripts/doorstage-driver-b.js): the
// spawned monster HP, recovered AFTER the fight from the fight
// record. Pure reads, no RNG, no state writes.
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

function measuredArmorP(Game, ids) {
  const S = globalThis.Scattering || {};
  return ids.map(function (id) {
    const ap = (Game.data.villagers || []).find(function (x) { return x.id === id; }) ||
      (Game.data.background_survivors || []).find(function (x) { return x.id === id; });
    return S.equipment.armorOf(ap, Game.data.items);
  });
}

// gearCheck — the winPlanOutmatched gearOf rule, re-read live at the
// door (armed = weapon bonus > 0 OR a weapon item carried in the pack;
// armored = armorOf > 0). Pure read.
function gearCheck(Game, vid) {
  const S = globalThis.Scattering || {};
  const eq = S.equipment || null;
  const items = (Game.data || {}).items || [];
  let person = null;
  try { person = Game.getPerson ? Game.getPerson(vid) : null; } catch (e) {}
  if (!person) return { armed: false, armored: false, armorP: 0, weaponB: 0 };
  let armorP = 0, weaponB = 0;
  try { armorP = (eq && eq.armorOf) ? (eq.armorOf(person, items) || 0) : 0; } catch (e) {}
  try { weaponB = (eq && eq.weaponBonusOf) ? (eq.weaponBonusOf(person, items) || 0) : 0; } catch (e) {}
  let carriesWeapon = false;
  try {
    for (const it of (person.items || [])) {
      const iid = it && (it.itemId || it.id || it);
      let def = null;
      for (let j = 0; j < items.length; j++) if (items[j] && items[j].id === iid) { def = items[j]; break; }
      if (def && def.weapon) { carriesWeapon = true; break; }
    }
  } catch (e) {}
  return { armed: !!(weaponB > 0 || carriesWeapon), armored: armorP > 0, armorP: armorP, weaponB: weaponB };
}

// The gate-avoid notes, parsed from the live expedition records —
// the SAME regex as the pinquaddoor / doorstage drivers. Pure read.
function parseGateAvoidNotes(Game) {
  const notes = [];
  try {
    const ag = Game.agencyState ? Game.agencyState() : null;
    const exp = (ag && ag.exped) || {};
    const re = /gave (\S+) room — (.+?) is too hurt to (hold|lead) a door \((projected )?(\d+) HP(?:, (-?\d+) HP in two rounds)?\)/;
    for (const vid of Object.keys(exp)) {
      const encs = (exp[vid] && exp[vid].encounters) || [];
      for (const n of encs) {
        const m = re.exec(String(n));
        if (m) notes.push({ vid: vid, mid: m[1], name: m[2], kind: m[4] ? 'proj' : m[3], hp: parseInt(m[5], 10), projHp2: m[6] != null ? parseInt(m[6], 10) : null, note: String(n) });
      }
    }
  } catch (e) {}
  return notes;
}

function buildRow(Game, vid, mdef, opts, rec, leaderEntryHp, pinAtFight) {
  const w = (mdef && mdef.wave) | 0;
  const row = { day: gday(Game), vid: vid, mid: mdef.id, wave: w,
    mHpStart: null, vKill: false, mHpStartRec: null,
    leaderEntryHp: leaderEntryHp,
    alliesN: (opts && opts.allies) | 0,
    allyVids: ((opts && opts.allyVids) || []).slice(0, 3),
    allyFromStart: !!(opts && opts.allyFromStart),
    gate: null,
    outcome: null, rounds: null, vTaken: null, mDealt: null,
    calledHelp: null, allyVid: null, ally2Vid: null, ally3Vid: null, ally3Dealt: null, fleeHpFrac: null,
    intent: null, shoutRound: null, shout2Round: null, shout3Round: null,
    pinned: !!(pinAtFight && pinAtFight.length), pinnedAllies: (pinAtFight || []).slice(),
    fleeWise: null, fleeLearn: null,
    trickBefore: trickKnownOf(Game, mdef.id), trickAfter: null, lines: [], log: [],
    origin: 'expedition', staged: false, leaderDied: false };
  if (rec) {
    const recov = recoverMHpStart(rec, null);
    row.mHpStart = recov.mHpStart;
    row.vKill = !!recov.vKill;
    try { row.mHpStartRec = (typeof rec.mHpStart === 'number' && isFinite(rec.mHpStart)) ? rec.mHpStart : null; } catch (e) {}
    row.outcome = rec.outcome || null;
    row.rounds = rec.rounds | 0;
    row.vTaken = rec.vTaken | 0;
    row.mDealt = rec.mDealt | 0;
    row.calledHelp = !!rec.calledHelp;
    row.allyVid = rec.allyVid || null;
    row.ally2Vid = rec.ally2Vid || null;
    row.ally3Vid = rec.ally3Vid || null;
    row.ally3Dealt = (typeof rec.ally3Dealt === 'number' ? rec.ally3Dealt : null);
    row.intent = (typeof rec.intent === 'string' ? rec.intent : null);
    row.shoutRound = (typeof rec.shoutRound === 'number' ? rec.shoutRound : null);
    row.shout2Round = (typeof rec.shout2Round === 'number' ? rec.shout2Round : null);
    row.shout3Round = (typeof rec.shout3Round === 'number' ? rec.shout3Round : null);
    row.fleeHpFrac = (rec.fleeHpFrac != null ? +rec.fleeHpFrac.toFixed(2) : null);
    row.fleeWise = !!rec.fleeWise;
    row.fleeLearn = !!rec.fleeLearn;
    row.doorHold = (typeof rec.doorHold === 'number' ? rec.doorHold : 0);
    row.everHopeless = !!rec.everHopeless;
    row.trickAfter = trickKnownOf(Game, mdef.id);
    try { row.log = (rec.log || []).slice(0, 500).map(function (s) { return String(s).slice(0, 400); }); } catch (e) { row.log = []; }
    row.roundsDetail = rec.roundsDetail || null;
    row.roundTotals = rec.roundTotals || null;
    row.actionKinds = rec.actionKinds || null;
    row.strikesThrown = (typeof rec.strikesThrown === 'number' ? rec.strikesThrown : null);
    row.rageFired = !!rec.rageFired;
    row.flPreRoundDealt = (typeof rec.flPreRoundDealt === 'number' ? rec.flPreRoundDealt : null);
    row.allyDealt = (typeof rec.allyDealt === 'number' ? rec.allyDealt : null);
    row.ally2Dealt = (typeof rec.ally2Dealt === 'number' ? rec.ally2Dealt : null);
  }
  return row;
}

function loadSpec() {
  const raw = JSON.parse(fs.readFileSync(SPEC_PATH, 'utf8'));
  if (!raw || !Array.isArray(raw.doors) || raw.doors.length === 0) throw new Error('gatehorizon spec has no doors: ' + SPEC_PATH);
  return raw;
}

// ================= STAGING HELPERS (mid-sim adaptation of doorstage) =================
function prepOne(Game, id, hx, hy) {
  const v = Game.state.village || {};
  v.trust = v.trust || {};
  v.health = v.health || {};
  v.sick = v.sick || {};
  v.trust[id] = 50; v.health[id] = 100; delete v.sick[id];
  try { Game.npcSetNode(id, hx, hy); } catch (e) {}
}
function gearUp(Game, ids) {
  const kit = { torso: { itemId: 'hide_armor' }, melee: { itemId: 'hunting_spear' } };
  ids.forEach(function (id) {
    const p = Game.getPerson ? Game.getPerson(id) : (Game.vpOf ? Game.vpOf(id) : null);
    if (p) p.equipped = JSON.parse(JSON.stringify(kit));
  });
}
// DOOR-10 FIX: the issued kit must ALSO live in each member's pack,
// so the expedition's own villagerGearUp/autoEquip can re-select it
// (equipment comes from the person's own items, never conjured).
function packStage(Game, ids) {
  ids.forEach(function (id) {
    const p = Game.getPerson ? Game.getPerson(id) : (Game.vpOf ? Game.vpOf(id) : null);
    if (!p) return;
    p.items = p.items || [];
    const has = function (iid) {
      return p.items.some(function (it) { return it && (it.itemId || it.id || it) === iid; });
    };
    if (!has('hide_armor')) p.items.push({ itemId: 'hide_armor' });
    if (!has('hunting_spear')) p.items.push({ itemId: 'hunting_spear' });
  });
}
function pickQuadLive(Game) {
  const v = Game.state.village || {};
  const hx = (v.px != null ? v.px : 4), hy = (v.py != null ? v.py : 4);
  const roster = (v.roster || []).filter(function (id) { return id !== Game.villagerId; });
  let elig = [];
  try {
    const a = Game.agencyState ? Game.agencyState() : null;
    const exped = (a && a.exped) || {};
    const away = v.away || {};
    if (a) {
      a.potential = a.potential || {};
      roster.forEach(function (id) { try { a.potential[id] = true; } catch (e) {} });
      if (a.profiles) roster.forEach(function (id) { try { delete a.profiles[id]; } catch (e) {} });
    }
    elig = roster.filter(function (id) {
      if (exped[id] || away[id]) return false; // already out — CompanionGuard would skip them
      if (isDead(Game, id)) return false;
      try {
        const prof = Game.npcRangeProfile ? Game.npcRangeProfile(id) : null;
        return prof === 'wanderer' || prof === 'explorer';
      } catch (e) { return false; }
    });
  } catch (e) {}
  if (elig.length < 4) return { ok: false, why: 'no-quad', n: elig.length, hx: hx, hy: hy };
  const q = elig.slice(0, 4);
  q.forEach(function (id) { prepOne(Game, id, hx, hy); });
  return { ok: true, holder: q[0], c1: q[1], c2: q[2], c3: q[3], spares: elig.slice(4), hx: hx, hy: hy };
}
function launchOne(Game, id, hx, hy) {
  Game.startExpedition(id, hx, hy, false, { tx: 6, ty: 6, duration: 20 });
  try {
    const ag = Game.agencyState ? Game.agencyState() : null;
    return !!(ag && ag.exped && ag.exped[id]);
  } catch (e) { return false; }
}

// Stage ONE pool door mid-sim. Returns {ok, rec} or {ok:false, why}.
// 'no-quad' is retryable at a later chunk; 'unstageable' is terminal
// for this staging attempt (the pre-check could not be satisfied).
function stageDoor(Game, specDoor, ctx) {
  const errors = ctx.errors;
  const rec = {
    door: specDoor.door, mid: specDoor.mid, wave: specDoor.wave,
    leaderHp: specDoor.leaderHp, projHp2: specDoor.projHp2, band: specDoor.band,
    stagingDay: gday(Game), leaderVid: null, party: [], replacements: [],
    measuredArmorP: [], measuredArmorPAtDoor: [], gearAtDoor: [],
    calls: 0, evades: 0, fought: false, fired: false,
    outcome: null, rounds: null, mDealt: null, leaderDied: false,
    returnedHome: null,
  };
  const mdef = (Game.data.monsters || []).find(function (m) { return m.id === specDoor.mid; });
  if (!mdef) { errors.push('monster-missing: ' + specDoor.mid); return { ok: false, why: 'unstageable', rec: rec }; }
  if (((mdef.wave | 0) !== (specDoor.wave | 0))) errors.push('monster-wave-mismatch: ' + specDoor.mid + ' wave ' + mdef.wave + ' want ' + specDoor.wave);
  const pick = pickQuadLive(Game);
  if (!pick.ok) return { ok: false, why: 'no-quad', n: pick.n, rec: rec };
  let party = [pick.holder, pick.c1, pick.c2, pick.c3];
  const spares = (pick.spares || []).slice();
  gearUp(Game, party);
  packStage(Game, party);
  // measuredArmorP is taken HERE, right after gearUp and BEFORE
  // startExpedition — the same point test-pinquaddoor-b.js measures at
  // (all four read 30: hide_armor protection). The expedition start
  // re-equips each villager from their own pack (autoEquip); the
  // at-door gear is stamped separately as measuredArmorPAtDoor.
  rec.measuredArmorP = measuredArmorP(Game, party);
  rec.measuredArmorP.forEach(function (p) { if (!(p >= 8 && p <= 30)) errors.push('armorP-out-of-range: ' + p); });
  // Launch; replace any member whose expedition never started.
  let launched = party.filter(function (id) { return launchOne(Game, id, pick.hx, pick.hy); });
  let tries = 0;
  while (launched.length < 4 && spares.length && tries < MAX_REPLACE_TRIES) {
    tries++;
    const sp = spares.shift();
    prepOne(Game, sp, pick.hx, pick.hy);
    gearUp(Game, [sp]);
    packStage(Game, [sp]);
    if (launchOne(Game, sp, pick.hx, pick.hy)) {
      launched.push(sp);
      rec.replacements.push({ to: sp, reason: 'launch-failed' });
    }
  }
  if (launched.length < 4) {
    errors.push('staging: only ' + launched.length + ' launched');
    return { ok: false, why: 'unstageable', rec: rec };
  }
  party = launched.slice(0, 4);
  const holder = party[0];
  const trio = party.slice(1);
  const pinned = Game.pinQuadParty(holder, trio);
  if (pinned !== true) errors.push('pin-failed');
  // At-door pre-check (the door-10 gate, read live): pinned trio present
  // AND every member armed + armored. Replace a failing member from
  // spares (launch + re-pin), up to 3 tries total.
  let pinNow = null;
  try { pinNow = (typeof Game.pinnedQuadAllies === 'function') ? Game.pinnedQuadAllies(holder) : null; } catch (e) { pinNow = null; }
  if (!pinNow || pinNow.length !== 3) errors.push('pin-not-present-at-door: ' + JSON.stringify(pinNow));
  const v = Game.state.village;
  v.health[holder] = specDoor.leaderHp; v.health[trio[0]] = 100; v.health[trio[1]] = 100; v.health[trio[2]] = 100;
  rec.measuredArmorPAtDoor = measuredArmorP(Game, party);
  tries = 0;
  let gearOk = false;
  while (tries <= MAX_REPLACE_TRIES) {
    const checks = party.map(function (id) { return gearCheck(Game, id); });
    rec.gearAtDoor = checks.map(function (c) { return { armed: c.armed, armored: c.armored, armorP: c.armorP, weaponB: c.weaponB }; });
    const badIdx = checks.findIndex(function (c) { return !(c.armed && c.armored); });
    if (badIdx === -1) { gearOk = true; break; }
    if (tries === MAX_REPLACE_TRIES || !spares.length) break;
    tries++;
    const badId = party[badIdx];
    const sp = spares.shift();
    prepOne(Game, sp, pick.hx, pick.hy);
    gearUp(Game, [sp]);
    packStage(Game, [sp]);
    if (!launchOne(Game, sp, pick.hx, pick.hy)) { errors.push('replacement-launch-failed: ' + sp); break; }
    party[badIdx] = sp;
    rec.replacements.push({ from: badId, to: sp, reason: 'gear-precheck' });
    Game.pinQuadParty(party[0], party.slice(1));
    v.health[party[0]] = specDoor.leaderHp;
    for (let i = 1; i < 4; i++) v.health[party[i]] = 100;
    rec.measuredArmorPAtDoor = measuredArmorP(Game, party);
  }
  if (!gearOk) {
    errors.push('staging: gear pre-check failed after ' + tries + ' replacements: ' + JSON.stringify(rec.gearAtDoor));
    return { ok: false, why: 'unstageable', rec: rec };
  }
  rec.leaderVid = party[0];
  rec.party = party.slice();
  const deadBefore = {};
  party.forEach(function (id) { deadBefore[id] = isDead(Game, id); });
  const leaderEntryHp = v.health[party[0]];
  if (leaderEntryHp !== specDoor.leaderHp) errors.push('leaderEntryHp-mismatch: ' + leaderEntryHp + ' want ' + specDoor.leaderHp);
  // Single-monster pool override (restored immediately after staging).
  const origPool = Game.monsterWavePool;
  Game.monsterWavePool = function () { return [mdef]; };
  function totalFires() {
    try {
      const ag = Game.agencyState ? Game.agencyState() : null;
      return ((ag && ag.hpgateFires) | 0) + ((ag && ag.leaderhpgateFires) | 0) + ((ag && ag.leaderprojFires) | 0);
    } catch (e) { return 0; }
  }
  const firesBefore = totalFires();
  let calls = 0, fought = false, fired = false;
  ctx.stagingFlag = { door: specDoor.door, mid: specDoor.mid };
  try {
    while (calls < MAX_CALLS && !fought && !fired) {
      calls++;
      try { Game.expeditionMonster(party[0], 3, false); }
      catch (e) { errors.push('expeditionMonster: ' + String(e.message).slice(0, 80)); break; }
      if (totalFires() > firesBefore) fired = true;
      if (ctx.stagedRows.length > 0) fought = true;
    }
  } finally {
    ctx.stagingFlag = null;
    Game.monsterWavePool = origPool;
  }
  rec.calls = calls;
  rec.evades = ctx.stagedEvades;
  rec.fought = fought;
  rec.fired = fired;
  if (ctx.stagedRows.length > 0) {
    const row = ctx.stagedRows[0];
    rec.outcome = row.outcome;
    rec.rounds = row.rounds;
    rec.mDealt = row.mDealt;
    rec.leaderDied = !!row.leaderDied;
  }
  if (!fought && !fired) {
    let wpAvoid = false;
    try {
      const ag = Game.agencyState ? Game.agencyState() : null;
      const encs = ((ag && ag.exped && ag.exped[party[0]]) || {}).encounters || [];
      wpAvoid = encs.some(function (n) { return /going back for help/.test(String(n)); });
    } catch (e) {}
    errors.push('no-fight-no-fire after ' + calls + ' calls' + (wpAvoid ? ' (winPlanFightGate avoid)' : ''));
    return { ok: false, why: 'unstageable', rec: rec };
  }
  try {
    const ag = Game.agencyState ? Game.agencyState() : null;
    rec.returnedHome = !(ag && ag.exped && ag.exped[party[0]]);
  } catch (e) { rec.returnedHome = null; }
  return { ok: true, rec: rec };
}

// Whole-run death capture (chunks + staging window), with the
// harness's lazy player-flag repair pattern (see sim-harness.js).
// runDays wraps Game.tele per chunk and restores this wrapper after.
// Returns {deaths, restore}.
function installTeleWrap(Game) {
  const deaths = [];
  const origTele = Game.tele;
  Game.tele = function (type, data) {
    let r;
    try { r = origTele.apply(this, arguments); } catch (e) { throw e; }
    try {
      if (type === 'death') {
        const s0 = (this.state && this.state.scholar) || {};
        const tel = (this.state && this.state.telemetry) || [];
        const recT = tel.length ? tel[tel.length - 1] : null;
        const entry = { day: s0.day || 0, kind: data && data.kind, who: data && data.who, cause: data && data.cause };
        if (recT && recT.type === 'death' && String(recT.who) === String(entry.who)) {
          Object.defineProperty(entry, 'player', { enumerable: true, configurable: true, get: function () { return !!recT.player; } });
        } else {
          entry.player = !!(data && data.player);
        }
        deaths.push(entry);
      }
    } catch (e) {}
    return r;
  };
  return { deaths: deaths, restore: function () { Game.tele = origTele; } };
}

// Whole-run fieldFight wrap: census every wave-4+ fight (row shape from
// buildRow) with leader entry HP and whether the leader died in it.
// ctx: {errors, stagedRows, stagingFlag, stagedEvades}.
// Returns {rows, restore}.
function installFightWrap(Game, ctx) {
  const rows = [];
  const origFF = Game.fieldFight;
  Game.fieldFight = function (vid, mdef, m, opts) {
    const isScholar = (vid === Game.villagerId);
    let entryHp = null;
    try {
      if (isScholar) entryHp = ((Game.state || {}).scholar || {}).hp ?? null;
      else entryHp = ((Game.state.village || {}).health || {})[vid] ?? null;
    } catch (e) {}
    let pinAtFight = null;
    try { pinAtFight = (typeof Game.pinnedQuadAllies === 'function') ? Game.pinnedQuadAllies(vid) : null; } catch (e) { pinAtFight = null; }
    const rec = origFF.apply(this, arguments);
    try {
      if (ctx.stagingFlag && mdef && mdef.id && ((mdef.wave | 0) >= 4) && rec && ((rec.rounds | 0) < 1)) ctx.stagedEvades++;
      if (mdef && mdef.id && ((mdef.wave | 0) >= 4) && rec && ((rec.rounds | 0) >= 1)) {
        const row = buildRow(Game, vid, mdef, opts, rec, entryHp, pinAtFight);
        row.staged = !!ctx.stagingFlag;
        if (row.staged) row.stagedDoor = ctx.stagingFlag.door;
        if (!isScholar) row.leaderDied = isDead(Game, vid);
        rows.push(row);
        if (row.staged) ctx.stagedRows.push(row);
      }
    } catch (e) { ctx.errors.push('row-build: ' + String(e.message).slice(0, 80)); }
    return rec;
  };
  return { rows: rows, restore: function () { Game.fieldFight = origFF; } };
}

// Run ONE seed on ONE leg. Returns the corpus object (errors carried
// on it — a failed seed still writes its file so the failure is
// visible, and the leg exits 1).
async function oneSeed(seed, leg, spec) {
  const errors = [];
  const out = {
    seed: seed, arm: 'gatehorizon-b', run: RUN, mode: 'gatehorizon-b', leg: leg,
    anchorCommit: ANCHOR, slotPresent: SLOT_PRESENT, pinPresent: PIN_PRESENT, senseexpedPresent: SENSE_PRESENT,
    projPresent: PROJ_PRESENT, logPresent: LOG_PRESENT,
    allyslot3Flag: process.env.ALLYSLOT3 || null, pinquadFlag: process.env.PINQUAD || null,
    dmgpinFlag: process.env.DMGPIN || null, doorflee2Flag: process.env.DOORFLEE2 || null,
    hypofloorFlag: process.env.HYPOFLOOR || null, hpgateFlag: process.env.HPGATE || null,
    leaderhpgateFlag: process.env.LEADERHPGATE || null, leaderprojFlag: process.env.LEADERPROJ || null,
    senseexpedFlag: process.env.SENSEEXPED || null,
    policySha: POLICY_SHA, basePolicySha: BASE_POLICY_SHA, policy: 'capable', policyExecuted: true,
    hpgateFires: 0, leaderhpgateFires: 0, leaderprojFires: 0,
    gateAvoidNotes: [], gateAvoidLog: [],
    v4encounters: [], instrumentErrors: errors,
    stagedDoor: null, scored: false, unscoredReason: null,
    wave4KillsTotal: 0, wave4KillsDownstream: 0, wave5KillsTotal: 0,
    leaderAliveAtEnd: null, starvationDeaths: 0,
    won: false, scaleRank: null, gameDays: 0, endReason: null, deaths: [],
    maxWaveUnlocked: 1, pacing: null, tableWaiting: false, tableEntered: false,
    horizonDays: HORIZON_DAYS, chunkDays: CHUNK_DAYS, stageCapDay: STAGE_CAP_DAY,
  };
  let Game = null;
  try {
    const loaded = await loadGame({ seed: seed, mode: 'gatehorizon-b', fullTelemetry: false });
    Game = loaded.Game;
    await setupGame(Game);
  } catch (e) {
    errors.push('loadGame/setupGame: ' + String(e && e.message || e).slice(0, 120));
    return out;
  }
  // --- whole-run death capture (chunks + staging window), with the
  // harness's lazy player-flag repair pattern (see sim-harness.js).
  // runDays wraps Game.tele per chunk and restores this wrapper after.
  const teleWrap = installTeleWrap(Game);
  const deaths = teleWrap.deaths;
  // --- whole-run fieldFight wrap: census every wave-4+ fight.
  const ctx = { errors: errors, stagedRows: [], stagingFlag: null, stagedEvades: 0 };
  const ffWrap = installFightWrap(Game, ctx);
  const rows = ffWrap.rows;
  const stagedRows = ctx.stagedRows;
  // --- chunked day loop with mid-run staging.
  const specDoor = spec.doors[(seed - BAND_START) % spec.doors.length];
  let gameDays = 0, chunks = 0, maxWave = 1;
  let staged = null, lastBlock = null, stagingTried = 0;
  const pacingAgg = { deliberate: 0, driver: 0, internal: 0, days: 0 };
  try {
    while (gameDays < HORIZON_DAYS && !Game.over && chunks < 20) {
      const manifest = { seed: seed, commit: ANCHOR, mode: 'gatehorizon-b', date: new Date().toISOString().slice(0, 10), node: process.version };
      const res = await runDays(Game, capable, { days: CHUNK_DAYS, manifest: manifest });
      chunks++;
      gameDays = res.gameDays || 0;
      maxWave = Math.max(maxWave, res.maxWaveUnlocked || 1);
      try {
        pacingAgg.deliberate += (res.pacing || {}).totalDeliberate || 0;
        pacingAgg.driver += (res.pacing || {}).totalDriver || 0;
        pacingAgg.internal += (res.pacing || {}).totalInternal || 0;
        pacingAgg.days += res.days || 0;
      } catch (e) {}
      if (!staged && !Game.over && gameDays <= STAGE_CAP_DAY) {
        let w = 1;
        try { w = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) { w = 1; }
        if (w >= 4) {
          stagingTried++;
          stagedRows.length = 0;
          ctx.stagedEvades = 0;
          const st = stageDoor(Game, specDoor, ctx);
          if (st.ok) {
            staged = st.rec;
          } else {
            lastBlock = st.why || 'unstageable';
            if (st.why !== 'no-quad') errors.push('staging attempt ' + stagingTried + ' failed: ' + st.why);
          }
        } else {
          lastBlock = 'no-unlock';
        }
      }
    }
  } catch (e) {
    errors.push('day-loop: ' + String(e && e.message || e).slice(0, 120));
  }
  ffWrap.restore();
  teleWrap.restore();
  // --- end snapshot.
  out.gameDays = gday(Game);
  out.maxWaveUnlocked = maxWave;
  try { out.won = !!Game.won; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; out.tableWaiting = !!pg.tableWaiting; out.tableEntered = !!pg.tableDone; } catch (e) {}
  try { out.scaleRank = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; } catch (e) {}
  out.endReason = Game.over ? (Game.villageLost ? 'village-lost' : 'over-other') : 'survived';
  out.deaths = deaths;
  out.starvationDeaths = deaths.filter(function (d) { return String(d.cause || '') === 'starvation'; }).length;
  out.v4encounters = rows;
  try {
    const ag = Game.agencyState ? Game.agencyState() : null;
    out.hpgateFires = (ag && ag.hpgateFires) | 0;
    out.leaderhpgateFires = (ag && ag.leaderhpgateFires) | 0;
    out.leaderprojFires = (ag && ag.leaderprojFires) | 0;
    out.gateAvoidLog = ((ag && ag.gateAvoids) || []).slice();
  } catch (e) {}
  out.gateAvoidNotes = parseGateAvoidNotes(Game);
  if (staged) {
    out.stagedDoor = staged;
    out.scored = true;
    const sd = staged.stagingDay | 0;
    let w4t = 0, w4d = 0, w5t = 0;
    try {
      const log = (Game.state || {}).waveKillLog || [];
      for (const e of log) {
        if (!e) continue;
        if (e.w === 4) { w4t++; if ((e.d | 0) > sd) w4d++; }
        if (e.w === 5) w5t++;
      }
    } catch (e) {}
    // The staged-door kill itself happens ON the staging day: it is a
    // downstream consequence of the gate decision, so it counts in the
    // downstream total (the d > stagingDay filter above excludes it;
    // add it back explicitly when the staged fight was a kill).
    if (staged.fought && staged.outcome === 'vKill') w4d++;
    out.wave4KillsTotal = w4t;
    out.wave4KillsDownstream = w4d;
    out.wave5KillsTotal = w5t;
    out.leaderAliveAtEnd = staged.leaderVid ? !isDead(Game, staged.leaderVid) : null;
  } else {
    out.scored = false;
    out.unscoredReason = Game.over ? 'dead' : (lastBlock || 'no-unlock');
    try {
      const log = (Game.state || {}).waveKillLog || [];
      for (const e of log) {
        if (!e) continue;
        if (e.w === 4) out.wave4KillsTotal++;
        if (e.w === 5) out.wave5KillsTotal++;
      }
    } catch (e) {}
    out.wave4KillsDownstream = null;
    out.leaderAliveAtEnd = null;
  }
  out.pacing = {
    totalDeliberate: pacingAgg.deliberate,
    meanDeliberatePerDay: pacingAgg.days ? +(pacingAgg.deliberate / pacingAgg.days).toFixed(1) : 0,
    totalDriver: pacingAgg.driver,
    totalInternal: pacingAgg.internal,
    chunks: chunks,
  };
  return out;
}

async function main() {
  if (LEG !== 'control' && LEG !== 'armed') { console.error('GATEHORIZON STOP: LEG must be control|armed, got ' + JSON.stringify(LEG)); process.exit(2); }
  if (!SLOT_PRESENT) { console.error('GATEHORIZON STOP: ALLYSLOT3 slot code absent.'); process.exit(2); }
  if (!PIN_PRESENT) { console.error('GATEHORIZON STOP: PINQUAD lever code absent.'); process.exit(2); }
  if (!PROJ_PRESENT) { console.error('GATEHORIZON STOP: LEADERPROJ gate code absent.'); process.exit(2); }
  if (!LOG_PRESENT) { console.error('GATEHORIZON STOP: GATEAVOID durable-log code absent.'); process.exit(2); }
  if (!SENSE_PRESENT) { console.error('GATEHORIZON STOP: SENSEEXPED sense code absent.'); process.exit(2); }
  const need = ['SENSEEXPED', 'PARTYSIZE4', 'VETREENGAGE', 'FLEEREPAIR2', 'FIGHTALLY2', 'ALLYSLOT3', 'PINQUAD', 'DMGPIN', 'DOORFLEE2', 'HYPOFLOOR', 'HPGATE'];
  for (const f of need) {
    if (process.env[f] !== '1') { console.error('GATEHORIZON STOP: ' + f + '=1 required (substrate).'); process.exit(2); }
  }
  if (process.env.LEADERHPGATE) { console.error('GATEHORIZON STOP: LEADERHPGATE must be unset on both legs.'); process.exit(2); }
  if (LEG === 'armed' && process.env.LEADERPROJ !== '1') { console.error('GATEHORIZON STOP: LEG=armed requires LEADERPROJ=1.'); process.exit(2); }
  if (LEG === 'control' && process.env.LEADERPROJ) { console.error('GATEHORIZON STOP: LEG=control requires LEADERPROJ unset (gate OFF).'); process.exit(2); }
  if (String(POLICY_SHA).slice(0, 12) !== '4c4d1535d76c') { console.error('GATEHORIZON STOP: capable policySha mismatch ' + String(POLICY_SHA).slice(0, 12) + ' want 4c4d1535d76c.'); process.exit(2); }
  if (String(BASE_POLICY_SHA).slice(0, 12) !== '1884c8852d38') { console.error('GATEHORIZON STOP: competent basePolicySha mismatch ' + String(BASE_POLICY_SHA).slice(0, 12) + ' want 1884c8852d38.'); process.exit(2); }
  const spec = loadSpec();
  const outDir = path.join(REPO, 'evidence', EVIDENCE_DATE, OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const s of SEEDS) {
    const file = path.join(outDir, CORPUS_PREFIX + '-s' + s + '-' + RUN + '-pinquaddoor.json');
    if (fs.existsSync(file)) { console.error('GATEHORIZON STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  let anyErrors = false;
  for (const s of SEEDS) {
    const out = await oneSeed(s, LEG, spec);
    const file = path.join(outDir, CORPUS_PREFIX + '-s' + s + '-' + RUN + '-pinquaddoor.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    if (out.instrumentErrors.length) anyErrors = true;
    const sd = out.stagedDoor || {};
    console.log(JSON.stringify({
      seed: out.seed, leg: LEG, anchor: (out.anchorCommit || '').slice(0, 12),
      slotPresent: out.slotPresent, pinPresent: out.pinPresent,
      leaderprojFlag: out.leaderprojFlag, leaderprojFires: out.leaderprojFires,
      hpgateFires: out.hpgateFires, leaderhpgateFires: out.leaderhpgateFires,
      gateAvoidNotes: out.gateAvoidNotes.length, gateAvoidLog: out.gateAvoidLog.length,
      scored: out.scored, unscoredReason: out.unscoredReason,
      stagingDay: sd.stagingDay != null ? sd.stagingDay : null,
      stagedDoor: sd.door != null ? sd.door : null, stagedMid: sd.mid || null,
      stagedFought: sd.fought != null ? sd.fought : null, stagedFired: sd.fired != null ? sd.fired : null,
      stagedOutcome: sd.outcome || null, stagedLeaderDied: sd.leaderDied != null ? sd.leaderDied : null,
      v4encounters: out.v4encounters.length,
      wave4KillsTotal: out.wave4KillsTotal, wave4KillsDownstream: out.wave4KillsDownstream,
      leaderAliveAtEnd: out.leaderAliveAtEnd,
      won: out.won, scaleRank: out.scaleRank, gameDays: out.gameDays, endReason: out.endReason,
      maxWave: out.maxWaveUnlocked, deaths: out.deaths.length, starvationDeaths: out.starvationDeaths,
      errors: out.instrumentErrors.length, file: path.relative(REPO, file),
    }));
  }
  if (anyErrors) { console.error('GATEHORIZON: instrument errors present — see per-seed lines above.'); process.exit(1); }
}

if (require.main === module) {
  main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
}

module.exports = { oneSeed: oneSeed, stageDoor: stageDoor, loadSpec: loadSpec, pickQuadLive: pickQuadLive, gearUp: gearUp, packStage: packStage, gearCheck: gearCheck, measuredArmorP: measuredArmorP, parseGateAvoidNotes: parseGateAvoidNotes, buildRow: buildRow, recoverMHpStart: recoverMHpStart, installTeleWrap: installTeleWrap, installFightWrap: installFightWrap, isDead: isDead };
