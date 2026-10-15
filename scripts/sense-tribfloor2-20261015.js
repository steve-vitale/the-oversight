#!/usr/bin/env node
// sense-tribfloor2: re-extract s66 armed for the integrity diff against the
// committed transcript, plus s11/s22 belongfeast pairs for the sense sample.
// Same instruments as sense-tribfloor-20261015.js (deterministic replay).
'use strict';
process.env.FEASTSCALE_R13 = '1';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const TF = require('./policies/tribfloor');
const fs = require('fs');

async function transcript(seed, pid, armed) {
  if (armed) process.env.TRIBFLOOR = '1'; else delete process.env.TRIBFLOOR;
  const { Game } = await loadGame({ seed, mode: `tribfloor2-sense-${pid}-${seed}-${armed ? 'a' : 'c'}` });
  await setupGame(Game);
  const lines = [];
  const gday = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const RE = /tribute|arrear|🛡️|refus|demand|leverage|grief is|grief became|pantry holds about|starv|hunger/i;
  const origSay = Game.say.bind(Game);
  Game.say = function (msg) {
    try {
      const s = String((msg && (msg.text || msg.msg || msg.message)) || msg || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 240);
      if (RE.test(s)) lines.push(`d${gday()} ${s}`);
    } catch (e) {}
    return origSay(msg);
  };
  const base = TF.belongfeast;
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  policy.daily = (G, ctx) => { if (origDaily) { try { origDaily(G, ctx); } catch (e) {} } };
  const result = await runDays(Game, policy, { days: 180, sampleEvery: 10 });
  delete process.env.TRIBFLOOR;
  return { days: result.days, endReason: result.endReason, lines };
}

(async () => {
  // integrity: re-extract s66 armed, diff vs committed
  const b66 = await transcript(66, 'belongfeast', true);
  const committed = fs.readFileSync('evidence/2026-10-15/sense-tribfloor-belo66-armed.txt', 'utf8');
  const fresh = `# belongfeast s66 ARMED — ${b66.days}d, ${b66.endReason}\n` + b66.lines.join('\n') + '\n';
  fs.writeFileSync('/tmp/s66-armed-fresh.txt', fresh);
  console.log(`s66 armed re-extract: ${b66.lines.length} lines, ${b66.days}d, ${b66.endReason}`);
  console.log(`committed lines: ${committed.split('\n').length}, identical: ${fresh === committed}`);

  for (const seed of [11, 22]) {
    for (const armed of [false, true]) {
      const r = await transcript(seed, 'belongfeast', armed);
      const tag = `belo${seed}-${armed ? 'armed' : 'control'}`;
      fs.writeFileSync(`evidence/2026-10-15/sense-tribfloor-${tag}.txt`,
        `# belongfeast s${seed} ${armed ? 'ARMED' : 'CONTROL'} — ${r.days}d, ${r.endReason}\n` + r.lines.join('\n') + '\n');
      console.log(`${tag}: ${r.lines.length} tribute lines, ${r.days}d, ${r.endReason}`);
    }
  }
})().catch(e => { console.error('FATAL', e); process.exit(2); });
