// test-ragerepress-20261106.js — proof for the rage re-press INSTRUMENT
// (arm sim-ragerepress-b, run fleshout-loop-b-20261106T1730Z).
// The rage re-press POLICY was killed (pilot NO-GO on the lever —
// refresh churn, no doubled strike delivered) and its file deleted, so
// this proof covers what remains: fixture tests for the analyzer's pure
// functions (including the midnight-pyrrhic ±1-day match) + live
// harness legs (driver subprocesses into /tmp, never into evidence/):
// a wave-4 TB fight on a real seed carries a per-turn trace with hits,
// verbs, and a finishing classification; the instrument is neutral
// (off-mode == on-mode on days/endReason/kill-log length); the same
// seed run twice is byte-identical. The policy unit fakes (hold-ground,
// cascade order, rage re-press, aim still capped) ran 57/57 on the
// build commit c22333838 before the policy was deleted — see the
// evidence file. Exit non-zero on any failure.
// Usage: node scripts/test-ragerepress-20261106.js
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'ragerepress-analyze-20261106'));

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}

function hit(r, actor, actorKind, tgtKind, dmg) {
  return { r: r, actor: actor, actorKind: actorKind, src: actor, srcLabel: 'test', tgt: tgtKind === 'monster' ? 'm_0' : 'p', tgtKind: tgtKind, req: dmg, dmg: dmg, hpAfter: 100, maxHp: 100 };
}
function trace(opts) {
  const o = opts || {};
  return Object.assign({
    seq: 1, tbSeq: 1, day: 80, mid: 'the_congregation', mids: ['the_congregation'], wave: 4,
    entryHp: 1000, entryMaxHp: 1000, entryFrac: 1, fighters: ['scholar', 'ally1'],
    alliesAtEntry: 1, partyAtEntry: 1, hits: [], turns: [], verbs: [],
    outcome: 'lost', ending: 'scholar-death', mHpLeft: 800, mHpLeftFrac: 0.8,
    rounds: 6, scholarHpEnd: 0, scholarHpFracEnd: 0,
    rallyRound: null, rallyOk: null, scholarStruckRallyRound: null,
  }, o);
}

// ---------- 1. tracePresent ----------
check('trace-present-turns', AN.tracePresent(trace({ turns: [{ r: 1, actor: 'm_0' }] })) === true);
check('trace-present-verbs', AN.tracePresent(trace({ verbs: [{ r: 1, verb: 'strike', ok: true }] })) === true);
check('trace-absent-empty', AN.tracePresent(trace({ turns: [], verbs: [] })) === false);
check('trace-absent-null', AN.tracePresent(null) === false);

// ---------- 2. damageByRound: sides split, unknown actor -> other ----------
(function () {
  const tr = trace({ hits: [
    hit(1, 'p', 'player', 'monster', 40),
    hit(1, 'm_0', 'monster', 'player', 25),
    hit(2, 'a1', 'ally', 'monster', 15),
    hit(2, 'm_0', 'monster', 'ally', 10),
    hit(2, null, null, 'monster', 5), // round-wrap / status-tick hit: other, never silently player-side
  ] });
  const by = AN.damageByRound(tr);
  check('dmg-round1-player', by[1].player === 40 && by[1].monster === 25, JSON.stringify(by[1]));
  check('dmg-round2-ally-counts-player-side', by[2].player === 15 && by[2].monster === 10, JSON.stringify(by[2]));
  check('dmg-round2-unknown-other', by[2].other === 5, JSON.stringify(by[2]));
})();

// ---------- 3. bestRoundComposition: scholar vs ally split + ability verbs ----------
(function () {
  // Best round is round 2: scholar 40 + ally 60 = 100, with a rage press.
  const tr = trace({ ending: 'scholar-death', entryHp: 1000, rounds: 3,
    verbs: [{ r: 2, verb: 'ability', ok: true, aid: 'rage', act: 'unleash_rage' },
      { r: 1, verb: 'strike', ok: true }, { r: 2, verb: 'strike', ok: true }],
    hits: [hit(1, 'p', 'player', 'monster', 30),
      hit(2, 'p', 'player', 'monster', 40), hit(2, 'a1', 'ally', 'monster', 60),
      hit(3, 'p', 'player', 'monster', 20)] });
  const c = AN.bestRoundComposition(tr);
  check('bestround-picks-max', c && c.round === 2 && c.total === 100, JSON.stringify(c));
  check('bestround-scholar-ally-split', c && c.scholar === 40 && c.ally === 60, JSON.stringify(c));
  check('bestround-ability-verbs', c && c.abilityVerbs.length === 1 && c.abilityVerbs[0] === 'rage:unleash_rage', JSON.stringify(c));
  check('bestround-share-of-entry', c && Math.abs(c.shareOfEntry - 0.1) < 1e-9, JSON.stringify(c));
  // One-off spike: best round is scholar-only, one strike.
  const spike = trace({ seq: 2, ending: 'scholar-death', entryHp: 1000, rounds: 2,
    verbs: [{ r: 1, verb: 'strike', ok: true }],
    hits: [hit(1, 'p', 'player', 'monster', 159), hit(2, 'p', 'player', 'monster', 10)] });
  const c2 = AN.bestRoundComposition(spike);
  check('bestround-spike-scholar-only', c2 && c2.round === 1 && c2.scholar === 159 && c2.ally === 0 && c2.strikes === 1, JSON.stringify(c2));
  check('bestround-empty-null', AN.bestRoundComposition(trace({ hits: [] })) === null);
})();

// ---------- 4. sizeNextLever: finishprobe-shaped generous bound ----------
(function () {
  const noFlip = trace({ ending: 'scholar-death', entryHp: 1000, rounds: 6,
    hits: [hit(1, 'p', 'player', 'monster', 50), hit(2, 'p', 'player', 'monster', 50),
      hit(3, 'p', 'player', 'monster', 50), hit(4, 'p', 'player', 'monster', 50),
      hit(5, 'p', 'player', 'monster', 50), hit(6, 'p', 'player', 'monster', 50)] });
  const flip = trace({ seq: 2, ending: 'scholar-death', entryHp: 1000, rounds: 6,
    hits: [hit(1, 'p', 'player', 'monster', 200), hit(2, 'p', 'player', 'monster', 200),
      hit(3, 'p', 'player', 'monster', 200), hit(4, 'p', 'player', 'monster', 200),
      hit(5, 'p', 'player', 'monster', 200), hit(6, 'p', 'player', 'monster', 200)] });
  const s = AN.sizeNextLever([noFlip, flip]);
  check('sizing-flips-one', s.flips === 1 && s.lostFights === 2, JSON.stringify(s));
  check('sizing-ceiling-rate', Math.abs(s.ceilingRate - 0.5) < 1e-9, JSON.stringify(s));
})();

// ---------- 5. analyzeLeg: classification + log-based kill rate + pyrrhic ----------
(function () {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ragerepress-fixture-'));
  function runFile(seed, policy, tbFights, traces, kills) {
    return {
      seed: seed, policy: policy, days: 100, endReason: 'village-lost', won: false,
      scaleRank: 'regional', unlockedWave: 4, standing: 150, readiness5: { veterans: 0 },
      waveKillLog: kills || [], daily: [], instrumentErrors: [], tbFights: tbFights, traces: traces,
      wavesFaced: { strike: 2, cancellation: 0 },
    };
  }
  const tbRow = { seq: 1, day: 80, mid: 'the_congregation', wave: 4, alliesAtEntry: 1, partyAtEntry: 1, outcome: 'lost', rounds: 6 };
  const tr = trace({ tbSeq: 1, turns: [{ r: 1, actor: 'm_0' }] });
  const f1 = path.join(dir, 'a.json');
  fs.writeFileSync(f1, JSON.stringify(runFile(1, 'baseline', [tbRow], [tr])));
  const tbRow2 = { seq: 2, day: 90, mid: 'the_strike', wave: 4, alliesAtEntry: 0, partyAtEntry: 0, outcome: 'won', rounds: 3 };
  const f2 = path.join(dir, 'b.json');
  fs.writeFileSync(f2, JSON.stringify(runFile(2, 'baseline', [tbRow, tbRow2], [tr])));
  const legs = AN.analyzeLeg([f1, f2]);
  const L = legs.baseline;
  check('analyze-tb-fight-count', L.tbFights === 3, 'tbFights=' + L.tbFights);
  check('analyze-unclassified-one', L.unclassified === 1, 'unclassified=' + L.unclassified);
  check('analyze-ending-counted', L.endings['scholar-death'] === 2, JSON.stringify(L.endings));
  check('analyze-trace-present', L.tracePresent === 2, 'tracePresent=' + L.tracePresent);
  check('analyze-w4faced-per-type-map', L.w4faced === 2, 'w4faced=' + L.w4faced);
  check('analyze-w5faced-per-type-map', L.w5faced === 0, 'w5faced=' + L.w5faced);
  check('analyze-kill-rate-zero-no-kills', L.tbKillRate === 0, 'tbKillRate=' + L.tbKillRate);
  // Pyrrhic: an 'unfinished' trace + a same-day wave-4 log kill by one of
  // the fight's fighters counts as a TB kill; a log kill by a stranger does not.
  const pyr = trace({ seq: 3, tbSeq: 3, day: 95, mid: 'the_eater', ending: 'unfinished',
    outcome: 'unfinished', turns: [{ r: 1, actor: 'm_0' }],
    hits: [hit(1, 'p', 'player', 'monster', 800)] });
  const tbRow3 = { seq: 3, day: 95, mid: 'the_eater', wave: 4, alliesAtEntry: 0, partyAtEntry: 0, outcome: 'unfinished', rounds: 9 };
  const f3 = path.join(dir, 'c.json');
  fs.writeFileSync(f3, JSON.stringify(runFile(3, 'ragerepress', [tbRow3], [pyr],
    [{ day: 95, w: 4, by: 'scholar', mid: 'the_eater' }, { day: 95, w: 4, by: 'a_stranger', mid: 'the_eater' }])));
  const legs2 = AN.analyzeLeg([f3]);
  const L2 = legs2.ragerepress;
  check('analyze-pyrrhic-matched', L2.tbKillMatched === 1 && L2.pyrrhicKills === 1,
    'matched=' + L2.tbKillMatched + ' pyrrhic=' + L2.pyrrhicKills);
  check('analyze-pyrrhic-kill-rate', L2.tbKillRate === 1, 'tbKillRate=' + L2.tbKillRate);
  check('analyze-log-kills-counted', L2.logW4Kills === 2, 'logW4Kills=' + L2.logW4Kills);
  // Midnight-spanning pyrrhic: an 'unfinished' trace on day 95 whose
  // wave-4 log kill is dated day 96 (waveKillLog 'd' key) still matches
  // — the sim-ragerepress-b midnight correction (fight day OR day+1).
  const pyrMid = trace({ seq: 4, tbSeq: 4, day: 95, mid: 'the_eater', ending: 'unfinished',
    outcome: 'unfinished', turns: [{ r: 1, actor: 'm_0' }],
    hits: [hit(1, 'p', 'player', 'monster', 800)] });
  const tbRow4 = { seq: 4, day: 95, mid: 'the_eater', wave: 4, alliesAtEntry: 0, partyAtEntry: 0, outcome: 'unfinished', rounds: 9 };
  const f4 = path.join(dir, 'd.json');
  fs.writeFileSync(f4, JSON.stringify(runFile(4, 'ragerepress', [tbRow4], [pyrMid],
    [{ d: 96, w: 4, by: 'scholar', mid: 'the_eater' }])));
  const legs3 = AN.analyzeLeg([f4]);
  const L3 = legs3.ragerepress;
  check('analyze-pyrrhic-midnight-matched', L3.tbKillMatched === 1 && L3.pyrrhicKills === 1,
    'matched=' + L3.tbKillMatched + ' pyrrhic=' + L3.pyrrhicKills);
  // A day+2 kill must NOT match: the window is fight day OR day+1 only.
  const f5 = path.join(dir, 'e.json');
  fs.writeFileSync(f5, JSON.stringify(runFile(5, 'ragerepress', [tbRow4], [pyrMid],
    [{ d: 97, w: 4, by: 'scholar', mid: 'the_eater' }])));
  const legs4 = AN.analyzeLeg([f5]);
  const L4 = legs4.ragerepress;
  check('analyze-pyrrhic-dayplus2-no-match', L4.tbKillMatched === 0 && L4.pyrrhicKills === 0,
    'matched=' + L4.tbKillMatched + ' pyrrhic=' + L4.pyrrhicKills);
  fs.rmSync(dir, { recursive: true, force: true });
})();

// ---------- 6. Policy unit fakes: REMOVED with the killed policy ----
// The rage re-press policy (scripts/policies/competent-ragerepress-b.js)
// was deleted when the pilot NO-GO'd on the lever (refresh churn). Its
// unit fakes (hold-ground, cascade order, rage re-press on consecutive
// turns, patient_aim still capped, no waveKillLog read) ran green as
// part of the 57/57 proof on build commit c22333838, before deletion.
// They are not re-runnable against a deleted file and are not faked here.

// ---------- 7. Live legs (driver subprocesses, /tmp only) ----------
// Seed 55002 reaches wave-4 TB fights by day 72 on the finishprobe band
// (day-72 Congregation, 18 rounds) — a 90d smoke proves the recorder and
// the policy on a real fight without touching the judged band.
(function () {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ragerepress-live-'));
  const env = Object.assign({}, process.env, { REPO: REPO });
  function runDriver(extraEnv) {
    return execFileSync('node', [path.join(REPO, 'scripts', 'ragerepress-driver-20261106.js')], {
      cwd: REPO, env: Object.assign({}, env, extraEnv || {}),
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 600000,
    });
  }
  try {
    runDriver({ SEEDS: '55002', DAYS: '90', RUN: 'proof-baseline', OUTDIR: path.join(tmp, 'baseline'), POLICY: 'baseline' });
    const baseFile = path.join(tmp, 'baseline', 'ragerepress-s55002-proof-baseline.json');
    check('live-baseline-wrote', fs.existsSync(baseFile));
    const base = JSON.parse(fs.readFileSync(baseFile, 'utf8'));
    const w4 = (base.traces || []).filter(function (x) { return (x.wave | 0) >= 4; });
    check('live-baseline-wave4-traces', w4.length >= 1, 'w4 traces=' + w4.length);
    check('live-baseline-traces-have-hits', w4.filter(function (x) { return (x.hits || []).length > 0; }).length >= 1);
    check('live-baseline-traces-have-turns', w4.filter(function (x) { return (x.turns || []).length > 0; }).length >= 1);
    check('live-baseline-all-traces-classified', w4.filter(function (x) { return AN.ENDINGS.indexOf(x.ending) >= 0; }).length === w4.length);
    check('live-baseline-zero-instrument-errors', (base.instrumentErrors || []).length === 0, JSON.stringify((base.instrumentErrors || []).slice(0, 3)));

    // Determinism: same seed, same policy, second run must be byte-identical.
    runDriver({ SEEDS: '55002', DAYS: '90', RUN: 'proof-baseline', OUTDIR: path.join(tmp, 'baseline2'), POLICY: 'baseline' });
    const base2File = path.join(tmp, 'baseline2', 'ragerepress-s55002-proof-baseline.json');
    const b1 = fs.readFileSync(baseFile, 'utf8');
    const b2 = fs.readFileSync(base2File, 'utf8');
    check('live-determinism-identical', b1 === b2, 'lengths ' + b1.length + ' vs ' + b2.length);

    // Neutrality: instrument OFF must match ON on days/endReason/kill-log length.
    runDriver({ SEEDS: '55002', DAYS: '90', RUN: 'proof-baseline', OUTDIR: path.join(tmp, 'off'), POLICY: 'baseline', RAGEREPRESS_OFF: '1' });
    const off = JSON.parse(fs.readFileSync(path.join(tmp, 'off', 'ragerepress-s55002-proof-baseline.json'), 'utf8'));
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
