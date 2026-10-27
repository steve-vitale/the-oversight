// @ontology
// system: villager-mapmem
// description: Villager map memory + cross-node objectives. Villagers remember resource sites on other nodes (v1: corpses) and form haul objectives that carry past whatever node they're on — kills become the resources they are.
// provides:
//   - mapmemOf(vid)
//   - mapmemRemember(vid, corpse)
//   - mapmemPurge(vid)
//   - mapmemNoticeNode(vid, nx, ny)
//   - mapmemNoteKill(vid, m, node)
//   - mapmemTell(tellerVid, listenerVid)
//   - mapmemBestHaul(vid, hx, hy)
//   - mapmemHaulAt(vid)
//   - mapmemFoodKnown(corpse)
//   - mapmemMeatItem(corpse)
// rules:
//   - memory_is_knowledge_gated: remembered sites store the descriptor the villager knows, never the true name pre-identification (code: villager-mapmem.js)
//   - secondhand_is_fuzzed: gossip-passed memories carry estimation error and are marked secondhand (code: villager-mapmem.js)
//   - objectives_carry_past_nodes: haul objectives target remembered nodes, not the current one (code: villager-mapmem.js)
//   - no_haul_without_need: haul objectives only form when the village needs food (code: villager-mapmem.js)
//   - known_food_only: villagers haul meat the village knows is food; unknown flesh stays for the player's cautious testing (code: villager-mapmem.js)
//   - expedition_kills_leave_bodies: an expedition kill registers a real corpse — the body is really there, on the real rot clock (code: villager-mapmem.js)
// consumes:
//   - state.corpses, state.scholar.day, village.roster, village.pantry, village.mapmem
//   - npcNode, displayName, monsterDisplayName, monsterFoodSafe, stockPantry, seedGossip, registerDeath, monsterMeatEntry
/* VILLAGER MAP MEMORY — src/js/villager-mapmem.js
 *
 * Steve (2026-10-13): "They need objectives that carry past whatever node
 * they happen to be on. They need map memory."
 *
 * The carcass-haul finding: 97% of edible kill kcal rotted unlooted because
 * kills aren't treated as resources — villagers handled what was on their
 * tile and ignored everything one tile away.
 *
 * 1. MAP MEMORY — each villager remembers sites: { nx, ny, kind, ref, label,
 *    mid, estKcal, seenDay, spoilBy, secondhand, toldBy }. V1 kind is
 *    'corpse'. Written on perception (kill, walking past, being told).
 *    Cap 12, evicted by expiry then value. Purged when the meat's gone.
 * 2. CROSS-NODE OBJECTIVES — the HAUL objective kind (villager-objectives.js)
 *    targets a remembered node. Travel, butcher, carry home, pantry.
 * 3. GOSSIP SPREAD — a villager can tell another about a corpse; the
 *    listener's copy is marked secondhand and fuzzed (distortion is canon).
 *
 * Knowledge gating: the stored label is the descriptor the villager actually
 * knows (monsterDisplayName — strange descriptor until the village names it),
 * never the true name pre-identification. Animals use their common name
 * (recognizable Earth animals are early knowledge — BEAR.md).
 *
 * Self-attaching module. Load after villager-objectives.js.
 */
(function () {
  'use strict';
  var _g = (typeof globalThis !== 'undefined') ? globalThis : (typeof global !== 'undefined' ? global : {});
  var G = (_g.Scattering && _g.Scattering.Game) ? _g.Scattering.Game : null;
  if (!G) return;
  var R = Math.random;

  var MEM_CAP = 12;
  // VILLAGER BUTCHER YIELD (Steve 2026-10-13, overruling the 0.35): food is
  // the wall, so this is a wall lever, not a number to pre-nerf. Villagers
  // are practiced hands — 0.50, above known-clean 0.40. Sim loops tune it.
  var HAUL_YIELD = 0.50;
  // HAUL NEED GATE (design call 2026-10-13): don't walk miles for meat the
  // village doesn't need. FORAGE gates at 4000; haul is opportunistic, so
  // the bar is a little higher — but personal hunger always qualifies.
  var HAUL_PANTRY_GATE = 5000;
  var MAX_HAULERS_PER_CORPSE = 2;

  var methods = {

    // ---------- STATE ----------
    mapmemOf(vid) {
      var v = this.state.village;
      v.mapmem = v.mapmem || {};
      if (!v.mapmem[vid]) v.mapmem[vid] = { sites: [] };
      return v.mapmem[vid];
    },

    // ---------- PERCEPTION ----------
    // mapmemRemember(vid, corpse): write a corpse into a villager's map
    // memory. Returns the site, or null when there's nothing worth
    // remembering (people, already known, no meat).
    mapmemRemember(vid, corpse) {
      if (!corpse || !vid) return null;
      // people are grief, not groceries — never a haul site.
      try { if (this.corpseIsPerson && this.corpseIsPerson(corpse)) return null; } catch (e) {}
      if (corpse.kind === 'person' || corpse.kind === 'villager') return null;
      var mem = this.mapmemOf(vid);
      for (var i = 0; i < mem.sites.length; i++) {
        if (mem.sites[i].ref === corpse.id) return mem.sites[i]; // already known
      }
      var meat = this.mapmemMeatItem(corpse);
      if (!meat) return null; // nothing edible on the body — not a site
      var day = 0;
      try { day = this.state.scholar.day || 0; } catch (e) {}
      var spoilBy = meat.spoilDay != null ? meat.spoilDay : (corpse.dayDied || day) + 3;
      if (day > spoilBy) return null; // already rot — no memory worth having
      var gross = meat.hiddenKcal || 0;
      var label = this.mapmemSiteLabel(corpse);
      var site = {
        nx: corpse.node ? corpse.node.x : 4, ny: corpse.node ? corpse.node.y : 4,
        kind: 'corpse', ref: corpse.id,
        label: label,
        mid: corpse.monsterId || null,
        animalId: corpse.kind === 'animal' ? (corpse.animalId || null) : null,
        estKcal: Math.round(gross * HAUL_YIELD),
        seenDay: day, spoilBy: spoilBy,
        secondhand: false, toldBy: null,
      };
      mem.sites.push(site);
      // cap: expired first, then lowest value
      while (mem.sites.length > MEM_CAP) {
        var ei = -1;
        for (var j = 0; j < mem.sites.length; j++) {
          if (day > mem.sites[j].spoilBy) { ei = j; break; }
        }
        if (ei === -1) {
          ei = 0;
          for (var k = 1; k < mem.sites.length; k++) {
            if (mem.sites[k].estKcal < mem.sites[ei].estKcal) ei = k;
          }
        }
        mem.sites.splice(ei, 1);
      }
      return site;
    },

    // mapmemSiteLabel: the knowledge-gated label. Monsters: the descriptor
    // the village knows (monsterDisplayName — strange descriptor until named).
    // Animals: common name (recognizable Earth animals are early knowledge).
    mapmemSiteLabel(corpse) {
      if (corpse.kind === 'monster' && corpse.monsterId) {
        try {
          if (this.monsterDisplayName) return this.monsterDisplayName(corpse.monsterId);
        } catch (e) {}
        return (corpse.descriptor || 'something dead');
      }
      if (corpse.kind === 'animal') {
        try {
          var aid = corpse.animalId || (corpse.name || '').toLowerCase().replace(/\s+/g, '_');
          var adef = (this.data.animals || []).find(function (a) { return a.id === aid; });
          if (adef) return adef.name;
        } catch (e) {}
        return corpse.name || 'a dead animal';
      }
      return corpse.name || 'something dead';
    },

    // mapmemMeatItem: the butcherable meat on a corpse, if any and if fresh.
    mapmemMeatItem(corpse) {
      if (!corpse || corpse.buried) return null;
      var items = corpse.items || [];
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (!it || (it.units == null ? 1 : it.units) <= 0) continue;
        if (it.foodKind === 'meat' && it.foodState === 'carcass') return it;
      }
      return null;
    },

    // mapmemFoodKnown: the knowledge gate. Animals are known food (no gate
    // on animal meat — carcassToMeat only gates monster flesh). Monster meat
    // needs the village to have marked it food-safe (cautious testing,
    // teaching, Codex). Unknown flesh stays on the corpse for the player.
    mapmemFoodKnown(corpse) {
      if (!corpse) return false;
      if (corpse.kind === 'animal') return true;
      if (corpse.kind === 'monster' && corpse.monsterId) {
        try { return !!(this.monsterFoodSafe && this.monsterFoodSafe(corpse.monsterId)); } catch (e) {}
        return false;
      }
      return false;
    },

    // mapmemPurge(vid): drop memories whose meat is gone — rotted past the
    // spoil clock, or the corpse was looted/buried/emptied.
    mapmemPurge(vid) {
      var mem = this.mapmemOf(vid);
      var day = 0;
      try { day = this.state.scholar.day || 0; } catch (e) {}
      var corpses = [];
      try { corpses = this.corpses ? this.corpses() : []; } catch (e) {}
      mem.sites = mem.sites.filter(function (s) {
        if (day > s.spoilBy) return false;
        var c = null;
        for (var i = 0; i < corpses.length; i++) {
          if (corpses[i].id === s.ref) { c = corpses[i]; break; }
        }
        if (!c || c.buried) return false;
        return true;
      });
      return mem.sites;
    },

    // mapmemNoticeNode(vid, nx, ny): called as villagers move — they see
    // what's on the node they're standing on. Fresh corpses with meat become
    // memories. This is how map memory fills in from ordinary travel.
    mapmemNoticeNode(vid, nx, ny) {
      var corpses = [];
      try { corpses = this.corpses ? this.corpses() : []; } catch (e) {}
      for (var i = 0; i < corpses.length; i++) {
        var c = corpses[i];
        if (!c || c.buried || !c.node) continue;
        if (c.node.x !== nx || c.node.y !== ny) continue;
        try { this.mapmemRemember(vid, c); } catch (e) {}
      }
    },

    // mapmemNoteKill(vid, m, node): the expedition kill hook. The kill used
    // to leave no body at all — the meat vanished. Now the body is really
    // there (registerDeath, node override), on the real rot clock, with the
    // real meat entry. The killer remembers it; that's the first memory.
    // (r12 2026-10-17): the killer is standing on the corpse — they butcher
    // on the spot and carry the meat (returned for the expedition's pack).
    // A round trip from haven can't beat the 3-day rot for wild kills.
    mapmemNoteKill(vid, m, node) {
      if (!m || !node) return null;
      var corpse = null;
      try {
        corpse = this.registerDeath({
          kind: 'monster', monsterId: m.id, monsterName: (m.name || 'the beast'),
          name: this.monsterDisplayName ? this.monsterDisplayName(m.id) : (m.name || 'the beast'),
          descriptor: this.monsterDisplayName ? this.monsterDisplayName(m.id) : null,
          node: { x: node.nx != null ? node.nx : node.x, y: node.ny != null ? node.ny : node.y },
          cause: 'expedition', killerId: vid, witnesses: [vid],
        });
        // BELLTOAD (Steve 2026-10-13): expedition kills use the plural
        // monsterCarcassEntries like the patrol path — the legs drop as a
        // separate item from the poisonous body. (The singular
        // monsterMeatEntry lost the legs entirely here.)
        var mdef = m;
        try {
          var _found = (this.data.monsters || []).find(function (x) { return x.id === m.id; });
          if (_found) mdef = _found;
        } catch (e) {}
        var meats = this.monsterCarcassEntries ? this.monsterCarcassEntries(mdef) : [];
        if (corpse && meats && meats.length) {
          for (var _mi = 0; _mi < meats.length; _mi++) corpse.items.push(meats[_mi]);
        }
      } catch (e) {}
      if (!corpse) return null;
      try { this.mapmemRemember(vid, corpse); } catch (e) {}
      // butcher on the spot — the killer carries it home
      var carried = null;
      try { carried = this.mapmemButcherForCarry ? this.mapmemButcherForCarry(vid, corpse) : null; } catch (e) {}
      return carried;
    },

    // ---------- GOSSIP SPREAD ----------
    // mapmemTell(tellerVid, listenerVid): "there's meat on the north ridge."
    // The listener gains the memory secondhand — estKcal fuzzed ±30%
    // (gossip distortion is canon), marked so it reads as hearsay.
    mapmemTell(tellerVid, listenerVid) {
      if (!tellerVid || !listenerVid || tellerVid === listenerVid) return null;
      var tmem = this.mapmemOf(tellerVid);
      if (!tmem.sites.length) return null;
      // share the freshest site worth sharing
      var day = 0;
      try { day = this.state.scholar.day || 0; } catch (e) {}
      var best = null;
      for (var i = 0; i < tmem.sites.length; i++) {
        var s = tmem.sites[i];
        if (day > s.spoilBy) continue;
        if (!best || s.estKcal > best.estKcal) best = s;
      }
      if (!best) return null;
      var lmem = this.mapmemOf(listenerVid);
      for (var j = 0; j < lmem.sites.length; j++) {
        if (lmem.sites[j].ref === best.ref) return lmem.sites[j]; // already knows
      }
      var fuzz = 0.7 + R() * 0.6; // ±30% — hearsay is approximate
      var copy = {
        nx: best.nx, ny: best.ny, kind: best.kind, ref: best.ref,
        label: best.label, mid: best.mid, animalId: best.animalId,
        estKcal: Math.round(best.estKcal * fuzz),
        seenDay: day, spoilBy: best.spoilBy,
        secondhand: true, toldBy: tellerVid,
      };
      lmem.sites.push(copy);
      while (lmem.sites.length > MEM_CAP) lmem.sites.shift();
      // the telling is gossip — the village can hear about the telling
      try {
        var tnm = this.displayName ? this.displayName(tellerVid) : 'Someone';
        var lnm = this.displayName ? this.displayName(listenerVid) : 'someone';
        this.seedGossip('corpse-word', { teller: tellerVid, listener: listenerVid, ref: best.ref }, [listenerVid]);
      } catch (e) {}
      return copy;
    },

    // ---------- HAUL SITE SELECTION ----------
    // mapmemBestHaul(vid, hx, hy): the best haulable remembered corpse.
    // Fresh, known-food, within range, not already being hauled. Scored by
    // value × urgency / distance — a big carcass spoiling tomorrow beats a
    // small one with days left.
    // mapmemHaulSites(vid, hx, hy): remembered corpse sites ranked best-first
    // by the value × urgency / distance score. Each carries _dist and
    // _daysLeft for the offer predicate. (r12: extracted from mapmemBestHaul
    // so the candidate can fall through past doomed/gated sites.)
    mapmemHaulSites(vid, hx, hy) {
      var sites = this.mapmemPurge(vid);
      if (!sites.length) return [];
      var maxD = 1;
      try { maxD = Math.max(1, this.npcMaxDist(vid)); } catch (e) {}
      var day = 0;
      try { day = this.state.scholar.day || 0; } catch (e) {}
      // who else is already hauling this corpse? No dogpiling.
      var claimed = {};
      try {
        var objs = this.objState ? this.objState() : {};
        for (var k in objs) {
          var o = objs[k];
          if (o && o.kind === 'HAUL' && o.targetRef && (o.state === 'ready' || o.state === 'out')) {
            claimed[o.targetRef] = (claimed[o.targetRef] || 0) + 1;
          }
        }
      } catch (e) {}
      var ranked = [];
      for (var i = 0; i < sites.length; i++) {
        var s = sites[i];
        if (s.kind !== 'corpse') continue;
        if ((claimed[s.ref] || 0) >= MAX_HAULERS_PER_CORPSE) continue;
        var dist = Math.max(Math.abs(s.nx - hx), Math.abs(s.ny - hy));
        if (dist > maxD) continue;
        // the corpse must still hold known-safe meat — check the real thing
        var corpse = null;
        try {
          var cs = this.corpses ? this.corpses() : [];
          for (var ci = 0; ci < cs.length; ci++) {
            if (cs[ci].id === s.ref) { corpse = cs[ci]; break; }
          }
        } catch (e) {}
        if (!corpse) continue;
        if (!this.mapmemMeatItem(corpse)) continue;
        // HAUL-UNREVEALED (Steve 2026-10-16): no mapmemFoodKnown gate here.
        // Villagers target unknown flesh too — the knowledge law gates eating,
        // not hauling. (The at-the-body check in mapmemHaulAt handles the
        // unknown-flesh path.)
        var daysLeft = Math.max(0, s.spoilBy - day);
        var urgency = 1 + 2 * (1 - Math.min(1, daysLeft / 3)); // spoiling tomorrow ≈ 3x
        var score = (s.estKcal * urgency) / (1 + dist);
        ranked.push({ site: s, dist: dist, daysLeft: daysLeft, score: score });
      }
      ranked.sort(function (a, b) { return b.score - a.score; });
      return ranked;
    },

    mapmemBestHaul(vid, hx, hy) {
      var ranked = [];
      try { ranked = this.mapmemHaulSites(vid, hx, hy); } catch (e) {}
      return ranked.length ? ranked[0].site : null;
    },

    // mapmemHaulCandidate(vid, hx, hy): the HAUL objective offer. Returns the
    // remembered corpse site if a haul should be offered this pick, else null.
    //
    // (r12 2026-10-17 — the r11 blank, probe-verified): the old gate was
    // famine-only (pantry < 5000 || hunger > 50), so in a competent village
    // (pantry 50k+) the candidate was NEVER offered — the substrate worked
    // (killers remembered corpses, bestHaul found targets) but no objective
    // ever fired. The haul feeds the KNOWLEDGE economy (Steve 2026-10-16:
    // hauling is how unknown flesh reaches the cautious-test loop), so the
    // offer now has two channels: the famine gate (as before — a hungry
    // village hauls any meat) AND the knowledge channel (unrevealed monster
    // flesh is new knowledge worth a trip even with a full pantry; the
    // estKcal/distance score in bestHaul still decides whether the trip is
    // worth it). Known-safe meat with a full pantry stays un-offered.
    mapmemHaulCandidate(vid, hx, hy) {
      var ranked = [];
      try { ranked = this.mapmemHaulSites ? this.mapmemHaulSites(vid, hx, hy) : []; } catch (e) {}
      if (!ranked.length) return null;
      var day = 0;
      try { day = this.state.scholar.day || 0; } catch (e) {}
      var pantry = 0, hunger = 0;
      try { pantry = this.pantryKcalLive ? this.pantryKcalLive(this.state.village) : 0; } catch (e) {}
      try { hunger = (this.npcNeeds ? (this.npcNeeds(vid) || {}) : {}).hunger || 0; } catch (e) {}
      var corpses = [];
      try { corpses = this.corpses ? this.corpses() : []; } catch (e) {}
      // best-first; the first site that is both feasible and wanted wins.
      // (A doomed best site must not block a feasible second-best.)
      for (var ri = 0; ri < ranked.length; ri++) {
        var site = ranked[ri].site, dist = ranked[ri].dist;
        // TRIP FEASIBILITY (r12): don't offer a haul the rot beats. The round
        // trip runs (2*dist+3) parts ≈ /3 days; the meat must survive until
        // the villager gets there. A doomed haul wastes the trip and the meat.
        var sleft = Math.max(0, site.spoilBy - day);
        if (sleft < (2 * dist + 3) / 3) continue;
        if (pantry < 5000 || hunger > 50) return site;
        // knowledge channel: is this site's meat still unrevealed?
        for (var i = 0; i < corpses.length; i++) {
          if (corpses[i] && corpses[i].id === site.ref) {
            if (this.mapmemFoodKnown && !this.mapmemFoodKnown(corpses[i])) return site;
            break;
          }
        }
      }
      return null;
    },

    // mapmemButcherForCarry(vid, corpse): butcher carcass-state meat on the
    // spot, for carrying (not a haul objective). Returns
    // {kcal, unknown: [items], label} — known-safe meat as kcal, unrevealed
    // monster flesh as 0-kcal testable items (the knowledge law holds:
    // transport is not consumption). Marks the corpse looted when emptied.
    // (r12 2026-10-17): the expedition killer is standing on the corpse —
    // they butcher now and carry it home on return. The HAUL objective
    // covers kills near haven; this covers kills in the wild where the
    // 3-day rot beats any round trip from haven.
    mapmemButcherForCarry(vid, corpse) {
      if (!corpse) return null;
      var out = { kcal: 0, unknown: [], label: 'meat' };
      var items = corpse.items || [];
      var tookAny = false;
      for (var i = 0; i < items.length; i++) {
        var meat = items[i];
        if (!meat || (meat.units == null ? 1 : meat.units) <= 0) continue;
        if (meat.foodKind !== 'meat' || meat.foodState !== 'carcass') continue;
        var mid = String(meat.plantId || '').replace(/^meat_/, '');
        var known = false;
        try { known = this.mapmemFoodKnown ? this.mapmemFoodKnown({ kind: corpse.kind, monsterId: mid }) : false; } catch (e) {}
        // belltoad legs gate on their own part id
        if (!known && mid) {
          try { known = !!(this.monsterFoodSafe && this.monsterFoodSafe(mid)); } catch (e) {}
        }
        var gross = meat.hiddenKcal || 0;
        if (!known && mid && corpse.kind === 'monster') {
          var unet = Math.round(gross * HAUL_YIELD);
          // PANTRY ATOM LAW (r16 2026-10-18): ceil, not round — a single
          // rounded unit here later reveals into a >500-kcal atom via
          // markMonsterFoodSafe (gross 1400 -> 560, the r15 trip).
          var uunits = Math.max(1, Math.ceil(unet / 500));
          out.unknown.push({
            name: 'Unknown flesh',
            foodKind: 'meat', foodState: 'cleaned',
            plantId: 'meat_' + mid, edible: false, kcalEach: 0, hiddenKcal: gross,
            units: uunits, unit: 'portion',
            kg: Math.max(0.01, (Number(meat.kg) || 0.5) * HAUL_YIELD),
            prep: '⚠️ Unknown flesh. You have no idea if this is food or poison. Test it cautiously, or ask someone who knows.',
            diseaseRisk: 'rawMeat',
          });
          out.label = 'strange meat';
        } else {
          out.kcal += Math.round(gross * HAUL_YIELD);
          out.label = 'meat';
        }
        meat.units = 0; // taken
        tookAny = true;
      }
      if (!tookAny) return null;
      var emptied = !items.some(function (it) { return (it.units == null ? 1 : it.units) > 0; });
      if (emptied) { try { corpse.looted = true; } catch (e) {} }
      // the memory served its purpose — drop it (fresh kills make new ones)
      try {
        var mem = this.mapmemOf(vid);
        mem.sites = mem.sites.filter(function (s) { return s.ref !== corpse.id; });
      } catch (e) {}
      try { this.bumpTrust(vid, 1); } catch (e) {}
      return out;
    },

    // ---------- THE HAUL ----------
    // mapmemHaulAt(vid): called on arrival at the remembered node. Butcher
    // the carcass (kcal-level, like the trap-return path), take the meat,
    // carry it as objective state. Honest failures narrate.
    mapmemHaulAt(vid) {
      var o = null;
      try { o = this.objOf(vid); } catch (e) { return false; }
      if (!o || o.kind !== 'HAUL') return false;
      var nm = 'Someone';
      try { nm = this.displayName(vid); } catch (e) {}
      var corpse = null;
      try {
        var cs = this.corpses ? this.corpses() : [];
        for (var i = 0; i < cs.length; i++) {
          if (cs[i].id === o.targetRef) { corpse = cs[i]; break; }
        }
      } catch (e) {}
      var playerHere = false;
      try {
        var nn = this.npcNode(vid);
        playerHere = !!(nn && this.map.px === nn.nx && this.map.py === nn.ny);
      } catch (e) {}
      if (!corpse || corpse.buried) {
        if (playerHere) this.say(`🥩 ${nm} reaches the spot — nothing left. "Picked clean. Or it walked off. Either way."`);
        o.state = 'returning'; return false;
      }
      var meat = this.mapmemMeatItem(corpse);
      var day = 0;
      try { day = this.state.scholar.day || 0; } catch (e) {}
      if (!meat || (meat.spoilDay != null && day > meat.spoilDay)) {
        // SENTENCE-SAFE (playtest deepening r18 2026-10-18, #542 class):
        // haulLabel is monsterDisplayName — proper names keep casing.
        if (playerHere) this.say(`🥩 ${nm} finds ${this.articlePhrase ? this.articlePhrase(o.haulLabel || 'carcass') : 'the ' + (o.haulLabel || 'carcass')} — too far gone. "Not touching that. Nobody should."`);
        o.state = 'returning'; return false;
      }
      if (!this.mapmemFoodKnown(corpse)) {
        // HAUL-UNREVEALED (Steve 2026-10-16): villagers haul unknown flesh.
        // The knowledge law still gates EATING (0 kcal, not edible until
        // tested) — but transport is not consumption. The hauled flesh
        // arrives as "unknown flesh" and the cautious-test loop
        // (testMonsterMeat) is how it gets revealed — the same try/test/
        // reveal loop as every other food. "How else do they get it to
        // revealed?" — by bringing it home and trying it.
        var umid = corpse.monsterId || null;
        var ugross = meat.hiddenKcal || 0;
        var unet = Math.round(ugross * HAUL_YIELD);
        // PANTRY ATOM LAW (journey-deepening r19 2026-10-19): ceil, not
        // round — round() minted single-unit chunks here (gross 1400 ->
        // unet 700 -> 1 unit) that the reveal had to rescue. Same law as
        // mapmemButcherForCarry's r16 fix.
        var uunits = Math.max(1, Math.ceil(unet / 500));
        var uper = Math.round(unet / uunits);
        var uitem = {
          name: 'Unknown flesh',
          foodKind: 'meat', foodState: 'cleaned',
          plantId: umid ? ('meat_' + umid) : 'meat_unknown',
          edible: false, kcalEach: 0, hiddenKcal: ugross,
          units: uunits, unit: 'portion',
          kg: Math.max(0.01, (Number(meat.kg) || 0.5) * HAUL_YIELD),
          // MEAT CHANNEL (2026-10-27): cleaned flesh keeps ~2 days
          // (PRESERVATION.md) — without a clock, untested and poison-tested
          // flesh sat in the pantry forever as immortal 0-kcal clutter.
          spoilDay: day + 2,
          prep: '⚠️ Unknown flesh. You have no idea if this is food or poison. Test it cautiously, or ask someone who knows.',
          diseaseRisk: 'rawMeat',
        };
        meat.units = 0; // taken
        var uemptied = !(corpse.items || []).some(function (it) { return (it.units == null ? 1 : it.units) > 0; });
        if (uemptied) corpse.looted = true;
        o.haulUnknown = [uitem];
        o.haulName = (o.haulLabel || 'Strange meat');
        o.state = 'returning';
        try {
          var umem = this.mapmemOf(vid);
          umem.sites = umem.sites.filter(function (s) { return s.ref !== corpse.id; });
        } catch (e) {}
        if (playerHere) {
          this.say(`🥩 ${nm} works the carcass over, wrapping the strange meat. "Don't know what this is. Someone at the fire will — or we'll learn the hard way." (Unknown flesh, heading home.)`);
        }
        try { this.bumpTrust(vid, 1); } catch (e) {}
        return true;
      }
      var gross = meat.hiddenKcal || 0;
      var net = Math.round(gross * HAUL_YIELD);
      meat.units = 0; // taken
      var emptied = !(corpse.items || []).some(function (it) { return (it.units == null ? 1 : it.units) > 0; });
      if (emptied) corpse.looted = true;
      o.haulKcal = net;
      o.haulName = (o.haulLabel || 'Hauled meat');
      o.state = 'returning';
      // the memory served its purpose — drop it (fresh kills make new ones)
      try {
        var mem = this.mapmemOf(vid);
        mem.sites = mem.sites.filter(function (s) { return s.ref !== corpse.id; });
      } catch (e) {}
      if (playerHere && net > 0) {
        // SENTENCE-SAFE (playtest deepening r18 2026-10-18, #542 class).
        this.say(`🥩 ${nm} butchers ${this.articlePhrase ? this.articlePhrase(o.haulLabel || 'carcass') : 'the ' + (o.haulLabel || 'carcass')} — working fast, wasting little. (+${net} kcal of meat, heading home.)`);
      } else if (playerHere) {
        this.say(`🥩 ${nm} works the carcass over — barely anything worth taking.`);
      }
      try { this.bumpTrust(vid, 1); } catch (e) {}
      return net > 0;
    },
  };

  Object.assign(G, methods);
})();
