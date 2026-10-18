// @ontology
// system: memdepth
// description: Social-memory readers (Steve 2026-10-13): previously write-only memory types get read sites; villager-to-villager deed/grievance recall; inter-village grievances as recallable events instead of bare opinion numbers.
// provides:
//   - grievanceSay(kind)
//   - grievanceNoteFor(by, against)
//   - convoGrievanceLine(vid, oid)
//   - deedMemLine(vid, oid)
//   - stampKillWitnesses(vid, mName, allyVids)
//   - ovEvent(villageId, what, why, dir)
//   - ovGrievanceNote(why)
//   - ovGrievances(villageId)
//   - ovOpinionExplain(villageId)
// rules:
//   - names_at_read: memory notes never bake true names — displayName/firstRef resolve at read time (code: memdepth.js, grievanceSay/grievanceNoteFor/deedMemLine/ovOpinionExplain; Steve 2026-10-06 unique-person law)
//   - grievance_is_event: recordGrievance kinds render as human phrases ("what happened on the trail"), not bare kind strings (code: memdepth.js, grievanceSay)
//   - village_grievance_is_event: negative opinion moves stamp ov.events with a human why — "opinion -40" is never the whole story (code: memdepth.js, ovEvent/ovGrievanceNote; hierarchy.js, _nudgeOpinion hook)
//   - witnesses_remember: villagers who fought beside a killer remember the kill with subject=doer, so "I was there when X killed it" is ledger-backed (code: memdepth.js, stampKillWitnesses)
// consumes:
//   - remember(rid, type, note, extra), displayName(id), firstRef(id)
//   - state.village.memory, state.village.betrayal.grievances, state.otherVillages
//   - _otherVillage(id), _ovName(id)
// ============ SOCIAL MEMORY READERS (Steve 2026-10-13) ============
// Steve's gap: many memory types were write-only, villager-to-villager
// memory was sparse, and inter-village grievances were numeric trust
// rather than recallable events. This module is the reader layer — it
// wires reads, never writes new fiction. Names resolve at read time so
// the knowledge gate (strangers are descriptors, not names) holds.

(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  const methods = {
    // grievanceSay: human phrase for a recordGrievance kind. The grievance
    // ledger stores kinds ('voted_guilty', 'ambushed'...); this is what a
    // villager actually SAYS when asked what the other did.
    grievanceSay(kind) {
      const PH = {
        ambushed: 'what happened on the trail',
        voted_guilty: 'voting guilty at the moot',
        voted_acquit: 'voting to let them walk at the moot',
        abandoned_alliance: 'walking away from the alliance',
        false_accusation: 'the false accusation at the moot',
        stolen_from: 'stealing from their pack',
        suspected_theft: 'the missing rations',
        voted_for_petitioners: 'voting to take the petitioners in',
        turned_away_petitioners: 'voting to turn the petitioners away',
      };
      return PH[kind] || String(kind || 'old history').replace(/_/g, ' ');
    },

    // grievanceNoteFor: the latest recorded grievance `by` holds against
    // `against`, rendered as a human note. null when none.
    grievanceNoteFor(by, against) {
      try {
        const grs = (((this.state.village || {}).betrayal || {}).grievances) || [];
        let best = null;
        for (const gr of grs) {
          if (gr && gr.by === by && gr.against === against && (!best || (gr.day || 0) >= (best.day || 0))) best = gr;
        }
        if (!best) return null;
        return { kind: best.kind, day: best.day, phrase: this.grievanceSay(best.kind) };
      } catch (e) { return null; }
    },

    // convoGrievanceLine: "Mira still hasn't forgiven Tomas for ..." — the
    // read site for recordGrievance between two villagers. Names are
    // knowledge-gated at read (displayName), never baked.
    convoGrievanceLine(vid, oid) {
      try {
        const g = this.grievanceNoteFor(vid, oid);
        if (!g) return null;
        const nm = this.displayName(oid);
        const temp = (this.npcTemper ? this.npcTemper(vid) : 'steady');
        const ago = Math.max(0, ((this.state.scholar || {}).day || 0) - (g.day || 0));
        const agoS = ago <= 0 ? ' ' : ago === 1 ? ' — yesterday — ' : ` — ${ago} days back — `;
        if (temp === 'bold') {
          return `"${nm}?" A muscle moves in their jaw. "${g.phrase}${agoS}I still haven't forgiven that."`;
        }
        return `"${nm}.${agoS}Some doors stay closed. I still haven't forgiven them for ${g.phrase}."`;
      } catch (e) { return null; }
    },

    // deedMemLine: what vid remembers about oid's DEEDS — scanned from
    // oid's own memory (their kills, their duels, their blame) and from
    // vid's subject-stamped witness memories ("I was there when...").
    // This is the villager-to-villager memory read: villagers remember
    // things about EACH OTHER, not just about the player.
    deedMemLine(vid, oid) {
      try {
        const v = this.state.village || {};
        const day = (this.state.scholar || {}).day || 0;
        const nm = this.displayName(oid);
        const vp = (this.data.villagers || []).find(x => x.id === oid) || {};
        const pro = vp.pro || 'they';
        const She = pro === 'they' ? 'They' : pro === 'she' ? 'She' : 'He';
        const she = pro === 'they' ? 'they' : pro;
        const her = pro === 'they' ? 'them' : pro === 'she' ? 'her' : 'him';
        // 1. witnessed kills: vid was there when oid killed. Strongest read.
        const mine = ((v.memory || {})[vid]) || [];
        for (let i = mine.length - 1; i >= 0; i--) {
          const m = mine[i];
          if (m && m.t === 'saw_kill' && m.subject === oid && day - (m.day || 0) <= 14) {
            const what = String(m.note || 'the beast').replace(/^watched .*? kill /, '');
            return `"${nm}? I was there. ${She} stood over ${what} and the whole patrol went quiet. Don't tell ${her} I brag about ${her}."`;
          }
        }
        // 2. oid's own deed memories, fresh enough to talk about.
        const theirs = ((v.memory || {})[oid]) || [];
        for (let i = theirs.length - 1; i >= 0; i--) {
          const m = theirs[i];
          if (!m || day - (m.day || 0) > 14) continue;
          if (m.t === 'hero') {
            const what = String(m.note || '').replace(/^killed /, '') || 'a monster';
            return `"${nm}? ${She} killed ${what}. Out there, alone with it. I sleep better knowing ${she}'s on patrol."`;
          }
          if (m.t === 'lost_duel') {
            return `"${nm} yielded. Witnessed, in front of everyone. Takes more guts to yield than most people have to fight."`;
          }
          if (m.t === 'grudging_respect') {
            return `"${nm} stopped coming at the leadership. ...I think ${She}'s still watching, though. Aren't we all."`;
          }
          if (m.t === 'heckled') {
            return `"${nm} got heckled on camera. The whole village saw their face. I'd be angry too."`;
          }
          if (m.t === 'blame') {
            // the note names the victim ("their cooking sickened X") — the
            // name was baked at write by the game's descriptor-safe helper;
            // keep it whole, never collapse it. Possessives only attach to
            // real names; descriptors get a clause ("what she cooked").
            const who = String(m.note || '').replace(/^their cooking sickened /, '') || 'someone';
            const whoS = String(/^an? /i.test(who) ? who : who.split(' ')[0] || 'someone');
            const WhoS = whoS.charAt(0).toUpperCase() + whoS.slice(1);
            const cookFood = /^an? /i.test(nm) ? `what ${She.toLowerCase()} cooked` : `${nm}'s cooking`;
            return `"${WhoS} went down after eating ${cookFood}. Nobody says it to ${her} face — but nobody's asked for seconds since, either."`;
          }
        }
      } catch (e) {}
      return null;
    },

    // stampKillWitnesses: the allies who fought beside vid get a
    // subject-stamped witness memory — the ledger behind "I was there."
    // Call from kill branches where the witness list is known.
    stampKillWitnesses(vid, mName, allyVids) {
      try {
        const first = (() => { try { return String(this.displayName(vid)).split(' ')[0]; } catch (e) { return 'someone'; } })();
        for (const aid of (allyVids || [])) {
          if (!aid || aid === vid) continue;
          this.remember(aid, 'saw_kill', `watched ${first} kill ${mName}`, { subject: vid });
        }
      } catch (e) {}
    },

    // ---------- inter-village grievances as events ----------
    // ov.events: [{day, what, why, dir}] — 'dir' is 'haven' (we did it to
    // them) or 'theirs' (they did it to us). The opinion number moves
    // through _nudgeOpinion; the EVENTS are what a villager can name.
    ovEvent(villageId, what, why, dir) {
      try {
        const ov = this._otherVillage ? this._otherVillage(villageId) : null;
        if (!ov || !what) return;
        ov.events = ov.events || [];
        ov.events.push({ day: (this.state.scholar || {}).day || 0, what: String(what), why: why || '', dir: dir || 'haven' });
        if (ov.events.length > 20) ov.events.shift();
      } catch (e) {}
    },

    // ovGrievanceNote: why→human phrase for auto-stamped opinion moves.
    ovGrievanceNote(why) {
      const PH = {
        raid: 'Haven raided our stores',
        'raid-withdrawn': 'Haven mustered a war party, then stood it down — they remember the almost',
        'yield-terms': 'Haven came with a war party and named terms',
        'cold-ask': 'Haven came knocking again with nothing new to offer',
        'cold-ink': 'Haven sent nothing — the ink dried on its own',
        'sweetener-taken': 'Haven took the gift-food and turned them away anyway',
        'counter-refused': 'Haven walked from the counter-offer',
        'tribute-short': "Haven's tribute came up short",
        'yoke-tightened': 'Haven raised the tribute',
        revolt: 'Haven\'s yoke was thrown off',
        'faith-broken': 'Haven broke faith',
        insult: "Haven's speaker insulted theirs",
        'contest-death': 'a Haven champion died on the broadcast',
        'envoy-turned': 'Haven turned their envoy away',
      };
      return PH[why] || ('Haven ' + String(why || 'acted').replace(/_/g, ' '));
    },

    // ovGrievances: the recallable bad history with a village, newest first.
    ovGrievances(villageId) {
      try {
        const ov = this._otherVillage ? this._otherVillage(villageId) : null;
        const evs = (ov && ov.events) || [];
        return evs.slice().reverse();
      } catch (e) { return []; }
    },

    // ovOpinionExplain: "their opinion is -40" becomes a sentence with the
    // events behind it. Used in courtship decline lines and the neighbors
    // gossip topic — the number is never the whole story.
    ovOpinionExplain(villageId) {
      try {
        const ov = this._otherVillage ? this._otherVillage(villageId) : null;
        if (!ov) return '';
        const op = ov.opinion || 0;
        const evs = this.ovGrievances(villageId).slice(0, 3);
        if (!evs.length) {
          return op <= -20 ? ` (Opinion ${op}: old history, nothing fresh — give it weeks, not days.)` : '';
        }
        const bits = evs.map(e => {
          const ago = Math.max(0, ((this.state.scholar || {}).day || 0) - (e.day || 0));
          const when = ago <= 0 ? 'today' : ago === 1 ? 'yesterday' : `${ago} days back`;
          return `${e.what} (${when})`;
        });
        const nm = (this._ovName ? this._ovName(villageId) : null) || 'they';
        return ` (Opinion ${op} — ${nm} remembers: ${bits.join('; ')}. That's not a number to them. That's what happened.)`;
      } catch (e) { return ''; }
    },
  };

  for (const k of Object.keys(methods)) Game[k] = methods[k];
})();
