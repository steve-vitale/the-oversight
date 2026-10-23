#!/usr/bin/env node
// test-dmgbands-20261022.js — proof gates for the dmgbands instrument
// (sim-dmg-bands, 2026-10-22, axis scale-onramp). DIAG instrument, zero
// src/js. Run with DMGBANDS=1 (the sweep env); E1 runs its unset case in
// a child process.
//
// Gates:
//   E0 shape — module exports instrumentOn/install/encJSON/bandOf/
//        resolveDmgSource.
//   E1 det-gate — DMGBANDS unset: install() is a no-op, Game methods
//        untouched (identity), uninstall safe. (child process)
//   E2 env-gate — instrumentOn() true iff DMGBANDS==='1'. (child process)
//   E3 synthetic RED->GREEN fixtures on a stub Game through the REAL
//        install(): bandOf boundaries; resolveDmgSource mapping; TB
//        census (pool/band/staged); tbDamage per-source attribution;
//        kill linkage TB + field + orphan; encJSON strips internals.
//   E4 real-sim determinism — 60d leadfeast s65561 x2, serialized
//        encounter tables byte-identical.
//   D2 180d run completes with zero install.missing errors (death-aware:
//        the village may die early; the gate is a terminal endReason).
//
// ALL GREEN before the pilot sweep runs.
'use strict';
const path = require('path');
const { execSync } = require('child_process');
const REPO = path.join(__dirname, '..');
const DB = require(path.join(REPO, 'scripts', 'dmgbands-instrument-20261022'));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}
function childEnv(env) {
  const e = Object.assign({}, process.env);
  for (const k of Object.keys(env || {})) { if (env[k] === null) delete e[k]; else e[k] = env[k]; }
  return e;
}

// ---------- E0 shape ----------
console.log('E0 shape');
ok('exports instrumentOn', typeof DB.instrumentOn === 'function');
ok('exports install', typeof DB.install === 'function');
ok('exports encJSON', typeof DB.encJSON === 'function');
ok('exports bandOf', typeof DB.bandOf === 'function');
ok('exports rerunTier', typeof DB.rerunTier === 'function');
ok('exports resolveDmgSource', typeof DB.resolveDmgSource === 'function');

function writeChild(name, body) {
  const fs = require('fs'), os = require('os');
  const fp = path.join(os.tmpdir(), 'dmgbands-child-' + name + '-' + process.pid + '.js');
  fs.writeFileSync(fp, body);
  return fp;
}

// ---------- E1/E2 in child processes ----------
console.log('E1 det-gate (DMGBANDS unset, child)');
try {
  const fp = writeChild('e1', `
    'use strict';
    const DB = require(${JSON.stringify(path.join(REPO, 'scripts', 'dmgbands-instrument-20261022'))});
    const G = { startCombat(){}, tbDamage(){}, tbEnd(){}, fieldFight(){}, recordWaveKill(){}, recordPyrrhicKill(){} };
    const refs = {};
    for (const k of Object.keys(G)) refs[k] = G[k];
    const t = {};
    const un = DB.install(G, t);
    let same = true;
    for (const k of Object.keys(refs)) if (G[k] !== refs[k]) same = false;
    un();
    let same2 = true;
    for (const k of Object.keys(refs)) if (G[k] !== refs[k]) same2 = false;
    console.log(JSON.stringify({ on: DB.instrumentOn(), same, same2, tKeys: Object.keys(t).length }));
  `);
  const out = execSync(process.execPath + ' ' + JSON.stringify(fp), { env: childEnv({ DMGBANDS: null }), encoding: 'utf8' });
  const j = JSON.parse(out.trim());
  ok('instrumentOn() false when unset', j.on === false);
  ok('install is no-op: methods identical', j.same === true);
  ok('uninstall safe: methods identical', j.same2 === true);
  ok('t untouched by no-op install', j.tKeys === 0);
} catch (e) { ok('E1 child ran', false, String((e && e.message) || e)); }

console.log('E2 env-gate');
ok('instrumentOn() true with DMGBANDS=1', DB.instrumentOn() === true);
try {
  const fp = writeChild('e2', `
    'use strict';
    const DB = require(${JSON.stringify(path.join(REPO, 'scripts', 'dmgbands-instrument-20261022'))});
    console.log(JSON.stringify({ on: DB.instrumentOn() }));
  `);
  const out = execSync(process.execPath + ' ' + JSON.stringify(fp), { env: childEnv({ DMGBANDS: null }), encoding: 'utf8' });
  ok('instrumentOn() false without DMGBANDS (child)', JSON.parse(out.trim()).on === false);
} catch (e) { ok('E2 child ran', false, String((e && e.message) || e)); }

// ---------- E3 synthetic fixtures on the real install() ----------
console.log('E3 synthetic RED->GREEN (stub Game, real install)');
function stubGame() {
  const G = {
    state: { scholar: { day: 10 }, village: { party: ['v_1'] } },
    data: { monsters: [{ id: 'the_eater', wave: 4 }, { id: 'bulldozer', wave: 1 }] },
    villagerId: 'v_scholar',
    tbfight: null,
    tbFighter(key) {
      const f = this.tbfight;
      if (!f) return null;
      return (f.fighters || []).find(x => x && x.key === key) || null;
    },
    tbCurrent() { return { kind: 'player' }; },
    overtimeTier() { return 3; },
    startCombat(mid) {
      this.tbfight = {
        id: 'F1', over: false,
        fighters: [
          { key: 'm_0', kind: 'monster', monsterId: mid, maxHp: 1200, hp: 1200, alive: true },
          { key: 'v_1', kind: 'villager', villagerId: 'v_1', alive: true },
        ],
      };
      return true;
    },
    tbDamage(tk, dmg) { return dmg; },
    tbEnd() { return 'won'; },
    fieldFight(vid, mdef, m) {
      // the kill fires DURING the fight — linkage must use activeField
      this.recordWaveKill(mdef.id, vid, 'wild', null);
      return { outcome: 'vKill', rounds: 4, vTaken: 20, mDealt: 850, mHpLeft: 0 };
    },
    recordWaveKill() { return true; },
    recordPyrrhicKill() { return true; },
  };
  return G;
}

// E3a bandOf boundaries (canon anchor: 850-1500; L<=1050, M<=1250, H<=1500)
ok('bandOf 850 -> L', DB.bandOf(850) === 'L');
ok('bandOf 1050 -> L', DB.bandOf(1050) === 'L');
ok('bandOf 1051 -> M', DB.bandOf(1051) === 'M');
ok('bandOf 1250 -> M', DB.bandOf(1250) === 'M');
ok('bandOf 1251 -> H', DB.bandOf(1251) === 'H');
ok('bandOf 1500 -> H', DB.bandOf(1500) === 'H');
ok('bandOf 849 -> UNK', DB.bandOf(849) === 'UNK');
ok('bandOf 1501 -> UNK', DB.bandOf(1501) === 'UNK');
ok('bandOf null -> UNK', DB.bandOf(null) === 'UNK');
ok('bandOf 0 -> UNK', DB.bandOf(0) === 'UNK');

// E3b resolveDmgSource mapping
(function () {
  const G = stubGame();
  G.tbfight = { fighters: [{ key: 'v_1', kind: 'villager', villagerId: 'v_1' }, { key: 'm_0', kind: 'monster' }] };
  const r = (l, k) => DB.resolveDmgSource(G, l, k);
  ok("('you', null) -> scholar", r('you', null).kind === 'scholar');
  ok("('x', 'p') -> scholar", r('x', 'p').kind === 'scholar');
  ok("('your retribution', 'p') -> scholar", r('your retribution', 'p').kind === 'scholar');
  const c = r('Vasyl strikes', 'v_1');
  ok("('Vasyl strikes', 'v_1') -> companion v_1", c.kind === 'companion' && c.vid === 'v_1');
  ok("('paw', 'm_0') -> monster", r('paw', 'm_0').kind === 'monster');
  ok("unknown label, player turn -> scholar", r('mystery', 'zz').kind === 'scholar');
  const G2 = stubGame(); G2.tbCurrent = () => ({ kind: 'monster' });
  G2.tbfight = { fighters: [] };
  ok('unknown label, monster turn -> other', r.call(null, 'mystery', 'zz') && DB.resolveDmgSource(G2, 'mystery', 'zz').kind === 'other');
})();

// E3b2 rerunTier()
ok('rerunTier reads overtimeTier', DB.rerunTier(stubGame()) === 3);
ok('rerunTier 0 when method missing', DB.rerunTier({}) === 0);

// E3c TB census + attribution + kill linkage through real install()
(function () {
  const G = stubGame();
  const t = {};
  const un = DB.install(G, t);
  G.startCombat('the_eater');
  ok('TB census: one wave-4 enc', t.enc.length === 1);
  const e = t.enc[0];
  ok('TB enc: kind tb, mechanism tb', e.kind === 'tb' && e.mechanism === 'tb');
  ok('TB enc: pool 1200 band M', e.pool === 1200 && e.band === 'M');
  ok('TB enc: staged v_1', Array.isArray(e.stagedVids) && e.stagedVids.length === 1 && e.stagedVids[0] === 'v_1');
  ok('TB enc: rerunTier 3 (overtime)', e.rerunTier === 3);
  G.tbDamage('m_0', 40, 'Vasyl strikes', 'v_1');
  G.tbDamage('m_0', 60, 'you', null);
  G.tbDamage('m_0', 25, 'paw', 'm_0'); // monster-on-monster: excluded
  ok('companion dmg 40', e.dmgCompanion === 40);
  ok('byVid v_1 = 40', e.byVid.v_1 === 40);
  ok('scholar dmg 60', e.dmgScholar === 60);
  ok('monster dmg excluded (other 0)', e.dmgOther === 0);
  G.recordWaveKill('the_eater', 'v_1', 'companion');
  ok('TB kill linked', e.kill === true);
  ok('killBy v_1', e.killBy === 'v_1');
  ok('killBearer captured', e.killBearer === 'v_scholar');
  G.tbEnd('won');
  ok('fightOutcome joined', e.fightOutcome === 'won');
  un();
})();

// E3d field-fight path: kill during the fight links via activeField
(function () {
  const G = stubGame();
  const t = {};
  const un = DB.install(G, t);
  G.fieldFight('v_7', { id: 'the_eater' }, { hp: 850 });
  ok('field enc created', t.enc.length === 1);
  const e = t.enc[0];
  ok('field enc: kind/mechanism field', e.kind === 'field' && e.mechanism === 'field');
  ok('field enc: vid v_7', e.vid === 'v_7');
  ok('field enc: pool 850 band L', e.pool === 850 && e.band === 'L');
  ok('field enc: dmgCompanion 850', e.dmgCompanion === 850);
  ok('field enc: byVid v_7', e.byVid.v_7 === 850);
  ok('field enc: kill linked via activeField', e.kill === true && e.killBy === 'v_7');
  ok('field enc: outcome vKill', e.outcome === 'vKill');
  ok('activeField cleared', t.activeField === null);
  un();
})();

// E3e orphan kill + encJSON stripping
(function () {
  const G = stubGame();
  const t = {};
  const un = DB.install(G, t);
  G.recordWaveKill('the_eater', 'v_x', 'wild'); // no fight live, no active field
  ok('orphan kill recorded', t.orphanKills.length === 1 && t.orphanKills[0].by === 'v_x');
  const e = { seq: 1, _fightKey: 'F1|m_0', mid: 'x', byVid: { a: 1 } };
  const c = DB.encJSON(e);
  ok('encJSON strips _fightKey', c._fightKey === undefined && c.mid === 'x' && c.byVid.a === 1);
  // non-wave-4 kills are ignored by the instrument
  G.recordWaveKill('bulldozer', 'v_x', 'wild');
  ok('wave-1 kill ignored', t.orphanKills.length === 1 && t.enc.length === 0);
  un();
})();

// E3f mid-fight joiner: damage on a fighter that arrived after the
// startCombat census -> census-created, tracked informationally.
(function () {
  const G = stubGame();
  const t = {};
  const un = DB.install(G, t);
  G.startCombat('the_eater');
  ok('E3f: census has 1 enc', t.enc.length === 1);
  // A reinforcement arrives mid-fight (not in the census scan).
  G.tbfight.fighters.push({ key: 'm_9', kind: 'monster', monsterId: 'the_eater', maxHp: 1200, hp: 1200, alive: true });
  G.tbDamage('m_9', 50, 'you', null);
  ok('E3f: joiner enc created', t.enc.length === 2);
  ok('E3f: joiner tracked, not an error', t.midfightJoins.length === 1 && t.instrumentErrors.length === 0);
  ok('E3f: joiner carries rerunTier', t.enc[1].rerunTier === 3);
  ok('E3f: joiner damage attributed', t.enc[1].dmgScholar === 50);
  un();
})();

// ---------- E4 real-sim determinism + D2 completion ----------
console.log('E4/D2 real sim (60d x2 determinism + 180d completion)');
async function realSim() {
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const { leadfeast } = require(path.join(REPO, 'scripts', 'policies', 'feastscale'));
  async function once(seed, days) {
    const { Game } = await loadGame({ seed, mode: 'dmgbands-proof', fullTelemetry: false });
    const t = {};
    const uninstall = DB.install(Game, t);
    await setupGame(Game);
    let result;
    await quietLog(async () => { result = await runDays(Game, leadfeast, { days, manifest: undefined, sampleEvery: 60 }); });
    uninstall();
    const ser = JSON.stringify(t.enc.map(e => DB.encJSON(e))) + '|' +
      JSON.stringify(t.orphanKills) + '|' + JSON.stringify(t.tbOutcomes) + '|' +
      JSON.stringify(t.instrumentErrors);
    return { ser, nEnc: t.enc.length, nOrphan: t.orphanKills.length, nErr: t.instrumentErrors.length, errs: t.instrumentErrors.slice(0, 3), days: result.days, endReason: result.endReason };
  }
  const a = await once(65561, 60);
  const b = await once(65561, 60);
  ok('60d run A == run B (serialized tables)', a.ser === b.ser, 'A=' + a.nEnc + ' B=' + b.nEnc);
  ok('60d completed', a.days >= 60, 'days=' + a.days);
  const missing = a.errs.filter(e => /install\.missing/.test(e));
  ok('no install.missing errors', missing.length === 0, JSON.stringify(a.errs));
  // D2: death-aware horizon — the village may die before 180d; the gate is
  // that the instrumented run completes with a terminal endReason, not a
  // day count.
  const c = await once(65562, 180);
  ok('180d run completes (terminal endReason)', typeof c.endReason === 'string' && c.endReason.length > 0, 'end=' + c.endReason + ' days=' + c.days);
  ok('180d: no install.missing errors', c.errs.filter(e => /install\.missing/.test(e)).length === 0);
  console.log('  (info) 60d s65561 encounters=' + a.nEnc + ' orphans=' + a.nOrphan + ' errs=' + a.nErr +
    ' | 180d s65562 encounters=' + c.nEnc + ' orphans=' + c.nOrphan + ' errs=' + c.nErr);
  if (a.nErr > 0) console.log('  (info) sample errors: ' + JSON.stringify(a.errs));
}

realSim().then(() => {
  console.log(`\nRESULT: ${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
}).catch(e => { console.error('PROOF FAIL:', e && e.stack || e); process.exit(1); });
