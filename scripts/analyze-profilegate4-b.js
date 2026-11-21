// analyze-profilegate4-b.js — classifier for arm sim-profilegate-b
// (SCOPED LEVER: relax the companion profile gate ONLY for wave-4+ plan
// holders, PROFILEGATE4=1 + plan.needWave >= 4). Reuses
// scripts/analyze-launchdef-a.js `classifySeed` (dawnbid/launchdef
// instance state machine + buckets, frozen precedence) and extends
// the `launched` bucket by the encounter join, adds the corpus-level
// stage-0 (seed-attach) and stage-3 (companion pool) tables, the
// gate-stage join, and the skip-`other` post-hoc reclassification
// (launchdef's known instrument limitation: a holder who departs as
// a companion in the SAME tick reads clean pre-tick and records
// `other`; those rows are reclassified `away-as-companion-this-tick`
// when a same-day depart row shows the holder leaving as someone
// else's companion).
// Profilegate4 additions (frozen prereg): per-leg pool-shape table
// computed on the needWave>=4 subset for B1 (plus the all-dawns table
// alongside), the damage-wall table (B4, tracked: per fought meeting,
// mDealt / derived monster max HP), wave-4+ launch-event totals, and
// arm-only starvation deaths (matched same-seed same-day). B5 adds the
// corpus-anchor check (every file's anchorCommit starts with
// 2b97163b0). The OFF-leg replication section is DROPPED (fresh band)
// and replaced by the anchor + substrate report. Legs:
// on (judged) / off (control) / rec (D2 vs on) / rec0 (D2 vs off);
// both seed-fed legs carry the full frozen substrate.
//
// Frozen precedence per instance (first match wins):
//   launched-killed > launched-fought-no-kill > launched-no-meeting
//   (split of launchdef `launched`, by the encounter join)
//   > target-killed > selected-blocked > bid-not-selected
//   > plan-churned-before-dawn > candidate-not-bid > unknown.
// Stage-0 (seed-attach) and stage-3 (pool) are corpus-level tables,
// not instance buckets — the pool is measured where the bid dies,
// via the candidate-not-bid sub.
//
// Launch window (seedland-b rule, reused): [launchDay, closeDay]
// where closeDay is the instance close day or the final day if still
// open. Meeting join: a v4encounters row counts iff its day is in
// the window AND its mid equals the instance target AND its fighter
// (vid) is the holder or a launched companion of that launch (or its
// allyVid is). Gate join: v4gates rows with vid in the launched
// party, mid == target, day in window.
// Damage-share derivation (B4): a fought meeting's monster max HP is
// read off the fight log's first `strikes for N (M left)` line as
// N + M (the launchfunnel 909-HP derivation); when no line parses,
// the src/data/monsters.json hp-range midpoint is used and the
// meeting is flagged via 'range-mid'.
// Usage:
//   node scripts/analyze-profilegate4-b.js <onDir> [offDir] [recDir] [rec0Dir]
// Writes evidence/2026-11-21/profilegate4-b-analysis.json. Exits 0
// iff the frozen bars B1+B2+B3+B5 all pass (B4 tracked, never judged).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const LAUNCHDEF = require('./analyze-launchdef-a.js');
const classifySeed = LAUNCHDEF.classifySeed;

const W4_IDS_FROZEN = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'];
const W4_SET = new Set(W4_IDS_FROZEN);
const FUNNEL_BUCKETS = ['launched-killed', 'launched-fought-no-kill', 'launched-no-meeting',
  'target-killed', 'selected-blocked', 'bid-not-selected',
  'plan-churned-before-dawn', 'candidate-not-bid', 'unknown'];

let WAVE_BY_ID = {};
let HP_BY_ID = {};
try {
  const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
  const list = raw.monsters || raw;
  for (const m of list) {
    WAVE_BY_ID[m.id] = m.wave | 0;
    if (Array.isArray(m.hp) && m.hp.length === 2) HP_BY_ID[m.id] = [m.hp[0] | 0, m.hp[1] | 0];
    else if (typeof m.hp === 'number') HP_BY_ID[m.id] = [m.hp | 0, m.hp | 0];
  }
} catch (e) {}

// deriveMaxHp(enc): the launchfunnel 909-HP derivation — first fight-log
// line "strikes for N (M left)" implies spawn HP N + M. Null when no
// line parses (caller falls back to the hp-range midpoint).
function deriveMaxHp(enc) {
  const log = (enc && enc.log) || [];
  for (let i = 0; i < log.length; i++) {
    const m = /strikes for (\d+) \((\d+) left\)/.exec(String(log[i]));
    if (m) return parseInt(m[1], 10) + parseInt(m[2], 10);
  }
  return null;
}
function rangeMidHp(mid) {
  const r = HP_BY_ID[mid];
  if (!r) return null;
  return (r[0] + r[1]) / 2;
}

function loadDir(dir) {
  const out = {};
  const files = fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort();
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    out[j.seed] = j;
  }
  return { bySeed: out, files: files };
}
function round(x, n) { return Math.round(x * Math.pow(10, n)) / Math.pow(10, n); }
function med(a) {
  if (!a.length) return null;
  const s = a.slice().sort(function (x, y) { return x - y; });
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

function funnelForSeed(j) {
  const seeds = (j.v4seeds || []).slice();
  const departs = (j.dawnbidDeparts || []).slice();
  const v4departs = (j.v4departs || []).slice();
  const encounters = (j.v4encounters || []).slice();
  const gates = (j.v4gates || []).slice();
  const skips = (j.launchdefSkips || []).slice();
  const pool = (j.companionPool || []).slice();
  const finalDay = j.gameDays || j.days || 0;

  // ---- Skip `other` reclassification (launchdef limitation) ----
  // Runs BEFORE classifySeed, so instance subs carry the corrected
  // reason. An `other` skip row is reclassified
  // `away-as-companion-this-tick` when a depart row the same day shows
  // the holder leaving as someone else's companion (or in someone
  // else's party). The raw reason is kept on `rawReason`.
  let otherReclassified = 0;
  for (const r of skips) {
    r.rawReason = r.reason || 'missing';
    if (r.reason === 'other') {
      let asCompanion = false;
      for (const d of departs) {
        if (d.day === r.day && d.result === 'launch' && d.vid !== r.vid &&
          (d.companion === r.vid || ((d.party || []).indexOf(r.vid) !== -1))) { asCompanion = true; break; }
      }
      if (!asCompanion) for (const d of v4departs) {
        if (d.day === r.day && d.result === 'launch' && d.vid !== r.vid &&
          (((d.party || []).indexOf(r.vid) !== -1) || d.companion === r.vid || d.companion2 === r.vid)) { asCompanion = true; break; }
      }
      if (asCompanion) { r.reason = 'away-as-companion-this-tick'; otherReclassified++; }
    }
  }
  const skipReasons = {};
  for (const r of skips) skipReasons[r.reason || 'missing'] = (skipReasons[r.reason || 'missing'] || 0) + 1;

  const c = classifySeed(j, { launchDefinition: 'any-commit' });

  // ---- Stage 0: seed-attach (corpus-level) ----
  // A wave-4+ seed row "attaches" iff it opened an instance or
  // refreshed one (an instance with the same vid+target spans the
  // row's day); otherwise it is non-attaching (landed on a plan not
  // aimed at the fled type, or on no plan at all).
  const attach = { byPath: {}, attached: 0, nonAttaching: 0, wave4Rows: 0, targetNull: 0 };
  for (const s of seeds) {
    if ((s.wave | 0) < 4) continue;
    attach.wave4Rows++;
    attach.byPath[s.path || 'missing'] = (attach.byPath[s.path || 'missing'] || 0) + 1;
    if (!s.target) attach.targetNull++;
    let hit = false;
    for (const inst of c.instances) {
      if (inst.vid === s.vid && inst.target === s.target &&
        s.day >= inst.seedDay && (inst.closeDay == null || s.day <= inst.closeDay)) { hit = true; break; }
    }
    if (hit) attach.attached++; else attach.nonAttaching++;
  }

  // ---- Stage 3: companion pool (corpus-level, per scored dawn) ----
  // PROFILEGATE4 (SCOPED): B1 is judged on the needWave>=4 subset only
  // (pool rows carry needWave from the driver; rows with needWave null
  // or < 4 are the old-gate population). The all-dawns table is
  // computed alongside so the scope's effect stays visible.
  // poolShapeOf(rows): the pool-shape extras — eligible-sum (for the
  // mean), the picked companion's profile per dawn, replica/real agree
  // rate, and the would-be-notRanger count (members failing profile
  // under the OLD gate — the leg-comparable pool price).
  function poolShapeOf(rows) {
    const dist = { dawns: 0, eligible0: 0, eligible1: 0, eligible2: 0, eligible3plus: 0 };
    const fails = {};
    const members = { n: 0, notRangerAlone: 0, notRanger: 0, away: 0, trustLow: 0 };
    let eligSum = 0, gateOpenRows = 0, agreeTrue = 0, agreeFalse = 0, wouldBeNotRanger = 0;
    const pickedProfiles = {};
    for (const row of rows) {
      dist.dawns++;
      const n = (row.eligible || []).length;
      eligSum += n;
      if (row.profileGateOpen) gateOpenRows++;
      if (n === 0) dist.eligible0++;
      else if (n === 1) dist.eligible1++;
      else if (n === 2) dist.eligible2++;
      else dist.eligible3plus++;
      const counts = row.counts || {};
      for (const k of Object.keys(counts)) fails[k] = (fails[k] || 0) + (counts[k] | 0);
      if (row.agree === true) agreeTrue++;
      else if (row.agree === false) agreeFalse++;
      if (row.bidCompanion) {
        let prof = null;
        for (const m of (row.members || [])) if (m.id === row.bidCompanion) { prof = m.profile; break; }
        const key = prof || 'unknown';
        pickedProfiles[key] = (pickedProfiles[key] || 0) + 1;
      }
      for (const m of (row.members || [])) {
        if (m.firstFail === 'selfOrScholar') continue;
        members.n++;
        if (m.profile !== 'wanderer' && m.profile !== 'explorer') wouldBeNotRanger++;
        if (m.firstFail === 'notRanger') members.notRanger++;
        if (m.away) members.away++;
        if (m.trust != null && m.trust < 15) members.trustLow++;
        // Alone = notRanger first-fail AND no other flag true.
        if (m.firstFail === 'notRanger' && !m.away && !(m.node == null) && !m.engaged && !m.onExped && m.alive) members.notRangerAlone++;
      }
    }
    return {
      dist: dist, fails: fails, members: members,
      shape: {
        dawns: dist.dawns, empty: dist.eligible0,
        emptyShare: dist.dawns ? round(dist.eligible0 / dist.dawns, 4) : null,
        meanEligible: dist.dawns ? round(eligSum / dist.dawns, 3) : null,
        eligSum: eligSum, gateOpenRows: gateOpenRows,
        pickedProfiles: pickedProfiles,
        agreeTrue: agreeTrue, agreeFalse: agreeFalse,
        agreeRate: (agreeTrue + agreeFalse) ? round(agreeTrue / (agreeTrue + agreeFalse), 4) : null,
        wouldBeNotRanger: wouldBeNotRanger,
      },
    };
  }
  const poolV4 = pool.filter(function (r) { return ((r.needWave | 0) >= 4); });
  const v4 = poolShapeOf(poolV4);
  const all = poolShapeOf(pool);
  const poolDist = v4.dist;
  const firstFails = v4.fails;
  const poolMembers = v4.members;
  const poolShape = v4.shape;
  const poolShapeAll = all.shape;

  // ---- Skip reasons (tallied from the reclassified rows above) ----

  // ---- Launched split (encounter + gate joins) ----
  const gateJoined = { seek: 0, avoid: 0, null: 0, other: 0, trickKnownSeek: 0, trickKnownNull: 0, trickKnownAvoid: 0 };
  for (const inst of c.instances) {
    if (inst.bucket !== 'launched') continue;
    const launch = (inst.resolved || []).find(function (r) { return r.outcome === 'launched'; });
    if (!launch) { inst.funnelBucket = 'unknown'; inst.funnelSub = 'launched-no-resolved'; continue; }
    const launchDay = launch.day;
    const closeDay = inst.closeDay != null ? inst.closeDay : finalDay;
    // Launched party: holder + resolved companion + depart-row party.
    const party = [inst.vid];
    if (launch.companion) party.push(launch.companion);
    for (const d of departs) {
      if (d.vid === inst.vid && d.day === launchDay && d.result === 'launch') {
        if (d.companion && party.indexOf(d.companion) === -1) party.push(d.companion);
        for (const p of (d.party || [])) if (party.indexOf(p) === -1) party.push(p);
      }
    }
    for (const d of v4departs) {
      if (d.vid === inst.vid && d.day === launchDay && d.result === 'launch') {
        for (const p of (d.party || []).concat([d.companion, d.companion2])) {
          if (p && party.indexOf(p) === -1) party.push(p);
        }
      }
    }
    inst.launchDay = launchDay;
    inst.launchParty = party.slice();
    inst.launchPartySize = party.length;
    inst.launchCommitKind = launch.commitKind || null;
    const meetings = encounters.filter(function (e) {
      if (e.mid !== inst.target) return false;
      if (e.day < launchDay || e.day > closeDay) return false;
      if (e.vid === inst.vid || party.indexOf(e.vid) !== -1) return true;
      if (e.allyVid && (e.allyVid === inst.vid || party.indexOf(e.allyVid) !== -1)) return true;
      return false;
    });
    inst.meetings = meetings.map(function (e) {
      let maxHp = deriveMaxHp(e);
      let via = 'log';
      if (maxHp == null) { maxHp = rangeMidHp(e.mid); via = 'range-mid'; }
      return { day: e.day, vid: e.vid, mid: e.mid, outcome: e.outcome || null,
        rounds: e.rounds, vTaken: e.vTaken, mDealt: e.mDealt, origin: e.origin || null,
        maxHp: maxHp, maxHpVia: via };
    });
    const kills = meetings.filter(function (e) { return e.outcome === 'vKill'; });
    inst.meetingKills = kills.length;
    // Gate rows for the same joined meetings.
    const myGates = gates.filter(function (g) {
      return g.mid === inst.target && g.day >= launchDay && g.day <= closeDay &&
        (g.vid === inst.vid || party.indexOf(g.vid) !== -1);
    });
    inst.gateRows = myGates.map(function (g) {
      return { day: g.day, vid: g.vid, result: g.result, reason: g.reason || null,
        partySize: g.partySize, trickKnown: !!g.trickKnown };
    });
    for (const g of myGates) {
      if (g.result === 'seek') { gateJoined.seek++; if (g.trickKnown) gateJoined.trickKnownSeek++; }
      else if (g.result === 'avoid') { gateJoined.avoid++; if (g.trickKnown) gateJoined.trickKnownAvoid++; }
      else if (g.result === 'null') { gateJoined.null++; if (g.trickKnown) gateJoined.trickKnownNull++; }
      else gateJoined.other++;
    }
    if (kills.length) { inst.funnelBucket = 'launched-killed'; inst.funnelSub = 'kills:' + kills.length; }
    else if (meetings.length) {
      inst.funnelBucket = 'launched-fought-no-kill';
      const outs = {};
      for (const m of meetings) outs[m.outcome || 'missing'] = (outs[m.outcome || 'missing'] || 0) + 1;
      inst.funnelSub = Object.keys(outs).sort().map(function (k) { return k + ':' + outs[k]; }).join(',');
    } else { inst.funnelBucket = 'launched-no-meeting'; inst.funnelSub = 'window:' + launchDay + '-' + closeDay; }
  }
  // Non-launched instances keep their launchdef bucket as the funnel bucket.
  for (const inst of c.instances) {
    if (!inst.funnelBucket) { inst.funnelBucket = inst.bucket; inst.funnelSub = inst.sub; }
  }
  // ---- Damage wall (B4, TRACKED not judged) + launch events ----
  const damage = { meetings: 0, pooledDealt: 0, pooledMaxHp: 0, pooledShare: null, derived: 0, fallback: 0, perMeeting: [] };
  for (const inst of c.instances) {
    for (const mt of (inst.meetings || [])) {
      if (mt.maxHp == null) continue;
      damage.meetings++;
      damage.pooledDealt += mt.mDealt || 0;
      damage.pooledMaxHp += mt.maxHp;
      if (mt.maxHpVia === 'log') damage.derived++; else damage.fallback++;
      damage.perMeeting.push({ day: mt.day, vid: mt.vid, mid: mt.mid, mDealt: mt.mDealt || 0,
        maxHp: mt.maxHp, share: round((mt.mDealt || 0) / mt.maxHp, 4), via: mt.maxHpVia });
    }
  }
  if (damage.pooledMaxHp) damage.pooledShare = round(damage.pooledDealt / damage.pooledMaxHp, 4);
  // Wave-4+ launch events (dawnbidDeparts, any commit): the secondary
  // launch count behind the instance-based B2 bar.
  let launchEventsW4 = 0, launchEventsAll = 0;
  for (const d of departs) {
    if (d.result !== 'launch' || d.winPlanAction !== 'party_launch') continue;
    launchEventsAll++;
    if (d.target && (WAVE_BY_ID[d.target] | 0) >= 4) launchEventsW4++;
  }
  const byFunnel = {};
  for (const b of FUNNEL_BUCKETS) byFunnel[b] = 0;
  const byFunnelSub = {};
  for (const inst of c.instances) {
    byFunnel[inst.funnelBucket] = (byFunnel[inst.funnelBucket] || 0) + 1;
    const k = inst.funnelBucket + ':' + (inst.funnelSub || '');
    byFunnelSub[k] = (byFunnelSub[k] || 0) + 1;
  }
  // Corpus-wide gate table (all wave-4+ rows, context for stage 5).
  const gateAll = { seek: 0, avoid: 0, null: 0, other: 0, trickKnown: 0, rows: 0 };
  for (const g of gates) {
    gateAll.rows++;
    if (g.result === 'seek') gateAll.seek++;
    else if (g.result === 'avoid') gateAll.avoid++;
    else if (g.result === 'null') gateAll.null++;
    else gateAll.other++;
    if (g.trickKnown) gateAll.trickKnown++;
  }
  const launchedSizes = {};
  for (const inst of c.instances) {
    if (inst.funnelBucket && inst.funnelBucket.indexOf('launched-') === 0 && inst.launchPartySize) {
      launchedSizes[inst.launchPartySize] = (launchedSizes[inst.launchPartySize] || 0) + 1;
    }
  }
  return {
    seed: j.seed, days: j.days, gameDays: j.gameDays, endReason: j.endReason,
    standing: j.standing, scaleRank: j.scaleRank, won: !!j.won, maxWave: j.maxWave,
    villageLost: !!j.villageLost,
    instrumentErrors: c.instrumentErrors,
    seedCallsW4: c.seedCallsW4, nonOpeningSeeds: c.nonOpeningSeeds,
    instancesOpened: c.instancesOpened,
    byBucket: c.byBucket, bySub: c.bySub,
    byFunnel: byFunnel, byFunnelSub: byFunnelSub,
    attach: attach, poolDist: poolDist, firstFails: firstFails,
    poolMembers: poolMembers, poolShape: poolShape, poolShapeAll: poolShapeAll, damage: damage,
    launchEventsW4: launchEventsW4, launchEventsAll: launchEventsAll, skipReasons: skipReasons,
    otherReclassified: otherReclassified,
    gateJoined: gateJoined, gateAll: gateAll, launchedSizes: launchedSizes,
    instances: c.instances,
  };
}

function summarize(leg) {
  const seeds = Object.keys(leg.bySeed).sort().map(function (k) { return leg.bySeed[k]; });
  const byFunnel = {}, byBucket = {}, bySub = {}, byFunnelSub = {};
  for (const b of FUNNEL_BUCKETS) byFunnel[b] = 0;
  for (const b of LAUNCHDEF.BUCKETS) byBucket[b] = 0;
  const attach = { byPath: {}, attached: 0, nonAttaching: 0, wave4Rows: 0, targetNull: 0 };
  const poolDist = { dawns: 0, eligible0: 0, eligible1: 0, eligible2: 0, eligible3plus: 0 };
  const firstFails = {};
  const skipReasons = {};
  const gateJoined = { seek: 0, avoid: 0, null: 0, other: 0, trickKnownSeek: 0, trickKnownNull: 0, trickKnownAvoid: 0 };
  const gateAll = { seek: 0, avoid: 0, null: 0, other: 0, trickKnown: 0, rows: 0 };
  const launchedSizes = {};
  const poolShapeAgg = { dawns: 0, empty: 0, eligSum: 0, gateOpenRows: 0, agreeTrue: 0, agreeFalse: 0, wouldBeNotRanger: 0, pickedProfiles: {} };
  const poolShapeAllAgg = { dawns: 0, empty: 0, eligSum: 0, gateOpenRows: 0, agreeTrue: 0, agreeFalse: 0, wouldBeNotRanger: 0, pickedProfiles: {} };
  function aggPoolShape(agg, sh) {
    if (!sh) return;
    agg.dawns += sh.dawns || 0; agg.empty += sh.empty || 0;
    agg.eligSum += sh.eligSum || 0; agg.gateOpenRows += sh.gateOpenRows || 0;
    agg.agreeTrue += sh.agreeTrue || 0; agg.agreeFalse += sh.agreeFalse || 0;
    agg.wouldBeNotRanger += sh.wouldBeNotRanger || 0;
    for (const k of Object.keys(sh.pickedProfiles || {})) agg.pickedProfiles[k] = (agg.pickedProfiles[k] || 0) + sh.pickedProfiles[k];
  }
  function shapeFromAgg(agg) {
    return {
      dawns: agg.dawns, empty: agg.empty,
      emptyShare: agg.dawns ? round(agg.empty / agg.dawns, 4) : null,
      meanEligible: agg.dawns ? round(agg.eligSum / agg.dawns, 3) : null,
      eligSum: agg.eligSum, gateOpenRows: agg.gateOpenRows,
      pickedProfiles: agg.pickedProfiles,
      agreeTrue: agg.agreeTrue, agreeFalse: agg.agreeFalse,
      agreeRate: (agg.agreeTrue + agg.agreeFalse) ? round(agg.agreeTrue / (agg.agreeTrue + agg.agreeFalse), 4) : null,
      wouldBeNotRanger: agg.wouldBeNotRanger,
    };
  }
  const damageAgg = { meetings: 0, pooledDealt: 0, pooledMaxHp: 0, derived: 0, fallback: 0, perMeeting: [] };
  let launchEventsW4 = 0, launchEventsAll = 0;
  let opened = 0, seedCalls = 0, otherReclassified = 0;
  const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
  for (const s of seeds) {
    opened += s.instancesOpened;
    seedCalls += s.seedCallsW4;
    otherReclassified += s.otherReclassified;
    for (const b of FUNNEL_BUCKETS) byFunnel[b] += s.byFunnel[b] || 0;
    for (const b of LAUNCHDEF.BUCKETS) byBucket[b] += s.byBucket[b] || 0;
    for (const k of Object.keys(s.byFunnelSub || {})) byFunnelSub[k] = (byFunnelSub[k] || 0) + s.byFunnelSub[k];
    for (const k of Object.keys(s.bySub || {})) bySub[k] = (bySub[k] || 0) + s.bySub[k];
    for (const k of Object.keys(s.attach.byPath || {})) attach.byPath[k] = (attach.byPath[k] || 0) + s.attach.byPath[k];
    attach.attached += s.attach.attached; attach.nonAttaching += s.attach.nonAttaching;
    attach.wave4Rows += s.attach.wave4Rows; attach.targetNull += s.attach.targetNull;
    poolDist.dawns += s.poolDist.dawns; poolDist.eligible0 += s.poolDist.eligible0;
    poolDist.eligible1 += s.poolDist.eligible1; poolDist.eligible2 += s.poolDist.eligible2;
    poolDist.eligible3plus += s.poolDist.eligible3plus;
    if (s.poolShape) aggPoolShape(poolShapeAgg, s.poolShape);
    if (s.poolShapeAll) aggPoolShape(poolShapeAllAgg, s.poolShapeAll);
    if (s.damage) {
      damageAgg.meetings += s.damage.meetings || 0; damageAgg.pooledDealt += s.damage.pooledDealt || 0;
      damageAgg.pooledMaxHp += s.damage.pooledMaxHp || 0; damageAgg.derived += s.damage.derived || 0;
      damageAgg.fallback += s.damage.fallback || 0;
      damageAgg.perMeeting = damageAgg.perMeeting.concat(s.damage.perMeeting || []);
    }
    launchEventsW4 += s.launchEventsW4 || 0; launchEventsAll += s.launchEventsAll || 0;
    for (const k of Object.keys(s.firstFails || {})) firstFails[k] = (firstFails[k] || 0) + s.firstFails[k];
    for (const k of Object.keys(s.skipReasons || {})) skipReasons[k] = (skipReasons[k] || 0) + s.skipReasons[k];
    for (const k of Object.keys(gateJoined)) gateJoined[k] += s.gateJoined[k] || 0;
    for (const k of Object.keys(gateAll)) gateAll[k] += s.gateAll[k] || 0;
    for (const k of Object.keys(s.launchedSizes || {})) launchedSizes[k] = (launchedSizes[k] || 0) + s.launchedSizes[k];
  }
  const classified = opened - byFunnel.unknown;
  // Ranked leak table: instance buckets that DIE at a stage (kills and
  // target-killed are not leaks), ranked by count desc, then by stage order.
  const STAGE_ORDER = ['candidate-not-bid', 'bid-not-selected', 'selected-blocked',
    'plan-churned-before-dawn', 'launched-no-meeting', 'launched-fought-no-kill'];
  const ranked = STAGE_ORDER.map(function (b) {
    return { stage: b, count: byFunnel[b] || 0, share: opened ? round((byFunnel[b] || 0) / opened, 3) : null };
  }).sort(function (a, b) { return b.count - a.count; });
  const poolShape = shapeFromAgg(poolShapeAgg);
  const poolShapeAll = shapeFromAgg(poolShapeAllAgg);
  const damage = {
    meetings: damageAgg.meetings, pooledDealt: damageAgg.pooledDealt, pooledMaxHp: damageAgg.pooledMaxHp,
    pooledShare: damageAgg.pooledMaxHp ? round(damageAgg.pooledDealt / damageAgg.pooledMaxHp, 4) : null,
    derived: damageAgg.derived, fallback: damageAgg.fallback, perMeeting: damageAgg.perMeeting,
  };
  const launchedInstances = (byFunnel['launched-killed'] || 0) + (byFunnel['launched-fought-no-kill'] || 0) + (byFunnel['launched-no-meeting'] || 0);
  return {
    files: leg.files.length,
    seeds: seeds.length,
    seedCallsW4: seedCalls,
    instancesOpened: opened,
    byFunnel: byFunnel, byBucket: byBucket, bySub: bySub, byFunnelSub: byFunnelSub,
    rankedLeaks: ranked,
    bindingStage: ranked.length && ranked[0].count > 0 ? ranked[0].stage : null,
    bindingCount: ranked.length ? ranked[0].count : 0,
    classifiedShare: opened ? round(classified / opened, 4) : null,
    unknown: byFunnel.unknown,
    attach: attach, poolDist: poolDist, firstFails: firstFails,
    poolShape: poolShape, poolShapeAll: poolShapeAll, damage: damage, launchedInstances: launchedInstances,
    launchEventsW4: launchEventsW4, launchEventsAll: launchEventsAll,
    skipReasons: skipReasons, otherReclassified: otherReclassified,
    gateJoined: gateJoined, gateAll: gateAll, launchedSizes: launchedSizes,
    survived: seeds.filter(function (s) { return !s.villageLost; }).length,
    medianSurvival: med(seeds.map(function (s) { return s.gameDays || s.days || 0; })),
    wall: {
      nationalStanding: seeds.filter(function (s) { return (s.standing || 0) >= 200; }).length,
      nationalRank: seeds.filter(function (s) { return (RANK_ORDER[s.scaleRank] || 0) >= 2; }).length,
      table: 0, wins: seeds.filter(function (s) { return !!s.won; }).length,
      wave4: seeds.filter(function (s) { return (s.maxWave || 1) >= 4; }).length,
      wave5: seeds.filter(function (s) { return (s.maxWave || 1) >= 5; }).length,
      deaths: null, starvation: null,
    },
    perSeed: seeds,
  };
}

function starvOf(rawBySeed) {
  let total = 0, deaths = 0;
  const perSeed = {};
  for (const k of Object.keys(rawBySeed)) {
    const j = rawBySeed[k];
    deaths += (j.deaths || []).length;
    const st = (j.deaths || []).filter(function (d) { return d.cause === 'starvation'; }).length;
    perSeed[j.seed] = st;
    total += st;
  }
  return { total: total, deaths: deaths, perSeed: perSeed };
}

// armOnlyStarv(aRaw, bRaw): starvation deaths in A on (seed,day) pairs
// with no starvation death in B — the matched same-seed same-day cost.
function armOnlyStarv(aRaw, bRaw) {
  const bKeys = {};
  for (const k of Object.keys(bRaw)) {
    const j = bRaw[k];
    for (const d of (j.deaths || [])) if (d.cause === 'starvation') bKeys[j.seed + ':' + d.day] = true;
  }
  let n = 0;
  for (const k of Object.keys(aRaw)) {
    const j = aRaw[k];
    for (const d of (j.deaths || [])) if (d.cause === 'starvation' && !bKeys[j.seed + ':' + d.day]) n++;
  }
  return n;
}

function d2DivCount(aRaw, bDir) {
  // Trajectory fingerprints between two legs (launchfunnel D2 shape).
  let div = 0;
  const b = loadDir(bDir).bySeed;
  for (const k of Object.keys(aRaw)) {
    const a = aRaw[k], bb = b[k];
    if (!bb) { div++; continue; }
    const fa = JSON.stringify({ d: (a.daily || []).map(function (x) { return x.day; }), g: a.gameDays, s: a.standing, w: a.maxWave, de: (a.deaths || []).length });
    const fb = JSON.stringify({ d: (bb.daily || []).map(function (x) { return x.day; }), g: bb.gameDays, s: bb.standing, w: bb.maxWave, de: (bb.deaths || []).length });
    if (fa !== fb) div++;
  }
  return div;
}

// computeBars(o): the frozen B1–B5 judgement, factored out of main() so
// the proof test can judge fixture summaries directly. o: { on, off,
// onStarvTotal, offStarvTotal, armOnlyOn, armOnlyOff, d2On, d2Off,
// w4Match, anchorAll, files: {on,off,rec,rec0}, errors: {on,off,rec,rec0} }.
// B1 reads the needWave>=4 pool shape (on.poolShape). B4 is tracked,
// never judged (returned as data).
// B1 bar (frozen, scoped): ON empty share ≤ 0.47 (half the poolfirstfail
// needWave>=4 OFF baseline 0.9495) AND mean eligible ≥ 1.5.
function computeBars(o) {
  const on = o.on, off = o.off;
  const onPool = on.poolShape;
  const bar1 = onPool.dawns > 0 && onPool.emptyShare != null && onPool.emptyShare <= 0.47 &&
    onPool.meanEligible != null && onPool.meanEligible >= 1.5;
  const bar2 = off != null && on.launchedInstances >= 5 &&
    on.launchedInstances > off.launchedInstances;
  const bar3 = off != null &&
    o.onStarvTotal <= o.offStarvTotal + 2 &&
    o.armOnlyOn <= o.armOnlyOff + 2 &&
    on.medianSurvival != null && off.medianSurvival != null &&
    on.medianSurvival >= 0.8 * off.medianSurvival;
  const bar4 = { tracked: true, pooledShare: on.damage.pooledShare, meetings: on.damage.meetings,
    perMeeting: on.damage.perMeeting, launchfunnelShare: 0.085 };
  const bar5 = o.files.on === 8 && (off == null || o.files.off === 8) &&
    (o.files.rec == null || o.files.rec === 8) && (o.files.rec0 == null || o.files.rec0 === 8) &&
    o.errors.on === 0 && o.errors.off === 0 && o.errors.rec === 0 && o.errors.rec0 === 0 && !!o.w4Match &&
    o.anchorAll === true &&
    (o.d2On == null || o.d2On === 0) && (o.d2Off == null || o.d2Off === 0) &&
    on.classifiedShare >= 0.9 && on.unknown === 0;
  return { bar1: bar1, bar2: bar2, bar3: bar3, bar4: bar4, bar5: bar5,
    verdict: (bar1 && bar2 && bar3 && bar5) ? 'GO' : 'NO-GO' };
}

// anchorReport(bySeed): B5 corpus-anchor check — every corpus file's
// anchorCommit must start with the frozen base 2b97163b0 (the anchor
// rule: judged legs run before any commit, so HEAD is still the frozen
// base when the driver stamps). Returns { allMatch, anchors, badSeeds }.
// bySeed maps seed -> parsed corpus JSON (loadDir's bySeed shape).
const ANCHOR12 = '2b97163b0';
function anchorReport(bySeed) {
  const anchors = {};
  const badSeeds = [];
  for (const k of Object.keys(bySeed).sort()) {
    const j = bySeed[k] || {};
    const a = (j.anchorCommit || '').slice(0, 12);
    anchors[j.seed != null ? j.seed : k] = a || null;
    if ((j.anchorCommit || '').indexOf(ANCHOR12) !== 0) badSeeds.push(j.seed != null ? j.seed : k);
  }
  return { allMatch: badSeeds.length === 0, anchors: anchors, badSeeds: badSeeds };
}

function main() {
  const onDir = process.argv[2];
  const offDir = process.argv[3] || null;
  const recDir = process.argv[4] || null;
  const rec0Dir = process.argv[5] || null;
  if (!onDir) { console.error('PROFILEGATE4 ANALYZE STOP: onDir required.'); process.exit(2); }
  let liveW4 = null;
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    liveW4 = list.filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
  } catch (e) {}
  const frozenSorted = W4_IDS_FROZEN.slice().sort();
  const w4Match = liveW4 && JSON.stringify(liveW4) === JSON.stringify(frozenSorted);

  function summarizeLeg(dir) {
    const raw = loadDir(dir);
    const leg = loadDir(dir);
    for (const k of Object.keys(leg.bySeed)) leg.bySeed[k] = funnelForSeed(leg.bySeed[k]);
    const s = summarize(leg);
    const st = starvOf(raw.bySeed);
    s.wall.deaths = st.deaths;
    s.wall.starvation = st.total;
    return { summary: s, raw: raw, files: leg.files.length };
  }

  const on = summarizeLeg(onDir);
  const onSummary = on.summary, onRaw = on.raw;
  let offSummary = null, offRaw = null, offFiles = null;
  if (offDir) { const o = summarizeLeg(offDir); offSummary = o.summary; offRaw = o.raw; offFiles = o.files; }
  let recSummary = null, recFiles = null;
  if (recDir) { const r = summarizeLeg(recDir); recSummary = r.summary; recFiles = r.files; }
  let rec0Summary = null, rec0Files = null;
  if (rec0Dir) { const r0 = summarizeLeg(rec0Dir); rec0Summary = r0.summary; rec0Files = r0.files; }

  const onErrors = onSummary.perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0);
  const offErrors = offSummary ? offSummary.perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0) : 0;
  const recErrors = recSummary ? recSummary.perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0) : 0;
  const rec0Errors = rec0Summary ? rec0Summary.perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0) : 0;

  // D2 full-band: rec ≡ on, rec0 ≡ off (0 divergences).
  const d2On = recDir ? d2DivCount(onRaw.bySeed, recDir) : null;
  const d2Off = (rec0Dir && offRaw) ? d2DivCount(offRaw.bySeed, rec0Dir) : null;

  // Anchor + substrate report (fresh band — nothing to replicate
  // against; the parent's OFF-leg replication section is DROPPED and
  // replaced by this). Every corpus file's anchorCommit must start
  // with the frozen base 2b97163b0 (part of B5); policy sha + the
  // frozen substrate flags are reported per leg.
  const SUBSTRATE_FLAGS = ['SENSEEXPED=1', 'PARTYSIZE4=1', 'VETREENGAGE=1', 'FIGHTALLY2=1', 'ALLYSLOT3=1', 'LAUNCHSURVIVE=1'];
  function legAnchorReport(raw) {
    if (!raw) return null;
    const rep = anchorReport(raw.bySeed);
    let policySha = null;
    const keys = Object.keys(raw.bySeed).sort();
    if (keys.length) policySha = raw.bySeed[keys[0]].policySha || null;
    return { allMatch: rep.allMatch, anchors: rep.anchors, badSeeds: rep.badSeeds, policySha: policySha };
  }
  const anchors = {
    on: legAnchorReport(onRaw),
    off: offRaw ? legAnchorReport(offRaw) : null,
    rec: recDir ? legAnchorReport(loadDir(recDir)) : null,
    rec0: rec0Dir ? legAnchorReport(loadDir(rec0Dir)) : null,
  };
  const anchorAll = [anchors.on, anchors.off, anchors.rec, anchors.rec0]
    .filter(function (a) { return a != null; }).every(function (a) { return a.allMatch; });

  const onStarv = starvOf(onRaw.bySeed);
  const offStarv = offRaw ? starvOf(offRaw.bySeed) : null;
  const armOnlyOn = offRaw ? armOnlyStarv(onRaw.bySeed, offRaw.bySeed) : null;
  const armOnlyOff = offRaw ? armOnlyStarv(offRaw.bySeed, onRaw.bySeed) : null;

  // Frozen bars B1–B5 (B4 tracked, never judged).
  const bars = computeBars({
    on: onSummary, off: offSummary,
    onStarvTotal: onStarv.total, offStarvTotal: offStarv ? offStarv.total : null,
    armOnlyOn: armOnlyOn, armOnlyOff: armOnlyOff,
    d2On: d2On, d2Off: d2Off, w4Match: !!w4Match, anchorAll: anchorAll,
    files: { on: on.files, off: offFiles, rec: recFiles, rec0: rec0Files },
    errors: { on: onErrors, off: offErrors, rec: recErrors, rec0: rec0Errors },
  });
  const bar1 = bars.bar1, bar2 = bars.bar2, bar3 = bars.bar3, bar4 = bars.bar4, bar5 = bars.bar5;

  const out = {
    arm: 'profilegate4-b', run: 'profilegate4-b',
    onDir: path.basename(onDir), offDir: offDir ? path.basename(offDir) : null,
    recDir: recDir ? path.basename(recDir) : null, rec0Dir: rec0Dir ? path.basename(rec0Dir) : null,
    wave4IdsMatch: !!w4Match, wave4IdsLive: liveW4, wave4IdsFrozen: frozenSorted,
    on: onSummary, off: offSummary, rec: recSummary, rec0: rec0Summary,
    d2DivergencesOn: d2On, d2DivergencesOff: d2Off,
    starvation: { onTotal: onStarv.total, offTotal: offStarv ? offStarv.total : null,
      armOnlyOn: armOnlyOn, armOnlyOff: armOnlyOff,
      onPerSeed: onStarv.perSeed, offPerSeed: offStarv ? offStarv.perSeed : null },
    anchors: anchors,
    substrate: { anchor12: ANCHOR12, policySha: anchors.on ? anchors.on.policySha : null,
      flags: SUBSTRATE_FLAGS, note: 'ALLYSLOT3 inert on this base (no reader in src/); carried for substrate parity' },
    bars: {
      poolFill: { pass: bar1, emptyShare: onSummary.poolShape.emptyShare, meanEligible: onSummary.poolShape.meanEligible,
        empty: onSummary.poolShape.empty, dawns: onSummary.poolShape.dawns, emptyShareBar: 0.47, meanEligibleBar: 1.5,
        poolShapeAllOn: onSummary.poolShapeAll, poolShapeAllOff: offSummary ? offSummary.poolShapeAll : null },
      launches: { pass: bar2, on: onSummary.launchedInstances, off: offSummary ? offSummary.launchedInstances : null,
        bar: 5, launchEventsW4On: onSummary.launchEventsW4, launchEventsW4Off: offSummary ? offSummary.launchEventsW4 : null },
      cost: { pass: bar3, starvOn: onStarv.total, starvOff: offStarv ? offStarv.total : null,
        armOnlyOn: armOnlyOn, armOnlyOff: armOnlyOff,
        medianOn: onSummary.medianSurvival, medianOff: offSummary ? offSummary.medianSurvival : null },
      damageTracked: bar4,
      instrument: { pass: bar5, onFiles: on.files, offFiles: offFiles,
        recFiles: recFiles, rec0Files: rec0Files,
        onErrors: onErrors, offErrors: offErrors, recErrors: recErrors, rec0Errors: rec0Errors,
        wave4IdsMatch: !!w4Match, anchorAll: anchorAll, d2On: d2On, d2Off: d2Off,
        classifiedShare: onSummary.classifiedShare, unknown: onSummary.unknown },
    },
    verdict: (bar1 && bar2 && bar3 && bar5) ? 'GO' : 'NO-GO',
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-21', 'profilegate4-b-analysis.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');

  console.log('=== profilegate4-b (on leg, judged) ===');
  console.log('seeds: ' + onSummary.seeds + '  files: ' + on.files +
    '  seedCallsW4: ' + onSummary.seedCallsW4 + '  instancesOpened: ' + onSummary.instancesOpened);
  console.log('funnel buckets: ' + JSON.stringify(onSummary.byFunnel));
  console.log('launched instances: ' + onSummary.launchedInstances + ' (off: ' + (offSummary ? offSummary.launchedInstances : null) + ')');
  console.log('poolShape ON (needWave>=4): ' + JSON.stringify(onSummary.poolShape));
  console.log('poolShape OFF (needWave>=4): ' + JSON.stringify(offSummary ? offSummary.poolShape : null));
  console.log('poolShapeAll ON: ' + JSON.stringify(onSummary.poolShapeAll));
  console.log('poolShapeAll OFF: ' + JSON.stringify(offSummary ? offSummary.poolShapeAll : null));
  console.log('damage ON: pooledShare=' + onSummary.damage.pooledShare + ' meetings=' + onSummary.damage.meetings + ' dealt=' + onSummary.damage.pooledDealt + '/' + onSummary.damage.pooledMaxHp);
  console.log('starvation: onTotal=' + onStarv.total + ' offTotal=' + (offStarv ? offStarv.total : null) + ' armOnlyOn=' + armOnlyOn + ' armOnlyOff=' + armOnlyOff);
  console.log('wall (on): ' + JSON.stringify(onSummary.wall) + '  medianSurvival: ' + onSummary.medianSurvival);
  if (offSummary) {
    console.log('--- off leg ---');
    console.log('instancesOpened: ' + offSummary.instancesOpened + ' funnel: ' + JSON.stringify(offSummary.byFunnel));
    console.log('wall (off): ' + JSON.stringify(offSummary.wall) + '  medianSurvival: ' + offSummary.medianSurvival);
  }
  console.log('anchors (frozen 2b97163b0): ' + JSON.stringify({ on: anchors.on && anchors.on.allMatch, off: anchors.off && anchors.off.allMatch, rec: anchors.rec && anchors.rec.allMatch, rec0: anchors.rec0 && anchors.rec0.allMatch }) + ' anchorAll=' + anchorAll);
  console.log('bars: B1pool=' + (bar1 ? 'PASS' : 'FAIL') + ' B2launches=' + (bar2 ? 'PASS' : 'FAIL') +
    ' B3cost=' + (bar3 ? 'PASS' : 'FAIL') + ' B4damage=TRACKED(' + onSummary.damage.pooledShare + ' vs 0.085) B5instrument=' + (bar5 ? 'PASS' : 'FAIL') +
    ' wave4Ids=' + (w4Match ? 'MATCH' : 'MISMATCH') + ' d2on=' + d2On + ' d2off=' + d2Off);
  console.log('VERDICT: ' + out.verdict);
  console.log('analysis: ' + path.relative(REPO, outFile));
  if (!bar1 || !bar2 || !bar3 || !bar5 || !w4Match || (d2On != null && d2On !== 0) || (d2Off != null && d2Off !== 0)) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { funnelForSeed: funnelForSeed, summarize: summarize, FUNNEL_BUCKETS: FUNNEL_BUCKETS, deriveMaxHp: deriveMaxHp, rangeMidHp: rangeMidHp, armOnlyStarv: armOnlyStarv, d2DivCount: d2DivCount, computeBars: computeBars, anchorReport: anchorReport, ANCHOR12: ANCHOR12 };
