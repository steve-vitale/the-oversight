// @ontology
// system: galactic-cast
// description: Per-run registry of the five galactic personae (Vex Marlowe, Countess Sable, Sarge, Dr. Fenwick, Pip Quindle) as the SAME characters recur across show, contest, alien-encounter, and table layers — Steve's world-building scaffold (2026-10-11). Arc stages: 0 unknown, 1 heard (show exposure), 2 seen (contest/producer contact), 3 faced, 4 known. Stages 1-2 advance here via sponsor cards and signed producer notes; stages 3-4 belong to the encounter/table systems via advanceCastStage. Knowledge-gated: stage 0 never renders a persona name.
// provides:
//   - castState()
//   - castStage(pid)
//   - castKnows(pid)
//   - castDisplayName(pid)
//   - advanceCastStage(pid, stage, why)
//   - castFlag(pid, flag, val)
//   - castShowSponsor(showId)
//   - castProducerDemand()
//   - castSignOff()
// rules:
//   - Stages are monotonic: advanceCastStage never lowers a stage (code: advanceCastStage).
//   - Stage 0: never render a persona name in player-facing text — use "a sponsor" / "the producers" (code: castDisplayName, castSignOff).
//   - Max one cast mention per show; per-persona cooldown of 5 days; chance-gated so personae feel recurring, not spammy (code: castShowSponsor, COOLDOWN_DAYS).
//   - This module never advances stages 3-4 from show/contest paths; those belong to encounter/table systems (code: castShowSponsor, castProducerDemand cap at stage 2).

(function attachGalacticCast() {
  const G = globalThis.Scattering.Game;

  // The five personae with a show/contest presence. ids match src/data/alienPlayers.json.
  // showDomain: show ids (contests.js showPool) where this persona's mention fits their character.
  const CAST = [
    {
      pid: 'vex_marlowe', name: 'Vex Marlowe', sign: '— V. Marlowe',
      org: 'Marlowe Expeditions',
      domain: ['stare_down', 'who_moved_it', 'mystery_smell', 'mouth_race'],
      sponsor: '📺 Tonight\'s exhibition is brought to you by Marlowe Expeditions — forty-seven worlds hunted, zero disappointed.',
      mention: '📺 Vex Marlowe is in the audience tonight. Try to be interesting. She bores easily — and bored hunters improvise.',
      demand: 'Bigger stakes. The audience did not tune in to watch you be CAREFUL.',
    },
    {
      pid: 'countess_sable', name: 'Countess Sable', sign: '— C. Sable',
      org: 'the Meridian Court',
      domain: ['rose_ceremony', 'makeover', 'karaoke', 'dance_off', 'talent_pit', 'museum_of_you'],
      sponsor: '📺 Tonight\'s spectacle is presented by the Meridian Court. Beauty is mandatory. Applause will be measured.',
      mention: '📺 The Meridian Court has a box tonight. The Countess is taking notes. Smile like you mean it.',
      demand: 'Make it beautiful or make it tragic. Ideally both.',
    },
    {
      pid: 'sarge', name: 'Sarge', sign: '— Sarge',
      org: 'the K\'thari Expeditionary Veterans\' Fund',
      domain: ['stare_down', 'talent_pit', 'who_farted', 'small_claims'],
      sponsor: '📺 Tonight\'s exhibition is sponsored by the K\'thari Expeditionary Veterans\' Fund. Stand up straight. They\'re watching.',
      mention: '📺 Sarge is watching from the veterans\' box. He has seen worse. Probably. Don\'t be the worse.',
      demand: 'No sloppiness tonight. The veterans are watching, and so am I.',
    },
    {
      pid: 'dr_fenwick', name: 'Dr. Fenwick', sign: '— Dr. F.',
      org: 'the Meridian Institute',
      domain: ['mystery_smell', 'museum_of_you', 'how_to_human', 'crib_mine', 'lost_found'],
      sponsor: '📺 Tonight\'s program is brought to you by the Meridian Institute. Specimen-grade entertainment. Peer-reviewed.',
      mention: '📺 Dr. Fenwick is cataloguing tonight\'s proceedings. Wave if you do something unrecorded.',
      demand: 'Do something unrecorded. My files have gaps with your name on them.',
    },
    {
      pid: 'pip_quindle', name: 'Pip Quindle', sign: '— Pip!',
      org: 'Quindle Extreme Tourism',
      domain: ['infomercial', 'karaoke', 'nap_wars', 'tiny_door', 'complaint_box', 'crib_mine'],
      sponsor: '📺 Tonight\'s broadcast is brought to you by Quindle Extreme Tourism! You saw it here first!!',
      mention: '📺 Pip Quindle is in the crowd with a camera the size of a shuttle! Say hi! It\'s already filming!',
      demand: 'Give the cameras a moment they\'ll replay FOREVER!!',
    },
  ];
  G.CAST_PERSONAS = CAST.map(function (c) { return c.pid; });

  var COOLDOWN_DAYS = 5;
  var SPONSOR_CHANCE = 0.5;   // stage-0 discovery card fires this often when eligible
  var MENTION_CHANCE = 0.35;  // stage≥1 flavor mention fires this often when eligible

  function day() {
    try { return ((this.state || {}).scholar || {}).day || 1; }
    catch (e) { return 1; }
  }

  G.castState = function () {
    var s = this.state || (this.state = {});
    s.gcast = s.gcast || { stages: {}, flags: {}, cooldowns: {}, history: [] };
    return s.gcast;
  };

  G.castStage = function (pid) {
    try { return this.castState().stages[pid] || 0; }
    catch (e) { return 0; }
  };

  // castKnows(pid): has the player HEARD this persona's name? (stage ≥ 1)
  G.castKnows = function (pid) {
    return this.castStage(pid) >= 1;
  };

  // castDisplayName(pid): the real name once heard, a generic before.
  // KNOWLEDGE GATE (Steve: "if you don't know, it doesn't show").
  G.castDisplayName = function (pid, generic) {
    if (this.castKnows(pid)) {
      var p = null;
      try { p = this.apPersona(pid); } catch (e) {}
      if (p && p.name) return p.name;
      for (var i = 0; i < CAST.length; i++) if (CAST[i].pid === pid) return CAST[i].name;
    }
    return generic || 'a sponsor';
  };

  // advanceCastStage(pid, stage, why): monotonic arc advancement.
  // Stages 1-2 are driven by show/contest systems here; stages 3-4 are
  // driven by the encounter/table systems calling this — this module never
  // sets 3+ from show/contest paths.
  G.advanceCastStage = function (pid, stage, why) {
    try {
      var st = this.castState();
      var cur = st.stages[pid] || 0;
      if (stage > cur) {
        st.stages[pid] = stage;
        st.history.push({ pid: pid, from: cur, to: stage, why: why || '', day: day.call(this) });
        if (st.history.length > 60) st.history = st.history.slice(-60);
      }
      return st.stages[pid] || 0;
    } catch (e) { return 0; }
  };

  G.castFlag = function (pid, flag, val) {
    try {
      var st = this.castState();
      st.flags[pid] = st.flags[pid] || {};
      st.flags[pid][flag] = (val === undefined) ? true : val;
    } catch (e) {}
  };

  function offCooldown(st, pid, d) {
    return (st.cooldowns[pid] || -999) + COOLDOWN_DAYS <= d;
  }
  function setCooldown(st, pid, d) { st.cooldowns[pid] = d; }

  function castById(pid) {
    for (var i = 0; i < CAST.length; i++) if (CAST[i].pid === pid) return CAST[i];
    return null;
  }

  // castShowSponsor(showId): one sponsor card or flavor mention per show, or null.
  // Stage-0 domain match → sponsor card, advances to stage 1 (heard).
  // Stage≥1 domain match (off cooldown) → flavor mention.
  G.castShowSponsor = function (showId) {
    try {
      var st = this.castState();
      var d = day.call(this);
      var fresh = [], known = [];
      for (var i = 0; i < CAST.length; i++) {
        var c = CAST[i];
        if (c.domain.indexOf(showId) < 0) continue;
        if (!offCooldown(st, c.pid, d)) continue;
        if (this.castStage(c.pid) === 0) fresh.push(c);
        else known.push(c);
      }
      // Discovery first: the player meets someone new.
      if (fresh.length && Math.random() < SPONSOR_CHANCE) {
        var c0 = fresh[Math.floor(Math.random() * fresh.length)];
        this.advanceCastStage(c0.pid, 1, 'show sponsor card: ' + showId);
        this.castFlag(c0.pid, 'met_on_show', d);
        setCooldown(st, c0.pid, d);
        return c0.sponsor;
      }
      if (known.length && Math.random() < MENTION_CHANCE) {
        var c1 = known[Math.floor(Math.random() * known.length)];
        setCooldown(st, c1.pid, d);
        return c1.mention;
      }
      return null;
    } catch (e) { return null; }
  };

  // castProducerDemand(): a producer demand note for contest/show twist machinery.
  // Stage ≥1 persona (off cooldown) → characterful signed demand, advancing them
  // toward stage 2 (seen). Otherwise the unsigned generic ("the producers").
  G.castProducerDemand = function () {
    var generic = { line: 'The producers want something NEW. The old bit is retired — improvise.', cost: { trauma: 1 }, pid: null };
    try {
      var st = this.castState();
      var d = day.call(this);
      var eligible = [];
      for (var i = 0; i < CAST.length; i++) {
        var c = CAST[i];
        if (this.castStage(c.pid) >= 1 && offCooldown(st, c.pid, d)) eligible.push(c);
      }
      if (!eligible.length) return generic;
      var c = eligible[Math.floor(Math.random() * eligible.length)];
      this.advanceCastStage(c.pid, 2, 'signed producer note');
      this.castFlag(c.pid, 'interfered_contest', d);
      setCooldown(st, c.pid, d);
      return { line: c.demand + ' ' + c.sign, cost: { trauma: 1 }, pid: c.pid };
    } catch (e) { return generic; }
  };

  // castSignOff(): a bare sign-off for producer-voiced lines (dossier etc.),
  // or '' when no persona is known/available. Never leaks a stage-0 name.
  G.castSignOff = function () {
    try {
      var st = this.castState();
      var d = day.call(this);
      var eligible = [];
      for (var i = 0; i < CAST.length; i++) {
        var c = CAST[i];
        if (this.castStage(c.pid) >= 1 && offCooldown(st, c.pid, d)) eligible.push(c);
      }
      if (!eligible.length) return '';
      var c = eligible[Math.floor(Math.random() * eligible.length)];
      setCooldown(st, c.pid, d);
      return ' ' + c.sign;
    } catch (e) { return ''; }
  };
})();
