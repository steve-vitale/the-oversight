// partyfinish — sim-partyfinish-a sortie-only driver (scale-onramp, 2026-10-28).
//
// POLICY-SIDE driver for the cornered-party hold mechanism in
// src/js/fieldFights.js (opts.cornered, set ONLY by lingererSortie).
// Wraps tableseat-nowait VERBATIM; gate PARTYFINISH=1, gate OFF =
// pure delegation (detgate pins this). Sorties ONLY — the scholar
// march (lingerfinish Step 2) is deliberately dropped: scholar TB
// finishes are not villager field finishes, and marches added deaths
// in lingerfinish without moving the finish legs.
//
// SORTIE GATES (lingerfinish Step 1, reused as the driver): the
// village marches only when the treeline is weak enough that a
// mustered party can plausibly finish it — risk-weighted finish
// (Steve 2026-10-27), not unconditional. At most once per 6 game
// days (one muster per siege cohort). The policy adds NO promise
// line: the sortie's own engine lines speak, and a held beast that
// survives round 1 still flees after it.
'use strict';
const { tableseatNowait } = require('./tableseat-nowait');

function layerOn() {
  try { return String((typeof process !== 'undefined' && process.env && process.env.PARTYFINISH) || '0') === '1'; } catch (e) { return false; }
}
function gday(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function lingeringMonsters(Game) {
  try {
    const ms = Game.worldMonsters ? Game.worldMonsters() : [];
    return ms.filter(m => m && m.lingering && (m.hp || 0) > 0);
  } catch (e) { return []; }
}
function healthyAtHome(Game) {
  try {
    const v = Game.state.village || {};
    const me = Game.villagerId;
    return (v.roster || []).filter(id =>
      id !== me && !(v.away && v.away[id]) &&
      ((v.health || {})[id] === undefined || (v.health || {})[id] > 40));
  } catch (e) { return []; }
}
function pantryKcal(Game) {
  try {
    const v = (Game.state || {}).village || {};
    if (typeof Game.pantryKcalLive === 'function') {
      const k = Game.pantryKcalLive(v);
      if (typeof k === 'number' && isFinite(k)) return k;
    }
  } catch (e) { /* fall through */ }
  try {
    const v = (Game.state || {}).village || {};
    if (typeof v.pantryKcal === 'number' && isFinite(v.pantryKcal)) return v.pantryKcal;
  } catch (e) { /* fall through */ }
  try {
    const v = (Game.state || {}).village || {};
    let sum = 0, seen = false;
    for (const it of (v.pantry || [])) {
      if (it && typeof it.kcal === 'number') { sum += it.kcal * (it.units || 1); seen = true; }
    }
    if (seen) return sum;
  } catch (e) { /* fall through */ }
  return null; // unreadable pantry: HOLD, never march blind
}
function sanctityOk(Game) {
  try {
    if (Game.over) return false;
    if (Game.tbfight && !Game.tbfight.over) return false;
    if (Game.pendingEncounter) return false;
    if (typeof Game.tableActive === 'function' && Game.tableActive()) return false;
    const s = (Game.state || {}).scholar || {};
    if (Game._sleeping || s.insideTent) return false;
  } catch (e) { return false; }
  return true;
}

const partyfinish = Object.assign({}, tableseatNowait, {
  id: 'partyfinish',
  desc: 'tableseat-nowait + sortie-only driver for the cornered-party hold (default off = tableseat-nowait)',
  daily(Game, ctx) {
    const base = tableseatNowait.daily(Game, ctx);
    if (!layerOn()) return base;
    try {
      const day = gday(Game);
      const lingerers = lingeringMonsters(Game);
      if (!lingerers.length) { ctx.pfHeldNoLinger = (ctx.pfHeldNoLinger || 0) + 1; return base; }
      let minHp = Infinity, sumHp = 0;
      for (const m of lingerers) { const hp = m.hp || 0; if (hp < minHp) minHp = hp; sumHp += hp; }
      ctx.pfDaysSawLinger = (ctx.pfDaysSawLinger || 0) + 1;
      if (ctx._pfLastSortieDay != null && day - ctx._pfLastSortieDay < 6) { ctx.pfHeldCooldown = (ctx.pfHeldCooldown || 0) + 1; return base; }
      if (!sanctityOk(Game)) { ctx.pfHeldSanctity = (ctx.pfHeldSanctity || 0) + 1; return base; }
      if (!(minHp <= 80)) { ctx.pfHeldMinHp = (ctx.pfHeldMinHp || 0) + 1; return base; }
      if (!(sumHp <= 300)) { ctx.pfHeldSumHp = (ctx.pfHeldSumHp || 0) + 1; return base; }
      if (healthyAtHome(Game).length < 2) { ctx.pfHeldMuster = (ctx.pfHeldMuster || 0) + 1; return base; }
      const pantry = pantryKcal(Game);
      if (pantry == null || pantry < 12000) { ctx.pfHeldPantry = (ctx.pfHeldPantry || 0) + 1; return base; }
      ctx._pfLastSortieDay = day;
      let ret = null;
      try { ret = Game.answerLingerer ? Game.answerLingerer('sortie') : null; } catch (e) { ctx.pfSortieErr = String((e && e.message) || e).slice(0, 80); return base; }
      ctx.pfSortieCalls = (ctx.pfSortieCalls || 0) + 1;
      if (ret && typeof ret.cleared === 'number') ctx.pfSortieCleared = (ctx.pfSortieCleared || 0) + ret.cleared;
      if (ret && ret.broke) ctx.pfSortieBroke = (ctx.pfSortieBroke || 0) + 1;
    } catch (e) { ctx.pfErr = String((e && e.message) || e).slice(0, 80); }
    return base;
  },
});

module.exports = { partyfinish, layerOn };
