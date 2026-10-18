// @ontology
// system: exposure
// description: The exposure source — the village keeps the list. Every truth dragged into the light is a real, attributable event (who exposed whom for what, when), recorded on the kept list and counted on ledger.exposed. Sources: villagers naming lies (gossip + the fire-side beat), confessions (truth.js), bribery exposed at the moot (betrayal.js), moot verdicts. Never free numbers: recordExposure validates and dedupes. The Witness path (table-witness.js, exposed >= 3) reads this list.
// provides: Game.exposureRecord, Game.recordExposure, Game.exposureFireTick, Game.exposureChargeLines
// consumes: Game.ledgerAdd, Game.ledger, Game.npcGossipAbout, Game.npcLies, Game.exposeBribery, Game.say, Game.displayName, Game.getPerson, Game.vpOf, Game.repOf, Game.remember, Game.observe
// Load AFTER ledger.js.
(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  // EXPOSURE=0 (node only) disables the layer for the det-gate and for
  // clean before/after measurement. In the browser (real play) the layer
  // is always on — Steve decided to build it (decision batch 2026-10-17
  // #316/#317).
  function exposureOn() {
    try {
      if (typeof process !== 'undefined' && process.env && process.env.EXPOSURE === '0') return false;
    } catch (e) {}
    return true;
  }

  const LIE_FIELDS = ['occupation', 'origin', 'goal'];
  function lieCharge(field) {
    if (field === 'occupation') return 'lied about their trade';
    if (field === 'origin') return "lied about where they're from";
    if (field === 'goal') return 'lied about what they want';
    return 'lied about their past';
  }
  function lieFieldNoun(field) {
    if (field === 'occupation') return 'trade story';
    if (field === 'origin') return 'past story';
    return 'story about what you\u2019re after';
  }
  // The village knows each other by name; the scholar hears the names
  // spoken aloud at the fire. Use the real first name (not the
  // knowledge-gated displayName description) for the kept list.
  function exposureName(Game, vid) {
    try {
      const p = Game.getPerson ? Game.getPerson(vid) : null;
      const nm = p && p.name ? String(p.name).split(' ')[0] : null;
      if (nm) return nm;
    } catch (e) {}
    try {
      if (Game.displayName) return String(Game.displayName(vid) || vid).split(' ')[0];
    } catch (e) {}
    return String(vid || 'someone').split(' ')[0];
  }

  const methods = {
    // ---------- THE KEPT LIST ----------
    // The village's list of exposures. Every entry is a real event:
    // {day, kind, accuser, accused, charge, detail}. The Witness path's
    // opening charges read this list. Never free numbers.
    exposureRecord() {
      const pg = this.progState();
      pg.exposureList = pg.exposureList || [];
      return pg.exposureList;
    },
    // Record an exposure. Validates (kind, accused, charge required) and
    // dedupes on (kind, accused, charge) — the list remembers; naming the
    // same wrong twice doesn't make the list longer. Returns the record,
    // or null when invalid, duplicate, or the layer is off.
    recordExposure(ev) {
      if (!exposureOn()) return null;
      const o = ev || {};
      if (!o.kind || !o.accused || !o.charge) return null;
      const list = this.exposureRecord();
      const key = [o.kind, o.accused, o.charge].join('|');
      if (list.some(r => r.key === key)) return null;
      const day = (this.state.scholar || {}).day || 0;
      const rec = {
        day, kind: o.kind,
        accuser: o.accuser || 'the village',
        accused: o.accused,
        charge: o.charge,
        detail: o.detail || '',
        key,
      };
      list.push(rec);
      // The list is cumulative (ledger stays cumulative, #340) — cap the
      // array for save hygiene, never drop history within a run's scale.
      if (list.length > 200) list.splice(0, list.length - 200);
      try { this.ledgerAdd('exposed', o.amount | 0 || 1); } catch (e) {}
      return rec;
    },
    // Format up to n records as trial charges. The Witness path's opening
    // beat reads the real list — names, days, charges.
    exposureChargeLines(n) {
      const list = this.exposureRecord();
      const out = [];
      const cap = n | 0 || 3;
      for (let i = 0; i < Math.min(cap, list.length); i++) {
        const r = list[i];
        const accuser = (r.accuser === 'the village' || r.accuser === 'the moot') ? r.accuser : exposureName(this, r.accuser);
        const accused = exposureName(this, r.accused);
        out.push(`Day ${r.day} — ${accuser} named ${accused}: ${r.charge}.`);
      }
      return out;
    },

    // ---------- THE FIRE HEARS IT ----------
    // Villagers police their own lies. Once a day, at the fire, someone may
    // name an un-named lie out loud — a real accusation, attributable, with
    // a social cost. The scholar overhears and writes it down (the kept
    // list). This is the village's ambient exposure practice; the gossip
    // system (npcGossipAbout) is the quiet version of the same instinct.
    exposureFireTick() {
      if (!exposureOn()) return null;
      try {
        const v = this.state.village || {};
        const roster = (v.roster || []).filter(id => {
          if (id === this.villagerId) return false;
          const p = this.getPerson ? this.getPerson(id) : null;
          return p && !p.dead;
        });
        if (roster.length < 2) return null;
        // collect un-named, unconfessed lies
        const open = [];
        for (const vid of roster) {
          let lies = null;
          try { lies = this.npcLies ? this.npcLies(vid) : null; } catch (e) {}
          if (!lies) continue;
          for (const field of LIE_FIELDS) {
            const lie = lies[field];
            if (!lie || lie.confessed) continue;
            const charge = lieCharge(field);
            const key = ['lie', vid, charge].join('|');
            if (this.exposureRecord().some(r => r.key === key)) continue;
            open.push({ vid, field, lie, charge });
          }
        }
        if (!open.length) return null;
        // one naming per evening, and not every evening — the village
        // doesn't do this lightly. Blunt villagers are likelier to speak.
        if (Math.random() > 0.14) return null;
        const target = open[Math.floor(Math.random() * open.length)];
        const candidates = roster.filter(id => id !== target.vid);
        if (!candidates.length) return null;
        const scored = candidates.map(id => {
          let w = 1;
          try {
            const vp = this.vpOf ? this.vpOf(id) : (this.getPerson ? this.getPerson(id) : null);
            const temp = String((vp && vp.personality && vp.personality.temperament) || '');
            if (/blunt|bold|brash/i.test(temp)) w = 3;
            else if (/warm|gentle|kind/i.test(temp)) w = 0.5;
          } catch (e) {}
          return { id, w };
        });
        let tot = 0;
        for (const s of scored) tot += s.w;
        let pick = Math.random() * tot, namer = scored[0].id;
        for (const s of scored) { pick -= s.w; if (pick <= 0) { namer = s.id; break; } }
        const namerFirst = exposureName(this, namer);
        const liarFirst = exposureName(this, target.vid);
        const noun = lieFieldNoun(target.field);
        // The accusation must read as a person risking something — naming
        // a lie at the fire costs the namer too. Lines vary; no repeats
        // parroting.
        const lines = [
          `${namerFirst} says it at the fire, not quite looking at ${liarFirst}: \u201cYour ${noun} doesn\u2019t add up. Someone had to say it.\u201d The fire goes quiet in the way it does when someone\u2019s decided to be brave.`,
          `\u201cI don\u2019t say this lightly.\u201d ${namerFirst} sets their bowl down. \u201c${liarFirst}, your ${noun} isn\u2019t true, is it? I\u2019ve heard enough versions now.\u201d Nobody looks at ${liarFirst}. Everybody does.`,
          `${namerFirst} has been turning something over all evening. Finally: \u201c${liarFirst}. The ${noun} \u2014 we all eat from the same pot here, we don\u2019t get to lie about who\u2019s at it.\u201d It costs ${namerFirst} to say it; you can see the price land.`,
        ];
        this.say(`\uD83D\uDD25 ${lines[Math.floor(Math.random() * lines.length)]}`);
        // consequences are real: the liar's honesty rep dents, the naming
        // costs the relationship. Accusations have weight.
        try {
          const r = this.repOf ? this.repOf(target.vid) : null;
          if (r) r.honest = Math.max(-100, (r.honest || 0) - 10);
        } catch (e) {}
        try {
          const t = v.trust || {};
          const cur = (t[target.vid] == null ? 15 : t[target.vid]);
          t[target.vid] = Math.max(0, cur - 8);
        } catch (e) {}
        try { if (this.remember) this.remember(namer, 'named-lie', `named ${liarFirst}'s ${noun} lie at the fire`); } catch (e) {}
        const rec = this.recordExposure({
          kind: 'lie', accuser: namer, accused: target.vid,
          charge: target.charge,
          detail: `${namerFirst} named it at the fire: ${liarFirst}'s ${noun} doesn't hold.`,
          amount: 1,
        });
        try { if (this.observe) this.observe('accusation', { accuser: namer, target: target.vid }); } catch (e) {}
        // THE NAMED ANSWER: called out in public, the liar may confess —
        // a second, distinct event (their choice, not automatic). A
        // confession is its own exposure: the truth, said aloud, on the
        // record. Warm temperaments confess likelier; the malicious rarely.
        try {
          let confessP = 0.35;
          const vp = this.vpOf ? this.vpOf(target.vid) : (this.getPerson ? this.getPerson(target.vid) : null);
          const temp = String((vp && vp.personality && vp.personality.temperament) || '');
          if (/warm|gentle|kind|earnest/i.test(temp)) confessP += 0.20;
          if (/prickly|bold/i.test(temp)) confessP -= 0.10;
          const dark = vp && vp.personality && vp.personality.dark;
          if (dark && dark.kind === 'malicious') confessP = 0.05;
          if (Math.random() < confessP) {
            target.lie.confessed = true;
            const truthW = target.lie.truth, toldW = target.lie.told;
            const clines = [
              `\u201cYou\u2019re right.\u201d ${liarFirst} doesn\u2019t look up. \u201cI wasn\u2019t ${toldW}. I was ${truthW}. I\u2019m sorry \u2014 I wanted a cleaner story than I had.\u201d The fire lets it land. Someone passes ${liarFirst} the bowl without a word.`,
              `${liarFirst} is quiet for a long moment. Then, all in a rush: \u201cFine. It\u2019s true. Not ${toldW} \u2014 ${truthW}. I lied because the truth felt small.\u201d The admission hangs there, and the village \u2014 to its credit \u2014 doesn\u2019t pounce.`,
            ];
            this.say(clines[Math.floor(Math.random() * clines.length)]);
            try {
              const r2 = this.repOf ? this.repOf(target.vid) : null;
              if (r2) r2.honest = Math.max(-100, (r2.honest || 0) + 5); // honesty for owning it
            } catch (e) {}
            this.recordExposure({
              kind: 'confession', accuser: namer, accused: target.vid,
              charge: `${target.charge}, confessed at the fire`,
              detail: `${liarFirst} owned it, in front of everyone.`,
              amount: 1,
            });
          }
        } catch (e) {}
        return rec;
      } catch (e) { return null; }
    },
  };

  Object.assign(Game, methods);

  // ============ WRAPS ============
  (function attach() {
    // The village polices its own lies — when gossip names a lie, the
    // scholar writes it down. The kept list grows from real tellings.
    const _gossip = Game.npcGossipAbout;
    Game.npcGossipAbout = function (tellerVid, targetVid) {
      const r = _gossip ? _gossip.apply(this, arguments) : null;
      try {
        if (r && r.contradictsLie && exposureOn()) {
          const target = r.target || targetVid;
          const field = r.field || 'past';
          this.recordExposure({
            kind: 'lie', accuser: tellerVid, accused: target,
            charge: lieCharge(field),
            detail: 'named in village talk',
            amount: 1,
          });
        }
      } catch (e) {}
      return r;
    };

    // The fire hears it: daily beat, hooked into the day's end.
    const _endDay = Game.endDay;
    Game.endDay = function () {
      const r = _endDay ? _endDay.apply(this, arguments) : undefined;
      try { if (this.exposureFireTick) this.exposureFireTick(); } catch (e) {}
      return r;
    };
  })();
})();
