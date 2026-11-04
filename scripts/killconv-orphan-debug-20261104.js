// killconv-orphan-debug-20261104.js — one-seed debug for the 99116 d77
// orphan tbEnd (audit, routed, fled, 783/1100). Logs every startCombat
// with before/after fight identity, every tbEnd, and every player
// action / damage call that happens INSIDE a startCombat call, so a
// zero-turn scripted rout can be proven rather than assumed.
// Usage: SEED=99116 DAYS=140 node scripts/killconv-orphan-debug-20261104.js
'use strict';
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(__dirname, 'sim-harness'));
const { competent } = require(path.join(__dirname, 'policies', 'competent'));
const SEED = parseInt(process.env.SEED || '99116', 10);
const DAYS = parseInt(process.env.DAYS || '140', 10);

(async function () {
  const { Game } = await loadGame({ seed: SEED, mode: 'competent-kc-orphan', fullTelemetry: false });
  await setupGame(Game);
  const log = [];
  let inStart = false;
  let endsDuringStart = [];
  const dayOf = function () { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } };
  const fid = function (f) { return f ? (f.id || '?') : null; };
  const origStart = Game.startCombat;
  Game.startCombat = function () {
    const before = fid(Game.tbfight);
    endsDuringStart = [];
    inStart = true;
    let r, threw = null;
    try { r = origStart.apply(this, arguments); } catch (e) { threw = e; }
    inStart = false;
    const after = fid(Game.tbfight);
    log.push({ kind: 'startCombat', day: dayOf(), before: before, after: after,
      endsDuring: endsDuringStart.slice(), threw: threw ? String(threw.message).slice(0, 60) : null });
    if (threw) throw threw;
    return r;
  };
  const origEnd = Game.tbEnd;
  Game.tbEnd = function (result) {
    const f = Game.tbfight;
    const rec = { kind: 'tbEnd', day: dayOf(), result: String(result), fight: fid(f),
      round: f ? (f.round || null) : null,
      monsters: f ? (f.fighters || []).filter(function (x) { return x && x.kind === 'monster'; }).map(function (m) { return ((m.mdef || {}).id || m.monsterId || m.id) + ' ' + m.hp + '/' + m.maxHp + ' fled=' + !!m.fled; }) : null,
      inStart: inStart };
    if (inStart) endsDuringStart.push(rec);
    log.push(rec);
    return origEnd.apply(this, arguments);
  };
  const counters = { inStartStrike: 0, inStartMove: 0, inStartDamage: 0, inStartBegin: 0 };
  function wrapCount(fnName, key) {
    if (typeof Game[fnName] !== 'function') return;
    const orig = Game[fnName];
    Game[fnName] = function () {
      if (inStart) counters[key]++;
      return orig.apply(this, arguments);
    };
  }
  wrapCount('tbPlayerStrike', 'inStartStrike');
  wrapCount('tbPlayerMove', 'inStartMove');
  wrapCount('tbDamage', 'inStartDamage');
  wrapCount('tbBeginTurn', 'inStartBegin');
  let result = null;
  await quietLog(async function () { result = await runDays(Game, competent, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  console.log('run days ' + result.days + ' end ' + result.endReason);
  console.log('in-startCombat counters: ' + JSON.stringify(counters));
  console.log('--- startCombat calls where before==after (no new fight) ---');
  for (const e of log) {
    if (e.kind === 'startCombat' && e.before === e.after) console.log(JSON.stringify(e));
  }
  console.log('--- tbEnd calls with inStart=true ---');
  for (const e of log) {
    if (e.kind === 'tbEnd' && e.inStart) console.log(JSON.stringify(e));
  }
  console.log('--- tbEnd calls day 74-80 ---');
  for (const e of log) {
    if (e.kind === 'tbEnd' && e.day >= 74 && e.day <= 80) console.log(JSON.stringify(e));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });
