#!/usr/bin/env node
// dayfreeze-diag-20261018.js — focused exception/loop-day diagnostic for the
// two frozen seeds. Wraps doAction('wait') + sleep with exception capture and
// a per-call loop-day heartbeat, to find where the loop-day's verbs go after
// the day freezes.
'use strict';
const SW = require('./winloss-sweep-20261018');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const ENV_REQ = ['SEATDRIVE', 'VETREL', 'REPOSITION', 'NODEWITNESS', 'FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY'];
for (const k of ENV_REQ) if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';

const SEED = parseInt(process.env.SEED || '59104', 10);
const POLICY = process.env.ONLY || 'belongfeast';
const DAYS = 180;

(async () => {
  const base = SW.policyFor(POLICY);
  const policy = Object.assign({}, base, { id: base.id + '-diag', desc: base.desc + ' [DIAG]' });
  const { Game } = await loadGame({ seed: SEED, mode: 'winloss', fullTelemetry: false });
  await setupGame(Game);

  const errors = [];
  let nWaits = 0, nSleeps = 0, nSleepThrows = 0, nWaitThrows = 0;
  const heartbeat = []; // per wait/sleep: [seq, kind, dayBefore, dayAfter, err]
  let seq = 0;

  const oSetup = policy.setup;
  policy.setup = (G, ctx) => {
    const r = oSetup ? oSetup(G, ctx) : undefined;
    const s0 = G.sleep.bind(G);
    G.sleep = function (...a) {
      const dayBefore = ((G.state.scholar || {}).day | 0);
      const tbf = G.tbfight;
      const zf = tbf ? { over: !!tbf.over, kind: tbf.kind || null,
        fighters: (tbf.fighters || []).map(f => ({ kind: f.kind, name: f.name || f.id, hp: Math.round(f.hp || 0), alive: !!f.alive, fled: !!f.fled })),
        turn: (function () { try { const c = G.tbCurrent ? G.tbCurrent() : null; return c ? (c.kind + ':' + (c.name || c.id)) : null; } catch (e) { return 'err'; } })(),
        round: tbf.round | 0, playerTurn: !!(function () { try { const c = G.tbCurrent ? G.tbCurrent() : null; return c && c.kind === 'player'; } catch (e) { return false; } })(),
      } : null;
      nSleeps++;
      let dayAfter = null, err = null;
      try { s0.apply(this, a); } catch (e) { err = String(e && e.message || e).slice(0, 120); nSleepThrows++; }
      dayAfter = ((G.state.scholar || {}).day | 0);
      heartbeat.push([seq++, 'sleep', dayBefore, dayAfter, err, zf]);
      // no cap: persist everything for cadence analysis
    };
    return r;
  };
  // wrap doAction AFTER harness wraps it (harness wraps in runDays; wrap the property lazily via setup too — setup runs before runDays' wrap, so chain: wrap now, harness will wrap ours)
  const odo = Game.doAction.bind(Game);
  Game.doAction = function (kind, ...rest) {
    if (kind === 'wait') {
      const dayBefore = ((Game.state.scholar || {}).day | 0);
      const zf = Game.tbfight ? { over: !!Game.tbfight.over, kind: Game.tbfight.kind || null } : null;
      nWaits++;
      let err = null, ret;
      try { ret = odo.call(this, kind, ...rest); } catch (e) { err = String(e && e.message || e).slice(0, 120); nWaitThrows++; }
      const dayAfter = ((Game.state.scholar || {}).day | 0);
      heartbeat.push([seq++, 'wait', dayBefore, dayAfter, err, zf]);
      // no cap: persist everything for cadence analysis
      if (err) return ret;
      return ret;
    }
    return odo.call(this, kind, ...rest);
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  console.log(`DONE: loopDays(result.days)=${result.days} gameDays=${result.gameDays} over=${Game.over} won=${Game.won}`);
  console.log(`nWaits=${nWaits} nSleeps=${nSleeps} nWaitThrows=${nWaitThrows} nSleepThrows=${nSleepThrows}`);
  const errs = heartbeat.filter(h => h[4]);
  console.log('heartbeat errors:', errs.length);
  for (const h of errs.slice(0, 10)) console.log('  ERR', JSON.stringify(h));
  console.log('--- last 15 heartbeat rows (after the freeze) ---');
  for (const h of heartbeat.slice(-15)) console.log('  ', JSON.stringify(h));
  const s = Game.state.scholar || {};
  console.log('final: day=' + (s.day|0) + ' part=' + (Game.dayPart|0) + ' dayTicks=' + Math.round(s.dayTicks||0) +
    ' hp=' + Math.round(s.health||0) + ' kcal=' + Math.round(s.kcal||0) + ' hyd=' + Math.round(s.hydration||0));
  // per-loop-day game-day cadence: group heartbeat into loop-days (4 rows each: 3 waits + sleep)
  const fs = require('fs');
  const byLoop = [];
  for (let k = 0; k < DAYS; k++) {
    const rows = heartbeat.slice(k * 4, k * 4 + 4);
    const sleeps = rows.filter(r => r[1] === 'sleep');
    const zfs = [...new Map(rows.map(r => [JSON.stringify(r[5] || null), r[5] || null])).values()];
    byLoop.push({ loop: k + 1, dayBefore: rows[0] ? rows[0][2] : null, dayAfter: sleeps.length ? sleeps[sleeps.length - 1][3] : null,
      zf: zfs,
      kinds: rows.map(r => r[1] + ':' + r[2] + '->' + r[3]).join(' ') });
  }
  fs.writeFileSync('/tmp/diag-cadence-' + POLICY + '-' + SEED + '.json', JSON.stringify(byLoop));
  // find the longest stretch of loop-days with no day advance
  let best = { start: 0, len: 0 }, cur = { start: 0, len: 0 }, prevDay = null;
  byLoop.forEach((L, i) => {
    const d = L.dayAfter;
    if (prevDay !== null && d === prevDay) { if (!cur.len) cur.start = L.loop; cur.len++; }
    else { if (cur.len > best.len) best = Object.assign({}, cur); cur = { start: 0, len: 0 }; }
    prevDay = d;
  });
  if (cur.len > best.len) best = Object.assign({}, cur);
  console.log('longest no-advance stretch:', JSON.stringify(best));
  // day advances per 10 loop-days
  const per10 = [];
  for (let k = 0; k < DAYS; k += 10) {
    const a = byLoop[k].dayBefore, b = byLoop[Math.min(k + 9, DAYS - 1)].dayAfter;
    per10.push((b - a) + '/10');
  }
  console.log('advances per 10 loop-days:', per10.join(' '));
})().catch(e => { console.error('DIAG CRASH:', e); process.exit(2); });
