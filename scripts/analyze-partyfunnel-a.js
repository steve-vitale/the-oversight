// analyze-partyfunnel-a.js — analyzer, arm sim-partyfunnel-a.
// Judges the frozen prereg (evidence/2026-11-19/sim-partyfunnel-a-prereg.md)
// against two per-seed corpora (ctl vs arm) from
// scripts/partyfunnel-driver.js. The prereg is the judge; this file
// is the instrument.
//   Primary: seeded wave-4 plans that launch with a formed party
//   (holder's plan reaches stage 'hunt' with party.length >= 1 before
//   run end / deletion / retarget). GO requires arm rate >= 50% AND
//   >= 2x control on identical seeds, pool floor >= 8 seeded wave-4
//   plans per leg.
//   Cost bars: C1 median survival arm >= 0.8x ctl; C2 starvation arm
//   <= ctl + 2; C3 community loss arm <= ctl + 1.
//   (b)-trigger: pool-empty is the dominant stall shape (>= 50% of
//   stalled plans) with >= 8 seeds and arm rate < 50%.
// Usage:
//   node scripts/analyze-partyfunnel-a.js --ctl <dir> --arm <dir> [--out <file>]
//   node scripts/analyze-partyfunnel-a.js --selftest
'use strict';
const fs = require('fs');
const path = require('path');

const W4_IDS_FROZEN = ['congregation', 'strike', 'influencer', 'audit', 'reunion', 'suburb', 'eulogy', 'algorithm', 'eater', 'herald'];
function loadWave4Ids(repo) {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(repo, 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    return list.filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
  } catch (e) { return W4_IDS_FROZEN.slice().sort(); }
}
const REPO = path.join(__dirname, '..');
const W4_SET = new Set(loadWave4Ids(REPO));
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

function med(xs) {
  if (!xs.length) return 0;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function round(x, n) { return x == null ? null : Math.round(x * Math.pow(10, n)) / Math.pow(10, n); }

// planAfterSeed(seedRow): the plan the seed call actually left behind.
// Only the LIVE post-call fields (postTarget/postNeedWave, recorded
// by the corrected driver) decide it. Rows from the first pilot run
// carry no postTarget: their preTarget/preStage were read AFTER the
// call (the driver bug — the seed mutates the plan in place), so
// neither the create/retarget distinction nor the pre-call state is
// recoverable from them. Those rows are LEGACY: unclassifiable for
// the primary metric, counted separately, never derived-from.
// Returns {postTarget, postNeedWave, postIsWave4} or {legacy: true}.
function planAfterSeed(seedRow) {
  if (!seedRow) return { postTarget: null, postNeedWave: null, postIsWave4: false };
  if (seedRow.postTarget === undefined) return { legacy: true };
  const nw = (seedRow.postNeedWave != null ? seedRow.postNeedWave : null);
  return { postTarget: seedRow.postTarget || null, postNeedWave: nw,
    postIsWave4: (nw | 0) >= 4 || !!(seedRow.postTarget && W4_SET.has(seedRow.postTarget)) };
}

// isTrueSeedEvent(seedRow): the call actually created or retargeted a
// plan. A hunt/standing/table-stage call returns the plan unchanged
// (early return in winPlanSeedFromFight) — it is not a seed event
// even when the new beast differs from the plan's target. The live
// retKind (corrected driver) already encodes this; the preStage
// check is belt-and-braces for any row whose retKind predates the
// driver fix.
function isTrueSeedEvent(seedRow) {
  if (!seedRow) return false;
  if (seedRow.retKind === 'created') return true;
  if (seedRow.retKind !== 'retargeted') return false;
  if (seedRow.postTarget === undefined) return false; // legacy: unclassifiable
  const preStage = seedRow.preStage || null;
  if (preStage && preStage !== 'gear' && preStage !== 'party') return false;
  return true;
}

function isWave4Seed(row) {
  if (!row) return false;
  if ((row.wave | 0) >= 4) return true;
  return !!(row.mid && W4_SET.has(row.mid));
}

// scanSegment(file, holder, startDay, endDayCap, target, seedIdx):
// one holder's stretch of a plan's life: the daily rows for `holder`
// from startDay (until endDayCap when given — the day the plan moves
// to its next holder). Returns {status, day, partySize, companions,
// stallShape, detail} where status in launched-party | launched-solo
// | retargeted | rows-ended | to-end. The first three are terminal;
// rows-ended means the plan vanished under this holder (the caller
// decides, from the reassignment chain, whether it moved or died);
// to-end means the rows run to the run's end (stalled, when this is
// the final segment).
function scanSegment(file, holder, startDay, endDayCap, target, seedIdx) {
  const rows = (file.holderDays || []).filter(function (r) {
    return r.vid === holder && r.day >= startDay && (endDayCap == null || r.day < endDayCap);
  }).sort(function (a, b) { return a.day - b.day; });
  // The next TRUE seed event for this holder that actually CHANGES
  // the plan's target ends this seed's life (retarget). A later call
  // that returns the plan unchanged (hunt-stage early return, or the
  // PARTYFUNNEL retarget hold on a 'party'-stage plan) does not — the
  // post-call target is what decides. Bounded to the segment window:
  // a retarget dated after the plan moved belongs to the next holder.
  const later = (file.seeds || []).filter(function (s, i) {
    if (i <= seedIdx || s.vid !== holder) return false;
    if (!isTrueSeedEvent(s)) return false;
    const post = planAfterSeed(s);
    if (post.legacy) return false; // legacy: cannot tell whether it retargeted
    if (post.postTarget === target) return false;
    if (endDayCap != null && s.day >= endDayCap) return false;
    return true;
  });
  const endDay = later.length ? later[0].day : Infinity;
  let lastRow = null;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (r.day >= endDay) break;
    lastRow = r;
    if ((r.target || null) !== (target || null)) {
      return { status: 'retargeted', day: r.day, partySize: null, companions: [], stallShape: null, detail: 'target became ' + (r.target || '?') };
    }
    if (r.stage === 'hunt') {
      const n = (r.party || []).length;
      if (n >= 1) return { status: 'launched-party', day: r.day, partySize: 1 + n, companions: (r.party || []).slice(), stallShape: null, detail: 'hunt with ' + n + ' companion(s)' };
      return { status: 'launched-solo', day: r.day, partySize: 1, companions: [], stallShape: null, detail: 'hunt solo' };
    }
  }
  // No launch observed before the retarget (or before run end). A
  // later created/retargeted seed for this holder ENDED this seed's
  // plan — the retarget is the event, whether or not a census row
  // shows the new target.
  if (later.length) {
    return { status: 'retargeted', day: endDay, partySize: null, companions: [], stallShape: null, detail: 'retargeted by a later seed' };
  }
  // No launch observed. Did the plan vanish under this holder, or sit?
  const gameDays = file.gameDays || file.days || 0;
  const lastDay = lastRow ? lastRow.day : null;
  if (lastDay != null && lastDay < gameDays - 1) {
    // Rows stopped well before run end: the plan vanished under this
    // holder. Death is the attributable cause when this holder died;
    // the LEAVE / mantle cleanups and table-active deletion are the
    // other known deleters (indistinguishable in the corpus —
    // deleted-other). The caller re-labels this as a move when a
    // reassignment row carries the plan onward.
    const died = (file.deaths || []).some(function (d) { return d.who === holder; });
    return { status: 'rows-ended', day: lastDay, partySize: null, companions: [], stallShape: null, detail: died ? 'holder died' : 'plan deleted (leave/mantle/table)' };
  }
  if (!lastRow) return { status: 'to-end', day: startDay, partySize: null, companions: [], stallShape: 'no-rows', detail: 'seeded but never in the wave-4 census' };
  const shape = stallShapeOf(lastRow);
  return { status: 'to-end', day: lastRow.day, partySize: null, companions: [], stallShape: shape, detail: 'still ' + (lastRow.stage || '?') + ' at run end' };
}

// classifySeed(file, seedRow, seedIdx, postTarget): follow one
// created/retargeted wave-4 seed through the holder's daily rows AND
// across holder reassignments (PARTYFUNNEL: the plan survives its
// holder's death — the driver records each reassignment as a row, and
// the plan's life continues under the successor with the same target).
// The plan's post-call target (not the call's mdef) is what the rows
// must match: a hunt-stage seed that did not retarget keeps its old
// target. Returns {status, day, partySize, companions, stallShape,
// detail, reassigned, reassignCount, reassignVias, finalHolder} where
// status in launched-party | launched-solo | retargeted | deleted |
// stalled. Refused/existing seeds never reach this function.
function classifySeed(file, seedRow, seedIdx, postTarget) {
  const target = (postTarget !== undefined && postTarget !== null) ? postTarget : (seedRow.mid || null);
  // Build the holder chain: the seed holder, then each successor the
  // driver recorded for the same target. A reassignment row belongs to
  // this seed only when its pre-call target matches the seed's target
  // (a holder retargeted before dying carries a different plan).
  const segments = [{ holder: seedRow.vid, startDay: seedRow.day }];
  const vias = [];
  const reas = ((file.reassignments || []).slice()).sort(function (a, b) { return (a.day - b.day) || 0; });
  let cur = seedRow.vid;
  for (let k = 0; k < reas.length; k++) {
    const rr = reas[k];
    if (!rr || rr.vid !== cur || !rr.reassignedTo) continue;
    if ((rr.preTarget || null) !== (target || null)) continue;
    if (rr.day < segments[segments.length - 1].startDay) continue;
    segments.push({ holder: rr.reassignedTo, startDay: rr.day });
    vias.push(rr.reassignVia || null);
    cur = rr.reassignedTo;
  }
  const reassigned = segments.length > 1;
  for (let si = 0; si < segments.length; si++) {
    const seg = segments[si];
    const isLast = si === segments.length - 1;
    const endCap = isLast ? null : segments[si + 1].startDay;
    const sc = scanSegment(file, seg.holder, seg.startDay, endCap, target, seedIdx);
    const base = { reassigned: reassigned, reassignCount: segments.length - 1, reassignVias: vias.slice(), finalHolder: seg.holder };
    if (sc.status === 'launched-party' || sc.status === 'launched-solo' || sc.status === 'retargeted') {
      return Object.assign({ status: sc.status, day: sc.day, partySize: sc.partySize, companions: sc.companions, stallShape: sc.stallShape, detail: sc.detail }, base);
    }
    if (!isLast) continue; // the plan moved on: rows-ended/to-end is not terminal mid-chain
    if (sc.status === 'rows-ended') {
      return Object.assign({ status: 'deleted', day: sc.day, partySize: null, companions: [], stallShape: null, detail: sc.detail }, base);
    }
    return Object.assign({ status: 'stalled', day: sc.day, partySize: null, companions: [], stallShape: sc.stallShape, detail: sc.detail }, base);
  }
  return { status: 'stalled', day: seedRow.day, partySize: null, companions: [], stallShape: 'no-rows', detail: 'seeded but never in the wave-4 census', reassigned: reassigned, reassignCount: segments.length - 1, reassignVias: vias.slice(), finalHolder: seedRow.vid };
}

function stallShapeOf(row) {
  if (row.holderIsScholar) return 'scholar-holder';
  if (row.holderAway && row.holderAway.purpose === 'leave') return 'leaver';
  if (row.holderBlock === 'range-0') return 'range-0-holder';
  if (row.holderBlock && String(row.holderBlock).indexOf('hurt') === 0) return 'hurt';
  if (row.poolCounts && (row.poolCounts.eligible | 0) === 0) return 'pool-empty';
  return 'other';
}

function analyzeLeg(dir, label) {
  const files = fs.readdirSync(dir).filter(function (f) { return /\.json$/.test(f); }).sort();
  const perSeed = [];
  let instrumentErrors = 0;
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    instrumentErrors += (j.instrumentErrors || []).length;
    const seeds = (j.seeds || []).filter(isWave4Seed);
    const outcomes = [];
    let refusedScholar = 0, refusedLeaver = 0, refusedOther = 0, wouldBeRefused = 0, nonW4Seeds = 0, legacyUnclassifiable = 0;
    let retargetHolds = 0, reassignNoSuccessor = 0;
    // PARTYFUNNEL secondary reads. retargetHolds: a seed call for a
    // DIFFERENT wave-4 beast on a 'party'-stage plan WITH a target
    // that returned the plan unchanged ('existing') — the hold firing.
    // (On the control leg the same call retargets, so this should read
    // ~0 there by construction.) reassignNoSuccessor: death-cleanup
    // rows where a pre-kill wave-4 plan existed but no successor was
    // found — the plan deleted as before.
    for (const s of (j.seeds || [])) {
      if (s.retKind === 'existing' && s.preStage === 'party' && s.preTarget && s.mid && s.mid !== s.preTarget && isWave4Seed(s)) retargetHolds++;
    }
    for (const rr of (j.reassignments || [])) {
      if (!rr || rr.reassignedTo) continue;
      if (rr.preStage !== 'gear' && rr.preStage !== 'party' && rr.preStage !== 'hunt') continue;
      if ((rr.preNeedWave | 0) >= 4 || (rr.preTarget && W4_SET.has(rr.preTarget))) reassignNoSuccessor++;
    }
    // Band-wide launch census (any wave-4 plan reaching hunt, seeded
    // or not): distinguishes "seeded plans never launch" from
    // "nothing launches". First hunt row per holder.
    const seenHunt = {};
    let bandHuntParty = 0, bandHuntSolo = 0;
    for (const r of (j.holderDays || [])) {
      if (r.stage !== 'hunt' || seenHunt[r.vid]) continue;
      seenHunt[r.vid] = true;
      if ((r.party || []).length >= 1) bandHuntParty++; else bandHuntSolo++;
    }
    for (let i = 0; i < (j.seeds || []).length; i++) {
      const s = j.seeds[i];
      // The gate's comparable population: wave>=3 calls (the wave
      // gate runs first, so wave<3 calls never reach it) whose holder
      // is the scholar or a leaver — counted on BOTH legs, whatever
      // the call returned.
      if ((s.wave | 0) >= 3 && (s.isScholar || s.awayPurpose === 'leave' || (s.awayDuration != null && s.awayDuration >= 999))) wouldBeRefused++;
      if (!isWave4Seed(s)) continue;
      if (s.retKind === 'refused-null') {
        if (s.isScholar) refusedScholar++;
        else if (s.awayPurpose === 'leave' || (s.awayDuration != null && s.awayDuration >= 999)) refusedLeaver++;
        else refusedOther++;
        continue;
      }
      if (s.retKind === 'existing') continue; // no new plan: not in the denominator
      // Legacy rows (first pilot run: no postTarget — the driver read
      // the plan after the mutating call) cannot tell a create/retarget
      // from a no-op: unclassifiable for the primary metric, counted
      // separately, never derived-from.
      const post = planAfterSeed(s);
      if (post.legacy) { legacyUnclassifiable++; continue; }
      // Only a TRUE seed event (created, or a gear/party-stage
      // retarget) enters the denominator. A hunt-stage call returns
      // the plan unchanged — not a seed event even when the new beast
      // differs from the plan's target.
      if (!isTrueSeedEvent(s)) continue;
      // The post-call plan decides the population: a call FOR a wave-4
      // beast that leaves a non-wave-4 plan behind is not a seeded
      // wave-4 plan.
      if (!post.postIsWave4) { nonW4Seeds++; continue; }
      const c = classifySeed(j, s, i, post.postTarget);
      outcomes.push({ seed: j.seed, vid: s.vid, mid: s.mid, day: s.day, retKind: s.retKind, postTarget: post.postTarget, status: c.status, launchDay: c.day, partySize: c.partySize, companions: c.companions, stallShape: c.stallShape, detail: c.detail, reassigned: !!c.reassigned, reassignCount: c.reassignCount || 0, reassignVias: c.reassignVias || [], finalHolder: c.finalHolder || s.vid });
    }
    const launchedParty = outcomes.filter(function (o) { return o.status === 'launched-party'; }).length;
    const launchedSolo = outcomes.filter(function (o) { return o.status === 'launched-solo'; }).length;
    const reassigned = outcomes.filter(function (o) { return o.reassigned; }).length;
    const reassignedLaunched = outcomes.filter(function (o) { return o.reassigned && o.status === 'launched-party'; }).length;
    const reassignVias = {};
    for (const o of outcomes) for (const via of (o.reassignVias || [])) reassignVias[via || '?'] = (reassignVias[via || '?'] || 0) + 1;
    const stalled = outcomes.filter(function (o) { return o.status === 'stalled'; });
    const stallShapes = {};
    for (const o of stalled) stallShapes[o.stallShape || 'other'] = (stallShapes[o.stallShape || 'other'] || 0) + 1;
    const starv = (j.deaths || []).filter(function (d) { return d.cause === 'starvation'; }).length;
    perSeed.push({
      seed: j.seed, gameDays: j.gameDays || j.days || 0, endReason: j.endReason || null,
      standing: (j.standing != null ? j.standing : null), scaleRank: j.scaleRank || null,
      won: !!j.won, maxWave: j.maxWave || 1, villageLost: !!j.villageLost,
      tableActive: j.tableActive != null ? !!j.tableActive : null,
      seededW4: outcomes.length, launchedParty: launchedParty, launchedSolo: launchedSolo,
      stalled: stalled.length, stallShapes: stallShapes,
      retargeted: outcomes.filter(function (o) { return o.status === 'retargeted'; }).length,
      deleted: outcomes.filter(function (o) { return o.status === 'deleted'; }).length,
      refusedScholar: refusedScholar, refusedLeaver: refusedLeaver, refusedOther: refusedOther,
      wouldBeRefused: wouldBeRefused, nonW4Seeds: nonW4Seeds, legacyUnclassifiable: legacyUnclassifiable, starvDeaths: starv,
      bandHuntParty: bandHuntParty, bandHuntSolo: bandHuntSolo,
      reassigned: reassigned, reassignedLaunched: reassignedLaunched, reassignVias: reassignVias,
      reassignNoSuccessor: reassignNoSuccessor, retargetHolds: retargetHolds,
      communityLost: ['village-lost', 'village-dead', 'pop-zero'].indexOf(j.endReason) !== -1 ? 1 : 0,
      outcomes: outcomes,
    });
  }
  const seededW4 = perSeed.reduce(function (a, s) { return a + s.seededW4; }, 0);
  const launchedParty = perSeed.reduce(function (a, s) { return a + s.launchedParty; }, 0);
  const launchedSolo = perSeed.reduce(function (a, s) { return a + s.launchedSolo; }, 0);
  const stalledN = perSeed.reduce(function (a, s) { return a + s.stalled; }, 0);
  const stallShapes = {};
  for (const s of perSeed) for (const k in s.stallShapes) stallShapes[k] = (stallShapes[k] || 0) + (s.stallShapes[k] || 0);
  const rate = seededW4 ? launchedParty / seededW4 : null;
  return {
    label: label, files: files.length, instrumentErrors: instrumentErrors,
    seededW4: seededW4, launchedParty: launchedParty, launchedSolo: launchedSolo,
    stalled: stalledN, stallShapes: stallShapes,
    retargeted: perSeed.reduce(function (a, s) { return a + s.retargeted; }, 0),
    deleted: perSeed.reduce(function (a, s) { return a + s.deleted; }, 0),
    refusedScholar: perSeed.reduce(function (a, s) { return a + s.refusedScholar; }, 0),
    refusedLeaver: perSeed.reduce(function (a, s) { return a + s.refusedLeaver; }, 0),
    refusedOther: perSeed.reduce(function (a, s) { return a + s.refusedOther; }, 0),
    wouldBeRefused: perSeed.reduce(function (a, s) { return a + s.wouldBeRefused; }, 0),
    nonW4Seeds: perSeed.reduce(function (a, s) { return a + s.nonW4Seeds; }, 0),
    legacyUnclassifiable: perSeed.reduce(function (a, s) { return a + s.legacyUnclassifiable; }, 0),
    bandHuntParty: perSeed.reduce(function (a, s) { return a + s.bandHuntParty; }, 0),
    bandHuntSolo: perSeed.reduce(function (a, s) { return a + s.bandHuntSolo; }, 0),
    reassigned: perSeed.reduce(function (a, s) { return a + s.reassigned; }, 0),
    reassignedLaunched: perSeed.reduce(function (a, s) { return a + s.reassignedLaunched; }, 0),
    reassignVias: (function () { const o = {}; for (const s of perSeed) for (const k in s.reassignVias) o[k] = (o[k] || 0) + s.reassignVias[k]; return o; })(),
    reassignNoSuccessor: perSeed.reduce(function (a, s) { return a + s.reassignNoSuccessor; }, 0),
    retargetHolds: perSeed.reduce(function (a, s) { return a + s.retargetHolds; }, 0),
    rate: rate,
    medianSurvival: med(perSeed.map(function (s) { return s.gameDays; })),
    starvDeaths: perSeed.reduce(function (a, s) { return a + s.starvDeaths; }, 0),
    communityLost: perSeed.reduce(function (a, s) { return a + s.communityLost; }, 0),
    wall: {
      nationalStanding: perSeed.filter(function (s) { return (s.standing || 0) >= 200; }).length,
      nationalRank: perSeed.filter(function (s) { return (RANK_ORDER[s.scaleRank] || 0) >= 2; }).length,
      table: perSeed.filter(function (s) { return s.tableActive; }).length,
      wins: perSeed.filter(function (s) { return s.won; }).length,
      wave4: perSeed.filter(function (s) { return (s.maxWave || 1) >= 4; }).length,
      wave5: perSeed.filter(function (s) { return (s.maxWave || 1) >= 5; }).length,
    },
    perSeed: perSeed,
  };
}

function judge(ctl, arm) {
  const floorOk = ctl.seededW4 >= 8 && arm.seededW4 >= 8;
  // A zero control rate with a real arm rate is a pass on the ratio
  // (2x of 0 is 0): the bar is "at least twice the control", and any
  // positive arm rate doubles zero. The 50% floor carries the weight.
  const ratioOk = ctl.rate === 0 ? (arm.rate != null && arm.rate > 0) : (arm.rate != null && ctl.rate != null && arm.rate >= 2 * ctl.rate);
  const primaryOk = arm.rate != null && arm.rate >= 0.5 && ratioOk;
  const c1 = { pass: ctl.medianSurvival === 0 ? true : arm.medianSurvival >= 0.8 * ctl.medianSurvival, ctl: ctl.medianSurvival, arm: arm.medianSurvival, ratio: ctl.medianSurvival ? round(arm.medianSurvival / ctl.medianSurvival, 4) : null, bar: 'arm >= 0.8x ctl' };
  const c2 = { pass: arm.starvDeaths <= ctl.starvDeaths + 2, ctl: ctl.starvDeaths, arm: arm.starvDeaths, bar: 'arm <= ctl + 2' };
  const c3 = { pass: arm.communityLost <= ctl.communityLost + 1, ctl: ctl.communityLost, arm: arm.communityLost, bar: 'arm <= ctl + 1' };
  const costsOk = c1.pass && c2.pass && c3.pass;
  const poolEmptyShare = arm.stalled ? ((arm.stallShapes['pool-empty'] || 0) / arm.stalled) : 0;
  const bTrigger = arm.seededW4 >= 8 && (arm.rate == null || arm.rate < 0.5) && poolEmptyShare >= 0.5;
  let verdict, reason;
  if (!floorOk) { verdict = 'METRIC-BROKEN'; reason = 'pool floor < 8 seeded wave-4 plans on a leg (ctl ' + ctl.seededW4 + ', arm ' + arm.seededW4 + ')'; }
  else if (primaryOk && costsOk) { verdict = 'GO'; reason = 'primary bars pass (arm rate ' + round(arm.rate, 3) + ' vs ctl ' + round(ctl.rate, 3) + ') and C1-C3 pass'; }
  else {
    verdict = 'NO-GO';
    const fails = [];
    if (!primaryOk) fails.push('primary (arm rate ' + round(arm.rate, 3) + ' vs ctl ' + round(ctl.rate, 3) + '; need >= 0.5 and >= 2x ctl)');
    if (!c1.pass) fails.push('C1 survival');
    if (!c2.pass) fails.push('C2 starvation');
    if (!c3.pass) fails.push('C3 community');
    reason = fails.join('; ');
  }
  return { verdict: verdict, reason: reason, floorOk: floorOk, primaryOk: primaryOk, ratioOk: ratioOk, costsOk: costsOk, c1: c1, c2: c2, c3: c3, bTrigger: bTrigger, poolEmptyShare: round(poolEmptyShare, 3) };
}

function analyze(ctlDir, armDir) {
  const ctl = analyzeLeg(ctlDir, 'ctl');
  const arm = analyzeLeg(armDir, 'arm');
  const j = judge(ctl, arm);
  return { verdict: j.verdict, reason: j.reason, primary: { ctlRate: round(ctl.rate, 4), armRate: round(arm.rate, 4), ctlSeeded: ctl.seededW4, armSeeded: arm.seededW4, ctlLaunchedParty: ctl.launchedParty, armLaunchedParty: arm.launchedParty, ctlLaunchedSolo: ctl.launchedSolo, armLaunchedSolo: arm.launchedSolo, floorOk: j.floorOk, primaryOk: j.primaryOk }, costs: { c1: j.c1, c2: j.c2, c3: j.c3, costsOk: j.costsOk }, bTrigger: j.bTrigger, poolEmptyShare: j.poolEmptyShare, ctl: ctl, arm: arm };
}

// ---- selftest ----
let failures = 0;
function assert(c, m) { if (c) console.log('ok: ' + m); else { failures++; console.error('FAIL: ' + m); } }
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function mkFile(seed, gameDays, seeds, holderDays, deaths, extra) {
  return Object.assign({ seed: seed, gameDays: gameDays, days: gameDays, endReason: 'horizon', standing: 120, scaleRank: 'village', won: false, maxWave: 4, villageLost: false, tableActive: false, instrumentErrors: [], deaths: deaths || [], seeds: seeds, holderDays: holderDays }, extra || {});
}
function seedRow(vid, day, mid, retKind, extra) {
  return Object.assign({ day: day, vid: vid, mid: mid, wave: 4, outcome: 'fled', retKind: retKind, retStage: 'party', preTarget: null, preStage: null, isScholar: false, awayPurpose: null, awayDuration: null, profile: 'wanderer', range: 3 }, extra || {});
}
function hrow(vid, day, target, stage, party, extra) {
  return Object.assign({ day: day, vid: vid, holderIsScholar: false, target: target, needWave: 4, stage: stage, party: party || [], holderAlive: true, holderNode: { nx: 4, ny: 4 }, holderExped: false, holderAway: null, holderObjective: null, holderProfile: 'wanderer', holderRange: 3, holderSick: false, holderHealth: 100, holderGear: { armed: true, armored: true }, holderBlock: null, haven: { nx: 4, ny: 4 }, poolCounts: { selfOrScholar: 2, dead: 0, away: 0, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 0, onExped: 0, eligible: 3 }, poolEligible: ['a', 'b', 'c'], poolRankedPick: 'a', poolFails: {}, calls: {} }, extra || {});
}
function selftest() {
  // launched-party: seed d10, hunt with 2 companions d14.
  let f = mkFile(1, 150, [seedRow('v1', 10, 'influencer', 'created')],
    [hrow('v1', 10, 'influencer', 'party', []), hrow('v1', 12, 'influencer', 'party', []), hrow('v1', 14, 'influencer', 'hunt', ['c1', 'c2'])]);
  let c = classifySeed(f, f.seeds[0], 0);
  assert(c.status === 'launched-party' && c.partySize === 3, 'selftest launched-party detected (party 3, d14)');
  // launched-solo: hunt with an empty party.
  f = mkFile(1, 150, [seedRow('v1', 10, 'reunion', 'created')],
    [hrow('v1', 10, 'reunion', 'party', []), hrow('v1', 13, 'reunion', 'hunt', [])]);
  c = classifySeed(f, f.seeds[0], 0);
  assert(c.status === 'launched-solo' && c.partySize === 1, 'selftest launched-solo detected');
  // retargeted: a second created seed for the same holder ends the first.
  f = mkFile(1, 150, [seedRow('v1', 10, 'influencer', 'created'), seedRow('v1', 20, 'herald', 'created')],
    [hrow('v1', 10, 'influencer', 'party', []), hrow('v1', 20, 'herald', 'party', []), hrow('v1', 25, 'herald', 'hunt', ['c1'])]);
  c = classifySeed(f, f.seeds[0], 0);
  assert(c.status === 'retargeted', 'selftest first seed retargeted by the second');
  c = classifySeed(f, f.seeds[1], 1);
  assert(c.status === 'launched-party', 'selftest second seed launches with a party');
  // stalled pool-empty: party stage to run end, eligible 0.
  f = mkFile(1, 150, [seedRow('v1', 10, 'influencer', 'created')],
    [hrow('v1', 10, 'influencer', 'party', [], { poolCounts: { selfOrScholar: 2, dead: 0, away: 5, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 4, onExped: 0, eligible: 0 }, poolEligible: [] }),
     hrow('v1', 149, 'influencer', 'party', [], { poolCounts: { selfOrScholar: 2, dead: 0, away: 5, trustLow: 0, notAtHaven: 0, engaged: 0, notRanger: 4, onExped: 0, eligible: 0 }, poolEligible: [] })]);
  c = classifySeed(f, f.seeds[0], 0);
  assert(c.status === 'stalled' && c.stallShape === 'pool-empty', 'selftest stalled pool-empty classified');
  // stalled range-0: holder block wins over the pool read.
  f = mkFile(1, 150, [seedRow('v1', 10, 'influencer', 'created')],
    [hrow('v1', 149, 'influencer', 'party', [], { holderBlock: 'range-0', holderRange: 0, holderProfile: 'homebody' })]);
  c = classifySeed(f, f.seeds[0], 0);
  assert(c.status === 'stalled' && c.stallShape === 'range-0-holder', 'selftest stalled range-0 classified');
  // deleted on holder death: rows stop mid-run, death recorded.
  f = mkFile(1, 150, [seedRow('v1', 10, 'influencer', 'created')],
    [hrow('v1', 10, 'influencer', 'party', []), hrow('v1', 40, 'influencer', 'party', [])],
    [{ day: 41, kind: 'villager', who: 'v1', cause: 'combat', player: false }]);
  c = classifySeed(f, f.seeds[0], 0);
  assert(c.status === 'deleted' && /died/.test(c.detail), 'selftest deleted-on-death classified');
  // PARTYFUNNEL reassignment chain: seed v1 d10, holder dies, the plan
  // moves to v2 (haven-successor) and launches with a party there.
  f = mkFile(1, 150, [seedRow('v1', 10, 'influencer', 'created')],
    [hrow('v1', 10, 'influencer', 'party', []), hrow('v1', 15, 'influencer', 'party', []),
     hrow('v2', 16, 'influencer', 'party', []), hrow('v2', 20, 'influencer', 'hunt', ['c1'])],
    [{ day: 16, kind: 'villager', who: 'v1', cause: 'combat', player: false }],
    { reassignments: [{ day: 16, vid: 'v1', preTarget: 'influencer', preNeedWave: 4, preStage: 'party', preParty: [], reassignedTo: 'v2', reassignVia: 'haven-successor' }] });
  c = classifySeed(f, f.seeds[0], 0);
  assert(c.status === 'launched-party' && c.reassigned === true && c.reassignCount === 1 && c.finalHolder === 'v2' && c.day === 20,
    'selftest reassigned-then-launches classified (v1->v2 haven-successor, hunt d20)');
  // Reassigned, then the successor dies too: deleted, still reassigned.
  f = mkFile(1, 150, [seedRow('v1', 10, 'influencer', 'created')],
    [hrow('v1', 10, 'influencer', 'party', []),
     hrow('v2', 12, 'influencer', 'party', []), hrow('v2', 14, 'influencer', 'party', [])],
    [{ day: 12, kind: 'villager', who: 'v1', cause: 'combat', player: false },
     { day: 15, kind: 'villager', who: 'v2', cause: 'combat', player: false }],
    { reassignments: [{ day: 12, vid: 'v1', preTarget: 'influencer', preNeedWave: 4, preStage: 'party', preParty: [], reassignedTo: 'v2', reassignVia: 'party-member' }] });
  c = classifySeed(f, f.seeds[0], 0);
  assert(c.status === 'deleted' && /died/.test(c.detail) && c.reassigned === true && c.finalHolder === 'v2',
    'selftest reassigned-then-deleted classified (successor died, detail names the death)');
  // Reassigned, then the successor retargets: retargeted, still reassigned.
  f = mkFile(1, 150, [seedRow('v1', 10, 'influencer', 'created'),
      seedRow('v2', 20, 'herald', 'retargeted', { preStage: 'party', preTarget: 'influencer', postTarget: 'herald', postNeedWave: 4 })],
    [hrow('v1', 10, 'influencer', 'party', []),
     hrow('v2', 12, 'influencer', 'party', [])],
    [{ day: 12, kind: 'villager', who: 'v1', cause: 'combat', player: false }],
    { reassignments: [{ day: 12, vid: 'v1', preTarget: 'influencer', preNeedWave: 4, preStage: 'party', preParty: [], reassignedTo: 'v2', reassignVia: 'haven-successor' }] });
  c = classifySeed(f, f.seeds[0], 0);
  assert(c.status === 'retargeted' && c.reassigned === true && c.finalHolder === 'v2',
    'selftest reassigned-then-retargeted classified');
  // A reassignment row for a DIFFERENT target does not move this seed:
  // the plan retargeted before the holder died, so the chain stays put.
  f = mkFile(1, 150, [seedRow('v1', 10, 'influencer', 'created')],
    [hrow('v1', 10, 'influencer', 'party', []), hrow('v1', 40, 'influencer', 'party', [])],
    [{ day: 41, kind: 'villager', who: 'v1', cause: 'combat', player: false }],
    { reassignments: [{ day: 41, vid: 'v1', preTarget: 'herald', preNeedWave: 4, preStage: 'party', preParty: [], reassignedTo: 'v2', reassignVia: 'haven-successor' }] });
  c = classifySeed(f, f.seeds[0], 0);
  assert(c.status === 'deleted' && c.reassigned === false,
    'selftest wrong-target reassignment row ignored (chain stays with v1)');
  // refused-null seeds never reach classifySeed (analyzer skips them);
  // judge: floor, primary, costs, bTrigger.
  const leg = function (seeded, launched, med, starv, comm, stalled, poolEmpty) {
    return { seededW4: seeded, launchedParty: launched, rate: seeded ? launched / seeded : null, medianSurvival: med, starvDeaths: starv, communityLost: comm, stalled: stalled, stallShapes: { 'pool-empty': poolEmpty } };
  };
  let j = judge(leg(10, 1, 140, 2, 0, 8, 2), leg(10, 6, 138, 3, 0, 3, 1));
  assert(j.verdict === 'GO', 'selftest GO: arm 6/10 vs ctl 1/10, costs pass');
  j = judge(leg(10, 4, 140, 2, 0, 5, 1), leg(10, 4, 138, 3, 0, 5, 1));
  assert(j.verdict === 'NO-GO', 'selftest NO-GO: arm 4/10 < 50%');
  j = judge(leg(10, 0, 140, 2, 0, 9, 1), leg(10, 5, 138, 3, 0, 4, 1));
  assert(j.verdict === 'GO', 'selftest GO: ctl rate 0, arm 5/10 (ratio over zero)');
  j = judge(leg(5, 1, 140, 2, 0, 4, 1), leg(5, 3, 138, 3, 0, 2, 1));
  assert(j.verdict === 'METRIC-BROKEN', 'selftest METRIC-BROKEN: floor < 8');
  j = judge(leg(10, 1, 140, 2, 0, 8, 1), leg(10, 6, 100, 3, 0, 3, 1));
  assert(j.verdict === 'NO-GO' && !j.c1.pass, 'selftest NO-GO on C1 survival (100 < 0.8x140)');
  j = judge(leg(10, 1, 140, 2, 0, 8, 1), leg(10, 6, 138, 5, 0, 3, 1));
  assert(j.verdict === 'NO-GO' && !j.c2.pass, 'selftest NO-GO on C2 starvation (5 > 2+2)');
  j = judge(leg(10, 1, 140, 2, 0, 8, 1), leg(10, 6, 138, 3, 2, 3, 1));
  assert(j.verdict === 'NO-GO' && !j.c3.pass, 'selftest NO-GO on C3 community (2 > 0+1)');
  j = judge(leg(10, 1, 140, 2, 0, 8, 6), leg(10, 3, 138, 3, 0, 7, 5));
  assert(j.bTrigger === true, 'selftest (b)-trigger: pool-empty 5/7 stalled, arm rate 3/10');
  j = judge(leg(10, 1, 140, 2, 0, 8, 6), leg(10, 6, 138, 3, 0, 3, 1));
  assert(j.bTrigger === false, 'selftest (b)-trigger off when the pilot passes');
  // stallShapeOf precedence: scholar beats leaver beats range-0 beats hurt beats pool-empty.
  assert(stallShapeOf({ holderIsScholar: true, holderAway: { purpose: 'leave' }, holderBlock: 'range-0', poolCounts: { eligible: 0 } }) === 'scholar-holder', 'selftest shape precedence scholar');
  assert(stallShapeOf({ holderIsScholar: false, holderAway: { purpose: 'leave' }, holderBlock: 'range-0', poolCounts: { eligible: 0 } }) === 'leaver', 'selftest shape precedence leaver');
  assert(stallShapeOf({ holderIsScholar: false, holderAway: null, holderBlock: 'range-0', poolCounts: { eligible: 0 } }) === 'range-0-holder', 'selftest shape precedence range-0');
  assert(stallShapeOf({ holderIsScholar: false, holderAway: null, holderBlock: 'hurt-no-medicine-no-healer', poolCounts: { eligible: 0 } }) === 'hurt', 'selftest shape precedence hurt');
  assert(stallShapeOf({ holderIsScholar: false, holderAway: null, holderBlock: null, poolCounts: { eligible: 0 } }) === 'pool-empty', 'selftest shape pool-empty');
  // planAfterSeed: only the LIVE post-call fields decide. Legacy rows
  // (no postTarget — first pilot run) are unclassifiable, never
  // derived-from: their preTarget/preStage were read after the
  // mutating call, so the pre-call state is lost.
  assert(planAfterSeed(seedRow('v1', 10, 'influencer', 'retargeted', { preStage: 'party', preTarget: 'buffering', postTarget: 'influencer', postNeedWave: 4 })).postTarget === 'influencer' &&
    planAfterSeed(seedRow('v1', 10, 'influencer', 'retargeted', { preStage: 'party', preTarget: 'buffering', postTarget: 'influencer', postNeedWave: 4 })).postIsWave4 === true,
    'selftest planAfterSeed: live postTarget wins; party-stage retarget leaves a wave-4 plan');
  assert(planAfterSeed(seedRow('v1', 10, 'algorithm', 'existing', { preStage: 'hunt', preTarget: 'buffering', postTarget: 'buffering', postNeedWave: 3 })).postTarget === 'buffering' &&
    planAfterSeed(seedRow('v1', 10, 'algorithm', 'existing', { preStage: 'hunt', preTarget: 'buffering', postTarget: 'buffering', postNeedWave: 3 })).postIsWave4 === false,
    'selftest planAfterSeed: hunt-stage call leaves the old wave-3 plan behind');
  assert(planAfterSeed(seedRow('v1', 10, 'influencer', 'created', { preStage: null, preTarget: null, postTarget: 'influencer', postNeedWave: 4 })).postTarget === 'influencer' &&
    planAfterSeed(seedRow('v1', 10, 'influencer', 'created', { preStage: null, preTarget: null, postTarget: 'influencer', postNeedWave: 4 })).postIsWave4 === true,
    'selftest planAfterSeed: created seed takes the new wave-4 target');
  assert(planAfterSeed(seedRow('v1', 10, 'algorithm', 'retargeted', { preStage: 'hunt', preTarget: 'buffering' })).legacy === true,
    'selftest planAfterSeed: row without postTarget is legacy/unclassifiable');
  // isTrueSeedEvent: only creates and gear/party-stage retargets.
  assert(isTrueSeedEvent(seedRow('v1', 10, 'influencer', 'created', { preStage: null, postTarget: 'influencer', postNeedWave: 4 })) === true,
    'selftest isTrueSeedEvent: created counts');
  assert(isTrueSeedEvent(seedRow('v1', 10, 'influencer', 'retargeted', { preStage: 'party', preTarget: 'buffering', postTarget: 'influencer', postNeedWave: 4 })) === true,
    'selftest isTrueSeedEvent: party-stage retarget counts');
  assert(isTrueSeedEvent(seedRow('v1', 10, 'algorithm', 'existing', { preStage: 'hunt', preTarget: 'influencer', postTarget: 'influencer', postNeedWave: 4 })) === false,
    'selftest isTrueSeedEvent: hunt-stage no-op does not count even with a wave-4 plan');
  assert(isTrueSeedEvent(seedRow('v1', 10, 'algorithm', 'retargeted', { preStage: 'hunt', preTarget: 'buffering' })) === false,
    'selftest isTrueSeedEvent: legacy retargeted row does not count');
  // analyzeLeg end-to-end on a temp corpus: the hunt-stage no-op is
  // excluded from the denominator, the party-stage retarget counts and
  // launches, the legacy row is counted unclassifiable, the band
  // census counts the engagement-seeded launch.
  (function () {
    const os = require('os');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pfself-'));
    const f1 = mkFile(1, 150,
      [seedRow('v1', 10, 'algorithm', 'existing', { preStage: 'hunt', preTarget: 'buffering', postTarget: 'buffering', postNeedWave: 3 }),
       seedRow('v2', 12, 'influencer', 'retargeted', { preStage: 'party', preTarget: 'buffering', postTarget: 'influencer', postNeedWave: 4 }),
       seedRow('v4', 14, 'reunion', 'retargeted', { preStage: 'hunt', preTarget: 'buffering' }),
       seedRow('v5', 16, 'algorithm', 'retargeted', { preStage: 'party', preTarget: 'buffering', postTarget: 'buffering', postNeedWave: 3 })],
      [hrow('v2', 12, 'influencer', 'party', []), hrow('v2', 15, 'influencer', 'hunt', ['c1']),
       hrow('v3', 20, 'reunion', 'hunt', ['c1', 'c2'])]);
    fs.writeFileSync(path.join(dir, 's1.json'), JSON.stringify(f1));
    const leg = analyzeLeg(dir, 't');
    assert(leg.seededW4 === 1, 'selftest analyzeLeg: hunt-stage no-op excluded, denominator is 1 (got ' + leg.seededW4 + ')');
    assert(leg.launchedParty === 1, 'selftest analyzeLeg: true retarget launches with a party');
    assert(leg.nonW4Seeds === 1, 'selftest analyzeLeg: 1 wave-4 call leaving a non-wave-4 plan excluded');
    assert(leg.legacyUnclassifiable === 1, 'selftest analyzeLeg: 1 legacy row counted unclassifiable (got ' + leg.legacyUnclassifiable + ')');
    assert(leg.bandHuntParty === 2, 'selftest analyzeLeg: band census counts both hunt-with-party holders (got ' + leg.bandHuntParty + ')');
    try { fs.unlinkSync(path.join(dir, 's1.json')); fs.rmdirSync(dir); } catch (e) {}
  })();
  // PARTYFUNNEL leg-level counts: retargetHolds (a party-stage 'existing'
  // call for another wave-4 beast), reassignNoSuccessor (a pre-kill
  // wave-4 death cleanup with no successor), reassigned aggregates.
  (function () {
    const os = require('os');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pfself-'));
    const f1 = mkFile(1, 150,
      [seedRow('v1', 10, 'influencer', 'created', { postTarget: 'influencer', postNeedWave: 4 }),
       seedRow('v1', 20, 'reunion', 'existing', { preStage: 'party', preTarget: 'influencer', postTarget: 'influencer', postNeedWave: 4 })],
      [hrow('v1', 10, 'influencer', 'party', []), hrow('v1', 14, 'influencer', 'hunt', ['c1'])],
      [],
      { reassignments: [{ day: 30, vid: 'v9', preTarget: 'eulogy', preNeedWave: 4, preStage: 'party', preParty: [], reassignedTo: null }] });
    const f2 = mkFile(2, 150,
      [seedRow('v3', 10, 'eulogy', 'created', { postTarget: 'eulogy', postNeedWave: 4 })],
      [hrow('v3', 10, 'eulogy', 'party', []),
       hrow('v4', 12, 'eulogy', 'party', []), hrow('v4', 15, 'eulogy', 'hunt', ['c1'])],
      [{ day: 12, kind: 'villager', who: 'v3', cause: 'combat', player: false }],
      { reassignments: [{ day: 12, vid: 'v3', preTarget: 'eulogy', preNeedWave: 4, preStage: 'party', preParty: [], reassignedTo: 'v4', reassignVia: 'party-member' }] });
    fs.writeFileSync(path.join(dir, 's1.json'), JSON.stringify(f1));
    fs.writeFileSync(path.join(dir, 's2.json'), JSON.stringify(f2));
    const leg = analyzeLeg(dir, 't');
    assert(leg.seededW4 === 2, 'selftest analyzeLeg funnel: denominator is 2 (got ' + leg.seededW4 + ')');
    assert(leg.launchedParty === 2, 'selftest analyzeLeg funnel: both seeds launch with a party');
    assert(leg.retargetHolds === 1, 'selftest analyzeLeg funnel: 1 retarget-hold counted (got ' + leg.retargetHolds + ')');
    assert(leg.reassignNoSuccessor === 1, 'selftest analyzeLeg funnel: 1 no-successor death counted (got ' + leg.reassignNoSuccessor + ')');
    assert(leg.reassigned === 1, 'selftest analyzeLeg funnel: 1 reassigned plan (got ' + leg.reassigned + ')');
    assert(leg.reassignedLaunched === 1, 'selftest analyzeLeg funnel: the reassigned plan launched (got ' + leg.reassignedLaunched + ')');
    assert((leg.reassignVias || {})['party-member'] === 1, 'selftest analyzeLeg funnel: via party-member counted');
    try { fs.unlinkSync(path.join(dir, 's1.json')); fs.unlinkSync(path.join(dir, 's2.json')); fs.rmdirSync(dir); } catch (e) {}
  })();
  console.log(failures === 0 ? 'SELFTEST ALL PASS' : failures + ' SELFTEST FAILURES');
  return failures === 0;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) { process.exit(selftest() ? 0 : 1); }
  const arg = function (name) { const i = args.indexOf('--' + name); return i < 0 ? null : args[i + 1]; };
  const ctlDir = arg('ctl'), armDir = arg('arm'), out = arg('out');
  if (!ctlDir || !armDir) { console.error('usage: node scripts/analyze-partyfunnel-a.js --ctl <dir> --arm <dir> [--out <file>]'); process.exit(2); }
  const a = analyze(ctlDir, armDir);
  if (out) fs.writeFileSync(out, JSON.stringify(a, null, 2) + '\n');
  console.log('verdict: ' + a.verdict + ' — ' + a.reason);
  console.log('primary: ctl ' + a.primary.ctlLaunchedParty + '/' + a.primary.ctlSeeded + ' = ' + a.primary.ctlRate +
    '  arm ' + a.primary.armLaunchedParty + '/' + a.primary.armSeeded + ' = ' + a.primary.armRate +
    '  (solo ctl ' + a.ctl.launchedSolo + ' arm ' + a.arm.launchedSolo + ')');
  console.log('stall shapes arm: ' + JSON.stringify(a.arm.stallShapes) + '  ctl: ' + JSON.stringify(a.ctl.stallShapes));
  console.log('refusals arm: scholar ' + a.arm.refusedScholar + ' leaver ' + a.arm.refusedLeaver + ' other ' + a.arm.refusedOther +
    '  | scholar/leaver wave>=3 calls ctl: ' + a.ctl.wouldBeRefused + ' arm: ' + a.arm.wouldBeRefused +
    '  | non-wave-4 seeds excluded ctl: ' + a.ctl.nonW4Seeds + ' arm: ' + a.arm.nonW4Seeds +
    '  | legacy unclassifiable seeds ctl: ' + a.ctl.legacyUnclassifiable + ' arm: ' + a.arm.legacyUnclassifiable);
  console.log('band-wide first hunts: party ctl ' + a.ctl.bandHuntParty + ' arm ' + a.arm.bandHuntParty +
    '  solo ctl ' + a.ctl.bandHuntSolo + ' arm ' + a.arm.bandHuntSolo);
  console.log('funnel: reassigned plans ctl ' + a.ctl.reassigned + ' arm ' + a.arm.reassigned +
    '  (of which launched-party ctl ' + a.ctl.reassignedLaunched + ' arm ' + a.arm.reassignedLaunched + ')' +
    '  vias arm ' + JSON.stringify(a.arm.reassignVias) +
    '  | no-successor ctl ' + a.ctl.reassignNoSuccessor + ' arm ' + a.arm.reassignNoSuccessor +
    '  | retarget-holds ctl ' + a.ctl.retargetHolds + ' arm ' + a.arm.retargetHolds);
  console.log('costs: C1 medianSurvival ctl ' + a.costs.c1.ctl + ' arm ' + a.costs.c1.arm + ' ratio ' + a.costs.c1.ratio +
    '  C2 starvation ctl ' + a.costs.c2.ctl + ' arm ' + a.costs.c2.arm +
    '  C3 community ctl ' + a.costs.c3.ctl + ' arm ' + a.costs.c3.arm);
  console.log('wall: national-standing ctl ' + a.ctl.wall.nationalStanding + '/' + a.ctl.files + ' arm ' + a.arm.wall.nationalStanding + '/' + a.arm.files +
    '  national-rank ctl ' + a.ctl.wall.nationalRank + ' arm ' + a.arm.wall.nationalRank +
    '  table ctl ' + a.ctl.wall.table + ' arm ' + a.arm.wall.table +
    '  wins ctl ' + a.ctl.wall.wins + ' arm ' + a.arm.wall.wins +
    '  wave4 ctl ' + a.ctl.wall.wave4 + ' arm ' + a.arm.wall.wave4 +
    '  wave5 ctl ' + a.ctl.wall.wave5 + ' arm ' + a.arm.wall.wave5);
  console.log('(b)-trigger: ' + (a.bTrigger ? 'YES' : 'no') + ' (pool-empty share arm ' + a.poolEmptyShare + ')');
  console.log('instrument errors: ctl ' + a.ctl.instrumentErrors + ' arm ' + a.arm.instrumentErrors);
}

if (require.main === module) {
  main().catch(function (e) { console.error(e && e.stack || e); process.exit(1); });
}
module.exports = { classifySeed: classifySeed, stallShapeOf: stallShapeOf, analyzeLeg: analyzeLeg, judge: judge, analyze: analyze, selftest: selftest };
