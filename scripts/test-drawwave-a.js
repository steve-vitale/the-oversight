#!/usr/bin/env node
// scripts/test-drawwave-a.js — proof tests for the drawwave recorder
// (sim-drawwave-a, DIAG ONLY). Fake-Game unit + integration checks:
// delegation returns the original value untouched, pre/post gate
// capture, pool membership, analyzer classification (appropriate /
// early / impossible / unclassified), engine-throw rethrow, OFF
// mode installs nothing, uninstall restores the original.
'use strict';
const { newStore, installDrawwaveDiag, withDrawwaveDiag, analyzeDrawwave } = require('./policies/drawwave-diag');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra != null ? ' :: ' + JSON.stringify(extra) : '')); }
}

function fakeGame(opts) {
  opts = opts || {};
  const monsters = [
    { id: 'deer', wave: 1 }, { id: 'boar', wave: 1 },
    { id: 'grief', wave: 2 }, { id: 'static', wave: 2 },
    { id: 'spool', wave: 3 }, { id: 'strike', wave: 4 },
  ];
  const G = {
    state: { scholar: { day: opts.day || 60, feastDraw: null } },
    data: { monsters: monsters },
    _uw: opts.uw || 3,
    _poolMax: opts.poolMax != null ? opts.poolMax : 3,
    _drawResult: opts.drawResult || { drawn: true, monsterId: 'spool', veteran: false },
    _drawThrow: opts.drawThrow || null,
    unlockedWave() { return this._uw; },
    monsterWavePool() { return monsters.filter(m => m.wave <= this._poolMax); },
    villageStanding() { return { total: 90, war: 50, diplomacy: 20, plenty: 20 }; },
    drawFeastScavenger() {
      if (this._drawThrow) throw this._drawThrow;
      const r = this._drawResult;
      if (r.drawn) this.state.scholar.feastDraw = { monsterId: r.monsterId, veteran: !!r.veteran, day: this.state.scholar.day };
      return r;
    },
  };
  return G;
}

// 1. Delegation: original value returned untouched, row recorded.
{
  const G = fakeGame({ uw: 3 });
  const orig = G.drawFeastScavenger;
  const st = newStore();
  installDrawwaveDiag(G, st);
  check('install flag set', st.installed === true);
  const out = G.drawFeastScavenger();
  check('delegated value untouched', out.drawn === true && out.monsterId === 'spool' && out.veteran === false);
  check('one row recorded', st.rows.length === 1, st.rows.length);
  const r = st.rows[0];
  check('row day', r.day === 60, r.day);
  check('row preUnlockedWave', r.preUnlockedWave === 3, r.preUnlockedWave);
  check('row wave from def', r.wave === 3, r.wave);
  check('row postUnlockedWave stable', r.postUnlockedWave === 3, r.postUnlockedWave);
  check('row pool has drawn', r.prePoolHasDrawn === true, r.prePoolHasDrawn);
  check('row pool waves', r.prePoolWaves && r.prePoolWaves.w1 === 2 && r.prePoolWaves.w2 === 2 && r.prePoolWaves.w3 === 1, r.prePoolWaves);
  check('row standing', r.preStanding && r.preStanding.total === 90, r.preStanding);
  check('no errs', st.errs === 0, st.errors);
  // uninstall restores
  G._drawwaveDiagUninstall();
  check('uninstall restores original', G.drawFeastScavenger === orig);
}

// 2. Engine throw: recorded and rethrown unchanged, original value never faked.
{
  const boom = new Error('cast exploded');
  const G = fakeGame({ drawThrow: boom });
  const st = newStore();
  installDrawwaveDiag(G, st);
  let threw = null;
  try { G.drawFeastScavenger(); } catch (e) { threw = e; }
  check('engine throw rethrown identical', threw === boom);
  check('throw row recorded', st.rows.length === 1 && /cast exploded/.test(st.rows[0].threw || ''), st.rows[0]);
}

// 3. Not-spawned draw: drawn false, unlockedWave still recorded.
{
  const G = fakeGame({ drawResult: { drawn: false, why: 'already pending' } });
  const st = newStore();
  installDrawwaveDiag(G, st);
  G.drawFeastScavenger();
  check('not-spawned row', st.rows.length === 1 && st.rows[0].drawn === false && st.rows[0].why === 'already pending' && st.rows[0].preUnlockedWave === 3, st.rows[0]);
}

// 4. OFF mode: withDrawwaveDiag daily installs nothing when DRAWWAVE unset.
{
  delete process.env.DRAWWAVE;
  const inner = { daily() { return 'inner'; } };
  const wrapped = withDrawwaveDiag(inner, 'dw', 'desc', newStore());
  const G = fakeGame();
  const ctx = {};
  const r = wrapped.daily(G, ctx);
  check('OFF daily delegates inner', r === 'inner');
  check('OFF no wrap installed', G.drawFeastScavenger && !G._drawwaveDiagInstalled);
  check('OFF no ctx surface', !ctx._drawwave);
}

// 5. ON mode via withDrawwaveDiag daily installs and records.
{
  process.env.DRAWWAVE = '1';
  const inner = { daily() { return 'inner'; } };
  const st = newStore();
  const wrapped = withDrawwaveDiag(inner, 'dw', 'desc', st);
  const G = fakeGame({ uw: 4, poolMax: 4, drawResult: { drawn: true, monsterId: 'strike', veteran: false } });
  wrapped.daily(G, {});
  G.drawFeastScavenger();
  check('ON daily installed + recorded', st.rows.length === 1 && st.rows[0].preUnlockedWave === 4 && st.rows[0].wave === 4, st.rows[0]);
  delete process.env.DRAWWAVE;
}

// 6. Analyzer: appropriate / early / impossible / unclassified / poolUnknown / gateMoved.
{
  const dw = { rows: [
    { day: 10, drawn: true, monsterId: 'spool', veteran: false, wave: 3, preUnlockedWave: 3, postUnlockedWave: 3, prePoolHasDrawn: true },
    { day: 20, drawn: true, monsterId: 'strike', veteran: false, wave: 4, preUnlockedWave: 3, postUnlockedWave: 3, prePoolHasDrawn: false },
    { day: 30, drawn: true, monsterId: 'grief', veteran: false, wave: 2, preUnlockedWave: null, postUnlockedWave: null, prePoolHasDrawn: null },
    { day: 40, drawn: true, monsterId: 'static', veteran: false, wave: 2, preUnlockedWave: 2, postUnlockedWave: 3, prePoolHasDrawn: true },
    { day: 50, drawn: false, why: 'smoke carried clear', preUnlockedWave: 2 },
  ], errs: 0, errors: [], overflow: { rows: 0 } };
  // feastdraw join: spool d10, strike d20, static d40 present; grief d30 ABSENT -> unclassified by join too.
  const fd = { draws: [
    { drawn: true, monsterId: 'spool', day: 10 },
    { drawn: true, monsterId: 'strike', day: 20 },
    { drawn: true, monsterId: 'static', day: 40 },
  ] };
  const an = analyzeDrawwave(dw, fd);
  check('analyzer calls', an.calls === 5, an.calls);
  check('analyzer spawned', an.spawned === 4, an.spawned);
  check('analyzer notSpawned', an.notSpawned === 1, an.notSpawned);
  check('analyzer appropriate', an.appropriate === 2, an.appropriate); // spool + static (static: wave 2 <= uw 2)
  check('analyzer early', an.early === 1, an.early); // strike w4 > uw3
  check('analyzer impossible', an.impossible === 1, an.impossible); // strike not in pool
  check('analyzer unclassified', an.unclassified === 1, an.unclassified); // grief: uw null + no join
  check('analyzer poolUnknown', an.poolUnknown === 1, an.poolUnknown); // grief
  check('analyzer gateMoved', an.gateMoved === 1, an.gateMoved); // static pre 2 post 3
  const byDay = {};
  for (const o of an.perDraw) byDay[o.day] = o;
  check('perDraw spool appropriate', byDay[10].verdict === 'appropriate' && byDay[10].impossible === false);
  check('perDraw strike early+impossible', byDay[20].verdict === 'early' && byDay[20].impossible === true);
  check('perDraw grief unclassified', byDay[30].verdict === 'unclassified');
  check('notSpawned excluded from perDraw', an.perDraw.length === 4, an.perDraw.length);
  check('notSpawned row carries uw', an.notSpawnedRows.length === 1 && an.notSpawnedRows[0].unlockedWave === 2, an.notSpawnedRows);
}

// 7. Analyzer with null feastdraw store: every spawned draw unclassified (never guessed).
{
  const dw = { rows: [{ day: 10, drawn: true, monsterId: 'spool', wave: 3, preUnlockedWave: 3, postUnlockedWave: 3, prePoolHasDrawn: true }] };
  const an = analyzeDrawwave(dw, null);
  check('null fd store -> unclassified', an.unclassified === 1 && an.appropriate === 0, an);
}

// 8. Missing engine function: counted, never throws.
{
  const G = fakeGame();
  delete G.drawFeastScavenger;
  const st = newStore();
  installDrawwaveDiag(G, st);
  check('missing fn counted', st.errs >= 1, st.errs);
}

console.log(`\ntest-drawwave-a: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
