#!/usr/bin/env node
// Reproduce the false proof that left the old god verbs disconnected.
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const { spawnSync } = require('child_process');
const K = require('./godpath/lib'), T = K.reporter('wiring-guard');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'oversight-wiring-'));
try {
  fs.mkdirSync(path.join(dir, 'src/js'), { recursive: true }); fs.mkdirSync(path.join(dir, 'src/data'));
  fs.writeFileSync(path.join(dir, 'index.html'), '');
  fs.writeFileSync(path.join(dir, 'src/js/power.js'), '// provides: raiseEcho\nfunction raiseEcho() { return 1; }\nS.Godhood = { raiseEcho };\n');
  fs.writeFileSync(path.join(dir, 'src/js/consumer.js'), '// TODO: call raiseEcho here.\n');
  const run = () => spawnSync(process.execPath, [path.join(__dirname, 'check-wired.js'), '--strict', 'src/js/power.js'], { env: { ...process.env, CHECK_WIRED_ROOT: dir }, encoding: 'utf8' });
  let r = run();
  T.ok('exports and comments cannot pretend an unwired power is used', r.status === 1 && /UNWIRED raiseEcho/.test(r.stdout), r.stdout + r.stderr);
  fs.writeFileSync(path.join(dir, 'src/js/consumer.js'), 'S.Godhood.raiseEcho();\n');
  r = run();
  T.ok('a real call clears the same guard', r.status === 0 && /0 unwired/.test(r.stdout), r.stdout + r.stderr);
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
T.done();
