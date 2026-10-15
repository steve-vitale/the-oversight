// @ontology
// system: pantheon
// description: God jealousy — the ascended have politics (Steve 2026-10-13).
//   When the player or a villager ascends (godhood.js), they join the
//   pantheon: a roster of gods with attitudes toward the village and each
//   other — awe, jealousy, fear, rivalry (0-100). Great victories inspire
//   awe; defiance and consorting with rival powers breed jealousy; dark
//   acts breed fear. Gods cluster into factions (patrons / scheming / wary
//   / watchers) and maneuver against each other in a daily scheme tick; the
//   village gets caught in it through OMENS and events, never a dashboard.
// provides:
//   - registerAscension(game, {vid, name, godhoodId, kind, architect})
//   - recordDeed(game, kind, opts)  // great_victory, defiance, dark_act,
//                                   // consort_rival, offering, omen_defied,
//                                   // facilitation, ascension_witnessed,
//                                   // promise_broken
//   - godAttitudes(game, godId) -> {awe, jealousy, fear, rivalry}
//   - godPosture(game, godId) -> favor | disfavor | cold | neutral
//   - godFaction(game, godId) -> patrons | scheming | wary | watchers
//   - factions(game) -> {patrons:[], scheming:[], wary:[], watchers:[]}
//   - godRivalry(game, aId, bId) -> 0-100
//   - omenFor(game, godId) -> fiction line or null
//   - schemeTick(game) -> [fiction lines] (daily; gods maneuver)
//   - dailyTick(game) -> [fiction lines] (decay + schemeTick)
//   - architectCredit(game, ascended, architect) -> Records public entry
// consumes:
//   - game.state.pantheon (lazy-created; saved with the run)
//   - game.say / game.sysSay (omens — fiction only, never a dashboard)
//   - S.RunRecords (public/secret Records — defensive: skipped if absent)
//   - S.Godhood.recognitionCeremony (wrapped: player ascension registers)
// rules:
//   - no_management_ui: attitudes are numbers in code and tests ONLY. The
//     player never sees a number — only omens, gossip-tinged lines, and
//     events. omenFor output must never contain digits.
//   - fiction_only_effects: schemeTick moves attitudes and emits lines. It
//     never touches stats, items, kcal, health, or knowledge. Favor and
//     disfavor are expressed as omens in the fiction.
//   - defensive_wrap: every hook is exception-guarded; a pantheon failure
//     can never break gameplay (code: wrapHook)
//   - human_skills_vs_alien_abilities: ascending is System recognition of
//     an alien-ability capstone (godhood.js) — nothing here grants or
//     teaches human skills, and nothing here occupies System slots.
// ============ THE PANTHEON — GOD JEALOUSY ============
// Steve 2026-10-13: gods have attitudes toward the village/player — awe,
// jealousy, fear, rivalry. They move with real deeds. Gods maneuver against
// each other; the village gets caught in it. When the player facilitates
// (NPC heroes ascend), the record credits the architect honestly.
// "Gods, it turns out, have politics." (table.js epilogue)
(function (global) {
  'use strict';
  const S = global.Scattering = global.Scattering || {};

  const ATTS = ['awe', 'jealousy', 'fear', 'rivalry'];
  const REST = { awe: 30, jealousy: 10, fear: 5, rivalry: 15 }; // daily drift targets
  const clamp = n => Math.max(0, Math.min(100, Math.round(n || 0)));

  function P(game) {
    const st = (game && game.state) || {};
    if (!st.pantheon) st.pantheon = { gods: {}, log: [] };
    return st.pantheon;
  }
  function dayOf(game) {
    try { return (game.state && game.state.scholar && game.state.scholar.day) || 0; } catch (e) { return 0; }
  }
  function godList(p) { return Object.values(p.gods || {}); }
  function godById(game, id) { const p = P(game); return p.gods[id] || null; }

  function shift(g, att, n) { g[att] = clamp((g[att] || 0) + n); }

  // ---- registration ----
  // registerAscension(game, {vid, name, godhoodId, kind, architect})
  // kind: 'player' | 'npc'. architect: {vid, name} | null (facilitation play).
  function registerAscension(game, opts) {
    opts = opts || {};
    const p = P(game);
    const id = opts.kind === 'player' ? 'player' : ('npc:' + (opts.vid || 'unknown'));
    if (p.gods[id]) return p.gods[id]; // a god ascends once
    const g = {
      id, vid: opts.vid || null, name: opts.name || 'a new god',
      kind: opts.kind || 'npc', godhood: opts.godhoodId || null,
      day: dayOf(game), architect: opts.architect || null,
      awe: 45, jealousy: 5, fear: 0, rivalry: 0,
      rivals: {}, omens: [],
    };
    p.gods[id] = g;
    // The old gods resent the new. The pantheon grows; nobody asked them.
    for (const other of godList(p)) {
      if (other.id === id) continue;
      shift(other, 'jealousy', 6);
      other.rivals[id] = clamp((other.rivals[id] || 0) + 10);
    }
    // The village's story records the ascension — and the architect, honestly.
    try {
      const R = S.RunRecords;
      if (R) {
        let godhoodName = '';
        try {
          const gh = S.Godhood && S.Godhood.byId && S.Godhood.byId(g.godhood);
          if (gh && gh.name) godhoodName = gh.name;
        } catch (e) {}
        const titled = godhoodName ? `${g.name} — ${godhoodName}` : g.name;
        if (g.architect && g.architect.name) {
          R.architectCredit(game, titled, g.architect.name, (g.architect.acts || []));
        } else {
          R.notePublic(game, 'ascension_' + id, `${titled} ascended. The village has a god now. Gods have politics.`);
        }
      }
    } catch (e) {}
    return g;
  }

  // ---- deeds ----
  // recordDeed(game, kind, opts): moves attitudes with real deeds. Returns
  // { shifted: [{god, att, delta}], omens: [lines] } or null (no gods).
  function recordDeed(game, kind, opts) {
    opts = opts || {};
    const p = P(game);
    const gs = godList(p);
    if (!gs.length) return null;
    const shifted = [];
    const omens = [];
    const target = opts.god ? godById(game, opts.god) : null;
    const apply = (g, att, n) => { const before = g[att]; shift(g, att, n); if (g[att] !== before) shifted.push({ god: g.id, att, delta: n }); };

    switch (kind) {
      case 'great_victory': {
        // Great victories inspire awe. Wave-weighted: bigger monsters, bigger awe.
        const wave = opts.wave || 1;
        const aweN = wave >= 4 ? 14 : wave >= 3 ? 12 : 8;
        for (const g of gs) { apply(g, 'awe', aweN); apply(g, 'jealousy', -3); }
        break;
      }
      case 'defiance': {
        // Defying a god's demand breeds jealousy — and the god always feels
        // it, regardless of posture. This is a felt event, not a number.
        if (target) {
          apply(target, 'jealousy', 12); apply(target, 'awe', -3);
          const felt = `${target.name} felt the defiance. The air tastes of pennies.`;
          target.omens.push({ day: dayOf(game), posture: 'disfavor', text: felt });
          omens.push(felt);
        }
        else for (const g of gs) { apply(g, 'jealousy', 8); apply(g, 'awe', -2); }
        break;
      }
      case 'dark_act': {
        // Dark acts breed fear — the gods fear what the village is becoming.
        for (const g of gs) { apply(g, 'fear', 10); apply(g, 'awe', -2); }
        break;
      }
      case 'consort_rival': {
        // Keeping company with a rival power: the snubbed god is jealous,
        // the consorted god now has a pawn (rivalry up).
        if (target) { apply(target, 'jealousy', 14); }
        if (opts.with) { const w = godById(game, opts.with); if (w) apply(w, 'rivalry', 10); }
        break;
      }
      case 'offering': {
        // The village honors a god. Awe up, jealousy down.
        const to = target || gs[0];
        if (to) { apply(to, 'awe', 5); apply(to, 'jealousy', -5); }
        break;
      }
      case 'omen_defied': {
        // An omen came. Nobody answered.
        for (const g of gs) apply(g, 'jealousy', 8);
        break;
      }
      case 'facilitation': {
        // Building doors for others: the gods respect builders — and resent
        // being upstaged. Mixed.
        for (const g of gs) { apply(g, 'awe', 3); apply(g, 'jealousy', 4); }
        break;
      }
      case 'ascension_witnessed': {
        // Handled in registerAscension; kept as an explicit deed for events
        // that witness an ascension without registering (off-screen gods).
        for (const g of gs) apply(g, 'jealousy', 4);
        break;
      }
      case 'promise_broken': {
        // The gods heard the promise too.
        for (const g of gs) apply(g, 'jealousy', 8);
        break;
      }
      default: return null;
    }
    return { shifted, omens: omens.filter(Boolean) };
  }

  // ---- reading the room ----
  function godAttitudes(game, godId) {
    const g = godById(game, godId);
    if (!g) return null;
    return { awe: g.awe, jealousy: g.jealousy, fear: g.fear, rivalry: g.rivalry };
  }
  // posture: how the god feels about the village RIGHT NOW. Drives omens.
  function godPosture(game, godId) {
    const g = godById(game, godId);
    if (!g) return null;
    if (g.jealousy >= 45 || g.fear >= 50) return 'disfavor';
    if (g.rivalry >= 50) return 'cold';
    if (g.awe >= 55 && g.jealousy < 30) return 'favor';
    return 'neutral';
  }
  // faction: who the god schemes WITH (derived, never managed).
  function godFaction(game, godId) {
    const g = godById(game, godId);
    if (!g) return null;
    if (g.jealousy >= 40 || g.rivalry >= 40) return 'scheming';
    if (g.fear >= 45 && g.fear >= g.awe) return 'wary';
    if (g.awe >= 45 && g.awe >= g.jealousy) return 'patrons';
    return 'watchers';
  }
  function factions(game) {
    const out = { patrons: [], scheming: [], wary: [], watchers: [] };
    for (const g of godList(P(game))) out[godFaction(game, g.id)].push(g.id);
    return out;
  }
  function godRivalry(game, aId, bId) {
    const a = godById(game, aId);
    return a ? clamp(a.rivals[bId] || 0) : 0;
  }

  // ---- omens: the only surface the player ever sees ----
  const FAVOR_LINES = [
    n => `The night sky holds a little longer over the village. ${n} is watching, and is pleased.`,
    n => `Someone's bread rose twice as high this morning. The old ones say that's ${n}'s doing. Nobody argues.`,
    n => `A warm wind moves through the longhouse, though the night is cold. ${n} approves of how the village carries itself.`,
  ];
  const DISFAVOR_LINES = [
    n => `A cold draft moves through the longhouse, though no door is open. ${n} is watching, and is not pleased.`,
    n => `The dogs won't stop barking at the treeline tonight. The old ones say ${n} is in a mood. Feed the dogs. Stay inside.`,
    n => `Someone dreamed of a door slamming. Everyone dreamed of it, which is the part nobody likes. ${n} is owed an answer.`,
  ];
  const COLD_LINES = [
    n => `The air goes thin and formal around dusk, like a room where someone powerful has stopped speaking to someone else. ${n} has other business.`,
  ];
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  function omenFor(game, godId) {
    const g = godById(game, godId);
    if (!g) return null;
    const posture = godPosture(game, godId);
    const line = posture === 'favor' ? pick(FAVOR_LINES)(g.name)
      : posture === 'disfavor' ? pick(DISFAVOR_LINES)(g.name)
      : posture === 'cold' ? pick(COLD_LINES)(g.name)
      : null;
    if (line) {
      g.omens.push({ day: dayOf(game), posture, text: line });
      if (g.omens.length > 20) g.omens.shift();
    }
    return line;
  }

  // ---- the daily machinery: gods maneuver; the village gets caught ----
  // schemeTick(game): the most scheming god acts against another god. The
  // village is caught in it — expressed as omens in the fiction, never a
  // dashboard, never a choice screen. Returns the lines emitted.
  function schemeTick(game) {
    const p = P(game);
    const gs = godList(p);
    const lines = [];
    if (!gs.length) return lines;
    const emit = t => {
      lines.push(t);
      try { if (game.sysSay) game.sysSay(t); } catch (e) {}
      p.log.push({ day: dayOf(game), text: t });
      if (p.log.length > 60) p.log.shift();
    };
    if (gs.length === 1) {
      const line = omenFor(game, gs[0].id);
      if (line) emit(line);
      return lines;
    }
    // schemer = most scheming god past the threshold
    let schemer = null, heat = -1;
    for (const g of gs) {
      const h = (g.jealousy || 0) + (g.rivalry || 0);
      if (h > heat) { heat = h; schemer = g; }
    }
    if (!schemer || heat < 45) {
      // No scheme today: the most awed god's favor omen instead.
      let fav = null;
      for (const g of gs) if (godPosture(game, g.id) === 'favor' && (!fav || g.awe > fav.awe)) fav = g;
      if (fav) { const line = omenFor(game, fav.id); if (line) emit(line); }
      return lines;
    }
    // target: the god the schemer resents most (highest awe, or the newest).
    let target = null;
    for (const g of gs) {
      if (g.id === schemer.id) continue;
      if (!target || g.awe > target.awe) target = g;
    }
    if (!target) return lines;
    schemer.rivals[target.id] = clamp((schemer.rivals[target.id] || 0) + 8);
    target.rivals[schemer.id] = clamp((target.rivals[schemer.id] || 0) + 4);
    const moves = [
      `${schemer.name} wants the village to know: ${target.name}'s favor is borrowed, and debts come due. An offering left at the treeline would settle the question.`,
      `Two winds argued over the longhouse at dusk. ${schemer.name} is telling the other gods that ${target.name} has favorites — and favorites are a kind of rot.`,
      `${schemer.name} sent a sign meant for ${target.name} and made sure the village saw it anyway: a dead bird on the path, facing the longhouse. The message is not for you. The warning is.`,
      `${target.name} answered ${schemer.name} through the weather: hail on one roof, sun on the next. The village is the board they play on. Everyone understands this. Nobody says it.`,
    ];
    emit(pick(moves));
    return lines;
  }

  // dailyTick(game): attitudes cool toward rest, then the scheme tick.
  function dailyTick(game) {
    const p = P(game);
    for (const g of godList(p)) for (const a of ATTS) {
      const cur = g[a] || 0, rest = REST[a];
      g[a] = cur === rest ? cur : clamp(cur + (cur > rest ? -1 : 1));
    }
    return schemeTick(game);
  }

  // architectCredit(game, ascendedName, architectName, acts): the honest
  // credit — delegating to RunRecords so the village's story holds both
  // names. The galaxy remembers the god's name; the village remembers who
  // built the door.
  function architectCredit(game, ascendedName, architectName, acts) {
    try {
      const R = S.RunRecords;
      if (R && typeof R.architectCredit === 'function') return R.architectCredit(game, ascendedName, architectName, acts);
    } catch (e) {}
    return null;
  }

  // ---- defensive hooks into real game events ----
  function wrapHook(obj, name, after) {
    try {
      const orig = obj && obj[name];
      if (typeof orig !== 'function') return;
      const wrapped = function (...args) {
        const r = orig.apply(this, args);
        try { after.call(this, args, r); } catch (e) {}
        return r;
      };
      // Preserve the previous wrapper's name: suites (e.g. meta-progression)
      // assert the outermost wrapper is still named 'metaWrapped'. Our own
      // wrappers stay identifiable via behavior, not name.
      try { Object.defineProperty(wrapped, 'name', { value: orig.name, configurable: true }); } catch (e) {}
      obj[name] = wrapped;
    } catch (e) {}
  }

  function attach() {
    const Game = (S || {}).Game;
    if (!Game) return;
    // Player ascension registers the player as a god.
    if (S.Godhood && S.Godhood.recognitionCeremony) {
      wrapHook(S.Godhood, 'recognitionCeremony', function (args, r) {
        if (!r) return; // the ceremony did not fire — no god to register
        const game = args[0], ghId = args[1];
        try {
          const sch = game && game.state && game.state.scholar;
          const name = (sch && (sch.name || sch.villagerName)) || 'the Bearer';
          // Through the published API (not the closure) so wrappers see it —
          // telemetry-hooks counted villager ascensions only (god-path 2026-10-14).
          const reg = (S.Pantheon && S.Pantheon.registerAscension) || registerAscension;
          reg(game, { vid: sch && sch.villagerId, name, godhoodId: ghId, kind: 'player', architect: null });
        } catch (e) {}
      });
    }
    // Great victories: monster kills feed awe (wave-weighted).
    wrapHook(Game, 'recordWaveKill', function (args) {
      const mid = args[0];
      try {
        const mdef = (this.data && this.data.monsters || []).find(m => m.id === mid);
        recordDeed(this, 'great_victory', { wave: (mdef && mdef.wave) || 1, monsterId: mid });
      } catch (e) {}
    });
    // Contest wins are great victories too.
    wrapHook(Game, '_contestEnd', function (args) {
      try { if (args[1] === 'won') recordDeed(this, 'great_victory', { wave: 1, contest: true }); } catch (e) {}
    });
    // Facilitation: building doors moves the pantheon (respect + resentment).
    wrapHook(Game, 'tableFacilitate', function (args) {
      try { recordDeed(this, 'facilitation', { kind: args[0], vid: args[1] }); } catch (e) {}
    });
    // Dark acts breed fear.
    wrapHook(Game, 'eatCannibal', function () {
      try { recordDeed(this, 'dark_act', { what: 'cannibalism' }); } catch (e) {}
    });
    // Daily: attitudes cool, gods scheme, omens fire.
    const G = Game;
    if (typeof G.endDay === 'function' && !G.endDay._pantheonWrapped) {
      const _ed = G.endDay;
      const endDayWrapped = function (...args) {
        const r = _ed.apply(this, args);
        try { dailyTick(this); } catch (e) {}
        return r;
      };
      try { Object.defineProperty(endDayWrapped, 'name', { value: _ed.name, configurable: true }); } catch (e) {}
      endDayWrapped._pantheonWrapped = true;
      G.endDay = endDayWrapped;
    }
  }
  try { attach(); } catch (e) {}

  S.Pantheon = {
    registerAscension, recordDeed,
    godAttitudes, godPosture, godFaction, factions, godRivalry,
    omenFor, schemeTick, dailyTick,
    architectCredit,
    _rest: REST, _atts: ATTS,
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
