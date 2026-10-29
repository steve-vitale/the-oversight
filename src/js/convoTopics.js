// @ontology
// system: conversation-topics
// description: Generated conversation topics. Every villager is a unique person
//   who changes during a run — so topics are GENERATED from identity (backstory,
//   fears, hopes, occupation, temperament) and run events (losses, betrayals,
//   threats), never a fixed list. A topic pool that doesn't know the speaker
//   is just trivia.
// provides:
//   - topic2Has(topic)
//   - topic2Ask(vid, topic)
//   - topic2HasMore(vid)
//   - topic2Beat(vid)
//   - topic2Asks(vid)
//   - topic2Label(vid, topic)
//   - topic2MoreLabel(vid)
//   - topic2AskLabel(vid, topic)
//   - topic2Deep(topic)
//   - topic2SubjectOpts(vid)
// rules:
//   - generated_not_pooled: topic lines are composed from villager identity + run state (code: convoTopics.js, t2gen_*)
//   - change_over_run: re-asking after events acknowledges the change (code: convoTopics.js, topic2Ask t2snap)
//   - event_topic: 'lately' appears only while a run event is live (code: convoTopics.js, t2LatelyEvent)
//   - no_repeat: openers and beats route through convoPick (code: convoTopics.js, topic2Ask/topic2Beat)
// consumes:
//   - Game (characterGen.topicPack labels)
//   - village.villagers
// ============ GENERATED CONVERSATION TOPICS ============
// Steve 2026-10-06 (unique-person law): topics generate from WHO this villager
// is and WHAT they've lived through this run. Self-attaching module, same
// pattern as conversation.js. Integration points in conversation.js are all
// marked "TOPIC PACK".

(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  const methods = {
    // ---------- identity helpers ----------
    t2pack() { return (this.data.characterGen || {}).topicPack || {}; },
    t2pers(vp) { return (vp && vp.personality) || {}; },
    t2fear(vp) { return (vp && (vp.secretFear || vp.fear)) || 'being forgotten'; },
    t2cap(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); },
    t2trust(vid) { return (this.state.village.trust || {})[vid] || 10; },
    t2band(vid) {
      const t = this.t2trust(vid);
      return t >= 75 ? 'devoted' : t >= 50 ? 'close' : t >= 30 ? 'warming' : 'wary';
    },
    t2mem(vid) { return ((this.state.village.memory || {})[vid]) || []; },
    t2pro(vp, vid) {
      if (vp && vp.pro) return vp.pro;
      try { return ['she', 'he', 'they'][this._hashStr(vid || 'x') % 3]; }
      catch (e) { return 'they'; }
    },
    // t2fill: fillTalkLine plus identity slots. Every generated line passes
    // through here, so {fear}/{hope}/{quirk}/{habit} always resolve to THIS
    // villager's truth — never another speaker's.
    t2fill(line, vp, vid) {
      let s;
      try { s = this.fillTalkLine(line, vp || {}); } catch (e) { s = String(line); }
      const p = this.t2pers(vp);
      const pro = this.t2pro(vp, vid);
      // TEXT MODULE (rogue P0-2/P0-7 2026-10-22): pronoun bundle + shared
      // verb-conjugation pipe. No current t2 line puts a verb after {They},
      // so the pipe is inert today and future-proof; {Their} completes the
      // pronoun set the leak guard defers.
      const pb = Text.proBundle(pro);
      // Habits/quirks are stored third-person ("checks the treeline"); the
      // {habitI}/{quirkI} slots convert to first-person for "I ..." frames.
      const toFirst = (x) => String(x || '')
        .replace(/^(never|always|still|just)\s+([a-z]+?)s\b/, '$1 $2')
        .replace(/^does\b/, 'do').replace(/^has\b/, 'have')
        .replace(/^([a-z]+?)s\b/, '$1');
      const habitI = toFirst(p.habit || 'keeping busy');
      const quirkI = toFirst(p.quirk || 'a habit I don\'t talk about');
      return Text.conjVerbSlots(s, pro)
        .replaceAll('{fear}', this.t2fear(vp))
        .replaceAll('{Fear}', this.t2cap(this.t2fear(vp)))
        .replaceAll('{hope}', p.hope || 'something better')
        .replaceAll('{quirk}', p.quirk || 'a habit I don\'t talk about')
        .replaceAll('{Quirk}', this.t2cap(p.quirk || 'a habit I don\'t talk about'))
        .replaceAll('{quirkI}', quirkI)
        .replaceAll('{habit}', p.habit || 'keeping busy')
        .replaceAll('{habitI}', habitI)
        .replaceAll('{They}', pb.Sub).replaceAll('{they}', pb.sub)
        .replaceAll('{them}', pb.obj).replaceAll('{their}', pb.poss)
        .replaceAll('{Their}', pb.Poss);
    },
    t2pick(vid, key, cands) {
      const pool = (cands || []).filter(Boolean);
      if (!pool.length) return null;
      // NO-REPEAT (journey-social r26 2026-10-18): when the ledger has seen
      // every candidate, return null so the caller fires its honest
      // exhausted-pool path (topic2Ask's "I've told you everything", the
      // beat's null). The old `|| pool[0]` re-served the verbatim line —
      // transcript-caught: lately 'gratitude' parroted seconds apart in one
      // conversation (s1902-deep-1-Asiri).
      return this.convoPick(vid, key, pool);
    },
    // Event clock: advances when the run changes. Re-asking a topic after the
    // clock moves gets an honest "it's different now" — people change.
    t2clock(vid) {
      const v = this.state.village;
      const day = (this.state.scholar || {}).day || 0;
      return [this.t2band(vid), day, (v.exiles || []).length,
        (v.grief || 0) > 0 ? 1 : 0, this.t2mem(vid).length].join('|');
    },
    t2changeLine() {
      // Ack lines are delivery, not content — cycling them is fine, so the
      // fallback lives here explicitly (t2pick returns null on exhaustion).
      return this.t2pick('__change', 't2change', [
        '"You asked me that before. It\'s a different question now."',
        '"Last time things were different. They always are."',
        '"Huh. I answered that once — back when the answer was simpler."',
      ]) || '"You asked me that before. It\'s a different question now."';
    },

    // ---------- registry ----------
    // Gate mirrors the main system's depth gating: intimacy is earned.
    t2defs() {
      return [
        { id: 'lately', event: true },
        { id: 'you', minTrust: 30, deep: true },
        { id: 'fears', minTrust: 25, deep: true },
        { id: 'others', minTrust: 20 },
        { id: 'neighbors', minTrust: 15 },
        { id: 'advice', minTrust: 20 },
        { id: 'oldworld', minTrust: 15 },
        { id: 'skills', minTrust: 0 },
        { id: 'systemtake', system: true },
        { id: 'loved', minTrust: 40, deep: true },
      ];
    },
    topic2Has(topic) {
      return this.t2defs().some(d => d.id === topic);
    },
    topic2Deep(topic) {
      const d = this.t2defs().find(x => x.id === topic);
      return !!(d && d.deep);
    },
    t2gate(vid, def) {
      if (def.event) return !!this.t2LatelyEvent(vid);
      if (def.system) return !!this.state.systemArrived;
      const trust = this.t2trust(vid);
      // TRUST + TIME, not convo count (dialog rethink Phase 1, Steve
      // 2026-10-08): the count-bypasses are dead.
      const days = this.relDays ? this.relDays(vid) : 0;
      const mt = def.minTrust || 0;
      if (mt <= 0) return true;
      if (mt >= 40) return trust >= 40 || days >= 10;
      if (mt >= 30) return trust >= 30 || days >= 7;
      return trust >= mt || days >= 4;
    },

    // ---------- labels ----------
    topic2Label(vid, topic) {
      const vs = (this.t2pack().labels || {})[topic] || [topic];
      let h = 0;
      try { h = this._hashStr(vid + ':t2:' + topic); } catch (e) {}
      return vs[Math.abs(h) % vs.length];
    },
    topic2MoreLabel(vid) {
      const c = this.convoGet(vid);
      const vs = (this.t2pack().moreLabels || {})[c.thread] || ['"Tell me more."'];
      let h = 0;
      try { h = this._hashStr(vid + ':t2more:' + (c.thread || '')); } catch (e) {}
      return vs[Math.abs(h) % vs.length];
    },
    topic2AskLabel(vid, topic) {
      return this.topic2Has(topic) ? this.topic2Label(vid, topic) : this.convoLabel(vid, topic);
    },

    // ---------- ask / depth ----------
    topic2Ask(vid, topic) {
      // Open a generated topic. convoAskTopic already pushed askedTopics.
      const c = this.convoGet(vid);
      const gen = this['t2gen_' + topic];
      const cands = gen ? gen.call(this, vid) : [];
      let line = this.t2pick(vid, 't2:' + topic, cands);
      if (!line) {
        const cg = (this.data.characterGen || {}).convo || {};
        return this.convoPickCycle(vid, 'exh', cg.exhausted || ['"I\'ve told you everything I know about that."']);
      }
      line = this.t2fill(line, this.vpOf(vid), vid);
      // Change acknowledgment: the same question, a different run.
      c.t2snap = c.t2snap || {};
      const now = this.t2clock(vid);
      const prev = c.t2snap[topic];
      c.t2snap[topic] = now;
      if (prev && prev !== now) line = this.t2fill(this.t2changeLine(), this.vpOf(vid), vid) + ' ' + line;
      c.thread = topic; c.depth = 1;
      return line;
    },
    topic2HasMore(vid) {
      const c = this.convoGet(vid);
      const said = (c.said || {})['t2:' + c.thread] || [];
      return said.length < 4; // opener + 3 follow-ups
    },
    topic2Beat(vid) {
      const c = this.convoGet(vid);
      const t = c.thread;
      const folFn = this['t2fol_' + t];
      const fns = folFn ? folFn.call(this, vid) : [];
      const said = (c.said || {})['t2:' + t] || [];
      // EXHAUSTION (journey sociallife 2026-10-11): the opener + one beat
      // per follow-up level is the whole thread (topic2HasMore's contract:
      // opener + 3 follow-ups). The old index clamp re-served the last
      // level's line verbatim forever ("My part? I remember them." x3) and
      // t2pick's pool[0] fallback defeated the no-repeat ledger. Return null
      // when dry: the caller says the honest "that's all of it" and the
      // menu retires "tell me more".
      if (said.length - 1 >= fns.length) return null;
      const cands = fns[Math.min(Math.max(said.length - 1, 0), fns.length - 1)] || [];
      let line = this.t2pick(vid, 't2:' + t, cands);
      if (!line) return null;
      line = this.t2fill(line, this.vpOf(vid), vid);
      c.depth = (c.depth || 1) + 1;
      return line;
    },

    // ---------- choice construction ----------
    topic2Asks(vid) {
      const c = this.convoGet(vid);
      const asked = c.askedTopics || [];
      const out = [];
      for (const def of this.t2defs()) {
        if (def.id === c.thread) continue;
        if (asked.indexOf(def.id) !== -1) continue;
        if (!this.t2gate(vid, def)) continue;
        out.push({ id: 'ask:' + def.id, label: this.topic2Label(vid, def.id), _t2: def.id });
      }
      // Priority: live events first, then fresh topics, then the rest.
      // (r51: a changed 'others' sorts as fresh, not discussed.)
      const said = c.said || {};
      const fresh = (t) => (typeof this.t2topicFresh === 'function') ? this.t2topicFresh(vid, t) : !(said['t2:' + t] || []).length;
      out.sort((a, b) => {
        const pa = a._t2 === 'lately' ? 0 : (fresh(a._t2) ? 1 : 2);
        const pb = b._t2 === 'lately' ? 0 : (fresh(b._t2) ? 1 : 2);
        return pa - pb;
      });
      return out.map(({ _t2, ...rest }) => rest);
    },
    topic2SubjectOpts(vid) {
      const c = this.convoGet(vid);
      const asked = c.askedTopics || [];
      return this.t2defs()
        .filter(d => d.id !== c.thread && asked.indexOf(d.id) === -1 && this.t2gate(vid, d))
        .map(d => d.id);
    },

    // ---------- the live-event topic ----------
    // 'lately' exists only while the run gives it something to be about.
    t2LatelyEvent(vid) {
      const v = this.state.village;
      const day = (this.state.scholar || {}).day || 0;
      // OUTBREAK SCAN (journey crisis r8 2026-10-14): computed first because
      // severity gates the naming debate below. Sense-tested on 4 seeds: 5
      // villagers down with gut rot and the healthy talked monster names,
      // the sick talked hunger. A SEVERE outbreak (weight>=5: sev2+ counts
      // double — 2 severe or 5 mild sick) displaces the naming debate; a
      // mild one doesn't. Symptom-gated: the description is symptoms, never
      // the true disease name (docs/DISEASES.md). Threshold 2 sick: one sick
      // villager is personal (their own want/opener covers it); two is the
      // village's business.
      let outbreak = null;
      try {
        const sickIds = (v.roster || []).filter(id => {
          try {
            const s = (v.sick || {})[id];
            const svp = this.vpOf(id);
            return s && (s.daysLeft || 0) > 0 && svp && !svp.dead;
          } catch (e) { return false; }
        });
        if (sickIds.length >= 2) {
          let weight = 0;
          const counts = {};
          for (const id of sickIds) {
            const rec = (v.sick || {})[id] || {};
            weight += ((rec.severity || 1) >= 2) ? 2 : 1;
            const s = !rec ? 'a bad gut sickness'
              : rec.name === 'gut rot' ? 'gut cramps'
              : rec.name === 'wound fever' ? 'a hot angry fever'
              : 'a wringing-out sickness';
            counts[s] = (counts[s] || 0) + 1;
          }
          const desc = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || 'a bad gut sickness';
          outbreak = { kind: 'outbreak', n: sickIds.length, self: sickIds.indexOf(vid) >= 0, desc, severe: weight >= 5 };
        }
      } catch (e) {}
      // WEIRDNESS SCAN (journey crisis r16 2026-10-15): the alien pool.
      // Villagers carrying monster-meat quirks (howlbelly, gristlefit,
      // croakbelly, shellgut, witness_maw, flockmind) or warping viruses
      // (eurika, east_nile, lemons) are the village's business from the
      // FIRST one — unlike mundane sickness, the want system deliberately
      // gives alien quirks no sick_help ("no promise the engine can't
      // keep", convo-wants.js), so a single changed villager otherwise has
      // NO conversational outlet at all: no want, no lately event. A
      // villager howling at night is the talk of the fire even alone.
      // Symptom-honest descriptions, never the quirk's true name — the
      // transformations are visible, the names aren't common knowledge.
      // The player counts too: the Bearer's own warping is the talk of the
      // fire (scholar statuses, not the person record).
      let weirdness = null;
      try {
        const ALIEN_QUIRKS = ['howlbelly', 'gristlefit', 'croakbelly', 'shellgut', 'witness_maw', 'flockmind', 'eurika', 'east_nile', 'lemons'];
        const QDESC = {
          howlbelly: 'howling at night', gristlefit: 'shoulders knotted, lashing out',
          croakbelly: 'guts ribbiting', shellgut: 'digestion clanking',
          witness_maw: 'tears running black', flockmind: 'quacking when startled',
          eurika: 'senses gone strange', east_nile: 'fever dreams, hearing crows',
          lemons: 'ringed rashes at the joints',
        };
        const qids = (v.roster || []).filter(id => {
          try {
            const svp = this.vpOf(id);
            if (!svp || svp.dead) return false;
            if (id === this.villagerId) {
              return ALIEN_QUIRKS.some(q => this.hasStatus && this.hasStatus('scholar', q));
            }
            const person = this.getPerson ? this.getPerson(id) : null;
            return person && this.hasStatus && ALIEN_QUIRKS.some(q => this.hasStatus(person, q));
          } catch (e) { return false; }
        });
        if (qids.length >= 1) {
          const counts = {}, firstQ = {};
          for (const id of qids) {
            const qs = id === this.villagerId
              ? ALIEN_QUIRKS.filter(q => { try { return this.hasStatus('scholar', q); } catch (e) { return false; } })
              : ALIEN_QUIRKS.filter(q => { try { const p = this.getPerson(id); return p && this.hasStatus(p, q); } catch (e) { return false; } });
            if (!qs.length) continue;
            firstQ[id] = qs[0];
            const d = QDESC[qs[0]] || 'changing';
            counts[d] = (counts[d] || 0) + 1;
          }
          const desc = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || 'changing';
          const names = qids.slice(0, 2).map(id => {
            try { return this.firstRef(id) || null; } catch (e) { return null; }
          }).filter(Boolean);
          // Severe: three or more changed, or anyone with black tears
          // (witness_maw — "people decide you're possessed" is the most
          // socially severe transformation).
          const severe = qids.length >= 3 || qids.some(id => (firstQ[id] || '') === 'witness_maw');
          const selfQuirk = qids.indexOf(vid) >= 0 ? (firstQ[vid] || null) : null;
          // firstQ for the player was built from scholar statuses above.
          weirdness = {
            kind: 'weirdness', n: qids.length,
            self: qids.indexOf(vid) >= 0,
            selfDesc: selfQuirk ? (QDESC[selfQuirk] || 'changing') : null,
            desc, names, severe,
          };
        }
      } catch (e) {}
      // TABLE EVENT (journey endgame r11 2026-10-14; ported 2026-10-15): the
      // table arriving is the single biggest village-scale event in the run —
      // r10 transcript evidence showed a villager chatting idly a week after
      // the table came ("nobody mentions it"). The village MUST acknowledge
      // it. Phase-aware: waiting (the summons is coming), sitting (it is
      // here, unanswered), deferred (the day-90-floor wait), done (answered).
      // Priority: below fresh grief, the mantle, and a SEVERE outbreak
      // (villagers actively dying in numbers outshout even this); above the
      // naming debate it displaces, the sick row, weirdness, and every daily
      // friction. The landed convoTableOpener (conversation.js) keeps the
      // conversation-open beat (once per villager per sitting); this scan is
      // the lately/event-choice/want beat — complementary, not a duplicate.
      let tableEv = null;
      try {
        const pg = (typeof this.progState === 'function') ? this.progState() : null;
        const T = (typeof this.tableState === 'function') ? this.tableState() : null;
        const active = (typeof this.tableActive === 'function') && this.tableActive();
        const seat = (T && T.seat) || 'none';
        if (T && T.phase === 'done') {
          tableEv = { kind: 'table', phase: 'done', seat, path: T.path || null };
        } else if (T && T.winDeferred) {
          tableEv = { kind: 'table', phase: 'deferred', seat };
        } else if ((pg && pg.tableWaiting) || active) {
          tableEv = { kind: 'table', phase: (pg && pg.tableWaiting && !active) ? 'waiting' : 'sitting', seat };
        }
      } catch (e) { tableEv = null; }
      // SHOW MEMORY (journey crisis r17 2026-10-15): a televised grab within
      // the 7-day window. Computed up here so the naming debate can yield to
      // it (a System abduction outshouts the naming argument) and so the
      // priority chain below can return it in place.
      let showEv = null;
      try {
        const _lc = (v || {}).lastContest;
        if (_lc && (day - (_lc.day || 0)) >= 0 && (day - (_lc.day || 0)) <= 7) {
          showEv = { kind: 'show', name: _lc.name || 'a contest',
            self: (_lc.ids || []).indexOf(vid) >= 0, ids: (_lc.ids || []).slice(),
            // SHOW-DEATH (journey crisis r23 2026-10-18): the taken who died
            // on camera (recorded by _cxKillContestant) — the lines grieve
            // the outcome, not just the abduction.
            died: (_lc.died || []).slice() };
        }
      } catch (e) { showEv = null; }
      // CARE MEMORY (journey crisis r18 2026-10-16): the healer arc was
      // conversationally invisible — villagerCareTick narrates "X sits with
      // Y" and books 'tended' on the medic, but no lately kind surfaced it
      // (gratitude's scan only matches promise_kept|gift|comforted|ally|
      // mediated; 13 pilot transcripts carried zero care mentions). The
      // patient remembers being sat with ('tended_by', medic id in extra);
      // the medic remembers sitting with someone ('tended', patient id).
      // Window 7 days (the defense tail). Computed up here; the priority
      // chain returns it below the sick row and the village's politics —
      // the outbreak is the village's business while it burns; after it
      // passes, the village remembers who sat with whom.
      let careEv = null;
      try {
        const _myMem = (typeof this.t2mem === 'function' ? this.t2mem(vid) : []) || [];
        const _tb = _myMem.find(m => m.t === 'tended_by' && m.medic &&
          (day - (m.day || 0)) >= 0 && (day - (m.day || 0)) <= 7);
        if (_tb) careEv = { kind: 'care', self: true, medic: _tb.medic, wound: !!_tb.wound };
        else {
          const _td = _myMem.find(m => m.t === 'tended' && m.patient &&
            (day - (m.day || 0)) >= 0 && (day - (m.day || 0)) <= 7);
          if (_td) careEv = { kind: 'care', self: false, patient: _td.patient, wound: !!_td.wound };
        }
        const _cu = _myMem.find(m => m.t === 'cured' &&
          (day - (m.day || 0)) >= 0 && (day - (m.day || 0)) <= 7);
        if (_cu) careEv = { kind: 'care', self: true, cured: true };
      } catch (e) { careEv = null; }
      // MUSTER (journey crisis r20 2026-10-17): the village remembers the
      // muster — sheltering behind the barred hall door while the horde
      // hunts the treeline (shelter.js books 'mustered' + threat noun on
      // every sheltered villager). Window 7 days (the defense tail).
      let musterEv = null;
      try {
        const _myMem2 = (typeof this.t2mem === 'function' ? this.t2mem(vid) : []) || [];
        const _mu = _myMem2.find(m => m.t === 'mustered' && m.threat &&
          (day - (m.day || 0)) >= 0 && (day - (m.day || 0)) <= 7);
        if (_mu) musterEv = { kind: 'muster', self: true, threat: _mu.threat };
      } catch (e) { musterEv = null; }
      try {
        // NAMING DEBATE (dialogue rethink, Steve 2026-10-07): a live village
        // naming debate is the talk of the fire — it surfaces here with the
        // proposals the NPC actually heard. Names stay knowledge-gated: the
        // descriptor until the village agrees, never the true name.
        // YIELDS to a severe outbreak (r8): the debate doesn't outshout the
        // sick row. YIELDS to ANY weirdness (r16): an alien transformation
        // is unprecedented body horror happening to someone you know —
        // "what is happening to us" outshouts "what do we call that thing."
        // Unlike mundane sickness (familiar, and the want system carries it
        // as sick_help), a transformation has no other conversational
        // outlet; the debate resumes when the transformation passes.
        // YIELDS to the table (r11): the System's summons outranks the
        // naming argument.
        // YIELDS to a fresh show (r17): a televised grab outshouts the
        // naming argument — the cameras took people yesterday.
        if (typeof this.monsterNamingActive === 'function' && this.monsterNamingActive() &&
            !(outbreak && outbreak.severe) && !weirdness && !tableEv && !showEv) {
          const entries = this.state.codex.monsters || {};
          const mid = Object.keys(entries).find(k => {
            const e = entries[k];
            return e && e.namingKicked && !e.villageName;
          });
          if (mid) return { kind: 'naming', mid };
        }
        if ((v.grief || 0) > 0) {
          // CORPSE STORE (journey crisis r4 2026-10-12): corpses live in
          // state.corpses (corpses.js), never village.corpses — the old read
          // always found [] and the acute mourning lines fell back to the
          // nameless variants even with a fresh named corpse on the ground.
          const corpses = (typeof this.corpses === 'function') ? this.corpses() : (this.state.corpses || []);
          // MULTI-MOURNING (journey-succession r16 2026-10-16): the old read
          // named only the single last corpse — with 2-3 fresh villager
          // corpses the village grieved one at a time, and a later monster
          // corpse displaced the dead entirely (probe: "Since Dustboar
          // died..." with two dead villagers unmentioned). Name every fresh
          // SAPIENT corpse (corpseIsPerson: 'person' + 'villager' kinds;
          // dayDied within the 3-day acute window); monsters are never
          // mourned by name.
          const _mday = (this.state.scholar || {}).day || 0;
          const _isPerson = (typeof this.corpseIsPerson === 'function')
            ? (c) => { try { return this.corpseIsPerson(c); } catch (e) { return false; } }
            : (c) => c && (c.kind === 'person' || c.kind === 'villager');
          const _fresh = corpses.filter(c => c && _isPerson(c) &&
            (_mday - (c.dayDied || 0)) >= 0 && (_mday - (c.dayDied || 0)) <= 3);
          // MOURNING NAME (journey crisis r8 2026-10-12): firstRef, never
          // split(' ')[0] — the split truncated stranger descriptors
          // ("A person, maybe 40s, with a scarred cheek") to the bare "A"
          // (transcript-verified: "Since A died..."). firstRef is
          // knowledge-gated per viewer and never collapses to "A".
          // BEARER-DEATH NAME (journey succession r20 2026-10-16): the r8
          // firstRef fix also gated the dead BEARER behind
          // village-knownNames, so a pre-System bearer death mourned "the
          // man in his 20s" — hiding the player's own prior incarnation's
          // name from the player. The bearer isn't a stranger: match the
          // corpse against the lineage's bearer-death entry and use the
          // recorded true name (playerDeath records oldName); strangers
          // keep the firstRef path above. The /^(the|a|an)$/ guard keeps
          // the old 'the scholar' fallback from rendering as "Since the
          // died..." — the r8 bug class, in reverse.
          let _bearerVid = null;
          try {
            const _lin = (typeof this.lineage === 'function') ? (this.lineage() || []) : [];
            const _last = _lin[_lin.length - 1];
            if (_last && _last.cause && !_last.outcome && _last.villagerId) _bearerVid = _last.villagerId;
          } catch (e) {}
          const _names = [];
          for (const c of _fresh) {
            let nm = null;
            if (c.villagerId && _bearerVid && c.villagerId === _bearerVid && c.name) {
              try {
                const _tok = String(c.name).split(' ')[0] || null;
                if (_tok && !/^(the|a|an)$/i.test(_tok)) nm = _tok;
              } catch (e) {}
            }
            if (!nm) {
              try { if (c.villagerId && typeof this.firstRef === 'function') nm = this.firstRef(c.villagerId) || null; } catch (e) {}
            }
            if (!nm) nm = String(c.name || c.villagerId || 'someone');
            if (nm && _names.indexOf(nm) < 0) _names.push(nm);
          }
          // SICKNESS DEATH (journey crisis r8 2026-10-14): when the fresh
          // corpse died of disease, the mourning lines name the sickness —
          // sense-tested, the village grieved its outbreak dead generically
          // while the sick row filled, never connecting the two. Symptom-
          // honest ("the sickness"), never the disease true name.
          let sickDeath = false;
          try {
            const recent = _fresh[_fresh.length - 1];
            const cause = String((recent && recent.cause) || '');
            sickDeath = /sick|gutrot|wound_fever|trembles|trichinosis|lockjaw|tick fever|gut rot/i.test(cause) || cause === 'disease';
          } catch (e) {}
          // ev.name stays the single most-recent reference (the {mname}
          // substitution reads it); ev.names carries the full fresh list
          // for the multi-name line templates. No fresh villager corpses:
          // the nameless variants (grief is real, the body isn't found).
          return { kind: 'mourning', name: _names.length ? _names[_names.length - 1] : null, names: _names, sickDeath };
        }
        // MANTLE MEMORY (journey crisis r4 2026-10-12): the village talks
        // about a dead bearer longer than the 3-day acute grief — the mantle
        // passing is the run's central fiction ("the village remembers its
        // own mantle-bearers", ledger.js). Without this, the successor's
        // conversations went grief-silent 3 days after the leader died
        // defending the haven (creek-concert small talk, transcript-verified).
        // Ordinary villager deaths keep the 3-day window; only the lineage's
        // last entry — a bearer death with a cause — gets the longer tail.
        try {
          if (typeof this.lineage === 'function') {
            const lin = this.lineage() || [];
            const last = lin[lin.length - 1];
            if (last && last.cause && !last.outcome) {
              const since = day - (last.day || 0);
              if (since >= 0 && since <= 10) {
                // MOURNING NAME (journey succession r20 2026-10-16): the r8
                // firstRef fix gated the dead bearer's name behind
                // village-knownNames — a pre-System bearer death mourned
                // "the man in his 20s", hiding the player's own prior
                // incarnation from the player. The lineage IS the village's
                // memory of its mantle-bearers ("the village remembers its
                // own mantle-bearers", ledger.js): this branch only fires
                // for bearer deaths, and playerDeath records the true name
                // (oldName), never a stranger descriptor — so the r8
                // "A"-truncation concern doesn't apply here. firstRef stays
                // the fallback; the /^(the|a|an)$/ guard keeps the old
                // 'the scholar' fallback from rendering "Since the died...".
                let nm2 = null;
                try {
                  const _tok = String(last.name || '').split(' ')[0] || null;
                  if (_tok && !/^(the|a|an)$/i.test(_tok)) nm2 = _tok;
                } catch (e) {}
                try { if (!nm2 && last.villagerId && typeof this.firstRef === 'function') nm2 = this.firstRef(last.villagerId) || null; } catch (e) {}
                if (!nm2) nm2 = 'someone';
                // SUCCESSOR'S OWN GRIEF, convo half (journey-succession r23
                // 2026-10-18): carry the dead bearer's id so the mourning
                // lines can acknowledge the SUCCESSOR's personal loss, not
                // just the village's.
                if (nm2) return { kind: 'mourning', name: nm2, bearer: true, bearerId: last.villagerId };
              }
            }
          }
        } catch (e) {}
        // DEFENSE MEMORY (journey crisis r6 2026-10-13): a villager who bled
        // at the treeline defending the haven talks about it — their own
        // night, in their own words. A naming debate doesn't outrank your
        // own wound: defense sits above the generic threat scan. Window 7
        // days — the night lingers, then it becomes old news (the mantle
        // keeps 10). The 'defended' memory is planted by
        // resolveWildMonsterEncounter on the raid pathway only (opts.raid).
        // TABLE RETURN (r11, ported 2026-10-15): below fresh grief, the mantle,
        // and a SEVERE outbreak (villagers actively dying in numbers outshout
        // even the table — the orphaned draft's own stated rule, which its
        // code didn't implement; fixed on port); above the naming debate it
        // displaced, the sick row, weirdness, and every daily friction.
        if (tableEv && !(outbreak && outbreak.severe)) return tableEv;
        // OUTBREAK RETURN (r8): the scan ran before the naming check; the kind
        // surfaces here — below fresh grief and the mantle (the dead are
        // still named first), above defense and the debate.
        // WEIRDNESS RETURN (r16): the alien-quirk scan rides the same slot.
        // Sickness kills; transformations unnerve — when both are live, the
        // severe one wins, otherwise the outbreak (existing behavior).
        if (outbreak || weirdness) {
          // Severe bodily horror outranks the broadcast (r17): villagers
          // actively dying or transforming outshout even the System's cameras.
          const severeW = weirdness && weirdness.severe && (!outbreak || !outbreak.severe);
          const severeO = outbreak && outbreak.severe;
          if (severeW) return weirdness;
          if (severeO) return outbreak;
          // A fresh televised grab outshouts MILD bodily news (r17): two
          // people with gut cramps don't outshout the cameras taking people.
          if (showEv) return showEv;
          if (weirdness && !outbreak) return weirdness;
          return outbreak;
        }
        // SHOW RETURN (r17): the precomputed showEv rides here — below fresh
        // grief, the mantle, the table, and SEVERE bodily crisis; above the
        // village's own politics and the naming debate it already displaced
        // above. Window 7 days (the defense tail). The participant gets the
        // first-person variant.
        if (showEv) return showEv;
        // REALM (journey scale r1 2026-10-15): the court sat or the oath was
        // sworn and the village knows — but after the one-shot echo beat
        // (scaleDiscovery._sdNationalBeatEcho), conversations never carried
        // the realm as a topic. The realm is the village's own political
        // transformation (tribute flows, the court calendar, the oath); it
        // holds the lately slot for the acute window. Below the table (the
        // System's summons outranks the village's own politics), the sick,
        // and the dead — above defense and the debate. Window 10 days (the
        // mantle's tail); shape-aware; the primary's name is knowledge-gated.
        try {
          var _natDay = this.state.nationalDay || 0;
          if (this.state.nationalLive &&
              (day - _natDay) >= 0 && (day - _natDay) <= 10) {
            return { kind: 'realm', shape: this.state.nationalShape || 'lead' };
          }
        } catch (e) {}
        const defended = this.t2mem(vid).find(m => m.t === 'defended' &&
          (day - (m.day || 0)) >= 0 && (day - (m.day || 0)) <= 7);
        if (defended) return { kind: 'defense', note: String(defended.note || '') };
        const mem = this.t2mem(vid).filter(m => day - (m.day || 0) <= 3);
        const threat = mem.find(m => /threat|attack|monster|treeline/i.test((m.t || '') + ' ' + (m.note || '')));
        if (threat) return { kind: 'threat', note: threat.note };
        const betray = mem.find(m => /promise_broken|caught_you_stealing|suspects_you/i.test(m.t || ''));
        if (betray) return { kind: 'betrayal', mem: betray };
        if (Object.values(v.heat || {}).some(h => h > 0)) return { kind: 'tension' };
        const hungry = (v.roster || []).filter(id => {
          try { return id !== this.villagerId && (this.npcNeeds(id).hunger || 0) > 70; }
          catch (e) { return false; }
        }).length;
        if (hungry > 2) return { kind: 'hunger', n: hungry };
        const good = mem.find(m => /promise_kept|gift|comforted|ally|mediated/i.test(m.t || ''));
        // CARE RETURN (journey crisis r18 2026-10-16): the care arc's lately
        // slot. Below fresh grief, the mantle, the table, severe AND mild
        // bodily crisis, and village politics (the sick row outranks the
        // sitting-with while people are still down) — above generic
        // gratitude and cheer.
        if (careEv) return careEv;
        // MUSTER (journey crisis r20): the shared story — behind the barred
        // door while the horde hunts. Below care (personal tenderness
        // outranks the collective), above gratitude and cheer.
        if (musterEv) return musterEv;
        if (good) return { kind: 'gratitude', mem: good };
        if ((v.cheer || 0) > 0) return { kind: 'cheer' };
      } catch (e) {}
      return null;
    },

    // ---------- YOU: what they think of the player ----------
    t2gen_you(vid) {
      const band = this.t2band(vid);
      const mem = this.t2mem(vid);
      const vp = this.vpOf(vid);
      const temp = this.npcTemper(vid);
      const bandLine = {
        wary: '"Honestly? I\'m still making up my mind about you."',
        warming: '"You\'re alright. I think. Ask me again in a week."',
        close: '"You\'re one of the good ones. Don\'t make me regret saying that out loud."',
        devoted: '"You\'re family now. Chosen family — the kind that actually counts."',
      }[band];
      // The most recent significant thing the player did TO them.
      const sig = mem.filter(m => /promise_kept|promise_broken|gift|you_threatened|caught_you_stealing|comforted|ally|mediated|deal|amends/i.test(m.t || '')).pop();
      let memLine = null;
      if (sig) {
        const note = sig.note ? ' "' + sig.note + '"' : '';
        const map = {
          promise_kept: '"You said you\'d help, and you did.' + note + ' That stays with me."',
          promise_broken: '"You promised' + note + ', and it didn\'t happen. I\'m still carrying that."',
          gift: '"You fed me when I was hungry. I don\'t forget things like that."',
          you_threatened: '"You threatened me once.' + note + ' I haven\'t forgotten. But I\'m still here talking to you."',
          caught_you_stealing: '"I know about my pack. Hands where I can see them, next time."',
          comforted: '"You sat with me when I was scared. That meant something."',
          ally: '"You stood up for me.' + note + ' I owe you for that."',
          mediated: '"You stepped between me and a fight.' + note + ' Not many would."',
          amends: '"You apologized.' + note + ' That took something. I respect it."',
        };
        memLine = map[sig.t] || ('"I remember' + note + '. I remember everything, actually."');
      }
      const closer = {
        bold: '"Ask me again in a week. The answer might be better."',
        warm: '"I\'m glad you asked, actually."',
        prickly: '"There. You wanted honest."',
        withdrawn: '"Don\'t make me say it twice."',
        dry: '"Make of that what you will."',
      }[temp] || '"That\'s where we are."';
      const cands = [];
      if (memLine) cands.push(bandLine + ' A beat. ' + memLine);
      cands.push(bandLine + ' ' + closer);
      if (band === 'wary') cands.push('"You want to know what I think of you? Earn a better answer." ' + closer);
      if (band === 'devoted') cands.push('"I\'d follow you out past the treeline. Don\'t tell the others — they\'d want to come too."');
      return cands;
    },
    t2fol_you(vid) {
      const mem = this.t2mem(vid);
      const sig = mem.filter(m => /promise_kept|promise_broken|gift|you_threatened|comforted|ally/i.test(m.t || '')).pop();
      const vp = this.vpOf(vid);
      const f1 = [];
      if (sig && sig.note) {
        f1.push('"About ' + sig.note + ' — here\'s what you didn\'t see. ' +
          (this.t2pers(vp).quirk ? 'I {quirkI}, that\'s just what I do when things matter.' : 'It mattered more than I let on.') + '"');
      }
      f1.push('"Here\'s what it would take, if you want more than this: show up when it costs you something. That\'s the whole test."');
      f1.push('"People here talk. What they say about you when you\'re not at the fire — that\'s the real answer to your question."');
      const f2 = [
        '"I\'ve changed my mind about people before. Usually it takes getting hurt first. You haven\'t hurt me yet."',
        '"A month ago I wouldn\'t have said any of this to you. That\'s not nothing."',
        '"Trust is slow out here. It\'s the one thing the System can\'t grant us."',
      ];
      const f3 = [
        '"What do I want from you? Nothing fancy. Just — be the person you are when nobody\'s watching. Here."',
        '"Stay. That\'s it. People leave. You keep showing up, and that starts to mean something."',
      ];
      return [f1, f2, f3];
    },

    // ---------- FEARS ----------
    t2gen_fears(vid) {
      const vp = this.vpOf(vid);
      const v = this.state.village;
      const cands = [
        '"{Fear}." A pause. "Stupid, maybe. But there it is."',
        '"{Fear}." Said flat, like something rehearsed in the dark.',
        '"Don\'t laugh. {Fear}."',
      ];
      if ((v.grief || 0) > 0) cands.push('"{Fear} — and now losing people. That one isn\'t abstract anymore."');
      const threat = this.t2mem(vid).find(m => /threat|attack|monster/i.test((m.t || '') + ' ' + (m.note || '')));
      if (threat && threat.note) cands.push('"{Fear}. Especially since ' + threat.note + '."');
      if (this.t2band(vid) === 'wary') cands.push('"Why do you want to know what scares me?" A long look. "...{Fear}."');
      return cands;
    },
    t2fol_fears(vid) {
      const vp = this.vpOf(vid);
      const f1 = [
        '"When it gets bad, I {habitI}. It doesn\'t help, exactly. It gives my hands something to do while my head catches up."',
        '"I {habitI} when it gets loud in my head. Everyone\'s got something. That\'s mine."',
        '"{Quirk} — that\'s what I do when the fear gets loud. You\'ve probably noticed."',
      ];
      const f2 = [
        '"It\'s worse since the scattering. Before, {fear} was... theoretical. Now it has a schedule."',
        '"I wasn\'t always like this. {origin} didn\'t prepare me for checking the treeline every night."',
        '"Some fears you outgrow. This one grew up with me."',
      ];
      const f3 = [
        '"If it happened — really happened — I think I\'d {habitI} first, then figure out the rest. That\'s the plan. It\'s a bad plan."',
        '"I try not to think about what I\'d do. Thinking about it feels like inviting it."',
        '"I\'d survive it. I\'ve survived everything else so far, haven\'t I?"',
      ];
      return [f1, f2, f3];
    },

    // ---------- OLD WORLD ----------
    t2gen_oldworld(vid) {
      const small = ['hot showers', 'traffic noise', 'grocery stores', 'rain on a real roof',
        'coffee that didn\'t taste like bark', 'streetlights', 'air conditioning',
        'a bed that didn\'t try to kill my back', 'my phone buzzing', 'ice in a glass'];
      const s = small[Math.floor(Math.random() * small.length)];
      return [
        '"Mornings. I miss mornings — {occ} mornings, {origin} light, the whole day still possible."',
        '"You know what I miss? ' + s + '. Nobody writes songs about ' + s + ', but I\'d trade a week of this for an hour of that."',
        '"{origin} had this smell after rain — concrete and wet leaves. I\'d forgotten it until just now, saying it out loud."',
        '"I miss being bored. Really, properly bored. That was a luxury and I never knew."',
      ];
    },
    t2fol_oldworld(vid) {
      const vp = this.vpOf(vid);
      const f1 = [
        '"What I miss most? ' + ['The food', 'The noise', 'The feeling that tomorrow would look like today'][Math.floor(Math.random() * 3)] + '. The small stuff. It\'s always the small stuff."',
        '"I miss {hope}. Funny — I still hope for it, just... translated."',
      ];
      const f2 = [
        '"What I don\'t miss? Deadlines. Rent. Small talk at parties where nobody listens." A short laugh. "The world ended and my calendar finally cleared."',
        '"I don\'t miss pretending I was busy. Turns out I was just... occupied. There\'s a difference."',
      ];
      const f3 = [
        '"Would I go back, if I could? ...Ask me on a warm day. Today, with the fire going — I\'m not sure."',
        '"Being {an_occ} taught me {skill}. Out here that\'s worth more than everything I left behind."',
      ];
      return [f1, f2, f3];
    },

    // ---------- SKILLS ----------
    t2intelTrait(vp) {
      const intel = ((vp && vp.intelligence) || {}).primary || 'steady';
      return {
        analytical: 'taking things apart to see how they work',
        practical: 'making things work with what\'s actually here',
        social: 'reading people — what they want, what they\'re hiding',
        observant: 'noticing what everyone else walks past',
        creative: 'making something out of nothing',
        steady: 'keeping going when everything says stop',
      }[intel] || 'getting by';
    },
    t2gen_skills(vid) {
      const vp = this.vpOf(vid);
      // REBUILD 2026-10-11: the union — knowledge is knowledge, however
      // learned. The old line claimed "I taught N things", crediting the
      // speaker with teaching they never did. Now it's what they KNOW.
      const known = (typeof this.plantsKnownBy === 'function') ? this.plantsKnownBy(vid) : (((this.state.village.taught || {})[vid]) || []);
      const cands = [
        '"I was {an_occ}. Which means I\'m good at ' + this.t2intelTrait(vp) + '."',
        '"' + this.t2cap(this.t2intelTrait(vp)) + '. That\'s my thing. Everything else I\'m figuring out like everyone."',
      ];
      if (known.length) cands.push('"Ask around — I know ' + known.length + ' thing' + (known.length > 1 ? 's' : '') + ' worth knowing out here. Knowledge is the one thing that multiplies when you give it away."');
      if (this.t2band(vid) === 'wary') cands.push('"Why — do I look useless to you?" A grin takes the sting out. "I was {an_occ}. I manage."');
      return cands;
    },
    t2fol_skills(vid) {
      const vp = this.vpOf(vid);
      const f1 = [
        '"Learned it in {origin}, mostly. {Occ} work teaches you fast — the kind that doesn\'t wait while you read a manual."',
        '"Nobody taught me. I watched, I failed, I watched closer. That\'s the whole curriculum."',
      ];
      const weak = ['sitting still', 'letting things go', 'asking for help', 'small talk', 'sleeping through the night'];
      const f2 = [
        '"What I\'m bad at? ' + weak[Math.floor(Math.random() * weak.length)] + '. We all get one fatal flaw. That\'s mine."',
        '"I\'m terrible at resting. There\'s always something — the fire, the stores, the watch. Rest feels like stealing."',
      ];
      const f3 = [
        '"Want me to show you sometime? Not now — but sometime. Teaching keeps it sharp."',
        '"If you ever need ' + this.t2intelTrait(vp) + ', come find me. That\'s what I\'m for."',
      ];
      return [f1, f2, f3];
    },

    // ---------- OTHERS: who's on their mind ----------
    t2pickOther(vid) {
      const v = this.state.village;
      const roster = (v.roster || []).filter(id => id !== vid && id !== this.villagerId);
      if (!roster.length) return null;
      try {
        const cf = (v.conflicts || []).find(x => !x.resolved && (x.a === vid || x.b === vid));
        if (cf) {
          const oid = cf.a === vid ? cf.b : cf.a;
          if (roster.indexOf(oid) !== -1) return { id: oid, why: 'grievance', hist: cf.history, ha: cf.a, hb: cf.b };
        }
      } catch (e) {}
      // MEMDEPTH (2026-10-13): recorded grievances (betrayal plots, moot
      // votes, false accusations) are a second grievance source — with the
      // human phrase, so the read names the DEED, not just the tension.
      try {
        const grs = (((v.betrayal || {}).grievances) || []).filter(gr => gr && gr.by === vid && roster.indexOf(gr.against) !== -1);
        if (grs.length) {
          grs.sort((a, b) => (b.day || 0) - (a.day || 0));
          return { id: grs[0].against, why: 'vgrievance' };
        }
      } catch (e) {}
      try {
        // LEDGER-AWARE CLOSE (journey-social r47 2026-10-24): friendships
        // form mid-run via the bond ledger (v.bonds, depth >= 2), but this
        // read only ever named frozen day-1 group mates — 31/34 served
        // close-reads in r47 named pairs at ledger depth <= 0 (fossils),
        // while 66 formed friendships were never nameable. Prefer the
        // deepest live bond; fall back to groups when none exists. The
        // 'close' lines name no shared events (the ledger stores none), so
        // no fabricated memories.
        const bonds = v.bonds || {};
        let best = null;
        for (const k of Object.keys(bonds)) {
          const bnd = bonds[k] || {};
          if ((bnd.depth || 0) < 2) continue;
          const parts = String(k).split('|');
          const oid = parts[0] === vid ? parts[1] : parts[1] === vid ? parts[0] : null;
          if (!oid || roster.indexOf(oid) === -1) continue;
          // no bonds with the dead (bondAdd refuses them; the read must too)
          try { if ((this.getPerson(oid) || {}).dead) continue; } catch (e) {}
          if (!best || (bnd.depth || 0) > best.depth || ((bnd.depth || 0) === best.depth && (bnd.v || 0) > best.v)) {
            best = { id: oid, depth: bnd.depth || 0, v: bnd.v || 0 };
          }
        }
        if (best) return { id: best.id, why: 'close' };
        // LIVE-BOND FALLBACK (journey-social r49 2026-10-24): the old
        // groups fallback named a member of the FIRST group in list
        // order — it never checked whether the SPEAKER was in that
        // group, so strangers got trust-claims (wild proof, seed 4503:
        // 8 speakers named Sergio at ledger depth 0/1, none sharing
        // his group; pooled late-null share 4/14 = 28.6% fired r49's
        // pre-registered fallback trigger). Prefer the deepest LIVE
        // bond (depth >= 1: a real, repeated relationship) instead.
        // When the speaker holds no live bond at all, fall through to
        // the neutral roster pick below: honest non-claim lines
        // ("still figuring that one out") instead of a trust-claim
        // about someone with no ledger record. 'close' now means a
        // real bond, period.
        let live = null;
        for (const k of Object.keys(bonds)) {
          const bnd = bonds[k] || {};
          if ((bnd.depth || 0) < 1) continue;
          const parts = String(k).split('|');
          const oid = parts[0] === vid ? parts[1] : parts[1] === vid ? parts[0] : null;
          if (!oid || roster.indexOf(oid) === -1) continue;
          try { if ((this.getPerson(oid) || {}).dead) continue; } catch (e) {}
          if (!live || (bnd.depth || 0) > live.depth || ((bnd.depth || 0) === live.depth && (bnd.v || 0) > live.v)) {
            live = { id: oid, depth: bnd.depth || 0, v: bnd.v || 0 };
          }
        }
        if (live) return { id: live.id, why: 'close' };
      } catch (e) {}
      return { id: roster[Math.floor(Math.random() * roster.length)], why: 'neutral' };
    },
    // OTHERS RE-OFFER (journey-social r51 2026-10-24): a spent 'others'
    // counts fresh again when its pick CHANGED — new person or new why —
    // because the read is dynamic (deepest bond, newest grievance), so
    // "discussed once" is the wrong freshness key. Neutral random picks
    // are noise, not news, and never re-open the topic. Legacy servings
    // (said, but no t2otherServed recorded) stay one-shot: safe default.
    t2othersChanged(vid) {
      try {
        const c = this.convoGet(vid);
        const last = c && c.t2otherServed;
        if (!last) return false;
        // menuCheck marker: this call READS the pick for menu-building, it
        // is not a serving. Instrumentation wrapping t2pickOther must skip
        // marker calls, or menu checks pollute serving counts (the r50
        // driver's wrap assumed call == serving — true until this fix).
        const pick = this.t2pickOther(vid, { menuCheck: true });
        if (!pick || pick.why === 'neutral') return false;
        return pick.id !== last.id || pick.why !== last.why;
      } catch (e) { return false; }
    },
    // Freshness for menu ordering: never-discussed, 'lately' (live
    // events), or 'others' whose pick changed since it was last served.
    t2topicFresh(vid, tid) {
      if (tid === 'lately') return true;
      const c = this.convoGet(vid);
      const said = (c && c.said) || {};
      if (!(said['t2:' + tid] || []).length) return true;
      if (tid === 'others') return this.t2othersChanged(vid);
      return false;
    },
    t2gen_others(vid) {
      const pick = this.t2pickOther(vid);
      if (!pick) return ['"It\'s just us, really. The others are... elsewhere."'];
      const c = this.convoGet(vid);
      c.t2other = pick.id;
      // OTHERS RE-OFFER (journey-social r51 2026-10-24): remember the LAST
      // SERVED pick (person + why) on the persistent convo state — never
      // reset at startConvo, so a later menu can tell whether the pick
      // CHANGED. The served pick is the freshness key for re-offers.
      c.t2otherServed = { id: pick.id, why: pick.why };
      // firstRef (dialogue rethink, Steve 2026-10-07): displayName is
      // knowledge-gated — split(' ')[0] on "A person, maybe 30s" produced the
      // broken bare "A". firstRef never collapses to "A" (game.js).
      let nm = pick.id;
      try { nm = this.firstRef(pick.id); } catch (e) {}
      const vp = this.vpOf(vid);
      const temp = this.npcTemper(vid);
      // MEMDEPTH (2026-10-13): recorded-grievance read — "Mira still hasn't
      // forgiven Tomas for ..." The phrase comes from the grievance ledger
      // via convoGrievanceLine (memdepth.js); names gated at read.
      if (pick.why === 'vgrievance') {
        try {
          const gl = this.convoGrievanceLine ? this.convoGrievanceLine(vid, pick.id) : null;
          if (gl) return [gl];
        } catch (e) {}
      }
      // MEMDEPTH (2026-10-13): villager-to-villager deed recall — before the
      // generic branches, check whether vid remembers something oid DID.
      // "Mira killed the highbeam deer" beats "Mira keeps to themselves."
      try {
        const dl = this.deedMemLine ? this.deedMemLine(vid, pick.id) : null;
        if (dl && pick.why !== 'grievance' && pick.why !== 'vgrievance') {
          const base = pick.why === 'close' ? [
            '"' + nm + '? I\'d trust ' + nm + ' with my pack. That\'s the highest compliment I have."',
            '"' + nm + ' keeps me sane. Everyone needs one person who\'d notice if they stopped showing up."',
          ] : [
            '"' + nm + ' keeps to themselves. Can\'t tell if that\'s wisdom or just tired."',
            '"' + nm + '? Still figuring that one out. We\'re all still figuring each other out, aren\'t we?"',
          ];
          return [dl].concat(base);
        }
      } catch (e) {}
      if (pick.why === 'grievance') {
        // KNOWLEDGE GATE (dialog rebuild 2026-10-11): hist entries are {a}/{b}
        // templates — resolve via displayName, never baked true names.
        const dn = (id) => id ? this.displayName(id) : 'someone';
        const fillNames = (s) => String(s).split('{a}').join(dn(pick.ha)).split('{b}').join(dn(pick.hb));
        const hist = fillNames((pick.hist || ['old history'])[0]);
        return [
          '"' + nm + '?" A muscle moves in their jaw. "' + hist + '"',
          '"' + nm + '. We don\'t... it\'s old. Older than the scattering, even. Some things you carry so long they grow into you."',
          temp === 'bold' ? '"' + nm + ' and I have history. I\'ll leave it at that — unless you want the version with names.' : '"' + nm + '? I\'d rather not. Some doors stay closed."',
        ];
      }
      if (pick.why === 'close') {
        return [
          '"' + nm + '? I\'d trust ' + nm + ' with my pack. That\'s the highest compliment I have."',
          '"' + nm + ' keeps me sane. Everyone needs one person who\'d notice if they stopped showing up."',
        ];
      }
      return [
        '"' + nm + ' keeps to themselves. Can\'t tell if that\'s wisdom or just tired."',
        '"' + nm + '? Still figuring that one out. We\'re all still figuring each other out, aren\'t we?"',
      ];
    },
    t2fol_others(vid) {
      const c = this.convoGet(vid);
      const oid = c.t2other;
      let nm = oid || 'them';
      try { if (oid) nm = this.firstRef(oid); } catch (e) {}
      const ovp = oid ? this.vpOf(oid) : {};
      const oocc = (ovp && ovp.formerOccupation) || 'survivor';
      // PRONOUN AGREEMENT (journey-social r26 2026-10-18): the occupation
      // line hardcoded "the way they handle things" — wrong for she/he
      // villagers ("Camila was a police officer, before... the way they
      // handle things", transcript-caught s1902-deep-2).
      const opro = this.t2pro ? this.t2pro(ovp, oid) : 'they';
      // TEXT MODULE (rogue P0-2/P0-7 2026-10-22): pronoun bundle + verb pipe.
      const ohandle = Text.proBundle(opro).sub + ' ' + Text.conj('handle', opro);
      const f1 = oid ? [
        '"' + nm + ' was ' + Text.anPhrase(oocc.toLowerCase()) + ', before. You can still see it — the way ' + ohandle + ' things."',
        '"Here\'s a story: ' + nm + ' once ' + ['shared food without being asked', 'stayed up all night on watch so someone else could sleep', 'talked someone down from leaving'][Math.floor(Math.random() * 3)] + '. That\'s who ' + nm + ' is, when it counts."',
      ] : ['"There\'s not much more to say. People are complicated; that\'s the whole story."'];
      const f2 = [
        '"Has it changed? Everything changes. Ask me again after the next hard week."',
        '"I used to think worse of ' + nm + '. The scattering has a way of... editing people. Mostly for the better. Mostly."',
      ];
      const f3 = [
        '"If you\'re going to deal with ' + nm + ' — be direct. Nothing sideways. ' + nm + ' smells sideways a mile off."',
        '"My advice? Give ' + nm + ' time. We\'re all still becoming whoever we are now."',
      ];
      return [f1, f2, f3];
    },

    // ---------- NEIGHBORS: what the other villages remember ----------
    // MEMDEPTH (2026-10-13): inter-village grievances as recallable EVENTS.
    // A villager names what the other village DID (or what Haven did to
    // them) — never "trust is 34". Reads ov.events via ovGrievances/
    // ovOpinionExplain (memdepth.js).
    t2gen_neighbors(vid) {
      try {
        // KNOWER LEDGER (2026-10-29): the SPEAKER is the knower — a
        // villager discusses only villages they themselves know (their
        // lore, or a sworn bond: a link is public, the whole fire knows
        // its allies). The old bare-flag read let any villager discuss a
        // village only the player had heard of.
        const ovs = (this.state.otherVillages || []).filter(ov => ov && this.knowsVillage &&
          (this.knowsVillage(ov, vid) || (typeof this.linkWith === 'function' && !!this.linkWith(ov.id))));
        if (!ovs.length) return [];
        // prefer villages with fresh grievance events, then lowest opinion
        const day = (this.state.scholar || {}).day || 0;
        const scored = ovs.map(ov => {
          const evs = (this.ovGrievances ? this.ovGrievances(ov.id) : []) || [];
          const fresh = evs.filter(e => day - (e.day || 0) <= 28).length;
          return { ov, evs, score: fresh * 100 - (ov.opinion || 0) };
        });
        scored.sort((a, b) => b.score - a.score);
        const top = scored[0];
        if (!top) return [];
        const nm = this._ovName ? this._ovName(top.ov.id) : (top.ov.name || 'them');
        const ev = top.evs[0];
        const c = this.convoGet(vid);
        c.t2neighbor = top.ov.id;
        if (!ev) {
          return ['"' + nm + '? We barely know them. That\'s the honest version — no stories yet."'];
        }
        const ago = Math.max(0, day - (ev.day || 0));
        const when = ago <= 0 ? 'today' : ago === 1 ? 'yesterday' : ago + ' days back';
        const temp = this.npcTemper(vid);
        const lines = [
          '"' + nm + '. ' + ev.what + ' — ' + when + '. They don\'t forget. Why would they?"',
        ];
        if (temp === 'bold') lines.push('"' + nm + ' still carries it: ' + ev.what.toLowerCase() + '. ' + when + '. You don\'t come back from that with words."');
        else lines.push('"' + nm + '? ...' + ev.what + ' — ' + when + '. I try not to think about what that felt like on their side."');
        return lines;
      } catch (e) { return []; }
    },
    t2fol_neighbors(vid) {
      const c = this.convoGet(vid);
      const oid = c.t2neighbor;
      let nm = 'them';
      try { nm = this._ovName ? this._ovName(oid) : 'them'; } catch (e) {}
      let expl = '';
      try { expl = (this.ovOpinionExplain && oid) ? this.ovOpinionExplain(oid) : ''; } catch (e) {}
      const f1 = [
        '"' + nm + ' and us — it\'s complicated. Everything out here is complicated. That\'s not an excuse, it\'s just true."',
      ];
      const f2 = expl
        ? ['"Where we stand with them, honestly?' + expl + '"']
        : ['"I don\'t know where we stand with them. Ask me after the next hard week."'];
      const f3 = [
        '"Whatever happens with ' + nm + ' — it started with something someone did. It always does."',
      ];
      return [f1, f2, f3];
    },

    // ---------- SYSTEMTAKE ----------
    t2gen_systemtake(vid) {
      const vp = this.vpOf(vid);
      const intel = ((vp && vp.intelligence) || {}).primary || 'steady';
      const temp = this.npcTemper(vid);
      const byIntel = {
        analytical: '"It didn\'t give us food, water, or shelter. It gave us an audience. Draw your own conclusions."',
        practical: '"I don\'t care what it IS. I care what it DOES. So far: mostly watches."',
        social: '"It likes us, I think. That\'s what worries me — ever been liked by something that could swat you?"',
        observant: '"It watches the same way I do. Noticing. I don\'t know what it does with what it notices."',
        creative: '"It\'s making something out of us. I just can\'t tell if we\'re the clay or the audience."',
        steady: '"It\'s here. We\'re here. I deal with what\'s in front of me."',
      };
      const cands = [byIntel[intel] || byIntel.steady];
      if (temp === 'prickly') cands.push('"The System? It forgot food. I don\'t trust anything that forgets food."');
      if (temp === 'warm') cands.push('"It\'s trying, I think. In the way a cat tries to help you type. Genuine. Useless. Sweet."');
      if (this.state.systemArrived && (this.state.scholar || {}).day > 30) cands.push('"A month in and I still don\'t know if it\'s a god, a zookeeper, or a tourist. Maybe all three."');
      return cands;
    },
    t2fol_systemtake(vid) {
      const f1 = [
        '"If I could ask it one thing? Why us. Why here. Why like THIS."',
        '"I\'d ask it what it wants to happen. Not what it says — what it actually wants, underneath."',
      ];
      const f2 = [
        '"Do I trust it? I trust it the way I trust weather. It\'s real, it\'s powerful, and it doesn\'t care about my plans."',
        '"Trust is the wrong word. It\'s like trusting the tide. You don\'t — you learn to swim."',
      ];
      const f3 = [
        '"It\'s changed me. I catch myself performing — for it, for the audience. Then I feel sick about it."',
        '"Has it changed me? I talk to the sky now. So yes. Probably yes."',
      ];
      return [f1, f2, f3];
    },

    // ---------- ADVICE: contextual wisdom ----------
    t2gen_advice(vid) {
      const v = this.state.village;
      const vp = this.vpOf(vid);
      const intel = ((vp && vp.intelligence) || {}).primary || 'steady';
      const cands = [];
      try {
        const hungry = (v.roster || []).filter(id => {
          try { return id !== this.villagerId && (this.npcNeeds(id).hunger || 0) > 70; }
          catch (e) { return false; }
        }).length;
        if (hungry > 2) cands.push('"Eat before you\'re hungry. The body lies about it until it\'s too late — and right now, too late is close."');
      } catch (e) {}
      if ((v.grief || 0) > 0) cands.push('"Grief makes you stupid the way hunger does. Don\'t make big decisions this week. Just... don\'t."');
      const byIntel = {
        analytical: '"Learn one thing all the way down. Not ten things shallow — one thing deep. Depth is what saves you."',
        practical: '"Fix what\'s in front of you. The big problems solve themselves once the small ones stop bleeding."',
        social: '"Remember who did what for whom. Out here, that ledger is worth more than any skill."',
        observant: '"Watch the treeline at dusk. Not because something\'s there — because noticing is a muscle."',
        creative: '"Make something useless beautiful. It reminds you you\'re a person, not just a stomach."',
        steady: '"Keep going. That\'s the whole advice. Keep going."',
      };
      cands.push(byIntel[intel] || byIntel.steady);
      cands.push('"Sleep before you\'re tired. Drink before you\'re thirsty. The body\'s warning system was built for a safer world."');
      return cands;
    },
    t2fol_advice(vid) {
      const mistakes = ['trusted too fast, once', 'ate something I shouldn\'t have', 'didn\'t say the thing when I had the chance',
        'tried to carry everything myself', 'assumed tomorrow would be like today'];
      const m = mistakes[Math.floor(Math.random() * mistakes.length)];
      const f1 = ['"My biggest mistake? I ' + m + '. Cost me. Still paying, some days."'];
      const f2 = ['"What would I do differently? Everything slower. I rushed the beginning and I\'m still catching up."'];
      const f3 = [
        '"The real advice? Be useful. Not impressive — useful. Impressive fades by dinner."',
        '"And this: learn people\'s names. All of them. It\'s the cheapest thing you can give and the dearest."',
      ];
      return [f1, f2, f3];
    },

    // ---------- LOVED: someone waiting ----------
    t2gen_loved(vid) {
      const vp = this.vpOf(vid);
      const p = this.t2pers(vp);
      const grief = (this.state.village.grief || 0) > 0;
      const cands = [
        '"There was someone. There\'s always someone, isn\'t there?" A small, private smile.',
        '"I tell myself ' + (p.hope || 'we\'ll find each other') + '. Some days I even believe it."',
      ];
      if (grief) cands.push('"After this week — losing people — I don\'t know. I hope they\'re somewhere warm. That\'s all I\'ve got."');
      // NAME STABILITY (dialogue rethink, Steve 2026-10-07): the lost love's
      // name is a hard fact — once spoken it goes on the record (saidFacts)
      // and is reused, never re-rolled. "June" becoming "Silas" between
      // conversations was a real coherence break.
      if (this.t2trust(vid) >= 60) {
        let lovename = null;
        try { lovename = this.convoFactRecalled(vid, 'loved:name'); } catch (e) {}
        if (!lovename) {
          lovename = ['Mara', 'Ellis', 'June', 'Theo', 'Wren', 'Silas'][Math.floor(Math.random() * 6)];
          try { this.convoSaidFact(vid, 'loved:name', lovename); } catch (e) {}
        }
        cands.push('"Their name was ' + lovename + '. I haven\'t said that out loud in months."');
      }
      return cands;
    },
    t2fol_loved(vid) {
      const f1 = [
        '"If I saw them tomorrow? I wouldn\'t even speak at first. I\'d just... check. Hands, face. Make sure they\'re real."',
        '"I rehearse it, you know. What I\'d say. It\'s never the right words. It never needs to be."',
      ];
      const f2 = [
        '"Do I think they\'re alive? ...I have to. The alternative doesn\'t leave room for anything else."',
        '"Some nights I\'m sure. Some nights I do the math and it doesn\'t work. I choose the sure nights."',
      ];
      const vp = this.vpOf(vid);
      const f3 = [
        '"I {habitI} when I think about them. It\'s not much of a ritual, but it\'s mine."',
        '"{hope} — that\'s what I hold. It\'s thin, some days. But it holds."',
      ];
      return [f1, f2, f3];
    },

    // ---------- LATELY: the run, right now ----------
    t2gen_lately(vid) {
      const ev = this.t2LatelyEvent(vid);
      if (!ev) return [];
      const vp = this.vpOf(vid);
      switch (ev.kind) {
        case 'naming': {
          // The debate, in their words — gated descriptor, real proposals,
          // never the true name. Single quotes inside the quoted line keep
          // the quote layers clean.
          let desc = 'the beast';
          try { desc = this.monsterNoun(ev.mid) || this.monsterDisplayName(ev.mid); } catch (e) {}
          let props = [];
          try { props = Object.entries((this.ensureMonsterEntry(ev.mid) || {}).proposals || {}); } catch (e) {}
          // DEAD DON'T PUSH (journey-crisis r37 2026-10-21): proposals outlive
          // their proposers — the day after Rocco starved, the debate still
          // said "Rocco is pushing 'Loud-Eyes'". The living debate; a dead
          // villager's proposal stands in the vote count but isn't rendered
          // as present-tense campaigning.
          try {
            props = props.filter(p => { try { const vp = this.vpOf(p[0]); return !vp || !vp.dead; } catch (e2) { return true; } });
          } catch (e) {}
          const who = (p) => { try { return this.firstRef(p[0]); } catch (e) { return 'someone'; } };
          const p0 = props[0], p1 = props[1];
          return [
            '"Have you heard what they\'re calling ' + desc + '? ' +
              (p0 ? who(p0) + ' is pushing \'' + p0[1] + '\'. ' : '') +
              'Everyone\'s got a name for it and nobody agrees."',
            '"The whole fire was arguing about ' + desc + ' last night — what to even CALL it. ' +
              (p1 ? '\'' + p1[1] + '\' got shouted down. ' : '') + 'What\'s your vote?"',
          ];
        }
        case 'mourning': {
          // MULTI-MOURNING (journey-succession r16 2026-10-16): ev.names
          // carries every fresh villager corpse; single-name behavior and
          // tone are preserved exactly, multi-name gets its own templates.
          const mnames = (ev.names && ev.names.length) ? ev.names : (ev.name ? [ev.name] : []);
          let mlines;
          if (mnames.length >= 2) {
            const mlist = mnames.length === 2 ? mnames[0] + ' and ' + mnames[1]
              : mnames.slice(0, -1).join(', ') + ' and ' + mnames[mnames.length - 1];
            const mgone = mnames.length === 2 ? mnames[0] + ' is gone and ' + mnames[1] + ' is gone'
              : mnames.slice(0, -1).join(' is gone, ') + ' is gone, and ' + mnames[mnames.length - 1] + ' is gone';
            mlines = ['"We lost ' + mlist + ' this week. I keep setting out extra portions. Stupid."',
              '"' + mgone + ' and the world just... continues. That\'s the part I can\'t stand."',
              // R34 (2026-10-20, famine sense-test): the multi-mourning pool
              // repeated visibly (2 templates). Grief-through-routine voice.
              '"We lost ' + mlist + '. I do the headcount without thinking. Then I think."',
              '"' + mgone + '. The fire doesn\'t care. That\'s what gets me — the fire doesn\'t care."'];
          } else if (mnames.length === 1) {
            mlines = ['"Since ' + mnames[0] + ' died... I keep expecting to see ' + mnames[0] + ' at the fire. Stupid."',
               '"' + mnames[0] + ' is gone and the world just... continues. That\'s the part I can\'t stand."',
               // R34 (2026-10-20): single-name pool was 2 templates, repeated
               // across villagers. Same plainspoken grief-through-routine voice.
               '"' + mnames[0] + ' owed me a favor. I keep thinking about collecting. Stupid."',
               '"I dreamed ' + mnames[0] + ' was still here. Woke up angry at the dream. Stupid."',
               '"' + mnames[0] + ' always took the burnt piece. Said someone had to. I take it now."'];
          } else {
            mlines = ['"We lost someone. I keep setting out an extra portion. Stupid."',
               '"Grief doesn\'t schedule itself. It just shows up at dinner."',
               // R34 (2026-10-20): anonymous pool expansion, same voice.
               '"Another empty spot. I stopped counting the spots. That\'s worse, I think."',
               '"Someone died. The work didn\'t. That\'s the part that feels wrong."'];
          }
          // SICKNESS DEATH (journey crisis r8 2026-10-14): the village names
          // what took them — the outbreak and the grief are one story.
          if (ev.sickDeath && mnames.length) mlines.push(
            '"The sickness took ' + mnames[mnames.length - 1] + '. I keep washing my hands like it\'ll bring them back. Stupid."');
          // SUCCESSOR'S OWN GRIEF, convo half (journey-succession r23
          // 2026-10-18): when the lately-mourning names a dead bearer the
          // player was personally close to (bond v>=20 or depth>=1), the
          // villager can acknowledge the PLAYER's loss — not just their own.
          // Bearer-branch only (ev.bearerId): ordinary villager deaths keep
          // their own voice. Hostile bonds get no line — the village doesn't pry.
          if (ev.bearer && ev.bearerId && mnames.length === 1) {
            try {
              const _gb2 = this.bondGet ? this.bondGet(this.villagerId, ev.bearerId) : null;
              if (_gb2 && (((_gb2.v || 0) >= 20) || ((_gb2.depth || 0) >= 1))) {
                mlines.push('"I know you and ' + mnames[0] + ' were close. I\'m sorry."');
              }
            } catch (e) {}
          }
          return mlines;
        }
        case 'threat':
          return ['"That thing — ' + (ev.note || 'by the treeline') + '. I keep seeing it when I blink."',
            '"I don\'t scare easy. I\'m scared. There. I said it out loud."'];
        case 'defense': {
          // DEFENSE MEMORY (journey crisis r6 2026-10-13): the note is
          // already first-person ("I put down a shaggy-furred beast at the
          // treeline") and knowledge-gated (monsterNoun, never the true
          // name). Wrap it in the defender's own voice — this is THEIR
          // night, not a rumor.
          const dnote = ev.note || '';
          return ['"That night — ' + dnote + '. I keep hearing it when I try to sleep."',
            '"You want to know what I did in the raid? ' + dnote + '. Don\'t call it brave. Call it awake."'];
        }
        case 'betrayal': {
          const aboutPlayer = /promise_broken|caught_you_stealing|suspects_you/i.test((ev.mem && ev.mem.t) || '');
          return aboutPlayer
            ? ['"Someone broke a promise to me. I\'m looking at them." A pointed pause. "You know what you did."',
               '"Trust is a currency, and I\'m feeling poor right now. Your move."']
            : ['"Someone here broke their word. I won\'t say who. But the fire feels colder."'];
        }
        case 'outbreak': {
          // OUTBREAK (journey crisis r8 2026-10-14): the sick row is the
          // news. Symptom-gated (ev.desc), never the disease name. The sick
          // villager themself gets the first-person variant.
          const n = ev.n || 2, desc = ev.desc || 'a bad gut sickness';
          if (ev.self) return [
            '"I\'m down with it too — ' + desc + '. Wash your hands after, seriously."',
            '"It\'s got me as well. ' + desc + ', can barely keep water down. Half the fire\'s got it."',
          ];
          return [
            '"' + n + ' of us are down with ' + desc + '. Boil everything. I mean everything."',
            '"Have you seen the sick row? ' + n + ' down with ' + desc + '. Nobody says it out loud but everyone\'s counting."',
          ];
        }
        case 'weirdness': {
          // WEIRDNESS (journey crisis r16 2026-10-15): the changed are the
          // news. Symptom-honest (ev.desc), never the quirk's true name —
          // the transformations are visible, the names aren't common
          // knowledge. The changed villager themself gets the first-person
          // variant, naming their own symptom.
          const wn = ev.n || 2, wdesc = ev.desc || 'changing';
          const wself = ev.selfDesc || wdesc;
          if (ev.self) return [
            '"It\'s me. ' + wself + ' — you\'ve seen it. I don\'t know what it means yet."',
            '"Since the meat — ' + wself + '. Don\'t look away. Please."',
          ];
          const wnames = (ev.names || []).filter(Boolean);
          const who = wnames.length ? wnames.join(' and ') : 'a couple of us';
          const areChanging = wn === 1
            ? '"One of us is changing. '
            : '"' + wn + ' of us are changing. ';
          return [
            '"Have you seen ' + who + '? ' + wdesc + '. Since the strange meat. Nobody taught them that."',
            areChanging + who + ' — ' + wdesc + '. The fire keeps going quiet when they walk up."',
          ];
        }
        case 'show': {
          // SHOW (journey crisis r17 2026-10-15): the village talks about the
          // grab. The participant gets the first-person variant; bystanders
          // name the taken (firstRef, knowledge-gated). The contest name is
          // the System's own title — the village heard it announced.
          // SHOW-DEATH (journey crisis r23 2026-10-18): when a taken villager
          // DIED on camera (ev.died, recorded by _cxKillContestant), the lines
          // grieve the outcome — never the abduction alone, and never "came
          // back like nothing happened" for someone who didn't come back
          // (transcript-verified 2026-10-18).
          const cname = ev.name || 'a contest';
          let _diedNames = [];
          let _diedN = 0;
          try {
            const _diedIds = (ev.died || []).filter(id => id && id !== 'player');
            _diedN = _diedIds.length;
            _diedNames = _diedIds
              .map(id => { try { return this.firstRef(id); } catch (e) { return null; } })
              .filter(Boolean).slice(0, 2);
          } catch (e) {}
          const _dn = _diedNames.length ? _diedNames.join(' and ') : null;
          if (ev.self) {
            // A survivor of a multi-take where someone died beside them.
            // (The dead never talk — self-dead is impossible here.)
            if (_diedN && _dn) return [
              '"I was there — ' + cname + ', on the screens. ' + _dn + ' didn\'t make it back. I\'m still turning it over."',
              '"The whole fire watched. ' + _dn + ' is gone. The cameras kept rolling."',
            ];
            if (_diedN) return [
              '"I was there — ' + cname + '. Not everyone came back. I\'m still turning it over."',
              '"The whole fire watched. The cameras kept rolling."',
            ];
            return [
              '"They took me. ' + cname + ' — up there, on the screens, in front of everyone. I\'m still turning it over."',
              '"You saw it too, right? ' + cname + '. Tell me I didn\'t imagine the lights."',
            ];
          }
          if (_diedN && _dn) return [
            '"They took ' + _dn + ' — ' + cname + ', on the screens. ' + (_diedN > 1 ? 'Neither came home' : 'They didn\'t come home') + '."',
            '"The whole fire watched ' + cname + '. ' + _dn + ' is gone — the cameras kept rolling."',
          ];
          if (_diedN) return [
            '"They took some of us — ' + cname + ', on the screens. Not everyone came home."',
            '"The screens showed everything. The fire\'s quieter tonight."',
          ];
          let taken = 'some of us';
          try {
            const _names = (ev.ids || [])
              .filter(id => id && id !== 'player' && id !== vid)
              .map(id => { try { return this.firstRef(id); } catch (e) { return null; } })
              .filter(Boolean);
            if (_names.length) taken = _names.slice(0, 2).join(' and ');
            else if ((ev.ids || []).indexOf('player') >= 0 || (ev.ids || []).indexOf(this.villagerId) >= 0) taken = 'you';
          } catch (e) {}
          return [
            '"They took ' + taken + ' — ' + cname + ', on the screens. The whole fire watched. Nobody knew where to look."',
            '"' + cname + '. They just... took ' + taken + '. Came back like nothing happened. It wasn\'t nothing."',
          ];
        }
        case 'table': {
          // TABLE (journey endgame r11 2026-10-14; ported 2026-10-15): the
          // village acknowledges the System's summons. Knowledge-gated:
          // villagers describe what they SEE (the table, the doors, the
          // waiting) — never the path mechanics, which belong to the player.
          // The table is televised (endgame design), so the done-lines may
          // witness the outcome.
          const ph = ev.phase || 'sitting';
          if (ph === 'waiting') return [
            '"They say the table\'s coming. For us. I keep thinking about what we\'d even bring to it."',
            '"Have you felt it? Like the air before a storm, but — bigger. Something\'s on its way."'];
          if (ph === 'deferred') return [
            '"Ninety dawns, it said. It kept its word before — I believe it\'ll keep this one. The table will still be here."',
            '"It told us to come back when the village has seen ninety dawns. Like it\'s patient. Like it can afford to be."'];
          if (ph === 'done') {
            const path = ev.path || '';
            const seen = {
              feared: '"I watched the table. We all watched. I\'m still deciding how I feel about what I saw."',
              beloved: '"The whole village was cheering at the table. I cried. I\'m not ashamed of it."',
              witness: '"The trial — you put THEM on trial at the table. I testified in my head the whole time."',
              defiant: '"You walked away from the table. From THAT. I don\'t know whether you\'re brave or out of your mind."',
              assimilated: '"You went into the table. Part of you didn\'t come back — I can tell. We all can."',
              relay: '"You\'re still you after the table, right? Blink twice if it kept a copy."',
              indispensable: '"The treaty at the table. You wrote us into the fine print of the universe."',
            }[path];
            return [
              seen || '"You did it. Whatever it was, up there — you did it. The table\'s gone quiet now."',
              '"People will tell this one for years. I was there. I get to say I was there."'];
          }
          // sitting (default): the table is HERE, unanswered.
          return [
            '"It\'s here. The table. I walked past where it sits three times today. I don\'t know what I\'m waiting for."',
            '"Nobody says it out loud, but everyone\'s counting — how long before you answer it? Seven doors. I counted."'];
        }
        case 'realm': {
          // REALM (journey scale r1 2026-10-15): the village talks about the
          // court in its own voice, shape-aware. The primary's name is
          // knowledge-gated (_ovName); the shapes are public (the court sat
          // openly). Villagers describe what the realm MEANS for them —
          // tribute, the court, the oath — never the mechanics.
          var sh = ev.shape || 'lead';
          var pnm = null;
          try { if (this.state.nationalPrimary) pnm = this._ovName(this.state.nationalPrimary); } catch (e) {}
          if (sh === 'belong') return [
            '"We swore to ' + (pnm || 'them') + '. The oath\'s sealed. We\'re somebody\'s now — I keep waiting to feel different."',
            '"Five thousand kcal a week walks out of our pantry to ' + (pnm || 'them') + '. The relationship holds. That\'s what they say, anyway."'];
          if (sh === 'covenant') return [
            '"No thrones. A circle of speakers and a shared granary. The audience has never seen one survive — well. We\'ll show them."',
            '"The pool\'s open — grain in from every fire, grain out when someone\'s hungry. We all feel it now."'];
          if (sh === 'trade') return [
            '"Signed the charter. Tariffs, ledgers, routes. No swords — written plainly, so nobody can pretend otherwise."',
            '"We\'re a ledger now. Four fires on the same books. The traders are already acting like they own the road."'];
          if (sh === 'conquest') return [
            '"They knelt because they lost. I watched it happen. I don\'t know what I\'m supposed to feel."',
            '"The realm\'s ours and it cost blood. Their grain comes in heavy now — and they hate us for it."'];
          // lead (default): Haven holds the high seat.
          return [
            '"Four fires, one head — and the head is us. The speakers rode in and... I still can\'t quite believe it."',
            '"Tribute\'s coming IN now. Their grain, our fire. Feels strange to be on this end of it."'];
        }
        case 'tension':
          return ['"Everyone\'s choosing sides and pretending they aren\'t. I hate it."',
            '"You feel that? The air before a storm. That\'s the village right now."'];
        case 'hunger':
          return ['"My stomach\'s been talking louder than me lately. ' + (ev.n || 'Several') + ' of us are running on empty."',
            '"Hunger makes people strange. Watch for it — in me, too."'];
        case 'care': {
          // CARE (journey crisis r18 2026-10-16): the village remembers who
          // sat with whom through the fever. Names knowledge-gated via
          // firstRef (the r8/r17 pattern). The cured variant is the patient
          // cured by the player's hands — the curer is always 'you'.
          // WOUND VARIANT (journey crisis r19 2026-10-16): healerRounds books
          // the same kinds with wound:true for combat-wound tending — the
          // lines stay wound-flavored (bound up / cut), never fever.
          if (ev.cured) return [
            '"I was gone — burning up, nothing left. You pulled me back. I don\'t have words for that."',
            '"The fever had me and you didn\'t leave. That\'s the whole story."',
          ];
          if (ev.wound) {
            if (ev.self) {
              let who = 'someone';
              try { if (ev.medic && typeof this.firstRef === 'function') who = this.firstRef(ev.medic) || 'someone'; } catch (e) {}
              return [
                '"' + who + ' bound up my cut proper — cleaned it, wrapped it tight. I don\'t forget that."',
                '"When I was bleeding, ' + who + ' stayed and did the work. That\'s what I keep coming back to."',
              ];
            }
            let pat = 'them';
            try { if (ev.patient && typeof this.firstRef === 'function') pat = this.firstRef(ev.patient) || 'them'; } catch (e) {}
            return [
              '"I bound up ' + pat + ' — cleaned it out, wrapped it tight. Someone had to, and I know what to do."',
              '"' + pat + ' was bleeding. I did what I could. That\'s the job."',
            ];
          }
          if (ev.self) {
            let who = 'someone';
            try { if (ev.medic && typeof this.firstRef === 'function') who = this.firstRef(ev.medic) || 'someone'; } catch (e) {}
            return [
              '"' + who + ' sat with me through the worst of it — cool cloth, bitter tea, watching my breathing. I don\'t forget that."',
              '"When the fever had me, ' + who + ' stayed. That\'s what I keep coming back to."',
            ];
          }
          let pat = 'them';
          try { if (ev.patient && typeof this.firstRef === 'function') pat = this.firstRef(ev.patient) || 'them'; } catch (e) {}
          return [
            '"I sat with ' + pat + ' through the fever — cool cloth, bitter tea. Someone had to, and I know what to do."',
            '"' + pat + ' was burning up. I did what I could. That\'s the job."',
          ];
        }
        case 'muster': {
          // MUSTER (journey crisis r20 2026-10-17): the shared story — the
          // village behind the barred hall door while the horde hunts.
          // The threat noun was knowledge-gated at booking (monsterNoun);
          // active vs past is read live from the episode flag.
          let active = false;
          try { active = !!((this.state.village || {}).shelterMustered); } catch (e) {}
          const th = ev.threat || 'something';
          if (active) return [
            '"We\'re behind the hall door with it barred — ' + th + ' hunts the treeline. We outlast it. That\'s the whole plan."',
            '"Nobody walks the treeline while ' + th + ' is out there. Inside, door barred, we wait it out."',
          ];
          return [
            '"When ' + th + ' came hunting near Haven, we got everyone inside and barred the hall door. Nobody walked the treeline that night."',
            '"I\'ll remember that night — the whole village behind one barred door, listening to ' + th + ' hunt. We outlasted it."',
          ];
        }
        case 'gratitude':
          return ['"Someone helped me recently. I\'m still turning it over — people don\'t do that for nothing, out here. Or maybe they do now."'];
        case 'cheer':
          return ['"Something good happened. I almost don\'t trust it. When did I get like this?"'];
        default:
          return [];
      }
    },
    t2fol_lately(vid) {
      const ev = this.t2LatelyEvent(vid);
      const kind = ev ? ev.kind : 'none';
      // MOURNING POOLS (journey deepening r9 2026-10-13): three variants per
      // follow-up level. Every grieving villager used to recite the identical
      // single-line sequence (transcript-verified on two seeds: "It just keeps
      // my hands from shaking." / "There's no step four." / "Someone has to do
      // it properly." — verbatim, same order, two different villagers). The
      // unique-person law (Steve 2026-10-06) means grief can't be a global
      // script: variants use the villager's own habit ({habitI}, filled by
      // t2fill) and the dead person's knowledge-gated name ({mname}, filled
      // below — ev.name is firstRef, never a raw id or a truncated "A").
      // convoPick's run-ledger preference then spreads variants across the
      // village instead of echoing one line. Other kinds keep their single
      // lines for now (same thinness exists there — documented, not fixed).
      // LATELY POOLS (journey deepening r9/r10 2026-10-13): three variants
      // per follow-up level for EVERY kind. R9 transcript-verified that
      // every grieving villager recited the identical single-line sequence
      // verbatim ("It just keeps my hands from shaking." — two villagers,
      // two seeds, same order); R10 extends the same treatment to the other
      // kinds, which had the identical thinness. The unique-person law
      // (Steve 2026-10-06) means "what's new with you" can't be a global
      // script: variants use the villager's own habit ({habitI}, filled by
      // t2fill). {mname} is only substituted for mourning — ev.name is only
      // set on the mourning branch, and 'them' would read wrong for the
      // other kinds (deliberate, not an omission). convoPick's run-ledger
      // preference spreads variants across the village instead of echoing
      // one line. Variant 0 of each pool is always the original line: tone
      // preserved, pool deepened.
      const cope = {
        naming: ['"I\'m staying out of the naming fight. For now. Someone always gets precious about their pick."',
          '"I have opinions about the name. I am saving them for when they count."',
          '"Names are for when it\'s dead or known. Right now it\'s neither, so I {habitI} instead."'],
        mourning: ['"I {habitI}. It doesn\'t bring anyone back. It just keeps my hands from shaking."',
          '"I keep turning over the last thing {mname} said to me. I can\'t tell if I\'m remembering it right, and that\'s somehow the worst part."',
          '"Sleep\'s gone strange. I {habitI} at odd hours now. Whatever gets me to morning."'],
        threat: ['"I sleep with my boots on now. That\'s where we are."',
          '"I {habitI} to keep my hands steady. They notice. Let them."',
          '"Counted the treeline twice tonight. Old habit. New reason."'],
        defense: ['"I {habitI} when it gets loud in my head. The treeline gets loud in my head."',
          '"My hands stopped shaking two days ago. I\'m calling that healed."',
          '"I keep touching the spot where it grazed me. Like it\'ll explain itself."'],
        outbreak: ['"I {habitI} between tending rounds. Someone has to keep the water boiled."',
          '"I don\'t sleep much when the sick row\'s full. I {habitI} instead."',
          '"Wash your hands. I say it ten times a day now. Wash your hands."'],
        weirdness: ['"I {habitI} and try not to stare. Everybody\'s trying not to stare. Nobody\'s succeeding."',
          '"Changed is changed. I watch for what it DOES, not what it looks like."',
          '"I keep my distance from the changed ones at night. Not proud of it. Just honest."'],
        table: ['"I {habitI} when I think about what it wants from us. It wants something. Everything wants something."',
          '"I keep my eyes down when I pass it. Respect, maybe. Fear, probably. Both."',
          '"Seven doors and it chose US. I {habitI} and try to feel chosen instead of chosen-at."'],
        betrayal: ['"I\'m watching. That\'s what I do now — I watch."',
          '"I {habitI} and count who shows up on time. Lists help."',
          '"Trust got re-priced. I\'m just reading the new numbers."'],
        tension: ['"I stay out of it. Mostly. It\'s getting harder."',
          '"I {habitI} when the fire gets loud. Everyone\'s got a tell. That\'s mine."',
          '"I eat fast and leave early. Not hiding. Just — scheduling."'],
        hunger: ['"Small meals. Slow. Pretend it\'s a choice."',
          '"I {habitI} when my stomach gets loud. Everyone hears it. We all pretend we don\'t."',
          '"Boiled greens taste like optimism if you concentrate."'],
        gratitude: ['"I\'ll pay it forward. That\'s the only math that works."',
          '"I {habitI} and think about who I owe. The list is getting long. Good long."',
          '"I sleep easier. That\'s new. I notice new things now."'],
        cheer: ['"I\'m letting myself feel it. That\'s new."',
          '"I {habitI} and grin like an idiot. Let the record show."',
          '"Saving this one. Putting it somewhere I can find it later."'],
        none: ['"Ask me tomorrow. Everything changes by tomorrow."',
          '"I {habitI}. It passes the time. The time passes anyway."',
          '"Same weather, different day. I keep notes."'],
      };
      const next = {
        naming: ['"We\'ll land on something. We always do — usually the loudest person\'s idea."',
          '"The fire\'ll settle it. It settles everything, eventually."',
          '"Give it three more days of arguing. Then someone says the obvious thing and we all pretend it was theirs."'],
        mourning: ['"We bury, we grieve, we keep going. There\'s no step four."',
          '"Nobody says {mname}\'s name right yet. We will. Give it a few days."',
          '"The fire feels smaller without {mname}. The rest of us will have to be bigger."'],
        threat: ['"We set a better watch. We always say that. This time we mean it."',
          '"We\'ve started leaving the fire high. Nobody says why. Everybody knows why."',
          '"Tomorrow we walk the whole perimeter. I take the east stretch. I always take the east stretch."'],
        defense: ['"Next time they come, somebody has to meet them. I\'d rather it be me than someone greener."',
          '"We lost the illusion that the treeline holds itself. That\'s a kind of progress."',
          '"Next time I go out there, I {habitI} first. Calms the aim."'],
        outbreak: ['"We need whoever knows sickness tending full-time. That\'s the whole plan."',
          '"Boiled water, clean hands, rest. It\'s not much of a plan but it\'s the plan."',
          '"If it takes anyone else we bury them properly. That\'s the deal we made."'],
        weirdness: ['"Nobody eats the strange meat alone anymore. That\'s the new rule. Unspoken, but it\'s the rule."',
          '"We watch the changed ones. Not cruel — careful. There\'s a difference. We keep telling ourselves that."',
          '"If the meat did this, the cook needs to know before the next haul. Someone has to say it."'],
        table: ['"Whatever door it is — it\'ll still be there tomorrow. That\'s the worst part. The patience."',
          '"Someone has to answer it eventually. Everyone\'s doing the math on whether it\'ll be them."',
          '"We should talk about what we\'d ask for. Before it asks first."'],
        betrayal: ['"Either it gets talked out or it festers. I know which one I\'d bet on."',
          '"A moot could clear it. If anyone has the stomach to call one."',
          '"It\'ll surface. Things like that always surface — usually at the worst hour."'],
        tension: ['"Someone has to say the thing nobody\'s saying. Probably won\'t be me."',
          '"It\'ll break at a moot or it\'ll break at midnight. I\'m betting moot."',
          '"We need something to DO together. Joint work fixes more than joint talking."'],
        hunger: ['"We need food. Everything else is decoration until that\'s solved."',
          '"Someone should run the trapline twice today. I said it at the fire. I\'m saying it again."',
          '"The pantry decides the mood. That\'s just math now."'],
        gratitude: ['"Maybe we\'re becoming something. Something that helps."',
          '"If this holds, the new folks get the same. That\'s the deal now."',
          '"We should say it out loud at the fire. The good thing. Before we forget to."'],
        cheer: ['"More of this. Whatever this was — more."',
          '"We should make a habit of this. Put it on the rota."',
          '"Tomorrow\'s problems can wait one night. I said it. I meant it."'],
        none: ['"Same as always: we endure."',
          '"We\'ll see what the treeline brings. We always do."',
          '"The plan is the plan until it isn\'t. Then we make a new one."'],
      };
      const part = {
        naming: ['"My vote? I\'m keeping it to myself until the shouting stops."',
          '"I listen to everyone and nod. It\'s a strategy. Probably."',
          '"My part? I {habitI} and stay neutral until there\'s a winner."'],
        mourning: ['"My part? I remember them. Someone has to do it properly."',
          '"I\'m picking up {mname}\'s share of the work. Someone should, and it might as well be me."',
          '"I {habitI} for {mname}, now. Feels right. Feels like the least I can do."'],
        threat: ['"I take the watch nobody wants. It\'s the least useless thing I can do."',
          '"My part? I {habitI} at odd hours and call it being useful."',
          '"I check on the new ones before I sleep. Someone should."'],
        defense: ['"My part? I was at the door. I\'ll be at the door again."',
          '"I stand where I stood. That\'s the whole of my plan."',
          '"Someone has to show the new folks where the door IS. That\'s me now, I guess."'],
        outbreak: ['"My part? I carry water to the sick row. Someone has to."',
          '"I {habitI} and check on them at every bell. It\'s not nothing."',
          '"I sit with them when the fever\'s bad. Company counts as medicine. Almost."'],
        weirdness: ['"My part? I don\'t flinch. Or I try not to. They notice the trying, I think."',
          '"I talk to them like nothing\'s different. Because the person isn\'t different. Right?"',
          '"I {habitI} near them, casual. Normal is a thing you can give someone."'],
        table: ['"My part? I keep the fire lit where it sits. Somebody should tend the waiting."',
          '"I {habitI} and practice what I\'d say. In case it ever asks me. It won\'t. Still."',
          '"I tell the new ones: don\'t touch it, don\'t mock it, don\'t turn your back on it."'],
        betrayal: ['"I keep my word. Someone around here has to."',
          '"My part? I don\'t gossip about it. That\'s harder than it sounds."',
          '"I give them exactly what they give me. No more loans."'],
        tension: ['"I talk to both sides. It hasn\'t exploded yet."',
          '"My part? I {habitI} and pretend I\'m not choosing sides."',
          '"I carry water for everyone. Water doesn\'t take sides."'],
        hunger: ['"I share what I have. It isn\'t much. It\'s something."',
          '"My part? I forage the ugly patches nobody else wants. They produce."',
          '"I chew slow and smile. Morale\'s a food group too."'],
        gratitude: ['"I say thank you like I mean it. Because I do."',
          '"My part? I {habitI} for the ones who helped. Small. Real."',
          '"I teach what I learned from it. That\'s the only thank-you that compounds."'],
        cheer: ['"I laugh. Out loud. It startles people."',
          '"My part? I {habitI} to keep the mood up. It\'s a job. I take it."',
          '"I tell the story back at the fire. Embellished. As is tradition."'],
        none: ['"I show up. That\'s my part."',
          '"My part? I {habitI} and stay ready."',
          '"I do the small things right. The big things notice."'],
      };
      const mname = (ev && ev.name) || 'them';
      const nm = (arr) => (arr || []).map(l => String(l).replaceAll('{mname}', mname));
      // WEIRDNESS SELF (journey crisis r16 2026-10-15): the changed villager
      // themself gets first-person follow-ups — the observer pools ("try not
      // to stare") read wrong in their mouth.
      if (kind === 'weirdness' && ev && ev.self) {
        const selfCope = ['"I {habitI} so people have something else to look at."',
          '"I catch them staring. I stare back now. It\'s the only power I have left."',
          '"I eat apart. Not because they asked. Because it\'s easier."'];
        const selfNext = ['"It\'ll pass. They say it passes. I\'m counting the days."',
          '"If it doesn\'t pass, I learn to live loud. That\'s the plan."',
          '"Someone has to be first through this. Might as well be me."'];
        const selfPart = ['"My part? I don\'t hide it. Hiding makes it worse."',
          '"I answer their questions. Even the stupid ones. Especially the stupid ones."',
          '"I {habitI} and let them look. Looking is better than whispering."'];
        return [nm(selfCope), nm(selfNext), nm(selfPart)];
      }
      return [nm(cope[kind] || cope.none), nm(next[kind] || next.none), nm(part[kind] || part.none)];
    },
  };

  Object.assign(Game, methods);
})();
