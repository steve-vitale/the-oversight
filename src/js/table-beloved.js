// @ontology
// system: table-beloved
// description: The Beloved path — the live variety finale. Three acts; you cast villagers (notability-first, the show's own casting law), and the audience meter is live and can TURN on a bad pick. The village-as-protagonist pays off as an ensemble piece you can bomb. Light = genuine love (spend it on the unfilmed); dark = manufactured adoration (the producers offer the edit bay).
// provides: (registers via tableRegisterPath; no new Game methods)
// consumes: tableState(), tableRunBeat(), tableFinals(), tableFail(), tableLiveWrap(), say; ledger(), notabilityWeight(), havenViewership(), apFanLane()/apState()
// Load AFTER table.js.
(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;

  function meterLine(T) {
    return `audience ${((T.meters || {}).audience | 0)}`;
  }
  // The cast: notability-first, the show's own casting law. Names only —
  // the finale is an ensemble piece, and the ensemble is real villagers.
  function castNames(n) {
    try {
      const ids = ((Game.data.villagers || []).map(v => v.id) || []).filter(id => id && id !== Game.villagerId);
      ids.sort((a, b) => ((Game.notabilityWeight(b) | 0) - (Game.notabilityWeight(a) | 0)));
      const names = ids.slice(0, n).map(id => {
        const v = (Game.data.villagers || []).find(x => x.id === id) || {};
        return (v.name || 'someone').split(' ')[0];
      });
      while (names.length < n) names.push(['Mara', 'Theo', 'June'][names.length] || 'a villager');
      return names;
    } catch (e) { return ['Mara', 'Theo', 'June'].slice(0, n); }
  }
  function fanFavor() {
    try {
      if (typeof Game.apFanLane === 'function') {
        return ['fight', 'survival', 'social', 'showbiz'].reduce((a, l) => a + (Game.apFanLane(l) | 0), 0);
      }
      const ap = (typeof Game.apState === 'function') ? Game.apState() : null;
      const fc = (ap && ap.fanClubs) || {};
      return Object.keys(fc).reduce((a, k) => a + (fc[k] | 0), 0);
    } catch (e) { return 0; }
  }
  // Audience turn check: at -3 or below the room turns.
  function turnCheck(extra) {
    return function (T) {
      const m = T.meters || {};
      const aud = (m.audience | 0) + ((extra && extra.audience) | 0);
      if (aud <= -3) return Object.assign({}, extra, { fail: 'the audience turned — the love curdled mid-finale, live, in front of trillions' });
      return extra;
    };
  }

  const DEF = {
    id: 'beloved',
    name: 'the Beloved',
    minSeat: 'lesser',
    showGenre: 'the variety finale',
    showLive: 'the variety finale: ONE NIGHT ONLY',
    openLine: 'The audience is chanting. You don\'t know the words — it isn\'t a language with words — but you know the feeling. The table can\'t move against the cast\'s favorite. That\'s leverage. Tonight, the cast is your village.',
    prereq(seat) {
      const L = (typeof Game.ledger === 'function') ? Game.ledger() : {};
      if (!seat || seat.seat === 'none') return { earned: false, strength: 0, why: 'No seat at the table.' };
      const score = ((L.showmanship | 0) + (L.protected | 0));
      let vw = 0;
      try { vw = (typeof Game.havenViewership === 'function') ? Game.havenViewership() : 0; } catch (e) {}
      const ff = fanFavor();
      if (score < 6) return { earned: false, strength: 0, why: `The audience doesn't know you yet (showmanship+protected ${score}, needs 6).` };
      if (vw < 12 && ff <= 0) return { earned: false, strength: 0, why: 'No audience — the show isn\'t watching and no fan club carries your name.' };
      const strength = Math.min(100, 20 + (vw | 0) + ((L.showmanship | 0) * 2) + Math.min(20, ff));
      return { earned: true, strength, why: `Viewership ${vw}, fan favor ${ff} — the galaxy's favorite, by the numbers.` };
    },
    abilities: {
      shared: [
        { id: 'spotlight', name: 'Spotlight', desc: 'The room is already warm. Audience starts at 2.', grant: { audience: 2 } },
        { id: 'callback', name: 'Callback', desc: 'One bad act can be redone. (Offered once, after a bad beat.)' },
      ],
      light: [
        { id: 'standing-o', name: 'Standing-O', desc: 'Genuine love doesn\'t crater: the audience can\'t fall below 0 while you hold it.', grant: function (T) { T.meterFloors = T.meterFloors || {}; T.meterFloors.audience = 0; return {}; } },
        { id: 'eulogy', name: 'Eulogy', desc: 'The quiet ones\' act lands harder than any headliner. (Offered in the final beat.)' },
      ],
      dark: [
        { id: 'plant', name: 'Plant', desc: 'A cheering section, planted. +2 now — pray they never check the seating chart.', grant: { audience: 2 } },
        { id: 'editbay', name: 'Edit Bay', desc: 'Final cut on your own legend. (Offered in the final beat.)' },
      ],
    },
    beats: [
      {
        say: function () {
          const c = castNames(3);
          return [`ACT ONE — THE CAST. The show's own law: the notable get pulled. Tonight that's ${c[0]}, ${c[1]}, ${c[2]} — your village, under the brightest light in the galaxy. The audience leans in. Choose the opener.`];
        },
        meterLine,
        choices: function (T) {
          const c = castNames(3);
          const list = [
            { id: 'hunter', label: `${c[0]}'s story: the hunt.`, effects: turnCheck({ audience: 2 }), say: [`${c[0]} tells the hunt — the real one, with the fear left in. The audience goes silent in the good way. Silence, at this scale, is deafening.`] },
            { id: 'funny', label: `${c[1]} does the funny one.`, effects: turnCheck({ audience: 1 }), say: [`${c[1]} does the bit about the System's tutorial. It kills. Somewhere, the System laughs too — you can hear it in the overlay's weather.`] },
            { id: 'truth', label: `${c[2]} tells the truth.`, effects: function (Tx) { const dark = (Tx.branch === 'dark'); return turnCheck({ audience: dark ? -1 : 2 })(Tx); }, say: function (Tx) { return (Tx.branch === 'dark') ? [`${c[2]} tells the truth — and the audience smells the production around it. Manufactured sincerity is the one thing trillions of eyes always catch.`] : [`${c[2]} tells the truth — the unproduced kind. The audience weeps in eleven dimensions. You can't fake this. You didn't.`]; } },
          ];
          // Callback: one redo, once per finale.
          if ((T.abils || []).indexOf('callback') >= 0 && !T.callbackUsed) {
            list.push({
              id: 'callback', label: 'Callback: redo the weakest moment.', effects: function (Tx) { Tx.callbackUsed = true; return turnCheck({ audience: 1 })(Tx); },
              say: ['You call it back — "once more, like you mean it." The second take lands. The audience loves a second chance; it makes them feel merciful, which makes them feel powerful, which makes them love you more.'],
            });
          }
          return list;
        },
      },
      {
        say: ['ACT TWO — THE VILLAGE PERFORMS. The whole Haven takes the stage: the feast song, the children\'s game, the thing they do at the fire when they think nobody\'s filming. Everybody\'s filming. Choose the centerpiece.'],
        meterLine,
        choices: [
          { id: 'song', label: 'The feast song.', effects: turnCheck({ audience: 2 }), say: ['The feast song — the one about eating like it matters, because it does. Trillions of beings who never ate anything hear it and feel hungry for the first time. The ratings spike is audible.'] },
          { id: 'game', label: 'The children\'s game.', effects: turnCheck({ audience: 1 }), say: ['The children\'s game. It\'s chaotic and half the rules are made up mid-play. The audience adores it — chaos reads as honesty at scale.'] },
          { id: 'risk', label: 'The risky improv.', effects: turnCheck({ audience: -2 }), say: ['The improv dies. It just dies — wrong crowd, wrong night, wrong everything. You can hear the silence change its mind about you. The show must go on. It goes on without you, for a minute.'] },
        ],
      },
      {
        say: function (T) {
          if ((T.branch || 'light') === 'light') return ['ACT THREE — THE QUIET ONES. The finale\'s last slot. The table expects a headliner. But there are villages nobody filmed, and dead nobody named — and you have spent this whole run learning their names. The love you earned is currency. Spend it here, or keep it.'];
          return ['ACT THREE — THE EDIT BAY. The producers slide the offer across the light: final cut on your own legend. Every bad moment — the deaths, the hunger, the things you said at the fire — gone. The audience will love the version of you that never existed. All it costs is the truth.'];
        },
        meterLine,
        choices: function (T) {
          if ((T.branch || 'light') === 'light') return [
            { id: 'quiet', label: 'Spend it on the quiet ones. (Eulogy)', effects: turnCheck({ audience: 3 }), say: ['You spend it all — the love, the light, the finale slot — on people the cameras never found. You name the unfilmed villages. You name the dead. The audience weeps in eleven dimensions. This is what the show was for, it turns out.'] },
            { id: 'keep', label: 'Keep the slot for the headliner.', effects: turnCheck({ audience: 1 }), say: ['You keep the slot. The headliner shines. It\'s a good show. It\'s only a show. Somewhere, the quiet ones watch, and understand exactly what the love was for.'] },
          ];
          return [
            { id: 'cut', label: 'Take the edit bay. (Edit Bay)', effects: turnCheck({ audience: 3 }), say: ['You take the cut. The bad moments vanish — the deaths, the hunger, all of it, gone from the record. The audience loves you perfectly. The village watches the perfect version of you and doesn\'t recognize anyone.'] },
            { id: 'raw', label: 'Refuse the cut. Air it raw.', effects: turnCheck({ audience: 1 }), say: ['You refuse. "Air it raw." The producers stare. The raw version airs — deaths and all — and the audience loves you *anyway*, which frightens the producers more than anything you\'ve done. Even manufactured, you wouldn\'t manufacture this.'] },
          ];
        },
      },
    ],
    failure: {
      beat: 'The ring dims. The audience turned — the love curdled mid-finale, live, in front of trillions. The footage doesn\'t stop playing, though. It just changes genre.',
      offerLine: 'The table does not punish failure with death. It punishes it with smaller doors — and the footage is evidence now.',
    },
    finals: {
      light: [
        { id: 'audience', label: 'Let the audience speak.', outcome: ['The show becomes the government. Strange. It works. Trillions of viewers hold the table to account in real time, and humanity\'s seat is wherever the cameras are. You made popularity into a constitution — and constitutions, unlike ratings, don\'t dip.'] },
        { id: 'quiet', label: 'Speak for the quiet ones.', outcome: ['You spend the last of the love on people who never had any. The villages nobody filmed, the dead nobody named. The audience weeps in eleven dimensions. This is what the show was for, it turns out. The beloved one\'s final act: making sure nobody else needs to be.'] },
      ],
      dark: [
        { id: 'audience', label: 'Let the audience speak.', outcome: ['The audience speaks — on cue, on brand, on message. The show becomes the government, and the government is *you*, focus-grouped. It works. It will always work. Nobody will ever know if the love was real, least of all you. The ratings are perfect forever.'] },
        { id: 'contract', label: 'Take the network contract.', outcome: ['The network offers forever: the show never ends, the love never dips, the edit bay never closes. You sign. Humanity\'s seat is wherever the cameras are — and the cameras are everywhere, forever. The most-watched cage in history.'] },
      ],
    },
  };

  Game.tableRegisterPath(DEF);
})();
