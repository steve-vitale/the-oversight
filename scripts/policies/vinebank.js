// policies/vinebank.js — MATERIALS-BANKING policy arm (lever loop B,
// 2026-10-14, food-economy axis). Answers the sim-snaregate kill's named
// next: the blind-gate question dissolved into a MATERIALS question — the
// blind craft band (2+2) never fired because the scholar's pack never
// co-banked vine>=2 AND stick>=2 simultaneously. Not a gate problem; a
// materials-banking problem.
//
// The layer plays a trapper who deliberately stockpiles: while the snare
// recipe sits at L1 (the blind band — the base policy's reliable 1+1 band
// already drives L2+), the bank has first claim on vine and stick until
// both reach 2. Competing crafts that would spend trap materials are
// DEFERRED, not cancelled: a real player sets the vine aside for the line
// and knaps the knife tomorrow.
//
// The vine race (recipes competing for the same materials — verified
// against src/data/recipes.json 2026-10-14):
//   stone_knife: vine 1 (keepKnife + armUp win the vine race in the base
//     policy, deliberately, before workTrapline runs)
//   bark_armor:  vine 2
//   arrow:       stick 2 (gearUp knaps arrows when the best weapon is dry)
//   snare:       vine 1 + stick 1 (the blind band this layer spends)
// Fires do NOT burn stick (fireFuel prefers branch, falls back to wood
// logs) — the stick drain is arrows, the vine drain is knives/armor.
//
// Engine-honesty: this layer only calls verbs the engine exposes
// (Game.craft, Game.doAction('forage') via the policy's own trip) and only
// suppresses the policy's OWN craft calls. It never moves materials, never
// reserves inventory slots, never invents a verb.
//
// Opt-in: VINEBANK=1. Default OFF — every hook in competent.js is env-gated
// so default behavior is byte-identical.
'use strict';

const BANK = { vine: 2, stick: 2 }; // the blind band's 2+2

// The competing crafts and which bank materials they consume.
const COMPETITORS = {
  stone_knife: ['vine'], // keepKnife (butchering knife), armUp (weapon knife)
  bark_armor: ['vine'],  // gearUp armor craft — eats the whole vine bank
  arrow: ['stick'],      // gearUp dry-weapon arrow craft — eats the stick bank
};

function on() { return process.env.VINEBANK === '1'; }

function packMat(Game, m) {
  try {
    return ((Game.state.scholar || {}).inventory || [])
      .filter(i => i && i.material === m).reduce((t, i) => t + (i.units || 0), 0);
  } catch (e) { return 0; }
}

function snareLevel(Game) {
  try { return (((Game.state.codex || {}).recipes || {}).snare || {}).level || 0; }
  catch (e) { return 0; }
}

// banking: the layer is active — snare at L1 (blind band; the base 1+1 band
// already drives L2+, and the base 3+3 band owns the top) and the bank is
// not yet full. A player who doesn't know the recipe (L0) doesn't hoard
// for it — the knowledge gate stays the gate.
function banking(Game) {
  if (!on()) return false;
  if (snareLevel(Game) !== 1) return false;
  return packMat(Game, 'vine') < BANK.vine || packMat(Game, 'stick') < BANK.stick;
}

// defersCraft(recipeId): while banking, a competing craft waits — the bank
// has first claim. Returns the deferral reason string, or null.
function defersCraft(Game, recipeId) {
  if (!banking(Game)) return null;
  const mats = COMPETITORS[recipeId];
  if (!mats) return null;
  return 'banking ' + mats.join('+') + ' for the blind band';
}

// tripBoost: which material the forage trip should bias toward. Vine comes
// from bush harvests (30%/bush — thickets are bush-heavy); stick from tree
// harvests (40%/tree — groves are tree-heavy). Player-visible tile
// knowledge only; the fog keeps its secrets.
function tripBoost(Game) {
  const out = { vine: false, stick: false };
  if (!banking(Game)) return out;
  out.vine = packMat(Game, 'vine') < BANK.vine;
  out.stick = packMat(Game, 'stick') < BANK.stick;
  return out;
}

// blindBand: spend the bank. One honest Game.craft('snare') per day when
// the bank holds 2+2 but below the base's 3+3 band (the base owns 3+3; this
// never double-attempts). A blind attempt costs 1+1 win or lose — the
// materials are at real risk, same as the base band.
const TRAPLINE_IDS = ['snare', 'deadfall', 'box_trap', 'spring_snare', 'minnow_trap', 'pit_trap'];
function blindBand(Game, ctx) {
  if (!on()) return;
  try {
    const s = Game.state.scholar; if (!s) return;
    const day = s.day || 0;
    if ((ctx._vinebankDay || 0) === day) return; // one attempt per day
    if (snareLevel(Game) !== 1) return; // blind band only
    const tools = s.tools || [];
    const held = tools.filter(t => t && TRAPLINE_IDS.includes(t.recipeId)).length;
    if (held >= 2) return; // the 2-held trap cap stays
    const vine = packMat(Game, 'vine'), stick = packMat(Game, 'stick');
    if (vine >= 3 && stick >= 3) return; // base's reliable band owns 3+3
    if (vine >= BANK.vine && stick >= BANK.stick) {
      ctx._vinebankDay = day;
      ctx.vinebankBlindAttempts = (ctx.vinebankBlindAttempts || 0) + 1;
      try { const r = Game.craft('snare'); if (r) { ctx.trapsCrafted = (ctx.trapsCrafted || 0) + 1; ctx.vinebankBlindCrafts = (ctx.vinebankBlindCrafts || 0) + 1; } } catch (e) {}
    }
  } catch (e) {}
}

const vinebank = { BANK, COMPETITORS, on, banking, defersCraft, tripBoost, blindBand, packMat, snareLevel };
module.exports = { vinebank };
