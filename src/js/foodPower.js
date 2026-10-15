// @ontology
// system: foodPower
// description: Food is fuel — every System ability burns kcal from the ONE economy (no mana pool); a topped-up user OVERCHARGES (+25% impact, max with the feast buff); village pantry tiers gate villager ability uses (starving: none, tight: only when outmatched, secure: normal, abundant: bonus uses). (Steve 2026-10-14: "Abilities should be stronger, and they were always meant to be powered by food.")
// provides:
//   - abilityKcalCost(abilityId, actionId)
//   - foodPowerGate()
//   - overcharged()
//   - abilityPowerMult()
//   - overchargeMult()
//   - overchargeLine()
//   - villageDailyNeed()
//   - villageFoodDays()
//   - villageFoodTier()
// rules:
//   - one_economy: true (code: foodPower.js — kcal only, deducted from scholar.kcal; no mana/ability-point pool anywhere)
//   - data_cost_wins: true (code: foodPower.js — actions declaring cost.kcal keep their tuned number; the tier table only fills gaps)
//   - hunger_gate: true (code: foodPower.js — scholar.kcal < 500 refuses every ability with an "eat first" line; nothing is deducted on refusal)
//   - overcharge: true (code: foodPower.js — kcal >= 75% of kcalCap → ×1.25 on player-sourced damage; takes the max with feastedMult, never stacks)
//   - village_tiers: true (code: foodPower.js — pantry days of food → starving/tight/secure/abundant; gates tbVillagerAbility uses, never the player's)
//   - honest_costs: true (code: foodPower.js — kcal cost shown on every ability button before use; the burn narrated after every real activation)
// consumes:
//   - state.scholar.kcal, kcalCap(), feastedActive(), feastedMult(), noteFeastedCombatUse()
//   - pantryKcalLive(), state.village.burnHistory / roster
//   - Game.useAbility, Game.payActionCost, Game._actionAvailable, Game.activatableAbilities, Game.activateAbility, Game.tbVillagerAbility, tbDamage player-source hook
// NOTE: self-attaching module (Object.assign(Game, methods)). Load AFTER
// abilityActions.js — every wrap below targets the unified dispatcher.
// Index order: directly after abilityActions.js.
(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  // Tier → kcal per activation. Data-declared cost.kcal always wins; this
  // table only fills the gaps so EVERY activatable ability burns something.
  // Scale: a day's food is ~2200 kcal; a fight's worth of casts should be a
  // real line item, not a rounding error and not a starvation sentence.
  const TIER_KCAL = {
    common: 25, uncommon: 40, utility: 40, combat: 60, wacky: 40,
    rare: 80, risky: 100, vile: 120, body_horror: 150,
  };
  const DEFAULT_KCAL = 40;
  const HUNGER_GATE_KCAL = 500; // the engine's STARVATION_THRESHOLD — the body won't burn what it doesn't have
  const OVERCHARGE_FRAC = 0.75; // kcal >= 75% of cap → topped up
  const OVERCHARGE_MULT = 1.25;

  const methods = {
    // abilityKcalCost: the honest price of one activation. Data-declared
    // cost.kcal wins (tuned per ability); otherwise the tier table.
    abilityKcalCost(abilityId, actionId) {
      try {
        const abs = (this.data && this.data.abilities) || [];
        let ab = null;
        for (let i = 0; i < abs.length; i++) if (abs[i].id === abilityId) { ab = abs[i]; break; }
        if (!ab) return DEFAULT_KCAL;
        if (actionId && ab.actions) {
          for (let j = 0; j < ab.actions.length; j++) {
            const act = ab.actions[j];
            if (act.id === actionId && act.cost && act.cost.kcal) return act.cost.kcal;
          }
        }
        return TIER_KCAL[ab.tier] || DEFAULT_KCAL;
      } catch (e) { return DEFAULT_KCAL; }
    },

    // foodPowerGate: the hunger gate. Below the starvation threshold the
    // body refuses to burn — eat first. Checked BEFORE any cost is paid.
    foodPowerGate() {
      try {
        const s = this.state.scholar || {};
        if ((s.kcal || 0) < HUNGER_GATE_KCAL) {
          return { ok: false, why: `Running on empty (${Math.round(s.kcal || 0)} kcal) — your body won't burn what it doesn't have. Eat first. (Abilities need ${HUNGER_GATE_KCAL}+ kcal.)` };
        }
        return { ok: true };
      } catch (e) { return { ok: true }; }
    },

    // overchargeMult: the one number for a topped-up fighter (player or,
    // through godpath.js villagerPowerMult, a well-fed villager).
    overchargeMult() { return OVERCHARGE_MULT; },

    // overcharged: topped up — at least 75% of the kcal bank filled.
    overcharged() {
      try {
        const s = this.state.scholar || {};
        const cap = (typeof this.kcalCap === 'function') ? this.kcalCap() : 2400;
        return (s.kcal || 0) >= OVERCHARGE_FRAC * cap;
      } catch (e) { return false; }
    },

    // abilityPowerMult: the ceiling, earned with food. Overcharge ×1.25 when
    // topped up; the feast buff when higher. Max wins — never stacks, so the
    // label always names one true number.
    abilityPowerMult() {
      let m = 1;
      try { if (this.overcharged()) m = Math.max(m, OVERCHARGE_MULT); } catch (e) {}
      try {
        if (typeof this.feastedActive === 'function' && this.feastedActive() &&
            typeof this.feastedMult === 'function') m = Math.max(m, this.feastedMult());
      } catch (e) {}
      return m;
    },

    // overchargeLine: the visible label. Empty when feasted (the FEASTED
    // label covers it) or not topped up.
    overchargeLine() {
      try {
        if (!this.overcharged()) return '';
        if (typeof this.feastedActive === 'function' && this.feastedActive() &&
            typeof this.feastedMult === 'function' && this.feastedMult() > OVERCHARGE_MULT) return '';
        return `⚡ OVERCHARGED ×${OVERCHARGE_MULT} (well-fed) — food is fuel, abilities hit harder`;
      } catch (e) { return ''; }
    },

    // ---- village food security: the group's engine ----
    // villageDailyNeed: measured 7-day rolling burn, else roster × 1000.
    villageDailyNeed() {
      try {
        const v = this.state.village || {};
        const hist = (v.burnHistory || []).filter(x => x > 0);
        if (hist.length) return Math.round(hist.reduce((a, b) => a + b, 0) / hist.length);
        return ((v.roster || []).length || 12) * 1000;
      } catch (e) { return 12000; }
    },
    // villageFoodDays: days of real pantry food at the measured burn.
    villageFoodDays() {
      try {
        const v = this.state.village || {};
        const pk = (typeof this.pantryKcalLive === 'function') ? this.pantryKcalLive(v) : 0;
        const need = this.villageDailyNeed() || 12000;
        return pk / need;
      } catch (e) { return 0; }
    },
    // villageFoodTier: ABUNDANT ≥7d, SECURE 3–7d, TIGHT 1–3d, STARVING <1d.
    villageFoodTier() {
      const d = this.villageFoodDays();
      if (d >= 7) return 'abundant';
      if (d >= 3) return 'secure';
      if (d >= 1) return 'tight';
      return 'starving';
    },
  };

  Object.assign(Game, methods);

  // ---- wraps ----

  // payActionCost: inject the tier kcal cost when the action's data didn't
  // declare one. The _fpCtx stash is set by the useAbility wrapper below so
  // the atomic precheck-then-pay ordering is preserved — a refused tap never
  // burns.
  const _payActionCost = Game.payActionCost;
  Game.payActionCost = function (cost) {
    try {
      const ctx = this._fpCtx;
      if (ctx && !(cost && cost.kcal)) {
        const kc = this.abilityKcalCost(ctx.abilityId, ctx.actionId);
        cost = Object.assign({}, cost, { kcal: kc });
        ctx.injectedKcal = kc;
      }
    } catch (e) {}
    return _payActionCost.call(this, cost);
  };

  // useAbility: the hunger gate, then the tier-cost injection (via _fpCtx),
  // then the burn narrated on real success. Data-declared burns narrate too —
  // no silent drains.
  const _useAbility = Game.useAbility;
  Game.useAbility = function (abilityId, actionId, target) {
    try {
      const gate = this.foodPowerGate();
      if (!gate.ok) { this.say(gate.why + ' (' + abilityId + ')'); return false; }
      // declared burn, for the narration (injected burn is captured via _fpCtx)
      let declared = 0;
      try {
        const def = (typeof this.abilityActionDef === 'function') ? this.abilityActionDef(abilityId, actionId) : null;
        declared = (def && def.action && def.action.cost && def.action.cost.kcal) || 0;
      } catch (e) {}
      this._fpCtx = { abilityId: abilityId, actionId: actionId, injectedKcal: 0 };
      let result;
      try { result = _useAbility.call(this, abilityId, actionId, target); }
      finally {
        const ctx = this._fpCtx;
        this._fpCtx = null;
        const burned = (ctx && ctx.injectedKcal) || declared;
        if (result !== false && burned > 0) {
          try { this.say(`(−${burned} kcal — food becomes ${String(abilityId).replace(/_/g, ' ')}.)`); } catch (e) {}
        }
      }
      return result;
    } catch (e) { return _useAbility.call(this, abilityId, actionId, target); }
  };

  // activateAbility: legacy hardcoded branches (blood_magic, time_skip,
  // dowsing, echo_location). Hunger-gated like everything else. blood_magic
  // is the kcal SOURCE — its price is HP, never kcal. The others burn their
  // tier cost; refusals burn nothing (time_skip's two refusal conditions and
  // echo_location's 1/day are checked first so the burn only lands on fire).
  const _activateAbility = Game.activateAbility;
  Game.activateAbility = function (id, target) {
    try {
      if (!id || id.indexOf('.') !== -1) return _activateAbility.call(this, id, target);
      const gate = this.foodPowerGate();
      if (!gate.ok) { this.say(gate.why + ' (' + id + ')'); return false; }
      if (id === 'blood_magic') return _activateAbility.call(this, id, target);
      const s = this.state.scholar || {};
      if (id === 'time_skip' && (s.timeSkipDay === s.day || (this.inCombat && this.inCombat()))) {
        return _activateAbility.call(this, id, target); // its own refusal; no burn
      }
      if (id === 'echo_location' && s.echoDay === s.day) {
        return _activateAbility.call(this, id, target); // its own refusal; no burn
      }
      const kc = this.abilityKcalCost(id, null);
      if ((s.kcal || 0) < kc) { this.say(`Not enough energy — need ${kc} kcal. (${id})`); return false; }
      s.kcal -= kc;
      const r = _activateAbility.call(this, id, target);
      try { this.say(`(−${kc} kcal — food becomes ${String(id).replace(/_/g, ' ')}.)`); } catch (e) {}
      return r;
    } catch (e) { return _activateAbility.call(this, id, target); }
  };

  // _actionAvailable: the hunger gate reaches the buttons — a starving
  // scholar's abilities show "eat first", not a fake affordance.
  const __actionAvailable = Game._actionAvailable;
  if (typeof __actionAvailable === 'function') {
    Game._actionAvailable = function (abilityId, action) {
      try {
        const gate = this.foodPowerGate();
        if (!gate.ok) return { ok: false, why: 'Running on empty — eat first. (Abilities need 500+ kcal.)' };
      } catch (e) {}
      return __actionAvailable.call(this, abilityId, action);
    };
  }

  // activatableAbilities: costs visible BEFORE use, overcharge visible when
  // live. Appended to desc (never the name — app.js keys abilityDescs by name).
  const _activatableAbilities = Game.activatableAbilities;
  Game.activatableAbilities = function () {
    const out = _activatableAbilities.call(this);
    try {
      const oc = this.overchargeLine();
      for (const a of out) {
        // Legacy treatment also pays its own native cost after activation.
        // Display the full bill; this changes no payment or food balance.
        const ab = ((this.data || {}).abilities || []).find(x => x.id === (a.abilityId || a.id));
        const native = a.actionId ? 0 : (((ab || {}).legacyCost || {}).kcal || 0);
        const kc = ((a.cost && a.cost.kcal) || this.abilityKcalCost(a.abilityId, a.actionId)) + native;
        if (kc && !/kcal/.test(a.desc || '')) a.desc = (a.desc ? a.desc + ' ' : '') + `(${kc} kcal)`;
        if (oc && !/OVERCHARGED/.test(a.desc || '')) a.desc = (a.desc ? a.desc + ' ' : '') + oc;
      }
    } catch (e) {}
    return out;
  };

  // tbVillagerAbility: the village tier gates NPC casts. Starving villages
  // conserve every calorie (no casts); tight villages cast only when
  // outmatched; abundant villages earn ONE bonus cast per fight — when the
  // original's per-fight flags would block a cast, one spent flag is cleared
  // and the bonus is spent (the daily scream stays daily).
  const _tbVillagerAbility = Game.tbVillagerAbility;
  if (typeof _tbVillagerAbility === 'function') {
    Game.tbVillagerAbility = function (v) {
      try {
        const tier = this.villageFoodTier();
        if (tier === 'starving') return false;
        if (tier === 'tight') {
          const f = this.tbfight;
          const liveMonsters = ((f && f.fighters) || []).filter(m => m.kind === 'monster' && m.alive && !m.fled);
          if (liveMonsters.length < 2) return false; // conserve unless outmatched
        }
        const r = _tbVillagerAbility.call(this, v);
        if (r || tier !== 'abundant') return r;
        // Abundant bonus: one extra cast per fight. Try each spent per-fight
        // flag; the bonus is spent ONLY when the retry really casts (a blind
        // monster can't be sanded twice — the trigger must hold).
        const f = this.tbfight || {};
        const fid = f.id != null ? f.id : ('r' + (f.round || 0) + 'd' + ((this.state.scholar || {}).day || 0));
        if (v._vBonusFight !== fid) { v._vBonusFight = fid; v._vBonusCasts = 1; }
        if ((v._vBonusCasts || 0) > 0) {
          for (const fl of ['_vSandThrown', '_vLoomed', '_vRaged']) {
            if (!v[fl]) continue;
            v[fl] = false;
            const r2 = _tbVillagerAbility.call(this, v);
            if (r2) { v._vBonusCasts--; return true; }
            v[fl] = true; // trigger didn't hold — restore, bonus unspent
          }
        }
        return r;
      } catch (e) { return _tbVillagerAbility.call(this, v); }
    };
  }
})();
