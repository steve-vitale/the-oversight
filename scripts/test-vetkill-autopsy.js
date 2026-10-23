#!/usr/bin/env node
// test-vetkill-autopsy.js — proof for the vetkill-autopsy DIAG instruments
// (flesh-out loop arm sim-vetkill-autopsy, axis scale-onramp, run
// fleshout-20261023T1115Z). The DIAG claim: the corpus join (waveKillLog
// `by` vids -> per-villager death rows) attributes >=90% of wave-4+ killer
// deaths to named cause classes, honestly (unmapped causes count as 'other'
// and are listed, never invented).
//
// E1 RED->GREEN: fixtures over attributeCorpus.
//    RED: a per-seed JSON with NO waveKillLog sensor (the retained-corpus
//         granularity gap) -> sensor-failure error recorded, zero kills
//         claimed, diagGo=false (no invented attribution).
//    GREEN: synthetic 2-config corpus with wave-4+ kills by vids X/Y/Z and
//         death rows -> exact expected cause table + ranked shares.
// E2 DET: attributeCorpus is byte-identical across runs on the same corpus.
// E3 env guard: vetkill-autopsy-sweep.js exits 2 with SWEEP STOP when the
//    pinned substrate env is missing (fast, no sim).
// E4 classifyDeathCause unit cases: named classes map, unknowns land in
//    'other' with the raw cause in `why`.
'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const A = require(path.join(REPO, 'scripts', 'vetkill-autopsy-analyze'));

let pass = 0;
function ok(name, fn) { try { fn(); pass++; console.log('ok - ' + name); } catch (e) { console.error('FAIL - ' + name + ': ' + (e && e.message)); process.exitCode = 1; } }

function tmpCorpus() { const d = fs.mkdtempSync(path.join(os.tmpdir(), 'vetkill-autopsy-test-')); return d; }
function writeSeed(dir, arm, seed, obj) {
  const ad = path.join(dir, arm); fs.mkdirSync(ad, { recursive: true });
  fs.writeFileSync(path.join(ad, `s${seed}.json`), JSON.stringify(obj) + '\n');
}

// ---- E1 RED: missing waveKillLog sensor -> loud failure, no invention ----
ok('E1-RED missing waveKillLog sensor fails loud, claims nothing', () => {
  const dir = tmpCorpus();
  writeSeed(dir, 'lead', 65511, { seed: 65511, arm: 'lead', deathRows: [{ day: 40, who: 'gen_x', kind: 'villager', cause: 'combat', wave: 5, real: true }] });
  const a = A.attributeCorpus(dir);
  assert.strictEqual(a.totalW4Kills, 0, 'zero kills claimed');
  assert.strictEqual(a.nKillerDeaths, 0, 'zero killer deaths claimed');
  assert.strictEqual(a.diagGo, false, 'diagGo false');
  assert.ok(a.instrumentErrors.length >= 1 && /missing waveKillLog/.test(a.instrumentErrors[0]), 'sensor failure recorded');
});

// ---- E1 GREEN: synthetic corpus -> exact expected table ----
function greenFixture(dir) {
  writeSeed(dir, 'lead', 65511, {
    seed: 65511, arm: 'lead', scholarVid: 'gen_scholar1',
    waveKillLog: [
      { d: 60, mid: 'redactor', w: 4, by: 'gen_x', via: 'player' },
      { d: 63, mid: 'gavel', w: 4, by: 'gen_x', via: 'companion' },
      { d: 70, mid: 'hushwolf', w: 1, by: 'gen_x', via: 'wild' }, // wave-1: not a veteran-forming kill
    ],
    deathRows: [
      { day: 63, who: 'gen_x', kind: 'villager', cause: 'combat', wave: 5, real: true, player: false },
      { day: 30, who: 'lockpick_raccoon', kind: 'monster', cause: 'villager combat', wave: 1, real: true },
    ],
  });
  writeSeed(dir, 'belong', 65512, {
    seed: 65512, arm: 'belong', scholarVid: 'gen_scholar2',
    waveKillLog: [
      { d: 80, mid: 'spool', w: 4, by: 'gen_y', via: 'sortie' },
      { d: 90, mid: 'chorus_line', w: 4, by: 'gen_z', via: 'patrol' },
    ],
    deathRows: [
      { day: 95, who: 'gen_y', kind: 'villager', cause: 'starvation', wave: null, real: true, player: false },
      // gen_z: no death row -> survived
    ],
  });
}
ok('E1-GREEN synthetic corpus attributes exactly', () => {
  const dir = tmpCorpus();
  greenFixture(dir);
  const a = A.attributeCorpus(dir);
  assert.strictEqual(a.total, 2, '2 configs');
  assert.strictEqual(a.totalW4Kills, 4, '4 wave-4+ kills');
  assert.strictEqual(a.distinctKillerVids, 3, 'X, Y, Z');
  assert.strictEqual(a.nKillerDeaths, 2, 'X and Y died');
  assert.strictEqual(a.nSurvived, 1, 'Z survived');
  const det = {};
  for (const r of a.detail) det[r.vid] = r;
  assert.strictEqual(det.gen_x.cls, 'combat-vs-wave-4', 'X died in combat vs wave-5');
  assert.strictEqual(det.gen_x.sameDayAsKill, true, 'X died same day as second kill');
  assert.strictEqual(det.gen_y.cls, 'starvation', 'Y starved');
  const rk = {};
  for (const r of a.ranked) rk[r.cls] = r;
  assert.strictEqual(rk['combat-vs-wave-4'].n, 1);
  assert.strictEqual(rk['starvation'].n, 1);
  assert.strictEqual(rk['starvation'].share, 50);
  assert.strictEqual(a.attributionRate, 100);
  assert.strictEqual(a.diagGo, true, 'DIAG-GO passes on fixtures');
  assert.strictEqual(a.neverFormedConfigs, 0);
});

// ---- E2 DET: byte-identical re-run ----
ok('E2-DET analyzer byte-identical on re-run', () => {
  const dir = tmpCorpus();
  greenFixture(dir);
  const a = JSON.stringify(A.attributeCorpus(dir));
  const b = JSON.stringify(A.attributeCorpus(dir));
  assert.strictEqual(a, b, 'identical bytes');
});

// ---- E3 env guard ----
ok('E3 env guard: sweep refuses without pinned substrate', () => {
  const clean = Object.assign({}, process.env);
  for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'KILLDISC', 'ARMORYDRIVE']) delete clean[k];
  let code = null, stderr = '';
  try {
    execFileSync(process.execPath, [path.join(REPO, 'scripts', 'vetkill-autopsy-sweep.js')], { env: clean, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) { code = e.status; stderr = String(e.stderr || ''); }
  assert.strictEqual(code, 2, 'exits 2');
  assert.ok(/SWEEP STOP/.test(stderr), 'says SWEEP STOP');
});

// ---- E4 classifyDeathCause ----
ok('E4 classifyDeathCause unit cases', () => {
  assert.strictEqual(A.classifyDeathCause({ cause: 'combat', wave: 4 }).cls, 'combat-vs-wave-4');
  assert.strictEqual(A.classifyDeathCause({ cause: 'combat', wave: 5 }).cls, 'combat-vs-wave-4');
  assert.strictEqual(A.classifyDeathCause({ cause: 'combat', wave: 2 }).cls, 'other-combat');
  assert.strictEqual(A.classifyDeathCause({ cause: 'combat', wave: null }).cls, 'other-combat');
  assert.strictEqual(A.classifyDeathCause({ cause: 'villager combat', wave: 4 }).cls, 'combat-vs-wave-4');
  assert.strictEqual(A.classifyDeathCause({ cause: 'starvation' }).cls, 'starvation');
  assert.strictEqual(A.classifyDeathCause({ cause: 'sickness' }).cls, 'disease');
  assert.strictEqual(A.classifyDeathCause({ cause: 'infected wound' }).cls, 'wound');
  const u = A.classifyDeathCause({ cause: 'trampled' });
  assert.strictEqual(u.cls, 'other');
  assert.ok(/trampled/.test(u.why), 'raw cause retained in why');
});

console.log(`\ntest-vetkill-autopsy: ${pass} gates passed${process.exitCode ? ' (FAILURES PRESENT)' : ''}`);
