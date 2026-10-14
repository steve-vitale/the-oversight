// @ontology
// system: tracks
// description: ONE progression system for the player and villagers (Steve 2026-10-14: "I think we need to sync the player and villager system. But the villager system sounds like the better model."). Five tracks (combat, field, social, craft, strange) fed by real deeds; thresholds and kits are data (src/data/tracks.json). Crossing a threshold is a level-up: a villager takes the next unheld kit ability and learns the next track skill; the player gets a level-up sheet, pick 1 of the next 3 unheld kit abilities (src 'level_up:<track>'). Kits are magic only; skill-lane entries become villager SKILLS (no slot). Occupations seed a starting lean (characterGen trackLean), below the first threshold.
// provides:
//   - trackData() -> the tracks.json record (tracks, thresholds, playerScale, kits, skills, deeds)
//   - trackThresholds(who) -> threshold list ('player' uses thresholds x playerScale)
//   - trackLevelFor(xp, who) -> thresholds crossed
//   - gainTrackXP(who, track, n, why) -> new xp; who = 'player' or a villager id (the bearer's id = the player)
//   - villagerGainXP(vid, track, n, why) -> thin wrapper over gainTrackXP (kept for its callers)
//   - npcXp(vid) -> villager track record {combat, field, social, craft, strange, granted, skilled}
//   - villagerTrackLevel(xp) -> villager level for an xp total
//   - playerTracks() -> scholar.tracks {track: {xp, level}} (seeded with the occupation lean)
//   - occupationLean(occId) -> {track: xp} from characterGen trackLean
//   - noteDeed(deedId, trackOverride) -> player track XP from the deed table (per-day caps)
//   - convertDeedToTrackXP(key, abilityId) -> once-only track XP for a deed that used to grant magic
//   - levelUpOffers(track) -> next unheld magic abilities of the track's kit (offerSize)
//   - pumpLevelUps() -> opens the next queued level-up sheet when none is pending
//   - keepAbilities() -> declines a level-up sheet ("Keep what I have")
//   - isLevelUpSheet() -> the pending ability sheet is a track level-up
//   - trackStat(k) -> scholar.trackStats counters (offered/picked/replaced/kept)
//   - trackSummary() -> [{track, label, icon, level, xp, prev, next}] for the character sheet
//   - npcLearnSkill(vid, abilityId) / npcKnowsSkill(vid, skillId) / npcOwnedIds(vid)
//   - migrateNpcLanes() -> moves skill-lane ids out of villager ability slots (idempotent)
// consumes:
//   - Game.data.tracks, Game.data.abilities, Game.data.characterGen
//   - state.village.npcXp, state.village.npcAbilities, state.village.npcSkills
//   - state.scholar.tracks, state.scholar.levelUpQueue, state.scholar.abilityChoices
//   - npcGrantAbility(vid, id), abilitySlots(), ownedAbilityIds(), isSkillLane(id), abilitySkillId(id)
// rules:
//   - same_events_feed_both: a deed credits whoever did it; villagerGainXP with the bearer's id credits the player (code: gainTrackXP)
//   - shared_data: thresholds, tracks and kits come from tracks.json for both (code: trackData); the player's thresholds are x playerScale (more deeds per day)
//   - kits_magic_only: kits hold lane 'magic' ids only; a villager's skill-lane grant becomes a villager skill, never a slot (code: npcGrantAbility, npcLearnSkill)
//   - villager_deterministic: villagers take the next unheld kit ability, first wins, no RNG; six-slot cap (code: gainTrackXP)
//   - player_pick_one_of_three: a player level-up offers the next 3 unheld kit abilities; full slots = each pick REPLACES a held ability, or keep what you have (code: pumpLevelUps, chooseAbility, keepAbilities)
//   - queue_never_drop: level-ups wait in scholar.levelUpQueue behind any pending sheet and before the System's arrival (code: pumpLevelUps)
//   - lean_below_first_threshold: occupation lean never grants a free level-up at spawn (code: playerTracks, npcXp)
(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  let _warned = {};
  function warn(msg, e) {
    // Reported, never swallowed (AGENTS.md rule 6); once per message so sims can count.
    const k = String(msg);
    if (_warned[k]) return;
    _warned[k] = true;
    console.warn('[tracks] ' + msg + (e ? ': ' + (e && e.message || e) : ''));
  }
  const FALLBACK = { tracks: [], thresholds: [3, 8, 16, 32, 64], playerScale: 1, offerSize: 3, maxAbilities: 6, kits: {}, skills: {}, deeds: {}, deedConversions: {}, labels: {}, icons: {}, nouns: {} };
  const emptyRec = (T) => {
    const r = { granted: {}, skilled: {} };
    for (const t of T.tracks) { r[t] = 0; r.granted[t] = 0; r.skilled[t] = 0; }
    return r;
  };

  const methods = {

    trackData() {
      const d = this.data && this.data.tracks;
      if (d && Array.isArray(d.tracks)) return d;
      warn('tracks.json not loaded — no track progression');
      return FALLBACK;
    },

    trackThresholds(who) {
      const T = this.trackData();
      const base = T.thresholds || FALLBACK.thresholds;
      if (who === 'player') {
        const k = T.playerScale || 1;
        return base.map(t => Math.max(1, Math.round(t * k)));
      }
      return base.slice();
    },

    trackLevelFor(xp, who) {
      let lvl = 0;
      for (const t of this.trackThresholds(who)) if ((xp || 0) >= t) lvl++;
      return lvl;
    },

    villagerTrackLevel(xp) { return this.trackLevelFor(xp, 'villager'); },

    occupationLean(occId) {
      try {
        const occ = (((this.data.characterGen || {}).occupations) || []).find(o => o.id === occId);
        return (occ && occ.trackLean) || {};
      } catch (e) { warn('occupationLean', e); return {}; }
    },

    // npcXp(vid): the villager's track record, created on first touch and
    // seeded with their occupation's lean (below the first threshold).
    npcXp(vid) {
      const T = this.trackData();
      try {
        const v = this.state.village; v.npcXp = v.npcXp || {};
        let x = v.npcXp[vid];
        if (!x) {
          x = v.npcXp[vid] = emptyRec(T);
          const p = this.getPerson ? this.getPerson(vid) : null;
          const lean = this.occupationLean(p && p.occupationId);
          const cap = (T.thresholds || [3])[0] - 1;
          for (const t of T.tracks) if (lean[t]) x[t] = Math.max(0, Math.min(cap, lean[t]));
        }
        x.granted = x.granted || {};
        x.skilled = x.skilled || {};
        for (const t of T.tracks) {
          if (x[t] == null) x[t] = 0;
          if (x.granted[t] == null) x.granted[t] = 0;
          // old saves: skills are new — the villager's past levels teach them
          if (x.skilled[t] == null) x.skilled[t] = 0;
        }
        return x;
      } catch (e) { warn('npcXp', e); return emptyRec(T); }
    },

    // playerTracks(): scholar.tracks, seeded on first touch with the bearer's
    // occupation lean (scaled like the thresholds, clamped below the first).
    playerTracks() {
      const T = this.trackData();
      const s = this.state.scholar;
      if (!s.tracks) {
        s.tracks = {};
        let occId = null;
        try { const p = this.getPerson && this.getPerson(this.villagerId); occId = p && p.occupationId; } catch (e) { warn('playerTracks person', e); }
        const lean = this.occupationLean(occId);
        const first = this.trackThresholds('player')[0] || 1;
        for (const t of T.tracks) {
          const xp = Math.max(0, Math.min(first - 1, Math.round((lean[t] || 0) * (T.playerScale || 1))));
          s.tracks[t] = { xp, level: 0 };
        }
      }
      for (const t of T.tracks) if (!s.tracks[t]) s.tracks[t] = { xp: 0, level: 0 };
      return s.tracks;
    },

    // gainTrackXP(who, track, n, why): THE one engine. who = 'player' or a
    // villager id. The bearer's own id is the player (a camp-healer path
    // that names the bearer credits the bearer).
    gainTrackXP(who, track, n, why) {
      try {
        const T = this.trackData();
        if (T.tracks.indexOf(track) < 0) { warn('unknown track "' + track + '" (' + why + ')'); return 0; }
        if (!who) return 0;
        if (who === 'player' || (this.villagerId && who === this.villagerId)) return this._playerTrackXP(track, n || 0, why);
        return this._villagerTrackXP(who, track, n || 0, why);
      } catch (e) { warn('gainTrackXP', e); return 0; }
    },

    villagerGainXP(vid, track, n, why) {
      return this.gainTrackXP(vid, track, n, why);
    },

    _playerTrackXP(track, n, why) {
      const s = this.state.scholar;
      if (!s || this.over) return 0;
      const t = this.playerTracks()[track];
      t.xp += n;
      const lvl = this.trackLevelFor(t.xp, 'player');
      while (t.level < lvl) {
        t.level++;
        s.levelUpQueue = s.levelUpQueue || [];
        s.levelUpQueue.push({ track, level: t.level, xp: t.xp });
        try { this.tele('track_level', { who: 'player', track, level: t.level, why: why || null }); } catch (e) { warn('tele track_level', e); }
      }
      this.pumpLevelUps();
      return t.xp;
    },

    _villagerTrackXP(vid, track, n, why) {
      const T = this.trackData();
      const vp = this.vpOf ? this.vpOf(vid) : null;
      if (vp && vp.dead) return 0; // the dead earn nothing
      const x = this.npcXp(vid);
      const before = this.trackLevelFor(x[track], 'villager');
      x[track] = (x[track] || 0) + n;
      const level = this.trackLevelFor(x[track], 'villager');
      for (let l = before + 1; l <= level; l++) {
        try { this.tele('track_level', { who: vid, track, level: l, why: why || null }); } catch (e) { warn('tele track_level', e); }
      }
      const vname = () => { try { return this.displayName ? this.displayName(vid) : 'Someone'; } catch (e) { return 'Someone'; } };
      // SKILLS: human competence from the work itself — no System needed.
      // Only at the levels tracks.json names (skillLevels): the old kits gave
      // ONE thing per threshold; skills on alternate levels keep the
      // villager's total close to that while the magic follows the shared kit.
      const skills = (T.skills || {})[track] || [];
      const skillLevels = T.skillLevels || [1, 2, 3, 4, 5];
      while (x.skilled[track] < level) {
        x.skilled[track]++;
        if (skillLevels.indexOf(x.skilled[track]) < 0) continue;
        const next = skills.find(id => !this.npcKnowsSkill(vid, this.abilitySkillId(id) || id));
        if (!next) continue; // list exhausted: the work still counts
        this.npcLearnSkill(vid, next);
        const nm = ((this.abilityDef && this.abilityDef(next)) || {}).name || next;
        try { this.journalNote && this.journalNote('village', 'skill', `${vname()} got good at ${nm} — ${x[track]} ${(T.nouns || {})[track] || track}.`); } catch (e) { warn('journalNote skill', e); }
      }
      if (!this.state.systemArrived) return x[track]; // XP accrues; the System isn't watching yet
      const kit = (T.kits || {})[track] || [];
      let granted = x.granted[track] || 0;
      while (granted < level) {
        const held = ((this.state.village || {}).npcAbilities || {})[vid] || [];
        if (held.length >= (T.maxAbilities || 6)) break; // six slots, same as you
        // FUSION SINGULARITY (Steve 2026-10-12): one reactor per world.
        const next = kit.find(id => held.indexOf(id) < 0 && !(id === 'fusion_reactor' && this.state.fusionReactorHolder));
        if (!next) break; // kit exhausted: natural saturation, XP keeps accruing
        if (this.npcGrantAbility(vid, next) === false) break; // refused — never narrate a grant that didn't happen
        granted++;
        const aname = ((this.data.abilities || []).find(a => a.id === next) || {}).name || next;
        const noun = (T.nouns || {})[track] || track;
        const label = (T.labels || {})[track] || track;
        this.say(`◈ THE SYSTEM has been watching ${vname()} — ${x[track]} ${noun}. ${label} ${granted}: it offers ${aname}. Earned, not given. (${next}: villager System grant)`);
        try { this.journalNote && this.journalNote('system', 'grant', `The System granted ${vname()} ${aname} (${next}) for ${x[track]} ${noun}.`); } catch (e2) { warn('journalNote grant', e2); }
        try { this.tele('villager_grant', { vid, ability: next, track, xp: x[track] }); } catch (e3) { warn('tele villager_grant', e3); }
      }
      x.granted[track] = granted;
      return x[track];
    },

    // --- villager skills: the minimal store (v.npcSkills[vid] = [skillId]) ---
    npcKnowsSkill(vid, skillId) {
      try { return ((((this.state.village || {}).npcSkills) || {})[vid] || []).indexOf(skillId) >= 0; }
      catch (e) { warn('npcKnowsSkill', e); return false; }
    },
    npcLearnSkill(vid, abilityId) {
      const v = this.state.village; v.npcSkills = v.npcSkills || {};
      const list = v.npcSkills[vid] = v.npcSkills[vid] || [];
      const sid = (this.abilitySkillId && this.abilitySkillId(abilityId)) || abilityId;
      if (list.indexOf(sid) >= 0) return false;
      list.push(sid);
      try { this.tele('villager_skill', { vid, skill: sid, via: abilityId }); } catch (e) { warn('tele villager_skill', e); }
      // a new competence can complete a godhood pool (pools hold skills)
      try { this.checkVillagerGodhoodAscension && this.checkVillagerGodhoodAscension(vid); } catch (e2) { warn('godhood check', e2); }
      return true;
    },
    // npcOwnedIds(vid): every ability id that is mechanically theirs — magic
    // in the slots plus skill-lane abilities carried by skills they know.
    // The villager twin of ownedAbilityIds.
    npcOwnedIds(vid) {
      const v = this.state.village || {};
      const ids = new Set(((v.npcAbilities || {})[vid] || []));
      const sk = (v.npcSkills || {})[vid] || [];
      if (sk.length) {
        for (const a of (this.data.abilities || [])) {
          if (a && a.lane === 'skill' && sk.indexOf(a.skillId || a.id) >= 0) ids.add(a.id);
        }
      }
      return Array.from(ids);
    },
    // migrateNpcLanes: old saves granted skill-lane ids into villager ability
    // slots. Move them to villager skills (frees the slot). Idempotent.
    migrateNpcLanes() {
      let moved = 0;
      try {
        const v = (this.state && this.state.village) || {};
        const m = v.npcAbilities || {};
        for (const vid of Object.keys(m)) {
          const keep = [];
          for (const id of (m[vid] || [])) {
            if (this.isSkillLane && this.isSkillLane(id)) { this.npcLearnSkill(vid, id); moved++; }
            else keep.push(id);
          }
          m[vid] = keep;
        }
      } catch (e) { warn('migrateNpcLanes', e); }
      return moved;
    },

    // --- player deeds ---
    // noteDeed(deedId, trackOverride): the deed table in tracks.json maps a
    // deed to {track, n, perDay}. Chores are capped per day: decisions, not grinding.
    noteDeed(deedId, trackOverride) {
      try {
        const T = this.trackData();
        const d = (T.deeds || {})[deedId];
        if (!d) { warn('unknown deed "' + deedId + '"'); return 0; }
        const s = this.state.scholar;
        if (!s || this.over) return 0;
        if (d.perDay) {
          const day = s.day || 0;
          s.deedDay = s.deedDay || {};
          const rec = s.deedDay[deedId];
          if (!rec || rec.day !== day) s.deedDay[deedId] = { day, n: 0 };
          if (s.deedDay[deedId].n >= d.perDay) return 0;
          s.deedDay[deedId].n++;
        }
        return this.gainTrackXP('player', trackOverride || d.track, d.n || 1, deedId);
      } catch (e) { warn('noteDeed', e); return 0; }
    },

    // convertDeedToTrackXP(key, abilityId): a trial/practice deed that used to
    // GRANT a magic ability credits its track once instead. The power comes
    // from the level-up sheet. Returns the track credited, or null if spent.
    convertDeedToTrackXP(key, abilityId) {
      try {
        const T = this.trackData();
        const s = this.state.scholar;
        s.deedConverted = s.deedConverted || {};
        if (s.deedConverted[key]) return null;
        let conv = (T.deedConversions || {})[key];
        if (!conv) {
          const track = T.tracks.find(t => ((T.kits || {})[t] || []).indexOf(abilityId) >= 0) || 'strange';
          conv = { track, n: 3 };
        }
        s.deedConverted[key] = (s.day || 0) || true;
        this.gainTrackXP('player', conv.track, conv.n || 3, 'deed:' + key);
        return conv.track;
      } catch (e) { warn('convertDeedToTrackXP', e); return null; }
    },

    // --- the player's level-up sheet ---
    levelUpOffers(track) {
      const T = this.trackData();
      const owned = new Set(this.ownedAbilityIds ? this.ownedAbilityIds() : []);
      const all = this.data.abilities || [];
      const out = [];
      for (const id of ((T.kits || {})[track] || [])) {
        if (owned.has(id)) continue;
        if (id === 'fusion_reactor' && this.state.fusionReactorHolder) continue;
        const def = all.find(a => a.id === id);
        if (!def || def.lane === 'skill') continue;
        out.push(def);
        if (out.length >= (T.offerSize || 3)) break;
      }
      return out;
    },

    pumpLevelUps() {
      try {
        const s = this.state.scholar;
        if (!s || !this.state.systemArrived || this.over) return false;
        if ((s.abilityChoices || []).length) return false; // a sheet is open: the level-up waits, never drops
        const q = s.levelUpQueue || [];
        const T = this.trackData();
        while (q.length) {
          const lu = q.shift();
          const label = (T.labels || {})[lu.track] || lu.track;
          const offers = this.levelUpOffers(lu.track);
          if (!offers.length) {
            this.sysSay(`◈ ${label.toUpperCase()} ${lu.level}. "We have nothing left on that shelf for you. You've taken it all. Impressive. Greedy, but impressive."`);
            try { this.tele('track_level_empty', { track: lu.track, level: lu.level }); } catch (e) { warn('tele', e); }
            continue;
          }
          s.abilityChoices = offers.map(d => ({ id: d.id, name: d.name, description: d.description, flavor: d.flavor, src: 'level_up:' + lu.track, level: lu.level }));
          this.trackStat('offered');
          const full = (s.abilities || []).length >= this.abilitySlots();
          const noun = (T.nouns || {})[lu.track] || lu.track;
          this.sysSay(`◈ LEVEL UP — ${label.toUpperCase()} ${lu.level}. "We've been counting: ${lu.xp || ''} ${noun}. Pick one.${full ? ' You\'re full — whatever you take REPLACES something you hold. Or keep what you have.' : ''}"`);
          return true;
        }
        return false;
      } catch (e) { warn('pumpLevelUps', e); return false; }
    },

    // trackStat(k): level-up sheet counters on the scholar (offered / picked /
    // replaced / kept) — what the sims read, and what a run actually chose.
    trackStat(k) {
      const s = this.state.scholar;
      if (!s) return;
      s.trackStats = s.trackStats || {};
      s.trackStats[k] = (s.trackStats[k] || 0) + 1;
    },

    isLevelUpSheet() {
      const ch = ((this.state.scholar || {}).abilityChoices) || [];
      return !!(ch.length && String(ch[0].src || '').indexOf('level_up:') === 0);
    },

    keepAbilities() {
      const s = this.state.scholar;
      if (!this.isLevelUpSheet()) return false;
      const track = String(s.abilityChoices[0].src).slice('level_up:'.length);
      s.abilityChoices = null;
      this.trackStat('kept');
      this.say('You keep what you have. The offer passes — the System makes a note of your loyalty, or your stubbornness.');
      try { this.tele('level_up_kept', { track }); } catch (e) { warn('tele', e); }
      this.pumpLevelUps();
      return true;
    },

    trackSummary() {
      const T = this.trackData();
      const tr = this.playerTracks();
      const th = this.trackThresholds('player');
      return T.tracks.map(t => {
        const rec = tr[t];
        const lvl = this.trackLevelFor(rec.xp, 'player');
        return { track: t, label: (T.labels || {})[t] || t, icon: (T.icons || {})[t] || '', level: lvl, max: th.length, xp: rec.xp, prev: lvl > 0 ? th[lvl - 1] : 0, next: lvl < th.length ? th[lvl] : null };
      });
    },
  };

  Object.assign(Game, methods);

  // Old saves: skill-lane ids out of villager slots on load.
  const _load = Game.load;
  if (typeof _load === 'function') {
    Game.load = function () {
      const r = _load.apply(this, arguments);
      try { if (r !== false) this.migrateNpcLanes(); } catch (e) { warn('load migrate', e); }
      return r;
    };
  }
})();
