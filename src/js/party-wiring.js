// @ontology
// system: party-wiring
// description: Villagers answer each other's help calls. When a villager gets
//   jumped in a field fight, nearby villagers arrive as allies through the
//   existing fieldFight opts.allies/allyVids machinery — the machinery worked,
//   it was just never fed (depth probe 2026-10-12: calledHelp 0/531 fights).
// provides:
//   - villagerFightAllies(vid)
// rules:
//   - answer_order: the village's most trusted step up first — a stranger
//     doesn't sprint into the treeline for you; a friend does. Ordered by
//     village trust (v.trust), never random. (code: villagerFightAllies,
//     Steve 2026-10-12)
//   - answer_floor: trust below 15 doesn't answer — that's stranger
//     territory (default 10). Earned standing is what runs toward screams.
//   - answer_sources: the outdoor crew first (out there together), then
//     villagers on/adjacent grid nodes (in earshot). Capped at 2 — the
//     fight engine takes the first two and one answers per fight.
//   - no_self_rescue: the fighter never answers their own call; the player
//     is excluded (the player's own party system is separate).
// consumes:
//   - state.village.roster, state.village.trust
//   - npcNode(vid), vpOf(vid) (alive check)
// ============ PARTY WIRING ============
// Villagers fight together now — not because a lever told them to, but
// because someone screamed and someone they trust ran toward it.
// (Steve 2026-10-12: "make sure they actually utilize the party system
// among themselves.")
(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  // Outdoor tasks: villagers out in the wild together this part.
  // (Mirrors the _outdoorCrew snapshot rule in game.js resolveAssignments.)
  const OUTDOOR_TASKS = ['patrol', 'scout', 'hunt', 'forage'];

  // villagerFightAllies(vid): up to 2 villager ids who'd answer vid's shout,
  // trust-ordered. Empty when truly alone.
  Game.villagerFightAllies = function (vid) {
    const self = this;
    try {
      const v = self.state && self.state.village;
      if (!v) return [];
      const roster = v.roster || [];
      const trustMap = v.trust || {};
      const trustOf = (rid) => {
        const t = trustMap[rid];
        return (t === undefined) ? 10 : t;
      };
      const alive = (rid) => {
        try { const p = self.vpOf ? self.vpOf(rid) : null; return !!(p && !p.dead); }
        catch (e) { return true; }
      };
      let me = null;
      try { me = self.npcNode ? self.npcNode(vid) : null; } catch (e) { me = null; }

      const cands = [];
      const seen = {};
      const consider = (rid, why) => {
        if (!rid || rid === vid || seen[rid]) return;
        seen[rid] = true;
        if (rid === self.villagerId) return; // player's own party system is separate
        if (roster.indexOf(rid) === -1) return;
        if (!alive(rid)) return;
        const t = trustOf(rid);
        if (t < 15) return; // ANSWER_FLOOR: strangers don't sprint into the treeline
        cands.push({ rid: rid, trust: t, crew: why === 'crew' });
      };

      // 1. The outdoor crew — out there together. Live read of assignments
      // (the _outdoorCrew snapshot goes stale between phases; the depth
      // probe found it always empty when fights actually happen).
      try {
        const asg = v.assignments || {};
        for (const rid of Object.keys(asg)) {
          if (OUTDOOR_TASKS.indexOf((asg[rid] || {}).task) !== -1) consider(rid, 'crew');
        }
      } catch (e) {}
      // Snapshot as backup (assignments delete as they resolve).
      try {
        for (const rid of (self._outdoorCrew || [])) consider(rid, 'crew');
      } catch (e) {}

      // 2. In earshot — on or adjacent to the fighter's grid node.
      if (me) {
        for (const rid of roster) {
          if (seen[rid] || rid === vid) continue;
          let n = null;
          try { n = self.npcNode ? self.npcNode(rid) : null; } catch (e) { n = null; }
          if (!n) continue;
          const d = Math.max(Math.abs(n.nx - me.nx), Math.abs(n.ny - me.ny));
          if (d <= 1) consider(rid, 'near');
        }
      }

      // Crew first (they're together), then earshot — each trust-ordered.
      // A stranger doesn't sprint; the trusted do, in order.
      cands.sort((a, b) => {
        if (a.crew !== b.crew) return a.crew ? -1 : 1;
        return b.trust - a.trust;
      });
      return cands.slice(0, 2).map((c) => c.rid);
    } catch (e) { return []; }
  };

  // presentFightAllies(vid): the wild/patrol feed (sim-fieldfeed-a
  // 2026-10-28). villagerFightAllies answers "who'd run to the
  // shout"; the wild routers need "who's actually here". Same trust
  // order, same floor (>= 15), same cap (2) — filtered to villagers
  // standing on or adjacent to the fighter's own node (Chebyshev
  // distance <= 1, the earshot radius villagerFightAllies already
  // defines; no new radius invented). A crew member on an outdoor
  // task but standing elsewhere is NOT fed: no radar, no
  // teleporting, no routing anyone to a monster tile nobody fought
  // on. The node read is the village nodePos map AFTER the
  // villagerFightAllies call, so a villager the engine itself places
  // (npcNode's Haven default) reads the same as the engine sees.
  Game.presentFightAllies = function (vid) {
    const self = this;
    try {
      const cands = (typeof self.villagerFightAllies === 'function') ? self.villagerFightAllies(vid) : [];
      if (!cands.length) return [];
      const nodePos = (self.state && self.state.village && self.state.village.nodePos) || {};
      const me = nodePos[vid];
      if (!me || typeof me.nx !== 'number' || typeof me.ny !== 'number') return [];
      const out = [];
      for (const rid of cands) {
        const n = nodePos[rid];
        if (!n || typeof n.nx !== 'number' || typeof n.ny !== 'number') continue;
        if (Math.max(Math.abs(n.nx - me.nx), Math.abs(n.ny - me.ny)) <= 1) out.push(rid);
      }
      return out;
    } catch (e) {
      try { console.warn('[fieldfeed] presentFightAllies failed: ' + ((e && e.message) || e)); } catch (e2) { /* warn best-effort */ }
      return [];
    }
  };
})();
