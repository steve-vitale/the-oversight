// producerparty-driver-20261115.js — JUDGED driver, arm sim-producerparty-b
// (copy of scripts/cascade-driver-20261115.js, the FIXED driver).
// ADAPTATIONS (instrument-only, no game-behavior change):
// RUN/OUTDIR defaults renamed; per-seed filename prefix
// producerparty-b-s; evidence date dir 2026-11-15; policy dispatch is
// competent-answercourt-b only (the winnability-chain substrate);
// cascade instrumentation KEPT (TB combat sessions, deaths, provenance)
// plus the WAVE-5 PER-ENCOUNTER RECORDER (see below): every fieldFight
// against a wave-4+ monster is recorded with party size, gate result,
// trick state, plan stage, outcome, and the fight lines said during it.
// All recorder wraps are pure reads plus writes to driver-local arrays —
// the judged fields (series, deaths, standing, waveKills) must reproduce
// the cascade driver's numbers on the same seeds (Stage 0 determinism
// leg) before this driver judges anything.
// RECORDER ROWS (per seed, top-level w5encounters / w5gates / w5seeds /
// w5departs): an encounter row is one fieldFight call vs a wave-4+
// monster: {day, vid, mid, wave, alliesN, allyVids, gate, outcome,
// rounds, vTaken, mDealt, calledHelp, allyVid, fleeHpFrac,
// trickBefore, trickAfter, lines[]}. A gate row is one
// winPlanFightGate call vs a wave-4+ monster: {day, vid, mid, wave,
// result, reason, partySize, allArmed, allArmored, trickKnown,
// planStage, planTarget, needWave}. A seed row is one
// winPlanSeedFromFight call (wave 3+): {day, vid, mid, wave, outcome,
// stageAfter, target}. A depart row is one winPlanDepart call that
// returns hold/launch for a plan holder: {day, vid, result, stage,
// target, party}.
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { createLinkCapture } = require('./linklines-capture');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { scaleclimbPolicy, scaleclimbStats, resetScaleclimbStats } = require(path.join(REPO, 'scripts', 'policies', 'competent-scaleclimb-b'));
const { answercourtPolicy, answercourtStats, resetAnswercourtStats } = require(path.join(REPO, 'scripts', 'policies', 'competent-answercourt-b'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const POLICIES = (process.env.POLICY ? process.env.POLICY.split(',').map(function (s) { return s.trim(); }) : ['competent-scaleclimb-b', 'competent-answercourt-b']).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'producerparty-b';
const OUTDIR = process.env.OUTDIR || 'perseed-producerparty-b-control';

// Wave-5 id set (frozen list from src/data/monsters.json, wave 5 —
// re-read live so the recorder refuses a stale roster silently).
const W5_IDS = ['cancellation', 'editor', 'rerun', 'spoiler', 'timeslot',
  'nielsen', 'finale', 'finale_crew', 'finale_opening', 'network_note'];
function loadWave5Ids() {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    return list.filter(function (m) { return m.wave === 5; }).map(function (m) { return m.id; }).sort();
  } catch (e) { return W5_IDS.slice().sort(); }
}
const W5_SET = new Set(loadWave5Ids());
// gearOfReplica(Game, vid): the win-plan gear read, replicated here as
// pure reads (win-plan.js gearOf is module-internal). Armed = weapon
// bonus > 0 or a weapon carried; armored = armor P > 0. Used ONLY to
// record the gate's inputs — never to decide anything.
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

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}

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
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce(function (t, i) { return t + (i.kcalEach || 0) * (i.units || 1); }, 0);
  } catch (e) { return 0; }
}

// One daily snapshot: pure reads only (see header). Returns null when the
// day is not readable (counts as an instrument error upstream).
// Link roll fields per link: id, o=other village, k=kind, p=primary,
// sub=subordinate, st=status, t=trust, f=formed day, age, cq=conquered,
// ar=arrears, tw=tendedWeek, pd=pendingDemand kind, pr=pendingRenegotiation,
// se=seasoned, rp=regional+.
function snapshot(Game, errors) {
  try {
    const st = Game.state || {};
    const s = st.scholar || {};
    const day = s.day || 0;
    const pg = safe(function () { return Game.progState() || {}; }, {});
    const d = safe(function () { return Game.deedState() || {}; }, {});
    const faced = d.wavesFaced || {};
    let w1 = 0, w2 = 0, w3 = 0, w4 = 0, w5 = 0;
    for (const mid of Object.keys(faced)) {
      const w = faced[mid] | 0;
      if (w === 1) w1++; else if (w === 2) w2++; else if (w === 3) w3++;
      else if (w === 4) w4++; else if (w === 5) w5++;
    }
    const standing = safe(function () { return Game.villageStanding() || {}; }, {});
    const seat = safe(function () { return Game.tableSeat() || {}; }, {});
    const gate = safe(function () { return Game.deedGateReady() || {}; }, {});
    const rd4 = safe(function () { return Game.waveCombatReadiness(4) || {}; }, {});
    const rd5 = safe(function () { return Game.waveCombatReadiness(5) || {}; }, {});
    // --- link roll (LIVE village state, never a roster) ---
    const links = [];
    let linkErr = null;
    try {
      const hs = (typeof Game.hierarchyState === 'function') ? (Game.hierarchyState() || []) : [];
      for (const l of hs) {
        if (!l) continue;
        const other = safe(function () { return Game._linkOther ? Game._linkOther(l, 'haven') : (l.primary === 'haven' ? l.subordinate : l.primary); }, (l.primary === 'haven' ? l.subordinate : l.primary));
        const se = safe(function () { return Game._linkSeasoned ? !!Game._linkSeasoned(l, !!l.conquered) : false; }, false);
        const rp = safe(function () { return Game._linkRegionalPlus ? !!Game._linkRegionalPlus(l) : false; }, false);
        links.push({
          id: l.id || null, o: other || null, k: l.kind || 'link',
          p: l.primary || null, sub: l.subordinate || null,
          st: l.status || null, t: l.trust | 0, f: l.day | 0,
          age: day - (l.day | 0), cq: l.conquered ? 1 : 0,
          ar: l.arrears | 0, tw: (l.tendedWeek === undefined ? null : l.tendedWeek | 0),
          pd: (l.pendingDemand && l.pendingDemand.kind) || null,
          pr: l.pendingRenegotiation ? 1 : 0,
          se: se ? 1 : 0, rp: rp ? 1 : 0,
        });
      }
    } catch (e) { linkErr = String(e.message).slice(0, 80); }
    if (linkErr) errors.push('linkroll: ' + linkErr);
    const pol = safe(function () { return Game.polityOf ? Game.polityOf('haven') : null; }, null);
    const hp = safe(function () { return Game._havenPolity ? Game._havenPolity() : null; }, null);
    const ds = (st.answermailDrive || null);
    return {
      d: day,
      arc: pg.arc | 0,
      scale: safe(function () { return Game.scaleRank() || 'village'; }, 'village'),
      netDay: st.networkLiveDay | 0,
      stRaw: standing.total | 0, war: standing.war | 0, dip: standing.diplomacy | 0,
      plenty: standing.plenty | 0, warPts: standing.warPts | 0, links: standing.links | 0,
      feasts: standing.feasts | 0,
      ladCounted: (seat.detail && seat.detail.ladderCounted) | 0,
      ladPeak: (seat.detail && seat.detail.ladderPeakStage) | 0,
      w1: w1, w2: w2, w3: w3, w4: w4, w5: w5,
      cont: (d.contestsSurvived | 0) || 0,
      cris: Object.keys(pg.crises || {}).length,
      stage: (gate.stage | 0) || (safe(function () { return Game.integrationStage() || 0; }, 0)),
      sent: pg.sentimentTaught ? 1 : 0,
      surge: (s.prog && s.prog.feastSurgeUsed) ? 1 : 0,
      seat: seat.seat || 'none',
      gateOk: !!gate.ok,
      tableWaiting: !!pg.tableWaiting, tableAnnounced: !!pg.tableAnnounced,
      tableDone: !!pg.tableDone,
      wk: Object.assign({}, st.waveKills || {}),
      vet4: rd4.veterans | 0, vet5: rd5.veterans | 0,
      rd4ready: !!rd4.ready, rd5ready: !!rd5.ready,
      rd4short: (rd4.short || []).slice(), rd5short: (rd5.short || []).slice(),
      pop: ((st.village || {}).roster || []).length,
      abilN: ((s.abilities || []).length),
      pantry: pantryKcal(Game),
      linksRoll: links,
      nActive: links.filter(function (l) { return l.st === 'active'; }).length,
      nSeasoned: links.filter(function (l) { return l.st === 'active' && l.se; }).length,
      nCounted: links.filter(function (l) { return l.st === 'active' && l.se && l.rp; }).length,
      polity: pol ? { shape: pol.shape || null, size: pol.size | 0, led: !!pol.led } : null,
      havenPolity: hp ? { shape: hp.shape || null, size: hp.size | 0, led: !!hp.led } : null,
      pendingCounter: st.pendingCounter ? { target: st.pendingCounter.targetId || null, day: st.pendingCounter.day | 0 } : null,
      pendingAccord: st.pendingAccord ? { link: st.pendingAccord.linkId || null } : null,
      pendingNational: st.pendingNational ? { shape: st.pendingNational.shape || null, primary: st.pendingNational.primary || null, day: st.pendingNational.day | 0 } : null,
      pendingGlobal: st.pendingGlobal ? { viewership: st.pendingGlobal.viewership | 0, day: st.pendingGlobal.day | 0 } : null,
      nationalLive: !!st.nationalLive,
      // HOLDBUILD additive fields (pure RAW reads — NEVER through
      // Game.winPlanStats(): that method calls stateOf(), which CREATES
      // village.winPlan/winPlanStats, and winPlanHavenTick returns early
      // while winPlan is undefined — so creating it from the recorder
      // seeds plans days early and diverges the run (100201 pilot-off:
      // w1 1->2 by day 5, rep Carmen->Liam by day 10). Raw reads only.
      pd: safe(function () { return (typeof Game.pantryDaysEstimate === 'function') ? Game.pantryDaysEstimate() : null; }, null),
      wpHolders: (function () { try { return Object.keys(((st.village || {}).winPlan) || {}).length; } catch (e) { return null; } })(),
      wpUpkeep: (function () { try { return ((((st.village || {}).winPlanStats || {}).upkeepTends) | 0); } catch (e) { return 0; } })(),
      wpReclimb: (function () { try { return ((((st.village || {}).winPlanStats || {}).reclimbTends) | 0); } catch (e) { return 0; } })(),
      // FUNERALMEND additive field (pure RAW read — the counters live at
      // state.village.funeralMendStats and are created ONLY in the mend
      // path; reading a missing key is a plain undefined, never a
      // state-creating call).
      fm: (function () { try { var f = ((st.village || {}).funeralMendStats || {}); return { funerals: (f.funerals | 0), linksMended: (f.linksMended | 0), kcalSpent: (f.kcalSpent | 0) }; } catch (e) { return { funerals: 0, linksMended: 0, kcalSpent: 0 }; } })(),
      drive: ds ? {
        tends: ds.tends | 0, tendsBlocked: ds.tendsBlockedPantry | 0,
        accordAnswers: ds.accordAnswers | 0,
        renegotiationAnswers: ds.renegotiationAnswers | 0,
        demandAnswers: ds.demandAnswers | 0, errors: ds.errors | 0,
      } : null,
      // WIN-PLAN (producerparty recorder, pure RAW reads — stateOf()
      // CREATES winPlan/winPlanStats, so never call winPlanStats() from
      // the recorder; read the keys directly, missing = absent).
      wp: (function () {
        try {
          var vv = (st.village || {});
          var wps = vv.winPlanStats || null;
          var plans = vv.winPlan || null;
          var byStage = {};
          var w5Targets = 0, plansN = 0;
          if (plans) {
            for (var k in plans) {
              if (!Object.prototype.hasOwnProperty.call(plans, k)) continue;
              plansN += 1;
              var pl = plans[k] || {};
              byStage[pl.stage || '?'] = (byStage[pl.stage || '?'] || 0) + 1;
              if (pl.target && W5_SET.has(pl.target)) w5Targets += 1;
            }
          }
          return wps ? {
            gearHolds: wps.gearHolds | 0, partyInvites: wps.partyInvites | 0,
            partyDepartures: wps.partyDepartures | 0, partyWaits: wps.partyWaits | 0,
            avoidances: wps.avoidances | 0, seekContacts: wps.seekContacts | 0,
            standingContacts: wps.standingContacts | 0,
            veteranGuardHolds: wps.veteranGuardHolds | 0, partyFights: wps.partyFights | 0,
            planSeeds: wps.planSeeds | 0, stageAdvances: wps.stageAdvances | 0,
            trickHolds: wps.trickHolds | 0,
            plansN: plansN, byStage: byStage, w5Targets: w5Targets,
          } : { plansN: plansN, byStage: byStage, w5Targets: w5Targets };
        } catch (e) { return null; }
      })(),
    };
  } catch (e) {
    errors.push('snapshot: ' + String(e.message).slice(0, 80));
    return null;
  }
}

const LINK_LINE_RE = /tend|season|polity|realm|trust|tribute|feast|link|bond|accord|court|drift|bow|table|seat|lesser/i;
// MEAL_LINE_RE (answercourt-b, kept from holdpantry-b): the scaleclimb cap (150 lines) filled by
// day ~28 with early meal/tribute chatter, so the polity's dissolution had
// no played line. Filter the meal lines out and raise the cap to 600.
const MEAL_LINE_RE = /village meal|cooked for the haven|communal pantry|you keep a day's food|meals stretched/i;

async function oneRun(seed, policyName) {
  const policy = policyName === 'competent-answercourt-b' ? answercourtPolicy : scaleclimbPolicy;
  if (policyName !== 'competent-scaleclimb-b' && policyName !== 'competent-answercourt-b') throw new Error('Unknown policy ' + policyName);
  if (policyName === 'competent-answercourt-b') { resetAnswercourtStats(); resetScaleclimbStats(); }
  else resetScaleclimbStats();
  const { Game } = await loadGame({ seed: seed, mode: 'producerparty-' + policyName, fullTelemetry: false });
  const series = [];
  const events = [];
  const verbEvents = [];
  const linkLines = [];
  const cap = createLinkCapture({ cap: 600, episodeCap: 60 });
  const seatTakes = [];
  const tableChoices = [];
  const errors = [];
  let lastDay = -1;
  let lastUnw = null;
  let lastGated = null;
  let inDaily = false;      // true while the policy's daily() runs (policy-called verbs)
  let currentVerb = null;   // outermost verb in progress (formation attribution)

  // ---- CASCADE instrumentation (sim-cascade-b Stage 1 diag) ----
  // Pure reads + one flag write on transient objects; no game behavior.
  // Session ids: incrementing counter at each combat_start tele.
  // World-monster INSTANCE ids: WeakMap over the lifted world object
  // (s.monster at combat_start, before the startCombat lift) — the
  // engine carries no instance id, so object identity IS the instance.
  // A wild killer is lifted out of the world at fight start and NOT
  // restored on 'lost' (game.js tbEnd: only titan/lingering worldOrigin
  // objects are put back), so a wild same-instance kill chain is
  // impossible by construction — the probe proves it empirically.
  // Provenance: fireCrisis('breach') / treelineAmbush /
  // reengageWaitingMonsters wraps set pendingProv, consumed by the next
  // combat_start tele. doorFledMonsters stash snapshots ride on every
  // session/death row; the re-engage wraps also capture the consumed
  // stash entries (they are removed from state before startCombat).
  const cascadeSessions = [];
  const cascadeEnds = [];
  const cascadeDeaths = [];
  const cascadeTransitions = [];
  const worldMonsterIds = new WeakMap();
  const fightSessionIds = new WeakMap();
  let worldMonsterSeq = 0;
  let sessionSeq = 0;
  let lastSessionId = null;
  let lastSessionRow = null;
  let pendingProv = null;
  let lastConsumedStash = null;
  let verbSeq = 0;
  let travelSeq = 0;
  let dailyCall = 0;
  let lastBearer = null;
  let bearerSinceDay = 0;
  function stashSnap() {
    try {
      return ((Game.state || {}).doorFledMonsters || []).map(function (m) {
        return { id: m && m.id, hp: m && m.hp, mx: m && m.mx, my: m && m.my, bearer: m && m.bearer };
      });
    } catch (e) { return 'read-err'; }
  }
  function checkBearer(day) {
    try {
      const b = Game.villagerId;
      if (lastBearer === null) { lastBearer = b; bearerSinceDay = day || 0; return; }
      if (b !== lastBearer) {
        cascadeTransitions.push({ day: day || 0, from: lastBearer, to: b });
        lastBearer = b; bearerSinceDay = day || 0;
      }
    } catch (e) {}
  }
  // ---- WAVE-5 PER-ENCOUNTER RECORDER (sim-producerparty-b) ----
  // Pure reads + driver-local arrays; no game-state writes, no RNG.
  const w5encounters = [];
  const w5gates = [];
  const w5seeds = [];
  const w5departs = [];
  const lastGateByVid = {};
  let currentW5Fight = null; // encounter row while inside a wave-4+ fieldFight
  function w5waveOf(mdef) { try { return (mdef && mdef.wave) | 0; } catch (e) { return 0; } }
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
  try {
    const origGate = Game.winPlanFightGate;
    if (typeof origGate === 'function') {
      Game.winPlanFightGate = function (vid, mdef) {
        const ret = origGate.apply(this, arguments);
        try {
          const w = w5waveOf(mdef);
          if (w >= 4 && mdef && mdef.id) {
            let party = [vid];
            try { const sensed = (typeof this.villagerFightAllies === 'function') ? (this.villagerFightAllies(vid) || []) : []; for (const s of sensed) if (party.indexOf(s) === -1) party.push(s); } catch (e) {}
            let allArmed = true, allArmored = true;
            const gear = {};
            for (const p of party) { const g = gearOfReplica(this, p); gear[p] = { armed: g.armed, armored: g.armored, armorP: g.armorP }; if (!g.armed) allArmed = false; if (!g.armored) allArmored = false; }
            const plan = planOf(vid);
            const row = { day: gday(Game), vid: vid, mid: mdef.id, wave: w,
              result: ret ? (ret.avoid ? 'avoid' : (ret.seek ? 'seek' : 'other')) : 'null',
              reason: (ret && ret.reason) || null, partySize: party.length, party: party.slice(),
              allArmed: allArmed, allArmored: allArmored, gear: gear,
              trickKnown: trickKnownOf(mdef.id),
              planStage: plan ? plan.stage : null, planTarget: plan ? plan.target : null,
              needWave: needWaveOf() };
            w5gates.push(row);
            lastGateByVid[vid] = row;
          }
        } catch (e) { errors.push('w5gate-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else errors.push('winPlanFightGate-wrap: not a function');
  } catch (e) { errors.push('winPlanFightGate-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origSeed = Game.winPlanSeedFromFight;
    if (typeof origSeed === 'function') {
      Game.winPlanSeedFromFight = function (vid, mdef, outcome) {
        const ret = origSeed.apply(this, arguments);
        try {
          const w = w5waveOf(mdef);
          if (w >= 3 && mdef && mdef.id) {
            const plan = planOf(vid);
            w5seeds.push({ day: gday(Game), vid: vid, mid: mdef.id, wave: w, outcome: outcome || null,
              stageAfter: plan ? plan.stage : null, target: plan ? plan.target : null,
              node: plan && plan.node ? { nx: plan.node.nx, ny: plan.node.ny } : null });
          }
        } catch (e) { errors.push('w5seed-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else errors.push('winPlanSeedFromFight-wrap: not a function');
  } catch (e) { errors.push('winPlanSeedFromFight-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origDepart = Game.winPlanDepart;
    if (typeof origDepart === 'function') {
      Game.winPlanDepart = function (vid, hx, hy, playerAtHaven) {
        const ret = origDepart.apply(this, arguments);
        try {
          const plan = planOf(vid);
          if (plan && (ret === 'hold' || ret === 'launch')) {
            w5departs.push({ day: gday(Game), vid: vid, result: ret, stage: plan.stage,
              target: plan.target || null, party: (plan.party || []).slice(),
              targetWave: plan.needWave || null });
          }
        } catch (e) { errors.push('w5depart-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else errors.push('winPlanDepart-wrap: not a function');
  } catch (e) { errors.push('winPlanDepart-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origFF = Game.fieldFight;
    if (typeof origFF === 'function') {
      Game.fieldFight = function (vid, mdef, m, opts) {
        const w = w5waveOf(mdef);
        const watch = w >= 4 && mdef && mdef.id;
        let row = null;
        if (watch) {
          const lg = lastGateByVid[vid] || null;
          row = { day: gday(Game), vid: vid, mid: mdef.id, wave: w,
            alliesN: (opts && opts.allies) | 0,
            allyVids: ((opts && opts.allyVids) || []).slice(0, 2),
            allyFromStart: !!(opts && opts.allyFromStart),
            gate: lg ? { result: lg.result, reason: lg.reason,
              partySize: lg.partySize, allArmed: lg.allArmed,
              allArmored: lg.allArmored, trickKnown: lg.trickKnown,
              planStage: lg.planStage, planTarget: lg.planTarget } : null,
            outcome: null, rounds: null, vTaken: null, mDealt: null,
            calledHelp: null, allyVid: null, fleeHpFrac: null,
            trickBefore: trickKnownOf(mdef.id), trickAfter: null, lines: [], log: [] };
          currentW5Fight = row;
        }
        let rec = null;
        try { rec = origFF.apply(this, arguments); }
        finally { if (watch) currentW5Fight = null; }
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
            w5encounters.push(row);
          }
        } catch (e) { errors.push('w5enc-log: ' + String(e.message).slice(0, 80)); }
        return rec;
      };
    } else errors.push('fieldFight-wrap: not a function');
  } catch (e) { errors.push('fieldFight-wrap-install: ' + String(e.message).slice(0, 80)); }

  try {
    const origFC = Game.fireCrisis;
    if (typeof origFC === 'function') {
      Game.fireCrisis = function (kind) {
        try { if (kind === 'breach') pendingProv = 'breach'; } catch (e) {}
        return origFC.apply(this, arguments);
      };
    } else errors.push('fireCrisis-wrap: not a function');
  } catch (e) { errors.push('fireCrisis-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origTA = Game.treelineAmbush;
    if (typeof origTA === 'function') {
      Game.treelineAmbush = function () {
        try { pendingProv = 'treeline'; } catch (e) {}
        const ret = origTA.apply(this, arguments);
        try { if (!ret) pendingProv = null; } catch (e) {}
        return ret;
      };
    } else errors.push('treelineAmbush-wrap: not a function');
  } catch (e) { errors.push('treelineAmbush-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origRW = Game.reengageWaitingMonsters;
    if (typeof origRW === 'function') {
      Game.reengageWaitingMonsters = function (waiting) {
        try {
          lastConsumedStash = (waiting || []).map(function (m) {
            return { id: m && m.id, hp: m && m.hp, mx: m && m.mx, my: m && m.my, bearer: m && m.bearer };
          });
          if (!pendingProv) pendingProv = 'door-reengage';
        } catch (e) {}
        return origRW.apply(this, arguments);
      };
    } else errors.push('reengageWaitingMonsters-wrap: not a function');
  } catch (e) { errors.push('reengageWaitingMonsters-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origTT = Game.travelTo;
    if (typeof origTT === 'function') {
      Game.travelTo = function () {
        try { travelSeq += 1; } catch (e) {}
        return origTT.apply(this, arguments);
      };
    } else errors.push('travelTo-wrap: not a function');
  } catch (e) { errors.push('travelTo-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origTele = Game.tele;
    Game.tele = function (type, data) {
      let r;
      try { r = origTele.apply(this, arguments); } catch (e) { throw e; }
      try {
        const st = (this.state || {});
        const s = st.scholar || {};
        const day = s.day || 0;
        checkBearer(day);
        if (type === 'combat_start') {
          sessionSeq += 1;
          const sid = sessionSeq;
          lastSessionId = sid;
          let wmInst = null, wmHp = null, wmWave = null;
          try {
            const wm = s.monster || null;
            if (wm && typeof wm === 'object') {
              if (!worldMonsterIds.has(wm)) { worldMonsterSeq += 1; worldMonsterIds.set(wm, worldMonsterSeq); }
              wmInst = worldMonsterIds.get(wm);
              wmHp = wm.hp; wmWave = wm.wave;
            }
          } catch (e) {}
          let fighters = null;
          try {
            const f = this.tbfight;
            if (f) fightSessionIds.set(f, sid);
            if (f && Array.isArray(f.fighters)) {
              fighters = f.fighters.map(function (x) {
                if (!x) return null;
                return { key: x.key || null, kind: x.kind || null,
                  name: x.name || x.monsterId || null,
                  monsterId: (x.mdef && x.mdef.id) || x.monsterId || null,
                  hp: (x.hp !== undefined ? Math.round(x.hp) : null),
                  villagerId: x.villagerId || null, alive: x.alive !== false };
              });
            }
          } catch (e) { fighters = 'read-err'; }
          const prov = pendingProv || 'wild';
          pendingProv = null;
          const row = { id: sid, day: day, bearer: this.villagerId || null,
            scholarHp: (s.health !== undefined ? Math.round(s.health) : null),
            mx: s.mx, my: s.my, mapPx: (this.map || {}).px, mapPy: (this.map || {}).py,
            insideHaven: !!s.insideHaven, insideTent: !!s.insideTent,
            vs: data && data.vs, wave: data && data.wave, pack: data && data.pack,
            php: data && data.php, maxhp: data && data.maxhp,
            provenance: prov, consumedStash: lastConsumedStash,
            worldMonsterInstance: wmInst, worldMonsterHp: wmHp, worldMonsterWave: wmWave,
            pendingEncounter: !!this.pendingEncounter,
            pendingMonsterId: this.pendingMonsterId || null,
            feastDraw: !!(s.feastDraw && s.feastDraw.monsterId),
            arenaContest: !!(st.arenaContest || st.activeContest),
            stash: stashSnap(), fighters: fighters,
            currentVerb: currentVerb, verbSeq: verbSeq, travelSeq: travelSeq,
            dailyCall: dailyCall, inDaily: inDaily };
          lastConsumedStash = null;
          cascadeSessions.push(row);
          lastSessionRow = row;
        } else if (type === 'combat_end') {
          let sid = null;
          try { if (this.tbfight) sid = fightSessionIds.get(this.tbfight) || null; } catch (e) {}
          if (sid === null) sid = lastSessionId;
          let worldOrigin = false;
          try { worldOrigin = !!(this.tbfight && this.tbfight.worldOrigin); } catch (e) {}
          cascadeEnds.push({ id: sid, day: day, bearer: this.villagerId || null,
            result: data && data.result, php: data && data.php,
            worldOrigin: worldOrigin, stash: stashSnap(),
            currentVerb: currentVerb, verbSeq: verbSeq, travelSeq: travelSeq,
            dailyCall: dailyCall, inDaily: inDaily });
        } else if (type === 'death') {
          let sid = null;
          try { if (this.tbfight) sid = fightSessionIds.get(this.tbfight) || null; } catch (e) {}
          if (sid === null) sid = lastSessionId;
          // player flag: same lazy telemetry-ring read as sim-harness
          // (registerDeath can repair it after the fire).
          let isPlayer = !!(data && data.player);
          try {
            const tel = (st.telemetry || []);
            const rec = tel.length ? tel[tel.length - 1] : null;
            if (rec && rec.type === 'death' && String(rec.who) === String(data && data.who)) isPlayer = !!rec.player;
          } catch (e) {}
          cascadeDeaths.push({ day: day, kind: data && data.kind, who: data && data.who,
            cause: data && data.cause, player: isPlayer,
            scholarAtDeath: this.villagerId || null,
            sessionId: sid, lastSessionId: lastSessionId,
            tbfightPresent: !!this.tbfight,
            tbfightOver: !!(this.tbfight && this.tbfight.over),
            daysSinceSuccession: day - bearerSinceDay,
            insideHaven: !!s.insideHaven, mx: s.mx, my: s.my,
            mapPx: (this.map || {}).px, mapPy: (this.map || {}).py,
            stash: stashSnap(),
            lastSessionProv: lastSessionRow ? lastSessionRow.provenance : null,
            lastSessionInstance: lastSessionRow ? lastSessionRow.worldMonsterInstance : null,
            lastSessionVs: lastSessionRow ? lastSessionRow.vs : null,
            currentVerb: currentVerb, verbSeq: verbSeq, travelSeq: travelSeq,
            dailyCall: dailyCall, inDaily: inDaily });
        }
      } catch (e) {}
      return r;
    };
  } catch (e) { errors.push('tele-wrap-install: ' + String(e.message).slice(0, 80)); }

  function snap(tag) {
    const sn = snapshot(Game, errors);
    if (!sn) return;
    if (sn.d === lastDay) return; // one snapshot per game day
    lastDay = sn.d;
    series.push(sn);
  }

  function linkTrust(id) {
    try {
      const hs = (typeof Game.hierarchyState === 'function') ? (Game.hierarchyState() || []) : [];
      for (const l of hs) if (l && l.id === id) return l.trust | 0;
    } catch (e) {}
    return null;
  }
  function linkOther(id) {
    try {
      const hs = (typeof Game.hierarchyState === 'function') ? (Game.hierarchyState() || []) : [];
      for (const l of hs) if (l && l.id === id) {
        return Game._linkOther ? Game._linkOther(l, 'haven') : (l.primary === 'haven' ? l.subordinate : l.primary);
      }
    } catch (e) {}
    return null;
  }

  // Wrap engine reads that fire on the game's own calls (log-on-change).
  function wrapLogChange(name, key) {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { errors.push(name + '-wrap: not a function'); return; }
      Game[name] = function () {
        const ret = orig.apply(this, arguments);
        try {
          if (key === 'unw') {
            if (ret !== lastUnw) { lastUnw = ret; events.push({ day: gday(Game), kind: 'unlockedWave', wave: ret }); }
          } else if (key === 'gated') {
            if (ret !== lastGated) { lastGated = ret; events.push({ day: gday(Game), kind: 'standingGated', total: ret }); }
          }
        } catch (e) { errors.push(name + '-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } catch (e) { errors.push(name + '-wrap-install: ' + String(e.message).slice(0, 80)); }
  }
  wrapLogChange('unlockedWave', 'unw');
  wrapLogChange('villageStandingTotal', 'gated');

  // Generic verb wrapper: logs the call, the before/after trust of the
  // named link (when the verb takes a link id first), and a short result.
  // `opts` — { linkArg: 0 } (which arg holds the link id), describe(ret)
  // returns a short result string.
  function wrapVerb(name, opts) {
    opts = opts || {};
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { errors.push(name + '-wrap: not a function'); return; }
      Game[name] = function () {
        const args = Array.prototype.slice.call(arguments);
        try { verbSeq += 1; } catch (e) {}
        let linkId = (opts.linkArg !== undefined && args[opts.linkArg] !== undefined) ? args[opts.linkArg] : null;
        // answerAccord takes no link id: the pending accord names its link.
        if (!linkId && opts.accordLink) {
          try { linkId = ((Game.state || {}).pendingAccord || {}).linkId || null; } catch (e) { linkId = null; }
        }
        const before = (typeof linkId === 'string') ? linkTrust(linkId) : null;
        const prevVerb = currentVerb;
        if (!prevVerb) currentVerb = name;
        let ret = null;
        let threw = null;
        try { ret = orig.apply(this, arguments); }
        catch (e) { threw = e; }
        if (!prevVerb) currentVerb = null;
        try {
          const after = (typeof linkId === 'string') ? linkTrust(linkId) : null;
          let result = null;
          if (opts.describe) { try { result = opts.describe(ret, args); } catch (e) { result = 'describe-err'; } }
          else if (ret && typeof ret === 'object' && ret.id) result = 'formed:' + ret.id;
          else if (typeof ret === 'string') result = ret;
          else if (ret === null || ret === undefined) result = 'null';
          else if (typeof ret === 'number') result = 'n=' + ret;
          else if (typeof ret === 'boolean') result = ret ? 'true' : 'false';
          else result = String(ret).slice(0, 120);
          verbEvents.push({
            day: gday(Game), verb: name, caller: inDaily ? 'policy' : 'engine',
            linkId: (typeof linkId === 'string') ? linkId : null,
            other: (typeof linkId === 'string') ? linkOther(linkId) : null,
            args: args.map(function (a) { return (a && typeof a === 'object') ? JSON.stringify(a).slice(0, 120) : String(a).slice(0, 80); }),
            before: before, after: after,
            dTrust: (before !== null && after !== null) ? (after - before) : null,
            result: result, threw: threw ? String(threw.message).slice(0, 80) : null,
          });
        } catch (e) { errors.push(name + '-log: ' + String(e.message).slice(0, 80)); }
        if (threw) throw threw;
        return ret;
      };
    } catch (e) { errors.push(name + '-wrap-install: ' + String(e.message).slice(0, 80)); }
  }

  wrapVerb('tendLink', { linkArg: 0 });
  wrapVerb('payTribute', { linkArg: 0 });
  wrapVerb('proposeLink', {
    describe: function (ret) {
      if (ret && typeof ret === 'object' && ret.id) return 'formed:' + ret.id;
      if (ret === 'counter') return 'counter';
      return 'declined-or-blocked';
    },
  });
  wrapVerb('answerCounter', {
    describe: function (ret) {
      if (ret && typeof ret === 'object' && ret.id) return 'formed:' + ret.id;
      if (ret === 'counter') return 'held';
      return 'refused-or-null';
    },
  });
  wrapVerb('answerAccord', { accordLink: true, describe: function (ret) { return ret === null ? 'no-pending-or-dead-link' : 'answered'; } });
  wrapNationalChoice();
  // wrapNationalChoice: like wrapVerb but ALSO records the staged shape
  // (state.pendingNational.shape, read BEFORE the call) alongside the
  // answer, so per-shape counts need no snapshot join.
  function wrapNationalChoice() {
    try {
      const orig = Game.answerNationalChoice;
      if (typeof orig !== 'function') { errors.push('answerNationalChoice-wrap: not a function'); return; }
      Game.answerNationalChoice = function (how) {
        let shape = null;
        try { shape = ((Game.state || {}).pendingNational || {}).shape || null; } catch (e) {}
        const prevVerb = currentVerb;
        if (!prevVerb) currentVerb = 'answerNationalChoice';
        let ret = null, threw = null;
        try { ret = orig.apply(this, arguments); }
        catch (e) { threw = e; }
        if (!prevVerb) currentVerb = null;
        try {
          verbEvents.push({
            day: gday(Game), verb: 'answerNationalChoice', caller: inDaily ? 'policy' : 'engine',
            linkId: null, other: null, args: [String(how)],
            before: null, after: null, dTrust: null,
            shape: shape,
            result: ret === true ? 'sat' : (ret === null ? 'died-aloud' : String(ret).slice(0, 80)),
            threw: threw ? String(threw.message).slice(0, 80) : null,
          });
        } catch (e) { errors.push('answerNationalChoice-log: ' + String(e.message).slice(0, 80)); }
        if (threw) throw threw;
        return ret;
      };
    } catch (e) { errors.push('answerNationalChoice-wrap-install: ' + String(e.message).slice(0, 80)); }
  }
  wrapVerb('answerGlobalChoice');
  wrapVerb('answerRenegotiation', { linkArg: 0 });
  wrapVerb('answerDemand', { linkArg: 0 });
  wrapVerb('proposeCovenant', {
    describe: function (ret) {
      if (ret && typeof ret === 'object' && ret.id) return 'formed:' + ret.id;
      if (ret === 'counter') return 'counter';
      return 'declined-or-blocked';
    },
  });
  wrapVerb('proposeTrade', {
    describe: function (ret) {
      if (ret && typeof ret === 'object' && ret.id) return 'formed:' + ret.id;
      if (ret === 'counter') return 'counter';
      return 'declined-or-blocked';
    },
  });
  wrapVerb('bidForPrimacy', { linkArg: 0 });
  wrapVerb('raidVillage');
  wrapVerb('hostFeast', {
    describe: function (ret) {
      try { return JSON.stringify(ret).slice(0, 160); } catch (e) { return String(ret).slice(0, 120); }
    },
  });
  wrapVerb('breakLink', {
    linkArg: 0,
    describe: function (ret, args) { return 'broke:' + String(args[1] || '?'); },
  });
  // Formations: log the forming verb's context. _formLink/_formPeerLink
  // are called BY proposeLink/answerCounter/ladder-reward, so `via` reads
  // the outermost wrapper in progress, else 'engine-direct'.
  function wrapForm(name) {
    try {
      const orig = Game[name];
      if (typeof orig !== 'function') { errors.push(name + '-wrap: not a function'); return; }
      Game[name] = function () {
        const args = Array.prototype.slice.call(arguments);
        let ret = null;
        let threw = null;
        try { ret = orig.apply(this, arguments); }
        catch (e) { threw = e; }
        try {
          if (ret && ret.id) {
            verbEvents.push({
              day: gday(Game), verb: name, caller: inDaily ? 'policy' : 'engine',
              linkId: ret.id, other: linkOther(ret.id),
              args: args.map(function (a) { return (a && typeof a === 'object') ? JSON.stringify(a).slice(0, 120) : String(a).slice(0, 80); }),
              before: null, after: ret.trust | 0, dTrust: null,
              result: 'formed via ' + (currentVerb || 'engine-direct'),
              threw: threw ? String(threw.message).slice(0, 80) : null,
            });
          }
        } catch (e) { errors.push(name + '-log: ' + String(e.message).slice(0, 80)); }
        if (threw) throw threw;
        return ret;
      };
    } catch (e) { errors.push(name + '-wrap-install: ' + String(e.message).slice(0, 80)); }
  }
  wrapForm('_formLink');
  wrapForm('_formPeerLink');

  try {
    const origSeat = Game.tableTakeSeat;
    if (typeof origSeat === 'function') {
      Game.tableTakeSeat = function () {
        let pv = null;
        try { pv = Game.tablePreview ? Game.tablePreview() : null; } catch (e) {}
        let ret = null;
        try { ret = origSeat.apply(this, arguments); } catch (e) { throw e; }
        try {
          seatTakes.push({ day: gday(Game), seat: (pv && pv.seat) || null, ready: !!(pv && pv.ready), ok: !!(ret && ret.ok), ret: ret ? String(JSON.stringify(ret)).slice(0, 200) : null });
          events.push({ day: gday(Game), kind: 'seatTaken', seat: (pv && pv.seat) || null, ok: !!(ret && ret.ok) });
        } catch (e) { errors.push('seat-take-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else errors.push('tableTakeSeat-wrap: not a function');
  } catch (e) { errors.push('tableTakeSeat-wrap-install: ' + String(e.message).slice(0, 80)); }

  try {
    const origChoice = Game.chooseTableOption;
    if (typeof origChoice === 'function') {
      Game.chooseTableOption = function (id) {
        let ret = null;
        try { ret = origChoice.apply(this, arguments); } catch (e) { throw e; }
        try { tableChoices.push({ day: gday(Game), id: String(id), ret: ret }); } catch (e) { errors.push('table-choice-log: ' + String(e.message).slice(0, 80)); }
        return ret;
      };
    } else errors.push('chooseTableOption-wrap: not a function');
  } catch (e) { errors.push('chooseTableOption-wrap-install: ' + String(e.message).slice(0, 80)); }

  try {
    const origSay = Game.say;
    Game.say = function () {
      try {
        const arg = arguments.length ? arguments[0] : null;
        if (typeof arg === 'string') cap.push(gday(Game), String(arg));
        // PRODUCERPARTY RECORDER: lines said during a wave-4+ field
        // fight belong to that encounter (e.g. COUNTER LEARNED beats).
        if (typeof arg === 'string' && currentW5Fight && currentW5Fight.lines.length < 20) {
          currentW5Fight.lines.push(String(arg).slice(0, 400));
        }
        if (typeof arg === 'string' && LINK_LINE_RE.test(String(arg)) && !MEAL_LINE_RE.test(String(arg)) && linkLines.length < 600) {
          linkLines.push({ day: gday(Game), line: String(arg).slice(0, 400) });
        }
      } catch (e) { errors.push('say-wrap: ' + String(e.message).slice(0, 80)); }
      return origSay.apply(this, arguments);
    };
  } catch (e) { errors.push('say-wrap-install: ' + String(e.message).slice(0, 80)); }

  // Policy wrapper: snapshot after each daily() call (one per game day).
  // Capture the harness ctx the policy closes over — runDays does not
  // return it, but the same object is passed to every policy hook, so the
  // end-of-run capableSummary / counter dump reads live policy counters.
  let capturedCtx = null;
  const recPolicy = Object.assign({}, policy, {
    daily: function (G, ctx) {
      capturedCtx = ctx;
      inDaily = true;
      try { dailyCall += 1; verbSeq = 0; travelSeq = 0; } catch (e) {}
      let r;
      try { r = policy.daily ? policy.daily(G, ctx) : undefined; }
      catch (e) { inDaily = false; errors.push('policy.daily threw: ' + String(e.message).slice(0, 80)); throw e; }
      inDaily = false;
      try { snap('daily'); } catch (e) { errors.push('snap-after-daily: ' + String(e.message).slice(0, 80)); }
      return r;
    },
  });

  await setupGame(Game);
  let result = null;
  await quietLog(async function () {
    result = await runDays(Game, recPolicy, { days: DAYS, manifest: undefined, sampleEvery: 1 });
  });
  let capSummary = null, ctxCounters = null;
  try {
    if (policyName === 'competent-answercourt-b' && capturedCtx) capSummary = Object.assign(scaleclimbStats(), { answercourt: answercourtStats() });
    else if (policyName === 'competent-scaleclimb-b' && capturedCtx) capSummary = scaleclimbStats();
  } catch (e) { errors.push('capSummary: ' + String(e.message).slice(0, 80)); }
  try {
    if (capturedCtx) {
      ctxCounters = {};
      for (const k of Object.keys(capturedCtx)) {
        if (k === 'notes' || k === 'policyId' || k[0] === '_') continue;
        const v = capturedCtx[k];
        if (typeof v === 'number') ctxCounters[k] = v;
        else if (v && typeof v === 'object' && !Array.isArray(v)) {
          const flat = {};
          for (const kk of Object.keys(v)) if (typeof v[kk] === 'number') flat[kk] = v[kk];
          if (Object.keys(flat).length) ctxCounters[k] = flat;
        }
      }
    }
  } catch (e) { errors.push('ctxCounters: ' + String(e.message).slice(0, 80)); }
  try { snap('final'); } catch (e) {}

  const st = Game.state || {};
  let scaleRank = null, standingGated = null, standingRaw = null;
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { standingGated = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) { errors.push('standingGated: ' + String(e.message).slice(0, 80)); }
  try { standingRaw = Game.villageStanding ? (Game.villageStanding() || {}).total : null; } catch (e) {}
  let tableState = null, earnedPaths = null;
  try { tableState = Game.tableState ? Game.tableState() : null; } catch (e) {}
  try { earnedPaths = Game.tableEarnedPaths ? Game.tableEarnedPaths() : null; } catch (e) {}
  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });
  const villagerCombatDeaths = deaths.filter(function (d) { return !d.player; }).length;
  let driveEnd = null;
  try { driveEnd = st.answermailDrive ? JSON.parse(JSON.stringify(st.answermailDrive)) : null; } catch (e) {}

  return {
    seed: seed, policy: policyName, arm: 'producerparty-b', run: RUN,
    anchorCommit: ANCHOR,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, standing: standingGated,
    standingRaw: standingRaw,
    waveKills: Object.assign({}, st.waveKills || {}),
    series: series, events: events, verbEvents: verbEvents,
    linkLines: linkLines,
    dissolutionLines: cap.episodeLines,
    seatTakes: seatTakes, tableChoices: tableChoices,
    tableState: tableState ? {
      path: tableState.path || null, branch: tableState.branch || null,
      phase: tableState.phase || null, final: tableState.final || null,
      seat: (tableState.seatTaker && tableState.seatTaker.name) || null,
      seatSelf: !!(tableState.seatTaker && tableState.seatTaker.self),
    } : null,
    earnedPaths: (earnedPaths || []).map(function (p) {
      return { id: p.id, name: p.name, earned: !!p.earned, strength: p.strength | 0 };
    }),
    deaths: deaths, villagerCombatDeaths: villagerCombatDeaths,
    cascade: { sessions: cascadeSessions, ends: cascadeEnds, deaths: cascadeDeaths, transitions: cascadeTransitions },
    // PRODUCERPARTY RECORDER output (per-encounter instrument).
    w5encounters: w5encounters, w5gates: w5gates, w5seeds: w5seeds, w5departs: w5departs,
    w5ids: loadWave5Ids(),
    wpEnd: (function () {
      try {
        const vv = (st.village || {});
        const wps = vv.winPlanStats || null;
        const plans = vv.winPlan || null;
        const byStage = {};
        let w5Targets = 0, plansN = 0;
        if (plans) {
          for (const k in plans) {
            if (!Object.prototype.hasOwnProperty.call(plans, k)) continue;
            plansN += 1;
            const pl = plans[k] || {};
            byStage[pl.stage || '?'] = (byStage[pl.stage || '?'] || 0) + 1;
            if (pl.target && W5_SET.has(pl.target)) w5Targets += 1;
          }
        }
        return wps ? Object.assign({}, wps, { plansN: plansN, byStage: byStage, w5Targets: w5Targets })
          : { plansN: plansN, byStage: byStage, w5Targets: w5Targets };
      } catch (e) { return null; }
    })(),
    capSummary: capSummary, ctxCounters: ctxCounters,
    driveEnd: driveEnd,
    instrumentErrors: errors,
    samples: result.samples || null,
  };
}

if (require.main === module) (async function () {
  if (!SEEDS.length) { console.error('PRODUCERPARTY STOP: SEEDS required.'); process.exit(2); }
  if (!POLICIES.length) { console.error('PRODUCERPARTY STOP: POLICY required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-15', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) for (const pol of POLICIES) {
    const file = path.join(outDir, 'producerparty-b-s' + seed + '-' + pol + '-' + RUN + '.json');
    if (fs.existsSync(file)) { console.error('PRODUCERPARTY STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) for (const pol of POLICIES) {
    const out = await oneRun(seed, pol);
    const file = path.join(outDir, 'producerparty-b-s' + seed + '-' + pol + '-' + RUN + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, policy: out.policy, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      waveKills: out.waveKills, seriesDays: out.series.length,
      verbEvents: out.verbEvents.length, linkLines: out.linkLines.length,
      seatTakes: out.seatTakes.length, tableChoices: out.tableChoices.length,
      tableState: out.tableState, deaths: out.deaths.length,
      cascadeSessions: (out.cascade && out.cascade.sessions || []).length,
      cascadeDeaths: (out.cascade && out.cascade.deaths || []).length,
      w5encounters: (out.w5encounters || []).length,
      w5gates: (out.w5gates || []).length,
      w5seeds: (out.w5seeds || []).length,
      w5departs: (out.w5departs || []).length,
      villagerCombatDeaths: out.villagerCombatDeaths, errors: out.instrumentErrors.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun };
