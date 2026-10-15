#!/usr/bin/env node
// scripts/sense-tribshield-20261015.js — sense-testing helper (not a proof).
// Captures tribute/succession/renegotiation beats from two runs for human
// reading (SENSE-TESTING LAW): does the tribute discipline read as people
// managing obligations, or as a bot moving numbers?
//   1. belongfeast s77 ARMED (shield fired 5 verbs, national 49d)
//   2. leadfeast s22 CONTROL (succession-chain loss, shield absent)
// Usage: FEASTSCALE_R13=1 node scripts/sense-tribshield-20261015.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/tribshield');

const RE = /tribute|renegotiat|grief|grain|succession|treaties|realm came apart|arrears|leverage|speaker/i;

async function capture(seed, pid, armed, days) {
  if (armed) process.env.TRIBSHIELD = '1'; else delete process.env.TRIBSHIELD;
  const pol = pid === 'leadfeast' ? leadfeast : belongfeast;
  const { Game } = await loadGame({ seed, mode: `sense-${pid}-${armed ? 'armed' : 'control'}` });
  await setupGame(Game);
  const lines = [];
  const dayOf = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const push = (text) => {
    try {
      const s = String((text && (text.text || text.msg || text.message)) || text || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');
      if (RE.test(s)) lines.push(`[d${dayOf()}] ${s.slice(0, 320)}`);
    } catch (e) {}
  };
  const ogSay = Game.say.bind(Game);
  const ogSys = Game.sysSay ? Game.sysSay.bind(Game) : null;
  Game.say = function (t) { push(t); return ogSay(t); };
  if (ogSys) Game.sysSay = function (t) { push(t); return ogSys(t); };
  const p = Object.assign({}, pol);
  const result = await runDays(Game, p, { days });
  delete process.env.TRIBSHIELD;
  return { lines, days: result.days, endReason: result.endReason };
}

(async () => {
  const a = await capture(77, 'belongfeast', true, 180);
  fs.writeFileSync('evidence/2026-10-15/sense-tribshield-belo77-armed.txt',
    `belongfeast s77 ARMED — ${a.days}d, ${a.endReason}\n` + a.lines.join('\n'));
  console.log(`armed: ${a.lines.length} tribute/succession lines, ${a.days}d`);
  const b = await capture(22, 'leadfeast', false, 180);
  fs.writeFileSync('evidence/2026-10-15/sense-tribshield-lead22-control.txt',
    `leadfeast s22 CONTROL — ${b.days}d, ${b.endReason}\n` + b.lines.join('\n'));
  console.log(`control: ${b.lines.length} tribute/succession lines, ${b.days}d`);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
