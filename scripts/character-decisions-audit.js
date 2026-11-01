#!/usr/bin/env node
'use strict';

// Full natural campaigns, each paired with an observer-free exact control.
// node scripts/character-decisions-audit.js --out evidence/<date>/<unique-dir>
// Optional --cases <JSON array> --days 3000 --jobs 2. Separate processes only.
const fs = require('fs'), path = require('path'), cp = require('child_process');
const zlib = require('zlib'), assert = require('assert/strict'), crypto = require('crypto');
const { install } = require('./character-decisions-observer');
const defaults = [
  { policy: 'capable', seed: 42 }, { policy: 'maker', seed: 5 },
  { policy: 'merchant', seed: 7 }, { policy: 'caregiver', seed: 9 },
  { policy: 'maker', seed: 31337, region: 'africa_sahel_savanna', origin: 'Dakar, Senegal' },
];
if (process.env.CHARACTER_DECISIONS_TRACE) {
  const H = require('./sim-harness'), original = H.loadGame;
  let observer;
  H.loadGame = async function (...args) {
    const result = await original.apply(this, args);
    observer = install(result.Game);
    return result;
  };
  process.on('exit', () => {
    if (observer) fs.writeFileSync(process.env.CHARACTER_DECISIONS_TRACE,
      zlib.gzipSync(JSON.stringify(observer.report())), { flag: 'wx' });
  });
} else if (require.main === module) main().catch(e => { console.error(e.stack); process.exitCode = 1; });

async function main() {
  const args = process.argv.slice(2), options = {};
  while (args.length) {
    const key = args.shift();
    assert(['--out', '--cases', '--days', '--jobs'].includes(key), 'Unknown option: ' + key);
    assert(args.length, 'Missing value: ' + key);
    options[key.slice(2)] = args.shift();
  }
  const output = options.out && path.resolve(options.out);
  assert(output && !fs.existsSync(output), '--out must name a fresh directory');
  const jobs = options.cases ? JSON.parse(fs.readFileSync(options.cases, 'utf8')) : defaults;
  assert(Array.isArray(jobs) && jobs.length, 'Cases must be a nonempty array');
  for (const job of jobs) {
    assert(typeof job.policy === 'string' && Number.isSafeInteger(job.seed), 'Each case needs policy and integer seed');
    for (const key of ['region', 'origin']) assert(job[key] == null || typeof job[key] === 'string', key);
  }
  const days = Number(options.days || 3000), workers = Number(options.jobs || 2);
  assert(Number.isSafeInteger(days) && days > 0, 'days must be a positive integer');
  assert(Number.isSafeInteger(workers) && workers >= 1 && workers <= 4, 'jobs must be 1..4');
  const B = require('./balance-panel'), root = process.cwd();
  function source() {
    const result = B.manifest(root);
    for (const name of ['scripts/character-decisions-audit.js', 'scripts/character-decisions-observer.js', 'scripts/balance-panel.js'])
      result[name] = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, name), 'utf8').replace(/\r\n/g, '\n')).digest('hex');
    return result;
  }
  const sources = source(), cases = [];
  fs.mkdirSync(output, { recursive: true });
  const write = (name, data) => fs.writeFileSync(path.join(output, name), data, { flag: 'wx' });
  const pack = data => zlib.gzipSync(JSON.stringify(data));
  let next = 0;
  async function worker() {
    while (next < jobs.length) {
      const index = next++, job = jobs[index], name = 'case-' + index;
      const file = path.join(output, name + '-decisions.json.gz');
      const childArgs = [path.join(root, 'scripts/balance-panel.js'), '--child', '--root', root,
        '--policy', job.policy, '--seed', String(job.seed), '--observe', '1', '--days', String(days),
        '--origin', job.origin || 'Columbus, Ohio', ...(job.region ? ['--region', job.region] : [])];
      const results = [];
      for (const observed of [true, false]) {
        const result = await new Promise((resolve, reject) => {
          const env = { ...process.env };
          delete env.CHARACTER_DECISIONS_TRACE;
          if (observed) env.CHARACTER_DECISIONS_TRACE = file;
          const child = cp.spawn(process.execPath, observed ? ['-r', __filename, ...childArgs] : childArgs, { cwd: root, env });
          let stdout = '', stderr = '';
          child.stdout.on('data', b => { stdout += b; });
          child.stderr.on('data', b => { stderr += b; });
          child.on('error', reject);
          child.on('close', code => {
            write(name + (observed ? '-observed' : '-control') + '.log.gz', zlib.gzipSync(stderr + '\n' + stdout));
            try {
              assert.equal(code, 0, stderr || stdout.slice(-900));
              resolve(JSON.parse(stdout.split('@@BALANCE@@').pop()));
            } catch (e) { reject(e); }
          });
        });
        results.push(result);
      }
      for (const key of ['row', 'metrics', 'stateHash']) assert.deepEqual(results[0][key], results[1][key], name + '/' + key);
      for (const result of results) {
        assert.deepEqual(result.warnings, []);
        assert.deepEqual(result.observerErrors, []);
      }
      const trace = JSON.parse(zlib.gunzipSync(fs.readFileSync(file)));
      assert.deepEqual(trace.errors, []);
      const summary = { ...job, index, exactNeutral: true, stop: results[0].row.stop,
        bodies: trace.bodies.length, handoffs: trace.handoffs.length,
        zeroQueriedSuccessors: trace.bodies.slice(1).filter(b => !Object.keys(b.opportunities).length).map(b => b.bearer) };
      write(name + '-result.json.gz', pack(results[0]));
      cases.push(summary);
      console.log(JSON.stringify(summary));
    }
  }
  await Promise.all(Array.from({ length: workers }, worker));
  assert.deepEqual(source(), sources, 'Source changed during audit');
  write('receipt.json', JSON.stringify({ version: 1, sources, configuration: { days, workers, jobs },
    scope: 'Diagnostic campaigns, not a balance comparison or pacifist-viability verdict. Capped runs remain capped.',
    cases: cases.sort((a, b) => a.index - b.index) }, null, 2) + '\n');
}
