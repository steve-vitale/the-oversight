// analyze-evadebow-a.js — evade classifier + judge for sim-evadebow-a
// (finding #2590, evade-on-a-quivered-bow). Reads the evadebow pilot
// corpora (evidence/2026-11-21/perseed-evadebow-a-{ctl,diag}/*.json) and:
//   1. Builds the served-bow map per seed from depmatRows (stage rows:
//      staged=true, source crafted/fromStash/fromArmory, itemId bow or
//      crude_bow) — earliest day per (vid, itemId). A meeting lead is
//      SERVED iff a staged bow of the same itemId predates the meeting.
//   2. Classifies EVERY wave-4+ meeting led by a served quivered-bow
//      holder (ammoAtEntry >= 1) into exactly one class (prereg §1):
//      awareness-evade / hopeless-after-help / hopeless-alone /
//      floor-hp / wise-leave / learn-withdraw / vFlee-other /
//      engaged-vKill / engaged-vDie / engaged-mFlee / engaged-vWin /
//      engaged-other / alreadyDead / unclassified.
//   3. Replicates evadeP from the recorded awareness inputs (the same
//      formula fieldFights.js reads) and reports the replication
//      mismatch count — the evadeP-independence read (prereg §1): the
//      formula takes no ranged input, so a served quivered lead's
//      evadeP is identical to an unquivered holder's at the same
//      inputs.
//   4. Prices the volley inside the hopeless math (analyzer-side
//      estimate, labeled as such): vDpr with/without the volley damage
//      and the rtk shift in rounds.
//   5. Judges frozen bars (a) completeness, (b) pool floor >= 3,
//      (c) dominant reason named — DIAG-GO iff all three pass.
// Usage:
//   node scripts/analyze-evadebow-a.js <diagDir> [ctlDir] [outJson]
//   node scripts/analyze-evadebow-a.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const DEFAULT_DIAG = path.join(REPO, 'evidence', '2026-11-21', 'perseed-evadebow-a-diag');
const DEFAULT_CTL = path.join(REPO, 'evidence', '2026-11-21', 'perseed-evadebow-a-ctl');
const DEFAULT_OUT = path.join(REPO, 'evidence', '2026-11-21', 'evadebow-a-analysis.json');

const EVADE_CLASSES = ['awareness-evade', 'hopeless-after-help', 'hopeless-alone',
  'floor-hp', 'wise-leave', 'learn-withdraw', 'vFlee-other'];
const ENGAGED_CLASSES = ['engaged-vKill', 'engaged-vDie', 'engaged-mFlee',
  'engaged-vWin', 'engaged-other'];
const KNOWN_OUTCOMES = ['evade', 'vKill', 'vDie', 'vFlee', 'mFlee', 'vWin', 'alreadyDead'];
const BOW_IDS = ['bow', 'crude_bow'];
const SERVED_SOURCES = ['crafted', 'fromStash', 'fromArmory'];

// ---- evadeP replication (pure; the engine's formula, minus the
// godpath fieldEvade term — same exclusion as the driver) ----
function replicateEvadeP(ev) {
  if (!ev) return null;
  const behaviorMod = { ambush: -0.15, pack: -0.10, swarm: -0.05, snake: -0.05,
    territorial: 0.05, curious: 0.05, drifter: 0.10 }[ev.behavior];
  let p = 0.35 + Math.min(0.30, (ev.tracking || 0) * 0.01) + (behaviorMod === undefined ? 0 : behaviorMod)
    - 0.02 * (ev.mSpeed || 3) - 0.03 * (ev.mNotice || 5) + 0.05 * (ev.mSize || 1)
    + (ev.potential ? 0.05 : 0);
  const abs = ev.abs || {};
  if (abs.game_sense) p += 0.10;
  if (abs.tracker) p += 0.05;
  if (abs.echo_location && ev.abNight) p += 0.10;
  return +Math.max(0.05, Math.min(0.90, p)).toFixed(3);
}

// ---- served-bow map (pure) ----
// servedByVid: vid -> [{day, itemId}] for staged bows. depmatServedByVid:
// vid -> earliest day served by a site-supplied spear row (the
// depmat-attributable subset, for the tie-in count).
function servedBowMaps(depmatRows) {
  const byVid = {};
  const depmatByVid = {};
  for (const row of (depmatRows || [])) {
    if (!row.staged) continue;
    if (SERVED_SOURCES.indexOf(row.source) === -1) continue;
    if (BOW_IDS.indexOf(row.itemId) === -1) continue;
    (byVid[row.vid] = byVid[row.vid] || []).push({ day: row.day, itemId: row.itemId });
    if (row.depmatSite === true && row.spearHolder === true && row.source === 'crafted') {
      if (depmatByVid[row.vid] == null || row.day < depmatByVid[row.vid]) depmatByVid[row.vid] = row.day;
    }
  }
  return { byVid: byVid, depmatByVid: depmatByVid };
}
function isServedQuivered(row, maps) {
  const entries = (maps.byVid[row.vid] || []);
  let servedDay = null;
  for (const e of entries) {
    if (e.itemId === row.rangedId && e.day <= row.day && (servedDay == null || e.day < servedDay)) servedDay = e.day;
  }
  if (servedDay == null) return { served: false, servedDay: null };
  if ((row.ammoAtEntry | 0) < 1) return { served: false, servedDay: servedDay, reason: 'served-but-0-ammo' };
  return { served: true, servedDay: servedDay };
}

// ---- meeting classification (pure; exported for the proof test) ----
function classifyMeeting(row, maps) {
  const sq = isServedQuivered(row, maps);
  if (!sq.served) return null; // not in the judged population
  const base = { seed: row.seed, day: row.day, vid: row.vid, mid: row.mid, wave: row.wave,
    origin: row.origin || null, servedDay: sq.servedDay, rangedId: row.rangedId,
    ammoAtEntry: (row.ammoAtEntry | 0), evadeP: (row.evade && row.evade.evadeP != null) ? row.evade.evadeP : null,
    evadePRep: replicateEvadeP(row.evade), gpTerm: !!(row.evade && row.evade.gpTerm),
    volley: row.volley || null, outcome: row.outcome || null, rounds: row.rounds | 0,
    mDealt: row.mDealt | 0, mHpStart: row.mHpStart, vTaken: row.vTaken | 0,
    calledHelp: !!row.calledHelp, fleeHopeless: row.fleeHopeless,
    fleeHpFrac: row.fleeHpFrac, fleeWise: !!row.fleeWise, fleeLearn: !!row.fleeLearn,
    intent: row.intent || null, intentWhy: row.intentWhy || null };
  if (row.outcome == null) {
    base.cls = 'unclassified';
    base.detail = 'outcome missing on a served quivered-bow lead meeting';
    return base;
  }
  if (KNOWN_OUTCOMES.indexOf(row.outcome) === -1) {
    base.cls = 'unclassified';
    base.detail = 'unknown outcome ' + JSON.stringify(row.outcome) + ' (not in the known set)';
    return base;
  }
  if (row.outcome === 'evade') {
    if ((row.rounds | 0) !== 0) {
      base.cls = 'unclassified';
      base.detail = 'outcome evade with rounds ' + (row.rounds | 0) + ' (engine contradiction)';
      return base;
    }
    base.cls = 'awareness-evade';
    const ev = row.evade || {};
    base.detail = 'evadeP ' + base.evadeP + ' (rep ' + base.evadePRep + ')' +
      ' tracking ' + (ev.tracking != null ? ev.tracking : '?') +
      ' behavior ' + (ev.behavior || '?') + ' speed ' + (ev.mSpeed != null ? ev.mSpeed : '?') +
      ' notice ' + (ev.mNotice != null ? ev.mNotice : '?') + ' size ' + (ev.mSize != null ? ev.mSize : '?') +
      ' potential ' + !!ev.potential +
      ' abs game_sense/tracker/echo ' + [!!(ev.abs || {}).game_sense, !!(ev.abs || {}).tracker, !!(ev.abs || {}).echo_location].join('/') +
      (base.gpTerm ? ' gpTerm(held detection mod — evadeP is a floor)' : '') +
      ' | ranged ' + row.rangedId + ' ammo ' + (row.ammoAtEntry | 0) +
      ' — the awareness formula takes no ranged input';
    return base;
  }
  if (row.outcome === 'alreadyDead') {
    base.cls = 'alreadyDead';
    base.detail = 'corpse, not a fight (0-hp monster)';
    return base;
  }
  if ((row.rounds | 0) >= 1) {
    if (row.outcome === 'vFlee') {
      // Priority (prereg §1): wise-leave → learn-withdraw →
      // hopeless-after-help → hopeless-alone → floor-hp.
      if (row.fleeWise) {
        base.cls = 'wise-leave';
        base.detail = 'leave trick (Suburb): navigation is victory, R' + (row.rounds | 0) + ', fleeHpFrac ' + row.fleeHpFrac;
        return base;
      }
      if (row.fleeLearn) {
        base.cls = 'learn-withdraw';
        base.detail = 'learn-first withdrawal, R' + (row.rounds | 0) + ', intent ' + (row.intent || '?') + ' (' + (row.intentWhy || '?') + '), fleeHpFrac ' + row.fleeHpFrac;
        return base;
      }
      if (row.fleeHopeless == null) {
        base.cls = 'unclassified';
        base.detail = 'vFlee with fleeHopeless missing (cannot tell hopeless from floor)';
        return base;
      }
      if (row.fleeHopeless && row.calledHelp) {
        base.cls = 'hopeless-after-help';
        base.detail = 'hopeless after help arrived (ally ' + (row.allyVid || '?') + (row.ally2Vid ? ' + ' + row.ally2Vid : '') + '), R' + (row.rounds | 0) + ', everHopeless ' + !!row.everHopeless + ', fleeHpFrac ' + row.fleeHpFrac;
        return base;
      }
      if (row.fleeHopeless) {
        base.cls = 'hopeless-alone';
        base.detail = 'hopeless, no help called (allies ' + (row.alliesN | 0) + '), R' + (row.rounds | 0) + ', everHopeless ' + !!row.everHopeless + ', fleeHpFrac ' + row.fleeHpFrac;
        return base;
      }
      base.cls = 'floor-hp';
      base.detail = 'floor flee (not hopeless), R' + (row.rounds | 0) + ', fleeHpFrac ' + row.fleeHpFrac + ', everHopeless ' + !!row.everHopeless;
      return base;
    }
    // Engaged, ended in a non-flee outcome.
    const ecls = { vKill: 'engaged-vKill', vDie: 'engaged-vDie', mFlee: 'engaged-mFlee', vWin: 'engaged-vWin' }[row.outcome] || 'engaged-other';
    base.cls = ecls;
    const v = row.volley || {};
    base.detail = 'engaged, outcome ' + row.outcome + ', R' + (row.rounds | 0) +
      ', volley ' + ((v.shots | 0) + ' shots/' + (v.hits | 0) + ' hits/' + (v.dmg | 0) + ' dmg') +
      ', mDealt ' + (row.mDealt | 0) + ' vTaken ' + (row.vTaken | 0);
    return base;
  }
  // rounds 0 with a non-evade outcome: no fight happened, no class fits.
  base.cls = 'unclassified';
  base.detail = 'outcome ' + row.outcome + ' with rounds 0 (no fight, no evade)';
  return base;
}

// Volley inside the hopeless math (analyzer-side estimate, labeled):
// vDpr with/without the volley damage; rtk shift in rounds. The engine's
// rtk at the morale moment reads live lead HP over vDpr; the estimate
// uses final mDealt (the flee ends the fight, so the flee-round totals
// ARE the final totals) and mHpStart - mDealt as the remaining lead HP.
function volleyHopelessRead(m) {
  const volleyDmg = (m.volley && m.volley.dmg) | 0;
  const rounds = Math.max(1, m.rounds | 0);
  const mDealt = m.mDealt | 0;
  const vDprAll = mDealt / rounds;
  const vDprNoVolley = (mDealt - volleyDmg) / rounds;
  const mHpRemain = Math.max(0, (m.mHpStart != null ? m.mHpStart : 0) - mDealt);
  const rtkAll = mHpRemain / Math.max(0.5, vDprAll);
  const rtkNoVolley = Math.max(0, (m.mHpStart != null ? m.mHpStart : 0) - (mDealt - volleyDmg)) / Math.max(0.5, vDprNoVolley);
  return { volleyDmg: volleyDmg, volleyShareOfDealt: mDealt > 0 ? +(volleyDmg / mDealt).toFixed(3) : null,
    vDprAll: +vDprAll.toFixed(2), vDprNoVolley: +vDprNoVolley.toFixed(2),
    rtkAll: +rtkAll.toFixed(1), rtkNoVolley: +rtkNoVolley.toFixed(1),
    rtkShiftRounds: +(rtkNoVolley - rtkAll).toFixed(1) };
}

function analyzeFile(j) {
  const seed = j.seed;
  const maps = servedBowMaps(j.depmatRows || []);
  const meetings = (j.v4encounters || []).map(function (r) { return Object.assign({ seed: seed }, r); });
  const classified = [];
  let evadePRepMismatch = 0;
  for (const m of meetings) {
    const c = classifyMeeting(m, maps);
    if (!c) continue;
    if (c.evadeP != null && c.evadePRep != null && Math.abs(c.evadeP - c.evadePRep) > 0.001) evadePRepMismatch++;
    if (c.cls && c.cls.indexOf('engaged-') === 0) c.volleyHopeless = volleyHopelessRead(c);
    classified.push(c);
  }
  // Band baseline: ALL wave-4+ leads (served or not) — the evadeP
  // comparison population.
  let allLeads = 0, allAwareEvades = 0, allEvadePSum = 0, allEvadePN = 0;
  for (const m of meetings) {
    allLeads++;
    if (m.outcome === 'evade') allAwareEvades++;
    if (m.evade && m.evade.evadeP != null) { allEvadePSum += m.evade.evadeP; allEvadePN++; }
  }
  // Depmat-attributable served count (tie-in to prior arms).
  let depmatServed = 0;
  for (const vid of Object.keys(maps.depmatByVid)) depmatServed++;
  const starvation = (j.deaths || []).filter(function (d) { return d.cause === 'starvation' || d.kind === 'starvation'; }).length;
  return { seed: seed, days: j.days, endReason: j.endReason, villageLost: !!j.villageLost,
    maxWave: j.maxWave, standing: j.standing, scaleRank: j.scaleRank, won: !!j.won,
    deaths: (j.deaths || []).length, starvation: starvation,
    instrumentErrors: (j.instrumentErrors || []).length,
    depmatRows: (j.depmatRows || []).length, ammoRows: (j.ammoRows || []).length,
    meetings: meetings.length, classified: classified,
    evadePRepMismatch: evadePRepMismatch,
    depmatServedVids: depmatServed,
    allLeads: allLeads, allAwareEvades: allAwareEvades,
    allMeanEvadeP: allEvadePN ? +(allEvadePSum / allEvadePN).toFixed(3) : null,
    allAwareEvadeRate: allLeads ? +(allAwareEvades / allLeads).toFixed(3) : null,
    gameSha: j.gameSha || null, anchorCommit: j.anchorCommit || null };
}

function analyzeDir(dir) {
  const files = fs.readdirSync(dir).filter(function (f) { return /\.json$/.test(f); }).sort();
  const perSeed = [];
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    perSeed.push(analyzeFile(j));
  }
  const classes = {};
  for (const c of EVADE_CLASSES.concat(ENGAGED_CLASSES, ['alreadyDead', 'unclassified'])) classes[c] = 0;
  let pool = 0, unclassified = 0, errors = 0, evadePRepMismatch = 0;
  let evades = 0, engaged = 0, volleyFired = 0, volleyShots = 0, volleyHits = 0, volleyDmg = 0;
  let evadePSum = 0, evadePN = 0, awareEvades = 0;
  let allLeads = 0, allAwareEvades = 0, allEvadePSum = 0, allEvadePN = 0;
  let nat = 0, wins = 0, w4 = 0, w5 = 0, surv = [];
  const rtkShifts = [];
  const allMeetings = [];
  for (const s of perSeed) {
    errors += s.instrumentErrors;
    evadePRepMismatch += s.evadePRepMismatch;
    allLeads += s.allLeads; allAwareEvades += s.allAwareEvades;
    if (s.allMeanEvadeP != null) { allEvadePSum += s.allMeanEvadeP * s.allLeads; allEvadePN += s.allLeads; }
    if (s.scaleRank === 'national' || (typeof s.scaleRank === 'string' && s.scaleRank.indexOf('national') !== -1)) nat++;
    if (s.won) wins++;
    if ((s.maxWave | 0) >= 4) w4++;
    if ((s.maxWave | 0) >= 5) w5++;
    surv.push(s.days);
    for (const m of s.classified) {
      pool++;
      classes[m.cls] = (classes[m.cls] || 0) + 1;
      allMeetings.push(m);
      if (m.cls === 'unclassified') unclassified++;
      if (EVADE_CLASSES.indexOf(m.cls) !== -1) evades++;
      if (ENGAGED_CLASSES.indexOf(m.cls) !== -1) {
        engaged++;
        if (m.volley && (m.volley.shots | 0) > 0) {
          volleyFired++;
          volleyShots += (m.volley.shots | 0);
          volleyHits += (m.volley.hits | 0);
          volleyDmg += (m.volley.dmg | 0);
        }
        if (m.volleyHopeless) rtkShifts.push(m.volleyHopeless.rtkShiftRounds);
      }
      if (m.cls === 'awareness-evade' && m.evadeP != null) { evadePSum += m.evadeP; evadePN++; awareEvades++; }
      else if (m.evadeP != null) { evadePSum += m.evadeP; evadePN++; }
    }
  }
  // Dominant evade class (bar c).
  let dominant = null, dominantN = 0;
  for (const c of EVADE_CLASSES) {
    if ((classes[c] || 0) > dominantN) { dominantN = classes[c]; dominant = c; }
  }
  const mechanism = (evades === 0) ? 'none — every served quivered lead engaged'
    : (dominant === 'awareness-evade') ? 'M1 — the pre-contact awareness check, which takes no bow/ammo input'
    : ((dominant === 'hopeless-after-help' || dominant === 'hopeless-alone') ? 'M2 — the hopeless trajectory math, which prices the volley only as a diluted lump in mDealt'
    : ((dominant === 'floor-hp') ? 'M3 — the flee line (personality), which takes no kit input'
    : 'other — the dominant class is a meeting-logic exit (wise-leave / learn-withdraw), not a bow-blind assessment'));
  const meanRtkShift = rtkShifts.length ? +(rtkShifts.reduce(function (a, b) { return a + b; }, 0) / rtkShifts.length).toFixed(1) : null;
  surv.sort(function (a, b) { return a - b; });
  const medianSurv = surv.length ? surv[Math.floor(surv.length / 2)] : null;
  const barA = (unclassified === 0) && (errors === 0) && (evadePRepMismatch === 0);
  const barB = pool >= 3;
  const barC = (unclassified === 0) && (pool >= 3) && ((evades > 0 && dominant != null) || (evades === 0 && engaged > 0));
  return { dir: dir, seeds: perSeed.length, perSeed: perSeed,
    pool: pool, evades: evades, engaged: engaged,
    classes: classes, unclassified: unclassified,
    instrumentErrors: errors, evadePRepMismatch: evadePRepMismatch,
    dominantEvadeClass: dominant, dominantEvadeN: dominantN,
    dominantEvadeShare: evades ? +(dominantN / evades).toFixed(3) : null,
    mechanism: mechanism,
    volley: { fired: volleyFired, ofEngaged: engaged, shots: volleyShots, hits: volleyHits, dmg: volleyDmg },
    evadeP: { servedQuiveredMean: evadePN ? +(evadePSum / evadePN).toFixed(3) : null,
      servedQuiveredAwareRate: pool ? +(awareEvades / pool).toFixed(3) : null,
      allLeadsMean: allEvadePN ? +(allEvadePSum / allEvadePN).toFixed(3) : null,
      allLeadsAwareRate: allLeads ? +(allAwareEvades / allLeads).toFixed(3) : null,
      allLeads: allLeads },
    volleyHopeless: { meanRtkShiftRounds: meanRtkShift, n: rtkShifts.length },
    meetings: allMeetings,
    bars: { aCompleteness: barA, bPool: barB, cDominantNamed: barC },
    diagGo: barA && barB && barC,
    wall: { national: nat, wins: wins, wave4: w4, wave5: w5, medianSurvival: medianSurv } };
}

function judgeEvadebow(diag, ctl) {
  return { verdict: diag.diagGo ? 'DIAG-GO' : 'DIAG-NO-GO',
    bars: diag.bars, pool: diag.pool, evades: diag.evades, engaged: diag.engaged,
    classes: diag.classes, unclassified: diag.unclassified,
    dominantEvadeClass: diag.dominantEvadeClass, dominantEvadeN: diag.dominantEvadeN,
    dominantEvadeShare: diag.dominantEvadeShare, mechanism: diag.mechanism,
    volley: diag.volley, evadeP: diag.evadeP, volleyHopeless: diag.volleyHopeless,
    ctlPool: ctl ? ctl.pool : null, ctlEvades: ctl ? ctl.evades : null,
    ctlAllLeadsAwareRate: ctl ? ctl.evadeP.allLeadsAwareRate : null,
    wallDiag: diag.wall, wallCtl: ctl ? ctl.wall : null };
}

function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) { passed++; console.log('  PASS ' + name); }
    else { failed++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
  }
  // evadeP replication: tracking 0, territorial +0.05, speed 3 -0.06,
  // notice 5 -0.15, size 1 +0.05, potential false -> 0.24.
  const ev0 = { tracking: 0, behavior: 'territorial', mSpeed: 3, mNotice: 5, mSize: 1, potential: false, abs: {}, abNight: false };
  check('replicateEvadeP base case 0.24', replicateEvadeP(ev0) === 0.24, 'got ' + replicateEvadeP(ev0));
  const ev1 = { tracking: 12, behavior: 'ambush', mSpeed: 5, mNotice: 8, mSize: 1, potential: true,
    abs: { game_sense: true, tracker: true, echo_location: true }, abNight: true };
  // 0.35 + 0.12 - 0.15 - 0.10 - 0.24 + 0.05 + 0.05 + 0.10 + 0.05 + 0.10 = 0.33
  check('replicateEvadeP full-mod case 0.33', replicateEvadeP(ev1) === 0.33, 'got ' + replicateEvadeP(ev1));
  check('replicateEvadeP clamps low', replicateEvadeP({ tracking: 0, behavior: 'ambush', mSpeed: 9, mNotice: 9, mSize: 1, potential: false, abs: {}, abNight: false }) === 0.05);
  check('replicateEvadeP null on missing input', replicateEvadeP(null) === null);
  // Served map: earliest staged bow per (vid, itemId); noSource never serves.
  const stageRows = [
    { day: 10, vid: 'v1', staged: true, source: 'crafted', itemId: 'crude_bow', spearHolder: true, depmatSite: true },
    { day: 40, vid: 'v1', staged: true, source: 'fromStash', itemId: 'bow', spearHolder: false, depmatSite: false },
    { day: 12, vid: 'v2', staged: false, source: 'noSource', itemId: null, spearHolder: true, depmatSite: false },
    { day: 20, vid: 'v3', staged: true, source: 'crafted', itemId: 'crude_bow', spearHolder: false, depmatSite: false },
  ];
  const maps = servedBowMaps(stageRows);
  check('served map has v1 crude_bow day 10', maps.byVid.v1 && maps.byVid.v1.some(function (e) { return e.itemId === 'crude_bow' && e.day === 10; }), JSON.stringify(maps.byVid.v1));
  check('served map has v1 bow day 40', maps.byVid.v1 && maps.byVid.v1.some(function (e) { return e.itemId === 'bow' && e.day === 40; }), JSON.stringify(maps.byVid.v1));
  check('noSource v2 unserved', !maps.byVid.v2);
  check('depmat-attributable map has v1 day 10 only', maps.depmatByVid.v1 === 10 && maps.depmatByVid.v3 == null, JSON.stringify(maps.depmatByVid));
  // Classification fixtures (all served quivered unless noted).
  function mrow(over) {
    const base = { seed: 1, day: 50, vid: 'v1', mid: 'eater', wave: 4, origin: 'expedition',
      rangedId: 'crude_bow', ammoAtEntry: 4,
      evade: { tracking: 0, behavior: 'territorial', mSpeed: 3, mNotice: 5, mSize: 1, potential: false, abs: {}, abNight: false, evadeP: 0.24, gpTerm: false, obsBefore: 0, obsAfter: 0 },
      outcome: 'evade', rounds: 0, vTaken: 0, mDealt: 0, mHpStart: 1000, calledHelp: false,
      allyVid: null, ally2Vid: null, alliesN: 0, fleeHpFrac: null, fleeWise: false, fleeLearn: false,
      fleeHopeless: false, everHopeless: false, everWinning: false, intent: 'engage', intentWhy: 'seek',
      volley: null };
    return Object.assign(base, over || {});
  }
  check('awareness-evade', classifyMeeting(mrow(), maps).cls === 'awareness-evade');
  check('awareness-evade detail names evadeP + no-ranged-input', /evadeP 0\.24/.test(classifyMeeting(mrow(), maps).detail) && /no ranged input/.test(classifyMeeting(mrow(), maps).detail));
  check('evade with rounds>0 is unclassified', classifyMeeting(mrow({ rounds: 2 }), maps).cls === 'unclassified');
  check('hopeless-after-help', classifyMeeting(mrow({ outcome: 'vFlee', rounds: 5, calledHelp: true, allyVid: 'v9', fleeHopeless: true, everHopeless: true, fleeHpFrac: 0.3, mDealt: 120, vTaken: 200 }), maps).cls === 'hopeless-after-help');
  check('hopeless-alone', classifyMeeting(mrow({ outcome: 'vFlee', rounds: 4, calledHelp: false, fleeHopeless: true, fleeHpFrac: 0.22 }), maps).cls === 'hopeless-alone');
  check('floor-hp', classifyMeeting(mrow({ outcome: 'vFlee', rounds: 3, fleeHopeless: false, fleeHpFrac: 0.12 }), maps).cls === 'floor-hp');
  check('wise-leave beats hopeless (priority)', classifyMeeting(mrow({ outcome: 'vFlee', rounds: 3, fleeWise: true, fleeHopeless: true, calledHelp: true, fleeHpFrac: 0.5 }), maps).cls === 'wise-leave');
  check('learn-withdraw', classifyMeeting(mrow({ outcome: 'vFlee', rounds: 3, fleeLearn: true, intent: 'learn', intentWhy: 'learn-first' }), maps).cls === 'learn-withdraw');
  check('vFlee with fleeHopeless missing is unclassified', classifyMeeting(mrow({ outcome: 'vFlee', rounds: 3, fleeHopeless: null }), maps).cls === 'unclassified');
  check('engaged-vKill with volley', classifyMeeting(mrow({ outcome: 'vKill', rounds: 6, mDealt: 400, volley: { shots: 2, hits: 2, dmg: 34, ammoLeft: 2 } }), maps).cls === 'engaged-vKill');
  check('engaged-vDie', classifyMeeting(mrow({ outcome: 'vDie', rounds: 2, mDealt: 34, volley: { shots: 2, hits: 2, dmg: 34, ammoLeft: 2 } }), maps).cls === 'engaged-vDie');
  check('engaged-mFlee', classifyMeeting(mrow({ outcome: 'mFlee', rounds: 4, mDealt: 300 }), maps).cls === 'engaged-mFlee');
  check('alreadyDead', classifyMeeting(mrow({ outcome: 'alreadyDead', rounds: 0, mDealt: 0 }), maps).cls === 'alreadyDead');
  check('unknown outcome is unclassified', classifyMeeting(mrow({ outcome: 'mKill', rounds: 1 }), maps).cls === 'unclassified');
  check('missing outcome is unclassified', classifyMeeting(mrow({ outcome: null }), maps).cls === 'unclassified');
  check('non-served vid is not in the population', classifyMeeting(mrow({ vid: 'v2' }), maps) === null);
  check('served but 0 ammo is not quivered', classifyMeeting(mrow({ ammoAtEntry: 0 }), maps) === null);
  check('served bow, wrong itemId is not served', classifyMeeting(mrow({ rangedId: 'bow', day: 30 }), maps) === null);
  check('evadeP independence: ammo-only difference replicates identically',
    replicateEvadeP(mrow().evade) === replicateEvadeP(mrow({ ammoAtEntry: 9 }).evade) &&
    classifyMeeting(mrow(), maps).evadePRep === classifyMeeting(mrow({ ammoAtEntry: 9 }), maps).evadePRep);
  // Volley-in-hopeless read: volley 34 of 400 dealt over 6 rounds on a
  // 1000-HP monster: vDpr 66.67 -> 61.00, rtk 9.0 -> 10.4 (shift +1.4).
  const vh = volleyHopelessRead({ volley: { dmg: 34 }, rounds: 6, mDealt: 400, mHpStart: 1000 });
  check('volleyHopelessRead volley share 0.085', vh.volleyShareOfDealt === 0.085, JSON.stringify(vh));
  check('volleyHopelessRead rtk shift +1.4', vh.rtkShiftRounds === 1.4, JSON.stringify(vh));
  check('volleyHopelessRead zero volley shifts 0', volleyHopelessRead({ volley: { dmg: 0 }, rounds: 4, mDealt: 200, mHpStart: 900 }).rtkShiftRounds === 0);
  // Judge fixture: 3 served-quivered leads, 0 unclassified, pool 3.
  const fj = { seed: 1, days: 150, endReason: 'survived', villageLost: false, maxWave: 5, standing: 199, scaleRank: 'regional', won: false,
    deaths: [], instrumentErrors: [], depmatRows: stageRows, ammoRows: [],
    v4encounters: [
      mrow({}),
      mrow({ day: 60, outcome: 'vFlee', rounds: 5, calledHelp: true, allyVid: 'v9', fleeHopeless: true, fleeHpFrac: 0.3, mDealt: 120 }),
      mrow({ day: 70, outcome: 'vKill', rounds: 6, mDealt: 400, volley: { shots: 2, hits: 2, dmg: 34, ammoLeft: 2 } }),
      mrow({ day: 80, vid: 'v2', outcome: 'evade', rounds: 0 }), // not served: baseline only
    ] };
  const fa = analyzeFile(fj);
  check('analyzeFile pool is 3', fa.classified.length === 3, 'got ' + fa.classified.length);
  check('analyzeFile evadePRepMismatch 0', fa.evadePRepMismatch === 0);
  check('analyzeFile allLeads 4', fa.allLeads === 4);
  console.log('EVADEBOW_ANALYZE_SELFTEST ' + passed + ' passed, ' + failed + ' failed');
  return failed;
}

if (require.main === module) {
  if (process.argv.indexOf('--selftest') !== -1) {
    const f = selftest();
    process.exit(f ? 1 : 0);
  }
  const diagDir = process.argv[2] || DEFAULT_DIAG;
  const ctlDir = process.argv[3] || DEFAULT_CTL;
  const outPath = process.argv[4] || DEFAULT_OUT;
  const diag = analyzeDir(diagDir);
  let ctl = null;
  try { if (fs.existsSync(ctlDir)) ctl = analyzeDir(ctlDir); } catch (e) { ctl = null; }
  const res = { diag: diag, ctl: ctl, judge: judgeEvadebow(diag, ctl) };
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(res, null, 2) + '\n');
  console.log('diag seeds: ' + diag.seeds + ' | pool: ' + diag.pool + ' (evades ' + diag.evades + ', engaged ' + diag.engaged + ')');
  console.log('classes: ' + JSON.stringify(diag.classes));
  console.log('unclassified: ' + diag.unclassified + ' | instrumentErrors: ' + diag.instrumentErrors + ' | evadePRepMismatch: ' + diag.evadePRepMismatch);
  console.log('dominant evade class: ' + diag.dominantEvadeClass + ' (' + diag.dominantEvadeN + '/' + diag.evades + ')');
  console.log('mechanism: ' + diag.mechanism);
  console.log('volley: fired ' + diag.volley.fired + '/' + diag.volley.ofEngaged + ' engaged, ' + diag.volley.shots + ' shots / ' + diag.volley.hits + ' hits / ' + diag.volley.dmg + ' dmg');
  console.log('evadeP served-quivered mean ' + diag.evadeP.servedQuiveredMean + ' aware-rate ' + diag.evadeP.servedQuiveredAwareRate + ' | all-leads mean ' + diag.evadeP.allLeadsMean + ' aware-rate ' + diag.evadeP.allLeadsAwareRate);
  console.log('volley hopeless: mean rtk shift +' + diag.volleyHopeless.meanRtkShiftRounds + ' rounds (n=' + diag.volleyHopeless.n + ')');
  if (ctl) console.log('ctl: pool ' + ctl.pool + ' | all-leads aware-rate ' + ctl.evadeP.allLeadsAwareRate);
  console.log('wall diag: national ' + diag.wall.national + '/8, wins ' + diag.wall.wins + '/8, wave4 ' + diag.wall.wave4 + '/8, wave5 ' + diag.wall.wave5 + '/8, median survival ' + diag.wall.medianSurvival + 'd');
  console.log('bars: a=' + diag.bars.aCompleteness + ' b=' + diag.bars.bPool + ' c=' + diag.bars.cDominantNamed + ' => ' + res.judge.verdict);
  console.log('analysis: ' + outPath);
}

module.exports = { analyzeFile: analyzeFile, analyzeDir: analyzeDir, classifyMeeting: classifyMeeting,
  servedBowMaps: servedBowMaps, isServedQuivered: isServedQuivered, replicateEvadeP: replicateEvadeP,
  volleyHopelessRead: volleyHopelessRead, judgeEvadebow: judgeEvadebow, selftest: selftest };
