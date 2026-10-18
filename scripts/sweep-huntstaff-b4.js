#!/usr/bin/env node
// scripts/sim-huntstaff-b4.js — PILOT sweep for the DEFENSE-AWARE REVIVAL
// of the hunt-duty staffing layer (arm sim-huntstaff-b4).
//
// PRE-REGISTRATION (binding; evidence/2026-10-18/sim-huntstaff-b4.md):
//   PRIMARY (mechanism): armed >= 48 hunt-duty assignments across the sweep
//     AND >= 4 of 8 seeds engage (>=1 assignment each), vs control == 0.
//   STARVATION GUARDRAIL (revised — per-pair, collapse-aware): per
//     seed×policy pair, armed villager starvation (kind person/villager
//     only, cause starvation, non-player, deduped on (who,day,cause),
//     day < that run's villageLostDay) <= control + 1; pooled bound
//     armed <= control + 3; any village-lost pair is judged on the
//     hunter-fate + food-added lens, not the count.
//   HUNTER-ONLY GATING: the layer assigns ONLY hunter-substrate villagers
//     (word-list match); proof fixture pins it.
//   DEFENSE GUARDRAIL: window-attribution instrument
//     (scripts/analyze-huntdefense-b3.js) on VILLAGER deaths only
//     (tele kind person/villager; monsters excluded), deduped on
//     (who,day,cause): attributed share of any armed−control
//     villager-death delta < 50% AND no combat-capable villager death on a
//     hunt-exposed day (d or d+1) in excess of control.
//   SURVIVAL GUARDRAIL: |mean paired survival Δ| <= 20d (noise-scaled).
//   WALL: national/table/wins/wave4-5/median survival (report-only).
//   A miss is NO-GO, never re-scored mid-run.
//
// DEATH INSTRUMENT (findings #517/#525): every tele('death') record
// captures `kind`; villager counts filter kind person/villager only
// (monsters pollute the stream); counts dedup on (who,day,cause).
// FINDING #528: the assignTask wrap is blind to the engine's TASK-LEAD
// hunt duties (contender challenge → taskLeads.hunt → synthetic duty
// resolution, game.js 6098/6136). The daily wrap snapshots v.taskLeads
// per day so engine hunt duties are measurable alongside the layer's.
//
// b4 vs b3: FRESH seeds 8450-8612 (zero seed-usage matches in evidence/);
// starvation gate revised per the b3 metric review; survival gate kept.
//
// INSTRUMENT FIX vs b2 (the discovery that motivates this revival):
//   tele('death') fires for kind 'monster' too (villager field-fight kills:
//   registerDeath({kind:'monster', cause:'villager combat'})). The b2 sweep
//   never captured kind, so villager-KILLED MONSTERS counted as villager
//   deaths (615 vs 564, +51; person-only deduped: 82 vs 74, +8). This sweep
//   captures `kind` on every death record.
//
// REVIVAL-SPEC ADDITIONS (evidence/2026-10-18/sim-huntdefense-b.md):
//   item 1: per-seed wild-encounter telemetry (day/tile/participants/
//     outcome) — read-only wrap of resolveWildMonsterEncounter: zero RNG
//     draws, zero state writes, applied identically to all arms.
//   item 4: lean-day wild-encounter monster-kill rate with/without
//     assignment (the item-4 question reframed per the kind discovery —
//     there is no person-death cause 'villager combat' in the b2 corpus).
//   item 2/3: dedup on (who,day,cause); window-attribution as the guardrail.
//
// SEEDS: 8450, 8473, 8496, 8518, 8541, 8566, 8589, 8612 — verified zero
//   seed-usage matches in evidence/ (fresh vs 7801-7808 (b), 7811-7818
//   (b2), 8092-8341 (b3)).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sim-huntstaff-b4.js
// Targeted: SEEDS="8092" POLICIES="leadfeast" ARMS="armed" DAYS=60 VERBOSE=1
//   OUT=<dir> node scripts/sim-huntstaff-b4.js
'use strict';
const fs = require('fs');
const path = require('path');

let HS;
try {
  HS = require('./policies/huntstaff');
} catch (e) {
  console.log('INFO-SKIP: scripts/policies/huntstaff.js absent — layer not rebuilt. Sweep not run.');
  process.exit(0);
}
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [8450, 8473, 8496, 8518, 8541, 8566, 8589, 8612]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const ARMS = (process.env.ARMS ? process.env.ARMS.split(',').map(s => s.trim()) : ['control', 'armed']);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const OUT = process.env.OUT || path.join(__dirname, '..', 'evidence', '2026-10-18', 'perseed-huntstaff-b4');
const VERBOSE = process.env.VERBOSE === '1';
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
const RUN_ID = 'fleshout-b-20261018T0830Z';

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);

const STARV_RE = /starv/i;
function deathClass(cause) {
  const c = String(cause == null ? '' : cause);
  if (STARV_RE.test(c)) return 'STARVATION';
  return 'OTHER';
}

// Hunter-substrate check for the FATE instrument: occupation word-list only
// (the eligibility gates HP/trust/free are point-in-time; a dead hunter is
// classified by background). Mirrors HS.isHunterSubstrate's word list.
function hunterOccOf(Game, who) {
  try {
    const p = Game.getPerson ? Game.getPerson(who) : null;
    const occ = String((p && p.formerOccupation) || '').toLowerCase();
    const match = HS.HUNTER_WORDS.some(w => occ.includes(w));
    return { occ: (p && p.formerOccupation) || '', name: (p && p.name) || who, match };
  } catch (e) { return { occ: '', name: who, match: false }; }
}

async function oneRun(seed, policyId, arm) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const policy = arm === 'armed' ? HS.withHuntStaff(base, policyId + '+huntstaff', 'sweep') : base;
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const t = {
    deaths: [], errors: 0,
    huntAssignAttempts: 0, huntResolves: 0, huntKcal: 0, huntKills: 0,
    encounters: [],   // revival-spec item 1: wild-encounter telemetry
    leanDays: [],      // per-day {day, lean} — revival-spec item 4 substrate
    taskLeadsDays: [], // finding #528: per-day v.taskLeads snapshot (engine hunt duties bypass the assignTask wrap)
    villageLostDay: null, // b4 starvation gate: first day Game.villageLost true
  };
  // read-only instrument wraps (no RNG draws, no state writes)
  try {
    const oAssign = Game.assignTask.bind(Game);
    Game.assignTask = function (vid, task, opts) {
      try { if (task === 'hunt') t.huntAssignAttempts++; } catch (e) { t.errors++; }
      return oAssign.apply(this, arguments);
    };
    const oHunt = Game.villagerHuntResolve.bind(Game);
    Game.villagerHuntResolve = function (vid, eff) {
      const r = oHunt.apply(this, arguments);
      try {
        t.huntResolves++;
        t.huntKcal += (r && typeof r.kcal === 'number') ? r.kcal : 0;
        if (r && r.kcal > 0) t.huntKills++;
      } catch (e) { t.errors++; }
      return r;
    };
    // ITEM 1: wild-encounter telemetry. Read-only (no RNG draws, no state
    // writes): resolveWildMonsterEncounter records the encounter fact
    // (day/tile/monster/participant); fieldFight records outcome + allies,
    // but ONLY when called from inside a wild encounter (re-entrancy flag —
    // fieldFight is also used by contests, patrols, corruption, so a bare
    // wrap would pollute the lens). resolveWildMonsterEncounter does not
    // return rec, hence the paired wrap.
    const oEnc = Game.resolveWildMonsterEncounter.bind(Game);
    Game.resolveWildMonsterEncounter = function (vid, m, opts) {
      let day = 0, tx = null, ty = null, mid = null;
      try { day = gday(Game); tx = num(m && m.tx); ty = num(m && m.ty); mid = m && m.id; } catch (e) {}
      t.inWildEncounter = true;
      let r;
      try { r = oEnc.apply(this, arguments); }
      finally { t.inWildEncounter = false; }
      try {
        t.encounters.push({ day, tx, ty, monster: mid, vid, via: 'wild' });
      } catch (e) { t.errors++; }
      return r;
    };
    try {
      const oFF = Game.fieldFight.bind(Game);
      Game.fieldFight = function (vid, mdef, m, opts) {
        const r = oFF.apply(this, arguments);
        try {
          if (t.inWildEncounter) {
            t.encounters.push({
              day: gday(Game), tx: num(m && m.tx), ty: num(m && m.ty),
              monster: (mdef && mdef.id) || (m && m.id) || null,
              vid, via: 'wild-fight',
              allies: (opts && typeof opts.allies === 'number') ? opts.allies : null,
              allyVids: (opts && Array.isArray(opts.allyVids)) ? opts.allyVids.slice(0, 4) : [],
              outcome: r && r.outcome, rounds: r && r.rounds, vTaken: r && r.vTaken,
            });
          }
        } catch (e) { t.errors++; }
        return r;
      };
    } catch (e) { t.errors++; }
  } catch (e) { t.errors++; }
  try {
    const oTele = Game.tele.bind(Game);
    Game.tele = function (type, data) {
      const r = oTele.apply(this, arguments);
      try {
        if (type === 'death') {
          // INSTRUMENT FIX vs b2: capture `kind` (person/villager vs
          // monster/animal) — the b2 pollution counted monster kills as
          // villager deaths.
          const cause = data && (data.cause == null ? null : String(data.cause));
          const who = data && data.who;
          const ho = hunterOccOf(Game, who);
          t.deaths.push({
            day: gday(Game), who, name: ho.name, occ: ho.occ,
            hunterOcc: ho.match, // corrected word-list background
            cause, kind: data && (data.kind == null ? null : String(data.kind)),
            player: !!(data && data.player), cls: deathClass(cause),
          });
        }
      } catch (e) { t.errors++; }
      return r;
    };
  } catch (e) { t.errors++; }
  const hist = { maxRank: 0, everTable: false, exiled: false, starvedDays: 0, maxArc: 1, maxFires: 0, maxWave: 1 };
  const oDaily = policy.daily;
  let huntAssignmentsFired = 0, runCtx = null;
  policy.daily = (G, ctx) => {
    try {
      runCtx = ctx; huntAssignmentsFired = (ctx && ctx._hsAssignments) || 0;
      // ITEM 4 substrate: lean-day flag per day (HS.leanDay is read-only).
      t.leanDays.push({ day: gday(G), lean: !!HS.leanDay(G) });
      // FINDING #528: snapshot v.taskLeads per day — the engine's TASK-LEAD
      // hunt duties (game.js 6098/6136) bypass the assignTask instrument.
      try {
        const tl = (((G.state || {}).village || {}).taskLeads) || {};
        t.taskLeadsDays.push({ day: gday(G), leads: Object.assign({}, tl) });
      } catch (e) { t.errors++; }
      // b4 starvation gate: first day the village is lost (bounds the count).
      if (t.villageLostDay == null) {
        try { if (G.villageLost) t.villageLostDay = gday(G); } catch (e) {}
      }
    } catch (e) { t.errors++; }
    try {
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting) hist.everTable = true;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      hist.maxRank = Math.max(hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) hist.exiled = true;
      if (((G.state.scholar || {}).kcal || 99999) < 500) hist.starvedDays++;
      try { const a = ((((G.state || {}).scholar || {}).prog || {}).arc || 1); if (a > hist.maxArc) hist.maxArc = a; } catch (e) {}
      try {
        const pol2 = G._havenPolity ? G._havenPolity() : null;
        const fires = pol2 ? 1 + ((pol2.subs || []).length) : 0;
        if (fires > hist.maxFires) hist.maxFires = fires;
      } catch (e) {}
      try { const w = G.unlockedWave ? (G.unlockedWave() | 0) : 1; if (w > hist.maxWave) hist.maxWave = w; } catch (e) {}
    } catch (e) { t.errors++; }
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) { r = undefined; } }
    try { runCtx = ctx; huntAssignmentsFired = (ctx && ctx._hsAssignments) || 0; } catch (e) {}
    return r;
  };
  let result;
  if (VERBOSE) { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 }); }
  else { await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, sampleEvery: 30 }); }); }
  // Hunter-fate instrument: mark deaths of ever-assigned hunters.
  const assignLog = (runCtx && runCtx._hsAssignLog) || [];
  const assignedVids = new Set(assignLog.map(a => a.vid));
  for (const d of t.deaths) d.assignedHunter = assignedVids.has(d.who);
  const assignedHunterDeaths = assignLog.map(a => {
    const d = t.deaths.find(x => x.who === a.vid && (x.kind === 'person' || x.kind === 'villager' || x.player));
    return d ? { vid: a.vid, name: a.name, occ: a.occ, dayAssigned: a.day, dayDied: d.day, cause: d.cause, huntAttributable: /hunt/i.test(String(d.cause)) }
             : { vid: a.vid, name: a.name, occ: a.occ, dayAssigned: a.day, dayDied: null, cause: null, huntAttributable: false };
  });
  // ITEM 4 substrate: days with an assignment (from the assign log).
  const assignDays = [...new Set(assignLog.map(a => a.day))].sort((x, y) => x - y);
  const leanDayRows = t.leanDays.map(ld => ({ day: ld.day, lean: ld.lean, assigned: assignDays.includes(ld.day) }));
  const waveMax = Math.max(hist.maxWave, (result.maxWaveUnlocked || 1) | 0);
  const gameDays = result.gameDays;
  const isVillager = (d) => !d.player && (d.kind === 'person' || d.kind === 'villager');
  const causeCounts = {}, clsCounts = {}, hunterCauseCounts = {}, villCauseCounts = {};
  const seenPerson = new Set();
  let villagerDeathsDedup = 0, villagerStarvDeaths = 0;
  for (const d of t.deaths) {
    const k = d.cause == null ? '<null>' : d.cause;
    causeCounts[k] = (causeCounts[k] || 0) + 1;
    clsCounts[d.cls] = (clsCounts[d.cls] || 0) + 1;
    if (d.hunterOcc && !d.player) hunterCauseCounts[k] = (hunterCauseCounts[k] || 0) + 1;
    if (isVillager(d)) {
      villCauseCounts[k] = (villCauseCounts[k] || 0) + 1;
      const dk = d.who + '|' + d.day + '|' + d.cause;   // ITEM 2: dedup before any count gate
      if (!seenPerson.has(dk)) { seenPerson.add(dk); villagerDeathsDedup++; }
      if (d.cls === 'STARVATION') villagerStarvDeaths++;
    }
  }
  const villagerDeaths = t.deaths.filter(isVillager).length;
  const monsterKills = t.deaths.filter(d => d.kind === 'monster' || d.kind === 'animal').length;
  const out = {
    schema: 'huntstaff-wall/4',
    runId: RUN_ID,
    seed, policyId, arm, days: result.days, gameDays, endReason: result.endReason,
    national: hist.maxRank >= 2 ? 1 : 0, table: hist.everTable ? 1 : 0,
    wins: Game.won ? 1 : 0, exiled: hist.exiled ? 1 : 0,
    maxWave: waveMax, wave4: waveMax >= 4 ? 1 : 0, wave5: waveMax >= 5 ? 1 : 0,
    maxRank: hist.maxRank, maxArc: hist.maxArc,
    arc2: hist.maxArc >= 2 ? 1 : 0, arc3: hist.maxArc >= 3 ? 1 : 0, arc4: hist.maxArc >= 4 ? 1 : 0,
    maxFires: hist.maxFires, fourRealm: hist.maxFires >= 4 ? 1 : 0,
    starvedDays: hist.starvedDays,
    starvationDeaths: t.deaths.filter(d => d.cls === 'STARVATION').length,   // legacy: all kinds + player
    villagerStarvationDeaths: villagerStarvDeaths, // guardrail input: villagers only
    playerStarvationDeaths: t.deaths.filter(d => d.cls === 'STARVATION' && d.player).length,
    playerDeaths: t.deaths.filter(d => d.player).length,
    villagerDeaths,                // kind person/villager only (instrument fix vs b2)
    villagerDeathsDedup,           // ITEM 2: deduped on (who,day,cause)
    villagerCauseCounts: villCauseCounts,
    monsterKillsInDeathStream: monsterKills,  // villager-killed monsters (b2 pollution class)
    causeCounts, clsCounts,
    hunterDeaths: t.deaths.filter(d => d.hunterOcc && !d.player).length,
    hunterCauseCounts,
    deaths: t.deaths,                       // enriched: name/occ/hunterOcc/assignedHunter/kind
    encounters: t.encounters,               // ITEM 1: wild-encounter telemetry
    leanDayRows,                            // ITEM 4: per-day {day, lean, assigned}
    huntDutyLog: assignLog,                 // armed: every accepted hunt-duty assignment
    assignedHunterDeaths,                   // hunter-fate instrument
    huntAssignmentsFired,                   // layer ctx telemetry (armed only)
    huntAssignAttempts: t.huntAssignAttempts, // instrument: every hunt assignTask
    huntResolves: t.huntResolves,           // instrument: villagerHuntResolve calls
    huntKcal: t.huntKcal,                   // instrument: sum of hunt-return kcal
    huntKills: t.huntKills,                 // instrument: resolves with kcal > 0
    taskLeadsDays: t.taskLeadsDays,         // finding #528: per-day taskLeads snapshot
    villageLostDay: t.villageLostDay,       // b4 starvation gate: bounds the count
    instrumentErrors: t.errors | 0,
  };
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, `${arm}-${policyId}-s${seed}.json`), JSON.stringify(out));
  console.log(`  [${arm} ${policyId} s${seed}] d=${gameDays} end=${out.endReason} huntAsg=${out.huntAssignmentsFired}/${out.huntAssignAttempts} huntRes=${out.huntResolves} huntKcal=${out.huntKcal} vDeaths=${villagerDeaths}(dedup ${villagerDeathsDedup}) mkStream=${monsterKills} vStarv=${villagerStarvDeaths} enc=${t.encounters.length} nat=${out.national} wave=${waveMax} err=${t.errors}`);
  return out;
}

(async () => {
  for (const k of ['FEASTSCALE_R13']) {
    if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
  }
  if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required EXPLICITLY.'); process.exit(2); }
  const all = [];
  for (const seed of SEEDS) {
    for (const p of POLICIES) {
      for (const a of ARMS) {
        if (a === 'armed') process.env.HUNTSTAFF = '1'; else delete process.env.HUNTSTAFF;
        all.push(await oneRun(seed, p, a));
      }
    }
  }
  delete process.env.HUNTSTAFF;
  console.log('SWEEP DONE', JSON.stringify({ runs: all.length }));
})().catch(e => { console.error('SWEEP FAILED', e); process.exit(1); });
