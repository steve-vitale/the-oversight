// feastdiscipline — "stage the fire before the fight" (flesh-out loop,
// 2026-10-22, run fleshout-20261022T1215Z, arm sim-feastdiscipline, axis
// scale-onramp, lever-0 lens).
//
// THE BIND (finding #794): the drivenofeast decomposition killed the
// drive-without-feast theory: companions' wave-4 kills rode the FEASTED
// x2.53 multiplier — the drive puts edges in hands, the feast multiplies
// them. The base feast timing (feastscale: armed feasts >=7d apart, dusk,
// haven-gated) does NOT aim at wave-4 engagements: the feastdisc DIAG
// (evidence/2026-10-22/sim-feastdiscipline.md) measured 108 wave-4
// engagements on the armorydrive baseline with 81.5% falling OUTSIDE any
// FEASTED window, and feast deserts of 14-63 days while engagements
// continued. This layer preempts the cadence: when the wave-4 staging
// window is live and a wave-4 engagement is imminent, host the armed
// feast TONIGHT so the 2-dawn buff window covers tomorrow's blades.
//
// WHY IT CAN WORK (mechanism, engine-honest):
// - seatblow-open (Steve 2026-10-17, decision #441/#445): a villager
//   fighter's own blow carries the feast when the village is feasted
//   (game.js tbDamage hook) — companions don't need to sit at the fire.
// - The armed feast's smoke draws a wave-appropriate scavenger to the
//   haven's edge (feastBuff.js feast_draw, chance 1.0), which the base
//   policy faces (competent.js) — the feast can MANUFACTURE the
//   engagement inside its own window (the Sigrun/d110 Algorithm kill in
//   sim-armorydrive-confirm.md came through exactly this route).
//
// DESIGN CALLS (Steve 2026-10-07: figure it out yourself, document it):
// 1. ARMED feasts only — an unarmed feast grants no buff (devotion gate);
//    the social engine is feastscale's business, not this layer's.
// 2. Never fire while feastedActive — the window IS the weapon;
//    re-feasting a live buff only refreshes it (no_double_stack).
// 3. Dusk + haven gating — the feast is a haven ritual; the 2-dawn window
//    covers tomorrow's field. No dawn feast (the 48-tick cost eats the
//    morning's patrol).
// 4. The honest pantry buffer is kept (plan.have >= cost*1.5) — never
//    feast into famine (guardrail).
// 5. Threat signal: a wave-4+ monster on a travel target (policy-visible
//    via Game.monsterAt, the stagemuster patrol's own read) while the
//    staging window is live (wave-4 unlocked, wave-5 veterans bar unmet).
//    No threat visible -> the cadence owns the fire.
// 6. NO feast-draw manipulation, NO fight wrapper: facing the draw is the
//    base's business (competent faces draws); the scholar fights per base
//    policy, the companions per the engine. This layer stages the fire
//    and gets out of the way.
//
// SCOPE vs the sibling loop B (LIVE on food-economy with uncommitted
// game.js trees): ZERO src/js — this file is policy-side only, disjoint
// namespace (fd* ctx keys, FD_ env gate), composes OUTSIDE
// armorydrive's armedFor like stagemuster did.
//
// Env gate FEASTDISC=1 opts IN (default OFF). Gate off = pure delegation:
// no beats, no tele, no ctx writes, no RNG draws — byte-identical to the
// wrapped stack (the proof test's det-gate pins that).
//
// Canon read: docs/CANON.md, docs/MONSTER-WAVES.md (wave-4 = The Mirror
// Draft; the readiness gate; VILLAGER XP LAW), docs/PRESERVATION.md (the
// feast's food ladder — the pantry cost is real). No canon doc covers
// equipment — stated, not invented (same as the armorydrive arms).
'use strict';
const AD = require('./armorydrive');

function fdOn() { return process.env.FEASTDISC === '1'; }

// ---------- module-level mechanism telemetry (sweep reads, proof ignores)
// Sequential sweeps only (never concurrent in one process). Incremented
// ONLY when the gate is on — gate-off delegation touches nothing.
var tele = null;
function resetTele() {
  tele = { beats: 0, feastsStaged: 0, feastsFailed: 0, skippedUnarmed: 0, skippedFeasted: 0, skippedNoThreat: 0, skippedPantry: 0, skippedPlan: 0, beatErrors: 0 };
}
function tinc(k) { try { if (tele) tele[k] = (tele[k] | 0) + 1; } catch (e) {} }
resetTele();

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function beastWaveOf(Game, mid) {
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === mid);
    return (def && def.wave) || 1;
  } catch (e) { return 1; }
}
// The wave-4 staging window: wave-4 unlocked AND the wave-5 veterans bar
// not yet met (AD's own live reads — resumes if a veteran dies).
function stagingWindowLive(Game) {
  try { return AD.wave4Unlocked(Game) && !AD.w5VetBarMet(Game); }
  catch (e) { return false; }
}
function feastArmed(Game) {
  try { return !!((((Game.state || {}).scholar || {}).prog || {}).feastSurge); }
  catch (e) { return false; }
}
function feastedNow(Game) {
  try { return !!(Game.feastedActive && Game.feastedActive()); }
  catch (e) { return false; }
}
function outOfCombat(Game) {
  try { if (Game.tbfight && !Game.tbfight.over) return false; } catch (e) {}
  try { if (Game.inCombat && Game.inCombat()) return false; } catch (e) {}
  return true;
}
function atHaven(Game) {
  try { return !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) { return false; }
}
// Threat signal: a wave-4+ monster sits on a travel target — the heading
// the scholar could take tomorrow. The stagemuster patrol's own read;
// policy-visible, engine-honest.
function wave4Imminent(Game) {
  try {
    const targets = (Game.travelTargets ? Game.travelTargets() : []) || [];
    for (const tt of targets) {
      let mon = null;
      try { mon = Game.monsterAt ? Game.monsterAt(tt.x, tt.y) : null; } catch (e) { mon = null; }
      if (mon && beastWaveOf(Game, mon.id || mon.monsterId) >= 4) return true;
    }
  } catch (e) {}
  return false;
}

// ---------- the beat ----------
// Dusk, at the haven, out of combat: when the staging window is live, the
// devotion is armed, the village is NOT already feasted, and a wave-4
// engagement is imminent, host the armed feast tonight — preempting
// feastscale's 7-day cadence so the 2-dawn window covers tomorrow's
// blades. One staging pass per day; the engine's 1-feast/day rule is the
// hard bound.
function feastDisciplineBeat(Game, ctx) {
  if (!fdOn()) return;
  if (Game.over) return;
  if (!outOfCombat(Game)) return;
  if (!stagingWindowLive(Game)) return;
  if (!feastArmed(Game)) { tinc('skippedUnarmed'); return; }
  if (feastedNow(Game)) { tinc('skippedFeasted'); return; }
  if (!atHaven(Game)) return;
  let part = 0;
  try { part = (Game.dayPart == null ? 0 : Game.dayPart); } catch (e) {}
  if (part !== 2) return; // dusk: tonight's fire, tomorrow's blades
  const day = gday(Game);
  if (ctx._fdBeatDay === day) return; // one staging pass per day
  ctx._fdBeatDay = day;
  tinc('beats');
  try {
    if (!wave4Imminent(Game)) { tinc('skippedNoThreat'); return; }
    let plan = null;
    try { plan = Game.feastPlan ? Game.feastPlan() : null; } catch (e) { plan = null; }
    if (!plan || !plan.ok) { tinc('skippedPlan'); ctx.fdPlanWhy = String((plan && plan.why) || '').slice(0, 60); return; }
    if (plan.have < plan.cost * 1.5) { tinc('skippedPantry'); return; } // never feast into famine
    let rep = null;
    try { rep = Game.hostFeast(); } catch (e) { rep = null; }
    if (rep && rep.ok) {
      tinc('feastsStaged');
      ctx.fdFeasts = (ctx.fdFeasts | 0) + 1;
    } else {
      tinc('feastsFailed');
      ctx.fdFeastFailed = (ctx.fdFeastFailed | 0) + 1;
      ctx.fdFeastWhy = String((rep && rep.why) || '').slice(0, 60);
    }
  } catch (e) { tinc('beatErrors'); ctx.fdBeatErrors = (ctx.fdBeatErrors | 0) + 1; }
}

// ---------- composition ----------
// upkeep: base.upkeep first, then the beat (dawn/dusk live in upkeep — the
// stagemuster lesson: daily runs once at NIGHT pre-sleep, so a dusk gate
// in daily would never fire). daily: pure delegation when the gate is off.
function withFeastDiscipline(base, id, desc) {
  const wrapped = Object.assign({}, base, {
    id, desc,
    daily(Game, ctx) {
      if (!fdOn()) return base.daily(Game, ctx); // gate off: pure delegation
      return base.daily(Game, ctx); // the whole stack runs fully — never preempted
    },
  });
  wrapped.upkeep = function (Game, ctx) {
    if (base.upkeep) { try { base.upkeep(Game, ctx); } catch (e) {} }
    if (!fdOn()) return; // gate off: pure delegation, ctx untouched
    feastDisciplineBeat(Game, ctx); // the one beat (additive, dusk-gated inside)
  };
  return wrapped;
}

// disciplinedFor: the pilot's armed stack — armorydrive's armedFor (the
// weapons-in-hands substrate) OUTSIDE which withFeastDiscipline composes.
// FEASTDISC=1 only on the armed side; ARMORYDRIVE=1 on both.
function disciplinedFor(base) {
  const b = String(base || '').toLowerCase();
  const nb = (b === 'lead' || b === 'leadfeast') ? 'leadfeast' : (b === 'belong' || b === 'belongfeast') ? 'belongfeast' : null;
  if (!nb) throw new Error('feastdiscipline: unknown base ' + base);
  const tag = nb === 'leadfeast' ? 'lead' : 'belong';
  return withFeastDiscipline(AD.armedFor(nb),
    `${tag}-feastdisc`,
    `${nb} + win-side layers, seat OFF (SEATDRIVE=0) + ARMORYDRIVE (ARMORYDRIVE=1) + FEASTDISC (FEASTDISC=1): threat-driven armed-feast staging ahead of wave-4 engagements`);
}

module.exports = {
  fdOn, stagingWindowLive, feastArmed, feastedNow, wave4Imminent, beastWaveOf,
  feastDisciplineBeat, withFeastDiscipline, disciplinedFor,
  resetTele, tele: function () { return Object.assign({}, tele); },
};
