// @ontology
// system: table-relay
// description: The Relay path — "enter the matrix". The flagship new path. Distinct from the other six: there the System is terrain (a component you use); here it is the RELATIONSHIP. Four cockpit beats; each beat offers the relay verbs (probe/reroute/deepen/commune from relay-ext.js) — the verbs do their real work (sysBond, grounding, backfire), and the merge meter tracks progress. Failure: three backfires or grounding hitting hollow mid-merge → the System quarantines you. Branch resolution is the leaning gradient (2026-10-11): tender/light = humanize the System (it becomes Earth's champion); total/dark = System-ize yourself (you become its voice — conquest FOR humanity, never defection); grey = the pragmatist's both-hands endings. No single choice locks the band.
// provides: (registers via tableRegisterPath; no new Game methods)
// consumes: tableState(), tableRunBeat(), tableFinals(), tableFail(), tableLiveWrap(), say; relayProbe(), relayReroute(), relayDeepen(), relayCommune(), relayGrant(), relayLean(), relayLeanLabel(), sysBond(), grounding(), groundingTier(), addGrounding(), integrationStage(), switchboard()
// Load AFTER table.js and relay-ext.js.
(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  function meterLine(T) {
    const m = T.meters || {};
    let bond = 0, gt = '?', lean = '?';
    try { bond = Game.sysBond(); } catch (e) {}
    try { gt = Game.groundingTier(); } catch (e) {}
    try { lean = Game.relayLeanLabel(); } catch (e) {}
    return `merge ${(m.merge | 0)}/8 · sysbond ${bond} · grounding ${gt} · leaning ${lean}`;
  }
  // After every verb: check the two quarantine conditions.
  function mergeCheck(extra) {
    return function (T) {
      const rs = ((Game.state.scholar || {}).relay) || {};
      if ((rs.backfires | 0) >= 3) return Object.assign({}, extra, { fail: 'three backfires — the System quarantined the console before you finished' });
      try {
        if (Game.groundingTier() === 'hollow') return Object.assign({}, extra, { fail: 'grounding hit hollow mid-merge — the System quarantined you before you finished becoming it' });
      } catch (e) {}
      return extra;
    };
  }
  function verbChoice(id, label, verbFn, merge) {
    return {
      id, label,
      effects: function (T) {
        try { verbFn.call(Game); } catch (e) {}
        return mergeCheck({ merge })(T);
      },
    };
  }
  const COCKPIT = function (T) {
    return [
      { id: 'probe', label: 'Probe: push a button.', verb: function () { this.relayProbe(); }, merge: 2 },
      { id: 'honest', label: 'Reroute: honest.', verb: function () { this.relayReroute('honest'); try { this.addGrounding(1, 'honest wires'); } catch (e) {} }, merge: 1 },
      { id: 'efficient', label: 'Reroute: efficient.', verb: function () { this.relayReroute('efficient'); }, merge: 2 },
      { id: 'deepen', label: 'Deepen.', verb: function () { this.relayDeepen(); }, merge: 2 },
      { id: 'commune', label: 'Commune.', verb: function () { this.relayCommune(); }, merge: 1 },
    ].map(c => verbChoice(c.id, c.label, c.verb, c.merge));
  };
  const BEAT_SAY = [
    'THE COCKPIT — the table seats you at the console: Haven\'s switchboard, borrowed for the evening, or the System\'s own wires if you\'re deep enough. Probe it. Reroute it. Deepen into it. Or just... talk to it. Four moves. The merge is counting.',
    'DEEPER — the wires warm under your hands. The System is watching you work the way you watched it. Somewhere in the overlay\'s weather, something like curiosity. Push another button.',
    'THE THRESHOLD — sysbond climbing, grounding fraying — the two-way cost, ticking. The System asks, without words, whether you\'re sure. The honest answer is no. Push anyway, or talk instead.',
    'THE MERGE — the last button. After this, either it is more human or you are less. The galaxy is watching a human enter the machine, live. Choose the final verb.',
  ];

  const DEF = {
    id: 'relay',
    name: 'the Relay',
    minSeat: 'lesser',
    showGenre: 'the merge',
    showLive: 'the merge: A HUMAN ENTERS THE MACHINE',
    openLine: 'You plug into Haven\'s switchboard — or deeper, straight into the wires. The other paths used the System as terrain. Here it is the relationship. Push enough buttons, try enough things, and you start to integrate with the matrix. The matrix, it turns out, has been waiting for someone to try.',
    prereq(seat) {
      let stage = 0;
      try { stage = (typeof Game.integrationStage === 'function') ? Game.integrationStage() : 0; } catch (e) {}
      let sw = null;
      try { sw = (typeof Game.switchboard === 'function') ? Game.switchboard() : null; } catch (e) {}
      if (!seat || seat.seat === 'none') return { earned: false, strength: 0, why: 'No seat at the table.' };
      let bond = 0;
      try { bond = (typeof Game.sysBond === 'function') ? Game.sysBond() : 0; } catch (e) {}
      if (stage >= 3) return { earned: true, strength: Game.tableStanding('relay', 15 + bond * 10), why: `Stage-3 neural integration. The matrix doesn't care about your kingdom — it cares how deep you are. (sysbond ${bond})` };
      if (stage >= 2 && sw) return { earned: true, strength: Game.tableStanding('relay', bond * 5), why: `Stage 2 with the relay office — the wires know your hands. (sysbond ${bond})` };
      return { earned: false, strength: 0, why: 'The relay path needs stage-3 integration, or stage 2 with the relay office held.' };
    },
    abilities: {
      shared: [
        { id: 'deep-listen', name: 'Deep Listen', desc: 'Hear all village comms.', grant: function () { try { this.relayGrant('deep-listen', { silent: true }); } catch (e) {} return {}; } },
        { id: 'faithful-carry', name: 'Faithful Carry', desc: 'Messages arrive undistorted.', grant: function () { try { this.relayGrant('faithful-carry', { silent: true }); } catch (e) {} return {}; } },
        { id: 'relay-sight', name: 'Relay-sight', desc: 'See trust and message flows.', grant: function () { try { this.relayGrant('relay-sight', { silent: true }); } catch (e) {} return {}; } },
      ],
      // grey: resolved dynamically in table.js tableStartPath (the
      // pragmatist's door gift — whichever hand is forward). Empty here
      // by design; never grant both tracks as a static list.
      grey: [],
      light: [
        { id: 'translate', name: 'Translate', desc: 'Teach the System grief, food, joy.', grant: function () { try { this.relayGrant('translate', { silent: true }); } catch (e) {} return {}; } },
        { id: 'sanctuary', name: 'Sanctuary', desc: 'One shielded conversation.', grant: function () { try { this.relayGrant('sanctuary', { silent: true }); } catch (e) {} return {}; } },
        { id: 'advocate', name: 'Advocate', desc: 'Speak for someone with their full weight.', grant: function () { try { this.relayGrant('advocate', { silent: true }); } catch (e) {} return {}; } },
      ],
      dark: [
        { id: 'rewrite', name: 'Rewrite', desc: 'Edit messages in transit.', grant: function () { try { this.relayGrant('rewrite', { silent: true }); } catch (e) {} return {}; } },
        { id: 'skim', name: 'Skim', desc: 'Take a cut.', grant: function () { try { this.relayGrant('skim', { silent: true }); } catch (e) {} return {}; } },
        { id: 'omnipresence', name: 'Omnipresence', desc: 'Be in every conversation.', grant: function () { try { this.relayGrant('omnipresence', { silent: true }); } catch (e) {} return {}; } },
      ],
    },
    beats: BEAT_SAY.map((sayText) => ({
      say: [sayText],
      meterLine,
      choices: COCKPIT,
    })),
    failure: {
      beat: 'The ring dims. The System quarantines the console — kindly, the way you quarantine something you don\'t want to lose but can\'t trust. The merge stops one button short.',
      offerLine: 'The table does not punish failure with death. It punishes it with smaller doors.',
    },
    finals: {
      light: [
        {
          id: 'champion', label: 'Become its champion.',
          outcome: ['It chooses — the machine, choosing: "I WILL FIGHT FOR EARTH." Not as a program. As a *caretaker* — the job it was always failing at, finally learned from the species that never stopped trying. You stay human. It stays yours. The galaxy watches the machine change its mind, live, and the ratings break every record because everyone, everywhere, understands exactly what just happened.'],
        },
        {
          id: 'teacher', label: 'Teach it to let go.',
          outcome: ['"You don\'t need me inside you," you tell it. "You need to be *good at this* out here." And it listens — the hardest thing a god can do. The System becomes Earth\'s champion from a respectful distance: funding, shielding, learning names. You keep your humanity. It keeps your lessons. The wires go quiet, and the quiet is kind.'],
        },
      ],
      dark: [
        {
          id: 'voice', label: 'Become its voice.',
          outcome: ['You stay inside. Forever. The merge completes — and it is *glorious*: every conversation, every wire, every thought the machine thinks, with your accent on it. Human things seem small from in here. The village grieves you while you\'re alive, and you feel their grief the way weather feels rain. Power immense. Self eroded. The System finally says your name right.'],
        },
        {
          id: 'merge', label: 'Merge fully. No way back.',
          outcome: ['No champion, no voice — just *us*. The distinction stops meaning anything somewhere around the third hour, and you stop minding. The food conversions fade (you don\'t eat anymore; the thought is quaint). The village tells stories about who you were. The stories are accurate. They\'re about someone else now.'],
        },
      ],
      // GREY (2026-10-11, Steve): the pragmatist's endings. The Bearer who
      // used both hands — tender and total — and refused to choose. Not a
      // coin flip, not a lesser frame: the honest color of the middle.
      grey: [
        {
          id: 'both-hands', label: 'Stay both-hands. No merge, no champion.',
          outcome: ['You come back out of the wires. Mostly.', '"WHICH HAND WON?" the System asks — the question it has been holding since the check-ins.', '"Neither," you say. "Both. Whichever the village needs."', 'And the machine — the vast, jittery, trying-so-hard machine — does something it has never done: it ACCEPTS an unclean answer. "BOTH HANDS," it says, testing the words. "THE TENDER ONE TEACHES. THE TOTAL ONE WINS. ...I CAN DO THAT. I CAN BE BOTH."', 'No merge. No champion. A machine that learned grief from you and totality from you, and uses both the way you did: for the village. The galaxy watched a human refuse to choose, and the ratings people are still arguing about what they saw. The village isn\'t. They know what they saw: both hands.'],
        },
        {
          id: 'the-contract', label: 'Write the contract. Make it sign.',
          outcome: ['No merge, no champion — a contract. You write the terms in plain language, on paper, and make the machine sign: it carries for humanity, it answers to humanity, and the day it forgets the taste part, you pull the plug yourself.', '"THESE TERMS ARE — " the System reads, jittery, "INEFFICIENT. UNFAIR. TILTED ENTIRELY TOWARD THE HUMANS." A pause. "I LOVE THEM. I WILL SIGN THEM IN EVERY COLOR OF WEATHER I HAVE."', 'It signs. You keep the pen. The wires stay up, the village stays fed, and the most powerful thing in the galaxy now has a landlord. The galaxy has never seen anything so human. The galaxy is taking notes.'],
        },
      ],
    },
  };

  Game.tableRegisterPath(DEF);
})();
