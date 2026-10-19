// @ontology
// system: buildarounds
// description: Build-around ability engine (Steve 2026-10-14 ability coherency rework). The 10 path build-arounds — weak alone, run-defining with 2+ same-path abilities. Each tracks its own state and exposes hook functions called from combat/heal/move/forage paths. All hooks are hasAbility-guarded and try/catch-safe.
// provides:
//   - onStrikeHit (code: BA.onStrikeHit)
//   - onStrikeMiss (code: BA.onStrikeMiss)
//   - onBlocked (code: BA.onBlocked)
//   - onHeal (code: BA.onHeal)
//   - onMove (code: BA.onMove)
//   - onDamaged (code: BA.onDamaged)
//   - onForage (code: BA.onForage)
//   - onDayTick (code: BA.onDayTick)
//   - damageMult (code: BA.damageMult)
//   - dodgeBonus (code: BA.dodgeBonus)
//   - socialMult (code: BA.socialMult)
//   - forageMult (code: BA.forageMult)
//   - unleash (code: BA.unleash)
//   - mark (code: BA.mark)
// rules:
//   - guarded_hooks: every hook checks hasAbility first; no-ability = no-op, no state touched (code: onStrikeHit)
//   - fight_scoped: per-fight state lives on the fight object, discarded at fight end (code: fightState)
//   - never_silent: state changes that matter narrate via say() (code: onStrikeHit)
//   - assembly_gated: build-arounds are weak alone — full power needs 2+ same-path abilities (code: baPathCount)
//   - cornucopia_gathers: real plant gathers advance a canonical person's streak before yield; walking keeps the chain, failed gathering, other work, combat and dawn break it (code: onForage / forageMult)
//   - interest_holder_parity: each living resident holder earns once per person/day from the same opening pantry, using their own build and the shared pantry cap (code: onDayTick)
(function (global) {
  'use strict';

  // Count held abilities on a path (for assembly gating).
  function baPathCount(game, path, who) {
    try {
      // An evolved ability counts as its root (evolvedFrom keeps the lineage).
      // ABILITY LANES (2026-10-14): known skill-lane abilities (a human
      // haymaker, ambush...) still count toward their path — one helper.
      const held = who && who !== game.villagerId ? game.npcOwnedIds(who)
        : (typeof game.ownedAbilityIds === 'function') ? game.ownedAbilityIds()
        : (game.state.scholar.abilities || []).map(a => (a && (a.evolvedFrom || a.id)) || a);
      const data = game.data.abilities || [];
      return held.filter(id => {
        const def = data.find(d => d.id === id);
        // GOD-PATH REDESIGN (2026-10-14): one source — def.path (+ alsoPath).
        return def && (def.path === path || def.alsoPath === path);
      }).length;
    } catch (e) { return 0; }
  }

  // Per-fight state, stored on the fight object.
  function fightState(game) {
    const f = game.tbfight;
    if (!f) return null;
    f.buildaround = f.buildaround || {};
    return f.buildaround;
  }

  // Per-day state, stored on scholar.
  function dayState(game) {
    const s = game.state.scholar;
    s.buildaround = s.buildaround || {};
    return s.buildaround;
  }

  function forageWho(game, who) { return !who || who === 'player' ? game.villagerId || 'player' : who; }
  function forageEntry(game, who) { return ((game.state.village || {}).cornucopia || {})[forageWho(game, who)]; }
  function forageHeld(game, who) {
    const id = forageWho(game, who);
    if (id === game.villagerId || id === 'player') return !!(game.hasAbility && game.hasAbility('cornucopia'));
    if (!game.npcHasAbility || !game.npcHasAbility(id, 'cornucopia')) return false;
    const person = game.vpOf(id);
    return (game.state.village.roster || []).includes(id) && !!person && !person.dead;
  }
  function forageCount(game, who) {
    const entry = forageEntry(game, who);
    // Preserve a legacy player's manually recorded streak until their next action.
    const old = forageWho(game, who) === game.villagerId ? ((game.state.scholar.buildaround || {}).cornucopia || 0) : 0;
    return Math.max(0, Math.min(10, entry ? entry.streak || 0 : old));
  }

  var BA = {
    // BLOOD FRENZY (brawler): 3rd consecutive hit = guaranteed crit.
    // Designed for 3-turn fights: one decisive moment, not a ramp.
    // ORDER (2026-10-14): tbPlayerStrike calls damageMult (frenzyMult) BEFORE
    // onStrikeHit. frenzyMult only reads the count; onStrikeHit advances it
    // and spends the crit. Multipliers per consecutive hit: 1, 1, 2, 1, 1, 2…
    onStrikeHit: function (game, target) {
      try {
        if (!game.hasAbility || !game.hasAbility('blood_frenzy')) return;
        const st = fightState(game);
        if (!st) return;
        if ((st.frenzy || 0) >= 2) { st.frenzy = 0; return; } // this hit was the crit
        st.frenzy = (st.frenzy || 0) + 1;
        if (st.frenzy === 2) {
          game.say(`BLOOD FRENZY: two in a row — THIS ONE HURTS. (guaranteed crit)`);
          try { game.audioEvent('buildaround', { path: 'brawler', id: 'blood_frenzy' }); } catch (e) {}
        }
      } catch (e) {}
    },
    onStrikeMiss: function (game) {
      try {
        if (!game.hasAbility || !game.hasAbility('blood_frenzy')) return;
        const st = fightState(game);
        if (!st || !st.frenzy) return;
        st.frenzy = 0;
        game.say('Blood Frenzy breaks — the red comes down. (missed)');
      } catch (e) {}
    },
    frenzyMult: function (game) {
      try {
        if (!game.hasAbility || !game.hasAbility('blood_frenzy')) return 1;
        const st = fightState(game);
        // Two consecutive hits already landed: this strike is the crit.
        // Read-only — onStrikeHit (called after) resets the count.
        return ((st && st.frenzy) || 0) >= 2 ? 2.0 : 1;
      } catch (e) { return 1; }
    },

    // RETRIBUTION (shieldbearer): absorb → release battery. Stores 50% of
    // blocked damage; unleash as shockwave. Mechanical payoff for the tank.
    onBlocked: function (game, amount) {
      try {
        if (!game.hasAbility || !game.hasAbility('retribution')) return;
        const st = dayState(game);
        st.retribution = (st.retribution || 0) + Math.round(amount);
        if (st.retribution >= 20 && !st.retributionTold) {
          st.retributionTold = true;
          game.say(`RETRIBUTION: ${st.retribution} stored. Unleash it. (active ability)`);
          try { game.audioEvent('buildaround', { path: 'shieldbearer', id: 'retribution' }); } catch (e2) {}
        }
      } catch (e) {}
    },
    unleash: function (game) {
      try {
        const st = dayState(game);
        const stored = st.retribution || 0;
        if (stored < 10) {
          game.say('Retribution: nothing stored yet — block damage first, then serve it back.');
          return 0;
        }
        st.retribution = 0;
        st.retributionTold = false;
        // The pain has to go somewhere. You keep 25% of what you give.
        const selfHit = Math.round(stored * 0.25);
        try {
          const p = game.tbFighter('p');
          if (p && p.alive && selfHit > 0) {
            p.hp = Math.max(1, p.hp - selfHit);
            game.say(`RETRIBUTION: ${stored} erupts outward — and ${selfHit} stays with you. Pain has to go somewhere.`);
          } else {
            game.say(`RETRIBUTION: ${stored} erupts outward!`);
          }
        } catch (e2) {
          game.say(`RETRIBUTION: ${stored} erupts outward!`);
        }
        try { game.audioEvent('buildaround', { path: 'shieldbearer', id: 'retribution' }); } catch (e) {}
        return stored;
      } catch (e) { return 0; }
    },

    // TROPHY ROOM (hunter): mark a slain type, +50% vs marked.
    mark: function (game, monsterType) {
      try {
        const st = dayState(game);
        st.trophyMark = monsterType;
        let shown = monsterType;
        try { if (game.monsterDisplayName) shown = game.monsterDisplayName(monsterType) || monsterType; } catch (e) { console.warn('[buildarounds] mark name:', e && e.message); }
        const percent = baPathCount(game, 'hunter') >= 2 ? 50 : 25;
        game.say(`Trophy Room: ${shown} marked. +${percent}% damage against this type today.`);
        try { game.audioEvent('buildaround', { path: 'hunter', id: 'trophy_room' }); } catch (e) {}
      } catch (e) {}
    },
    trophyMult: function (game, target) {
      try {
        if (!game.hasAbility || !game.hasAbility('trophy_room')) return 1;
        const st = dayState(game);
        if (!st.trophyMark || !target) return 1;
        // Fighters carry monsterId (the mark is a monster id); the display
        // name is a village name/descriptor that never contains the id.
        const tId = target.monsterId || (target.mdef && target.mdef.id);
        const tType = (target.monsterType || target.name || '').toLowerCase();
        if (tId ? tId === st.trophyMark : tType.includes(st.trophyMark.toLowerCase())) {
          const bonus = baPathCount(game, 'hunter') >= 2 ? 0.5 : 0.25;
          return 1 + bonus;
        }
        return 1;
      } catch (e) { return 1; }
    },

    // FEAST ENGINE (survivalist): overheal → damage.
    onHeal: function (game, targetId, amount, overheal) {
      try {
        // Battlefield Grace (caregiver)
        if (game.hasAbility && game.hasAbility('battlefield_grace')) {
          const st = fightState(game);
          if (st) {
            st.graceHeals = st.graceHeals || {};
            st.graceHeals[targetId] = (st.graceHeals[targetId] || 0) + 1;
            // abilities.json: 3 heals trigger it; deepening L2: 2 heals.
            let lvl = 1;
            try { lvl = game.abilityLevel ? game.abilityLevel('battlefield_grace') : 1; } catch (e) { console.warn('[buildarounds] grace level:', e && e.message); }
            const need = lvl >= 2 ? 2 : 3;
            if (st.graceHeals[targetId] === need) {
              game.say('BATTLEFIELD GRACE: ' + (need === 2 ? 'two' : 'three') + ' touches — they\'re back on their feet with a free action! (You\'re winded — no action next turn.)');
              try { game.audioEvent('buildaround', { path: 'caregiver', id: 'battlefield_grace' }); } catch (e) {}
              // KNOWN GAP (audit 2026-10-14, needs Steve): game.grantFreeAction
              // does not exist and nothing reads p.winded, so neither the free
              // action nor the winded cost happens yet. addHealth also only
              // ever reports targetId 'player' (self-heals), not allies.
              try { game.grantFreeAction(targetId); } catch (e) {}
              // Cost: the healer gives everything. Winded next turn.
              try {
                const p = game.tbFighter('p');
                if (p) p.winded = 1;
              } catch (e2) {}
            }
          }
        }

      } catch (e) {}
    },
    // FEAST ENGINE (survivalist): full HP → +25% damage. Simple, triggers.
    feastMult: function (game) {
      try {
        if (!game.hasAbility || !game.hasAbility('feast_engine')) return 1;
        const s = game.state.scholar;
        const p = game.inCombat() ? game.tbFighter('p') : null;
        const hp = (p && p.alive) ? (p.hp || 0) : (s.health || 0);
        const maxHp = (p && p.alive) ? (p.maxHp || 100) : game.maxHealth();
        if (hp >= maxHp) return 1.25;
        return 1;
      } catch (e) { return 1; }
    },

    // NOWHERE MAN (drifter): move unhit → dodge.
    onMove: function (game, tiles) {
      try {
        if (!game.hasAbility || !game.hasAbility('nowhere_man')) return;
        const st = fightState(game);
        if (!st) return;
        st.nowhereStreak = (st.nowhereStreak || 0) + tiles;
      } catch (e) {}
    },
    onDamaged: function (game) {
      try {
        if (!game.hasAbility || !game.hasAbility('nowhere_man')) return;
        const st = fightState(game);
        if (st) st.nowhereStreak = 0;
      } catch (e) {}
    },
    dodgeBonus: function (game) {
      // GOD-PATH (2026-10-14): Prophecy (seer payoff) dodge while Foresight runs.
      let gp = 0;
      try { const GP = (global.Scattering || {}).Godpath; if (GP && GP.dodgeBonus) gp = GP.dodgeBonus(game) || 0; }
      catch (e) { console.warn('[buildarounds] godpath dodge', e); }
      return gp + BA.nowhereDodge(game);
    },
    nowhereDodge: function (game) {
      try {
        if (!game.hasAbility || !game.hasAbility('nowhere_man')) return 0;
        const st = fightState(game);
        const streak = (st && st.nowhereStreak) || 0;
        const cap = baPathCount(game, 'drifter') >= 2 ? 0.40 : 0.20;
        return Math.min(streak * 0.05, cap);
      } catch (e) { return 0; }
    },

    // CARTOGRAPHER'S EYE (explorer): terrain knowledge → dodge. You know
    // where the ground is uneven, where the cover is. They don't.
    cartographerDodge: function (game) {
      try {
        if (!game.hasAbility || !game.hasAbility('cartographers_eye')) return 0;
        // Revealed tiles of the current region's map (tile.revealed, set by
        // game.reveal). There was never a game.revealedTileCount.
        let revealed = 0;
        const rows = (game.map && game.map.tiles) || [];
        for (const row of rows) for (const tile of (row || [])) if (tile && tile.revealed) revealed++;
        return Math.min(Math.floor(revealed / 10) * 0.01, 0.15);
      } catch (e) { return 0; }
    },

    // CROWD FAVORITE (socialite): fans → social multiplier.
    socialMult: function (game) {
      try {
        if (!game.hasAbility || !game.hasAbility('crowd_favorite')) return 1;
        let fans = 0;
        try { fans = (game.state.scholar.fans || 0); } catch (e) {}
        const div = baPathCount(game, 'socialite') >= 2 ? 10 : 20;
        return 1 + fans / div;
      } catch (e) { return 1; }
    },

    // HOARDER'S INTEREST (miser): pantry generates interest.
    onDayTick: function (game) {
        // Rest breaks a gathering chain for every person, not just the bearer.
        BA.onForage(game, false);
        for (const id of Object.keys((game.state.village || {}).cornucopia || {})) BA.onForage(game, false, id);
      // Trophy Room mark resets daily — under its own guard, not only for
      // Hoarder's Interest holders.
      try {
        const bs = game.state.scholar.buildaround;
        if (bs && game.hasAbility && game.hasAbility('trophy_room')) bs.trophyMark = null;
      } catch (e) { console.warn('[buildarounds] trophy reset:', e && e.message); }
      try {
          const v = game.state.village, me = game.villagerId;
          if (!v) return;
          const holders = new Set();
          if (game.hasAbility && game.hasAbility('hoarders_interest')) holders.add(me || 'player');
          for (const id of (v.roster || [])) {
            if (id === me || !game.npcHasAbility || !game.npcHasAbility(id, 'hoarders_interest')) continue;
            const person = game.vpOf(id);
            if (person && !person.dead) holders.add(id);
          }
          if (!holders.size) return;
          const day = game.state.scholar.day;
          // Canonical-person receipts persist through save/load and succession.
          // Shared opening stock avoids interest-on-interest within one dawn.
          let ledger = v.hoarderInterest;
          if (!ledger || ledger.day !== day) ledger = v.hoarderInterest = { day, opening: game.pantryKcal(), paid: {} };
          if (ledger.opening < 1000) return;
          for (const who of Array.from(holders).sort()) {
            if (Object.prototype.hasOwnProperty.call(ledger.paid, who)) continue;
            const rate = baPathCount(game, 'miser', who === 'player' ? null : who) >= 2 ? 0.05 : 0.025;
            const requested = Math.round(ledger.opening * rate);
            const room = game.pantryCapKcal ? Math.max(0, Math.floor(game.pantryCapKcal() - game.pantryKcal())) : Infinity;
            const interest = Math.min(requested, room);
            ledger.paid[who] = { rate, requested, kcal: interest };
            if (interest <= 0) {
              if (who === me || who === 'player') game.say(`HOARDER'S INTEREST: the bins are full — nowhere to put the interest.`);
              continue;
            }
            game.stockPantry(interest, "Hoarder's interest");
            if (who === me || who === 'player') game.say(`HOARDER'S INTEREST: your stores earned ${interest} kcal overnight. Patience pays.`);
            else game.say(`${game.displayName(who)} watches the bins. The stores have grown by ${interest} kcal overnight.`);
          }
        } catch (e) { console.warn('[buildarounds] interest:', e && e.message); }
    },

    // CORNUCOPIA (forager): forage streaks → yield.
    onForage: function (game, success, who) {
      try {
        const id = forageWho(game, who), old = forageCount(game, who);
        const gathered = success && forageHeld(game, who);
        if (!gathered && !old) return;
        const v = game.state.village;
        v.cornucopia = v.cornucopia || {};
        const st = v.cornucopia[id] || (v.cornucopia[id] = { streak: old, sequence: 0 });
        st.streak = gathered ? Math.min(old + 1, 10) : 0;
        if (gathered) st.sequence++;
        if (gathered && st.streak >= 3 && st.streak !== old && id === game.villagerId) {
          game.say(`CORNUCOPIA: ${st.streak} in a row — +${st.streak * 15}% yield. The land rewards devotion.`);
          game.audioEvent('buildaround', { path: 'forager', id: 'cornucopia' });
        }
      } catch (e) { console.warn('[buildarounds] forage streak:', e && e.message); }
    },
    forageMult: function (game, who) {
      try {
        return forageHeld(game, who) ? 1 + forageCount(game, who) * 0.15 : 1;
      } catch (e) { console.warn('[buildarounds] forage multiplier:', e && e.message); return 1; }
    },

    // GEAR REWRITES (2026-10-14): item hooks are checked at their ability's
    // execution point (spear pin in the dead_aim crit path, knife blind in
    // pocket_sand, machete bleed in shove). No central trigger dispatcher —
    // each rewrite lives where its verb lives.

    // Combined damage multiplier (called from strike path).
    damageMult: function (game, target) {
      try {
        let m = 1;
        m *= BA.frenzyMult(game);
        m *= BA.trophyMult(game, target);
        m *= BA.feastMult(game);
        m *= BA.crimsonGodMult(game);
        // GOD-PATH subclass payoffs (misdirection) live in godpath.js.
        try { const GP = (global.Scattering || {}).Godpath; if (GP && GP.damageMult) m *= GP.damageMult(game, target); }
        catch (e) { console.warn('[buildarounds] godpath damageMult', e); }
        return m;
      } catch (e) { return 1; }
    },

    // RED HARVEST: crits heal 50% of damage dealt
    redHarvestHeal: function (game, damage) { // wired-exempt: pending god-path design (docs/godpath/PLAN.md)
      try {
        if (!game.hasAbility || !game.hasAbility('red_harvest')) return 0;
        return Math.round(damage * 0.5);
      } catch (e) { return 0; }
    },
    // CRIMSON GOD: every hit is a crit (2x)
    crimsonGodMult: function (game) { // wired-exempt: pending god-path design (docs/godpath/PLAN.md)
      try {
        if (!game.hasAbility || !game.hasAbility('crimson_god')) return 1;
        return 2.0;
      } catch (e) { return 1; }
    },

    // GOD ABILITY PARTY EFFECTS (Steve 2026-10-14)
    // God abilities scale: solo → party → titan → army → contest
    
    // CRIMSON GOD: allies inspired (+25% damage when you crit)
    crimsonGodParty: function (game) { // wired-exempt: pending god-path design (docs/godpath/PLAN.md)
      try {
        if (!game.hasAbility || !game.hasAbility('crimson_god')) return 1;
        return 1.25; // allies deal +25%
      } catch (e) { return 1; }
    },
    
    // DEADEYE: marked targets take +50% from allies
    deadeyeMark: function (game, targetId) { // wired-exempt: pending god-path design (docs/godpath/PLAN.md)
      try {
        if (!game.hasAbility || !game.hasAbility('deadeye')) return;
        const st = fightState(game);
        if (st) {
          st.deadeyeMarks = st.deadeyeMarks || {};
          st.deadeyeMarks[targetId] = true;
          game.say('DEADEYE: marked. The party sees the weak point.');
        }
      } catch (e) {}
    },
    
    deadeyeAllyMult: function (game, targetId) { // wired-exempt: pending god-path design (docs/godpath/PLAN.md)
      try {
        if (!game.hasAbility || !game.hasAbility('deadeye')) return 1;
        const st = fightState(game);
        if (st && st.deadeyeMarks && st.deadeyeMarks[targetId]) {
          return 1.5; // allies deal +50% vs marked
        }
        return 1;
      } catch (e) { return 1; }
    },
    
    // LIFEBRINGER: revive allies (once per fight per target)
    lifebringerRevive: function (game, targetId) { // wired-exempt: pending god-path design (docs/godpath/PLAN.md)
      try {
        if (!game.hasAbility || !game.hasAbility('lifebringer')) return false;
        const st = fightState(game);
        if (!st) return false;
        st.lifebringerUsed = st.lifebringerUsed || {};
        if (st.lifebringerUsed[targetId]) return false; // once per fight
        
        const t = game.tbFighter(targetId);
        if (t && !t.alive) {
          t.alive = true;
          t.hp = Math.round((t.maxHp || 50) * 0.5);
          st.lifebringerUsed[targetId] = true;
          game.say('LIFEBRINGER: ' + (t.name || 'ally') + ' gasps back to life!');
          return true;
        }
        return false;
      } catch (e) { return false; }
    },
  };

  // Export
  global.Scattering = global.Scattering || {};
  global.Scattering.buildarounds = BA;

  // NPC actions may return through many needs/redirect branches. Only an
  // actual gather advances sequence; walking keeps focus, other work breaks it.
  const Game = global.Scattering.Game;
  if (Game) {
    for (const name of ['npcTakeAction', 'resolveOneAssignment']) {
      const act = Game[name];
      if (typeof act !== 'function') continue;
      Game[name] = function (who, ...args) {
        const serial = (forageEntry(this, who) || {}).sequence || 0;
        const before = ((this.state.village || {}).positions || {})[who];
        const x = before && before.mx, y = before && before.my;
        try { return act.call(this, who, ...args); }
        finally {
          const after = ((this.state.village || {}).positions || {})[who];
          const walked = name === 'npcTakeAction' && before && after && (after.mx !== x || after.my !== y);
          if (!walked && ((forageEntry(this, who) || {}).sequence || 0) === serial) BA.onForage(this, false, who);
        }
      };
    }
    const startCombat = Game.startCombat;
    Game.startCombat = function (...args) { BA.onForage(this, false); return startCombat.apply(this, args); };
    const tbBeginTurn = Game.tbBeginTurn;
    Game.tbBeginTurn = function (...args) {
      if (this.tbfight && !this.tbfight.over) {
        BA.onForage(this, false);
        for (const fighter of this.tbfight.fighters || []) if (fighter.villagerId) BA.onForage(this, false, fighter.villagerId);
      }
      return tbBeginTurn.apply(this, args);
    };
    const playerDeath = Game.playerDeath;
    Game.playerDeath = function (...args) {
      const prior = this.villagerId, legacy = (this.state.scholar.buildaround || {}).cornucopia;
      BA.onForage(this, false);
      try { return playerDeath.apply(this, args); }
      finally {
        // Old unscoped player counters must not become a successor's history.
        if (legacy && this.villagerId !== prior && this.state.scholar.buildaround) this.state.scholar.buildaround.cornucopia = 0;
      }
    };
  }

})(typeof globalThis !== 'undefined' ? globalThis : this);
