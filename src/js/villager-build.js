// @ontology
// system: villager-build
// description: PARITY (Steve 2026-10-14: "Villagers and players should get the same XP, when in doubt we treat them the same way. You should get to swap on level up or keep existing. ... villagers need to act in smart ways, including towards getting good gear and builds. They want to win as well." / "Villagers can't just take the next ability, they need to seek knowledge about the abilities and go for a build that suits their technology."). THE build brain for the player's bots and every villager: buildScore scores an ability for whoever would hold it (what they hold, synergies, build-around paths, their technology = gear, tools, skills and job lean, their target build, what they know). Villagers keep ability KNOWLEDGE (0-3, the player's codex levels), seek it from people who hold or know abilities, keep a target build, choose on the same 1-of-3 level-up sheet the player gets (swap or keep, same rule), and gear up from their own things, gifts and the village armory with a daily greedy allocation.
// provides:
//   - buildScore(who, abilityId, opts) -> number; who = 'player' or a villager id (THE one scoring function)
//   - buildPathLean(who, abilityId) -> 0; the god-path redesign adds path/subclass lean HERE (single hook)
//   - buildTechnology(who) -> {melee, ranged, armor, tools, skillTracks, lean} — what their hands and kit can use
//   - abilityKnowledge(who, abilityId) -> 0-3 (held = 3; player = codex level; villager = v.npcKnow)
//   - npcLearnAbility(vid, abilityId, level, source) -> true if knowledge rose
//   - villagerTargetBuild(vid) -> up to 6 ability ids they are building toward (from what they know)
//   - buildDecide(who, offerIds, opts) -> {pick, replace} | {keep: true}; the swap-or-keep rule for both
//   - villagerLevelUpOffers(vid, track, level) -> the player's sheet for them: 3 of the next 6 unheld kit abilities (godpath.js kitSheet, the same function)
//   - villagerResolveLevelUps(vid) -> resolves queued sheets: pick by buildScore, swap or keep; defers to seek knowledge when they know too little
//   - villagerWantsKnowledge(vid) -> 'sheet' | 'build' | null
//   - villagerSeekKnowledge(vid) -> {teacher, abilityId, level} | null (the agency action)
//   - npcLearnFromTalk(learnerVid, teacherId) -> abilityId | null (a held conversation teaches)
//   - npcWitnessAbility(abilityId, witnessIds, userId) -> count of witnesses who learned
//   - villagerNeedTrack(vid) -> the track whose level-up would bring their next target ability
//   - villagerGearFit(vid, itemId) -> multiplier for how well an item fits their build
//   - villagerGearDay() -> greedy daily gear allocation (own stash, gifts of spares, armory)
//   - villagerBuildDay() -> the daily tick: gear, pending sheets
//   - pickVillagerKnack(vid, choices) -> knack id chosen by buildScore
//   - mantleBecome(oldId, newId) -> the new bearer keeps THEIR OWN tracks, XP, abilities, skills, knowledge, godhood and gear; the predecessor's do not pass (Steve 2026-10-14: "No I don't think you should take your XP or the abilities. You become that villager.")
// rules:
//   - one_brain: the player's bot picks (capable policy) and every villager use buildScore/buildDecide (code: buildScore, buildDecide)
//   - path_lean_hook: god-path/subclass lean is added ONLY in buildPathLean (code: buildPathLean)
//   - knowledge_gates_planning: an ability nobody told them about scores 0; the sheet shows its offers (L2), held = L3 (code: abilityKnowledge, buildScore)
//   - seek_not_drift: a villager whose build knowledge is too thin defers a sheet (max 3 days) and seeks knowledge instead (code: villagerResolveLevelUps, villagerSeekKnowledge)
//   - swap_or_keep_same_rule: full slots -> the best offer replaces the weakest held only if it beats it by more than 1, else keep (code: buildDecide)
//   - you_become_that_villager: on the mantle, scholar.abilities/tracks/levelUpQueue/deedDay/godhood/inventory/equipped/languages are REPLACED by the successor's own villager records (npcAbilities, npcXp + pending sheets, npcDeedDay, npcGodhood, person.items/equipped/stashed, person.languages + occupation polyglot); integration, slots, Codex knowledge, ledger, trust and village state stay with the office (code: mantleBecome, ledger.js playerDeath)
//   - gear_greedy_no_hoard: equipped gear is never taken; spares go to whoever gains most; armory weapons go to the biggest gain first, one per villager per day, the old weapon goes back (code: villagerGearDay)
// consumes:
//   - Game.data.abilities, Game.data.synergies, Game.data.tracks, Game.data.items
//   - state.village.npcAbilities, npcSkills, npcXp, npcKnow, npcBuild, rosterChars (person.items/equipped/stashed)
//   - state.scholar.abilities, state.codex.abilities, stashState().weapons
//   - Scattering.equipment (autoEquip, weaponBonusOf, armorOf, slotForItem, isRangedWeapon)
(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  let _warned = {};
  function warn(msg, e) {
    // Reported, never swallowed (AGENTS.md rule 6); once per message.
    const k = String(msg);
    if (_warned[k]) return;
    _warned[k] = true;
    console.warn('[villager-build] ' + msg + (e ? ': ' + (e && e.message || e) : ''));
  }
  const EQ = () => (globalThis.Scattering || {}).equipment || null;

  // Ability features, computed once per data set (cheap: every villager scores daily).
  let _feat = null, _featSrc = null;
  const RANGED_RE = /\branged\b|throw|hurl|dive-bomb|point at the sky/i;
  function features(G) {
    const abil = (G.data && G.data.abilities) || [];
    if (_feat && _featSrc === abil) return _feat;
    _feat = {}; _featSrc = abil;
    const T = (G.trackData ? G.trackData() : (G.data.tracks || {})) || {};
    const trackOf = {};
    for (const t of (T.tracks || [])) for (const id of ((T.kits || {})[t] || [])) trackOf[id] = t;
    const partners = {};
    for (const syn of ((G.data && G.data.synergies) || [])) {
      const legs = ((syn && syn.requires) || []).map(l => String(l).split(':').pop());
      for (const l of legs) (partners[l] = partners[l] || []).push(legs.filter(x => x !== l));
    }
    for (const a of abil) {
      if (!a || !a.id) continue;
      const mods = (a.modifiers || []).map(m => String(m.target || ''));
      const ctx = (a.actions || []).map(x => x.context || 'explore');
      const text = (a.description || '') + ' ' + (a.flavor || '');
      _feat[a.id] = {
        track: trackOf[a.id] || null,
        lane: a.lane || 'magic',
        // build-around assembly only (buildarounds.js payoffs): the general
        // god-path lean is buildPathLean. Every magic ability carries a path
        // since the god-path redesign; counting them all here would double it.
        paths: (a.unlock && a.unlock.buildaround) ? [a.path, a.alsoPath].filter(Boolean) : [],
        partners: partners[a.id] || [],
        role: a.role, slotRole: a.slotRole,
        combat: ctx.includes('combat') || mods.some(m => /^(combat|armor|health)\./.test(m)),
        combatAction: (a.actions || []).some(x => x.context === 'combat' && !x.automatic),
        ranged: RANGED_RE.test(text),
        field: mods.some(m => /^(forage|hunt|monster|stealth|water|travel|carry|ruin|luck)\./.test(m)) || ctx.includes('field') || ctx.includes('explore'),
        social: mods.some(m => /^(trust|social)\./.test(m)) || ctx.includes('social'),
        craft: mods.some(m => /^(food|fire|healing)\./.test(m)) || ctx.includes('camp'),
      };
    }
    return _feat;
  }
  const isPlayerWho = (G, who) => who === 'player' || (G.villagerId && who === G.villagerId);

  const methods = {

    // ---------- who holds what ----------
    _buildHeld(who) {
      const v = this.state.village || {};
      if (isPlayerWho(this, who)) return ((this.state.scholar || {}).abilities || []).map(e => (e && (e.evolvedFrom || e.id)) || e).filter(Boolean);
      return ((v.npcAbilities || {})[who] || []).slice();
    },
    _buildOwned(who) {
      if (isPlayerWho(this, who)) return this.ownedAbilityIds ? this.ownedAbilityIds() : this._buildHeld(who);
      return this.npcOwnedIds ? this.npcOwnedIds(who) : this._buildHeld(who);
    },
    _buildSlots(who) {
      if (isPlayerWho(this, who)) { try { return this.abilitySlots(); } catch (e) { warn('abilitySlots', e); return 6; } }
      const T = this.trackData ? this.trackData() : {};
      return T.maxAbilities || 6;
    },

    // buildTechnology(who): their "technology" (Steve: "a build that suits
    // their technology") = the gear they wear and carry, their tools, the
    // know-how they have (skills, by track) and the job they came from.
    buildTechnology(who) {
      const out = { melee: 0, ranged: 0, armor: 0, tools: 0, skillTracks: {}, lean: {} };
      try {
        const eq = EQ();
        const defs = this.data.items || [];
        const player = isPlayerWho(this, who);
        const s = this.state.scholar || {};
        const person = player ? { equipped: s.equipped || {}, items: (s.inventory || []) } : (this.getPerson ? this.getPerson(who) : null);
        if (person && eq) {
          out.melee = eq.weaponBonusOf(person, defs, 'melee') || 0;
          out.ranged = eq.weaponBonusOf(person, defs, 'ranged') || 0;
          // a bow in the pack is still their technology (they can wield it)
          for (const it of (person.items || [])) {
            const d = defs.find(x => x.id === ((it && (it.itemId || it.id)) || it));
            if (!d) continue;
            if (d.weapon && eq.isRangedWeapon(d)) out.ranged = Math.max(out.ranged, d.weapon.bonus || 1);
            if (d.tool) out.tools++;
          }
          out.armor = eq.armorOf(person, defs) || 0;
        }
        // know-how by track: a skill-lane ability they own counts for the
        // track whose skills list teaches it.
        const T = this.trackData ? this.trackData() : {};
        const owned = new Set(this._buildOwned(who));
        for (const t of (T.tracks || [])) {
          const n = ((T.skills || {})[t] || []).filter(id => owned.has(id)).length;
          if (n) out.skillTracks[t] = n;
        }
        let occ = null;
        try { const p = this.getPerson(player ? this.villagerId : who); occ = p && p.occupationId; } catch (e) { warn('tech person', e); }
        out.lean = this.occupationLean ? this.occupationLean(occ) : {};
      } catch (e) { warn('buildTechnology', e); }
      return out;
    },

    // abilityKnowledge(who, id): 0 never heard, 1 heard of, 2 seen what it
    // does, 3 understood (what it combines with). Held = 3. The player's is
    // the codex; a villager's is v.npcKnow.
    abilityKnowledge(who, id) {
      if (this._buildHeld(who).indexOf(id) >= 0) return 3;
      if (isPlayerWho(this, who)) return this.codexAbilityLevel ? this.codexAbilityLevel(id) : 0;
      return ((((this.state.village || {}).npcKnow) || {})[who] || {})[id] || 0;
    },
    npcLearnAbility(vid, id, level, source) {
      try {
        if (!vid || isPlayerWho(this, vid)) return false;
        const f = features(this)[id];
        if (!f || f.lane === 'skill') return false;
        const v = this.state.village; v.npcKnow = v.npcKnow || {};
        const k = v.npcKnow[vid] = v.npcKnow[vid] || {};
        if ((k[id] || 0) >= level) return false;
        k[id] = level;
        const b = (v.npcBuild || {})[vid];
        if (b) b.dirty = true; // the target build is re-planned on new knowledge
        return true;
      } catch (e) { warn('npcLearnAbility', e); return false; }
    },

    // buildPathLean(who, id): GOD-PATH HOOK. The path/subclass lean (which
    // god a build serves) lives HERE, and only here — every caller of
    // buildScore picks it up. godpath.js pathLean. Knowledge: buildScore has
    // already refused an ability they don't know (or that the sheet doesn't
    // show) before it reaches this hook, and the lean counts only what they
    // HOLD. Symmetric for the swap test: a held ability is scored as if it
    // were not held, so keeping and taking compare on the same footing.
    buildPathLean(who, id) {
      try {
        if (typeof this.pathLean !== 'function') return 0;
        const held = this._buildHeld(who).filter(h => h !== id);
        return this.pathLean(isPlayerWho(this, who) ? 'player' : who, id, { held }) || 0;
      } catch (e) { warn('buildPathLean', e); return 0; }
    },

    // buildScore(who, id, opts): THE build brain. Same function for the
    // player's bots and every villager. opts: {without: heldId} scores as if
    // that held ability were gone (the swap test), {noTarget: true} skips the
    // target-build term (used to plan the target), {know: n} overrides
    // knowledge, {onSheet: true} = the System's sheet shows it (knowledge >= 2).
    buildScore(who, id, opts) {
      opts = opts || {};
      try {
        const F = features(this);
        const f = F[id];
        if (!f) return 0;
        let know = opts.know != null ? opts.know : this.abilityKnowledge(who, id);
        if (opts.onSheet) know = Math.max(know, 2);
        if (know <= 0) return 0; // you can't plan around what nobody told you about
        const owned = this._buildOwned(who).filter(h => h !== opts.without && h !== id);
        const ownedSet = new Set(owned);
        let sc = 1;
        if (f.role === 'payoff') sc += 1; else if (f.role === 'enabler') sc += 0.5;
        if (f.combatAction) sc += 1; // "It should be a fight." Fights decide runs
        // same track: a build that keeps to its lane
        let sameTrack = 0;
        for (const h of owned) if (F[h] && F[h].track && F[h].track === f.track) sameTrack++;
        sc += Math.min(2, 0.5 * sameTrack);
        // build-around paths (buildarounds.js: weak alone, run-defining with 2+)
        for (const h of owned) { const hp = (F[h] && F[h].paths) || []; for (const p of f.paths) if (hp.indexOf(p) >= 0) sc += 1.5; }
        // synergies.json: a leg toward something they hold part of; completing
        // one is the big prize. Understanding (L3) sees the full value.
        let syn = 0;
        for (const others of f.partners) {
          const have = others.filter(o => ownedSet.has(o)).length;
          if (others.length && have === others.length) syn += 6; else syn += 2 * have;
        }
        sc += syn * (know >= 3 ? 1 : 0.5);
        // technology: what their gear, tools, know-how and past make usable
        const tech = opts.tech || this.buildTechnology(who);
        if (f.ranged && tech.ranged > 0) sc += 2;
        if (f.combat && (f.slotRole === 'nuke' || f.slotRole === 'opener' || f.slotRole === 'control') && tech.melee > 0) sc += 1;
        if (f.combat && f.slotRole === 'sustain' && tech.armor >= 10) sc += 1;
        if (f.field && tech.tools > 0) sc += 0.5 * Math.min(2, tech.tools);
        if (f.track && tech.skillTracks[f.track]) sc += Math.min(1.5, 0.5 * tech.skillTracks[f.track]);
        const first = ((this.trackData ? this.trackData() : {}).thresholds || [15])[0] || 15;
        if (f.track && tech.lean[f.track]) sc += 1.5 * Math.min(1, tech.lean[f.track] / first);
        // the target build: what they've decided to become
        if (!opts.noTarget && !isPlayerWho(this, who)) {
          const tgt = this.villagerTargetBuild(who);
          if (tgt.indexOf(id) >= 0) sc += 3;
        }
        sc += this.buildPathLean(who, id) || 0;
        const kf = know >= 3 ? 1.25 : know >= 2 ? 1 : 0.5; // understanding (L3) is worth planning around
        return +(sc * kf).toFixed(3);
      } catch (e) { warn('buildScore', e); return 0; }
    },

    // villagerTargetBuild(vid): up to 6 magic abilities they're building
    // toward, chosen from what they KNOW (L2+) and hold. Re-planned at most
    // once a day, or when knowledge changes.
    villagerTargetBuild(vid) {
      try {
        const v = this.state.village; v.npcBuild = v.npcBuild || {};
        const day = (this.state.scholar || {}).day || 0;
        const b = v.npcBuild[vid];
        if (b && b.day === day && !b.dirty) return b.target;
        const held = this._buildHeld(vid);
        const know = (v.npcKnow || {})[vid] || {};
        const F = features(this);
        const cands = new Set(held);
        for (const id of Object.keys(know)) if (know[id] >= 2 && F[id] && F[id].lane !== 'skill') cands.add(id);
        cands.delete('fusion_reactor');
        const tech = this.buildTechnology(vid);
        const scored = Array.from(cands).map(id => ({ id, sc: this.buildScore(vid, id, { noTarget: true, tech }) }));
        scored.sort((a, c) => c.sc - a.sc || (a.id < c.id ? -1 : 1));
        const target = scored.slice(0, 6).map(x => x.id);
        v.npcBuild[vid] = { day, target, dirty: false };
        return target;
      } catch (e) { warn('villagerTargetBuild', e); return []; }
    },

    // villagerNeedTrack(vid): the track whose next level-up would bring the
    // best target ability they don't hold yet (the deeds their build needs).
    villagerNeedTrack(vid) {
      try {
        const held = this._buildHeld(vid);
        const F = features(this);
        for (const id of this.villagerTargetBuild(vid)) if (held.indexOf(id) < 0 && F[id] && F[id].track) return F[id].track;
        return null;
      } catch (e) { warn('villagerNeedTrack', e); return null; }
    },

    // buildDecide(who, offerIds, opts): the swap-or-keep rule, the same for
    // the player's bots and villagers. Free slot: take the best. Full: the
    // best replaces the weakest held only if it beats it by more than 1;
    // otherwise keep what you have.
    buildDecide(who, offerIds, opts) {
      opts = Object.assign({ onSheet: true }, opts || {});
      const tech = this.buildTechnology(who);
      let best = null;
      for (const id of offerIds) {
        const sc = this.buildScore(who, id, Object.assign({}, opts, { tech }));
        if (!best || sc > best.sc) best = { id, sc };
      }
      if (!best) return { keep: true };
      const held = this._buildHeld(who);
      if (held.length < this._buildSlots(who)) return { pick: best.id, score: best.sc };
      let worst = null;
      for (const h of held) {
        if (h === 'fusion_reactor') continue;
        const sc = this.buildScore(who, h, { without: h, tech });
        if (!worst || sc < worst.sc) worst = { id: h, sc };
      }
      if (worst && best.sc > worst.sc + 1) return { pick: best.id, replace: worst.id, score: best.sc, worstScore: worst.sc };
      return { keep: true, score: best.sc, worstScore: worst ? worst.sc : null };
    },

    // villagerLevelUpOffers(vid, track): the player's sheet, for a villager:
    // the next 3 unheld magic abilities of the track's kit.
    villagerLevelUpOffers(vid, track, level) {
      const T = this.trackData();
      const held = new Set(this._buildOwned(vid));
      const F = features(this);
      const cands = [];
      for (const id of ((T.kits || {})[track] || [])) {
        if (held.has(id)) continue;
        if (id === 'fusion_reactor' && this.state.fusionReactorHolder) continue;
        if (!F[id] || F[id].lane === 'skill') continue;
        cands.push(id);
      }
      const n = T.offerSize || 3;
      const out = cands.slice(0, n);
      const d = (id) => (this.abilityDef && this.abilityDef(id)) || { id };
      // ONE SHEET: the player's own function (godpath.js kitSheet): drawn from
      // the next 6 unheld entries per holder/level, leaned to their class or,
      // before one, their job path, distinct roles.
      if (typeof this.kitSheet === 'function') {
        try {
          if (level == null) level = this.trackLevelFor ? this.trackLevelFor(this.npcXp(vid)[track] || 0, 'villager') : 0;
          return this.kitSheet(cands.map(d), vid, track, level).map(x => x.id);
        } catch (e) { warn('villager kit sheet', e); }
      }
      if (typeof this.shapeOffers === 'function') {
        try {
          return this.shapeOffers(out.map(d), cands.slice(n).map(d), vid).map(x => x.id);
        } catch (e) { warn('villager sheet lean', e); }
      }
      return out;
    },

    // _knowsTooLittle(vid, offers): fewer than 2 abilities to build around
    // (held, or known well enough to plan) besides the sheet itself.
    _knowsTooLittle(vid, offers) {
      const held = this._buildHeld(vid);
      const know = ((this.state.village || {}).npcKnow || {})[vid] || {};
      let n = held.length;
      for (const id of Object.keys(know)) if (know[id] >= 2 && held.indexOf(id) < 0 && offers.indexOf(id) < 0) n++;
      return n < 2;
    },

    // villagerResolveLevelUps(vid): queued sheets (x.sheets) resolve here —
    // pick 1 of 3 by buildScore, swap or keep when full. A villager who knows
    // too little to choose defers (up to 3 days) and seeks knowledge first.
    villagerResolveLevelUps(vid) {
      try {
        if (!this.state.systemArrived || this.over) return 'waiting';
        const vp = this.vpOf ? this.vpOf(vid) : null;
        if (vp && vp.dead) return 'dead';
        const x = this.npcXp(vid);
        const q = x.sheets = x.sheets || [];
        const day = (this.state.scholar || {}).day || 0;
        const T = this.trackData();
        let last = 'none';
        while (q.length) {
          const sh = q[0];
          if (sh.day == null) sh.day = day;
          const offers = this.villagerLevelUpOffers(vid, sh.track, sh.level);
          if (!offers.length) { q.shift(); last = 'empty'; continue; } // the shelf is bare: the XP still counts
          for (const id of offers) this.npcLearnAbility(vid, id, 2, 'system-sheet'); // the System shows what each does
          if (this._knowsTooLittle(vid, offers) && day - sh.day < 3) {
            x.seekFor = sh.track; // agency: go and learn before choosing
            return 'defer';
          }
          const d = this.buildDecide(vid, offers);
          q.shift();
          x.seekFor = null;
          const label = (T.labels || {})[sh.track] || sh.track;
          const vname = (() => { try { return this.displayName ? this.displayName(vid) : 'Someone'; } catch (e) { return 'Someone'; } })();
          if (d.keep) {
            try { this.tele('villager_level_up', { vid, track: sh.track, level: sh.level, kept: true, offers }); } catch (e) { warn('tele', e); }
            last = 'kept';
            continue;
          }
          if (d.replace) this.npcRevokeAbility(vid, d.replace);
          if (this.npcGrantAbility(vid, d.pick) === false) { last = 'refused'; continue; } // never narrate a grant that didn't happen
          this.npcLearnAbility(vid, d.pick, 3, 'held');
          const aname = ((this.abilityDef && this.abilityDef(d.pick)) || {}).name || d.pick;
          const rname = d.replace ? (((this.abilityDef && this.abilityDef(d.replace)) || {}).name || d.replace) : null;
          this.say(`◈ THE SYSTEM has been watching ${vname} — ${label} ${sh.level}. Three offers; they took ${aname}${rname ? ', letting go of ' + rname : ''}. Earned, chosen. (${d.pick}: villager level-up)`);
          try { this.journalNote && this.journalNote('system', 'grant-' + vid + '-' + d.pick, `${vname} chose ${aname} (${d.pick}) at ${label} ${sh.level}.`); } catch (e) { warn('journalNote', e); }
          try { this.tele('villager_grant', { vid, ability: d.pick, track: sh.track, xp: x[sh.track] }); } catch (e) { warn('tele', e); }
          try { this.tele('villager_level_up', { vid, track: sh.track, level: sh.level, pick: d.pick, replaced: d.replace || null, offers }); } catch (e) { warn('tele', e); }
          last = d.replace ? 'replaced' : 'picked';
        }
        return last;
      } catch (e) { warn('villagerResolveLevelUps', e); return 'error'; }
    },

    // villagerWantsKnowledge(vid): 'sheet' when a level-up waits on what they
    // know; 'build' when their plan is thin (held + known < 3), at most every
    // 4 days; else null.
    villagerWantsKnowledge(vid) {
      try {
        if (!this.state.systemArrived) return null;
        const x = this.npcXp(vid);
        if (x.seekFor && (x.sheets || []).length) return 'sheet';
        const day = (this.state.scholar || {}).day || 0;
        if (x.lastSeek != null && day - x.lastSeek < 4) return null;
        if (this.villagerTargetBuild(vid).length < 3) return 'build';
        return null;
      } catch (e) { warn('villagerWantsKnowledge', e); return null; }
    },

    // villagerSeekKnowledge(vid): the agency action. They go to someone who
    // holds or knows an ability (a villager at home, or the bearer when at
    // the haven) and learn the one that fits their build best. A holder can
    // show it (L2) and, to someone who's seen it, how it combines (L3); a
    // knower can describe it (up to L2). Nobody to ask: the System's
    // broadcasts (L2 of the next kit ability on their strongest track).
    villagerSeekKnowledge(vid) {
      try {
        const v = this.state.village || {};
        const x = this.npcXp(vid);
        const day = (this.state.scholar || {}).day || 0;
        x.lastSeek = day;
        const teachers = [];
        for (const rid of (v.roster || [])) {
          if (rid === vid || rid === this.villagerId) continue;
          const p = this.vpOf ? this.vpOf(rid) : null;
          if (p && p.dead) continue;
          if ((v.away || {})[rid]) continue;
          teachers.push(rid);
        }
        let atHaven = false;
        try { atHaven = this.playerAtHaven ? this.playerAtHaven() : false; } catch (e) { warn('playerAtHaven', e); }
        if (atHaven) teachers.push('player');
        const tech = this.buildTechnology(vid);
        let best = null;
        for (const t of teachers) {
          const holds = this._buildHeld(t);
          const knows = t === 'player' ? Object.keys(((this.state.codex || {}).abilities) || {}).filter(id => this.codexAbilityLevel(id) >= 2)
            : Object.keys(((v.npcKnow || {})[t]) || {}).filter(id => v.npcKnow[t][id] >= 2);
          const pool = new Set(holds.concat(knows));
          for (const id of pool) {
            const cur = this.abilityKnowledge(vid, id);
            const cap = holds.indexOf(id) >= 0 ? 3 : 2;
            const to = Math.min(cap, Math.max(2, cur + 1));
            if (to <= cur) continue;
            const sc = this.buildScore(vid, id, { know: to, noTarget: true, tech }) * (to - cur);
            if (!best || sc > best.sc) best = { teacher: t, abilityId: id, level: to, sc };
          }
        }
        if (!best && this.state.systemArrived) {
          // the System's broadcasts: the next unknown kit ability of their strongest track
          const T = this.trackData();
          const tr = (T.tracks || []).slice().sort((a, b) => (x[b] || 0) - (x[a] || 0));
          for (const t of tr) {
            const id = ((T.kits || {})[t] || []).find(k => this.abilityKnowledge(vid, k) < 2);
            if (id) { best = { teacher: 'system', abilityId: id, level: 2, sc: 0 }; break; }
          }
        }
        if (!best) return null;
        this.npcLearnAbility(vid, best.abilityId, best.level, 'sought:' + best.teacher);
        try { this.tele('villager_seek_knowledge', { vid, teacher: best.teacher, ability: best.abilityId, level: best.level }); } catch (e) { warn('tele', e); }
        if (atHaven && Math.random() < 0.25) {
          const nm = this.displayName ? this.displayName(vid) : 'Someone';
          const an = ((this.abilityDef && this.abilityDef(best.abilityId)) || {}).name || best.abilityId;
          const who = best.teacher === 'player' ? 'you' : best.teacher === 'system' ? 'the System\'s broadcast' : (this.displayName ? this.displayName(best.teacher) : 'someone');
          this.say(`💬 ${nm} has been asking ${who} about ${an} — what it does, what it goes with. Planning something.`);
        }
        // a sheet that waited on this can be chosen now
        if ((x.sheets || []).length) this.villagerResolveLevelUps(vid);
        return { teacher: best.teacher, abilityId: best.abilityId, level: best.level };
      } catch (e) { warn('villagerSeekKnowledge', e); return null; }
    },

    // npcLearnFromTalk(learner, teacher): a held conversation between the
    // bearer and a villager teaches the villager one thing the bearer holds
    // (L2). The player learns from villagers through the codex paths.
    npcLearnFromTalk(learnerVid, teacherId) {
      try {
        if (!learnerVid || isPlayerWho(this, learnerVid) || !this.state.systemArrived) return null;
        const holds = this._buildHeld(teacherId || 'player');
        const tech = this.buildTechnology(learnerVid);
        let best = null;
        for (const id of holds) {
          if (this.abilityKnowledge(learnerVid, id) >= 2) continue;
          const sc = this.buildScore(learnerVid, id, { know: 2, noTarget: true, tech });
          if (!best || sc > best.sc) best = { id, sc };
        }
        if (!best) return null;
        if (!this.npcLearnAbility(learnerVid, best.id, 2, 'talk:' + (teacherId || 'player'))) return null;
        // TACKLE-TEACH 2026-10-27: a conversation teach used to be invisible
        // — no tele event, no journal note, nothing any measurement could
        // count, and nothing the player could read back. Ledger it like
        // the seek path ledgers its lessons: who taught whom what. The
        // lesson itself is unchanged; only its record is new.
        try { this.tele('villager_talk_teach', { vid: learnerVid, teacher: teacherId || 'player', ability: best.id, level: 2 }); } catch (e) { warn('tele talk teach', e); }
        try {
          const nm = (id) => { try { return this.displayName ? this.displayName(id) : 'Someone'; } catch (e) { return 'Someone'; } };
          const an = ((this.abilityDef && this.abilityDef(best.id)) || {}).name || best.id;
          const who = (!teacherId || teacherId === 'player') ? 'you' : nm(teacherId);
          if (this.journalNote) this.journalNote('village', 'talk-teach:' + learnerVid + ':' + best.id, `${nm(learnerVid)} picked up ${an} from talking with ${who} — what it does, and what it might go with.`);
        } catch (e) { warn('journal talk teach', e); }
        return best.id;
      } catch (e) { warn('npcLearnFromTalk', e); return null; }
    },

    // npcWitnessAbility(id, witnesses, userId): watching it used in a fight
    // shows what it does (L2), for every villager who saw it.
    npcWitnessAbility(id, witnesses, userId) {
      let n = 0;
      for (const w of (witnesses || [])) {
        if (!w || w === userId || isPlayerWho(this, w)) continue;
        if (this.npcLearnAbility(w, id, 2, 'witnessed:' + (userId || '?'))) n++;
      }
      return n;
    },

    // pickVillagerKnack(vid, choices): the villager's first ability, chosen
    // from the same 3 lifeseed-tied choices the player gets, by buildScore.
    pickVillagerKnack(vid, choices) {
      let best = null;
      const tech = this.buildTechnology(vid);
      for (const c of (choices || [])) {
        const id = c && (c.id || c);
        if (!id) continue;
        const sc = this.buildScore(vid, id, { know: 2, noTarget: true, tech });
        if (!best || sc > best.sc) best = { id, sc };
      }
      return best ? best.id : null;
    },

    // mantleBecome(oldId, newId): "You become that villager." Called by
    // playerDeath after the successor is chosen and villagerId points at
    // them. What is PERSONAL is replaced by the successor's own record; what
    // belongs to the office or the village stays. Field by field:
    //   scholar.abilities     <- npcAbilities[newId] (the dead bearer's die with them)
    //   scholar.tracks        <- npcXp[newId] (levels already earned are not re-offered)
    //   scholar.levelUpQueue  <- their pending sheets; a predecessor's open level-up sheet closes
    //   scholar.deedDay       <- npcDeedDay[newId] (today's caps are per person)
    //   scholar.godhood       <- npcGodhood[newId] (recognition is of a build, a person's)
    //   scholar.inventory / equipped <- person.items / person.equipped / person.stashed
    //                            (body AND accessory slots stay worn exactly as worn;
    //                            stashed belongings ride in the pack; keepsakes via
    //                            migrateKeepsakes into any still-free accessory slot)
    //   scholar.languages     <- their own tongues (npcLangs + occupation polyglot),
    //                            never the predecessor's (tackle-succession 2026-10-27)
    //   codex.abilities       += npcKnow[newId] (the Codex is the office's: it keeps
    //                            what it knew and learns what they knew)
    //   codex.skills          += npcSkills[newId] (their know-how, taught into the Codex)
    //   knack                 their own (npcKnacks[newId], already in their slots)
    //   kept with the office: integration (and so slots), arc, ledger, Codex, trust
    //   (discounted, ledger.js), trialDeeds/deedConverted, trackStats (run counters).
    // The village records for newId are cleared: they are the bearer now.
    mantleBecome(oldId, newId) {
      const s = this.state.scholar, v = this.state.village || {};
      const T = this.trackData();
      try {
        // fusion singularity (Steve 2026-10-12: "only affect a single one of
        // the villagers"): a dead bearer's reactor goes with the body and the
        // world's flag STAYS set, so no second reactor rises (game.js
        // abilityOnAcquire). Clearing it here re-opened the offer for every
        // successor (diagnosis 2026-10-15). A successor who already holds
        // the world's reactor keeps it as the bearer's.
        const fh = this.state.fusionReactorHolder;
        if (fh && fh.who === 'villager' && fh.vid === newId) this.state.fusionReactorHolder = Object.assign({}, fh, { who: 'player' });
        // abilities: theirs
        const mine = ((v.npcAbilities || {})[newId] || []).slice();
        const knack = ((v.npcKnacks || {})[newId]) || null;
        s.abilities = mine.map(id => {
          const d = (this.abilityDef && this.abilityDef(id)) || {};
          const e = { id, name: d.name || id, desc: d.description || '', level: 1, xp: 0 };
          if (id === knack) e.latent = true;
          return e;
        });
        s.knackChoices = null; s.knackChosen = true; // their first ability is already theirs
        // tracks: theirs
        const x = (v.npcXp || {})[newId] || (this.npcXp ? this.npcXp(newId) : null) || {};
        s.tracks = {};
        for (const t of T.tracks) {
          const xp = x[t] || 0;
          s.tracks[t] = { xp, level: this.trackLevelFor(xp) };
        }
        // a level-up sheet open for the dead bearer closes; theirs carry over
        if (this.isLevelUpSheet && this.isLevelUpSheet()) s.abilityChoices = null;
        s.levelUpQueue = (x.sheets || []).map(sh => ({ track: sh.track, level: sh.level, xp: x[sh.track] || 0 }));
        s.deedDay = Object.assign({}, ((v.npcDeedDay || {})[newId]) || {});
        // godhood: a person's build
        s.godhood = ((v.npcGodhood || {})[newId]) || { recognized: {}, active: [] };
        // god-path class: a person's, like godhood (godpath.js recognizeClass)
        s.godpath = ((v.npcGodpath || {})[newId]) || null;
        // Humanity belongs to the person, not the inherited office. Preserve
        // legacy scholar grounding for the departing body; zero is real.
        const humanity = this.state.groundingByPerson || (this.state.groundingByPerson = {});
        humanity[oldId] = s.grounding == null ? 100 : Math.max(0, Math.min(100, s.grounding | 0));
        s.grounding = Number.isFinite(humanity[newId]) ? Math.max(0, Math.min(100, humanity[newId] | 0)) : 100;
        delete humanity[newId]; // the current body uses scholar.grounding
        // knowledge into the Codex (never lowers what the Codex knew)
        const know = ((v.npcKnow || {})[newId]) || {};
        const cx = this.state.codex = this.state.codex || {};
        cx.abilities = cx.abilities || {};
        for (const id of Object.keys(know)) {
          const cur = cx.abilities[id] || { level: 0, sources: [] };
          if ((cur.level || 0) < know[id]) { cur.level = know[id]; cur.sources = (cur.sources || []).concat(['mantle:' + newId]); cx.abilities[id] = cur; }
        }
        // They remember plants too. Import their actual personal union as
        // names, without a new discovery, XP, integration or witness event.
        // A mistaken memory cannot overrule correct written knowledge.
        cx.plants = cx.plants || {};
        const plants = this.plantsKnownBy ? this.plantsKnownBy(newId, v) : [];
        for (const pid of plants) {
          if (!(this.data.plants || []).some(p => p.id === pid)) continue;
          const old = cx.plants[pid], wrong = v.wrongAbout?.[newId]?.[pid];
          const mistaken = !!(wrong && wrong.wrongPid && !wrong.deliberate);
          if (old && old.level >= 1 && (!old.wrongAs && !old.wrongPid || mistaken)) continue;
          const entry = Object.assign({}, old || {}, { level: Math.max(1, old?.level || 0),
            identifiedDay: old?.identifiedDay ?? s.day, by: 'mantle', rememberedBy: newId });
          cx.plants[pid] = entry;
          if (mistaken) {
            const named = (this.data.plants || []).find(p => p.id === wrong.wrongPid);
            entry.wrongAs = named?.name || wrong.wrongPid; entry.wrongPid = wrong.wrongPid;
          } else if (entry.wrongAs) this.resolveWrongName(pid, 'their own memory');
          else delete entry.wrongPid;
        }
        const sk = ((v.npcSkills || {})[newId]) || [];
        for (const sid of sk) { try { if (this.learnSkill) this.learnSkill(sid, 1, 'their own hands'); } catch (e) { warn('mantle skill', e); } }
        // gear: what they owned and wore
        const eq = EQ();
        const defs = this.data.items || [];
        const person = this.getPerson ? this.getPerson(newId) : null;
        const personItems = ((person && person.items) || []).slice();
        const BODY = ['melee', 'ranged', 'head', 'torso', 'legs', 'hands', 'shoes'];
        const WORN_SLOTS = BODY.concat(['acc1', 'acc2', 'acc3', 'acc4']);
        // Pool items are usually BARE STRING ids (choosePersonalFive) — the
        // old match read (itemId||id) off every pool entry, so a string
        // never matched and NO worn slot ever carried: the successor woke
        // up with an empty equipped set and everything in the pack, and the
        // keepsake migration then re-wore a reshuffled accessory set.
        // (tackle-succession 2026-10-27: what they wore stays worn, in the
        // same slot — body and accessory alike.)
        const idOfItem = (it) => (typeof it === 'string' ? it : (it && (it.itemId || it.id)));
        // Pool carries the source OBJECTS (not bare ids) so the inventory
        // map below keeps each copy's own units/kcalEach — duplicate ids
        // (two stone knives) must not collapse onto the first copy.
        const pool = personItems.slice();
        s.equipped = {};
        for (const sl of WORN_SLOTS) {
          const e = ((person && person.equipped) || {})[sl];
          if (!e || !e.itemId) continue;
          const i = pool.findIndex(it => idOfItem(it) === e.itemId);
          if (i < 0) continue;
          pool.splice(i, 1);
          s.equipped[sl] = Object.assign({}, e);
        }
        // GAP-W4-NARR #807: the old map collapsed every item object
        // to its id and rebuilt units:1/kcalEach:0 — a 6-strip dried-meat
        // stack became one 0-kcal strip on succession. Carry the source
        // object's own units and kcalEach (def as fallback).
        const toScholarItem = (srcIt) => {
          const id = (srcIt && (srcIt.itemId || srcIt.id)) || srcIt;
          const def = defs.find(d => d.id === id) || {};
          const personal = ((person && person.itemPersonal) || {})[id];
          return {
            itemId: id, units: (srcIt && srcIt.units) || 1, kcalEach: (srcIt && srcIt.kcalEach != null) ? srcIt.kcalEach : (def.kcalEach || 0),
            kg: (srcIt && srcIt.kg != null) ? srcIt.kg : (def.kg != null ? def.kg : 0.2),
            name: personal ? personal.name : ((srcIt && srcIt.name) || def.name || id),
            flavor: personal ? personal.flavor : def.flavor, owner: newId,
            bonded: true, bond: 0, bondOffered: [], enhancements: [],
          };
        };
        // STASHED BELONGINGS (tackle-succession 2026-10-27): person.stashed
        // is their own things at their space — but after the mantle npcIds
        // excludes the bearer, so no player path ever reads it again, and
        // the next death's death pack (scholar only) deletes it outright.
        // Their things ride in their pack now, like their carried things.
        s.inventory = pool.map(toScholarItem)
          .concat(((person && person.stashed) || []).map(toScholarItem));
        // LANGUAGES (tackle-succession 2026-10-27): scholar.languages was
        // never set on the mantle, so the successor woke up speaking the
        // dead bearer's tongues. Mirror newGame: the heir's own languages,
        // plus their occupation's polyglot tongues at fluent.
        try {
          const langSrc = (typeof this.npcLangs === 'function') ? this.npcLangs(newId) : ((person && person.languages) || null);
          const plv = (typeof this.levelsOf === 'function') ? this.levelsOf(langSrc) : { english: 2 };
          const occL = (((this.data.characterGen || {}).occupations) || []).find(o => o.id === ((person && person.occupationId) || null)) || {};
          for (const l of (occL.polyglot || [])) plv[l] = 2;
          s.languages = plv;
          s.englishLevel = plv.english != null ? plv.english : 2;
        } catch (e) { warn('mantle languages', e); }
        if (person) { person.items = []; person.equipped = {}; person.stashed = []; } // the bearer's kit lives on scholar.* now — never counted twice
        // they are the bearer now: no villager records
        for (const k of ['npcAbilities', 'npcXp', 'npcSkills', 'npcKnow', 'npcBuild', 'npcDeedDay', 'npcGodpath']) { if (v[k]) delete v[k][newId]; }
        try { if (this.recomputeActiveSynergies) this.recomputeActiveSynergies(); } catch (e) { warn('mantle synergies', e); }
        try { this.tele('mantle_become', { from: oldId, to: newId, abilities: s.abilities.length, gear: Object.keys(s.equipped).length }); } catch (e) { warn('tele', e); }
        return true;
      } catch (e) { warn('mantleBecome', e); return false; }
    },

    // ---------- gear ----------
    // villagerGearFit(vid, itemId): how well an item suits their build — a
    // ranged-leaning build wants the bow, a sustain build wants the armor.
    villagerGearFit(vid, itemId) {
      try {
        const eq = EQ();
        const def = (this.data.items || []).find(d => d.id === itemId);
        if (!def || !eq) return 1;
        const F = features(this);
        const tgt = this.villagerTargetBuild(vid).concat(this._buildHeld(vid));
        let ranged = 0, fight = 0, sustain = 0;
        for (const id of tgt) { const f = F[id]; if (!f) continue; if (f.ranged) ranged++; if (f.combat) fight++; if (f.combat && f.slotRole === 'sustain') sustain++; }
        if (def.weapon && eq.isRangedWeapon(def)) return 1 + 0.25 * Math.min(2, ranged);
        if (def.weapon) return 1 + 0.15 * Math.min(2, fight);
        if (def.armor) return 1 + 0.2 * Math.min(2, sustain);
        return 1;
      } catch (e) { warn('villagerGearFit', e); return 1; }
    },

    // _slotValue(person, slot): what's in that slot now (weapon bonus or armor).
    _gearValue(def) {
      if (!def) return 0;
      if (def.weapon) return def.weapon.bonus || 0;
      if (def.armor) return def.armor.protection || 0;
      return 0;
    },

    // villagerGearDay(): daily, cheap, greedy. Every villager at home:
    //  1. wears the best of their own things (autoEquip) and fetches upgrades
    //     from their own stash;
    //  2. spares (weapons/armor carried but not worn) go to whoever gains
    //     most from them — nobody hoards what another needs more; worn gear
    //     is never taken;
    //  3. the village armory (deposited weapons — deposit is consent) goes to
    //     the biggest gains first, one per villager per day; the weapon they
    //     replace goes back on the pile.
    // Returns the number of items that changed hands.
    villagerGearDay() {
      const eq = EQ();
      if (!eq) return 0;
      let moved = 0;
      try {
        const v = this.state.village || {};
        const defs = this.data.items || [];
        const defOf = (id) => defs.find(d => d.id === id) || null;
        const idOf = (it) => (it && (it.itemId || it.id)) || it;
        const people = [];
        for (const rid of (v.roster || [])) {
          if (rid === this.villagerId) continue;
          if ((v.away || {})[rid]) continue;
          const p = this.getPerson ? this.getPerson(rid) : null;
          if (!p || p.dead) continue;
          people.push({ vid: rid, p });
        }
        const slotVal = (p, slot) => { const e = (p.equipped || {})[slot]; return e ? this._gearValue(defOf(e.itemId)) : 0; };
        // 1. own things
        for (const { p } of people) {
          try {
            eq.autoEquip(p, defs);
            const stash = p.stashed || [];
            for (let i = stash.length - 1; i >= 0; i--) {
              const d = defOf(idOf(stash[i]));
              if (!d || !(d.weapon || d.armor)) continue;
              const slot = eq.slotForItem(d);
              if (!slot) continue;
              if (this._gearValue(d) > slotVal(p, slot)) {
                p.items = p.items || [];
                p.items.push(idOf(stash[i]));
                stash.splice(i, 1);
                eq.autoEquip(p, defs);
              }
            }
          } catch (e) { warn('gear own', e); }
        }
        // 2. spares to whoever gains most
        const spares = [];
        for (const { vid, p } of people) {
          const worn = new Set(Object.values(p.equipped || {}).map(e => e && e.itemId));
          const seenWorn = {};
          (p.items || []).forEach((it, idx) => {
            const id = idOf(it);
            const d = defOf(id);
            if (!d || !(d.weapon || d.armor) || d.class === 'sentimental') return;
            if (worn.has(id) && !seenWorn[id]) { seenWorn[id] = true; return; } // the worn copy stays
            const slot = eq.slotForItem(d);
            if (slot) spares.push({ from: vid, p, id, d, slot });
          });
        }
        for (const sp of spares) {
          let best = null;
          for (const { vid, p } of people) {
            if (vid === sp.from) continue;
            const gain = (this._gearValue(sp.d) - slotVal(p, sp.slot)) * this.villagerGearFit(vid, sp.id);
            if (gain > 0 && (!best || gain > best.gain)) best = { vid, p, gain };
          }
          const ownGain = this._gearValue(sp.d) - slotVal(sp.p, sp.slot);
          if (!best || ownGain >= best.gain) continue;
          const idx = (sp.p.items || []).findIndex(it => idOf(it) === sp.id);
          if (idx < 0) continue;
          sp.p.items.splice(idx, 1);
          best.p.items = best.p.items || [];
          best.p.items.push(sp.id);
          eq.autoEquip(best.p, defs);
          moved++;
          try { this.tele('villager_gear', { vid: best.vid, item: sp.id, from: sp.from, via: 'gift' }); } catch (e) { warn('tele', e); }
        }
        // 3. the armory: biggest gains first, one per villager per day
        let pile = [];
        try { const st = this.stashState ? this.stashState() : null; pile = (st && st.weapons) || []; } catch (e) { warn('stashState', e); }
        if (pile.length) {
          const wants = [];
          for (const { vid, p } of people) {
            for (let i = 0; i < pile.length; i++) {
              const id = idOf(pile[i]);
              const d = defOf(id);
              if (!d || !d.weapon) continue;
              const slot = eq.slotForItem(d);
              const gain = (this._gearValue(d) - slotVal(p, slot)) * this.villagerGearFit(vid, id);
              if (gain > 0) wants.push({ vid, p, id, slot, gain });
            }
          }
          wants.sort((a, b) => b.gain - a.gain);
          const served = new Set();
          for (const w of wants) {
            if (served.has(w.vid)) continue;
            const idx = pile.findIndex(e => idOf(e) === w.id && (e.units || 1) > 0);
            if (idx < 0) continue;
            if (this._gearValue(defOf(w.id)) <= slotVal(w.p, w.slot)) continue;
            const ent = pile[idx];
            ent.units = (ent.units || 1) - 1;
            if (ent.units <= 0) pile.splice(idx, 1);
            try { if (this.stashLog) this.stashLog('take', w.id, 1, w.vid); } catch (e) { warn('stashLog', e); }
            const old = (w.p.equipped || {})[w.slot];
            w.p.items = w.p.items || [];
            w.p.items.push(w.id);
            if (old && old.itemId) {
              const oi = w.p.items.findIndex(it => idOf(it) === old.itemId);
              if (oi >= 0) {
                w.p.items.splice(oi, 1);
                const back = pile.find(e => idOf(e) === old.itemId);
                if (back) back.units = (back.units || 1) + 1; else pile.push({ itemId: old.itemId, units: 1 });
                try { if (this.stashLog) this.stashLog('deposit', old.itemId, 1, w.vid); } catch (e) { warn('stashLog', e); }
              }
            }
            eq.autoEquip(w.p, defs);
            served.add(w.vid);
            moved++;
            try { this.tele('villager_gear', { vid: w.vid, item: w.id, via: 'armory' }); } catch (e) { warn('tele', e); }
          }
        }
        // 3b. the armory — ARMOR (armorvillage 2026-10-23, ARMORVILLAGE=1):
        // the pile's deposited armor, deposit-is-consent, mirrored exactly on
        // the weapons pattern above: biggest gains first, one per villager per
        // day; the armor they replace goes back on the pile. The ledger
        // remembers the giver. (Gate: control = no structure.)
        try {
          const _avOn = (typeof process !== 'undefined' && process.env && process.env.ARMORVILLAGE === '1');
          if (_avOn) {
            let apile = [];
            try { const st2 = this.stashState ? this.stashState() : null; apile = (st2 && st2.armor) || []; } catch (e2) { warn('stashStateArmor', e2); }
            if (apile.length) {
              const wants = [];
              for (const { vid, p } of people) {
                for (let i = 0; i < apile.length; i++) {
                  const id = idOf(apile[i]);
                  const d = defOf(id);
                  if (!d || !d.armor) continue;
                  const slot = eq.slotForItem(d);
                  if (!slot) continue;
                  const gain = (this._gearValue(d) - slotVal(p, slot)) * this.villagerGearFit(vid, id);
                  if (gain > 0) wants.push({ vid, p, id, slot, gain });
                }
              }
              wants.sort((a, b) => b.gain - a.gain);
              const served = new Set();
              for (const w of wants) {
                if (served.has(w.vid)) continue;
                const idx = apile.findIndex(e => idOf(e) === w.id && (e.units || 1) > 0);
                if (idx < 0) continue;
                if (this._gearValue(defOf(w.id)) <= slotVal(w.p, w.slot)) continue;
                const ent = apile[idx];
                ent.units = (ent.units || 1) - 1;
                if (ent.units <= 0) apile.splice(idx, 1);
                try { if (this.stashLog) this.stashLog('take', w.id, 1, w.vid); } catch (e2) { warn('stashLog', e2); }
                const old = (w.p.equipped || {})[w.slot];
                w.p.items = w.p.items || [];
                w.p.items.push(w.id);
                if (old && old.itemId) {
                  const oi = w.p.items.findIndex(it => idOf(it) === old.itemId);
                  if (oi >= 0) {
                    w.p.items.splice(oi, 1);
                    const back = apile.find(e => idOf(e) === old.itemId);
                    if (back) back.units = (back.units || 1) + 1; else apile.push({ itemId: old.itemId, units: 1 });
                    try { if (this.stashLog) this.stashLog('deposit', old.itemId, 1, w.vid); } catch (e2) { warn('stashLog', e2); }
                  }
                }
                eq.autoEquip(w.p, defs);
                served.add(w.vid);
                moved++;
                try { this.tele('villager_gear', { vid: w.vid, item: w.id, via: 'armor_pile' }); } catch (e2) { warn('tele', e2); }
              }
            }
          }
        } catch (e) { warn('gear armor pile', e); }
      } catch (e) { warn('villagerGearDay', e); }
      return moved;
    },

    // villagerBuildDay(): the daily tick (endDay, beside npcSynergyTick).
    villagerBuildDay() {
      try {
        // recruits who arrived after the first day get their first ability too
        try { if (this.grantVillagerKnacks) this.grantVillagerKnacks(); } catch (e) { warn('knacks', e); }
        this.villagerGearDay();
        // ARMOR CRAFT (armorvillage 2026-10-23): NPC armor-craft beats —
        // villagers who demonstrably know an armor recipe sew for themselves.
        try { if (this.villagerArmorCraftDay) this.villagerArmorCraftDay(); } catch (e) { warn('armorcraft', e); }
        const v = this.state.village || {};
        for (const rid of (v.roster || [])) {
          if (rid === this.villagerId) continue;
          const x = (v.npcXp || {})[rid];
          if (x && (x.sheets || []).length) this.villagerResolveLevelUps(rid);
        }
        // SKILL LESSONS (skill-teaching.js): villagers teach each other human skills that fit their builds.
        if (this.villagerSkillLessonsDay) this.villagerSkillLessonsDay();
      } catch (e) { warn('villagerBuildDay', e); }
    },

    // villagerArmorCraftDay(): NPC armor-craft beats (armorvillage 2026-10-23,
    // design calls #4-6). A villager at home who demonstrably knows an armor
    // recipe spends downtime sewing. KNOWLEDGE = demonstrated by wearing:
    // wearing bark_armor means bark_armor L1; wearing hide_armor means
    // hide_armor L1 (no new knowledge system — "if you don't know, it doesn't
    // show", and wearing it IS the showing). Materials come from the communal
    // materials pile (bark/vine/hide already in MAT_DEFS; the
    // whittle-from-the-woodpile precedent covers communal-materials to
    // personal-gear). Odds mirror the player's craft() exactly: L1 35% blind
    // (materials at risk), L2+ 85%; a successful blind craft teaches L2 (the
    // PRACTICE rule). ≤1 attempt per villager per 3 days. The piece is THEIRS
    // (individual ownership) — it enters their spares, and villagerGearDay's
    // spares flow moves it to whoever gains most. Gated on ARMORVILLAGE=1
    // (control = no structure). Returns the number of pieces crafted.
    villagerArmorCraftDay() {
      let made = 0;
      try {
        const _avOn = (typeof process !== 'undefined' && process.env && process.env.ARMORVILLAGE === '1');
        if (!_avOn) return 0;
        const v = this.state.village || {};
        const day = (this.state.scholar || {}).day || 0;
        const defs = this.data.items || [];
        const recipes = this.data.recipes || [];
        const eq = (typeof globalThis !== 'undefined' && globalThis.Scattering && globalThis.Scattering.equipment) || null;
        v.avCraft = v.avCraft || {};       // vid -> { recipeId: level }
        v.avCraftCd = v.avCraftCd || {};   // vid -> last attempt day
        const home = (v.roster || []).filter(id =>
          id !== this.villagerId && !((v.away || {})[id]) &&
          !(this.getPerson ? (this.getPerson(id) || {}).dead : false));
        for (const vid of home) {
          try {
            if ((v.avCraftCd[vid] || -99) > day - 3) continue; // ≤1 attempt / 3d
            const p = this.getPerson ? this.getPerson(vid) : null;
            if (!p) continue;
            // knowledge: demonstrated by wearing
            const wornIds = new Set(Object.values(p.equipped || {}).map(e => e && e.itemId).filter(Boolean));
            const known = [];
            if (wornIds.has('bark_armor')) known.push('bark_armor');
            if (wornIds.has('hide_armor')) known.push('hide_armor');
            if (!known.length) continue;
            const lv = v.avCraft[vid] = v.avCraft[vid] || {};
            // pick the best-known recipe with materials on hand
            let pick = null;
            for (const rid of known) {
              const recipe = recipes.find(r => r.id === rid);
              if (!recipe || !recipe.materials) continue;
              const level = lv[rid] || 1;
              const mats = v.stash && v.stash.materials;
              let ok = true;
              for (const [m, need] of Object.entries(recipe.materials)) {
                if (((mats || {})[m] || 0) < need) { ok = false; break; }
              }
              if (!ok) continue;
              const prot = ((defs.find(d => d.id === rid) || {}).armor || {}).protection || 0;
              if (!pick || prot > pick.prot) pick = { rid, recipe, level, prot };
            }
            if (!pick) continue;
            v.avCraftCd[vid] = day;
            // honest take: communal materials, one craft's worth, narrated
            const mats = v.stash.materials;
            for (const [m, need] of Object.entries(pick.recipe.materials)) mats[m] -= need;
            const rate = pick.level >= 2 ? 0.85 : 0.35;
            const success = Math.random() < rate;
            let nm = 'Someone';
            try { nm = (this.firstRef ? this.firstRef(vid) : null) || p.name || 'Someone'; } catch (e) {}
            let atHaven = false;
            try { atHaven = this.playerAtHaven ? this.playerAtHaven() : false; } catch (e) {}
            const cdef = defs.find(d => d.id === pick.rid) || {};
            const pieceName = cdef.name || pick.recipe.name || pick.rid;
            if (!success) {
              try { if (this.tele) this.tele('armor_craft', { vid: vid, item: pick.rid, ok: false }); } catch (e) {}
              // no silent actions: a failed craft is witnessed when you're home
              if (atHaven) { try { this.say(`${nm} spent the afternoon sewing, and the ${pieceName} came apart in their hands. The bark strips are wasted.`); } catch (e) {} }
              continue; // materials already consumed above — the woods keep them
            }
            if (pick.level < 2) lv[pick.rid] = 2; // PRACTICE: blind success teaches
            p.items = p.items || [];
            p.items.push({ itemId: pick.rid, name: cdef.name || pick.recipe.name || pick.rid,
              units: 1, kcalEach: 0, kg: cdef.kg || pick.recipe.kg || 0.5 });
            try { if (eq) eq.autoEquip(p, defs); } catch (e) {}
            made++;
            try { if (this.tele) this.tele('armor_craft', { vid: vid, item: pick.rid, ok: true }); } catch (e) {}
            if (atHaven) { try { this.say(`${nm} spent the afternoon at the workbench and sewed a ${pieceName} that holds together. ${nm} wears it now.`); } catch (e) {} }
          } catch (e) { warn('armorcraft one', e); }
        }
      } catch (e) { warn('villagerArmorCraftDay', e); }
      return made;
    },
  };

  Object.assign(Game, methods);

  // WATCHING IT USED (parity 2026-10-14): when the bearer uses an ability,
  // the party beside them sees what it does (L2). useAbility/activateAbility
  // load after this module (abilityActions.js), so the wrap installs on the
  // first newGame/load — always before play.
  let _witnessWrapped = false;
  function installWitnessWraps(G) {
    if (_witnessWrapped) return;
    _witnessWrapped = true;
    for (const fn of ['useAbility', 'activateAbility']) {
      const orig = G[fn];
      if (typeof orig !== 'function') { warn(fn + ' missing: the party cannot witness abilities'); continue; }
      G[fn] = function (id) {
        const r = orig.apply(this, arguments);
        try {
          if (r !== false && r != null && this.npcWitnessAbility && this.partyMembers) {
            const aid = String(id || '').split('.')[0];
            this.npcWitnessAbility(aid, this.partyMembers(), this.villagerId);
          }
        } catch (e) { warn('witness', e); }
        return r;
      };
    }
  }
  for (const entry of ['newGame', 'load']) {
    const orig = Game[entry];
    if (typeof orig !== 'function') { warn(entry + ' missing'); continue; }
    Game[entry] = function () {
      try { installWitnessWraps(this); } catch (e) { warn('install witness', e); }
      return orig.apply(this, arguments);
    };
  }
})();
