#!/usr/bin/env node
// test-pilot-gate.js — proof for scripts/pilot-gate.js + the runner pattern
// (gap line 888). Spawns the gate CLI on temp report dirs (never on live
// evidence) and asserts: NO-GO report => REFUSED (exit 3); GO-only report
// => ALLOWED (exit 0); no verdict on file => REFUSED (exit 2); a NO-GO
// anywhere refuses even when GO reports also exist. Also proves the
// run-sweep-gated.sh wrapper refuses to execute its command under NO-GO.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname);
function runGate(dir, extra) {
  return spawnSync(process.execPath, [path.join(ROOT, 'pilot-gate.js'), '--report', dir].concat(extra || []), { encoding: 'utf8' });
}
function tmpDir() { return fs.mkdtempSync(path.join(os.tmpdir(), 'pilot-gate-')); }
function write(dir, name, obj) { fs.writeFileSync(path.join(dir, name), JSON.stringify(obj)); }

const dNoGo = tmpDir(); write(dNoGo, 'analyzer.json', { verdict: 'NO-GO', reason: 'pilot failed' });
const r1 = runGate(dNoGo);
assert.strictEqual(r1.status, 3, '888 NO-GO refused, got exit ' + r1.status + ': ' + r1.stdout);
console.log('PASS 888 confirm REFUSED after NO-GO report (exit 3): ' + r1.stdout.trim());

const dGo = tmpDir(); write(dGo, 'analyzer.json', { verdict: 'GO' });
const r2 = runGate(dGo);
assert.strictEqual(r2.status, 0, '888 GO allowed, got exit ' + r2.status);
console.log('PASS 888 confirm ALLOWED with GO-only report (exit 0): ' + r2.stdout.trim());

const dMixed = tmpDir(); write(dMixed, 'a.json', { verdict: 'GO' }); write(dMixed, 'b.json', { verdict: 'NO-GO' });
const r3 = runGate(dMixed);
assert.strictEqual(r3.status, 3, '888 one NO-GO among GOs still refuses');
console.log('PASS 888 NO-GO wins over GO reports (exit 3)');

const dEmpty = tmpDir();
const r4 = runGate(dEmpty);
assert.strictEqual(r4.status, 2, '888 missing verdict refused, got exit ' + r4.status);
console.log('PASS 888 missing verdict REFUSED (exit 2): ' + r4.stdout.trim());
const r4b = runGate(dEmpty, ['--allow-missing']);
assert.strictEqual(r4b.status, 0, '888 --allow-missing deliberately allows');
console.log('PASS 888 --allow-missing deliberately allows (exit 0)');

// Wrapper: command must NOT execute under NO-GO, must execute under GO.
const marker = path.join(tmpDir(), 'ran.txt');
const w1 = spawnSync('bash', [path.join(ROOT, 'run-sweep-gated.sh'), dNoGo, '--', 'touch', marker], { encoding: 'utf8' });
assert.notStrictEqual(w1.status, 0, '888 wrapper refuses under NO-GO');
assert.strictEqual(fs.existsSync(marker), false, '888 wrapped command did NOT run under NO-GO');
console.log('PASS 888 wrapper refused and command did not run under NO-GO');
const w2 = spawnSync('bash', [path.join(ROOT, 'run-sweep-gated.sh'), dGo, '--', 'touch', marker], { encoding: 'utf8' });
assert.strictEqual(w2.status, 0, '888 wrapper allows under GO, got ' + w2.status);
assert.strictEqual(fs.existsSync(marker), true, '888 wrapped command ran under GO');
console.log('PASS 888 wrapper allowed and command ran under GO');

// Runner-snippet proof: extract the ACTUAL gate block from run-pdvalue-b.sh
// (not a copy) into a temp dir with a fake pilot-gate.js, and prove the
// file's own logic refuses confirm seeds and passes pilot-only seeds.
{
  const { execSync } = require('child_process');
  const runner = fs.readFileSync(path.join(ROOT, 'run-pdvalue-b.sh'), 'utf8');
  const start = runner.indexOf('# PILOT GATE');
  const end = runner.indexOf('esac', start) + 'esac'.length;
  assert.ok(start >= 0 && end > start, '888 gate block present in run-pdvalue-b.sh');
  const block = runner.slice(start, end);
  const tdir = tmpDir();
  fs.writeFileSync(path.join(tdir, 'gate-block.sh'), block + '\necho "GATE-BLOCK-DONE"\n');
  fs.writeFileSync(path.join(tdir, 'pilot-gate.js'),
    'console.log("FAKE-GATE-CALLED"); process.exit(parseInt(process.env.FAKE_GATE_EXIT || "0", 10));\n');
  const runBlock = (seeds, fakeExit) => spawnSync('bash', [path.join(tdir, 'gate-block.sh')], {
    encoding: 'utf8',
    env: Object.assign({}, process.env, { SEEDS: seeds, PILOT_GATE_REPORT: dGo, FAKE_GATE_EXIT: String(fakeExit) }),
  });
  const b1 = runBlock('94001,94011', 3);
  assert.notStrictEqual(b1.status, 0, '888 runner block refuses confirm seeds when gate fails');
  assert.ok(b1.stdout.includes('FAKE-GATE-CALLED'), '888 runner block actually invoked the gate');
  const b2 = runBlock('94001,94002', 3);
  assert.strictEqual(b2.status, 0, '888 runner block passes pilot-only seeds without gating');
  assert.ok(!b2.stdout.includes('FAKE-GATE-CALLED'), '888 runner block does not gate pilot-only seeds');
  console.log('PASS 888 run-pdvalue-b.sh gate block (verbatim): refuses confirm, passes pilot-only');
}

console.log('ALL PILOT-GATE PROOFS PASS');
