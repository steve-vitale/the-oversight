#!/usr/bin/env node
'use strict';
// telemetry-check recorder-corpus guard + baseline metadata preservation
// (measurement audit 2026-10-25). Spawns the CLI against temp fixtures;
// writes nothing into the repo.
const fs = require('fs'), os = require('os'), path = require('path'),
  cp = require('child_process'),
  K = require('./lib'), T = K.reporter('telemetry-check recorder guard'),
  tool = path.join(__dirname, '..', 'telemetry-check.js');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'telemetry-check-guard-'));
const write = (name, obj) => {
  const f = path.join(dir, name);
  fs.writeFileSync(f, JSON.stringify(obj) + '\n');
  return f;
};
function run(args) {
  const r = cp.spawnSync(process.execPath, [tool, ...args], { encoding: 'utf8' });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') };
}
const baseline = write('base.json', { national: 12, table: 16, wins: 16 });
const recA = write('rec-a.json', { anchorCommit: 'a'.repeat(40), national: true, table: false, wins: false });
const recB = write('rec-b.json', { anchorCommit: 'b'.repeat(40), national: true, table: false, wins: false });
const runA = write('run-a.json', { national: true, table: true, wins: true });
const metrics = ['national', 'table', 'wins'];

let r = run(['--baseline', baseline, '--current', path.join(dir, 'rec-*.json'), '--metrics', metrics.join(',')]);
T.ok('recorder-corpus input is refused, not LOUD', r.code === 2 && /recorder-corpus/.test(r.out) && !/^LOUD/m.test(r.out));
T.ok('refusal names the override flag', /--allow-recorder-corpus/.test(r.out));

r = run(['--baseline', baseline, '--current', path.join(dir, 'rec-*.json'), '--metrics', metrics.join(','), '--allow-recorder-corpus']);
T.ok('override flag lets the compare proceed (no refusal exit)', r.code !== 2);

const outBase = path.join(dir, 'rolled.json');
r = run(['--baseline', baseline, '--current', path.join(dir, 'rec-*.json'), '--metrics', metrics.join(','), '--update-baseline', outBase]);
T.ok('update-baseline bypasses the refusal and writes', r.code !== 2 && fs.existsSync(outBase));

const labeled = write('labeled.json', { _regime: { label: 'winseat' }, national: 12, table: 16, wins: 16 });
const rolled = path.join(dir, 'rolled2.json');
r = run(['--baseline', labeled, '--current', runA, '--metrics', metrics.join(','), '--update-baseline', rolled]);
const rolledObj = JSON.parse(fs.readFileSync(rolled, 'utf8'));
T.ok('rolling a baseline preserves underscore metadata', rolledObj._regime && rolledObj._regime.label === 'winseat' && rolledObj.national === 1);

r = run(['--baseline', baseline, '--current', runA, '--metrics', metrics.join(',')]);
T.ok('ordinary run files still compare (no refusal)', r.code !== 2);

const mixed = write('mixed.json', { national: true, table: true, wins: true });
r = run(['--baseline', baseline, '--current', path.join(dir, 'rec-a.json'), '--metrics', metrics.join(',')]);
// Single recorder file alone still triggers the guard (all files stamped).
T.ok('single recorder file is refused', r.code === 2);
// Mixed input: one recorder file + one plain run file -> guard does not fire.
const mixDir = path.join(dir, 'mixed');
fs.mkdirSync(mixDir);
fs.writeFileSync(path.join(mixDir, 'rec-m.json'), JSON.stringify({ anchorCommit: 'c'.repeat(40), national: true }) + '\n');
fs.writeFileSync(path.join(mixDir, 'run-m.json'), JSON.stringify({ national: true }) + '\n');
const mixedGlob = run(['--baseline', baseline, '--current', path.join(mixDir, '*.json'), '--metrics', metrics.join(',')]);
T.ok('mixed input does not trigger the guard', mixedGlob.code !== 2);
void mixed;

fs.rmSync(dir, { recursive: true, force: true });
T.done();
