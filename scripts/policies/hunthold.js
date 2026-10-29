// hunthold — HUNT-holds-through-danger lever candidate
// (sim-hunthold-a, build-gaps arm build-pickdepart, axis scale-onramp).
//
// QUESTION (from sim-pickdepart-a, answered by sim-departhold-a
// DIAG-GO): a picked HUNT vanishes when its departure danger
// verdict is non-'go' — objMaybeDepart -> objDanger ->
// objTightenOrDefer / inline defer overwrites it to an indoor
// HAVEN_CHORE with no pick record, no departure record, no
// narration. The recorder proved the path real (2 tighten
// overwrites on wave-1 murkcap hunts, full verdict chains) and
// wave-blind (the overwrite code never reads wave). This lever
// holds a picked HUNT through MODERATE danger instead of
// overwriting it.
//
// POLICY-SIDE ONLY. ZERO src/js. Default OFF: HUNTHOLD=1 is
// the only on-switch. Unset, the daily delegates with no wraps
// installed, and the engine runs byte-identically (proven by
// the fixtures' env-gate proof, not asserted).
//
// EXACT RULES (see sim-hunthold-a-prereg.md — binding):
//  - Scope: pre-ready HUNT objectives in objMaybeDepart only
//    (pre.kind == 'HUNT', pre.state == 'ready'), any wave.
//    Fresh-pick-in-call HUNTs are NOT held (documented scope
//    limit: restoring one would require guessing its clock).
//  - Held verdicts: 'ask' (score 2-3) and 'tighten' (score 4-5).
//    On a held verdict with budget left, the lever returns
//    WITHOUT calling the engine: the objective stays 'ready',
//    no RNG is drawn, nothing departs, nothing overwrites.
//    A held villager NEVER departs on a non-'go' verdict.
//  - Never held: 'go' (engine departs) and 'defer' (score 6+,
//    engine overwrites to indoor work). An unknown verdict is
//    never held: the lever delegates.
//  - Engine early returns untouched (sick, away, engaged,
//    agency-owned, heal-sat-out-earlier-today, not at haven):
//    the lever delegates and consumes NO hold budget.
//  - Budget: MAX_HOLD = 6 held evaluations per picked
//    objective (o.dangerHold, cleared by every fresh objPick).
//    On the 7th ask/tighten evaluation the lever delegates
//    and the engine overwrites exactly as before.
//  - Narration (canon: no silent actions): on the FIRST hold
//    for an objective, and only when the player is at haven,
//    the villager says one waiting line naming the beast by
//    village descriptor. Later holds are silent.
//  - Nothing else moves: no pick weights, no offer window
//    (age 0-3), no heal gate, no companion ask (a HUNT never
//    drags a companion — perception law), no gate retune.
//
// RECORDING NOTE: the departhold recorder wraps OUTSIDE this
// lever (the sweep installs hunthold first, then the
// recorders), so a held evaluation records as the recorder's
// 'held-ready' action with sub 'other-held' (post still
// 'ready', danger present, no heal sat-out), and the analyzer
// maps held-ready/other-held + ask/tighten danger to
// held-by-lever. Delegated evaluations
// in the ON corpus may carry a duplicated danger record (the
// lever's pre-check plus the engine's identical re-check —
// objDanger is pure: it reads gossip/weather/distance/
// temperament/goal and writes nothing, so the two records
// agree exactly); the analyzer dedupes exact duplicates.
// The lever's own store counts holds/narrations/errors only
// (off-state, never game state).
//
// PERCEPTION LAW: the lever reads only the villager's own
// objective and the engine's own danger verdict for that
// villager's own hunt tile. No roster, snapshot, or list is
// consulted; no companion is asked; no live-monster lookup
// exists.
'use strict';

const MAX_HOLD = 6;

function layerOn() { try { return process.env.HUNTHOLD === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function newStore() {
  return { holds: 0, exhausted: 0, narrated: 0, errs: 0, errors: [], installed: false };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* error counting must never throw */ }
}

function directObjective(Game, vid) {
  try {
    const village = (Game.state && Game.state.village) || {};
    const objectives = village.objectives || {};
    return objectives[vid] || null;
  } catch (e) { return null; }
}

// Engine early-return conditions, mirrored from objMaybeDepart
// (and the departhold recorder's reason logic). If any holds,
// the lever delegates and consumes no budget. Returns the
// reason string, or null when the engine would proceed to the
// danger verdict.
function earlyReturnReason(Game, vid, atHaven) {
  try { if (!atHaven) return 'not-at-haven'; } catch (e) { return 'not-at-haven'; }
  try {
    const v = (Game.state && Game.state.village) || {};
    const today = dayOf(Game);
    const hg = (v.hurtGate || {})[vid];
    if (hg && hg.day === today && hg.satOut) return 'heal-sat-out-earlier-today';
    if ((v.sick || {})[vid]) return 'sick';
    if ((v.away || {})[vid]) return 'away';
    try {
      const ast = (typeof Game.agencyState === 'function') ? Game.agencyState() : null;
      if (ast && ast.exped && ast.exped[vid]) return 'agency-owned';
    } catch (e) { /* fall through */ }
    try { if (typeof Game.isEngaged === 'function' && Game.isEngaged(vid)) return 'engaged'; } catch (e) { /* ignore */ }
  } catch (e) { return 'early-return-unnamed'; }
  return null;
}

function installHunthold(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._huntholdStore === store && Game._huntholdInstalled) return Game._huntholdUninstall || function () {};
  const uninstalls = [];
  const wrap = (name, fn) => {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  };

  // Fresh pick: a new decision never inherits an old wait.
  wrap('objPick', (orig) => function (vid, hx, hy) {
    let r = null;
    try { r = orig.apply(this, arguments); }
    catch (e) { throw e; }
    try {
      const o = directObjective(Game, vid != null ? String(vid) : null);
      if (o) delete o.dangerHold;
    } catch (e) { noteErr(store, 'objPick.clear', e); }
    return r;
  });

  wrap('objMaybeDepart', (orig) => function (rid, node, atHaven, hx, hy) {
    const vid = rid != null ? String(rid) : null;
    let pre = null;
    try { pre = directObjective(Game, vid); } catch (e) { noteErr(store, 'objMaybeDepart.pre', e); }
    // Scope: pre-ready HUNT only. Everything else delegates untouched
    // (including fresh-pick-in-call HUNTs, which the engine picks
    // and danger-checks inside its own call — documented limit).
    if (!pre || pre.kind !== 'HUNT' || pre.state !== 'ready') {
      return orig.apply(this, arguments);
    }
    // Engine early returns untouched: delegate, consume no budget,
    // and never render a danger verdict the engine would not render.
    if (earlyReturnReason(Game, vid, !!atHaven)) {
      return orig.apply(this, arguments);
    }
    // The engine's own danger verdict for this villager's own hunt
    // tile. objDanger is pure (reads only, writes nothing), so
    // calling it here and letting the engine re-call it on
    // delegation renders the identical verdict twice — the
    // analyzer dedupes exact duplicates.
    let dg = null;
    try { dg = Game.objDanger(vid, pre.tx, pre.ty, hx, hy); }
    catch (e) { noteErr(store, 'objMaybeDepart.danger', e); return orig.apply(this, arguments); }
    if (!dg || dg.verdict === 'go' || dg.verdict === 'defer') {
      return orig.apply(this, arguments); // go departs, defer overwrites, as before
    }
    if (dg.verdict !== 'ask' && dg.verdict !== 'tighten') {
      return orig.apply(this, arguments); // unknown verdict: never invent a hold
    }
    const held = (pre.dangerHold | 0) || 0;
    if (held >= MAX_HOLD) {
      try { delete pre.dangerHold; } catch (e) {}
      try { store.exhausted++; } catch (e) {}
      return orig.apply(this, arguments); // budget spent: base overwrite
    }
    // HOLD: stay ready, retry next part. No engine call, no RNG,
    // no departure, no overwrite. The counter lives on the
    // objective; a fresh objPick clears it.
    try { pre.dangerHold = held + 1; } catch (e) { noteErr(store, 'hold.counter', e); }
    try { store.holds++; } catch (e) {}
    if (held === 0) {
      // First hold only, player at haven only: one waiting line.
      try {
        let playerAtHaven = false;
        try { playerAtHaven = (Game.map.px === hx && Game.map.py === hy); } catch (e) {}
        if (playerAtHaven && typeof Game.say === 'function') {
          let nm = 'Someone';
          try { nm = Game.displayName(vid).split(' ')[0]; } catch (e) {}
          let desc = 'beast';
          try { desc = Game.monsterDisplayName ? Game.monsterDisplayName(pre.huntMid) : 'beast'; } catch (e) {}
          try { if (Game.articlePhrase) desc = Game.articlePhrase(desc); } catch (e) {}
          Game.say(nm + ' waits at the door. "Not yet — ' + desc + ' will keep for a safer hour."');
          try { store.narrated++; } catch (e) {}
        }
      } catch (e) { noteErr(store, 'hold.say', e); }
    }
    return undefined; // objMaybeDepart returns undefined on every engine path
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._huntholdInstalled = false; } catch (e) {}
  };
  try {
    Game._huntholdStore = store;
    Game._huntholdInstalled = true;
    Game._huntholdUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withHunthold(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installHunthold(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._hunthold = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = {
  layerOn, newStore, installHunthold, withHunthold,
  MAX_HOLD, earlyReturnReason, directObjective,
};
