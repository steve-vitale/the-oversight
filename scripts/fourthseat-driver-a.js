// fourthseat-driver-a.js — DIAG driver, arm sim-fourthseat-a
// (THE 4TH PARTY SEAT: why does it never appear in wave-4 fights?
// partydmg-a: 22 fought expedition wave-4 fights, every one exactly
// 3 fighters — lead 52.4% / ally1 20.9% / ally2 26.7% / ally3 0 —
// but on a flagged substrate (FIGHTALLY2=1, PARTYSIZE4=1,
// VETREENGAGE=1, SENSEEXPED=1). This driver re-asks the question on
// PLAIN MASTER, no env flags, and instruments every layer that could
// cap the seat: recruitment (does a 4th companion even exist?),
// sense (does villagerFightAllies ever return a 3rd id?), engine
// (does fieldFight ever take a 3rd ally?), call-in (does the shout
// ladder ever reach a 3rd join?).
//
// RECORDER ONLY — no game-code or policy change. Pure reads +
// driver-local writes; every original runs exactly once, untouched.
// A neutral recorder env flag is NOT used: the point is the plain
// master baseline, so the driver loud-stops if ANY lever flag is
// set (VETREENGAGE / PARTYSIZE4 / FIGHTALLY2 / ALLYSLOT3 /
// SENSEEXPED / FLEEREPAIR2 / DMGPIN / PINQUAD).
//
// Instruments (prereg §0):
//   (1) w4fights: EVERY wave>=4 fieldFight, ANY origin — rich row:
//       entry (lead, allyVids passed FULL pre-slice, allies count,
//       allyFromStart, origin from the call stack), the 4th-companion
//       snapshot at fight time (expedition companions sharing the
//       lead's target, winPlan.party, pinned quad, scholar party
//       when the lead is the scholar, living roster), the sense list
//       re-read at fight time (villagerFightAllies is pure — reads
//       only, no RNG — so calling it pre-fight is a clean re-read),
//       and post-call the fight record itself (outcome, rounds,
//       per-seat dealt tallies, ally vids + join flags, shout
//       rounds, full log, roundsDetail, recovered mHpStart).
//   (2) senseCalls: EVERY villagerFightAllies call in the wild —
//       day, vid, returned list, launch companions co-travelling
//       at call time. The sense cap, measured live.
//   (3) departs: light launch rows (vbrainExecuteDepart commit
//       companion/companion2/companion3 + plan.party; winPlanDepart
//       party) — does a 4th companion ever get LAUNCHED?
//   (4) planCensus: daily, per live wave-4 plan — party length,
//       stage, target; tracks the max party size ever seen in the
//       village (recruitment ceiling, not just fight-time).
//
// Policy: competent verbatim (scripts/policies/competent.js), 150d
// death-aware. Single leg: MODE=base. Band 112201-112208 (fresh —
// see prereg). rowSeq resets per seed (partydmg-a §6 lesson:
// process-position-dependent seq broke byte-identical reruns).
// Usage:
//   MODE=base OUTDIR=perseed-fourthseat-a SEEDS=112201,112202 RUN=fourthseat-a node scripts/fourthseat-driver-a.js
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'fourthseat-a';
const MODE = process.env.MODE || 'base';
const OUTDIR = process.env.OUTDIR || ('perseed-fourthseat-a-' + MODE);
const RECORDER_ON = process.env.FOURTHSEAT_RECORDER !== 'off';

// Any lever flag set = loud stop (plain-master baseline only).
const FLAG_VARS = ['VETREENGAGE', 'PARTYSIZE4', 'FIGHTALLY2', 'ALLYSLOT3', 'SENSEEXPED', 'FLEEREPAIR2', 'DMGPIN', 'PINQUAD'];
const FLAGS_SET = FLAG_VARS.filter(function (v) { return process.env[v] === '1'; });

// Wave-4/5 id sets (re-read live so the recorder refuses a stale
// roster silently).
function loadWaveIds(wave) {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    return list.filter(function (m) { return m.wave === wave; }).map(function (m) { return m.id; }).sort();
  } catch (e) { return []; }
}
const W4_SET = new Set(loadWaveIds(4));
const W5_SET = new Set(loadWaveIds(5));

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
let POLICY_SHA = 'unknown';
try { POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8')).digest('hex').slice(0, 12); } catch (e) {}
function sha12(file) {
  try { return crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, file), 'utf8')).digest('hex').slice(0, 12); } catch (e) { return 'unknown'; }
}
const WIRING_SHA = sha12('src/js/party-wiring.js');
const FIGHTS_SHA = sha12('src/js/fieldFights.js');
const BRAIN_SHA = sha12('src/js/villager-brain.js');
const PARTY_SHA = sha12('src/js/party.js');
// Flag presence in the code (self-describing corpus, partydmg style).
function flagPresent(file, re) { try { return re.test(fs.readFileSync(path.join(REPO, file), 'utf8')); } catch (e) { return false; } }
const ALLYSLOT3_PRESENT = flagPresent('src/js/fieldFights.js', /ALLYSLOT3/) && flagPresent('src/js/party-wiring.js', /ALLYSLOT3/);
const FIGHTALLY2_PRESENT = flagPresent('src/js/fieldFights.js', /FIGHTALLY2/);
const PARTYSIZE4_PRESENT = flagPresent('src/js/villager-brain.js', /PARTYSIZE4/);

function sleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) {
    const t0 = process.hrtime.bigint();
    while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
  }
}
// Host write flap (2026-11-19): swallow stream errors so a refused
// log write can never kill the sim; per-seed corpus files are the
// source of truth and are verified after the run.
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
  return false;
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function safe(fn, fallback) { try { const v = fn(); return v === undefined ? fallback : v; } catch (e) { return fallback; } }

// rowSeq: reset at the start of each seed's oneRun (partydmg-a §6).
let rowSeq = 0;
function nextSeq() { return ++rowSeq; }

// fightOrigin(stackOverride): the fieldFight caller, read from the
// call stack — the gatelever-driver taxonomy (expedition |
// world-tick | patrol | aid | other:<fn> | unclassified). Copied
// from scripts/partydmg-driver-a.js (same code, same taxonomy).
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
      if (file.indexOf('fourthseat-driver-a.js') !== -1) continue;
      if (file.indexOf('sim-harness') !== -1) continue;
      if (file.indexOf('src/js/') === -1 && file.indexOf('src\\js\\') === -1) continue;
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

// recoverMHpStart(rec, preHp): spawned HP recovered AFTER the call
// from the fight record (partydmg-driver-a.js, finding #2488).
// Copied verbatim — same semantics, same fields.
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

function planOfGame(Game, vid) {
  try { const v = (Game.state || {}).village || {}; return (v.winPlan || {})[vid] || null; } catch (e) { return null; }
}
function planIsWave4(Game, plan) {
  if (!plan) return false;
  if ((plan.needWave | 0) >= 4) return true;
  return !!(plan.target && (W4_SET.has(plan.target) || W5_SET.has(plan.target)));
}
function refNameOf(Game, vid) {
  try {
    if (Game.firstRef && vid !== Game.villagerId) return Game.firstRef(vid);
    return (Game.displayName ? Game.displayName(vid).split(' ')[0] : 'Someone');
  } catch (e) { return 'Someone'; }
}

// expeditionCompanions(Game, vid): the SENSEEXPED membership rule
// as a pure read (party-wiring.js): agencyState().exped entries
// sharing the fighter's target (tx, ty), in expedition-start order
// (sinceDay, then sincePart). No env flag needed — this is a read
// of the expedition state itself, not the gated sense. Returns
// { myTarget, companions: [vid...] } (companions exclude vid).
function expeditionCompanions(Game, vid) {
  try {
    const a = Game.agencyState ? Game.agencyState() : null;
    const myExped = (a && a.exped) ? a.exped[vid] : null;
    if (!myExped) return { myTarget: null, companions: [] };
    const comp = [];
    const exped = a.exped;
    for (const rid in exped) {
      if (!Object.prototype.hasOwnProperty.call(exped, rid)) continue;
      const e2 = exped[rid];
      if (!e2 || rid === vid) continue;
      if (e2.tx !== myExped.tx || e2.ty !== myExped.ty) continue;
      comp.push({ rid: rid, sinceDay: (e2.sinceDay | 0), sincePart: (e2.sincePart | 0) });
    }
    comp.sort(function (x, y) {
      if (x.sinceDay !== y.sinceDay) return x.sinceDay - y.sinceDay;
      if (x.sincePart !== y.sincePart) return x.sincePart - y.sincePart;
      return (x.rid < y.rid) ? -1 : (x.rid > y.rid) ? 1 : 0;
    });
    return { myTarget: { tx: myExped.tx, ty: myExped.ty }, companions: comp.map(function (c) { return c.rid; }) };
  } catch (e) { return { myTarget: null, companions: [] }; }
}

// pinnedQuadOf(Game, vid): the pinned quad, if the pin exists and
// the function exists. Pure read; [] when absent (no pin / no fn).
function pinnedQuadOf(Game, vid) {
  try {
    if (typeof Game.pinnedQuadAllies === 'function') return (Game.pinnedQuadAllies(vid) || []).slice();
  } catch (e) {}
  return [];
}

// rosterCounts(Game): living roster size (roster minus dead).
function rosterCounts(Game) {
  try {
    const v = (Game.state || {}).village || {};
    const roster = v.roster || [];
    let living = 0;
    for (let i = 0; i < roster.length; i++) {
      try { const p = Game.getPerson ? Game.getPerson(roster[i]) : null; if (!p || !p.dead) living++; } catch (e) { living++; }
    }
    return { rosterN: roster.length, livingN: living };
  } catch (e) { return { rosterN: null, livingN: null }; }
}

// scholarPartyOf(Game, vid): only when the lead IS the scholar —
// the scholar's own party roster size + cap (party.js). Nulls
// otherwise (villager leads have no scholar party).
function scholarPartyOf(Game, vid) {
  try {
    if (vid !== Game.villagerId) return { partyN: null, partyCap: null, partyVids: null };
    const members = (typeof Game.partyMembers === 'function') ? (Game.partyMembers() || []) : [];
    const cap = (typeof Game.partyCap === 'function') ? Game.partyCap() : null;
    return { partyN: members.length, partyCap: cap, partyVids: members.slice() };
  } catch (e) { return { partyN: null, partyCap: null, partyVids: null }; }
}

// fourthseatSnapshot(Game, vid): the 4th-companion snapshot at
// fight time — every layer that could supply a 4th seat, read at
// once so the analyzer never re-derives from a later state.
// Pure reads; never throws into the caller.
function fourthseatSnapshot(Game, vid) {
  const snap = { expedCompanions: [], expedCompanionN: 0, myTarget: null,
    planParty: [], planPartyN: 0, planStage: null, planTarget: null, planNeedWave: null,
    pinnedQuad: [], pinnedQuadN: 0,
    scholarPartyN: null, scholarPartyCap: null, scholarPartyVids: null,
    rosterN: null, livingN: null,
    senseReturned: [], senseN: null, senseError: null };
  try {
    const ec = expeditionCompanions(Game, vid);
    snap.expedCompanions = ec.companions; snap.expedCompanionN = ec.companions.length; snap.myTarget = ec.myTarget;
  } catch (e) {}
  try {
    const plan = planOfGame(Game, vid);
    if (plan) {
      snap.planParty = (plan.party || []).slice(); snap.planPartyN = snap.planParty.length;
      snap.planStage = plan.stage || null; snap.planTarget = plan.target || null;
      snap.planNeedWave = (plan.needWave != null ? plan.needWave : null);
    }
  } catch (e) {}
  try {
    const pq = pinnedQuadOf(Game, vid);
    snap.pinnedQuad = pq; snap.pinnedQuadN = pq.length;
  } catch (e) {}
  try {
    const sp = scholarPartyOf(Game, vid);
    snap.scholarPartyN = sp.partyN; snap.scholarPartyCap = sp.partyCap; snap.scholarPartyVids = sp.partyVids;
  } catch (e) {}
  try {
    const rc = rosterCounts(Game);
    snap.rosterN = rc.rosterN; snap.livingN = rc.livingN;
  } catch (e) {}
  // The sense, re-read at fight time: villagerFightAllies is pure
  // (reads only, no RNG — trust-ordered sort), so calling it here
  // is a clean re-read of exactly what the engine would sense.
  // If it throws, the row records the error instead of a list —
  // never a silent empty.
  try {
    if (typeof Game.villagerFightAllies === 'function') {
      const s = Game.villagerFightAllies(vid) || [];
      snap.senseReturned = s.slice(); snap.senseN = s.length;
    } else { snap.senseError = 'villagerFightAllies-not-a-function'; }
  } catch (e) { snap.senseError = String(e.message).slice(0, 80); }
  return snap;
}

// installFourthseatRecorder(Game, L, errors): the four instruments.
// Pure reads + driver-local writes; every original runs exactly
// once, untouched. Exported so the proof test exercises the exact
// wrap code oneRun runs.
function installFourthseatRecorder(Game, L, errors) {
  const installed = [];
  function wrapMethod(name, makeWrap) {
    try {
      const orig = Game[name];
      if (RECORDER_ON && typeof orig === 'function') {
        Game[name] = makeWrap(orig);
        installed.push({ name: name, orig: orig });
      } else if (RECORDER_ON) errors.push(name + '-wrap: not a function');
    } catch (e) { errors.push(name + '-wrap-install: ' + String(e.message).slice(0, 80)); }
  }
  // (1) w4fights — every wave>=4 fieldFight, any origin.
  wrapMethod('fieldFight', function (origFF) {
    return function (vid, mdef, m, opts) {
      const w = (mdef && mdef.wave) | 0;
      const watch = w >= 4 && mdef && mdef.id;
      let origin = null, snap = null, preHp = null;
      if (watch) {
        try { origin = fightOrigin(); } catch (e) { origin = 'unclassified'; }
        try { snap = fourthseatSnapshot(Game, vid); } catch (e) { snap = null; }
        try {
          const hpOf = function (o) { if (!o) return null; const v = (o.maxHp != null ? o.maxHp : o.hp); return (typeof v === 'number' && isFinite(v) && v > 0) ? v : null; };
          preHp = hpOf(m) || hpOf(mdef);
        } catch (e) {}
      }
      const allyVidsPassed = watch ? ((opts && opts.allyVids) || []).slice() : null;
      const rec = origFF.apply(this, arguments);
      try {
        if (watch && rec) {
          const recov = recoverMHpStart(rec, preHp);
          // Per-seat dealt: the engine feeds each ally's damage
          // into the shared allyDealt total AND its own tally
          // (fieldFights.js:2200/2683/2723/2729), so:
          //   lead  = mDealt - allyDealt
          //   ally1 = allyDealt - ally2Dealt - ally3Dealt
          //   ally2 = ally2Dealt, ally3 = ally3Dealt
          const mDealt = rec.mDealt | 0;
          const allyDealt = rec.allyDealt | 0;
          const ally2Dealt = rec.ally2Dealt | 0;
          const ally3Dealt = rec.ally3Dealt | 0;
          L.w4fights.push({ seq: nextSeq(), day: gday(Game), vid: vid,
            leadName: refNameOf(Game, vid),
            leadIsScholar: vid === Game.villagerId,
            mid: mdef.id, wave: w, origin: origin,
            alliesOpt: (opts && opts.allies) | 0,
            allyVidsPassed: allyVidsPassed,
            allyFromStart: !!(opts && opts.allyFromStart),
            snap: snap,
            outcome: rec.outcome || null, rounds: rec.rounds | 0,
            mHpStart: recov.mHpStart, vKill: !!recov.vKill, noContact: !!recov.noContact,
            mDealt: mDealt, vTaken: rec.vTaken | 0,
            leadDealt: mDealt - allyDealt,
            allyDealt: allyDealt, ally2Dealt: ally2Dealt, ally3Dealt: ally3Dealt,
            ally1Dealt: allyDealt - ally2Dealt - ally3Dealt,
            allyVid: rec.allyVid || null, ally2Vid: rec.ally2Vid || null, ally3Vid: rec.ally3Vid || null,
            allyNames: { ally1: rec.allyVid ? refNameOf(Game, rec.allyVid) : null,
              ally2: rec.ally2Vid ? refNameOf(Game, rec.ally2Vid) : null,
              ally3: rec.ally3Vid ? refNameOf(Game, rec.ally3Vid) : null },
            allyJoined: !!rec.allyJoined, ally2Joined: !!rec.ally2Joined, ally3Joined: !!rec.ally3Joined,
            calledHelp: !!rec.calledHelp,
            shoutRound: (rec.shoutRound != null ? rec.shoutRound : null),
            shout2Round: (rec.shout2Round != null ? rec.shout2Round : null),
            shout3Round: (rec.shout3Round != null ? rec.shout3Round : null),
            log: (rec.log || []).slice(),
            roundsDetail: rec.roundsDetail ? JSON.parse(JSON.stringify(rec.roundsDetail)) : null });
        }
      } catch (e) { errors.push('w4fight-log: ' + String(e.message).slice(0, 80)); }
      return rec;
    };
  });
  // (2) senseCalls — every villagerFightAllies call in the wild.
  wrapMethod('villagerFightAllies', function (origSense) {
    return function (vid) {
      const ret = origSense.apply(this, arguments);
      try {
        const ec = expeditionCompanions(Game, vid);
        L.senseCalls.push({ seq: nextSeq(), day: gday(Game), vid: vid,
          returned: (ret || []).slice(), returnedN: (ret || []).length,
          expedCompanionN: ec.companions.length, expedCompanions: ec.companions.slice() });
      } catch (e) { errors.push('sense-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  // (3) departs — light launch rows (brain path + winPlanDepart).
  wrapMethod('vbrainExecuteDepart', function (origBrainDepart) {
    return function (vid, hx, hy, playerAtHaven) {
      let commit = null;
      try { commit = (typeof this.vbrainCommit === 'function') ? this.vbrainCommit(vid) : null; } catch (e) {}
      const ret = origBrainDepart.apply(this, arguments);
      try {
        const plan = planOfGame(Game, vid);
        if ((ret === 'hold' || ret === 'launch') && commit && commit.winPlanAction) {
          L.departs.push({ seq: nextSeq(), day: gday(Game), vid: vid, source: 'brain',
            result: ret, winPlanAction: commit.winPlanAction,
            companion: commit.companion || null,
            companion2: commit.companion2 || null,
            companion3: commit.companion3 || null,
            stage: plan ? plan.stage : null, target: plan ? plan.target : null,
            needWave: plan ? (plan.needWave != null ? plan.needWave : null) : null,
            party: (plan && plan.party) ? plan.party.slice() : [],
            partySize: plan && plan.party ? plan.party.length + 1 : 1 });
        }
      } catch (e) { errors.push('depart-brain-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  wrapMethod('winPlanDepart', function (origDepart) {
    return function (vid, hx, hy, playerAtHaven) {
      const ret = origDepart.apply(this, arguments);
      try {
        const plan = planOfGame(Game, vid);
        if (plan && planIsWave4(Game, plan) && (ret === 'hold' || ret === 'launch')) {
          L.departs.push({ seq: nextSeq(), day: gday(Game), vid: vid, source: 'winPlanDepart',
            result: ret, winPlanAction: null,
            companion: null, companion2: null, companion3: null,
            stage: plan.stage, target: plan.target || null,
            needWave: (plan.needWave != null ? plan.needWave : null),
            party: (plan.party || []).slice(),
            partySize: (plan.party || []).length + 1 });
        }
      } catch (e) { errors.push('depart-winplan-log: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  });
  return {
    uninstall: function () {
      for (let i = installed.length - 1; i >= 0; i--) {
        try { Game[installed[i].name] = installed[i].orig; } catch (e) {}
      }
    },
  };
}

// planCensusRow(Game, day): one row per live wave-4 plan at end of
// day — party length, stage, target, holder alive/exped. Pure reads.
function planCensusRows(Game, day) {
  const rows = [];
  try {
    const wp = ((Game.state || {}).village || {}).winPlan || {};
    for (const pvid of Object.keys(wp)) {
      const pl = wp[pvid];
      if (!planIsWave4(Game, pl)) continue;
      let alive = true;
      try { const p = Game.getPerson ? Game.getPerson(pvid) : null; if (p && p.dead) alive = false; } catch (e) {}
      let exped = false;
      try { const a = Game.agencyState ? Game.agencyState() : null; exped = !!(a && a.exped && a.exped[pvid]); } catch (e) {}
      rows.push({ day: day, vid: pvid, target: pl.target || null,
        needWave: (pl.needWave != null ? pl.needWave : null),
        stage: pl.stage || null, party: (pl.party || []).slice(),
        partySize: (pl.party || []).length + 1,
        holderAlive: alive, holderExped: exped });
    }
  } catch (e) {}
  return rows;
}

async function oneRun(seed) {
  rowSeq = 0; // partydmg-a §6: reset per seed for byte-identical reruns.
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'fourthseat-a-' + MODE, fullTelemetry: false });
  const errors = [];
  await setupGame(Game);
  const L = { w4fights: [], senseCalls: [], departs: [], planCensus: [] };
  let rec = null;
  if (RECORDER_ON) { try { rec = installFourthseatRecorder(Game, L, errors); } catch (e) { errors.push('fourthseat-install: ' + String(e.message).slice(0, 80)); } }
  let lastSnapDay = -1;
  const wrapped = Object.assign({}, policy, {
    daily: function (Gm, ctx) {
      try { return policy.daily(Gm, ctx); } finally {
        try {
          const d = gday(Game);
          if (RECORDER_ON && d !== lastSnapDay) {
            lastSnapDay = d;
            for (const r of planCensusRows(Game, d)) L.planCensus.push(r);
          }
        } catch (e) { errors.push('census: ' + String(e.message).slice(0, 80)); }
      }
    },
  });
  let result = null;
  await quietLog(async function () { result = await runDays(Game, wrapped, { days: DAYS, manifest: undefined, sampleEvery: 1 }); });
  try { if (rec) rec.uninstall(); } catch (e) { errors.push('uninstall: ' + String(e.message).slice(0, 80)); }

  const st = Game.state || {};
  let scaleRank = null, unlocked = null, standing = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  let ready4 = null, ready5 = null;
  try { ready4 = Game.waveCombatReadiness ? Game.waveCombatReadiness(4) : null; } catch (e) { errors.push('ready4: ' + String(e.message).slice(0, 80)); }
  try { ready5 = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; } catch (e) { errors.push('ready5: ' + String(e.message).slice(0, 80)); }

  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });

  return {
    seed: seed, arm: 'fourthseat-a', run: RUN, mode: MODE, leg: MODE,
    anchorCommit: ANCHOR,
    wiringSha: WIRING_SHA, fightsSha: FIGHTS_SHA, brainSha: BRAIN_SHA, partySha: PARTY_SHA,
    allyslot3Present: ALLYSLOT3_PRESENT, fightally2Present: FIGHTALLY2_PRESENT, partysize4Present: PARTYSIZE4_PRESENT,
    flagsSet: FLAGS_SET.slice(),
    recorderOn: RECORDER_ON,
    policySha: POLICY_SHA, policy: 'competent',
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    ready4: ready4, ready5: ready5,
    instrumentErrors: errors,
    deaths: deaths,
    samples: result.samples || null,
    w4fights: L.w4fights, senseCalls: L.senseCalls, departs: L.departs, planCensus: L.planCensus,
    wave4Ids: loadWaveIds(4), wave5Ids: loadWaveIds(5),
  };
}

if (require.main === module) (async function () {
  if (MODE !== 'base') { console.error('FOURTHSEAT STOP: MODE must be base (single-leg DIAG, no armed leg), got ' + JSON.stringify(MODE)); process.exit(2); }
  if (FLAGS_SET.length) { console.error('FOURTHSEAT STOP: plain-master baseline — these lever flags must be UNSET: ' + FLAGS_SET.join(', ')); process.exit(2); }
  if (!SEEDS.length) { console.error('FOURTHSEAT STOP: SEEDS required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-27', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'fourthseat-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
    if (fs.existsSync(file)) { console.error('FOURTHSEAT STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  let lostSeeds = [];
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'fourthseat-a-s' + seed + '-' + RUN + '-' + MODE + '.json');
    const saved = writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    if (!saved) {
      lostSeeds.push(seed);
      console.error('FOURTHSEAT STOP: could not write ' + path.relative(REPO, file) + ' after 10 min of retries (write flap?) — seed ' + seed + ' NOT saved; re-run this seed after the flap clears.');
    }
    console.log(JSON.stringify({
      seed: out.seed, mode: out.mode, anchor: (out.anchorCommit || '').slice(0, 12),
      wiringSha: out.wiringSha, fightsSha: out.fightsSha, brainSha: out.brainSha, partySha: out.partySha,
      flagsSet: out.flagsSet, recorderOn: out.recorderOn, policySha: out.policySha,
      days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      deaths: out.deaths.length,
      w4fights: out.w4fights.length, senseCalls: out.senseCalls.length,
      departs: out.departs.length, planCensus: out.planCensus.length,
      errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
  if (lostSeeds.length) {
    console.error('FOURTHSEAT STOP: ' + lostSeeds.length + ' seed(s) NOT saved (' + lostSeeds.join(',') + ') — re-run them after the flap clears. Exit 4.');
    process.exitCode = 4;
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun, loadWaveIds: loadWaveIds, fightOrigin: fightOrigin,
  recoverMHpStart: recoverMHpStart, expeditionCompanions: expeditionCompanions,
  pinnedQuadOf: pinnedQuadOf, rosterCounts: rosterCounts, scholarPartyOf: scholarPartyOf,
  fourthseatSnapshot: fourthseatSnapshot, installFourthseatRecorder: installFourthseatRecorder,
  planCensusRows: planCensusRows, planIsWave4: planIsWave4, FLAG_VARS: FLAG_VARS };
