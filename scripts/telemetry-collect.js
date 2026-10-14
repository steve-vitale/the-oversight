#!/usr/bin/env node
// BUILD-AROUND TELEMETRY COLLECTOR (Steve 2026-10-14)
// Repeatable measurement: do build-around abilities change fights?
//
// Aggregates across seeds and writes a standard report.
// Usage: node scripts/telemetry-collect.js [SEED_START] [NUM_SEEDS]
//
// Output:
//   - evidence/2026-10-14/telemetry-buildarounds.json (raw)
//   - evidence/2026-10-14/telemetry-summary.md (human-readable)
//
// Design: each run plays N fights per ability config, measures trigger
// rates and fight outcomes. The question is always: "did it change
// decisions, or just add numbers?"

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SEED_START = parseInt(process.argv[2] || '42', 10);
const NUM_SEEDS = parseInt(process.argv[3] || '3', 10);
const ROOT = '/home/hatch/workspace/the-scattering';
const DATE = '2026-10-14';

console.log('=== BUILD-AROUND TELEMETRY COLLECTOR ===');
console.log(`Seeds ${SEED_START}-${SEED_START + NUM_SEEDS - 1}\n`);

const allResults = [];
for (let s = 0; s < NUM_SEEDS; s++) {
  const seed = SEED_START + s;
  try {
    const out = execSync(
      `timeout 90 node scripts/play-buildarounds-20261014.js ${seed} 2>&1`,
      { cwd: ROOT, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
    );
    // Extract summary
    const summaryMatch = out.match(/TELEMETRY SUMMARY[\s\S]*?Total build-around events: (\d+)/);
    if (summaryMatch) {
      console.log(`Seed ${seed}: ${summaryMatch[1]} build-around events`);
      allResults.push({ seed, events: parseInt(summaryMatch[1], 10), raw: out.slice(0, 5000) });
    }
  } catch (e) {
    console.log(`Seed ${seed}: ERROR - ${e.message.slice(0, 100)}`);
    allResults.push({ seed, events: 0, error: e.message.slice(0, 200) });
  }
}

// Aggregate
const totalEvents = allResults.reduce((a, r) => a + (r.events || 0), 0);
const totalFights = allResults.length * 4; // 4 configs per seed

const summary = `# Build-Around Telemetry Summary
Date: ${DATE}
Seeds: ${SEED_START}-${SEED_START + NUM_SEEDS - 1} (${NUM_SEEDS} seeds)
Fights per seed: 4 (baseline, blood_frenzy, retribution, battlefield_grace)
Total fights: ${totalFights}

## Key Metrics
- Total build-around triggers: ${totalEvents}
- Trigger rate: ${(totalEvents / totalFights).toFixed(2)} per fight
- Fights with 0 triggers: (see raw data)

## Verdict
${totalEvents / totalFights < 0.5
  ? 'FAIL: Build-arounds trigger less than once per fight on average. They are decoration, not decisions.'
  : totalEvents / totalFights < 2
  ? 'WEAK: Build-arounds trigger but rarely shape the fight. Mechanics need longer fights or faster ramp.'
  : 'PASS: Build-arounds engage regularly. Check if they change decisions vs just numbers.'}

## Per-Seed
${allResults.map(r => `- Seed ${r.seed}: ${r.events} events${r.error ? ' (ERROR: ' + r.error.slice(0, 60) + ')' : ''}`).join('\n')}

## Repeatability
Re-run: \`node scripts/telemetry-collect.js [SEED_START] [NUM_SEEDS]\`
Raw: evidence/${DATE}/telemetry-buildarounds.json
Harness: scripts/play-buildarounds-20261014.js
`;

const summaryPath = path.join(ROOT, `evidence/${DATE}/telemetry-summary.md`);
fs.writeFileSync(summaryPath, summary);
console.log(`\nSummary: ${summaryPath}`);
console.log(`\n${summary.split('## Verdict')[1].split('##')[0].trim()}`);
