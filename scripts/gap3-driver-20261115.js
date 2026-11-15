// gap3-driver-20261115.js — DIAG driver for sim-gap3-b (gap-3+ established-
// bearer `the wild` scholar deaths). Copy of
// scripts/successorcaution-driver-20261115.js (itself a copy of the FIXED
// funeralmend driver), with ADDED pure-read probe instrumentation:
//   - Game.tele wrapper (combat_start rows with fighters/HP/location +
//     live fightAssessRace verdict from codex/lore knowledge only;
//     death rows with last-fight context + bearer kills from live
//     agency.stats; succession log from Game.villagerId changes),
//   - Game.travelTo wrapper (destination vs non-destination fight
//     classification; parting-turn aborts),
//   - Game.tbBarrierExit counter.
// All added reads are pure (no Math.random, no state creation, no Game
// method that mutates); the judged fields (series/deaths/capSummary)
// must reproduce the successorcaution control leg exactly (Stage 0).
// RUN/OUTDIR defaults renamed; per-seed filename prefix gap3-b-s;
// evidence date dir 2026-11-15. The successorcaution policy dispatch is
// retained (unused on the control leg) so the file stays a strict
// superset of its parent.
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { createLinkCapture } = require('./linklines-capture');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { scaleclimbPolicy, scaleclimbStats, resetScaleclimbStats } = require(path.join(REPO, 'scripts', 'policies', 'competent-scaleclimb-b'));
const { answercourtPolicy, answercourtStats, resetAnswercourtStats } = require(path.join(REPO, 'scripts', 'policies', 'competent-answercourt-b'));
const { successorcautionPolicy, successorcautionStats, resetSuccessorcautionStats } = require(path.join(REPO, 'scripts', 'policies', 'competent-successorcaution-b'));
const { fightAssessRace, fightAssessDPR } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const POLICIES = (process.env.POLICY ? process.env.POLICY.split(',').map(function (s) { return s.trim(); }) : ['competent-scaleclimb-b', 'competent-answercourt-b', 'competent-successorcaution-b']).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'gap3-b';
const OUTDIR = process.env.OUTDIR || 'perseed-gap3-b-control';

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
      // GAP3 v4: day-granularity Haven occupancy — which monster (if any)
      // is on the Haven tile (4,4) at snapshot time. Pure read; with the
      // travel log it pins WHEN a killer arrived on Haven (restored
      // during an arrival travel vs already there vs mid-stay).
      havenMon: (function () { try { const m = Game.monsterAt && Game.monsterAt(4, 4); return m ? (m.id || m.monsterId || null) : null; } catch (e) { return null; } })(),
      // GAP3 v5: lingering raiders (raid-born, still on the treeline) at
      // snapshot time — the exact set a later field fight can draw from.
      // Pure read over worldMonsters; monsterAt sees only the FIRST of a
      // stacked tile, so this list (not havenMon) is the lingerer truth.
      lingerers: (function () { try { return (Game.worldMonsters ? Game.worldMonsters() : []).filter(function (m) { return m && m.lingering && (m.hp || 0) > 0; }).map(function (m) { return m.id || null; }); } catch (e) { return []; } })(),
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
  const policy = policyName === 'competent-successorcaution-b' ? successorcautionPolicy : (policyName === 'competent-answercourt-b' ? answercourtPolicy : scaleclimbPolicy);
  if (policyName !== 'competent-scaleclimb-b' && policyName !== 'competent-answercourt-b' && policyName !== 'competent-successorcaution-b') throw new Error('Unknown policy ' + policyName);
  if (policyName === 'competent-successorcaution-b') { resetSuccessorcautionStats(); resetAnswercourtStats(); resetScaleclimbStats(); }
  else if (policyName === 'competent-answercourt-b') { resetAnswercourtStats(); resetScaleclimbStats(); }
  else resetScaleclimbStats();
  const { Game } = await loadGame({ seed: seed, mode: 'gap3-' + policyName, fullTelemetry: false });
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

  // ---- GAP3 DIAG INSTRUMENTATION (pure reads only) ----
  // combat_start rows with fighters/HP/location + the policy's own
  // damage-race verdict from codex/lore knowledge; death rows with
  // last-fight context + bearer kills from live agency.stats;
  // succession log from Game.villagerId changes; travelTo log for
  // destination vs non-destination classification; tbBarrierExit count.
  const diagFights = [], diagDeaths = [], diagSuccessions = [], diagTravels = [], diagRaids = [];
  let diagLastVid = null, diagLastFight = null, diagLastTravel = null;
  let diagFightSeq = 0, diagTravelSeq = 0, diagBarrierExits = 0;
  const diagBarrierExitResults = {};
  function diagKillsOf(vid) {
    try {
      const st = (((Game.state || {}).village || {}).agency || {}).stats || {};
      const s = st[vid];
      return s ? (s.monsterKills | 0) : null;
    } catch (e) { return null; }
  }
  function diagAbilitiesOf(vid) {
    try {
      const a = (((Game.state || {}).village || {}).npcAbilities || {})[vid];
      return Array.isArray(a) ? a.length : null;
    } catch (e) { return null; }
  }
  function diagMonsterKnow(ctx, m) {
    let mid = null;
    try { mid = m.monsterId || (m.mdef && m.mdef.id) || m.id || null; } catch (e) {}
    let stage = null, codexKnown = false, counterKnown = false, dpr = null;
    try {
      const e = (((Game.state || {}).codex || {}).monsters || {})[mid];
      stage = e ? (e.stage || null) : null;
      codexKnown = !!(e && (e.stage || (e.patterns && Object.keys(e.patterns).length)));
      counterKnown = !!(((Game.state || {}).monsterCounters || {})[mid]) || stage === 'slain';
      if (ctx) dpr = fightAssessDPR(Game, ctx, mid);
    } catch (e) {}
    return { mid: mid, hp: (m.hp !== undefined ? Math.round(m.hp) : null),
      maxHp: (m.maxHp !== undefined ? Math.round(m.maxHp) : null),
      stance: m.stance || null,
      codexStage: stage, codexKnown: codexKnown, counterKnown: counterKnown, dpr: dpr };
  }
  try {
    const origTele = Game.tele;
    Game.tele = function (type, data) {
      let r;
      try { r = origTele.apply(this, arguments); } catch (e) { throw e; }
      try {
        const st = (this.state || {});
        const s = st.scholar || {};
        const day = s.day || 0;
        // Succession detection (policy-visible state): villagerId change.
        try {
          const vid = Game.villagerId;
          if (diagLastVid === null) diagLastVid = vid;
          else if (vid !== diagLastVid) {
            diagSuccessions.push({ day: day, prevVid: diagLastVid, newVid: vid,
              newBearerKills: diagKillsOf(vid), newBearerAbilities: diagAbilitiesOf(vid) });
            diagLastVid = vid;
          }
        } catch (e) {}
        if (type === 'combat_start') {
          let fighters = null;
          try {
            const f = this.tbfight;
            if (f && Array.isArray(f.fighters)) {
              fighters = f.fighters.map(function (x) {
                if (!x) return null;
                return { key: x.key || null, kind: x.kind || null,
                  name: x.name || x.monsterId || null,
                  monsterId: (x.mdef && x.mdef.id) || x.monsterId || null,
                  hp: (x.hp !== undefined ? Math.round(x.hp) : null),
                  maxHp: (x.maxHp !== undefined ? Math.round(x.maxHp) : null),
                  stance: x.stance || null,
                  villagerId: x.villagerId || null, alive: x.alive !== false };
              });
            }
          } catch (e) { fighters = 'read-err'; }
          // Tile the fight is on (map coords) + what the tile is.
          let tileType = null, tileRevealed = null, tileStock = null;
          try {
            const t = Game.tileAt && Game.tileAt(Game.map.px, Game.map.py);
            if (t) { tileType = t.type || null; tileRevealed = !!t.revealed; tileStock = (t.stock !== undefined ? t.stock : null); }
          } catch (e) {}
          // The policy's own damage-race verdict, live, from codex/lore
          // knowledge only (capturedCtx is the policy ctx from daily()).
          let race = null, raceErr = null, monsters = null;
          try {
            const ctx = (typeof capturedCtx !== 'undefined') ? capturedCtx : null;
            const f = this.tbfight;
            if (ctx && f && Array.isArray(f.fighters)) {
              const mons = f.fighters.filter(function (x) { return x && x.kind === 'monster' && (x.hp || 0) > 0 && !x.fled; });
              monsters = mons.map(function (m) { return diagMonsterKnow(ctx, m); });
              race = fightAssessRace(Game, ctx, mons, { hp: s.health || s.hp || 100 });
            } else if (!ctx) raceErr = 'no-ctx';
            else raceErr = 'no-fighters';
          } catch (e) { raceErr = String(e.message).slice(0, 80); }
          diagFightSeq += 1;
          const row = { day: day, seq: diagFightSeq, scholar: Game.villagerId || null,
            scholarHp: (s.health !== undefined ? Math.round(s.health) : null),
            mx: s.mx, my: s.my, px: (Game.map || {}).px, py: (Game.map || {}).py,
            tileType: tileType, tileRevealed: tileRevealed, tileStock: tileStock,
            insideHaven: !!s.insideHaven,
            vs: data && data.vs, wave: data && data.wave, pack: data && data.pack,
            php: data && data.php, maxhp: data && data.maxhp,
            fighters: fighters, monsters: monsters, race: race, raceErr: raceErr,
            lastTravel: diagLastTravel ? { seq: diagLastTravel.seq, fromX: diagLastTravel.fromX,
              fromY: diagLastTravel.fromY, toX: diagLastTravel.toX, toY: diagLastTravel.toY,
              monAtDestBefore: diagLastTravel.monAtDestBefore,
              monAtFromBefore: diagLastTravel.monAtFromBefore,
              monAtDestAfter: diagLastTravel.monAtDestAfter,
              retKind: diagLastTravel.retKind, arrived: diagLastTravel.arrived } : null };
          diagFights.push(row);
          diagLastFight = row;
        } else if (type === 'death') {
          diagDeaths.push({ day: day, kind: data && data.kind, who: data && data.who,
            cause: data && data.cause, player: !!(data && data.player),
            villagerIdAtTele: Game.villagerId || null,
            bearerKills: diagKillsOf(data && data.who),
            bearerAbilities: diagAbilitiesOf(data && data.who),
            lastFight: diagLastFight ? { seq: diagLastFight.seq, day: diagLastFight.day,
              vs: diagLastFight.vs, wave: diagLastFight.wave, pack: diagLastFight.pack,
              php: diagLastFight.php,
              nFighters: Array.isArray(diagLastFight.fighters) ? diagLastFight.fighters.length : null,
              nAllies: Array.isArray(diagLastFight.fighters) ? diagLastFight.fighters.filter(function (x) { return x && (x.kind === 'villager' || x.kind === 'ally'); }).length : null,
              monsterKeys: Array.isArray(diagLastFight.fighters) ? diagLastFight.fighters.filter(function (x) { return x && x.kind === 'monster'; }).map(function (x) { return x.monsterId || x.name; }) : null,
              insideHaven: diagLastFight.insideHaven, px: diagLastFight.px, py: diagLastFight.py,
              mx: diagLastFight.mx, my: diagLastFight.my,
              lastTravel: diagLastFight.lastTravel } : null });
        }
      } catch (e) {}
      return r;
    };
  } catch (e) { errors.push('diag-tele-wrap-install: ' + String(e.message).slice(0, 80)); }
  // GAP3 v5: raid-draft log. havenRaidTick drafts the NEAREST living world
  // monsters and TELEPORTS them onto Haven's tile (hx,hy) — the only
  // designed path that puts wave-4/5 monsters on a safe tile — then
  // unmet raiders LINGER there (~6 nights). Pure reads after the original
  // call: lastRaidDay before/after detects a firing; the post-call stack
  // on (hx,hy) is the drafted set. No RNG, no mutation.
  try {
    const origRaid = Game.havenRaidTick;
    if (typeof origRaid === 'function') {
      Game.havenRaidTick = function () {
        let beforeDay = null, hx = 4, hy = 4;
        try { beforeDay = ((this.state || {}).village || {}).lastRaidDay || 0; } catch (e) {}
        try { const v = (this.state || {}).village || {}; if (v.px != null) hx = v.px; if (v.py != null) hy = v.py; } catch (e) {}
        let ret = null;
        try { ret = origRaid.apply(this, arguments); } catch (e) { throw e; }
        try {
          const v = (this.state || {}).village || {};
          const fired = (v.lastRaidDay || 0) !== beforeDay;
          if (fired) {
            let stack = [];
            try { stack = (this.worldMonsters ? this.worldMonsters() : []).filter(function (m) { return m && m.tx === hx && m.ty === hy; }).map(function (m) { return m.id || null; }); } catch (e) {}
            diagRaids.push({ day: gday(Game), raiderIds: stack, hx: hx, hy: hy });
          }
        } catch (e) {}
        return ret;
      };
    }
  } catch (e) { errors.push('diag-raid-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origTT = Game.travelTo;
    if (typeof origTT === 'function') {
      Game.travelTo = function (x, y, force, combatExit) {
        const day = gday(Game);
        let fromX = null, fromY = null;
        try { fromX = (Game.map || {}).px; fromY = (Game.map || {}).py; } catch (e) {}
        let ret = null, threw = null;
        // GAP3: was a monster already on the destination / departure tile?
        // Pure reads (monsterAt is a find over worldMonsters) — distinguishes
        // a monster WAITING on Haven from one that arrives with/after the
        // scholar (follower / chase). Recorded BEFORE the call.
        let monAtDestBefore = null, monAtFromBefore = null;
        try { const m0 = Game.monsterAt && Game.monsterAt(x, y); monAtDestBefore = m0 ? (m0.id || m0.monsterId || null) : null; } catch (e) {}
        try { const m1 = Game.monsterAt && Game.monsterAt(fromX, fromY); monAtFromBefore = m1 ? (m1.id || m1.monsterId || null) : null; } catch (e) {}
        try { ret = origTT.apply(this, arguments); }
        catch (e) { threw = e; }
        // GAP3 v4: was a monster on the destination AFTER the call?
        // monAtDestBefore=null + monAtDestAfter=killer proves the killer
        // arrived DURING this travel (fled-monster recovery is the only
        // in-travelTo placement onto a tile — followers stop at safe
        // tiles, spawns roll only on non-safe entry).
        let monAtDestAfter = null;
        try { const m2 = Game.monsterAt && Game.monsterAt(x, y); monAtDestAfter = m2 ? (m2.id || m2.monsterId || null) : null; } catch (e) {}
        try {
          let retKind = 'null', blockType = null, arrived = false;
          if (ret && typeof ret === 'object' && ret.blockType) { retKind = 'block'; blockType = ret.blockType; }
          else if (ret && typeof ret === 'object') retKind = 'object';
          else if (ret === null || ret === undefined) retKind = 'null';
          else retKind = 'other';
          try { arrived = (Game.map.px === x && Game.map.py === y); } catch (e) {}
          diagTravelSeq += 1;
          const row = { day: day, seq: diagTravelSeq, inDaily: inDaily,
            fromX: fromX, fromY: fromY, toX: x, toY: y,
            monAtDestBefore: monAtDestBefore, monAtFromBefore: monAtFromBefore,
            monAtDestAfter: monAtDestAfter,
            retKind: retKind, blockType: blockType, arrived: arrived,
            tbfight: !!Game.tbfight,
            threw: threw ? String(threw.message).slice(0, 80) : null };
          diagTravels.push(row);
          diagLastTravel = row;
        } catch (e) { errors.push('travelTo-log: ' + String(e.message).slice(0, 80)); }
        if (threw) throw threw;
        return ret;
      };
    } else errors.push('travelTo-wrap: not a function');
  } catch (e) { errors.push('travelTo-wrap-install: ' + String(e.message).slice(0, 80)); }
  try {
    const origBE = Game.tbBarrierExit;
    if (typeof origBE === 'function') {
      Game.tbBarrierExit = function () {
        diagBarrierExits += 1;
        const ret = origBE.apply(this, arguments);
        const k = String(ret);
        diagBarrierExitResults[k] = (diagBarrierExitResults[k] || 0) + 1;
        return ret;
      };
    }
  } catch (e) {}

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
    if (policyName === 'competent-successorcaution-b' && capturedCtx) capSummary = Object.assign(scaleclimbStats(), { answercourt: answercourtStats(), successorcaution: successorcautionStats() });
    else if (policyName === 'competent-answercourt-b' && capturedCtx) capSummary = Object.assign(scaleclimbStats(), { answercourt: answercourtStats() });
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
    seed: seed, policy: policyName, arm: 'gap3-b', run: RUN,
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
    diag: { fights: diagFights, deaths: diagDeaths, successions: diagSuccessions,
      travels: diagTravels, raids: diagRaids, barrierExits: diagBarrierExits,
      barrierExitResults: diagBarrierExitResults },
    capSummary: capSummary, ctxCounters: ctxCounters,
    driveEnd: driveEnd,
    instrumentErrors: errors,
    samples: result.samples || null,
  };
}

if (require.main === module) (async function () {
  if (!SEEDS.length) { console.error('GAP3 STOP: SEEDS required.'); process.exit(2); }
  if (!POLICIES.length) { console.error('GAP3 STOP: POLICY required.'); process.exit(2); }
  const outDir = path.join(REPO, 'evidence', '2026-11-15', OUTDIR);
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) for (const pol of POLICIES) {
    const file = path.join(outDir, 'gap3-b-s' + seed + '-' + pol + '-' + RUN + '.json');
    if (fs.existsSync(file)) { console.error('GAP3 STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) for (const pol of POLICIES) {
    const out = await oneRun(seed, pol);
    const file = path.join(outDir, 'gap3-b-s' + seed + '-' + pol + '-' + RUN + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    console.log(JSON.stringify({
      seed: out.seed, policy: out.policy, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      waveKills: out.waveKills, seriesDays: out.series.length,
      verbEvents: out.verbEvents.length, linkLines: out.linkLines.length,
      seatTakes: out.seatTakes.length, tableChoices: out.tableChoices.length,
      tableState: out.tableState, deaths: out.deaths.length,
      villagerCombatDeaths: out.villagerCombatDeaths, errors: out.instrumentErrors.length,
      diagFights: out.diag.fights.length, diagDeaths: out.diag.deaths.length,
      diagSuccessions: out.diag.successions.length, diagTravels: out.diag.travels.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { oneRun: oneRun };
