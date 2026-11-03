#!/usr/bin/env node
// test-guarde-deploy-b.js — DEPLOYED-GUARD PROOF (no new sims)
// (sim-guarde-deploy-b, Loop B food-economy arm, 2026-11-03).
// Prereg: evidence/2026-11-03/sim-guarde-deploy-b-prereg.md
// Proves, against the EDITED instrument file
// scripts/policies/competent-homewardstep-b.js (installGuard),
// with stub Games only: (a) entry veto speaks the ENTRY line,
// escape veto speaks the ESCAPE line, clean hops pass;
// (b) veto-memory silences repeats without un-vetoing;
// (c) shadow never vetoes / never says; (d) rubble-only
// synthetic probe — raw checkHop vetoes where a
// credit-inheriting variant would pass; (e) deployed veto
// set on the entry pilot fixture = old veto set +
// exactly the 6 known conversions; (f) reused files
// unmodified vs HEAD, guard source carries the deploy;
// (g) prereg band checks. Exit non-zero on any failure.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { installGuard, escapeCheck, checkHop } = require('./policies/competent-homewardstep-b');
const { allowPrimeFromRecord } = require('./policies/competent-guarde-entry-b');

const ESCAPE_LINE = "You don't walk there — you couldn't get home from there.";
const ENTRY_LINE = "You can't step there — you couldn't get in from here.";

let checks = 0, failures = [];
function ok(name, cond, extra) {
  checks++;
  if (!cond) failures.push(name + (extra ? ' :: ' + extra : ''));
  else console.log('PASS ' + name);
}

function makeGame(blockFn) {
  const tiles = [];
  for (let y = 0; y < 9; y++) {
    const row = [];
    for (let x = 0; x < 9; x++) row.push({ type: 'meadow', revealed: true, stock: 0 });
    tiles.push(row);
  }
  const sayLines = [];
  const Game = {
    over: false,
    map: { px: 5, py: 4, tiles },
    state: { village: { px: 4, py: 4 }, scholar: { day: 5 } },
    say(s) { sayLines.push(String(s)); },
    tileAt(x, y) { return (tiles[y] && tiles[y][x]) || null; },
    travelBlockage(x, y, fx, fy) { return blockFn(x, y, fx, fy); },
    travelTo(x, y) { this.map.px = x; this.map.py = y; return { moved: true }; },
    _sayLines: sayLines,
  };
  return Game;
}
const noBlock = () => null;
const creek71 = (x, y, fx, fy) => (x === 7 && y === 1 && fx === 7 && fy === 2) ? { blockType: 'creek' } : null;
const rubble71 = (x, y, fx, fy) => (x === 7 && y === 1 && fx === 7 && fy === 2) ? { blockType: 'rubble' } : null;
const allCreek = () => ({ blockType: 'creek' });

// (a) clean hop passes, no say, log allowPrime true.
{
  const Game = makeGame(noBlock);
  const ctx = {};
  const restore = installGuard(Game, ctx, {});
  const res = Game.travelTo(6, 4);
  restore();
  ok('clean hop: orig travelTo ran', Game.map.px === 6 && Game.map.py === 4 && res && res.moved === true);
  ok('clean hop: guard silent', Game._sayLines.length === 0);
  const log = ctx.homewardstepHopLog || [];
  ok('clean hop: log allowPrime true, vetoCause null',
    log.length === 1 && log[0].allowPrime === true && log[0].vetoCause === null && log[0].vetoed === false,
    JSON.stringify(log[0] || null));
}
// (a) entry veto: E pass + creek entry block => ENTRY line, stayed, log fields.
{
  const Game = makeGame(creek71);
  Game.map.px = 7; Game.map.py = 2;
  const ctx = {};
  const restore = installGuard(Game, ctx, {});
  const res = Game.travelTo(7, 1);
  restore();
  ok('entry veto: scholar stayed', Game.map.px === 7 && Game.map.py === 2);
  ok('entry veto: ENTRY line spoken', Game._sayLines.length === 1 && Game._sayLines[0] === ENTRY_LINE,
    JSON.stringify(Game._sayLines));
  ok('entry veto: NOT the escape line', Game._sayLines[0] !== ESCAPE_LINE);
  const log = ctx.homewardstepHopLog || [];
  ok('entry veto: log vetoCause entry + entryBlockers creek + allowPrime false',
    log.length === 1 && log[0].vetoed === true && log[0].vetoCause === 'entry'
    && log[0].allowPrime === false && JSON.stringify(log[0].entryBlockers) === JSON.stringify(['creek']),
    JSON.stringify(log[0] || null));
  ok('entry veto: return is a block object', res && res.vetoed === true);
}
// (a) escape veto: E fail => ESCAPE line (verbatim), stayed.
{
  const Game = makeGame(allCreek);
  Game.map.px = 5; Game.map.py = 4;
  const ctx = {};
  const restore = installGuard(Game, ctx, {});
  const res = Game.travelTo(6, 4);
  restore();
  ok('escape veto: scholar stayed', Game.map.px === 5 && Game.map.py === 4);
  ok('escape veto: ESCAPE line spoken verbatim', Game._sayLines.length === 1 && Game._sayLines[0] === ESCAPE_LINE,
    JSON.stringify(Game._sayLines));
  const log = ctx.homewardstepHopLog || [];
  ok('escape veto: log vetoCause escape',
    log.length === 1 && log[0].vetoed === true && log[0].vetoCause === 'escape',
    JSON.stringify(log[0] || null));
  // Veto path returns the engine block when travelBlockage(x, y)
  // (no origin) reports one — pre-existing guard behavior, not a
  // travel success: the scholar stayed, which is the guarantee.
  ok('escape veto: return is a block object, not a travel success',
    res && typeof res.blockType === 'string' && res.moved !== true, JSON.stringify(res));
}
// (b) veto memory: repeat entry veto silent but still vetoed.
{
  const Game = makeGame(creek71);
  Game.map.px = 7; Game.map.py = 2;
  const ctx = {};
  const restore = installGuard(Game, ctx, {});
  Game.travelTo(7, 1);
  const linesAfterFirst = Game._sayLines.length;
  const res2 = Game.travelTo(7, 1);
  restore();
  ok('veto memory: second veto silent', Game._sayLines.length === linesAfterFirst);
  ok('veto memory: second veto still vetoed + stayed',
    res2 && res2.vetoed === true && Game.map.px === 7 && Game.map.py === 2);
  const log = ctx.homewardstepHopLog || [];
  ok('veto memory: log marks second veto silent',
    log.length === 2 && log[1].vetoed === true && log[1].silent === true,
    JSON.stringify(log[1] || null));
}
// (c) shadow: entry-blocked hop proceeds, never says.
{
  const Game = makeGame(creek71);
  Game.map.px = 7; Game.map.py = 2;
  const ctx = {};
  const restore = installGuard(Game, ctx, { shadow: true });
  const res = Game.travelTo(7, 1);
  restore();
  ok('shadow: travel proceeded', Game.map.px === 7 && Game.map.py === 1 && res && res.moved === true);
  ok('shadow: guard silent', Game._sayLines.length === 0);
  const log = ctx.homewardstepHopLog || [];
  ok('shadow: log vetoed false + shadow true',
    log.length === 1 && log[0].vetoed === false && log[0].shadow === true,
    JSON.stringify(log[0] || null));
}
// (d) rubble-only synthetic probe: raw vetoes, credit variant would pass.
{
  const Game = makeGame(rubble71);
  Game.map.px = 7; Game.map.py = 2;
  const esc = escapeCheck(Game, 7, 1, 4, 4);
  const entry = checkHop(Game, 7, 2, 7, 1);
  ok('rubble probe: E passes on stub', esc.ok === true, JSON.stringify(esc));
  ok('rubble probe: entry blockers rubble-only',
    entry.blockers.length === 1 && entry.blockers[0].blockType === 'rubble',
    JSON.stringify(entry.blockers));
  const rawAllow = esc.ok && entry.blockers.length === 0;
  const creditAllow = esc.ok && (entry.blockers.length === 0
    || (entry.blockers.every((b) => b.blockType === 'rubble')
      && new Set(entry.blockers.map((b) => b.x + ',' + b.y)).size === 1));
  ok('rubble probe: raw allow FALSE, credit allow TRUE (definitions differ exactly here)',
    rawAllow === false && creditAllow === true);
  const ctx = {};
  const restore = installGuard(Game, ctx, {});
  Game.travelTo(7, 1);
  restore();
  ok('rubble probe: deployed guard vetoes with ENTRY line',
    Game.map.px === 7 && Game.map.py === 2 && Game._sayLines[0] === ENTRY_LINE);
}
// (e) fixture agreement: deployed veto set = old set + exactly the 6 known conversions.
{
  const readJsonl = (p) => fs.readFileSync(p, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
  const root = path.join(__dirname, '..');
  const legs = readJsonl(path.join(root, 'evidence/2026-11-02/sim-guarde-entry-b-pilot.jsonl'))
    .concat(readJsonl(path.join(root, 'evidence/2026-11-02/sim-guarde-entry-b-c.jsonl')));
  let eFail = 0, eFailVetoed = 0, conv = [];
  for (const leg of legs) {
    for (const h of (leg.hops || []).filter((x) => x.attempted)) {
      const ap = allowPrimeFromRecord(h);
      if (!ap.eOk) { eFail++; if (ap.vetoNew) eFailVetoed++; }
      if (ap.eOk && ap.entryBlocked) conv.push(leg.seed + ':' + h.from.x + ',' + h.from.y + '->' + h.to.x + ',' + h.to.y + ':' + ap.entryBlockers.map((b) => b.blockType).join('+'));
    }
  }
  ok('fixture: every E-fail hop vetoed under deployed rule', eFail === 6 && eFailVetoed === 6,
    'eFail=' + eFail + ' vetoed=' + eFailVetoed);
  const want = ['69502:7,2->7,1:creek', '69503:4,4->5,4:creek', '69508:4,4->5,4:creek',
    '69606:4,5->4,6:creek', '69607:4,4->4,5:creek', '69507:5,4->6,4:washed_out'];
  ok('fixture: conversions exactly the 6 known hops',
    JSON.stringify(conv.sort()) === JSON.stringify(want.sort()), JSON.stringify(conv));
}
// (f) reused files unmodified vs HEAD; guard source carries the deploy.
{
  const diff = execSync('git diff --name-only HEAD', { cwd: path.join(__dirname, '..') }).toString().split('\n').filter(Boolean);
  const reused = ['scripts/policies/competent.js', 'scripts/policies/competent-guarde-entry-b.js',
    'scripts/creekhop-b-recorder.js', 'scripts/homewardstep-rpt-b-driver.js',
    'scripts/analyze-guarde-entry-b.js'];
  const touched = reused.filter((f) => diff.includes(f));
  ok('reused files unmodified vs HEAD', touched.length === 0, 'touched=' + JSON.stringify(touched));
  const srcDiff = diff.filter((f) => f.startsWith('src/js/'));
  ok('zero src/js changes', srcDiff.length === 0, JSON.stringify(srcDiff));
  const guardSrc = fs.readFileSync(path.join(__dirname, 'policies/competent-homewardstep-b.js'), 'utf8');
  ok('guard source carries deploy (vetoCause + entry line + checkHop in installGuard)',
    guardSrc.includes('vetoCause') && guardSrc.includes(ENTRY_LINE)
    && installGuard.toString().includes('checkHop'));
}
// (g) prereg band checks.
{
  const pre = fs.readFileSync(path.join(__dirname, '..', 'evidence/2026-11-03/sim-guarde-deploy-b-prereg.md'), 'utf8');
  const must = ['69501', '69508', '69511', '69518', '69608', '69615', '69521', '69540', '69616', '69623',
    '5,4;6,4;7,4;7,3;7,2;7,1', '4,5;4,6;4,7;4,8;3,8;2,8', 'DISTINGUISH', 'RAW checkHop'];
  const missing = must.filter((s) => !pre.includes(s));
  ok('prereg band checks (pilot/confirm/probe seeds + routes + decisions)', missing.length === 0,
    'missing=' + JSON.stringify(missing));
}

console.log('CHECKS ' + (checks - failures.length) + '/' + checks);
if (failures.length) { console.error('FAILURES:'); for (const f of failures) console.error('  FAIL ' + f); process.exit(1); }
