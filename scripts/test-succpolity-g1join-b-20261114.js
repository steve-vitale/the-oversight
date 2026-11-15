// test-succpolity-g1join-b-20261114.js — proof test for the INSTRUMENT arm
// sim-succpolity-g1join-b (run fleshout-loop-b-20261115T0310Z). The 0155Z
// round proved the succpolity analyzer's G1 join a false positive:
// the policy answers succgrace beats at the start of daily, before the
// driver's post-daily snapshot, so a staged+answered beat NEVER appears
// as prSg=1 in the series and the old prSg-only join mislabels every
// genuine succgrace answer as young (youngAnswers=6 on leg (b)).
// This test proves the CORRECTED join (stage/answer accounting from
// capSummary.succpolity + verbEvents, prSg secondary for lapsed beats
// only). Run: node scripts/test-succpolity-g1join-b-20261114.js
// RED->GREEN: on the old analyzer §2 pin 1 FAILS (same-day genuine
// answer flagged young) and §1 fix markers are absent. On the fixed
// analyzer all legs pass, and §3 re-judges the 0155Z pilot corpus.
// The old proof test scripts/test-succpolity-b-20261114.js is LEFT
// UNTOUCHED — its prSg-visible fixtures still pass under both joins;
// the semantic change is recorded in the g1join prereg, not silently
// edited into the old test.
'use strict';
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');

let pass = 0, fail = 0;
function t(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function deepEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
    return true;
  }
  const ka = Object.keys(a).sort(), kb = Object.keys(b).sort();
  if (ka.length !== kb.length) return false;
  for (let i = 0; i < ka.length; i++) {
    if (ka[i] !== kb[i]) return false;
    if (!deepEqual(a[ka[i]], b[ka[i]])) return false;
  }
  return true;
}

// ---------- §1 static ----------
const preregPath = path.join(REPO, 'evidence', '2026-11-14', 'sim-succpolity-g1join-b-prereg.md');
const preregText = (function () { try { return fs.readFileSync(preregPath, 'utf8'); } catch (e) { return ''; } })();
t('g1join prereg exists', preregText.length > 0);
t('g1join prereg names the false positive (youngAnswers=6)', preregText.indexOf('youngAnswers=6') !== -1);
t('g1join prereg states the non-re-scoring rule', preregText.indexOf('NON-RE-SCORING RULE') !== -1);
t('g1join prereg fixes GO bars (a)-(d)', preregText.indexOf('(a) CORPUS RE-JUDGMENT') !== -1 && preregText.indexOf('(d) G2/G3 UNAFFECTED') !== -1);
t('g1join prereg records the day-loop mechanism', preregText.indexOf('policy.daily at the END') !== -1 && preregText.indexOf('snapshots AFTER') !== -1);

const analyzerPath = path.join(REPO, 'scripts', 'analyze-succpolity-b.js');
const analyzerText = (function () { try { return fs.readFileSync(analyzerPath, 'utf8'); } catch (e) { return ''; } })();
t('analyzer exists', analyzerText.length > 0);
t('analyzer reads succgrace-answer policy events', analyzerText.indexOf("kind === 'succgrace-answer'") !== -1);
t('analyzer builds staged from pr transitions (lapsed-beat read)', analyzerText.indexOf('pr 0->1') !== -1 || analyzerText.indexOf('prStaged') !== -1);
t('analyzer keeps the prSg legacy fallback', analyzerText.indexOf("byDay[ev.day - 1]") !== -1);
t('analyzer reports a policy/analyzer cross-check', analyzerText.indexOf('crossCheck') !== -1);
t('analyzer still reads dissolutions from scaleRank transitions', analyzerText.indexOf("sc === 'regional'") !== -1);
t('analyzer still writes the 0155Z analysis file (CLI default)', analyzerText.indexOf('succpolity-b-analysis.json') !== -1);

// The old test is untouched: its old-join assertions are still there
// verbatim, and git shows no modification to the file.
const oldTestPath = path.join(REPO, 'scripts', 'test-succpolity-b-20261114.js');
const oldTestText = (function () { try { return fs.readFileSync(oldTestPath, 'utf8'); } catch (e) { return ''; } })();
t('old proof test still asserts the prSg-visible fixtures verbatim', oldTestText.indexOf('succgraceAccounting: 0 young answers') !== -1 && oldTestText.indexOf('succgraceAccounting: young-link answer flagged') !== -1);
(function () {
  let diff = '';
  try { diff = execSync('git diff --name-only HEAD -- scripts/test-succpolity-b-20261114.js', { cwd: REPO }).toString().trim(); } catch (e) { diff = 'GIT-ERROR'; }
  t('old proof test unmodified in this worktree', diff === '', diff ? diff.slice(0, 200) : '');
})();

// G3 (static leg): zero src/js changes on this branch vs master.
(function () {
  let names = '';
  try { names = execSync('git diff --name-only master...HEAD -- src/js', { cwd: REPO }).toString().trim(); } catch (e) { names = 'GIT-ERROR'; }
  t('G3 static: no src/js files differ from master', names === '', names ? names.slice(0, 200) : '');
})();

// ---------- §2 analyzer unit legs on synthetic records ----------
(function () {
  let mod = null;
  try { mod = require(path.join(REPO, 'scripts', 'analyze-succpolity-b')); } catch (e) { /* analyzer missing: RED */ }
  t('analyzer module loads', mod && typeof mod.succgraceAccounting === 'function' && typeof mod.analyze === 'function');
  if (!mod) return;
  // S(d, scale, pr, prSg): one snapshot row for link_x.
  const S = function (d, scale, pr, prSg) {
    return { d: d, scale: scale, dip: 0,
      linksRoll: [{ id: 'link_x', o: 'ov1', k: 'link', p: 'haven', sub: 'ov1', st: 'active', t: 45, f: 10, age: d - 10, cq: 0, ar: 0, tw: 0, pd: null, pr: pr ? 1 : 0, prSg: prSg ? 1 : 0, se: 1, rp: 1 }] };
  };
  const base = function (series, verbEvents, capSummary) {
    return { seed: 100203, policy: 'synthetic', run: 'synthetic', series: series,
      verbEvents: verbEvents || [], deaths: [], linkLines: [], dissolutionLines: [],
      capSummary: capSummary || {} };
  };
  const ansEv = { day: 89, verb: 'answerRenegotiation', caller: 'policy', linkId: 'link_x', other: 'ov1', before: 33, after: 41, dTrust: 8, result: 'gift' };

  // RED PIN 1 — same-day staged+answered succgrace beat: prSg=0 on
  // EVERY snapshot day (the beat never reaches a snapshot), but the
  // policy logged a succgrace-answer event for it. The OLD join flags
  // this young (youngAnswers=1); the corrected join counts it genuine.
  const series1 = [];
  for (let d = 80; d <= 100; d++) series1.push(S(d, 'national', 0, 0));
  const rec1 = base(series1, [ansEv],
    { succpolity: { succgraceAnswers: 1, succgraceBeatsSeen: 1, youngBeatsSeen: 0,
      events: [{ day: 89, kind: 'succgrace-answer', linkId: 'link_x', answer: 'gift', result: 'gift', paidKcal: 1500 }] } });
  const sg1 = mod.succgraceAccounting(rec1);
  t('RED PIN 1: same-day genuine answer NOT flagged young', sg1.youngAnswersCount === 0, JSON.stringify(sg1.youngAnswers));
  t('RED PIN 1: same-day genuine answer counts as answered', sg1.answeredCount === 1 && sg1.answeredStagedCount === 1 && sg1.answered[0].via === 'policy-event', 'answered=' + sg1.answeredCount + ' stagedAnswered=' + sg1.answeredStagedCount);
  t('RED PIN 1: policy-derived staged beat closes the accounting', sg1.stagedCount === 1 && sg1.accounted === 1 && sg1.staged[0].via === 'policy', JSON.stringify(sg1.staged));
  t('RED PIN 1: cross-check agrees (policy 1 answer / 1 beat seen)', sg1.crossCheck && sg1.crossCheck.answersMatch === true && sg1.crossCheck.beatsSeenMatch === true, JSON.stringify(sg1.crossCheck));

  // RED PIN 2 — genuinely-young-link answer is STILL flagged: the
  // answer has prSg=0 and NO policy event behind it. The fix must not
  // bless every answer.
  const series2 = [];
  for (let d = 80; d <= 100; d++) series2.push(S(d, 'national', 0, 0));
  const rec2 = base(series2, [ansEv], {});
  const sg2 = mod.succgraceAccounting(rec2);
  t('RED PIN 2: young-link answer still flagged', sg2.youngAnswersCount === 1, JSON.stringify(sg2.youngAnswers));
  t('RED PIN 2: no staged beat invented for a young answer', sg2.stagedCount === 0 && sg2.accounted === 0, 'staged=' + sg2.stagedCount);

  // GUARD — prSg-visible genuine beat (the old test's rec2 shape):
  // staged d88 (pr 0->1 AND prSg=1 — prSg implies pr: both derive
  // from the same pendingRenegotiation object), answered d89 gift,
  // stats but no events array. Both joins agree here; the legacy prSg
  // fallback must keep working for records without policy events.
  const series3 = [];
  for (let d = 80; d <= 100; d++) series3.push(S(d, 'national', (d === 88) ? 1 : 0, (d === 88) ? 1 : 0));
  const rec3 = base(series3, [ansEv],
    { succpolity: { succgraceAnswers: 1, succgraceBeatsSeen: 1, youngBeatsSeen: 0 } });
  const sg3 = mod.succgraceAccounting(rec3);
  t('GUARD: prSg-visible genuine beat still genuine (fallback)', sg3.youngAnswersCount === 0 && sg3.answeredCount === 1 && sg3.answered[0].via === 'prSg', JSON.stringify(sg3.answered));
  t('GUARD: prSg-visible beat staged from the series', sg3.stagedCount === 1 && sg3.staged[0].day === 88 && sg3.staged[0].via === 'pr', JSON.stringify(sg3.staged));

  // GUARD — lapsed young beat (pr read, the secondary channel):
  // pr 0->1 d88 (prSg=0 throughout), back to 0 by d95, no answers.
  // The policy saw it young 7 times (sightings, not distinct beats).
  const series4 = [];
  for (let d = 80; d <= 100; d++) series4.push(S(d, 'national', (d >= 88 && d <= 94) ? 1 : 0, 0));
  const rec4 = base(series4, [],
    { succpolity: { succgraceAnswers: 0, succgraceBeatsSeen: 0, youngBeatsSeen: 7,
      events: [89, 90, 91, 92, 93, 94, 95].map(function (d) { return { day: d, kind: 'young-beat-seen-not-answered', linkId: 'link_x', answer: null }; }) } });
  const sg4 = mod.succgraceAccounting(rec4);
  t('GUARD: unanswered young beat lapses (staged = lapsed)', sg4.stagedCount === 1 && sg4.lapsedCount === 1 && sg4.accounted === 1, JSON.stringify({ staged: sg4.stagedCount, lapsed: sg4.lapsedCount }));
  t('GUARD: young sightings (7) vs distinct young beats (1) reported, not conflated', sg4.crossCheck && sg4.crossCheck.policyYoungBeatsSeen === 7 && sg4.crossCheck.analyzerYoungStaged === 1, JSON.stringify(sg4.crossCheck));

  // GUARD — retry/dedup: a succgrace beat that lingered past a
  // snapshot (pr=1, prSg=1 d88) and was answered d89 (policy event +
  // verb event). One staged beat, not two — the pr-derived entry is
  // kept (its day is observed) and the policy-derived one dropped.
  const series5 = [];
  for (let d = 80; d <= 100; d++) series5.push(S(d, 'national', (d === 88) ? 1 : 0, (d === 88) ? 1 : 0));
  const rec5 = base(series5, [ansEv],
    { succpolity: { succgraceAnswers: 1, succgraceBeatsSeen: 1, youngBeatsSeen: 0,
      events: [{ day: 89, kind: 'succgrace-answer', linkId: 'link_x', answer: 'gift', result: 'gift', paidKcal: 1500 }] } });
  const sg5 = mod.succgraceAccounting(rec5);
  t('GUARD: lingering succgrace beat counted once (dedup)', sg5.stagedCount === 1 && sg5.answeredStagedCount === 1 && sg5.youngAnswersCount === 0 && sg5.staged[0].via === 'pr', JSON.stringify({ staged: sg5.stagedCount, ans: sg5.answeredStagedCount }));

  // GUARD — pending at end: young beat still pr=1 on the last snapshot.
  const series6 = [];
  for (let d = 80; d <= 100; d++) series6.push(S(d, 'national', (d >= 95) ? 1 : 0, 0));
  const rec6 = base(series6, [], { succpolity: { succgraceAnswers: 0, succgraceBeatsSeen: 0, youngBeatsSeen: 6, events: [] } });
  const sg6 = mod.succgraceAccounting(rec6);
  t('GUARD: beat still pending at end is pending, not lapsed', sg6.stagedCount === 1 && sg6.pendingAtEndCount === 1 && sg6.accounted === 1, JSON.stringify({ staged: sg6.stagedCount, pend: sg6.pendingAtEndCount }));
})();

// ---------- §3 corpus re-judgment (GO bars (a) + (d)) ----------
(function () {
  let mod = null;
  try { mod = require(path.join(REPO, 'scripts', 'analyze-succpolity-b')); } catch (e) { /* analyzer missing: RED */ }
  t('§3 analyzer module loads', mod && typeof mod.analyze === 'function');
  if (!mod) return;
  function loadDir(dir) {
    return fs.readdirSync(dir).filter(function (f) { return f.slice(-5) === '.json'; }).sort()
      .map(function (f) { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); });
  }
  let out = null, old = null;
  try {
    out = mod.analyze(
      loadDir(path.join(REPO, 'evidence', '2026-11-14', 'perseed-succpolity-b')),
      loadDir(path.join(REPO, 'evidence', '2026-11-14', 'perseed-answercourt-confirm-b')));
  } catch (e) { t('§3 re-judgment runs', false, String(e.message).slice(0, 200)); return; }
  t('§3 re-judgment runs (3 legs, 8 seeds each)', out && Object.keys(out.legs).length === 3 && out.legs['succpolity-b'].seeds.length === 8, out ? Object.keys(out.legs).join(',') : 'null');
  if (!out) return;
  try { old = JSON.parse(fs.readFileSync(path.join(REPO, 'evidence', '2026-11-14', 'succpolity-b-analysis.json'), 'utf8')); } catch (e) { old = null; }
  t('§3 committed 0155Z analysis JSON present for the (d) comparison', !!old);
  for (const leg of ['succpolity-a', 'succpolity-b', 'succpolity-c']) {
    const L = out.legs[leg];
    if (!L) { t('§3 leg ' + leg + ' present', false); continue; }
    // Bar (a): youngAnswers=0 on every leg, every beat accounted.
    t('§3 bar (a) ' + leg + ': youngAnswers=0', L.g1.youngAnswers === 0, 'youngAnswers=' + L.g1.youngAnswers);
    t('§3 bar (a) ' + leg + ': 0 unaccounted beats', L.g1.unaccountedBeats === 0, 'unaccounted=' + L.g1.unaccountedBeats);
    t('§3 bar (a) ' + leg + ': 0 instrument errors', L.g1.errors === 0, 'errors=' + L.g1.errors);
    // Bar (a) cross-check: policy/analyzer agreement on every seed
    // that carries succpolity stats.
    let xok = true, xdetail = '';
    for (const s of L.seeds) {
      const x = s.succgrace.crossCheck;
      if (!x) continue;
      if (!x.answersMatch || !x.beatsSeenMatch) { xok = false; xdetail += ' seed ' + s.seed + ' ' + JSON.stringify(x); }
    }
    t('§3 bar (a) ' + leg + ': policy/analyzer cross-check agrees on every seed', xok, xdetail.slice(0, 300));
    // Per-seed closure: staged = answered + lapsed + pending.
    let closed = true;
    for (const s of L.seeds) {
      const g = s.succgrace;
      if (g.accounted !== g.stagedCount) closed = false;
    }
    t('§3 bar (a) ' + leg + ': staged accounting closes on every seed', closed);
    // Bar (d): wall/pilot/verdict reproduce the 0155Z numbers exactly.
    if (old && old.legs[leg]) {
      const sameWPV = deepEqual({ wall: L.wall, pilot: L.pilot, verdict: L.verdict },
        { wall: old.legs[leg].wall, pilot: old.legs[leg].pilot, verdict: old.legs[leg].verdict });
      t('§3 bar (d) ' + leg + ': wall/pilot/verdict identical to 0155Z (G2 unaffected)', sameWPV);
      const strip = function (seeds) {
        return seeds.map(function (s) { const c = JSON.parse(JSON.stringify(s)); delete c.succgrace; return c; });
      };
      t('§3 bar (d) ' + leg + ': per-seed non-succgrace fields identical to 0155Z', deepEqual(strip(L.seeds), strip(old.legs[leg].seeds)));
    }
  }
  // Bar (a) leg (b) totals: the 6 genuine answers, all via policy events.
  const Lb = out.legs['succpolity-b'];
  if (Lb) {
    const totAns = Lb.seeds.reduce(function (t, s) { return t + s.succgrace.answeredCount; }, 0);
    const totStagedSg = Lb.seeds.reduce(function (t, s) { return t + s.succgrace.stagedSuccgraceCount; }, 0);
    const totYoung = Lb.seeds.reduce(function (t, s) { return t + s.succgrace.youngAnswersCount; }, 0);
    const totViaPolicy = Lb.seeds.reduce(function (t, s) { return t + s.succgrace.answered.filter(function (a) { return a.via === 'policy-event'; }).length; }, 0);
    t('§3 bar (a) leg (b): 6 genuine answers total', totAns === 6, 'answered=' + totAns);
    t('§3 bar (a) leg (b): 6 distinct succgrace beats staged', totStagedSg === 6, 'stagedSuccgrace=' + totStagedSg);
    t('§3 bar (a) leg (b): 0 young answers total', totYoung === 0, 'young=' + totYoung);
    t('§3 bar (a) leg (b): all 6 answers blessed via policy events', totViaPolicy === 6, 'viaPolicy=' + totViaPolicy);
  }
})();

console.log('test-succpolity-g1join-b: ' + pass + ' passed, ' + fail + ' failed');
if (fail) process.exit(1);
