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
//     fight engine takes the first two; with FIGHTALLY2=1 both can
//     answer (second via a second shout), otherwise one answers per
//     fight (fieldFights.js, sim-fightallycap-b, finding #2496).
//   - launch_first: with SENSEEXPED=1 (sim-senseexped-b, finding
//     #2583), the fighter's current expedition companions answer
//     FIRST, in expedition-start order: the agencyState().exped
//     entries sharing the fighter's target (tx, ty). The party that
//     set out travels together even when the encounter instant finds
//     them a leg apart — the fight gate counts them the same way
//     (code: winPlanFightGate). Membership comes from the expedition
//     itself, NOT from winPlan[vid].party, which a re-launch, a
//     companion's early return, or a death can rewrite mid-hunt (the
//     two DIAG arms: sim-sensecotravel-b + sim-sense-guard-diag-a).
//     They bypass the trust floor: the companion picks enforced it
//     at launch (trust >= 15), and the expedition itself is the
//     commitment. Cap stays 2 — the engine takes the first two, so a
//     trio arrives whole and a quad arrives as holder + 2 of 3; the
//     4th seat needs a fieldFights 3rd-ally slot (separate arm, not
//     here).
//   - no_self_rescue: the fighter never answers their own call; the player
//     is excluded (the player's own party system is separate).
// consumes:
//   - state.village.roster, state.village.trust
//   - agencyState().exped (launch companions + same-target guard, SENSEEXPED=1)
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
  // launch party first (SENSEEXPED=1), then trust-ordered. Empty when truly alone.
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

      // 0. The launch party — SENSEEXPED (sim-senseexped-b, finding
      // #2583): the party that set out together answers first, in
      // expedition-start order (sinceDay, then sincePart). Membership
      // comes from the fighter's CURRENT expedition companions — the
      // agencyState().exped entries sharing the fighter's target —
      // not from winPlan[vid].party, which a re-launch, a companion's
      // early return, or a death can rewrite mid-hunt. Same-target is
      // the guard. No trust floor here — the pick enforced it at
      // launch, and the expedition is the commitment. No node check:
      // they travel together even a leg apart at the meeting instant
      // (the gate counts them the same way). Env-gated: off = the old
      // sense, byte-identical (launch stays empty).
      var launch = [];
      var senseexpedOn = false;
      try { senseexpedOn = (typeof process !== 'undefined' && process.env && process.env.SENSEEXPED === '1'); } catch (e) {}
      if (senseexpedOn) try {
        var a0 = self.agencyState ? self.agencyState() : null;
        var myExped = (a0 && a0.exped) ? a0.exped[vid] : null;
        if (myExped) {
          var comp = [];
          var exped = a0.exped;
          for (var rid2 in exped) {
            if (!Object.prototype.hasOwnProperty.call(exped, rid2)) continue;
            var e2 = exped[rid2];
            if (!e2 || rid2 === vid) continue;
            if (e2.tx !== myExped.tx || e2.ty !== myExped.ty) continue;
            comp.push({ rid: rid2, sinceDay: (e2.sinceDay | 0), sincePart: (e2.sincePart | 0) });
          }
          comp.sort(function (x, y) {
            if (x.sinceDay !== y.sinceDay) return x.sinceDay - y.sinceDay;
            if (x.sincePart !== y.sincePart) return x.sincePart - y.sincePart;
            return (x.rid < y.rid) ? -1 : (x.rid > y.rid) ? 1 : 0;
          });
          for (var k = 0; k < comp.length; k++) {
            var pid = comp[k].rid;
            if (!pid || seen[pid]) continue;
            if (pid === self.villagerId) continue; // player's own party system is separate
            if (roster.indexOf(pid) === -1) continue;
            if (!alive(pid)) continue;
            seen[pid] = true;
            launch.push(pid);
          }
        }
      } catch (e) {}

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
      // A stranger doesn't sprint; the trusted do, in order. The launch
      // party heads the list (expedition-start order) ahead of both: the
      // party that set out answers before whoever happens to be near.
      cands.sort((a, b) => {
        if (a.crew !== b.crew) return a.crew ? -1 : 1;
        return b.trust - a.trust;
      });
      var out = launch.slice(0, 2);
      for (var i = 0; i < cands.length && out.length < 2; i++) out.push(cands[i].rid);
      return out;
    } catch (e) { return []; }
  };
})();
