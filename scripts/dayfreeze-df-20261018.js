#!/usr/bin/env node
// dayfreeze-df-20261018.js — trace driveFights' decisions: wrap the composed
// policy's fight hook to log invocations, and log tbPlayerStrike outcomes.
'use strict';
const SW = require('./winloss-sweep-20261018');
const { loadGame, setupGame, runDays, quietLog, driveFights } = require('./sim-harness');

const ENV_REQ = ['SEATDRIVE', 'VETREL', 'REPOSITION', 'NODEWITNESS', 'FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY'];
for (const k of ENV_REQ) if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';

const SEED = parseInt(process.env.SEED || '59104', 10);
const POLICY = process.env.ONLY || 'belongfeast';

(async () => {
  const base = SW.policyFor(POLICY);
  const policy = Object.assign({}, base, { id: base.id + '-df', desc: base.desc + ' [DF]' });
  const { Game } = await loadGame({ seed: SEED, mode: 'winloss', fullTelemetry: false });
  await setupGame(Game);

  const dfLog = [];
  const oFight = policy.fight ? policy.fight.bind(policy) : null;
  if (oFight) {
    policy.fight = function (G, ctx) {
      const r = oFight(G, ctx);
      const f = G.tbfight;
      dfLog.push({ ev: 'policy.fight', ret: !!r, turn: (function () { try { const c = G.tbCurrent(); return c ? c.kind : null; } catch (e) { return '?'; } })(),
        round: f ? f.round : null, idx: f ? f.turnIdx : null });
      if (dfLog.length > 200) dfLog.shift();
      return r;
    };
  }
  const oStrike = Game.tbPlayerStrike.bind(Game);
  Game.tbPlayerStrike = function (...a) {
    const r = oStrike.apply(this, a);
    const f = Game.tbfight;
    dfLog.push({ ev: 'tbPlayerStrike', ret: r, turn: (function () { try { const c = Game.tbCurrent(); return c ? c.kind : null; } catch (e) { return '?'; } })(),
      round: f ? f.round : null, idx: f ? f.turnIdx : null,
      pActed: (function () { try { return !!Game.tbFighter('p').acted; } catch (e) { return '?'; } })(),
      pMove: (function () { try { return Game.tbFighter('p').moveLeft; } catch (e) { return '?'; } })() });
    if (dfLog.length > 200) dfLog.shift();
    return r;
  };

  const oSetup = policy.setup;
  let dumped = false, frozenCount = 0;
  policy.setup = (G, ctx) => {
    const r = oSetup ? oSetup(G, ctx) : undefined;
    const s0 = G.sleep.bind(G);
    G.sleep = function (...a) {
      const dayBefore = ((G.state.scholar || {}).day | 0);
      const ret = s0.apply(this, a);
      const dayAfter = ((G.state.scholar || {}).day | 0);
      if (dayAfter === dayBefore && G.tbfight && !G.tbfight.over) {
        frozenCount++;
        if (frozenCount >= 4 && !dumped) {
          dumped = true;
          try {
            const f = G.tbfight;
            const dump = { id: f.id, round: f.round, turnIdx: f.turnIdx, over: f.over, result: f.result,
              asyncRunning: !!f.asyncRunning, asyncGen: f.asyncGen,
              order: f.order,
              fighters: f.fighters.map(x => ({ key: x.key, kind: x.kind, name: (x.name||'').slice(0,20), hp: Math.round(x.hp||0), alive: !!x.alive, fled: !!x.fled, acted: !!x.acted, moveLeft: x.moveLeft })) };
            require('fs').writeFileSync('/tmp/dayfreeze-fight.json', JSON.stringify(dump, null, 1));
          } catch (e) {}
          require('fs').writeFileSync('/tmp/dayfreeze-df.log', dfLog.map(e => JSON.stringify(e)).join('\n'));
          process.stderr.write('DF DUMPED: ' + dfLog.length + ' events to /tmp/dayfreeze-df.log\n');
        }
      } else frozenCount = 0;
      return ret;
    };
    return r;
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  console.log(`DONE: gameDays=${result.gameDays} dumped=${dumped}`);
})().catch(e => { console.error('DF CRASH:', e); process.exit(2); });
