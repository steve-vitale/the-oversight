// scripts/policies/huntstaff.js — hunt-duty staffing layer, REBUILT for arm
// sim-huntstaff-b4 (the per-pair-collapse-aware re-attempt of the killed
// hunt-staffing line; see evidence/2026-10-18/sim-huntstaff-b3.md "Metric
// review" for the b4 spec, and evidence/2026-10-17/sim-huntstaff-b2.md
// §"The layer" for the layer spec this rebuilds byte-for-spec-byte).
//
// What it does: on LEAN days, when the scholar is at Haven, staff ONE
// hunter-substrate villager (human-skill lane — this assigns LABOR, never
// an alien ability; no System slot, no magic) to the engine's 'hunt' task
// via the engine's own assignTask (HP/in-person/obedience gates stay as the
// last word).
//
// Gates:
//   (a) lean/starvation day: pantryFreshDays() < 4 (the engine's own
//       PRODTHROTTLE threshold) OR scholar kcal < 50% cap OR < 500.
//   (b) hunter-substrate ONLY (b4 pin): formerOccupation matches
//       HUNTER_WORDS, free (roster, alive, unassigned), person-level
//       HP>=40 (sim-refusestaff-b repair — the wound-informed value,
//       not the recovering v.health map), trust>=40. The layer NEVER
//       assigns a non-substrate villager — assignBest's occ-word score
//       is a bonus, so the layer pre-gates eligibility itself before
//       calling assignBest.
//   (b2) WOUND REFUSAL (sim-refusestaff-b repair, findings #557/#535):
//       no re-assignment within 2d of a wounding hunt resolve; the
//       layer staffs the next-best eligible hunter instead (the backup
//       plan). Refusals are narrated (the scholar holding a hurt hunter
//       back — a person deciding, not a stat gate) and logged.
//   (c) one hunter at a time: no existing 'hunt' assignment; once per day
//       (ctx-day key).
// Fires in the wrapper's upkeep + daily hooks (once per day) when the
// scholar is at Haven (in-person is the honest line).
//
// Gate: HUNTSTAFF=1 (default OFF; unset = pure delegation to the base
// policy, zero writes). Zero src/js changes. Policy-side only.
//
// Telemetry: ctx._hsAssignments + ctx._hsAssignLog — only written when
// the layer fires; gate-off: zero writes (the det-gate depends on this).
'use strict';

// Hunter-substrate word list (CORRECTED, from huntroster-b named fix spec
// §3 — the occupations the village would trust with a hunt).
const HUNTER_WORDS = [
  'hunting guide', 'fishing guide', 'trail crew', 'rancher',
  'forager', 'bush pilot', 'exterminator', 'soldier',
];

function layerOn() {
  return process.env.HUNTSTAFF === '1';
}

// leanDay: read-only. TRUE when the village is on a lean/starvation day.
function leanDay(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    const cap = (typeof Game.kcalCap === 'function' ? Game.kcalCap() : 2400) || 2400;
    const kcal = s.kcal || 0;
    if (kcal < cap * 0.5 || kcal < 500) return true;
    if (typeof Game.pantryFreshDays === 'function' && Game.pantryFreshDays() < 4) return true;
    return false;
  } catch (e) { return false; }
}

// isHunterSubstrate: the b4 hunter-only gate. TRUE iff the villager's
// formerOccupation matches the hunter word-list (the engine has no
// separate hunter flag — the word-list IS the substrate definition).
function isHunterSubstrate(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (!p || p.dead) return false;
    const occ = String(p.formerOccupation || '').toLowerCase();
    return HUNTER_WORDS.some(w => occ.includes(w));
  } catch (e) { return false; }
}

// WOUND LEDGER (sim-refusestaff-b repair, findings #557/#535).
//
// The layer's old HP gate read v.health[vid] — a map that recovers via
// healer patches (+25 at departure), pharmacy doses, and healerRounds
// (+15 overnight for the most-hurt <70). That recovery MASKED wound
// debt: Teresa (sim-huntstaff-b5) was re-staffed d160-177 through 8
// hunting wounds because the gate kept reading her patched numbers.
//
// The ledger records, per villager, the true post-wound value:
//   ctx._hsWound[vid] = { day, hp, dmg }
// hp is v.health[vid] read IMMEDIATELY after hurtVillager lands — the
// person's true declining value, before any patch or overnight
// recovery. ctx._hsWoundLog keeps the full sequence for the corpus.
// The ledger lives in ctx (policy-owned), never in Game state.

// installWoundWatch(Game, ctx): observation wrap on Game.hurtVillager.
// Installed ONLY when the layer is on — gate-off: never installed, so
// the det-gate neutrality holds. Zero RNG draws, zero Game state
// writes (writes go to ctx only).
function installWoundWatch(Game, ctx) {
  if (!Game) return;
  try { Game._hsWoundCtx = ctx; } catch (e) { /* never break staffing */ }
  if (Game._hsWoundWatch) return;
  const oHurt = Game.hurtVillager ? Game.hurtVillager.bind(Game) : null;
  Game._hsWoundWatch = true;
  if (!oHurt) return;
  Game.hurtVillager = function (vid, dmg, cause) {
    const r = oHurt.apply(this, arguments);
    try {
      if (String(cause) === 'hunting') {
        const c = Game._hsWoundCtx || {};
        const v = (Game.state || {}).village || {};
        const hp = ((v.health || {})[vid] !== undefined) ? v.health[vid] : 100;
        let day = 0;
        try { day = ((Game.state || {}).scholar || {}).day || 0; } catch (e) {}
        c._hsWound = c._hsWound || {};
        c._hsWound[vid] = { day, hp, dmg: dmg | 0 };
        c._hsWoundLog = c._hsWoundLog || [];
        c._hsWoundLog.push({ day, vid, hp, dmg: dmg | 0 });
      }
    } catch (e) { /* observation must never break the game */ }
    return r;
  };
}

function woundLedgerGet(ctx, vid) {
  try { return ((ctx && ctx._hsWound && ctx._hsWound[vid]) || null); }
  catch (e) { return null; }
}

// woundWithin(ctx, vid, day, n): the most recent wounding hunt resolve
// for vid within n days (inclusive), or null.
function woundWithin(ctx, vid, day, n) {
  const w = woundLedgerGet(ctx, vid);
  if (!w) return null;
  const d = day - w.day;
  return (d >= 0 && d <= n) ? w : null;
}

// personHp(Game, ctx, vid, day): the PERSON-LEVEL health — the true
// declining value. The ledger's post-damage value is the person's true
// state; the layer credits no invented healing (no +2/day math — the
// only healing the layer trusts is what the map shows AFTER the wound,
// via min()). min() with the map keeps UNOBSERVED damage (monster
// fights, starvation, the Spool mauling) authoritative — the ledger
// only ever makes the gate stricter, never looser. Entries older than
// 7d are stale: a week-old wound has genuinely healed or the map shows
// it — trust the map.
function personHp(Game, ctx, vid, day) {
  let map = 100;
  try {
    const h = ((Game.state || {}).village || {}).health || {};
    map = (h[vid] !== undefined) ? h[vid] : 100;
  } catch (e) { /* keep 100 */ }
  const w = woundLedgerGet(ctx, vid);
  if (!w || (day - w.day) > 7) return map;
  return Math.min(map, w.hp);
}

// refuse(Game, ctx, vid, day, reason, w): the refusal — narrated as a
// person deciding (the scholar holds a hurt hunter back), never as a
// stat gate, and logged to ctx._hsRefusalLog for the corpus.
// Game.say is a no-op under the sim harness (narration off) — zero
// trajectory impact — and capturable by sense scripts via the
// Game.say-wrap + narration:false pattern (sim-huntstaff-b5 named next 5).
function refuse(Game, ctx, vid, day, reason, w) {
  try {
    ctx._hsRefusalLog = ctx._hsRefusalLog || [];
    let first = String(vid);
    try {
      const p = Game.getPerson ? Game.getPerson(vid) : null;
      if (p && p.name) first = String(p.name).split(' ')[0];
    } catch (e) { /* keep vid */ }
    ctx._hsRefusalLog.push({
      day, vid, name: first, reason,
      woundDay: w ? w.day : null, woundDmg: w ? w.dmg : null, woundHp: w ? w.hp : null,
    });
    if (typeof Game.say === 'function') {
      if (reason === 'wounded-2d') {
        Game.say(`🩹 ${first} is still hurting from the hunt — you hold them back today. The treeline can wait.`);
      } else {
        Game.say(`🩹 ${first} is wearing thin — the hunts are costing more than the patching gives back. You hold them back.`);
      }
    }
  } catch (e) { /* a refusal must never break staffing */ }
}

// eligibleHunters: free (roster, alive, unassigned) + substrate +
// person-level HP>=40 + trust>=40. The HUNTER-ONLY gate — no other
// villager can pass.
//
// HP GATE (sim-refusestaff-b repair, findings #557/#535): reads
// personHp() — the PERSON-LEVEL health, the true declining value —
// NOT the recovering v.health map. The map recovers via healer patches
// (+25), pharmacy doses, and healerRounds (+15 overnight), which mask
// wound debt: a hunter patched to 89 still carries yesterday's -20
// wound, and the old gate re-staffed them daily through accumulating
// wounds (Teresa, sim-huntstaff-b5: 8 wounds d160-174).
//
// 2-DAY REFUSAL (same repair): any villager within 2d of a wounding
// hunt resolve is refused re-assignment — they rest, and the layer
// staffs the next-best eligible hunter (the "backup plan" the b4
// evidence asked for). Refusals are narrated (Game.say — a no-op in
// sims, capturable by sense scripts) and logged to ctx._hsRefusalLog.
function eligibleHunters(Game, ctx) {
  try {
    const v = (Game.state || {}).village || {};
    const roster = v.roster || [];
    const asg = v.assignments || {};
    const trust = v.trust || {};
    let day = 0;
    try { day = ((Game.state || {}).scholar || {}).day || 0; } catch (e) {}
    const out = [];
    for (const id of roster) {
      if (id === Game.villagerId) continue;   // the scholar leads, doesn't hunt
      if (asg[id]) continue;                  // already assigned
      if (!isHunterSubstrate(Game, id)) continue;
      const w2 = woundWithin(ctx, id, day, 2);
      if (w2) { refuse(Game, ctx, id, day, 'wounded-2d', w2); continue; }
      const hp = personHp(Game, ctx, id, day);
      if (hp < 40) {                          // the engine's own fitness line
        const w = woundLedgerGet(ctx, id);
        if (w && (day - w.day) <= 7) refuse(Game, ctx, id, day, 'declining', w);
        continue;
      }
      if ((trust[id] || 0) < 40) continue;
      out.push(id);
    }
    return out;
  } catch (e) { return []; }
}

// staffHunt(Game, ctx): the staffing handle. Returns the vid staffed, or
// null on any gate refusal / gate-off / engine refusal.
function staffHunt(Game, ctx) {
  if (!layerOn()) return null;      // default OFF: zero writes, pure pass-through
  ctx = ctx || {};
  let day = 0;
  try { day = ((Game.state || {}).scholar || {}).day || 0; } catch (e) {}
  if (ctx._hsDay === day) return null;         // (c) once per day
  if (!leanDay(Game)) return null;             // (a) lean days only
  try { if (!Game.playerAtHaven || !Game.playerAtHaven()) return null; }
  catch (e) { return null; }                   // in-person is the honest line
  try {
    const asg = ((Game.state || {}).village || {}).assignments || {};
    if (Object.values(asg).some(a => a && a.task === 'hunt')) return null; // (c) one at a time
  } catch (e) { return null; }
  const cands = eligibleHunters(Game, ctx);
  ctx._hsDay = day;                            // decision made today — refusals fire once
  if (!cands.length) return null;              // (b) nobody eligible (or all refused)
  // best villagerCompetence first (the CORRECTED staffing handle)
  cands.sort((x, y) => {
    const cx = (Game.villagerCompetence ? Game.villagerCompetence(x, 'hunt') : 1) || 0;
    const cy = (Game.villagerCompetence ? Game.villagerCompetence(y, 'hunt') : 1) || 0;
    return cy - cx;
  });
  const vid = cands[0];
  let r = null;
  try { r = Game.assignTask(vid, 'hunt', { via: 'in-person' }); } catch (e) { return null; }
  if (!r || r.refused) return null;            // engine's obedience/Haven line said no — honest miss
  ctx._hsAssignments = (ctx._hsAssignments || 0) + 1;
  ctx._hsAssignLog = ctx._hsAssignLog || [];
  let p = null;
  try { p = Game.getPerson ? Game.getPerson(vid) : null; } catch (e) {}
  ctx._hsAssignLog.push({
    day, vid,
    name: (p && p.name) || vid,
    occ: (p && p.formerOccupation) || '',
  });
  return vid;
}

// withHuntStaff(base, id, src): wrap a base policy's upkeep+daily hooks.
// Gate-off: pure delegation, zero writes (det-gate neutrality).
function withHuntStaff(base, id, src) {
  const wrapped = Object.assign({}, base, { id: id || base.id });
  for (const h of ['upkeep', 'daily']) {
    const orig = base[h];
    wrapped[h] = (G, ctx) => {
      if (layerOn()) {
        const c = ctx || {};
        try { installWoundWatch(G, c); } catch (e) { /* never break the base policy */ }
        try { staffHunt(G, c); } catch (e) { /* never break the base policy */ }
      }
      if (orig) return orig(G, ctx);
    };
  }
  return wrapped;
}

module.exports = {
  withHuntStaff, staffHunt, leanDay, isHunterSubstrate, eligibleHunters,
  layerOn, HUNTER_WORDS,
  // repair surface (sim-refusestaff-b): exported for proof fixtures
  installWoundWatch, personHp, woundWithin, woundLedgerGet, refuse,
};
