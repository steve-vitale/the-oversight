#!/usr/bin/env node
// Read-only paired campaign verification. Keep the existing full-state hash;
// additionally compare a clone with only harvestShares removed.
'use strict';
const path = require('path'), cp = require('child_process'), fs = require('fs');
const arg = (name, fallback) => { const i = process.argv.indexOf('--' + name); return i < 0 ? fallback : process.argv[i + 1]; };
async function child() {
  const root = path.resolve(arg('root', path.join(__dirname, '../..')));
  const H = require(path.join(root, 'scripts/sim-harness'));
  const { runComparison, POLICY_REGISTRY: registry } = require(path.join(root, 'scripts/sweep-compare'));
  const policy = arg('policy', 'capable'), seed = Number(arg('seed', 7));
  const hash = require(path.join(root, 'scripts/gear-usage-audit')).gameplayHash;
  function snapshot(G) {
    let sourceFields = 0;
    const withoutSources = JSON.parse(JSON.stringify(G.state, (key, value) => {
      if (key === 'harvestShares') { sourceFields++; return undefined; }
      return value;
    }));
    return { day: G.state.scholar.day, rawHash: hash(G.state), withoutSourcesHash: hash(withoutSources), sourceFields };
  }
  const samples = [], base = registry[policy];
  registry[policy] = Object.assign({}, base, {
    daily(g, ctx) { const r = base.daily && base.daily(g, ctx); samples.push(snapshot(g)); return r; },
  });
  let report;
  try { report = await H.quietLog(() => runComparison({ seeds: [seed], policies: [policy], days: 150 })); }
  finally { registry[policy] = base; }
  process.stdout.write('@@HARVEST@@' + JSON.stringify({ policy, seed, row: report.runs[0], samples, ...snapshot(globalThis.Scattering.Game) }) + '\n');
}
async function main() {
  if (process.argv.includes('--child')) return child();
  if (!arg('before', null) || !arg('out', null)) throw new Error('--before frozen-source-root and --out are required');
  const roots = { before: path.resolve(arg('before')), after: path.resolve(arg('after', path.join(__dirname, '../..'))) };
  const seeds = arg('seeds', '7,12').split(',').map(Number), policies = ['capable', 'maker', 'merchant', 'caregiver'];
  const jobs = Object.keys(roots).flatMap(side => policies.flatMap(policy => seeds.map(seed => ({ side, policy, seed }))));
  const rows = []; let next = 0;
  async function worker() {
    while (next < jobs.length) {
      const job = jobs[next++];
      const value = await new Promise((resolve, reject) => {
        const p = cp.spawn(process.execPath, [__filename, '--child', '--root', roots[job.side], '--policy', job.policy, '--seed', String(job.seed)], { cwd: roots[job.side] });
        let out = '', err = ''; p.stdout.on('data', x => { out += x; }); p.stderr.on('data', x => { err += x; }); p.on('error', reject);
        p.on('close', code => { try { if (code) throw new Error(err); resolve(JSON.parse(out.split('@@HARVEST@@').pop())); } catch (e) { reject(e); } });
      });
      rows.push({ side: job.side, ...value }); process.stdout.write('.');
    }
  }
  await Promise.all(Array.from({ length: Number(arg('par', 4)) }, worker));
  rows.sort((a, b) => a.side.localeCompare(b.side) || a.policy.localeCompare(b.policy) || a.seed - b.seed);
  const comparisons = rows.filter(x => x.side === 'after').map(after => {
    const before = rows.find(x => x.side === 'before' && x.policy === after.policy && x.seed === after.seed);
    const sameDailyWithoutSources = before.samples.length === after.samples.length && before.samples.every((x, i) => x.day === after.samples[i].day && x.withoutSourcesHash === after.samples[i].withoutSourcesHash);
    return { policy: after.policy, seed: after.seed, sameStandardRow: JSON.stringify(before.row) === JSON.stringify(after.row), sameDailyWithoutSources, samples: after.samples.length, sameWithoutSources: before.withoutSourcesHash === after.withoutSourcesHash, sameRaw: before.rawHash === after.rawHash, samplesWithSources: after.samples.filter(x => x.sourceFields > 0).length, addedSourceFields: after.sourceFields - before.sourceFields };
  });
  fs.writeFileSync(arg('out'), JSON.stringify({ roots, seeds, policies, rows, comparisons }, null, 2) + '\n');
  if (comparisons.some(x => !x.sameStandardRow || !x.sameWithoutSources || !x.sameDailyWithoutSources)) throw new Error('A campaign changed beyond harvest metadata; inspect saved paired rows.');
  console.log('\nAll paired campaign states match after removing only harvestShares.');
}
main().catch(e => { console.error(e.stack); process.exitCode = 1; });
