// deadplan-driver-20261117.js — JUDGED driver, arm sim-deadplan-b
// (DIAG: does a dead plan-holder's lingering winPlan cost anything —
// pool pollution, companion-slot blocking, census noise — or is it
// noise-only? Haventick's named next diagnostic #3). The haventick
// driver extended, not rebuilt (same vetfirst T-class instrument,
// same v4seeds / v4departs / v4gates / v4encounters recorder, same
// dawnbid bid/census capture, same companionPool first-fail capture
// + members extension, same four-path seed classification, same
// creation ledger v4creates + planCensus) PLUS the DEAD-TOUCH
// EXTENSION: every winPlan entry-point call is recorded in
// deadTouches with the subject's aliveness at call time
// (winPlanOf / winPlanHavenTick / winPlanDepart /
// winPlanSeedFromFight / winPlanNoteFight / winPlanNoteKill /
// winPlanFightGate / winPlanSecondCompanion / winPlanBondsTick /
// winPlanMusterTick / vbrainExecuteDepart), and holderAlive is
// carried on v4creates, dawnbidScores, v4departs, and companionPool
// rankedPick rows. There is NO seed call in this arm: both legs are
// master as-is; OFF = recorder off, ON = recorder on.
// Policy: competent verbatim (scripts/policies/competent.js), 150d
// death-aware. All recorder wraps are pure reads plus writes to
// driver-local arrays — no game-state writes, no RNG. Capturing the
// stack is a pure read (no RNG, no state); the classification is a
// string match over it.
// DEADPLAN_RECORDER=off skips installing the wraps (determinism
// leg D2). MODE=off also runs recorder-off.
// RECORDER ROWS (per seed, top-level v4encounters / v4gates /
// v4seeds / v4departs — as dawnbid — plus dawnbidScores /
// dawnbidDeparts / dawnbidCensus / dawnbidStarts, plus companionPool,
// plus v4creates / planCensus, plus deadTouches):
// a pool row is one scored dawn for a wave-4+ plan holder:
// {day, part, vid, target, stage, holderProfile, holderNode, haven,
// rosterN, counts {selfOrScholar, dead, away, trustLow, notAtHaven,
// engaged, notRanger, onExped, eligible}, eligible [roster order],
// rankedOrder [{id, s}], rankedPick, rankedPickAlive, rankedVia,
// bidCompanion, agree,
// members [{id, profile, trust, trustRaw, node, away, engaged,
// onExped, alive, firstFail}]}.
// a v4creates row is one observed plan creation:
// {day, vid, holderAlive, creator, source, profile, stageAfter,
// target, needWave, foughtN, slainN, caller}.
// a deadTouches row is one wrapped winPlan entry-point call:
// {day, method, vid, holderAlive, planExistedBefore,
// planExistedAfter, caller, ...method extras}. holderAlive is
// ALWAYS a boolean: for winPlanBondsTick / winPlanMusterTick the
// subject is the returned actor (actor null = no actor selected,
// recorded holderAlive true — the tick selected nobody, so it
// touched no holder's plan).
// Usage:
//   MODE=off OUTDIR=perseed-deadplan-b-off SEEDS=103221,103222 RUN=deadplan-b node scripts/deadplan-driver-20261117.js
//   MODE=on OUTDIR=perseed-deadplan-b-on SEEDS=103221,103222 RUN=deadplan-b node scripts/deadplan-driver-20261117.js
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
const RUN = process.env.RUN || 'deadplan-b';
const MODE = process.env.MODE || 'on';
const OUTDIR = process.env.OUTDIR || ('perseed-deadplan-b-' + MODE);
const RECORDER_ON = (MODE === 'on') && process.env.DEADPLAN_RECORDER !== 'off';
const NONDEATH_RECORDER_ON = RECORDER_ON && process.env.NONDEATH_RECORDER === 'on';

if (MODE !== 'off' && MODE !== 'on') { console.error('DEADPLAN STOP: MODE must be off|on, got ' + JSON.stringify(MODE)); process.exit(2); }

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

// ---- DEADPLAN helpers (module scope: the proof test requires them) ----
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
      if (line.indexOf('deadplan-driver-20261117.js') !== -1) continue;
      if (line.indexOf('deadplan-caller') !== -1) continue;
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

// ---- DEADPLAN helpers (module scope: the proof test requires them) ----
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
// 'both', or the explicit 'unknown-deadplan-no-engagement' (never
// expected: havenTick's creation branch requires engagement).
function classifyHavenSource(foughtN, slainN) {
  const f = (foughtN | 0) > 0, s = (slainN | 0) > 0;
  if (f && s) return 'both';
  if (f) return 'lived';
  if (s) return 'heard';
  return 'unknown-deadplan-no-engagement';
}
function isNamedCreator(c) { return CREATORS.indexOf(c) !== -1; }

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
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'deadplan-' + MODE, fullTelemetry: false });
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
  // ---- DEAD-TOUCH RECORDER (deadplan extension) ----
  // deadTouches: one row per wrapped winPlan entry-point call, with
  // the subject's aliveness at call time. A row with holderAlive
  // false IS a touch of a dead holder's plan; the analyzer counts
  // them per method and enumerates every one. Pure reads +
  // driver-local writes, no RNG, no game-state writes.
  const deadTouches = [];
  function personAlive(vid) {
    try { const p = Game.getPerson ? Game.getPerson(vid) : null; return !(p && p.dead); } catch (e) { return true; }
  }
  function deadPartyMembers(party) {
    const out = [];
    try {
      for (const pid of (party || [])) if (pid && !personAlive(pid)) out.push(pid);
    } catch (e) {}
    return out;
  }
  function touchRow(method, vid, planBefore, extra) {
    const row = { day: gday(Game), method: method, vid: (vid == null ? null : vid),
      holderAlive: (vid == null) ? true : personAlive(vid),
      planExistedBefore: !!planBefore, planExistedAfter: !!planOf(vid),
      caller: null };
    try { row.caller = firstCallerFrame((new Error('deadplan-caller')).stack || ''); } catch (e) { row.caller = null; }
    if (extra) for (const k in extra) row[k] = extra[k];
    deadTouches.push(row);
    return row;
  }
  const dawnbidScores = [];
  const dawnbidDeparts = [];
  const dawnbidCensus = [];
  const dawnbidStarts = [];
  // ---- DEADPLAN: dawn-pool completeness ----
  // dawnScored: one row per vbrainScorePick call, EVERY villager,
  // EVERY dawn (not just wave-4 / win-plan-candidate calls).
  const dawnScored = [];
  // ---- COMPANIONPOOL CAPTURE ----
  const companionPool = [];
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
        let planBeforeGate = null;
        try { planBeforeGate = planOf(vid); } catch (e) { planBeforeGate = null; }
        const ret = origGate.apply(this, arguments);
        try {
          const planAfterGate = planOf(vid);
          touchRow('winPlanFightGate', vid, planBeforeGate, {
            result: ret ? (ret.avoid ? 'avoid' : (ret.seek ? 'seek' : 'other')) : 'null',
            reason: (ret && ret.reason) || null,
            partyDeadMembers: deadPartyMembers(planAfterGate && planAfterGate.party ? planAfterGate.party : []),
          });
        } catch (e) { errors.push('deadplan-gate-touch: ' + String(e.message).slice(0, 80)); }
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
        // DEADPLAN: classify the firing path BEFORE the call, from
        // the outcome + the caller's stack (the stack is a pure read;
        // the classification never touches game state or RNG).
        let seedPath = 'unknown-no-stack';
        let seedCaller = null;
        let planBefore = null;
        try {
          const st = (new Error('deadplan-caller')).stack || '';
          seedCaller = firstCallerFrame(st);
          seedPath = classifySeedPath(outcome || null, st);
        } catch (e) { seedPath = 'unknown-stack-error'; }
        try { planBefore = planOf(vid); } catch (e) { planBefore = null; }
        const ret = origSeed.apply(this, arguments);
        try {
          const planAfterSeed = planOf(vid);
          touchRow('winPlanSeedFromFight', vid, planBefore, {
            outcome: outcome || null, path: seedPath,
            partyDeadMembers: deadPartyMembers(planAfterSeed && planAfterSeed.party ? planAfterSeed.party : []),
          });
        } catch (e) { errors.push('deadplan-seed-touch: ' + String(e.message).slice(0, 80)); }
        try {
          const w = waveOf(mdef);
          if (w >= 3 && mdef && mdef.id) {
            const plan = planOf(vid);
            v4seeds.push({ day: gday(Game), vid: vid, mid: mdef.id, wave: w, outcome: outcome || null,
              path: seedPath, caller: seedCaller, holderAlive: personAlive(vid),
              planExistedBefore: !!planBefore,
              stageAfter: plan ? plan.stage : null, target: plan ? plan.target : null,
              node: plan && plan.node ? { nx: plan.node.nx, ny: plan.node.ny } : null });
            // CREATION LEDGER: the call created a plan (none existed
            // before). A refresh/retarget (plan existed) is NOT a
            // creation — it is listed in the episode's firings only.
            if (!planBefore && plan) {
              let prof = null;
              try { prof = this.npcRangeProfile ? this.npcRangeProfile(vid) : null; } catch (e) {}
              v4creates.push({ day: gday(Game), vid: vid, holderAlive: personAlive(vid), creator: seedPath, source: null,
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
        let planBefore = null;
        try { planBefore = planOf(vid); } catch (e) { planBefore = null; }
        const ret = origHaven.apply(this, arguments);
        try {
          const planAfterHaven = planOf(vid);
          touchRow('winPlanHavenTick', vid, planBefore, {
            result: ret ? 'plan' : 'null',
            partyDeadMembers: deadPartyMembers(planAfterHaven && planAfterHaven.party ? planAfterHaven.party : []),
          });
        } catch (e) { errors.push('deadplan-haven-touch: ' + String(e.message).slice(0, 80)); }
        try {
          const plan = planOf(vid);
          if (!planBefore && plan) {
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
            try { prof = this.npcRangeProfile ? this.npcRangeProfile(vid) : null; } catch (e) {}
            let caller = null;
            try { caller = firstCallerFrame((new Error('deadplan-caller')).stack || ''); } catch (e) {}
            v4creates.push({ day: gday(Game), vid: vid, holderAlive: personAlive(vid), creator: 'havenTick',
              source: classifyHavenSource(foughtN, slainN),
              profile: prof, stageAfter: plan.stage || null, target: plan.target || null,
              needWave: (plan.needWave != null ? plan.needWave : null),
              foughtN: foughtN, slainN: slainN, caller: caller });
          }
        } catch (e) { errors.push('v4haven-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('winPlanHavenTick-wrap: not a function');
  } catch (e) { errors.push('winPlanHavenTick-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origWinPlanOf = Game.winPlanOf;
    if (RECORDER_ON && typeof origWinPlanOf === 'function') {
      Game.winPlanOf = function (vid) {
        let planBefore = null;
        try { planBefore = planOf(vid); } catch (e) { planBefore = null; }
        const ret = origWinPlanOf.apply(this, arguments);
        try {
          const planAfterOf = planOf(vid);
          touchRow('winPlanOf', vid, planBefore, {
            created: !planBefore && !!planAfterOf,
            partyDeadMembers: deadPartyMembers(planAfterOf && planAfterOf.party ? planAfterOf.party : []),
          });
        } catch (e) { errors.push('deadplan-winplanof-touch: ' + String(e.message).slice(0, 80)); }
        try {
          const plan = planOf(vid);
          if (!planBefore && plan) {
            let prof = null;
            try { prof = this.npcRangeProfile ? this.npcRangeProfile(vid) : null; } catch (e) {}
            let caller = null;
            try { caller = firstCallerFrame((new Error('deadplan-caller')).stack || ''); } catch (e) {}
            v4creates.push({ day: gday(Game), vid: vid, holderAlive: personAlive(vid), creator: 'winPlanOf', source: null,
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
        let planBeforeDepart = null, partyBeforeDepart = [];
        try { planBeforeDepart = planOf(vid); partyBeforeDepart = (planBeforeDepart && planBeforeDepart.party) ? planBeforeDepart.party.slice() : []; } catch (e) {}
        const ret = origDepart.apply(this, arguments);
        try {
          const planAfterDepart = planOf(vid);
          touchRow('winPlanDepart', vid, planBeforeDepart, {
            result: ret || null,
            partyBefore: partyBeforeDepart,
            partyAfter: planAfterDepart && planAfterDepart.party ? planAfterDepart.party.slice() : [],
            partyDeadMembers: deadPartyMembers(planAfterDepart && planAfterDepart.party ? planAfterDepart.party : []),
          });
        } catch (e) { errors.push('deadplan-depart-touch: ' + String(e.message).slice(0, 80)); }
        try {
          const plan = planOf(vid);
          if (plan && (ret === 'hold' || ret === 'launch')) {
            const ps = partyStats(plan.party || []);
            v4departs.push({ day: gday(Game), vid: vid, source: 'winPlanDepart', result: ret, stage: plan.stage,
              target: plan.target || null, party: (plan.party || []).slice(), partySize: (plan.party || []).length + 1,
              partyKillers: ps.killers, partyArmed: ps.armed,
              holderAlive: personAlive(vid),
              partyAlive: (plan.party || []).map(function (pid) { return { id: pid, alive: personAlive(pid) }; }),
              targetWave: plan.needWave || null });
          }
        } catch (e) { errors.push('v4depart-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('winPlanDepart-wrap: not a function');
  } catch (e) { errors.push('winPlanDepart-wrap-install: ' + String(e.message).slice(0, 80)); }
  // ---- DEAD-TOUCH wraps: the remaining winPlan entry points ----
  // winPlanNoteFight / winPlanNoteKill (expeditionMonster, fighter),
  // winPlanSecondCompanion (launch trio pick), winPlanBondsTick /
  // winPlanMusterTick (plan-actor ticks; subject = returned actor,
  // null actor = nobody selected). Pure reads + driver-local writes.
  try {
    const origNoteFight = Game.winPlanNoteFight;
    if (RECORDER_ON && typeof origNoteFight === 'function') {
      Game.winPlanNoteFight = function (vid, allyVids) {
        let planBefore = null;
        try { planBefore = planOf(vid); } catch (e) { planBefore = null; }
        const ret = origNoteFight.apply(this, arguments);
        try {
          touchRow('winPlanNoteFight', vid, planBefore, {
            allyVids: (allyVids || []).slice(),
            allyDead: (allyVids || []).filter(function (x) { return x && !personAlive(x); }),
          });
        } catch (e) { errors.push('deadplan-notefight-touch: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('winPlanNoteFight-wrap: not a function');
  } catch (e) { errors.push('winPlanNoteFight-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origNoteKill = Game.winPlanNoteKill;
    if (RECORDER_ON && typeof origNoteKill === 'function') {
      Game.winPlanNoteKill = function (vid, mdef) {
        let planBefore = null;
        try { planBefore = planOf(vid); } catch (e) { planBefore = null; }
        const ret = origNoteKill.apply(this, arguments);
        try {
          touchRow('winPlanNoteKill', vid, planBefore, {
            mid: (mdef && mdef.id) || null, wave: waveOf(mdef),
          });
        } catch (e) { errors.push('deadplan-notekill-touch: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('winPlanNoteKill-wrap: not a function');
  } catch (e) { errors.push('winPlanNoteKill-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origSecond = Game.winPlanSecondCompanion;
    if (RECORDER_ON && typeof origSecond === 'function') {
      Game.winPlanSecondCompanion = function (vid, hx, hy, firstCid) {
        let planBefore = null;
        try { planBefore = planOf(vid); } catch (e) { planBefore = null; }
        const ret = origSecond.apply(this, arguments);
        try {
          touchRow('winPlanSecondCompanion', vid, planBefore, {
            firstCid: firstCid || null,
            pick: ret || null, pickAlive: ret ? personAlive(ret) : null,
          });
        } catch (e) { errors.push('deadplan-second-touch: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('winPlanSecondCompanion-wrap: not a function');
  } catch (e) { errors.push('winPlanSecondCompanion-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origBonds = Game.winPlanBondsTick;
    if (RECORDER_ON && typeof origBonds === 'function') {
      Game.winPlanBondsTick = function (hx, hy) {
        const ret = origBonds.apply(this, arguments);
        try {
          const actor = (ret && ret.actor) || null;
          touchRow('winPlanBondsTick', actor, null, {
            actor: actor, actorAlive: actor ? personAlive(actor) : null,
            tended: (ret && ret.tended) ? ret.tended.slice() : [],
          });
        } catch (e) { errors.push('deadplan-bonds-touch: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('winPlanBondsTick-wrap: not a function');
  } catch (e) { errors.push('winPlanBondsTick-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origMuster = Game.winPlanMusterTick;
    if (RECORDER_ON && typeof origMuster === 'function') {
      Game.winPlanMusterTick = function (hx, hy) {
        const ret = origMuster.apply(this, arguments);
        try {
          const actor = (ret && ret.actor) || null;
          touchRow('winPlanMusterTick', actor, null, {
            actor: actor, actorAlive: actor ? personAlive(actor) : null,
            stoodDown: !!(ret && ret.stoodDown),
          });
        } catch (e) { errors.push('deadplan-muster-touch: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (RECORDER_ON) errors.push('winPlanMusterTick-wrap: not a function');
  } catch (e) { errors.push('winPlanMusterTick-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origBrainDepart = Game.vbrainExecuteDepart;
    if (RECORDER_ON && typeof origBrainDepart === 'function') {
      Game.vbrainExecuteDepart = function (vid, hx, hy, playerAtHaven) {
        let commit = null;
        try { commit = (typeof this.vbrainCommit === 'function') ? this.vbrainCommit(vid) : null; } catch (e) {}
        let planBeforeBrain = null;
        try { planBeforeBrain = planOf(vid); } catch (e) { planBeforeBrain = null; }
        const ret = origBrainDepart.apply(this, arguments);
        try {
          touchRow('vbrainExecuteDepart', vid, planBeforeBrain, {
            result: ret || null,
            winPlanAction: commit ? (commit.winPlanAction || null) : null,
            companion: commit ? (commit.companion || null) : null,
            companionAlive: commit && commit.companion ? personAlive(commit.companion) : null,
            companion2: commit ? (commit.companion2 || null) : null,
            companion2Alive: commit && commit.companion2 ? personAlive(commit.companion2) : null,
          });
        } catch (e) { errors.push('deadplan-braindepart-touch: ' + String(e.message).slice(0, 80)); }
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
              holderAlive: personAlive(vid),
              companionAlive: commit.companion ? personAlive(commit.companion) : null,
              partyAlive: (plan && plan.party ? plan.party : []).map(function (pid) { return { id: pid, alive: personAlive(pid) }; }),
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
                holderAlive: personAlive(vid),
                companionAlive: commit && commit.companion ? personAlive(commit.companion) : null,
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
              holderAlive: personAlive(vid),
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
          // DEADPLAN: dawn-pool completeness — EVERY scoring call is
          // recorded here (not just wave-4 / win-plan-candidate
          // calls, which is all dawnbidScores keeps), so a dead
          // villager scored at dawn is caught whatever their plan
          // stage. winPlanCands returns no candidate for a
          // gear-armed, standing-no-companion, or hunt-no-companion
          // holder, so the conditional block below cannot prove the
          // dawn pass never scores the dead; this array can.
          const planPre = planOf(vid);
          const hasWinPlanCandPre = (candsProj || []).some(function (c) { return c && c.winPlanAction; });
          dawnScored.push({ day: gday(Game), part: (Game.dayPart | 0), vid: vid,
            holderAlive: personAlive(vid),
            planStage: planPre ? (planPre.stage || null) : null,
            planTarget: planPre ? (planPre.target || null) : null,
            hasWinPlanCand: hasWinPlanCandPre });
        } catch (e) { errors.push('deadplan-dawnscored-log: ' + String(e.message).slice(0, 80)); }
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
              holderAlive: personAlive(vid),
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
                    rankedPickAlive: pool.rankedPick ? personAlive(pool.rankedPick) : null,
                    rankedVia: pool.rankedVia, bidCompanion: bidCompanion,
                    agree: bidCompanion == null ? null : (pool.rankedPick === bidCompanion),
                    members: pool.members });
                } else {
                  errors.push('deadplan-replica-null: day ' + gday(Game) + ' vid ' + vid);
                }
              }
            } catch (e) { errors.push('deadplan-log: ' + String(e.message).slice(0, 80)); }
          }
        } catch (e) { errors.push('dawnbid-score-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (!RECORDER_ON) { /* wraps off — determinism leg D2 */ }
    else errors.push('vbrainScorePick-wrap: not a function');
  } catch (e) { errors.push('vbrainScorePick-wrap-install: ' + String(e.message).slice(0, 80)); }

  // ---- NONDEATH: removal ledger (sim-nondeathplan-b extension) ----
  // Opt-in (NONDEATH_RECORDER=on): wraps Game.removeVillager and
  // records every removal call {day, vid, how} into `removals` — the
  // exact removal day + how the corpus otherwise never carries
  // (planCensus holderAlive is a dead-flag read; a leaver reads
  // alive). Pure reads + driver-local writes, no RNG, no game-state
  // writes — same class as every other wrap here. When the env is
  // unset this block does not execute at all (NONDEATH_RECORDER_ON
  // is false), so deadplan/deathcleanup behavior is byte-identical.
  // Installed after setupGame like the other wraps; removals during
  // setup are not expected, and the analyzer's roster-disappearance
  // derivation covers any removal the wrap misses (e.g. the party.js
  // direct-roster bypass on the control leg).
  const removals = [];
  try {
    const origRemove = Game.removeVillager;
    if (NONDEATH_RECORDER_ON && typeof origRemove === 'function') {
      Game.removeVillager = function (vid, how) {
        const ret = origRemove.apply(this, arguments);
        try {
          removals.push({ day: gday(Game), vid: (vid == null ? null : vid), how: (how == null ? null : how) });
        } catch (e) { errors.push('nondeath-removal-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else if (NONDEATH_RECORDER_ON) errors.push('removeVillager-wrap: not a function');
  } catch (e) { errors.push('removeVillager-wrap-install: ' + String(e.message).slice(0, 80)); }
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
            // day over day). Pure reads. DEADPLAN: the same pass
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
    seed: seed, arm: 'deadplan-b', run: RUN, mode: MODE, leg: MODE,
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
    instrumentErrors: (vf ? vf.t.instrumentErrors : []).concat(errors),
    deaths: deaths,
    samples: result.samples || null,
    v4seeds: v4seeds, v4departs: v4departs, v4gates: v4gates, v4encounters: v4encounters,
    dawnbidScores: dawnbidScores, dawnbidDeparts: dawnbidDeparts, dawnbidCensus: dawnbidCensus,
    dawnbidStarts: dawnbidStarts,
    companionPool: companionPool,
    v4creates: v4creates, planCensus: planCensus,
    deadTouches: deadTouches, dawnScored: dawnScored,
    removals: removals,
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
  if (!SEEDS.length) { console.error('DEADPLAN STOP: SEEDS required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-16', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'deadplan-b-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('DEADPLAN STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'deadplan-b-s' + seed + '-' + RUN + '-' + MODE + '.json');
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
      deadTouches: out.deadTouches.length, dawnScored: out.dawnScored.length,
      removals: (out.removals || []).length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

const DEADPLAN_TOUCH_METHODS = ['winPlanOf', 'winPlanHavenTick', 'winPlanDepart', 'winPlanSeedFromFight', 'winPlanNoteFight', 'winPlanNoteKill', 'winPlanFightGate', 'winPlanSecondCompanion', 'winPlanBondsTick', 'winPlanMusterTick', 'vbrainExecuteDepart'];
module.exports = { oneRun: oneRun, loadWave4Ids: loadWave4Ids, planIsWave4: planIsWave4, deriveLaunchBlock: deriveLaunchBlock, poolReplica: poolReplica, classifySeedPath: classifySeedPath, firstCallerFrame: firstCallerFrame, SEED_PATHS: SEED_PATHS, classifyHavenSource: classifyHavenSource, isNamedCreator: isNamedCreator, CREATORS: CREATORS, DEADPLAN_TOUCH_METHODS: DEADPLAN_TOUCH_METHODS };
