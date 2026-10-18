#!/usr/bin/env node
// dayfreeze-seq-20261018.js — sequence-trace the ACTUAL stall: log every
// turn-function entry/exit and tbEndCheck result with sequence numbers, so we
// can see exactly how tbAdvance exits at the monster's turn.
'use strict';
const SW = require('./winloss-sweep-20261018');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const ENV_REQ = ['SEATDRIVE', 'VETREL', 'REPOSITION', 'NODEWITNESS', 'FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY'];
for (const k of ENV_REQ) if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';

const SEED = parseInt(process.env.SEED || '59104', 10);
const POLICY = process.env.ONLY || 'belongfeast';

(async () => {
  const base = SW.policyFor(POLICY);
  const policy = Object.assign({}, base, { id: base.id + '-seq', desc: base.desc + ' [SEQ]' });
  const { Game } = await loadGame({ seed: SEED, mode: 'winloss', fullTelemetry: false });
  await setupGame(Game);

  const seq = [];
  let n = 0; const tracing = true;
  const cur = () => { try { const c = Game.tbCurrent(); return c ? c.kind + ':' + (c.name || '').slice(0, 18) : 'null'; } catch (e) { return '?'; } };
  const fr = () => { const f = Game.tbfight; return f ? ('r' + f.round + ' i' + f.turnIdx + ' over=' + !!f.over) : 'nofight'; };
  for (const fn of ['tbMonsterTurn', 'tbVillagerTurn', 'tbBeginTurn', 'tbPlayerStrike', 'tbAfterPlayerAction']) {
    const orig = Game[fn].bind(Game);
    Game[fn] = function (...a) {
      seq.push([n++, fn + '-in', cur(), fr()]); if (seq.length > 400) seq.shift();
      const r = orig.apply(this, a);
      seq.push([n++, fn + '-out', cur(), fr()]); if (seq.length > 400) seq.shift();
      return r;
    };
  }
  const oEndCheck = Game.tbEndCheck.bind(Game);
  Game.tbEndCheck = function (...a) {
    const r = oEndCheck.apply(this, a);
    seq.push([n++, 'tbEndCheck=' + r, cur(), fr()]); if (seq.length > 400) seq.shift();
    return r;
  };
  const oAdvance = Game.tbAdvance.bind(Game);
  Game.tbAdvance = function (...a) {
    seq.push([n++, 'tbAdvance-in', cur(), fr()]); if (seq.length > 400) seq.shift();
    const r = oAdvance.apply(this, a);
    seq.push([n++, 'tbAdvance-out', cur(), fr()]); if (seq.length > 400) seq.shift();
    return r;
  };

  const oSetup = policy.setup;
  let lastDay = null, frozenCount = 0, dumped = false;
  policy.setup = (G, ctx) => {
    const r = oSetup ? oSetup(G, ctx) : undefined;
    const s0 = G.sleep.bind(G);
    G.sleep = function (...a) {
      const dayBefore = ((G.state.scholar || {}).day | 0);
      // rolling trace always on
      const ret = s0.apply(this, a);
      const dayAfter = ((G.state.scholar || {}).day | 0);
      if (dayAfter === dayBefore && G.tbfight && !G.tbfight.over && !G.tbIsPlayerTurn()) {
        frozenCount++;
        if (frozenCount >= 4 && !dumped) {
          dumped = true;
          const out = seq.slice(-60).map(e => e.join(' | ')).join('\n');
          require('fs').writeFileSync('/tmp/dayfreeze-seq.log', out);
          process.stderr.write('SEQ DUMPED: ' + seq.length + ' events, last 60 to /tmp/dayfreeze-seq.log\n');
        }
      } else { frozenCount = 0; }
      return ret;
    };
    return r;
  };

  let result;
  const _df = require('./sim-harness').driveFights;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  console.log(`DONE: gameDays=${result.gameDays} dumped=${dumped}`);
})().catch(e => { console.error('SEQ CRASH:', e); process.exit(2); });
