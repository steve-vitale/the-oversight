// test-pyrrhic-20261106.js — proof for the pyrrhic-kill instrumentation
// fix (arm sim-pyrrhic-b, run fleshout-loop-b-20261106T1630Z, findings
// #1811/#1822). Fixture tests for the shared classifier + analyzer
// changes, the corpus re-classification asserted against the preregged
// GO, and live harness legs (driver subprocesses into /tmp, never into
// evidence/): the new instrument installs cleanly, records traces with
// 0 instrument errors, is deterministic byte-identical on repeat, and
// is neutral off-vs-on. Exit non-zero on any failure.
// Usage: node scripts/test-pyrrhic-20261106.js
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'fightinterior-analyze-20261106'));
const INST = require(path.join(REPO, 'scripts', 'fightinterior-instrument-20261106'));
const RC = require(path.join(REPO, 'scripts', 'pyrrhic-reclassify-20261106'));
const CORPUS = path.join(REPO, 'evidence', '2026-11-06', 'perseed-fightinterior-b');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

function trace(opts) {
  const o = opts || {};
  return Object.assign({
    seq: 1, tbSeq: 1, day: 65, mid: 'reunion', mids: ['reunion'], wave: 4,
    entryHp: 3380, entryMaxHp: 3380, entryFrac: 1, fighters: ['greta_hansen', 'scholar'],
    alliesAtEntry: 2, partyAtEntry: 1, hits: [], turns: [], verbs: [],
    outcome: 'lost', ending: 'scholar-death', mHpLeft: 2654, mHpLeftFrac: 0.785,
    rounds: 5, scholarHpEnd: 0, scholarHpFracEnd: 0,
    rallyRound: null, rallyOk: null, scholarStruckRallyRound: null,
  }, o);
}
// Log entries use {d, w}; killsLive entries use {day, wave}.
function logEntry(d, mid, w, by, via) { return { d: d, mid: mid, w: w, by: by, via: via, trick: null }; }
function liveEntry(day, mid, wave, by, via) { return { day: day, mid: mid, wave: wave, by: by, via: via }; }

// ---------- 1. classifyEnding: the pyrrhic branch ----------
(function () {
  const gretaLog = [logEntry(65, 'reunion', 4, 'greta_hansen', 'companion')];
  const tr = trace({ outcome: 'lost', fighters: ['ingrid_vik', 'greta_hansen', 'gen_i5idqk7'] });
  const c = INST.classifyEnding(tr, gretaLog, [], 'tbEnd', false);
  check('pyrrhic-basic', c.ending === 'pyrrhic-kill', JSON.stringify(c));
  check('pyrrhic-no-unfinishedKind', c.unfinishedKind == null, JSON.stringify(c));

  const c2 = INST.classifyEnding(trace({ outcome: 'lost' }), [], [], 'tbEnd', false);
  check('lost-no-entry-stays-scholar-death', c2.ending === 'scholar-death', JSON.stringify(c2));

  // Grind false positive: the kill is in BOTH the log and killsLive
  // (recordWaveKill wrote both) — a lost fight the same day must NOT
  // read it as pyrrhic, even with the killer in its fighters.
  const grindLog = [logEntry(80, 'strike', 4, 'scholar', 'player')];
  const grindLive = [liveEntry(80, 'strike', 4, 'scholar', 'player')];
  const c3 = INST.classifyEnding(trace({ day: 80, mid: 'strike', mids: ['strike'], outcome: 'lost', fighters: ['scholar'] }), grindLog, grindLive, 'tbEnd', false);
  check('pyrrhic-grind-live-excluded', c3.ending === 'scholar-death', JSON.stringify(c3));

  // Wrong killer / wrong day / low wave: no match, stays scholar-death.
  // (sim-midnightkill-b: "wrong day" is now day+2 — a kill logged the
  // NEXT day DOES match under the ±1-day join, so the old day+1 case
  // moved to the midnightkill proof as a positive fixture.)
  const c4 = INST.classifyEnding(trace({ outcome: 'lost' }), [logEntry(65, 'reunion', 4, 'someone_else', 'companion')], [], 'tbEnd', false);
  check('pyrrhic-wrong-killer-no-match', c4.ending === 'scholar-death', JSON.stringify(c4));
  const c5 = INST.classifyEnding(trace({ outcome: 'lost' }), [logEntry(67, 'reunion', 4, 'greta_hansen', 'companion')], [], 'tbEnd', false);
  check('pyrrhic-wrong-day-no-match', c5.ending === 'scholar-death', JSON.stringify(c5));
  const c6 = INST.classifyEnding(trace({ outcome: 'lost' }), [logEntry(65, 'reunion', 3, 'greta_hansen', 'companion')], [], 'tbEnd', false);
  check('pyrrhic-low-wave-no-match', c6.ending === 'scholar-death', JSON.stringify(c6));

  // matchLogKills counts candidates: two log entries for the same
  // day+mid+killer (different via) are both candidates.
  const two = INST.matchLogKills(trace({ outcome: 'lost' }),
    [logEntry(65, 'reunion', 4, 'greta_hansen', 'companion'), logEntry(65, 'reunion', 4, 'greta_hansen', 'player')], [], true);
  check('pyrrhic-two-candidates-counted', two.length === 2, 'n=' + two.length);
  check('pyrrhic-first-match-returned', INST.matchLogKill(trace({ outcome: 'lost' }),
    [logEntry(65, 'reunion', 4, 'greta_hansen', 'companion')], [], true) !== null);
})();

// ---------- 2. classifyEnding: the unclosed branch + unfinished split ----------
(function () {
  const graceLog = [logEntry(80, 'strike', 4, 'grace_obi', 'player')];
  const graceLive = [liveEntry(80, 'strike', 4, 'grace_obi', 'player')];
  const graceTr = trace({ day: 80, mid: 'strike', mids: ['strike'], outcome: 'unfinished', mHpLeft: 0, mHpLeftFrac: 0, fighters: ['grace_obi'] });
  const c = INST.classifyEnding(graceTr, graceLog, graceLive, 'stale', false);
  check('unclosed-basic', c.ending === 'kill-unclosed', JSON.stringify(c));

  // Beast alive at close: the log match must NOT promote the trace —
  // a same-day kill from a later fight stays out.
  const c2 = INST.classifyEnding(trace({ day: 80, mid: 'strike', mids: ['strike'], outcome: 'unfinished', mHpLeft: 500, mHpLeftFrac: 0.467, fighters: ['grace_obi'] }), graceLog, graceLive, 'stale', false);
  check('unclosed-beast-alive-guard', c2.ending === 'unfinished' && c2.unfinishedKind === 'dissolved', JSON.stringify(c2));

  // No match: the split follows the close path, not a guess.
  const bare = trace({ day: 80, mid: 'strike', mids: ['strike'], outcome: 'unfinished', mHpLeft: 400, fighters: ['grace_obi'] });
  const c3 = INST.classifyEnding(bare, [], [], 'finalize', true);
  check('unfinished-finalize-village-died', c3.ending === 'unfinished' && c3.unfinishedKind === 'village-died', JSON.stringify(c3));
  const c4 = INST.classifyEnding(bare, [], [], 'finalize', false);
  check('unfinished-finalize-horizon', c4.ending === 'unfinished' && c4.unfinishedKind === 'horizon', JSON.stringify(c4));
  const c5 = INST.classifyEnding(bare, [], [], 'stale', false);
  check('unfinished-stale-dissolved', c5.ending === 'unfinished' && c5.unfinishedKind === 'dissolved', JSON.stringify(c5));
  const c6 = INST.classifyEnding(bare, [], [], 'unknown', false);
  check('unfinished-unknown-stays-unknown', c6.ending === 'unfinished' && c6.unfinishedKind === 'unknown', JSON.stringify(c6));
})();

// ---------- 3. classifyEnding: regressions (won / fled / routed / unknown) ----------
(function () {
  const wonTr = trace({ day: 66, mid: 'reunion', outcome: 'won', mHpLeft: 0, fighters: ['gen_g5z4p7p', 'gen_i5idqk7'] });
  const c1 = INST.classifyEnding(wonTr, [logEntry(66, 'reunion', 4, 'gen_g5z4p7p', 'player')], [liveEntry(66, 'reunion', 4, 'gen_g5z4p7p', 'player')], 'tbEnd', false);
  check('won-live-match-kill', c1.ending === 'kill', JSON.stringify(c1));
  const c2 = INST.classifyEnding(wonTr, [], [], 'tbEnd', false);
  check('won-no-match-rout', c2.ending === 'rout', JSON.stringify(c2));
  const c3 = INST.classifyEnding(trace({ outcome: 'fled' }), [], [], 'tbEnd', false);
  check('fled-scholar-flee', c3.ending === 'scholar-flee', JSON.stringify(c3));
  // The landed 'routed' normalization (304ced6cf) holds — fixture for
  // the 51006 d105 Strike standoff shape.
  const c4 = INST.classifyEnding(trace({ outcome: 'routed' }), [], [], 'tbEnd', false);
  check('routed-normalizes-to-rout', c4.ending === 'rout', JSON.stringify(c4));
  // Unknown tbEnd results pass through unchanged (fail-visible: the
  // analyzer counts them unclassified rather than inventing a class).
  const c5 = INST.classifyEnding(trace({ outcome: 'calmed' }), [], [], 'tbEnd', false);
  check('unknown-outcome-passthrough', c5.ending === 'calmed', JSON.stringify(c5));
  // normKill accepts both shapes.
  check('normKill-log-shape', JSON.stringify(INST.normKill({ d: 65, mid: 'reunion', w: 4, by: 'x', via: 'player' })) === JSON.stringify({ day: 65, mid: 'reunion', wave: 4, by: 'x', via: 'player' }));
  check('normKill-live-shape', JSON.stringify(INST.normKill({ day: 65, mid: 'reunion', wave: 4, by: 'x', via: 'player' })) === JSON.stringify({ day: 65, mid: 'reunion', wave: 4, by: 'x', via: 'player' }));
})();

// ---------- 4. Analyzer: new endings, kill counting, unfinished tally ----------
(function () {
  check('analyzer-endings-include-pyrrhic', AN.ENDINGS.indexOf('pyrrhic-kill') >= 0 && AN.ENDINGS.indexOf('kill-unclosed') >= 0, JSON.stringify(AN.ENDINGS));
  check('analyzer-kill-endings-three', AN.KILL_ENDINGS.length === 3 && AN.KILL_ENDINGS.indexOf('kill') >= 0, JSON.stringify(AN.KILL_ENDINGS));
  // sizeNextLever: pyrrhic + unclosed kills count as kills (the beast
  // is dead — no flip needed), never as lost fights to flip.
  function hit(r, actor, actorKind, tgtKind, dmg) {
    return { r: r, actor: actor, actorKind: actorKind, src: actor, srcLabel: 'test', tgt: tgtKind === 'monster' ? 'm_0' : 'p', tgtKind: tgtKind, req: dmg, dmg: dmg, hpAfter: 100, maxHp: 100 };
  }
  const lostTr = trace({ seq: 1, ending: 'scholar-death', entryHp: 1000, rounds: 6,
    hits: [hit(1, 'p', 'player', 'monster', 50), hit(2, 'p', 'player', 'monster', 50)] });
  const pyrTr = trace({ seq: 2, ending: 'pyrrhic-kill', entryHp: 1000, rounds: 5, hits: [] });
  const uncTr = trace({ seq: 3, ending: 'kill-unclosed', entryHp: 1000, rounds: 21, hits: [] });
  const s = AN.sizeNextLever([lostTr, pyrTr, uncTr]);
  check('sizing-counts-new-kill-endings', s.kills === 2 && s.lostFights === 1, JSON.stringify(s));
  check('sizing-ceiling-with-new-kills', Math.abs(s.ceilingRate - (2 / 3)) < 1e-9, JSON.stringify(s));
  // analyzeLeg on a synthetic corpus: fight-level kills + split tally.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pyrrhic-fixture-'));
  function runFile(seed, policy, tbFights, traces) {
    return {
      seed: seed, policy: policy, days: 100, endReason: 'village-lost', won: false,
      scaleRank: 'regional', unlockedWave: 4, standing: 150, readiness5: { veterans: 0 },
      waveKillLog: [], daily: [], instrumentErrors: [], tbFights: tbFights, traces: traces,
      wavesFaced: { strike: 2, cancellation: 0 },
    };
  }
  const tbRow = function (seq, day, mid, outcome) {
    return { seq: seq, day: day, mid: mid, wave: 4, alliesAtEntry: 1, partyAtEntry: 1, outcome: outcome, rounds: 6 };
  };
  const trs = [
    trace({ seq: 1, tbSeq: 1, ending: 'pyrrhic-kill', turns: [{ r: 1, actor: 'm_0' }] }),
    trace({ seq: 2, tbSeq: 2, ending: 'kill-unclosed', turns: [{ r: 1, actor: 'm_0' }] }),
    trace({ seq: 3, tbSeq: 3, ending: 'unfinished', unfinishedKind: 'village-died', turns: [{ r: 1, actor: 'm_0' }] }),
    trace({ seq: 4, tbSeq: 4, ending: 'unfinished', unfinishedKind: 'dissolved', turns: [{ r: 1, actor: 'm_0' }] }),
  ];
  const rows = [tbRow(1, 65, 'reunion', 'lost'), tbRow(2, 80, 'strike', 'unfinished'), tbRow(3, 90, 'eater', 'unfinished'), tbRow(4, 95, 'eater', 'unfinished')];
  const f1 = path.join(dir, 'a.json');
  fs.writeFileSync(f1, JSON.stringify(runFile(1, 'baseline', rows, trs)));
  const legs = AN.analyzeLeg([f1]);
  const L = legs.baseline;
  check('analyze-fight-level-kills-two', L.fightLevelKills === 2, 'fightLevelKills=' + L.fightLevelKills);
  check('analyze-unfinished-kinds-split', L.unfinishedKinds['village-died'] === 1 && L.unfinishedKinds.dissolved === 1, JSON.stringify(L.unfinishedKinds));
  check('analyze-new-endings-classified', L.unclassified === 0, 'unclassified=' + L.unclassified);
  check('analyze-endings-count-new', L.endings['pyrrhic-kill'] === 1 && L.endings['kill-unclosed'] === 1, JSON.stringify(L.endings));
  fs.rmSync(dir, { recursive: true, force: true });
})();

// ---------- 5. Corpus re-classification: the preregged GO ----------
(function () {
  // Before-anchor: the OLD analyzer on the OLD corpus counts only
  // 'kill' endings — 7. The fix must move it to 9 without re-running.
  const files = fs.readdirSync(CORPUS).filter(function (f) { return f.endsWith('.json'); })
    .map(function (f) { return path.join(CORPUS, f); }).sort();
  check('corpus-sixteen-files', files.length === 16, 'files=' + files.length);
  const legs = AN.analyzeLeg(files);
  const before = (legs.baseline.fightLevelKills | 0) + (legs.staged.fightLevelKills | 0);
  check('corpus-before-seven', before === 7, 'before=' + before);
  const rc = RC.reclassifyDir(CORPUS);
  check('go-G1-baseline-3', rc.byLeg.baseline.fightKillsAfter === 3 && rc.byLeg.baseline.logW4 === 3, JSON.stringify(rc.byLeg.baseline));
  check('go-G1-staged-6', rc.byLeg.staged.fightKillsAfter === 6 && rc.byLeg.staged.logW4 === 6, JSON.stringify(rc.byLeg.staged));
  check('go-G1-total-9', rc.totalFightKillsAfter === 9 && rc.totalLogW4 === 9, 'after=' + rc.totalFightKillsAfter + ' log=' + rc.totalLogW4);
  const greta = rc.namedKills.filter(function (n) { return n.seed === 51005 && (n.fighters || []).indexOf('greta_hansen') >= 0; })[0];
  check('go-G2-greta-pyrrhic-kill', !!greta && greta.endingAfter === 'pyrrhic-kill', JSON.stringify(greta));
  const grace = rc.namedKills.filter(function (n) { return n.seed === 51002; })[0];
  check('go-G2-grace-kill-unclosed', !!grace && grace.endingAfter === 'kill-unclosed', JSON.stringify(grace));
  check('go-G3-no-ambiguous', rc.ambiguousMatches === 0, 'ambiguous=' + rc.ambiguousMatches);
  check('go-G3-no-unclassified', rc.unclassified === 0, 'unclassified=' + rc.unclassified);
  check('go-ALL', rc.go.ALL === true, JSON.stringify(rc.go));
  check('corpus-zero-instrument-errors', rc.instrumentErrors === 0, 'errors=' + rc.instrumentErrors);
  // The other day-65 Reunion trace (same day+mid, killer not in its
  // fighters) must NOT become pyrrhic — the killer-in-fighters guard.
  const other = rc.namedKills.filter(function (n) { return n.seed === 51005 && (n.fighters || []).indexOf('greta_hansen') < 0; })[0];
  check('go-other-d65-stays-scholar-death', !!other && other.endingAfter === 'scholar-death', JSON.stringify(other));
})();

// ---------- 6. Live legs (driver subprocesses, /tmp only) ----------
// Seed 55002 reaches wave-4 TB fights by day 72 on the finishprobe band
// — a 90d smoke proves the new instrument on a real fight without
// touching the judged band. Unjudged: install + determinism +
// neutrality only; a live leg is not expected to produce a pyrrhic
// kill on demand (2 in 59 fights on the judged band).
(function () {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pyrrhic-live-'));
  const env = Object.assign({}, process.env, { REPO: REPO });
  function runDriver(extraEnv) {
    const e = Object.assign({}, env, extraEnv || {});
    return execFileSync('node', [path.join(REPO, 'scripts', 'fightinterior-driver-20261106.js')], {
      cwd: REPO, env: e, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 600000,
    });
  }
  const outBase = path.join(tmp, 'baseline');
  const outBase2 = path.join(tmp, 'baseline2');
  const outOff = path.join(tmp, 'off');
  try {
    runDriver({ SEEDS: '55002', DAYS: '90', RUN: 'proof-baseline', OUTDIR: outBase, POLICY: 'baseline' });
    const baseFile = path.join(outBase, 'fightinterior-s55002-proof-baseline.json');
    check('live-baseline-wrote', fs.existsSync(baseFile));
    const base = JSON.parse(fs.readFileSync(baseFile, 'utf8'));
    const w4 = (base.traces || []).filter(function (x) { return (x.wave | 0) >= 4; });
    check('live-baseline-wave4-traces', w4.length >= 1, 'w4 traces=' + w4.length);
    const classified = w4.filter(function (x) { return AN.ENDINGS.indexOf(x.ending) >= 0; });
    check('live-baseline-all-traces-classified', classified.length === w4.length, 'classified=' + classified.length + '/' + w4.length);
    check('live-baseline-zero-instrument-errors', (base.instrumentErrors || []).length === 0, JSON.stringify((base.instrumentErrors || []).slice(0, 3)));
    // Internal timing fields must not leak into the serialized corpus.
    const leaked = w4.filter(function (x) { return ('_logLenAtOpen' in x) || ('_fight' in x); });
    check('live-no-internal-fields-leaked', leaked.length === 0, 'leaked=' + leaked.length);
    // A live 'unfinished' trace always carries a real close-path kind —
    // 'unknown' is offline-only and must never appear live.
    const badKind = w4.filter(function (x) { return x.ending === 'unfinished' && ['village-died', 'dissolved', 'horizon'].indexOf(x.unfinishedKind) < 0; });
    check('live-unfinished-kinds-real', badKind.length === 0, 'bad=' + JSON.stringify(badKind.slice(0, 2)));

    // Determinism: same seed, same policy, second run byte-identical.
    runDriver({ SEEDS: '55002', DAYS: '90', RUN: 'proof-baseline', OUTDIR: outBase2, POLICY: 'baseline' });
    const base2File = path.join(outBase2, 'fightinterior-s55002-proof-baseline.json');
    const b1 = fs.readFileSync(baseFile, 'utf8');
    const b2 = fs.readFileSync(base2File, 'utf8');
    check('live-determinism-identical', b1 === b2, 'lengths ' + b1.length + ' vs ' + b2.length);

    // Neutrality: instrument OFF must match ON on days/endReason/kill-log length.
    runDriver({ SEEDS: '55002', DAYS: '90', RUN: 'proof-baseline', OUTDIR: outOff, POLICY: 'baseline', FIGHTINTERIOR_OFF: '1' });
    const offFile = path.join(outOff, 'fightinterior-s55002-proof-baseline.json');
    const off = JSON.parse(fs.readFileSync(offFile, 'utf8'));
    check('live-neutrality-days', off.days === base.days, 'off=' + off.days + ' on=' + base.days);
    check('live-neutrality-end', off.endReason === base.endReason, 'off=' + off.endReason + ' on=' + base.endReason);
    check('live-neutrality-kills', (off.waveKillLog || []).length === (base.waveKillLog || []).length,
      'off=' + (off.waveKillLog || []).length + ' on=' + (base.waveKillLog || []).length);
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
