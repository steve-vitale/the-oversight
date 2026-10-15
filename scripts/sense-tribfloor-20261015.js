#!/usr/bin/env node
// sense-tribfloor: extract tribute-relevant transcript lines for two runs,
// for SENSE-TESTING LAW read-through.
'use strict';
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const TF = require('./policies/tribfloor');
const fs = require('fs');

async function transcript(seed, pid, armed) {
  if (armed) process.env.TRIBFLOOR = '1'; else delete process.env.TRIBFLOOR;
  const { Game } = await loadGame({ seed, mode: `tribfloor-sense-${pid}-${armed ? 'armed' : 'control'}` });
  await setupGame(Game);
  const lines = [];
  const gday = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const RE = /tribute|arrear|🛡️|refus|demand|leverage|grief is|pantry holds about|starv|hunger/i;
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try {
      const s = String((msg && (msg.text || msg.msg || msg.message)) || msg || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 240);
      if (RE.test(s)) lines.push(`d${gday()} ${s}`);
    } catch (e) {}
    return origSay(msg);
  };
  const base = pid === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => { if (origDaily) { try { origDaily(G, ctx); } catch (e) {} } };
  const result = await runDays(Game, policy, { days: 180, sampleEvery: 10 });
  delete process.env.TRIBFLOOR;
  return { days: result.days, endReason: result.endReason, lines };
}

(async () => {
  const a = await transcript(66, 'belongfeast', false);
  fs.writeFileSync('evidence/2026-10-15/sense-tribfloor-belo66-control.txt',
    `# belongfeast s66 CONTROL — ${a.days}d, ${a.endReason}\n` + a.lines.join('\n') + '\n');
  console.log(`control: ${a.lines.length} tribute lines, ${a.days}d`);
  const b = await transcript(66, 'belongfeast', true);
  fs.writeFileSync('evidence/2026-10-15/sense-tribfloor-belo66-armed.txt',
    `# belongfeast s66 ARMED — ${b.days}d, ${b.endReason}\n` + b.lines.join('\n') + '\n');
  console.log(`armed: ${b.lines.length} tribute lines, ${b.days}d`);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
