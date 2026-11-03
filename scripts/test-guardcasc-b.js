#!/usr/bin/env node
// test-guardcasc-b.js — proof for scripts/analyze-guardcasc-b.js
// (sim-guardcasc-b, 2026-11-03). Prereg census:
// (a) candidate fixture + 4 controls; (b) 69604 candidate
// verdict reproduced from the ORIGINAL corpus files;
// (c) reused files unmodified. Runs NO new sims.
'use strict';
const assert = require('assert');
const { execSync } = require('child_process');
const path = require('path');
const A = require('./analyze-guardcasc-b');

let pass = 0;
function check(name, fn) {
  try { fn(); pass++; console.log('PASS ' + name); }
  catch (e) { console.log('FAIL ' + name + ': ' + e.message); process.exitCode = 1; }
}
function leg(opts) {
  // Minimal homeconstruct-leg shape: day records 1,5,6,7.
  const haven = { x: 4, y: 4 };
  const day = (loopDay, startPos, startKcal, endPos, endKcal, extra) => Object.assign({
    loopDay, start: { pos: startPos, haven, day: loopDay, kcal: startKcal, hydration: 5 },
    end: { pos: endPos, haven, day: loopDay, kcal: endKcal, hydration: 5 },
    forages: [], hops: [], vetoes: 0, silentVetoes: 0, construct: null, dayEndReturnSim: null,
  }, extra || {});
  const vetoHop = { from: { x: 2, y: 8 }, to: { x: 1, y: 8 }, simOk: false,
    directOk: false, via: null, legs: 4, creditUsed: 0, vetoed: true,
    homeward: false, originSimOk: null, silent: false, shadow: false };
  const days = [
    day(1, { x: 4, y: 4 }, 2190, { x: 4, y: 4 }, 2400),
    day(5, { x: 4, y: 4 }, 1000, { x: 2, y: 8 }, opts.armedEndKcal || 920,
      { vetoes: opts.veto ? 1 : 0, hops: opts.veto ? [vetoHop] : [],
        construct: { kind: 'walkout', startPos: { x: 4, y: 4 } } }),
    day(6, opts.d6StartPos || { x: 2, y: 8 }, opts.d6StartKcal == null ? 234 : opts.d6StartKcal,
      { x: 4, y: 4 }, 1430,
      { construct: { kind: 'attempt', startPos: opts.d6StartPos || { x: 2, y: 8 } } }),
    day(7, { x: 4, y: 4 }, 2180, { x: 4, y: 4 }, 2110),
  ];
  const sayLines = [{ day: 1, seq: 0, line: 'dawn' }];
  if (opts.mantle) sayLines.push({ day: 6, seq: 10, line: 'MANTLE TRANSFER DETECTED.' });
  return { seed: 69604, daysAlive: 30, endReason: 'survived', days, sayLines,
    deaths: opts.deaths || [] };
}
const playerDeath6 = [{ day: 6, kind: 'villager', who: 'gen_x', cause: 'the wild', player: true }];
const succStart = { x: 4, y: 4 };

check('candidate positive (veto d5, player death d6, shadow alive, successor sig)', () => {
  const s = leg({});
  const a = leg({ veto: true, deaths: playerDeath6, d6StartPos: succStart, d6StartKcal: 1500, mantle: true });
  const out = A.analyze(s, a, [5, 6]);
  assert.strictEqual(out.candidate, true);
  assert.strictEqual(out.candidateDetail[0].vetoDay, 5);
});
check('control: shadow also dies in window -> not candidate', () => {
  const s = leg({ deaths: playerDeath6 });
  const a = leg({ veto: true, deaths: playerDeath6, d6StartPos: succStart, d6StartKcal: 1500, mantle: true });
  assert.strictEqual(A.analyze(s, a, [5, 6]).candidate, false);
});
check('control: death but no veto -> not candidate', () => {
  const s = leg({});
  const a = leg({ deaths: playerDeath6, d6StartPos: succStart, d6StartKcal: 1500, mantle: true });
  assert.strictEqual(A.analyze(s, a, [5, 6]).candidate, false);
});
check('control: death outside window (day 9) -> not candidate', () => {
  const s = leg({});
  const a = leg({ veto: true, deaths: [{ day: 9, kind: 'villager', who: 'gen_x', cause: 'the wild', player: true }],
    d6StartPos: succStart, d6StartKcal: 1500, mantle: true });
  assert.strictEqual(A.analyze(s, a, [5, 6]).candidate, false);
});
check('control: no successor signature -> not candidate', () => {
  const s = leg({});
  const a = leg({ veto: true, deaths: playerDeath6 }); // d6 start stays (2,8)/234, no mantle line
  assert.strictEqual(A.analyze(s, a, [5, 6]).candidate, false);
});
check('day-1 identity: identical -> ok, tampered kcal -> not ok', () => {
  const s = leg({});
  const a = leg({ veto: true });
  assert.strictEqual(A.sameDay1(s, a).ok, true);
  const b = leg({ veto: true });
  b.days[0].end.kcal = 9999;
  assert.strictEqual(A.sameDay1(s, b).ok, false);
});
check('original corpus 69604 pair -> candidate true', () => {
  const root = path.join(__dirname, '..');
  const s = A.loadPair(path.join(root, 'evidence/2026-11-02/sim-homewardac-b-pilotC-shadow.jsonl'), 69604);
  const a = A.loadPair(path.join(root, 'evidence/2026-11-02/sim-homewardac-b-pilotC-armed.jsonl'), 69604);
  const out = A.analyze(s, a, [5, 6]);
  assert.strictEqual(out.candidate, true);
  assert.strictEqual(out.day1.ok, true);
  assert.strictEqual(out.armed.playerDeaths.length, 2); // day 6 wild + day 28 arena
  assert.deepStrictEqual(out.armed.playerDeaths[0], { day: 6, kind: 'villager', who: 'gen_5rd3jnj', cause: 'the wild' });
});
check('original corpus 69604 first day-5 divergence at index 60, armed line is the veto', () => {
  const root = path.join(__dirname, '..');
  const s = A.loadPair(path.join(root, 'evidence/2026-11-02/sim-homewardac-b-pilotC-shadow.jsonl'), 69604);
  const a = A.loadPair(path.join(root, 'evidence/2026-11-02/sim-homewardac-b-pilotC-armed.jsonl'), 69604);
  const d = A.firstDivergence(s, a, 5);
  assert.strictEqual(d.index, 60);
  assert.ok(/don't walk there/i.test(d.armed), 'armed divergence line is the veto line, got: ' + d.armed);
});
check('reproLevels trivial identity on original pair -> reproYes', () => {
  const root = path.join(__dirname, '..');
  const s = A.loadPair(path.join(root, 'evidence/2026-11-02/sim-homewardac-b-pilotC-shadow.jsonl'), 69604);
  const a = A.loadPair(path.join(root, 'evidence/2026-11-02/sim-homewardac-b-pilotC-armed.jsonl'), 69604);
  const r = A.reproLevels(s, a, s, a, [5, 6]);
  assert.strictEqual(r.rShadow, true);
  assert.strictEqual(r.rVeto, true);
  assert.strictEqual(r.rOutcome, true);
  assert.strictEqual(r.reproYes, true);
});
check('reused files unmodified vs HEAD', () => {
  const root = path.join(__dirname, '..');
  const files = ['scripts/policies/competent-homewardconstruct-b.js',
    'scripts/homeconstruct-b-driver.js',
    'scripts/policies/competent-homewardstep-b.js',
    'scripts/policies/competent.js'];
  const st = execSync('git status --porcelain --untracked-files=no -- ' + files.join(' '),
    { cwd: root }).toString().trim();
  assert.strictEqual(st, '', 'worktree changes in reused files: ' + st);
  const df = execSync('git diff HEAD -- ' + files.join(' '), { cwd: root }).toString().trim();
  assert.strictEqual(df, '', 'HEAD diff in reused files');
});

check('trace driver: 7d armed 69604 reports daily/sleep boundaries + detects a bearer change', () => {
  const root = path.join(__dirname, '..');
  const env = Object.assign({}, process.env, { COMPETENT_FEAST: '0', SEATDRIVE: '0',
    PLENTYDEPRI: '0', DEPOSITGATE: '0', POLICY: 'construct-armed', SEEDS: '69604',
    TRACE_DAYS: '7', CONSTRUCT_SHAPE: 'C' });
  const out = execSync('node scripts/guardcasc-b-trace-driver.js', { cwd: root, env }).toString();
  const lines = out.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
  for (let ld = 1; ld <= 7; ld++) {
    assert.ok(lines.some((l) => l.type === 'daily-entry' && l.loopDay === ld), 'missing daily-entry ' + ld);
    assert.ok(lines.some((l) => l.type === 'daily-exit' && l.loopDay === ld), 'missing daily-exit ' + ld);
  }
  assert.ok(lines.some((l) => l.type === 'sleep-entry'), 'missing sleep-entry');
  assert.ok(lines.some((l) => l.type === 'sleep-exit'), 'missing sleep-exit');
  for (const l of lines) {
    if (l.type === 'summary') continue;
    assert.ok('bearer' in l && 'pos' in l && 'kcal' in l && 'day' in l, 'identity fields missing on ' + l.type);
  }
  // Bearer-change detection: walk the boundary-ordered identity
  // events and require at least one bearer change (the known
  // day-6 succession); print where it happens for the log.
  const order = [];
  for (const l of lines) {
    if (l.type === 'daily-entry' || l.type === 'daily-exit' || l.type === 'sleep-entry' || l.type === 'sleep-exit') {
      order.push(l.type + '@loop' + l.loopDay + ':' + l.bearer + ':' + (l.name || '?') +
        '@(' + l.pos.x + ',' + l.pos.y + ')/' + l.kcal + '/day' + l.day);
    }
  }
  let changes = 0;
  for (let i = 1; i < order.length; i++) {
    const prev = order[i - 1].split(':')[1], cur = order[i].split(':')[1];
    if (prev !== cur) { changes++; console.log('  bearer change: ' + order[i - 1] + ' -> ' + order[i]); }
  }
  assert.ok(changes >= 1, 'trace driver detected no bearer change; order: ' + order.join(' | '));
  const summary = lines.find((l) => l.type === 'summary');
  assert.ok(summary && summary.playerDeaths.some((d) => d.day === 6 && d.cause === 'the wild'),
    'summary lacks day-6 wild player death');
});

console.log('test-guardcasc-b: ' + pass + ' checks passed');
