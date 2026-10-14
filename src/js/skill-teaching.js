// @ontology
// system: skill-teaching
// description: ONE teaching mechanic for human skills, the same for everyone (Steve 2026-10-14: "Villagers and players should get the same XP, when in doubt we treat them the same way." / "Human skills should be learnable before the system shows up."). A person who knows a skill can teach it to a person who doesn't: villager to player, player to villager, villager to villager. The learner gets the skill at L1 (it levels by use as before). It costs a held conversation (the player) or the day's lesson (a villager pair), works before the System, and credits the teacher's 'teaching' deed. Villagers know their past trade from day one (occupation 'granted' plus knowledge backgrounds, the player's own two background routes). Villagers choose lessons that fit their target build (villager-build.js). The player also learns the track skill a villager learns at the same track levels (tracks.json skillLevels).
// provides:
//   - skillTeachable(skillId) -> true unless knowledge.json flags the skill teachable:false
//   - skillsKnownBy(who) -> skill ids; who = 'player' or a villager id (the bearer's id = the player)
//   - personKnowsSkill(who, skillId) -> boolean
//   - npcSeedSkills(vid) -> villager's background skills from their old life (idempotent)
//   - teachableSkills(teacher, learner) -> skill ids the teacher can teach the learner now
//   - canTeachSkill(teacher, learner, skillId) -> {ok, why}
//   - teachSkill(teacher, learner, skillId, opts) -> true if the learner learned it (L1)
//   - skillFit(vid, skillId) -> how well a skill fits a villager's target build and tracks
//   - villagerSkillLessonsDay() -> count of villager-to-villager lessons today (daily tick)
//   - convoSkillChoices(vid) -> conversation menu choices ("Teach me X?" / "I could show you X.")
//   - convoSkillLesson(vid, choiceId) -> {line, you} for a skill_learn:/skill_teach: choice
//   - playerTrackSkills(track, rec) -> name of the track skill the player just learned, or null
// rules:
//   - one_mechanic: villager->player, player->villager and villager->villager lessons all go through teachSkill (code: teachSkill)
//   - pre_system: no systemArrived check anywhere in teaching (code: canTeachSkill)
//   - learner_starts_at_l1: a lesson teaches L1; use deepens it (code: teachSkill, game.js gainSkillLaneXP)
//   - lesson_costs_time: one lesson per learner per day and one per conversation; the player's lesson spends 3 action ticks like teachPlant (code: canTeachSkill, convoSkillLesson)
//   - same_gates_both_ways: trust 15+ and a shared language, whichever side teaches (code: canTeachSkill)
//   - data_first: every knowledge skill is teachable unless flagged teachable:false (code: skillTeachable)
//   - track_skill_parity: the player learns the next unknown track skill at tracks.json skillLevels, like a villager (code: playerTrackSkills, tracks.js _playerTrackXP)
// consumes:
//   - Game.data.knowledge, Game.data.abilities, Game.data.synergies, Game.data.tracks, Game.data.characterGen
//   - state.codex.skills, state.village.npcSkills, state.village.trust, state.village.away
//   - learnSkill(skillId, level, via), npcLearnSkill(vid, id), npcKnowsSkill(vid, sid), creditDeed(who, deedId), villagerTargetBuild(vid), villagerNeedTrack(vid)
(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;
  // dayRoll(id, day): a stable 0..1 roll per villager per day. Lessons draw
  // no shared random numbers, so adding them leaves every other seeded roll
  // in a run where it was (sims stay comparable).
  function dayRoll(id, day) {
    let h = 2166136261;
    const str = String(id) + ':' + day;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return ((h >>> 0) % 10000) / 10000;
  }

  let _warned = {};
  function warn(msg, e) {
    // Reported, never swallowed (AGENTS.md rule 6); once per message so sims can count.
    const k = String(msg);
    if (_warned[k]) return;
    _warned[k] = true;
    console.warn('[skill-teaching] ' + msg + (e ? ': ' + (e && e.message || e) : ''));
  }

  const TRUST_GATE = 15;      // the snare lesson's regard gate (villager-agency.js)
  const LESSON_TICKS = 3;     // teachPlant: "a real lesson takes 3 ticks"
  const VILLAGER_DAILY_CHANCE = 0.15; // a villager who wants a fitting skill and has a teacher at home
  const FIT_MIN = 1;

  const isPlayerWho = (G, who) => who === 'player' || (G.villagerId && who === G.villagerId);

  // skill-lane abilities carried by each skill id, and their synergy partners
  let _carry = null, _carrySrc = null;
  function carriers(G) {
    const abil = (G.data && G.data.abilities) || [];
    if (_carry && _carrySrc === abil) return _carry;
    _carry = { bySkill: {}, partners: {} };
    _carrySrc = abil;
    for (const a of abil) {
      if (!a || a.lane !== 'skill') continue;
      const sid = a.skillId || a.id;
      (_carry.bySkill[sid] = _carry.bySkill[sid] || []).push(a);
    }
    for (const syn of ((G.data && G.data.synergies) || [])) {
      const legs = ((syn && syn.requires) || []).map(l => String(l).split(':').pop());
      for (const l of legs) (_carry.partners[l] = _carry.partners[l] || []).push(legs.filter(x => x !== l));
    }
    return _carry;
  }

  const methods = {

    skillTeachable(skillId) {
      const k = ((this.data && this.data.knowledge) || []).find(x => x.id === skillId);
      return !!(k && k.teachable !== false);
    },

    skillsKnownBy(who) {
      try {
        if (isPlayerWho(this, who)) {
          const sk = ((this.state.codex || {}).skills) || {};
          return Object.keys(sk).filter(id => ((sk[id] || {}).level || 0) >= 1);
        }
        this.npcSeedSkills(who);
        return ((((this.state.village || {}).npcSkills) || {})[who] || []).slice();
      } catch (e) { warn('skillsKnownBy', e); return []; }
    },

    personKnowsSkill(who, skillId) {
      return this.skillsKnownBy(who).indexOf(skillId) >= 0;
    },

    // npcSeedSkills(vid): PARITY — the player starts knowing their old
    // life (grantOccupationSkills + grantBackgroundKnowledge); so does a
    // villager. Same two data routes, stored as villager skills.
    npcSeedSkills(vid) {
      try {
        if (!vid || isPlayerWho(this, vid)) return 0;
        const v = this.state.village || {};
        v.npcSkillsSeeded = v.npcSkillsSeeded || {};
        if (v.npcSkillsSeeded[vid]) return 0;
        const p = this.getPerson ? this.getPerson(vid) : null;
        if (!p) return 0;
        v.npcSkillsSeeded[vid] = true;
        let n = 0;
        const occ = (((this.data.characterGen || {}).occupations) || []).find(o => o.id === p.occupationId);
        for (const id of ((occ && occ.granted) || [])) {
          if (this.abilitySkillId && this.abilitySkillId(id) && this.npcLearnSkill(vid, id)) n++;
        }
        const job = String(p.formerOccupation || '').toLowerCase();
        if (job) {
          for (const k of (this.data.knowledge || [])) {
            const bgs = (k.backgrounds || []).map(b => String(b).toLowerCase());
            if (bgs.some(bg => job.includes(bg)) && this.npcLearnSkill(vid, k.id)) n++;
          }
        }
        return n;
      } catch (e) { warn('npcSeedSkills', e); return 0; }
    },

    _skillAlive(who) {
      if (isPlayerWho(this, who)) return !this.over;
      const v = this.state.village || {};
      if ((v.roster || []).indexOf(who) < 0) return false;
      const vp = this.vpOf ? this.vpOf(who) : null;
      return !(vp && vp.dead);
    },

    // shared language between two people (the player's commLevel, or two
    // villagers' tongues). A skill is shown with hands, but explained in words.
    _skillCanTalk(a, b) {
      try {
        const pa = isPlayerWho(this, a), pb = isPlayerWho(this, b);
        if (pa || pb) return this.commLevel(pa ? b : a).level !== 'none';
        const la = this.levelsOf(this.npcLangs(a)), lb = this.levelsOf(this.npcLangs(b));
        return Object.keys(la).some(id => (la[id] || 0) >= 1 && (lb[id] || 0) >= 1);
      } catch (e) { warn('language check', e); return true; }
    },

    teachableSkills(teacher, learner) {
      const theirs = this.skillsKnownBy(learner);
      return this.skillsKnownBy(teacher).filter(sid => theirs.indexOf(sid) < 0 && this.skillTeachable(sid));
    },

    canTeachSkill(teacher, learner, skillId) {
      if (!teacher || !learner || teacher === learner) return { ok: false, why: 'nobody' };
      if (isPlayerWho(this, teacher) && isPlayerWho(this, learner)) return { ok: false, why: 'nobody' };
      if (!this._skillAlive(teacher) || !this._skillAlive(learner)) return { ok: false, why: 'gone' };
      if (!this.skillTeachable(skillId)) return { ok: false, why: 'unteachable' };
      if (!this.personKnowsSkill(teacher, skillId)) return { ok: false, why: 'teacher' };
      if (this.personKnowsSkill(learner, skillId)) return { ok: false, why: 'known' };
      const v = this.state.village || {};
      const day = (this.state.scholar || {}).day || 0;
      if (((v.skillLessonDay || {})[learner]) === day) return { ok: false, why: 'today' };
      // the same regard gate whichever way the lesson runs: the villager in
      // the pair has to trust the bearer (villager pairs: housemates, no gate)
      const other = isPlayerWho(this, teacher) ? learner : (isPlayerWho(this, learner) ? teacher : null);
      if (other) {
        const t = (v.trust || {})[other];
        if ((t === undefined ? 10 : t) < TRUST_GATE) return { ok: false, why: 'trust' };
      }
      if (!this._skillCanTalk(teacher, learner)) return { ok: false, why: 'words' };
      return { ok: true };
    },

    // teachSkill(teacher, learner, skillId, opts): THE lesson. Learner gets
    // L1. The teacher earns the 'teaching' deed (same n, same cap for all).
    teachSkill(teacher, learner, skillId, opts) {
      opts = opts || {};
      try {
        const chk = this.canTeachSkill(teacher, learner, skillId);
        if (!chk.ok) return false;
        const v = this.state.village;
        const day = (this.state.scholar || {}).day || 0;
        const k = (this.data.knowledge || []).find(x => x.id === skillId) || {};
        let ok;
        if (isPlayerWho(this, learner)) {
          ok = this.learnSkill(skillId, 1, 'taught');
          if (ok) { try { this.recomputeActiveSynergies(); } catch (e) { warn('synergy recompute', e); } }
        } else {
          ok = this.npcLearnSkill(learner, skillId);
        }
        if (!ok) return false;
        v.skillLessonDay = v.skillLessonDay || {};
        v.skillLessonDay[learner] = day;
        if (!isPlayerWho(this, teacher)) v.skillLessonDay[teacher + ':taught'] = day;
        v.skillLessons = v.skillLessons || [];
        v.skillLessons.push({ day, teacher: isPlayerWho(this, teacher) ? 'player' : teacher, learner: isPlayerWho(this, learner) ? 'player' : learner, skill: skillId });
        if (v.skillLessons.length > 200) v.skillLessons.splice(0, v.skillLessons.length - 200);
        try { if (this.creditDeed) this.creditDeed(isPlayerWho(this, teacher) ? 'player' : teacher, 'teaching'); } catch (e) { warn('teaching deed', e); }
        try { this.tele('skill_lesson', { teacher: isPlayerWho(this, teacher) ? 'player' : teacher, learner: isPlayerWho(this, learner) ? 'player' : learner, skill: skillId, via: opts.via || null }); } catch (e) { warn('tele skill_lesson', e); }
        if (!isPlayerWho(this, teacher) && !isPlayerWho(this, learner)) {
          const nm = (id) => { try { return this.firstRef ? this.firstRef(id) : this.displayName(id); } catch (e) { return 'Someone'; } };
          try { this.journalNote && this.journalNote('village', 'skill-lesson:' + learner + ':' + skillId, `${nm(teacher)} taught ${nm(learner)} ${k.name || skillId}.`); } catch (e) { warn('journalNote', e); }
        }
        return true;
      } catch (e) { warn('teachSkill', e); return false; }
    },

    // skillFit(vid, skillId): does this skill serve what they're becoming?
    // +1 its track is the one their build needs, +1 it's their strongest
    // track, +1 per build-around path shared with their build (max 2),
    // +2 per synergy it completes a leg of. Cheap; read daily.
    skillFit(vid, skillId) {
      try {
        const C = carriers(this);
        const abs = C.bySkill[skillId] || [];
        if (!abs.length) return 0.25; // know-how with no ability attached: nice, not a plan
        const T = this.trackData ? this.trackData() : {};
        const need = this.villagerNeedTrack ? this.villagerNeedTrack(vid) : null;
        const x = this.npcXp ? this.npcXp(vid) : {};
        let top = null, topXp = 0;
        for (const t of (T.tracks || [])) if ((x[t] || 0) > topXp) { topXp = x[t]; top = t; }
        const build = new Set((this.villagerTargetBuild ? this.villagerTargetBuild(vid) : []).concat(this.npcOwnedIds ? this.npcOwnedIds(vid) : []));
        const paths = new Set();
        for (const id of build) { const d = this.abilityDef ? this.abilityDef(id) : null; for (const p of ((d && d.paths) || [])) paths.add(p); }
        let best = 0;
        for (const a of abs) {
          let f = 0;
          const track = (T.tracks || []).find(t => (((T.skills || {})[t]) || []).indexOf(a.id) >= 0) || null;
          if (track && track === need) f += 1;
          if (track && track === top) f += 1;
          f += Math.min(2, (a.paths || []).filter(p => paths.has(p)).length);
          for (const others of (C.partners[a.id] || [])) if (others.length && others.some(o => build.has(o))) f += 2;
          if (f > best) best = f;
        }
        return best;
      } catch (e) { warn('skillFit', e); return 0; }
    },

    // villagerSkillLessonsDay(): villager agency. Each villager at home
    // looks for the best-fitting skill a housemate can teach them; if it
    // fits their build, they spend the day's lesson on it (some days).
    // One lesson per learner and per teacher a day.
    villagerSkillLessonsDay() {
      let n = 0;
      try {
        const v = this.state.village || {};
        const home = (v.roster || []).filter(id => id !== this.villagerId && this._skillAlive(id) && !((v.away || {})[id]));
        for (const id of home) this.npcSeedSkills(id);
        if (home.length < 2) return 0;
        const busy = new Set();
        const day = (this.state.scholar || {}).day || 0;
        for (const learner of home) {
          if (busy.has(learner)) continue;
          let best = null;
          for (const teacher of home) {
            if (teacher === learner || busy.has(teacher)) continue;
            for (const sid of this.teachableSkills(teacher, learner)) {
              const fit = this.skillFit(learner, sid);
              if (fit >= FIT_MIN && (!best || fit > best.fit)) best = { teacher, sid, fit };
            }
          }
          if (!best || dayRoll(learner, day) >= VILLAGER_DAILY_CHANCE) continue;
          if (this.teachSkill(best.teacher, learner, best.sid, { via: 'villager' })) {
            busy.add(learner); busy.add(best.teacher); n++;
          }
        }
      } catch (e) { warn('villagerSkillLessonsDay', e); }
      return n;
    },

    // --- the player's side: one line per option in the conversation ---
    _skillName(sid) {
      const k = (this.data.knowledge || []).find(x => x.id === sid);
      return (k && k.name) || sid;
    },
    // the skill to offer: ones that carry an ability first, then data order
    _skillPick(list, scoreFn) {
      const C = carriers(this);
      const order = (this.data.knowledge || []).map(k => k.id);
      const sc = (sid) => (scoreFn ? scoreFn(sid) : 0) + ((C.bySkill[sid] || []).length ? 1 : 0);
      return list.slice().sort((a, b) => sc(b) - sc(a) || order.indexOf(a) - order.indexOf(b))[0] || null;
    },
    convoSkillChoices(vid) {
      const out = [];
      try {
        const c = this.convoGet ? this.convoGet(vid) : {};
        if (c && c.skillLessonDone) return out;
        const learn = this.teachableSkills(vid, 'player').filter(sid => this.canTeachSkill(vid, 'player', sid).ok);
        const sl = this._skillPick(learn);
        if (sl) out.push({ id: 'skill_learn:' + sl, label: `"Teach me ${this._skillName(sl)}?"` });
        const give = this.teachableSkills('player', vid).filter(sid => this.canTeachSkill('player', vid, sid).ok);
        const sg = this._skillPick(give, sid => this.skillFit(vid, sid));
        if (sg) out.push({ id: 'skill_teach:' + sg, label: `"I could show you ${this._skillName(sg)}."` });
      } catch (e) { warn('convoSkillChoices', e); }
      return out;
    },
    convoSkillLesson(vid, choiceId) {
      const learnMode = choiceId.indexOf('skill_learn:') === 0;
      const sid = choiceId.slice(choiceId.indexOf(':') + 1);
      const name = this._skillName(sid);
      const you = learnMode ? `"Teach me ${name}?"` : `"I could show you ${name}."`;
      const c = this.convoGet ? this.convoGet(vid) : {};
      const ok = learnMode ? this.teachSkill(vid, 'player', sid, { via: 'conversation' }) : this.teachSkill('player', vid, sid, { via: 'conversation' });
      if (!ok) return { line: '"Not now. Another time."', you };
      if (c) c.skillLessonDone = true;
      try { this.tickAction(LESSON_TICKS); } catch (e) { warn('lesson ticks', e); }
      try { this.setEngaged(vid, 2); } catch (e) { warn('lesson engaged', e); }
      if (learnMode) {
        try { this.bumpTrust(vid, 1, 'taught you ' + name); } catch (e) { warn('trust', e); }
        return { line: `They show you ${name} — slowly, then again, then they watch you do it badly until you do it less badly. "That's the start. Use it and it gets better."`, you };
      }
      try { this.bumpTrust(vid, 1, 'you taught them ' + name); } catch (e) { warn('trust', e); }
      return { line: `You walk them through ${name}, then let them try. Clumsy, then less so. "Huh. I can see how that'd keep me alive."`, you };
    },

    // playerTrackSkills(track, rec): PARITY with _villagerTrackXP. At the
    // levels tracks.json names (skillLevels), the player learns the next
    // track skill they don't know. rec.skilled counts levels already
    // checked, so old saves catch up once (as a villager's do).
    playerTrackSkills(track, rec) {
      let learned = null;
      try {
        const T = this.trackData();
        const skills = (T.skills || {})[track] || [];
        const skillLevels = T.skillLevels || [1, 2, 3, 4, 5];
        rec.skilled = rec.skilled || 0;
        while (rec.skilled < rec.level) {
          rec.skilled++;
          if (skillLevels.indexOf(rec.skilled) < 0) continue;
          const next = skills.find(id => { const sid = this.abilitySkillId(id) || id; return !this.personKnowsSkill('player', sid); });
          if (!next) continue;
          if (!this.teachAbilitySkill(next, 1, 'track')) continue;
          const nm = ((this.abilityDef && this.abilityDef(next)) || {}).name || next;
          const label = (T.labels || {})[track] || track;
          this.say(`📈 ${label} ${rec.skilled}: the work taught you ${nm}.`);
          const q = (this.state.scholar || {}).levelUpQueue || [];
          const lu = q.find(e => e && e.track === track && e.level === rec.skilled);
          if (lu) lu.skill = nm;
          learned = nm;
        }
      } catch (e) { warn('playerTrackSkills', e); }
      return learned;
    },
  };

  Object.assign(Game, methods);
})();
