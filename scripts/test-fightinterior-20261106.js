// test-fightinterior-20261106.js — proof for the fight-interior recorder
// (arm sim-fightinterior-b, run fleshout-loop-b-20261106T1430Z).
// Fixture tests for the analyzer's pure functions + live harness legs
// (driver subprocesses into /tmp, never into evidence/): a wave-4 TB
// fight on a real seed carries a per-turn trace with hits, verbs, and a
// finishing classification; the instrument is neutral (off-mode ==
// on-mode on days/endReason/kill-log length); the same seed run twice
// is byte-identical. Exit non-zero on any failure.
// Usage: node scripts/test-fightinterior-20261106.js
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync, execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const AN = require(path.join(REPO, 'scripts', 'fightinterior-analyze-20261106'));

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

// ---------- 3. rallyCostRows: scholar strike in the rally round ----------
(function () {
  const rallyTr = trace({ ending: 'scholar-death', rallyRound: 1, rallyOk: true,
    scholarStruckRallyRound: false,
    verbs: [{ r: 1, verb: 'rally', ok: true }, { r: 2, verb: 'strike', ok: true }],
    hits: [hit(1, 'm_0', 'monster', 'player', 30), hit(2, 'p', 'player', 'monster', 35)] });
  const rows = AN.rallyCostRows([rallyTr]);
  check('rally-row-flagged', rows[0].rally === true && rows[0].rallyRound === 1);
  check('rally-round-no-scholar-strike', rows[0].scholarStrikesR1 === 0, JSON.stringify(rows[0]));
  check('rally-round-player-dmg-zero', rows[0].r1PlayerDmg === 0, JSON.stringify(rows[0]));
  const struckTr = trace({ ending: 'kill', rallyRound: 1, rallyOk: true,
    scholarStruckRallyRound: true,
    verbs: [{ r: 1, verb: 'rally', ok: true }, { r: 1, verb: 'strike', ok: true }],
    hits: [hit(1, 'p', 'player', 'monster', 40)] });
  const rows2 = AN.rallyCostRows([struckTr]);
  check('rally-round-scholar-struck', rows2[0].scholarStrikesR1 === 1 && rows2[0].r1PlayerDmg === 40, JSON.stringify(rows2[0]));
})();

// ---------- 4. sizeNextLever: finishprobe-shaped generous bound ----------
(function () {
  // Lost fight: best round 50 player dmg, survived 6 rounds, entry 1000.
  // Bound = 50*6 + 125 = 425 < 1000: no flip (the finishprobe arithmetic).
  const noFlip = trace({ ending: 'scholar-death', entryHp: 1000, rounds: 6,
    hits: [hit(1, 'p', 'player', 'monster', 50), hit(2, 'p', 'player', 'monster', 50),
      hit(3, 'p', 'player', 'monster', 50), hit(4, 'p', 'player', 'monster', 50),
      hit(5, 'p', 'player', 'monster', 50), hit(6, 'p', 'player', 'monster', 50)] });
  // Lost fight: best round 200, survived 6 rounds, entry 1000.
  // Bound = 200*6 + 500 = 1700 >= 1000: flips.
  const flip = trace({ seq: 2, ending: 'scholar-death', entryHp: 1000, rounds: 6,
    hits: [hit(1, 'p', 'player', 'monster', 200), hit(2, 'p', 'player', 'monster', 200),
      hit(3, 'p', 'player', 'monster', 200), hit(4, 'p', 'player', 'monster', 200),
      hit(5, 'p', 'player', 'monster', 200), hit(6, 'p', 'player', 'monster', 200)] });
  const s = AN.sizeNextLever([noFlip, flip]);
  check('sizing-flips-one', s.flips === 1 && s.lostFights === 2, JSON.stringify(s));
  check('sizing-ceiling-rate', Math.abs(s.ceilingRate - 0.5) < 1e-9, JSON.stringify(s));
})();

// ---------- 5. analyzeLeg on a synthetic corpus: classification completeness ----------
(function () {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fightinterior-fixture-'));
  function runFile(seed, policy, tbFights, traces, kills) {
    return {
      seed: seed, policy: policy, days: 100, endReason: 'village-lost', won: false,
      scaleRank: 'regional', unlockedWave: 4, standing: 150, readiness5: { veterans: 0 },
      waveKillLog: kills || [], daily: [], instrumentErrors: [], tbFights: tbFights, traces: traces,
    };
  }
  const tbRow = { seq: 1, day: 80, mid: 'the_congregation', wave: 4, alliesAtEntry: 1, partyAtEntry: 1, outcome: 'lost', rounds: 6 };
  const tr = trace({ tbSeq: 1, turns: [{ r: 1, actor: 'm_0' }] });
  const f1 = path.join(dir, 'a.json');
  fs.writeFileSync(f1, JSON.stringify(runFile(1, 'baseline', [tbRow], [tr])));
  // A second row with NO trace at all: unclassified, must be counted, not hidden.
  const tbRow2 = { seq: 2, day: 90, mid: 'the_strike', wave: 4, alliesAtEntry: 0, partyAtEntry: 0, outcome: 'won', rounds: 3 };
  const f2 = path.join(dir, 'b.json');
  fs.writeFileSync(f2, JSON.stringify(runFile(2, 'baseline', [tbRow, tbRow2], [tr])));
  const legs = AN.analyzeLeg([f1, f2]);
  const L = legs.baseline;
  check('analyze-tb-fight-count', L.tbFights === 3, 'tbFights=' + L.tbFights);
  check('analyze-unclassified-one', L.unclassified === 1, 'unclassified=' + L.unclassified);
  check('analyze-ending-counted', L.endings['scholar-death'] === 2, JSON.stringify(L.endings));
  check('analyze-trace-present', L.tracePresent === 2, 'tracePresent=' + L.tracePresent);
  fs.rmSync(dir, { recursive: true, force: true });
})();

// ---------- 6. Live legs (driver subprocesses, /tmp only) ----------
// Seed 55002 reaches wave-4 TB fights by day 72 on the finishprobe band
// (day-72 Congregation, 18 rounds) — a 90d smoke proves the recorder on
// a real fight without touching the judged band.
(function () {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fightinterior-live-'));
  const env = Object.assign({}, process.env, { REPO: REPO });
  function runDriver(args, extraEnv) {
    const e = Object.assign({}, env, extraEnv || {});
    return execFileSync('node', [path.join(REPO, 'scripts', 'fightinterior-driver-20261106.js')], {
      cwd: REPO, env: e, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 600000,
    });
  }
  const outBase = path.join(tmp, 'baseline');
  const outBase2 = path.join(tmp, 'baseline2');
  const outStaged = path.join(tmp, 'staged');
  const outOff = path.join(tmp, 'off');
  let baseFile = null, base2File = null, stagedFile = null, offFile = null;
  try {
    runDriver([], { SEEDS: '55002', DAYS: '90', RUN: 'proof-baseline', OUTDIR: outBase, POLICY: 'baseline' });
    baseFile = path.join(outBase, 'fightinterior-s55002-proof-baseline.json');
    check('live-baseline-wrote', fs.existsSync(baseFile));
    const base = JSON.parse(fs.readFileSync(baseFile, 'utf8'));
    const w4 = (base.traces || []).filter(function (x) { return (x.wave | 0) >= 4; });
    check('live-baseline-wave4-traces', w4.length >= 1, 'w4 traces=' + w4.length);
    const withHits = w4.filter(function (x) { return (x.hits || []).length > 0; });
    check('live-baseline-traces-have-hits', withHits.length >= 1, 'withHits=' + withHits.length);
    const withTurns = w4.filter(function (x) { return (x.turns || []).length > 0; });
    check('live-baseline-traces-have-turns', withTurns.length >= 1, 'withTurns=' + withTurns.length);
    const classified = w4.filter(function (x) { return AN.ENDINGS.indexOf(x.ending) >= 0; });
    check('live-baseline-all-traces-classified', classified.length === w4.length, 'classified=' + classified.length + '/' + w4.length);
    check('live-baseline-zero-instrument-errors', (base.instrumentErrors || []).length === 0, JSON.stringify((base.instrumentErrors || []).slice(0, 3)));

    // Determinism: same seed, same policy, second run must be byte-identical.
    runDriver([], { SEEDS: '55002', DAYS: '90', RUN: 'proof-baseline', OUTDIR: outBase2, POLICY: 'baseline' });
    base2File = path.join(outBase2, 'fightinterior-s55002-proof-baseline.json');
    const b1 = fs.readFileSync(baseFile, 'utf8');
    const b2 = fs.readFileSync(base2File, 'utf8');
    check('live-determinism-identical', b1 === b2, 'lengths ' + b1.length + ' vs ' + b2.length);

    // Neutrality: instrument OFF must match ON on days/endReason/kill-log length.
    runDriver([], { SEEDS: '55002', DAYS: '90', RUN: 'proof-baseline', OUTDIR: outOff, POLICY: 'baseline', FIGHTINTERIOR_OFF: '1' });
    offFile = path.join(outOff, 'fightinterior-s55002-proof-baseline.json');
    const off = JSON.parse(fs.readFileSync(offFile, 'utf8'));
    check('live-neutrality-days', off.days === base.days, 'off=' + off.days + ' on=' + base.days);
    check('live-neutrality-end', off.endReason === base.endReason, 'off=' + off.endReason + ' on=' + base.endReason);
    check('live-neutrality-kills', (off.waveKillLog || []).length === (base.waveKillLog || []).length,
      'off=' + (off.waveKillLog || []).length + ' on=' + (base.waveKillLog || []).length);

    // Staged smoke: the armed leg must record rallies and traces.
    runDriver([], { SEEDS: '55002', DAYS: '90', RUN: 'proof-staged', OUTDIR: outStaged, POLICY: 'staged' });
    stagedFile = path.join(outStaged, 'fightinterior-s55002-proof-staged.json');
    const staged = JSON.parse(fs.readFileSync(stagedFile, 'utf8'));
    const w4s = (staged.traces || []).filter(function (x) { return (x.wave | 0) >= 4; });
    check('live-staged-wave4-traces', w4s.length >= 1, 'w4 traces=' + w4s.length);
    const rallyFires = staged.bankkillerStats ? staged.bankkillerStats.rallyFires : 0;
    check('live-staged-rally-fires', rallyFires >= 1, 'rallyFires=' + rallyFires);
    const rallyVerbs = w4s.reduce(function (n, x) { return n + (x.verbs || []).filter(function (v) { return v.verb === 'rally' && v.ok; }).length; }, 0);
    check('live-staged-rally-verbs-traced', rallyVerbs >= 1, 'rallyVerbs=' + rallyVerbs);
    check('live-staged-zero-instrument-errors', (staged.instrumentErrors || []).length === 0, JSON.stringify((staged.instrumentErrors || []).slice(0, 3)));
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
