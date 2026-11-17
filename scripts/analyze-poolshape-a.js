// analyze-poolshape-a.js — DIAG analyzer, arm sim-poolshape-a.
// Decomposes the empty companion pool on the launchfunnel band:
// per scored dawn, every living non-self villager is classified
// eligible vs ineligible with a reason code taken from the two
// findCompanion implementations (villager-brain.js:129, win-plan.js:208).
// Outputs evidence/2026-11-17/poolshape-a-analysis.json.
// Usage: node scripts/analyze-poolshape-a.js [--vre <dir>] [--off <dir>]
//   [--rec <dir>] [--rec0 <dir>] [--lfvre <launchfunnel-vre-dir>]
//   Defaults are the poolshape corpora + the launchfunnel vre corpus.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
function argvVal(flag, dflt) {
  return process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : dflt;
}
const VRE_DIR = path.join(REPO, argvVal('--vre', 'evidence/2026-11-17/perseed-poolshape-a-vre'));
const OFF_DIR = path.join(REPO, argvVal('--off', 'evidence/2026-11-17/perseed-poolshape-a-off'));
const REC_DIR = path.join(REPO, argvVal('--rec', 'evidence/2026-11-17/perseed-poolshape-a-rec'));
const REC0_DIR = path.join(REPO, argvVal('--rec0', 'evidence/2026-11-17/perseed-poolshape-a-rec0'));
const LFVRE_DIR = path.join(REPO, argvVal('--lfvre', 'evidence/2026-11-17/perseed-launchfunnel-a-vre'));
const OUT_FILE = path.join(REPO, 'evidence', '2026-11-17', 'poolshape-a-analysis.json');

const SEEDS = [103411, 103412, 103413, 103414, 103415, 103416, 103417, 103418];
const RANGER = { wanderer: 1, explorer: 1 };
const CONDITIONS = ['dead', 'away', 'trustLow', 'notAtHaven', 'engaged', 'notRanger', 'onExped'];
const RELAX = ['relaxProfile', 'relaxAway', 'relaxNode', 'relaxTrust', 'relaxEngaged', 'relaxOnExped', 'relaxProfileAway'];

function loadDir(dir, prefix) {
  const bySeed = {};
  const files = fs.readdirSync(dir).filter(function (x) { return x.endsWith('.json'); }).sort();
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    bySeed[j.seed] = j;
  }
  return { dir: dir, files: files, bySeed: bySeed };
}
function med(a) {
  const s = a.slice().sort(function (x, y) { return x - y; });
  if (!s.length) return null;
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}
function share(n, d) { return d ? +(n / d).toFixed(4) : null; }

// --- member-level condition reads (from the members snapshot, the same
// effective values poolReplica read: trust default 10, node-null ->
// not-at-Haven, profile-null -> not-ranger) ---
function condsOf(m, haven) {
  const atHaven = !!(m.node && haven && m.node.nx === haven.nx && m.node.ny === haven.ny);
  return {
    dead: !m.alive,
    away: !!m.away,
    trustLow: (m.trust != null ? m.trust : 10) < 15,
    notAtHaven: !atHaven,
    engaged: !!m.engaged,
    notRanger: !(m.profile && RANGER[m.profile]),
    onExped: !!m.onExped,
    nodeNull: m.node == null,
    awayNodeDisagree: !!m.away && atHaven,
    nodeAwayDisagree: !m.away && !atHaven,
  };
}
// Eligibility under the findCompanion check order, with one check dropped
// (relax === null: the real definition). Returns true iff eligible.
function eligibleUnder(c, relax) {
  if (c.dead) return false;
  if (relax !== 'relaxAway' && relax !== 'relaxProfileAway' && c.away) return false;
  if (relax !== 'relaxTrust' && c.trustLow) return false;
  if (relax !== 'relaxNode' && c.notAtHaven) return false;
  if (relax !== 'relaxEngaged' && c.engaged) return false;
  if (relax !== 'relaxProfile' && relax !== 'relaxProfileAway' && c.notRanger) return false;
  if (relax !== 'relaxOnExped' && c.onExped) return false;
  return true;
}

function decomposePoolRows(rows) {
  let checks = 0, coded = 0, unknown = 0, shapeBad = 0, agreeFalse = 0, agreeRows = 0;
  let poolRows = rows.length, emptyRows = 0;
  const firstFails = {};
  const marginal = {}; CONDITIONS.forEach(function (c) { marginal[c] = 0; });
  const alone = {}; CONDITIONS.forEach(function (c) { alone[c] = 0; });
  const combo = {}; CONDITIONS.forEach(function (c) { combo[c] = 0; });
  let popB = 0;
  let awayNodeDisagree = 0, nodeAwayDisagree = 0, nodeNull = 0;
  const profiles = {}; const nonRangerProfiles = {};
  const perDawn = [];
  const relaxTotals = {}; RELAX.forEach(function (r) { relaxTotals[r] = { eligSum: 0, dawnsNonEmpty: 0 }; });
  const holderSplit = { ranger: { dawns: 0, empty: 0 }, nonRanger: { dawns: 0, empty: 0 }, unknown: { dawns: 0, empty: 0 } };
  const stageSplit = {};
  let bidOnEmpty = 0, bidOnNonEmpty = 0, nonEmptyNoBid = 0;
  for (const row of rows) {
    const members = row.members || [];
    if (!Array.isArray(members) || members.length !== row.rosterN) shapeBad++;
    const haven = row.haven || null;
    const living = members.filter(function (m) { return m && m.firstFail !== 'selfOrScholar'; });
    popB += living.length;
    const dawnMarg = {}; CONDITIONS.forEach(function (c) { dawnMarg[c] = 0; });
    const dawnAlone = {}; CONDITIONS.forEach(function (c) { dawnAlone[c] = 0; });
    let dawnDisagree = 0, dawnNodeAway = 0;
    const relaxElig = {}; RELAX.forEach(function (r) { relaxElig[r] = 0; });
    for (const m of members) {
      checks++;
      if (m && m.firstFail) coded++; else unknown++;
      if (!m || m.firstFail === 'selfOrScholar') continue;
      firstFails[m.firstFail] = (firstFails[m.firstFail] || 0) + 1;
      const c = condsOf(m, haven);
      const failed = CONDITIONS.filter(function (k) { return c[k]; });
      for (const k of failed) { marginal[k]++; dawnMarg[k]++; }
      if (failed.length === 1) { alone[failed[0]]++; dawnAlone[failed[0]]++; }
      else if (failed.length > 1) { for (const k of failed) combo[k]++; }
      if (c.awayNodeDisagree) { awayNodeDisagree++; dawnDisagree++; }
      if (c.nodeAwayDisagree) { nodeAwayDisagree++; dawnNodeAway++; }
      if (c.nodeNull) nodeNull++;
      profiles[m.profile || 'null'] = (profiles[m.profile || 'null'] || 0) + 1;
      if (c.notRanger) nonRangerProfiles[m.profile || 'null'] = (nonRangerProfiles[m.profile || 'null'] || 0) + 1;
      for (const r of RELAX) if (eligibleUnder(c, r)) relaxElig[r]++;
    }
    const empty = (row.eligible || []).length === 0;
    if (empty) emptyRows++;
    for (const r of RELAX) { relaxTotals[r].eligSum += relaxElig[r]; if (relaxElig[r] > 0) relaxTotals[r].dawnsNonEmpty++; }
    // Dominant reason per dawn (marginal reading): largest failing group.
    let domMax = -1; const dom = [];
    for (const k of CONDITIONS) { if (dawnMarg[k] > domMax) { domMax = dawnMarg[k]; dom.length = 0; dom.push(k); } else if (dawnMarg[k] === domMax && domMax > 0) dom.push(k); }
    let aloneMax = -1; const aloneDom = [];
    for (const k of CONDITIONS) { if (dawnAlone[k] > aloneMax) { aloneMax = dawnAlone[k]; aloneDom.length = 0; aloneDom.push(k); } else if (dawnAlone[k] === aloneMax && aloneMax > 0) aloneDom.push(k); }
    // First-fail dominant for comparability.
    const ff = {}; for (const m of living) ff[m.firstFail] = (ff[m.firstFail] || 0) + 1;
    let ffMax = -1; const ffDom = [];
    for (const k of Object.keys(ff)) { if (ff[k] > ffMax) { ffMax = ff[k]; ffDom.length = 0; ffDom.push(k); } else if (ff[k] === ffMax) ffDom.push(k); }
    perDawn.push({
      seed: row.seed != null ? row.seed : null, day: row.day, vid: row.vid, target: row.target || null, stage: row.stage || null,
      holderProfile: row.holderProfile || null, rosterN: row.rosterN, livingN: living.length,
      eligibleN: (row.eligible || []).length, empty: empty,
      dominantMarginal: domMax > 0 ? dom : [], dominantMarginalN: domMax > 0 ? domMax : 0,
      dominantAlone: aloneMax > 0 ? aloneDom : [], dominantAloneN: aloneMax > 0 ? aloneMax : 0,
      dominantFirstFail: ffMax > 0 ? ffDom : [], dominantFirstFailN: ffMax > 0 ? ffMax : 0,
      marginal: dawnMarg, relaxElig: relaxElig,
      awayNodeDisagree: dawnDisagree, nodeAwayDisagree: dawnNodeAway,
    });
    const hp = row.holderProfile;
    const hs = (hp && RANGER[hp]) ? 'ranger' : (hp ? 'nonRanger' : 'unknown');
    holderSplit[hs].dawns++; if (empty) holderSplit[hs].empty++;
    stageSplit[row.stage || 'null'] = (stageSplit[row.stage || 'null'] || 0) + 1;
    if (row.bidCompanion) { if (empty) bidOnEmpty++; else bidOnNonEmpty++; }
    else if (!empty) nonEmptyNoBid++;
    if (row.agree === false) agreeFalse++;
    if (row.agree != null) agreeRows++;
  }
  // Dominant-reason tallies over empty-pool dawns only.
  const domTally = {}; const domAloneTally = {}; const domFFTally = {};
  for (const d of perDawn) {
    if (!d.empty) continue;
    for (const k of d.dominantMarginal) domTally[k] = (domTally[k] || 0) + 1;
    for (const k of d.dominantAlone) domAloneTally[k] = (domAloneTally[k] || 0) + 1;
    for (const k of d.dominantFirstFail) domFFTally[k] = (domFFTally[k] || 0) + 1;
  }
  const relaxTable = {};
  for (const r of RELAX) {
    relaxTable[r] = {
      meanEligiblePerDawn: poolRows ? +(relaxTotals[r].eligSum / poolRows).toFixed(2) : null,
      dawnsNonEmpty: relaxTotals[r].dawnsNonEmpty, dawnsNonEmptyShare: share(relaxTotals[r].dawnsNonEmpty, poolRows),
      emptyDawnsFilled: relaxTotals[r].dawnsNonEmpty - (poolRows - emptyRows),
      emptyDawnsFilledShare: emptyRows ? +(relaxTotals[r].dawnsNonEmpty - (poolRows - emptyRows)) / emptyRows : null,
    };
  }
  return {
    poolRows: poolRows, emptyRows: emptyRows, emptyShare: share(emptyRows, poolRows),
    checks: checks, coded: coded, codedShare: share(coded, checks), unknown: unknown, shapeBad: shapeBad,
    agreeRows: agreeRows, agreeFalse: agreeFalse,
    popB: popB, marginal: marginal, alone: alone, combo: combo,
    marginalShare: Object.fromEntries(CONDITIONS.map(function (k) { return [k, share(marginal[k], popB)]; })),
    firstFails: firstFails,
    awayNodeDisagree: awayNodeDisagree, nodeAwayDisagree: nodeAwayDisagree, nodeNull: nodeNull,
    profiles: profiles, nonRangerProfiles: nonRangerProfiles,
    holderSplit: holderSplit, stageSplit: stageSplit,
    bidOnEmpty: bidOnEmpty, bidOnNonEmpty: bidOnNonEmpty, nonEmptyNoBid: nonEmptyNoBid,
    dominantTallyEmptyDawns: domTally, dominantAloneTallyEmptyDawns: domAloneTally,
    dominantFirstFailTallyEmptyDawns: domFFTally,
    relaxTable: relaxTable, perDawn: perDawn,
  };
}

function wallOf(bySeed) {
  const RANK = { village: 0, regional: 1, national: 2, global: 3 };
  const rows = Object.keys(bySeed).map(function (k) { return bySeed[k]; });
  let deaths = 0, starv = 0;
  for (const j of rows) {
    deaths += (j.deaths || []).length;
    starv += (j.deaths || []).filter(function (d) { return d.cause === 'starvation'; }).length;
  }
  return {
    wins: rows.filter(function (j) { return !!j.won; }).length,
    nationalStanding: rows.filter(function (j) { return (j.standing || 0) >= 200; }).length,
    nationalRank: rows.filter(function (j) { return (RANK[j.scaleRank] || 0) >= 2; }).length,
    table: rows.filter(function (j) { return !!j.won; }).length,
    wave4: rows.filter(function (j) { return (j.maxWave || 0) >= 4; }).length,
    wave5: rows.filter(function (j) { return (j.maxWave || 0) >= 5; }).length,
    medianSurvival: med(rows.map(function (j) { return j.gameDays || j.days || 0; })),
    deaths: deaths, starvation: starv,
  };
}
function trajFingerprint(j) {
  return JSON.stringify({
    d: (j.daily || []).map(function (x) { return x.day; }),
    g: j.gameDays, s: j.standing, w: j.maxWave,
    e: j.endReason, won: !!j.won, r: j.scaleRank,
    de: (j.deaths || []).map(function (x) { return [x.day, x.kind, x.who, x.cause]; }),
  });
}
function trajDivergences(aDir, bDir) {
  let n = 0; const seeds = [];
  for (const k of Object.keys(aDir.bySeed)) {
    const a = aDir.bySeed[k], b = bDir.bySeed[k];
    if (!b) { n++; seeds.push(+k); continue; }
    if (trajFingerprint(a) !== trajFingerprint(b)) { n++; seeds.push(+k); }
  }
  return { divergences: n, seeds: seeds };
}
function replicationCheck(poolVre, lfVre) {
  const perSeed = {};
  let rowsMatch = true, details = [];
  for (const s of SEEDS) {
    const a = (poolVre.bySeed[s] || {}).companionPool || [];
    const b = (lfVre.bySeed[s] || {}).companionPool || [];
    const key = function (r) { return r.day + '|' + r.vid; };
    const ka = a.map(key).sort().join(';');
    const kb = b.map(key).sort().join(';');
    const ea = a.filter(function (r) { return (r.eligible || []).length === 0; }).length;
    const eb = b.filter(function (r) { return (r.eligible || []).length === 0; }).length;
    const ok = ka === kb && ea === eb;
    if (!ok) rowsMatch = false;
    perSeed[s] = { poolshapeRows: a.length, launchfunnelRows: b.length, poolshapeEmpty: ea, launchfunnelEmpty: eb, match: ok };
    details.push(s + ':' + a.length + '/' + b.length + ' rows,' + ea + '/' + eb + ' empty');
  }
  const totA = SEEDS.reduce(function (t, s) { return t + (((poolVre.bySeed[s] || {}).companionPool || []).length); }, 0);
  const totB = SEEDS.reduce(function (t, s) { return t + (((lfVre.bySeed[s] || {}).companionPool || []).length); }, 0);
  return { rowsMatch: rowsMatch, poolshapeRows: totA, launchfunnelRows: totB, perSeed: perSeed, detail: details.join(' ') };
}

function main() {
  const vre = loadDir(VRE_DIR); const off = loadDir(OFF_DIR);
  const rec = fs.existsSync(REC_DIR) ? loadDir(REC_DIR) : null;
  const rec0 = fs.existsSync(REC0_DIR) ? loadDir(REC0_DIR) : null;
  const lfVre = loadDir(LFVRE_DIR);
  const vreRows = [];
  for (const s of SEEDS) {
    const j = vre.bySeed[s];
    if (!j) continue;
    for (const r of (j.companionPool || [])) vreRows.push(Object.assign({ seed: s }, r));
  }
  const decomp = decomposePoolRows(vreRows);
  const rep = replicationCheck(vre, lfVre);
  const vreErrors = Object.keys(vre.bySeed).reduce(function (t, k) { return t + ((vre.bySeed[k].instrumentErrors || []).length); }, 0);
  const offErrors = Object.keys(off.bySeed).reduce(function (t, k) { return t + ((off.bySeed[k].instrumentErrors || []).length); }, 0);
  const recErrors = rec ? Object.keys(rec.bySeed).reduce(function (t, k) { return t + ((rec.bySeed[k].instrumentErrors || []).length); }, 0) : null;
  const rec0Errors = rec0 ? Object.keys(rec0.bySeed).reduce(function (t, k) { return t + ((rec0.bySeed[k].instrumentErrors || []).length); }, 0) : null;
  const d2 = rec ? trajDivergences(vre, rec) : null;
  const d2b = rec0 ? trajDivergences(off, rec0) : null;
  // Top reason: dominant-marginal tally over empty-pool dawns.
  let topReason = null, topN = 0;
  for (const k of Object.keys(decomp.dominantTallyEmptyDawns)) {
    if (decomp.dominantTallyEmptyDawns[k] > topN) { topN = decomp.dominantTallyEmptyDawns[k]; topReason = k; }
  }
  const bar1 = decomp.codedShare >= 0.95 && decomp.unknown === 0 && decomp.shapeBad === 0;
  const bar2 = vre.files.length === 8 && rep.rowsMatch && rep.poolshapeRows === 87 && decomp.emptyRows === 81;
  const bar3 = topReason != null && Object.keys(decomp.relaxTable).length === RELAX.length &&
    typeof decomp.awayNodeDisagree === 'number' && Object.keys(decomp.nonRangerProfiles).length > 0;
  const bar4 = vre.files.length === 8 && (off.files.length === 8) &&
    (!rec || rec.files.length === 8) && (!rec0 || rec0.files.length === 8) &&
    vreErrors === 0 && offErrors === 0 && (recErrors === 0 || recErrors == null) && (rec0Errors === 0 || rec0Errors == null) &&
    (!d2 || d2.divergences === 0) && (!d2b || d2b.divergences === 0);
  const verdict = (bar1 && bar2 && bar3 && bar4) ? 'DIAG-GO' : 'DIAG-NO-GO';
  const out = {
    arm: 'poolshape-a', run: 'poolshape-a',
    vreDir: path.basename(VRE_DIR), offDir: path.basename(OFF_DIR),
    recDir: rec ? path.basename(REC_DIR) : null, rec0Dir: rec0 ? path.basename(REC0_DIR) : null,
    replication: rep,
    census: decomp,
    topReason: topReason, topReasonEmptyDawns: topN,
    topReasonEmptyShare: decomp.emptyRows ? +(topN / decomp.emptyRows).toFixed(4) : null,
    wall: { vre: wallOf(vre.bySeed), off: wallOf(off.bySeed), rec: rec ? wallOf(rec.bySeed) : null, rec0: rec0 ? wallOf(rec0.bySeed) : null },
    d2VreVsRec: d2, d2OffVsRec0: d2b,
    instrumentErrors: { vre: vreErrors, off: offErrors, rec: recErrors, rec0: rec0Errors },
    bars: {
      classification: { pass: bar1, codedShare: decomp.codedShare, unknown: decomp.unknown, shapeBad: decomp.shapeBad },
      corpusReplication: { pass: bar2, vreFiles: vre.files.length, poolRows: rep.poolshapeRows, emptyRows: decomp.emptyRows, rowsMatch: rep.rowsMatch },
      decomposition: { pass: bar3, topReason: topReason, relaxKeys: Object.keys(decomp.relaxTable) },
      instrument: { pass: bar4, vreFiles: vre.files.length, offFiles: off.files.length, recFiles: rec ? rec.files.length : null, rec0Files: rec0 ? rec0.files.length : null, vreErrors: vreErrors, offErrors: offErrors, recErrors: recErrors, rec0Errors: rec0Errors, d2VreVsRec: d2 ? d2.divergences : null, d2OffVsRec0: d2b ? d2b.divergences : null },
    },
    verdict: verdict,
  };
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2) + '\n');
  console.log('=== poolshape-a decomposition (vre leg) ===');
  console.log('pool rows: ' + decomp.poolRows + ' empty: ' + decomp.emptyRows + ' (' + decomp.emptyShare + ')');
  console.log('replication vs launchfunnel vre: ' + (rep.rowsMatch ? 'MATCH' : 'MISMATCH') + ' ' + rep.detail);
  console.log('classification: codedShare=' + decomp.codedShare + ' unknown=' + decomp.unknown + ' shapeBad=' + decomp.shapeBad + ' agreeFalse=' + decomp.agreeFalse + '/' + decomp.agreeRows);
  console.log('marginals (popB=' + decomp.popB + '): ' + JSON.stringify(decomp.marginal) + ' shares: ' + JSON.stringify(decomp.marginalShare));
  console.log('alone: ' + JSON.stringify(decomp.alone) + ' firstFails: ' + JSON.stringify(decomp.firstFails));
  console.log('dominant tally (empty dawns): ' + JSON.stringify(decomp.dominantTallyEmptyDawns));
  console.log('dominant-alone tally (empty dawns): ' + JSON.stringify(decomp.dominantAloneTallyEmptyDawns));
  console.log('relax: ' + JSON.stringify(decomp.relaxTable));
  console.log('away/node disagreements: awayNode=' + decomp.awayNodeDisagree + ' nodeAway=' + decomp.nodeAwayDisagree + ' nodeNull=' + decomp.nodeNull);
  console.log('nonRanger profiles: ' + JSON.stringify(decomp.nonRangerProfiles));
  console.log('holder split: ' + JSON.stringify(decomp.holderSplit) + ' stages: ' + JSON.stringify(decomp.stageSplit));
  console.log('wall vre: ' + JSON.stringify(out.wall.vre) + ' off: ' + JSON.stringify(out.wall.off));
  console.log('d2 vre-vs-rec: ' + JSON.stringify(d2) + ' off-vs-rec0: ' + JSON.stringify(d2b));
  console.log('bars: classification=' + (bar1 ? 'PASS' : 'FAIL') + ' replication=' + (bar2 ? 'PASS' : 'FAIL') +
    ' decomposition=' + (bar3 ? 'PASS' : 'FAIL') + ' instrument=' + (bar4 ? 'PASS' : 'FAIL'));
  console.log('VERDICT: ' + verdict);
  console.log('analysis: ' + path.relative(REPO, OUT_FILE));
}
if (require.main === module) main();
module.exports = { decomposePoolRows: decomposePoolRows, condsOf: condsOf, eligibleUnder: eligibleUnder, replicationCheck: replicationCheck, wallOf: wallOf, trajFingerprint: trajFingerprint };
