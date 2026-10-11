// @ontology
// system: table-indispensable
// description: The Indispensable path — contract drafting. Three clauses (supply, teaching, standing) negotiated against aliens who misprice everything; you spot their loopholes or they spot yours. Meters in tension: leverage vs cage — every clause that makes you more necessary tightens the cage, and the best play is sometimes deliberate slack. FULL seat only: the galaxy must actually need you. Light = mutual need (exit ramps); dark = gilded cage (the cage was your idea).
// provides: (registers via tableRegisterPath; no new Game methods)
// consumes: tableState(), tableRunBeat(), tableFinals(), tableFail(), tableLiveWrap(), say; ledger(), deedState(), tableSeat()
// Load AFTER table.js.
(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  function meterLine(T) {
    const m = T.meters || {};
    return `leverage ${m.leverage | 0} · cage ${m.cage | 0}`;
  }
  // The cage check: if the cage outruns leverage by 4+, it closed while
  // you were drafting. Mirrors the runner's abilMods (positive gains only).
  function cageCheck(extra) {
    return function (T) {
      const mods = (T && T.abilMods) || {};
      const m = T.meters || {};
      const modded = (k) => {
        const v = (extra && extra[k]) | 0;
        const mult = mods[k + 'Mult'] || 1;
        return v > 0 ? Math.floor(v * mult) : v;
      };
      const lev = (m.leverage | 0) + modded('leverage');
      const cage = (m.cage | 0) + modded('cage');
      if (cage > lev + 4) return Object.assign({}, extra, { fail: 'the cage closed while you were still drafting — every clause made you more necessary and less free' });
      return extra;
    };
  }
  function pantryKcal() {
    try {
      const p = (Game.state.village || {}).pantry || [];
      return p.reduce((a, it) => a + ((it.kcalEach || 0) * (it.units || 1)), 0);
    } catch (e) { return 0; }
  }

  const DEF = {
    id: 'indispensable',
    name: 'the Indispensable',
    minSeat: 'full',
    seatWhy: 'The Indispensable needs a full seat — the galaxy must actually need you, not just notice you.',
    showGenre: 'the treaty signing',
    showLive: 'the treaty signing: THE MOST-WATCHED CONTRACT IN HISTORY',
    openLine: 'The galaxy runs on energy, and only one species knows the trick: eating. They need what you know. You walk to the table knowing they cannot afford for you to leave it — and the table knows you know.',
    prereq(seat) {
      const L = (typeof Game.ledger === 'function') ? Game.ledger() : {};
      if (!seat || seat.seat !== 'full') return { earned: false, strength: 0, why: 'The Indispensable needs a full seat — the galaxy must actually need you, not just notice you.' };
      const score = ((L.brokerage | 0) + (L.might | 0) + (L.foodShared | 0));
      if ((L.foodShared | 0) <= 0) return { earned: false, strength: 0, why: 'You never shared the food truth. They can\'t need a teacher who never taught.' };
      if (score < 10) return { earned: false, strength: 0, why: `Your standing isn't load-bearing yet (brokerage+might+foodShared ${score}, needs 10).` };
      const strength = Math.min(100, 30 + ((L.foodShared | 0) * 3) + ((L.brokerage | 0) * 2));
      return { earned: true, strength, why: `Full seat. The food truth shared ${L.foodShared | 0} times — they need the teacher, not just the trick.` };
    },
    abilities: {
      shared: [
        { id: 'ledger-eye', name: 'Ledger-eye', desc: 'You see the mispricing before they finish the sentence. Leverage starts at 2.', grant: { leverage: 2 } },
        { id: 'anchor', name: 'Anchor', desc: 'Your supply numbers are real — the cage tightens half as fast.', grant: { abilMods: { cageMult: 0.5 } } },
      ],
      light: [
        { id: 'openhand', name: 'Openhand', desc: 'Given freely, the teaching builds leverage no cage can hold. (+1 leverage now.)', grant: { leverage: 1 } },
        { id: 'exit-ramp', name: 'Exit-ramp', desc: 'One clause they cannot close. (Offered in the final beat.)' },
      ],
      dark: [
        { id: 'chokepoint', name: 'Chokepoint', desc: 'You are the only supplier. They know it. You know they know it. (+3 leverage, +2 cage.)', grant: { leverage: 3, cage: 2 } },
        { id: 'fineprint', name: 'Fineprint', desc: 'They never read clause three. (Offered in the final beat.)' },
      ],
    },
    beats: [
      {
        say: function () {
          const kcal = Math.round(pantryKcal()).toLocaleString('en-US');
          return [`CLAUSE ONE — SUPPLY. "HOW MUCH FOOD CAN HUMANITY MOVE?" The table's economists have a number. It is wrong — it assumes food is fuel, and food was never just fuel. Your pantry holds ${kcal} kcal today, and they don't know what a pantry *is*. Name the number, or let them keep theirs.`];
        },
        meterLine,
        choices: [
          { id: 'real', label: 'Name the real number.', effects: cageCheck({ leverage: 2 }), say: ['You name it — the real number, pantry and all. The economists recalculate in public, which is the most embarrassing thing that can happen to an economist. Leverage: yours.'] },
          { id: 'inflate', label: 'Inflate it. They won\'t check. (They will check.)', effects: cageCheck({ leverage: 3, cage: 2 }), say: ['You inflate it. They check — of course they check, they\'re economists. The correction costs you nothing and teaches them something: you negotiate like a predator. The cage tightens anyway. It always does.'] },
          { id: 'lowball', label: 'Lowball it. Stay free.', effects: cageCheck({ leverage: 1, cage: -1 }), say: ['You lowball. The table blinks — nobody lowballs *them*. The cage loosens a notch. Freedom has a price too, and you just paid it in leverage. Deliberate slack: the hardest move in the book.'] },
        ],
      },
      {
        say: ['CLAUSE TWO — TEACHING. "WILL YOU TEACH THE TRICK?" This is the clause everything hinges on. Teach them, and they need you less — unless you teach it the way only you can teach it. The System leans in. It has never wanted anything this badly, and it is terrible at hiding it.'],
        meterLine,
        choices: [
          { id: 'free', label: 'Teach freely.', effects: cageCheck({ leverage: 2, cage: -1 }), say: ['You teach freely — the whole trick, no meter running. The table wasn\'t ready for generosity as strategy. It doesn\'t compute, until it does. They need the teacher now, not the lesson. That\'s the part they missed.'] },
          { id: 'price', label: 'Teach at a price.', effects: cageCheck({ leverage: 2, cage: 2 }), say: ['You name the price of the lesson. They pay it before you finish the sentence — which tells you everything about how badly they need it, and how tightly the cage just closed.'] },
          { id: 'refuse', label: 'Refuse. The trick stays ours.', effects: cageCheck({ leverage: -1, cage: -1 }), say: ['You refuse. The table goes cold — and then, slowly, respectful. A monopoly on the only thing that matters. The cage loosens; the leverage dips. They\'ll be back. They have to be.'] },
        ],
      },
      {
        say: function (T) {
          if ((T.branch || 'light') === 'light') return ['CLAUSE THREE — STANDING. You insisted on an exit ramp: any party may leave the treaty with one season\'s notice, no penalty. The table has read it three times. "REMOVE IT," the System says — not performing now, almost *asking*. "Name your price for the ramp. Anything."'];
          return ['CLAUSE THREE — STANDING. The table found your draft — the cage clause, in your hand, with your notes in the margin. "THIS WAS YOUR IDEA," the System says, and the worst part is the admiration in its voice. Own it, or deny it. The galaxy is watching either way.'];
        },
        meterLine,
        choices: function (T) {
          if ((T.branch || 'light') === 'light') return [
            { id: 'keep', label: 'Keep the ramp. (Exit-ramp)', effects: cageCheck({ leverage: 1, cage: -1 }), say: ['You keep it. "Mutual need," you say, "means mutual leaving." The table hates it. The table signs it. Somewhere, a thousand future negotiators will quote the ramp clause, and none of them will know your name. That\'s fine. You\'ll know.'] },
            { id: 'trade', label: 'Trade the ramp for everything.', effects: cageCheck({ leverage: 3, cage: 3 }), say: ['You trade it — the ramp for the world. The signature is the loudest sound in galactic history. The cage is gilded, total, and *yours*. You got everything. Read that sentence again on the bad nights.'] },
          ];
          return [
            { id: 'own', label: 'Own it. (Fineprint)', effects: cageCheck({ leverage: 3, cage: 3 }), say: ['You own it. "Yes. My idea. My margins." The table signs so fast it embarrasses everyone. The cage is perfect, and it\'s yours, and that\'s the most frightening sentence you\'ve ever thought.'] },
            { id: 'deny', label: 'Deny it.', effects: cageCheck({ leverage: 1, cage: 2 }), say: ['You deny it. Nobody believes you — least of all the faces that watched you draft it. The clause stands anyway. Denial, at the table, is just another signature.'] },
          ];
        },
      },
    ],
    failure: {
      beat: 'The ring dims. You overplayed — and the table found another supplier. Another village. The hierarchy is real, and you are not the only door.',
      offerLine: 'The table does not punish failure with death. It punishes it with smaller doors — and worse terms.',
    },
    finals: {
      light: [
        { id: 'price', label: 'Name your price.', outcome: ['You name it — with the ramp intact. Humanity becomes the galaxy\'s engine: prosperous, entangled, never quite free, but *leavable*. Irreplaceable is its own kind of cage, but you kept the door ajar, and that changes everything.'] },
        { id: 'teach', label: 'Teach them freely.', outcome: ['You give away the trick — all of it, on the record. The galaxy eats, at last, and remembers who fed it. Humanity becomes teachers, not fuel. The table keeps recalculating that sentence for a hundred years.'] },
      ],
      dark: [
        { id: 'price', label: 'Name your price.', outcome: ['You name it. Humanity becomes the galaxy\'s engine — prosperous, entangled, never quite free. The table agrees so fast it embarrasses everyone. The cage is gilded. It\'s yours. On the bad nights you read the invoice.'] },
        { id: 'cage', label: 'Sign the cage. Own it.', outcome: ['You sign the perfect cage — your design, your margins, your signature three times. Nobody will ever need anything the way the galaxy needs you. Nobody will ever be as owned as you are. The table applauds. The sound follows you home.'] },
      ],
    },
  };

  Game.tableRegisterPath(DEF);
})();
