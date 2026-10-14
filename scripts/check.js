#!/usr/bin/env node
// scripts/check.js — the ONE command to run before every commit.
//
//   node scripts/check.js            # full: god-path checks + whole green list
//   node scripts/check.js --quick    # fast loop: god-path checks + `quick` tests
//   node scripts/check.js --only foodpower   # anything whose path contains it
//   node scripts/check.js --jobs 4   # parallelism (default: min(cpus, 8))
//
// What runs, in order:
//   1. scripts/godpath/validate.js   (data contract, <1s)
//   2. scripts/godpath/ladder.js     (runtime contract, ~1s)
//   3. scripts/godpath/test-*.js     (your proof tests for god-path work)
//   4. scripts/green-list.txt        (tests that passed on 2026-10-14 and
//                                     must KEEP passing — regression net)
//   + check-wired on src/js/godpath.js (warning only)
//
// Exit 1 if anything in 1–4 fails. A test "fails" if it exits non-zero or
// times out. Output: one line per failure + the tail of its log.
//
// Green list policy (see AGENTS.md): if a green-list test breaks because the
// DESIGN changed on purpose, update or delete that test in the same commit
// and say so in the message. Never "fix" it by loosening the assertion to
// pass. If it breaks for a reason you can't fix quickly and it's not
// critical, move it to scripts/green-list-quarantine.txt with a one-line
// reason — that's allowed (iteration speed > perfection), silent breakage
// is not.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const argv = process.argv.slice(2);
const flag = (f) => argv.includes(f);
const val = (f, d) => { const i = argv.indexOf(f); return i >= 0 ? argv[i + 1] : d; };
const QUICK = flag('--quick');
const ONLY = val('--only', null);
const JOBS = Number(val('--jobs', Math.min(os.cpus().length, 8)));
const TIMEOUT_MS = Number(val('--timeout', 120)) * 1000;

function readList(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return [];
  return fs.readFileSync(p, 'utf8').split('\n')
    .map(l => l.replace(/#.*/, '').trim()).filter(Boolean)
    .map(l => { const [file, ...tags] = l.split(/\s+/); return { file, tags }; });
}

const godpathTests = fs.existsSync(path.join(ROOT, 'scripts/godpath'))
  ? fs.readdirSync(path.join(ROOT, 'scripts/godpath')).filter(f => /^test-.*\.js$/.test(f)).sort()
    .map(f => ({ file: 'scripts/godpath/' + f, tags: ['quick'] }))
  : [];
const quarantined = new Set(readList('scripts/green-list-quarantine.txt').map(t => t.file));
let jobs = [
  { file: 'scripts/godpath/validate.js', tags: ['quick'] },
  { file: 'scripts/godpath/ladder.js', tags: ['quick'] },
  ...godpathTests,
  ...readList('scripts/green-list.txt').filter(t => !quarantined.has(t.file)),
];
if (QUICK) jobs = jobs.filter(j => j.tags.includes('quick'));
if (ONLY) jobs = jobs.filter(j => j.file.includes(ONLY));
const missing = jobs.filter(j => !fs.existsSync(path.join(ROOT, j.file)));
jobs = jobs.filter(j => fs.existsSync(path.join(ROOT, j.file)));

function run(job) {
  return new Promise(resolve => {
    const t0 = Date.now();
    let out = '';
    const child = spawn(process.execPath, [job.file], { cwd: ROOT, env: process.env });
    child.stdout.on('data', d => { out += d; if (out.length > 200000) out = out.slice(-100000); });
    child.stderr.on('data', d => { out += d; if (out.length > 200000) out = out.slice(-100000); });
    const timer = setTimeout(() => { out += `\n[check.js] TIMEOUT after ${TIMEOUT_MS / 1000}s`; child.kill('SIGKILL'); }, TIMEOUT_MS);
    child.on('close', code => {
      clearTimeout(timer);
      resolve({ job, code, ms: Date.now() - t0, out });
    });
  });
}

(async () => {
  const t0 = Date.now();
  console.log(`check.js: ${jobs.length} scripts, ${JOBS} parallel${QUICK ? ' (quick)' : ''}${ONLY ? ` (only "${ONLY}")` : ''}`);
  for (const m of missing) console.log(`  WARN listed but missing: ${m.file}`);
  const results = [];
  let next = 0;
  await Promise.all(Array.from({ length: Math.max(1, JOBS) }, async () => {
    while (next < jobs.length) {
      const j = jobs[next++];
      const r = await run(j);
      results.push(r);
      process.stdout.write(r.code === 0 ? '.' : 'F');
    }
  }));
  process.stdout.write('\n');

  const failed = results.filter(r => r.code !== 0);
  for (const r of failed) {
    const tail = r.out.trim().split('\n').slice(-12).map(l => '      ' + l.slice(0, 200)).join('\n');
    console.log(`\n  FAIL ${r.job.file} (exit ${r.code}, ${(r.ms / 1000).toFixed(1)}s)\n${tail}`);
  }
  const slow = results.filter(r => r.ms > 30000).sort((a, b) => b.ms - a.ms).slice(0, 3);
  if (slow.length) console.log('\n  slowest: ' + slow.map(r => `${r.job.file} ${(r.ms / 1000).toFixed(0)}s`).join(', '));

  // Wiring warning for the god-path module (never fails the run).
  const gp = path.join(ROOT, 'src/js/godpath.js');
  if (fs.existsSync(gp) && !ONLY) {
    const w = spawnSync(process.execPath, ['scripts/check-wired.js', 'src/js/godpath.js'], { cwd: ROOT, encoding: 'utf8' });
    const lines = (w.stdout || '').split('\n').filter(l => /UNWIRED/.test(l));
    if (lines.length) console.log('\n  WARN functions in src/js/godpath.js with no caller (wire them or mark `// wired-exempt: why`):\n' + lines.join('\n'));
  }

  console.log(`\ncheck.js: ${results.length - failed.length} passed, ${failed.length} failed in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  process.exitCode = failed.length ? 1 : 0;
})();
