#!/usr/bin/env node
// sense-mealbank-b.js — sense-test slice for the pack-banking discipline
// (arm sim-mealbank-b, run fleshout-loop-b-20261020T1630Z).
//
// Finds the hungriest armed config from the pilot per-seed JSONs, re-runs
// it armed with say-capture, and dumps meal/refusal/hunger beats for a
// human read (SENSE-TESTING LAW: meaning, coherence, relevance — never just
// counts).
//
// Usage: node scripts/sense-mealbank-b.js [perseed-dir]
// Writes: evidence/2026-10-20/sense-mealbank-b.txt
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
// KILL PROTOCOL: the mealbank layer was deleted after the pilot killed the
// arm (NO-GO). Degrade gracefully; the pre-kill sense slice is in
// evidence/2026-10-20/sense-mealbank-b.txt.
let layer = null;
try { layer = require('./policies/mealbank-b'); } catch (e) {
  if (e && e.code === 'MODULE_NOT_FOUND') {
    console.log('INFO-SKIP: mealbank layer deleted per kill protocol (NO-GO at pilot) — see evidence/2026-10-20/sim-mealbank-b.md');
    process.exit(0);
  }
  throw e;
}
const { leadmealbank, belongmealbank } = layer;

const DIR = process.argv[2] || 'evidence/2026-10-20/perseed-mealbank-b';
const OUT = 'evidence/2026-10-20/sense-mealbank-b.txt';

(async () => {
  // hungriest armed config
  let worst = null;
  for (const f of ['armed-lead.json', 'armed-belong.json']) {
    const j = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
    for (const r of (j.rows || [])) {
      if (!worst || r.end.hungryDays > worst.end.hungryDays) worst = { ...r, file: f };
    }
  }
  if (!worst) throw new Error('no armed rows in ' + DIR);
  const policyId = worst.file.includes('belong') ? 'belongmealbank' : 'leadmealbank';
  const policy = policyId === 'belongmealbank' ? belongmealbank : leadmealbank;
  console.log(`sense target: ${policyId} s${worst.seed} hungryDays=${worst.end.hungryDays} refused=${(worst.end.mealbank || {}).refused || 0}`);

  process.env.MEALBANK = '1';
  const { Game } = await loadGame({ seed: worst.seed, mode: 'mealbank-b-sense' });
  await setupGame(Game);
  const lines = [];
  const os = Game.say.bind(Game);
  Game.say = function (m) { lines.push('d' + ((Game.state.scholar || {}).day || 0) + ': ' + String(m)); return os(m); };
  await quietLog(() => runDays(Game, policy, { days: Math.min(90, worst.end.days) }));
  delete process.env.MEALBANK;

  const re = /🎒|Half ration|Hunger gnaws|STARVING|starving|nothing edible|Nothing edible|pantry is in the hall|Too heavy|Village meal|meal:|ate |Ate /i;
  const interesting = lines.filter(l => re.test(l));
  const out = [
    `SENSE SLICE: ${policyId} s${worst.seed} (hungriest armed: hungryDays=${worst.end.hungryDays}, refused=${(worst.end.mealbank || {}).refused || 0}, voicedDays=${(worst.end.mealbank || {}).voicedDays || 0})`,
    `total say lines: ${lines.length} | flagged: ${interesting.length}`,
    '',
    ...interesting.slice(0, 80),
  ].join('\n');
  fs.writeFileSync(OUT, out);
  console.log('wrote ' + OUT);
})().catch(e => { console.error('FATAL', e); process.exit(2); });
