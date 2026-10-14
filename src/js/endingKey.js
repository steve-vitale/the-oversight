// @ontology
// system: ending-key
// description: Endings by build (Steve 2026-10-14: "The ending you can win is set as you enter the table, but that doesn't mean they play the same table scenario or that they can't lose their scenario no matter what path, light or dark. Each playstyle and godhood path, moral choice version should have its own ending." / "The table should all be relative until actually entering it when it locks." / "Both, linked"). Reads the build into an ENDING KEY and hands the Table data, never a gate. The key is live (relative) until the seat is taken; tableScene locks the build half (track, class, god, titan finale, the key) and every door entered fills the path half (path, moral). The Table then (1) plays the build: one beat per path gets a build-aware option from src/data/table-beats.json, chosen most-specific-first (god > class+subclass > class > track > the path default), whose text, gains and titan-finale odds depend on the key and which always carries the path's stake (losable for every key); (2) composes the ending (Steve 2026-10-14 round 5): the path's own light/dark final plus ONE build coda from src/data/table-endings.json codas (god > class/subclass > track, path-independent), unless a rare bespoke path entry (paths.<path>.<selector>.<moral>) overrides it. Seat pricing and earned doors never read this module.
// provides:
//   - endingKeyLive() -> the key as the run stands today (relative; never stored)
//   - endingKeyLock() -> snapshots the build half onto the table state when the seat is taken
//   - endingKeyEnter(pathId, moral) -> fills the path half when a door is entered (and on every downgrade)
//   - endingKey() -> the locked key, or null before the seat is taken
//   - endingSelectors(key) -> lookup order: ['god:<id>', 'class:<path>/<sub>', 'class:<path>', 'track:<t>', 'default']
//   - tableBuildBeat(T) -> {line, choices} for the beat that plays the build, or null
//   - tableEndingFor(pathId, moral, finalId) -> {kind: 'bespoke'|'coda', level, selector, moral, title, lines, outcome} or null (null = the path's final alone)
//   - tableEndingNote(end) -> records which ending text resolved on the table state (telemetry reads it)
//   - titanFinaleOutcome() -> 'network' | 'apocalypse' | 'herald' | 'none' (what the titan finale contributed)
// consumes:
//   - state.scholar, state.titans, progState(), tableState(), playerTracks(), godpathClass(), godpathData()
//   - tablePathName() (table.js; the {path} token), relayLean() (the grey relay's coda moral)
//   - Game.data.tableBeats (src/data/table-beats.json), Game.data.tableEndings (src/data/table-endings.json), Game.data.tracks
// rules:
//   - never_a_gate: nothing here is read by tableSeat or tableEarnedPaths; a run with no class and no god walks every door it earned (code: endingKey.js, scripts/godpath/ladder.js)
//   - relative_until_locked: endingKey() is null until tableScene locks it; endingKeyLive() recomputes every call (code: endingKeyLock)
//   - locked_build: once locked, the build half never changes for the rest of the Table (code: endingKeyLock)
//   - always_losable: every build option carries the path's stake (a meter bar checked before it plays and the path's own limits after) (code: buildChoice)
//   - if_you_dont_know_it_doesnt_show: a class counts only once the System has named it (not lapsed) (code: endingKeyLive)
(function () {
  'use strict';
  const S = globalThis.Scattering = globalThis.Scattering || {};

  const MORALS = ['light', 'dark', 'grey'];
  const LEVELS = ['god', 'subclass', 'class', 'track', 'default'];

  function warn(msg, e) { console.warn('[ending-key] ' + msg + (e ? ': ' + ((e && e.message) || e) : '')); }

  // ---------- pure helpers (shared with scripts/validate-table-endings.js) ----------

  // selectorsFor(key): the lookup order, most specific first. Each entry is
  // {level, sel}. The path and moral are applied by the caller.
  function selectorsFor(key) {
    const k = key || {};
    const out = [];
    if (k.god) out.push({ level: 'god', sel: 'god:' + k.god });
    if (k.godpath && k.subclass) out.push({ level: 'subclass', sel: 'class:' + k.godpath + '/' + k.subclass });
    if (k.godpath) out.push({ level: 'class', sel: 'class:' + k.godpath });
    if (k.track) out.push({ level: 'track', sel: 'track:' + k.track });
    out.push({ level: 'default', sel: 'default' });
    return out;
  }
  // levelOf(sel): which lookup level a selector string belongs to.
  function levelOf(sel) {
    if (sel === 'default') return 'default';
    if (/^god:/.test(sel)) return 'god';
    if (/^class:[^/]+\/[^/]+$/.test(sel)) return 'subclass';
    if (/^class:[^/]+$/.test(sel)) return 'class';
    if (/^track:/.test(sel)) return 'track';
    return null;
  }
  // pick(v, moral): a moral-keyed value ({light, dark, grey}) or a plain one.
  function pick(v, moral) {
    if (v == null) return null;
    if (typeof v === 'string' || Array.isArray(v)) return v;
    if (typeof v === 'object' && (v.light != null || v.dark != null || v.grey != null)) return v[moral] != null ? v[moral] : null;
    return v;
  }
  // hasMoral(entry, moral): does a bespoke entry author this moral?
  function hasMoral(entry, moral) {
    if (!entry) return false;
    const lbl = pick(entry.label, moral);
    const say = pick(entry.say, moral);
    return !!(lbl && say);
  }
  // resolveBeatOption(beatsData, pathId, key, moral): the build option that
  // plays for this key. Candidates in order: god (bespoke, then the god
  // template: every god brings its verb), class+subclass and class
  // (bespoke), the subclass template (every named class gets an option in
  // its own name), track (bespoke), the path default. A template never
  // shadows bespoke class text written for the same build.
  function resolveBeatOption(D, pathId, key, moral) {
    const P = D && D.paths && D.paths[pathId];
    if (!P) return null;
    const opts = P.options || {};
    const T = D.templates || {};
    const sels = selectorsFor(key);
    const cands = [];
    for (const s of sels) {
      cands.push({ s, tpl: false });
      if (s.level === 'god') cands.push({ s, tpl: true });
      if (s.level === 'class' || (s.level === 'subclass' && !sels.some(x => x.level === 'class'))) {
        const sub = sels.find(x => x.level === 'subclass');
        if (sub) cands.push({ s: sub, tpl: true });
      }
    }
    for (const c of cands) {
      const e = c.tpl ? T[c.s.level] : opts[c.s.sel];
      if (e && hasMoral(e, moral)) return { level: c.s.level, sel: c.s.sel, entry: e, bespoke: !c.tpl };
    }
    return null;
  }
  // COMPOSED ENDINGS (Steve 2026-10-14, round 5: "Nope good idea that's
  // kinda manageable."): the ending is the path's own light/dark final plus
  // ONE build coda. Codas are path-independent and live at three levels:
  // god:<id>, class:<path>/<sub>, track:<t> (x light/dark: 10+20+5 = 35
  // selectors, 70 codas). A path-specific entry (paths.<path>.<sel>.<moral>)
  // is a rare bespoke override and wins over every coda.
  const CODA_LEVELS = ['god', 'subclass', 'track'];
  const TOKENS = ['name', 'class', 'god', 'verb', 'path'];
  // codaMoral(moral, lean): codas are written light/dark only. The relay's
  // grey band reads whichever hand is forward, the same rule as its door
  // gift in table.js (relayLean > 0 light, < 0 dark); dead centre reads
  // light, as the relay's grey finals fall back to light.
  function codaMoral(moral, lean) {
    if (moral === 'dark') return 'dark';
    if (moral === 'grey') return (lean || 0) < 0 ? 'dark' : 'light';
    return 'light';
  }
  // resolveEnding(endingsData, pathId, key, moral, lean): what follows the
  // path's final. Order: a bespoke path entry (god > class/sub > class >
  // track, unchanged) > the most specific coda (god > class/sub > track) >
  // null (the path's final alone). Returns {kind: 'bespoke'|'coda', level,
  // sel, entry, moral}; a coda's entry is {lines}.
  function resolveEnding(D, pathId, key, moral, lean) {
    if (!D) return null;
    const sels = selectorsFor(key);
    const P = D.paths && D.paths[pathId];
    if (P) {
      for (const s of sels) {
        if (s.level === 'default') break; // path+moral is the path's own finals (table-<path>.js)
        const e = P[s.sel];
        const m = e && e[moral];
        if (m && ((m.lines && m.lines.length) || (m.finals && Object.keys(m.finals).length))) return { kind: 'bespoke', level: s.level, sel: s.sel, entry: m, moral };
      }
    }
    const C = D.codas || {};
    const cm = codaMoral(moral, lean);
    for (const s of sels) {
      if (CODA_LEVELS.indexOf(s.level) < 0) continue;
      const lines = (C[s.sel] || {})[cm];
      if (Array.isArray(lines) && lines.length) return { kind: 'coda', level: s.level, sel: s.sel, entry: { lines }, moral: cm };
    }
    return null;
  }
  // tokensIn(text): the {tokens} a line uses (the validator rejects unknown ones).
  function tokensIn(t) { const out = []; String(t == null ? '' : t).replace(/\{(\w+)\}/g, (m, k) => { out.push(k); return m; }); return out; }
  // fill(text, vars): {class} {god} {verb} {name} {path} tokens.
  function fill(t, vars) {
    return String(t == null ? '' : t).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null) ? String(vars[k]) : m);
  }
  // universe(godpaths, tracks): every selector a slot can be authored at.
  function universe(GP, tracks) {
    const out = [];
    const paths = (GP && GP.paths) || {};
    for (const pid of Object.keys(paths)) { const g = paths[pid].god; if (g && g.id) out.push('god:' + g.id); }
    for (const pid of Object.keys(paths)) {
      for (const sid of Object.keys(paths[pid].subclasses || {})) out.push('class:' + pid + '/' + sid);
    }
    for (const pid of Object.keys(paths)) out.push('class:' + pid);
    for (const t of (tracks || [])) out.push('track:' + t);
    return out;
  }

  S.EndingKey = { MORALS, LEVELS, CODA_LEVELS, TOKENS, codaMoral, tokensIn, selectorsFor, levelOf, pick, hasMoral, resolveBeatOption, resolveEnding, fill, universe };

  const Game = S.Game;
  if (!Game) return;

  function beatsData() { return (Game.data && Game.data.tableBeats) || null; }
  function endingsData() { return (Game.data && Game.data.tableEndings) || null; }
  function godpaths() { try { return (Game.godpathData && Game.godpathData()) || (Game.data && Game.data.godpaths) || S.GODPATHS || null; } catch (e) { warn('godpaths', e); return null; } }
  function godPathOf(godId) {
    const ps = (godpaths() || {}).paths || {};
    for (const pid of Object.keys(ps)) if (((ps[pid] || {}).god || {}).id === godId) return pid;
    return null;
  }
  function vars(key, pathId) {
    const GP = godpaths() || {};
    const ps = GP.paths || {};
    const v = { name: 'you', class: null, god: null, verb: null, path: null };
    try {
      const pid = pathId || (key && key.tablePath);
      if (pid) v.path = (Game.tablePathName && Game.tablePathName(pid)) || pid;
    } catch (e) { warn('vars path', e); }
    try {
      const me = ((Game.data && Game.data.villagers) || []).find(x => x.id === Game.villagerId);
      if (me && me.name) v.name = String(me.name).split(' ')[0];
    } catch (e) { warn('vars name', e); }
    if (key && key.godpath) {
      const p = ps[key.godpath] || {};
      const sub = ((p.subclasses || {})[key.subclass] || {}).name || p.name || key.godpath;
      v.class = sub;
      if (!key.god) { v.god = (p.god || {}).name || null; v.verb = (p.god || {}).verb || null; }
    }
    if (key && key.god) {
      const gp = ps[godPathOf(key.god)] || {};
      v.god = (gp.god || {}).name || key.god;
      v.verb = (gp.god || {}).verb || 'its verb';
    }
    return v;
  }

  const methods = {
    // titanFinaleOutcome: what the titan finale fed the Table ("Both,
    // linked"). The key (THE NETWORK) outranks the apocalypse, which
    // outranks the herald.
    titanFinaleOutcome() {
      try {
        const pg = this.progState ? this.progState() : {};
        if (pg.networkFallen) return 'network';
        const st = (this.state && this.state.titans) || {};
        const slain = st.slain || {};
        const apoc = (st.cast && st.cast.apocalypse) || null;
        if ((apoc && slain[apoc]) || slain.finale || slain.nielsen) return 'apocalypse';
        if (slain.herald) return 'herald';
        return 'none';
      } catch (e) { warn('titanFinaleOutcome', e); return 'none'; }
    },

    // endingKeyLive: the build as it stands right now. Relative (Steve
    // 2026-10-14): recomputed every call, never stored.
    endingKeyLive() {
      const key = { tablePath: null, moral: null, track: null, godpath: null, subclass: null, god: null, titanFinale: 'none', key: null };
      try {
        // Playstyle: the dominant of the five tracks (ties: tracks.json order).
        const order = (((this.data || {}).tracks || {}).tracks) || ['combat', 'field', 'social', 'craft', 'strange'];
        const tr = this.playerTracks ? (this.playerTracks() || {}) : {};
        let best = null, bx = 0;
        for (const t of order) { const x = ((tr[t] || {}).xp) || 0; if (x > bx) { bx = x; best = t; } }
        key.track = best;
      } catch (e) { warn('track', e); }
      try {
        // Class: only once the System has named it (not lapsed).
        const c = this.godpathClass ? this.godpathClass('player') : null;
        if (c && !c.lapsed && c.path) { key.godpath = c.path; key.subclass = c.subclass || null; }
      } catch (e) { warn('class', e); }
      try {
        const g = ((this.state || {}).scholar || {}).godhood || {};
        const active = (g.active || []).filter(id => godPathOf(id));
        if (active.length) key.god = active[0];
      } catch (e) { warn('god', e); }
      key.titanFinale = this.titanFinaleOutcome();
      try { if ((this.progState() || {}).networkFallen) key.key = 'network'; } catch (e) { warn('key', e); }
      return key;
    },

    // endingKeyLock: the seat is taken; the build half is fixed from here.
    endingKeyLock() {
      try {
        const T = this.tableState();
        if (T.endingKey && T.endingKey.locked) return T.endingKey;
        const k = this.endingKeyLive();
        k.locked = ((this.state || {}).scholar || {}).day || 0;
        k.doors = [];
        T.endingKey = k;
        return k;
      } catch (e) { warn('lock', e); return null; }
    },
    // endingKeyEnter: a door is entered (or re-entered on a downgrade).
    // The moral is the branch the Table already earned from the ledger
    // (relay: its light/grey/dark band).
    endingKeyEnter(pathId, moral) {
      try {
        const k = this.endingKeyLock();
        if (!k) return null;
        k.tablePath = pathId; k.moral = moral || 'light';
        k.doors = k.doors || [];
        k.doors.push(pathId);
        return k;
      } catch (e) { warn('enter', e); return null; }
    },
    endingKey() {
      try { const T = this.tableState(); return (T.endingKey && T.endingKey.locked != null) ? T.endingKey : null; }
      catch (e) { warn('endingKey', e); return null; }
    },
    endingSelectors(key) { return selectorsFor(key || this.endingKey() || this.endingKeyLive()); },

    // tableBuildBeat(T): the build-aware option for the current beat, or null.
    tableBuildBeat(T) {
      try {
        const D = beatsData();
        if (!D || !T || !T.path) return null;
        const P = (D.paths || {})[T.path];
        if (!P || (P.beat | 0) !== (T.beat | 0)) return null;
        const key = this.endingKey() || this.endingKeyEnter(T.path, T.branch);
        const moral = T.branch || 'light';
        const r = resolveBeatOption(D, T.path, key, moral);
        if (!r) return null;
        return buildChoice.call(this, D, P, r, key, moral, T);
      } catch (e) { warn('tableBuildBeat', e); return null; }
    },

    // tableEndingFor: what follows the path's final for the locked key: a
    // bespoke path entry, else ONE build coda, else null (the final alone).
    tableEndingFor(pathId, moral, finalId) {
      try {
        const key = this.endingKey() || this.endingKeyLive();
        let lean = 0;
        if (moral === 'grey') { try { lean = this.relayLean ? (this.relayLean() || 0) : 0; } catch (e) { warn('relayLean', e); } }
        const r = resolveEnding(endingsData(), pathId, key, moral || 'light', lean);
        if (!r) return null;
        const v = vars(key, pathId);
        const e = r.entry;
        const lines = (e.lines || []).map(l => fill(l, v));
        const fin = (e.finals || {})[finalId];
        return { kind: r.kind, level: r.level, selector: r.sel, moral: r.moral, title: e.title ? fill(e.title, v) : null, lines, outcome: fin ? fin.map(l => fill(l, v)) : null };
      } catch (e) { warn('tableEndingFor', e); return null; }
    },
    tableEndingNote(end) {
      try {
        const T = this.tableState();
        T.ending = end ? { kind: end.kind || 'bespoke', level: end.level, selector: end.selector } : { kind: 'path', level: 'path', selector: null };
        return T.ending;
      } catch (e) { warn('note', e); return null; }
    },
  };

  // buildChoice: one option {id:'build'} whose effects carry the stake.
  function buildChoice(D, P, r, key, moral, T) {
    const v = vars(key);
    const e = r.entry;
    const meter = pick(P.meter, moral) || pick(P.meter, 'light');
    const stake = pick(P.stake, moral) || pick(P.stake, 'light') || null;
    const fin = Object.assign({}, D.finale || {}, P.finale || {})[key.titanFinale] || null;
    // Odds: an entry that authors its own effects has them exactly; one that
    // borrows the path's gain gets the level bonus (a god plays stronger
    // than a class, a class than the default). The titan finale adds to both.
    const own = pick(e.effects, moral);
    const bonus = (own ? 0 : ((D.levelBonus || {})[r.level] | 0)) + ((fin && fin.bonus) | 0);
    const base = own || pick(P.gain, moral) || {};
    const eff = Object.assign({}, base);
    if (meter && bonus) eff[meter] = (eff[meter] | 0) + bonus;
    const lines = [];
    const intro = pick(e.line, moral);
    if (intro) lines.push(fill(intro, v));
    const fl = fin && pick(fin.line, moral);
    if (fl) lines.push(fill(fl, v));
    let label = fill(pick(e.label, moral), v);
    if (stake && stake.meter) label += ` (needs ${stake.meter} ${stake.gte != null ? stake.gte + '+' : '≤' + stake.lte})`;
    const say = (pick(e.say, moral) || []).map(l => fill(l, v));
    const limits = P.limits || [];
    const stakeFail = pick(P.stakeFail, moral) || P.stakeFail || 'you played your build before the room was yours';
    const choice = {
      id: 'build', label,
      effects: function (Tx) {
        Tx.buildPlayed = { level: r.level, selector: r.sel, bespoke: !!r.bespoke };
        const m = Tx.meters || {};
        if (stake && stake.meter) {
          const cur = m[stake.meter] | 0;
          const short = (stake.gte != null && cur < stake.gte) || (stake.lte != null && cur > stake.lte);
          if (short) return { fail: stakeFail };
        }
        // The path's own limits still hold after the play (abilMods count).
        for (const L of limits) {
          let d = eff[L.meter] | 0;
          const mult = (Tx.abilMods && Tx.abilMods[L.meter + 'Mult']) || 1;
          if (d > 0) d = Math.max(0, Math.floor(d * mult));
          const after = (m[L.meter] | 0) + d;
          let hit = false;
          if (L.gte != null && after >= L.gte) hit = true;
          if (L.lte != null && after <= L.lte) hit = true;
          if (L.overMeter) {
            const o = (m[L.overMeter] | 0) + (eff[L.overMeter] | 0);
            if (after > o + (L.by | 0)) hit = true;
          }
          if (hit) return Object.assign({}, eff, { fail: L.fail || stakeFail });
        }
        return eff;
      },
      say,
    };
    return { line: lines.join(' '), choices: [choice], level: r.level, selector: r.sel, bespoke: !!r.bespoke };
  }

  Object.assign(Game, methods);
})();
