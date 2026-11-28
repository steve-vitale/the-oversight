#!/usr/bin/env node
// Journey leg: ESTABLISHMENT (days 14-40 window, 42d horizon per r71)
// R292 (2026-11-28). Clone of the r286 driver, verbatim except run
// number / output names / header comment / seed band / the frozen
// cancel-press rule (R292 BEARER-END CANCEL PRESS below — port of the
// r287 deepening driver rule). Single panel on the current base (the
// r286 any-want bearer-end fix and the r287 B1 ending-aware
// requirements line are already in master). NO other driver change
// vs r286: the Q1b stranded-guard revision (bearer-end excuse) is
// analyzer-side only (r292 analyzer); the driver already records
// bearerDead on strandedLog entries and the close kind in endLog.
// The r274 GUARDRAILS EMIT is carried (guardrails { deaths, popAlive,
// pantryKcal } + c3 { starvationDeaths } per seed). The r274 instrument
// set is carried unchanged (dayPhaseLog, sleepLines, rosterArrivals,
// arrivalLines, spotterTenure, winPlanEnd raw-state snapshot — NEVER
// Game.winPlanStats(): the function materializes the store — +
// winplanLines dayLines scan for the win-plan beats, including the
// DEPARTBEAT depart line; heedLines per dlg:heed/dlg:details press).

// Leg questions (fresh band 109151–109158, pilot 109151): Q1
// STRANDED-CLOSE RE-PANEL, EIGHTH BAND — r265: 0 stranded, r271: 0
// stranded, r274: 1 stranded (closed d21, 0 dawns, bearer-end); r277: 1
// (closed d22, 3 dawns — NO-GO pre-fix); r285: 0 on fixed code
// (NO-OPPORTUNITY); r286: 1 (24 dawns, NEVER closed — the offer
// depended on the sitting's opening want; the any-want fix closed it
// on re-panel, 1 dawn); r287 deepening: 1 (44 dawns, still open —
// offer reached, close failed on the contradictory requirements line
// + no press; B1 fix + driver press rule landed). This band the driver
// PRESSES the cancel when urgent (see below); the stranding rate
// itself is reported alongside the close bar. Q2 MOOT-CLOSE LIVE — do evicted live runs close
// their books in the wild (mootCloseTele), and does any stranded run
// survive an eviction? Q3 SILENT-ARRIVAL — panel arrivals must read 0 SILENT (marker
// join, NARRATED-BY-NAME vs NARRATED-DESCRIPTIVE). Q4 GUARDRAILS —
// the emitted guardrails must read real numbers in the telemetry
// check, judged against the r274+r277+r280+r285 pooled journey-regime
// means (deaths 48.3, popAlive 9.3, starvationDeaths 0) and the pooled
// pantry MEDIAN 31637 kcal (r292 median revision — mean reported as
// the second number), not the r132 sweep-regime sums; the Q4 roll
// condition (all four within ±30%) decides the baseline re-seed. WINPLAN is judged on planSeeds/partyDepartures/plans, NEVER
// on ignited (the store now wakes by design on the first Haven tick).
// The r268 instrument set is carried unchanged (dayPhaseLog,
// sleepLines, rosterArrivals, arrivalLines, spotterTenure,
// winPlanEnd raw-state snapshot — NEVER Game.winPlanStats(): the
// function materializes the store — + winplanLines dayLines scan
// for the win-plan beats, including the DEPARTBEAT depart line).
// Leg questions (fresh band 101975–101978, pilot 101975): Q1
// STRANDED-CLOSE RE-PANEL — does every stranded run close within
// 2 dawns of first stranding on the fixed code (r268 menu fix +
// r269 MOOT-CLOSE, both live)? Q2 MOOT-CLOSE LIVE — do evicted
// live runs close their books in the wild (mootCloseTele), and
// does any stranded run survive an eviction? WINPLAN is judged
// on planSeeds/partyDepartures/plans, NEVER on ignited (the
// store now wakes by design on the first Haven tick).
// judged on planSeeds/partyDepartures/plans, NEVER on ignited (the
// store now wakes by design on the first Haven tick).
// R265 POLICY CHANGE carried (wedgeDawn): after logging stranded
// runs, a stranded run whose bearer is DEAD is routed to endWedge84
// (the honest end — travel home, ending status, sit 'end', press
// dlg:favor_cancel) instead of being skipped. A living-bearer
// stranded run is still skipped and logged exactly as r247.
// Analyzer revisions are in the r292 analyzer (Q1b stranded-guard
// bearer-end excuse; Q4 bar vs r274 means; comparisons vs r274).
// watch + mourning witness watch (r254 variant) + BOWCRAFT gear-count
// watch + WARN-HEED (r150) + SETTLED-FAVOR naming (r247) + DRY2 (r256)
// + GOAL-BRIDGE pool (r149) + SELFWIT (r258). REACT RETIRED for this
// leg (r246 metric review §3). MATCHED band 101966–101970 (r247's
// seeds — the before-panel is r247's JSONs, not a fresh band).
// Base delta vs r247's panel base 2b97163b0 (src/js +323/-28, 7 files,
// 63 commits): DEPARTBEAT default-ON (win-plan.js +161, e5c8b4633 —
// the ordinary wave-4+ departure beat speaks on launches; it seeds
// no plans, so ignition counters are NOT confounded; beat counts
// are caveated); game.js +42 (landing r152 namebeast + KILLBUNDLE
// env-gated OFF); villager-brain.js +44, betrayal.js +44,
// conversation.js +39, convo-wants.js +19 (lever/evidence landings:
// d3refreeze, dmgpin-report, tier4access reverted, killlootbundle
// env-gated OFF, shelterdraft reverted, succession r263, crisis
// r262). build.js stamp only. THIS RUN ADDS: PLANWAKE (win-plan.js
// store wakes live on the first Haven tick) + BEARER-END
// (favor-forage.js + favor-water.js dead-bearer honest end).
// R241 (2026-11-18). Clone of the r240 driver, verbatim except run
// number / seed band / output names. Leg question: re-read the END BAR
// on a fresh band WITH the r240 walkHome fix in (first homeward refusal
// + clearableBlocked, 476f43e1d) — r240's END BAR missed 11/14 on the
// collapse seed because a creek overwrote the tree in the blocked
// record. Q5 exile-warning + Q6 foraging instruments carried verbatim
// (Q5: no exile fired on r240, instrument proven, still unexercised;
// Q6: no F4-shape seed on r240). FRESH band 101601-101605 — the
// 101501-101505 first pick was rejected (its 101501 hit is a pantry
// value, not a seed, but the band is retired to avoid ambiguity; the
// 101601-101605 hits are likewise measurement values, not seed
// reservations — see prereg). This run also re-reads Q1 (fourth fresh
// band), Q1b (F5 watch closed on r240), Q1c, Q2, Q3, and the
// scholar-death watch on unseen seeds.
// R240 (2026-11-18). Clone of the r233 driver + ONE read-only
// instrument change (Q5, see prereg): the exileLines regex also
// catches the freeloader warning/gossip lines ("pull weight",
// "pulling weight", "village will decide"), which the r233 regex
// missed — so the panel can judge whether the player heard the d7
// warning before a d12 vote. Otherwise the same THREE READ-ONLY
// instruments (see prereg): (1) standingEnd —
// villageStandingTotal() at end, so the wave-4 unlock move can be
// attributed (r233: standing 100 is the line, t4=100); (2)
// scholarDawns — per-dawn scholar location, so each scholar death
// can be read against the last dawn location (r233 scholar-death
// watch hit 2 — the companion-guard A/B escalation already
// triggered, sim lane's job); (3)
// teleTypeCounts — full telemetry type-count map at end, so a
// party-launch/kill signal can be named if telemetry records it.
// Otherwise verbatim r242 (FRESH band 101801-101805 — the
// 101601-101605 band is spent after r241; this run re-reads the Q1
// family with the widened LOST trigger + F5 floor tie-breaker, the
// Q5 moot-path instrument, and the F2 echo watch with the r243 fix
// in, on unseen seeds).
// R217 (2026-11-15). Clone of the r213 driver + R214 Q1 REVISION:
// the r214 full-transcript probe is folded in (FULL-TRANSCRIPT dump
// after every held sitting + a structured sittingCloses record in
// the JSON: endedByEngine, closing line, last THEM line, and the
// closing beats endConvo spoke after the last printed THEM line),
// and the census knownCount (null on every person record — no
// plant-knowledge field exists in src/js) is replaced by per-villager
// spotter XP. R139 (2026-11-15). Clone of the r138 driver + SPOTTER WIRING
// instruments (see prereg): competent policy, one seed per process,
// dawn-signal instrumentation, daily alive/pantry trace, end census,
// 2 held convos (goon-first).
// R139 SPOTTER (the r131–r138 next blank, foodXp['spotter'] = 0 on
// every panel for seven straight runs): the fix (src/js/game.js)
// wires the specialty — a villager forage resolution grants 1 spotter
// XP first-per-day, the scholar's bumpPlantFamiliarity grants 1
// first-per-day, and spotter skill >= 1 lowers the field recognition
// threshold by 1 (faster ID, never field identification). The driver
// adds a read-only bumpPlantFamiliarity wrap logging {day, pid,
// threshold, encounters, familiar, spotterSkill, baseline, benefit}
// plus an end snapshot of state.codex.plants by source, so the
// analyzer can score the SPOTTER / LADDER / FASTER-ID bars. The r138
// stranded-run handling, clear-home travelHome84 and paging sit are
// carried unchanged. No R139_PILOT_BREAK: the pilot gate is the
// spotter instruments firing, not a forced break.
// Usage: SEEDS=101801 DAYS=42 node scripts/journey-establishment-r265-20261123.js
// Wedge: each dawn, if no open promised joint favor and no live run, sit
// up to 2 round-robin villagers and press dlg:commit ONLY for an ask_favor
// want of kind forage_help/water_haul (r78 sit mechanics, r83 rotation).
// If a promised favor exists, the r83 DOOR-WALK probe runs first (door
// verbs + greedy tap-walk, then sit mode 'start').
// If a live FORAGE run exists, the TRAVEL-OUT wedge runs: read the
// forageFavorAction status, get adjacent (door verbs + tap-walk), travel
// out on offered travelTargets to green ground, sit mode 'work' to press
// forage_together, travel home, sit mode 'work' to deliver. Water live
// runs keep the r83 sit-work behavior. R84 driver fix: jointLedger
// counts a run live only while !returned (r83 counted delivered runs
// live forever). R137 END WEDGE: a BROKEN live forage run (state 'broken'
// or promise kept 'broken') is closed with the honest end — deliver
// first if haul > 0 (r84 branch), else travel home and sit mode 'end'
// to press dlg:favor_cancel when the ending status is ready; the run
// flips returned=true and stops blocking later departures, with trust
// read before/after every end press (renounce is skipped for an
// already-broken promise, so trust must not move). NEVER dlg:favor_cancel
// on an unbroken run. Sits are location-free in the harness
// (r78/r81 liberty, noted in prereg). People-check convos gated on
// !Game.over (r81 driver flaw fix).
// Usage: SEEDS=101801 DAYS=42 node scripts/journey-establishment-r265-20261123.js
//   EVID defaults to the goal hidden_files evidence dir for 2026-11-20.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = process.env.EVID || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-28';
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [109151]);
const DAYS = parseInt(process.env.DAYS || '42', 10);
const _warned = {};
function warnOnce(k, e) { if (!_warned[k]) { _warned[k] = true; console.warn('[r265:' + k + ']', (e && e.message) || e); } }
// R138 STRANDED-RUN DETECTION (the r137 next blank, seed 2802): a live
// run whose bearer is not the current villager can never be worked or
// ended by the successor — forageFavorAction/waterFavorAction block
// both branches with the previous-bearer line, attemptWaitingOuting
// skips it, and the companions lists filter to bearer===villagerId.
// The mantle handoff (ledger.js) releases the promise but leaves the
// run live, so the ledger carries it forever. Returns the stranded
// record or null. Exported (require.main guard at the bottom) so the
// proof test exercises the driver's own detection, not a copy.
function prevBearerRunOf(Game, f) {
  if (!f) return null;
  const run = f.forageRun || f.waterRun || null;
  if (!run || run.returned) return null;
  if (!run.bearer || String(run.bearer) === String(Game.villagerId)) return null;
  let bearerName = null;
  try { bearerName = Game.displayName ? Game.displayName(run.bearer) : null; } catch (e) {}
  return { kind: f.kind, bearer: String(run.bearer), bearerName, startedDay: run.startedDay ?? null };
}
// R292 BEARER-END CANCEL PRESS (port of the r287 deepening driver rule,
// build A): pure picker for the wedge sit's choice selection. Top-level
// (like prevBearerRunOf) so the proof test can require this driver and
// exercise it on staged menus without running seeds. runSeed's JOINT /
// NO_PICK alias these sets (single source of truth — do not duplicate
// the literals). Order: the mode's own verb first (work/start
// dlg:favor_action — deliver-first, as endWedge84 does; accept
// dlg:commit for an ask_favor joint want), then the bearer-end cancel
// when the favor is urgent (the run's owner is gone, so the cancel is
// the run's ONLY honest end), then goon, then the first non-NO_PICK
// unseen choice. Healthy live runs are untouched: urgent is false for
// them, so the cancel branch never fires. The r129 requirements pick
// lives in the fallback tail — the cancel outranks it, so the driver
// never asks "why" when the end is on the table. 'end' mode is NOT
// routed here: sit() presses its cancel directly.
const WEDGE_JOINT = new Set(['forage_help', 'water_haul']);
const WEDGE_NO_PICK = new Set(['leave', 'bye', 'dlg:commit', 'dlg:favor_action', 'dlg:favor_cancel', 'dlg:renounce', 'dlg:invite']);
function pickWedgeChoice(choices, mode, wantId, wantFavor, urgentFavorEnd, seen, joint, noPick) {
  const J = joint || WEDGE_JOINT, NP = noPick || WEDGE_NO_PICK;
  if ((mode === 'work' || mode === 'start') && choices.find(ch => ch.id === 'dlg:favor_action')) return choices.find(ch => ch.id === 'dlg:favor_action');
  if (mode === 'accept' && wantId === 'ask_favor' && wantFavor && J.has(wantFavor.kind) && choices.find(ch => ch.id === 'dlg:commit')) return choices.find(ch => ch.id === 'dlg:commit');
  if (urgentFavorEnd && choices.find(ch => ch.id === 'dlg:favor_cancel')) return choices.find(ch => ch.id === 'dlg:favor_cancel');
  if (choices.find(ch => ch.id === 'goon')) return choices.find(ch => ch.id === 'goon');
  return choices.find(ch => !NP.has(ch.id) && !seen[ch.id]) || null;
}
// R137: evidence writes retry through write-flap windows (host EPERM
// episodes leave 0-byte files and nuke a finished sim — the pilot's
// first run died exactly this way). One big write usually lands
// between refused ones; this episode is refusing consistently, so the
// retry budget spans it: every 10s for up to 60 min, logging every
// 10 min so the run looks alive instead of wedged.
function writeFileRetry(p, data) {
  let last = null;
  for (let i = 0; i < 360; i++) {
    try { fs.writeFileSync(p, data); return true; }
    catch (e) { last = e; if (i > 0 && i % 60 === 0) console.warn('[r265:write-retry] ' + p.split('/').pop() + ' still EPERM after ' + (i * 10) + 's, retrying'); try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10000); } catch (e2) {} }
  }
  throw last;
}
const nowDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
function nameOf(Game, id) { try { return Game.displayName(id); } catch (e) { return String(id); } }
function pantryKcal(Game) {
  try { return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); }
  catch (e) { return 0; }
}
function isDead(Game, id) { try { return !!(Game.getPerson(id) || {}).dead; } catch (e) { return false; } }
// R265 spotterXpOf (r246 metric review §1): the r135 foodXpOf pattern
// as a helper — live getPerson record first, wrapper second. Returns
// the person's spotter XP (0 when readable but none), null on error.
function spotterXpOf(Game, id) {
  try {
    let p = null; try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
    const vp = (() => { try { return (Game.villagePeople ? Game.villagePeople() : []).find(x => String(x.id) === String(id)); } catch (e) { return null; } })();
    const fx = (p && p.foodXp) || (vp && vp._src && vp._src.foodXp) || {};
    return (typeof fx.spotter === 'number') ? fx.spotter : 0;
  } catch (e) { return null; }
}

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const policy = competent;
  const ctx = { policyId: policy.id, notes: [] };
  if (policy.setup) { try { await policy.setup(Game, ctx); } catch (e) { warnOnce('setup', e); } }

  const dayLines = {};
  Game.say = function (...a) {
    try { const d = nowDay(Game); (dayLines[d] = dayLines[d] || []).push('SAY: ' + String(a[0] == null ? '' : a[0])); } catch (e) { warnOnce('say', e); }
  };
  if (typeof Game.sysSay === 'function') {
    Game.sysSay = function (...a) {
      try { const d = nowDay(Game); (dayLines[d] = dayLines[d] || []).push('SYS: ' + String(a[0] == null ? '' : a[0])); } catch (e) { warnOnce('sysSay', e); }
    };
  }
  // Dawn-signal instrument: wrap the method (endDay calls it via this.*),
  // log every call's return; never mutate, never consume RNG.
  const dawnCalls = [];
  if (typeof Game.jointFavorDawnSignal === 'function') {
    const orig = Game.jointFavorDawnSignal.bind(Game);
    Game.jointFavorDawnSignal = function (...a) {
      const out = orig(...a);
      try { dawnCalls.push({ day: nowDay(Game), out: (out || []).map(o => ({ vid: String(o.vid), kind: o.kind, due: o.due, line: o.line })) }); } catch (e) {}
      return out;
    };
  } else { dawnCalls.push({ day: null, out: null, note: 'METHOD-MISSING' }); }

  // R240 REMOVAL-LOG INSTRUMENT (r233 pilot 101301: 3 villagers vanished
  // d10 with no death record and no trace in any driver log — the
  // roster reconciles by id, but the WHY is invisible): wrap
  // removeVillager (the one removal choke point, betrayal.js)
  // read-only — log day, vid, name, and the how
  // ('fled'/'splinter'/'exiled'/'killed'/'ambushed'/...), call
  // through unchanged. Never mutates, never consumes RNG.
  const removalLog = [];
  if (typeof Game.removeVillager === 'function') {
    const _rm = Game.removeVillager.bind(Game);
    Game.removeVillager = function (vid, how) {
      try { removalLog.push({ day: nowDay(Game), vid: String(vid), name: nameOf(Game, vid), how: String(how || '?') }); } catch (e) {}
      return _rm(vid, how);
    };
  }

  // R139 SPOTTER INSTRUMENT (read-only wrap; never mutates, never
  // consumes RNG): log every bumpPlantFamiliarity call with the
  // scholar's spotter skill BEFORE the call (the threshold is set
  // from the pre-call skill — the grant inside the call can flip the
  // skill mid-call), the threshold the game set, and the no-skill
  // baseline (occupation rules replicated from game.js) so the
  // analyzer can count benefit plays exactly. benefit = skill >= 1
  // and the set threshold sits below the baseline.
  const bumpLog = [];
  if (typeof Game.bumpPlantFamiliarity === 'function') {
    const _bump = Game.bumpPlantFamiliarity.bind(Game);
    Game.bumpPlantFamiliarity = function (pid, plant) {
      let skill = 0, baseline = 3;
      try {
        const me = Game.getPerson ? Game.getPerson(Game.villagerId) : null;
        const occ = String((me && me.formerOccupation) || '').toLowerCase();
        if (occ.includes('hunter') || occ.includes('cook') || occ.includes('chef')) baseline = 2;
        if (occ.includes('nurse') && plant && plant.medicinal) baseline = 2;
        if (occ.includes('bus driver') || occ.includes('accountant') || occ.includes('dropout')) baseline = 4;
        try { skill = (Game.specialistSkill && me) ? Game.specialistSkill(me, 'spotter') : 0; } catch (e) {}
      } catch (e) { warnOnce('bumpSkill', e); }
      const out = _bump(pid, plant);
      try { bumpLog.push({ day: nowDay(Game), pid: String(pid), threshold: out ? out.threshold : null, encounters: out ? out.encounters : null, familiar: !!(out && out.familiar), spotterSkill: skill, baseline, benefit: skill >= 1 && out && out.threshold < baseline }); } catch (e) { warnOnce('bumpLog', e); }
      return out;
    };
  } else { bumpLog.push({ day: null, pid: null, note: 'METHOD-MISSING' }); }

  // R246 WARN-LOG INSTRUMENT (WARN-HEED watch, r150 fix first live
  // read): wrap Game.convoWantWarning — the heed path (first heed)
  // and the details/engage path both call it, and only it returns the
  // actual warning text. Log every delivery {day, vid, lineStart} so
  // the analyzer can tell, per warn_you sitting, whether the player
  // was ever told the danger. Read-only wrap; never mutates, never
  // consumes RNG. A sitting that ends before any heed/details press
  // has no delivery by design — the analyzer only faults engaged
  // sittings (dlg:heed or dlg:details pressed) with no delivery.
  const warnLog = [];
  if (typeof Game.convoWantWarning === 'function') {
    const _warn = Game.convoWantWarning.bind(Game);
    Game.convoWantWarning = function (vid) {
      const out = _warn.apply(this, arguments);
      try { if (out) warnLog.push({ day: nowDay(Game), vid: String(vid), lineStart: String(out).slice(0, 120) }); } catch (e) { warnOnce('warnLog', e); }
      return out;
    };
  } else { warnLog.push({ day: null, vid: null, note: 'METHOD-MISSING' }); }

  // R82 lifecycle instruments (read-only wraps; never mutate, never consume RNG).
  const storeLog = [], commitLog = [], performLog = [];
  if (Game.convoStoreFavor) { const _s = Game.convoStoreFavor.bind(Game);
    Game.convoStoreFavor = function (favor) { try { storeLog.push({ day: nowDay(Game), vid: String(favor && favor.vid), kind: favor && favor.kind, state: favor && favor.state }); } catch (e) {} return _s.apply(this, arguments); }; }
  if (Game.convoFavorCommit) { const _c = Game.convoFavorCommit.bind(Game);
    Game.convoFavorCommit = function (vid, favor) { const r = _c.apply(this, arguments);
      try { commitLog.push({ day: nowDay(Game), vid: String(vid), kind: favor && favor.kind, ok: !!(r && r.ok), away: !!(r && r.away), blocked: !!(r && r.blocked), line: r && r.line ? String(r.line).slice(0, 160) : null }); } catch (e) {} return r; }; }
  if (Game.performForageFavor) { const _p = Game.performForageFavor.bind(Game);
    Game.performForageFavor = function (vid, f, ending) { const r = _p.apply(this, arguments);
      try { performLog.push({ day: nowDay(Game), vid: String(vid), kind: 'forage_help', ending: !!ending, ok: !!(r && r.ok), line: r && r.line ? String(r.line).slice(0, 160) : null }); } catch (e) {} return r; }; }
  if (Game.performWaterFavor) { const _w = Game.performWaterFavor.bind(Game);
    Game.performWaterFavor = function (vid, f, ending) { const r = _w.apply(this, arguments);
      try { performLog.push({ day: nowDay(Game), vid: String(vid), kind: 'water_haul', ending: !!ending, ok: !!(r && r.ok), line: r && r.line ? String(r.line).slice(0, 160) : null }); } catch (e) {} return r; }; }

  // R82 wedge helpers. JOINT kinds only. NO_PICK mirrors r78 (never press
  // a state-changing dlg:* choice as a fallback).
  const JOINT = WEDGE_JOINT; // R292: single source of truth — see pickWedgeChoice above.
  const NO_PICK = WEDGE_NO_PICK; // R292: single source of truth — see pickWedgeChoice above.
  const wedgeSits = [];
  const doorWalkLog = [];
  const travelOutLog = [];
  // R137 end-wedge state. endLog: one record per end attempt (trust
  // before/after included). jamLog: dawns where a promised run existed
  // while a broken-live run was live (the r84 poison). endDisabled
  // trips on the first trust drop on an end press (hard guard).
  const endLog = [];
  const jamLog = [];
  // R138 stranded-run log: one record per dawn a previous-bearer live
  // run is present (firstSeen marks the first dawn for that vid+kind).
  const strandedLog = [];
  const strandedSeen139 = new Set();
  let brokenWaterDawns = 0;
  let pilotBreakVid = null;
  let endDisabled = false;
  let sitCursor = 0;
  // R84 door-walk probe helpers. All reads are instruments; the only
  // state changes are the honest player verbs in wedgeDawn (door verbs
  // + microMove) — never direct state writes, never teleports.
  function homePoint83() {
    const v = Game.state.village || {};
    if (Number.isFinite(v.px) && Number.isFinite(v.py)) return { x: v.px, y: v.py };
    try { for (let y = 0; y < Game.map.tiles.length; y++) for (let x = 0; x < Game.map.tiles[y].length; x++) if (Game.map.tiles[y][x].type === 'haven') return { x, y }; } catch (e) {}
    return { x: 4, y: 4 };
  }
  function doorState83(vid) {
    const v = Game.state.village || {}, s = Game.state.scholar || {};
    const home = homePoint83();
    let partnerInside = null;
    try { partnerInside = (typeof Game.npcInside === 'function') ? !!Game.npcInside(vid) : (((v.npcInside || {})[vid] !== false)); } catch (e) { partnerInside = null; }
    const node = (v.nodePos || {})[vid] || null;
    return { home, playerAtHaven: (Game.map.px === home.x && Game.map.py === home.y),
      partnerAtHavenNode: !node || (node.nx === home.x && node.ny === home.y),
      playerInside: (s.insideHaven !== false), partnerInside,
      playerPos: { mx: s.mx ?? null, my: s.my ?? null },
      partnerPos: ((v.positions || {})[vid] ? { mx: (v.positions[vid]).mx ?? null, my: (v.positions[vid]).my ?? null } : null),
      dayPart: Game.dayPart ?? null };
  }
  function cheby83(a, b) { return Math.max(Math.abs((a.mx ?? 0) - (b.mx ?? 0)), Math.abs((a.my ?? 0) - (b.my ?? 0))); }
  function walkToPartner84(vid) {
    const rec = { steps: 0, squares: [], finalDist: null, dayPartStart: Game.dayPart ?? null, dayPartEnd: null, stoppedReason: null };
    const visited = new Set();
    try {
      const s0 = Game.state.scholar || {};
      visited.add((s0.mx ?? 4) + ',' + (s0.my ?? 4));
      const DELTAS = [[-1, -1], [1, -1], [-1, 1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]];
      for (let step = 0; step < 20; step++) {
        if (Game.over) { rec.stoppedReason = 'game-over'; break; }
        if (Game.dayPart !== 0) { rec.stoppedReason = 'daypart-left-0'; break; }
        const st = doorState83(vid);
        if (!st.partnerPos) { rec.stoppedReason = 'partner-pos-null'; break; }
        const dist = cheby83(st.playerPos, st.partnerPos);
        rec.finalDist = dist;
        if (dist <= 1) { rec.stoppedReason = 'adjacent'; break; }
        const cands = [];
        for (let i = 0; i < DELTAS.length; i++) {
          const cx = st.playerPos.mx + DELTAS[i][0], cy = st.playerPos.my + DELTAS[i][1];
          if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
          if (visited.has(cx + ',' + cy)) continue;
          cands.push({ cx, cy, d: Math.max(Math.abs(cx - st.partnerPos.mx), Math.abs(cy - st.partnerPos.my)), order: i });
        }
        cands.sort((a, b) => (a.d - b.d) || (a.order - b.order));
        let moved = false;
        for (const c of cands) {
          let ok = false;
          try { ok = !!Game.microMove(c.cx, c.cy); } catch (e) { ok = false; }
          if (ok) { visited.add(c.cx + ',' + c.cy); rec.steps++; rec.squares.push([c.cx, c.cy]); moved = true; break; }
        }
        if (!moved) { rec.stoppedReason = 'no-progress'; break; }
      }
      if (!rec.stoppedReason) rec.stoppedReason = 'step-cap';
      const stEnd = doorState83(vid);
      rec.dayPartEnd = Game.dayPart ?? null;
      if (stEnd.partnerPos && stEnd.playerPos.mx !== null) rec.finalDist = cheby83(stEnd.playerPos, stEnd.partnerPos);
    } catch (e) { rec.stoppedReason = 'error'; rec.error = String(e && e.message).slice(0, 200); }
    return rec;
  }
  function jointLedger() {
    const v = Game.state.village || {};
    const out = [];
    for (const vid of (v.roster || [])) {
      const f = (v.favorLedger || {})[vid];
      if (!f || !JOINT.has(f.kind)) continue;
      const p = (v.promises || {})[vid];
      // R138: a live run whose bearer is not the current villager is
      // stranded — it can never be worked or ended by the successor.
      const strandedRec139 = prevBearerRunOf(Game, f);
      out.push({ vid: String(vid), name: nameOf(Game, vid), kind: f.kind, state: f.state,
        promiseKept: p ? (p.kept ?? null) : null,
        promised: !!(f.state === 'promised' && p && p.favorId === f.id),
        live: !!((f.forageRun && !f.forageRun.returned) || (f.waterRun && !f.waterRun.returned)),
        stranded: !!strandedRec139,
        strandedBearer: strandedRec139 ? strandedRec139.bearer : null,
        strandedBearerName: strandedRec139 ? strandedRec139.bearerName : null,
        run: f.forageRun ? { forageCount: f.forageRun.forageCount || 0, playerKcal: (f.forageRun.playerHaul || []).reduce((t, it) => t + (it.kcalEach || 0) * (it.units || 1), 0), partnerKcal: (f.forageRun.partnerHaul || []).reduce((t, it) => t + (it.kcalEach || 0) * (it.units || 1), 0), returned: !!f.forageRun.returned, deliveredKcal: f.forageRun.deliveredKcal || 0 } : null });
    }
    return out;
  }
  // Sit one villager: work mode presses dlg:favor_action when offered;
  // accept mode presses dlg:commit only for an ask_favor joint want;
  // end mode (r137) presses ONLY dlg:favor_cancel when offered — if it
  // is not offered, the sit ends without pressing anything.
  // R137 PAGING: a target verb can sit on page 2+ when betrayal/agency
  // prepends lengthen the menu (Yara r85: cancel on page 2 behind 4
  // betrayal actions). A real player taps menu:more — the wedge does
  // the same, up to all pages, before giving up on the verb. No case
  // action is ever pressed to clear a menu. pagesTurned/menuPages are
  // recorded on the sit rec; when the verb is absent after all pages,
  // offeredIds carries every page's ids (not just page 1).
  function targetForMode136(mode) {
    if (mode === 'end') return 'dlg:favor_cancel';
    if (mode === 'work' || mode === 'start') return 'dlg:favor_action';
    if (mode === 'accept') return 'dlg:commit';
    return null;
  }
  // R230 Q1 TRACE (favorless-ask live trace): pure-read snapshots of
  // the want's provenance — the live seed, the ledger favor, the live
  // need. convoFindFavorNeed is a PURE scan (convo-wants.js:1951, no
  // RNG in the need readings); convoGetFavor + convoSeeds are state
  // reads. The trace consumes no RNG and mutates nothing, so the
  // panel stays comparable to r221's driver regime.
  // R230 AMENDMENT A1 (opener probe): the pilot's single favorless
  // sit (and the panel's 19) are all class E — fresh pick, live need,
  // no kind — so the trace must also say whether the want opener
  // ever ran. A thread resume fires BEFORE the fresh want (the want
  // waits at stage 0 — conversation.js:6040), and a ledger-blocked
  // opener line falls through to the fallbacks with the want still
  // stage 0. Wrap the three opener-path methods (delegate + log
  // only) and slice the log per sit's opening.
  const probeLog230 = [];
  if (typeof Game.convoWantOpener === 'function') {
    const _wo = Game.convoWantOpener.bind(Game);
    Game.convoWantOpener = function (vid, want) {
      const out = _wo(vid, want);
      try { probeLog230.push({ method: 'wantOpener', day: nowDay(Game), vid: String(vid), wantId: want ? want.id : null, fromSeed: !!(want && want.fromSeed), hasLine: !!(out && out.line), lineStart: out && out.line ? String(out.line).slice(0, 80) : null }); } catch (e) {}
      return out;
    };
  }
  if (typeof Game.convoBuildFavor === 'function') {
    const _bf = Game.convoBuildFavor.bind(Game);
    Game.convoBuildFavor = function (vid, need) {
      const out = _bf(vid, need);
      try { probeLog230.push({ method: 'buildFavor', day: nowDay(Game), vid: String(vid), kind: need ? need.kind : null, ok: !!out, favorId: out ? out.id : null }); } catch (e) {}
      return out;
    };
  }
  if (typeof Game.convoFindFavorNeed === 'function') {
    const _fn = Game.convoFindFavorNeed.bind(Game);
    Game.convoFindFavorNeed = function (vid) {
      const out = _fn(vid);
      try { probeLog230.push({ method: 'findNeed', day: nowDay(Game), vid: String(vid), kind: out ? out.kind : null, urgency: out ? out.urgency : null }); } catch (e) {}
      return out;
    };
  }
  function snapFavor246(vid) { try { const f = Game.convoGetFavor ? Game.convoGetFavor(vid) : null; return f ? { id: f.id, state: f.state, kind: f.kind, short: f.short ? String(f.short).slice(0, 80) : null } : null; } catch (e) { return { error: String(e && e.message).slice(0, 80) }; } }
  function snapNeed230(vid) { try { const n = Game.convoFindFavorNeed ? Game.convoFindFavorNeed(vid) : null; return n ? { kind: n.kind, urgency: n.urgency } : null; } catch (e) { return { error: String(e && e.message).slice(0, 80) }; } }
  function snapSeed230(vid) { try { const s = ((Game.state.village || {}).convoSeeds || {})[vid] || null; return s ? { wantId: s.wantId, favorId: s.favorId || null, day: s.day ?? null, note: s.note ? String(s.note).slice(0, 80) : null } : null; } catch (e) { return { error: String(e && e.message).slice(0, 80) }; } }
  function sit(vid, mode) {
    const rec = { day: nowDay(Game), vid: String(vid), name: nameOf(Game, vid), mode, picks: [], result: 'no-offer', pagesTurned: 0, menuPages: null };
    try {
      const probeMark230 = probeLog230.length;
      let r = Game.startConvo(vid);
      // R292: bearer-end urgency for this sit, computed once from the
      // live Game (convoFavorEndUrgent: the run's bearer is gone, so
      // the cancel is the run's ONLY honest end). Recorded on the sit
      // rec for the analyzer; false for healthy live runs.
      let urgentFavorEnd292 = false;
      try { urgentFavorEnd292 = typeof Game.convoFavorEndUrgent === 'function' && !!Game.convoFavorEndUrgent(vid); } catch (e) { urgentFavorEnd292 = false; }
      rec.urgentFavorEnd = urgentFavorEnd292;
      const seen = {};
      for (let turn = 0; turn < 12; turn++) {
        let c = null; try { c = Game.convoGet ? Game.convoGet(vid) : null; } catch (e) {}
        if (!c || !c.active) break;
        let choices = (r && r.choices) || (c && c.choices) || [];
        if (!choices.length) break;
        if (rec.menuPages === null) { try { rec.menuPages = (c.menuPages != null) ? c.menuPages : null; } catch (e) {} }
        // R230 Q1 TRACE (start): the want's provenance at sit start —
        // seeded? which favor? what does the ledger hold? is there a
        // live need right now? Read at turn 0, after startConvo ran
        // the opener, so this is what the opener itself saw.
        if (turn === 0) {
          const probeOpen230 = probeLog230.slice(probeMark230);
          rec.traceStart = {
            fromSeed: !!(c.want && c.want.fromSeed),
            seedFavorId: (c.want && c.want.seedFavorId) || null,
            seedNote: (c.want && c.want.seedNote) || null,
            wantId: (c.want && c.want.id) || null,
            stage: (c.want && c.want.stage) || 0,
            openThread: (c.thread || null),
            resumedOnce: !!(c._resumedOnce),
            wantFavor: (c.want && c.want.favor) ? { id: c.want.favor.id, kind: c.want.favor.kind, state: c.want.favor.state } : null,
            probeOpen: probeOpen230,
            seedLive: snapSeed230(vid),
            ledgerFavor: snapFavor246(vid),
            need: snapNeed230(vid),
          };
        }
        // R137 paging: if this mode's target verb is not on the current
        // page and menu:more is offered, turn pages looking for it.
        // ONCE per sit (a real player pages through the menu once to
        // find the verb — re-sweeping every turn cycled pages up to 66x
        // in one sit on the pilot), and never past the starting page
        // (convoNextMenu wraps, so without the stop the sweep revisits
        // the same pages). Accept mode pages only when the commit is
        // actually its target (an ask_favor joint want); otherwise
        // dlg:commit is not a verb this sit wants, and paging for it
        // is nonsense that also changes fallback picks.
        const wantFavor137 = (c.want && c.want.favor) || null;
        const wantId136 = (c.want && c.want.id) || null;
        const target136 = (mode === 'accept' && !(wantId136 === 'ask_favor' && wantFavor137 && JOINT.has(wantFavor137.kind)))
          ? null : targetForMode136(mode);
        if (target136 && !rec.pagedSweep136 && !choices.some(ch => ch.id === target136)) {
          rec.allPagesOffered = choices.map(ch => ch.id);
          const startPage136 = (c.menuPage != null) ? c.menuPage : 0;
          let guard136 = 0;
          while (guard136 < 6 && choices.some(ch => ch.id === 'menu:more') && !choices.some(ch => ch.id === target136)) {
            guard136++;
            let nr = null;
            try { nr = (typeof Game.convoNextMenu === 'function') ? Game.convoNextMenu(vid) : null; } catch (e) { rec.pageError = String(e && e.message).slice(0, 120); break; }
            if (!nr || !nr.choices) break;
            r = nr;
            choices = nr.choices || [];
            rec.pagesTurned = (rec.pagesTurned || 0) + 1;
            rec.allPagesOffered = rec.allPagesOffered.concat(choices.map(ch => ch.id));
            try { const cc = Game.convoGet ? Game.convoGet(vid) : null; if (cc && cc.menuPages != null) rec.menuPages = cc.menuPages; } catch (e) {}
            try { const cc2 = Game.convoGet ? Game.convoGet(vid) : null; if (cc2 && (cc2.menuPage != null) && cc2.menuPage === startPage136) break; } catch (e) {}
          }
          rec.pagedSweep136 = true;
        }
        const wantFavor = (c.want && c.want.favor) || null;
        const wantId = (c.want && c.want.id) || null;
        let pick = null;
        if (mode === 'end') {
          const cancel = choices.find(ch => ch.id === 'dlg:favor_cancel');
          if (!cancel) { rec.result = 'end-cancel-not-offered'; rec.offeredIds = (rec.allPagesOffered && rec.allPagesOffered.length) ? rec.allPagesOffered : choices.map(ch => ch.id); break; }
          pick = cancel;
        } else pick = pickWedgeChoice(choices, mode, wantId, wantFavor, urgentFavorEnd292, seen, JOINT, NO_PICK);
        if (!pick) break;
        seen[pick.id] = 1;
        rec.picks.push({ id: pick.id, wantId, wantFavorKind: wantFavor ? wantFavor.kind : null, stage: (c.want && c.want.stage) || 0 });
        if (wantId === 'ask_favor' && wantFavor && JOINT.has(wantFavor.kind)) rec.askFavorOffered = true;
        r = Game.convoTurn(vid, pick.id);
        // R274 WARN-HEED DEEPEN (instrument-only): record the line
        // returned for a dlg:heed / dlg:details press. The warnLog
        // wrap only sees convoWantWarning deliveries — the 4th+ heed
        // deepens through a different pool (convo-dialogue.js
        // dlg:heed:deepen, 5 lines) that never calls convoWantWarning,
        // so a deepened warning was invisible to the watch (r274 panel:
        // Victor 109001 d36, heed 4, "...I keep seeing it. Whatever it
        // was, out past the treeline..."). Read-only recording; the
        // analyzer names a sitting via its heed line when warnLog has
        // no same-day delivery. No RNG, no behavior change.
        if (pick.id === 'dlg:heed' || pick.id === 'dlg:details') {
          (rec.heedLines = rec.heedLines || []).push({ pick: pick.id, line: r && r.line ? String(r.line).slice(0, 400) : null });
        }
        if (pick.id === 'dlg:commit') {
          const f = ((Game.state.village || {}).favorLedger || {})[vid] || null;
          const p = ((Game.state.village || {}).promises || {})[vid] || null;
          rec.result = (f && f.state === 'promised' && p && p.favorId === f.id) ? 'committed' : 'refused';
          rec.commitLine = r && r.line ? String(r.line).slice(0, 300) : null;
          rec.meetDay = f ? (f.meetDay ?? null) : null;
          break;
        }
        if (pick.id === 'dlg:favor_action') { rec.result = 'favor-action'; rec.actionLine = r && r.line ? String(r.line).slice(0, 200) : null; break; }
        if (pick.id === 'dlg:favor_cancel') { rec.result = 'favor-cancel'; rec.actionLine = r && r.line ? String(r.line).slice(0, 300) : null; break; }
        if (r && r.ended) break;
      }
    } catch (e) { rec.result = 'error'; rec.error = String(e && e.message).slice(0, 200); }
    try { if (Game.endConvo) Game.endConvo(vid, 'done'); } catch (e) {}
    // R230 Q1 TRACE (end): what resolve() left behind — the follow-up
    // seed (planted? contentless? deleted?) and the ledger favor now.
    try { rec.traceEnd = { seedAfter: snapSeed230(vid), ledgerFavorAfter: snapFavor246(vid) }; } catch (e) {}
    wedgeSits.push(rec);
    return rec;
  }
  // R84 travel-out wedge helpers. All state changes are honest player
  // verbs (door verbs, travelTo on offered targets, microMove, convo
  // favor_action presses). forageFavorAction status calls are read-only.
  function runSnap84(vid) {
    try {
      const f = ((Game.state.village || {}).favorLedger || {})[vid];
      const p = ((Game.state.village || {}).promises || {})[vid];
      if (!f || !f.forageRun) return null;
      const r = f.forageRun;
      return { forageCount: r.forageCount || 0,
        playerKcal: (r.playerHaul || []).reduce((t, it) => t + (it.kcalEach || 0) * (it.units || 1), 0),
        partnerKcal: (r.partnerHaul || []).reduce((t, it) => t + (it.kcalEach || 0) * (it.units || 1), 0),
        returned: !!r.returned, deliveredKcal: r.deliveredKcal || 0,
        state: f.state, promiseKept: p ? (p.kept ?? null) : null };
    } catch (e) { return null; }
  }
  function favorStatus84(vid) {
    try {
      const f = ((Game.state.village || {}).favorLedger || {})[vid];
      if (!f || typeof Game.forageFavorAction !== 'function') return null;
      const s = Game.forageFavorAction(vid, f, false);
      return s ? { ready: !!s.ready, action: s.action || null, reason: s.reason ? String(s.reason).slice(0, 200) : null, label: s.label || null } : null;
    } catch (e) { return { ready: false, action: null, reason: 'status-error: ' + String(e && e.message).slice(0, 120) }; }
  }
  function favorStatusEnd84(vid) {
    // R137: the ENDING branch of the same read-only status call — ready
    // means the menu will offer dlg:favor_cancel for this live run.
    try {
      const f = ((Game.state.village || {}).favorLedger || {})[vid];
      if (!f || typeof Game.forageFavorAction !== 'function') return null;
      const s = Game.forageFavorAction(vid, f, true);
      return s ? { ready: !!s.ready, action: s.action || null, reason: s.reason ? String(s.reason).slice(0, 200) : null, label: s.label || null } : null;
    } catch (e) { return { ready: false, action: null, reason: 'status-error: ' + String(e && e.message).slice(0, 120) }; }
  }
  function trustOf84(vid) {
    try { const t = ((Game.state.village || {}).trust || {})[vid]; return (t === undefined || t === null) ? null : t; } catch (e) { return null; }
  }
  // R137 END WEDGE: close a BROKEN live forage run with the honest end.
  // Deliver-first already ran (haul > 0 closes via forage_deliver), so
  // this handles the 0-haul (or otherwise undeliverable) broken run:
  // travel home, check the ending status, sit mode 'end' and press
  // dlg:favor_cancel IF OFFERED. Trust is read before/after the press:
  // renounce is skipped for an already-broken promise, so trust must
  // not move — a drop trips the hard guard (endDisabled) for the rest
  // of this seed. Never presses cancel on an unbroken run; never
  // presses cancel away from home (ending is not ready there).
  function endWedge84(live, rec) {
    const vid = live.vid;
    const end = { day: nowDay(Game), vid: String(vid), name: live.name, kind: live.kind,
      preRun: rec.preRun || null, preTrust: trustOf84(vid), homeHops: null, endStatus: null,
      sitResult: null, sitActionLine: null, postTrust: null, postRun: null, outcome: null };
    rec.end = end;
    try {
      if (endDisabled) { end.outcome = 'end-disabled-after-trust-drop'; rec.outcome = end.outcome; endLog.push(end); travelOutLog.push(rec); return; }
      const home = homePoint83();
      if (!(Game.map.px === home.x && Game.map.py === home.y)) {
        end.homeHops = travelHome84();
        if (!end.homeHops.atHome) { end.outcome = 'end-stranded'; rec.outcome = end.outcome; endLog.push(end); travelOutLog.push(rec); return; }
      } else end.homeHops = { atHome: true, hops: [] };
      // Haul may have appeared since the pre-status (it cannot — haul
      // only changes via presses — but re-checking costs nothing and
      // keeps deliver the better verb whenever it is offered).
      const stNow = favorStatus84(vid);
      if (stNow && stNow.ready && stNow.action === 'forage_deliver') {
        const dRec = sit(vid, 'work');
        end.sitResult = dRec.result; end.sitActionLine = dRec.actionLine || null;
        end.pagesTurned = dRec.pagesTurned || 0; end.menuPages = (dRec.menuPages != null) ? dRec.menuPages : null;
        end.postRun = runSnap84(vid); end.postTrust = trustOf84(vid);
        end.outcome = (end.postRun && end.postRun.returned) ? 'end-via-deliver' : 'end-deliver-sit-no-return';
        rec.outcome = end.outcome; endLog.push(end); travelOutLog.push(rec); return;
      }
      let es = favorStatusEnd84(vid);
      end.endStatus = es;
      // PILOT FIX (991): the ending branch shares the adjacency check —
      // a door-split partner (one side in, one out) blocks ending even
      // at home. The work wedge already recovers this with
      // ensureAdjacent84; the end-wedge does the same before giving up.
      if ((!es || !es.ready) && es && /door|next to your partner|same side/i.test(es.reason || '')) {
        ensureAdjacent84(vid, end);
        es = favorStatusEnd84(vid);
        end.endStatusAfterAdj = es;
      }
      if (!es || !es.ready || es.action !== 'forage_end') {
        end.outcome = 'end-not-ready:' + ((es && es.reason) ? es.reason.slice(0, 120) : 'no-status');
        rec.outcome = end.outcome; endLog.push(end); travelOutLog.push(rec); return;
      }
      const sitRec = sit(vid, 'end');
      end.sitResult = sitRec.result; end.sitActionLine = sitRec.actionLine || null;
      end.pagesTurned = sitRec.pagesTurned || 0; end.menuPages = (sitRec.menuPages != null) ? sitRec.menuPages : null;
      if (sitRec.result === 'end-cancel-not-offered') end.offeredIds = sitRec.offeredIds || null;
      end.postRun = runSnap84(vid); end.postTrust = trustOf84(vid);
      if (end.preTrust !== null && end.postTrust !== null && end.postTrust < end.preTrust) {
        endDisabled = true;
        end.outcome = 'end-trust-drop:' + end.preTrust + '->' + end.postTrust;
        rec.outcome = end.outcome; endLog.push(end); travelOutLog.push(rec); return;
      }
      end.outcome = (end.postRun && end.postRun.returned) ? 'ended' : 'end-press-no-return';
      rec.outcome = end.outcome; endLog.push(end); travelOutLog.push(rec); return;
    } catch (e) {
      end.error = String(e && e.message).slice(0, 200);
      try { if (end.homeHops && !end.homeHops.atHome) end.homeHops = travelHome84(); } catch (e2) {}
      end.outcome = 'end-wedge-error';
      rec.outcome = end.outcome; endLog.push(end); travelOutLog.push(rec);
    }
  }
  function walkToPartnerNoGate84(vid) {
    // Same greedy tap-walk as walkToPartner84 but without the dayPart-0
    // stop: working an outing is daytime play, not a dawn appointment.
    const rec = { steps: 0, squares: [], finalDist: null, stoppedReason: null };
    const visited = new Set();
    try {
      const s0 = Game.state.scholar || {};
      visited.add((s0.mx ?? 4) + ',' + (s0.my ?? 4));
      const DELTAS = [[-1, -1], [1, -1], [-1, 1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]];
      for (let step = 0; step < 20; step++) {
        if (Game.over) { rec.stoppedReason = 'game-over'; break; }
        const st = doorState83(vid);
        if (!st.partnerPos) { rec.stoppedReason = 'partner-pos-null'; break; }
        const dist = cheby83(st.playerPos, st.partnerPos);
        rec.finalDist = dist;
        if (dist <= 1) { rec.stoppedReason = 'adjacent'; break; }
        const cands = [];
        for (let i = 0; i < DELTAS.length; i++) {
          const cx = st.playerPos.mx + DELTAS[i][0], cy = st.playerPos.my + DELTAS[i][1];
          if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
          if (visited.has(cx + ',' + cy)) continue;
          cands.push({ cx, cy, d: Math.max(Math.abs(cx - st.partnerPos.mx), Math.abs(cy - st.partnerPos.my)), order: i });
        }
        cands.sort((a, b) => (a.d - b.d) || (a.order - b.order));
        let moved = false;
        for (const c of cands) {
          let ok = false;
          try { ok = !!Game.microMove(c.cx, c.cy); } catch (e) { ok = false; }
          if (ok) { visited.add(c.cx + ',' + c.cy); rec.steps++; rec.squares.push([c.cx, c.cy]); moved = true; break; }
        }
        if (!moved) { rec.stoppedReason = 'no-progress'; break; }
      }
      if (!rec.stoppedReason) rec.stoppedReason = 'step-cap';
      const stEnd = doorState83(vid);
      if (stEnd.partnerPos && stEnd.playerPos.mx !== null) rec.finalDist = cheby83(stEnd.playerPos, stEnd.partnerPos);
    } catch (e) { rec.stoppedReason = 'error'; rec.error = String(e && e.message).slice(0, 200); }
    return rec;
  }
  function ensureAdjacent84(vid, rec) {
    // Door + walk until the favor status stops naming a door/adjacency
    // block, or no progress. Returns the final status.
    let status = favorStatus84(vid);
    for (let attempt = 0; attempt < 3 && status && !status.ready; attempt++) {
      const reason = status.reason || '';
      if (!/door|next to your partner|same side/i.test(reason)) break;
      const st = doorState83(vid);
      let acted = false;
      if (st.playerAtHaven && st.partnerAtHavenNode && st.playerInside !== null && st.partnerInside !== null && st.playerInside !== st.partnerInside) {
        try {
          if (st.partnerInside && !st.playerInside) { rec.doorVerbs = rec.doorVerbs || []; rec.doorVerbs.push({ verb: 'enterBuilding', ok: !!Game.enterBuilding() }); acted = true; }
          else if (!st.partnerInside && st.playerInside) { rec.doorVerbs = rec.doorVerbs || []; rec.doorVerbs.push({ verb: 'exitBuilding', ok: !!Game.exitBuilding() }); acted = true; }
        } catch (e) { rec.doorError = String(e && e.message).slice(0, 200); }
      }
      const walk = walkToPartnerNoGate84(vid);
      rec.walks = rec.walks || []; rec.walks.push(walk);
      if (!acted && walk.steps === 0 && walk.stoppedReason !== 'adjacent') break;
      status = favorStatus84(vid);
    }
    return status;
  }
  // R137: superseded — travelHome84 now walks home with Game.walkHome
  // and clears blockages with Game.clearBlockage. Retained for reference
  // (the r85/r136 hop shape) and unused.
  function travelStep84(goalX, goalY) {
    // One honest hop toward (goalX,goalY) on an offered travelTarget.
    try {
      const targets = Game.travelTargets ? (Game.travelTargets() || []) : [];
      if (!targets.length) return { ok: false, reason: 'no-targets' };
      const cur = { x: Game.map.px, y: Game.map.py };
      if (cur.x === goalX && cur.y === goalY) return { ok: false, reason: 'already-there' };
      let best = null;
      for (const t of targets) {
        const d = Math.abs(t.x - goalX) + Math.abs(t.y - goalY);
        if (!best || d < best.d) best = { x: t.x, y: t.y, d };
      }
      if (!best) return { ok: false, reason: 'no-target' };
      const before = Game.map.px + ',' + Game.map.py;
      let res = null;
      try { res = Game.travelTo(best.x, best.y); } catch (e) { return { ok: false, reason: 'travel-error: ' + String(e && e.message).slice(0, 120) }; }
      const after = Game.map.px + ',' + Game.map.py;
      return { ok: before !== after, to: [best.x, best.y], res: res ? String(res.blockType || 'ok') : 'null' };
    } catch (e) { return { ok: false, reason: 'travel-error: ' + String(e && e.message).slice(0, 120) }; }
  }
  function travelHome84() {
    // R137 CLEAR-HOME (the r136 next blank, Pablo/Hiroshi): walkHome-first
    // with clear-and-retry. Game.walkHome is the compass's way home as an
    // action — one tile at a time through travelTo, longer axis first,
    // then the other, then a perpendicular sidestep — and it stops
    // honestly with blocked {kind, blockType, x, y} named when every
    // escape is refused. Game.clearBlockage is the honest player verb
    // for a clearable blockage (fallen_tree: cut, +2 wood; rubble:
    // clear, +stone; washed_out: bridge if wood >= 4, else scramble).
    // A creek is NOT clearable by hand — the wedge stops honestly and
    // records it, never loops on it. Cap 3 clears per call: a fourth
    // distinct blockage in one dawn means stop and report, not grind.
    // hops: [] is kept for shape compatibility with r85/r137 readers
    // (only atHome was ever read); walks/clears/blocked carry the new
    // evidence. No behavior change on an open path (walkHome reaches
    // home, 0 clears).
    const home = homePoint83();
    const rec = { atHome: false, hops: [], walks: [], clears: [], blocked: null };
    const CLEARABLE = { fallen_tree: 1, rubble: 1, washed_out: 1 };
    for (let attempt = 0; attempt < 4; attempt++) {
      if (Game.over) break;
      if (Game.map.px === home.x && Game.map.py === home.y) break;
      let w = null;
      try { w = (typeof Game.walkHome === 'function') ? Game.walkHome(12) : null; } catch (e) { w = { error: String(e && e.message).slice(0, 120) }; }
      rec.walks.push(w);
      if (w && w.reached) break;
      // R240: the stopping block (first homeward refusal) may be an
      // un-clearable creek met on a sidestep while a clearable tree
      // blocks the direct route (or a detour). Prefer the first
      // clearable refusal for the clear decision; fall back to the
      // stopping block. rec.blocked keeps the stopping block itself
      // (the analyzer's travel-branch read).
      rec.blocked = w && w.blocked ? w.blocked : null;
      const blocked = (w && w.clearableBlocked) ? w.clearableBlocked : rec.blocked;
      if (!blocked || !CLEARABLE[blocked.blockType]) break;
      let ok = false;
      try { ok = !!Game.clearBlockage(blocked.x, blocked.y); } catch (e) { ok = false; rec.clearError = String(e && e.message).slice(0, 120); }
      rec.clears.push({ type: blocked.blockType, x: blocked.x, y: blocked.y, ok });
      if (!ok) break;
    }
    rec.atHome = (Game.map.px === home.x && Game.map.py === home.y);
    return rec;
  }
  function wedgeTravelOut(live) {
    const vid = live.vid;
    const rec = { day: nowDay(Game), vid: String(vid), name: live.name, kind: live.kind,
      pre: null, preRun: null, preStatus: null, doorVerbs: null, walks: null, outHops: [],
      press: null, homeHops: null, deliver: null, post: null, outcome: null, moved: false };
    try {
      rec.pre = doorState83(vid);
      rec.preRun = runSnap84(vid);
      // R138 belt-and-braces: a run that became previous-bearer after
      // wedgeDawn's check (succession mid-dawn) is stranded, not
      // worked — no travel, no press, no end attempt.
      const favGuard139 = ((Game.state.village || {}).favorLedger || {})[vid];
      const strandedGuard139 = prevBearerRunOf(Game, favGuard139);
      if (strandedGuard139) {
        rec.outcome = 'prev-bearer-stranded';
        rec.stranded = strandedGuard139;
        travelOutLog.push(rec); return;
      }
      let status = favorStatus84(vid);
      rec.preStatus = status;
      if (!status) { rec.outcome = 'no-status'; travelOutLog.push(rec); return; }
      if (status.action === 'forage_deliver') {
        const sitRec = sit(vid, 'work');
        rec.deliver = { sitResult: sitRec.result, actionLine: sitRec.actionLine || null };
        rec.post = runSnap84(vid);
        rec.outcome = (rec.post && rec.post.returned) ? 'delivered-at-home' : 'deliver-sit-no-return';
        travelOutLog.push(rec); return;
      }
      // R137 END WEDGE (replaces the r84 skip): a broken promise can
      // never become kept, but the live run still blocks every later
      // departure until it is closed. Ending a BROKEN run is not
      // canceling a live promise — the word is already broken and its
      // price already paid — so the wedge closes it with the honest
      // end (deliver if haul > 0, else dlg:favor_cancel at home).
      // A broken run WITH haul still takes the deliver-first branch
      // above; this branch only fires when deliver was not offered.
      const favNow = ((Game.state.village || {}).favorLedger || {})[vid];
      if (favNow && (favNow.state === 'broken' || (rec.preRun && rec.preRun.promiseKept === 'broken'))) {
        endWedge84(live, rec);
        return;
      }
      // Hard blocks no travel can fix: event/fight, partner gone, deadline.
      if (!status.ready && /current event|finish the fight|no longer available|deadline has passed/i.test(status.reason || '')) {
        rec.outcome = 'blocked:' + (status.reason || '').slice(0, 120);
        travelOutLog.push(rec); return;
      }
      if (!status.ready || status.action !== 'forage_together') status = ensureAdjacent84(vid, rec);
      rec.afterAdjStatus = status;
      const home = homePoint83();
      const atHome = (Game.map.px === home.x && Game.map.py === home.y);
      if ((!status || !status.ready || status.action !== 'forage_together') && atHome) {
        const st0 = doorState83(vid);
        if (st0.playerInside) { try { rec.exitOk = !!Game.exitBuilding(); } catch (e) { rec.exitError = String(e && e.message).slice(0, 200); } }
        try {
          const targets = Game.travelTargets ? (Game.travelTargets() || []) : [];
          const out = targets.find(t => !(t.x === home.x && t.y === home.y));
          if (out) {
            const before = Game.map.px + ',' + Game.map.py;
            let res = null;
            try { res = Game.travelTo(out.x, out.y); } catch (e) { rec.outError = String(e && e.message).slice(0, 200); }
            const moved = before !== (Game.map.px + ',' + Game.map.py);
            rec.outHops.push({ to: [out.x, out.y], moved, res: res ? String(res.blockType || 'ok') : 'null' });
            if (moved) rec.moved = true;
          } else rec.outHops.push({ to: null, moved: false, res: 'no-out-target' });
        } catch (e) { rec.outError = String(e && e.message).slice(0, 200); }
        status = ensureAdjacent84(vid, rec);
        rec.afterOutStatus = status;
        let tries = 0;
        while (status && !status.ready && /nothing left to take here/i.test(status.reason || '') && tries < 2 && !Game.over) {
          tries++;
          let stepped = null;
          try {
            const cur = { x: Game.map.px, y: Game.map.py };
            const targets = Game.travelTargets ? (Game.travelTargets() || []) : [];
            const alt = targets.find(t => !(t.x === cur.x && t.y === cur.y) && !(t.x === home.x && t.y === home.y));
            if (alt) {
              const before = Game.map.px + ',' + Game.map.py;
              try { Game.travelTo(alt.x, alt.y); } catch (e) {}
              stepped = { to: [alt.x, alt.y], moved: before !== (Game.map.px + ',' + Game.map.py) };
              if (stepped.moved) rec.moved = true;
            }
          } catch (e) { stepped = { error: String(e && e.message).slice(0, 120) }; }
          rec.outHops.push(stepped);
          if (!stepped || !stepped.moved) break;
          status = ensureAdjacent84(vid, rec);
        }
        rec.afterRetriesStatus = status;
      } else if ((!status || !status.ready || status.action !== 'forage_together') && !atHome) {
        status = ensureAdjacent84(vid, rec);
        rec.afterOutStatus = status;
      }
      // PILOT FIX (991): a ready status is NOT a guarantee — the press
      // itself can fail on a bare patch ("Nothing came of that press"),
      // and the old code counted that failed press as work and then
      // re-tried the SAME first target every dawn (991: 29 failed
      // presses, 0 food). The game's own line says to walk to another
      // green patch, so a failed press rotates to the next untried
      // non-home target (up to 8 patches this dawn). VERIFICATION FIX
      // (991 rerun): a press can also "succeed" with ZERO edible food
      // ("wood and green we cannot name yet" — unknown plants split
      // nothing), which the first fix counted as work. Success is
      // judged by EDIBLE kcal increasing, never by forageCount or the
      // sit result alone. Pack-full failures do not rotate (another
      // patch cannot fix them).
      const dawnStartEdible = (rec.preRun ? (rec.preRun.playerKcal + rec.preRun.partnerKcal) : 0);
      const triedNodes = new Set([Game.map.px + ',' + Game.map.py]);
      let pressedOk = false;
      for (let attempt = 0; attempt < 8 && !Game.over; attempt++) {
        if (!(status && status.ready && status.action === 'forage_together')) break;
        const sitRec = sit(vid, 'work');
        rec.pressAttempts = rec.pressAttempts || [];
        rec.pressAttempts.push({ node: [Game.map.px, Game.map.py], sitResult: sitRec.result, actionLine: sitRec.actionLine || null });
        const snap = runSnap84(vid);
        const snapEdible = snap ? (snap.playerKcal + snap.partnerKcal) : 0;
        rec.pressAttempts[rec.pressAttempts.length - 1].edibleKcal = snapEdible;
        if (sitRec.result === 'favor-action' && snap && snapEdible > dawnStartEdible) {
          pressedOk = true;
          rec.press = rec.pressAttempts[rec.pressAttempts.length - 1];
          rec.postPress = snap;
          break;
        }
        rec.lastPressFail = sitRec.actionLine || null;
        if (/pack is full/i.test(sitRec.actionLine || '')) break;
        let stepped = null;
        try {
          const targets = Game.travelTargets ? (Game.travelTargets() || []) : [];
          const alt = targets.find(t => !(t.x === home.x && t.y === home.y) && !triedNodes.has(t.x + ',' + t.y));
          if (alt) {
            const before = Game.map.px + ',' + Game.map.py;
            try { Game.travelTo(alt.x, alt.y); } catch (e) {}
            stepped = { to: [alt.x, alt.y], moved: before !== (Game.map.px + ',' + Game.map.py) };
            if (stepped.moved) { rec.moved = true; triedNodes.add(alt.x + ',' + alt.y); rec.outHops.push(stepped); }
          }
        } catch (e) { stepped = { error: String(e && e.message).slice(0, 120) }; }
        if (!stepped || !stepped.moved) break;
        status = ensureAdjacent84(vid, rec);
        rec.afterRetryStatus = status;
      }
      if (pressedOk) {
        rec.homeHops = travelHome84();
        if (rec.homeHops.atHome) {
          const stH = ensureAdjacent84(vid, rec);
          rec.homeStatus = stH;
          if (stH && stH.ready && stH.action === 'forage_deliver') {
            const dRec = sit(vid, 'work');
            rec.deliver = { sitResult: dRec.result, actionLine: dRec.actionLine || null };
          }
        }
        rec.post = runSnap84(vid);
        rec.outcome = (rec.post && rec.post.returned)
          ? (rec.post.promiseKept === true ? 'worked-and-delivered-kept' : 'worked-and-delivered-missed')
          : 'pressed-not-delivered';
        travelOutLog.push(rec); return;
      }
      if (rec.moved) rec.homeHops = travelHome84();
      rec.post = runSnap84(vid);
      rec.outcome = 'unworked:' + ((rec.lastPressFail || (status && status.reason)) ? (rec.lastPressFail || status.reason).slice(0, 120) : 'no-status');
      travelOutLog.push(rec); return;
    } catch (e) {
      rec.error = String(e && e.message).slice(0, 200);
      try { if (rec.moved) rec.homeHops = travelHome84(); } catch (e2) {}
      rec.outcome = 'wedge-error';
      travelOutLog.push(rec);
    }
  }
  function wedgeDawn() {
    if (Game.over) return;
    try {
      const jl = jointLedger();
      // R138 STRANDED: a previous-bearer live run can never be worked
      // or ended by the successor — record it and fall through to the
      // normal no-live path (promised sits, then accept sits) instead
      // of letting the live-branch early return freeze social play
      // for the rest of the run (r137 seed 2802: 18 dawns, 0 commits).
      // A stranded run never counts as the live run to work: the
      // wedge works the first NON-stranded live run, if any.
      const stranded139 = jl.filter(j => j.live && j.stranded);
      for (const s of stranded139) {
        const key139 = String(s.vid) + ':' + s.kind;
        const firstSeen139 = !strandedSeen139.has(key139);
        if (firstSeen139) strandedSeen139.add(key139);
        let bearerDead139 = false;
        try { const bp = Game.getPerson ? Game.getPerson(s.strandedBearer) : null; bearerDead139 = !bp || !!bp.dead || !((Game.state.village || {}).roster || []).includes(s.strandedBearer); } catch (e) {}
        strandedLog.push({ day: nowDay(Game), vid: String(s.vid), name: s.name, kind: s.kind,
          bearer: s.strandedBearer, bearerName: s.strandedBearerName, firstSeen: firstSeen139,
          bearerDead: bearerDead139,
          promisedBlocked: !!jl.find(j => j.promised),
          reason: bearerDead139 ? 'previous bearer ' + String(s.strandedBearer) + ' is dead; the run can be ended by the successor (r265 BEARER-END)' : 'previous bearer: run bearer ' + String(s.strandedBearer) + ' is not the current villager; the run can neither be worked nor ended' });
      }
      // R265 BEARER-END: a stranded run whose bearer is DEAD can now
      // be closed (the r265 fix) — route the first such run to the
      // honest end instead of skipping it. A competent player who
      // learns the run can now be closed closes it. endWedge84 checks
      // the ending status (ready only when the bearer is dead/gone),
      // travels home, and presses dlg:favor_cancel. A living-bearer
      // stranded run is still skipped and logged exactly as r247.
      // One close per dawn (the wedge works one run per dawn).
      for (const s of stranded139) {
        let bearerDead265 = false;
        try { const bp = Game.getPerson ? Game.getPerson(s.strandedBearer) : null; bearerDead265 = !bp || !!bp.dead || !((Game.state.village || {}).roster || []).includes(s.strandedBearer); } catch (e) {}
        if (!bearerDead265) continue;
        if (s.kind !== 'forage_help') continue; // water end-wedge is a follow-up blank (r137 note) — forage only
        const rec = { day: nowDay(Game), vid: String(s.vid), name: s.name, kind: s.kind,
          pre: null, preRun: null, preStatus: null, doorVerbs: null, walks: null, outHops: [],
          press: null, homeHops: null, deliver: null, post: null, outcome: null, moved: false, strandedClose: true };
        try { rec.preRun = runSnap84(s.vid); } catch (e) {}
        endWedge84({ vid: String(s.vid), name: s.name, kind: s.kind }, rec);
        return;
      }
      const live = jl.find(j => j.live && !j.stranded);
      // R137 instruments (every dawn, before any wedge action): jam-days
      // — a promised run exists while a broken-live run is live (the
      // r84 poison) — and broken-live water dawns (report-only; a water
      // end-wedge is a follow-up blank, not this run).
      const brokenLiveJ = jl.find(j => j.live && (j.state === 'broken' || j.promiseKept === 'broken'));
      const promisedJ = jl.find(j => j.promised);
      if (brokenLiveJ && promisedJ && String(brokenLiveJ.vid) !== String(promisedJ.vid)) jamLog.push({ day: nowDay(Game), promisedVid: String(promisedJ.vid), promisedName: promisedJ.name, brokenVid: String(brokenLiveJ.vid), brokenName: brokenLiveJ.name, kind: brokenLiveJ.kind });
      if (jl.some(j => j.live && j.kind === 'water_haul' && (j.state === 'broken' || j.promiseKept === 'broken'))) brokenWaterDawns++;
      if (live) {
        // R139: no pilot-break hold (the r210 pilot gate is the spotter
        // instruments firing, not a forced break) — a live run is
        // worked the same dawn it is found.
        if (live.kind === 'forage_help') wedgeTravelOut(live);
        else { sit(live.vid, 'work'); travelOutLog.push({ day: nowDay(Game), vid: String(live.vid), name: live.name, kind: live.kind, outcome: 'skipped-water-kind' }); }
        return;
      }
      // R84 door-walk probe: a promised favor at dawn gets the door +
      // walk recovery attempt BEFORE the manual start sit. The dawn
      // signal itself says "Talk to them before you leave today" and
      // the dawn note names the door — so a real player walks through
      // it. The start sit still runs whatever the probe finds, so the
      // r82 baseline sit evidence is preserved.
      const promised = jl.find(j => j.promised);
      if (promised) {
        const probe = { day: nowDay(Game), vid: String(promised.vid), name: promised.name, kind: promised.kind, pre: null, dawnNote: null, doorVerb: null, doorVerbOk: null, postDoor: null, walk: null, postWalk: null, skippedReason: null, sitResult: null, sitActionLine: null, departed: null };
        try {
          probe.pre = doorState83(promised.vid);
          const fav = ((Game.state.village || {}).favorLedger || {})[promised.vid];
          probe.dawnNote = (fav && fav.outingAttempts && fav.outingAttempts.length) ? fav.outingAttempts[fav.outingAttempts.length - 1] : null;
          const pre = probe.pre;
          const todayNote = !!(probe.dawnNote && probe.dawnNote.day === nowDay(Game) && probe.dawnNote.outcome === 'noted');
          if (!todayNote) probe.skippedReason = 'no-dawn-note-today';
          else if (Game.dayPart !== 0) probe.skippedReason = 'not-daypart-0';
          else if (!pre.playerAtHaven) probe.skippedReason = 'player-away';
          else if (!pre.partnerAtHavenNode) probe.skippedReason = 'partner-not-at-haven';
          else if (pre.playerInside === pre.partnerInside) probe.skippedReason = 'same-side';
          else if (pre.playerInside === null || pre.partnerInside === null) probe.skippedReason = 'inside-unknown';
          else {
            try {
              if (pre.partnerInside && !pre.playerInside) { probe.doorVerb = 'enterBuilding'; probe.doorVerbOk = !!Game.enterBuilding(); }
              else if (!pre.partnerInside && pre.playerInside) { probe.doorVerb = 'exitBuilding'; probe.doorVerbOk = !!Game.exitBuilding(); }
            } catch (e) { probe.doorError = String(e && e.message).slice(0, 200); }
            probe.postDoor = doorState83(promised.vid);
            const pd = probe.postDoor;
            if (pd.partnerPos && pd.playerPos.mx !== null && pd.playerPos.my !== null) {
              const d0 = cheby83(pd.playerPos, pd.partnerPos);
              probe.walk = (d0 > 1) ? walkToPartner84(promised.vid) : { steps: 0, squares: [], finalDist: d0, dayPartStart: Game.dayPart ?? null, dayPartEnd: Game.dayPart ?? null, stoppedReason: 'already-adjacent' };
            } else probe.walk = { steps: 0, squares: [], finalDist: null, stoppedReason: 'partner-pos-null' };
            probe.postWalk = doorState83(promised.vid);
          }
        } catch (e) { probe.error = String(e && e.message).slice(0, 200); }
        const sitRec = sit(promised.vid, 'start');
        probe.sitResult = sitRec.result; probe.sitActionLine = sitRec.actionLine || null;
        try { const jlAfter = jointLedger(); const after = jlAfter.find(j => String(j.vid) === String(promised.vid)); probe.departed = !!(after && after.live); } catch (e) { probe.departed = null; }
        doorWalkLog.push(probe);
        return;
      }
      const v = Game.state.village || {};
      const cands = (v.roster || []).filter(id => String(id) !== String(Game.villagerId) && !isDead(Game, id));
      // R84 rotation fix (pilot finding): the r82 "fresh-first" pool never
      // cleared satSet, so after cycle 1 it sat roster-head forever
      // (981: Jorge 36 + DeShawn 32 of 83 sits; Nikos, the only joint
      // asker, sat once). Round-robin through the living roster instead:
      // 2 per dawn, cursor advancing, so every villager is sampled.
      const picked = [];
      for (let i = 0; i < Math.min(2, cands.length); i++) picked.push(cands[(sitCursor + i) % cands.length]);
      if (picked.length) sitCursor = (sitCursor + picked.length) % cands.length;
      for (const vid of picked) {
        const rec = sit(vid, 'accept');
        if (rec.result === 'committed') break;
      }
    } catch (e) { warnOnce('wedge', e); }
  }

  const daily = [];
  // R268 DAY-PHASE LOG (the r265 metric review §3 clock-jitter
  // diagnostic): per loop day, the game day read at four phase
  // boundaries — loop start, after the 3 action parts, after
  // policy.daily, after Game.sleep(). Read-only nowDay() reads; the
  // game calls are the loop's own. The analyzer joins each dayDesync
  // event to the phase whose before/after straddles the jump, so a
  // repeat names the phase that advanced nothing and a skip names
  // the phase that advanced twice.
  const dayPhaseLog = [];
  const dawnOpps = [];
  const dawnLedgers = [];
  let startCensus = null;
  try {
    const v0 = Game.state.village || {};
    startCensus = (v0.roster || []).map(id => ({ id: String(id), name: nameOf(Game, id) }));
  } catch (e) { startCensus = null; }
  let deadTail = 0;
  // R231 ROSTER-DEPARTURE instrument (r225 anomaly, recurred r230:
  // seeds 101101/101301 each lost two villagers with NO death record).
  // Every dawn, any roster id that vanished since the previous dawn is
  // a departure: record day, name (start-census map), and whether the
  // person record still reads dead at that moment. The analyzer
  // reconciles start - end roster - villager deaths against this log.
  const rosterDepartures = [];
  // R265 SILENT-ARRIVAL (r246 metric review §11): the mirror of the
  // r231 departure diff — any id in today's roster not in yesterday's
  // is logged with the day it appeared, so a stranger joining is dated
  // at the source instead of found by census-diff at the end.
  const rosterArrivals = [];
  // R240: per-dawn scholar location (see the scholarDawns push in the
  // daily loop) — read-only instrument for the scholar-death watch.
  const scholarDawns = [];
  // R265 SPOTTER-TENURE (r246 metric review §1): per-dawn last-seen
  // spotter XP per scholar; a tenure closes when the scholar changes,
  // with the outgoing scholar's last-seen XP. The analyzer's cumulative
  // second number sums tenure-end XP, so a turnover seed isn't read as
  // a no-knowledge seed. Read-only getPerson reads; no game call.
  const spotterTenure = [];
  const spotterLastSeen = {};
  let prevScholarId = null;
  // R242 Q5 REVISION (r241-owed): per-dawn betrayal-case snapshot, so
  // the analyzer can tell whether a case naming an exiled person as
  // accused was ever open, and whether a held sitting fell inside a
  // case's open window (case-thread-held proxy). Read-only: cases are
  // few, snapshot is a plain data copy, no game call is made.
  const caseLog = [];
  const nameById = Object.fromEntries((startCensus || []).map(x => [String(x.id), x.name]));
  let prevRosterIds = new Set((startCensus || []).map(x => String(x.id)));
  for (let d = 1; d <= DAYS; d++) {
    // R268 day-phase read: game day at loop start (the day the loop
    // entered with — the previous sleep's afterSleepDay, or the
    // start day on d=1).
    let phaseStart = null; try { phaseStart = nowDay(Game); } catch (e) {}
    for (let p = 0; p < 3; p++) {
      if (policy.upkeep) { try { policy.upkeep(Game, ctx); } catch (e) { warnOnce('upkeep', e); } }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('fights', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('contests', e); }
      if (Game.over) break;
      try { Game.doAction('wait'); } catch (e) { warnOnce('wait', e); }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('fights2', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('contests2', e); }
      if (Game.over) break;
    }
    if (Game.over) break;
    let phaseAfterParts = null; try { phaseAfterParts = nowDay(Game); } catch (e) {}
    if (policy.daily) { try { policy.daily(Game, ctx); } catch (e) { warnOnce('daily', e); } }
    let phaseAfterDaily = null; try { phaseAfterDaily = nowDay(Game); } catch (e) {}
    try { Game.sleep(); } catch (e) { warnOnce('sleep', e); }
    let phaseAfterSleep = null; try { phaseAfterSleep = nowDay(Game); } catch (e) {}
    // R271 SLEEP-RETRY (r268 follow-up #1, driver policy only): the
    // r268 diagnostic proved the −1 drift is a driver artifact —
    // sleep refused honestly at the wrong clock position and the
    // driver never retried. If the first sleep did not advance the
    // day, wait once (advance the clock) and sleep a second time.
    // One retry only; a second refusal is left for the next loop
    // day exactly as before. The outcome is recorded on the
    // dayPhaseLog entry so the analyzer can tell whether retries
    // shrink the repeat+skip pairs.
    let sleepRetry = { tried: false, advanced: false };
    if (phaseAfterSleep !== null && phaseAfterDaily !== null && phaseAfterSleep === phaseAfterDaily) {
      sleepRetry.tried = true;
      try { Game.doAction('wait'); } catch (e) { warnOnce('sleepRetryWait', e); }
      try { Game.sleep(); } catch (e) { warnOnce('sleepRetry', e); }
      let phaseAfterRetry = null; try { phaseAfterRetry = nowDay(Game); } catch (e) {}
      sleepRetry.advanced = (phaseAfterRetry !== null && phaseAfterRetry !== phaseAfterDaily);
      if (phaseAfterRetry !== null) phaseAfterSleep = phaseAfterRetry;
    }
    dayPhaseLog.push({ loopDay: d, startDay: phaseStart, afterPartsDay: phaseAfterParts, afterDailyDay: phaseAfterDaily, afterSleepDay: phaseAfterSleep, sleepRetry });
    // Post-sleep dawn scan: predicates still read true for signaled favors
    // (they check window + partner-at-home + dayPart 0, not the signal flag),
    // so this is an honest opportunity denominator for the dawn just passed.
    try {
      const v = Game.state.village || {};
      const waiting = [];
      const allJoint = [];
      for (const vid of (v.roster || [])) {
        const f = (v.favorLedger || {})[vid];
        if (!f || (f.kind !== 'forage_help' && f.kind !== 'water_haul')) continue;
        allJoint.push({ vid: String(vid), name: nameOf(Game, vid), kind: f.kind, dawnSignaledDay: f.dawnSignaledDay ?? null,
          state: f.state, outingAttempts: (f.outingAttempts || []).slice(),
          playerAtHaven: (() => { try { return Game.playerAtHaven ? Game.playerAtHaven() : null; } catch (e) { return null; } })() });
        let w = false;
        try { w = f.kind === 'forage_help' ? !!Game.forageFavorWaiting?.(vid) : !!Game.waterFavorWaiting?.(vid); } catch (e) { w = false; }
        if (w) waiting.push({ vid: String(vid), name: nameOf(Game, vid), kind: f.kind, dawnSignaledDay: f.dawnSignaledDay ?? null });
      }
      if (allJoint.length) dawnLedgers.push({ day: nowDay(Game), joint: allJoint });
      if (waiting.length) dawnOpps.push({ day: nowDay(Game), waiting });
    } catch (e) { warnOnce('dawnOpp', e); }
    // R82 wedge at dawn: accept a joint outing, or work a live run.
    wedgeDawn();
    const roster = ((Game.state.village || {}).roster || []);
    const alive = roster.filter(id => !isDead(Game, id)).length;
    daily.push({ day: nowDay(Game), loopDay: d, alive, roster: roster.length, pantryKcal: Math.round(pantryKcal(Game)), over: !!Game.over });
    // R231 roster-departure diff: any id gone since yesterday is logged.
    try {
      const todayIds = new Set(roster.map(id => String(id)));
      for (const id of prevRosterIds) {
        if (!todayIds.has(id)) {
          let deadNow = false; try { deadNow = isDead(Game, id); } catch (e) {}
          rosterDepartures.push({ day: nowDay(Game), id: String(id), name: nameById[id] || nameOf(Game, id) || '?', deadAtDeparture: deadNow });
        }
      }
      // R265: arrivals are the mirror diff — an id present today that
      // was absent yesterday joined the village (r246 found 2 by
      // census-diff only, with no day attached). Name via nameOf: the
      // start-census map cannot know a stranger.
      for (const id of todayIds) {
        if (!prevRosterIds.has(id)) {
          rosterArrivals.push({ day: nowDay(Game), id: String(id), name: nameOf(Game, id) || '?' });
        }
      }
      prevRosterIds = todayIds;
    } catch (e) { warnOnce('rosterDep', e); }
    // R240 SCHOLAR-DAWNS instrument (r231 scholar-death watch hit 3,
    // companion-guard exposure hypothesis unproven — the driver never
    // recorded where the scholar was when they died): per dawn, the
    // scholar's map position + Haven/inside state, read-only. A scholar
    // death on day D reads against the last record with day <= D.
    try {
      const home232 = homePoint83();
      const s232 = Game.state.scholar || {};
      scholarDawns.push({ day: nowDay(Game), loopDay: d, scholarId: String(Game.villagerId), name: nameOf(Game, Game.villagerId),
        px: Game.map ? Game.map.px : null, py: Game.map ? Game.map.py : null,
        atHaven: (Game.map ? (Game.map.px === home232.x && Game.map.py === home232.y) : null),
        insideHaven: (s232.insideHaven !== undefined ? !!s232.insideHaven : null) });
    } catch (e) { warnOnce('scholarDawn', e); }
    // R265 SPOTTER-TENURE: snapshot this dawn's scholar XP; close the
    // outgoing tenure when the scholar changes (succession).
    try {
      const curSid = String(Game.villagerId);
      const curXp = spotterXpOf(Game, curSid);
      if (curXp !== null) spotterLastSeen[curSid] = { xp: curXp, day: nowDay(Game), name: nameOf(Game, curSid) };
      if (prevScholarId !== null && prevScholarId !== curSid) {
        const prev = spotterLastSeen[prevScholarId];
        if (prev) spotterTenure.push({ vid: prevScholarId, name: prev.name, dayEnd: prev.day, spotterXp: prev.xp });
        else spotterTenure.push({ vid: prevScholarId, name: nameOf(Game, prevScholarId), dayEnd: nowDay(Game), spotterXp: null });
      }
      prevScholarId = curSid;
    } catch (e) { warnOnce('spotterTenure', e); }
    // R242 Q5 REVISION: snapshot the betrayal cases open at this dawn
    // (id, accused vids + names, status, resolution). A case that
    // resolves mid-day is still captured by the next dawn's snapshot
    // only if still listed — resolved cases stay in the array with
    // status 'resolved', so the open window is the dawn range where
    // the status was open/dormant/advisory. Guarded: betrayalState
    // may be absent on old saves; a miss logs once and records null.
    try {
      const bs = (typeof Game.betrayalState === 'function') ? Game.betrayalState() : null;
      const cases = (bs && bs.cases) || [];
      caseLog.push({ day: nowDay(Game), cases: cases.map(c => ({ id: c.id, accused: (c.accused || []).map(String), accusedNames: (c.accused || []).map(a => { try { return nameOf(Game, a); } catch (e) { return String(a); } }), status: c.status || null, resolution: c.resolution || null })) });
    } catch (e) { warnOnce('caseLog', e); }
    if (alive === 0) { deadTail++; if (deadTail >= 10) break; } else deadTail = 0;
  }

  const tele = (() => { try { return (Game.state.telemetry || []).slice(); } catch (e) { return []; } })();
  const deaths = [];
  for (const t of tele) if (t && t.type === 'death') deaths.push({ day: t.day, id: String(t.who), who: nameOf(Game, t.who), cause: t.cause, kind: t.kind, player: !!t.player,
    // R246 SELFWIT passthrough: the ambush path registers witnesses on
    // the death record; if the telemetry entry carries them, keep them
    // so the analyzer can check the victim is not their own witness
    // (r258 fix). Absent on most entries — the watch reports absence.
    witnesses: (t && Array.isArray(t.witnesses)) ? t.witnesses.map(String) : null });
  // R231: annotate departures with whether a death record names them.
  // Match by ID first: corpses.js tele('death', {who: villagerId})
  // carries the id, but nameOf resolves it to the KNOWN name at end of
  // run, which differs from the start-census name ("A person, maybe
  // 30s" vs "Wei") — name-only matching undercounts (proven on the
  // r230 corpus: 101204/101205 read UNACCOUNTED=2 by name, 0 by id).
  for (const rd of rosterDepartures) rd.deathRecorded = deaths.some(dt => (dt.id && dt.id === rd.id) || dt.who === rd.name);
  let wave = 1; try { wave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  const v = Game.state.village || {};
  const census = [];
  for (const id of (v.roster || [])) {
    let p = null; try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
    let health = null; try { health = ((v.health || {})[id] !== undefined ? v.health[id] : null); } catch (e) {}
    let sick = false; try { sick = !!((v.sick || {})[id]); } catch (e) {}
    let equipped = []; try { equipped = Object.values((p && p.equipped) || {}).map(x => x && x.itemId).filter(Boolean); } catch (e) {}
    // R217: knownCount DROPPED — r214 found it null on every person
    // record (grep: zero `knownPlants` hits in src/js; villagers carry
    // no plant-knowledge field). Knowledge is measured by
    // codexPlantsEnd (the scholar's codex, village-wide) + per-villager
    // spotter XP here (same foodXpOf pattern as foodXpEnd).
    let spotterXp = 0;
    try {
      const vp2 = (() => { try { return (Game.villagePeople ? Game.villagePeople() : []).find(x => String(x.id) === String(id)); } catch (e) { return null; } })();
      const fx2 = (p && p.foodXp) || (vp2 && vp2._src && vp2._src.foodXp) || {};
      spotterXp = fx2.spotter || 0;
    } catch (e) {}
    census.push({ id: String(id), name: nameOf(Game, id), dead: isDead(Game, id),
      occ: (p && (p.occupation || p.formerOccupation)) || '?', health, sick, equipped, spotterXp });
  }
  const saySignalLines = [];
  for (const d of Object.keys(dayLines)) for (const ln of dayLines[d]) if (/is waiting at Haven to/.test(ln)) saySignalLines.push({ day: parseInt(d, 10), line: ln.replace(/^SAY: /, '') });
  // R244 COUNTER-LINES INSTRUMENT (r243 metric review §6): capture
  // every COUNTER LEARNED say line (the r246 counter-label fix's live
  // surface — "COUNTER LEARNED — <label>: <trick>. <reveal>") so the
  // analyzer can judge the label where counter prose actually appears.
  // Read-only scan of the already-captured dayLines; no game call.
  const counterLines = [];
  for (const d of Object.keys(dayLines)) for (const ln of dayLines[d]) if (/COUNTER LEARNED/i.test(ln)) counterLines.push({ day: parseInt(d, 10), line: ln.replace(/^SAY: /, '') });
  // R82 legibility evidence: every dawn SAY line about an outing (the
  // favor-outing.js "noted blocker" lines a player would actually see).
  const dawnOutingLines = [];
  for (const d of Object.keys(dayLines)) for (const ln of dayLines[d]) if (/outing|waited at Haven|Haven this dawn/i.test(ln)) dawnOutingLines.push({ day: parseInt(d, 10), line: ln.replace(/^(SAY|SYS): /, '') });
  // R240 EXILE LINES (r233 pilot 101301: triple exile d10 — the game says
  // the vote aloud via say(), but dayLines is otherwise discarded, so
  // whether the player hears it was unanswerable): keep every dawn
  // SAY line about exile/freeloading, so the panel can judge whether
  // a departure was narrated or silent. R240 EXTENSION (Q5): the
  // regex also catches the stage-1 gossip ("isn't pulling weight")
  // and stage-2 warning ("pull weight or the village will decide")
  // lines, which the r233 regex missed — read-only filter, no behavior.
  const exileLines = [];
  for (const d of Object.keys(dayLines)) for (const ln of dayLines[d]) if (/exile|for exile|Take what you can carry|freeload|pulling weight|pull weight|village will decide/i.test(ln)) exileLines.push({ day: parseInt(d, 10), line: ln.replace(/^(SAY|SYS): /, '') });
  // R242 Q5 REVISION (r241-owed): a SEPARATE moot/case channel. The
  // exileLines regex above must stay clean (warning/vote/
  // pronouncement signal), so moot and case discussion lines land
  // here instead. The /case/ needle is deliberately narrow ("the
  // case" / "a case" / "case against" — NOT bare "case", which would
  // flood on "just in case" / "in that case" small talk); "moot"
  // is word-boundaried (/\bmoot\b/ — bare /moot/ matches "smooth",
  // e.g. "Smooth stalks" and "the smooth deflect"). The analyzer
  // filters to lines naming the exiled person. Noisy by design —
  // the counts are reported, the verdict reads the lines.
  const mootLines = [];
  for (const d of Object.keys(dayLines)) for (const ln of dayLines[d]) if (/\bmoot\b|the case|a case|case against/i.test(ln)) mootLines.push({ day: parseInt(d, 10), line: ln.replace(/^(SAY|SYS): /, '') });
  // R246 SETTLED-FAVOR + DRY2 EXTRACTS (r265 / r256 fixes, first live
  // read on this leg): every "It's already handled" say line, flagged
  // named (an em-dash + short follows — "It's already handled —
  // {short}. Thank you for asking.") vs bare (the old line with no
  // favor named); and every dry-replacement line ("...Sorry, lost my
  // train of thought.") the DRY2 walk should have eliminated.
  // Read-only scans of the already-captured dayLines; no game call.
  const settledFavorLines = [];
  for (const d of Object.keys(dayLines)) for (const ln of dayLines[d]) if (/It's already handled/i.test(ln)) settledFavorLines.push({ day: parseInt(d, 10), line: ln.replace(/^(SAY|SYS): /, ''), named: /It's already handled —/i.test(ln) });
  const dryLines = [];
  for (const d of Object.keys(dayLines)) for (const ln of dayLines[d]) if (/lost my train of thought/i.test(ln)) dryLines.push({ day: parseInt(d, 10), line: ln.replace(/^(SAY|SYS): /, '') });
  // R265 ARRIVAL LINES (r246 metric review §11): every dawn SAY line
  // that could narrate a stranger joining — the game may say it in
  // words the driver never greps otherwise. The rosterArrivals diff
  // is the authoritative count; these lines answer whether the join
  // was narrated. Patterns are deliberately narrow (a bare /arrived/
  // would flood on System arrivals); the run note adjudicates each
  // flagged arrival against the convo txt on its day.
  const arrivalLines = [];
  for (const d of Object.keys(dayLines)) for (const ln of dayLines[d]) if (/join(?:ed|s)? the village|has joined|newcomer|wandered in|arrived at the village|decides? to stay|stay with (us|the village)|walks in|Haven grows by one/i.test(ln)) arrivalLines.push({ day: parseInt(d, 10), line: ln.replace(/^(SAY|SYS): /, '') });
  // R268 SLEEP LINES (day-desync diagnostic): the sleep refusal
  // phrases + the successful-sleep line, scanned from the already-
  // captured dayLines (read-only, no game call). Each sleep+0 or
  // sleep+2 phase event joins to what sleep() actually said that
  // day — a refusal line ("barely dawn" / "too late for real
  // sleep" / "Not in the middle of a fight") on a sleep+0 day is
  // the mechanism, not a guess.
  const sleepLines = [];
  for (const d of Object.keys(dayLines)) for (const ln of dayLines[d]) if (/barely dawn|too late for real sleep|Not in the middle of a fight|Sleep takes you/i.test(ln)) sleepLines.push({ day: parseInt(d, 10), line: ln.replace(/^(SAY|SYS): /, '') });
  // three deterministic win-plan beats, grounded in src/js/win-plan.js
  // (reseedLaunchBeat: "is hunting X now — the fire found a new
  // trail"; reseedBeat/expiryBeat: "was ready to hunt X — but the fire
  // says that kind is already put down"; expiryBeat: "The hunt is
  // called off"). The launch beat is the only narration a re-seed
  // launch carries — a launch with no beat here is a silent launch.
  // R268: the DEPARTBEAT depart line ("X sets out with Y after Z —
  // the fire marks the trail", departLaunchBeat) joins the scan, so
  // LAUNCHVOICE beats are counted separately from the re-seed beats.
  const winplanLines = [];
  for (const d of Object.keys(dayLines)) for (const ln of dayLines[d]) if (/is hunting .* now — the fire found a new trail|was ready to hunt .* already put down|The hunt is called off|sets out .* — the fire marks the trail/i.test(ln)) winplanLines.push({ day: parseInt(d, 10), line: ln.replace(/^(SAY|SYS): /, '') });
  // R246 DAY-DESYNC SUMMARY (r245 seed 101955: d40 dawn missing, d42
  // dawn doubled): walk `daily` in loop order and record every step
  // where the game day skipped (gap > 1) or repeated (same as the
  // previous entry). A desync names the loop days on both sides so the
  // run note can say which sleep/wait crossed a boundary or advanced
  // none. Read-only summary of the already-recorded daily array.
  const dayDesync = [];
  for (let i = 1; i < daily.length; i++) {
    const prev = daily[i - 1].day, cur = daily[i].day;
    if (cur === prev) dayDesync.push({ kind: 'repeat', day: cur, loopDays: [daily[i - 1].loopDay, daily[i].loopDay] });
    else if (cur > prev + 1) dayDesync.push({ kind: 'skip', from: prev, to: cur, loopDays: [daily[i - 1].loopDay, daily[i].loopDay] });
  }

  // People check: 2 held convos at end of run (top cook-ish fallback: first
  // two living non-player villagers in roster order), goon-first, 8 turns.
  const convoLines = [];
  const sittingCloses = [];
  const living = (v.roster || []).filter(id => String(id) !== String(Game.villagerId) && !isDead(Game, id));
  if (Game.over) convoLines.push('(people check skipped: game over — r81 driver flaw fixed, no post-collapse sample)');
  for (const vid of (Game.over ? [] : living.slice(0, 2))) {
    const nm = nameOf(Game, vid);
    const p = (() => { try { return Game.getPerson(vid) || {}; } catch (e) { return {}; } })();
    convoLines.push(`\n-- ${nm} (${String(vid)}) occ=${p.occupation || p.formerOccupation || '?'} --`);
    try {
      let r = Game.startConvo(vid);
      convoLines.push(`OPENING: ${r.line}`);
      const printedThem = [];
      if (r.line != null) printedThem.push(r.line);
      let endedByEngine = false;
      const seen = {};
      for (let turn = 0; turn < 8; turn++) {
        const choices = (r.choices && r.choices.length) ? r.choices : [];
        if (!choices.length) { convoLines.push('(choices empty)'); break; }
        let pick = null;
        if (choices.find(ch => ch.id === 'goon')) pick = choices.find(ch => ch.id === 'goon');
        else if (choices.find(ch => ch.id === 'ask:personal') && !seen['ask:personal']) pick = choices.find(ch => ch.id === 'ask:personal');
        else pick = choices.find(ch => /work|food|teach|help|craft|build/.test(ch.id) && !seen[ch.id])
          || choices.find(ch => /gossip|rumor/.test(ch.id) && !seen[ch.id])
          || choices.find(ch => /^want:/.test(ch.id) && !seen[ch.id])
          || choices.find(ch => ch.id !== 'leave' && ch.id !== 'bye' && !seen[ch.id])
          || null;
        if (!pick) { convoLines.push('(no pick)'); break; }
        if (pick.id !== 'goon') seen[pick.id] = 1;
        convoLines.push(`YOU: [${pick.id}] ${(pick.label || '').slice(0, 80)}`);
        r = Game.convoTurn(vid, pick.id);
        convoLines.push(`THEM: ${r.line == null ? '(null)' : r.line}`);
        if (r.line != null) printedThem.push(r.line);
        if (r.ended) { endedByEngine = true; convoLines.push('(ended by engine)'); break; }
      }
      try {
        const end = Game.endConvo(vid, 'done');
        if (end && end.line) convoLines.push('closing: ' + end.line);
        const ft = (end && end.transcript) || [];
        convoLines.push('FULL-TRANSCRIPT (' + ft.length + ' entries):');
        for (const e of ft) convoLines.push('  [' + (e.who || '?') + '] ' + (e.text || ''));
        // R217 Q1 REVISED: closing beats = them-entries endConvo spoke
        // AFTER the last printed THEM line (the grace beat), anchored by
        // reverse search. Sequential matching OVERCOUNTS: a mid-sitting
        // line reworded in the transcript (e.g. foreign-language glosses
        // replace the printed line) stalls the pointer and everything
        // after it counts as "after" (pilot Valeria read 7 instead of 1).
        // If the anchor is absent from the transcript, beatsAfter is null
        // (unknown — the analyzer flags it for a human read, never a CUT).
        let lastMatchIdx = -1;
        const anchor = printedThem.length ? printedThem[printedThem.length - 1] : null;
        if (anchor != null) {
          for (let i = ft.length - 1; i >= 0; i--) {
            if (ft[i] && ft[i].who === 'them' && ft[i].text === anchor) { lastMatchIdx = i; break; }
          }
        }
        let beatsAfter = null; const beatTexts = [];
        if (lastMatchIdx >= 0) {
          beatsAfter = 0;
          for (let i = lastMatchIdx + 1; i < ft.length; i++) {
            if (ft[i] && ft[i].who === 'them') { beatsAfter++; beatTexts.push(ft[i].text); }
          }
        }
        sittingCloses.push({ name: nm, vid: String(vid), endedByEngine, closingLine: (end && end.line) || null,
          lastThem: printedThem.length ? printedThem[printedThem.length - 1] : null,
          transcriptEntries: ft.length, beatsAfterLastThem: beatsAfter, beatTexts });
      } catch (e) { convoLines.push('endConvo: ' + e.message); }
    } catch (e) { convoLines.push('ERROR: ' + e.message); }
  }

  let finalLedger = null;
  try {
    const vF = Game.state.village || {};
    finalLedger = Object.entries(vF.favorLedger || {}).map(([vid, f]) => ({ vid: String(vid), name: nameOf(Game, vid), kind: f && f.kind, dawnSignaledDay: f && f.dawnSignaledDay !== undefined ? f.dawnSignaledDay : null }));
  } catch (e) { finalLedger = null; }
  // R137 Q3 (spotter guard, carried): end-only foodXp snapshot, read-only
  // (r135 foodXpOf pattern: live getPerson record first, wrapper second).
  let foodXpEnd = null;
  try {
    foodXpEnd = ((Game.state.village || {}).roster || []).map(id => {
      let p = null; try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
      const vp = (() => { try { return (Game.villagePeople ? Game.villagePeople() : []).find(x => String(x.id) === String(id)); } catch (e) { return null; } })();
      const fx = (p && p.foodXp) || (vp && vp._src && vp._src.foodXp) || {};
      return { id: String(id), name: nameOf(Game, id), alive: !(p && p.dead),
        spotter: fx.spotter || 0, butcher: fx.butcher || 0, cook: fx.cook || 0,
        preserver: fx.preserver || 0, builder: fx.builder || 0 };
    });
  } catch (e) { foodXpEnd = null; }
  // R139 SPOTTER: end snapshot of the player's plant codex by source
  // (fieldwork = field-click identifications — the faster-ID effect
  // should show up here as plants the scholar recognized sooner).
  let codexPlantsEnd = null;
  try {
    const cp = (Game.state.codex || {}).plants || {};
    const bySrc = {};
    for (const [pid, e] of Object.entries(cp)) { const b = (e && e.by) || '?'; bySrc[b] = (bySrc[b] || 0) + 1; }
    codexPlantsEnd = { total: Object.keys(cp).length, bySource: bySrc };
  } catch (e) { codexPlantsEnd = null; }
  // R240 STANDING + TELEMETRY-TYPE instruments (read-only end
  // snapshots): standingEnd attributes the wave-4 unlock move
  // (unlock reads villageStandingTotal() only, game.js:34508);
  // teleTypeCounts names any party-launch/kill signal telemetry
  // records, without assuming which types exist.
  let standingEnd = null;
  try { standingEnd = (typeof Game.villageStandingTotal === 'function') ? Game.villageStandingTotal() : null; } catch (e) { standingEnd = null; }
  const teleTypeCounts = {};
  for (const t of tele) if (t && typeof t.type === 'string') teleTypeCounts[t.type] = (teleTypeCounts[t.type] || 0) + 1;
  // R265: close the final scholar's tenure at end of run (their live
  // end XP when readable, else the last-seen dawn value).
  try {
    if (prevScholarId !== null) {
      const last = spotterLastSeen[prevScholarId];
      const curXp = spotterXpOf(Game, prevScholarId);
      spotterTenure.push({ vid: prevScholarId, name: (last && last.name) || nameOf(Game, prevScholarId), dayEnd: nowDay(Game), spotterXp: (curXp !== null ? curXp : (last ? last.xp : null)) });
    }
  } catch (e) { warnOnce('spotterTenureEnd', e); }
  // R265 WINPLAN END (first live read): a read-only raw-state snapshot
  // of village.winPlanStats + the plan table (stages, targets, party
  // sizes). NEVER call Game.winPlanStats(): its stateOf() materializes
  // the winPlan store, and the store's EXISTENCE is the ignition gate
  // (winPlanHavenTick) — calling it would ignite the plan system in a
  // village where it sleeps and change the run. A plain property read
  // creates nothing: null stats = the system never ignited.
  let winPlanEnd = null;
  try {
    const vv = Game.state.village || {};
    const wps = vv.winPlanStats || null;
    const plans = vv.winPlan || null;
    winPlanEnd = {
      ignited: !!plans,
      stats: wps ? { ...wps } : null,
      plans: plans ? Object.entries(plans).map(([vid, p]) => ({ vid: String(vid), name: nameOf(Game, vid), stage: (p && p.stage) || null, target: (p && p.target) || null, partySize: (p && p.party ? p.party.length : 0) })) : [],
    };
  } catch (e) { winPlanEnd = null; }
  const out = { seed, run: 'r292', days: DAYS, endDay: nowDay(Game), gameOver: !!Game.over, startCensus, rosterDepartures, scholarDawns, standingEnd, teleTypeCounts,
    aliveAt40: (daily.find(x => x.day === 40) || daily[daily.length - 1] || {}).alive ?? null,
    aliveEnd: daily.length ? daily[daily.length - 1].alive : null,
    waveReached: wave, pantryKcalEnd: Math.round(pantryKcal(Game)),
    deaths, census, daily, dawnCalls, dawnOpportunities: dawnOpps, dawnLedgers, finalFavorLedger: finalLedger, saySignalLines, counterLines,
    wedgeSits, doorWalkLog, travelOutLog, endLog, jamLog, strandedLog, brokenWaterDawns, pilotBreakVid, endDisabled,
    foodXpEnd, bumpLog, codexPlantsEnd, sittingCloses, removalLog,
    storeLog, commitLog, performLog, dawnOutingLines, exileLines, mootLines, caseLog, jointLedgerEnd: (() => { try { return jointLedger(); } catch (e) { return null; } })(),
    warnLog, settledFavorLines, dryLines, dayDesync, dayPhaseLog, sleepLines,
    rosterArrivals, spotterTenure, arrivalLines, winplanLines, winPlanEnd,
    favorTele: (() => { const counts = {}; for (const t of tele) if (t && typeof t.type === 'string' && t.type.includes('favor')) counts[t.type] = (counts[t.type] || 0) + 1; return counts; })(),
    // R271 MOOT-CLOSE instrument: favor return telemetry with
    // mooted:true (r269 MOOT-CLOSE fix — convoCloseMootedRun closes
    // an evicted favor's live joint run, 0 deposited). Counted
    // separately from favorTele so the panel can count evicted-run
    // closes in the wild; each entry keeps favorId/partner/day so
    // the analyzer can join it to the stranded detector.
    mootCloseTele: (() => { const rows = []; for (const t of tele) if (t && (t.type === 'favor_forage_return' || t.type === 'favor_water_return') && t.mooted === true) rows.push({ day: t.day ?? null, type: t.type, favorId: t.favorId ?? null, partner: t.partner ?? null }); return rows; })(),
    // R274 GUARDRAILS EMIT (Q4, instrument-only): the telemetry check
    // reads guardrails.* / c3.* per seed and sums across the panel; the
    // r132 baseline is a 16-seed sweep-driver regime, so the panel is
    // judged on per-seed means vs the r271 journey-regime means, not
    // on raw sums. deaths = death-tele rows (all kinds, incl. monster
    // kills — the r22 taxonomy); popAlive = living roster at end;
    // pantryKcal = village pantry kcal at end; starvationDeaths =
    // deaths with /starv/i on cause (the game's own convention,
    // corruption.js:116).
    guardrails: { deaths: deaths.length, popAlive: (daily.length ? daily[daily.length - 1].alive : null), pantryKcal: Math.round(pantryKcal(Game)) },
    c3: { starvationDeaths: deaths.filter(dt => /starv/i.test(dt.cause || '')).length } };
  fs.mkdirSync(EVID, { recursive: true });
  writeFileRetry(path.join(EVID, `journey-establishment-r292-seed${seed}.json`), JSON.stringify(out, null, 2));
  writeFileRetry(path.join(EVID, `journey-establishment-r292-convo-seed${seed}.txt`), convoLines.join('\n'));
  console.log(`SEED ${seed}: endDay=${out.endDay} over=${out.gameOver} aliveEnd=${out.aliveEnd} aliveAt40=${out.aliveAt40} wave=${wave} standing=${standingEnd} deaths=${deaths.length} dawnCalls=${dawnCalls.filter(c => c.out && c.out.length).length} dawnOppDays=${dawnOpps.length} saySignals=${saySignalLines.length} pantryEnd=${out.pantryKcalEnd} wedgeSits=${wedgeSits.length} committed=${commitLog.filter(c => c.ok).length} askOffered=${wedgeSits.filter(s => s.askFavorOffered).length} favorActions=${wedgeSits.filter(s => s.result === 'favor-action').length} favorCancels=${wedgeSits.filter(s => s.result === 'favor-cancel').length} perform=${performLog.length} doorProbes=${doorWalkLog.length} doorDeparted=${doorWalkLog.filter(p => p.departed).length} travelOut=${travelOutLog.length} travelPressed=${travelOutLog.filter(t => t.press).length} travelDelivered=${travelOutLog.filter(t => t.post && t.post.returned).length} ended=${endLog.filter(e => e.outcome === 'ended' || e.outcome === 'end-via-deliver').length} endAttempts=${endLog.length} jamDays=${jamLog.length} stranded=${strandedLog.length} strandedRuns=${new Set(strandedLog.map(s => s.vid + ':' + s.kind)).size} brokenWaterDawns=${brokenWaterDawns} favorTele=${JSON.stringify(out.favorTele)} bumpCalls=${bumpLog.filter(b => b.pid).length} bumpBenefit=${bumpLog.filter(b => b.benefit).length} codexPlants=${codexPlantsEnd ? codexPlantsEnd.total : '?'}`);
  return out;
}

// R139: guarded so the proof test can require this driver and exercise
// prevBearerRunOf on staged state without running seeds.
if (require.main === module) {
  (async () => {
    for (const s of SEEDS) { try { await runSeed(s); } catch (e) { console.error(`SEED ${s} CRASH:`, e && e.stack || e); process.exitCode = 1; } }
  })();
}
module.exports = { prevBearerRunOf, runSeed, pickWedgeChoice, WEDGE_JOINT, WEDGE_NO_PICK };
