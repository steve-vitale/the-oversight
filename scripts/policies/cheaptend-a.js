// cheaptend-a — A CHEAPER TENDING SHAPE (arm sim-cheaptend-a, run
// fleshout-20261108T0015Z, Loop A, axis food-economy).
//
// POLICY-SIDE ONLY. ZERO src/js changes, zero default flips, no changes
// to any existing policy file (competent.js and tendsick-a.js untouched).
// This file wraps competent.js (unmodified) and adds the tend drive on
// top, following the takeseat/doorwalk composite pattern (wrap + delegate
// + env gate + module STATS).
//
// THE BLANK (sim-tendsick-a, evidence/2026-11-07/sim-tendsick-a.md):
// tending works as medicine and fails as a village saver — sick-days
// 0.065→0.053 (ratio 0.815), duration 3.2d→2.1d, cures 0→27 — but
// foraged food −27%, fish −46%, duty-stocked −35%, starvation 1→5,
// three seeds regressing >30d. The day has no slack: tending trades
// fever for food. THIS file builds the cheaper shape: tend ONLY on days
// the forage trip would not range anyway, capped at 2 acts/day, so the
// fever gain is bought with time the village was not going to spend
// foraging anyway.
//
// THE NOT-RANGING GATE (prereg, code-read): the forage trip is gated
// inside competent.daily by ONE function, needTrip(Game, ctx)
// (competent.js:949, exported): pantry < 25,000 kcal OR scholar kcal <
// 50% of cap OR no give to the pantry in 3 days → trip; otherwise no
// trip. The layer calls the same exported function with the same ctx at
// the top of daily, moments before competent.daily calls it again. A
// day is a stay-home day exactly when needTrip is false. The layer
// cannot stop the trip; it can only spend time the trip was not going
// to use. Bad weather and "no able foragers" were considered and
// EXCLUDED in the prereg (competent never consults weather for the
// trip; needTrip does not check forager availability) — a gate on
// either would fire on ranging days and pay the same forage price.
//
// THE VERBS (all real game functions, never stubbed — game.js):
// - tendVillager(vid) (32 ticks): skilled (has herbal_remedy OR
//   field_medicine OR triage, ANY level) daysLeft -2 (floor 1),
//   severity -1; unskilled daysLeft -1 (floor 1). Wound care (+25 HP)
//   is OUT OF SCOPE here — sick patients only.
// - treatVillager(vid, abilityId) (32 ticks + 150 kcal): requires the
//   ability at L2+; herbal_remedy CURES disease / wound_fever /
//   gutrot; field_medicine and triage CURE wound_fever, EASE disease
//   / gutrot (src/data/statusEffects.json cure table).
//   needsDiagnosis is FALSE for all three NPC diseases — no diagnosis
//   gate on a cure, so the layer never examines.
// - villagerDiseaseId(rec): 'wound fever' -> wound_fever, 'gut rot'
//   -> gutrot, 'tick fever' -> disease; food-poisoning names -> null
//   (no cure; the ladder falls through to tend).
//
// THE LADDER (per patient — identical to tendsick: treat ONLY when it
// cures; an ease that costs 150 kcal is strictly worse than a skilled
// tend that is free):
//   1. Curative treat: a L2+ ability that cures THIS patient's
//      disease, scholar kcal >= 150, AND (daysLeft > 1 OR tonight is
//      lethal — hp <= the night's sick damage 1+severity*2). Cure
//      when it saves days, or saves a life on the last night.
//      Preference order: herbal_remedy, field_medicine, triage.
//   2. Else tend: tendVillager (skilled if any healing ability held
//      at any level, else unskilled). A daysLeft==1 patient with safe
//      HP is tended, not treated — they recover tonight anyway, and
//      the tend still cuts tonight's damage (severity -1).
//
// TRIAGE ORDER: lowest estimated days-to-death first — hp /
// (1 + severity*2) ascending (the night's sick damage; the healer -1
// is NOT adjusted — conservative), tie-break lowest daysLeft.
// DAILY CAP: at most 2 acts (treats + tends combined, 64 ticks —
// an eighth of the 512-tick day).
//
// THE HOOK: cheaptendA.daily runs the tend drive FIRST (scholar at
// Haven, before the trip leaves), then delegates to competent.daily
// unchanged. "Instead of ranging" is paid out of time the trip was
// not going to use — each act costs 32 real ticks, but ONLY on days
// needTrip is already false.
//
// CHEAPTEND_A=1 (default OFF — gate off = pure delegation,
// byte-identical, pinned by the proof's RED phase).
'use strict';
const { competent, needTrip } = require('./competent');

function layerOn() { return process.env.CHEAPTEND_A === '1'; }

const HEAL_ABS = ['herbal_remedy', 'field_medicine', 'triage'];
// Cure table for NPC diseases (src/data/statusEffects.json) — which
// abilities CURE each disease id. field_medicine/triage only cure
// wound_fever; herbal_remedy cures all three.
const CURES = {
  disease: ['herbal_remedy'],
  wound_fever: ['herbal_remedy', 'field_medicine', 'triage'],
  gutrot: ['herbal_remedy'],
};
const MAX_PATIENTS = 2;

function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function sickDamage(rec) { return 1 + ((rec && rec.severity) || 1) * 2; }

const STATS = { tended: 0, treated: 0, cured: 0, eased: 0, acts: 0,
  days: 0, skips: {}, errors: 0, events: [] };
function resetCheaptendStats() {
  STATS.tended = 0; STATS.treated = 0; STATS.cured = 0; STATS.eased = 0;
  STATS.acts = 0; STATS.days = 0; STATS.skips = {}; STATS.errors = 0; STATS.events = [];
}
function cheaptendStats() { return JSON.parse(JSON.stringify(STATS)); }
function skip(reason, Game) {
  try {
    STATS.skips[reason] = (STATS.skips[reason] || 0) + 1;
    if (STATS.events.length < 200) {
      STATS.events.push({ day: gday(Game), what: 'skip', detail: reason });
    }
  } catch (e) {}
}
function noteEvent(Game, what, detail) {
  try {
    if (STATS.events.length < 200) STATS.events.push({ day: gday(Game), what, detail });
  } catch (e) {}
}

// curativeAbility(Game, did): the first L2+ ability (preference order)
// that CURES this disease, or null. The 150-kcal cost is checked here
// so a treat is never attempted the engine would refuse for hunger.
function curativeAbility(Game, did) {
  const cands = CURES[did] || [];
  if (!cands.length) return null;
  let kcal = 0;
  try { kcal = ((Game.state || {}).scholar || {}).kcal || 0; } catch (e) {}
  if (kcal < 150) return null;
  for (const ab of cands) {
    try {
      if (Game.hasAbility && Game.hasAbility(ab) &&
          Game.abilityLevel && Game.abilityLevel(ab) >= 2) return ab;
    } catch (e) {}
  }
  return null;
}

// tripPlanned(Game, ctx): would the forage trip range today? Reads the
// trip's own gate — needTrip (exported from competent.js) with the same
// ctx the harness passes to daily. False = a stay-home day: the trip
// was not going to draw on the day at all, so tending spends time
// nobody was going to use. (Known approximation, prereg: the gate reads
// needTrip at the top of daily, before competent.daily runs
// keepPromises; a heal promise kept in between can spend 150 kcal and
// flip the trip on after the read. The measured forage-cost bar judges
// whether it matters.)
function tripPlanned(Game, ctx) {
  try {
    if (typeof needTrip === 'function') return !!needTrip(Game, ctx);
  } catch (e) {}
  return false;
}

function tendDrive(Game, ctx) {
  if (!layerOn()) return; // gate off: pure delegation — never drive
  if (Game.over) { skip('over', Game); return; }
  const f = Game.tbfight;
  if (f && !f.over) { skip('fight', Game); return; }
  let home = false;
  try { home = !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) {}
  if (!home) { skip('away', Game); return; }
  const v = (Game.state || {}).village || {};
  const sick = v.sick || {};
  const roster = new Set(v.roster || []);
  const patients = [];
  for (const [vid, rec] of Object.entries(sick)) {
    if (!rec) continue;
    if (!roster.has(vid)) continue;
    let dead = false;
    try { const p = Game.getPerson && Game.getPerson(vid); dead = !!(p && p.dead); } catch (e) {}
    if (dead) continue;
    let hp = 100;
    try { const h = (v.health || {})[vid]; if (h !== undefined) hp = h; } catch (e) {}
    patients.push({ vid, rec, hp, dmg: sickDamage(rec), daysToDeath: hp / sickDamage(rec) });
  }
  if (!patients.length) { skip('no-sick', Game); return; }
  // NOT-RANGING GATE: the trip would range today — this day's time is
  // spoken for. Tend only with time the trip was not going to use.
  if (tripPlanned(Game, ctx)) { skip('ranging', Game); return; }
  patients.sort((a, b) => (a.daysToDeath - b.daysToDeath) ||
    (((a.rec.daysLeft == null ? 99 : a.rec.daysLeft) - (b.rec.daysLeft == null ? 99 : b.rec.daysLeft))));
  STATS.days = (STATS.days || 0) + 1;
  if (ctx) ctx.cheaptendDays = (ctx.cheaptendDays || 0) + 1;
  let n = 0;
  for (const p of patients) {
    if (n >= MAX_PATIENTS) break;
    if (Game.over) break;
    try {
      const v2 = (Game.state || {}).village || {};
      const rec = (v2.sick || {})[p.vid];
      if (!rec) { noteEvent(Game, 'already-well', p.vid); continue; }
      let did = null;
      try { did = Game.villagerDiseaseId ? Game.villagerDiseaseId(rec) : null; } catch (e) {}
      const daysLeft = rec.daysLeft == null ? 99 : rec.daysLeft;
      let hpNow = 100;
      try { const h = (v2.health || {})[p.vid]; if (h !== undefined) hpNow = h; } catch (e) {}
      const dmgNow = sickDamage(rec);
      const ab = did ? curativeAbility(Game, did) : null;
      if (ab && (daysLeft > 1 || hpNow <= dmgNow)) {
        Game.treatVillager(p.vid, ab);
        STATS.treated = (STATS.treated || 0) + 1;
        const after = (((Game.state || {}).village || {}).sick || {})[p.vid];
        if (!after) { STATS.cured = (STATS.cured || 0) + 1; noteEvent(Game, 'cured', p.vid + ':' + ab); }
        else { STATS.eased = (STATS.eased || 0) + 1; noteEvent(Game, 'eased', p.vid + ':' + ab); }
        STATS.acts = (STATS.acts || 0) + 1;
        if (ctx) ctx.cheaptendActs = (ctx.cheaptendActs || 0) + 1;
      } else {
        Game.tendVillager(p.vid);
        STATS.tended = (STATS.tended || 0) + 1;
        STATS.acts = (STATS.acts || 0) + 1;
        if (ctx) ctx.cheaptendActs = (ctx.cheaptendActs || 0) + 1;
        noteEvent(Game, 'tended', p.vid);
      }
      n++;
    } catch (e) { STATS.errors = (STATS.errors || 0) + 1; }
  }
}

const cheaptendA = Object.assign({}, competent, {
  id: 'cheaptend-a',
  desc: 'competent + tend sick/fevered villagers at Haven only on days the forage trip would not range anyway (CHEAPTEND_A=1, max 2 acts/day)',
  daily(Game, ctx) {
    try { tendDrive(Game, ctx); } catch (e) { STATS.errors = (STATS.errors || 0) + 1; }
    return competent.daily(Game, ctx);
  },
});

module.exports = { cheaptendA, tendDrive, resetCheaptendStats, cheaptendStats, curativeAbility, tripPlanned, MAX_PATIENTS };
