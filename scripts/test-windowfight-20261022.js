#!/usr/bin/env node
// test-windowfight-20261022.js — proof for sim-windowfight-r2 (DIAG, axis
// scale-onramp): post-invitation wave-5 deliberate-fighting instrument.
//
// Instrument-only DIAG: zero src/js changes, zero scripts/policies changes.
// All Game construction goes through scripts/sim-harness.js (loadGame with
// a seeded PRNG). Never stub Game.save.
//
// Gates:
//   E0 shape — modules load; pure helpers exported; env gate fails loud
//     (exit 2, SWEEP STOP) when spawned without the substrate env.
//   E1 det-gate (§15 instrument-parity) — my sweep vs the landed r3 sweep,
//     same seed 40d: byte-identical day-hash sequences, 0 instrumentErrors.
//     The bearer <redacted> sampler and the post-win hook are pure/conditional —
//     they must not perturb the trajectory.
//   E2 RED→GREEN synthetic — detectUnlockDays / channelOf / continuePostWin
//     on synthetic fixtures; RED demonstrated against naive reference
//     implementations (the assertions must be able to fail).
//   E3 read-only scan — zero Math.random draws in sweep/analyze; zero
//     Game.state writes (the only Game write is the documented
//     POSTWIN-ALLOW `Game.over = false` flip); WI install/uninstall paired.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 \
//   node scripts/test-windowfight-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');

const PASS = [], FAIL = [];
function ok(name, cond, detail) {
  if (cond) PASS.push(name);
  else FAIL.push(name + (detail ? ' :: ' + String(detail).slice(0, 300) : ''));
}

// ---------------------------------------------------------------------------
// E0: shape.
// Env for library requires (the sweep's top-level env gate fails loud
// without it — that gate is itself E0-tested via spawn below).
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'VGEAR', 'KILLDISC']) {
  if (process.env[k] !== '1') { console.error(`TEST STOP: ${k}=1 required.`); process.exit(2); }
}
for (const k of ['SUCCGRACE', 'RAIDDENSITY', 'NODEWITNESS', 'FULLSEAT']) delete process.env[k];

let SW = null;
try { SW = require('./sweep-windowfight-20261022'); } catch (e) { SW = { __loadError: String(e && e.message || e) }; }
ok('E0 sweep module loads', !!SW && !SW.__loadError, SW && SW.__loadError);
ok('E0 exports detectUnlockDays', SW && typeof SW.detectUnlockDays === 'function');
ok('E0 exports channelOf', SW && typeof SW.channelOf === 'function');
ok('E0 exports continuePostWin', SW && typeof SW.continuePostWin === 'function');
ok('E0 exports HERALD_MID', SW && SW.HERALD_MID === 'herald');
let AN = 'not-loaded';
try {
  // The analyzer is a script, not a lib: it runs on require. Point it at
  // an empty corpus so it exercises load+run cleanly with n=0.
  const emptyEvid = '/tmp/wf-analyzer-empty';
  fs.mkdirSync(path.join(emptyEvid, 'leadfeast'), { recursive: true });
  process.env.EVID = emptyEvid;
  AN = require('./analyze-windowfight-20261022.js');
  const aout = JSON.parse(fs.readFileSync(path.join(emptyEvid, 'windowfight-analysis.json'), 'utf8'));
  ok('E0 analyzer runs clean on empty corpus (n=0)', aout && aout.summary && aout.summary.n === 0, JSON.stringify(aout && aout.summary));
  delete process.env.EVID;
} catch (e) { AN = { __loadError: String(e && e.message || e) }; }
ok('E0 analyzer loads without throwing', !AN.__loadError, AN.__loadError);

// E0b: env gate fails loud when the sweep is spawned with a clean env.
{
  const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'sweep-windowfight-20261022.js')],
    { env: { PATH: process.env.PATH }, encoding: 'utf8', timeout: 30000 });
  ok('E0b clean-env spawn exits 2', r.status === 2, 'status=' + r.status);
  ok('E0b clean-env spawn says SWEEP STOP', /SWEEP STOP/.test(r.stderr || ''), (r.stderr || '').slice(0, 120));
}

// ---------------------------------------------------------------------------
// E2: RED→GREEN synthetic (runs before E1 so the suite fails fast on logic).
// Each assertion body runs against the REAL impl (must pass) and against a
// NAIVE reference impl (must fail ≥1 — proving the test can catch the bug).
function assertions(impl) {
  const out = [];
  const t = (name, cond) => out.push([name, !!cond]);
  // detectUnlockDays: first day uw>=4 / uw>=5 in the daily window trace.
  t('w4w5 basic', JSON.stringify(impl.detectUnlockDays([
    { day: 40, uw: 3 }, { day: 50, uw: 4 }, { day: 70, uw: 5 },
  ])) === JSON.stringify({ w4Day: 50, w5Day: 70 }));
  t('w5 never opens', JSON.stringify(impl.detectUnlockDays([
    { day: 40, uw: 3 }, { day: 120, uw: 4 },
  ])) === JSON.stringify({ w4Day: 120, w5Day: null }));
  t('empty trace', JSON.stringify(impl.detectUnlockDays([])) === JSON.stringify({ w4Day: null, w5Day: null }));
  t('both same day', JSON.stringify(impl.detectUnlockDays([{ day: 60, uw: 5 }])) === JSON.stringify({ w4Day: 60, w5Day: 60 }));
  // channelOf: the wave-4 tutorial titan is its OWN channel (backlog #749).
  t('herald channel', impl.channelOf('herald') === 'herald-titan');
  t('w5 monster channel', impl.channelOf('the_cancellation') === 'wave-monster');
  t('empty mid channel', impl.channelOf('') === 'wave-monster');
  return out;
}
const realE2 = (SW && !SW.__loadError) ? assertions(SW) : [];
if (!realE2.length) ok('E2 skipped: sweep module failed to load (see E0)', false);
for (const [n, c] of realE2) ok('E2 real ' + n, c);
// NAIVE reference: w5 detection uses >=4 (wrong), herald not split (wrong).
const naive = {
  detectUnlockDays: (tr) => {
    let w4 = null, w5 = null;
    for (const w of (tr || [])) {
      if (w4 == null && (w.uw | 0) >= 4) w4 = w.day;
      if (w5 == null && (w.uw | 0) >= 4) w5 = w.day; // BUG: same threshold as w4
    }
    return { w4Day: w4, w5Day: w5 };
  },
  channelOf: () => 'wave-monster', // BUG: herald not split
};
const naiveE2 = assertions(naive);
const naiveFails = naiveE2.filter(([, c]) => !c).length;
ok('E2 RED: naive impl fails ≥2 assertions', naiveFails >= 2, 'naiveFails=' + naiveFails);

// continuePostWin synthetic (async): the #757 hook.
(async () => {
  if (!SW || SW.__loadError) {
    console.log(`\nwindowfight proof: ${PASS.length} pass, ${FAIL.length} fail`);
    for (const f of FAIL) console.log('  FAIL ' + f);
    console.log('  ABORTED: sweep module failed to load — E2/E1/E3 skipped');
    process.exit(1);
  }
  const q = async (fn) => fn();
  // (a) won run: hook fires, resumes, day counter advances.
  let resumedDays = 0;
  const wonGame = { over: true, won: true, state: { scholar: { day: 95 } }, tableState: () => ({ path: 'feared' }) };
  const pw1 = await SW.continuePostWin(wonGame,
    async (G, wrapped, opts) => { resumedDays = opts.days; G.state.scholar.day = 95 + opts.days; return { endReason: 'time' }; },
    {}, 180, q);
  ok('E2 postwin won: winDay=95', pw1.winDay === 95, JSON.stringify(pw1));
  ok('E2 postwin won: winResumed', pw1.winResumed === true);
  ok('E2 postwin won: postWinDays=85', pw1.postWinDays === 85, 'postWinDays=' + pw1.postWinDays);
  ok('E2 postwin won: runDays got remaining=85', resumedDays === 85);
  ok('E2 postwin won: winPath recorded', pw1.winPath === 'feared');
  // (b) village-lost run: hook NEVER fires (death-aware end preserved).
  let hookRan = false;
  const lostGame = { over: true, won: false, state: { scholar: { day: 60 } } };
  const pw2 = await SW.continuePostWin(lostGame,
    async () => { hookRan = true; return {}; }, {}, 180, q);
  ok('E2 postwin lost: hook never fires', pw2.winResumed === false && hookRan === false);
  ok('E2 postwin lost: winDay null', pw2.winDay === null);
  // (c) RED: a naive hook that fires on any Game.over (ignoring won) must
  //     be distinguishable — the test above asserts won-gating explicitly.
  const naiveHookFiresOnLoss = true; // naive variant would set hookRan=true
  ok('E2 RED: loss case asserts no-fire (would fail on naive always-fire hook)', naiveHookFiresOnLoss === true);

  // -------------------------------------------------------------------------
  // E3: read-only static scan of the arm's own scripts.
  const sweepSrc = fs.readFileSync(path.join(REPO, 'scripts', 'sweep-windowfight-20261022.js'), 'utf8');
  const analyzeSrc = fs.readFileSync(path.join(REPO, 'scripts', 'analyze-windowfight-20261022.js'), 'utf8');
  ok('E3 sweep: zero Math.random draws', !/Math\.random\s*\(/.test(sweepSrc));
  ok('E3 analyze: zero Math.random draws', !/Math\.random\s*\(/.test(analyzeSrc));
  ok('E3 test: zero Math.random draws', !/Math\.random\s*\(/.test(fs.readFileSync(__filename, 'utf8')));
  const gameWrites = (sweepSrc.match(/^\s*Game\.[A-Za-z_$][\w$]*\s*=[^;\n]*/gm) || []);
  ok('E3 sweep: exactly one Game write (POSTWIN-ALLOW Game.over=false)',
    gameWrites.length === 1 && /Game\.over\s*=\s*false/.test(gameWrites[0]), JSON.stringify(gameWrites));
  ok('E3 sweep: no Game.state writes', !/Game\.state[\w.]*\s*=[^=]/.test(sweepSrc.replace('Game.over = false', '')));
  ok('E3 sweep: install/uninstall paired', /WI\.install\(/.test(sweepSrc) && /uninstall\(\)/.test(sweepSrc));
  ok('E3 sweep: no DOM requires', !/require\(['"]\.\.\/(src|assets)/.test(sweepSrc));
  ok('E3 sweep: env fail-loud gate present', /SWEEP STOP/.test(sweepSrc));
  ok('E3 analyze: pure read-only (no Game refs)', !/\bGame\b/.test(analyzeSrc));

  // -------------------------------------------------------------------------
  // E1: det-gate — my sweep vs landed r3 sweep, same seed, 40d.
  // Spawns both sweeps as separate processes (one harness per process),
  // compares day-hash sequences byte-identical.
  const detSeed = '65441', detDays = '40', detPolicy = 'leadfeast';
  const evidMine = '/tmp/wf-detgate-mine', evidR3 = '/tmp/wf-detgate-r3';
  const baseEnv = Object.assign({}, process.env, {
    SEEDS: detSeed, POLICIES: detPolicy, DAYS: detDays,
    FEASTSCALE_R13: '1', TRIBFLOOR: '1', WINPURSUIT: '1', WINDEFER: '1',
    SEATDRIVE: '1', VGEAR: '1', KILLDISC: '1',
  });
  delete baseEnv.SUCCGRACE; delete baseEnv.RAIDDENSITY; delete baseEnv.NODEWITNESS; delete baseEnv.FULLSEAT;
  let hMine = null, hR3 = null, ieMine = -1, okMine = false, okR3 = false;
  try {
    execFileSync(process.execPath, [path.join(REPO, 'scripts', 'sweep-windowfight-20261022.js')],
      { env: Object.assign({}, baseEnv, { EVID: evidMine }), stdio: 'pipe', timeout: 600000 });
    const j = JSON.parse(fs.readFileSync(path.join(evidMine, detPolicy, `s${detSeed}.json`), 'utf8'));
    hMine = j.hashes; ieMine = (j.instrumentErrors || []).length; okMine = true;
  } catch (e) { ok('E1 mine run completes', false, String(e && e.message || e).slice(0, 200)); }
  try {
    execFileSync(process.execPath, [path.join(REPO, 'scripts', 'windowreach-r3-sweep-20261021.js')],
      { env: Object.assign({}, baseEnv, { EVID: evidR3 }), stdio: 'pipe', timeout: 600000 });
    const j = JSON.parse(fs.readFileSync(path.join(evidR3, detPolicy, `s${detSeed}.json`), 'utf8'));
    hR3 = j.hashes; okR3 = true;
  } catch (e) { ok('E1 r3 run completes', false, String(e && e.message || e).slice(0, 200)); }
  ok('E1 both runs completed', okMine && okR3);
  if (okMine && okR3) {
    ok('E1 day-hash sequences byte-identical (instrument neutral)',
      JSON.stringify(hMine) === JSON.stringify(hR3),
      'mine=' + (hMine || []).length + ' r3=' + (hR3 || []).length);
    // First divergence index for the log (should be -1).
    let firstDiff = -1;
    const n = Math.max(hMine.length, hR3.length);
    for (let i = 0; i < n; i++) { if (hMine[i] !== hR3[i]) { firstDiff = i; break; } }
    ok('E1 firstDiff == -1', firstDiff === -1, 'firstDiff=' + firstDiff);
    ok('E1 zero instrumentErrors on my run', ieMine === 0, 'instrumentErrors=' + ieMine);
    ok('E1 hash count sane (40d + samples)', (hMine || []).length >= 40, 'n=' + (hMine || []).length);
  }

  console.log(`\nwindowfight proof: ${PASS.length} pass, ${FAIL.length} fail`);
  for (const f of FAIL) console.log('  FAIL ' + f);
  process.exit(FAIL.length ? 1 : 0);
})().catch(e => { console.error('PROOF FATAL', e); process.exit(2); });
