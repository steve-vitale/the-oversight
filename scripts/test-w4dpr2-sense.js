#!/usr/bin/env node
// scripts/test-w4dpr2-sense.js — sim-w4dpr2 sense reading.
// DIAGNOSIS ONLY: pure reads of the sim corpus. Prints, verbatim,
// the corpus's LONGEST wave-4 field fight (judgedA, fought) —
// every log line from volley to break — plus the analyzer's
// parse + break classification of that fight, so the evidence
// file's sense verdict quotes a real trace, not a summary.
// If no fought wave-4 fight exists, prints SENSE-EMPTY and
// exits 1 (the sense bar cannot be met from an empty corpus).
// Usage: node scripts/test-w4dpr2-sense.js
// When required as a module, main() does NOT run.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const { parseFightLog, classifyBreak } = require('./w4dpr2-lib');
const SEEDS16 = [];
for (let s = 75101; s <= 75116; s++) SEEDS16.push(s);

function main() {
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-10-29', 'perseed-w4dpr2');
  let best = null;
  for (const seed of SEEDS16) {
    const row = JSON.parse(fs.readFileSync(path.join(evidDir, `s${seed}-fresh.json`), 'utf8'));
    const fp = row.fieldparty.meetings || [], dp = row.w4dpr.meetings || [];
    const n = Math.min(fp.length, dp.length);
    for (let i = 0; i < n; i++) {
      const a = fp[i], b = dp[i];
      if (a.mid !== b.mid || a.vid !== b.vid || a.day !== b.day) continue;
      if (!((a.wave | 0) === 4 && a.channel === 'field' && ['resolve', 'patrol', 'aid'].indexOf(a.caller) >= 0 && !(a.leader && a.leader.isScholar))) continue;
      if ((b.rounds | 0) < 1) continue;
      if (!best || b.rounds > best.dp.rounds || (b.rounds === best.dp.rounds && b.mDealt > best.dp.mDealt)) best = { seed, fp: a, dp: b };
    }
  }
  if (!best) { console.log('SENSE-EMPTY'); process.exit(1); }
  const f = best.dp, parsed = parseFightLog(f), br = classifyBreak(f);
  console.log(`SENSE-TRACE seed=${best.seed} day=${f.day} mid=${f.mid} vid=${f.vid} outcome=${f.outcome} break=${br.reason} rounds=${f.rounds} mHpStart=${f.mHpStart} mHpLeft=${f.mHpLeft} mDealt=${f.mDealt} vTaken=${f.vTaken} allyDealt=${f.allyDealt} allyTaken=${f.allyTaken}`);
  console.log(`SENSE-PARSE dealtDelta=${parsed.dealtDelta} takenDelta=${parsed.takenDelta} allyDelta=${parsed.allyDelta} volley=${parsed.volleyDealt} perRound=${JSON.stringify(parsed.per)}`);
  console.log('--- VERBATIM TRACE (engine rec.log, unedited) ---');
  for (const line of (f.log || [])) console.log(line);
  console.log('--- END TRACE ---');
  console.log('SENSE-OK');
}
if (require.main === module) main();
module.exports = { main };
