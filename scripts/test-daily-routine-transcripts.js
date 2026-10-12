#!/usr/bin/env node
// test-daily-routine-transcripts.js — SENSE-TESTING for lever 3 r5 (2026-10-12).
//
// Captures ACTUAL villager daily-routine narration lines over short runs and
// categorizes them so a human can judge the whole daily-routine picture:
//   - TEACH_CHORE   the villager->villager teach chore line (villager-objectives.js)
///  - TEACH_REVIEW  "going over their finds" fallback (no lesson landed)
///  - REST / EAT / CHORE(fire/repair/cook/sweep) / VISIT indoor lines
//   - DEPART        departure narration (agency + objectives)
//   - RETURN        return narration (water/traps/forage/explore/expedition)
// Prints deduped templates + counts per category, plus the distinct teach
// line ENDINGS (the "— ..." clause), which is where template variety shows.
//
// Usage: SEEDS="3,7,21" DAYS=60 node scripts/test-daily-routine-transcripts.js
'use strict';
const fs = require('fs');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SEEDS || '3,7,21').split(',').map(Number);
const DAYS = parseInt(process.env.DAYS || '60', 10);
const OUT = process.env.OUT || '/tmp/routine-transcripts-raw.json';

// category matchers: [name, regex]
const CATS = [
  ['TEACH_CHORE', /📖.*(is showing|is walking|shows).*—/],
  ['TEACH_CHORE_ANY', /📖 .* (is showing|is walking) /],
  ['TEACH_REVIEW', /going over their finds/],
  ['REST', /😴/],
  ['EAT', /🍲/],
  ['CHORE_FIRE', /tending the fire/],
  ['CHORE_REPAIR', /mending something by the door/],
  ['CHORE_COOK', /working the cookpot/],
  ['CHORE_SWEEP', /sweeping the hall/],
  ['VISIT', /sitting with .* talking low/],
  ['DEPART', /🎒|sets out|heads out|leaving.*(with|pack)/],
  ['RETURN', /returns with|is back from/],
];

function categorize(msg) {
  for (const [name, re] of CATS) if (re.test(msg)) return name;
  return 'OTHER';
}

(async () => {
  const allLines = [];
  for (const seed of SEEDS) {
    const { Game } = await loadGame({ seed, mode: 'competent', fullTelemetry: false });
    await setupGame(Game);
    const lines = [];
    Game.say = function (msg) {
      let day = 0, part = '?';
      try { day = Game.state.scholar.day; part = Game.dayPart; } catch (e) {}
      lines.push({ seed, day, part, msg: String(msg).slice(0, 320) });
    };
    const policy = Object.assign({}, competent);
    await runDays(Game, policy, { days: DAYS, sampleEvery: 999 });
    for (const l of lines) allLines.push(l);
    console.log(`seed=${seed}: ${lines.length} narration lines`);
  }

  // counts per category
  const byCat = {};
  const teachLines = [];
  for (const l of allLines) {
    const cat = categorize(l.msg);
    byCat[cat] = (byCat[cat] || 0) + 1;
    if (cat === 'TEACH_CHORE' || cat === 'TEACH_CHORE_ANY') teachLines.push(l);
  }
  console.log('\n=== lines by category ===');
  for (const [k, v] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`);

  // teach-chore template endings: split on em-dash, count the "— clause"
  const endings = {};
  for (const l of teachLines) {
    const parts = l.msg.split('—');
    const end = parts.length > 1 ? parts.slice(1).join('—').trim() : '(no em-dash)';
    endings[end] = (endings[end] || 0) + 1;
  }
  console.log(`\n=== teach-chore line endings (${teachLines.length} lines) ===`);
  for (const [e, c] of Object.entries(endings).sort((a, b) => b[1] - a[1])) console.log(`  [x${c}] — ${e}`);

  // sample raw teach lines (first 12) to judge the voice with descriptors
  console.log('\n=== sample teach-chore lines ===');
  for (const l of teachLines.slice(0, 12)) console.log(`  [d${l.day} p${l.part} s${l.seed}] ${l.msg}`);

  // indoor-life frequency: routine lines per day
  const routineCats = ['TEACH_CHORE', 'TEACH_CHORE_ANY', 'TEACH_REVIEW', 'REST', 'EAT', 'CHORE_FIRE', 'CHORE_REPAIR', 'CHORE_COOK', 'CHORE_SWEEP', 'VISIT'];
  const routine = allLines.filter(l => routineCats.indexOf(categorize(l.msg)) !== -1);
  const daysSim = SEEDS.length * DAYS;
  console.log(`\nroutine lines/day across runs: ${(routine.length / daysSim).toFixed(2)} (${routine.length}/${daysSim})`);

  fs.writeFileSync(OUT, JSON.stringify(allLines, null, 1));
  console.log('raw dump: ' + OUT);
})();
