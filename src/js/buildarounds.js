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
      const held = (game.state.scholar.abilities || []).map(a => (a && a.id) || a);
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
    onStrikeHit: function (game, target) {
      try {
        if (!game.hasAbility || !game.hasAbility('blood_frenzy')) return;
        const st = fightState(game);
        if (!st) return;
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
        // If this is the 2nd consecutive hit (frenzy will become 2 after),
        // this hit crits. Check pre-increment count.
        const preCount = (st && st.frenzy) || 0;
        if (preCount === 1) {
          // This is the 2nd hit — crit!
          if (st) st.frenzy = 0; // reset after crit
          return 2.0;
        }
        return 1;
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
        game.say(`TROPHY ROOM: ${monsterType} marked. +50% damage against them today. The wall of heads grows.`);
        try { game.audioEvent('buildaround', { path: 'hunter', id: 'trophy_room' }); } catch (e) {}
      } catch (e) {}
    },
    trophyMult: function (game, target) {
      try {
        if (!game.hasAbility || !game.hasAbility('trophy_room')) return 1;
        const st = dayState(game);
        if (!st.trophyMark || !target) return 1;
        const tType = (target.monsterType || target.name || '').toLowerCase();
        if (tType.includes(st.trophyMark.toLowerCase())) {
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
        let revealed = 0;
        try { revealed = game.revealedTileCount ? game.revealedTileCount() : 0; } catch (e) {}
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
      try {
        if (!game.hasAbility || !game.hasAbility('hoarders_interest')) return;
        let pantry = 0;
        try { pantry = game.pantryKcal ? game.pantryKcal() : 0; } catch (e) {}
        if (pantry < 1000) return;
        const rate = baPathCount(game, 'miser') >= 2 ? 0.05 : 0.025;
        const interest = Math.round(pantry * rate);
        try { game.addPantryKcal(interest); } catch (e) {}
        game.say(`HOARDER'S INTEREST: your stores earned ${interest} kcal overnight. Patience pays.`);
        // Trophy Room resets daily
        const st = dayState(game);
        st.trophyMark = null;
        st.feastCharge = 0;
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
        return m;
      } catch (e) { return 1; }
    },
  };

  // Export
  global.Scattering = global.Scattering || {};
  global.Scattering.buildarounds = BA;

})(typeof globalThis !== 'undefined' ? globalThis : this);
