// Proof test for landing r51 instrument changes (scripts/journey-landing-r51-20261025.js
// + scripts/analyze-landing-r51-20261025.js). R51 changes vs r50, nothing else:
//   - driver seeds 629-632, OUTDIR landing-r51, depth samples full-length (1000 chars)
//   - analyzer scholar watch WIDENED: holder death resolves on a mantle pass within
//     [deathDay, deathDay+4]; no pass <= horizon-4 is NO-SUCCESSOR (NO-GO); no pass
//     within 4 days of the horizon is UNRESOLVED-AT-HORIZON (watch, not a miss).
// The driver is not requireable (it runs sims on load), so driver cases prove code
// shape; the analyzer cases run the REAL analyzer on synthetic corpora.
// No game code, no repo writes (synthetic dirs under os.tmpdir, removed after).
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const DRIVER = path.join(__dirname, 'journey-landing-r51-20261025.js');
const ANALYZER = path.join(__dirname, 'analyze-landing-r51-20261025.js');
const driver = fs.readFileSync(DRIVER, 'utf8');
const analyzer = fs.readFileSync(ANALYZER, 'utf8');

let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

check('A seeds-629-632', /\[629, 630, 631, 632\]/.test(driver));
check('B outdir-landing-r51', /landing-r51/.test(driver));
check('C depth-samples-full-length',
  (driver.match(/rl\.slice\(0, 1000\)/g) || []).length === 2 &&
  !/depthHonestExhaustionSamples[\s\S]{0,400}rl\.slice\(0, 160\)/.test(driver) &&
  !/depthFizzleSamples[\s\S]{0,400}rl\.slice\(0, 160\)/.test(driver));
check('D analyzer-plus4-window',
  /m\.day >= dd && m\.day <= dd \+ 4/.test(analyzer));
check('E analyzer-unresolved-and-nosuccessor',
  /UNRESOLVED-AT-HORIZON/.test(analyzer) && /NO-SUCCESSOR \(NO-GO\)/.test(analyzer));
check('F analyzer-succession-verdict-line',
  /SCHOLAR SUCCESSION: /.test(analyzer));

function corpus(dir, seed, horizon, holderId, holderName, deaths, mantle) {
  const series = [];
  for (let d = 1; d <= horizon; d++) {
    series.push({ day: d, pop: 12, villageGrief: 0, scholarKcal: 1000, loc: 'haven',
      journalHolder: holderId });
  }
  const c = {
    seed, systemDay: 8, series, deaths, mantleLog: mantle,
    awayDayDigest: [], starvAutopsies: [], r41Summary: {},
    census: [{ id: holderId, name: holderName }, { id: 'other1', name: 'Other' }],
    contestsHeld: 0, contestLedger: [], contestDeathAutopsies: [],
    villagerDeaths: deaths.filter(x => x.kind === 'villager'),
    monsterKills: [], finalGrief: 0,
  };
  fs.writeFileSync(path.join(dir, `journey-landing-r51-census-${seed}.json`), JSON.stringify(c));
}
function runAnalyzer(dir) {
  return execFileSync(process.execPath, [ANALYZER, dir], { encoding: 'utf8' });
}

// G: 2-day-later succession resolves (the r50 miss case: Pedro d10 -> Zoey d12)
(function () {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'landing-r51-g-'));
  try {
    corpus(dir, 901, 28, 'h1', 'Pedro',
      [{ day: 10, who: 'h1', cause: 'dehydration', kind: 'villager' }],
      [{ day: 12, from: 'h1', to: 'other1', fromName: 'Pedro', toName: 'Other' }]);
    const out = runAnalyzer(dir);
    check('G two-day-lag-succession-resolves',
      /latency=2d RESOLVED/.test(out) && /SCHOLAR SUCCESSION: GO/.test(out), out.split('\n').filter(l => /SCHOLAR/.test(l)).join(' | '));
  } catch (e) { check('G two-day-lag-succession-resolves', false, e.message); }
  finally { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} }
})();

// H: horizon-edge holder death with no pass is a watch, not a NO-GO
(function () {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'landing-r51-h-'));
  try {
    corpus(dir, 902, 28, 'h1', 'Arnold',
      [{ day: 26, who: 'h1', cause: 'dehydration', kind: 'villager' }], []);
    const out = runAnalyzer(dir);
    check('H horizon-edge-death-is-watch',
      /UNRESOLVED-AT-HORIZON/.test(out) && /SCHOLAR SUCCESSION: WATCH/.test(out) && !/NO-SUCCESSOR \(NO-GO\)/.test(out),
      out.split('\n').filter(l => /SCHOLAR/.test(l)).join(' | '));
  } catch (e) { check('H horizon-edge-death-is-watch', false, e.message); }
  finally { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} }
})();

// I: mid-window holder death with no pass is NO-GO
(function () {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'landing-r51-i-'));
  try {
    corpus(dir, 903, 28, 'h1', 'Pedro',
      [{ day: 10, who: 'h1', cause: 'dehydration', kind: 'villager' }], []);
    const out = runAnalyzer(dir);
    check('I mid-window-no-successor-is-nogo',
      /NO-SUCCESSOR \(NO-GO\)/.test(out) && /SCHOLAR SUCCESSION: NO-GO/.test(out),
      out.split('\n').filter(l => /SCHOLAR/.test(l)).join(' | '));
  } catch (e) { check('I mid-window-no-successor-is-nogo', false, e.message); }
  finally { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} }
})();

// J: same-day succession resolves at latency 0 (the live 630 catch:
// Victor died d15, mantle passed d15 — a <= holderAt missed him entirely)
(function () {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'landing-r51-j-'));
  try {
    corpus(dir, 904, 28, 'h1', 'Victor',
      [{ day: 15, who: 'h1', cause: 'the arena', kind: 'villager' }],
      [{ day: 15, from: 'h1', to: 'other1', fromName: 'Victor', toName: 'Kamon' }]);
    const out = runAnalyzer(dir);
    check('J same-day-succession-resolves-latency-0',
      /latency=0d RESOLVED/.test(out) && /SCHOLAR SUCCESSION: GO/.test(out),
      out.split('\n').filter(l => /SCHOLAR/.test(l)).join(' | '));
  } catch (e) { check('J same-day-succession-resolves-latency-0', false, e.message); }
  finally { try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {} }
})();

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
