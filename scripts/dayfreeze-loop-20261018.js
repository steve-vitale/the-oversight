#!/usr/bin/env node
// dayfreeze-loop-20261018.js — replace tbAdvance with a logging copy to see
// every iteration during startCombat.
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
  const policy = Object.assign({}, base, { id: base.id + '-loop', desc: base.desc + ' [LOOP]' });
  const { Game } = await loadGame({ seed: SEED, mode: 'winloss', fullTelemetry: false });
  await setupGame(Game);

  let inSC = false;
  const loopLog = [];
  Game.tbAdvance = function () {
    const f = this.tbfight;
    if (!f || f.over) { if (inSC) loopLog.push('exit:nofight'); return; }
    let guard = 0;
    while (guard++ < 60) {
      if (!this.tbfight || this.tbfight !== f || f.over) {
        if (inSC) loopLog.push(`exit:changed g=${guard}`); return;
      }
      f.turnIdx++;
      if (f.turnIdx >= f.order.length) {
        f.turnIdx = 0; f.round++;
        try { this.tbRoundWrap(f); } catch (e) {}
        if (inSC) loopLog.push(`wrap: r=${f.round}`);
      }
      const c = this.tbFighter(f.order[f.turnIdx]);
      if (!c || !c.alive || c.fled) { if (inSC) loopLog.push(`skip: idx=${f.turnIdx}`); continue; }
      if (c.kind === 'player') {
        if (inSC) loopLog.push(`player: idx=${f.turnIdx} -> tbBeginTurn`);
        this.tbBeginTurn();
        if (inSC) loopLog.push(`after-begin: idx=${f.turnIdx} cur=${(this.tbCurrent() || {}).kind}`);
        return;
      }
      if (inSC) loopLog.push(`ai: idx=${f.turnIdx} kind=${c.kind}`);
      if (c.kind === 'villager' || c.kind === 'ally') { try { this.tbVillagerTurn(c); } catch (e) {} }
      else { try { this.tbMonsterTurn(c); } catch (e) {} }
      const e = this.tbEndCheck();
      if (inSC) loopLog.push(`endcheck: idx=${f.turnIdx} => ${e}`);
      if (e) return;
    }
    if (inSC) loopLog.push('exit:guard60');
  };

  const oStart = Game.startCombat.bind(Game);
  Game.startCombat = function (...a) {
    inSC = true; loopLog.length = 0;
    const r = oStart.apply(this, a);
    inSC = false;
    try {
      const f = Game.tbfight;
      if (f && !f.over) {
        const c = Game.tbCurrent();
        if (!c || c.kind !== 'player') {
          process.stderr.write(`LOOP-STRAND: mid=${a[0]} idx=${f.turnIdx} turn=${c ? c.kind : 'null'}\n`);
          process.stderr.write(loopLog.join('\n') + '\n---\n');
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
})().catch(e => { console.error('LOOP CRASH:', e); process.exit(2); });
