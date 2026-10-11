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
  // The defense's witnesses: two villagers who testify about YOUR
  // leadership — in their own words, through their own personality, honest
  // to the vector. You don't control what they say.
  function witnesses() {
    try {
      const L = (typeof Game.ledger === 'function') ? Game.ledger() : {};
      const ids = ((Game.data.villagers || []).map(v => v.id) || []).filter(id => id && id !== Game.villagerId).slice(0, 2);
      return ids.map(id => {
        const v = (Game.data.villagers || []).find(x => x.id === id) || {};
        const name = (v.name || 'someone').split(' ')[0];
        const traits = JSON.stringify(v.traits || v.personality || {});
        const blunt = /blunt|bold|brash/i.test(traits);
        let line;
        if ((L.protected | 0) >= (L.killed | 0) && (L.protected | 0) > 0) {
          line = blunt ? `"${name} kept us fed. I don't like them. I'd follow them anywhere."` : `"They kept us fed. That's the whole testimony."`;
        } else if ((L.killed | 0) > (L.protected | 0)) {
          line = blunt ? `"${name} spent us like firewood. Ask the graves."` : `"People died. I... people died following them."`;
        } else {
          line = `"I don't know what they are. None of us do. That's the truth."`;
        }
        return { name, line };
      });
    } catch (e) { return []; }
  }
  function swingCheck(extra) {
    return function (T) {
      const m = T.meters || {};
      const sw = (m.swing | 0) + ((extra && extra.swing) | 0);
      if (sw <= -3) return Object.assign({}, extra, { fail: 'your own record convicted you mid-trial — the defense was good, and the ledger was honest' });
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
        say: function () {
          const L = (typeof Game.ledger === 'function') ? Game.ledger() : {};
          return [`OPENING — THE CHARGES. ${L.exposed | 0} exposures. Bribes, buried plots, rounding errors — the moots heard them first, and the moots remember. The judges sit very still. Beings of light can flinch; you're about to see it. How do you read them?`];
        },
        meterLine,
        choices: [
          { id: 'cold', label: 'Read them cold.', effects: swingCheck({ swing: 2 }), say: ['You read them cold — no heat, no adjectives. The charges land harder for it. One of the judges flickers.'] },
          { id: 'names', label: 'Read them with the names.', effects: swingCheck({ swing: 1 }), say: ['You read every name. The named ones are in the audience. The audience does the flinching for them, which is worse.'] },
          { id: 'reserve', label: 'Hold one charge back.', effects: swingCheck({ swing: 0 }), say: ['You hold one back. A prosecutor with a reserve is a prosecutor the judges have to watch. They watch you now.'] },
        ],
      },
      {
        say: function () {
          const w = witnesses();
          const lines = ['THE DEFENSE — calls YOUR villagers. This is the part the table warned you about: the defense doesn\'t argue the charges. It argues *you*. Two of your own take the stand, and you don\'t control what they say.'];
          w.forEach(x => lines.push(`${x.name}, sworn: ${x.line}`));
          return lines;
        },
        meterLine,
        choices: function (T) {
          const L = (typeof Game.ledger === 'function') ? Game.ledger() : {};
          const honest = ((L.protected | 0) >= (L.killed | 0)) ? 1 : -1;
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
          list.push({ id: 'silence', label: 'Move to silence them.', effects: swingCheck({ swing: -2 }), say: ['You move to silence your own witnesses. The courtroom smells it instantly — fear, from the Witness. The swing slides. Some doors, once knocked on, stay knocked.'] });
          return list;
        },
      },
      {
        say: function (T) {
          if ((T.branch || 'light') === 'light') return ['THE SETTLEMENT — the judges confer, and then the eldest does something unprecedented: it offers a private settlement. Justice, or quiet. "NAME YOUR TERMS," it says, "AND WE WILL VANISH INTO THEM." The audience leans so far forward the light bends.'];
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
