// oldcore-diag — old-core turnover recorder for the immortal-old-core
// question (sim-oldcore-a, 2026-10-25, flesh-out loop, axis scale-onramp).
//
// QUESTION (not a claim): prior runs show maintain + hushwolf wave-1/2
// stock is 38% of the raid-time pool and never seems to die. Do
// INDIVIDUAL old-core entities ever leave the world, and by which
// removal path? This recorder answers it by tracking every world
// monster from birth (via the spawnsrc tag it already carries) to its
// final fate, and by classifying every removal through the one choke
// point the engine funnels removals through: removeWorldMonster.
//
// MECHANISM, READ FROM CODE (src/js/game.js, src/js/havenGrowth.js,
// never invented):
//   - Every spawn funnels through spawnWorldMonster; the spawnsrc
//     recorder (installed BEFORE this one) tags each object with
//     _spawnsrc/_spawnSeq. This recorder reads that tag — it writes
//     no tag of its own onto game objects, and it never reads a tag
//     the game code reads.
//   - Every removal funnels through removeWorldMonster(m). The cause
//     lives in the CALLER, so this recorder classifies from (in
//     order): flag wraps around resolveWildMonsterEncounter (opts.raid
//     -> raid-defense, else villager-fight), resolvePatrol (patrol),
//     aidFight (aid-crisis), startCombat (combat LIFT, not an exit),
//     tbEnd (settles a lift: 'won' -> player-fight-kill, other results
//     on a non-titan non-lingerer origin -> player-fight-melt, titan /
//     lingerer restore -> re-entry, not an exit); then the Error-stack
//     hint (lingererSortie, monsterTurn, finale/network/titans); then
//     the monster's own state at removal time (fledMonsters entry
//     matching id+hp -> fled-record; gwTrap -> trap-capture).
//   - A removal followed by a same-object re-push (tbEnd restore,
//     combat restore) is recorded as a re-entry and CANCELS the exit:
//     the analyzer treats the entity as continuing. A fled re-entry
//     (travelTo re-spawning a fled record) is a NEW object with a NEW
//     spawnsrc seq, so it is a new birth in the spawnsrc census, never
//     an exit of the old object — the old object itself is classified
//     fled-record, its own fate class, never a kill.
//   - Daily snapshots (policy daily, after delegating) record the
//     present seq set. Any entity absent from a snapshot with no
//     removal event since the last snapshot is 'vanished-unrecorded'
//     in the analyzer — the recorder gap class, counted UNKNOWN.
//   - Lifts still pending at run end are carried in
//     store.pendingLifts (the sweep snapshots them into the row), so
//     a run ending mid-fight reads 'pending-in-fight', not vanished.
//   - Recorder fix during analysis (first band, before any verdict):
//     tbEnd's worldOrigin is set ONLY for titan/lingerer origins, so
//     ordinary wild-monster lifts were never settled and read as
//     vanished (32/256 raid entities on the first pass). The fix
//     recovers the lifted object from the pending-lift map at tbEnd
//     and skips null-origin lifts (cast wanderers) entirely. The
//     first-pass corpus is superseded by the re-run, not patched.
//   - The recorder draws no RNG, throws nothing into the engine
//     (recording errors are counted), returns every original value
//     untouched, and NEVER calls villageStandingTotal(),
//     unlockedWave(), or any other gated standing function mid-run
//     (w5births vetkill discipline).
//
// OBSERVATIONAL ONLY. OLDCORE=1 is the only on-switch. Unset delegates
// byte-identically: no wraps installed, no ctx surface, no record.
// COMPOSE UPON (never edit): tableseat-nowait + raftdraft-diag +
// spawnsrc-diag. POLICY-SIDE ONLY — zero src/js changes (DIAG ONLY).
//
// KNOWN LIMITS (stated, not hidden):
// - A fled record re-entering as a new object cannot be linked back
//   to the old object's seq (fledMonsters stores id/hp/mx/my, no seq),
//   so fled-record is a terminal fate class for the old object, and
//   any later fled-recovery birth is counted as new stock.
// - tbEnd result 'routed'/'fled'/'lost' on a lifted origin whose
//   restore the recorder missed (e.g. a restore path outside tbEnd)
//   would read as player-fight-melt while the entity is in fact back
//   in the world; the daily snapshot + re-push detection corrects
//   this in the analyzer (a re-appearance after a removal cancels
//   the exit), so the final fate is never decided by one event alone.
// - Monsters present before install (during setupGame) carry no
//   spawnsrc tag. The spawnsrc detgate reports post-setup world size
//   0 on this band, so no such stock is expected; any untagged
//   present entity is recorded as seq null and counted unknown.
'use strict';

const MAX_EVENTS = 80000;

function layerOn() { try { return process.env.OLDCORE === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function newStore() {
  return {
    births: [], removals: [], tbEnds: [], snapshots: [],
    pendingLifts: [],
    errs: 0, errors: [], overflow: {},
    installed: false,
  };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function pushCapped(store, list, item) {
  if (store[list].length >= MAX_EVENTS) { store.overflow[list] = (store.overflow[list] || 0) + 1; return false; }
  store[list].push(item);
  return true;
}

function stackHint() {
  try {
    const st = (new Error()).stack || '';
    const names = [];
    for (const line of st.split('\n')) {
      const m = line.match(/at\s+(?:Object\.)?([A-Za-z_$][\w$]*)/);
      if (!m) continue;
      const fn = m[1];
      if (fn === 'stackHint' || fn === 'classifyRemoval' || fn === 'Error') continue;
      if (names.indexOf(fn) < 0) names.push(fn);
      if (names.length >= 8) break;
    }
    return names.join(',');
  } catch (e) { return ''; }
}

function waveOf(Game, m) {
  try {
    if (m && m.wave != null && isFinite(m.wave)) return m.wave | 0;
    if (typeof Game.crisisWaveOf === 'function') {
      const w = Game.crisisWaveOf(m);
      if (w && isFinite(w)) return w | 0;
    }
  } catch (e) { /* fall through */ }
  return 1;
}

// classifyRemoval(mon, flagStack, hint, fledHeld) -> kind string.
// flagStack is innermost-last. fledHeld = true when a fledMonsters
// entry matching this monster's id+hp exists at removal time.
// Pure (no Game reads besides the caller's fledHeld flag) so the unit
// test can drive every branch.
function classifyRemoval(mon, flagStack, hint, fledHeld) {
  const top = flagStack.length ? flagStack[flagStack.length - 1] : null;
  const names = (hint || '').split(',').filter(Boolean);
  const has = (n) => names.indexOf(n) >= 0 || flagStack.indexOf(n) >= 0;
  if (top === 'combat-lift') return 'combat-lift';
  if (top === 'raid-defense') return 'raid-defense-kill';
  if (top === 'villager-fight') return 'villager-fight-kill';
  if (top === 'patrol') return 'villager-fight-kill';
  if (top === 'aid-crisis') return 'aid-crisis-kill';
  if (has('lingererSortie')) return 'raid-lingerer-sortie-kill';
  if (has('monsterTurn')) {
    if (fledHeld) return 'fled-record';
    if (mon && mon.gwTrap) return 'trap-capture';
    // monsterTurn departures: lost-trail vs watched-away vs fearful
    // flee are distinguished by the monster's own counters when
    // available; without counters they share the monsterTurn bucket
    // but remain a named departure, never a kill.
    if (mon && (mon.lostSight || 0) > 6) return 'departure-lost-trail';
    if (mon && (mon.watchTurns || 0) >= 2) return 'departure-watched-away';
    if (mon && (mon.fearTurns || 0) >= 4) return 'fled-record';
    return 'monsterTurn-departure';
  }
  if (fledHeld) return 'fled-record';
  if (mon && mon.gwTrap) return 'trap-capture';
  if (has('finale') || names.some(n => /finale/i.test(n))) return 'scripted-clear';
  if (names.some(n => /network/i.test(n))) return 'scripted-clear';
  if (names.some(n => /titan/i.test(n))) return 'scripted-clear';
  if (names.length) return 'other-named:' + names[0];
  return 'unclassified';
}

function installOldcoreDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._oldcoreDiagStore === store && Game._oldcoreDiagInstalled) return Game._oldcoreDiagUninstall || function () {};
  const uninstalls = [];
  const flagStack = [];
  const pendingLift = new Map(); // object -> {day, seq} for combat lifts awaiting tbEnd
  const wrap = (name, fn) => {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  };
  const seqOf = (mon) => {
    try { return (mon && mon._spawnSeq != null) ? mon._spawnSeq : null; } catch (e) { return null; }
  };
  const srcOf = (mon) => {
    try { return (mon && mon._spawnsrc) || null; } catch (e) { return null; }
  };
  const fledHeldFor = (mon) => {
    try {
      const fm = (Game.state || {}).fledMonsters || {};
      for (const k of Object.keys(fm)) {
        const f = fm[k];
        if (f && f.id === mon.id && (f.hp === mon.hp || f.maxHp === mon.maxHp)) return true;
      }
    } catch (e) { /* no fled record */ }
    return false;
  };

  // Flag wraps: push for the duration of the original call only.
  wrap('resolveWildMonsterEncounter', (orig) => function (vid, m, opts) {
    flagStack.push((opts && opts.raid) ? 'raid-defense' : 'villager-fight');
    try { return orig.apply(this, arguments); }
    finally { flagStack.pop(); }
  });
  wrap('resolvePatrol', (orig) => function () {
    flagStack.push('patrol');
    try { return orig.apply(this, arguments); }
    finally { flagStack.pop(); }
  });
  wrap('aidFight', (orig) => function () {
    flagStack.push('aid-crisis');
    try { return orig.apply(this, arguments); }
    finally { flagStack.pop(); }
  });
  wrap('startCombat', (orig) => function () {
    flagStack.push('combat-lift');
    try { return orig.apply(this, arguments); }
    finally { flagStack.pop(); }
  });

  // Birth tag read: spawnWorldMonster returns AFTER the spawnsrc wrap
  // (installed before this one) has tagged the object.
  wrap('spawnWorldMonster', (orig) => function (mdef, tx, ty, opts) {
    let mon = null;
    try { mon = orig.apply(this, arguments); } catch (e) { throw e; }
    try {
      pushCapped(store, 'births', {
        day: dayOf(Game), seq: seqOf(mon), src: srcOf(mon),
        type: (mon && mon.id) || (typeof mdef === 'string' ? mdef : (mdef && mdef.id)) || null,
        wave: waveOf(Game, mon), tx: tx, ty: ty,
      });
    } catch (e) { noteErr(store, 'birth.rec', e); }
    return mon;
  });

  // The choke point: every removal, classified at removal time.
  // A combat lift is recorded as kind 'combat-lift' and held pending
  // until tbEnd settles it (see below); it is NOT an exit. A null
  // argument (startCombat with no world monster, e.g. a cast
  // wanderer) is an engine no-op and records nothing.
  wrap('removeWorldMonster', (orig) => function (m) {
    if (!m) return orig.apply(this, arguments);
    const hint = stackHint();
    const fledHeld = fledHeldFor(m);
    let kind = null, rec = null;
    try {
      kind = classifyRemoval(m, flagStack, hint, fledHeld);
      rec = {
        day: dayOf(Game), seq: seqOf(m), src: srcOf(m),
        type: (m && m.id) || null, wave: waveOf(Game, m),
        kind: kind, hint: hint, hp: (m && m.hp != null && isFinite(m.hp)) ? Math.round(m.hp) : null,
        fledHeld: fledHeld,
      };
      if (kind === 'combat-lift') {
        pendingLift.set(m, { day: rec.day, seq: rec.seq });
        store.pendingLifts.push({ seq: rec.seq, type: rec.type, day: rec.day });
      } else pushCapped(store, 'removals', rec);
    } catch (e) { noteErr(store, 'removal.rec', e); }
    const r = orig.apply(this, arguments);
    return r;
  });

  // tbEnd settles pending lifts. worldOrigin is set ONLY for titan /
  // lingerer origins (game.js startCombat), so for an ordinary wild
  // monster the lifted object must be recovered from the pending
  // lift map (fights are serial: at most one pending lift at a time;
  // the most recent wins if several ever stack). Titan/lingerer
  // origins are restored inside tbEnd itself (same object pushed
  // back) — those are re-entries, not exits.
  wrap('tbEnd', (orig) => function (result) {
    let origin = null, originSeq = null;
    try {
      const f = this.tbfight;
      origin = f ? f.worldOrigin : null;
      if (!origin && pendingLift.size) {
        const keys = [...pendingLift.keys()];
        origin = keys[keys.length - 1];
      }
      originSeq = origin ? seqOf(origin) : null;
    } catch (e) { /* origin best-effort */ }
    const r = orig.apply(this, arguments);
    try {
      if (origin) {
        const restored = (() => {
          try { return (typeof Game.worldMonsters === 'function') && Game.worldMonsters().indexOf(origin) >= 0; } catch (e) { return false; }
        })();
        const kind = (result === 'won') ? 'player-fight-kill'
          : restored ? 're-entry'
          : 'player-fight-melt';
        pushCapped(store, 'tbEnds', {
          day: dayOf(Game), result: result, seq: originSeq,
          type: origin.id || null, wave: waveOf(Game, origin),
          kind: kind, restored: restored,
          titan: !!origin.titan, lingering: !!origin.lingering,
        });
        // Settle the pending lift: if restored, drop it (not an exit);
        // if killed/melted, convert it into a removal event now.
        if (pendingLift.has(origin)) {
          pendingLift.delete(origin);
          store.pendingLifts = store.pendingLifts.filter(p => p.seq !== originSeq);
          if (kind !== 're-entry') {
            pushCapped(store, 'removals', {
              day: dayOf(Game), seq: originSeq, src: srcOf(origin),
              type: origin.id || null, wave: waveOf(Game, origin),
              kind: kind, hint: 'tbEnd:' + result, hp: null, fledHeld: false,
            });
          }
        } else if (kind !== 're-entry') {
          // Lift happened before install or via an unwrapped path:
          // still record the settled exit so the fate is not lost.
          pushCapped(store, 'removals', {
            day: dayOf(Game), seq: originSeq, src: srcOf(origin),
            type: origin.id || null, wave: waveOf(Game, origin),
            kind: kind, hint: 'tbEnd:' + result + ':no-lift', hp: null, fledHeld: false,
          });
        }
      }
    } catch (e) { noteErr(store, 'tbEnd.rec', e); }
    return r;
  });

  // Re-push detection lives in the analyzer (daily snapshot diff):
  // a seq present in a snapshot after its removal day cancels the
  // exit. tbEnd restores are recorded as 're-entry' above.
  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._oldcoreDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._oldcoreDiagStore = store;
    Game._oldcoreDiagInstalled = true;
    Game._oldcoreDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function snapshotOldcore(Game, store) {
  try {
    const list = (typeof Game.worldMonsters === 'function') ? Game.worldMonsters() : [];
    pushCapped(store, 'snapshots', {
      day: dayOf(Game),
      present: list.map(m => {
        let w = 1;
        try { w = (m.wave != null && isFinite(m.wave)) ? m.wave | 0 : 1; } catch (e) {}
        return { seq: (m._spawnSeq != null ? m._spawnSeq : null), type: m.id || null, wave: w, hp: (m.hp != null && isFinite(m.hp)) ? Math.round(m.hp) : null };
      }),
    });
  } catch (e) { noteErr(store, 'snapshot', e); }
}

function withOldcoreDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installOldcoreDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._oldcore = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
        try { snapshotOldcore(Game, st); } catch (e) { noteErr(st, 'daily.snapshot', e); }
      }
      return r;
    },
  });
}

module.exports = { layerOn, newStore, installOldcoreDiag, withOldcoreDiag, classifyRemoval, snapshotOldcore, MAX_EVENTS };
