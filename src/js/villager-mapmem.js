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
        var meat = this.monsterMeatEntry ? this.monsterMeatEntry(m) : null;
        if (corpse && meat) corpse.items.push(meat);
      } catch (e) {}
      if (!corpse) return null;
      try { return this.mapmemRemember(vid, corpse); } catch (e) {}
      return null;
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
    mapmemBestHaul(vid, hx, hy) {
      var sites = this.mapmemPurge(vid);
      if (!sites.length) return null;
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
      var best = null, bestScore = 0;
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
        if (!this.mapmemFoodKnown(corpse)) continue;
        var daysLeft = Math.max(0, s.spoilBy - day);
        var urgency = 1 + 2 * (1 - Math.min(1, daysLeft / 3)); // spoiling tomorrow ≈ 3x
        var score = (s.estKcal * urgency) / (1 + dist);
        if (score > bestScore) { bestScore = score; best = s; }
      }
      return best;
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
        if (playerHere) this.say(`🥩 ${nm} finds the ${o.haulLabel || 'carcass'} — too far gone. "Not touching that. Nobody should."`);
        o.state = 'returning'; return false;
      }
      if (!this.mapmemFoodKnown(corpse)) {
        // learned since the memory was written? re-check at the body.
        if (playerHere) this.say(`🥩 ${nm} looks the carcass over and backs off. "Don't know what that is. Not risking it."`);
        o.state = 'returning'; return false;
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
        this.say(`🥩 ${nm} butchers the ${o.haulLabel || 'carcass'} — working fast, wasting little. (+${net} kcal of meat, heading home.)`);
      } else if (playerHere) {
        this.say(`🥩 ${nm} works the carcass over — barely anything worth taking.`);
      }
      try { this.bumpTrust(vid, 1); } catch (e) {}
      return net > 0;
    },
  };

  Object.assign(G, methods);
})();
