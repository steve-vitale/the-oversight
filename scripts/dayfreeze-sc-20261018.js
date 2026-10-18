#!/usr/bin/env node
// dayfreeze-sc-20261018.js — trace the turn sequence inside the specific
// startCombat that strands the turn: wrap tbAdvance to log every loop
// iteration's exit reason.
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
  const policy = Object.assign({}, base, { id: base.id + '-sc', desc: base.desc + ' [SC]' });
  const { Game } = await loadGame({ seed: SEED, mode: 'winloss', fullTelemetry: false });
  await setupGame(Game);

  // Instrument tbAdvance's loop by wrapping the turn functions AND tbEndCheck
  // with a global sequence, but ONLY dump when startCombat leaves a non-player turn.
  const seq = [];
  let n = 0;
  const cur = () => { try { const c = Game.tbCurrent(); return c ? c.kind + ':' + (c.name || '').slice(0, 16) : 'null'; } catch (e) { return '?'; } };
  const fr = () => { const f = Game.tbfight; return f ? ('r' + f.round + ' i' + f.turnIdx) : 'nofight'; };
  for (const fn of ['tbMonsterTurn', 'tbVillagerTurn', 'tbBeginTurn']) {
    const orig = Game[fn].bind(Game);
    Game[fn] = function (...a) {
      seq.push([n++, fn + '-in', cur(), fr()]); if (seq.length > 200) seq.shift();
      const r = orig.apply(this, a);
      seq.push([n++, fn + '-out', cur(), fr()]); if (seq.length > 200) seq.shift();
      return r;
    };
  }
  const oEndCheck = Game.tbEndCheck.bind(Game);
  Game.tbEndCheck = function (...a) {
    const r = oEndCheck.apply(this, a);
    seq.push([n++, 'tbEndCheck=' + r, cur(), fr()]); if (seq.length > 200) seq.shift();
    return r;
  };

  const oStart = Game.startCombat.bind(Game);
  Game.startCombat = function (...a) {
    const r = oStart.apply(this, a);
    try {
      const f = Game.tbfight;
      if (f && !f.over) {
        const c = Game.tbCurrent();
        if (!c || c.kind !== 'player') {
          const out = seq.map(e => e.join(' | ')).join('\n');
          require('fs').writeFileSync('/tmp/dayfreeze-sc.log', out);
          const stk = String(new Error().stack || '').split('\n').slice(2, 12).join(' <- ');
          process.stderr.write('SC STRAND at startCombat: mid=' + a[0] + ' turn=' + (c ? c.kind : 'null') + ' idx=' + f.turnIdx + '\nSTACK: ' + stk + '\n');
        }
      }
    } catch (e) {}
    return r;
  };

  const oSetup = policy.setup;
  policy.setup = (G, ctx) => (oSetup ? oSetup(G, ctx) : undefined);

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  console.log(`DONE: gameDays=${result.gameDays}`);
})().catch(e => { console.error('SC CRASH:', e); process.exit(2); });
