// analyze-reattach-a.js — analyzer for arm sim-reattach-a.
// Reads the control + armed corpora (8 seeds each), judges the
// frozen prereg bars, prints the primary per-seed table + attach
// split + RE-ATTACH split + launch table + tale-supply table + wall
// numbers for both legs, writes evidence/2026-11-17/reattach-a-analysis.json,
// exits non-zero on any bar failure AND on any re-attach integrity
// violation (a re-attach with wave <= oldWave, or with stageBefore
// in hunt/standing/table). Origin classification reuses the
// rumorplan-a creation rule (heard-at-fire: fought empty +
// villageSlainTotal > 0 at creation); the plan.origin stamp is
// cross-checked against it on every vid that has both a creation
// row and an attach row.
// Usage: node scripts/analyze-reattach-a.js
//   [--control evidence/2026-11-17/perseed-reattach-a-control]
//   [--on evidence/2026-11-17/perseed-reattach-a-on]
//   [--out evidence/2026-11-17/reattach-a-analysis.json]
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const CONTROL_DIR = path.join(REPO, argvVal('--control', 'evidence/2026-11-17/perseed-reattach-a-control'));
const ON_DIR = path.join(REPO, argvVal('--on', 'evidence/2026-11-17/perseed-reattach-a-on'));
const OUT = path.join(REPO, argvVal('--out', 'evidence/2026-11-17/reattach-a-analysis.json'));
const SEEDS = [103201, 103202, 103203, 103204, 103205, 103206, 103207, 103208];
const W4 = new Set(['algorithm', 'audit', 'congregation', 'eater', 'eulogy', 'herald', 'influencer', 'reunion', 'strike', 'suburb']);
const W5 = new Set(['cancellation', 'editor', 'finale', 'finale_crew', 'finale_opening', 'network_note', 'nielsen', 'rerun', 'spoiler', 'timeslot']);
// Live wave map (monsters.json) — used for tale-supply wave counts;
// attach rows carry their own wave from the game (authoritative).
let WAVE_BY_ID = {};
try {
  const raw = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
  const list = raw.monsters || raw;
  for (const m of list) if (m && m.id) WAVE_BY_ID[m.id] = m.wave || 1;
} catch (e) { WAVE_BY_ID = {}; }
function waveOfMid(mid) {
  if (W4.has(mid)) return 4;
  if (W5.has(mid)) return 5;
  return null;
}
function isStarvation(d) {
  const s = String((d && d.kind) || '') + ' ' + String((d && d.cause) || '');
  return /starv|hunger|famine/i.test(s);
}

function loadDir(dir, leg) {
  const out = {};
  for (const seed of SEEDS) {
    const fp = path.join(dir, 'reattach-a-s' + seed + '-reattach-a-competent.json');
    if (!fs.existsSync(fp)) throw new Error('missing per-seed file: ' + fp);
    const j = JSON.parse(fs.readFileSync(fp, 'utf8'));
    out[seed] = j;
  }
  return out;
}

function analyzeLeg(files, leg) {
  const perSeed = {};
  for (const seed of SEEDS) {
    const j = files[seed];
    const creations = j.seedattachCreations || [];
    const attaches = j.rumortargetAttaches || [];
    const launches = j.rumorplanLaunches || [];
    const taleSupply = j.taleSupply || { killerTales: [], vetKillerTales: [], killerTaleLog: [], vetKillerTaleLog: [] };
    // Origin per vid from creation rows (latest creation on/before
    // a day wins; a vid's origin is fixed at its first creation in
    // practice — creations are rare per vid).
    const originByVid = {};
    const creationByVid = {};
    for (const c of creations) {
      const heard = (!c.fought || !c.fought.length) && (c.villageSlainTotal | 0) > 0;
      const fought = (c.fought && c.fought.length) ? true : false;
      const origin = heard ? 'heard' : (fought ? 'fought' : 'read');
      if (!creationByVid[c.vid] || c.day >= creationByVid[c.vid].day) {
        creationByVid[c.vid] = c;
        originByVid[c.vid] = origin;
      }
    }
    const rumorBornVids = new Set(Object.keys(originByVid).filter(function (v) { return originByVid[v] === 'heard'; }));
    // Origin cross-check: attach rows carry the plan.origin stamp;
    // it must agree with the creation-row classification.
    let crossMismatches = [];
    for (const a of attaches) {
      const stamped = a.originBefore || null;
      const classified = originByVid[a.vid] || null;
      if (stamped && classified && stamped !== classified) {
        crossMismatches.push({ day: a.day, vid: a.vid, stamped: stamped, classified: classified });
      }
    }
    // First-attaches on rumor-born plans (reattached false).
    const attachRows = attaches.filter(function (a) { return !!a.result && !a.reattached && originByVid[a.vid] === 'heard'; });
    const attachW45 = attachRows.filter(function (a) { return a.wave === 4 || a.wave === 5; });
    const attachW3 = attachRows.filter(function (a) { return a.wave === 3; });
    const attachAtCreation = attachRows.filter(function (a) { return !!a.atCreation; });
    const attachRefresh = attachRows.filter(function (a) { return !a.atCreation; });
    const attachAges = attachRows.map(function (a) { return a.taleAge; }).filter(function (x) { return x != null; }).sort(function (x, y) { return x - y; });
    // Re-attaches on rumor-born plans (reattached true).
    const reattachRows = attaches.filter(function (a) { return !!a.reattached && originByVid[a.vid] === 'heard'; });
    // Integrity is judged on ALL re-attached rows, not just the
    // heard-filtered ones: a re-attach on a non-heard plan is a
    // method defect even though it never counts toward the primary.
    const reattachRowsAll = attaches.filter(function (a) { return !!a.reattached; });
    const reattachW45 = reattachRows.filter(function (a) { return a.wave === 4 || a.wave === 5; });
    const reattachAges = reattachRows.map(function (a) { return a.taleAge; }).filter(function (x) { return x != null; }).sort(function (x, y) { return x - y; });
    const reattachSteps = {};
    for (const r of reattachRows) {
      const k = (r.oldWave != null ? r.oldWave : '?') + '->' + r.wave;
      reattachSteps[k] = (reattachSteps[k] || 0) + 1;
    }
    // Integrity violations (prereg bar 6): a re-attach that went
    // downward/same-wave, or that fired on a launched (hunt+)
    // plan, or on a plan whose origin stamp is not 'heard'. Any
    // such row fails the run outright. The stamp (originBefore)
    // is authoritative for the non-heard check — the method gates
    // on plan.origin itself, so a creation-row classification
    // gap must not mask a method defect.
    const integrityDownward = reattachRowsAll.filter(function (a) { return a.oldWave != null && a.wave != null && a.wave <= a.oldWave; });
    const integrityLaunched = reattachRowsAll.filter(function (a) { return a.stageBefore === 'hunt' || a.stageBefore === 'standing' || a.stageBefore === 'table'; });
    const integrityNonHeard = reattachRowsAll.filter(function (a) { return a.originBefore !== 'heard'; });
    // Blocked re-attaches: applicable calls (targeted heard plan,
    // gear/party) with no re-attach result.
    const reattachOpps = attaches.filter(function (a) { return !!a.reattachApplicable && !a.reattached; });
    const blockedReasons = {};
    for (const o of reattachOpps) {
      if (o.reattachBlocked) blockedReasons[o.reattachBlocked] = (blockedReasons[o.reattachBlocked] || 0) + 1;
    }
    // Opportunities: applicable FIRST-attach calls (heard,
    // target-null, gear/party/hunt) with no result.
    const opps = attaches.filter(function (a) { return !!a.applicable && !a.result; });
    const rejectReasons = {};
    for (const o of opps) {
      const seen = {};
      for (const c of (o.considered || [])) {
        if (!c.eligible && c.reason && !seen[c.reason]) { rejectReasons[c.reason] = (rejectReasons[c.reason] || 0) + 1; seen[c.reason] = true; }
      }
    }
    // Tale supply: told (played) tales by wave, from the end snapshot.
    const told = [];
    for (const t of (taleSupply.killerTales || [])) if (t.played) told.push(t);
    for (const t of (taleSupply.vetKillerTales || [])) if (t.played) told.push(t);
    const toldW45 = told.filter(function (t) { return (WAVE_BY_ID[t.mid] || 0) >= 4; });
    const toldW3 = told.filter(function (t) { return (WAVE_BY_ID[t.mid] || 0) === 3; });
    // Launches: rumor-born participants carrying a target.
    const rumorLaunches = launches.filter(function (l) { return originByVid[l.vid] === 'heard'; });
    const rumorLaunchesTargeted = rumorLaunches.filter(function (l) { return !!l.targetAfter; });
    const rumorLaunchesTargetedW45 = rumorLaunchesTargeted.filter(function (l) { return waveOfMid(l.targetAfter) === 4 || waveOfMid(l.targetAfter) === 5; });
    const rumorLaunchesHuntTargeted = rumorLaunchesTargeted.filter(function (l) { return l.stageAfter === 'hunt'; });
    // Launches carrying a RE-ATTACHED target: a re-attach row for
    // the vid on/before the launch day whose new mid is the
    // launch's targetAfter.
    const rumorLaunchesReattached = rumorLaunchesTargeted.filter(function (l) {
      return reattachRows.some(function (r) { return r.vid === l.vid && r.day <= l.day && r.result === l.targetAfter; });
    });
    // Wall numbers + costs.
    const deaths = j.deaths || [];
    const starv = deaths.filter(isStarvation);
    const rankOrder = { village: 0, regional: 1, national: 2, global: 3 };
    perSeed[seed] = {
      seed: seed,
      anchorCommit: (j.anchorCommit || '').slice(0, 12),
      policySha: j.policySha,
      recorderOn: !!j.recorderOn,
      instrumentErrors: (j.instrumentErrors || []).length,
      creations: creations.length,
      rumorBornPlans: rumorBornVids.size,
      crossMismatches: crossMismatches,
      attaches: attachRows.length,
      attachesW45: attachW45.length,
      attachesW3: attachW3.length,
      attachesAtCreation: attachAtCreation.length,
      attachesRefresh: attachRefresh.length,
      attachAges: attachAges,
      attachTargets: attachRows.map(function (a) { return { day: a.day, vid: a.vid, mid: a.result, wave: a.wave, teller: a.teller, taleDay: a.taleDay, taleAge: a.taleAge, atCreation: !!a.atCreation }; }),
      reattaches: reattachRows.length,
      reattachesW45: reattachW45.length,
      reattachAges: reattachAges,
      reattachSteps: reattachSteps,
      reattachTargets: reattachRows.map(function (a) { return { day: a.day, vid: a.vid, from: a.oldTarget, oldWave: a.oldWave, to: a.result, wave: a.wave, teller: a.teller, taleDay: a.taleDay, taleAge: a.taleAge, stageBefore: a.stageBefore }; }),
      integrityDownward: integrityDownward.map(function (a) { return { day: a.day, vid: a.vid, from: a.oldTarget, oldWave: a.oldWave, to: a.result, wave: a.wave }; }),
      integrityLaunched: integrityLaunched.map(function (a) { return { day: a.day, vid: a.vid, stageBefore: a.stageBefore, to: a.result, wave: a.wave }; }),
      integrityNonHeard: integrityNonHeard.length,
      reattachOpportunities: reattachOpps.length,
      blockedReasons: blockedReasons,
      opportunities: opps.length,
      rejectReasons: rejectReasons,
      toldTales: told.length,
      toldW45: toldW45.length,
      toldW45List: toldW45.map(function (t) { return { mid: t.mid, killer: t.killer, day: t.day }; }),
      toldW3: toldW3.length,
      rumorLaunches: rumorLaunches.length,
      rumorLaunchesTargeted: rumorLaunchesTargeted.length,
      rumorLaunchesTargetedW45: rumorLaunchesTargetedW45.length,
      rumorLaunchesHuntTargeted: rumorLaunchesHuntTargeted.length,
      rumorLaunchesReattached: rumorLaunchesReattached.length,
      won: !!j.won,
      scaleRank: j.scaleRank || null,
      nationalEnd: (rankOrder[j.scaleRank] || 0) >= 2,
      standing: (j.standing != null ? j.standing : null),
      maxWave: j.maxWave || 1,
      unlockedWave: j.unlockedWave || 1,
      gameDays: j.gameDays || 0,
      endReason: j.endReason || null,
      deaths: deaths.length,
      starvationDeaths: starv.length,
      attachLines: (j.vetSays || []).filter(function (s) { return /keeps coming back to|now has a beast to hunt/.test(s.line || ''); }).map(function (s) { return { day: s.day, line: s.line }; }),
      reattachLines: (j.vetSays || []).filter(function (s) { return /changes the hunt/.test(s.line || ''); }).map(function (s) { return { day: s.day, line: s.line }; }),
    };
  }
  return perSeed;
}

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  return s[Math.floor(s.length / 2)];
}

function main() {
  const controlFiles = loadDir(CONTROL_DIR, 'control');
  const onFiles = loadDir(ON_DIR, 'on');
  const control = analyzeLeg(controlFiles, 'control');
  const on = analyzeLeg(onFiles, 'on');

  // Bars.
  const primarySeeds = SEEDS.filter(function (s) { return (on[s].attachesW45 + on[s].reattachesW45) >= 1; });
  const primaryPass = primarySeeds.length >= 4;
  // Reattach-only primary seeds: the primary is met ONLY via a
  // re-attach (no w4/5 first-attach on the seed). This isolates
  // the re-attach rule's marginal contribution.
  const reattachOnlySeeds = SEEDS.filter(function (s) { return on[s].reattachesW45 >= 1 && on[s].attachesW45 === 0; });
  const launchPass = SEEDS.some(function (s) { return on[s].rumorLaunchesTargeted >= 1; });
  const controlDeathsMean = SEEDS.reduce(function (a, s) { return a + control[s].deaths; }, 0) / SEEDS.length;
  const onDeathsMean = SEEDS.reduce(function (a, s) { return a + on[s].deaths; }, 0) / SEEDS.length;
  const costDeathsPass = onDeathsMean <= controlDeathsMean + 2;
  const controlMedian = median(SEEDS.map(function (s) { return control[s].gameDays; }));
  const onMedian = median(SEEDS.map(function (s) { return on[s].gameDays; }));
  const survivalRatio = (controlMedian && onMedian != null) ? onMedian / controlMedian : null;
  const costSurvivalPass = survivalRatio != null && survivalRatio >= 0.9;
  const controlStarv = SEEDS.reduce(function (a, s) { return a + control[s].starvationDeaths; }, 0);
  const onStarv = SEEDS.reduce(function (a, s) { return a + on[s].starvationDeaths; }, 0);
  const costStarvPass = onStarv <= controlStarv + 2;
  const controlAttachRows = SEEDS.reduce(function (a, s) { return a + (controlFiles[s].rumortargetAttaches || []).filter(function (r) { return !!r.result; }).length; }, 0);
  const controlErrors = SEEDS.reduce(function (a, s) { return a + control[s].instrumentErrors; }, 0);
  const onErrors = SEEDS.reduce(function (a, s) { return a + on[s].instrumentErrors; }, 0);
  const crossMismatches = SEEDS.reduce(function (a, s) { return a + on[s].crossMismatches.length + control[s].crossMismatches.length; }, 0);
  // Integrity (prereg bar 6): zero downward/same-wave re-attaches,
  // zero post-launch re-attaches, zero non-heard re-attaches.
  const integrityDownward = SEEDS.reduce(function (a, s) { return a + on[s].integrityDownward.length; }, 0);
  const integrityLaunched = SEEDS.reduce(function (a, s) { return a + on[s].integrityLaunched.length; }, 0);
  const integrityNonHeard = SEEDS.reduce(function (a, s) { return a + on[s].integrityNonHeard; }, 0);
  const integrityPass = integrityDownward === 0 && integrityLaunched === 0 && integrityNonHeard === 0;

  const wall = function (leg) {
    return {
      wins: SEEDS.filter(function (s) { return leg[s].won; }).length,
      nationalEnd: SEEDS.filter(function (s) { return leg[s].nationalEnd; }).length,
      wave4: SEEDS.filter(function (s) { return (leg[s].maxWave || 1) >= 4; }).length,
      wave5: SEEDS.filter(function (s) { return (leg[s].maxWave || 1) >= 5; }).length,
      medianSurvival: median(SEEDS.map(function (s) { return leg[s].gameDays; })),
    };
  };

  const analysis = {
    arm: 'reattach-a',
    run: 'reattach-a',
    controlDir: path.relative(REPO, CONTROL_DIR),
    onDir: path.relative(REPO, ON_DIR),
    seeds: SEEDS,
    control: control,
    on: on,
    wall: { control: wall(control), on: wall(on) },
    bars: {
      primarySeedsW45: primarySeeds,
      primaryCount: primarySeeds.length,
      primaryBar: 4,
      primaryPass: primaryPass,
      reattachOnlySeeds: reattachOnlySeeds,
      launchBar: launchPass,
      costDeaths: { controlMean: controlDeathsMean, onMean: onDeathsMean, pass: costDeathsPass },
      costSurvival: { controlMedian: controlMedian, onMedian: onMedian, ratio: survivalRatio, pass: costSurvivalPass },
      costStarvation: { control: controlStarv, on: onStarv, pass: costStarvPass },
      integrity: { downward: integrityDownward, launched: integrityLaunched, nonHeard: integrityNonHeard, pass: integrityPass },
      controlAttachRows: controlAttachRows,
      controlErrors: controlErrors,
      onErrors: onErrors,
      crossMismatches: crossMismatches,
    },
  };

  // Print.
  console.log('== sim-reattach-a: primary (rumor-born plans acquiring a named wave-4/5 target) ==');
  for (const s of SEEDS) {
    const o = on[s], c = control[s];
    console.log('seed ' + s + ': ON first-attaches w4/5=' + o.attachesW45 + ' w3=' + o.attachesW3 +
      ' (creation ' + o.attachesAtCreation + ' / refresh ' + o.attachesRefresh + ')' +
      ' | RE-ATTACHES w4/5=' + o.reattachesW45 + ' total=' + o.reattaches + ' steps=' + JSON.stringify(o.reattachSteps) +
      ' | rumor-born plans=' + o.rumorBornPlans + ' | told w4/5 tales=' + o.toldW45 +
      ' | opps=' + o.opportunities + ' reattach-opps=' + o.reattachOpportunities + ' blocked=' + JSON.stringify(o.blockedReasons) +
      ' | CONTROL attaches=' +
      (controlFiles[s].rumortargetAttaches || []).filter(function (r) { return !!r.result; }).length +
      ' told w4/5=' + c.toldW45);
  }
  console.log('PRIMARY: ' + primarySeeds.length + '/8 seeds (bar 4) -> ' + (primaryPass ? 'PASS' : 'FAIL') +
    ' — reattach-only primary seeds: ' + JSON.stringify(reattachOnlySeeds));
  console.log('LAUNCH BAR (≥1 launched rumor-born plan carrying a target): ' + (launchPass ? 'PASS' : 'FAIL') +
    ' — targeted launches: ' + SEEDS.map(function (s) { return on[s].rumorLaunchesTargeted; }).join(',') +
    ' (w4/5: ' + SEEDS.map(function (s) { return on[s].rumorLaunchesTargetedW45; }).join(',') + '; hunt-stage: ' +
    SEEDS.map(function (s) { return on[s].rumorLaunchesHuntTargeted; }).join(',') + '; reattached-target: ' +
    SEEDS.map(function (s) { return on[s].rumorLaunchesReattached; }).join(',') + ')');
  console.log('COSTS: deaths/run control ' + controlDeathsMean.toFixed(2) + ' vs on ' + onDeathsMean.toFixed(2) +
    ' -> ' + (costDeathsPass ? 'PASS' : 'FAIL') +
    '; median survival ' + controlMedian + ' vs ' + onMedian + ' (ratio ' + (survivalRatio != null ? survivalRatio.toFixed(2) : 'n/a') + ') -> ' + (costSurvivalPass ? 'PASS' : 'FAIL') +
    '; starvation control ' + controlStarv + ' vs on ' + onStarv + ' -> ' + (costStarvPass ? 'PASS' : 'FAIL'));
  console.log('INTEGRITY (bar 6): downward/same-wave re-attaches=' + integrityDownward +
    ' post-launch re-attaches=' + integrityLaunched + ' non-heard re-attaches=' + integrityNonHeard +
    ' -> ' + (integrityPass ? 'PASS' : 'FAIL'));
  console.log('WALL control: ' + JSON.stringify(wall(control)) + ' | on: ' + JSON.stringify(wall(on)));
  console.log('CONTROL attach rows (old-code control, expect 0): ' + controlAttachRows +
    ' | instrument errors control/on: ' + controlErrors + '/' + onErrors +
    ' | origin cross-check mismatches: ' + crossMismatches);
  console.log('ATTACH TARGETS (on leg, first-attaches):');
  for (const s of SEEDS) {
    for (const t of on[s].attachTargets) {
      console.log('  seed ' + s + ' day ' + t.day + ' ' + t.vid + ' -> ' + t.mid + ' (w' + t.wave + ', teller ' + t.teller + ', tale day ' + t.taleDay + ', age ' + t.taleAge + 'd, ' + (t.atCreation ? 'creation' : 'refresh') + ')');
    }
  }
  console.log('RE-ATTACH TARGETS (on leg):');
  for (const s of SEEDS) {
    for (const t of on[s].reattachTargets) {
      console.log('  seed ' + s + ' day ' + t.day + ' ' + t.vid + ' ' + t.from + ' (w' + t.oldWave + ') -> ' + t.to + ' (w' + t.wave + ', teller ' + t.teller + ', tale day ' + t.taleDay + ', age ' + t.taleAge + 'd, stage ' + t.stageBefore + ')');
    }
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(analysis, null, 2) + '\n');
  console.log('wrote ' + path.relative(REPO, OUT));
  if (!primaryPass || !launchPass || !costDeathsPass || !costSurvivalPass || !costStarvPass ||
      !integrityPass ||
      controlAttachRows !== 0 || controlErrors !== 0 || onErrors !== 0 || crossMismatches !== 0) {
    process.exitCode = 1;
  }
}

if (require.main === module) main();
module.exports = { analyzeLeg: analyzeLeg, waveOfMid: waveOfMid };
