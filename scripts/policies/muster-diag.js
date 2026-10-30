// muster-diag — Herald-muster component probe for sim-muster-a
// (2026-10-30, flesh-out loop, axis scale-onramp, DIAG ONLY: zero
// src/js changes, zero edits to any existing recorder, policy-side
// only). Follow-up to sim-refusalsay-a (backlog #1546): 197/197
// refused Herald faces print have=0 / need=10, but the old corpora
// carry NO muster-state components, so the mechanism behind the
// zero was unmeasurable. This probe snapshots, at each
// muster-refusal utterance, every input the gate counts — plus
// counters proving whether any muster verb was ever attempted.
//
// OBSERVATIONAL ONLY. MUSTER=1 is the only on-switch. The wraps
// delegate, record after (say snapshots read state BEFORE
// delegating only because the gate records its outcome AFTER the
// say call — the snapshot's outcomes-length cross-check needs the
// pre-record value), write nothing to game state (snapshots live
// on this store, dumped by the sweep to a separate per-seed file,
// never into the fresh row), draw no RNG, never throw into the
// engine (recording errors are counted, an engine throw is
// recorded and RETHROWN unchanged), and return the original
// value untouched. Snapshot reads never call a mutator: titans
// state is read directly (no titanState() creation call),
// hierarchyState/_otherVillage/titanHavenBlades/titanVolunteers
// are pure reads, and titanMusterReady is called only in
// try/catch as a cross-check whose result is recorded, never
// trusted over the manual counts. Game.say is called often; the
// snapshot path runs ONLY when the first argument matches the
// muster-refusal text, so the rest of the sim pays one regex
// test per say call and nothing else.
//
// COMPONENTS (prereg evidence/2026-10-30/sim-muster-a-prereg.md):
// C0 call attempts so far (per verb, per titanId); C1 muster
// existence; C2 allies raw (= the gate's printed have);
// C3 allies unique-alive (= what titanMusterReady counts);
// C4 valid Haven blades (excluded from the printed have —
// a Haven-only muster still prints have=0); C5 active links
// with trust/opinion/arrears/quota/free-faces/wouldRefuse/
// wouldYield; C6 hypothetical call yield (sum of wouldYield);
// C7 omen stage; C8 offered flags (derived from C7/C4, NOT by
// calling titanSelfActions, which runs titanRepairPlacements);
// C9 ready check (C3+C4 >= need) + titanMusterReady cross-check.
'use strict';

const MUSTER_RE = /muster (\d+) allied blades \(you have (\d+)\)/;
const NOTICE_RE = /does not notice you/;

function layerOn() { try { return process.env.MUSTER === '1'; } catch (e) { return false; } }

function newStore() {
  return {
    errs: 0, errors: [], installed: false,
    calls: { soundTitanCall: {}, titanCommitOwn: {}, titanSelfDo: {}, titanWarCouncil: {} },
    callTotals: { soundTitanCall: 0, titanCommitOwn: 0, titanSelfDo: 0, titanWarCouncil: 0 },
    commitReturns: [],
    refusals: [],
  };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { void e2; }
}

function countCall(store, verb, key) {
  try {
    store.calls[verb][key] = (store.calls[verb][key] || 0) + 1;
    store.callTotals[verb]++;
  } catch (e) { void e; }
}

function callSnapshot(store) {
  try { return JSON.parse(JSON.stringify(store.callTotals)); } catch (e) { return null; }
}

// titanUniqueAllies replica (src/js/titans.js): dedupe by
// villageId:vid, drop hp<=0 allies and allies whose home roster
// person is dead or health<=0. A missing home person does NOT
// filter (the game code keeps such allies).
function uniqueAllies(Game, muster) {
  const seen = {};
  const out = [];
  try {
    const allies = (muster && muster.allies) || [];
    for (const a of allies) {
      if (!a || !a.vid) continue;
      const key = a.villageId + ':' + a.vid;
      if (seen[key]) continue;
      let person = null;
      try {
        const ov = (typeof Game._otherVillage === 'function') ? Game._otherVillage(a.villageId) : null;
        person = ov && (ov.roster || []).find(function (r) { return r.id === a.vid; });
      } catch (e) { person = null; }
      if ((a.hp !== undefined && a.hp <= 0) ||
          (person && (!person.alive || (person.health !== undefined && person.health <= 0)))) continue;
      seen[key] = true;
      out.push(a);
    }
  } catch (e) { void e; }
  return out;
}

// titanHavenBlades replica (titans.js): muster.haven entries on
// the Haven roster, excluding the scholar, deduped. Prefers the
// game's own function when present (it is a pure filter).
function havenBlades(Game, muster) {
  try {
    if (typeof Game.titanHavenBlades === 'function') return Game.titanHavenBlades(muster) || [];
  } catch (e) { void e; }
  const out = [];
  try {
    const roster = ((Game.state || {}).village || {}).roster || [];
    const seen = {};
    const list = (muster && muster.haven) || [];
    for (const h of list) {
      const vid = (typeof h === 'string') ? h : (h && h.vid);
      if (!vid || vid === Game.villagerId || seen[vid] || roster.indexOf(vid) < 0) continue;
      seen[vid] = true;
      out.push({ vid: vid });
    }
  } catch (e) { void e; }
  return out;
}

function snapshotRefusal(Game, store, sayText, have, need) {
  const snap = {
    idx: store.refusals.length,
    day: null, sayText: String(sayText).slice(0, 1000), have: have, need: need,
    musterExists: false, alliesRaw: null, alliesUnique: null,
    havenValid: null, readyManual: null, readyGame: null,
    omenStage: null, omenDay: null,
    links: [], linksActive: 0, callYield: 0,
    callOffered: false, commitOffered: false,
    volunteers: null, outcomesPrior: null, callsSoFar: callSnapshot(store),
  };
  try { snap.day = ((Game.state || {}).scholar || {}).day || 0; } catch (e) { void e; }
  try {
    const titans = (Game.state || {}).titans || {};
    const muster = titans.musters ? titans.musters.herald : null;
    snap.musterExists = !!muster;
    if (muster) {
      snap.alliesRaw = (muster.allies || []).length;
      snap.alliesUnique = uniqueAllies(Game, muster).length;
    } else {
      snap.alliesRaw = 0;
      snap.alliesUnique = 0;
    }
    const haven = muster ? havenBlades(Game, muster) : [];
    snap.havenValid = haven.length;
    snap.readyManual = (snap.alliesUnique + snap.havenValid) >= need;
    const omen = titans.omens ? titans.omens.herald : null;
    snap.omenStage = omen ? (omen.stage != null ? omen.stage : null) : null;
    snap.omenDay = omen ? (omen.day != null ? omen.day : null) : null;
    try { snap.outcomesPrior = ((titans.outcomes || []).filter(function (r) { return r && r.titan === 'herald' && r.outcome === 'refused'; })).length; } catch (e) { snap.outcomesPrior = null; }
    // Active links + hypothetical call yield, replicating
    // soundTitanCall's per-link rules (titans.js).
    let links = [];
    try { links = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : []; } catch (e) { links = []; }
    const committed = {};
    try {
      const allMusters = titans.musters || {};
      Object.keys(allMusters).forEach(function (tid) {
        if (titans.slain && titans.slain[tid]) return;
        uniqueAllies(Game, allMusters[tid]).forEach(function (a) { committed[a.villageId + ':' + a.vid] = true; });
      });
    } catch (e) { void e; }
    const cfg = ((Game.data || {}).titans || {})._coalition || {};
    const baseBlades = cfg.baseBlades || 2;
    const trustedBlades = cfg.trustedBlades || 6;
    const trustedAt = cfg.trustedAt || 70;
    const trustedOpinion = (cfg.trustedOpinion == null ? 10 : cfg.trustedOpinion);
    (links || []).filter(function (l) { return l && l.status === 'active'; }).forEach(function (link) {
      try {
        let vid = null;
        try { vid = (typeof Game._linkOther === 'function') ? Game._linkOther(link, 'haven') : (link.primary === 'haven' ? link.subordinate : link.primary); } catch (e) { vid = null; }
        let ov = null;
        try { ov = (typeof Game._otherVillage === 'function') ? Game._otherVillage(vid) : null; } catch (e) { ov = null; }
        const trust = link.trust || 0;
        const opinion = (ov && ov.opinion) || 0;
        const arrears = link.arrears || 0;
        const wouldRefuse = (trust < 25 || opinion < -10 || arrears > 0);
        const quota = (trust >= trustedAt && opinion >= trustedOpinion) ? trustedBlades : baseBlades;
        let facesFree = 0;
        try {
          const roster = (ov && ov.roster) || [];
          let linkSpeaker = null;
          try { linkSpeaker = (link.theirSpeaker && link.theirSpeaker.id) || null; } catch (e) { linkSpeaker = null; }
          void linkSpeaker;
          facesFree = roster.filter(function (r) {
            return r && r.alive && (r.age == null || r.age >= 18) && (r.health === undefined || r.health > 0) && !committed[vid + ':' + r.id];
          }).length;
        } catch (e) { facesFree = 0; }
        const already = muster ? (muster.allies || []).filter(function (a) { return a.villageId === vid; }).length : 0;
        const wouldYield = wouldRefuse ? 0 : Math.max(0, Math.min(quota - already, facesFree));
        snap.links.push({ villageId: vid, name: (ov && ov.name) || null, trust: trust, opinion: opinion,
          arrears: arrears, quota: quota, facesFree: facesFree, already: already,
          wouldRefuse: wouldRefuse, wouldYield: wouldYield });
        snap.callYield += wouldYield;
      } catch (e) { void e; }
    });
    snap.linksActive = snap.links.length;
    snap.callOffered = (snap.omenStage != null && snap.omenStage >= 2);
    snap.commitOffered = snap.callOffered && (snap.havenValid < 3);
    try {
      const vols = (typeof Game.titanVolunteers === 'function') ? Game.titanVolunteers() : null;
      snap.volunteers = vols ? vols.length : null;
    } catch (e) { snap.volunteers = null; }
    try { snap.readyGame = (typeof Game.titanMusterReady === 'function') ? !!Game.titanMusterReady('herald') : null; } catch (e) { snap.readyGame = null; }
  } catch (e) { noteErr(store, 'snapshot', e); }
  return snap;
}

function installMusterDiag(Game, store) {
  try {
    if (typeof Game.say === 'function' && !Game.say.__musterWrapped) {
      const orig = Game.say;
      const wrapped = function () {
        try {
          const arg = arguments.length ? arguments[0] : null;
          if (typeof arg === 'string' && NOTICE_RE.test(arg)) {
            const m = MUSTER_RE.exec(arg);
            if (m) {
              const snap = snapshotRefusal(Game, store, arg, parseInt(m[2], 10), parseInt(m[1], 10));
              store.refusals.push(snap);
            }
          }
        } catch (e) { noteErr(store, 'say', e); }
        return orig.apply(this, arguments);
      };
      wrapped.__musterWrapped = true;
      Game.say = wrapped;
    }
    const verbs = [
      ['soundTitanCall', function (tid) { return String(tid == null ? 'null' : tid); }],
      ['titanCommitOwn', function (tid) { return String(tid == null ? 'null' : tid); }],
      ['titanWarCouncil', function (tid) { return String(tid == null ? 'null' : tid); }],
      ['titanSelfDo', function (id) { return String(id == null ? 'null' : id); }],
    ];
    verbs.forEach(function (spec) {
      const name = spec[0], keyFn = spec[1];
      try {
        if (typeof Game[name] !== 'function') { noteErr(store, 'missing:' + name, new Error('not a function')); return; }
        if (Game[name].__musterWrapped) return;
        const orig = Game[name];
        const wrapped = function () {
          let key = null;
          try { key = keyFn(arguments.length ? arguments[0] : null); } catch (e) { key = '?'; }
          countCall(store, name, key);
          let r;
          try { r = orig.apply(this, arguments); }
          catch (e) { throw e; }
          try {
            if (name === 'titanCommitOwn') {
              store.commitReturns.push({ day: ((Game.state || {}).scholar || {}).day || 0,
                kind: (r === 'confirm' ? 'confirm' : (r == null ? 'null' : 'muster')) });
            }
          } catch (e) { void e; }
          return r;
        };
        wrapped.__musterWrapped = true;
        Game[name] = wrapped;
      } catch (e) { noteErr(store, 'wrap:' + name, e); }
    });
    store.installed = true;
  } catch (e) { noteErr(store, 'install', e); }
}

module.exports = { layerOn, newStore, installMusterDiag, snapshotRefusal, uniqueAllies, havenBlades, MUSTER_RE };
