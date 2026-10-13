// test-telemetry-check.js — proof for scripts/telemetry-check.js (Steve 2026-10-13).
// RED-verified: the wave-3 disappearance case must LOUD (exit 1); quiet cases exit 0.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const CHECK = path.join(__dirname, 'telemetry-check.js');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; console.log('  FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

function run(baseline, currents, metrics) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tcheck-'));
  const bpath = path.join(dir, 'base.json');
  fs.writeFileSync(bpath, JSON.stringify(baseline));
  const files = currents.map((c, i) => {
    const p = path.join(dir, 'run-' + i + '.json');
    fs.writeFileSync(p, JSON.stringify(c));
    return p;
  });
  const glob = currents.length === 1 ? files[0] : path.join(dir, 'run-*.json');
  let stdout = '', code = 0;
  try {
    stdout = execFileSync('node', [CHECK, '--baseline', bpath, '--current', glob, '--metrics', metrics.join(',')], { encoding: 'utf8' });
  } catch (e) {
    code = e.status; stdout = e.stdout || '';
  }
  return { code, stdout };
}

// 1. THE WAVE-3 CASE (deepening r7 -> r9): 6 fights -> 0 must LOUD.
{
  const r = run({ w3fights: 6 }, [{ w3fights: [] }, { w3fights: [] }], ['w3fights']);
  check('wave-3 disappearance exits 1', r.code === 1, 'code=' + r.code);
  check('wave-3 disappearance prints LOUD', /LOUD: w3fights disappeared/.test(r.stdout), r.stdout.trim());
}

// 2. Quiet when nothing moved.
{
  const r = run({ w3fights: 6 }, [{ w3fights: [1, 2, 3] }, { w3fights: [4, 5, 6] }], ['w3fights']);
  check('stable metric exits 0', r.code === 0, 'code=' + r.code + ' ' + r.stdout.trim());
  check('stable metric prints quiet', /quiet/.test(r.stdout), r.stdout.trim());
}

// 3. New appearance LOUDs.
{
  const r = run({ w3fights: 0 }, [{ w3fights: [1, 2, 3, 4] }], ['w3fights']);
  check('new appearance exits 1', r.code === 1, 'code=' + r.code);
  check('new appearance prints LOUD', /LOUD: w3fights newly appeared/.test(r.stdout), r.stdout.trim());
}

// 4. Small jitter stays quiet (6 -> 5 is -17%, under the 60% bar).
{
  const r = run({ w3fights: 6 }, [{ w3fights: [1, 2, 3, 4, 5] }], ['w3fights']);
  check('small jitter exits 0', r.code === 0, 'code=' + r.code + ' ' + r.stdout.trim());
}

// 5. Large swing LOUDs (10 -> 3 is -70%).
{
  const r = run({ national: 10 }, [{ national: 3 }], ['national']);
  check('large swing exits 1', r.code === 1, 'code=' + r.code);
  check('large swing prints LOUD', /LOUD: national swung/.test(r.stdout), r.stdout.trim());
}

// 6. Nested dot-paths aggregate (fightsByWave.3 across seed files).
{
  const r = run({ 'fightsByWave.3': 6 },
    [{ fightsByWave: { 1: 4, 2: 2 } }, { fightsByWave: { 1: 3, 3: 6 } }], ['fightsByWave.3']);
  check('nested path sums to baseline (quiet)', r.code === 0, 'code=' + r.code + ' ' + r.stdout.trim());
}

// 7. Missing path counts as 0 -> disappearance LOUDs.
{
  const r = run({ w3fights: 4 }, [{ other: 1 }], ['w3fights']);
  check('missing path reads as 0 and LOUDs', r.code === 1 && /disappeared/.test(r.stdout), 'code=' + r.code);
}

// 8. --update-baseline writes current aggregates.
{
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tcheck-'));
  const bpath = path.join(dir, 'base.json');
  const cpath = path.join(dir, 'cur.json');
  const opath = path.join(dir, 'new.json');
  fs.writeFileSync(bpath, JSON.stringify({ w3fights: 0 }));
  fs.writeFileSync(cpath, JSON.stringify({ w3fights: [1, 2, 3] }));
  try {
    execFileSync('node', [CHECK, '--baseline', bpath, '--current', cpath, '--metrics', 'w3fights', '--update-baseline', opath]);
  } catch (e) { /* exit 1 expected: 0 -> 3 is a LOUD appearance; baseline still written */ }
  const written = JSON.parse(fs.readFileSync(opath, 'utf8'));
  check('--update-baseline writes aggregates', written.w3fights === 3, JSON.stringify(written));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
