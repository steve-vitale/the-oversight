// @ontology
// system: godhood
// description: Godhood capstones — Steve 2026-10-11, requirements reworked
//   2026-10-13, unified with the god paths 2026-10-14. Each of the 10 god
//   paths (src/data/godpaths.json) has ONE god; this module derives the
//   capstone list from that file plus the path tags on abilities.json
//   (godhood.json is retired). A player or villager ascends when their
//   recognised CLASS is on the path, they hold the subclass payoff and 4+
//   magic abilities of the path, and they have done the god's deed: day 80+
//   and a discovered synergy that uses an ability of the path. The game
//   then plays a 5-beat ceremony, grants ONE qualitative godly verb (the
//   capstone item is the System's gift, not a gate), and permanently
//   transforms their visual. Each capstone keeps its weakness.
//   Knowledge-gated: the capstone is felt only once the class is named and
//   3+ path abilities are held. Death/respawn resets it.
// provides:
//   - godhoods() / allGodhoods() / byId(id) / deriveGodhoods(godpaths, abilities, synergies)
//   - checkGodhood(scholar, day) -> [godhoodIds newly completed]
//   - godhoodCloseness(scholar, gh, day) -> {kit, needKit, core, synergy, item, dayOk, close}
//   - villagerGodhoodCloseness(game, vid, gh) -> same, for villagers
//   - checkVillagerGodhood(game, vid) -> [godhoodIds newly completed]
//   - recognitionCeremony(game, ghId) -> plays the 5-beat ceremony (player)
//   - villagerRecognitionCeremony(game, vid, ghId) -> ceremony for a villager
//   - mythicSprite(ghId) -> 32x32 SVG string (mythic form, no background)
//   - playerMythicId(scholar) -> godhood id or null (for sprite hook)
//   - godhoodBargaining(scholar) -> leverage bonus for the table
//   - capstone verbs: raiseEcho, chooseTerms, feedMultitude, turnPain,
//     noLiesCheck, namePrice, buyOff, walkHorizon, phaseOut, takeWound
//   - market debt: marketMarkers(sch), auditDue(sch) — 3 markers → the Audit
// consumes:
//   - scholar.abilities, scholar.activeSynergies, scholar.inventory
//   - village.npcAbilities, village.npcSynergies, person.items (villagers)
//   - S.ITEM_TIER (item id -> loot tier, injected at load)
//   - game.say, game.sysSay, game.broadcastStart (ceremony)
// rules:
//   - No stat-stick capstones. Every verb is qualitative AND measured.
//   - Every capstone has a real cost or limit. The weakness stays.
//   - The ceremony is PLAYED (say/sysSay beats), never a popup.
//   - Mythic sprites sit ON the grid: no background, tile shows through.
//   - Endgame only: minDay 80 (Steve 2026-10-13). No mid-game godhood.
(function (global) {
  'use strict';
  const S = global.Scattering = global.Scattering || {};

  // GOD-PATH REDESIGN (2026-10-14): the capstones are DERIVED from
  // src/data/godpaths.json (S.GODPATHS, set by Game.init) + the path tags on
  // abilities.json. godhood.json is retired: one source of truth. Each
  // path's god keeps its old id, so old saves' recognized/active lists, the
  // verbs and the mythic sprites keep working. A retired god (farstrider) is
  // resolvable by id (ceremony text, mythic) but never newly reachable.
  let _derived = null, _dKey = null, _dAb = null, _dSyn = null;
  function abilityList() {
    try { return (S.Game && S.Game.data && S.Game.data.abilities) || S.ABILITIES || []; } catch (e) { return []; }
  }
  function synergyList() {
    try { return (S.Game && S.Game.data && S.Game.data.synergies) || S.SYNERGIES || []; } catch (e) { return []; }
  }
  function deriveGodhoods(gp, abil, syns) {
    const rules = (gp.rules || {}).capstone || {};
    const out = [];
    let build = 0;
    for (const pid of Object.keys(gp.paths || {})) {
      const p = gp.paths[pid];
      const g = p.god || {};
      build++;
      const onPath = (a) => a && (a.path === pid || a.alsoPath === pid);
      const pool = abil.filter(a => a.lane === 'magic' && onPath(a)).map(a => a.id);
      const anyLane = new Set(abil.filter(onPath).map(a => a.id));
      const cores = Object.keys(p.subclasses || {}).map(k => p.subclasses[k].payoff).filter(Boolean);
      const synIds = new Set(g.deedSynergies || []);
      for (const sy of syns) {
        const legs = (sy.requires || []).map(l => String(l).split(':').pop());
        if (legs.some(l => anyLane.has(l))) synIds.add(sy.id);
      }
      out.push({
        id: g.id, name: g.name, path: pid, build, fantasy: g.fantasy, hint: g.hint,
        mythic: g.mythic || { title: g.name, desc: '' },
        recognition: g.recognition || { beat: '', systemLine: '' },
        capstone: { verb: g.verb, desc: g.desc, mechanic: g.mechanic, cost: g.cost, weakness: g.weakness },
        scale: g.scale || {},
        requires: {
          path: pid, needsClass: true,
          abilityPool: pool, coreAbilities: cores,
          abilitiesNeeded: rules.abilitiesNeeded || 4,
          synergies: Array.from(synIds),
          deedAlt: g.deedAlt || null,
          itemTiers: [], minDay: rules.minDay != null ? rules.minDay : 80,
          closeAt: rules.closeAt || 3,
          capstoneItems: g.capstoneItems || [],
        },
      });
    }
    for (const rid of Object.keys(gp.retired || {})) {
      const r = gp.retired[rid];
      out.push(Object.assign({}, r, { id: r.id || rid, retired: true }));
    }
    return out;
  }
  function allGodhoods() {
    const gp = S.GODPATHS;
    if (!gp || !gp.paths) return [];
    const ab = abilityList(), sy = synergyList();
    if (_derived && _dKey === gp && _dAb === ab && _dSyn === sy) return _derived;
    _derived = deriveGodhoods(gp, ab, sy); _dKey = gp; _dAb = ab; _dSyn = sy;
    return _derived;
  }
  // godhoods(): the reachable capstones (one per path).
  function godhoods() {
    return allGodhoods().filter(g => !g.retired);
  }
  function byId(id) {
    return allGodhoods().find(g => g.id === id) || null;
  }
  // classOf(ids): the god-path class an id list adds up to (godpath.js).
  function classOf(ids) {
    try { return (S.Godpath && S.Godpath.classify) ? S.Godpath.classify(Array.from(ids)) : null; } catch (e) { return null; }
  }

  // --- state helpers (pure, testable) ---
  function scholarAbilities(sch) {
    const out = new Set();
    // An evolved ability counts as its root too (chooseEvolution replaces
    // ab.id and keeps the root in evolvedFrom).
    // ABILITY LANES (2026-10-14): skill-lane abilities known via codex
    // skills count as held (one ownership helper, engine/modifiers.js).
    const S_ = global.Scattering || {};
    const owned = (typeof S_.ownedAbilityEntries === 'function') ? S_.ownedAbilityEntries(sch)
      : (sch.abilities || []).concat(sch.backgroundAbilities || []);
    for (const a of owned) {
      out.add(typeof a === 'string' ? a : (a.id || a));
      if (a && a.evolvedFrom) out.add(a.evolvedFrom);
    }
    return out;
  }
  function scholarSynergies(sch) {
    return new Set(sch.activeSynergies || []);
  }
  function scholarItems(sch) {
    const out = new Set();
    for (const it of (sch.inventory || [])) {
      const id = it.itemId || it.id;
      if (id) out.add(id);
    }
    // equipped gear counts too
    const eq = sch.equipment || sch.equipped || {};
    for (const k of Object.keys(eq)) {
      const it = eq[k];
      if (it && (it.itemId || it.id)) out.add(it.itemId || it.id);
    }
    return out;
  }

  // itemTier: loot tier of an item id, via S.ITEM_TIER (injected at load from
  // items.json). Unknown items are tier 0 — they never satisfy a tier gate.
  function itemTier(itemId) {
    try { return ((S.ITEM_TIER || {})[itemId]) || 0; } catch (e) { return 0; }
  }

  // capstoneItemFor(gh): the named capstone item id for the System's
  // recognition gift (first of capstoneItems, else null).
  function capstoneItemFor(gh) {
    const req = gh.requires || {};
    const named = req.capstoneItems || req.items || [];
    return named.length ? named[0] : null;
  }
  function godhoodItemOk(gh, itemIds) {
    const req = gh.requires || {};
    const named = req.capstoneItems || req.items || [];
    if (named.length && itemIds.some(id => named.includes(id))) return true;
    const tiers = req.itemTiers || [];
    if (tiers.length && itemIds.some(id => tiers.includes(itemTier(id)))) return true;
    // back-compat: old format with requires.items as the ONLY gate
    return false;
  }

  // poolProgress(abs, gh): how many of the godhood's ability pool are held,
  // and whether a core ability (build identity) is held.
  // GOD-PATH (2026-10-14): with a recognised class on this path, the core is
  // the payoff of the recognised SUBCLASS; without one, any payoff of the path.
  function poolProgress(abs, gh) {
    const req = gh.requires || {};
    const pool = req.abilityPool || req.abilities || [];
    let cores = req.coreAbilities || [];
    const cls = req.needsClass ? classOf(abs) : null;
    let classOk = !req.needsClass || !!(cls && cls.path === req.path);
    if (req.needsClass && cls && cls.path === req.path && cls.subclass) {
      try {
        const sub = (((S.GODPATHS || {}).paths || {})[req.path] || {}).subclasses || {};
        const pay = (sub[cls.subclass] || {}).payoff;
        if (pay) cores = [pay];
      } catch (e) { /* subclass lookup failed: any payoff of the path counts */ }
    }
    const kit = pool.filter(a => abs.has(a));
    const coreHit = cores.length ? cores.some(c => abs.has(c)) : true;
    const need = req.abilitiesNeeded || pool.length;
    return { kit: kit.length, needKit: need, coreHit, needCore: cores.length > 0, pool, classOk, cls, cores };
  }

  // buildReadyForCapstone(cl): everything except the item is complete.
  // The System recognizes a finished build with the capstone item — the work
  // was the build; the item is the seal, not a lottery.
  // GOD-PATH (2026-10-14): the item is no longer a gate. A complete build
  // is ready for the System's gift (the named capstone item), given right
  // before the ceremony (game.js maybeGrantCapstoneItem).
  function buildReadyForCapstone(cl) {
    return !!cl.complete;
  }

  // godhoodCloseness(scholar, gh, day): how close to completion. Knowledge-gated
  // hints use `close` (3+ pool abilities) without naming the capstone.
  // day: current day for the endgame floor (minDay 80 — Steve 2026-10-13:
  // no mid-game godhood). Pass 0/undefined to skip the day gate (tests).
  function godhoodCloseness(sch, gh, day) {
    if (gh.retired) return { kit: 0, needKit: 0, coreHit: false, needCore: false, synergy: false, item: true, dayOk: false, classOk: false, complete: false, close: false, readyForCapstone: false };
    const abs = scholarAbilities(sch);
    const syns = scholarSynergies(sch);
    const pp = poolProgress(abs, gh);
    const req = gh.requires || {};
    let synergy = (req.synergies || []).some(x => syns.has(x));
    // The Relay office is the Socialite's alternative deed (Voice of the Relay).
    if (!synergy && req.deedAlt === 'relay_office') {
      try {
        const sw = (typeof Game !== 'undefined' && Game.state && Game.state.switchboard) || {};
        synergy = !!(sw.holderId && sch.villagerId && sw.holderId === sch.villagerId);
      } catch (e) { /* no switchboard: the synergy deed stands alone */ }
    }
    const dayOk = (day || 0) >= (req.minDay || 0);
    const cl = {
      kit: pp.kit, needKit: pp.needKit, coreHit: pp.coreHit, needCore: pp.needCore,
      classOk: pp.classOk, synergy, item: true, dayOk,
      complete: pp.classOk && pp.kit >= pp.needKit && pp.coreHit && synergy && dayOk,
      // knowledge-gated: the god is felt only once the class is named and the
      // build is most of the way there
      close: pp.classOk && pp.kit >= (req.closeAt || 3),
    };
    cl.readyForCapstone = buildReadyForCapstone(cl);
    return cl;
  }

  // checkGodhood(scholar, day): returns ids of NEWLY completed godhoods (not yet
  // recognized). Recognition state lives on scholar.godhood = { recognized: {id: day}, active: [ids] }.
  function checkGodhood(sch, day) {
    const g = sch.godhood || (sch.godhood = { recognized: {}, active: [] });
    const out = [];
    for (const gh of godhoods()) {
      if (g.recognized[gh.id]) continue;
      if (godhoodCloseness(sch, gh, day).complete) out.push(gh.id);
    }
    return out;
  }

  // --- villager godhood (Steve 2026-10-13 metric: villagers occasionally
  // obtain godhood by sim run end, 5-15% of runs) ---
  function villagerAbilities(game, vid) {
    try {
      // UNIFIED TRACKS (2026-10-14): pools hold skills too — count the
      // villager's known skills (npcOwnedIds), like the player's ownedAbilityIds.
      if (typeof game.npcOwnedIds === 'function') return new Set(game.npcOwnedIds(vid));
      const v = (game.state || {}).village || {};
      return new Set(((v.npcAbilities || {})[vid] || []));
    } catch (e) { return new Set(); }
  }
  function villagerSynergies(game, vid) {
    try {
      const v = (game.state || {}).village || {};
      return new Set(((v.npcSynergies || {})[vid] || []));
    } catch (e) { return new Set(); }
  }
  function villagerItems(game, vid) {
    const out = new Set();
    try {
      const p = game.getPerson ? game.getPerson(vid) : null;
      for (const it of ((p && p.items) || [])) {
        out.add(typeof it === 'string' ? it : (it.itemId || it.id));
      }
    } catch (e) {}
    return out;
  }

  // villagerGodhoodCloseness(game, vid, gh): same requirement model as the
  // player, read from villager stores. The relay office path is player-only.
  function villagerGodhoodCloseness(game, vid, gh) {
    if (gh.retired) return { kit: 0, needKit: 0, coreHit: false, needCore: false, synergy: false, item: true, dayOk: false, classOk: false, complete: false, close: false, readyForCapstone: false, vid };
    const abs = villagerAbilities(game, vid);
    const syns = villagerSynergies(game, vid);
    const pp = poolProgress(abs, gh);
    const req = gh.requires || {};
    const synergy = (req.synergies || []).some(x => syns.has(x));
    const day = ((game.state || {}).scholar || {}).day || (game.state || {}).day || 0;
    const dayOk = day >= (req.minDay || 0);
    const cl = {
      kit: pp.kit, needKit: pp.needKit, coreHit: pp.coreHit, needCore: pp.needCore,
      classOk: pp.classOk, synergy, item: true, dayOk,
      complete: pp.classOk && pp.kit >= pp.needKit && pp.coreHit && synergy && dayOk,
      close: pp.classOk && pp.kit >= (req.closeAt || 3),
      vid,
    };
    cl.readyForCapstone = buildReadyForCapstone(cl);
    return cl;
  }

  // checkVillagerGodhood(game, vid): newly completed godhoods for a villager.
  // Recognition state lives on village.npcGodhood[vid] = { recognized: {id: day}, active: [ids] }.
  function checkVillagerGodhood(game, vid) {
    const v = (game.state || {}).village || {};
    v.npcGodhood = v.npcGodhood || {};
    const g = v.npcGodhood[vid] || (v.npcGodhood[vid] = { recognized: {}, active: [] });
    const out = [];
    for (const gh of godhoods()) {
      if (g.recognized[gh.id]) continue;
      if (villagerGodhoodCloseness(game, vid, gh).complete) out.push(gh.id);
    }
    return out;
  }

  function villagerMythicId(game, vid) {
    try {
      const g = ((game.state || {}).village || {}).npcGodhood || {};
      const v = g[vid];
      if (!v || !v.active || !v.active.length) return null;
      return v.active[0];
    } catch (e) { return null; }
  }

  function playerMythicId(sch) {
    const g = sch.godhood;
    if (!g || !g.active || !g.active.length) return null;
    return g.active[0]; // first ascension defines the mythic form
  }

  // godhoodBargaining(scholar): the table prices the run — a god is worth
  // more. Each recognized godhood adds bargaining leverage.
  function godhoodBargaining(sch) {
    const g = sch.godhood;
    if (!g || !g.active) return 0;
    let bonus = g.active.length * 3; // each godhood: +3 bargaining strength
    // MARKET GOD 2.0: the god of price sets the price. At the table, the
    // Market God doesn't bargain — it NAMES. +7 on top of the generic +3.
    if ((g.active || []).includes('market_god')) bonus += 7;
    return bonus;
  }

  // --- capstone verbs (called by game systems; pure-ish, game mediates) ---

  // Shepherd: raiseEcho — called on ally death in a fight the player is in.
  // Returns echo descriptor or null (already used this fight / not ascended).
  function raiseEcho(sch, ally) {
    const g = sch.godhood || {};
    if (!(g.active || []).includes('shepherd_of_the_dead')) return null;
    const used = (g.capstoneUsed || {});
    if (used.raiseEcho) return null; // once per fight
    used.raiseEcho = true;
    sch.godhood.capstoneUsed = used;
    return {
      verb: 'raiseEcho',
      allyId: ally.id || ally.vid,
      allyName: ally.name,
      rounds: 3,
      // the echo fights as themselves: stats snapshot
      stats: { hp: ally.hp || ally.health || 30, dmg: ally.dmg || 8 },
      final: true, // this death is final — no second raising
    };
  }
  function resetFightVerbs(sch) {
    // call at fight start: once-per-fight verbs refresh
    if (sch.godhood) sch.godhood.capstoneUsed = {};
  }

  // Apex: chooseTerms — pre-fight choice. Returns the chosen setup.
  function chooseTerms(sch, choice) {
    const g = sch.godhood || {};
    if (!(g.active || []).includes('apex_predator')) return null;
    const valid = { ambush: 1, range: 1, ground: 1 };
    if (!valid[choice]) return null;
    const used = (g.capstoneUsed || {});
    if (used.chooseTerms) return null; // set before the first blow, can't re-choose
    used.chooseTerms = choice;
    sch.godhood.capstoneUsed = used;
    return {
      verb: 'chooseTerms', choice,
      ambush: choice === 'ambush' ? { firstStrike: true, unseen: true } : null,
      range: choice === 'range' ? { idealDistance: true } : null,
      ground: choice === 'ground' ? { terrainEdge: true } : null,
    };
  }

  // Garden: feedMultitude — once per day, army-scale food. Costs 200 kcal.
  function feedMultitude(sch) {
    const g = sch.godhood || {};
    if (!(g.active || []).includes('living_garden')) return null;
    const used = (g.capstoneUsed || {});
    if (used.feedMultitude) return null; // once per day (reset on dawn)
    if ((sch.kcal || 0) < 200) return { verb: 'feedMultitude', ok: false, why: 'Need 200 kcal of your own — the garden gives through you.' };
    used.feedMultitude = true;
    sch.godhood.capstoneUsed = used;
    sch.kcal = (sch.kcal || 0) - 200;
    return {
      verb: 'feedMultitude', ok: true,
      feeds: 50, // mouths fed — titan-coalition scale
      note: 'The harvest comes up through your hands. Fifty mouths eat because you asked.',
    };
  }
  function resetDayVerbs(sch) {
    // call at dawn: once-per-day verbs refresh
    if (!sch.godhood || !sch.godhood.capstoneUsed) return;
    delete sch.godhood.capstoneUsed.feedMultitude;
    delete sch.godhood.capstoneUsed.namePrice;
    delete sch.godhood.capstoneUsed.walkHorizon;
    try { guardRegen(sch); } catch (e) {}
  }

  // Army: turnPain — once per fight, retaliate with total damage taken.
  function turnPain(sch, damageTakenThisFight) {
    const g = sch.godhood || {};
    if (!(g.active || []).includes('one_person_army')) return null;
    const used = (g.capstoneUsed || {});
    if (used.turnPain) return null;
    if (!damageTakenThisFight || damageTakenThisFight <= 0) return null;
    used.turnPain = true;
    sch.godhood.capstoneUsed = used;
    return {
      verb: 'turnPain',
      damage: damageTakenThisFight, // no cap — the needle
      note: `Every wound, given back at once: ${damageTakenThisFight} damage, no cap.`,
    };
  }

  // Seer: noLiesCheck — passive. Returns true if a deception vs the player fails.
  function noLiesCheck(sch) {
    const g = sch.godhood || {};
    return (g.active || []).includes('all_seeing');
  }

  // Market: namePrice — once per day, NAME any item; the market delivers it
  // to your location. Food is money (the apocalypse runs on kcal): tiered
  // barter prices, paid from the scholar's kcal. Tier-4 relics are LENT,
  // never sold — always a debt marker. Short payment → marker, never refusal:
  // the market always delivers; the debt always accrues. 3 markers → auditDue.
  // (MARKET GOD REWORK 2026-10-14: the old summonMarket was unwired dead code
  // and the weakest of the 11 capstones — a shopping trip, not godhood.)
  var MARKET_PRICES = { 1: 800, 2: 2000, 3: 5000 }; // kcal barter; tier 4 = marker-only
  var MARKET_AUDIT_AT = 3;
  function marketMarkers(sch) {
    const g = sch.godhood || {};
    return (g.marketDebt || 0);
  }
  function auditDue(sch) {
    return marketMarkers(sch) >= MARKET_AUDIT_AT;
  }
  // auditCollect(sch): THE AUDIT IS REAL. When 3+ markers accrue, the Audit
  // arrives and takes the single most valuable item (highest loot tier; ties
  // broken by list order). If the scholar holds nothing worth taking, it
  // takes 5000 kcal instead. Markers reset to 0 — the ledger is settled.
  // (MARKET GOD 2.0 2026-10-14: the audit was a hook to nothing. Debt needs
  // teeth, or the power is free.)
  function auditCollect(sch) {
    const g = sch.godhood || {};
    if (!auditDue(sch)) return null;
    const inv = sch.inventory || [];
    let bestIdx = -1, bestTier = -1;
    for (let i = 0; i < inv.length; i++) {
      const id = inv[i] && (inv[i].itemId || inv[i].id);
      const tier = id ? itemTier(id) : 0;
      if (tier > bestTier) { bestTier = tier; bestIdx = i; }
    }
    let taken = null;
    if (bestIdx >= 0 && bestTier > 0) {
      taken = inv.splice(bestIdx, 1)[0];
    } else {
      // Nothing worth taking — the Audit takes food instead.
      const kcal = sch.kcal || 0;
      const take = Math.min(5000, kcal);
      sch.kcal = kcal - take;
      taken = { itemId: null, kcalTaken: take };
    }
    g.marketDebt = 0;
    sch.godhood = g;
    const takenId = taken && (taken.itemId || taken.id);
    return {
      verb: 'auditCollect', ok: true,
      took: takenId || `${taken.kcalTaken} kcal`,
      note: takenId
        ? `The Audit arrives. It doesn't haggle. It takes your ${takenId} — the finest thing you own — and the ledger closes. The market remembers nothing.`
        : `The Audit arrives. You own nothing worth taking, so it takes ${taken.kcalTaken} kcal of food instead. The ledger closes.`,
    };
  }
  function namePrice(sch, itemId) {
    const g = sch.godhood || {};
    if (!(g.active || []).includes('market_god')) return null;
    if (!itemId) return null;
    const used = (g.capstoneUsed || {});
    if (used.namePrice) return null; // once per day (reset on dawn)
    const tier = itemTier(itemId);
    if (!tier) return { verb: 'namePrice', ok: false, why: 'The market has never heard of that. Name something real.' };
    used.namePrice = true;
    sch.godhood.capstoneUsed = used;
    let paidKcal = 0, marker = false, markersTaken = 0;
    if (tier >= 4) {
      // Relics are lent, never sold. Borrowing the unbuyable costs DOUBLE —
      // the market charges for the risk. (2.0: was 1 marker; the "lent"
      // needs teeth, and tier-4 on demand is the strongest use.)
      markersTaken = 2;
      marker = true;
    } else {
      const price = MARKET_PRICES[tier] || 800;
      const kcal = sch.kcal || 0;
      if (kcal >= price) {
        sch.kcal = kcal - price;
        paidKcal = price;
      } else {
        marker = true; // the market delivers anyway; the debt accrues
        markersTaken = 1;
      }
    }
    if (marker) {
      g.marketDebt = (g.marketDebt || 0) + markersTaken;
      sch.godhood = g;
    }
    // Deliver: the trader arrives with exactly what was named.
    sch.inventory = sch.inventory || [];
    sch.inventory.push({ itemId: itemId, units: 1, marketBought: true });
    const due = auditDue(sch);
    return {
      verb: 'namePrice', ok: true, itemId: itemId, tier: tier,
      paidKcal: paidKcal, marker: marker,
      markers: marketMarkers(sch), auditDue: due,
      note: marker
        ? (due
          ? `The trader's smile doesn't reach their eyes. "The Audit will call on you. Soon." MARKER ${marketMarkers(sch)} — the Audit is DUE.`
          : `You couldn't pay. The trader waves it off — "The market remembers." MARKER ${marketMarkers(sch)}/${MARKET_AUDIT_AT}.`)
        : `Named, priced, delivered: ${itemId} for ${paidKcal} kcal of food. The market bends.`,
    };
  }

  // Market: buyPassage — once per fight, BUY YOUR WAY OUT. The monster
  // accepts the price and leaves; the fight ends. Wealth buys safety, not
  // time. Price scales with wave; wave-5 hungers can't be bought, only
  // rented (marker). Caller ends the fight.
  // (MARKET GOD 2.0 2026-10-14: playtest proved 2-turn hesitation flips 0%
  // of wave 4-5 fights — the DPS asymmetry is too extreme. Safe passage
  // gives 100% survival by avoiding unwinnable fights. Steve: "unsure if
  // actually going to be game changing" — the data said it wasn't.)
  var BUYPASSAGE_PRICES = { 1: 1000, 2: 2500, 3: 5000, 4: 10000 }; // wave 5 = marker-only
  function buyPassage(sch, wave) {
    const g = sch.godhood || {};
    if (!(g.active || []).includes('market_god')) return null;
    const used = (g.capstoneUsed || {});
    if (used.buyPassage) return null; // once per fight (reset on fight start)
    const w = Math.max(1, Math.min(5, wave || 1));
    used.buyPassage = true;
    sch.godhood.capstoneUsed = used;
    let paidKcal = 0, marker = false;
    if (w >= 5) {
      marker = true; // some hungers can't be bought, only rented
    } else {
      const price = BUYPASSAGE_PRICES[w] || 1000;
      const kcal = sch.kcal || 0;
      if (kcal >= price) {
        sch.kcal = kcal - price;
        paidKcal = price;
      } else {
        marker = true;
      }
    }
    if (marker) {
      g.marketDebt = (g.marketDebt || 0) + 1;
      sch.godhood = g;
    }
    const due = auditDue(sch);
    return {
      verb: 'buyPassage', ok: true, wave: w,
      passageBought: true, // caller: end the fight, monster departs
      paidKcal: paidKcal, marker: marker,
      markers: marketMarkers(sch), auditDue: due,
      note: marker
        ? (due
          ? `You name a price you can't pay. The monster takes your promise instead — and LEAVES. "The Audit will call on you. Soon." MARKER ${marketMarkers(sch)} — the Audit is DUE.`
          : `You offer wealth you don't have. The monster considers, then turns away. "The market remembers." MARKER ${marketMarkers(sch)}/${MARKET_AUDIT_AT}.`)
        : `You name a number — ${paidKcal} kcal of food, weighed against your life. The monster takes the coin and GOES. Wealth buys the one thing strength can't: leaving.`,
    };
  }
  // Back-compat: buyOff is retired (0% impact). Alias to buyPassage for
  // any lingering callers; new code should use buyPassage.
  function buyOff(sch, wave) { return buyPassage(sch, wave); }

  // Market: Gilded Guard — the orbiting coins are SHIELDS. Passive, always-on
  // while ascended. Incoming damage to the player is intercepted by coins
  // before HP: each coin absorbs up to GUARD_PER_COIN, then shatters.
  // Coins regenerate slowly (1 per dawn) — wealth flows back, but not fast.
  // The mythic sprite shows the coins; the mechanic makes them real.
  // (MARKET GOD 2.0 2026-10-14: the binding constraint is SURVIVAL, not DPS.
  // A 100 HP player cannot win a DPS race vs 1600 HP monsters. The guard
  // doesn't win fights — it buys the hits needed to flee, heal, or reposition.)
  var GUARD_COINS_MAX = 4;
  var GUARD_PER_COIN = 50; // each coin absorbs 50; 4 coins = 200 total
  function guardCoins(sch) {
    const g = sch.godhood || {};
    if (!(g.active || []).includes('market_god')) return 0;
    // Source of truth: depletion array. Count coins not fully depleted.
    g.guardDepletion = g.guardDepletion || [];
    let intact = 0;
    for (let i = 0; i < GUARD_COINS_MAX; i++) {
      if ((g.guardDepletion[i] || 0) < GUARD_PER_COIN) intact++;
    }
    return intact;
  }
  // guardAbsorb(sch, dmg): returns { absorbed, coinsLeft, shattered }.
  // Called from tbDamage before HP reduction. Pure-ish: mutates guard state.
  // Each coin has GUARD_PER_COIN capacity; depletion is tracked per coin.
  function guardAbsorb(sch, dmg) {
    const g = sch.godhood || {};
    if (!(g.active || []).includes('market_god')) return { absorbed: 0, coinsLeft: 0, shattered: 0 };
    // guardDepletion: array of damage already absorbed per coin (index = coin)
    g.guardDepletion = g.guardDepletion || [];
    let coins = guardCoins(sch);
    if (coins <= 0 || dmg <= 0) return { absorbed: 0, coinsLeft: coins, shattered: 0 };
    let absorbed = 0, shattered = 0;
    let remaining = dmg;
    // Fill coins in order; a coin shatters only when fully depleted.
    // Iterate by index; skip coins already at full depletion.
    for (let i = 0; i < GUARD_COINS_MAX && remaining > 0; i++) {
      const alreadyAbsorbed = g.guardDepletion[i] || 0;
      if (alreadyAbsorbed >= GUARD_PER_COIN) continue; // shattered, skip
      const capacityLeft = GUARD_PER_COIN - alreadyAbsorbed;
      const take = Math.min(capacityLeft, remaining);
      absorbed += take;
      remaining -= take;
      g.guardDepletion[i] = alreadyAbsorbed + take;
      if (g.guardDepletion[i] >= GUARD_PER_COIN) shattered++;
    }
    // Recompute intact count
    coins = 0;
    for (let i = 0; i < GUARD_COINS_MAX; i++) {
      if ((g.guardDepletion[i] || 0) < GUARD_PER_COIN) coins++;
    }
    g.guardCoins = coins;
    sch.godhood = g;
    return { absorbed, coinsLeft: coins, shattered };
  }
  function guardRegen(sch) {
    // call at dawn: the least-depleted shattered coin flows back.
    // (A shattered coin returns at 0 depletion — fresh.)
    const g = sch.godhood || {};
    if (!(g.active || []).includes('market_god')) return;
    g.guardDepletion = g.guardDepletion || [];
    for (let i = 0; i < GUARD_COINS_MAX; i++) {
      if ((g.guardDepletion[i] || 0) >= GUARD_PER_COIN) {
        g.guardDepletion[i] = 0;
        sch.godhood = g;
        return;
      }
    }
  }

  // Farstrider: walkHorizon — once per day, instant travel up to 3 nodes. Costs 150 kcal.
  function walkHorizon(sch, nodes) {
    const g = sch.godhood || {};
    if (!(g.active || []).includes('farstrider')) return null;
    const used = (g.capstoneUsed || {});
    if (used.walkHorizon) return null;
    if (!nodes || nodes < 1 || nodes > 3) return null;
    if ((sch.kcal || 0) < 150) return { verb: 'walkHorizon', ok: false, why: 'The horizon charges 150 kcal toll.' };
    used.walkHorizon = true;
    sch.godhood.capstoneUsed = used;
    sch.kcal = (sch.kcal || 0) - 150;
    return { verb: 'walkHorizon', ok: true, nodes, note: `The map folds. ${nodes} node${nodes > 1 ? 's' : ''}, one step.` };
  }

  // Between: phaseOut — once per fight, negate one hit entirely.
  function phaseOut(sch) {
    const g = sch.godhood || {};
    if (!(g.active || []).includes('the_between')) return null;
    const used = (g.capstoneUsed || {});
    if (used.phaseOut) return null;
    used.phaseOut = true;
    sch.godhood.capstoneUsed = used;
    return { verb: 'phaseOut', negated: true, note: 'You were never there. The blow passes through empty air.' };
  }

  // Ward: takeWound — redirect ally damage to self. Redirected damage can't
  // drop below 1 HP. 3 strains in one fight = collapse (alive, out).
  function takeWound(sch, ally, damage) {
    const g = sch.godhood || {};
    if (!(g.active || []).includes('undying_ward')) return null;
    const strains = (g.capstoneUsed || {}).wardStrains || 0;
    if (strains >= 3) return { verb: 'takeWound', ok: false, collapsed: true, note: 'Three wounds carried. You collapse — alive, but out.' };
    const used = (g.capstoneUsed || {});
    used.wardStrains = strains + 1;
    sch.godhood.capstoneUsed = used;
    const hp = sch.health || sch.hp || 100;
    const newHp = Math.max(1, hp - damage); // redirected wounds can't drop you below 1
    if (sch.health != null) sch.health = newHp; else sch.hp = newHp;
    return {
      verb: 'takeWound', ok: true,
      redirected: damage, hpAfter: newHp, strains: strains + 1,
      collapsed: strains + 1 >= 3,
      note: `${ally.name || 'Your ally'}'s wound is yours now. You keep standing. (${strains + 1}/3 strains)`,
    };
  }

  // --- recognition ceremony ---
  // 5 beats, PLAYED via say/sysSay — never a popup. One screen, staged like theater.
  // game: { say, sysSay, broadcastStart, state }. witnesses: [{name, line}] picked by caller
  // from real villagers (personality-driven). Returns the beat list (for tests).
  function ceremonyBeats(gh, witnesses, dayPartName) {
    const w = witnesses || [];
    return [
      {
        beat: 'stillness',
        kind: 'say',
        text: `Everything stops. Not all at once — conversations trail off, a dropped spoon rings too loud. The ${dayPartName || 'light'} does something it has never done. Every face turns toward you.`,
      },
      {
        beat: 'witnesses',
        kind: 'say',
        text: w.length
          ? w.map(x => `${x.name}: "${x.line}"`).join('\n')
          : 'No one speaks. They don\'t have the words yet.',
      },
      {
        beat: 'system',
        kind: 'sysSay',
        text: gh.recognition.systemLine,
        broadcast: true,
      },
      {
        beat: 'change',
        kind: 'say',
        text: `${gh.recognition.beat} Look at your hands. Look at what the light does around you now. You are ${gh.name} — ${gh.mythic.title}. ${gh.mythic.desc}`,
        mythic: gh.id,
      },
      {
        beat: 'price',
        kind: 'say',
        text: `Godhood demands its price, and the price is not hidden: ${gh.capstone.cost} ${gh.capstone.weakness}`,
      },
    ];
  }

  function recognitionCeremony(game, ghId, witnesses, dayPartName) {
    const gh = byId(ghId);
    if (!gh) return null;
    const sch = game.state.scholar;
    const g = sch.godhood || (sch.godhood = { recognized: {}, active: [] });
    if (g.recognized[ghId]) return null; // fires once
    const beats = ceremonyBeats(gh, witnesses, dayPartName);
    try {
      if (game.broadcastStart) game.broadcastStart('ascension', { godhood: ghId, name: gh.name });
    } catch (e) {}
    for (const b of beats) {
      try {
        if (b.kind === 'sysSay' && game.sysSay) game.sysSay(b.text);
        else if (game.say) game.say(b.text);
      } catch (e) {}
    }
    const day = (game.state && game.state.day) || 0;
    g.recognized[ghId] = day;
    if (!g.active.includes(ghId)) g.active.push(ghId);
    return beats;
  }

  // villagerRecognitionCeremony(game, vid, ghId, witnesses): the village watches
  // one of its own ascend. Played beats via say/sysSay, never a popup.
  // Registers with the pantheon as a villager ascension. Fires once.
  function villagerRecognitionCeremony(game, vid, ghId, witnesses) {
    const gh = byId(ghId);
    if (!gh) return null;
    const v = (game.state || {}).village || {};
    v.npcGodhood = v.npcGodhood || {};
    const g = v.npcGodhood[vid] || (v.npcGodhood[vid] = { recognized: {}, active: [] });
    if (g.recognized[ghId]) return null; // fires once
    let vname = 'Someone';
    try { vname = game.displayName ? game.displayName(vid) : vname; } catch (e) {}
    const beats = ceremonyBeats(gh, witnesses, null).map(b => Object.assign({}, b, {
      // re-voice the beats for a witnessed ascension: it's THEY, not you
      text: b.beat === 'change'
        ? `${gh.recognition.beat} Look at ${vname}. Look at what the light does around them now. ${vname} is ${gh.name} — ${gh.mythic.title}. ${gh.mythic.desc}`
        : b.beat === 'price'
          ? `Godhood demands its price, and the price is not hidden: ${gh.capstone.cost} ${gh.capstone.weakness}`
          : b.beat === 'stillness'
            ? `Everything stops. Not all at once — conversations trail off, a dropped spoon rings too loud. Every face turns toward ${vname}.`
            : b.text,
    }));
    try {
      if (game.broadcastStart) game.broadcastStart('ascension', { godhood: ghId, name: gh.name, vid });
    } catch (e) {}
    for (const b of beats) {
      try {
        if (b.kind === 'sysSay' && game.sysSay) game.sysSay(b.text);
        else if (game.say) game.say(b.text);
      } catch (e) {}
    }
    const day = (game.state && game.state.day) || 0;
    g.recognized[ghId] = day;
    if (!g.active.includes(ghId)) g.active.push(ghId);
    // PANTHEON: a villager god is a god. Register the ascension.
    try {
      const S2 = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
      if (S2.Pantheon && S2.Pantheon.registerAscension) {
        S2.Pantheon.registerAscension(game, { vid, name: vname, godhoodId: ghId, kind: 'villager', architect: null });
      }
    } catch (e) {}
    return beats;
  }
  // hintBeat(game, ghId): the knowledge-gated hint when close but not complete.
  // Fires once per godhood (scholar.godhood.hinted).
  // GODHOOD REWORK (Steve 2026-10-13): the hint is now a build guide — but a
  // KNOWLEDGE-GATED one. It names only abilities the player's codex has heard
  // of (L1+); unknown abilities stay teased. It organizes earned knowledge,
  // never grants free knowledge.
  function hintBeat(game, ghId) {
    const gh = byId(ghId);
    if (!gh) return null;
    const sch = game.state.scholar;
    const g = sch.godhood || (sch.godhood = { recognized: {}, active: [] });
    g.hinted = g.hinted || {};
    if (g.hinted[ghId] || g.recognized[ghId]) return null;
    const day = (game.state || {}).day || 0;
    const close = godhoodCloseness(sch, gh, day);
    if (!close.close || close.complete) return null;
    g.hinted[ghId] = true;
    let text = gh.hint;
    // Build guide: name the missing core abilities you've heard of; tease the rest.
    try {
      const req = gh.requires || {};
      const abs = scholarAbilities(sch);
      // the recognised subclass's payoff (poolProgress), not every payoff of the path
      const cores = (poolProgress(abs, gh).cores || req.coreAbilities || []).filter(c => !abs.has(c));
      const knownCores = cores.filter(c => game.codexAbilityLevel && game.codexAbilityLevel(c) >= 1);
      const unknownCores = cores.filter(c => !(game.codexAbilityLevel && game.codexAbilityLevel(c) >= 1));
      const abilName = (aid) => {
        try {
          const d = (game.data.abilities || []).find(a => a.id === aid);
          return (d && d.name) || aid;
        } catch (e) { return aid; }
      };
      const parts = [];
      if (knownCores.length) parts.push(`you're missing ${knownCores.map(abilName).join(' and ')}`);
      if (unknownCores.length) parts.push(`${unknownCores.length} more you've never even heard of`);
      if (!close.synergy) {
        const synNames = (req.synergies || []).map(sid => {
          try {
            const d = (game.data.synergies || []).find(s => s.id === sid);
            return (d && d.name) || sid;
          } catch (e) { return sid; }
        });
        if (synNames.length) parts.push(`a resonance like ${synNames[0]}`);
      }
      if (!close.dayOk) parts.push('time: the System does not crown anyone before the long days (day ' + ((gh.requires || {}).minDay || 80) + ')');
      if (parts.length) {
        text += ` The shape is clear now: ${parts.join('; ')}.`;
      }
    } catch (e) {}
    try { if (game.sysSay) game.sysSay(text); } catch (e2) {}
    return text;
  }

  // --- mythic sprites ---
  // 10 custom SVGs, viewBox 0 0 32 32. No background — the tile shows through
  // (sprite composition law). Each reads INSTANTLY as "no longer just a person".
  const MYTHIC_SPRITES = {
    shepherd_of_the_dead: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="sprite"><path d="M16 6 L22 30 L10 30 Z" fill="#2a2a5a" opacity="0.95"/><circle cx="16" cy="9" r="3.4" fill="#c9b8e8"/><circle cx="14.8" cy="8.6" r="0.5" fill="#1a1a2e"/><circle cx="17.2" cy="8.6" r="0.5" fill="#1a1a2e"/><ellipse cx="6.5" cy="12" rx="3" ry="4" fill="#b8d8ff" opacity="0.55"/><circle cx="6.5" cy="10.5" r="1.4" fill="#d8ecff" opacity="0.7"/><ellipse cx="25.5" cy="16" rx="3" ry="4" fill="#b8d8ff" opacity="0.55"/><circle cx="25.5" cy="14.5" r="1.4" fill="#d8ecff" opacity="0.7"/><ellipse cx="16" cy="24" rx="4" ry="2.6" fill="#b8d8ff" opacity="0.45"/><circle cx="16" cy="23" r="1.5" fill="#d8ecff" opacity="0.65"/><path d="M13 14 Q16 16 19 14" stroke="#8a7ab8" stroke-width="0.8" fill="none"/></svg>`,
    apex_predator: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="sprite"><path d="M10 8 L6 2 M10 8 L13 1 M22 8 L26 2 M22 8 L19 1" stroke="#6e4a26" stroke-width="1.6" stroke-linecap="round"/><circle cx="16" cy="11" r="4.2" fill="#c68642"/><path d="M12 9 L10 7 M20 9 L22 7" stroke="#8d5524" stroke-width="1"/><ellipse cx="14.2" cy="10.6" rx="1.1" ry="0.8" fill="#ffb700"/><ellipse cx="17.8" cy="10.6" rx="1.1" ry="0.8" fill="#ffb700"/><circle cx="14.2" cy="10.6" r="0.35" fill="#1a1a1a"/><circle cx="17.8" cy="10.6" r="0.35" fill="#1a1a1a"/><path d="M11 15 L21 15 L20 28 L12 28 Z" fill="#8d5524"/><path d="M9 18 L5 24 M23 18 L27 24" stroke="#8d5524" stroke-width="2.2" stroke-linecap="round"/><path d="M5 24 l-1.5 2 M5 24 l0.5 2.2 M27 24 l1.5 2 M27 24 l-0.5 2.2" stroke="#e8e8e8" stroke-width="0.9" stroke-linecap="round"/><rect x="13.4" y="28" width="2.4" height="3" fill="#5c3a21"/><rect x="16.2" y="28" width="2.4" height="3" fill="#5c3a21"/></svg>`,
    living_garden: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="sprite"><circle cx="16" cy="10" r="3.8" fill="#e0ac82"/><path d="M11 14 Q16 12 21 14 L20 28 L12 28 Z" fill="#4a7d3a"/><path d="M16 6 Q13 2 9 3 M16 6 Q19 2 23 3" stroke="#3d6b2f" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="9" cy="3" r="1.6" fill="#e8a13c"/><circle cx="23" cy="3" r="1.6" fill="#c0392b"/><ellipse cx="8" cy="16" rx="3.4" ry="2" fill="#4da63f" transform="rotate(-20 8 16)"/><ellipse cx="24" cy="16" rx="3.4" ry="2" fill="#4da63f" transform="rotate(20 24 16)"/><ellipse cx="12" cy="22" rx="2.6" ry="1.6" fill="#578a45"/><ellipse cx="20" cy="22" rx="2.6" ry="1.6" fill="#578a45"/><circle cx="16" cy="18" r="1.8" fill="#f5c518"/><circle cx="13" cy="12" r="1.2" fill="#ff6b9d"/><circle cx="19" cy="12" r="1.2" fill="#ff6b9d"/><path d="M14 28 Q16 30 18 28" stroke="#3d6b2f" stroke-width="1.4" fill="none"/></svg>`,
    unkillable: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="sprite"><circle cx="16" cy="9" r="3.8" fill="#2a2a2e"/><path d="M14 6 L18 6 L16 9 Z" fill="#ffb700" opacity="0.9"/><path d="M11 13 L21 13 L20 28 L12 28 Z" fill="#2a2a2e"/><path d="M13 15 L15 20 L13.5 25 M19 15 L17 20 L18.5 25 M16 13 L16 18" stroke="#ffb700" stroke-width="1" opacity="0.85" fill="none"/><circle cx="14.5" cy="8.5" r="0.5" fill="#ffb700"/><circle cx="17.5" cy="8.5" r="0.5" fill="#ffb700"/><ellipse cx="8" cy="26" rx="4" ry="2" fill="#6e6e6e" opacity="0.6"/><ellipse cx="24" cy="27" rx="4" ry="2" fill="#6e6e6e" opacity="0.6"/><path d="M12 13 L10 20 M20 13 L22 20" stroke="#2a2a2e" stroke-width="2.4" stroke-linecap="round"/></svg>`,
    one_person_army: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="sprite"><circle cx="16" cy="8" r="4" fill="#8d2a2a"/><path d="M13.5 7.5 L18.5 7.5" stroke="#3a0a0a" stroke-width="1.4"/><circle cx="14.5" cy="8" r="0.6" fill="#ffb700"/><circle cx="17.5" cy="8" r="0.6" fill="#ffb700"/><path d="M9 13 L23 13 L21 29 L11 29 Z" fill="#a93226"/><path d="M9 13 L23 13 L22 16 L10 16 Z" fill="#7a1e1e"/><path d="M23 14 L30 6" stroke="#5a5a5a" stroke-width="2.6" stroke-linecap="round"/><path d="M28 4 L32 2 M28 4 L29 8" stroke="#c0c0c0" stroke-width="1.4" stroke-linecap="round"/><path d="M9 14 L4 20" stroke="#a93226" stroke-width="3" stroke-linecap="round"/><path d="M16 16 L16 24 M13 18 L19 18" stroke="#ffb700" stroke-width="1" opacity="0.7"/><rect x="12.6" y="29" width="2.8" height="2.6" fill="#3a0a0a"/><rect x="16.6" y="29" width="2.8" height="2.6" fill="#3a0a0a"/></svg>`,
    all_seeing: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="sprite"><circle cx="16" cy="10" r="4" fill="#e0ac82"/><ellipse cx="16" cy="6.5" rx="2.2" ry="1.4" fill="#f5f5ff"/><circle cx="16" cy="6.5" r="0.9" fill="#7a4ae8"/><circle cx="16" cy="6.5" r="0.4" fill="#1a1a1a"/><ellipse cx="14.2" cy="10" rx="0.9" ry="0.6" fill="#fff"/><ellipse cx="17.8" cy="10" rx="0.9" ry="0.6" fill="#fff"/><circle cx="14.2" cy="10" r="0.35" fill="#7a4ae8"/><circle cx="17.8" cy="10" r="0.35" fill="#7a4ae8"/><path d="M11 14 L21 14 L20 28 L12 28 Z" fill="#4a3a6e"/><ellipse cx="8.5" cy="18" rx="1.6" ry="1" fill="#f5f5ff"/><circle cx="8.5" cy="18" r="0.6" fill="#7a4ae8"/><ellipse cx="23.5" cy="18" rx="1.6" ry="1" fill="#f5f5ff"/><circle cx="23.5" cy="18" r="0.6" fill="#7a4ae8"/><ellipse cx="13" cy="22" rx="1.4" ry="0.9" fill="#f5f5ff" opacity="0.9"/><circle cx="13" cy="22" r="0.5" fill="#7a4ae8"/><ellipse cx="19" cy="22" rx="1.4" ry="0.9" fill="#f5f5ff" opacity="0.9"/><circle cx="19" cy="22" r="0.5" fill="#7a4ae8"/><path d="M16 2 L16 4 M6 10 L7.5 11 M26 10 L24.5 11" stroke="#b8a8ff" stroke-width="0.8"/></svg>`,
    market_god: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="sprite"><circle cx="16" cy="10" r="3.8" fill="#e0ac82"/><path d="M16 5 L16 3 M12 6 L10.5 4.5 M20 6 L21.5 4.5" stroke="#d4a017" stroke-width="1.2" stroke-linecap="round"/><circle cx="16" cy="2.5" r="1" fill="#d4a017"/><path d="M11 14 L21 14 L20 28 L12 28 Z" fill="#c9962e"/><path d="M11 14 L21 14 L20.5 17 L11.5 17 Z" fill="#a87b1e"/><path d="M13 19 L19 19 M13 22 L19 22" stroke="#7a5a10" stroke-width="0.8"/><circle cx="5.5" cy="10" r="1.8" fill="#f5c518" stroke="#a87b1e" stroke-width="0.6"/><circle cx="26.5" cy="13" r="1.8" fill="#f5c518" stroke="#a87b1e" stroke-width="0.6"/><circle cx="6.5" cy="22" r="1.5" fill="#f5c518" stroke="#a87b1e" stroke-width="0.6"/><circle cx="25.5" cy="24" r="1.5" fill="#f5c518" stroke="#a87b1e" stroke-width="0.6"/><path d="M16 20 L16 26 M13 22 L19 22" stroke="#5a4a10" stroke-width="1"/><path d="M13 22 L11 25 M19 22 L21 25" stroke="#5a4a10" stroke-width="0.8"/></svg>`,
    farstrider: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="sprite"><path d="M16 8 Q6 10 2 16 Q8 14 14 14 Z" fill="#5a6e8a" opacity="0.85"/><circle cx="16" cy="10" r="3.6" fill="#e0ac82"/><path d="M12 13 L20 13 L19 27 L13 27 Z" fill="#4a5a7a"/><circle cx="16" cy="18" r="3" fill="none" stroke="#b8c8e8" stroke-width="1"/><path d="M16 15.5 L16 20.5 M13.5 18 L18.5 18 M16 15.5 L17.5 17 M16 20.5 L14.5 19" stroke="#b8c8e8" stroke-width="0.8"/><path d="M4 22 Q12 20 20 22 M2 26 Q12 24 22 26" stroke="#8a9ab8" stroke-width="0.9" fill="none" opacity="0.7"/><rect x="13.2" y="27" width="2.4" height="3.4" fill="#3a3f4a"/><rect x="16.4" y="27" width="2.4" height="3.4" fill="#3a3f4a"/></svg>`,
    the_between: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="sprite"><g opacity="0.35"><circle cx="13" cy="10" r="3.6" fill="#6a5a9e"/><path d="M9 14 L17 14 L16 28 L10 28 Z" fill="#6a5a9e"/></g><g opacity="0.35"><circle cx="19" cy="10" r="3.6" fill="#4a3a7e"/><path d="M15 14 L23 14 L22 28 L16 28 Z" fill="#4a3a7e"/></g><circle cx="16" cy="10" r="3.6" fill="#8a7ab8" opacity="0.9"/><path d="M12 14 L20 14 L19 28 L13 28 Z" fill="#5a4a8e" opacity="0.9"/><circle cx="14.6" cy="9.6" r="0.45" fill="#e8e8ff"/><circle cx="17.4" cy="9.6" r="0.45" fill="#e8e8ff"/><path d="M8 6 L10 8 M24 6 L22 8 M6 16 L8 16 M26 16 L24 16" stroke="#b8a8ff" stroke-width="0.9" opacity="0.8"/></svg>`,
    undying_ward: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="sprite"><ellipse cx="16" cy="8" rx="6" ry="2.4" fill="#fff8e8" opacity="0.85"/><circle cx="16" cy="10" r="3.6" fill="#f1c9a5"/><path d="M12 13.5 L20 13.5 L19 28 L13 28 Z" fill="#f5f0e0"/><path d="M12 13.5 L20 13.5 L19.5 16 L12.5 16 Z" fill="#e8d44a" opacity="0.5"/><path d="M7 12 Q3 18 5 26 Q9 20 11 14 Z" fill="#fff8e8" opacity="0.9"/><path d="M25 12 Q29 18 27 26 Q23 20 21 14 Z" fill="#fff8e8" opacity="0.9"/><circle cx="14.5" cy="9.6" r="0.45" fill="#1a1a1a"/><circle cx="17.5" cy="9.6" r="0.45" fill="#1a1a1a"/><path d="M14.5 19 L16 21 L17.5 19" stroke="#e8a13c" stroke-width="0.9" fill="none" opacity="0.8"/><circle cx="16" cy="24" r="1.2" fill="#ffb700" opacity="0.7"/></svg>`,
    voice_of_the_relay: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="sprite"><path d="M16 4 Q8 6 5 12 Q3 18 6 24 Q4 20 3 16 M16 4 Q24 6 27 12 Q29 18 26 24 Q28 20 29 16" stroke="#4ae8ff" stroke-width="1" fill="none" opacity="0.75"/><path d="M16 4 Q10 2 6 5 M16 4 Q22 2 26 5" stroke="#4ae8ff" stroke-width="0.8" fill="none" opacity="0.6"/><circle cx="16" cy="10" r="3.6" fill="#e0ac82"/><rect x="13.2" y="8.6" width="2.2" height="1.4" rx="0.4" fill="#0a1a2a"/><rect x="16.6" y="8.6" width="2.2" height="1.4" rx="0.4" fill="#0a1a2a"/><rect x="13.7" y="9" width="1.2" height="0.6" fill="#4ae8ff" opacity="0.95"/><rect x="17.1" y="9" width="1.2" height="0.6" fill="#4ae8ff" opacity="0.95"/><path d="M11 14 L21 14 L20 28 L12 28 Z" fill="#2a3a5a"/><path d="M11 14 L21 14 L20.5 17 L11.5 17 Z" fill="#4ae8ff" opacity="0.25"/><path d="M16 14 L16 28" stroke="#4ae8ff" stroke-width="0.7" opacity="0.5"/><circle cx="6" cy="8" r="1" fill="#4ae8ff" opacity="0.8"/><circle cx="26" cy="9" r="1" fill="#4ae8ff" opacity="0.8"/><circle cx="4" cy="18" r="0.8" fill="#4ae8ff" opacity="0.6"/><circle cx="28" cy="19" r="0.8" fill="#4ae8ff" opacity="0.6"/><circle cx="8" cy="27" r="0.7" fill="#4ae8ff" opacity="0.5"/><circle cx="24" cy="28" r="0.7" fill="#4ae8ff" opacity="0.5"/><path d="M13 22 L19 22 M14 24.5 L18 24.5" stroke="#4ae8ff" stroke-width="0.6" opacity="0.7"/></svg>`,
  };

  function mythicSprite(ghId) {
    return MYTHIC_SPRITES[ghId] || null;
  }

  // public API
  S.Godhood = {
    godhoods, allGodhoods, byId, deriveGodhoods,
    godhoodCloseness, checkGodhood, playerMythicId, godhoodBargaining,
    villagerGodhoodCloseness, checkVillagerGodhood, villagerMythicId,
    itemTier, godhoodItemOk, poolProgress, buildReadyForCapstone, capstoneItemFor,
    raiseEcho, resetFightVerbs, chooseTerms, feedMultitude, resetDayVerbs,
    turnPain, noLiesCheck, namePrice, buyOff, buyPassage, marketMarkers, auditDue, auditCollect,
    guardCoins, guardAbsorb, guardRegen,
    walkHorizon, phaseOut, takeWound,
    ceremonyBeats, recognitionCeremony, villagerRecognitionCeremony, hintBeat,
    mythicSprite, MYTHIC_SPRITES,
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
