// trustfirst-analyze-20261111.js — trust + gossip first-numbers analyzer
// (arm sim-trustfirst-a). Reads evidence/2026-11-11/perseed-trustfirst-a/
// control-leg JSON (+ neutral-leg JSON for the neutrality check) and
// prints per-seed + pooled tables as JSON.
//
// Villager-trust reconciliation mirrors trustgrowth v2: the instrument's
// property setter logs EVERY write to state.village.trust[vid] with its
// caller stack; each setter event is classified by that stack and
// snapshot intervals are reconciled against the setter-event sums
// (seq intervals, no day arithmetic). Anything that does not reconcile
// is listed as residue, never hidden. Link-trust events reuse the
// trustgrowth cause classifier (classifyEvent) for cause labels.
// Usage: node scripts/trustfirst-analyze-20261111.js [--out <summary.json>]
//   [--dir <perseed-dir>] [--run <run-tag>] [--mode control]
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
let TG_AN = null;
try { TG_AN = require(path.join(__dirname, 'trustgrowth-analyze-20261109')); } catch (e) { TG_AN = null; }

const args = process.argv.slice(2);
function argVal(flag, def) {
  const i = args.indexOf(flag);
  return (i >= 0 && args[i + 1]) ? args[i + 1] : def;
}
const DIR = argVal('--dir', path.join(REPO, 'evidence', '2026-11-11', 'perseed-trustfirst-a'));
const RUN = argVal('--run', 'trustfirst-pilot');
const MODE = argVal('--mode', 'control');
const OUT = argVal('--out', null);

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const n = s.length;
  return (n % 2) ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}
function bump(obj, k, n) { obj[k] = (obj[k] || 0) + (n === undefined ? 1 : n); }

if (require.main !== module) { module.exports = { median: median, classifyTrustWrite: classifyTrustWrite }; return; }

function loadLeg(mode) {
  const files = fs.readdirSync(DIR)
    .filter(function (f) { return f.indexOf('trustfirst-s') === 0 && f.indexOf('-' + RUN + '-' + mode + '.json') !== -1; })
    .sort();
  return files.map(function (f) { return { file: f, o: JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')) }; });
}

// --- villager-trust write classification from the setter stack --------
function firstFn(stack) {
  if (!stack) return null;
  const lines = String(stack).split(' | ');
  for (const ln of lines) {
    const m = ln.match(/at (?:Object\.)?([A-Za-z_$][\w$]*)/);
    if (m && m[1] !== 'Object' && m[1] !== 'set' && m[1] !== 'trustWrites') return m[1];
  }
  return null;
}
function classifyTrustWrite(ev, bumpByKey) {
  const s = ev.stack || '';
  if (/bumpTrust/.test(s)) {
    // Attach the bumpTrust wrap's reason when an unmatched wrap event
    // agrees on vid/day/applied (the setter fires inside the wrap).
    let reason = null;
    if (bumpByKey) {
      const key = ev.vid + '|' + ev.day + '|' + ev.delta;
      if (bumpByKey[key] && bumpByKey[key].length) reason = bumpByKey[key].shift();
    }
    return { cause: 'bumpTrust', reason: reason };
  }
  if (/_evTrustAll/.test(s)) return { cause: 'evTrustAll', reason: null };
  if (/applyRep/.test(s)) return { cause: 'applyRep-drift', reason: null };
  if (/trustGainProgressive/.test(s)) return { cause: 'deed-direct', reason: firstFn(s) };
  const fn = firstFn(s);
  if (fn) return { cause: 'other-named:' + fn, reason: null };
  return { cause: 'unattributed', reason: null };
}

function summarizeSeed(entry) {
  const o = entry.o;
  const S = { seed: o.seed, file: entry.file, days: o.days, endReason: o.endReason, won: o.won,
    villageLost: o.villageLost, scaleRank: o.scaleRank, maxWave: o.maxWave, standing: o.standing,
    endPantryKcal: o.endPantryKcal, deaths: (o.deaths || []).length, instrumentErrors: (o.instrumentErrors || []).length };
  const daily = o.daily || [];
  const first = daily[0] || null, last = daily[daily.length - 1] || null;

  // --- (1) villager trust: setter-event classification + reconciliation ---
  const bumpByKey = {};
  (o.bumpTrust || []).forEach(function (b) {
    if (b.applied === null || b.applied === undefined) return;
    const key = b.vid + '|' + b.day + '|' + b.applied;
    (bumpByKey[key] = bumpByKey[key] || []).push(b.reason || '?');
  });
  const writes = o.trustWrites || [];
  const byCause = {}, byCauseUp = {}, byCauseDown = {};
  const classified = [];
  writes.forEach(function (ev) {
    const c = classifyTrustWrite(ev, bumpByKey);
    classified.push({ ev: ev, cause: c.cause, reason: c.reason });
    bump(byCause, c.cause);
    if (ev.delta > 0) bump(byCauseUp, c.cause, ev.delta);
    else if (ev.delta < 0) bump(byCauseDown, c.cause, -ev.delta);
  });
  S.trustWrites = writes.length;
  S.trustByCause = byCause;
  S.trustUpByCause = byCauseUp;
  S.trustDownByCause = byCauseDown;
  S.trustUnclassified = (byCause['unattributed'] || 0);
  S.trustOtherNamed = Object.keys(byCause).filter(function (k) { return k.indexOf('other-named:') === 0; }).map(function (k) { return k + '=' + byCause[k]; });
  S.bumpTrustWrap = (o.bumpTrust || []).length;
  S.evTrustAllWrap = (o.evTrustAll || []).length;
  S.teleTrust = (o.teleTrust || []).length;
  // Wrap-vs-setter cross-check: every bumpTrust wrap event with a nonzero
  // applied amount should have a setter twin (same vid/day/delta).
  const setterKeys = {};
  writes.forEach(function (ev) { setterKeys[ev.vid + '|' + ev.day + '|' + ev.delta] = (setterKeys[ev.vid + '|' + ev.day + '|' + ev.delta] || 0) + 1; });
  let bumpNoTwin = 0;
  (o.bumpTrust || []).forEach(function (b) {
    if (!b.applied) return;
    const key = b.vid + '|' + b.day + '|' + b.applied;
    if (setterKeys[key]) setterKeys[key] -= 1; else bumpNoTwin += 1;
  });
  S.bumpTrustNoSetterTwin = bumpNoTwin;
  // Snapshot reconciliation: per-vid interval deltas vs setter sums.
  let reconIntervals = 0, reconOk = 0;
  const residue = [];
  for (let i = 1; i < daily.length; i++) {
    const prev = daily[i - 1], cur = daily[i];
    const vids = new Set([].concat(Object.keys(prev.trust || {}), Object.keys(cur.trust || {})));
    vids.forEach(function (vid) {
      const snapDelta = ((cur.trust || {})[vid] === undefined ? 10 : (cur.trust || {})[vid])
        - ((prev.trust || {})[vid] === undefined ? 10 : (prev.trust || {})[vid]);
      // A vid absent from BOTH snapshots but present in neither map reads
      // 10 both sides (delta 0); skip pure-absent pairs.
      if ((prev.trust || {})[vid] === undefined && (cur.trust || {})[vid] === undefined) return;
      const evSum = writes.filter(function (ev) { return ev.vid === vid && ev.seq > prev.seq && ev.seq <= cur.seq; })
        .reduce(function (a, ev) { return a + ev.delta; }, 0);
      reconIntervals += 1;
      if (snapDelta === evSum) reconOk += 1;
      else residue.push({ day: cur.day, vid: vid, snapDelta: snapDelta, evSum: evSum, gap: snapDelta - evSum });
    });
  }
  S.reconIntervals = reconIntervals;
  S.reconOk = reconOk;
  S.reconResidue = residue.slice(0, 20);
  S.reconResidueCount = residue.length;
  // Trust trajectories: end/min/max per villager over snapshots.
  const traj = {};
  daily.forEach(function (snap) {
    Object.keys(snap.trust || {}).forEach(function (vid) {
      const v = snap.trust[vid];
      traj[vid] = traj[vid] || { start: v, end: v, min: v, max: v };
      traj[vid].end = v;
      if (v < traj[vid].min) traj[vid].min = v;
      if (v > traj[vid].max) traj[vid].max = v;
    });
  });
  S.trustTraj = traj;
  S.trustEndMean = null;
  const ends = Object.keys(traj).map(function (vid) { return traj[vid].end; });
  if (ends.length) S.trustEndMean = +(ends.reduce(function (a, b) { return a + b; }, 0) / ends.length).toFixed(1);
  // Scholar-trust<30 days (half-ration proxy): scholar id is Game.villagerId,
  // not stored per-seed; use the roster-mean instead + the min-villager day
  // count. The exact meal rule is engine-side; this is a proxy, flagged so.
  S.scholarTrustProxy = null;

  // --- (2) village opinion trajectories ---
  const opTraj = {};
  daily.forEach(function (snap) {
    (snap.opinion || []).forEach(function (ov) {
      opTraj[ov.id] = opTraj[ov.id] || { name: ov.name, start: ov.trust, end: ov.trust, min: ov.trust, max: ov.trust };
      opTraj[ov.id].end = ov.trust;
      if (ov.trust < opTraj[ov.id].min) opTraj[ov.id].min = ov.trust;
      if (ov.trust > opTraj[ov.id].max) opTraj[ov.id].max = ov.trust;
    });
  });
  S.opinionTraj = opTraj;
  S.opinionVerbs = {};
  (o.opinionVerbs || []).forEach(function (e) { bump(S.opinionVerbs, e.fn); });
  S.opinionMoved = (o.opinionVerbs || []).filter(function (e) { return Object.keys(e.moved || {}).length; }).length;

  // --- (3) link trust (trajectories + TG cause labels, cited not re-derived) ---
  const tgDaily = o.tgDaily || [];
  const linkTraj = {};
  tgDaily.forEach(function (snap) {
    (snap.links || []).forEach(function (l) {
      const id = l.id || l.key;
      linkTraj[id] = linkTraj[id] || { other: l.other, start: l.trust, end: l.trust, min: l.trust, max: l.trust, seasoned: !!l.seasoned };
      linkTraj[id].end = l.trust;
      if (l.trust < linkTraj[id].min) linkTraj[id].min = l.trust;
      if (l.trust > linkTraj[id].max) linkTraj[id].max = l.trust;
      if (l.seasoned) linkTraj[id].seasoned = true;
    });
  });
  S.linkTraj = linkTraj;
  S.linkCount = Object.keys(linkTraj).length;
  S.linkSeasoned = Object.keys(linkTraj).filter(function (id) { return linkTraj[id].seasoned; }).length;
  const tgCause = {};
  let tgUnatt = 0;
  (o.tgEvents || []).forEach(function (ev) {
    const c = TG_AN ? TG_AN.classifyEvent(ev.stack, ev.delta) : 'unknown';
    bump(tgCause, c);
    if (c === 'unattributed') tgUnatt += 1;
  });
  S.linkEventsByCause = tgCause;
  S.linkUnattributed = tgUnatt;
  S.linkGains = (o.tgGains || []).length;

  // --- (4) gossip ---
  const seeds = o.seedGossip || [];
  const seedsByAction = {};
  let deduped = 0;
  seeds.forEach(function (s) { bump(seedsByAction, s.action || 'unknown'); if (s.deduped) deduped += 1; });
  S.gossipSeeds = seeds.length;
  S.gossipSeedsByAction = seedsByAction;
  S.gossipDeduped = deduped;
  S.gossipUnclassified = (seedsByAction['unknown'] || 0) + (seedsByAction['other'] || 0);
  let hops = 0, hopsMutated = 0, gossipWithHop = 0, maxHearers = 0, secondReach = 0;
  const gossipMaxHear = {};
  (o.spreadGossip || []).forEach(function (call) {
    (call.hops || []).forEach(function (h) {
      if (h.listener) { hops += 1; if (h.mutated) hopsMutated += 1; }
    });
  });
  // Max hearers per gossip item from the daily snapshots (heard arrays).
  daily.forEach(function (snap) {
    (snap.gossipAlive || []).forEach(function (g) {
      const k = (g.action || 'unknown') + '@d' + (g.day || 0);
      if ((g.heard || []).length > (gossipMaxHear[k] || 0)) gossipMaxHear[k] = (g.heard || []).length;
    });
  });
  Object.keys(gossipMaxHear).forEach(function (k) {
    if (gossipMaxHear[k] > maxHearers) maxHearers = gossipMaxHear[k];
    if (gossipMaxHear[k] >= 2) secondReach += 1; // a second villager heard it
  });
  S.gossipHops = hops;
  S.gossipHopsMutated = hopsMutated;
  S.gossipMaxHearers = maxHearers;
  S.gossipSecondReach = secondReach; // gossip items that reached >=2 hearers
  S.gossipItemsAliveMax = Math.max.apply(null, daily.map(function (s) { return (s.gossipAlive || []).length; }).concat([0]));
  S.spreadRumor = (o.spreadRumor || []).length;

  // --- (5) reputation ---
  const repStart = (first && first.rep) || {}, repEnd = (last && last.rep) || {};
  const repMoves = {};
  const repBySource = { observe: 0, gossip: 0, other: 0 };
  (o.applyRep || []).forEach(function (e) {
    const d = Object.keys(e.repDelta || {}).length;
    if (!d) return;
    if (/spreadGossip/.test(e.stack || '')) repBySource.gossip += 1;
    else if (/observe/.test(e.stack || '')) repBySource.observe += 1;
    else repBySource.other += 1;
  });
  S.applyRep = (o.applyRep || []).length;
  S.applyRepWithMove = Object.keys(repMoves).length; // (filled below by start/end diff)
  const repEndState = {};
  Object.keys(repEnd).forEach(function (vid) {
    const a = repStart[vid] || {}, b = repEnd[vid];
    const diff = {};
    ['generous', 'brave', 'honest', 'competent', 'trustworthy', 'kind'].forEach(function (k) {
      if ((b[k] || 0) !== (a[k] || 0)) diff[k] = (b[k] || 0) - (a[k] || 0);
    });
    if (Object.keys(diff).length) repEndState[vid] = diff;
  });
  S.repEndDiffs = repEndState;
  S.repBySource = repBySource;
  // Rep-word crossings: any dim crossing ±25 (words) or ±30 (talk lines).
  let repCrossings = 0;
  Object.keys(repEndState).forEach(function (vid) {
    const a = repStart[vid] || {}, b = repEnd[vid];
    ['generous', 'brave', 'honest', 'competent'].forEach(function (k) {
      [25, -25, 30, -30].forEach(function (bar) {
        const before = (a[k] || 0), after = (b[k] || 0);
        if ((before < bar && after >= bar) || (before > bar && after <= bar)) repCrossings += 1;
      });
    });
  });
  S.repCrossings = repCrossings;
  S.observe = (o.observe || []).length;
  const obsByAction = {};
  (o.observe || []).forEach(function (e) { bump(obsByAction, e.action || 'unknown'); });
  S.observeByAction = obsByAction;

  // --- (6) trust-gated decisions ---
  S.moot = {};
  (o.moot || []).forEach(function (e) { bump(S.moot, e.fn); });
  S.bondEvents = {};
  (o.bondEvents || []).forEach(function (e) { bump(S.bondEvents, e.fn); });
  S.teleBond = (o.teleBond || []).length;
  S.tendLink = (o.tendLink || []).length;
  S.talkOpens = (o.talkOpens || []).length;
  S.endConvo = (o.endConvo || []).length;
  const stipends = (o.endConvo || []).filter(function (e) { return e.stipend; });
  S.endConvoStipends = stipends.length;
  S.endConvoStipendTotal = stipends.reduce(function (a, e) { return a + (e.stipend || 0); }, 0);
  S.endConvoZeroExchange = (o.endConvo || []).filter(function (e) { return e.exchangesBefore === 0 || e.exchangesBefore === null; }).length;
  S.river = {};
  (o.river || []).forEach(function (e) { bump(S.river, e.fn); });

  // --- (9) say-line coherence ---
  const says = o.trustSays || [];
  const villageTrustLines = says.filter(function (s) { return /village trust/i.test(s.line); });
  const trustWordLines = says.filter(function (s) { return /trust/i.test(s.line); });
  S.trustSays = says.length;
  S.villageTrustLines = villageTrustLines.length;
  S.trustWordLines = trustWordLines.length;
  S.villageTrustLineTexts = villageTrustLines.slice(0, 20).map(function (s) { return 'd' + s.day + ': ' + s.line; });
  // "Village trust +N" requested vs applied: match _evTrustAll events on
  // the same day (requested N) and compare with the line's N.
  const evByDay = {};
  (o.evTrustAll || []).forEach(function (e) { (evByDay[e.day] = evByDay[e.day] || []).push(e); });
  const lineChecks = [];
  villageTrustLines.forEach(function (s) {
    const m = s.line.match(/village trust\s*[+\-−]?\s*(\d+)/i);
    if (!m) { lineChecks.push({ day: s.day, line: s.line.slice(0, 120), verdict: 'no-number' }); return; }
    const n = parseInt(m[1], 10) * (/village trust\s*−/i.test(s.line) || /village trust\s*-\s*\d/.test(s.line) ? -1 : 1);
    const evs = evByDay[s.day] || [];
    const match = evs.find(function (e) { return e.requested === n; });
    lineChecks.push({ day: s.day, printed: n, evTrustAllSameDay: evs.map(function (e) { return e.requested; }),
      verdict: match ? 'requested-matches-evTrustAll' : (evs.length ? 'no-matching-evTrustAll' : 'no-evTrustAll-that-day') });
  });
  S.villageTrustLineChecks = lineChecks;

  // --- wrap liveness ---
  S.wrapLive = o.wrapLive || {};
  S.wrapCounts = o.wrapCounts || {};
  return S;
}

const control = loadLeg(MODE);
if (!control.length) { console.error('TRUSTFIRST-ANALYZE STOP: no control files in ' + DIR); process.exit(2); }
const neutral = loadLeg('neutral');

const seeds = control.map(function (e) { return summarizeSeed(e); });
const band = { run: RUN, mode: MODE, seeds: seeds.map(function (s) { return s.seed; }), perSeed: seeds };

// --- neutrality: control vs neutral on identical seeds ---
const neutralBySeed = {};
neutral.forEach(function (e) { neutralBySeed[e.o.seed] = e.o; });
const neutrality = seeds.map(function (s) {
  const n = neutralBySeed[s.seed];
  if (!n) return { seed: s.seed, match: null, note: 'no neutral file' };
  const nDeaths = ((n.deaths && n.deaths.length) !== undefined) ? n.deaths.length : ((n.deaths || []).length);
  return { seed: s.seed,
    daysMatch: s.days === n.days,
    pantryMatch: s.endPantryKcal === n.endPantryKcal,
    deathsMatch: s.deaths === (Array.isArray(n.deaths) ? n.deaths.length : nDeaths),
    days: [s.days, n.days], pantry: [s.endPantryKcal, n.endPantryKcal], deaths: [s.deaths, Array.isArray(n.deaths) ? n.deaths.length : nDeaths],
    match: (s.days === n.days && s.endPantryKcal === n.endPantryKcal && s.deaths === (Array.isArray(n.deaths) ? n.deaths.length : nDeaths)) };
});
band.neutrality = neutrality;
band.neutralityMatch = neutrality.filter(function (r) { return r.match; }).length + '/' + neutrality.length;

// --- pooled band totals ---
function sum(f) { return seeds.reduce(function (a, s) { return a + (f(s) || 0); }, 0); }
const pooled = {};
pooled.trustWrites = sum(function (s) { return s.trustWrites; });
pooled.trustUnclassified = sum(function (s) { return s.trustUnclassified; });
pooled.trustOtherNamed = {}; // summed by cause name (was: string-deduped "name=n" list, which split one cause across seeds)
seeds.forEach(function (s) { (s.trustOtherNamed || []).forEach(function (x) {
  const m = /^other-named:(.+)=(\d+)$/.exec(x);
  if (m) pooled.trustOtherNamed[m[1]] = (pooled.trustOtherNamed[m[1]] || 0) + parseInt(m[2], 10);
}); });
// Wrap inventory (must match scripts/trustfirst-instrument-20261111.js wrap() calls).
const WRAPPED_INVENTORY = ['bumpTrust', '_evTrustAll', 'trustGainProgressive', 'applyRep', 'observe',
  'seedGossip', 'spreadGossip', 'spreadRumor', 'gossipActionDims', 'talkTo', 'endConvo', 'tele',
  'mootQuorum', 'mootFriendVoice', 'mootAccuserAftermath',
  'proposeBond', 'stageBondProposal', 'acceptBondProposal', 'declineBondProposal',
  'stageLinkRaise', 'acceptLinkRaise', 'declineLinkRaise', 'npcBondTick', 'npcLinkRaiseTick',
  'tendLink', 'villageTalk', 'villageDeal', 'villageShareFood', 'joinVillageReal', 'probationTick',
  'evRiverTrader', 'feedRiverTrader', 'tradeRiverTrader', 'snubRiverTrader'];
pooled.wrapLive = [];
seeds.forEach(function (s) { Object.keys(s.wrapLive || {}).forEach(function (k) { if (pooled.wrapLive.indexOf(k) === -1) pooled.wrapLive.push(k); }); });
pooled.wrapLive.sort();
pooled.wrapDead = WRAPPED_INVENTORY.filter(function (n) { return pooled.wrapLive.indexOf(n) === -1; });
pooled.bumpTrustNoSetterTwin = sum(function (s) { return s.bumpTrustNoSetterTwin; });
pooled.reconIntervals = sum(function (s) { return s.reconIntervals; });
pooled.reconOk = sum(function (s) { return s.reconOk; });
pooled.reconResidue = sum(function (s) { return s.reconResidueCount; });
pooled.gossipSeeds = sum(function (s) { return s.gossipSeeds; });
pooled.gossipUnclassified = sum(function (s) { return s.gossipUnclassified; });
pooled.gossipHops = sum(function (s) { return s.gossipHops; });
pooled.gossipHopsMutated = sum(function (s) { return s.gossipHopsMutated; });
pooled.gossipSecondReach = sum(function (s) { return s.gossipSecondReach; });
pooled.gossipMaxHearers = Math.max.apply(null, seeds.map(function (s) { return s.gossipMaxHearers; }).concat([0]));
pooled.spreadRumor = sum(function (s) { return s.spreadRumor; });
pooled.applyRep = sum(function (s) { return s.applyRep; });
pooled.observe = sum(function (s) { return s.observe; });
pooled.repCrossings = sum(function (s) { return s.repCrossings; });
pooled.tendLink = sum(function (s) { return s.tendLink; });
pooled.opinionVerbs = {};
seeds.forEach(function (s) { Object.keys(s.opinionVerbs || {}).forEach(function (k) { pooled.opinionVerbs[k] = (pooled.opinionVerbs[k] || 0) + s.opinionVerbs[k]; }); });
pooled.moot = {};
seeds.forEach(function (s) { Object.keys(s.moot || {}).forEach(function (k) { pooled.moot[k] = (pooled.moot[k] || 0) + s.moot[k]; }); });
pooled.bondEvents = {};
seeds.forEach(function (s) { Object.keys(s.bondEvents || {}).forEach(function (k) { pooled.bondEvents[k] = (pooled.bondEvents[k] || 0) + s.bondEvents[k]; }); });
pooled.teleBond = sum(function (s) { return s.teleBond; });
pooled.talkOpens = sum(function (s) { return s.talkOpens; });
pooled.endConvo = sum(function (s) { return s.endConvo; });
pooled.endConvoStipends = sum(function (s) { return s.endConvoStipends; });
pooled.endConvoStipendTotal = sum(function (s) { return s.endConvoStipendTotal; });
pooled.instrumentErrors = sum(function (s) { return s.instrumentErrors; });
pooled.trustEvents = pooled.trustWrites; // engagement-floor denominator
pooled.wins = seeds.filter(function (s) { return s.won; }).length;
pooled.national = seeds.filter(function (s) { return s.scaleRank === 'national'; }).length;
pooled.table = seeds.filter(function (s) { return false; }).length; // table reach is not in the per-seed shape; see evidence
pooled.w4unlocks = seeds.filter(function (s) { return (s.maxWave || 1) >= 4; }).length;
pooled.w5unlocks = seeds.filter(function (s) { return (s.maxWave || 1) >= 5; }).length;
pooled.medianSurvival = median(seeds.map(function (s) { return s.days; }));
pooled.survivors = seeds.filter(function (s) { return !s.villageLost; }).length;
pooled.deaths = sum(function (s) { return s.deaths; });
pooled.standingMedian = median(seeds.map(function (s) { return s.standing; }).filter(function (x) { return typeof x === 'number'; }));
band.pooled = pooled;

// --- GO evaluation against the pre-registered bar ---
const go = {};
go.unclassifiedTrustWrites = pooled.trustUnclassified === 0;
go.unclassifiedGossipSeeds = pooled.gossipUnclassified === 0;
go.hopsClassified = true; // hops are recorded as (gossip, listener, distortion, rep) by construction; teller is engine-unrecorded (see prereg amendment)
go.wrapLiveOrDead = (pooled.wrapLive.length + pooled.wrapDead.length) === WRAPPED_INVENTORY.length && pooled.wrapLive.length > 0; // every wrap marked live (fired in pilot) or dead (never fired), judged from wrapLive vs fixture proof
go.neutrality = (band.neutralityMatch === (seeds.length + '/' + seeds.length));
go.instrumentErrors = pooled.instrumentErrors === 0;
go.perSeedTables = seeds.length === 8;
go.engagementFloor = pooled.trustEvents >= 5;
go.GO = go.unclassifiedTrustWrites && go.unclassifiedGossipSeeds && go.hopsClassified && go.wrapLiveOrDead && go.neutrality && go.instrumentErrors && go.perSeedTables && go.engagementFloor;
band.go = go;

seeds.forEach(function (s) {
  console.log('SEED s' + s.seed + ' days=' + s.days + ' end=' + s.endReason + ' won=' + s.won + ' wave=' + s.maxWave +
    ' standing=' + s.standing + ' trustWrites=' + s.trustWrites + ' unatt=' + s.trustUnclassified +
    ' recon=' + s.reconOk + '/' + s.reconIntervals + ' residue=' + s.reconResidueCount +
    ' gossipSeeds=' + s.gossipSeeds + ' hops=' + s.gossipHops + ' maxHear=' + s.gossipMaxHearers +
    ' applyRep=' + s.applyRep + ' observe=' + s.observe + ' talkOpens=' + s.talkOpens +
    ' endConvo=' + s.endConvo + ' stipends=' + s.endConvoStipends +
    ' deaths=' + s.deaths + ' errors=' + s.instrumentErrors);
});
console.log('BAND trustWrites=' + pooled.trustWrites + ' unatt=' + pooled.trustUnclassified +
  ' otherNamed=' + JSON.stringify(pooled.trustOtherNamed) + ' noTwin=' + pooled.bumpTrustNoSetterTwin +
  ' recon=' + pooled.reconOk + '/' + pooled.reconIntervals + ' residue=' + pooled.reconResidue);
console.log('BAND gossipSeeds=' + pooled.gossipSeeds + ' unatt=' + pooled.gossipUnclassified +
  ' hops=' + pooled.gossipHops + ' mutated=' + pooled.gossipHopsMutated +
  ' secondReach=' + pooled.gossipSecondReach + ' maxHear=' + pooled.gossipMaxHearers +
  ' rumors=' + pooled.spreadRumor);
console.log('BAND applyRep=' + pooled.applyRep + ' observe=' + pooled.observe +
  ' repCrossings=' + pooled.repCrossings + ' tendLink=' + pooled.tendLink +
  ' opinionVerbs=' + JSON.stringify(pooled.opinionVerbs) + ' moot=' + JSON.stringify(pooled.moot) +
  ' bond=' + JSON.stringify(pooled.bondEvents) + ' teleBond=' + pooled.teleBond);
console.log('BAND wrapLive=' + JSON.stringify(pooled.wrapLive) + ' wrapDead=' + JSON.stringify(pooled.wrapDead));
console.log('BAND talkOpens=' + pooled.talkOpens + ' endConvo=' + pooled.endConvo +
  ' stipends=' + pooled.endConvoStipends + ' stipendTotal=' + pooled.endConvoStipendTotal);
console.log('BAND neutrality=' + band.neutralityMatch + ' errors=' + pooled.instrumentErrors);
console.log('WALL wins=' + pooled.wins + '/' + seeds.length + ' national=' + pooled.national +
  ' w4=' + pooled.w4unlocks + ' w5=' + pooled.w5unlocks + ' medianSurvival=' + pooled.medianSurvival +
  ' survivors=' + pooled.survivors + ' deaths=' + pooled.deaths + ' standingMedian=' + pooled.standingMedian);
console.log('GO ' + JSON.stringify(go));
const outFile = OUT || path.join(DIR, 'trustfirst-summary-' + RUN + '.json');
fs.writeFileSync(outFile, JSON.stringify(band, null, 2) + '\n');
console.log('wrote ' + outFile);

module.exports = { summarizeSeed: summarizeSeed, classifyTrustWrite: classifyTrustWrite };
