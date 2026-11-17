// analyze-launchfunnel-a.js — classifier for arm sim-launchfunnel-a
// (DIAG: unified launch-funnel census). Reuses
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
// Usage:
//   node scripts/analyze-launchfunnel-a.js <vreDir> [offDir] [recDir]
// Writes evidence/2026-11-17/launchfunnel-a-analysis.json. Exits 0
// iff every plan instance on the census (vre) leg is classified
// (unknown == 0), all files parse, and no instrument errors.
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
try {
  const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
  const list = raw.monsters || raw;
  for (const m of list) WAVE_BY_ID[m.id] = m.wave | 0;
} catch (e) {}

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
  const poolDist = { dawns: 0, eligible0: 0, eligible1: 0, eligible2: 0, eligible3plus: 0 };
  const firstFails = {};
  const poolMembers = { n: 0, notRangerAlone: 0, notRanger: 0, away: 0, trustLow: 0 };
  for (const row of pool) {
    poolDist.dawns++;
    const n = (row.eligible || []).length;
    if (n === 0) poolDist.eligible0++;
    else if (n === 1) poolDist.eligible1++;
    else if (n === 2) poolDist.eligible2++;
    else poolDist.eligible3plus++;
    const counts = row.counts || {};
    for (const k of Object.keys(counts)) firstFails[k] = (firstFails[k] || 0) + (counts[k] | 0);
    for (const m of (row.members || [])) {
      if (m.firstFail === 'selfOrScholar') continue;
      poolMembers.n++;
      if (m.firstFail === 'notRanger') poolMembers.notRanger++;
      if (m.away) poolMembers.away++;
      if (m.trust != null && m.trust < 15) poolMembers.trustLow++;
      // Alone = notRanger first-fail AND no other flag true.
      if (m.firstFail === 'notRanger' && !m.away && !(m.node == null) && !m.engaged && !m.onExped && m.alive) poolMembers.notRangerAlone++;
    }
  }

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
      return { day: e.day, vid: e.vid, mid: e.mid, outcome: e.outcome || null,
        rounds: e.rounds, vTaken: e.vTaken, mDealt: e.mDealt, origin: e.origin || null };
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
    poolMembers: poolMembers, skipReasons: skipReasons,
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

function main() {
  const vreDir = process.argv[2];
  const offDir = process.argv[3] || null;
  const recDir = process.argv[4] || null;
  if (!vreDir) { console.error('LAUNCHFUNNEL ANALYZE STOP: vreDir required.'); process.exit(2); }
  let liveW4 = null;
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    liveW4 = list.filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
  } catch (e) {}
  const frozenSorted = W4_IDS_FROZEN.slice().sort();
  const w4Match = liveW4 && JSON.stringify(liveW4) === JSON.stringify(frozenSorted);

  const vreRaw = loadDir(vreDir);
  const vre = loadDir(vreDir);
  for (const k of Object.keys(vre.bySeed)) vre.bySeed[k] = funnelForSeed(vre.bySeed[k]);
  const vreSummary = summarize(vre);
  const vreStarv = starvOf(vreRaw.bySeed);
  vreSummary.wall.deaths = vreStarv.deaths;
  vreSummary.wall.starvation = vreStarv.total;

  let offSummary = null, offStarv = null;
  if (offDir) {
    const offRaw = loadDir(offDir);
    const off = loadDir(offDir);
    for (const k of Object.keys(off.bySeed)) off.bySeed[k] = funnelForSeed(off.bySeed[k]);
    offSummary = summarize(off);
    offStarv = starvOf(offRaw.bySeed);
    offSummary.wall.deaths = offStarv.deaths;
    offSummary.wall.starvation = offStarv.total;
  }
  let recSummary = null;
  if (recDir) {
    const rec = loadDir(recDir);
    for (const k of Object.keys(rec.bySeed)) rec.bySeed[k] = funnelForSeed(rec.bySeed[k]);
    recSummary = summarize(rec);
  }

  const vreErrors = vreSummary.perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0);
  const offErrors = offSummary ? offSummary.perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0) : 0;
  const recErrors = recSummary ? recSummary.perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0) : 0;
  const bar1 = vreSummary.instancesOpened > 0 && vreSummary.classifiedShare >= 0.9 && vreSummary.unknown === 0;
  const bar2 = vreSummary.instancesOpened >= 5;
  const bar3 = vreSummary.rankedLeaks.every(function (r) { return typeof r.count === 'number'; }) && vreSummary.bindingStage != null;
  const bar4 = vre.files.length === 8 && (!offSummary || offSummary.files === 8) &&
    vreErrors === 0 && offErrors === 0 && recErrors === 0 && !!w4Match;
  // D2 full-band: rec leg must be trajectory-identical to vre leg.
  let d2Divergences = null;
  if (recDir) {
    d2Divergences = 0;
    for (const k of Object.keys(vreRaw.bySeed)) {
      const a = vreRaw.bySeed[k], b = loadDir(recDir).bySeed[k];
      if (!b) { d2Divergences++; continue; }
      const fa = JSON.stringify({ d: (a.daily || []).map(function (x) { return x.day; }), g: a.gameDays, s: a.standing, w: a.maxWave, de: (a.deaths || []).length });
      const fb = JSON.stringify({ d: (b.daily || []).map(function (x) { return x.day; }), g: b.gameDays, s: b.standing, w: b.maxWave, de: (b.deaths || []).length });
      if (fa !== fb) d2Divergences++;
    }
  }
  const out = {
    arm: 'launchfunnel-a', run: 'launchfunnel-a',
    vreDir: path.basename(vreDir), offDir: offDir ? path.basename(offDir) : null, recDir: recDir ? path.basename(recDir) : null,
    wave4IdsMatch: !!w4Match, wave4IdsLive: liveW4, wave4IdsFrozen: frozenSorted,
    census: vreSummary, off: offSummary, rec: recSummary,
    d2Divergences: d2Divergences,
    bars: {
      taxonomy: { pass: bar1, classifiedShare: vreSummary.classifiedShare, unknown: vreSummary.unknown, instancesOpened: vreSummary.instancesOpened },
      populationFloor: { pass: bar2, instancesOpened: vreSummary.instancesOpened, floor: 5 },
      rankedLeak: { pass: bar3, bindingStage: vreSummary.bindingStage, bindingCount: vreSummary.bindingCount, rankedLeaks: vreSummary.rankedLeaks },
      instrument: { pass: bar4, vreFiles: vre.files.length, offFiles: offSummary ? offSummary.files : null, recFiles: recSummary ? recSummary.files : null, vreErrors: vreErrors, offErrors: offErrors, recErrors: recErrors, wave4IdsMatch: !!w4Match },
    },
    verdict: (bar1 && bar2 && bar3 && bar4) ? 'GO' : 'NO-GO',
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-17', 'launchfunnel-a-analysis.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');

  console.log('=== launchfunnel-a census (vre leg) ===');
  console.log('seeds: ' + vreSummary.seeds + '  files: ' + vreSummary.files +
    '  seedCallsW4: ' + vreSummary.seedCallsW4 + '  instancesOpened: ' + vreSummary.instancesOpened);
  console.log('funnel buckets: ' + JSON.stringify(vreSummary.byFunnel));
  console.log('ranked leaks: ' + JSON.stringify(vreSummary.rankedLeaks));
  console.log('binding stage: ' + vreSummary.bindingStage + ' (' + vreSummary.bindingCount + ')');
  console.log('attach: ' + JSON.stringify(vreSummary.attach));
  console.log('pool: ' + JSON.stringify(vreSummary.poolDist) + ' firstFails: ' + JSON.stringify(vreSummary.firstFails));
  console.log('skipReasons: ' + JSON.stringify(vreSummary.skipReasons) + ' otherReclassified: ' + vreSummary.otherReclassified);
  console.log('gateJoined: ' + JSON.stringify(vreSummary.gateJoined) + ' gateAll: ' + JSON.stringify(vreSummary.gateAll));
  console.log('launchedSizes: ' + JSON.stringify(vreSummary.launchedSizes));
  console.log('classifiedShare: ' + vreSummary.classifiedShare + '  unknown: ' + vreSummary.unknown);
  console.log('wall (vre): ' + JSON.stringify(vreSummary.wall) + '  medianSurvival: ' + vreSummary.medianSurvival);
  if (offSummary) {
    console.log('--- off leg ---');
    console.log('instancesOpened: ' + offSummary.instancesOpened + ' funnel: ' + JSON.stringify(offSummary.byFunnel));
    console.log('wall (off): ' + JSON.stringify(offSummary.wall) + '  medianSurvival: ' + offSummary.medianSurvival);
  }
  console.log('bars: taxonomy=' + (bar1 ? 'PASS' : 'FAIL') + ' floor=' + (bar2 ? 'PASS' : 'FAIL') +
    ' ranked=' + (bar3 ? 'PASS' : 'FAIL') + ' instrument=' + (bar4 ? 'PASS' : 'FAIL') +
    ' wave4Ids=' + (w4Match ? 'MATCH' : 'MISMATCH') + ' d2div=' + d2Divergences);
  console.log('VERDICT: ' + out.verdict);
  console.log('analysis: ' + path.relative(REPO, outFile));
  if (!bar1 || !bar2 || !bar3 || !bar4 || !w4Match || (d2Divergences != null && d2Divergences !== 0)) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { funnelForSeed: funnelForSeed, summarize: summarize, FUNNEL_BUCKETS: FUNNEL_BUCKETS };
