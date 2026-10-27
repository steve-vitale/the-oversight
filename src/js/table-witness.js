// @ontology
// system: table-witness
// description: The Witness path — the trial of the judges. Three beats: opening charges (from the real exposed count), the defense (your own villagers testify about YOUR leadership in their own words — sampled by personality, honest to the vector), the branch twist. Plays on the moot register: the exposed count came from real accusations. Meters: swing — your record can convict you mid-trial. Light = just trial (submit your own ledger); dark = show trial (the audience chants for blood).
// provides: (registers via tableRegisterPath; no new Game methods)
// consumes: tableState(), tableRunBeat(), tableFinals(), tableFail(), tableLiveWrap(), say; ledger(), deedState()
// Load AFTER table.js.
(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  function meterLine(T) {
    return `swing ${((T.meters || {}).swing | 0)}`;
  }
  // SEAT-TAKER VARIATION (Steve 2026-10-26, item 495): the Witness trial
  // turns on WHO is in the seat, so its beats vary by sitter while the
  // choices, the swing meter, and the convict-mid-trial tripwire stay
  // exactly the same. The sitter is read from the sitting (pg.table.
  // seatTaker, set by the seat-taker choice before the sitting locks);
  // with no sitter recorded the seat is the player character and every
  // beat below returns today's text unchanged. A villager sitter is
  // never their own witness: witnesses() excludes the sitter's id.
  function seatTakerOf(T) {
    try {
      const st = (T && T.seatTaker) || null;
      if (st && st.id && st.id !== Game.villagerId) {
        return { id: st.id, name: st.name || 'someone', self: false };
      }
    } catch (e) {}
    return { id: Game.villagerId, name: null, self: true };
  }
  function sitterFirst(T) {
    const st = seatTakerOf(T);
    return st.self ? null : (st.name || 'someone').split(' ')[0];
  }
  // The defense's witnesses: two villagers who testify about YOUR
  // leadership — in their own words, through their own personality, honest
  // to the vector. You don't control what they say.
  // Villager testimony (2026-10-11): the old version had 3 fixed templates and
  // the common case gave BOTH witnesses the identical line ("They kept us fed.
  // That's the whole testimony." x2) — robotic, and it violated the path's own
  // promise ("in their own words", "sampled by personality"). Now each witness
  // testifies from their occupation, temperament, trust, and the dead they
  // carry; the two witnesses never repeat each other.
  function witnesses(sitterId) {
    try {
      const L = (typeof Game.ledger === 'function') ? Game.ledger() : {};
      const trust = (((Game.state || {}).village || {}).trust) || {};
      const dead = (((Game.state || {}).village || {}).dead) || {};
      const deadNames = Object.keys(dead).map(id => {
        const dv = (Game.data.villagers || []).find(x => x.id === id) || {};
        return (dv.name || '').split(' ')[0];
      }).filter(n => n);
      const deadName = deadNames.length ? deadNames[(Math.random() * deadNames.length) | 0] : null;
      // SEAT-TAKER: the sitter never testifies about themselves. With no
      // sitter passed the exclusion is the player character, as today.
      const excluded = sitterId || Game.villagerId;
      const ids = ((Game.data.villagers || []).map(v => v.id) || []).filter(id => id && id !== Game.villagerId && id !== excluded).slice(0, 2);
      const used = {};
      return ids.map((id, wi) => {
        const v = (Game.data.villagers || []).find(x => x.id === id) || {};
        const name = (v.name || 'someone').split(' ')[0];
        const occ = (v.formerOccupation || v.occupation || 'villager').toLowerCase();
        const p = v.personality || {};
        const temp = String(p.temperament || '');
        const blunt = /blunt|bold|brash/i.test(temp + ' ' + JSON.stringify(v.traits || {}));
        const warm = /warm|kind|gentle|earnest/i.test(temp);
        const t = trust[id] | 0;
        // Pick a template this witness hasn't used and the other didn't.
        const pick = (pool) => {
          const h = temp.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + wi * 7;
          for (let k = 0; k < pool.length; k++) {
            const idx = (h + k) % pool.length;
            if (!used[idx + ':' + pool._case]) { used[idx + ':' + pool._case] = true; return pool[idx]; }
          }
          return pool[0];
        };
        let line;
        // OATHBREAKER (journey-endgame r28 2026-10-20): the defense argues YOU.
        // A run that broke more promises than it kept heard "They try." here —
        // the 'unsure' case fired on protected=0=killed and the village's
        // memory of broken words was invisible to the witnesses. The branch
        // math already prices broken>kept as a dark signal (table.js); the
        // witnesses should say it too. Read from the same tally the branch
        // uses, plus the promise records for names and tasks.
        let brokenCt = 0, keptCt = 0;
        const brokenDetails = [];
        try {
          const pt = (typeof Game.tablePromiseTally === 'function') ? Game.tablePromiseTally() : null;
          if (pt) { brokenCt = pt.broken | 0; keptCt = pt.kept | 0; }
        } catch (e) {}
        try {
          const pr = (((Game.state || {}).village || {}).promises) || {};
          for (const k of Object.keys(pr)) {
            const p = pr[k];
            if (p && p.kept === 'broken') {
              let nm = k; try { nm = (Game.displayName(k) || k).split(' ')[0]; } catch (e2) {}
              let task = ''; try { task = String(p.favorTask || '').slice(0, 90); } catch (e2) {}
              brokenDetails.push({ name: nm, task });
            }
          }
        } catch (e) {}
        const oathbreaker = brokenCt > keptCt && brokenDetails.length > 0;
        if ((L.protected | 0) >= (L.killed | 0) && (L.protected | 0) > 0) {
          const pool = [];
          pool._case = 'aided';
          if (blunt) pool.push(`"${name} kept us fed. I don't like them. I'd follow them anywhere."`);
          pool.push(`"They carried me out of the treeline when I couldn't walk. That's the whole testimony — the rest is paperwork."`);
          pool.push(`"I'm a ${occ}. I know work when I see it. They worked — every day, the same care."`);
          if (t >= 50) pool.push(`"I'd trust them with my kids' dinner. I HAVE trusted them with my kids' dinner."`);
          else if (t < 30) pool.push(`"I don't love them. But the pantry was full when it mattered. That's on the record."`);
          else pool.push(`"They kept us fed. That's the whole testimony."`);
          if (deadName) pool.push(`"${deadName} would've had good words about them. They're not here, so I'll say them instead."`);
          if (warm) pool.push(`"They sat with me the night after. Didn't say much. Didn't need to."`);
          line = pick(pool);
        } else if ((L.killed | 0) > (L.protected | 0)) {
          const pool = [];
          pool._case = 'bloody';
          if (blunt) pool.push(`"${name} spent us like firewood. Ask the graves."`);
          pool.push(`"People died. I... people died following them."`);
          if (deadName) pool.push(`"${deadName} isn't here to testify. I am. They followed the Bearer and they didn't come back."`);
          if (t < 30) pool.push(`"I said at the fire it was too much, too fast. Nobody listened. The graves listened."`);
          else pool.push(`"I wanted to believe. The graves are full of people who wanted to believe."`);
          line = pick(pool);
        } else if (oathbreaker) {
          const pool = [];
          pool._case = 'oathbreaker';
          const b0 = brokenDetails[0] || {};
          const b0n = b0.name || 'someone';
          pool.push(`"${b0n} asked. They said yes. ${b0n}'s still waiting — you can ask them yourself."`);
          if (brokenCt > 1) pool.push(`"${brokenCt} promises. I counted the ones they kept. Shorter list."`);
          if (b0.task) pool.push(`"They promised ${b0n}: ${b0.task}. Still owed."`);
          pool.push(`"The fire remembers what the court might miss: their word."`);
          if (t < 30) pool.push(`"I stopped asking. Everybody stops asking, eventually."`);
          else pool.push(`"I want to believe them. The list says not to."`);
          line = pick(pool);
        } else {
          const pool = [`"I don't know what they are. None of us do. That's the truth."`];
          pool._case = 'unsure';
          pool.push(`"They try. I don't know if trying counts in this court."`);
          if (warm) pool.push(`"They're... they mean it. Whatever 'it' is this week."`);
          line = pick(pool);
        }
        return { name, line };
      });
    } catch (e) { return []; }
  }
  // The record convicts you (2026-10-11): the old bar (swing <= -3) was
  // mathematically unreachable — the worst honest line bottomed out at 0 —
  // so the failure beat was dead text. Now the tripwire is legible: trying
  // to SILENCE your own witnesses (-3) when the ledger is dirty convicts
  // you mid-trial at -1. A clean record (light) can never trip it; a dirty
  // one played straight (cold/read, let them speak, take the verdict)
  // stays safe. The defense is good, and the ledger is honest.
  function swingCheck(extra) {
    return function (T) {
      const m = T.meters || {};
      const sw = (m.swing | 0) + ((extra && extra.swing) | 0);
      if (sw <= -1) return Object.assign({}, extra, { fail: 'your own record convicted you mid-trial — the defense was good, and the ledger was honest' });
      return extra;
    };
  }

  const DEF = {
    id: 'witness',
    name: 'the Witness',
    minSeat: 'lesser',
    showGenre: 'the trial of the judges',
    showLive: 'the trial of the judges: THE GALAXY\'S COURT IS IN SESSION',
    openLine: 'You didn\'t come to negotiate. You came with a list. Every bribe, every buried plot, every "rounding error" — including theirs. The judges are about to be judged.',
    prereq(seat) {
      const L = (typeof Game.ledger === 'function') ? Game.ledger() : {};
      if (!seat || seat.seat === 'none') return { earned: false, strength: 0, why: 'No seat at the table.' };
      if ((L.exposed | 0) < 3) return { earned: false, strength: 0, why: `You didn't keep the list (${L.exposed | 0} exposures on record — the trial needs 3).` };
      const strength = Math.min(100, 25 + ((L.exposed | 0) * 8));
      return { earned: true, strength, why: `${L.exposed | 0} exposures on the record. The docket is real.` };
    },
    abilities: {
      shared: [
        { id: 'docket', name: 'Docket', desc: 'The list is complete and paginated. Swing starts at 1.', grant: { swing: 1 } },
        { id: 'subpoena', name: 'Subpoena', desc: 'You may call one witness of your choosing. (Offered in the second beat.)' },
      ],
      light: [
        { id: 'clean-hands', name: 'Clean Hands', desc: 'You submit your own ledger as evidence too. Swing +2.', grant: { swing: 2 } },
        { id: 'precedent', name: 'Precedent', desc: 'One ruling that binds the future. (Offered in the final beat.)' },
      ],
      dark: [
        { id: 'gavel', name: 'Gavel', desc: 'The room fears the verdict before it hears the charges. Swing +2.', grant: { swing: 2 } },
        { id: 'blood', name: 'Blood', desc: 'Give them what they chant for. (Offered in the final beat.)' },
      ],
    },
    beats: [
      {
        say: function (T) {
          const L = (typeof Game.ledger === 'function') ? Game.ledger() : {};
          // V1 — the opening is read BY the sitter. Self: today's text.
          const first = sitterFirst(T);
          const lines = first
            ? [`OPENING — THE CHARGES. ${L.exposed | 0} exposures. Bribes, buried plots, rounding errors — the moots heard them first, and the moots remember. The judges sit very still. Beings of light can flinch; ${first} reads them now. How does ${first} read them?`]
            : [`OPENING — THE CHARGES. ${L.exposed | 0} exposures. Bribes, buried plots, rounding errors — the moots heard them first, and the moots remember. The judges sit very still. Beings of light can flinch; you're about to see it. How do you read them?`];
          // The sitter's own standing, from their real ascension score —
          // named only when the score's own notes say it.
          try {
            if (first) {
              const st = seatTakerOf(T);
              const sc = (typeof Game.villagerAscensionScore === 'function') ? Game.villagerAscensionScore(st.id) : null;
              if (sc && sc.notes && sc.notes.length) lines.push(`The table notes ${first}'s standing: ${sc.notes.join('; ')}.`);
            }
          } catch (e) {}
          // THE LIST IS REAL (sim-witnesource 2026-10-17): the opening
          // charges name the actual kept-list entries — who exposed whom
          // for what, when. No vibes; the docket is the record.
          try {
            const charges = (typeof Game.exposureChargeLines === 'function') ? Game.exposureChargeLines(3) : [];
            charges.forEach(c => lines.push(c));
          } catch (e) {}
          return lines;
        },
        meterLine,
        choices: [
          { id: 'cold', label: 'Read them cold.', effects: swingCheck({ swing: 2 }), say: ['You read them cold — no heat, no adjectives. The charges land harder for it. One of the judges flickers.'] },
          { id: 'names', label: 'Read them with the names.', effects: swingCheck({ swing: 1 }), say: ['You read every name. The named ones are in the audience. The audience does the flinching for them, which is worse.'] },
          { id: 'reserve', label: 'Hold one charge back.', effects: swingCheck({ swing: 0 }), say: ['You hold one back. A prosecutor with a reserve is a prosecutor the judges have to watch. They watch you now.'] },
        ],
      },
      {
        say: function (T) {
          // V2 — the defense argues the sitter, and the sitter is never
          // their own witness. Self: today's framing, today's witnesses.
          const first = sitterFirst(T);
          const st = seatTakerOf(T);
          const w = witnesses(st.self ? Game.villagerId : st.id);
          const lines = first
            ? [`THE DEFENSE — calls the village's own. This is the part the table warned you about: the defense doesn't argue the charges. It argues *${first}*. Two villagers take the stand, and ${first} doesn't control what they say.`]
            : ['THE DEFENSE — calls YOUR villagers. This is the part the table warned you about: the defense doesn\'t argue the charges. It argues *you*. Two of your own take the stand, and you don\'t control what they say.'];
          w.forEach(x => lines.push(`${x.name}, sworn: ${x.line}`));
          // PODS WEIGHT (2026-10-11, KIN canon): broken promises surface
          // where it hurts most. The defense found the mourners.
          try {
            const pm = (typeof Game.podWitnessMaterial === 'function') ? Game.podWitnessMaterial() : [];
            pm.forEach(l => lines.push(l));
          } catch (e) {}
          return lines;
        },
        meterLine,
        choices: function (T) {
          const L = (typeof Game.ledger === 'function') ? Game.ledger() : {};
          const honest = ((L.protected | 0) >= (L.killed | 0)) ? 1 : -2;
          const list = [
            { id: 'let', label: 'Let them speak.', effects: swingCheck({ swing: honest }), say: ['You let them speak. All of it. The courtroom respects nothing the way it respects a prosecutor who doesn\'t flinch at their own witnesses.'] },
            { id: 'cross', label: 'Cross-examine your own people.', effects: swingCheck({ swing: 1 }), say: ['You cross-examine your own villagers — gently, surgically. It works. It also costs something at the fire tonight; you can feel the price being written.'] },
          ];
          if ((T.abils || []).indexOf('subpoena') >= 0 && !T.subpoenaUsed) {
            list.push({
              id: 'subpoena', label: 'Subpoena: call one witness of your choosing.', effects: function (Tx) { Tx.subpoenaUsed = true; return swingCheck({ swing: 1 })(Tx); },
              say: ['You call the one you chose — the one whose story helps. It helps. The defense objects; the objection is overruled; the whole galaxy watches you work the room you built.'],
            });
          }
          // Silencing your own witnesses lands differently on a dirty record
          // (2026-10-11): the same act that costs a clean trial -2 convicts
          // a dirty one at -4. Precedent: the beloved's truth varies by
          // branch the same way — the branch IS the ledger summary.
          list.push({ id: 'silence', label: 'Move to silence them.', effects: function (Tx) { const dark = (Tx.branch === 'dark'); return swingCheck({ swing: dark ? -4 : -2 })(Tx); }, say: ['You move to silence your own witnesses. The courtroom smells it instantly — fear, from the Witness. The swing slides. Some doors, once knocked on, stay knocked.'] });
          return list;
        },
      },
      {
        say: function (T) {
          // V3 — the final beat addresses the sitter by name. Self:
          // today's text, both branches, unchanged.
          const first = sitterFirst(T);
          if ((T.branch || 'light') === 'light') {
            if (first) return [`THE SETTLEMENT — the judges confer, and then the eldest does something unprecedented: it offers ${first} a private settlement. Justice, or quiet. "NAME YOUR TERMS," it says to ${first}, "AND WE WILL VANISH INTO THEM." The audience leans so far forward the light bends.`];
            return ['THE SETTLEMENT — the judges confer, and then the eldest does something unprecedented: it offers a private settlement. Justice, or quiet. "NAME YOUR TERMS," it says, "AND WE WILL VANISH INTO THEM." The audience leans so far forward the light bends.'];
          }
          if (first) return [`THE CHANT — the audience has started chanting. Not words — it isn't a language with words — but ${first} knows the feeling, and so does the table. They want blood. The gavel is heavy in ${first}'s hand. Give them what they chant for, or disappoint trillions.`];
          return ['THE CHANT — the audience has started chanting. Not words — it isn\'t a language with words — but you know the feeling, and so does the table. They want blood. The gavel is heavy in your hand. Give them what they chant for, or disappoint trillions.'];
        },
        meterLine,
        choices: function (T) {
          if ((T.branch || 'light') === 'light') return [
            { id: 'public', label: 'Refuse the settlement. Justice, in public. (Precedent)', effects: swingCheck({ swing: 2 }), say: ['You refuse the quiet. "In public," you say, "or not at all." The precedent is set — the galaxy\'s court has a new first page, and your name is on it. The judges bow. It costs them everything to do it.'] },
            { id: 'settle', label: 'Take the settlement.', effects: swingCheck({ swing: 1 }), say: ['You take it. Quiet justice, real terms, nobody humiliated. The audience is furious — and the judges keep their word for a century, because you let them keep their faces. Mercy, again, as strategy.'] },
          ];
          return [
            { id: 'blood', label: 'Give them what they chant for. (Blood)', effects: swingCheck({ swing: 2 }), say: ['You give it to them. The verdict lands like an execution, and the chant becomes a roar. Justice was served. You keep telling yourself that. The roar doesn\'t care what you tell yourself.'] },
            { id: 'disappoint', label: 'Disappoint trillions.', effects: swingCheck({ swing: 0 }), say: ['You disappoint them — a measured verdict, no blood. The chant dies confused. The judges exhale. Somewhere, the part of you that wanted the roar files a complaint. You overrule it. That\'s the job.'] },
          ];
        },
      },
    ],
    failure: {
      beat: 'The ring dims. Your own record convicted you mid-trial — the defense was good, and the ledger was honest. The judges rise. The dock has a second chair, and it\'s yours.',
      offerLine: 'The table does not punish failure with death. It punishes it with smaller doors — and a defendant\'s chair.',
    },
    finals: {
      light: [
        { id: 'charges', label: 'Read the charges.', outcome: ['The trial of the judges. You read every charge, and some of them flinch — actual flinching, from beings of light. Justice, at last, with an audience. The galaxy\'s court has a new precedent, and your name is on it. Your own ledger sits in evidence beside theirs. That\'s why it worked.'] },
        { id: 'wayback', label: 'Offer them a way back.', outcome: ['Even judges can be taught. It\'s the hardest thing you\'ve done — harder than the deer, harder than the hunger. One of them accepts. That\'s enough. That\'s everything. The court adjourns, and the galaxy has one more teacher than it did this morning.'] },
      ],
      dark: [
        { id: 'charges', label: 'Read the charges.', outcome: ['You read them, and the roar carries every word. The judges fall — spectacularly, totally, the way the audience paid to see. Justice was done. The ratings were historic. You try not to notice which of those sentences you enjoyed more.'] },
        { id: 'gavel', label: 'Bring the gavel down.', outcome: ['The gavel comes down, and it doesn\'t come back up. The show trial ends the way show trials end: with the audience satisfied and the truth filed somewhere nobody reads. You won. The list is complete. Ask yourself, someday, what it was for.'] },
      ],
    },
  };

  Game.tableRegisterPath(DEF);
})();
