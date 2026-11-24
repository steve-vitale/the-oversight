#!/usr/bin/env node
// scripts/test-instrument-a.js — proof test, arm sim-instrument-a
// (instrument blanks #3 + #4 from
// evidence/2026-11-24/sim-scale-onramp-round-1715.md "Next blanks").
//
// §A FIGHTCAP LABEL (blank #3): analyze-fightcap-a.js judge() must
// return DIAG-THIN (never DIAG-GO) when the trio+ pool is thin
// (n < 10), and must still return the existing non-thin pass verdict
// (GO) when the pool is full and every bar passes — label only, no
// computation, threshold, or classification change. NOTE on the
// brief's wording: it says "an n >= 10 input ... yields DIAG-GO";
// that name was never the non-thin verdict — judge() returns GO on
// a full pool and DIAG-GO only on a thin one. The rename moves the
// thin-pool verdict to DIAG-THIN and leaves GO exactly as it was;
// this test pins GO for the full-pool case and DIAG-THIN for the
// thin-pool case, and fails if DIAG-GO ever appears again.
// §B SPEAR-GATE COUNTERS, ANALYZER (blank #4): analyze-bowopen-a.js
// legStats() must aggregate the driver's per-seed spearSeen /
// spearPassed into per-leg totals with a pass rate, and must report
// corpora WITHOUT the counters as unknown (null, never 0, never a
// faked 1.0) — including a leg where only SOME files carry them
// (no partial sum masquerades as a total).
// §C SPEAR-GATE COUNTERS, DRIVER SMOKE (blank #4): the bowopen
// driver (oneRun) must emit spearSeen/spearPassed on a short arm
// seed (BOWOPEN=1: staging runs, counters present, passed <= seen)
// and null on a short ctl seed (BOWOPEN unset: staging never runs,
// counters unobserved — never 0). The analyzer must then report
// the smoked arm corpus with the same numbers.
// The driver smoke runs two 30d sims; the rest is instant.
// Usage: node scripts/test-instrument-a.js
// Exit 0 = all checks pass. Exit 1 = a failure (listed).
// Writes NOTHING into the repo (smoke corpora live in os.tmpdir()).
'use strict';
// The driver reads its env at require time (DAYS, MODE, flags) and
// the game code reads BOWOPEN/SPEARGATE live per departure, so the
// arm smoke env is set BEFORE requiring the driver; the ctl smoke
// flips BOWOPEN off between the two oneRun calls.
process.env.VETREENGAGE = '1';
process.env.PARTYSIZE4 = '1';
process.env.FLEEREPAIR2 = '1';
process.env.FIGHTALLY2 = '1';
process.env.SENSEEXPED = '1';
process.env.SPEARGATE = '1';
process.env.BOWOPEN = '1';
process.env.MODE = 'arm';
process.env.DAYS = '30';
process.env.RUN = 'instrument-a-smoke';
const path = require('path');
const fs = require('fs');
const os = require('os');
const REPO = path.join(__dirname, '..');
const F = require(path.join(REPO, 'scripts', 'analyze-fightcap-a.js'));
const B = require(path.join(REPO, 'scripts', 'analyze-bowopen-a.js'));
const DRIVER = require(path.join(REPO, 'scripts', 'bowopen-driver-recheck-a.js'));

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('  PASS ' + name); }
  else { failed++; console.log('  FAIL ' + name + (extra != null ? ' — ' + JSON.stringify(extra) : '')); }
}
function mkLeg(o) {
  return Object.assign({ meetings: 12, wins: 6, kills: 3, mFlee: 3, vDie: 3, vFlee: 3,
    winShare: 0.5, communityLost: 1, starvation: 0, starvationVillager: 0, medianDays: 150 }, o);
}
function mkBowSeed(o) {
  return Object.assign({ seed: 110201, days: 30, gameDays: 30, scaleRank: 'regional', won: false,
    maxWave: 4, endReason: 'survived', instrumentErrors: [], launchpartyOn: true, fightally2On: true,
    bowopenOn: true, speargateOn: true,
    deaths: [], daily: [], samples: { villagers: [] },
    v4departs: [], v4gates: [], v4encounters: [] }, o);
}

console.log('§A fightcap label (blank #3)');
(function sectionA() {
  let j = F.judge(mkLeg({}), mkLeg({ meetings: 5, wins: 0, kills: 0, mFlee: 0, vDie: 2, vFlee: 3, winShare: 0 }));
  check('thin pool (n=5, recheck trio+ shape): verdict DIAG-THIN, kind THIN-POOL',
    j.verdict === 'DIAG-THIN' && j.kind === 'THIN-POOL', j);
  check('thin pool (n=5): never DIAG-GO', j.verdict !== 'DIAG-GO', j);
  j = F.judge(mkLeg({}), mkLeg({ meetings: 9, wins: 0, kills: 0, mFlee: 0, vDie: 2, vFlee: 7, winShare: 0 }));
  check('thin pool (n=9, one short of the floor): verdict DIAG-THIN, never DIAG-GO',
    j.verdict === 'DIAG-THIN' && j.verdict !== 'DIAG-GO', j);
  j = F.judge(mkLeg({}), mkLeg({}));
  check('full pool (n=12) with every bar passing: verdict GO (unchanged non-thin pass)',
    j.verdict === 'GO' && j.kind === '', j);
  j = F.judge(mkLeg({}), mkLeg({ winShare: 0.4, wins: 4, kills: 2, mFlee: 2, vDie: 4, vFlee: 4 }));
  check('full pool (n=12) with win share under 0.50: verdict NO-GO (unchanged)',
    j.verdict === 'NO-GO' && !j.bars[1].pass, j);
})();

console.log('§B bowopen counters, analyzer (blank #4)');
(function sectionB() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'instrument-a-bow-'));
  try {
    // One file WITH counters: 6 seen / 6 passed (gate passes all it sees).
    const withDir = path.join(tmp, 'with');
    fs.mkdirSync(withDir);
    fs.writeFileSync(path.join(withDir, 's1.json'), JSON.stringify(mkBowSeed({
      bowOpen: { alreadyHad: 2, fromStash: 0, fromArmory: 0, crafted: 0, craftedFail: 0, noSource: 1 },
      spearSeen: 6, spearPassed: 6 })));
    let st = B.legStats(withDir);
    check('analyzer aggregates driver counters (spearSeen 6, spearPassed 6, rate 1.0, known)',
      st.spearSeen === 6 && st.spearPassed === 6 && st.spearPassRate === 1 && st.spearCountersKnown === true,
      { seen: st.spearSeen, passed: st.spearPassed, rate: st.spearPassRate, known: st.spearCountersKnown });
    // One file WITHOUT counters (old format: no top-level fields, bowOpen null like a ctl leg).
    const withoutDir = path.join(tmp, 'without');
    fs.mkdirSync(withoutDir);
    fs.writeFileSync(path.join(withoutDir, 's1.json'), JSON.stringify(mkBowSeed({ bowOpen: null })));
    st = B.legStats(withoutDir);
    check('analyzer reports a corpus without counters as unknown (null, never 0, never a faked rate)',
      st.spearSeen === null && st.spearPassed === null && st.spearPassRate === null && st.spearCountersKnown === false,
      { seen: st.spearSeen, passed: st.spearPassed, rate: st.spearPassRate, known: st.spearCountersKnown });
    // MIXED leg: one file with counters, one without — no partial sum.
    const mixedDir = path.join(tmp, 'mixed');
    fs.mkdirSync(mixedDir);
    fs.writeFileSync(path.join(mixedDir, 's1.json'), JSON.stringify(mkBowSeed({ spearSeen: 6, spearPassed: 6 })));
    fs.writeFileSync(path.join(mixedDir, 's2.json'), JSON.stringify(mkBowSeed({ seed: 110202, bowOpen: null })));
    st = B.legStats(mixedDir);
    check('analyzer reports a mixed leg as unknown (no partial sum)',
      st.spearSeen === null && st.spearPassed === null && st.spearPassRate === null && st.spearCountersKnown === false,
      { seen: st.spearSeen, passed: st.spearPassed, rate: st.spearPassRate, known: st.spearCountersKnown });
    // REAL old corpora (bowopen-recheck, both legs): counters unknown on both.
    for (const leg of ['ctl', 'arm']) {
      const dir = path.join(REPO, 'evidence', '2026-11-24', 'perseed-bowopen-recheck-a-' + leg);
      if (!fs.existsSync(dir)) { console.log('  SKIP real old corpora (' + leg + '): dir not present'); continue; }
      st = B.legStats(dir);
      check('analyzer reports the real bowopen-recheck ' + leg + ' corpora as unknown (old driver, no counters)',
        st.spearSeen === null && st.spearPassed === null && st.spearPassRate === null && st.spearCountersKnown === false,
        { seen: st.spearSeen, passed: st.spearPassed, rate: st.spearPassRate, known: st.spearCountersKnown });
    }
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  }
})();

console.log('§C bowopen counters, driver smoke (blank #4)');
(async function sectionC() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'instrument-a-smoke-'));
  try {
    // ARM smoke: BOWOPEN=1, 30d, seed 110201 — staging runs.
    const armOut = await DRIVER.oneRun(110201);
    check('driver smoke arm: spearSeen present (a number, never undefined)',
      typeof armOut.spearSeen === 'number' && Number.isFinite(armOut.spearSeen), { spearSeen: armOut.spearSeen });
    check('driver smoke arm: spearPassed present (a number, never undefined)',
      typeof armOut.spearPassed === 'number' && Number.isFinite(armOut.spearPassed), { spearPassed: armOut.spearPassed });
    check('driver smoke arm: counters internally consistent (passed <= seen, both >= 0)',
      typeof armOut.spearSeen === 'number' && typeof armOut.spearPassed === 'number' &&
      armOut.spearPassed <= armOut.spearSeen && armOut.spearSeen >= 0 && armOut.spearPassed >= 0,
      { seen: armOut.spearSeen, passed: armOut.spearPassed });
    check('driver smoke arm: staging ran (bowOpen present)',
      armOut.bowOpen != null && typeof armOut.bowOpen === 'object', armOut.bowOpen);
    // The analyzer must report the smoked arm corpus with the same numbers.
    const armDir = path.join(tmp, 'arm');
    fs.mkdirSync(armDir);
    fs.writeFileSync(path.join(armDir, 's110201.json'), JSON.stringify(armOut));
    const stArm = B.legStats(armDir);
    check('analyzer reports the smoked arm corpus with the driver numbers',
      stArm.spearSeen === armOut.spearSeen && stArm.spearPassed === armOut.spearPassed &&
      stArm.spearCountersKnown === true &&
      stArm.spearPassRate === (armOut.spearSeen ? armOut.spearPassed / armOut.spearSeen : null),
      { seen: stArm.spearSeen, passed: stArm.spearPassed, rate: stArm.spearPassRate, known: stArm.spearCountersKnown });
    // CTL smoke: BOWOPEN unset — staging never runs, counters unobserved (null, never 0).
    delete process.env.BOWOPEN;
    const ctlOut = await DRIVER.oneRun(110202);
    check('driver smoke ctl: spearSeen null (staging never ran — unobserved, never 0)',
      ctlOut.spearSeen === null, { spearSeen: ctlOut.spearSeen });
    check('driver smoke ctl: spearPassed null (staging never ran — unobserved, never 0)',
      ctlOut.spearPassed === null, { spearPassed: ctlOut.spearPassed });
    check('driver smoke ctl: bowOpen null (staging never ran)',
      ctlOut.bowOpen === null, ctlOut.bowOpen);
    const ctlDir = path.join(tmp, 'ctl');
    fs.mkdirSync(ctlDir);
    fs.writeFileSync(path.join(ctlDir, 's110202.json'), JSON.stringify(ctlOut));
    const stCtl = B.legStats(ctlDir);
    check('analyzer reports the smoked ctl corpus as unknown',
      stCtl.spearSeen === null && stCtl.spearPassed === null && stCtl.spearPassRate === null && stCtl.spearCountersKnown === false,
      { seen: stCtl.spearSeen, passed: stCtl.spearPassed, rate: stCtl.spearPassRate, known: stCtl.spearCountersKnown });
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  }
  console.log('test-instrument-a: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch(function (e) { console.error(e.stack); process.exit(1); });
