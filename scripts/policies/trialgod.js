// trialgod — the god-build trial driver (sim-trialgod, 2026-10-19,
// flesh-out loop, axis scale-onramp).
//
// THE QUESTION (sim-tablepaths out-of-arm finding #2): trial-by-combat was
// 3/3 lethal on the feast-road build (~20/hit out vs 1800-2200 HP,
// 50-76/round in — a 3-round clock). Is the trial winnable by a strong
// build, or is it a bearer-sacrifice button by design?
//
// This layer maxes the scholar's combat build through REAL verbs only:
//   - gearUp: the base policy's own gearUp (best OWNED weapon/armor),
//     run again at the trial fight's first player turn;
//   - feastburn: top the kcal bank before fighting (overcharged ×1.25 —
//     "fighting topped-up burns bonus damage"; feastedMult rides if a
//     feast buff is live) via the real Game.eat() verb;
//   - ability slots: the scholar's REAL 6-slot System abilities, used in
//     the trial fight through Game.useAbility via the policy.fight hook
//     (dead aim 3x+ignore-armor, rage, settle-debt, take aim, control,
//     mend/brace) — never granted, only used;
//   - the designed counter: Game.tbFiSacrifice('item'|'memory') when the
//     Finale's 3-round title-card countdown is live (the codex counter:
//     "feed it a thing — or END IT FIRST").
// NEVER invents stats, NEVER grants items, ZERO src/js changes.
//
// COMPOSITION: withTrialGod wraps the tablepaths stack OUTERMOST:
//   withTrialGod(withTablePaths(withSeatDrive(withWinDefer(TF base))), ..., {door:'feared', trial:true})
// The god driver is a FIGHT-TIME driver: pre-trial the stack plays
// untouched (the det-gate pins this — TRIALGOD=1 is byte-identical
// pre-table; the only gated behavior is in fight() during the real
// table-trial fight, identified by the engine's own tableTrialFight()).
// The trial fight is the engine's real startCombat('finale'), fought via
// driveFights, tbEnd resumes the table.
//
// ENV-GATED TRIALGOD=1 (default OFF — unset delegates to the wrapped
// policy byte-identically; the proof's DET gate pins that).
//
// POLICY-SIDE ONLY — zero src/js changes. NEVER edit tablepaths.js,
// seatdrive.js or windefer.js.
'use strict';
const TPL = require('./tablepaths');
const SD = require('./seatdrive');
const WD = require('./windefer');
const TF = require('./tribfloor');

function layerOn() { return process.env.TRIALGOD === '1'; }

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

// trialFight(Game): the real table-trial fight, identified by the engine's
// own predicate — never by id-sniffing.
function trialFight(Game) {
  try {
    const f = Game.tbfight;
    return !!(f && !f.over && typeof Game.tableTrialFight === 'function' && Game.tableTrialFight(f));
  } catch (e) { return false; }
}

function finaleFighter(Game) {
  try {
    const f = Game.tbfight;
    if (!f) return null;
    const ms = (f.fighters || []).filter(x => x && x.kind === 'monster' && (x.hp || 0) > 0 && !x.fled);
    return ms[0] || null;
  } catch (e) { return null; }
}

// ensureTG(ctx): the per-run attribution record.
function ensureTG(ctx) {
  let TG = ctx._trialgod;
  if (!TG) {
    TG = ctx._trialgod = {
      preps: [],      // godPrep snapshots (one per trial fight)
      fights: [],     // per-trial-fight turn log (sacrifices, abilities, strikes)
      sacrifices: 0, abilities: 0, strikes: 0,
      errors: 0,
    };
  }
  return TG;
}

// godPrep(Game, ctx, inner): first player turn of the trial — max the build
// through real verbs. Gear (the base policy's own gearUp), then top the
// kcal bank (overcharge), then snapshot the build. None of these spends the
// combat turn (no p.acted write) — the turn's action follows.
function godPrep(Game, ctx, inner) {
  const TG = ensureTG(ctx);
  const rec = { day: gday(Game), round: null };
  try { rec.round = (Game.tbfight || {}).round | 0; } catch (e) {}
  // 1. GEAR — the base policy's OWN gearUp: best owned weapon/armor.
  // inner is the composed tablepaths stack; gearUp copies through the
  // Object.assign wraps from competent (the base's own function).
  try {
    const gu = (inner && inner.gearUp) || require('./competent').gearUp;
    gu(Game, ctx);
    rec.gearUp = true;
  } catch (e) { rec.gearUpError = String((e && e.message) || e).slice(0, 120); }
  // 2. FEASTBURN — top the kcal bank (overcharged ×1.25: "fighting topped-up
  // burns bonus damage"). The real eat verb, from the pack first.
  try {
    const s = Game.state.scholar || {};
    const cap = (typeof Game.kcalCap === 'function') ? Game.kcalCap() : 2400;
    let guard = 0;
    const before = Math.round(s.kcal || 0);
    while ((s.kcal || 0) < cap * 0.98 && guard++ < 4 && !Game.over) { Game.eat(); }
    rec.kcalBefore = before; rec.kcalAfter = Math.round(s.kcal || 0); rec.kcalCap = Math.round(cap);
  } catch (e) { rec.eatError = String((e && e.message) || e).slice(0, 120); }
  // 3. SNAPSHOT — the build as it enters the ring (all pure reads).
  try {
    const w = (typeof Game.equippedWeapon === 'function') ? Game.equippedWeapon() : null;
    rec.weapon = w ? { name: w.name || null, bonus: w.bonus || 0, range: w.range || 0 } : null;
  } catch (e) { rec.weapon = null; }
  try { rec.armorBonus = (typeof Game.armorBonus === 'function') ? (Game.armorBonus() | 0) : null; } catch (e) { rec.armorBonus = null; }
  try {
    const p = (typeof Game.tbFighter === 'function') ? Game.tbFighter('p') : null;
    rec.hp = p ? Math.round(p.hp || 0) : null;
    rec.maxHp = p ? Math.round(p.maxHp || p.hp || 0) : null;
  } catch (e) {}
  try { rec.overcharged = !!(typeof Game.overcharged === 'function' && Game.overcharged()); } catch (e) { rec.overcharged = null; }
  try { rec.feasted = !!(typeof Game.feastedActive === 'function' && Game.feastedActive()); } catch (e) { rec.feasted = null; }
  try {
    const s = Game.state.scholar || {};
    rec.abilities = ((s.abilities || []).slice(0, 12) || []).map(a => (a && a.id) || String(a));
    rec.slots = (typeof Game.abilitySlots === 'function') ? (Game.abilitySlots() | 0) : null;
  } catch (e) { rec.abilities = null; }
  try {
    const m = finaleFighter(Game);
    rec.finaleHp = m ? Math.round(m.hp || 0) : null;
    rec.finaleMaxHp = m ? Math.round(m.maxHp || m.hp || 0) : null;
  } catch (e) {}
  TG.preps.push(rec);
  return rec;
}

// TG_ABILITY_PRIORITY: the god-build's in-fight ability order. Damage first
// (dead aim's 3x+ignore-armor is the single best strike multiplier in the
// kit), then control, then defense. Each entry is a REAL ability+action the
// scholar must actually hold — the driver only picks from
// activatableAbilities()' combat+available list.
const TG_ABILITY_PRIORITY = [
  { id: 'dead_aim', action: 'dead_aim_shot' },                    // 3x, ignores armor
  { id: 'rage', action: 'unleash_rage' },                        // next 3 strikes ×2
  { id: 'trade_of_blows', action: 'settle_debt', minTaken: 80 }, // 50% of damage taken, once/fight
  { id: 'patient_aim', action: 'take_aim' },                     // 2.5x next shot, cannot miss
  { id: 'haymaker', action: 'throw_haymaker' },                  // 2.5x, −30% acc
  { id: 'scream_cheese', action: 'scream' },                     // stun 1 round
  { id: 'pocket_sand', action: 'throw_sand' },                   // blind 2 rounds
  { id: 'war_cry', action: 'bellow' },                          // courage check — may cost it a turn
  { id: 'mending_hands', action: 'mend', hpBelow: 0.5 },         // heal 12-18
  { id: 'unbreakable', action: 'brace', hpBelow: 0.35 },         // −60% next incoming
];

function godAbility(Game, ctx) {
  const TG = ensureTG(ctx);
  // LOADED SHOT (trialgod fix 2026-10-19): take_aim/dead_aim/haymaker/rage/
  // ambush/trade load a flag consumed by the NEXT strike(s). Re-using a
  // buff over a loaded one overwrites it and the strike never happens
  // (measured: 9/12 trial fights dealt 0 damage — every round re-aimed;
  // then rage re-unleashed 5-7x). A loaded buff FIRES: fall through to
  // the default strike.
  try {
    const s = Game.state.scholar || {};
    if (s.aimBonus || s.deadAimShot || s.haymakerReady || s.ambushReady ||
        (s.rageActive && (s.rageActive.rounds | 0) > 0) ||
        (s.tradeOpen && (s.tradeOpen.attacksLeft | 0) > 0)) return false;
  } catch (e) {}
  let acts = [];
  try { acts = (typeof Game.activatableAbilities === 'function') ? (Game.activatableAbilities() || []) : []; }
  catch (e) { return false; }
  const avail = {};
  for (const a of (acts || [])) {
    if (!a || a.context !== 'combat' || !a.available) continue;
    avail[a.abilityId + '.' + a.actionId] = a;
  }
  let hpPct = 1;
  try {
    const p = Game.tbFighter('p');
    hpPct = (p.hp || 0) / Math.max(1, p.maxHp || p.hp || 1);
  } catch (e) {}
  let taken = 0;
  try { taken = (Game.state.scholar || {}).fightDamageTaken | 0; } catch (e) {}
  for (const want of TG_ABILITY_PRIORITY) {
    const key = want.id + '.' + want.action;
    if (!avail[key]) continue;
    if (want.minTaken && taken < want.minTaken) continue;
    if (want.hpBelow && hpPct >= want.hpBelow) continue;
    let ok = false;
    try { ok = !!Game.useAbility(want.id, want.action); } catch (e) { ok = false; }
    if (ok) {
      TG.abilities = (TG.abilities | 0) + 1;
      TG.fights.push({ day: gday(Game), round: (Game.tbfight || {}).round | 0, did: 'ability:' + key });
      return true;
    }
  }
  return false;
}

// trialFightTurn(Game, ctx, inner): one god-build turn in the trial fight.
// Returns true when the turn was handled (the harness must not also strike).
function trialFightTurn(Game, ctx, inner) {
  const TG = ensureTG(ctx);
  try {
    if (!Game.tbIsPlayerTurn()) return false;
    const p = Game.tbFighter('p');
    if (!p || p.acted) return false;
    const f = Game.tbfight;
    // First player turn of this fight: max the build through real verbs.
    if (ctx._tgPrepped !== f.id) {
      godPrep(Game, ctx, inner);
      ctx._tgPrepped = f.id;
    }
    // THE SACRIFICE — the Finale's designed counter. When the 3-round
    // title-card countdown is live, the card is unavoidable [150,200] and
    // no bearer build survives it: feed it a thing (item first, then a
    // food memory) and the countdown passes for the rest of the fight.
    const m = finaleFighter(Game);
    if (m && (m.fiCountdown || 0) > 0) {
      let fed = false, kind = null;
      try {
        if (typeof Game.tbFiSacrifice === 'function') {
          if (Game.tbFiSacrifice('item')) { fed = true; kind = 'item'; }
          else if (Game.tbFiSacrifice('memory')) { fed = true; kind = 'memory'; }
        }
      } catch (e) { fed = false; }
      if (fed) {
        TG.sacrifices = (TG.sacrifices | 0) + 1;
        TG.fights.push({ day: gday(Game), round: f.round | 0, did: 'sacrifice:' + kind });
        return true;
      }
      // The sacrifice refused (empty pack, <250 kcal) — fall through and fight.
    }
    // ABILITY SLOTS — the scholar's real kit, best damage first.
    if (godAbility(Game, ctx)) return true;
    // Otherwise the default strike (driveFights handles it).
    TG.strikes = (TG.strikes | 0) + 1;
    TG.fights.push({ day: gday(Game), round: f.round | 0, did: 'strike' });
    return false;
  } catch (e) {
    TG.errors = (TG.errors | 0) + 1;
    return false;
  }
}

function withTrialGod(inner, id, desc) {
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      if (!layerOn()) return inner.daily(Game, ctx); // gate off: pure delegation
      // Fight-time driver: pre-trial the stack plays untouched.
      return inner.daily(Game, ctx);
    },
    fight(Game, ctx) {
      if (!layerOn()) return inner.fight ? inner.fight(Game, ctx) : false;
      try {
        if (trialFight(Game)) return trialFightTurn(Game, ctx, inner);
      } catch (e) {
        try { ensureTG(ctx).errors = (ensureTG(ctx).errors | 0) + 1; } catch (e2) {}
      }
      return inner.fight ? inner.fight(Game, ctx) : false;
    },
  });
}

// The sweep builds these compositions. door='feared' + trial=true on EVERY
// run (the corpus is trials reached); the tablepaths door rule still
// applies (feared must be EARNED — a run that doesn't earn it falls back,
// and never reaches the trial).
function composedFor(policyId) {
  const base = policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const tag = policyId === 'leadfeast' ? 'lead' : 'belong';
  const wd = WD.withWinDefer(base, `${tag}-windefer`, `${policyId} + win-side layers (WINPURSUIT=1 + WINDEFER=1)`);
  const sd = SD.withSeatDrive(wd, `${tag}-windefer`, `${policyId} + win-side stack + seatdrive (SEATDRIVE=1)`);
  const tp = TPL.withTablePaths(sd, `${tag}-tablepaths`,
    `${policyId} + seatdrive stack + tablepaths (TABLEPATHS=1, door=feared, trial=true)`,
    { door: 'feared', trial: true });
  return withTrialGod(tp, `${tag}-trialgod`,
    `${policyId} + seatdrive stack + tablepaths + trialgod (TRIALGOD=1, god-build trial driver)`);
}

module.exports = {
  layerOn, withTrialGod, composedFor, trialFight, finaleFighter,
  godPrep, godAbility, trialFightTurn, TG_ABILITY_PRIORITY, ensureTG,
};
