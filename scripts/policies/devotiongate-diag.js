// devotiongate-diag — devotion-gate decision recorder for the
// scale-onramp axis (sim-devotiongate-a, 2026-10-26, flesh-out
// loop, DIAG ONLY: zero src/js changes, policy-side only).
//
// QUESTION: grantFeastBuff checks the fusion-reactor ceiling
// BEFORE the devotion gate (src/js/feastBuff.js). A refusal's
// why-text alone proves gate state — a reactor refusal proves
// the reactor was online; a devotion refusal proves BOTH the
// reactor was offline (else the first check would have fired)
// AND neither arming lane was armed. A grant proves both gates
// passed. This recorder captures the pure pre-grant state that
// lets each grant row be classified as a gate decision, so
// the classification does not rest on the why-text alone.
//
// MECHANISM, READ FROM CODE (never invented):
//   - grantFeastBuff order: reactor online => refusal;
//     devotion unarmed (neither prog.feastSurge nor the
//     feast-carried feast.surge) => refusal; existing live
//     buff => REFRESH; otherwise FRESH.
//   - hostFeast carries prog.feastSurge into feast.surge, or
//     a harvest_table surge (1.3, 1.5 at L2) when higher.
//   - The recorder wraps grantFeastBuff OUTSIDE the
//     feastdraw-diag wrap (installed after it, so its
//     pre-reads run first) and records pure pre-reads only.
//
// OBSERVATIONAL ONLY. DEVOTIONGATEDIAG=1 is the only
// on-switch. The wraps record AFTER delegating where it
// matters, write nothing to game state (store arrays only,
// plus the same installed-flag class the other recorders
// use), draw no RNG, never throw into the engine
// (recording errors are counted; an engine throw from the
// wrapped function itself is recorded and RETHROWN
// unchanged), and return the original value untouched.
//
// PURE READS ONLY: the recorder NEVER calls feastedActive()
// or feastDrawPending() — both can clear state. Every
// pre/post snapshot reads s.feastBuff / s.feastDraw /
// s.prog directly. fusionReactorOnline() and hasAbility()
// are pure reads (they compute from state, they clear
// nothing) and are exactly the checks the grant itself
// runs, so recording them cannot change the outcome.
'use strict';

const MAX_EVENTS = 20000;

function layerOn() { try { return process.env.DEVOTIONGATEDIAG === '1'; } catch (e) { return false; } }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function newStore() {
  return {
    gates: [],
    errs: 0, errors: [], overflow: { gates: 0 },
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

function snapBuff(Game) {
  try {
    const b = ((Game.state || {}).scholar || {}).feastBuff || null;
    if (!b || typeof b !== 'object') return null;
    return { quality: b.quality != null ? b.quality : null, mult: b.mult != null ? b.mult : null, untilDay: b.untilDay || 0, used: !!b.used };
  } catch (e) { return null; }
}

// snapGate: pure pre-grant gate state. progState() is NOT called
// (it creates s.prog when missing); s.prog is read directly.
function snapGate(Game, feast) {
  const out = { progFeastSurge: null, sentimentTaught: false, reactorOnline: false, harvestTable: false, carriedSurge: null, preBuff: null };
  try {
    const s = (Game.state || {}).scholar || {};
    const pg = s.prog || {};
    out.progFeastSurge = (pg.feastSurge != null ? pg.feastSurge : null);
    out.sentimentTaught = !!pg.sentimentTaught;
    out.preBuff = snapBuff(Game);
  } catch (e) { out.preErr = String((e && e.message) || e).slice(0, 80); }
  try { out.reactorOnline = !!(Game.fusionReactorOnline && Game.fusionReactorOnline()); } catch (e) { out.reactorOnline = false; }
  try { out.harvestTable = !!(Game.hasAbility && Game.hasAbility('harvest_table')); } catch (e) { out.harvestTable = false; }
  try { out.carriedSurge = (feast && feast.surge != null ? feast.surge : null); } catch (e) { out.carriedSurge = null; }
  return out;
}

function installDevotiongateDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._devotiongateDiagStore === store && Game._devotiongateDiagInstalled) return Game._devotiongateDiagUninstall || function () {};
  const uninstalls = [];
  function wrap(name, fn) {
    try {
      if (typeof Game[name] !== 'function') { noteErr(store, name + '.missing', new Error('no ' + name)); return; }
      const orig = Game[name];
      Game[name] = fn(orig);
      uninstalls.push(() => { try { Game[name] = orig; } catch (e) {} });
    } catch (e) { noteErr(store, name + '.wrap', e); }
  }

  wrap('grantFeastBuff', (orig) => function (feast) {
    let pre = null, gateIdx = null;
    try {
      pre = snapGate(Game, feast);
      gateIdx = store.gates.length;
    } catch (e) { noteErr(store, 'grant.pre', e); }
    let result, threw = null;
    try { result = orig.apply(this, arguments); }
    catch (e) { threw = e; }
    try {
      const r = (result && typeof result === 'object') ? result : {};
      pushCapped(store, 'gates', {
        day: dayOf(Game), idx: gateIdx,
        granted: !!r.granted, refreshed: !!r.refreshed,
        mult: (r.mult != null ? r.mult : null), quality: (r.quality != null ? r.quality : null),
        why: (r.why != null ? String(r.why).slice(0, 160) : null),
        pre: pre,
        threw: threw ? String((threw && threw.message) || threw).slice(0, 160) : null,
      });
    } catch (e) { noteErr(store, 'grant.rec', e); }
    if (threw) throw threw;
    return result;
  });

  const uninstall = () => {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._devotiongateDiagInstalled = false; } catch (e) {}
  };
  try {
    Game._devotiongateDiagStore = store;
    Game._devotiongateDiagInstalled = true;
    Game._devotiongateDiagUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withDevotiongateDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installDevotiongateDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { ctx._devotiongate = st; } catch (e) { noteErr(st, 'daily.ctx', e); }
      }
      return r;
    },
  });
}

// refusalReason: same classifier as the feastrefresh sweep
// (reactor / devotion / other on why-text).
function refusalReason(whyText) {
  const t = String(whyText || '');
  if (/reactor/i.test(t)) return 'reactor';
  if (/devotion|keepsake/i.test(t)) return 'devotion';
  return 'other';
}

// classifyGate(gateRow): the gate decision for one grant.
// Returns { decision, contradiction } where decision is one
// of reactor-refusal | devotion-refusal | gate-pass-fresh |
// gate-pass-refresh | other-refusal, and contradiction is
// null or a string describing a pre-read/outcome mismatch
// that falsifies the header's code-order claim.
function classifyGate(g) {
  const pre = g.pre || {};
  const armedProg = !!pre.progFeastSurge;
  const carried = !!pre.carriedSurge;
  const reactor = !!pre.reactorOnline;
  if (!g.granted) {
    const reason = refusalReason(g.why);
    if (reason === 'reactor') {
      return { decision: 'reactor-refusal', contradiction: reactor ? null : 'reactor refusal with pre reactorOnline false' };
    }
    if (reason === 'devotion') {
      if (reactor) return { decision: 'devotion-refusal', contradiction: 'devotion refusal with pre reactorOnline true (reactor check runs first)' };
      if (armedProg || carried) return { decision: 'devotion-refusal', contradiction: 'devotion refusal with an arming lane armed' };
      return { decision: 'devotion-refusal', contradiction: null };
    }
    return { decision: 'other-refusal', contradiction: null };
  }
  // Granted: both gates must have passed.
  if (reactor) return { decision: g.refreshed ? 'gate-pass-refresh' : 'gate-pass-fresh', contradiction: 'grant with pre reactorOnline true (reactor check runs first)' };
  if (!armedProg && !carried) return { decision: g.refreshed ? 'gate-pass-refresh' : 'gate-pass-fresh', contradiction: 'grant with neither arming lane armed' };
  return { decision: g.refreshed ? 'gate-pass-refresh' : 'gate-pass-fresh', contradiction: null };
}

// analyzeDevotiongate(gateStore, feastStore): pure over one
// seed's gate rows + feastdraw grant rows. Joins on index:
// both recorders wrap the same grantFeastBuff call, so the
// gate row at index i is the feastdraw grant row at index i.
// Join completeness is CHECKED, not assumed.
function analyzeDevotiongate(gateStore, feastStore) {
  const gs = gateStore || {};
  const fs = feastStore || {};
  const gates = gs.gates || [];
  const grants = fs.grants || [];
  const decisions = [];
  let contradictions = [];
  let joinMismatch = 0;
  for (let i = 0; i < gates.length; i++) {
    const g = gates[i];
    const grant = grants[i];
    if (!grant || grant.day !== g.day || !!grant.granted !== !!g.granted || !!grant.refreshed !== !!g.refreshed) joinMismatch++;
    const c = classifyGate(g);
    decisions.push(Object.assign({ idx: i }, c, { gate: g }));
    if (c.contradiction) contradictions.push({ idx: i, day: g.day, decision: c.decision, contradiction: c.contradiction });
  }
  if (grants.length !== gates.length) joinMismatch++;
  const counts = {};
  for (const d of decisions) counts[d.decision] = (counts[d.decision] || 0) + 1;
  const devotionRefusals = decisions.filter(d => d.decision === 'devotion-refusal');
  const gatePasses = decisions.filter(d => d.decision === 'gate-pass-fresh' || d.decision === 'gate-pass-refresh');
  const gatePassesReactorFree = gatePasses.filter(d => !(d.gate.pre && d.gate.pre.reactorOnline));
  return {
    gates: gates.length, grants: grants.length, joinMismatch: joinMismatch,
    decisions: decisions, counts: counts,
    contradictions: contradictions, contradictionCount: contradictions.length,
    devotionRefusals: devotionRefusals, devotionRefusalCount: devotionRefusals.length,
    gatePassCount: gatePasses.length,
    gatePassReactorFreeCount: gatePassesReactorFree.length,
    otherRefusals: decisions.filter(d => d.decision === 'other-refusal'),
  };
}

module.exports = {
  layerOn, newStore, installDevotiongateDiag, withDevotiongateDiag,
  analyzeDevotiongate, classifyGate, refusalReason, snapGate, MAX_EVENTS,
};
