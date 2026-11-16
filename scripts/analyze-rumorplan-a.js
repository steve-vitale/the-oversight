// analyze-rumorplan-a.js — classifier + lifecycle analyzer for arm
// sim-rumorplan-a (DIAG). Implements the frozen definitions from
// evidence/2026-11-16/sim-rumorplan-a-prereg.md (incl. Correction 1:
// a launch is an expedition START, not a depart-call 'launch').
// Subject: EVERY hunt-stage plan instance on the band, traced from
// birth (creation) to launch-or-death. Origin precedence (first
// match wins): companion-inherited > seed-created >
// seeded-then-lost > haven-born > unknown (Correction 2: bucket 2
// is `haven-born` — a plan born target-null at Haven stays
// haven-born even if a seed sets its target before hunt; the
// seededBeforeHunt flag carries that fact).
// Q1: do rumor-born (heard-at-fire) instances EVER convert to a
// named-beast wave-4+ hunt launch? Q2: what share of wave-4+
// launched plans are rumor-born vs fought-personally vs
// companion-inherited? Q3: what do launched target-null trips do?
// Usage:
//   node scripts/analyze-rumorplan-a.js <mainDir> [replicationDir]
// Writes evidence/2026-11-16/rumorplan-a-analysis.json. Exits 0 iff
// every hunt-stage plan instance in the main leg is classified
// (unknown <= 10%), all files parse, and no instrument errors.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');

const W4_IDS_FROZEN = ['algorithm', 'audit', 'congregation', 'eater', 'eulogy', 'herald', 'influencer', 'reunion', 'strike', 'suburb'];
const W5_IDS_FROZEN = ['cancellation', 'editor', 'finale', 'finale_crew', 'finale_opening', 'network_note', 'nielsen', 'rerun', 'spoiler', 'timeslot'];
const BUCKETS = ['companion-inherited', 'seed-created', 'seeded-then-lost', 'haven-born', 'unknown'];
// Q2 origin labels (collapsed for the share table): haven-born splits
// into its sub-reasons; the rest map 1:1 onto buckets.
const ORIGINS = ['heard-at-fire', 'fought-personally', 'created-by-read', 'companion-inherited', 'seed-created', 'seeded-then-lost', 'unknown'];

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
function waveMaps() {
  let liveW4 = null, liveW5 = null;
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    const list = raw.monsters || raw;
    liveW4 = list.filter(function (m) { return m.wave === 4; }).map(function (m) { return m.id; }).sort();
    liveW5 = list.filter(function (m) { return m.wave === 5; }).map(function (m) { return m.id; }).sort();
  } catch (e) {}
  return { liveW4: liveW4, liveW5: liveW5,
    w4Match: liveW4 && JSON.stringify(liveW4) === JSON.stringify(W4_IDS_FROZEN.slice().sort()),
    w5Match: liveW5 && JSON.stringify(liveW5) === JSON.stringify(W5_IDS_FROZEN.slice().sort()) };
}
const WM = waveMaps();
const W4_SET = new Set(W4_IDS_FROZEN);
const W5_SET = new Set(W5_IDS_FROZEN);
const W45_SET = new Set(W4_IDS_FROZEN.concat(W5_IDS_FROZEN));
function isW45(mid) { return !!mid && W45_SET.has(mid); }
function waveOfTarget(mid) {
  if (!mid) return null;
  if (W4_SET.has(mid)) return 4;
  if (W5_SET.has(mid)) return 5;
  return null;
}
function originOf(inst) {
  if (!inst || inst.bucket === 'unknown') return 'unknown';
  if (inst.bucket === 'haven-born') return inst.sub || 'unknown';
  return inst.bucket;
}

function classifyRumor(j) {
  const errors = (j.instrumentErrors || []).slice();
  const bounces = (j.seedattachBounces || []).slice();
  const creations = (j.seedattachCreations || []).slice();
  const saLaunches = (j.seedattachLaunches || []).slice();
  const census = (j.seedattachCensus || []).slice();
  const rumorLaunches = (j.rumorplanLaunches || []).slice();
  const targetDiffs = (j.rumorplanTargetDiffs || []).slice();
  const encounters = (j.v4encounters || []).slice();
  const v4seeds = (j.v4seeds || []).slice();
  const deaths = (j.deaths || []).slice();
  const finalDay = j.gameDays || j.days || 0;
  const maxCensusDay = census.reduce(function (m, r) { return Math.max(m, r.day || 0); }, 0) || finalDay;

  // ---- Secondary counts: every seed call by class (as seedattach) ----
  const secondary = { seedCallsW4: 0, seedCallsW3: 0, opened: 0, noPlanCreated: 0,
    bouncedNullHunt: 0, bouncedTargeted: 0, other: 0 };
  for (const b of bounces) {
    if ((b.wave | 0) >= 4) secondary.seedCallsW4++;
    else if ((b.wave | 0) === 3) secondary.seedCallsW3++;
    else continue;
    if (b.stageBefore == null && b.targetAfter != null) secondary.noPlanCreated++;
    else if ((b.stageBefore === 'gear' || b.stageBefore === 'party') && b.targetAfter != null) secondary.opened++;
    else if (b.stageBefore === 'hunt' && b.targetBefore == null) secondary.bouncedNullHunt++;
    else if ((b.stageBefore === 'hunt' || b.stageBefore === 'standing' || b.stageBefore === 'table') && b.targetBefore != null) secondary.bouncedTargeted++;
    else secondary.other++;
  }

  // ---- Plan instances: one per creation event, windowed ----
  // A seed-create bounce (stageBefore null, targetAfter non-null) is a
  // creation the winPlanOf/HavenTick wraps cannot see (the seed creates
  // the plan itself) — synthesize a creation row for it so the instance
  // is not origin-less. Synthetic creations are marked createdBy
  // 'winPlanSeedFromFight'.
  const allCreations = creations.slice();
  for (const b of bounces) {
    if (b.stageBefore == null && b.targetAfter != null) {
      const dup = allCreations.some(function (c) { return c.vid === b.vid && c.day === b.day; });
      if (!dup) {
        allCreations.push({ day: b.day, vid: b.vid, createdBy: 'winPlanSeedFromFight',
          creatorSite: 'win-plan.js:winPlanSeedFromFight', fought: [], villageSlainTotal: null,
          stageAtCreation: 'gear', targetAtCreation: b.targetAfter, synthetic: true });
      }
    }
  }
  allCreations.sort(function (a, b) { return (a.day - b.day) || (a.vid < b.vid ? -1 : 1); });
  const instances = [];
  const instByKey = {};
  const creationsByVid = {};
  for (const c of allCreations) (creationsByVid[c.vid] = creationsByVid[c.vid] || []).push(c);
  for (const vid of Object.keys(creationsByVid)) {
    const list = creationsByVid[vid];
    for (let i = 0; i < list.length; i++) {
      const c = list[i];
      const next = list[i + 1] || null;
      const inst = { vid: vid, key: vid + '|create|' + c.day,
        creation: { day: c.day, createdBy: c.createdBy, creatorSite: c.creatorSite,
          fought: c.fought || [], villageSlainTotal: c.villageSlainTotal,
          stageAtCreation: c.stageAtCreation, targetAtCreation: c.targetAtCreation,
          synthetic: !!c.synthetic },
        windowEndDay: next ? next.day - 1 : finalDay,
        supersededBy: next ? next.day : null,
        census: [], bounces: [], saLaunchesAsCompanion: [], rumorLaunches: [],
        targetDiffs: [] };
      instances.push(inst);
      instByKey[inst.key] = inst;
    }
  }
  function instFor(vid, day) {
    // The instance whose creation window contains `day` (creation day
    // through the day before the next creation for the same vid).
    let best = null;
    for (const inst of instances) {
      if (inst.vid !== vid) continue;
      if (day >= inst.creation.day && day <= inst.windowEndDay) {
        if (!best || inst.creation.day > best.creation.day) best = inst;
      }
    }
    return best;
  }
  for (const r of census) { const inst = instFor(r.vid, r.day); if (inst) inst.census.push(r); }
  for (const b of bounces) { const inst = instFor(b.vid, b.day); if (inst) inst.bounces.push(b); }
  for (const l of saLaunches) { const inst = instFor(l.companion, l.day); if (inst) inst.saLaunchesAsCompanion.push(l); }
  for (const l of rumorLaunches) { const inst = instFor(l.vid, l.day); if (inst) inst.rumorLaunches.push(l); }
  for (const t of targetDiffs) { const inst = instFor(t.vid, t.day); if (inst) inst.targetDiffs.push(t); }
  for (const inst of instances) {
    inst.census.sort(function (a, b) { return a.day - b.day; });
    inst.bounces.sort(function (a, b) { return a.day - b.day; });
    inst.rumorLaunches.sort(function (a, b) { return a.day - b.day; });
    inst.targetDiffs.sort(function (a, b) { return a.day - b.day; });
  }

  // ---- Hunt entry + population ----
  for (const inst of instances) {
    let huntDay = null, huntHow = null;
    for (const r of inst.census) {
      if (r.stage === 'hunt') { huntDay = r.day; huntHow = 'census'; break; }
    }
    for (const l of inst.rumorLaunches) {
      if (!launchedRow(l)) continue;
      if (l.stageAfter === 'hunt' || l.stageBefore === 'hunt') {
        if (huntDay == null || l.day < huntDay) { huntDay = l.day; huntHow = 'launch'; }
      }
    }
    inst.huntEntryDay = huntDay;
    inst.huntEntryHow = huntHow;
    inst.isHuntStage = huntDay != null;
  }
  const huntInstances = instances.filter(function (i) { return i.isHuntStage; });

  // ---- Wave-4+ relevance per instance ----
  for (const inst of huntInstances) {
    let rel = false, relWhy = null;
    for (const r of inst.census) {
      if ((r.needWave | 0) >= 4) { rel = true; relWhy = 'needWave>=' + r.needWave; break; }
      if (isW45(r.target)) { rel = true; relWhy = 'target:' + r.target; break; }
    }
    if (!rel) for (const b of inst.bounces) {
      if ((b.wave | 0) >= 4) { rel = true; relWhy = 'wave4-bounce:' + b.mid; break; }
      if (isW45(b.targetAfter)) { rel = true; relWhy = 'seed-target:' + b.targetAfter; break; }
    }
    if (!rel) for (const l of inst.rumorLaunches) {
      if (isW45(l.targetAfter) || (l.needWaveAfter | 0) >= 4) { rel = true; relWhy = 'launch-target:' + l.targetAfter; break; }
    }
    inst.wave4Relevant = rel;
    inst.wave4RelevantWhy = relWhy;
  }

  // ---- Origin classification per instance (all instances, so a
  // party-stage launch with a wave-4+ target can be origin-classified
  // for Q2 even when its plan never reaches hunt; the judged
  // population/bar still uses huntInstances only). Evidence is scoped
  // to on/before the hunt-entry day for hunt instances, to run end
  // otherwise.
  for (const inst of instances) {
    const vid = inst.vid;
    const huntDay = inst.huntEntryDay;
    const scopeDay = huntDay != null ? huntDay : finalDay;
    // Companion-launch evidence on/before hunt entry, from BOTH row
    // sets. A rumorplan companion row's inviter target comes from the
    // matching inviter row of the same (day, inviter) event.
    const compEvents = [];
    for (const l of inst.saLaunchesAsCompanion) {
      if (l.day > scopeDay) continue;
      compEvents.push({ day: l.day, path: l.path, inviter: l.vid,
        inviterTargetBefore: l.inviterTargetBefore,
        companionTargetBefore: l.companionTargetBefore,
        companionTargetAfter: l.companionTargetAfter });
    }
    for (const l of inst.rumorLaunches) {
      if (l.role !== 'companion' || l.day > scopeDay) continue;
      let invTarget = null;
      const invRow = rumorLaunches.find(function (r) {
        return r.role === 'inviter' && r.inviter === l.inviter && r.day === l.day && r.vid === l.inviter;
      });
      if (invRow) invTarget = invRow.targetBefore;
      compEvents.push({ day: l.day, path: l.path, inviter: l.inviter,
        inviterTargetBefore: invTarget,
        companionTargetBefore: l.targetBefore,
        companionTargetAfter: l.targetAfter });
    }
    inst.companionLaunchEvents = compEvents;
    // Seed-set events for this instance before hunt entry (target
    // null -> non-null while gear/party): bounces + census diffs.
    const seedSets = [];
    for (const b of inst.bounces) {
      if (b.day >= inst.creation.day && b.day <= scopeDay && b.targetBefore == null && b.targetAfter != null) {
        seedSets.push({ day: b.day, target: b.targetAfter, stage: b.stageBefore, src: 'bounce' });
      }
    }
    for (const t of inst.targetDiffs) {
      if (t.day >= inst.creation.day && t.day <= scopeDay && t.from == null && t.to != null) {
        seedSets.push({ day: t.day, target: t.to, stage: t.stage, src: 'census-diff' });
      }
    }
    inst.seedSetsBeforeHunt = seedSets;
    // Target-ever-non-null before a later null (seeded-then-lost
    // check), scoped to creation..huntEntry.
    let sawTarget = null, lostDay = null;
    const evts = [];
    for (const r of inst.census) if (r.day >= inst.creation.day && r.day <= scopeDay) evts.push({ day: r.day, target: r.target, src: 'census' });
    for (const b of inst.bounces) if (b.day >= inst.creation.day && b.day <= scopeDay) {
      evts.push({ day: b.day, target: b.targetBefore, src: 'bounce-before' });
      evts.push({ day: b.day, target: b.targetAfter, src: 'bounce-after' });
    }
    for (const t of inst.targetDiffs) if (t.day >= inst.creation.day && t.day <= scopeDay) {
      evts.push({ day: t.day, target: t.from, src: 'diff-from' });
      evts.push({ day: t.day, target: t.to, src: 'diff-to' });
    }
    evts.sort(function (a, b) { return a.day - b.day; });
    for (const e of evts) {
      if (e.target != null) { if (sawTarget == null) sawTarget = { day: e.day, target: e.target, src: e.src }; }
      else if (sawTarget) { lostDay = e.day; break; }
    }
    inst.everTargeted = sawTarget;
    inst.targetLostDay = lostDay;
    // First census sighting of this plan (any stage) on/after creation.
    const firstSighting = inst.census.length ? inst.census[0] : null;
    inst.firstSightingStage = firstSighting ? firstSighting.stage : null;
    inst.firstSightingDay = firstSighting ? firstSighting.day : null;

    // ---- Classification (frozen precedence) ----
    let bucket = null, sub = null;
    const companionLaunch = compEvents.find(function (l) {
      return l.companionTargetAfter == null &&
        (l.path === 'brain' ? l.companionTargetBefore == null : l.inviterTargetBefore == null);
    });
    const firstSeenHunt = inst.firstSightingStage === 'hunt';
    // A companion-inherited plan's first census sighting is at hunt
    // (the mirror sets it) — unless the plan left hunt before the
    // next census. A companion rumorLaunch row at hunt stage proves
    // the same entry, so it counts too.
    const enteredHuntAsCompanion = firstSeenHunt ||
      inst.rumorLaunches.some(function (l) { return l.role === 'companion' && l.stageAfter === 'hunt'; });
    const launchCreated = companionLaunch &&
      !(inst.creation.createdBy === 'winPlanHavenTick') &&
      !(inst.creation.day < companionLaunch.day);
    let censusOnlyInviter = null;
    if (!companionLaunch && firstSeenHunt && firstSighting && (firstSighting.party || []).length) {
      const inviterVid = firstSighting.party[0];
      const inviterRow = census.find(function (r) { return r.vid === inviterVid && r.day === firstSighting.day; });
      if (inviterRow && inviterRow.target == null) censusOnlyInviter = inviterVid;
    }
    const havenBornExcluded = inst.creation &&
      (inst.creation.createdBy === 'winPlanHavenTick' ||
        (companionLaunch && inst.creation.day < companionLaunch.day));
    const seedCreated = inst.creation.createdBy === 'winPlanSeedFromFight';
    if (companionLaunch && launchCreated && enteredHuntAsCompanion) {
      bucket = 'companion-inherited';
      sub = companionLaunch.path + ':inviter-' + (companionLaunch.inviter || 'unknown');
    } else if (censusOnlyInviter && !havenBornExcluded) {
      bucket = 'companion-inherited';
      sub = 'census-only:inviter-' + censusOnlyInviter;
    } else if (seedCreated) {
      bucket = 'seed-created';
      sub = 'target:' + (inst.creation.targetAtCreation || 'unknown');
    } else if (inst.everTargeted && inst.targetLostDay != null) {
      bucket = 'seeded-then-lost';
      sub = 'target:' + inst.everTargeted.target + ':lost-day:' + inst.targetLostDay;
    } else if (inst.creation.targetAtCreation == null) {
      bucket = 'haven-born';
      const fought = (inst.creation.fought || []).length > 0;
      if (fought) sub = 'fought-personally';
      else if ((inst.creation.villageSlainTotal | 0) > 0) sub = 'heard-at-fire';
      else sub = 'created-by-read';
    }
    if (!bucket) { bucket = 'unknown'; sub = 'no-rule-matched'; }
    inst.bucket = bucket;
    inst.sub = sub;
    inst.origin = originOf(inst);
    // Correction 2: whether a seed set the target before hunt entry
    // (the conversion shape) — independent of the birth origin.
    inst.seededBeforeHunt = seedSets.length > 0;
  }

  // ---- Launch status, conversion, terminal state per instance ----
  // A rumorLaunch row counts as a launch for its participant only
  // when that participant actually left (expedAfter true; fail-open
  // when the expedition state could not be read). The brain mirror
  // sets the companion's stage to hunt WITHOUT checking the
  // companion's expedition started (villager-brain.js:1046-1050),
  // so a companion row can exist for a companion who stayed home —
  // the profilegate 'companion-not-started' shape. Those rows are
  // counted separately below, not as launches.
  function launchedRow(l) { return l.expedStart === 'unknown' || l.expedAfter === true; }
  let companionNotStarted = 0;
  for (const l of rumorLaunches) {
    if (l.role === 'companion' && !launchedRow(l)) companionNotStarted++;
  }
  for (const inst of huntInstances) {
    let huntLaunches = 0, huntTargetedW4 = 0, huntTargetNull = 0, huntTargetedLower = 0;
    let partyLaunchesW4 = 0, partyLaunches = 0;
    let firstHuntLaunch = null, firstConvertingLaunch = null;
    let firstAcquiredW4 = null, acquireMechanism = null;
    // Acquisition events (wave-4+ target gained) in window order:
    // seed-set bounces, census diffs, launch rows (companion copy).
    const acq = [];
    for (const b of inst.bounces) {
      if (b.targetBefore == null && isW45(b.targetAfter)) acq.push({ day: b.day, target: b.targetAfter, mechanism: 'seed-' + (b.stageBefore || 'unknown') });
    }
    for (const t of inst.targetDiffs) {
      if (t.from == null && isW45(t.to)) acq.push({ day: t.day, target: t.to, mechanism: 'census-diff:' + (t.stage || 'unknown') });
    }
    for (const l of inst.rumorLaunches) {
      if (l.targetBefore == null && isW45(l.targetAfter)) acq.push({ day: l.day, target: l.targetAfter, mechanism: 'companion-copy:' + l.path });
    }
    acq.sort(function (a, b) { return a.day - b.day; });
    if (acq.length) { firstAcquiredW4 = acq[0]; acquireMechanism = acq[0].mechanism; }
    for (const l of inst.rumorLaunches) {
      if (!launchedRow(l)) continue;
      if (l.stageAfter === 'hunt' || l.stageBefore === 'hunt') {
        huntLaunches++;
        if (!firstHuntLaunch) firstHuntLaunch = l;
        if (isW45(l.targetAfter)) {
          huntTargetedW4++;
          if (!firstConvertingLaunch) firstConvertingLaunch = l;
        } else if (l.targetAfter == null) huntTargetNull++;
        else huntTargetedLower++;
      } else if (l.stageAfter === 'party') {
        partyLaunches++;
        if (isW45(l.targetAfter)) partyLaunchesW4++;
      }
    }
    inst.huntLaunches = huntLaunches;
    inst.huntTargetedW4 = huntTargetedW4;
    inst.huntTargetNull = huntTargetNull;
    inst.huntTargetedLower = huntTargetedLower;
    inst.partyLaunches = partyLaunches;
    inst.partyLaunchesW4 = partyLaunchesW4;
    inst.firstHuntLaunchDay = firstHuntLaunch ? firstHuntLaunch.day : null;
    inst.firstConvertingLaunch = firstConvertingLaunch ? { day: firstConvertingLaunch.day, target: firstConvertingLaunch.targetAfter, path: firstConvertingLaunch.path, role: firstConvertingLaunch.role } : null;
    inst.firstAcquiredW4 = firstAcquiredW4;
    inst.acquireMechanism = acquireMechanism;
    const isRumorBorn = inst.origin === 'heard-at-fire';
    inst.converted = isRumorBorn && !!firstConvertingLaunch;
    inst.acquiredButUnlaunched = isRumorBorn && !!firstAcquiredW4 && !firstConvertingLaunch &&
      (!firstHuntLaunch || firstAcquiredW4.day < firstHuntLaunch.day);
    if (huntTargetedW4 > 0) inst.launchStatus = 'launched-targeted';
    else if (huntTargetNull > 0) inst.launchStatus = 'launched-target-null';
    else if (partyLaunches > 0) inst.launchStatus = 'launched-party-stage-only';
    else inst.launchStatus = 'never-launched';
    // Terminal state: last observed state wins. The run-end reference
    // is the last census day in the seed (gameDays can run one past
    // the last census day on a survived run — comparing against it
    // would mislabel a still-present plan as deleted).
    let terminal = 'alive-at-end';
    const lastCensus = inst.census.length ? inst.census[inst.census.length - 1] : null;
    if (inst.supersededBy != null) terminal = 'superseded';
    else if (lastCensus && !lastCensus.holderAlive) terminal = 'holder-died';
    else if (lastCensus && lastCensus.day < maxCensusDay) {
      // Plan gone from census before run end while the holder was
      // alive at last sighting: deleted (tableActive is the only
      // deletion site in code).
      terminal = 'deleted';
    } else if (lastCensus && lastCensus.stage !== 'hunt') terminal = 'churned:' + lastCensus.stage;
    else if (!lastCensus) terminal = 'no-census';
    inst.terminal = terminal;
    inst.lastCensusDay = lastCensus ? lastCensus.day : null;
    inst.lastCensusStage = lastCensus ? lastCensus.stage : null;
  }

  // ---- Q2: launch shares over launched plans (rumorplan rows) ----
  // Headline population (Q2): wave-4+ launched plans — the launched
  // plan satisfies needWave>=4, or targets a wave-4/5 monster, or
  // its instance has a wave-4 bounce in its history (frozen def).
  // Secondary population: ALL hunt-stage launched plans.
  const launchShares = { total: 0, strict: 0, byOrigin: {}, byOriginStrict: {}, unknown: 0, unknownStrict: 0,
    byRole: {}, byPath: {}, byStage: {} };
  const huntLaunchShares = { total: 0, byOrigin: {}, unknown: 0 };
  for (const o of ORIGINS) { launchShares.byOrigin[o] = 0; launchShares.byOriginStrict[o] = 0; huntLaunchShares.byOrigin[o] = 0; }
  const launchEvents = {}; // event key -> {day, inviter, rows}
  for (const l of rumorLaunches) {
    if (!launchedRow(l)) continue;
    const inst = instFor(l.vid, l.day);
    const origin = (inst && inst.origin) || 'unknown';
    const w45 = isW45(l.targetAfter) || (l.needWaveAfter | 0) >= 4 ||
      (inst && inst.bounces.some(function (b) { return (b.wave | 0) >= 4; }));
    const strict = isW45(l.targetAfter) || (l.needWaveAfter | 0) >= 4;
    const isHuntLaunch = l.stageAfter === 'hunt' || l.stageBefore === 'hunt';
    const key = l.day + '|' + l.inviter + '|' + l.path;
    if (!launchEvents[key]) launchEvents[key] = { day: l.day, inviter: l.inviter, path: l.path, rows: [] };
    launchEvents[key].rows.push(l);
    if (isHuntLaunch) {
      huntLaunchShares.total++;
      huntLaunchShares.byOrigin[origin]++;
      if (origin === 'unknown') huntLaunchShares.unknown++;
    }
    if (!w45) continue; // not a wave-4+ launched plan — out of Q2
    launchShares.total++;
    launchShares.byOrigin[origin]++;
    if (origin === 'unknown') launchShares.unknown++;
    if (strict) {
      launchShares.strict++;
      launchShares.byOriginStrict[origin]++;
      if (origin === 'unknown') launchShares.unknownStrict++;
    }
    launchShares.byRole[l.role] = (launchShares.byRole[l.role] || 0) + 1;
    launchShares.byPath[l.path] = (launchShares.byPath[l.path] || 0) + 1;
    launchShares.byStage[l.stageAfter || 'null'] = (launchShares.byStage[l.stageAfter || 'null'] || 0) + 1;
  }
  // Event-level table (secondary): events by inviter-plan origin.
  const eventShares = { events: 0, byOrigin: {}, w45Events: 0 };
  for (const o of ORIGINS) eventShares.byOrigin[o] = 0;
  for (const k of Object.keys(launchEvents)) {
    const ev = launchEvents[k];
    const invRow = ev.rows.find(function (r) { return r.role === 'inviter'; });
    if (!invRow) continue;
    const inst = instFor(invRow.vid, invRow.day);
    const origin = (inst && inst.origin) || 'unknown';
    const w45 = isW45(invRow.targetAfter) || (invRow.needWaveAfter | 0) >= 4 ||
      (inst && inst.bounces.some(function (b) { return (b.wave | 0) >= 4; }));
    eventShares.events++;
    if (w45) {
      eventShares.w45Events++;
      eventShares.byOrigin[origin]++;
    }
  }

  // ---- Q3: what launched target-null trips do ----
  const trips = [];
  for (const l of rumorLaunches) {
    if (!launchedRow(l)) continue;
    if (!(l.stageAfter === 'hunt' || l.stageBefore === 'hunt')) continue;
    if (l.targetAfter != null) continue;
    const party = [l.vid].concat(l.partyAfter || []);
    // Trip window: launch day .. first census day after launch on
    // which the holder is no longer on expedition, capped at +14d.
    let endDay = l.day + 14;
    const holderCensus = census.filter(function (r) { return r.vid === l.vid && r.day > l.day; })
      .sort(function (a, b) { return a.day - b.day; });
    for (const r of holderCensus) {
      if (!r.holderExped) { endDay = Math.min(endDay, r.day); break; }
      if (r.day > l.day + 14) break;
    }
    const encs = encounters.filter(function (e) {
      return party.indexOf(e.vid) !== -1 && e.day >= l.day && e.day <= endDay;
    });
    const seedsInWindow = v4seeds.filter(function (s) {
      return party.indexOf(s.vid) !== -1 && s.day >= l.day && s.day <= endDay && (s.wave | 0) >= 4;
    });
    trips.push({ day: l.day, vid: l.vid, role: l.role, path: l.path, inviter: l.inviter,
      party: party, windowEnd: endDay,
      encounters: encs.length,
      outcomes: encs.map(function (e) { return e.outcome || null; }),
      seedCallsW4: seedsInWindow.length,
      encounterRows: encs.slice(0, 3).map(function (e) {
        return { day: e.day, vid: e.vid, mid: e.mid, outcome: e.outcome, log: (e.log || []).slice(0, 6) };
      }) });
  }
  const tripsWithEncounters = trips.filter(function (t) { return t.encounters > 0; });
  const tripOutcomes = {};
  for (const t of trips) for (const o of t.outcomes) tripOutcomes[o || 'null'] = (tripOutcomes[o || 'null'] || 0) + 1;

  // ---- Residue: expeditions without a launch row ----
  let expedRuns = 0, expedRunsCovered = 0;
  const expedUncovered = [];
  const censusByVid = {};
  for (const r of census) (censusByVid[r.vid] = censusByVid[r.vid] || []).push(r);
  for (const vid of Object.keys(censusByVid)) {
    const rows = censusByVid[vid].slice().sort(function (a, b) { return a.day - b.day; });
    let runStart = null;
    function closeRun(endDay) {
      expedRuns++;
      const covered = rumorLaunches.some(function (l) {
        return l.vid === vid && l.day >= runStart - 1 && l.day <= runStart;
      });
      if (covered) expedRunsCovered++;
      else expedUncovered.push({ vid: vid, runStart: runStart, runEnd: endDay });
    }
    for (const r of rows) {
      if (r.holderExped && runStart == null) runStart = r.day;
      else if (!r.holderExped && runStart != null) { closeRun(r.day); runStart = null; }
    }
    if (runStart != null) closeRun(finalDay);
  }

  // ---- Buckets + lifecycle tables ----
  const byBucket = {};
  for (const b of BUCKETS) byBucket[b] = 0;
  const bySub = {};
  const byOrigin = {};
  for (const o of ORIGINS) byOrigin[o] = 0;
  const lifecycle = {};
  let conversions = 0, rumorBornN = 0, acquiredUnlaunched = 0;
  for (const inst of huntInstances) {
    byBucket[inst.bucket]++;
    const k = inst.bucket + ':' + (inst.sub || '');
    bySub[k] = (bySub[k] || 0) + 1;
    byOrigin[inst.origin]++;
    const lk = inst.origin + '|' + inst.launchStatus + '|' + inst.terminal;
    lifecycle[lk] = (lifecycle[lk] || 0) + 1;
    if (inst.origin === 'heard-at-fire') {
      rumorBornN++;
      if (inst.converted) conversions++;
      if (inst.acquiredButUnlaunched) acquiredUnlaunched++;
    }
  }
  const classified = huntInstances.length - byBucket.unknown;
  // Seedattach comparison shape: heard-at-fire AND never seeded
  // before hunt (Correction 2).
  const heardAtFireNeverSeeded = huntInstances.filter(function (i) {
    return i.origin === 'heard-at-fire' && !i.seededBeforeHunt;
  }).length;
  // Sense case: first converting instance, else first rumor-born
  // launched-target-null instance with a trip encounter.
  let senseCase = null;
  const convInst = huntInstances.find(function (i) { return i.converted; });
  const nullTripInst = huntInstances.find(function (i) {
    return i.origin === 'heard-at-fire' && i.launchStatus === 'launched-target-null' &&
      trips.some(function (t) { return t.vid === i.vid && t.encounters > 0; });
  });
  const senseInst = convInst || nullTripInst || huntInstances[0] || null;
  if (senseInst) {
    const near = encounters.filter(function (e) { return e.vid === senseInst.vid; }).slice(0, 3);
    senseCase = { vid: senseInst.vid, origin: senseInst.origin, bucket: senseInst.bucket, sub: senseInst.sub,
      creationDay: senseInst.creation.day, createdBy: senseInst.creation.createdBy,
      huntEntryDay: senseInst.huntEntryDay, converted: !!senseInst.converted,
      firstConvertingLaunch: senseInst.firstConvertingLaunch,
      firstAcquiredW4: senseInst.firstAcquiredW4, acquireMechanism: senseInst.acquireMechanism,
      launchStatus: senseInst.launchStatus, terminal: senseInst.terminal,
      nearbyEncounters: near.map(function (e) {
        return { day: e.day, mid: e.mid, outcome: e.outcome, log: (e.log || []).slice(0, 8) };
      }) };
  }
  return {
    seed: j.seed, days: j.days, gameDays: j.gameDays, endReason: j.endReason,
    standing: j.standing, scaleRank: j.scaleRank, won: !!j.won, maxWave: j.maxWave,
    villageLost: !!j.villageLost,
    instrumentErrors: errors.length,
    secondary: secondary,
    instancesTotal: instances.length,
    huntInstances: huntInstances.length,
    byBucket: byBucket, bySub: bySub, byOrigin: byOrigin,
    classifiedShare: huntInstances.length ? round(classified / huntInstances.length, 4) : null,
    unknown: byBucket.unknown,
    rumorBornN: rumorBornN, conversions: conversions, acquiredButUnlaunched: acquiredUnlaunched,
    heardAtFireNeverSeeded: heardAtFireNeverSeeded,
    companionNotStarted: companionNotStarted,
    launchShares: launchShares, huntLaunchShares: huntLaunchShares, eventShares: eventShares,
    lifecycle: lifecycle,
    trips: { total: trips.length, withEncounters: tripsWithEncounters.length, outcomes: tripOutcomes,
      sample: tripsWithEncounters.slice(0, 3) },
    expedRuns: { total: expedRuns, covered: expedRunsCovered, uncovered: expedUncovered.slice(0, 10), uncoveredN: expedRuns - expedRunsCovered },
    rumorLaunchRows: rumorLaunches.length, targetDiffRows: targetDiffs.length,
    instances: huntInstances,
    senseCase: senseCase,
  };
}

function summarize(leg) {
  const seeds = Object.keys(leg.bySeed).sort().map(function (k) { return leg.bySeed[k]; });
  const byBucket = {};
  for (const b of BUCKETS) byBucket[b] = 0;
  const bySub = {};
  const byOrigin = {};
  for (const o of ORIGINS) byOrigin[o] = 0;
  const lifecycle = {};
  let hunt = 0, total = 0, seedCallsW4 = 0, seedCallsW3 = 0, rumorBornN = 0, conversions = 0, acquiredUnlaunched = 0, heardAtFireNeverSeeded = 0;
  const launchShares = { total: 0, strict: 0, byOrigin: {}, byOriginStrict: {}, unknown: 0, unknownStrict: 0 };
  const huntLaunchShares = { total: 0, byOrigin: {}, unknown: 0 };
  for (const o of ORIGINS) { launchShares.byOrigin[o] = 0; launchShares.byOriginStrict[o] = 0; huntLaunchShares.byOrigin[o] = 0; }
  let tripsTotal = 0, tripsWithEnc = 0;
  const tripOutcomes = {};
  let expedTotal = 0, expedCovered = 0;
  const secondary = { opened: 0, noPlanCreated: 0, bouncedNullHunt: 0, bouncedTargeted: 0, other: 0 };
  for (const s of seeds) {
    hunt += s.huntInstances;
    total += s.instancesTotal;
    seedCallsW4 += s.secondary.seedCallsW4;
    seedCallsW3 += s.secondary.seedCallsW3;
    secondary.opened += s.secondary.opened;
    secondary.noPlanCreated += s.secondary.noPlanCreated;
    secondary.bouncedNullHunt += s.secondary.bouncedNullHunt;
    secondary.bouncedTargeted += s.secondary.bouncedTargeted;
    secondary.other += s.secondary.other;
    rumorBornN += s.rumorBornN;
    conversions += s.conversions;
    acquiredUnlaunched += s.acquiredButUnlaunched;
    heardAtFireNeverSeeded += s.heardAtFireNeverSeeded || 0;
    launchShares.total += s.launchShares.total;
    launchShares.strict += s.launchShares.strict;
    launchShares.unknown += s.launchShares.unknown;
    launchShares.unknownStrict += s.launchShares.unknownStrict;
    huntLaunchShares.total += s.huntLaunchShares.total;
    huntLaunchShares.unknown += s.huntLaunchShares.unknown;
    for (const o of ORIGINS) {
      launchShares.byOrigin[o] += s.launchShares.byOrigin[o] || 0;
      launchShares.byOriginStrict[o] += s.launchShares.byOriginStrict[o] || 0;
      huntLaunchShares.byOrigin[o] += s.huntLaunchShares.byOrigin[o] || 0;
    }
    tripsTotal += s.trips.total;
    tripsWithEnc += s.trips.withEncounters;
    for (const k of Object.keys(s.trips.outcomes)) tripOutcomes[k] = (tripOutcomes[k] || 0) + s.trips.outcomes[k];
    expedTotal += s.expedRuns.total;
    expedCovered += s.expedRuns.covered;
    for (const b of BUCKETS) byBucket[b] += s.byBucket[b];
    for (const k of Object.keys(s.bySub)) bySub[k] = (bySub[k] || 0) + s.bySub[k];
    for (const o of ORIGINS) byOrigin[o] += s.byOrigin[o] || 0;
    for (const k of Object.keys(s.lifecycle)) lifecycle[k] = (lifecycle[k] || 0) + s.lifecycle[k];
  }
  const classified = hunt - byBucket.unknown;
  return {
    files: leg.files.length,
    seeds: seeds.length,
    seedCallsW4: seedCallsW4, seedCallsW3: seedCallsW3,
    secondary: secondary,
    instancesTotal: total,
    huntInstances: hunt,
    byBucket: byBucket,
    bySub: bySub,
    byOrigin: byOrigin,
    classifiedShare: hunt ? round(classified / hunt, 4) : null,
    unknown: byBucket.unknown,
    rumorBornN: rumorBornN, conversions: conversions, acquiredButUnlaunched: acquiredUnlaunched,
    heardAtFireNeverSeeded: heardAtFireNeverSeeded,
    launchShares: launchShares, huntLaunchShares: huntLaunchShares,
    lifecycle: lifecycle,
    trips: { total: tripsTotal, withEncounters: tripsWithEnc, outcomes: tripOutcomes },
    expedRuns: { total: expedTotal, covered: expedCovered, uncoveredN: expedTotal - expedCovered },
    survived: seeds.filter(function (s) { return !s.villageLost && ((s.days || 0) >= 150 || s.endReason === 'survived' || (s.gameDays || 0) >= 150); }).length,
    medianSurvival: med(seeds.map(function (s) { return s.gameDays || s.days || 0; })),
    wall: {
      national: seeds.filter(function (s) { return (s.standing || 0) >= 200; }).length,
      nationalEnd: seeds.filter(function (s) { return ['national', 'global'].indexOf(s.scaleRank) !== -1; }).length,
      table: 0, wins: seeds.filter(function (s) { return !!s.won; }).length,
      wave4: seeds.filter(function (s) { return (s.maxWave || 1) >= 4; }).length,
      wave5: seeds.filter(function (s) { return (s.maxWave || 1) >= 5; }).length,
    },
    perSeed: seeds,
  };
}

function corpusBarPass(mainLoad, baseSummary) {
  return mainLoad.files.length === 8 && (!baseSummary || baseSummary.files === 8);
}

function main() {
  const mainDir = process.argv[2];
  const baselineDir = process.argv[3] || null;
  if (!mainDir) { console.error('RUMORPLAN ANALYZE STOP: mainDir required.'); process.exit(2); }
  const wm = waveMaps();

  const main = loadDir(mainDir);
  for (const k of Object.keys(main.bySeed)) main.bySeed[k] = classifyRumor(main.bySeed[k]);
  const mainSummary = summarize(main);
  let baseSummary = null;
  if (baselineDir) {
    const base = loadDir(baselineDir);
    for (const k of Object.keys(base.bySeed)) base.bySeed[k] = classifyRumor(base.bySeed[k]);
    baseSummary = summarize(base);
  }
  const mainErrors = mainSummary.perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0);
  const baseErrors = baseSummary ? baseSummary.perSeed.reduce(function (t, s) { return t + s.instrumentErrors; }, 0) : 0;
  const bar1 = mainSummary.huntInstances > 0 && mainSummary.classifiedShare >= 0.9 &&
    mainSummary.unknown <= Math.max(1, Math.floor(mainSummary.huntInstances * 0.1));
  const bar2 = corpusBarPass(main, baseSummary);
  const bar3 = mainErrors === 0 && baseErrors === 0;

  const out = {
    arm: 'rumorplan-a', run: 'rumorplan-a',
    instrumentDir: path.basename(mainDir), baselineDir: baselineDir ? path.basename(baselineDir) : null,
    wave4IdsMatch: !!wm.w4Match, wave4IdsLive: wm.liveW4, wave4IdsFrozen: W4_IDS_FROZEN.slice().sort(),
    wave5IdsMatch: !!wm.w5Match, wave5IdsLive: wm.liveW5, wave5IdsFrozen: W5_IDS_FROZEN.slice().sort(),
    main: mainSummary, baseline: baseSummary,
    bars: {
      classification: { pass: bar1, classifiedShare: mainSummary.classifiedShare, unknown: mainSummary.unknown, huntInstances: mainSummary.huntInstances },
      corpus: { pass: bar2, mainFiles: main.files.length, baselineFiles: baseSummary ? baseSummary.files : null },
      instrumentErrors: { pass: bar3, main: mainErrors, baseline: baseErrors },
    },
  };
  const outFile = path.join(REPO, 'evidence', '2026-11-16', 'rumorplan-a-analysis.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n');

  function printSummary(label, sum) {
    console.log('=== rumorplan-a ' + label + ' ===');
    console.log('seeds: ' + sum.seeds + '  files: ' + sum.files +
      '  seedCallsW4: ' + sum.seedCallsW4 + '  seedCallsW3: ' + sum.seedCallsW3 +
      '  instances: ' + sum.instancesTotal + '  huntInstances: ' + sum.huntInstances);
    for (const b of BUCKETS) {
      const n = sum.byBucket[b];
      const share = sum.huntInstances ? round(n / sum.huntInstances, 3) : null;
      console.log('  ' + b + ': ' + n + (share == null ? '' : ' (' + share + ')'));
    }
    console.log('sub-reasons: ' + JSON.stringify(sum.bySub));
    console.log('origins: ' + JSON.stringify(sum.byOrigin));
    console.log('Q1 rumor-born: ' + sum.rumorBornN + '  conversions: ' + sum.conversions +
      '  acquired-but-unlaunched: ' + sum.acquiredButUnlaunched +
      '  heard-at-fire never-seeded: ' + sum.heardAtFireNeverSeeded);
    console.log('Q2 wave-4+ launched plans: ' + sum.launchShares.total +
      ' (strict: ' + sum.launchShares.strict + ')  by origin: ' + JSON.stringify(sum.launchShares.byOrigin) +
      '  strict: ' + JSON.stringify(sum.launchShares.byOriginStrict));
    console.log('all hunt-stage launched plans: ' + sum.huntLaunchShares.total +
      '  by origin: ' + JSON.stringify(sum.huntLaunchShares.byOrigin));
    console.log('lifecycle: ' + JSON.stringify(sum.lifecycle));
    console.log('Q3 target-null trips: ' + sum.trips.total + '  with wave-4 encounters: ' + sum.trips.withEncounters +
      '  outcomes: ' + JSON.stringify(sum.trips.outcomes));
    console.log('expeditions: ' + sum.expedRuns.total + ' covered by a launch row: ' + sum.expedRuns.covered +
      ' uncovered: ' + sum.expedRuns.uncoveredN);
    console.log('classifiedShare: ' + sum.classifiedShare + '  unknown: ' + sum.unknown);
    console.log('wall: ' + JSON.stringify(sum.wall) + '  medianSurvival: ' + sum.medianSurvival);
  }
  printSummary('main leg (tableseat-nowait, flags on)', mainSummary);
  if (baseSummary) printSummary('replication leg (tableseat-nowait, flags on)', baseSummary);
  console.log('bars: classification=' + (bar1 ? 'PASS' : 'FAIL') +
    ' corpus=' + (bar2 ? 'PASS' : 'FAIL') + ' instrumentErrors=' + (bar3 ? 'PASS' : 'FAIL') +
    ' wave4Ids=' + (wm.w4Match ? 'MATCH' : 'MISMATCH') + ' wave5Ids=' + (wm.w5Match ? 'MATCH' : 'MISMATCH'));
  console.log('analysis: ' + path.relative(REPO, outFile));
  if (!bar1 || !bar2 || !bar3 || !wm.w4Match || !wm.w5Match) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { classifyRumor: classifyRumor, summarize: summarize, corpusBarPass: corpusBarPass,
  BUCKETS: BUCKETS, ORIGINS: ORIGINS, waveMaps: waveMaps };
