// departhold-diag — departure-hold recorder (sim-departhold-a,
// 2026-10-29, flesh-out loop, axis scale-onramp, DIAG ONLY: zero
// src/js changes, policy-side recorder only).
//
// QUESTION (from sim-pickdepart-a): a wave-4 HUNT pick (nikos,
// seed 75104, d173 part 690) vanished between its pick and the
// next dawn pick, INFERRED as a danger non-'go' overwrite —
// objMaybeDepart -> objDanger -> objTightenOrDefer, which for
// HUNT overwrites to an indoor HAVEN_CHORE with no pick record,
// no departure record, no narration. No recorder in the lottery
// corpora captures the danger verdict, so the inference rests
// on elimination. This recorder supplies the missing channel:
// for every HUNT departure evaluation, the pick-side objective,
// every objMaybeDepart verdict (danger score + verdict, heal
// verdict, tighten/defer action), and the terminal action
// (departed / overwritten / held-ready / repicked / skipped).
//
// OBSERVATIONAL ONLY. DEPARTHOLD=1 is the only on-switch. Unset
// the sweep never installs it: no wraps, no ctx surface, no
// record. Wraps record AFTER delegating where the record needs
// the result, and return the original value untouched. Pre/post
// objective reads are DIRECT state reads of
// state.village.objectives[vid] — NEVER objOf(), which CREATES
// entries, and never npcNode(), which CREATES entries. No wrap
// draws RNG, writes game state, or throws into the engine
// (recording errors are counted; an engine throw is rethrown
// unchanged). No danger verdict is ever recomputed: the recorded
// verdict IS the engine's own verdict, captured by wrapping
// objDanger. The only Game writes are the off-state install
// flags (_departholdDiagStore / _departholdDiagInstalled), the
// same class as the funnel-diag precedent.
//
// ATTRIBUTION, READ CAREFULLY: objDanger has a second caller,
// the gossip-retarget row in src/js/npc-triggers.js, which
// re-runs danger for 'out' objectives only. A danger record is
// attributed to a departure evaluation ONLY when the
// objMaybeDepart marker is active (leader + companion sub-calls
// alike — the evaluation is synchronous, so any sub-call during
// it belongs to it); otherwise it lands in dangerOutside (counted, reported
// separately, never fed into a classification). Likewise heal /
// tighten / depart sub-calls outside an evaluation land in
// their outside lists (expected empty — every engine caller of
// those functions runs inside objMaybeDepart).
//
// EVALUATION UNIVERSE: an objMaybeDepart call is stored iff
// the pre-objective is a 'ready' HUNT, OR the post-objective
// is a HUNT picked fresh inside the call (the maybeDepart
// re-pick branch: idle/done -> objPick -> depart-or-overwrite
// in the same call — that pick IS a funnel pick, so it must
// have an evaluation record too). Sub-call records for
// non-HUNT evaluations are collected in a pending buffer and
// discarded, never persisted.
//
// PART SCALE: this recorder's own advancePart counter, the
// same scale as the funnel/returns recorders (all increment
// once per advancePart call, so counters agree at every
// event). Joins to funnel picks and returns departures use
// this part scale on both sides.
'use strict';

const MAX_EVENTS = 200000;
const MAX_OUTSIDE = 60000;

function layerOn() { try { return process.env.DEPARTHOLD === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function dayPartOf(Game) { try { return (Game.dayPart != null) ? (Game.dayPart | 0) : null; } catch (e) { return null; } }

function newStore() {
  return {
    evaluations: [], dangerOutside: [], departOutside: [], healOutside: [], tightenOutside: [],
    partCounter: 0, errs: 0, errors: [], overflow: {}, installed: false,
    pending: null,
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

function pushOutside(store, list, item) {
  if (store[list].length >= MAX_OUTSIDE) { store.overflow[list] = (store.overflow[list] || 0) + 1; return false; }
  store[list].push(item);
  return true;
}

function compactObjective(o) {
  if (!o || typeof o !== 'object') return null;
  return {
    kind: o.kind || null, purpose: o.purpose || null, state: o.state || null,
    tx: (o.tx != null) ? o.tx : null, ty: (o.ty != null) ? o.ty : null,
    huntMid: o.huntMid || null, huntTx: (o.huntTx != null) ? o.huntTx : null,
    huntTy: (o.huntTy != null) ? o.huntTy : null, huntDay: (o.huntDay != null) ? o.huntDay : null,
    indoor: !!o.indoor, targetVid: o.targetVid || null, tightened: !!o.tightened,
  };
}

function directObjective(Game, vid) {
  try {
    const village = (Game.state && Game.state.village) || {};
    const objectives = village.objectives || {};
    return objectives[vid] || null;
  } catch (e) { return null; }
}

function sameObjective(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a.kind === b.kind && a.state === b.state && a.tx === b.tx && a.ty === b.ty
    && a.huntMid === b.huntMid && a.indoor === b.indoor;
}

// Pure derivation of an evaluation's action from pre/post state +
// sub-call records. Exported so fixtures can prove every action
// reachable without a sim. `reason` is the no-attempt reason
// computed by the wrapper from direct state reads (sick / away /
// heal-sat-out-earlier-today / agency-owned / engaged), or null.
function deriveMaybeAction(pre, post, subs, atHaven, reason) {
  const danger = (subs && subs.danger) || [];
  const heal = (subs && subs.heal) || [];
  const tighten = (subs && subs.tighten) || [];
  if (!atHaven) {
    return sameObjective(pre, post)
      ? { action: 'skipped-not-at-haven', sub: null, reason: reason || null }
      : { action: 'other', sub: null, reason: 'changed-while-away' };
  }
  if (post && post.state === 'out') return { action: 'departed', sub: null, reason: null };
  if (post && post.kind === 'HAVEN_CHORE' && post.indoor && post.state === 'indoor') {
    return {
      action: 'overwritten',
      sub: tighten.length > 0 ? 'tighten-overwrite' : 'defer-overwrite',
      reason: null,
    };
  }
  if (post && post.kind === 'HUNT' && post.state === 'ready'
    && pre && pre.kind === 'HUNT' && pre.state === 'ready'
    && post.huntMid === pre.huntMid) {
    const satOut = heal.some(h => h.satOut);
    if (satOut) return { action: 'held-ready', sub: 'heal-sat-out', reason: null };
    if (danger.length === 0) {
      return { action: 'held-ready', sub: 'no-attempt-early-return', reason: reason || 'early-return-unnamed' };
    }
    return { action: 'held-ready', sub: 'other-held', reason: null };
  }
  if (post && post.kind === 'HUNT' && post.state === 'ready'
    && !(pre && pre.kind === 'HUNT')) {
    // Fresh pick inside the call that neither departed nor overwrote:
    // same hold logic, without the same-mid requirement.
    const satOut = heal.some(h => h.satOut);
    if (satOut) return { action: 'held-ready', sub: 'heal-sat-out', reason: null };
    if (danger.length === 0) {
      return { action: 'held-ready', sub: 'no-attempt-early-return', reason: reason || 'early-return-unnamed' };
    }
    return { action: 'held-ready', sub: 'other-held', reason: null };
  }
  if (post && pre && post.kind !== pre.kind) return { action: 'repicked', sub: null, reason: null };
  return { action: 'other', sub: null, reason: null };
}

function installDepartholdDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._departholdDiagStore === store && Game._departholdDiagInstalled) return Game._departholdDiagUninstall || function () {};
  const uninstalls = [];
  const wrap = (name, fn) => {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  };

  wrap('advancePart', (orig) => function () {
    const r = orig.apply(this, arguments);
    try { store.partCounter++; } catch (e) { noteErr(store, 'advancePart.counter', e); }
    return r;
  });

  wrap('objDanger', (orig) => function (vid, tx, ty, hx, hy) {
    let r = null;
    try { r = orig.apply(this, arguments); }
    catch (e) { throw e; }
    try {
      const rec = {
        vid: vid != null ? String(vid) : null,
        tx: (tx != null) ? tx : null, ty: (ty != null) ? ty : null,
        score: (r && r.score != null) ? r.score : null,
        verdict: (r && r.verdict) || null,
      };
      const pending = store.pending;
      if (pending) pending.danger.push(rec);
      else pushOutside(store, 'dangerOutside', Object.assign({
        day: dayOf(Game), part: store.partCounter, dayPart: dayPartOf(Game),
      }, rec));
    } catch (e) { noteErr(store, 'objDanger.rec', e); }
    return r;
  });

  wrap('objHealGate', (orig) => function (vid, obj, hx, hy, playerAtHaven) {
    let preGate = null;
    try {
      const v = (Game.state && Game.state.village) || {};
      const g = (v.hurtGate || {})[vid];
      preGate = g ? { day: g.day, satOut: !!g.satOut } : null;
    } catch (e) { preGate = null; }
    let r = null;
    try { r = orig.apply(this, arguments); }
    catch (e) { throw e; }
    try {
      const today = dayOf(Game);
      const cached = !!(preGate && preGate.day === today);
      const rec = {
        vid: vid != null ? String(vid) : null,
        ret: (r === true), satOut: (r !== true), cached: cached,
        preDay: preGate ? preGate.day : null, preSatOut: preGate ? preGate.satOut : null,
      };
      const pending = store.pending;
      if (pending) pending.heal.push(rec);
      else pushOutside(store, 'healOutside', Object.assign({
        day: today, part: store.partCounter, dayPart: dayPartOf(Game),
      }, rec));
    } catch (e) { noteErr(store, 'objHealGate.rec', e); }
    return r;
  });

  wrap('objTightenOrDefer', (orig) => function (rid, o, hx, hy, playerAtHaven) {
    const pre = compactObjective(o);
    let r = null;
    try { r = orig.apply(this, arguments); }
    catch (e) { throw e; }
    try {
      const rec = {
        vid: rid != null ? String(rid) : null,
        preKind: pre ? pre.kind : null, postKind: o ? o.kind : null,
        postState: o ? o.state : null, postIndoor: o ? !!o.indoor : null,
        tightened: o ? !!o.tightened : null,
      };
      const pending = store.pending;
      if (pending) pending.tighten.push(rec);
      else pushOutside(store, 'tightenOutside', Object.assign({
        day: dayOf(Game), part: store.partCounter, dayPart: dayPartOf(Game),
      }, rec));
    } catch (e) { noteErr(store, 'objTightenOrDefer.rec', e); }
    return r;
  });

  wrap('objDepart', (orig) => function (vid, obj, hx, hy, playerAtHaven) {
    const pre = compactObjective(obj);
    let r = null;
    try { r = orig.apply(this, arguments); }
    catch (e) { throw e; }
    try {
      const rec = {
        vid: vid != null ? String(vid) : null,
        preKind: pre ? pre.kind : null, postKind: obj ? obj.kind : null,
        postState: obj ? obj.state : null, ret: (r === true ? true : (r === false ? false : null)),
      };
      const pending = store.pending;
      if (pending) pending.depart.push(rec);
      else pushOutside(store, 'departOutside', Object.assign({
        day: dayOf(Game), part: store.partCounter, dayPart: dayPartOf(Game),
      }, rec));
    } catch (e) { noteErr(store, 'objDepart.rec', e); }
    return r;
  });

  wrap('objMaybeDepart', (orig) => function (rid, node, atHaven, hx, hy) {
    const vid = rid != null ? String(rid) : null;
    let pre = null;
    try { pre = compactObjective(directObjective(Game, vid)); } catch (e) { noteErr(store, 'objMaybeDepart.pre', e); }
    const pending = { vid: vid, danger: [], heal: [], tighten: [], depart: [] };
    const prevPending = store.pending;
    store.pending = pending;
    let r = null;
    try { r = orig.apply(this, arguments); }
    catch (e) { store.pending = prevPending; throw e; }
    store.pending = prevPending;
    try {
      let post = null;
      try { post = compactObjective(directObjective(Game, vid)); } catch (e) { noteErr(store, 'objMaybeDepart.post', e); }
      const preIsReadyHunt = !!(pre && pre.kind === 'HUNT' && pre.state === 'ready');
      const freshHunt = !!(!preIsReadyHunt && post && post.kind === 'HUNT' && !(pre && pre.kind === 'HUNT'));
      if (!preIsReadyHunt && !freshHunt) return r;
      // No-attempt reason (direct state reads only, guarded):
      // used only when no danger record exists in the call.
      let reason = null;
      try {
        if (pending.danger.length === 0) {
          const v = (Game.state && Game.state.village) || {};
          const today = dayOf(Game);
          const hg = (v.hurtGate || {})[vid];
          if (hg && hg.day === today && hg.satOut) reason = 'heal-sat-out-earlier-today';
          else if ((v.sick || {})[vid]) reason = 'sick';
          else if ((v.away || {})[vid]) reason = 'away';
          else {
            try {
              const ast = (typeof Game.agencyState === 'function') ? Game.agencyState() : null;
              if (ast && ast.exped && ast.exped[vid]) reason = 'agency-owned';
            } catch (e) { /* reason stays null */ }
            if (!reason) {
              try { if (typeof Game.isEngaged === 'function' && Game.isEngaged(vid)) reason = 'engaged'; } catch (e) { /* ignore */ }
            }
          }
          if (!reason) reason = 'early-return-unnamed';
        }
      } catch (e) { reason = 'early-return-unnamed'; }
      const derived = deriveMaybeAction(pre, post, pending, !!atHaven, reason);
      pushCapped(store, 'evaluations', {
        day: dayOf(Game), part: store.partCounter, dayPart: dayPartOf(Game),
        vid: vid, atHaven: !!atHaven, hx: (hx != null) ? hx : null, hy: (hy != null) ? hy : null,
        freshPickInCall: freshHunt,
        pre: pre, post: post,
        danger: pending.danger, heal: pending.heal, tighten: pending.tighten, depart: pending.depart,
        action: derived.action, sub: derived.sub, reason: derived.reason,
      });
    } catch (e) { noteErr(store, 'objMaybeDepart.rec', e); }
    return r;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._departholdDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._departholdDiagStore = store;
    Game._departholdDiagInstalled = true;
    Game._departholdDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withDepartholdDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installDepartholdDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._departhold = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

module.exports = {
  layerOn, newStore, installDepartholdDiag, withDepartholdDiag,
  MAX_EVENTS, compactObjective, deriveMaybeAction, directObjective,
};
