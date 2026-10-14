// @ontology
// system: modifier-pipeline
// description: The scalability core. Every computed value resolves base -> collect modifiers -> apply adds, then multiplies -> final.
// provides:
//   - resolve(base, target, modifiers, context)
//   - checkCondition(cond, ctx)
//   - levelOf(entry)
//   - scaledValue(m, level)
//   - describeModifier(m, level)   (plain-English modifier rendering for ability cards; exported as Scattering.modifiers.describe)
//   - collectModifiers(scholar, abilitiesData)
//   - hasAbility(scholar, id)
//   - abilityLevel(scholar, id)
//   - ownedEntries(scholar)        (slots + background + skill-lane abilities known via codex skills)
//   - collectKnowledgeModifiers(codexSkills, knowledgeData)
//   - hasKnowledgeUnlock(codexSkills, knowledgeData, unlockId)
// rules:
//   - wildcard_target_all: modifiers with target 'all' apply to every resolution target (code: resolve)
// consumes:
//   - (none documented)
/* The modifier pipeline — the scalability core.
   Every computed value resolves through here:
     base → collect active modifiers → apply adds, then multiplies → final.
   Abilities, relics, injuries, and conditions all speak this one language,
   so new content never touches engine code. */
(function (global) {
  'use strict';

  // A modifier: {target, op: 'add'|'multiply', value, condition?}
  // condition is a string like "biome:se_woodlands" — evaluated by the caller.

  function resolve(base, target, modifiers, context) {
    let add = 0, mul = 1;
    for (const m of modifiers || []) {
      // BREAK-IT abilities 2026-10-10: target 'all' is a wildcard — the
      // Versatile Generalist's "+10% to everything" was dead because no
      // resolution target is literally named 'all'. Documented engine rule.
      if (m.target !== target && m.target !== 'all') continue;
      if (m.condition && context && !checkCondition(m.condition, context)) continue;
      if (m.op === 'add') add += m.value;
      else if (m.op === 'multiply') mul *= m.value;
    }
    return (base + add) * mul;
  }

  function checkCondition(cond, ctx) {
    const [k, v] = cond.split(':');
    // Loose compare: ctx values may be numbers (e.g. round:1).
    return ctx && String(ctx[k]) === String(v);
  }

  // Gather modifiers from a scholar's abilities + relics + injuries.
  // abilitiesData: the abilities.json array. In slice 1 this is passed in;
  // later it comes from a content registry.
  // LEVEL SCALING: a modifier with scale:'level' grows with the ability's level.
  //   multiply: value^level (×1.5 at L1 → ×2.25 at L2)
  //   add: value*level
  // Without scale, the modifier applies flat (L1 values). Background abilities
  // level through use too, so they scale the same way.
  function levelOf(entry) {
    return (entry && entry.level) || 1;
  }

  function scaledValue(m, level) {
    if (!m.scale || m.scale !== 'level' || level <= 1) return m.value;
    if (m.op === 'multiply') return Math.pow(m.value, level);
    return m.value * level; // add
  }

  // ABILITY LANES (2026-10-14): skill-lane abilities (human competences)
  // are owned by knowing their codex skill, not by a slot. The game
  // registers itself as Scattering.Game; for ITS scholar we append the
  // known skill-lane entries ({id, level}) after the slot/background ones.
  // Any other scholar-shaped object (villagers, fixtures) gets none.
  function laneEntries(scholar) {
    const G = global.Scattering && global.Scattering.Game;
    if (!G || !G.state || G.state.scholar !== scholar || typeof G.skillLaneEntries !== 'function') return [];
    return G.skillLaneEntries();
  }
  function ownedEntries(scholar) {
    const base = (scholar.abilities || []).concat(scholar.backgroundAbilities || []);
    const lane = laneEntries(scholar);
    if (!lane.length) return base;
    const have = new Set(base.map(e => (e && e.id) || e));
    return base.concat(lane.filter(e => !have.has(e.id)));
  }

  function collectModifiers(scholar, abilitiesData, synergiesData) {
    const out = [];
    const byId = {};
    // first entry per id wins (matches every .find lookup in the game)
    (abilitiesData || []).forEach(a => { if (!byId[a.id]) byId[a.id] = a; });
    // abilities may be string IDs (legacy) or objects {id, level, xp} (slice 2+).
    // background abilities count too — they're still abilities. Skill-lane
    // abilities count at their skill's level (ownedEntries).
    const all = ownedEntries(scholar);
    all.forEach(entry => {
      const id = (entry && entry.id) || entry;
      // EVOLUTION: evolved forms keep their root's modifiers (look up by
      // evolvedFrom), scaled at the entry's level (3, the capstone).
      const a = byId[id] || (entry && entry.evolvedFrom ? byId[entry.evolvedFrom] : null);
      if (a && a.modifiers) {
        const lvl = levelOf(entry);
        for (const m of a.modifiers) {
          out.push(Object.assign({}, m, { value: scaledValue(m, lvl) }));
        }
      }
      // EVOLUTION (2026-10-11): evolved forms carry their own modifiers on
      // the scholar entry (entry.evolution.modifiers). The root's modifiers
      // still apply via byId above — evolution ADDS, never replaces.
      if (entry && entry.evolution && entry.evolution.modifiers) {
        for (const m of entry.evolution.modifiers) {
          out.push(Object.assign({ source: 'evolution:' + entry.evolution.id }, m));
        }
      }
    });
    // SYNERGIES: discovered synergies grant modifiers too. (Fix 2026-10-09:
    // synergy modifiers were never collected — every synergy reward was dead.)
    const synById = {};
    (synergiesData || []).forEach(s => { synById[s.id] = s; });
    // BREAK-IT abilities 2026-10-09: only ACTIVE synergies (discovered AND
    // currently held) grant modifiers. The old code read scholar.synergies
    // (discovered), so a synergy stayed mechanically live after you lost a
    // leg — pact's Static taking a leg ability, loseAbilityXP dropping a leg
    // below minLevel — while the card promised "active only while held".
    // activeSynergies is recomputed on load/equip/level-up/discovery; states
    // that predate it fall back to discovered (identical to the old behavior).
    const liveSyns = Array.isArray(scholar.activeSynergies) ? scholar.activeSynergies : (scholar.synergies || []);
    for (const sid of liveSyns) {
      const s = synById[sid];
      if (s && s.modifiers) {
        for (const m of s.modifiers) {
          out.push(Object.assign({ source: 'synergy:' + sid }, m));
        }
      }
    }
    // RELICS: bonded relic enhancements speak the same modifier language.
    // Each enhancement maps to real game targets (see RELIC_MOD_MAP).
    // resolve/anchor are special-cased in game.js (not plain modifiers).
    const relics = [];
    const relicHolders = (scholar.inventory || []).concat(Object.values(scholar.equipped || {}));
    relicHolders.forEach(it => {
      if (!it || !it.bonded) return;
      (it.enhancements || []).forEach(eid => {
        (RELIC_MOD_MAP[eid] || []).forEach(m => relics.push(Object.assign({ source: 'relic:' + (it.name || eid) }, m)));
      });
    });
    out.push(...relics);
    // injuries hook in here in later slices (same shape)
    return out;
  }

  // Relic enhancement -> real game modifier targets.
  // The data files use evocative targets (task.speed, despair.anchor);
  // this table grounds them in mechanics the engine actually reads.
  const RELIC_MOD_MAP = {
    efficient_action: [{ target: 'forage.yield', op: 'multiply', value: 1.25 }],
    never_fails: [{ target: 'hunt.success', op: 'add', value: 0.10 }],
    impossible_edge: [{ target: 'cook.kcal', op: 'multiply', value: 1.10 }],
    weatherproof: [{ target: 'travel.cost_mult', op: 'multiply', value: 0.9 }],
    second_skin: [{ target: 'rest.energy', op: 'multiply', value: 1.3 }],
    ghost_weave: [{ target: 'travel.encounter', op: 'multiply', value: 0.6 }],
    quiet_luck: [{ target: 'forage.yield', op: 'multiply', value: 1.1 }],
    // --- variability expansion: hidden/rare, affinity, and secret evolutions ---
    whisper_edge: [{ target: 'travel.encounter', op: 'multiply', value: 0.7 }],
    storm_cloth: [{ target: 'travel.cost_mult', op: 'multiply', value: 0.85 }],
    unseen_hand: [{ target: 'forage.yield', op: 'multiply', value: 1.15 }],
    careful_hands: [{ target: 'forage.yield', op: 'multiply', value: 1.2 }],
    blood_remembers: [{ target: 'hunt.success', op: 'add', value: 0.15 }],
    // RELIC HONESTY (hunter break-it 2026-10-10): butchers_friend's card
    // promises "Carcass utilization +15%" but the enhancement was missing
    // here — dead at runtime, the card lied. Utilization is waste reduction:
    // it now feeds hunt.meat_yield, which butcherYieldFrac applies at the
    // cleaning, capped at 0.95 of the species-honest gross.
    butchers_friend: [{ target: 'hunt.meat_yield', op: 'multiply', value: 1.15 }],
    quick_spark: [{ target: 'forage.yield', op: 'multiply', value: 1.15 }],
    trail_ghost: [{ target: 'travel.encounter', op: 'multiply', value: 0.6 }],
    steady_ground: [{ target: 'travel.cost_mult', op: 'multiply', value: 0.9 }],
    open_hearth: [{ target: 'trust.gain_mult', op: 'multiply', value: 1.25 }],
    unbreakable: [{ target: 'rest.energy', op: 'multiply', value: 1.2 }],
    her_handwriting: [{ target: 'trust.gain_mult', op: 'multiply', value: 1.5 }],
    last_message: [{ target: 'rest.energy', op: 'multiply', value: 1.5 }],
    inheritance: [{ target: 'trust.gain_mult', op: 'multiply', value: 1.5 }],
    old_ghost: [{ target: 'hunt.success', op: 'add', value: 0.2 }],
    // RELIC HONESTY (audit 2026-10-14): these ids were offerable but had no
    // line here, so their cards lied. Each is copied 1:1 from its effect in
    // relicEnhancements.json; every target below has a live modTarget reader.
    many_pockets: [{ target: 'carry.weight_mult', op: 'multiply', value: 1.15 }],
    warm_bones: [{ target: 'travel.cost_mult', op: 'multiply', value: 0.9 }],
    stay_put: [{ target: 'healing.amount', op: 'add', value: 4 }],
    rain_funnel: [{ target: 'water.rain_catch', op: 'add', value: 1 }],
    light_feet: [{ target: 'combat.dodge_chance', op: 'add', value: 0.05 }],
    smoke_keeper: [{ target: 'food.spoilage_days', op: 'add', value: 1 }],
    calm_stone: [{ target: 'drama.resolve_bonus', op: 'add', value: 4 }],
    true_measure: [{ target: 'craft.success', op: 'multiply', value: 1.15 }],
    patient_wire: [{ target: 'hunt.trap_catch', op: 'add', value: 0.08 }],
    glass_eye: [{ target: 'hunt.find_chance', op: 'add', value: 0.1 }],
    hot_stone: [{ target: 'cook.kcal', op: 'multiply', value: 1.1 }],
    field_guide: [{ target: 'forage.learn_threshold', op: 'multiply', value: 0.9 }],
    tasters_spoon: [{ target: 'food.poison_chance', op: 'multiply', value: 0.7 }],
    grey_cloak: [{ target: 'travel.encounter_chance', op: 'multiply', value: 0.75 }],
    winter_lining: [{ target: 'travel.cost_mult', op: 'multiply', value: 0.92 }],
    quiet_soles: [{ target: 'monster.hear_mult', op: 'multiply', value: 0.85 }],
    spare_plating: [{ target: 'armor.flat', op: 'add', value: 2 }],
    lucky_coin: [{ target: 'luck.global', op: 'multiply', value: 1.15 }],
    come_home: [{ target: 'health.max_add', op: 'add', value: 10 }],
    ledger_of_debts: [{ target: 'drama.resolve_bonus', op: 'add', value: 5 }],
    hearth_song: [{ target: 'rest.energy', op: 'multiply', value: 1.2 }],
    mothers_compass: [{ target: 'trust.gain_mult', op: 'multiply', value: 1.3 }],
    harvest_memory: [{ target: 'forage.gift_chance', op: 'add', value: 0.05 }],
    // NOT WIRED (needs Steve; see scripts/test-relic-mod-map-20261014.js):
    //   forest_scent  — "monster detection -8%", but monster.detect_chance is
    //                   the PLAYER spotting monsters; copying it would hurt.
    //   blood_bonded  — abilityHook grant; no hook reads it.
    //   path_attuned  — ability.kcal_cost; nothing reads that target.
    //   veterans_edge — buildaround.charge_rate; nothing reads that target.
    // resolve (morale.break_immunity): once/day ignore starvation health damage — game.js
    // anchor (despair.anchor): hold at 1 HP once/30 days — game.js
  };

  // hasAbility: does this scholar hold the ability? Works for string IDs and objects,
  // system abilities and background abilities. Returns the entry (or level via .level).
  function hasAbility(scholar, id) {
    const all = ownedEntries(scholar);
    return all.find(entry => {
      const eid = ((entry && entry.id) || entry);
      if (eid === id) return true;
      // EVOLUTION LINEAGE (2026-10-11): an evolved ability counts as its root
      // for synergy legs, hooks, and level checks. The root is never lost.
      if (entry && entry.evolvedFrom === id) return true;
      return false;
    }) || null;
  }

  function abilityLevel(scholar, id) {
    const e = hasAbility(scholar, id);
    return e ? (e.level || 1) : 0;
  }

  // KNOWLEDGE MODIFIERS: skills from the knowledge taxonomy feed the same pipeline.
  // Knowledge isn't separate from powers — it AMPLIFIES them.
  // Takes codex.skills {skillId: {level}} and knowledge data, returns modifier objects.
  // Mechanical keys map to modifier targets (same language as abilities/relics).
  //
  // BREAK-IT abilities 2026-10-10 (sibling sweep): 19 of these 25 keys
  // emitted targets NOTHING reads (hunt.find vs the engine's hunt.find_chance,
  // food.spoil vs food.spoilage_days, ...). The skills' mechanicals were
  // doubly dead: allModifiers() had no callers AND the emissions missed.
  // Retargeted below to live engine targets where the mapping is
  // unambiguous. Keys with no honest live target (night-gated night_hunt /
  // night_spot — no ctx support; animal_calm, craft_quality, trust_read,
  // morale_boost, combat_focus, desertion_resist, grief_recover, system_hide)
  // stay unmapped and are dropped — a documented gap for content work, not
  // silent: adding an engine target for any of them lights the skill up.
  const KNOWLEDGE_MOD_MAP = {
    // key in knowledge.json mechanical -> modifier target
    'fuel_save': (v) => [{ target: 'fire.fuel', op: 'multiply', value: 1 - v }],
    'fire_success': (v) => [{ target: 'fire.success', op: 'add', value: v }],
    'fire_heat': (v) => [{ target: 'fire.heat', op: 'add', value: v }],
    // BREAK-IT abilities 2026-10-09: was 'heal.amount' — a target nothing
    // reads (the engine's healing target is 'healing.amount'). Every
    // knowledge skill granting heal_bonus was silently doing nothing.
    'heal_bonus': (v) => [{ target: 'healing.amount', op: 'add', value: v }],
    // BREAK-IT abilities 2026-10-10: was 'hunt.find' — nothing reads it.
    // The engine's find target is 'hunt.find_chance' (encounters/game.js).
    'hunt_find': (v) => [{ target: 'hunt.find_chance', op: 'multiply', value: 1 + v }],
    // BREAK-IT abilities 2026-10-10: was 'hunt.success' — nothing reads it.
    // Tracking finds game: same live target as hunt_find.
    'hunt_success': (v) => [{ target: 'hunt.find_chance', op: 'multiply', value: 1 + v }],
    // BREAK-IT abilities 2026-10-10: was 'trap.success' — nothing reads it.
    // The engine's trap target is 'hunt.trap_catch' (base 0.4, cap 0.95).
    'trap_success': (v) => [{ target: 'hunt.trap_catch', op: 'add', value: v }],
    'combat_crit': (v) => [{ target: 'combat.crit', op: 'add', value: v }],
    // BREAK-IT abilities 2026-10-10: was 'combat.damage' — nothing reads it.
    // The engine's generic damage target is 'combat.strike_damage'.
    'combat_damage': (v) => [{ target: 'combat.strike_damage', op: 'multiply', value: 1 + v }],
    // BREAK-IT abilities 2026-10-10: was 'food.spoil' — nothing reads it.
    // More spoilage_days IS slower spoilage (engine: food.spoilage_days).
    'spoil_slow': (v) => [{ target: 'food.spoilage_days', op: 'multiply', value: 1 + v }],
    'trust_gain': (v) => [{ target: 'trust.gain_mult', op: 'multiply', value: 1 + v }],
    'lie_detect': (v) => [{ target: 'social.lie_detect', op: 'add', value: v }],
    'conflict_resolve': (v) => [{ target: 'social.conflict_resolve', op: 'add', value: v }],
    'fear_resist': (v) => [{ target: 'psych.fear_resist', op: 'add', value: v }],
    'village_morale': (v) => [{ target: 'village.morale', op: 'add', value: v }],
    'storm_warning': (v) => [{ target: 'weather.warning', op: 'add', value: v }],
    'ambush_avoid': (v) => [{ target: 'combat.ambush_avoid', op: 'add', value: v }],
    'scout_find': (v) => [{ target: 'scout.find', op: 'add', value: v }],
    'scavenge_find': (v) => [{ target: 'scavenge.find', op: 'add', value: v }],
    'travel_lost': (v) => [{ target: 'travel.lost', op: 'add', value: v }],
    'party_damage': (v) => [{ target: 'party.damage', op: 'multiply', value: 1 + v }],
    'party_coord': (v) => [{ target: 'party.coord', op: 'add', value: v }],
    'disease_resist': (v) => [{ target: 'health.disease_resist', op: 'add', value: v }],
    'system_favor': (v) => [{ target: 'system.favor', op: 'add', value: v }],
    'shelter_warmth': (v) => [{ target: 'shelter.warmth', op: 'add', value: v }],
    // BREAK-IT abilities 2026-10-10: was 'forage.find' — nothing reads it.
    // The engine's forage target is 'forage.yield' (relic map precedent).
    'forage_find': (v) => [{ target: 'forage.yield', op: 'multiply', value: 1 + v }],
    // BREAK-IT abilities 2026-10-10: new keys for the fishing/foraging
    // skills (knowledge.json). The gill-net check reads fishing.yield /
    // fishing.rare_chance through mods().
    'fish_yield': (v) => [{ target: 'fishing.yield', op: 'multiply', value: 1 + v }],
    'fish_rare': (v) => [{ target: 'fishing.rare_chance', op: 'add', value: v }],
    'forage_yield': (v) => [{ target: 'forage.yield', op: 'multiply', value: 1 + v }],
  };

  function collectKnowledgeModifiers(codexSkills, knowledgeData) {
    const out = [];
    if (!codexSkills || !knowledgeData) return out;
    for (const [skillId, entry] of Object.entries(codexSkills)) {
      const k = knowledgeData.find(x => x.id === skillId);
      if (!k || !k.mechanical) continue;
      const level = (entry && entry.level) || 1;
      // mechanical effects are keyed by level: {"1": {...}, "2": {...}}
      // apply all levels up to current (cumulative)
      for (let l = 1; l <= level; l++) {
        const mech = k.mechanical[String(l)];
        if (!mech) continue;
        for (const [key, val] of Object.entries(mech)) {
          if (key === 'unlock') continue; // unlocks are handled separately, not as modifiers
          const mapper = KNOWLEDGE_MOD_MAP[key];
          if (mapper) {
            out.push(...mapper(val).map(m => Object.assign({ source: 'knowledge:' + skillId }, m)));
          }
        }
      }
    }
    return out;
  }

  // hasKnowledgeUnlock: does the scholar's knowledge unlock a specific action?
  function hasKnowledgeUnlock(codexSkills, knowledgeData, unlockId) {
    if (!codexSkills || !knowledgeData) return false;
    for (const [skillId, entry] of Object.entries(codexSkills)) {
      const k = knowledgeData.find(x => x.id === skillId);
      if (!k || !k.mechanical) continue;
      const level = (entry && entry.level) || 1;
      for (let l = 1; l <= level; l++) {
        const mech = k.mechanical[String(l)];
        if (mech && mech.unlock === unlockId) return true;
      }
    }
    return false;
  }

  // describeModifier: plain-English rendering of a modifier for ability cards
  // (Steve 2026-10-12: cards printed raw engine data — "travel.cost_mult
  // multiply 0.85" — which reads as dev jargon next to the flavor text).
  // Every known (target, op) pair gets a template; unknown pairs fall back
  // to a cleaned generic ("travel.cost_mult ×0.85") so the card never lies
  // and never speaks engine. Level scaling mirrors scaledValue().
  function describeModifier(m, level) {
    if (!m || !m.target) return null;
    var v = m.value;
    if (m.scale === 'level' && level > 1) {
      v = (m.op === 'multiply') ? Math.pow(m.value, level) : m.value * level;
    }
    var T = MOD_NOUNS[m.target];
    if (!T) {
      // cleaned generic fallback — better than "multiply 0.85"
      var gv = (m.op === 'multiply') ? '×' + trimNum(v) : '+' + trimNum(v);
      return m.target + ' ' + gv;
    }
    if (T.custom) return T.custom(m.op, v);
    if (m.op === 'multiply') {
      if (v > 1) return '+' + pct(v - 1) + ' ' + T.more;
      if (v < 1) return pct(1 - v) + ' less ' + T.less;
      return null; // ×1: no effect, say nothing
    }
    // add
    if (T.chance) return '+' + pct(v) + ' ' + T.noun;
    return '+' + trimNum(v) + ' ' + T.noun;
  }
  function pct(x) { return Math.round(x * 100) + '%'; }
  function trimNum(x) {
    if (!isFinite(x)) return '?';
    return (Math.round(x * 100) / 100).toString();
  }
  // MOD_NOUNS: per-target plain nouns. `more`/`less` are the multiply
  // phrasings (v>1 good-news / v<1 reduction); `noun` is the add phrasing
  // with `chance:true` for probability-point adds (shown as %).
  var MOD_NOUNS = {
    'travel.cost_mult':        { more: 'travel cost', less: 'travel cost' },
    'travel.encounter_chance': { more: 'run-ins while traveling', less: 'run-ins while traveling' },
    'carry.weight_mult':       { more: 'pack weight', less: 'pack weight' },
    'combat.strike_damage':    { more: 'strike damage', less: 'strike damage' },
    'combat.first_strike_damage': { more: 'first-strike damage', less: 'first-strike damage' },
    'combat.heavy_damage':     { more: 'heavy damage', less: 'heavy damage' },
    'combat.dodge_chance':     { noun: 'dodge chance', chance: true },
    'combat.trade_window':     { noun: 'attack when trading blows' },
    'craft.success':           { more: 'crafting success', less: 'crafting success' },
    'drama.resolve_bonus':     { noun: 'resolve when settling village drama' },
    'fire.heat':               { noun: 'fire heat (each point: fires burn ~25% stronger)' },
    'fire.success':            { noun: 'fire-starting success', chance: true },
    'food.bank_mult':          { custom: function (op, v) { return (op === 'multiply' ? trimNum(v) + 'x calorie bank' : '+' + trimNum(v) + ' calorie bank'); } },
    'food.eat_target_mult':    { custom: function (op, v) { return (op === 'multiply' ? trimNum(v) + 'x meal size' : '+' + trimNum(v) + ' meal size'); } },
    'food.poison_chance':      { more: 'food-poisoning risk', less: 'food-poisoning risk' },
    'food.spoilage_days':      { noun: 'days before food spoils' },
    'forage.gift_chance':      { more: 'forage gift chance', less: 'forage gift chance', noun: 'forage gift chance', chance: true },
    'healing.amount':          { more: 'healing', less: 'healing' },
    'health.max_add':          { noun: 'max health' },
    'hunt.find_chance':        { more: 'chance to find game', less: 'chance to find game' },
    'hunt.meat_yield':         { more: 'meat from carcasses', less: 'meat from carcasses' },
    'hunt.trap_catch':         { more: 'trap catches', less: 'trap catches' },
    'luck.global':             { more: 'luck', less: 'luck' },
    'monster.detect_chance':   { more: 'early warning of monsters', less: 'early warning of monsters', noun: 'early warning of monsters', chance: true },
    'monster.hear_mult':       { custom: function (op, v) { return (op === 'multiply' && v > 1) ? 'monsters hear you ' + trimNum(v) + 'x as well' : (op === 'multiply' ? pct(1 - v) + ' less noticeable to monsters' : '+' + trimNum(v) + ' monster hearing'); } },
    'ruin.find_mult':          { more: 'ruin finds', less: 'ruin finds', noun: 'ruin finds', chance: true },
    'social.intimidate':       { noun: 'intimidation', chance: true },
    'social.lie_detect':       { noun: 'lie detection', chance: true },
    'stealth.move_silent':     { more: 'silent movement', less: 'silent movement', noun: 'silent movement', chance: true },
    'trust.gain_mult':         { more: 'trust gained', less: 'trust gained', noun: 'trust gained', chance: true },
    'water.rain_catch':        { more: 'rainwater caught', less: 'rainwater caught', noun: 'L rainwater caught' },
    'armor.flat':              { noun: 'armor' },
  };

  global.Scattering = global.Scattering || {};
  global.Scattering.modifiers = { resolve, collectModifiers, checkCondition, collectKnowledgeModifiers, hasKnowledgeUnlock, describe: describeModifier, MOD_NOUNS: MOD_NOUNS };
  global.Scattering.hasAbility = hasAbility;
  global.Scattering.abilityLevel = abilityLevel;
  global.Scattering.ownedAbilityEntries = ownedEntries;
})(typeof window !== 'undefined' ? window : globalThis);
