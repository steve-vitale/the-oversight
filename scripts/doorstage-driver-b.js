// doorstage-driver-b.js — STAGED-DOOR driver, arm sim-doorstage-b
// (finding #2695 / the leader-projection gate's D1, fourth attempt
// at supply — after leaderproj-b's blind channel, gateavoid-b's
// 1-door 0%-bad pool, and gateavoid-doorrich-b's 1-door-per-band
// screen: stop screening fresh bands and STAGE pool doors
// deliberately, per the doorrich metric review).
//
// WHAT IT DOES: for each door in evidence/2026-11-23/
// doorstage-b-spec.json (16 staged doors: 12 pool doors with the
// leader at 30–75 HP + 4 safe negative controls at 80–95 HP), it
// loads ONE fresh game per door (seeded by the door seed), stages
// a geared pinned quad (hide_armor + hunting_spear, armor P 8–30,
// allies 100 HP, leader at the staged HP) through the same
// stageMeeting pattern the leaderproj/gateavoid proof tests prove
// (pickQuad + gearUp + startExpedition x4 + pinQuadParty), forces
// the monster pool to the door's single monster def, and calls
// the real expeditionMonster (the gates' home) until a fight
// (rounds >= 1) or a gate fire — max 30 calls. Control leg
// (LEADERPROJ unset) fights every door; armed leg (LEADERPROJ=1)
// refuses every pool door. One corpus file per door per leg, in
// the pinquaddoor corpus shape, readable by
// scripts/analyze-gateavoid-b.js WITHOUT modification (the analyzer
// is reused verbatim — the staged corpora are shaped to its
// contract, never the other way around).
//
// STAGING NOTES (frozen in the prereg — this file implements them):
// - No sim seed band is consumed: the door seeds (424200–424215)
//   are fixture seeds for staged single-door loads, not 150d sims.
// - The driver runs NO day loop and does NOT execute the competent
//   policy; policySha is stamped as the substrate identifier only.
// - origin 'expedition' is set by construction (the driver calls
//   expeditionMonster directly) — no stack reading.
// - v4encounters carries ONLY fought rows (rounds >= 1); evades
//   are counted separately (evades), so the analyzer's
//   seed+day+mid key is unambiguous per door.
// - deaths: party members whose person record is dead after the
//   door call but was alive before — the panel's villageDeaths
//   input (per-door party deaths, the only death population this
//   instrument observes). won false, scaleRank null, gameDays the
//   staged scholar.day, endReason null.
// - The safe-door determinism tripwire: the 4 safe doors must
//   fight identically on the two legs. The driver does NOT compare
//   legs (it runs one leg at a time); the evidence verifies the
//   tripwire from the two corpus dirs, and M3l proves it on
//   fixture doors.
// Usage (control):
//   SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 LAUNCHSURVIVE=1 ALLYSLOT3=1 PINQUAD=1 DMGPIN=1 DOORFLEE2=1 HYPOFLOOR=1 HPGATE=1 LEG=control EVIDENCE_DATE=2026-11-23 CORPUS_PREFIX=doorstage-b RUN=doorstage-b OUTDIR=perseed-doorstage-b-control node scripts/doorstage-driver-b.js
// Usage (armed — add LEADERPROJ=1, OUTDIR=perseed-doorstage-b-armed, LEG=armed).
// DOOR_IDS=1,5 runs a subset (smoke only — judged legs run all 16).
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

const LEG = process.env.LEG || 'control';
const EVIDENCE_DATE = process.env.EVIDENCE_DATE || '2026-11-23';
const CORPUS_PREFIX = process.env.CORPUS_PREFIX || 'doorstage-b';
const RUN = process.env.RUN || 'doorstage-b';
const OUTDIR = process.env.OUTDIR || ('perseed-doorstage-b-' + LEG);
const SPEC_PATH = process.env.DOOR_SPEC || path.join(REPO, 'evidence', EVIDENCE_DATE, 'doorstage-b-spec.json');
const DOOR_IDS = (process.env.DOOR_IDS ? process.env.DOOR_IDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : null);
const MAX_CALLS = 30;

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
let POLICY_SHA = 'unknown';
try { POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8')).digest('hex'); } catch (e) {}
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

// LAUNCHPARTY (copied from scripts/pinquaddoor-driver-b.js): the
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

function trickKnownOf(Game, mid) { try { return !!(Game.villageKnowsTrick && Game.villageKnowsTrick(mid)); } catch (e) { return false; } }
function isDead(Game, vid) {
  try { const p = Game.getPerson ? Game.getPerson(vid) : null; if (p) return !!p.dead; } catch (e) {}
  try { const p = Game.vpOf ? Game.vpOf(vid) : null; if (p) return !!p.dead; } catch (e) {}
  return false;
}

// ================= STAGING HELPERS (same pickQuad/gearUp as test-leaderproj-b.js) =================
function pickQuad(Game) {
  const v = Game.state.village || {};
  const hx = (v.px != null ? v.px : 4), hy = (v.py != null ? v.py : 4);
  const roster = (v.roster || []).filter(function (id) { return id !== Game.villagerId; });
  let elig = [];
  try {
    const a = Game.agencyState ? Game.agencyState() : null;
    if (a) {
      a.potential = a.potential || {};
      roster.forEach(function (id) { try { a.potential[id] = true; } catch (e) {} });
      if (a.profiles) roster.forEach(function (id) { try { delete a.profiles[id]; } catch (e) {} });
    }
    elig = roster.filter(function (id) {
      try {
        const prof = Game.npcRangeProfile ? Game.npcRangeProfile(id) : null;
        return prof === 'wanderer' || prof === 'explorer';
      } catch (e) { return false; }
    });
  } catch (e) {}
  if (elig.length < 4) return { ok: false, why: 'only ' + elig.length + ' ranging villagers', hx: hx, hy: hy };
  const q = elig.slice(0, 4);
  v.trust = v.trust || {};
  v.health = v.health || {};
  v.sick = v.sick || {};
  q.forEach(function (id) {
    v.trust[id] = 50; v.health[id] = 100; delete v.sick[id];
    try { Game.npcSetNode(id, hx, hy); } catch (e) {}
  });
  return { ok: true, holder: q[0], c1: q[1], c2: q[2], c3: q[3], hx: hx, hy: hy };
}
function gearUp(Game, ids) {
  const kit = { torso: { itemId: 'hide_armor' }, melee: { itemId: 'hunting_spear' } };
  ids.forEach(function (id) {
    const p = Game.getPerson ? Game.getPerson(id) : (Game.vpOf ? Game.vpOf(id) : null);
    if (p) p.equipped = JSON.parse(JSON.stringify(kit));
  });
}
function measuredArmorP(Game, ids) {
  const S = globalThis.Scattering || {};
  return ids.map(function (id) {
    const ap = (Game.data.villagers || []).find(function (x) { return x.id === id; }) ||
      (Game.data.background_survivors || []).find(function (x) { return x.id === id; });
    return S.equipment.armorOf(ap, Game.data.items);
  });
}

function loadSpec() {
  const raw = JSON.parse(fs.readFileSync(SPEC_PATH, 'utf8'));
  if (!raw || !Array.isArray(raw.doors) || raw.doors.length === 0) throw new Error('doorstage spec has no doors: ' + SPEC_PATH);
  return raw;
}

// The gate-avoid notes, parsed from the live expedition records —
// the SAME regex as the pinquaddoor driver (leaderproj + gateavoid
// arms). Pure read at end of the staged door.
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
    origin: 'expedition' };
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

// Stage ONE door: fresh load, geared pinned quad, staged leader HP,
// single-monster pool, expeditionMonster until a fight or a gate
// fire. Returns the corpus object for this door (errors carried on
// it — a failed door still writes its file so the failure is
// visible, and the leg exits 1).
async function oneDoor(spec, leg) {
  const errors = [];
  const out = {
    seed: spec.seed, door: spec.door, doorSpec: spec, arm: 'doorstage-b', run: RUN, mode: 'pinquaddoor', leg: leg,
    anchorCommit: ANCHOR, slotPresent: SLOT_PRESENT, pinPresent: PIN_PRESENT, senseexpedPresent: SENSE_PRESENT,
    projPresent: PROJ_PRESENT, logPresent: LOG_PRESENT,
    allyslot3Flag: process.env.ALLYSLOT3 || null, pinquadFlag: process.env.PINQUAD || null,
    dmgpinFlag: process.env.DMGPIN || null, doorflee2Flag: process.env.DOORFLEE2 || null,
    hypofloorFlag: process.env.HYPOFLOOR || null, hpgateFlag: process.env.HPGATE || null,
    leaderhpgateFlag: process.env.LEADERHPGATE || null, leaderprojFlag: process.env.LEADERPROJ || null,
    senseexpedFlag: process.env.SENSEEXPED || null,
    policySha: POLICY_SHA, policy: 'competent', policyExecuted: false,
    hpgateFires: 0, leaderhpgateFires: 0, leaderprojFires: 0,
    gateAvoidNotes: [], gateAvoidLog: [],
    v4encounters: [], instrumentErrors: errors,
    measuredArmorP: [], measuredArmorPAtDoor: [], calls: 0, evades: 0, fought: false, fired: false,
    won: false, scaleRank: null, gameDays: 0, endReason: null, deaths: [],
  };
  let Game = null;
  try {
    const loaded = await loadGame({ seed: spec.seed, mode: 'pinquaddoor', fullTelemetry: false });
    Game = loaded.Game;
    await setupGame(Game);
  } catch (e) {
    errors.push('loadGame/setupGame: ' + String(e && e.message || e).slice(0, 120));
    return out;
  }
  const mdef = (Game.data.monsters || []).find(function (m) { return m.id === spec.mid; });
  if (!mdef) { errors.push('monster-missing: ' + spec.mid); return out; }
  if (((mdef.wave | 0) !== (spec.wave | 0))) errors.push('monster-wave-mismatch: ' + spec.mid + ' wave ' + mdef.wave + ' want ' + spec.wave);
  Game.monsterWavePool = function () { return [mdef]; };
  const q = pickQuad(Game);
  if (!q.ok) { errors.push('staging: ' + (q.why || 'no quad')); return out; }
  gearUp(Game, [q.holder, q.c1, q.c2, q.c3]);
  // measuredArmorP is taken HERE, right after gearUp and BEFORE
  // startExpedition — the same point test-pinquaddoor-b.js §1
  // measures at (all four read 30: hide_armor protection). The
  // expedition start re-equips each villager from their own pack
  // (the game's own autoEquip: bark_armor / swat_vest / wool_socks
  // / work_gloves on seed 424200 — the staged hide_armor is NOT in
  // their packs, so it cannot be re-selected). The fight therefore
  // wears pack-best gear, not the staged kit — exactly as in the
  // leaderproj/gateavoid arms, whose fights staged the same way.
  // measuredArmorPAtDoor (below) stamps what the door actually
  // wears, observed with no range assertion; the 8-30 range check
  // applies only to the issued kit, measured here.
  out.measuredArmorP = measuredArmorP(Game, [q.holder, q.c1, q.c2, q.c3]);
  out.measuredArmorP.forEach(function (p) { if (!(p >= 8 && p <= 30)) errors.push('armorP-out-of-range: ' + p); });
  [q.holder, q.c1, q.c2, q.c3].forEach(function (id) {
    Game.startExpedition(id, q.hx, q.hy, false, { tx: 6, ty: 6, duration: 20 });
  });
  const pinned = Game.pinQuadParty(q.holder, [q.c1, q.c2, q.c3]);
  if (pinned !== true) errors.push('pin-failed');
  const v = Game.state.village;
  v.health[q.holder] = spec.leaderHp; v.health[q.c1] = 100; v.health[q.c2] = 100; v.health[q.c3] = 100;
  out.measuredArmorPAtDoor = measuredArmorP(Game, [q.holder, q.c1, q.c2, q.c3]);
  const party = [q.holder, q.c1, q.c2, q.c3];
  out.party = party.slice();
  out.leaderVid = q.holder;
  const deadBefore = {};
  party.forEach(function (id) { deadBefore[id] = isDead(Game, id); });
  const leaderEntryHp = v.health[q.holder];
  if (leaderEntryHp !== spec.leaderHp) errors.push('leaderEntryHp-mismatch: ' + leaderEntryHp + ' want ' + spec.leaderHp);
  const rows = [];
  let evades = 0;
  const origFF = Game.fieldFight;
  Game.fieldFight = function (vid, md, m, opts) {
    let pinAtFight = null;
    try { pinAtFight = (typeof Game.pinnedQuadAllies === 'function') ? Game.pinnedQuadAllies(vid) : null; } catch (e) { pinAtFight = null; }
    const rec = origFF.apply(this, arguments);
    try {
      const row = buildRow(Game, vid, md, opts, rec, leaderEntryHp, pinAtFight);
      if ((row.rounds | 0) >= 1) {
        rows.push(row);
        if (!row.pinned) errors.push('fight-not-pinned');
        if (!row.allyFromStart) errors.push('fight-not-at-door');
      } else evades++;
    } catch (e) { errors.push('row-build: ' + String(e.message).slice(0, 80)); }
    return rec;
  };
  function totalFires() {
    try {
      const ag = Game.agencyState ? Game.agencyState() : null;
      return ((ag && ag.hpgateFires) | 0) + ((ag && ag.leaderhpgateFires) | 0) + ((ag && ag.leaderprojFires) | 0);
    } catch (e) { return 0; }
  }
  const firesBefore = totalFires();
  let calls = 0, fought = false, fired = false;
  while (calls < MAX_CALLS && !fought && !fired) {
    calls++;
    try { Game.expeditionMonster(q.holder, 3, false); }
    catch (e) { errors.push('expeditionMonster: ' + String(e.message).slice(0, 80)); break; }
    if (totalFires() > firesBefore) fired = true;
    if (rows.length > 0) fought = true;
  }
  Game.fieldFight = origFF;
  out.calls = calls;
  out.evades = evades;
  out.fought = fought;
  out.fired = fired;
  if (!fought && !fired) {
    // Diagnostic: was it the win-plan gate turning the party away
    // (not a gate fire, not a fight)? The note names it.
    let wpAvoid = false;
    try {
      const ag = Game.agencyState ? Game.agencyState() : null;
      const encs = ((ag && ag.exped && ag.exped[q.holder]) || {}).encounters || [];
      wpAvoid = encs.some(function (n) { return /going back for help/.test(String(n)); });
    } catch (e) {}
    errors.push('no-fight-no-fire after ' + calls + ' calls' + (wpAvoid ? ' (winPlanFightGate avoid)' : ''));
  }
  try {
    const ag = Game.agencyState ? Game.agencyState() : null;
    out.hpgateFires = (ag && ag.hpgateFires) | 0;
    out.leaderhpgateFires = (ag && ag.leaderhpgateFires) | 0;
    out.leaderprojFires = (ag && ag.leaderprojFires) | 0;
    out.gateAvoidLog = ((ag && ag.gateAvoids) || []).slice();
  } catch (e) {}
  out.gateAvoidNotes = parseGateAvoidNotes(Game);
  out.v4encounters = rows;
  out.gameDays = gday(Game);
  party.forEach(function (id) {
    if (!deadBefore[id] && isDead(Game, id)) out.deaths.push({ vid: id, cause: 'door-fight', day: gday(Game) });
  });
  return out;
}

async function main() {
  if (LEG !== 'control' && LEG !== 'armed') { console.error('DOORSTAGE STOP: LEG must be control|armed, got ' + JSON.stringify(LEG)); process.exit(2); }
  if (!SLOT_PRESENT) { console.error('DOORSTAGE STOP: ALLYSLOT3 slot code absent — this driver measures the ported substrate; stopping, never re-scoping.'); process.exit(2); }
  if (!PIN_PRESENT) { console.error('DOORSTAGE STOP: PINQUAD lever code absent (pinQuadParty / pinnedQuadAllies).'); process.exit(2); }
  if (!PROJ_PRESENT) { console.error('DOORSTAGE STOP: LEADERPROJ gate code absent (villager-agency.js).'); process.exit(2); }
  if (!LOG_PRESENT) { console.error('DOORSTAGE STOP: GATEAVOID durable-log code absent (gateAvoids / proj entry).'); process.exit(2); }
  if (!SENSE_PRESENT) { console.error('DOORSTAGE STOP: the SENSEEXPED sense code (party-wiring.js) must be present.'); process.exit(2); }
  const need = ['SENSEEXPED', 'PARTYSIZE4', 'VETREENGAGE', 'FLEEREPAIR2', 'FIGHTALLY2', 'ALLYSLOT3', 'PINQUAD', 'DMGPIN', 'DOORFLEE2', 'HYPOFLOOR', 'HPGATE'];
  for (const f of need) {
    if (process.env[f] !== '1') { console.error('DOORSTAGE STOP: ' + f + '=1 required (substrate).'); process.exit(2); }
  }
  if (process.env.LEADERHPGATE) { console.error('DOORSTAGE STOP: LEADERHPGATE must be unset on both legs (the leader floor is NOT carried).'); process.exit(2); }
  if (LEG === 'armed' && process.env.LEADERPROJ !== '1') { console.error('DOORSTAGE STOP: LEG=armed requires LEADERPROJ=1.'); process.exit(2); }
  if (LEG === 'control' && process.env.LEADERPROJ) { console.error('DOORSTAGE STOP: LEG=control requires LEADERPROJ unset (gate OFF).'); process.exit(2); }
  if (String(POLICY_SHA).slice(0, 12) !== '1884c8852d38') { console.error('DOORSTAGE STOP: policySha mismatch ' + String(POLICY_SHA).slice(0, 12) + ' want 1884c8852d38.'); process.exit(2); }
  const spec = loadSpec();
  const doors = DOOR_IDS ? spec.doors.filter(function (d) { return DOOR_IDS.indexOf(d.door) !== -1; }) : spec.doors.slice();
  if (doors.length === 0) { console.error('DOORSTAGE STOP: no doors selected.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', EVIDENCE_DATE, OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const d of doors) {
    const file = path.join(outDir, CORPUS_PREFIX + '-s' + d.seed + '-' + RUN + '-pinquaddoor.json');
    if (fs.existsSync(file)) { console.error('DOORSTAGE STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  let anyErrors = false;
  for (const d of doors) {
    const out = await oneDoor(d, LEG);
    const file = path.join(outDir, CORPUS_PREFIX + '-s' + d.seed + '-' + RUN + '-pinquaddoor.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    if (out.instrumentErrors.length) anyErrors = true;
    console.log(JSON.stringify({
      seed: out.seed, door: out.door, mid: d.mid, wave: d.wave, leaderHp: d.leaderHp,
      leg: LEG, anchor: (out.anchorCommit || '').slice(0, 12),
      slotPresent: out.slotPresent, pinPresent: out.pinPresent,
      leaderprojFlag: out.leaderprojFlag, leaderprojFires: out.leaderprojFires,
      hpgateFires: out.hpgateFires, leaderhpgateFires: out.leaderhpgateFires,
      gateAvoidNotes: out.gateAvoidNotes.length, gateAvoidLog: out.gateAvoidLog.length,
      fought: out.fought, fired: out.fired, calls: out.calls, evades: out.evades,
      encounters: out.v4encounters.length,
      outcome: out.v4encounters.length ? out.v4encounters[0].outcome : null,
      rounds: out.v4encounters.length ? out.v4encounters[0].rounds : null,
      dealt: out.v4encounters.length ? out.v4encounters[0].mDealt : null,
      deaths: out.deaths.length, measuredArmorP: out.measuredArmorP,
      errors: out.instrumentErrors.length, file: path.relative(REPO, file),
    }));
  }
  if (anyErrors) { console.error('DOORSTAGE: instrument errors present — see per-door lines above.'); process.exit(1); }
}

if (require.main === module) {
  main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
}

module.exports = { oneDoor: oneDoor, loadSpec: loadSpec, pickQuad: pickQuad, gearUp: gearUp, measuredArmorP: measuredArmorP, parseGateAvoidNotes: parseGateAvoidNotes, buildRow: buildRow, recoverMHpStart: recoverMHpStart };
