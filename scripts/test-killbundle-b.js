// test-killbundle-b.js — arm sim-killbundle-b: KILLBUNDLE=1 judged on the
// kill-loot path (matched 49-seed armed leg + 16-seed staged leg).
//   node scripts/test-killbundle-b.js            (pre-run checks: frozen
//       bands, sizing arithmetic, staged-design arithmetic)
//   node scripts/test-killbundle-b.js --dir <armedCorpusDir>
//       corpus validation: 49 files, mode arm, KILLBUNDLE on,
//       STAGE_SEAR off, one shared anchor, policySha matches
//       scripts/policies/competent.js, 0 instrument errors.
//   node scripts/test-killbundle-b.js --dir-stage <stagedCorpusDir>
//       corpus validation: 16 files, mode arm, KILLBUNDLE on,
//       STAGE_SEAR on, one shared anchor, policySha match, 0 errors.
//   node scripts/test-killbundle-b.js --live   (live staged-forcing
//       proof on the harness: first kill-loot roll forced to
//       searcaster + 2 cells with KILLBUNDLE=1, roll restored, second
//       call unforced; bundle still env-gated when KILLBUNDLE unset)
// Reads only; never writes into the repo (live mode runs the harness
// in-memory only).
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const REPO = path.join(__dirname, '..');
const driver = require(path.join(REPO, 'scripts', 'killlootbundle-driver-a'));
const { tallyDir, poissonCdf } = require(path.join(REPO, 'scripts', 'test-killrate-analysis-a'));
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

// Frozen from the prereg (sim-killbundle-b).
const BAND_START = 107533;
const BAND_END = 107581;
const BAND_N = 49;
const STAGED_START = 107533;
const STAGED_END = 107548;
const STAGED_N = 16;
// Reserved ranges the matched band must not overlap (killarrive-b §4).
const RESERVED = [
  [107501, 107516, 'journey-endgame-r270 (107501-107508) / Loop A original'],
  [107517, 107532, 'Loop A sim-launchsilence-a (moved band)'],
  [107471, 107494, 'Loop B gateavoid-doorrich-b screen'],
  [107313, 107320, 'sim-killrate-a'],
  [107261, 107268, 'killlootbundle pilot'],
  [107281, 107296, 'killloot16'],
];
// Pooled measured rate (killrate-a §5 / killarrive-b §2): tier-4 8.81%
// of drops, 1/15 searcaster per tier-4 roll, 8.04 drops/seed.
const POOLED_T4_RATE = 17 / 193;
const POOLED_DROPS_PER_SEED = 8.04;
const P_DROP_SEAR = POOLED_T4_RATE / 15;
const P_SEED_ARRIVAL = 1 - Math.pow(1 - P_DROP_SEAR, POOLED_DROPS_PER_SEED);
const MU_49 = BAND_N * P_SEED_ARRIVAL; // expected natural arrivals, 49 seeds
// Ctl band observed (killarrive-b): 31/399 = 7.77%, Wilson 95% 5.5-10.8%.
const CTL_T4_WILSON_LO = 0.055;
const CTL_T4_WILSON_HI = 0.108;

function validateCorpus(dir, opts) {
  const files = fs.readdirSync(dir).sort().filter(function (f) {
    return /killlootbundle-a-s\d+-killlootbundle-a-arm\.json$/.test(f);
  });
  const policySha = crypto.createHash('sha256')
    .update(fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'competent.js'), 'utf8'))
    .digest('hex').slice(0, 12);
  const anchors = {};
  const seeds = [];
  let errors = 0, missingAnchor = 0, policyMismatches = 0;
  let wrongMode = 0, bundleOff = 0, stageWrong = 0;
  let klArrivals = 0, klBundled = 0, klVolleys = 0;
  files.forEach(function (f) {
    const c = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    seeds.push(c.seed);
    errors += (c.instrumentErrors || []).length;
    if (!c.anchorCommit) missingAnchor++;
    else anchors[c.anchorCommit] = (anchors[c.anchorCommit] || 0) + 1;
    if (c.policySha !== policySha) policyMismatches++;
    if (c.mode !== 'arm') wrongMode++;
    if (!c.killbundleOn) bundleOff++;
    if (!!c.stageSearOn !== !!opts.expectStage) stageWrong++;
    const kl = (c.killLootEvents || []).filter(function (e) { return e.dropId === 'searcaster'; });
    klArrivals += kl.length;
    klBundled += kl.filter(function (e) {
      return (e.gains || []).some(function (g) { return g.cellsGained === 2; });
    }).length;
    const holders = {};
    kl.forEach(function (e) {
      const g = (e.gains || []).filter(function (x) { return x.gunsGained > 0; })[0];
      holders[g ? g.holder : e.vid] = true;
    });
    klVolleys += (c.volleyEvents || []).filter(function (e) {
      return e.rwId === 'searcaster' && (e.shots || 0) > 0 && !!holders[e.vid];
    }).length;
  });
  const tally = tallyDir(dir);
  return {
    files: files.length, seeds: seeds, policySha: policySha,
    anchors: anchors, missingAnchor: missingAnchor,
    policyShaMismatches: policyMismatches, instrumentErrors: errors,
    wrongMode: wrongMode, bundleOff: bundleOff, stageWrong: stageWrong,
    klArrivals: klArrivals, klBundled: klBundled, klDry: klArrivals - klBundled,
    klVolleys: klVolleys,
    tally: { total: tally.total, t4: tally.t4, t4Rate: tally.t4Rate,
      sear: tally.sear, dropsPerSeed: tally.dropsPerSeed },
  };
}

function cellsOf(person) {
  let n = 0;
  for (const e of (person.items || [])) {
    const id = (typeof e === 'string') ? e : (e.itemId || e.id);
    if (id === 'fusion_cell') n += (typeof e === 'string') ? 1 : (e.units == null ? 1 : e.units);
  }
  return n;
}
function gunsOf(person) {
  let n = 0;
  for (const e of (person.items || [])) {
    const id = (typeof e === 'string') ? e : (e.itemId || e.id);
    if (id === 'searcaster') n += (typeof e === 'string') ? 1 : (e.units == null ? 1 : e.units);
  }
  return n;
}

async function liveTests() {
  let pass = 0, fail = 0;
  function check(name, cond) {
    if (cond) { pass++; console.log('ok   ' + name); }
    else { fail++; console.log('FAIL ' + name); }
  }
  const { Game } = await loadGame({ seed: 7, mode: 'killbundle-test', fullTelemetry: false });
  await setupGame(Game);
  const roster = ((Game.state.village || {}).roster || []);
  let vid = null, person = null;
  for (const r of roster) {
    if (!r || r === Game.villagerId) continue;
    const p = Game.getPerson ? Game.getPerson(r) : null;
    if (p && !p.dead) { vid = r; person = p; break; }
  }
  check('live: a living roster villager exists', !!vid && !!person);
  if (!vid) { console.log('TEST-KILLBUNDLE-B-LIVE: ' + pass + ' passed, ' + fail + ' failed'); return fail === 0; }
  const origRoll = Game.rollAlienLoot;
  try {
    // Staged forcer, KILLBUNDLE=1: first call forced to searcaster + 2 cells.
    process.env.KILLBUNDLE = '1';
    Game.rollAlienLoot = function () { return 'apex_bow'; }; // sentinel natural roll
    const sentinel = Game.rollAlienLoot;
    const staged = driver.stageFirstKillLoot(Game.villagerKillLoot);
    const gunsBefore = gunsOf(person), cellsBefore = cellsOf(person);
    const drop1 = staged.call(Game, vid, { wave: 4, id: 'test-beast' });
    check('live: staged first call returns searcaster (forced)', drop1 === 'searcaster');
    check('live: staged first call gains exactly 1 gun', gunsOf(person) - gunsBefore === 1);
    check('live: staged first call bundles exactly 2 cells', cellsOf(person) - cellsBefore === 2);
    check('live: rollAlienLoot restored after staged call', Game.rollAlienLoot === sentinel);
    // Second call: unforced — the sentinel natural roll comes through.
    const gunsBefore2 = gunsOf(person), cellsBefore2 = cellsOf(person);
    const drop2 = staged.call(Game, vid, { wave: 4, id: 'test-beast' });
    check('live: staged second call returns sentinel apex_bow (unforced)', drop2 === 'apex_bow');
    check('live: staged second call bundles 0 cells', cellsOf(person) - cellsBefore2 === 0);
    check('live: staged second call gains 0 guns', gunsOf(person) - gunsBefore2 === 0);
    // Fresh wrapper, KILLBUNDLE unset: staging forces the gun, bundle stays off.
    delete process.env.KILLBUNDLE;
    const staged2 = driver.stageFirstKillLoot(Game.villagerKillLoot);
    const gunsBefore3 = gunsOf(person), cellsBefore3 = cellsOf(person);
    const drop3 = staged2.call(Game, vid, { wave: 4, id: 'test-beast' });
    check('live: staged + bundle unset returns searcaster', drop3 === 'searcaster');
    check('live: staged + bundle unset gains exactly 1 gun', gunsOf(person) - gunsBefore3 === 1);
    check('live: staged + bundle unset bundles 0 cells', cellsOf(person) - cellsBefore3 === 0);
  } finally {
    Game.rollAlienLoot = origRoll;
    delete process.env.KILLBUNDLE;
  }
  console.log('TEST-KILLBUNDLE-B-LIVE: ' + pass + ' passed, ' + fail + ' failed');
  return fail === 0;
}

if (require.main === module) (async function () {
  const dirIdx = process.argv.indexOf('--dir');
  const stageIdx = process.argv.indexOf('--dir-stage');
  if (dirIdx !== -1) {
    const v = validateCorpus(process.argv[dirIdx + 1], { expectStage: false });
    console.log(JSON.stringify(v, null, 2));
    const ok = v.files === BAND_N && v.instrumentErrors === 0
      && v.missingAnchor === 0 && v.policyShaMismatches === 0
      && Object.keys(v.anchors).length === 1
      && v.wrongMode === 0 && v.bundleOff === 0 && v.stageWrong === 0
      && v.seeds.length === BAND_N
      && v.seeds.every(function (s, i) { return s === BAND_START + i; });
    console.log('TEST-KILLBUNDLE-B-CORPUS-ARM: ' + (ok ? 'PASS' : 'FAIL'));
    process.exit(ok ? 0 : 1);
  }
  if (stageIdx !== -1) {
    const v = validateCorpus(process.argv[stageIdx + 1], { expectStage: true });
    console.log(JSON.stringify(v, null, 2));
    const ok = v.files === STAGED_N && v.instrumentErrors === 0
      && v.missingAnchor === 0 && v.policyShaMismatches === 0
      && Object.keys(v.anchors).length === 1
      && v.wrongMode === 0 && v.bundleOff === 0 && v.stageWrong === 0
      && v.seeds.length === STAGED_N
      && v.seeds.every(function (s, i) { return s === STAGED_START + i; });
    console.log('TEST-KILLBUNDLE-B-CORPUS-STAGE: ' + (ok ? 'PASS' : 'FAIL'));
    process.exit(ok ? 0 : 1);
  }
  if (process.argv.indexOf('--live') !== -1) {
    process.exit((await liveTests()) ? 0 : 1);
  }
  let pass = 0, fail = 0;
  function check(name, cond, detail) {
    if (cond) { pass++; console.log('ok   ' + name); }
    else { fail++; console.log('FAIL ' + name + (detail ? ' — ' + detail : '')); }
  }
  function approx(a, b, eps) { return Math.abs(a - b) <= (eps || 1e-9); }
  // Frozen matched band (reuses the killarrive band BY DESIGN).
  check('band: 49 contiguous seeds', BAND_END - BAND_START + 1 === BAND_N,
    BAND_START + '-' + BAND_END);
  check('band: starts at 107533 (above Loop A 107517-107532)', BAND_START === 107533);
  check('band: no overlap with any reserved range',
    RESERVED.every(function (r) { return BAND_END < r[0] || BAND_START > r[1]; }),
    JSON.stringify(RESERVED.filter(function (r) { return !(BAND_END < r[0] || BAND_START > r[1]); })));
  // Frozen staged subset: first 16 seeds of the matched band — no new band.
  check('staged: 16 contiguous seeds', STAGED_END - STAGED_START + 1 === STAGED_N,
    STAGED_START + '-' + STAGED_END);
  check('staged: subset of the matched band (no new band)',
    STAGED_START >= BAND_START && STAGED_END <= BAND_END);
  check('staged: one forced arrival per seed by construction', STAGED_N === 16);
  // Sizing arithmetic carried from killarrive-b (fixed inputs).
  check('size: per-seed arrival ≈ 4.6%', approx(P_SEED_ARRIVAL, 0.046, 0.002),
    'got ' + P_SEED_ARRIVAL.toFixed(4));
  check('size: expected natural arrivals on 49 seeds ≈ 2.25', approx(MU_49, 2.25, 0.05),
    'got ' + MU_49.toFixed(2));
  check('size: P(0 natural arrivals | mu=2.25) ≈ 0.105',
    approx(poissonCdf(0, MU_49), 0.105, 0.005),
    'got ' + poissonCdf(0, MU_49).toFixed(3));
  // Ctl Wilson interval carried for the no-regression bar.
  check('regression band: ctl Wilson interval 5.5-10.8%',
    CTL_T4_WILSON_LO === 0.055 && CTL_T4_WILSON_HI === 0.108);
  // Driver exports the staged forcer.
  check('driver: stageFirstKillLoot exported',
    typeof driver.stageFirstKillLoot === 'function');
  console.log('TEST-KILLBUNDLE-B: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = { BAND_START: BAND_START, BAND_END: BAND_END, BAND_N: BAND_N,
  STAGED_START: STAGED_START, STAGED_END: STAGED_END, STAGED_N: STAGED_N,
  RESERVED: RESERVED, MU_49: MU_49,
  CTL_T4_WILSON_LO: CTL_T4_WILSON_LO, CTL_T4_WILSON_HI: CTL_T4_WILSON_HI,
  validateCorpus: validateCorpus };
