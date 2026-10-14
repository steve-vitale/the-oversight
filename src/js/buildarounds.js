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
(function (global) {
  'use strict';

  // Count held abilities on a path (for assembly gating).
  function baPathCount(game, path) {
    try {
      // An evolved ability counts as its root (evolvedFrom keeps the lineage).
      const held = (game.state.scholar.abilities || []).map(a => (a && (a.evolvedFrom || a.id)) || a);
      const data = game.data.abilities || [];
      return held.filter(id => {
        const def = data.find(d => d.id === id);
        return def && (def.paths || []).includes(path);
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
        game.say(`TROPHY ROOM: ${shown} marked. +50% damage against them today. The wall of heads grows.`);
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
            if (st.graceHeals[targetId] === 2) {
              game.say('BATTLEFIELD GRACE: two touches — they\'re back on their feet with a free action! (You\'re winded — no action next turn.)');
              try { game.audioEvent('buildaround', { path: 'caregiver', id: 'battlefield_grace' }); } catch (e) {}
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
      // Trophy Room mark resets daily — under its own guard, not only for
      // Hoarder's Interest holders.
      try {
        const bs = game.state.scholar.buildaround;
        if (bs && game.hasAbility && game.hasAbility('trophy_room')) bs.trophyMark = null;
      } catch (e) { console.warn('[buildarounds] trophy reset:', e && e.message); }
      try {
        if (!game.hasAbility || !game.hasAbility('hoarders_interest')) return;
        let pantry = 0;
        try { pantry = game.pantryKcal ? game.pantryKcal() : 0; } catch (e) {}
        if (pantry < 1000) return;
        const rate = baPathCount(game, 'miser') >= 2 ? 0.05 : 0.025;
        // Real food into the real pantry (stockPantry), within the pantry cap.
        const room = game.pantryCapKcal ? Math.max(0, game.pantryCapKcal() - pantry) : Infinity;
        const interest = Math.min(Math.round(pantry * rate), room);
        if (interest <= 0) {
          game.say(`HOARDER'S INTEREST: the bins are full — nowhere to put the interest.`);
          return;
        }
        game.stockPantry(interest, "Hoarder's interest");
        game.say(`HOARDER'S INTEREST: your stores earned ${interest} kcal overnight. Patience pays.`);
      } catch (e) {}
    },

    // CORNUCOPIA (forager): forage streaks → yield.
    onForage: function (game, success) {
      try {
        if (!game.hasAbility || !game.hasAbility('cornucopia')) return;
        const st = dayState(game);
        if (success) {
          st.cornucopia = Math.min((st.cornucopia || 0) + 1, 10);
          if (st.cornucopia >= 3) {
            game.say(`CORNUCOPIA: ${st.cornucopia} in a row — +${st.cornucopia * 15}% yield. The land rewards devotion.`);
            try { game.audioEvent('buildaround', { path: 'forager', id: 'cornucopia' }); } catch (e) {}
          }
        } else {
          st.cornucopia = 0;
        }
      } catch (e) {}
    },
    forageMult: function (game) {
      try {
        if (!game.hasAbility || !game.hasAbility('cornucopia')) return 1;
        const st = dayState(game);
        return 1 + ((st && st.cornucopia) || 0) * 0.15;
      } catch (e) { return 1; }
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
        return m;
      } catch (e) { return 1; }
    },

    // RED HARVEST: crits heal 50% of damage dealt
    redHarvestHeal: function (game, damage) {
      try {
        if (!game.hasAbility || !game.hasAbility('red_harvest')) return 0;
        return Math.round(damage * 0.5);
      } catch (e) { return 0; }
    },
    // CRIMSON GOD: every hit is a crit (2x)
    crimsonGodMult: function (game) {
      try {
        if (!game.hasAbility || !game.hasAbility('crimson_god')) return 1;
        return 2.0;
      } catch (e) { return 1; }
    },

    // GOD ABILITY PARTY EFFECTS (Steve 2026-10-14)
    // God abilities scale: solo → party → titan → army → contest
    
    // CRIMSON GOD: allies inspired (+25% damage when you crit)
    crimsonGodParty: function (game) {
      try {
        if (!game.hasAbility || !game.hasAbility('crimson_god')) return 1;
        return 1.25; // allies deal +25%
      } catch (e) { return 1; }
    },
    
    // DEADEYE: marked targets take +50% from allies
    deadeyeMark: function (game, targetId) {
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
    
    deadeyeAllyMult: function (game, targetId) {
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
    lifebringerRevive: function (game, targetId) {
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
    
    // GOD PATH RECOGNITION (Steve 2026-10-14)
    // The System watches how you LIVE, not what you own.
    // Abilities exist for their own sake. Gear exists for its own sake.
    // Sentimental gear exists for its story — NOT for points.
    // Godhood EMERGES from consistently embodying a path. The System recognizes.
    
    pathBehavior: function (game, path) {
      try {
        const s = game.state.scholar;
        s.pathLife = s.pathLife || {};
        s.pathLife[path] = s.pathLife[path] || { uses: 0, recognized: false, hints: 0 };
        return s.pathLife[path];
      } catch (e) { return { uses: 0, recognized: false, hints: 0 }; }
    },
    
    onPathLived: function (game, path) {
      try {
        const beh = this.pathBehavior(game, path);
        if (beh.recognized) return;
        beh.uses++;
        const paths = game.data.godpaths ? game.data.godpaths.paths : {};
        const pdef = paths[path];
        if (!pdef) return;
        if (beh.uses === 10 && beh.hints === 0) {
          beh.hints = 1;
          game.say('SYSTEM: "You ' + this.pathVerb(path) + '. Interesting. We are watching."');
        } else if (beh.uses === 25 && beh.hints === 1) {
          beh.hints = 2;
          game.say('SYSTEM: "You remind us of the ' + pdef.name + 's from before. The ones who ascended."');
        } else if (beh.uses >= 50 && !beh.recognized) {
          beh.recognized = true;
          game.say(pdef.name.toUpperCase() + ' ASCENSION!');
          game.say('SYSTEM: "You don\'t use the ' + pdef.name + ' path. You ARE the ' + pdef.name + ' path."');
          game.say('Unlocked: ' + pdef.godAbility + ' — ' + pdef.godDescription);
          const scholar = game.state.scholar;
          if (scholar.abilities.indexOf(pdef.godAbility) === -1) {
            scholar.abilities.push(pdef.godAbility);
          }
          try { game.audioEvent('ascension', { path: path }); } catch (e) {}
        }
      } catch (e) {}
    },
    
    pathVerb: function (path) {
      const verbs = {
        brawler: 'fight like a storm', shieldbearer: 'stand between harm and others',
        hunter: 'hunt with patience', caregiver: 'heal without hesitation',
        drifter: 'move like smoke', explorer: 'seek what is hidden',
        socialite: 'command the crowd', survivalist: 'endure the unendurable',
        miser: 'hoard with purpose', forager: 'find what feeds'
      };
      return verbs[path] || 'walk the path';
    },
    
  // FUSION SYSTEM (Steve 2026-10-14): abilities combine into god abilities.
  // Luck: finding the components. Cleverness: knowing what to fuse.
  
  availableFusions: function (game) {
    try {
      const fusions = game.data.fusions ? game.data.fusions.fusions : [];
      const has = (id) => game.hasAbility && game.hasAbility(id);
      return fusions.filter(f => {
        if (has(f.id)) return false;
        return f.components.every(c => has(c));
      });
    } catch (e) { return []; }
  },
  
  fuse: function (game, fusionId) {
    try {
      const fusions = game.data.fusions ? game.data.fusions.fusions : [];
      const f = fusions.find(x => x.id === fusionId);
      if (!f) return false;
      const has = (id) => game.hasAbility && game.hasAbility(id);
      if (!f.components.every(c => has(c))) {
        game.say(`Fusion failed: missing components for ${f.name}.`);
        return false;
      }
      if (has(f.id)) return false;
      const scholar = game.state.scholar;
      scholar.abilities = scholar.abilities.filter(a => !f.components.includes(a));
      scholar.abilities.push(f.id);
      game.say(`${f.name.toUpperCase()}! ${f.flavor}`);
      try { game.audioEvent('fusion', { id: f.id, tier: f.tier }); } catch (e) {}
      return true;
    } catch (e) { return false; }
  },
  };

  // Export
  global.Scattering = global.Scattering || {};
  global.Scattering.buildarounds = BA;

})(typeof globalThis !== 'undefined' ? globalThis : this);
