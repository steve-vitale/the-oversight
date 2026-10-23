// armorvillage — "armor the village" economy drive (flesh-out loop, 2026-10-23,
// run fleshout-20261023T0713Z completing dead run fleshout-20261023T0515Z arm
// sim-armorvillage-b, axis scale-onramp).
//
// THE BIND (finding #646 + lane-A scale r22 verdict 2026-10-23): the wave-5
// door's armor leg (4 fighters at worn P>=15) is structurally unclearable —
// no communal armor pile, no player->villager armor hand-off, no NPC craft
// beats (armor is luck-only). The game-side structure is built in this arm
// (src/js/storage.js armor pile, game.js giftArmor + #806 fix,
// villager-build.js pile-draw + NPC craft beats). This layer is the POLICY
// that drives the structure headless: one quiet deposit + one gift per day.
//
// DESIGN CALLS (Steve 2026-10-07 — mine, his to overrule; pre-reg design call #7):
// 1. DEPOSIT strictly-worse spares, keep the best spare as scholar insurance
//    (armorydrive's design call #2). Fires only when >=2 armor spares exist.
// 2. GIFT the best spare to the fighter with the biggest armor deficit — the
//    armed (weapon to hand) living villager with the lowest worn armor,
//    where the gift is a genuine upgrade. Fires only when >=2 spares exist,
//    so the scholar is never stripped below worn+best-spare.
// 3. ONE deposit + ONE gift per day max (quiet cadence).
// 4. Haven/mid-fight gates: donateArmor/giftArmor refuse honestly when not at
//    haven or mid-fight — the policy just calls them and counts what fires.
// 5. Deposit-is-consent, gifts outright (the structure's canon re-read) —
//    the policy never moves gear it wasn't given.
//
// Env gate ARMORVILLAGE=1 opts IN (default OFF). Gate off = pure delegation:
// no beats, no RNG draws — byte-identical to the wrapped stack (the proof
// test's det-gate pins that).
//
// Canon read: docs/CANON.md + code-level canon (pre-reg design calls #1-6);
// no armor canon DOC exists — stated, not invented.
'use strict';
const AD = require('./armorydrive');

function avOn() { return process.env.ARMORVILLAGE === '1'; }

function protOf(def) {
  return (def && def.armor && def.armor.protection) || 0;
}

// Scholar's armor spares: armor items in inventory (not worn), real armor,
// not bonded, not keepsakes — ranked by protection desc.
function armorSpares(Game) {
  const defs = (Game.data && Game.data.items) || [];
  const inv = ((Game.state && Game.state.scholar && Game.state.scholar.inventory) || []);
  const out = [];
  for (let i = 0; i < inv.length; i++) {
    const it = inv[i];
    if (!it || it.bonded) continue;
    const id = it.itemId || it.id;
    if (!id) continue;
    const def = defs.find(d => d && d.id === id);
    if (!def || !def.armor || protOf(def) <= 0) continue;
    if (Game.isKeepsake && Game.isKeepsake(it)) continue;
    out.push({ idx: i, id, def, prot: protOf(def) });
  }
  out.sort((a, b) => b.prot - a.prot);
  return out;
}

function armorOf(Game, person) {
  try {
    const S = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
    if (S.equipment && S.equipment.armorOf) return S.equipment.armorOf(person, Game.data.items || []);
  } catch (e) {}
  return 0;
}

// Armed per readiness: a weapon equipped or a weapon item carried.
function isArmed(Game, person) {
  const defs = (Game.data && Game.data.items) || [];
  try {
    const eq = (person.equipped || {});
    for (const k of Object.keys(eq)) {
      const e = eq[k];
      const id = e && (e.itemId || e.id);
      const def = id && defs.find(d => d && d.id === id);
      if (def && def.class === 'weapon') return true;
    }
    for (const it of (person.items || [])) {
      const id = it && (it.itemId || it.id);
      const def = id && defs.find(d => d && d.id === id);
      if (def && def.class === 'weapon') return true;
    }
  } catch (e) {}
  return false;
}

function livingFighters(Game) {
  const v = (Game.state && Game.state.village) || {};
  const out = [];
  for (const rid of (v.roster || [])) {
    if (rid === Game.villagerId) continue;
    let p = null;
    try { p = Game.getPerson ? Game.getPerson(rid) : null; } catch (e) {}
    if (!p || p.dead) continue;
    out.push({ vid: rid, p });
  }
  return out;
}

// Beat 1: deposit — one strictly-worse spare/day into the armory's armor
// section. Fires only with >=2 spares (best spare kept as insurance).
function depositBeat(Game, ctx) {
  try {
    const spares = armorSpares(Game);
    if (spares.length < 2) return;
    const best = spares[0].prot;
    // the best of the strictly-worse: most useful to the pile, least missed
    const pick = spares.find(s => s.prot < best);
    if (!pick) return;
    let r = null;
    try { r = Game.donateArmor(pick.idx); } catch (e) { r = null; }
    if (r !== null && r !== undefined) ctx._avDeposits = (ctx._avDeposits | 0) + 1;
  } catch (e) { ctx.notes.push('av deposit: ' + e.message); }
}

// Beat 2: gift — the best spare to the worst-armored armed fighter.
// Fires only with >=2 spares (never below worn+best-spare).
function giftBeat(Game, ctx) {
  try {
    const spares = armorSpares(Game);
    if (spares.length < 2) return;
    const best = spares[0];
    const fighters = livingFighters(Game)
      .filter(f => isArmed(Game, f.p))
      .map(f => ({ vid: f.vid, p: f.p, worn: armorOf(Game, f.p) }))
      .filter(f => f.worn < best.prot)
      .sort((a, b) => a.worn - b.worn || String(a.vid).localeCompare(String(b.vid)));
    if (!fighters.length) return;
    const target = fighters[0];
    let r = null;
    try { r = Game.giftArmor(best.idx, target.vid); } catch (e) { r = null; }
    if (r !== null && r !== undefined) ctx._avGifts = (ctx._avGifts | 0) + 1;
  } catch (e) { ctx.notes.push('av gift: ' + e.message); }
}

function armorVillageDay(Game, ctx) {
  giftBeat(Game, ctx);    // the fighter first — best spare has a name
  depositBeat(Game, ctx); // then the pile gets the strictly-worse
}

// ---------- composition ----------
function withArmorVillage(base, id, desc) {
  return Object.assign({}, base, {
    id, desc,
    daily(Game, ctx) {
      if (!avOn()) return base.daily(Game, ctx); // gate off: pure delegation
      base.daily(Game, ctx);   // the pinned substrate runs FIRST and fully
      armorVillageDay(Game, ctx); // beat (additive)
    },
  });
}

function armedFor(base) {
  const b = AD.normBase(base);
  const tag = b === 'leadfeast' ? 'lead' : 'belong';
  return withArmorVillage(AD.armedFor(base),
    `${tag}-armorvillage`,
    `${b} + ARMORYDRIVE pinned substrate + ARMORVILLAGE (ARMORVILLAGE=1): the armor-economy drive`);
}

module.exports = {
  avOn, armorSpares, armorOf, isArmed, armorVillageDay, withArmorVillage, armedFor,
};
