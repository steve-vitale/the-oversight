#!/usr/bin/env node
// test-waitsalign-a.js — proof for sim-waitsalign-a (backlog
// #1599). Pure reads + file checks; writes nothing.
// Asserts: (1) the mechanism's code locations exist; (2) the
// corpus scan explains every completed transition (0
// UNEXPLAINED); (3) the 15215 ON probe trio flips/preserves
// exactly as preregistered; (4) the unit sleep probe boundary
// is exact at 448/449 on two seeds; (5) the 9-seed band
// control scan shows zero threshold-rule violations;
// (6) guard re-runs reproduce selecttrim guard legs;
// (7) determinism (byte-identical re-run); (8) worktree
// contains only this arm's files and src/ is untouched.
// Usage: node scripts/test-waitsalign-a.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const EV = path.join(ROOT, 'evidence', '2026-10-31');
let pass = 0, fail = 0;
const failures = [];
function check(name, cond, detail) {
  if (cond) { pass++; }
  else { fail++; failures.push(name + (detail !== undefined ? ' :: ' + detail : '')); console.log('FAIL ' + name + (detail !== undefined ? ' :: ' + detail : '')); }
}
function load(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function corpus(dir, file) { return load(path.join(EV, dir, file)); }

// (1) Code locations.
const gameJs = fs.readFileSync(path.join(ROOT, 'src/js/game.js'), 'utf8');
check('code: sleep too-late guard', gameJs.includes('hour off') && gameJs.includes('TICKS_PER_BATCH * 2'));
check('code: sleep dawn guard', gameJs.includes('barely dawn'));
check('code: wait boundary math', gameJs.includes('TICKS_PER_PART - rem') || gameJs.includes('TICKS_PER_PART - rem;') || /TICKS_PER_PART\) - rem/.test(gameJs));
check('code: endDay resets clock', gameJs.includes('s.dayTicks = 0; s.actionClock = 0;'));
const harness = fs.readFileSync(path.join(ROOT, 'scripts/sim-harness.js'), 'utf8');
check('code: harness 3 morning waits', /for \(let p = 0; p < 3; p\+\+\)/.test(harness) && harness.includes("Game.doAction('wait')"));

// (2) Corpus scan.
const scan = load(path.join(EV, 'sim-waitsalign-a-scan.json'));
check('scan: 120 transitions', scan.totals.transitions === 120, 'got ' + scan.totals.transitions);
check('scan: 0 unexplained', scan.totals.unexplained === 0, 'got ' + scan.totals.unexplained);
const onCtrl = scan.legs['selecttrim-on-control'];
const byDay = {};
for (const r of onCtrl) byDay[r.loopDay] = r;
check('scan: d16 interrupted@369', byDay[16] && byDay[16].actual === 128 && byDay[16].cause === 'interrupted-sleep@369', JSON.stringify(byDay[16]));
check('scan: d20 interrupted@465', byDay[20] && byDay[20].actual === 256 && byDay[20].cause === 'interrupted-sleep@465', JSON.stringify(byDay[20]));
check('scan: d22 interrupted@451', byDay[22] && byDay[22].actual === 256 && byDay[22].cause === 'interrupted-sleep@451', JSON.stringify(byDay[22]));

// (3) Probe trio, 15215 ON.
function trioLeg(mode) {
  return corpus('sim-waitsalign-a-corpus-on-' + mode, 'waitsalign-a-nighttravel-s15215.json');
}
function eveRow(d, day) { return d.evenings.find((e) => e.loopDay === day); }
function morningOf(d, day) { const m = d.mornings.find((x) => x.loopDay === day); return m ? m.morningDayTicks : null; }
function routineOf(e, layers) {
  for (const l of layers) { const r = (e.tickProbe || []).find((p) => p.layer === l); if (r) return r.spent; }
  return null;
}
function decTicks(e) { return e.woodcarry && e.woodcarry.classification ? e.woodcarry.classification.ticksToDayEnd : null; }
const ctrl = trioLeg('control'), ask = trioLeg('askskip'), trim = trioLeg('trim');
check('trio: control d9 eve 451', eveRow(ctrl, 9).eveningDayTicks === 451, 'got ' + eveRow(ctrl, 9).eveningDayTicks);
check('trio: control d10 morning 256 (no flip)', morningOf(ctrl, 10) === 256, 'got ' + morningOf(ctrl, 10));
check('trio: control d10 decision 221', decTicks(eveRow(ctrl, 10)) === 221, 'got ' + decTicks(eveRow(ctrl, 10)));
check('trio: askskip d9 routine 17 (save 2)', routineOf(eveRow(ask, 9), ['waitsalign']) === 17, 'got ' + routineOf(eveRow(ask, 9), ['waitsalign']));
check('trio: askskip d9 eve 449', eveRow(ask, 9).eveningDayTicks === 449, 'got ' + eveRow(ask, 9).eveningDayTicks);
check('trio: askskip d10 morning 256 (no flip)', morningOf(ask, 10) === 256, 'got ' + morningOf(ask, 10));
check('trio: askskip fired d9', (ask.waitsalignStore.asks || []).some((a) => a.loopDay === 9));
check('trio: trim d9 routine 16 (save 3)', routineOf(eveRow(trim, 9), ['selecttrim']) === 16, 'got ' + routineOf(eveRow(trim, 9), ['selecttrim']));
check('trio: trim d9 eve 448', eveRow(trim, 9).eveningDayTicks === 448, 'got ' + eveRow(trim, 9).eveningDayTicks);
check('trio: trim d10 morning 384 (flip)', morningOf(trim, 10) === 384, 'got ' + morningOf(trim, 10));
check('trio: trim d10 decision 94', decTicks(eveRow(trim, 10)) === 94, 'got ' + decTicks(eveRow(trim, 10)));
check('trio: control reproduces selecttrim ON control d9/d10',
  eveRow(corpus('sim-selecttrim-a-corpus-on-control', 'selecttrim-a-nighttravel-s15215.json'), 9).eveningDayTicks === 451);
check('trio: trim reproduces selecttrim ON trim d9/d10',
  eveRow(corpus('sim-selecttrim-a-corpus-on-trim', 'selecttrim-a-nighttravel-s15215.json'), 9).eveningDayTicks === 448);

// (4) Unit sleep probes, two seeds.
for (const seed of ['15215', '15003']) {
  const probe = load(path.join(EV, 'sim-waitsalign-a-sleepprobe-s' + seed + '.json'));
  let ok = true, detail = '';
  for (const r of probe.results) {
    if (r.error || r.interrupted) { ok = false; detail = 'eve ' + r.eve + ' error/interrupted'; break; }
    const pred = r.eve <= 448 ? 384 : 256;
    if (r.morning !== pred) { ok = false; detail = 'eve ' + r.eve + ' morning ' + r.morning + ' pred ' + pred; break; }
    if ((r.eve <= 448) !== r.dayRolledInSleep) { ok = false; detail = 'eve ' + r.eve + ' rolled mismatch'; break; }
  }
  check('probe: seed ' + seed + ' boundary exact', ok, detail);
  const row448 = probe.results.find((r) => r.eve === 448);
  const row449 = probe.results.find((r) => r.eve === 449);
  check('probe: seed ' + seed + ' 448->384 449->256',
    row448 && row448.morning === 384 && row449 && row449.morning === 256);
}
const probe15215 = load(path.join(EV, 'sim-waitsalign-a-sleepprobe-s15215.json'));
const ladder = {};
for (const r of probe15215.results) ladder[r.eve] = r.morning;
check('probe: save ladder 451/450/449->256, 448/446/442->384',
  ladder[451] === 256 && ladder[450] === 256 && ladder[449] === 256
  && ladder[448] === 384 && ladder[446] === 384 && ladder[442] === 384, JSON.stringify(ladder));

// (5) Band control scan: zero threshold-rule violations.
let bandTransitions = 0, bandViolations = 0;
for (const f of fs.readdirSync(path.join(EV, 'sim-waitsalign-a-corpus-on-control'))) {
  if (!f.endsWith('.json')) continue;
  const d = load(path.join(EV, 'sim-waitsalign-a-corpus-on-control', f));
  for (const e of d.evenings) {
    const nxt = d.mornings.find((m) => m.loopDay === e.loopDay + 1);
    if (!nxt || nxt.morningDayTicks === null || nxt.morningDayTicks === undefined) continue;
    bandTransitions++;
    const pred = e.eveningDayTicks <= 448 ? 384 : 256;
    if (nxt.morningDayTicks !== pred) bandViolations++;
  }
}
check('band: 9+ seeds, 0 threshold violations', bandViolations === 0, 'transitions ' + bandTransitions + ' violations ' + bandViolations);
check('band: transitions >= 100', bandTransitions >= 100, 'got ' + bandTransitions);

// (6) Guard re-runs reproduce selecttrim guard legs.
const guardCtrl = corpus('sim-waitsalign-a-corpus-guard-control', 'waitsalign-a-nighttravel-s15215.json');
const guardTrim = corpus('sim-waitsalign-a-corpus-guard-trim', 'waitsalign-a-nighttravel-s15215.json');
check('guard: control d11 497->256', eveRow(guardCtrl, 11).eveningDayTicks === 497 && morningOf(guardCtrl, 12) === 256,
  'eve ' + eveRow(guardCtrl, 11).eveningDayTicks + ' next ' + morningOf(guardCtrl, 12));
check('guard: trim d12 448->384', eveRow(guardTrim, 12).eveningDayTicks === 448 && morningOf(guardTrim, 13) === 384,
  'eve ' + eveRow(guardTrim, 12).eveningDayTicks + ' next ' + morningOf(guardTrim, 13));
check('guard: control press d10 E450', (guardCtrl.pressbStore.attempts || []).some((a) => a.loopDay === 10 && a.E === 450));
check('guard: trim press d10 E540', (guardTrim.pressbStore.attempts || []).some((a) => a.loopDay === 10 && a.E === 540));

// (7) Determinism.
const detA = fs.readFileSync(path.join(EV, 'sim-waitsalign-a-corpus-on-control', 'waitsalign-a-nighttravel-s15215.json'), 'utf8');
const detB = fs.readFileSync(path.join(EV, 'sim-waitsalign-a-corpus-det-on-control', 'waitsalign-a-nighttravel-s15215.json'), 'utf8');
check('determinism: control re-run byte-identical', detA === detB);

// (8) Worktree contains only this arm's files; src/ untouched.
let gitStatus = '';
try { gitStatus = execFileSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' }); } catch (e) { gitStatus = 'GIT-STATUS-FAILED'; }
const allowed = [
  /^scripts\/waitsalign-/, /^scripts\/policies\/waitsalign-diag\.js$/,
  /^scripts\/analyze-waitsalign-a\.js$/, /^scripts\/test-waitsalign-a\.js$/,
  /^evidence\/2026-10-31\/sim-waitsalign-a/,
];
const bad = [];
for (const line of gitStatus.split('\n').filter(Boolean)) {
  const p = line.slice(3).trim();
  if (!allowed.some((re) => re.test(p))) bad.push(line);
}
check('worktree: only this arm\'s files uncommitted/untracked', bad.length === 0, bad.slice(0, 5).join(' | '));
let srcDiff = '';
try { srcDiff = execFileSync('git', ['diff', 'HEAD', '--name-only', '--', 'src/'], { cwd: ROOT, encoding: 'utf8' }).trim(); } catch (e) { srcDiff = 'GIT-DIFF-FAILED'; }
check('src/: diff empty', srcDiff === '', srcDiff.slice(0, 200));
let existingDiff = '';
try {
  const all = execFileSync('git', ['diff', 'HEAD', '--name-only'], { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  existingDiff = all.filter((p) => !allowed.some((re) => re.test(p))).join(',');
} catch (e) { existingDiff = 'GIT-DIFF-FAILED'; }
check('tracked files: no edits to existing files', existingDiff === '', existingDiff.slice(0, 200));

console.log('waitsalign proof: ' + pass + ' pass, ' + fail + ' fail');
if (fail) { console.log('FAILURES:'); for (const f of failures) console.log(' - ' + f); process.exit(1); }
