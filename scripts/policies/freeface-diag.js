// freeface-diag — allied-roster free-face decomposition probe for
// sim-freeface-a (2026-11-01, flesh-out loop, axis scale-onramp,
// DIAG ONLY: zero src/js changes, zero edits to any existing
// recorder, policy-side only).
//
// Question (from sim-muster3-a, seed 90111): at Herald refusal
// time, trusted quota-6 allies Stonebridge and Thornfield show
// ZERO free faces on all 22 snapshots while Emberhold shows 3.
// This probe decomposes EVERY allied roster at each muster
// refusal AND daily across days 80-95, so every face is counted
// exactly once under exactly one cause.
//
// DEFINITION (reconciled against src/js/titans.js before use):
// titanAlliedFaces(villageId, n, excluded) returns roster
// members who are alive, adult (age null or >= 18), health > 0
// (or undefined), and not in `excluded` — where soundTitanCall
// builds `excluded` from titanUniqueAllies over ALL non-slain
// musters, keyed villageId:id, speaker first (ordering only,
// never a count effect). muster-diag's facesFree replicates this
// count exactly: same four filters, same committed map, uncapped
// (soundTitanCall then caps by quota-minus-already via
// wouldYield). This probe's `free` count must equal
// muster-diag's facesFree for the same village at the same
// refusal; any mismatch is an instrument bug, reported not
// papered over. Faces committed ONLY to a slain titan are FREE
// (slain musters are skipped when building `excluded`).
//
// PARTITION (each roster member lands in exactly one bucket,
// in code-filter order):
//   dead:      !alive
//   underage:  alive, age != null && age < 18
//   unhealthy: alive, adult, health !== undefined && health <= 0
//   committed: alive, adult, healthy, key in non-slain committed map
//   free:      the rest (= titanAlliedFaces, uncapped)
//
// OBSERVATIONAL ONLY. FREEFACE=1 is the only on-switch. The
// wraps delegate, record (snapshots live on this store, dumped
// by the sweep to a separate per-seed file, never into game
// state), draw no RNG, never throw into the engine (recording
// errors are counted, an engine throw is recorded and RETHROWN
// unchanged), and return the original value untouched. Snapshot
// reads never call a mutator: titans state is read directly (no
// titanState() creation call); hierarchyState/_otherVillage/
// _linkOther are pure reads.
'use strict';

const MUSTER_RE = /muster (\d+) allied blades \(you have (\d+)\)/;
const NOTICE_RE = /does not notice you/;

function layerOn() { try { return process.env.FREEFACE === '1'; } catch (e) { return false; } }

function newStore() {
  return {
    errs: 0, errors: [], installed: false,
    records: [], lastDailyDay: null,
  };
}

function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { void e2; }
}

// Pure roster partition. committedFace: { 'villageId:id': [titanId, ...] }
// for NON-SLAIN musters only. Returns counts plus id lists so the
// analyzer can verify total == dead+underage+unhealthy+committed+free.
function decomposeRoster(roster, villageId, committedFace, speakerId) {
  const out = {
    total: 0, dead: 0, underage: 0, unhealthy: 0, committed: 0, free: 0,
    deadIds: [], underageIds: [], unhealthyIds: [],
    committedFaces: [], // {id, name, musters[]}
    freeFaces: [],      // {id, name} in roster order
    speakerId: speakerId || null, speakerFree: null, speakerBucket: null,
  };
  (roster || []).forEach(function (r) {
    if (!r) return;
    out.total++;
    const key = villageId + ':' + r.id;
    let bucket = null;
    if (!r.alive) bucket = 'dead';
    else if (r.age != null && r.age < 18) bucket = 'underage';
    else if (r.health !== undefined && r.health <= 0) bucket = 'unhealthy';
    else if (committedFace && committedFace[key]) bucket = 'committed';
    else bucket = 'free';
    out[bucket]++;
    if (bucket === 'dead') out.deadIds.push(r.id);
    else if (bucket === 'underage') out.underageIds.push(r.id);
    else if (bucket === 'unhealthy') out.unhealthyIds.push(r.id);
    else if (bucket === 'committed') out.committedFaces.push({ id: r.id, name: r.name || 'a fighter', musters: (committedFace[key] || []).slice() });
    else out.freeFaces.push({ id: r.id, name: r.name || 'a fighter' });
    if (speakerId != null && r.id === speakerId) { out.speakerBucket = bucket; out.speakerFree = (bucket === 'free'); }
  });
  return out;
}

// Read the committed map straight from Game.state.titans.musters.
// Returns { byFace: {key: [tid...]} (non-slain only),
//           musters: {tid: {slain, alliesRaw: [{villageId, vid, name, hp}]}} }.
function readCommittedMap(Game) {
  const byFace = {};
  const musters = {};
  try {
    const titans = (Game.state || {}).titans || {};
    const all = titans.musters || {};
    const slain = titans.slain || {};
    Object.keys(all).forEach(function (tid) {
      const m = all[tid] || {};
      const allies = (m.allies || []).map(function (a) {
        return { villageId: a.villageId, vid: a.vid, name: a.name || null, hp: (a.hp !== undefined ? a.hp : null) };
      });
      musters[tid] = { slain: !!slain[tid], alliesRaw: allies };
      if (slain[tid]) return;
      allies.forEach(function (a) {
        if (!a.vid) return;
        const key = a.villageId + ':' + a.vid;
        (byFace[key] = byFace[key] || []).push(tid);
      });
    });
  } catch (e) { void e; }
  return { byFace: byFace, musters: musters };
}

// Full decomposition at one moment: every ACTIVE link's village.
// Mirrors muster-diag's link resolution (hierarchyState +
// _linkOther) and quota rules so facesFree cross-checks line up.
function decomposeAll(Game) {
  const result = { day: null, villages: [], committedMap: null, linksActive: 0 };
  try { result.day = ((Game.state || {}).scholar || {}).day || 0; } catch (e) { void e; }
  try {
    const cm = readCommittedMap(Game);
    result.committedMap = cm.musters;
    let links = [];
    try { links = (typeof Game.hierarchyState === 'function') ? Game.hierarchyState() : []; } catch (e) { links = []; }
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
        const quota = (trust >= trustedAt && opinion >= trustedOpinion) ? trustedBlades : baseBlades;
        const speakerId = (link.theirSpeaker && link.theirSpeaker.id) || null;
        const speakerName = (link.theirSpeaker && link.theirSpeaker.name) || null;
        const dec = decomposeRoster((ov && ov.roster) || [], vid, cm.byFace, speakerId);
        const muster = ((Game.state || {}).titans || {}).musters || {};
        let already = 0;
        try { already = ((muster.herald && muster.herald.allies) || []).filter(function (a) { return a.villageId === vid; }).length; } catch (e) { already = 0; }
        const wouldRefuse = (trust < 25 || opinion < -10 || arrears > 0);
        result.villages.push({
          villageId: vid, name: (ov && ov.name) || null,
          trust: trust, opinion: opinion, arrears: arrears, quota: quota,
          already: already, wouldRefuse: wouldRefuse,
          wouldYield: wouldRefuse ? 0 : Math.max(0, Math.min(quota - already, dec.free)),
          speakerId: speakerId, speakerName: speakerName,
          decomposition: dec,
        });
      } catch (e) { void e; }
    });
    result.linksActive = result.villages.length;
  } catch (e) { void e; }
  return result;
}

function record(Game, store, kind, sayText) {
  try {
    const dec = decomposeAll(Game);
    dec.kind = kind;
    dec.idx = store.records.length;
    if (sayText != null) dec.sayText = String(sayText).slice(0, 1000);
    store.records.push(dec);
    return dec;
  } catch (e) { noteErr(store, 'record:' + kind, e); return null; }
}

// Daily hook: called by the sweep's policy daily wrapper. Records
// once per scholar day, only for days in [lo, hi] (default 80-95).
function recordDaily(Game, store, lo, hi) {
  try {
    const day = ((Game.state || {}).scholar || {}).day || 0;
    const a = (lo == null ? 80 : lo), b = (hi == null ? 95 : hi);
    if (day < a || day > b) return null;
    if (store.lastDailyDay === day) return null;
    store.lastDailyDay = day;
    return record(Game, store, 'daily', null);
  } catch (e) { noteErr(store, 'daily', e); return null; }
}

function installFreefaceDiag(Game, store) {
  try {
    if (typeof Game.say === 'function' && !Game.say.__freefaceWrapped) {
      const orig = Game.say;
      const wrapped = function () {
        try {
          const arg = arguments.length ? arguments[0] : null;
          if (typeof arg === 'string' && NOTICE_RE.test(arg) && MUSTER_RE.test(arg)) {
            record(Game, store, 'refusal', arg);
          }
        } catch (e) { noteErr(store, 'say', e); }
        return orig.apply(this, arguments);
      };
      wrapped.__freefaceWrapped = true;
      Game.say = wrapped;
    }
    store.installed = true;
  } catch (e) { noteErr(store, 'install', e); }
}

module.exports = {
  layerOn, newStore, installFreefaceDiag, recordDaily, record,
  decomposeRoster, decomposeAll, readCommittedMap, MUSTER_RE,
};
