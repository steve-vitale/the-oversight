// @ontology
// system: table-assimilated
// description: The Assimilated path — the long con. You don't negotiate freedom; you negotiate PLACEMENT: which branch takes you, which access tier, which secrets. Three picks, each a real tradeoff. The safest ending — there is almost no failure here, only worse quarters. The show component is the leaked footage: the only path whose broadcast is contraband. Light = Trojan horse (smuggle the truth inside); dark = true believer (you actually want the warm light).
// provides: (registers via tableRegisterPath; no new Game methods)
// consumes: tableState(), tableRunBeat(), tableFinals(), tableFail(), tableLiveWrap(), say; ledger()
// Load AFTER table.js.
(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  function meterLine(T) {
    const m = T.meters || {};
    return `comfort ${m.comfort | 0} · self ${m.self | 0}`;
  }

  const DEF = {
    id: 'assimilated',
    name: 'the Assimilated',
    minSeat: 'lesser',
    showGenre: 'the leaked footage',
    showLive: null, // the assimilation is NOT televised — the show is contraband
    openLine: 'Comfort, on their terms. Warm light, no hunger, no fear. All it costs is everything that made you worth watching. It\'s such a gentle trap. That\'s what makes it a trap. But you\'re not walking in blind — you\'re negotiating the terms of the trap, room by room.',
    prereq(seat) {
      const L = (typeof Game.ledger === 'function') ? Game.ledger() : {};
      if (!seat || seat.seat === 'none') return { earned: false, strength: 0, why: 'No seat at the table.' };
      // They'll take anyone comfortable — that's the trap and the safety.
      const strength = Math.min(100, 30 + ((L.embrace | 0) * 5));
      return { earned: true, strength, why: 'Always open. The table takes anyone — that\'s what makes it a trap, and what makes it safe.' };
    },
    abilities: {
      shared: [
        { id: 'soft-landing', name: 'Soft Landing', desc: 'You negotiated the pillows first. Comfort starts at 2.', grant: { comfort: 2 } },
        { id: 'orientation', name: 'Orientation', desc: 'You read the intake manual. You know what\'s coming, which is its own small power.' },
      ],
      light: [
        { id: 'dead-drop', name: 'Dead Drop', desc: 'The smuggling plan — where the truth goes inside. (Set in the final beat.)' },
        { id: 'locket', name: 'Locket', desc: 'The grief, kept. A locket clicks open and shut in a drawer of your mind. Self +1.', grant: { self: 1 } },
      ],
      dark: [
        { id: 'true-face', name: 'True Face', desc: 'They love your sincerity — you mean it. Comfort +2.', grant: { comfort: 2 } },
        { id: 'first-tithe', name: 'First Tithe', desc: 'Name the first thing you give up. (Offered in the final beat.)' },
      ],
    },
    beats: [
      {
        say: ['PLACEMENT ONE — THE BRANCH. "WHICH ARM TAKES YOU?" The table doesn\'t ask if you\'ll come inside. It asks *where* inside. Three branches, three lives. Choose like it matters — it\'s the last real choice the old you gets.'],
        meterLine,
        choices: [
          { id: 'kitchens', label: 'The kitchens.', effects: { comfort: 2, self: 0 }, say: ['The kitchens. They feed everyone — even you, even now. Warm work, honest work. You\'ll eat well forever. You\'ll never be hungry again. Sit with that sentence for a while.'] },
          { id: 'archives', label: 'The archives.', effects: { comfort: 1, self: 1 }, say: ['The archives. Knowledge, and access — the long con\'s natural habitat. Every secret you file is a secret you *have*. The horse is inside the walls.'] },
          { id: 'nurseries', label: 'The nurseries.', effects: function (T) { return (T.branch === 'dark') ? { comfort: 1, self: -1 } : { comfort: 1, self: 2 }; }, say: function (T) { return (T.branch === 'dark') ? ['The nurseries. Children — even theirs. You tell yourself it\'s strategic. The part of you that means it is the part that worries you.'] : ['The nurseries. Children — even theirs. Someone has to remember what small hands feel like, from the inside. That someone is you now.']; } },
        ],
      },
      {
        say: ['PLACEMENT TWO — ACCESS TIER. Citizen, resident, or the grey list. The tier decides what you can see, what you can touch, and what can touch you.'],
        meterLine,
        choices: [
          { id: 'citizen', label: 'Full citizen.', effects: { comfort: 2, self: -1 }, say: ['Full citizen. Everything open, everything watched. The warm light, all the way down. You\'ll never wonder what you\'re missing — you\'ll know, and it will be everything.'] },
          { id: 'resident', label: 'Resident alien.', effects: { comfort: 1, self: 0 }, say: ['Resident alien. A strange phrase, now that you live inside it. Comfortable, documented, slightly foreign forever. You can live with that. You\'ll have to.'] },
          { id: 'grey', label: 'The grey list.', effects: { comfort: 0, self: 2 }, say: ['The grey list. Unwatched, unhelped, unowned. Less comfort, more *you*. The horse needs shadows; you just bought some.'] },
        ],
      },
      {
        say: function (T) {
          if ((T.branch || 'light') === 'light') return ['PLACEMENT THREE — THE INTAKE SCAN. The final door. The scanner reads everything you carry — memories, grief, the food truth folded small. "DECLARE IT," the System says, almost kindly. "WHAT ARE YOU SMUGGLING?"'];
          return ['PLACEMENT THREE — THE FIRST TITHE. The table leans in, almost tender. "NAME IT," the System says. "The first village you\'d give up. Say it out loud, and mean it, and the warm light is yours forever."'];
        },
        meterLine,
        choices: function (T) {
          if ((T.branch || 'light') === 'light') return [
            { id: 'truth', label: 'The food truth. (Dead Drop)', effects: { self: 2 }, say: ['"The food truth." You declare it — all of it, folded small, carried inside. The scanner blinks. It doesn\'t understand what you\'re carrying, which is exactly why it will work. The horse is in.'] },
            { id: 'name', label: 'A name.', effects: { self: 1 }, say: ['You give a name — someone you\'ll find, inside. A thread to pull, later. The scanner accepts it. Small things, carried carefully, move worlds.'] },
            { id: 'nothing', label: 'Nothing. (Even now, you lie.)', effects: { comfort: 1 }, say: ['"Nothing." Even now, you lie to the machine — and the lie is the most human thing you\'ve done all day. The scanner believes you. Machines always believe the quiet ones.'] },
          ];
          return [
            { id: 'village', label: 'Name the village. (First Tithe)', effects: { comfort: 2, self: -2 }, say: ['You name it. Out loud. Meaning it — or close enough that the table can\'t tell the difference, which is the same thing, which is the worst thing. The warm light closes over you like water.'] },
            { id: 'refuse', label: 'Refuse.', effects: { comfort: -1, self: 2 }, say: ['"No." The table recoils — a true believer who won\'t tithe is a contradiction, and contradictions get *studied*. You keep yourself. It costs you the easy version of forever.'] },
          ];
        },
      },
    ],
    failure: {
      // By design there is almost no failure here — the Assimilated is the
      // safe ending. This text exists for the framework's sake; the beats
      // above never trigger it.
      beat: 'The ring dims.',
      offerLine: 'The table does not punish failure with death. It punishes it with smaller doors.',
    },
    finals: {
      light: [
        { id: 'comfort', label: 'Accept comfort.', outcome: ['Warm, safe, dim. The dead drop sits inside you like a seed. Someday — years from now, patient as roots — the food truth will sprout in the galactic core, and no one will remember who carried it in. You will. That\'s enough. That\'s everything.'] },
        { id: 'grief', label: 'Remember the taste of grief.', outcome: ['At the last second — the locket, the drawing, the coin. You choose the ache over the anesthesia, *inside* the machine. The table recoils; the horse bolts. The grief is the signal, and the signal gets out. You didn\'t come this far to be comfortable.'] },
      ],
      dark: [
        { id: 'comfort', label: 'Accept comfort.', outcome: ['Warm, safe, dim. The show gets a final season. You don\'t watch it. Somewhere, in a drawer of your mind, a locket clicks open and shut. You can\'t remember why that matters. That\'s the point of comfort. You meant every word of the tithe. That\'s the point of you.'] },
        { id: 'grief', label: 'Remember the taste of grief.', outcome: ['At the last second — the locket. You reach for the ache out of habit, and your hand stops. There\'s nothing there anymore. You had it surgically — no, *willingly* — removed. The table notes your sincerity with approval. You are comfortable. You are true. You are gone.'] },
      ],
    },
  };

  Game.tableRegisterPath(DEF);
})();
