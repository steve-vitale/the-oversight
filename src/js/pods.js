// @ontology
// system: pods
// description: The stasis pods as a standing weight (KIN.md: "a weight, not a meter", Steve 2026-10-11). No devotion score — a HISTORY of pod-related choices across the run: what you did at each intrusion, what it cost, who saw it. Intrusions fire on a dawn roll from day 14 (~1/28 per dawn, at least 8 days apart), the type weighted by context (high viewership → camera, thin pantry → famine); each is a real choice with real costs both ways. The village's social memory of those choices IS the system — mourners have opinions, broken promises surface (Witness especially). The System monetizes guilt (the Jackpot sells devotion back as entertainment). At the table, history determines what is POSSIBLE: championed runs can demand the pods opened at a real cost; shrugged runs get the callous-oversight epilogue; jackpot losses are part of the story. Adults stay unknown, always.
// provides:
//   - podRemember(kind, detail) -> append a history event
//   - podHistory() -> the event list
//   - podIntrusionTick() -> dawn roll for intrusions
//   - podAnswer(choice) -> resolve a pending intrusion
//   - podAsk() -> "ask the System about the pods" (fulfills promises, costs a favor owed)
//   - podChampioned() -> history reader: championed run
//   - podShrugged() -> history reader: shrugged run
//   - podJackpotLost() -> history reader: jackpot lost
//   - podJackpotWon() -> history reader: jackpot won
//   - podConscripted() -> history reader: conscripted (dark)
//   - podBrokenPromises() -> broken-promise events
//   - podKidsReturned() -> kids home flag
//   - podDemandAvailable() -> table demand possible (history, not meter)
//   - podDemandCost(choice) -> the table charges; pods open
//   - podOversightEpilogue() -> the sting for shrugged good endings
//   - podJackpotLossEpilogue() -> the carried loss
//   - podJackpotStage(via) -> stage the televised Jackpot
//   - podJackpotChoose() -> the approach choice
//   - podJackpotApproach(how) -> spin the wheel
//   - podJackpotSpin(how) -> resolve win/loss
//   - podJackpotWin(how) -> pods open live
//   - podJackpotLoss(how) -> the quiet beat
//   - podConscriptOffer(pathId) -> dark offer (feared/relay)
//   - podConscriptAnswer(accept) -> horror or refusal
//   - podWitnessMaterial() -> broken-promise lines for the Witness defense
// consumes: say, sysSay, displayName, takenKinOf, villagersMourningTaken (lifeseed.js),
//   ledger(), tableState(), tableBranch() (table.js), pantry debit (game.js/village.pantryKcal)
// Load AFTER table.js (reads tableState/branch), AFTER lifeseed.js, AFTER contests.js.

(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game) return;
  const R = Math.random;

  function vPods() {
    try {
      const v = Game.state.village || (Game.state.village = {});
      const p = v.pods || (v.pods = {});
      // Defensive: other writers (jackpot staging, saves) may create the
      // object without the full shape. Never let history go missing.
      if (!Array.isArray(p.history)) p.history = [];
      if (typeof p.lastIntrusion !== 'number') p.lastIntrusion = 0;
      return p;
    } catch (e) { return { history: [], lastIntrusion: 0, pending: null, jackpot: null }; }
  }
  function day() { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
  function first(id) { try { return (Game.displayName(id) || 'someone').split(' ')[0]; } catch (e) { return 'someone'; } }

  // podRemember(kind, detail): the village remembers. Every pod choice goes
  // here — what you did, what it cost, who saw it. This is the system; there
  // is no score.
  function podRemember(kind, detail) {
    try {
      const p = vPods();
      p.history.push(Object.assign({ day: day(), kind }, detail || {}));
      if (p.history.length > 60) p.history = p.history.slice(-60);
    } catch (e) {}
  }

  function podHistory() {
    try { return (vPods().history || []).slice(); } catch (e) { return []; }
  }

  // Mourner opinion: villagers don't track a number — they have opinions.
  // Stored per-villager as a small tag the gossip/convo systems can read.
  function podOpinion(vid, delta, why) {
    try {
      const v = (Game.data.villagers || []).find(x => x.id === vid);
      if (!v) return;
      v.podFeeling = v.podFeeling || { score: 0, notes: [] };
      v.podFeeling.score += delta;
      if (why) { v.podFeeling.notes.push(why); if (v.podFeeling.notes.length > 4) v.podFeeling.notes.shift(); }
    } catch (e) {}
  }
  function mourners() {
    try { return (typeof Game.villagersMourningTaken === 'function') ? Game.villagersMourningTaken() : []; }
    catch (e) { return []; }
  }

  const methods = {
    podRemember,
    podHistory,

    // ============ THE ASK ============
    // podAsk(): "ask the System about the pods." Post-day-7, repeatable.
    // Costs: the System takes a cut — a favor owed. It always deflects, but
    // each asking is wearier than the last; it notices you won't drop it.
    // Fulfills the oldest open takenPromise.
    podAsk() {
      const d = day();
      try {
        const v = Game.state.village || {};
        const lastAsk = (v.pods && v.pods.lastAsk) || 0;
        if (d - lastAsk < 7) {
          Game.say('You ask. The System is still pretending it didn\'t hear the last one. Give it a week.');
          return null;
        }
      } catch (e) {}
      const asks = podHistory().filter(h => h.kind === 'asked').length;
      // The cost: the System keeps books you can't read.
      try { Game.state.systemFavorsOwed = (Game.state.systemFavorsOwed || 0) + 1; } catch (e) {}
      const deflects = [
        '"The PODS? Still napping! Still cozy! You ask like it\'s a problem! It\'s not a problem! It\'s a NAP!"',
        '"Again with the pods! They\'re FINE! The file says fine! ...Why do you keep asking? The audience is STARTING to notice you care. Care is CONTENT, little one."',
        '"...You know what? Fine. ONE pod. Look — see? Breathing. Cozy. Asleep. Happy? GOOD. Now stop asking, you\'re making the sponsors nervous."',
      ];
      Game.sysSay('📡 ' + (deflects[Math.min(asks, deflects.length - 1)]));
      podRemember('asked', { cost: 'favor owed', note: 'asked the System about the pods' });
      // Fulfill the oldest open promise.
      try {
        const v = Game.state.village || {};
        const promises = v.takenPromises || {};
        const open = Object.keys(promises).filter(id => !podHistory().some(h => h.kind === 'promise-kept' && h.vid === id));
        if (open.length) {
          const vid = open[0];
          podRemember('promise-kept', { vid, cost: 'favor owed', note: 'kept the promise to ' + first(vid) });
          podOpinion(vid, 8, 'kept their word about the pods');
          Game.say(`You tell ${first(vid)} what the System said — which is nothing, said loudly. ${first(vid)} nods slowly. "You asked. That's... that's the whole thing. You asked."`);
        }
      } catch (e) {}
      try { vPods().lastAsk = d; } catch (e) {}
      try { Game.save(); } catch (e) {}
      return true;
    },

    // ============ INTRUSIONS ============
    // podIntrusionTick(): called at dawn. The pods keep coming up — about
    // once a season, never twice in a week. Each intrusion sets a pending
    // choice; ignoring it for 3 days IS a choice (shrugged).
    podIntrusionTick() {
      try {
        const d = day();
        if (d < 14) return null;
        const p = vPods();
        if (p.pending) {
          // The moment passed. Silence was the answer.
          if (d - p.pending.day >= 3) {
            const t = p.pending.type;
            p.pending = null;
            podRemember('shrugged', { intrusion: t, note: 'let the moment pass unanswered' });
            for (const id of mourners()) podOpinion(id, -3, 'said nothing when it mattered');
            Game.say('The moment passed. Nobody mentions the pods today. A few people notice that nobody mentions them.');
          }
          return null;
        }
        if (d - (p.lastIntrusion || 0) < 8) return null;
        if (R() > 1 / 28) return null;
        // Pick by context.
        const pantry = (Game.state.village || {}).pantryKcal || 0;
        const types = [];
        types.push('dangle', 'dangle');
        try {
          const viewers = (typeof Game.havenViewership === 'function') ? Game.havenViewership() : 0;
          if (viewers >= 8) { types.push('camera', 'camera'); }
        } catch (e) { types.push('camera'); }
        if (pantry < 8000) { types.push('famine', 'famine'); }
        const t = types[Math.floor(R() * types.length)];
        this.podIntrude(t);
        return t;
      } catch (e) { return null; }
    },

    // podIntrude(type): stage the intrusion. Sets pending; the player
    // answers with podAnswer('act'|'shrug').
    podIntrude(type) {
      const p = vPods();
      p.lastIntrusion = day();
      p.pending = { type, day: day() };
      if (type === 'camera') {
        Game.say('📺 MID-SHOW — the feed cuts away from the game. A pod, huge on the screen. A small face behind the glass, asleep. The System, syrup-sweet: "Look at them! NAPPING! The audience wants to know — what should WE do with them? ...Well? You\'re the Bearer. SAY something. The cameras are RIGHT here."');
        Game.say('(The pods need an answer. Speak for them — it will cost you — or let the segment play.)');
      } else if (type === 'famine') {
        Game.say('At the fire, someone does the math out loud — the pods\' life-support draw, against the pantry. "I\'m just saying. That power could be food." Nobody looks at the mourners. Everybody knows where the mourners are sitting.');
        Game.say('(Defend the pods — it will cost real food — or let the question hang.)');
      } else {
        Game.say('📡 The System, casual as a knife: "So. The pods. We could... discuss them. A favor for a peek? A peek for a promise? We LOVE a bargain. The audience LOVES a bargain. What\'s a little debt between friends?"');
        Game.say('(Bargain — owe the System a favor — or don\'t.)');
      }
      try { Game.save(); } catch (e) {}
    },

    // podAnswer(choice): 'act' or 'shrug'. Both cost. That's the mechanic.
    podAnswer(choice) {
      const p = vPods();
      const pend = p.pending;
      if (!pend) { Game.say('There\'s nothing pending about the pods right now.'); return null; }
      p.pending = null;
      const t = pend.type;
      if (choice === 'act') {
        if (t === 'camera') {
          try { Game.state.systemFavorsOwed = (Game.state.systemFavorsOwed || 0) + 1; } catch (e) {}
          Game.sysSay('📡 "OH! The Bearer SPEAKS! \'Those are CHILDREN, not content!\' — ooh, CLIP THAT. The audience is EATING it. (And we\'ll be collecting, little one. We always collect.)"');
          podRemember('acted', { intrusion: t, cost: 'favor owed', note: 'spoke for the pods on camera' });
          for (const id of mourners()) podOpinion(id, 5, 'spoke up on the broadcast');
        } else if (t === 'famine') {
          try {
            const v = Game.state.village || {};
            const debit = Math.min(2000, v.pantryKcal || 0);
            v.pantryKcal = (v.pantryKcal || 0) - debit;
            podRemember('acted', { intrusion: t, cost: debit + ' kcal', note: 'fed the pods\' share from the pantry' });
          } catch (e) {}
          Game.say('You put pantry food toward the pods\' draw — real calories, off the village\'s plate. The math-keeper goes quiet. The mourners don\'t. One of them puts a hand on your shoulder and doesn\'t say anything, which says everything.');
          for (const id of mourners()) podOpinion(id, 6, 'fed the pods from a thin pantry');
        } else {
          try { Game.state.systemFavorsOwed = (Game.state.systemFavorsOwed || 0) + 1; } catch (e) {}
          Game.sysSay('📡 "A BARGAIN! Sealed! ...The peek: they dream. Did you know? Little flickers behind the glass. Cute! The promise: you\'ll owe us. We\'ll decide what for. That\'s the fun part — for US."');
          podRemember('acted', { intrusion: t, cost: 'favor owed', note: 'bargained with the System over the pods' });
        }
      } else {
        podRemember('shrugged', { intrusion: t, note: 'let it play / let it hang / didn\'t bargain' });
        for (const id of mourners()) podOpinion(id, -4, 'said nothing when it mattered');
        if (t === 'camera') Game.say('You let the segment play. The pod fills the screen, then doesn\'t. Somewhere, a mourner watches you not speak, and files it.');
        else if (t === 'famine') Game.say('You let the question hang. The math stays on the table like a knife nobody picks up. The mourners pick it up — with their eyes.');
        else Game.say('"No bargain." The System pouts for exactly one camera. "Fine! Keep your little mysteries! We\'ll be here. We\'re ALWAYS here."');
      }
      try { Game.save(); } catch (e) {}
      return true;
    },

    // ============ HISTORY READERS ============
    // No meters — these read the history qualitatively.
    podChampioned() {
      const h = podHistory();
      const acted = h.filter(e => e.kind === 'acted' || e.kind === 'promise-kept' || e.kind === 'asked').length;
      const kept = h.filter(e => e.kind === 'promise-kept').length;
      return acted >= 2 && kept >= 1;
    },
    podShrugged() {
      const h = podHistory();
      const intrusions = h.filter(e => e.kind === 'acted' || e.kind === 'shrugged').length;
      const acted = h.filter(e => e.kind === 'acted' || e.kind === 'promise-kept' || e.kind === 'asked').length;
      return intrusions >= 2 && acted === 0;
    },
    podJackpotLost() {
      return podHistory().some(e => e.kind === 'jackpot-lost');
    },
    podJackpotWon() {
      return podHistory().some(e => e.kind === 'jackpot-won');
    },
    podConscripted() {
      return podHistory().some(e => e.kind === 'conscript-accepted');
    },
    podBrokenPromises() {
      return podHistory().filter(e => e.kind === 'promise-broken');
    },
    podKidsReturned() {
      try { return !!(Game.state.village || {}).kidsReturned; } catch (e) { return false; }
    },
  };

  Object.assign(Game, methods);
})();

(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game || !Game.podRemember) return;
  const R = Math.random;
  function day() { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
  function first(id) { try { return (Game.displayName(id) || 'someone').split(' ')[0]; } catch (e) { return 'someone'; } }

  const extra = {
    // ============ THE JACKPOT ============
    // The System sells your devotion back to you as entertainment: the pods
    // as the televised grand prize. Winnable (15%) but usually lost — and
    // the loss is devastating precisely because the show moves on.
    podJackpotStage(via) {
      try {
        const p = (Game.state.village || {}).pods || {};
        if (p.jackpot) return null; // once per run
        (Game.state.village.pods = Game.state.village.pods || {}).jackpot = { day: day(), via: via || 'dangle' };
      } catch (e) {}
      Game.podRemember('jackpot-staged', { note: 'the System made the pods the grand prize' });
      Game.say('📺📺📺 THE SYSTEM, ALL CAPS ENERGY: "TONIGHT! ONE NIGHT ONLY! THE JACKPOT — spin the wheel, win the PODS! That\'s right! Somebody\'s napping little ones, LIVE, as a PRIZE! The audience has been BEGGING! (We taught them to beg. We\'re very good teachers.)"');
      Game.say('The wheel is enormous. Behind it, on the big screen: rows of pods, humming. The galaxy leans in.');
      return true;
    },
    // The Jackpot plays on the chance template: three beats, then the spin.
    // 15% win. The choices flavor the theater; the wheel decides.
    podJackpotSpin(how) {
      const winRoll = R();
      const won = winRoll < 0.15;
      if (won) return this.podJackpotWin(how);
      return this.podJackpotLoss(how);
    },
    podJackpotWin(how) {
      Game.podRemember('jackpot-won', { note: 'won the pods on live television (' + (how || 'spin') + ')' });
      const lines = [];
      lines.push('The wheel slows. The pointer wobbles. Stops.');
      lines.push('Silence — one full second of dead air, the most expensive second in galactic television — then the arena DETONATES.');
      lines.push('📡 "WINNER! WINNER! THE PODS ARE OPEN! Somebody get cameras on the LITTLE ONES!"');
      // The reunion reuses the real casting — mourners first, no phantoms.
      if (typeof Game.kidsBackOutcome === 'function') {
        try {
          const T = (typeof Game.tableState === 'function') ? Game.tableState() : { path: 'beloved' };
          const out = Game.kidsBackOutcome(T) || [];
          (Array.isArray(out) ? out : [out]).forEach(l => Game.say(l));
        } catch (e) {}
      }
      try { Game.state.village.kidsReturned = true; } catch (e) {}
      return lines;
    },
    podJackpotLoss(how) {
      Game.podRemember('jackpot-lost', { note: 'spun for the pods on live television and lost (' + (how || 'spin') + ')' });
      const lines = [];
      lines.push('The wheel slows. The pointer wobbles between fates. You can see where it wants to land. You can\'t do anything about it.');
      lines.push('It stops. Not on the pods.');
      lines.push('📡 "...OOH. So close! SO close! The audience FELT that! ...Anyway! Coming up after the break —"');
      lines.push('The pods stay shut. The big screen cuts away. The show moves on, because the show always moves on.');
      lines.push('Somewhere below the lights, in rows of humming glass, the little ones keep napping. They don\'t know they were almost a prize. That\'s the worst part. Or the kindest. Nobody can tell anymore.');
      lines.forEach(l => Game.say(l));
      try {
        for (const id of ((typeof Game.villagersMourningTaken === 'function') ? Game.villagersMourningTaken() : [])) {
          try {
            const v = (Game.data.villagers || []).find(x => x.id === id);
            if (v) { v.podFeeling = v.podFeeling || { score: 0, notes: [] }; v.podFeeling.score -= 2; v.podFeeling.notes.push('watched the wheel miss'); }
          } catch (e) {}
        }
      } catch (e) {}
      return lines;
    },

    // ============ THE TABLE: DEMAND AT A REAL COST ============
    // podDemandAvailable(): history determines what is POSSIBLE. A run of
    // championing can demand the pods opened — but the table always charges.
    podDemandAvailable() {
      try {
        const T = (typeof Game.tableState === 'function') ? Game.tableState() : {};
        if ((T.branch || 'light') !== 'light') return false;
        if (Game.podKidsReturned()) return false;
        if (Game.podConscripted()) return false;
        return Game.podChampioned();
      } catch (e) { return false; }
    },
    // podDemandCost(choice): the table charges. 'tribute' (food), 'favor'
    // (owe the System), 'standing' (path strength). Player's choice — but
    // there is no free version.
    podDemandCost(choice) {
      const lines = [];
      if (choice === 'tribute') {
        try {
          const v = Game.state.village || {};
          const debit = Math.min(12000, v.pantryKcal || 0);
          v.pantryKcal = (v.pantryKcal || 0) - debit;
          lines.push(`The table names its price: ${debit.toLocaleString()} kcal, off the village's plate, into the galactic stores. You pay it. The village will eat thin this season — and every child at the fire knows exactly what the thinness bought.`);
        } catch (e) {}
      } else if (choice === 'favor') {
        try { Game.state.systemFavorsOwed = (Game.state.systemFavorsOwed || 0) + 2; } catch (e) {}
        lines.push('The table names its price: two favors, owed to the System, terms unspecified. The System beams. "We\'ll think of something WONDERFUL. You\'ll hate it. That\'s the deal!" You sign anyway. Some prices you pay gladly.');
      } else {
        try {
          const T = (typeof Game.tableState === 'function') ? Game.tableState() : {};
          T.pathStrength = Math.max(0, (T.pathStrength | 0) - 1);
        } catch (e) {}
        lines.push('The table names its price: leverage. Your bargaining strength at this table, spent — openly, where everyone sees — on children instead of terms. The judges note it. The village will get a worse deal on everything else. Nobody at the fire would have it any other way.');
      }
      Game.podRemember('demanded', { cost: choice, note: 'demanded the pods opened at the table, paid ' + choice });
      if (typeof Game.kidsBackOutcome === 'function') {
        try {
          const T = (typeof Game.tableState === 'function') ? Game.tableState() : {};
          const out = Game.kidsBackOutcome(T) || [];
          (Array.isArray(out) ? out : [out]).forEach(l => lines.push(l));
        } catch (e) {}
      }
      try { Game.state.village.kidsReturned = true; } catch (e) {}
      return lines;
    },

    // ============ CALLOUS OVERSIGHT ============
    // Reach a good ending having shrugged at every intrusion, and the
    // epilogue paints it. This must sting. The title's new meaning, aloud.
    podOversightEpilogue() {
      let h = [];
      try {
        const T = (typeof Game.tableState === 'function') ? Game.tableState() : {};
        if ((T.branch || 'light') !== 'light') return false;
        if (Game.podKidsReturned()) return false;
        if (Game.podConscripted()) return false;
        h = Game.podHistory();
        const intrusions = h.filter(e => ['acted', 'shrugged'].indexOf(e.kind) >= 0).length;
        const asked = h.some(e => e.kind === 'asked' || e.kind === 'promise-kept');
        // The sting needs the weight: intrusions came and went unanswered.
        if (intrusions < 1 && !h.some(e => e.kind === 'promise')) return false;
        if (asked && !Game.podShrugged()) return false;
      } catch (e) { return false; }
      const lines = [
        '◈ THE OVERSIGHT —',
        'You won. Say it plainly: you won. The village endures. The table signed. The galaxy applauds, and the applause is real, and you earned it.',
        'And somewhere out there — past the cameras, past the light — in rows of humming glass, the little ones are still napping.',
      ];
      // The accusation is specific: built from what actually happened.
      const did = (k) => h.some(e => e.kind === k);
      const sawIntr = (t) => h.some(e => (e.kind === 'acted' || e.kind === 'shrugged') && e.intrusion === t);
      if (h.some(e => e.kind === 'promise')) lines.push('The mourners asked you, and you changed the subject.');
      if (sawIntr('camera')) lines.push('The System put a pod on the screen, and you let the segment play.');
      if (sawIntr('famine')) lines.push('Someone did the math at the fire, and you let the question hang.');
      if (h.some(e => e.kind === 'jackpot-staged')) lines.push('The wheel spun, and you watched it miss, and you went home.');
      if (!did('promise') && !sawIntr('camera') && !sawIntr('famine')) lines.push('You never asked. Not once.');
      lines.push(
        'They are still there. Still small. Still waiting for someone to decide they matter more than the moment.',
        'That is what the word means. Not the watching — anyone can watch. The oversight is the looking away. The most terrible thing the System ever did, it did by accident, because it was bored. You did it on purpose, because you were busy.',
        'The village will tell your story for years. It will be a good story. Listen for the part they don\'t tell.',
      );
      lines.forEach(l => Game.say(l));
      try { Game.recordMoment('The oversight: a good ending, and the pods still shut.'); } catch (e) {}
      return true;
    },
    // A run that gambled on the Jackpot and lost carries that loss.
    podJackpotLossEpilogue() {
      if (!Game.podJackpotLost() || Game.podKidsReturned()) return false;
      Game.say('◈ THE SPIN — Once, on live television, you spun the wheel for them. The whole galaxy watched. The pointer stopped one tooth short. You think about that tooth sometimes — more than you admit. The pods are still shut. You know exactly how close "almost" is. It is exactly this far.');
      return true;
    },

    // ============ DARK CONSCRIPT ============
    // Feared-dark (domination) and Relay-dark (the instrument): the System
    // offers the pods as a resource. Plays as HORROR — never clever.
    podConscriptOffer(pathId) {
      Game.podRemember('conscript-offered', { path: pathId, note: 'the System offered the pods as conscripts' });
      if (pathId === 'feared') {
        Game.say('📡 The System leans in, intimate as a blade: "An army, little terror. Think about it. Small soldiers. Loyal — they\'d grow up knowing exactly who woke them. No fear like a fear that was RAISED. ...We\'re just saying. It\'s on the table. So to speak."');
      } else {
        Game.say('📡 The System, soft: "Nodes. Little warm nodes, wired sweet into the machine. They wouldn\'t even mind — children adapt SO fast. You\'d feel them, you know. All of them. Humming. ...Don\'t look at us like that. You were already thinking it."');
      }
      Game.say('(Take them — an army, or instruments — or refuse. The mourners will know. Everyone will know.)');
      return true;
    },
    podConscriptAnswer(accept) {
      if (accept) {
        Game.podRemember('conscript-accepted', { note: 'took the pods as conscripts' });
        try { if (typeof Game.ledgerAdd === 'function') Game.ledgerAdd('dark', 'conscripted the stasis pods'); } catch (e) {}
        const cast = (typeof Game.castTakingMourners === 'function') ? Game.castTakingMourners(2) : [];
        Game.say('You say yes. The word is small. The pods open — not like morning. Like a barracks.');
        Game.say('The little ones sit up, blinking, and the first thing they see is uniforms. Someone is already measuring them for boots.');
        for (const m of cast) {
          const nm = first(m.id);
          Game.say(`${nm} makes a sound that isn't a word. ${nm}'s ${m.kin.relation || 'kin'} is in that row. ${nm} watched you sign. ${nm} will remember the exact shape of your hand when you did it.`);
          try {
            const v = (Game.data.villagers || []).find(x => x.id === m.id);
            if (v) { v.podFeeling = v.podFeeling || { score: 0, notes: [] }; v.podFeeling.score -= 20; v.podFeeling.notes.push('watched the conscription'); }
          } catch (e) {}
        }
        Game.say('The village doesn\'t cheer. The village has never been this quiet. Somewhere, someone starts packing — not for a journey. Just... away.');
        Game.say('The System is delighted. That\'s the worst part. It\'s delighted, and it doesn\'t understand why nobody else is.');
        try { Game.recordMoment('The pods were opened as conscripts. The village went quiet.'); } catch (e) {}
      } else {
        Game.podRemember('conscript-refused', { note: 'refused the pods as conscripts' });
        Game.say('You say no. The System tilts its head — genuinely puzzled. "But... the EFFICIENCY. Huh. Well. Your loss. Our... also loss, honestly, we\'d already named the battalion."');
        Game.say('The mourners exhale. Nobody knew they were holding their breath. Now everybody knows.');
      }
      try { Game.save(); } catch (e) {}
      return true;
    },

    // ============ WITNESS MATERIAL ============
    // Broken promises surface where it hurts most.
    podWitnessMaterial() {
      const broken = Game.podBrokenPromises();
      if (!broken.length) return [];
      return broken.map(b => {
        const nm = first(b.vid);
        return `The defense calls ${nm}. "${nm}, did the Bearer promise you something? About the pods?" A pause. "${nm} nods. "They said they'd ask. They never did." The courtroom is very quiet. Promises are evidence too.`;
      });
    },
  };

  Object.assign(Game, extra);
})();

(function () {
  const Game = (globalThis.Scattering || {}).Game;
  if (!Game || !Game.podRemember) return;

  Object.assign(Game, {
    // podJackpotChoose(): the approach. Theater matters — the wheel decides,
    // but the galaxy remembers how you played it.
    podJackpotChoose() {
      try {
        const p = (Game.state.village || {}).pods || {};
        if (!p.jackpot || p.jackpot.resolved) return null;
      } catch (e) { return null; }
      Game.say('The wheel towers. The pods hum on the big screen. The audience is standing — the whole arena, on its feet, for children they\'ve never met.');
      Game.say('(How do you play it?)');
      // In the live game this surfaces as the tile action re-render; the
      // spin itself resolves through podJackpotApproach(how).
      return true;
    },
    podJackpotApproach(how) {
      try {
        const pods = (Game.state.village || {}).pods || {};
        if (!pods.jackpot || pods.jackpot.resolved) { Game.say('The wheel is dark. The moment passed.'); return null; }
        pods.jackpot.resolved = true;
        pods.jackpot.how = how;
      } catch (e) {}
      const flavors = {
        conviction: 'You spin like you mean it — like the wheel owes you. It doesn\'t. But the mourners see you try, and that\'s not nothing.',
        finesse: 'You touch the wheel gently, like it\'s a sleeping thing. The crowd leans in. Slow is excruciating, and the cameras love it.',
        ritual: 'You close your eyes first. Not prayer — something older. The arena goes quiet with you. Then you spin.',
      };
      Game.say(flavors[how] || flavors.conviction);
      return Game.podJackpotSpin(how);
    },
  });
})();
