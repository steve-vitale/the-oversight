#!/usr/bin/env node
// wave4-beat-probe-20261013.js — endgame leg blank: does the wave-4 unlock
// beat fire (and read sensibly) when Standing — not kills — crosses the bar?
// Run: leadcourt seed 33 (t4day=57 in the standing sweep, died d101 — 44d of
// wave-4 content). Capture every say/sysSay/journalNote line d50-70 and read
// them in full (SENSE-TESTING LAW).
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVIDIR = path.join(ROOT, 'evidence', '2026-10-13');
if (!fs.existsSync(EVIDIR)) fs.mkdirSync(EVIDIR, { recursive: true });
const SEED = parseInt(process.env.SEED || '33', 10);
const DAY = parseInt(process.env.DAY || '70', 10);
const PID = process.env.POLICY || 'leadcourt';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
const POLICY_REGISTRY = { leadcourt };
const day = (G) => { try { return (G.state.scholar || {}).day || 0; } catch (e) { return 0; }; };

async function main() {
  const base = POLICY_REGISTRY[PID];
  if (!base) throw new Error('unknown policy: ' + PID);
  const { Game } = await loadGame({ seed: SEED, mode: 'wave4-beat-probe-' + PID });
  await setupGame(Game);
  const lines = [];
  for (const fn of ['say', 'sysSay', 'journalNote']) {
    const orig = Game[fn];
    if (typeof orig !== 'function') { lines.push(`(${fn}: not a function)`); continue; }
    Game[fn] = function (...a) {
      let r;
      try { r = orig.apply(this, a); } catch (e) { throw e; }
      try {
        const txt = a.map(x => (typeof x === 'string' ? x : JSON.stringify(x))).join(' | ');
        if (day(Game) >= 40) lines.push(`[d${day(Game)}] ${fn}: ${txt}`);
      } catch (e) {}
      return r;
    };
  }
  // sample the unlock + standing daily
  const policy = Object.assign({}, base);
  const origDaily = base.daily;
  const trace = [];
  policy.daily = (G, ctx) => {
    const d = day(G);
    if (d >= 40 && d % 1 === 0) {
      let w = '?', st = '?';
      try { w = G.unlockedWave(); } catch (e) {}
      try { st = G.villageStandingTotal(); } catch (e) {}
      trace.push(`[d${d}] unlockedWave=${w} standing=${st}`);
    }
    if (origDaily) { try { return origDaily(G, ctx); } catch (e) {} }
  };
  await runDays(Game, policy, { days: DAY, sampleEvery: 10 });
  const fp = path.join(EVIDIR, `journey-endgame-r9-beatprobe-${PID}-s${SEED}.txt`);
  const head = [
    `=== wave-4 beat probe: policy=${PID} seed=${SEED} ===`,
    `end day=${day(Game)}`,
    '',
    '--- standing/wave trace (d40+) ---',
    ...trace,
    '',
    '--- say/sysSay/journalNote lines (d40+) ---',
    ...lines,
  ].join('\n');
  fs.writeFileSync(fp, head);
  console.log('wrote ' + fp + ' (' + lines.length + ' lines, ' + trace.length + ' trace rows)');
  // quick summary of wave-4-adjacent lines
  const hits = lines.filter(l => /wave 4|mirror draft|MIRROR DRAFT|STANDING|standing|wave-4/i.test(l));
  console.log('--- wave-4/standing-adjacent lines: ' + hits.length + ' ---');
  for (const h of hits.slice(0, 20)) console.log(h.slice(0, 300));
  process.exit(0);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
