#!/usr/bin/env node
// dayfreeze-mut-20261018.js — detect turnIdx/fight mutation during monster/
// villager turns: the two ways tbAdvance can strand at a non-player turn.
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
  const policy = Object.assign({}, base, { id: base.id + '-mut', desc: base.desc + ' [MUT]' });
  const { Game } = await loadGame({ seed: SEED, mode: 'winloss', fullTelemetry: false });
  await setupGame(Game);

  const muts = [];
  for (const fn of ['tbMonsterTurn', 'tbVillagerTurn']) {
    const orig = Game[fn].bind(Game);
    Game[fn] = function (m, ...a) {
      const f = Game.tbfight;
      const before = f ? { id: f.id, idx: f.turnIdx, round: f.round } : null;
      const r = orig.call(this, m, ...a);
      const f2 = Game.tbfight;
      const after = f2 ? { id: f2.id, idx: f2.turnIdx, round: f2.round } : null;
      if (before && after && (before.id !== after.id || before.idx !== after.idx)) {
        muts.push({ fn, monster: m.name || m.key, before, after,
          endCheck: (function () { try { return Game.tbEndCheck(); } catch (e) { return 'err'; } })() });
        if (muts.length <= 5) process.stderr.write('MUT: ' + JSON.stringify(muts[muts.length - 1]) + '\n');
      }
      return r;
    };
  }
  // also trap: tbAdvance exiting with current turn not player and fight live
  const oAdvance = Game.tbAdvance.bind(Game);
  Game.tbAdvance = function (...a) {
    const r = oAdvance.apply(this, a);
    const f = Game.tbfight;
    if (f && !f.over) {
      const c = Game.tbCurrent();
      if (!c || c.kind !== 'player') {
        const rec = { ev: 'advance-exit-nonplayer', round: f.round, idx: f.turnIdx,
          cur: c ? c.kind + ':' + (c.name || '').slice(0, 20) : 'null' };
        muts.push(rec);
        if (muts.length <= 8) process.stderr.write('STRAND: ' + JSON.stringify(rec) + '\n');
      }
    }
    return r;
  };

  const oSetup = policy.setup;
  policy.setup = (G, ctx) => (oSetup ? oSetup(G, ctx) : undefined);

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  console.log(`DONE: gameDays=${result.gameDays} muts=${muts.length}`);
  const strands = muts.filter(m => m.ev === 'advance-exit-nonplayer');
  console.log('strand events:', strands.length);
  for (const s of strands.slice(0, 5)) console.log(JSON.stringify(s));
})().catch(e => { console.error('MUT CRASH:', e); process.exit(2); });
