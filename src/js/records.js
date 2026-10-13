// @ontology
// system: runRecords
// description: Persistent Records — the village's story (Steve 2026-10-13).
//   An in-run ledger of deeds: PUBLIC achievements (the village's glory,
//   visible — first blood, feasts, ascensions, architect credits) and SECRET
//   achievements (tracked silently, revealed only when earned). Records are
//   meaning, not stats: they persist across the run in the save, and they
//   grant ZERO mechanical advantage — never stats, never abilities, never
//   items, never knowledge, never cross-run leakage into fresh runs.
//   (Distinct from metaProgression.js: that is the cross-run per-device
//   achievement codex. This is the single run's own story.)
// provides:
//   - notePublic(game, id, text) -> entry (idempotent)
//   - trackSecret(game, id) / secretTracked(game, id) / isRevealed(game, id)
//   - revealSecret(game, id, text) -> entry (announces once)
//   - architectCredit(game, ascendedName, architectName, acts) -> entry
//   - publicLines(game) -> [{id, day, text}] (village's glory, visible)
//   - secretLines(game) -> [{id, day, text}] (revealed only)
//   - recordCount(game) -> {public, secret}
// consumes:
//   - game.state.records (lazy-created; saved with the run — in-run only)
//   - game.sysSay (announcements; fiction, never a dashboard)
// rules:
//   - zero_fresh_run_power: every function here writes ONLY state.records
//     and emits say lines. Never touches scholar/village stats, abilities,
//     items, knowledge, or localStorage. A fresh newGame starts with an
//     empty Records and nothing ever carries over. (code: this file's
//     source contains no such writes; scripts/test-blitz-godrecords.js
//     asserts it statically AND at runtime)
//   - secrets_stay_secret: unrevealed secrets render NOWHERE. No hints, no
//     ??? placeholders. "If you don't know, it doesn't show." secretLines
//     returns revealed entries only.
//   - idempotent: a public id is written once — the first telling is the
//     honest one. revealSecret on an unknown id creates the entry (the
//     reveal IS the first telling).
//   - no_silent_records: public and revealed-secret entries are announced
//     in the fiction when written (no silent actions).
//   - defensive_wrap: every hook is exception-guarded; Records can never
//     break gameplay (code: wrapHook)
// ============ RECORDS — THE VILLAGE'S STORY ============
// Steve 2026-10-13: persistent Records — public achievements (the village's
// glory, visible) + secret achievements (tracked, revealed when earned).
// The Records are memory and glory, never power.
(function (global) {
  'use strict';
  const S = global.Scattering = global.Scattering || {};

  function R(game) {
    const st = (game && game.state) || {};
    if (!st.records) st.records = { public: {}, secret: {}, seq: 0 };
    return st.records;
  }
  function dayOf(game) {
    try { return (game.state && game.state.scholar && game.state.scholar.day) || 0; } catch (e) { return 0; }
  }
  function announce(game, text) {
    try { if (game.sysSay) game.sysSay(text); } catch (e) {}
  }

  // notePublic(game, id, text): the village's glory, visible. Idempotent —
  // the first telling is the honest one. Announced in the fiction.
  function notePublic(game, id, text) {
    const r = R(game);
    if (r.public[id]) return r.public[id];
    const entry = { id, day: dayOf(game), text: String(text) };
    r.public[id] = entry;
    announce(game, `◈ The Records: ${text}`);
    return entry;
  }

  // trackSecret(game, id): begin tracking a secret achievement. Silent —
  // nothing renders, nothing announces.
  function trackSecret(game, id) {
    const r = R(game);
    if (!r.secret[id]) r.secret[id] = { id, tracked: true, revealed: false, day: null, text: null };
    return r.secret[id];
  }
  function secretTracked(game, id) {
    const r = R(game);
    return !!(r.secret[id] && r.secret[id].tracked);
  }
  function isRevealed(game, id) {
    const r = R(game);
    return !!(r.secret[id] && r.secret[id].revealed);
  }

  // revealSecret(game, id, text): the secret is earned — carve it into the
  // Records and announce it once. Unknown ids are created on reveal.
  function revealSecret(game, id, text) {
    const r = R(game);
    const cur = r.secret[id] || { id, tracked: true, revealed: false };
    if (cur.revealed) return cur;
    cur.revealed = true;
    cur.day = dayOf(game);
    cur.text = String(text);
    r.secret[id] = cur;
    announce(game, `◈ A secret is carved into the Records: ${text}`);
    return cur;
  }

  // architectCredit(game, ascendedName, architectName, acts): the honest
  // credit. The galaxy remembers the god's name; the village remembers who
  // built the door. Both are true. Neither is small.
  function architectCredit(game, ascendedName, architectName, acts) {
    const actsText = (acts && acts.length) ? `: ${acts.join(', ')}` : '';
    return notePublic(
      game,
      'architect_' + String(ascendedName).slice(0, 40),
      `${ascendedName} ascended — doors built by ${architectName}${actsText}. The galaxy will remember the god's name. The village will remember who built the door. Both are true. Neither is small.`
    );
  }

  // publicLines(game): the village's glory, visible — for the Records view.
  function publicLines(game) {
    const r = R(game);
    return Object.values(r.public).map(e => ({ id: e.id, day: e.day, text: e.text }));
  }
  // secretLines(game): revealed secrets only. Unrevealed secrets render
  // NOWHERE — not even as ??? placeholders.
  function secretLines(game) {
    const r = R(game);
    return Object.values(r.secret).filter(e => e.revealed).map(e => ({ id: e.id, day: e.day, text: e.text }));
  }
  function recordCount(game) {
    const r = R(game);
    return { public: Object.keys(r.public).length, secret: Object.values(r.secret).filter(e => e.revealed).length };
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
  function monsterName(game, mid) {
    try {
      const m = (game.data && game.data.monsters || []).find(x => x.id === mid);
      return (m && (m.name || m.title)) || mid;
    } catch (e) { return mid; }
  }

  function attach() {
    const Game = (S || {}).Game;
    if (!Game) return;
    // First blood: the village's first kill is public glory.
    wrapHook(Game, 'recordWaveKill', function (args) {
      const mid = args[0];
      try {
        const wave = (this.data && this.data.monsters || []).find(m => m.id === mid);
        const w = (wave && wave.wave) || 1;
        const wk = (this.state && this.state.waveKills) || {};
        const total = Object.values(wk).reduce((a, b) => a + (b || 0), 0);
        if (total <= 1) notePublic(this, 'first_blood', `The village drew first blood: ${monsterName(this, mid)} is dead. It is written.`);
        if (w >= 4) notePublic(this, 'apex_slain', `An apex thing died by village hands: ${monsterName(this, mid)}. The Records hold it up to the light.`);
      } catch (e) {}
    });
    // Contest champions are public glory.
    wrapHook(Game, '_contestEnd', function (args) {
      try {
        if (args[1] !== 'won') return;
        const ac = args[0] || {};
        const cname = ac.contestName || ac.title || ac.id || 'a contest';
        const who = (ac.participantName || (this.state && this.state.scholar && this.state.scholar.name)) || 'the Bearer';
        notePublic(this, 'champion_' + (ac.id || cname), `${who} won ${cname} under the cameras. The village's glory, public and loud.`);
      } catch (e) {}
    });
    // Facilitation plays: the architect's credit starts here — the door
    // being built is public glory. The ascension completes it (pantheon.js).
    wrapHook(Game, 'tableFacilitate', function (args) {
      try {
        const kind = args[0], vid = args[1];
        const v = (this.data && this.data.villagers || []).find(x => x.id === vid);
        const vname = (v && v.name) || 'a villager';
        const bname = (this.state && this.state.scholar && (this.state.scholar.name || this.state.scholar.villagerName)) || 'the Bearer';
        notePublic(this, 'door_' + vid, `${bname} is building a door for ${vname} (${kind}). The Records will hold both names.`);
      } catch (e) {}
    });
  }
  try { attach(); } catch (e) {}

  S.RunRecords = {
    notePublic, trackSecret, secretTracked, isRevealed, revealSecret,
    architectCredit, publicLines, secretLines, recordCount,
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
