#!/usr/bin/env node
// strandbank-stdout-runner-b.js — runs morningcarry-trace-b.js with its
// main() replaced by a stdout emitter, WITHOUT editing the driver.
// (sim-strandbank-b; prereg-bound adaptation: a process that has loaded
// the game cannot reliably write files under the container EPERM flap,
// and the driver's frozen-clock sleeps never elapse, so its retry loop
// spins. Stdout is a pre-opened fd. The caller redirects stdout to a
// .jsonl file in evidence/ (opened by idle bash before node starts)
// and splits it afterwards with an idle process, verifying every line
// parses. Summaries go to stderr; one JSON line per seed on stdout.
// Usage: node scripts/strandbank-stdout-runner-b.js > out.jsonl
// Env: the same FATAL substrate as morningcarry-trace-b.js.)
'use strict';
const fs = require('fs');
const path = require('path');
const Module = require('module');
const driverPath = path.join(__dirname, 'morningcarry-trace-b.js');
let src = fs.readFileSync(driverPath, 'utf8');
const start = src.indexOf('async function main()');
const end = src.indexOf('if (require.main === module) {');
if (start < 0 || end < 0 || end <= start) { console.error('RUNNER: main() not found'); process.exit(2); }
const nm = 'async function main() {\n' +
  '  for (const seed of SEEDS) {\n' +
  '    const inst = await oneInstance(seed);\n' +
  '    process.stdout.write(JSON.stringify(inst) + String.fromCharCode(10));\n' +
  '    console.error(\'strandbank seed=\' + seed + \' end=\' + inst.endReason + \' days=\' + inst.daysAlive + \' evenings=\' + inst.evenings.length + \' mornings=\' + inst.mornings.length + \' nights=\' + inst.nights.length + \' errs=\' + inst.errCount + \' stdout\');\n' +
  '  }\n' +
  '  console.error(\'wrote \' + SEEDS.length + \' strandbank JSON lines to stdout\');\n' +
  '}\n\n';
src = src.slice(0, start) + nm + src.slice(end);
src += '\nmain().catch((e) => { console.error(\'STRANDBANK STDOUT RUNNER CRASH\', e && (e.stack || e)); process.exit(2); });\n';
const m = new Module(driverPath, null);
m.filename = driverPath;
m.paths = Module._nodeModulePaths(path.dirname(driverPath));
m._compile(src, driverPath);
