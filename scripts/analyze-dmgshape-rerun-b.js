// analyze-dmgshape-rerun-b.js — analyzer + judge, arm sim-dmgshape-rerun-b.
// The damage-per-launch re-measurement (finding #2605): for every
// wave-4+ launch on the designated band, the FIRST fight against the
// launch target (any origin, any fighter), decomposed against the
// 111/round winning shape with dmgshape-b's decomposition reused
// verbatim (decomposeEncounter + aggregate, imported — not copied).
// INSTRUMENT ONLY — no game code changes.
// Reads ONE per-seed corpus dir (the dmgshape-rerun driver recorder
// shape) and judges the frozen prereg bars.
// Usage:
//   node scripts/analyze-dmgshape-rerun-b.js --dir evidence/2026-11-19/perseed-dmgshape-rerun-b [--out evidence/2026-11-19/dmgshape-rerun-b-analysis.json]
//   node scripts/analyze-dmgshape-rerun-b.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');
const DSB = require(path.join(__dirname, 'analyze-dmgshape-b.js'));
const FCB = require(path.join(__dirname, 'analyze-fightcap-b.js'));
const decomposeEncounter = DSB.decomposeEncounter;
const aggregate = DSB.aggregate;
const WIN_SHAPE = DSB.WIN_SHAPE; // 111

// FROZEN BARS (prereg evidence/2026-11-19/sim-dmgshape-rerun-b-prereg.md).
const BARS = {
  poolFirstFights: 6, // launches with a first fight against the target
  poolFled: 4,         // fled first-fights (the judged decomposition set)
  classifiedShare: 0.90, // first-fights with >=1 landed strike (pMean != null)
  accounted: 0.70,
  topShare: 0.25,
  reconErr: 0.15,
};
const WINDOW_DAYS = 21;

function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function mean(xs) { return xs.length ? xs.reduce(function (a, b) { return a + b; }, 0) / xs.length : null; }

// Launches: v4departs rows with result 'launch', targetWave >= 4,
// target non-null — the survey's counting, all party sizes.
function launchesOf(d) {
  const out = [];
  for (const r of (d.v4departs || [])) {
    if (r.result !== 'launch' || (r.targetWave | 0) < 4 || !r.target) continue;
    out.push({ seed: d.seed, day: r.day, vid: r.vid, target: r.target,
      targetWave: r.targetWave, party: [r.vid].concat(r.party || []),
      partySize: r.partySize != null ? r.partySize : ((r.party || []).length + 1),
      source: r.source || null });
  }
  return out;
}

// First fight against the launch target (frozen): the earliest
// v4encounters row with mid === launch.target (the monster TYPE id —
// the recorder carries no instance id), day in [launch.day,
// launch.day + 21], fought (rounds > 0 or mDealt > 0), ANY origin,
// ANY fighter. Earliest day wins; the first row in file order wins a
// same-day tie (the recorder appends chronologically, so a single
// forward scan with a strict < keeps the earliest). Returns null
// when no such row exists in the window.
function firstFight(d, launch) {
  let best = null;
  for (const e of (d.v4encounters || [])) {
    if (e.mid !== launch.target) continue;
    if (e.day < launch.day || e.day > launch.day + WINDOW_DAYS) continue;
    if ((e.rounds | 0) === 0 && (e.mDealt | 0) === 0) continue; // no-contact evade
    if (!best || e.day < best.day) best = e;
  }
  return best;
}

// Classification (frozen prereg gloss, see §"Classification" in the
// evidence): a first-fight is classified when it has >=1 landed
// strike (pMean != null) — something to price the components from.
// A 0-damage / 0-landed-strike fight is unclassified, never scored
// at zero. The strict reading (all four per-fight components
// non-null) is reported beside the judged share in analyzeDir:
// a fighter-only fight has pAlly null, so its ally-delay term is
// unpriceable per-fight (the frozen aggregate prices it at the
// pooled level) — the strict count would punish fights for being
// solo, which is the phenomenon, not an instrument gap.
function isClassified(dec) {
  return dec.pMean != null;
}
function isStrictClassified(dec) {
  return dec.verbLoss != null && dec.missLoss != null &&
    dec.allyDelayLoss != null && dec.baseCeiling != null;
}

// One per-seed file: every launch -> its first fight (or none).
function analyzeFile(d) {
  const launches = launchesOf(d);
  const rows = [];
  for (const launch of launches) {
    const fight = firstFight(d, launch);
    if (!fight) {
      rows.push({ seed: d.seed, launch: launch, fight: null, sameDay: false,
        dec: null, classified: false, strictClassified: false });
      continue;
    }
    const enc = Object.assign({}, fight);
    enc._seed = d.seed;
    const dec = decomposeEncounter(enc);
    rows.push({ seed: d.seed, launch: launch, fight: fight,
      sameDay: fight.day === launch.day, dec: dec,
      classified: isClassified(dec), strictClassified: isStrictClassified(dec) });
  }
  return { seed: d.seed, launches: launches.length, rows: rows };
}

// Aggregate one corpus dir.
function analyzeDir(dir) {
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const perSeed = [];
  let rows = [];
  let errors = 0, filesRead = 0;
  const seeds = [];
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { continue; }
    filesRead++;
    seeds.push(d.seed);
    errors += ((d.instrumentErrors || []).length);
    const a = analyzeFile(d);
    rows = rows.concat(a.rows);
    perSeed.push({ seed: d.seed, launches: a.launches,
      firstFights: a.rows.filter(function (r) { return !!r.fight; }).length,
      fled: a.rows.filter(function (r) { return r.fight && r.fight.outcome === 'vFlee'; }).length,
      killed: a.rows.filter(function (r) { return r.fight && r.fight.outcome === 'vKill'; }).length,
      died: a.rows.filter(function (r) { return r.fight && r.fight.outcome === 'vDie'; }).length,
      other: a.rows.filter(function (r) { return r.fight && ['vFlee', 'vKill', 'vDie'].indexOf(r.fight.outcome) === -1; }).length,
      noFight: a.rows.filter(function (r) { return !r.fight; }).length });
  }
  const firstFights = rows.filter(function (r) { return !!r.fight; });
  const fledRows = firstFights.filter(function (r) { return r.fight.outcome === 'vFlee'; });
  const killedRows = firstFights.filter(function (r) { return r.fight.outcome === 'vKill'; });
  const diedRows = firstFights.filter(function (r) { return r.fight.outcome === 'vDie'; });
  const otherRows = firstFights.filter(function (r) { return ['vFlee', 'vKill', 'vDie'].indexOf(r.fight.outcome) === -1; });
  const fled = fledRows.map(function (r) { return r.dec; });
  const agg = aggregate(fled);
  // Exploratory (NOT the verdict): the same decomposition over ALL
  // first-fights regardless of outcome.
  const aggAll = aggregate(firstFights.map(function (r) { return r.dec; }));
  const classified = firstFights.filter(function (r) { return r.classified; }).length;
  const strictClassified = firstFights.filter(function (r) { return r.strictClassified; }).length;
  const distinctKeys = {};
  for (const r of firstFights) {
    distinctKeys[[r.seed, r.fight.day, r.fight.mid, r.fight.vid].join('|')] = true;
  }
  const byOrigin = {};
  const byOutcome = {};
  for (const r of firstFights) {
    byOrigin[r.fight.origin || 'null'] = (byOrigin[r.fight.origin || 'null'] || 0) + 1;
    byOutcome[r.fight.outcome || 'null'] = (byOutcome[r.fight.outcome || 'null'] || 0) + 1;
  }
  const sameDay = firstFights.filter(function (r) { return r.sameDay; }).length;
  return { dir: dir, files: filesRead, seeds: seeds, errors: errors,
    launches: rows.length, perSeed: perSeed, rows: rows,
    firstFights: firstFights.length, distinctFights: Object.keys(distinctKeys).length,
    fled: fledRows.length, killed: killedRows.length, died: diedRows.length, other: otherRows.length,
    noFight: rows.length - firstFights.length,
    classified: classified, strictClassified: strictClassified,
    classifiedShare: firstFights.length ? classified / firstFights.length : null,
    strictClassifiedShare: firstFights.length ? strictClassified / firstFights.length : null,
    byOrigin: byOrigin, byOutcome: byOutcome, sameDayFirstFights: sameDay,
    agg: agg, aggAll: aggAll };
}

function judge(a, leg) {
  const bars = [];
  const poolOk = a.firstFights >= BARS.poolFirstFights && a.fled >= BARS.poolFled;
  bars.push({ id: 'pool-first-fights', pass: a.firstFights >= BARS.poolFirstFights,
    detail: 'launches with a first fight against the target ' + a.firstFights + ' (floor ' + BARS.poolFirstFights + '); launches total ' + a.launches + '; distinct first-fight rows ' + a.distinctFights });
  bars.push({ id: 'pool-fled', pass: a.fled >= BARS.poolFled,
    detail: 'fled first-fights ' + a.fled + ' (floor ' + BARS.poolFled + '); killed ' + a.killed + ', died ' + a.died + ', other ' + a.other });
  bars.push({ id: 'instrument', pass: a.errors === 0 && a.files === 8,
    detail: 'instrument errors ' + a.errors + ' (bar 0); files ' + a.files + '/8' });
  const classPass = a.classifiedShare != null && a.classifiedShare >= BARS.classifiedShare;
  bars.push({ id: 'classification', pass: classPass,
    detail: 'classified first-fights ' + a.classified + '/' + a.firstFights + ' = ' + (a.classifiedShare == null ? 'n/a' : a.classifiedShare.toFixed(3)) + ' (bar >= ' + BARS.classifiedShare.toFixed(2) + '); strict-reading share ' + (a.strictClassifiedShare == null ? 'n/a' : a.strictClassifiedShare.toFixed(3)) + ' (' + a.strictClassified + '/' + a.firstFights + ')' });
  const reconOk = a.agg.recon.reconErr != null && a.agg.recon.reconErr <= BARS.reconErr;
  bars.push({ id: 'reconciliation', pass: reconOk,
    detail: 'exact-identity error ' + (a.agg.recon.reconErr == null ? 'n/a' : (a.agg.recon.reconErr * 100).toFixed(1) + '%') + ' (band 15%)' });
  const accOk = a.agg.accounted != null && a.agg.accounted >= BARS.accounted;
  bars.push({ id: 'accounted-share', pass: accOk,
    detail: 'accounted ' + (a.agg.accounted == null ? 'n/a' : a.agg.accounted.toFixed(3)) + ' (bar 0.70); gap ' +
      (a.agg.gap == null ? 'n/a' : a.agg.gap.toFixed(1)) + '/round; D_meas ' + (a.agg.dMeas == null ? 'n/a' : a.agg.dMeas.toFixed(1)) });
  const topOk = a.agg.topShareOfGap != null && a.agg.topShareOfGap >= BARS.topShare;
  bars.push({ id: 'top-contributor', pass: topOk,
    detail: 'top ' + a.agg.topContributor + ' ' + (a.agg.topValue == null || a.agg.topValue === -Infinity ? 'n/a' : a.agg.topValue.toFixed(1)) +
      '/round = ' + (a.agg.topShareOfGap == null ? 'n/a' : (a.agg.topShareOfGap * 100).toFixed(1) + '%') + ' of gap (bar 25%)' });
  let verdict = 'GO', kind = null;
  if (a.firstFights < BARS.poolFirstFights || a.fled < BARS.poolFled) { verdict = 'NO-GO'; kind = 'METRIC-BROKEN'; }
  else if (a.errors || a.files !== 8) { verdict = 'NO-GO'; kind = 'INSTRUMENT'; }
  else if (!classPass) { verdict = 'NO-GO'; kind = 'METRIC-BROKEN'; }
  else if (!reconOk) { verdict = 'NO-GO'; kind = 'INSTRUMENT'; }
  else if (a.agg.gap == null || a.agg.gap <= 0) { verdict = 'NO-GO'; kind = 'NO-GAP'; }
  else if (!accOk || !topOk) { verdict = 'NO-GO'; kind = 'UNEXPLAINED-GAP'; }
  return { verdict: verdict, kind: kind, bars: bars, leg: leg, agg: a.agg, aggAll: a.aggAll,
    wall: leg ? leg.wall : null };
}

function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) { passed++; console.log('PASS ' + name); }
    else { failed++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
  }
  // §A FIRST-FIGHT SELECTION (synthetic per-seed doc).
  function mkEnc(day, vid, mid, origin, outcome, rounds, mDealt) {
    return { day: day, vid: vid, mid: mid, wave: 4, origin: origin, outcome: outcome,
      rounds: rounds, mDealt: mDealt, mHpStart: 1000, log: [], roundsDetail: [],
      actionKinds: [], allyVid: null, ally2Vid: null, ally3Vid: null };
  }
  function mkLaunch(day, vid, target, wave) {
    return { day: day, vid: vid, result: 'launch', target: target, targetWave: wave || 4,
      party: ['c1', 'c2'], partySize: 3, source: 'brain' };
  }
  const d = {
    seed: 999002,
    instrumentErrors: [],
    v4departs: [
      mkLaunch(10, 'h1', 'eater'),
      mkLaunch(20, 'h2', 'audit'),
      mkLaunch(30, 'h3', 'herald'),
      mkLaunch(40, 'h4', 'reunion'),
      mkLaunch(42, 'h5', 'reunion'),
      mkLaunch(50, 'h6', 'eulogy'),
      mkLaunch(60, 'h7', 'cancellation', 5),
    ],
    v4encounters: [
      mkEnc(9, 'h1', 'eater', 'world-tick', 'vFlee', 2, 30),   // before window: excluded
      mkEnc(10, 'x1', 'eater', 'world-tick', 'vFlee', 3, 95),  // same-day, other party: SELECTED for h1
      mkEnc(12, 'h1', 'eater', 'expedition', 'vFlee', 4, 120), // later: not selected
      mkEnc(25, 'h2', 'audit', 'aid', 'vKill', 6, 400),        // SELECTED for h2 (killed)
      mkEnc(42, 'h2', 'audit', 'world-tick', 'vFlee', 2, 40),  // outside h2's window? d20+21=41: excluded
      mkEnc(45, 'h4', 'reunion', 'expedition', 'vFlee', 5, 200), // shared by h4 + h5
      mkEnc(52, 'h6', 'eulogy', 'world-tick', 'vFlee', 0, 0),  // no-contact evade: NOT a fight
      mkEnc(55, 'h6', 'eulogy', 'aid', 'vFlee', 1, 0),         // 0-damage fled: SELECTED, unclassified
      mkEnc(80, 'h7', 'cancellation', 'world-tick', 'vFlee', 3, 90), // outside h7's window (d60+21=81? 80 <= 81: INSIDE)
    ],
  };
  const a = analyzeFile(d);
  check('§A seven launches counted', a.launches === 7, a.launches);
  const byVid = {};
  for (const r of a.rows) byVid[r.launch.vid] = r;
  check('§A h1: same-day world-tick fight by another party is the first fight (day 10, origin world-tick, 95 dealt)',
    !!byVid.h1.fight && byVid.h1.fight.day === 10 && byVid.h1.fight.origin === 'world-tick' && byVid.h1.fight.mDealt === 95,
    byVid.h1.fight);
  check('§A h1: same-day flag set', byVid.h1.sameDay === true, byVid.h1.sameDay);
  check('§A h2: aid kill on d25 is the first fight (d42 row is outside the 21-day window)',
    !!byVid.h2.fight && byVid.h2.fight.day === 25 && byVid.h2.fight.outcome === 'vKill',
    byVid.h2.fight);
  check('§A h3: no herald fight in window, no first fight', byVid.h3.fight === null, byVid.h3.fight);
  check('§A h4+h5 share one first fight (d45 reunion)',
    !!byVid.h4.fight && !!byVid.h5.fight && byVid.h4.fight === byVid.h5.fight && byVid.h4.fight.day === 45,
    { h4: byVid.h4.fight && byVid.h4.fight.day, h5: byVid.h5.fight && byVid.h5.fight.day });
  check('§A h6: no-contact evade skipped, 0-damage aid fight on d55 is the first fight',
    !!byVid.h6.fight && byVid.h6.fight.day === 55 && byVid.h6.fight.mDealt === 0,
    byVid.h6.fight);
  check('§A h7: wave-5 cancellation fight on d80 is inside the 21-day window (d60+21=81)',
    !!byVid.h7.fight && byVid.h7.fight.day === 80 && byVid.h7.fight.mid === 'cancellation',
    byVid.h7.fight);
  // §B CLASSIFICATION: a fight with landed strikes classifies; a
  // 0-damage fight does not; a fighter-only fight classifies under
  // the frozen gloss (pMean != null) but not under the strict reading.
  const goodLog = [
    'Fighter walks straight into The Eater. No avoiding it.',
    'R1: Fighter strikes for 20 (980 left)',
    'R2: Fighter strikes for 18 (962 left)',
  ];
  const goodRd = [
    { round: 1, dealt: 20, allyDealt: 0, ally2Dealt: 0, abilities: [], tricks: [] },
    { round: 2, dealt: 18, allyDealt: 0, ally2Dealt: 0, abilities: [], tricks: [] },
  ];
  const goodDec = decomposeEncounter({ day: 10, mid: 'eater', wave: 4, vid: 'fighter',
    outcome: 'vFlee', rounds: 2, mDealt: 38, mHpStart: 1000, log: goodLog,
    roundsDetail: goodRd, actionKinds: ['strike', 'strike'],
    strikesThrown: 2, rageFired: false, flPreRoundDealt: 0,
    allyVid: null, ally2Vid: null, ally3Vid: null, allyDealt: 0, ally2Dealt: 0 });
  check('§B fighter-only fled fight: pMean 19, baseCeiling 35 (111-19x4)',
    goodDec.pMean === 19 && goodDec.baseCeiling === 35, { pMean: goodDec.pMean, baseCeiling: goodDec.baseCeiling });
  check('§B fighter-only fight classifies under the frozen gloss', isClassified(goodDec) === true, goodDec);
  check('§B fighter-only fight does NOT classify under the strict reading (pAlly null -> allyDelayLoss null)',
    isStrictClassified(goodDec) === false, { allyDelayLoss: goodDec.allyDelayLoss, pAlly: goodDec.pAlly });
  const zeroDec = decomposeEncounter({ day: 55, mid: 'eulogy', wave: 4, vid: 'fighter',
    outcome: 'vFlee', rounds: 1, mDealt: 0, mHpStart: 1000,
    log: ['Fighter walks straight into The Eulogy. No avoiding it.',
      'Fighter falls back — the fight is lost.'],
    roundsDetail: [{ round: 1, dealt: 0, allyDealt: 0, ally2Dealt: 0, abilities: [], tricks: [] }],
    actionKinds: ['ability'], strikesThrown: 0, rageFired: false, flPreRoundDealt: 0,
    allyVid: null, ally2Vid: null, ally3Vid: null, allyDealt: 0, ally2Dealt: 0 });
  check('§B 0-damage fled fight: pMean null, baseCeiling null', zeroDec.pMean == null && zeroDec.baseCeiling == null, zeroDec);
  check('§B 0-damage fight does not classify under either reading',
    isClassified(zeroDec) === false && isStrictClassified(zeroDec) === false, zeroDec);
  // §C JUDGE fixtures.
  function mkAgg(o) {
    return Object.assign({ dir: 'x', files: 8, seeds: [1], errors: 0, launches: 8,
      firstFights: 6, distinctFights: 6, fled: 5, killed: 1, died: 0, other: 0, noFight: 2,
      classified: 6, strictClassified: 4, classifiedShare: 1.0, strictClassifiedShare: 4 / 6,
      byOrigin: {}, byOutcome: {}, sameDayFirstFights: 0,
      agg: { gap: 80, dMeas: 31, accounted: 0.8, topContributor: 'baseCeiling',
        topValue: 40, topShareOfGap: 0.5, recon: { reconErr: 0.05 } },
      aggAll: { gap: 75, dMeas: 36, accounted: 0.75, topContributor: 'baseCeiling',
        topValue: 38, topShareOfGap: 0.5, recon: { reconErr: 0.05 } } }, o);
  }
  let j = judge(mkAgg({}), null);
  check('§C judge GO shape passes', j.verdict === 'GO' && j.bars.every(function (b) { return b.pass; }), JSON.stringify(j));
  j = judge(mkAgg({ firstFights: 5 }), null);
  check('§C judge METRIC-BROKEN below the first-fight floor (5 < 6)', j.verdict === 'NO-GO' && j.kind === 'METRIC-BROKEN', JSON.stringify(j));
  j = judge(mkAgg({ fled: 3 }), null);
  check('§C judge METRIC-BROKEN below the fled floor (3 < 4)', j.verdict === 'NO-GO' && j.kind === 'METRIC-BROKEN', JSON.stringify(j));
  j = judge(mkAgg({ classified: 4, classifiedShare: 4 / 6 }), null);
  check('§C judge NO-GO when classified share is 0.667 (< 0.90)', j.verdict === 'NO-GO' && !j.bars[3].pass, JSON.stringify(j.bars));
  j = judge(mkAgg({ errors: 1 }), null);
  check('§C judge INSTRUMENT on instrument errors', j.verdict === 'NO-GO' && j.kind === 'INSTRUMENT' && !j.bars[2].pass, JSON.stringify(j.bars));
  j = judge(mkAgg({ agg: { gap: 80, dMeas: 31, accounted: 0.8, topContributor: 'baseCeiling', topValue: 40, topShareOfGap: 0.5, recon: { reconErr: 0.20 } } }), null);
  check('§C judge INSTRUMENT when reconciliation error is 0.20 (> 0.15)', j.verdict === 'NO-GO' && j.kind === 'INSTRUMENT', JSON.stringify(j));
  j = judge(mkAgg({ agg: { gap: -5, dMeas: 116, accounted: 1.0, topContributor: 'baseCeiling', topValue: 40, topShareOfGap: 0.5, recon: { reconErr: 0.05 } } }), null);
  check('§C judge NO-GAP when the gap is <= 0', j.verdict === 'NO-GO' && j.kind === 'NO-GAP', JSON.stringify(j));
  j = judge(mkAgg({ agg: { gap: 80, dMeas: 31, accounted: 0.6, topContributor: 'baseCeiling', topValue: 40, topShareOfGap: 0.5, recon: { reconErr: 0.05 } } }), null);
  check('§C judge UNEXPLAINED-GAP when accounted is 0.60 (< 0.70)', j.verdict === 'NO-GO' && j.kind === 'UNEXPLAINED-GAP', JSON.stringify(j));
  // §D DRIVER SMOKE (subprocess): one 30d seed on the designated
  // band, exit 0, 0 errors, flags self-describing, port present.
  const { spawnSync } = require('child_process');
  const os = require('os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dmgshape-rerun-smoke-'));
  const smokeDir = 'perseed-dmgshape-rerun-b-smoke';
  const smokePath = path.join(__dirname, '..', 'evidence', '2026-11-19', smokeDir);
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}
  const env = Object.assign({}, process.env, { SENSEEXPED: '1', PARTYSIZE4: '1', VETREENGAGE: '1',
    FLEEREPAIR2: '1', FIGHTALLY2: '1', ALLYSLOT3: '1', LAUNCHSURVIVE: '1', MODE: 'dmgshape', DAYS: '30',
    SEEDS: '106081', RUN: 'dmgshape-rerun-b-smoke', OUTDIR: smokeDir });
  const r = spawnSync(process.execPath, [path.join(__dirname, 'dmgshape-rerun-driver-b.js')],
    { cwd: path.join(__dirname, '..'), env: env, encoding: 'utf8', timeout: 600000 });
  check('§D driver smoke: exit 0 on one 30d seed', r.status === 0, (r.stderr || '').slice(0, 300));
  let dd = null;
  try { dd = JSON.parse(fs.readFileSync(path.join(smokePath, 'dmgshape-rerun-b-s106081-dmgshape-rerun-b-smoke-dmgshape.json'), 'utf8')); } catch (e) {}
  check('§D driver smoke: corpus file written', !!dd, null);
  if (dd) {
    check('§D driver smoke: flags self-describe (leverPresent true — slot ported, allyslot3Flag 1, senseexpedFlag 1, launchTrackOn true)',
      dd.leverPresent === true && dd.allyslot3Flag === '1' && dd.senseexpedFlag === '1' && dd.launchTrackOn === true,
      { leverPresent: dd.leverPresent, allyslot3Flag: dd.allyslot3Flag, senseexpedFlag: dd.senseexpedFlag, launchTrackOn: dd.launchTrackOn });
    check('§D driver smoke: 0 instrument errors',
      (dd.instrumentErrors || []).length === 0, dd.instrumentErrors);
    check('§D driver smoke: anchor is a 40-hex commit (never a pinned hash)',
      /^[0-9a-f]{40}$/.test(String(dd.anchorCommit || '')), dd.anchorCommit);
    check('§D driver smoke: arm label is dmgshape-rerun-b',
      dd.arm === 'dmgshape-rerun-b', dd.arm);
    const rowsWithRd = (dd.v4encounters || []).filter(function (e) { return Array.isArray(e.roundsDetail); });
    check('§D driver smoke: encounter rows carry roundsDetail (uncapped-log instrument present)',
      (dd.v4encounters || []).length === 0 || rowsWithRd.length === (dd.v4encounters || []).length,
      { encounters: (dd.v4encounters || []).length, withRd: rowsWithRd.length });
  }
  try { fs.rmSync(smokePath, { recursive: true, force: true }); } catch (e) {}
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  console.log('analyze-dmgshape-rerun-b selftest: ' + passed + ' passed, ' + failed + ' failed');
  return failed === 0;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) {
    process.exit(selftest() ? 0 : 1);
  }
  let dir = null, outFile = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir') dir = args[++i];
    else if (args[i] === '--out') outFile = args[++i];
  }
  if (!dir) { console.error('usage: analyze-dmgshape-rerun-b.js --dir DIR [--out FILE] | --selftest'); process.exit(2); }
  const a = analyzeDir(dir);
  const leg = FCB.summarizeLeg(dir);
  const j = judge(a, leg);
  const result = { verdict: j.verdict, kind: j.kind, bars: j.bars, analysis: a,
    wall: leg.wall, medianDays: leg.medianDays, launches: leg.launches, errors: leg.errors };
  console.log(JSON.stringify({ verdict: j.verdict, kind: j.kind, bars: j.bars,
    launches: a.launches, firstFights: a.firstFights, distinctFights: a.distinctFights,
    fled: a.fled, killed: a.killed, died: a.died, other: a.other, noFight: a.noFight,
    classified: a.classified, classifiedShare: a.classifiedShare,
    strictClassified: a.strictClassified, strictClassifiedShare: a.strictClassifiedShare,
    byOrigin: a.byOrigin, byOutcome: a.byOutcome, sameDayFirstFights: a.sameDayFirstFights,
    agg: a.agg, aggAll: a.aggAll, wall: leg.wall, medianDays: leg.medianDays }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}

module.exports = { launchesOf: launchesOf, firstFight: firstFight, isClassified: isClassified,
  isStrictClassified: isStrictClassified, analyzeFile: analyzeFile, analyzeDir: analyzeDir,
  judge: judge, WIN_SHAPE: WIN_SHAPE, BARS: BARS, WINDOW_DAYS: WINDOW_DAYS, selftest: selftest };
