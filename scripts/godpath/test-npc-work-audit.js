'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const assert = require('assert/strict'), K = require('./lib'), T = K.reporter('NPC work audit');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'oversight-npc-work-'));
const script = path.join(K.ROOT, 'scripts/audit-npc-work.js');
const args = [script, '--out', 'audit', '--seeds', '7', '--days', '1'];
try {
  // Parent cwd differs from worker cwd. Relative output must be resolved once
  // before dispatch; otherwise a valid frozen-root audit loses its report.
  const run = () => cp.spawnSync(process.execPath, args, { cwd: dir, encoding: 'utf8', windowsHide: true, timeout: 60000 });
  const result = run(); assert.equal(result.status, 0, result.stderr);
  const output = path.join(dir, 'audit/summary.json'), bytes = fs.readFileSync(output);
  const report = JSON.parse(bytes);
  T.ok('real campaign audit supports relative output from another cwd', report.root === K.ROOT && report.results.length === 1);
  T.ok('independent observer control matches whole row and gameplay hash', report.results[0].neutral === true && report.results[0].unknownIdentityCalls === 0);
  const repeat = run();
  T.ok('repeat refuses overwrite and preserves the original report', repeat.status !== 0 && /fresh output directory/.test(repeat.stderr) && fs.readFileSync(output).equals(bytes));
  T.ok('short smoke audit does not claim a campaign ending or feature coverage', report.scope.includes('not run endings') && report.scope.includes('not universal successes'));
  const checks = T.done();
  assert.equal(checks.fail, 0);
  // Only this freshly owned, canonical temporary directory is removed.
  const actual = fs.realpathSync(dir), parent = fs.realpathSync(os.tmpdir());
  const relative = path.relative(parent, actual);
  assert(!path.isAbsolute(relative) && !relative.startsWith('..') && relative.startsWith('oversight-npc-work-'));
  fs.rmSync(actual, { recursive: true });
} catch (error) {
  console.error('Failed audit retained at ' + dir, error);
  process.exitCode = 1;
}
