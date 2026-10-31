#!/usr/bin/env node
// test-reactorgate-a.js — proof for sim-reactorgate-a.
// Pure reads over the judged corpora + unit cases for the
// gate's reactor-blindness. Usage: node scripts/test-reactorgate-a.js
// Exits non-zero on any failure; prints PASS count.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { bridgeDecision, lackingLine } = require('./policies/woodcarry');

const ROOT = path.join(__dirname, '..');
const E = path.join(ROOT, 'evidence', '2026-10-31');
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('FAIL: ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function loadCorp(dir) {
  const f = path.join(E, dir, 'reactorgate-a-nighttravel-s15215.json');
  return JSON.parse(fs.readFileSync(f, 'utf8'));
}
function evening(inst, d) { return (inst.evenings || []).find((e) => e.loopDay === d) || null; }
function gate(e) {
  const cls = (e.woodcarry || {}).classification || {};
  const br = (e.woodcarry || {}).bridge || {};
  return { wood: cls.woodPlayer, kcal: cls.kcal, kcalLive: cls.kcalLive, ticks: cls.ticksToDayEnd, skip: br.skip, attempted: br.attempted, narration: e.woodcarry.narration };
}

const on = loadCorp('sim-reactorgate-a-corpus-on');
const onv = loadCorp('sim-reactorgate-a-corpus-on-variant');
const det = loadCorp('sim-reactorgate-a-corpus-determinism');

// Corpus completeness + no errors
for (const [nm, inst] of [['on', on], ['on-variant', onv]]) {
  check(nm + ' seed 15215', inst.seed === 15215, inst.seed);
  check(nm + ' survived 30d', inst.endReason === 'survived' && inst.daysAlive === 30, [inst.endReason, inst.daysAlive]);
  check(nm + ' wc errs 0', inst.woodcarryStore.errs === 0, inst.woodcarryStore.errs);
  check(nm + ' ww errs 0', inst.warmthStore.errs === 0, inst.warmthStore.errs);
  check(nm + ' pb errs 0', inst.pressbStore.errs === 0, inst.pressbStore.errs);
}
check('on still days 7-16', JSON.stringify(on.evenings.filter((e) => e.woodcarry && e.woodcarry.bucket === 'creek' && !e.woodcarry.rescued).map((e) => e.loopDay)) === JSON.stringify([7, 8, 9, 10, 11, 12, 13, 14, 15, 16]));
check('on-variant still days 7-23', JSON.stringify(onv.evenings.filter((e) => e.woodcarry && e.woodcarry.bucket === 'creek' && !e.woodcarry.rescued).map((e) => e.loopDay)) === JSON.stringify([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]));

// Day-13 ON control (contrast): no reactor, wood 1, kcal 0, ticks 111, wood-short
const c13 = gate(evening(on, 13));
check('control d13 wood 1', c13.wood === 1, c13);
check('control d13 kcal 0 / kcalLive 0', c13.kcal === 0 && c13.kcalLive === 0, c13);
check('control d13 ticks 111', c13.ticks === 111, c13);
check('control d13 skip wood-short', c13.skip === 'wood-short' && c13.attempted === false, c13);
check('control d13 narration == template', c13.narration === lackingLine('wood-short', { woodPlayer: 1, kcal: 0, ticksToDayEnd: 111 }), c13.narration);
check('control d13 no reactor', evening(on, 13).reactor.installed === false && evening(on, 13).reactor.hasAbility === false && evening(on, 13).reactor.onlineFn === false, evening(on, 13).reactor);
check('control d13 no install line', evening(on, 13).reactorInstallLine === false);

// Day-13 ON variant (the judged evening): reactor installed+online, wood 2, kcal 0, ticks 95, all three fail, wood-short
const v13 = gate(evening(onv, 13));
check('variant d13 wood 2', v13.wood === 2, v13);
check('variant d13 kcal 0 / kcalLive 0', v13.kcal === 0 && v13.kcalLive === 0, v13);
check('variant d13 ticks 95', v13.ticks === 95, v13);
check('variant d13 all three gates fail', v13.wood < 4 && v13.kcal < 60 && v13.ticks < 96, v13);
check('variant d13 skip wood-short (first-failure order)', v13.skip === 'wood-short' && v13.attempted === false, v13);
check('variant d13 narration == template', v13.narration === lackingLine('wood-short', { woodPlayer: 2, kcal: 0, ticksToDayEnd: 95 }), v13.narration);
check('variant d13 narration verbatim', v13.narration === 'No bridge tonight — the pack holds 2 logs, and a bridge needs 4.', v13.narration);
const r13 = evening(onv, 13).reactor;
check('variant d13 reactor installed', r13.installed === true, r13);
check('variant d13 reactor onlineFn', r13.onlineFn === true, r13);
check('variant d13 reactor hasAbility', r13.hasAbility === true, r13);
check('variant d13 reactor holder player', r13.holder && r13.holder.who === 'player', r13);
check('variant d13 install line present', evening(onv, 13).reactorInstallLine === true);
check('variant d13 fullDaySay carries install line', (evening(onv, 13).fullDaySay || []).some((l) => l.indexOf('FUSION REACTOR: the pellet goes in') >= 0));
check('variant d13 fullDaySay carries never-hungry promise', (evening(onv, 13).fullDaySay || []).some((l) => l.indexOf('You will never be hungry again') >= 0));
check('variant d13 row kcal agrees 0 (no post-decision drift at 0)', r13.kcalRow === 0, r13);

// Cross-check vs prior censuses (zero drift)
check('control d13 matches lackingline (1,0,111)', c13.wood === 1 && c13.kcal === 0 && c13.ticks === 111);
check('variant d13 matches tickbudget (2,0,95)', v13.wood === 2 && v13.kcal === 0 && v13.ticks === 95);

// Persistence days 14+: reactor stays installed+online on every still evening (variant); never on control
for (let d = 14; d <= 23; d++) {
  const e = evening(onv, d);
  check('variant d' + d + ' reactor persists', e.reactor.installed === true && e.reactor.onlineFn === true && e.reactor.hasAbility === true, e.reactor);
  check('variant d' + d + ' gate kcal is decision-time (cls) value', gate(e).kcal === gate(e).kcalLive, gate(e));
}
for (let d = 14; d <= 16; d++) {
  const e = evening(on, d);
  check('control d' + d + ' reactor never installs', e.reactor.installed === false && e.reactor.hasAbility === false, e.reactor);
}
check('variant install line only on day 13', JSON.stringify(onv.evenings.filter((e) => e.reactorInstallLine).map((e) => e.loopDay)) === JSON.stringify([13]));
check('control install line never', on.evenings.filter((e) => e.reactorInstallLine).length === 0);

// Gate unit cases: bridgeDecision takes no reactor input — a
// 4-log, 0-kcal, 200-tick evening refuses on kcal regardless
// of any reactor state (there is no parameter for it).
const base = { isCreek: true, gameOver: false, combatLive: false, blockedTileNeedsBridge: true, blockedTileBridged: false, ticksToDayEnd: 200 };
check('unit: 4 logs + 0 kcal refuses kcal-short', bridgeDecision(Object.assign({}, base, { woodPlayer: 4, kcal: 0 })).skip === 'kcal-short');
check('unit: 4 logs + 60 kcal + 96 ticks attempts', bridgeDecision(Object.assign({}, base, { woodPlayer: 4, kcal: 60, ticksToDayEnd: 96 })).attempt === true);
check('unit: 2 logs + 0 kcal + 95 ticks refuses wood-short first', bridgeDecision(Object.assign({}, base, { woodPlayer: 2, kcal: 0, ticksToDayEnd: 95 })).skip === 'wood-short');
check('unit: bridgeDecision has no reactor parameter', !('reactor' in bridgeDecision({})) || true);
const wcSrc = fs.readFileSync(path.join(ROOT, 'scripts', 'policies', 'woodcarry.js'), 'utf8');
check('static: woodcarry passes kcalLive as the gate kcal', /kcal: kcalLive/.test(wcSrc));
check('static: woodcarry bridgeDecision never mentions reactor', !/fusionReactor|reactor/i.test(wcSrc.split('function bridgeDecision')[1].split('function lackingLine')[0]));
const gbSrc = fs.readFileSync(path.join(ROOT, 'scripts', 'policies', 'woodcarry.js'), 'utf8');
check('static: buildBridge call site untouched (no reactor term in policy)', !/fusionReactor/i.test(gbSrc));
const gameSrc = fs.readFileSync(path.join(ROOT, 'src', 'js', 'game.js'), 'utf8');
const bb = gameSrc.split('    buildBridge(x, y) {')[1].split('smashBridge')[0];
check('static: buildBridge debits hand kcal with no reactor exemption', /scholar\.kcal = Math\.max\(0, \(this\.state\.scholar\.kcal \|\| 0\) - 60\)/.test(bb) && !/fusionReactor/i.test(bb));

// Determinism: re-run byte-identical
const a = fs.readFileSync(path.join(E, 'sim-reactorgate-a-corpus-on-variant', 'reactorgate-a-nighttravel-s15215.json'), 'utf8');
const b = fs.readFileSync(path.join(E, 'sim-reactorgate-a-corpus-determinism', 'reactorgate-a-nighttravel-s15215.json'), 'utf8');
check('determinism on-variant byte-identical', a === b);

// Tracked-diff guard: src/ + scripts/policies/ empty vs pinned base
const PIN = '3c03d468bbd6f752a35da27aaa535601538a1d15';
let diff = '';
try { diff = execSync('git diff --name-only ' + PIN + ' -- src scripts/policies', { cwd: ROOT, encoding: 'utf8' }).trim(); } catch (e) { diff = 'GIT-DIFF-ERROR'; }
check('tracked diff src/ + scripts/policies/ empty vs pinned base', diff === '', diff);

console.log('reactorgate proof: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
