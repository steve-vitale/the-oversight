// competent-feaststopspend-b — stop-after-spend (arm sim-feaststopspend-b,
// run fleshout-loop-b-20261107T1830Z, axis scale-onramp / winnability
// chain).
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no
// changes to any existing policy file. Composes onto the FROZEN
// feast-drive substrate (scripts/policies/competent-feastdrive-b.js,
// unmodified, itself composing onto the FROZEN staged substrate).
// Prereg frozen in evidence/2026-11-07/sim-feaststopspend-b-prereg.md
// BEFORE any judged sim.
//
// THE BLANK (feastdrive → feastcost → feastcap): the drive buys the
// deed (foodDeeds 1/8 → 5/8) but the village pays in pairs and
// survival (pair days 62 → 14, survivors 3 → 1). The cumulative-gives
// tame recovers pairs only 14 → 28 (bar 35) and survivors fall 1 →
// 0/8. The feast-frequency cap keeps the deed and survivors but pair
// days fall 65 → 25 and donations RISE 66,990 → 82,280 kcal.
//
// THE LEVER: once a village's foodDeeds is complete, feasts after
// the deed buy nothing — no more feast draws, no more donate-down
// spending once the deed is bought. The drive's post-deed feasts and
// donations are pure cost (pantry out, fights in, deed already
// banked), so stopping them should recover pair days toward the
// staged 62 without losing the deed.
//
// WHAT IT CHANGES (all of it, nothing hidden): a thin wrapper. On
// each daily / upkeep call it reads the deed exactly the way the
// engine defines it (prog.sentimentTaught && prog.feastSurgeUsed,
// progression.js:650 — scholar-knowable state, the same read the
// drive's armed() already makes) and:
//   - deed NOT done → delegate to the feastdrive policy unchanged
//     (its donate-down + feast-at-dusk steps run exactly as frozen);
//   - deed done → delegate to the STAGED policy directly (the
//     drive's two steps are skipped as a unit; the base staged
//     policy's own eveningFeast still runs on its own cadence and
//     gates — the stop applies to the DRIVE, not the substrate).
// The stop latches: feastSurgeUsed is set true once by
// _spendFeastedPower (feastBuff.js:418, which also clears the
// arming) and no code anywhere clears it, so the deed never
// un-completes. The deed is read LIVE from the current scholar's
// prog on every call, so whatever the engine does on succession,
// the policy mirrors the engine's own deed check.
//
// WHY A WRAPPER, NOT AN EDIT TO THE DRIVE FILE: the drive file is
// the frozen substrate for this comparison; editing it would move
// the baseline under the armed leg. The wrapper gates the drive's
// two steps as a unit at the drive layer — that IS the drive's own
// gates, as opposed to the shared hostFeast verb. The feastcap
// verb-level wrap (drive-hosted feasts 18 → 0) is NOT repeated:
// this policy never calls Game.hostFeast itself.
//
// WHAT IT DOES NOT DO (stated so the census cannot be misread):
//   - No EAT FIRST bypass, no reactor change, no channel change.
//   - No roster, no kill log, no snapshot: the deed read is
//     scholar prog state. The policy NEVER reads the kill log —
//     pinned by a proof test with a poisoned log.
//   - It does NOT stop the base staged policy's own eveningFeast
//     after the deed. Mechanism note: once donate-down stops,
//     recent gives decay below 1500 within a week, so the base's
//     own EAT FIRST gate should close its feasts too — the corpus
//     (total feasts after firstSpendDay) is the arbiter. If the
//     base keeps lighting post-deed feasts, that is a finding for
//     the next arm, not a silent extension of this one.
//
// COUNTERS: per-run ctx counters (fss*) plus module-level stats
// (resetFeaststopspendStats / feaststopspendStats) so the driver
// can capture per-seed numbers without reaching into harness ctx.
'use strict';
const base = require('./competent-stageally-a');
const staged = base.stagedPolicy;
const FD = require('./competent-feastdrive-b');
const feastdrive = FD.feastdrive;

const STATS = { deedDoneDays: 0, deedDoneDonateSkips: 0, deedDoneFeastSkips: 0,
  firstDeedDoneDay: null, errors: 0, events: [] };
let seenDonateDays = {};
let seenFeastDays = {};
let seenDeedDays = {};
function resetFeaststopspendStats() {
  STATS.deedDoneDays = 0; STATS.deedDoneDonateSkips = 0; STATS.deedDoneFeastSkips = 0;
  STATS.firstDeedDoneDay = null; STATS.errors = 0; STATS.events = [];
  seenDonateDays = {}; seenFeastDays = {}; seenDeedDays = {};
}
function feaststopspendStats() { return JSON.parse(JSON.stringify(STATS)); }
function noteErr(where, e) {
  try {
    STATS.errors += 1;
    if (STATS.events.length < 200) STATS.events.push({ day: -1, what: 'error:' + where, detail: String((e && e.message) || e).slice(0, 120) });
  } catch (e2) {}
}

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function progOf(Game) { try { return ((Game.state || {}).scholar || {}).prog || {}; } catch (e) { return {}; } }
// deedDone: the engine's own food-deed definition (progression.js:650,
// table.js:107) — sentimentTaught AND feastSurgeUsed. Read live from
// the current scholar's prog; monotonic once true (nothing clears
// feastSurgeUsed — grep confirms the only write is feastBuff.js:418).
function deedDone(Game) {
  try {
    const pg = progOf(Game);
    return !!(pg.sentimentTaught && pg.feastSurgeUsed);
  } catch (e) { return false; }
}
function noteStop(Game, kind) {
  try {
    const day = dayOf(Game);
    if (STATS.firstDeedDoneDay == null) STATS.firstDeedDoneDay = day;
    if (!seenDeedDays[day]) { seenDeedDays[day] = true; STATS.deedDoneDays += 1; }
    if (kind === 'donate') {
      if (!seenDonateDays[day]) {
        seenDonateDays[day] = true; STATS.deedDoneDonateSkips += 1;
        try { /* ctx counters live on the harness ctx, not here */ } catch (e) {}
        if (STATS.events.length < 200) STATS.events.push({ day: day, what: 'stop-donate', detail: 'deed done — donate-down skipped' });
      }
    } else if (kind === 'feast') {
      if (!seenFeastDays[day]) {
        seenFeastDays[day] = true; STATS.deedDoneFeastSkips += 1;
        if (STATS.events.length < 200) STATS.events.push({ day: day, what: 'stop-feast', detail: 'deed done — feast-at-dusk skipped' });
      }
    }
  } catch (e) { noteErr('noteStop', e); }
}

const feaststopspend = Object.assign({}, feastdrive, {
  id: 'competent-feaststopspend-b',
  desc: 'competent-feastdrive-b + stop-after-spend: once foodDeeds is complete the feast drive stops donating down and feasting at dusk (policy-side probe only)',
  daily(Game, ctx) {
    try {
      if (deedDone(Game)) {
        noteStop(Game, 'donate');
        try { ctx.fssDeedDoneDays = (ctx.fssDeedDoneDays || 0) + 1; } catch (e) {}
        return staged.daily(Game, ctx);
      }
      return feastdrive.daily(Game, ctx);
    } catch (e) {
      noteErr('daily', e);
      try { return staged.daily(Game, ctx); } catch (e2) { return undefined; }
    }
  },
  upkeep(Game, ctx) {
    try {
      if (Game.dayPart === 2 && deedDone(Game)) {
        noteStop(Game, 'feast');
        if (typeof staged.upkeep === 'function') return staged.upkeep(Game, ctx);
        return undefined;
      }
      return feastdrive.upkeep(Game, ctx);
    } catch (e) {
      noteErr('upkeep', e);
      try { if (typeof staged.upkeep === 'function') return staged.upkeep(Game, ctx); } catch (e2) {}
      return undefined;
    }
  },
});

module.exports = { feaststopspend: feaststopspend,
  resetFeaststopspendStats: resetFeaststopspendStats, feaststopspendStats: feaststopspendStats,
  deedDone: deedDone };
