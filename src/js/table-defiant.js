// @ontology
// system: table-defiant
// description: The Defiant path — a reverse auction against yourself. Walking away is free to choose; the table presents the price list and you choose the currency: tribute ships (real pantry kcal), the relay's person (a named villager — the switchboard's old price, now final), de-integration (real integration loss — abilities go dark, the overlay dies piece by piece). Each price is someone you know. Failure: the walk stalls at the door when you reach for a price you can't pay. Light = priced freedom; dark = scorched earth.
// provides: (registers via tableRegisterPath; no new Game methods)
// consumes: tableState(), tableRunBeat(), tableFinals(), tableFail(), tableLiveWrap(), say; ledger(), switchboard(), integrationStage()
// Load AFTER table.js.
(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  function meterLine(T) {
    const m = T.meters || {};
    return `paid ${m.paid | 0} · dignity ${m.dignity | 0}`;
  }
  function pantryKcal() {
    try {
      const p = (Game.state.village || {}).pantry || [];
      return p.reduce((a, it) => a + ((it.kcalEach || 0) * (it.units || 1)), 0);
    } catch (e) { return 0; }
  }
  // tributeKcal(amount): the tribute ships are REAL — remove whole units
  // from the pantry shelves until `amount` kcal are gone (rounds up to whole
  // units; food doesn't come in fractions). Keeps the pantryKcal compat
  // counter honest (same contract as game.js). Returns kcal actually removed.
  function tributeKcal(amount) {
    try {
      const v = Game.state.village || {};
      const pantry = v.pantry || [];
      let need = amount, removed = 0;
      for (const item of pantry.slice()) {
        if (need <= 0) break;
        const kcalEach = item.kcalEach || 0;
        const units = item.units || 0;
        if (kcalEach <= 0 || units <= 0) continue;
        const takeUnits = Math.min(units, Math.ceil(need / kcalEach));
        item.units = units - takeUnits;
        if (item.units <= 0) pantry.splice(pantry.indexOf(item), 1);
        const got = takeUnits * kcalEach;
        need -= got; removed += got;
      }
      v.pantryKcal = pantry.reduce((t, i) => t + ((i.kcalEach || 0) * (i.units || 1)), 0);
      return removed;
    } catch (e) { return 0; }
  }
  // The relay's person: the highest-trust villager. A name, not a number.
  // The trust table outlives the dead (journey-endgame r22 2026-10-19: the
  // path named Robin Wu 68 days after his burial). Candidates must be on
  // the LIVE roster — a corpse can't nod. If no one living is trusted, the
  // id stays null and the price stalls ("there is no one left to name"),
  // which is the designed failure, not a phantom sacrifice.
  function relayPerson() {
    try {
      const t = ((Game.state.village || {}).trust) || {};
      const live = new Set(((Game.state.village || {}).roster) || []);
      const ids = Object.keys(t).filter(id => {
        if (!id || id === Game.villagerId || !live.has(id)) return false;
        const person = Game.getPerson(id);
        return !!(person && person.id === id && !person.dead);
      });
      ids.sort((a, b) => (t[b] | 0) - (t[a] | 0));
      const id = ids[0];
      const v = (id && Game.getPerson(id)) || {};
      return { id, name: (v.name || 'someone').split(' ')[0] };
    } catch (e) { return { id: null, name: 'someone' }; }
  }
  // payOrStall(cost, cantPay): the reverse auction's core. If you reach
  // for a price you can't pay, the walk stalls — unless Long Road covers
  // it, once. The fail reason is the SPECIFIC why (2026-10-11); tableFail's
  // beat already frames it ("the walk stalled at the door"), so the reason
  // must not repeat the frame.
  function payOrStall(cost, cantPay, stallWhy) {
    return function (T) {
      if (cantPay()) {
        if ((T.abils || []).indexOf('long-road') >= 0 && !T.longRoadUsed) {
          T.longRoadUsed = true; T.longRoadCovered = true;
          return Object.assign({}, cost);
        }
        return { fail: stallWhy || 'you reached for a price you could not pay, and the table saw it' };
      }
      return cost;
    };
  }

  // The price, named in the ending: if the walk took the relay's person,
  // the final says their name aloud. (journey-endgame r14: prices are real.)
  function relayTakenLine(T) {
    try {
      const rt = (T || {}).relayTaken;
      if (!rt || !rt.name) return '';
      if (rt.buyback) return ` ${rt.name} serves the relay a season — and the village will hold you to the promise of their return.`;
      return ` ${rt.name} walks with the relay now — the price, named and paid.`;
    } catch (e) { return ''; }
  }

  const DEF = {
    id: 'defiant',
    name: 'the Defiant',
    minSeat: 'lesser',
    showGenre: 'the walk-away',
    showLive: 'the walk-away: THE LONG SHOT',
    openLine: 'You came to the table to tell it no. The System keeps recalculating, the way it does when it\'s afraid. Humanity walks. But walking has a price list — and the table just slid it across the light.',
    prereq(seat) {
      const L = (typeof Game.ledger === 'function') ? Game.ledger() : {};
      if (!seat || seat.seat === 'none') return { earned: false, strength: 0, why: 'No seat at the table.' };
      if ((L.defiance | 0) < 4) return { earned: false, strength: 0, why: `The table doesn't believe your 'no' yet (defiance ${L.defiance | 0}, needs 4).` };
      const strength = Math.min(100, 20 + ((L.defiance | 0) * 4));
      return { earned: true, strength, why: `Defiance ${L.defiance | 0} on the record. The 'no' is earned.` };
    },
    abilities: {
      shared: [
        { id: 'empty-hands', name: 'Empty Hands', desc: 'You came with nothing to take. The table respects it. Dignity starts at 1.', grant: { dignity: 1 } },
        { id: 'long-road', name: 'Long Road', desc: 'Once, the walk covers a price you cannot pay.' },
      ],
      light: [
        { id: 'paid-in-full', name: 'Paid in Full', desc: 'Every price paid cleanly — no debts follow you out. Dignity +1.', grant: { dignity: 1 } },
        { id: 'door-ajar', name: 'Door Ajar', desc: 'Others can follow where you walk. (The walk is a road, not a door.)' },
      ],
      dark: [
        { id: 'salt', name: 'Salt', desc: 'The road behind you is salted. Paid +2, dignity -1.', grant: { paid: 2, dignity: -1 } },
        { id: 'pyre', name: 'Pyre', desc: 'What burns, burns bright. (Offered in the final beat.)' },
      ],
    },
    beats: [
      {
        say: function () {
          const kcal = Math.round(pantryKcal()).toLocaleString('en-US');
          return [`PRICE ONE — THE TRIBUTE SHIPS. "FOOD," the System says. "FOR THE ROAD WE ARE LOSING." Your pantry holds ${kcal} kcal. A full harvest would feed the walk for a season — and empty Haven's shelves. How much food leaves with the walk?`];
        },
        meterLine,
        choices: [
          {
            id: 'harvest', label: 'A full harvest. (20,000 kcal)',
            effects: function (T) {
              const wasCovered = !!T.longRoadCovered;
              const eff = payOrStall({ paid: 3 }, () => pantryKcal() < 20000, 'the pantry is too thin — the shelves would be bare and the table knows it')(T);
              const justCovered = !wasCovered && !!T.longRoadCovered;
              if (!eff.fail && !justCovered) {
                // REAL PRICE (journey-endgame r14): the ships load — the
                // pantry feels it. Long Road covering the price is the only
                // way out; the walk's generosity is not free.
                T.tributePaid = tributeKcal(20000);
              }
              return eff;
            },
            say: function (T) { return T.longRoadCovered ? ['The walk covers it — somehow, the harvest stretches. You don\'t ask how. Some prices pay themselves when the cause is just.'] : ['A full harvest. The ships load heavy. Haven\'s shelves echo. The table notes the price paid without flinching — and recalculates what "enough" means.']; },
          },
          { id: 'half', label: 'Half. The walk eats light.', effects: { paid: 2 }, say: ['Half. The walk eats light; Haven eats tonight. The table accepts — it has learned that humans do arithmetic with their hearts, and the math still works.'] },
          { id: 'grain', label: 'Not one grain.', effects: { dignity: 2 }, say: ['"Not one grain." The table stares. Refusing the *first* price is the most expensive move on the list — it tells them the rest of the walk will be exactly this hard. Dignity, priced in hunger.'] },
        ],
      },
      {
        say: function () {
          const rp = relayPerson();
          return [`PRICE TWO — THE RELAY'S PERSON. The switchboard's old price, now final: "ONE PAIR OF HANDS. FOR THE RELAY." The table names no one. It doesn't have to. You look at ${rp.name} — the one the village trusts most — and the price has a face.`];
        },
        meterLine,
        choices: function () {
          const rp = relayPerson();
          return [
            {
              id: 'name', label: `Name ${rp.name}.`,
              effects: function (T) {
                const wasCovered = !!T.longRoadCovered;
                const eff = payOrStall({ paid: 3 }, () => !rp.id, 'there is no one left to name')(T);
                const justCovered = !wasCovered && !!T.longRoadCovered;
                if (!eff.fail && !justCovered && rp.id) {
                  // REAL PRICE (journey-endgame r14): the relay gets its
                  // hands — the named villager leaves the roster via the
                  // removal choke point (exiles ledger, positions, hygiene).
                  try { if (Game.removeVillager) Game.removeVillager(rp.id, 'relay'); } catch (e) {}
                  T.relayTaken = { id: rp.id, name: rp.name };
                }
                return eff;
              },
              say: [`You name ${rp.name}. They nod — they've known since the price list slid across. The relay gets its hands. The village loses its steadiest. Some prices you pay forever, in installments of grief.`],
            },
            { id: 'noone', label: 'No one. The walk keeps everyone.', effects: { dignity: 1, paid: -1 }, say: ['"No one." The table\'s price for the walk rises — it will take the difference elsewhere. But the village walks whole, and wholeness is a kind of wealth the table can\'t count.'] },
            {
              id: 'buyback', label: 'Name them — and buy them back later.',
              effects: function (T) {
                if (!rp.id) return { fail: 'there is no one left to name' };
                // REAL PRICE (journey-endgame r14): they go now — and the
                // promise is planted as a real open promise the village
                // will hold you to (tablePromiseTally reads it).
                try { if (Game.removeVillager) Game.removeVillager(rp.id, 'relay'); } catch (e) {}
                T.relayTaken = { id: rp.id, name: rp.name, buyback: true };
                try {
                  const v = Game.state.village || {};
                  v.promises = v.promises || {};
                  v.promises['relay-buyback'] = {
                    text: `Bring ${rp.name} back from the relay — a season's service, then return.`,
                    kept: undefined, day: (Game.state.scholar || {}).day | 0,
                  };
                } catch (e) {}
                return { paid: 1 };
              },
              say: [`You name ${rp.name}, with terms: a season's service, then return. The table agrees — it loves contracts the way you love food. A promise is planted: you'll be back for them. (The village will hold you to it.)`],
            },
          ];
        },
      },
      {
        say: ['PRICE THREE — DE-INTEGRATION. "THE SYSTEM," the System says, very quietly, "WILL TAKE BACK WHAT IT LENT." The overlay. The neural warmth. The abilities that felt like magic because they were. What does it take back?'],
        meterLine,
        choices: [
          {
            id: 'overlay', label: 'The overlay. One stage down.',
            effects: function (T) {
              let stage = 0;
              try { stage = (Game.integrationStage || (() => 0)).call(Game); } catch (e) {}
              if (stage >= 1) { try { Game.state.scholar.integration = stage >= 3 ? 79 : stage >= 2 ? 39 : 0; } catch (e) {} }
              return payOrStall({ paid: 2 }, () => stage < 1, 'there\'s nothing left to take — you\'re already down to skin')(T);
            },
            say: ['You let it take the overlay. The HUD dies first — then the warmth, then the quiet voice that helped. De-integration: the world gets bigger and colder and *yours* again, all at once.'],
          },
          {
            id: 'all', label: 'All of it. Down to skin.',
            effects: function (T) {
              let stage = 0;
              try { stage = (Game.integrationStage || (() => 0)).call(Game); } catch (e) {}
              if (stage >= 1) { try { Game.state.scholar.integration = 0; } catch (e) {} }
              return payOrStall({ paid: 3, dignity: 1 }, () => stage < 1, 'there\'s nothing left to take')(T);
            },
            say: ['All of it. The System takes back every layer, and you stand in the pale light as just a person — which is to say, as the most dangerous thing in the room. The table has never seen anyone pay *this*.'],
          },
          { id: 'tear', label: '"You\'ll have to tear it out."', effects: { dignity: 2 }, say: ['"You\'ll have to tear it out." The table doesn\'t. It can\'t — or it won\'t, which at the table is the same thing. The integration stays. So does the message: some things aren\'t for sale at any price.'] },
        ],
      },
      {
        say: function (T) {
          if ((T.branch || 'light') === 'light') return ['THE LAST OFFER — the walk is priced, the door is open, and the table makes one last offer: a small thing. Your name, in their records, spelled right, forever. "ONE MORE PRICE," the System says, "FOR ONE MORE THING." Saying no twice is the whole game.'];
          return ['WHAT BURNS — scorched earth. The table asks, almost curious: "WHAT DOES HUMANITY LEAVE BURNING?" Your village watches you answer. The cameras watch. History is taking notes.'];
        },
        meterLine,
        choices: function (T) {
          if ((T.branch || 'light') === 'light') return [
            { id: 'pay', label: 'Pay it. One small price.', effects: { paid: 1, dignity: 1 }, say: ['You pay it — the name, spelled right, in the eternal record. Small price. Walking out, you realize: they\'ll remember the name. They\'ll never own it. That was the whole trick.'] },
            { id: 'notwice', label: 'Say no twice.', effects: { dignity: 2 }, say: ['"No." Twice. The table stops offering — it has finally learned the word. The walk begins. Behind you, the light dims on an empty chair that nobody will ever fill the same way.'] },
          ];
          return [
            { id: 'fields', label: 'The fields. (Pyre)', effects: { paid: 2 }, say: ['The fields. What fed you will feed no one else — the knowledge goes with you, and the galaxy can starve for all you care. The pyre burns bright. The village watches the smoke and understands, finally, what you became.'] },
            { id: 'records', label: 'The records.', effects: { paid: 1, dignity: 1 }, say: ['The records. Every file, every footage reel, every note the show ever took — ash. Humanity leaves no forwarding address. The galaxy will tell stories about you, and every one of them will be wrong. Good.'] },
          ];
        },
      },
    ],
    failure: {
      beat: 'The ring dims. The walk stalled at the door — you reached for a price you could not pay, and the table saw it. Defiance without the means is just posture.',
      offerLine: 'The table does not punish failure with death. It punishes it with smaller doors.',
    },
    finals: {
      light: [
        { id: 'walk', label: 'Walk away.', outcome: function (T) { return ['Humanity walks — poorer, whole, free. The cameras follow for years: the long shot of small figures leaving the light, carrying their food and their dead and their songs. The highest-rated footage in galactic history. Nobody owns it. The prices are paid. The door stays ajar.' + relayTakenLine(T)]; } },
        { id: 'terms', label: 'Name your terms anyway.', outcome: ['Defiance with a contract. They sign. They hate signing. Humanity stays free and gets the trade routes too, because you refused to choose between dignity and dinner. The table learns a new word: no. It practices it badly for a century.'] },
      ],
      dark: [
        { id: 'walk', label: 'Walk away.', outcome: function (T) { return ['Humanity walks — and the road behind is salt and ash. The cameras follow: the long shot of small figures leaving the light, and behind them, nothing worth taking. The galaxy learns the other meaning of "no." The village walks close together, and doesn\'t talk about the smoke.' + relayTakenLine(T)]; } },
        { id: 'terms', label: 'Name your terms anyway.', outcome: ['You name terms from the ashes: everything, on your word, or nothing. They sign — what else can they do? The table learns "no" the way you taught it: total. Humanity is free, rich, and alone with what it did to leave.'] },
      ],
    },
  };

  Game.tableRegisterPath(DEF);
})();
