// Verifier for the sim-packtail-confirm-b adoption judgment (loop B, 2026-10-25).
// Asserts: corpus completeness (16+16 per-seed JSONs, seeds 94909-94924, both
// cells, sweep files present, no 0-byte files); the analyzer re-run matches the
// stored output byte-for-byte; and every pre-registered verdict leg holds.
// Usage: node scripts/test-packtail-confirm-b-verdict.js  (exit 0 = all pass)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
const corpus = path.join(root, 'evidence/2026-10-25/sim-packtail-confirm-b-corpus');
const stored = path.join(root, 'evidence/2026-10-25/sim-packtail-confirm-b-analyzer-output.txt');
let failures = [];
function check(name, cond, detail = '') {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!cond) failures.push(name);
}
const expected = Array.from({ length: 16 }, (_, i) => 94909 + i);
for (const cell of ['baseline', 'armed']) {
  const dir = path.join(corpus, cell);
  const seeds = [];
  for (const s of expected) {
    const f = path.join(dir, `packtail-confirm-b-competent-s${s}.json`);
    if (!fs.existsSync(f) || fs.statSync(f).size === 0) { check(`${cell} s${s} present+nonempty`, false); continue; }
    try { seeds.push(JSON.parse(fs.readFileSync(f, 'utf8')).seed); }
    catch (e) { check(`${cell} s${s} parses`, false, String(e)); }
  }
  check(`${cell} seeds exactly 94909-94924`, JSON.stringify(seeds) === JSON.stringify(expected), seeds.join(','));
  const sw = path.join(dir, 'sweep-competent.json');
  check(`${cell} sweep-competent.json present+nonempty`, fs.existsSync(sw) && fs.statSync(sw).size > 0);
}
// Re-run analyzer fresh to /tmp and compare with the stored output.
const fresh = '/tmp/packtail-confirm-b-verifier-fresh.txt';
execFileSync('node', [path.join(root, 'scripts/analyze-awayration-packtail-confirm-b.js'),
  path.join(corpus, 'baseline'), path.join(corpus, 'armed')], { stdio: ['ignore', fs.openSync(fresh, 'w'), 'inherit'] });
const freshText = fs.readFileSync(fresh, 'utf8');
const storedText = fs.readFileSync(stored, 'utf8');
check('analyzer re-run matches stored output', freshText === storedText);
// Parse verdict legs from the stored output.
const m = (re) => { const x = storedText.match(re); return x ? x[1] : null; };
const armedMed = parseFloat(m(/BINDING COVERAGE \(drawn\/dayWant\): n=(\d+) median=([\d.]+)/) ? storedText.match(/--- ARMED ---[\s\S]*?BINDING COVERAGE \(drawn\/dayWant\): n=(\d+) median=([\d.]+)/)[2] : 'NaN');
const armedN = parseInt(storedText.match(/--- ARMED ---[\s\S]*?BINDING COVERAGE \(drawn\/dayWant\): n=(\d+)/)[1], 10);
check('PRIMARY armed median binding coverage >= 0.90', armedMed >= 0.90, String(armedMed));
check('PRIMARY armed binding n >= 30', armedN >= 30, String(armedN));
const cap = storedText.match(/DRAW_DAY_COVERAGE=\d+\/\d+ \(([\d.]+)\)/g);
check('guardrail draw-day capture == 1.000 both arms', cap && cap.length === 2 && cap.every(c => c.endsWith('(1.000)')), (cap || []).join(' '));
const surv = storedText.match(/median survival: (\d+)d -> (\d+)d \(ratio ([\d.]+)/);
check('guardrail median survival ratio >= 0.8', surv && parseFloat(surv[3]) >= 0.8, surv ? surv[0] : 'not found');
const fp = storedText.match(/full-pantry away starvation deaths: (\d+) -> (\d+) \(bar <= baseline\+2\)/);
check('guardrail full-pantry away starvation <= control+2', fp && parseInt(fp[2], 10) <= parseInt(fp[1], 10) + 2, fp ? fp[0] : 'not found');
const ao = storedText.match(/armed-only death causes: ([^\n]*)/);
const blockers = storedText.match(/armedOnlyBlockers=(\d+)/);
check('guardrail no armed-only death cause >= 3 deaths', blockers && blockers[1] === '0', ao ? ao[1] : '');
// Arena landing gate (pre-registered for this confirm only).
const arenaBase = parseInt(storedText.match(/--- BASELINE ---[\s\S]*?the arena=(\d+)/)[1], 10);
const arenaArmed = parseInt(storedText.match(/--- ARMED ---[\s\S]*?the arena=(\d+)/)[1], 10);
const ratio = arenaArmed / arenaBase, excess = arenaArmed - arenaBase;
const gateTrips = ratio >= 1.5 && excess >= 10;
console.log(`ARENA GATE baseline=${arenaBase} armed=${arenaArmed} ratio=${ratio.toFixed(3)} excess=${excess} trips=${gateTrips}`);
check('arena gate does NOT trip (ratio < 1.5 or excess < 10)', !gateTrips, `ratio ${ratio.toFixed(3)}, excess ${excess}`);
console.log(failures.length ? `\n${failures.length} FAILURES` : '\nALL CHECKS PASS');
process.exit(failures.length ? 1 : 0);
