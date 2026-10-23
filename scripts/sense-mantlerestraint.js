#!/usr/bin/env node
// sense-mantlerestraint.js — SENSE-TESTING LAW replay for the
// sim-mantlerestraint arm: replays a sweep seed with live narration and
// prints the succession beats around every mantleRestraintTrace entry,
// plus the trace itself. The restraint must read as people protecting
// people, never a silent override. Judge meaning, coherence, relevance —
// never just counts.
//
// Usage: node scripts/sense-mantlerestraint.js [seed] [policy]
//   default seed 65517, policy belong (the re-stage's richest trace seed).
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');
process.env.FEASTSCALE_R13 = '1'; process.env.TRIBFLOOR = '1';
process.env.WINPURSUIT = '1'; process.env.WINDEFER = '1';
process.env.SEATDRIVE = '0'; process.env.KILLDISC = '1';
process.env.ARMORYDRIVE = '1'; process.env.MANTLERESTRAINT = '1';

const seed = parseInt(process.argv[2] || '65517', 10);
const policyName = process.argv[3] || 'belong';

(async () => {
  const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
  const VS = require(path.join(REPO, 'scripts', 'policies', 'vetrestage'));
  const { Game } = await loadGame({ seed, mode: 'mantlerestraint-sense', fullTelemetry: false });
  await setupGame(Game);
  const lines = [];
  const origSay = Game.say.bind(Game);
  Game.say = (t) => { try { lines.push(`d${Game.state.scholar.day} ${String(t).slice(0, 280)}`); } catch (e) {} return origSay(t); };
  const policy = VS.substrateFor(policyName === 'belong' ? 'belongfeast' : 'leadfeast');
  await quietLog(async () => { await runDays(Game, policy, { days: 180, manifest: undefined, sampleEvery: 30 }); });

  const trace = (Game.state.mantleRestraintTrace || []);
  console.log(`=== sense-mantlerestraint seed=${seed} policy=${policyName} traceEntries=${trace.length} ===`);
  const nameOf = id => { try { return (((Game.data || {}).villagers || []).find(x => x.id === id) || {}).name || id; } catch (e) { return id; } };
  for (const t of trace) {
    console.log(`-- trace d${t.d}: skipped=[${(t.skipped || []).map(nameOf).join(', ')}] picked=${nameOf(t.picked)} fallback=${!!t.fallback} outcomeChanged=${!!t.outcomeChanged}`);
  }
  // print succession beats: any say-line mentioning the skipped/picked
  // names, the mantle, the Codex transfer, or the restraint voice.
  // Focus on the trace window (trace days ±5d); the early game is noise.
  const traceDays = new Set(trace.map(t => t.d | 0));
  const inWin = l => { const m = /^d(\d+)/.exec(l); return m && traceDays.size && [...traceDays].some(td => Math.abs((+m[1]) - td) <= 5); };
  const keep = /(mantle|Codex|hands back first|hold it for each other|scholar|dead —|pick up)/i;
  console.log('\n=== succession-adjacent beats (trace window ±5d) ===');
  let shown = 0;
  for (const l of lines) {
    if (inWin(l) && keep.test(l)) { console.log(l); if (++shown > 80) break; }
  }
  console.log(`\n(lines total=${lines.length}, shown=${shown})`);
})().catch(e => { console.error('SENSE FAILED:', (e && e.stack) || e); process.exit(1); });
