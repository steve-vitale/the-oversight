#!/usr/bin/env node
// dayfreeze-ta-20261018.js — reimplement tbAdvance with per-iteration logging
// to find the exact exit that strands the turn at a non-player.
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
  const policy = Object.assign({}, base, { id: base.id + '-ta', desc: base.desc + ' [TA]' });
  const { Game } = await loadGame({ seed: SEED, mode: 'winloss', fullTelemetry: false });
  await setupGame(Game);

  const taLog = [];
  let inStartCombat = false;

  // Replace tbAdvance with an instrumented copy of the exact production logic.
  Game.tbAdvance = function () {
    const f = this.tbfight;
    if (!f || f.over) { if (inStartCombat) taLog.push('exit: no-fight-or-over'); return; }
    let guard = 0;
    while (guard++ < 60) {
      if (!this.tbfight || this.tbfight !== f || f.over) {
        if (inStartCombat) taLog.push(`exit: fight-changed guard=${guard} tbfight=${this.tbfight ? this.tbfight.id : 'null'} f=${f.id} over=${f.over}`);
        return;
      }
      f.turnIdx += 1;
      if (f.turnIdx >= f.order.length) {
        if (this.tbRoundWrap) { try { this.tbRoundWrap(); } catch (e) {} }
        f.round = (f.round || 1) + 1;
        f.turnIdx = 0;
      }
      const c = this.tbCurrent();
      if (!c || !c.alive) { if (inStartCombat) taLog.push(`iter: skip dead/null idx=${f.turnIdx}`); continue; }
      if (c.kind === 'player') {
        if (inStartCombat) taLog.push(`exit: reached-player idx=${f.turnIdx}`);
        this.tbBeginTurn();
        return;
      }
      const e1 = this.tbEndCheck();
      if (e1) { if (inStartCombat) taLog.push(`exit: tbEndCheck-true(1) idx=${f.turnIdx} kind=${c.kind} fightOver=${f.over}`); return; }
      try { if (c.kind === 'villager') this.tbVillagerTurn(c); else this.tbMonsterTurn(c); }
      catch (e) { if (inStartCombat) taLog.push(`iter: turn-threw idx=${f.turnIdx} err=${String(e && e.message).slice(0, 60)}`); }
      const e2 = this.tbEndCheck();
      if (e2) { if (inStartCombat) taLog.push(`exit: tbEndCheck-true(2) idx=${f.turnIdx} kind=${c.kind} fightOver=${f.over}`); return; }
      if (inStartCombat) taLog.push(`iter: done idx=${f.turnIdx} kind=${c.kind}`);
    }
    if (inStartCombat) taLog.push('exit: guard-60');
  };

  const oStart = Game.startCombat.bind(Game);
  Game.startCombat = function (...a) {
    inStartCombat = true; taLog.length = 0;
    const r = oStart.apply(this, a);
    inStartCombat = false;
    try {
      const f = Game.tbfight;
      if (f && !f.over) {
        const c = Game.tbCurrent();
        if (!c || c.kind !== 'player') {
          const out = ['mid=' + a[0], 'turn=' + (c ? c.kind : 'null') + ' idx=' + f.turnIdx, '---', ...taLog].join('\n');
          require('fs').writeFileSync('/tmp/dayfreeze-ta.log', out);
          process.stderr.write('TA STRAND: mid=' + a[0] + ' turn=' + (c ? c.kind : 'null') + ' idx=' + f.turnIdx + '\n');
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
})().catch(e => { console.error('TA CRASH:', e); process.exit(2); });
