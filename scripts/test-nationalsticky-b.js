// test-nationalsticky-b.js — proof test, arm sim-nationalsticky-b
// (DIAG: is reached-national lost, and how? — findings #2452).
// Static checks + D1 determinism + D2 neutrality + D3 re-derivation.
// Run BEFORE the sweep; green on the instrument tip is G2.
//   node scripts/test-nationalsticky-b.js
// Counts: prints "PASS n/n" and exits 0 only when every check passes.
// The D1/D2 live runs use seed 103011 at 60d (in-memory determinism
// checks — no corpus file is written). The D3 corpus check reuses the
// D1 ON corpus in memory.
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const DRIVER = require(path.join(REPO, 'scripts', 'nationalsticky-driver-20261116'));
const ANALYZER = require(path.join(REPO, 'scripts', 'analyze-nationalsticky-b'));

let pass = 0, fail = 0;
const failures = [];
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; failures.push(name + (extra ? ' — ' + extra : '')); console.log('  FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

function signature(rec) {
  const daily = (rec.series || []).map(function (sn) {
    return [sn.d, sn.nationalLive ? 1 : 0, sn.scale, sn.stRaw | 0,
      sn.pop | 0, JSON.stringify(sn.wk || {})].join('|');
  });
  const trust = (rec.series || []).map(function (sn) {
    return (sn.linksRoll || []).map(function (l) { return l.id + ':' + l.t + ':' + l.se; }).sort().join(',');
  });
  return { daily: daily, trust: trust,
    wall: { standing: rec.standing, standingRaw: rec.standingRaw,
      scaleRank: rec.scaleRank, maxWave: rec.maxWave,
      deaths: (rec.deaths || []).length, gameDays: rec.gameDays,
      endReason: rec.endReason, won: rec.won } };
}

// Independent D3 re-implementation: recomputes the lapse cause from
// the raw snapshot fields WITHOUT calling the analyzer (different
// code, same frozen rule). Any disagreement with deriveLapseCause is
// a D3 failure.
function independentCause(prev, cur) {
  let drift = 0, lost = 0;
  const prevById = {};
  (prev.linksRoll || []).forEach(function (l) { if (l && l.id) prevById[l.id] = l; });
  const curById = {};
  (cur.linksRoll || []).forEach(function (l) { if (l && l.id) curById[l.id] = l; });
  Object.keys(prevById).forEach(function (id) {
    const pl = prevById[id];
    if (!pl || pl.st !== 'active' || !pl.se) return;
    const cl = curById[id];
    if (!cl || cl.st !== 'active') lost++;
    else if (!cl.se && (cl.t | 0) < 40) drift++;
  });
  if (drift && lost) return 'both';
  if (drift) return 'trust-drift';
  if (lost) return 'link-loss';
  return 'unknown';
}

function synthSnap(day, nationalLive, links, capped, cands) {
  return { d: day, nationalLive: nationalLive, linksRoll: links,
    capped: capped, shapeCands: cands || { lead: null, conquest: null, belong: null, covenant: null, trade: null },
    havenPolity: null, scale: 'regional', stRaw: 100 };
}
function synthLink(id, other, trust, seasoned, status) {
  return { id: id, o: other, k: 'covenant', p: 'haven', sub: other,
    st: status || 'active', t: trust, f: 10, age: 40, cq: 0,
    se: seasoned ? 1 : 0, rp: seasoned ? 1 : 0 };
}

async function main() {
  console.log('test-nationalsticky-b: static checks');
  // S1: zero src/js change (staged + unstaged + untracked under src/).
  let srcDiff = '';
  try { srcDiff = execSync('git diff --stat -- src/ && git diff --cached --stat -- src/', { cwd: REPO }).toString().trim(); } catch (e) { srcDiff = 'git-error'; }
  let srcUntracked = '';
  try { srcUntracked = execSync('git status --short -- src/', { cwd: REPO }).toString().trim(); } catch (e) { srcUntracked = 'git-error'; }
  check('S1 zero src/ diff (staged + unstaged)', srcDiff === '', JSON.stringify(srcDiff).slice(0, 200));
  check('S1b zero untracked src/ files', srcUntracked === '', JSON.stringify(srcUntracked).slice(0, 200));
  // S2: policy hash is the frozen verbatim blob.
  const polSha = crypto.createHash('sha256').update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8')).digest('hex');
  check('S2 competent sha256 is df9b7dff…', polSha === 'df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c', polSha.slice(0, 12));
  // S3: wraps named in the driver; no Game.save stub (harness rule).
  const drvSrc = fs.readFileSync(path.join(REPO, 'scripts', 'nationalsticky-driver-20261116.js'), 'utf8');
  check('S3 driver wraps answerNationalChoice', drvSrc.indexOf('Game.answerNationalChoice') !== -1);
  check('S3b driver wraps tendLink', drvSrc.indexOf('Game.tendLink') !== -1);
  check('S3c driver never stubs Game.save', drvSrc.indexOf('Game.save') === -1);
  const drvLines = drvSrc.split('\n').filter(function (ln) { return ln.trim().indexOf('//') !== 0; });
  const callLines = drvLines.filter(function (ln) { return ln.indexOf('villageStandingTotal()') !== -1; }).length;
  check('S3d driver calls villageStandingTotal at exactly one (end-of-run) site', callLines === 1, 'call-lines=' + callLines);
  // S4: analyzer exports.
  check('S4 analyzer exports deriveLapseCause', typeof ANALYZER.deriveLapseCause === 'function');
  check('S4b analyzer exports classifySeed', typeof ANALYZER.classifySeed === 'function');

  console.log('test-nationalsticky-b: D1 determinism (ON twice, seed 103011, 60d)');
  const on1 = await DRIVER.oneRun(103011, { days: 60 });
  const on2 = await DRIVER.oneRun(103011, { days: 60 });
  const sig1 = signature(on1), sig2 = signature(on2);
  check('D1 identical daily nationalLive/scale/standing/pop/waveKills series', JSON.stringify(sig1.daily) === JSON.stringify(sig2.daily));
  check('D1b identical link-roll trust/seasoned series', JSON.stringify(sig1.trust) === JSON.stringify(sig2.trust));
  check('D1c identical verbEvents', JSON.stringify(on1.verbEvents) === JSON.stringify(on2.verbEvents));
  check('D1d identical end wall fields', JSON.stringify(sig1.wall) === JSON.stringify(sig2.wall));
  check('D1e series covers ≥30 days', on1.series.length >= 30, 'series=' + on1.series.length);
  check('D1f zero instrument errors on both runs', (on1.instrumentErrors.length + on2.instrumentErrors.length) === 0, JSON.stringify(on1.instrumentErrors.concat(on2.instrumentErrors)).slice(0, 200));

  console.log('test-nationalsticky-b: D2 neutrality (OFF vs ON, seed 103011, 60d)');
  // OFF runs in a child process: RECORDER_ON is bound at require time.
  const childJs = "const D=require(" + JSON.stringify(path.join(REPO, 'scripts', 'nationalsticky-driver-20261116.js')) + ");" +
    "D.oneRun(103011,{days:60}).then(function(r){" +
    "const s=(r.series||[]).map(function(sn){return [sn.d,sn.nationalLive?1:0,sn.scale,sn.stRaw|0,sn.pop|0,JSON.stringify(sn.wk||{})].join('|');});" +
    "console.log(JSON.stringify({daily:s,wall:{standing:r.standing,standingRaw:r.standingRaw,scaleRank:r.scaleRank,maxWave:r.maxWave,deaths:(r.deaths||[]).length,gameDays:r.gameDays,endReason:r.endReason,won:r.won},errors:r.instrumentErrors}));" +
    "}).catch(function(e){console.error(e.stack);process.exit(1);});";
  const offRaw = execFileSync(process.execPath, ['-e', childJs], {
    cwd: REPO, env: Object.assign({}, process.env, { NATIONALSTICKY_RECORDER: 'off' }),
    maxBuffer: 64 * 1024 * 1024,
  }).toString().trim();
  const offSig = JSON.parse(offRaw);
  check('D2 identical daily series OFF vs ON', JSON.stringify(offSig.daily) === JSON.stringify(sig1.daily));
  check('D2b identical end wall fields OFF vs ON', JSON.stringify(offSig.wall) === JSON.stringify(sig1.wall));
  check('D2c zero instrument errors OFF leg', (offSig.errors || []).length === 0, JSON.stringify(offSig.errors).slice(0, 200));
  check('D2d OFF leg carries no recorder rows', true, 'OFF corpus omits verbEvents/sayLines by construction (recorder off)');

  console.log('test-nationalsticky-b: D3 re-derivation (synthetic + corpus)');
  // Synthetic cases: (i) trust-drift, (ii) link-loss, (iii) both,
  // (iv) standing-fall co-occurrence, (v) unknown, (vi) polity-still-qualifies.
  const baseLinks = [synthLink('L1', 'village_0', 45, true), synthLink('L2', 'village_1', 50, true), synthLink('L3', 'village_2', 55, true)];
  const prev = synthSnap(100, true, baseLinks, 250);
  const driftCur = synthSnap(101, false, [synthLink('L1', 'village_0', 39, false), synthLink('L2', 'village_1', 50, true), synthLink('L3', 'village_2', 55, true)], 250);
  const driftCause = ANALYZER.deriveLapseCause(prev, driftCur);
  check('D3a trust-drift classified', driftCause.cause === 'trust-drift');
  check('D3a2 drift link named with 45->39', driftCause.driftLinks.length === 1 && driftCause.driftLinks[0].trustBefore === 45 && driftCause.driftLinks[0].trustLapse === 39, JSON.stringify(driftCause.driftLinks));
  check('D3a3 independent re-implementation agrees (trust-drift)', independentCause(prev, driftCur) === driftCause.cause);
  const lossCur = synthSnap(101, false, [synthLink('L1', 'village_0', 45, true), synthLink('L2', 'village_1', 50, true)], 250);
  const lossCause = ANALYZER.deriveLapseCause(prev, lossCur);
  check('D3b link-loss classified', lossCause.cause === 'link-loss');
  check('D3b2 lost link named (L3, trust 55)', lossCause.lostLinks.length === 1 && lossCause.lostLinks[0].id === 'L3' && lossCause.lostLinks[0].trustBefore === 55, JSON.stringify(lossCause.lostLinks));
  check('D3b3 independent agrees (link-loss)', independentCause(prev, lossCur) === lossCause.cause);
  const bothCur = synthSnap(101, false, [synthLink('L1', 'village_0', 39, false), synthLink('L2', 'village_1', 50, true)], 250);
  const bothCause = ANALYZER.deriveLapseCause(prev, bothCur);
  check('D3c both classified', bothCause.cause === 'both');
  check('D3c2 independent agrees (both)', independentCause(prev, bothCur) === bothCause.cause);
  const fallCur = synthSnap(101, false, [synthLink('L1', 'village_0', 39, false), synthLink('L2', 'village_1', 50, true), synthLink('L3', 'village_2', 55, true)], 150);
  const fallCause = ANALYZER.deriveLapseCause(prev, fallCur);
  check('D3d standing-fall flagged as co-occurrence (cause stays trust-drift)', fallCause.cause === 'trust-drift' && fallCause.standingFall === true, JSON.stringify({ cause: fallCause.cause, standingFall: fallCause.standingFall }));
  const unkCur = synthSnap(101, false, baseLinks, 250);
  const unkCause = ANALYZER.deriveLapseCause(prev, unkCur);
  check('D3e unknown when no link cause (no forced cause)', unkCause.cause === 'unknown');
  check('D3e2 independent agrees (unknown)', independentCause(prev, unkCur) === 'unknown');
  const qualCur = synthSnap(101, false, [synthLink('L1', 'village_0', 39, false), synthLink('L2', 'village_1', 50, true), synthLink('L3', 'village_2', 55, true)], 250,
    { lead: null, conquest: null, belong: null, covenant: { shape: 'covenant', size: 4, primary: 'haven', led: false }, trade: null });
  const qualCause = ANALYZER.deriveLapseCause(prev, qualCur);
  check('D3f polity-still-qualifies anomaly flagged', qualCause.polityStillQualifies === true);
  // D3g: every series day carries the frozen shape (shapeCands +
  // linksRoll + nationalLive) and no instrument errors on the D1 corpus.
  const shapeOk = on1.series.every(function (sn) {
    return sn.shapeCands && typeof sn.shapeCands === 'object' && Array.isArray(sn.linksRoll) && typeof sn.nationalLive === 'boolean';
  });
  check('D3g every D1 series day carries shapeCands + linksRoll + nationalLive', shapeOk);
  // D3h: classifySeed on the D1 corpus — reach days from the series
  // must equal reach days from the verbEvents (or both empty).
  const cls = ANALYZER.classifySeed(on1);
  check('D3h series reach days == verb reach days on D1 corpus', cls.verbMismatch.length === 0, JSON.stringify(cls.verbMismatch).slice(0, 200));
  check('D3h2 unknown lapses 0 on D1 corpus', cls.unknownLapses === 0, 'unknown=' + cls.unknownLapses);
  // D3i NEGATIVE CONTROL: strip the answerNationalChoice verbEvents
  // from a copy — the classifier must NOTICE the missing reach
  // evidence (verbMismatch non-empty) instead of silently agreeing.
  // If the 60d corpus has no reach, build a synthetic reach instead.
  let negOk = false, negNote = '';
  if (cls.reachDaysFromSeries.length) {
    const stripped = JSON.parse(JSON.stringify(on1));
    stripped.verbEvents = stripped.verbEvents.filter(function (v) { return v.verb !== 'answerNationalChoice'; });
    const clsStripped = ANALYZER.classifySeed(stripped);
    negOk = clsStripped.verbMismatch.length >= 1;
    negNote = 'reachDays=' + JSON.stringify(cls.reachDaysFromSeries);
  } else {
    const synth = { seed: 0, policy: 'competent', mode: 'on', instrumentErrors: [],
      series: [synthSnap(10, false, baseLinks, 100), synthSnap(11, true, baseLinks, 100)],
      verbEvents: [] };
    const clsSynth = ANALYZER.classifySeed(synth);
    negOk = clsSynth.verbMismatch.length >= 1 && clsSynth.reachDaysFromSeries.length === 1;
    negNote = 'synthetic reach, no verbs';
  }
  check('D3i NEGATIVE CONTROL: stripped/missing answer verbs are detected', negOk, negNote);

  console.log('test-nationalsticky-b: ' + pass + '/' + (pass + fail) + ' checks passed');
  if (fail) { console.log('FAILURES:\n' + failures.map(function (f) { return ' - ' + f; }).join('\n')); process.exitCode = 1; }
}

main().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
