// trustdelta-lib-20261015.js — TRUST-DELTA-BY-SOURCE diagnostic instrument
// (ARM 3, loop B, 2026-10-15, sim-findings #265 FEED-SIDE TRUST GAINS).
//
// INSTRUMENT ONLY — zero src/js changes. Harness-side wraps (call-through,
// the predation-lib pattern): a Proxy on Game.state.village.trust captures
// EVERY trust write (vid, before, after, delta) no matter which code path
// wrote it — 100% tick capture by construction. Source attribution:
//   1. resolveConsequence(vid, spec) wrap → the spec.name (semantic fiction
//      key, e.g. giveFood, makeAmends, comfort) — covers the named funnel.
//   2. observe(action, opts) / applyRep wrap → observe:<action> for the
//      primary target, ripple for group-member ripples.
//   3. stack classification fallback: first src/js/*.js frame's function
//      name mapped through FN_CATEGORY; genuinely unclassifiable → 'other'.
// CANON: Trust ≠ reputation — gossip/rumor paths must produce ZERO trust
// ticks; any such tick is flagged as a canon violation, not a source.
// No trust canon doc exists (stated in evidence per the canon rule).
//
// Usage:
//   const { installTrustDelta, finalizeTrustDelta } = require('./trustdelta-lib-20261015');
//   const track = installTrustDelta(Game);   // AFTER setupGame, before runDays
//   ... runDays(Game, policy, opts) ...
//   const rep = finalizeTrustDelta(Game, track);
//
// Byte-identicality (instrument honesty) is proven by
// scripts/test-trustdelta-20261015.js PART D (armed-vs-pristine det-gate).
'use strict';

// ---------- source classification ----------
const RC_NAME_CATEGORY = [
  [/^(giveFood|donate|donations?)/i, 'donations'],
  [/^makeAmends/i, 'amends'],
  [/^(comfort|offer_help|tend|aid)/i, 'aid'],
  [/^(teach|theorize|learnTechnique|share_knowledge)/i, 'teaching'],
  [/^(mediat|makePeace|conflict)/i, 'mediate'],
  [/^(feast)/i, 'feast'],
  [/^(meal|villageMeal)/i, 'meal'],
  [/^(gossip|rumor)/i, 'gossip'],
  [/^(trade|bribe|deal)/i, 'trade'],
  [/^(rally|askSupport|appealToGoal|tellSide|agree|confrontGossip|theorize|speak_back|endConvo|dlg:|ask:|nv:|gq:|alive:|compare_maps|silence|promise)/i, 'talk'],
];
const FN_CATEGORY = [
  [/donateToPantry/i, 'donations'],
  [/giveFood|shareFood|foodDeed/i, 'donations'],
  [/makeAmends/i, 'amends'],
  [/comfort|offerHelp|tendWound|aid|heal/i, 'aid'],
  [/teach|learnTechnique|shareKnowledge|theorize/i, 'teaching'],
  [/mediat|makePeace|conflictResolve|resolveConflict/i, 'mediate'],
  [/feast/i, 'feast'],
  [/villageMeal|meal/i, 'meal'],
  [/gossip|rumor/i, 'gossip'],
  [/trade|bribe/i, 'trade'],
  [/bumpTrust/i, 'bump'],
  [/evTrustAll/i, 'event'],
  [/abilityOnAcquire/i, 'ability'],
  [/nvRespond|rally|askSupport|confrontGossip|talk|villagerInitiative|npcChatter/i, 'talk'],
  [/contest/i, 'contest'],
];
const OBSERVE_ACTION_CATEGORY = {
  give_food: 'donations', donate: 'donations',
  talk: 'talk', order: 'talk', appeal: 'talk',
  comfort: 'aid', amends: 'amends',
  share_knowledge: 'teaching', teach: 'teaching',
  trade: 'trade', deal: 'trade', bribe_fight: 'trade',
  fight: 'other', flee: 'other', hoard: 'other',
};

function catFor(pairs, name) {
  for (const [re, cat] of pairs) if (re.test(name)) return cat;
  return null;
}
function rcCategory(name) { return catFor(RC_NAME_CATEGORY, String(name || '')) || 'other'; }

function gday(Game) {
  try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; }
}

// Stack classification: game code is eval'd by sim-harness, so its frames
// look like:
//   at Object.donateToPantry [as donateToPantry] (eval at evalFile
//     (/home/hatch/.../scripts/sim-harness.js:165:11), <anonymous>:13632:15)
// The `<anonymous>:LINE:COL` suffix marks eval'd game code. Harness/lib
// frames carry real paths (scripts/*.js) without that suffix.
// Never consumes Math.random (Error.stack only).
function classifyStack() {
  const SELF = 'trustdelta-lib-20261015';
  // bumpTrust is a low-level helper — attribute via its CALLER's frame.
  const TRANSPARENT = /^(bumpTrust|setTrust)$/i;
  try {
    const stack = (new Error('x')).stack || '';
    const cands = [];
    for (const ln of stack.split('\n')) {
      if (ln.indexOf(SELF) >= 0) continue; // my own traps/wraps
      const locM = ln.match(/\((.*)\)\s*$/);
      const loc = locM ? locM[1] : '';
      const isEvalGame = /<anonymous>:\d+:\d+/.test(loc);
      const isSrcJs = /src\/js\//.test(loc);
      if (!isEvalGame && !isSrcJs) continue; // node internals, harness, test
      const fnM = ln.match(/at (?:[^\s(]*\.)?([A-Za-z_$][\w$]*) /);
      const fn = fnM ? fnM[1] : '?';
      if (fn === '?' || fn === 'set' || fn === 'get' || fn === 'eval') continue;
      cands.push({ fn, file: isEvalGame ? '<eval>' : ((loc.split('src/js/')[1] || '').split(':')[0] || null) });
    }
    // skip transparent helpers (bumpTrust/setTrust) to the semantic caller
    let i = 0;
    while (i < cands.length && TRANSPARENT.test(cands[i].fn)) i++;
    const c = cands[i] || cands[0];
    if (!c) return { fn: '?', cat: 'other', file: null };
    const via = i > 0 ? ('via:' + cands.slice(0, i).map(x => x.fn).join('+') + ' ') : '';
    const cat = catFor(FN_CATEGORY, c.fn);
    return { fn: c.fn, cat: cat || 'other', file: c.file, via: via || null };
  } catch (e) {}
  return { fn: '?', cat: 'other', file: null };
}

function installTrustDelta(Game) {
  const track = {
    ticks: [],          // {day, vid, source, detail, before, after, applied}
    sayBeats: [],       // {day, vid, source, applied, beat:[lines]} — major deltas
    sayRing: [],        // last 60 say lines
    gossipViolations: [], // any trust tick with source 'gossip'
    instrErrors: [],
    nSets: 0, nClassified: 0,
  };
  const note = (where, e) => { track.instrErrors.push(where + ': ' + (e && e.message)); };

  // ---- semantic contexts (outermost named calls) ----
  let rcCtx = null;   // {name, vid}
  let obsCtx = null;  // {action, primary}

  // ---- say ring buffer (sense-testing beats) ----
  try {
    const origSay = Game.say.bind(Game);
    Game.say = function (msg) {
      try {
        track.sayRing.push({ day: gday(this), text: String(msg || '').slice(0, 300) });
        if (track.sayRing.length > 60) track.sayRing.shift();
      } catch (e) {}
      return origSay(msg);
    };
  } catch (e) { note('wrapSay', e); }

  function recordSet(vid, before, after, applied) {
    track.nSets++;
    let source = null, detail = null;
    if (rcCtx) {
      source = rcCategory(rcCtx.name);
      detail = 'rc:' + (rcCtx.name || '?');
      if (source === 'gossip') track.gossipViolations.push({ day: gday(Game), vid, applied, via: detail });
    } else if (obsCtx) {
      // per-applyRep-call context: primary = the vid whose opinion forms;
      // group-member ripple writes inside the same call are witnesses'
      // circles feeling it secondhand.
      if (String(vid) === String(obsCtx.primary)) {
        source = OBSERVE_ACTION_CATEGORY[obsCtx.action] || 'other';
        detail = 'observe:' + (obsCtx.action || '?');
      } else {
        source = 'ripple';
        detail = 'ripple:' + (obsCtx.action || '?');
      }
      if (obsCtx.noTrust) {
        // canon: a noTrust rep-drift must never move trust (rumor hops,
        // player-rumor traces, talk-only calls).
        track.gossipViolations.push({ day: gday(Game), vid, applied, via: detail + '|noTrust' });
      }
    } else {
      const c = classifyStack();
      source = c.cat;
      detail = (c.via ? c.via : '') + 'fn:' + c.fn + (c.file ? '@' + c.file : '');
      if (source === 'gossip') track.gossipViolations.push({ day: gday(Game), vid, applied, via: detail });
    }
    track.nClassified += (source && source !== 'other') ? 1 : 0;
    const tick = { day: gday(Game), vid: String(vid), source, detail,
      before: before === undefined ? 10 : before, after, applied };
    track.ticks.push(tick);
    if (Math.abs(applied) >= 8) {
      track.sayBeats.push({ day: tick.day, vid: tick.vid, source, detail, applied,
        beat: track.sayRing.slice(-8).map(x => x.text) });
    }
  }

  // ---- the trust-map proxy ----
  // NOTE (2026-10-15): the setter MUST be a no-op on self-assignment.
  // `v.trust = v.trust || {}` appears dozens of times in src and ALWAYS
  // assigns (the || only picks the value). Without the guard each such
  // line nested the proxy one level deeper (proxy wrapping proxy), so
  // every trust access walked an ever-growing chain and every write was
  // recorded N times — an O(n^2) slowdown that reads as a hang, plus
  // duplicate ticks. Legit resets (`v.trust = {}`) still re-wrap.
  let rawTrust = null, proxied = null;
  const ownProxies = new Set();
  function wrapTrust(t) {
    rawTrust = (t && ownProxies.has(t)) ? rawTrust : (t || {});
    proxied = new Proxy(rawTrust, {
      set(target, prop, value) {
        try {
          const before = target[prop];
          const b = (before === undefined || before === null) ? 10 : before;
          const ok = Reflect.set(target, prop, value);
          const a = (value === undefined || value === null) ? 10 : value;
          const applied = a - b;
          recordSet(prop, before, value, applied);
          return ok;
        } catch (e) { note('proxySet', e); return Reflect.set(target, prop, value); }
      },
      get(target, prop) { return target[prop]; },
      ownKeys(target) { return Reflect.ownKeys(target); },
      getOwnPropertyDescriptor(target, prop) { return Reflect.getOwnPropertyDescriptor(target, prop); },
    });
    ownProxies.add(proxied);
    return proxied;
  }
  try {
    const v = Game.state.village;
    wrapTrust(v.trust);
    Object.defineProperty(v, 'trust', {
      configurable: true, enumerable: true,
      get() { return proxied; },
      set(nv) {
        if (nv === proxied) return; // self-assign (`v.trust = v.trust || {}`): no-op
        wrapTrust(nv);
      },
    });
  } catch (e) { note('installProxy', e); }

  // ---- resolveConsequence: the named funnel ----
  try {
    if (typeof Game.resolveConsequence === 'function') {
      const orig = Game.resolveConsequence.bind(Game);
      Game.resolveConsequence = function (vid, spec) {
        const prev = rcCtx;
        rcCtx = { name: (spec && spec.name) || null, vid };
        let ret;
        try { ret = orig(vid, spec); }
        finally { rcCtx = prev; }
        return ret;
      };
    }
  } catch (e) { note('wrapRC', e); }

  // ---- observe / applyRep: witness drift + group ripples ----
  // observe(action, opts) fans out to applyRep(vid, dims, weight, skipTrust,
  // trustRippleTo) per witness, synchronously. Attribution granularity is
  // the applyRep call: primary = the vid whose opinion forms; other writes
  // inside that call are the trust-ripple through their group. noTrust
  // calls (rumor hops, player-rumor traces, talk-only) must move ZERO
  // trust — any set inside one is a canon violation (Trust ≠ reputation).
  const obsActionStack = [];
  try {
    if (typeof Game.observe === 'function') {
      const origO = Game.observe.bind(Game);
      Game.observe = function (action, opts) {
        obsActionStack.push(action);
        let ret;
        try { ret = origO.apply(this, arguments); }
        finally { obsActionStack.pop(); }
        return ret;
      };
    }
  } catch (e) { note('wrapObserve', e); }
  try {
    if (typeof Game.applyRep === 'function') {
      const orig = Game.applyRep.bind(Game);
      Game.applyRep = function (vid, dims, weight, noTrust, trustRippleTo) {
        const prev = obsCtx;
        obsCtx = { action: obsActionStack.length ? obsActionStack[obsActionStack.length - 1] : '?',
                   primary: vid, noTrust: !!noTrust };
        let ret;
        try { ret = orig.apply(this, arguments); }
        finally { obsCtx = prev; }
        return ret;
      };
    }
  } catch (e) { note('wrapApplyRep', e); }

  track.snapshotTrust = function () {
    const out = {};
    try { for (const k of Object.keys(rawTrust || {})) out[k] = rawTrust[k]; } catch (e) {}
    return out;
  };
  track.finalize = function () { return finalizeTrustDelta(Game, track); };
  return track;
}

function finalizeTrustDelta(Game, track) {
  const bySource = {}, byDetail = {};
  let posSum = 0, negSum = 0, zeroN = 0;
  for (const t of track.ticks) {
    const s = bySource[t.source] || (bySource[t.source] = { n: 0, pos: 0, neg: 0 });
    s.n++; if (t.applied > 0) { s.pos += t.applied; posSum += t.applied; }
    else if (t.applied < 0) { s.neg += t.applied; negSum += t.applied; }
    else zeroN++;
    const d = byDetail[t.detail] || (byDetail[t.detail] = { n: 0, pos: 0, neg: 0 });
    d.n++; if (t.applied > 0) d.pos += t.applied; else if (t.applied < 0) d.neg += t.applied;
  }
  const attributed = track.ticks.filter(t => t.source && t.source !== 'other').length;
  const coverage = track.ticks.length ? attributed / track.ticks.length : 1;
  // reconciliation: per-vid sum of tick deltas vs (final - initial)
  const recon = [];
  try {
    const cur = {};
    for (const k of Object.keys((Game.state.village || {}).trust || {})) {
      const v = Game.state.village.trust[k];
      cur[k] = (v === undefined || v === null) ? 10 : v;
    }
    const byVid = {};
    for (const t of track.ticks) {
      byVid[t.vid] = byVid[t.vid] || { ticks: 0, init: null };
      byVid[t.vid].ticks += t.applied;
      if (byVid[t.vid].init === null) byVid[t.vid].init = t.before;
    }
    for (const [vid, r] of Object.entries(byVid)) {
      const fin = cur[vid];
      recon.push({ vid, tickSum: Math.round(r.ticks), init: r.init,
        final: fin === undefined ? '(gone)' : fin,
        match: fin === undefined ? 'n/a' : (Math.abs(Math.round(r.ticks) - (fin - r.init)) < 0.5) });
    }
  } catch (e) { recon.push({ error: String(e && e.message) }); }
  const mismatched = recon.filter(r => r.match === false).length;
  return {
    nTicks: track.ticks.length,
    attributed, coverage: +coverage.toFixed(4),
    posSum: Math.round(posSum), negSum: Math.round(negSum), zeroN,
    bySource, byDetail,
    gossipViolations: track.gossipViolations,
    sayBeats: track.sayBeats,
    instrErrors: track.instrErrors,
    reconMismatched: mismatched,
    recon: recon.filter(r => r.match === false).slice(0, 10),
  };
}

module.exports = { installTrustDelta, finalizeTrustDelta, rcCategory };
