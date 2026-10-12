// @ontology
// system: godhood
// description: Godhood capstones — Steve 2026-10-11. When a player completes
//   an ENDGAME-BUILDS.md build (ability kit + key synergy + tier-4 capstone
//   item), the game RECOGNIZES it with a played 5-beat ceremony, grants ONE
//   qualitative godly verb, and permanently transforms their visual into a
//   mythic form. Each capstone is the biggest single power spike in the game
//   AND keeps its weakness. Knowledge-gated: the capstone is unknown until
//   you're close (4+ kit abilities). Death/respawn resets it (village-as-
//   protagonist law).
// provides:
//   - GODHOODS (from godhood.json)
//   - checkGodhood(scholar) -> [godhoodIds newly completed]
//   - godhoodCloseness(scholar, gh) -> {kit, needKit, synergy, item, close}
//   - recognitionCeremony(game, ghId) -> plays the 5-beat ceremony
//   - mythicSprite(ghId) -> 32x32 SVG string (mythic form, no background)
//   - playerMythicId(scholar) -> godhood id or null (for sprite hook)
//   - godhoodBargaining(scholar) -> leverage bonus for the table
//   - capstone verbs: raiseEcho, chooseTerms, feedMultitude, turnPain,
//     noLiesCheck, summonMarket, walkHorizon, phaseOut, takeWound
// consumes:
//   - scholar.abilities, scholar.activeSynergies, scholar.inventory
//   - game.say, game.sysSay, game.broadcastStart (ceremony)
// rules:
//   - No stat-stick capstones. Every verb is qualitative AND measured.
//   - Every capstone has a real cost or limit. The weakness stays.
//   - The ceremony is PLAYED (say/sysSay beats), never a popup.
//   - Mythic sprites sit ON the grid: no background, tile shows through.
(function (global) {
  'use strict';
  const S = global.Scattering = global.Scattering || {};

  // GODHOODS is injected at load from godhood.json (build step / Game.init).
  // In node tests, set S.GODHOODS directly.
  function godhoods() {
    return (S.GODHOODS && S.GODHOODS.godhoods) || [];
  }
  function byId(id) {
    return godhoods().find(g => g.id === id) || null;
  }

  // --- state helpers (pure, testable) ---
  function scholarAbilities(sch) {
    const out = new Set();
    for (const a of (sch.abilities || [])) out.add(typeof a === 'string' ? a : (a.id || a));
    for (const a of (sch.backgroundAbilities || [])) out.add(typeof a === 'string' ? a : (a.id || a));
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

  // godhoodCloseness(scholar, gh): how close to completion. Knowledge-gated
  // hints use `close` (4+ kit abilities) without naming the capstone.
  function godhoodCloseness(sch, gh) {
    // RELAY (Steve 2026-10-11): the 11th godhood isn't a 6-kit — it's the
    // office path. Complete when holding the relay office + all nine
    // comm-field abilities unlocked through the Relay endgame path.
    if (gh.id === 'voice_of_the_relay') {
      let holdsOffice = false;
      try {
        const sw = (typeof Game !== 'undefined' && Game.state && Game.state.switchboard) || {};
        holdsOffice = !!(sw.holderId && sch.villagerId && sw.holderId === sch.villagerId);
      } catch (e) {}
      const ra = (sch.relayAbils || {});
      const abilCount = Object.keys(ra).filter(k => ra[k] && ra[k].unlocked).length;
      const need = gh.requires.relayAbils || 6; // 3 shared + 3 branch (light OR dark — never all 9 in one run)
      return {
        kit: abilCount, needKit: need, synergy: holdsOffice, item: true,
        complete: holdsOffice && abilCount >= need,
        close: holdsOffice && abilCount >= 4,
      };
    }
    const abs = scholarAbilities(sch);
    const syns = scholarSynergies(sch);
    const items = scholarItems(sch);
    const kit = (gh.requires.abilities || []).filter(a => abs.has(a));
    const synergy = (gh.requires.synergies || []).some(s => syns.has(s));
    const item = (gh.requires.items || []).some(i => items.has(i));
    return {
      kit: kit.length,
      needKit: (gh.requires.abilities || []).length,
      synergy, item,
      complete: kit.length === (gh.requires.abilities || []).length && synergy && item,
      close: kit.length >= 4, // hint threshold: you feel it coming
    };
  }

  // checkGodhood(scholar): returns ids of NEWLY completed godhoods (not yet
  // recognized). Recognition state lives on scholar.godhood = { recognized: {id: day}, active: [ids] }.
  function checkGodhood(sch) {
    const g = sch.godhood || (sch.godhood = { recognized: {}, active: [] });
    const out = [];
    for (const gh of godhoods()) {
      if (g.recognized[gh.id]) continue;
      if (godhoodCloseness(sch, gh).complete) out.push(gh.id);
    }
    return out;
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
    return g.active.length * 3; // each godhood: +3 bargaining strength
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
    delete sch.godhood.capstoneUsed.summonMarket;
    delete sch.godhood.capstoneUsed.walkHorizon;
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

  // Market: summonMarket — once per day, trader comes to you.
  function summonMarket(sch, auditActive) {
    const g = sch.godhood || {};
    if (!(g.active || []).includes('market_god')) return null;
    const used = (g.capstoneUsed || {});
    if (used.summonMarket) return null;
    used.summonMarket = true;
    sch.godhood.capstoneUsed = used;
    return {
      verb: 'summonMarket', ok: true,
      taxed: !!auditActive, // the audit monster takes its cut — existing counter
      note: auditActive
        ? 'The trader comes. The audit was watching — it takes its cut first. Wealth has auditors.'
        : 'The trader comes to you, wherever you are, at your price.',
    };
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

  // hintBeat(game, gh): the knowledge-gated hint when close but not complete.
  // Fires once per godhood (scholar.godhood.hinted).
  function hintBeat(game, ghId) {
    const gh = byId(ghId);
    if (!gh) return null;
    const sch = game.state.scholar;
    const g = sch.godhood || (sch.godhood = { recognized: {}, active: [] });
    g.hinted = g.hinted || {};
    if (g.hinted[ghId] || g.recognized[ghId]) return null;
    const close = godhoodCloseness(sch, gh);
    if (!close.close || close.complete) return null;
    g.hinted[ghId] = true;
    try { if (game.sysSay) game.sysSay(gh.hint); } catch (e) {}
    return gh.hint;
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
    godhoods, byId,
    godhoodCloseness, checkGodhood, playerMythicId, godhoodBargaining,
    raiseEcho, resetFightVerbs, chooseTerms, feedMultitude, resetDayVerbs,
    turnPain, noLiesCheck, summonMarket, walkHorizon, phaseOut, takeWound,
    ceremonyBeats, recognitionCeremony, hintBeat,
    mythicSprite, MYTHIC_SPRITES,
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
