// @ontology
// system: graves
// description: Persistent grave markers at the Haven fire. Every villager burial raises a marker — name (knowledge-gated at burial), cause of death, day — that stays for the run: examinable, and payRespects available. The physical, visitable counterpart to the Codex THE FALLEN roll (fallen-memorial.js). (Roguelike Celebration 2026, Talk 7 N7-3.)
// provides:
//   - graves()
//   - havenNodeXY()
//   - graveAt(cx, cy)
//   - graveFor(villagerId)
//   - graveSpot()
//   - createGrave(corpse)
//   - graveDesc(g)
//   - examineGrave(id)
//   - payGraveRespects(id)
// rules:
//   - marker_at_the_fire_not_the_grave: every villager burial raises the marker at the Haven fire — the body rests where it was buried, the village's memory-marker is communal ("the village will know where," made literal). (code: buryCorpse → createGrave, 2026-10-22)
//   - graves_knowledge_gate_names: the name is frozen knowledge-gated at burial via fallenName (the firstRef mourning-line convention): known → first name, unknown → distinguishing descriptor, never the unrevealed true name. The dead bearer is named as the village knew them (fallenName's bearer rule). (code: createGrave, 2026-10-22)
//   - graves_never_the_taken: the Taken are never memorialized as dead (KIN.md). The Taken are never villager records and never produce corpses — and createGrave still gates explicitly on a real roster death: no villagerId, no grave. (code: createGrave, 2026-10-22)
//   - one_grave_per_villager: a villager gets exactly one marker; a second createGrave call for the same villagerId is a no-op. (code: createGrave, 2026-10-22)
//   - grave_respects_mirror_the_rite: payGraveRespects is the corpse rite relocated — -3 trauma, once per grave, and the grave inherits the corpse's respectsPaid so a body already honored doesn't pay out twice. Later visits narrate, never silently. (code: payGraveRespects, 2026-10-22)
//   - graves_narrate: examining a grave always says something — no silent actions. (code: examineGrave/graveDesc, 2026-10-22)
//   - graves_in_run_only: markers live on state.village and die with the run. No cross-run saga (metaProgression law, ledger.js:587-590). (code: graves, 2026-10-22)
// consumes:
//   - state.village.graves
//   - state.corpses (buryCorpse hands the corpse over)
//   - state.scholar.day
// ============ GRAVE MARKERS ============
// "Buried means gone" was the gap: the burial said "the village will know
// where" but no marker existed. Now every burial raises one at the Haven
// fire — the talk's "empty hut" analogue, a PLACE where someone was.
(function () {
  'use strict';
  const G = (typeof globalThis !== 'undefined' && globalThis.Scattering && globalThis.Scattering.Game)
    ? globalThis.Scattering.Game
    : (typeof Game !== 'undefined' ? Game : null);
  if (!G) return;

  const methods = {

    // graves(): the run's markers, stored on state.village — in-run only,
    // plain data, save/load safe. Legacy saves start empty.
    graves() {
      const v = this.state.village || (this.state.village = {});
      v.graves = v.graves || [];
      return v.graves;
    },

    // havenNodeXY(): the Haven's node coordinates — the same convention
    // recoverBearer and the corpse system use (v.px ?? 4, v.py ?? 4).
    havenNodeXY() {
      const v = this.state.village || {};
      return { x: v.px != null ? v.px : 4, y: v.py != null ? v.py : 4 };
    },

    // graveAt(cx, cy): markers on this cell, at the Haven node only.
    // Mirrors corpseAt's node-scoping.
    graveAt(cx, cy) {
      try {
        const n = this.havenNodeXY();
        if (!this.map || this.map.px !== n.x || this.map.py !== n.y) return [];
        return this.graves().filter(g => g && g.mx === cx && g.my === cy);
      } catch (e) { console.warn('[graves] graveAt', e && e.message); return []; }
    },

    // graveFor(villagerId): the marker for one of the dead, if any.
    graveFor(villagerId) {
      try {
        return (this.graves() || []).find(g => g && g.villagerId === villagerId) || null;
      } catch (e) { console.warn('[graves] graveFor', e && e.message); return null; }
    },

    // graveSpot(): a free cell near the fire pit on the Haven grounds.
    // Anchors on the real 'fire' cell when the grounds detail is available,
    // else the mapgen spot (2,4). Prefers walkable dirt/grass around the
    // fire; never the fire itself, the lodge, or tents (cell-type filtered);
    // never a cell that already holds a grave.
    // GROUNDS-ONLY (break-it camps r13 2026-10-10): the haven tile's t.detail
    // is the current view's alias — inside the hall it's the HALL layout
    // (its own fire at (3,5)). Trust t.groundsDetail first; accept t.detail
    // only when it carries 'lodge' (the hall interior never does). Without
    // either, fall back to the mapgen constants with a static avoid-set.
    graveSpot() {
      const used = {};
      try { for (const g of (this.graves() || [])) if (g) used[g.mx + ',' + g.my] = true; } catch (e) {}
      let detail = null;
      try {
        const n = this.havenNodeXY();
        const t = this.tileAt(n.x, n.y);
        if (t) {
          if (t.groundsDetail) detail = t.groundsDetail;
          else if (t.detail && t.detail.some(row => row && row.includes('lodge'))) detail = t.detail;
        }
      } catch (e) { detail = null; }
      let ax = 2, ay = 4;
      try {
        if (detail) {
          outer: for (let y = 0; y < detail.length; y++) {
            const row = detail[y] || [];
            for (let x = 0; x < row.length; x++) {
              if (row[x] === 'fire') { ax = x; ay = y; break outer; }
            }
          }
        }
      } catch (e) {}
      // STATIC AVOID-SET: the mapgen constants (fire pit, lodge footprint,
      // lodge doorstep) — used only when no grounds detail is available.
      const avoid = { '2,4': 1, '3,3': 1, '4,3': 1, '5,3': 1, '3,4': 1, '4,4': 1, '5,4': 1, '4,5': 1 };
      const ring = [[0, 1], [0, -1], [-1, 0], [1, 0],
        [-1, -1], [1, -1], [-1, 1], [1, 1],
        [0, 2], [0, -2], [-2, 0], [2, 0],
        [-1, 2], [1, 2], [-2, 1], [2, 1],
        [-2, -1], [2, -1], [-1, -2], [1, -2],
        [0, 3], [0, -3], [-3, 0], [3, 0]];
      const free = (x, y) => {
        if (x < 0 || y < 0 || x > 8 || y > 8) return false;
        if (used[x + ',' + y]) return false;
        if (!detail) return !avoid[x + ',' + y];
        const cell = (detail[y] || [])[x];
        return cell === 'dirt' || cell === 'grass';
      };
      for (const [dx, dy] of ring) {
        const x = ax + dx, y = ay + dy;
        if (free(x, y)) return [x, y];
      }
      if (detail) {
        for (let y = 0; y < detail.length; y++) {
          const row = detail[y] || [];
          for (let x = 0; x < row.length; x++) {
            if ((row[x] === 'dirt' || row[x] === 'grass') && !used[x + ',' + y]) return [x, y];
          }
        }
      }
      return [ax, ay + 1]; // last resort: beside the fire, whatever the cell
    },

    // createGrave(c): raise the marker. Called from buryCorpse — the corpse
    // is already buried at this point. Returns the grave, or null when the
    // gate refuses (non-person corpse, no villagerId, or a duplicate).
    // THE TAKEN (KIN.md): never memorialized as dead. The Taken are never
    // villager records and never produce corpses — the villagerId gate is
    // the explicit enforcement: unknown fate means no grave.
    createGrave(c) {
      try {
        if (!c || !this.corpseIsPerson || !this.corpseIsPerson(c)) return null;
        const vid = c.villagerId;
        if (!vid) return null;
        if (this.graveFor(vid)) return null; // one grave per villager
        let name = 'someone';
        try {
          if (typeof this.fallenName === 'function') name = this.fallenName(vid) || 'someone';
          else if (typeof this.firstRef === 'function') name = this.firstRef(vid) || 'someone';
        } catch (e) { console.warn('[graves] gated name', e && e.message); }
        const day = ((this.state || {}).scholar || {}).day || 0;
        const spot = this.graveSpot();
        const grave = {
          id: 'grave_' + vid,
          kind: 'grave',
          villagerId: vid,
          name: name,
          cause: c.cause || 'the wild',
          day: day,
          node: this.havenNodeXY(),
          mx: spot[0], my: spot[1],
          respectsPaid: !!c.respectsPaid, // the rite pays out once, wherever it happened
          visits: 0,
        };
        this.graves().push(grave);
        this.say(`The village raises a marker by the fire — ${name}, day ${day}. ${grave.cause}. A place to stand.`);
        try { this.tele('grave_raised', { who: vid }); } catch (e) {}
        return grave;
      } catch (e) { console.warn('[graves] createGrave', e && e.message); return null; }
    },

    // graveDesc(g): the examine text. The name was frozen knowledge-gated
    // at burial, so no live re-gating here — what the village knew then is
    // what the marker carries. Bearer epitaphs ride along (fallen-memorial's
    // lookup, reused not reinvented).
    graveDesc(g) {
      if (!g) return 'Nothing there.';
      const name = g.name || 'someone';
      const cause = g.cause || 'the wild';
      const day = g.day || 0;
      const D = [
        `A low mound by the fire, marked with a cairn of stones. ${name} — day ${day}, ${cause}. Someone straightened the stones this morning.`,
        `A marker at the fire's edge: heaped earth, a ring of stones, a name the village knows. ${name}. Day ${day}. ${cause}.`,
        `You stop at the cairn without deciding to. ${name} — day ${day}, ${cause}. The fire pops. The village goes on around the absence.`,
      ];
      let text = D[Math.floor(Math.random() * D.length)];
      try {
        const ep = (typeof this.fallenEpitaph === 'function') ? this.fallenEpitaph(g.villagerId) : null;
        if (ep) text += ` Their own last words, kept: "${ep}"`;
      } catch (e) {}
      return text;
    },

    // examineGrave(id): looking at the marker is a narrated beat — never
    // silent. The UI gates the tap by distance; the API narrates regardless.
    examineGrave(id) {
      const g = (this.graves() || []).find(x => x && x.id === id);
      if (!g) { this.say('Nothing there.'); return null; }
      g.visits = (g.visits || 0) + 1;
      this.say(this.graveDesc(g));
      return g;
    },

    // payGraveRespects(id): the corpse rite, relocated to the marker.
    // Same shape as payRespects: -3 trauma, once per grave — and the grave
    // inherits the corpse's respectsPaid, so a body already honored at the
    // graveside doesn't pay out twice. Later visits narrate, never silently.
    payGraveRespects(id) {
      const g = (this.graves() || []).find(x => x && x.id === id);
      if (!g) { this.say('Nothing to honor here.'); return null; }
      if (g.respectsPaid) { this.say('You already said your words. The marker keeps them.'); return null; }
      g.respectsPaid = true;
      const s = this.state.scholar;
      s.trauma = Math.max(0, (s.trauma || 0) - 3);
      this.say(`You say a few words for ${g.name}, at the marker by the fire. Not a ceremony — just: you were here, and someone noticed you leaving. (-3 trauma)`);
      try { this.observe('honor_dead', { target: g.villagerId }); } catch (e) {}
      if (this.tickAction) this.tickAction(4);
      return true;
    },
  };

  Object.assign(G, methods);
})();
