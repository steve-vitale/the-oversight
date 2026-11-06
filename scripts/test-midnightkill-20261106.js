// test-midnightkill-20261106.js — proof for the ±1-day kill join
// (arm sim-midnightkill-b, run fleshout-loop-b-20261106T1730Z).
// Fixture tests for the midnight-spanning join in both instruments'
// matchers + the partydamage analyzer's pyrrhic matcher, the corpus
// re-classification asserted against the preregged GO (a)–(d), and live
// harness legs (driver subprocesses into /tmp, never into evidence/):
// the new instruments install cleanly and record traces with 0
// instrument errors. A live leg is NOT expected to produce a
// midnight-spanning kill on demand (1 in 24 fights on the partydamage
// band); the GO is proven by the corpus re-classification + fixtures.
// Exit non-zero on any failure.
// Usage: node scripts/test-midnightkill-20261106.js
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const INST = require(path.join(REPO, 'scripts', 'fightinterior-instrument-20261106'));
const AN = require(path.join(REPO, 'scripts', 'fightinterior-analyze-20261106'));
const PD = require(path.join(REPO, 'scripts', 'partydamage-instrument-20261106'));
const PDA = require(path.join(REPO, 'scripts', 'partydamage-analyze-20261106'));
const RC = require(path.join(REPO, 'scripts', 'midnightkill-reclassify-20261106'));
const PD_CORPUS = path.join(REPO, 'evidence', '2026-11-06', 'perseed-partydamage-b');
const FI_CORPUS = path.join(REPO, 'evidence', '2026-11-06', 'perseed-fightinterior-b');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

function trace(opts) {
  const o = opts || {};
  return Object.assign({
    seq: 1, tbSeq: 1, day: 117, mid: 'influencer', mids: ['influencer'], wave: 4,
    entryHp: 637, entryMaxHp: 637, entryFrac: 1, fighters: ['nadia_khoury', 'visjoin_96'],
    alliesAtEntry: 1, partyAtEntry: 1, hits: [], turns: [], verbs: [],
    outcome: 'won', ending: 'rout', mHpLeft: 0, mHpLeftFrac: 0,
    rounds: 9, scholarHpEnd: 40, scholarHpFracEnd: 0.4,
    rallyRound: 1, rallyOk: true, scholarStruckRallyRound: false,
  }, o);
}
// Log entries use {d, w}; killsLive entries use {day, wave}.
function logEntry(d, mid, w, by, via) { return { d: d, mid: mid, w: w, by: by, via: via, trick: null }; }
function liveEntry(day, mid, wave, by, via) { return { day: day, mid: mid, wave: wave, by: by, via: via }; }

// ---------- 1. fightinterior 'won' join: ±1 day + same-beast guard ----------
(function () {
  const nadia = function (day, mid, by) { return liveEntry(day, mid, 4, by, 'player'); };
  const tr = trace({ outcome: 'won' });
  // The Nadia shape: fight day 117, kill logged day 118.
  const c1 = INST.classifyEnding(tr, [logEntry(118, 'influencer', 4, 'nadia_khoury', 'player')],
    [nadia(118, 'influencer', 'nadia_khoury')], 'tbEnd', false);
  check('won-midnight-plus-one-matches', c1.ending === 'kill', JSON.stringify(c1));
  // Same-day still matches (regression).
  const c2 = INST.classifyEnding(tr, [logEntry(117, 'influencer', 4, 'nadia_khoury', 'player')],
    [nadia(117, 'influencer', 'nadia_khoury')], 'tbEnd', false);
  check('won-same-day-still-matches', c2.ending === 'kill', JSON.stringify(c2));
  // The preregged window is symmetric: a day−1 entry matches by
  // construction. A day−1 entry can never be this fight's own kill
  // (the kill is logged after the fight starts) — see metric review:
  // the next recorder arm should consider [0,+1] + mHpLeft === 0 on
  // the 'won' branch. Pinned here so the behavior is deliberate, not
  // accidental.
  const c3 = INST.classifyEnding(tr, [logEntry(116, 'influencer', 4, 'nadia_khoury', 'player')],
    [nadia(116, 'influencer', 'nadia_khoury')], 'tbEnd', false);
  check('won-day-minus-one-matches-symmetric-window', c3.ending === 'kill', JSON.stringify(c3));
  // Day+2 is outside the window: no match, stays rout.
  const c4 = INST.classifyEnding(tr, [logEntry(119, 'influencer', 4, 'nadia_khoury', 'player')],
    [nadia(119, 'influencer', 'nadia_khoury')], 'tbEnd', false);
  check('won-day-plus-two-no-match', c4.ending === 'rout', JSON.stringify(c4));
  // Unrelated adjacent-day kill: same fighter, different beast — the
  // same-beast guard must refuse it (the ±1 window without the guard
  // would false-match a field/contest kill from the next day).
  const c5 = INST.classifyEnding(tr, [logEntry(118, 'eater', 4, 'nadia_khoury', 'player')],
    [nadia(118, 'eater', 'nadia_khoury')], 'tbEnd', false);
  check('won-adjacent-day-wrong-beast-no-match', c5.ending === 'rout', JSON.stringify(c5));
  // Same beast, adjacent day, killer NOT in this fight: no match.
  const c6 = INST.classifyEnding(tr, [logEntry(118, 'influencer', 4, 'someone_else', 'player')],
    [nadia(118, 'influencer', 'someone_else')], 'tbEnd', false);
  check('won-adjacent-day-wrong-killer-no-match', c6.ending === 'rout', JSON.stringify(c6));
  // Low wave, adjacent day: no match.
  const c7 = INST.classifyEnding(tr, [logEntry(118, 'influencer', 3, 'nadia_khoury', 'player')],
    [liveEntry(118, 'influencer', 3, 'nadia_khoury', 'player')], 'tbEnd', false);
  check('won-adjacent-day-low-wave-no-match', c7.ending === 'rout', JSON.stringify(c7));
  // matchWonKills counts candidates: same-day + next-day entries for
  // the same beast+killer are both candidates (ambiguity surface).
  const two = INST.matchWonKills(tr, [nadia(117, 'influencer', 'nadia_khoury'), nadia(118, 'influencer', 'nadia_khoury')]);
  check('won-two-candidates-counted', two.length === 2, 'n=' + two.length);
  check('won-first-match-returned', INST.matchWonKill(tr, [nadia(118, 'influencer', 'nadia_khoury')]) !== null);
  // Multi-monster trace: the kill may be of the second monster in mids.
  const multi = trace({ mid: 'reunion', mids: ['reunion', 'influencer'], fighters: ['nadia_khoury'] });
  const c8 = INST.classifyEnding(multi, [], [nadia(118, 'influencer', 'nadia_khoury')], 'tbEnd', false);
  check('won-second-monster-in-mids-matches', c8.ending === 'kill', JSON.stringify(c8));
  // sameBeast fallbacks: trace with mid only (no mids list); trace
  // with no monster id at all falls back to the old day+fighter+wave
  // check rather than inventing a non-match.
  check('sameBeast-mid-fallback', INST.sameBeast({ mid: 'influencer' }, 'influencer') === true);
  check('sameBeast-mid-fallback-mismatch', INST.sameBeast({ mid: 'influencer' }, 'eater') === false);
  check('sameBeast-no-id-fallback', INST.sameBeast({}, 'influencer') === true);
  check('sameBeast-no-kill-mid', INST.sameBeast(trace({}), null) === false);
})();

// ---------- 2. fightinterior log join (pyrrhic / unclosed): ±1 day ----------
(function () {
  const lostTr = trace({ outcome: 'lost', day: 65, mid: 'reunion', mids: ['reunion'],
    fighters: ['ingrid_vik', 'greta_hansen'], mHpLeft: 2654 });
  // Midnight pyrrhic: log-only entry the next day matches.
  const c1 = INST.classifyEnding(lostTr, [logEntry(66, 'reunion', 4, 'greta_hansen', 'companion')], [], 'tbEnd', false);
  check('pyrrhic-midnight-plus-one-matches', c1.ending === 'pyrrhic-kill', JSON.stringify(c1));
  // Same-day pyrrhic still matches (regression — the greta shape).
  const c2 = INST.classifyEnding(lostTr, [logEntry(65, 'reunion', 4, 'greta_hansen', 'companion')], [], 'tbEnd', false);
  check('pyrrhic-same-day-still-matches', c2.ending === 'pyrrhic-kill', JSON.stringify(c2));
  // Day+2 pyrrhic: outside the window.
  const c3 = INST.classifyEnding(lostTr, [logEntry(67, 'reunion', 4, 'greta_hansen', 'companion')], [], 'tbEnd', false);
  check('pyrrhic-day-plus-two-no-match', c3.ending === 'scholar-death', JSON.stringify(c3));
  // Wrong beast next day: no pyrrhic.
  const c4 = INST.classifyEnding(lostTr, [logEntry(66, 'eater', 4, 'greta_hansen', 'companion')], [], 'tbEnd', false);
  check('pyrrhic-adjacent-day-wrong-beast-no-match', c4.ending === 'scholar-death', JSON.stringify(c4));
  // Unclosed midnight: unfinished + next-day log entry + beast at 0.
  const uncTr = trace({ outcome: 'unfinished', day: 80, mid: 'strike', mids: ['strike'],
    fighters: ['grace_obi'], mHpLeft: 0, mHpLeftFrac: 0 });
  const c5 = INST.classifyEnding(uncTr, [logEntry(81, 'strike', 4, 'grace_obi', 'player')],
    [liveEntry(81, 'strike', 4, 'grace_obi', 'player')], 'stale', false);
  check('unclosed-midnight-plus-one-matches', c5.ending === 'kill-unclosed', JSON.stringify(c5));
  // Unclosed, beast alive: the mHpLeft guard still refuses the
  // next-day match (a later fight's kill stays out).
  const c6 = INST.classifyEnding(trace({ outcome: 'unfinished', day: 80, mid: 'strike', mids: ['strike'],
    fighters: ['grace_obi'], mHpLeft: 500 }), [logEntry(81, 'strike', 4, 'grace_obi', 'player')],
    [liveEntry(81, 'strike', 4, 'grace_obi', 'player')], 'stale', false);
  check('unclosed-midnight-beast-alive-guard', c6.ending === 'unfinished', JSON.stringify(c6));
})();

// ---------- 3. partydamage matchWonKill + analyzer pyrrhic matcher ----------
(function () {
  const tr = trace({ outcome: 'won' });
  const live = function (day, mid, by) { return liveEntry(day, mid, 4, by, 'player'); };
  check('pd-won-midnight-plus-one-matches', PD.matchWonKill(tr, [live(118, 'influencer', 'nadia_khoury')]) !== null);
  check('pd-won-same-day-still-matches', PD.matchWonKill(tr, [live(117, 'influencer', 'nadia_khoury')]) !== null);
  check('pd-won-day-plus-two-no-match', PD.matchWonKill(tr, [live(119, 'influencer', 'nadia_khoury')]) === null);
  check('pd-won-adjacent-day-wrong-beast-no-match', PD.matchWonKill(tr, [live(118, 'eater', 'nadia_khoury')]) === null);
  check('pd-won-adjacent-day-wrong-killer-no-match', PD.matchWonKill(tr, [live(118, 'influencer', 'someone_else')]) === null);
  check('pd-won-two-candidates-counted', PD.matchWonKills(tr, [live(117, 'influencer', 'nadia_khoury'), live(118, 'influencer', 'nadia_khoury')]).length === 2);
  check('pd-won-second-monster-in-mids-matches',
    PD.matchWonKill(trace({ mid: 'reunion', mids: ['reunion', 'influencer'], fighters: ['nadia_khoury'] }), [live(118, 'influencer', 'nadia_khoury')]) !== null);
  // Analyzer pyrrhic matcher (unfinished traces): ±1 + mid guard.
  const unc = trace({ outcome: 'unfinished', day: 80, mid: 'strike', mids: ['strike'], fighters: ['grace_obi'], mHpLeft: 0 });
  check('pd-pyrrhic-midnight-plus-one-matches', PDA.matchPyrrhicKill(unc, [logEntry(81, 'strike', 4, 'grace_obi', 'player')]) !== null);
  check('pd-pyrrhic-same-day-still-matches', PDA.matchPyrrhicKill(unc, [logEntry(80, 'strike', 4, 'grace_obi', 'player')]) !== null);
  check('pd-pyrrhic-day-plus-two-no-match', PDA.matchPyrrhicKill(unc, [logEntry(82, 'strike', 4, 'grace_obi', 'player')]) === null);
  check('pd-pyrrhic-adjacent-day-wrong-beast-no-match', PDA.matchPyrrhicKill(unc, [logEntry(81, 'eater', 4, 'grace_obi', 'player')]) === null);
  check('pd-pyrrhic-adjacent-day-wrong-killer-no-match', PDA.matchPyrrhicKill(unc, [logEntry(81, 'strike', 4, 'someone_else', 'player')]) === null);
})();

// ---------- 4. Corpus re-classification: the preregged GO (a)–(d) ----------
(function () {
  const pdFiles = fs.readdirSync(PD_CORPUS).filter(function (f) { return f.endsWith('.json'); });
  const fiFiles = fs.readdirSync(FI_CORPUS).filter(function (f) { return f.endsWith('.json'); });
  check('corpus-sixteen-files-each', pdFiles.length === 16 && fiFiles.length === 16, 'pd=' + pdFiles.length + ' fi=' + fiFiles.length);
  const rc = RC.reclassifyBoth(PD_CORPUS, FI_CORPUS);
  const pd = rc.partydamage, fi = rc.fightinterior;
  check('go-a-armed-1-to-2', rc.go.a_armed_1_to_2 === true, JSON.stringify(pd.byLeg.partydamage));
  check('go-a-baseline-3-stays', rc.go.a_baseline_3_stays === true, JSON.stringify(pd.byLeg.baseline));
  check('go-b-fightinterior-9-eq-9', rc.go.b_fightinterior_9_eq_9 === true, JSON.stringify(fi.byLeg));
  check('go-c-no-false', rc.go.c_no_false === true,
    'pd-unreconciled=' + pd.unreconciledLogKills.length + ' fi-unreconciled=' + fi.unreconciledLogKills.length);
  check('go-d-unclassified-0', rc.go.d_unclassified_0 === true, 'pd=' + pd.unclassified + ' fi=' + fi.unclassified);
  check('go-d-ambiguous-0', rc.go.d_ambiguous_0 === true, 'pd=' + pd.ambiguousMatches + ' fi=' + fi.ambiguousMatches);
  check('go-ALL', rc.go.ALL === true, JSON.stringify(rc.go));
  check('corpora-zero-instrument-errors', pd.instrumentErrors === 0 && fi.instrumentErrors === 0,
    'pd=' + pd.instrumentErrors + ' fi=' + fi.instrumentErrors);
  // (a) The ONE recovered kill is the Nadia kill, and exactly one.
  check('recovered-exactly-one-pd', pd.recovered.length === 1, 'recovered=' + pd.recovered.length);
  const nadia = pd.recovered[0];
  check('recovered-is-nadia-d117-d118', !!nadia && nadia.seed === 87004 && nadia.day === 117 &&
    nadia.mid === 'influencer' && nadia.endingBefore === 'rout' && nadia.endingAfter === 'kill',
    JSON.stringify(nadia));
  check('recovered-match-day-plus-one', !!nadia && nadia.matchedEntry && nadia.matchedEntry.day === 118 &&
    nadia.matchedEntry.mid === 'influencer' && nadia.matchedEntry.by === 'nadia_khoury', JSON.stringify(nadia && nadia.matchedEntry));
  check('recovered-single-candidate', !!nadia && nadia.matchCandidates === 1, 'cands=' + (nadia && nadia.matchCandidates));
  // (c) The killing blow is IN the trace: the trace's own hit log
  // shows the beast's HP going to <= 0 on the scholar's round-9 strike.
  const row = JSON.parse(fs.readFileSync(path.join(PD_CORPUS, 'partydamage-s87004-partydamage-armed.json'), 'utf8'));
  const tr = (row.traces || []).find(function (t) { return t.seq === 1 && t.day === 117; });
  const killingHits = (tr.hits || []).filter(function (h) { return h.tgtKind === 'monster' && (h.hpAfter | 0) <= 0; });
  check('nadia-killing-blow-in-trace', killingHits.length >= 1 && killingHits[0].actor === 'p' && killingHits[0].r === 9,
    JSON.stringify(killingHits));
  check('nadia-trace-mhp-left-zero', tr.mHpLeft === 0 && tr.outcome === 'won', 'mHpLeft=' + tr.mHpLeft + ' outcome=' + tr.outcome);
  // (b) On fightinterior the ±1 join adds NOTHING: every match the new
  // classifier makes is same-day (all deltas 0) — the 9 is the pyrrhic
  // same-day result reproduced, not a midnight recovery.
  let deltas = {};
  fiFiles.forEach(function (fn) {
    const r = JSON.parse(fs.readFileSync(path.join(FI_CORPUS, fn), 'utf8'));
    (r.traces || []).filter(function (t) { return (t.wave | 0) >= 4; }).forEach(function (t) {
      let cands = [];
      if (t.outcome === 'won') cands = INST.matchWonKills(t, r.killsLive || []);
      else if (t.outcome === 'lost') cands = INST.matchLogKills(t, r.waveKillLog || [], r.killsLive || [], true);
      else if (t.outcome === 'unfinished') cands = INST.matchLogKills(t, r.waveKillLog || [], r.killsLive || [], false);
      cands.forEach(function (c) { const d = c.day - t.day; deltas[d] = (deltas[d] || 0) + 1; });
    });
  });
  check('fi-all-match-deltas-zero', Object.keys(deltas).length === 1 && deltas['0'] === 9, JSON.stringify(deltas));
  // Fightinterior "recovered" rows are the two KNOWN pyrrhic kills
  // (same-day re-derivation), not midnight recoveries.
  check('fi-recovered-are-known-pyrrhic', fi.recovered.length === 2 &&
    fi.recovered.every(function (r) { return r.matchedEntry && r.matchedEntry.day === r.day; }),
    JSON.stringify(fi.recovered.map(function (r) { return [r.seed, r.day, r.mid, r.endingAfter]; })));
  // The partydamage baseline 'rout' (87008 Audit, beast alive at 775)
  // stays 'rout' — the mid guard + no adjacent kill hold it.
  const baseRout = pd.perFile.reduce(function (m, r) {
    return m.concat(r.traces.filter(function (t) { return t.endingAfter === 'rout'; })
      .map(function (t) { return { seed: r.seed, policy: r.policy, seq: t.seq, day: t.day, mid: t.mid }; }));
  }, []);
  check('pd-baseline-rout-stays-rout', baseRout.length === 1 && baseRout[0].seed === 87008 && baseRout[0].day === 118 && baseRout[0].mid === 'audit',
    JSON.stringify(baseRout));
  // Analyzer caveat (pyrrhic-b pattern): the analyzer counts RECORDED
  // endings, so it still reads the old 1/24 on the old corpus — the
  // reclassifier is the GO path, and the instrument fix shows up in
  // the analyzer only on the NEXT corpus recorded with it.
  const legs = PDA.analyzeLeg(pdFiles.map(function (f) { return path.join(PD_CORPUS, f); }));
  check('analyzer-reads-recorded-endings', legs.partydamage.tbKillMatched === 1 && legs.baseline.tbKillMatched === 3,
    'armed=' + legs.partydamage.tbKillMatched + ' baseline=' + legs.baseline.tbKillMatched);
})();

// ---------- 5. Live legs (driver subprocesses, /tmp only) ----------
// Seed 55002 reaches wave-4 TB fights by day 72 on the finishprobe band
// — a 90d smoke proves the new instruments on a real fight without
// touching the judged bands. Unjudged: install + classification only.
(function () {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'midnightkill-live-'));
  const env = Object.assign({}, process.env, { REPO: REPO });
  function runDriver(script, extraEnv) {
    const e = Object.assign({}, env, extraEnv || {});
    return execFileSync('node', [path.join(REPO, 'scripts', script)], {
      cwd: REPO, env: e, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 600000,
    });
  }
  try {
    // fightinterior instrument leg.
    const fiOut = path.join(tmp, 'fi');
    runDriver('fightinterior-driver-20261106.js', { SEEDS: '55002', DAYS: '90', RUN: 'proof-baseline', OUTDIR: fiOut, POLICY: 'baseline' });
    const fiFile = path.join(fiOut, 'fightinterior-s55002-proof-baseline.json');
    check('live-fi-wrote', fs.existsSync(fiFile));
    const fiBase = JSON.parse(fs.readFileSync(fiFile, 'utf8'));
    const fiW4 = (fiBase.traces || []).filter(function (x) { return (x.wave | 0) >= 4; });
    check('live-fi-wave4-traces', fiW4.length >= 1, 'w4 traces=' + fiW4.length);
    check('live-fi-all-traces-classified', fiW4.filter(function (x) { return AN.ENDINGS.indexOf(x.ending) >= 0; }).length === fiW4.length,
      'classified=' + fiW4.filter(function (x) { return AN.ENDINGS.indexOf(x.ending) >= 0; }).length + '/' + fiW4.length);
    check('live-fi-zero-instrument-errors', (fiBase.instrumentErrors || []).length === 0, JSON.stringify((fiBase.instrumentErrors || []).slice(0, 3)));
    check('live-fi-no-internal-fields-leaked', fiW4.filter(function (x) { return ('_logLenAtOpen' in x) || ('_fight' in x); }).length === 0);

    // partydamage instrument leg.
    const pdOut = path.join(tmp, 'pd');
    runDriver('partydamage-driver-20261106.js', { SEEDS: '55002', DAYS: '90', RUN: 'proof-baseline', OUTDIR: pdOut, POLICY: 'baseline' });
    const pdFile = path.join(pdOut, 'partydamage-s55002-proof-baseline.json');
    check('live-pd-wrote', fs.existsSync(pdFile));
    const pdBase = JSON.parse(fs.readFileSync(pdFile, 'utf8'));
    const pdW4 = (pdBase.traces || []).filter(function (x) { return (x.wave | 0) >= 4; });
    check('live-pd-wave4-traces', pdW4.length >= 1, 'w4 traces=' + pdW4.length);
    check('live-pd-all-traces-classified', pdW4.filter(function (x) { return PDA.ENDINGS.indexOf(x.ending) >= 0; }).length === pdW4.length,
      'classified=' + pdW4.filter(function (x) { return PDA.ENDINGS.indexOf(x.ending) >= 0; }).length + '/' + pdW4.length);
    check('live-pd-zero-instrument-errors', (pdBase.instrumentErrors || []).length === 0, JSON.stringify((pdBase.instrumentErrors || []).slice(0, 3)));
    check('live-pd-no-internal-fields-leaked', pdW4.filter(function (x) { return ('_fight' in x); }).length === 0);
  } catch (e) {
    fail++;
    console.log('FAIL live-legs :: ' + (e && e.message ? String(e.message).slice(0, 400) : String(e)));
    if (e && e.stdout) console.log('--- driver stdout (tail) ---\n' + String(e.stdout).slice(-2000));
    if (e && e.stderr) console.log('--- driver stderr (tail) ---\n' + String(e.stderr).slice(-2000));
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  }
})();

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
