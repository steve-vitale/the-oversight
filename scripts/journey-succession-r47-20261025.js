#!/usr/bin/env node
// journey-succession-r47-20261025.js — SUCCESSION LEG r47: "SCRIPTED DAY-5 REGIME + BEARER-OWN DELTA + EVENT-VS-DEED SPLIT"
// r46 = r45 driver + three instrument additions for r45's documented gaps:
//   (a) ECHO V2B: v2 minus inventory-transfer lines (/^You take /i), reported
//       alongside v2; the M3 bar moves to v2b (r45 metric review).
//   (b) CALL-SCOPED OFFICE ATTRIBUTION: for every post-death runDays call
//       that moves the office entry, the call's own say lines (bucketed)
//       plus the per-villager trust-map diff across that call — narrowing
//       r45's day census (~500 lines) to the call that actually moved it.
//   (c) DIED-BETWEEN watch kept (opportunistic; cannot be forced honestly).
// No game change. Pre-registration: evidence/2026-10-25/journey-succession-r47-prereg.md
// r45 = r44 driver + three instrument additions for r43's documented gaps:
//   (a) ECHO V2: week-2 say-log name matches WITHOUT the villager-talk format
//       restriction, reported side-by-side with r43's old filter on the SAME logs.
//   (b) ALL DEATHS: every chain mantle in the post window recorded with a
//       fallen/lineage cause lookup at detection; UNKNOWN reported, never guessed.
//   (c) OFFICE DAILY: office entry snapshotted every post-death day; movement
//       days listed with that day's public-event say lines (or 'none').
// No game change. Pre-registration: evidence/2026-10-24/journey-succession-r44-prereg.md
// Journey leg 7: death of the player character, the mantle passing, the new
// bearer's life. LANE B.
//
// LEG QUESTION (pre-registered, MEASUREMENT.md §9-12, 14): r38 left the
// trust-trap as a design datum (seed 20004: d10 death → successor trust 16 →
// 13 half-ration nights, trust 16→16 no self-heal). Steve ruled 2026-10-23:
// the trust<30 half-ration in villageMeal is for NEW villagers only (the
// original body / recent arrivals) — a taken-over ESTABLISHED villager eats
// full at any trust. "It's about the village not the villager." The ruling
// is landed on master. This run VERIFIES it in the wild:
//   (a) MG2: across every post-death day on every seed, an established
//       successor (bodyIsNew=false) is NEVER half-rationed (kcal>=1500) and
//       NEVER hears "Half ration". One violation = REAL BUG (regression).
//   (b) MG1 (unit proof): new-body and newcomer gates still fire — covered
//       by scripts/test-succession-meal-gate-20261024.js (12/12).
//   (c) regression: funeral arc (M1), vouch contract (M2a), machinery (M4)
//       still hold under r37/r38's bars; successor trust-climb vs r38's 16→16.
//   (d) people check (M5): sense-read transcripts, successor first-days
//       voice under the character-differentiation code.
//
// PROFILE: competent policy. Phase A: real competent play (40d, or
// EARLY_KILL_DAY for the trust-trap re-test). Kill via the REAL playerDeath
// ('a hushwolf') at the first day >= the phase-A length. Post-death: 14 days
// of REAL competent play as the successor. Death-aware stop (+10d tail).
// Funeral arc observed in the wild; burial act script-driven at d+3 AFTER
// recording whether the competent policy did it organically.
//
// BINDING METRICS (§14):
//   MG2 (meal gate, THE question): 0 violations on 4/4 seeds (established
//       successor half-rationed or voiced). A single violation = REAL BUG.
//   M1 (funeral arc): >=3/4 deaths produce (a) the death beat naming the
//       bearer, (b) recoverBearer <redacted> 2 days, (c) the burial act completable.
//       Kill rule: >=2/4 deaths with NO recoverBearer -> SUBSTRATE-MISSING.
//   M2a (vouch contract): on EVERY seed with >=1 eligible voucher (living
//       roster, not the successor, trust >= 60 at the funeral), the vouch
//       say line fires. A single eligible-but-silent seed = REAL BUG.
//   M3 (social echo, r37's bar stands): on >=3/4 seeds, >=2 true-name
//       mentions of the dead bearer in VILLAGER TALK within 7 days of death.
//       Descriptor, not the question — NOT re-scored.
//   M4 (machinery): 4/4 mantles clean (linOk + moOk).
//   M5 (people check): 0 identity failures across sense-read transcripts.
//
// SEED PLAN: 20011 (EARLY_KILL_DAY=12 — re-tests r38's trust-trap regime;
// seed 20004 there showed 13 half-ration nights; r41 must show ZERO),
// 20012–20014 (standard d40 kill, successor +14d).
// Usage: SEED=25001 EARLY_KILL_DAY=10 node scripts/journey-succession-r44-20261024.js
//        SEED=25003 node scripts/journey-succession-r44-20261024.js  (standard 40d phase A)

// Output: JSON record to stdout; narrative + transcripts to stderr.
'use strict';
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '25001', 10);
const KILL_CAUSE = 'a hushwolf';
const PHASE_A_DAYS = parseInt(process.env.EARLY_KILL_DAY || '40', 10); // r41: env-override for the trust-trap regime re-test
const POST_DAYS = parseInt(process.env.POST_DAYS || '30', 10);
const EVID_DIR = path.join(ROOT, 'evidence', '2026-10-25');
const SAY_CAP = 15000;
const CONVO_DAYS = [3, 7, 14, 30];

function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { const ch = (Game.data.villagers || []).find(x => x.id === vid); if (ch && ch.name) return ch.name; } catch (e) {}
  return String(vid).slice(0, 12);
}
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function trustOf(Game, vid) { try { return ((Game.state.village || {}).trust || {})[vid] || 0; } catch (e) { return 0; } }
function livingRoster(Game) {
  const v = Game.state.village || {};
  return (v.roster || []).filter(id => {
    try { const vp = Game.vpOf(id); return vp && !vp.dead; } catch (e) { return true; }
  });
}
function corpses(Game) {
  try { return (typeof Game.corpses === 'function' ? Game.corpses() : Game.corpses) || []; } catch (e) { return []; }
}
function bearerCorpse(Game, oldId) {
  return corpses(Game).find(c => c && c.villagerId === oldId) || null;
}

// r42 helpers: pre-death villager records (parity) + scholar snapshots (function).
function scholarAbilityIds(Game) {
  try { return ((Game.state.scholar || {}).abilities || []).map(a => (a && (a.id || a)) || a).filter(Boolean); } catch (e) { return []; }
}
function snapshotVillagers(Game) {
  const out = {};
  try {
    const v = Game.state.village || {};
    for (const id of livingRoster(Game)) {
      out[id] = {
        name: firstName(rawName(Game, id)),
        abilities: ((v.npcAbilities || {})[id] || []).slice(),
        skills: Object.keys(((v.npcSkills || {})[id] || {})),
        xp: JSON.parse(JSON.stringify(((v.npcXp || {})[id] || {}))),
        know: Object.keys(((v.npcKnow || {})[id] || {})),
      };
    }
  } catch (e) {}
  return out;
}
function scholarSnap(Game) {
  try {
    const s = Game.state.scholar || {}, cx = Game.state.codex || {};
    const tr = s.tracks || {};
    let xpTotal = 0; for (const t of Object.keys(tr)) xpTotal += (tr[t] && tr[t].xp) || 0;
    const plants = cx.plants || {};
    const skills = cx.skills || {};
    const abils = cx.abilities || {};
    return {
      day: dayOf(Game),
      abilities: scholarAbilityIds(Game),
      xpTotal, levelUpQueue: ((s.levelUpQueue || []).length),
      codexPlants: Object.keys(plants).length,
      codexSkills: Array.isArray(skills) ? skills.length : Object.keys(skills).length,
      codexAbilities: Object.keys(abils).length,
    };
  } catch (e) { return { day: dayOf(Game), abilities: [], xpTotal: 0, levelUpQueue: 0, codexPlants: 0, codexSkills: 0, codexAbilities: 0 }; }
}
function pantryKcal(Game) {
  try {
    let k = 0;
    for (const it of ((Game.state.village || {}).pantry || [])) k += ((it.kcalEach || 0) * (it.units || 1));
    return Math.round(k);
  } catch (e) { return 0; }
}

// r43: TRUST PANEL — the leg's two dials, read at the same checkpoint.
//   office  = trust[newId]: the inheritance-formula entry (ledger.js
//             playerDeath: 40% old office + 40% successor's own record +
//             vouch bonus, floor 10). This is what r39-r42 quoted as
//             "successor trust".
//   village = the living roster's own entries (trust[other]): how much
//             each OTHER villager trusts the new scholar. Mean/median/n>=60
//             tell whether the village itself warms, whatever the office
//             entry does. The two dials need not move together: convo/deed
//             gains land on the villager acted on, not on the office entry.
function trustPanel(Game, newId) {
  try {
    const v = Game.state.village || {};
    const others = livingRoster(Game).filter(id => id !== newId);
    const ts = others.map(id => Math.round(trustOf(Game, id))).sort((a, b) => a - b);
    const mean = ts.length ? ts.reduce((a, b) => a + b, 0) / ts.length : 0;
    const median = ts.length ? ts[Math.floor(ts.length / 2)] : 0;
    return {
      office: Math.round(trustOf(Game, newId)),
      villageMean: Math.round(mean * 10) / 10,
      villageMedian: median,
      villageN: ts.length,
      villageGe60: ts.filter(t => t >= 60).length,
      villageGe40: ts.filter(t => t >= 40).length,
      villageLt30: ts.filter(t => t < 30).length,
      per: others.map(id => ({ id: firstName(rawName(Game, id)), t: Math.round(trustOf(Game, id)) })),
    };
  } catch (e) { return { office: 0, villageMean: 0, villageMedian: 0, villageN: 0, error: e.message }; }
}
function trustClass(d) {
  if (d >= 3) return 'climb';
  if (d <= -3) return 'fall';
  return 'flat';
}

// r46: CALL-SCOPED trust map — living roster id -> rounded trust, for
// per-call diffs across a runDays call.
function trustMap(Game) {
  const out = {};
  try { for (const id of livingRoster(Game)) out[id] = Math.round(trustOf(Game, id)); } catch (e) {}
  return out;
}

// Honest convo driver (r26-r38, verbatim): sense-read only.
function driveConvo(Game, vid, tag, maxTurns) {
  maxTurns = maxTurns || 14;
  const out = [`## ${tag} — ${firstName(rawName(Game, vid))} on d${dayOf(Game)} (trust ${trustOf(Game, vid)})`];
  let refused = false;
  const picked = [];
  try {
    const r = Game.startConvo(vid);
    if (r && (r.refused || r.ended)) refused = true;
  } catch (e) { return { text: out.join('\n') + ' (startConvo threw: ' + e.message + ')', refused: 'throw', flags: {} }; }
  const c0 = Game.convoGet(vid);
  if (refused || !c0 || !c0.active) {
    return { text: out.join('\n') + '\n(convo refused or never opened)', refused, flags: { want: (c0 && c0.want && c0.want.id) || 'none' } };
  }
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) { out.push('(no choices offered)'); break; }
    const c = Game.convoGet(vid);
    let pick = choices.find(x => /^want:/.test(x.id) && !/favor/i.test(x.text || ''));
    if (!pick) pick = choices.find(x => /^want:/.test(x.id));
    if (!pick) pick = choices.find(x => /^(dlg:help|dlg:details)$/.test(x.id));
    if (!pick) {
      const fb = choices.find(x => !/^(leave|bye|goodbye|dlg:cant|dlg:commit)/.test(x.id) && !picked.includes(x.id));
      if (fb) { pick = fb; }
      else pick = choices.find(x => x.id === 'dlg:cant') || null;
    }
    if (!pick || /^(leave|bye|goodbye)/.test(pick.id)) break;
    picked.push(pick.id);
    out.push(`> YOU PICK [${pick.id}] ${(pick.text || '').slice(0, 110)}`);
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.push(`(turn threw: ${e.message})`); break; }
    const cc = Game.convoGet(vid);
    if (!cc || !cc.active) { out.push('(conversation ended by the engine)'); break; }
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  const cf = Game.convoGet(vid);
  const lines = [];
  for (const e2 of ((cf && cf.transcript) || [])) {
    lines.push(`${e2.who === 'you' ? 'YOU' : 'NPC'}: ${String(e2.text).slice(0, 500)}`);
  }
  const txt = lines.join('\n');
  out.push('\n### FULL TRANSCRIPT');
  out.push(lines.join('\n'));
  return { text: out.join('\n'), refused: false, flags: { want: (cf && cf.want && cf.want.id) || 'none' }, fullText: txt };
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'succession-r47', fullTelemetry: true });
  await setupGame(Game);
  const E = console.error;
  if (!fs.existsSync(EVID_DIR)) fs.mkdirSync(EVID_DIR, { recursive: true });
  const rec = {
    seed: SEED, mode: 'succession-r47', notes: [], anomalies: [],
    convoReads: [], convoLines: [], identityTrips: [], identityTripsRaw: [],
    trustPanels: [], deedLedger: [], chainDeaths: [], officeDaily: [], officeMoves: [],
    officeCallMoves: [],
    funeral: {}, organicBurial: { respects: false, bury: false },
  };

  const sayLog = [];
  const _say = Game.say;
  let capturing = true;
  let endDay = null; // set at the end of the post-death loop; finish() may run early
  // r41b: TRUE DEATH DAY. An organic death is detected one runDays-call AFTER
  // it happens (the call advances through the death into the next day), so
  // dayOf(Game) at detection is death-day+1. The funeral beats (vouch, death
  // beat) fire INSIDE playerDeath on the true day — a window built on the
  // detected day misses them (20012: vouch fired d16, window was d17-d19).
  // Capture the day at playerDeath entry; the code's own snapshot.
  let trueDeathDay = null;
  const _pd = Game.playerDeath && Game.playerDeath.bind(Game);
  if (_pd) {
    Game.playerDeath = function (cause) {
      if (trueDeathDay == null) { try { trueDeathDay = dayOf(Game); } catch (e) {} }
      return _pd(cause);
    };
  }
  Game.say = function (t) {
    const s = String(t || '');
    if (capturing) {
      sayLog.push({ day: dayOf(Game), text: s.slice(0, 800) });
      if (sayLog.length > SAY_CAP) sayLog.shift();
    }
    return _say ? _say.call(this, t) : undefined;
  };
  const _bury = Game.buryCorpse && Game.buryCorpse.bind(Game);
  const _respects = Game.payRespects && Game.payRespects.bind(Game);
  Game.buryCorpse = function (id) { rec.organicBurial.bury = true; return _bury ? _bury(id) : null; };
  Game.payRespects = function (id) { rec.organicBurial.respects = true; return _respects ? _respects(id) : null; };

  // r43: DEED LEDGER — wrap the deed APIs the competent policy uses, and
  // record each post-death call with the target's trust before/after.
  // Wrappers only record once postDeathActive is set (after the handoff);
  // before that they pass through untouched. Behaviour is unchanged:
  // every call is forwarded and its return value preserved.
  let postDeathActive = false;
  const _deedOrig = {};
  for (const fn of ['teachPlant', 'giveFood', 'treatVillager', 'comfort', 'donateToPantry']) {
    if (typeof Game[fn] !== 'function') continue;
    _deedOrig[fn] = Game[fn].bind(Game);
    Game[fn] = (function (name, orig) {
      return function (...args) {
        if (!postDeathActive) return orig(...args);
        const a0 = args[0];
        const vidLabel = (typeof a0 === 'string') ? firstName(rawName(Game, a0)) : ('pantry#' + a0);
        const tb = (typeof a0 === 'string') ? Math.round(trustOf(Game, a0)) : null;
        let r, ok = true, err = null;
        try { r = orig(...args); } catch (e) { ok = false; err = e.message; }
        const ta = (typeof a0 === 'string') ? Math.round(trustOf(Game, a0)) : null;
        rec.deedLedger.push({ day: dayOf(Game), deed: name, vid: vidLabel,
          trustBefore: tb, trustAfter: ta, delta: (tb != null && ta != null) ? (ta - tb) : null, ok, err });
        if (!ok) throw new Error(err);
        return r;
      };
    })(fn, _deedOrig[fn]);
  }

  // ---- phase A: real competent play to ~d40 (death-aware stop) ----
  let organic = null; // { day, deadId, newId } if the mantle passed organically in phase A
  let lastPre = null; // r42: villager records as of the morning before the death day
  for (let d = 1; d <= PHASE_A_DAYS; d++) {
    if (Game.over) break;
    lastPre = { vill: snapshotVillagers(Game), scholarAbilities: scholarAbilityIds(Game), scholarDay: dayOf(Game) };
    const beforeId = Game.villagerId;
    await runDays(Game, competent, { days: 1 });
    if (Game.over || Game.villagerId == null) break;
    if (Game.villagerId !== beforeId) {
      organic = { day: dayOf(Game), deadId: beforeId, newId: Game.villagerId };
      rec.notes.push(`organic mantle during phase A: ${firstName(rawName(Game, beforeId))} -> ${firstName(rawName(Game, Game.villagerId))} d${organic.day}`);
      break;
    }
  }
  if (Game.over || Game.villagerId == null) {
    rec.notes.push(`village over at d${dayOf(Game)} before any kill — seed skipped (death-aware stop)`);
    finish(); return;
  }

  // ---- the leg's death: organic (already passed in phase A) or scripted via the REAL playerDeath ----
  let handoffStart = sayLog.length;
  let deathCause, scripted, oldId, killDay;
  if (organic) {
    // The mantle already passed through the REAL death machinery in phase A.
    // Record the handoff from the pre-death state; no second kill.
    oldId = organic.deadId;
    rec.preDeathSnap = lastPre;
    deathCause = 'organic (phase A)';
    scripted = false;
    killDay = organic.day;
    handoffStart = 0; // death machinery already ran inside phase A; scan the whole log
    // Trust snapshot for the record (post-death; others' trust entries unchanged by the handoff).
    const livePost0 = livingRoster(Game);
    const trustSnap0 = livePost0.map(id => ({ id: firstName(rawName(Game, id)), t: Math.round(trustOf(Game, id)) }))
      .sort((a, b) => b.t - a.t);
    rec.preDeath = { day: organic.day, topTrust: trustSnap0.slice(0, 6), roster: livePost0.length, note: 'post-organic-death state' };
    rec.preDeathEligible = null; // r45: organic death already happened at detection — no pre-snapshot
    E(`\nORGANIC DEATH d${organic.day}: ${firstName(rawName(Game, organic.deadId))} -> ${firstName(rawName(Game, organic.newId))}, topTrust=${JSON.stringify(trustSnap0.slice(0, 4))}`);
  } else {
    oldId = Game.villagerId;
    // Pre-death trust snapshot: voucher eligibility for the vouch contract.
    const livePre = livingRoster(Game);
    const trustSnap = livePre.map(id => ({ id: firstName(rawName(Game, id)), t: Math.round(trustOf(Game, id)) }))
      .sort((a, b) => b.t - a.t);
    rec.preDeath = { day: dayOf(Game), topTrust: trustSnap.slice(0, 6), roster: livePre.length };
    // r45 VOUCH SNAPSHOT: full eligible set BEFORE the kill (living, trust >= 60,
    // not the old bearer). The successor is removed post-hoc (cannot vouch for
    // self). r44's 25003 artifact: vouchers who vouched and died the same day
    // were invisible to every post-death snapshot.
    rec.preDeathEligible = livePre.filter(id => id !== oldId && trustOf(Game, id) >= 60)
      .map(id => firstName(rawName(Game, id)));
    E(`\nPRE-DEATH d${dayOf(Game)}: bearer <redacted>, topTrust=${JSON.stringify(trustSnap.slice(0, 4))}, roster=${livePre.length}`);
    killDay = dayOf(Game);
    deathCause = KILL_CAUSE;
    scripted = true;
    rec.preDeathSnap = { vill: snapshotVillagers(Game), scholarAbilities: scholarAbilityIds(Game), scholarDay: dayOf(Game) };
    Game.playerDeath(KILL_CAUSE);
  }
  const oldName = rawName(Game, oldId);
  const oldFirst = firstName(oldName);
  const newId = organic ? organic.newId : Game.villagerId;
  const newName = rawName(Game, newId);
  const newFirst = firstName(newName);
  // r42: parity — the successor's post-death scholar build vs their own pre-death record.
  const succPre = (rec.preDeathSnap && rec.preDeathSnap.vill && rec.preDeathSnap.vill[newId]) || null;
  const postAbilities = scholarAbilityIds(Game);
  const deadBearerAbilities = (rec.preDeathSnap && rec.preDeathSnap.scholarAbilities) || [];
  const succPreIds = succPre ? succPre.abilities.slice() : [];
  const inherited = succPre ? postAbilities.filter(a => deadBearerAbilities.includes(a) && !succPreIds.includes(a)) : [];
  rec.parity = {
    readable: !!succPre,
    preNpcAbilities: succPreIds,
    postAbilities: postAbilities.slice(),
    deadBearerAbilities: deadBearerAbilities.slice(),
    equal: !!succPre && JSON.stringify(postAbilities.slice().sort()) === JSON.stringify(succPreIds.slice().sort()),
    inherited: inherited,
  };
  rec.scholarBase = scholarSnap(Game);
  rec.pantryBase = pantryKcal(Game);
  E(`PARITY readable=${rec.parity.readable} equal=${rec.parity.equal} inherited=${JSON.stringify(inherited)} pre=${JSON.stringify(succPreIds)} post=${JSON.stringify(postAbilities)}`);

  const lin = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];  const lastLin = lin[lin.length - 1] || {};
  const mo = ((Game.state.village || {}).mantleOf || []);
  const lastMo = mo[mo.length - 1] || {};
  const passed = newId !== oldId && !Game.over && !Game.villageLost;
  // r41b: use the TRUE death day (captured at playerDeath entry) for every
  // window below. Scripted kills set it too (same wrapper); organic deaths
  // need it (detected a day late). Falls back to dayOf when unset.
  const deathDay = (trueDeathDay != null) ? trueDeathDay : dayOf(Game);
  if (trueDeathDay != null && trueDeathDay !== dayOf(Game)) {
    rec.notes.push(`death-day correction: detected d${dayOf(Game)}, true d${trueDeathDay} (organic off-by-one)`);
  }
  // Voucher eligibility at the funeral (ledger.js rule: trust[id] >= 60,
  // living, not the successor).
  const livePost = livingRoster(Game);
  const vouchers = livePost.filter(id => id !== newId && trustOf(Game, id) >= 60);
  rec.death = {
    day: deathDay, cause: deathCause, scripted, oldFirst, newFirst, passed,
    linOk: !!(lastLin.cause && lastLin.villagerId === oldId),
    moOk: lastMo.from === oldId && lastMo.to === newId,
    newTrust: Math.round(trustOf(Game, newId)),
    alive: livePost.length,
    fallen: ((Game.state.village || {}).fallen || []).length,
    vouchersEligible: vouchers.map(id => firstName(rawName(Game, id))),
    vouchersN: vouchers.length,
    eligibleAtDeath: (rec.preDeathEligible || null) ? rec.preDeathEligible.filter(n => n !== newFirst) : null,
    eligibleAtDeathN: (rec.preDeathEligible || null) ? rec.preDeathEligible.filter(n => n !== newFirst).length : null,
  };
  E(`DEATH d${deathDay} (${deathCause}${scripted ? ', scripted' : ''}): ${oldFirst} -> ${newFirst} | passed=${passed} lin=${rec.death.linOk} mo=${rec.death.moOk} trust=${rec.death.newTrust} vouchers=${vouchers.length}`);
  postDeathActive = true;
  rec.trustPanels.push(Object.assign({ dplus: 0, day: deathDay }, trustPanel(Game, newId)));
  rec.officeDaily.push({ day: deathDay, dplus: 0, bearer: newFirst, office: Math.round(trustOf(Game, newId)), villageMean: trustPanel(Game, newId).villageMean }); // r44: series starts AT the handoff, so the mantle->d+1 move is not invisible
  if (!passed) { rec.notes.push('mantle FAILED — seed skipped'); finish(); return; }

  const deathWindow = () => sayLog.filter(h => h.day >= deathDay && h.day <= deathDay + 2);
  const findLine = (re, win) => (win || sayLog).filter(h => re.test(h.text)).map(h => `d${h.day}: ${h.text.slice(0, 300)}`);

  // ---- post-death: POST_DAYS of competent play as the successor ----
  let buriedBy = null;
  const ledgerDone = new Set();
  const convoDone = new Set();
  let deaths = 1; // bearer deaths total (scripted + any successor chains)
  for (let d = 1; d <= POST_DAYS; d++) {
    if (Game.over) break;
    const beforeId = Game.villagerId;
    // r47 CALL-SCOPED capture (r46 capture + bearer-own delta): mark the say log + trust map before the call.
    const callMark = sayLog.length;
    const callTrustBefore = trustMap(Game);
    const callBearerBefore = Game.villagerId;
    const callOfficeBefore = Math.round(trustOf(Game, callBearerBefore));
    await runDays(Game, competent, { days: 1 });
    if (Game.over || Game.villagerId == null) break;
    if (Game.villagerId !== beforeId) {
      deaths++;
      const deadId = beforeId, nid = Game.villagerId;
      let fCause = null, lCause = null;
      // A fallen entry with a day but no cause is UNKNOWN, not 'known by day'.
      try { const fe = ((Game.state.village || {}).fallen || []).find(x => x && (x.villagerId === deadId || (x.name && String(x.name).split(' ')[0] === firstName(rawName(Game, deadId))))); if (fe) fCause = fe.cause || null; } catch (e) {}
      try { const le = ((typeof Game.lineage === 'function' ? Game.lineage() : []) || []).filter(x => x && x.villagerId === deadId); if (le.length) lCause = le[le.length - 1].cause; } catch (e) {}
      rec.chainDeaths.push({ detectedDay: dayOf(Game), deadFirst: firstName(rawName(Game, deadId)), newFirst: firstName(rawName(Game, nid)), fallenCause: fCause || null, lineageCause: lCause || null, causeKnown: !!(fCause || lCause) });
      rec.notes.push(`chain mantle: ${firstName(rawName(Game, deadId))} -> ${firstName(rawName(Game, nid))} d${dayOf(Game)} cause=${fCause || lCause || 'UNKNOWN'}`);
    }
    const curDay = dayOf(Game);
    const daysSince = curDay - deathDay;
    // r47 CALL-SCOPED attribution (r46 + bearerDeltaExact/soloOffice/eventClass): if this call moved the office entry,
    // record the call's own lines (bucketed, r45 buckets) + the trust diff.
    // A bearer change mid-call is a chain handoff, not a trust move — flagged
    // so the analysis never mistakes an inheritance entry for a trust move.
    (function () {
      const callLines = sayLog.slice(callMark);
      const callTrustAfter = trustMap(Game);
      const callBearerAfter = Game.villagerId;
      const callOfficeAfter = Math.round(trustOf(Game, callBearerAfter));
      const bearerChanged = callBearerAfter !== callBearerBefore;
      if (callOfficeAfter === callOfficeBefore && !bearerChanged) return;
      const movers = [];
      const ids = new Set([...Object.keys(callTrustBefore), ...Object.keys(callTrustAfter)]);
      for (const id of ids) {
        const b = callTrustBefore[id], a = callTrustAfter[id];
        if (b == null && a == null) continue;
        const dd = (a == null ? 0 : a) - (b == null ? 0 : b);
        if (Math.abs(dd) >= 3) movers.push({ id: firstName(rawName(Game, id)), from: b == null ? null : b, to: a == null ? null : a, delta: dd });
      }
      movers.sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta));
      const bearerRe46 = new RegExp(`\\b${firstName(rawName(Game, callBearerAfter))}\\b`, 'i');
      const b = { bearer: [], gift: [], rumor: [], crisis: [], other: 0 };
      for (const h of callLines) {
        const t = h.text;
        if (bearerRe46.test(t)) b.bearer.push(t.slice(0, 200));
        else if (/give|gift|share|donat/i.test(t)) b.gift.push(t.slice(0, 200));
        else if (/rumor|gossip|word travels|reputation/i.test(t)) b.rumor.push(t.slice(0, 200));
        else if (/◈|SYSTEM|raid|monster|arena|contest/i.test(t)) b.crisis.push(t.slice(0, 200));
        else b.other++;
      }
      const bearerAfterName47 = firstName(rawName(Game, callBearerAfter));
      const bearerDeltaExact47 = bearerChanged ? null
        : ((callTrustAfter[callBearerAfter] == null || callTrustBefore[callBearerBefore] == null) ? null
          : callTrustAfter[callBearerAfter] - callTrustBefore[callBearerBefore]);
      const bBuckets47 = b; // buckets object built below; eventClass filled after bucketing
      rec.officeCallMoves.push({ day: curDay, dplus: daysSince,
        bearerBefore: firstName(rawName(Game, callBearerBefore)), bearerAfter: bearerAfterName47,
        bearerChanged, from: callOfficeBefore, to: callOfficeAfter, delta: callOfficeAfter - callOfficeBefore,
        bearerDeltaExact: bearerDeltaExact47,
        bearerIsMover: movers.some(m => m.id === bearerAfterName47),
        soloOffice: movers.length === 0,
        movers, totalLines: callLines.length,
        buckets: { bearerN: b.bearer.length, giftN: b.gift.length, rumorN: b.rumor.length, crisisN: b.crisis.length, otherN: b.other,
          bearerSample: b.bearer.slice(0, 3), giftSample: b.gift.slice(0, 3), rumorSample: b.rumor.slice(0, 3), crisisSample: b.crisis.slice(0, 3) } });
      (function () { const m47 = rec.officeCallMoves[rec.officeCallMoves.length - 1];
        if (m47 && !m47.bearerChanged) {
          const bk = m47.buckets;
          m47.eventClass = (bk.crisisN > 0 && bk.giftN === 0) ? 'event-only'
            : (bk.giftN > 0 && bk.crisisN === 0) ? 'deed-only'
            : (bk.crisisN > 0 && bk.giftN > 0) ? 'both' : 'neither';
        } else if (m47) { m47.eventClass = 'handoff'; } })();
    })();
    rec.officeDaily.push({ day: curDay, dplus: daysSince, bearer: firstName(rawName(Game, Game.villagerId)), office: Math.round(trustOf(Game, Game.villagerId)), villageMean: trustPanel(Game, Game.villagerId).villageMean });

    // r41b: fire on the FIRST day with daysSince >= 3 (was === 3). A runDays
    // call can advance 2 day-parts/days at once (r38 instrument quirk), which
    // skipped the === 3 day entirely on 20013 and left the burial unproven.
    if (daysSince >= 3 && buriedBy == null) {
      const c = bearerCorpse(Game, oldId);
      if (c) {
        const r1 = _respects(c.id);
        const r2 = _bury(c.id);
        buriedBy = 'scripted';
        rec.funeral.scriptedBurial = {
          found: true, respectsOk: r1 === true, buryOk: r2 === true,
          buried: !!(bearerCorpse(Game, oldId) || {}).buried,
        };
        E(`  BURIAL d+${daysSince}: corpse found=${!!c} respects=${r1 === true} bury=${r2 === true}`);
      } else {
        rec.funeral.scriptedBurial = { found: false };
        rec.anomalies.push(`d+3: no corpse for ${oldFirst} — nothing to bury (funeral arc gap)`);
        E(`  BURIAL d+${daysSince}: NO CORPSE for ${oldFirst} — arc gap`);
        buriedBy = 'missing';
      }
    }
    if (rec.organicBurial.bury && buriedBy == null) buriedBy = 'organic';
    for (const cp of [7, 14, 30]) {
      if (daysSince >= cp && !ledgerDone.has(cp)) {
        ledgerDone.add(cp);
        rec.ledger = rec.ledger || [];
        rec.ledger.push({ dplus: daysSince, day: curDay, bearer: firstName(rawName(Game, Game.villagerId)),
          alive: livingRoster(Game).length, fallen: ((Game.state.village || {}).fallen || []).length,
          successorTrust: Math.round(trustOf(Game, Game.villagerId)), pantryKcal: pantryKcal(Game),
          trustPanel: trustPanel(Game, Game.villagerId),
          scholar: scholarSnap(Game) });
        rec.trustPanels.push(Object.assign({ dplus: daysSince, day: curDay }, trustPanel(Game, Game.villagerId)));
      }
    }
    if (d === POST_DAYS && !ledgerDone.has('end')) {
      ledgerDone.add('end');
      rec.ledger = rec.ledger || [];
      rec.ledger.push({ dplus: daysSince, day: curDay, bearer: firstName(rawName(Game, Game.villagerId)),
        alive: livingRoster(Game).length, fallen: ((Game.state.village || {}).fallen || []).length,
        successorTrust: Math.round(trustOf(Game, Game.villagerId)), pantryKcal: pantryKcal(Game),
          trustPanel: trustPanel(Game, Game.villagerId),
        scholar: scholarSnap(Game) });
        rec.trustPanels.push(Object.assign({ dplus: daysSince, day: curDay }, trustPanel(Game, Game.villagerId)));
    }
    // ---- r41: meal-gate audit — every post-death day, what did the bearer eat? ----
    // Verifies Steve's 2026-10-23 ruling in the wild: an established-villager
    // successor (bodyIsNew=false) at trust<30 must bank a FULL share (~2000)
    // with NO "Half ration" voice; only new bodies are gated.
    try {
      const v = Game.state.village || {};
      const meId = Game.villagerId;
      const lin = (typeof Game.lineage === 'function' ? Game.lineage() : []) || [];
      const newc = (typeof Game.isNewcomer === 'function') ? !!Game.isNewcomer(meId) : false;
      const daySay = sayLog.filter(h => h.day === curDay);
      rec.mealAudit = rec.mealAudit || [];
      rec.mealAudit.push({
        day: curDay, dplus: daysSince, vid: firstName(rawName(Game, meId)),
        trust: Math.round(trustOf(Game, meId)),
        kcal: v.lastPlayerMeal || 0,
        bodyIsNew: lin.length === 0 || newc,
        halfVoice: daySay.some(h => /Half ration/.test(h.text)),
      });
    } catch (e) {}
    for (const cp of CONVO_DAYS) {
      if (daysSince < cp || convoDone.has(cp) || Game.over) continue;
      convoDone.add(cp);
      const daysSinceLabel = cp;
      const v = Game.state.village || {};
      const self = Game.villagerId;
      const byTrust = (v.roster || []).filter(id => id !== self).sort((a, b) => trustOf(Game, b) - trustOf(Game, a));
      for (const vid of byTrust.slice(0, 2)) {
        try {
          const r = driveConvo(Game, vid, `successor-life d+${daysSinceLabel}`, 12);
          const fn = path.join(EVID_DIR, `journey-succession-r47-transcript-${SEED}-dplus${daysSince}-${firstName(rawName(Game, vid))}.txt`);
          fs.writeFileSync(fn, r.text);
          rec.convoReads.push({ day: curDay, dplus: daysSinceLabel, vid: firstName(rawName(Game, vid)), refused: r.refused, want: r.flags.want });
          if (r.fullText) for (const ln of r.fullText.split('\n')) {
            if (/^NPC:/.test(ln)) rec.convoLines.push({ day: curDay, text: ln.replace(/^NPC:\s*/, '').slice(0, 600) });
          }
          E(`  CONVO d+${daysSinceLabel} with ${firstName(rawName(Game, vid))} (refused=${r.refused})`);
        } catch (e) { rec.anomalies.push(`successor convo d+${daysSinceLabel} threw: ` + e.message); }
      }
    }
  }
  if (endDay == null) endDay = dayOf(Game);

  // ---- funeral arc evidence ----
  const win = deathWindow();
  const f = rec.funeral;
  f.deathBeat = findLine(/🕯️|is dead/, win);
  f.recoverHome = findLine(/bring .* home|grave is dug|dug by the fire/i, win);
  f.vouch = findLine(/At the grave, .* speak/, win);
  f.systemVoice = findLine(/◈ SYSTEM|SYSTEM:/, win);
  f.burialWindowSay = findLine(/bury|grave|ashes|words for/i, sayLog.filter(h => h.day >= deathDay && h.day <= deathDay + 4));
  const pend = ((Game.state.village || {}).pendingBurials || []).length;
  const cEnd = bearerCorpse(Game, oldId);
  f.pendingBurialsLeft = pend;
  f.corpseEnd = cEnd ? { recovered: !!cEnd.recovered, buried: !!cEnd.buried, looted: !!cEnd.looted } : 'gone';
  const fallen = ((Game.state.village || {}).fallen || []);
  const fEntry = fallen.find(x => x && (x.villagerId === oldId || (x.name && String(x.name).split(' ')[0] === oldFirst)));
  f.fallenEntry = fEntry ? { day: fEntry.day, cause: fEntry.cause, name: fEntry.name } : null;
  // Social echo (r37 method, verbatim): true-name mentions in villager talk,
  // funeral-arc system beats excluded.
  const nameRe = new RegExp(`\\b${oldFirst}\\b`, 'i');
  const funeralArcRe = /bring .* home|grave|bury|words for|🕯️|Codex turns|mantle passes|MANTLE TRANSFER|starts digging|brought home/i;
  const villagerTalkRe = /Overheard|^[A-Z][a-z]+ (says|said|tells|asks|murmurs|whispers)|^\s*"[A-Z]/;
  const convoEcho = rec.convoLines.filter(l => l.day > deathDay && l.day <= deathDay + 7 && nameRe.test(l.text));
  const sayEcho = sayLog.filter(h => h.day > deathDay && h.day <= deathDay + 7
    && nameRe.test(h.text) && !funeralArcRe.test(h.text) && villagerTalkRe.test(h.text));
  const mentions = convoEcho.concat(sayEcho.map(h => ({ day: h.day, text: h.text })));
  f.echoMentions = mentions.length;
  f.echoConvo = convoEcho.length;
  f.echoSay = sayEcho.length;
  f.echoSample = mentions.slice(0, 6).map(h => `d${h.day}: ${h.text.slice(0, 220)}`);
  // r44 ECHO V2: same window + funeral-arc exclusion, NO villager-talk format restriction.
  const sayEchoV2 = sayLog.filter(h => h.day > deathDay && h.day <= deathDay + 7 && nameRe.test(h.text) && !funeralArcRe.test(h.text));
  const sayEchoV2Delta = sayEchoV2.filter(h => !sayEcho.includes(h));
  f.echoV2 = convoEcho.length + sayEchoV2.length;
  f.echoV2Convo = convoEcho.length;
  f.echoV2Say = sayEchoV2.length;
  f.echoV2Delta = sayEchoV2Delta.length;
  f.echoV2Sample = sayEchoV2.slice(0, 8).map(h => `d${h.day}: ${h.text.slice(0, 220)}`);
  f.echoV2DeltaSample = sayEchoV2Delta.slice(0, 8).map(h => `d${h.day}: ${h.text.slice(0, 220)}`);
  f.echoV2ExcludedByArc = sayLog.filter(h => h.day > deathDay && h.day <= deathDay + 7 && nameRe.test(h.text) && funeralArcRe.test(h.text)).length;
  // r46 ECHO V2B: v2 minus inventory-transfer lines ("You take ...").
  const lootRe = /^You take /i;
  const sayEchoV2b = sayEchoV2.filter(h => !lootRe.test(h.text));
  f.echoV2b = convoEcho.length + sayEchoV2b.length;
  f.echoV2bSay = sayEchoV2b.length;
  f.echoV2bExcluded = sayEchoV2.length - sayEchoV2b.length;
  f.echoV2bExcludedSample = sayEchoV2.filter(h => lootRe.test(h.text)).slice(0, 4).map(h => `d${h.day}: ${h.text.slice(0, 220)}`);
  f.nameCollision = livingRoster(Game).filter(id => id !== oldId && firstName(rawName(Game, id)) === oldFirst).map(id => firstName(rawName(Game, id)));
  // Trust-trap observation (Steve's call — document only): half-ration lines
  // after the death + successor trust at end.
  f.halfRationLines = sayLog.filter(h => h.day > deathDay && /Half ration|don't trust you yet/i.test(h.text))
    .map(h => `d${h.day}: ${h.text.slice(0, 160)}`);
  f.successorTrustEnd = Math.round(trustOf(Game, newId));
  f.deathsTotal = deaths;
  E(`\nFUNERAL: deathBeat=${f.deathBeat.length} recover=${f.recoverHome.length} vouch=${f.vouch.length} (eligible=${vouchers.length}) echo=${f.echoMentions} organicBurial=${JSON.stringify(rec.organicBurial)} halfRation=${f.halfRationLines.length}`);
  // r41b: meal-gate verdict (MG2, pre-registered): an established-villager
  // successor must NEVER be half-rationed nor voiced at. The gate's
  // observable signature is the VOICE — voice==share by construction (the
  // same boolean feeds both; R41 comment), so halfVoice is necessary and
  // sufficient for a gate event. A small positive draw with no voice is a
  // room-limited draw (want=min(share,room); "You're full" only at want<=0)
  // or a thin pantry — honest, not gated. kcal==0 with no voice is no meal
  // drawn that day (camp wild / full). Both are tallied for the run note.
  const audit = rec.mealAudit || [];
  const viol = audit.filter(m => !m.bodyIsNew && m.halfVoice);
  const smallDraw = audit.filter(m => !m.bodyIsNew && !m.halfVoice && m.kcal > 0 && m.kcal < 1500);
  const noMeal = audit.filter(m => !m.bodyIsNew && m.kcal === 0 && !m.halfVoice);
  const gatedNew = audit.filter(m => m.bodyIsNew && m.trust < 30);
  rec.mg2 = viol.length === 0 && audit.length > 0;
  rec.mealGateViolations = viol;
  E(`\nMEAL-GATE: audited=${audit.length} violations=${viol.length} noMealDays=${noMeal.length} newBodyGatedDays=${gatedNew.length} (voiced=${gatedNew.filter(m => m.halfVoice).length})`);
  for (const mv of viol.slice(0, 6)) E(`  VIOLATION d+${mv.dplus}: ${mv.vid} trust=${mv.trust} kcal=${mv.kcal} halfVoice=${mv.halfVoice}`);

  // r42: scholar-function signals (post-death window; computed here so tele carries them)
  const postSay42 = sayLog.filter(h => h.day >= deathDay);
  const systemLines42 = postSay42.filter(h => /◈/.test(h.text));
  const offerLines42 = postSay42.filter(h => /offer|grant|level[- ]up|choose.*ability|ability.*choice/i.test(h.text));
  const endSnap42 = scholarSnap(Game);
  const base42 = rec.scholarBase || {};
  const signals42 = {
    levelUp: (endSnap42.levelUpQueue || 0) > 0 || offerLines42.some(h => /level[- ]up|choose.*ability/i.test(h.text)),
    systemVoice: systemLines42.length,
    offerLines: offerLines42.length,
    codexPlantsDelta: (endSnap42.codexPlants || 0) - (base42.codexPlants || 0),
    codexSkillsDelta: (endSnap42.codexSkills || 0) - (base42.codexSkills || 0),
    codexAbilitiesDelta: (endSnap42.codexAbilities || 0) - (base42.codexAbilities || 0),
    xpDelta: (endSnap42.xpTotal || 0) - (base42.xpTotal || 0),
  };
  signals42.any = signals42.levelUp || signals42.offerLines > 0 || signals42.codexPlantsDelta > 0 || signals42.codexSkillsDelta > 0 || signals42.codexAbilitiesDelta > 0 || signals42.xpDelta > 0;
  rec.functionSignals = signals42;
  rec.scholarEnd = endSnap42;
  rec.pantryEnd = pantryKcal(Game);
  rec.dayAdv = (endDay != null) ? (endDay - deathDay) : 0;
  E(`SUCCESSOR-LIFE: dayAdv=${rec.dayAdv} signals=${JSON.stringify(signals42)} pantry ${rec.pantryBase}->${rec.pantryEnd}`);

  // r43: TRUST VERDICT — both dials, mantle vs last panel, plus movers.
  (function () {
    const panels = rec.trustPanels || [];
    const first = panels[0], last = panels[panels.length - 1];
    if (!first || !last) { rec.trustVerdict = { readable: false }; return; }
    const officeDelta = (last.office || 0) - (first.office || 0);
    const villageDelta = Math.round(((last.villageMean || 0) - (first.villageMean || 0)) * 10) / 10;
    const firstPer = {}; for (const p of (first.per || [])) firstPer[p.id] = p.t;
    const movers = (last.per || []).map(p => ({ id: p.id, from: (firstPer[p.id] == null ? null : firstPer[p.id]), to: p.t, delta: (firstPer[p.id] == null ? null : p.t - firstPer[p.id]) }))
      .filter(m => m.delta != null && Math.abs(m.delta) >= 5).sort((a, b) => b.delta - a.delta);
    rec.trustVerdict = { readable: true,
      officeMantle: first.office, officeLast: last.office, officeDelta, officeClass: trustClass(officeDelta),
      villageMantle: first.villageMean, villageLast: last.villageMean, villageDelta, villageClass: trustClass(villageDelta),
      villageGe60Mantle: first.villageGe60, villageGe60Last: last.villageGe60,
      movers };
    const byDeed = {};
    for (const d of (rec.deedLedger || [])) {
      const b = (byDeed[d.deed] = byDeed[d.deed] || { calls: 0, ok: 0, deltaSum: 0, deltaN: 0, positive: 0 });
      b.calls++; if (d.ok) b.ok++;
      if (d.delta != null) { b.deltaSum += d.delta; b.deltaN++; if (d.delta > 0) b.positive++; }
    }
    for (const k of Object.keys(byDeed)) { const b = byDeed[k]; b.meanDelta = b.deltaN ? Math.round((b.deltaSum / b.deltaN) * 100) / 100 : null; }
    rec.deedSummary = byDeed;
    E(`TRUST-DIALS: office ${first.office}->${last.office} (${officeDelta >= 0 ? '+' : ''}${officeDelta}, ${trustClass(officeDelta)}) | villageMean ${first.villageMean}->${last.villageMean} (${villageDelta >= 0 ? '+' : ''}${villageDelta}, ${trustClass(villageDelta)}) | ge60 ${first.villageGe60}->${last.villageGe60} | movers>=5: ${JSON.stringify(movers)}`);
    E(`DEED-LEDGER: calls=${(rec.deedLedger || []).length} summary=${JSON.stringify(byDeed)}`);
  })();

  // r45 OFFICE MOVES: every post-death day the office entry moved, with a
  // FULL bucketed census of that day's say lines (never claimed as cause —
  // a bucket's presence is a candidate writer, not an attribution).
  // Bucket precedence (first match wins, so counts sum to the day total):
  // bearer-name > gift/share > rumor/reputation > crisis/System > other.
  // Driven-convo lines that day are counted separately (they do not flow
  // through Game.say, so they are not in the say-log total).
  (function () {
    const daily = rec.officeDaily || [];
    const moves = [];
    const bearerRe = new RegExp(`\\b${newFirst}\\b`, 'i');
    for (let i = 1; i < daily.length; i++) {
      if (daily[i].office !== daily[i-1].office) {
        const day = daily[i].day;
        const lines = sayLog.filter(h => h.day === day);
        const b = { bearer: [], gift: [], rumor: [], crisis: [], other: 0 };
        for (const h of lines) {
          const t = h.text;
          if (bearerRe.test(t)) b.bearer.push(t.slice(0, 200));
          else if (/give|gift|share|donat/i.test(t)) b.gift.push(t.slice(0, 200));
          else if (/rumor|gossip|word travels|reputation/i.test(t)) b.rumor.push(t.slice(0, 200));
          else if (/◈|SYSTEM|raid|monster|arena|contest/i.test(t)) b.crisis.push(t.slice(0, 200));
          else b.other++;
        }
        const convoDay = (rec.convoLines || []).filter(l => l.day === day).length;
        const vmFrom = (daily[i - 1].villageMean == null) ? null : daily[i - 1].villageMean;
        const vmTo = (daily[i].villageMean == null) ? null : daily[i].villageMean;
        moves.push({ day, dplus: daily[i].dplus, bearer: daily[i].bearer,
          from: daily[i - 1].office, to: daily[i].office, delta: daily[i].office - daily[i - 1].office,
          villageMeanFrom: vmFrom, villageMeanTo: vmTo,
          villageMeanDelta: (vmFrom == null || vmTo == null) ? null : Math.round((vmTo - vmFrom) * 10) / 10,
          totalLines: lines.length, convoLines: convoDay,
          buckets: { bearerN: b.bearer.length, giftN: b.gift.length, rumorN: b.rumor.length, crisisN: b.crisis.length, otherN: b.other,
            bearerSample: b.bearer.slice(0, 3), giftSample: b.gift.slice(0, 3), rumorSample: b.rumor.slice(0, 3), crisisSample: b.crisis.slice(0, 3) } });
      }
    }
    rec.officeMoves = moves;
  })();
  // Telemetry-baseline fields (same contract as telemetry-baselines/succession.json)
  rec.tele = {
    'deaths.bearer': deaths,
    'census.alive': livingRoster(Game).length,
    'census.fallen': ((Game.state.village || {}).fallen || []).length,
    'census.integrationStage': (function () { try { return (typeof Game.integrationStage === 'function') ? Game.integrationStage() : 0; } catch (e) { return 0; } })(),
    'week2.deadBearerMentions': sayLog.filter(h => h.day > deathDay && h.day <= deathDay + 7 && nameRe.test(h.text)).length,
    'succession.parityEqual': (rec.parity && rec.parity.equal) ? 1 : 0,
    'succession.parityInherited': (rec.parity && rec.parity.inherited) ? rec.parity.inherited.length : -1,
    'succession.functionAny': rec.functionSignals && rec.functionSignals.any ? 1 : 0,
    'succession.dayAdv': rec.dayAdv || 0,
    'succession.pantryEnd': rec.pantryEnd || 0,
    'succession.trustOfficeDelta': (rec.trustVerdict && rec.trustVerdict.officeDelta != null) ? rec.trustVerdict.officeDelta : -999,
    'succession.trustVillageDelta': (rec.trustVerdict && rec.trustVerdict.villageDelta != null) ? rec.trustVerdict.villageDelta : -999,
    'succession.deedCalls': (rec.deedLedger || []).length,
    'succession.echoOld': (rec.funeral && rec.funeral.echoMentions) || 0,
    'succession.echoV2': (rec.funeral && rec.funeral.echoV2) || 0,
    'succession.echoV2b': (rec.funeral && rec.funeral.echoV2b) || 0,
    'succession.callMoves': (rec.officeCallMoves || []).length,
    'succession.callMovesSoloOffice': (rec.officeCallMoves || []).filter(m => !m.bearerChanged && m.soloOffice).length,
    'succession.callMovesEventOnly': (rec.officeCallMoves || []).filter(m => !m.bearerChanged && m.eventClass === 'event-only').length,
    'succession.callCensus': (rec.officeCallMoves || []).filter(m => m.buckets).length,
    'succession.chainDeaths': (rec.chainDeaths || []).length,
    'succession.chainCausesKnown': (rec.chainDeaths || []).filter(c => c.causeKnown).length,
    'succession.officeMoves': (rec.officeMoves || []).length,
    'succession.vouchSnap': (rec.preDeathEligible != null) ? 1 : 0,
    'succession.moveCensus': (rec.officeMoves || []).filter(m => m.buckets).length,
  };
  try {
    fs.writeFileSync(path.join(EVID_DIR, `journey-succession-r47-tele-${SEED}.json`), JSON.stringify(rec.tele, null, 1));
  } catch (e) { E('tele write failed: ' + e.message); }

  finish();

  function finish() {
    try { Game.say = _say; } catch (e) {}
    try { Game.buryCorpse = _bury; Game.payRespects = _respects; } catch (e) {}
    try { for (const fn of Object.keys(_deedOrig)) Game[fn] = _deedOrig[fn]; } catch (e) {}
    try { if (_pd) Game.playerDeath = _pd; } catch (e) {}
    capturing = false;
    const f = rec.funeral;
    const arcOk = f.deathBeat && f.deathBeat.length > 0
      && f.recoverHome && f.recoverHome.length > 0
      && f.scriptedBurial && f.scriptedBurial.found && f.scriptedBurial.respectsOk && f.scriptedBurial.buryOk;
    rec.m1 = !!arcOk;
    rec.m2a_contract = vouchers.length === 0 ? 'n/a (none eligible)' : (f.vouch.length > 0);
    // r45 VOUCH SNAPSHOT verdict. "Alive at funeral" is operationalized as
    // alive in the immediate post-death roster: vouch lines fire inside the
    // death machinery, so a voucher alive right after the kill was alive at
    // vouch time. Died-in-between = eligible-at-death but gone from the
    // post-death roster (the 25003 class: vouched and died the same day).
    (function () {
      const atDeath = (rec.death && rec.death.eligibleAtDeath) || null;
      const postNames = vouchers.map(id => firstName(rawName(Game, id)));
      const fallenList = ((Game.state.village || {}).fallen || []);
      if (atDeath == null) {
        rec.vouch45 = { rule: 'organic-n/a', verdict: (f.vouch && f.vouch.length > 0) ? 'PASS-fired' : 'n/a-organic',
          detail: 'organic death: no pre-death snapshot; r44 funeral-snapshot rule applies as detail only' };
      } else {
        const diedBetween = atDeath.filter(n => !postNames.includes(n)).map(n => {
          const fe = fallenList.find(x => x && x.name && String(x.name).split(' ')[0] === n);
          return { name: n, cause: fe ? (fe.cause || 'UNKNOWN-nocause') : 'UNKNOWN-not-in-fallen' };
        });
        const fired = !!(f.vouch && f.vouch.length > 0);
        let verdict;
        if (atDeath.length === 0) verdict = 'n/a-none-eligible';
        else if (fired) verdict = 'PASS-fired';
        else if (postNames.filter(n => atDeath.includes(n)).length > 0) verdict = 'FAIL-alive-silent';
        else if (diedBetween.length > 0 && diedBetween.every(d => !String(d.cause).startsWith('UNKNOWN'))) verdict = 'OPEN-all-died-known-cause';
        else verdict = 'OPEN-all-died-unknown-cause';
        rec.vouch45 = { rule: 'snapshot', eligibleAtDeath: atDeath,
          alivePostDeath: postNames.filter(n => atDeath.includes(n)),
          diedBetween, vouchLines: (f.vouch || []).length, verdict };
      }
    })();
    rec.m2b_eligible = vouchers.length >= 1;
    rec.m2b_detail = `vouchersEligible=${JSON.stringify(rec.death.vouchersEligible)} vouchLines=${(f.vouch || []).length}`;
    rec.m3 = (f.echoMentions || 0) >= 2;
    rec.m3v2b = (f.echoV2b || 0) >= 2;
    rec.m3v2bDetail = `echoV2b=${f.echoV2b} (v2=${f.echoV2}, excludedLoot=${f.echoV2bExcluded})`;
    rec.m3detail = `echoMentions=${f.echoMentions} (convo=${f.echoConvo}, say=${f.echoSay})`;
    rec.m4 = !!(rec.death && rec.death.passed && rec.death.linOk && rec.death.moOk);
    rec.m5 = 'manual';
    const post = sayLog.slice(handoffStart);
    const src = post.concat(rec.convoLines.filter(l => l.day >= (rec.death ? rec.death.day : 0)).map(l => ({ day: l.day, text: l.text })));
    const trips = [];
    if (oldFirst) {
      const addrRe = new RegExp(`\\b${oldFirst}\\b.*(you|your)|you.*\\b${oldFirst}\\b`, 'i');
      for (const h of src) {
        // r41b: only post-death lines can be identity failures. The organic
        // path scans the whole log (handoffStart=0); pre-death lines address
        // the OLD bearer as themselves (e.g. a d8 SYSTEM grant to Riley the
        // then-player) and tripped the wire as false positives on 20013/20014.
        if ((h.day || 0) < deathDay) continue;
        if (addrRe.test(h.text) && !/is dead|died|'s gone|was |buried|bury|grave|mourn|miss |take .* from|not the office, the person|keep expecting|ashes|words for|say a few words/i.test(h.text)) {
          trips.push({ day: h.day, text: h.text.slice(0, 200) });
        }
      }
    }
    rec.identityTripsRaw = trips.slice(0, 10);
    // r43 grief exclusion: reminiscence about the dead is not misaddressing
    // (r42's false positives: "Vivian is gone and the world just continues",
    // "Stanley always took the burnt piece"). The filtered count is the
    // quoted wire; the raw count stays auditable above.
    const griefRe = /is gone|'s gone|died|is dead|was |buried|grave|mourn|miss|remember|always took|burnt piece|took the|owed|name.*right/i;
    const tripsF = trips.filter(t => !griefRe.test(t.text));
    rec.identityTrips = tripsF.slice(0, 10);
    E(`\nIDENTITY TRIPS: raw=${trips.length} grief-excluded=${tripsF.length}`);
    E(`METRICS: m1=${rec.m1} m2a=${JSON.stringify(rec.m2a_contract)} m2b=${rec.m2b_eligible} m3=${rec.m3}(${rec.m3detail}) m4=${rec.m4} m5=${rec.m5} | endDay=${endDay} alive=${livingRoster(Game).length} over=${!!Game.over}`);
    E(`anomalies: ${rec.anomalies.length}`); for (const a of rec.anomalies.slice(0, 8)) E('  ANOMALY: ' + a);
    if (process.env.DUMP_SAY) {
      try {
        fs.writeFileSync(process.env.DUMP_SAY, sayLog.map(h => `d${h.day}: ${h.text}`).join('\n') + '\n');
        E(`say dump -> ${process.env.DUMP_SAY}`);
      } catch (e) { E('say dump failed: ' + e.message); }
    }
    if (rec.death) {
      const sg = rec.functionSignals || { any: false };
      rec.s1 = !!(!Game.over && Game.villagerId != null && (rec.dayAdv || 0) >= 25);
      rec.s2 = !!(rec.parity && rec.parity.readable && rec.parity.equal && (rec.parity.inherited || []).length === 0);
      rec.s3 = !!sg.any;
      rec.s4 = !!(!Game.over && Game.villagerId != null);
      rec.s5 = !!(rec.m1 && rec.m4 && rec.mg2);
      const panels43 = rec.trustPanels || [];
      rec.t1 = !!(panels43.length && panels43[0].dplus === 0 && panels43.some(p => p.dplus >= 14));
      rec.t2 = !!((rec.deedLedger || []).length > 0);
      rec.t1detail = `panels=${panels43.map(p => 'd+' + p.dplus).join(',')}`;
      rec.t2detail = `deedCalls=${(rec.deedLedger || []).length}`;
      E(`S-METRICS: s1=${rec.s1} s2=${rec.s2} s3=${rec.s3} s4=${rec.s4} s5=${rec.s5} dayAdv=${rec.dayAdv}`);
      E(`T-METRICS: t1=${rec.t1}(${rec.t1detail}) t2=${rec.t2}(${rec.t2detail}) trustVerdict=${JSON.stringify(rec.trustVerdict || {})}`);
      rec.e1 = { old: (rec.funeral && rec.funeral.echoMentions) || 0, v2: (rec.funeral && rec.funeral.echoV2) || 0, v2Say: (rec.funeral && rec.funeral.echoV2Say) || 0, v2Delta: (rec.funeral && rec.funeral.echoV2Delta) || 0, arcExcluded: (rec.funeral && rec.funeral.echoV2ExcludedByArc) || 0, teleWeek2: (rec.tele && rec.tele['week2.deadBearerMentions']) || 0, collision: (rec.funeral && rec.funeral.nameCollision) || [] };
      rec.e2 = { chainN: (rec.chainDeaths || []).length, known: (rec.chainDeaths || []).filter(c => c.causeKnown).length, unknown: (rec.chainDeaths || []).filter(c => !c.causeKnown).length };
      rec.e3 = { dailyDays: (rec.officeDaily || []).length, moves: (rec.officeMoves || []).length };
      rec.e4 = rec.vouch45 || null;
      rec.e5 = { moves: (rec.officeMoves || []).length, withCensus: (rec.officeMoves || []).filter(m => m.buckets).length,
        upMoves: (rec.officeMoves || []).filter(m => m.delta > 0).length, downMoves: (rec.officeMoves || []).filter(m => m.delta < 0).length };
      rec.e6 = { callMoves: (rec.officeCallMoves || []).length,
        withCensus: (rec.officeCallMoves || []).filter(m => m.buckets).length,
        chainHandoffs: (rec.officeCallMoves || []).filter(m => m.bearerChanged).length,
        trustMoves: (rec.officeCallMoves || []).filter(m => !m.bearerChanged).length };
      (function () { const tm = (rec.officeCallMoves || []).filter(m => !m.bearerChanged);
        const solo = tm.filter(m => m.soloOffice);
        const single = tm.filter(m => (m.movers || []).length === 1);
        const ec = { 'event-only': 0, 'deed-only': 0, both: 0, neither: 0 };
        for (const m of tm) if (ec[m.eventClass] !== undefined) ec[m.eventClass]++;
        rec.e7 = { trustMoves: tm.length, soloOffice: solo.length,
          soloOfficeDeltas: solo.map(m => m.delta),
          soloBearerDeltaExact: solo.map(m => m.bearerDeltaExact),
          singleMoverBearer: single.filter(m => m.bearerIsMover).length,
          singleMoverOther: single.filter(m => !m.bearerIsMover).length,
          eventClass: ec,
          bearerDeltaExactMissing: tm.filter(m => typeof m.bearerDeltaExact !== 'number').length }; })();
      // r46 C1 cross-check: every officeDaily move day must have a callMove day.
      (function () {
        const dailyMoves = [];
        const daily = rec.officeDaily || [];
        for (let i = 1; i < daily.length; i++) if (daily[i].office !== daily[i - 1].office) dailyMoves.push(daily[i].day);
        const callDays = new Set((rec.officeCallMoves || []).map(m => m.day));
        const missing = dailyMoves.filter(d => !callDays.has(d));
        rec.callCheck = { dailyMoveDays: dailyMoves.length, callMoveDays: callDays.size, missingDays: missing, ok: missing.length === 0 };
      })();
      E(`E6/CALLCHECK: e6=${JSON.stringify(rec.e6)} callCheck=${JSON.stringify(rec.callCheck)} m3v2b=${rec.m3v2b}(${rec.m3v2bDetail})`);
      E(`E7/R47: e7=${JSON.stringify(rec.e7)}`);
      E(`E-METRICS: e1=${JSON.stringify(rec.e1)} e2=${JSON.stringify(rec.e2)} e3=${JSON.stringify(rec.e3)}`);
    }
    console.log(JSON.stringify(rec, null, 1));
  }
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
