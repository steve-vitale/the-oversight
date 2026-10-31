#!/usr/bin/env node
// windowcarry-stdout-runner-b.js — runs windowcarry-driver-b.js with its
// main() replaced by a stdout emitter, WITHOUT writing any new driver
// file (2026-10-31 EPERM-flap workaround: a process that has loaded the
// game cannot reliably write files — verified 2026-10-31: post-sim
// writeFileSync fails EPERM while a fresh process in the same minute
// succeeds — and the driver's own retry loop spins without delay
// because the game's frozen clock makes Atomics.wait return in ~1ms
// instead of the requested timeout, so its 30s sleeps never happen.
// Stdout is a pre-opened fd: the stalled drivers' own log lines prove
// stdout writes keep working post-sim. The caller redirects stdout to
// a .jsonl file (opened by idle bash before node starts) and splits it
// afterwards with an idle process, verifying every line parses.
// Usage: node scripts/windowcarry-stdout-runner-b.js > out.jsonl
// (summaries go to stderr; one JSON line per seed on stdout).
// Env: the same FATAL substrate as windowcarry-driver-b.js.
'use strict';
const fs = require('fs');
const path = require('path');
const Module = require('module');
const driverPath = path.join(__dirname, 'windowcarry-driver-b.js');
let src = fs.readFileSync(driverPath, 'utf8');
const start = src.indexOf('async function main()');
const end = src.indexOf('if (require.main === module) {');
if (start < 0 || end < 0 || end <= start) { console.error('RUNNER: main() not found'); process.exit(2); }
const nm = 'async function main() {\n' +
  '  for (const seed of SEEDS) {\n' +
  '    const inst = await oneInstance(seed);\n' +
  '    process.stdout.write(JSON.stringify(inst) + String.fromCharCode(10));\n' +
  '    console.error(\'windowcarry-\' + ARM + \' seed=\' + seed + \' end=\' + inst.endReason + \' days=\' + inst.daysAlive + \' stdout\');\n' +
  '  }\n' +
  '  console.error(\'wrote \' + SEEDS.length + \' windowcarry-\' + ARM + \' JSON lines to stdout\');\n' +
  '}\n\n';
src = src.slice(0, start) + nm + src.slice(end);
src += '\nmain().catch((e) => { console.error(\'WINDOWCARRY STDOUT RUNNER CRASH\', e && (e.stack || e)); process.exit(2); });\n';
const m = new Module(driverPath, null);
m.filename = driverPath;
m.paths = Module._nodeModulePaths(path.dirname(driverPath));
m._compile(src, driverPath);
