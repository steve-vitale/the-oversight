// deedtest-diag — Arc IV deed-counter recorder for the scale-onramp
// axis (sim-deedtest-a, 2026-10-26, flesh-out loop, DIAG ONLY:
// zero src/js changes, policy-side only).
//
// QUESTION: the 73678 case (driveoff-clean-a) — a Strike faced
// from a feast draw on day 115, killed, Arc IV, win day 116;
// the same Strike driven off day 115, met in the world day 120,
// killed by the same killer, yet Arc IV never came. Killing
// the beast is not the deed — or so the case suggests. This
// recorder names the deed movement itself.
//
// MECHANISM, READ FROM CODE (never invented):
//   - progression.js recordDeedFight(monsterId): the ONLY Arc IV
//     deed counter. Sets deedState().wavesFaced[id] = wave,
//     first-fight-wins (an existing key is never overwritten).
//   - It is fed by exactly three wraps: (1) _deedWrap
//     ('startCombat') after — a real new tbfight with a monster
//     fighter records its monsterId (fleeing counts, refused
//     double-tap counts nothing); (2) _deedWrap('recordWaveKill')
//     — every real kill records its monsterId; (3) the lazy
//     fieldFight wrap — villager blow-by-blow vKill/mFlee/vFlee
//     record the monsterId (evade, vDie, alreadyDead nothing).
//   - faceFeastDraw calls startCombat(mid), so a faced draw feeds
//     through wrap (1) at fight start, before any kill. A
//     world-bump fight also starts through startCombat (game.js
//     monsterTurn), so it feeds through the SAME wrap (1) —
//     on paper there is no faced-only counter. A drive-off feeds
//     nothing (no fight, no kill, no wrap fires).
//
// OBSERVATIONAL ONLY. DEEDTEST=1 is the only on-switch. Unset
// delegates byte-identically: no wraps installed, no ctx surface,
// no record. The wraps record AFTER delegating where it matters,
// write nothing to game state (store arrays only, plus the same
// installed-flag class the other recorders use), draw no RNG,
// never throw into the engine (recording errors are counted; an
// engine throw from the wrapped function itself is recorded and
// RETHROWN unchanged), and return the original value untouched.
//
// PURE READS ONLY: the pre/post wavesFaced snapshots read
// scholar.prog.deeds.wavesFaced directly. deedState() is NEVER
// called here (it would CREATE pg.deeds); feastedActive() /
// feastDrawPending() are never called (both self-clean).
'use strict';

const MAX_EVENTS = 20000;

function layerOn() { try { return process.env.DEEDTEST === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function newStore() {
  return {
    events: [], kills: [],
    errs: 0, errors: [], overflow: { events: 0, kills: 0 },
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
  if (store[list].length >= MAX_EVENTS) { store.overflow[list]++; return false; }
  store[list].push(item);
  return true;
}

function snapFaced(Game) {
  try {
    const ds = (((Game.state || {}).scholar || {}).prog || {}).deeds || null;
    const wf = (ds && typeof ds.wavesFaced === 'object') ? ds.wavesFaced : null;
    if (!wf) return {};
    const out = {};
    for (const k of Object.keys(wf)) out[k] = wf[k] | 0;
    return out;
  } catch (e) { return {}; }
}

function waveOf(Game, mid) {
  try {
    const def = ((Game.data && Game.data.monsters) || []).find(d => d && d.id === mid);
    return def ? (def.wave | 0) : null;
  } catch (e) { return null; }
}

function stackInfo() {
  const names = [], lines = [];
  try {
    const st = (new Error()).stack || '';
    for (const line of st.split('\n')) {
      const t = line.trim();
      if (!t || t.indexOf('stackInfo') >= 0) continue;
      if (lines.length < 6) lines.push(t.slice(0, 180));
      const m = t.match(/at\s+(?:Object\.)?([A-Za-z_$][\w$]*)/);
      if (m) {
        const fn = m[1];
        if (fn === 'Error') continue;
        if (names.indexOf(fn) < 0) names.push(fn);
      }
      if (names.length >= 12) break;
    }
  } catch (e) { /* stack capture must never throw */ }
  return { names: names.join(','), lines: lines };
}

function installDeedtestDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._deedtestDiagStore === store && Game._deedtestDiagInstalled) return Game._deedtestDiagUninstall || function () {};
  const uninstalls = [];
  function wrap(name, fn) {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  }

  // recordDeedFight: the deed event itself. Pre/post snapshots
  // bracket exactly the movement this call made (or did not —
  // a second fight with the same monster records wasPresent
  // true, added false: dedupe, visible, not hidden).
  wrap('recordDeedFight', (orig) => function (monsterId) {
    let pre = null;
    try { pre = snapFaced(Game); } catch (e) { noteErr(store, 'deed.pre', e); }
    let result, threw = null;
    try { result = orig.apply(this, arguments); }
    catch (e) { threw = e; }
    try {
      const post = snapFaced(Game);
      const mid = (monsterId === undefined || monsterId === null) ? null : String(monsterId);
      const wasPresent = !!(mid && pre && Object.prototype.hasOwnProperty.call(pre, mid));
      const isPresent = !!(mid && post && Object.prototype.hasOwnProperty.call(post, mid));
      const si = stackInfo();
      pushCapped(store, 'events', {
        day: dayOf(Game), monsterId: mid, wave: mid ? waveOf(Game, mid) : null,
        wasPresent: wasPresent, added: (!wasPresent && isPresent),
        stack: si.names, stackLines: si.lines,
        threw: threw ? String((threw && threw.message) || threw).slice(0, 160) : null,
      });
    } catch (e) { noteErr(store, 'deed.rec', e); }
    if (threw) throw threw;
    return result;
  });

  // recordWaveKill: the kill census, joined to deed movement.
  // The progression recordWaveKill wrap fires INSIDE orig, so
  // a deed event for this kill (if the monster is new to the
  // deed counter) lands in store.events before this row's post
  // snapshot is read — addedDuringKill is therefore exact.
  wrap('recordWaveKill', (orig) => function (monsterId, killerVid, via) {
    let pre = null;
    try { pre = snapFaced(Game); } catch (e) { noteErr(store, 'kill.pre', e); }
    let result, threw = null;
    try { result = orig.apply(this, arguments); }
    catch (e) { threw = e; }
    try {
      const post = snapFaced(Game);
      const mid = (monsterId === undefined || monsterId === null) ? null : String(monsterId);
      const wasPresent = !!(mid && pre && Object.prototype.hasOwnProperty.call(pre, mid));
      const isPresent = !!(mid && post && Object.prototype.hasOwnProperty.call(post, mid));
      const si = stackInfo();
      pushCapped(store, 'kills', {
        day: dayOf(Game), monsterId: mid, wave: mid ? waveOf(Game, mid) : null,
        by: (killerVid === undefined || killerVid === null) ? null : String(killerVid),
        via: (via === undefined || via === null) ? null : String(via),
        wasPresent: wasPresent, addedDuringKill: (!wasPresent && isPresent),
        stack: si.names, stackLines: si.lines,
        threw: threw ? String((threw && threw.message) || threw).slice(0, 160) : null,
      });
    } catch (e) { noteErr(store, 'kill.rec', e); }
    if (threw) throw threw;
    return result;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._deedtestDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._deedtestDiagStore = store;
    Game._deedtestDiagInstalled = true;
    Game._deedtestDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withDeedtestDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installDeedtestDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._deedtest = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

// analyzeDeed(deedStore, nwkStore, waveKillLog): pure over one
// seed's stores. Returns the deed attribution census:
//   - firstAddedByMid: monsterId -> first added=true deed event
//   - tbKillDeeds: each nonworldkill TB kill joined to its deed
//     movement (added-at-this-fight / already-before /
//     added-later / never, with the first-added event)
//   - fieldKills: waveKillLog entries with no matching TB kill
//     (field/contest kills), joined the same way
//   - feastDrawKillDeeds: subset of tbKillDeeds + fieldKills
//     whose monster matches a spawned draw — classified in the
//     sweep from the feastdraw analyzer, not guessed here.
// A TB kill is joined to its fight's start by fightId; a kill
// whose fightId matches no start is direct-build/other.
function analyzeDeed(deedStore, nwkStore, waveKillLog) {
  const events = (deedStore && deedStore.events) || [];
  const kills = (deedStore && deedStore.kills) || [];
  const firstAdded = {};
  for (const ev of events) {
    if (ev && ev.added && ev.monsterId && !firstAdded[ev.monsterId]) firstAdded[ev.monsterId] = ev;
  }
  function deedFor(mid, startDay) {
    const fa = (mid && firstAdded[mid]) || null;
    if (!fa) return { status: 'never', firstAdded: null };
    if (startDay == null) return { status: 'added-unknown-day', firstAdded: fa };
    if (fa.day < startDay) return { status: 'already-before', firstAdded: fa };
    if (fa.day === startDay) return { status: 'added-at-this-fight', firstAdded: fa };
    return { status: 'added-later', firstAdded: fa };
  }
  let tbKills = [];
  try {
    if (nwkStore) {
      const mod = require('./nonworldkill-diag');
      const an = mod.analyzeNonworldkill(nwkStore);
      tbKills = an.tbKills || [];
    }
  } catch (e) { tbKills = []; }
  const tbKillDeeds = tbKills.map(k => {
    const mid = (k.kill && k.kill.mid) || k.startMid || null;
    const d = deedFor(mid, k.startDay);
    return { day: k.day, startDay: k.startDay, door: k.door, sub: k.sub || null,
      origin: k.origin || null, fightId: k.fightId || null, kill: k.kill || null,
      mid: mid, deedStatus: d.status, deedFirstDay: d.firstAdded ? d.firstAdded.day : null,
      deedFirstStack: d.firstAdded ? d.firstAdded.stack : null };
  });
  // Field kills: waveKillLog entries not explained by a TB kill
  // on the same (mid, day, by) — TB kills log (d, mid, by, via)
  // with d = end day, which may differ from start day, so the
  // join key is (mid, day, by), not fightId.
  const tbKeys = new Set(tbKillDeeds.map(t => (t.kill ? (t.kill.mid + '|' + t.kill.d + '|' + (t.kill.by || '')) : null)).filter(Boolean));
  const fieldKills = [];
  for (const e of (waveKillLog || [])) {
    if (!e || !e.mid) continue;
    const key = e.mid + '|' + (e.d | 0) + '|' + (e.by || '');
    if (tbKeys.has(key)) continue;
    const d = deedFor(e.mid, e.d | 0);
    fieldKills.push({ day: e.d | 0, mid: e.mid, by: e.by || null, via: e.via || null,
      wave: e.w | 0, deedStatus: d.status, deedFirstDay: d.firstAdded ? d.firstAdded.day : null,
      deedFirstStack: d.firstAdded ? d.firstAdded.stack : null });
  }
  return { events: events.length, kills: kills.length, firstAdded: firstAdded,
    tbKillDeeds: tbKillDeeds, fieldKills: fieldKills,
    addedCount: events.filter(e => e.added).length,
    distinctAdded: Object.keys(firstAdded).length };
}

module.exports = { layerOn, newStore, installDeedtestDiag, withDeedtestDiag, analyzeDeed, snapFaced, MAX_EVENTS };
