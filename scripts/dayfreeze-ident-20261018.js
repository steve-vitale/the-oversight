#!/usr/bin/env node
// dayfreeze-ident-20261018.js — resolve the tbexit contradiction: log the
// lookup chain (order key, fighters keys/kinds, found fighter identity) at
// the tbAdvance exit AND the startCombat exit for the same fight.
'use strict';
const SW = require('./winloss-sweep-20261018');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const ENV_REQ = ['SEATDRIVE', 'VETREL', 'REPOSITION', 'NODEWITNESS', 'FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY'];
for (const k of ENV_REQ) if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';

const SEED = parseInt(process.env.SEED || '59104', 10);
const POLICY = process.env.ONLY || 'belongfeast';

function snap(Game, label) {
  const f = Game.tbfight;
  if (!f) return `${label}: nofight`;
  const key = f.order ? f.order[f.turnIdx] : undefined;
  const found = key !== undefined ? f.fighters.find(x => x.key === key) : undefined;
  const cur = Game.tbCurrent();
  return `${label}: fight=${f.id} turnIdx=${f.turnIdx} orderKey=${key} ` +
    `fighters=[${f.fighters.map(x => x.key + ':' + x.kind).join(',')}] ` +
    `found=${found ? found.key + ':' + found.kind : String(found)} ` +
    `tbCurrent=${cur ? cur.key + ':' + cur.kind : String(cur)} ` +
    `isPlayerTurn=${Game.tbIsPlayerTurn()}`;
}

(async () => {
  const base = SW.policyFor(POLICY);
  const policy = Object.assign({}, base, { id: base.id + '-ident', desc: base.desc + ' [IDENT]' });
  const { Game } = await loadGame({ seed: SEED, mode: 'winloss', fullTelemetry: false });
  await setupGame(Game);

  const oAdv = Game.tbAdvance.bind(Game);
  Game.tbAdvance = function () {
    let pre = '';
    try { pre = snap(Game, 'tbAdvance-entry'); } catch (e) {}
    const r = oAdv.apply(this, arguments);
    try {
      const s = snap(Game, 'tbAdvance-exit');
      if (/buffering|fmgpspipz/.test(s) || /buffering|fmgpspipz/.test(pre) || process.env.IDENT_ALL === '1') {
        process.stderr.write(pre + '\n' + s + '\n');
      }
      Game.__lastAdvSnap = s;
      Game.__lastAdvPre = pre;
    } catch (e) {}
    return r;
  };

  const oStart = Game.startCombat.bind(Game);
  Game.startCombat = function (...a) {
    const r = oStart.apply(this, a);
    try {
      const s = snap(Game, 'startCombat-exit mid=' + a[0]);
      const adv = Game.__lastAdvSnap || '';
      const advPre = Game.__lastAdvPre || '';
      // report when they disagree on the player turn, or always for buffering
      const disagree = (/isPlayerTurn=true/.test(adv) && /isPlayerTurn=false/.test(s)) ||
        (/isPlayerTurn=false/.test(adv) && /isPlayerTurn=true/.test(s));
      if (disagree || a[0] === 'buffering') {
        process.stderr.write('=== IDENT ' + (disagree ? 'DISAGREE' : 'buffering') + ' ===\n' + advPre + '\n' + adv + '\n' + s + '\n=== END ===\n');
        if (disagree) process.exit(0);
      }
    } catch (e) {}
    return r;
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });
  console.log(`DONE: gameDays=${result.gameDays}`);
})().catch(e => { console.error('IDENT CRASH:', e); process.exit(2); });
