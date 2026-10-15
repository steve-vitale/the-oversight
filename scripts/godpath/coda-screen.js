#!/usr/bin/env node
// Standard 150-day comparisons; one harness per child, narration is observed at the end.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const root = path.resolve(arg('root', path.join(__dirname, '../..')));
async function child() {
  const H = require(path.join(root, 'scripts/sim-harness'));
  const { runComparison } = require(path.join(root, 'scripts/sweep-compare'));
  const rep = await H.quietLog(() => runComparison({ seeds: [Number(arg('seed', 7))], policies: [arg('policy', 'capable')], days: 150,
    extraMetrics: G => ({ ending: (G.state.scholar.prog || {}).table?.ending || null }) }));
  process.stdout.write('@@CODA@@' + JSON.stringify(rep.runs[0]) + '\n');
}
async function main() {
  if (process.argv.includes('--child')) return child();
  const seeds = require('../sweep-dashboard').seedList(16), policies = ['capable', 'maker'];
  const jobs = policies.flatMap(policy => seeds.map(seed => ({ policy, seed }))), rows = []; let next = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const j = jobs[next++];
      const row = await new Promise((resolve, reject) => {
        const p = cp.spawn(process.execPath, [__filename, '--child', '--root', root, '--seed', String(j.seed), '--policy', j.policy], { cwd: root });
        let out = '', err = ''; p.stdout.on('data', x => { out += x; }); p.stderr.on('data', x => { err += x; }); p.on('error', reject);
        p.on('close', code => { try { if (code) throw new Error(err); resolve(JSON.parse(out.split('@@CODA@@').pop())); } catch (e) { reject(new Error(j.policy + '/' + j.seed + ': ' + e.message)); } });
      });
      rows.push(row); process.stdout.write('.');
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));
  rows.sort((a, b) => a.policy.localeCompare(b.policy) || seeds.indexOf(a.seed) - seeds.indexOf(b.seed));
  const hashes = {};
  for (const rel of ['src/data/table-endings.json', 'src/js/endingKey.js', 'src/js/table.js', 'scripts/sim-harness.js', 'scripts/sweep-compare.js', 'scripts/policies/capable.js', 'scripts/policies/livelihood.js']) hashes[rel] = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, rel))).digest('hex');
  hashes['observer/coda-screen.js'] = crypto.createHash('sha256').update(fs.readFileSync(__filename)).digest('hex');
  const report = { driver: 'sweep-compare', sourceRoot: root, sourceHead: cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), sourceHashes: hashes, seeds, policies, days: 150, rows };
  if (!arg('out', null)) throw new Error('--out is required for the parent report');
  fs.writeFileSync(arg('out'), JSON.stringify(report, null, 2) + '\n'); console.log('\nSaved ' + arg('out'));
}
main().catch(e => { console.error(e.stack); process.exitCode = 1; });
