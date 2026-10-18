#!/usr/bin/env node
// sense-cookbulk-v2.js — capture cook-day transcripts for v2 layer.
// Usage: FEASTSCALE_R13=1 SEATDRIVE=0 COOKBULK=1 node scripts/sense-cookbulk-v2.js <seed> <policy>
'use strict';
const { belongfeast, leadfeast } = require('./policies/feastscale');
const CB = require('./policies/cookbulk-b');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

(async () => {
  const seed = parseInt(process.argv[2], 10);
  const pid = process.argv[3] || 'leadfeast';
  if (!seed) { console.error('usage: node sense-cookbulk-v2.js <seed> <policy>'); process.exit(2); }
  const base = pid === 'leadfeast' ? leadfeast : belongfeast;
  const pol = CB.withCookBulk(base, pid + '+cookbulk', 'sense-v2');
  const { Game } = await loadGame({ seed, mode: 'leanwinter', fullTelemetry: false });
  await setupGame(Game);
  const beats = [];
  const oSay = Game.say.bind(Game);
  Game.say = (m) => { beats.push({ day: (Game.state.scholar || {}).day, msg: String(m) }); return oSay(m); };
  const ctx = {};
  let captured = [];
  const wrapped = Object.assign({}, pol);
  const oDaily = pol.daily, oUpkeep = pol.upkeep;
  wrapped.upkeep = (G, c) => { const r = oUpkeep(G, c); Object.assign(ctx, c); return r; };
  wrapped.daily = (G, c) => {
    const before = c._cbCookDays || 0;
    const r = oDaily(G, c);
    const after = c._cbCookDays || 0;
    if (after > before && captured.length < 2) {
      const day = (G.state.scholar || {}).day;
      captured.push({ day, beats: beats.filter(b => b.day === day).map(b => b.msg) });
    }
    Object.assign(ctx, c);
    return r;
  };
  await quietLog(async () => { await runDays(Game, wrapped, { days: 180, sampleEvery: 60 }); });
  Game.say = oSay;
  console.log(`Captured ${captured.length} cook-day transcripts (seed ${seed} ${pid}, total cookDays=${ctx._cbCookDays||0})`);
  for (const [i, cap] of captured.entries()) {
    console.log(`\n===== TRANSCRIPT ${i+1} (day ${cap.day}) =====`);
    // print only cook-relevant beats (filter noise)
    const relevant = cap.beats.filter(m => /cook|bean|rice|fire|water|pantry/i.test(m));
    for (const m of relevant.slice(0, 30)) console.log(`[d${cap.day}] ${m}`);
    if (relevant.length > 30) console.log(`... (${relevant.length - 30} more)`);
    console.log('===== END =====');
  }
  const fs = require('fs'), path = require('path');
  const out = path.join(__dirname, '..', 'evidence', '2026-10-18', `sense-cookbulk-v2-s${seed}-${pid}.txt`);
  fs.writeFileSync(out, captured.map((cap, i) =>
    `===== TRANSCRIPT ${i+1} (day ${cap.day}, seed ${seed} ${pid}) =====\n` +
    cap.beats.filter(m => /cook|bean|rice|fire|water|pantry/i.test(m)).join('\n')
  ).join('\n\n') + '\n');
  console.log('wrote', out);
})().catch(e => { console.error('SENSE FAILED', e); process.exit(1); });
